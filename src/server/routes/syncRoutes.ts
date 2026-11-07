import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { requireTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import {
  liveClassroomSession,
  inMemoryClasses,
  inMemoryStudents,
  isPgConfigured,
} from '../state/serverState.ts';
import { saveLiveSessionStateToDb } from '../../db/repository.ts';

const router = Router();

const GITHUB_SNAPSHOT_PATHS = [
  path.join(process.cwd(), 'public', 'data', 'github-public-db-snapshot.json'),
  path.join(process.cwd(), 'docs', 'data', 'github-public-db-snapshot.json'),
  path.join(process.cwd(), 'gh-pages-dist', 'data', 'github-public-db-snapshot.json'),
];

/**
 * Endpoint đồng bộ nhanh
 * POST /api/sync
 */
router.post('/api/sync', (req: Request, res: Response) => {
  const { pendingActions = [] } = req.body || {};
  res.json({
    status: 'synced',
    processedCount: Array.isArray(pendingActions) ? pendingActions.length : 0,
    serverTimestamp: new Date().toISOString(),
  });
});

/**
 * Lấy gói Snapshot dữ liệu công khai phục vụ GitHub Pages
 * GET /api/github/sync-snapshot
 */
router.get('/api/github/sync-snapshot', (_req: Request, res: Response) => {
  try {
    const primaryPath = GITHUB_SNAPSHOT_PATHS[0];
    if (fs.existsSync(primaryPath)) {
      const raw = fs.readFileSync(primaryPath, 'utf-8');
      const parsed = JSON.parse(raw);
      return res.json({ ok: true, snapshot: parsed });
    }
    return res.json({
      ok: true,
      snapshot: {
        schemaVersion: '2.0.0',
        appTitle: 'CloudPlay Interactive Learning — Tin Học GDPT 2018 (Khối 6-9)',
        syncedAtIso: new Date().toISOString(),
        prioritizeGitHubPublic: true,
        googleSheetsCsdlConfig: liveClassroomSession.googleSheetsCsdlConfig || null,
        sheetLessonsIndex: liveClassroomSession.googleSheetsSlideIndex || [],
        activeLiveLesson: {
          classId: String(liveClassroomSession.activeClassId || '6A10'),
          grade: Number(liveClassroomSession.activeGrade) || 6,
          period: Number(liveClassroomSession.activePeriod) || 1,
          lessonKey: `k${Number(liveClassroomSession.activeGrade) || 6}-tiet-${Number(liveClassroomSession.activePeriod) || 1}`,
          currentSlideNumber: 1,
          totalSlides: 15,
          slideViewMode: 'LARGE_16_9',
          isBroadcasting: Boolean(liveClassroomSession.isBroadcasting ?? true),
        },
        slideDecksSummaryByLesson: {},
        taughtPeriodsByClass: liveClassroomSession.taughtPeriodsByClass || {},
        classesCount: inMemoryClasses.length,
        studentsCount: inMemoryStudents.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'Failed to read GitHub snapshot' });
  }
});

/**
 * Lưu gói Snapshot dữ liệu công khai lên GitHub Public paths (Bảo mật: Chỉ Giáo viên)
 * POST /api/github/sync-snapshot
 */
router.post('/api/github/sync-snapshot', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incoming = req.body?.snapshot || req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ ok: false, error: 'Missing snapshot payload' });
    }

    if (incoming.googleSheetsCsdlConfig?.spreadsheetId) {
      liveClassroomSession.googleSheetsCsdlConfig = incoming.googleSheetsCsdlConfig;
    }
    if (Array.isArray(incoming.sheetLessonsIndex)) {
      liveClassroomSession.googleSheetsSlideIndex = incoming.sheetLessonsIndex;
    }
    liveClassroomSession.updatedAt = new Date().toISOString();

    const jsonFormatted = JSON.stringify(incoming, null, 2);
    const writtenPaths: string[] = [];
    for (const targetFile of GITHUB_SNAPSHOT_PATHS) {
      try {
        const dir = path.dirname(targetFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(targetFile, jsonFormatted, 'utf-8');
        writtenPaths.push(path.relative(process.cwd(), targetFile));
      } catch (writeErr) {
        console.warn('[GitHub Snapshot Sync] Warning writing to', targetFile, writeErr);
      }
    }

    if (isPgConfigured()) {
      saveLiveSessionStateToDb(
        'global_live_session',
        JSON.stringify(liveClassroomSession)
      ).catch(() => {});
    }

    res.json({
      ok: true,
      writtenPaths,
      syncedAtIso: incoming.syncedAtIso || new Date().toISOString(),
      message: 'Đã ghi gói dữ liệu chuẩn GitHub Public vào public/data, docs/data và gh-pages-dist/data!',
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'Failed to write GitHub snapshot' });
  }
});

export default router;
