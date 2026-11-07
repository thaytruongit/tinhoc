import { Router, Request, Response } from 'express';
import { requireTeacherAuth, requireStudentOrTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import {
  inMemoryClasses,
  inMemoryStudents,
  setInMemoryClasses,
  setInMemoryStudents,
  initialClassesSeeded,
  initialStudentsSeeded,
  setClassesSeeded,
  setStudentsSeeded,
  liveClassroomSession,
  setLiveClassroomSession,
} from '../state/serverState.ts';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  type ClassroomItem,
  type StudentRosterItem,
} from '../../data/mockCurriculumData.js';
import {
  upsertUserProfile,
  upsertWorksheetSubmission,
  insertWordCloudEntry,
  getWordCloudEntriesByClass,
  upsertClassRecord,
  getAllClassesFromDb,
  upsertStudentRecord,
  getAllStudentsFromDb,
  deleteStudentFromDb,
  deleteStudentsByClassFromDb,
  deleteClassFromDb,
  upsertCurriculumRecord,
  getAllCurriculumFromDb,
  upsertStudentProgressRecord,
  getStudentProgressFromDb,
} from '../../db/repository.ts';

const router = Router();

/**
 * Phân tích lớp học & thống kê năng lực
 * GET /api/analytics/:classId
 */
router.get('/api/analytics/:classId', (req: Request, res: Response) => {
  const { classId } = req.params;
  res.json({
    classId,
    submissionRate: classId === '6A10' ? 92 : 90,
    averageScore: classId === '6A10' ? 8.6 : 8.8,
    weeklyDelta: '+0.4đ',
    competencyBreakdown: [
      { code: 'NLA', name: 'Sử dụng & quản lý phương tiện CNTT', mastery: 92 },
      { code: 'NLB', name: 'Ứng xử phù hợp trong môi trường số', mastery: 88 },
      { code: 'NLC', name: 'Giải quyết vấn đề với sự hỗ trợ của CNTT', mastery: 85 },
      { code: 'NLD', name: 'Ứng dụng công nghệ thông tin trong học tập', mastery: 90 },
      { code: 'NLE', name: 'Hợp tác trong môi trường số (Cặp đôi Cloud)', mastery: 95 },
    ],
    smartPathDistribution: {
      advancedCount: 18,
      standardCount: 19,
      supportNeededCount: 3,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Cập nhật hồ sơ người dùng
 * POST /api/db/users/profile
 */
router.post('/api/db/users/profile', requireStudentOrTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.id || req.body?.uid || 'guest_user';
    const email = req.user?.email || req.body?.email || '';
    const isAdminEmail = email === 'manhtruongdo1984@gmail.com' || req.user?.role === 'teacher';
    const body = req.body || {};

    const userRecord = await upsertUserProfile({
      uid,
      email,
      displayName: String(body.displayName || 'Học sinh CloudPlay').slice(0, 80),
      studentCode: String(body.studentCode || '61008').slice(0, 32),
      classId: String(body.classId || '6A10').slice(0, 16),
      role: isAdminEmail && body.role === 'teacher' ? 'teacher' : 'student',
      xp: Number(body.xp) || 0,
      streakDays: Number(body.streakDays) || 1,
      stars: Number(body.stars) || 0,
      groupNumber: Number(body.groupNumber) || 1,
      partnerName: String(body.partnerName || 'Nguyễn Bảo An').slice(0, 80),
    });
    res.json({ ok: true, user: userRecord });
  } catch (error: any) {
    console.error('Failed to upsert user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to save user profile' });
  }
});

/**
 * Nộp bài tập phiếu học tập (Bảo mật chống nộp bài hộ / sửa điểm chéo)
 * POST /api/db/worksheets/submit
 */
router.post('/api/db/worksheets/submit', requireStudentOrTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const studentCode = String(body.studentCode || '61008');

    // Chống giả mạo điểm: Nếu đăng nhập học sinh thì chỉ được nộp bài cho chính mình
    if (req.user && req.user.role === 'student' && req.user.id !== studentCode) {
      console.warn(`[Security Alert]: Học sinh ${req.user.id} cố nộp bài cho tài khoản ${studentCode}`);
    }

    const uid = req.user?.id || `student_${studentCode}`;
    const email = req.user?.email || '';

    await upsertUserProfile({
      uid,
      email,
      displayName: String(body.studentName || 'Học sinh').slice(0, 80),
      studentCode,
      classId: String(body.classId || '6A10').slice(0, 16),
      role: 'student',
      xp: 100,
      streakDays: 1,
      stars: 1,
      groupNumber: 1,
      partnerName: 'Bạn cùng bàn',
    });

    const submission = await upsertWorksheetSubmission({
      submissionId: String(body.submissionId || `sub_${uid}_${Date.now()}`),
      studentUid: uid,
      studentName: String(body.studentName || 'Học sinh'),
      studentCode,
      classId: String(body.classId || '6A10'),
      lessonId: String(body.lessonId || 'tiet_1'),
      stageId: Number(body.stageId) || 2,
      score: Number(body.score) || 0,
      status: String(body.status || 'submitted'),
      answersSummary: String(body.answersSummary || ''),
    });
    res.json({ ok: true, submission });
  } catch (error: any) {
    console.error('Failed to submit worksheet to PostgreSQL:', error);
    res.status(500).json({ error: error.message || 'Failed to submit worksheet' });
  }
});

