import { eq } from 'drizzle-orm';
import { supabase, SUPABASE_URL } from './supabase.ts';
import * as schema from '../db/schema.ts';
import { createPool, pool, db, cleanConnectionString } from '../db/index.ts';
import {
  ensureDatabaseTablesExist,
  getLiveSessionStateFromDb,
  saveLiveSessionStateToDb,
  upsertUserProfile,
  getAllLessonWorksheetsFromDb,
  upsertLessonWorksheetRecord,
  upsertWorksheetSubmission,
  insertWordCloudEntry,
  getWordCloudEntriesByClass,
  upsertClassRecord,
  getAllClassesFromDb,
  upsertStudentRecord,
  getAllStudentsFromDb,
  upsertCurriculumRecord,
  getAllCurriculumFromDb,
  upsertStudentProgressRecord,
  getStudentProgressFromDb,
} from '../db/repository.ts';

// Connection String Sanitization & Extraction
export function getDatabaseConnectionString(): string {
  return cleanConnectionString(
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    ''
  );
}

export { createPool, pool, db };

// -----------------------------------------------------------------------------
// 3. Database Health Check Function (healthCheckDb)
// -----------------------------------------------------------------------------
export interface HealthCheckResult {
  ok: boolean;
  timestamp: string;
  databaseUrlConfigured: boolean;
  database: {
    connected: boolean;
    latencyMs: number;
    error?: string;
  };
  supabaseClient: {
    initialized: boolean;
    url: string;
  };
  tablesReady: boolean;
  logs: string[];
}

/**
 * Health check function querying `SELECT NOW();` to verify Supabase PostgreSQL connection
 */
export async function healthCheckDb(): Promise<HealthCheckResult> {
  const logs: string[] = [];
  const dbUrl = getDatabaseConnectionString();
  const isConfigured = dbUrl.length > 0 && !dbUrl.includes('[YOUR-PASSWORD]');

  logs.push(`[healthCheckDb] Checking Supabase database connection...`);
  logs.push(`[healthCheckDb] Target Supabase URL: ${SUPABASE_URL}`);

  let dbConnected = false;
  let dbLatencyMs = 0;
  let dbError: string | undefined;
  let tablesExist = false;

  try {
    const pingStart = Date.now();
    // Execute SELECT NOW(); query as requested
    const res = await pool.query('SELECT NOW() as current_time, 1 as check_val;');
    dbLatencyMs = Date.now() - pingStart;

    if (res.rows && res.rows.length > 0) {
      dbConnected = true;
      logs.push(`[healthCheckDb] Query SELECT NOW(); succeeded in ${dbLatencyMs}ms (DB Time: ${res.rows[0].current_time})`);
    }
  } catch (err: any) {
    dbError = err.message || 'SELECT NOW(); query failed';
    logs.push(`[healthCheckDb Error] SELECT NOW(); query failed: ${dbError}`);
  }

  // Verify and auto-ensure tables schema if connected
  if (dbConnected) {
    try {
      await ensureDatabaseTablesExist();
      tablesExist = true;
      logs.push(`[healthCheckDb] Verified 9 core tables exist on Supabase (users, lesson_worksheets, student_submissions, word_cloud_entries, live_classroom_states, classes, students, curriculum_data, student_progress)`);
    } catch (schemaErr: any) {
      logs.push(`[healthCheckDb Warning] Schema check warning: ${schemaErr.message}`);
    }
  }

  const isOk = dbConnected && isConfigured;

  return {
    ok: isOk,
    timestamp: new Date().toISOString(),
    databaseUrlConfigured: isConfigured,
    database: {
      connected: dbConnected,
      latencyMs: dbLatencyMs,
      error: dbError,
    },
    supabaseClient: {
      initialized: Boolean(supabase),
      url: SUPABASE_URL,
    },
    tablesReady: tablesExist,
    logs,
  };
}

// Backward compatibility alias
export const healthCheck = healthCheckDb;

// -----------------------------------------------------------------------------
// 4. Data Services & CRUD Utility Functions
// -----------------------------------------------------------------------------

/** Auto-initialize 5 core database tables if missing */
export async function ensureSchema(): Promise<void> {
  await ensureDatabaseTablesExist();
}

/** User Profile CRUD */
export async function upsertUser(data: {
  uid: string;
  email: string;
  displayName?: string;
  studentCode?: string;
  classId?: string;
  role?: string;
  xp?: number;
  streakDays?: number;
  stars?: number;
  groupNumber?: number;
  partnerName?: string;
}) {
  return upsertUserProfile({
    uid: data.uid,
    email: data.email,
    displayName: data.displayName || 'Học sinh CloudPlay',
    studentCode: data.studentCode || '61008',
    classId: data.classId || '6A10',
    role: data.role || 'student',
    xp: data.xp ?? 0,
    streakDays: data.streakDays ?? 1,
    stars: data.stars ?? 0,
    groupNumber: data.groupNumber ?? 1,
    partnerName: data.partnerName || 'Nguyễn Bảo An',
  });
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(schema.users).where(eq(schema.users.uid, uid)).limit(1);
    return rows[0] || null;
  } catch (err) {
    console.error('Error fetching user by uid:', err);
    return null;
  }
}

/** Lesson Worksheet CRUD */
export async function upsertWorksheet(data: {
  lessonKey: string;
  grade: number;
  period: number;
  worksheetTitle: string;
  payloadJson: string;
  verified?: number;
  sourceFileName?: string;
}) {
  return upsertLessonWorksheetRecord(data);
}

export async function getAllWorksheets() {
  return getAllLessonWorksheetsFromDb();
}

/** Student Submission CRUD */
export async function submitWorksheet(data: {
  submissionId: string;
  studentUid: string;
  studentName: string;
  studentCode: string;
  classId: string;
  lessonId: string;
  stageId: number;
  score: number;
  maxScore?: number;
  status?: string;
  answersSummary: string;
  teacherFeedback?: string;
}) {
  return upsertWorksheetSubmission({
    submissionId: data.submissionId,
    studentUid: data.studentUid,
    studentName: data.studentName,
    studentCode: data.studentCode,
    classId: data.classId,
    lessonId: data.lessonId,
    stageId: data.stageId,
    score: data.score,
    status: data.status || 'submitted',
    answersSummary: data.answersSummary,
  });
}

export async function getSubmissionsForClass(classId: string) {
  try {
    return await db.select().from(schema.studentSubmissions).where(eq(schema.studentSubmissions.classId, classId));
  } catch (err) {
    console.error('Error fetching submissions for class:', err);
    return [];
  }
}

/** Word Cloud CRUD */
export async function addWordCloudEntry(data: {
  entryId: string;
  authorUid: string;
  authorName: string;
  classId: string;
  lessonId: string;
  word: string;
}) {
  return insertWordCloudEntry(data);
}

export async function getWordCloudByClass(classId: string) {
  return getWordCloudEntriesByClass(classId);
}

/** Live Classroom Session CRUD */
export async function saveLiveState(sessionKey: string, stateJson: string) {
  return saveLiveSessionStateToDb(sessionKey, stateJson);
}

export async function getLiveState(sessionKey: string) {
  return getLiveSessionStateFromDb(sessionKey);
}

/** Classes, Students, Curriculum, Student Progress CRUD */
export {
  upsertClassRecord,
  getAllClassesFromDb,
  upsertStudentRecord,
  getAllStudentsFromDb,
  upsertCurriculumRecord,
  getAllCurriculumFromDb,
  upsertStudentProgressRecord,
  getStudentProgressFromDb,
};

export { supabase, schema };
