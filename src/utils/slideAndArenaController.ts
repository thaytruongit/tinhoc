import {
  resolveMonotonicSlideSyncState,
  isLegacyDemoSlideDeck,
} from './slideDeckManager';

export type PresenterKeyAction = 'next' | 'prev' | null;

/**
 * Resolves keyboard / wireless presenter clicker key events into slide navigation actions.
 * Supports Space, ArrowRight, PageDown ('next') and ArrowLeft, PageUp ('prev').
 * Ignores events when focus is inside an interactive text input/textarea/select.
 */
export function resolvePresenterKeyAction(
  key: string,
  code: string,
  targetTagName?: string,
  isContentEditable?: boolean
): PresenterKeyAction {
  const tag = (targetTagName || '').toUpperCase();
  if (
    isContentEditable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT'
  ) {
    return null;
  }

  if (
    key === ' ' ||
    code === 'Space' ||
    key === 'ArrowRight' ||
    code === 'ArrowRight' ||
    key === 'PageDown' ||
    code === 'PageDown'
  ) {
    return 'next';
  }

  if (
    key === 'ArrowLeft' ||
    code === 'ArrowLeft' ||
    key === 'PageUp' ||
    code === 'PageUp'
  ) {
    return 'prev';
  }

  return null;
}

/**
 * Determines whether a student live room view is unlocked.
 * - When teacherActiveView === 'waiting', NO activity is active/unlocked (clean standby state).
 * - When teacher broadcasts a specific activity ('slide', 'hd1', 'hd2', 'hd3', 'hd3-practice', 'hd4'),
 *   each activity operates independently without coupling to other activities.
 */
export function isStudentLiveViewUnlocked(params: {
  viewId: 'slide' | 1 | 2 | 3 | 'hd3-practice' | 4;
  teacherActiveView?: string;
  isSlideDeckUnlocked: boolean;
  isPracticeStage3Unlocked: boolean;
  unlockedStages: Record<number, boolean>;
  teacherCurrentStage?: number;
}): boolean {
  const {
    viewId,
    teacherActiveView,
    isSlideDeckUnlocked,
    isPracticeStage3Unlocked,
    unlockedStages,
  } = params;

  // When in standby/waiting state (entering Live room or after ending an activity), all activities stop and remain locked
  if (teacherActiveView === 'waiting') {
    return false;
  }

  // When teacher broadcasts slide image, lock all other activities
  if (teacherActiveView === 'slide') {
    return viewId === 'slide';
  }

  if (viewId === 'slide') {
    return Boolean(isSlideDeckUnlocked);
  }

  if (viewId === 'hd3-practice') {
    return Boolean(isPracticeStage3Unlocked);
  }

  return Boolean(unlockedStages?.[viewId]);
}

/**
 * Computes remaining seconds for the Practice Arena (Đấu trường Luyện tập) countdown timer.
 */
export function computeArenaRemainingSeconds(
  arenaState:
    | {
        isRunning: boolean;
        durationSec: number;
        startedAtIso: string;
        remainingSecOnPause?: number;
      }
    | undefined,
  nowMs: number = Date.now()
): number {
  if (!arenaState) return 300; // Default 5 minutes (300s)
  const duration = Math.max(10, Number(arenaState.durationSec) || 300);
  if (!arenaState.isRunning) {
    return typeof arenaState.remainingSecOnPause === 'number'
      ? Math.max(0, arenaState.remainingSecOnPause)
      : duration;
  }
  const startedMs = Date.parse(arenaState.startedAtIso);
  if (Number.isNaN(startedMs)) return duration;
  const elapsedSec = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
  return Math.max(0, duration - elapsedSec);
}

/**
 * Formats seconds into MM:SS string (e.g. 300 -> "05:00").
 */
export function formatCountdownMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Estimates binary size in bytes of a base64 data URL.
 */
export function estimateBase64Bytes(dataUrl: string): number {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64Part = dataUrl.includes(';base64,')
    ? dataUrl.split(';base64,')[1]
    : dataUrl;
  return Math.round((base64Part.length * 3) / 4);
}

/**
 * Checks if a slide imageUrl is already stored in the 1GB File Storage bucket.
 */
export function isFileStorageSlideUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('/api/file-storage/slides/file/') ||
    url.includes('/storage/v1/object/public/')
  );
}

/**
 * Computes visual urgency state (percentage, color classes, warning label) for the
 * Practice Arena Countdown Clock (Đồng hồ đếm ngược Đấu trường Luyện tập).
 */
