const fs = require('fs');
const { PDFParse } = require('pdf-parse');

function cleanText(t) {
  return t
    .replace(/\r/g, '')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/BỘ PHIẾU HỌC TẬP[\s\S]*?(?:Trang \d+|ĐIỂM SỐ)/gi, '')
    .replace(/Bộ Phiếu Học Tập[\s\S]*?(?:Trang \d+|ĐIỂM SỐ)/gi, '')
    .replace(/Trang \d+/g, '')
    .trim();
}

function parsePeriodContent(grade, periodNum, pRaw) {
  const p = cleanText(pRaw);

  // 1. Lesson Title & Subtitle
  let lessonTitle = `Tiết ${periodNum}`;
  const titleMatch = p.match(/(?:TIẾT\s*\d+[:\s]*)(BÀI\s*\d+[^(\n]+)(?:\(([^)]+)\))?/i);
  if (titleMatch) {
    lessonTitle = titleMatch[1].trim() + (titleMatch[2] ? ` (${titleMatch[2].trim()})` : '');
  }

  // 2. YCCD & Competencies
  let yccd = '';
  const yccdMatch = p.match(/Yêu cầu cần đạt[:\s]*([^.\n]+(?:\.[^.\n]+)?)/i);
  if (yccdMatch) yccd = yccdMatch[1].trim();

  // 3. Section A: Khám phá kiến thức
  let secA = '';
  const secAMatch = p.match(/(?:KHÁM PHÁ KIẾN THỨC|PHẦN A[\s\S]*?KHÁM PHÁ)([\s\S]*?)(?:PHẦN B|B[.]\s*LUYỆN TẬP|■\s*PHẦN B)/i);
  if (secAMatch) {
    secA = secAMatch[1];
  } else {
    secA = p;
  }

  // 4. Drag & Drop (Câu 1 / I)
  let wordBank = [];
  const wbMatch = secA.match(/(?:HỘP TỪ GỢI Ý|📌\s*HỘP TỪ GỢI Ý)[:\s]*\[?([^\]\n]+)\]?/i);
  if (wbMatch) {
    wordBank = wbMatch[1]
      .split(/[|;,]/)
      .map((w) => w.trim().replace(/^\[|\]$/g, ''))
      .filter((w) => w.length > 0 && !w.includes('HỘP TỪ'));
  }

  // 5. Fill in the Blank (Câu 2 / II)
  let fbText = '';
  const fbMatch = secA.match(/(?:II[.]\s*Câu hỏi Điền khuyết|2[.]\s*Dạng Điền khuyết|Câu 2\s*\[Dạng Điền khuyết[^\]]*\]|Câu 2\s*\(Dạng Điền khuyết[^\)]*\))([\s\S]*?)(?:III[.]|3[.]|Câu 3|CỘT A)/i);
  if (fbMatch) {
    fbText = fbMatch[1];
  }

  const fbLines = fbText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('Hoàn thành') && !l.startsWith('Đọc kỹ') && !l.startsWith('(....)'));

  // Parse fill-in-the-blank items
  const fillBlankItems = [];
  let currentLabel = 'a)';
  let currentPre = '';
  let currentPost = '';
  let currentAns = '';

  const rawStatements = [];
  let buffer = '';

  for (const line of fbLines) {
    const isNew = /^(?:[a-d]\)|[1-4]\.|\•\s*[1-4]\.|\-\s*[a-d]\))/i.test(line);
    if (isNew) {
      if (buffer) rawStatements.push(buffer);
      buffer = line;
    } else {
      buffer += ' ' + line;
    }
  }
  if (buffer) rawStatements.push(buffer);

  rawStatements.forEach((stmt, idx) => {
    const labelMatch = stmt.match(/^(?:([a-d]\))|([1-4]\.)|\•\s*([1-4]\.)|\-\s*([a-d]\)))/i);
    const label = labelMatch ? (labelMatch[1] || labelMatch[2] || labelMatch[3] || labelMatch[4] || `${idx + 1}.`) : `${idx + 1}.`;
    const cleanStmt = stmt.replace(/^(?:[a-d]\)|[1-4]\.|\•\s*[1-4]\.|\-\s*[a-d]\))\s*/i, '').trim();

    // Look for blank markers: ......., ________, [...........]
    let preText = cleanStmt;
    let postText = '';
    let answer = '';

    const blankMatch = cleanStmt.match(/(.*?)(?:\[\.{3,}\]|\.{3,}|_{3,}|\[_{3,}\])(.*)/);
    if (blankMatch) {
      preText = blankMatch[1].trim();
      postText = blankMatch[2].trim();
      // try to infer answer if embedded like [ bán dẫn ]
    }

    fillBlankItems.push({
      id: `k${grade}-p${periodNum}-fb-${idx + 1}`,
      label,
      preText: preText || `Mệnh đề ${idx + 1} của bài học`,
      postText: postText || '.',
      correctAnswer: answer || 'chính xác',
      accepted: [answer.toLowerCase(), answer, 'đúng'],
      points: idx === 0 ? 0.35 : 0.35,
    });
  });

  // 6. Matching (Câu 3 / III)
  let matchText = '';
  const matchMatch = secA.match(/(?:III[.]\s*Câu hỏi Nối cột|3[.]\s*Dạng Nối cột|Câu 3\s*\[Dạng Nối cột[^\]]*\]|Câu 3\s*\(Dạng Ghép nối[^\)]*\))([\s\S]*?)(?:IV[.]|4[.]|Câu 4|Dạng Trả lời ngắn)/i);
  if (matchMatch) {
    matchText = matchMatch[1];
  }

  // 7. Short Answer (Câu 4 / IV)
  let saPrompt = '';
  const saMatch = secA.match(/(?:IV[.]\s*Câu hỏi Trả lời ngắn|4[.]\s*Dạng Câu hỏi Trả lời ngắn|Câu 4\s*\[Dạng Trả lời ngắn[^\]]*\]|Câu 4\s*\(Dạng Trả lời ngắn[^\)]*\))([\s\S]*?)(?:Bài làm|Trả lời|PHẦN B|B[.]\s*LUYỆN TẬP|■|$)/i);
  if (saMatch) {
    saPrompt = saMatch[1]
      .replace(/^[:\s\-\(\)Tình huống suy luận thực tếPhân tích tình huống]+/, '')
      .replace(/Bài làm[\s\S]*/, '')
      .replace(/Trả lời[\s\S]*/, '')
      .replace(/\.{5,}/g, '')
      .trim();
  }

  return {
    grade,
    periodNum,
    lessonTitle,
    yccd,
    wordBank,
    fillBlankItems,
    saPrompt,
    secA: secA.slice(0, 500)
  };
}

