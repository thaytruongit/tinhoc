import React, { useState, useRef } from 'react';
import {
  type CurriculumPeriodSpec,
  type LectureSlideDeck,
  type LectureSlidePage,
  type LiveClassroomSession,
  getPeriodsForGrade,
} from '../data/mockCurriculumData';

export function getDefaultLectureSlides(periodSpec: CurriculumPeriodSpec): LectureSlidePage[] {
  return [
    {
      slideNumber: 1,
      title: `Khối ${periodSpec.grade} • Tiết ${periodSpec.period}: ${periodSpec.lessonTitle}`,
      subtitle: `${periodSpec.topic} — ${periodSpec.knowledgeSection}`,
      bulletPoints: [
        `Mục tiêu cần đạt (YCCĐ): ${periodSpec.yccd}`,
        `Năng lực số (CV 3456): ${periodSpec.digitalCompetency}`,
        `Năng lực AI (QĐ 3439): ${periodSpec.aiCompetency}`,
      ],
      highlightNote: 'Bài giảng điện tử đồng bộ thời gian thực giữa Giáo viên và Học sinh.',
    },
    {
      slideNumber: 2,
      title: '1. Tình huống Khởi động & Đặt vấn đề',
      subtitle: 'Hoạt động 1: Khơi gợi tò mò khoa học',
      bulletPoints: [
        `Bối cảnh thực tiễn liên quan đến bài học "${periodSpec.lessonTitle}".`,
        'Quan sát dữ liệu ban đầu, phân tích tình huống và thảo luận cùng bạn đồng hành cùng máy.',
        'Rút ra câu hỏi trọng tâm cần giải quyết trong tiết học hôm nay.',
      ],
      highlightNote: 'Thảo luận nhóm đôi 2 phút và gửi từ khóa lên bảng lớp.',
    },
    {
      slideNumber: 3,
      title: '2. Khám phá Kiến thức Trọng tâm',
      subtitle: 'Hoạt động 2: Nội dung cốt lõi chuẩn GDPT 2018',
      bulletPoints: [
        `Kiến thức cốt lõi: ${periodSpec.yccd}`,
        `Phát triển năng lực số: ${periodSpec.digitalCompetency}`,
        'Hoàn thành Phiếu học tập tương tác (Kéo thả, Điền khuyết, Nối cột, Trả lời ngắn - 4.0 điểm).',
      ],
      highlightNote: 'Ghi nhớ từ khóa cốt lõi trước khi bước vào phần Luyện tập.',
    },
    {
      slideNumber: 4,
      title:
        periodSpec.lessonType === 'practice'
          ? '3. Luyện tập & Thực hành Phòng máy'
          : '3. Luyện tập & Đấu trường Phản xạ 25s',
      subtitle:
        periodSpec.lessonType === 'practice'
          ? 'Hoạt động 3: Thực hành trên máy tính & Nộp sản phẩm'
          : 'Hoạt động 3: Củng cố kiến thức qua câu hỏi trắc nghiệm tốc độ',
      bulletPoints: [
        'Tham gia Đấu trường Trắc nghiệm 25s củng cố lý thuyết nhanh.',
        periodSpec.lessonType === 'practice'
          ? 'Thực hành tạo sản phẩm số trên máy tính và nộp tệp bài làm lên thư mục Lớp.'
          : 'Phân tích các phương án gây nhiễu và giải thích vì sao đáp án chính xác.',
      ],
      highlightNote: 'Giáo viên điều khiển Mở / Khóa hoạt động Thực hành trực tiếp từ Phòng Live.',
    },
    {
      slideNumber: 5,
      title: '4. Vận dụng & Mở rộng Thực tiễn',
      subtitle: 'Hoạt động 4: Ứng dụng kiến thức vào đời sống số & AI',
      bulletPoints: [
        `Ứng dụng AI có trách nhiệm: ${periodSpec.aiCompetency}`,
        'Liên hệ giải quyết bài toán thực tế tại gia đình, nhà trường và xã hội.',
        'Tổng kết bài học, vinh danh Bảng xếp hạng Lớp/Khối và mở khóa Tự luyện ở nhà.',
      ],
      highlightNote: 'Hoàn thành 3 nhiệm vụ vận dụng để nhận tối đa điểm thưởng XP & Sao!',
    },
  ];
}

interface LectureSlideManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGrade: 6 | 7 | 8 | 9;
  initialPeriod: number;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onShowToast: (msg: string) => void;
}

