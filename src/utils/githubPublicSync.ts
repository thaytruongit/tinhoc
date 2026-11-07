import {
  getSavedGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  type GoogleSheetsConnectionConfig,
  type GoogleSheetSlideIndexRecord,
} from './googleSheetsConnector';

export const GITHUB_PUBLIC_SNAPSHOT_STORAGE_KEY = 'cloudplay_github_public_snapshot_v1';
export const GITHUB_PUBLIC_SNAPSHOT_STATIC_PATH = './data/github-public-db-snapshot.json';

export interface GitHubPublicSlideDeckSummary {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  fileName: string;
  slideCount: number;
  totalCompressedKb: number;
  sourceSpreadsheetId?: string;
  updatedAt?: string;
  hasRealPdfPages: boolean;
  /** Lưu tối đa các trang slide nhẹ hoặc chỉ mục trang để khởi tạo tức thì trên GitHub Pages */
  slidesPreview?: Array<{
    slideNumber: number;
    totalSlides: number;
    title: string;
    subtitle?: string;
    bulletPoints?: string[];
    highlightNote?: string;
    imageUrl?: string;
    sizeKb?: number;
    chunkCount?: number;
  }>;
}

export interface GitHubPublicDataSnapshot {
  schemaVersion: '2.0.0';
  appTitle: string;
  syncedAtIso: string;
  prioritizeGitHubPublic: boolean;
  googleSheetsCsdlConfig: GoogleSheetsConnectionConfig | null;
  sheetLessonsIndex: GoogleSheetSlideIndexRecord[];
  activeLiveLesson: {
    classId: string;
    grade: 6 | 7 | 8 | 9;
    period: number;
    lessonKey: string;
    currentSlideNumber: number;
    totalSlides: number;
    slideViewMode: string;
    isBroadcasting: boolean;
  };
  slideDecksSummaryByLesson: Record<string, GitHubPublicSlideDeckSummary>;
  taughtPeriodsByClass?: Record<string, number[]>;
  classesCount: number;
  studentsCount: number;
  classes?: any[];
  students?: any[];
}

/**
 * Xây dựng gói dữ liệu chuẩn hóa (`GitHubPublicDataSnapshot`) để ưu tiên đồng bộ & public lên GitHub / GitHub Pages.
 * Tuyệt đối KHÔNG chứa OAuth access token hoặc thông tin nhạy cảm.
 */
