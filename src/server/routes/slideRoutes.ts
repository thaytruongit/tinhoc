import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { requireTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import {
  liveClassroomSession,
  setLiveClassroomSession,
  isPgConfigured,
  hydrateFromPostgresIfNeeded,
  saveSlidesBackupToDisk,
  offloadSessionBase64ToFileStorage,
  storeDataUrlInFileStorage,
  fileStorageMemoryMap,
  FILE_STORAGE_DIR,
  FILE_STORAGE_QUOTA_BYTES,
  DB_QUOTA_BYTES,
} from '../state/serverState.ts';
import {
  upsertLectureSlideDeckToDb,
  deleteLectureSlideDeckFromDb,
  deleteAllLectureSlideDecksFromDb,
  saveLiveSessionStateToDb,
} from '../../db/repository.ts';
import {
  resolveSlideSourceInput,
  buildFixedSlideFolderMapping,
  matchFileToGradeAndPeriod,
  DEFAULT_FIXED_SLIDE_ROOT_FOLDER,
} from '../../utils/slideDeckManager.ts';

const router = Router();

/**
 * Lấy toàn bộ bộ slide trong CSDL
 * GET /api/db/slides
 */
router.get('/api/db/slides', async (_req: Request, res: Response) => {
  await hydrateFromPostgresIfNeeded();
  res.json({
    ok: true,
    decks: (liveClassroomSession.lectureSlidesByLesson as Record<string, any>) || {},
    activeSlideIndexByLesson:
      (liveClassroomSession.activeSlideIndexByLesson as Record<string, number>) || {},
    slideSyncVersionByLesson:
      (liveClassroomSession.slideSyncVersionByLesson as Record<string, number>) || {},
  });
});

/**
 * Thêm / lưu bộ slide vào CSDL (Bảo mật: Chỉ Giáo viên)
 * POST /api/db/slides
 */
router.post('/api/db/slides', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonKey, deck, activeSlideIndex } = req.body || {};
    if (!lessonKey || !deck || typeof deck !== 'object') {
      return res.status(400).json({ ok: false, error: 'Thiếu lessonKey hoặc dữ liệu deck' });
    }

    const markedDeck = {
      ...deck,
      lessonKey,
      isUserUploaded: true,
      storageBucket: 'slide-storage-1gb',
    };

    const offloadedSession = offloadSessionBase64ToFileStorage({
      lectureSlidesByLesson: { [lessonKey]: markedDeck },
    });
    const finalDeck = offloadedSession.lectureSlidesByLesson?.[lessonKey] || markedDeck;

    const currentDecks = {
      ...((liveClassroomSession.lectureSlidesByLesson as Record<string, any>) || {}),
      [lessonKey]: finalDeck,
    };

    const nextIndices = {
      ...((liveClassroomSession.activeSlideIndexByLesson as Record<string, number>) || {}),
    };
    const nextVersions = {
      ...((liveClassroomSession.slideSyncVersionByLesson as Record<string, number>) || {}),
    };
    if (typeof activeSlideIndex === 'number' && Number.isFinite(activeSlideIndex)) {
      nextIndices[lessonKey] = Math.max(0, Math.floor(activeSlideIndex));
      nextVersions[lessonKey] = Date.now();
    }

    setLiveClassroomSession({
      ...liveClassroomSession,
      lectureSlidesByLesson: currentDecks,
      activeSlideIndexByLesson: nextIndices,
      slideSyncVersionByLesson: nextVersions,
      unlockedSlideDeckByLesson: {
        ...((liveClassroomSession.unlockedSlideDeckByLesson as Record<string, boolean>) || {}),
        [lessonKey]: true,
      },
      updatedAt: new Date().toISOString(),
    });
    saveSlidesBackupToDisk();

    if (isPgConfigured()) {
      await upsertLectureSlideDeckToDb({
        lessonKey,
        grade: Number(finalDeck.grade) || 6,
        period: Number(finalDeck.period) || 1,
        fileName: String(finalDeck.fileName || `${lessonKey}.webp`),
        fileType: String(finalDeck.fileType || 'image'),
        fileSize: String(finalDeck.fileSize || '0 KB'),
        storageBucket: 'slide-storage-1gb',
        totalCompressedKb: Number(finalDeck.totalCompressedKb) || 0,
        slidesJson: JSON.stringify(finalDeck),
      }).catch((err) => console.warn('upsertLectureSlideDeckToDb warning:', err));

      saveLiveSessionStateToDb(
        'global_live_session',
        JSON.stringify(liveClassroomSession)
      ).catch(() => {});
    }

    res.json({
      ok: true,
      lessonKey,
      deck: finalDeck,
      liveClassroomSession,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || 'Lỗi khi lưu slide vào CSDL.' });
  }
});

