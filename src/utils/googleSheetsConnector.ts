import {
  BLANK_WHITE_SLIDE_DATA_URL,
  type ManagedLectureSlidePage,
} from './slideDeckManager';

export const GOOGLE_SHEETS_SLIDE_DB_STORAGE_KEY = 'cloudplay_google_sheets_slide_db_v1';

/**
 * Chuẩn hóa cấu trúc 2 bảng (Sheet tab) trên tệp Google Sheet "CSDL":
 * - Bảng 1: `Slides_Index` (Cột A -> I, 9 cột)
 * - Bảng 2: `Slides_Pages` (Cột A -> N, 14 cột, gồm 6 cột phân mảnh Base64 `imgChunk1` -> `imgChunk6`)
 */
export const GOOGLE_SHEETS_SLIDE_DB_SCHEMA = {
  DEFAULT_SPREADSHEET_TITLE: 'CSDL',
  INDEX_SHEET_NAME: 'Slides_Index',
  PAGES_SHEET_NAME: 'Slides_Pages',
  MAX_CHARS_PER_CELL: 45000,
  MAX_IMAGE_CHUNKS: 6,
  MAX_TOTAL_BASE64_CHARS: 45000 * 6, // 270,000 ký tự Base64 (~200KB WebP/JPEG mỗi trang)
  INDEX_HEADERS: [
    'lessonKey',
    'grade',
    'period',
    'lessonTitle',
    'fileName',
    'slideCount',
    'totalSizeKb',
    'updatedAtIso',
    'teacherEmail',
  ] as const,
  PAGES_HEADERS: [
    'rowKey',
    'lessonKey',
    'grade',
    'period',
    'slideNumber',
    'totalSlides',
    'title',
    'notesJson',
    'imgChunk1',
    'imgChunk2',
    'imgChunk3',
    'imgChunk4',
    'imgChunk5',
    'imgChunk6',
  ] as const,
};

export const CSDL_GOOGLE_SHEETS_SCHEMA = GOOGLE_SHEETS_SLIDE_DB_SCHEMA;

export interface GoogleSheetSlideIndexRecord {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  fileName: string;
  slideCount: number;
  totalSizeKb: number;
  updatedAtIso: string;
  teacherEmail: string;
}

export interface GoogleSheetsConnectionConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle?: string;
  connectedAtIso: string;
  lastSyncedAtIso?: string;
}

export interface Base64ChunkStats {
  totalChars: number;
  estimatedKb: number;
  activeChunkCount: number;
  chunkLengths: number[];
  maxChunkLength: number;
  fitsWithinSheetRow: boolean;
}

export interface ConvertedPdfWebpSlide {
  slideNumber: number;
  totalSlides: number;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  highlightNote: string;
  extractedText: string;
  imageUrl: string;
  width: number;
  height: number;
  sizeKb: number;
  chunkCount: number;
  chunks: string[];
}

/**
 * Trích xuất `spreadsheetId` từ đường dẫn Google Sheets đầy đủ hoặc trả về ID đã làm sạch.
 */
export function extractSpreadsheetIdFromInput(rawInput: string): string {
  const trimmed = String(rawInput || '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
  if (!trimmed) return '';

  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{10,})/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9-_]{10,})/i);
  if (queryIdMatch && queryIdMatch[1]) {
    return queryIdMatch[1];
  }

  if (/^[a-zA-Z0-9-_]{15,80}$/.test(trimmed)) {
    return trimmed;
  }

  return '';
}

export function buildGoogleSheetUrlFromId(spreadsheetId: string): string {
  const cleanId = extractSpreadsheetIdFromInput(spreadsheetId);
  if (!cleanId) return '';
  return `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
}

/**
 * Hàm xử lý phân mảnh chuỗi ảnh Base64 (`data:image/webp;base64,...`) thành tối đa 6 chunk
 * (`imgChunk1` -> `imgChunk6`, mỗi ô <= 45.000 ký tự) để không bao giờ vượt giới hạn 50.000 ký tự/ô của Google Sheets.
 */
export function splitBase64IntoSheetChunks(
  imageDataUrl: string,
  maxCharsPerCell: number = GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_CHARS_PER_CELL,
  maxChunks: number = GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_IMAGE_CHUNKS
): string[] {
  const safeUrl = String(imageDataUrl || '').trim();
  const safeLimit = Math.max(1000, Math.min(49000, Math.floor(maxCharsPerCell)));
  const safeCount = Math.max(1, Math.min(12, Math.floor(maxChunks)));

  const chunks: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    const start = i * safeLimit;
    if (start < safeUrl.length) {
      chunks.push(safeUrl.slice(start, start + safeLimit));
    } else {
      chunks.push('');
    }
  }
  return chunks;
}

export const chunkSlideImageForSheetCells = splitBase64IntoSheetChunks;

/**
 * Ghép nguyên vẹn các mảnh Base64 (`imgChunk1` -> `imgChunk6`) từ dòng của bảng `Slides_Pages`
 * thành chuỗi ảnh Data URL gốc để trình chiếu mượt 60FPS.
 */
export function reassembleBase64FromSheetChunks(
  chunks: Array<string | undefined | null>
): string {
  if (!Array.isArray(chunks)) return '';
  return chunks
    .map((c) => (typeof c === 'string' ? c.trim() : ''))
    .filter((c) => c.length > 0)
    .join('');
}

export const reassembleSlideImageFromSheetChunks = reassembleBase64FromSheetChunks;

/**
 * Tính toán thông số phân mảnh Base64 (tổng số ký tự, dung lượng KB, số mảnh chunk 1..6 đang sử dụng).
 */
export function calculateBase64ChunkStats(
  imageDataUrl: string,
  maxCharsPerCell: number = GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_CHARS_PER_CELL,
  maxChunks: number = GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_IMAGE_CHUNKS
): Base64ChunkStats {
  const clean = String(imageDataUrl || '').trim();
  const chunks = splitBase64IntoSheetChunks(clean, maxCharsPerCell, maxChunks);
  const chunkLengths = chunks.map((c) => c.length);
  const activeChunkCount = chunkLengths.filter((len) => len > 0).length;
  const maxChunkLength = chunkLengths.reduce((m, v) => Math.max(m, v), 0);
  const estimatedKb = Math.max(1, Math.round((clean.length * 0.75) / 1024));
  const fitsWithinSheetRow =
    clean.length <= maxCharsPerCell * maxChunks && maxChunkLength <= maxCharsPerCell;

  return {
    totalChars: clean.length,
    estimatedKb,
    activeChunkCount,
    chunkLengths,
    maxChunkLength,
    fitsWithinSheetRow,
  };
}

/**
 * Đóng gói 1 trang Slide ảnh thành 1 dòng 14 cột (Cột A -> N) cho bảng `Slides_Pages`.
 */
export function serializeSlideToSheetPageRow(params: {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  slideNumber: number;
  totalSlides: number;
  slide: ManagedLectureSlidePage;
  maxCharsPerCell?: number;
}): string[] {
  const { lessonKey, grade, period, slideNumber, totalSlides, slide } = params;
  const rowKey = `${lessonKey}__s${slideNumber}`;
  const title = String(slide.title || `Slide ${slideNumber}/${totalSlides}`).slice(0, 300);
  const notesPayload = {
    subtitle: String(slide.subtitle || '').slice(0, 300),
    bulletPoints: Array.isArray(slide.bulletPoints)
      ? slide.bulletPoints.slice(0, 6).map((b) => String(b || '').slice(0, 300))
      : [],
    highlightNote: String(slide.highlightNote || '').slice(0, 300),
  };
  const notesJson = JSON.stringify(notesPayload).slice(0, 4000);
  const imgChunks = splitBase64IntoSheetChunks(
    slide.imageUrl || '',
    params.maxCharsPerCell ?? GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_CHARS_PER_CELL,
    GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_IMAGE_CHUNKS
  );

  return [
    rowKey,
    lessonKey,
    String(grade),
    String(period),
    String(slideNumber),
    String(totalSlides),
    title,
    notesJson,
    ...imgChunks,
  ];
}

/**
 * Giải mã 1 dòng từ bảng `Slides_Pages` (Cột A -> N) thành đối tượng `ManagedLectureSlidePage`.
 */
export function deserializeSheetPageRowToSlide(row: any[]): {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  slideNumber: number;
  totalSlides: number;
  slide: ManagedLectureSlidePage;
} | null {
  if (!Array.isArray(row) || row.length < 7) return null;
  const lessonKey = String(row[1] || '').trim();
  if (!lessonKey || lessonKey === 'lessonKey') return null;

  const rawGrade = Number(row[2]);
  const grade = ([6, 7, 8, 9].includes(rawGrade) ? rawGrade : 6) as 6 | 7 | 8 | 9;
  const period = Math.max(1, Math.min(29, Math.round(Number(row[3]) || 1)));
  const slideNumber = Math.max(1, Math.round(Number(row[4]) || 1));
  const totalSlides = Math.max(1, Math.round(Number(row[5]) || 1));
  const title = String(row[6] || `Slide ${slideNumber}/${totalSlides}`);

  let subtitle = `Khối ${grade} • Tiết ${period} • Trang ${slideNumber}/${totalSlides}`;
  let bulletPoints: string[] = [];
  let highlightNote = `Ảnh Slide PDF từ Google Sheets (#${slideNumber}/${totalSlides})`;

  const rawNotes = String(row[7] || '').trim();
  if (rawNotes.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawNotes);
      if (parsed.subtitle) subtitle = String(parsed.subtitle);
      if (Array.isArray(parsed.bulletPoints)) {
        bulletPoints = parsed.bulletPoints.map((b: any) => String(b));
      }
      if (parsed.highlightNote) highlightNote = String(parsed.highlightNote);
    } catch {
      // fallback to default notes
    }
  }

  const chunkCells = row.slice(8, 8 + GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_IMAGE_CHUNKS);
  const imageUrl = reassembleBase64FromSheetChunks(chunkCells);
  if (!imageUrl) return null;

  return {
    lessonKey,
    grade,
    period,
    slideNumber,
    totalSlides,
    slide: {
      slideNumber,
      title,
      subtitle,
      bulletPoints,
      highlightNote,
      imageUrl,
    },
  };
}