export function buildGitHubPublicDataSnapshot(params: {
  googleSheetsConfig?: GoogleSheetsConnectionConfig | null;
  sheetLessonsIndex?: GoogleSheetSlideIndexRecord[];
  liveSession?: any;
  classes?: any[];
  students?: any[];
  taughtPeriodsByClass?: Record<string, number[]>;
  includeSlideImages?: boolean;
}): GitHubPublicDataSnapshot {
  const rawCfg = params.googleSheetsConfig ?? getSavedGoogleSheetsConfig();
  const safeSheetConfig: GoogleSheetsConnectionConfig | null =
    rawCfg && rawCfg.spreadsheetId
      ? {
          spreadsheetId: String(rawCfg.spreadsheetId).trim(),
          spreadsheetUrl:
            rawCfg.spreadsheetUrl ||
            `https://docs.google.com/spreadsheets/d/${String(rawCfg.spreadsheetId).trim()}/edit`,
          spreadsheetTitle: rawCfg.spreadsheetTitle || 'CSDL',
          connectedAtIso: rawCfg.connectedAtIso || new Date().toISOString(),
          lastSyncedAtIso: new Date().toISOString(),
        }
      : null;

  const live = params.liveSession || {};
  const rawGrade = Number(live.grade);
  const grade: 6 | 7 | 8 | 9 =
    rawGrade === 6 || rawGrade === 7 || rawGrade === 8 || rawGrade === 9 ? rawGrade : 6;
  const period = Math.max(1, Math.min(29, Number(live.period) || 1));
  const lessonKey = `k${grade}-tiet-${period}`;

  const rawDecks =
    live.lectureSlidesByLesson && typeof live.lectureSlidesByLesson === 'object'
      ? live.lectureSlidesByLesson
      : {};

  const slideDecksSummaryByLesson: Record<string, GitHubPublicSlideDeckSummary> = {};
  const derivedIndexMap = new Map<string, GoogleSheetSlideIndexRecord>();

  if (Array.isArray(params.sheetLessonsIndex)) {
    for (const item of params.sheetLessonsIndex) {
      if (item && item.lessonKey) {
        derivedIndexMap.set(item.lessonKey, {
          lessonKey: item.lessonKey,
          grade: item.grade,
          period: item.period,
          lessonTitle: item.lessonTitle || `Tiết ${item.period}`,
          fileName: item.fileName || `BaiGiang_Tin${item.grade}_Tiet${item.period}.pdf`,
          slideCount: Number(item.slideCount) || 1,
          totalSizeKb: Number(item.totalSizeKb) || 0,
          updatedAtIso: item.updatedAtIso || new Date().toISOString(),
          teacherEmail: item.teacherEmail || '',
        });
      }
    }
  }

  for (const [key, deckVal] of Object.entries(rawDecks)) {
    const deck = deckVal as any;
    if (!deck || typeof deck !== 'object') continue;
    const slides = Array.isArray(deck.slides) ? deck.slides : [];
    if (slides.length === 0) continue;

    const isBlank = Boolean(deck.isBlankSlideDeck);
    const hasReal = Boolean(deck.hasRealPdfPages) && !isBlank;
    const deckGradeRaw = Number(deck.grade);
    const deckGrade: 6 | 7 | 8 | 9 =
      deckGradeRaw === 6 || deckGradeRaw === 7 || deckGradeRaw === 8 || deckGradeRaw === 9
        ? deckGradeRaw
        : grade;
    const deckPeriod = Math.max(1, Math.min(29, Number(deck.period) || period));

    slideDecksSummaryByLesson[key] = {
      lessonKey: key,
      grade: deckGrade,
      period: deckPeriod,
      fileName: String(deck.fileName || `BaiGiang_Tin${deckGrade}_Tiet${deckPeriod}.pdf`),
      slideCount: slides.length,
      totalCompressedKb: Number(deck.totalCompressedKb) || slides.length * 42,
      sourceSpreadsheetId: deck.sourceSpreadsheetId || safeSheetConfig?.spreadsheetId,
      updatedAt: deck.uploadedAt || new Date().toISOString(),
      hasRealPdfPages: hasReal,
      slidesPreview: slides.map((s: any, idx: number) => ({
        slideNumber: Number(s.slideNumber) || idx + 1,
        totalSlides: slides.length,
        title: String(s.title || `Slide #${idx + 1}`),
        subtitle: s.subtitle ? String(s.subtitle) : undefined,
        bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
        highlightNote: s.highlightNote ? String(s.highlightNote) : undefined,
        imageUrl:
          params.includeSlideImages !== false &&
          typeof s.imageUrl === 'string' &&
          s.imageUrl.length <= 260000
            ? s.imageUrl
            : undefined,
        sizeKb: Number(s.sizeKb) || 0,
        chunkCount: Number(s.chunkCount) || 1,
      })),
    };

    if (hasReal && !derivedIndexMap.has(key)) {
      derivedIndexMap.set(key, {
        lessonKey: key,
        grade: deckGrade,
        period: deckPeriod,
        lessonTitle: String(slides[0]?.subtitle || slides[0]?.title || `Tiết ${deckPeriod}`),
        fileName: String(deck.fileName || `BaiGiang_Tin${deckGrade}_Tiet${deckPeriod}.pdf`),
        slideCount: slides.length,
        totalSizeKb: Number(deck.totalCompressedKb) || slides.length * 42,
        updatedAtIso: new Date().toISOString(),
        teacherEmail: '',
      });
    }
  }

  const sheetLessonsIndex = Array.from(derivedIndexMap.values()).sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.period - b.period;
  });

  const classesList = Array.isArray(params.classes) ? params.classes : [];
  const studentsList = Array.isArray(params.students) ? params.students : [];

  return {
    schemaVersion: '2.0.0',
    appTitle: 'CloudPlay Interactive Learning — Tin Học GDPT 2018 (Khối 6-9)',
    syncedAtIso: new Date().toISOString(),
    prioritizeGitHubPublic: true,
    googleSheetsCsdlConfig: safeSheetConfig,
    sheetLessonsIndex,
    activeLiveLesson: {
      classId: String(live.classId || '6A10'),
      grade,
      period,
      lessonKey,
      currentSlideNumber: Math.max(1, Number(live.currentSlideNumber) || 1),
      totalSlides: Math.max(1, Number(live.totalSlides) || 15),
      slideViewMode: String(live.slideViewMode || 'LARGE_16_9'),
      isBroadcasting: Boolean(live.isBroadcasting ?? true),
    },
    slideDecksSummaryByLesson,
    taughtPeriodsByClass: params.taughtPeriodsByClass || {},
    classesCount: classesList.length,
    studentsCount: studentsList.length,
    classes: classesList,
    students: studentsList,
  };
}

