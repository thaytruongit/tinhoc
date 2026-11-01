import { eq, desc, and } from 'drizzle-orm';
import { db, createPool } from './index.ts';
import {
  users,
  lessonWorksheets,
  studentSubmissions,
  wordCloudEntries,
  liveClassroomStates,
  classes,
  students,
  curriculumData,
  studentProgress,
  lectureSlides,
} from './schema.ts';

export async function ensureDatabaseTablesExist() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT DEFAULT 'user@cloudplay.edu.vn',
        display_name TEXT DEFAULT 'Học sinh CloudPlay',
        student_code TEXT DEFAULT '61008',
        class_id TEXT DEFAULT '6A10',
        role TEXT DEFAULT 'student',
        xp INTEGER NOT NULL DEFAULT 0,
        streak_days INTEGER NOT NULL DEFAULT 1,
        stars INTEGER NOT NULL DEFAULT 0,
        group_number INTEGER NOT NULL DEFAULT 1,
        partner_name TEXT DEFAULT 'Nguyễn Bảo An',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lesson_worksheets (
        id SERIAL PRIMARY KEY,
        lesson_key TEXT NOT NULL UNIQUE,
        grade INTEGER NOT NULL,
        period INTEGER NOT NULL,
        worksheet_title TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 1,
        source_file_name TEXT NOT NULL DEFAULT 'SGK_KetNoiTriThuc.docx',
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS student_submissions (
        id SERIAL PRIMARY KEY,
        submission_id TEXT NOT NULL UNIQUE,
        student_uid TEXT NOT NULL REFERENCES users(uid),
        student_name TEXT NOT NULL,
        student_code TEXT NOT NULL,
        class_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        stage_id INTEGER NOT NULL,
        score REAL NOT NULL DEFAULT 0,
        max_score REAL NOT NULL DEFAULT 10,
        status TEXT NOT NULL DEFAULT 'submitted',
        answers_summary TEXT NOT NULL,
        teacher_feedback TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS word_cloud_entries (
        id SERIAL PRIMARY KEY,
        entry_id TEXT NOT NULL UNIQUE,
        author_uid TEXT NOT NULL REFERENCES users(uid),
        author_name TEXT NOT NULL,
        class_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        word TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS live_classroom_states (
        id SERIAL PRIMARY KEY,
        session_key TEXT NOT NULL UNIQUE,
        state_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        grade INTEGER NOT NULL,
        school_year TEXT NOT NULL DEFAULT '2024 - 2025',
        room_name TEXT NOT NULL DEFAULT 'Phòng Lab Cloud',
        student_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        dob TEXT DEFAULT '',
        station_number TEXT DEFAULT '01',
        name TEXT NOT NULL,
        class_id TEXT NOT NULL,
        grade INTEGER NOT NULL,
        password_default TEXT NOT NULL DEFAULT '12345',
        xp INTEGER NOT NULL DEFAULT 100,
        streak_days INTEGER NOT NULL DEFAULT 1,
        stars INTEGER NOT NULL DEFAULT 3,
        group_number INTEGER NOT NULL DEFAULT 1,
        partner_name TEXT DEFAULT 'Bạn cùng bàn Cloud',
        partner_id TEXT DEFAULT '61008',
        avg_score REAL NOT NULL DEFAULT 8.5,
        submission_status TEXT NOT NULL DEFAULT 'Chưa nộp',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS curriculum_data (
        id SERIAL PRIMARY KEY,
        lesson_key TEXT NOT NULL UNIQUE,
        grade INTEGER NOT NULL,
        period INTEGER NOT NULL,
        lesson_title TEXT NOT NULL,
        sgk_pages TEXT DEFAULT '',
        topic TEXT DEFAULT '',
        lesson_type TEXT NOT NULL DEFAULT 'theory',
        payload_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        student_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        lesson_key TEXT NOT NULL,
        stage_id INTEGER NOT NULL,
        score REAL NOT NULL DEFAULT 0,
        xp_earned INTEGER NOT NULL DEFAULT 0,
        stars_earned INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'in_progress',
        completed_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT student_progress_unique UNIQUE (student_id, lesson_key, stage_id)
      );

      CREATE TABLE IF NOT EXISTS lecture_slides (
        id SERIAL PRIMARY KEY,
        lesson_key TEXT NOT NULL UNIQUE,
        grade INTEGER NOT NULL,
        period INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL DEFAULT 'image',
        file_size TEXT NOT NULL DEFAULT '0 KB',
        storage_bucket TEXT NOT NULL DEFAULT 'slide-storage-1gb',
        total_compressed_kb INTEGER NOT NULL DEFAULT 0,
        slides_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Enable Supabase Realtime publishing for new tables if publication exists
    try {
      await client.query(`
        ALTER PUBLICATION supabase_realtime ADD TABLE classes, students, curriculum_data, student_progress, lecture_slides;
      `);
    } catch {
      // publication may already contain tables or require superuser, ignore warning
    }

    return true;
  } catch (error) {
    console.error('Failed to execute ensureDatabaseTablesExist:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertUserProfile(params: {
  uid: string;
  email?: string;
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
  const email = params.email || `${params.uid}@cloudplay.edu.vn`;
  const displayName = params.displayName || 'Người dùng CloudPlay';
  const studentCode = params.studentCode || '61008';
  const classId = params.classId || '6A10';
  const role = params.role || 'student';
  const xp = params.xp ?? 0;
  const streakDays = params.streakDays ?? 1;
  const stars = params.stars ?? 0;
  const groupNumber = params.groupNumber ?? 1;
  const partnerName = params.partnerName || 'Nguyễn Bảo An';

  try {
    const result = await db
      .insert(users)
      .values({
        uid: params.uid,
        email,
        displayName,
        studentCode,
        classId,
        role,
        xp,
        streakDays,
        stars,
        groupNumber,
        partnerName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
          classId,
          role,
          xp,
          streakDays,
          stars,
          groupNumber,
          partnerName,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation') && msg.includes('does not exist')) {
      try {
        await ensureDatabaseTablesExist();
        const retry = await db
          .insert(users)
          .values({
            uid: params.uid,
            email,
            displayName,
            studentCode,
            classId,
            role,
            xp,
            streakDays,
            stars,
            groupNumber,
            partnerName,
          })
          .onConflictDoUpdate({
            target: users.uid,
            set: {
              email,
              displayName,
              classId,
              role,
              xp,
              streakDays,
              stars,
              groupNumber,
              partnerName,
              updatedAt: new Date(),
            },
          })
          .returning();
        return retry[0];
      } catch (retryErr) {
        console.warn('upsertUserProfile fallback:', retryErr);
        return null;
      }
    }
    console.warn('upsertUserProfile database notice:', error.message || error);
    return null;
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
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation') && msg.includes('does not exist')) {
      try {
        await ensureDatabaseTablesExist();
        const retry = await db
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
        return retry[0];
      } catch (retryErr) {
        console.warn('upsertWorksheetSubmission fallback:', retryErr);
        return null;
      }
    }
    console.warn('upsertWorksheetSubmission database notice:', error.message || error);
    return null;
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
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation') && msg.includes('does not exist')) {
      try {
        await ensureDatabaseTablesExist();
        const retry = await db
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
        return retry[0];
      } catch (retryErr) {
        console.warn('insertWordCloudEntry fallback:', retryErr);
        return null;
      }
    }
    console.warn('insertWordCloudEntry database notice:', error.message || error);
    return null;
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
  } catch (error: any) {
    console.warn('getWordCloudEntriesByClass database notice:', error.message || error);
    return [];
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
  } catch (error: any) {
    const msg = String(error?.message || '');
    if (msg.includes('relation') && msg.includes('does not exist')) {
      try {
        await ensureDatabaseTablesExist();
        const retry = await db
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
        return retry[0];
      } catch (retryErr) {
        console.warn('upsertLessonWorksheetRecord fallback:', retryErr);
        return null;
      }
    }
    console.warn('upsertLessonWorksheetRecord database notice:', error.message || error);
    return null;
  }
}

export async function getAllLessonWorksheetsFromDb() {
  try {
    return await db.select().from(lessonWorksheets);
  } catch {
    return [];
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
    return result[0] || null;
  } catch (error: any) {
    console.warn('Database write error in saveLiveSessionStateToDb:', error.message || error);
    // If table missing, attempt auto-creation of tables and retry once
    const msg = String(error?.message || '');
    if (msg.includes('relation') && msg.includes('does not exist')) {
      try {
        console.log('Table missing detected, auto-creating database tables...');
        await ensureDatabaseTablesExist();
        const retryResult = await db
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
        return retryResult[0] || null;
      } catch (retryError: any) {
        console.warn('Retry saveLiveSessionStateToDb failed after table creation:', retryError.message);
        return null;
      }
    }
    return null;
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
  } catch {
    return null;
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
  } catch (error: any) {
    console.warn('Keep alive ping fallback notice:', error.message || error);
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

// -----------------------------------------------------------------------------
// Classes CRUD
// -----------------------------------------------------------------------------
export async function upsertClassRecord(cls: {
  id: string;
  name: string;
  grade: number;
  schoolYear?: string;
  roomName?: string;
  studentCount?: number;
}) {
  try {
    const res = await db
      .insert(classes)
      .values({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        schoolYear: cls.schoolYear || '2024 - 2025',
        roomName: cls.roomName || 'Phòng Lab Cloud',
        studentCount: cls.studentCount || 0,
      })
      .onConflictDoUpdate({
        target: classes.id,
        set: {
          name: cls.name,
          grade: cls.grade,
          schoolYear: cls.schoolYear || '2024 - 2025',
          roomName: cls.roomName || 'Phòng Lab Cloud',
          studentCount: cls.studentCount || 0,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0] || null;
  } catch (err: any) {
    console.warn('upsertClassRecord notice:', err.message || err);
    return null;
  }
}

export async function getAllClassesFromDb() {
  try {
    return await db.select().from(classes);
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Students CRUD
// -----------------------------------------------------------------------------
export async function upsertStudentRecord(st: {
  id: string;
  username?: string;
  dob?: string;
  stationNumber?: string;
  name?: string;
  fullName?: string;
  classId: string;
  grade?: number;
  passwordDefault?: string;
  xp?: number;
  streakDays?: number;
  stars?: number;
  groupNumber?: number;
  partnerName?: string;
  partnerId?: string;
  avgScore?: number;
  submissionStatus?: string;
}) {
  const username = st.username || st.id;
  const name = st.name || st.fullName || 'Học sinh CloudPlay';
  const grade = st.grade ?? 6;
  try {
    const res = await db
      .insert(students)
      .values({
        id: st.id,
        username,
        dob: st.dob || '',
        stationNumber: st.stationNumber || '01',
        name,
        classId: st.classId,
        grade,
        passwordDefault: st.passwordDefault || '12345',
        xp: st.xp ?? 100,
        streakDays: st.streakDays ?? 1,
        stars: st.stars ?? 3,
        groupNumber: st.groupNumber ?? 1,
        partnerName: st.partnerName || 'Bạn cùng bàn Cloud',
        partnerId: st.partnerId || '61008',
        avgScore: st.avgScore ?? 8.5,
        submissionStatus: st.submissionStatus || 'Chưa nộp',
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          username,
          dob: st.dob || '',
          stationNumber: st.stationNumber || '01',
          name,
          classId: st.classId,
          grade,
          xp: st.xp ?? 100,
          streakDays: st.streakDays ?? 1,
          stars: st.stars ?? 3,
          groupNumber: st.groupNumber ?? 1,
          partnerName: st.partnerName || 'Bạn cùng bàn Cloud',
          partnerId: st.partnerId || '61008',
          avgScore: st.avgScore ?? 8.5,
          submissionStatus: st.submissionStatus || 'Chưa nộp',
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0] || null;
  } catch (err: any) {
    console.warn('upsertStudentRecord notice:', err.message || err);
    return null;
  }
}

export async function getAllStudentsFromDb() {
  try {
    return await db.select().from(students);
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Curriculum Data CRUD
// -----------------------------------------------------------------------------
export async function upsertCurriculumRecord(curr: {
  id?: string;
  lessonKey?: string;
  grade: number;
  period: number;
  lessonTitle: string;
  sgkPages?: string;
  topic?: string;
  theme?: string;
  lessonType?: string;
  payloadJson?: string;
}) {
  const lessonKey = curr.lessonKey || curr.id || `k${curr.grade}_t${curr.period}`;
  const topic = curr.topic || curr.theme || '';
  const payloadJson = curr.payloadJson || JSON.stringify({ title: curr.lessonTitle, stages: [] });
  try {
    const res = await db
      .insert(curriculumData)
      .values({
        lessonKey,
        grade: curr.grade,
        period: curr.period,
        lessonTitle: curr.lessonTitle,
        sgkPages: curr.sgkPages || '',
        topic,
        lessonType: curr.lessonType || 'theory',
        payloadJson,
      })
      .onConflictDoUpdate({
        target: curriculumData.lessonKey,
        set: {
          lessonTitle: curr.lessonTitle,
          sgkPages: curr.sgkPages || '',
          topic,
          lessonType: curr.lessonType || 'theory',
          payloadJson,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0] || null;
  } catch (err: any) {
    console.warn('upsertCurriculumRecord notice:', err.message || err);
    return null;
  }
}

export async function getAllCurriculumFromDb() {
  try {
    return await db.select().from(curriculumData);
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Student Progress CRUD
// -----------------------------------------------------------------------------
export async function upsertStudentProgressRecord(prog: {
  studentId: string;
  classId: string;
  lessonKey: string;
  stageId: number;
  score?: number;
  xpEarned?: number;
  starsEarned?: number;
  status?: string;
}) {
  try {
    const res = await db
      .insert(studentProgress)
      .values({
        studentId: prog.studentId,
        classId: prog.classId,
        lessonKey: prog.lessonKey,
        stageId: prog.stageId,
        score: prog.score ?? 0,
        xpEarned: prog.xpEarned ?? 0,
        starsEarned: prog.starsEarned ?? 0,
        status: prog.status || 'completed',
      })
      .onConflictDoUpdate({
        target: [studentProgress.studentId, studentProgress.lessonKey, studentProgress.stageId],
        set: {
          score: prog.score ?? 0,
          xpEarned: prog.xpEarned ?? 0,
          starsEarned: prog.starsEarned ?? 0,
          status: prog.status || 'completed',
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0] || null;
  } catch (err: any) {
    console.warn('upsertStudentProgressRecord notice:', err.message || err);
    return null;
  }
}

export async function getStudentProgressFromDb(studentId: string) {
  try {
    return await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
  } catch {
    return [];
  }
}

export async function deleteStudentFromDb(studentId: string) {
  try {
    await db.delete(students).where(eq(students.id, studentId));
    return true;
  } catch (err) {
    console.warn('deleteStudentFromDb error:', err);
    return false;
  }
}

export async function deleteStudentsByClassFromDb(classId: string) {
  try {
    await db.delete(students).where(eq(students.classId, classId));
    return true;
  } catch (err) {
    console.warn('deleteStudentsByClassFromDb error:', err);
    return false;
  }
}

export async function deleteClassFromDb(classId: string) {
  try {
    await db.delete(classes).where(eq(classes.id, classId));
    return true;
  } catch (err) {
    console.warn('deleteClassFromDb error:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Lecture Slides CRUD (Dedicated table for smooth slide image read/write sync)
// -----------------------------------------------------------------------------
export async function upsertLectureSlideDeckToDb(deck: {
  lessonKey: string;
  grade: number;
  period: number;
  fileName: string;
  fileType: string;
  fileSize?: string;
  storageBucket?: string;
  totalCompressedKb?: number;
  slidesJson: string;
}) {
  try {
    const res = await db
      .insert(lectureSlides)
      .values({
        lessonKey: deck.lessonKey,
        grade: deck.grade,
        period: deck.period,
        fileName: deck.fileName,
        fileType: deck.fileType || 'image',
        fileSize: deck.fileSize || '0 KB',
        storageBucket: deck.storageBucket || 'slide-storage-1gb',
        totalCompressedKb: deck.totalCompressedKb || 0,
        slidesJson: deck.slidesJson,
      })
      .onConflictDoUpdate({
        target: lectureSlides.lessonKey,
        set: {
          fileName: deck.fileName,
          fileType: deck.fileType || 'image',
          fileSize: deck.fileSize || '0 KB',
          storageBucket: deck.storageBucket || 'slide-storage-1gb',
          totalCompressedKb: deck.totalCompressedKb || 0,
          slidesJson: deck.slidesJson,
          updatedAt: new Date(),
        },
      })
      .returning();
    return res[0] || null;
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('relation') && msg.includes('does not exist')) {
      try {
        await ensureDatabaseTablesExist();
        const retry = await db
          .insert(lectureSlides)
          .values({
            lessonKey: deck.lessonKey,
            grade: deck.grade,
            period: deck.period,
            fileName: deck.fileName,
            fileType: deck.fileType || 'image',
            fileSize: deck.fileSize || '0 KB',
            storageBucket: deck.storageBucket || 'slide-storage-1gb',
            totalCompressedKb: deck.totalCompressedKb || 0,
            slidesJson: deck.slidesJson,
          })
          .onConflictDoUpdate({
            target: lectureSlides.lessonKey,
            set: {
              fileName: deck.fileName,
              fileType: deck.fileType || 'image',
              fileSize: deck.fileSize || '0 KB',
              storageBucket: deck.storageBucket || 'slide-storage-1gb',
              totalCompressedKb: deck.totalCompressedKb || 0,
              slidesJson: deck.slidesJson,
              updatedAt: new Date(),
            },
          })
          .returning();
        return retry[0] || null;
      } catch (retryErr) {
        console.warn('upsertLectureSlideDeckToDb fallback:', retryErr);
        return null;
      }
    }
    console.warn('upsertLectureSlideDeckToDb notice:', err.message || err);
    return null;
  }
}

export async function getAllLectureSlideDecksFromDb() {
  try {
    return await db.select().from(lectureSlides);
  } catch {
    return [];
  }
}

export async function deleteLectureSlideDeckFromDb(lessonKey: string) {
  try {
    await db.delete(lectureSlides).where(eq(lectureSlides.lessonKey, lessonKey));
    return true;
  } catch (err) {
    console.warn('deleteLectureSlideDeckFromDb notice:', err);
    return false;
  }
}

export async function deleteAllLectureSlideDecksFromDb() {
  try {
    await db.delete(lectureSlides);
    return true;
  } catch (err) {
    console.warn('deleteAllLectureSlideDecksFromDb notice:', err);
    return false;
  }
}


