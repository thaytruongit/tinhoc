import { Router, Request, Response } from 'express';
import { requireTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import {
  liveClassroomSession,
  setLiveClassroomSession,
  isPgConfigured,
  hydrateFromPostgresIfNeeded,
} from '../state/serverState.ts';
import { saveLiveSessionStateToDb } from '../../db/repository.ts';

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

  setLiveClassroomSession({
    ...liveClassroomSession,
    ...patch,
    updatedAt: new Date().toISOString(),
  });

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
