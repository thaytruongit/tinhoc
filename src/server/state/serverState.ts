import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import {
  getDefaultWorksheetForLesson,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  type ClassroomItem,
  type StudentRosterItem,
} from '../../data/mockCurriculumData.js';
import {
  ensureDatabaseTablesExist,
  getLiveSessionStateFromDb,
  getAllLectureSlideDecksFromDb,
  getAllLessonWorksheetsFromDb,
} from '../../db/repository.ts';
import {
  isLegacyDemoSlideDeck,
  isRealRenderedPdfSlideDeck,
} from '../../utils/slideDeckManager.ts';

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const FILE_STORAGE_DIR = path.join(DATA_DIR, 'file-storage-slides');
export const SLIDES_BACKUP_FILE = path.join(DATA_DIR, 'lecture_slides_store.json');
export const FILE_STORAGE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB
export const DB_QUOTA_BYTES = 500 * 1024 * 1024; // 500 MB

export interface FileStorageItem {
  buffer: Buffer;
  mimeType: string;
  createdAt: string;
  lessonKey: string;
  sizeBytes: number;
}

export const fileStorageMemoryMap = new Map<string, FileStorageItem>();

export let inMemoryClasses: ClassroomItem[] = [...INITIAL_CLASSES];
export let inMemoryStudents: StudentRosterItem[] = [...INITIAL_STUDENTS];
export let initialClassesSeeded = false;
export let initialStudentsSeeded = false;

export function setInMemoryClasses(classes: ClassroomItem[]) {
  inMemoryClasses = classes;
}

export function setInMemoryStudents(students: StudentRosterItem[]) {
  inMemoryStudents = students;
}

export function setClassesSeeded(seeded: boolean) {
  initialClassesSeeded = seeded;
}

export function setStudentsSeeded(seeded: boolean) {
  initialStudentsSeeded = seeded;
}

// 29 Tiết mặc định cho 4 khối 6, 7, 8, 9
export const defaultUnlockedStagesByLesson: Record<string, Record<1 | 2 | 3 | 4, boolean>> = {};
export const defaultVerifiedLessonsMap: Record<string, boolean> = {};

([6, 7, 8, 9] as const).forEach((g) => {
  for (let p = 1; p <= 29; p++) {
    const key = `k${g}-tiet-${p}`;
    defaultUnlockedStagesByLesson[key] = {
      1: false,
      2: false,
      3: false,
      4: false,
    };
    defaultVerifiedLessonsMap[key] = true;
  }
});

export let liveClassroomSession: Record<string, any> = {
  isBroadcasting: true,
  activeGrade: 6,
  activePeriod: 1,
  activeStage: 1,
  activeLiveView: 'waiting',
  activeClassId: '6A10',
  roomPin: '', // Mã PIN phòng học nếu bật bảo mật
  unlockedStagesByLesson: defaultUnlockedStagesByLesson,
  lectureSlidesByLesson: {},
  activeSlideIndexByLesson: {},
  slideSyncVersionByLesson: {},
  wheelCall: null,
  taughtPeriodsByClass: { '6A10': [1], '7A10': [1] },
  learnedPeriodsByStudent: { '61008': ['k6-tiet-1'], '71001': ['k7-tiet-1'] },
  customWorksheetsByLesson: {},
  verifiedLessonsMap: defaultVerifiedLessonsMap,
  studentDraftsByKey: {},
  taggedSubmissions: [],
  updatedAt: new Date().toISOString(),
};

export function updateLiveClassroomSession(updater: (prev: Record<string, any>) => Record<string, any>) {
  liveClassroomSession = updater(liveClassroomSession);
}

export function setLiveClassroomSession(next: Record<string, any>) {
  liveClassroomSession = next;
}

export function isPgConfigured(): boolean {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.POSTGRES_URL;
  if (
    dbUrl &&
    dbUrl.trim().length > 0 &&
    !dbUrl.includes('[YOUR-PASSWORD]') &&
    !dbUrl.includes('YOUR_SUPABASE_DB_PASSWORD') &&
    !dbUrl.includes('MY_')
  ) {
    return true;
  }
  const host = process.env.SQL_HOST;
  const pwd = process.env.SQL_PASSWORD;
  if (
    host &&
    host.trim().length > 0 &&
    host !== 'localhost' &&
    host !== '127.0.0.1' &&
    host !== '0.0.0.0' &&
    pwd &&
    pwd.trim().length > 0 &&
    pwd !== 'postgres' &&
    pwd !== 'YOUR_SUPABASE_DB_PASSWORD'
  ) {
    return true;
  }
  return false;
}

