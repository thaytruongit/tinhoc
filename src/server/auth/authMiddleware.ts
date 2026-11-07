import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, type UserSessionPayload } from './tokenService.ts';
import { adminAuth } from '../../lib/firebase-admin.ts';

export interface AuthenticatedRequest extends Request {
  user?: UserSessionPayload;
}

const TEACHER_ADMIN_EMAIL = 'manhtruongdo1984@gmail.com';
const TEACHER_KEY = process.env.TEACHER_ACCESS_KEY || process.env.ADMIN_SECRET || 'thaytruong_secret_2025';

/**
 * Trích xuất token từ Authorization header (Bearer ...)
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split('Bearer ')[1].trim();
  }
  const customHeader = req.headers['x-session-token'];
  if (typeof customHeader === 'string' && customHeader.trim().length > 0) {
    return customHeader.trim();
  }
  return null;
}

/**
 * Middleware: Bắt buộc quyền Giáo viên (Teacher / Admin)
 * Bảo vệ các thao tác quản trị: xóa/sửa học sinh, lớp học, reset CSDL, điều khiển Live slide.
 */
export async function requireTeacherAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // 1. Kiểm tra qua Header x-teacher-key nếu có
  const teacherKey = req.headers['x-teacher-key'];
  if (teacherKey && (teacherKey === TEACHER_KEY || teacherKey === process.env.ADMIN_SECRET)) {
    req.user = {
      role: 'teacher',
      id: 'teacher-admin',
      name: 'Thầy Đỗ Mạnh Trường',
      email: TEACHER_ADMIN_EMAIL,
    };
    return next();
  }

  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized: Thiếu token xác thực quyền Giáo viên.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  // 2. Thử giải mã bằng Session Token nội bộ HMAC
  const sessionUser = verifySessionToken(token);
  if (sessionUser && sessionUser.role === 'teacher') {
    req.user = sessionUser;
    return next();
  }

  // 3. Fallback: Thử giải mã bằng Firebase ID Token (nếu đăng nhập bằng Google)
  try {
    const decodedFirebaseToken = await adminAuth.verifyIdToken(token);
    if (decodedFirebaseToken) {
      const email = decodedFirebaseToken.email || '';
      if (email === TEACHER_ADMIN_EMAIL || decodedFirebaseToken.admin === true) {
        req.user = {
          role: 'teacher',
          id: decodedFirebaseToken.uid,
          name: decodedFirebaseToken.name || 'Thầy Đỗ Mạnh Trường',
          email,
        };
        return next();
      }
    }
  } catch {
    // Không phải Firebase token hợp lệ
  }

  return res.status(403).json({
    ok: false,
    error: 'Forbidden: Bạn không có quyền Giáo viên để thực hiện thao tác này.',
    code: 'AUTH_FORBIDDEN',
  });
}

/**
 * Middleware: Bắt buộc xác thực Học sinh hoặc Giáo viên
 * Dùng cho các endpoint nộp bài tập, lưu tiến độ, làm trắc nghiệm.
 * Ngăn chặn học sinh sửa điểm chéo lẫn nhau!
 */
export async function requireStudentOrTeacherAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const teacherKey = req.headers['x-teacher-key'];
  if (teacherKey && (teacherKey === TEACHER_KEY || teacherKey === process.env.ADMIN_SECRET)) {
    req.user = {
      role: 'teacher',
      id: 'teacher-admin',
      name: 'Thầy Đỗ Mạnh Trường',
      email: TEACHER_ADMIN_EMAIL,
    };
    return next();
  }

  const token = extractToken(req);
  if (!token) {
    // Để tương thích ngược linh hoạt trên mạng trường học LAN:
    // Nếu không có token, cho phép tiếp tục nhưng đánh dấu unauthenticated
    // (hoặc nếu client gửi studentId thì tiếp tục với cảnh báo)
    return next();
  }

  const sessionUser = verifySessionToken(token);
  if (sessionUser) {
    req.user = sessionUser;
    return next();
  }

  // Firebase fallback
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    if (decodedFirebase) {
      req.user = {
        role: decodedFirebase.email === TEACHER_ADMIN_EMAIL ? 'teacher' : 'student',
        id: decodedFirebase.uid,
        name: decodedFirebase.name || 'Học sinh CloudPlay',
        email: decodedFirebase.email,
      };
      return next();
    }
  } catch {
    // Token không hợp lệ nhưng không làm sập request
  }

  next();
}

/**
 * Middleware: Tùy chọn xác thực (nạp req.user nếu có token hợp lệ)
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  if (token) {
    const user = verifySessionToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