/**
 * Xóa slide của 1 tiết (Bảo mật: Chỉ Giáo viên)
 * DELETE /api/db/slides/:lessonKey
 */
router.delete('/api/db/slides/:lessonKey', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonKey = String(req.params.lessonKey || '').trim();
    const currentDecks = {
      ...((liveClassroomSession.lectureSlidesByLesson as Record<string, any>) || {}),
    };
    delete currentDecks[lessonKey];

    const nextIndices = {
      ...((liveClassroomSession.activeSlideIndexByLesson as Record<string, number>) || {}),
      [lessonKey]: 0,
    };
    const nextVersions = {
      ...((liveClassroomSession.slideSyncVersionByLesson as Record<string, number>) || {}),
      [lessonKey]: Date.now(),
    };

    setLiveClassroomSession({
      ...liveClassroomSession,
      lectureSlidesByLesson: currentDecks,
      activeSlideIndexByLesson: nextIndices,
      slideSyncVersionByLesson: nextVersions,
      updatedAt: new Date().toISOString(),
    });
    saveSlidesBackupToDisk();

    if (isPgConfigured()) {
      await deleteLectureSlideDeckFromDb(lessonKey).catch(() => {});
      await saveLiveSessionStateToDb(
        'global_live_session',
        JSON.stringify(liveClassroomSession)
      ).catch(() => {});
    }

    res.json({
      ok: true,
      lessonKey,
      message: `🗑️ Đã xoá toàn bộ slide của tiết ${lessonKey} khỏi CSDL!`,
      liveClassroomSession,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Xóa toàn bộ slide của mọi tiết (Bảo mật: Chỉ Giáo viên)
 * DELETE /api/db/slides
 */
router.delete('/api/db/slides', requireTeacherAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    fileStorageMemoryMap.clear();
    try {
      if (fs.existsSync(FILE_STORAGE_DIR)) {
        for (const f of fs.readdirSync(FILE_STORAGE_DIR)) {
          fs.unlinkSync(path.join(FILE_STORAGE_DIR, f));
        }
      }
    } catch {
      // ignore
    }

    setLiveClassroomSession({
      ...liveClassroomSession,
      lectureSlidesByLesson: {},
      activeSlideIndexByLesson: {},
      slideSyncVersionByLesson: {},
      updatedAt: new Date().toISOString(),
    });
    saveSlidesBackupToDisk();

    if (isPgConfigured()) {
      await deleteAllLectureSlideDecksFromDb().catch(() => {});
      await saveLiveSessionStateToDb(
        'global_live_session',
        JSON.stringify(liveClassroomSession)
      ).catch(() => {});
    }

    res.json({
      ok: true,
      message: '🔥 Đã xoá trắng toàn bộ dữ liệu Slide đã có sẵn trong CSDL và File Storage của tất cả các tiết học!',
      liveClassroomSession,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Nạp slide từ đường dẫn tệp hoặc URL (Bảo mật: Chỉ Giáo viên)
 * POST /api/slides/load-from-path-or-url
 */
router.post('/api/slides/load-from-path-or-url', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawInput = String(req.body?.pathOrUrl || '').trim();
    const resolved = resolveSlideSourceInput(rawInput);

    if (resolved.kind === 'empty') {
      return res.status(400).json({
        ok: false,
        error: 'Đường dẫn trống. Vui lòng dán đường dẫn Google Drive hoặc đường dẫn tệp trên máy tính.',
      });
    }

    if (resolved.kind === 'local-path' && resolved.normalizedLocalPath) {
      const candidatePath = resolved.normalizedLocalPath;
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        const buffer = fs.readFileSync(candidatePath);
        const isPdf =
          buffer.length >= 4 &&
          buffer[0] === 0x25 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x44 &&
          buffer[3] === 0x46;
        const fileType = isPdf ? 'pdf' : resolved.inferredFileType;
        const mimeType =
          fileType === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        return res.json({
          ok: true,
          mode: 'binary',
          resolved,
          fileName: resolved.displayName,
          fileType,
          mimeType,
          sizeKb: Math.max(1, Math.round(buffer.length / 1024)),
          base64Data: buffer.toString('base64'),
        });
      }

      return res.json({
        ok: true,
        mode: 'client-local-picker',
        resolved,
        fileName: resolved.displayName,
        fileType: resolved.inferredFileType,
        message: 'Đường dẫn thuộc ổ đĩa máy tính cá nhân — Hệ thống tự động mở hộp chọn tệp tương ứng để nạp ngay!',
      });
    }

    // Google Drive / Google Slides / Remote URL
    const fetchCandidates: string[] = [];
    if (resolved.exportPdfUrl) fetchCandidates.push(resolved.exportPdfUrl);
    if (resolved.downloadUrl) fetchCandidates.push(resolved.downloadUrl);

    for (const candidateUrl of fetchCandidates) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);
        const resp = await fetch(candidateUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        clearTimeout(timer);

        if (resp.ok) {
          const ab = await resp.arrayBuffer();
          const buf = Buffer.from(ab);
          const isPdfMagic =
            buf.length > 16 &&
            buf[0] === 0x25 &&
            buf[1] === 0x50 &&
            buf[2] === 0x44 &&
            buf[3] === 0x46;
          const isZipMagic =
            buf.length > 16 &&
            buf[0] === 0x50 &&
            buf[1] === 0x4b &&
            buf[2] === 0x03 &&
            buf[3] === 0x04;

          if ((isPdfMagic || isZipMagic) && buf.length < 22 * 1024 * 1024) {
            const detectedType = isPdfMagic ? 'pdf' : 'pptx';
            const detectedMime = isPdfMagic
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            const baseFileName = resolved.displayName.replace(/\.(pptx?|pdf)$/i, '');
            return res.json({
              ok: true,
              mode: 'binary',
              resolved,
              fileName: `${baseFileName}.${detectedType}`,
              fileType: detectedType,
              mimeType: detectedMime,
              sizeKb: Math.max(1, Math.round(buf.length / 1024)),
              base64Data: buf.toString('base64'),
            });
          }
        }
      } catch {
        // ignore fetch candidate error
      }
    }

    return res.json({
      ok: true,
      mode: 'link-fallback',
      resolved,
      message: 'Đã nhận dạng liên kết tài liệu trực tuyến!',
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'Không thể nạp tệp từ nguồn được cung cấp' });
  }
});

/**
 * Quét thư mục cố định và nạp slide tự động
 * POST /api/slides/resolve-fixed-folder
 */
router.post('/api/slides/resolve-fixed-folder', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawGrade = Number(req.body?.grade);
    const grade = ([6, 7, 8, 9].includes(rawGrade) ? rawGrade : 6) as 6 | 7 | 8 | 9;
    const period = Math.max(1, Math.min(29, Number(req.body?.period) || 1));
    const rootFolder = String(req.body?.rootFolder || DEFAULT_FIXED_SLIDE_ROOT_FOLDER).trim();

    const mapping = buildFixedSlideFolderMapping(grade, period, rootFolder);
    const lessonKey = mapping.lessonKey;

    const searchRoots = [
      mapping.rootFolder,
      path.join(FILE_STORAGE_DIR, 'fixed-slide-library'),
      path.resolve(process.cwd(), 'slide_library'),
    ];

    let matchedDiskFilePath: string | null = null;
    for (const baseRoot of searchRoots) {
      if (!baseRoot) continue;
      for (const rel of mapping.candidateRelativePaths) {
        if (!/\.pdf$/i.test(rel)) continue;
        const fullCandidate = path.join(baseRoot, ...rel.split('/'));
        if (fs.existsSync(fullCandidate) && fs.statSync(fullCandidate).isFile()) {
          matchedDiskFilePath = fullCandidate;
          break;
        }
      }
      if (matchedDiskFilePath) break;

      const gradeFolderCandidate = path.join(baseRoot, `Tin ${grade}`);
      if (fs.existsSync(gradeFolderCandidate) && fs.statSync(gradeFolderCandidate).isDirectory()) {
        const files = fs.readdirSync(gradeFolderCandidate);
        for (const f of files) {
          if (!/\.pdf$/i.test(f)) continue;
          const matched = matchFileToGradeAndPeriod(`Tin ${grade}/${f}`, grade);
          if (matched && matched.grade === grade && matched.period === period) {
            matchedDiskFilePath = path.join(gradeFolderCandidate, f);
            break;
          }
        }
      }
      if (matchedDiskFilePath) break;
    }

    if (matchedDiskFilePath && fs.existsSync(matchedDiskFilePath)) {
      const buffer = fs.readFileSync(matchedDiskFilePath);
      const isGenuinePdf =
        buffer.length > 4 && buffer.subarray(0, 4).toString('ascii') === '%PDF';
      if (isGenuinePdf) {
        const fileName = path.basename(matchedDiskFilePath);
        return res.json({
          ok: true,
          mode: 'binary',
          exists: true,
          lessonKey,
          mapping,
          fileName,
          fileType: 'pdf',
          mimeType: 'application/pdf',
          sizeKb: Math.max(1, Math.round(buffer.length / 1024)),
          base64Data: buffer.toString('base64'),
        });
      }
    }

    return res.json({
      ok: true,
      mode: 'not-found',
      exists: false,
      lessonKey,
      mapping,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message || 'Lỗi khi ánh xạ tự động Slide theo thư mục cố định.',
    });
  }
});

