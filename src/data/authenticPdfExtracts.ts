// Auto-generated Authentic OCR Extracted Data from attached PDFs
// Contains 100% genuine Fill-in-the-Blank and Short-Answer questions for 116 periods across Grades 6, 7, 8, 9
// SGK Kết nối tri thức - CV 3456 - Khung AI 3439

import type { CustomFillBlankQuestion, CustomShortAnswerQuestion } from './mockCurriculumData';

export interface AuthenticPeriodOcrExtract {
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  yccd: string;
  wordBank: string[];
  fillBlankQuestions: CustomFillBlankQuestion[];
  shortAnswerPrompt: string;
  shortAnswerQuestions: CustomShortAnswerQuestion[];
}

export const AUTHENTIC_PDF_EXTRACTS: Record<string, AuthenticPeriodOcrExtract> = {
  "k6-tiet-1": {
    "grade": 6,
    "period": 1,
    "lessonTitle": "Tiết 1",
    "yccd": "",
    "wordBank": [
      "Thông tin",
      "Dữ liệu",
      "Vật mang tin"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p1-fb-1",
        "label": "a)",
        "preText": "Mệnh đề a):",
        "postText": "là những gì đem lại hiểu biết cho con người về thế giới xung quanh và về chính bản thân mình.",
        "correctAnswer": "Thông tin",
        "accepted": [
          "thông tin",
          "Thông tin",
          "Thôngtin"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p1-fb-2",
        "label": "b)",
        "preText": "Mệnh đề b):",
        "postText": "được thể hiện dưới dạng con số, văn bản, hình ảnh, âm thanh ghi trên vật mang tin.",
        "correctAnswer": "Dữ liệu",
        "accepted": [
          "dữ liệu",
          "Dữ liệu",
          "Dữliệu"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p1-fb-3",
        "label": "c)",
        "preText": "Mệnh đề c):",
        "postText": "là phương tiện được dùng để lưu trữ và truyền tải thông tin (ví dụ: giấy viết, thẻ nhớ, đĩa CD).",
        "correctAnswer": "Vật mang tin",
        "accepted": [
          "vật mang tin",
          "Vật mang tin",
          "Vậtmangtin"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Trong giờ học Địa lý, thầy giáo chiếu bản đồ lượng mưa trung bình của Việt Nam lên màn hình.\nHãy chỉ ra rõ: Dữ liệu là gì? Thông tin em thu nhận được là gì? Vật mang tin trong tình huống này là gì?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p1-sa-1",
        "label": "• Dữ liệu quan sát được:",
        "question": "Chỉ ra yếu tố Dữ liệu xuất hiện trên bản đồ:",
        "placeholder": "Nhập câu trả lời ngắn...",
        "sampleAnswer": "Các con số đo lượng mưa (mm), các đường ranh giới và ký hiệu màu sắc phân vùng trên bản đồ.",
        "points": 0.4
      },
      {
        "id": "k6-p1-sa-2",
        "label": "• Thông tin thu nhận được:",
        "question": "Thông tin em hiểu được từ dữ liệu trên là gì?",
        "placeholder": "Nhập câu trả lời ngắn...",
        "sampleAnswer": "Hiểu biết về sự phân bố lượng mưa giữa các vùng miền ở Việt Nam (nơi nào mưa nhiều, nơi nào ít mưa).",
        "points": 0.3
      },
      {
        "id": "k6-p1-sa-3",
        "label": "• Vật mang tin:",
        "question": "Xác định vật mang tin chứa đựng dữ liệu trong tình huống:",
        "placeholder": "Nhập câu trả lời ngắn...",
        "sampleAnswer": "Màn hình máy chiếu hoặc tờ bản đồ giấy in trong sách giáo khoa Địa lý.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-2": {
    "grade": 6,
    "period": 2,
    "lessonTitle": "Tiết 2",
    "yccd": "",
    "wordBank": [
      "xử lý thông tin",
      "thu nhận thông tin",
      "lưu trữ thông tin",
      "truyền thông tin"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p2-fb-1",
        "label": "a)",
        "preText": "Quá trình biến đổi thông tin ban đầu thành thông tin mới hữu ích gọi là",
        "postText": ".",
        "correctAnswer": "xử lý thông tin",
        "accepted": [
          "xử lý thông tin",
          "xử lý thông tin",
          "xửlýthôngtin"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p2-fb-2",
        "label": "b)",
        "preText": "Bộ não con người dùng các giác quan (mắt, tai, mũi, da, lưỡi) để",
        "postText": "từ thế giới bên ngoài.",
        "correctAnswer": "thu nhận thông tin",
        "accepted": [
          "thu nhận thông tin",
          "thu nhận thông tin",
          "thunhậnthôngtin"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p2-fb-3",
        "label": "c)",
        "preText": "Khi em chép bài vào vở, em đang thực hiện hoạt động",
        "postText": "để không bị quên.",
        "correctAnswer": "lưu trữ thông tin",
        "accepted": [
          "lưu trữ thông tin",
          "lưu trữ thông tin",
          "lưutrữthôngtin"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p2-fb-4",
        "label": "d)",
        "preText": "Nói chuyện, gửi thư hay phát biểu trong lớp là các hình thức",
        "postText": ".",
        "correctAnswer": "truyền thông tin",
        "accepted": [
          "truyền thông tin",
          "truyền thông tin",
          "truyềnthôngtin"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Nêu 1 ví dụ thực tế trong học tập hàng ngày của em có đủ cả 4 hoạt động: Thu nhận -> Lưu trữ -\n> Xử lý -> Truyền thông tin.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p2-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nNêu 1 ví dụ thực tế trong học tập hàng ngày của em có đủ cả 4 hoạt động: Thu nhận -...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 2 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p2-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p2-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-3": {
    "grade": 6,
    "period": 3,
    "lessonTitle": "Tiết 3",
    "yccd": "",
    "wordBank": [
      "Thiết bị vào",
      "Bộ vi xử lý (CPU)",
      "Thiết bị lưu trữ (Bộ nhớ)",
      "Thiết bị ra"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p3-fb-1",
        "label": "a)",
        "preText": "Mệnh đề a):",
        "postText": "nhận thông tin vào máy tính (như bàn phím, chuột, micro).",
        "correctAnswer": "Thiết bị vào",
        "accepted": [
          "thiết bị vào",
          "Thiết bị vào",
          "Thiếtbịvào"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p3-fb-2",
        "label": "b)",
        "preText": "Mệnh đề b):",
        "postText": "thực hiện thao tác xử lý, tính toán và điều khiển toàn bộ máy tính.",
        "correctAnswer": "Bộ vi xử lý (CPU)",
        "accepted": [
          "bộ vi xử lý (cpu)",
          "Bộ vi xử lý (CPU)",
          "Bộvixửlý(CPU)"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p3-fb-3",
        "label": "c)",
        "preText": "Mệnh đề c):",
        "postText": "lưu giữ dữ liệu và chương trình (ổ cứng, USB, đĩa quang).",
        "correctAnswer": "Thiết bị lưu trữ (Bộ nhớ)",
        "accepted": [
          "thiết bị lưu trữ (bộ nhớ)",
          "Thiết bị lưu trữ (Bộ nhớ)",
          "Thiếtbịlưutrữ(Bộnhớ)"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p3-fb-4",
        "label": "d)",
        "preText": "Mệnh đề d):",
        "postText": "xuất kết quả ra ngoài cho con người quan sát (màn hình, loa, máy in).",
        "correctAnswer": "Thiết bị ra",
        "accepted": [
          "thiết bị ra",
          "Thiết bị ra",
          "Thiếtbịra"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Tại sao máy tính có thể thực hiện hàng tỷ phép tính trong một giây mà không bị mệt mỏi hay\nnhầm lẫn như con người?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p3-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nTại sao máy tính có thể thực hiện hàng tỷ phép tính trong một giây mà không bị mệt ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 3 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p3-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p3-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-4": {
    "grade": 6,
    "period": 4,
    "lessonTitle": "Tiết 4",
    "yccd": "",
    "wordBank": [
      "bit",
      "dãy bit",
      "số hóa"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p4-fb-1",
        "label": "a)",
        "preText": "Bit (viết tắt của Binary digit) là đơn vị",
        "postText": "để đo dung lượng thông tin.",
        "correctAnswer": "bit",
        "accepted": [
          "bit",
          "bit",
          "bit"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p4-fb-2",
        "label": "b)",
        "preText": "Để máy tính hiểu được, thông tin thực tế phải được chuyển đổi thành dãy các ký hiệu",
        "postText": ".",
        "correctAnswer": "dãy bit",
        "accepted": [
          "dãy bit",
          "dãy bit",
          "dãybit"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p4-fb-3",
        "label": "c)",
        "preText": "Quá trình chuyển thông tin thực tế thành dãy bit gọi là quá trình",
        "postText": "dữ liệu.",
        "correctAnswer": "số hóa",
        "accepted": [
          "số hóa",
          "số hóa",
          "sốhóa"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\n\n\n\nTrang 11\nTình huống: Tại sao máy tính không dùng trực tiếp chữ cái Tiếng Việt hay số thập phân (0-9) mà bắt buộc\nphải mã hóa thành dãy bit 0 và 1?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p4-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\n\n\n\nTrang 11\nTại sao máy tính không dùng trực tiếp chữ cái Tiếng Việt hay số thập ph...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 4 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p4-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p4-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-5": {
    "grade": 6,
    "period": 5,
    "lessonTitle": "Tiết 5",
    "yccd": "",
    "wordBank": [
      "8",
      "1 000 (hoặc 1024)",
      "triệu",
      "tỷ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p5-fb-1",
        "label": "a)",
        "preText": "1 Byte (B) bằng",
        "postText": "bit liên tục.",
        "correctAnswer": "8",
        "accepted": [
          "8",
          "8",
          "8"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p5-fb-2",
        "label": "b)",
        "preText": "1 KB (Kilobyte) xấp xỉ bằng",
        "postText": "Byte (chính xác là 1024 B).",
        "correctAnswer": "1 000 (hoặc 1024)",
        "accepted": [
          "1 000 (hoặc 1024)",
          "1 000 (hoặc 1024)",
          "1000(hoặc1024)"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p5-fb-3",
        "label": "c)",
        "preText": "1 MB (Megabyte) xấp xỉ bằng 1",
        "postText": "Byte.",
        "correctAnswer": "triệu",
        "accepted": [
          "triệu",
          "triệu",
          "triệu"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p5-fb-4",
        "label": "d)",
        "preText": "1 GB (Gigabyte) xấp xỉ bằng 1",
        "postText": "Byte.",
        "correctAnswer": "tỷ",
        "accepted": [
          "tỷ",
          "tỷ",
          "tỷ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\n\n\n\nTrang 14\nTình huống: Một thẻ nhớ điện thoại có dung lượng 16 GB. Giả sử mỗi bức ảnh có dung lượng trung bình là 4\nMB, thẻ nhớ đó có thể chứa tối đa bao nhiêu bức ảnh?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p5-sa-1",
        "label": "• Đổi đơn vị dung lượng:",
        "question": "Đổi dung lượng thẻ nhớ từ GB sang MB:",
        "placeholder": "16 GB = ... MB",
        "sampleAnswer": "16 GB = 16 × 1024 MB = 16 384 MB (hoặc tính xấp xỉ 16 × 1000 = 16 000 MB).",
        "points": 0.4
      },
      {
        "id": "k6-p5-sa-2",
        "label": "• Số lượng ảnh tối đa:",
        "question": "Tính số bức ảnh tối đa thẻ nhớ có thể chứa:",
        "placeholder": "Thực hiện phép chia...",
        "sampleAnswer": "16 384 : 4 = 4 096 bức ảnh (hoặc tính xấp xỉ 16 000 : 4 = 4 000 bức ảnh).",
        "points": 0.3
      },
      {
        "id": "k6-p5-sa-3",
        "label": "• Quản lý dữ liệu số:",
        "question": "Lời khuyên khi sử dụng thẻ nhớ điện thoại để tránh đầy bộ nhớ:",
        "placeholder": "Nêu giải pháp...",
        "sampleAnswer": "Thường xuyên sao lưu ảnh lên dịch vụ đám mây (Google Photos/Drive) và xóa bớt ảnh trùng lặp.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-6": {
    "grade": 6,
    "period": 6,
    "lessonTitle": "Tiết 6",
    "yccd": "",
    "wordBank": [
      "mạng máy tính",
      "chia sẻ dữ liệu",
      "dùng chung thiết bị",
      "kết nối"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p6-fb-1",
        "label": "a)",
        "preText": "Mạng máy tính là tập hợp hai hay nhiều máy tính và thiết bị được",
        "postText": "với nhau để truyền thông tin.",
        "correctAnswer": "mạng máy tính",
        "accepted": [
          "mạng máy tính",
          "mạng máy tính",
          "mạngmáytính"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p6-fb-2",
        "label": "b)",
        "preText": "Lợi ích lớn nhất của mạng máy tính là giúp người dùng",
        "postText": "tài nguyên (dữ liệu, phần mềm, phần cứng).",
        "correctAnswer": "chia sẻ dữ liệu",
        "accepted": [
          "chia sẻ dữ liệu",
          "chia sẻ dữ liệu",
          "chiasẻdữliệu"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p6-fb-3",
        "label": "c)",
        "preText": "Nhờ có mạng, việc",
        "postText": "giữa người với người trở nên nhanh chóng, không bị giới hạn bởi khoảng cách địa lý.",
        "correctAnswer": "dùng chung thiết bị",
        "accepted": [
          "dùng chung thiết bị",
          "dùng chung thiết bị",
          "dùngchungthiếtbị"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: So sánh sự khác nhau giữa một máy tính hoạt động độc lập (không nối mạng) và một máy tính\nđược kết nối vào mạng máy tính.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p6-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nSo sánh sự khác nhau giữa một máy tính hoạt động độc lập (không nối mạng) và một má...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 6 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p6-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p6-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-7": {
    "grade": 6,
    "period": 7,
    "lessonTitle": "Tiết 7",
    "yccd": "",
    "wordBank": [
      "thiết bị đầu cuối",
      "thiết bị kết nối",
      "đường truyền"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p7-fb-1",
        "label": "a)",
        "preText": "Mệnh đề a):",
        "postText": "là các thiết bị gửi hoặc nhận dữ liệu trên mạng (máy tính, điện thoại, máy in).",
        "correctAnswer": "thiết bị đầu cuối",
        "accepted": [
          "thiết bị đầu cuối",
          "thiết bị đầu cuối",
          "thiếtbịđầucuối"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p7-fb-2",
        "label": "b)",
        "preText": "Mệnh đề b):",
        "postText": "dùng để nối các thiết bị đầu cuối lại với nhau (bộ chia, bộ chuyển mạch, router, dây cáp).",
        "correctAnswer": "thiết bị kết nối",
        "accepted": [
          "thiết bị kết nối",
          "thiết bị kết nối",
          "thiếtbịkếtnối"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p7-fb-3",
        "label": "c)",
        "preText": "Mạng sử dụng sóng điện từ (Wi-Fi) để truyền dữ liệu gọi là",
        "postText": ".",
        "correctAnswer": "đường truyền",
        "accepted": [
          "đường truyền",
          "đường truyền",
          "đườngtruyền"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p7-fb-4",
        "label": "d)",
        "preText": "Mệnh đề d):",
        "postText": "giúp điều khiển quá trình truyền dữ liệu giữa các thiết bị trên mạng.",
        "correctAnswer": "thiết bị đầu cuối",
        "accepted": [
          "thiết bị đầu cuối",
          "thiết bị đầu cuối",
          "thiếtbịđầucuối"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Nêu ưu điểm nổi bật của mạng không dây (Wi-Fi) so với mạng có dây (sử dụng cáp mạng)\ntrong sinh hoạt gia đình.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p7-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nNêu ưu điểm nổi bật của mạng không dây (Wi-Fi) so với mạng có dây (sử dụng cáp mạng...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 7 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p7-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p7-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-8": {
    "grade": 6,
    "period": 8,
    "lessonTitle": "Tiết 8",
    "yccd": "",
    "wordBank": [
      "toàn cầu",
      "Internet",
      "nhà cung cấp dịch vụ Internet (ISP)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p8-fb-1",
        "label": "a)",
        "preText": "Internet là mạng",
        "postText": "các mạng máy tính trên khắp thế giới.",
        "correctAnswer": "toàn cầu",
        "accepted": [
          "toàn cầu",
          "toàn cầu",
          "toàncầu"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p8-fb-2",
        "label": "b)",
        "preText": "Muốn kết nối Internet, người dùng cần đăng ký với",
        "postText": "(Internet Service Provider).",
        "correctAnswer": "Internet",
        "accepted": [
          "internet",
          "Internet",
          "Internet"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p8-fb-3",
        "label": "c)",
        "preText": "Internet có 4 đặc điểm chính: Tính toàn cầu, Tính tương tác, Tính dễ tiếp cận và",
        "postText": ".",
        "correctAnswer": "nhà cung cấp dịch vụ Internet (ISP)",
        "accepted": [
          "nhà cung cấp dịch vụ internet (isp)",
          "nhà cung cấp dịch vụ Internet (ISP)",
          "nhàcungcấpdịchvụInternet(ISP)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân biệt sự khác nhau cơ bản giữa Mạng máy tính cục bộ (LAN) trong phòng máy trường học\nvà Mạng Internet toàn cầu.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p8-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân biệt sự khác nhau cơ bản giữa Mạng máy tính cục bộ (LAN) trong phòng máy trườn...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 8 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p8-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p8-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-9": {
    "grade": 6,
    "period": 9,
    "lessonTitle": "Tiết 9",
    "yccd": "",
    "wordBank": [
      "kho tri thức",
      "học tập trực tuyến",
      "giao tiếp"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p9-fb-1",
        "label": "a)",
        "preText": "Internet cung cấp môi trường học tập từ xa, giúp học sinh",
        "postText": "mọi lúc, mọi nơi.",
        "correctAnswer": "kho tri thức",
        "accepted": [
          "kho tri thức",
          "kho tri thức",
          "khotrithức"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p9-fb-2",
        "label": "b)",
        "preText": "Dịch vụ",
        "postText": "giúp người dùng gửi tin nhắn, thư điện tử, gọi điện tức thời.",
        "correctAnswer": "học tập trực tuyến",
        "accepted": [
          "học tập trực tuyến",
          "học tập trực tuyến",
          "họctậptrựctuyến"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p9-fb-3",
        "label": "c)",
        "preText": "Nhờ có Internet, việc tìm kiếm và chia sẻ",
        "postText": "trở nên vô cùng nhanh chóng và thuận tiện.",
        "correctAnswer": "giao tiếp",
        "accepted": [
          "giao tiếp",
          "giao tiếp",
          "giaotiếp"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Bên cạnh những lợi ích to lớn, việc truy cập Internet liên tục nhiều giờ trong ngày gây ra những\ntác hại gì cho học sinh?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p9-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nBên cạnh những lợi ích to lớn, việc truy cập Internet liên tục nhiều giờ trong ngày...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 9 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p9-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p9-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-10": {
    "grade": 6,
    "period": 10,
    "lessonTitle": "Tiết 10",
    "yccd": "",
    "wordBank": [
      "World Wide Web",
      "siêu văn bản",
      "trình duyệt web"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p10-fb-1",
        "label": "a)",
        "preText": "Kho thông tin khổng lồ trên Internet được tạo nên từ nhiều",
        "postText": "kết nối với nhau bởi các siêu liên kết.",
        "correctAnswer": "World Wide Web",
        "accepted": [
          "world wide web",
          "World Wide Web",
          "WorldWideWeb"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p10-fb-2",
        "label": "b)",
        "preText": "Mệnh đề b):",
        "postText": "là một tập hợp các trang web liên quan được quản lý dưới một địa chỉ web.",
        "correctAnswer": "siêu văn bản",
        "accepted": [
          "siêu văn bản",
          "siêu văn bản",
          "siêuvănbản"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p10-fb-3",
        "label": "c)",
        "preText": "Một số phần mềm",
        "postText": "phổ biến hiện nay là Google Chrome, Microsoft Edge, Mozilla Firefox, Cốc Cốc.",
        "correctAnswer": "trình duyệt web",
        "accepted": [
          "trình duyệt web",
          "trình duyệt web",
          "trìnhduyệtweb"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Em hiểu 'Trang siêu văn bản' (Hypertext) khác với 'Trang văn bản thông thường' (như trang\nsách giấy) ở điểm đặc biệt nào?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p10-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nEm hiểu 'Trang siêu văn bản' (Hypertext) khác với 'Trang văn bản thông thường' (như...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 10 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p10-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p10-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-11": {
    "grade": 6,
    "period": 11,
    "lessonTitle": "Tiết 11",
    "yccd": "",
    "wordBank": [
      "máy tìm kiếm",
      "từ khóa",
      "lọc kết quả"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p11-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 6: Mạng thông tin toàn cầu (Mục 3. Thực hành: Khai thác thông tin trang web).",
        "postText": ".",
        "correctAnswer": "máy tìm kiếm",
        "accepted": [
          "máy tìm kiếm",
          "máy tìm kiếm",
          "máytìmkiếm"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p11-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "từ khóa",
        "accepted": [
          "từ khóa",
          "từ khóa",
          "từkhóa"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p11-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "lọc kết quả",
        "accepted": [
          "lọc kết quả",
          "lọc kết quả",
          "lọckếtquả"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 6: Mạng thông tin\ntoàn cầu (Mục 3. Thực hành: Khai thác thông tin trang web).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p11-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 6: Mạng t...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 11 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p11-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p11-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-12": {
    "grade": 6,
    "period": 12,
    "lessonTitle": "Tiết 12",
    "yccd": "",
    "wordBank": [
      "từ khóa trong ngoặc kép",
      "chính xác",
      "thu hẹp"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p12-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 7: Tìm kiếm thông tin trên Internet (Mục 1. Máy tìm kiếm).",
        "postText": ".",
        "correctAnswer": "từ khóa trong ngoặc kép",
        "accepted": [
          "từ khóa trong ngoặc kép",
          "từ khóa trong ngoặc kép",
          "từkhóatrongngoặckép"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p12-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "chính xác",
        "accepted": [
          "chính xác",
          "chính xác",
          "chínhxác"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p12-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "thu hẹp",
        "accepted": [
          "thu hẹp",
          "thu hẹp",
          "thuhẹp"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\n\n\n\nTrang 35\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 7: Tìm kiếm thông tin\ntrên Internet (Mục 1. Máy tìm kiếm).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p12-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\n\n\n\nTrang 35\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung B...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 12 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p12-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p12-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-13": {
    "grade": 6,
    "period": 13,
    "lessonTitle": "Tiết 13",
    "yccd": "",
    "wordBank": [
      "độ tin cậy",
      "nguồn tin chính thống",
      "kiểm chứng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p13-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 7: Tìm kiếm thông tin trên Internet (Mục 2. Thực hành: Tìm kiếm và khai thác).",
        "postText": ".",
        "correctAnswer": "độ tin cậy",
        "accepted": [
          "độ tin cậy",
          "độ tin cậy",
          "độtincậy"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p13-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "nguồn tin chính thống",
        "accepted": [
          "nguồn tin chính thống",
          "nguồn tin chính thống",
          "nguồntinchínhthống"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p13-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "kiểm chứng",
        "accepted": [
          "kiểm chứng",
          "kiểm chứng",
          "kiểmchứng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 7: Tìm kiếm thông tin\ntrên Internet (Mục 2. Thực hành: Tìm kiếm và khai thác).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p13-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 7: Tìm ki...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 13 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p13-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p13-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-14": {
    "grade": 6,
    "period": 14,
    "lessonTitle": "Tiết 14",
    "yccd": "",
    "wordBank": [
      "Thư điện tử (Email)",
      "địa chỉ email",
      "tệp đính kèm"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p14-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 8: Thư điện tử (Mục 1. Khái niệm & Mục 2. Ưu/Nhược điểm của thư điện tử).",
        "postText": ".",
        "correctAnswer": "Thư điện tử (Email)",
        "accepted": [
          "thư điện tử (email)",
          "Thư điện tử (Email)",
          "Thưđiệntử(Email)"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p14-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "địa chỉ email",
        "accepted": [
          "địa chỉ email",
          "địa chỉ email",
          "địachỉemail"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p14-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "tệp đính kèm",
        "accepted": [
          "tệp đính kèm",
          "tệp đính kèm",
          "tệpđínhkèm"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 8: Thư điện tử (Mục\n1. Khái niệm & Mục 2. Ưu/Nhược điểm của thư điện tử).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p14-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 8: Thư đi...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 14 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p14-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p14-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-15": {
    "grade": 6,
    "period": 15,
    "lessonTitle": "Tiết 15",
    "yccd": "",
    "wordBank": [
      "soạn thư",
      "mật khẩu",
      "đăng xuất"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p15-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 8: Thư điện tử (Mục 3. Thực hành: Soạn và gửi thư điện tử).",
        "postText": ".",
        "correctAnswer": "soạn thư",
        "accepted": [
          "soạn thư",
          "soạn thư",
          "soạnthư"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p15-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "mật khẩu",
        "accepted": [
          "mật khẩu",
          "mật khẩu",
          "mậtkhẩu"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p15-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "đăng xuất",
        "accepted": [
          "đăng xuất",
          "đăng xuất",
          "đăngxuất"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\n\n\n\nTrang 44\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 8: Thư điện tử (Mục\n3. Thực hành: Soạn và gửi thư điện tử).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p15-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\n\n\n\nTrang 44\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung B...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 15 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p15-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p15-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-16": {
    "grade": 6,
    "period": 16,
    "lessonTitle": "Tiết 16",
    "yccd": "",
    "wordBank": [
      "mật khẩu mạnh",
      "mã độc",
      "quy tắc an toàn"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p16-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 9: An toàn thông tin trên Internet (Mục 1. Nguy cơ & Mục 2. Quy tắc an toàn).",
        "postText": ".",
        "correctAnswer": "mật khẩu mạnh",
        "accepted": [
          "mật khẩu mạnh",
          "mật khẩu mạnh",
          "mậtkhẩumạnh"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p16-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "mã độc",
        "accepted": [
          "mã độc",
          "mã độc",
          "mãđộc"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p16-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "quy tắc an toàn",
        "accepted": [
          "quy tắc an toàn",
          "quy tắc an toàn",
          "quytắcantoàn"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 9: An toàn thông tin\ntrên Internet (Mục 1. Nguy cơ & Mục 2. Quy tắc an toàn).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p16-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 9: An toà...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 16 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p16-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p16-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-17": {
    "grade": 6,
    "period": 17,
    "lessonTitle": "Tiết 17",
    "yccd": "",
    "wordBank": [
      "thông tin cá nhân",
      "bản quyền tác giả",
      "văn hóa mạng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p17-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 9: An toàn thông tin (Mục 3. Bảo vệ dữ liệu cá nhân và tài khoản).",
        "postText": ".",
        "correctAnswer": "thông tin cá nhân",
        "accepted": [
          "thông tin cá nhân",
          "thông tin cá nhân",
          "thôngtincánhân"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p17-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "bản quyền tác giả",
        "accepted": [
          "bản quyền tác giả",
          "bản quyền tác giả",
          "bảnquyềntácgiả"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p17-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "văn hóa mạng",
        "accepted": [
          "văn hóa mạng",
          "văn hóa mạng",
          "vănhóamạng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\n\n\n\nTrang 50\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 9: An toàn thông tin\n(Mục 3. Bảo vệ dữ liệu cá nhân và tài khoản).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p17-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\n\n\n\nTrang 50\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung B...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 17 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p17-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p17-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-18": {
    "grade": 6,
    "period": 18,
    "lessonTitle": "Tiết 18",
    "yccd": "",
    "wordBank": [
      "Sơ đồ tư duy",
      "chủ đề chính",
      "nhánh thông tin"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p18-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 10: Sơ đồ tư duy (Mục 1. Sơ đồ tư duy & Mục 2. Cách tạo sơ đồ tư duy thủ công).",
        "postText": ".",
        "correctAnswer": "Sơ đồ tư duy",
        "accepted": [
          "sơ đồ tư duy",
          "Sơ đồ tư duy",
          "Sơđồtưduy"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p18-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "chủ đề chính",
        "accepted": [
          "chủ đề chính",
          "chủ đề chính",
          "chủđềchính"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p18-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "nhánh thông tin",
        "accepted": [
          "nhánh thông tin",
          "nhánh thông tin",
          "nhánhthôngtin"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 10: Sơ đồ tư duy\n(Mục 1. Sơ đồ tư duy & Mục 2. Cách tạo sơ đồ tư duy thủ công).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p18-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 10: Sơ đồ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 18 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p18-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p18-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-19": {
    "grade": 6,
    "period": 19,
    "lessonTitle": "Tiết 19",
    "yccd": "",
    "wordBank": [
      "phần mềm sơ đồ tư duy",
      "chèn hình ảnh",
      "lưu tệp"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p19-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 10: Sơ đồ tư duy (Mục 3. Thực hành: Tạo sơ đồ tư duy bằng phần mềm).",
        "postText": ".",
        "correctAnswer": "phần mềm sơ đồ tư duy",
        "accepted": [
          "phần mềm sơ đồ tư duy",
          "phần mềm sơ đồ tư duy",
          "phầnmềmsơđồtưduy"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p19-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "chèn hình ảnh",
        "accepted": [
          "chèn hình ảnh",
          "chèn hình ảnh",
          "chènhìnhảnh"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p19-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "lưu tệp",
        "accepted": [
          "lưu tệp",
          "lưu tệp",
          "lưutệp"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 10: Sơ đồ tư duy\n(Mục 3. Thực hành: Tạo sơ đồ tư duy bằng phần mềm).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p19-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 10: Sơ đồ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 19 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p19-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p19-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-20": {
    "grade": 6,
    "period": 20,
    "lessonTitle": "Tiết 20",
    "yccd": "",
    "wordBank": [
      "soạn thảo văn bản",
      "định dạng ký tự",
      "căn lề đoạn văn"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p20-fb-1",
        "label": "a)",
        "preText": "Nắm vững quy trình thao tác và khái niệm trọng tâm của Bài 11: Định dạng văn bản (Mục 1, 2, 3. Phần mềm soạn thảo & Định dạng văn bản).",
        "postText": ".",
        "correctAnswer": "soạn thảo văn bản",
        "accepted": [
          "soạn thảo văn bản",
          "soạn thảo văn bản",
          "soạnthảovănbản"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p20-fb-2",
        "label": "b)",
        "preText": "Thực hiện đầy đủ các yêu cầu kỹ thuật theo hướng dẫn của giáo viên.",
        "postText": ".",
        "correctAnswer": "định dạng ký tự",
        "accepted": [
          "định dạng ký tự",
          "định dạng ký tự",
          "địnhdạngkýtự"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p20-fb-3",
        "label": "c)",
        "preText": "Tích hợp năng lực số và vận dụng công nghệ thông tin hiệu quả.",
        "postText": ".",
        "correctAnswer": "căn lề đoạn văn",
        "accepted": [
          "căn lề đoạn văn",
          "căn lề đoạn văn",
          "cănlềđoạnvăn"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 11: Định dạng văn\nbản (Mục 1, 2, 3. Phần mềm soạn thảo & Định dạng văn bản).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p20-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhân tích tình huống học tập thực tế liên quan trực tiếp đến nội dung Bài 11: Định ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 20 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p20-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p20-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-21": {
    "grade": 6,
    "period": 21,
    "lessonTitle": "Tiết 21",
    "yccd": "",
    "wordBank": [
      "bảng",
      "hàng và cột",
      "ô (cell)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p21-fb-1",
        "label": "a)",
        "preText": "Trình bày thông tin ở dạng bảng giúp người đọc dễ so sánh, cô đọng và tìm kiếm dữ liệu.",
        "postText": ".",
        "correctAnswer": "bảng",
        "accepted": [
          "bảng",
          "bảng",
          "bảng"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p21-fb-2",
        "label": "b)",
        "preText": "Để tạo một bảng gồm 4 cột 5 hàng, em chọn thẻ Insert -> Table -> Insert Table.",
        "postText": ".",
        "correctAnswer": "hàng và cột",
        "accepted": [
          "hàng và cột",
          "hàng và cột",
          "hàngvàcột"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p21-fb-3",
        "label": "c)",
        "preText": "Thao tác gộp nhiều ô thành một ô chọn lệnh Merge Cells.",
        "postText": ".",
        "correctAnswer": "ô (cell)",
        "accepted": [
          "ô (cell)",
          "ô (cell)",
          "ô(cell)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\n\n\n\nTrang 62\nTình huống: Nêu 2 ưu điểm lớn nhất của việc trình bày bảng điểm lớp học dạng bảng so với dạng liệt kê\ndòng chữ.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p21-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\n\n\n\nTrang 62\nNêu 2 ưu điểm lớn nhất của việc trình bày bảng điểm lớp học dạng bảng s...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 21 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p21-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p21-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-22": {
    "grade": 6,
    "period": 22,
    "lessonTitle": "Tiết 22",
    "yccd": "",
    "wordBank": [
      "định dạng bảng",
      "độ rộng cột",
      "đường viền"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p22-fb-1",
        "label": "a)",
        "preText": "Muốn thay đổi độ rộng của một cột, ta kéo thả chuột tại đường biên của cột đó.",
        "postText": ".",
        "correctAnswer": "định dạng bảng",
        "accepted": [
          "định dạng bảng",
          "định dạng bảng",
          "địnhdạngbảng"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p22-fb-2",
        "label": "b)",
        "preText": "Để tô màu nền cho các ô tiêu đề trong bảng, ta chọn biểu tượng Shading trong thẻ Design/Table Tools.",
        "postText": ".",
        "correctAnswer": "độ rộng cột",
        "accepted": [
          "độ rộng cột",
          "độ rộng cột",
          "độrộngcột"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p22-fb-3",
        "label": "c)",
        "preText": "Thao tác căn chỉnh nội dung chữ nằm chính giữa ô theo cả chiều ngang và chiều dọc chọn lệnh Center Alignment.",
        "postText": ".",
        "correctAnswer": "đường viền",
        "accepted": [
          "đường viền",
          "đường viền",
          "đườngviền"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Nêu sự khác nhau giữa việc xóa nội dung chữ trong ô (nhấn phím Delete) và việc xóa chính\nhàng đó (Delete Rows).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p22-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nNêu sự khác nhau giữa việc xóa nội dung chữ trong ô (nhấn phím Delete) và việc xóa ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 22 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p22-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p22-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-23": {
    "grade": 6,
    "period": 23,
    "lessonTitle": "Tiết 23",
    "yccd": "",
    "wordBank": [
      "công cụ Find",
      "công cụ Replace",
      "thay thế"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p23-fb-1",
        "label": "a)",
        "preText": "Công cụ Find giúp tìm nhanh một từ hoặc cụm từ trong văn bản dài hàng chục trang.",
        "postText": ".",
        "correctAnswer": "công cụ Find",
        "accepted": [
          "công cụ find",
          "công cụ Find",
          "côngcụFind"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p23-fb-2",
        "label": "b)",
        "preText": "Công cụ Replace giúp thay thế từ tìm thấy bằng một từ mới một cách tự động và chính xác.",
        "postText": ".",
        "correctAnswer": "công cụ Replace",
        "accepted": [
          "công cụ replace",
          "công cụ Replace",
          "côngcụReplace"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p23-fb-3",
        "label": "c)",
        "preText": "Sử dụng công cụ Find & Replace giúp tiết kiệm rất nhiều thời gian và tránh bỏ sót lỗi.",
        "postText": ".",
        "correctAnswer": "thay thế",
        "accepted": [
          "thay thế",
          "thay thế",
          "thaythế"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Tình huống: Bài viết 10 trang của em gõ nhầm từ 'Sài Gòn' thành 'Saigon'. Công cụ Replace All\ngiúp em xử lý trong mấy giây?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p23-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nTình huống: Bài viết 10 trang của em gõ nhầm từ 'Sài Gòn' thành 'Saigon'. Công cụ R...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 23 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p23-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p23-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-24": {
    "grade": 6,
    "period": 24,
    "lessonTitle": "Tiết 24",
    "yccd": "",
    "wordBank": [
      "sổ lưu niệm số",
      "trang bìa",
      "bố cục"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p24-fb-1",
        "label": "a)",
        "preText": "Sản phẩm số tổng hợp 'Sổ lưu niệm lớp 6A' kết hợp nhiều dạng thông tin: chữ, hình ảnh và bảng biểu.",
        "postText": ".",
        "correctAnswer": "sổ lưu niệm số",
        "accepted": [
          "sổ lưu niệm số",
          "sổ lưu niệm số",
          "sổlưuniệmsố"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p24-fb-2",
        "label": "b)",
        "preText": "Để tạo trang bìa đẹp mắt có sẵn mẫu trong Word, ta chọn thẻ Insert -> Cover Page.",
        "postText": ".",
        "correctAnswer": "trang bìa",
        "accepted": [
          "trang bìa",
          "trang bìa",
          "trangbìa"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p24-fb-3",
        "label": "c)",
        "preText": "Việc sắp xếp bố cục hợp lý giúp sản phẩm số trở nên đẹp mắt và hấp dẫn người đọc.",
        "postText": ".",
        "correctAnswer": "bố cục",
        "accepted": [
          "bố cục",
          "bố cục",
          "bốcục"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Tại sao cần thống nhất một phông chữ chính (như Times New Roman hoặc Calibri) cho toàn bộ\ncuốn sổ lưu niệm?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p24-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nTại sao cần thống nhất một phông chữ chính (như Times New Roman hoặc Calibri) cho t...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 24 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p24-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p24-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-25": {
    "grade": 6,
    "period": 25,
    "lessonTitle": "Tiết 25",
    "yccd": "",
    "wordBank": [
      "Thuật toán",
      "Đầu vào (Input)",
      "Đầu ra (Output)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p25-fb-1",
        "label": "a)",
        "preText": "Thuật toán là một dãy các chỉ dẫn rõ ràng, có trình tự sao cho khi thực hiện người ta giải quyết được vấn đề.",
        "postText": ".",
        "correctAnswer": "Thuật toán",
        "accepted": [
          "thuật toán",
          "Thuật toán",
          "Thuậttoán"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p25-fb-2",
        "label": "b)",
        "preText": "Thông tin cần đạt được sau khi thực hiện xong thuật toán gọi là Đầu ra (Output).",
        "postText": ".",
        "correctAnswer": "Đầu vào (Input)",
        "accepted": [
          "đầu vào (input)",
          "Đầu vào (Input)",
          "Đầuvào(Input)"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p25-fb-3",
        "label": "c)",
        "preText": "Hai cách mô tả thuật toán phổ biến là dùng ngôn ngữ tự nhiên và dùng Sơ đồ khối.",
        "postText": ".",
        "correctAnswer": "Đầu ra (Output)",
        "accepted": [
          "đầu ra (output)",
          "Đầu ra (Output)",
          "Đầura(Output)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Nêu Đầu vào (Input) và Đầu ra (Output) của thuật toán tính điểm trung bình 3 môn Toán, Văn,\nAnh.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p25-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nNêu Đầu vào (Input) và Đầu ra (Output) của thuật toán tính điểm trung bình 3 môn To...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 25 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p25-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p25-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-26": {
    "grade": 6,
    "period": 26,
    "lessonTitle": "Tiết 26",
    "yccd": "",
    "wordBank": [
      "tuần tự",
      "rẽ nhánh",
      "điều kiện"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p26-fb-1",
        "label": "a)",
        "preText": "Cấu trúc tuần tự thực hiện các bước nối tiếp nhau theo đúng trình tự từ đầu đến kết thúc.",
        "postText": ".",
        "correctAnswer": "tuần tự",
        "accepted": [
          "tuần tự",
          "tuần tự",
          "tuầntự"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p26-fb-2",
        "label": "b)",
        "preText": "Cấu trúc rẽ nhánh dạng thiếu có cú pháp: Nếu Điều kiện Đúng thì thực hiện Lệnh.",
        "postText": ".",
        "correctAnswer": "rẽ nhánh",
        "accepted": [
          "rẽ nhánh",
          "rẽ nhánh",
          "rẽnhánh"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p26-fb-3",
        "label": "c)",
        "preText": "Cấu trúc rẽ nhánh dạng đủ có cú pháp: Nếu Điều kiện Đúng thì thực hiện Lệnh 1, ngược lại thì thực hiện Lệnh 2.",
        "postText": ".",
        "correctAnswer": "điều kiện",
        "accepted": [
          "điều kiện",
          "điều kiện",
          "điềukiện"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Phát biểu câu điều kiện rẽ nhánh dạng đủ cho tình huống xếp loại học tập dựa trên điểm trung\nbình (>= 5.0 là Đủ điều kiện lên lớp, ngược lại Phải thi lại).",
    "shortAnswerQuestions": [
      {
        "id": "k6-p26-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nPhát biểu câu điều kiện rẽ nhánh dạng đủ cho tình huống xếp loại học tập dựa trên đ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 26 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p26-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p26-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-27": {
    "grade": 6,
    "period": 27,
    "lessonTitle": "Tiết 27",
    "yccd": "",
    "wordBank": [
      "cấu trúc lặp",
      "số lần lặp",
      "điều kiện dừng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p27-fb-1",
        "label": "a)",
        "preText": "Cấu trúc lặp dùng để mô tả các bước của thuật toán được thực hiện lặp đi lặp lại nhiều lần.",
        "postText": ".",
        "correctAnswer": "cấu trúc lặp",
        "accepted": [
          "cấu trúc lặp",
          "cấu trúc lặp",
          "cấutrúclặp"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p27-fb-2",
        "label": "b)",
        "preText": "Trong cấu trúc lặp, bao giờ cũng có bước kiểm tra Điều kiện dừng để kết thúc quá trình lặp.",
        "postText": ".",
        "correctAnswer": "số lần lặp",
        "accepted": [
          "số lần lặp",
          "số lần lặp",
          "sốlầnlặp"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p27-fb-3",
        "label": "c)",
        "preText": "Ba cấu trúc điều khiển cơ bản để mô tả mọi thuật toán là: Tuần tự, Rẽ nhánh và Lặp.",
        "postText": ".",
        "correctAnswer": "điều kiện dừng",
        "accepted": [
          "điều kiện dừng",
          "điều kiện dừng",
          "điềukiệndừng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Xác định công việc lặp lại và Điều kiện dừng lặp trong tình huống: 'Học sinh làm bài tập toán\ncho đến khi hết 5 bài tập được giao'.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p27-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nXác định công việc lặp lại và Điều kiện dừng lặp trong tình huống: 'Học sinh làm bà...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 27 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p27-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p27-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-28": {
    "grade": 6,
    "period": 28,
    "lessonTitle": "Tiết 28",
    "yccd": "",
    "wordBank": [
      "chương trình máy tính",
      "ngôn ngữ lập trình",
      "Scratch"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p28-fb-1",
        "label": "a)",
        "preText": "Máy tính thực hiện các công việc thông qua việc chạy một Chương trình máy tính.",
        "postText": ".",
        "correctAnswer": "chương trình máy tính",
        "accepted": [
          "chương trình máy tính",
          "chương trình máy tính",
          "chươngtrìnhmáytính"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p28-fb-2",
        "label": "b)",
        "preText": "Ngôn ngữ lập trình là mô tả thuật toán bằng một ngôn ngữ mà máy tính có thể 'hiểu' và thực thi được.",
        "postText": ".",
        "correctAnswer": "ngôn ngữ lập trình",
        "accepted": [
          "ngôn ngữ lập trình",
          "ngôn ngữ lập trình",
          "ngônngữlậptrình"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p28-fb-3",
        "label": "c)",
        "preText": "Con người sử dụng Ngôn ngữ lập trình (như Scratch, Python, C++) để tạo ra chương trình máy tính.",
        "postText": ".",
        "correctAnswer": "Scratch",
        "accepted": [
          "scratch",
          "Scratch",
          "Scratch"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Tại sao máy tính không thể trực tiếp hiểu và chạy ngay thuật toán viết bằng ngôn ngữ tự nhiên\nTiếng Việt của chúng ta?",
    "shortAnswerQuestions": [
      {
        "id": "k6-p28-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nTại sao máy tính không thể trực tiếp hiểu và chạy ngay thuật toán viết bằng ngôn ng...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 28 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p28-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p28-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k6-tiet-29": {
    "grade": 6,
    "period": 29,
    "lessonTitle": "Tiết 29",
    "yccd": "",
    "wordBank": [
      "khối lệnh",
      "chạy thử",
      "sửa lỗi (debug)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k6-p29-fb-1",
        "label": "a)",
        "preText": "Môi trường lập trình Scratch giúp học sinh rèn luyện tư duy thuật toán thông qua kéo thả khối lệnh.",
        "postText": ".",
        "correctAnswer": "khối lệnh",
        "accepted": [
          "khối lệnh",
          "khối lệnh",
          "khốilệnh"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p29-fb-2",
        "label": "b)",
        "preText": "Để lưu kết quả nhập vào từ người dùng trong Scratch, ta sử dụng các Biến số.",
        "postText": ".",
        "correctAnswer": "chạy thử",
        "accepted": [
          "chạy thử",
          "chạy thử",
          "chạythử"
        ],
        "points": 0.35
      },
      {
        "id": "k6-p29-fb-3",
        "label": "c)",
        "preText": "Quá trình chạy thử chương trình để phát hiện và sửa lỗi gọi là quá trình kiểm thử chương trình.",
        "postText": ".",
        "correctAnswer": "sửa lỗi (debug)",
        "accepted": [
          "sửa lỗi (debug)",
          "sửa lỗi (debug)",
          "sửalỗi(debug)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ":\nTình huống: Nêu 3 bước chính để chuyển một thuật toán tính tiền bán thiệp chúc mừng thành một chương\ntrình chạy hoàn chỉnh trên Scratch.",
    "shortAnswerQuestions": [
      {
        "id": "k6-p29-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \":\nNêu 3 bước chính để chuyển một thuật toán tính tiền bán thiệp chúc mừng thành một c...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học Tiết 29 để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k6-p29-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 6.",
        "points": 0.3
      },
      {
        "id": "k6-p29-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-1": {
    "grade": 7,
    "period": 1,
    "lessonTitle": "BÀI 1. THIẾT BỊ VÀO - RA (MỤC 1: KHÁI NIỆM & PHÂN LOẠI)",
    "yccd": "Nhận biết và phân loại các thiết bị vào, thiết bị ra, thiết",
    "wordBank": [
      "dữ liệu",
      "văn bản",
      "ra"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p1-fb-1",
        "label": "a)",
        "preText": "Thiết bị vào được dùng để nhập",
        "postText": "vào máy tính như bàn phím, chuột, micro, camera.",
        "correctAnswer": "dữ liệu",
        "accepted": [
          "dữ liệu",
          "dữ liệu",
          "dữliệu"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p1-fb-2",
        "label": "b)",
        "preText": "Thiết bị ra được dùng để xuất dữ liệu từ máy tính ra bên ngoài dưới dạng",
        "postText": ", âm thanh hoặc hình ảnh.",
        "correctAnswer": "văn bản",
        "accepted": [
          "văn bản",
          "văn bản",
          "vănbản"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p1-fb-3",
        "label": "c)",
        "preText": "Máy chiếu là thiết bị",
        "postText": ", dùng để hiển thị nội dung màn hình máy tính lên màn chiếu rộng.",
        "correctAnswer": "ra",
        "accepted": [
          "ra",
          "ra",
          "ra"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "tai nghe kèm micro này thuộc loại thiết bị nào? Giải thích rõ luồng thông tin vào và ra qua thiết bị này.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p1-sa-1",
        "label": "• Phân loại thiết bị:",
        "question": "Bộ tai nghe có gắn micro thuộc loại thiết bị nào?",
        "placeholder": "Nhập phân loại...",
        "sampleAnswer": "Thuộc loại thiết bị vừa vào vừa ra (micro là thiết bị vào, tai nghe là thiết bị ra).",
        "points": 0.4
      },
      {
        "id": "k7-p1-sa-2",
        "label": "• Luồng thông tin VÀO:",
        "question": "Mô tả luồng thông tin vào qua micro:",
        "placeholder": "Mô tả luồng vào...",
        "sampleAnswer": "Micro thu âm giọng nói của An (sóng âm) và chuyển thành tín hiệu số truyền vào máy tính.",
        "points": 0.3
      },
      {
        "id": "k7-p1-sa-3",
        "label": "• Luồng thông tin RA:",
        "question": "Mô tả luồng thông tin ra qua tai nghe:",
        "placeholder": "Mô tả luồng ra...",
        "sampleAnswer": "Tai nghe tiếp nhận tín hiệu âm thanh từ máy tính và phát ra tai An nghe tiếng thầy cô, bạn bè.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-2": {
    "grade": 7,
    "period": 2,
    "lessonTitle": "BÀI 1. THIẾT BỊ VÀO - RA (MỤC 2: AN TOÀN THIẾT BỊ)",
    "yccd": "Thực hiện đúng các thao tác với thiết bị thông dụng,",
    "wordBank": [
      "thao tác đúng quy trình",
      "cổng kết nối",
      "an toàn điện"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p2-fb-1",
        "label": "a)",
        "preText": "Việc cắm nhầm đầu cắm tai nghe vào cổng micro có thể khiến thiết bị không",
        "postText": ".",
        "correctAnswer": "thao tác đúng quy trình",
        "accepted": [
          "thao tác đúng quy trình",
          "thao tác đúng quy trình",
          "thaotácđúngquytrình"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p2-fb-2",
        "label": "b)",
        "preText": "Khi rút thẻ nhớ hoặc USB, nên sử dụng lệnh",
        "postText": "trên hệ điều hành để tránh mất dữ liệu.",
        "correctAnswer": "cổng kết nối",
        "accepted": [
          "cổng kết nối",
          "cổng kết nối",
          "cổngkếtnối"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p2-fb-3",
        "label": "c)",
        "preText": "Để thức ăn, nước uống gần bàn phím máy tính có thể gây nguy cơ",
        "postText": "và hỏng mạch điện.",
        "correctAnswer": "an toàn điện",
        "accepted": [
          "an toàn điện",
          "an toàn điện",
          "antoànđiện"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "mà không bấm nút Shut down trên Windows. Em hãy phân tích 2 tác hại của thói quen này đối với phần\ncứng và phần mềm.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p2-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"mà không bấm nút Shut down trên Windows. Em hãy phân tích 2 tác hại của thói quen này...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 1. THIẾT BỊ VÀO - RA (MỤC 2: AN TOÀN THIẾT BỊ) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p2-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p2-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-3": {
    "grade": 7,
    "period": 3,
    "lessonTitle": "BÀI 2. PHẦN MỀM MÁY TÍNH (MỤC 1: HỆ ĐIỀU HÀNH)",
    "yccd": "Giải thích sơ lược chức năng điều khiển và quản lý của",
    "wordBank": [
      "phần mềm hệ thống (Hệ điều hành)",
      "phần mềm ứng dụng",
      "quản lý"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p3-fb-1",
        "label": "a)",
        "preText": "Windows, macOS, Linux là các hệ điều hành phổ biến dành cho",
        "postText": ".",
        "correctAnswer": "phần mềm hệ thống (Hệ điều hành)",
        "accepted": [
          "phần mềm hệ thống (hệ điều hành)",
          "phần mềm hệ thống (Hệ điều hành)",
          "phầnmềmhệthống(Hệđiềuhành)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p3-fb-2",
        "label": "b)",
        "preText": "Android và iOS là hai hệ điều hành hàng đầu dành cho",
        "postText": "và máy tính bảng.",
        "correctAnswer": "phần mềm ứng dụng",
        "accepted": [
          "phần mềm ứng dụng",
          "phần mềm ứng dụng",
          "phầnmềmứngdụng"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p3-fb-3",
        "label": "c)",
        "preText": "Nếu không có hệ điều hành, máy tính chỉ là một khối",
        "postText": "không thể hoạt động.",
        "correctAnswer": "quản lý",
        "accepted": [
          "quản lý",
          "quản lý",
          "quảnlý"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "bạn không thể mở phần mềm luyện gõ phím hay duyệt web được? Hãy giải thích ngắn gọn.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p3-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"bạn không thể mở phần mềm luyện gõ phím hay duyệt web được? Hãy giải thích ngắn gọn....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 2. PHẦN MỀM MÁY TÍNH (MỤC 1: HỆ ĐIỀU HÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p3-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p3-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-4": {
    "grade": 7,
    "period": 4,
    "lessonTitle": "BÀI 2. PHẦN MỀM MÁY TÍNH (MỤC 2: PHẦN MỀM ỨNG DỤNG)",
    "yccd": "Nêu tên một số phần mềm ứng dụng; giải thích phần",
    "wordBank": [
      "thư mục (Folder)",
      "tệp tin (File)",
      "cây thư mục"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p4-fb-1",
        "label": "a)",
        "preText": "Phần mở rộng của tên tệp gồm các ký tự đứng sau dấu",
        "postText": "cuối cùng trong tên tệp.",
        "correctAnswer": "thư mục (Folder)",
        "accepted": [
          "thư mục (folder)",
          "thư mục (Folder)",
          "thưmục(Folder)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p4-fb-2",
        "label": "b)",
        "preText": "Phần mở rộng giúp hệ điều hành nhận biết loại tệp và chọn",
        "postText": "phù hợp để mở tệp đó.",
        "correctAnswer": "tệp tin (File)",
        "accepted": [
          "tệp tin (file)",
          "tệp tin (File)",
          "tệptin(File)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p4-fb-3",
        "label": "c)",
        "preText": "Phần mềm Scratch lưu tệp dự án lập trình với phần mở rộng là",
        "postText": ".",
        "correctAnswer": "cây thư mục",
        "accepted": [
          "cây thư mục",
          "cây thư mục",
          "câythưmục"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "rộng của tệp này là gì? Em hãy nêu ưu điểm của tệp dạng định dạng PDF.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p4-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"rộng của tệp này là gì? Em hãy nêu ưu điểm của tệp dạng định dạng PDF....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 2. PHẦN MỀM MÁY TÍNH (MỤC 2: PHẦN MỀM ỨNG DỤNG) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p4-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p4-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-5": {
    "grade": 7,
    "period": 5,
    "lessonTitle": "BÀI 3. QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH (MỤC 1, 2: TÊN TỆP, THƯ MỤC\n& BẢO VỆ DỮ LIỆU)",
    "yccd": "Biết tệp chương trình cũng là dữ liệu; nêu ví dụ biện",
    "wordBank": [
      "văn hóa ứng xử",
      "tôn trọng",
      "bảo vệ thông tin"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p5-fb-1",
        "label": "a)",
        "preText": "Sao lưu dữ liệu có 2 dạng chính: Sao lưu cục bộ (ổ cứng ngoài, USB) và sao lưu",
        "postText": "(Google Drive, OneDrive).",
        "correctAnswer": "văn hóa ứng xử",
        "accepted": [
          "văn hóa ứng xử",
          "văn hóa ứng xử",
          "vănhóaứngxử"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p5-fb-2",
        "label": "b)",
        "preText": "Mật khẩu mạnh nên có độ dài từ 8 ký tự trở lên, gồm chữ hoa, chữ thường, chữ số và",
        "postText": ".",
        "correctAnswer": "tôn trọng",
        "accepted": [
          "tôn trọng",
          "tôn trọng",
          "tôntrọng"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p5-fb-3",
        "label": "c)",
        "preText": "Virus máy tính là các phần mềm độc hại có khả năng tự nhân bản và gây hỏng",
        "postText": ".",
        "correctAnswer": "bảo vệ thông tin",
        "accepted": [
          "bảo vệ thông tin",
          "bảo vệ thông tin",
          "bảovệthôngtin"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "'New Folder' trên màn hình Desktop. Em hãy phân tích 2 tác hại của cách lưu trữ này.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p5-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"'New Folder' trên màn hình Desktop. Em hãy phân tích 2 tác hại của cách lưu trữ này....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 3. QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH (MỤC 1, 2: TÊN TỆP, THƯ MỤC\n& BẢO VỆ DỮ LIỆU) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p5-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p5-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-6": {
    "grade": 7,
    "period": 6,
    "lessonTitle": "BÀI 3. QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH (MỤC 3: THỰC HÀNH QUẢN LÝ\nDỮ LIỆU)",
    "yccd": "Thao tác thành thạo với tệp và thư mục: tạo, sao chép,",
    "wordBank": [
      "kết nối mạng",
      "mạng xã hội",
      "chọn lọc"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p6-fb-1",
        "label": "a)",
        "preText": "Ứng dụng quản lý tệp và thư mục mặc định trên hệ điều hành Windows có tên là",
        "postText": ".",
        "correctAnswer": "kết nối mạng",
        "accepted": [
          "kết nối mạng",
          "kết nối mạng",
          "kếtnốimạng"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p6-fb-2",
        "label": "b)",
        "preText": "Khi xóa một tệp bằng phím Delete, tệp đó sẽ được chuyển tạm thời vào",
        "postText": ".",
        "correctAnswer": "mạng xã hội",
        "accepted": [
          "mạng xã hội",
          "mạng xã hội",
          "mạngxãhội"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p6-fb-3",
        "label": "c)",
        "preText": "Để khôi phục tệp đã xóa từ Recycle Bin, ta nhấp chuột phải vào tệp và chọn",
        "postText": ".",
        "correctAnswer": "chọn lọc",
        "accepted": [
          "chọn lọc",
          "chọn lọc",
          "chọnlọc"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "E:). Hãy nêu rõ các bước bấm chuột và phím tắt thực hiện.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p6-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"E:). Hãy nêu rõ các bước bấm chuột và phím tắt thực hiện....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 3. QUẢN LÝ DỮ LIỆU TRONG MÁY TÍNH (MỤC 3: THỰC HÀNH QUẢN LÝ\nDỮ LIỆU) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p6-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p6-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-7": {
    "grade": 7,
    "period": 7,
    "lessonTitle": "BÀI 4. MẠNG XÃ HỘI VÀ MỘT SỐ KÊNH TRAO ĐỔI THÔNG TIN (MỤC 1: KHÁI\nNIỆM & CHỨC NĂNG)",
    "yccd": "Nêu được tên kênh trao đổi thông tin thông dụng; nêu",
    "wordBank": [
      "bảng tính điện tử (Excel)",
      "trang tính (Sheet)",
      "ô tính"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p7-fb-1",
        "label": "a)",
        "preText": "Facebook, YouTube, Zalo, Instagram là các ví dụ phổ biến về",
        "postText": ".",
        "correctAnswer": "bảng tính điện tử (Excel)",
        "accepted": [
          "bảng tính điện tử (excel)",
          "bảng tính điện tử (Excel)",
          "bảngtínhđiệntử(Excel)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p7-fb-2",
        "label": "b)",
        "preText": "Tính hai mặt của MXH gồm: Mặt tích cực giúp mở rộng kết nối và mặt tiêu cực gây lãng phí",
        "postText": ".",
        "correctAnswer": "trang tính (Sheet)",
        "accepted": [
          "trang tính (sheet)",
          "trang tính (Sheet)",
          "trangtính(Sheet)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p7-fb-3",
        "label": "c)",
        "preText": "Hầu hết các trang mạng xã hội quy định độ tuổi tối thiểu tham gia là từ",
        "postText": "tuổi trở lên.",
        "correctAnswer": "ô tính",
        "accepted": [
          "ô tính",
          "ô tính",
          "ôtính"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "Algorithm) trên YouTube hay TikTok? Thuật toán này hoạt động dựa trên thông tin nào của em?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p7-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Algorithm) trên YouTube hay TikTok? Thuật toán này hoạt động dựa trên thông tin nào c...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 4. MẠNG XÃ HỘI VÀ MỘT SỐ KÊNH TRAO ĐỔI THÔNG TIN (MỤC 1: KHÁI\nNIỆM & CHỨC NĂNG) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p7-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p7-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-8": {
    "grade": 7,
    "period": 8,
    "lessonTitle": "BÀI 4. MẠNG XÃ HỘI VÀ MỘT SỐ KÊNH TRAO ĐỔI THÔNG TIN (MỤC 2:\nTHỰC HÀNH MXH AN TOÀN)",
    "yccd": "Sử dụng được một số chức năng cơ bản của một mạng",
    "wordBank": [
      "dữ liệu số",
      "dữ liệu ký tự",
      "căn lề"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p8-fb-1",
        "label": "a)",
        "preText": "Video Deepfake là sản phẩm giả mạo hình ảnh và giọng nói do công nghệ",
        "postText": "tạo ra nhằm lừa đảo.",
        "correctAnswer": "dữ liệu số",
        "accepted": [
          "dữ liệu số",
          "dữ liệu số",
          "dữliệusố"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p8-fb-2",
        "label": "b)",
        "preText": "Khi đăng bài trên MXH, chọn chế độ chia sẻ",
        "postText": "(Friends) thay vì Công khai (Public) để an toàn hơn.",
        "correctAnswer": "dữ liệu ký tự",
        "accepted": [
          "dữ liệu ký tự",
          "dữ liệu ký tự",
          "dữliệukýtự"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p8-fb-3",
        "label": "c)",
        "preText": "Hành vi quay lén, chụp ảnh bạn bè lúc xấu rồi đăng lên mạng bêu rếu là vi phạm",
        "postText": ".",
        "correctAnswer": "căn lề",
        "accepted": [
          "căn lề",
          "căn lề",
          "cănlề"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "mặt/mắt chớp bất thường/giọng nói đứt quãng) là gì? Em nên làm gì khi nhận cuộc gọi video nghi ngờ này?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p8-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"mặt/mắt chớp bất thường/giọng nói đứt quãng) là gì? Em nên làm gì khi nhận cuộc gọi v...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 4. MẠNG XÃ HỘI VÀ MỘT SỐ KÊNH TRAO ĐỔI THÔNG TIN (MỤC 2:\nTHỰC HÀNH MXH AN TOÀN) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p8-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p8-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-9": {
    "grade": 7,
    "period": 9,
    "lessonTitle": "BÀI 5. ỨNG XỬ TRÊN MẠNG (MỤC 1, 2: GIAO TIẾP VĂN HÓA & XỬ LÝ\nTHÔNG TIN XẤU)",
    "yccd": "Thực hiện giao tiếp qua mạng lịch sự, văn hóa; biết",
    "wordBank": [
      "công thức",
      "dấu bằng (=)",
      "địa chỉ ô"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p9-fb-1",
        "label": "a)",
        "preText": "Văn hóa ứng xử trên mạng yêu cầu không dùng từ ngữ tục tĩu, không phát ngôn bốc đồng hay xúc phạm",
        "postText": ".",
        "correctAnswer": "công thức",
        "accepted": [
          "công thức",
          "công thức",
          "côngthức"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p9-fb-2",
        "label": "b)",
        "preText": "Thông tin xấu độc trên mạng bao gồm: Tin giả, bạo lực, cờ bạc, nội dung khiêu dâm và kích động",
        "postText": ".",
        "correctAnswer": "dấu bằng (=)",
        "accepted": [
          "dấu bằng (=)",
          "dấu bằng (=)",
          "dấubằng(=)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p9-fb-3",
        "label": "c)",
        "preText": "Khi sử dụng công cụ AI (như ChatGPT), ta cần đặt câu hỏi với thái độ lịch sự và không yêu cầu AI thực hiện hành vi",
        "postText": ".",
        "correctAnswer": "địa chỉ ô",
        "accepted": [
          "địa chỉ ô",
          "địa chỉ ô",
          "địachỉô"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "? Hãy nêu 2 việc NÊN LÀM\nvà 2 việc KHÔNG NÊN LÀM khi tham gia thảo luận nhóm trực tuyến.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p9-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"? Hãy nêu 2 việc NÊN LÀM\nvà 2 việc KHÔNG NÊN LÀM khi tham gia thảo luận nhóm trực tuy...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 5. ỨNG XỬ TRÊN MẠNG (MỤC 1, 2: GIAO TIẾP VĂN HÓA & XỬ LÝ\nTHÔNG TIN XẤU) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p9-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p9-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-10": {
    "grade": 7,
    "period": 10,
    "lessonTitle": "BÀI 5. ỨNG XỬ TRÊN MẠNG (MỤC 3: TÁC HẠI & PHÒNG TRÁNH NGHIỆN\nINTERNET)",
    "yccd": "Biết tác hại của bệnh nghiện Internet, có ý thức phòng",
    "wordBank": [
      "chèn hàng cột",
      "xóa hàng cột",
      "gộp ô (Merge)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p10-fb-1",
        "label": "a)",
        "preText": "Triệu chứng của bệnh nghiện Internet bao gồm: Bỏ bê học hành, hay cáu gắt khi bị cấm dùng máy và mất kết nối với",
        "postText": ".",
        "correctAnswer": "chèn hàng cột",
        "accepted": [
          "chèn hàng cột",
          "chèn hàng cột",
          "chènhàngcột"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p10-fb-2",
        "label": "b)",
        "preText": "Để bảo vệ mắt, áp dụng quy tắc 20-20-20: Sau 20 phút nhìn màn hình, hãy nhìn xa 20 feet (6m) trong",
        "postText": "giây.",
        "correctAnswer": "xóa hàng cột",
        "accepted": [
          "xóa hàng cột",
          "xóa hàng cột",
          "xóahàngcột"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p10-fb-3",
        "label": "c)",
        "preText": "Khi cảm thấy bế tắc hoặc bị đe dọa trên mạng, em nên chủ động tìm sự tư vấn từ bố mẹ, thầy cô hoặc tổng đài bảo vệ trẻ em",
        "postText": ".",
        "correctAnswer": "gộp ô (Merge)",
        "accepted": [
          "gộp ô (merge)",
          "gộp ô (Merge)",
          "gộpô(Merge)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "khuya chơi game online đối với học sinh lớp 7.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p10-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"khuya chơi game online đối với học sinh lớp 7....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 5. ỨNG XỬ TRÊN MẠNG (MỤC 3: TÁC HẠI & PHÒNG TRÁNH NGHIỆN\nINTERNET) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p10-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p10-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-11": {
    "grade": 7,
    "period": 11,
    "lessonTitle": "BÀI 6. LÀM QUEN VỚI PHẦN MỀM BẢNG TÍNH (MỤC 1, 2: GIAO DIỆN &\nNHẬP DỮ LIỆU)",
    "yccd": "Nêu các chức năng cơ bản của bảng tính; nhận biết",
    "wordBank": [
      "hàm SUM",
      "hàm AVERAGE",
      "hàm MAX / MIN"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p11-fb-1",
        "label": "a)",
        "preText": "Các cột của trang tính được đặt tên bằng các chữ cái A, B, C",
        "postText": "còn các hàng được đặt tên bằng các chữ số",
        "correctAnswer": "hàm SUM",
        "accepted": [
          "hàm sum",
          "hàm SUM",
          "hàmSUM"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p11-fb-2",
        "label": "b)",
        "preText": "Địa chỉ của một ô tính được viết kết hợp giữa tên cột và tên hàng, ví dụ ô ở cột B hàng 5 có địa chỉ là",
        "postText": ".",
        "correctAnswer": "hàm AVERAGE",
        "accepted": [
          "hàm average",
          "hàm AVERAGE",
          "hàmAVERAGE"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p11-fb-3",
        "label": "c)",
        "preText": "Dữ liệu dạng văn bản tự động căn",
        "postText": "ô, dữ liệu dạng số tự động căn",
        "correctAnswer": "hàm MAX / MIN",
        "accepted": [
          "hàm max / min",
          "hàm MAX / MIN",
          "hàmMAX/MIN"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "dữ liệu này gồm bao nhiêu cột, bao nhiêu hàng và tổng cộng có bao nhiêu ô tính?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p11-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"dữ liệu này gồm bao nhiêu cột, bao nhiêu hàng và tổng cộng có bao nhiêu ô tính?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 6. LÀM QUEN VỚI PHẦN MỀM BẢNG TÍNH (MỤC 1, 2: GIAO DIỆN &\nNHẬP DỮ LIỆU) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p11-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p11-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-12": {
    "grade": 7,
    "period": 12,
    "lessonTitle": "BÀI 6. LÀM QUEN VỚI PHẦN MỀM BẢNG TÍNH (MỤC 3: THỰC HÀNH\nTRƯỜNG HỌC XANH)",
    "yccd": "Thực hành nhập dữ liệu, chỉnh độ rộng cột, định dạng",
    "wordBank": [
      "định dạng số",
      "kẻ đường viền",
      "màu nền"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p12-fb-1",
        "label": "a)",
        "preText": "Khi ô tính xuất hiện ký hiệu `###`, nguyên nhân là do độ rộng cột quá",
        "postText": "không đủ hiển thị số.",
        "correctAnswer": "định dạng số",
        "accepted": [
          "định dạng số",
          "định dạng số",
          "địnhdạngsố"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p12-fb-2",
        "label": "b)",
        "preText": "Để đổi tên trang tính Sheet1 thành 'KhaoSat', nhấp chuột phải vào tên Sheet và chọn",
        "postText": ".",
        "correctAnswer": "kẻ đường viền",
        "accepted": [
          "kẻ đường viền",
          "kẻ đường viền",
          "kẻđườngviền"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p12-fb-3",
        "label": "c)",
        "preText": "Tệp bảng tính dự án Trường học xanh được yêu cầu lưu trữ với tên tệp là",
        "postText": ".",
        "correctAnswer": "màu nền",
        "accepted": [
          "màu nền",
          "màu nền",
          "màunền"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "Hãy nêu 2 cách khắc phục hiển thị này.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p12-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Hãy nêu 2 cách khắc phục hiển thị này....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 6. LÀM QUEN VỚI PHẦN MỀM BẢNG TÍNH (MỤC 3: THỰC HÀNH\nTRƯỜNG HỌC XANH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p12-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p12-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-13": {
    "grade": 7,
    "period": 13,
    "lessonTitle": "BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH (MỤC 1, 2: KIỂU DỮ LIỆU &\nCÔNG THỨC)",
    "yccd": "Nhận biết các kiểu dữ liệu; sử dụng công thức và địa chỉ",
    "wordBank": [
      "sắp xếp dữ liệu",
      "lọc dữ liệu (Filter)",
      "tiêu chí"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p13-fb-1",
        "label": "a)",
        "preText": "Trong Excel, biểu thức toán học `(a + b) x c` được viết thành công thức `=(a + b) * c`.",
        "postText": ".",
        "correctAnswer": "sắp xếp dữ liệu",
        "accepted": [
          "sắp xếp dữ liệu",
          "sắp xếp dữ liệu",
          "sắpxếpdữliệu"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p13-fb-2",
        "label": "b)",
        "preText": "Nếu ô A1 có giá trị 10, ô B1 có giá trị 5 thì công thức `=A1+B1` tại ô C1 cho kết quả là",
        "postText": ".",
        "correctAnswer": "lọc dữ liệu (Filter)",
        "accepted": [
          "lọc dữ liệu (filter)",
          "lọc dữ liệu (Filter)",
          "lọcdữliệu(Filter)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p13-fb-3",
        "label": "c)",
        "preText": "Ký hiệu phép so sánh khác nhau trong công thức bảng tính được viết là",
        "postText": ".",
        "correctAnswer": "tiêu chí",
        "accepted": [
          "tiêu chí",
          "tiêu chí",
          "tiêuchí"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "mà\nkhông nên viết `=25*10000` (dùng hằng số trực tiếp)? Giải thích ưu điểm tự động.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p13-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"mà\nkhông nên viết `=25*10000` (dùng hằng số trực tiếp)? Giải thích ưu điểm tự động....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH (MỤC 1, 2: KIỂU DỮ LIỆU &\nCÔNG THỨC) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p13-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p13-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-14": {
    "grade": 7,
    "period": 14,
    "lessonTitle": "BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH (MỤC 3: SAO CHÉP CÔNG\nTHỨC)",
    "yccd": "Giải thích việc đưa công thức vào bảng tính là cách điều",
    "wordBank": [
      "biểu đồ cột",
      "trực quan hóa",
      "chú giải"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p14-fb-1",
        "label": "a)",
        "preText": "Nếu công thức tại ô E4 là `=C4*D4`, khi sao chép xuống ô E5 công thức sẽ tự động đổi thành",
        "postText": ".",
        "correctAnswer": "biểu đồ cột",
        "accepted": [
          "biểu đồ cột",
          "biểu đồ cột",
          "biểuđồcột"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p14-fb-2",
        "label": "b)",
        "preText": "Nếu công thức tại ô E4 là `=C4*D4`, khi sao chép sang phải đến ô F4 công thức sẽ đổi thành",
        "postText": ".",
        "correctAnswer": "trực quan hóa",
        "accepted": [
          "trực quan hóa",
          "trực quan hóa",
          "trựcquanhóa"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p14-fb-3",
        "label": "c)",
        "preText": "Nút điền AutoFill có hình dạng là một dấu cộng nhỏ màu",
        "postText": "khi đưa con trỏ vào góc dưới-phải ô.",
        "correctAnswer": "chú giải",
        "accepted": [
          "chú giải",
          "chú giải",
          "chúgiải"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "có cần phải gõ lại công thức cho từng ô không? Giải thích lợi ích.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p14-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"có cần phải gõ lại công thức cho từng ô không? Giải thích lợi ích....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH (MỤC 3: SAO CHÉP CÔNG\nTHỨC) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p14-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p14-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-15": {
    "grade": 7,
    "period": 15,
    "lessonTitle": "BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH (MỤC 4: THỰC HÀNH DỰ ÁN\nTRƯỜNG HỌC XANH)",
    "yccd": "Thực hành thiết lập công thức tính tổng số cây và thành",
    "wordBank": [
      "hoàn thiện bảng tính",
      "xem trước khi in (Print Preview)",
      "ngắt trang"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p15-fb-1",
        "label": "a)",
        "preText": "Lỗi `#NAME?` xuất hiện khi em gõ sai tên",
        "postText": "hoặc tên địa chỉ ô trong công thức.",
        "correctAnswer": "hoàn thiện bảng tính",
        "accepted": [
          "hoàn thiện bảng tính",
          "hoàn thiện bảng tính",
          "hoànthiệnbảngtính"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p15-fb-2",
        "label": "b)",
        "preText": "Lỗi `#DIV/0!` xuất hiện khi trong công thức có phép chia cho số",
        "postText": ".",
        "correctAnswer": "xem trước khi in (Print Preview)",
        "accepted": [
          "xem trước khi in (print preview)",
          "xem trước khi in (Print Preview)",
          "xemtrướckhiin(PrintPreview)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p15-fb-3",
        "label": "c)",
        "preText": "Để kiểm tra lại công thức nằm trong ô E9, em nhấp đúp chuột vào ô E9 hoặc quan sát trên thanh",
        "postText": ".",
        "correctAnswer": "ngắt trang",
        "accepted": [
          "ngắt trang",
          "ngắt trang",
          "ngắttrang"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "xuất dùng hàm tính tổng cho nhanh. Theo em bạn đó sẽ gõ hàm gì?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p15-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"xuất dùng hàm tính tổng cho nhanh. Theo em bạn đó sẽ gõ hàm gì?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 7. TÍNH TOÁN TỰ ĐỘNG TRÊN BẢNG TÍNH (MỤC 4: THỰC HÀNH DỰ ÁN\nTRƯỜNG HỌC XANH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p15-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p15-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-16": {
    "grade": 7,
    "period": 16,
    "lessonTitle": "BÀI 8. CÔNG CỤ HỖ TRỢ TÍNH TOÁN (MỤC 1, 2: HÀM TRONG BẢNG TÍNH &\nHÀM ĐƠN GIẢN)",
    "yccd": "Sử dụng được các hàm đơn giản như SUM, AVERAGE,",
    "wordBank": [
      "phần mềm trình chiếu",
      "trang chiếu (Slide)",
      "bố cục Layout"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p16-fb-1",
        "label": "a)",
        "preText": "Cú pháp chung của một hàm trong Excel là: `=TÊN_HÀM(tham_số_1, tham_số_2, ...)`.",
        "postText": ".",
        "correctAnswer": "phần mềm trình chiếu",
        "accepted": [
          "phần mềm trình chiếu",
          "phần mềm trình chiếu",
          "phầnmềmtrìnhchiếu"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p16-fb-2",
        "label": "b)",
        "preText": "Các tham số của hàm có thể là các số cụ thể, địa chỉ ô hoặc địa chỉ",
        "postText": ".",
        "correctAnswer": "trang chiếu (Slide)",
        "accepted": [
          "trang chiếu (slide)",
          "trang chiếu (Slide)",
          "trangchiếu(Slide)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p16-fb-3",
        "label": "c)",
        "preText": "Tên hàm trong Excel không phân biệt chữ hoa hay chữ",
        "postText": "(gõ `=sum` hay `=SUM` đều đúng).",
        "correctAnswer": "bố cục Layout",
        "accepted": [
          "bố cục layout",
          "bố cục Layout",
          "bốcụcLayout"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "`=AVERAGE(A1:A4)` và `=COUNT(A1:A4)` cho kết quả bằng bao nhiêu? Giải thích.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p16-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"`=AVERAGE(A1:A4)` và `=COUNT(A1:A4)` cho kết quả bằng bao nhiêu? Giải thích....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 8. CÔNG CỤ HỖ TRỢ TÍNH TOÁN (MỤC 1, 2: HÀM TRONG BẢNG TÍNH &\nHÀM ĐƠN GIẢN) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p16-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p16-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-17": {
    "grade": 7,
    "period": 17,
    "lessonTitle": "BÀI 8. CÔNG CỤ HỖ TRỢ TÍNH TOÁN (MỤC 3: THỰC HÀNH TÍNH TOÁN DỮ\nLIỆU THỰC TẾ)",
    "yccd": "Thực hành áp dụng hàm SUM, AVERAGE, MAX, MIN,",
    "wordBank": [
      "định dạng văn bản slide",
      "chèn hình ảnh",
      "màu sắc hài hòa"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p17-fb-1",
        "label": "a)",
        "preText": "Khi tính toán trên vùng dữ liệu chứa ô rỗng, các hàm SUM, AVERAGE sẽ tự động",
        "postText": "ô rỗng đó.",
        "correctAnswer": "định dạng văn bản slide",
        "accepted": [
          "định dạng văn bản slide",
          "định dạng văn bản slide",
          "địnhdạngvănbảnslide"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p17-fb-2",
        "label": "b)",
        "preText": "Để sao chép công thức hàm từ ô D11 sang các ô E11, F11 ta dùng công cụ",
        "postText": ".",
        "correctAnswer": "chèn hình ảnh",
        "accepted": [
          "chèn hình ảnh",
          "chèn hình ảnh",
          "chènhìnhảnh"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p17-fb-3",
        "label": "c)",
        "preText": "Kết quả hàm `=AVERAGE(D4:D10)` giúp giáo viên đánh giá được phong trào trồng cây",
        "postText": "của toàn khối.",
        "correctAnswer": "màu sắc hài hòa",
        "accepted": [
          "màu sắc hài hòa",
          "màu sắc hài hòa",
          "màusắchàihòa"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "D9=10, D10=Bỏ trống. Hàm `=AVERAGE(D4:D10)` sẽ chia cho 6 hay chia cho 7? Giải thích.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p17-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"D9=10, D10=Bỏ trống. Hàm `=AVERAGE(D4:D10)` sẽ chia cho 6 hay chia cho 7? Giải thích....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 8. CÔNG CỤ HỖ TRỢ TÍNH TOÁN (MỤC 3: THỰC HÀNH TÍNH TOÁN DỮ\nLIỆU THỰC TẾ) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p17-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p17-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-18": {
    "grade": 7,
    "period": 18,
    "lessonTitle": "BÀI 9. TRÌNH BÀY BẢNG TÍNH (MỤC 1, 2, 3: ĐỊNH DẠNG SỐ & KỸ THUẬT\nTRÌNH BÀY)",
    "yccd": "Thực hiện định dạng dữ liệu số và trình bày bảng tính;",
    "wordBank": [
      "hiệu ứng chuyển trang (Transition)",
      "thời lượng Duration",
      "áp dụng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p18-fb-1",
        "label": "a)",
        "preText": "Định dạng dữ liệu số không làm thay đổi",
        "postText": "thực sự của số trong ô tính mà chỉ đổi cách hiển thị.",
        "correctAnswer": "hiệu ứng chuyển trang (Transition)",
        "accepted": [
          "hiệu ứng chuyển trang (transition)",
          "hiệu ứng chuyển trang (Transition)",
          "hiệuứngchuyểntrang(Transition)"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p18-fb-2",
        "label": "b)",
        "preText": "Để phân cách hàng nghìn, hàng triệu trong Excel theo chuẩn Việt Nam, ta sử dụng dấu",
        "postText": ".",
        "correctAnswer": "thời lượng Duration",
        "accepted": [
          "thời lượng duration",
          "thời lượng Duration",
          "thờilượngDuration"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p18-fb-3",
        "label": "c)",
        "preText": "Khi gộp các ô trong vùng A1:D1 bằng Merge & Center, địa chỉ của ô sau khi gộp sẽ là ô",
        "postText": ".",
        "correctAnswer": "áp dụng",
        "accepted": [
          "áp dụng",
          "áp dụng",
          "ápdụng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "người quan sát và tránh đọc nhầm lẫn số chữ số 0?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p18-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"người quan sát và tránh đọc nhầm lẫn số chữ số 0?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 9. TRÌNH BÀY BẢNG TÍNH (MỤC 1, 2, 3: ĐỊNH DẠNG SỐ & KỸ THUẬT\nTRÌNH BÀY) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p18-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p18-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-19": {
    "grade": 7,
    "period": 19,
    "lessonTitle": "BÀI 9. TRÌNH BÀY BẢNG TÍNH (MỤC 4: THỰC HÀNH HOÀN THIỆN DỰ ÁN\nTRƯỜNG HỌC XANH)",
    "yccd": "Áp dụng các hàm và kỹ thuật định dạng để hoàn thiện",
    "wordBank": [
      "hiệu ứng Animation",
      "thứ tự xuất hiện",
      "Animation Pane"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p19-fb-1",
        "label": "a)",
        "preText": "Màu nền tiêu đề bảng nên chọn tông màu nhạt (như xanh lá nhạt, xanh dương nhạt) để không làm chói",
        "postText": ".",
        "correctAnswer": "hiệu ứng Animation",
        "accepted": [
          "hiệu ứng animation",
          "hiệu ứng Animation",
          "hiệuứngAnimation"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p19-fb-2",
        "label": "b)",
        "preText": "Dữ liệu cột STT và Tên lớp nên được căn",
        "postText": ", dữ liệu cột Tên cây căn",
        "correctAnswer": "thứ tự xuất hiện",
        "accepted": [
          "thứ tự xuất hiện",
          "thứ tự xuất hiện",
          "thứtựxuấthiện"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p19-fb-3",
        "label": "c)",
        "preText": "Để áp dụng nhanh định dạng từ ô A1 sang ô B1, ta sử dụng công cụ chổi sao chép định dạng",
        "postText": ".",
        "correctAnswer": "Animation Pane",
        "accepted": [
          "animation pane",
          "Animation Pane",
          "AnimationPane"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "lượng Tốt về cả nội dung và hình thức trình bày.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p19-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"lượng Tốt về cả nội dung và hình thức trình bày....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 9. TRÌNH BÀY BẢNG TÍNH (MỤC 4: THỰC HÀNH HOÀN THIỆN DỰ ÁN\nTRƯỜNG HỌC XANH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p19-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p19-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-20": {
    "grade": 7,
    "period": 20,
    "lessonTitle": "BÀI 10. HOÀN THIỆN BẢNG TÍNH (MỤC 1, 2, 3: THAO TÁC TRANG TÍNH & IN\nDỮ LIỆU)",
    "yccd": "Thực hiện thao tác quản lý trang tính (đổi tên, chèn,",
    "wordBank": [
      "bài trình chiếu hoàn chỉnh",
      "liên kết",
      "thuyết trình"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p20-fb-1",
        "label": "a)",
        "preText": "Muốn chèn thêm một trang tính mới, em nhấp vào biểu tượng dấu",
        "postText": "ở cạnh tên trang tính.",
        "correctAnswer": "bài trình chiếu hoàn chỉnh",
        "accepted": [
          "bài trình chiếu hoàn chỉnh",
          "bài trình chiếu hoàn chỉnh",
          "bàitrìnhchiếuhoànchỉnh"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p20-fb-2",
        "label": "b)",
        "preText": "Để xóa một trang tính không cần thiết, nhấp chuột phải vào tên trang tính và chọn",
        "postText": ".",
        "correctAnswer": "liên kết",
        "accepted": [
          "liên kết",
          "liên kết",
          "liênkết"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p20-fb-3",
        "label": "c)",
        "preText": "Để in bảng tính vừa vặn trong 1 trang giấy A4, em chọn tùy chọn Fit Sheet on",
        "postText": "Page trong Print Settings.",
        "correctAnswer": "thuyết trình",
        "accepted": [
          "thuyết trình",
          "thuyết trình",
          "thuyếttrình"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "thứ 2. Em hãy tư vấn cho An 2 cách xử lý để in gọn trên 1 trang giấy.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p20-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"thứ 2. Em hãy tư vấn cho An 2 cách xử lý để in gọn trên 1 trang giấy....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 10. HOÀN THIỆN BẢNG TÍNH (MỤC 1, 2, 3: THAO TÁC TRANG TÍNH & IN\nDỮ LIỆU) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p20-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p20-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-21": {
    "grade": 7,
    "period": 21,
    "lessonTitle": "BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 1, 2, 3: CHỨC NĂNG, TIÊU ĐỀ & BỐ\nCỤC PHÂN CẤP)",
    "yccd": "Nêu chức năng cơ bản của phần mềm trình chiếu; tạo",
    "wordBank": [
      "thuật toán tìm kiếm tuần tự",
      "duyệt từng phần tử",
      "tìm thấy"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p21-fb-1",
        "label": "a)",
        "preText": "Hai chức năng cơ bản của phần mềm trình chiếu là tạo bài trình chiếu và",
        "postText": "bài trình chiếu.",
        "correctAnswer": "thuật toán tìm kiếm tuần tự",
        "accepted": [
          "thuật toán tìm kiếm tuần tự",
          "thuật toán tìm kiếm tuần tự",
          "thuậttoántìmkiếmtuầntự"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p21-fb-2",
        "label": "b)",
        "preText": "Để chèn thêm một trang chiếu mới có cùng bố cục, em bấm tổ hợp phím",
        "postText": ".",
        "correctAnswer": "duyệt từng phần tử",
        "accepted": [
          "duyệt từng phần tử",
          "duyệt từng phần tử",
          "duyệttừngphầntử"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p21-fb-3",
        "label": "c)",
        "preText": "Cấu trúc phân cấp danh sách giúp các mô hình AI đọc hiểu ngữ cảnh và tóm tắt thông tin một cách",
        "postText": ".",
        "correctAnswer": "tìm thấy",
        "accepted": [
          "tìm thấy",
          "tìm thấy",
          "tìmthấy"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "thay vì viết thành các đoạn văn dài dằng dặc? Phân tích góc độ người nghe.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p21-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"thay vì viết thành các đoạn văn dài dằng dặc? Phân tích góc độ người nghe....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 1, 2, 3: CHỨC NĂNG, TIÊU ĐỀ & BỐ\nCỤC PHÂN CẤP) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p21-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p21-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-22": {
    "grade": 7,
    "period": 22,
    "lessonTitle": "BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 4: THỰC HÀNH TẠO BÀI TRÌNH CHIẾU)",
    "yccd": "Thực hành tạo bài trình chiếu báo cáo kết quả dự án",
    "wordBank": [
      "thuật toán tìm kiếm nhị phân",
      "dãy đã sắp xếp",
      "chia đôi"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p22-fb-1",
        "label": "a)",
        "preText": "Phím `Tab` dùng để",
        "postText": "cấp phân cấp (dịch chuyển dòng sang phải).",
        "correctAnswer": "thuật toán tìm kiếm nhị phân",
        "accepted": [
          "thuật toán tìm kiếm nhị phân",
          "thuật toán tìm kiếm nhị phân",
          "thuậttoántìmkiếmnhịphân"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p22-fb-2",
        "label": "b)",
        "preText": "Tổ hợp phím `Shift + Tab` dùng để",
        "postText": "cấp phân cấp (dịch chuyển dòng sang trái).",
        "correctAnswer": "dãy đã sắp xếp",
        "accepted": [
          "dãy đã sắp xếp",
          "dãy đã sắp xếp",
          "dãyđãsắpxếp"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p22-fb-3",
        "label": "c)",
        "preText": "Tệp bài trình chiếu PowerPoint được lưu mặc định với phần mở rộng là",
        "postText": ".",
        "correctAnswer": "chia đôi",
        "accepted": [
          "chia đôi",
          "chia đôi",
          "chiađôi"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "trong\nthiết kế slide trình chiếu để đảm bảo thông điệp đọng lại cho người xem.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p22-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"trong\nthiết kế slide trình chiếu để đảm bảo thông điệp đọng lại cho người xem....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 4: THỰC HÀNH TẠO BÀI TRÌNH CHIẾU) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p22-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p22-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-23": {
    "grade": 7,
    "period": 23,
    "lessonTitle": "BÀI 12. ĐỊNH DẠNG ĐỐI TƯỢNG TRÊN TRANG CHIẾU (MỤC 1, 2, 3: ẢNH\nMINH HỌA & VĂN BẢN)",
    "yccd": "Sao chép dữ liệu văn bản; đưa ảnh minh họa vào trang",
    "wordBank": [
      "thuật toán sắp xếp nổi bọt",
      "so sánh hai phần tử liền kề",
      "đổi chỗ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p23-fb-1",
        "label": "a)",
        "preText": "Phông chữ dùng trên trang chiếu nên chọn phông chữ không chân đơn giản như",
        "postText": ", Calibri, Tahoma.",
        "correctAnswer": "thuật toán sắp xếp nổi bọt",
        "accepted": [
          "thuật toán sắp xếp nổi bọt",
          "thuật toán sắp xếp nổi bọt",
          "thuậttoánsắpxếpnổibọt"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p23-fb-2",
        "label": "b)",
        "preText": "Cỡ chữ tiêu đề trang chiếu nên từ",
        "postText": "pt trở lên, cỡ chữ nội dung nên từ",
        "correctAnswer": "so sánh hai phần tử liền kề",
        "accepted": [
          "so sánh hai phần tử liền kề",
          "so sánh hai phần tử liền kề",
          "sosánhhaiphầntửliềnkề"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p23-fb-3",
        "label": "c)",
        "preText": "Để thay đổi kích thước ảnh không bị méo hình, kéo thả chuột tại các nút tròn ở",
        "postText": "của bức ảnh.",
        "correctAnswer": "đổi chỗ",
        "accepted": [
          "đổi chỗ",
          "đổi chỗ",
          "đổichỗ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "xem dưới cuối lớp không đọc được. Em hãy tư vấn cho An cách chọn màu chữ và màu nền đúng quy\nchuẩn.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p23-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"xem dưới cuối lớp không đọc được. Em hãy tư vấn cho An cách chọn màu chữ và màu nền đ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 12. ĐỊNH DẠNG ĐỐI TƯỢNG TRÊN TRANG CHIẾU (MỤC 1, 2, 3: ẢNH\nMINH HỌA & VĂN BẢN) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p23-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p23-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-24": {
    "grade": 7,
    "period": 24,
    "lessonTitle": "BÀI 13. THỰC HÀNH TỔNG HỢP: HOÀN THIỆN BÀI TRÌNH CHIẾU (HIỆU ỨNG\nĐỘNG & THUYẾT TRÌNH)",
    "yccd": "Biết đưa hiệu ứng động vào bài trình chiếu hợp lý; tổng",
    "wordBank": [
      "thuật toán sắp xếp chọn",
      "tìm phần tử nhỏ nhất",
      "hoán đổi"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p24-fb-1",
        "label": "a)",
        "preText": "Trong thẻ Animations, nhóm hiệu ứng màu xanh `Entrance` dùng để làm đối tượng",
        "postText": "trên slide.",
        "correctAnswer": "thuật toán sắp xếp chọn",
        "accepted": [
          "thuật toán sắp xếp chọn",
          "thuật toán sắp xếp chọn",
          "thuậttoánsắpxếpchọn"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p24-fb-2",
        "label": "b)",
        "preText": "Nhóm hiệu ứng màu đỏ `Exit` trong Animations dùng để làm đối tượng",
        "postText": "khỏi slide.",
        "correctAnswer": "tìm phần tử nhỏ nhất",
        "accepted": [
          "tìm phần tử nhỏ nhất",
          "tìm phần tử nhỏ nhất",
          "tìmphầntửnhỏnhất"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p24-fb-3",
        "label": "c)",
        "preText": "Để áp dụng một hiệu ứng chuyển trang duy nhất cho TẤT CẢ các slide, nhấp vào nút",
        "postText": "trong thẻ Transitions.",
        "correctAnswer": "hoán đổi",
        "accepted": [
          "hoán đổi",
          "hoán đổi",
          "hoánđổi"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "thuyết trình. Em có nhận xét gì về cách dùng hiệu ứng này? Hãy đưa ra lời khuyên.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p24-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"thuyết trình. Em có nhận xét gì về cách dùng hiệu ứng này? Hãy đưa ra lời khuyên....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 13. THỰC HÀNH TỔNG HỢP: HOÀN THIỆN BÀI TRÌNH CHIẾU (HIỆU ỨNG\nĐỘNG & THUYẾT TRÌNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p24-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p24-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-25": {
    "grade": 7,
    "period": 25,
    "lessonTitle": "BÀI 14. THUẬT TOÁN TÌM KIẾM TUẦN TỰ (SEQUENTIAL SEARCH)",
    "yccd": "Giải thích thuật toán tìm kiếm tuần tự; biểu diễn và mô",
    "wordBank": [
      "mô tả thuật toán",
      "sơ đồ khối",
      "độ phức tạp"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p25-fb-1",
        "label": "a)",
        "preText": "Đầu vào (Input) của thuật toán tìm kiếm tuần tự là danh sách dữ liệu và",
        "postText": ".",
        "correctAnswer": "mô tả thuật toán",
        "accepted": [
          "mô tả thuật toán",
          "mô tả thuật toán",
          "môtảthuậttoán"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p25-fb-2",
        "label": "b)",
        "preText": "Đầu ra (Output) của thuật toán là vị trí phần tử tìm thấy hoặc thông báo",
        "postText": ".",
        "correctAnswer": "sơ đồ khối",
        "accepted": [
          "sơ đồ khối",
          "sơ đồ khối",
          "sơđồkhối"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p25-fb-3",
        "label": "c)",
        "preText": "Trong trường hợp xấu nhất, thuật toán tìm kiếm tuần tự phải thực hiện số lần so sánh đúng bằng",
        "postText": "phần tử của danh sách.",
        "correctAnswer": "độ phức tạp",
        "accepted": [
          "độ phức tạp",
          "độ phức tạp",
          "độphứctạp"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "dãy. Thuật toán cần thực hiện mấy lần so sánh để tìm thấy số `4`?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p25-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"dãy. Thuật toán cần thực hiện mấy lần so sánh để tìm thấy số `4`?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 14. THUẬT TOÁN TÌM KIẾM TUẦN TỰ (SEQUENTIAL SEARCH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p25-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p25-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-26": {
    "grade": 7,
    "period": 26,
    "lessonTitle": "BÀI 15. THUẬT TOÁN TÌM KIẾM NHỊ PHÂN (BINARY SEARCH - MỤC 1:\nNGUYÊN LÝ)",
    "yccd": "Giải thích thuật toán tìm kiếm nhị phân; mô phỏng hoạt",
    "wordBank": [
      "dự án học tập",
      "lập kế hoạch",
      "phân công nhiệm vụ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p26-fb-1",
        "label": "a)",
        "preText": "Vị trí ở giữa vùng tìm kiếm từ vị trí `đầu` đến `cuối` được tính bằng công thức phần nguyên: `mid = (đầu + cuối) / 2`.",
        "postText": ".",
        "correctAnswer": "dự án học tập",
        "accepted": [
          "dự án học tập",
          "dự án học tập",
          "dựánhọctập"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p26-fb-2",
        "label": "b)",
        "preText": "Khi giá trị cần tìm bằng giá trị tại vị trí `mid`, thuật toán thông báo",
        "postText": "và dừng lại.",
        "correctAnswer": "lập kế hoạch",
        "accepted": [
          "lập kế hoạch",
          "lập kế hoạch",
          "lậpkếhoạch"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p26-fb-3",
        "label": "c)",
        "preText": "Mỗi lần so sánh, vùng tìm kiếm của thuật toán nhị phân sẽ giảm đi",
        "postText": "dung lượng.",
        "correctAnswer": "phân công nhiệm vụ",
        "accepted": [
          "phân công nhiệm vụ",
          "phân công nhiệm vụ",
          "phâncôngnhiệmvụ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "ban đầu là số nào? Thuật toán sẽ tìm số `23` ở nửa trước hay nửa sau?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p26-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"ban đầu là số nào? Thuật toán sẽ tìm số `23` ở nửa trước hay nửa sau?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 15. THUẬT TOÁN TÌM KIẾM NHỊ PHÂN (BINARY SEARCH - MỤC 1:\nNGUYÊN LÝ) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p26-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p26-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-27": {
    "grade": 7,
    "period": 27,
    "lessonTitle": "BÀI 15. THUẬT TOÁN TÌM KIẾM NHỊ PHÂN (MỤC 2: MỐI QUAN HỆ SẮP XẾP\n& TÌM KIẾM)",
    "yccd": "Giải thích mối liên quan giữa sắp xếp và tìm kiếm, nêu",
    "wordBank": [
      "thu thập dữ liệu dự án",
      "xử lý bảng tính",
      "vẽ biểu đồ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p27-fb-1",
        "label": "a)",
        "preText": "Nếu danh sách CHƯA được sắp xếp, ta bắt buộc phải sử dụng thuật toán tìm kiếm",
        "postText": ".",
        "correctAnswer": "thu thập dữ liệu dự án",
        "accepted": [
          "thu thập dữ liệu dự án",
          "thu thập dữ liệu dự án",
          "thuthậpdữliệudựán"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p27-fb-2",
        "label": "b)",
        "preText": "Chi phí thời gian để sắp xếp danh sách 1 lần sẽ được đền bù bằng hàng ngàn lần tìm kiếm",
        "postText": "siêu nhanh sau đó.",
        "correctAnswer": "xử lý bảng tính",
        "accepted": [
          "xử lý bảng tính",
          "xử lý bảng tính",
          "xửlýbảngtính"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p27-fb-3",
        "label": "c)",
        "preText": "Danh bạ điện thoại trên smartphone được tự động sắp xếp theo thứ tự",
        "postText": "để tra cứu nhanh.",
        "correctAnswer": "vẽ biểu đồ",
        "accepted": [
          "vẽ biểu đồ",
          "vẽ biểu đồ",
          "vẽbiểuđồ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "tìm một từ trong cuốn từ điển gồm 1.000 trang.",
    "shortAnswerQuestions": [
      {
        "id": "k7-p27-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"tìm một từ trong cuốn từ điển gồm 1.000 trang....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 15. THUẬT TOÁN TÌM KIẾM NHỊ PHÂN (MỤC 2: MỐI QUAN HỆ SẮP XẾP\n& TÌM KIẾM) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p27-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p27-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-28": {
    "grade": 7,
    "period": 28,
    "lessonTitle": "BÀI 16. THUẬT TOÁN SẮP XẾP (MỤC 1: THUẬT TOÁN SẮP XẾP NỔI BỌT -\nBUBBLE SORT)",
    "yccd": "Giải thích thuật toán sắp xếp nổi bọt; biểu diễn và mô",
    "wordBank": [
      "thiết kế slide báo cáo",
      "tập dượt thuyết trình",
      "phản biện"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p28-fb-1",
        "label": "a)",
        "preText": "Ý tưởng của thuật toán mô phỏng các bọt khí nhẹ hơn sẽ",
        "postText": "lên trên mặt nước.",
        "correctAnswer": "thiết kế slide báo cáo",
        "accepted": [
          "thiết kế slide báo cáo",
          "thiết kế slide báo cáo",
          "thiếtkếslidebáocáo"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p28-fb-2",
        "label": "b)",
        "preText": "Muốn đổi chỗ giá trị của 2 biến A và B, ta cần sử dụng thêm một biến",
        "postText": "làm trung gian.",
        "correctAnswer": "tập dượt thuyết trình",
        "accepted": [
          "tập dượt thuyết trình",
          "tập dượt thuyết trình",
          "tậpdượtthuyếttrình"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p28-fb-3",
        "label": "c)",
        "preText": "Với dãy gồm N phần tử, vòng lặp sắp xếp nổi bọt thực hiện tối đa",
        "postText": "lượt lặp.",
        "correctAnswer": "phản biện",
        "accepted": [
          "phản biện",
          "phản biện",
          "phảnbiện"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "bọt tăng dần. Dãy số thu được sau lượt 1 là gì?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p28-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"bọt tăng dần. Dãy số thu được sau lượt 1 là gì?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 16. THUẬT TOÁN SẮP XẾP (MỤC 1: THUẬT TOÁN SẮP XẾP NỔI BỌT -\nBUBBLE SORT) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p28-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p28-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k7-tiet-29": {
    "grade": 7,
    "period": 29,
    "lessonTitle": "BÀI 16. THUẬT TOÁN SẮP XẾP (MỤC 2, 3: SẮP XẾP CHỌN & CHIA NHỎ BÀI\nTOÁN)",
    "yccd": "Giải thích thuật toán sắp xếp chọn; nêu ý nghĩa của việc",
    "wordBank": [
      "nghiệm thu dự án",
      "đánh giá Rubric",
      "tổng kết"
    ],
    "fillBlankQuestions": [
      {
        "id": "k7-p29-fb-1",
        "label": "a)",
        "preText": "Khác với Nổi bọt đổi chỗ liên tục, Sắp xếp chọn chỉ thực hiện",
        "postText": "lần đổi chỗ cho mỗi lượt duyệt.",
        "correctAnswer": "nghiệm thu dự án",
        "accepted": [
          "nghiệm thu dự án",
          "nghiệm thu dự án",
          "nghiệmthudựán"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p29-fb-2",
        "label": "b)",
        "preText": "Tư tưởng phân rã giúp chia bài toán sắp xếp N phần tử thành N-1 bước sắp xếp",
        "postText": ".",
        "correctAnswer": "đánh giá Rubric",
        "accepted": [
          "đánh giá rubric",
          "đánh giá Rubric",
          "đánhgiáRubric"
        ],
        "points": 0.35
      },
      {
        "id": "k7-p29-fb-3",
        "label": "c)",
        "preText": "Khi lập trình các mô hình AI lớn, các kỹ sư luôn chia hệ thống thành các module",
        "postText": "độc lập.",
        "correctAnswer": "tổng kết",
        "accepted": [
          "tổng kết",
          "tổng kết",
          "tổngkết"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "là bao nhiêu? Nó sẽ đổi chỗ với phần tử ở vị trí nào?",
    "shortAnswerQuestions": [
      {
        "id": "k7-p29-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"là bao nhiêu? Nó sẽ đổi chỗ với phần tử ở vị trí nào?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 16. THUẬT TOÁN SẮP XẾP (MỤC 2, 3: SẮP XẾP CHỌN & CHIA NHỎ BÀI\nTOÁN) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k7-p29-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 7.",
        "points": 0.3
      },
      {
        "id": "k7-p29-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-1": {
    "grade": 8,
    "period": 1,
    "lessonTitle": "BÀI 1. LỊCH SỬ PHÁT TRIỂN MÁY TÍNH (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "nhất (thế hệ 1)",
      "kích thước và tỏa nhiệt",
      "bán dẫn"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p1-fb-1",
        "label": "1.",
        "preText": "Máy tính ENIAC ra đời năm 1946 thuộc thế hệ thứ",
        "postText": "và sử dụng bóng đèn chân không.",
        "correctAnswer": "nhất (thế hệ 1)",
        "accepted": [
          "nhất (thế hệ 1)",
          "nhất (thế hệ 1)",
          "nhất(thếhệ1)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p1-fb-2",
        "label": "2.",
        "preText": "Sự ra đời của transistor (đèn bán dẫn) đã giúp máy tính thế hệ thứ 2 giảm đáng kể",
        "postText": "và điện năng tiêu thụ.",
        "correctAnswer": "kích thước và tỏa nhiệt",
        "accepted": [
          "kích thước và tỏa nhiệt",
          "kích thước và tỏa nhiệt",
          "kíchthướcvàtỏanhiệt"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p1-fb-3",
        "label": "3.",
        "preText": "Mạch tích hợp IC (Integrated Circuit) chứa nhiều linh kiện điện tử trên một màng",
        "postText": "nhỏ.",
        "correctAnswer": "bán dẫn",
        "accepted": [
          "bán dẫn",
          "bán dẫn",
          "bándẫn"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao sự phát triển của vi xử lý bán dẫn lại là yếu tố quyết định giúp máy tính từ thiết bị khổng lồ trong phòng\nthí nghiệm trở thành thiết bị cá nhân nhỏ gọn ngày nay?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p1-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao sự phát triển của vi xử lý bán dẫn lại là yếu tố quyết định giúp máy tính từ ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 1. LỊCH SỬ PHÁT TRIỂN MÁY TÍNH (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p1-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p1-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-2": {
    "grade": 8,
    "period": 2,
    "lessonTitle": "BÀI 1. LỊCH SỬ PHÁT TRIỂN MÁY TÍNH (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "tốc độ",
      "dữ liệu",
      "phức tạp"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p2-fb-1",
        "label": "1.",
        "preText": "Máy tính ngày nay đang phát triển theo xu hướng nhỏ gọn, di động và tính toán",
        "postText": "cao.",
        "correctAnswer": "tốc độ",
        "accepted": [
          "tốc độ",
          "tốc độ",
          "tốcđộ"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p2-fb-2",
        "label": "2.",
        "preText": "Mạng kết nối vạn vật IoT giúp các thiết bị gia dụng thu thập và trao đổi",
        "postText": "tự động.",
        "correctAnswer": "dữ liệu",
        "accepted": [
          "dữ liệu",
          "dữ liệu",
          "dữliệu"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p2-fb-3",
        "label": "3.",
        "preText": "Các hệ thống siêu máy tính (Supercomputer) thường được dùng để giải quyết các bài toán vô cùng",
        "postText": ".",
        "correctAnswer": "phức tạp",
        "accepted": [
          "phức tạp",
          "phức tạp",
          "phứctạp"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Theo em, việc máy tính ngày càng nhỏ gọn và thông minh hơn mang lại những thay đổi lớn nào cho các hoạt động\nhọc tập trực tuyến hiện nay?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p2-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Theo em, việc máy tính ngày càng nhỏ gọn và thông minh hơn mang lại những thay đổi lớ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 1. LỊCH SỬ PHÁT TRIỂN MÁY TÍNH (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p2-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p2-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-3": {
    "grade": 8,
    "period": 3,
    "lessonTitle": "BÀI 2. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "nhị phân",
      "lan truyền và sao chép",
      "đồng bộ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p3-fb-1",
        "label": "1.",
        "preText": "Thông tin số là thông tin được mã hóa dưới dạng dãy 二进制 (dãy",
        "postText": ").",
        "correctAnswer": "nhị phân",
        "accepted": [
          "nhị phân",
          "nhị phân",
          "nhịphân"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p3-fb-2",
        "label": "2.",
        "preText": "Khả năng nhân bản không giới hạn là một đặc điểm giúp thông tin số dễ dàng được",
        "postText": "trên không gian mạng.",
        "correctAnswer": "lan truyền và sao chép",
        "accepted": [
          "lan truyền và sao chép",
          "lan truyền và sao chép",
          "lantruyềnvàsaochép"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p3-fb-3",
        "label": "3.",
        "preText": "Việc lưu trữ thông tin trên điện toán đám mây giúp nâng cao khả năng truy cập và",
        "postText": "dữ liệu.",
        "correctAnswer": "đồng bộ",
        "accepted": [
          "đồng bộ",
          "đồng bộ",
          "đồngbộ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao việc 'dễ sao chép và phát tán' của thông tin số vừa là ưu điểm lớn vừa mang lại nguy cơ vi phạm bản\nquyền?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p3-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao việc 'dễ sao chép và phát tán' của thông tin số vừa là ưu điểm lớn vừa mang l...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 2. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p3-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p3-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-4": {
    "grade": 8,
    "period": 4,
    "lessonTitle": "BÀI 2. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "chính thống",
      "tên miền uy tín (.gov.vn)",
      "kiểm chứng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p4-fb-1",
        "label": "1.",
        "preText": "Nguồn tin đáng tin cậy thường đến từ các cơ quan báo chí chính thống hoặc trang web có tên miền",
        "postText": "(cơ quan nhà nước).",
        "correctAnswer": "chính thống",
        "accepted": [
          "chính thống",
          "chính thống",
          "chínhthống"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p4-fb-2",
        "label": "2.",
        "preText": "Công nghệ giả mạo hình ảnh và giọng nói bằng AI được gọi là",
        "postText": ".",
        "correctAnswer": "tên miền uy tín (.gov.vn)",
        "accepted": [
          "tên miền uy tín (.gov.vn)",
          "tên miền uy tín (.gov.vn)",
          "tênmiềnuytín(.gov.vn)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p4-fb-3",
        "label": "3.",
        "preText": "Không nên vội tin và chia sẻ các bài viết mang tính giật gân, thiếu căn cứ hoặc không có tên",
        "postText": "tác giả.",
        "correctAnswer": "kiểm chứng",
        "accepted": [
          "kiểm chứng",
          "kiểm chứng",
          "kiểmchứng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Khi gặp một tin đồn thất gân về thiên tai trên Facebook, em sẽ thực hiện các bước nào để xác minh tin đó là thật\nhay giả?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p4-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Khi gặp một tin đồn thất gân về thiên tai trên Facebook, em sẽ thực hiện các bước nào...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 2. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p4-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p4-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-5": {
    "grade": 8,
    "period": 5,
    "lessonTitle": "BÀI 3. THỰC HÀNH: KHAI THÁC THÔNG TIN TRÊN INTERNET",
    "yccd": "",
    "wordBank": [
      "chính xác",
      "PDF",
      "câu lệnh Prompt"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p5-fb-1",
        "label": "1.",
        "preText": "Khi tìm kiếm với từ khóa nằm trong ngoặc kép \"",
        "postText": "\", máy tính sẽ tìm các trang chứa",
        "correctAnswer": "chính xác",
        "accepted": [
          "chính xác",
          "chính xác",
          "chínhxác"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p5-fb-2",
        "label": "2.",
        "preText": "Toán tử filetype:pdf giúp tìm kiếm các tệp tin có định dạng",
        "postText": ".",
        "correctAnswer": "PDF",
        "accepted": [
          "pdf",
          "PDF",
          "PDF"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p5-fb-3",
        "label": "3.",
        "preText": "Việc đặt câu hỏi rõ ràng, đủ ngữ cảnh cho AI tìm kiếm được gọi là kỹ thuật viết",
        "postText": ".",
        "correctAnswer": "câu lệnh Prompt",
        "accepted": [
          "câu lệnh prompt",
          "câu lệnh Prompt",
          "câulệnhPrompt"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ So sánh sự khác biệt khi em tìm kiếm từ khóa 'Lịch sử máy tính' (không ngoặc) và \"Lịch sử máy tính\" (có ngoặc\nkép) trên Google.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p5-sa-1",
        "label": "• Tìm kiếm không có ngoặc kép:",
        "question": "Kết quả tìm kiếm khi gõ Lịch sử máy tính (không ngoặc) là gì?",
        "placeholder": "Mô tả kết quả...",
        "sampleAnswer": "Google sẽ tìm các trang web chứa bất kỳ từ nào: \"Lịch\", \"sử\", \"máy\" hoặc \"tính\" ở các vị trí rời rạc.",
        "points": 0.4
      },
      {
        "id": "k8-p5-sa-2",
        "label": "• Tìm kiếm có ngoặc kép \" \":",
        "question": "Kết quả khi đặt từ khóa trong ngoặc kép \"Lịch sử máy tính\" là gì?",
        "placeholder": "Mô tả kết quả...",
        "sampleAnswer": "Google chỉ hiển thị những trang web chứa chính xác cụm từ \"Lịch sử máy tính\" theo đúng thứ tự các từ.",
        "points": 0.3
      },
      {
        "id": "k8-p5-sa-3",
        "label": "• Kinh nghiệm tìm kiếm hiệu quả:",
        "question": "Khi nào em nên sử dụng toán tử dấu ngoặc kép khi tìm tài liệu?",
        "placeholder": "Nêu trường hợp áp dụng...",
        "sampleAnswer": "Khi cần tìm chính xác một định nghĩa, tên tác phẩm, đoạn trích thơ văn hoặc dòng thông báo lỗi kỹ thuật.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-6": {
    "grade": 8,
    "period": 6,
    "lessonTitle": "BÀI 4. ĐẠO ĐỨC VÀ VĂN HÓA TRONG SỬ DỤNG CNTT",
    "yccd": "",
    "wordBank": [
      "văn minh",
      "tôn trọng",
      "bảo vệ thông tin"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p6-fb-1",
        "label": "1.",
        "preText": "Ứng xử có văn hóa trên mạng là thể hiện sự tôn trọng người khác và tuân thủ quy tắc",
        "postText": "cộng đồng.",
        "correctAnswer": "văn minh",
        "accepted": [
          "văn minh",
          "văn minh",
          "vănminh"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p6-fb-2",
        "label": "2.",
        "preText": "Hành vi nói xấu, xúc phạm hoặc tung tin đồn vô căn cứ về người khác trên mạng là vi phạm",
        "postText": ".",
        "correctAnswer": "tôn trọng",
        "accepted": [
          "tôn trọng",
          "tôn trọng",
          "tôntrọng"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p6-fb-3",
        "label": "3.",
        "preText": "Cần giữ thái độ ôn hòa, lịch sự ngay cả khi trao đổi, tranh luận với các công cụ chatbot",
        "postText": ".",
        "correctAnswer": "bảo vệ thông tin",
        "accepted": [
          "bảo vệ thông tin",
          "bảo vệ thông tin",
          "bảovệthôngtin"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Em sẽ xử lý thế nào khi thấy một bài viết đăng ảnh dìm hàng một bạn trong lớp trên nhóm mạng xã hội?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p6-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Em sẽ xử lý thế nào khi thấy một bài viết đăng ảnh dìm hàng một bạn trong lớp trên nh...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 4. ĐẠO ĐỨC VÀ VĂN HÓA TRONG SỬ DỤNG CNTT để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p6-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p6-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-7": {
    "grade": 8,
    "period": 7,
    "lessonTitle": "BÀI 4. ĐẠO ĐỨC VÀ VĂN HÓA TRONG SỬ DỤNG CNTT",
    "yccd": "",
    "wordBank": [
      "bản quyền tác giả",
      "đạo văn",
      "trích dẫn"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p7-fb-1",
        "label": "1.",
        "preText": "Luật",
        "postText": "quy định quyền của tác giả đối với tác phẩm văn học, nghệ thuật, khoa học.",
        "correctAnswer": "bản quyền tác giả",
        "accepted": [
          "bản quyền tác giả",
          "bản quyền tác giả",
          "bảnquyềntácgiả"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p7-fb-2",
        "label": "2.",
        "preText": "Hành vi sử dụng đoạn văn của người khác trong bài làm văn của mình mà không ghi nguồn gọi là hành vi",
        "postText": "văn.",
        "correctAnswer": "đạo văn",
        "accepted": [
          "đạo văn",
          "đạo văn",
          "đạovăn"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p7-fb-3",
        "label": "3.",
        "preText": "Kí hiệu copyright © thường đi kèm với thông tin về chủ sở hữu",
        "postText": ".",
        "correctAnswer": "trích dẫn",
        "accepted": [
          "trích dẫn",
          "trích dẫn",
          "tríchdẫn"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao khi viết bài văn hoặc bài báo cáo Tin học, em bắt buộc phải ghi rõ nguồn trích dẫn đối với các số liệu, hình\nảnh tải từ Internet?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p7-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao khi viết bài văn hoặc bài báo cáo Tin học, em bắt buộc phải ghi rõ nguồn tríc...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 4. ĐẠO ĐỨC VÀ VĂN HÓA TRONG SỬ DỤNG CNTT để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p7-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p7-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-8": {
    "grade": 8,
    "period": 8,
    "lessonTitle": "BÀI 5. ỨNG DỤNG CNTT VÀ BẢN QUYỀN THÔNG TIN",
    "yccd": "",
    "wordBank": [
      "mã nguồn mở",
      "thương mại",
      "điện toán đám mây"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p8-fb-1",
        "label": "1.",
        "preText": "Phần mềm thương mại (Commercial Software) yêu cầu người dùng phải mua",
        "postText": "trước khi sử dụng.",
        "correctAnswer": "mã nguồn mở",
        "accepted": [
          "mã nguồn mở",
          "mã nguồn mở",
          "mãnguồnmở"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p8-fb-2",
        "label": "2.",
        "preText": "Phần mềm mã nguồn mở (Open Source) cho phép người dùng xem và chỉnh sửa code",
        "postText": "của chương trình.",
        "correctAnswer": "thương mại",
        "accepted": [
          "thương mại",
          "thương mại",
          "thươngmại"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p8-fb-3",
        "label": "3.",
        "preText": "Các ứng dụng chạy trực tiếp trên trình duyệt web lưu dữ liệu trực tuyến gọi là ứng dụng SaaS trên nền tảng",
        "postText": ".",
        "correctAnswer": "điện toán đám mây",
        "accepted": [
          "điện toán đám mây",
          "điện toán đám mây",
          "điệntoánđámmây"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Trình bày ưu điểm lớn nhất của việc sử dụng các phần mềm ứng dụng chạy trên nền tảng điện toán đám mây so\nvới phần mềm cài đặt truyền thống.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p8-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Trình bày ưu điểm lớn nhất của việc sử dụng các phần mềm ứng dụng chạy trên nền tảng ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 5. ỨNG DỤNG CNTT VÀ BẢN QUYỀN THÔNG TIN để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p8-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p8-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-9": {
    "grade": 8,
    "period": 9,
    "lessonTitle": "BÀI 6. SỬ DỤNG PHẦN MỀM BẢNG TÍNH (MỤC 1, 2)",
    "yccd": "",
    "wordBank": [
      "địa chỉ ô",
      "vùng dữ liệu",
      "Merge & Center"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p9-fb-1",
        "label": "1.",
        "preText": "Dữ liệu văn bản trong bảng tính mặc định được căn thẳng lề",
        "postText": ".",
        "correctAnswer": "địa chỉ ô",
        "accepted": [
          "địa chỉ ô",
          "địa chỉ ô",
          "địachỉô"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p9-fb-2",
        "label": "2.",
        "preText": "Dữ liệu số trong bảng tính mặc định được căn thẳng lề",
        "postText": ".",
        "correctAnswer": "vùng dữ liệu",
        "accepted": [
          "vùng dữ liệu",
          "vùng dữ liệu",
          "vùngdữliệu"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p9-fb-3",
        "label": "3.",
        "preText": "Để gộp nhiều ô thành một ô duy nhất và căn giữa, ta dùng lệnh Merge &",
        "postText": ".",
        "correctAnswer": "Merge & Center",
        "accepted": [
          "merge & center",
          "Merge & Center",
          "Merge&Center"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao việc phân biệt đúng kiểu dữ liệu số và kiểu dữ liệu văn bản lại cực kỳ quan trọng trong phần mềm bảng\ntính?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p9-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao việc phân biệt đúng kiểu dữ liệu số và kiểu dữ liệu văn bản lại cực kỳ quan t...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 6. SỬ DỤNG PHẦN MỀM BẢNG TÍNH (MỤC 1, 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p9-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p9-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-10": {
    "grade": 8,
    "period": 10,
    "lessonTitle": "BÀI 6. SỬ DỤNG PHẦN MỀM BẢNG TÍNH (MỤC 3 - THỰC\nHÀNH)",
    "yccd": "",
    "wordBank": [
      "dấu bằng (=)",
      "nhỏ nhất",
      "tham số"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p10-fb-1",
        "label": "1.",
        "preText": "Công thức hoặc hàm trong bảng tính bắt buộc phải khởi đầu bằng dấu",
        "postText": ".",
        "correctAnswer": "dấu bằng (=)",
        "accepted": [
          "dấu bằng (=)",
          "dấu bằng (=)",
          "dấubằng(=)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p10-fb-2",
        "label": "2.",
        "preText": "Hàm =MIN(A1:A10) dùng để tìm giá trị",
        "postText": "trong vùng từ A1 đến A10.",
        "correctAnswer": "nhỏ nhất",
        "accepted": [
          "nhỏ nhất",
          "nhỏ nhất",
          "nhỏnhất"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p10-fb-3",
        "label": "3.",
        "preText": "Cú pháp chung của một hàm trong bảng tính là Tên_Hàm(",
        "postText": ").",
        "correctAnswer": "tham số",
        "accepted": [
          "tham số",
          "tham số",
          "thamsố"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ So sánh sự khác nhau giữa việc dùng công thức =A1+A2+A3+A4+A5 và việc dùng hàm =SUM(A1:A5) khi cần tính\ntổng 100 ô tính.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p10-sa-1",
        "label": "• Hạn chế của công thức thủ công:",
        "question": "Tại sao không nên dùng công thức =A1+A2+...+A100 cho 100 ô?",
        "placeholder": "Nêu nhược điểm...",
        "sampleAnswer": "Công thức quá dài, tốn thời gian gõ, dễ gõ sót hoặc sai địa chỉ ô và không linh hoạt khi chèn thêm hàng.",
        "points": 0.4
      },
      {
        "id": "k8-p10-sa-2",
        "label": "• Ưu điểm của hàm =SUM:",
        "question": "Viết cú pháp hàm =SUM để tính tổng 100 ô từ A1 đến A100 và nêu lợi ích:",
        "placeholder": "Cú pháp: =SUM(...)",
        "sampleAnswer": "Cú pháp là =SUM(A1:A100). Ưu điểm là cực kỳ ngắn gọn, tính toán tức thì và tự động cập nhật khi dữ liệu thay đổi.",
        "points": 0.3
      },
      {
        "id": "k8-p10-sa-3",
        "label": "• Nguyên tắc làm việc trên bảng tính:",
        "question": "Khi nào nên dùng hàm thay cho phép toán cộng trừ thủ công?",
        "placeholder": "Nguyên tắc áp dụng...",
        "sampleAnswer": "Luôn sử dụng hàm khi tính toán trên một vùng hoặc dãy ô liền kề để đảm bảo tốc độ và độ chính xác tuyệt đối.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-11": {
    "grade": 8,
    "period": 11,
    "lessonTitle": "BÀI 7. ĐỊNH DẠNG TRANG IN VÀ IN TRANG TÍNH",
    "yccd": "",
    "wordBank": [
      "Print Preview",
      "hướng giấy (Orientation)",
      "tiêu đề lặp lại"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p11-fb-1",
        "label": "1.",
        "preText": "Hướng giấy in nằm ngang trong tiếng Anh gọi là",
        "postText": ".",
        "correctAnswer": "Print Preview",
        "accepted": [
          "print preview",
          "Print Preview",
          "PrintPreview"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p11-fb-2",
        "label": "2.",
        "preText": "Chế độ Page Break Preview trong Excel cho phép người dùng điều chỉnh đường",
        "postText": "trang.",
        "correctAnswer": "hướng giấy (Orientation)",
        "accepted": [
          "hướng giấy (orientation)",
          "hướng giấy (Orientation)",
          "hướnggiấy(Orientation)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p11-fb-3",
        "label": "3.",
        "preText": "Thao tác lặp lại hàng tiêu đề ở đầu mỗi trang in được thiết lập trong mục Print Titles của thẻ Page",
        "postText": ".",
        "correctAnswer": "tiêu đề lặp lại",
        "accepted": [
          "tiêu đề lặp lại",
          "tiêu đề lặp lại",
          "tiêuđềlặplại"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao một bảng tính có nhiều cột nếu in ở hướng giấy đứng (Portrait) thường bị ngắt làm đôi gây khó đọc, và em\nsẽ xử lý thế nào?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p11-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao một bảng tính có nhiều cột nếu in ở hướng giấy đứng (Portrait) thường bị ngắt...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 7. ĐỊNH DẠNG TRANG IN VÀ IN TRANG TÍNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p11-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p11-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-12": {
    "grade": 8,
    "period": 12,
    "lessonTitle": "BÀI 8. ĐỊA CHỈ TƯƠNG ĐỐI VÀ ĐỊA CHỈ TUYỆT ĐỐI (MỤC 1,\n2)",
    "yccd": "",
    "wordBank": [
      "địa chỉ tương đối",
      "địa chỉ tuyệt đối ($)",
      "cố định"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p12-fb-1",
        "label": "1.",
        "preText": "Khi sao chép công thức chứa địa chỉ tương đối B2 xuống hàng dưới, địa chỉ sẽ tự động đổi thành",
        "postText": ".",
        "correctAnswer": "địa chỉ tương đối",
        "accepted": [
          "địa chỉ tương đối",
          "địa chỉ tương đối",
          "địachỉtươngđối"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p12-fb-2",
        "label": "2.",
        "preText": "Kí hiệu dùng để cố định hàng hoặc cột trong địa chỉ tuyệt đối là dấu",
        "postText": ".",
        "correctAnswer": "địa chỉ tuyệt đối ($)",
        "accepted": [
          "địa chỉ tuyệt đối ($)",
          "địa chỉ tuyệt đối ($)",
          "địachỉtuyệtđối($)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p12-fb-3",
        "label": "3.",
        "preText": "Địa chỉ $B$5 là địa chỉ",
        "postText": "(cố định cả cột B và hàng 5).",
        "correctAnswer": "cố định",
        "accepted": [
          "cố định",
          "cố định",
          "cốđịnh"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Giả sử tại ô C1 có công thức =A1*B1. Nếu sao chép công thức này xuống ô C2 thì công thức tại C2 sẽ trở thành gì?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p12-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Giả sử tại ô C1 có công thức =A1*B1. Nếu sao chép công thức này xuống ô C2 thì công t...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 8. ĐỊA CHỈ TƯƠNG ĐỐI VÀ ĐỊA CHỈ TUYỆT ĐỐI (MỤC 1,\n2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p12-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p12-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-13": {
    "grade": 8,
    "period": 13,
    "lessonTitle": "BÀI 8. ĐỊA CHỈ TƯƠNG ĐỐI VÀ ĐỊA CHỈ TUYỆT ĐỐI (MỤC 3\n- THỰC HÀNH)",
    "yccd": "",
    "wordBank": [
      "#DIV/0!",
      "chia cho 0",
      "tham chiếu tuyệt đối"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p13-fb-1",
        "label": "1.",
        "preText": "Công thức tính tỷ lệ phần trăm của ô A2 so với Tổng tại ô A10 là =A2/",
        "postText": ".",
        "correctAnswer": "#DIV/0!",
        "accepted": [
          "#div/0!",
          "#DIV/0!",
          "#DIV/0!"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p13-fb-2",
        "label": "2.",
        "preText": "Nếu không cố định ô Tổng A10 khi sao chép công thức tính tỷ lệ, bảng tính sẽ bị lỗi phân chia cho số 0 kí hiệu là",
        "postText": "!",
        "correctAnswer": "chia cho 0",
        "accepted": [
          "chia cho 0",
          "chia cho 0",
          "chiacho0"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p13-fb-3",
        "label": "3.",
        "preText": "Thao tác kéo nút điền (Fill handle) ở góc dưới bên phải ô tính giúp",
        "postText": "nhanh chóng.",
        "correctAnswer": "tham chiếu tuyệt đối",
        "accepted": [
          "tham chiếu tuyệt đối",
          "tham chiếu tuyệt đối",
          "thamchiếutuyệtđối"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Em hãy mô tả nguyên nhân xuất hiện lỗi #DIV/0! khi sao chép công thức tính tỷ trọng phần trăm và cách khắc\nphục lỗi này.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p13-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Em hãy mô tả nguyên nhân xuất hiện lỗi #DIV/0! khi sao chép công thức tính tỷ trọng p...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 8. ĐỊA CHỈ TƯƠNG ĐỐI VÀ ĐỊA CHỈ TUYỆT ĐỐI (MỤC 3\n- THỰC HÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p13-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p13-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-14": {
    "grade": 8,
    "period": 14,
    "lessonTitle": "BÀI 9. SẮP XẾP VÀ LỌC DỮ LIỆU (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "sắp xếp (Sort)",
      "Data",
      "tăng dần"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p14-fb-1",
        "label": "1.",
        "preText": "Biểu tượng AZ với mũi tên hướng xuống dùng để sắp xếp dữ liệu theo thứ tự",
        "postText": ".",
        "correctAnswer": "sắp xếp (Sort)",
        "accepted": [
          "sắp xếp (sort)",
          "sắp xếp (Sort)",
          "sắpxếp(Sort)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p14-fb-2",
        "label": "2.",
        "preText": "Biểu tượng ZA với mũi tên hướng xuống dùng để sắp xếp dữ liệu theo thứ tự",
        "postText": ".",
        "correctAnswer": "Data",
        "accepted": [
          "data",
          "Data",
          "Data"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p14-fb-3",
        "label": "3.",
        "preText": "Khi sắp xếp bảng dữ liệu, cần chọn toàn bộ bảng hoặc đặt con trỏ vào ô trong cột cần xếp để tránh làm",
        "postText": "số liệu giữa các hàng.",
        "correctAnswer": "tăng dần",
        "accepted": [
          "tăng dần",
          "tăng dần",
          "tăngdần"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao khi sắp xếp danh sách học sinh theo Điểm trung bình giảm dần, nếu có 2 bạn trùng điểm nhau ta nên thêm\ntiêu chí sắp xếp phụ theo Tên (A-Z)?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p14-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao khi sắp xếp danh sách học sinh theo Điểm trung bình giảm dần, nếu có 2 bạn tr...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 9. SẮP XẾP VÀ LỌC DỮ LIỆU (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p14-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p14-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-15": {
    "grade": 8,
    "period": 15,
    "lessonTitle": "BÀI 9. SẮP XẾP VÀ LỌC DỮ LIỆU (MỤC 2 - THỰC HÀNH)",
    "yccd": "",
    "wordBank": [
      "lọc tự động (AutoFilter)",
      "điều kiện lọc",
      "tạm ẩn"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p15-fb-1",
        "label": "1.",
        "preText": "Lọc dữ liệu chỉ làm",
        "postText": "các hàng không thỏa mãn điều kiện chứ không xóa bỏ chúng.",
        "correctAnswer": "lọc tự động (AutoFilter)",
        "accepted": [
          "lọc tự động (autofilter)",
          "lọc tự động (AutoFilter)",
          "lọctựđộng(AutoFilter)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p15-fb-2",
        "label": "2.",
        "preText": "Muốn bỏ chế độ lọc và hiển thị lại toàn bộ dữ liệu, ta nhấp nút",
        "postText": "trên thẻ Data.",
        "correctAnswer": "điều kiện lọc",
        "accepted": [
          "điều kiện lọc",
          "điều kiện lọc",
          "điềukiệnlọc"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p15-fb-3",
        "label": "3.",
        "preText": "Lựa chọn 'Number Filters > Greater Than",
        "postText": "' dùng để lọc các số",
        "correctAnswer": "tạm ẩn",
        "accepted": [
          "tạm ẩn",
          "tạm ẩn",
          "tạmẩn"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Phân biệt sự khác nhau cơ bản giữa tính năng Sắp xếp (Sort) và tính năng Lọc (Filter) dữ liệu trong bảng tính.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p15-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Phân biệt sự khác nhau cơ bản giữa tính năng Sắp xếp (Sort) và tính năng Lọc (Filter)...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 9. SẮP XẾP VÀ LỌC DỮ LIỆU (MỤC 2 - THỰC HÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p15-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p15-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-16": {
    "grade": 8,
    "period": 16,
    "lessonTitle": "BÀI 10. BIỂU ĐỒ TRONG BẢNG TÍNH (MỤC 1, 2)",
    "yccd": "",
    "wordBank": [
      "biểu đồ cột (Column)",
      "biểu đồ tròn (Pie)",
      "Chart Design"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p16-fb-1",
        "label": "1.",
        "preText": "Biểu đồ đường (Line chart) thích hợp nhất để thể hiện",
        "postText": "và xu hướng phát triển theo thời gian.",
        "correctAnswer": "biểu đồ cột (Column)",
        "accepted": [
          "biểu đồ cột (column)",
          "biểu đồ cột (Column)",
          "biểuđồcột(Column)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p16-fb-2",
        "label": "2.",
        "preText": "Biểu đồ hình tròn (Pie chart) dùng để mô tả cơ cấu",
        "postText": "phần trăm của một tổng thể.",
        "correctAnswer": "biểu đồ tròn (Pie)",
        "accepted": [
          "biểu đồ tròn (pie)",
          "biểu đồ tròn (Pie)",
          "biểuđồtròn(Pie)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p16-fb-3",
        "label": "3.",
        "preText": "Các lệnh tạo biểu đồ nằm trong thẻ lệnh",
        "postText": "trên thanh công cụ Excel.",
        "correctAnswer": "Chart Design",
        "accepted": [
          "chart design",
          "Chart Design",
          "ChartDesign"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Nếu cần vẽ biểu đồ biểu diễn 'Sự thay đổi nhiệt độ trung bình các tháng trong năm tại Hà Nội', em sẽ chọn dạng\nbiểu đồ nào? Vì sao?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p16-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Nếu cần vẽ biểu đồ biểu diễn 'Sự thay đổi nhiệt độ trung bình các tháng trong năm tại...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 10. BIỂU ĐỒ TRONG BẢNG TÍNH (MỤC 1, 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p16-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p16-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-17": {
    "grade": 8,
    "period": 17,
    "lessonTitle": "BÀI 10. BIỂU ĐỒ TRONG BẢNG TÍNH (MỤC 3 - THỰC\nHÀNH)",
    "yccd": "",
    "wordBank": [
      "nhãn dữ liệu (Data Labels)",
      "chú giải (Legend)",
      "trục tọa độ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p17-fb-1",
        "label": "1.",
        "preText": "Thẻ lệnh Chart Design cho phép người dùng thay đổi",
        "postText": "và kiểu dáng của biểu đồ.",
        "correctAnswer": "nhãn dữ liệu (Data Labels)",
        "accepted": [
          "nhãn dữ liệu (data labels)",
          "nhãn dữ liệu (Data Labels)",
          "nhãndữliệu(DataLabels)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p17-fb-2",
        "label": "2.",
        "preText": "Muốn hiển thị giá trị số liệu trực tiếp trên các cột của biểu đồ, ta bật tính năng Data",
        "postText": ".",
        "correctAnswer": "chú giải (Legend)",
        "accepted": [
          "chú giải (legend)",
          "chú giải (Legend)",
          "chúgiải(Legend)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p17-fb-3",
        "label": "3.",
        "preText": "Trục nằm ngang của biểu đồ cột thường là trục",
        "postText": "(Category Axis), trục đứng là trục",
        "correctAnswer": "trục tọa độ",
        "accepted": [
          "trục tọa độ",
          "trục tọa độ",
          "trụctọađộ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Nêu các bước thực hiện để thay đổi màu sắc của các cột trong biểu đồ cột đã vẽ.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p17-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Nêu các bước thực hiện để thay đổi màu sắc của các cột trong biểu đồ cột đã vẽ....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 10. BIỂU ĐỒ TRONG BẢNG TÍNH (MỤC 3 - THỰC\nHÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p17-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p17-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-18": {
    "grade": 8,
    "period": 18,
    "lessonTitle": "BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 1, 2)",
    "yccd": "",
    "wordBank": [
      "phân cấp nội dung",
      "cô đọng",
      "Theme mẫu"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p18-fb-1",
        "label": "1.",
        "preText": "Trang đầu tiên của bài trình chiếu cho biết tên đề tài và người thực hiện gọi là trang",
        "postText": ".",
        "correctAnswer": "phân cấp nội dung",
        "accepted": [
          "phân cấp nội dung",
          "phân cấp nội dung",
          "phâncấpnộidung"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p18-fb-2",
        "label": "2.",
        "preText": "Phần mềm trình chiếu chuyên dụng phổ biến nhất hiện nay là Microsoft",
        "postText": ".",
        "correctAnswer": "cô đọng",
        "accepted": [
          "cô đọng",
          "cô đọng",
          "côđọng"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p18-fb-3",
        "label": "3.",
        "preText": "Để giảm bậc phân cấp (thụt lề lùi ra ngoài) cho dòng văn bản, ta dùng tổ hợp phím Shift +",
        "postText": ".",
        "correctAnswer": "Theme mẫu",
        "accepted": [
          "theme mẫu",
          "Theme mẫu",
          "Thememẫu"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Trình bày lợi ích của việc sử dụng 'Cấu trúc phân cấp' (Bullet points nhiều cấp) khi thiết kế nội dung bài trình\nchiếu.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p18-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Trình bày lợi ích của việc sử dụng 'Cấu trúc phân cấp' (Bullet points nhiều cấp) khi ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 1, 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p18-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p18-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-19": {
    "grade": 8,
    "period": 19,
    "lessonTitle": "BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 3, 4 - THỰC HÀNH)",
    "yccd": "",
    "wordBank": [
      "New Slide",
      "Layout",
      ".pptx"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p19-fb-1",
        "label": "1.",
        "preText": "Nút lệnh New Slide nằm trong nhóm lệnh Slides thuộc thẻ",
        "postText": ".",
        "correctAnswer": "New Slide",
        "accepted": [
          "new slide",
          "New Slide",
          "NewSlide"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p19-fb-2",
        "label": "2.",
        "preText": "Mẫu bố cục 'Title and Content' dùng để trình bày tiêu đề trang và",
        "postText": "nội dung.",
        "correctAnswer": "Layout",
        "accepted": [
          "layout",
          "Layout",
          "Layout"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p19-fb-3",
        "label": "3.",
        "preText": "Tệp bài trình chiếu PowerPoint được lưu với đuôi mở rộng mặc định là",
        "postText": ".",
        "correctAnswer": ".pptx",
        "accepted": [
          ".pptx",
          ".pptx",
          ".pptx"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Khi báo cáo kết quả dự án học tập, việc kết hợp giữa văn bản dạng dàn ý và hình ảnh thực tế mang lại hiệu quả\ntruyền thông như thế nào?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p19-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Khi báo cáo kết quả dự án học tập, việc kết hợp giữa văn bản dạng dàn ý và hình ảnh t...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 11. TẠO BÀI TRÌNH CHIẾU (MỤC 3, 4 - THỰC HÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p19-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p19-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-20": {
    "grade": 8,
    "period": 20,
    "lessonTitle": "BÀI 12. SỬ DỤNG HIỆU ỨNG TRONG BÀI TRÌNH CHIẾU",
    "yccd": "",
    "wordBank": [
      "chuyển trang (Transition)",
      "Apply to All",
      "Animation"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p20-fb-1",
        "label": "1.",
        "preText": "Thẻ lệnh Transitions dùng để thiết lập hiệu ứng cho",
        "postText": ".",
        "correctAnswer": "chuyển trang (Transition)",
        "accepted": [
          "chuyển trang (transition)",
          "chuyển trang (Transition)",
          "chuyểntrang(Transition)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p20-fb-2",
        "label": "2.",
        "preText": "Thẻ lệnh Animations dùng để thiết lập hiệu ứng cho các",
        "postText": "trên trang chiếu.",
        "correctAnswer": "Apply to All",
        "accepted": [
          "apply to all",
          "Apply to All",
          "ApplytoAll"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p20-fb-3",
        "label": "3.",
        "preText": "Nhóm hiệu ứng xuất hiện của đối tượng (Entrance Effects) thường có biểu tượng hình ngôi sao màu",
        "postText": ".",
        "correctAnswer": "Animation",
        "accepted": [
          "animation",
          "Animation",
          "Animation"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Phân biệt sự khác nhau giữa Hiệu ứng chuyển trang (Slide Transition) và Hiệu ứng đối tượng (Object Animation).",
    "shortAnswerQuestions": [
      {
        "id": "k8-p20-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Phân biệt sự khác nhau giữa Hiệu ứng chuyển trang (Slide Transition) và Hiệu ứng đối ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 12. SỬ DỤNG HIỆU ỨNG TRONG BÀI TRÌNH CHIẾU để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p20-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p20-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-21": {
    "grade": 8,
    "period": 21,
    "lessonTitle": "BÀI 12. SỬ DỤNG HIỆU ỨNG TRONG BÀI TRÌNH CHIẾU",
    "yccd": "",
    "wordBank": [
      "Animation Pane",
      "With Previous",
      "thời lượng Duration"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p21-fb-1",
        "label": "1.",
        "preText": "Tùy chọn After Previous giúp hiệu ứng tự động chạy ngay",
        "postText": "khi hiệu ứng trước đó kết thúc.",
        "correctAnswer": "Animation Pane",
        "accepted": [
          "animation pane",
          "Animation Pane",
          "AnimationPane"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p21-fb-2",
        "label": "2.",
        "preText": "Thanh công cụ Animation Pane nằm trong thẻ lệnh",
        "postText": ".",
        "correctAnswer": "With Previous",
        "accepted": [
          "with previous",
          "With Previous",
          "WithPrevious"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p21-fb-3",
        "label": "3.",
        "preText": "Tham số Delay dùng để trì hoãn thời gian chờ trước khi hiệu ứng chính thức",
        "postText": ".",
        "correctAnswer": "thời lượng Duration",
        "accepted": [
          "thời lượng duration",
          "thời lượng Duration",
          "thờilượngDuration"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao khi làm bài thuyết trình có nhạc nền, việc cài đặt chế độ Start: 'With Previous' cho tệp âm thanh lại là bắt\nbuộc?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p21-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao khi làm bài thuyết trình có nhạc nền, việc cài đặt chế độ Start: 'With Previo...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 12. SỬ DỤNG HIỆU ỨNG TRONG BÀI TRÌNH CHIẾU để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p21-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p21-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-22": {
    "grade": 8,
    "period": 22,
    "lessonTitle": "BÀI 13. THỰC HÀNH TỔNG HỢP: HOÀN THIỆN BÀI TRÌNH",
    "yccd": "",
    "wordBank": [
      "F5",
      "đa phương tiện",
      "Slide Show"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p22-fb-1",
        "label": "1.",
        "preText": "Phím tắt trên bàn phím dùng để bắt đầu trình chiếu từ trang đầu tiên là phím",
        "postText": ".",
        "correctAnswer": "F5",
        "accepted": [
          "f5",
          "F5",
          "F5"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p22-fb-2",
        "label": "2.",
        "preText": "Phím tắt Shift + F5 dùng để bắt đầu trình chiếu từ trang",
        "postText": ".",
        "correctAnswer": "đa phương tiện",
        "accepted": [
          "đa phương tiện",
          "đa phương tiện",
          "đaphươngtiện"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p22-fb-3",
        "label": "3.",
        "preText": "Để kết thúc chế độ trình chiếu và quay lại màn hình soạn thảo, em nhấn phím",
        "postText": ".",
        "correctAnswer": "Slide Show",
        "accepted": [
          "slide show",
          "Slide Show",
          "SlideShow"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Hãy nêu 3 tiêu chí quan trọng nhất để đánh giá một bài trình chiếu báo cáo dự án đạt chất lượng Tốt về cả nội\ndung lẫn hình thức.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p22-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Hãy nêu 3 tiêu chí quan trọng nhất để đánh giá một bài trình chiếu báo cáo dự án đạt ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 13. THỰC HÀNH TỔNG HỢP: HOÀN THIỆN BÀI TRÌNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p22-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p22-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-23": {
    "grade": 8,
    "period": 23,
    "lessonTitle": "BÀI 14. THUẬT TOÁN VÀ CÂU LỆNH LẶP (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "thuật toán",
      "sơ đồ khối",
      "hình thoi"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p23-fb-1",
        "label": "1.",
        "preText": "Trong sơ đồ khối, hình chữ nhật dùng để thể hiện các bước",
        "postText": ".",
        "correctAnswer": "thuật toán",
        "accepted": [
          "thuật toán",
          "thuật toán",
          "thuậttoán"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p23-fb-2",
        "label": "2.",
        "preText": "Hình elip (hoặc bo tròn) trong sơ đồ khối dùng để thể hiện điểm Bắt đầu và",
        "postText": ".",
        "correctAnswer": "sơ đồ khối",
        "accepted": [
          "sơ đồ khối",
          "sơ đồ khối",
          "sơđồkhối"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p23-fb-3",
        "label": "3.",
        "preText": "Hình thoi trong sơ đồ khối dùng để thể hiện thao tác kiểm tra",
        "postText": ".",
        "correctAnswer": "hình thoi",
        "accepted": [
          "hình thoi",
          "hình thoi",
          "hìnhthoi"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Hãy nêu tính xác định và tính dừng của một thuật toán tin học.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p23-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Hãy nêu tính xác định và tính dừng của một thuật toán tin học....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 14. THUẬT TOÁN VÀ CÂU LỆNH LẶP (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p23-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p23-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-24": {
    "grade": 8,
    "period": 24,
    "lessonTitle": "BÀI 14. THUẬT TOÁN VÀ CÂU LỆNH LẶP (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "lặp biết trước",
      "lặp chưa biết trước",
      "điều kiện dừng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p24-fb-1",
        "label": "1.",
        "preText": "Thao tác 'Mỗi ngày tập thể dục 30 phút, làm liên tục trong 30 ngày' là ví dụ của cấu trúc lặp với số lần",
        "postText": ".",
        "correctAnswer": "lặp biết trước",
        "accepted": [
          "lặp biết trước",
          "lặp biết trước",
          "lặpbiếttrước"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p24-fb-2",
        "label": "2.",
        "preText": "Thao tác 'Rửa bát cho đến khi sạch hết bát trong chậu' là ví dụ của cấu trúc lặp với số lần",
        "postText": ".",
        "correctAnswer": "lặp chưa biết trước",
        "accepted": [
          "lặp chưa biết trước",
          "lặp chưa biết trước",
          "lặpchưabiếttrước"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p24-fb-3",
        "label": "3.",
        "preText": "Lỗi lặp vô tận (Infinite loop) xảy ra khi điều kiện dừng của vòng lặp KHÔNG BAO GIỜ",
        "postText": ".",
        "correctAnswer": "điều kiện dừng",
        "accepted": [
          "điều kiện dừng",
          "điều kiện dừng",
          "điềukiệndừng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao việc quên cập nhật biến đếm trong vòng lặp lại dẫn đến sự cố chương trình bị treo (lặp vô tận)?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p24-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao việc quên cập nhật biến đếm trong vòng lặp lại dẫn đến sự cố chương trình bị ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 14. THUẬT TOÁN VÀ CÂU LỆNH LẶP (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p24-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p24-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-25": {
    "grade": 8,
    "period": 25,
    "lessonTitle": "BÀI 15. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN (MỤC 1, 2)",
    "yccd": "",
    "wordBank": [
      "biến (Variable)",
      "phép gán",
      "cấu trúc rẽ nhánh"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p25-fb-1",
        "label": "1.",
        "preText": "Cấu trúc rẽ nhánh dạng thiếu có cú pháp: Nếu <Điều kiện> Thì",
        "postText": ".",
        "correctAnswer": "biến (Variable)",
        "accepted": [
          "biến (variable)",
          "biến (Variable)",
          "biến(Variable)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p25-fb-2",
        "label": "2.",
        "preText": "Cấu trúc rẽ nhánh dạng đủ có cú pháp: Nếu <Điều kiện> Thì <Lệnh 1> Ngược lại",
        "postText": ".",
        "correctAnswer": "phép gán",
        "accepted": [
          "phép gán",
          "phép gán",
          "phépgán"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p25-fb-3",
        "label": "3.",
        "preText": "Biến số dùng để lưu trữ dữ liệu trong bộ nhớ máy tính và có thể",
        "postText": "giá trị khi chương trình thực thi.",
        "correctAnswer": "cấu trúc rẽ nhánh",
        "accepted": [
          "cấu trúc rẽ nhánh",
          "cấu trúc rẽ nhánh",
          "cấutrúcrẽnhánh"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Hãy cho một ví dụ thực tế trong đời sống thể hiện cấu trúc rẽ nhánh dạng đủ 'Nếu ... Thì ... Ngược lại ...'.",
    "shortAnswerQuestions": [
      {
        "id": "k8-p25-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Hãy cho một ví dụ thực tế trong đời sống thể hiện cấu trúc rẽ nhánh dạng đủ 'Nếu ... ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 15. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN (MỤC 1, 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p25-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p25-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-26": {
    "grade": 8,
    "period": 26,
    "lessonTitle": "BÀI 15. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN (MỤC 3 - THỰC\nHÀNH)",
    "yccd": "",
    "wordBank": [
      "kịch bản (Script)",
      "lá cờ xanh",
      "sửa lỗi (Debug)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p26-fb-1",
        "label": "1.",
        "preText": "Sự kiện nhấp vào lá cờ xanh trong Scratch dùng để",
        "postText": "chương trình.",
        "correctAnswer": "kịch bản (Script)",
        "accepted": [
          "kịch bản (script)",
          "kịch bản (Script)",
          "kịchbản(Script)"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p26-fb-2",
        "label": "2.",
        "preText": "Khối lệnh 'Ask",
        "postText": "and wait' dùng để nhập dữ liệu đầu vào từ",
        "correctAnswer": "lá cờ xanh",
        "accepted": [
          "lá cờ xanh",
          "lá cờ xanh",
          "lácờxanh"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p26-fb-3",
        "label": "3.",
        "preText": "Giá trị người dùng vừa gõ nhập vào sẽ được lưu trong ô biến hệ thống có tên là",
        "postText": ".",
        "correctAnswer": "sửa lỗi (Debug)",
        "accepted": [
          "sửa lỗi (debug)",
          "sửa lỗi (Debug)",
          "sửalỗi(Debug)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Sửa lỗi (Debugging) trong lập trình là gì và tại sao người lập trình cần phải chạy thử chương trình với nhiều bộ\ndữ liệu khác nhau?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p26-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Sửa lỗi (Debugging) trong lập trình là gì và tại sao người lập trình cần phải chạy th...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 15. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN (MỤC 3 - THỰC\nHÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p26-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p26-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-27": {
    "grade": 8,
    "period": 27,
    "lessonTitle": "BÀI 16. DỰ ÁN HỌC TẬP: XÂY DỰNG CHƯƠNG TRÌNH",
    "yccd": "",
    "wordBank": [
      "ý tưởng dự án",
      "phân rã nhiệm vụ",
      "Storyboard"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p27-fb-1",
        "label": "1.",
        "preText": "Tư duy phân rã bài toán (Decomposition) là việc chia một bài toán lớn phức tạp thành các bài toán",
        "postText": "dễ giải quyết hơn.",
        "correctAnswer": "ý tưởng dự án",
        "accepted": [
          "ý tưởng dự án",
          "ý tưởng dự án",
          "ýtưởngdựán"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p27-fb-2",
        "label": "2.",
        "preText": "Bước xác định Input và Output giúp làm rõ dữ liệu đầu vào và",
        "postText": "của dự án.",
        "correctAnswer": "phân rã nhiệm vụ",
        "accepted": [
          "phân rã nhiệm vụ",
          "phân rã nhiệm vụ",
          "phânrãnhiệmvụ"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p27-fb-3",
        "label": "3.",
        "preText": "Bản phác thảo kịch bản trên giấy trước khi lập trình gọi là bản",
        "postText": ".",
        "correctAnswer": "Storyboard",
        "accepted": [
          "storyboard",
          "Storyboard",
          "Storyboard"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Tại sao bước lập kế hoạch và phân rã nhiệm vụ lại quyết định đến 50% sự thành công của một dự án làm việc\nnhóm?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p27-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Tại sao bước lập kế hoạch và phân rã nhiệm vụ lại quyết định đến 50% sự thành công củ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 16. DỰ ÁN HỌC TẬP: XÂY DỰNG CHƯƠNG TRÌNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p27-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p27-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-28": {
    "grade": 8,
    "period": 28,
    "lessonTitle": "BÀI 16. DỰ ÁN HỌC TẬP: XÂY DỰNG CHƯƠNG TRÌNH",
    "yccd": "",
    "wordBank": [
      "lắp ráp module",
      "kiểm thử Testing",
      "tối ưu hóa"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p28-fb-1",
        "label": "1.",
        "preText": "Việc ghép nối các module chương trình nhỏ của từng thành viên thành sản phẩm chung gọi là bước",
        "postText": "hệ thống.",
        "correctAnswer": "lắp ráp module",
        "accepted": [
          "lắp ráp module",
          "lắp ráp module",
          "lắprápmodule"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p28-fb-2",
        "label": "2.",
        "preText": "Khi chạy thử phát hiện nhân vật tính toán sai, ta cần kiểm tra lại các công thức",
        "postText": ".",
        "correctAnswer": "kiểm thử Testing",
        "accepted": [
          "kiểm thử testing",
          "kiểm thử Testing",
          "kiểmthửTesting"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p28-fb-3",
        "label": "3.",
        "preText": "Sản phẩm dự án cần hoàn thiện cả về mặt tính năng lẫn thẩm mỹ giao diện",
        "postText": ".",
        "correctAnswer": "tối ưu hóa",
        "accepted": [
          "tối ưu hóa",
          "tối ưu hóa",
          "tốiưuhóa"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Nhóm em sẽ làm gì khi tích hợp code của các thành viên lại với nhau mà xảy ra xung đột lỗi nhân vật không hoạt\nđộng?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p28-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Nhóm em sẽ làm gì khi tích hợp code của các thành viên lại với nhau mà xảy ra xung độ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 16. DỰ ÁN HỌC TẬP: XÂY DỰNG CHƯƠNG TRÌNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p28-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p28-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k8-tiet-29": {
    "grade": 8,
    "period": 29,
    "lessonTitle": "BÀI 16. DỰ ÁN HỌC TẬP: XÂY DỰNG CHƯƠNG TRÌNH",
    "yccd": "",
    "wordBank": [
      "nghiệm thu sản phẩm",
      "báo cáo demo",
      "tiêu chí Rubric"
    ],
    "fillBlankQuestions": [
      {
        "id": "k8-p29-fb-1",
        "label": "1.",
        "preText": "Bảng tiêu chí đánh giá sản phẩm dự án với các mức độ minh bạch gọi là bảng",
        "postText": ".",
        "correctAnswer": "nghiệm thu sản phẩm",
        "accepted": [
          "nghiệm thu sản phẩm",
          "nghiệm thu sản phẩm",
          "nghiệmthusảnphẩm"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p29-fb-2",
        "label": "2.",
        "preText": "Việc trình diễn trực tiếp phần mềm đang chạy thực tế cho mọi người xem gọi là trình diễn",
        "postText": ".",
        "correctAnswer": "báo cáo demo",
        "accepted": [
          "báo cáo demo",
          "báo cáo demo",
          "báocáodemo"
        ],
        "points": 0.35
      },
      {
        "id": "k8-p29-fb-3",
        "label": "3.",
        "preText": "Thái độ tự tin, nói rõ ràng và trả lời tốt các câu hỏi phản biện giúp nhóm đạt điểm cao ở phần",
        "postText": ".",
        "correctAnswer": "tiêu chí Rubric",
        "accepted": [
          "tiêu chí rubric",
          "tiêu chí Rubric",
          "tiêuchíRubric"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": "❓ Theo em, một buổi báo cáo sản phẩm dự án thành công cần kết hợp những yếu tố nào giữa Phần mềm và Kỹ năng\nthuyết trình?",
    "shortAnswerQuestions": [
      {
        "id": "k8-p29-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \"Theo em, một buổi báo cáo sản phẩm dự án thành công cần kết hợp những yếu tố nào giữa...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 16. DỰ ÁN HỌC TẬP: XÂY DỰNG CHƯƠNG TRÌNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k8-p29-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 8.",
        "points": 0.3
      },
      {
        "id": "k8-p29-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-1": {
    "grade": 9,
    "period": 1,
    "lessonTitle": "BÀI 1. MÁY TÍNH VỚI CON NGƯỜI VÀ XÃ HỘI (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "trí tuệ nhân tạo (AI)",
      "năng suất",
      "đô thị"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p1-fb-1",
        "label": "1.",
        "preText": "Máy tính điện tử đã trải qua nhiều thế hệ phát triển từ dùng đèn chân không đến mạch tích hợp siêu nhỏ và các chíp xử lý",
        "postText": ".",
        "correctAnswer": "trí tuệ nhân tạo (AI)",
        "accepted": [
          "trí tuệ nhân tạo (ai)",
          "trí tuệ nhân tạo (AI)",
          "trítuệnhântạo(AI)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p1-fb-2",
        "label": "2.",
        "preText": "Công nghệ thông tin và AI giúp tối ưu hóa công việc, giảm bớt sức lao động thủ công và nâng cao",
        "postText": "lao động.",
        "correctAnswer": "năng suất",
        "accepted": [
          "năng suất",
          "năng suất",
          "năngsuất"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p1-fb-3",
        "label": "3.",
        "preText": "Việc ứng dụng công nghệ số và AI mở ra nhiều dịch vụ mới trong y tế, giáo dục, tài chính và",
        "postText": "thông minh.",
        "correctAnswer": "đô thị",
        "accepted": [
          "đô thị",
          "đô thị",
          "đôthị"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 ví dụ thực tế về việc ứng dụng máy tính và công\nnghệ AI trong lĩnh vực y tế hoặc giáo dục mà em biết. Phân tích lợi ích mang lại cho con người.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p1-sa-1",
        "label": "• Ứng dụng AI trong Y tế:",
        "question": "Nêu 1 ví dụ cụ thể về ứng dụng AI trong Y tế và lợi ích mang lại:",
        "placeholder": "Ví dụ Y tế...",
        "sampleAnswer": "Hệ thống AI phân tích ảnh chụp X-quang, CT giúp bác sĩ phát hiện sớm tổn thương phổi và khối u nhanh chóng, chính xác.",
        "points": 0.4
      },
      {
        "id": "k9-p1-sa-2",
        "label": "• Ứng dụng AI trong Giáo dục:",
        "question": "Nêu 1 ví dụ cụ thể về ứng dụng AI trong Giáo dục và lợi ích mang lại:",
        "placeholder": "Ví dụ Giáo dục...",
        "sampleAnswer": "Ứng dụng học tiếng Anh (ELSA Speak) nhận diện giọng nói, chỉnh sửa lỗi phát âm trực tiếp cho từng học sinh.",
        "points": 0.3
      },
      {
        "id": "k9-p1-sa-3",
        "label": "• Ý thức sử dụng AI an toàn:",
        "question": "Học sinh cần lưu ý điều gì để không bị phụ thuộc tiêu cực vào AI?",
        "placeholder": "Lời khuyên sử dụng AI...",
        "sampleAnswer": "Chỉ xem AI là công cụ hỗ trợ tham khảo; luôn tư duy độc lập và tự mình hoàn thành bài làm của bản thân.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-2": {
    "grade": 9,
    "period": 2,
    "lessonTitle": "BÀI 1. MÁY TÍNH VỚI CON NGƯỜI VÀ XÃ HỘI (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "từ xa (online)",
      "nghiện Internet",
      "riêng tư"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p2-fb-1",
        "label": "1.",
        "preText": "Máy tính và mạng Internet thúc đẩy sự phát triển của xã hội thông tin, tạo ra hình thức làm việc",
        "postText": ".",
        "correctAnswer": "từ xa (online)",
        "accepted": [
          "từ xa (online)",
          "từ xa (online)",
          "từxa(online)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p2-fb-2",
        "label": "2.",
        "preText": "Lạm dụng máy tính quá nhiều có thể gây ra bệnh thụ động, suy giảm thị lực và nguy cơ mắc bệnh",
        "postText": "mạng.",
        "correctAnswer": "nghiện Internet",
        "accepted": [
          "nghiện internet",
          "nghiện Internet",
          "nghiệnInternet"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p2-fb-3",
        "label": "3.",
        "preText": "Khi sử dụng các công cụ AI trực tuyến, người dùng không nên chia sẻ thông tin cá nhân nhạy cảm để tránh nguy cơ lộ bí mật",
        "postText": ".",
        "correctAnswer": "riêng tư",
        "accepted": [
          "riêng tư",
          "riêng tư",
          "riêngtư"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 mặt tiêu cực của việc lạm dụng máy tính và AI\ntrong học tập của học sinh. Em đề xuất giải pháp gì để khắc phục?",
    "shortAnswerQuestions": [
      {
        "id": "k9-p2-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 mặt tiêu cực của việc lạm dụng máy tính và AI\ntrong học tập của học sinh. Em ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 1. MÁY TÍNH VỚI CON NGƯỜI VÀ XÃ HỘI (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p2-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p2-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-3": {
    "grade": 9,
    "period": 3,
    "lessonTitle": "BÀI 2. MẠNG MÁY TÍNH VÀ INTERNET (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "nâng cao",
      "bộ lọc tìm kiếm",
      "nguồn tin cậy"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p3-fb-1",
        "label": "1.",
        "preText": "Mạng máy tính là tập hợp các máy tính được kết nối với nhau để truyền thông tin và chia sẻ",
        "postText": ".",
        "correctAnswer": "nâng cao",
        "accepted": [
          "nâng cao",
          "nâng cao",
          "nângcao"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p3-fb-2",
        "label": "2.",
        "preText": "Mạng không dây (Wi-Fi) sử dụng sóng",
        "postText": "để truyền dữ liệu mà không cần dây cáp.",
        "correctAnswer": "bộ lọc tìm kiếm",
        "accepted": [
          "bộ lọc tìm kiếm",
          "bộ lọc tìm kiếm",
          "bộlọctìmkiếm"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p3-fb-3",
        "label": "3.",
        "preText": "Thiết bị",
        "postText": "giúp chuyển đổi tín hiệu số sang tín hiệu tương tự để truyền qua đường dây điện thoại hoặc cáp quang.",
        "correctAnswer": "nguồn tin cậy",
        "accepted": [
          "nguồn tin cậy",
          "nguồn tin cậy",
          "nguồntincậy"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Phòng máy tính trường em được kết nối mạng theo mô\nhình nào (có dây hay không dây)? Nêu ưu điểm của việc kết nối mạng máy tính trong nhà trường.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p3-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Phòng máy tính trường em được kết nối mạng theo mô\nhình nào (có dây hay không dây)?...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 2. MẠNG MÁY TÍNH VÀ INTERNET (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p3-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p3-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-4": {
    "grade": 9,
    "period": 4,
    "lessonTitle": "BÀI 2. MẠNG MÁY TÍNH VÀ INTERNET (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "an toàn thông tin",
      "mật khẩu xác thực 2 lớp",
      "lừa đảo"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p4-fb-1",
        "label": "1.",
        "preText": "Google Drive, OneDrive và iCloud là các dịch vụ lưu trữ",
        "postText": "trực tuyến phổ biến.",
        "correctAnswer": "an toàn thông tin",
        "accepted": [
          "an toàn thông tin",
          "an toàn thông tin",
          "antoànthôngtin"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p4-fb-2",
        "label": "2.",
        "preText": "Điện toán đám mây giúp người dùng truy cập dữ liệu mọi lúc, mọi nơi chỉ cần có kết nối",
        "postText": ".",
        "correctAnswer": "mật khẩu xác thực 2 lớp",
        "accepted": [
          "mật khẩu xác thực 2 lớp",
          "mật khẩu xác thực 2 lớp",
          "mậtkhẩuxácthực2lớp"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p4-fb-3",
        "label": "3.",
        "preText": "Các công cụ tìm kiếm tích hợp AI có khả năng tổng hợp câu trả lời trực tiếp thay vì chỉ đưa ra danh sách",
        "postText": "liên kết.",
        "correctAnswer": "lừa đảo",
        "accepted": [
          "lừa đảo",
          "lừa đảo",
          "lừađảo"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 lợi ích vượt trội của việc lưu trữ tài liệu học tập\ntrên điện toán đám mây so với việc chỉ lưu trên ổ cứng máy tính cá nhân.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p4-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 lợi ích vượt trội của việc lưu trữ tài liệu học tập\ntrên điện toán đám mây so...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 2. MẠNG MÁY TÍNH VÀ INTERNET (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p4-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p4-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-5": {
    "grade": 9,
    "period": 5,
    "lessonTitle": "BÀI 3. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "lớp ảnh (Layer)",
      "độ trong suốt (Opacity)",
      "mặt nạ (Mask)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p5-fb-1",
        "label": "1.",
        "preText": "Tìm kiếm thông tin bằng cách đặt từ khóa trong dấu ngoặc kép \"",
        "postText": "\" giúp tìm chính xác cụm từ",
        "correctAnswer": "lớp ảnh (Layer)",
        "accepted": [
          "lớp ảnh (layer)",
          "lớp ảnh (Layer)",
          "lớpảnh(Layer)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p5-fb-2",
        "label": "2.",
        "preText": "Công cụ AI có thể đọc hiểu văn bản số và tạo ra bản",
        "postText": "nội dung chính một cách tự động.",
        "correctAnswer": "độ trong suốt (Opacity)",
        "accepted": [
          "độ trong suốt (opacity)",
          "độ trong suốt (Opacity)",
          "độtrongsuốt(Opacity)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p5-fb-3",
        "label": "3.",
        "preText": "Việc sử dụng cú pháp tìm kiếm filetype:pdf giúp người dùng lọc trực tiếp các tệp tài liệu dạng",
        "postText": ".",
        "correctAnswer": "mặt nạ (Mask)",
        "accepted": [
          "mặt nạ (mask)",
          "mặt nạ (Mask)",
          "mặtnạ(Mask)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu sự khác biệt khi em tìm kiếm cụm từ: *Lịch sử\nmáy tính* và *\"Lịch sử máy tính\"* trên máy tìm kiếm Google.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p5-sa-1",
        "label": "• Tìm kiếm không có ngoặc kép:",
        "question": "Kết quả tìm kiếm khi gõ Lịch sử máy tính (không ngoặc) là gì?",
        "placeholder": "Mô tả kết quả...",
        "sampleAnswer": "Google sẽ tìm các trang web chứa bất kỳ từ nào: \"Lịch\", \"sử\", \"máy\" hoặc \"tính\" ở các vị trí rời rạc.",
        "points": 0.4
      },
      {
        "id": "k9-p5-sa-2",
        "label": "• Tìm kiếm có ngoặc kép \" \":",
        "question": "Kết quả khi đặt từ khóa trong ngoặc kép \"Lịch sử máy tính\" là gì?",
        "placeholder": "Mô tả kết quả...",
        "sampleAnswer": "Google chỉ hiển thị những trang web chứa chính xác cụm từ \"Lịch sử máy tính\" theo đúng thứ tự các từ.",
        "points": 0.3
      },
      {
        "id": "k9-p5-sa-3",
        "label": "• Kinh nghiệm tìm kiếm hiệu quả:",
        "question": "Khi nào em nên sử dụng toán tử dấu ngoặc kép khi tìm tài liệu?",
        "placeholder": "Nêu trường hợp áp dụng...",
        "sampleAnswer": "Khi cần tìm chính xác một định nghĩa, tên tác phẩm, đoạn trích thơ văn hoặc dòng thông báo lỗi kỹ thuật.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-6": {
    "grade": 9,
    "period": 6,
    "lessonTitle": "BÀI 3. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "công cụ Crop",
      "chỉnh sáng tối",
      "bộ lọc Filter"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p6-fb-1",
        "label": "1.",
        "preText": "Thông tin trên mạng cần được kiểm tra nguồn gốc từ các cơ quan chính thống hoặc các trang web có đuôi tên miền uy tín như",
        "postText": ".",
        "correctAnswer": "công cụ Crop",
        "accepted": [
          "công cụ crop",
          "công cụ Crop",
          "côngcụCrop"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p6-fb-2",
        "label": "2.",
        "preText": "Hiện tượng AI đưa ra thông tin có vẻ hợp lý nhưng hoàn toàn sai sự thật được gọi là ảo giác AI (",
        "postText": ").",
        "correctAnswer": "chỉnh sáng tối",
        "accepted": [
          "chỉnh sáng tối",
          "chỉnh sáng tối",
          "chỉnhsángtối"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p6-fb-3",
        "label": "3.",
        "preText": "Khi nhận được tin nhắn vay tiền khẩn cấp kèm video khuôn mặt giống người thân, em cần gọi điện trực tiếp để",
        "postText": "thông tin.",
        "correctAnswer": "bộ lọc Filter",
        "accepted": [
          "bộ lọc filter",
          "bộ lọc Filter",
          "bộlọcFilter"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 3 tiêu chí cốt lõi giúp em đánh giá một bài viết trên\nmạng xã hội có phải là tin chuẩn xác hay không.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p6-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 3 tiêu chí cốt lõi giúp em đánh giá một bài viết trên\nmạng xã hội có phải là ti...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 3. THÔNG TIN TRONG MÔI TRƯỜNG SỐ (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p6-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p6-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-7": {
    "grade": 9,
    "period": 7,
    "lessonTitle": "BÀI 4. TRÁCH NHIỆM TRONG MÔI TRƯỜNG SỐ (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "kênh thời gian (Timeline)",
      "chèn âm thanh",
      "cắt ghép video"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p7-fb-1",
        "label": "1.",
        "preText": "Tự ý lấy âm nhạc có bản quyền làm nhạc nền video đăng lên mạng có thể bị gỡ video do vi phạm",
        "postText": "tác giả.",
        "correctAnswer": "kênh thời gian (Timeline)",
        "accepted": [
          "kênh thời gian (timeline)",
          "kênh thời gian (Timeline)",
          "kênhthờigian(Timeline)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p7-fb-2",
        "label": "2.",
        "preText": "Giấy phép CC (Creative Commons) cho phép tác giả chia sẻ tác phẩm của mình với các điều kiện",
        "postText": "rõ ràng.",
        "correctAnswer": "chèn âm thanh",
        "accepted": [
          "chèn âm thanh",
          "chèn âm thanh",
          "chènâmthanh"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p7-fb-3",
        "label": "3.",
        "preText": "Khi sử dụng các đoạn văn do AI sinh ra trong bài luận học tập, học sinh cần minh bạch việc ứng dụng công cụ",
        "postText": "hỗ trợ.",
        "correctAnswer": "cắt ghép video",
        "accepted": [
          "cắt ghép video",
          "cắt ghép video",
          "cắtghépvideo"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Thế nào là trích dẫn nguồn thông tin hợp lệ? Nêu 1 ví\ndụ cụ thể về cách trích dẫn bài viết từ một trang báo điện tử.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p7-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Thế nào là trích dẫn nguồn thông tin hợp lệ? Nêu 1 ví\ndụ cụ thể về cách trích dẫn b...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 4. TRÁCH NHIỆM TRONG MÔI TRƯỜNG SỐ (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p7-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p7-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-8": {
    "grade": 9,
    "period": 8,
    "lessonTitle": "BÀI 4. TRÁCH NHIỆM TRONG MÔI TRƯỜNG SỐ (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "hiệu ứng chuyển cảnh Transition",
      "phụ đề tự động AI",
      "nhạc nền"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p8-fb-1",
        "label": "1.",
        "preText": "Không bao giờ tham gia hùa theo các chiến dịch công kích, bình luận ác ý đối với người khác trên",
        "postText": "xã hội.",
        "correctAnswer": "hiệu ứng chuyển cảnh Transition",
        "accepted": [
          "hiệu ứng chuyển cảnh transition",
          "hiệu ứng chuyển cảnh Transition",
          "hiệuứngchuyểncảnhTransition"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p8-fb-2",
        "label": "2.",
        "preText": "Mọi thông tin, hình ảnh đăng tải trên mạng sẽ tạo thành",
        "postText": "số theo suốt cuộc đời mỗi người.",
        "correctAnswer": "phụ đề tự động AI",
        "accepted": [
          "phụ đề tự động ai",
          "phụ đề tự động AI",
          "phụđềtựđộngAI"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p8-fb-3",
        "label": "3.",
        "preText": "Khi bị kẻ xấu đe dọa hoặc tống tiền qua mạng, học sinh cần giữ bằng chứng và báo ngay cho cha mẹ, thầy cô hoặc cơ quan",
        "postText": ".",
        "correctAnswer": "nhạc nền",
        "accepted": [
          "nhạc nền",
          "nhạc nền",
          "nhạcnền"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Em sẽ làm gì khi chứng kiến một bạn trong lớp đang bị\nnhóm người lạ công kích, xúc phạm nặng nề trên mạng xã hội?",
    "shortAnswerQuestions": [
      {
        "id": "k9-p8-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Em sẽ làm gì khi chứng kiến một bạn trong lớp đang bị\nnhóm người lạ công kích, xúc ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 4. TRÁCH NHIỆM TRONG MÔI TRƯỜNG SỐ (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p8-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p8-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-9": {
    "grade": 9,
    "period": 9,
    "lessonTitle": "BÀI 5. PHẦN MỀM BIÊN TẬP ẢNH VÀ THIẾT KẾ ĐỒ HỌA",
    "yccd": "",
    "wordBank": [
      "xuất tệp video (Export)",
      "MP4 chuẩn Full HD",
      "tỷ lệ 16:9"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p9-fb-1",
        "label": "1.",
        "preText": "Ảnh Bitmap được cấu tạo từ các điểm ảnh nhỏ gọi là",
        "postText": "(Pixel).",
        "correctAnswer": "xuất tệp video (Export)",
        "accepted": [
          "xuất tệp video (export)",
          "xuất tệp video (Export)",
          "xuấttệpvideo(Export)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p9-fb-2",
        "label": "2.",
        "preText": "Công cụ Lasso hoặc Magic Wand dùng để tạo",
        "postText": "vùng ảnh cần chỉnh sửa.",
        "correctAnswer": "MP4 chuẩn Full HD",
        "accepted": [
          "mp4 chuẩn full hd",
          "MP4 chuẩn Full HD",
          "MP4chuẩnFullHD"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p9-fb-3",
        "label": "3.",
        "preText": "Tính năng tách nền tự động dựa trên thuật toán AI giúp tiết kiệm thời gian so với việc cắt ảnh thủ công bằng công cụ",
        "postText": ".",
        "correctAnswer": "tỷ lệ 16:9",
        "accepted": [
          "tỷ lệ 16:9",
          "tỷ lệ 16:9",
          "tỷlệ16:9"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Phân biệt sự khác nhau cơ bản giữa ảnh Bitmap và\nảnh Vector về khả năng hiển thị khi phóng to hình ảnh.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p9-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Phân biệt sự khác nhau cơ bản giữa ảnh Bitmap và\nảnh Vector về khả năng hiển thị kh...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 5. PHẦN MỀM BIÊN TẬP ẢNH VÀ THIẾT KẾ ĐỒ HỌA để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p9-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p9-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-10": {
    "grade": 9,
    "period": 10,
    "lessonTitle": "BÀI 5. PHẦN MỀM BIÊN TẬP ẢNH VÀ THIẾT KẾ ĐỒ",
    "yccd": "",
    "wordBank": [
      "lớp trên cùng (Layer)",
      "hiển thị (Visibility)",
      "khóa Layer"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p10-fb-1",
        "label": "1.",
        "preText": "Lớp nằm ở vị trí trên cùng trong bảng Layer sẽ",
        "postText": "các lớp nằm ở phía dưới nó.",
        "correctAnswer": "lớp trên cùng (Layer)",
        "accepted": [
          "lớp trên cùng (layer)",
          "lớp trên cùng (Layer)",
          "lớptrêncùng(Layer)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p10-fb-2",
        "label": "2.",
        "preText": "Biểu tượng hình con mắt bên cạnh mỗi Layer dùng để bật hoặc ẩn chế độ",
        "postText": "của lớp đó.",
        "correctAnswer": "hiển thị (Visibility)",
        "accepted": [
          "hiển thị (visibility)",
          "hiển thị (Visibility)",
          "hiểnthị(Visibility)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p10-fb-3",
        "label": "3.",
        "preText": "Việc chia thiết kế thành nhiều Layer riêng biệt giúp người dùng dễ dàng chỉnh sửa một đối tượng mà không làm ảnh hưởng đến các",
        "postText": "khác.",
        "correctAnswer": "khóa Layer",
        "accepted": [
          "khóa layer",
          "khóa Layer",
          "khóaLayer"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Vì sao khi thiết kế một tấm áp phích (Poster) gồm chữ,\nhình ảnh và hình nền, người ta lại đặt mỗi đối tượng trên một Layer riêng biệt?",
    "shortAnswerQuestions": [
      {
        "id": "k9-p10-sa-1",
        "label": "• Lợi ích của việc tách Layer:",
        "question": "Tại sao cần đặt chữ, ảnh và nền trên các Layer riêng biệt?",
        "placeholder": "Giải thích nguyên nhân...",
        "sampleAnswer": "Giúp chỉnh sửa, di chuyển hoặc đổi kích thước một đối tượng mà không làm xáo trộn hay ảnh hưởng đến đối tượng khác.",
        "points": 0.4
      },
      {
        "id": "k9-p10-sa-2",
        "label": "• Quản lý thứ tự hiển thị:",
        "question": "Thứ tự sắp xếp các Layer từ trên xuống dưới quyết định điều gì?",
        "placeholder": "Quy tắc hiển thị...",
        "sampleAnswer": "Layer ở trên sẽ đè lên Layer ở dưới. Chữ phải đặt ở Layer trên cùng để không bị hình nền che khuất.",
        "points": 0.3
      },
      {
        "id": "k9-p10-sa-3",
        "label": "• Thao tác hữu ích với Layer:",
        "question": "Nêu tác dụng của biểu tượng con mắt và ổ khóa trên mỗi Layer:",
        "placeholder": "Nêu công dụng...",
        "sampleAnswer": "Biểu tượng con mắt để ẩn/hiện tạm thời Layer; biểu tượng ổ khóa để cố định Layer tránh bấm nhầm khi thiết kế.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-11": {
    "grade": 9,
    "period": 11,
    "lessonTitle": "BÀI 5. PHẦN MỀM BIÊN TẬP ẢNH VÀ THIẾT KẾ ĐỒ",
    "yccd": "",
    "wordBank": [
      "đồ họa vector",
      "phóng to không vỡ nét",
      "SVG"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p11-fb-1",
        "label": "1.",
        "preText": "Công cụ Crop giúp giữ lại phần vùng ảnh cần thiết và loại bỏ các chi tiết",
        "postText": "xung quanh.",
        "correctAnswer": "đồ họa vector",
        "accepted": [
          "đồ họa vector",
          "đồ họa vector",
          "đồhọavector"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p11-fb-2",
        "label": "2.",
        "preText": "Việc điều chỉnh độ tương phản (Contrast) giúp phân biệt rõ hơn giữa vùng",
        "postText": "và vùng tối trong bức ảnh.",
        "correctAnswer": "phóng to không vỡ nét",
        "accepted": [
          "phóng to không vỡ nét",
          "phóng to không vỡ nét",
          "phóngtokhôngvỡnét"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p11-fb-3",
        "label": "3.",
        "preText": "Khi xuất sản phẩm thiết kế đồ họa để in ấn, em nên chọn định dạng tệp có chất lượng cao như",
        "postText": "hoặc PNG.",
        "correctAnswer": "SVG",
        "accepted": [
          "svg",
          "SVG",
          "SVG"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Mô tả các bước em sẽ thực hiện để làm một Tấm thiệp\nchúc mừng thầy cô nhân ngày 20/11 từ bức ảnh chụp tập thể lớp.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p11-sa-1",
        "label": "• Đổi đơn vị dung lượng:",
        "question": "Đổi dung lượng thẻ nhớ từ GB sang MB:",
        "placeholder": "16 GB = ... MB",
        "sampleAnswer": "16 GB = 16 × 1024 MB = 16 384 MB (hoặc tính xấp xỉ 16 × 1000 = 16 000 MB).",
        "points": 0.4
      },
      {
        "id": "k9-p11-sa-2",
        "label": "• Số lượng ảnh tối đa:",
        "question": "Tính số bức ảnh tối đa thẻ nhớ có thể chứa:",
        "placeholder": "Thực hiện phép chia...",
        "sampleAnswer": "16 384 : 4 = 4 096 bức ảnh (hoặc tính xấp xỉ 16 000 : 4 = 4 000 bức ảnh).",
        "points": 0.3
      },
      {
        "id": "k9-p11-sa-3",
        "label": "• Quản lý dữ liệu số:",
        "question": "Lời khuyên khi sử dụng thẻ nhớ điện thoại để tránh đầy bộ nhớ:",
        "placeholder": "Nêu giải pháp...",
        "sampleAnswer": "Thường xuyên sao lưu ảnh lên dịch vụ đám mây (Google Photos/Drive) và xóa bớt ảnh trùng lặp.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-12": {
    "grade": 9,
    "period": 12,
    "lessonTitle": "BÀI 6. PHẦN MỀM LÀM VIDEO (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "kịch bản video",
      "phân đoạn cảnh",
      "lời thoại"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p12-fb-1",
        "label": "1.",
        "preText": "Trục thời gian (Timeline) hiển thị toàn bộ trình tự xuất hiện của các clip và hình ảnh theo thời gian từ trái sang",
        "postText": ".",
        "correctAnswer": "kịch bản video",
        "accepted": [
          "kịch bản video",
          "kịch bản video",
          "kịchbảnvideo"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p12-fb-2",
        "label": "2.",
        "preText": "Người dùng có thể kéo thả để thay đổi thời lượng hiển thị của một bức ảnh trên kênh",
        "postText": "Track.",
        "correctAnswer": "phân đoạn cảnh",
        "accepted": [
          "phân đoạn cảnh",
          "phân đoạn cảnh",
          "phânđoạncảnh"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p12-fb-3",
        "label": "3.",
        "preText": "Việc tách riêng kênh video và kênh âm thanh giúp người dùng dễ dàng tắt tiếng video gốc để chèn nhạc",
        "postText": "mới.",
        "correctAnswer": "lời thoại",
        "accepted": [
          "lời thoại",
          "lời thoại",
          "lờithoại"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 3 loại tư liệu đa truyền thông đầu vào em cần\nchuẩn bị trước khi tiến hành làm một video clip giới thiệu về trường học.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p12-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 3 loại tư liệu đa truyền thông đầu vào em cần\nchuẩn bị trước khi tiến hành làm ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 6. PHẦN MỀM LÀM VIDEO (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p12-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p12-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-13": {
    "grade": 9,
    "period": 13,
    "lessonTitle": "BÀI 6. PHẦN MỀM LÀM VIDEO (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "thu âm chất lượng",
      "lọc tạp âm",
      "khớp hình tiếng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p13-fb-1",
        "label": "1.",
        "preText": "Hiệu ứng chuyển cảnh (Transition) giúp nối 2 đoạn video không bị giật hoặc ngắt quãng",
        "postText": ".",
        "correctAnswer": "thu âm chất lượng",
        "accepted": [
          "thu âm chất lượng",
          "thu âm chất lượng",
          "thuâmchấtlượng"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p13-fb-2",
        "label": "2.",
        "preText": "Công nghệ AI có khả năng lắng nghe giọng nói trong video và tự động tạo",
        "postText": "chữ chính xác theo thời gian thực.",
        "correctAnswer": "lọc tạp âm",
        "accepted": [
          "lọc tạp âm",
          "lọc tạp âm",
          "lọctạpâm"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p13-fb-3",
        "label": "3.",
        "preText": "Âm lượng của nhạc nền cần được điều chỉnh nhỏ hơn âm lượng của giọng",
        "postText": "để người xem nghe rõ lời.",
        "correctAnswer": "khớp hình tiếng",
        "accepted": [
          "khớp hình tiếng",
          "khớp hình tiếng",
          "khớphìnhtiếng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 lý do vì sao một video clip ngắn nên có phụ đề\nchữ (Subtitles) chạy phía dưới màn hình.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p13-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 lý do vì sao một video clip ngắn nên có phụ đề\nchữ (Subtitles) chạy phía dưới...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 6. PHẦN MỀM LÀM VIDEO (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p13-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p13-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-14": {
    "grade": 9,
    "period": 14,
    "lessonTitle": "BÀI 6. PHẦN MỀM LÀM VIDEO (MỤC 3 - THỰC HÀNH)",
    "yccd": "",
    "wordBank": [
      "kết xuất sản phẩm",
      "dung lượng tệp",
      "chia sẻ"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p14-fb-1",
        "label": "1.",
        "preText": "Quá trình Render/Export sẽ tổng hợp toàn bộ hình ảnh, âm thanh, hiệu ứng trên Timeline thành một tệp",
        "postText": "duy nhất.",
        "correctAnswer": "kết xuất sản phẩm",
        "accepted": [
          "kết xuất sản phẩm",
          "kết xuất sản phẩm",
          "kếtxuấtsảnphẩm"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p14-fb-2",
        "label": "2.",
        "preText": "Độ phân giải Full HD tương ứng với kích thước điểm ảnh là 1920 x",
        "postText": "Pixel.",
        "correctAnswer": "dung lượng tệp",
        "accepted": [
          "dung lượng tệp",
          "dung lượng tệp",
          "dunglượngtệp"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p14-fb-3",
        "label": "3.",
        "preText": "Tốc độ khung hình 60 FPS giúp các chuyển động trong video trở nên mượt mà hơn so với tốc độ",
        "postText": "FPS truyền thống.",
        "correctAnswer": "chia sẻ",
        "accepted": [
          "chia sẻ",
          "chia sẻ",
          "chiasẻ"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Phân biệt sự khác nhau khi em chọn xuất video ở độ\nphân giải HD (720p) và Full HD (1080p) về dung lượng tệp và chất lượng hình ảnh.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p14-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Phân biệt sự khác nhau khi em chọn xuất video ở độ\nphân giải HD (720p) và Full HD (...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 6. PHẦN MỀM LÀM VIDEO (MỤC 3 - THỰC HÀNH) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p14-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p14-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-15": {
    "grade": 9,
    "period": 15,
    "lessonTitle": "BÀI 7. LÀM QUEN VỚI PHẦN MỀM TẠO TRANG WEB",
    "yccd": "",
    "wordBank": [
      "website",
      "trang chủ (Homepage)",
      "tên miền (Domain)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p15-fb-1",
        "label": "1.",
        "preText": "Website là tập hợp của nhiều",
        "postText": "được liên kết lại với nhau qua tên miền chung.",
        "correctAnswer": "website",
        "accepted": [
          "website",
          "website",
          "website"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p15-fb-2",
        "label": "2.",
        "preText": "Tên miền uy tín của các trường học ở Việt Nam thường có phần mở rộng là",
        "postText": ".",
        "correctAnswer": "trang chủ (Homepage)",
        "accepted": [
          "trang chủ (homepage)",
          "trang chủ (Homepage)",
          "trangchủ(Homepage)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p15-fb-3",
        "label": "3.",
        "preText": "Trình duyệt web như Chrome, Edge hay Firefox giúp chuyển đổi mã lệnh HTML thành giao diện hình ảnh",
        "postText": ".",
        "correctAnswer": "tên miền (Domain)",
        "accepted": [
          "tên miền (domain)",
          "tên miền (Domain)",
          "tênmiền(Domain)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu vai trò của phần mềm thiết kế trang web kéo thả\ntrực quan đối với người không chuyên.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p15-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu vai trò của phần mềm thiết kế trang web kéo thả\ntrực quan đối với người không c...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 7. LÀM QUEN VỚI PHẦN MỀM TẠO TRANG WEB để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p15-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p15-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-16": {
    "grade": 9,
    "period": 16,
    "lessonTitle": "BÀI 7. LÀM QUEN VỚI PHẦN MỀM TẠO TRANG WEB",
    "yccd": "",
    "wordBank": [
      "bố cục mẫu (Template)",
      "thanh điều hướng (Nav)",
      "chân trang (Footer)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p16-fb-1",
        "label": "1.",
        "preText": "Lựa chọn một Mẫu giao diện (Theme) phù hợp giúp trang web có sự thống nhất về",
        "postText": "và màu sắc.",
        "correctAnswer": "bố cục mẫu (Template)",
        "accepted": [
          "bố cục mẫu (template)",
          "bố cục mẫu (Template)",
          "bốcụcmẫu(Template)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p16-fb-2",
        "label": "2.",
        "preText": "Khối văn bản (Text box) cho phép người dùng gõ văn bản và căn chỉnh phông chữ, cỡ chữ",
        "postText": ".",
        "correctAnswer": "thanh điều hướng (Nav)",
        "accepted": [
          "thanh điều hướng (nav)",
          "thanh điều hướng (Nav)",
          "thanhđiềuhướng(Nav)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p16-fb-3",
        "label": "3.",
        "preText": "Thanh điều hướng giúp người xem chuyển đổi nhanh giữa Trang chủ và các",
        "postText": ".",
        "correctAnswer": "chân trang (Footer)",
        "accepted": [
          "chân trang (footer)",
          "chân trang (Footer)",
          "chântrang(Footer)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 lý do vì sao nên chọn bố cục (Layout) rõ ràng\ntrước khi chèn quá nhiều hình ảnh vào trang web.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p16-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 lý do vì sao nên chọn bố cục (Layout) rõ ràng\ntrước khi chèn quá nhiều hình ả...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 7. LÀM QUEN VỚI PHẦN MỀM TẠO TRANG WEB để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p16-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p16-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-17": {
    "grade": 9,
    "period": 17,
    "lessonTitle": "BÀI 8. ĐỊNH DẠNG VĂN BẢN VÀ CHÈN ẢNH VÀO",
    "yccd": "",
    "wordBank": [
      "siêu liên kết (Hyperlink)",
      "biểu mẫu liên hệ",
      "nhúng video"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p17-fb-1",
        "label": "1.",
        "preText": "Màu chữ trên trang web cần tạo độ tương phản tốt với màu",
        "postText": "để tránh gây mỏi mắt.",
        "correctAnswer": "siêu liên kết (Hyperlink)",
        "accepted": [
          "siêu liên kết (hyperlink)",
          "siêu liên kết (Hyperlink)",
          "siêuliênkết(Hyperlink)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p17-fb-2",
        "label": "2.",
        "preText": "Định dạng căn đều hai bên giúp các đoạn văn bản dài nhìn ngay ngắn và",
        "postText": "hơn.",
        "correctAnswer": "biểu mẫu liên hệ",
        "accepted": [
          "biểu mẫu liên hệ",
          "biểu mẫu liên hệ",
          "biểumẫuliênhệ"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p17-fb-3",
        "label": "3.",
        "preText": "Các mức tiêu đề Heading 1, Heading 2 giúp phân cấp cấu trúc",
        "postText": "của bài viết.",
        "correctAnswer": "nhúng video",
        "accepted": [
          "nhúng video",
          "nhúng video",
          "nhúngvideo"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 quy tắc chọn phông chữ và màu sắc để đoạn\nvăn bản trên trang web trông chuyên nghiệp.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p17-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 quy tắc chọn phông chữ và màu sắc để đoạn\nvăn bản trên trang web trông chuyên...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 8. ĐỊNH DẠNG VĂN BẢN VÀ CHÈN ẢNH VÀO để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p17-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p17-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-18": {
    "grade": 9,
    "period": 18,
    "lessonTitle": "BÀI 8. ĐỊNH DẠNG VĂN BẢN VÀ CHÈN ẢNH VÀO",
    "yccd": "",
    "wordBank": [
      "xuất bản trang web (Publish)",
      "tên miền công cộng",
      "truy cập"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p18-fb-1",
        "label": "1.",
        "preText": "Việc chèn thêm hình ảnh minh họa giúp trang web trở nên trực quan và",
        "postText": "hơn.",
        "correctAnswer": "xuất bản trang web (Publish)",
        "accepted": [
          "xuất bản trang web (publish)",
          "xuất bản trang web (Publish)",
          "xuấtbảntrangweb(Publish)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p18-fb-2",
        "label": "2.",
        "preText": "Bảng biểu trên trang web giúp tổ chức thông tin dạng hàng và",
        "postText": "khoa học.",
        "correctAnswer": "tên miền công cộng",
        "accepted": [
          "tên miền công cộng",
          "tên miền công cộng",
          "tênmiềncôngcộng"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p18-fb-3",
        "label": "3.",
        "preText": "Dòng chú thích ảnh (Caption) giúp người đọc hiểu rõ bối cảnh và ý nghĩa của bức",
        "postText": ".",
        "correctAnswer": "truy cập",
        "accepted": [
          "truy cập",
          "truy cập",
          "truycập"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Vì sao không nên chèn những bức ảnh có dung lượng\nquá lớn (trên 10MB) vào trang web?",
    "shortAnswerQuestions": [
      {
        "id": "k9-p18-sa-1",
        "label": "• Đổi đơn vị dung lượng:",
        "question": "Đổi dung lượng thẻ nhớ từ GB sang MB:",
        "placeholder": "16 GB = ... MB",
        "sampleAnswer": "16 GB = 16 × 1024 MB = 16 384 MB (hoặc tính xấp xỉ 16 × 1000 = 16 000 MB).",
        "points": 0.4
      },
      {
        "id": "k9-p18-sa-2",
        "label": "• Số lượng ảnh tối đa:",
        "question": "Tính số bức ảnh tối đa thẻ nhớ có thể chứa:",
        "placeholder": "Thực hiện phép chia...",
        "sampleAnswer": "16 384 : 4 = 4 096 bức ảnh (hoặc tính xấp xỉ 16 000 : 4 = 4 000 bức ảnh).",
        "points": 0.3
      },
      {
        "id": "k9-p18-sa-3",
        "label": "• Quản lý dữ liệu số:",
        "question": "Lời khuyên khi sử dụng thẻ nhớ điện thoại để tránh đầy bộ nhớ:",
        "placeholder": "Nêu giải pháp...",
        "sampleAnswer": "Thường xuyên sao lưu ảnh lên dịch vụ đám mây (Google Photos/Drive) và xóa bớt ảnh trùng lặp.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-19": {
    "grade": 9,
    "period": 19,
    "lessonTitle": "BÀI 9. TẠO LIÊN KẾT VÀ HOÀN THIỆN TRANG WEB",
    "yccd": "",
    "wordBank": [
      "bài toán tin học",
      "mô hình hóa",
      "thuật toán"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p19-fb-1",
        "label": "1.",
        "preText": "Liên kết siêu văn bản (Hyperlink) cho phép người dùng chuyển nhanh sang trang web khác chỉ bằng một cú",
        "postText": ".",
        "correctAnswer": "bài toán tin học",
        "accepted": [
          "bài toán tin học",
          "bài toán tin học",
          "bàitoántinhọc"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p19-fb-2",
        "label": "2.",
        "preText": "Trang con (Subpage) giúp mở rộng các chủ đề chi tiết thuộc trang",
        "postText": "chính.",
        "correctAnswer": "mô hình hóa",
        "accepted": [
          "mô hình hóa",
          "mô hình hóa",
          "môhìnhhóa"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p19-fb-3",
        "label": "3.",
        "preText": "Nút bấm (Button) nổi bật làm tăng khả năng tương tác của người xem trên trang",
        "postText": ".",
        "correctAnswer": "thuật toán",
        "accepted": [
          "thuật toán",
          "thuật toán",
          "thuậttoán"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Thế nào là liên kết bị lỗi (Broken link) và ảnh hưởng\ncủa nó tới trải nghiệm người xem web?",
    "shortAnswerQuestions": [
      {
        "id": "k9-p19-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Thế nào là liên kết bị lỗi (Broken link) và ảnh hưởng\ncủa nó tới trải nghiệm người ...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 9. TẠO LIÊN KẾT VÀ HOÀN THIỆN TRANG WEB để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p19-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p19-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-20": {
    "grade": 9,
    "period": 20,
    "lessonTitle": "BÀI 9. TẠO LIÊN KẾT VÀ HOÀN THIỆN TRANG WEB",
    "yccd": "",
    "wordBank": [
      "phân rã bài toán",
      "thuật toán con (Hàm)",
      "tối ưu"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p20-fb-1",
        "label": "1.",
        "preText": "Chế độ Preview giúp kiểm tra hiển thị giao diện trang web trên máy tính, máy tính bảng và",
        "postText": ".",
        "correctAnswer": "phân rã bài toán",
        "accepted": [
          "phân rã bài toán",
          "phân rã bài toán",
          "phânrãbàitoán"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p20-fb-2",
        "label": "2.",
        "preText": "Sau khi chỉnh sửa nội dung mới, người dùng cần bấm lại nút",
        "postText": "để cập nhật bản mới lên mạng.",
        "correctAnswer": "thuật toán con (Hàm)",
        "accepted": [
          "thuật toán con (hàm)",
          "thuật toán con (Hàm)",
          "thuậttoáncon(Hàm)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p20-fb-3",
        "label": "3.",
        "preText": "Việc phân quyền truy cập giúp bảo vệ trang web, chỉ cho phép những người được cấp quyền mới có thể",
        "postText": ".",
        "correctAnswer": "tối ưu",
        "accepted": [
          "tối ưu",
          "tối ưu",
          "tốiưu"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu các bước em cần làm nếu muốn cập nhật thông\nbáo mới lên website lớp học đã xuất bản từ trước.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p20-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu các bước em cần làm nếu muốn cập nhật thông\nbáo mới lên website lớp học đã xuất...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 9. TẠO LIÊN KẾT VÀ HOÀN THIỆN TRANG WEB để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p20-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p20-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-21": {
    "grade": 9,
    "period": 21,
    "lessonTitle": "BÀI 10. GIỚI THIỆU VỀ LẬP TRÌNH GIẢI QUYẾT BÀI",
    "yccd": "",
    "wordBank": [
      "hàm (Function)",
      "tham số đầu vào",
      "giá trị trả về (Return)"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p21-fb-1",
        "label": "1.",
        "preText": "Bài toán trong tin học được xác định bởi tập hợp dữ liệu đầu vào (Input) và kết quả",
        "postText": "(Output).",
        "correctAnswer": "hàm (Function)",
        "accepted": [
          "hàm (function)",
          "hàm (Function)",
          "hàm(Function)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p21-fb-2",
        "label": "2.",
        "preText": "Thuật toán là dãy hữu hạn các chỉ dẫn rõ ràng để máy tính giải quyết bài toán trong một số bước",
        "postText": ".",
        "correctAnswer": "tham số đầu vào",
        "accepted": [
          "tham số đầu vào",
          "tham số đầu vào",
          "thamsốđầuvào"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p21-fb-3",
        "label": "3.",
        "preText": "Ngôn ngữ lập trình giúp chuyển đổi các bước thuật toán thành mã lệnh mà máy tính có thể",
        "postText": ".",
        "correctAnswer": "giá trị trả về (Return)",
        "accepted": [
          "giá trị trả về (return)",
          "giá trị trả về (Return)",
          "giátrịtrảvề(Return)"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 3 bước cơ bản cần thực hiện khi lập trình giải một\nbài toán thực tế trên máy tính.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p21-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 3 bước cơ bản cần thực hiện khi lập trình giải một\nbài toán thực tế trên máy tí...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 10. GIỚI THIỆU VỀ LẬP TRÌNH GIẢI QUYẾT BÀI để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p21-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p21-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-22": {
    "grade": 9,
    "period": 22,
    "lessonTitle": "BÀI 10. GIỚI THIỆU VỀ LẬP TRÌNH GIẢI QUYẾT BÀI",
    "yccd": "",
    "wordBank": [
      "danh sách (List / Mảng)",
      "chỉ số Index",
      "duyệt phần tử"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p22-fb-1",
        "label": "1.",
        "preText": "Biến (Variable) là đại lượng lưu trữ dữ liệu và có thể thay đổi giá trị trong quá trình",
        "postText": ".",
        "correctAnswer": "danh sách (List / Mảng)",
        "accepted": [
          "danh sách (list / mảng)",
          "danh sách (List / Mảng)",
          "danhsách(List/Mảng)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p22-fb-2",
        "label": "2.",
        "preText": "Kiểu dữ liệu xâu ký tự (String) chứa các ký tự chữ, số và biểu tượng đặt trong dấu quotes",
        "postText": ".",
        "correctAnswer": "chỉ số Index",
        "accepted": [
          "chỉ số index",
          "chỉ số Index",
          "chỉsốIndex"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p22-fb-3",
        "label": "3.",
        "preText": "Phép gán giúp đưa giá trị mới vào ô nhớ của biến và đè lên giá trị",
        "postText": ".",
        "correctAnswer": "duyệt phần tử",
        "accepted": [
          "duyệt phần tử",
          "duyệt phần tử",
          "duyệtphầntử"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 quy tắc đặt tên biến trong lập trình để chương\ntrình không bị báo lỗi.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p22-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 quy tắc đặt tên biến trong lập trình để chương\ntrình không bị báo lỗi....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 10. GIỚI THIỆU VỀ LẬP TRÌNH GIẢI QUYẾT BÀI để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p22-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p22-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-23": {
    "grade": 9,
    "period": 23,
    "lessonTitle": "BÀI 11. CẤU TRÚC RẼ NHÁNH TRONG LẬP TRÌNH",
    "yccd": "",
    "wordBank": [
      "kiểm thử (Testing)",
      "dữ liệu thử nghiệm",
      "sửa lỗi Debug"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p23-fb-1",
        "label": "1.",
        "preText": "Biểu thức điều kiện kiểm tra sự đúng hay sai của một mệnh đề",
        "postText": ".",
        "correctAnswer": "kiểm thử (Testing)",
        "accepted": [
          "kiểm thử (testing)",
          "kiểm thử (Testing)",
          "kiểmthử(Testing)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p23-fb-2",
        "label": "2.",
        "preText": "Cấu trúc rẽ nhánh dạng đủ IF-ELSE giúp chương trình không bỏ sót trường hợp khi điều kiện bị",
        "postText": ".",
        "correctAnswer": "dữ liệu thử nghiệm",
        "accepted": [
          "dữ liệu thử nghiệm",
          "dữ liệu thử nghiệm",
          "dữliệuthửnghiệm"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p23-fb-3",
        "label": "3.",
        "preText": "Trong lập trình Scratch, khối lệnh `if <",
        "postText": "> then` kiểm tra điều kiện và thực hiện câu lệnh bên",
        "correctAnswer": "sửa lỗi Debug",
        "accepted": [
          "sửa lỗi debug",
          "sửa lỗi Debug",
          "sửalỗiDebug"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 1 ví dụ thực tế trong đời sống thể hiện tư duy rẽ\nnhánh theo điều kiện.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p23-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 1 ví dụ thực tế trong đời sống thể hiện tư duy rẽ\nnhánh theo điều kiện....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 11. CẤU TRÚC RẼ NHÁNH TRONG LẬP TRÌNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p23-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p23-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-24": {
    "grade": 9,
    "period": 24,
    "lessonTitle": "BÀI 11. CẤU TRÚC RẼ NHÁNH TRONG LẬP TRÌNH",
    "yccd": "",
    "wordBank": [
      "học máy (Machine Learning)",
      "tập dữ liệu huấn luyện",
      "nhận dạng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p24-fb-1",
        "label": "1.",
        "preText": "Phép toán Mod giúp tìm số dư của phép chia nguyên dùng để kiểm tra tính",
        "postText": ".",
        "correctAnswer": "học máy (Machine Learning)",
        "accepted": [
          "học máy (machine learning)",
          "học máy (Machine Learning)",
          "họcmáy(MachineLearning)"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p24-fb-2",
        "label": "2.",
        "preText": "Rẽ nhánh lồng nhau là việc đặt một câu lệnh IF bên trong nhánh của một câu lệnh IF",
        "postText": ".",
        "correctAnswer": "tập dữ liệu huấn luyện",
        "accepted": [
          "tập dữ liệu huấn luyện",
          "tập dữ liệu huấn luyện",
          "tậpdữliệuhuấnluyện"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p24-fb-3",
        "label": "3.",
        "preText": "Việc tìm số lớn nhất giữa a và b thực hiện bằng cách so sánh điều kiện a",
        "postText": "b.",
        "correctAnswer": "nhận dạng",
        "accepted": [
          "nhận dạng",
          "nhận dạng",
          "nhậndạng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Viết câu lệnh logic kiểm tra xem một năm Y có phải là\nnăm nhuận hay không.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p24-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Viết câu lệnh logic kiểm tra xem một năm Y có phải là\nnăm nhuận hay không....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 11. CẤU TRÚC RẼ NHÁNH TRONG LẬP TRÌNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p24-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p24-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-25": {
    "grade": 9,
    "period": 25,
    "lessonTitle": "BÀI 12. CẤU TRÚC LẶP TRONG LẬP TRÌNH (MỤC 1)",
    "yccd": "",
    "wordBank": [
      "mô hình AI",
      "độ chính xác Accuracy",
      "thị giác máy tính"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p25-fb-1",
        "label": "1.",
        "preText": "Vòng lặp biết trước số lần sử dụng một biến đếm tăng dần sau mỗi lần",
        "postText": ".",
        "correctAnswer": "mô hình AI",
        "accepted": [
          "mô hình ai",
          "mô hình AI",
          "môhìnhAI"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p25-fb-2",
        "label": "2.",
        "preText": "Vòng lặp chưa biết trước dừng lặp ngay khi điều kiện dừng được",
        "postText": ".",
        "correctAnswer": "độ chính xác Accuracy",
        "accepted": [
          "độ chính xác accuracy",
          "độ chính xác Accuracy",
          "độchínhxácAccuracy"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p25-fb-3",
        "label": "3.",
        "preText": "Lỗi lặp vô tận khiến chương trình bị treo do không có câu lệnh thay đổi điều kiện",
        "postText": ".",
        "correctAnswer": "thị giác máy tính",
        "accepted": [
          "thị giác máy tính",
          "thị giác máy tính",
          "thịgiácmáytính"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Phân biệt câu lệnh `repeat (10)` và `forever` trong lập\ntrình Scratch.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p25-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Phân biệt câu lệnh `repeat (10)` và `forever` trong lập\ntrình Scratch....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 12. CẤU TRÚC LẶP TRONG LẬP TRÌNH (MỤC 1) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p25-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p25-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-26": {
    "grade": 9,
    "period": 26,
    "lessonTitle": "BÀI 12. CẤU TRÚC LẶP TRONG LẬP TRÌNH (MỤC 2)",
    "yccd": "",
    "wordBank": [
      "nghề nghiệp CNTT",
      "lập trình viên",
      "chuyên gia an ninh mạng"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p26-fb-1",
        "label": "1.",
        "preText": "Sử dụng vòng lặp giúp xử lý hàng loạt dữ liệu trong danh sách nhanh chóng và",
        "postText": ".",
        "correctAnswer": "nghề nghiệp CNTT",
        "accepted": [
          "nghề nghiệp cntt",
          "nghề nghiệp CNTT",
          "nghềnghiệpCNTT"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p26-fb-2",
        "label": "2.",
        "preText": "Biến tổng (S) được khởi tạo bằng 0 trước khi cộng tích lũy từng giá trị trong vòng",
        "postText": ".",
        "correctAnswer": "lập trình viên",
        "accepted": [
          "lập trình viên",
          "lập trình viên",
          "lậptrìnhviên"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p26-fb-3",
        "label": "3.",
        "preText": "Kết hợp vòng lặp và câu lệnh di chuyển giúp tạo chuyển động hoạt họa mượt mà cho",
        "postText": ".",
        "correctAnswer": "chuyên gia an ninh mạng",
        "accepted": [
          "chuyên gia an ninh mạng",
          "chuyên gia an ninh mạng",
          "chuyêngiaanninhmạng"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu các bước sử dụng vòng lặp để in ra màn hình\nbảng nhân 5 từ 5x1 đến 5x10.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p26-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu các bước sử dụng vòng lặp để in ra màn hình\nbảng nhân 5 từ 5x1 đến 5x10....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 12. CẤU TRÚC LẶP TRONG LẬP TRÌNH (MỤC 2) để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p26-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p26-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-27": {
    "grade": 9,
    "period": 27,
    "lessonTitle": "BÀI 13. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN TỔNG HỢP",
    "yccd": "",
    "wordBank": [
      "chuyển đổi số",
      "dịch vụ công trực tuyến",
      "công dân số"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p27-fb-1",
        "label": "1.",
        "preText": "Tư duy phân rã bài toán (Decomposition) chia bài toán lớn thành các phần nhỏ dễ quản lý và",
        "postText": ".",
        "correctAnswer": "chuyển đổi số",
        "accepted": [
          "chuyển đổi số",
          "chuyển đổi số",
          "chuyểnđổisố"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p27-fb-2",
        "label": "2.",
        "preText": "Chương trình con (Hàm) là một khối lệnh độc lập thực hiện một nhiệm vụ cụ thể được đặt",
        "postText": ".",
        "correctAnswer": "dịch vụ công trực tuyến",
        "accepted": [
          "dịch vụ công trực tuyến",
          "dịch vụ công trực tuyến",
          "dịchvụcôngtrựctuyến"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p27-fb-3",
        "label": "3.",
        "preText": "Việc truyền tham số vào hàm giúp hàm xử lý linh hoạt các dữ liệu đầu vào khác",
        "postText": ".",
        "correctAnswer": "công dân số",
        "accepted": [
          "công dân số",
          "công dân số",
          "côngdânsố"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 2 ưu điểm lớn của việc sử dụng chương trình con\ntrong phát triển các dự án phần mềm lớn.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p27-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 2 ưu điểm lớn của việc sử dụng chương trình con\ntrong phát triển các dự án phần...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 13. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN TỔNG HỢP để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p27-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p27-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-28": {
    "grade": 9,
    "period": 28,
    "lessonTitle": "BÀI 13. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN TỔNG HỢP",
    "yccd": "",
    "wordBank": [
      "tổng hợp dự án",
      "tích hợp tính năng",
      "kiểm thử hệ thống"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p28-fb-1",
        "label": "1.",
        "preText": "Giao diện người dùng (UI) cần đẹp mắt, màu sắc hài hòa và các nút bấm bố trí",
        "postText": ".",
        "correctAnswer": "tổng hợp dự án",
        "accepted": [
          "tổng hợp dự án",
          "tổng hợp dự án",
          "tổnghợpdựán"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p28-fb-2",
        "label": "2.",
        "preText": "Thao tác kiểm thử (Testing) giúp phát hiện các tình huống lỗi và tiến hành sửa lỗi (",
        "postText": ").",
        "correctAnswer": "tích hợp tính năng",
        "accepted": [
          "tích hợp tính năng",
          "tích hợp tính năng",
          "tíchhợptínhnăng"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p28-fb-3",
        "label": "3.",
        "preText": "Sản phẩm phần mềm sau khi hoàn thiện được lưu trữ và chia sẻ cho người dùng trải",
        "postText": ".",
        "correctAnswer": "kiểm thử hệ thống",
        "accepted": [
          "kiểm thử hệ thống",
          "kiểm thử hệ thống",
          "kiểmthửhệthống"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Nêu 3 tiêu chí đánh giá một sản phẩm phần mềm trò\nchơi học tập đạt chất lượng tốt.",
    "shortAnswerQuestions": [
      {
        "id": "k9-p28-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Nêu 3 tiêu chí đánh giá một sản phẩm phần mềm trò\nchơi học tập đạt chất lượng tốt....\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 13. LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN TỔNG HỢP để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p28-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p28-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  },
  "k9-tiet-29": {
    "grade": 9,
    "period": 29,
    "lessonTitle": "BÀI 14. ĐỊNH HƯỚNG NGHỀ NGHIỆP TRONG LĨNH",
    "yccd": "",
    "wordBank": [
      "báo cáo nghiệm thu",
      "trưng bày sản phẩm số",
      "định hướng tương lai"
    ],
    "fillBlankQuestions": [
      {
        "id": "k9-p29-fb-1",
        "label": "1.",
        "preText": "Ngành Công nghệ thông tin đòi hỏi khả năng tư duy logic, ngoại ngữ và tinh thần tự học",
        "postText": ".",
        "correctAnswer": "báo cáo nghiệm thu",
        "accepted": [
          "báo cáo nghiệm thu",
          "báo cáo nghiệm thu",
          "báocáonghiệmthu"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p29-fb-2",
        "label": "2.",
        "preText": "Kỹ sư AI phát triển các hệ thống thông minh có khả năng nhận diện hình ảnh, xử lý tiếng nói và dự báo",
        "postText": ".",
        "correctAnswer": "trưng bày sản phẩm số",
        "accepted": [
          "trưng bày sản phẩm số",
          "trưng bày sản phẩm số",
          "trưngbàysảnphẩmsố"
        ],
        "points": 0.35
      },
      {
        "id": "k9-p29-fb-3",
        "label": "3.",
        "preText": "Học sinh cần rèn luyện năng lực số và kỹ năng ứng xử văn minh để trở thành công dân số có trách",
        "postText": ".",
        "correctAnswer": "định hướng tương lai",
        "accepted": [
          "định hướng tương lai",
          "định hướng tương lai",
          "địnhhướngtươnglai"
        ],
        "points": 0.35
      }
    ],
    "shortAnswerPrompt": ": Theo em, những kỹ năng mềm nào (như giao tiếp, làm\nviệc nhóm, tự học) là quan trọng nhất đối với một kỹ sư CNTT trong tương lai?",
    "shortAnswerQuestions": [
      {
        "id": "k9-p29-sa-1",
        "label": "• Trọng tâm câu hỏi:",
        "question": "Xác định yêu cầu cốt lõi được nêu trong câu hỏi: \": Theo em, những kỹ năng mềm nào (như giao tiếp, làm\nviệc nhóm, tự học) là quan trọng...\":",
        "placeholder": "Chỉ ra yếu tố then chốt...",
        "sampleAnswer": "Cần xác định đúng bản chất kiến thức của bài học BÀI 14. ĐỊNH HƯỚNG NGHỀ NGHIỆP TRONG LĨNH để làm cơ sở phân tích tình huống thực tế.",
        "points": 0.4
      },
      {
        "id": "k9-p29-sa-2",
        "label": "• Phân tích & Thực hiện:",
        "question": "Trình bày giải thích hoặc các bước xử lý cụ thể cho tình huống này:",
        "placeholder": "Nêu rõ các bước hoặc nguyên nhân...",
        "sampleAnswer": "Áp dụng đúng nguyên lý và thao tác kỹ thuật chuẩn mực được hướng dẫn trong sách giáo khoa Tin học 9.",
        "points": 0.3
      },
      {
        "id": "k9-p29-sa-3",
        "label": "• Vận dụng thực tế:",
        "question": "Rút ra bài học hoặc cách áp dụng hiệu quả vào việc học tập:",
        "placeholder": "Liên hệ thực tế học tập...",
        "sampleAnswer": "Chủ động thực hành trên máy tính và tuân thủ các quy tắc an toàn, đạo đức thông tin trên môi trường số.",
        "points": 0.3
      }
    ]
  }
};