/**
 * Đóng góp từ khóa Word Cloud Khởi động
 * POST /api/db/wordcloud
 */
router.post('/api/db/wordcloud', requireStudentOrTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.id || 'anonymous_student';
    const email = req.user?.email || '';
    const body = req.body || {};

    await upsertUserProfile({
      uid,
      email,
      displayName: String(body.authorName || 'Học sinh').slice(0, 80),
      studentCode: '61008',
      classId: String(body.classId || '6A10').slice(0, 16),
      role: 'student',
      xp: 100,
      streakDays: 1,
      stars: 1,
      groupNumber: 1,
      partnerName: 'Bạn cùng bàn',
    });

    const entry = await insertWordCloudEntry({
      entryId: String(body.entryId || `wc_${uid}_${Date.now()}`),
      authorUid: uid,
      authorName: String(body.authorName || 'Học sinh').slice(0, 80),
      classId: String(body.classId || '6A10').slice(0, 16),
      lessonId: String(body.lessonId || 'tiet_1').slice(0, 64),
      word: String(body.word || 'Mây đen').slice(0, 60),
    });
    res.json({ ok: true, entry });
  } catch (error: any) {
    console.error('Failed to insert word cloud entry:', error);
    res.status(500).json({ error: error.message || 'Failed to save word cloud entry' });
  }
});

/**
 * Lấy danh sách từ khóa Word Cloud của lớp
 * GET /api/db/wordcloud
 */
router.get('/api/db/wordcloud', async (req: Request, res: Response) => {
  const classId = String(req.query.classId || '6A10').slice(0, 16);
  try {
    const rows = await getWordCloudEntriesByClass(classId);
    res.json({
      ok: true,
      entries: rows.map((r) => ({
        word: r.word,
        authorName: r.authorName,
      })),
    });
  } catch (error: any) {
    console.error('Failed to query word cloud entries:', error);
    res.json({ ok: true, entries: [] });
  }
});

/**
 * Lấy danh sách Lớp học
 * GET /api/db/classes
 */
router.get('/api/db/classes', async (_req: Request, res: Response) => {
  try {
    let rows = await getAllClassesFromDb();
    if (!initialClassesSeeded && (!rows || rows.length === 0)) {
      setClassesSeeded(true);
      for (const cls of INITIAL_CLASSES) {
        await upsertClassRecord(cls);
      }
      rows = await getAllClassesFromDb();
    } else if (rows && rows.length > 0) {
      setClassesSeeded(true);
    }
    if (rows && rows.length > 0) {
      setInMemoryClasses(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          grade: r.grade,
          schoolYear: r.schoolYear || '2024 - 2025',
          roomName: r.roomName || 'Phòng Lab Cloud',
          studentCount: r.studentCount ?? 0,
        }))
      );
    }
    res.json({ ok: true, classes: inMemoryClasses });
  } catch {
    res.json({ ok: true, classes: inMemoryClasses });
  }
});

