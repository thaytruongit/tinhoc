import React from 'react';
import { type StudentRosterItem } from '../data/mockCurriculumData';
import {
  getNextBadgeProgress,
  triggerSynchronizedCelebration,
} from '../utils/soundEffects';
import { BadgeLibraryPanel } from './BadgeLibraryPanel';

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

      {/* 2. ACHIEVEMENT BADGES LIBRARY (WITH 3D FLIP CARDS) */}
      <BadgeLibraryPanel
        currentStudent={currentStudent}
        onShowToast={onShowToast}
        title="Thư Viện Huy Hiệu Thành Tựu"
        subtitle="Hiệu ứng lật thẻ (Flip Card): Nhấp vào bất kỳ huy hiệu nào để xem chi tiết điều kiện mở khóa, số XP/sao còn thiếu và mẹo sư phạm"
      />
    </div>
  );
};

