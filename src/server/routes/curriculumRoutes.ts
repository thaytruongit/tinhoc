import { Router, Request, Response } from 'express';
import {
  buildFullCurriculumJsonForGrade,
  buildAllGradesFullCurriculumJson,
  GRADE_SOURCE_PDF_MAP,
} from '../../data/curriculumFullJsonBuilder.js';
import { generate29PeriodsDocxBuffer } from '../../utils/docxTemplateGenerator.ts';

const router = Router();

/**
 * 1. Dynamic Curriculum & Classroom Metadata API
 * GET /api/curriculum
 */
router.get('/api/curriculum', (_req: Request, res: Response) => {
  res.json({
    platform: 'Dạy học số',
    curriculumStandard: 'Chương trình GDPT 2018 - Môn Tin Học (THCS & THPT)',
    activeSemester: 'HK I (2024 - 2025)',
    teacher: {
      name: 'Thầy Đỗ Mạnh Trường',
      role: 'Giáo viên bộ môn & Quản trị hệ thống',
      email: 'manhtruongdo1984@gmail.com',
    },
    classes: [
      { id: '6A10', name: 'Lớp 6A10 (Trực tuyến Cloud)', grade: 6, studentCount: 40, onlineCount: 40, submissionRate: 92, avgScore: 8.6 },
      { id: '6A11', name: 'Lớp 6A11 (Trực tuyến Cloud)', grade: 6, studentCount: 42, onlineCount: 41, submissionRate: 88, avgScore: 8.4 },
      { id: '7A10', name: 'Lớp 7A10 (Trực tuyến Cloud)', grade: 7, studentCount: 40, onlineCount: 39, submissionRate: 90, avgScore: 8.7 },
      { id: '8A11', name: 'Lớp 8A11 (Trực tuyến Cloud)', grade: 8, studentCount: 40, onlineCount: 38, submissionRate: 85, avgScore: 8.3 },
      { id: '9A13', name: 'Lớp 9A13 (Trực tuyến Cloud)', grade: 9, studentCount: 38, onlineCount: 38, submissionRate: 94, avgScore: 8.9 },
      { id: '10A1', name: 'Lớp 10A1 (Tin học THPT - Định hướng CS)', grade: 10, studentCount: 42, onlineCount: 42, submissionRate: 95, avgScore: 9.1 },
      { id: '11A1', name: 'Lớp 11A1 (Cơ sở dữ liệu & Lập trình)', grade: 11, studentCount: 40, onlineCount: 39, submissionRate: 91, avgScore: 8.8 },
      { id: '12A1', name: 'Lớp 12A1 (AI & Mạng máy tính THPT)', grade: 12, studentCount: 40, onlineCount: 40, submissionRate: 96, avgScore: 9.3 },
    ],
    syncedAt: new Date().toISOString(),
  });
});

/**
 * Tải tệp DOCX mẫu 29 tiết theo khối
 * GET /api/worksheets/template-docx/:grade
 */
router.get('/api/worksheets/template-docx/:grade', async (req: Request, res: Response) => {
  try {
    const rawGrade = Number(req.params.grade);
    const grade = ([6, 7, 8, 9].includes(rawGrade) ? rawGrade : 7) as 6 | 7 | 8 | 9;
    const docxBuffer = await generate29PeriodsDocxBuffer(grade);
    const fileName = `Mau_Nap_Du_Lieu_29_Tiet_Tin_Hoc_Khoi_${grade}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(docxBuffer);
  } catch (error: any) {
    console.error('Failed to generate 29-period .docx template:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Không thể tạo tệp mẫu .docx 29 tiết.',
    });
  }
});

/**
 * Trích xuất Full JSON Giáo trình theo từng Khối (6, 7, 8, 9)
 * GET /api/curriculum/full-json/:grade
 */
router.get('/api/curriculum/full-json/:grade', (req: Request, res: Response) => {
  const gNum = Number(req.params.grade);
  if (![6, 7, 8, 9].includes(gNum)) {
    return res.status(400).json({
      ok: false,
      error: 'Khối lớp không hợp lệ. Hỗ trợ khối 6, 7, 8, 9.',
      supportedGrades: [6, 7, 8, 9],
    });
  }
  const grade = gNum as 6 | 7 | 8 | 9;
  const gradeJson = buildFullCurriculumJsonForGrade(grade);
  const pretty = req.query.pretty === 'true' || req.query.pretty === '1';

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="curriculum-grade-${grade}-full.json"`
  );
  if (pretty) {
    return res.send(JSON.stringify(gradeJson, null, 2));
  }
  return res.json(gradeJson);
});

/**
 * Trích xuất Full JSON Giáo trình toàn bộ 4 khối (116 tiết)
 * GET /api/curriculum/full-json
 */
router.get('/api/curriculum/full-json', (req: Request, res: Response) => {
  const allJson = buildAllGradesFullCurriculumJson();
  const pretty = req.query.pretty === 'true' || req.query.pretty === '1';

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="curriculum-all-grades-full.json"'
  );
  if (pretty) {
    return res.send(JSON.stringify(allJson, null, 2));
  }
  return res.json(allJson);
});

export default router;

