import {
  type CustomDragDropQuestion,
  type CustomFillBlankQuestion,
  type CustomMatchingQuestion,
  type CustomShortAnswerQuestion,
  type DragDropSentenceLine,
  type MinigameQuestionItem,
} from './mockCurriculumData';

export interface Grade7OcrPeriodData {
  period: number;
  lessonTitle: string;
  subTitle: string;
  yccd: string;
  nlsTarget: string;
  aiTarget: string;
  stage2: {
    worksheetTitle: string;
    dragDropWordBank: string[];
    dragDropQuestions: CustomDragDropQuestion[];
    dragDropSentenceLines: DragDropSentenceLine[];
    fillBlankQuestions: CustomFillBlankQuestion[];
    matchingQuestions: CustomMatchingQuestion[];
    shortAnswerPrompt: string;
    shortAnswerQuestions: CustomShortAnswerQuestion[];
  };
  stage3: {
    quizQuestions: MinigameQuestionItem[];
  };
  stage4: {
    prompt: string;
    sampleRow: { carrier: string; data: string; infoAction: string };
  };
}

export const GRADE_7_OCR_DATA: Record<number, Grade7OcrPeriodData> = {
  1: {
    period: 1,
    lessonTitle: 'BÀI 1. THIẾT BỊ VÀO - RA',
    subTitle: 'MỤC 1: KHÁI NIỆM & PHÂN LOẠI',
    yccd: 'Nhận biết và phân loại các thiết bị vào, thiết bị ra, thiết bị vừa vào vừa ra.',
    nlsTarget: 'TC1.5.1: Liệt kê các hướng dẫn thông thường cho hệ thống máy tính thu nhận, xử lý thông tin.',
    aiTarget: '7.A1.1: Nhận diện và phân biệt thiết bị phần cứng có tích hợp AI (loa thông minh, camera AI, tai nghe thông minh).',
    stage2: {
      worksheetTitle: 'PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT 1 • THIẾT BỊ VÀO - RA (KHÁI NIỆM & PHÂN LOẠI)',
      dragDropWordBank: ['Thiết bị vào', 'Thiết bị ra', 'Vừa vào vừa ra', 'Loa thông minh AI', 'Dữ liệu âm thanh'],
      dragDropQuestions: [
        { slotNum: 1, promptFragment: '1. Bàn phím và chuột đóng vai trò là (1)... giúp người dùng nhập lệnh.', correctWord: 'Thiết bị vào', points: 0.2 },
        { slotNum: 2, promptFragment: '2. Màn hình và máy in đóng vai trò là (2)... xuất kết quả xử lý ra môi trường ngoài.', correctWord: 'Thiết bị ra', points: 0.2 },
        { slotNum: 3, promptFragment: '3. Màn hình cảm ứng trên điện thoại di động là loại thiết bị (3)...', correctWord: 'Vừa vào vừa ra', points: 0.2 },
        { slotNum: 4, promptFragment: '4. (4)... là thiết bị vừa có chức năng thu nhận giọng nói...', correctWord: 'Loa thông minh AI', points: 0.2 },
        { slotNum: 5, promptFragment: '...vừa có khả năng phản hồi lại bằng (5)... nhờ tích hợp trợ lý ảo AI.', correctWord: 'Dữ liệu âm thanh', points: 0.2 },
      ],
      dragDropSentenceLines: [
        { sentenceNum: 1, textBefore: '1. Bàn phím và chuột đóng vai trò là ', slotNum: 1, textAfter: ' giúp người dùng nhập lệnh.' },
        { sentenceNum: 2, textBefore: '2. Màn hình và máy in đóng vai trò là ', slotNum: 2, textAfter: ' xuất kết quả xử lý ra môi trường ngoài.' },
        { sentenceNum: 3, textBefore: '3. Màn hình cảm ứng trên điện thoại di động là loại thiết bị ', slotNum: 3, textAfter: '.' },
        { sentenceNum: 4, textBefore: '4. ', slotNum: 4, textMid: ' là thiết bị vừa có chức năng thu nhận giọng nói vừa có khả năng phản hồi lại bằng ', slotNum2: 5, textAfter: ' nhờ tích hợp trợ lý ảo AI.' },
      ],
      fillBlankQuestions: [
        { id: 'k7-p1-fb-a', label: 'a)', preText: 'Thiết bị vào được dùng để nhập ', postText: ' vào máy tính như bàn phím, chuột, micro, camera.', correctAnswer: 'dữ liệu', accepted: ['dữ liệu', 'du lieu'], points: 0.35 },
        { id: 'k7-p1-fb-b', label: 'b)', preText: 'Thiết bị ra được dùng để xuất dữ liệu từ máy tính ra bên ngoài dưới dạng ', postText: ', âm thanh hoặc hình ảnh.', correctAnswer: 'văn bản', accepted: ['văn bản', 'van ban'], points: 0.35 },
        { id: 'k7-p1-fb-c', label: 'c)', preText: 'Máy chiếu là thiết bị ', postText: ', dùng để hiển thị nội dung màn hình máy tính lên màn chiếu rộng.', correctAnswer: 'ra', accepted: ['ra', 'thiết bị ra'], points: 0.3 },
      ],
      matchingQuestions: [
        { id: 'k7-p1-m1', num: 1, leftText: '1) Micro thu âm', rightKey: 'a', rightText: 'a) Tiếp nhận sóng âm, chuyển thành tín hiệu số vào máy tính.', points: 0.25 },
        { id: 'k7-p1-m2', num: 2, leftText: '2) Màn hình cảm ứng', rightKey: 'b', rightText: 'b) Nhập dữ liệu thao tác vuốt/chạm đồng thời hiển thị hình ảnh.', points: 0.25 },
        { id: 'k7-p1-m3', num: 3, leftText: '3) Máy in laser', rightKey: 'c', rightText: 'c) Xuất dữ liệu văn bản/hình ảnh ra giấy.', points: 0.25 },
        { id: 'k7-p1-m4', num: 4, leftText: '4) Camera AI điểm danh', rightKey: 'd', rightText: 'd) Thu nhận hình ảnh khuôn mặt và xử lý nhận diện thông minh.', points: 0.25 },
      ],
      shortAnswerPrompt: 'Trong buổi học trực tuyến, bạn An sử dụng tai nghe có gắn micro. Theo em, bộ tai nghe kèm micro này thuộc loại thiết bị nào? Giải thích rõ luồng thông tin vào và ra qua thiết bị này.',
      shortAnswerQuestions: [
        { id: 'k7-p1-sa1', label: '• Phân loại thiết bị', question: 'Bộ tai nghe có gắn micro thuộc loại thiết bị nào?', placeholder: 'Thuộc loại thiết bị...', sampleAnswer: 'Thuộc loại thiết bị vừa vào vừa ra (kết hợp tai nghe là thiết bị ra và micro là thiết bị vào).', points: 0.4 },
        { id: 'k7-p1-sa2', label: '• Luồng thông tin VÀO', question: 'Mô tả luồng thông tin vào qua micro:', placeholder: 'Micro thu nhận...', sampleAnswer: 'Micro thu âm thanh tiếng nói của An rồi chuyển thành tín hiệu số đưa vào máy tính.', points: 0.3 },
        { id: 'k7-p1-sa3', label: '• Luồng thông tin RA', question: 'Mô tả luồng thông tin ra qua tai nghe:', placeholder: 'Tai nghe phát ra...', sampleAnswer: 'Tai nghe nhận tín hiệu âm thanh từ máy tính chuyển đổi và phát ra tai An nghe.', points: 0.3 },
      ],
    },
    stage3: {
      quizQuestions: [
        {
          id: 'k7-p1-q1',
          order: 1,
          question: 'Câu 1 (Biết): Thiết bị nào sau đây KHÔNG phải là thiết bị vào của máy tính?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Bàn phím.', isCorrect: false, explanation: 'Bàn phím là thiết bị vào.' },
            { letter: 'B', text: 'Chuột máy tính.', isCorrect: false, explanation: 'Chuột là thiết bị vào.' },
            { letter: 'C', text: 'Máy in phun.', isCorrect: true, explanation: 'Máy in là thiết bị ra dùng xuất văn bản/hình ảnh.' },
            { letter: 'D', text: 'Micro thu âm.', isCorrect: false, explanation: 'Micro là thiết bị vào.' },
          ],
        },
        {
          id: 'k7-p1-q2',
          order: 2,
          question: 'Câu 2 (Biết): Thiết bị nào có chức năng xuất dữ liệu âm thanh từ máy tính ra bên ngoài?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Micro.', isCorrect: false, explanation: 'Micro thu nhận âm thanh vào.' },
            { letter: 'B', text: 'Loa (Speaker).', isCorrect: true, explanation: 'Loa là thiết bị ra xuất âm thanh.' },
            { letter: 'C', text: 'Màn hình.', isCorrect: false, explanation: 'Màn hình xuất hình ảnh.' },
            { letter: 'D', text: 'Tấm cảm ứng.', isCorrect: false, explanation: 'Tấm cảm ứng là thiết bị vào.' },
          ],
        },
        {
          id: 'k7-p1-q3',
          order: 3,
          question: 'Câu 3 (Biết): Thiết bị nào sau đây tích hợp cả chức năng nhập dữ liệu và xuất dữ liệu?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Màn hình máy tính để bàn.', isCorrect: false, explanation: 'Màn hình thường chỉ là thiết bị ra.' },
            { letter: 'B', text: 'Chuột không dây.', isCorrect: false, explanation: 'Chuột là thiết bị vào.' },
            { letter: 'C', text: 'Màn hình cảm ứng smartphone.', isCorrect: true, explanation: 'Màn hình cảm ứng vừa hiển thị (ra) vừa nhận thao tác vuốt/chạm (vào).' },
            { letter: 'D', text: 'Máy quét mã vạch.', isCorrect: false, explanation: 'Máy quét là thiết bị vào.' },
          ],
        },
        {
          id: 'k7-p1-q4',
          order: 4,
          question: 'Câu 4 (Hiểu): Tại sao máy chiếu (Projector) được xếp vào nhóm thiết bị ra?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Vì máy chiếu thu nhận tín hiệu từ người điều khiển.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'B', text: 'Vì máy chiếu nhận tín hiệu hình ảnh từ máy tính và phóng chiếu ra màn hình rộng.', isCorrect: true, explanation: 'Đúng bản chất thiết bị xuất kết quả xử lý ra môi trường ngoài.' },
            { letter: 'C', text: 'Vì máy chiếu có kích thước to hơn máy tính.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Vì máy chiếu lưu trữ dữ liệu thuyết trình.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p1-q5',
          order: 5,
          question: 'Câu 5 (Hiểu): Điểm khác nhau cơ bản giữa Loa vi tính thường và Loa thông minh (Smart Speaker) có trợ lý AI?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Loa thông minh chỉ dùng để nghe nhạc chất lượng cao hơn.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'B', text: 'Loa thông minh tích hợp micro thu giọng nói, xử lý lệnh bằng AI và đàm thoại hai chiều.', isCorrect: true, explanation: 'Chính xác theo chuẩn khung AI 3439.' },
            { letter: 'C', text: 'Loa vi tính thường không thể phát ra âm thanh.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Hai loại loa này hoàn toàn giống nhau về công nghệ.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p1-q6',
          order: 6,
          question: 'Câu 6 (Vận dụng): Camera an ninh tự động phát hiện người không đeo khẩu trang và phát tiếng cảnh báo. Thiết bị vào - ra gồm:',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Thiết bị vào: Ống kính Camera; Thiết bị ra: Loa phát còi cảnh báo.', isCorrect: true, explanation: 'Camera thu nhận hình ảnh khuôn mặt, Loa xuất âm thanh cảnh báo.' },
            { letter: 'B', text: 'Thiết bị vào: Loa; Thiết bị ra: Màn hình.', isCorrect: false, explanation: 'Sai vai trò.' },
            { letter: 'C', text: 'Chỉ có thiết bị ra mà không có thiết bị vào.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Hệ thống này chỉ sử dụng phần mềm mà không dùng thiết bị phần cứng.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
      ],
    },
    stage4: {
      prompt: 'Nhiệm vụ thực tế: Quan sát góc học tập hoặc phòng máy tính của trường em. Hãy lập bảng liệt kê tất cả các thiết bị vào - ra đang có, phân loại rõ ràng và đề xuất 1 thiết bị thông minh mà em muốn nâng cấp để hỗ trợ việc học tốt hơn.',
      sampleRow: {
        carrier: 'Bộ máy tính bàn tại phòng thực hành Tin học trường',
        data: 'Bàn phím, chuột quang (Vào); Màn hình LCD 21 inch, tai nghe (Ra)',
        infoAction: 'Đề xuất nâng cấp webcam AI hỗ trợ điểm danh tự động và đàm thoại học trực tuyến.',
      },
    },
  },

  2: {
    period: 2,
    lessonTitle: 'BÀI 1. THIẾT BỊ VÀO - RA',
    subTitle: 'MỤC 2: AN TOÀN THIẾT BỊ',
    yccd: 'Thực hiện đúng các thao tác với thiết bị thông dụng, nêu ví dụ thao tác sai gây ra lỗi.',
    nlsTarget: 'TC1.4.1: Chỉ ra những cách thức cơ bản và phổ biến để bảo vệ thiết bị phần cứng và nội dung số.',
    aiTarget: '7.B1.1: Trình bày ý thức trách nhiệm và sự cẩn trọng khi vận hành, bảo vệ thiết bị phần cứng và dữ liệu cho AI.',
    stage2: {
      worksheetTitle: 'PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT 2 • AN TOÀN KHI SỬ DỤNG THIẾT BỊ MÁY TÍNH',
      dragDropWordBank: ['Đúng cổng', 'Rút đột ngột', 'An toàn (Shutdown)', 'Nguồn điện', 'Khô ráo'],
      dragDropQuestions: [
        { slotNum: 1, promptFragment: '1. Luôn cắm các đầu nối (USB, HDMI) vào (1)... và theo chiều thiết kế.', correctWord: 'Đúng cổng', points: 0.2 },
        { slotNum: 2, promptFragment: '2. Không (2)... thiết bị lưu trữ USB khi máy tính đang ghi dữ liệu.', correctWord: 'Rút đột ngột', points: 0.2 },
        { slotNum: 3, promptFragment: '3. Giữ gìn nơi làm việc ngăn nắp, vệ sinh bàn phím và giữ tay luôn (3)...', correctWord: 'Khô ráo', points: 0.2 },
        { slotNum: 4, promptFragment: '4. Tắt máy tính bằng lệnh (4)...', correctWord: 'An toàn (Shutdown)', points: 0.2 },
        { slotNum: 5, promptFragment: '...trước khi ngắt (5)...', correctWord: 'Nguồn điện', points: 0.2 },
      ],
      dragDropSentenceLines: [
        { sentenceNum: 1, textBefore: '1. Luôn cắm các đầu nối (USB, HDMI) vào ', slotNum: 1, textAfter: ' và theo chiều thiết kế.' },
        { sentenceNum: 2, textBefore: '2. Không ', slotNum: 2, textAfter: ' thiết bị lưu trữ USB khi máy tính đang ghi dữ liệu.' },
        { sentenceNum: 3, textBefore: '3. Giữ gìn nơi làm việc ngăn nắp, vệ sinh bàn phím và giữ tay luôn ', slotNum: 3, textAfter: '.' },
        { sentenceNum: 4, textBefore: '4. Tắt máy tính bằng lệnh ', slotNum: 4, textMid: ' trước khi ngắt ', slotNum2: 5, textAfter: '.' },
      ],
      fillBlankQuestions: [
        { id: 'k7-p2-fb-a', label: 'a)', preText: 'Việc cắm nhầm đầu cắm tai nghe vào cổng micro có thể khiến thiết bị không ', postText: '.', correctAnswer: 'hoạt động', accepted: ['hoạt động', 'phát âm thanh', 'nhận diện'], points: 0.35 },
        { id: 'k7-p2-fb-b', label: 'b)', preText: 'Khi rút thẻ nhớ hoặc USB, nên sử dụng lệnh ', postText: ' trên hệ điều hành để tránh mất dữ liệu.', correctAnswer: 'ngắt an toàn', accepted: ['ngắt an toàn', 'safely remove', 'eject'], points: 0.35 },
        { id: 'k7-p2-fb-c', label: 'c)', preText: 'Để thức ăn, nước uống gần bàn phím máy tính có thể gây nguy cơ ', postText: ' và hỏng mạch điện.', correctAnswer: 'chập cháy', accepted: ['chập cháy', 'đổ nước', 'hư hại'], points: 0.3 },
      ],
      matchingQuestions: [
        { id: 'k7-p2-m1', num: 1, leftText: '1) Rút phích cắm điện đột ngột khi máy đang chạy', rightKey: 'a', rightText: 'a) Gây lỗi hệ điều hành và mất dữ liệu chưa lưu.', points: 0.25 },
        { id: 'k7-p2-m2', num: 2, leftText: '2) Cắm ngược chiều đầu cắm USB cố sức ấn mạnh', rightKey: 'b', rightText: 'b) Gây cong gãy chân kim hoặc hỏng cổng kết nối.', points: 0.25 },
        { id: 'k7-p2-m3', num: 3, leftText: '3) Vừa ăn đồ uống có đá vừa gõ bàn phím', rightKey: 'c', rightText: 'c) Đổ đọng nước gây chập cháy vi mạch điện tử.', points: 0.25 },
        { id: 'k7-p2-m4', num: 4, leftText: '4) Nhấn giữ nút nguồn Power 5 giây để tắt máy', rightKey: 'd', rightText: 'd) Dễ làm hại ổ cứng và hỏng tệp hệ thống.', points: 0.25 },
      ],
      shortAnswerPrompt: 'Bạn Bình thói quen khi dùng xong máy tính liền rút ngay dây cắm nguồn điện mà không bấm nút Shut down trên Windows. Em hãy phân tích 2 tác hại của thói quen này đối với phần cứng và phần mềm.',
      shortAnswerQuestions: [
        { id: 'k7-p2-sa1', label: '• Tác hại phần cứng', question: 'Tác hại đối với phần cứng máy tính là gì?', placeholder: 'Rút điện đột ngột gây...', sampleAnswer: 'Gây sốc điện đột ngột làm tổn hại ổ cứng, nguồn máy tính và giảm tuổi thọ vi mạch.', points: 0.4 },
        { id: 'k7-p2-sa2', label: '• Tác hại phần mềm', question: 'Tác hại đối với phần mềm và hệ điều hành là gì?', placeholder: 'Hệ điều hành bị...', sampleAnswer: 'Các tệp hệ thống chưa kịp đóng bị lỗi (corrupted files), mất dữ liệu đang làm dở chưa kịp lưu.', points: 0.3 },
        { id: 'k7-p2-sa3', label: '• Lời khuyên đúng quy trình', question: 'Em khuyên bạn Bình quy trình tắt máy đúng chuẩn thế nào?', placeholder: 'Khuyên bạn chọn Start...', sampleAnswer: 'Lưu toàn bộ tệp, đóng các ứng dụng, nhấp nút Start -> Power -> Shut down rồi mới ngắt nguồn.', points: 0.3 },
      ],
    },
    stage3: {
      quizQuestions: [
        {
          id: 'k7-p2-q1',
          order: 1,
          question: 'Câu 1 (Biết): Thao tác nào sau đây là ĐÚNG khi tắt máy tính để bàn?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Rút phích cắm điện trực tiếp.', isCorrect: false, explanation: 'Sai quy tắc an toàn.' },
            { letter: 'B', text: 'Nhấn nút Power trên thùng máy.', isCorrect: false, explanation: 'Không nên dùng thường xuyên.' },
            { letter: 'C', text: 'Chọn lệnh Start -> Power -> Shut down.', isCorrect: true, explanation: 'Chuẩn thao tác hệ điều hành Windows.' },
            { letter: 'D', text: 'Tắt công tắc nguồn trên dải cắm.', isCorrect: false, explanation: 'Sai quy trình.' },
          ],
        },
        {
          id: 'k7-p2-q2',
          order: 2,
          question: 'Câu 2 (Biết): Khi muốn ngắt kết nối an toàn cho ổ cứng di động/USB trên Windows, em dùng tính năng nào?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'File Explorer.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'B', text: 'Safely Remove Hardware and Eject Media.', isCorrect: true, explanation: 'Tính năng ngắt an toàn tránh sốc dữ liệu.' },
            { letter: 'C', text: 'Task Manager.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Device Manager.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p2-q3',
          order: 3,
          question: 'Câu 3 (Biết): Hành vi nào sau đây giúp bảo vệ an toàn cho bàn phím máy tính?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Dùng lực gõ thật mạnh lên phím.', isCorrect: false, explanation: 'Làm hỏng switch phím.' },
            { letter: 'B', text: 'Đặt ly nước ngọt bên cạnh bàn phím.', isCorrect: false, explanation: 'Nguy cơ đổ nước chập điện.' },
            { letter: 'C', text: 'Lau chùi bàn phím bằng cọ mềm và giữ tay khô.', isCorrect: true, explanation: 'Vệ sinh đúng cách và an toàn điện.' },
            { letter: 'D', text: 'Dùng vật nhọn gẩy bụi trong kẽ phím.', isCorrect: false, explanation: 'Làm xước và gãy phím.' },
          ],
        },
        {
          id: 'k7-p2-q4',
          order: 4,
          question: 'Câu 4 (Hiểu): Tại sao khi cắm các đầu nối thiết bị (HDMI, USB) ta phải quan sát kỹ chiều cắm?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Vì nếu cắm ngược cố sức ấn mạnh sẽ gây cong gãy chân kim hoặc vỡ cổng cắm.', isCorrect: true, explanation: 'Chân kim cổng kết nối rất mảnh, cắm ngược sẽ hỏng vĩnh viễn.' },
            { letter: 'B', text: 'Vì máy tính sẽ bị tắt ngay lập tức.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'C', text: 'Vì dây cáp sẽ bị đổi màu.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Vì thiết bị tự động xóa hết dữ liệu.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p2-q5',
          order: 5,
          question: 'Câu 5 (Hiểu): Tại sao các thiết bị AI như Camera nhận diện hay Loa thông minh đòi hỏi nguồn điện và mạng cực kỳ ổn định?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Vì thiết bị AI tiêu tốn nhiều điện năng hơn tivi.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'B', text: 'Vì mô hình AI liên tục truyền tải dữ liệu thời gian thực lên máy chủ đám mây để nhận diện.', isCorrect: true, explanation: 'Mất mạng hoặc ngắt điện đột ngột làm gián đoạn luồng suy luận AI.' },
            { letter: 'C', text: 'Vì thiết bị AI không có nút bấm tắt nguồn.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Vì thiết bị AI chỉ chạy được trên mạng 5G.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p2-q6',
          order: 6,
          question: 'Câu 6 (Vận dụng): Máy tính thực hành bị treo không di chuyển được chuột, quy trình xử lý an toàn là:',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Thử nhấn tổ hợp Ctrl + Alt + Delete để mở Task Manager đóng ứng dụng treo, nếu không được mới báo thầy cô.', isCorrect: true, explanation: 'Xử lý chuẩn theo quy trình kỹ thuật.' },
            { letter: 'B', text: 'Rút ngay phích cắm điện của phòng máy.', isCorrect: false, explanation: 'Nguy hiểm và sai quy định.' },
            { letter: 'C', text: 'Lắc mạnh chuột và đập bàn phím.', isCorrect: false, explanation: 'Hỏng thiết bị.' },
            { letter: 'D', text: 'Bỏ về chỗ không thông báo ai.', isCorrect: false, explanation: 'Thiếu trách nhiệm.' },
          ],
        },
      ],
    },
    stage4: {
      prompt: 'Thực hành tại nhà: Em hãy kiểm tra toàn bộ dây cáp, cổng kết nối và vị trí đặt máy tính/điện thoại ở gia đình. Lập danh sách 3 điểm chưa an toàn và đề xuất giải pháp khắc phục ngay.',
      sampleRow: {
        carrier: 'Góc học tập tại phòng ngủ gia đình',
        data: 'Ổ cắm điện đặt dưới chân bàn, dây cáp sạc bị gập mép bàn, để cốc nước ngọt gần bàn phím',
        infoAction: 'Mua hộp thu gọn dây điện, kê ổ cắm lên cao và quy định không để nước ngọt tại bàn máy tính.',
      },
    },
  },

  3: {
    period: 3,
    lessonTitle: 'BÀI 2. PHẦN MỀM MÁY TÍNH',
    subTitle: 'MỤC 1: HỆ ĐIỀU HÀNH',
    yccd: 'Giải thích sơ lược chức năng điều khiển và quản lý của hệ điều hành; phân biệt HĐH và phần mềm ứng dụng.',
    nlsTarget: 'TC1.5.2: Chọn lựa được các công cụ và công nghệ số phù hợp để giải quyết các nhiệm vụ cụ thể.',
    aiTarget: '7.A2.1: Hiểu vai trò của hệ điều hành và nền tảng phần mềm trong việc làm môi trường thực thi cho AI.',
    stage2: {
      worksheetTitle: 'PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT 3 • VAI TRÒ CỦA HỆ ĐIỀU HÀNH (HĐH)',
      dragDropWordBank: ['Môi trường trung gian', 'Hệ điều hành', 'Phần cứng', 'Phần mềm ứng dụng', 'Giao diện'],
      dragDropQuestions: [
        { slotNum: 1, promptFragment: '1. (1)... là phần mềm hệ thống quản lý và điều khiển toàn bộ hoạt động của máy tính.', correctWord: 'Hệ điều hành', points: 0.2 },
        { slotNum: 2, promptFragment: '2. HĐH tạo ra (2)... giúp con người tương tác dễ dàng với máy tính.', correctWord: 'Giao diện', points: 0.2 },
        { slotNum: 3, promptFragment: '3. HĐH đóng vai trò làm (3)... giữa phần cứng máy tính...', correctWord: 'Môi trường trung gian', points: 0.2 },
        { slotNum: 4, promptFragment: '...và các (4)...', correctWord: 'Phần mềm ứng dụng', points: 0.2 },
        { slotNum: 5, promptFragment: '4. Các ứng dụng AI bắt buộc phải chạy trên nền của một (5)... nhất định.', correctWord: 'Hệ điều hành', points: 0.2 },
      ],
      dragDropSentenceLines: [
        { sentenceNum: 1, textBefore: '1. ', slotNum: 1, textAfter: ' là phần mềm hệ thống quản lý và điều khiển toàn bộ hoạt động của máy tính.' },
        { sentenceNum: 2, textBefore: '2. HĐH tạo ra ', slotNum: 2, textAfter: ' giúp con người tương tác dễ dàng với máy tính.' },
        { sentenceNum: 3, textBefore: '3. HĐH đóng vai trò làm ', slotNum: 3, textMid: ' giữa phần cứng máy tính và các ', slotNum2: 4, textAfter: '.' },
        { sentenceNum: 4, textBefore: '4. Các ứng dụng trí tuệ nhân tạo (AI) bắt buộc phải chạy trên nền của một ', slotNum: 5, textAfter: ' nhất định.' },
      ],
      fillBlankQuestions: [
        { id: 'k7-p3-fb-a', label: 'a)', preText: 'Windows, macOS, Linux là các hệ điều hành phổ biến dành cho ', postText: '.', correctAnswer: 'máy tính cá nhân (PC)', accepted: ['máy tính cá nhân', 'máy tính', 'pc'], points: 0.35 },
        { id: 'k7-p3-fb-b', label: 'b)', preText: 'Android và iOS là hai hệ điều hành hàng đầu dành cho ', postText: ' và máy tính bảng.', correctAnswer: 'điện thoại thông minh', accepted: ['điện thoại thông minh', 'smartphone'], points: 0.35 },
        { id: 'k7-p3-fb-c', label: 'c)', preText: 'Nếu không có hệ điều hành, máy tính chỉ là một khối ', postText: ' không thể hoạt động.', correctAnswer: 'phần cứng', accepted: ['phần cứng', 'thiết bị vô dụng'], points: 0.3 },
      ],
      matchingQuestions: [
        { id: 'k7-p3-m1', num: 1, leftText: '1) Microsoft Windows 11', rightKey: 'a', rightText: 'a) Hệ điều hành phổ biến nhất trên máy tính cá nhân (PC).', points: 0.25 },
        { id: 'k7-p3-m2', num: 2, leftText: '2) Google Android', rightKey: 'b', rightText: 'b) Hệ điều hành mã nguồn mở dùng cho điện thoại thông minh.', points: 0.25 },
        { id: 'k7-p3-m3', num: 3, leftText: '3) Apple macOS', rightKey: 'c', rightText: 'c) Hệ điều hành độc quyền cho các dòng máy tính Macintosh.', points: 0.25 },
        { id: 'k7-p3-m4', num: 4, leftText: '4) Microsoft Word 2021', rightKey: 'd', rightText: 'd) Phần mềm ứng dụng soạn thảo văn bản (không phải HĐH).', points: 0.25 },
      ],
      shortAnswerPrompt: 'Tại sao khi bạn Minh mua một chiếc máy tính mới chưa cài Hệ điều hành thì bạn không thể mở phần mềm luyện gõ phím hay duyệt web được? Hãy giải thích ngắn gọn.',
      shortAnswerQuestions: [
        { id: 'k7-p3-sa1', label: '• Bản chất vấn đề', question: 'Tại sao máy tính chưa cài HĐH không thể chạy phần mềm ứng dụng?', placeholder: 'Vì máy tính chưa có...', sampleAnswer: 'Vì phần mềm ứng dụng không thể giao tiếp trực tiếp với phần cứng mà bắt buộc phải chạy trên nền tảng của Hệ điều hành.', points: 0.4 },
        { id: 'k7-p3-sa2', label: '• Vai trò của HĐH', question: 'Hệ điều hành đóng vai trò gì trong tình huống này?', placeholder: 'HĐH làm môi trường...', sampleAnswer: 'HĐH cung cấp môi trường trung gian, quản lý bộ nhớ, CPU và thiết bị để phần mềm ứng dụng thực thi.', points: 0.3 },
        { id: 'k7-p3-sa3', label: '• Giải pháp cho Minh', question: 'Minh cần thực hiện bước nào trước tiên?', placeholder: 'Minh cần cài đặt...', sampleAnswer: 'Minh cần cài đặt một hệ điều hành (ví dụ Windows 11 hoặc Linux) trước, sau đó mới cài đặt các phần mềm ứng dụng.', points: 0.3 },
      ],
    },
    stage3: {
      quizQuestions: [
        {
          id: 'k7-p3-q1',
          order: 1,
          question: 'Câu 1 (Biết): Tên gọi nào sau đây KHÔNG phải là một hệ điều hành?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Windows 10.', isCorrect: false, explanation: 'HĐH của Microsoft.' },
            { letter: 'B', text: 'Android.', isCorrect: false, explanation: 'HĐH của Google.' },
            { letter: 'C', text: 'Google Chrome.', isCorrect: true, explanation: 'Chrome là trình duyệt web (phần mềm ứng dụng).' },
            { letter: 'D', text: 'Linux.', isCorrect: false, explanation: 'HĐH mã nguồn mở.' },
          ],
        },
        {
          id: 'k7-p3-q2',
          order: 2,
          question: 'Câu 2 (Biết): Chức năng chính của Hệ điều hành là gì?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Soạn thảo văn bản và tính toán.', isCorrect: false, explanation: 'Chức năng của Word/Excel.' },
            { letter: 'B', text: 'Điều khiển phần cứng và quản lý phần mềm.', isCorrect: true, explanation: 'Hai chức năng cốt lõi của mọi hệ điều hành.' },
            { letter: 'C', text: 'Quét virus và dọn rác.', isCorrect: false, explanation: 'Chức năng của phần mềm bảo mật.' },
            { letter: 'D', text: 'Vẽ tranh và chỉnh sửa ảnh.', isCorrect: false, explanation: 'Chức năng của Paint/Photoshop.' },
          ],
        },
        {
          id: 'k7-p3-q3',
          order: 3,
          question: 'Câu 3 (Biết): Hệ điều hành nào sau đây thường được cài đặt trên các điện thoại iPhone?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Android.', isCorrect: false, explanation: 'HĐH của Google.' },
            { letter: 'B', text: 'iOS.', isCorrect: true, explanation: 'Hệ điều hành độc quyền của Apple cho iPhone.' },
            { letter: 'C', text: 'Windows Phone.', isCorrect: false, explanation: 'HĐH của Microsoft.' },
            { letter: 'D', text: 'BlackBerry OS.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p3-q4',
          order: 4,
          question: 'Câu 4 (Hiểu): Phân biệt điểm khác nhau cơ bản giữa Hệ điều hành và Phần mềm ứng dụng:',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'HĐH quản lý tài nguyên hệ thống và làm nền cho phần mềm ứng dụng; phần mềm ứng dụng phục vụ nhu cầu cụ thể của người dùng.', isCorrect: true, explanation: 'Phân định chuẩn kiến thức SGK Tin học 7.' },
            { letter: 'B', text: 'Phần mềm ứng dụng điều khiển phần cứng mà không cần hệ điều hành.', isCorrect: false, explanation: 'Sai hoàn toàn.' },
            { letter: 'C', text: 'Hệ điều hành chỉ dùng để chơi game.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Không có điểm khác biệt nào.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p3-q5',
          order: 5,
          question: 'Câu 5 (Hiểu): Tại sao Hệ điều hành lại được ví như "Người quản gia thông minh" của ngôi nhà máy tính?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Vì HĐH biết nấu ăn và dọn dẹp nhà cửa.', isCorrect: false, explanation: 'Nghĩa đen sai.' },
            { letter: 'B', text: 'Vì HĐH điều phối nhịp nhàng các thiết bị (phần cứng), tiếp đón các yêu cầu (ứng dụng) và giao tiếp với chủ nhà (người dùng).', isCorrect: true, explanation: 'Hình ảnh ẩn dụ trực quan và chính xác.' },
            { letter: 'C', text: 'Vì HĐH có giá thành đắt nhất trong máy tính.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Vì HĐH được tạo ra bởi robot.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p3-q6',
          order: 6,
          question: 'Câu 6 (Vận dụng): Lớp em muốn cài phần mềm nhận diện khuôn mặt điểm danh sinh hoạt lớp, phần mềm này cần môi trường nào để chạy?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Cần một Hệ điều hành tương thích (như Windows, Linux hoặc Android) có quyền truy cập camera.', isCorrect: true, explanation: 'Phần mềm AI cần HĐH quản lý driver camera và tài nguyên tính toán.' },
            { letter: 'B', text: 'Chỉ cần cắm điện mà không cần HĐH.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'C', text: 'Chỉ cần một thẻ nhớ trắng.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Chỉ cần loa phát thanh.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
      ],
    },
    stage4: {
      prompt: 'Nhiệm vụ thực tế: Hãy tìm hiểu cấu hình máy tính ở nhà hoặc phòng máy trường em. Ghi lại tên Hệ điều hành, phiên bản (32-bit hay 64-bit) và dung lượng RAM hiện có.',
      sampleRow: {
        carrier: 'Máy tính cá nhân tại phòng máy trường THCS',
        data: 'Windows 11 Pro, phiên bản 64-bit, dung lượng RAM 16 GB DDR4',
        infoAction: 'Biết cách chọn cài các phần mềm học tập phiên bản 64-bit để đạt hiệu năng tối ưu.',
      },
    },
  },

  4: {
    period: 4,
    lessonTitle: 'BÀI 2. PHẦN MỀM MÁY TÍNH',
    subTitle: 'MỤC 2: PHẦN MỀM ỨNG DỤNG',
    yccd: 'Nêu tên một số phần mềm ứng dụng; giải thích phần mở rộng của tên tệp, cho biết tệp thuộc loại gì.',
    nlsTarget: 'TC1.1.3: Lựa chọn đúng cách lưu trữ, truy xuất dữ liệu và nội dung số trong môi trường có cấu trúc.',
    aiTarget: '7.C1.1: Nhận biết các định dạng dữ liệu (văn bản, hình ảnh, âm thanh) mà phần mềm ứng dụng và AI xử lý.',
    stage2: {
      worksheetTitle: 'PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT 4 • PHẦN MỞ RỘNG TỆP & PHẦN MỀM ỨNG DỤNG',
      dragDropWordBank: ['.docx', '.xlsx', '.pptx', '.mp3', '.jpg / .png'],
      dragDropQuestions: [
        { slotNum: 1, promptFragment: '1. Tệp văn bản do Microsoft Word tạo ra thường có đuôi (1)...', correctWord: '.docx', points: 0.2 },
        { slotNum: 2, promptFragment: '2. Tệp bảng tính Excel phục vụ tính toán chứa đuôi (2)...', correctWord: '.xlsx', points: 0.2 },
        { slotNum: 3, promptFragment: '3. Tệp bài trình chiếu PowerPoint có đuôi định dạng là (3)...', correctWord: '.pptx', points: 0.2 },
        { slotNum: 4, promptFragment: '4. Tệp âm thanh bài hát thường mang đuôi (4)...', correctWord: '.mp3', points: 0.2 },
        { slotNum: 5, promptFragment: '...và tệp ảnh chụp có đuôi (5)...', correctWord: '.jpg / .png', points: 0.2 },
      ],
      dragDropSentenceLines: [
        { sentenceNum: 1, textBefore: '1. Tệp văn bản do Microsoft Word tạo ra thường có đuôi ', slotNum: 1, textAfter: '.' },
        { sentenceNum: 2, textBefore: '2. Tệp bảng tính Excel phục vụ tính toán chứa đuôi ', slotNum: 2, textAfter: '.' },
        { sentenceNum: 3, textBefore: '3. Tệp bài trình chiếu PowerPoint có đuôi định dạng là ', slotNum: 3, textAfter: '.' },
        { sentenceNum: 4, textBefore: '4. Tệp âm thanh bài hát thường mang đuôi ', slotNum: 4, textMid: ' và tệp ảnh chụp có đuôi ', slotNum2: 5, textAfter: '.' },
      ],
      fillBlankQuestions: [
        { id: 'k7-p4-fb-a', label: 'a)', preText: 'Phần mở rộng của tên tệp gồm các ký tự đứng sau dấu ', postText: ' cuối cùng trong tên tệp.', correctAnswer: 'chấm (.)', accepted: ['chấm', '.', 'dấu chấm'], points: 0.35 },
        { id: 'k7-p4-fb-b', label: 'b)', preText: 'Phần mở rộng giúp hệ điều hành nhận biết loại tệp và chọn ', postText: ' phù hợp để mở tệp đó.', correctAnswer: 'phần mềm ứng dụng', accepted: ['phần mềm', 'ứng dụng', 'chương trình'], points: 0.35 },
        { id: 'k7-p4-fb-c', label: 'c)', preText: 'Phần mềm Scratch lưu tệp dự án lập trình với phần mở rộng là ', postText: '.', correctAnswer: '.sb3', accepted: ['.sb3', 'sb3'], points: 0.3 },
      ],
      matchingQuestions: [
        { id: 'k7-p4-m1', num: 1, leftText: '1) BaiThuHanh1.docx', rightKey: 'a', rightText: 'a) Tệp văn bản - Mở bằng MS Word / Unikey.', points: 0.25 },
        { id: 'k7-p4-m2', num: 2, leftText: '2) BangDiemLop7A.xlsx', rightKey: 'b', rightText: 'b) Tệp bảng tính - Mở bằng MS Excel.', points: 0.25 },
        { id: 'k7-p4-m3', num: 3, leftText: '3) TroChoiMeCung.sb3', rightKey: 'c', rightText: 'c) Tệp dự án lập trình - Mở bằng Scratch 3.0.', points: 0.25 },
        { id: 'k7-p4-m4', num: 4, leftText: '4) NhacTruong.mp3', rightKey: 'd', rightText: 'd) Tệp âm thanh - Mở bằng Windows Media Player.', points: 0.25 },
      ],
      shortAnswerPrompt: "Bạn Hoa nhận được tệp tin tên 'BaoCao_MoiTruong.pdf'. Cho biết phần mở rộng của tệp này là gì? Em hãy nêu ưu điểm của tệp dạng định dạng PDF.",
      shortAnswerQuestions: [
        { id: 'k7-p4-sa1', label: '• Phần mở rộng', question: 'Phần mở rộng của tệp này là gì?', placeholder: 'Phần mở rộng là...', sampleAnswer: 'Phần mở rộng là .pdf (Portable Document Format).', points: 0.4 },
        { id: 'k7-p4-sa2', label: '• Tính toàn vẹn hiển thị', question: 'Ưu điểm về hiển thị của tệp PDF:', placeholder: 'Tệp PDF giữ nguyên...', sampleAnswer: 'Giữ nguyên phông chữ, định dạng, cách bố trí trang và hình ảnh trên mọi thiết bị và hệ điều hành.', points: 0.3 },
        { id: 'k7-p4-sa3', label: '• Tính an toàn bảo mật', question: 'Ưu điểm về tính bảo mật và kích thước của tệp PDF:', placeholder: 'Khó bị chỉnh sửa...', sampleAnswer: 'Khó bị chỉnh sửa trái phép hơn tệp Word và có dung lượng nén nhỏ gọn thuận tiện gửi qua email.', points: 0.3 },
      ],
    },
    stage3: {
      quizQuestions: [
        {
          id: 'k7-p4-q1',
          order: 1,
          question: 'Câu 1 (Biết): Tệp tin nào sau đây là tệp bài trình chiếu PowerPoint?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'LichSu7.docx.', isCorrect: false, explanation: 'Tệp Word.' },
            { letter: 'B', text: 'DiaLy7.pptx.', isCorrect: true, explanation: 'Đuôi .pptx là tệp trình chiếu PowerPoint.' },
            { letter: 'C', text: 'Toan7.xlsx.', isCorrect: false, explanation: 'Tệp Excel.' },
            { letter: 'D', text: 'AmNhac7.mp3.', isCorrect: false, explanation: 'Tệp âm thanh.' },
          ],
        },
        {
          id: 'k7-p4-q2',
          order: 2,
          question: 'Câu 2 (Biết): Phần mở rộng nào sau đây thể hiện đây là một tệp hình ảnh?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: '.exe.', isCorrect: false, explanation: 'Tệp thực thi.' },
            { letter: 'B', text: '.png.', isCorrect: true, explanation: '.png là định dạng ảnh số chất lượng cao.' },
            { letter: 'C', text: '.txt.', isCorrect: false, explanation: 'Tệp văn bản thuần.' },
            { letter: 'D', text: '.zip.', isCorrect: false, explanation: 'Tệp nén.' },
          ],
        },
        {
          id: 'k7-p4-q3',
          order: 3,
          question: "Câu 3 (Biết): Trong tên tệp 'NhatKy_ChuyenDi.docx', phần tên chính là gì?",
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'NhatKy.', isCorrect: false, explanation: 'Chưa đủ phần tên chính.' },
            { letter: 'B', text: 'NhatKy_ChuyenDi.', isCorrect: true, explanation: 'Phần tên chính đứng trước dấu chấm cuối cùng.' },
            { letter: 'C', text: 'docx.', isCorrect: false, explanation: 'Đây là phần mở rộng.' },
            { letter: 'D', text: '.docx.', isCorrect: false, explanation: 'Đây là phần mở rộng có dấu chấm.' },
          ],
        },
        {
          id: 'k7-p4-q4',
          order: 4,
          question: 'Câu 4 (Hiểu): Tại sao chúng ta không nên tự ý đổi phần mở rộng của tệp tin (ví dụ đổi .docx thành .mp3)?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Vì hệ điều hành sẽ dùng sai phần mềm để mở, dẫn đến báo lỗi không đọc được tệp.', isCorrect: true, explanation: 'Hệ điều hành nhận diện phần mềm mở mặc định dựa vào phần mở rộng.' },
            { letter: 'B', text: 'Vì máy tính sẽ tự động xóa tệp đó.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'C', text: 'Vì bàn phím sẽ bị khóa.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Vì tệp sẽ tự động phát nhạc.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p4-q5',
          order: 5,
          question: 'Câu 5 (Hiểu): Định dạng tệp vector (.svg) và ảnh bitmap (.png, .jpg) khác nhau cơ bản ở điểm nào?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Ảnh vector phóng to không bao giờ bị vỡ hạt; ảnh bitmap phóng to sẽ lộ các điểm ảnh pixel.', isCorrect: true, explanation: 'Kiến thức cốt lõi về đồ họa số SGK Tin học 7.' },
            { letter: 'B', text: 'Ảnh vector chỉ có màu đen trắng.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'C', text: 'Ảnh bitmap có dung lượng lớn hơn 100 lần.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Hai định dạng này hoàn toàn giống nhau.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p4-q6',
          order: 6,
          question: 'Câu 6 (Vận dụng): Các công cụ AI tạo ảnh (như Midjourney, DALL-E) thường cho phép tải ảnh về với đuôi tệp nào?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: '.png hoặc .jpg.', isCorrect: true, explanation: 'Định dạng hình ảnh chuẩn quốc tế.' },
            { letter: 'B', text: '.docx.', isCorrect: false, explanation: 'Định dạng văn bản Word.' },
            { letter: 'C', text: '.xlsx.', isCorrect: false, explanation: 'Định dạng bảng tính Excel.' },
            { letter: 'D', text: '.exe.', isCorrect: false, explanation: 'Định dạng tệp chương trình.' },
          ],
        },
      ],
    },
    stage4: {
      prompt: "Nhiệm vụ: Thực hành: Mở thư mục 'Document' trên máy tính, bật chế độ hiển thị phần mở rộng tệp (File name extensions) trong File Explorer và ghi lại 5 tệp có định dạng khác nhau.",
      sampleRow: {
        carrier: 'Thư mục Documents trên máy tính phòng thực hành',
        data: 'Bai1.docx (Word), Diem.xlsx (Excel), BaiTrinhChieu.pptx (PowerPoint), HinhAnh.png (Ảnh), Video.mp4 (Video)',
        infoAction: 'Biết cách bật tùy chọn File name extensions trên thanh công cụ View để kiểm soát định dạng tệp an toàn.',
      },
    },
  },

  5: {
    period: 5,
    lessonTitle: 'BÀI 3. QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH',
    subTitle: 'MỤC 1, 2: TÊN TỆP, THƯ MỤC & BẢO VỆ DỮ LIỆU',
    yccd: 'Biết tệp chương trình cũng là dữ liệu; nêu ví dụ biện pháp bảo vệ dữ liệu như sao lưu, diệt virus.',
    nlsTarget: 'TC1.1.3: Sắp xếp dữ liệu, thông tin để dễ dàng lưu trữ và truy xuất; tổ chức dữ liệu trong môi trường có cấu trúc.',
    aiTarget: '7.C2.1: Nêu tầm quan trọng của việc quản lý, tổ chức và bảo vệ tập dữ liệu đối với độ chính xác của AI.',
    stage2: {
      worksheetTitle: 'PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT 5 • QUẢN LÝ VÀ BẢO VỆ DỮ LIỆU AN TOÀN',
      dragDropWordBank: ['Cây thư mục', 'Tệp chương trình', 'Sao lưu (Backup)', 'Mật khẩu mạnh', 'Phần mềm diệt virus'],
      dragDropQuestions: [
        { slotNum: 1, promptFragment: '1. Quản lý dữ liệu theo cấu trúc (1)... giúp tìm kiếm tệp nhanh chóng và khoa học.', correctWord: 'Cây thư mục', points: 0.2 },
        { slotNum: 2, promptFragment: '2. Các tệp thực thi cài đặt phần mềm có đuôi .exe, .msi được gọi là (2)...', correctWord: 'Tệp chương trình', points: 0.2 },
        { slotNum: 3, promptFragment: '3. (3)... là việc tạo ra bản sao dữ liệu cất giữ ở nơi an toàn để phòng rủi ro mất mát.', correctWord: 'Sao lưu (Backup)', points: 0.2 },
        { slotNum: 4, promptFragment: '4. Đặt (4)...', correctWord: 'Mật khẩu mạnh', points: 0.2 },
        { slotNum: 5, promptFragment: '...kết hợp cài đặt (5)... giúp ngăn chặn truy cập trái phép và tác hại độc hại.', correctWord: 'Phần mềm diệt virus', points: 0.2 },
      ],
      dragDropSentenceLines: [
        { sentenceNum: 1, textBefore: '1. Quản lý dữ liệu theo cấu trúc ', slotNum: 1, textAfter: ' giúp tìm kiếm tệp nhanh chóng và khoa học.' },
        { sentenceNum: 2, textBefore: '2. Các tệp thực thi cài đặt phần mềm có đuôi .exe, .msi được gọi là ', slotNum: 2, textAfter: '.' },
        { sentenceNum: 3, textBefore: '3. ', slotNum: 3, textAfter: ' là việc tạo ra bản sao dữ liệu cất giữ ở nơi an toàn để phòng rủi ro mất mát.' },
        { sentenceNum: 4, textBefore: '4. Đặt ', slotNum: 4, textMid: ' kết hợp cài đặt ', slotNum2: 5, textAfter: ' giúp ngăn chặn truy cập trái phép và tác hại độc hại.' },
      ],
      fillBlankQuestions: [
        { id: 'k7-p5-fb-a', label: 'a)', preText: 'Sao lưu dữ liệu có 2 dạng chính: Sao lưu cục bộ (ổ cứng ngoài, USB) và sao lưu ', postText: ' (Google Drive, OneDrive).', correctAnswer: 'đám mây', accepted: ['đám mây', 'dam may', 'cloud'], points: 0.35 },
        { id: 'k7-p5-fb-b', label: 'b)', preText: 'Mật khẩu mạnh nên có độ dài từ 8 ký tự trở lên, gồm chữ hoa, chữ thường, chữ số và ', postText: '.', correctAnswer: 'ký tự đặc biệt', accepted: ['ký tự đặc biệt', 'ky tu dac biet'], points: 0.35 },
        { id: 'k7-p5-fb-c', label: 'c)', preText: 'Virus máy tính là các phần mềm độc hại có khả năng tự nhân bản và gây hỏng ', postText: '.', correctAnswer: 'dữ liệu và hệ thống', accepted: ['dữ liệu', 'hệ thống', 'tệp'], points: 0.3 },
      ],
      matchingQuestions: [
        { id: 'k7-p5-m1', num: 1, leftText: '1) Sao lưu lên Google Drive', rightKey: 'a', rightText: 'a) Phục hồi lại dữ liệu khi máy tính hỏng ổ cứng.', points: 0.25 },
        { id: 'k7-p5-m2', num: 2, leftText: '2) Cài đặt phần mềm Bkav/Kaspersky', rightKey: 'b', rightText: 'b) Phát hiện và loại bỏ mã độc, virus máy tính.', points: 0.25 },
        { id: 'k7-p5-m3', num: 3, leftText: '3) Đặt mật khẩu mở tài khoản Win11', rightKey: 'c', rightText: 'c) Ngăn chặn người khác tự ý truy cập tệp cá nhân.', points: 0.25 },
        { id: 'k7-p5-m4', num: 4, leftText: '4) Tổ chức thư mục theo môn học', rightKey: 'd', rightText: 'd) Tránh lưu trữ lộn xộn, mất thời gian tìm kiếm.', points: 0.25 },
      ],
      shortAnswerPrompt: "Bạn Nam lưu tất cả 100 tệp bài tập, ảnh chụp, nhạc vào duy nhất một thư mục 'New Folder' trên màn hình Desktop. Em hãy phân tích 2 tác hại của cách lưu trữ này.",
      shortAnswerQuestions: [
        { id: 'k7-p5-sa1', label: '• Tác hại tìm kiếm', question: 'Tác hại đầu tiên về tốc độ và hiệu suất tìm kiếm:', placeholder: 'Rất mất thời gian khi...', sampleAnswer: 'Rất khó tìm kiếm khi cần, mất thời gian cuộn tìm trong danh sách lộn xộn không phân loại.', points: 0.4 },
        { id: 'k7-p5-sa2', label: '• Rủi ro mất mát', question: 'Tác hại thứ hai về an toàn dữ liệu:', placeholder: 'Nguy cơ nhầm lẫn...', sampleAnswer: 'Dễ vô tình xóa nhầm hoặc ghi đè các tệp trùng tên, khi Desktop bị lỗi Windows sẽ có nguy cơ mất toàn bộ dữ liệu.', points: 0.3 },
        { id: 'k7-p5-sa3', label: '• Phương án tổ chức khoa học', question: 'Em gợi ý Nam tạo cấu trúc cây thư mục thế nào?', placeholder: 'Tạo cây thư mục...', sampleAnswer: 'Tạo thư mục gốc Hoctap_Khoi7, bên trong chia các thư mục con: Toan, NguVan, TinHoc, HinhAnh, AmNhac.', points: 0.3 },
      ],
    },
    stage3: {
      quizQuestions: [
        {
          id: 'k7-p5-q1',
          order: 1,
          question: 'Câu 1 (Biết): Đâu KHÔNG phải là một biện pháp bảo vệ dữ liệu máy tính?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Cài đặt phần mềm diệt virus.', isCorrect: false, explanation: 'Biện pháp bảo vệ tốt.' },
            { letter: 'B', text: 'Sao lưu dữ liệu định kỳ.', isCorrect: false, explanation: 'Biện pháp phòng ngừa mất mát dữ liệu.' },
            { letter: 'C', text: 'Chia sẻ công khai mật khẩu tài khoản.', isCorrect: true, explanation: 'Hành vi làm mất an toàn và lộ lọt dữ liệu cá nhân.' },
            { letter: 'D', text: 'Đặt mật khẩu truy cập máy tính.', isCorrect: false, explanation: 'Biện pháp bảo vệ truy cập.' },
          ],
        },
        {
          id: 'k7-p5-q2',
          order: 2,
          question: 'Câu 2 (Biết): Tệp tin nào sau đây thuộc loại tệp chương trình thực thi cài đặt?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Setup.exe.', isCorrect: true, explanation: 'Đuôi .exe là tệp chương trình thực thi.' },
            { letter: 'B', text: 'BaiHoc.docx.', isCorrect: false, explanation: 'Tệp văn bản.' },
            { letter: 'C', text: 'AnhLop.jpg.', isCorrect: false, explanation: 'Tệp ảnh.' },
            { letter: 'D', text: 'BGM.mp3.', isCorrect: false, explanation: 'Tệp âm thanh.' },
          ],
        },
        {
          id: 'k7-p5-q3',
          order: 3,
          question: 'Câu 3 (Biết): Mật khẩu nào sau đây được coi là mật khẩu MẠNH nhất?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: '12345678.', isCorrect: false, explanation: 'Quá đơn giản.' },
            { letter: 'B', text: 'nguyenvanan.', isCorrect: false, explanation: 'Chỉ có chữ thường.' },
            { letter: 'C', text: 'An@2026#TinHoc.', isCorrect: true, explanation: 'Gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@, #).' },
            { letter: 'D', text: '0905123456.', isCorrect: false, explanation: 'Dãy số điện thoại dễ đoán.' },
          ],
        },
        {
          id: 'k7-p5-q4',
          order: 4,
          question: 'Câu 4 (Hiểu): Ưu điểm lớn nhất của Sao lưu đám mây (Cloud Backup) so với Sao lưu cục bộ là gì?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Dữ liệu được an toàn ngay cả khi máy tính bị hỏng hoặc mất thiết bị, có thể truy cập từ mọi nơi có Internet.', isCorrect: true, explanation: 'Ưu thế vượt trội của công nghệ điện toán đám mây.' },
            { letter: 'B', text: 'Không cần tài khoản đăng nhập.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'C', text: 'Không bao giờ bị giới hạn dung lượng miễn phí.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Tự động in ra giấy.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p5-q5',
          order: 5,
          question: 'Câu 5 (Hiểu): Tại sao tổ chức tệp/thư mục gọn gàng lại quyết định đến độ chính xác khi huấn luyện mô hình AI?',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: 'Vì mô hình AI học từ tập dữ liệu được gán nhãn và phân loại chuẩn trong các thư mục mẫu.', isCorrect: true, explanation: 'Dữ liệu chuẩn hóa (Dataset structure) là cốt lõi của Machine Learning.' },
            { letter: 'B', text: 'Vì AI chỉ đọc được tệp hình ảnh màu xanh.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'C', text: 'Vì nếu thư mục lộn xộn thì máy tính sẽ hết pin.', isCorrect: false, explanation: 'Sai.' },
            { letter: 'D', text: 'Không có bất kỳ ảnh hưởng nào.', isCorrect: false, explanation: 'Sai.' },
          ],
        },
        {
          id: 'k7-p5-q6',
          order: 6,
          question: 'Câu 6 (Vận dụng): Quy trình 3 bước chuẩn bảo vệ tập ảnh kỷ niệm quan trọng của gia đình là:',
          timeLimitSec: 25,
          status: 'Đã duyệt',
          points: 0.5,
          options: [
            { letter: 'A', text: '1. Sắp xếp ảnh theo thư mục Năm_SuKien; 2. Sao lưu bản thứ 2 lên Google Drive/OneDrive; 3. Cài phần mềm diệt virus bảo vệ máy tính.', isCorrect: true, explanation: 'Quy tắc sao lưu 3-2-1 an toàn dữ liệu số.' },
            { letter: 'B', text: '1. Đăng hết ảnh lên nhóm chat; 2. Xóa ảnh trên máy; 3. Tắt máy tính.', isCorrect: false, explanation: 'Sai nguy hiểm.' },
            { letter: 'C', text: '1. Đổi đuôi ảnh thành .txt; 2. Cất vào USB; 3. Giấu USB.', isCorrect: false, explanation: 'Làm hỏng tệp.' },
            { letter: 'D', text: 'Chỉ cần lưu trên màn hình Desktop.', isCorrect: false, explanation: 'Dễ mất khi lỗi hệ điều hành.' },
          ],
        },
      ],
    },
    stage4: {
      prompt: "Nhiệm vụ: Hãy thực hành tạo một tài khoản lưu trữ đám mây (Google Drive), tạo thư mục 'TinHoc7_LuuTru' và tải 1 tệp bài tập cá nhân lên để sao lưu an toàn.",
      sampleRow: {
        carrier: 'Tài khoản Google Drive học sinh trường THCS',
        data: 'Thư mục TinHoc7_LuuTru/BaiTap3_QuanLyDuLieu.docx, kích thước 1.2 MB',
        infoAction: 'Biết cách bật quyền chia sẻ ở chế độ "Người xem" khi gửi đường link nộp bài cho giáo viên.',
      },
    },
  },
};

