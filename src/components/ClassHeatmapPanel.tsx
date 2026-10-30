import React from 'react';
import { StudentRosterItem, LiveClassroomSession } from '../data/mockCurriculumData';

interface ClassHeatmapPanelProps {
  students: StudentRosterItem[];
  liveSession?: LiveClassroomSession;
  selectedClassId: string;
}

export const ClassHeatmapPanel: React.FC<ClassHeatmapPanelProps> = ({
  students,
  liveSession,
  selectedClassId,
}) => {
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
        Heatmap: Cảnh báo Tốc độ & Khó khăn (Lớp {selectedClassId})
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {classStudents.map((s) => {
          // Mock logic: difficulty based on avgScore and recent activity
          const difficultyScore = Math.max(0, 10 - s.avgScore); // 0 (easy) to 10 (hard)
          const bgColor = difficultyScore > 3 ? 'bg-red-500/80' : difficultyScore > 1 ? 'bg-amber-500/80' : 'bg-emerald-500/80';
          
          return (
            <div
              key={s.id}
              className={`${bgColor} p-3 rounded-lg text-white font-bold text-xs flex flex-col gap-1 shadow-sm transition-all hover:scale-105`}
              title={`${s.name} (Điểm TB: ${s.avgScore})`}
            >
              <span className="truncate">{s.name.split(' ').pop()}</span>
              <span className="text-[10px] opacity-80">Điểm: {s.avgScore}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
