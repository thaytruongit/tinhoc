import React, { useState } from 'react';
import {
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
} from '../data/mockCurriculumData';
import {
  playStageBroadcastSound,
  triggerSynchronizedCelebration,
} from '../utils/soundEffects';

interface TeacherLivePresenterRoomProps {
  grade: 6 | 7 | 8 | 9;
  period: number;
  classId: string;
  periodSpec: CurriculumPeriodSpec;
  liveSession?: LiveClassroomSession;
  students: StudentRosterItem[];
  onExit: () => void;
  onUpdateLiveSession: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherLivePresenterRoom: React.FC<TeacherLivePresenterRoomProps> = ({
  grade,
  period,
  classId,
  periodSpec,
  liveSession,
  students,
  onExit,
  onUpdateLiveSession,
  onShowToast,
}) => {
  const lessonKey = `k${grade}-tiet-${period}`;
  const currentUnlockedMap: Record<1 | 2 | 3 | 4, boolean> =
    liveSession?.unlockedStagesByLesson?.[lessonKey] || {
      1: true,
      2: false,
      3: false,
      4: false,
    };

  const activeStage: 1 | 2 | 3 | 4 = (liveSession?.activeStage as 1 | 2 | 3 | 4) || 1;
  const [activeTab, setActiveTab] = useState<'hd1' | 'hd2' | 'hd3' | 'hd4' | 'ket-qua'>(
    `hd${activeStage}` as 'hd1' | 'hd2' | 'hd3' | 'hd4'
  );
  const [rankingScope, setRankingScope] = useState<'class' | 'grade'>('class');

  // Lucky wheel random student selection
  const [spinning, setSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);

  const classStudents = students.filter((s) => s.classId === classId);
  const gradeStudents = students.filter(
    (s) => s.grade === grade || Number(s.classId?.charAt(0)) === grade
  );

  const effectiveClassStudents = classStudents.length > 0 ? classStudents : gradeStudents;
  const rankedStudents = [
    ...(rankingScope === 'class' ? effectiveClassStudents : gradeStudents),
  ].sort((a, b) => b.xp - a.xp);

  const maxXpInList = Math.max(100, ...(rankedStudents.map((s) => s.xp) || [1000]));

  // Toggle stage lock/unlock for students
  const handleToggleStageLock = (stage: 1 | 2 | 3 | 4) => {
    const nextState = !currentUnlockedMap[stage];
    onUpdateLiveSession((prev) => ({
      ...prev,
      unlockedStagesByLesson: {
        ...prev.unlockedStagesByLesson,
        [lessonKey]: {
          ...(prev.unlockedStagesByLesson?.[lessonKey] || {
            1: true,
            2: false,
            3: false,
            4: false,
          }),
          [stage]: nextState,
        },
      },
    }));

    onShowToast(
      nextState
        ? `🔓 Đã MỞ KHÓA Hoạt động ${stage} cho toàn bộ học sinh lớp ${classId}!`
        : `🔒 Đã KHÓA Hoạt động ${stage} với học sinh!`
    );
  };

  // Broadcast stage switch to student screens (auto-switches student screens to this activity)
  const handleBroadcastStage = (stage: 1 | 2 | 3 | 4) => {
    playStageBroadcastSound();
    onUpdateLiveSession((prev) => ({
      ...prev,
      isBroadcasting: true,
      activeGrade: grade,
      activePeriod: period,
      activeClassId: classId,
      activeStage: stage,
      // Ensure stage is unlocked when broadcasting
      unlockedStagesByLesson: {
        ...prev.unlockedStagesByLesson,
        [lessonKey]: {
          ...(prev.unlockedStagesByLesson?.[lessonKey] || {
            1: true,
            2: false,
            3: false,
            4: false,
          }),
          [stage]: true,
        },
      },
    }));
    setActiveTab(`hd${stage}` as any);
    onShowToast(
      `📢 Đang phát trực tiếp Hoạt động ${stage} — Màn hình toàn bộ học sinh Lớp ${classId} đã tự động chuyển sang Hoạt động ${stage}!`
    );
  };

  // Spin wheel to call a random student
  const handleSpinRandomStudent = () => {
    if (effectiveClassStudents.length === 0 || spinning) return;
    setSpinning(true);
    setSelectedStudent(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * effectiveClassStudents.length);
      setSelectedStudent(effectiveClassStudents[randIdx]);
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        setSpinning(false);
        const finalWinner =
          effectiveClassStudents[Math.floor(Math.random() * effectiveClassStudents.length)];
        setSelectedStudent(finalWinner);
        triggerSynchronizedCelebration('xp');

        onUpdateLiveSession((prev) => ({
          ...prev,
          wheelCall: {
            isSpinning: false,
            winnerId: finalWinner.id,
            winnerName: finalWinner.name,
            winnerGroup: `Máy #${finalWinner.stationNumber || '01'}`,
            rewardLabel: '+30 XP Trả lời trực tiếp',
            calledAt: new Date().toLocaleTimeString('vi-VN'),
          },
        }));

        onShowToast(`🎉 Đã gọi tên học sinh: ${finalWinner.name} (Lớp ${finalWinner.classId})!`);
      }
    }, 90);
  };

  // Embedded Live Class Leaderboard Chart Component rendered directly inside each Activity
  const renderEmbeddedClassLeaderboardChart = (stageNum: 1 | 2 | 3 | 4, stageName: string) => {
    const topEight = rankedStudents.slice(0, 8);
    const submittedCount = effectiveClassStudents.filter(
      (s) => s.submissionStatus === 'Đã nộp'
    ).length;
    const submissionPercent =
      effectiveClassStudents.length > 0
        ? Math.round((submittedCount / effectiveClassStudents.length) * 100)
        : 0;

    return (
      <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">leaderboard</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Biểu Đồ Bảng Xếp Hạng Lớp Trực Tiếp — Hoạt động {stageNum}: {stageName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tức thời điểm XP, tiến độ hoàn thành và thứ hạng học sinh ngay trong phần hoạt động
              </p>
            </div>
          </div>

          {/* Scope Switcher: Class vs Grade */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setRankingScope('class')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  rankingScope === 'class'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp {classId} ({effectiveClassStudents.length} HS)
              </button>
              <button
                type="button"
                onClick={() => setRankingScope('grade')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  rankingScope === 'grade'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn Khối {grade} ({gradeStudents.length} HS)
              </button>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Đã nộp HĐ {stageNum}: {submittedCount}/{effectiveClassStudents.length} ({submissionPercent}%)
            </div>
          </div>
        </div>

        {/* Visual Bar Chart of Top Students in Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Horizontal Bar Chart */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sky-600 text-[18px]">bar_chart</span>
                <span>Biểu đồ Top Điểm XP ({rankingScope === 'class' ? `Lớp ${classId}` : `Khối ${grade}`})</span>
              </span>
              <span className="text-slate-400">Đơn vị: Điểm XP &amp; Sao</span>
            </div>

            <div className="flex flex-col gap-3">
              {topEight.map((st, idx) => {
                const widthPct = Math.max(12, Math.min(100, Math.round((st.xp / maxXpInList) * 100)));
                const rankBadge =
                  idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
                const barGradient =
                  idx === 0
                    ? 'from-amber-400 via-orange-500 to-red-500'
                    : idx === 1
                    ? 'from-sky-400 to-blue-600'
                    : idx === 2
                    ? 'from-emerald-400 to-teal-600'
                    : 'from-slate-400 to-slate-500';

                return (
                  <div key={st.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-md font-black text-[11px] shrink-0 ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : idx === 1
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : idx === 2
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {rankBadge}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{st.name}</span>
                        <span className="text-[11px] text-slate-500 truncate">
                          ({st.partnerName && st.partnerName !== 'Học cá nhân (1 mình)' ? `+ ${st.partnerName}` : 'Cá nhân'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-amber-600">⭐ {st.stars}</span>
                        <span className="font-black text-sky-700">{st.xp.toLocaleString()} XP</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Top 3 Podium & Live Student Status List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2.5">
              {rankedStudents.slice(0, 3).map((st, idx) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 ${
                    idx === 0
                      ? 'bg-amber-50/90 border-amber-300 shadow-xs'
                      : idx === 1
                      ? 'bg-sky-50/90 border-sky-200'
                      : 'bg-emerald-50/90 border-emerald-200'
                  }`}
                >
                  <span className="text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-xs font-black text-slate-900 line-clamp-1">{st.name}</span>
                  <span className="text-[11px] font-bold text-sky-700">{st.xp} XP</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-bold border border-slate-200">
                    TB: {st.avgScore.toFixed(1)}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Tiến độ học sinh trong HĐ {stageNum}</span>
                <span className="text-emerald-700">{submittedCount} Đã nộp</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {rankedStudents.slice(0, 10).map((st, idx) => (
                  <div
                    key={st.id}
                    className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-slate-400 w-5">#{idx + 1}</span>
                      <div className="truncate">
                        <span className="font-bold text-slate-800">{st.name}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({st.classId})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.submissionStatus === 'Đã nộp'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {st.submissionStatus || 'Đang làm'}
                      </span>
                      <span className="font-black text-slate-700">{st.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 text-slate-900">
      {/* 1. LEFT SIDEBAR - BRIGHT WHITE SYNCHRONIZED WITH STUDENT LIVE ROOM */}
      <aside className="w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="flex flex-col gap-6">
          {/* Orange Return Button matching student image */}
          <button
            type="button"
            onClick={onExit}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span>Trang chủ Quản trị</span>
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1.5">
            <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Điều khiển Hoạt động Live (1–4)
            </span>
            <nav className="flex flex-col gap-2.5">
              {[
                {
                  id: 'hd1',
                  stage: 1 as const,
                  label: 'Khởi động (HĐ 1)',
                  icon: 'psychology',
                  desc: 'Tình huống & Khơi gợi (1.0đ)',
                },
                {
                  id: 'hd2',
                  stage: 2 as const,
                  label: 'Khám phá (HĐ 2)',
                  icon: 'menu_book',
                  desc: 'Phiếu học tập tương tác (4.0đ)',
                },
                {
                  id: 'hd3',
                  stage: 3 as const,
                  label: 'Luyện tập (HĐ 3)',
                  icon: 'extension',
                  desc: 'Đấu trường 25s & Drive (3.0đ)',
                },
                {
                  id: 'hd4',
                  stage: 4 as const,
                  label: 'Vận dụng (HĐ 4)',
                  icon: 'assignment_turned_in',
                  desc: 'Bài tập thực tiễn (2.0đ)',
                },
                {
                  id: 'ket-qua',
                  stage: null,
                  label: 'Tổng hợp Kết quả & Xếp hạng',
                  icon: 'leaderboard',
                  desc: 'Bảng điểm chi tiết cả lớp/khối',
                },
              ].map((item) => {
                const isSelected = activeTab === item.id;
                const isBroadcastingThis = item.stage && activeStage === item.stage;
                const isUnlocked = item.stage ? currentUnlockedMap[item.stage] : true;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-orange-50/90 border-2 border-orange-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setActiveTab(item.id as any);
                        if (item.stage) handleBroadcastStage(item.stage);
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[22px] ${
                            isBroadcastingThis
                              ? 'text-orange-600'
                              : isSelected
                              ? 'text-sky-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {isBroadcastingThis && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 animate-pulse">
                          ĐANG PHÁT
                        </span>
                      )}
                    </div>

                    {/* Stage Lock Toggle Switch for Teacher */}
                    {item.stage && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {isUnlocked ? '🔓 Đã mở cho HS' : '🔒 Đang khóa với HS'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStageLock(item.stage!);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            isUnlocked
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {isUnlocked ? 'Khóa lại' : 'Mở khóa'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Lucky Random Call Wheel */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-purple-600">casino</span>
              <span>Gọi tên ngẫu nhiên</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white text-purple-700 text-[11px] border border-purple-200">
              {effectiveClassStudents.length} HS
            </span>
          </div>

          {selectedStudent && (
            <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-center shadow-2xs">
              <span className="text-[11px] text-purple-600 block font-bold">
                Học sinh được chọn:
              </span>
              <strong className="text-sm text-slate-900 font-black block mt-0.5">
                {selectedStudent.name}
              </strong>
              <span className="text-[10px] text-slate-500">
                Lớp {selectedStudent.classId} • Máy #{selectedStudent.stationNumber || '01'}
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={spinning}
            onClick={handleSpinRandomStudent}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
              spinning
                ? 'bg-purple-200 text-purple-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${spinning ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{spinning ? 'Đang quay...' : 'Quay gọi tên HS'}</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN TEACHER LIVE STAGE - BRIGHT WHITE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/50">
        {/* Top Control Bar */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black flex items-center gap-1.5 shrink-0 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>PHÒNG LIVE GIÁO VIÊN</span>
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
              Khối {grade} • Tiết {period}: {periodSpec.lessonTitle} — Lớp {classId}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Broadcaster */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200">
              {([1, 2, 3, 4] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleBroadcastStage(st)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeStage === st
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Phát Hoạt động ${st} sang màn hình học sinh`}
                >
                  Phát HĐ {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onExit}
              className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Rời phòng Live
            </button>
          </div>
        </header>

        {/* Content Panel */}
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
          {/* SLIDE PRESENTER + EMBEDDED CLASS LEADERBOARD CHART FOR ACTIVE TAB */}
          {activeTab === 'hd1' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      1
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 1: Khởi động (Trình chiếu trực tiếp)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Khi Giáo viên phát HĐ 1, màn hình học sinh tự động chuyển sang HĐ 1
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(1)}
                      className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát HĐ 1 sang màn hình HS</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-3">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                    Tình huống Khởi động đang trình chiếu cho học sinh:
                  </span>
                  <p className="text-base text-slate-800 leading-relaxed font-semibold">
                    {periodSpec.yccd ||
                      'Hãy quan sát bảng dữ liệu thực tế và rút ra nhận định ban đầu của em.'}
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-amber-200/60 text-xs text-slate-600">
                    💡 <strong>Gợi ý sư phạm:</strong> Mời 1-2 cặp học sinh sử dụng tính năng "Quay gọi tên HS" để chia sẻ nhanh trước lớp (+30 XP).
                  </div>
                </div>
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 1 */}
              {renderEmbeddedClassLeaderboardChart(1, 'Khởi động')}
            </>
          )}

          {activeTab === 'hd2' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black">
                      2
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 2: Khám phá (Phiếu học tập 4.0 điểm)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Kéo thả, Điền khuyết, Nối cột &amp; Trả lời ngắn — Tự động chuyển màn hình HS khi phát
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(2)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[2]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[2] ? '🔒 Khóa HĐ 2' : '🔓 Mở khóa HĐ 2'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(2)}
                      className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát HĐ 2 sang màn hình HS</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-sky-800">1. Kéo thả phân loại (1.0đ):</span>
                    <span className="text-xs text-slate-600">
                      Phân biệt các khái niệm trọng tâm trong bài: {periodSpec.lessonTitle}.
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-sky-800">2. Điền khuyết vào chỗ trống (1.0đ):</span>
                    <span className="text-xs text-slate-600">
                      Điền thuật ngữ đúng định nghĩa sách giáo khoa GDPT 2018.
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-sky-800">3. Nối cột định nghĩa (1.0đ):</span>
                    <span className="text-xs text-slate-600">
                      Ghép thẻ cột A với mô tả phù hợp tại cột B.
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-sky-800">4. Trả lời ngắn / Tự luận (1.0đ):</span>
                    <span className="text-xs text-slate-600">
                      Học sinh tự phân tích ví dụ thực tiễn theo máy tính cá nhân.
                    </span>
                  </div>
                </div>
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 2 */}
              {renderEmbeddedClassLeaderboardChart(2, 'Khám phá')}
            </>
          )}

          {activeTab === 'hd3' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                      3
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 3: Luyện tập (Đấu trường 25s &amp; Google Drive)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Trắc nghiệm tốc độ 25s &amp; Nộp sản phẩm thực hành (3.0 điểm)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(3)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[3]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[3] ? '🔒 Khóa HĐ 3' : '🔓 Mở khóa HĐ 3'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(3)}
                      className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát Đấu trường HĐ 3 sang HS</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col gap-2 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-purple-700">
                    ⚡ Đấu Trường Phản Xạ 25 Giây / Câu
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Học sinh tham gia đấu trường trắc nghiệm trực tiếp, điểm XP và thứ hạng cập nhật ngay bên dưới theo thời gian thực!
                  </p>
                </div>
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 3 */}
              {renderEmbeddedClassLeaderboardChart(3, 'Luyện tập')}
            </>
          )}

          {activeTab === 'hd4' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      4
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 4: Vận dụng (Giải quyết vấn đề thực tiễn)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Mở rộng bài học &amp; liên hệ thực tiễn cuộc sống số (2.0 điểm)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(4)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[4]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[4] ? '🔒 Khóa HĐ 4' : '🔓 Mở khóa HĐ 4'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(4)}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát HĐ 4 sang màn hình HS</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase">
                    Nhiệm vụ Vận dụng mở rộng:
                  </span>
                  <p className="text-sm text-slate-700 font-medium">
                    Học sinh hoàn thành 3 nhiệm vụ vận dụng thực tế. Học sinh có thể quay lại các Hoạt động 1, 2, 3 trước đó để rà soát và hoàn thiện bài làm trước khi kết thúc tiết học.
                  </p>
                </div>
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 4 */}
              {renderEmbeddedClassLeaderboardChart(4, 'Vận dụng')}
            </>
          )}

          {activeTab === 'ket-qua' && (
            <div className="flex flex-col gap-6">
              {renderEmbeddedClassLeaderboardChart(activeStage, 'Tổng hợp cả tiết Live')}

              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                      🏆
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Bảng Chi Tiết Học Sinh &amp; Nhóm Đồng Hành — Lớp {classId}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Danh sách toàn bộ học sinh, bạn đồng hành cùng máy, trạng thái nộp bài và điểm số
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
                    Sĩ số: {effectiveClassStudents.length} học sinh
                  </span>
                </div>

                {/* Real-time Submissions Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Hạng</th>
                        <th className="p-3.5">Mã HS / Máy</th>
                        <th className="p-3.5">Học sinh</th>
                        <th className="p-3.5">Bạn đồng hành cùng máy</th>
                        <th className="p-3.5 text-center">Trạng thái</th>
                        <th className="p-3.5 text-right">Điểm XP</th>
                        <th className="p-3.5 text-right">Điểm TB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rankedStudents.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/80">
                          <td className="p-3.5 font-black text-slate-700">
                            {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                          </td>
                          <td className="p-3.5 font-bold text-sky-700">
                            {st.id} (Máy #{st.stationNumber || '01'})
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                          <td className="p-3.5 text-slate-600 font-medium">
                            {st.partnerName || 'Học cá nhân (1 mình)'}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                st.submissionStatus === 'Đã nộp'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {st.submissionStatus || 'Đang làm'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-black text-amber-600">
                            {st.xp.toLocaleString()} XP
                          </td>
                          <td className="p-3.5 text-right font-bold text-slate-900">
                            {(st.avgScore || 9.0).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