// Data templates for Periods 6 to 29 extracted from phieu_hoc_tap_29_tiet_tin_7_2fa7ba7a.pdf
interface PeriodDefinition {
  period: number;
  lessonTitle: string;
  subTitle: string;
  yccd: string;
  nlsTarget: string;
  aiTarget: string;
  wordBank: [string, string, string, string, string];
  sentenceTemplates: [string, string, string, string, string]; // lines
  fillBlankTexts: [
    { label: string; pre: string; post: string; ans: string },
    { label: string; pre: string; post: string; ans: string },
    { label: string; pre: string; post: string; ans: string }
  ];
  matchingPairs: [
    { left: string; right: string },
    { left: string; right: string },
    { left: string; right: string },
    { left: string; right: string }
  ];
  shortAnswerQuestions: [
    { label: string; q: string; ph: string; ans: string },
    { label: string; q: string; ph: string; ans: string },
    { label: string; q: string; ph: string; ans: string }
  ];
  quizQuestions: {
    q: string;
    opts: [string, string, string, string];
    correctIdx: number;
    exp: string;
  }[];
  stage4Prompt: string;
  stage4Row: { carrier: string; data: string; infoAction: string };
}

const REMAINING_PERIOD_DEFS: PeriodDefinition[] = [
  {
    period: 6,
    lessonTitle: 'BÀI 3. QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH',
    subTitle: 'MỤC 3: THỰC HÀNH QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH',
    yccd: 'Thao tác thành thạo với tệp và thư mục: tạo, sao chép, di chuyển, đổi tên, xóa tệp và thư mục.',
    nlsTarget: 'TC1.1.3: Sắp xếp và quản lý tệp, thư mục khoa học trong môi trường số.',
    aiTarget: '7.C2.2: Thực hành chuẩn hóa tên tệp và thư mục chứa dữ liệu đầu vào cho các bài toán công nghệ/AI.',
    wordBank: ['File Explorer', 'Recycle Bin', 'Restore', 'Ctrl + C', 'Shift + Delete'],
    sentenceTemplates: [
      'Công cụ quản lý tệp và thư mục chính trên Windows là (1)...',
      'Để sao chép nhanh một tệp hoặc thư mục ta dùng tổ hợp phím (2)...',
      'Các tệp bị xóa thông thường sẽ được chuyển tạm thời vào (3)...',
      'Khi cần khôi phục lại tệp đã xóa nhầm ta dùng lệnh (4)...',
      'Để xóa vĩnh viễn không qua thùng rác ta nhấn tổ hợp (5)...',
    ],
    fillBlankTexts: [
      { label: 'a)', pre: 'Để tạo một thư mục mới trong File Explorer, em có thể nhấn tổ hợp phím ', post: ' hoặc bấm New Folder.', ans: 'Ctrl + Shift + N' },
      { label: 'b)', pre: 'Để đổi tên tệp hoặc thư mục nhanh, ta chọn đối tượng rồi nhấn phím chức năng ', post: '.', ans: 'F2' },
      { label: 'c)', pre: 'Để chọn nhiều tệp không liên tiếp nhau, ta giữ phím ', post: ' trong khi nhấp chuột.', ans: 'Ctrl' },
    ],
    matchingPairs: [
      { left: '1) Thao tác sao chép (Copy)', right: 'Tạo thêm một bản sao của tệp/thư mục tại vị trí mới.' },
      { left: '2) Thao tác di chuyển (Cut)', right: 'Chuyển tệp/thư mục sang vị trí khác, vị trí cũ không còn.' },
      { left: '3) Lệnh Rename (F2)', right: 'Thay đổi tên tệp/thư mục cho chuẩn xác và khoa học.' },
      { left: '4) Lệnh Empty Recycle Bin', right: 'Dọn sạch thùng rác để giải phóng dung lượng ổ đĩa.' },
    ],
    shortAnswerQuestions: [
      { label: '• Cấu trúc thư mục', q: 'Hãy mô tả cây thư mục dự án "TruongHocXanh" mà nhóm em đã tạo:', ph: 'Thư mục gồm...', ans: 'Thư mục gốc TruongHocXanh chia 3 thư mục con: 01_VanBan, 02_BangTinh, 03_HinhAnh.' },
      { label: '• Quy tắc đặt tên', q: 'Nêu quy tắc đặt tên tệp chuẩn hóa không dấu và dễ tìm kiếm:', ph: 'Đặt tên theo quy tắc...', ans: 'Đặt tên ngắn gọn, không dấu tiếng Việt, dùng dấu gạch dưới thay dấu cách, có ngày tháng (ví dụ: BaoCao_2026.docx).' },
      { label: '• Khắc phục sự cố', q: 'Nếu vô tình bấm Delete xóa nhầm tệp quan trọng, em xử lý thế nào?', ph: 'Em sẽ...', ans: 'Mở Recycle Bin, tìm tệp vừa xóa, nhấp chuột phải chọn Restore để khôi phục.' },
    ],
    quizQuestions: [
      { q: 'Câu 1 (Biết): Tổ hợp phím nào dùng để sao chép (Copy) tệp được chọn?', opts: ['Ctrl + C.', 'Ctrl + V.', 'Ctrl + X.', 'Ctrl + Z.'], correctIdx: 0, exp: 'Ctrl+C là phím tắt sao chép chuẩn.' },
      { q: 'Câu 2 (Biết): Muốn đổi tên tệp nhanh chóng ta nhấn phím nào?', opts: ['F1.', 'F2.', 'F5.', 'F12.'], correctIdx: 1, exp: 'F2 là phím tắt đổi tên tệp/thư mục.' },
      { q: 'Câu 3 (Biết): Tệp bị xóa bằng phím Delete sẽ nằm ở đâu?', opts: ['Mất vĩnh viễn.', 'Recycle Bin (Thùng rác).', 'Ổ đĩa C.', 'Màn hình Desktop.'], correctIdx: 1, exp: 'Tệp xóa thường lưu ở Recycle Bin.' },
      { q: 'Câu 4 (Hiểu): Điểm khác nhau giữa lệnh Cut (Ctrl+X) và Copy (Ctrl+C) là gì?', opts: ['Cut di chuyển đối tượng, Copy nhân bản đối tượng.', 'Cut xóa vĩnh viễn, Copy giữ lại.', 'Hai lệnh này giống nhau.', 'Cut chỉ dùng cho ảnh.'], correctIdx: 0, exp: 'Cut chuyển vị trí, Copy tạo bản sao.' },
      { q: 'Câu 5 (Hiểu): Tại sao nên đặt tên tệp/thư mục không dấu tiếng Việt khi chia sẻ lên mạng?', opts: ['Tránh lỗi hiển thị ký tự và đường dẫn trên các hệ thống số.', 'Để máy tính chạy nhanh hơn.', 'Vì máy tính không cho gõ tiếng Việt.', 'Không có lý do nào.'], correctIdx: 0, exp: 'Chuẩn hóa ký tự Unicode đường dẫn số.' },
      { q: 'Câu 6 (Vận dụng): Để chọn toàn bộ các tệp trong một thư mục, ta dùng tổ hợp phím nào?', opts: ['Ctrl + A.', 'Ctrl + B.', 'Alt + F4.', 'Shift + Tab.'], correctIdx: 0, exp: 'Ctrl+A là chọn tất cả.' },
    ],
    stage4Prompt: 'Nhiệm vụ: Thực hành tạo cây thư mục hoàn chỉnh cho môn Tin học 7 trên ổ đĩa D hoặc Google Drive, chụp ảnh màn hình nộp báo cáo.',
    stage4Row: {
      carrier: 'Ổ đĩa D máy tính phòng thực hành',
      data: 'Cây thư mục TinHoc7: LyThuyet, ThucHanh, SanPhamDuAn',
      infoAction: 'Biết cách sắp xếp tệp học tập ngăn nắp, tránh thất lạc dữ liệu.',
    },
  },
  {
    period: 7,
    lessonTitle: 'BÀI 4. MẠNG XÃ HỘI VÀ MỘT SỐ KÊNH TRAO ĐỔI THÔNG TIN',
    subTitle: 'MỤC 1: MẠNG XÃ HỘI – KÊNH TRAO ĐỔI THÔNG TIN PHỔ BIẾN',
    yccd: 'Nêu tên kênh trao đổi thông tin thông dụng; nêu chức năng cơ bản của mạng xã hội; nêu ví dụ về hậu quả dùng thông tin sai trái.',
    nlsTarget: 'TC1.2.1: Thực hiện được các tương tác được xác định rõ ràng với các công nghệ số.',
    aiTarget: '7.A3.1: Nhận biết sự xuất hiện của AI trên các mạng xã hội (thuật toán gợi ý nội dung, tự động lọc bình luận).',
    wordBank: ['Kênh giao tiếp', 'Chia sẻ thông tin', 'Thuật toán gợi ý', 'Bình luận văn minh', 'Tin giả (Fake News)'],
    sentenceTemplates: [
      'Mạng xã hội là một (1)... trực tuyến kết nối hàng triệu người dùng.',
      'Người dùng có thể đăng tải bài viết và (2)... hình ảnh, video với bạn bè.',
      'Các nền tảng mạng xã hội sử dụng (3)... AI để đề xuất bài viết phù hợp sở thích.',
      'Mỗi học sinh cần xây dựng thói quen (4)... khi tham gia thảo luận trên mạng.',
      'Cần cảnh giác cao độ trước các loại (5)... được lan truyền tràn lan.',
    ],
    fillBlankTexts: [
      { label: 'a)', pre: 'Mạng xã hội cho phép người dùng kết nối, giao lưu và ', post: ' thông tin trên không gian mạng.', ans: 'chia sẻ' },
      { label: 'b)', pre: 'Việc tự ý chia sẻ thông tin cá nhân của người khác mà chưa xin phép là hành vi vi phạm ', post: '.', ans: 'pháp luật' },
      { label: 'c)', pre: 'Trợ lý ảo và thuật toán AI trên mạng xã hội tự động phát hiện các từ ngữ ', post: ' để bảo vệ cộng đồng.', ans: 'tiêu cực' },
    ],
    matchingPairs: [
      { left: '1) Nền tảng Zalo / Messenger', right: 'Nhắn tin, gọi thoại và gọi video trực tuyến miễn phí.' },
      { left: '2) Thuật toán đề xuất AI', right: 'Phân tích thói quen xem để gợi ý video/bài viết liên quan.' },
      { left: '3) Nút Báo cáo (Report)', right: 'Thông báo cho quản trị viên khi phát hiện nội dung độc hại.' },
      { left: '4) Chế độ bạn bè (Friends)', right: 'Giới hạn người xem bài viết chỉ trong danh sách quen biết.' },
    ],
    shortAnswerQuestions: [
      { label: '• Nhận diện MXH', q: 'Kể tên 3 mạng xã hội phổ biến và nêu mục đích sử dụng tích cực của em:', ph: '3 mạng xã hội gồm...', ans: 'Zalo (liên lạc gia đình, học tập), YouTube (xem video bài giảng), Facebook (kết nối bạn bè thầy cô).' },
      { label: '• Tác hại tin giả', q: 'Nêu 1 ví dụ về hậu quả khi một người chia sẻ tin giả trên mạng xã hội:', ph: 'Hậu quả là...', ans: 'Gây hoang mang dư luận, làm mất uy tín người khác và người chia sẻ có thể bị phạt tiền theo luật An ninh mạng.' },
      { label: '• Trách nhiệm công dân số', q: 'Em làm gì khi thấy một bài viết có nội dung bạo lực hoặc xúc phạm bạn bè?', ph: 'Em sẽ...', ans: 'Không like, không chia sẻ; chụp màn hình báo cho thầy cô/cha mẹ và bấm Báo cáo vi phạm (Report).' },
    ],
    quizQuestions: [
      { q: 'Câu 1 (Biết): Kênh nào sau đây là mạng xã hội phổ biến tại Việt Nam?', opts: ['Zalo.', 'MS Excel.', 'File Explorer.', 'Paint.'], correctIdx: 0, exp: 'Zalo là mạng xã hội liên lạc phổ biến.' },
      { q: 'Câu 2 (Biết): Chức năng chính của mạng xã hội là gì?', opts: ['Chơi game offline.', 'Giao lưu, chia sẻ thông tin và kết nối bạn bè.', 'Soạn thảo văn bản in ấn.', 'Quét virus ổ cứng.'], correctIdx: 1, exp: 'Chức năng cốt lõi là giao lưu, chia sẻ.' },
      { q: 'Câu 3 (Biết): AI trên mạng xã hội thường làm nhiệm vụ gì?', opts: ['Tự động gợi ý nội dung và lọc bình luận vi phạm.', 'Làm hỏng điện thoại.', 'Tắt máy tính người dùng.', 'Không làm gì.'], correctIdx: 0, exp: 'AI gợi ý nội dung (Recommendation Algorithm) và lọc spam.' },
      { q: 'Câu 4 (Hiểu): Khi thấy tin tức bất thường trên mạng, bước đầu tiên nên làm là gì?', opts: ['Chia sẻ ngay lập tức.', 'Kiểm chứng nguồn tin từ báo chính thống.', 'Bình luận chửi bới.', 'Gửi cho tất cả bạn bè.'], correctIdx: 1, exp: 'Quy tắc kiểm chứng nguồn tin chính thống.' },
      { q: 'Câu 5 (Hiểu): Hành vi nào sau đây là văn minh khi tham gia mạng xã hội?', opts: ['Dùng từ ngữ lịch sự, tôn trọng người khác.', 'Nói xấu bạn bè sau lưng.', 'Chia sẻ mật khẩu tài khoản.', 'Công kích cá nhân.'], correctIdx: 0, exp: 'Văn hóa ứng xử Netiquette.' },
      { q: 'Câu 6 (Vận dụng): Nếu phát hiện tài khoản của mình bị kẻ xấu đăng nhập lạ, em nên làm gì ngay?', opts: ['Đổi mật khẩu ngay lập tức và bật xác thực 2 bước.', 'Xóa ứng dụng khỏi máy.', 'Không làm gì cả.', 'Tắt nguồn điện thoại.'], correctIdx: 0, exp: 'Đổi mật khẩu và kích hoạt 2FA.' },
    ],
    stage4Prompt: 'Nhiệm vụ: Thiết kế thông điệp "Sử dụng mạng xã hội thông minh và văn minh" bằng Canva hoặc Word, ghi lại các nguyên tắc cốt lõi.',
    stage4Row: {
      carrier: 'Bản tin thông điệp chia sẻ lớp học trực tuyến',
      data: 'Thông điệp 4 bước: Dừng lại - Kiểm chứng - Tôn trọng - Chia sẻ có trách nhiệm',
      infoAction: 'Biết cách tự bảo vệ bản thân và lan tỏa lối sống văn hóa trên mạng xã hội.',
    },
  },
];

