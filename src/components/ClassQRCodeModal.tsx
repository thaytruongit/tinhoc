import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { LiveClassroomSession } from '../data/mockCurriculumData';

export interface ClassQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: 6 | 7 | 8 | 9;
  period: number;
  classId: string;
  lessonTitle?: string;
  liveSession?: LiveClassroomSession;
  onShowToast: (msg: string) => void;
}

export const ClassQRCodeModal: React.FC<ClassQRCodeModalProps> = ({
  isOpen,
  onClose,
  grade,
  period,
  classId,
  lessonTitle,
  liveSession,
  onShowToast,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'student-app' | 'direct-lesson' | 'join-code'>('student-app');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Generate public join URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cloudplaylearnin.edu.vn';
  
  const studentAppUrl = `${baseUrl}/?role=student&class=${encodeURIComponent(classId)}&grade=${grade}&period=${period}`;
  const directLessonUrl = `${baseUrl}/?grade=${grade}&period=${period}&classId=${encodeURIComponent(classId)}&live=true`;
  const pinCode = `${classId}-T${period < 10 ? '0' + period : period}`;

  const currentUrl = activeMode === 'direct-lesson' ? directLessonUrl : studentAppUrl;

  useEffect(() => {
    if (!isOpen) return;

    let targetText = currentUrl;
    if (activeMode === 'join-code') {
      targetText = `MALOP:${classId}|KHOI:${grade}|TIET:${period}|PIN:${pinCode}`;
    }

    QRCode.toDataURL(targetText, {
      width: 380,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code', err));
  }, [isOpen, currentUrl, activeMode, classId, grade, period, pinCode]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    onShowToast('Đã sao chép liên kết truy cập lớp học vào bộ nhớ tạm!');
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pinCode);
    onShowToast(`Đã sao chép Mã PIN Lớp (${pinCode})!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div
        className={`relative bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl transition-all duration-300 flex flex-col ${
          isFullscreen ? 'w-full h-full max-w-none rounded-none p-8' : 'w-full max-w-xl p-6'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span>Mã QR Tham Gia Lớp Học Trực Tiếp</span>
                <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error font-bold text-xs animate-pulse">
                  LIVE
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Học sinh quét mã QR bằng điện thoại / máy tính bảng để vào học ngay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở toàn màn hình trình chiếu'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-6">
          {/* Class & Period Info Card */}
          <div className="bg-primary-container/30 border border-primary/20 px-6 py-3 rounded-2xl flex flex-wrap items-center justify-center gap-4 text-sm font-bold">
            <span className="text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">groups</span>
              Lớp: <strong>{classId}</strong> (Khối {grade})
            </span>
            <span className="text-outline-variant">|</span>
            <span className="text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <strong>Tiết {period}</strong>
            </span>
            {lessonTitle && (
              <>
                <span className="text-outline-variant">|</span>
                <span className="text-on-surface font-normal line-clamp-1 max-w-xs">{lessonTitle}</span>
              </>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/20 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMode('student-app')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeMode === 'student-app'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cổng Học Sinh
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('direct-lesson')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeMode === 'direct-lesson'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Link Tiết Học Trực Tiếp
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('join-code')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeMode === 'join-code'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mã PIN Lớp
            </button>
          </div>

          {/* Large QR Display Box */}
          <div className="relative p-4 bg-white rounded-3xl shadow-xl border-4 border-primary/20 flex flex-col items-center gap-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Class Join QR Code"
                className={`transition-all ${isFullscreen ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-64 h-64'}`}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-on-surface-variant font-bold">
                Đang tạo mã QR...
              </div>
            )}

            {/* Unique PIN Code Badge below QR */}
            <div className="bg-slate-900 text-amber-400 font-mono font-black text-xl tracking-widest px-6 py-2 rounded-xl shadow-inner border border-amber-400/30 flex items-center gap-3">
              <span>MÃ PIN: {pinCode}</span>
              <button
                type="button"
                onClick={handleCopyPin}
                className="text-white hover:text-amber-300 transition-colors text-xs font-sans font-bold underline cursor-pointer"
              >
                Sao chép
              </button>
            </div>
          </div>

          {/* Live Session Broadcast Details */}
          <div className="flex flex-col items-center gap-2 max-w-lg">
            <p className="text-xs text-on-surface-variant font-medium">
              📱 Dùng Zalo, Camera điện thoại hoặc Trình quét mã QR trên ứng dụng Học Sinh để vào lớp nhanh.
            </p>
            <div className="flex items-center gap-2 w-full max-w-md bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 text-xs">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">link</span>
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-on-surface font-mono text-[11px] truncate focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1 rounded-lg bg-primary text-on-primary font-bold shrink-0 cursor-pointer hover:brightness-110"
              >
                Sao chép Link
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
          <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Hệ thống phát tín hiệu Live tự động đồng bộ Giáo viên ↔ Học sinh
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface font-bold text-xs hover:bg-surface-container-highest cursor-pointer transition-colors"
          >
            Đóng Màn Hình QR
          </button>
        </div>
      </div>
    </div>
  );
};