/**
 * Đóng gói thông tin chỉ mục tiết học thành 1 dòng 9 cột (Cột A -> I) cho bảng `Slides_Index`.
 */
export function serializeDeckToSheetIndexRow(record: GoogleSheetSlideIndexRecord): string[] {
  return [
    record.lessonKey,
    String(record.grade),
    String(record.period),
    String(record.lessonTitle || '').slice(0, 300),
    String(record.fileName || '').slice(0, 240),
    String(record.slideCount),
    String(record.totalSizeKb),
    record.updatedAtIso,
    String(record.teacherEmail || ''),
  ];
}

/**
 * Giải mã 1 dòng từ bảng `Slides_Index` (Cột A -> I).
 */
export function deserializeSheetIndexRow(row: any[]): GoogleSheetSlideIndexRecord | null {
  if (!Array.isArray(row) || row.length < 6) return null;
  const lessonKey = String(row[0] || '').trim();
  if (!lessonKey || lessonKey === 'lessonKey') return null;

  const rawGrade = Number(row[1]);
  const grade = ([6, 7, 8, 9].includes(rawGrade) ? rawGrade : 6) as 6 | 7 | 8 | 9;
  const period = Math.max(1, Math.min(29, Math.round(Number(row[2]) || 1)));
  const lessonTitle = String(row[3] || `Tiết ${period}`);
  const fileName = String(row[4] || `Tiet ${period}.pdf`);
  const slideCount = Math.max(0, Math.round(Number(row[5]) || 0));
  const totalSizeKb = Math.max(0, Math.round(Number(row[6]) || 0));
  const updatedAtIso = String(row[7] || new Date().toISOString());
  const teacherEmail = String(row[8] || '');

  return {
    lessonKey,
    grade,
    period,
    lessonTitle,
    fileName,
    slideCount,
    totalSizeKb,
    updatedAtIso,
    teacherEmail,
  };
}

/**
 * Xây dựng kế hoạch cập nhật 2 bảng `Slides_Index` và `Slides_Pages` cho 1 tiết học (`lessonKey`),
 * thay thế các dòng ảnh cũ của tiết đó và giữ nguyên toàn bộ các tiết học khác.
 */
export function buildSheetUpdatePlanForLesson(params: {
  existingIndexRows: any[][];
  existingPageRows: any[][];
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  fileName: string;
  slides: ManagedLectureSlidePage[];
  teacherEmail?: string;
  updatedAtIso?: string;
  maxCharsPerCell?: number;
}): {
  isOverwritingExistingLesson: boolean;
  existingSlideCount: number;
  nextIndexValues: string[][];
  nextPageValues: string[][];
  newIndexRecord: GoogleSheetSlideIndexRecord;
} {
  const {
    existingIndexRows,
    existingPageRows,
    lessonKey,
    grade,
    period,
    lessonTitle,
    fileName,
    slides,
    teacherEmail = '',
    updatedAtIso = new Date().toISOString(),
  } = params;

  const parsedIndexRecords: GoogleSheetSlideIndexRecord[] = [];
  let isOverwritingExistingLesson = false;
  let existingSlideCount = 0;

  for (const row of existingIndexRows || []) {
    const rec = deserializeSheetIndexRow(row);
    if (!rec) continue;
    if (rec.lessonKey === lessonKey) {
      isOverwritingExistingLesson = true;
      existingSlideCount = rec.slideCount;
    } else {
      parsedIndexRecords.push(rec);
    }
  }

  const keptPageRows: string[][] = [];
  for (const row of existingPageRows || []) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const rLessonKey = String(row[1] || '').trim();
    const rKey = String(row[0] || '').trim();
    if (!rLessonKey || rKey === 'rowKey' || rLessonKey === 'lessonKey') continue;
    if (rLessonKey === lessonKey) {
      isOverwritingExistingLesson = true;
      continue;
    }
    keptPageRows.push(row.map((cell: any) => String(cell ?? '')));
  }

  const totalChars = slides.reduce((acc, s) => acc + (s.imageUrl ? s.imageUrl.length : 0), 0);
  const totalSizeKb = Math.max(1, Math.round((totalChars * 0.75) / 1024));

  const newIndexRecord: GoogleSheetSlideIndexRecord = {
    lessonKey,
    grade,
    period,
    lessonTitle,
    fileName,
    slideCount: slides.length,
    totalSizeKb,
    updatedAtIso,
    teacherEmail,
  };

  const allIndexRecords = [...parsedIndexRecords, newIndexRecord].sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.period - b.period;
  });

  const nextIndexValues: string[][] = [
    [...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_HEADERS],
    ...allIndexRecords.map((r) => serializeDeckToSheetIndexRow(r)),
  ];

  const newLessonPageRows: string[][] = slides.map((s, idx) =>
    serializeSlideToSheetPageRow({
      lessonKey,
      grade,
      period,
      slideNumber: idx + 1,
      totalSlides: slides.length,
      slide: s,
      maxCharsPerCell: params.maxCharsPerCell,
    })
  );

  const nextPageValues: string[][] = [
    [...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_HEADERS],
    ...keptPageRows,
    ...newLessonPageRows,
  ];

  return {
    isOverwritingExistingLesson,
    existingSlideCount,
    nextIndexValues,
    nextPageValues,
    newIndexRecord,
  };
}