export function sanitizeWorksheetRecord(rawWs: any, lessonKey: string) {
  if (!rawWs || typeof rawWs !== 'object') return rawWs;
  const match = /^k([6789])-tiet-(\d+)$/i.exec(lessonKey);
  const grade = (match ? Number(match[1]) : Number(rawWs.grade) || 6) as 6 | 7 | 8 | 9;
  const period = match ? Number(match[2]) : Number(rawWs.period) || 1;
  const fallbackWs = getDefaultWorksheetForLesson(grade, period);
  const rawStage2 = rawWs.stage2 || {};

  const rawPrompt = String(rawStage2.shortAnswerPrompt || '')
    .replace(/^:\s*/, '')
    .replace(/^(?:---\s*)?(?:DẠNG\s*4\s*:\s*)?CÂU HỎI TRẢ LỜI NGẮN[^\n]*---\s*/i, '')
    .replace(/^CÂU HỎI TRẢ LỜI NGẮN\s*\([^)]*\)\s*---$/i, '')
    .trim();

  const rawSaQuestions = Array.isArray(rawStage2.shortAnswerQuestions)
    ? rawStage2.shortAnswerQuestions.filter(
        (q: any) => q && String(q.question || '').trim().length > 0
      )
    : [];

  const rawParagraph = String(
    rawStage2.dragDropParagraph || fallbackWs.stage2.dragDropParagraph || ''
  )
    .replace(/\(\s*(\d+)\s*\)\s*\[[^\]]*\]/g, '($1)')
    .replace(/\[\s*(\d+)\s*:\s*[^\]]*\]/g, '($1)');

  const hasLegacyBlankDragDrop =
    Array.isArray(rawStage2.dragDropQuestions) &&
    rawStage2.dragDropQuestions.some((q: any) =>
      /\(\d+\)|Khái niệm cốt lõi\s*\d+\s*trong bài học là/i.test(
        String(q?.promptFragment || '')
      )
    );

  const normalizedDragDropQuestions =
    Array.isArray(rawStage2.dragDropQuestions) &&
    rawStage2.dragDropQuestions.length > 0 &&
    !hasLegacyBlankDragDrop
      ? rawStage2.dragDropQuestions
      : fallbackWs.stage2.dragDropQuestions;

  const normalizedDragItems =
    Array.isArray(rawStage2.dragItems) &&
    rawStage2.dragItems.length > 0 &&
    !hasLegacyBlankDragDrop
      ? rawStage2.dragItems
      : fallbackWs.stage2.dragItems;

  const isGenericBucket =
    !rawStage2.bucketA ||
    /^Hộp A:\s*Khái niệm & Dữ liệu cốt lõi$/i.test(String(rawStage2.bucketA).trim());

  const isLegacyTitle =
    !rawStage2.dragDropTitle ||
    /từ khóa|đoạn văn/i.test(String(rawStage2.dragDropTitle));
  const isLegacyInstruction =
    !rawStage2.dragDropInstruction ||
    /từ gợi ý|ô trống/i.test(String(rawStage2.dragDropInstruction));

  return {
    ...fallbackWs,
    ...rawWs,
    stage2: {
      ...fallbackWs.stage2,
      ...rawStage2,
      dragDropTitle: isLegacyTitle
        ? fallbackWs.stage2.dragDropTitle
        : rawStage2.dragDropTitle,
      dragDropInstruction: isLegacyInstruction
        ? fallbackWs.stage2.dragDropInstruction
        : rawStage2.dragDropInstruction,
      bucketA: isGenericBucket ? fallbackWs.stage2.bucketA : rawStage2.bucketA,
      bucketB: isGenericBucket ? fallbackWs.stage2.bucketB : rawStage2.bucketB,
      dragItems: normalizedDragItems,
      dragDropParagraph: rawParagraph,
      dragDropQuestions: normalizedDragDropQuestions,
      shortAnswerPrompt: rawPrompt || fallbackWs.stage2.shortAnswerPrompt,
      shortAnswerQuestions:
        rawSaQuestions.length > 0
          ? rawSaQuestions
          : fallbackWs.stage2.shortAnswerQuestions,
    },
  };
}

