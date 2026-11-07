import { Router, Request, Response } from 'express';
import { createSessionToken, verifySessionToken } from '../auth/tokenService.ts';
import { requireTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import { inMemoryStudents, liveClassroomSession, updateLiveClassroomSession } from '../state/serverState.ts';

const router = Router();

const DEFAULT_TEACHER_PASS = process.env.TEACHER_PASSWORD || '12345';
const TEACHER_EMAIL = 'manhtruongdo1984@gmail.com';
const TEACHER_NAME = 'Thầy Đỗ Mạnh Trường';

/**
 * Đăng nhập Giáo viên
 * POST /api/auth/teacher/login
 */
router.post('/api/auth/teacher/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (!cleanUser || !cleanPass) {
    return res.status(400).json({
      ok: false,
      error: 'Vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu giáo viên.',
    });
  }

  // Chấp nhận các alias tài khoản giáo viên hợp lệ
  const validUsernames = ['admin', 'thaytruong', 'thaytruongit', 'giaovien', 'manhtruongdo1984@gmail.com'];
  const isValidUser = validUsernames.includes(cleanUser) || cleanUser.includes('truong');

  // Kiểm tra mật khẩu giáo viên
  const isValidPass = cleanPass === DEFAULT_TEACHER_PASS || cleanPass === (process.env.ADMIN_SECRET || 'thaytruong_secret_2025');

  if (!isValidUser || !isValidPass) {
    return res.status(401).json({
      ok: false,
      error: 'Tài khoản hoặc Mật khẩu Giáo viên không chính xác.',
    });
  }

  // Tạo HMAC Token phiên làm việc giáo viên
  const token = createSessionToken({
    role: 'teacher',
    id: 'teacher-admin',
    name: TEACHER_NAME,
    email: TEACHER_EMAIL,
  }, 24 * 3600); // 24 giờ

  return res.json({
    ok: true,
    message: 'Xác thực Giáo viên thành công!',
    token,
    user: {
      role: 'teacher',
      id: 'teacher-admin',
      name: TEACHER_NAME,
      email: TEACHER_EMAIL,
    },
  });
});

/**
 * Đăng nhập Học sinh
 * POST /api/auth/student/login
 */
router.post('/api/auth/student/login', (req: Request, res: Response) => {
  const { studentId, password } = req.body || {};
  const cleanId = String(studentId || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (!cleanId) {
    return res.status(400).json({
      ok: false,
      error: 'Vui lòng cung cấp Mã số học sinh hoặc Tên đăng nhập.',
    });
  }

  // Tìm học sinh theo ID, username hoặc họ tên
  const student = inMemoryStudents.find(
    (s) =>
      s.id.toLowerCase() === cleanId ||
      (s.username && s.username.toLowerCase() === cleanId) ||
      s.name.toLowerCase() === cleanId
  );

  if (!student) {
    return res.status(404).json({
      ok: false,
      error: 'Không tìm thấy hồ sơ học sinh trong danh sách.',
    });
  }

  // Kiểm tra mật khẩu (mặc định 12345 hoặc mật khẩu cá nhân học sinh)
  const expectedPass = student.passwordDefault || '12345';
  if (cleanPass && cleanPass !== expectedPass && cleanPass !== '12345') {
    return res.status(401).json({
      ok: false,
      error: 'Mật khẩu học sinh không chính xác.',
    });
  }

  // Tạo HMAC Token phiên làm việc học sinh
  const token = createSessionToken({
    role: 'student',
    id: student.id,
    name: student.name,
    classId: student.classId,
    grade: student.grade,
  }, 7 * 24 * 3600); // 7 ngày

  return res.json({
    ok: true,
    message: `Học sinh ${student.name} (${student.classId}) kết nối thành công!`,
    token,
    student,
  });
});

/**
 * Kiểm tra Session hiện tại
 * GET /api/auth/me
 */
router.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ ok: false, authenticated: false });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const payload = verifySessionToken(token);
  if (!payload) {
    return res.json({ ok: false, authenticated: false, error: 'Token đã hết hạn hoặc không hợp lệ.' });
  }

  return res.json({
    ok: true,
    authenticated: true,
    user: payload,
  });
});

/**
 * Xác thực mã PIN phòng học trực tuyến Live
 * POST /api/auth/verify-room-pin
 */
router.post('/api/auth/verify-room-pin', (req: Request, res: Response) => {
  const { pin } = req.body || {};
  const currentPin = String(liveClassroomSession.roomPin || '').trim();

  // Nếu phòng không cài PIN thì tự do truy cập
  if (!currentPin) {
    return res.json({ ok: true, requiresPin: false, valid: true });
  }

  const inputPin = String(pin || '').trim();
  if (inputPin === currentPin) {
    return res.json({ ok: true, requiresPin: true, valid: true, message: 'Mã PIN phòng học chính xác!' });
  }

  return res.status(403).json({
    ok: false,
    requiresPin: true,
    valid: false,
    error: 'Mã PIN phòng học trực tuyến không đúng. Vui lòng hỏi Thầy/Cô giáo.',
  });
});

/**
 * Giáo viên thiết lập hoặc hủy mã PIN phòng học
 * POST /api/auth/room-pin
 */
router.post('/api/auth/room-pin', requireTeacherAuth, (req: AuthenticatedRequest, res: Response) => {
  const { pin } = req.body || {};
  const newPin = typeof pin === 'string' ? pin.trim() : '';

  updateLiveClassroomSession((prev) => ({
    ...prev,
    roomPin: newPin,
    updatedAt: new Date().toISOString(),
  }));

  return res.json({
    ok: true,
    message: newPin ? `Đã thiết lập mã PIN phòng học: ${newPin}` : 'Đã mở phòng học tự do (không yêu cầu PIN).',
    roomPin: newPin,
  });
});

export default router;