/**
 * Khởi tạo bộ Trang Slide Trắng (`trang slide trắng`) khi tiết học chưa có dữ liệu trên Google Sheet `CSDL`.
 */
export function buildBlankSlideDeckForEmptySheetLesson(params: {
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle?: string;
  spreadsheetId?: string;
}) {
  const { grade, period, lessonTitle, spreadsheetId } = params;
  const lessonKey = `k${grade}-tiet-${period}`;
  const sheetLabel = spreadsheetId ? `Google Sheet CSDL (${spreadsheetId.slice(0, 8)}...)` : 'Google Sheet CSDL';
  const blankSlide: ManagedLectureSlidePage & { isBlankSlide?: boolean } = {
    slideNumber: 1,
    title: `Trang Slide trắng — Chưa có dữ liệu Slide trong ${sheetLabel} cho Khối ${grade} • Tiết ${period}`,
    subtitle: lessonTitle || `Tin học Khối ${grade} • Tiết ${period}`,
    bulletPoints: [],
    highlightNote: `⬜ Chưa có dữ liệu Slide ảnh trong Google Sheet CSDL cho tiết học này (${lessonKey}). Hãy nạp tệp PDF để lưu từng trang ảnh WebP vào Sheet.`,
    imageUrl: BLANK_WHITE_SLIDE_DATA_URL,
    isBlankSlide: true,
  };

  return {
    lessonKey,
    grade,
    period,
    fileName: `Trang Slide trắng (Chưa có dữ liệu trên Google Sheet CSDL • Tiết ${period})`,
    fileType: 'pdf' as const,
    fileSize: '0 KB',
    fileSizeLabel: `Chưa có dữ liệu trong Google Sheet CSDL (${lessonKey})`,
    uploadedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    storageBucket: 'slide-storage-1gb' as const,
    totalCompressedKb: 1,
    isUserUploaded: false,
    hasRealPdfPages: false,
    isBlankSlideDeck: true,
    isLazyLoaded: true,
    sourceSpreadsheetId: spreadsheetId || '',
    slides: [blankSlide],
  };
}

/**
 * Trích xuất bộ Slide của 1 tiết học (`lessonKey`) từ dữ liệu 2 bảng `Slides_Index` và `Slides_Pages`.
 */
export function extractLessonSlideDeckFromSheetRows(params: {
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle?: string;
  spreadsheetId?: string;
  indexRows: any[][];
  pageRows: any[][];
}): {
  foundInSheet: boolean;
  isBlankSlide: boolean;
  slideCount: number;
  statusMessage: string;
  deck: any;
  indexRecord: GoogleSheetSlideIndexRecord | null;
} {
  const { grade, period, lessonTitle, spreadsheetId, indexRows, pageRows } = params;
  const lessonKey = `k${grade}-tiet-${period}`;

  let matchedIndex: GoogleSheetSlideIndexRecord | null = null;
  for (const row of indexRows || []) {
    const rec = deserializeSheetIndexRow(row);
    if (rec && rec.lessonKey === lessonKey) {
      matchedIndex = rec;
      break;
    }
  }

  const matchedSlides: ManagedLectureSlidePage[] = [];
  for (const row of pageRows || []) {
    const parsed = deserializeSheetPageRowToSlide(row);
    if (parsed && parsed.lessonKey === lessonKey) {
      matchedSlides.push(parsed.slide);
    }
  }

  matchedSlides.sort((a, b) => a.slideNumber - b.slideNumber);
  const renumberedSlides = matchedSlides.map((s, idx) => ({
    ...s,
    slideNumber: idx + 1,
  }));

  if (renumberedSlides.length === 0) {
    const blankDeck = buildBlankSlideDeckForEmptySheetLesson({
      grade,
      period,
      lessonTitle,
      spreadsheetId,
    });
    return {
      foundInSheet: false,
      isBlankSlide: true,
      slideCount: 0,
      statusMessage: `⬜ Chưa có dữ liệu Slide trong Google Sheet "CSDL" cho Khối ${grade} • Tiết ${period} (${lessonKey}) — Đang hiển thị Trang Slide trắng.`,
      deck: blankDeck,
      indexRecord: null,
    };
  }

  const fileName = matchedIndex?.fileName || `Tiet_${period}_Khoi_${grade}.pdf`;
  const totalKb = matchedIndex?.totalSizeKb || renumberedSlides.length * 42;
  const deck = {
    lessonKey,
    grade,
    period,
    fileName: `${fileName} (Google Sheets CSDL • ${renumberedSlides.length} Slide Ảnh)`,
    fileType: 'pdf' as const,
    fileSize: `${totalKb} KB`,
    fileSizeLabel: `Google Sheets CSDL (${lessonKey} • ${renumberedSlides.length} trang)`,
    uploadedAt: matchedIndex?.updatedAtIso
      ? new Date(matchedIndex.updatedAtIso).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
    storageBucket: 'slide-storage-1gb' as const,
    totalCompressedKb: totalKb,
    isUserUploaded: true,
    hasRealPdfPages: true,
    isBlankSlideDeck: false,
    isLazyLoaded: true,
    sourceSpreadsheetId: spreadsheetId || '',
    updatedAtIso: matchedIndex?.updatedAtIso || new Date().toISOString(),
    slides: renumberedSlides,
  };

  return {
    foundInSheet: true,
    isBlankSlide: false,
    slideCount: renumberedSlides.length,
    statusMessage: `✅ Đã tải mượt mà ${renumberedSlides.length} trang Ảnh Slide của Khối ${grade} • Tiết ${period} từ Google Sheets "CSDL"!`,
    deck,
    indexRecord: matchedIndex,
  };
}

/**
 * Đọc/ghi cấu hình kết nối Google Sheet (chỉ lưu `spreadsheetId` và URL, tuyệt đối không lưu OAuth token vào localStorage).
 */
