import React, { useState } from 'react';
import type { StudentRosterItem } from '../data/mockCurriculumData';
import confetti from 'canvas-confetti';
import { triggerSynchronizedCelebration } from '../utils/soundEffects';

interface ClassLeaderboardPanelProps {
  currentStudent: StudentRosterItem;
  students: StudentRosterItem[];
  classId: string;
  grade: 6 | 7 | 8 | 9;
  onShowToast: (msg: string) => void;
  onSelectStudent?: (student: StudentRosterItem) => void;
}

type SortCriteria = 'xp' | 'streak' | 'stars' | 'score';

function getStudentTier(xp: number): { label: string; colorClass: string; icon: string } {
  if (xp >= 1500) {
    return { label: 'Đại Kiện Tướng', colorClass: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'military_tech' };
  }
  if (xp >= 1000) {
    return { label: 'Chiến Thần Tin Học', colorClass: 'bg-purple-100 text-purple-900 border-purple-300', icon: 'workspace_premium' };
  }
  if (xp >= 600) {
    return { label: 'Chuyên Gia Số', colorClass: 'bg-sky-100 text-sky-900 border-sky-300', icon: 'psychology' };
  }
  if (xp >= 300) {
    return { label: 'Tài Năng Trẻ', colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: 'bolt' };
  }
  return { label: 'Tân Binh Năng Nổ', colorClass: 'bg-slate-100 text-slate-800 border-slate-200', icon: 'emoji_events' };
}