let dbHydrated = false;
export async function hydrateFromPostgresIfNeeded() {
  if (dbHydrated || !isPgConfigured()) return;
  dbHydrated = true;
  try {
    await ensureDatabaseTablesExist();
    const savedSession = await getLiveSessionStateFromDb('global_live_session');
    if (savedSession?.stateJson) {
      const parsed = JSON.parse(savedSession.stateJson);
      if (parsed && typeof parsed === 'object') {
        const rawCustomMap = (parsed.customWorksheetsByLesson || {}) as Record<string, any>;
        const sanitizedMap: Record<string, any> = {};
        for (const [k, v] of Object.entries(rawCustomMap)) {
          sanitizedMap[k] = sanitizeWorksheetRecord(v, k);
        }
        const rawSlidesMap = (parsed.lectureSlidesByLesson || {}) as Record<string, any>;
        const cleanedSlidesMap: Record<string, any> = {};
        for (const [k, deck] of Object.entries(rawSlidesMap)) {
          if (deck && !isLegacyDemoSlideDeck(deck)) {
            cleanedSlidesMap[k] = deck;
          }
        }
        liveClassroomSession = {
          ...liveClassroomSession,
          ...parsed,
          lectureSlidesByLesson: cleanedSlidesMap,
          customWorksheetsByLesson: sanitizedMap,
          verifiedLessonsMap: {
            ...defaultVerifiedLessonsMap,
            ...(parsed.verifiedLessonsMap || {}),
          },
        };
      }
    }
    const slideRows = await getAllLectureSlideDecksFromDb();
    if (slideRows.length > 0) {
      const slidesMap = {
        ...((liveClassroomSession.lectureSlidesByLesson || {}) as Record<string, any>),
      };
      slideRows.forEach((row) => {
        try {
          const parsedDeck = JSON.parse(row.slidesJson);
          if (parsedDeck && !isLegacyDemoSlideDeck(parsedDeck)) {
            slidesMap[row.lessonKey] = parsedDeck;
          }
        } catch {
          // ignore malformed slide row
        }
      });
      liveClassroomSession.lectureSlidesByLesson = slidesMap;
    }
    const wsRows = await getAllLessonWorksheetsFromDb();
    if (wsRows.length > 0) {
      const customMap = {
        ...((liveClassroomSession.customWorksheetsByLesson || {}) as Record<string, unknown>),
      };
      const verifiedMap = {
        ...defaultVerifiedLessonsMap,
        ...((liveClassroomSession.verifiedLessonsMap || {}) as Record<string, boolean>),
      };
      wsRows.forEach((row) => {
        try {
          customMap[row.lessonKey] = sanitizeWorksheetRecord(
            JSON.parse(row.payloadJson),
            row.lessonKey
          );
          verifiedMap[row.lessonKey] = row.verified === 1;
        } catch {
          // ignore malformed row
        }
      });
      liveClassroomSession.customWorksheetsByLesson = customMap;
      liveClassroomSession.verifiedLessonsMap = verifiedMap;
    }
  } catch (error) {
    console.warn('Initial PostgreSQL hydration skipped or deferred:', error);
  }
}

export function saveSlidesBackupToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const decks = liveClassroomSession.lectureSlidesByLesson || {};
    fs.writeFileSync(SLIDES_BACKUP_FILE, JSON.stringify(decks, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Server] Failed to save slides backup to disk:', e);
  }
}

export function loadSlidesBackupFromDisk() {
  try {
    if (fs.existsSync(SLIDES_BACKUP_FILE)) {
      const raw = fs.readFileSync(SLIDES_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const existing = (liveClassroomSession.lectureSlidesByLesson as Record<string, any>) || {};
        const cleaned: Record<string, any> = { ...existing };
        let purgedAny = false;
        for (const [k, deck] of Object.entries(parsed as Record<string, any>)) {
          if (deck && !isLegacyDemoSlideDeck(deck) && isRealRenderedPdfSlideDeck(deck)) {
            cleaned[k] = deck;
          } else {
            purgedAny = true;
          }
        }
        liveClassroomSession.lectureSlidesByLesson = cleaned;
        if (purgedAny) {
          saveSlidesBackupToDisk();
        }
      }
    }
  } catch (e) {
    console.warn('[Server] Failed to load slides backup from disk:', e);
  }
}

