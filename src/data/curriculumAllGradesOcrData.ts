import {
  type CustomLessonWorksheet,
  type CustomDragDropQuestion,
  type DragDropSentenceLine,
} from './mockCurriculumData';
import { AUTHENTIC_PDF_EXTRACTS } from './authenticPdfExtracts';
import { getGrade7OcrPeriodData } from './curriculumGrade7OcrData';

export interface FullGradeOcrWorksheetMap {
  [lessonKey: string]: CustomLessonWorksheet;
}

const GRADE_6_LESSON_TITLES: Record<number, string> = {
  1: 'Bài 1: Thông tin và dữ liệu',
  2: 'Bài 2: Xử lí thông tin (mục 1)',
  3: 'Bài 2: Xử lí thông tin (mục 2)',
  4: 'Bài 3: Thông tin trong máy tính (mục 1)',
  5: 'Bài 3: Thông tin trong máy tính (mục 2)',
  6: 'Bài 4: Mạng máy tính (mục 1)',
  7: 'Bài 4: Mạng máy tính (mục 2)',
  8: 'Bài 5: Internet (mục 1, 2)',
  9: 'Bài 5: Internet (mục 3)',
  10: 'Bài 6: Mạng thông tin toàn cầu (mục 1, 2)',
  11: 'Bài 6: Thực hành khai thác thông tin trên trang web',
  12: 'Bài 7: Tìm kiếm thông tin trên Internet (mục 1)',
  13: 'Bài 7: Thực hành tìm kiếm thông tin trên Internet',
  14: 'Bài 8: Thư điện tử (mục 1, 2)',
  15: 'Bài 8: Thực hành đăng ký và gửi thư điện tử',
  16: 'Bài 9: An toàn thông tin trên Internet (mục 1, 2)',
  17: 'Bài 9: Bảo vệ thông tin cá nhân và chia sẻ an toàn',
  18: 'Bài 10: Sơ đồ tư duy (mục 1, 2)',
  19: 'Bài 10: Thực hành tạo sơ đồ tư duy bằng phần mềm',
  20: 'Bài 11: Định dạng văn bản',
  21: 'Bài 12: Trình bày thông tin ở dạng bảng (mục 1, 2, 3)',
  22: 'Bài 12: Thực hành tạo và định dạng bảng',
  23: 'Bài 13: Thực hành tìm kiếm và thay thế',
  24: 'Bài 14: Thực hành tổng hợp: Hoàn thiện sổ lưu niệm',
  25: 'Bài 15: Thuật toán',
  26: 'Bài 16: Các cấu trúc điều khiển (tuần tự, rẽ nhánh)',
  27: 'Bài 16: Các cấu trúc điều khiển (cấu trúc lặp)',
  28: 'Bài 17: Chương trình máy tính (mục 1)',
  29: 'Bài 17: Thực hành tạo chương trình máy tính trên Scratch',
};

