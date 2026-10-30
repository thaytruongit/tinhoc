import React, { useState } from 'react';
import { type StudentRosterItem } from '../data/mockCurriculumData';
import {
  ACHIEVEMENT_BADGES,
  getNextBadgeProgress,
  triggerSynchronizedCelebration,
  type AchievementBadgeSpec,
} from '../utils/soundEffects';

interface StudentMetricsDashboardProps {
  currentStudent: StudentRosterItem;
  students: StudentRosterItem[];
  classRank: number;
  totalClassStudents: number;
  gradeRank: number;
  totalGradeStudents: number;
  onShowToast: (msg: string) => void;
}

export const StudentMetricsDashboard: React.FC<StudentMetricsDashboardProps> = ({
  currentStudent,
  classRank,
  totalClassStudents,
  gradeRank,
  totalGradeStudents,
  onShowToast,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadgeSpec | null>(null);

  const {
    nextBadge,
    xpRemaining,
    starsRemaining,
    progressPercent,
  } = getNextBadgeProgress(currentStudent.xp, currentStudent.stars);

  // Trigger synchronized audio cue + confetti fireworks
  const triggerCelebration = (badgeName: string) => {
    triggerSynchronizedCelebration('badge');
    onShowToast(`🎵🎉 Chúc mừng em đã đạt Huy hiệu: ${badgeName}!`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. RANKING METRICS & XP GOAL PROGRESS BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: XP Goal & Next Badge Bar (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-xs border border-slate-100 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">military_tech</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mục Tiêu Huy Hiệu Tiếp Theo: {nextBadge.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Cần thêm <strong className="text-sky-700">{xpRemaining} XP</strong> và{' '}
                  <strong className="text-amber-700">{starsRemaining} Sao</strong> để mở khóa!
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-700 shadow-2xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Hiện tại: <strong>{currentStudent.xp.toLocaleString()} XP</strong>
              </span>
              <span className="text-orange-600 font-bold">
                Khoảng cách còn thiếu: {xpRemaining.toLocaleString()} XP
              </span>
              <span>
                Mục tiêu: <strong>{nextBadge.xpRequired.toLocaleString()} XP</strong>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-600">
              🌟 Hoàn thành mỗi hoạt động trên lớp đem lại từ <strong>+20 đến +50 XP</strong> kèm âm thanh chúc mừng.
            </span>
            <button
              type="button"
              onClick={() => triggerCelebration(nextBadge.name)}
              className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">volume_up</span>
              <span>Phát âm thanh &amp; Pháo hoa</span>
            </button>
          </div>
        </div>

        {/* Right: Personal Rank Comparison (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-xs border border-slate-100 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                bar_chart
              </span>
              <span>Xếp Hạng Cá Nhân</span>
            </h3>
            <span className="text-xs text-slate-400">Thời gian thực</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Class Rank Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-1 items-center text-center">
              <span className="text-xs font-semibold text-emerald-800">
                Theo Lớp {currentStudent.classId}
              </span>
              <span className="text-2xl font-black text-emerald-700">#{classRank}</span>
              <span className="text-[11px] text-emerald-600">
                Top {Math.round((classRank / totalClassStudents) * 100)}% ({classRank}/{totalClassStudents} HS)
              </span>
            </div>

            {/* Grade Rank Card */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1 items-center text-center">
              <span className="text-xs font-semibold text-sky-800">
                Toàn Khối {currentStudent.grade}
              </span>
              <span className="text-2xl font-black text-sky-700">#{gradeRank}</span>
              <span className="text-[11px] text-sky-600">
                Top {Math.round((gradeRank / totalGradeStudents) * 100)}% ({gradeRank}/{totalGradeStudents} HS)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Thứ hạng dựa trên tổng điểm XP và số sao tích lũy từ các hoạt động học tập.
          </p>
        </div>
      </div>

      {/* 2. ACHIEVEMENT BADGES GALLERY */}
      <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-xs border border-slate-100 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
              <span>Bộ Sưu Tập Huy Hiệu Thành Tựu (Achievement Badges)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trao cho học sinh dựa trên số sao tích lũy và tiến độ hoàn thành các tiết học (Kèm hiệu ứng âm thanh &amp; pháo hoa)
            </p>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            ⭐ {currentStudent.stars} Ngôi Sao Tích Lũy
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {ACHIEVEMENT_BADGES.map((badge) => {
            const isUnlocked =
              currentStudent.xp >= badge.xpRequired || currentStudent.stars >= badge.starsRequired;

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isUnlocked) {
                    triggerCelebration(badge.name);
                  } else {
                    onShowToast(
                      `🔒 Huy hiệu chưa mở khóa. Cần đạt ${badge.xpRequired} XP hoặc ${badge.starsRequired} sao.`
                    );
                  }
                  setSelectedBadge(badge);
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer relative ${
                  isUnlocked
                    ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:scale-102 ring-1 ring-amber-400/30'
                    : 'bg-slate-50/80 border-slate-200/50 opacity-50 grayscale hover:grayscale-0'
                }`}
              >
                {/* Badge Icon Circle */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center shadow-md shrink-0`}
                >
                  <span className="material-symbols-outlined text-[28px]">{badge.icon}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {badge.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {badge.starsRequired} Sao • {badge.xpRequired} XP
                  </span>
                </div>

                {isUnlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    ✓ Đạt được
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">lock</span>
                    Khóa
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${selectedBadge.color} text-white flex items-center justify-center shadow-lg`}
            >
              <span className="material-symbols-outlined text-[40px]">{selectedBadge.icon}</span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">{selectedBadge.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{selectedBadge.description}</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-2xl w-full justify-around">
              <span>⭐ {selectedBadge.starsRequired} Ngôi sao</span>
              <span>✪ {selectedBadge.xpRequired} XP</span>
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  triggerCelebration(selectedBadge.name);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>Phát âm thanh &amp; Pháo hoa 🎆</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
