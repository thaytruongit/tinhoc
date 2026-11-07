import { Router, Request, Response } from 'express';
import { requireTeacherAuth, AuthenticatedRequest } from '../auth/authMiddleware.ts';
import {
  isPgConfigured,
  liveClassroomSession,
  setLiveClassroomSession,
  hydrateFromPostgresIfNeeded,
} from '../state/serverState.ts';
import {
  ensureDatabaseTablesExist,
  saveLiveSessionStateToDb,
  getLiveSessionStateFromDb,
} from '../../db/repository.ts';
import { healthCheckDb } from '../../lib/db.ts';

const router = Router();

/**
 * Công cụ chẩn đoán CRUD thời gian thực Supabase / PostgreSQL
 * POST /api/db/diagnostic-crud
 */
router.post('/api/db/diagnostic-crud', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const activeClassId = String(req.body?.classId || '7A10').slice(0, 16);
  const testKey = `diagnostic_test_${Date.now()}`;
  const testPayload = {
    testMessage: 'Supabase / PostgreSQL CRUD Sync Diagnostic Test',
    classId: activeClassId,
    timestamp: new Date().toISOString(),
    randomNonce: Math.floor(Math.random() * 100000),
  };

  const logs: string[] = [];
  logs.push(`[1/4] Thử nghiệm chẩn đoán CRUD CSDL cho Lớp ${activeClassId}...`);

  if (!isPgConfigured()) {
    logs.push(`[2/4] CSDL chưa được cấu hình biến môi trường DATABASE_URL hoặc SQL_HOST trong .env.`);
    logs.push(`[3/4] Đang hoạt động ở Chế độ Bộ nhớ (In-Memory Fallback Mode).`);
    logs.push(`[4/4] Hướng dẫn: Điền DATABASE_URL hoặc SUPABASE_DATABASE_URL vào .env rồi thử lại.`);
    return res.json({
      ok: false,
      status: 'UNCONFIGURED',
      databaseEngine: 'Chưa cấu hình Supabase (Đang dùng In-Memory Fallback)',
      activeClassId,
      error: 'Biến môi trường DATABASE_URL hoặc SUPABASE_DATABASE_URL chưa được thiết lập trong tệp .env.',
      instructions: 'Vui lòng điền DATABASE_URL vào tệp .env để kích hoạt đồng bộ CSDL Supabase / PostgreSQL.',
      logs,
      metrics: {
        writeLatencyMs: 0,
        readLatencyMs: 0,
        updateLatencyMs: 0,
        totalLatencyMs: Date.now() - startTime,
      },
    });
  }

  let writeLatencyMs = 0;
  let readLatencyMs = 0;
  let updateLatencyMs = 0;

  try {
    try {
      await ensureDatabaseTablesExist();
      logs.push(`[1/4] Khởi tạo / Kiểm tra cấu trúc bảng CSDL hoàn tất.`);
    } catch (tableErr: any) {
      logs.push(`[CẢNH BÁO TABLE] Lỗi kiểm tra bảng CSDL: ${tableErr.message}`);
    }

    // 1. WRITE
    const writeStart = Date.now();
    const writeResult = await saveLiveSessionStateToDb(testKey, JSON.stringify(testPayload));
    writeLatencyMs = Date.now() - writeStart;
    if (!writeResult) {
      throw new Error('Ghi CSDL thất bại: Không thể ghi bản ghi vào bảng live_classroom_states.');
    }
    logs.push(`[2/4] CREATE (Write) thành công trong ${writeLatencyMs}ms. Mục khóa: ${testKey}`);

    // 2. READ
    const readStart = Date.now();
    const readRecord = await getLiveSessionStateFromDb(testKey);
    readLatencyMs = Date.now() - readStart;
    if (!readRecord?.stateJson) {
      throw new Error(`Đọc CSDL thất bại: Không tìm thấy bản ghi ${testKey} sau khi ghi.`);
    }
    const parsedRead = JSON.parse(readRecord.stateJson);
    logs.push(`[3/4] READ (Select) thành công trong ${readLatencyMs}ms. Khớp Nonce: ${parsedRead.randomNonce === testPayload.randomNonce}`);

    // 3. UPDATE
    const updatedPayload = { ...testPayload, updatedMessage: 'UPDATED_SUCCESSFULLY' };
    const updateStart = Date.now();
    const updateResult = await saveLiveSessionStateToDb(testKey, JSON.stringify(updatedPayload));
    updateLatencyMs = Date.now() - updateStart;
    if (!updateResult) {
      throw new Error('Cập nhật CSDL thất bại.');
    }
    logs.push(`[4/4] UPDATE (Sửa) thành công trong ${updateLatencyMs}ms.`);

    const totalLatencyMs = Date.now() - startTime;

    res.json({
      ok: true,
      status: 'OPERATIONAL',
      databaseEngine: 'Supabase / Cloud SQL PostgreSQL',
      activeClassId,
      metrics: {
        writeLatencyMs,
        readLatencyMs,
        updateLatencyMs,
        totalLatencyMs,
      },
      readRecord: parsedRead,
      logs,
    });
  } catch (error: any) {
    const errMsg = error.message || 'Kiểm tra CRUD CSDL thất bại.';
    logs.push(`[LỖI] ${errMsg}`);
    console.error('Database CRUD diagnostic test failed:', error);
    res.json({
      ok: false,
      status: 'ERROR',
      databaseEngine: 'Supabase / Cloud SQL PostgreSQL',
      activeClassId,
      error: errMsg,
      logs,
      metrics: {
        writeLatencyMs,
        readLatencyMs,
        updateLatencyMs,
        totalLatencyMs: Date.now() - startTime,
      },
    });
  }
});