/**
 * Hợp nhất dữ liệu từ `GitHubPublicDataSnapshot` vào `liveSession` để đảm bảo
 * Phòng Live (`TeacherLivePresenterRoom` & `StudentLiveRoom`) và CSDL Sheet luôn đồng bộ 100%.
 */
export function mergeGitHubPublicSnapshotIntoLiveSession(
  currentLiveSession: any,
  snapshot: GitHubPublicDataSnapshot | null | undefined
): any {
  if (!snapshot || !currentLiveSession) return currentLiveSession;

  const existingDecks =
    currentLiveSession.lectureSlidesByLesson &&
    typeof currentLiveSession.lectureSlidesByLesson === 'object'
      ? { ...currentLiveSession.lectureSlidesByLesson }
      : {};

  if (
    snapshot.slideDecksSummaryByLesson &&
    typeof snapshot.slideDecksSummaryByLesson === 'object'
  ) {
    for (const [lessonKey, summary] of Object.entries(snapshot.slideDecksSummaryByLesson)) {
      const currentDeck = existingDecks[lessonKey];
      const currentHasRealPages =
        currentDeck &&
        Boolean(currentDeck.hasRealPdfPages) &&
        !currentDeck.isBlankSlideDeck &&
        Array.isArray(currentDeck.slides) &&
        currentDeck.slides.length > 0;

      // Chỉ bổ sung từ snapshot nếu tiết học chưa có bộ Slide thực trong bộ nhớ hiện tại
      if (
        !currentHasRealPages &&
        summary &&
        summary.hasRealPdfPages &&
        Array.isArray(summary.slidesPreview) &&
        summary.slidesPreview.length > 0 &&
        summary.slidesPreview.some((s) => Boolean(s.imageUrl))
      ) {
        existingDecks[lessonKey] = {
          lessonKey,
          grade: summary.grade,
          period: summary.period,
          fileName: summary.fileName,
          fileType: 'pdf',
          fileSize: `${summary.totalCompressedKb} KB`,
          fileSizeLabel: `Đã đồng bộ từ GitHub Public & Google Sheet CSDL (${lessonKey})`,
          uploadedAt: summary.updatedAt || new Date().toLocaleTimeString('vi-VN'),
          storageBucket: 'slide-storage-1gb',
          totalCompressedKb: summary.totalCompressedKb,
          isUserUploaded: true,
          hasRealPdfPages: true,
          isBlankSlideDeck: false,
          isLazyLoaded: true,
          sourceSpreadsheetId:
            summary.sourceSpreadsheetId || snapshot.googleSheetsCsdlConfig?.spreadsheetId,
          slides: summary.slidesPreview.map((s, idx) => ({
            slideNumber: s.slideNumber || idx + 1,
            totalSlides: summary.slidesPreview?.length || summary.slideCount,
            title: s.title || `Slide #${idx + 1}`,
            subtitle: s.subtitle,
            bulletPoints: s.bulletPoints || [],
            highlightNote: s.highlightNote,
            imageUrl: s.imageUrl,
            sizeKb: s.sizeKb,
            chunkCount: s.chunkCount,
          })),
        };
      }
    }
  }

  return {
    ...currentLiveSession,
    googleSheetsCsdlConfig:
      snapshot.googleSheetsCsdlConfig || currentLiveSession.googleSheetsCsdlConfig || undefined,
    googleSheetsSlideIndex:
      Array.isArray(snapshot.sheetLessonsIndex) && snapshot.sheetLessonsIndex.length > 0
        ? snapshot.sheetLessonsIndex
        : currentLiveSession.googleSheetsSlideIndex || [],
    lectureSlidesByLesson: existingDecks,
  };
}

export function getSavedGitHubPublicSnapshot(): GitHubPublicDataSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GITHUB_PUBLIC_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.schemaVersion === '2.0.0') {
      return parsed as GitHubPublicDataSnapshot;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Tải gói dữ liệu `public/data/github-public-db-snapshot.json` khi chạy trên GitHub Pages (Static Hosting)
 * hoặc trình duyệt mới chưa có dữ liệu localStorage.
 */
export async function loadGitHubPublicSnapshotFromStaticUrl(): Promise<GitHubPublicDataSnapshot | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
  const candidateUrls = [
    './data/github-public-db-snapshot.json',
    '/data/github-public-db-snapshot.json',
    '/api/github/sync-snapshot',
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      const snapshot = data?.snapshot || data;
      if (snapshot && snapshot.schemaVersion === '2.0.0') {
        if (snapshot.googleSheetsCsdlConfig?.spreadsheetId && !getSavedGoogleSheetsConfig()) {
          saveGoogleSheetsConfig(snapshot.googleSheetsCsdlConfig);
        }
        return snapshot as GitHubPublicDataSnapshot;
      }
    } catch {
      // try next candidate
    }
  }
  return getSavedGitHubPublicSnapshot();
}

