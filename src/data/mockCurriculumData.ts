import { GRADE_7_OCR_DATA } from './curriculumGrade7OcrData';
import { generateAuthenticWorksheetForGradeAndPeriod } from './curriculumAllGradesOcrData';
import { AUTHENTIC_PDF_EXTRACTS } from './authenticPdfExtracts';

export interface ClassroomItem {
  id: string;
  name: string;
  grade: number; // Khối 6, 7, 8, 9, 10, 11, 12
  schoolYear: string;
  roomName: string;
  studentCount: number;
}

export const INITIAL_CLASSES: ClassroomItem[] = [
  // Khối 6
  { id: '6A10', name: 'Lớp 6A10', grade: 6, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 01', studentCount: 40 },
  { id: '6A11', name: 'Lớp 6A11', grade: 6, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 02', studentCount: 42 },
  { id: '6A12', name: 'Lớp 6A12', grade: 6, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 03', studentCount: 38 },
  { id: '6A13', name: 'Lớp 6A13', grade: 6, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 04', studentCount: 39 },

  // Khối 7
  { id: '7A10', name: 'Lớp 7A10', grade: 7, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 01', studentCount: 40 },
  { id: '7A11', name: 'Lớp 7A11', grade: 7, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 02', studentCount: 41 },
  { id: '7A12', name: 'Lớp 7A12', grade: 7, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 03', studentCount: 39 },
  { id: '7A13', name: 'Lớp 7A13', grade: 7, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 04', studentCount: 38 },

  // Khối 8
  { id: '8A11', name: 'Lớp 8A11', grade: 8, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 01', studentCount: 40 },
  { id: '8A12', name: 'Lớp 8A12', grade: 8, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 02', studentCount: 41 },
  { id: '8A13', name: 'Lớp 8A13', grade: 8, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 03', studentCount: 39 },
  { id: '8A14', name: 'Lớp 8A14', grade: 8, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 04', studentCount: 40 },

  // Khối 9 (Khớp chính xác hình ảnh người dùng tải lên)
  { id: '9A13', name: 'Lớp 9A13', grade: 9, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 01', studentCount: 38 },
  { id: '9A14', name: 'Lớp 9A14', grade: 9, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 02', studentCount: 40 },
  { id: '9A15', name: 'Lớp 9A15', grade: 9, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 03', studentCount: 41 },
  { id: '9A16', name: 'Lớp 9A16', grade: 9, schoolYear: '2024 - 2025', roomName: 'Phòng Lab Cloud 04', studentCount: 39 },

  // Khối THPT
  { id: '10A1', name: 'Lớp 10A1', grade: 10, schoolYear: '2024 - 2025', roomName: 'Phòng Lab CS THPT 01', studentCount: 42 },
  { id: '11A1', name: 'Lớp 11A1', grade: 11, schoolYear: '2024 - 2025', roomName: 'Phòng Lab CS THPT 02', studentCount: 40 },
  { id: '12A1', name: 'Lớp 12A1', grade: 12, schoolYear: '2024 - 2025', roomName: 'Phòng Lab AI THPT 01', studentCount: 40 },
];

export interface StudentRosterItem {
  id: string;
  username: string;
  dob: string;
  stationNumber: string;
  name: string;
  classId: string;
  grade: number;
  passwordDefault: string;
  xp: number;
  streakDays: number;
  stars: number;
  groupNumber: number;
  partnerName: string;
  partnerId: string;
  avgScore: number;
  submissionStatus: 'Đã nộp' | 'Đang làm' | 'Chưa nộp';
}

export const INITIAL_STUDENTS: StudentRosterItem[] = [
  {
    id: '61008',
    username: 'namnh.6a10_08',
    dob: '15/05/2013',
    stationNumber: '08',
    name: 'Nguyễn Hoàng Nam',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1250,
    streakDays: 15,
    stars: 18,
    groupNumber: 3,
    partnerName: 'Nguyễn Bảo An',
    partnerId: '61009',
    avgScore: 9.2,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '61012',
    username: 'minhdt.6a10_12',
    dob: '22/08/2013',
    stationNumber: '12',
    name: 'Đỗ Tuấn Minh',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1250,
    streakDays: 15,
    stars: 18,
    groupNumber: 3,
    partnerName: 'Nguyễn Bảo An',
    partnerId: '61009',
    avgScore: 9.5,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '61001',
    username: 'anhbm.6a10_01',
    dob: '10/02/2013',
    stationNumber: '01',
    name: 'Bùi Minh Anh',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1180,
    streakDays: 12,
    stars: 16,
    groupNumber: 1,
    partnerName: 'Lê Quỳnh Hoa',
    partnerId: '61003',
    avgScore: 8.8,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '61002',
    username: 'dungdt.6a10_02',
    dob: '14/03/2013',
    stationNumber: '02',
    name: 'Đỗ Tuấn Dũng',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1090,
    streakDays: 9,
    stars: 14,
    groupNumber: 2,
    partnerName: 'Trần Quang Hải',
    partnerId: '61005',
    avgScore: 8.4,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '61003',
    username: 'hoalq.6a10_03',
    dob: '05/09/2013',
    stationNumber: '03',
    name: 'Lê Quỳnh Hoa',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1480,
    streakDays: 18,
    stars: 21,
    groupNumber: 1,
    partnerName: 'Bùi Minh Anh',
    partnerId: '61001',
    avgScore: 9.8,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '61004',
    username: 'chipm.6a10_04',
    dob: '19/11/2013',
    stationNumber: '04',
    name: 'Phan Mai Chi',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 980,
    streakDays: 7,
    stars: 12,
    groupNumber: 4,
    partnerName: 'Phạm Khánh Vy',
    partnerId: '61015',
    avgScore: 8.0,
    submissionStatus: 'Đang làm',
  },
  {
    id: '61005',
    username: 'haitq.6a10_05',
    dob: '28/04/2013',
    stationNumber: '05',
    name: 'Trần Quang Hải',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1190,
    streakDays: 14,
    stars: 17,
    groupNumber: 2,
    partnerName: 'Đỗ Tuấn Dũng',
    partnerId: '61002',
    avgScore: 8.9,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '61009',
    username: 'annb.6a10_09',
    dob: '03/07/2013',
    stationNumber: '09',
    name: 'Nguyễn Bảo An',
    classId: '6A10',
    grade: 6,
    passwordDefault: '12345',
    xp: 1210,
    streakDays: 15,
    stars: 18,
    groupNumber: 3,
    partnerName: 'Đỗ Tuấn Minh',
    partnerId: '61012',
    avgScore: 9.1,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '71001',
    username: 'baohg.7a10_01',
    dob: '12/06/2012',
    stationNumber: '01',
    name: 'Hoàng Gia Bảo',
    classId: '7A10',
    grade: 7,
    passwordDefault: '12345',
    xp: 1320,
    streakDays: 11,
    stars: 19,
    groupNumber: 1,
    partnerName: 'Vũ Minh Châu',
    partnerId: '71002',
    avgScore: 9.0,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '81101',
    username: 'kietpt.8a11_01',
    dob: '25/01/2011',
    stationNumber: '01',
    name: 'Phạm Tuấn Kiệt',
    classId: '8A11',
    grade: 8,
    passwordDefault: '12345',
    xp: 1150,
    streakDays: 10,
    stars: 15,
    groupNumber: 2,
    partnerName: 'Ngô Phương Linh',
    partnerId: '81102',
    avgScore: 8.5,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '91301',
    username: 'ngandk.9a13_01',
    dob: '08/10/2010',
    stationNumber: '01',
    name: 'Đặng Khánh Ngân',
    classId: '9A13',
    grade: 9,
    passwordDefault: '12345',
    xp: 1540,
    streakDays: 20,
    stars: 24,
    groupNumber: 1,
    partnerName: 'Trịnh Quốc Anh',
    partnerId: '91302',
    avgScore: 9.6,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '91302',
    username: 'anhtq.9a13_02',
    dob: '14/11/2010',
    stationNumber: '02',
    name: 'Trịnh Quốc Anh',
    classId: '9A13',
    grade: 9,
    passwordDefault: '12345',
    xp: 1420,
    streakDays: 16,
    stars: 20,
    groupNumber: 1,
    partnerName: 'Đặng Khánh Ngân',
    partnerId: '91301',
    avgScore: 9.1,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '91303',
    username: 'ducnm.9a13_03',
    dob: '02/03/2010',
    stationNumber: '03',
    name: 'Nguyễn Minh Đức',
    classId: '9A13',
    grade: 9,
    passwordDefault: '12345',
    xp: 1100,
    streakDays: 8,
    stars: 14,
    groupNumber: 2,
    partnerName: 'Vũ Thùy Linh',
    partnerId: '91304',
    avgScore: 7.8,
    submissionStatus: 'Đang làm',
  },
  {
    id: '91401',
    username: 'lampt.9a14_01',
    dob: '19/04/2010',
    stationNumber: '01',
    name: 'Phan Tùng Lâm',
    classId: '9A14',
    grade: 9,
    passwordDefault: '12345',
    xp: 1380,
    streakDays: 14,
    stars: 19,
    groupNumber: 1,
    partnerName: 'Trần Mỹ Duyên',
    partnerId: '91402',
    avgScore: 8.9,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '91501',
    username: 'hieund.9a15_01',
    dob: '29/08/2010',
    stationNumber: '01',
    name: 'Nguyễn Đăng Hiếu',
    classId: '9A15',
    grade: 9,
    passwordDefault: '12345',
    xp: 1290,
    streakDays: 11,
    stars: 17,
    groupNumber: 1,
    partnerName: 'Hoàng Thục Anh',
    partnerId: '91502',
    avgScore: 8.4,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '91601',
    username: 'vietdq.9a16_01',
    dob: '12/05/2010',
    stationNumber: '01',
    name: 'Đoàn Quốc Việt',
    classId: '9A16',
    grade: 9,
    passwordDefault: '12345',
    xp: 1490,
    streakDays: 18,
    stars: 22,
    groupNumber: 1,
    partnerName: 'Nguyễn Phương Thảo',
    partnerId: '91602',
    avgScore: 9.3,
    submissionStatus: 'Đã nộp',
  },
  {
    id: '10101',
    username: 'khoilm.10a1_01',
    dob: '17/03/2009',
    stationNumber: '01',
    name: 'Lê Minh Khôi (THPT)',
    classId: '10A1',
    grade: 10,
    passwordDefault: '12345',
    xp: 1680,
    streakDays: 22,
    stars: 26,
    groupNumber: 1,
    partnerName: 'Trần Hà My',
    partnerId: '10102',
    avgScore: 9.7,
    submissionStatus: 'Đã nộp',
  },
];

export interface MinigameQuestionItem {
  id: string;
  order: number;
  question: string;
  timeLimitSec: number;
  points?: number;
  options: {
    letter: 'A' | 'B' | 'C' | 'D';
    text: string;
    explanation: string;
    isCorrect: boolean;
  }[];
  status: 'Đang sửa' | 'Đã duyệt';
}

export const INITIAL_MINIGAME_QUESTIONS: MinigameQuestionItem[] = [
  {
    id: 'q1',
    order: 1,
    question: 'Câu 1 [Mức Nhận biết]: Phát biểu nào sau đây là ĐÚNG nhất khi nói về khái niệm Thông tin?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Thông tin là các con số và ký hiệu chưa được con người xử lý.',
        explanation: 'Sai: Các con số và ký hiệu chưa xử lý là Dữ liệu thô.',
        isCorrect: false,
      },
      {
        letter: 'B',
        text: 'Thông tin là những gì đem lại hiểu biết cho con người về thế giới xung quanh và chính bản thân mình.',
        explanation: 'Đúng chuẩn SGK Tin học 6 Kết nối tri thức.',
        isCorrect: true,
      },
      {
        letter: 'C',
        text: 'Thông tin chỉ tồn tại dưới dạng văn bản viết trong sách giáo khoa.',
        explanation: 'Sai: Thông tin rất đa dạng, có ở khắp mọi nơi.',
        isCorrect: false,
      },
      {
        letter: 'D',
        text: 'Thông tin là các thiết bị cứng như thẻ nhớ, ổ đĩa dùng để lưu trữ.',
        explanation: 'Sai: Thẻ nhớ, ổ đĩa là Vật mang tin.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q2',
    order: 2,
    question: 'Câu 2 [Mức Nhận biết]: Dữ liệu có thể được thể hiện dưới những dạng nào sau đây?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Con số và văn bản chữ viết.',
        explanation: 'Dữ liệu dạng số và văn bản.',
        isCorrect: false,
      },
      {
        letter: 'B',
        text: 'Hình ảnh và âm thanh.',
        explanation: 'Dữ liệu dạng hình ảnh và âm thanh.',
        isCorrect: false,
      },
      {
        letter: 'C',
        text: 'Ký hiệu và bảng biểu.',
        explanation: 'Dữ liệu dạng ký hiệu và đồ họa.',
        isCorrect: false,
      },
      {
        letter: 'D',
        text: 'Cả A, B và C đều đúng.',
        explanation: 'Chính xác: Dữ liệu được thể hiện dưới dạng con số, văn bản, hình ảnh, âm thanh.',
        isCorrect: true,
      },
    ],
  },
  {
    id: 'q3',
    order: 3,
    question: 'Câu 3 [Mức Nhận biết]: Phương tiện/vật nào sau đây KHÔNG PHẢI là vật mang tin?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Tờ báo in hằng ngày.',
        explanation: 'Tờ báo là vật mang tin chứa chữ viết và hình ảnh.',
        isCorrect: false,
      },
      {
        letter: 'B',
        text: 'Thẻ nhớ máy ảnh.',
        explanation: 'Thẻ nhớ là vật mang tin điện tử lưu giữ ảnh.',
        isCorrect: false,
      },
      {
        letter: 'C',
        text: 'Suy nghĩ còn nằm trong đầu con người chưa được nói ra hay ghi chép.',
        explanation: 'Chính xác: Suy nghĩ trong đầu chưa ghi lên phương tiện nào nên không phải vật mang tin.',
        isCorrect: true,
      },
      {
        letter: 'D',
        text: 'Bảng chỉ dẫn giao thông trên đường.',
        explanation: 'Bảng chỉ dẫn là vật mang tin chứa biển báo.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q4',
    order: 4,
    question: 'Câu 4 [Mức Thông hiểu]: Phát biểu nào sau đây phân biệt ĐÚNG nhất giữa Thông tin và Dữ liệu?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Dữ liệu là thông tin đã được con người ghi nhận và hiểu rõ.',
        explanation: 'Sai: Thông tin mới là những gì đem lại hiểu biết.',
        isCorrect: false,
      },
      {
        letter: 'B',
        text: 'Thông tin là dữ liệu đã được lưu giữ trên các vật mang tin.',
        explanation: 'Sai: Thông tin ghi lên vật mang tin trở thành dữ liệu.',
        isCorrect: false,
      },
      {
        letter: 'C',
        text: 'Dữ liệu là hình thức thể hiện của thông tin trên vật mang tin, còn thông tin là hiểu biết thu nhận được từ dữ liệu.',
        explanation: 'Đúng chuẩn định nghĩa SGK Tin học 6.',
        isCorrect: true,
      },
      {
        letter: 'D',
        text: 'Thông tin và dữ liệu là hai khái niệm hoàn toàn giống nhau.',
        explanation: 'Sai: Hai khái niệm này có mối quan hệ nhân quả khác biệt.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q5',
    order: 5,
    question: 'Câu 5 [Mức Thông hiểu]: Vì sao nói: "Thông tin đúng giúp con người đưa ra những lựa chọn tốt và hiệu quả"?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Vì thông tin giúp tăng dung lượng bộ nhớ lưu trữ của máy tính.',
        explanation: 'Sai.',
        isCorrect: false,
      },
      {
        letter: 'B',
        text: 'Vì thông tin mang lại hiểu biết chính xác, giúp con người đánh giá tình huống và quyết định hành động phù hợp.',
        explanation: 'Chính xác: Hiểu biết đúng đắn dẫn đến quyết định và hành vi sáng suốt.',
        isCorrect: true,
      },
      {
        letter: 'C',
        text: 'Vì thông tin làm cho vật mang tin trở nên đẹp mắt hơn.',
        explanation: 'Sai.',
        isCorrect: false,
      },
      {
        letter: 'D',
        text: 'Vì thông tin giúp máy tính tự động vận hành mà không cần con người.',
        explanation: 'Sai.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q6',
    order: 6,
    question: 'Câu 6 [Mức Vận dụng]: Bạn Nam nhìn thấy bảng thông báo ở cổng trường ghi: "Lịch thi học kì 1 bắt đầu từ ngày 15/12". Phát biểu nào phân tích ĐÚNG?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Dữ liệu: Dòng chữ & con số "Lịch thi..."; Thông tin: Biết ngày thi HK1 để ôn tập; Vật mang tin: Bảng thông báo cổng trường.',
        explanation: 'Chính xác: Phân tích đúng 3 thành phần theo bài học.',
        isCorrect: true,
      },
      {
        letter: 'B',
        text: 'Dữ liệu: Cổng trường; Thông tin: Ngày 15/12; Vật mang tin: Bạn Nam.',
        explanation: 'Sai: Bạn Nam là người tiếp nhận thông tin.',
        isCorrect: false,
      },
      {
        letter: 'C',
        text: 'Dữ liệu: Bạn Nam; Thông tin: Điểm 10; Vật mang tin: Lớp học.',
        explanation: 'Sai.',
        isCorrect: false,
      },
      {
        letter: 'D',
        text: 'Tình huống này không có dữ liệu mà chỉ có vật mang tin.',
        explanation: 'Sai: Dòng chữ trên bảng chính là dữ liệu dạng văn bản.',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q7',
    order: 7,
    question: 'Câu 7 [Mức Vận dụng - Tích hợp thực tế]: Khi em sử dụng công cụ tìm kiếm trên máy tính để tra cứu bài học. Sự phân định nào sau đây là ĐÚNG?',
    timeLimitSec: 25,
    status: 'Đã duyệt',
    options: [
      {
        letter: 'A',
        text: 'Dữ liệu: Từ khóa/câu lệnh tìm kiếm nhập vào; Thông tin: Kiến thức hữu ích thu nhận được; Vật mang tin: Màn hình/thiết bị số.',
        explanation: 'Chính xác theo ví dụ bài học thời đại số.',
        isCorrect: true,
      },
      {
        letter: 'B',
        text: 'Dữ liệu: Chuột máy tính; Thông tin: Bàn phím; Vật mang tin: Dây mạng.',
        explanation: 'Sai: Đây là thiết bị phần cứng.',
        isCorrect: false,
      },
      {
        letter: 'C',
        text: 'Dữ liệu: Điểm số bài kiểm tra; Thông tin: Mực in; Vật mang tin: Giấy nháp.',
        explanation: 'Sai.',
        isCorrect: false,
      },
      {
        letter: 'D',
        text: 'Không thể phân biệt được thông tin và dữ liệu trong môi trường số.',
        explanation: 'Sai: Luôn phân biệt được dữ liệu thô và thông tin có nghĩa.',
        isCorrect: false,
      },
    ],
  },
];

export const WHEEL_STUDENTS = [
  'Trần Bảo Nam (Tổ 2)',
  'Lê Minh Anh (Tổ 1)',
  'Nguyễn Gia Huy (Tổ 3)',
  'Phạm Thảo My (Tổ 4)',
  'Vũ Đức Duy (Tổ 2)',
  'Đặng Phương Linh (Tổ 1)',
  'Hoàng Hải Đăng (Tổ 3)',
  'Bùi Khánh Ngân (Tổ 4)',
];

export const NOTEBOOK_LM_URL =
  'https://notebook.google.com/notebook/d3c4f8ae-a6f5-4da2-9736-610e7821a27a';

export interface NotebookGradeSourceMapping {
  grade: 6 | 7 | 8 | 9;
  nlsDocxFile: string;
  nlsPdfUrl: string;
  sgkPdfFile: string;
  totalPeriods: number;
  examScheduleNote: string;
  description: string;
}

export const NOTEBOOK_GRADE_SOURCES: NotebookGradeSourceMapping[] = [
  {
    grade: 6,
    nlsDocxFile: 'NLS-AI-6.docx',
    nlsPdfUrl: '/assets/aistudio/NLS-AI-6_620caadb.pdf',
    sgkPdfFile: 'SGK Tin6.pdf',
    totalPeriods: 29,
    examScheduleNote: 'GK1: Tiết 1–7 • CK1: Tiết 8–15 • GK2: Tiết 16–22 • CK2: Tiết 23–27',
    description:
      'Bảng tích hợp Năng lực số (CV 3456) và Năng lực AI (Khung 3439) vào Chương trình Tin học 6 (29 tiết theo PPCT).',
  },
  {
    grade: 7,
    nlsDocxFile: 'NLS-AI-7.docx',
    nlsPdfUrl: '/assets/aistudio/NLS-AI-7_aafa1d94.pdf',
    sgkPdfFile: 'SGK Tin7.pdf',
    totalPeriods: 29,
    examScheduleNote: 'GK1: Tiết 1–7 • CK1: Tiết 8–15 • GK2: Tiết 16–22 • CK2: Tiết 23–27',
    description:
      'Bảng tích hợp Năng lực số (CV 3456 - L6-L7) và Năng lực AI (Khung 3439) vào Chương trình Tin học 7 (29 tiết theo PPCT).',
  },
  {
    grade: 8,
    nlsDocxFile: 'NLS-AI-8.docx',
    nlsPdfUrl: '/assets/aistudio/NLS-AI-8_c085321b.pdf',
    sgkPdfFile: 'SGK Tin8.pdf',
    totalPeriods: 29,
    examScheduleNote: 'GK1: Tiết 1–7 • CK1: Tiết 8–15 • GK2: Tiết 16–22 • CK2: Tiết 23–27',
    description:
      'Bảng tích hợp Năng lực số (CV 3456 - L8-L9) và Năng lực AI (Khung 3439) vào Chương trình Tin học 8 (29 tiết theo PPCT).',
  },
  {
    grade: 9,
    nlsDocxFile: 'NLS-AI-9.docx',
    nlsPdfUrl: '/assets/aistudio/NLS-AI-9_7802a15c.pdf',
    sgkPdfFile: 'SGK Tin9.pdf',
    totalPeriods: 29,
    examScheduleNote: 'GK1: Tiết 1–7 • CK1: Tiết 8–15 • GK2: Tiết 16–22 • CK2: Tiết 23–27',
    description:
      'Bảng tích hợp Năng lực số (CV 3456 - L8-L9) và Năng lực AI (Khung 3439) vào Chương trình Tin học 9 (29 tiết theo PPCT).',
  },
];

export interface CurriculumPeriodSpec {
  id: string;
  grade: 6 | 7 | 8 | 9;
  period: number; // 1 .. 29
  topic: string;
  lessonTitle: string;
  knowledgeSection: string; // Mục KT
  lessonType: 'theory' | 'practice';
  sgkFile: string;
  nlsAiFile: string;
  nlsPdfUrl: string;
  sgkPages: string;
  examMilestone: 'GK1' | 'CK1' | 'GK2' | 'CK2' | 'TONG_KET';
  yccd: string; // Mục tiêu bài học / Yêu cầu cần đạt
  digitalCompetency: string; // Năng lực số (CV 3456)
  aiCompetency: string; // Năng lực AI (Khung 3439)
}

export interface LiveWheelCallState {
  callId?: string;
  calledStudentId?: string;
  calledStudentName?: string;
  calledStudentUsername?: string;
  classId?: string;
  grade?: 6 | 7 | 8 | 9;
  period?: number;
  questionId?: string;
  questionText?: string;
  options?: {
    letter: 'A' | 'B' | 'C' | 'D';
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  status?: 'calling' | 'answered';
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  isCorrect?: boolean;
  answeredByStudentName?: string;
  answeredAt?: string;
  isSpinning?: boolean;
  winnerId?: string;
  winnerName?: string;
  winnerGroup?: number | string;
  rewardLabel?: string;
  calledAt?: string;
}

export interface DragDropSentenceLine {
  sentenceNum?: number;
  textBefore?: string;
  slotNum?: number;
  textMid?: string;
  slotNum2?: number;
  textAfter?: string;
}

export interface CustomDragDropQuestion {
  slotNum: number;
  promptFragment: string;
  correctWord: string;
  points: number;
  prefix?: string;
  suffix?: string;
}

export interface CustomFillBlankQuestion {
  id: string;
  label: string;
  preText: string;
  postText: string;
  correctAnswer: string;
  accepted: string[];
  points: number;
}

export interface CustomMatchingQuestion {
  id: string;
  num: number;
  leftText: string;
  rightKey: string;
  rightText: string;
  points: number;
}

export interface CustomShortAnswerQuestion {
  id: string;
  label: string;
  question: string;
  placeholder: string;
  sampleAnswer: string;
  points: number;
}

export interface CustomStage1Warmup {
  title: string;
  scenario: string;
  question: string;
  sampleAnswer?: string;
  points?: number;
}

export interface CustomStage4Application {
  title?: string;
  deepAnalysis: {
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  };
  practicalTask: {
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  };
  extendedTask: {
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  };
  // Optional legacy fields for backward compatibility
  prompt?: string;
  sampleRow?: { carrier: string; data: string; infoAction: string };
  rubrics?: { id: string; title: string; desc: string; points: number }[];
}

export interface CustomLessonWorksheet {
  lessonKey: string; // e.g. 'k6-tiet-1'
  grade: 6 | 7 | 8 | 9;
  period: number;
  worksheetTitle: string;
  sourceFileName?: string;
  ingestedAt?: string;
  stage1?: CustomStage1Warmup;
  stage1Questions?: {
    id: string;
    rowNumber: number;
    clue: string;
    answer: string;
    points: number;
  }[];
  stage2: {
    bucketA?: string;
    bucketB?: string;
    dragItems?: { id: string; text: string; correctBox: 'data' | 'info' }[];
    dragDropTitle?: string;
    dragDropInstruction?: string;
    dragDropWordBank: string[];
    dragDropParagraph?: string;
    dragDropQuestions: CustomDragDropQuestion[];
    dragDropSentenceLines?: DragDropSentenceLine[];
    fillBlankTitle?: string;
    fillBlankInstruction?: string;
    fillBlankQuestions: CustomFillBlankQuestion[];
    matchingTitle?: string;
    matchingInstruction?: string;
    matchingQuestions: CustomMatchingQuestion[];
    shortAnswerPrompt: string;
    shortAnswerQuestions: CustomShortAnswerQuestion[];
  };
  stage3QuizQuestions: MinigameQuestionItem[];
  stage4: CustomStage4Application;
}

export interface DriveClassFolder {
  id: string;
  grade: 6 | 7 | 8 | 9;
  classId: string;
  period: number;
  folderName: string;
  drivePath: string;
  driveUrl: string;
  createdAt: string;
}

export interface PracticalProductSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  classId: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle?: string;
  folderId: string;
  drivePath: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  studentNote: string;
  submittedAt: string;
  status: 'Chờ chấm' | 'Đã chấm';
  score: number | null;
  maxPoints: number;
  teacherFeedback: string;
}

export interface StudentWorkDraft {
  draftKey: string; // e.g. 61008_k6_tiet_1
  studentId: string;
  studentName: string;
  classId: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  warmupAnswer?: string;
  clueInputs?: Record<string, string>;
  solvedClueIds?: string[];
  dragSlots?: Record<number, string | null>;
  fillBlankInputs?: { a: string; b: string; c: string; [key: string]: string };
  matchingConnections?: Record<string, string>;
  shortAnswers?: Record<string, string>;
  arenaAnswers?: Record<number, 'A' | 'B' | 'C' | 'D'>;
  stage4Answers?: {
    deepAnalysis: string;
    practicalTask: string;
    extendedTask: string;
  };
  attemptCount?: number;
  updatedAt: string;
}

export interface TaggedLessonSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  classId: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  stageId: 1 | 2 | 3 | 4;
  stageLabel: string;
  score: number;
  maxScore: number;
  mode: 'IN_CLASS_LIVE' | 'HOME_SELF_PACED';
  attemptCount: number;
  submittedAt: string;
  timestampIso: string;
  pedagogicalEvaluation: string;
}

export interface LectureSlidePage {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  highlightNote?: string;
  imageUrl?: string;
  htmlContent?: string;
  htmlEmbedUrl?: string;
  videoUrl?: string;
  videoTitle?: string;
  storageFileId?: string;
  compressedSizeKb?: number;
  embedMode?: 'simulation-single' | 'full-deck-end';
}

export interface LectureSlideDeck {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  fileName: string;
  fileType: 'pdf' | 'pptx' | 'html' | 'video' | 'image';
  fileSize: string;
  uploadedAt: string;
  pdfDataUrl?: string;
  htmlContent?: string;
  htmlEmbedUrl?: string;
  storageBucket?: string;
  totalCompressedKb?: number;
  defaultVideoUrl?: string;
  isUserUploaded?: boolean;
  slides: LectureSlidePage[];
}

export interface WhiteboardPoint {
  x: number; // normalized 0..1000
  y: number; // normalized 0..562.5 (16:9 canvas)
}

export interface WhiteboardStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'line' | 'arrow' | 'rect' | 'circle' | 'eraser';
  color: string;
  width: number;
  points: WhiteboardPoint[];
}

export interface WhiteboardTextNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize?: number;
}

export interface LessonWhiteboardState {
  isOpen: boolean;
  mode?: 'standalone' | 'slide-overlay';
  background?: 'grid' | 'chalkboard' | 'plain' | 'slide';
  backgroundMode?: 'grid' | 'chalkboard' | 'slide';
  strokes: WhiteboardStroke[];
  textNotes: WhiteboardTextNote[];
  title?: string;
  updatedAt: string;
}

export interface LiveClassroomSession {
  isBroadcasting: boolean;
  activeGrade: 6 | 7 | 8 | 9;
  activePeriod: number;
  activeStage: 1 | 2 | 3 | 4;
  activeLiveView?:
    | 'slide'
    | 'waiting'
    | 'whiteboard'
    | 'hd1'
    | 'hd2'
    | 'hd3'
    | 'hd3-practice'
    | 'hd4';
  activeClassId: string;
  unlockedStagesByLesson: Record<string, Record<1 | 2 | 3 | 4, boolean>>;
  unlockedPracticeStage3ByLesson?: Record<string, boolean>;
  unlockedSlideDeckByLesson?: Record<string, boolean>;
  activeSlideIndexByLesson?: Record<string, number>;
  slideSyncVersionByLesson?: Record<string, number>;
  lectureSlidesByLesson?: Record<string, LectureSlideDeck>;
  whiteboardByLesson?: Record<string, LessonWhiteboardState>;
  slideVideoStateByLesson?: Record<
    string,
    {
      isPlaying: boolean;
      videoUrl: string;
      videoTitle?: string;
      updatedAt: string;
    }
  >;
  slideAutoAdvanceStateByLesson?: Record<
    string,
    {
      enabled: boolean;
      intervalSec: number;
    }
  >;
  arenaCountdownStateByLesson?: Record<
    string,
    {
      isRunning: boolean;
      durationSec: number;
      startedAtIso: string;
      remainingSecOnPause?: number;
    }
  >;
  wheelCall: LiveWheelCallState | null;
  taughtPeriodsByClass?: Record<string, number[]>;
  learnedPeriodsByStudent?: Record<string, string[]>;
  customWorksheetsByLesson?: Record<string, CustomLessonWorksheet>;
  verifiedLessonsMap?: Record<string, boolean>;
  driveFolders?: DriveClassFolder[];
  practicalSubmissions?: PracticalProductSubmission[];
  studentDraftsByKey?: Record<string, StudentWorkDraft>;
  taggedSubmissions?: TaggedLessonSubmission[];
  lastPushNotification?: {
    id: string;
    title: string;
    body: string;
    stage?: 1 | 2 | 3 | 4 | 'slide' | 'hd3-practice' | 'whiteboard';
    stageLabel?: string;
    lessonTitle?: string;
    classId?: string;
    grade?: number;
    period?: number;
    timestampIso: string;
  } | null;
  lastStudentStageCompletion?: {
    id: string;
    studentId: string;
    studentName: string;
    stationNumber: string;
    classId: string;
    grade: number;
    period: number;
    lessonTitle: string;
    stage: 1 | 2 | 3 | 4 | 'hd3-practice';
    stageLabel: string;
    score?: number;
    xpEarned: number;
    summary?: string;
    timestampIso: string;
  } | null;
  recentStageCompletions?: {
    id: string;
    studentId: string;
    studentName: string;
    stationNumber: string;
    classId: string;
    grade: number;
    period: number;
    lessonTitle: string;
    stage: 1 | 2 | 3 | 4 | 'hd3-practice';
    stageLabel: string;
    score?: number;
    xpEarned: number;
    summary?: string;
    timestampIso: string;
  }[];
  completedStagesByStudent?: Record<string, (1 | 2 | 3 | 4 | 'hd3-practice')[]>;
  updatedAt: string;
}

export function createDefaultUnlockedMap(): Record<string, Record<1 | 2 | 3 | 4, boolean>> {
  const map: Record<string, Record<1 | 2 | 3 | 4, boolean>> = {};
  ([6, 7, 8, 9] as const).forEach((g) => {
    for (let p = 1; p <= 29; p++) {
      const key = `k${g}-tiet-${p}`;
      map[key] = {
        1: false,
        2: false,
        3: false,
        4: false,
      };
    }
  });
  return map;
}

export const INITIAL_DRIVE_FOLDERS: DriveClassFolder[] = [
  {
    id: 'drv-6A10-p11',
    grade: 6,
    classId: '6A10',
    period: 11,
    folderName: 'TH_Tiet11_KhaiThacWeb_6A10',
    drivePath: 'Google Drive / Khối 6 / Lớp 6A10 / Tiết 11: Thực hành Khai thác thông tin trên trang web',
    driveUrl: 'https://drive.google.com/drive/folders/cloudplay-6A10-tiet11',
    createdAt: '08:00 • Hôm nay',
  },
  {
    id: 'drv-6A10-p19',
    grade: 6,
    classId: '6A10',
    period: 19,
    folderName: 'TH_Tiet19_SoDoTuDuy_6A10',
    drivePath: 'Google Drive / Khối 6 / Lớp 6A10 / Tiết 19: Thực hành Tạo sơ đồ tư duy',
    driveUrl: 'https://drive.google.com/drive/folders/cloudplay-6A10-tiet19',
    createdAt: '08:05 • Hôm nay',
  },
  {
    id: 'drv-6A11-p11',
    grade: 6,
    classId: '6A11',
    period: 11,
    folderName: 'TH_Tiet11_KhaiThacWeb_6A11',
    drivePath: 'Google Drive / Khối 6 / Lớp 6A11 / Tiết 11: Thực hành Khai thác thông tin trên trang web',
    driveUrl: 'https://drive.google.com/drive/folders/cloudplay-6A11-tiet11',
    createdAt: '08:10 • Hôm nay',
  },
  {
    id: 'drv-7A10-p6',
    grade: 7,
    classId: '7A10',
    period: 6,
    folderName: 'TH_Tiet6_QuanLyTepThuMuc_7A10',
    drivePath: 'Google Drive / Khối 7 / Lớp 7A10 / Tiết 6: Thực hành Quản lý dữ liệu trong máy tính',
    driveUrl: 'https://drive.google.com/drive/folders/cloudplay-7A10-tiet6',
    createdAt: '08:15 • Hôm nay',
  },
  {
    id: 'drv-8A11-p4',
    grade: 8,
    classId: '8A11',
    period: 4,
    folderName: 'TH_Tiet4_KhaiThacThongTinSo_8A11',
    drivePath: 'Google Drive / Khối 8 / Lớp 8A11 / Tiết 4: Thực hành khai thác thông tin số',
    driveUrl: 'https://drive.google.com/drive/folders/cloudplay-8A11-tiet4',
    createdAt: '08:20 • Hôm nay',
  },
  {
    id: 'drv-9A13-p2',
    grade: 9,
    classId: '9A13',
    period: 2,
    folderName: 'TH_Tiet2_PhanMemMoPhong_9A13',
    drivePath: 'Google Drive / Khối 9 / Lớp 9A13 / Tiết 2: Thực hành Phần mềm mô phỏng',
    driveUrl: 'https://drive.google.com/drive/folders/cloudplay-9A13-tiet2',
    createdAt: '08:25 • Hôm nay',
  },
];

export const INITIAL_PRACTICAL_SUBMISSIONS: PracticalProductSubmission[] = [
  {
    id: 'sub-61008-p11',
    studentId: '61008',
    studentName: 'Nguyễn Hoàng Nam',
    studentUsername: 'namnh.6a10_08',
    classId: '6A10',
    grade: 6,
    period: 11,
    folderId: 'drv-6A10-p11',
    drivePath: 'Google Drive / Khối 6 / Lớp 6A10 / Tiết 11',
    fileName: 'BaiThucHanh_Tiet11_NguyenHoangNam_6A10.docx',
    fileType: 'Word Document (.docx)',
    fileSize: '1.4 MB',
    studentNote: 'Em đã chụp màn hình tra cứu dự báo thời tiết và điền đủ bảng tổng hợp ạ.',
    submittedAt: '09:15 • Hôm nay',
    status: 'Đã chấm',
    score: 2.9,
    maxPoints: 3,
    teacherFeedback: 'Bài làm đầy đủ ảnh chụp màn hình, phân tích thông tin rõ ràng, trình bày đẹp!',
  },
  {
    id: 'sub-61012-p11',
    studentId: '61012',
    studentName: 'Đỗ Tuấn Minh',
    studentUsername: 'minhdt.6a10_12',
    classId: '6A10',
    grade: 6,
    period: 11,
    folderId: 'drv-6A10-p11',
    drivePath: 'Google Drive / Khối 6 / Lớp 6A10 / Tiết 11',
    fileName: 'ThucHanhWeb_DoTuanMinh_6A10.png',
    fileType: 'Ảnh chụp màn hình (.png)',
    fileSize: '860 KB',
    studentNote: 'Ảnh kết quả khai thác thông tin trang web từ điển và thời sự của nhóm em.',
    submittedAt: '09:22 • Hôm nay',
    status: 'Chờ chấm',
    score: null,
    maxPoints: 3,
    teacherFeedback: '',
  },
  {
    id: 'sub-61001-p11',
    studentId: '61001',
    studentName: 'Bùi Minh Anh',
    studentUsername: 'anhbm.6a10_01',
    classId: '6A10',
    grade: 6,
    period: 11,
    folderId: 'drv-6A10-p11',
    drivePath: 'Google Drive / Khối 6 / Lớp 6A10 / Tiết 11',
    fileName: 'BaoCao_Tiet11_BuiMinhAnh_6A10.docx',
    fileType: 'Word Document (.docx)',
    fileSize: '1.1 MB',
    studentNote: 'Em nộp sản phẩm thực hành tiết 11 lên thư mục Drive của lớp 6A10.',
    submittedAt: '09:28 • Hôm nay',
    status: 'Chờ chấm',
    score: null,
    maxPoints: 3,
    teacherFeedback: '',
  },
];

export const INITIAL_TAGGED_SUBMISSIONS: TaggedLessonSubmission[] = [
  {
    id: 'tag-sub-1',
    studentId: '61008',
    studentName: 'Nguyễn Hoàng Nam',
    studentUsername: 'namnh.6a10_08',
    classId: '6A10',
    grade: 6,
    period: 1,
    lessonTitle: 'Tiết 1: Thông tin và dữ liệu',
    stageId: 2,
    stageLabel: 'HĐ2: Phiếu học tập Khám phá',
    score: 3.8,
    maxScore: 4.0,
    mode: 'IN_CLASS_LIVE',
    attemptCount: 1,
    submittedAt: '08:15 • Tiết Live trên lớp',
    timestampIso: '2025-03-10T08:15:00.000Z',
    pedagogicalEvaluation: 'Tập trung cao độ, hiểu bài ngay tại lớp, hoàn thành sớm hơn 4 phút.',
  },
  {
    id: 'tag-sub-2',
    studentId: '61008',
    studentName: 'Nguyễn Hoàng Nam',
    studentUsername: 'namnh.6a10_08',
    classId: '6A10',
    grade: 6,
    period: 1,
    lessonTitle: 'Tiết 1: Thông tin và dữ liệu',
    stageId: 3,
    stageLabel: 'HĐ3: Đấu trường Trắc nghiệm 25s',
    score: 3.0,
    maxScore: 3.0,
    mode: 'HOME_SELF_PACED',
    attemptCount: 3,
    submittedAt: '20:10 • Tự luyện ở nhà',
    timestampIso: '2025-03-10T20:10:00.000Z',
    pedagogicalEvaluation: 'Tinh thần tự giác & kiên trì xuất sắc: Làm lại 3 lần nâng điểm từ 2.0 → 3.0/3.0đ.',
  },
  {
    id: 'tag-sub-3',
    studentId: '61001',
    studentName: 'Bùi Minh Anh',
    studentUsername: 'anhbm.6a10_01',
    classId: '6A10',
    grade: 6,
    period: 1,
    lessonTitle: 'Tiết 1: Thông tin và dữ liệu',
    stageId: 2,
    stageLabel: 'HĐ2: Phiếu học tập Khám phá',
    score: 4.0,
    maxScore: 4.0,
    mode: 'IN_CLASS_LIVE',
    attemptCount: 1,
    submittedAt: '08:12 • Tiết Live trên lớp',
    timestampIso: '2025-03-10T08:12:00.000Z',
    pedagogicalEvaluation: 'Xuất sắc! Hoàn thành đầu tiên trong giờ học trực tiếp và tham gia thử thách Fast-Finisher.',
  },
  {
    id: 'tag-sub-4',
    studentId: '61012',
    studentName: 'Đỗ Tuấn Minh',
    studentUsername: 'minhdt.6a10_12',
    classId: '6A10',
    grade: 6,
    period: 1,
    lessonTitle: 'Tiết 1: Thông tin và dữ liệu',
    stageId: 4,
    stageLabel: 'HĐ4: Vận dụng thực tiễn (3 Bài)',
    score: 2.8,
    maxScore: 3.0,
    mode: 'HOME_SELF_PACED',
    attemptCount: 2,
    submittedAt: '21:05 • Tự luyện ở nhà',
    timestampIso: '2025-03-10T21:05:00.000Z',
    pedagogicalEvaluation: 'Chủ động làm tiếp bài dở dang từ phòng máy trường trên điện thoại tại nhà (Lần nộp #2).',
  },
];

export function createDefaultLiveSession(): LiveClassroomSession {
  return {
    isBroadcasting: true,
    activeGrade: 6,
    activePeriod: 1,
    activeStage: 1,
    activeLiveView: 'waiting',
    activeClassId: '6A10',
    unlockedStagesByLesson: createDefaultUnlockedMap(),
    lectureSlidesByLesson: {},
    activeSlideIndexByLesson: {},
    slideSyncVersionByLesson: {},
    wheelCall: null,
    taughtPeriodsByClass: {
      '6A10': [1],
    },
    learnedPeriodsByStudent: {
      '61008': ['k6-tiet-1'],
    },
    customWorksheetsByLesson: {},
    verifiedLessonsMap: (() => {
      const vMap: Record<string, boolean> = {};
      ([6, 7, 8, 9] as const).forEach((g) => {
        for (let p = 1; p <= 29; p++) {
          vMap[`k${g}-tiet-${p}`] = true;
        }
      });
      return vMap;
    })(),
    driveFolders: INITIAL_DRIVE_FOLDERS,
    practicalSubmissions: INITIAL_PRACTICAL_SUBMISSIONS,
    studentDraftsByKey: {},
    taggedSubmissions: INITIAL_TAGGED_SUBMISSIONS,
    updatedAt: new Date().toISOString(),
  };
}

type RawPeriodTuple = [
  topic: string,
  lessonTitle: string,
  knowledgeSection: string,
  lessonType: 'theory' | 'practice',
  yccd: string,
  nlsCode: string,
  aiCode: string
];

// BẢNG TÍCH HỢP NĂNG LỰC SỐ VÀ NĂNG LỰC AI VÀO CHƯƠNG TRÌNH TIN HỌC 6 (29 TIẾT - NLS-AI-6_620caadb.pdf)
const GRADE_6_RAW: RawPeriodTuple[] = [
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 1: Thông tin và dữ liệu', 'Mục 1. Thông tin và dữ liệu; Mục 2. Tầm quan trọng của thông tin', 'theory', 'Nhận biết sự khác nhau giữa thông tin và dữ liệu; phân biệt thông tin và vật mang tin; nêu ví dụ minh họa mối quan hệ giữa thông tin - dữ liệu.', 'TC1.1.1: Giải thích được nhu cầu thông tin, thực hiện rõ ràng quy trình tìm kiếm dữ liệu trong môi trường số.', '6.A2.1: Nhận biết AI hỗ trợ con người thu nhận, phân tích dữ liệu để chuyển hóa thành thông tin có ích.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 2: Xử lí thông tin (mục 1)', 'Mục 1. Xử lí thông tin', 'theory', 'Nêu được các hoạt động cơ bản trong xử lí thông tin (thu nhận, lưu trữ, xử lý, truyền thông tin).', 'TC1.1.3: Lựa chọn được phương tiện, cách thức lưu trữ và xử lý thông tin phù hợp nhiệm vụ đơn giản.', '6.A1.1: Nhận biết sơ lược các bước xử lý thông tin cơ bản của mô hình AI đơn giản so với con người.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 2: Xử lí thông tin (mục 2)', 'Mục 2. Xử lí thông tin trong máy tính', 'theory', 'Giải thích được máy tính là công cụ hiệu quả để xử lí thông tin; nêu ví dụ minh họa cụ thể.', 'TC1.4.1: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề.', '6.C1.1: Nhận biết máy tính và ứng dụng AI có khả năng xử lý lượng dữ liệu lớn với tốc độ và độ chính xác cao.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 3: Thông tin trong máy tính (mục 1)', 'Mục 1. Biểu diễn thông tin trong máy tính', 'theory', 'Giải thích được việc biểu diễn thông tin chỉ với hai kí hiệu 0 và 1; biết bit là đơn vị nhỏ nhất trong lưu trữ thông tin.', 'TC1.3.1: Sắp xếp được dữ liệu, thông tin và nội dung trong một môi trường số có cấu trúc cơ bản.', '6.D1.1: Nhận biết AI và máy tính chuyển đổi các dạng dữ liệu thực tế (chữ, ảnh, âm thanh) thành dãy bit để xử lý.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 3: Thông tin trong máy tính (mục 2)', 'Mục 2. Đơn vị đo thông tin', 'theory', 'Nêu được tên và độ lớn các đơn vị cơ bản đo dung lượng thông tin; ước lượng được khả năng lưu trữ của thiết bị nhớ.', 'TC1.1.2: Thực hiện rõ ràng các thao tác kiểm tra dung lượng, quản lý tệp dữ liệu đơn giản.', '6.C3.1: Nhận biết tầm quan trọng của dung lượng dữ liệu lớn (Big Data) đối với việc huấn luyện mô hình AI.'],
  ['Chủ đề 2. Mạng máy tính và Internet', 'Bài 4: Mạng máy tính (mục 1)', 'Mục 1. Mạng máy tính là gì?', 'theory', 'Nêu được mạng máy tính là gì và lợi ích của nó trong cuộc sống (chia sẻ tài nguyên, kết nối, giao tiếp).', 'TC1.2.1: Thực hiện được các tương tác, kết nối cơ bản thông qua môi trường mạng theo hướng dẫn.', '6.A1.2: Nhận biết các ứng dụng AI kết nối mạng để thu thập dữ liệu và cung cấp dịch vụ thông minh.'],
  ['Chủ đề 2. Mạng máy tính và Internet', 'Bài 4: Mạng máy tính (mục 2)', 'Mục 2. Các thành phần của mạng máy tính', 'theory', 'Kể tên được các thành phần chính của mạng máy tính (thiết bị đầu cuối, thiết bị kết nối, phần mềm mạng); mạng có dây và không dây.', 'TC1.5.1: Chỉ ra được các sự cố kỹ thuật thông thường và các thiết bị phần cứng mạng cơ bản.', '6.D2.1: Trình bày được ví dụ sơ lược về kịch bản kết nối giữa thiết bị đầu cuối với máy chủ đám mây xử lý AI.'],
  ['Chủ đề 2. Mạng máy tính và Internet', 'Bài 5: Internet (mục 1, 2)', 'Mục 1. Internet; Mục 2. Đặc điểm của Internet', 'theory', 'Biết Internet là gì; nêu được các đặc điểm chính của Internet (toàn cầu, tương tác, dễ tiếp cận, không chủ sở hữu).', 'TC1.2.2: Lựa chọn được phương tiện giao tiếp, kết nối Internet phù hợp cho bối cảnh đơn giản.', '6.A1.1: Nhận biết Internet là hạ tầng nền tảng giúp kết nối và triển khai các ứng dụng Trí tuệ nhân tạo toàn cầu.'],
  ['Chủ đề 2. Mạng máy tính và Internet', 'Bài 5: Internet (mục 3)', 'Mục 3. Một số lợi ích của Internet', 'theory', 'Nêu được các lợi ích chính của Internet trong học tập, giải trí, tìm kiếm tài liệu và trao đổi thông tin.', 'TC1.2.3: Xác định được các dịch vụ số phổ biến trên Internet phục vụ nhu cầu đời sống, học tập.', '6.A3.1: Nêu ví dụ về cách AI tích hợp trên Internet hỗ trợ học sinh tự học, tra cứu kiến thức hiệu quả.'],
  ['Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 6: Mạng thông tin toàn cầu (mục 1, 2)', 'Mục 1. Tổ chức thông tin trên Internet; Mục 2. Trình duyệt', 'theory', 'Trình bày sơ lược các khái niệm World Wide Web, website, địa chỉ website, trang chủ, siêu liên kết và trình duyệt web.', 'TC1.1.1: Giải thích được cách truy cập và điều hướng các trang web theo địa chỉ rõ ràng.', '6.C2.1: Nhận biết trình duyệt web tích hợp tính năng AI hỗ trợ tóm tắt nội dung trang web hoặc gợi ý liên kết.'],
  ['Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 6: Mạng thông tin toàn cầu (mục 3 - Thực hành)', 'Mục 3. Thực hành: Khai thác thông tin trên trang web', 'practice', 'Xem và nêu được thông tin chính trên trang web cho trước; khai thác thông tin trên trang web thông dụng (thời tiết, thời sự, từ điển).', 'TC1.1.2: Thực hiện được quy trình các bước tìm kiếm, xem và khai thác thông tin trên các trang web uy tín.', '6.C3.1: Đánh giá và so sánh thông tin tra cứu từ trang web truyền thống với kết quả do AI tổng hợp.'],
  ['Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 7: Tìm kiếm thông tin trên Internet (mục 1)', 'Mục 1. Tìm kiếm thông tin trên Internet', 'theory', 'Nêu được công dụng của máy tìm kiếm; xác định được từ khóa ứng với mục đích tìm kiếm cho trước.', 'TC1.1.1: Giải thích được quy trình các bước tìm kiếm và lựa chọn từ khóa phù hợp.', '6.A2.1: Nhận biết máy tìm kiếm sử dụng thuật toán AI để phân tích ngữ nghĩa từ khóa và đề xuất kết quả tối ưu.'],
  ['Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 7: Tìm kiếm thông tin trên Internet (mục 2 - Thực hành)', 'Mục 2. Thực hành: Tìm kiếm và khai thác thông tin trên Internet', 'practice', 'Thực hiện được việc tìm kiếm, chọn lọc và khai thác thông tin, hình ảnh trên Internet bằng máy tìm kiếm.', 'TC1.1.2: Thực hiện được việc tìm dữ liệu, thông tin và nội dung số theo quy trình chiến lược tìm kiếm.', '6.C2.1: Sử dụng linh hoạt các công cụ tìm kiếm thông minh (tìm kiếm bằng hình ảnh, bằng giọng nói AI).'],
  ['Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 8: Thư điện tử (mục 1, 2)', 'Mục 1. Thư điện tử; Mục 2. Ưu và nhược điểm của dịch vụ thư điện tử', 'theory', 'Biết thư điện tử là gì; ưu/nhược điểm của thư điện tử; các thành phần của địa chỉ thư điện tử và hộp thư điện tử.', 'TC1.2.1: Lựa chọn được công cụ giao tiếp số (Email) phù hợp trong môi trường số.', '6.B1.1: Nhận biết bộ lọc AI trong hệ thống thư điện tử tự động phát hiện và ngăn chặn thư rác (Spam), lừa đảo.'],
  ['Chủ đề 3. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 8: Thư điện tử (mục 3 - Thực hành)', 'Mục 3. Thực hành: Đăng kí tài khoản, đăng nhập và gửi thư điện tử', 'practice', 'Thực hiện được các thao tác đăng ký tài khoản, đăng nhập, soạn, gửi thư có tệp đính kèm và đăng xuất an toàn.', 'TC1.2.2: Thực hiện được việc chọn lựa và trao đổi dữ liệu, thông tin qua các kênh truyền thông số đúng quy tắc.', '6.A2.1: Biết sử dụng tính năng gợi ý soạn thảo văn bản tự động (Smart Compose AI) khi viết thư.'],
  ['Chủ đề 4. Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 9: An toàn thông tin trên Internet (mục 1, 2)', 'Mục 1. Tác hại và nguy cơ; Mục 2. Quy tắc an toàn', 'theory', 'Biết một số tác hại, nguy cơ khi sử dụng Internet (lộ thông tin, nhiễm mã độc, lừa đảo, bắt nạt) và 5 quy tắc an toàn Internet.', 'TC1.4.1: Phân biệt được các rủi ro và mối đe dọa cơ bản trong môi trường số; giải thích các biện pháp bảo vệ.', '6.B2.1: Nhận biết rủi ro từ các công cụ AI giả mạo (Deepfake hình ảnh/giọng nói) được kẻ xấu dùng để lừa đảo.'],
  ['Chủ đề 4. Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 9: An toàn thông tin trên Internet (mục 3)', 'Mục 3. Bảo vệ thông tin cá nhân và chia sẻ an toàn', 'practice', 'Bảo vệ thông tin và tài khoản cá nhân; đặt mật khẩu mạnh; nêu được cách chia sẻ thông tin an toàn, hợp pháp.', 'TC1.4.2: Giải thích được cách bảo vệ dữ liệu cá nhân, quyền riêng tư trên môi trường số.', '6.B3.1: Nêu được trách nhiệm không tự ý cung cấp thông tin/hình ảnh cá nhân, riêng tư lên các nền tảng AI công cộng.'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 10: Sơ đồ tư duy (mục 1, 2)', 'Mục 1. Sơ đồ tư duy; Mục 2. Cách tạo sơ đồ tư duy', 'theory', 'Sắp xếp logic các ý tưởng/khái niệm dưới dạng sơ đồ tư duy; nêu lợi ích và các bước tạo sơ đồ tư duy thủ công.', 'TC1.3.1: Chỉ ra được cách tạo và diễn đạt thông tin, ý tưởng bằng các dạng trực quan phổ biến.', '6.A2.1: Nhận biết AI có thể hỗ trợ con người phân tích văn bản và tự động gợi ý nhánh sơ đồ tư duy.'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 10: Sơ đồ tư duy (mục 3 - Thực hành)', 'Mục 3. Thực hành: Tạo sơ đồ tư duy bằng phần mềm máy tính', 'practice', 'Sử dụng được phần mềm sơ đồ tư duy để tạo, chỉnh sửa và lưu sơ đồ tư duy đơn giản.', 'TC1.3.2: Thể hiện được việc tạo các nội dung số đơn giản bằng công cụ phần mềm.', '6.C1.1: Trải nghiệm sơ lược sự khác biệt giữa tạo sơ đồ tư duy thủ công và công cụ số/AI hỗ trợ tạo tự động.'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 11: Định dạng văn bản', 'Mục 1. Phần mềm soạn thảo; Mục 2. Định dạng văn bản và in; Mục 3. Thực hành', 'practice', 'Nêu được chức năng phần mềm soạn thảo văn bản; tác dụng của định dạng ký tự, đoạn văn, trang văn bản; thực hiện định dạng.', 'TC1.3.1: Chỉ ra được cách tạo và chỉnh sửa văn bản với các định dạng cụ thể, rõ ràng.', '6.C2.1: Nhận biết các tính năng AI trong phần mềm soạn thảo (tự động kiểm tra lỗi chính tả, gợi ý bố cục trang).'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 12: Trình bày thông tin ở dạng bảng (mục 1, 2, 3)', 'Mục 1. Trình bày dạng bảng; Mục 2. Tạo bảng; Mục 3. Định dạng bảng', 'theory', 'Hiểu ưu điểm của việc trình bày thông tin ở dạng bảng (cột, hàng); biết cách tạo, chỉnh sửa và định dạng bảng đơn giản.', 'TC1.3.1: Chọn được cấu trúc bảng thích hợp để sắp xếp và hiển thị dữ liệu rõ ràng.', '6.A2.1: Nhận biết AI có khả năng tự động phân tích văn bản thô để tổng hợp thành bảng dữ liệu có cấu trúc.'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 12: Trình bày thông tin ở dạng bảng (mục 4 - Thực hành)', 'Mục 4. Thực hành: Tạo bảng', 'practice', 'Thực hiện được việc tạo bảng, nhập dữ liệu, chèn/xóa hàng cột và định dạng bảng cho nội dung cụ thể (Danh sách lớp/Sổ lưu niệm).', 'TC1.3.2: Thể hiện được việc tạo lập nội dung số dạng bảng thông qua các bước rõ ràng.', '6.C2.1: Vận dụng tư duy cấu trúc dữ liệu bảng để làm tiền đề cho việc cung cấp dữ liệu cho AI phân tích.'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 13: Thực hành: Tìm kiếm và thay thế', 'Mục 1. Tại sao phải tìm kiếm và thay thế?; Mục 2. Sử dụng công cụ', 'practice', 'Nêu tác dụng của công cụ Find & Replace; thực hiện được việc tìm kiếm và thay thế từ/cụm từ trong văn bản soạn thảo.', 'TC1.3.2: Giải thích được các cách chỉnh sửa, cải thiện nội dung số một cách nhanh chóng.', '6.C2.1: So sánh sự khác nhau giữa tìm kiếm/thay thế từ khóa chính xác (Find & Replace) và thay thế ngữ nghĩa bằng AI.'],
  ['Chủ đề 5. Ứng dụng tin học', 'Bài 14: Thực hành tổng hợp: Hoàn thiện sổ lưu niệm', 'Mục Nhiệm vụ và Hướng dẫn (Tập hợp, bổ sung nội dung, tạo trang bìa)', 'practice', 'Tổng hợp, sắp xếp các văn bản, hình ảnh, bảng biểu đã làm để hoàn thiện sản phẩm số tổng hợp ("Sổ lưu niệm lớp 6A").', 'TC1.3.2: Tích hợp được các mục nội dung số đơn giản để tạo ra sản phẩm mới độc đáo, hoàn chỉnh.', '6.D2.1: Mô tả được kịch bản tổng hợp sản phẩm số và đánh giá sản phẩm có sự hỗ trợ của công cụ thiết kế thông minh.'],
  ['Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15: Thuật toán', 'Mục 1. Thuật toán; Mục 2. Mô tả thuật toán', 'theory', 'Diễn tả được sơ lược khái niệm thuật toán (đầu vào, đầu ra, các bước chỉ dẫn); mô tả được thuật toán bằng ngôn ngữ tự nhiên hoặc sơ đồ khối.', 'TC1.3.4: Liệt kê được các bước của thuật toán đơn giản để giải quyết một nhiệm vụ.', '6.C1.1: Nhận biết thuật toán là cốt lõi để xây dựng các chương trình máy tính và mô hình Trí tuệ nhân tạo.'],
  ['Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 16: Các cấu trúc điều khiển (mục 1)', 'Mục 1. Cấu trúc tuần tự, cấu trúc rẽ nhánh', 'theory', 'Hiểu và mô tả được thuật toán có cấu trúc tuần tự và cấu trúc rẽ nhánh (dạng thiếu, dạng đủ) bằng sơ đồ khối.', 'TC1.3.4: Mô tả được chuỗi lệnh và các điều kiện rẽ nhánh trong quy trình xử lý thông tin.', '6.D1.1: Trình bày được ví dụ về việc AI đưa ra quyết định dựa trên kiểm tra các điều kiện rẽ nhánh dữ liệu đầu vào.'],
  ['Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 16: Các cấu trúc điều khiển (mục 2)', 'Mục 2. Cấu trúc lặp', 'theory', 'Hiểu và mô tả được thuật toán có cấu trúc lặp (mô tả các bước lặp đi lặp lại) bằng sơ đồ khối.', 'TC1.3.4: Lập kế hoạch thực hiện chuỗi công việc có tính chất lặp đi lặp lại.', '6.C3.1: Nhận biết quá trình huấn luyện AI (Machine Learning) là quá trình lặp đi lặp lại việc điều chỉnh dữ liệu.'],
  ['Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 17: Chương trình máy tính (mục 1)', 'Mục 1. Chương trình máy tính', 'theory', 'Biết chương trình máy tính là tập hợp các lệnh mô tả thuật toán để máy tính "hiểu" và thực hiện được.', 'TC1.3.4: Giải thích được mối quan hệ giữa thuật toán và chương trình chạy trên máy tính.', '6.D1.1: Nhận biết phần mềm AI là một chương trình máy tính phức tạp được lập trình để tự học và giải quyết vấn đề.'],
  ['Chủ đề 6. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 17: Chương trình máy tính (mục 2 - Thực hành)', 'Mục 2. Thực hành: Tạo chương trình máy tính', 'practice', 'Thực hiện được việc chuyển đổi thuật toán đơn giản thành chương trình hoàn chỉnh (trên môi trường lập trình trực quan Scratch).', 'TC1.3.4: Lập được kế hoạch và phát triển một chuỗi lệnh điều khiển cho máy tính giải quyết nhiệm vụ cụ thể.', '6.C2.1: Đề xuất được ý tưởng ứng dụng chương trình máy tính/AI đơn giản để giải quyết một bài toán trong học tập.'],
];

// BẢNG TÍCH HỢP NĂNG LỰC SỐ VÀ NĂNG LỰC AI VÀO CHƯƠNG TRÌNH TIN HỌC 7 (29 TIẾT - NLS-AI-7_aafa1d94.pdf)
const GRADE_7_RAW: RawPeriodTuple[] = [
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 1. Thiết bị vào ra (mục 1)', '1. Thiết bị vào – ra', 'theory', 'Biết và nhận ra các thiết bị vào – ra có nhiều loại, hình dạng; biết chức năng trong thu nhận, lưu trữ, xử lý và truyền thông tin.', 'TC1.5.1: Liệt kê được các hướng dẫn thông thường cho một hệ thống máy tính để giải quyết các vấn đề đơn giản.', '7.A1.1: Nhận diện và phân biệt được các thiết bị phần cứng có tích hợp AI (loa thông minh, camera AI) với thiết bị thường.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 1. Thiết bị vào ra (mục 2)', '2. An toàn thiết bị', 'practice', 'Thực hiện đúng các thao tác với thiết bị thông dụng; nêu ví dụ thao tác sai gây ra lỗi cho thiết bị và hệ thống xử lý thông tin.', 'TC1.4.1: Chỉ ra được những cách thức cơ bản và phổ biến để bảo vệ thiết bị và nội dung số.', '7.B1.1: Trình bày được ý thức trách nhiệm và sự cẩn trọng khi vận hành, bảo vệ thiết bị và dữ liệu đầu vào cho hệ thống AI.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 2. Phần mềm máy tính (mục 1)', '1. Hệ điều hành', 'theory', 'Giải thích được sơ lược chức năng điều khiển và quản lý của hệ điều hành; phân biệt hệ điều hành với phần mềm ứng dụng.', 'TC1.5.2: Chọn lựa được các công cụ và công nghệ số để giải quyết các nhiệm vụ cụ thể.', '7.A2.1: Hiểu vai trò của hệ điều hành và nền tảng phần mềm trong việc làm môi trường thực thi cho các ứng dụng AI.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 2. Phần mềm máy tính (mục 2)', '2. Phần mềm ứng dụng', 'theory', 'Nêu tên một số phần mềm ứng dụng đã dùng; giải thích phần mở rộng của tên tệp, cho biết tệp thuộc loại gì.', 'TC1.1.3: Lựa chọn đúng cách lưu trữ, truy xuất dữ liệu và nội dung số trong môi trường có cấu trúc.', '7.C1.1: Nhận biết các định dạng dữ liệu (văn bản, hình ảnh, âm thanh) mà phần mềm ứng dụng và công cụ AI xử lý.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 3. Quản lý dữ liệu trong máy tính (mục 1, 2)', '1. Tên tệp và thư mục; 2. Các biện pháp bảo vệ dữ liệu', 'theory', 'Biết tệp chương trình cũng là dữ liệu; nêu ví dụ về biện pháp bảo vệ dữ liệu như sao lưu, phòng chống virus.', 'TC1.1.3: Sắp xếp dữ liệu, thông tin để dễ dàng lưu trữ và truy xuất; tổ chức dữ liệu trong môi trường có cấu trúc.', '7.C2.1: Nêu tầm quan trọng của việc quản lý, tổ chức và bảo vệ tập dữ liệu đối với độ chính xác của các ứng dụng AI.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 3. Quản lý dữ liệu trong máy tính (mục 3 – Thực hành)', '3. Thực hành: Quản lý dữ liệu trong máy tính', 'practice', 'Thao tác thành thạo với tệp và thư mục: tạo, sao chép, di chuyển, đổi tên, xoá tệp và thư mục.', 'TC1.1.3: Sắp xếp và quản lý tệp, thư mục khoa học trong môi trường số.', '7.C2.2: Thực hành chuẩn hóa tên tệp và thư mục chứa dữ liệu đầu vào cho các bài toán công nghệ/AI.'],
  ['Chủ đề 2. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 4. Mạng xã hội và một số kênh trao đổi thông tin (mục 1)', '1. Mạng xã hội – Kênh trao đổi thông tin phổ biến', 'theory', 'Nêu tên kênh trao đổi thông tin thông dụng; nêu chức năng cơ bản của mạng xã hội; nêu ví dụ về hậu quả dùng thông tin sai trái.', 'TC1.2.1: Thực hiện được các tương tác được xác định rõ ràng và thường xuyên với các công nghệ số.', '7.A3.1: Nhận biết sự xuất hiện của AI trên các mạng xã hội (thuật toán gợi ý nội dung, tự động lọc bình luận).'],
  ['Chủ đề 2. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 4. Mạng xã hội và một số kênh trao đổi thông tin (mục 2 – Thực hành)', '2. Thực hành: Sử dụng mạng xã hội', 'practice', 'Sử dụng được một số chức năng cơ bản của một mạng xã hội để giao lưu và chia sẻ thông tin an toàn.', 'TC1.2.2: Lựa chọn các công nghệ số phù hợp để trao đổi dữ liệu, thông tin và nội dung số.', '7.B2.1: Nêu các quy tắc chia sẻ thông tin có trách nhiệm, không phát tán các sản phẩm giả mạo do AI tạo ra (Deepfake).'],
  ['Chủ đề 3. Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 5. Ứng xử trên mạng (mục 1, 2)', '1. Giao tiếp, ứng xử có văn hóa qua mạng; 2. Làm gì khi gặp thông tin xấu?', 'theory', 'Thực hiện giao tiếp qua mạng lịch sự, văn hóa; nêu ví dụ truy cập không hợp lệ; biết cách ứng xử khi gặp thông tin xấu.', 'TC1.2.5: Làm rõ được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số trong môi trường số.', '7.B2.2: Phân tích được các khía cạnh đạo đức khi giao tiếp với AI và sử dụng các nội dung do AI tạo ra.'],
  ['Chủ đề 3. Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 5. Ứng xử trên mạng (mục 3)', '3. Tác hại và cách phòng tránh bệnh nghiện Internet', 'theory', 'Biết tác hại của bệnh nghiện Internet, có ý thức phòng tránh; biết nhờ người lớn tư vấn khi cần thiết.', 'TC1.4.3: Giải thích các cách thức cơ bản để tránh rủi ro đối với sức khỏe thể chất và tinh thần khi dùng công nghệ số.', '7.B1.2: Trình bày được nguy cơ phụ thuộc quá mức vào các công cụ AI gây giảm khả năng tư duy độc lập.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 6. Làm quen với phần mềm bảng tính (mục 1, 2)', '1. Giao diện bảng tính; 2. Nhập, chỉnh sửa và định dạng dữ liệu', 'theory', 'Nêu các chức năng cơ bản của bảng tính; thực hiện thao tác chọn phông chữ, căn chỉnh dữ liệu, thay đổi độ rộng cột.', 'TC1.3.1: Chỉ ra các cách tạo và chỉnh sửa nội dung ở các định dạng cụ thể, rõ ràng.', '7.C1.2: Hiểu cấu trúc bảng dữ liệu dạng hàng - cột là nền tảng để thu thập và lưu trữ dữ liệu cho hệ thống AI.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 6. Làm quen với phần mềm bảng tính (mục 3 – Thực hành)', '3. Thực hành: Nhập thông tin khảo sát dự án Trường học xanh', 'practice', 'Thực hành nhập dữ liệu, chỉnh độ rộng cột, định dạng phông chữ và căn lề cho bảng khảo sát.', 'TC1.3.1: Thể hiện việc tạo ra các nội dung số thông qua tạo và định dạng bảng.', '7.C2.3: Thực hành thu thập, nhập và kiểm tra tính đầy đủ của tập dữ liệu khảo sát thực tế.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 7. Tính toán tự động trên bảng tính (mục 1, 2)', '1. Kiểu dữ liệu; 2. Công thức trong bảng tính', 'theory', 'Nhận biết các kiểu dữ liệu; sử dụng công thức và địa chỉ ô để tạo bảng tính có tính toán.', 'TC1.5.1: Liệt kê được các hướng dẫn thông thường để máy tính thực hiện giải quyết công việc tự động.', '7.A2.2: Hiểu nguyên lý máy tính và AI thực hiện tính toán tự động dựa trên các quy tắc toán học thiết lập sẵn.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 7. Tính toán tự động trên bảng tính (mục 3)', '3. Sao chép ô tính chứa công thức', 'theory', 'Giải thích việc đưa công thức vào bảng tính là cách điều khiển tính toán tự động; sao chép được ô tính chứa công thức.', 'TC1.3.2: Giải thích được các cách sửa đổi, tinh chỉnh và cải thiện nội dung số.', '7.D1.1: Nhận biết khả năng mở rộng quy mô xử lý dữ liệu hàng loạt của máy tính khi áp dụng cùng một quy tắc tính toán.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 7. Tính toán tự động trên bảng tính (mục 4 – Thực hành)', '4. Thực hành: Nhập thông tin dự kiến số lượng cây trồng', 'practice', 'Thực hành thiết lập công thức tính tổng số cây và thành tiền trong dự án Trường học xanh.', 'TC1.5.3: Chọn lựa các công cụ số để tạo ra kiến thức và sản phẩm.', '7.C3.1: Kiểm tra và phát hiện các lỗi sai số liệu trong bảng dữ liệu trước khi đưa vào phân tích.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 8. Công cụ hỗ trợ tính toán (mục 1, 2)', '1. Hàm trong bảng tính; 2. Một số hàm tính toán đơn giản', 'theory', 'Sử dụng được các hàm đơn giản như SUM, AVERAGE, MAX, MIN, COUNT.', 'TC1.5.1: Liệt kê được các lệnh/hàm hệ thống để thực hiện giải quyết các nhiệm vụ xử lý dữ liệu.', '7.A2.3: Hiểu các hàm thống kê (trung bình, cực trị) là công cụ cơ bản để AI phân tích xu hướng dữ liệu.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 8. Công cụ hỗ trợ tính toán (mục 3 – Thực hành)', '3. Thực hành: Tính toán trên dữ liệu trồng cây thực tế', 'practice', 'Thực hành áp dụng hàm SUM, AVERAGE, MAX, MIN, COUNT để tổng hợp dữ liệu dự án.', 'TC1.1.2: Thực hiện phân tích, so sánh, đánh giá độ tin cậy của dữ liệu qua kết quả tính toán.', '7.C2.4: Rút ra nhận xét, kết luận sơ bộ từ các chỉ số thống kê tổng hợp của bảng dữ liệu.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 9. Trình bày bảng tính (mục 1, 2, 3)', '1. Định dạng dữ liệu số; 2. Trình bày bảng tính; 3. Tính chất của hàm', 'theory', 'Thực hiện định dạng dữ liệu số và trình bày bảng tính; hiểu tính chất bỏ qua ô rỗng của hàm.', 'TC1.3.1: Chỉ ra được các cách tạo và định dạng thông tin bằng những định dạng rõ ràng, phổ biến.', '7.C1.3: Trực quan hóa dữ liệu giúp con người và hệ thống dễ dàng quan sát, đọc hiểu thông tin.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 9. Trình bày bảng tính (mục 4 – Thực hành)', '4. Thực hành: Hoàn thiện dữ liệu dự án Trường học xanh', 'practice', 'Áp dụng các hàm và kỹ thuật định dạng để hoàn thiện bảng dữ liệu tổng kết kinh phí và số cây.', 'TC1.3.2: Giải thích được các cách sửa đổi, cải thiện và nâng cao chất lượng sản phẩm nội dung số.', '7.C2.5: Đánh giá tính thẩm mỹ và sự chính xác của bảng dữ liệu báo cáo.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 10. Hoàn thiện bảng tính', '1. Thao tác trang tính; 2. In dữ liệu; 3. Thực hành trình bày hoàn chỉnh', 'practice', 'Thực hiện thao tác quản lý trang tính (đổi tên, chèn, xóa, ẩn/hiện); biết thiết lập thông số in bảng tính.', 'TC1.3.1: Thể hiện việc tạo và sắp xếp nội dung số thông qua các tùy chọn hiển thị và xuất bản.', '7.D1.2: Chuẩn bị báo cáo dữ liệu hoàn chỉnh để phục vụ việc chia sẻ và truyền thông trong dự án.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 11. Tạo bài trình chiếu (mục 1, 2, 3)', '1. Chức năng phần mềm trình chiếu; 2. Tiêu đề; 3. Cấu trúc phân cấp', 'theory', 'Nêu chức năng cơ bản của phần mềm trình chiếu; tạo bài báo cáo có tiêu đề và cấu trúc phân cấp mạch lạc.', 'TC1.3.1: Chỉ ra các cách tạo nội dung số bằng định dạng bài trình chiếu có cấu trúc.', '7.A3.2: Biết sử dụng cấu trúc phân cấp thông tin logic làm cơ sở cho AI tóm tắt hoặc sinh nội dung.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 11. Tạo bài trình chiếu (mục 4 – Thực hành)', '4. Thực hành: Tạo bài trình chiếu có tiêu đề, cấu trúc phân cấp', 'practice', 'Thực hành tạo bài trình chiếu báo cáo kết quả dự án Trường học xanh sử dụng mẫu bố trí và phân cấp.', 'TC1.3.1: Tạo được sản phẩm trình chiếu hoàn chỉnh theo chủ đề.', '7.C1.4: Lựa chọn và tổ chức các ý chính để truyền tải thông điệp ngắn gọn, hiệu quả.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 12. Định dạng đối tượng trên trang chiếu', '1. Ảnh minh họa; 2. Định dạng văn bản; 3. Thực hành sao chép, chèn ảnh', 'practice', 'Sao chép dữ liệu từ văn bản sang trang chiếu; đưa ảnh minh họa vào trang chiếu; sử dụng hợp lý định dạng.', 'TC1.3.2: Giải thích và thực hiện các cách cải thiện, tinh chỉnh nội dung số bằng hình ảnh và định dạng.', '7.C2.6: Nhận biết vai trò của việc kết hợp đa phương tiện (văn bản, hình ảnh) trong nâng cao trải nghiệm.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 13. Thực hành tổng hợp: Hoàn thiện bài trình chiếu', '1. Hiệu ứng động; 2. Thực hành tổng hợp: Hoàn thiện bài trình chiếu', 'practice', 'Biết đưa hiệu ứng động vào bài trình chiếu hợp lý; tổng hợp, sắp xếp các nội dung thành bài trình chiếu hoàn chỉnh.', 'TC1.3.2: Giải thích được các cách tinh chỉnh, hoàn thiện sản phẩm trình chiếu đa truyền thông.', '7.D1.3: Trình bày được sản phẩm truyền thông số hoàn chỉnh, thể hiện tư duy thiết kế trải nghiệm người dùng.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 14. Thuật toán tìm kiếm tuần tự', '1. Thuật toán tìm kiếm tuần tự; Mô tả thuật toán tìm kiếm tuần tự', 'theory', 'Giải thích thuật toán tìm kiếm tuần tự; biểu diễn và mô phỏng hoạt động của thuật toán trên bộ dữ liệu nhỏ.', 'TC1.5.1: Liệt kê được các bước thực hiện theo quy trình rõ ràng để giải quyết vấn đề đơn giản.', '7.A1.2: Nhận thức được rằng các hệ thống AI sử dụng các thuật toán duyệt và tìm kiếm dữ liệu để phản hồi.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15. Thuật toán tìm kiếm nhị phân (mục 1)', '1. Thuật toán tìm kiếm nhị phân', 'theory', 'Giải thích thuật toán tìm kiếm nhị phân; mô phỏng hoạt động của thuật toán trên dãy đã sắp xếp.', 'TC1.5.1: Liệt kê được các bước quy trình tối ưu để giải quyết bài toán tìm kiếm.', '7.A2.4: So sánh được hiệu quả xử lý dữ liệu của các thuật toán thông minh giúp tăng tốc độ tìm kiếm.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15. Thuật toán tìm kiếm nhị phân (mục 2)', '2. Sắp xếp và tìm kiếm', 'theory', 'Giải thích mối liên quan giữa sắp xếp và tìm kiếm, nêu được ví dụ minh họa.', 'TC1.5.2: Lựa chọn quy trình xử lý dữ liệu phù hợp (sắp xếp trước khi tìm kiếm nhị phân).', '7.C2.7: Hiểu tầm quan trọng của tiền xử lý dữ liệu (sắp xếp, cấu trúc hóa) đối với hiệu suất của mô hình AI.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 16. Thuật toán sắp xếp (mục 1)', '1. Thuật toán sắp xếp nổi bọt', 'theory', 'Giải thích thuật toán sắp xếp nổi bọt; biểu diễn và mô phỏng hoạt động của thuật toán với bộ dữ liệu nhỏ.', 'TC1.5.1: Liệt kê các bước thực hiện quy trình so sánh và đổi chỗ liên tiếp để sắp xếp danh sách.', '7.A1.3: Nhận biết thuật toán sắp xếp là nền tảng để máy tính tự động tổ chức và thứ tự hóa dữ liệu.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 16. Thuật toán sắp xếp (mục 2, 3)', '2. Thuật toán sắp xếp chọn; 3. Chia bài toán thành bài toán nhỏ hơn', 'practice', 'Giải thích thuật toán sắp xếp chọn; nêu ý nghĩa của việc chia một bài toán thành những bài toán nhỏ hơn.', 'TC1.5.1: Xác định các bước chia nhỏ nhiệm vụ phức tạp thành các nhiệm vụ đơn giản hơn.', '7.A2.5: Hiểu tư duy phân rã vấn đề (Decomposition) - phương pháp cốt lõi để xây dựng hệ thống AI giải bài toán lớn.'],
];

// BẢNG TÍCH HỢP NĂNG LỰC SỐ VÀ NĂNG LỰC AI VÀO MÔN TIN HỌC LỚP 8 (29 TIẾT - NLS-AI-8_c085321b.pdf)
const GRADE_8_RAW: RawPeriodTuple[] = [
  ['Chủ đề 1: Máy tính và cộng đồng', 'Bài 1. Lược sử công cụ tính toán (Tiết 1)', '1. Máy tính cơ học; 2. Máy tính điện tử', 'theory', 'Trình bày được sơ lược lịch sử phát triển máy tính; nêu ví dụ cho thấy sự phát triển máy tính đem đến thay đổi lớn cho xã hội.', '1.2.TC2: Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số.', '8.A1.1: Nêu được sơ lược lịch sử phát triển và các mốc phát triển chính của Trí tuệ nhân tạo (AI).'],
  ['Chủ đề 1: Máy tính và cộng đồng', 'Bài 1. Lược sử công cụ tính toán (Tiết 2)', '3. Máy tính thay đổi thế giới như thế nào?', 'theory', 'Nêu được ví dụ cho thấy sự phát triển máy tính đã đem đến những thay đổi lớn lao cho xã hội loài người.', '4.4.TC2: Thảo luận về các cách bảo vệ môi trường khỏi tác động của công nghệ số.', '8.A2.1: Nêu được các ví dụ về ứng dụng AI làm thay đổi các lĩnh vực trong đời sống xã hội (y tế, giáo dục, giao thông).'],
  ['Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 2. Thông tin trong môi trường số', '1. Thông tin trong môi trường số; 2. Thông tin đáng tin cậy', 'theory', 'Nêu được các đặc điểm của thông tin số (đa dạng, thu thập nhanh, dung lượng lớn); trình bày tầm quan trọng của nguồn tin đáng tin cậy.', '1.2.TC2: Thực hiện phân tích, so sánh và đánh giá được độ tin cậy của các nguồn dữ liệu, thông tin và nội dung số.', '8.B1.1: Nhận biết được nguy cơ thông tin sai lệch, tin giả do AI tạo ra (deepfake, văn bản giả) và tầm quan trọng kiểm chứng.'],
  ['Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 3. Thực hành khai thác thông tin số', 'Nhiệm vụ 1, 2, 3: Khai thác, đánh giá, xử lý và trao đổi thông tin', 'practice', 'Sử dụng được công cụ tìm kiếm, xử lý và trao đổi thông tin trong môi trường số; đánh giá được lợi ích của thông tin tìm được.', '1.1.TC2: Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số; tổ chức chiến lược tìm kiếm.', '8.C1.1: Hiểu cách sử dụng từ khóa và câu lệnh nhắc (prompt) hợp lý khi tìm kiếm thông tin với sự hỗ trợ của công cụ số/AI.'],
  ['Chủ đề 3: Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 4. Đạo đức và văn hóa trong sử dụng công nghệ kỹ thuật số', '1. Biểu hiện vi phạm khi sử dụng CNKTS; 2. Tuân thủ quy định khi tạo sản phẩm số', 'theory', 'Nhận biết và giải thích được một số biểu hiện vi phạm đạo đức và pháp luật khi sử dụng CNTT; bảo đảm sản phẩm số hợp pháp.', '3.3.TC2: Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số.', '8.B2.1: Nhận thức được vấn đề bản quyền, quyền sở hữu trí tuệ đối với các sản phẩm do AI tạo ra và trách nhiệm người dùng.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 5. Sử dụng bảng tính giải quyết bài toán thực tế (Tiết 1)', '1. Địa chỉ tương đối; 2. Địa chỉ tuyệt đối', 'theory', 'Giải thích được sự thay đổi địa chỉ tương đối trong công thức khi sao chép; phân biệt địa chỉ tương đối và địa chỉ tuyệt đối.', '5.1.TC2: Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số.', '8.C2.1: Hiểu nguyên lý tham chiếu dữ liệu cố định và biến đổi khi tự động hóa tính toán dữ liệu.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 5. Sử dụng bảng tính giải quyết bài toán thực tế (Tiết 2)', '3. Thực hành bảng tính; 4. Sao chép dữ liệu từ văn bản/trang chiếu', 'practice', 'Sử dụng được phần mềm bảng tính trợ giúp giải quyết bài toán thực tế; sao chép dữ liệu từ tệp văn bản sang trang tính.', '3.1.TC2: Chỉ ra được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.', '8.C3.1: Nhận biết khả năng tích hợp và chuyển đổi dữ liệu giữa các định dạng phần mềm để chuẩn bị dữ liệu cho xử lý tự động.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 6. Sắp xếp và lọc dữ liệu (Tiết 1)', '1. Sử dụng phần mềm bảng tính trợ giúp giải quyết bài toán thực tế', 'theory', 'Sử dụng được phần mềm bảng tính trợ giúp giải quyết bài toán thực tế; nêu tình huống cần sử dụng chức năng sắp xếp và lọc dữ liệu.', '1.3.TC2: Tổ chức được việc lưu trữ dữ liệu, thông tin và nội dung trong môi trường số.', '8.C2.2: Nhận biết khái niệm phân loại và lọc dữ liệu làm tiền đề cho việc xử lý dữ liệu trong các hệ thống thông minh/AI.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 6. Sắp xếp và lọc dữ liệu (Tiết 2)', '2. Thực hành sắp xếp dữ liệu; 3. Thực hành lọc dữ liệu', 'practice', 'Thực hiện được các thao tác lọc, sắp xếp dữ liệu của phần mềm bảng tính theo một hoặc nhiều tiêu chí.', '1.3.TC2: Sắp xếp được dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất.', '8.C3.2: Thực hiện chuẩn hóa và trích xuất tập dữ liệu con theo yêu cầu bài toán đặt ra.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 7. Trình bày dữ liệu bằng biểu đồ (Tiết 1)', '1. Trình bày dữ liệu bằng biểu đồ', 'theory', 'Nêu được một số tình huống thực tế cần sử dụng các chức năng tạo biểu đồ; nhận biết các dạng biểu đồ thông dụng.', '3.1.TC2: Thể hiện được bản thân thông qua việc tạo ra các nội dung số.', '8.A2.2: Nhận biết vai trò của trực quan hóa dữ liệu trong việc giúp con người và máy tính nhận diện xu hướng dữ liệu.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 7. Trình bày dữ liệu bằng biểu đồ (Tiết 2)', '2. Thực hành tạo biểu đồ', 'practice', 'Thực hiện được các thao tác tạo và tùy chỉnh biểu đồ (tiêu đề, chú giải, nhãn dữ liệu) của phần mềm bảng tính.', '3.1.TC2: Chỉ ra được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.', '8.C2.3: Thực hành tạo sản phẩm trực quan hóa dữ liệu hỗ trợ phân tích và ra quyết định.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 8a. Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản (Tiết 1)', '1. Danh sách dạng liệt kê; 2. Hình ảnh minh họa và hình đồ họa', 'theory', 'Thực hiện được các thao tác: tạo danh sách dạng liệt kê; chèn thêm, xóa bỏ, co dãn hình ảnh; vẽ hình đồ họa trong văn bản.', '3.1.TC2: Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.', '8.C1.2: Hiểu nguyên lý phân lớp (layer) và bố cục không gian khi thiết kế sản phẩm truyền thông số.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 8a. Làm việc với danh sách dạng liệt kê và hình ảnh trong văn bản (Tiết 2)', '3. Thực hành: Tạo sản phẩm là văn bản phục vụ nhu cầu thực tế', 'practice', 'Tạo được sản phẩm là văn bản (Phiếu khảo sát, Tờ rơi quảng cáo) có tính thẩm mỹ phục vụ nhu cầu thực tế.', '3.1.TC2: Thể hiện được bản thân thông qua việc tạo ra các nội dung số dạng khác nhau.', '8.D1.1: Tạo sản phẩm truyền thông số hoàn chỉnh kết hợp tính thẩm mỹ và thông tin rõ ràng.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 9a. Tạo đầu trang, chân trang cho văn bản (Tiết 1)', '1. Đầu trang và chân trang; 2. Đánh số trang', 'theory', 'Thực hiện được các thao tác: đánh số trang, thêm đầu trang và chân trang trong văn bản.', '3.1.TC2: Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.', '8.C1.3: Nhận biết cấu trúc văn bản chuẩn hóa giúp các hệ thống số/AI dễ dàng phân tích và xử lý.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 9a. Tạo đầu trang, chân trang cho văn bản (Tiết 2)', '3. Thực hành: Đánh số trang, thêm đầu trang và chân trang', 'practice', 'Thực hành chèn Header, Footer, đánh số trang tự động và chỉnh sửa định dạng cho tập tài liệu dự án "CLBTinhoc.docx".', '3.1.TC2: Thể hiện được bản thân thông qua việc tạo ra các nội dung số.', '8.D1.2: Hoàn thiện văn bản số đạt chuẩn trình bày chuyên nghiệp.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 10a. Định dạng nâng cao cho trang chiếu (Tiết 1)', '1. Văn bản và màu sắc trên trang chiếu; 2. Số trang, đầu trang và chân trang', 'theory', 'Chọn đặt được màu sắc, cỡ chữ hài hòa và hợp lý với nội dung; thực hiện đánh số trang, thêm đầu trang và chân trang.', '2.1.TC2: Lựa chọn được nhiều công nghệ số để tương tác.', '8.A2.3: Hiểu nguyên lý tương tác người - máy (UX/UI) cơ bản thông qua phối màu và độ tương phản giao diện.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 10a. Định dạng nâng cao cho trang chiếu (Tiết 2)', '3. Thực hành: Tạo bài trình chiếu cho Lễ ra mắt CLB Tin học', 'practice', 'Nhập nội dung, định dạng phông chữ/màu sắc tương phản, chèn Header/Footer/Slide Number cho bài trình chiếu Lễ ra mắt CLB.', '3.1.TC2: Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.', '8.D2.1: Tạo kịch bản trình chiếu trực quan, thu hút người xem.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 11a. Sử dụng bản mẫu tạo bài trình chiếu (Tiết 1)', '1. Bản mẫu trong phần mềm trình chiếu', 'theory', 'Sử dụng được các bản mẫu (template); đưa được vào trong trang chiếu đường dẫn đến video hay tài liệu khác.', '3.1.TC2: Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.', '8.D2.2: Nhận biết lợi ích của việc sử dụng các mẫu thiết kế sẵn (template/layout) để nâng cao hiệu suất tạo sản phẩm.'],
  ['Chủ đề 4: Ứng dụng tin học', 'Bài 11a. Sử dụng bản mẫu tạo bài trình chiếu (Tiết 2)', '2. Thực hành: Tạo sản phẩm số phục vụ học tập, giao lưu', 'practice', 'Áp dụng Template "Lab Safety", chỉnh sửa nội dung bài trình chiếu An toàn phòng thực hành và chèn Hyperlink tới video.', '2.2.TC2: Vận dụng được các cách đóng vai trò trung gian để chia sẻ thông tin và nội dung qua công nghệ số.', '8.C2.4: Tạo sản phẩm số đa phương tiện kết hợp đường dẫn liên kết đến tài nguyên mở.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 12. Từ thuật toán đến chương trình (Tiết 1)', '1. Từ thuật toán đến chương trình', 'theory', 'Mô tả được kịch bản đơn giản dưới dạng thuật toán và tạo được một chương trình đơn giản; hiểu chương trình là dãy lệnh điều khiển.', '3.4.TC2: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định.', '8.C1.4: Hiểu nguyên lý máy tính thực thi các câu lệnh theo trình tự logic - cơ sở cho thuật toán AI.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 12. Từ thuật toán đến chương trình (Tiết 2)', '2. Thực hành: Tạo chương trình điều khiển máy tính thực hiện thuật toán', 'practice', 'Tạo được một chương trình đơn giản điều khiển nhân vật di chuyển và vẽ hình trong Scratch.', '3.4.TC2: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định.', '8.C2.5: Thực hành lắp ghép các khối lệnh logic để điều khiển đối tượng thực hiện nhiệm vụ đặt ra.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 13. Biểu diễn dữ liệu (Tiết 1)', '1. Kiểu dữ liệu; 2. Hằng, biến, biểu thức', 'theory', 'Nêu được khái niệm hằng, biến, kiểu dữ liệu, biểu thức và sử dụng được các khái niệm này.', '3.4.TC2: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định.', '8.C1.5: Hiểu cách máy tính/AI lưu trữ và xử lý các dạng dữ liệu khác nhau thông qua biến và hằng.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 13. Biểu diễn dữ liệu (Tiết 2)', '3. Thực hành: Sử dụng hằng, biến, biểu thức trong chương trình', 'practice', 'Sử dụng được các khái niệm hằng, biến, kiểu dữ liệu, biểu thức trong chương trình đơn giản trên Scratch.', '3.4.TC2: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định.', '8.C2.6: Vận dụng biến và biểu thức để xây dựng thuật toán tính toán tự động trong phần mềm.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 14. Cấu trúc điều khiển (Tiết 1)', '1. Cấu trúc điều khiển cơ bản (tuần tự, rẽ nhánh, lặp)', 'theory', 'Thể hiện được cấu trúc tuần tự, rẽ nhánh và lặp ở chương trình trong môi trường lập trình trực quan.', '3.4.TC2: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định.', '8.C1.6: Hiểu cấu trúc ra quyết định (rẽ nhánh IF-THEN) và vòng lặp trong thuật toán xử lý thông minh.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 14. Cấu trúc điều khiển (Tiết 2)', '2. Thực hành: Xây dựng trò chơi Đoán số', 'practice', 'Lắp ghép các khối lệnh nếu...thì, lặp lại cho đến khi để hoàn thiện chương trình trò chơi Đoán số trên Scratch.', '3.4.TC2: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một nhiệm vụ cụ thể.', '8.C2.7: Phát triển chương trình trò chơi tương tác minh họa cơ chế phản hồi thông minh của máy tính.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15. Gỡ lỗi (Tiết 1)', '1. Kiểm thử và phân loại lỗi; 2. Phát hiện lỗi và sửa lỗi lôgic', 'theory', 'Nhận diện tình huống chương trình chạy sai kịch bản, phân biệt lỗi cú pháp và lỗi logic, đề xuất phương án sửa lỗi.', '5.1.TC2: Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và chương trình số.', '8.D2.3: Nhận biết tầm quan trọng của việc kiểm thử và tinh chỉnh thuật toán khi chương trình xuất hiện sai số.'],
  ['Chủ đề 5: Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15. Gỡ lỗi (Tiết 2)', '3. Thực hành: Gỡ lỗi', 'practice', 'Thực hành chạy thử chương trình Đoán số có giới hạn số lần đoán, phát hiện lỗi logic hiển thị và chỉnh sửa thành công.', '5.1.TC2: Chọn được giải pháp cho các vấn đề kỹ thuật khi vận hành chương trình.', '8.D2.4: Thực hành kiểm thử, gỡ lỗi và cải tiến sản phẩm phần mềm.'],
  ['Chủ đề 6: Hướng nghiệp với Tin học', 'Bài 16. Tin học với nghề nghiệp (Tiết 1)', '1. Tin học giúp nâng cao hiệu quả công việc', 'theory', 'Nêu được một số nghề nghiệp mà ứng dụng tin học làm tăng hiệu quả; nêu tên một số nghề thuộc lĩnh vực tin học.', '1.2.TC2: Thảo luận về các cơ hội phát triển năng lực số của bản thân và cập nhật sự phát triển công nghệ số.', '8.A3.1: Phân tích được những thay đổi mà AI và công nghệ số mang lại cho các ngành nghề trong tương lai.'],
  ['Chủ đề 6: Hướng nghiệp với Tin học', 'Bài 16. Tin học với nghề nghiệp (Tiết 2)', '2. Bình đẳng giới trong sử dụng máy tính và ứng dụng tin học', 'theory', 'Nhận thức và trình bày được vấn đề bình đẳng giới trong việc sử dụng máy tính và ứng dụng tin học, nêu ví dụ.', '2.5.TC2: Thảo luận các khía cạnh đa dạng về văn hóa và hệ thống trong môi trường số.', '8.B3.1: Nhận thức được yêu cầu đảm bảo bình đẳng, không định kiến giới khi ứng dụng công nghệ và xây dựng hệ thống AI.'],
];

// BẢNG TÍCH HỢP NĂNG LỰC SỐ VÀ NĂNG LỰC AI VÀO MÔN TIN HỌC LỚP 9 (29 TIẾT - NLS-AI-9_7802a15c.pdf)
const GRADE_9_RAW: RawPeriodTuple[] = [
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 1. Thế giới kĩ thuật số (mục 1, 2)', '1. Thiết bị có gắn bộ xử lý thông tin; 2. Khả năng của máy tính', 'theory', 'Nhận biết sự có mặt của các thiết bị có gắn bộ xử lý thông tin ở khắp nơi; nêu khả năng của máy tính và ứng dụng thực tế.', '6.1.TC2: Áp dụng các nguyên tắc cơ bản của AI để hiểu sự hiện diện của AI trong thiết bị số.', '9.A2.1: Nêu được các chứng cứ để giải thích tại sao AI lại có tác động lớn đến xã hội.'],
  ['Chủ đề 1. Máy tính và cộng đồng', 'Bài 1. Thế giới kĩ thuật số (mục 3)', '3. Tác động của công nghệ thông tin lên giáo dục và xã hội', 'theory', 'Giải thích được tác động của công nghệ thông tin lên giáo dục và xã hội thông qua các ví dụ cụ thể.', '4.3.TC2: Giải thích các nguy cơ đe dọa sức khỏe thể chất, tinh thần khi sử dụng công nghệ số.', '9.A1.1: Hình thành nhận thức và phát triển quan điểm phản biện về thách thức xã hội trong kỷ nguyên AI.'],
  ['Chủ đề 2. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 2. Thông tin trong giải quyết vấn đề (mục 1)', '1. Vai trò của chất lượng thông tin trong giải quyết vấn đề', 'theory', 'Giải thích sự cần thiết phải quan tâm đến chất lượng thông tin khi tìm kiếm, tiếp nhận, trao đổi. Nêu ví dụ minh họa.', '1.2.TC2: Thực hiện phân tích, so sánh và đánh giá độ tin cậy của nguồn dữ liệu, thông tin.', '9.A3.1: Phát triển tư duy phản biện – biết phân tích, đánh giá thông tin do AI cung cấp.'],
  ['Chủ đề 2. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 2. Thông tin trong giải quyết vấn đề (mục 2)', '2. Các tiêu chí đánh giá chất lượng thông tin', 'theory', 'Giải thích được tính mới, tính chính xác, tính đầy đủ, tính sử dụng được của thông tin. Nêu ví dụ minh họa.', '1.2.TC2: Thực hiện phân tích, diễn giải và đánh giá độ tin cậy thông tin dựa trên tiêu chí.', '9.B3.1: Giải thích tầm quan trọng của việc kiểm chứng thông tin, nhận biết sự thiên vị/thành kiến trong AI.'],
  ['Chủ đề 2. Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', 'Bài 3. Thực hành: Đánh giá chất lượng thông tin', 'Nhiệm vụ 1: Tìm kiếm theo mục đích; Nhiệm vụ 2: Đánh giá chất lượng thông tin', 'practice', 'Tìm kiếm được thông tin để giải quyết vấn đề; đánh giá được chất lượng thông tin trong giải quyết vấn đề chọn trường THPT.', '1.1.TC2: Tổ chức tìm kiếm dữ liệu; 1.2.TC2: Đánh giá độ tin cậy thông tin.', '9.A3.1: Thực hành dùng AI/công cụ số để tìm kiếm, tóm tắt thông tin và rèn tư duy phản biện.'],
  ['Chủ đề 3. Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 4. Một số vấn đề pháp lí về sử dụng dịch vụ Internet (mục 1)', '1. Một số tác động tiêu cực của công nghệ kĩ thuật số', 'theory', 'Trình bày được một số tác động tiêu cực của công nghệ kỹ thuật số đối với đời sống con người và xã hội.', '4.2.TC2: Phân biệt rủi ro trong môi trường số; bảo vệ dữ liệu cá nhân và quyền riêng tư.', '9.A2.2: Giải thích được các vấn đề về thiên vị, thành kiến, rủi ro mà AI có thể gây ra.'],
  ['Chủ đề 3. Đạo đức, pháp luật và văn hóa trong môi trường số', 'Bài 4. Một số vấn đề pháp lí về sử dụng dịch vụ Internet (mục 2)', '2. Hành vi vi phạm pháp luật và văn hóa trong môi trường số', 'theory', 'Nêu nội dung Luật CNTT, Nghị định Internet, khía cạnh pháp lý sở hữu thông tin. Nêu ví dụ hành vi vi phạm.', '3.3.TC2: Thảo luận quy tắc bản quyền; 2.5.TC2: Thảo luận chuẩn mực hành vi ứng xử mạng.', '9.B2.1: Trình bày vai trò người dùng trong kiểm soát, chịu trách nhiệm với kết quả AI tạo ra.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 5. Tìm hiểu phần mềm mô phỏng', '1. Phần mềm mô phỏng; 2. Khám phá tri thức với phần mềm mô phỏng', 'theory', 'Giải thích phần mềm mô phỏng là gì, lấy ví dụ; nêu lợi ích của phần mềm mô phỏng.', '5.2.TC2: Dựa trên nhu cầu để lựa chọn phần mềm số giải quyết nhiệm vụ.', '9.D1.1: Trình bày vai trò con người là người dẫn dắt trong thiết kế, vận hành mô hình mô phỏng.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 6. Thực hành: Khai thác phần mềm mô phỏng (nhiệm vụ 1, 2)', 'Nhiệm vụ 1: Chuyển hóa năng lượng; Nhiệm vụ 2: Đo năng lượng', 'practice', 'Nêu kiến thức thu nhận từ mô phỏng; nhận biết sự mô phỏng giúp khám phá tri thức và giải quyết vấn đề.', '5.3.TC2: Phân biệt các công cụ số được dùng để tạo ra kiến thức mới.', '9.C2.1: Vận dụng kiến thức để hiểu cách mô hình tính toán hỗ trợ giải quyết bài toán thực tế.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 6. Thực hành: Khai thác phần mềm mô phỏng (nhiệm vụ 3)', 'Nhiệm vụ 3: Tỉ lệ vàng trong ngôi sao năm cánh', 'practice', 'Sử dụng phần mềm mô phỏng hình học để khám phá tri thức về tỉ lệ vàng trong ngôi sao 5 cánh.', '1.3.TC2: Tổ chức, khai thác và xử lý dữ liệu số trong môi trường có cấu trúc.', '9.C3.1: Hiểu tầm quan trọng của việc thu thập bộ dữ liệu đo đạc chính xác để phân tích tri thức.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 7. Trình bày thông tin trong trao đổi và hợp tác', '1. Trình bày thông tin trong trao đổi và hợp tác; 2. Sử dụng công cụ trực quan', 'theory', 'Sử dụng bài trình chiếu và sơ đồ tư duy trong trao đổi, hợp tác; biết khả năng đính kèm tệp đa phương tiện.', '2.1.TC2: Lựa chọn công nghệ số phù hợp; 3.1.TC2: Tạo/chỉnh sửa nội dung số.', '9.A3.1: Nâng cao kỹ năng hợp tác, giao tiếp hiệu quả giữa con người có sự hỗ trợ của công cụ số.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 8. Thực hành: Sử dụng công cụ trực quan trình bày thông tin (nhiệm vụ 1, 2)', 'Nhiệm vụ 1: Sơ đồ tư duy đính kèm dữ liệu; Nhiệm vụ 2: Liên kết dữ liệu', 'practice', 'Tạo sơ đồ tư duy có đính kèm văn bản, ảnh, video, trang tính; trình bày sơ đồ tư duy trước nhóm.', '2.4.TC2: Lựa chọn công cụ số cho quá trình hợp tác; 3.2.TC2: Tích hợp các nội dung số.', '9.C2.1: Vận dụng tư duy cấu trúc dữ liệu trực quan để thể hiện ý tưởng dự án.'],
  ['Chủ đề 4. Ứng dụng tin học', 'Bài 8. Thực hành: Sử dụng công cụ trực quan trình bày thông tin (nhiệm vụ 3)', 'Nhiệm vụ 3: Tạo bài trình chiếu có sử dụng công cụ trực quan', 'practice', 'Sử dụng hình ảnh, biểu đồ, video hợp lý; tạo bài trình chiếu có sử dụng hình ảnh, sơ đồ, video hợp lý.', '3.1.TC2: Thể hiện bản thân qua việc tạo nội dung số; 3.3.TC2: Thảo luận quy tắc bản quyền.', '9.A3.2: Nêu cách dùng AI/công cụ số làm phương tiện thể hiện bản thân, truyền tải thông điệp.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 9a. Sử dụng công cụ xác thực dữ liệu (mục 1)', '1. Công cụ xác thực dữ liệu trong bảng tính', 'theory', 'Sử dụng được công cụ xác thực dữ liệu (Data Validation) của bảng tính để giải quyết bài toán quản lý tài chính.', '1.3.TC2: Tổ chức dữ liệu trong môi trường có cấu trúc; 5.1.TC2: Hướng dẫn phòng ngừa lỗi.', '9.C3.1: Hiểu rằng dữ liệu sạch và xác thực là điều kiện bắt buộc để các thuật toán/AI xử lý đúng.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 9a. Sử dụng công cụ xác thực dữ liệu (mục 2 – Thực hành)', '2. Thực hành: Sử dụng công cụ xác thực dữ liệu', 'practice', 'Thực hành thiết lập quy tắc xác thực (List, Whole number) và tùy chỉnh Input Message, Error Alert.', '3.1.TC2: Tạo/chỉnh sửa nội dung số dạng bảng tính; 5.1.TC2: Thiết lập biện pháp kiểm soát lỗi.', '9.C3.1: Thực hiện cải thiện bộ dữ liệu để kiểm soát chất lượng dữ liệu đầu vào.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 10a. Sử dụng hàm COUNTIF', '1. Hàm COUNTIF; 2. Thực hành sử dụng hàm COUNTIF', 'practice', 'Sử dụng được hàm đếm theo điều kiện COUNTIF trong giải quyết bài toán thực tế về quản lý tài chính.', '1.3.TC2: Sắp xếp, truy xuất dữ liệu; 3.4.TC2: Liệt kê công thức tính toán tự động.', '9.C2.1: Hiểu nguyên lý máy tính thống kê và phân loại tần suất dữ liệu tự động.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 11a. Sử dụng hàm SUMIF', '1. Hàm SUMIF; 2. Thực hành sử dụng hàm SUMIF', 'practice', 'Biết sử dụng hàm tính tổng theo điều kiện SUMIF để giải quyết bài toán quản lý tài chính gia đình.', '1.3.TC2: Tính toán và xử lý dữ liệu có cấu trúc; 5.2.TC2: Lựa chọn giải pháp công thức tối ưu.', '9.C2.1: Vận dụng nguyên lý tổng hợp và gom nhóm dữ liệu định lượng phục vụ phân tích tự động.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 12a. Sử dụng hàm IF (mục 1)', '1. Hàm IF (Quy tắc logic rẽ nhánh điều kiện)', 'theory', 'Sử dụng được hàm điều kiện IF trong giải quyết bài toán thực tiễn về quản lý tài chính.', '3.4.TC2: Xây dựng bước logic/điều kiện cho hệ thống xử lý; 5.2.TC2: Giải quyết vấn đề bằng logic.', '9.D1.1: Hiểu nguyên lý ra quyết định dựa trên quy tắc điều kiện – nền tảng hệ thống chuyên gia/AI.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 12a. Sử dụng hàm IF (mục 2 – Thực hành)', '2. Thực hành: Sử dụng hàm IF trong bảng tính', 'practice', 'Thực hành lập công thức hàm IF lồng nhau trong bảng tính để tự động đưa ra nhận xét trạng thái chi tiêu.', '3.1.TC2: Tạo lập và chỉnh sửa công thức tính toán điều kiện trong bảng tính.', '9.C2.1: Thiết lập thuật toán phân loại dữ liệu đầu vào thành các nhãn đầu ra dựa trên ngưỡng điều kiện.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 13a. Hoàn thiện bảng tính quản lí tài chính gia đình (mục 1)', '1. Trang tính tổng hợp liên kết dữ liệu', 'theory', 'Tạo được trang tính tổng hợp thông tin thu, chi gia đình; hiểu cách tham chiếu công thức liên trang tính.', '1.3.TC2: Tổ chức, kết nối dữ liệu giữa các trang tính; 3.2.TC2: Tích hợp dữ liệu nhiều nguồn.', '9.C3.1: Tối ưu hóa cấu trúc dữ liệu liên kết để phục vụ phân tích tổng thể hệ thống.'],
  ['Chủ đề 4. Ứng dụng tin học - Bảng tính nâng cao', 'Bài 13a. Hoàn thiện bảng tính quản lí tài chính gia đình (mục 2 – Thực hành)', '2. Thực hành: Hoàn thiện bảng tính quản lí tài chính gia đình', 'practice', 'Hoàn thiện bảng tính quản lý tài chính gia đình; tạo biểu đồ trực quan cân đối thu chi và đề xuất điều chỉnh.', '3.2.TC2: Tích hợp, trình bày dữ liệu dạng biểu đồ; 5.3.TC2: Sử dụng sáng tạo bảng tính giải quyết bài toán.', '9.A3.1: Thực hành tự đặt mục tiêu và theo dõi kế hoạch tài chính bằng công cụ số.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 14. Giải quyết vấn đề (mục 1)', '1. Khái niệm và 5 bước trong quy trình giải quyết vấn đề', 'theory', 'Trình bày được quá trình giải quyết vấn đề qua 5 bước (Tìm hiểu, Phân tích, Lựa chọn, Thực hiện, Đánh giá).', '5.2.TC2: Lập quy trình giải quyết vấn đề; 5.4.TC2: Đánh giá hiệu quả giải pháp.', '9.A1.1 & 9.D1.1: Hiểu quy trình giải quyết vấn đề của con người làm cơ sở định hướng giải pháp số/AI.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 14. Giải quyết vấn đề (mục 2)', '2. Mô tả giải pháp dưới dạng thuật toán (sơ đồ khối và ngôn ngữ tự nhiên)', 'theory', 'Mô tả được giải pháp dưới dạng thuật toán (bằng phương pháp liệt kê các bước hoặc bằng sơ đồ khối).', '3.4.TC2: Mô tả chuỗi lệnh/điều kiện cho máy tính thực hiện; 5.2.TC2: Biểu diễn giải pháp kỹ thuật.', '9.D1.1: Hiểu cách xây dựng cấu trúc thuật toán điều khiển rô-bốt hoặc hệ thống AI.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15. Bài toán Tin học (mục 1)', '1. Khái niệm bài toán Tin học và xác định Input/Output', 'theory', 'Giải thích khái niệm bài toán tin học là nhiệm vụ giao cho máy tính; xác định được Đầu vào và Đầu ra của bài toán.', '3.4.TC2: Xác định yếu tố đầu vào, đầu ra để xây dựng chương trình; 5.1.TC2: Nhận diện công việc máy tính làm được.', '9.D1.1: Trình bày vai trò con người trong phát biểu bài toán, xác định dữ liệu vào/ra cho AI.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 15. Bài toán Tin học (mục 2)', '2. Quy trình con người giao bài toán cho máy tính giải quyết (4 bước)', 'theory', 'Giải thích các bước giải quyết vấn đề chuyển giao cho máy tính; nêu quy trình con người giao bài toán cho máy tính.', '3.4.TC2: Lập kế hoạch phát triển các bước giải bài toán; 5.1.TC2: Kiểm thử và gỡ lỗi.', '9.D2.1: Thiết kế và thực hiện các kiểm tra đơn giản để đánh giá, cải tiến thuật toán.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 16. Thực hành: Lập chương trình máy tính (nhiệm vụ 1)', 'Nhiệm vụ 1: Lập chương trình Scratch tính tiền lương', 'practice', 'Sử dụng cấu trúc tuần tự, rẽ nhánh, lặp; giải thích chương trình là bản mô tả thuật toán bằng ngôn ngữ máy tính hiểu.', '3.4.TC2: Lập chương trình máy tính sử dụng các cấu trúc điều khiển; 5.1.TC2: Phát hiện và sửa lỗi chương trình.', '9.C2.1: Vận dụng kiến thức lập trình tạo công cụ tự động; 9.D2.1: Kiểm thử đánh giá chất lượng sản phẩm.'],
  ['Chủ đề 5. Giải quyết vấn đề với sự trợ giúp của máy tính', 'Bài 16. Thực hành: Lập chương trình máy tính (nhiệm vụ 2)', 'Nhiệm vụ 2: Lập chương trình Scratch tìm giá trị lớn nhất trong dãy số', 'practice', 'Thực hành lập chương trình tìm giá trị lớn nhất của dãy số; thực hiện kiểm thử với các bộ dữ liệu đa dạng để sửa lỗi.', '3.4.TC2: Lập trình giải quyết bài toán xử lý dãy dữ liệu; 5.1.TC2: Xử lý các ngoại lệ và lỗi kĩ thuật.', '9.C3.1: Cải thiện thuật toán/chương trình để xử lý đúng các trường hợp dữ liệu bất thường hoặc nhiễu.'],
  ['Chủ đề 6. Hướng nghiệp với Tin học', 'Bài 17. Tin học và thế giới nghề nghiệp (mục 1)', '1. Các nhóm nghề nghiệp chính trong lĩnh vực Tin học', 'theory', 'Trình bày công việc đặc thù, sản phẩm của 3 nhóm nghề Tin học; nhận biết đặc trưng hướng KH máy tính và Tin học ứng dụng.', '5.4.TC2: Chỉ ra nơi tìm kiếm cơ hội phát triển bản thân; 1.1.TC2: Khai thác thông tin hướng nghiệp.', '9.A3.3: Phân tích những thay đổi do AI mang lại cho các ngành nghề; liệt kê kỹ năng cần thiết để làm việc với AI.'],
  ['Chủ đề 6. Hướng nghiệp với Tin học', 'Bài 17. Tin học và thế giới nghề nghiệp (mục 2)', '2. Đặc điểm nghề nghiệp Tin học và Bình đẳng giới trong công nghệ', 'theory', 'Nêu ý kiến cá nhân về nhóm nghề; tìm hiểu công việc ở doanh nghiệp; giải thích nam/nữ đều thích hợp với ngành Tin học.', '2.3.TC2: Thảo luận cơ hội nâng cao NLS và bình đẳng xã hội số; 5.4.TC2: Định hướng phát triển NLS cá nhân.', '9.A3.3 & 9.B3.1: Phân tích cơ hội nghề nghiệp tương lai; nhận thức và xóa bỏ định kiến giới trong công nghệ và AI.'],
];

export function getPeriodsForGrade(grade: 6 | 7 | 8 | 9): CurriculumPeriodSpec[] {
  const sourceList =
    grade === 6
      ? GRADE_6_RAW
      : grade === 7
      ? GRADE_7_RAW
      : grade === 8
      ? GRADE_8_RAW
      : GRADE_9_RAW;

  const gradeInfo =
    NOTEBOOK_GRADE_SOURCES.find((g) => g.grade === grade) || NOTEBOOK_GRADE_SOURCES[0];
  const sgkFile = gradeInfo.sgkPdfFile;
  const nlsAiFile = gradeInfo.nlsDocxFile;

  return sourceList.map(
    ([topic, lessonTitle, knowledgeSection, lessonType, yccd, digitalCompetency, aiCompetency], idx) => {
      const period = idx + 1;
      const startPage = 5 + idx * 3;
      const endPage = startPage + 2;
      const examMilestone: CurriculumPeriodSpec['examMilestone'] =
        period <= 7
          ? 'GK1'
          : period <= 15
          ? 'CK1'
          : period <= 22
          ? 'GK2'
          : period <= 27
          ? 'CK2'
          : 'TONG_KET';

      return {
        id: `k${grade}-tiet-${period}`,
        grade,
        period,
        topic,
        lessonTitle: `Tiết ${period}: ${lessonTitle}`,
        knowledgeSection,
        lessonType,
        sgkFile,
        nlsAiFile,
        nlsPdfUrl: gradeInfo.nlsPdfUrl,
        sgkPages: `Trang ${startPage}–${endPage} (${sgkFile})`,
        examMilestone,
        yccd,
        digitalCompetency,
        aiCompetency,
      };
    }
  );
}

export interface CrosswordClueItem {
  id: string;
  rowNumber: number;
  clue: string;
  answer: string;
  hintTileLabel: string;
}

export interface NotebookLMLessonBlueprint {
  lessonId: string;
  grade?: 6 | 7 | 8 | 9;
  periodNumber: number;
  topicCode: string;
  title: string;
  lessonType: 'theory' | 'practice';
  notebookSourceSummary: string[];
  competencyTarget: string;
  digitalCompetency?: string;
  aiCompetency?: string;
  sgkReference?: string;
  stage1: {
    videoTitle: string;
    videoUrl: string;
    videoStops: { time: string; question: string; answer: string }[];
    secretPictureTitle: string;
    secretPictureMeaning: string;
    crosswordClues: CrosswordClueItem[];
    openScenarioPrompt: string;
    expectedWordCloud: string[];
  };
  stage2: {
    worksheetTitle: string;
    bucketA: string;
    bucketB: string;
    dragItems: { id: string; text: string; correctBox: 'data' | 'info' }[];
    blank1Label: string;
    blank1Answer: string;
    blank2Label: string;
    blank2Answer: string;
    matchingPairs: { id: string; left: string; right: string }[];
    textImagePrompt: string;
    textImageAnswerKeywords: string[];
    fillBlankQuestions?: CustomFillBlankQuestion[];
    shortAnswerPrompt?: string;
    shortAnswerQuestions?: CustomShortAnswerQuestion[];
  };
  stage3: {
    recommendedMode: 'theory' | 'practice';
    quizQuestions: MinigameQuestionItem[];
    practicalTaskTitle: string;
    practicalTaskSteps: string[];
    practicalAllowedExtensions: string[];
  };
  stage4: {
    projectTitle: string;
    projectObjective: string;
    steps: { badge: string; title: string; desc: string }[];
    rubrics: { id: string; title: string; desc: string; points: number }[];
  };
}

export function buildLessonBlueprintFromPeriod(
  spec: CurriculumPeriodSpec
): NotebookLMLessonBlueprint {
  const baseDefault = NOTEBOOK_LM_LESSONS[0];
  const isPractice = spec.lessonType === 'practice';

  return {
    lessonId: spec.id,
    grade: spec.grade,
    periodNumber: spec.period,
    topicCode: `Khối ${spec.grade} • ${spec.topic}`,
    title: spec.lessonTitle,
    lessonType: spec.lessonType,
    sgkReference: `${spec.sgkPages} ↔ ${spec.nlsAiFile}`,
    digitalCompetency: spec.digitalCompetency,
    aiCompetency: spec.aiCompetency,
    notebookSourceSummary: [
      `Tài liệu nguồn NotebookLM [${spec.sgkFile} - ${spec.sgkPages}]: ${spec.yccd}`,
      `Ánh xạ Năng lực số [${spec.nlsAiFile}]: ${spec.digitalCompetency}`,
      `Ánh xạ Năng lực AI [${spec.nlsAiFile}]: ${spec.aiCompetency}`,
    ],
    competencyTarget: `${spec.yccd} | ${spec.digitalCompetency} | ${spec.aiCompetency}`,
    stage1: {
      videoTitle: `Video Khởi động Khối ${spec.grade} - ${spec.lessonTitle} (03:00)`,
      videoUrl: `https://cloudstorage.cloudplay.edu.vn/tinhoc${spec.grade}/tiet${spec.period}/khoi-dong.mp4`,
      videoStops: [
        {
          time: '00:45',
          question: `Trong tình huống mở đầu của ${spec.lessonTitle}, công nghệ số đóng vai trò gì?`,
          answer: `Giúp thu nhận, xử lý và tự động hóa công việc nhanh chóng theo chuẩn ${spec.digitalCompetency.split(':')[0]}.`,
        },
        {
          time: '02:10',
          question: `Làm thế nào để ứng dụng trợ lý AI an toàn và hiệu quả trong nội dung bài học này?`,
          answer: `Đặt câu lệnh rõ ràng và kiểm chứng thông tin theo ${spec.aiCompetency.split(':')[0]}.`,
        },
      ],
      secretPictureTitle: `TRANH BÍ MẬT KHỐI ${spec.grade} • TIẾT ${spec.period}`,
      secretPictureMeaning: `Chinh phục mục tiêu ${spec.lessonTitle}: Kết hợp vững vàng kiến thức ${spec.sgkFile} cùng Năng lực số & Trí tuệ nhân tạo (${spec.nlsAiFile})!`,
      crosswordClues:
        spec.grade === 6 && spec.period === 1
          ? baseDefault.stage1.crosswordClues
          : [
              {
                id: `${spec.id}-cw1`,
                rowNumber: 1,
                clue: `Khái niệm nền tảng đầu tiên trong ${spec.sgkFile} của bài học này là gì?`,
                answer: 'DULIEUSO',
                hintTileLabel: 'Mảnh ghép 1: Kiến thức cốt lõi SGK',
              },
              {
                id: `${spec.id}-cw2`,
                rowNumber: 2,
                clue: `Năng lực khai thác và ứng dụng công nghệ hiện đại trong ${spec.nlsAiFile} gọi là gì?`,
                answer: 'NANGLUCSO',
                hintTileLabel: 'Mảnh ghép 2: Năng lực số (NLS)',
              },
              {
                id: `${spec.id}-cw3`,
                rowNumber: 3,
                clue: `Công nghệ thông minh hỗ trợ con người giải quyết vấn đề tự động là gì?`,
                answer: 'TRITUENHANTAO',
                hintTileLabel: 'Mảnh ghép 3: Năng lực AI',
              },
              {
                id: `${spec.id}-cw4`,
                rowNumber: 4,
                clue: `Nguyên tắc quan trọng nhất khi hoạt động trên môi trường mạng Internet là gì?`,
                answer: 'ANTOAN',
                hintTileLabel: 'Mảnh ghép 4: An toàn & Đạo đức số',
              },
            ],
      openScenarioPrompt: `Liên hệ thực tế (${spec.lessonTitle}): Em hãy nêu 1 ví dụ ứng dụng công nghệ số hoặc AI liên quan đến bài học hôm nay?`,
      expectedWordCloud: [
        `Tin học ${spec.grade}`,
        'Dữ liệu số',
        'Trợ lý AI',
        'An toàn mạng',
        'Sáng tạo số',
      ],
    },
    stage2: {
      worksheetTitle: `Phiếu học tập số ${spec.period} (Khối ${spec.grade}): ${spec.lessonTitle}`,
      bucketA:
        spec.grade === 6 && spec.period === 1
          ? baseDefault.stage2.bucketA
          : 'Hộp A: Kiến thức & Công cụ Chuẩn',
      bucketB:
        spec.grade === 6 && spec.period === 1
          ? baseDefault.stage2.bucketB
          : 'Hộp B: Ứng dụng Năng lực số & AI',
      dragItems:
        spec.grade === 6 && spec.period === 1
          ? baseDefault.stage2.dragItems
          : [
              {
                id: `${spec.id}-d1`,
                text: `Nắm vững khái niệm cốt lõi trong ${spec.sgkFile} (${spec.sgkPages})`,
                correctBox: 'data',
              },
              {
                id: `${spec.id}-d2`,
                text: `Vận dụng ${spec.digitalCompetency.split('(')[0].trim()}`,
                correctBox: 'info',
              },
              {
                id: `${spec.id}-d3`,
                text: `Tuân thủ quy trình chuẩn mực thao tác trên máy tính`,
                correctBox: 'data',
              },
              {
                id: `${spec.id}-d4`,
                text: `Tích hợp ${spec.aiCompetency.split('(')[0].trim()}`,
                correctBox: 'info',
              },
            ],
      blank1Label: (() => {
        const ext = AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`];
        return ext?.fillBlankQuestions?.[0]?.label ? `Điền khuyết ${ext.fillBlankQuestions[0].label}` : 'Từ khóa 1';
      })(),
      blank1Answer: (() => {
        const ext = AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`];
        return ext?.fillBlankQuestions?.[0]?.correctAnswer || 'Xử lý thông tin';
      })(),
      blank2Label: (() => {
        const ext = AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`];
        return ext?.fillBlankQuestions?.[1]?.label ? `Điền khuyết ${ext.fillBlankQuestions[1].label}` : 'Từ khóa 2';
      })(),
      blank2Answer: (() => {
        const ext = AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`];
        return ext?.fillBlankQuestions?.[1]?.correctAnswer || 'Lưu trữ thông tin';
      })(),
      matchingPairs:
        spec.grade === 6 && spec.period === 1
          ? baseDefault.stage2.matchingPairs
          : [
              {
                id: `${spec.id}-mp1`,
                left: `Yêu cầu cần đạt (${spec.sgkFile})`,
                right: spec.yccd,
              },
              {
                id: `${spec.id}-mp2`,
                left: `Năng lực số (${spec.nlsAiFile})`,
                right: spec.digitalCompetency,
              },
              {
                id: `${spec.id}-mp3`,
                left: `Năng lực AI (${spec.nlsAiFile})`,
                right: spec.aiCompetency,
              },
            ],
      textImagePrompt: (() => {
        const ext = AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`];
        return ext?.shortAnswerPrompt || `Dựa vào nội dung ${spec.lessonTitle} (${spec.sgkPages}), hãy trả lời câu hỏi thực tế.`;
      })(),
      textImageAnswerKeywords: ['dữ liệu', 'thông tin', 'năng lực số', 'trí tuệ nhân tạo'],
      fillBlankQuestions: (AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`])?.fillBlankQuestions || [],
      shortAnswerPrompt: (AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`])?.shortAnswerPrompt || '',
      shortAnswerQuestions: (AUTHENTIC_PDF_EXTRACTS[spec.id] || AUTHENTIC_PDF_EXTRACTS[`k${spec.grade}-tiet-${spec.period}`])?.shortAnswerQuestions || [],
    },
    stage3: {
      recommendedMode: isPractice ? 'practice' : 'theory',
      quizQuestions:
        spec.grade === 6 && spec.period === 1
          ? INITIAL_MINIGAME_QUESTIONS.slice(0, 6).map((q) => ({ ...q, points: 0.5 }))
          : [
              {
                id: `${spec.id}-q1`,
                order: 1,
                question: `Câu 1 [Nhận biết - ${spec.lessonTitle}]: Trọng tâm kiến thức "${spec.knowledgeSection}" giúp em nắm vững điều gì?`,
                timeLimitSec: 25,
                points: 0.5,
                status: 'Đã duyệt',
                options: [
                  {
                    letter: 'A',
                    text: spec.yccd,
                    explanation: `Đúng chuẩn Yêu cầu cần đạt của ${spec.lessonTitle} (${spec.sgkFile}).`,
                    isCorrect: true,
                  },
                  {
                    letter: 'B',
                    text: 'Bỏ qua việc kiểm tra dữ liệu đầu vào và quy tắc an toàn thông tin.',
                    explanation: 'Sai nguyên tắc chuẩn Tin học GDPT 2018.',
                    isCorrect: false,
                  },
                  {
                    letter: 'C',
                    text: 'Chỉ ghi nhớ lý thuyết mà không cần thực hành hay vận dụng.',
                    explanation: 'Sai định hướng phát triển năng lực.',
                    isCorrect: false,
                  },
                  {
                    letter: 'D',
                    text: 'Sử dụng phần mềm tùy ý không theo hướng dẫn.',
                    explanation: 'Sai quy trình kỹ thuật.',
                    isCorrect: false,
                  },
                ],
              },
              {
                id: `${spec.id}-q2`,
                order: 2,
                question: `Câu 2 [Nhận biết - Chủ đề ${spec.topic}]: Khi thực hiện nhiệm vụ trong ${spec.lessonTitle}, thao tác nào sau đây là chuẩn xác nhất?`,
                timeLimitSec: 25,
                points: 0.5,
                status: 'Đã duyệt',
                options: [
                  {
                    letter: 'A',
                    text: 'Làm ngẫu nhiên không cần xác định dữ liệu đầu vào.',
                    explanation: 'Sai quy trình xử lý thông tin.',
                    isCorrect: false,
                  },
                  {
                    letter: 'B',
                    text: `Xác định rõ mục tiêu "${spec.knowledgeSection}" và thực hiện tuần tự các bước hướng dẫn trong ${spec.sgkPages}.`,
                    explanation: 'Chính xác theo quy trình bài học.',
                    isCorrect: true,
                  },
                  {
                    letter: 'C',
                    text: 'Tắt máy tính ngay khi chưa lưu kết quả làm việc.',
                    explanation: 'Sai: gây mất dữ liệu.',
                    isCorrect: false,
                  },
                  {
                    letter: 'D',
                    text: 'Chia sẻ mật khẩu cá nhân cho người lạ trên mạng.',
                    explanation: 'Sai quy tắc an toàn thông tin.',
                    isCorrect: false,
                  },
                ],
              },
              {
                id: `${spec.id}-q3`,
                order: 3,
                question: `Câu 3 [Thông hiểu - Năng lực số]: Trong ${spec.lessonTitle}, chỉ báo Năng lực số nào được phát triển trọng tâm?`,
                timeLimitSec: 25,
                points: 0.5,
                status: 'Đã duyệt',
                options: [
                  {
                    letter: 'A',
                    text: 'Không sử dụng bất kỳ công cụ kỹ thuật số nào.',
                    explanation: 'Sai.',
                    isCorrect: false,
                  },
                  {
                    letter: 'B',
                    text: 'Sao chép trái phép nội dung không rõ nguồn gốc.',
                    explanation: 'Vi phạm đạo đức và bản quyền số.',
                    isCorrect: false,
                  },
                  {
                    letter: 'C',
                    text: spec.digitalCompetency,
                    explanation: `Chính xác theo bảng ánh xạ ${spec.nlsAiFile}.`,
                    isCorrect: true,
                  },
                  {
                    letter: 'D',
                    text: 'Xóa toàn bộ thư mục hệ thống của máy tính.',
                    explanation: 'Sai.',
                    isCorrect: false,
                  },
                ],
              },
              {
                id: `${spec.id}-q4`,
                order: 4,
                question: `Câu 4 [Thông hiểu - Năng lực AI]: Theo định hướng ${spec.nlsAiFile}, ứng dụng Trí tuệ nhân tạo (AI) trong bài học này là gì?`,
                timeLimitSec: 25,
                points: 0.5,
                status: 'Đã duyệt',
                options: [
                  {
                    letter: 'A',
                    text: 'Phụ thuộc hoàn toàn vào AI mà không cần suy nghĩ hay kiểm chứng.',
                    explanation: 'Sai nguyên tắc sử dụng AI có trách nhiệm.',
                    isCorrect: false,
                  },
                  {
                    letter: 'B',
                    text: 'Cung cấp thông tin cá nhân nhạy cảm lên công cụ AI công cộng.',
                    explanation: 'Sai quy tắc bảo mật dữ liệu cá nhân.',
                    isCorrect: false,
                  },
                  {
                    letter: 'C',
                    text: 'Dùng AI để tạo thông tin sai sự thật.',
                    explanation: 'Vi phạm đạo đức AI.',
                    isCorrect: false,
                  },
                  {
                    letter: 'D',
                    text: spec.aiCompetency,
                    explanation: `Đúng chuẩn khung Năng lực AI (${spec.nlsAiFile}).`,
                    isCorrect: true,
                  },
                ],
              },
              {
                id: `${spec.id}-q5`,
                order: 5,
                question: `Câu 5 [Vận dụng - Thực tiễn]: Em vận dụng kiến thức "${spec.lessonTitle}" vào học tập và đời sống như thế nào để đạt hiệu quả cao nhất?`,
                timeLimitSec: 25,
                points: 0.5,
                status: 'Đã duyệt',
                options: [
                  {
                    letter: 'A',
                    text: `Kết hợp kiến thức "${spec.knowledgeSection}" với công cụ số để giải quyết bài toán thực tế nhanh chóng, chính xác và an toàn.`,
                    explanation: 'Chính xác: Thể hiện năng lực vận dụng thực tiễn.',
                    isCorrect: true,
                  },
                  {
                    letter: 'B',
                    text: 'Lưu trữ dữ liệu lộn xộn không đặt tên tệp và thư mục.',
                    explanation: 'Sai nguyên tắc tổ chức dữ liệu.',
                    isCorrect: false,
                  },
                  {
                    letter: 'C',
                    text: 'Không kiểm tra lại kết quả sau khi thực hiện.',
                    explanation: 'Sai quy trình giải quyết vấn đề.',
                    isCorrect: false,
                  },
                  {
                    letter: 'D',
                    text: 'Bỏ qua các cảnh báo lỗi của phần mềm.',
                    explanation: 'Sai.',
                    isCorrect: false,
                  },
                ],
              },
              {
                id: `${spec.id}-q6`,
                order: 6,
                question: `Câu 6 [Vận dụng cao - Tổng hợp]: Để hoàn thành tốt sản phẩm của ${spec.lessonTitle} (Khối ${spec.grade}), em cần đảm bảo các tiêu chí nào?`,
                timeLimitSec: 25,
                points: 0.5,
                status: 'Đã duyệt',
                options: [
                  {
                    letter: 'A',
                    text: 'Chỉ cần hình thức đẹp, không cần đúng nội dung.',
                    explanation: 'Chưa đủ yêu cầu cần đạt.',
                    isCorrect: false,
                  },
                  {
                    letter: 'B',
                    text: `Đạt chuẩn yêu cầu cần đạt (${spec.sgkFile}), tổ chức dữ liệu khoa học và ứng dụng công nghệ/AI có trách nhiệm.`,
                    explanation: 'Chính xác! Đạt trọn vẹn 3 tiêu chí đánh giá của tiết học.',
                    isCorrect: true,
                  },
                  {
                    letter: 'C',
                    text: 'Nộp tệp trống không có dữ liệu.',
                    explanation: 'Sai.',
                    isCorrect: false,
                  },
                  {
                    letter: 'D',
                    text: 'Không tuân thủ quy tắc an toàn phòng máy.',
                    explanation: 'Sai.',
                    isCorrect: false,
                  },
                ],
              },
            ],
      practicalTaskTitle: `Phiếu Bài Thực Hành Điện Tử Tiết ${spec.period} (Khối ${spec.grade}): ${spec.lessonTitle}`,
      practicalTaskSteps: [
        `Bước 1: Mở phần mềm thực hành theo hướng dẫn tại ${spec.sgkPages} (${spec.knowledgeSection}) và thực hiện nhiệm vụ trọng tâm.`,
        `Bước 2: Áp dụng tiêu chí ${spec.digitalCompetency.split(':')[0]} và kiểm chứng kết quả với trợ lý AI.`,
        `Bước 3: Chụp ảnh màn hình kết quả hoặc lưu tệp sản phẩm nộp lên Cây thư mục Google Drive của Lớp (Thang điểm: 3.0 điểm).`,
      ],
      practicalAllowedExtensions: ['.png', '.jpg', '.doc', '.docx', '.xls', '.xlsx', '.pptx', '.sb3'],
    },
    stage4: {
      projectTitle: `Hoạt động 4 • Vận dụng thực tế (Khối ${spec.grade} - Tiết ${spec.period}): Ứng dụng ${spec.lessonTitle.replace(/^Tiết \d+:\s*/, '')}`,
      projectObjective: `${spec.yccd} Đồng thời phát triển ${spec.digitalCompetency} và ${spec.aiCompetency}.`,
      steps: [
        {
          badge: 'Bước 1',
          title: 'Khảo sát & Thu thập dữ liệu',
          desc: `Tìm hiểu dữ liệu thực tế liên quan đến ${spec.lessonTitle}.`,
        },
        {
          badge: 'Bước 2',
          title: 'Xử lý số hóa & Ứng dụng AI',
          desc: `Thiết kế sản phẩm số tuân thủ tiêu chuẩn trong ${spec.nlsAiFile}.`,
        },
        {
          badge: 'Bước 3',
          title: 'Báo cáo & Hoàn thành Vận dụng (3.0đ)',
          desc: 'Nộp bảng vận dụng thực tế lên hệ thống để nhận điểm đánh giá (Tối đa 3.0 điểm).',
        },
      ],
      rubrics: [
        {
          id: `${spec.id}-r1`,
          title: `Tiêu chí 1: Đạt chuẩn Yêu cầu cần đạt (${spec.sgkFile})`,
          desc: `Hoàn thành chính xác nội dung vận dụng của ${spec.lessonTitle}.`,
          points: 1.0,
        },
        {
          id: `${spec.id}-r2`,
          title: `Tiêu chí 2: Thể hiện tốt Năng lực số (${spec.nlsAiFile})`,
          desc: spec.digitalCompetency,
          points: 1.0,
        },
        {
          id: `${spec.id}-r3`,
          title: `Tiêu chí 3: Tích hợp sáng tạo & có trách nhiệm Năng lực AI`,
          desc: spec.aiCompetency,
          points: 1.0,
        },
      ],
    },
  };
}

export const NOTEBOOK_LM_LESSONS: NotebookLMLessonBlueprint[] = [
  {
    lessonId: 'k6-tiet-1',
    grade: 6,
    periodNumber: 1,
    topicCode: 'Khối 6 • Chủ đề A • Bài 1',
    title: 'Tiết 1: Thông tin và dữ liệu',
    lessonType: 'theory',
    sgkReference: 'Trang 5–7 (SGK Tin6.pdf) ↔ NLS-AI-6.docx',
    digitalCompetency:
      'NLS 1.1: Khai thác dữ liệu và thông tin số (Nhận biết và phân loại thông tin, dữ liệu số)',
    aiCompetency:
      'NL-AI 1: Nhận thức về AI (Hiểu cách AI tiếp nhận dữ liệu văn bản, hình ảnh, âm thanh để rút ra thông tin)',
    notebookSourceSummary: [
      'Nguồn NotebookLM [SGK Tin6.pdf - Trang 5–7]: Phân biệt rõ 3 khái niệm cốt lõi: Thông tin (hiểu biết của con người), Dữ liệu (văn bản, con số, hình ảnh, âm thanh) và Vật mang tin (phương tiện lưu trữ như giấy, USB, thẻ nhớ).',
      'Nguồn NotebookLM [NLS-AI-6.docx - Tiết 1]: Tích hợp Năng lực số NLS 1.1 (Phân loại dữ liệu số) và Năng lực AI NL-AI 1 (Cách cảm biến/máy tính thu nhận dữ liệu đầu vào).',
      'Yêu cầu cần đạt: Nhận biết được sự khác nhau giữa thông tin và dữ liệu; nêu được ví dụ minh họa mối quan hệ giữa thông tin và dữ liệu.',
    ],
    competencyTarget:
      'YCCĐ: Phân biệt Thông tin, Dữ liệu, Vật mang tin | Tích hợp NLS 1.1 & NL-AI 1 (NLS-AI-6.docx)',
    stage1: {
      videoTitle: 'Tiết 1: Thế giới thông tin quanh ta (03:15)',
      videoUrl: 'https://cloudstorage.cloudplay.edu.vn/tinhoc6/tiet1/the-gioi-thong-tin.mp4',
      videoStops: [
        {
          time: '00:45',
          question: 'Khi thấy đèn giao thông chuyển sang màu đỏ, em nhận được thông tin gì?',
          answer: 'Thông tin phải dừng lại trước vạch kẻ đường để đảm bảo an toàn.',
        },
        {
          time: '02:10',
          question: 'Tiếng trống trường vang lên là dữ liệu dạng nào và báo hiệu thông tin gì?',
          answer: 'Dữ liệu dạng âm thanh, báo hiệu thông tin đến giờ vào lớp hoặc ra chơi.',
        },
      ],
      secretPictureTitle: 'TRANH BÍ MẬT: HỆ THỐNG MÁY TÍNH & ĐÁM MÂY SỐ',
      secretPictureMeaning:
        'Mọi dữ liệu văn bản, hình ảnh, âm thanh đều được thu nhận, xử lý và lưu trữ trên các vật mang tin hiện đại!',
      crosswordClues: [
        {
          id: 'cw-1',
          rowNumber: 1,
          clue: 'Những gì đem lại sự hiểu biết cho con người về thế giới xung quanh gọi là gì?',
          answer: 'THONGTIN',
          hintTileLabel: 'Mảnh ghép 1: Bộ não & Tri thức',
        },
        {
          id: 'cw-2',
          rowNumber: 2,
          clue: 'Các con số, văn bản, hình ảnh, âm thanh chưa qua phân tích gọi là gì?',
          answer: 'DULIEU',
          hintTileLabel: 'Mảnh ghép 2: Văn bản, Số, Ảnh, Âm thanh',
        },
        {
          id: 'cw-3',
          rowNumber: 3,
          clue: 'Thẻ nhớ USB, trang sách, đĩa quang được gọi chung là vật gì?',
          answer: 'VATMANGTIN',
          hintTileLabel: 'Mảnh ghép 3: Thiết bị lưu trữ số',
        },
        {
          id: 'cw-4',
          rowNumber: 4,
          clue: 'Cơ quan nào của con người kết hợp 5 giác quan để xử lý thông tin?',
          answer: 'BONAO',
          hintTileLabel: 'Mảnh ghép 4: Trung tâm xử lý thông tin',
        },
      ],
      openScenarioPrompt:
        'Em hãy nhập 1 từ miêu tả: Điều gì báo hiệu cho em biết hôm nay trời sắp đổ mưa?',
      expectedWordCloud: ['Mây đen', 'Sấm chớp', 'Gió to', 'Trời tối', 'Không khí ẩm'],
    },
    stage2: {
      worksheetTitle: 'Phiếu học tập số 01: Phân biệt Thông tin, Dữ liệu và Vật mang tin',
      bucketA: 'Hộp A: DỮ LIỆU (Data)',
      bucketB: 'Hộp B: THÔNG TIN (Information)',
      dragItems: [
        { id: 'nb1-c1', text: '"Nhiệt độ kế chỉ 38°C"', correctBox: 'data' },
        { id: 'nb1-c2', text: '"Bạn An đang bị sốt nhẹ"', correctBox: 'info' },
        { id: 'nb1-c3', text: '"Biển báo vòng tròn đỏ có gạch chéo"', correctBox: 'data' },
        { id: 'nb1-c4', text: '"Đoạn đường cấm rẽ phải"', correctBox: 'info' },
      ],
      blank1Label: 'Bước 2: Xử lý thông tin',
      blank1Answer: 'Xử lý thông tin',
      blank2Label: 'Bước 3: Lưu trữ thông tin',
      blank2Answer: 'Lưu trữ thông tin',
      matchingPairs: [
        {
          id: 'mp-1',
          left: 'Dữ liệu (Data)',
          right: 'Con số 38°C, dòng chữ, hình ảnh, âm thanh ghi trên vật mang tin',
        },
        {
          id: 'mp-2',
          left: 'Thông tin (Information)',
          right: 'Ý nghĩa rút ra giúp con người hiểu biết và ra quyết định',
        },
        {
          id: 'mp-3',
          left: 'Vật mang tin (Carrier)',
          right: 'Trang giấy, thẻ nhớ USB, ổ cứng lưu giữ dữ liệu',
        },
      ],
      textImagePrompt:
        'Quan sát hình ảnh bầu trời xám xịt có sấm chớp xa xa. Hãy chỉ ra đâu là Dữ liệu em thu nhận được và đâu là Thông tin giúp em hành động?',
      textImageAnswerKeywords: ['mây đen', 'sấm chớp', 'sắp mưa', 'mang áo mưa'],
    },
    stage3: {
      recommendedMode: 'theory',
      quizQuestions: INITIAL_MINIGAME_QUESTIONS.slice(0, 6).map((q) => ({ ...q, points: 0.5 })),
      practicalTaskTitle: 'Thực hành lập bảng phân loại Dữ liệu & Thông tin trên máy tính',
      practicalTaskSteps: [
        'Mở phần mềm Word hoặc Excel, tạo bảng gồm 3 cột: Tình huống - Dữ liệu - Thông tin.',
        'Điền 5 ví dụ thực tế trong lớp học và gia đình.',
        'Chụp ảnh màn hình (Ctrl+V) hoặc nộp tệp .docx/.xlsx lên hệ thống (Thang điểm: 3.0đ).',
      ],
      practicalAllowedExtensions: ['.png', '.jpg', '.doc', '.docx', '.xls', '.xlsx'],
    },
    stage4: {
      projectTitle:
        'Hoạt động 4 • Vận dụng thực tế: Khảo sát thông tin thời tiết 3 ngày & lập sổ theo dõi gia đình',
      projectObjective:
        'Thu thập dữ liệu nhiệt độ, độ ẩm trong 3 ngày liên tiếp, trình bày dạng bảng biểu và rút ra quyết định trang phục bảo vệ sức khỏe gia đình.',
      steps: [
        {
          badge: 'Bước 1',
          title: 'Thu thập dữ liệu',
          desc: 'Ghi nhận nhiệt độ (°C), độ ẩm (%) và trạng thái mưa/nắng lúc 7h sáng trong 3 ngày.',
        },
        {
          badge: 'Bước 2',
          title: 'Điền bảng biểu',
          desc: 'Nhập số liệu vào biểu mẫu Word/Excel hoặc kẻ bảng sạch đẹp vào vở.',
        },
        {
          badge: 'Bước 3',
          title: 'Rút ra thông tin',
          desc: 'Viết 2-3 câu nhận xét và đưa ra lời khuyên mang ô/áo mưa cho gia đình.',
        },
      ],
      rubrics: [
        {
          id: 'r1',
          title: 'Tiêu chí 1: Thu thập đầy đủ dữ liệu thời tiết thực tế',
          desc: 'Đầy đủ nhiệt độ, độ ẩm và trạng thái thời tiết trong 3 ngày liên tục.',
          points: 1.0,
        },
        {
          id: 'r2',
          title: 'Tiêu chí 2: Trình bày bảng biểu dữ liệu sạch đẹp, đúng mẫu',
          desc: 'Kẻ bảng ngăn nắp, cột tiêu đề rõ ràng, đơn vị đo chuẩn (°C, %).',
          points: 1.0,
        },
        {
          id: 'r3',
          title: 'Tiêu chí 3: Rút ra nhận xét thông tin chính xác & sáng tạo',
          desc: 'Phân biệt rõ dữ liệu số đo và thông tin rút ra, có ứng dụng thực tiễn.',
          points: 1.0,
        },
      ],
    },
  },
];

// DỮ LIỆU CHUẨN CHO HOẠT ĐỘNG 2 (4.0 ĐIỂM) & HOẠT ĐỘNG 4 (3.0 ĐIỂM)
export const PDF_TIET_1_STAGE2 = {
  worksheetTitle: 'PHIẾU HỌC TẬP TIẾT 1 • BÀI 1: THÔNG TIN VÀ DỮ LIỆU (CHỦ ĐỀ 1: MÁY TÍNH VÀ CỘNG ĐỒNG)',
  dragDrop: {
    title: '1. Dạng câu hỏi Kéo - Thả (Chọn từ gợi ý điền vào chỗ trống • 1.0 điểm)',
    instruction: 'Em hãy chọn/kéo các từ thích hợp trong Hộp từ gợi ý ở trên để điền vào vị trí (1), (2), (3), (4) trong đoạn văn sau:',
    wordBank: ['Dữ liệu', 'Thông tin', 'Vật mang tin', 'Hiểu biết', 'Hình ảnh và con số'],
    slots: {
      1: 'Dữ liệu',
      2: 'Thông tin',
      3: 'Hiểu biết',
      4: 'Vật mang tin',
    } as Record<number, string>,
  },
  fillBlank: {
    title: '2. Dạng câu hỏi Điền khuyết (Hoàn thành khái niệm cốt lõi • 1.0 điểm)',
    instruction: 'Điền từ hoặc cụm từ thích hợp vào chỗ trống để hoàn thành các phát biểu sau:',
    items: [
      {
        id: 'fb-a',
        label: 'a)',
        preText: '',
        postText: ' là những gì đem lại hiểu biết cho con người về thế giới xung quanh và về chính bản thân mình.',
        correctAnswer: 'Thông tin',
        accepted: ['thông tin', 'thong tin'],
      },
      {
        id: 'fb-b',
        label: 'b)',
        preText: 'Thông tin được ghi lên vật mang tin trở thành ',
        postText: ', được thể hiện dưới dạng con số, văn bản, hình ảnh, âm thanh.',
        correctAnswer: 'Dữ liệu',
        accepted: ['dữ liệu', 'du lieu'],
      },
      {
        id: 'fb-c',
        label: 'c)',
        preText: '',
        postText: ' là phương tiện được dùng để lưu trữ và truyền tải thông tin (ví dụ: giấy viết, thẻ nhớ, đĩa CD, bảng hiệu).',
        correctAnswer: 'Vật mang tin',
        accepted: ['vật mang tin', 'vat mang tin'],
      },
    ],
  },
  matching: {
    title: '3. Dạng câu hỏi Nối cột (Ghép nối khái niệm tương ứng • 1.0 điểm)',
    instruction: 'Hãy ghép mỗi mục ở Cột A với một mục phù hợp ở Cột B dựa trên ví dụ về tín hiệu đèn giao thông:',
    columnA: [
      { id: '1', num: 1, text: 'Đèn giao thông chuyển sang màu xanh.' },
      { id: '2', num: 2, text: 'Lời hiểu biết: "Được phép đi qua đường an toàn".' },
      { id: '3', num: 3, text: 'Hộp đèn giao thông bằng kim loại ở ngã tư.' },
    ],
    columnB: [
      { id: 'a', key: 'a', text: 'Vật mang tin (phương tiện chứa đựng dữ liệu).' },
      { id: 'b', key: 'b', text: 'Dữ liệu (tín hiệu hình ảnh/màu sắc quan sát được).' },
      { id: 'c', key: 'c', text: 'Thông tin (hiểu biết thu nhận được để hành động).' },
    ],
    correctPairs: {
      '1': 'b',
      '2': 'c',
      '3': 'a',
    } as Record<string, string>,
  },
  shortAnswer: {
    title: '4. Dạng câu hỏi Trả lời ngắn / Tự luận (Phân tích thực tế • 1.0 điểm)',
    question: 'Em hãy nêu một ví dụ ngay trong lớp học của em và chỉ ra rõ 3 yếu tố: Dữ liệu, Thông tin và Vật mang tin.',
    fields: [
      {
        key: 'data',
        label: '• Dữ liệu:',
        placeholder: 'Ví dụ: Dòng chữ "Tiết 1: Tin học" viết bằng phấn trắng trên góc bảng...',
      },
      {
        key: 'info',
        label: '• Thông tin:',
        placeholder: 'Ví dụ: Giúp cả lớp biết hôm nay có tiết học Tin học để chuẩn bị sách vở...',
      },
      {
        key: 'carrier',
        label: '• Vật mang tin:',
        placeholder: 'Ví dụ: Tấm bảng đen ở đầu lớp học...',
      },
    ],
  },
};

export const PDF_TIET_1_STAGE4 = {
  title: 'HOẠT ĐỘNG 4: VẬN DỤNG THỰC TẾ (3.0 ĐIỂM / TỔNG 10 ĐIỂM TIẾT HỌC)',
  prompt: 'Em hãy quan sát một hoạt động diễn ra tại gia đình hoặc trường học của em liên quan đến bài học hôm nay và hoàn thành bảng thống kê dưới đây:',
  sampleRow: {
    carrier: 'Bảng giá tại căng tin trường',
    data: 'Các con số: Bánh mì 15.000đ, Sữa 10.000đ',
    infoAction: 'Biết giá tiền để chuẩn bị đủ tiền mua đồ ăn sáng.',
  },
  defaultRows: [
    {
      id: 'row-1',
      carrier: 'Đồng hồ treo tường ở lớp học',
      data: 'Kim dài chỉ số 12, kim ngắn chỉ số 7',
      infoAction: 'Biết đã đến 7 giờ đúng, đến giờ truy bài đầu giờ của lớp.',
    },
    {
      id: 'row-2',
      carrier: 'Tờ giấy thông báo trên bảng tin trường',
      data: 'Dòng chữ: "Lịch thi học kì 1 bắt đầu từ ngày 15/12"',
      infoAction: 'Biết ngày bắt đầu thi HK1 để chủ động lập kế hoạch ôn tập các môn.',
    },
  ],
  selfCheckGuide: {
    partA: 'Hoạt động 2 - Khám phá (4.0 điểm):\n- Dạng 1 Kéo thả (1.0đ): (1) Dữ liệu | (2) Thông tin | (3) Hiểu biết | (4) Vật mang tin\n- Dạng 2 Điền khuyết (1.0đ): a) Thông tin; b) Dữ liệu; c) Vật mang tin\n- Dạng 3 Nối cột (1.0đ): 1 - b | 2 - c | 3 - a\n- Dạng 4 Trả lời ngắn (1.0đ): Đủ 3 ý Dữ liệu, Thông tin, Vật mang tin',
    partB: 'Hoạt động 3 - Luyện tập (3.0 điểm):\n- 6 Câu hỏi Đấu trường Trắc nghiệm 25s (0.5đ/câu = 3.0đ) hoặc Nộp sản phẩm Thực hành Google Drive (3.0đ)',
    partC: 'Hoạt động 4 - Vận dụng thực tế (3.0 điểm):\nHọc sinh nêu đúng ví dụ thực tế và đạt 3 tiêu chí Rubric (3 x 1.0đ = 3.0đ). Tổng điểm toàn tiết = 10.0 điểm.',
  },
};

// =========================================================================================
// PHIẾU HỌC TẬP CHUẨN XÁC THEO TỆP ẢNH image_3575b3aa.png: TIN HỌC 7 • TIẾT 1
// BÀI 1: THIẾT BỊ VÀO RA (MỤC 1) • PHẦN A. KHÁM PHÁ KIẾN THỨC (20 PHÚT - 4.0 ĐIỂM)
// =========================================================================================
export const PDF_TIET_1_TIN_7_STAGE2 = {
  worksheetTitle: 'PHIẾU HỌC TẬP TIẾT 1 (KHỐI 7) • BÀI 1. THIẾT BỊ VÀO RA (MỤC 1)',
  sourceFileName: 'image_3575b3aa.png • Phieu_Hoc_Tap_Tiet_1_Tin_7.pdf',
  dragDrop: {
    title: 'Câu 1 [Dạng Kéo - Thả]: Chọn các từ/cụm từ thích hợp điền vào chỗ trống trong đoạn mô tả về hệ thống thiết bị máy tính:',
    instruction: 'Gắp (kéo) từ khung gợi ý bên dưới thả vào các vị trí trống (1), (2), (3), (4), (5) hoặc bấm chọn từ rồi bấm vào ô trống:',
    wordBank: [
      'Thiết bị vào',
      'Thiết bị ra',
      'Vừa vào vừa ra',
      'Loa thông minh AI',
      'Dữ liệu âm thanh',
    ],
    slots: {
      1: 'Thiết bị vào',
      2: 'Thiết bị ra',
      3: 'Vừa vào vừa ra',
      4: 'Loa thông minh AI',
      5: 'Dữ liệu âm thanh',
    } as Record<number, string>,
    sentenceLines: [
      {
        sentenceNum: 1,
        textBefore: '1. Bàn phím và chuột đóng vai trò là ',
        slotNum: 1,
        textAfter: ' giúp người dùng nhập lệnh.',
      },
      {
        sentenceNum: 2,
        textBefore: '2. Màn hình và máy in đóng vai trò là ',
        slotNum: 2,
        textAfter: ' xuất kết quả xử lý ra môi trường ngoài.',
      },
      {
        sentenceNum: 3,
        textBefore: '3. Màn hình cảm ứng trên điện thoại di động là loại thiết bị ',
        slotNum: 3,
        textAfter: '.',
      },
      {
        sentenceNum: 4,
        textBefore: '4. ',
        slotNum: 4,
        textMid: ' là thiết bị vừa có chức năng thu nhận giọng nói vừa có khả năng phản hồi lại bằng ',
        slotNum2: 5,
        textAfter: ' nhờ tích hợp trợ lý ảo AI.',
      },
    ] as DragDropSentenceLine[],
    questions: [
      {
        slotNum: 1,
        promptFragment: '1. Bàn phím và chuột đóng vai trò là (1)..................... giúp người dùng nhập lệnh.',
        correctWord: 'Thiết bị vào',
        points: 0.2,
      },
      {
        slotNum: 2,
        promptFragment: '2. Màn hình và máy in đóng vai trò là (2)..................... xuất kết quả xử lý ra môi trường ngoài.',
        correctWord: 'Thiết bị ra',
        points: 0.2,
      },
      {
        slotNum: 3,
        promptFragment: '3. Màn hình cảm ứng trên điện thoại di động là loại thiết bị (3).....................',
        correctWord: 'Vừa vào vừa ra',
        points: 0.2,
      },
      {
        slotNum: 4,
        promptFragment: '4a. (4)..................... là thiết bị vừa có chức năng thu nhận giọng nói...',
        correctWord: 'Loa thông minh AI',
        points: 0.2,
      },
      {
        slotNum: 5,
        promptFragment: '4b. ...vừa có khả năng phản hồi lại bằng (5)..................... nhờ tích hợp trợ lý ảo AI.',
        correctWord: 'Dữ liệu âm thanh',
        points: 0.2,
      },
    ],
  },
  fillBlank: {
    title: 'Câu 2 [Dạng Điền khuyết]: Hoàn thành các mệnh đề tri thức còn thiếu sau đây:',
    instruction: 'Nhập từ hoặc cụm từ chính xác vào từng ô trống để hoàn thành các định nghĩa:',
    items: [
      {
        id: 'k7-t1-fb-a',
        label: 'a)',
        preText: 'Thiết bị vào được dùng để nhập ',
        postText: ' vào máy tính như bàn phím, chuột, micro, camera.',
        correctAnswer: 'dữ liệu',
        accepted: ['dữ liệu', 'du lieu', 'thông tin, dữ liệu', 'dữ liệu số'],
        points: 0.35,
      },
      {
        id: 'k7-t1-fb-b',
        label: 'b)',
        preText: 'Thiết bị ra được dùng để xuất dữ liệu từ máy tính ra bên ngoài dưới dạng ',
        postText: ', âm thanh hoặc hình ảnh.',
        correctAnswer: 'văn bản',
        accepted: ['văn bản', 'van ban', 'chữ viết', 'hình ảnh'],
        points: 0.35,
      },
      {
        id: 'k7-t1-fb-c',
        label: 'c)',
        preText: 'Máy chiếu là thiết bị ',
        postText: ', dùng để hiển thị nội dung màn hình máy tính lên màn chiếu rộng.',
        correctAnswer: 'ra',
        accepted: ['ra', 'thiết bị ra', 'thiet bi ra'],
        points: 0.3,
      },
    ],
  },
  matching: {
    title: 'Câu 3 [Dạng Nối cột]: Ghép mỗi nội dung ở Cột A với một nội dung phù hợp ở Cột B:',
    instruction: 'Ghép mỗi nội dung ở Cột A (Thiết bị) với một nội dung phù hợp ở Cột B (Chức năng cốt lõi):',
    items: [
      {
        id: 'k7-t1-m1',
        num: 1,
        leftText: '1) Micro thu âm',
        rightKey: 'a',
        rightText: 'a) Tiếp nhận sóng âm, chuyển thành tín hiệu số vào máy tính.',
        points: 0.25,
      },
      {
        id: 'k7-t1-m2',
        num: 2,
        leftText: '2) Màn hình cảm ứng',
        rightKey: 'b',
        rightText: 'b) Nhập dữ liệu thao tác vuốt/chạm đồng thời hiển thị hình ảnh.',
        points: 0.25,
      },
      {
        id: 'k7-t1-m3',
        num: 3,
        leftText: '3) Máy in laser',
        rightKey: 'c',
        rightText: 'c) Xuất dữ liệu văn bản/hình ảnh ra giấy.',
        points: 0.25,
      },
      {
        id: 'k7-t1-m4',
        num: 4,
        leftText: '4) Camera AI điểm danh',
        rightKey: 'd',
        rightText: 'd) Thu nhận hình ảnh khuôn mặt và xử lý nhận diện thông minh.',
        points: 0.25,
      },
    ],
    correctPairs: {
      '1': 'a',
      '2': 'b',
      '3': 'c',
      '4': 'd',
    } as Record<string, string>,
  },
  shortAnswer: {
    title: 'Câu 4 [Dạng Trả lời ngắn]: Trong buổi học trực tuyến, bạn An sử dụng tai nghe có gắn micro. Theo em, bộ tai nghe kèm micro này thuộc loại thiết bị nào? Giải thích rõ luồng thông tin vào và ra qua thiết bị này.',
    question: 'Trong buổi học trực tuyến, bạn An sử dụng tai nghe có gắn micro. Theo em, bộ tai nghe kèm micro này thuộc loại thiết bị nào? Giải thích rõ luồng thông tin vào và ra qua thiết bị này.',
    items: [
      {
        id: 'k7-t1-sa-type',
        label: '• Loại thiết bị:',
        question: 'Theo em, bộ tai nghe kèm micro này thuộc loại thiết bị nào?',
        placeholder: 'Ví dụ: Thiết bị vừa vào vừa ra (kết hợp cả vào và ra)...',
        sampleAnswer: 'Thuộc loại thiết bị vừa vào vừa ra (kết hợp cả chức năng vào và ra).',
        points: 0.4,
      },
      {
        id: 'k7-t1-sa-in',
        label: '• Luồng thông tin VÀO:',
        question: 'Giải thích rõ luồng thông tin vào qua bộ thiết bị này:',
        placeholder: 'Micro thu nhận âm thanh tiếng nói của An đưa vào máy tính...',
        sampleAnswer: 'Micro có chức năng thu âm thanh / tiếng nói của bạn An và chuyển thành tín hiệu số đưa vào máy tính xử lý.',
        points: 0.3,
      },
      {
        id: 'k7-t1-sa-out',
        label: '• Luồng thông tin RA:',
        question: 'Giải thích rõ luồng thông tin ra qua bộ thiết bị này:',
        placeholder: 'Tai nghe nhận tín hiệu âm thanh từ máy tính phát ra tai An...',
        sampleAnswer: 'Tai nghe nhận tín hiệu âm thanh đã xử lý từ máy tính phát ra tai bạn An nghe.',
        points: 0.3,
      },
    ],
  },
};

export function getDefaultWorksheetForLesson(
  grade: 6 | 7 | 8 | 9,
  period: number
): CustomLessonWorksheet {
  return generateAuthenticWorksheetForGradeAndPeriod(grade, period);
}



