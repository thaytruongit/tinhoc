import React from 'react';
import { StudentRosterItem, LiveClassroomSession } from '../data/mockCurriculumData';

interface LiveGroupProgressPanelProps {
  students: StudentRosterItem[];
  liveSession?: LiveClassroomSession;
  selectedClassId: string;
}

export const LiveGroupProgressPanel: React.FC<LiveGroupProgressPanelProps> = ({
  students,
  liveSession,
  selectedClassId,
}) => {
  const groupData = React.useMemo(() => {
    const groups: Record<number, { xp: number; avgScore: number; count: number }> = {};
    students.filter(s => s.classId === selectedClassId).forEach(s => {
      if (!groups[s.groupNumber]) groups[s.groupNumber] = { xp: 0, avgScore: 0, count: 0 };
      groups[s.groupNumber].xp += s.xp;
      groups[s.groupNumber].avgScore += s.avgScore;
      groups[s.groupNumber].count += 1;
    });
    return Object.entries(groups).map(([groupNum, data]) => ({
      groupNum: Number(groupNum),
      avgXp: Math.round(data.xp / data.count),
      avgScore: Number((data.avgScore / data.count).toFixed(1)),
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, [students, selectedClassId]);

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
      <h3 className="font-headline-sm text-on-surface font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">groups</span>
        Tiến độ Nhóm học &amp; Bảng xếp hạng trực tiếp
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupData.map((group, idx) => (
          <div key={group.groupNum} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-400' : 'bg-surface-container-high'}`}>
                {idx + 1}
              </span>
              <div>
                <p className="font-bold">Nhóm {group.groupNum}</p>
                <p className="text-xs text-on-surface-variant">XP TB: {group.avgXp}</p>
              </div>
            </div>
            <span className="text-xl font-black text-primary">{group.avgScore}đ</span>
          </div>
        ))}
      </div>
    </div>
  );
};
