import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type { HybridSlideDeckRecord, HybridSlideDeckSummary } from '../../utils/hybridSlideStorage.ts';

const router = Router();
const SLIDES_DIR = path.resolve(process.cwd(), 'data', 'slides');

function ensureSlidesDir(): void {
  try {
    if (!fs.existsSync(SLIDES_DIR)) {
      fs.mkdirSync(SLIDES_DIR, { recursive: true });
    }
  } catch {
    // ignore fs error
  }
}

function sanitizeLessonKey(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

const memoryDecks = new Map<string, HybridSlideDeckRecord>();

function readDeckFromDisk(lessonKey: string): HybridSlideDeckRecord | null {
  const safeKey = sanitizeLessonKey(lessonKey);
  if (!safeKey) return null;
  if (memoryDecks.has(safeKey)) {
    return memoryDecks.get(safeKey)!;
  }
  try {
    ensureSlidesDir();
    const filePath = path.join(SLIDES_DIR, `${safeKey}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as HybridSlideDeckRecord;
    if (parsed && Array.isArray(parsed.slides)) {
      memoryDecks.set(safeKey, parsed);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeDeckToDisk(lessonKey: string, deck: HybridSlideDeckRecord): boolean {
  const safeKey = sanitizeLessonKey(lessonKey);
  if (!safeKey) return false;
  memoryDecks.set(safeKey, deck);
  try {
    ensureSlidesDir();
    const filePath = path.join(SLIDES_DIR, `${safeKey}.json`);
    fs.writeFileSync(filePath, JSON.stringify(deck, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

router.get('/api/hybrid-slides', (_req, res) => {
  ensureSlidesDir();
  const summaries: Record<string, HybridSlideDeckSummary> = {};
  try {
    if (fs.existsSync(SLIDES_DIR)) {
      const files = fs.readdirSync(SLIDES_DIR).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        const key = file.replace(/\.json$/i, '');
        const deck = readDeckFromDisk(key);
        if (deck) {
          summaries[deck.lessonKey] = {
            lessonKey: deck.lessonKey,
            grade: deck.grade,
            period: deck.period,
            lessonTitle: deck.lessonTitle,
            fileName: deck.fileName,
            totalPages: deck.totalPages || deck.slides?.length || 0,
            renderQuality: deck.renderQuality,
            version: deck.version || 1,
            updatedAt: deck.updatedAt,
            hasCustomSlides: deck.renderQuality !== 'default-vector-svg',
            hasCustomWarmup: Boolean(deck.warmupConfig),
            tier3Saved: true,
          };
        }
      }
    }
  } catch {
    // ignore read error
  }
  for (const [key, deck] of memoryDecks.entries()) {
    if (!summaries[key]) {
      summaries[key] = {
        lessonKey: deck.lessonKey,
        grade: deck.grade,
        period: deck.period,
        lessonTitle: deck.lessonTitle,
        fileName: deck.fileName,
        totalPages: deck.totalPages || deck.slides?.length || 0,
        renderQuality: deck.renderQuality,
        version: deck.version || 1,
        updatedAt: deck.updatedAt,
        hasCustomSlides: deck.renderQuality !== 'default-vector-svg',
        hasCustomWarmup: Boolean(deck.warmupConfig),
        tier3Saved: true,
      };
    }
  }
  res.json({ ok: true, summaries });
});

router.get('/api/hybrid-slides/:lessonKey', (req, res) => {
  const safeKey = sanitizeLessonKey(req.params.lessonKey);
  const deck = readDeckFromDisk(safeKey);
  if (!deck) {
    res.status(404).json({ ok: false, error: 'Deck not found on server' });
    return;
  }
  res.json({ ok: true, deck });
});

router.post('/api/hybrid-slides/:lessonKey', (req, res) => {
  const safeKey = sanitizeLessonKey(req.params.lessonKey);
  const body = req.body as HybridSlideDeckRecord;
  if (!safeKey || !body || !Array.isArray(body.slides)) {
    res.status(400).json({ ok: false, error: 'Invalid slide deck payload' });
    return;
  }
  const normalized: HybridSlideDeckRecord = {
    ...body,
    lessonKey: safeKey,
    totalPages: body.slides.length,
    version: Number(body.version) || 1,
    updatedAt: body.updatedAt || new Date().toISOString(),
  };
  const persisted = writeDeckToDisk(safeKey, normalized);
  res.json({ ok: true, persisted, lessonKey: safeKey, version: normalized.version });
});

router.delete('/api/hybrid-slides/:lessonKey', (req, res) => {
  const safeKey = sanitizeLessonKey(req.params.lessonKey);
  memoryDecks.delete(safeKey);
  try {
    const filePath = path.join(SLIDES_DIR, `${safeKey}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore
  }
  res.json({ ok: true, lessonKey: safeKey });
});

export default router;

