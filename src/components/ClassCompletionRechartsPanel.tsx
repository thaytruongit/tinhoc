import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  ClassroomItem,
  StudentRosterItem,
  LiveClassroomSession,
  getPeriodsForGrade,
} from '../data/mockCurriculumData';

interface ClassCompletionRechartsPanelProps {
  classes: ClassroomItem[];
  students: StudentRosterItem[];
  selectedGrade: 6 | 7 | 8 | 9;
  selectedClassId: string;
  onChangeGrade?: (grade: 6 | 7 | 8 | 9) => void;
  onChangeClass?: (classId: string) => void;
  onSelectPeriod?: (grade: 6 | 7 | 8 | 9, period: number) => void;
  liveSession?: LiveClassroomSession;
}

export const ClassCompletionRechartsPanel: React.FC<ClassCompletionRechartsPanelProps> = ({
  classes,
  students,
  selectedGrade,
  selectedClassId,
  onChangeGrade,
  onChangeClass,
  onSelectPeriod,
  liveSession,
}) => {
  const [milestoneFilter, setMilestoneFilter] = useState<'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2'>('ALL');
  const [chartMode, setChartMode] = useState<'completion_and_score' | '4_activities_breakdown'>(
    'completion_and_score'
  );

  const gradeClasses = useMemo(
    () => classes.filter((c) => c.grade === selectedGrade),
    [classes, selectedGrade]
  );

  const currentClassObj = useMemo(
    () =>
      classes.find((c) => c.id === selectedClassId) ||
      gradeClasses[0] || {
        id: selectedClassId,
        name: `Lớp ${selectedClassId}`,
        grade: selectedGrade,
        studentCount: 40,
      },
    [classes, gradeClasses, selectedClassId, selectedGrade]
  );

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId]
  );

  const totalStudentsCount = Math.max(
    classStudents.length,
    currentClassObj.studentCount || 40
  );

  const periods = useMemo(() => getPeriodsForGrade(selectedGrade), [selectedGrade]);

  const taughtPeriods = useMemo(
    () => liveSession?.taughtPeriodsByClass?.[selectedClassId] || [1, 2, 3, 4, 5],
    [liveSession, selectedClassId]
  );

  // Build per-period statistical data for all 29 periods
  const periodChartData = useMemo(() => {
    const classAvgBase =
      classStudents.length > 0
        ? classStudents.reduce((acc, s) => acc + s.avgScore, 0) / classStudents.length
        : 8.6;

    return periods
      .filter((p) => milestoneFilter === 'ALL' || p.examMilestone === milestoneFilter)
      .map((spec) => {
        const pNum = spec.period;
        const lessonKey = `k${selectedGrade}-tiet-${pNum}`;
        const isTaught = taughtPeriods.includes(pNum);
        const isLive =
          Boolean(liveSession?.isBroadcasting) &&
          liveSession?.activeGrade === selectedGrade &&
          liveSession?.activeClassId === selectedClassId &&
          liveSession?.activePeriod === pNum;

        // Count how many students explicitly unlocked/completed this period
        const learnedStudentsCount = Object.values(
          liveSession?.learnedPeriodsByStudent || {}
        ).filter((list) => ((list as string[]) || []).includes(lessonKey)).length;

        const unlockedMap = liveSession?.unlockedStagesByLesson?.[lessonKey];
        const unlockedStageCount = unlockedMap
          ? [1, 2, 3, 4].filter((s) => unlockedMap[s as 1 | 2 | 3 | 4]).length
          : isTaught
          ? 4
          : 1;

        // Deterministic realistic class completion metrics per period
        const seedOffset = ((pNum * 7 + selectedGrade * 3) % 9) - 4;
        let completionRate = 0;
        if (isTaught) {
          completionRate = Math.min(100, Math.max(82, 94 + seedOffset + learnedStudentsCount * 2));
        } else if (isLive) {
          completionRate = Math.min(95, Math.max(68, 78 + learnedStudentsCount * 4));
        } else if (unlockedStageCount > 1 || learnedStudentsCount > 0) {
          completionRate = Math.min(85, 45 + unlockedStageCount * 10 + learnedStudentsCount * 5);
        } else {
          // Preview/Warmup self-study rate for upcoming periods
          completionRate = Math.max(18, Math.min(55, 42 - Math.floor(pNum * 0.8)));
        }

        const completedStudents = Math.round((completionRate / 100) * totalStudentsCount);

        // Activity-level completion rates (%)
        const hd1Rate = isTaught
          ? 100
          : Math.min(100, Math.round(completionRate * 1.15));
        const hd2Rate = isTaught
          ? Math.min(100, Math.max(85, completionRate + 2))
          : Math.round(completionRate * 0.92);
        const hd3Rate = isTaught
          ? Math.min(100, Math.max(80, completionRate - 2))
          : Math.round(completionRate * 0.82);
        const hd4Rate = isTaught
          ? Math.min(100, Math.max(76, completionRate - 5))
          : Math.round(completionRate * 0.74);

        // Average score (10-point scale) & percentage match on essay tasks
        const avgScore = Number(
          Math.min(
            9.8,
            Math.max(
              6.8,
              classAvgBase + ((pNum % 5) - 2) * 0.18 + (isTaught ? 0.35 : -0.25)
            )
          ).toFixed(1)
        );

        const suggestedAnswerMatchPct = isTaught
          ? Math.min(98, Math.max(78, Math.round(avgScore * 9.6)))
          : Math.min(88, Math.max(62, Math.round(avgScore * 8.5)));

        return {
          period: pNum,
          name: `T${pNum}`,
          fullTitle: spec.lessonTitle,
          topic: spec.topic,
          milestone: spec.examMilestone,
          lessonType: spec.lessonType === 'practice' ? 'Thực hành' : 'Lý thuyết',
          isTaught,
          isLive,
          completionRate,
          completedStudents,
          totalStudents: totalStudentsCount,
          avgScore,
          suggestedAnswerMatchPct,
          hd1Rate,
          hd2Rate,
          hd3Rate,
          hd4Rate,
        };
      });
  }, [
    periods,
    milestoneFilter,
    selectedGrade,
    selectedClassId,
    taughtPeriods,
    liveSession,
    classStudents,
    totalStudentsCount,
  ]);

  // Summary KPIs across the 29 periods
  const summaryStats = useMemo(() => {
    const totalCount = periodChartData.length || 1;
    const avgCompletion = Math.round(
      periodChartData.reduce((acc, d) => acc + d.completionRate, 0) / totalCount
    );
    const avgClassScore = Number(
      (periodChartData.reduce((acc, d) => acc + d.avgScore, 0) / totalCount).toFixed(2)
    );
    const avgSuggestedMatch = Math.round(
      periodChartData.reduce((acc, d) => acc + d.suggestedAnswerMatchPct, 0) / totalCount
    );
    const taughtCount = periods.filter((p) => taughtPeriods.includes(p.period)).length;

    return {
      avgCompletion,
      avgClassScore,
      avgSuggestedMatch,
      taughtCount,
    };
  }, [periodChartData, periods, taughtPeriods]);

  // Competency distribution of students in current class
  const competencyDistribution = useMemo(() => {
    const baseStudents =
      classStudents.length > 0
        ? classStudents
        : [
            { avgScore: 9.4 },
            { avgScore: 9.1 },
            { avgScore: 8.6 },
            { avgScore: 8.2 },
            { avgScore: 7.5 },
          ];
    const xuatSac = baseStudents.filter((s) => s.avgScore >= 9.0).length;
    const tot = baseStudents.filter((s) => s.avgScore >= 8.0 && s.avgScore < 9.0).length;
    const dat = baseStudents.filter((s) => s.avgScore >= 6.5 && s.avgScore < 8.0).length;
    const canCoGang = baseStudents.filter((s) => s.avgScore < 6.5).length;
    const scale = totalStudentsCount / Math.max(1, baseStudents.length);

    return [
      {
        level: 'Xuất sắc (9.0 - 10đ)',
        students: Math.round(xuatSac * scale),
        pct: Math.round((xuatSac / Math.max(1, baseStudents.length)) * 100),
        color: '#1b6d24',
      },
      {
        level: 'Tốt (8.0 - 8.9đ)',
        students: Math.round(tot * scale),
        pct: Math.round((tot / Math.max(1, baseStudents.length)) * 100),
        color: '#006493',
      },
      {
        level: 'Đạt (6.5 - 7.9đ)',
        students: Math.round(dat * scale),
        pct: Math.round((dat / Math.max(1, baseStudents.length)) * 100),
        color: '#954a05',
      },
      {
        level: 'Cần cố gắng (< 6.5đ)',
        students: Math.round(canCoGang * scale),
        pct: Math.round((canCoGang / Math.max(1, baseStudents.length)) * 100),
        color: '#ba1a1a',
      },
    ];
  }, [classStudents, totalStudentsCount]);

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-outline-variant/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">monitoring</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                Biểu Đồ Recharts Thống Kê Năng Lực &amp; Tiến Độ Hoàn Thành 29 Tiết Học
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                Chấm tự động % Đáp án gợi ý (Dạng 4 &amp; HĐ4)
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
              Tổng Quan Mức Độ Hoàn Thành Bài Tập Theo Từng Tiết Học — Khối {selectedGrade} • Lớp{' '}
              {selectedClassId} ({totalStudentsCount} Học sinh)
            </h2>
          </div>
        </div>

        {/* Grade & Class Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {onChangeGrade && (
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
              {([6, 7, 8, 9] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChangeGrade(g)}
                  className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-bold cursor-pointer transition-all ${
                    selectedGrade === g
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
            </div>
          )}

          {onChangeClass && gradeClasses.length > 0 && (
            <select
              aria-label="Chọn lớp thống kê"
              value={selectedClassId}
              onChange={(e) => onChangeClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-xs font-bold border border-outline-variant/30"
            >
              {gradeClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount} HS)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-primary-fixed/25 border border-primary/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-bold block">
              Tiến độ giảng dạy Lớp {selectedClassId}
            </span>
            <span className="font-headline-md text-headline-md text-primary font-black">
              {summaryStats.taughtCount} / 29 Tiết
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">
              Đạt {Math.round((summaryStats.taughtCount / 29) * 100)}% phân phối chương trình
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-[32px]">event_available</span>
        </div>

        <div className="p-3.5 rounded-xl bg-secondary-fixed/25 border border-secondary/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-bold block">
              Tỷ lệ hoàn thành bài tập TB
            </span>
            <span className="font-headline-md text-headline-md text-secondary font-black">
              {summaryStats.avgCompletion}%
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">
              ~{Math.round((summaryStats.avgCompletion / 100) * totalStudentsCount)}/{totalStudentsCount} HS hoàn thành phiếu
            </span>
          </div>
          <span className="material-symbols-outlined text-secondary text-[32px]">task_alt</span>
        </div>

        <div className="p-3.5 rounded-xl bg-tertiary-fixed/25 border border-tertiary/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-bold block">
              Điểm TB toàn lớp (Hệ 10.0đ)
            </span>
            <span className="font-headline-md text-headline-md text-tertiary font-black">
              {summaryStats.avgClassScore} / 10đ
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">
              HĐ2 (4đ) + HĐ3 (3đ) + HĐ4 (3đ)
            </span>
          </div>
          <span className="material-symbols-outlined text-tertiary text-[32px]">workspace_premium</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-bold block">
              Độ khớp Đáp án gợi ý (Dạng 4 &amp; HĐ4)
            </span>
            <span className="font-headline-md text-headline-md text-on-surface font-black">
              {summaryStats.avgSuggestedMatch}%
            </span>
            <span className="text-[11px] text-primary font-bold block mt-0.5">
              Chấm tự động theo % từ khóa chuẩn PDF
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-[32px]">percent</span>
        </div>
      </div>

      {/* Filter Bar: Exam Milestones & Chart Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-on-surface-variant px-2">Giai đoạn:</span>
          {(
            [
              { id: 'ALL', label: 'Tất cả 29 Tiết' },
              { id: 'GK1', label: 'Giữa kì 1 (T1–T7)' },
              { id: 'CK1', label: 'Cuối kì 1 (T8–T15)' },
              { id: 'GK2', label: 'Giữa kì 2 (T16–T22)' },
              { id: 'CK2', label: 'Cuối kì 2 (T23–T29)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMilestoneFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                milestoneFilter === tab.id
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setChartMode('completion_and_score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              chartMode === 'completion_and_score'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant'
            }`}
          >
            📊 Tỷ lệ Hoàn thành (%) &amp; Điểm TB
          </button>
          <button
            type="button"
            onClick={() => setChartMode('4_activities_breakdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              chartMode === '4_activities_breakdown'
                ? 'bg-tertiary text-on-tertiary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant'
            }`}
          >
            📈 Chi tiết 4 Hoạt động (HĐ1 → HĐ4)
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-9 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/25 flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {chartMode === 'completion_and_score'
                ? `Biểu đồ Mức độ Hoàn thành Bài tập (%) & Điểm Trung bình Theo Từng Tiết — Lớp ${selectedClassId}`
                : `Biểu đồ So sánh Tỷ lệ Hoàn thành 4 Hoạt động (Khởi động • Khám phá • Luyện tập • Vận dụng)`}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-tertiary">
                <span className="w-3 h-3 rounded-xs bg-tertiary inline-block" />
                Tiết đã dạy ({summaryStats.taughtCount} tiết)
              </span>
              <span className="flex items-center gap-1 font-bold text-secondary">
                <span className="w-3 h-3 rounded-xs bg-secondary inline-block" />
                Tiết tự học / chuẩn bị trước
              </span>
            </div>
          </div>

          <div className="w-full h-[330px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'completion_and_score' ? (
                <ComposedChart
                  data={periodChartData}
                  margin={{ top: 10, right: 18, left: 0, bottom: 8 }}
                  onClick={(state: any) => {
                    if (state?.activePayload?.[0] && onSelectPeriod) {
                      const clickedPeriod = state.activePayload[0].payload.period;
                      onSelectPeriod(selectedGrade, clickedPeriod);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5c3b5" opacity={0.45} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#524439' }}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#524439' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 10]}
                    unit="đ"
                    tick={{ fontSize: 11, fill: '#954a05' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #d5c3b5',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name?: any) => {
                      const strName = String(name || '');
                      if (strName === 'Tỷ lệ hoàn thành (%)') return [`${value}%`, strName];
                      if (strName === 'Độ khớp Đáp án gợi ý (%)') return [`${value}%`, strName];
                      if (strName === 'Điểm TB (Hệ 10)') return [`${value} / 10đ`, strName];
                      return [String(value), strName];
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      if (!item) return String(label);
                      return `Tiết ${item.period}: ${item.fullTitle} (${item.completedStudents}/${item.totalStudents} HS • ${
                        item.isTaught ? 'Đã dạy ✓' : 'Chưa dạy'
                      })`;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="completionRate"
                    name="Tỷ lệ hoàn thành (%)"
                    radius={[6, 6, 0, 0]}
                    barSize={18}
                  >
                    {periodChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.period}`}
                        fill={
                          entry.isLive
                            ? '#ba1a1a'
                            : entry.isTaught
                            ? '#1b6d24'
                            : '#006493'
                        }
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="suggestedAnswerMatchPct"
                    name="Độ khớp Đáp án gợi ý (%)"
                    stroke="#6c5e00"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    name="Điểm TB (Hệ 10)"
                    stroke="#954a05"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#954a05' }}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={periodChartData}
                  margin={{ top: 10, right: 18, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5c3b5" opacity={0.45} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#524439' }}
                  />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#524439' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #d5c3b5',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Area
                    type="monotone"
                    dataKey="hd1Rate"
                    name="HĐ1: Khởi động (%)"
                    fill="#cbe6ff"
                    stroke="#006493"
                    fillOpacity={0.35}
                  />
                  <Bar
                    dataKey="hd2Rate"
                    name="HĐ2: Khám phá 4 dạng (%)"
                    fill="#006493"
                    radius={[4, 4, 0, 0]}
                    barSize={10}
                  />
                  <Bar
                    dataKey="hd3Rate"
                    name="HĐ3: Luyện tập 25s (%)"
                    fill="#1b6d24"
                    radius={[4, 4, 0, 0]}
                    barSize={10}
                  />
                  <Line
                    type="monotone"
                    dataKey="hd4Rate"
                    name="HĐ4: Vận dụng thực tế (%)"
                    stroke="#954a05"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-on-surface-variant italic">
            💡 Mẹo: Di chuột lên từng cột tiết học để xem chi tiết số lượng học sinh hoàn thành, điểm trung bình và độ khớp đáp án gợi ý (%). Nhấn vào cột bất kỳ để mở nhanh tiết học đó.
          </p>
        </div>

        {/* Right Column: Competency Breakdown BarChart */}
        <div className="lg:col-span-3 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/25 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-secondary block">
              Phân hóa năng lực Lớp {selectedClassId}
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
              Phổ Điểm &amp; Mức Độ Đạt Chuẩn TT22
            </h3>
          </div>

          <div className="w-full h-[185px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competencyDistribution}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="level"
                  width={115}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#524439' }}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${val} học sinh`, 'Số lượng']}
                  contentStyle={{ borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="students" radius={[0, 6, 6, 0]} barSize={18}>
                  {competencyDistribution.map((item, idx) => (
                    <Cell key={idx} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20">
            {competencyDistribution.map((c) => (
              <div key={c.level} className="flex items-center justify-between text-xs">
                <span className="font-medium text-on-surface-variant flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.level}
                </span>
                <span className="font-bold text-on-surface">
                  {c.students} HS ({c.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
