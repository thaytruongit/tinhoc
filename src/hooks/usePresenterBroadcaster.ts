import { LiveClassroomSession } from '../data/mockCurriculumData';

export const usePresenterBroadcaster = (
  liveSession: LiveClassroomSession | undefined,
  onUpdateLiveSession: ((updater: (prev: LiveClassroomSession) => LiveClassroomSession) => void) | undefined
) => {
  const broadcastStage = (stage: 1 | 2 | 3 | 4) => {
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        activeStage: stage,
        // Optional: add timestamp or other sync metadata if needed for finer granularity
      }));
    }
  };

  const isBroadcasting = Boolean(liveSession?.isBroadcasting);
  const activeStage = liveSession?.activeStage || 1;

  return {
    broadcastStage,
    isBroadcasting,
    activeStage,
  };
};
