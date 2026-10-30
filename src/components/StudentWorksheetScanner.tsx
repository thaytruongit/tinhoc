import React, { useState, useRef, useEffect } from 'react';

export interface ExtractedWorksheetData {
  dragSlots?: Record<number, string | null>;
  fillBlankInputs?: { a: string; b: string; c: string; [key: string]: string };
  matchingConnections?: Record<string, string>;
  shortAnswers?: Record<string, string>;
  stage4Answers?: {
    deepAnalysis?: string;
    practicalTask?: string;
    extendedTask?: string;
  };
  pedagogicalFeedback?: string;
  aiConfidence?: number;
}

interface StudentWorksheetScannerProps {
  isOpen: boolean;
  onClose: () => void;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  onApplyExtractedData: (data: ExtractedWorksheetData) => void;
  onShowToast: (msg: string) => void;
}

export const StudentWorksheetScanner: React.FC<StudentWorksheetScannerProps> = ({
  isOpen,
  onClose,
  grade,
  period,
  lessonTitle,
  onApplyExtractedData,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('upload');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedWorksheetData | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera when closing modal or unmounting
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setExtractedData(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setMode('camera');
    } catch {
      onShowToast('Không thể truy cập camera. Vui lòng cấp quyền hoặc tải ảnh lên!');
      setMode('upload');
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      onShowToast('Vui lòng chọn tệp hình ảnh (.jpg, .png, .webp)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCapturedImage(dataUrl);
      setExtractedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileUpload(file);
          onShowToast('Đã dán ảnh từ bộ nhớ tạm (Clipboard)!');
          return;
        }
      }
    }
  };

  const handleRunOcrScan = async () => {
    if (!capturedImage) {
      onShowToast('Vui lòng chụp hoặc tải ảnh phiếu học tập trước!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/student/worksheet-ocr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: capturedImage,
          mimeType: 'image/jpeg',
          grade,
          period,
          lessonTitle,
        }),
      });

      const result = await res.json();
      if (result.ok && result.extracted) {
        setExtractedData(result.extracted);
        onShowToast('✨ Đã quét OCR thành công! Kiểm tra kết quả bên dưới.');
      } else {
        throw new Error(result.message || 'Lỗi phân tích hình ảnh');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi quét OCR';
      onShowToast(`⚠️ ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!extractedData) return;
    onApplyExtractedData(extractedData);
    onShowToast('🎉 Đã tự động điền các câu trả lời vào bài làm của em!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onPaste={handlePaste}
      tabIndex={0}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 outline-none"
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/30">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                Quét Phiếu Học Tập Thông Minh (Gemini Vision OCR)
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Khối {grade} • Tiết {period}: {lessonTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Action Tabs */}
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                stopCamera();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'upload'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Tải ảnh / Dán ảnh</span>
            </button>
            <button
              type="button"
              onClick={startCamera}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'camera'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Camera trực tiếp</span>
            </button>
          </div>

          {/* Camera Viewfinder */}
          {mode === 'camera' && cameraActive && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleCaptureFrame}
                className="absolute bottom-4 px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-lg flex items-center gap-1.5 hover:brightness-105 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">camera</span>
                <span>Chụp hình phiếu</span>
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Upload Dropzone */}
          {mode === 'upload' && !capturedImage && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-primary/40 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <span className="material-symbols-outlined text-4xl text-primary mb-2">
                add_photo_alternate
              </span>
              <p className="font-bold text-xs text-on-surface">
                Bấm để chọn ảnh phiếu học tập từ máy hoặc điện thoại
              </p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Hoặc bấm phím <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-mono">Ctrl+V</kbd> để dán ảnh chụp màn hình
              </p>
            </div>
          )}

          {/* Image Preview & OCR Trigger */}
          {capturedImage && (
            <div className="flex flex-col gap-3 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">image</span>
                  <span>Ảnh phiếu học tập đã chụp/tải lên</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    setExtractedData(null);
                    if (mode === 'camera') startCamera();
                  }}
                  className="text-error text-xs hover:underline cursor-pointer"
                >
                  Chụp/Chọn lại
                </button>
              </div>

              <div className="max-h-56 overflow-hidden rounded-lg bg-surface-container-lowest flex justify-center border border-outline-variant/20">
                <img
                  src={capturedImage}
                  alt="Captured Worksheet"
                  className="object-contain max-h-56"
                />
              </div>

              {!extractedData && (
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunOcrScan}
                  className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">
                        progress_activity
                      </span>
                      <span>Đang dùng Gemini Vision đọc chữ viết tay...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span>Bắt đầu quét OCR &amp; Nhận diện bài làm</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="flex flex-col gap-3 bg-primary-fixed/20 p-4 rounded-xl border border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified
                  </span>
                  <span className="font-bold text-xs text-primary">
                    Kết quả nhận diện tự động ({extractedData.aiConfidence ?? 95}% chính xác)
                  </span>
                </div>
              </div>

              {extractedData.pedagogicalFeedback && (
                <div className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-primary/20">
                  <span className="font-bold text-primary block mb-0.5">Nhận xét từ AI Cú Vàng:</span>
                  <p>{extractedData.pedagogicalFeedback}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {extractedData.fillBlankInputs && (
                  <div className="p-2 rounded bg-surface-container-lowest">
                    <span className="font-bold text-secondary">Điền khuyết nhận diện:</span>
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {Object.entries(extractedData.fillBlankInputs).map(([k, v]) => (
                        <li key={k}>
                          <strong>{k}):</strong> {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extractedData.matchingConnections && (
                  <div className="p-2 rounded bg-surface-container-lowest">
                    <span className="font-bold text-tertiary">Nối cột nhận diện:</span>
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {Object.entries(extractedData.matchingConnections).map(([k, v]) => (
                        <li key={k}>
                          <strong>{k} ⟷ {v}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Áp dụng vào bài tập của em ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