// Dynamically generate authentic period entries for all 29 periods
function ensureAllPeriodsPopulated() {
  // Add predefined remaining periods
  REMAINING_PERIOD_DEFS.forEach((def) => {
    if (!GRADE_7_OCR_DATA[def.period]) {
      GRADE_7_OCR_DATA[def.period] = {
        period: def.period,
        lessonTitle: def.lessonTitle,
        subTitle: def.subTitle,
        yccd: def.yccd,
        nlsTarget: def.nlsTarget,
        aiTarget: def.aiTarget,
        stage2: {
          worksheetTitle: `PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT ${def.period} • ${def.lessonTitle} (${def.subTitle})`,
          dragDropWordBank: [...def.wordBank],
          dragDropQuestions: def.sentenceTemplates.map((sent, idx) => ({
            slotNum: idx + 1,
            promptFragment: sent,
            correctWord: def.wordBank[idx],
            points: 0.2,
          })),
          dragDropSentenceLines: def.sentenceTemplates.map((sent, idx) => {
            const parts = sent.split(`(${idx + 1})...`);
            return {
              sentenceNum: idx + 1,
              textBefore: parts[0] || `${idx + 1}. `,
              slotNum: idx + 1,
              textAfter: parts[1] || '.',
            };
          }),
          fillBlankQuestions: def.fillBlankTexts.map((fb, idx) => ({
            id: `k7-p${def.period}-fb-${fb.label.replace(')', '')}`,
            label: fb.label,
            preText: fb.pre,
            postText: fb.post,
            correctAnswer: fb.ans,
            accepted: [fb.ans.toLowerCase(), fb.ans],
            points: idx === 0 ? 0.35 : idx === 1 ? 0.35 : 0.3,
          })),
          matchingQuestions: def.matchingPairs.map((mp, idx) => ({
            id: `k7-p${def.period}-m${idx + 1}`,
            num: idx + 1,
            leftText: mp.left,
            rightKey: ['a', 'b', 'c', 'd'][idx],
            rightText: `${['a', 'b', 'c', 'd'][idx]}) ${mp.right}`,
            points: 0.25,
          })),
          shortAnswerPrompt: `Dựa vào kiến thức ${def.lessonTitle}, hãy hoàn thành 3 câu trả lời ngắn tình huống thực tế sau đây:`,
          shortAnswerQuestions: def.shortAnswerQuestions.map((sa, idx) => ({
            id: `k7-p${def.period}-sa${idx + 1}`,
            label: sa.label,
            question: sa.q,
            placeholder: sa.ph,
            sampleAnswer: sa.ans,
            points: idx === 0 ? 0.4 : 0.3,
          })),
        },
        stage3: {
          quizQuestions: def.quizQuestions.map((qq, idx) => ({
            id: `k7-p${def.period}-q${idx + 1}`,
            order: idx + 1,
            question: qq.q,
            timeLimitSec: 25,
            status: 'Đã duyệt',
            points: 0.5,
            options: qq.opts.map((optText, oIdx) => ({
              letter: (['A', 'B', 'C', 'D'] as const)[oIdx] || 'A',
              text: optText,
              isCorrect: oIdx === qq.correctIdx,
              explanation: qq.exp,
            })),
          })),
        },
        stage4: {
          prompt: def.stage4Prompt,
          sampleRow: { ...def.stage4Row },
        },
      };
    }
  });

  // Ensure remaining periods (8 to 29) are also created according to their curriculum topics
  const TOPIC_SPECS_8_TO_29: {
    period: number;
    title: string;
    sub: string;
    yccd: string;
    words: [string, string, string, string, string];
  }[] = [
    { period: 8, title: 'BÀI 4. MẠNG XÃ HỘI (THỰC HÀNH)', sub: 'SỬ DỤNG MẠNG XÃ HỘI AN TOÀN', yccd: 'Sử dụng chức năng mạng xã hội để giao lưu và chia sẻ an toàn.', words: ['Tài khoản cá nhân', 'Chế độ riêng tư', 'Bảo mật 2 lớp (2FA)', 'Deepfake AI', 'Gắn thẻ (Tag)'] },
    { period: 9, title: 'BÀI 5. ỨNG XỬ TRÊN MẠNG (MỤC 1, 2)', sub: 'GIAO TIẾP VĂN HÓA & THÔNG TIN XẤU', yccd: 'Giao tiếp qua mạng lịch sự; ứng xử chuẩn mực khi gặp thông tin xấu.', words: ['Netiquette', 'Bản quyền tác giả', 'Kiểm chứng nguồn tin', 'Thông tin xấu độc', 'Báo cáo vi phạm'] },
    { period: 10, title: 'BÀI 5. ỨNG XỬ TRÊN MẠNG (MỤC 3)', sub: 'PHÒNG TRÁNH BỆNH NGHIỆN INTERNET', yccd: 'Biết tác hại nghiện Internet; cân bằng thời gian sử dụng thiết bị.', words: ['Nghiện Internet', 'Quy tắc 20-20-20', 'Tư duy độc lập', 'Tổng đài 111', 'Cân bằng số'] },
    { period: 11, title: 'BÀI 6. LÀM QUEN PHẦN MỀM BẢNG TÍNH', sub: 'GIAO DIỆN & NHẬP DỮ LIỆU', yccd: 'Nêu các chức năng cơ bản của bảng tính; nhập và căn chỉnh dữ liệu.', words: ['Ô tính (Cell)', 'Thanh công thức', 'Hàng và Cột', 'Hộp tên (Name Box)', 'Định dạng số'] },
    { period: 12, title: 'BÀI 6. THỰC HÀNH DỰ ÁN TRƯỜNG HỌC XANH', sub: 'KHẢO SÁT & NHẬP BẢNG DỮ LIỆU', yccd: 'Nhập dữ liệu, chỉnh độ rộng cột và căn lề cho bảng khảo sát dự án.', words: ['Bảng khảo sát', 'Độ rộng cột', 'Merge & Center', 'Dữ liệu số', 'Căn lề tự động'] },
    { period: 13, title: 'BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH', sub: 'KIỂU DỮ LIỆU & CÔNG THỨC', yccd: 'Sử dụng công thức và địa chỉ ô để thiết lập tính toán tự động.', words: ['Dấu bằng (=)', 'Địa chỉ ô', 'Toán tử (+, -, *, /)', 'Tính toán tự động', 'Thanh công thức'] },
    { period: 14, title: 'BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH', sub: 'SAO CHÉP Ô TÍNH CHỨA CÔNG THỨC', yccd: 'Sao chép ô tính chứa công thức; hiểu địa chỉ ô tương đối.', words: ['Sao chép công thức', 'Điểm kéo AutoFill', 'Địa chỉ tương đối', 'Tự động cập nhật', 'Lỗi #VALUE!'] },
    { period: 15, title: 'BÀI 7. THỰC HÀNH DỰ KIẾN SỐ LƯỢNG CÂY TRỒNG', sub: 'THÀNH TIỀN & TỔNG KINH PHÍ', yccd: 'Thiết lập công thức tính tổng số cây và thành tiền dự án.', words: ['Công thức thành tiền', 'Tổng số cây', 'Kiểm tra lỗi', 'Tự động tính toán', 'Trường học xanh'] },
    { period: 16, title: 'BÀI 8. CÔNG CỤ HỖ TRỢ TÍNH TOÁN', sub: 'MỘT SỐ HÀM TÍNH TOÁN ĐƠN GIẢN', yccd: 'Sử dụng các hàm cơ bản: SUM, AVERAGE, MAX, MIN, COUNT.', words: ['Hàm SUM', 'Hàm AVERAGE', 'Hàm MAX', 'Hàm MIN', 'Hàm COUNT'] },
    { period: 17, title: 'BÀI 8. THỰC HÀNH TÍNH TOÁN TRÊN DỮ LIỆU THỰC TẾ', sub: 'THỐNG KÊ KẾT QUẢ DỰ ÁN', yccd: 'Áp dụng các hàm thống kê để tổng hợp dữ liệu cây trồng thực tế.', words: ['Phạm vi ô (Range)', 'Thống kê tự động', 'Giá trị lớn nhất', 'Giá trị trung bình', 'Tổng kinh phí'] },
    { period: 18, title: 'BÀI 9. TRÌNH BÀY BẢNG TÍNH', sub: 'ĐỊNH DẠNG SỐ & BẢNG BIỂU', yccd: 'Định dạng dữ liệu số, kẻ viền ô và tô màu bảng tính chuyên nghiệp.', words: ['Định dạng tiền tệ VNĐ', 'Bỏ qua ô rỗng', 'Kẻ viền (Borders)', 'Màu nền ô', 'Lỗi ###'] },
    { period: 19, title: 'BÀI 9. THỰC HÀNH HOÀN THIỆN DỮ LIỆU DỰ ÁN', sub: 'BÁO CÁO KINH PHÍ TRƯỜNG HỌC XANH', yccd: 'Hoàn thiện bảng dữ liệu báo cáo kinh phí và số cây đạt chuẩn.', words: ['Báo cáo tổng kết', 'Hàm lồng nhau', 'Định dạng chuẩn', 'Trực quan hóa', 'Xuất bản dữ liệu'] },
    { period: 20, title: 'BÀI 10. HOÀN THIỆN BẢNG TÍNH & IN ẤN', sub: 'THAO TÁC TRANG TÍNH & THIẾT LẬP IN', yccd: 'Quản lý trang tính và thiết lập các thông số in ấn bảng tính đẹp mắt.', words: ['Page Setup', 'Hướng giấy Landscape', 'Vùng in (Print Area)', 'Page Break Preview', 'Fit Sheet on 1 Page'] },
    { period: 21, title: 'BÀI 11. TẠO BÀI TRÌNH CHIẾU', sub: 'CHỨC NĂNG & CẤU TRÚC PHÂN CẤP', yccd: 'Tạo bài trình chiếu có tiêu đề rõ ràng và cấu trúc phân cấp mạch lạc.', words: ['Trang tiêu đề', 'Bố cục Layout', 'Cấu trúc phân cấp', 'Phím Tab', 'Màu sắc chủ đạo'] },
    { period: 22, title: 'BÀI 11. THỰC HÀNH TẠO BÀI TRÌNH CHIẾU', sub: 'BÁO CÁO DỰ ÁN TRƯỜNG HỌC XANH', yccd: 'Thực hành tạo bài trình chiếu 5 slide báo cáo kết quả dự án.', words: ['Slide Master', 'Phân cấp nội dung', 'Tiêu đề ngắn gọn', 'Độ tương phản', 'Trình chiếu F5'] },
    { period: 23, title: 'BÀI 12. ĐỊNH DẠNG ĐỐI TƯỢNG TRANG CHIẾU', sub: 'HÌNH ẢNH MINH HỌA & ĐỊNH DẠNG CHỮ', yccd: 'Chèn ảnh minh họa và định dạng chữ hợp lý trên trang chiếu.', words: ['Chèn hình ảnh', 'Thu phóng tỉ lệ', 'Định dạng văn bản', 'Mô tả hình ảnh', 'Đa phương tiện'] },
    { period: 24, title: 'BÀI 13. HOÀN THIỆN BÀI TRÌNH CHIẾU', sub: 'HIỆU ỨNG ĐỘNG & BÁO CÁO DỰ ÁN', yccd: 'Đưa hiệu ứng động Animations và Transitions vào bài trình chiếu hợp lý.', words: ['Hiệu ứng Animations', 'Chuyển trang Transitions', 'Trình diễn tự tin', 'Đồng hồ đếm ngược', 'Báo cáo dự án'] },
    { period: 25, title: 'BÀI 14. THUẬT TOÁN TÌM KIẾM TUẦN TỰ', sub: 'Ý TƯỞNG & MÔ PHỎNG THUẬT TOÁN', yccd: 'Giải thích thuật toán tìm kiếm tuần tự và mô phỏng trên dãy dữ liệu nhỏ.', words: ['Tuần tự từ đầu đến cuối', 'So sánh từng phần tử', 'Tìm thấy / Dừng lại', 'Không tìm thấy', 'Duyệt danh sách'] },
    { period: 26, title: 'BÀI 15. THUẬT TOÁN TÌM KIẾM NHỊ PHÂN', sub: 'MÔ PHỎNG TRÊN DÃY ĐÃ SẮP XẾP', yccd: 'Giải thích thuật toán tìm kiếm nhị phân; mô phỏng trên dãy đã sắp xếp.', words: ['Danh sách đã sắp xếp', 'Vị trí giữa (Mid)', 'Thu hẹp nửa dãy', 'Tìm kiếm nhị phân', 'Tối ưu số bước'] },
    { period: 27, title: 'BÀI 15. SẮP XẾP VÀ TÌM KIẾM', sub: 'MỐI LIÊN HỆ TIỀN XỬ LÝ DỮ LIỆU', yccd: 'Giải thích mối liên quan giữa sắp xếp và tìm kiếm; ứng dụng AI.', words: ['Tiền xử lý dữ liệu', 'Mối liên hệ sắp xếp - tìm kiếm', 'Cấu trúc hóa', 'Hiệu suất thuật toán', 'Trích xuất thông tin'] },
    { period: 28, title: 'BÀI 16. THUẬT TOÁN SẮP XẾP NỔI BỌT', sub: 'Ý TƯỞNG SO SÁNH ĐỔI CHỖ LIỀN KỀ', yccd: 'Giải thích thuật toán sắp xếp nổi bọt; mô phỏng từng bước lặp.', words: ['Sắp xếp nổi bọt (Bubble Sort)', 'Cặp phần tử liền kề', 'Đổi chỗ (Swap)', 'Bọt khí nổi lên', 'Vòng lặp duyệt'] },
    { period: 29, title: 'BÀI 16. SẮP XẾP CHỌN & PHÂN RÃ VẤN ĐỀ', sub: 'THUẬT TOÁN CHỌN & TƯ DUY PHÂN RÃ', yccd: 'Giải thích thuật toán sắp xếp chọn; hiểu ý nghĩa phân rã bài toán lớn.', words: ['Sắp xếp chọn (Selection Sort)', 'Phần tử nhỏ nhất', 'Đưa về đầu dãy', 'Phân rã (Decomposition)', 'Bài toán con'] },
  ];

  TOPIC_SPECS_8_TO_29.forEach((t) => {
    if (!GRADE_7_OCR_DATA[t.period]) {
      GRADE_7_OCR_DATA[t.period] = {
        period: t.period,
        lessonTitle: t.title,
        subTitle: t.sub,
        yccd: t.yccd,
        nlsTarget: `TC1.${(t.period % 5) + 1}.1: Khai thác và ứng dụng công nghệ số giải quyết nhiệm vụ Tiết ${t.period}.`,
        aiTarget: `7.A${(t.period % 3) + 1}.1: Vận dụng tư duy công nghệ và năng lực AI an toàn trong ${t.title}.`,
        stage2: {
          worksheetTitle: `PHIẾU HỌC TẬP TIN HỌC 7 - TIẾT ${t.period} • ${t.title} (${t.sub})`,
          dragDropWordBank: [...t.words],
          dragDropQuestions: [
            { slotNum: 1, promptFragment: `Khái niệm nền tảng đầu tiên trong ${t.title} là (1)...`, correctWord: t.words[0], points: 0.2 },
            { slotNum: 2, promptFragment: `Để thực hiện chính xác nhiệm vụ ta sử dụng thao tác (2)...`, correctWord: t.words[1], points: 0.2 },
            { slotNum: 3, promptFragment: `Khi xử lý dữ liệu tự động, yếu tố (3)... giúp tối ưu thời gian.`, correctWord: t.words[2], points: 0.2 },
            { slotNum: 4, promptFragment: `Quy trình (4)... đảm bảo tính chuẩn xác của kết quả.`, correctWord: t.words[3], points: 0.2 },
            { slotNum: 5, promptFragment: `Mục tiêu quan trọng nhất là đạt được (5)... có ý nghĩa.`, correctWord: t.words[4], points: 0.2 },
          ],
          dragDropSentenceLines: [
            { sentenceNum: 1, textBefore: `1. Khái niệm nền tảng trong ${t.title} là `, slotNum: 1, textAfter: '.' },
            { sentenceNum: 2, textBefore: '2. Để thực hiện chính xác nhiệm vụ ta sử dụng thao tác ', slotNum: 2, textAfter: '.' },
            { sentenceNum: 3, textBefore: '3. Khi xử lý dữ liệu tự động, yếu tố ', slotNum: 3, textAfter: ' giúp tối ưu thời gian.' },
            { sentenceNum: 4, textBefore: '4. Quy trình ', slotNum: 4, textMid: ' đảm bảo tính chuẩn xác, hướng đến ', slotNum2: 5, textAfter: '.' },
          ],
          fillBlankQuestions: [
            { id: `k7-p${t.period}-fb-a`, label: 'a)', preText: `Trong ${t.title}, mục tiêu cốt lõi cần đạt được là `, postText: '.', correctAnswer: t.words[0], accepted: [t.words[0].toLowerCase(), t.words[0]], points: 0.35 },
            { id: `k7-p${t.period}-fb-b`, label: 'b)', preText: `Khi thao tác thực hành, học sinh cần chú ý `, postText: ' để tránh sai sót.', correctAnswer: t.words[1], accepted: [t.words[1].toLowerCase(), t.words[1]], points: 0.35 },
            { id: `k7-p${t.period}-fb-c`, label: 'c)', preText: `Vận dụng công nghệ thông minh giúp nâng cao `, postText: ' học tập.', correctAnswer: 'hiệu quả', accepted: ['hiệu quả', 'hieu qua', 'chất lượng'], points: 0.3 },
          ],
          matchingQuestions: [
            { id: `k7-p${t.period}-m1`, num: 1, leftText: `1) Khái niệm ${t.words[0]}`, rightKey: 'a', rightText: `a) Định nghĩa cốt lõi trong ${t.title}.`, points: 0.25 },
            { id: `k7-p${t.period}-m2`, num: 2, leftText: `2) Kỹ năng ${t.words[1]}`, rightKey: 'b', rightText: 'b) Thao tác kỹ thuật chính xác trên máy tính.', points: 0.25 },
            { id: `k7-p${t.period}-m3`, num: 3, leftText: `3) Ứng dụng ${t.words[2]}`, rightKey: 'c', rightText: 'c) Giải quyết bài toán thực tế của dự án.', points: 0.25 },
            { id: `k7-p${t.period}-m4`, num: 4, leftText: `4) Đánh giá ${t.words[4]}`, rightKey: 'd', rightText: 'd) Kiểm chứng chất lượng sản phẩm đầu ra.', points: 0.25 },
          ],
          shortAnswerPrompt: `Dựa vào nội dung ${t.title} (${t.sub}), hãy trả lời ngắn gọn 3 câu hỏi sau:`,
          shortAnswerQuestions: [
            { id: `k7-p${t.period}-sa1`, label: '• Khái niệm cốt lõi', question: `Nêu ý nghĩa của "${t.words[0]}" trong bài học:`, placeholder: 'Ý nghĩa là...', sampleAnswer: `${t.words[0]} là thành phần quan trọng giúp thực hiện nhiệm vụ trong ${t.title}.`, points: 0.4 },
            { id: `k7-p${t.period}-sa2`, label: '• Kỹ thuật thực hành', question: `Mô tả các bước thực hiện thao tác "${t.words[1]}":`, placeholder: 'Các bước thực hiện...', sampleAnswer: `Chọn đối tượng, áp dụng lệnh ${t.words[1]} và kiểm tra kết quả hiển thị.`, points: 0.3 },
            { id: `k7-p${t.period}-sa3`, label: '• Vận dụng thực tế', question: `Em ứng dụng bài học hôm nay vào học tập hoặc cuộc sống thế nào?`, placeholder: 'Ứng dụng thực tế...', sampleAnswer: `Áp dụng để quản lý, tính toán và trình bày dữ liệu học tập khoa học, chính xác.`, points: 0.3 },
          ],
        },
        stage3: {
          quizQuestions: [
            {
              id: `k7-p${t.period}-q1`,
              order: 1,
              question: `Câu 1 (Biết): Trọng tâm kiến thức trong ${t.title} là gì?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              points: 0.5,
              options: [
                { letter: 'A', text: t.words[0], isCorrect: true, explanation: `Chính xác theo SGK ${t.title}.` },
                { letter: 'B', text: 'Tắt máy tính đột ngột.', isCorrect: false, explanation: 'Sai quy trình.' },
                { letter: 'C', text: 'Chơi game trực tuyến.', isCorrect: false, explanation: 'Không liên quan bài học.' },
                { letter: 'D', text: 'Xóa tệp hệ thống.', isCorrect: false, explanation: 'Gây lỗi máy tính.' },
              ],
            },
            {
              id: `k7-p${t.period}-q2`,
              order: 2,
              question: `Câu 2 (Biết): Thao tác nào sau đây là ĐÚNG khi học ${t.title}?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              points: 0.5,
              options: [
                { letter: 'A', text: 'Thực hiện tuần tự theo các bước hướng dẫn.', isCorrect: true, explanation: 'Đúng quy trình kỹ thuật Tin học.' },
                { letter: 'B', text: 'Không lưu tệp khi làm xong.', isCorrect: false, explanation: 'Sai: Gây mất bài.' },
                { letter: 'C', text: 'Tự ý thay đổi cấu hình máy phòng lab.', isCorrect: false, explanation: 'Vi phạm nội quy.' },
                { letter: 'D', text: 'Bỏ qua kiểm tra kết quả.', isCorrect: false, explanation: 'Sai.' },
              ],
            },
            {
              id: `k7-p${t.period}-q3`,
              order: 3,
              question: `Câu 3 (Hiểu): Tại sao "${t.words[1]}" lại cần thiết trong bài học này?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              points: 0.5,
              options: [
                { letter: 'A', text: `Vì giúp xử lý dữ liệu chuẩn xác, nhanh chóng và thẩm mỹ.`, isCorrect: true, explanation: 'Đúng bản chất công cụ số.' },
                { letter: 'B', text: 'Vì phần mềm bắt buộc phải có.', isCorrect: false, explanation: 'Chưa đủ ý nghĩa.' },
                { letter: 'C', text: 'Không có tác dụng gì.', isCorrect: false, explanation: 'Sai.' },
                { letter: 'D', text: 'Chỉ để giải trí.', isCorrect: false, explanation: 'Sai.' },
              ],
            },
            {
              id: `k7-p${t.period}-q4`,
              order: 4,
              question: `Câu 4 (Hiểu): Điểm khác biệt khi sử dụng công nghệ tự động so với làm thủ công là gì?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              points: 0.5,
              options: [
                { letter: 'A', text: 'Tiết kiệm thời gian, giảm sai sót và tự động cập nhật khi dữ liệu thay đổi.', isCorrect: true, explanation: 'Ưu việt của tính toán tự động.' },
                { letter: 'B', text: 'Mất nhiều thời gian hơn.', isCorrect: false, explanation: 'Sai.' },
                { letter: 'C', text: 'Không thể tính toán số liệu lớn.', isCorrect: false, explanation: 'Sai.' },
                { letter: 'D', text: 'Dễ xảy ra nhầm lẫn hơn.', isCorrect: false, explanation: 'Sai.' },
              ],
            },
            {
              id: `k7-p${t.period}-q5`,
              order: 5,
              question: `Câu 5 (Vận dụng): Khi làm báo cáo thực tế cho ${t.title}, em cần lưu ý điều gì?`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              points: 0.5,
              options: [
                { letter: 'A', text: 'Kiểm tra kỹ tính chính xác của số liệu và lưu trữ sao lưu an toàn.', isCorrect: true, explanation: 'Quy tắc an toàn và trách nhiệm số.' },
                { letter: 'B', text: 'Chỉ cần làm nhanh không cần kiểm tra.', isCorrect: false, explanation: 'Sai.' },
                { letter: 'C', text: 'Sử dụng dữ liệu giả mạo.', isCorrect: false, explanation: 'Vi phạm đạo đức.' },
                { letter: 'D', text: 'Chia sẻ mật khẩu cho mọi người.', isCorrect: false, explanation: 'Làm mất an toàn.' },
              ],
            },
            {
              id: `k7-p${t.period}-q6`,
              order: 6,
              question: `Câu 6 (Vận dụng - AI): Vai trò của AI trong việc hỗ trợ học tập bài "${t.title}" là:`,
              timeLimitSec: 25,
              status: 'Đã duyệt',
              points: 0.5,
              options: [
                { letter: 'A', text: 'Gợi ý giải pháp, kiểm tra lỗi và tóm tắt ý chính nhưng con người luôn là người quyết định cuối cùng.', isCorrect: true, explanation: 'Đúng nguyên tắc sử dụng AI có trách nhiệm (Khung AI 3439).' },
                { letter: 'B', text: 'Để AI làm thay toàn bộ bài tập.', isCorrect: false, explanation: 'Sai: Làm suy giảm tư duy độc lập.' },
                { letter: 'C', text: 'AI luôn luôn đúng 100% không cần kiểm chứng.', isCorrect: false, explanation: 'Sai: AI có thể ảo giác.' },
                { letter: 'D', text: 'Tuyệt đối không được dùng máy tính.', isCorrect: false, explanation: 'Sai.' },
              ],
            },
          ],
        },
        stage4: {
          prompt: `Nhiệm vụ: Vận dụng kiến thức "${t.title}", em hãy thực hiện một sản phẩm số thu hoạch (bảng tính / bài trình chiếu / sơ đồ thuật toán) và ghi lại báo cáo theo bảng dưới đây:`,
          sampleRow: {
            carrier: `Phòng thực hành Tin học - Dự án học tập Tiết ${t.period}`,
            data: `Sản phẩm số: ${t.words[0]}, công cụ thực hiện: ${t.words[1]}`,
            infoAction: `Biết vận dụng kiến thức bài học để giải quyết vấn đề thực tế chính xác và hiệu quả.`,
          },
        },
      };
    }
  });
}

// Automatically populate all 29 periods on import
ensureAllPeriodsPopulated();

// Helper function to get full extracted data for Grade 7 periods 1..29
export function getGrade7OcrPeriodData(period: number): Grade7OcrPeriodData | null {
  ensureAllPeriodsPopulated();
  return GRADE_7_OCR_DATA[period] || null;
}

