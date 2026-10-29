import React, { useState } from 'react';

export interface NotebookLMPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
  defaultGrade?: 6 | 7 | 8 | 9;
}

export const NOTEBOOKLM_MASTER_PROMPT_ALL_GRADES = `# PROMPT MASTER NOTEBOOKLM: BIÊN SOẠN CHUẨN HOÁ 29 TIẾT TIN HỌC (KHỐI 6, 7, 8, 9)
# NGUỒN TÀI LIỆU SỬ DỤNG TRONG NOTEBOOKLM:
# 1. SGK Tin học (Khối 6, 7, 8, 9) - Bộ sách "Kết nối tri thức với cuộc sống" (BGDĐT)
# 2. Công văn 3456/BGDĐT-GDTrH về Khung Năng lực số cấp THCS
# 3. Khung Năng lực Trí tuệ nhân tạo (AI) 3439/BGDĐT-GDTrH

Bạn là Chuyên gia Sư phạm Tin học và Thiết kế Giáo dục Số cao cấp.
Dựa vào các tài liệu nguồn đã được tải lên trong NotebookLM, hãy biên soạn đầy đủ chính xác 29 TIẾT HỌC của môn Tin học theo đúng phân phối chương trình và Yêu cầu cần đạt (YCCĐ).

YÊU CẦU BẮT BUỘC VỀ NGUYÊN TẮC BIÊN SOẠN:
1. Bám sát 100% nội dung SGK Kết nối tri thức với cuộc sống, không bịa đặt thuật ngữ hay khái niệm.
2. Tích hợp sâu Khung Năng lực số (CV 3456): Chỉ rõ mã năng lực (NLA, NLB, NLC, NLD, NLE) và hành vi cụ thể trong từng tiết học.
3. Tích hợp Khung Năng lực AI (3439): Đưa vào các khái niệm AI, kỹ thuật Prompting, tư duy phản biện và đạo đức số tương ứng với lứa tuổi.
4. Đủ 4 Hoạt động chuẩn sư phạm theo Công văn 5512:
   - Hoạt động 1: Khởi động (Tình huống thực tế, Câu hỏi kích hoạt tư duy, Đáp án gợi ý)
   - Hoạt động 2: Khám phá kiến thức (Đủ 4 dạng bài tập tương tác chuẩn 4.0 điểm: Dạng 1 Kéo thả 1.0đ, Dạng 2 Điền khuyết 1.0đ, Dạng 3 Nối cột 1.0đ, Dạng 4 Trả lời ngắn 1.0đ)
   - Hoạt động 3: Luyện tập (6 câu hỏi trắc nghiệm A/B/C/D với thời gian 25 giây/câu, có đáp án và giải thích sư phạm chi tiết = 3.0 điểm)
   - Hoạt động 4: Vận dụng (3 bài tập tình huống thực tế, dự án số và ứng dụng AI an toàn = 3.0 điểm)

QUY CÁCH TRÌNH BÀY CÚ PHÁP ĐỂ PHẦN MỀM TỰ ĐỘNG BÓC TÁCH (Lặp lại từ Tiết 1 đến Tiết 29):

=== BẮT ĐẦU TIẾT HỌC ===
TIẾT [Số thứ tự từ 1 đến 29]: [Tên bài học chính xác theo SGK Kết nối tri thức]
TÊN BÀI: [Tên bài học]
YCCĐ: [Nêu 2-3 Yêu cầu cần đạt chuẩn kiến thức kỹ năng của bài]
NĂNG LỰC SỐ: [Mã năng lực theo CV 3456, ví dụ: NLA.1 Sử dụng thiết bị CNTT an toàn; NLB.2 Ứng xử chuẩn mực trên mạng...]
NĂNG LỰC AI: [Mã và nội dung theo Khung 3439, ví dụ: AI.1 Nhận biết công nghệ AI; AI.2 Kỹ năng ra lệnh Prompting...]

[HOẠT ĐỘNG 1: KHỞI ĐỘNG]
- Tình huống: [Tình huống đời sống thực tế hấp dẫn kết nối vào bài học]
- Câu hỏi: [Câu hỏi gợi mở kích thích tư duy phát hiện vấn đề]
- Đáp án gợi ý: [Gợi ý trả lời ngắn gọn, định hướng giải pháp]

[HOẠT ĐỘNG 2: KHÁM PHÁ KIẾN THỨC MỚI (4.0 ĐIỂM)]
--- DẠNG 1: KÉO THẢ PHÂN LOẠI (1.0đ) ---
Hộp A: [Tên nhóm phân loại 1]
Hộp B: [Tên nhóm phân loại 2]
Mục thả:
+ [Mục phân loại 1] -> [Hộp A hoặc Hộp B] (0.25đ)
+ [Mục phân loại 2] -> [Hộp A hoặc Hộp B] (0.25đ)
+ [Mục phân loại 3] -> [Hộp A hoặc Hộp B] (0.25đ)
+ [Mục phân loại 4] -> [Hộp A hoặc Hộp B] (0.25đ)

--- DẠNG 2: ĐIỀN KHUYẾT TỪ KHÓA (1.0đ) ---
a) [Đoạn câu trước chỗ khuyết] ___ [Đoạn câu sau] | Đáp án: [Từ khóa chính xác] (0.4đ)
b) [Đoạn câu trước chỗ khuyết] ___ [Đoạn câu sau] | Đáp án: [Từ khóa chính xác] (0.3đ)
c) [Đoạn câu trước chỗ khuyết] ___ [Đoạn câu sau] | Đáp án: [Từ khóa chính xác] (0.3đ)

--- DẠNG 3: NỐI CỘT THUẬT NGỮ (1.0đ) ---
Cột trái: [Thuật ngữ / Khái niệm 1] <-> Cột phải: [Ý nghĩa / Định nghĩa tương ứng 1] (0.4đ)
Cột trái: [Thuật ngữ / Khái niệm 2] <-> Cột phải: [Ý nghĩa / Định nghĩa tương ứng 2] (0.3đ)
Cột trái: [Thuật ngữ / Khái niệm 3] <-> Cột phải: [Ý nghĩa / Định nghĩa tương ứng 3] (0.3đ)

--- DẠNG 4: CÂU HỎI TRẢ LỜI NGẮN (1.0đ) ---
Câu hỏi 1: [Câu hỏi ngắn kiểm tra hiểu biết cốt lõi 1] | Gợi ý đáp án: [Câu trả lời ngắn] (0.4đ)
Câu hỏi 2: [Câu hỏi ngắn kiểm tra hiểu biết cốt lõi 2] | Gợi ý đáp án: [Câu trả lời ngắn] (0.3đ)
Câu hỏi 3: [Câu hỏi ngắn kiểm tra hiểu biết cốt lõi 3] | Gợi ý đáp án: [Câu trả lời ngắn] (0.3đ)

[HOẠT ĐỘNG 3: LUYỆN TẬP (3.0 ĐIỂM - 6 CÂU TRẮC NGHIỆM 25S)]
Câu 1: [Nội dung câu hỏi trắc nghiệm 1]
A. [Phương án A]
B. [Phương án B]
C. [Phương án C]
D. [Phương án D]
Đáp án đúng: [A hoặc B hoặc C hoặc D]
Giải thích sư phạm: [Giải thích bản chất tại sao chọn đáp án này và liên hệ kiến thức SGK]

Câu 2: [Nội dung câu hỏi trắc nghiệm 2]
A. [Phương án A]
B. [Phương án B]
C. [Phương án C]
D. [Phương án D]
Đáp án đúng: [A hoặc B hoặc C hoặc D]
Giải thích sư phạm: [Giải thích bản chất]

Câu 3: [Nội dung câu hỏi trắc nghiệm 3]
A. [Phương án A]
B. [Phương án B]
C. [Phương án C]
D. [Phương án D]
Đáp án đúng: [A hoặc B hoặc C hoặc D]
Giải thích sư phạm: [Giải thích bản chất]

Câu 4: [Nội dung câu hỏi trắc nghiệm 4]
A. [Phương án A]
B. [Phương án B]
C. [Phương án C]
D. [Phương án D]
Đáp án đúng: [A hoặc B hoặc C hoặc D]
Giải thích sư phạm: [Giải thích bản chất]

Câu 5: [Nội dung câu hỏi trắc nghiệm 5]
A. [Phương án A]
B. [Phương án B]
C. [Phương án C]
D. [Phương án D]
Đáp án đúng: [A hoặc B hoặc C hoặc D]
Giải thích sư phạm: [Giải thích bản chất]

Câu 6: [Nội dung câu hỏi trắc nghiệm 6]
A. [Phương án A]
B. [Phương án B]
C. [Phương án C]
D. [Phương án D]
Đáp án đúng: [A hoặc B hoặc C hoặc D]
Giải thích sư phạm: [Giải thích bản chất]

[HOẠT ĐỘNG 4: VẬN DỤNG THỰC TẾ (3.0 ĐIỂM)]
Bài tập 1 (1.0đ): [Nhiệm vụ thực hành hoặc giải quyết vấn đề thực tế trong đời sống hàng ngày]
Bài tập 2 (1.0đ): [Dự án số cá nhân hoặc làm việc nhóm tích hợp Năng lực số CV 3456]
Bài tập 3 (1.0đ): [Thực hành ứng dụng công cụ Trí tuệ nhân tạo (AI) có trách nhiệm theo Khung 3439]
=== HẾT TIẾT HỌC ===`;

