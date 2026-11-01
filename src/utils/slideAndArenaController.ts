import {
  resolveMonotonicSlideSyncState,
  isLegacyDemoSlideDeck,
  generateFallbackSlideSvgDataUrl,
  ensureDeckSlideImages,
} from './slideDeckManager';

export { generateFallbackSlideSvgDataUrl };

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
 * Normalizes an activity or sub-exercise key for consistency across views.
 */
export function normalizeActivityKey(activityKey: string | number): string {
  const s = String(activityKey).trim().toLowerCase();
  if (s === '1' || s === 'hd1' || s === 'stage1') return '1';
  if (s === '2' || s === 'hd2' || s === 'stage2') return '2';
  if (s === '3' || s === 'hd3' || s === 'stage3') return '3';
  if (s === 'hd3-practice' || s === 'practice' || s === 'drive') return 'hd3-practice';
  if (s === '4' || s === 'hd4' || s === 'stage4') return '4';
  if (s === 'drag' || s === 'hd2_drag' || s === 'keo-tha') return 'hd2_drag';
  if (s === 'fill' || s === 'hd2_fill' || s === 'dien-khuyet') return 'hd2_fill';
  if (s === 'match' || s === 'hd2_match' || s === 'noi-cot') return 'hd2_match';
  if (s === 'short' || s === 'hd2_short' || s === 'tra-loi-ngan' || s === 'tu-luan') return 'hd2_short';
  return s;
}

/**
 * Checks whether an activity or specific exercise has been finalized ("Chốt") by the teacher,
 * preventing any student from submitting or modifying their answers.
 *
 * Rules:
 * - If the overall activity is finalized (e.g. Activity 2), all its sub-exercises ('hd2_drag', 'hd2_fill', etc.) are also considered finalized.
 * - If a specific sub-exercise is finalized, it returns true for that exercise.
 */
export function isActivityFinalized(
  session: { finalizedActivitiesByLesson?: Record<string, Record<string, boolean>> } | undefined | null,
  lessonKey: string,
  activityKey: string | number
): boolean {
  if (!session?.finalizedActivitiesByLesson) return false;
  const lessonFinalized = session.finalizedActivitiesByLesson[lessonKey];
  if (!lessonFinalized || typeof lessonFinalized !== 'object') return false;

  const normKey = normalizeActivityKey(activityKey);

  // Direct check
  if (lessonFinalized[normKey] === true) return true;

  // Check aliases
  if (normKey === '1' && (lessonFinalized['hd1'] === true || lessonFinalized['1'] === true)) return true;
  if (normKey === '2' && (lessonFinalized['hd2'] === true || lessonFinalized['2'] === true)) return true;
  if (normKey === '3' && (lessonFinalized['hd3'] === true || lessonFinalized['3'] === true)) return true;
  if (normKey === '4' && (lessonFinalized['hd4'] === true || lessonFinalized['4'] === true)) return true;
  if (normKey === 'hd3-practice' && (lessonFinalized['hd3-practice'] === true || lessonFinalized['practice'] === true)) return true;

  // Sub-exercises of Stage 2: If the entire Stage 2 is finalized, the sub-exercise is finalized
  if (normKey.startsWith('hd2_')) {
    if (lessonFinalized['2'] === true || lessonFinalized['hd2'] === true) {
      return true;
    }
  }

  return false;
}

/**
 * Toggles or sets the finalized ("Chốt") state of a specific activity or exercise.
 * When an activity is finalized, students cannot submit further work.
 */