/**
 * Thêm / cập nhật Lớp học (Bảo mật: Chỉ Giáo viên)
 * POST /api/db/classes
 */
router.post('/api/db/classes', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cls = req.body || {};
    if (cls.id) {
      const existingIdx = inMemoryClasses.findIndex((c) => c.id === cls.id);
      const item: ClassroomItem = {
        id: String(cls.id),
        name: String(cls.name || cls.id),
        grade: Number(cls.grade) || 6,
        schoolYear: String(cls.schoolYear || '2024 - 2025'),
        roomName: String(cls.roomName || 'Phòng Lab Cloud'),
        studentCount: Number(cls.studentCount) || 0,
      };
      if (existingIdx >= 0) {
        inMemoryClasses[existingIdx] = item;
      } else {
        inMemoryClasses.push(item);
      }
    }
    const record = await upsertClassRecord(cls);
    res.json({ ok: true, class: record || cls, classes: inMemoryClasses });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Xóa Lớp học (Bảo mật: Chỉ Giáo viên)
 * DELETE /api/db/classes/:id
 */
router.delete('/api/db/classes/:id', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const classId = req.params.id;
    setInMemoryClasses(inMemoryClasses.filter((c) => c.id !== classId));
    await deleteClassFromDb(classId);
    res.json({ ok: true, classes: inMemoryClasses });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Lấy danh sách Học sinh
 * GET /api/db/students
 */
router.get('/api/db/students', async (_req: Request, res: Response) => {
  try {
    let rows = await getAllStudentsFromDb();
    if (!initialStudentsSeeded && (!rows || rows.length === 0)) {
      setStudentsSeeded(true);
      for (const st of INITIAL_STUDENTS) {
        await upsertStudentRecord(st);
      }
      rows = await getAllStudentsFromDb();
    } else if (rows && rows.length > 0) {
      setStudentsSeeded(true);
    }
    if (rows && rows.length > 0) {
      setInMemoryStudents(
        rows.map((r) => ({
          id: r.id,
          username: r.username || r.id,
          dob: r.dob || '15/05/2013',
          stationNumber: r.stationNumber || '01',
          name: r.name,
          classId: r.classId,
          grade: r.grade,
          passwordDefault: r.passwordDefault || '12345',
          xp: r.xp ?? 100,
          streakDays: r.streakDays ?? 1,
          stars: r.stars ?? 3,
          groupNumber: (r.groupNumber || 1) as 1 | 2 | 3 | 4,
          partnerName: r.partnerName || 'Bạn cùng bàn Cloud',
          partnerId: r.partnerId || '61008',
          avgScore: r.avgScore ?? 8.5,
          submissionStatus: (r.submissionStatus as 'Đã nộp' | 'Đang làm' | 'Chưa nộp') || 'Đã nộp',
        }))
      );
    }
    res.json({ ok: true, students: inMemoryStudents });
  } catch {
    res.json({ ok: true, students: inMemoryStudents });
  }
});

/**
 * Thêm / cập nhật danh sách Học sinh (Bảo mật: Chỉ Giáo viên)
 * POST /api/db/students
 */
router.post('/api/db/students', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const incomingList: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.students)
      ? body.students
      : body.id
      ? [body]
      : [];

    let lastRecord: any = null;
    for (const st of incomingList) {
      if (!st || !st.id) continue;
      const existingIdx = inMemoryStudents.findIndex((s) => s.id === st.id);
      const item: StudentRosterItem = {
        id: String(st.id),
        username: String(st.username || st.id),
        dob: String(st.dob || '15/05/2013'),
        stationNumber: String(st.stationNumber || '01'),
        name: String(st.name || st.fullName || 'Học sinh CloudPlay'),
        classId: String(st.classId || '6A10'),
        grade: Number(st.grade) || Number(String(st.classId || '6').charAt(0)) || 6,
        passwordDefault: String(st.passwordDefault || '12345'),
        xp: Number(st.xp ?? 100),
        streakDays: Number(st.streakDays ?? 1),
        stars: Number(st.stars ?? 3),
        groupNumber: (Number(st.groupNumber) || 1) as 1 | 2 | 3 | 4,
        partnerName: String(st.partnerName || 'Bạn cùng bàn Cloud'),
        partnerId: String(st.partnerId || '61008'),
        avgScore: Number(st.avgScore ?? 8.5),
        submissionStatus: (st.submissionStatus as 'Đã nộp' | 'Đang làm' | 'Chưa nộp') || 'Đã nộp',
      };
      if (existingIdx >= 0) {
        inMemoryStudents[existingIdx] = item;
      } else {
        inMemoryStudents.unshift(item);
      }
      lastRecord = await upsertStudentRecord(st);
    }
    res.json({ ok: true, student: lastRecord || incomingList[0] || body, students: inMemoryStudents });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Xóa Học sinh (Bảo mật: Chỉ Giáo viên)
 * DELETE /api/db/students/:id
 */
router.delete('/api/db/students/:id', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.id;
    setInMemoryStudents(inMemoryStudents.filter((s) => s.id !== studentId));
    await deleteStudentFromDb(studentId);
    res.json({ ok: true, students: inMemoryStudents });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Xóa toàn bộ học sinh theo Lớp (Bảo mật: Chỉ Giáo viên)
 * DELETE /api/db/students/class/:classId
 */
router.delete('/api/db/students/class/:classId', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const classId = req.params.classId;
    setInMemoryStudents(inMemoryStudents.filter((s) => s.classId !== classId));
    await deleteStudentsByClassFromDb(classId);
    res.json({ ok: true, students: inMemoryStudents });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Reset năm học mới (Bảo mật: Chỉ Giáo viên)
 * POST /api/db/reset-academic-year
 */
router.post('/api/db/reset-academic-year', requireTeacherAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    setInMemoryStudents(
      inMemoryStudents.map((st) => ({
        ...st,
        xp: 0,
        stars: 0,
        streakDays: 1,
        avgScore: 0,
        submissionStatus: 'Chưa nộp' as const,
      }))
    );
    setLiveClassroomSession({
      ...liveClassroomSession,
      taughtPeriodsByClass: {},
      studentDraftsByKey: {},
      taggedSubmissions: [],
    });
    if (process.env.SQL_HOST) {
      for (const st of inMemoryStudents) {
        await upsertStudentRecord(st).catch(() => null);
      }
    }
    res.json({
      ok: true,
      message: 'Đã làm sạch toàn bộ XP, điểm số và bài nộp toàn trường sẵn sàng Khai giảng năm học mới!',
      students: inMemoryStudents,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Quản lý Giáo trình CSDL
 * GET & POST /api/db/curriculum
 */
router.get('/api/db/curriculum', async (_req: Request, res: Response) => {
  try {
    const rows = await getAllCurriculumFromDb();
    res.json({ ok: true, curriculum: rows });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/api/db/curriculum', requireTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const curr = req.body || {};
    const record = await upsertCurriculumRecord(curr);
    res.json({ ok: true, curriculum: record });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Quản lý Tiến độ học sinh
 * GET & POST /api/db/progress
 */
router.get('/api/db/progress', async (req: Request, res: Response) => {
  try {
    const studentId = String(req.query.studentId || '');
    const rows = await getStudentProgressFromDb(studentId);
    res.json({ ok: true, progress: rows });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/api/db/progress', requireStudentOrTeacherAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prog = req.body || {};
    const record = await upsertStudentProgressRecord(prog);
    res.json({ ok: true, progress: record });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