export function getArenaCountdownVisualState(
  remainingSec: number,
  durationSec: number
): {
  percent: number;
  urgencyLevel: 'normal' | 'warning' | 'critical' | 'expired';
  statusLabel: string;
  progressBarClass: string;
  timerBadgeClass: string;
} {
  const safeDuration = Math.max(10, Number(durationSec) || 300);
  const clampedRemaining = Math.max(0, Math.floor(remainingSec));
  const percent = Math.max(
    0,
    Math.min(100, Math.round((clampedRemaining / safeDuration) * 100))
  );

  if (clampedRemaining <= 0) {
    return {
      percent: 0,
      urgencyLevel: 'expired',
      statusLabel: '⏰ Đã hết giờ làm bài Đấu trường',
      progressBarClass: 'bg-rose-600',
      timerBadgeClass: 'bg-rose-700 text-white border-rose-300',
    };
  }

  if (clampedRemaining <= 60 || percent <= 20) {
    return {
      percent,
      urgencyLevel: 'critical',
      statusLabel: '🔴 Cảnh báo: Sắp hết giờ! Khẩn trương hoàn thành!',
      progressBarClass:
        'bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 animate-pulse',
      timerBadgeClass:
        'bg-rose-600 text-white border-rose-200 animate-pulse shadow-lg',
    };
  }

  if (clampedRemaining <= 120 || percent <= 45) {
    return {
      percent,
      urgencyLevel: 'warning',
      statusLabel: '🟡 Chú ý tốc độ: Thời gian đang trôi nhanh!',
      progressBarClass:
        'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600',
      timerBadgeClass: 'bg-amber-500 text-slate-950 border-amber-200',
    };
  }

  return {
    percent,
    urgencyLevel: 'normal',
    statusLabel: '🟢 Đang mở Đấu trường Luyện tập',
    progressBarClass:
      'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400',
    timerBadgeClass: 'bg-black/40 text-amber-300 border-amber-400/40',
  };
}

/**
 * Generates a crisp 16:9 SVG Data URL slide image when a slide does not yet have an uploaded bitmap imageUrl,
 * ensuring the Slide Presenter & Student Live Room always display a genuine <img> Slide Image.
 */