// Khởi tạo thư mục file storage và nạp lại slide từ đĩa
export function initFileStorageSystem() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_STORAGE_DIR)) {
      fs.mkdirSync(FILE_STORAGE_DIR, { recursive: true });
    } else {
      const savedFiles = fs.readdirSync(FILE_STORAGE_DIR);
      for (const f of savedFiles) {
        if (f.endsWith('.meta.json')) continue;
        const filePath = path.join(FILE_STORAGE_DIR, f);
        const metaPath = path.join(FILE_STORAGE_DIR, `${f}.meta.json`);
        try {
          const buffer = fs.readFileSync(filePath);
          let mimeType = f.endsWith('.webp')
            ? 'image/webp'
            : f.endsWith('.png')
            ? 'image/png'
            : f.endsWith('.pdf')
            ? 'application/pdf'
            : f.endsWith('.mp4')
            ? 'video/mp4'
            : 'image/jpeg';
          let lessonKey = 'general';
          if (fs.existsSync(metaPath)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
              if (meta.mimeType) mimeType = meta.mimeType;
              if (meta.lessonKey) lessonKey = meta.lessonKey;
            } catch {}
          }
          fileStorageMemoryMap.set(f, {
            buffer,
            mimeType,
            createdAt: new Date().toISOString(),
            lessonKey,
            sizeBytes: buffer.length,
          });
        } catch {}
      }
    }
    loadSlidesBackupFromDisk();
  } catch (initErr) {
    console.warn('[Server File Storage Init] Warning:', initErr);
  }
}

export function storeDataUrlInFileStorage(
  dataUrl: string,
  lessonKey: string,
  prefix = 'slide'
): { fileId: string; url: string; sizeKb: number } | null {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null;
  }
  const match = dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1] || 'image/webp';
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = mimeType.includes('webp')
    ? 'webp'
    : mimeType.includes('png')
    ? 'png'
    : mimeType.includes('pdf')
    ? 'pdf'
    : mimeType.includes('mp4')
    ? 'mp4'
    : 'jpg';
  const safeKey = String(lessonKey || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileId = `${prefix}-${safeKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  fileStorageMemoryMap.set(fileId, {
    buffer,
    mimeType,
    createdAt: new Date().toISOString(),
    lessonKey: safeKey,
    sizeBytes: buffer.length,
  });

  try {
    fs.writeFileSync(path.join(FILE_STORAGE_DIR, fileId), buffer);
    fs.writeFileSync(
      path.join(FILE_STORAGE_DIR, `${fileId}.meta.json`),
      JSON.stringify({ mimeType, lessonKey: safeKey, sizeBytes: buffer.length })
    );
  } catch {
    // ignore disk write warning
  }

  // Supabase Storage sync nếu có cấu hình
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (supaUrl && supaKey) {
    fetch(`${supaUrl.replace(/\/$/, '')}/storage/v1/object/slide-storage-1gb/${fileId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supaKey}`,
        apikey: supaKey,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: new Uint8Array(buffer),
    }).catch(() => {});
  }

  return {
    fileId,
    url: `/api/file-storage/slides/file/${fileId}`,
    sizeKb: Math.max(1, Math.round(buffer.length / 1024)),
  };
}

export function offloadSessionBase64ToFileStorage(sessionObj: Record<string, any>): Record<string, any> {
  if (!sessionObj || typeof sessionObj !== 'object') return sessionObj;
  const decks = sessionObj.lectureSlidesByLesson as Record<string, any> | undefined;
  if (!decks || typeof decks !== 'object') return sessionObj;

  const updatedDecks: Record<string, any> = { ...decks };
  for (const [lKey, deck] of Object.entries(updatedDecks)) {
    if (!deck || typeof deck !== 'object') continue;
    let nextDeck = { ...deck, storageBucket: 'file-storage-1gb' };

    if (typeof nextDeck.pdfDataUrl === 'string' && nextDeck.pdfDataUrl.startsWith('data:')) {
      const storedPdf = storeDataUrlInFileStorage(nextDeck.pdfDataUrl, lKey, 'pdf');
      if (storedPdf) {
        nextDeck.pdfDataUrl = storedPdf.url;
      }
    }

    if (Array.isArray(nextDeck.slides)) {
      let totalKb = 0;
      nextDeck.slides = nextDeck.slides.map((sl: any, idx: number) => {
        if (!sl || typeof sl !== 'object') return sl;
        if (typeof sl.imageUrl === 'string' && sl.imageUrl.startsWith('data:')) {
          const stored = storeDataUrlInFileStorage(sl.imageUrl, lKey, `slide-${idx + 1}`);
          if (stored) {
            totalKb += stored.sizeKb;
            return {
              ...sl,
              imageUrl: stored.url,
              storageFileId: stored.fileId,
              compressedSizeKb: stored.sizeKb,
            };
          }
        }
        totalKb += Number(sl.compressedSizeKb) || 45;
        return sl;
      });
      nextDeck.totalCompressedKb = totalKb;
      nextDeck.fileSize = `${totalKb} KB`;
    }
    updatedDecks[lKey] = nextDeck;
  }

  return {
    ...sessionObj,
    lectureSlidesByLesson: updatedDecks,
  };
}

export function getGenAIClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey =
    customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 0
      ? customApiKey.trim()
      : process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