export function buildToggleFinalizeActivityState<T extends Record<string, any>>(
  prev: T,
  params: {
    lessonKey: string;
    activityKey: string | number;
    finalized?: boolean;
    activityTitle?: string;
  }
): T & Record<string, any> {
  const { lessonKey, activityKey, activityTitle } = params;
  const normKey = normalizeActivityKey(activityKey);
  const nowIso = new Date().toISOString();

  const prevLessonFinalized = prev.finalizedActivitiesByLesson?.[lessonKey] || {};
  const currentlyFinalized = isActivityFinalized(prev, lessonKey, normKey);
  const nextFinalized = params.finalized !== undefined ? params.finalized : !currentlyFinalized;

  const updatedLessonMap = {
    ...prevLessonFinalized,
    [normKey]: nextFinalized,
  };

  // Keep aliases in sync
  if (normKey === '1') updatedLessonMap['hd1'] = nextFinalized;
  if (normKey === '2') {
    updatedLessonMap['hd2'] = nextFinalized;
    // When locking the whole Stage 2, also mark sub-exercises
    if (nextFinalized) {
      updatedLessonMap['hd2_drag'] = true;
      updatedLessonMap['hd2_fill'] = true;
      updatedLessonMap['hd2_match'] = true;
      updatedLessonMap['hd2_short'] = true;
    }
  }
  if (normKey === '3') updatedLessonMap['hd3'] = nextFinalized;
  if (normKey === 'hd3-practice') updatedLessonMap['practice'] = nextFinalized;
  if (normKey === '4') updatedLessonMap['hd4'] = nextFinalized;

  const pushPayload = nextFinalized
    ? {
        id: `fin-${Date.now()}`,
        title: '🔒 Đã chốt hoạt động',
        body: `Giáo viên đã chốt ${activityTitle || `Hoạt động ${activityKey}`}. Đã đóng toàn bộ cổng nộp bài!`,
        timestampIso: nowIso,
      }
    : null;

  return {
    ...prev,
    finalizedActivitiesByLesson: {
      ...(prev.finalizedActivitiesByLesson || {}),
      [lessonKey]: updatedLessonMap,
    },
    ...(pushPayload ? { lastPushNotification: pushPayload } : {}),
    updatedAt: nowIso,
  };
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
    finalizedActivitiesByLesson:
      raw.finalizedActivitiesByLesson &&
      typeof raw.finalizedActivitiesByLesson === 'object'
        ? raw.finalizedActivitiesByLesson
        : defaultSession.finalizedActivitiesByLesson || {},
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
      const fallbackDecks =
        defaultSession.lectureSlidesByLesson &&
        typeof defaultSession.lectureSlidesByLesson === 'object'
          ? defaultSession.lectureSlidesByLesson
          : {};

      const allDeckKeys = Array.from(
        new Set([...Object.keys(sourceDecks), ...Object.keys(fallbackDecks)])
      );
      const cleanedDecks: Record<string, any> = {};

      for (const k of allDeckKeys) {
        const rawDeck = sourceDecks[k];
        const fallbackDeck = fallbackDecks[k];
        const baseDeck = rawDeck || fallbackDeck;
        if (!baseDeck) {
          continue;
        }

        const isUserUploaded = Boolean(
          rawDeck?.isUserUploaded ?? fallbackDeck?.isUserUploaded ?? true
        );
        const mergedDeck = {
          ...fallbackDeck,
          ...rawDeck,
          isUserUploaded,
        };

        if (isLegacyDemoSlideDeck(mergedDeck)) {
          continue;
        }

        // Parse grade and period from key (e.g. "k6-tiet-1" or "k7-tiet-12")
        const keyMatch = /^k(\d+)-tiet-(\d+)$/.exec(k);
        const deckGrade = keyMatch ? Number(keyMatch[1]) : safeGrade;
        const deckPeriod = keyMatch ? Number(keyMatch[2]) : safePeriod;

        const fallbackSlides = Array.isArray(fallbackDeck?.slides)
          ? fallbackDeck.slides
          : [];
        const rawSlides = Array.isArray(mergedDeck.slides) ? mergedDeck.slides : [];

        // Merge raw slides with fallback slides if raw lost imageUrl
        const mergedSlides = rawSlides.map((slide: any, idx: number) => {
          if (!slide || typeof slide !== 'object') return slide;
          const fallback = fallbackSlides[idx];
          const hasImage =
            typeof slide.imageUrl === 'string' &&
            slide.imageUrl.trim().length > 0;
          const hasFallbackImage =
            typeof fallback?.imageUrl === 'string' &&
            fallback.imageUrl.trim().length > 0;

          return {
            ...fallback,
            ...slide,
            imageUrl: hasImage
              ? slide.imageUrl
              : hasFallbackImage
              ? fallback.imageUrl
              : slide.imageUrl,
          };
        });

        // Ensure EVERY slide has a valid, sharp imageUrl so it NEVER falls back to plain text
        const safeSlides = ensureDeckSlideImages(mergedSlides, {
          grade: deckGrade,
          period: deckPeriod,
        });

        cleanedDecks[k] = {
          ...mergedDeck,
          slides: safeSlides,
          isUserUploaded,
        };
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