export function getSavedGoogleSheetsConfig(): GoogleSheetsConnectionConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GOOGLE_SHEETS_SLIDE_DB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const cleanId = extractSpreadsheetIdFromInput(parsed?.spreadsheetId || '');
    if (!cleanId) return null;
    return {
      spreadsheetId: cleanId,
      spreadsheetUrl: parsed.spreadsheetUrl || buildGoogleSheetUrlFromId(cleanId),
      spreadsheetTitle: parsed.spreadsheetTitle || 'CSDL',
      connectedAtIso: parsed.connectedAtIso || new Date().toISOString(),
      lastSyncedAtIso: parsed.lastSyncedAtIso,
    };
  } catch {
    return null;
  }
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConnectionConfig | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!config || !config.spreadsheetId) {
      window.localStorage.removeItem(GOOGLE_SHEETS_SLIDE_DB_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(GOOGLE_SHEETS_SLIDE_DB_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage quota warning
  }
}

/**
 * Khởi tạo và chuẩn hóa cấu trúc 2 bảng (`Slides_Index` Cột A->I & `Slides_Pages` Cột A->N)
 * trên tệp Google Sheet `CSDL` của người dùng thông qua Google Sheets v4 API.
 */
export async function initializeCsdlGoogleSheetStructure(
  spreadsheetId: string,
  accessToken: string
): Promise<{
  ok: boolean;
  spreadsheetTitle: string;
  allLessonsIndex: GoogleSheetSlideIndexRecord[];
  errorMessage?: string;
}> {
  const cleanId = extractSpreadsheetIdFromInput(spreadsheetId);
  if (!cleanId) {
    return {
      ok: false,
      spreadsheetTitle: '',
      allLessonsIndex: [],
      errorMessage: 'Spreadsheet ID hoặc đường dẫn Google Sheet không hợp lệ.',
    };
  }

  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cleanId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    return {
      ok: false,
      spreadsheetTitle: '',
      allLessonsIndex: [],
      errorMessage:
        errData?.error?.message ||
        `Không thể truy cập Google Sheet (HTTP ${metaRes.status}). Hãy kiểm tra quyền truy cập của tài khoản Google.`,
    };
  }

  const metaJson = await metaRes.json();
  const spreadsheetTitle = String(metaJson?.properties?.title || 'CSDL');
  const existingSheetTitles = new Set<string>(
    (metaJson?.sheets || []).map((s: any) => String(s?.properties?.title || ''))
  );

  const requests: any[] = [];
  if (!existingSheetTitles.has(GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME)) {
    requests.push({
      addSheet: {
        properties: {
          title: GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME,
          gridProperties: { rowCount: 300, columnCount: 12, frozenRowCount: 1 },
        },
      },
    });
  }
  if (!existingSheetTitles.has(GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME)) {
    requests.push({
      addSheet: {
        properties: {
          title: GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME,
          gridProperties: { rowCount: 2000, columnCount: 16, frozenRowCount: 1 },
        },
      },
    });
  }

  if (requests.length > 0) {
    const batchRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cleanId)}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );
    if (!batchRes.ok) {
      const errData = await batchRes.json().catch(() => ({}));
      return {
        ok: false,
        spreadsheetTitle,
        allLessonsIndex: [],
        errorMessage:
          errData?.error?.message || 'Không thể khởi tạo 2 bảng CSDL trong Google Sheet.',
      };
    }
  }

  // Đọc bảng Slides_Index để kiểm tra header và lấy danh sách chỉ mục tiết học hiện có
  const idxRange = `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I300`;
  const idxRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      cleanId
    )}/values/${encodeURIComponent(idxRange)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let indexRows: any[][] = [];
  if (idxRes.ok) {
    const idxData = await idxRes.json();
    indexRows = Array.isArray(idxData?.values) ? idxData.values : [];
  }

  if (indexRows.length === 0) {
    // Ghi dòng tiêu đề chuẩn hóa vào cả 2 bảng Slides_Index (A1:I1) và Slides_Pages (A1:N1)
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        cleanId
      )}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: [
            {
              range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I1`,
              values: [[...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_HEADERS]],
            },
            {
              range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1:N1`,
              values: [[...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_HEADERS]],
            },
          ],
        }),
      }
    ).catch(() => {});
  }

  const allLessonsIndex: GoogleSheetSlideIndexRecord[] = [];
  for (const row of indexRows) {
    const parsed = deserializeSheetIndexRow(row);
    if (parsed) allLessonsIndex.push(parsed);
  }

  return {
    ok: true,
    spreadsheetTitle,
    allLessonsIndex,
  };
}

export const ensureGoogleSheetSlideDatabaseStructure = initializeCsdlGoogleSheetStructure;

/**
 * Tạo mới tệp Google Sheet có tên `CSDL` trong Google Drive của người dùng
 * với cấu trúc 2 bảng chuẩn hóa `Slides_Index` (Cột A -> I) và `Slides_Pages` (Cột A -> N).
 */
export async function createCsdlSpreadsheetInDrive(
  accessToken: string,
  customTitle = GOOGLE_SHEETS_SLIDE_DB_SCHEMA.DEFAULT_SPREADSHEET_TITLE
): Promise<{
  ok: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  errorMessage?: string;
}> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: customTitle,
      },
      sheets: [
        {
          properties: {
            title: GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME,
            gridProperties: { rowCount: 300, columnCount: 12, frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME,
            gridProperties: { rowCount: 2000, columnCount: 16, frozenRowCount: 1 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    return {
      ok: false,
      spreadsheetId: '',
      spreadsheetUrl: '',
      spreadsheetTitle: '',
      errorMessage:
        errData?.error?.message ||
        `Không thể tạo Google Sheet "${customTitle}" (HTTP ${createRes.status}).`,
    };
  }

  const created = await createRes.json();
  const spreadsheetId = String(created?.spreadsheetId || '');
  const spreadsheetUrl =
    String(created?.spreadsheetUrl || '') || buildGoogleSheetUrlFromId(spreadsheetId);
  const spreadsheetTitle = String(created?.properties?.title || customTitle);

  // Ghi dòng tiêu đề chuẩn hóa cho 2 bảng Slides_Index (A1:I1) và Slides_Pages (A1:N1)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: [
          {
            range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I1`,
            values: [[...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_HEADERS]],
          },
          {
            range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1:N1`,
            values: [[...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_HEADERS]],
          },
        ],
      }),
    }
  ).catch(() => {});

  return {
    ok: true,
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle,
  };
}

export const createNewGoogleSheetSlideDatabase = createCsdlSpreadsheetInDrive;

/**
 * Tải dữ liệu thô của 2 bảng `Slides_Index` và `Slides_Pages` từ Google Sheets v4 API.
 */
export async function fetchSheetDatabaseRows(params: {
  spreadsheetId: string;
  accessToken?: string | null;
}): Promise<{
  ok: boolean;
  indexRows: any[][];
  pageRows: any[][];
  errorMessage?: string;
}> {
  const cleanId = extractSpreadsheetIdFromInput(params.spreadsheetId);
  if (!cleanId) {
    return {
      ok: false,
      indexRows: [],
      pageRows: [],
      errorMessage: 'Chưa cấu hình Spreadsheet ID.',
    };
  }

  if (params.accessToken) {
    const structure = await initializeCsdlGoogleSheetStructure(cleanId, params.accessToken);
    if (!structure.ok) {
      return {
        ok: false,
        indexRows: [],
        pageRows: [],
        errorMessage: structure.errorMessage,
      };
    }

    const batchGetUrl =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        cleanId
      )}/values:batchGet` +
      `?ranges=${encodeURIComponent(
        `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I300`
      )}` +
      `&ranges=${encodeURIComponent(
        `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1:N2000`
      )}`;

    const res = await fetch(batchGetUrl, {
      headers: { Authorization: `Bearer ${params.accessToken}` },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        ok: false,
        indexRows: [],
        pageRows: [],
        errorMessage:
          errData?.error?.message || `Lỗi đọc dữ liệu Google Sheet (HTTP ${res.status}).`,
      };
    }

    const data = await res.json();
    const valueRanges = Array.isArray(data?.valueRanges) ? data.valueRanges : [];
    const indexRows = Array.isArray(valueRanges[0]?.values) ? valueRanges[0].values : [];
    const pageRows = Array.isArray(valueRanges[1]?.values) ? valueRanges[1].values : [];

    return {
      ok: true,
      indexRows,
      pageRows,
    };
  }

  // Fallback đọc qua Google Visualization JSON nếu tệp Sheet được chia sẻ công khai cho học sinh
  try {
    const parseGvizText = (txt: string): any[][] => {
      const jsonStart = txt.indexOf('{');
      const jsonEnd = txt.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) return [];
      const parsed = JSON.parse(txt.slice(jsonStart, jsonEnd + 1));
      const rows = parsed?.table?.rows || [];
      return rows.map((r: any) =>
        (r?.c || []).map((cell: any) =>
          cell && cell.v !== null && cell.v !== undefined ? String(cell.v) : ''
        )
      );
    };

    const [idxResp, pagesResp] = await Promise.all([
      fetch(
        `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
          cleanId
        )}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
          GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME
        )}`
      ),
      fetch(
        `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
          cleanId
        )}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
          GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME
        )}`
      ),
    ]);

    if (!idxResp.ok || !pagesResp.ok) {
      return {
        ok: false,
        indexRows: [],
        pageRows: [],
        errorMessage: 'Cần đăng nhập Google để đọc dữ liệu từ Google Sheet riêng tư.',
      };
    }

    const [idxText, pagesText] = await Promise.all([idxResp.text(), pagesResp.text()]);
    return {
      ok: true,
      indexRows: parseGvizText(idxText),
      pageRows: parseGvizText(pagesText),
    };
  } catch (err: any) {
    return {
      ok: false,
      indexRows: [],
      pageRows: [],
      errorMessage: err?.message || 'Không thể kết nối tới Google Sheet.',
    };
  }
}

/**
 * Kiểm tra nhanh trong bảng `Slides_Index` xem tiết học (`lessonKey`) đã có dữ liệu Slide ảnh hay chưa.
 */
export async function checkExistingLessonInGoogleSheet(params: {
  spreadsheetId: string;
  lessonKey: string;
  accessToken: string;
}): Promise<{
  exists: boolean;
  existingRecord: GoogleSheetSlideIndexRecord | null;
}> {
  const cleanId = extractSpreadsheetIdFromInput(params.spreadsheetId);
  if (!cleanId || !params.accessToken) {
    return { exists: false, existingRecord: null };
  }

  try {
    const idxRange = `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I300`;
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        cleanId
      )}/values/${encodeURIComponent(idxRange)}`,
      {
        headers: { Authorization: `Bearer ${params.accessToken}` },
      }
    );
    if (!res.ok) return { exists: false, existingRecord: null };
    const data = await res.json();
    const rows: any[][] = Array.isArray(data?.values) ? data.values : [];
    for (const row of rows) {
      const rec = deserializeSheetIndexRow(row);
      if (rec && rec.lessonKey === params.lessonKey && rec.slideCount > 0) {
        return { exists: true, existingRecord: rec };
      }
    }
    return { exists: false, existingRecord: null };
  } catch {
    return { exists: false, existingRecord: null };
  }
}