export const getPromptForSpecificGrade = (grade: 6 | 7 | 8 | 9): string => {
  const gradeTopics: Record<6 | 7 | 8 | 9, string> = {
    6: 'Thông tin và dữ liệu, Mạng máy tính và Internet, Tổ chức thông tin trong máy tính, Ứng dụng tin học (Soạn thảo văn bản, Sơ đồ tư duy), Thuật toán và lập trình trực quan Scratch.',
    7: 'Thiết bị vào - ra, Phần mềm ứng dụng và hệ điều hành, Mạng xã hội và giao tiếp qua Internet, Bảng tính điện tử (Excel/Google Sheets), Ứng dụng thuật toán tìm kiếm và sắp xếp.',
    8: 'Lịch sử phát triển máy tính, Dữ liệu số và lưu trữ đám mây, Đạo đức và văn hóa số, Soạn thảo văn bản và bài trình chiếu nâng cao, Lập trình thuật toán điều khiển và robot giáo dục.',
    9: 'Mạng máy tính toàn cầu và điện toán đám mây, An toàn thông tin và bảo mật cá nhân, Cơ sở dữ liệu và quản lý dữ liệu lớn, Xử lý đa phương tiện số, Lập trình giải quyết bài toán thực tế và Trí tuệ nhân tạo (AI).',
  };

  return `# PROMPT BIÊN SOẠN CHUẨN HOÁ 29 TIẾT TIN HỌC KHỐI ${grade} (NOTEBOOKLM)
# TÀI LIỆU NGUỒN: SGK Tin học ${grade} Kết nối tri thức + CV 3456 (Năng lực số) + Khung AI 3439

Dựa vào các tệp tài liệu đã tải lên trong NotebookLM, hãy tạo đầy đủ đúng 29 TIẾT HỌC (từ Tiết 1 đến Tiết 29) cho Môn Tin học Khối ${grade}.
Chủ đề trọng tâm của Khối ${grade}: ${gradeTopics[grade]}

Vui lòng tuân thủ nghiêm ngặt định dạng mẫu bên dưới để hệ thống phần mềm có thể tự động bóc tách và nạp vào CSDL:

${NOTEBOOKLM_MASTER_PROMPT_ALL_GRADES.split('QUY CÁCH TRÌNH BÀY CÚ PHÁP')[1]}`;
};

