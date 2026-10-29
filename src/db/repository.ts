import { eq, desc } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  lessonWorksheets,
  studentSubmissions,
  wordCloudEntries,
  liveClassroomStates,
} from './schema.ts';

export async function upsertUserProfile(params: {
  uid: string;
  email: string;
  displayName: string;
  studentCode: string;
  classId: string;
  role: string;
  xp: number;
  streakDays: number;
  stars: number;
  groupNumber: number;
  partnerName: string;
}) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: params.email,
        displayName: params.displayName,
        studentCode: params.studentCode,
        classId: params.classId,
        role: params.role,
        xp: params.xp,
        streakDays: params.streakDays,
        stars: params.stars,
        groupNumber: params.groupNumber,
        partnerName: params.partnerName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: params.email,
          displayName: params.displayName,
          classId: params.classId,
          xp: params.xp,
          streakDays: params.streakDays,
          stars: params.stars,
          groupNumber: params.groupNumber,
          partnerName: params.partnerName,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertUserProfile:', error);
    throw new Error('Failed to save user profile to database.', { cause: error });
  }
}

export async function upsertWorksheetSubmission(params: {
  submissionId: string;
  studentUid: string;
  studentName: string;
  studentCode: string;
  classId: string;
  lessonId: string;
  stageId: number;
  score: number;
  status: string;
  answersSummary: string;
}) {
  try {
    const result = await db
      .insert(studentSubmissions)
      .values({
        submissionId: params.submissionId,
        studentUid: params.studentUid,
        studentName: params.studentName,
        studentCode: params.studentCode,
        classId: params.classId,
        lessonId: params.lessonId,
        stageId: params.stageId,
        score: params.score,
        maxScore: 10,
        status: params.status,
        answersSummary: params.answersSummary,
      })
      .onConflictDoUpdate({
        target: studentSubmissions.submissionId,
        set: {
          score: params.score,
          status: params.status,
          answersSummary: params.answersSummary,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertWorksheetSubmission:', error);
    throw new Error('Failed to save worksheet submission to database.', { cause: error });
  }
}

export async function insertWordCloudEntry(params: {
  entryId: string;
  authorUid: string;
  authorName: string;
  classId: string;
  lessonId: string;
  word: string;
}) {
  try {
    const result = await db
      .insert(wordCloudEntries)
      .values({
        entryId: params.entryId,
        authorUid: params.authorUid,
        authorName: params.authorName,
        classId: params.classId,
        lessonId: params.lessonId,
        word: params.word,
      })
      .onConflictDoNothing()
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in insertWordCloudEntry:', error);
    throw new Error('Failed to insert word cloud entry to database.', { cause: error });
  }
}

export async function getWordCloudEntriesByClass(classId: string) {
  try {
    return await db
      .select()
      .from(wordCloudEntries)
      .where(eq(wordCloudEntries.classId, classId))
      .orderBy(desc(wordCloudEntries.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database query failed in getWordCloudEntriesByClass:', error);
    throw new Error('Failed to load word cloud entries from database.', { cause: error });
  }
}

export async function upsertLessonWorksheetRecord(params: {
  lessonKey: string;
  grade: number;
  period: number;
  worksheetTitle: string;
  payloadJson: string;
  verified?: number;
  sourceFileName?: string;
}) {
  try {
    const result = await db
      .insert(lessonWorksheets)
      .values({
        lessonKey: params.lessonKey,
        grade: params.grade,
        period: params.period,
        worksheetTitle: params.worksheetTitle,
        payloadJson: params.payloadJson,
        verified: params.verified ?? 1,
        sourceFileName: params.sourceFileName || 'SGK_KetNoiTriThuc.docx',
      })
      .onConflictDoUpdate({
        target: lessonWorksheets.lessonKey,
        set: {
          worksheetTitle: params.worksheetTitle,
          payloadJson: params.payloadJson,
          verified: params.verified ?? 1,
          sourceFileName: params.sourceFileName || 'SGK_KetNoiTriThuc.docx',
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertLessonWorksheetRecord:', error);
    throw new Error('Failed to save lesson worksheet to database.', { cause: error });
  }
}

export async function getAllLessonWorksheetsFromDb() {
  try {
    return await db.select().from(lessonWorksheets);
  } catch (error) {
    console.error('Database query failed in getAllLessonWorksheetsFromDb:', error);
    throw new Error('Failed to fetch lesson worksheets from database.', { cause: error });
  }
}

export async function saveLiveSessionStateToDb(sessionKey: string, stateJson: string) {
  try {
    const result = await db
      .insert(liveClassroomStates)
      .values({
        sessionKey,
        stateJson,
      })
      .onConflictDoUpdate({
        target: liveClassroomStates.sessionKey,
        set: {
          stateJson,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in saveLiveSessionStateToDb:', error);
    throw new Error('Failed to save live classroom session to database.', { cause: error });
  }
}

export async function getLiveSessionStateFromDb(sessionKey: string) {
  try {
    const rows = await db
      .select()
      .from(liveClassroomStates)
      .where(eq(liveClassroomStates.sessionKey, sessionKey))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getLiveSessionStateFromDb:', error);
    throw new Error('Failed to fetch live classroom session from database.', { cause: error });
  }
}

export interface KeepAliveHeartbeatPayload {
  status: 'AWAKE';
  databaseEngine: string;
  scheduleCron: string;
  intervalHours: number;
  lastPingAt: string;
  nextPingAt: string;
  pingCount: number;
  lastSource: string;
}

const KEEP_ALIVE_SESSION_KEY = 'supabase_keepalive_heartbeat';
const KEEP_ALIVE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function pingDatabaseKeepAlive(
  source = 'scheduled-cron'
): Promise<KeepAliveHeartbeatPayload> {
  const now = new Date();
  const nextPing = new Date(now.getTime() + KEEP_ALIVE_INTERVAL_MS);

  let previousCount = 0;
  try {
    const existing = await db
      .select()
      .from(liveClassroomStates)
      .where(eq(liveClassroomStates.sessionKey, KEEP_ALIVE_SESSION_KEY))
      .limit(1);

    if (existing[0]?.stateJson) {
      const parsed = JSON.parse(existing[0].stateJson);
      previousCount = Number(parsed?.pingCount) || 0;
    }
  } catch {
    // ignore parse error on first ping
  }

  const payload: KeepAliveHeartbeatPayload = {
    status: 'AWAKE',
    databaseEngine: 'Supabase / Cloud SQL PostgreSQL (asia-southeast1)',
    scheduleCron: '0 */6 * * *',
    intervalHours: 6,
    lastPingAt: now.toISOString(),
    nextPingAt: nextPing.toISOString(),
    pingCount: previousCount + 1,
    lastSource: source,
  };

  try {
    await db
      .insert(liveClassroomStates)
      .values({
        sessionKey: KEEP_ALIVE_SESSION_KEY,
        stateJson: JSON.stringify(payload),
      })
      .onConflictDoUpdate({
        target: liveClassroomStates.sessionKey,
        set: {
          stateJson: JSON.stringify(payload),
          updatedAt: now,
        },
      });
  } catch (error) {
    console.error('Database query failed in pingDatabaseKeepAlive:', error);
    throw new Error('Failed to execute keep-alive heartbeat on database.', { cause: error });
  }

  return payload;
}

export async function getKeepAliveHeartbeatStatus(): Promise<KeepAliveHeartbeatPayload> {
  const now = new Date();
  const defaultPayload: KeepAliveHeartbeatPayload = {
    status: 'AWAKE',
    databaseEngine: 'Supabase / Cloud SQL PostgreSQL (asia-southeast1)',
    scheduleCron: '0 */6 * * *',
    intervalHours: 6,
    lastPingAt: now.toISOString(),
    nextPingAt: new Date(now.getTime() + KEEP_ALIVE_INTERVAL_MS).toISOString(),
    pingCount: 1,
    lastSource: 'auto-scheduler',
  };

  try {
    const existing = await db
      .select()
      .from(liveClassroomStates)
      .where(eq(liveClassroomStates.sessionKey, KEEP_ALIVE_SESSION_KEY))
      .limit(1);

    if (existing[0]?.stateJson) {
      const parsed = JSON.parse(existing[0].stateJson);
      return {
        ...defaultPayload,
        ...parsed,
      };
    }
    return await pingDatabaseKeepAlive('initial-status-check');
  } catch {
    return defaultPayload;
  }
}