/**
 * Tải ảnh slide lên File Storage
 * POST /api/file-storage/slides/upload
 */
router.post('/api/file-storage/slides/upload', requireTeacherAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonKey = 'k6-tiet-1', images = [] } = req.body || {};
    const uploadedItems: { index: number; fileId: string; url: string; sizeKb: number }[] = [];
    let totalSizeKb = 0;

    if (Array.isArray(images)) {
      images.forEach((dataUrl: string, idx: number) => {
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          const stored = storeDataUrlInFileStorage(dataUrl, lessonKey, `slide-${idx + 1}`);
          if (stored) {
            uploadedItems.push({ index: idx, ...stored });
            totalSizeKb += stored.sizeKb;
          }
        } else if (typeof dataUrl === 'string' && dataUrl.startsWith('/api/file-storage/')) {
          uploadedItems.push({
            index: idx,
            fileId: dataUrl.split('/').pop() || `slide-${idx + 1}`,
            url: dataUrl,
            sizeKb: 42,
          });
          totalSizeKb += 42;
        }
      });
    }

    res.json({
      ok: true,
      lessonKey,
      items: uploadedItems,
      totalCount: uploadedItems.length,
      totalSizeKb,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || 'Upload file failed' });
  }
});

/**
 * Lấy tệp từ File Storage
 * GET /api/file-storage/slides/file/:fileId
 */
