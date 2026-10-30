import React, { useState } from 'react';
import { StudentRosterItem } from '../data/mockCurriculumData';

interface PeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentRosterItem;
  onShowToast: (msg: string) => void;
}

export const PeerReviewModal: React.FC<PeerReviewModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onShowToast,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const partnerName = currentStudent.partnerName || 'Bạn cùng cặp';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(`✨ Đã gửi đánh giá đồng đẳng cho ${partnerName} thành công! (+10 XP)`);
    setFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rate_review</span>
            Đánh Giá Đồng Đẳng (Peer Review)
          </h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-on-surface-variant">
            Gửi nhận xét và đánh giá cho bạn đồng hành ngồi chung máy: <strong className="text-primary">{partnerName}</strong>.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Mức độ hỗ trợ / hợp tác:</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    rating >= star
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {star} ⭐
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Nhận xét / Lời khen:</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={`VD: Cảm ơn ${partnerName} đã hỗ trợ tớ hoàn thành phần kéo thả rất nhanh!`}
              className="p-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold shadow-sm"
            >
              Gửi Đánh Giá (+10 XP)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
