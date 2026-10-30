import React, { useState } from 'react';
import { type StudentRosterItem } from '../data/mockCurriculumData';
import {
  ACHIEVEMENT_BADGES,
  getNextBadgeProgress,
  triggerSynchronizedCelebration,
  type AchievementBadgeSpec,
} from '../utils/soundEffects';

interface BadgeLibraryPanelProps {
  currentStudent: StudentRosterItem;
  onShowToast: (msg: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

interface EnrichedBadge extends AchievementBadgeSpec {
  isUnlocked: boolean;
  xpDistance: number;
  starsDistance: number;
  percentComplete: number;
  pedagogicalTip: string;
  taskRequirement: string;
}

export const BadgeLibraryPanel: React.FC<BadgeLibraryPanelProps> = ({
  currentStudent,
  onShowToast,
  title = 'Thư Viện Huy Hiệu Thành Tựu',
  subtitle = 'Nhấp vào bất kỳ huy hiệu nào để lật thẻ (Flip Card) và xem chi tiết yêu cầu, tiến độ và cách mở khóa',
  compact = false,
}) => {
  // Track which cards are flipped (set of badge IDs)
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  // Filter: 'all' | 'unlocked' | 'locked' | 'sao' | 'tien-do' | 'dong-dang'
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked' | 'sao' | 'tien-do' | 'dong-dang'>('all');

  const { nextBadge, xpRemaining, starsRemaining, progressPercent, unlockedCount, totalBadges } =
    getNextBadgeProgress(currentStudent.xp, currentStudent.stars);

  // Map enriched metadata for each badge
  const enrichedBadges: EnrichedBadge[] = ACHIEVEMENT_BADGES.map((b) => {
    const isUnlocked = currentStudent.xp >= b.xpRequired && currentStudent.stars >= b.starsRequired;
    const xpDistance = Math.max(0, b.xpRequired - currentStudent.xp);
    const starsDistance = Math.max(0, b.starsRequired - currentStudent.stars);

    // Calculate overall percent towards this specific badge
    const xpRatio = Math.min(1, currentStudent.xp / b.xpRequired);
    const starRatio = Math.min(1, currentStudent.stars / b.starsRequired);
    const percentComplete = isUnlocked ? 100 : Math.round(((xpRatio + starRatio) / 2) * 100);

    let pedagogicalTip = 'Chăm chỉ hoàn thành các hoạt động trên lớp và làm lại bài tự luyện ở nhà để tích lũy thêm điểm.';
    let taskRequirement = 'Đạt mốc XP và số sao tiêu chuẩn của chương trình GDPT 2018.';

    if (b.id === 'b1') {
      taskRequirement = 'Hoàn thành trọn vẹn tiết học đầu tiên, chọn bạn học đồng hành cùng máy tính.';
      pedagogicalTip = 'Mẹo: Vào phần "Nhóm Tự Học & Bạn Đồng Hành" tại trang chủ để kết nối cùng bạn ngồi cạnh máy.';
    } else if (b.id === 'b2') {
      taskRequirement = 'Đạt điểm tối đa trong Hoạt động 3 (Đấu trường 25s) và nộp Phiếu học tập Khám phá.';
      pedagogicalTip = 'Mẹo: Trả lời nhanh và chính xác 10 câu trắc nghiệm phản xạ 25 giây trong các buổi học trực tiếp.';
    } else if (b.id === 'b3') {
      taskRequirement = 'Được bạn cùng bàn / cùng cặp gửi phản hồi đánh giá đồng đẳng (Peer Review) tích cực.';
      pedagogicalTip = 'Mẹo: Tích cực thảo luận, chia sẻ cách làm bài phiếu học tập và tương tác qua nút "Đánh giá đồng đẳng".';
    } else if (b.id === 'b4') {
      taskRequirement = 'Phân loại chính xác 100% các khái niệm Thông tin, Dữ liệu và Vật mang tin trong Hoạt động 2.';
      pedagogicalTip = 'Mẹo: Ôn tập lại bảng phân loại dữ liệu và hoàn thành xuất sắc các phiếu kéo thả & nối cột.';
    } else if (b.id === 'b5') {
      taskRequirement = 'Đóng gói sản phẩm thực hành và nộp thành công lên thư mục Google Drive của lớp học.';
      pedagogicalTip = 'Mẹo: Tại Hoạt động 3 hoặc 4 của bài thực hành, chọn tệp tin kết quả và nhấn "Nộp sản phẩm lên Drive".';
    } else if (b.id === 'b6') {
      taskRequirement = 'Tương tác thông minh với Trợ lý AI Cú Vàng và hoàn thành thử thách học sinh làm sớm (Fast-Finisher).';
      pedagogicalTip = 'Mẹo: Vào mục "Trợ lý AI Cú Vàng", gửi ít nhất 5 câu hỏi học tập và nhận giải đáp sư phạm chuẩn QĐ 3439.';
    }

    return {
      ...b,
      isUnlocked,
      xpDistance,
      starsDistance,
      percentComplete,
      pedagogicalTip,
      taskRequirement,
    };
  });

  const toggleFlip = (badgeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCardIds((prev) => ({
      ...prev,
      [badgeId]: !prev[badgeId],
    }));
  };

  const handleFlipAllLocked = () => {
    const nextState: Record<string, boolean> = {};
    enrichedBadges.forEach((b) => {
      if (!b.isUnlocked) {
        nextState[b.id] = true;
      }
    });
    setFlippedCardIds(nextState);
    onShowToast('🔄 Đã lật tất cả huy hiệu đang khóa để hiển thị điều kiện mở khóa!');
  };

  const handleResetFlips = () => {
    setFlippedCardIds({});
    onShowToast('↺ Đã trở về giao diện mặt trước của toàn bộ huy hiệu.');
  };

  const filteredBadges = enrichedBadges.filter((b) => {
    if (filterMode === 'unlocked') return b.isUnlocked;
    if (filterMode === 'locked') return !b.isUnlocked;
    if (filterMode === 'sao') return b.category === 'sao';
    if (filterMode === 'tien-do') return b.category === 'tien-do';
    if (filterMode === 'dong-dang') return b.category === 'dong-dang';
    return true;
  });

  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col gap-6">
      {/* 1. Header Bar with Progress Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-[30px]">workspace_premium</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                {unlockedCount} / {totalBadges} Đã Mở Khóa
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{subtitle}</p>
          </div>
        </div>

        {/* Action Buttons: Flip All / Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleFlipAllLocked}
            className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Lật đồng loạt các huy hiệu chưa đạt để đọc yêu cầu mở khóa"
          >
            <span className="material-symbols-outlined text-[16px]">flip</span>
            <span>Lật xem điều kiện thẻ khóa</span>
          </button>

          <button
            type="button"
            onClick={handleResetFlips}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Trở lại mặt trước"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Mặt trước</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-2 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: `Tất cả (${totalBadges})`, icon: 'apps' },
            { id: 'unlocked', label: `Đã đạt (${unlockedCount})`, icon: 'check_circle' },
            { id: 'locked', label: `Đang khóa (${totalBadges - unlockedCount})`, icon: 'lock' },
            { id: 'sao', label: 'Tích lũy Sao ⭐', icon: 'star' },
            { id: 'tien-do', label: 'Tiến độ học 📚', icon: 'trending_up' },
            { id: 'dong-dang', label: 'Bạn đồng hành 👥', icon: 'groups' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as typeof filterMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === tab.id
                  ? 'bg-white text-orange-600 shadow-xs border border-orange-200 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2">
          💡 <span className="font-semibold text-slate-700">Mẹo:</span> Nhấp trực tiếp vào bất kỳ thẻ nào để lật qua mặt sau
        </div>
      </div>

      {/* 3. FLIP CARD GRID WITH 3D CSS TRANSFORMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => {
          const isFlipped = Boolean(flippedCardIds[badge.id]);

          return (
            <div
              key={badge.id}
              className="group h-[320px] select-none"
              style={{ perspective: '1000px' }}
            >
              {/* Card Container with 3D Preserved Transform */}
              <div
                onClick={() => toggleFlip(badge.id)}
                className="relative w-full h-full rounded-2xl cursor-pointer transition-transform duration-500 shadow-xs"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* ================= CARD FRONT ================= */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between border-2 transition-all overflow-hidden ${
                    badge.isUnlocked
                      ? 'bg-gradient-to-b from-white via-amber-50/20 to-white border-amber-300/80 shadow-md ring-1 ring-amber-400/20'
                      : 'bg-white border-slate-200/80 hover:border-sky-300'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Top Status & Ribbons */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        badge.isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {badge.isUnlocked ? 'verified' : 'lock'}
                      </span>
                      <span>{badge.isUnlocked ? 'ĐÃ MỞ KHÓA' : 'ĐANG KHÓA'}</span>
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {badge.percentComplete}%
                    </span>
                  </div>

                  {/* Centered Badge Avatar & Name */}
                  <div className="flex flex-col items-center text-center gap-3 my-auto">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-300`}
                      >
                        <span className="material-symbols-outlined text-[42px]">{badge.icon}</span>
                      </div>
                      {!badge.isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-800 text-amber-400 border-2 border-white flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                        </div>
                      )}
                      {badge.isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white border-2 border-white flex items-center justify-center shadow-sm animate-bounce">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <h4 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 px-2">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats Preview & Flip Prompt */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.isUnlocked
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-sky-400 to-amber-500'
                        }`}
                        style={{ width: `${badge.percentComplete}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-600 flex items-center gap-0.5">
                        ⭐ {badge.starsRequired} Sao
                      </span>
                      <span className="text-sky-700">✪ {badge.xpRequired} XP</span>
                      <span className="text-orange-600 font-extrabold flex items-center gap-0.5 hover:underline">
                        <span>Lật xem chi tiết</span>
                        <span className="material-symbols-outlined text-[13px]">sync_alt</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================= CARD BACK (CHI TIẾT YÊU CẦU ĐẠT ĐƯỢC) ================= */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between border-2 border-orange-300 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 text-slate-900 shadow-lg overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Top Bar on Back */}
                  <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-orange-600 text-[18px]">
                        rule
                      </span>
                      <span className="text-xs font-black uppercase text-orange-700 tracking-wider">
                        YÊU CẦU MỞ KHÓA
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleFlip(badge.id, e)}
                      className="p-1 rounded-full bg-white hover:bg-orange-100 text-orange-700 transition-colors shadow-2xs"
                      title="Lật lại mặt trước"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  {/* Body on Back: Detailed Criteria & Distance */}
                  <div className="flex flex-col gap-2.5 my-auto text-xs">
                    <div className="bg-white/90 p-3 rounded-xl border border-orange-100/80 shadow-2xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Điểm XP yêu cầu:</span>
                        <span className="text-sky-700 font-black">
                          {currentStudent.xp} / {badge.xpRequired} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Số sao yêu cầu:</span>
                        <span className="text-amber-700 font-black">
                          {currentStudent.stars} / {badge.starsRequired} ⭐
                        </span>
                      </div>

                      {/* Remaining gap */}
                      {!badge.isUnlocked ? (
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-red-600">
                          <span>Còn thiếu để đạt:</span>
                          <span>
                            {badge.xpDistance > 0 && `+${badge.xpDistance} XP `}
                            {badge.starsDistance > 0 && `+${badge.starsDistance} Sao`}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-1 border-t border-slate-100 text-[11px] font-black text-emerald-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>Em đã xuất sắc hoàn thành điều kiện này!</span>
                        </div>
                      )}
                    </div>

                    {/* Task Requirement Note */}
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                        🎯 Nhiệm vụ học tập cần đạt:
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed bg-white/60 p-2 rounded-lg border border-orange-100/60">
                        {badge.taskRequirement}
                      </p>
                    </div>

                    {/* Pedagogical Tip */}
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-orange-800 text-[11px]">
                        💡 Hướng dẫn sư phạm:
                      </span>
                      <p className="text-slate-600 text-[11px] leading-tight">
                        {badge.pedagogicalTip}
                      </p>
                    </div>
                  </div>

                  {/* Actions on Back */}
                  <div className="pt-2 border-t border-orange-100 flex items-center justify-between gap-2">
                    {badge.isUnlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerSynchronizedCelebration('badge');
                          onShowToast(`🎉 Âm thanh chiến thắng của Huy hiệu "${badge.name}"!`);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">volume_up</span>
                        <span>Nghe chuông &amp; Pháo hoa</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowToast(
                            `💡 Để mở khóa "${badge.name}", em hãy hoàn thành bài tập trên lớp để nhận thêm +${badge.xpDistance} XP nhé!`
                          );
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">flag</span>
                        <span>Đặt làm mục tiêu phấn đấu</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => toggleFlip(badge.id, e)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer"
                    >
                      Mặt trước
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