async function run() {
  const files = [
    { grade: 6, path: 'public/assets/aistudio/phieu_hoc_tap_29_tiet_tin_6_4336fc0d.pdf' },
    { grade: 7, path: 'public/assets/aistudio/phieu_hoc_tap_29_tiet_tin_7_0336da7c.pdf' },
    { grade: 8, path: 'public/assets/aistudio/phieu_hoc_tap_29_tiet_tin_8_ec4b0a61.pdf' },
    { grade: 9, path: 'public/assets/aistudio/phieu_hoc_tap_29_tiet_tin_9_1e6aa14d.pdf' }
  ];

  const fullData = {};

  for (const item of files) {
    const buf = fs.readFileSync(item.path);
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load();
    const text = (await parser.getText()).text;
    const regex = /PHIẾU HỌC TẬP(?:\s+TIN HỌC \d+)?\s*[-–—:]*\s*TIẾT\s*(\d+)[:\s]/gi;
    const matches = [...text.matchAll(regex)];

    fullData[item.grade] = [];

    for (let i = 0; i < matches.length; i++) {
      const pNum = parseInt(matches[i][1], 10);
      const start = matches[i].index;
      const end = (i < matches.length - 1) ? matches[i + 1].index : text.length;
      const pText = text.slice(start, end);
      const parsed = parsePeriodContent(item.grade, pNum, pText);
      fullData[item.grade].push(parsed);
    }
    console.log(`Grade ${item.grade} parsed: ${fullData[item.grade].length} periods`);
  }

  fs.writeFileSync('src/data/rawPdfExtractedPeriods.json', JSON.stringify(fullData, null, 2));
  console.log('Saved to src/data/rawPdfExtractedPeriods.json');
}

run();
