import { Router, Request, Response } from 'express';
import { requireTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import {
  liveClassroomSession,
  setLiveClassroomSession,
  isPgConfigured,
  hydrateFromPostgresIfNeeded,
  saveSlidesBackupToDisk,
  offloadSessionBase64ToFileStorage,
} from '../state/serverState.ts';
import { saveLiveSessionStateToDb } from '../../db/repository.ts';
import {
  resolveMonotonicSlideSyncState,
  isLegacyDemoSlideDeck,
} from '../../utils/slideDeckManager.ts';

const router = Router();

/**
 * Lấy trạng thái phiên học trực tuyến (Học sinh & Giáo viên đều xem được)
 * GET /api/live-session
 */
router.get('/api/live-session', async (_req: Request, res: Response) => {
  await hydrateFromPostgresIfNeeded();
  res.json(liveClassroomSession);
});

/**
 * Cập nhật phiên học trực tuyến (Bảo mật: Chỉ Giáo viên)
 * POST /api/live-session
 */
router.post('/api/live-session', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  const patch = req.body || {};
  const syncResolved = resolveMonotonicSlideSyncState({
    currentSlideIndices:
      (liveClassroomSession.activeSlideIndexByLesson as Record<string, number>) || {},
    currentSyncVersions:
      (liveClassroomSession.slideSyncVersionByLesson as Record<string, number>) || {},
    incomingSlideIndices:
      patch.activeSlideIndexByLesson && typeof patch.activeSlideIndexByLesson === 'object'
        ? patch.activeSlideIndexByLesson
        : undefined,
    incomingSyncVersions:
      patch.slideSyncVersionByLesson && typeof patch.slideSyncVersionByLesson === 'object'
        ? patch.slideSyncVersionByLesson
        : undefined,
  });

  // Giữ lại các bộ slide đã có trên máy chủ
  const mergedDecks: Record<string, any> = {
    ...((liveClassroomSession.lectureSlidesByLesson as Record<string, any>) || {}),
  };
  if (patch.lectureSlidesByLesson && typeof patch.lectureSlidesByLesson === 'object') {
    for (const [k, d] of Object.entries(patch.lectureSlidesByLesson)) {
      if (d === null) {
        delete mergedDecks[k];
      } else if (d && !isLegacyDemoSlideDeck(d)) {
        mergedDecks[k] = d;
      }
    }
  }

  setLiveClassroomSession(
    offloadSessionBase64ToFileStorage({
      ...liveClassroomSession,
      ...patch,
      lectureSlidesByLesson:
        patch._clearAllSlides === true ? {} : mergedDecks,
      activeSlideIndexByLesson: syncResolved.activeSlideIndexByLesson,
      slideSyncVersionByLesson: syncResolved.slideSyncVersionByLesson,
      updatedAt: new Date().toISOString(),
    })
  );
  saveSlidesBackupToDisk();

  if (isPgConfigured()) {
    saveLiveSessionStateToDb(
      'global_live_session',
      JSON.stringify(liveClassroomSession)
    ).catch((error) => {
      console.error('Failed to persist live session to PostgreSQL:', error);
    });
  }
  res.json(liveClassroomSession);
});

/**
 * Điều hướng trang Slide thời gian thực (Atomic, zero-jitter)
 * POST /api/live-session/slide
 */
router.post('/api/live-session/slide', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  const {
    lessonKey,
    slideIndex = 0,
    slideSyncVersion = Date.now(),
    grade,
    period,
    classId,
    activeLiveView = 'slide',
  } = req.body || {};

  if (!lessonKey || typeof lessonKey !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing lessonKey' });
  }

  const curIndices =
    (liveClassroomSession.activeSlideIndexByLesson as Record<string, number>) || {};
  const curVersions =
    (liveClassroomSession.slideSyncVersionByLesson as Record<string, number>) || {};

  const syncResolved = resolveMonotonicSlideSyncState({
    currentSlideIndices: curIndices,
    currentSyncVersions: curVersions,
    incomingSlideIndices: { [lessonKey]: Number(slideIndex) || 0 },
    incomingSyncVersions: { [lessonKey]: Number(slideSyncVersion) || Date.now() },
  });

  const unlockedSlides = {
    ...((liveClassroomSession.unlockedSlideDeckByLesson as Record<string, boolean>) || {}),
    [lessonKey]: true,
  };
  const unlockedStages = {
    ...((liveClassroomSession.unlockedStagesByLesson as Record<string, any>) || {}),
    [lessonKey]: { 1: false, 2: false, 3: false, 4: false },
  };
  const unlockedPractice = {
    ...((liveClassroomSession.unlockedPracticeStage3ByLesson as Record<string, boolean>) || {}),
    [lessonKey]: false,
  };

  setLiveClassroomSession({
    ...liveClassroomSession,
    isBroadcasting: true,
    ...(grade ? { activeGrade: Number(grade) } : {}),
    ...(period ? { activePeriod: Number(period) } : {}),
    ...(classId ? { activeClassId: String(classId) } : {}),
    activeLiveView,
    unlockedSlideDeckByLesson: unlockedSlides,
    unlockedStagesByLesson: unlockedStages,
    unlockedPracticeStage3ByLesson: unlockedPractice,
    activeSlideIndexByLesson: syncResolved.activeSlideIndexByLesson,
    slideSyncVersionByLesson: syncResolved.slideSyncVersionByLesson,
    updatedAt: new Date().toISOString(),
  });

  if (isPgConfigured()) {
    saveLiveSessionStateToDb(
      'global_live_session',
      JSON.stringify(liveClassroomSession)
    ).catch(() => {});
  }

  res.json({
    ok: true,
    lessonKey,
    activeSlideIndex: syncResolved.activeSlideIndexByLesson[lessonKey] ?? 0,
    slideSyncVersion: syncResolved.slideSyncVersionByLesson[lessonKey] ?? Date.now(),
    liveSession: liveClassroomSession,
  });
});

export default router;

