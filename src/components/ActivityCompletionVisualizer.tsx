import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
} from '../data/mockCurriculumData';
import {
  type ActivityStageCode,
  computeSingleActivityVisualization,
  buildStageCompletionEvent,
  formatTeacherStageCompletionToast,
  getStageVietnameseName,
} from '../utils/realtimeProgressAnalytics';
import {
  isActivityFinalized,
  buildToggleFinalizeActivityState,
} from '../utils/slideAndArenaController';

interface ActivityCompletionVisualizerProps {
  stage: ActivityStageCode;
  students: StudentRosterItem[];
  classId: string;
  grade: number;
  period: number;
  periodSpec: CurriculumPeriodSpec;
  liveSession?: LiveClassroomSession;
  onShowToast: (msg: string) => void;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
}

export const ActivityCompletionVisualizer: React.FC<
  ActivityCompletionVisualizerProps
> = ({
  stage,
  students,
  classId,
  grade,
  period,
  periodSpec,
  liveSession,
  onShowToast,
  onUpdateLiveSession,
}) => {
  const completedStagesMap = liveSession?.completedStagesByStudent;

  const viz = useMemo(
    () =>
      computeSingleActivityVisualization(
        students,
        classId,
        period,
        periodSpec.lessonTitle,
        stage,
        completedStagesMap
      ),
    [students, classId, period, periodSpec.lessonTitle, stage, completedStagesMap]
  );

  // Theme colors specific to each activity
  const theme = useMemo(() => {
    switch (stage) {
      case 1:
        return {
          cardBg: 'bg-amber-50/70',
          cardBorder: 'border-amber-200',
          titleText: 'text-amber-900',
          accentText: 'text-amber-800',
          barFill: 'bg-amber-500',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          btnBg: 'bg-amber-600 hover:bg-amber-700',
        };
      case 2:
        return {
          cardBg: 'bg-sky-50/70',
          cardBorder: 'border-sky-200',
          titleText: 'text-sky-900',
          accentText: 'text-sky-800',
          barFill: 'bg-sky-600',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
          btnBg: 'bg-sky-600 hover:bg-sky-700',
        };
      case 3:
        return {
          cardBg: 'bg-purple-50/70',
          cardBorder: 'border-purple-200',
          titleText: 'text-purple-900',
          accentText: 'text-purple-800',
          barFill: 'bg-purple-600',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          btnBg: 'bg-purple-600 hover:bg-purple-700',
        };
      case 'hd3-practice':
        return {
          cardBg: 'bg-indigo-50/70',
          cardBorder: 'border-indigo-200',
          titleText: 'text-indigo-900',
          accentText: 'text-indigo-800',
          barFill: 'bg-indigo-600',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700',
        };
      default:
        return {
          cardBg: 'bg-emerald-50/70',
          cardBorder: 'border-emerald-200',
          titleText: 'text-emerald-900',
          accentText: 'text-emerald-800',
          barFill: 'bg-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700',
        };
    }
  }, [stage]);

  const handleRecordStudentStageDone = (targetStudentId?: string) => {
    const classList = students.filter((s) => s.classId === classId);
    const pool = classList.length > 0 ? classList : students;
    const pendingStudent =
      (targetStudentId && pool.find((s) => s.id === targetStudentId)) ||
      pool.find((s) => !(completedStagesMap?.[s.id] || []).includes(stage)) ||
      pool[0];

    if (!pendingStudent) return;

    const evt = buildStageCompletionEvent({
      student: {
        id: pendingStudent.id,
        name: pendingStudent.name,
        stationNumber: pendingStudent.stationNumber,
        classId: pendingStudent.classId,
        grade,
      },
      period,
      lessonTitle: periodSpec.lessonTitle,
      stage,
      score: Math.min(10, Number(((pendingStudent.avgScore || 8.4) + 0.4).toFixed(1))),
      summary: `Hoàn thành ${getStageVietnameseName(stage)}`,
    });

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => {
        const prevMap = prev.completedStagesByStudent || {};
        const prevList = prevMap[pendingStudent.id] || [];
        const updatedList = prevList.includes(stage)
          ? prevList
          : [...prevList, stage];
        const prevRecent = prev.recentStageCompletions || [];
        return {
          ...prev,
          lastStudentStageCompletion: evt,
          recentStageCompletions: [evt, ...prevRecent].slice(0, 15),
          completedStagesByStudent: {
            ...prevMap,
            [pendingStudent.id]: updatedList,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    }

  };

  const lessonKey = `k${grade}-tiet-${period}`;
  const isFinalized = isActivityFinalized(liveSession, lessonKey, stage);

  const handleToggleFinalize = () => {
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) =>
        buildToggleFinalizeActivityState(prev, {
          lessonKey,
          activityKey: stage,
          activityTitle: getStageVietnameseName(stage),
        })
      );
    }
    const nextState = !isFinalized;
    onShowToast(
      nextState
        ? `🔒 Đã chốt ${getStageVietnameseName(stage)}! Toàn bộ cổng nộp bài phía học sinh đã được khóa an toàn.`
        : `🔓 Đã mở lại nộp bài cho ${getStageVietnameseName(stage)}.`
    );
  };

  return (
    <div
      data-testid={`activity-completion-visualizer-${stage}`}
      className="flex flex-col gap-4"
    >
      {/* 1. Overall Activity Completion Summary Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">
              analytics
            </span>
            <span className="text-sm font-black text-slate-900">
              Trực Quan Hóa Tiến Độ Hoàn Thành Riêng — {getStageVietnameseName(stage)}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>Đồng bộ thời gian thực</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 font-mono tabular-nums">
              Điểm TB mục này: <strong className="text-indigo-700">{viz.averageScoreLabel}</strong>
            </span>

            {/* Chốt hoạt động (Finalize Activity & Lock Student Submissions) */}
            <button
              type="button"
              data-testid={`finalize-stage-btn-${stage}`}
              onClick={handleToggleFinalize}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isFinalized
                  ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title={
                isFinalized
                  ? 'Hoạt động đang chốt kết quả (đã khóa nộp bài phía học sinh). Bấm để mở lại nếu cần'
                  : 'Chốt hoạt động này và khóa ngay cổng nộp bài phía học sinh'
              }
            >
              <span className="material-symbols-outlined text-[15px]">
                {isFinalized ? 'lock' : 'lock_clock'}
              </span>
              <span>{isFinalized ? '✓ Đã chốt HĐ (Mở lại)' : '🔒 Chốt hoạt động'}</span>
            </button>

            <button
              type="button"
              data-testid={`record-stage-completion-btn-${stage}`}
              onClick={() => handleRecordStudentStageDone()}
              className={`px-3.5 py-1.5 rounded-full text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs ${theme.btnBg}`}
              title="Ghi nhận thêm 1 học sinh hoàn thành hoạt động này và bật thông báo Toast thời gian thực"
            >
              <span className="material-symbols-outlined text-[15px]">
                notifications_active
              </span>
              <span>+ Ghi nhận HS hoàn thành &amp; Báo Toast</span>
            </button>
          </div>
        </div>

        {/* Finalized Banner Alert */}
        {isFinalized && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">lock</span>
              <span>
                <strong>HOẠT ĐỘNG ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Đã khóa toàn bộ cổng nộp bài phía học sinh, đảm bảo tính riêng biệt của {getStageVietnameseName(stage)}.
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
              ĐÃ ĐÓNG NỘP BÀI
            </span>
          </div>
        )}

        {/* Progress Bar & 3 Status Counters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">
                Tiến độ hoàn thành Lớp {classId}:
              </span>
              <span className="font-mono tabular-nums text-slate-900 text-sm font-black">
                {viz.completedCount}/{viz.totalStudents} HS ({viz.completionPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${viz.completionPercent}%` }}
                title={`Đã hoàn thành: ${viz.completedCount} HS`}
              />
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (viz.inProgressCount / Math.max(1, viz.totalStudents)) * 100
                  )}%`,
                }}
                title={`Đang thực hiện: ${viz.inProgressCount} HS`}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (viz.needHelpCount / Math.max(1, viz.totalStudents)) * 100
                  )}%`,
                }}
                title={`Cần hỗ trợ: ${viz.needHelpCount} HS`}
              />
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="font-sans font-bold text-emerald-800">✓ Hoàn thành</span>
              <span className="font-black text-emerald-700">{viz.completedCount} HS</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <span className="font-sans font-bold text-blue-800">⏳ Đang làm</span>
              <span className="font-black text-blue-700">{viz.inProgressCount} HS</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <span className="font-sans font-bold text-rose-800">⚠️ Cần hỗ trợ</span>
              <span className="font-black text-rose-700">{viz.needHelpCount} HS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Task Cards Grid (The exact yellow-highlighted area in the user's screenshot, enriched with live completion visualization per sub-task) */}
      <div
        className={`grid grid-cols-1 ${
          viz.subTasks.length === 4
            ? 'md:grid-cols-2'
            : viz.subTasks.length === 3
            ? 'md:grid-cols-3'
            : 'md:grid-cols-2'
        } gap-4`}
      >
        {viz.subTasks.map((sub) => (
          <div
            key={sub.id}
            className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} flex flex-col justify-between gap-2.5 shadow-2xs`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-black ${theme.accentText}`}>
                  {sub.title} ({sub.pointsLabel}):
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-[11px] font-bold text-slate-800 font-mono tabular-nums">
                  {sub.completedCount}/{sub.totalStudents} HS ({sub.completionPercent}%)
                </span>
              </div>
              <span className="text-xs text-slate-600 leading-relaxed">
                {sub.description}
              </span>
            </div>

            {/* Sub-task Completion Progress Bar */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="w-full h-2 rounded-full bg-white/80 border border-slate-200/70 overflow-hidden">
                <div
                  className={`h-full ${theme.barFill} rounded-full transition-all duration-300`}
                  style={{ width: `${sub.completionPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                <div className="flex items-center gap-2 font-mono tabular-nums">
                  <span className="text-emerald-700 font-bold">
                    ✓ Xong: {sub.completedCount}
                  </span>
                  <span className="text-blue-700 font-semibold">
                    ⏳ Đang làm: {sub.inProgressCount}
                  </span>
                  {sub.needHelpCount > 0 && (
                    <span className="text-rose-700 font-bold">
                      ⚠️ Hỗ trợ: {sub.needHelpCount}
                    </span>
                  )}
                </div>
                <span className="text-slate-600 font-semibold">
                  Chính xác: <strong className="text-emerald-700">{sub.accuracyPercent}%</strong>
                </span>
              </div>

              <div className="text-[11px] text-slate-500 italic bg-white/70 px-2.5 py-1 rounded-lg border border-slate-200/60">
                💡 {sub.sampleDetail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Activity-Specific Recharts Sub-task Chart + Live Computer Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 7 cols: Recharts BarChart of Sub-Tasks in this Activity */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[16px]">
                bar_chart
              </span>
              <span>
                Biểu Đồ Tiến Độ Các Phần Trong {getStageVietnameseName(stage)}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              Đơn vị: Học sinh (HS)
            </span>
          </div>

          <div className="w-full h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={viz.subTasks}
                margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                  tickFormatter={(val: string) =>
                    val.length > 20 ? `${val.slice(0, 20)}…` : val
                  }
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="completedCount"
                  name="Đã hoàn thành"
                  stackId="a"
                  fill="#16A34A"
                />
                <Bar
                  dataKey="inProgressCount"
                  name="Đang thực hiện"
                  stackId="a"
                  fill="#2563EB"
                />
                <Bar
                  dataKey="needHelpCount"
                  name="Cần hỗ trợ"
                  stackId="a"
                  fill="#DC2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 cols: Live Station Completion Grid for this Activity */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                computer
              </span>
              <span>Trạng Thái Trạm Máy ({getStageVietnameseName(stage)})</span>
            </span>
            <span className="text-[10px] text-slate-500">
              Nhấp vào máy để xác nhận xong
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[165px] overflow-y-auto pr-0.5">
            {viz.stationBadges.map((st) => {
              const badgeStyle =
                st.status === 'completed'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : st.status === 'need-help'
                  ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100 animate-pulse'
                  : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100';

              return (
                <button
                  key={st.studentId}
                  type="button"
                  onClick={() => handleRecordStudentStageDone(st.studentId)}
                  title={`${st.studentName} (Máy #${st.stationNumber}): ${st.statusLabel} — ${st.detailText}. Nhấp để xác nhận hoàn thành!`}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${badgeStyle}`}
                >
                  <div className="flex items-center justify-between font-mono tabular-nums text-[10px] font-black">
                    <span>Máy #{st.stationNumber}</span>
                    <span>
                      {st.status === 'completed'
                        ? '✓'
                        : st.status === 'need-help'
                        ? '⚠️'
                        : '⏳'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold truncate block">
                    {st.studentName.split(' ').slice(-2).join(' ')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>🟢 Xong ({viz.completedCount})</span>
            <span>🔵 Đang làm ({viz.inProgressCount})</span>
            <span>🔴 Cần hỗ trợ ({viz.needHelpCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