router.get('/api/file-storage/slides/file/:fileId', (req: Request, res: Response) => {
  const fileId = path.basename(String(req.params.fileId || ''));
  const memItem = fileStorageMemoryMap.get(fileId);
  if (memItem) {
    res.setHeader('Content-Type', memItem.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(memItem.buffer);
  }

  const diskPath = path.join(FILE_STORAGE_DIR, fileId);
  const metaPath = path.join(FILE_STORAGE_DIR, `${fileId}.meta.json`);
  if (fs.existsSync(diskPath)) {
    try {
      const buffer = fs.readFileSync(diskPath);
      let mimeType = fileId.endsWith('.webp')
        ? 'image/webp'
        : fileId.endsWith('.png')
        ? 'image/png'
        : fileId.endsWith('.pdf')
        ? 'application/pdf'
        : 'image/jpeg';
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          if (meta.mimeType) mimeType = meta.mimeType;
        } catch {}
      }
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } catch {}
  }

  res.status(404).json({ ok: false, error: 'File not found in storage' });
});

/**
 * Thống kê dung lượng File Storage
 * GET /api/file-storage/slides/stats
 */
router.get('/api/file-storage/slides/stats', (_req: Request, res: Response) => {
  let usedBytes = 0;
  fileStorageMemoryMap.forEach((v) => {
    usedBytes += v.sizeBytes;
  });
  const dbJsonBytes = Buffer.byteLength(JSON.stringify(liveClassroomSession), 'utf-8');
  res.json({
    ok: true,
    bucket: 'slide-storage-1gb',
    fileCount: fileStorageMemoryMap.size,
    usedStorageBytes: usedBytes,
    usedStorageMb: Number((usedBytes / (1024 * 1024)).toFixed(2)),
    totalQuotaMb: 1024,
    percentUsed: Number(((usedBytes / FILE_STORAGE_QUOTA_BYTES) * 100).toFixed(2)),
    databaseJsonBytes: dbJsonBytes,
    databaseJsonMb: Number((dbJsonBytes / (1024 * 1024)).toFixed(2)),
    databaseQuotaMb: 500,
  });
});

export default router;
