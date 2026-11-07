import { Router, Request, Response } from 'express';
import { pingDatabaseKeepAlive, getKeepAliveHeartbeatStatus } from '../../db/repository.ts';

const router = Router();

/**
 * Trạng thái Heartbeat của Supabase Cron
 * GET /api/cron/keep-alive/status
 */
router.get('/api/cron/keep-alive/status', async (_req: Request, res: Response) => {
  try {
    const heartbeat = await getKeepAliveHeartbeatStatus();
    res.json({ ok: true, heartbeat });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message || 'Failed to read keep-alive status' });
  }
});

/**
 * Thực thi Ping chống ngủ đông CSDL Supabase
 * GET & POST /api/cron/keep-alive
 */
export const handleKeepAlivePing = async (req: Request, res: Response) => {
  const configuredSecret = process.env.CRON_SECRET;
  if (configuredSecret && configuredSecret.trim().length > 0) {
    const authHeader = req.headers.authorization || '';
    const querySecret = String(req.query.secret || '');
    if (authHeader !== `Bearer ${configuredSecret}` && querySecret !== configuredSecret) {
      return res.status(401).json({ ok: false, error: 'Invalid CRON_SECRET' });
    }
  }

  const source = String(
    req.body?.source || req.query.source || req.headers['x-cron-source'] || 'http-cron-trigger'
  ).slice(0, 64);

  try {
    const heartbeat = await pingDatabaseKeepAlive(source);
    res.json({
      ok: true,
      message: 'Đã thực thi truy vấn đọc/ghi chống ngủ đông Supabase / PostgreSQL thành công!',
      heartbeat,
    });
  } catch (error: any) {
    console.error('Cron keep-alive ping failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Keep-alive database ping failed',
    });
  }
};

router.get('/api/cron/keep-alive', handleKeepAlivePing);
router.post('/api/cron/keep-alive', handleKeepAlivePing);

// Lên lịch ngầm định kỳ 6 tiếng ping một lần
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
setInterval(() => {
  if (process.env.SQL_HOST) {
    pingDatabaseKeepAlive('internal-6h-cron-scheduler').catch((err) => {
      console.warn('[Cron Keep-Alive Warning]:', err);
    });
  }
}, SIX_HOURS_MS);

export default router;
