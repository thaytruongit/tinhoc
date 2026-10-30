import React, { useState } from 'react';
import { type StudentRosterItem } from '../data/mockCurriculumData';
import {
  getNextBadgeProgress,
  triggerSynchronizedCelebration,
} from '../utils/soundEffects';

export type CompanionSelectionMode = 'unselected' | 'paired' | 'solo';

interface StudentCompanionSelectorProps {
  currentStudent: StudentRosterItem;
  students: StudentRosterItem[];
  classRank: number;
  totalClassStudents: number;
  gradeRank: number;
  totalGradeStudents: number;
  companionMode?: CompanionSelectionMode;
  onConfirmCompanionMode?: (
    mode: 'paired' | 'solo',
    partner?: StudentRosterItem | null
  ) => void;
  forceOpenModal?: boolean;
  onCloseForcedModal?: () => void;
  onProceedToLiveAfterSelect?: () => void;
  onUpdatePartner: (partner: StudentRosterItem | null) => void;
  onShowToast: (msg: string) => void;
}

export const StudentCompanionSelector: React.FC<StudentCompanionSelectorProps> = ({
  currentStudent,
  students,
  classRank,
  companionMode = 'unselected',
  onConfirmCompanionMode,
  forceOpenModal = false,
  onCloseForcedModal,
  onProceedToLiveAfterSelect,
  onUpdatePartner,
  onShowToast,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isModalVisible = showModal || forceOpenModal;

  const closeModal = () => {
    setShowModal(false);
    if (onCloseForcedModal) onCloseForcedModal();
  };

  // Classmates excluding current student
  const classmates = students.filter(
    (s) => s.classId === currentStudent.classId && s.id !== currentStudent.id
  );

  const filteredClassmates = classmates.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.includes(searchQuery) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Companion initials
  const getInitials = (name: string) => {
    if (!name) return 'HS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const partnerStudent =
    students.find((s) => s.id === currentStudent.partnerId) ||
    (currentStudent.partnerName && currentStudent.partnerName !== 'Học cá nhân (1 mình)'
      ? {
          id: currentStudent.partnerId || '61009',
          name: currentStudent.partnerName || 'Nguyễn Bảo An',
          classId: currentStudent.classId,
          username: 'partner_6a10',
          stationNumber: '09',
          dob: '',
          grade: currentStudent.grade,
          passwordDefault: '12345',
          xp: currentStudent.xp,
          streakDays: currentStudent.streakDays,
          stars: currentStudent.stars,
          groupNumber: currentStudent.groupNumber,
          partnerName: currentStudent.name,
          partnerId: currentStudent.id,
          avgScore: currentStudent.avgScore,
          submissionStatus: 'Đang làm' as const,
        }
      : null);

  const handleSelectCompanion = (st: StudentRosterItem) => {
    onUpdatePartner(st);
    if (onConfirmCompanionMode) {
      onConfirmCompanionMode('paired', st);
    }
    triggerSynchronizedCelebration('xp');
    closeModal();
    onShowToast(
      `🎉 Đã chọn bạn đồng hành ${st.name} (Mã: ${st.id}) ngồi chung máy! Sẵn sàng vào Phòng Live!`
    );
    if (forceOpenModal && onProceedToLiveAfterSelect) {
      onProceedToLiveAfterSelect();
    }
  };

  const handleSelectSoloMode = () => {
    onUpdatePartner(null);
    if (onConfirmCompanionMode) {
      onConfirmCompanionMode('solo', null);
    }
    closeModal();
    onShowToast(
      `✓ Đã xác nhận chế độ Học cá nhân (Không có bạn đồng hành)! Sẵn sàng vào Phòng Live!`
    );
    if (forceOpenModal && onProceedToLiveAfterSelect) {
      onProceedToLiveAfterSelect();
    }
  };

  const {
    currentBadge,
    nextBadge,
    xpRemaining,
    starsRemaining,
    progressPercent,
    unlockedCount,
    totalBadges,
  } = getNextBadgeProgress(currentStudent.xp, currentStudent.stars);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. GREETING BANNER + INTEGRATED XP PROGRESS BAR TOWARD NEXT BADGE */}
      <div className="relative w-full rounded-3xl bg-gradient-to-r from-sky-50 via-white to-amber-50/40 p-6 sm:p-8 border border-sky-100 shadow-xs overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2.5 max-w-2xl">
            {/* Green Cloud DB Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ĐÁM MÂY HỌC TẬP TRỰC TUYẾN (CLOUD DB) • ĐỒNG BỘ CSDL THỜI GIAN THỰC</span>
            </div>

            {/* Greeting Headline */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>Chào</span>
              <span className="text-amber-800 font-extrabold">{currentStudent.name}</span>
              <span className="text-slate-700">(Lớp {currentStudent.classId})!</span>
              <span className="text-2xl">✨</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Chúc em một buổi học vui vẻ, tràn đầy cảm hứng và gom thật nhiều ngôi sao hôm nay!
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
            {/* Streak Days */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[90px] sm:min-w-[105px]">
              <div className="flex items-center gap-1 text-amber-600 font-black text-xl sm:text-2xl">
                <span>🔥</span>
                <span>{currentStudent.streakDays || 5}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5 text-center">
                Chuỗi ngày 🔥
              </span>
            </div>

            {/* Total XP */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[90px] sm:min-w-[105px]">
              <div className="flex items-center gap-1 text-sky-600 font-black text-xl sm:text-2xl">
                <span>✪</span>
                <span>{currentStudent.xp.toLocaleString()}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5 text-center">
                Tổng điểm XP
              </span>
            </div>

            {/* Class Rank */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[90px] sm:min-w-[105px]">
              <div className="flex items-center gap-1 text-emerald-600 font-black text-xl sm:text-2xl">
                <span>🏆</span>
                <span>#{classRank || 3}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5 text-center">
                Hạng lớp {currentStudent.classId}
              </span>
            </div>
          </div>
        </div>

        {/* INTEGRATED XP PROGRESS BAR TOWARD NEXT BADGE RIGHT ON STUDENT HOMEPAGE */}
        <div className="relative z-10 rounded-2xl bg-white/95 p-4 sm:p-5 border border-sky-100/90 shadow-2xs flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${nextBadge.color} text-white flex items-center justify-center shadow-xs shrink-0`}
              >
                <span className="material-symbols-outlined text-[20px]">{nextBadge.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    Tiến trình Huy hiệu kế tiếp: {nextBadge.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    Đã đạt {unlockedCount}/{totalBadges} Huy hiệu
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {xpRemaining > 0 ? (
                    <>
                      Khoảng cách còn thiếu:{' '}
                      <strong className="text-orange-600 font-black">
                        +{xpRemaining.toLocaleString()} XP
                      </strong>
                      {starsRemaining > 0 ? ` (hoặc ${starsRemaining} Sao)` : ''} để nhận huy hiệu{' '}
                      <strong>{nextBadge.name}</strong>!
                    </>
                  ) : (
                    <strong className="text-emerald-600">
                      🎉 Chúc mừng! Em đã đủ điểm XP mở khóa huy hiệu {nextBadge.name}!
                    </strong>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentBadge && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]">{currentBadge.icon}</span>
                  <span>Hiện tại: {currentBadge.name}</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerSynchronizedCelebration('badge');
                  onShowToast(
                    `🎵 Đã phát âm thanh chúc mừng & pháo hoa Huy hiệu "${
                      currentBadge ? currentBadge.name : nextBadge.name
                    }"!`
                  );
                }}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                title="Phát thử âm thanh huy hiệu & pháo hoa"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>Âm thanh &amp; Pháo hoa ({progressPercent}%)</span>
              </button>
            </div>
          </div>

          {/* Animated XP Distance Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-600">
              <span className="text-sky-700">
                Điểm XP hiện tại: {currentStudent.xp.toLocaleString()} XP
              </span>
              <span className="text-orange-600">
                {xpRemaining > 0
                  ? `Còn thiếu: ${xpRemaining.toLocaleString()} XP`
                  : 'Đã hoàn thành mục tiêu XP!'}
              </span>
              <span className="text-emerald-700">
                Mốc huy hiệu kế tiếp: {nextBadge.xpRequired.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPANION GROUP SECTION - MANDATORY SELECTION BEFORE ENTERING LIVE ROOM */}
      <div className="relative w-full rounded-3xl bg-white p-6 sm:p-7 shadow-xs border border-slate-100 flex flex-col gap-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">group_add</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Nhóm Tự Học &amp; Bạn Đồng Hành Ngồi Cùng Máy
                </h2>
                {companionMode === 'unselected' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-300 animate-pulse">
                    ⚠️ Chọn bạn hoặc chọn "Không có" trước khi vào Phòng Live
                  </span>
                ) : companionMode === 'paired' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                    ✓ Đã chọn bạn đồng hành ({partnerStudent?.name}) — Sẵn sàng vào Live
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black border border-indigo-300">
                    ✓ Đã chọn: Không có bạn đồng hành (Học 1 mình) — Sẵn sàng vào Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Học sinh chọn trước bạn đồng hành ngồi chung máy hoặc xác nhận học cá nhân (không có bạn đồng hành) để vào Phòng Live
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-semibold w-fit">
            <span>⚡</span>
            <span>Cả 2 bạn cùng nhận +100% XP và đồng bộ phiếu lên Cloud DB</span>
          </div>
        </div>

        {/* 3 Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Primary Student ("Chính") */}
          <div className="rounded-2xl p-4 bg-sky-50/50 border border-sky-100/80 flex items-center gap-3.5 transition-all">
            <div className="relative shrink-0">
              <div className="w-13 h-13 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                {getInitials(currentStudent.name)}
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-orange-800 text-white text-[10px] font-black tracking-wide">
                Chính
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">
                {currentStudent.name}
              </span>
              <span className="text-xs text-slate-500">
                Mã HS: {currentStudent.id} • Lớp {currentStudent.classId}
              </span>
              <div className="flex items-center gap-1 mt-1 text-emerald-600 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sẵn sàng học</span>
              </div>
            </div>
          </div>

          {/* Card 2: Paired Companion ("Bạn 1") OR Solo Status */}
          {companionMode === 'solo' ? (
            <div className="rounded-2xl p-4 bg-indigo-50/60 border-2 border-indigo-300 flex items-center justify-between gap-3 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">person</span>
                  </div>
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-indigo-900 text-white text-[10px] font-black tracking-wide whitespace-nowrap">
                    Cá nhân
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    Không có bạn đồng hành
                  </span>
                  <span className="text-xs text-slate-500">
                    Ngồi 1 mình 1 máy • Lớp {currentStudent.classId}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-indigo-700 text-xs font-bold">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Đã xác nhận học 1 mình</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold shadow-2xs hover:bg-slate-50 cursor-pointer shrink-0 transition-all"
              >
                Chọn bạn
              </button>
            </div>
          ) : (
            <div
              className={`rounded-2xl p-4 flex items-center justify-between gap-3 transition-all ${
                companionMode === 'paired'
                  ? 'bg-emerald-50/60 border-2 border-emerald-400'
                  : 'bg-sky-50/50 border border-sky-100/80'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                    {getInitials(partnerStudent?.name || 'BA')}
                  </div>
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-sky-800 text-white text-[10px] font-black tracking-wide whitespace-nowrap">
                    Bạn 1
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {partnerStudent?.name || 'Chưa chọn bạn'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {partnerStudent
                      ? `Mã HS: ${partnerStudent.id} • Lớp ${partnerStudent.classId}`
                      : 'Bấm để chọn bạn ngồi chung máy'}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-sky-700 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">
                      {companionMode === 'paired' ? 'verified' : 'sync'}
                    </span>
                    <span>
                      {companionMode === 'paired'
                        ? 'Đã xác nhận ghép cặp'
                        : 'Gợi ý ghép cặp'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                {companionMode !== 'paired' && partnerStudent && (
                  <button
                    type="button"
                    onClick={() => handleSelectCompanion(partnerStudent)}
                    className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer transition-all"
                  >
                    ✓ Chọn bạn này
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold shadow-2xs hover:bg-slate-50 cursor-pointer shrink-0 transition-all"
                >
                  Đổi bạn
                </button>
              </div>
            </div>
          )}

          {/* Card 3: Choose Companion OR Confirm No Companion */}
          <div className="rounded-2xl p-4 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ Chọn bạn học cùng</span>
              </button>

              <button
                type="button"
                onClick={handleSelectSoloMode}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                  companionMode === 'solo'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Không có bạn (1 mình)</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500">
              Chọn 1 bạn cùng lớp ngồi chung máy hoặc bấm <strong>"Không có bạn (1 mình)"</strong> trước khi vào Phòng Live
            </span>
          </div>
        </div>
      </div>

      {/* COMPANION SELECTION MODAL */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[88vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600">group</span>
                  <span>
                    {forceOpenModal
                      ? 'Bước bắt buộc: Chọn Bạn Đồng Hành Hoặc Học 1 Mình Để Vào Phòng Live'
                      : 'Chọn Bạn Đồng Hành (Ngồi Chung Máy)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vui lòng chọn bạn ngồi cùng máy trong lớp {currentStudent.classId} hoặc chọn "Không có bạn đồng hành"
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Option 1: Solo Mode Banner right at the top of the modal */}
            <div className="px-4 pt-4 pb-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Em ngồi 1 mình 1 máy (Không có bạn đồng hành)?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bấm nút bên cạnh để xác nhận học cá nhân và vào thẳng Phòng Live
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSelectSoloMode}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-all"
              >
                Không có bạn đồng hành →
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hoặc tìm bạn cùng lớp theo họ tên, mã HS..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* List of classmates */}
            <div className="overflow-y-auto p-4 flex flex-col gap-2 flex-1">
              {filteredClassmates.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Không tìm thấy bạn nào khớp với tìm kiếm.
                </div>
              ) : (
                filteredClassmates.map((mate) => {
                  const isCurrentPartner =
                    companionMode === 'paired' && mate.id === currentStudent.partnerId;
                  return (
                    <div
                      key={mate.id}
                      onClick={() => handleSelectCompanion(mate)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrentPartner
                          ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400/30'
                          : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(mate.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">
                            {mate.name} {isCurrentPartner && '★ (Đang ghép)'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Mã: {mate.id} • Máy #{mate.stationNumber || '01'} • {mate.xp} XP
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                          isCurrentPartner
                            ? 'bg-sky-600 text-white'
                            : 'bg-sky-100 hover:bg-sky-600 hover:text-white text-sky-800'
                        }`}
                      >
                        {isCurrentPartner ? '✓ Đang chọn' : 'Chọn bạn này'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
