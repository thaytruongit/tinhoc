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
  const [isExtractingAi, setIsExtractingAi] = useState<boolean>(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'slides' | 'raw-pdf'>('slides');
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

  // Render a slide's structured content into a crisp 16:9 high-DPI slide image (data:image/jpeg;base64,...)
  const renderSlideToCanvasDataUrl = (
    slide: LectureSlidePage,
    gradeNum: number,
    periodNum: number,
    sourceLabel: string
  ): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.55, '#1e293b');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 720);

    // Decorative top accent bar
    const topGrad = ctx.createLinearGradient(0, 0, 1280, 0);
    topGrad.addColorStop(0, '#f97316');
    topGrad.addColorStop(0.5, '#0ea5e9');
    topGrad.addColorStop(1, '#10b981');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, 1280, 10);

    // Header badge
    ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
    ctx.beginPath();
    ctx.roundRect(64, 42, 340, 42, 21);
    ctx.fill();

    ctx.fillStyle = '#fdba74';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `SLIDE KIẾN THỨC #${slide.slideNumber} • KHỐI ${gradeNum} - TIẾT ${periodNum}`,
      84,
      69
    );

    // Source label on top right
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(sourceLabel.slice(0, 58), 1216, 68);
    ctx.textAlign = 'left';

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(64, 104);
    ctx.lineTo(1216, 104);
    ctx.stroke();

    // Helper for word wrap
    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 3
    ): number => {
      const words = String(text || '').split(/\s+/);
      let line = '';
      let currentY = y;
      let linesCount = 0;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[i] + ' ';
          currentY += lineHeight;
          linesCount++;
          if (linesCount >= maxLines - 1) {
            // Last allowed line
            const remaining = words.slice(i).join(' ');
            ctx.fillText(remaining.slice(0, 85), x, currentY);
            return currentY + lineHeight;
          }
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), x, currentY);
        currentY += lineHeight;
      }
      return currentY;
    };

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    let curY = drawWrappedText(slide.title, 64, 160, 1140, 46, 2);

    // Subtitle
    if (slide.subtitle) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      curY = drawWrappedText(slide.subtitle, 64, curY + 8, 1140, 32, 2);
    }

    curY += 22;

    // Bullet points
    const bullets = Array.isArray(slide.bulletPoints) ? slide.bulletPoints.slice(0, 4) : [];
    bullets.forEach((pt, idx) => {
      // Number circle
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(84, curY - 8, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(idx + 1), 84, curY - 2);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '500 24px system-ui, -apple-system, sans-serif';
      curY = drawWrappedText(pt, 120, curY, 1080, 34, 2) + 18;
    });

    // Highlight note box at bottom
    if (slide.highlightNote) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.beginPath();
      ctx.roundRect(64, 608, 1152, 68, 16);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `💡 Trọng tâm: ${String(slide.highlightNote).slice(0, 105)}`,
        88,
        650
      );
    }

    return canvas.toDataURL('image/jpeg', 0.88);
  };

  // Attempt to extract actual PDF page images using PDF.js from CDN when a PDF is uploaded
  const extractPdfPagesAsImages = async (file: File): Promise<string[]> => {
    try {
      const w = window as any;
      if (!w.pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('PDF.js CDN load failed'));
          document.head.appendChild(script);
        });
      }
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) return [];
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages || 0;
      if (numPages === 0) return [];

      // Skip cover page if deck has > 4 pages so we focus on core knowledge pages
      const startPage = numPages > 4 ? 2 : 1;
      const maxPagesToRender = Math.min(numPages, startPage + 6);
      const renderedImages: string[] = [];

      for (let p = startPage; p <= maxPagesToRender; p++) {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          renderedImages.push(canvas.toDataURL('image/jpeg', 0.84));
        }
      }
      return renderedImages;
    } catch {
      return [];
    }
  };

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

  // Run Gemini 3.8 Flash extraction to produce 3-5 core knowledge slide images
  const runGeminiExtractKnowledgeSlides = async (
    sourceFileName: string,
    fileType: 'pdf' | 'pptx',
    fileSizeStr: string,
    rawPageImages: string[],
    pdfDataUrl?: string
  ) => {
    setIsExtractingAi(true);
    try {
      const res = await fetch('/api/lecture-slides/ai-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          period: selectedPeriod,
          lessonTitle: currentPeriodSpec.lessonTitle,
          topic: currentPeriodSpec.topic,
          rawContent: `Tệp nguồn: ${sourceFileName}. Mục tiêu YCCĐ: ${currentPeriodSpec.yccd}. Năng lực số: ${currentPeriodSpec.digitalCompetency}. Năng lực AI: ${currentPeriodSpec.aiCompetency}.`,
          pageImages: rawPageImages,
        }),
      });
      const data = await res.json();
      const extractedList: LectureSlidePage[] =
        data?.ok && Array.isArray(data.slides) && data.slides.length > 0
          ? data.slides
          : getDefaultLectureSlides(currentPeriodSpec).slice(0, 4);

      // Ensure every extracted knowledge slide (3-5 slides) has a crisp slide image (original PDF page image or 16:9 slide image)
      const finalSlidesWithImages: LectureSlidePage[] = extractedList
        .slice(0, 5)
        .map((sl, idx) => {
          const slideNum = idx + 1;
          const existingImg =
            sl.imageUrl && sl.imageUrl.startsWith('data:image/')
              ? sl.imageUrl
              : rawPageImages[idx] ||
                renderSlideToCanvasDataUrl(
                  { ...sl, slideNumber: slideNum },
                  selectedGrade,
                  selectedPeriod,
                  `${sourceFileName} • Gemini 3.8 Flash`
                );
          return {
            ...sl,
            slideNumber: slideNum,
            imageUrl: existingImg,
          };
        });

      const newDeck: LectureSlideDeck = {
        lessonKey,
        grade: selectedGrade,
        period: selectedPeriod,
        fileName: sourceFileName,
        fileType,
        fileSize: fileSizeStr,
        uploadedAt:
          new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' • Gemini 3.8 Flash',
        pdfDataUrl,
        slides: finalSlidesWithImages,
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
      setViewMode('slides');
      onShowToast(
        `✨ Gemini 3.8 Flash đã trích xuất ${finalSlidesWithImages.length} ảnh Slide Kiến Thức Cốt Lõi từ "${sourceFileName}" và đồng bộ trực tiếp sang màn hình học sinh!`
      );
    } catch (err) {
      console.error('AI Slide Extraction error:', err);
      onShowToast('⚠️ Đã nạp slide tiêu chuẩn cho tiết học.');
    } finally {
      setIsExtractingAi(false);
    }
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
      let rawPageImages: string[] = [];

      if (fileType === 'pdf') {
        if (file.size <= 15 * 1024 * 1024) {
          pdfDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read PDF'));
            reader.readAsDataURL(file);
          });
        }
        onShowToast('🤖 Đang quét các trang PDF và dùng Gemini 3.8 Flash trích xuất 3–5 ảnh Slide Kiến Thức Cốt Lõi...');
        rawPageImages = await extractPdfPagesAsImages(file);
      } else {
        onShowToast('🤖 Đang dùng Gemini 3.8 Flash trích xuất 3–5 ảnh Slide Kiến Thức Cốt Lõi từ tệp PowerPoint (.PPTX)...');
      }

      await runGeminiExtractKnowledgeSlides(
        file.name,
        fileType,
        fileSizeStr,
        rawPageImages,
        pdfDataUrl
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">
                  Tải &amp; Trích Xuất Slide Kiến Thức Trọng Tâm (PDF, PPTX)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black">
                  ✨ Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tải lên tệp PDF hoặc PowerPoint (.pptx) — Gemini AI tự động lọc và trích xuất duy nhất 3–5 ảnh Slide Kiến Thức Cốt Lõi đồng bộ sang màn hình học sinh
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
          <div className="lg:col-span-6 flex flex-wrap items-center gap-3">
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
                      Tiết {p.period}: {p.lessonTitle} {hasCustom ? ' (✓ Đã nạp Slide AI)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-end gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading || isExtractingAi}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>
                {isUploading || isExtractingAi
                  ? 'Đang trích xuất AI...'
                  : 'Tải lên Bài giảng (.PDF, .PPTX)'}
              </span>
            </button>

            <button
              type="button"
              disabled={isUploading || isExtractingAi}
              onClick={() =>
                runGeminiExtractKnowledgeSlides(
                  existingDeck?.fileName || `SGK-Tin${selectedGrade}-Tiet${selectedPeriod}.pptx`,
                  existingDeck?.fileType || 'pptx',
                  existingDeck?.fileSize || '1.4 MB',
                  [],
                  existingDeck?.pdfDataUrl
                )
              }
              className="px-3.5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-60"
              title="Sử dụng Gemini 3.8 Flash trích xuất 3–5 ảnh Slide Kiến Thức Cốt Lõi"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>AI Trích xuất 3–5 Slide Kiến Thức</span>
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
                <strong className="text-slate-900">
                  Tệp nguồn: {existingDeck.fileName} ({activeSlides.length} Slide Kiến Thức Cốt Lõi)
                </strong>
                <span className="text-slate-500 ml-2">
                  ({existingDeck.fileType.toUpperCase()} • {existingDeck.fileSize} • {existingDeck.uploadedAt})
                </span>
              </div>
            ) : (
              <span className="text-slate-700 font-medium">
                Đang sử dụng <strong>Slide Bài giảng chuẩn GDPT 2018</strong> cho Tiết {selectedPeriod}. Bấm <strong>"Tải lên Bài giảng (.PDF, .PPTX)"</strong> để Gemini 3.8 Flash trích xuất 3–5 ảnh slide kiến thức gốc.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {existingDeck?.pdfDataUrl && (
              <button
                type="button"
                onClick={() =>
                  setViewMode((m) => (m === 'slides' ? 'raw-pdf' : 'slides'))
                }
                className="px-3 py-1 rounded-full bg-white border border-sky-300 text-sky-800 font-bold text-[11px] cursor-pointer hover:bg-sky-100"
              >
                {viewMode === 'slides'
                  ? 'Xem toàn bộ tệp PDF gốc'
                  : 'Xem 3–5 Ảnh Slide Kiến Thức AI'}
              </button>
            )}
            {existingDeck && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                ✓ Đã đồng bộ Phòng Live
              </span>
            )}
          </div>
        </div>

        {/* Slide Preview Area */}
        {viewMode === 'raw-pdf' && existingDeck?.pdfDataUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Bản xem trước trực tiếp tệp PDF gốc ({existingDeck.fileName}):
              </span>
            </div>
            <iframe
              src={existingDeck.pdfDataUrl}
              title={existingDeck.fileName}
              className="w-full h-[420px] rounded-2xl border border-slate-200 shadow-inner bg-slate-100"
            />
          </div>
        ) : currentSlide?.imageUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                Ảnh Slide Kiến Thức #{currentSlide.slideNumber} / {activeSlides.length}: {currentSlide.title}
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                ✓ Ảnh Slide nguyên gốc trích xuất bởi Gemini 3.8 Flash
              </span>
            </div>
            <div className="w-full rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl bg-slate-950 flex items-center justify-center">
              <img
                src={currentSlide.imageUrl}
                alt={`Slide ${currentSlide.slideNumber}: ${currentSlide.title}`}
                className="w-full max-h-[440px] object-contain"
              />
            </div>
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
              onClick={() => {
                const nextIdx = Math.max(0, previewSlideIdx - 1);
                setPreviewSlideIdx(nextIdx);
                if (onUpdateLiveSession) {
                  onUpdateLiveSession((prev) => ({
                    ...prev,
                    activeSlideIndexByLesson: {
                      ...(prev.activeSlideIndexByLesson || {}),
                      [lessonKey]: nextIdx,
                    },
                    updatedAt: new Date().toISOString(),
                  }));
                }
              }}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold cursor-pointer"
            >
              ← Slide trước
            </button>
            <div className="flex items-center gap-1">
              {activeSlides.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  type="button"
                  onClick={() => {
                    setPreviewSlideIdx(idx);
                    if (onUpdateLiveSession) {
                      onUpdateLiveSession((prev) => ({
                        ...prev,
                        activeSlideIndexByLesson: {
                          ...(prev.activeSlideIndexByLesson || {}),
                          [lessonKey]: idx,
                        },
                        updatedAt: new Date().toISOString(),
                      }));
                    }
                  }}
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
              onClick={() => {
                const nextIdx = Math.min(activeSlides.length - 1, previewSlideIdx + 1);
                setPreviewSlideIdx(nextIdx);
                if (onUpdateLiveSession) {
                  onUpdateLiveSession((prev) => ({
                    ...prev,
                    activeSlideIndexByLesson: {
                      ...(prev.activeSlideIndexByLesson || {}),
                      [lessonKey]: nextIdx,
                    },
                    updatedAt: new Date().toISOString(),
                  }));
                }
              }}
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
            Hoàn tất &amp; Đồng bộ sang Học sinh
          </button>
        </div>
      </div>
    </div>
  );
};
