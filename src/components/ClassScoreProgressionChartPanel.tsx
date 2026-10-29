import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import type { ClassroomItem, LiveClassroomSession } from '../data/mockCurriculumData';

export interface ClassScoreProgressionChartPanelProps {
  classes: ClassroomItem[];
  selectedGrade: 6 | 7 | 8 | 9;
  liveSession?: LiveClassroomSession;
  onShowToast: (msg: string) => void;
}

// Generate realistic 29-period progression data per class
const generateProgressionData = () => {
  const data = [];
  for (let period = 1; period <= 29; period++) {
    // Progressive score growth curve with realistic fluctuations
    const baseFactor = Math.log(period + 1) * 0.45;
    
    data.push({
      period: `Tiết ${period}`,
      periodNumber: period,
      '6A10': Number((7.8 + baseFactor + Math.sin(period * 0.8) * 0.25).toFixed(1)),
      '6A11': Number((7.5 + baseFactor + Math.cos(period * 0.7) * 0.3).toFixed(1)),
      '7A10': Number((8.0 + baseFactor + Math.sin(period * 0.6) * 0.2).toFixed(1)),
      '8A11': Number((8.2 + baseFactor + Math.cos(period * 0.9) * 0.22).toFixed(1)),
      '9A13': Number((8.4 + baseFactor + Math.sin(period * 0.5) * 0.18).toFixed(1)),
      // Category Averages
      trungBinhKhoi: Number((7.9 + baseFactor + Math.sin(period * 0.7) * 0.15).toFixed(1)),
      completionRate: Math.min(100, Math.round(75 + period * 0.85)),
    });
  }
  return data;
};

const ALL_PROGRESSION_DATA = generateProgressionData();

export const ClassScoreProgressionChartPanel: React.FC<ClassScoreProgressionChartPanelProps> = ({
  classes,
  selectedGrade,
  onShowToast,
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [gradeFilter, setGradeFilter] = useState<number | 'ALL'>(selectedGrade);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Filter relevant classes based on selected grade
  const filteredClasses =
    gradeFilter === 'ALL'
      ? classes
      : classes.filter((c) => c.grade === gradeFilter);

  // Class color palette for Recharts lines
  const classColors: Record<string, string> = {
    '6A10': '#3b82f6', // Primary blue
    '6A11': '#06b6d4', // Cyan
    '7A10': '#10b981', // Emerald green
    '8A11': '#f59e0b', // Amber
    '9A13': '#8b5cf6', // Purple
    trungBinhKhoi: '#ef4444', // Red trend line
  };

  // Calculate summary metrics
  const latestPeriodData = ALL_PROGRESSION_DATA[ALL_PROGRESSION_DATA.length - 1];
  const firstPeriodData = ALL_PROGRESSION_DATA[0];
  const overallAvg = latestPeriodData.trungBinhKhoi;
  const growthPoints = Number((latestPeriodData.trungBinhKhoi - firstPeriodData.trungBinhKhoi).toFixed(1));

  const handleExportData = () => {
    const jsonStr = JSON.stringify(ALL_PROGRESSION_DATA, null, 2);
    navigator.clipboard.writeText(jsonStr);
    onShowToast('Đã sao chép dữ liệu tiến trình điểm số lớp học theo thời gian vào khay nhớ tạm!');
  };

  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-tertiary text-white flex items-center justify-center font-bold shadow-md">
            <span className="material-symbols-outlined text-[26px]">show_chart</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
              <span>Biểu Đồ Tiến Bộ Điểm Số Trung Bình Theo Tiết Học (Recharts)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">
                29 Tiết
              </span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Theo dõi sự tăng trưởng năng lực Tin học GDPT 2018 của từng lớp học theo thời gian
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-outline-variant/20 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Đường tiến trình
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Miền tăng trưởng
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cột so sánh
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-xs font-bold border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Sao chép dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Grade & Class Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface-variant shrink-0">Lọc theo Khối:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setGradeFilter('ALL');
                setSelectedClassId('ALL');
              }}
              className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer transition-all ${
                gradeFilter === 'ALL'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Tất cả các khối
            </button>
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGradeFilter(g);
                  setSelectedClassId('ALL');
                }}
                className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer transition-all ${
                  gradeFilter === g
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Khối {g}
              </button>
            ))}
          </div>
        </div>

        {/* Filter specific class */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface-variant shrink-0">Chọn lớp cụ thể:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-bold text-xs border border-outline-variant/30 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Hiển thị tất cả các lớp</option>
            {filteredClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Khối {cls.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">grade</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant block">Điểm TB Tiết 29 (Toàn trường)</span>
            <span className="font-headline-sm text-headline-sm font-bold text-blue-700 dark:text-blue-300">
              {overallAvg} / 10.0
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">trending_up</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant block">Tăng trưởng từ Tiết 1</span>
            <span className="font-headline-sm text-headline-sm font-bold text-emerald-700 dark:text-emerald-300">
              +{growthPoints} điểm
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant block">Lớp xuất sắc nhất</span>
            <span className="font-headline-sm text-headline-sm font-bold text-amber-700 dark:text-amber-300">
              9A13 (9.1đ)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant block">Tỷ lệ hoàn thành bài tập</span>
            <span className="font-headline-sm text-headline-sm font-bold text-purple-700 dark:text-purple-300">
              {latestPeriodData.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Chart Container */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={ALL_PROGRESSION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis domain={[6, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {(selectedClassId === 'ALL' || selectedClassId === '6A10') && (
                <Line
                  type="monotone"
                  dataKey="6A10"
                  name="Lớp 6A10"
                  stroke={classColors['6A10']}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedClassId === 'ALL' || selectedClassId === '6A11') && (
                <Line
                  type="monotone"
                  dataKey="6A11"
                  name="Lớp 6A11"
                  stroke={classColors['6A11']}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedClassId === 'ALL' || selectedClassId === '7A10') && (
                <Line
                  type="monotone"
                  dataKey="7A10"
                  name="Lớp 7A10"
                  stroke={classColors['7A10']}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedClassId === 'ALL' || selectedClassId === '8A11') && (
                <Line
                  type="monotone"
                  dataKey="8A11"
                  name="Lớp 8A11"
                  stroke={classColors['8A11']}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedClassId === 'ALL' || selectedClassId === '9A13') && (
                <Line
                  type="monotone"
                  dataKey="9A13"
                  name="Lớp 9A13"
                  stroke={classColors['9A13']}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}

              <Line
                type="monotone"
                dataKey="trungBinhKhoi"
                name="Trung bình Toàn trường"
                stroke={classColors.trungBinhKhoi}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={ALL_PROGRESSION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis domain={[6, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              <Area
                type="monotone"
                dataKey="trungBinhKhoi"
                name="Trung bình Toàn trường"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="7A10"
                name="Lớp 7A10"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.25}
              />
            </AreaChart>
          ) : (
            <BarChart data={ALL_PROGRESSION_DATA.filter((_, idx) => idx % 3 === 0)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              <Bar dataKey="6A10" name="Lớp 6A10" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="7A10" name="Lớp 7A10" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="8A11" name="Lớp 8A11" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="9A13" name="Lớp 9A13" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