export const ClassLeaderboardPanel: React.FC<ClassLeaderboardPanelProps> = ({
  currentStudent,
  students,
  classId,
  grade,
  onShowToast,
  onSelectStudent,
}) => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('xp');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cheeredStudentIds, setCheeredStudentIds] = useState<Record<string, string>>({});

  // Filter students belonging to this class
  const classMates = students.filter(
    (s) => s.classId === classId || s.id === currentStudent.id
  );

  // Fallback if classMates is empty
  const effectiveStudents = classMates.length > 0 ? classMates : [currentStudent];

  // Sort according to selected criteria
  const sortedStudents = [...effectiveStudents].sort((a, b) => {
    if (sortCriteria === 'xp') return b.xp - a.xp;
    if (sortCriteria === 'streak') return (b.streakDays || 1) - (a.streakDays || 1);
    if (sortCriteria === 'stars') return (b.stars || 0) - (a.stars || 0);
    if (sortCriteria === 'score') return (b.avgScore || 0) - (a.avgScore || 0);
    return b.xp - a.xp;
  });

  const myRank = Math.max(
    1,
    sortedStudents.findIndex((s) => s.id === currentStudent.id) + 1
  );

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  const studentAboveMe = myRank > 1 ? sortedStudents[myRank - 2] : null;
  const xpDifference = studentAboveMe ? Math.max(5, studentAboveMe.xp - currentStudent.xp + 5) : 0;

  const maxXp = Math.max(100, ...sortedStudents.map((s) => s.xp));

  const filteredList = sortedStudents.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.username && s.username.toLowerCase().includes(q))
    );
  });

  const handleCheerStudent = (student: StudentRosterItem, cheerEmoji: string) => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });
      triggerSynchronizedCelebration();
    } catch {
      // ignore
    }

    setCheeredStudentIds((prev) => ({
      ...prev,
      [student.id]: cheerEmoji,
    }));

    if (student.id === currentStudent.id) {
      onShowToast(`🎉 Bạn vừa tự thưởng cho mình lời chúc "${cheerEmoji}"! Tiếp tục bứt phá nhé!`);
    } else {
      onShowToast(
        `👏 Đã gửi lời cổ vũ "${cheerEmoji}" tới bạn ${student.name}! Tinh thần đồng đội thật tuyệt vời!`
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HERO HEADER BANNER: MOTIVATIONAL & VIBRANT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 sm:p-8 text-white shadow-lg border border-amber-300/40">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 border border-white/30">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/25 text-white">
                  ĐẤU TRƯỜNG THI ĐUA TÍCH CỰC
                </span>
                <span className="text-xs font-bold text-amber-100">
                  Lớp {classId} • Khối {grade}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Bảng Xếp Hạng Lớp Học
              </h2>
              <p className="text-xs sm:text-sm text-amber-50 mt-1 leading-relaxed">
                Ghi nhận nỗ lực rèn luyện, thi đua học tập tích cực qua từng tiết học Tin học GDPT 2018. Tích lũy XP từ bài tập, thực hành và minigame để vươn lên dẫn đầu!
              </p>
            </div>
          </div>

          {/* Quick Snapshot of Current Student's Rank */}
          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-100 uppercase block">
                Hạng của em
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                #{myRank}
              </span>
              <span className="text-[10px] text-amber-100 block">/ {sortedStudents.length} HS</span>
            </div>
            <div className="h-9 w-px bg-white/30" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-100 uppercase block">
                Tổng XP
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-200">
                {currentStudent.xp.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-100 block">Kinh nghiệm</span>
            </div>
            <div className="h-9 w-px bg-white/30" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-100 uppercase block">
                Chuỗi Streak
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1">
                🔥 {currentStudent.streakDays || 1}
              </span>
              <span className="text-[10px] text-amber-100 block">ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC MOTIVATION CALLOUT (BỨT PHÁ THỨ HẠNG) */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">
            {myRank === 1 ? '👑' : myRank <= 3 ? '🥈' : '🚀'}
          </span>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              {myRank === 1
                ? `Tuyệt vời! ${currentStudent.name} đang đứng vị trí Quán Quân Lớp ${classId}! 🥇`
                : studentAboveMe
                ? `Mục tiêu bứt phá: Chỉ cần thêm +${xpDifference} XP để vượt qua ${studentAboveMe.name} (Hạng #${myRank - 1})!`
                : `Hãy chăm chỉ luyện tập để vươn lên Top dẫn đầu Lớp ${classId}!`}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {myRank === 1
                ? 'Hãy duy trì phong độ và cùng hỗ trợ các bạn cùng bàn cùng tiến bộ nhé!'
                : 'Mẹo kiếm XP nhanh: Hoàn thành Đấu trường trắc nghiệm 25s (+20 XP), gửi bài thực hành Drive (+40 XP) và đạt chuỗi Streak hàng ngày!'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            confetti({ particleCount: 30, spread: 50 });
            onShowToast('💪 Quyết tâm bứt phá! Em hãy vào mục Hoạt động 3 Luyện tập ngay nhé!');
          }}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs cursor-pointer transition-transform hover:scale-105 shrink-0 flex items-center gap-1.5"
        >
          <span>💪 Quyết tâm bứt phá!</span>
        </button>
      </div>

      {/* 3. PODIUM TOP 3 (BỤC VINH QUANG) */}
      {sortedStudents.length >= 2 && (
        <div className="rounded-3xl bg-surface-container-lowest p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">workspace_premium</span>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Bục Vinh Quang — Top 3 Xuất Sắc Nhất Lớp {classId}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Cập nhật thời gian thực theo CSDL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 items-end">
            {/* RANK 2: BẠC (SILVER) - LEFT */}
            {top2 && (
              <div
                className={`order-2 md:order-1 rounded-2xl p-5 border text-center flex flex-col items-center gap-3 transition-all ${
                  top2.id === currentStudent.id
                    ? 'bg-sky-50/90 border-2 border-sky-400 shadow-md ring-2 ring-sky-300/40'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                    {top2.name.split(' ').slice(-1)[0]?.charAt(0) || '2'}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-md border border-white">
                    🥈 2
                  </span>
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="font-black text-sm text-slate-900 truncate">
                      {top2.name}
                    </h4>
                    {top2.id === currentStudent.id && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-sky-600 text-white">
                        Bạn
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">
                    Mã HS: {top2.id}
                  </span>
                  <div className="mt-2 text-base font-black text-slate-800">
                    {top2.xp.toLocaleString()} <span className="text-xs font-bold text-slate-500">XP</span>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                    🔥 {top2.streakDays || 1} ngày liên tục
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheerStudent(top2, '🥈')}
                  className="w-full py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <span>{cheeredStudentIds[top2.id] || 'Cổ vũ 👏'}</span>
                </button>
              </div>
            )}

            {/* RANK 1: VÀNG (GOLD) - CENTER & TALLEST */}
            {top1 && (
              <div
                className={`order-1 md:order-2 rounded-2xl p-6 border text-center flex flex-col items-center gap-3 relative shadow-md transition-all ${
                  top1.id === currentStudent.id
                    ? 'bg-amber-50 border-2 border-amber-400 ring-4 ring-amber-300/40'
                    : 'bg-gradient-to-b from-amber-50/90 to-yellow-50/40 border-amber-300'
                }`}
              >
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[11px] shadow-xs uppercase tracking-wider flex items-center gap-1">
                  <span>👑 Quán Quân</span>
                </div>

                <div className="relative mt-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-3 border-white ring-4 ring-amber-300/50">
                    {top1.name.split(' ').slice(-1)[0]?.charAt(0) || '1'}
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                    🥇
                  </span>
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="font-black text-base text-slate-900 truncate">
                      {top1.name}
                    </h4>
                    {top1.id === currentStudent.id && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-600 text-white">
                        Bạn
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-amber-700 block mt-0.5">
                    {getStudentTier(top1.xp).label}
                  </span>
                  <div className="mt-2 text-xl font-black text-amber-600">
                    {top1.xp.toLocaleString()} <span className="text-xs font-bold text-slate-600">XP</span>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-black text-amber-800 bg-amber-200/80 px-3 py-0.5 rounded-full">
                    ⭐ {top1.stars || 3} sao • 🔥 {top1.streakDays || 1} ngày
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheerStudent(top1, '👑')}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs cursor-pointer transition-transform hover:scale-105 flex items-center justify-center gap-1"
                >
                  <span>{cheeredStudentIds[top1.id] || 'Chúc mừng Quán Quân 🎉'}</span>
                </button>
              </div>
            )}

            {/* RANK 3: ĐỒNG (BRONZE) - RIGHT */}
            {top3 && (
              <div
                className={`order-3 rounded-2xl p-5 border text-center flex flex-col items-center gap-3 transition-all ${
                  top3.id === currentStudent.id
                    ? 'bg-sky-50/90 border-2 border-sky-400 shadow-md ring-2 ring-sky-300/40'
                    : 'bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/70'
                }`}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-100 flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                    {top3.name.split(' ').slice(-1)[0]?.charAt(0) || '3'}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md border border-white">
                    🥉 3
                  </span>
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="font-black text-sm text-slate-900 truncate">
                      {top3.name}
                    </h4>
                    {top3.id === currentStudent.id && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-sky-600 text-white">
                        Bạn
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">
                    Mã HS: {top3.id}
                  </span>
                  <div className="mt-2 text-base font-black text-slate-800">
                    {top3.xp.toLocaleString()} <span className="text-xs font-bold text-slate-500">XP</span>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    🔥 {top3.streakDays || 1} ngày liên tục
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheerStudent(top3, '🥉')}
                  className="w-full py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <span>{cheeredStudentIds[top3.id] || 'Thả tim ❤️'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD LIST WITH SORT TABS & SEARCH */}
      <div className="rounded-3xl bg-surface-container-lowest p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">format_list_numbered</span>
              <span>Bảng Điểm Chi Tiết Toàn Lớp {classId} ({filteredList.length} Học Sinh)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Nhấp vào học sinh để xem chi tiết hoặc gửi lời cổ vũ thi đua học tập
            </p>
          </div>

          {/* Sort Criteria Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setSortCriteria('xp')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                sortCriteria === 'xp'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⚡ Điểm XP</span>
            </button>
            <button
              type="button"
              onClick={() => setSortCriteria('streak')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                sortCriteria === 'streak'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔥 Chuỗi Streak</span>
            </button>
            <button
              type="button"
              onClick={() => setSortCriteria('stars')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                sortCriteria === 'stars'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⭐ Số Sao</span>
            </button>
            <button
              type="button"
              onClick={() => setSortCriteria('score')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                sortCriteria === 'score'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📊 Điểm TB</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo họ tên hoặc mã học sinh..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Leaderboard Table / List */}
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {filteredList.map((st, idx) => {
            const isMe = st.id === currentStudent.id;
            const rankNum = sortedStudents.findIndex((s) => s.id === st.id) + 1;
            const tier = getStudentTier(st.xp);
            const xpPercent = Math.min(100, Math.round((st.xp / maxXp) * 100));

            return (
              <div
                key={st.id}
                onClick={() => onSelectStudent?.(st)}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-colors cursor-pointer ${
                  isMe
                    ? 'bg-amber-50/90 border-l-4 border-amber-500'
                    : rankNum <= 3
                    ? 'hover:bg-slate-50/90'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Left: Rank + Avatar + Name + Partner */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {rankNum === 1 ? (
                      <span className="text-xl" title="Quán Quân">🥇</span>
                    ) : rankNum === 2 ? (
                      <span className="text-xl" title="Á Quân">🥈</span>
                    ) : rankNum === 3 ? (
                      <span className="text-xl" title="Hạng Ba">🥉</span>
                    ) : (
                      <span className="text-xs font-black text-slate-500">#{rankNum}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0 border border-slate-200">
                    {st.name.split(' ').slice(-1)[0]?.charAt(0) || 'H'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
                        {st.name}
                      </span>
                      {isMe && (
                        <span className="px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                          Em (Bạn)
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${tier.colorClass}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">{tier.icon}</span>
                        <span>{tier.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Mã HS: {st.id}</span>
                      <span>•</span>
                      <span>Máy: {st.stationNumber || '01'}</span>
                      {st.partnerName && st.partnerName !== 'Học cá nhân (1 mình)' && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold truncate">
                            Đồng hành: {st.partnerName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: XP Bar + Stats + Cheer Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pl-11 sm:pl-0">
                  {/* XP Progress Bar */}
                  <div className="flex flex-col items-end gap-1 w-28 sm:w-36">
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-xs sm:text-sm text-slate-900">
                        {st.xp.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">XP</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: `${Math.max(8, xpPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Badges: Streak & Stars */}
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-xl bg-orange-50 text-orange-700 text-[11px] font-bold border border-orange-200/60"
                      title="Chuỗi ngày học liên tục"
                    >
                      🔥 {st.streakDays || 1}d
                    </span>
                    <span
                      className="px-2 py-1 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/60"
                      title="Sao chăm chỉ"
                    >
                      ⭐ {st.stars || 3}
                    </span>
                  </div>

                  {/* Cheer / Celebrate Reaction Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheerStudent(st, '❤️');
                    }}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title={`Gửi lời cổ vũ học tập đến ${st.name}`}
                  >
                    <span>{cheeredStudentIds[st.id] || '👏'}</span>
                    <span className="hidden md:inline text-[11px]">Cổ vũ</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              Không tìm thấy học sinh nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>
      </div>

      {/* 5. HEALTHY SPORTSMANSHIP & GDPT 2018 PEDAGOGICAL STATEMENT */}
      <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0 mt-0.5">
          verified
        </span>
        <div className="leading-relaxed">
          <strong className="text-slate-800">Tinh thần thi đua học tập tích cực (GDPT 2018):</strong>{' '}
          Bảng xếp hạng lớp học được thiết kế nhằm khuyến khích sự tự giác, tính kiên trì và tinh thần học hỏi lẫn nhau giữa các bạn trong lớp. Mỗi điểm XP ghi nhận sự nỗ lực làm bài, vượt qua thử thách và hoàn thành nhiệm vụ học tập của chính em mỗi ngày!
        </div>
      </div>
    </div>
  );
};