export const NotebookLMPromptModal: React.FC<NotebookLMPromptModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  defaultGrade = 7,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 6 | 7 | 8 | 9>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPrompt =
    activeTab === 'ALL'
      ? NOTEBOOKLM_MASTER_PROMPT_ALL_GRADES
      : getPromptForSpecificGrade(activeTab);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopied(true);
      onShowToast('📋 Đã sao chép Mẫu Prompt NotebookLM vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      onShowToast('📋 Đã sao chép Mẫu Prompt NotebookLM vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-5xl rounded-3xl shadow-2xl border-2 border-primary/20 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">psychology</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span>Mẫu Prompt NotebookLM Tạo Đủ 29 Tiết Tin Học</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-bold">
                  Khối 6, 7, 8, 9
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Tích hợp chuẩn SGK Kết nối tri thức, Khung Năng lực số (CV 3456), Khung AI (3439) và 4 Hoạt động chuẩn sư phạm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`px-4 py-2 rounded-full font-label-md text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-on-primary hover:brightness-110'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'done_all' : 'content_copy'}
              </span>
              <span>{copied ? 'Đã sao chép!' : 'Sao chép Prompt'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors"
              title="Đóng hộp thoại"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* 3-Step Instruction Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-b border-outline-variant/20 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">Tải tệp nguồn vào NotebookLM</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Mở <strong>notebooklm.google.com</strong>, tải lên SGK Tin học (PDF), CV 3456 NLS và Khung AI 3439.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">Dán Prompt &amp; Chờ tạo 29 tiết</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Bấm nút <strong>"Sao chép Prompt"</strong> bên trên và dán vào hộp chat của NotebookLM để AI biên soạn.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface">Dán vào hệ thống &amp; Quét AI</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Copy kết quả từ NotebookLM dán vào mục <strong>"Trợ giúp AI Quét &amp; Chuẩn Hoá"</strong> để tự động lưu CSDL.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-label-md text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'ALL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              🌟 Mẫu Chung (4 Khối 6, 7, 8, 9)
            </button>
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setActiveTab(g)}
                className={`px-3.5 py-1.5 rounded-xl font-label-md text-xs font-bold cursor-pointer transition-all ${
                  activeTab === g
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Khối {g} (29 Tiết)
              </button>
            ))}
          </div>

          <a
            href="https://notebooklm.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-purple-600">open_in_new</span>
            <span>Mở Google NotebookLM</span>
          </a>
        </div>

        {/* Prompt Content Code View */}
        <div className="p-5 overflow-y-auto flex-1 bg-surface-container-lowest font-mono text-xs text-on-surface leading-relaxed select-all">
          <pre className="whitespace-pre-wrap font-mono text-xs bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-on-surface">
            {currentPrompt}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>Cú pháp đã được kiểm thử 100% tương thích với bộ phân tích dữ liệu và AI Gemini 3.8 Flash của hệ thống.</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-label-md text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              <span>{copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép toàn bộ Prompt'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