export function generateFallbackSlideSvgDataUrl(params: {
  grade: number;
  period: number;
  slideIndex: number;
  totalSlides: number;
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  highlightNote?: string;
}): string {
  const esc = (str: string) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const bullets = (params.bulletPoints || []).slice(0, 4);
  const bulletSvg = bullets
    .map((b, i) => {
      const y = 310 + i * 74;
      const truncated = b.length > 92 ? b.slice(0, 89) + '...' : b;
      return `
        <g transform="translate(88, ${y})">
          <rect x="0" y="-26" width="38" height="38" rx="12" fill="#4f46e5" />
          <text x="19" y="0" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="800">${
            i + 1
          }</text>
          <text x="56" y="-1" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="22" font-weight="600">${esc(
            truncated
          )}</text>
        </g>
      `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="55%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="1160" cy="110" r="210" fill="#4f46e5" opacity="0.14"/>
    <circle cx="120" cy="640" r="180" fill="#ea580c" opacity="0.12"/>
    <rect x="64" y="48" width="1152" height="624" rx="28" fill="#1e293b" fill-opacity="0.55" stroke="#475569" stroke-width="2"/>
    <rect x="88" y="78" width="360" height="42" rx="21" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
    <text x="268" y="105" text-anchor="middle" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="17" font-weight="800">KHỐI ${
      params.grade
    } • TIẾT ${params.period} • SLIDE ${params.slideIndex + 1}/${
    params.totalSlides
  }</text>
    <text x="1180" y="105" text-anchor="end" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" font-weight="700">CHUẨN GDPT 2018 TIN HỌC</text>
    <text x="88" y="182" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="900">${esc(
      params.title.length > 62 ? params.title.slice(0, 59) + '...' : params.title
    )}</text>
    <text x="88" y="226" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="21" font-weight="600">${esc(
      params.subtitle || 'Kiến thức trọng tâm bài giảng trực tuyến đồng bộ'
    )}</text>
    <line x1="88" y1="252" x2="1192" y2="252" stroke="#334155" stroke-width="2"/>
    ${bulletSvg}
    <rect x="88" y="596" width="1104" height="50" rx="14" fill="#0f172a" fill-opacity="0.7" stroke="#334155" stroke-width="1"/>
    <text x="112" y="627" fill="#fcd34d" font-family="system-ui, sans-serif" font-size="18" font-weight="700">💡 ${esc(
      params.highlightNote ||
        'Slide bài giảng đồng bộ trực tiếp từ Giáo viên sang màn hình Học sinh'
    )}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export type IsolatedLiveActivityId =
  | 'slide'
  | 'hd1'
  | 'hd2'
  | 'hd3'
  | 'hd3-practice'
  | 'hd4';

/**
 * Builds the initial Live session state when the Teacher clicks "Live Tiết X" in TeacherPortal:
 * - Enters the Live room in standby mode (`activeLiveView: 'waiting'`)
 * - Does NOT automatically activate or unlock any learning activity (Slide, HĐ 1, HĐ 2, HĐ 3, HĐ 3 Thực hành, HĐ 4 are all locked).
 */
export function buildStartLiveSessionStandbyState<T extends Record<string, any>>(
  prev: T,
  params: {
    grade: 6 | 7 | 8 | 9;
    period: number;
    classId: string;
  }
): T & Record<string, any> {
  const { grade, period, classId } = params;
  const lessonKey = `k${grade}-tiet-${period}`;
  return {
    ...prev,
    isBroadcasting: true,
    activeGrade: grade,
    activePeriod: period,
    activeClassId: classId,
    activeStage: prev.activeStage || 1,
    activeLiveView: 'waiting',
    unlockedSlideDeckByLesson: {
      ...(prev.unlockedSlideDeckByLesson || {}),
      [lessonKey]: false,
    },
    unlockedPracticeStage3ByLesson: {
      ...(prev.unlockedPracticeStage3ByLesson || {}),
      [lessonKey]: false,
    },
    unlockedStagesByLesson: {
      ...(prev.unlockedStagesByLesson || {}),
      [lessonKey]: {
        1: false,
        2: false,
        3: false,
        4: false,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Builds the state when the Teacher clicks "Phát Live" for a specific isolated activity:
 * - Activates and unlocks ONLY that single activity (`activity`)
 * - Strictly locks all other activities so there is zero cross-coupling between activities.
 */
export function buildBroadcastSingleActivityState<T extends Record<string, any>>(
  prev: T,
  params: {
    grade: 6 | 7 | 8 | 9;
    period: number;
    classId: string;
    activity: IsolatedLiveActivityId;
    slideIndex?: number;
    slideSyncVersion?: number;
    arenaDurationSec?: number;
    pushPayload?: any;
  }
): T & Record<string, any> {
  const {
    grade,
    period,
    classId,
    activity,
    slideIndex,
    slideSyncVersion,
    arenaDurationSec = 300,
    pushPayload,
  } = params;
  const lessonKey = `k${grade}-tiet-${period}`;
  const nowIso = new Date().toISOString();

  const stageForActivity: 1 | 2 | 3 | 4 =
    activity === 'hd1'
      ? 1
      : activity === 'hd2'
      ? 2
      : activity === 'hd3' || activity === 'hd3-practice'
      ? 3
      : activity === 'hd4'
      ? 4
      : (prev.activeStage as 1 | 2 | 3 | 4) || 1;

  return {
    ...prev,
    isBroadcasting: true,
    activeGrade: grade,
    activePeriod: period,
    activeClassId: classId,
    activeStage: stageForActivity,
    activeLiveView: activity,
    unlockedSlideDeckByLesson: {
      ...(prev.unlockedSlideDeckByLesson || {}),
      [lessonKey]: activity === 'slide',
    },
    unlockedPracticeStage3ByLesson: {
      ...(prev.unlockedPracticeStage3ByLesson || {}),
      [lessonKey]: activity === 'hd3-practice',
    },
    unlockedStagesByLesson: {
      ...(prev.unlockedStagesByLesson || {}),
      [lessonKey]: {
        1: activity === 'hd1',
        2: activity === 'hd2',
        3: activity === 'hd3',
        4: activity === 'hd4',
      },
    },
    ...(activity === 'slide' && typeof slideIndex === 'number'
      ? {
          activeSlideIndexByLesson: {
            ...(prev.activeSlideIndexByLesson || {}),
            [lessonKey]: slideIndex,
          },
          slideSyncVersionByLesson: {
            ...(prev.slideSyncVersionByLesson || {}),
            [lessonKey]: slideSyncVersion ?? Date.now(),
          },
        }
      : {}),
    ...(activity === 'hd3'
      ? {
          arenaCountdownStateByLesson: {
            ...(prev.arenaCountdownStateByLesson || {}),
            [lessonKey]: {
              isRunning: true,
              durationSec: arenaDurationSec,
              startedAtIso: nowIso,
            },
          },
        }
      : {}),
    ...(pushPayload ? { lastPushNotification: pushPayload } : {}),
    updatedAt: nowIso,
  };
}

/**
 * Builds the updated session state when the Teacher ends any individual activity or Slide presentation:
 * - Sets `activeLiveView = 'waiting'` so the session stops cleanly at that exact spot without jumping to any other activity.
 * - Closes/locks Slide and all activities ({ 1: false, 2: false, 3: false, 4: false }) until the Teacher explicitly starts another activity.
 * - Stops slide auto-advance, explanation video playback, and arena timer.
 */
export function buildStopSingleActivityState<T extends Record<string, any>>(
  prev: T,
  lessonKey: string
): T & Record<string, any> {
  const prevVideo = prev.slideVideoStateByLesson?.[lessonKey];
  const prevAuto = prev.slideAutoAdvanceStateByLesson?.[lessonKey];
  const prevArena = prev.arenaCountdownStateByLesson?.[lessonKey];
  const nowIso = new Date().toISOString();
  return {
    ...prev,
    activeLiveView: 'waiting',
    unlockedSlideDeckByLesson: {
      ...(prev.unlockedSlideDeckByLesson || {}),
      [lessonKey]: false,
    },
    unlockedStagesByLesson: {
      ...(prev.unlockedStagesByLesson || {}),
      [lessonKey]: {
        1: false,
        2: false,
        3: false,
        4: false,
      },
    },
    unlockedPracticeStage3ByLesson: {
      ...(prev.unlockedPracticeStage3ByLesson || {}),
      [lessonKey]: false,
    },
    slideVideoStateByLesson: prevVideo
      ? {
          ...(prev.slideVideoStateByLesson || {}),
          [lessonKey]: {
            ...prevVideo,
            isPlaying: false,
            updatedAt: nowIso,
          },
        }
      : prev.slideVideoStateByLesson,
    slideAutoAdvanceStateByLesson: prevAuto
      ? {
          ...(prev.slideAutoAdvanceStateByLesson || {}),
          [lessonKey]: {
            ...prevAuto,
            enabled: false,
          },
        }
      : prev.slideAutoAdvanceStateByLesson,
    arenaCountdownStateByLesson: prevArena
      ? {
          ...(prev.arenaCountdownStateByLesson || {}),
          [lessonKey]: {
            ...prevArena,
            isRunning: false,
          },
        }
      : prev.arenaCountdownStateByLesson,
    updatedAt: nowIso,
  };
}

export function buildEndSlidePresentationState<T extends Record<string, any>>(
  prev: T,
  lessonKey: string
): T {
  return buildStopSingleActivityState(prev, lessonKey);
}

/**
 * Safely normalizes any LiveClassroomSession object loaded from PostgreSQL / Supabase / localStorage
 * so missing or null nested maps never cause a white-screen TypeError during render.
 */
export function normalizeLiveSession<T extends Record<string, any>>(
  raw: any,
  defaultSession: T
): T {
  if (!raw || typeof raw !== 'object') {
    return defaultSession;
  }
  // Reject diagnostic or keep-alive payloads that are not actual LiveClassroomSession objects
  if ('testMessage' in raw || 'pingCount' in raw || 'scheduleCron' in raw) {
    return defaultSession;
  }

  const mergedUnlockedStages: Record<string, Record<1 | 2 | 3 | 4, boolean>> = {
    ...(defaultSession.unlockedStagesByLesson || {}),
  };
  if (raw.unlockedStagesByLesson && typeof raw.unlockedStagesByLesson === 'object') {
    for (const [k, val] of Object.entries(raw.unlockedStagesByLesson)) {
      if (val && typeof val === 'object') {
        const st = val as Record<string, any>;
        mergedUnlockedStages[k] = {
          1: Boolean(st[1]),
          2: Boolean(st[2]),
          3: Boolean(st[3]),
          4: Boolean(st[4]),
        };
      }
    }
  }

  const rawGrade = Number(raw.activeGrade);
  const safeGrade = ([6, 7, 8, 9].includes(rawGrade)
    ? rawGrade
    : defaultSession.activeGrade || 6) as 6 | 7 | 8 | 9;
  const rawPeriod = Number(raw.activePeriod);
  const safePeriod =
    rawPeriod >= 1 && rawPeriod <= 29 ? rawPeriod : defaultSession.activePeriod || 1;
  const rawStage = Number(raw.activeStage);
  const safeStage = ([1, 2, 3, 4].includes(rawStage)
    ? rawStage
    : defaultSession.activeStage || 1) as 1 | 2 | 3 | 4;

  return {
    ...defaultSession,
    ...raw,
    isBroadcasting:
      typeof raw.isBroadcasting === 'boolean'
        ? raw.isBroadcasting
        : Boolean(defaultSession.isBroadcasting),
    activeGrade: safeGrade,
    activePeriod: safePeriod,
    activeStage: safeStage,
    activeClassId:
      typeof raw.activeClassId === 'string' && raw.activeClassId.trim().length > 0
        ? raw.activeClassId
        : defaultSession.activeClassId || '6A10',
    activeLiveView:
      typeof raw.activeLiveView === 'string' && raw.activeLiveView.length > 0
        ? raw.activeLiveView
        : defaultSession.activeLiveView || 'waiting',
    unlockedStagesByLesson: mergedUnlockedStages,
    unlockedPracticeStage3ByLesson:
      raw.unlockedPracticeStage3ByLesson &&
      typeof raw.unlockedPracticeStage3ByLesson === 'object'
        ? raw.unlockedPracticeStage3ByLesson
        : defaultSession.unlockedPracticeStage3ByLesson || {},
    unlockedSlideDeckByLesson:
      raw.unlockedSlideDeckByLesson &&
      typeof raw.unlockedSlideDeckByLesson === 'object'
        ? raw.unlockedSlideDeckByLesson
        : defaultSession.unlockedSlideDeckByLesson || {},
    ...(() => {
      const syncResolved = resolveMonotonicSlideSyncState({
        currentSlideIndices: defaultSession.activeSlideIndexByLesson || {},
        currentSyncVersions: defaultSession.slideSyncVersionByLesson || {},
        incomingSlideIndices:
          raw.activeSlideIndexByLesson &&
          typeof raw.activeSlideIndexByLesson === 'object'
            ? raw.activeSlideIndexByLesson
            : {},
        incomingSyncVersions:
          raw.slideSyncVersionByLesson &&
          typeof raw.slideSyncVersionByLesson === 'object'
            ? raw.slideSyncVersionByLesson
            : {},
      });
      return {
        activeSlideIndexByLesson: syncResolved.activeSlideIndexByLesson,
        slideSyncVersionByLesson: syncResolved.slideSyncVersionByLesson,
      };
    })(),
    lectureSlidesByLesson: (() => {
      const sourceDecks =
        raw.lectureSlidesByLesson && typeof raw.lectureSlidesByLesson === 'object'
          ? raw.lectureSlidesByLesson
          : defaultSession.lectureSlidesByLesson || {};
      const cleanedDecks: Record<string, any> = {};
      for (const [k, deck] of Object.entries(sourceDecks)) {
        if (deck && !isLegacyDemoSlideDeck(deck)) {
          cleanedDecks[k] = deck;
        }
      }
      return cleanedDecks;
    })(),
    whiteboardByLesson:
      raw.whiteboardByLesson && typeof raw.whiteboardByLesson === 'object'
        ? raw.whiteboardByLesson
        : defaultSession.whiteboardByLesson || {},
    slideAutoAdvanceStateByLesson:
      raw.slideAutoAdvanceStateByLesson &&
      typeof raw.slideAutoAdvanceStateByLesson === 'object'
        ? raw.slideAutoAdvanceStateByLesson
        : defaultSession.slideAutoAdvanceStateByLesson || {},
    slideVideoStateByLesson:
      raw.slideVideoStateByLesson &&
      typeof raw.slideVideoStateByLesson === 'object'
        ? raw.slideVideoStateByLesson
        : defaultSession.slideVideoStateByLesson || {},
    arenaCountdownStateByLesson:
      raw.arenaCountdownStateByLesson &&
      typeof raw.arenaCountdownStateByLesson === 'object'
        ? raw.arenaCountdownStateByLesson
        : defaultSession.arenaCountdownStateByLesson || {},
    taughtPeriodsByClass:
      raw.taughtPeriodsByClass && typeof raw.taughtPeriodsByClass === 'object'
        ? raw.taughtPeriodsByClass
        : defaultSession.taughtPeriodsByClass || {},
    learnedPeriodsByStudent:
      raw.learnedPeriodsByStudent && typeof raw.learnedPeriodsByStudent === 'object'
        ? raw.learnedPeriodsByStudent
        : defaultSession.learnedPeriodsByStudent || {},
    customWorksheetsByLesson:
      raw.customWorksheetsByLesson && typeof raw.customWorksheetsByLesson === 'object'
        ? raw.customWorksheetsByLesson
        : defaultSession.customWorksheetsByLesson || {},
    verifiedLessonsMap: {
      ...(defaultSession.verifiedLessonsMap || {}),
      ...(raw.verifiedLessonsMap && typeof raw.verifiedLessonsMap === 'object'
        ? raw.verifiedLessonsMap
        : {}),
    },
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt.length > 0
        ? raw.updatedAt
        : new Date().toISOString(),
  };
}

/**
 * Normalizes student roster rows from either camelCase API or snake_case PostgreSQL/Supabase tables.
 */
export function normalizeStudentRosterList<T extends Record<string, any> = Record<string, any>>(
  rawList: any,
  fallbackList: T[] = []
): T[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return fallbackList;
  }
  const normalized = rawList
    .filter((item) => item && typeof item === 'object' && (item.id || item.student_code))
    .map((r) => {
      const id = String(r.id || r.student_code || '61008');
      const classId = String(r.classId || r.class_id || '6A10');
      const rawGrade = Number(r.grade) || Number(classId.charAt(0)) || 6;
      const grade = ([6, 7, 8, 9].includes(rawGrade) ? rawGrade : 6) as 6 | 7 | 8 | 9;
      return {
        id,
        username: String(r.username || id),
        dob: String(r.dob || '15/05/2013'),
        stationNumber: String(r.stationNumber || r.station_number || '01'),
        name: String(r.name || r.fullName || r.full_name || r.display_name || 'Học sinh CloudPlay'),
        classId,
        grade,
        passwordDefault: String(r.passwordDefault || r.password_default || '12345'),
        xp: Number.isFinite(Number(r.xp)) ? Number(r.xp) : 100,
        streakDays: Number.isFinite(Number(r.streakDays ?? r.streak_days))
          ? Number(r.streakDays ?? r.streak_days)
          : 1,
        stars: Number.isFinite(Number(r.stars)) ? Number(r.stars) : 3,
        groupNumber: (Number(r.groupNumber ?? r.group_number) || 1) as 1 | 2 | 3 | 4,
        partnerName: String(r.partnerName || r.partner_name || 'Bạn cùng bàn Cloud'),
        partnerId: String(r.partnerId || r.partner_id || '61008'),
        avgScore: Number.isFinite(Number(r.avgScore ?? r.avg_score))
          ? Number(r.avgScore ?? r.avg_score)
          : 8.5,
        submissionStatus: (r.submissionStatus ||
          r.submission_status ||
          'Chưa nộp') as 'Đã nộp' | 'Đang làm' | 'Chưa nộp',
      } as unknown as T;
    });
  return normalized.length > 0 ? normalized : fallbackList;
}

/**
 * Normalizes classroom rows from either camelCase API or snake_case PostgreSQL/Supabase tables.
 */
export function normalizeClassroomList<T extends Record<string, any> = Record<string, any>>(
  rawList: any,
  fallbackList: T[] = []
): T[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return fallbackList;
  }
  const normalized = rawList
    .filter((item) => item && typeof item === 'object' && item.id)
    .map((c) => {
      const id = String(c.id);
      const rawGrade = Number(c.grade) || Number(id.charAt(0)) || 6;
      const grade = ([6, 7, 8, 9].includes(rawGrade) ? rawGrade : 6) as 6 | 7 | 8 | 9;
      return {
        id,
        name: String(c.name || `Lớp ${id}`),
        grade,
        schoolYear: String(c.schoolYear || c.school_year || '2024 - 2025'),
        roomName: String(c.roomName || c.room_name || 'Phòng Lab Cloud'),
        studentCount: Number.isFinite(Number(c.studentCount ?? c.student_count))
          ? Number(c.studentCount ?? c.student_count)
          : 40,
      } as unknown as T;
    });
  return normalized.length > 0 ? normalized : fallbackList;
}


