import React, { useState, useRef } from 'react';
import type { LiveClassroomSession, CustomLessonWorksheet } from '../data/mockCurriculumData';

interface TeacherDataIngestionServiceProps {
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (updater: (prev: LiveClassroomSession) => LiveClassroomSession) => void;
  onShowToast: (msg: string) => void;
  onNavigateToPeriod: (grade: 6 | 7 | 8 | 9, period: number) => void;
}

export const TeacherDataIngestionService: React.FC<TeacherDataIngestionServiceProps> = ({
  liveSession,
  onUpdateLiveSession,
  onShowToast,
  onNavigateToPeriod,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<6 | 7 | 8 | 9>(7);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    size: string;
    mimeType: string;
    dataUrl: string;
  } | null>(null);
  const [extractedWorksheet, setExtractedWorksheet] = useState<CustomLessonWorksheet | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isImage && !isPdf) {
      onShowToast('Vui lòng chọn tệp định dạng PDF hoặc Ảnh (.png, .jpg, .webp)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        dataUrl,
      });
      setExtractedWorksheet(null);
      setIsSavedToDb(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileSelect(file);
          onShowToast('Đã dán ảnh phiếu học tập từ Clipboard!');
          return;
        }
      }
    }
  };

  const handleAnalyzeAndSave = async () => {
    if (!previewFile) {
      onShowToast('Vui lòng tải lên hoặc dán tệp PDF/Ảnh phiếu học tập trước!');
      return;
    }

    setIsProcessing(true);
    setStatusText('Đang phân tích cấu trúc phiếu học tập bằng Gemini 3.8 Flash Vision...');

    try {
      const res = await fetch('/api/teacher/data-ingestion/analyze-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: previewFile.dataUrl,
          mimeType: previewFile.mimeType,
          fileName: previewFile.name,
          targetGrade: selectedGrade,
          targetPeriod: selectedPeriod,
          autoSaveToDb: true,
        }),
      });

      const data = await res.json();

      if (data.ok && data.worksheet) {
        const ws: CustomLessonWorksheet = data.worksheet;
        setExtractedWorksheet(ws);
        setIsSavedToDb(true);

        const lessonKey = ws.lessonKey || `k${selectedGrade}-tiet-${selectedPeriod}`;

        if (onUpdateLiveSession) {
          onUpdateLiveSession((prev) => ({
            ...prev,
            customWorksheetsByLesson: {
              ...(prev.customWorksheetsByLesson || {}),
              [lessonKey]: ws,
            },
            verifiedLessonsMap: {
              ...(prev.verifiedLessonsMap || {}),
              [lessonKey]: true,
            },
            updatedAt: new Date().toISOString(),
          }));
        }

        onShowToast(
          `✅ Đã trích xuất & lưu thành công Tiết ${selectedPeriod} (Khối ${selectedGrade}) vào CSDL!`
        );
      } else {
        throw new Error(data.message || 'Lỗi xử lý Data Ingestion Service');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gọi Gemini Vision OCR';
      onShowToast(`⚠️ ${msg}`);
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  return (
    <div
      onPaste={handlePaste}
      tabIndex={0}
      className="flex flex-col gap-space-lg outline-none"
    >
      {/* Header Banner */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[28px]">document_scanner</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Data Ingestion Service (Gemini 3.8 Flash Vision)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-xs font-bold border border-primary/20">
                Tự động chia tách &amp; Lưu CSDL
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Tải lên PDF/Ảnh phiếu học tập thực tế hoặc tệp bài giảng. Trí tuệ nhân tạo Vision sẽ bóc tách cấu trúc 4 chặng, chia nhỏ thành các đối tượng JSON bài tập và lưu trực tiếp vào CSDL thay vì nhập tay.
            </p>
          </div>
        </div>

        {/* Grade & Period Selector */}
        <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant/20 self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant">Khối lớp:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(Number(e.target.value) as 6 | 7 | 8 | 9)}
              className="bg-surface-container-lowest text-on-surface font-bold text-xs px-2.5 py-1.5 rounded-lg border border-outline-variant/40"
            >
              <option value={6}>Khối 6</option>
              <option value={7}>Khối 7</option>
              <option value={8}>Khối 8</option>
              <option value={9}>Khối 9</option>
            </select>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant">Tiết học:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="bg-surface-container-lowest text-on-surface font-bold text-xs px-2.5 py-1.5 rounded-lg border border-outline-variant/40"
            >
              {Array.from({ length: 29 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Tiết {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Upload Dropzone & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-primary/40 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <span className="material-symbols-outlined text-4xl text-primary mb-2">
              cloud_upload
            </span>
            <p className="font-headline-sm text-sm font-bold text-on-surface">
              Kéo &amp; thả tệp PDF hoặc Ảnh phiếu học tập vào đây
            </p>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              Hỗ trợ định dạng PDF, PNG, JPG, WebP hoặc bấm phím <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px]">Ctrl+V</kbd> để dán ảnh trực tiếp
            </p>
          </div>

          {previewFile && (
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500 text-[20px]">
                    {previewFile.mimeType.includes('pdf') ? 'picture_as_pdf' : 'image'}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-on-surface truncate max-w-[200px]">
                      {previewFile.name}
                    </p>
                    <span className="text-[11px] text-on-surface-variant">{previewFile.size}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewFile(null);
                    setExtractedWorksheet(null);
                  }}
                  className="text-error text-xs hover:underline cursor-pointer"
                >
                  Xoá tệp
                </button>
              </div>

              {previewFile.mimeType.startsWith('image/') && (
                <div className="max-h-48 overflow-hidden rounded-lg border border-outline-variant/30 flex justify-center bg-surface-container-low">
                  <img
                    src={previewFile.dataUrl}
                    alt="Preview"
                    className="object-contain max-h-48"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleAnalyzeAndSave}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    <span>{statusText || 'Đang phân tích...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Phân tích Vision &amp; Lưu trực tiếp CSDL</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Ingested & Extracted Results */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {extractedWorksheet ? (
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-outline-variant/30 flex flex-col gap-space-md shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                      {extractedWorksheet.worksheetTitle}
                    </h3>
                    <span className="text-[11px] text-primary font-bold">
                      Đã lưu CSDL • Khối {selectedGrade} • Tiết {selectedPeriod}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToPeriod(selectedGrade, selectedPeriod)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở tiết học trong Soạn bài</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>

              {/* Extracted Stages Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-primary mb-1">
                    <span className="material-symbols-outlined text-[15px]">play_circle</span>
                    <span>1. Khởi động (Stage 1)</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-3">
                    {extractedWorksheet.stage1?.scenario || 'Tình huống mở đầu'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-secondary mb-1">
                    <span className="material-symbols-outlined text-[15px]">extension</span>
                    <span>2. Khám phá (Stage 2)</span>
                  </div>
                  <ul className="text-xs text-on-surface-variant flex flex-col gap-1">
                    <li>• Kéo thả: {extractedWorksheet.stage2?.dragDropQuestions?.length || 0} từ khóa</li>
                    <li>• Điền khuyết: {extractedWorksheet.stage2?.fillBlankQuestions?.length || 0} câu</li>
                    <li>• Nối cột: {extractedWorksheet.stage2?.matchingQuestions?.length || 0} cặp nối</li>
                    <li>• Trả lời ngắn: {extractedWorksheet.stage2?.shortAnswerQuestions?.length || 0} câu</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-tertiary mb-1">
                    <span className="material-symbols-outlined text-[15px]">quiz</span>
                    <span>3. Luyện tập (Stage 3)</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {extractedWorksheet.stage3QuizQuestions?.length || 0} câu hỏi trắc nghiệm 25s chuẩn hoá
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-500 mb-1">
                    <span className="material-symbols-outlined text-[15px]">task</span>
                    <span>4. Vận dụng (Stage 4)</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {extractedWorksheet.stage4?.deepAnalysis?.title || '3 nhiệm vụ vận dụng thực tế'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-5xl mb-2 text-outline">
                dataset
              </span>
              <p className="font-bold text-sm text-on-surface">Chưa có dữ liệu trích xuất</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md">
                Tải lên tệp PDF hoặc Ảnh phiếu học tập ở cột bên trái để Gemini Vision tự động phân tích cấu trúc và lưu trực tiếp vào CSDL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
