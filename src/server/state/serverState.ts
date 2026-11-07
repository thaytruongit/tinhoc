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
  getAllLessonWorksheetsFromDb,
} from '../../db/repository.ts';

export const DATA_DIR = path.resolve(process.cwd(), 'data');

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
  wheelCall: null,
  taughtPeriodsByClass: { '6A10': [1], '7A10': [1] },
  learnedPeriodsByStudent: { '61008': ['k6-tiet-1'], '71001': ['k7-tiet-1'] },
  customWorksheetsByLesson: {},
  verifiedLessonsMap: defaultVerifiedLessonsMap,
  studentDraftsByKey: {},
  taggedSubmissions: [],
  updatedAt: '2025-01-01T00:00:00.000Z',
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
        liveClassroomSession = {
          ...liveClassroomSession,
          ...parsed,
          customWorksheetsByLesson: sanitizedMap,
          verifiedLessonsMap: {
            ...defaultVerifiedLessonsMap,
            ...(parsed.verifiedLessonsMap || {}),
          },
        };
      }
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
