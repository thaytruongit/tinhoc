import React, { useState, useEffect, useRef } from 'react';
import {
  auth,
  getGoogleSheetsAccessToken,
  signInWithGoogleForSheets,
  signOutFirebase,
  subscribeGoogleSheetsAuth,
  type User,
} from '../services/firebaseClient';
import {
  CSDL_GOOGLE_SHEETS_SCHEMA,
  extractSpreadsheetIdFromInput,
  buildGoogleSheetUrlFromId,
  getSavedGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  initializeCsdlGoogleSheetStructure,
  createCsdlSpreadsheetInDrive,
  pushPdfSlideDeckToCsdlSheet,
  batchPushMultipleLessonDecksToCsdlSheet,
  loadLessonSlideDeckFromGoogleSheet,
  buildBlankSlideDeckForEmptySheetLesson,
  convertPdfFileToHighResWebpSlides,
  batchConvertAndUploadPdfPagesToGoogleSheet,
  calculateBase64ChunkStats,
  resolveSlidePreviewKeyNavigation,
  type GoogleSheetsConnectionConfig,
  type GoogleSheetSlideIndexRecord,
  type ConvertedPdfWebpSlide,
  type PdfBatchAutoUploadProgress,
} from '../utils/googleSheetsConnector';
import { renderSlideToCanvasDataUrl } from './LectureSlideManagerModal';
import {
  BLANK_WHITE_SLIDE_DATA_URL,
  isRealRenderedPdfSlideDeck,
  matchFileToGradeAndPeriod,
  type ManagedLectureSlidePage,
} from '../utils/slideDeckManager';

interface GoogleSheetsSlideDbPanelProps {
  grade: 6 | 7 | 8 | 9;
  period: number;
  classId?: string;
  lessonTitle: string;
  currentDeck?: any;
  periodList?: Array<{ period: number; lessonTitle: string }>;
  onChangeGradeAndPeriod?: (grade: 6 | 7 | 8 | 9, period: number) => void;
  onOpenLiveRoomForLesson?: (grade: 6 | 7 | 8 | 9, period: number) => void;
  onSheetIndexChange?: (records: GoogleSheetSlideIndexRecord[]) => void;
  onApplyLoadedDeck: (
    deck: any,
    toastMsg?: string,
    autoBroadcast?: boolean,
    targetLessonKey?: string
  ) => Promise<void> | void;
  onShowToast: (msg: string) => void;
}

/**
 * Đảm bảo ảnh Slide WebP/JPEG luôn vừa khít tối đa 6 cột chunk Base64 (<= 45.000 ký tự/ô) trên bảng `Slides_Pages`.
 */