export const LectureSlideManagerModal: React.FC<LectureSlideManagerModalProps> = ({
  isOpen,
  onClose,
  initialGrade,
  initialPeriod,
  liveSession,
  onUpdateLiveSession,
  onShowToast,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<6 | 7 | 8 | 9>(initialGrade);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(initialPeriod);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const gradePeriods = getPeriodsForGrade(selectedGrade);
  const currentPeriodSpec =
    gradePeriods.find((p) => p.period === selectedPeriod) || gradePeriods[0];
  const lessonKey = `k${selectedGrade}-tiet-${selectedPeriod}`;

  const existingDeck: LectureSlideDeck | undefined =
    liveSession?.lectureSlidesByLesson?.[lessonKey];
  const activeSlides = existingDeck?.slides || getDefaultLectureSlides(currentPeriodSpec);
  const isSlideUnlockedForStudents = Boolean(
    liveSession?.unlockedSlideDeckByLesson?.[lessonKey]
  );

  const handleToggleSlideUnlock = () => {
    const nextUnlocked = !isSlideUnlockedForStudents;
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        unlockedSlideDeckByLesson: {
          ...(prev.unlockedSlideDeckByLesson || {}),
          [lessonKey]: nextUnlocked,
        },
        updatedAt: new Date().toISOString(),
      }));
    }
    onShowToast(
      nextUnlocked
        ? `🔓 Đã MỞ KHÓA Slide Bài giảng Tiết ${selectedPeriod} (Khối ${selectedGrade}) cho học sinh xem đồng bộ!`
        : `🔒 Đã KHÓA Slide Bài giảng Tiết ${selectedPeriod} (Khối ${selectedGrade}) trên màn hình học sinh!`
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'pptx' && ext !== 'ppt') {
      onShowToast('⚠️ Vui lòng chọn tệp bài giảng định dạng .PDF hoặc .PPTX!');
      return;
    }

    setIsUploading(true);
    try {
      const fileType: 'pdf' | 'pptx' = ext === 'pdf' ? 'pdf' : 'pptx';
      const fileSizeKb = Math.max(1, Math.round(file.size / 1024));
      const fileSizeStr =
        fileSizeKb >= 1024
          ? `${(fileSizeKb / 1024).toFixed(2)} MB`
          : `${fileSizeKb} KB`;

      let pdfDataUrl: string | undefined = undefined;
      if (fileType === 'pdf' && file.size <= 15 * 1024 * 1024) {
        pdfDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Failed to read PDF'));
          reader.readAsDataURL(file);
        });
      }

      // Build customized slides enriched with uploaded file metadata + curriculum structure
      const baseSlides = getDefaultLectureSlides(currentPeriodSpec);
      const uploadedSlides: LectureSlidePage[] = baseSlides.map((sl, idx) =>
        idx === 0
          ? {
              ...sl,
              title: `[Bài giảng ${fileType.toUpperCase()}] ${currentPeriodSpec.lessonTitle}`,
              subtitle: `Tệp nguồn: ${file.name} (${fileSizeStr}) • Khối ${selectedGrade} - Tiết ${selectedPeriod}`,
              highlightNote: `Đã nạp từ tệp ${file.name} — Đồng bộ trình chiếu trực tiếp Giáo viên & Học sinh.`,
            }
          : sl
      );

      const newDeck: LectureSlideDeck = {
        lessonKey,
        grade: selectedGrade,
        period: selectedPeriod,
        fileName: file.name,
        fileType,
        fileSize: fileSizeStr,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' • Hôm nay',
        pdfDataUrl,
        slides: uploadedSlides,
      };

      if (onUpdateLiveSession) {
        onUpdateLiveSession((prev) => ({
          ...prev,
          lectureSlidesByLesson: {
            ...(prev.lectureSlidesByLesson || {}),
            [lessonKey]: newDeck,
          },
          unlockedSlideDeckByLesson: {
            ...(prev.unlockedSlideDeckByLesson || {}),
            [lessonKey]: true,
          },
          activeSlideIndexByLesson: {
            ...(prev.activeSlideIndexByLesson || {}),
            [lessonKey]: 0,
          },
          updatedAt: new Date().toISOString(),
        }));
      }

      setPreviewSlideIdx(0);
      onShowToast(
        `🎉 Đã nạp thành công bài giảng "${file.name}" cho Khối ${selectedGrade} • Tiết ${selectedPeriod} và đồng bộ lên Phòng Live!`
      );
    } catch (err) {
      console.error('Upload lecture slide error:', err);
      onShowToast('⚠️ Không thể đọc tệp bài giảng. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentSlide = activeSlides[previewSlideIdx] || activeSlides[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[28px]">co_present</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Nạp &amp; Quản Lý Bài Giảng Điện Tử (PDF, PPTX)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tải lên tệp bài giảng PDF hoặc PowerPoint (.pptx) cho từng tiết học — Đồng bộ khóa/mở và trình chiếu trực tiếp sang màn hình học sinh
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Grade & Period Selector + Upload Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Chọn Khối:</span>
              {([6, 7, 8, 9] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setSelectedGrade(g);
                    setSelectedPeriod(1);
                    setPreviewSlideIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    selectedGrade === g
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <span className="text-xs font-bold text-slate-600 shrink-0">Tiết:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(Number(e.target.value));
                  setPreviewSlideIdx(0);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {gradePeriods.map((p) => {
                  const k = `k${selectedGrade}-tiet-${p.period}`;
                  const hasCustom = Boolean(liveSession?.lectureSlidesByLesson?.[k]);
                  return (
                    <option key={p.period} value={p.period}>
                      Tiết {p.period}: {p.lessonTitle} {hasCustom ? ' (✓ Đã nạp Slide)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-end gap-2.5 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>{isUploading ? 'Đang nạp tệp...' : 'Tải lên Bài giảng (.PDF, .PPTX)'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSlideUnlock}
              className={`px-3.5 py-2.5 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                isSlideUnlockedForStudents
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSlideUnlockedForStudents ? 'lock_open' : 'lock'}
              </span>
              <span>
                {isSlideUnlockedForStudents ? 'Đang Mở cho HS' : 'Đang Khóa với HS'}
              </span>
            </button>
          </div>
        </div>

        {/* Uploaded File Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600 text-[20px]">
              {existingDeck?.fileType === 'pdf' ? 'picture_as_pdf' : 'slideshow'}
            </span>
            {existingDeck ? (
              <div>
                <strong className="text-slate-900">Tệp đã nạp: {existingDeck.fileName}</strong>
                <span className="text-slate-500 ml-2">
                  ({existingDeck.fileType.toUpperCase()} • {existingDeck.fileSize} • Nạp lúc {existingDeck.uploadedAt})
                </span>
              </div>
            ) : (
              <span className="text-slate-700 font-medium">
                Đang sử dụng <strong>Slide Bài giảng chuẩn GDPT 2018 mặc định</strong> cho Tiết {selectedPeriod}. Bấm <strong>"Tải lên Bài giảng (.PDF, .PPTX)"</strong> để thay thế bằng tệp của Thầy/Cô.
              </span>
            )}
          </div>

          {existingDeck && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              ✓ Đã đồng bộ Phòng Live
            </span>
          )}
        </div>

        {/* Slide Preview Area */}
        {existingDeck?.pdfDataUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Bản xem trước trực tiếp tệp PDF ({existingDeck.fileName}):
              </span>
            </div>
            <iframe
              src={existingDeck.pdfDataUrl}
              title={existingDeck.fileName}
              className="w-full h-[420px] rounded-2xl border border-slate-200 shadow-inner bg-slate-100"
            />
          </div>
        ) : (
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-7 sm:p-10 shadow-xl flex flex-col justify-between min-h-[340px] relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-4">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-bold">
                Slide {currentSlide.slideNumber} / {activeSlides.length}
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                Khối {selectedGrade} • Tiết {selectedPeriod}: {currentPeriodSpec.lessonTitle}
              </span>
            </div>

            <div className="my-6 flex flex-col gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {currentSlide.title}
                </h3>
                {currentSlide.subtitle && (
                  <p className="text-sm text-sky-300 font-semibold mt-1">
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 mt-2">
                {currentSlide.bulletPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-sky-500/30 text-sky-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {currentSlide.highlightNote && (
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-amber-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-300">
                  lightbulb
                </span>
                <span>{currentSlide.highlightNote}</span>
              </div>
            )}
          </div>
        )}

        {/* Slide Pagination Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={previewSlideIdx === 0}
              onClick={() => setPreviewSlideIdx((i) => Math.max(0, i - 1))}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold cursor-pointer"
            >
              ← Slide trước
            </button>
            <div className="flex items-center gap-1">
              {activeSlides.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  type="button"
                  onClick={() => setPreviewSlideIdx(idx)}
                  className={`w-8 h-8 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    previewSlideIdx === idx
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.slideNumber}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={previewSlideIdx >= activeSlides.length - 1}
              onClick={() =>
                setPreviewSlideIdx((i) => Math.min(activeSlides.length - 1, i + 1))
              }
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Slide tiếp →
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            Hoàn tất &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
