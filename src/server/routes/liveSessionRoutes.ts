import { Router, Request, Response } from 'express';
import {
  liveClassroomSession,
  setLiveClassroomSession,
  isPgConfigured,
  hydrateFromPostgresIfNeeded,
} from '../state/serverState.ts';
import { saveLiveSessionStateToDb } from '../../db/repository.ts';

const router = Router();

// Connected Server-Sent Events (SSE) clients for instant (<30ms) Teacher <-> Student synchronization
const sseClients = new Set<Response>();

function broadcastLiveSessionSse(sessionState: any) {
  const payload = `data: ${JSON.stringify(sessionState)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

/**
 * Lấy trạng thái phiên học trực tuyến (Học sinh & Giáo viên đều xem được)
 * GET /api/live-session
 */
router.get('/api/live-session', async (_req: Request, res: Response) => {
  await hydrateFromPostgresIfNeeded();
  res.json(liveClassroomSession);
});

/**
 * Kênh Server-Sent Events (SSE) đẩy trạng thái Phòng Live tức thì (<30ms) giữa Giáo viên và Học sinh
 * GET /api/live-session/stream
 */
router.get('/api/live-session/stream', async (req: Request, res: Response) => {
  await hydrateFromPostgresIfNeeded();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Gửi ngay trạng thái hiện tại khi vừa kết nối
  res.write(`data: ${JSON.stringify(liveClassroomSession)}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

/**
 * Cập nhật & đồng bộ hai chiều phiên học trực tuyến giữa Giáo viên và Học sinh
 * POST /api/live-session
 */
router.post('/api/live-session', async (req: Request, res: Response) => {
  const patch = req.body || {};
  const nowIso = new Date().toISOString();

  const mergedWaitingRoomByLesson = {
    ...(liveClassroomSession.waitingRoomByLesson || {}),
    ...(patch.waitingRoomByLesson || {}),
  };

  const mergedUnlockedStagesByLesson = {
    ...(liveClassroomSession.unlockedStagesByLesson || {}),
    ...(patch.unlockedStagesByLesson || {}),
  };

  const mergedCompletedStagesByStudent = {
    ...(liveClassroomSession.completedStagesByStudent || {}),
    ...(patch.completedStagesByStudent || {}),
  };

  const mergedFinalizedActivitiesByLesson = {
    ...(liveClassroomSession.finalizedActivitiesByLesson || {}),
    ...(patch.finalizedActivitiesByLesson || {}),
  };

  const mergedActiveSlideIndexByLesson = {
    ...(liveClassroomSession.activeSlideIndexByLesson || {}),
    ...(patch.activeSlideIndexByLesson || {}),
  };

  const mergedSlideDeckVersionByLesson = {
    ...(liveClassroomSession.slideDeckVersionByLesson || {}),
    ...(patch.slideDeckVersionByLesson || {}),
  };

  const nextState = {
    ...liveClassroomSession,
    ...patch,
    waitingRoomByLesson: mergedWaitingRoomByLesson,
    unlockedStagesByLesson: mergedUnlockedStagesByLesson,
    completedStagesByStudent: mergedCompletedStagesByStudent,
    finalizedActivitiesByLesson: mergedFinalizedActivitiesByLesson,
    activeSlideIndexByLesson: mergedActiveSlideIndexByLesson,
    slideDeckVersionByLesson: mergedSlideDeckVersionByLesson,
    updatedAt: nowIso,
  };

  setLiveClassroomSession(nextState);
  broadcastLiveSessionSse(nextState);

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

export default router;