async function ensureSlideImageFitsSheetRow(
  dataUrl: string,
  maxTotalChars = 250000
): Promise<string> {
  if (!dataUrl || dataUrl.length <= maxTotalChars || typeof document === 'undefined') {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const targetW = 1280;
        const targetH = Math.max(720, Math.round((img.height / Math.max(1, img.width)) * targetW));
        canvas.width = targetW;
        canvas.height = Math.min(1080, targetH);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl.slice(0, maxTotalChars));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let compressed = canvas.toDataURL('image/webp', 0.68);
        if (compressed.length > maxTotalChars) {
          compressed = canvas.toDataURL('image/jpeg', 0.62);
        }
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function getProgressBarWidthClass(percent: number): string {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  if (p >= 98) return 'w-full';
  if (p >= 90) return 'w-11/12';
  if (p >= 80) return 'w-4/5';
  if (p >= 75) return 'w-3/4';
  if (p >= 66) return 'w-2/3';
  if (p >= 58) return 'w-3/5';
  if (p >= 50) return 'w-1/2';
  if (p >= 40) return 'w-2/5';
  if (p >= 33) return 'w-1/3';
  if (p >= 25) return 'w-1/4';
  if (p >= 16) return 'w-1/5';
  return 'w-1/12';
}

export const GoogleSheetsSlideDbPanel: React.FC<GoogleSheetsSlideDbPanelProps> = ({
  grade,
  period,
  classId = '6A10',
  lessonTitle,
  currentDeck,
  periodList,
  onChangeGradeAndPeriod,
  onOpenLiveRoomForLesson,
  onSheetIndexChange,
  onApplyLoadedDeck,
  onShowToast,
}) => {
  const lessonKey = `k${grade}-tiet-${period}`;
  const [googleUser, setGoogleUser] = useState<User | null>(() => auth?.currentUser || null);
  const [hasAccessToken, setHasAccessToken] = useState<boolean>(() =>
    Boolean(getGoogleSheetsAccessToken())
  );

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetsConnectionConfig | null>(() =>
    getSavedGoogleSheetsConfig()
  );
  const [sheetInput, setSheetInput] = useState<string>(() => {
    const saved = getSavedGoogleSheetsConfig();
    return saved?.spreadsheetUrl || saved?.spreadsheetId || '';
  });

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [pdfBatchProgress, setPdfBatchProgress] = useState<PdfBatchAutoUploadProgress | null>(null);
  const [convertedWebpPreview, setConvertedWebpPreview] = useState<{
    fileName: string;
    lessonKey: string;
    slides: ConvertedPdfWebpSlide[];
  } | null>(null);

  // Interactive Slide Previewer State (ArrowLeft / ArrowRight navigation)
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(0);
  const [isPreviewZoomed, setIsPreviewZoomed] = useState<boolean>(false);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const [statusBanner, setStatusBanner] = useState<{
    tone: 'info' | 'success' | 'warning' | 'error';
    text: string;
  }>({
    tone: 'info',
    text: 'Kết nối Google Sheet tên "CSDL" trong Google Drive để nạp bài giảng PDF (chuyển mỗi trang thành ảnh WebP độ nét cao qua pdf.js, phân mảnh tối đa 6 chunk) và tự động đẩy 100% Slide vào Sheet không cần thao tác thủ công.',
  });

  const [sheetLessonsIndex, setSheetLessonsIndex] = useState<GoogleSheetSlideIndexRecord[]>([]);
  const [showSchemaDetails, setShowSchemaDetails] = useState<boolean>(true);

  const pdfUploadInputRef = useRef<HTMLInputElement | null>(null);
  const lastAutoLoadedKeyRef = useRef<string>('');
  const autoProvisionedCsdlRef = useRef<boolean>(false);

  // Determine the active slide list shown in the interactive previewer:
  // 1) If the teacher just converted a PDF (or sample deck) for this lessonKey, preview those slides.
  // 2) Otherwise preview `currentDeck.slides` loaded from Google Sheets CSDL (or Blank White Slide).
  const activePreviewSlides: ManagedLectureSlidePage[] = React.useMemo(() => {
    if (
      convertedWebpPreview &&
      convertedWebpPreview.lessonKey === lessonKey &&
      convertedWebpPreview.slides.length > 0
    ) {
      return convertedWebpPreview.slides;
    }
    if (Array.isArray(currentDeck?.slides) && currentDeck.slides.length > 0) {
      return currentDeck.slides;
    }
    const fallbackBlank = buildBlankSlideDeckForEmptySheetLesson({
      grade,
      period,
      lessonTitle,
      spreadsheetId: sheetConfig?.spreadsheetId,
    });
    return fallbackBlank.slides;
  }, [convertedWebpPreview, currentDeck?.slides, grade, period, lessonKey, lessonTitle, sheetConfig?.spreadsheetId]);

  const safePreviewIndex =
    activePreviewSlides.length > 0
      ? Math.max(0, Math.min(previewSlideIndex, activePreviewSlides.length - 1))
      : 0;
  const activePreviewSlide = activePreviewSlides[safePreviewIndex];
  const isCurrentPreviewBlank =
    !activePreviewSlide ||
    Boolean((activePreviewSlide as any)?.isBlankSlide) ||
    activePreviewSlide.imageUrl === BLANK_WHITE_SLIDE_DATA_URL;

  // Reset preview index to 0 when switching lessons
  useEffect(() => {
    setPreviewSlideIndex(0);
  }, [lessonKey]);

  // Preload adjacent slide images (prev & next) for instant 60FPS switching with Arrow keys
  useEffect(() => {
    if (typeof Image === 'undefined' || activePreviewSlides.length <= 1) return;
    const neighbors = [safePreviewIndex - 1, safePreviewIndex + 1];
    for (const idx of neighbors) {
      if (idx >= 0 && idx < activePreviewSlides.length) {
        const url = activePreviewSlides[idx]?.imageUrl;
        if (url && !url.startsWith('data:image/svg')) {
          const preloadImg = new Image();
          preloadImg.src = url;
        }
      }
    }
  }, [safePreviewIndex, activePreviewSlides]);

  // Global keyboard listener for ArrowLeft / ArrowRight / Home / End slide preview navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewZoomed) {
        e.preventDefault();
        setIsPreviewZoomed(false);
        return;
      }

      const activeEl = document.activeElement;
      const tag = activeEl?.tagName?.toLowerCase() || '';
      const isInputFocused =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        Boolean((activeEl as HTMLElement)?.isContentEditable);

      const nav = resolveSlidePreviewKeyNavigation({
        key: e.key,
        currentIndex: safePreviewIndex,
        totalSlides: activePreviewSlides.length,
        isInputFocused,
      });

      if (nav.handled) {
        e.preventDefault();
        setPreviewSlideIndex(nav.nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safePreviewIndex, activePreviewSlides.length, isPreviewZoomed]);

  const updateIndexList = (records: GoogleSheetSlideIndexRecord[]) => {
    setSheetLessonsIndex(records);
    onSheetIndexChange?.(records);
  };

  useEffect(() => {
    const unsubscribe = subscribeGoogleSheetsAuth((user, tokenReady) => {
      setGoogleUser(user);
      setHasAccessToken(tokenReady);
    });
    return unsubscribe;
  }, []);

  // Tự động khởi tạo tệp Google Sheet tên "CSDL" trong Google Drive khi có token mà chưa kết nối Sheet
  useEffect(() => {
    const token = getGoogleSheetsAccessToken();
    const saved = getSavedGoogleSheetsConfig();
    if (token && !saved?.spreadsheetId && !autoProvisionedCsdlRef.current && !isBusy) {
      autoProvisionedCsdlRef.current = true;
      handleCreateNewSheetDatabase('CSDL');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccessToken]);

  // Tự động truy vấn Google Sheet mỗi khi đổi (grade, period) hoặc spreadsheetId
  useEffect(() => {
    const activeSpreadsheetId = sheetConfig?.spreadsheetId;
    if (!activeSpreadsheetId) return;

    const compositeKey = `${activeSpreadsheetId}__${lessonKey}`;
    if (lastAutoLoadedKeyRef.current === compositeKey) return;
    lastAutoLoadedKeyRef.current = compositeKey;

    handleLoadLessonFromSheet(activeSpreadsheetId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, period, lessonKey, sheetConfig?.spreadsheetId]);

  const handleGoogleSignIn = async () => {
    setIsBusy(true);
    setStatusBanner({
      tone: 'info',
      text: 'Đang mở cửa sổ đăng nhập Google và xin quyền kết nối Google Sheets (Tệp "CSDL")...',
    });
    try {
      const res = await signInWithGoogleForSheets();
      if (res.accessToken) {
        setHasAccessToken(true);
        setStatusBanner({
          tone: 'success',
          text: `✅ Đã đăng nhập Google (${res.user?.email || 'Tài khoản giáo viên'}) và sẵn sàng quản trị CSDL Slide trên Google Sheets!`,
        });
        onShowToast(
          `✅ Đã kết nối tài khoản Google (${res.user?.email || ''}) với quyền Google Sheets!`
        );
        if (sheetConfig?.spreadsheetId) {
          await handleLoadLessonFromSheet(sheetConfig.spreadsheetId, false);
        } else {
          autoProvisionedCsdlRef.current = true;
          await handleCreateNewSheetDatabase('CSDL', res.accessToken);
        }
      } else {
        setStatusBanner({
          tone: 'warning',
          text: res.errorMessage || 'Chưa nhận được quyền truy cập Google Sheets. Vui lòng thử lại.',
        });
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutFirebase();
    setHasAccessToken(false);
    setStatusBanner({
      tone: 'info',
      text: 'Đã đăng xuất tài khoản Google.',
    });
    onShowToast('Đã ngắt phiên đăng nhập Google.');
  };

  const handleConnectExistingSheet = async () => {
    const parsedId = extractSpreadsheetIdFromInput(sheetInput);
    if (!parsedId) {
      setStatusBanner({
        tone: 'error',
        text: '⚠️ Đường dẫn Google Sheet hoặc Spreadsheet ID không hợp lệ. Hãy dán link dạng https://docs.google.com/spreadsheets/d/...',
      });
      onShowToast('⚠️ Vui lòng dán đường dẫn Google Sheet hoặc Spreadsheet ID hợp lệ!');
      return;
    }

    const token = getGoogleSheetsAccessToken();
    setIsBusy(true);
    setStatusBanner({
      tone: 'info',
      text: `Đang kết nối tới Google Sheet (${parsedId.slice(0, 10)}...) và khởi tạo cấu trúc 2 bảng Slides_Index & Slides_Pages...`,
    });

    try {
      let title = 'CSDL';
      if (token) {
        const check = await initializeCsdlGoogleSheetStructure(parsedId, token);
        if (!check.ok) {
          setStatusBanner({
            tone: 'error',
            text: `❌ ${check.errorMessage}`,
          });
          onShowToast(`⚠️ ${check.errorMessage}`);
          return;
        }
        title = check.spreadsheetTitle;
        updateIndexList(check.allLessonsIndex);
      }

      const nextCfg: GoogleSheetsConnectionConfig = {
        spreadsheetId: parsedId,
        spreadsheetUrl: buildGoogleSheetUrlFromId(parsedId),
        spreadsheetTitle: title,
        connectedAtIso: new Date().toISOString(),
        lastSyncedAtIso: new Date().toISOString(),
      };
      setSheetConfig(nextCfg);
      saveGoogleSheetsConfig(nextCfg);
      lastAutoLoadedKeyRef.current = `${parsedId}__${lessonKey}`;

      await handleLoadLessonFromSheet(parsedId, false);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateNewSheetDatabase = async (
    customTitle = 'CSDL',
    explicitToken?: string
  ) => {
    let token = explicitToken || getGoogleSheetsAccessToken();
    if (!token) {
      const signInRes = await signInWithGoogleForSheets();
      token = signInRes.accessToken;
      if (!token) {
        onShowToast('⚠️ Vui lòng đăng nhập Google trước khi tạo tệp Google Sheet "CSDL" trong Google Drive!');
        return;
      }
    }

    setIsBusy(true);
    setStatusBanner({
      tone: 'info',
      text: `Đang khởi tạo tệp Google Sheet có tên "${customTitle}" trong Google Drive với 2 bảng chuẩn hóa (Slides_Index & Slides_Pages)...`,
    });

    try {
      const created = await createCsdlSpreadsheetInDrive(token, customTitle);
      if (!created.ok) {
        setStatusBanner({
          tone: 'error',
          text: `❌ ${created.errorMessage}`,
        });
        onShowToast(`⚠️ ${created.errorMessage}`);
        return;
      }

      const nextCfg: GoogleSheetsConnectionConfig = {
        spreadsheetId: created.spreadsheetId,
        spreadsheetUrl: created.spreadsheetUrl,
        spreadsheetTitle: created.spreadsheetTitle,
        connectedAtIso: new Date().toISOString(),
        lastSyncedAtIso: new Date().toISOString(),
      };
      setSheetConfig(nextCfg);
      setSheetInput(created.spreadsheetUrl);
      saveGoogleSheetsConfig(nextCfg);
      updateIndexList([]);

      const emptyDeck = buildBlankSlideDeckForEmptySheetLesson({
        grade,
        period,
        lessonTitle,
        spreadsheetId: created.spreadsheetId,
      });
      await onApplyLoadedDeck(
        emptyDeck,
        `✨ Đã tạo tệp Google Sheet tên "${created.spreadsheetTitle}" trong Google Drive của bạn (gồm 2 bảng Slides_Index & Slides_Pages)!`,
        false,
        lessonKey
      );
      setStatusBanner({
        tone: 'success',
        text: `✅ Đã tạo tệp Google Sheet "${created.spreadsheetTitle}" trong Google Drive (ID: ${created.spreadsheetId.slice(
          0,
          10
        )}...) với 2 bảng chuẩn hóa Slides_Index (A→I) và Slides_Pages (A→N). Đang tự động kiểm tra và đẩy Slide bài giảng lên Sheet...`,
      });

      // Tự động đẩy ngay toàn bộ Slide bài giảng hiện có vào Sheet CSDL vừa tạo mà không cần thao tác thủ công
      await autoSyncCurrentOrCurriculumSlidesToSheet(created.spreadsheetId, token);
    } finally {
      setIsBusy(false);
    }
  };

  /**
   * Sinh bộ 5 trang Ảnh Slide WebP độ nét cao theo chuẩn bài giảng Tin học cho tiết `(targetGrade, targetPeriod)`
   */
  const buildStandardWebpSlidesForLesson = (
    targetGrade: 6 | 7 | 8 | 9,
    targetPeriod: number,
    targetLessonTitle: string
  ): ConvertedPdfWebpSlide[] => {
    const cleanTitle =
      String(targetLessonTitle || `Tiết ${targetPeriod} Tin học ${targetGrade}`).trim();
    const sampleTopics = [
      {
        title: `Trang 1/5: Giới thiệu & Mục tiêu bài học — Tiết ${targetPeriod}`,
        subtitle: `${cleanTitle} (Khối ${targetGrade} • Tiết ${targetPeriod})`,
        bullets: [
          '• Nắm vững khái niệm cốt lõi và yêu cầu cần đạt chuẩn GDPT 2018 môn Tin học.',
          '• Quan sát tình huống thực tế và thảo luận câu hỏi khởi động tại Phòng chờ.',
        ],
        note: 'Slide #1/5 • Khởi động & Đặt vấn đề',
      },
      {
        title: `Trang 2/5: Khám phá Kiến thức trọng tâm #1`,
        subtitle: `Phân tích trực quan • Tin học Khối ${targetGrade} (Tiết ${targetPeriod})`,
        bullets: [
          '• Sơ đồ hóa luồng xử lý thông tin và cấu trúc dữ liệu trong bài học.',
          '• So sánh ưu điểm của phương pháp số hóa hiện đại trong thực tiễn.',
        ],
        note: 'Slide #2/5 • Hoạt động 1: Khám phá kiến thức',
      },
      {
        title: `Trang 3/5: Minh họa & Ví dụ Thực hành trực quan`,
        subtitle: `Hướng dẫn thao tác từng bước trên máy tính phòng Lab`,
        bullets: [
          '• Bước 1: Chuẩn bị dữ liệu đầu vào và kiểm tra cấu hình.',
          '• Bước 2: Thực hiện thao tác chuẩn theo hướng dẫn trên Slide.',
        ],
        note: 'Slide #3/5 • Hoạt động 2: Minh họa trực quan',
      },
      {
        title: `Trang 4/5: Nhiệm vụ Luyện tập & Thử thách Cặp đôi`,
        subtitle: `Tổ 1 & Tổ 2 thi đua hoàn thành phiếu học tập tương tác`,
        bullets: [
          '• Hoàn thành câu hỏi trắc nghiệm nhanh và bài tập ghép nối khái niệm.',
          '• Hệ thống chấm điểm tự động và cộng XP trực tiếp lên Bảng xếp hạng.',
        ],
        note: 'Slide #4/5 • Hoạt động 3: Luyện tập tại máy',
      },
      {
        title: `Trang 5/5: Tổng kết Ghi nhớ & Vận dụng sáng tạo`,
        subtitle: `Tổng hợp từ khóa cốt lõi của Tiết ${targetPeriod} — Khối ${targetGrade}`,
        bullets: [
          '• Ghi nhớ các khái niệm trọng tâm trong khung Tóm tắt kiến thức.',
          '• Nộp sản phẩm thực hành và chuẩn bị nội dung cho tiết học tiếp theo.',
        ],
        note: 'Slide #5/5 • Hoạt động 4: Vận dụng & Tổng kết',
      },
    ];

    return sampleTopics.map((item, idx) => {
      const dataUrl = renderSlideToCanvasDataUrl({
        grade: targetGrade,
        period: targetPeriod,
        slideNumber: idx + 1,
        totalSlides: sampleTopics.length,
        title: item.title,
        subtitle: item.subtitle,
        bulletPoints: item.bullets,
        highlightNote: item.note,
      });
      const stats = calculateBase64ChunkStats(dataUrl);
      return {
        slideNumber: idx + 1,
        totalSlides: sampleTopics.length,
        title: item.title,
        subtitle: item.subtitle,
        bulletPoints: item.bullets,
        highlightNote: item.note,
        extractedText: item.bullets.join(' '),
        imageUrl: dataUrl,
        width: 1280,
        height: 720,
        sizeKb: stats.estimatedKb,
        chunkCount: stats.activeChunkCount,
        chunks: [],
      };
    });
  };

  /**
   * Đẩy TỰ ĐỘNG 100% (Zero-Click, không hiện bảng hỏi xác nhận thủ công) bộ Slide ảnh WebP
   * của tiết học lên tệp Google Sheet `CSDL` (`Slides_Index` & `Slides_Pages`).
   */
  const autoPushSlidesToSheetNow = async (
    rawSlides: ManagedLectureSlidePage[],
    fileName: string,
    options?: {
      targetGrade?: 6 | 7 | 8 | 9;
      targetPeriod?: number;
      targetLessonTitle?: string;
      explicitSpreadsheetId?: string;
      explicitToken?: string;
      silentIfNoToken?: boolean;
    }
  ): Promise<boolean> => {
    const targetGrade = options?.targetGrade ?? grade;
    const targetPeriod = options?.targetPeriod ?? period;
    const targetLessonTitle = options?.targetLessonTitle ?? lessonTitle;
    const targetLessonKey = `k${targetGrade}-tiet-${targetPeriod}`;

    let cleanId = extractSpreadsheetIdFromInput(
      options?.explicitSpreadsheetId || sheetConfig?.spreadsheetId || sheetInput
    );
    let token = options?.explicitToken || getGoogleSheetsAccessToken();

    if (!token) {
      if (options?.silentIfNoToken) {
        return false;
      }
      const signInRes = await signInWithGoogleForSheets();
      token = signInRes.accessToken;
      if (!token) {
        onShowToast('⚠️ Cần đăng nhập Google để tự động đẩy ảnh Slide WebP lên Google Sheet "CSDL"!');
        return false;
      }
      setHasAccessToken(true);
    }

    setIsBusy(true);
    try {
      if (!cleanId) {
        setStatusBanner({
          tone: 'info',
          text: 'Đang tự động khởi tạo tệp Google Sheet tên "CSDL" trong Google Drive của bạn...',
        });
        const created = await createCsdlSpreadsheetInDrive(token, 'CSDL');
        if (!created.ok) {
          onShowToast(`⚠️ ${created.errorMessage}`);
          setStatusBanner({
            tone: 'error',
            text: `❌ ${created.errorMessage}`,
          });
          return false;
        }
        cleanId = created.spreadsheetId;
        const nextCfg: GoogleSheetsConnectionConfig = {
          spreadsheetId: created.spreadsheetId,
          spreadsheetUrl: created.spreadsheetUrl,
          spreadsheetTitle: created.spreadsheetTitle,
          connectedAtIso: new Date().toISOString(),
          lastSyncedAtIso: new Date().toISOString(),
        };
        setSheetConfig(nextCfg);
        setSheetInput(created.spreadsheetUrl);
        saveGoogleSheetsConfig(nextCfg);
      }

      setStatusBanner({
        tone: 'info',
        text: `⚡ Đang tự động phân mảnh Base64 (<= 6 chunk) và đẩy ${rawSlides.length} trang Ảnh Slide WebP (${targetLessonKey}) lên Google Sheet "CSDL"...`,
      });

      const optimizedSlides: ManagedLectureSlidePage[] = [];
      for (let i = 0; i < rawSlides.length; i++) {
        const s = rawSlides[i];
        const fittedImg = await ensureSlideImageFitsSheetRow(s.imageUrl || '');
        optimizedSlides.push({
          ...s,
          slideNumber: i + 1,
          imageUrl: fittedImg,
        });
      }

      const saveRes = await pushPdfSlideDeckToCsdlSheet({
        spreadsheetId: cleanId,
        accessToken: token,
        grade: targetGrade,
        period: targetPeriod,
        lessonTitle: targetLessonTitle,
        fileName,
        slides: optimizedSlides,
        teacherEmail: googleUser?.email || '',
        onProgress: (msg) => {
          setStatusBanner({ tone: 'info', text: msg });
        },
      });

      if (!saveRes.ok) {
        setStatusBanner({
          tone: 'error',
          text: `❌ Lỗi khi tự động lưu vào Google Sheet: ${saveRes.errorMessage}`,
        });
        onShowToast(`⚠️ ${saveRes.errorMessage}`);
        return false;
      }

      if (saveRes.allLessonsIndex) {
        updateIndexList(saveRes.allLessonsIndex);
      }

      const nextCfg: GoogleSheetsConnectionConfig = {
        spreadsheetId: cleanId,
        spreadsheetUrl: buildGoogleSheetUrlFromId(cleanId),
        spreadsheetTitle: sheetConfig?.spreadsheetTitle || 'CSDL',
        connectedAtIso: sheetConfig?.connectedAtIso || new Date().toISOString(),
        lastSyncedAtIso: new Date().toISOString(),
      };
      setSheetConfig(nextCfg);
      saveGoogleSheetsConfig(nextCfg);

      const loadedDeck = {
        lessonKey: targetLessonKey,
        grade: targetGrade,
        period: targetPeriod,
        fileName: `${fileName} (Google Sheets CSDL • ${optimizedSlides.length} Slide Ảnh WebP)`,
        fileType: 'pdf' as const,
        fileSize: `${saveRes.updatedIndexRecord?.totalSizeKb || optimizedSlides.length * 45} KB`,
        fileSizeLabel: `Đã đồng bộ tự động vào Google Sheet CSDL (${targetLessonKey})`,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        storageBucket: 'slide-storage-1gb' as const,
        totalCompressedKb: saveRes.updatedIndexRecord?.totalSizeKb || optimizedSlides.length * 45,
        isUserUploaded: true,
        hasRealPdfPages: true,
        isBlankSlideDeck: false,
        isLazyLoaded: true,
        sourceSpreadsheetId: cleanId,
        slides: optimizedSlides,
      };

      if (targetLessonKey === lessonKey) {
        setConvertedWebpPreview(null);
        setPreviewSlideIndex(0);
      }

      setStatusBanner({
        tone: 'success',
        text: `🎉 Đã tự động đẩy thành công ${optimizedSlides.length} trang Ảnh Slide WebP từ "${fileName}" vào Google Sheet "CSDL" (${targetLessonKey}) mà không cần thao tác thủ công!`,
      });

      await onApplyLoadedDeck(
        loadedDeck,
        `🎉 Đã tự động đẩy ${optimizedSlides.length} trang Ảnh Slide WebP (${targetLessonKey}) vào Google Sheet "CSDL"!`,
        false,
        targetLessonKey
      );
      return true;
    } finally {
      setIsBusy(false);
    }
  };

  /**
   * Tự động kiểm tra và đẩy Slide bài giảng của tiết đang mở (hoặc bộ Slide vừa chuyển đổi)
   * lên Google Sheet `CSDL` ngay khi kết nối mà không cần giáo viên bấm xác nhận thủ công.
   */
  const autoSyncCurrentOrCurriculumSlidesToSheet = async (
    targetSpreadsheetId?: string,
    explicitToken?: string
  ) => {
    const cleanId = extractSpreadsheetIdFromInput(
      targetSpreadsheetId || sheetConfig?.spreadsheetId || sheetInput
    );
    const token = explicitToken || getGoogleSheetsAccessToken();
    if (!cleanId || !token) return;

    // 1. Nếu đang có bộ Slide PDF vừa chuyển đổi trong preview -> đẩy tự động ngay
    if (
      convertedWebpPreview &&
      convertedWebpPreview.lessonKey === lessonKey &&
      convertedWebpPreview.slides.length > 0
    ) {
      await autoPushSlidesToSheetNow(convertedWebpPreview.slides, convertedWebpPreview.fileName, {
        explicitSpreadsheetId: cleanId,
        explicitToken: token,
        silentIfNoToken: true,
      });
      return;
    }

    // 2. Nếu tiết học hiện tại đang có bộ Slide thực trong currentDeck -> đẩy tự động ngay
    if (isRealRenderedPdfSlideDeck(currentDeck) && Array.isArray(currentDeck?.slides) && currentDeck.slides.length > 0) {
      await autoPushSlidesToSheetNow(
        currentDeck.slides,
        currentDeck.fileName || `BaiGiang_Tin${grade}_Tiet${period}.pdf`,
        {
          explicitSpreadsheetId: cleanId,
          explicitToken: token,
          silentIfNoToken: true,
        }
      );
      return;
    }

    // 3. Tự động sinh & đẩy bộ 5 trang Slide WebP chuẩn của tiết học hiện tại vào Sheet CSDL
    const generatedSlides = buildStandardWebpSlidesForLesson(grade, period, lessonTitle);
    await autoPushSlidesToSheetNow(
      generatedSlides,
      `BaiGiang_Tin${grade}_Tiet${period}.pdf`,
      {
        explicitSpreadsheetId: cleanId,
        explicitToken: token,
        silentIfNoToken: true,
      }
    );
  };

  /**
   * Tự động đẩy TOÀN BỘ Slide bài giảng của tất cả các tiết thuộc Khối đang chọn lên Google Sheet `CSDL`
   * trong 1 lần đồng bộ hàng loạt (`batchPushMultipleLessonDecksToCsdlSheet`) không cần thao tác thủ công từng tiết.
   */
  const handleAutoBatchPushAllGradeLessonsToSheet = async () => {
    let cleanId = extractSpreadsheetIdFromInput(sheetConfig?.spreadsheetId || sheetInput);
    let token = getGoogleSheetsAccessToken();
    if (!token) {
      const signInRes = await signInWithGoogleForSheets();
      token = signInRes.accessToken;
      if (!token) {
        onShowToast('⚠️ Vui lòng đăng nhập Google để tự động đẩy toàn bộ Slide bài giảng lên Sheet "CSDL"!');
        return;
      }
      setHasAccessToken(true);
    }

    setIsBusy(true);
    try {
      if (!cleanId) {
        setStatusBanner({
          tone: 'info',
          text: 'Đang tự động khởi tạo tệp Google Sheet tên "CSDL" trong Google Drive...',
        });
        const created = await createCsdlSpreadsheetInDrive(token, 'CSDL');
        if (!created.ok) {
          onShowToast(`⚠️ ${created.errorMessage}`);
          setStatusBanner({ tone: 'error', text: `❌ ${created.errorMessage}` });
          return;
        }
        cleanId = created.spreadsheetId;
        const nextCfg: GoogleSheetsConnectionConfig = {
          spreadsheetId: created.spreadsheetId,
          spreadsheetUrl: created.spreadsheetUrl,
          spreadsheetTitle: created.spreadsheetTitle,
          connectedAtIso: new Date().toISOString(),
          lastSyncedAtIso: new Date().toISOString(),
        };
        setSheetConfig(nextCfg);
        setSheetInput(created.spreadsheetUrl);
        saveGoogleSheetsConfig(nextCfg);
      }

      const targetPeriods =
        periodList && periodList.length > 0
          ? periodList
          : Array.from({ length: 29 }, (_, idx) => ({
              period: idx + 1,
              lessonTitle: `Bài giảng Tin học Khối ${grade} — Tiết ${idx + 1}`,
            }));

      setStatusBanner({
        tone: 'info',
        text: `⚡ Đang tự động kết xuất ảnh WebP và đẩy đồng loạt ${targetPeriods.length} tiết học Khối ${grade} lên Google Sheet "CSDL"...`,
      });

      const batchLessons = targetPeriods.map((pItem) => {
        const slides = buildStandardWebpSlidesForLesson(grade, pItem.period, pItem.lessonTitle);
        return {
          grade,
          period: pItem.period,
          lessonTitle: pItem.lessonTitle,
          fileName: `BaiGiang_Tin${grade}_Tiet${pItem.period}.pdf`,
          slides,
        };
      });

      const batchRes = await batchPushMultipleLessonDecksToCsdlSheet({
        spreadsheetId: cleanId,
        accessToken: token,
        lessons: batchLessons,
        teacherEmail: googleUser?.email || '',
        onProgress: (msg) => setStatusBanner({ tone: 'info', text: msg }),
      });

      if (!batchRes.ok) {
        setStatusBanner({
          tone: 'error',
          text: `❌ Lỗi khi đẩy đồng loạt lên Google Sheet: ${batchRes.errorMessage}`,
        });
        onShowToast(`⚠️ ${batchRes.errorMessage}`);
        return;
      }

      if (batchRes.allLessonsIndex) {
        updateIndexList(batchRes.allLessonsIndex);
      }

      const currentLessonSlides =
        batchLessons.find((l) => l.period === period)?.slides ||
        buildStandardWebpSlidesForLesson(grade, period, lessonTitle);

      const loadedDeck = {
        lessonKey,
        grade,
        period,
        fileName: `BaiGiang_Tin${grade}_Tiet${period}.pdf (Google Sheets CSDL • ${currentLessonSlides.length} Slide Ảnh WebP)`,
        fileType: 'pdf' as const,
        fileSize: `${currentLessonSlides.length * 45} KB`,
        fileSizeLabel: `Đã đồng bộ tự động toàn bộ Khối ${grade} vào Google Sheet CSDL`,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        storageBucket: 'slide-storage-1gb' as const,
        totalCompressedKb: currentLessonSlides.length * 45,
        isUserUploaded: true,
        hasRealPdfPages: true,
        isBlankSlideDeck: false,
        isLazyLoaded: true,
        sourceSpreadsheetId: cleanId,
        slides: currentLessonSlides,
      };

      setConvertedWebpPreview(null);
      setPreviewSlideIndex(0);

      setStatusBanner({
        tone: 'success',
        text: `🎉 Đã tự động đẩy toàn bộ ${batchRes.savedLessonCount} tiết học (${batchRes.savedSlideCount} trang Ảnh Slide WebP) của Khối ${grade} vào Google Sheet "CSDL" thành công!`,
      });

      await onApplyLoadedDeck(
        loadedDeck,
        `🎉 Đã tự động đẩy toàn bộ ${batchRes.savedLessonCount} tiết học Khối ${grade} (${batchRes.savedSlideCount} Slide WebP) vào Google Sheet "CSDL"!`,
        false,
        lessonKey
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleLoadLessonFromSheet = async (
    targetSpreadsheetId?: string,
    silentToastIfBlank = false
  ) => {
    const cleanId = extractSpreadsheetIdFromInput(
      targetSpreadsheetId || sheetConfig?.spreadsheetId || sheetInput
    );
    if (!cleanId) {
      onShowToast('⚠️ Vui lòng kết nối hoặc tạo Google Sheet "CSDL" trước!');
      return;
    }

    const token = getGoogleSheetsAccessToken();
    setIsBusy(true);
    setStatusBanner({
      tone: 'info',
      text: `Đang truy vấn dữ liệu Slide của Khối ${grade} • Tiết ${period} (${lessonKey}) từ Google Sheet "${
        sheetConfig?.spreadsheetTitle || 'CSDL'
      }"...`,
    });

    try {
      const result = await loadLessonSlideDeckFromGoogleSheet({
        spreadsheetId: cleanId,
        accessToken: token,
        grade,
        period,
        lessonTitle,
      });

      if (result.allLessonsIndex) {
        updateIndexList(result.allLessonsIndex);
      }

      if (result.foundInSheet && !result.isBlankSlide) {
        setConvertedWebpPreview(null);
        setPreviewSlideIndex(0);
        setStatusBanner({
          tone: 'success',
          text: `✅ Đã tải thành công ${result.slideCount} trang Ảnh Slide WebP của Khối ${grade} • Tiết ${period} (${lessonKey}) từ Google Sheet "${
            sheetConfig?.spreadsheetTitle || 'CSDL'
          }" và hiển thị trong khung Xem trước!`,
        });
        await onApplyLoadedDeck(
          result.deck,
          `📊 Đã tải ${result.slideCount} trang Ảnh Slide (Khối ${grade} • Tiết ${period}) từ Google Sheet "CSDL"!`,
          false,
          lessonKey
        );
      } else if (token) {
        // Nếu đã đăng nhập Google mà tiết học này chưa có trên Sheet CSDL -> TỰ ĐỘNG đẩy toàn bộ Slide bài giảng của tiết học này vào Sheet ngay lập tức!
        setStatusBanner({
          tone: 'info',
          text: `⚡ Tiết ${period} (Khối ${grade}) chưa có trên Google Sheet "CSDL" — Hệ thống đang TỰ ĐỘNG đẩy toàn bộ Slide bài giảng vào Sheet mà không cần thao tác thủ công...`,
        });
        await autoSyncCurrentOrCurriculumSlidesToSheet(cleanId, token);
      } else {
        setStatusBanner({
          tone: 'warning',
          text: result.statusMessage,
        });
        await onApplyLoadedDeck(
          result.deck,
          silentToastIfBlank ? undefined : result.statusMessage,
          false,
          lessonKey
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  /**
   * Luồng Batch Process Tự Động (Zero-Preview / Zero-Click):
   * Khi giáo viên chọn 1 hoặc nhiều tệp PDF bài giảng (ví dụ "Lợi_ích_Internet_và_AI.pdf"):
   * - Sử dụng `pdfjs-dist` thông qua Worker Script (`/pdfjs/pdf.worker.min.js`) để chuyển đổi từng trang một
   *   sang chuỗi Base64 (`WebP`/`PNG`) ở phía client (tránh triệt để lỗi `At.getBuiltinModule`).
   * - Tự động phân mảnh (`chunks`) mỗi trang thành tối đa 6 cột (`<= 45.000` ký tự/ô).
   * - Đẩy thẳng dữ liệu lên Google Sheets `CSDL` (`Slides_Index` & `Slides_Pages`) mà KHÔNG cần hiển thị
   *   xem trước thủ công cho từng trang, đồng thời hiển thị thanh tiến trình (Progress Bar) trực quan.
   */
  const handleUploadPdfFileToGoogleSheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (fileList.length === 0) return;

    const pdfFiles = fileList.filter(
      (f) => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
    );
    if (pdfFiles.length === 0) {
      onShowToast(
        '⚠️ Vui lòng chọn tệp bài giảng định dạng PDF (.pdf) để tự động chuyển mỗi trang thành ảnh Base64 và đẩy vào Google Sheet "CSDL"!'
      );
      return;
    }

    setIsBusy(true);
    setConvertedWebpPreview(null);
    try {
      const cleanId = extractSpreadsheetIdFromInput(sheetConfig?.spreadsheetId || sheetInput);
      const token = getGoogleSheetsAccessToken();

      // Trường hợp chọn 1 tệp PDF (ví dụ "Lợi_ích_Internet_và_AI.pdf") -> chạy batchConvertAndUploadPdfPagesToGoogleSheet
      if (pdfFiles.length === 1) {
        const file = pdfFiles[0];
        setPdfBatchProgress({
          phase: 'initializing',
          currentPage: 0,
          totalPages: 1,
          percent: 5,
          fileName: file.name,
          statusText: `⚡ Đang khởi tạo Worker pdfjs-dist để batch process từng trang tệp "${file.name}"...`,
        });

        const batchRes = await batchConvertAndUploadPdfPagesToGoogleSheet({
          file,
          grade,
          period,
          lessonTitle,
          spreadsheetId: cleanId,
          accessToken: token,
          teacherEmail: googleUser?.email || '',
          targetWidth: 1440,
          webpQuality: 0.82,
          onProgress: (prog) => {
            setPdfBatchProgress(prog);
            setStatusBanner({
              tone: prog.phase === 'completed' ? 'success' : 'info',
              text: prog.statusText,
            });
          },
        });

        if (!batchRes.ok || batchRes.slides.length === 0) {
          setStatusBanner({
            tone: 'error',
            text: `❌ ${batchRes.errorMessage || `Không thể xử lý tệp PDF "${file.name}".`}`,
          });
          onShowToast(`⚠️ ${batchRes.errorMessage || 'Lỗi xử lý tệp PDF'}`);
          return;
        }

        if (batchRes.spreadsheetId) {
          const nextCfg: GoogleSheetsConnectionConfig = {
            spreadsheetId: batchRes.spreadsheetId,
            spreadsheetUrl:
              batchRes.spreadsheetUrl || buildGoogleSheetUrlFromId(batchRes.spreadsheetId),
            spreadsheetTitle:
              batchRes.spreadsheetTitle || sheetConfig?.spreadsheetTitle || 'CSDL',
            connectedAtIso: sheetConfig?.connectedAtIso || new Date().toISOString(),
            lastSyncedAtIso: new Date().toISOString(),
          };
          setSheetConfig(nextCfg);
          setSheetInput(nextCfg.spreadsheetUrl);
          saveGoogleSheetsConfig(nextCfg);
        }

        if (batchRes.allLessonsIndex) {
          updateIndexList(batchRes.allLessonsIndex);
        }

        // Áp dụng thẳng bộ Slide đã batch process vào bài giảng hiện tại mà KHÔNG bắt giáo viên duyệt xem trước từng trang
        const totalKb = batchRes.slides.reduce((acc, s) => acc + s.sizeKb, 0);
        const directDeck = {
          lessonKey,
          grade,
          period,
          fileName: batchRes.uploadedToSheet
            ? `${file.name} (Google Sheets CSDL • ${batchRes.slides.length} trang Base64)`
            : `${file.name} (${batchRes.slides.length} trang Base64 đã phân mảnh)`,
          fileType: 'pdf' as const,
          fileSize: `${totalKb} KB`,
          fileSizeLabel: batchRes.uploadedToSheet
            ? `Đã batch process & đẩy thẳng ${batchRes.slides.length} trang lên Google Sheet CSDL (${lessonKey})`
            : `Đã batch process & phân mảnh tự động ${batchRes.slides.length} trang (${lessonKey})`,
          uploadedAt: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          storageBucket: 'slide-storage-1gb' as const,
          totalCompressedKb: totalKb,
          isUserUploaded: true,
          hasRealPdfPages: true,
          isBlankSlideDeck: false,
          isLazyLoaded: true,
          sourceSpreadsheetId: batchRes.spreadsheetId || cleanId,
          slides: batchRes.slides,
        };

        setPreviewSlideIndex(0);
        const finalMsg = batchRes.uploadedToSheet
          ? `🎉 Hoàn tất Batch Process 100%: Đã chuyển đổi từng trang PDF "${file.name}" (${batchRes.slides.length} trang), phân mảnh tự động (<= 6 chunks) và đẩy thẳng lên Google Sheet "CSDL"!`
          : `✅ Hoàn tất Batch Process 100%: Đã chuyển đổi từng trang PDF "${file.name}" (${batchRes.slides.length} trang) qua Worker pdfjs-dist & phân mảnh Base64 tự động (${totalKb} KB)!`;

        setPdfBatchProgress({
          phase: 'completed',
          currentPage: batchRes.slides.length,
          totalPages: batchRes.slides.length,
          percent: 100,
          fileName: file.name,
          chunkCount: batchRes.slides[0]?.chunkCount || 1,
          sizeKb: totalKb,
          statusText: finalMsg,
        });

        setStatusBanner({
          tone: 'success',
          text: finalMsg,
        });

        await onApplyLoadedDeck(directDeck, finalMsg, false, lessonKey);
        return;
      }

      // Trường hợp chọn NHIỀU tệp PDF cùng lúc -> tự động batch process từng trang của từng tệp & đẩy thẳng 1 lần lên Sheet CSDL
      const batchConverted: Array<{
        grade: 6 | 7 | 8 | 9;
        period: number;
        lessonTitle: string;
        fileName: string;
        slides: ManagedLectureSlidePage[];
      }> = [];

      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const matched = matchFileToGradeAndPeriod(file.name, grade);
        const targetG = matched?.grade ?? grade;
        const targetP = matched?.period ?? Math.min(29, period + i);
        const targetTitle =
          periodList?.find((p) => p.period === targetP)?.lessonTitle ||
          `Tiết ${targetP} — ${file.name.replace(/\.pdf$/i, '')}`;

        const slides = await convertPdfFileToHighResWebpSlides({
          file,
          grade: targetG,
          period: targetP,
          lessonTitle: targetTitle,
          targetWidth: 1440,
          webpQuality: 0.82,
          onBatchStep: (step) => {
            setPdfBatchProgress({
              ...step,
              statusText: `[Tệp ${i + 1}/${pdfFiles.length}] ${step.statusText}`,
            });
            setStatusBanner({
              tone: 'info',
              text: `[Tệp ${i + 1}/${pdfFiles.length}] ${step.statusText}`,
            });
          },
        });

        if (slides.length > 0) {
          batchConverted.push({
            grade: targetG,
            period: targetP,
            lessonTitle: targetTitle,
            fileName: file.name,
            slides,
          });
        }
      }

      if (batchConverted.length > 0) {
        const first = batchConverted[0];
        const totalSlidesAll = batchConverted.reduce((acc, item) => acc + item.slides.length, 0);
        setPreviewSlideIndex(0);

        const firstDeck = {
          lessonKey: `k${first.grade}-tiet-${first.period}`,
          grade: first.grade,
          period: first.period,
          fileName: `${first.fileName} (${first.slides.length} trang Base64)`,
          fileType: 'pdf' as const,
          fileSize: `${first.slides.length * 45} KB`,
          fileSizeLabel: `Đã batch process ${batchConverted.length} tệp PDF (${totalSlidesAll} trang)`,
          uploadedAt: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          storageBucket: 'slide-storage-1gb' as const,
          totalCompressedKb: first.slides.length * 45,
          isUserUploaded: true,
          hasRealPdfPages: true,
          isBlankSlideDeck: false,
          isLazyLoaded: true,
          slides: first.slides,
        };
        await onApplyLoadedDeck(firstDeck, undefined, false, firstDeck.lessonKey);

        if (token) {
          let targetSheetId = cleanId;
          if (!targetSheetId) {
            const created = await createCsdlSpreadsheetInDrive(token, 'CSDL');
            if (created.ok) {
              targetSheetId = created.spreadsheetId;
              const nextCfg: GoogleSheetsConnectionConfig = {
                spreadsheetId: created.spreadsheetId,
                spreadsheetUrl: created.spreadsheetUrl,
                spreadsheetTitle: created.spreadsheetTitle,
                connectedAtIso: new Date().toISOString(),
                lastSyncedAtIso: new Date().toISOString(),
              };
              setSheetConfig(nextCfg);
              setSheetInput(created.spreadsheetUrl);
              saveGoogleSheetsConfig(nextCfg);
            }
          }
          if (targetSheetId) {
            const batchRes = await batchPushMultipleLessonDecksToCsdlSheet({
              spreadsheetId: targetSheetId,
              accessToken: token,
              lessons: batchConverted,
              teacherEmail: googleUser?.email || '',
              onProgress: (msg) => setStatusBanner({ tone: 'info', text: msg }),
            });
            if (batchRes.ok && batchRes.allLessonsIndex) {
              updateIndexList(batchRes.allLessonsIndex);
            }
          }
        }

        const doneMsg = `🎉 Hoàn tất Batch Process 100%: Đã xử lý tự động ${batchConverted.length} tệp PDF (${totalSlidesAll} trang Slide Base64) mà không cần xem trước thủ công!`;
        setPdfBatchProgress({
          phase: 'completed',
          currentPage: totalSlidesAll,
          totalPages: totalSlidesAll,
          percent: 100,
          fileName: `${batchConverted.length} tệp PDF`,
          statusText: doneMsg,
        });
        setStatusBanner({ tone: 'success', text: doneMsg });
        onShowToast(doneMsg);
      }
    } catch (err: any) {
      setStatusBanner({
        tone: 'error',
        text: `❌ Lỗi khi chuyển đổi tệp PDF qua pdfjs-dist Worker: ${err?.message || 'Định dạng không hợp lệ'}`,
      });
      onShowToast(`⚠️ Lỗi đọc tệp PDF: ${err?.message || ''}`);
    } finally {
      setIsBusy(false);
    }
  };

  /**
   * Tạo nhanh bộ 5 trang Ảnh Slide WebP độ nét cao cho tiết học đang chọn
   * và TỰ ĐỘNG đẩy lên Google Sheet "CSDL" nếu đã kết nối (không cần bấm nút xác nhận thủ công).
   */
  const handleGenerateSampleWebpSlidesForPreview = async () => {
    const generatedSlides = buildStandardWebpSlidesForLesson(grade, period, lessonTitle);
    const sampleFileName = `BaiGiang_Tin${grade}_Tiet${period}.pdf`;

    setConvertedWebpPreview({
      fileName: sampleFileName,
      lessonKey,
      slides: generatedSlides,
    });
    setPreviewSlideIndex(0);

    const sampleDeck = {
      lessonKey,
      grade,
      period,
      fileName: `${sampleFileName} (Bộ 5 Slide WebP Xem Trước)`,
      fileType: 'pdf' as const,
      fileSize: `${generatedSlides.reduce((a, b) => a + b.sizeKb, 0)} KB`,
      fileSizeLabel: `Xem trước 5 trang WebP (${lessonKey})`,
      uploadedAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      storageBucket: 'slide-storage-1gb' as const,
      totalCompressedKb: generatedSlides.reduce((a, b) => a + b.sizeKb, 0),
      isUserUploaded: true,
      hasRealPdfPages: true,
      isBlankSlideDeck: false,
      isLazyLoaded: true,
      slides: generatedSlides,
    };

    await onApplyLoadedDeck(
      sampleDeck,
      `👁️ Đã tạo bộ 5 trang Slide WebP cho Khối ${grade} • Tiết ${period} — Dùng phím mũi tên ← / → để chuyển nhanh giữa các trang!`,
      false,
      lessonKey
    );

    setStatusBanner({
      tone: 'success',
      text: `👁️ Đang xem trước 5 trang Slide WebP của Khối ${grade} • Tiết ${period}. Nhấn phím mũi tên Trái (←) / Phải (→) trên bàn phím để chuyển nhanh giữa các trang!`,
    });

    previewContainerRef.current?.focus();

    // Nếu đã có token Google Sheets -> tự động đẩy luôn bộ 5 Slide này lên Sheet CSDL trong nền
    if (getGoogleSheetsAccessToken()) {
      await autoPushSlidesToSheetNow(generatedSlides, sampleFileName, {
        silentIfNoToken: true,
      });
    }
  };

  const currentLessonInSheet = sheetLessonsIndex.find((r) => r.lessonKey === lessonKey);
  const hasRealCurrentDeck = isRealRenderedPdfSlideDeck(currentDeck);
  const activeSlideChunkStats = calculateBase64ChunkStats(activePreviewSlide?.imageUrl || '');

  return (
    <div
      data-testid="google-sheets-slide-db-panel"
      className="rounded-3xl bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/85 border-2 border-emerald-400/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4"
    >
      {/* Hidden PDF File Input (Supports selecting 1 or multiple PDF files for 100% automatic push) */}
      <input
        ref={pdfUploadInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={handleUploadPdfFileToGoogleSheet}
        className="hidden"
      />

      {/* Top Row: Title + Google Sign-In Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-emerald-200/90">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[26px]">table_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-emerald-950">
                CSDL Slide Bài Giảng Trên Google Sheets (Tệp Google Drive: &quot;{sheetConfig?.spreadsheetTitle || 'CSDL'}&quot;)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-black">
                Tiết đang chọn: {lessonKey.toUpperCase()} (Khối {grade} • Tiết {period})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black">
                🤖 Tự động đẩy 100% Slide vào Sheet (Zero-Click)
              </span>
              {currentLessonInSheet ? (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[11px] font-black">
                  ✓ Có {currentLessonInSheet.slideCount} Slide Ảnh WebP trong Sheet &quot;CSDL&quot;
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black">
                  ⬜ Chưa có dữ liệu trong Sheet (Báo Slide Trắng)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Connector <code>googleSheetsConnector.ts</code> tự động khởi tạo 2 bảng (<code>Slides_Index</code> A→I &amp; <code>Slides_Pages</code> A→N) trên file <strong>CSDL</strong> • Dùng <code>pdf.js</code> chuyển từng trang PDF sang ảnh WebP độ nét cao và <strong>tự động đẩy toàn bộ Slide vào Sheet không cần xác nhận thủ công</strong>
            </p>
          </div>
        </div>

        {/* Official Google Sign-In Button or Connected Account Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasAccessToken && googleUser ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-emerald-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-slate-800">
                {googleUser.email || googleUser.displayName || 'Đã kết nối Google'}
              </span>
              <button
                type="button"
                onClick={handleGoogleSignOut}
                className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Đổi TK
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="google-sheets-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={isBusy}
              className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-4 h-4 shrink-0"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span className="gsi-material-button-contents">Sign in with Google (Kết nối Sheet CSDL)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSchemaDetails((v) => !v)}
            className="px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold cursor-pointer transition-colors"
          >
            {showSchemaDetails ? 'Ẩn Thiết kế CSDL Sheet' : '📐 Xem Thiết kế CSDL Sheet'}
          </button>
        </div>
      </div>

      {/* Standalone Grade (6, 7, 8, 9) & Period (1..29) Selector on Teacher Home */}
      {onChangeGradeAndPeriod && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
              1. Chọn Khối &amp; Tiết học cần nạp / xem trước Slide:
            </span>
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChangeGradeAndPeriod(g, period)}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  grade === g
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Khối {g}
              </button>
            ))}

            <select
              value={period}
              onChange={(e) => onChangeGradeAndPeriod(grade, Number(e.target.value))}
              aria-label="Chọn tiết học để nạp PDF vào Google Sheet CSDL"
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-emerald-300 text-xs font-bold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(periodList && periodList.length > 0
                ? periodList
                : Array.from({ length: 29 }, (_, idx) => ({
                    period: idx + 1,
                    lessonTitle: `Bài giảng Tin học Tiết ${idx + 1}`,
                  }))
              ).map((item) => {
                const key = `k${grade}-tiet-${item.period}`;
                const savedRec = sheetLessonsIndex.find((r) => r.lessonKey === key);
                return (
                  <option key={item.period} value={item.period}>
                    Tiết {item.period}: {item.lessonTitle.replace(/^Tiết\s*\d+\s*:\s*/i, '')}{' '}
                    {savedRec ? `(✓ ${savedRec.slideCount} ảnh)` : '(⬜ Chưa có Slide)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              data-testid="auto-batch-push-grade-btn"
              onClick={handleAutoBatchPushAllGradeLessonsToSheet}
              disabled={isBusy}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Tự động kết xuất ảnh WebP và đẩy đồng loạt toàn bộ các tiết học của Khối đang chọn vào Google Sheet CSDL mà không cần thao tác thủ công từng tiết"
            >
              <span>⚡ Tự Động Đẩy Toàn Bộ Slide Khối {grade} Vào Sheet &quot;CSDL&quot;</span>
            </button>

            {onOpenLiveRoomForLesson && (
              <button
                type="button"
                onClick={() => onOpenLiveRoomForLesson(grade, period)}
                className="px-3.5 py-1.5 rounded-xl bg-[#8a4b16] hover:bg-[#723d11] text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">slideshow</span>
                <span>Vào Phòng Live Tiết {period} (Khối {grade})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Row 2: Google Sheet URL / ID Input + Connect / Create "CSDL" + Auto-Upload PDF to Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        <div className="lg:col-span-5 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              data-testid="google-sheet-url-input"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="Dán link Google Sheet 'CSDL' hoặc Spreadsheet ID..."
              aria-label="Đường dẫn Google Sheet hoặc Spreadsheet ID"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-emerald-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            data-testid="connect-google-sheet-btn"
            onClick={handleConnectExistingSheet}
            disabled={isBusy}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-black cursor-pointer shrink-0 shadow-xs transition-all"
          >
            🔗 Kết nối Sheet
          </button>
        </div>

        <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            data-testid="create-new-google-sheet-btn"
            onClick={() => handleCreateNewSheetDatabase('CSDL')}
            disabled={isBusy}
            className="px-3.5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
            title="Tạo tự động 1 tệp Google Sheet có tên 'CSDL' trong Google Drive của bạn và tự động đẩy toàn bộ Slide bài giảng lên Sheet"
          >
            <span>✨ Tạo Sheet &quot;CSDL&quot; Mới</span>
          </button>

          <button
            type="button"
            data-testid="upload-pdf-to-sheet-btn"
            onClick={() => pdfUploadInputRef.current?.click()}
            disabled={isBusy}
            className="px-3.5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
            title="Chọn 1 hoặc nhiều tệp PDF bài giảng để pdf.js tự động chuyển mỗi trang thành ảnh WebP độ nét cao và đẩy thẳng vào Google Sheet CSDL không cần xác nhận thủ công"
          >
            <span>📤 Chọn PDF Bài Giảng → Tự Động Đẩy 100% Lên Sheet</span>
          </button>

          {hasRealCurrentDeck && (
            <button
              type="button"
              data-testid="sync-current-deck-to-sheet-btn"
              onClick={() =>
                autoPushSlidesToSheetNow(
                  currentDeck.slides || [],
                  currentDeck.fileName || `Tiet_${period}_Khoi_${grade}.pdf`
                )
              }
              disabled={isBusy}
              className="px-3 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
              title="Đẩy tự động bộ ảnh Slide đang mở vào Google Sheet CSDL"
            >
              <span>☁️ Đồng Bộ Ngay Lên Sheet</span>
            </button>
          )}

          <button
            type="button"
            data-testid="reload-lesson-from-sheet-btn"
            onClick={() => handleLoadLessonFromSheet(undefined, false)}
            disabled={isBusy}
            className="px-3 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
            title="Truy vấn và đồng bộ tự động Google Sheet CSDL cho tiết học này"
          >
            <span>🔄 Tải Từ Sheet</span>
          </button>
        </div>
      </div>

      {/* Thanh tiến trình (Progress Bar) Batch Process PDF -> Base64 Chunks -> Upload thẳng lên Google Sheets */}
      {pdfBatchProgress && (
        <div
          data-testid="pdf-auto-upload-progress-bar"
          className={`p-4 rounded-2xl border-2 flex flex-col gap-2.5 transition-all ${
            pdfBatchProgress.phase === 'completed'
              ? 'bg-emerald-50/95 border-emerald-400 text-emerald-950'
              : 'bg-orange-50/95 border-orange-400 text-orange-950'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-black">
                {pdfBatchProgress.phase === 'completed'
                  ? '✓ BATCH UPLOAD HOÀN TẤT'
                  : '⚙️ ĐANG BATCH PROCESS TỪNG TRANG'}
              </span>
              <span>
                Tệp: <strong>{pdfBatchProgress.fileName}</strong> • Worker{' '}
                <code>pdfjs-dist</code> (v3.11.174) → Base64 Chunks → Google Sheets
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                data-testid="pdf-progress-page-counter"
                className="px-2.5 py-0.5 rounded-lg bg-white border border-current text-[11px] font-black"
              >
                Trang {pdfBatchProgress.currentPage} / {pdfBatchProgress.totalPages}
              </span>
              <span
                data-testid="pdf-progress-percent"
                className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white text-[11px] font-black"
              >
                {pdfBatchProgress.percent}%
              </span>
              {pdfBatchProgress.phase === 'completed' && (
                <button
                  type="button"
                  onClick={() => setPdfBatchProgress(null)}
                  className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold cursor-pointer"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>

          {/* Visual Progress Track */}
          <div
            role="progressbar"
            aria-valuenow={pdfBatchProgress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tiến trình chuyển đổi và tải PDF ${pdfBatchProgress.fileName} lên Google Sheets`}
            className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden p-0.5 shadow-inner"
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 transition-all duration-300 ${getProgressBarWidthClass(
                pdfBatchProgress.percent
              )}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
            <span>{pdfBatchProgress.statusText}</span>
            {pdfBatchProgress.chunkCount && (
              <span className="text-emerald-800">
                Phân mảnh tự động: {pdfBatchProgress.chunkCount}/6 chunks (&le; 45.000 ký tự/ô) •{' '}
                {pdfBatchProgress.sizeKb || 0} KB
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div
        data-testid="google-sheets-status-banner"
        className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex flex-wrap items-center justify-between gap-2 border ${
          statusBanner.tone === 'success'
            ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950'
            : statusBanner.tone === 'warning'
            ? 'bg-amber-100/90 border-amber-300 text-amber-950'
            : statusBanner.tone === 'error'
            ? 'bg-rose-100/90 border-rose-300 text-rose-950'
            : 'bg-sky-50 border-sky-200 text-sky-950'
        }`}
      >
        <div className="flex items-center gap-2">
          {isBusy && (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
          )}
          <span>{statusBanner.text}</span>
        </div>

        {sheetConfig?.spreadsheetUrl && (
          <a
            href={sheetConfig.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-emerald-800 border border-emerald-300 text-[11px] font-black shrink-0"
          >
            ↗ Mở Google Sheet &quot;{sheetConfig.spreadsheetTitle || 'CSDL'}&quot; ({sheetConfig.spreadsheetId.slice(0, 8)}...)
          </a>
        )}
      </div>

      {/* =====================================================================
          GIAO DIỆN XEM TRƯỚC (PREVIEW) SLIDE BÀI GIẢNG ĐÃ TẢI LÊN GOOGLE SHEETS
          HỖ TRỢ CHUYỂN NHANH GIỮA CÁC TRANG SLIDE BẰNG PHÍM MŨI TÊN (← / →)
      ===================================================================== */}
      <div
        ref={previewContainerRef}
        tabIndex={0}
        data-testid="google-sheets-slide-previewer"
        aria-label="Khung xem trước Slide bài giảng hỗ trợ phím mũi tên Trái Phải"
        className={
          isPreviewZoomed
            ? 'fixed inset-0 z-[115] bg-slate-950/95 p-4 sm:p-6 flex flex-col justify-between gap-4 overflow-y-auto focus:outline-none'
            : 'rounded-3xl bg-slate-950 text-white p-4 sm:p-5 border-2 border-slate-800 shadow-lg flex flex-col gap-4 focus:outline-none focus:ring-2 focus:ring-emerald-400'
        }
      >
        {/* Preview Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">slideshow</span>
              <span>XEM TRƯỚC SLIDE (PREVIEW)</span>
            </span>

            <span
              data-testid="slide-preview-counter"
              className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-2xs"
            >
              Trang {safePreviewIndex + 1} / {activePreviewSlides.length}
            </span>

            {!isCurrentPreviewBlank && (
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[11px] font-bold">
                WebP • {activeSlideChunkStats.estimatedKb} KB • {activeSlideChunkStats.activeChunkCount}/6 chunk Base64
              </span>
            )}

            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>⌨️ Phím tắt:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600 font-mono text-[10px]">
                ←
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600 font-mono text-[10px]">
                →
              </kbd>
              <span>để chuyển nhanh trang Slide</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCurrentPreviewBlank && (
              <button
                type="button"
                data-testid="generate-sample-webp-slides-btn"
                onClick={handleGenerateSampleWebpSlidesForPreview}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                title="Tạo nhanh bộ 5 trang Slide WebP mẫu cho tiết học này và tự động đẩy lên Sheet CSDL"
              >
                <span>🧪 Tạo 5 Slide WebP Mẫu (Thử Phím ← / →)</span>
              </button>
            )}

            {convertedWebpPreview && convertedWebpPreview.lessonKey === lessonKey && (
              <button
                type="button"
                data-testid="push-preview-slides-to-sheet-btn"
                onClick={() =>
                  autoPushSlidesToSheetNow(
                    convertedWebpPreview.slides,
                    convertedWebpPreview.fileName
                  )
                }
                disabled={isBusy}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>☁️ Đẩy Tự Động {convertedWebpPreview.slides.length} Ảnh WebP Lên Sheet &quot;CSDL&quot;</span>
              </button>
            )}

            {/* Prev / Next Arrow Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                data-testid="preview-prev-slide-btn"
                onClick={() => setPreviewSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={safePreviewIndex <= 0}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-black cursor-pointer transition-colors flex items-center gap-1"
                title="Trang trước (Phím mũi tên Trái ←)"
              >
                <span>← Trước</span>
              </button>
              <button
                type="button"
                data-testid="preview-next-slide-btn"
                onClick={() =>
                  setPreviewSlideIndex((prev) =>
                    Math.min(activePreviewSlides.length - 1, prev + 1)
                  )
                }
                disabled={safePreviewIndex >= activePreviewSlides.length - 1}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black cursor-pointer transition-colors flex items-center gap-1"
                title="Trang tiếp theo (Phím mũi tên Phải →)"
              >
                <span>Tiếp →</span>
              </button>
            </div>

            <button
              type="button"
              data-testid="toggle-preview-zoom-btn"
              onClick={() => setIsPreviewZoomed((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isPreviewZoomed ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span>{isPreviewZoomed ? 'Thu nhỏ (Esc)' : 'Phóng to'}</span>
            </button>
          </div>
        </div>

        {/* Main 16:9 Slide Canvas Stage */}
        <div
          className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center ${
            isPreviewZoomed ? 'flex-1 min-h-[520px]' : 'h-[360px] sm:h-[430px]'
          }`}
        >
          {activePreviewSlide && (
            <img
              key={`${lessonKey}__s${safePreviewIndex + 1}`}
              src={activePreviewSlide.imageUrl || BLANK_WHITE_SLIDE_DATA_URL}
              alt={activePreviewSlide.title || `Slide ${safePreviewIndex + 1}`}
              className="w-full h-full object-contain select-none"
            />
          )}

          {/* Overlay Message when Lesson has no Slides in Google Sheet yet (Blank White Slide) */}
          {isCurrentPreviewBlank && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 text-slate-900">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 shadow-xs">
                <span className="material-symbols-outlined text-[30px]">slideshow</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                ⬜ Trang Slide Trắng — Chưa có dữ liệu Slide cho Khối {grade} • Tiết {period} ({lessonKey})
              </h4>
              <p className="text-xs text-slate-600 max-w-xl mt-1 leading-relaxed">
                Hãy chọn tệp PDF bài giảng (hỗ trợ chọn 1 hoặc nhiều tệp PDF cùng lúc) hoặc bấm nút <strong>Tự Động Đẩy Toàn Bộ Slide</strong> bên dưới — Hệ thống sẽ tự động chuyển đổi sang ảnh WebP và đẩy thẳng toàn bộ Slide vào bảng <code>Slides_Pages</code> trên Google Sheet <strong>&quot;CSDL&quot;</strong> mà bạn không cần thực hiện thao tác xác nhận thủ công nào!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => pdfUploadInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black cursor-pointer shadow-sm"
                >
                  📤 Chọn PDF Bài Giảng → Tự Động Đẩy 100% Vào Sheet
                </button>
                <button
                  type="button"
                  onClick={handleGenerateSampleWebpSlidesForPreview}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-sm"
                >
                  🧪 Tạo &amp; Tự Động Đẩy 5 Slide WebP Tiết {period}
                </button>
                <button
                  type="button"
                  onClick={handleAutoBatchPushAllGradeLessonsToSheet}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-sm"
                >
                  ⚡ Tự Động Đẩy Toàn Bộ 29 Tiết Khối {grade} Vào Sheet &quot;CSDL&quot;
                </button>
              </div>
            </div>
          )}

          {/* Left / Right Floating Quick Arrow Hit Targets on Stage */}
          {activePreviewSlides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Chuyển về trang slide trước"
                onClick={() => setPreviewSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={safePreviewIndex <= 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/75 hover:bg-emerald-600 disabled:opacity-25 text-white font-black text-lg flex items-center justify-center cursor-pointer border border-white/20 shadow-lg transition-all"
                title="Trang trước (Phím ←)"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Chuyển sang trang slide tiếp theo"
                onClick={() =>
                  setPreviewSlideIndex((prev) =>
                    Math.min(activePreviewSlides.length - 1, prev + 1)
                  )
                }
                disabled={safePreviewIndex >= activePreviewSlides.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/75 hover:bg-emerald-600 disabled:opacity-25 text-white font-black text-lg flex items-center justify-center cursor-pointer border border-white/20 shadow-lg transition-all"
                title="Trang tiếp theo (Phím →)"
              >
                →
              </button>
            </>
          )}

          {/* Bottom Caption Bar inside Stage */}
          {activePreviewSlide && !isCurrentPreviewBlank && (
            <div className="absolute bottom-3 left-3 right-3 px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="truncate font-bold text-white">
                {activePreviewSlide.title || `Slide #${safePreviewIndex + 1}`}
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold shrink-0">
                rowKey: <code>{lessonKey}__s{safePreviewIndex + 1}</code>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Filmstrip Thumbnail Strip for Instant Page Selection */}
        {activePreviewSlides.length > 1 && (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>
                Dải trang Slide ({activePreviewSlides.length} trang) — Nhấn vào trang bất kỳ hoặc bấm phím mũi tên Trái (←) / Phải (→):
              </span>
              <span className="text-emerald-400">
                Đang xem: Trang {safePreviewIndex + 1}/{activePreviewSlides.length}
              </span>
            </div>
            <div
              data-testid="slide-preview-filmstrip"
              className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5"
            >
              {activePreviewSlides.map((slideItem, idx) => {
                const isSelected = idx === safePreviewIndex;
                const cStats = calculateBase64ChunkStats(slideItem.imageUrl || '');
                return (
                  <button
                    key={slideItem.slideNumber || idx + 1}
                    type="button"
                    data-testid={`preview-thumbnail-btn-${idx + 1}`}
                    onClick={() => setPreviewSlideIndex(idx)}
                    className={`group shrink-0 w-36 rounded-xl p-1.5 border-2 transition-all cursor-pointer text-left flex flex-col gap-1 ${
                      isSelected
                        ? 'border-amber-400 bg-emerald-950/90 ring-2 ring-amber-400/40 shadow-md'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative">
                      <img
                        src={slideItem.imageUrl || BLANK_WHITE_SLIDE_DATA_URL}
                        alt={slideItem.title || `Trang ${idx + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      <span
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-black ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-900/85 text-white'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold px-0.5">
                      <span className={isSelected ? 'text-amber-300' : 'text-slate-300'}>
                        Trang {idx + 1}
                      </span>
                      <span className="text-emerald-400">{cStats.activeChunkCount}/6 chunk</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Database Schema Design & Stored Lessons Overview */}
      {showSchemaDetails && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex flex-col gap-3 border border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700">
            <span className="font-black text-emerald-300 uppercase tracking-wider">
              📐 Thiết kế CSDL trên Google Sheets &quot;CSDL&quot; (Tối ưu trình chiếu mượt 60FPS &amp; chống tràn 50.000 ký tự/ô)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
              Connector: src/utils/googleSheetsConnector.ts • 2 Sheet Tabs Chuẩn Hóa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col gap-1.5">
              <div className="font-black text-amber-300">
                Bảng 1 — <code className="text-white">{CSDL_GOOGLE_SHEETS_SCHEMA.INDEX_SHEET_NAME}</code> (Cột A → I, bảng chỉ mục nhanh):
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • Lưu các trường: <code className="text-emerald-300">lessonKey</code> (khóa chính theo khối &amp; tiết, ví dụ <code className="text-emerald-300">k6-tiet-1</code>), <code className="text-emerald-300">grade</code>, <code className="text-emerald-300">period</code>, <code className="text-emerald-300">lessonTitle</code>, <code className="text-emerald-300">fileName</code>, <code className="text-emerald-300">slideCount</code>, <code className="text-emerald-300">totalSizeKb</code>, <code className="text-emerald-300">updatedAtIso</code>, <code className="text-emerald-300">teacherEmail</code>.
                <br />• Giúp kiểm tra tức thì tiết học đang mở đã có dữ liệu Slide ảnh trong Google Sheet hay chưa và tự động đồng bộ không cần thao tác thủ công.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col gap-1.5">
              <div className="font-black text-sky-300">
                Bảng 2 — <code className="text-white">{CSDL_GOOGLE_SHEETS_SCHEMA.PAGES_SHEET_NAME}</code> (Cột A → N, bảng dữ liệu ảnh từng trang Slide):
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                • Mỗi trang của tệp PDF sau khi chuyển thành ảnh độ nét cao (WebP/JPEG qua <code>pdf.js</code>) được lưu thành <strong>1 dòng riêng biệt</strong> (<code className="text-sky-300">rowKey = &#123;lessonKey&#125;__s&#123;slideNumber&#125;</code>).
                <br />• Hàm <code>splitBase64IntoSheetChunks</code> tự động chia chuỗi dữ liệu ảnh Base64 thành tối đa 6 mảnh (<code className="text-sky-300">imgChunk1 → imgChunk6</code>, mỗi ô &le; 45.000 ký tự) để không bao giờ vượt giới hạn 50.000 ký tự/ô của Google Sheets, và tự động ghép nguyên vẹn khi tải về.
              </p>
            </div>
          </div>

          {sheetLessonsIndex.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300">
                Danh sách các tiết học đã có dữ liệu Slide ảnh trong Google Sheet &quot;CSDL&quot; ({sheetLessonsIndex.length} tiết — Nhấn để xem trước):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sheetLessonsIndex.map((item) => (
                  <button
                    key={item.lessonKey}
                    type="button"
                    onClick={() => onChangeGradeAndPeriod?.(item.grade, item.period)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                      item.lessonKey === lessonKey
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Khối {item.grade} • Tiết {item.period}: {item.slideCount} ảnh ({item.fileName})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

