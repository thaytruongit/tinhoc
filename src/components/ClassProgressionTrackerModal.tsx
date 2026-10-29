import React, { useState } from 'react';
import {
  getPeriodsForGrade,
  NOTEBOOK_GRADE_SOURCES,
  type ClassroomItem,
  type LiveClassroomSession,
} from '../data/mockCurriculumData';

interface ClassProgressionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassroomItem[];
  selectedGrade: 6 | 7 | 8 | 9;
  selectedClassId: string;
  onChangeClass: (classId: string) => void;
  onChangeGrade: (grade: 6 | 7 | 8 | 9) => void;
  liveSession?: LiveClassroomSession;
  onToggleTaughtPeriod: (grade: 6 | 7 | 8 | 9, periodNum: number, classId: string) => void;
  onBroadcastLive: (
    grade: 6 | 7 | 8 | 9,
    periodNum: number,
    unlockAll?: boolean,
    targetClass?: string
  ) => void;
  onShowToast: (msg: string) => void;
}

export const ClassProgressionTrackerModal: React.FC<
  ClassProgressionTrackerModalProps
> = ({
  isOpen,
  onClose,
  classes,
  selectedGrade,
  selectedClassId,
  onChangeClass,
  onChangeGrade,
  liveSession,
  onToggleTaughtPeriod,
  onBroadcastLive,
  onShowToast,
}) => {
  const [filterMilestone, setFilterMilestone] = useState<
    'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const activeGradeClasses = classes.filter((c) => c.grade === selectedGrade);
  const targetClass =
    classes.find((c) => c.id === selectedClassId) ||
    activeGradeClasses[0] ||
    classes[0];

  const gradePeriods = getPeriodsForGrade(selectedGrade);
  const gradeSource =
    NOTEBOOK_GRADE_SOURCES.find((g) => g.grade === selectedGrade) ||
    NOTEBOOK_GRADE_SOURCES[0];

  const taughtMap = liveSession?.taughtPeriodsByClass || {};
  const currentClassTaughtPeriods = taughtMap[targetClass.id] || [];
  const completedCount = currentClassTaughtPeriods.length;
  const progressPercent = Math.round((completedCount / 29) * 100);

  // Filter periods based on milestone filter & search query
  const filteredPeriods = gradePeriods.filter((p) => {
    let matchesMilestone = true;
    if (filterMilestone === 'GK1') matchesMilestone = p.period >= 1 && p.period <= 7;
    else if (filterMilestone === 'CK1') matchesMilestone = p.period >= 8 && p.period <= 15;
    else if (filterMilestone === 'GK2') matchesMilestone = p.period >= 16 && p.period <= 22;
    else if (filterMilestone === 'CK2') matchesMilestone = p.period >= 23 && p.period <= 27;

    const matchesSearch =
      !searchTerm.trim() ||
      p.period.toString().includes(searchTerm) ||
      p.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMilestone && matchesSearch;
  });

  // Calculate stats for all classes in selected grade
  const classProgressSummaries = activeGradeClasses.map((cls) => {
    const list = taughtMap[cls.id] || [];
    const count = list.length;
    const pct = Math.round((count / 29) * 100);
    const lastTaught = list.length > 0 ? Math.max(...list) : 0;
    const isCurrentlyBroadcasting =
      liveSession?.isBroadcasting &&
      liveSession?.activeClassId === cls.id &&
      liveSession?.activeGrade === cls.grade;

    return {
      cls,
      count,
      pct,
      lastTaught,
      isCurrentlyBroadcasting,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-primary via-secondary to-tertiary text-on-primary flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-xs">
              <span className="material-symbols-outlined text-[26px]">insights</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-black text-white flex items-center gap-2">
                <span>Bộ Đếm Tiến Trình 29 Tiết Học Trực Tiếp</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-label-sm text-xs font-bold">
                  Khối {selectedGrade} • GDPT 2018
                </span>
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Theo dõi tiến độ hoàn thành PPCT 29 tiết theo thời gian thực cho từng lớp học • Khai thác dữ liệu chuẩn 10.0đ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Controls Bar: Grade Selector & Class Switcher */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-xs font-bold text-on-surface-variant shrink-0">
              Chọn Khối:
            </span>
            <div className="flex items-center gap-1">
              {([6, 7, 8, 9] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChangeGrade(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    selectedGrade === g
                      ? 'bg-primary text-on-primary shadow-xs scale-105'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-on-surface-variant shrink-0">
              Đang xem chi tiết Lớp:
            </span>
            <select
              value={targetClass.id}
              onChange={(e) => onChangeClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-sm text-xs font-bold border border-outline-variant/40 cursor-pointer"
            >
              {(activeGradeClasses.length > 0 ? activeGradeClasses : classes).map(
                (c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Sĩ số: {c.studentCount} HS)
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Real-time Overview Progress Cards for Active Grade Classes */}
        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">equalizer</span>
              Thống kê tiến trình hoàn thành 29 tiết của các Lớp Khối {selectedGrade}:
            </span>
            <span className="text-xs text-on-surface-variant">
              Khung thi: <strong>{gradeSource.examScheduleNote}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {classProgressSummaries.map(({ cls, count, pct, lastTaught, isCurrentlyBroadcasting }) => {
              const isSelected = cls.id === targetClass.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => onChangeClass(cls.id)}
                  className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-fixed/30 border-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      {cls.name}
                    </span>
                    {isCurrentlyBroadcasting ? (
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-bold text-[10px] animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Live
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-primary">{pct}%</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                    <span>
                      Đã hoàn thành: <strong>{count}/29 tiết</strong>
                    </span>
                    <span>{lastTaught > 0 ? `Xong Tiết ${lastTaught}` : 'Chưa bắt đầu'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Class Detailed 29-Period Matrix Area */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {progressPercent}%
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  <span>
                    Tiến Trình {targetClass.name}: {completedCount} / 29 Tiết Hoàn Thành
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                    ✓ Đã dạy {completedCount} tiết • Còn {29 - completedCount} tiết
                  </span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Bấm công tắc bên dưới từng tiết để đánh dấu <strong>"Đã dạy"</strong> / <strong>"Chưa dạy"</strong> cho {targetClass.name}. Hệ thống sẽ cập nhật trạng thái thời gian thực!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const all29 = Array.from({ length: 29 }, (_, i) => i + 1);
                  all29.forEach((pNum) => {
                    if (!currentClassTaughtPeriods.includes(pNum)) {
                      onToggleTaughtPeriod(selectedGrade, pNum, targetClass.id);
                    }
                  });
                  onShowToast(`✓ Đã đánh dấu hoàn thành toàn bộ 29 tiết cho ${targetClass.name}!`);
                }}
                className="px-3.5 py-2 rounded-xl bg-tertiary text-on-tertiary text-xs font-bold hover:brightness-110 cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Đánh dấu xong 29 Tiết</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  currentClassTaughtPeriods.forEach((pNum) => {
                    onToggleTaughtPeriod(selectedGrade, pNum, targetClass.id);
                  });
                  onShowToast(`Đã đặt lại tiến trình của ${targetClass.name} về 0/29 tiết.`);
                }}
                className="px-3 py-2 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold hover:bg-error-container hover:text-on-error-container cursor-pointer transition-all flex items-center gap-1 border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* Search & Milestone Filter Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm bài học, tiết số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
              {[
                { key: 'ALL', label: 'Toàn bộ 29 Tiết' },
                { key: 'GK1', label: 'Giữa kỳ I (1-7)' },
                { key: 'CK1', label: 'Cuối kỳ I (8-15)' },
                { key: 'GK2', label: 'Giữa kỳ II (16-22)' },
                { key: 'CK2', label: 'Cuối kỳ II (23-27)' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() =>
                    setFilterMilestone(m.key as 'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2')
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    filterMilestone === m.key
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 29 Periods Interactive Grid Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPeriods.map((p) => {
              const isTaught = currentClassTaughtPeriods.includes(p.period);
              const isBroadcastingNow =
                liveSession?.isBroadcasting &&
                liveSession?.activeClassId === targetClass.id &&
                liveSession?.activeGrade === selectedGrade &&
                liveSession?.activePeriod === p.period;

              return (
                <div
                  key={p.period}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                    isBroadcastingNow
                      ? 'bg-error-container/20 border-error ring-2 ring-error shadow-md'
                      : isTaught
                      ? 'bg-tertiary-fixed/20 border-tertiary/50 shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                          isTaught
                            ? 'bg-tertiary text-on-tertiary'
                            : 'bg-surface-container-highest text-on-surface'
                        }`}
                      >
                        {p.period}
                      </span>
                      <div>
                        <span className="font-label-sm text-xs font-bold text-on-surface line-clamp-1 block">
                          Tiết {p.period}: {p.lessonTitle}
                        </span>
                        <span className="text-[10px] text-on-surface-variant line-clamp-1">
                          {p.sgkPages} • {p.lessonType === 'theory' ? 'Lý thuyết' : 'Thực hành'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isTaught
                          ? 'bg-tertiary text-on-tertiary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {isTaught ? '✓ Đã dạy' : 'Chưa dạy'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        onToggleTaughtPeriod(selectedGrade, p.period, targetClass.id)
                      }
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1 ${
                        isTaught
                          ? 'bg-surface-container-highest text-on-surface hover:bg-error-container hover:text-on-error-container'
                          : 'bg-tertiary text-on-tertiary hover:brightness-110 shadow-xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isTaught ? 'check_circle' : 'circle'}
                      </span>
                      <span>{isTaught ? 'Bỏ đánh dấu' : 'Đánh dấu Đã Dạy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onBroadcastLive(selectedGrade, p.period, true, targetClass.id)
                      }
                      className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold text-[11px] hover:brightness-110 cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Phát Live tiết này trực tiếp cho màn hình học sinh"
                    >
                      <span className="material-symbols-outlined text-[14px]">sensors</span>
                      <span>Live Tiết {p.period}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-on-surface-variant">
            Trạng thái được lưu tự động và đồng bộ thời gian thực sang Cổng Học Sinh của <strong>{targetClass.name}</strong>.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold hover:opacity-95 cursor-pointer shadow-xs"
          >
            Đóng bảng tiến trình
          </button>
        </div>
      </div>
    </div>
  );
};
