import React, { useState, useEffect } from 'react';
import { type PracticalProductSubmission } from '../data/mockCurriculumData';
import {
  detectSubmissionFileType,
  triggerDownloadSubmissionFile,
  getTeacherGoogleDriveFolderUrl,
} from '../utils/googleDriveService';

export interface StudentSubmissionViewerModalProps {
  submission: PracticalProductSubmission | null;
  onClose: () => void;
  onSaveGrade: (submissionId: string, score: number, feedback: string) => void;
  teacherDriveUrl?: string;
  onShowToast?: (msg: string) => void;
}

export const StudentSubmissionViewerModal: React.FC<StudentSubmissionViewerModalProps> = ({
  submission,
  onClose,
  onSaveGrade,
  teacherDriveUrl,
  onShowToast,
}) => {
  if (!submission) return null;

  const [score, setScore] = useState<number>(submission.score ?? 3.0);
  const [feedback, setFeedback] = useState<string>(
    submission.teacherFeedback || 'Hoàn thành tốt yêu cầu thực hành trên máy tính!'
  );
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [isFullscreenImage, setIsFullscreenImage] = useState<boolean>(false);

  useEffect(() => {
    setScore(submission.score ?? 3.0);
    setFeedback(submission.teacherFeedback || 'Hoàn thành tốt yêu cầu thực hành trên máy tính!');
    setImageZoom(1);
    setIsFullscreenImage(false);
  }, [submission]);

  const fileTypeMeta = detectSubmissionFileType(submission.fileName, submission.fileType);
  const resolvedDriveUrl =
    teacherDriveUrl ||
    submission.teacherDriveFolderUrl ||
    getTeacherGoogleDriveFolderUrl(submission.grade, submission.classId);

  const handleQuickFeedback = (text: string) => {
    setFeedback(text);
  };

  const handleSave = () => {
    const validScore = Math.max(0, Math.min(3, Number(score) || 0));
    onSaveGrade(submission.id, validScore, feedback.trim());
    if (onShowToast) {
      onShowToast(`🎉 Đã lưu điểm (${validScore}/3.0đ) & nhận xét cho em ${submission.studentName}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest text-on-surface rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-outline-variant/30">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-primary text-white flex items-center justify-between gap-3 shadow-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[26px]">visibility</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black uppercase tracking-wider">
                  BÀI NỘP THỰC HÀNH GOOGLE DRIVE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black">
                  Lớp {submission.classId} • Tiết {submission.period}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                {submission.studentName} ({submission.studentUsername})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resolvedDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
              title="Mở Thư mục Google Drive của Thầy/Cô trên tab mới"
            >
              <span className="material-symbols-outlined text-[18px]">folder_shared</span>
              <span>Thư mục Drive của Tôi</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              title="Đóng cửa sổ xem bài"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: File Details & Live Preview */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* File Meta Pill Card */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold ${fileTypeMeta.colorClass}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{fileTypeMeta.icon}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-on-surface block truncate">
                    {submission.fileName}
                  </span>
                  <span className="text-[11px] text-on-surface-variant block">
                    {submission.fileSize || '1.0 MB'} • Nộp lúc: {submission.submittedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {submission.fileDataUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownloadSubmissionFile(submission.fileName, submission.fileDataUrl!)
                    }
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Tải tệp gốc của học sinh về máy"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Tải tệp</span>
                  </button>
                )}
                {submission.driveFileUrl && (
                  <a
                    href={submission.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                    title="Mở liên kết tệp trên Google Drive"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Mở Drive</span>
                  </a>
                )}
              </div>
            </div>

            {/* Student Note */}
            {submission.studentNote && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Ghi chú của học sinh:
                </span>
                <p className="text-xs text-on-surface italic leading-relaxed">
                  &ldquo;{submission.studentNote}&rdquo;
                </p>
              </div>
            )}

            {/* Live Interactive Preview Box */}
            <div className="flex-1 min-h-[320px] rounded-2xl bg-surface-container border border-outline-variant/40 flex flex-col overflow-hidden relative">
              <div className="p-2.5 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between text-xs font-bold text-on-surface">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    preview
                  </span>
                  Xem nội dung bài làm trực tiếp
                </span>

                {fileTypeMeta.typeCategory === 'image' && submission.fileDataUrl && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      className="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center text-xs font-black cursor-pointer"
                      title="Thu nhỏ ảnh"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-mono px-1">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                      className="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center text-xs font-black cursor-pointer"
                      title="Phóng to ảnh"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageZoom(1)}
                      className="px-2 h-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-[11px] font-bold cursor-pointer"
                      title="Đặt lại 100%"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFullscreenImage(!isFullscreenImage)}
                      className="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center cursor-pointer"
                      title="Toàn màn hình ảnh"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isFullscreenImage ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Content Renderers */}
              <div className="flex-1 p-3 flex items-center justify-center overflow-auto min-h-[280px]">
                {fileTypeMeta.typeCategory === 'image' && submission.fileDataUrl ? (
                  <div className="flex items-center justify-center w-full h-full overflow-auto">
                    <img
                      src={submission.fileDataUrl}
                      alt={submission.fileName}
                      style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                      className={`max-h-[500px] max-w-full object-contain rounded-xl shadow-md transition-transform duration-200 border border-outline-variant/30 ${
                        isFullscreenImage ? 'fixed inset-4 z-50 max-h-none bg-black/90 p-4' : ''
                      }`}
                    />
                  </div>
                ) : submission.driveFileUrl ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[36px]">cloud</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">
                        Bài nộp được lưu trữ trên Google Drive
                      </h4>
                      <p className="text-xs text-on-surface-variant max-w-md mt-1">
                        Học sinh đã liên kết tệp trực tiếp từ thư mục Google Drive của Thầy. Bấm nút dưới đây để mở xem tài liệu:
                      </p>
                    </div>
                    <a
                      href={submission.driveFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      <span>Mở xem trên Google Drive</span>
                    </a>
                  </div>
                ) : submission.fileDataUrl ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${fileTypeMeta.colorClass}`}
                    >
                      <span className="material-symbols-outlined text-[36px]">
                        {fileTypeMeta.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{submission.fileName}</h4>
                      <p className="text-xs text-on-surface-variant max-w-md mt-1">
                        Tệp {fileTypeMeta.label} ({submission.fileSize || '1.0 MB'}). Thầy/Cô có thể tải về để mở trực tiếp trong phần mềm chuyên dụng (Word, Excel, PowerPoint, Scratch) hoặc mở trên thư mục Google Drive.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          triggerDownloadSubmissionFile(submission.fileName, submission.fileDataUrl!)
                        }
                        className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Tải tệp gốc về máy</span>
                      </button>
                      <a
                        href={resolvedDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">folder_open</span>
                        <span>Mở thư mục Drive của Thầy</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-[36px] text-slate-400">
                      folder_open
                    </span>
                    <p className="font-semibold">
                      Chưa có bản xem trước cục bộ. Tệp đã được nộp vào Thư mục Google Drive của Lớp.
                    </p>
                    <a
                      href={resolvedDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>Mở Thư mục Google Drive của Thầy</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Grading & Feedback */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-outline-variant/30 justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-xs font-black uppercase text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">grade</span>
                  Chấm điểm & Nhận xét sản phẩm
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    submission.status === 'Đã chấm'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {submission.status}
                </span>
              </div>

              {/* Score Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Điểm thực hành (Thang 3.0 điểm):</span>
                  <span className="text-sm font-black text-emerald-600">
                    {Number(score).toFixed(1)} / 3.0 điểm
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.25"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="3"
                    step="0.25"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-center font-black text-sm text-emerald-600"
                  />
                </div>
              </div>

              {/* Quick feedback chips */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-on-surface-variant">
                  Gợi ý nhận xét nhanh 1-chạm:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '🌟 Xuất sắc! Thao tác chuẩn xác và nộp bài đúng hạn.',
                    '👍 Hoàn thành tốt yêu cầu thực hành trên máy.',
                    '💡 Bài làm đủ nội dung, cần chú ý định dạng đẹp hơn.',
                    '⚡ Đã nộp sản phẩm, cần kiểm tra kỹ lại bảng số liệu.',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFeedback(chip)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 text-[11px] text-on-surface text-left cursor-pointer transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Teacher Feedback */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">
                  Lời nhận xét của Thầy/Cô gửi học sinh:
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập lời khen hoặc dặn dò em học sinh hoàn thiện sản phẩm..."
                  className="w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface leading-relaxed focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-3 border-t border-outline-variant/25 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Lưu Điểm & Đồng Bộ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
