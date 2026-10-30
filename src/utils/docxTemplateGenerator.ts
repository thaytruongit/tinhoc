import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import {
  getPeriodsForGrade,
  type CustomLessonWorksheet,
  type CurriculumPeriodSpec,
} from '../data/mockCurriculumData';
import { generateAuthenticWorksheetForGradeAndPeriod } from '../data/curriculumAllGradesOcrData';

/**
 * Generates the plain-text representation of all 29 periods for a given grade
 * matching the exact structure expected by the .docx parser.
 */
export function build29PeriodsRawTextTemplate(grade: 6 | 7 | 8 | 9): string {
  const specs = getPeriodsForGrade(grade);
  const blocks: string[] = [
    `BỘ TÀI LIỆU MẪU CHUẨN NẠP DỮ LIỆU 29 TIẾT HỌC MÔN TIN HỌC KHỐI ${grade}`,
    `Chương trình GDPT 2018 (SGK Kết nối tri thức với cuộc sống) • Tích hợp Năng lực số CV 3456 & Khung AI 3439`,
    `Hướng dẫn: Giữ nguyên tiêu đề "TIẾT 1" đến "TIẾT 29" và 4 mục "HOẠT ĐỘNG 1: KHỞI ĐỘNG", "HOẠT ĐỘNG 2: KHÁM PHÁ", "HOẠT ĐỘNG 3: LUYỆN TẬP", "HOẠT ĐỘNG 4: VẬN DỤNG" để hệ thống tự động kiểm tra đủ 29/29 tiết và nạp vào Cơ sở dữ liệu Supabase / PostgreSQL.`,
    `================================================================================`,
  ];

  for (let pNum = 1; pNum <= 29; pNum++) {
    const spec: CurriculumPeriodSpec | undefined = specs.find((s) => s.period === pNum);
    const ws = generateAuthenticWorksheetForGradeAndPeriod(grade, pNum);
    const lessonTitle = spec?.lessonTitle || ws.worksheetTitle;
    const yccd = spec?.yccd || 'Đạt chuẩn Yêu cầu cần đạt Chương trình Tin học GDPT 2018.';
    const nls = spec?.digitalCompetency || 'NLS 1.1: Khai thác dữ liệu và thông tin số.';
    const nlAi = spec?.aiCompetency || 'NL-AI 1: Nhận thức và ứng dụng Trí tuệ nhân tạo có trách nhiệm.';

    const fbList = (ws.stage2.fillBlankQuestions || [])
      .map(
        (fb) =>
          `   ${fb.label} ${fb.preText} [${fb.correctAnswer}] ${fb.postText} (${fb.points}đ)`
      )
      .join('\n');

    const matchList = (ws.stage2.matchingQuestions || [])
      .map((m) => `   ${m.leftText} <---> ${m.rightText} (${m.points}đ)`)
      .join('\n');

    const quizList = (ws.stage3QuizQuestions || [])
      .slice(0, 6)
      .map((q, idx) => {
        const opts = q.options
          .map((o) => `${o.letter}. ${o.text}${o.isCorrect ? ' [ĐÁP ÁN ĐÚNG]' : ''}`)
          .join(' | ');
        return `   Câu ${idx + 1} (${q.points ?? 0.5}đ): ${q.question}\n   Lựa chọn: ${opts}`;
      })
      .join('\n');

    const saList = (ws.stage2.shortAnswerQuestions || [])
      .map(
        (sq, idx) =>
          `   Câu hỏi ${idx + 1}: ${sq.question} | Đáp án: ${sq.sampleAnswer} (${sq.points}đ)`
      )
      .join('\n');

    blocks.push(
      [
        `TIẾT ${pNum}: ${lessonTitle.replace(/^Tiết\s*\d+\s*[:.-]?\s*/i, '')}`,
        `TÊN BÀI: ${lessonTitle}`,
        `Phân phối chương trình: Khối ${grade} • Tiết ${pNum}/29 • Loại tiết: ${
          spec?.lessonType === 'practice' ? 'Thực hành phòng máy' : 'Lý thuyết & Khám phá'
        } (${spec?.sgkPages || 'SGK Kết nối tri thức'})`,
        `Yêu cầu cần đạt (YCCĐ): ${yccd}`,
        `Tích hợp Năng lực số (CV 3456): ${nls}`,
        `Tích hợp Năng lực AI (Khung 3439): ${nlAi}`,
        ``,
        `1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (Tình huống đặt vấn đề • 1.0 điểm)`,
        `- Tình huống khởi động: ${ws.stage1?.scenario || ''}`,
        `- Câu hỏi khởi động: ${ws.stage1?.question || ''}`,
        `- Đáp án gợi ý HĐ1: ${ws.stage1?.sampleAnswer || ''}`,
        ``,
        `2. HOẠT ĐỘNG 2: KHÁM PHÁ KIẾN THỨC (Phiếu học tập 4 dạng câu hỏi = 4.0 điểm)`,
        `- Dạng 1 (Kéo thả từ khóa - 1.0đ): ${ws.stage2.dragDropParagraph || ''}`,
        `  Hộp từ khóa: ${(ws.stage2.dragDropWordBank || []).join(', ')}`,
        `- Dạng 2 (Điền khuyết mệnh đề - 1.0đ):`,
        fbList,
        `- Dạng 3 (Nối cột khái niệm - 1.0đ):`,
        matchList,
        `- Dạng 4 (Trả lời ngắn tình huống - 1.0đ): ${ws.stage2.shortAnswerPrompt || ''}`,
        saList,
        ``,
        `3. HOẠT ĐỘNG 3: LUYỆN TẬP & ĐẤU TRƯỜNG TRẮC NGHIỆM 25S (6 câu hỏi x 0.5đ = 3.0 điểm)`,
        quizList,
        ``,
        `4. HOẠT ĐỘNG 4: VẬN DỤNG THỰC TẾ & MỞ RỘNG (3 bài tập tự luận/thực hành = 3.0 điểm)`,
        `- Bài tập 1 (Phân tích sâu - 1.0đ): ${ws.stage4?.deepAnalysis?.prompt || ''}`,
        `- Bài tập 2 (Thực hành kỹ năng số - 1.0đ): ${ws.stage4?.practicalTask?.prompt || ''}`,
        `- Bài tập 3 (Vận dụng mở rộng & AI - 1.0đ): ${ws.stage4?.extendedTask?.prompt || ''}`,
        `--------------------------------------------------------------------------------`,
      ].join('\n')
    );
  }

  return blocks.join('\n\n');
}

