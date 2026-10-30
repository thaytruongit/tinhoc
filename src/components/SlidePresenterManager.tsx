import React from 'react';
import { usePresenterBroadcaster } from '../hooks/usePresenterBroadcaster';
import { LiveClassroomSession } from '../data/mockCurriculumData';

interface SlidePresenterManagerProps {
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (updater: (prev: LiveClassroomSession) => LiveClassroomSession) => void;
}

export const SlidePresenterManager: React.FC<SlidePresenterManagerProps> = ({ liveSession, onUpdateLiveSession }) => {
  const { broadcastStage, isBroadcasting, activeStage } = usePresenterBroadcaster(liveSession, onUpdateLiveSession);

  return (
    <div className="flex flex-col gap-2 p-3 bg-secondary-fixed/20 rounded-xl border border-secondary/30">
        <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">slideshow</span>
                Chế độ Trình chiếu Slide
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isBroadcasting ? 'bg-error text-white' : 'bg-surface-container-high'}`}>
                {isBroadcasting ? 'ĐANG PHÁT' : 'CHỜ PHÁT'}
            </span>
        </div>
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(stage => (
                <button 
                    key={stage}
                    type="button"
                    onClick={() => broadcastStage(stage as (1|2|3|4))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeStage === stage ? 'bg-secondary text-on-secondary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                >
                    HĐ {stage}
                </button>
            ))}
        </div>
    </div>
  );
};
