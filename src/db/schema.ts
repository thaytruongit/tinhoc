import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

// 1. Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').default('user@cloudplay.edu.vn'),
  displayName: text('display_name').default('Học sinh CloudPlay'),
  studentCode: text('student_code').default('61008'),
  classId: text('class_id').default('6A10'),
  role: text('role').default('student'),
  xp: integer('xp').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(1),
  stars: integer('stars').notNull().default(0),
  groupNumber: integer('group_number').notNull().default(1),
  partnerName: text('partner_name').default('Nguyễn Bảo An'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Lesson Worksheets table (29 periods per grade 6, 7, 8, 9)
export const lessonWorksheets = pgTable('lesson_worksheets', {
  id: serial('id').primaryKey(),
  lessonKey: text('lesson_key').notNull().unique(),
  grade: integer('grade').notNull(),
  period: integer('period').notNull(),
  worksheetTitle: text('worksheet_title').notNull(),
  payloadJson: text('payload_json').notNull(),
  verified: integer('verified').notNull().default(1),
  sourceFileName: text('source_file_name').notNull().default('SGK_KetNoiTriThuc.docx'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Student Worksheet Submissions table
export const studentSubmissions = pgTable('student_submissions', {
  id: serial('id').primaryKey(),
  submissionId: text('submission_id').notNull().unique(),
  studentUid: text('student_uid')
    .references(() => users.uid)
    .notNull(),
  studentName: text('student_name').notNull(),
  studentCode: text('student_code').notNull(),
  classId: text('class_id').notNull(),
  lessonId: text('lesson_id').notNull(),
  stageId: integer('stage_id').notNull(),
  score: real('score').notNull().default(0),
  maxScore: real('max_score').notNull().default(10),
  status: text('status').notNull().default('submitted'),
  answersSummary: text('answers_summary').notNull(),
  teacherFeedback: text('teacher_feedback').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Word Cloud Entries table (Stage 1 Warm-up interactive keywords)
export const wordCloudEntries = pgTable('word_cloud_entries', {
  id: serial('id').primaryKey(),
  entryId: text('entry_id').notNull().unique(),
  authorUid: text('author_uid')
    .references(() => users.uid)
    .notNull(),
  authorName: text('author_name').notNull(),
  classId: text('class_id').notNull(),
  lessonId: text('lesson_id').notNull(),
  word: text('word').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Live Classroom Session State table
export const liveClassroomStates = pgTable('live_classroom_states', {
  id: serial('id').primaryKey(),
  sessionKey: text('session_key').notNull().unique(),
  stateJson: text('state_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Classes table
export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  grade: integer('grade').notNull(),
  schoolYear: text('school_year').notNull().default('2024 - 2025'),
  roomName: text('room_name').notNull().default('Phòng Lab Cloud'),
  studentCount: integer('student_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Students table
export const students = pgTable('students', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  dob: text('dob').default(''),
  stationNumber: text('station_number').default('01'),
  name: text('name').notNull(),
  classId: text('class_id').notNull(),
  grade: integer('grade').notNull(),
  passwordDefault: text('password_default').notNull().default('12345'),
  xp: integer('xp').notNull().default(100),
  streakDays: integer('streak_days').notNull().default(1),
  stars: integer('stars').notNull().default(3),
  groupNumber: integer('group_number').notNull().default(1),
  partnerName: text('partner_name').default('Bạn cùng bàn Cloud'),
  partnerId: text('partner_id').default('61008'),
  avgScore: real('avg_score').notNull().default(8.5),
  submissionStatus: text('submission_status').notNull().default('Chưa nộp'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Curriculum Data table
export const curriculumData = pgTable('curriculum_data', {
  id: serial('id').primaryKey(),
  lessonKey: text('lesson_key').notNull().unique(),
  grade: integer('grade').notNull(),
  period: integer('period').notNull(),
  lessonTitle: text('lesson_title').notNull(),
  sgkPages: text('sgk_pages').default(''),
  topic: text('topic').default(''),
  lessonType: text('lesson_type').notNull().default('theory'),
  payloadJson: text('payload_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 9. Student Progress table
export const studentProgress = pgTable('student_progress', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull(),
  classId: text('class_id').notNull(),
  lessonKey: text('lesson_key').notNull(),
  stageId: integer('stage_id').notNull(),
  score: real('score').notNull().default(0),
  xpEarned: integer('xp_earned').notNull().default(0),
  starsEarned: integer('stars_earned').notNull().default(0),
  status: text('status').notNull().default('in_progress'),
  completedAt: timestamp('completed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(studentSubmissions),
  wordCloudEntries: many(wordCloudEntries),
}));

export const studentSubmissionsRelations = relations(studentSubmissions, ({ one }) => ({
  student: one(users, {
    fields: [studentSubmissions.studentUid],
    references: [users.uid],
  }),
}));

export const wordCloudEntriesRelations = relations(wordCloudEntries, ({ one }) => ({
  author: one(users, {
    fields: [wordCloudEntries.authorUid],
    references: [users.uid],
  }),
}));