export function generateAuthenticWorksheetForGradeAndPeriod(
  grade: 6 | 7 | 8 | 9,
  period: number
): CustomLessonWorksheet {
  const lessonKey = `k${grade}-tiet-${period}`;
  const ext = AUTHENTIC_PDF_EXTRACTS[lessonKey];
  const g7Data = grade === 7 ? getGrade7OcrPeriodData(period) : null;

  const fallbackGradeTitle =
    grade === 6 && GRADE_6_LESSON_TITLES[period]
      ? `Tiết ${period}: ${GRADE_6_LESSON_TITLES[period]}`
      : g7Data
      ? `Tiết ${period}: ${g7Data.lessonTitle} (${g7Data.subTitle})`
      : `Tiết ${period}: Bài học Tin học Khối ${grade}`;

  const cleanTitle =
    ext?.lessonTitle && ext.lessonTitle.trim().length > 8 && !/^Tiết\s*\d+$/i.test(ext.lessonTitle.trim())
      ? ext.lessonTitle.trim()
      : fallbackGradeTitle;

  const yccdText =
    ext?.yccd && ext.yccd.trim().length > 5
      ? ext.yccd.trim()
      : g7Data?.yccd
      ? g7Data.yccd
      : `Nắm vững kiến thức trọng tâm, rèn luyện kỹ năng thực hành số và vận dụng giải quyết vấn đề thực tiễn trong ${cleanTitle}.`;

  const rawWordBank =
    g7Data?.stage2?.dragDropWordBank && g7Data.stage2.dragDropWordBank.length >= 3
      ? g7Data.stage2.dragDropWordBank
      : ext?.wordBank && ext.wordBank.length >= 3
      ? ext.wordBank
      : ['Thông tin', 'Dữ liệu', 'Vật mang tin', 'An toàn thông tin'];

  // Ensure at least 4 distinct words in wordBank for 4 slots
  const wordBank = [...rawWordBank];
  const extraDefaults = ['Hiểu biết', 'Vật mang tin', 'Xử lý thông tin', 'An toàn thông tin'];
  let extraIdx = 0;
  while (wordBank.length < 4) {
    const candidate = extraDefaults[extraIdx % extraDefaults.length];
    if (!wordBank.includes(candidate)) {
      wordBank.push(candidate);
    } else {
      wordBank.push(`${candidate} (${wordBank.length + 1})`);
    }
    extraIdx++;
  }

  const fillBlankQuestions =
    ext?.fillBlankQuestions && ext.fillBlankQuestions.length > 0
      ? ext.fillBlankQuestions.map((fb, idx) => ({
          id: fb.id || `${lessonKey}-fb-${idx + 1}`,
          label: fb.label || `${String.fromCharCode(97 + idx)})`,
          preText: fb.preText || `Mệnh đề ${idx + 1}:`,
          postText: fb.postText || 'trong quá trình xử lý thông tin số.',
          correctAnswer: fb.correctAnswer || wordBank[idx % wordBank.length],
          accepted:
            fb.accepted && fb.accepted.length > 0
              ? fb.accepted
              : [
                  (fb.correctAnswer || wordBank[idx % wordBank.length]).toLowerCase(),
                  fb.correctAnswer || wordBank[idx % wordBank.length],
                ],
          points: fb.points ?? (idx === 0 ? 0.35 : idx === 1 ? 0.35 : 0.3),
        }))
      : g7Data?.stage2?.fillBlankQuestions && g7Data.stage2.fillBlankQuestions.length > 0
      ? g7Data.stage2.fillBlankQuestions
      : [
          {
            id: `${lessonKey}-fb-1`,
            label: 'a)',
            preText: 'Khái niệm cốt lõi đầu tiên trong bài học là',
            postText: 'giúp con người và máy tính thu nhận, xử lý hiệu quả.',
            correctAnswer: wordBank[0] || 'Thông tin',
            accepted: [(wordBank[0] || 'Thông tin').toLowerCase()],
            points: 0.35,
          },
          {
            id: `${lessonKey}-fb-2`,
            label: 'b)',
            preText: 'Yếu tố biểu diễn dưới dạng văn bản, con số, hình ảnh, âm thanh gọi là',
            postText: 'được lưu trữ trên các thiết bị số.',
            correctAnswer: wordBank[1] || 'Dữ liệu',
            accepted: [(wordBank[1] || 'Dữ liệu').toLowerCase()],
            points: 0.35,
          },
          {
            id: `${lessonKey}-fb-3`,
            label: 'c)',
            preText: 'Nguyên tắc quan trọng khi khai thác môi trường mạng và công cụ AI là',
            postText: 'để bảo vệ tài khoản và dữ liệu cá nhân.',
            correctAnswer: wordBank[2] || 'An toàn thông tin',
            accepted: [(wordBank[2] || 'An toàn thông tin').toLowerCase()],
            points: 0.3,
          },
        ];

  const shortAnswerPrompt =
    ext?.shortAnswerPrompt && ext.shortAnswerPrompt.replace(/^:\s*/, '').trim().length > 5
      ? ext.shortAnswerPrompt.replace(/^:\s*/, '').trim()
      : g7Data?.stage2?.shortAnswerPrompt
      ? g7Data.stage2.shortAnswerPrompt
      : `Tình huống thực tế (${cleanTitle}): Trong giờ học Tin học Khối ${grade}, em sử dụng máy tính và công cụ số để thực hiện nhiệm vụ học tập. Hãy phân tích dữ liệu đầu vào, quy trình xử lý và kết quả thu được.`;

  const shortAnswerQuestions =
    ext?.shortAnswerQuestions && ext.shortAnswerQuestions.length > 0
      ? ext.shortAnswerQuestions
      : g7Data?.stage2?.shortAnswerQuestions && g7Data.stage2.shortAnswerQuestions.length > 0
      ? g7Data.stage2.shortAnswerQuestions
      : [
          {
            id: `${lessonKey}-sa-1`,
            label: '• Dữ liệu & Đầu vào:',
            question: 'Xác định dữ liệu hoặc thông tin đầu vào trong tình huống bài học:',
            placeholder: 'Nhập câu trả lời ngắn...',
            sampleAnswer: `Dữ liệu đầu vào quan sát và thu thập được từ tình huống thực tế của ${cleanTitle}.`,
            points: 0.4,
          },
          {
            id: `${lessonKey}-sa-2`,
            label: '• Quy trình xử lý & Công cụ:',
            question: 'Nêu cách xử lý thông tin hoặc thao tác phần mềm tương ứng:',
            placeholder: 'Nhập câu trả lời ngắn...',
            sampleAnswer: 'Thực hiện đúng tuần tự các bước thao tác chuẩn theo hướng dẫn SGK Kết nối tri thức.',
            points: 0.3,
          },
          {
            id: `${lessonKey}-sa-3`,
            label: '• Ý nghĩa & An toàn số:',
            question: 'Nêu ý nghĩa kết quả rút ra và lưu ý an toàn dữ liệu / ứng dụng AI:',
            placeholder: 'Nhập câu trả lời ngắn...',
            sampleAnswer: 'Giúp giải quyết công việc nhanh chóng, chính xác và bảo mật thông tin cá nhân.',
            points: 0.3,
          },
        ];

  // Build authentic Drag & Drop classification statements for Kho Nhận Định -> Hộp A / Hộp B
  let dragDropQuestions: CustomDragDropQuestion[];
  let dragDropSentenceLines: DragDropSentenceLine[];
  let dragDropParagraph: string;
  let bucketA = 'Hộp A: Khái niệm & Thiết bị nền tảng';
  let bucketB = 'Hộp B: Chức năng & Ứng dụng công nghệ';
  let dragItems: Array<{ id: string; text: string; correctBox: 'data' | 'info' }> = [];

  if (grade === 8 && period === 1) {
    bucketA = 'Hộp A: Giai đoạn máy tính cơ học';
    bucketB = 'Hộp B: Giai đoạn máy tính điện tử';
    dragDropQuestions = [
      {
        slotNum: 1,
        promptFragment: 'Máy tính Pascaline (1642) hoạt động nhờ hệ thống bánh răng',
        correctWord: 'A',
        points: 0.25,
      },
      {
        slotNum: 2,
        promptFragment: 'Dự án máy tính Analytical Engine của Charles Babbage (1833)',
        correctWord: 'A',
        points: 0.25,
      },
      {
        slotNum: 3,
        promptFragment: 'Máy tính ENIAC sử dụng hàng vạn đèn điện tử chân không',
        correctWord: 'B',
        points: 0.25,
      },
      {
        slotNum: 4,
        promptFragment: 'Máy tính cá nhân sử dụng bộ vi xử lí mật độ tích hợp rất cao (VLSI)',
        correctWord: 'B',
        points: 0.25,
      },
    ];
    dragItems = [
      {
        id: 'dd-1',
        text: 'Máy tính Pascaline (1642) hoạt động nhờ hệ thống bánh răng',
        correctBox: 'data',
      },
      {
        id: 'dd-2',
        text: 'Dự án máy tính Analytical Engine của Charles Babbage (1833)',
        correctBox: 'data',
      },
      {
        id: 'dd-3',
        text: 'Máy tính ENIAC sử dụng hàng vạn đèn điện tử chân không',
        correctBox: 'info',
      },
      {
        id: 'dd-4',
        text: 'Máy tính cá nhân sử dụng bộ vi xử lí mật độ tích hợp rất cao (VLSI)',
        correctBox: 'info',
      },
    ];
    dragDropSentenceLines = [];
    dragDropParagraph = '';
  } else if (grade === 6 && period === 1) {
    bucketA = 'Hộp A: Dữ liệu & Vật mang tin';
    bucketB = 'Hộp B: Thông tin & Hiểu biết';
    dragDropQuestions = [
      {
        slotNum: 1,
        promptFragment: 'Các con số 32°C và biểu tượng mặt trời trên bản tin dự báo thời tiết là Dữ liệu',
        correctWord: 'A',
        points: 0.25,
      },
      {
        slotNum: 2,
        promptFragment: 'Chiếc tivi, trang sách hay thẻ nhớ lưu trữ dữ liệu đóng vai trò là Vật mang tin',
        correctWord: 'A',
        points: 0.25,
      },
      {
        slotNum: 3,
        promptFragment: 'Biết được "Hôm nay trời nắng nóng" từ bản tin thời tiết chính là Thông tin thu nhận được',
        correctWord: 'B',
        points: 0.25,
      },
      {
        slotNum: 4,
        promptFragment: 'Thông tin đem lại Hiểu biết cho con người để quyết định mang theo mũ nón khi ra ngoài',
        correctWord: 'B',
        points: 0.25,
      },
    ];
    dragItems = [
      {
        id: 'dd-1',
        text: 'Các con số 32°C và biểu tượng mặt trời trên bản tin dự báo thời tiết là Dữ liệu',
        correctBox: 'data',
      },
      {
        id: 'dd-2',
        text: 'Chiếc tivi, trang sách hay thẻ nhớ lưu trữ dữ liệu đóng vai trò là Vật mang tin',
        correctBox: 'data',
      },
      {
        id: 'dd-3',
        text: 'Biết được "Hôm nay trời nắng nóng" từ bản tin thời tiết chính là Thông tin thu nhận được',
        correctBox: 'info',
      },
      {
        id: 'dd-4',
        text: 'Thông tin đem lại Hiểu biết cho con người để quyết định mang theo mũ nón khi ra ngoài',
        correctBox: 'info',
      },
    ];
    dragDropSentenceLines = [];
    dragDropParagraph = '';
  } else if (g7Data && g7Data.stage2.dragDropQuestions.length > 0) {
    bucketA = 'Hộp A: Thiết bị & Thành phần cốt lõi';
    bucketB = 'Hộp B: Chức năng & Xử lý thông minh';
    dragDropQuestions = g7Data.stage2.dragDropQuestions.slice(0, 4).map((q, idx) => {
      const filledStatement = q.promptFragment
        .replace(/^\s*\d+[ab]?\.\s*/i, '')
        .replace(/\(\d+\)\.{0,}/g, q.correctWord)
        .trim();
      return {
        slotNum: idx + 1,
        promptFragment: filledStatement || `${q.correctWord} trong hệ thống máy tính`,
        correctWord: idx < 2 ? 'A' : 'B',
        points: 0.25,
      };
    });
    dragItems = dragDropQuestions.map((dq, idx) => ({
      id: `dd-${dq.slotNum}`,
      text: dq.promptFragment,
      correctBox: idx < 2 ? 'data' : 'info',
    }));
    dragDropSentenceLines = [];
    dragDropParagraph = '';
  } else {
    bucketA = `Hộp A: Khái niệm & Thành phần nền tảng (Tiết ${period})`;
    bucketB = `Hộp B: Ứng dụng & Thực hành công nghệ số (Tiết ${period})`;
    dragDropQuestions = [0, 1, 2, 3].map((idx) => {
      const fb = fillBlankQuestions[idx];
      const word = fb?.correctAnswer || wordBank[idx % wordBank.length] || `Khái niệm ${idx + 1}`;
      const cleanPre = fb?.preText
        ? fb.preText.replace(/^Mệnh đề\s*[a-d]\)\s*:\s*/i, '').trim()
        : '';
      const cleanPost = fb?.postText ? fb.postText.trim() : '';
      const statement =
        fb && (cleanPre || cleanPost)
          ? `${cleanPre ? cleanPre + ' ' : ''}${word} ${cleanPost}`.replace(/\s+/g, ' ').trim()
          : idx < 2
          ? `${word} là thành phần kiến thức cốt lõi cần nắm vững trong ${cleanTitle}`
          : `Vận dụng ${word} giúp xử lý dữ liệu chính xác và an toàn trong ${cleanTitle}`;

      return {
        slotNum: idx + 1,
        promptFragment: statement,
        correctWord: idx < 2 ? 'A' : 'B',
        points: 0.25,
      };
    });
    dragItems = dragDropQuestions.map((dq, idx) => ({
      id: `dd-${dq.slotNum}`,
      text: dq.promptFragment,
      correctBox: idx < 2 ? 'data' : 'info',
    }));
    dragDropSentenceLines = [];
    dragDropParagraph = '';
  }

  const matchingQuestions =
    g7Data?.stage2?.matchingQuestions && g7Data.stage2.matchingQuestions.length > 0
      ? g7Data.stage2.matchingQuestions
      : [
          {
            id: `${lessonKey}-m-1`,
            num: 1,
            leftText: `1) Trọng tâm kiến thức Tiết ${period}`,
            rightKey: 'a',
            rightText: `a) ${yccdText.slice(0, 110)}`,
            points: 0.25,
          },
          {
            id: `${lessonKey}-m-2`,
            num: 2,
            leftText: `2) Khái niệm cốt lõi: ${fillBlankQuestions[0]?.correctAnswer || wordBank[0]}`,
            rightKey: 'b',
            rightText: `b) ${fillBlankQuestions[0]?.postText || 'Thành phần nền tảng trong bài học Tin học.'}`,
            points: 0.25,
          },
          {
            id: `${lessonKey}-m-3`,
            num: 3,
            leftText: '3) Năng lực số (CV 3456)',
            rightKey: 'c',
            rightText: 'c) Khai thác, tổ chức, lưu trữ dữ liệu số khoa học và bảo mật tài khoản an toàn.',
            points: 0.25,
          },
          {
            id: `${lessonKey}-m-4`,
            num: 4,
            leftText: '4) Năng lực AI (Khung 3439)',
            rightKey: 'd',
            rightText: 'd) Đặt câu lệnh (Prompt) rõ ràng và kiểm chứng độ chính xác của thông tin do AI gợi ý.',
            points: 0.25,
          },
        ];

  return {
    lessonKey,
    grade,
    period,
    worksheetTitle: `Phiếu học tập Tiết ${period} (Khối ${grade}) • ${cleanTitle}`,
    sourceFileName: `Mau_Nap_Du_Lieu_29_Tiet_Tin_Hoc_Khoi_${grade}.docx`,
    ingestedAt: 'Chuẩn GDPT 2018 • CV 3456 & Khung AI 3439',
    stage1: {
      title: `Hoạt động 1: Khởi động — ${cleanTitle}`,
      scenario: `Tình huống thực tế mở đầu ${cleanTitle} (Khối ${grade}): Trong học tập và đời sống hàng ngày, em thường gặp các bài toán cần xử lý thông tin nhanh chóng bằng công nghệ số. ${yccdText}`,
      question: `Từ tình huống trên, em hãy nêu nhận định ban đầu về vai trò của "${fillBlankQuestions[0]?.correctAnswer || wordBank[0]}" trong bài học hôm nay?`,
      sampleAnswer: `Hiểu rõ bản chất của ${fillBlankQuestions[0]?.correctAnswer || wordBank[0]} giúp chúng ta thu nhận, xử lý dữ liệu chính xác và ứng dụng hiệu quả vào thực tế.`,
      points: 1.0,
    },
    stage1Questions: [
      {
        id: `${lessonKey}-cw-1`,
        rowNumber: 1,
        clue: fillBlankQuestions[0]?.postText || `Khái niệm trọng tâm số 1 của Tiết ${period}`,
        answer: (fillBlankQuestions[0]?.correctAnswer || 'THONGTIN').toUpperCase().replace(/\s+/g, ''),
        points: 2.5,
      },
      {
        id: `${lessonKey}-cw-2`,
        rowNumber: 2,
        clue: fillBlankQuestions[1]?.postText || `Khái niệm trọng tâm số 2 của Tiết ${period}`,
        answer: (fillBlankQuestions[1]?.correctAnswer || 'DULIEU').toUpperCase().replace(/\s+/g, ''),
        points: 2.5,
      },
    ],
    stage2: {
      bucketA,
      bucketB,
      dragItems,
      dragDropTitle: 'DẠNG 1: KÉO THẢ PHÂN LOẠI ỨNG DỤNG & CÔNG NGHỆ',
      dragDropInstruction: 'Phân loại các thiết bị/dự án vào đúng giai đoạn phát triển (1.0đ - 0.25đ/ý)',
      dragDropWordBank: wordBank,
      dragDropParagraph,
      dragDropQuestions,
      dragDropSentenceLines,
      fillBlankTitle: 'DẠNG 2: ĐIỀN KHUYẾT MỆNH ĐỀ CỐT LÕI',
      fillBlankInstruction: 'Điền từ hoặc cụm từ thích hợp vào chỗ trống để hoàn thành 3 mệnh đề kiến thức (1.0đ)',
      fillBlankQuestions,
      matchingTitle: 'DẠNG 3: NỐI CỘT GHÉP KHÁI NIỆM (CỘT A ↔ CỘT B)',
      matchingInstruction: 'Ghép nối mỗi nội dung ở Cột A với một mô tả chính xác ở Cột B (1.0đ - 0.25đ/cặp)',
      matchingQuestions,
      shortAnswerPrompt,
      shortAnswerQuestions,
    },
    stage3QuizQuestions:
      g7Data?.stage3?.quizQuestions && g7Data.stage3.quizQuestions.length > 0
        ? g7Data.stage3.quizQuestions
        : [
            {
              id: `${lessonKey}-q1`,
              order: 1,
              question: `Câu 1 [Nhận biết - Tiết ${period}]: Khái niệm "${fillBlankQuestions[0]?.correctAnswer || wordBank[0]}" trong ${cleanTitle} mang ý nghĩa gì?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              options: [
                {
                  letter: 'A',
                  text: fillBlankQuestions[0]?.postText || yccdText,
                  isCorrect: true,
                  explanation: 'Chính xác theo định nghĩa chuẩn trong SGK Kết nối tri thức.',
                },
                {
                  letter: 'B',
                  text: 'Bỏ qua việc kiểm tra dữ liệu đầu vào và tắt thiết bị đột ngột.',
                  isCorrect: false,
                  explanation: 'Sai nguyên tắc vận hành và xử lý thông tin.',
                },
                {
                  letter: 'C',
                  text: 'Chỉ sao chép ngẫu nhiên mà không cần hiểu nội dung.',
                  isCorrect: false,
                  explanation: 'Sai phương pháp học tập.',
                },
                {
                  letter: 'D',
                  text: 'Chia sẻ mật khẩu cá nhân công khai trên mạng xã hội.',
                  isCorrect: false,
                  explanation: 'Vi phạm quy tắc an toàn thông tin số.',
                },
              ],
              points: 0.5,
            },
            {
              id: `${lessonKey}-q2`,
              order: 2,
              question: `Câu 2 [Nhận biết - Tiết ${period}]: Trong ${cleanTitle}, yếu tố "${fillBlankQuestions[1]?.correctAnswer || wordBank[1] || 'Dữ liệu'}" có đặc điểm nào sau đây?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              options: [
                {
                  letter: 'A',
                  text: 'Không thể lưu trữ hay truyền tải qua mạng máy tính.',
                  isCorrect: false,
                  explanation: 'Sai.',
                },
                {
                  letter: 'B',
                  text: fillBlankQuestions[1]?.postText || 'Được tổ chức, xử lý và lưu trữ phục vụ nhiệm vụ học tập.',
                  isCorrect: true,
                  explanation: 'Đúng chuẩn kiến thức trọng tâm của tiết học.',
                },
                {
                  letter: 'C',
                  text: 'Tự động biến mất khi bật màn hình máy tính.',
                  isCorrect: false,
                  explanation: 'Sai.',
                },
                {
                  letter: 'D',
                  text: 'Không liên quan đến chương trình Tin học.',
                  isCorrect: false,
                  explanation: 'Sai.',
                },
              ],
              points: 0.5,
            },
            {
              id: `${lessonKey}-q3`,
              order: 3,
              question: `Câu 3 [Thông hiểu - Yêu cầu cần đạt]: Mục tiêu trọng tâm khi học ${cleanTitle} (Khối ${grade}) là gì?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              options: [
                {
                  letter: 'A',
                  text: 'Không sử dụng máy tính hay thiết bị số.',
                  isCorrect: false,
                  explanation: 'Sai.',
                },
                {
                  letter: 'B',
                  text: 'Xóa các tệp hệ thống trong phòng máy.',
                  isCorrect: false,
                  explanation: 'Sai quy định phòng thực hành.',
                },
                {
                  letter: 'C',
                  text: yccdText,
                  isCorrect: true,
                  explanation: 'Chính xác theo Yêu cầu cần đạt Chương trình GDPT 2018.',
                },
                {
                  letter: 'D',
                  text: 'Tải phần mềm lạ không rõ nguồn gốc.',
                  isCorrect: false,
                  explanation: 'Nguy cơ mất an toàn thông tin.',
                },
              ],
              points: 0.5,
            },
            {
              id: `${lessonKey}-q4`,
              order: 4,
              question: `Câu 4 [Thông hiểu - Năng lực số CV 3456]: Khi thực hành nội dung Tiết ${period}, hành động nào thể hiện tốt Năng lực số?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              options: [
                {
                  letter: 'A',
                  text: 'Lưu trữ dữ liệu lộn xộn không đặt tên tệp.',
                  isCorrect: false,
                  explanation: 'Chưa đạt kỹ năng quản lý dữ liệu.',
                },
                {
                  letter: 'B',
                  text: 'Sử dụng mật khẩu đơn giản như 123456 cho mọi tài khoản.',
                  isCorrect: false,
                  explanation: 'Mất an toàn bảo mật.',
                },
                {
                  letter: 'C',
                  text: 'Sao chép bài làm của người khác mà không ghi nguồn.',
                  isCorrect: false,
                  explanation: 'Vi phạm bản quyền số.',
                },
                {
                  letter: 'D',
                  text: `Tổ chức, lưu trữ tệp dữ liệu khoa học, thực hiện đúng quy trình kỹ thuật và bảo mật thông tin an toàn.`,
                  isCorrect: true,
                  explanation: 'Đúng chuẩn Khung Năng lực số CV 3456.',
                },
              ],
              points: 0.5,
            },
            {
              id: `${lessonKey}-q5`,
              order: 5,
              question: `Câu 5 [Vận dụng - Năng lực AI 3439]: Khi sử dụng Trợ lý AI để hỗ trợ tìm hiểu ${cleanTitle}, em cần lưu ý nguyên tắc nào?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              options: [
                {
                  letter: 'A',
                  text: 'Đặt câu lệnh (Prompt) rõ ràng, cụ thể và luôn đối chiếu, kiểm chứng thông tin AI phản hồi với SGK.',
                  isCorrect: true,
                  explanation: 'Chính xác theo Khung năng lực AI 3439.',
                },
                {
                  letter: 'B',
                  text: 'Tin tưởng tuyệt đối 100% mọi câu trả lời của AI mà không cần đọc lại.',
                  isCorrect: false,
                  explanation: 'Sai vì AI có thể gặp hiện tượng ảo giác thông tin (Hallucination).',
                },
                {
                  letter: 'C',
                  text: 'Nhập thông tin căn cước và mật khẩu cá nhân vào khung chat AI.',
                  isCorrect: false,
                  explanation: 'Rủi ro lộ lọt dữ liệu cá nhân.',
                },
                {
                  letter: 'D',
                  text: 'Nhờ AI làm hộ toàn bộ bài tập mà không tự suy nghĩ.',
                  isCorrect: false,
                  explanation: 'Sai mục tiêu rèn luyện tư duy.',
                },
              ],
              points: 0.5,
            },
            {
              id: `${lessonKey}-q6`,
              order: 6,
              question: `Câu 6 [Vận dụng cao - Thực tiễn]: Giải pháp nào giúp em áp dụng hiệu quả kiến thức Tiết ${period} vào dự án học tập thực tế?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              options: [
                {
                  letter: 'A',
                  text: 'Chỉ học thuộc lòng khái niệm mà không thực hành.',
                  isCorrect: false,
                  explanation: 'Chưa đạt mức độ Vận dụng.',
                },
                {
                  letter: 'B',
                  text: `Kết hợp nhuần nhuyễn kiến thức "${fillBlankQuestions[0]?.correctAnswer || wordBank[0]}" với công cụ số để tạo sản phẩm hoàn chỉnh, đúng tiêu chí Rubric.`,
                  isCorrect: true,
                  explanation: 'Hoàn toàn chính xác!',
                },
                {
                  letter: 'C',
                  text: 'Bỏ qua bước kiểm thử và rà soát lỗi sản phẩm.',
                  isCorrect: false,
                  explanation: 'Sai quy trình làm sản phẩm số.',
                },
                {
                  letter: 'D',
                  text: 'Không hợp tác hay trao đổi với các bạn trong nhóm.',
                  isCorrect: false,
                  explanation: 'Thiếu kỹ năng hợp tác số.',
                },
              ],
              points: 0.5,
            },
          ],
    stage4: {
      title: `Hoạt động 4: Vận dụng thực tế & Đánh giá năng lực — Tiết ${period} (3.0 điểm)`,
      deepAnalysis: {
        title: '1. Câu hỏi tự luận phân tích sâu (1.0 điểm)',
        prompt: `Phân tích vai trò của "${fillBlankQuestions[0]?.correctAnswer || wordBank[0]}" và "${fillBlankQuestions[1]?.correctAnswer || wordBank[1] || 'Dữ liệu'}" trong tình huống thực tế của ${cleanTitle}.`,
        guideAnswer: `Học sinh nêu đúng bản chất khái niệm (${yccdText}) và lấy được ví dụ minh họa sát thực tế học tập.`,
        points: 1.0,
      },
      practicalTask: {
        title: '2. Bài tập thực hành tự luận / Thiết kế sản phẩm số (1.0 điểm)',
        prompt: `Thực hiện thao tác thực hành trên máy tính hoặc lập bảng quy trình giải quyết bài toán của Tiết ${period} (Khối ${grade}).`,
        guideAnswer: 'Hoàn thành đúng các bước kỹ thuật, đặt tên tệp đúng quy ước và lưu vào thư mục lớp trên Google Drive.',
        points: 1.0,
      },
      extendedTask: {
        title: '3. Bài tập Vận dụng mở rộng & Ứng dụng AI (1.0 điểm)',
        prompt: `Đề xuất 1 tình huống ứng dụng công nghệ số hoặc Trợ lý AI có trách nhiệm để mở rộng nội dung ${cleanTitle} tại gia đình hoặc trường học.`,
        guideAnswer: 'Nêu rõ câu lệnh gợi mở (Prompt), cách kiểm chứng kết quả và biện pháp bảo vệ an toàn thông tin cá nhân.',
        points: 1.0,
      },
      prompt: `Vận dụng kiến thức Tiết ${period} (${cleanTitle}) giải quyết 3 nhiệm vụ thực tiễn.`,
      sampleRow: {
        carrier: 'Thiết bị số / Máy tính phòng Lab',
        data: fillBlankQuestions[0]?.correctAnswer || wordBank[0] || 'Dữ liệu số',
        infoAction: yccdText,
      },
      rubrics: [
        {
          id: `${lessonKey}-r1`,
          title: 'Tiêu chí 1: Chuẩn kiến thức SGK Kết nối tri thức',
          desc: yccdText,
          points: 1.0,
        },
        {
          id: `${lessonKey}-r2`,
          title: 'Tiêu chí 2: Năng lực số (CV 3456)',
          desc: 'Tổ chức, xử lý dữ liệu khoa học và đảm bảo an toàn thông tin.',
          points: 1.0,
        },
        {
          id: `${lessonKey}-r3`,
          title: 'Tiêu chí 3: Năng lực AI (Khung 3439)',
          desc: 'Ứng dụng công cụ thông minh sáng tạo, có kiểm chứng và trách nhiệm.',
          points: 1.0,
        },
      ],
    },
  };
}

export function getAllGradesCompleteWorksheetMap(): FullGradeOcrWorksheetMap {
  const map: FullGradeOcrWorksheetMap = {};
  ([6, 7, 8, 9] as const).forEach((grade) => {
    for (let period = 1; period <= 29; period++) {
      const ws = generateAuthenticWorksheetForGradeAndPeriod(grade, period);
      map[ws.lessonKey] = ws;
    }
  });
  return map;
}
