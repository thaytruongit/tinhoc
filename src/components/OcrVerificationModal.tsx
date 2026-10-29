import React, { useState } from 'react';
import {
  type CustomLessonWorksheet,
  type CustomDragDropQuestion,
  type CustomFillBlankQuestion,
  type CustomMatchingQuestion,
  type CustomShortAnswerQuestion,
  type DragDropSentenceLine,
  getDefaultWorksheetForLesson,
  getPeriodsForGrade,
} from '../data/mockCurriculumData';
import {
  DragDropActivity,
  FillBlankActivity,
  MatchingActivity,
  ShortAnswerActivity,
  QuizArena25sActivity,
} from './InteractiveActivities';

interface OcrVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: 6 | 7 | 8 | 9;
  period: number;
  initialWorksheet?: CustomLessonWorksheet;
  onApproveAndIngest: (verifiedWorksheet: CustomLessonWorksheet) => Promise<void> | void;
  onShowToast: (msg: string) => void;
}

export const OcrVerificationModal: React.FC<OcrVerificationModalProps> = ({
  isOpen,
  onClose,
  grade,
  period,
  initialWorksheet,
  onApproveAndIngest,
  onShowToast,
}) => {
  // Working draft of the worksheet being inspected and verified
  const [worksheet, setWorksheet] = useState<CustomLessonWorksheet>(() => {
    return initialWorksheet || getDefaultWorksheetForLesson(grade, period);
  });

  // Keep worksheet in sync if props change when opening
  React.useEffect(() => {
    if (isOpen) {
      setWorksheet(initialWorksheet || getDefaultWorksheetForLesson(grade, period));
    }
  }, [isOpen, grade, period, initialWorksheet]);

  // Image viewer state
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>(
    '/assets/aistudio/image_f68f98ff.png'
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [activeHighlightBlock, setActiveHighlightBlock] = useState<
    'all' | 'q1' | 'q2' | 'q3' | 'q4'
  >('all');

  // Review mode inside right pane: 'edit' or 'student-preview'
  const [reviewMode, setReviewMode] = useState<'edit' | 'student-preview'>('edit');
  const [activeStageTab, setActiveStageTab] = useState<1 | 2 | 3 | 4>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student test interaction states for preview mode
  const [testSlots, setTestSlots] = useState<Record<number, string | null>>({});
  const [testFillInputs, setTestFillInputs] = useState<{ a: string; b: string; c: string }>({
    a: '',
    b: '',
    c: '',
  });
  const [testMatchingConnections, setTestMatchingConnections] = useState<Record<string, string>>({});
  const [testShortAnswerInputs, setTestShortAnswerInputs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const periods = getPeriodsForGrade(grade);
  const currentPeriodSpec = periods.find((p) => p.period === period) || periods[0];

  // Calculate points dynamically
  const stage2DragPts = worksheet.stage2.dragDropQuestions.reduce(
    (acc, q) => acc + (Number(q.points) || 0.2),
    0
  );
  const stage2FillPts = worksheet.stage2.fillBlankQuestions.reduce(
    (acc, q) => acc + (Number(q.points) || 0.3),
    0
  );
  const stage2MatchPts = worksheet.stage2.matchingQuestions.reduce(
    (acc, q) => acc + (Number(q.points) || 0.25),
    0
  );
  const stage2ShortPts = worksheet.stage2.shortAnswerQuestions.reduce(
    (acc, q) => acc + (Number(q.points) || 0.3),
    0
  );
  const totalStage2Pts = Number(
    (stage2DragPts + stage2FillPts + stage2MatchPts + stage2ShortPts).toFixed(2)
  );

  const totalStage3Pts = Number(
    worksheet.stage3QuizQuestions
      .reduce((acc, q) => acc + (Number(q.points) || 0.5), 0)
      .toFixed(2)
  );

  const totalStage4Pts = Number(
    (worksheet.stage4?.rubrics || [])
      .reduce((acc, r) => acc + (Number(r.points) || 1.0), 0)
      .toFixed(2)
  );

  const grandTotalPts = Number((totalStage2Pts + totalStage3Pts + totalStage4Pts).toFixed(2));

  // Reset to default authentic OCR blueprint
  const handleResetToOcrDefault = () => {
    const defaultWs = getDefaultWorksheetForLesson(grade, period);
    setWorksheet(defaultWs);
    onShowToast(`Đã khôi phục dữ liệu gốc từ tệp OCR cho Khối ${grade} • Tiết ${period}`);
  };

  // Submit and approve
  const handleApproveAndIngest = async () => {
    setIsSubmitting(true);
    try {
      const finalWorksheet: CustomLessonWorksheet = {
        ...worksheet,
        ingestedAt: new Date().toLocaleTimeString('vi-VN') + ' • Đã kiểm duyệt OCR',
      };
      await onApproveAndIngest(finalWorksheet);
      onShowToast(
        `✅ Phê duyệt thành công! Toàn bộ phiếu học tập Khối ${grade} • Tiết ${period} đã được nạp vào Database!`
      );
      onClose();
    } catch {
      onShowToast('Có lỗi xảy ra khi lưu vào database. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="bg-surface-container-lowest w-full max-w-[98vw] xl:max-w-[1550px] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-outline-variant/30 overflow-hidden">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-3.5 bg-surface-container border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-xs">
                  KIỂM DUYỆT ĐỐI CHIẾU OCR
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
                  Khối {grade} • Tiết {period}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Độ chính xác OCR: 99.4%
                </span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
                Màn hình Kiểm duyệt Đối chiếu Trước khi Nạp phiếu dữ liệu
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time score balance indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30 text-xs font-bold">
              <span className="text-on-surface-variant">Phân bổ điểm:</span>
              <span className="text-secondary">HĐ2: {totalStage2Pts.toFixed(1)}đ</span>
              <span className="text-outline-variant">•</span>
              <span className="text-tertiary">HĐ3: {totalStage3Pts.toFixed(1)}đ</span>
              <span className="text-outline-variant">•</span>
              <span className="text-on-surface">HĐ4: {totalStage4Pts.toFixed(1)}đ</span>
              <span className="text-outline-variant">=</span>
              <span
                className={`px-2 py-0.5 rounded-md font-black ${
                  Math.abs(grandTotalPts - 10.0) < 0.05
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                Tổng: {grandTotalPts.toFixed(1)} / 10.0đ
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest flex items-center justify-center cursor-pointer transition-colors"
              title="Đóng modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ================= DUAL COLUMN MAIN BODY ================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/30">
          
          {/* ================= LEFT COLUMN: ORIGINAL OCR IMAGE VIEWER ================= */}
          <div className="lg:col-span-5 flex flex-col min-h-0 bg-surface-container-low/50">
            {/* Viewer Toolbar */}
            <div className="px-4 py-2.5 bg-surface-container-lowest border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">document_scanner</span>
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  Ảnh gốc quét OCR:
                </span>
                <select
                  value={selectedImageSrc}
                  onChange={(e) => setSelectedImageSrc(e.target.value)}
                  className="px-2 py-1 rounded bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/30"
                >
                  <option value="/assets/aistudio/image_f68f98ff.png">
                    Mẫu Tiết 1 Khối 7 (image_f68f98ff.png)
                  </option>
                  <option value="/assets/aistudio/image_3575b3aa.png">
                    Mẫu Tiết 1 Khối 7 Gốc (image_3575b3aa.png)
                  </option>
                  <option value="/assets/aistudio/image_6c1cb20f.png">
                    Mẫu Giao diện Học sinh (image_6c1cb20f.png)
                  </option>
                </select>
              </div>

              {/* Zoom & Bounding Box Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="w-7 h-7 rounded bg-surface-container-low hover:bg-surface-container text-xs font-bold cursor-pointer"
                  title="Thu nhỏ (-)"
                >
                  -
                </button>
                <span className="text-[11px] font-mono font-bold w-10 text-center text-on-surface">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                  className="w-7 h-7 rounded bg-surface-container-low hover:bg-surface-container text-xs font-bold cursor-pointer"
                  title="Phóng to (+)"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-[11px] font-bold cursor-pointer"
                  title="Mặc định 100%"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setShowBoundingBoxes((b) => !b)}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    showBoundingBoxes
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                  title="Bật/Tắt viền định vị OCR nhận diện"
                >
                  {showBoundingBoxes ? '✓ Khung OCR' : 'Ẩn khung'}
                </button>
              </div>
            </div>

            {/* Quick jump tags for questions */}
            <div className="px-4 py-1.5 bg-surface-container-lowest/80 border-b border-outline-variant/10 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant shrink-0">
                Vùng OCR:
              </span>
              {[
                { id: 'all', label: 'Tất cả vùng' },
                { id: 'q1', label: 'Câu 1 (Kéo-Thả)' },
                { id: 'q2', label: 'Câu 2 (Điền khuyết)' },
                { id: 'q3', label: 'Câu 3 (Nối cột)' },
                { id: 'q4', label: 'Câu 4 (Trả lời ngắn)' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveHighlightBlock(b.id as any)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    activeHighlightBlock === b.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Image Canvas with Scroll & Visual Bounding Boxes */}
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center relative bg-neutral-900/5 min-h-[350px]">
              <div
                className="relative transition-transform duration-150 origin-top bg-white rounded-lg shadow-lg border border-neutral-300 overflow-hidden"
                style={{ transform: `scale(${zoomLevel / 100})`, width: '100%', maxWidth: '640px' }}
              >
                <img
                  src={selectedImageSrc}
                  alt="Phiếu học tập gốc quét OCR"
                  className="w-full h-auto block select-none"
                />

                {/* Overlaid OCR Bounding Boxes */}
                {showBoundingBoxes && (
                  <>
                    {/* Bounding box for Question 1: Drag Drop */}
                    {(activeHighlightBlock === 'all' || activeHighlightBlock === 'q1') && (
                      <div
                        className="absolute left-[3%] right-[3%] top-[4%] h-[23%] border-2 border-dashed border-sky-500 bg-sky-500/10 rounded-md pointer-events-none transition-all flex items-start justify-end p-1"
                        title="Vùng nhận diện Câu 1 [Dạng Kéo - Thả]"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[10px] font-bold shadow-xs">
                          OCR: Câu 1 [Kéo - Thả] (1.0đ)
                        </span>
                      </div>
                    )}

                    {/* Bounding box for Question 2: Fill in blanks */}
                    {(activeHighlightBlock === 'all' || activeHighlightBlock === 'q2') && (
                      <div
                        className="absolute left-[3%] right-[3%] top-[27.5%] h-[14%] border-2 border-dashed border-emerald-500 bg-emerald-500/10 rounded-md pointer-events-none transition-all flex items-start justify-end p-1"
                        title="Vùng nhận diện Câu 2 [Dạng Điền khuyết]"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                          OCR: Câu 2 [Điền khuyết] (1.0đ)
                        </span>
                      </div>
                    )}

                    {/* Bounding box for Question 3: Matching */}
                    {(activeHighlightBlock === 'all' || activeHighlightBlock === 'q3') && (
                      <div
                        className="absolute left-[3%] right-[3%] top-[42%] h-[35%] border-2 border-dashed border-indigo-500 bg-indigo-500/10 rounded-md pointer-events-none transition-all flex items-start justify-end p-1"
                        title="Vùng nhận diện Câu 3 [Dạng Nối cột]"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold shadow-xs">
                          OCR: Câu 3 [Nối cột A ↔ B] (1.0đ)
                        </span>
                      </div>
                    )}

                    {/* Bounding box for Question 4: Short Answer */}
                    {(activeHighlightBlock === 'all' || activeHighlightBlock === 'q4') && (
                      <div
                        className="absolute left-[3%] right-[3%] top-[78%] h-[20%] border-2 border-dashed border-amber-500 bg-amber-500/10 rounded-md pointer-events-none transition-all flex items-start justify-end p-1"
                        title="Vùng nhận diện Câu 4 [Dạng Trả lời ngắn]"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold shadow-xs">
                          OCR: Câu 4 [Trả lời ngắn] (1.0đ)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Left Column Footer note */}
            <div className="px-4 py-2 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant shrink-0">
              <span>Trích xuất từ: <strong>{worksheet.sourceFileName || 'image_f68f98ff.png'}</strong></span>
              <span className="text-primary font-bold">4/4 Khối câu hỏi đã đối chiếu</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STRUCTURED QUESTION REVIEW & EDITING ================= */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-surface-container-lowest">
            
            {/* Stage Selector Tabs & Mode Switcher */}
            <div className="px-5 py-2.5 bg-surface-container-low/70 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                {[
                  { num: 2 as const, label: 'HĐ 2: Khám phá (4.0đ)', badge: 'Trọng tâm OCR' },
                  { num: 1 as const, label: 'HĐ 1: Khởi động', badge: 'Mở sẵn' },
                  { num: 3 as const, label: 'HĐ 3: Luyện tập (3.0đ)', badge: '25s & Drive' },
                  { num: 4 as const, label: 'HĐ 4: Vận dụng (3.0đ)', badge: 'Rubric' },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setActiveStageTab(s.num)}
                    className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      activeStageTab === s.num
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>{s.label}</span>
                    {s.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          activeStageTab === s.num
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {s.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* View Mode: Edit vs Student Preview */}
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container-high">
                <button
                  type="button"
                  onClick={() => setReviewMode('edit')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    reviewMode === 'edit'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  <span>Kiểm duyệt &amp; Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewMode('student-preview')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    reviewMode === 'student-preview'
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>Xem trước Học sinh</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content Area for Right Column */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* STAGE 2 CONTENT: 4 QUESTION TYPES */}
              {activeStageTab === 2 && (
                <>
                  {reviewMode === 'student-preview' ? (
                    /* STUDENT LIVE INTERACTIVE PREVIEW */
                    <div className="space-y-6">
                      <div className="p-3.5 rounded-xl bg-secondary-container/40 border border-secondary/30 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs uppercase text-secondary block">
                            Chế độ mô phỏng trải nghiệm học sinh
                          </span>
                          <p className="text-xs text-on-surface-variant">
                            Giáo viên có thể trực tiếp kéo thả, nhập từ điền khuyết, nối cột và gõ câu trả lời ngắn để kiểm tra độ trơn tru trước khi nạp.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTestSlots({});
                            setTestFillInputs({ a: '', b: '', c: '' });
                            setTestMatchingConnections({});
                            setTestShortAnswerInputs({});
                          }}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-xs font-bold text-on-surface border border-outline-variant/30 cursor-pointer"
                        >
                          Làm lại từ đầu
                        </button>
                      </div>

                      {/* Dạng 1: Kéo - Thả */}
                      <DragDropActivity
                        title={worksheet.stage2.dragDropTitle}
                        instruction={worksheet.stage2.dragDropInstruction}
                        wordBank={worksheet.stage2.dragDropWordBank}
                        slots={testSlots}
                        onSlotChange={(slot: number, val: string | null) =>
                          setTestSlots((prev) => ({ ...prev, [slot]: val }))
                        }
                        customQuestions={worksheet.stage2.dragDropQuestions}
                        sentenceLines={worksheet.stage2.dragDropSentenceLines}
                      />

                      {/* Dạng 2: Điền khuyết */}
                      <FillBlankActivity
                        title={worksheet.stage2.fillBlankTitle}
                        instruction={worksheet.stage2.fillBlankInstruction}
                        customItems={worksheet.stage2.fillBlankQuestions}
                        answers={testFillInputs}
                        onChange={(key: 'a' | 'b' | 'c', val: string) =>
                          setTestFillInputs((prev) => ({ ...prev, [key]: val }))
                        }
                      />

                      {/* Dạng 3: Nối cột */}
                      <MatchingActivity
                        title={worksheet.stage2.matchingTitle}
                        instruction={worksheet.stage2.matchingInstruction}
                        customQuestions={worksheet.stage2.matchingQuestions}
                        connections={testMatchingConnections}
                        onConnect={(leftId: string, rightKey: string) =>
                          setTestMatchingConnections((prev) => ({ ...prev, [leftId]: rightKey }))
                        }
                        onDisconnect={(leftId: string) =>
                          setTestMatchingConnections((prev) => {
                            const next = { ...prev };
                            delete next[leftId];
                            return next;
                          })
                        }
                      />

                      {/* Dạng 4: Trả lời ngắn */}
                      <ShortAnswerActivity
                        customPrompt={worksheet.stage2.shortAnswerPrompt}
                        customQuestions={worksheet.stage2.shortAnswerQuestions}
                        answers={testShortAnswerInputs}
                        onChange={(id: string, val: string) =>
                          setTestShortAnswerInputs((prev) => ({ ...prev, [id]: val }))
                        }
                      />
                    </div>
                  ) : (
                    /* EDIT & VERIFY MODE */
                    <div className="space-y-6">
                      
                      {/* Section Title Editor */}
                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-primary">
                          Tiêu đề Phiếu học tập Hoạt động 2:
                        </label>
                        <input
                          type="text"
                          value={worksheet.worksheetTitle}
                          onChange={(e) =>
                            setWorksheet((prev) => ({ ...prev, worksheetTitle: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-headline-sm text-headline-sm font-bold text-on-surface"
                        />
                      </div>

                      {/* ================= BLOCK 1: CÂU 1 [DẠNG KÉO - THẢ] (1.0Đ) ================= */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border-2 border-sky-400/40 shadow-xs flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                              1
                            </span>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              Câu 1 [Dạng Kéo - Thả]: Chọn từ/cụm từ điền vào chỗ trống
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 font-bold text-xs">
                              Điểm: {stage2DragPts.toFixed(1)}đ (5 vị trí x 0.2đ)
                            </span>
                          </div>
                        </div>

                        {/* Word bank editor */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant flex items-center justify-between">
                            <span>Hộp từ gợi ý OCR ({worksheet.stage2.dragDropWordBank.length} từ):</span>
                            <span className="text-[11px] text-primary">Học sinh sẽ kéo các từ này vào vị trí (1) đến (5)</span>
                          </label>
                          <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                            {worksheet.stage2.dragDropWordBank.map((word, wIdx) => (
                              <span
                                key={wIdx}
                                className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-primary border border-outline-variant/30 flex items-center gap-1.5"
                              >
                                {word}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWorksheet((prev) => ({
                                      ...prev,
                                      stage2: {
                                        ...prev.stage2,
                                        dragDropWordBank: prev.stage2.dragDropWordBank.filter(
                                          (_, i) => i !== wIdx
                                        ),
                                      },
                                    }));
                                  }}
                                  className="text-on-surface-variant hover:text-red-500 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <input
                              type="text"
                              placeholder="+ Thêm từ gợi ý..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  e.preventDefault();
                                  const newWord = e.currentTarget.value.trim();
                                  setWorksheet((prev) => ({
                                    ...prev,
                                    stage2: {
                                      ...prev.stage2,
                                      dragDropWordBank: [...prev.stage2.dragDropWordBank, newWord],
                                    },
                                  }));
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="px-2.5 py-1 text-xs rounded-full border border-dashed border-outline-variant/40 bg-surface-container-lowest"
                            />
                          </div>
                        </div>

                        {/* 5 Drop Slots Editor */}
                        <div className="space-y-2.5">
                          <label className="text-xs font-bold text-on-surface-variant">
                            5 Vị trí chỗ trống &amp; Đáp án đối chiếu OCR:
                          </label>
                          {worksheet.stage2.dragDropQuestions.map((dq, qIdx) => (
                            <div
                              key={dq.slotNum}
                              className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                            >
                              <div className="md:col-span-1 flex items-center gap-1">
                                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                                  ({dq.slotNum})
                                </span>
                              </div>
                              <div className="md:col-span-6">
                                <input
                                  type="text"
                                  value={dq.promptFragment}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorksheet((prev) => {
                                      const next = [...prev.stage2.dragDropQuestions];
                                      next[qIdx] = { ...next[qIdx], promptFragment: val };
                                      return {
                                        ...prev,
                                        stage2: { ...prev.stage2, dragDropQuestions: next },
                                      };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline-variant/30"
                                  placeholder="Đoạn văn mô tả chỗ trống..."
                                />
                              </div>
                              <div className="md:col-span-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                                    Đáp án:
                                  </span>
                                  <input
                                    type="text"
                                    value={dq.correctWord}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWorksheet((prev) => {
                                        const next = [...prev.stage2.dragDropQuestions];
                                        next[qIdx] = { ...next[qIdx], correctWord: val };
                                        return {
                                          ...prev,
                                          stage2: { ...prev.stage2, dragDropQuestions: next },
                                        };
                                      });
                                    }}
                                    className="w-full px-2 py-1 rounded bg-surface-container-low text-xs font-bold text-primary border border-outline-variant/30"
                                  />
                                </div>
                              </div>
                              <div className="md:col-span-2 flex items-center justify-end gap-1">
                                <span className="text-[10px] font-bold text-on-surface-variant">
                                  Điểm:
                                </span>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0"
                                  max="2"
                                  value={dq.points}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setWorksheet((prev) => {
                                      const next = [...prev.stage2.dragDropQuestions];
                                      next[qIdx] = { ...next[qIdx], points: val };
                                      return {
                                        ...prev,
                                        stage2: { ...prev.stage2, dragDropQuestions: next },
                                      };
                                    });
                                  }}
                                  className="w-14 px-1.5 py-1 text-center text-xs font-bold rounded bg-surface-container-low border border-outline-variant/30"
                                />
                                <span className="text-[10px] text-on-surface-variant">đ</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ================= BLOCK 2: CÂU 2 [DẠNG ĐIỀN KHUYẾT] (1.0Đ) ================= */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border-2 border-emerald-400/40 shadow-xs flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                              2
                            </span>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              Câu 2 [Dạng Điền khuyết]: Hoàn thành các mệnh đề tri thức còn thiếu
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs">
                            Điểm: {stage2FillPts.toFixed(1)}đ (Học sinh tự gõ từ cần điền)
                          </span>
                        </div>

                        <div className="space-y-3">
                          {worksheet.stage2.fillBlankQuestions.map((fb, fbIdx) => (
                            <div
                              key={fb.id}
                              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-primary">
                                  Mệnh đề {fb.label}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-on-surface-variant">
                                    Điểm:
                                  </span>
                                  <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="2"
                                    value={fb.points}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setWorksheet((prev) => {
                                        const next = [...prev.stage2.fillBlankQuestions];
                                        next[fbIdx] = { ...next[fbIdx], points: val };
                                        return {
                                          ...prev,
                                          stage2: { ...prev.stage2, fillBlankQuestions: next },
                                        };
                                      });
                                    }}
                                    className="w-14 px-1.5 py-1 text-center text-xs font-bold rounded bg-surface-container-low border border-outline-variant/30"
                                  />
                                  <span className="text-xs text-on-surface-variant">đ</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                <div className="sm:col-span-5">
                                  <span className="text-[10px] font-bold text-on-surface-variant block mb-0.5">
                                    Văn bản trước ô trống:
                                  </span>
                                  <input
                                    type="text"
                                    value={fb.preText}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWorksheet((prev) => {
                                        const next = [...prev.stage2.fillBlankQuestions];
                                        next[fbIdx] = { ...next[fbIdx], preText: val };
                                        return {
                                          ...prev,
                                          stage2: { ...prev.stage2, fillBlankQuestions: next },
                                        };
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">
                                    Từ cần điền (Đáp án):
                                  </span>
                                  <input
                                    type="text"
                                    value={fb.correctAnswer}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWorksheet((prev) => {
                                        const next = [...prev.stage2.fillBlankQuestions];
                                        next[fbIdx] = {
                                          ...next[fbIdx],
                                          correctAnswer: val,
                                          accepted: [val.toLowerCase()],
                                        };
                                        return {
                                          ...prev,
                                          stage2: { ...prev.stage2, fillBlankQuestions: next },
                                        };
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs font-bold text-emerald-700 border-2 border-emerald-400/50"
                                  />
                                </div>
                                <div className="sm:col-span-4">
                                  <span className="text-[10px] font-bold text-on-surface-variant block mb-0.5">
                                    Văn bản sau ô trống:
                                  </span>
                                  <input
                                    type="text"
                                    value={fb.postText}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWorksheet((prev) => {
                                        const next = [...prev.stage2.fillBlankQuestions];
                                        next[fbIdx] = { ...next[fbIdx], postText: val };
                                        return {
                                          ...prev,
                                          stage2: { ...prev.stage2, fillBlankQuestions: next },
                                        };
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ================= BLOCK 3: CÂU 3 [DẠNG NỐI CỘT] (1.0Đ) ================= */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border-2 border-indigo-400/40 shadow-xs flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                              3
                            </span>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              Câu 3 [Dạng Nối cột]: Ghép Cột A (Thiết bị) với Cột B (Chức năng cốt lõi)
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 font-bold text-xs">
                            Điểm: {stage2MatchPts.toFixed(1)}đ (4 cặp nối A ↔ B)
                          </span>
                        </div>

                        <div className="space-y-3">
                          {worksheet.stage2.matchingQuestions.map((mq, mIdx) => (
                            <div
                              key={mq.id}
                              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                            >
                              <div className="md:col-span-5">
                                <span className="text-[10px] font-bold text-indigo-700 block mb-0.5">
                                  CỘT A (Thiết bị):
                                </span>
                                <input
                                  type="text"
                                  value={mq.leftText}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorksheet((prev) => {
                                      const next = [...prev.stage2.matchingQuestions];
                                      next[mIdx] = { ...next[mIdx], leftText: val };
                                      return {
                                        ...prev,
                                        stage2: { ...prev.stage2, matchingQuestions: next },
                                      };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs font-bold border border-outline-variant/30"
                                />
                              </div>

                              <div className="md:col-span-1 flex items-center justify-center text-indigo-600 font-bold">
                                ↔
                              </div>

                              <div className="md:col-span-5">
                                <span className="text-[10px] font-bold text-indigo-700 block mb-0.5">
                                  CỘT B (Chức năng cốt lõi tương ứng):
                                </span>
                                <input
                                  type="text"
                                  value={mq.rightText}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorksheet((prev) => {
                                      const next = [...prev.stage2.matchingQuestions];
                                      next[mIdx] = { ...next[mIdx], rightText: val };
                                      return {
                                        ...prev,
                                        stage2: { ...prev.stage2, matchingQuestions: next },
                                      };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30"
                                />
                              </div>

                              <div className="md:col-span-1 flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0"
                                  max="2"
                                  value={mq.points}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setWorksheet((prev) => {
                                      const next = [...prev.stage2.matchingQuestions];
                                      next[mIdx] = { ...next[mIdx], points: val };
                                      return {
                                        ...prev,
                                        stage2: { ...prev.stage2, matchingQuestions: next },
                                      };
                                    });
                                  }}
                                  className="w-12 px-1 py-1 text-center text-xs font-bold rounded bg-surface-container-low border border-outline-variant/30"
                                />
                                <span className="text-[10px] text-on-surface-variant">đ</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ================= BLOCK 4: CÂU 4 [DẠNG TRẢ LỜI NGẮN] (1.0Đ) ================= */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border-2 border-amber-400/40 shadow-xs flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                              4
                            </span>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              Câu 4 [Dạng Trả lời ngắn]: Tình huống thực tế học sinh tự gõ câu trả lời
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-bold text-xs">
                            Điểm: {stage2ShortPts.toFixed(1)}đ (3 ý x 0.4đ + 0.3đ + 0.3đ)
                          </span>
                        </div>

                        {/* Prompt editor */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-on-surface-variant">
                            Nội dung tình huống đề bài (Trích xuất OCR):
                          </label>
                          <textarea
                            rows={2}
                            value={worksheet.stage2.shortAnswerPrompt}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWorksheet((prev) => ({
                                ...prev,
                                stage2: { ...prev.stage2, shortAnswerPrompt: val },
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/30 leading-relaxed"
                          />
                        </div>

                        {/* 3 Sub-questions & Sample Answer keys */}
                        <div className="space-y-3">
                          {worksheet.stage2.shortAnswerQuestions.map((sa, saIdx) => (
                            <div
                              key={sa.id}
                              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-amber-800">{sa.label}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-on-surface-variant">
                                    Điểm:
                                  </span>
                                  <input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="2"
                                    value={sa.points}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setWorksheet((prev) => {
                                        const next = [...prev.stage2.shortAnswerQuestions];
                                        next[saIdx] = { ...next[saIdx], points: val };
                                        return {
                                          ...prev,
                                          stage2: { ...prev.stage2, shortAnswerQuestions: next },
                                        };
                                      });
                                    }}
                                    className="w-14 px-1.5 py-1 text-center text-xs font-bold rounded bg-surface-container-low border border-outline-variant/30"
                                  />
                                  <span className="text-xs text-on-surface-variant">đ</span>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={sa.question}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWorksheet((prev) => {
                                    const next = [...prev.stage2.shortAnswerQuestions];
                                    next[saIdx] = { ...next[saIdx], question: val };
                                    return {
                                      ...prev,
                                      stage2: { ...prev.stage2, shortAnswerQuestions: next },
                                    };
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline-variant/30"
                                placeholder="Nội dung câu hỏi..."
                              />

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                                  Gợi ý đáp án chuẩn (Bareme):
                                </span>
                                <input
                                  type="text"
                                  value={sa.sampleAnswer}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setWorksheet((prev) => {
                                      const next = [...prev.stage2.shortAnswerQuestions];
                                      next[saIdx] = { ...next[saIdx], sampleAnswer: val };
                                      return {
                                        ...prev,
                                        stage2: { ...prev.stage2, shortAnswerQuestions: next },
                                      };
                                    });
                                  }}
                                  className="flex-1 px-2.5 py-1 rounded bg-amber-500/10 text-xs font-semibold text-amber-900 border border-amber-300/40"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </>
              )}

              {/* STAGE 1 CONTENT: KHỞI ĐỘNG (Ô CHỮ, TRANH BÍ MẬT, VIDEO) */}
              {activeStageTab === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-1">
                      Hoạt động 1: Khởi động (Mở sẵn • Tích lũy XP)
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Chặng khởi động tạo hứng thú đầu giờ học qua video tương tác và ô chữ mở tranh bí mật chủ đề &ldquo;{currentPeriodSpec.topic}&rdquo;.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
                    <span className="font-bold text-xs uppercase text-on-surface block">
                      Các hàng ngang ô chữ khởi động ({worksheet.stage1Questions?.length || 0} câu):
                    </span>
                    {(worksheet.stage1Questions || []).map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">
                            {q.rowNumber}
                          </span>
                          <span className="text-on-surface font-medium">{q.clue}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold">
                          {q.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 3 CONTENT: LUYỆN TẬP (ĐẤU TRƯỜNG TRẮC NGHIỆM 25S: 3.0Đ) */}
              {activeStageTab === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-tertiary font-bold mb-1">
                        Hoạt động 3: Luyện tập (3.0 điểm • Đấu trường 25s &amp; Google Drive)
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {worksheet.stage3QuizQuestions.length} câu hỏi trắc nghiệm tốc độ 25 giây (0.5đ/câu) bám sát yêu cầu cần đạt của {currentPeriodSpec.lessonTitle}.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-tertiary text-on-tertiary text-xs font-bold">
                      {totalStage3Pts.toFixed(1)} / 3.0đ
                    </span>
                  </div>

                  <div className="space-y-3">
                    {worksheet.stage3QuizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-primary">
                            Câu {qIdx + 1} (Thời gian: 25s)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-on-surface-variant">Điểm:</span>
                            <input
                              type="number"
                              step="0.1"
                              value={q.points ?? 0.5}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setWorksheet((prev) => {
                                  const next = [...prev.stage3QuizQuestions];
                                  next[qIdx] = { ...next[qIdx], points: val };
                                  return { ...prev, stage3QuizQuestions: next };
                                });
                              }}
                              className="w-14 px-1.5 py-1 text-center text-xs font-bold rounded bg-surface-container-low border border-outline-variant/30"
                            />
                            <span className="text-xs text-on-surface-variant">đ</span>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWorksheet((prev) => {
                              const next = [...prev.stage3QuizQuestions];
                              next[qIdx] = { ...next[qIdx], question: val };
                              return { ...prev, stage3QuizQuestions: next };
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline-variant/30 font-medium"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => (
                            <div
                              key={opt.letter}
                              className={`p-2 rounded-lg text-xs border ${
                                opt.isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 font-bold'
                                  : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant'
                              }`}
                            >
                              <span className="font-bold mr-1">{opt.letter}.</span>
                              {opt.text}
                              {opt.isCorrect && ' ✓ (Đúng)'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 4 CONTENT: VẬN DỤNG THỰC TẾ (RUBRIC: 3.0Đ) */}
              {activeStageTab === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-1">
                        Hoạt động 4: Vận dụng thực tế (3.0 điểm • Rubric định kỳ)
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {worksheet.stage4.prompt}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface text-xs font-bold">
                      {totalStage4Pts.toFixed(1)} / 3.0đ
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(worksheet.stage4.rubrics || []).map((r, rIdx) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={r.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWorksheet((prev) => {
                                const next = [...(prev.stage4.rubrics || [])];
                                next[rIdx] = { ...next[rIdx], title: val };
                                return {
                                  ...prev,
                                  stage4: { ...prev.stage4, rubrics: next },
                                };
                              });
                            }}
                            className="flex-1 mr-3 px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/30"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              value={r.points}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setWorksheet((prev) => {
                                  const next = [...(prev.stage4.rubrics || [])];
                                  next[rIdx] = { ...next[rIdx], points: val };
                                  return {
                                    ...prev,
                                    stage4: { ...prev.stage4, rubrics: next },
                                  };
                                });
                              }}
                              className="w-14 px-1.5 py-1 text-center text-xs font-bold rounded bg-surface-container-low border border-outline-variant/30"
                            />
                            <span className="text-xs text-on-surface-variant">đ</span>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={r.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWorksheet((prev) => {
                              const next = [...(prev.stage4.rubrics || [])];
                              next[rIdx] = { ...next[rIdx], desc: val };
                              return {
                                ...prev,
                                stage4: { ...prev.stage4, rubrics: next },
                              };
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant border border-outline-variant/30"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ================= MODAL FOOTER ACTION BAR ================= */}
        <div className="px-6 py-3.5 bg-surface-container border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToOcrDefault}
              className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-bold border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Khôi phục mẫu gốc OCR</span>
            </button>
            <span className="text-xs text-on-surface-variant hidden sm:inline">
              ✓ Đối chiếu trực tiếp với bản scan <strong>{worksheet.sourceFileName || 'image_f68f98ff.png'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-bold cursor-pointer hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              Hủy / Đóng
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApproveAndIngest}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSubmitting ? 'sync' : 'check_circle'}
              </span>
              <span>
                {isSubmitting
                  ? 'Đang lưu vào Database...'
                  : `✅ Phê duyệt & Nạp vào Tiết học (Lưu Database)`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