/**
 * Đẩy bộ ảnh Slide WebP của tiết học lên tệp Google Sheet `CSDL` (cập nhật đồng thời `Slides_Index` & `Slides_Pages`).
 */
export async function pushPdfSlideDeckToCsdlSheet(params: {
  spreadsheetId: string;
  accessToken: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  fileName: string;
  slides: ManagedLectureSlidePage[];
  teacherEmail?: string;
  onProgress?: (statusText: string) => void;
}): Promise<{
  ok: boolean;
  savedSlideCount: number;
  updatedIndexRecord?: GoogleSheetSlideIndexRecord;
  allLessonsIndex?: GoogleSheetSlideIndexRecord[];
  errorMessage?: string;
}> {
  const cleanId = extractSpreadsheetIdFromInput(params.spreadsheetId);
  if (!cleanId) {
    return {
      ok: false,
      savedSlideCount: 0,
      errorMessage: 'Chưa nhập Spreadsheet ID hoặc đường dẫn Google Sheet.',
    };
  }
  if (!params.accessToken) {
    return {
      ok: false,
      savedSlideCount: 0,
      errorMessage: 'Vui lòng đăng nhập Google để cấp quyền lưu Slide vào Google Sheet.',
    };
  }

  const lessonKey = `k${params.grade}-tiet-${params.period}`;
  params.onProgress?.(`Đang kiểm tra cấu trúc 2 bảng (Slides_Index & Slides_Pages) trên file CSDL...`);

  const fetched = await fetchSheetDatabaseRows({
    spreadsheetId: cleanId,
    accessToken: params.accessToken,
  });

  if (!fetched.ok) {
    return {
      ok: false,
      savedSlideCount: 0,
      errorMessage: fetched.errorMessage || 'Không thể đọc cấu trúc Google Sheet CSDL.',
    };
  }

  params.onProgress?.(
    `Đang phân mảnh Base64 (tối đa 6 chunk <= 45.000 ký tự/ô) cho ${params.slides.length} trang Ảnh WebP (${lessonKey})...`
  );

  const plan = buildSheetUpdatePlanForLesson({
    existingIndexRows: fetched.indexRows,
    existingPageRows: fetched.pageRows,
    lessonKey,
    grade: params.grade,
    period: params.period,
    lessonTitle: params.lessonTitle,
    fileName: params.fileName,
    slides: params.slides,
    teacherEmail: params.teacherEmail,
  });

  // Xóa vùng dữ liệu cũ trước khi ghi mới để tránh dư dòng thừa khi số trang PDF thay đổi
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      cleanId
    )}/values:batchClear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ranges: [
          `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I500`,
          `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1:N3000`,
        ],
      }),
    }
  );

  params.onProgress?.(
    `Đang đẩy ${params.slides.length} dòng Ảnh Slide WebP lên bảng ${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME} & ${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}...`
  );

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      cleanId
    )}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: [
          {
            range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1`,
            values: plan.nextIndexValues,
          },
          {
            range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1`,
            values: plan.nextPageValues,
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    return {
      ok: false,
      savedSlideCount: 0,
      errorMessage:
        errData?.error?.message || `Không thể ghi dữ liệu vào Google Sheet (HTTP ${updateRes.status}).`,
    };
  }

  const allLessonsIndex: GoogleSheetSlideIndexRecord[] = [];
  for (const row of plan.nextIndexValues.slice(1)) {
    const parsed = deserializeSheetIndexRow(row);
    if (parsed) allLessonsIndex.push(parsed);
  }

  return {
    ok: true,
    savedSlideCount: params.slides.length,
    updatedIndexRecord: plan.newIndexRecord,
    allLessonsIndex,
  };
}

export const savePdfSlideDeckToGoogleSheet = pushPdfSlideDeckToCsdlSheet;

/**
 * Đẩy tự động hàng loạt nhiều tiết học (`lessons`) lên tệp Google Sheet `CSDL` trong 1 lần gọi API duy nhất
 * mà giáo viên không cần thực hiện thao tác xác nhận thủ công từng tiết.
 */