/**
 * Builds the OpenXML Word Document object containing all 29 periods for a grade.
 */
export function create29PeriodsDocxDocument(grade: 6 | 7 | 8 | 9): Document {
  const specs = getPeriodsForGrade(grade);
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: `MẪU CHUẨN NẠP DỮ LIỆU 29 TIẾT HỌC MÔN TIN HỌC KHỐI ${grade}`,
          bold: true,
          size: 32,
          color: '1D4ED8',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Chương trình GDPT 2018 (SGK Kết nối tri thức) • Chuẩn Công văn 3456 (NLS) & Quyết định 3439 (Khung AI)`,
          bold: true,
          size: 22,
          color: '334155',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      },
      children: [
        new TextRun({
          text: `Hướng dẫn sử dụng: Tệp Word (.docx) này đã được thiết lập đầy đủ 29 tiết học (từ TIẾT 1 đến TIẾT 29) với đúng cấu trúc 4 hoạt động: Hoạt động 1 (Khởi động), Hoạt động 2 (Khám phá: Kéo thả, Điền khuyết, Nối cột, Trả lời ngắn), Hoạt động 3 (Luyện tập trắc nghiệm), Hoạt động 4 (Vận dụng thực hành & mở rộng). Giáo viên có thể chỉnh sửa nội dung câu hỏi trực tiếp trong tệp Word này rồi tải lên hệ thống để nạp tự động 29 tiết vào Database.`,
          italics: true,
          size: 20,
          color: '475569',
        }),
      ],
    }),
  ];

  for (let pNum = 1; pNum <= 29; pNum++) {
    const spec = specs.find((s) => s.period === pNum);
    const ws = generateAuthenticWorksheetForGradeAndPeriod(grade, pNum);
    const lessonTitle = spec?.lessonTitle || ws.worksheetTitle;
    const cleanLessonName = lessonTitle.replace(/^Tiết\s*\d+\s*[:.-]?\s*/i, '');
    const yccd = spec?.yccd || 'Đạt chuẩn Yêu cầu cần đạt Chương trình Tin học GDPT 2018.';
    const nls = spec?.digitalCompetency || 'NLS 1.1: Khai thác dữ liệu và thông tin số.';
    const nlAi = spec?.aiCompetency || 'NL-AI 1: Nhận thức và ứng dụng Trí tuệ nhân tạo.';

    // Period Heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 100 },
        children: [
          new TextRun({
            text: `TIẾT ${pNum}: ${cleanLessonName}`,
            bold: true,
            size: 28,
            color: '0F172A',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `TÊN BÀI: `, bold: true, size: 22 }),
          new TextRun({ text: lessonTitle, bold: true, size: 22, color: '1E40AF' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `• Yêu cầu cần đạt (YCCĐ): `, bold: true, size: 20 }),
          new TextRun({ text: yccd, size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `• Năng lực số (CV 3456): `, bold: true, size: 20 }),
          new TextRun({ text: nls, size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({ text: `• Năng lực AI (Khung 3439): `, bold: true, size: 20 }),
          new TextRun({ text: nlAi, size: 20 }),
        ],
      })
    );

    // Stage 1: Khởi động
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: `HOẠT ĐỘNG 1: KHỞI ĐỘNG (Tình huống đặt vấn đề • 1.0 điểm)`,
            bold: true,
            size: 23,
            color: '047857',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `Tình huống khởi động: `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage1?.scenario || '', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `Câu hỏi khởi động: `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage1?.question || '', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: `Đáp án gợi ý HĐ1: `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage1?.sampleAnswer || '', size: 20 }),
        ],
      })
    );

    // Stage 2: Khám phá
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: `HOẠT ĐỘNG 2: KHÁM PHÁ KIẾN THỨC (Phiếu học tập 4 dạng câu hỏi = 4.0 điểm)`,
            bold: true,
            size: 23,
            color: '1D4ED8',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `Dạng 1 - Kéo thả từ khóa (1.0 điểm): `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage2.dragDropParagraph || '', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `Hộp từ khóa: `, bold: true, size: 20 }),
          new TextRun({ text: (ws.stage2.dragDropWordBank || []).join(', '), size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `Dạng 2 - Điền khuyết mệnh đề cốt lõi (1.0 điểm):`,
            bold: true,
            size: 20,
          }),
        ],
      })
    );

    (ws.stage2.fillBlankQuestions || []).forEach((fb) => {
      children.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: `   ${fb.label} `, bold: true, size: 20 }),
            new TextRun({
              text: `${fb.preText} [${fb.correctAnswer}] ${fb.postText} (${fb.points}đ)`,
              size: 20,
            }),
          ],
        })
      );
    });

    children.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: `Dạng 3 - Nối cột khái niệm Cột A ↔ Cột B (1.0 điểm):`,
            bold: true,
            size: 20,
          }),
        ],
      })
    );

    (ws.stage2.matchingQuestions || []).forEach((m) => {
      children.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({
              text: `   ${m.leftText} <---> ${m.rightText} (${m.points}đ)`,
              size: 20,
            }),
          ],
        })
      );
    });

    children.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: `Dạng 4 - Trả lời ngắn tình huống (1.0 điểm): `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage2.shortAnswerPrompt || '', size: 20 }),
        ],
      })
    );

    (ws.stage2.shortAnswerQuestions || []).forEach((sq, idx) => {
      children.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: `   Câu hỏi ${idx + 1}: `, bold: true, size: 20 }),
            new TextRun({
              text: `${sq.question} | Đáp án: ${sq.sampleAnswer} (${sq.points}đ)`,
              size: 20,
            }),
          ],
        })
      );
    });

    // Stage 3: Luyện tập
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: `HOẠT ĐỘNG 3: LUYỆN TẬP & TRẮC NGHIỆM ĐẤU TRƯỜNG 25S (6 câu hỏi = 3.0 điểm)`,
            bold: true,
            size: 23,
            color: '7C3AED',
          }),
        ],
      })
    );

    (ws.stage3QuizQuestions || []).slice(0, 6).forEach((q, idx) => {
      const optsLine = q.options
        .map((o) => `${o.letter}. ${o.text}${o.isCorrect ? ' [ĐÚNG]' : ''}`)
        .join('  |  ');
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `Câu ${idx + 1} (${q.points ?? 0.5}đ): `,
              bold: true,
              size: 20,
            }),
            new TextRun({ text: q.question, size: 20 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 70 },
          children: [
            new TextRun({
              text: `   Phương án: ${optsLine}`,
              size: 19,
              color: '334155',
            }),
          ],
        })
      );
    });

    // Stage 4: Vận dụng
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: `HOẠT ĐỘNG 4: VẬN DỤNG THỰC TẾ & MỞ RỘNG THỰC HÀNH (3 bài tập = 3.0 điểm)`,
            bold: true,
            size: 23,
            color: 'B45309',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `Bài 1 - Tự luận phân tích sâu (1.0đ): `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage4?.deepAnalysis?.prompt || '', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `Bài 2 - Thực hành kỹ năng số (1.0đ): `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage4?.practicalTask?.prompt || '', size: 20 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 180 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
        },
        children: [
          new TextRun({ text: `Bài 3 - Mở rộng & Ứng dụng AI (1.0đ): `, bold: true, size: 20 }),
          new TextRun({ text: ws.stage4?.extendedTask?.prompt || '', size: 20 }),
        ],
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

/**
 * Generates a browser Blob for downloading the 29-period .docx template on the client.
 */
export async function generate29PeriodsDocxBlob(grade: 6 | 7 | 8 | 9): Promise<Blob> {
  const doc = create29PeriodsDocxDocument(grade);
  return await Packer.toBlob(doc);
}

/**
 * Generates a Node.js Buffer for serving the 29-period .docx template from Express.
 */
export async function generate29PeriodsDocxBuffer(grade: 6 | 7 | 8 | 9): Promise<Buffer> {
  const doc = create29PeriodsDocxDocument(grade);
  return await Packer.toBuffer(doc);
}

/**
 * Helper to clean markdown formatting (**, __, ###, etc.) from extracted lines
 */
function cleanMarkdownLine(text: string): string {
  return text
    .replace(/^[\s#*>-]+/, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .trim();
}

/**
 * Parses extracted .docx / NotebookLM / OCR / JSON text and validates all 29 periods (Tiết 1 -> Tiết 29)
 * and all 4 pedagogical stages, deeply extracting fields from both the NotebookLM Master Prompt format
 * and the standard .docx template format.
 *
 * By default, `autoCompleteTo29 = true` ensures that even if the input text or AI/OCR output
 * contains a subset of periods or slightly varied formatting, all detected custom periods are
 * preserved 100% and any remaining periods in the 29-period curriculum are automatically normalized
 * from the grade's authentic GDPT 2018 blueprint so database ingestion never fails on syntax quirks.
 */
export function parse29PeriodsFromDocxText(
  rawText: string,
  grade: 6 | 7 | 8 | 9,
  options?: { autoCompleteTo29?: boolean }
): {
  worksheets: CustomLessonWorksheet[];
  details: string[];
  directDetectedCount: number;
} {
  const autoCompleteTo29 = options?.autoCompleteTo29 ?? true;
  const details: string[] = [];

  if (!rawText || !rawText.trim()) {
    return {
      worksheets: [],
      details: ['Nội dung đầu vào trống. Vui lòng dán văn bản từ NotebookLM, tải tệp .docx hoặc quét ảnh OCR.'],
      directDetectedCount: 0,
    };
  }

  const trimmedInput = rawText.trim();

  // 1. Check if the user pasted JSON (or Markdown code-fenced JSON)
  const jsonFenceStripped = trimmedInput
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (jsonFenceStripped.startsWith('[') || jsonFenceStripped.startsWith('{')) {
    try {
      const parsedJson = JSON.parse(jsonFenceStripped);
      const list = Array.isArray(parsedJson)
        ? parsedJson
        : parsedJson.worksheets || parsedJson.lessons || parsedJson.periods || [parsedJson];
      if (Array.isArray(list) && list.length > 0) {
        const jsonMap = new Map<number, any>();
        list.forEach((item: any, idx: number) => {
          const pNum = Number(item?.period || item?.periodNumber || idx + 1);
          if (pNum >= 1 && pNum <= 29 && !jsonMap.has(pNum)) {
            jsonMap.set(pNum, item);
          }
        });
        if (jsonMap.size > 0) {
          const resultWorksheets: CustomLessonWorksheet[] = [];
          for (let pNum = 1; pNum <= 29; pNum++) {
            const baseWs = generateAuthenticWorksheetForGradeAndPeriod(grade, pNum);
            const item = jsonMap.get(pNum);
            if (!item) {
              if (autoCompleteTo29) {
                resultWorksheets.push({
                  ...baseWs,
                  ingestedAt: new Date().toLocaleTimeString('vi-VN') + ' • Chuẩn hoá tự động 29 tiết',
                });
              }
              continue;
            }
            resultWorksheets.push({
              ...baseWs,
              ...item,
              lessonKey: `k${grade}-tiet-${pNum}`,
              grade,
              period: pNum,
              worksheetTitle:
                item.worksheetTitle ||
                (item.title ? `Tiết ${pNum}: ${item.title.replace(/^Tiết\s*\d+\s*[:.-]?\s*/i, '')}` : baseWs.worksheetTitle),
              stage1: {
                ...baseWs.stage1,
                ...(item.stage1 || {}),
                title: item.stage1?.title || baseWs.stage1?.title || `Hoạt động 1: Khởi động (Tiết ${pNum})`,
                scenario: item.stage1?.scenario || baseWs.stage1?.scenario || '',
                question: item.stage1?.question || baseWs.stage1?.question || '',
                sampleAnswer: item.stage1?.sampleAnswer || baseWs.stage1?.sampleAnswer || '',
                points: 1.0,
              },
              stage2: {
                ...baseWs.stage2,
                ...(item.stage2 || {}),
              },
              stage3QuizQuestions:
                Array.isArray(item.stage3QuizQuestions) && item.stage3QuizQuestions.length > 0
                  ? item.stage3QuizQuestions
                  : Array.isArray(item.stage3?.questions) && item.stage3.questions.length > 0
                  ? item.stage3.questions.map((q: any, qIdx: number) => ({
                      id: q.id || `k${grade}-t${pNum}-q${qIdx + 1}`,
                      order: qIdx + 1,
                      question: q.question || `Câu ${qIdx + 1}`,
                      timeLimitSec: 25,
                      points: q.points ?? 0.5,
                      status: 'Đã duyệt' as const,
                      options: Array.isArray(q.options)
                        ? q.options.map((opt: any, oIdx: number) => ({
                            letter: (['A', 'B', 'C', 'D'][oIdx] || 'A') as 'A' | 'B' | 'C' | 'D',
                            text: typeof opt === 'string' ? opt : opt?.text || String(opt),
                            explanation: opt?.explanation || q.explanation || 'Chuẩn kiến thức SGK GDPT 2018.',
                            isCorrect:
                              typeof opt === 'object' && opt !== null && 'isCorrect' in opt
                                ? Boolean(opt.isCorrect)
                                : (typeof q.correctOption === 'number' ? q.correctOption : 0) === oIdx,
                          }))
                        : baseWs.stage3QuizQuestions[qIdx]?.options || [],
                    }))
                  : baseWs.stage3QuizQuestions,
              stage4: {
                ...baseWs.stage4,
                ...(item.stage4 || {}),
              },
              ingestedAt: new Date().toLocaleTimeString('vi-VN') + ' • Nạp từ dữ liệu JSON/AI',
            });
          }
          return {
            worksheets: resultWorksheets,
            details: [],
            directDetectedCount: jsonMap.size,
          };
        }
      }
    } catch {
      // Not valid JSON, continue to intelligent structured text / NotebookLM / DOCX parser
    }
  }

  // 2. Intelligent Line-by-Line Period Header Detection (avoids matching "từ Tiết 1 đến Tiết 29" in intro lines)
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const lineOffsets: number[] = [];
  let runningOffset = 0;
  for (const line of lines) {
    lineOffsets.push(runningOffset);
    runningOffset += line.length + 1;
  }

  const matches: Array<{ period: number; index: number; titleHint: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Ignore instruction lines that mention ranges like "từ Tiết 1 đến Tiết 29" or "Tiết 1 -> Tiết 29"
    if (
      /(?:từ|giữ nguyên|lặp lại)\s+["']?(?:tiết|bài)\s*1\b.*(?:đến|->|→)\s*["']?(?:tiết|bài)\s*29/i.test(
        rawLine
      )
    ) {
      continue;
    }

    // Match genuine period headers:
    // Examples:
    // "TIẾT 1: THÔNG TIN VÀ DỮ LIỆU"
    // "**TIẾT 1: THÔNG TIN VÀ DỮ LIỆU**"
    // "### TIẾT 01 - Thông tin và dữ liệu"
    // "=== TIẾT 1: ... ==="
    // "TIẾT [1]: ..."
    // "1. TIẾT 1: ..."
    const cleanLine = rawLine
      .replace(/^[#*>\-\s•=+]+/, '')
      .replace(/[*=~]+$/g, '')
      .trim();

    const headerMatch = cleanLine.match(
      /^(?:PHẦN\s+|CHỦ\s+ĐỀ\s+\d+\s*[-–:]\s*)?(?:TIẾT|Tiết|BÀI|Bài)\s*(?:HỌC\s*)?(?:SỐ\s*)?\[?0?(\d{1,2})\]?(?:\s*\/\s*29)?\s*(?:[:.\-–—]|$)\s*(.*)$/i
    );

    if (headerMatch) {
      const pNum = parseInt(headerMatch[1], 10);
      const titleRest = (headerMatch[2] || '').trim();
      // Reject if the rest of the line starts with "đến Tiết" or "-> Tiết"
      if (/^(?:đến|->|→)\s*(?:tiết|bài)/i.test(titleRest)) {
        continue;
      }
      if (pNum >= 1 && pNum <= 29) {
        const existingIdx = matches.findIndex((m) => m.period === pNum);
        if (existingIdx === -1) {
          matches.push({
            period: pNum,
            index: lineOffsets[i],
            titleHint: titleRest,
          });
        } else {
          // If an earlier match had a tiny block (< 120 chars), replace it with this real heading
          const prevMatch = matches[existingIdx];
          if (lineOffsets[i] - prevMatch.index < 160 || !prevMatch.titleHint) {
            matches[existingIdx] = {
              period: pNum,
              index: lineOffsets[i],
              titleHint: titleRest,
            };
          }
        }
      }
    }
  }

  // Also check if the user pasted a single lesson or unnumbered blocks separated by "=== BẮT ĐẦU TIẾT HỌC ==="
  if (matches.length === 0) {
    const startBlockRegex = /===\s*BẮT ĐẦU TIẾT HỌC\s*===/gi;
    let blockMatch: RegExpExecArray | null;
    let autoPeriod = 1;
    while ((blockMatch = startBlockRegex.exec(rawText)) !== null && autoPeriod <= 29) {
      matches.push({
        period: autoPeriod++,
        index: blockMatch.index,
        titleHint: '',
      });
    }
  }

  // If the text still has no explicit "TIẾT X:" headers but has content (e.g., user pasted 1 period's content directly)
  if (matches.length === 0 && trimmedInput.length > 40) {
    matches.push({
      period: 1,
      index: 0,
      titleHint: '',
    });
  }

  // Sort by document position
  matches.sort((a, b) => a.index - b.index);

  const periodMap = new Map<number, { blockText: string; titleHint: string }>();
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : rawText.length;
    const blockText = rawText.slice(current.index, nextIndex).trim();
    periodMap.set(current.period, { blockText, titleHint: current.titleHint });
  }

  const directDetectedCount = periodMap.size;
  const parsedWorksheets: CustomLessonWorksheet[] = [];

  for (let pNum = 1; pNum <= 29; pNum++) {
    const entry = periodMap.get(pNum);
    const baseWs = generateAuthenticWorksheetForGradeAndPeriod(grade, pNum);

    if (!entry) {
      if (autoCompleteTo29) {
        parsedWorksheets.push({
          ...baseWs,
          lessonKey: `k${grade}-tiet-${pNum}`,
          grade,
          period: pNum,
          ingestedAt:
            new Date().toLocaleTimeString('vi-VN') +
            ' • Tự động đồng bộ chuẩn CT GDPT 2018',
        });
      } else {
        details.push(`Thiếu Tiết ${pNum} trong dữ liệu đầu vào.`);
      }
      continue;
    }

    const { blockText, titleHint } = entry;

    // Extract custom title from "TÊN BÀI:" or heading line
    const titleMatch = blockText.match(/(?:TÊN BÀI|Tên bài|CHỦ ĐỀ)\s*:\s*([^\n]+)/i);
    let customTitle = baseWs.worksheetTitle;
    if (titleMatch && titleMatch[1].trim()) {
      const cleaned = cleanMarkdownLine(titleMatch[1]).replace(/^\[|\]$/g, '');
      customTitle = cleaned.toLowerCase().startsWith('tiết')
        ? cleaned
        : `Tiết ${pNum}: ${cleaned}`;
    } else if (titleHint && titleHint.length > 2) {
      const cleaned = cleanMarkdownLine(titleHint).replace(/^\[|\]$/g, '');
      customTitle = cleaned.toLowerCase().startsWith('tiết')
        ? cleaned
        : `Tiết ${pNum}: ${cleaned}`;
    }

    // ================= STAGE 1 EXTRACTION (Both NotebookLM Prompt & DOCX Template) =================
    const scenarioMatch = blockText.match(
      /(?:Tình huống khởi động|Tình huống)\s*:\s*([^\n]+)/i
    );
    const warmupQMatch = blockText.match(
      /(?:Câu hỏi khởi động|Câu hỏi gợi mở|(?:-|\•|\*)\s*Câu hỏi)\s*:\s*([^\n]+)/i
    );
    const warmupAnsMatch = blockText.match(
      /(?:Đáp án gợi ý(?:\s*HĐ1)?|Định hướng trả lời)\s*:\s*([^\n]+)/i
    );

    // ================= STAGE 2 EXTRACTION =================
    // Dạng 1: Kéo thả
    const dragParaMatch = blockText.match(
      /(?:Dạng 1[^:\n]*:|Đoạn văn kéo thả\s*:)\s*([^\n]+)/i
    );
    // Check NotebookLM "+ [Mục phân loại] -> [Hộp A]" items
    const nlmDragMatches = Array.from(
      blockText.matchAll(/^\s*[+•*-]\s*\[?([^\]\n->→]+?)\]?\s*(?:->|→|↔)\s*\[?([^\]\n(]+?)\]?(?:\s*\([\d.,]+đ\))?\s*$/gm)
    );
    const customDragWordBank =
      nlmDragMatches.length >= 2
        ? nlmDragMatches.map((m) => cleanMarkdownLine(m[1]))
        : baseWs.stage2.dragDropWordBank;
    const customDragQuestions =
      nlmDragMatches.length >= 2
        ? nlmDragMatches.slice(0, 5).map((m, idx) => ({
            slotNum: idx + 1,
            promptFragment: `${idx + 1}. Phân loại "${cleanMarkdownLine(m[1])}" vào nhóm chuẩn (${cleanMarkdownLine(m[2])})`,
            correctWord: cleanMarkdownLine(m[1]),
            points: Number((1.0 / Math.min(5, nlmDragMatches.length)).toFixed(2)),
          }))
        : baseWs.stage2.dragDropQuestions;

    // Dạng 2: Điền khuyết
    // Supports both:
    // 1) NotebookLM: "a) Đoạn trước ___ Đoạn sau | Đáp án: Từ khóa (0.4đ)"
    // 2) DOCX: "a) Đoạn trước [Từ khóa] Đoạn sau (0.4đ)"
    const parsedFillBlanks = [...(baseWs.stage2.fillBlankQuestions || [])];
    const fillLetters = ['a', 'b', 'c'];
    fillLetters.forEach((letter, idx) => {
      const nlmFillRegex = new RegExp(
        `(?:^|\\n)\\s*(?:[*\\-•]+\\s*)?${letter}[).]\\s*([^\\n|]+?)\\s*\\|\\s*(?:Đáp án|Từ khóa)\\s*:\\s*([^\\n(]+)`,
        'i'
      );
      const docxFillRegex = new RegExp(
        `(?:^|\\n)\\s*(?:[*\\-•]+\\s*)?${letter}[).]\\s*([^\\n\\[]*?)\\[([^\\]]+)\\]([^\\n(]*)`,
        'i'
      );

      const nlmMatch = blockText.match(nlmFillRegex);
      const docxMatch = blockText.match(docxFillRegex);

      if (nlmMatch) {
        const sentenceParts = nlmMatch[1].split(/_{2,}|\.{3,}|\(\.\.\.\)/);
        const preText = cleanMarkdownLine(sentenceParts[0] || '');
        const postText = cleanMarkdownLine(sentenceParts.slice(1).join(' ') || '');
        const ans = cleanMarkdownLine(nlmMatch[2]).replace(/^\[|\]$/g, '');
        if (ans && parsedFillBlanks[idx]) {
          parsedFillBlanks[idx] = {
            ...parsedFillBlanks[idx],
            label: `${letter})`,
            preText: preText ? `${preText} ` : '',
            postText: postText ? ` ${postText}` : '',
            correctAnswer: ans,
            accepted: [ans.toLowerCase()],
          };
        }
      } else if (docxMatch) {
        const preText = cleanMarkdownLine(docxMatch[1] || '');
        const ans = cleanMarkdownLine(docxMatch[2] || '');
        const postText = cleanMarkdownLine(docxMatch[3] || '');
        if (ans && parsedFillBlanks[idx]) {
          parsedFillBlanks[idx] = {
            ...parsedFillBlanks[idx],
            label: `${letter})`,
            preText: preText ? `${preText} ` : '',
            postText: postText ? ` ${postText}` : '',
            correctAnswer: ans,
            accepted: [ans.toLowerCase()],
          };
        }
      }
    });

    // Dạng 3: Nối cột
    // Supports NotebookLM: "Cột trái: ... <-> Cột phải: ..." and DOCX: "... <---> ..."
    const matchingRegex =
      /(?:Cột trái\s*:\s*)?([^\n<↔]+?)\s*(?:<--->|<->|↔)\s*(?:Cột phải\s*:\s*)?([^\n(]+?)(?:\s*\([\d.,]+đ\))?\s*(?:\n|$)/gi;
    const matchFound: Array<{ left: string; right: string }> = [];
    let mExec: RegExpExecArray | null;
    while ((mExec = matchingRegex.exec(blockText)) !== null) {
      const leftClean = cleanMarkdownLine(mExec[1]).replace(/^\[|\]$/g, '');
      const rightClean = cleanMarkdownLine(mExec[2]).replace(/^\[|\]$/g, '');
      if (leftClean && rightClean && !leftClean.includes('Thuật ngữ / Khái niệm')) {
        matchFound.push({ left: leftClean, right: rightClean });
      }
    }
    const parsedMatchingQuestions =
      matchFound.length >= 2
        ? matchFound.slice(0, 4).map((pair, idx) => ({
            id: `k${grade}-t${pNum}-m${idx + 1}`,
            num: idx + 1,
            leftText: pair.left,
            rightKey: String.fromCharCode(97 + idx),
            rightText: pair.right,
            points: Number((1.0 / Math.min(4, matchFound.length)).toFixed(2)),
          }))
        : baseWs.stage2.matchingQuestions;

    // Dạng 4: Trả lời ngắn
    const shortPromptMatch = blockText.match(
      /(?:Dạng 4\s*(?:\([^)]*\)|-\s*[^:\n]+)?\s*:|Tình huống trả lời ngắn\s*:)\s*([^\n|]+)/i
    );
    const cleanedShortPrompt = shortPromptMatch
      ? cleanMarkdownLine(shortPromptMatch[1])
          .replace(/^-\s*Trả lời ngắn[^\n:]*:\s*/i, '')
          .replace(/^:\s*/, '')
          .trim()
      : '';
    const shortQuestionsFound: Array<{ q: string; a: string }> = [];
    const saRegex =
      /Câu hỏi\s*(\d)\s*:\s*([^\n|]+?)(?:\s*\|\s*(?:Gợi ý đáp án|Đáp án)\s*:\s*([^\n(]+))?(?:\s*\([\d.,]+đ\))?\s*(?:\n|$)/gi;
    let saExec: RegExpExecArray | null;
    while ((saExec = saRegex.exec(blockText)) !== null) {
      const qClean = cleanMarkdownLine(saExec[2]).replace(/^\[|\]$/g, '');
      const aClean = cleanMarkdownLine(saExec[3] || '').replace(/^\[|\]$/g, '');
      if (qClean) {
        shortQuestionsFound.push({ q: qClean, a: aClean });
      }
    }
    const parsedShortAnswerQuestions =
      shortQuestionsFound.length > 0
        ? shortQuestionsFound.slice(0, 3).map((item, idx) => ({
            id: `k${grade}-t${pNum}-sa${idx + 1}`,
            label: baseWs.stage2.shortAnswerQuestions?.[idx]?.label || `• Câu hỏi ${idx + 1}:`,
            question: item.q,
            placeholder: 'Nhập câu trả lời ngắn của em...',
            sampleAnswer:
              item.a ||
              baseWs.stage2.shortAnswerQuestions?.[idx]?.sampleAnswer ||
              'Trả lời đúng trọng tâm kiến thức SGK Kết nối tri thức.',
            points: idx === 0 ? 0.4 : 0.3,
          }))
        : baseWs.stage2.shortAnswerQuestions;

    // ================= STAGE 3 EXTRACTION (6 CÂU TRẮC NGHIỆM 25S) =================
    const parsedStage3Questions = [...(baseWs.stage3QuizQuestions || [])];
    for (let qIdx = 1; qIdx <= 6; qIdx++) {
      const multiLineQRegex = new RegExp(
        `Câu\\s*${qIdx}\\s*(?:\\([^)]*\\))?\\s*[:.]\\s*([^\\n]+)\\s*\\n+\\s*A[.)]\\s*([^\\n]+)\\s*\\n+\\s*B[.)]\\s*([^\\n]+)\\s*\\n+\\s*C[.)]\\s*([^\\n]+)\\s*\\n+\\s*D[.)]\\s*([^\\n]+)(?:\\s*\\n+\\s*Đáp án(?: đúng)?\\s*:\\s*([ABCD]))?(?:\\s*\\n+\\s*Giải thích(?: sư phạm)?\\s*:\\s*([^\\n]+))?`,
        'i'
      );
      const qMatch = blockText.match(multiLineQRegex);
      if (qMatch && parsedStage3Questions[qIdx - 1]) {
        const qText = cleanMarkdownLine(qMatch[1]);
        const optTexts = [
          cleanMarkdownLine(qMatch[2]),
          cleanMarkdownLine(qMatch[3]),
          cleanMarkdownLine(qMatch[4]),
          cleanMarkdownLine(qMatch[5]),
        ];
        const correctLetter = ((qMatch[6] || 'A').toUpperCase().trim() || 'A') as
          | 'A'
          | 'B'
          | 'C'
          | 'D';
        const expText = cleanMarkdownLine(
          qMatch[7] || 'Đúng chuẩn kiến thức SGK Tin học GDPT 2018.'
        );

        parsedStage3Questions[qIdx - 1] = {
          ...parsedStage3Questions[qIdx - 1],
          question: qText.startsWith('Câu') ? qText : `Câu ${qIdx}: ${qText}`,
          options: (['A', 'B', 'C', 'D'] as const).map((ltr, oIdx) => ({
            letter: ltr,
            text: optTexts[oIdx] || `Phương án ${ltr}`,
            explanation: expText,
            isCorrect: ltr === correctLetter,
          })),
        };
      }
    }

    // ================= STAGE 4 EXTRACTION (3 BÀI TẬP VẬN DỤNG) =================
    const deepTaskMatch = blockText.match(/Bài(?: tập)?\s*1[^:\n]*:\s*([^\n]+)/i);
    const pracTaskMatch = blockText.match(/Bài(?: tập)?\s*2[^:\n]*:\s*([^\n]+)/i);
    const extTaskMatch = blockText.match(/Bài(?: tập)?\s*3[^:\n]*:\s*([^\n]+)/i);

    const parsedDragParagraph = dragParaMatch
      ? cleanMarkdownLine(dragParaMatch[1]).replace(/(\(\d+\))\s*\[[^\]]+\]/g, '$1')
      : baseWs.stage2.dragDropParagraph;

    parsedWorksheets.push({
      ...baseWs,
      lessonKey: `k${grade}-tiet-${pNum}`,
      grade,
      period: pNum,
      worksheetTitle: customTitle,
      stage1: {
        title: baseWs.stage1?.title || `Hoạt động 1: Khởi động (Tiết ${pNum})`,
        scenario: scenarioMatch
          ? cleanMarkdownLine(scenarioMatch[1])
          : baseWs.stage1?.scenario || '',
        question: warmupQMatch
          ? cleanMarkdownLine(warmupQMatch[1])
          : baseWs.stage1?.question || '',
        sampleAnswer: warmupAnsMatch
          ? cleanMarkdownLine(warmupAnsMatch[1])
          : baseWs.stage1?.sampleAnswer || '',
        points: 1.0,
      },
      stage2: {
        ...baseWs.stage2,
        dragDropWordBank: customDragWordBank,
        dragDropQuestions: customDragQuestions,
        dragDropParagraph: parsedDragParagraph,
        fillBlankQuestions: parsedFillBlanks,
        matchingQuestions: parsedMatchingQuestions,
        shortAnswerPrompt: cleanedShortPrompt || baseWs.stage2.shortAnswerPrompt,
        shortAnswerQuestions: parsedShortAnswerQuestions,
      },
      stage3QuizQuestions: parsedStage3Questions,
      stage4: {
        ...baseWs.stage4,
        deepAnalysis: {
          title:
            baseWs.stage4?.deepAnalysis?.title ||
            '1. Câu hỏi tự luận phân tích sâu (1.0 điểm)',
          prompt: deepTaskMatch
            ? cleanMarkdownLine(deepTaskMatch[1])
            : baseWs.stage4?.deepAnalysis?.prompt || '',
          guideAnswer: baseWs.stage4?.deepAnalysis?.guideAnswer || '',
          points: 1.0,
        },
        practicalTask: {
          title:
            baseWs.stage4?.practicalTask?.title ||
            '2. Bài tập thực hành kỹ năng số (1.0 điểm)',
          prompt: pracTaskMatch
            ? cleanMarkdownLine(pracTaskMatch[1])
            : baseWs.stage4?.practicalTask?.prompt || '',
          guideAnswer: baseWs.stage4?.practicalTask?.guideAnswer || '',
          points: 1.0,
        },
        extendedTask: {
          title:
            baseWs.stage4?.extendedTask?.title ||
            '3. Bài tập Vận dụng mở rộng & AI (1.0 điểm)',
          prompt: extTaskMatch
            ? cleanMarkdownLine(extTaskMatch[1])
            : baseWs.stage4?.extendedTask?.prompt || '',
          guideAnswer: baseWs.stage4?.extendedTask?.guideAnswer || '',
          points: 1.0,
        },
      },
      ingestedAt:
        new Date().toLocaleTimeString('vi-VN') +
        ' • Đã bóc tách & chuẩn hoá dữ liệu 29 tiết',
    });
  }

  return {
    worksheets: parsedWorksheets,
    details,
    directDetectedCount,
  };
}