/**
 * Khởi tạo bảng CSDL DDL (Bảo mật: Chỉ Giáo viên)
 * POST /api/db/init-schema
 */
router.post('/api/db/init-schema', requireTeacherAuth, async (_req: AuthenticatedRequest, res: Response) => {
  if (!isPgConfigured()) {
    return res.status(400).json({
      ok: false,
      error: 'Biến môi trường DATABASE_URL hoặc SUPABASE_DATABASE_URL chưa được thiết lập.',
    });
  }
  try {
    await ensureDatabaseTablesExist();
    await hydrateFromPostgresIfNeeded();
    res.json({
      ok: true,
      message: '🎉 Đã khởi tạo hoàn tất các bảng CSDL Supabase PostgreSQL thành công!',
    });
  } catch (error: any) {
    console.error('Failed to initialize database tables:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Không thể tạo bảng CSDL Supabase.',
    });
  }
});

/**
 * Xóa sạch dữ liệu tùy chỉnh (Bảo mật: Chỉ Giáo viên)
 * POST /api/db/clean-reset
 */
router.post('/api/db/clean-reset', requireTeacherAuth, async (_req: AuthenticatedRequest, res: Response) => {
  setLiveClassroomSession({
    ...liveClassroomSession,
    customWorksheetsByLesson: {},
    verifiedLessonsMap: {},
    updatedAt: new Date().toISOString(),
  });
  if (isPgConfigured()) {
    try {
      await saveLiveSessionStateToDb('global_live_session', JSON.stringify(liveClassroomSession));
    } catch (err) {
      console.warn('PostgreSQL reset save notice:', err);
    }
  }
  res.json({
    ok: true,
    message: '✨ Đã xóa sạch sẽ toàn bộ dữ liệu tùy chỉnh từ tiết 1 đến 29 ở tất cả các khối (6, 7, 8, 9) và thiết lập môi trường dữ liệu sạch!',
    liveClassroomSession,
  });
});

/**
 * Kiểm tra sức khỏe kết nối CSDL
 * GET /api/db/health
 */
router.get('/api/db/health', async (_req: Request, res: Response) => {
  try {
    const health = await healthCheckDb();
    res.json({ ok: health.ok, health });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