export async function batchPushMultipleLessonDecksToCsdlSheet(params: {
  spreadsheetId: string;
  accessToken: string;
  lessons: Array<{
    grade: 6 | 7 | 8 | 9;
    period: number;
    lessonTitle: string;
    fileName: string;
    slides: ManagedLectureSlidePage[];
  }>;
  teacherEmail?: string;
  onProgress?: (statusText: string) => void;
}): Promise<{
  ok: boolean;
  savedLessonCount: number;
  savedSlideCount: number;
  allLessonsIndex?: GoogleSheetSlideIndexRecord[];
  errorMessage?: string;
}> {
  const cleanId = extractSpreadsheetIdFromInput(params.spreadsheetId);
  if (!cleanId) {
    return {
      ok: false,
      savedLessonCount: 0,
      savedSlideCount: 0,
      errorMessage: 'Chưa có Spreadsheet ID của tệp Google Sheet CSDL.',
    };
  }
  if (!params.accessToken) {
    return {
      ok: false,
      savedLessonCount: 0,
      savedSlideCount: 0,
      errorMessage: 'Cần đăng nhập Google để tự động đẩy Slide lên Google Sheet CSDL.',
    };
  }
  if (!Array.isArray(params.lessons) || params.lessons.length === 0) {
    return { ok: true, savedLessonCount: 0, savedSlideCount: 0, allLessonsIndex: [] };
  }

  params.onProgress?.(
    `Đang đồng bộ tự động ${params.lessons.length} tiết học lên bảng ${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME} & ${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}...`
  );

  const fetched = await fetchSheetDatabaseRows({
    spreadsheetId: cleanId,
    accessToken: params.accessToken,
  });

  if (!fetched.ok) {
    return {
      ok: false,
      savedLessonCount: 0,
      savedSlideCount: 0,
      errorMessage: fetched.errorMessage || 'Không thể đọc cấu trúc Google Sheet CSDL.',
    };
  }

  let runningIndexRows: any[][] = fetched.indexRows;
  let runningPageRows: any[][] = fetched.pageRows;
  let totalSlidesSaved = 0;

  for (const item of params.lessons) {
    if (!Array.isArray(item.slides) || item.slides.length === 0) continue;
    const lessonKey = `k${item.grade}-tiet-${item.period}`;
    const plan = buildSheetUpdatePlanForLesson({
      existingIndexRows: runningIndexRows,
      existingPageRows: runningPageRows,
      lessonKey,
      grade: item.grade,
      period: item.period,
      lessonTitle: item.lessonTitle,
      fileName: item.fileName,
      slides: item.slides,
      teacherEmail: params.teacherEmail,
    });
    runningIndexRows = plan.nextIndexValues;
    runningPageRows = plan.nextPageValues;
    totalSlidesSaved += item.slides.length;
  }

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      cleanId
    )}/values:batchClear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ranges: [
          `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1:I1000`,
          `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1:N5000`,
        ],
      }),
    }
  );

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      cleanId
    )}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: [
          {
            range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_SHEET_NAME}!A1`,
            values: runningIndexRows,
          },
          {
            range: `${GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_SHEET_NAME}!A1`,
            values: runningPageRows,
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    return {
      ok: false,
      savedLessonCount: 0,
      savedSlideCount: 0,
      errorMessage:
        errData?.error?.message ||
        `Không thể ghi dữ liệu hàng loạt vào Google Sheet (HTTP ${updateRes.status}).`,
    };
  }

  const allLessonsIndex: GoogleSheetSlideIndexRecord[] = [];
  for (const row of runningIndexRows.slice(1)) {
    const parsed = deserializeSheetIndexRow(row);
    if (parsed) allLessonsIndex.push(parsed);
  }

  return {
    ok: true,
    savedLessonCount: params.lessons.length,
    savedSlideCount: totalSlidesSaved,
    allLessonsIndex,
  };
}

/**
 * Truy vấn tệp Google Sheet `CSDL` cho tiết học `(grade, period)` (`lessonKey`):
 * - Nếu có dữ liệu ảnh trong `Slides_Pages` -> ghép 6 chunk Base64 và trả về bộ Slide hoàn chỉnh.
 * - Nếu chưa có dữ liệu -> trả về `foundInSheet: false`, `isBlankSlide: true` (Trang Slide trắng).
 */
export async function loadLessonSlideDeckFromGoogleSheet(params: {
  spreadsheetId: string;
  accessToken?: string | null;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle?: string;
}): Promise<{
  ok: boolean;
  foundInSheet: boolean;
  isBlankSlide: boolean;
  slideCount: number;
  statusMessage: string;
  deck: any;
  allLessonsIndex: GoogleSheetSlideIndexRecord[];
  errorMessage?: string;
}> {
  const cleanId = extractSpreadsheetIdFromInput(params.spreadsheetId);
  const fetched = await fetchSheetDatabaseRows({
    spreadsheetId: cleanId,
    accessToken: params.accessToken,
  });

  if (!fetched.ok) {
    const blankDeck = buildBlankSlideDeckForEmptySheetLesson({
      grade: params.grade,
      period: params.period,
      lessonTitle: params.lessonTitle,
      spreadsheetId: cleanId,
    });
    return {
      ok: false,
      foundInSheet: false,
      isBlankSlide: true,
      slideCount: 0,
      statusMessage:
        fetched.errorMessage ||
        `⬜ Chưa thể đọc dữ liệu từ Google Sheet "CSDL" — Đang hiển thị Trang Slide trắng.`,
      deck: blankDeck,
      allLessonsIndex: [],
      errorMessage: fetched.errorMessage,
    };
  }

  const allLessonsIndex: GoogleSheetSlideIndexRecord[] = [];
  for (const row of fetched.indexRows) {
    const rec = deserializeSheetIndexRow(row);
    if (rec) allLessonsIndex.push(rec);
  }

  const extracted = extractLessonSlideDeckFromSheetRows({
    grade: params.grade,
    period: params.period,
    lessonTitle: params.lessonTitle,
    spreadsheetId: cleanId,
    indexRows: fetched.indexRows,
    pageRows: fetched.pageRows,
  });

  return {
    ok: true,
    foundInSheet: extracted.foundInSheet,
    isBlankSlide: extracted.isBlankSlide,
    slideCount: extracted.slideCount,
    statusMessage: extracted.statusMessage,
    deck: extracted.deck,
    allLessonsIndex,
  };
}

/**
 * Đảm bảo môi trường trình duyệt không bị các polyfill `process` (như `@jspm/core` trên `/+esm`)
 * đánh lừa `pdf.js` nhận nhầm là môi trường Node.js và gọi `process.getBuiltinModule("module")`
 * gây lỗi `At.getBuiltinModule is not a function`.
 */
export function sanitizeBrowserProcessForPdfJs(): void {
  if (typeof globalThis === 'undefined') return;
  const g = globalThis as any;
  if (g.process && typeof g.process === 'object') {
    try {
      if (typeof g.process.getBuiltinModule !== 'function') {
        g.process.getBuiltinModule = () => ({
          createRequire: () => () => ({}),
          promises: { readFile: async () => new Uint8Array(0) },
        });
      }
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        try {
          Object.defineProperty(g.process, Symbol.toStringTag, {
            value: 'browser-process',
            configurable: true,
          });
        } catch {
          // ignore if non-configurable
        }
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Custom Browser DOM CanvasFactory truyền trực tiếp vào `pdfjsLib.getDocument` để bắt buộc `pdf.js`
 * luôn dùng `<canvas>` chuẩn của trình duyệt, tuyệt đối không bao giờ gọi `NodeCanvasFactory`
 * hay `process.getBuiltinModule("module")`.
 */
export class BrowserDomCanvasFactory {
  create(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    const context = canvas.getContext('2d');
    return { canvas, context };
  }

  reset(
    canvasAndContext: { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D | null },
    width: number,
    height: number
  ) {
    if (canvasAndContext?.canvas) {
      canvasAndContext.canvas.width = Math.max(1, Math.ceil(width));
      canvasAndContext.canvas.height = Math.max(1, Math.ceil(height));
    }
  }

  destroy(canvasAndContext: {
    canvas: HTMLCanvasElement | null;
    context: CanvasRenderingContext2D | null;
  }) {
    if (canvasAndContext?.canvas) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    }
  }
}

/**
 * Nạp thư viện `pdfjs-dist` (v3.11.174) một cách an toàn thông qua Worker Script riêng biệt (`/pdfjs/pdf.worker.min.js`),
 * loại bỏ hoàn toàn các lệnh gọi Node.js `process.getBuiltinModule` để tránh triệt để lỗi `At.getBuiltinModule is not a function`.
 */
export async function loadPdfJsEngine(): Promise<any> {
  sanitizeBrowserProcessForPdfJs();

  if (typeof window !== 'undefined' && (window as any).__cachedPdfJsLib) {
    return (window as any).__cachedPdfJsLib;
  }

  // Danh sách nguồn `pdfjs-dist` v3.11.174 chuẩn trình duyệt + Worker Script (0% phụ thuộc Node `getBuiltinModule`)
  const safeWorkerSources = [
    {
      libUrl: '/pdfjs/pdf.min.js',
      workerUrl: '/pdfjs/pdf.worker.min.js',
    },
    {
      libUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      workerUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    },
  ];

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    for (const source of safeWorkerSources) {
      try {
        const loadedLib = await new Promise<any>((resolve, reject) => {
          const existing = (window as any).pdfjsLib;
          if (existing && typeof existing.getDocument === 'function') {
            if (existing.GlobalWorkerOptions) {
              existing.GlobalWorkerOptions.workerSrc = source.workerUrl;
            }
            resolve(existing);
            return;
          }

          const script = document.createElement('script');
          script.src = source.libUrl;
          script.async = true;
          script.onload = () => {
            const lib = (window as any).pdfjsLib;
            if (lib && typeof lib.getDocument === 'function') {
              if (lib.GlobalWorkerOptions) {
                lib.GlobalWorkerOptions.workerSrc = source.workerUrl;
              }
              (window as any).__cachedPdfJsLib = lib;
              resolve(lib);
            } else {
              reject(new Error(`Không thể khởi tạo pdfjsLib từ ${source.libUrl}`));
            }
          };
          script.onerror = () =>
            reject(new Error(`Không thể tải script pdfjs-dist từ ${source.libUrl}`));
          document.head.appendChild(script);
        });

        if (loadedLib) {
          return loadedLib;
        }
      } catch {
        // Chuyển sang nguồn CDN dự phòng tiếp theo
      }
    }
  }

  throw new Error('Không thể khởi tạo thư viện pdfjs-dist và Worker Script trong trình duyệt.');
}

export interface PdfBatchAutoUploadProgress {
  phase: 'initializing' | 'converting_page' | 'chunking_page' | 'uploading_sheet' | 'completed';
  currentPage: number;
  totalPages: number;
  percent: number;
  fileName: string;
  chunkCount?: number;
  sizeKb?: number;
  statusText: string;
}

/**
 * Sử dụng thư viện `pdfjs-dist` thông qua Worker Script để chuyển đổi từng trang (batch process từng trang một)
 * của tệp PDF bài giảng thành mảng chuỗi Base64 (`image/webp` hoặc `image/png`) ở phía client,
 * tự động phân mảnh (`chunks`) tối đa 6 cột (`<= 45.000` ký tự/ô) trước khi đẩy lên Google Sheets `CSDL`.
 */
export async function convertPdfFileToHighResWebpSlides(params: {
  file: File;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  targetWidth?: number;
  webpQuality?: number;
  preferredFormat?: 'image/webp' | 'image/png';
  onProgress?: (currentPage: number, totalPages: number, statusText: string) => void;
  onBatchStep?: (progress: PdfBatchAutoUploadProgress) => void;
}): Promise<ConvertedPdfWebpSlide[]> {
  const {
    file,
    grade,
    period,
    lessonTitle,
    targetWidth = 1440,
    webpQuality = 0.82,
    preferredFormat = 'image/webp',
    onProgress,
    onBatchStep,
  } = params;

  sanitizeBrowserProcessForPdfJs();
  const lessonKey = `k${grade}-tiet-${period}`;

  onBatchStep?.({
    phase: 'initializing',
    currentPage: 0,
    totalPages: 1,
    percent: 4,
    fileName: file.name,
    statusText: `Đang khởi tạo pdfjs-dist Worker Script để đọc tệp PDF "${file.name}"...`,
  });

  const pdfjsLib = await loadPdfJsEngine();
  const arrayBuffer = await file.arrayBuffer();

  let pdf: any;
  try {
    // Ưu tiên chạy thông qua Worker Script (`pdf.worker.min.js`) để tối ưu hiệu năng và tách biệt luồng
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      canvasFactory: new BrowserDomCanvasFactory(),
      isEvalSupported: false,
      useSystemFonts: true,
    });
    pdf = await loadingTask.promise;
  } catch {
    // Fallback an toàn nếu trình duyệt giới hạn Web Worker cục bộ
    const fallbackTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      canvasFactory: new BrowserDomCanvasFactory(),
      disableWorker: true,
      isEvalSupported: false,
      disableFontFace: true,
      useSystemFonts: true,
    });
    pdf = await fallbackTask.promise;
  }

  const totalPages: number = pdf.numPages;

  const convertedSlides: ConvertedPdfWebpSlide[] = [];
  const maxAllowedChars =
    GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_CHARS_PER_CELL *
      GOOGLE_SHEETS_SLIDE_DB_SCHEMA.MAX_IMAGE_CHUNKS -
    2000; // 268,000 chars safety ceiling (<= 6 chunks * 45,000 chars)

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const convertPercent = Math.max(
      6,
      Math.min(82, Math.round(((pageNum - 0.5) / Math.max(1, totalPages)) * 80))
    );
    const convertMsg = `[Batch ${pageNum}/${totalPages}] Worker pdfjs-dist đang kết xuất trang ${pageNum}/${totalPages} ("${file.name}") sang Base64...`;
    onProgress?.(pageNum, totalPages, convertMsg);
    onBatchStep?.({
      phase: 'converting_page',
      currentPage: pageNum,
      totalPages,
      percent: convertPercent,
      fileName: file.name,
      statusText: convertMsg,
    });

    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2.2, Math.max(1.2, targetWidth / Math.max(1, baseViewport.width)));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    let dataUrl = '';
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
        canvasFactory: new BrowserDomCanvasFactory(),
      } as any).promise;

      if (preferredFormat === 'image/png') {
        dataUrl = canvas.toDataURL('image/png');
        if (dataUrl.length > maxAllowedChars) {
          dataUrl = canvas.toDataURL('image/webp', webpQuality);
        }
      } else {
        dataUrl = canvas.toDataURL('image/webp', webpQuality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/png');
        }
      }

      // Nếu chuỗi Base64 của trang vượt ngưỡng 6 chunk (268.000 ký tự), tự động nén nhẹ WebP/JPEG để đảm bảo 100% vừa 6 cột
      let q = webpQuality - 0.12;
      while (dataUrl.length > maxAllowedChars && q >= 0.48) {
        dataUrl = canvas.toDataURL('image/webp', q);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', q);
        }
        q -= 0.1;
      }
    }

    let extractedText = '';
    try {
      const textContent = await page.getTextContent();
      extractedText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim();
    } catch {
      extractedText = '';
    }

    // Tự động phân mảnh chuỗi Base64 thành tối đa 6 chunks (<= 45.000 ký tự/ô) trước khi gửi tới Google Sheets
    const chunks = splitBase64IntoSheetChunks(dataUrl);
    const activeChunks = chunks.filter((c) => c.length > 0).length;
    const sizeKb = Math.max(1, Math.round((dataUrl.length * 0.75) / 1024));

    const chunkPercent = Math.max(
      8,
      Math.min(85, Math.round((pageNum / Math.max(1, totalPages)) * 82))
    );
    const chunkMsg = `[Batch ${pageNum}/${totalPages}] Đã chuyển trang ${pageNum}/${totalPages} sang Base64 (${sizeKb} KB) & phân mảnh tự động ${activeChunks}/6 chunks (<= 45.000 ký tự/ô)...`;
    onProgress?.(pageNum, totalPages, chunkMsg);
    onBatchStep?.({
      phase: 'chunking_page',
      currentPage: pageNum,
      totalPages,
      percent: chunkPercent,
      fileName: file.name,
      chunkCount: activeChunks,
      sizeKb,
      statusText: chunkMsg,
    });

    convertedSlides.push({
      slideNumber: pageNum,
      totalSlides: totalPages,
      title: `Slide ${pageNum}/${totalPages}: Tiết ${period} — ${lessonTitle}`,
      subtitle: `Khối ${grade} • Tiết ${period} • Nguồn: ${file.name} (Trang ${pageNum}/${totalPages})`,
      bulletPoints: extractedText
        ? [extractedText.slice(0, 180)]
        : [`Trang Slide #${pageNum} kết xuất WebP từ tệp PDF ${file.name}`],
      highlightNote: `🖼️ Ảnh Slide #${pageNum}/${totalPages} (${canvas.width}×${canvas.height}px • ${sizeKb} KB • ${activeChunks}/6 chunk) trên Google Sheet CSDL (${lessonKey})`,
      extractedText,
      imageUrl: dataUrl,
      width: canvas.width,
      height: canvas.height,
      sizeKb,
      chunkCount: activeChunks,
      chunks,
    });

    // Nhường luồng ngắn để thanh tiến trình (progress bar) cập nhật mượt mà từng trang một trên UI
    await new Promise((resolve) => setTimeout(resolve, 12));
  }

  return convertedSlides;
}