/**
 * Đồng bộ toàn bộ dữ liệu hiện tại (CSDL Google Sheets + Slide Phòng Live + Lớp học/Học sinh)
 * để ưu tiên public lên GitHub (`public/data/github-public-db-snapshot.json`, `docs/data/`, `gh-pages-dist/data/`).
 */
export async function syncAllDataForGitHubPublic(params: {
  googleSheetsConfig?: GoogleSheetsConnectionConfig | null;
  sheetLessonsIndex?: GoogleSheetSlideIndexRecord[];
  liveSession?: any;
  classes?: any[];
  students?: any[];
  taughtPeriodsByClass?: Record<string, number[]>;
}): Promise<{
  ok: boolean;
  persistedToRepoFiles: boolean;
  snapshot: GitHubPublicDataSnapshot;
  statusMessage: string;
}> {
  const snapshot = buildGitHubPublicDataSnapshot({
    ...params,
    includeSlideImages: true,
  });

  if (snapshot.googleSheetsCsdlConfig?.spreadsheetId) {
    saveGoogleSheetsConfig(snapshot.googleSheetsCsdlConfig);
  }

  if (typeof window !== 'undefined') {
    try {
      // Lưu bản gọn vào localStorage để tránh vượt quota trình duyệt
      const compactSnapshot = buildGitHubPublicDataSnapshot({
        ...params,
        includeSlideImages: false,
      });
      window.localStorage.setItem(
        GITHUB_PUBLIC_SNAPSHOT_STORAGE_KEY,
        JSON.stringify(compactSnapshot)
      );
    } catch {
      // ignore storage quota warning
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('cloudplay_realtime_sync');
        bc.postMessage({
          type: 'GITHUB_PUBLIC_SNAPSHOT_SYNCED',
          snapshot,
          timestamp: Date.now(),
        });
        bc.close();
      }
    } catch {
      // ignore BroadcastChannel error
    }
  }

  let persistedToRepoFiles = false;
  if (typeof fetch !== 'undefined') {
    try {
      const response = await fetch('/api/github/sync-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot }),
      });
      if (response.ok) {
        const resJson = await response.json();
        persistedToRepoFiles = Boolean(resJson?.ok);
      }
    } catch {
      // Đang chạy trên GitHub Pages tĩnh (không có backend Node) -> dùng cơ chế tải file JSON hoặc đồng bộ Google Sheet CSDL
    }
  }

  const sheetCount = snapshot.sheetLessonsIndex.length;
  const deckCount = Object.keys(snapshot.slideDecksSummaryByLesson).length;
  const sheetLabel = snapshot.googleSheetsCsdlConfig?.spreadsheetId
    ? `Google Sheet "${snapshot.googleSheetsCsdlConfig.spreadsheetTitle || 'CSDL'}" (${snapshot.googleSheetsCsdlConfig.spreadsheetId.slice(0, 8)}...)`
    : 'Chưa gắn ID Google Sheet';

  const statusMessage = persistedToRepoFiles
    ? `🚀 Đã đồng bộ toàn bộ dữ liệu (${deckCount} bộ Slide Phòng Live, ${sheetCount} tiết trên ${sheetLabel}) vào gói chuẩn GitHub Public (public/data, docs/data & gh-pages-dist/data) — Sẵn sàng Commit/Push lên GitHub!`
    : `✅ Đã đồng bộ dữ liệu CSDL Sheet & Slide Phòng Live (${deckCount} bộ Slide, ${sheetCount} tiết trên ${sheetLabel}) chuẩn GitHub Pages!`;

  return {
    ok: true,
    persistedToRepoFiles,
    snapshot,
    statusMessage,
  };
}

/**
 * Cho phép giáo viên tải trực tiếp tệp `github-public-db-snapshot.json` về máy nếu muốn commit thủ công lên GitHub.
 */
export function downloadGitHubPublicSnapshotJson(snapshot: GitHubPublicDataSnapshot): void {
  if (typeof document === 'undefined') return;
  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'github-public-db-snapshot.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