/**
 * Luồng Batch Process Tự Động (Zero-Preview / Zero-Click):
 * Khi giáo viên chọn tệp PDF, hàm này thực hiện tuần tự từng trang một (`1..N`):
 * 1) Chuyển đổi từng trang PDF thành chuỗi Base64 (`WebP`/`PNG`) qua `pdfjs-dist` Worker Script (không bị lỗi `At.getBuiltinModule`).
 * 2) Tự động phân mảnh (`splitBase64IntoSheetChunks`) thành tối đa 6 chunks (`imgChunk1 -> imgChunk6`, `<= 45.000` ký tự/ô).
 * 3) Đẩy thẳng dữ liệu toàn bộ các trang đã phân mảnh lên Google Sheets `CSDL` (`Slides_Index` & `Slides_Pages`)
 *    mà không cần hiển thị xem trước thủ công cho từng trang, đồng thời phát sự kiện `onProgress` liên tục cho thanh Progress Bar.
 */
export async function batchConvertAndUploadPdfPagesToGoogleSheet(params: {
  file: File;
  grade: 6 | 7 | 8 | 9;
  period: number;
  lessonTitle: string;
  spreadsheetId?: string;
  accessToken?: string | null;
  teacherEmail?: string;
  targetWidth?: number;
  webpQuality?: number;
  onProgress?: (progress: PdfBatchAutoUploadProgress) => void;
}): Promise<{
  ok: boolean;
  uploadedToSheet: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  spreadsheetTitle?: string;
  slides: ConvertedPdfWebpSlide[];
  allLessonsIndex?: GoogleSheetSlideIndexRecord[];
  updatedIndexRecord?: GoogleSheetSlideIndexRecord;
  errorMessage?: string;
}> {
  const {
    file,
    grade,
    period,
    lessonTitle,
    spreadsheetId,
    accessToken,
    teacherEmail,
    targetWidth = 1440,
    webpQuality = 0.82,
    onProgress,
  } = params;

  // Bước 1: Batch process từng trang PDF -> Base64 -> tự động chia <= 6 chunks qua Worker Script
  const convertedSlides = await convertPdfFileToHighResWebpSlides({
    file,
    grade,
    period,
    lessonTitle,
    targetWidth,
    webpQuality,
    onBatchStep: (step) => onProgress?.(step),
  });

  if (convertedSlides.length === 0) {
    return {
      ok: false,
      uploadedToSheet: false,
      slides: [],
      errorMessage: `Không tìm thấy trang nào trong tệp PDF "${file.name}".`,
    };
  }

  const totalPages = convertedSlides.length;

  // Bước 2: Nếu có accessToken, tự động khởi tạo Sheet "CSDL" (nếu chưa có) và đẩy thẳng toàn bộ chunks lên Google Sheets
  if (!accessToken) {
    onProgress?.({
      phase: 'completed',
      currentPage: totalPages,
      totalPages,
      percent: 100,
      fileName: file.name,
      statusText: `Đã chuyển đổi & phân mảnh tự động ${totalPages} trang PDF "${file.name}". Đăng nhập Google để đẩy thẳng lên Sheet "CSDL".`,
    });
    return {
      ok: true,
      uploadedToSheet: false,
      slides: convertedSlides,
    };
  }

  let activeSpreadsheetId = extractSpreadsheetIdFromInput(spreadsheetId || '');
  let activeSpreadsheetTitle = 'CSDL';

  if (!activeSpreadsheetId) {
    onProgress?.({
      phase: 'uploading_sheet',
      currentPage: totalPages,
      totalPages,
      percent: 88,
      fileName: file.name,
      statusText: `Đang tự động khởi tạo tệp Google Sheet "CSDL" trên Google Drive...`,
    });
    const created = await createCsdlSpreadsheetInDrive(accessToken, 'CSDL');
    if (!created.ok) {
      return {
        ok: false,
        uploadedToSheet: false,
        slides: convertedSlides,
        errorMessage: created.errorMessage,
      };
    }
    activeSpreadsheetId = created.spreadsheetId;
    activeSpreadsheetTitle = created.spreadsheetTitle;
  }

  onProgress?.({
    phase: 'uploading_sheet',
    currentPage: totalPages,
    totalPages,
    percent: 93,
    fileName: file.name,
    statusText: `Đang đẩy thẳng ${totalPages} trang Base64 đã phân mảnh (imgChunk1 → imgChunk6) lên Google Sheet "CSDL"...`,
  });

  const pushRes = await pushPdfSlideDeckToCsdlSheet({
    spreadsheetId: activeSpreadsheetId,
    accessToken,
    grade,
    period,
    lessonTitle,
    fileName: file.name,
    slides: convertedSlides,
    teacherEmail,
    onProgress: (msg) => {
      onProgress?.({
        phase: 'uploading_sheet',
        currentPage: totalPages,
        totalPages,
        percent: 96,
        fileName: file.name,
        statusText: msg,
      });
    },
  });

  if (!pushRes.ok) {
    return {
      ok: false,
      uploadedToSheet: false,
      spreadsheetId: activeSpreadsheetId,
      spreadsheetUrl: buildGoogleSheetUrlFromId(activeSpreadsheetId),
      spreadsheetTitle: activeSpreadsheetTitle,
      slides: convertedSlides,
      errorMessage: pushRes.errorMessage,
    };
  }

  onProgress?.({
    phase: 'completed',
    currentPage: totalPages,
    totalPages,
    percent: 100,
    fileName: file.name,
    statusText: `Hoàn tất 100%: Đã chuyển đổi & đẩy thẳng ${totalPages} trang PDF "${file.name}" lên Google Sheet "CSDL"!`,
  });

  return {
    ok: true,
    uploadedToSheet: true,
    spreadsheetId: activeSpreadsheetId,
    spreadsheetUrl: buildGoogleSheetUrlFromId(activeSpreadsheetId),
    spreadsheetTitle: activeSpreadsheetTitle,
    slides: convertedSlides,
    allLessonsIndex: pushRes.allLessonsIndex,
    updatedIndexRecord: pushRes.updatedIndexRecord,
  };
}

/**
 * Xử lý phím mũi tên (ArrowLeft, ArrowRight, PageUp, PageDown, Home, End) để chuyển nhanh
 * giữa các trang Slide trong khung Xem Trước (Preview) của Giáo viên.
 */
export function resolveSlidePreviewKeyNavigation(params: {
  key: string;
  currentIndex: number;
  totalSlides: number;
  isInputFocused?: boolean;
}): {
  handled: boolean;
  nextIndex: number;
  action: 'prev' | 'next' | 'first' | 'last' | 'none';
} {
  const { key, currentIndex, totalSlides, isInputFocused = false } = params;
  const safeTotal = Math.max(0, Math.floor(totalSlides));
  const safeCurrent =
    safeTotal > 0 ? Math.max(0, Math.min(Math.floor(currentIndex), safeTotal - 1)) : 0;

  if (isInputFocused || safeTotal <= 0) {
    return { handled: false, nextIndex: safeCurrent, action: 'none' };
  }

  if (key === 'ArrowLeft' || key === 'PageUp') {
    const nextIndex = Math.max(0, safeCurrent - 1);
    return { handled: true, nextIndex, action: 'prev' };
  }

  if (key === 'ArrowRight' || key === 'PageDown') {
    const nextIndex = Math.min(safeTotal - 1, safeCurrent + 1);
    return { handled: true, nextIndex, action: 'next' };
  }

  if (key === 'Home') {
    return { handled: true, nextIndex: 0, action: 'first' };
  }

  if (key === 'End') {
    return { handled: true, nextIndex: Math.max(0, safeTotal - 1), action: 'last' };
  }

  return { handled: false, nextIndex: safeCurrent, action: 'none' };
}



