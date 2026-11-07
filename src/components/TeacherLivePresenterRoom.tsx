import React, { useState, useEffect, useRef } from 'react';
import {
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
  type StudentFocusAlertItem,
} from '../data/mockCurriculumData';
import {
  playStageBroadcastSound,
  triggerSynchronizedCelebration,
} from '../utils/soundEffects';
import {
  getDefaultLectureSlides,
  PRESET_EXPLANATION_VIDEOS,
  convertSlideFileToPages,
} from './LectureSlideManagerModal';
import {
  resolvePresenterKeyAction,
  computeArenaRemainingSeconds,
  formatCountdownMmSs,
  isFileStorageSlideUrl,
  buildEndSlidePresentationState,
  buildBroadcastSingleActivityState,
  buildStopSingleActivityState,
  isActivityFinalized,
  buildToggleFinalizeActivityState,
  generateFallbackSlideSvgDataUrl,
} from '../utils/slideAndArenaController';
import { LiveStudentProgressTracker } from './LiveStudentProgressTracker';
import { ActivityCompletionVisualizer } from './ActivityCompletionVisualizer';
import { LiveClassroomWaitingRoom } from './LiveClassroomWaitingRoom';
import {
  resolveSlideSourceInput,
  buildFixedSlideFolderMapping,
  buildFixedFolderPdfSlideCacheDeck,
  normalizeFixedSlideRootFolder,
  matchFileToGradeAndPeriod,
  isRealRenderedPdfSlideDeck,
  BLANK_WHITE_SLIDE_DATA_URL,
  DEFAULT_FIXED_SLIDE_ROOT_FOLDER,
  pruneSlideDeckMemory,
  formatInteractiveWebSlideUrl,
} from '../utils/slideDeckManager';
import {
  saveSlideDeckToIndexedDb,
  getSlideDeckFromIndexedDb,
  deleteSlideDeckFromIndexedDb,
} from '../utils/indexedDbSlideStorage';
import { getGoogleSheetsAccessToken } from '../services/firebaseClient';
import {
  getSavedGoogleSheetsConfig,
  loadLessonSlideDeckFromGoogleSheet,
} from '../utils/googleSheetsSlideDb';

interface TeacherLivePresenterRoomProps {
  grade: 6 | 7 | 8 | 9;
  period: number;
  classId: string;
  periodSpec: CurriculumPeriodSpec;
  liveSession?: LiveClassroomSession;
  students: StudentRosterItem[];
  onExit: () => void;
  onUpdateLiveSession: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onShowToast: (msg: string) => void;
}

export const TeacherLivePresenterRoom: React.FC<TeacherLivePresenterRoomProps> = ({
  grade,
  period,
  classId,
  periodSpec,
  liveSession,
  students,
  onExit,
  onUpdateLiveSession,
  onShowToast,
}) => {
  const lessonKey = `k${grade}-tiet-${period}`;
  const currentUnlockedMap: Record<1 | 2 | 3 | 4, boolean> =
    liveSession?.unlockedStagesByLesson?.[lessonKey] || {
      1: false,
      2: false,
      3: false,
      4: false,
    };

  const isSlideUnlocked = Boolean(
    liveSession?.unlockedSlideDeckByLesson?.[lessonKey] ?? false
  );
  const isPracticeStage3Unlocked = Boolean(
    liveSession?.unlockedPracticeStage3ByLesson?.[lessonKey] ?? false
  );
  const currentSlideIndex =
    liveSession?.activeSlideIndexByLesson?.[lessonKey] ?? 0;

  const [fixedSlideRootFolder, setFixedSlideRootFolder] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved =
        window.localStorage.getItem('cloudplay_fixed_slide_folder_v1') ||
        DEFAULT_FIXED_SLIDE_ROOT_FOLDER;
      return normalizeFixedSlideRootFolder(saved);
    }
    return DEFAULT_FIXED_SLIDE_ROOT_FOLDER;
  });
  const fixedFolderMapping = buildFixedSlideFolderMapping(grade, period, fixedSlideRootFolder);

  const existingSlideDeck = liveSession?.lectureSlidesByLesson?.[lessonKey];
  const defaultMappedPdfDeck = buildFixedFolderPdfSlideCacheDeck({
    grade,
    period,
    rootFolder: fixedSlideRootFolder,
    lessonTitle: periodSpec.lessonTitle,
    topic: periodSpec.topic,
    yccd: periodSpec.yccd,
  });
  const slidePages = isRealRenderedPdfSlideDeck(existingSlideDeck)
    ? existingSlideDeck!.slides
    : defaultMappedPdfDeck.slides;
  const safeCurrentSlideIndex =
    slidePages.length > 0
      ? Math.max(0, Math.min(currentSlideIndex, slidePages.length - 1))
      : 0;
  const activeSlidePage =
    slidePages.length > 0 ? slidePages[safeCurrentSlideIndex] : undefined;

  const [quickSlidePathOrUrl, setQuickSlidePathOrUrl] = useState<string>('');
  const [isQuickSlideLoading, setIsQuickSlideLoading] = useState<boolean>(false);
  const [quickSlideStatusText, setQuickSlideStatusText] = useState<string>('');
  const [isAutoMappingFolder, setIsAutoMappingFolder] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideStageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleFsChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async (forceState?: boolean) => {
    if (typeof document === 'undefined') return;
    const nextState = typeof forceState === 'boolean' ? forceState : !isFullscreen;
    setIsFullscreen(nextState);

    if (nextState) {
      setActiveTab('slide');
      // Blur any active input so ArrowLeft / ArrowRight work immediately in Full Screen
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      try {
        const targetEl = slideStageContainerRef.current || document.documentElement;
        if (!document.fullscreenElement && targetEl.requestFullscreen) {
          await targetEl.requestFullscreen({ navigationUI: 'hide' } as any);
        }
      } catch {
        // Fallback to fixed inset-0 z-[100] Full Screen overlay when inside restricted iframe
      }
      onShowToast(
        '🖥️ Đã BẬT Chế độ Toàn màn hình (Full Screen) trình chiếu Slide — Nhấn phím ← / → để chuyển slide từ xa, nhấn Esc hoặc F để thoát!'
      );
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // ignore exitFullscreen warning
      }
      onShowToast('🗗 Đã thoát Chế độ Toàn màn hình (Full Screen).');
    }
  };

  const activeStage: 1 | 2 | 3 | 4 = (liveSession?.activeStage as 1 | 2 | 3 | 4) || 1;
  const [activeTab, setActiveTab] = useState<
    'waiting' | 'slide' | 'theo-doi-tien-do' | 'hd1' | 'hd2' | 'hd3' | 'hd3-practice' | 'hd4' | 'ket-qua'
  >(() => {
    const view = liveSession?.activeLiveView;
    if (
      view === 'waiting' ||
      view === 'slide' ||
      view === 'hd1' ||
      view === 'hd2' ||
      view === 'hd3' ||
      view === 'hd3-practice' ||
      view === 'hd4'
    ) {
      return view;
    }
    return 'waiting';
  });
  const [rankingScope, setRankingScope] = useState<'class' | 'grade'>('class');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    if (liveSession?.activeLiveView === 'waiting') {
      setActiveTab('waiting');
    }
  }, [liveSession?.activeLiveView, grade, period, classId]);

  const handleOpenWaitingRoomLobby = () => {
    setActiveTab('waiting');
    onUpdateLiveSession((prev) => buildStopSingleActivityState(prev, lessonKey));
    playStageBroadcastSound();
    onShowToast(
      `🏫 Đã mở Phòng Chờ Phiên Live cho Lớp ${classId} — Đang đón học sinh vào chỗ ngồi 2 dãy bàn!`
    );
  };

  // Focus & Anti-Distraction Monitor State
  const [focusAlerts, setFocusAlerts] = useState<Record<string, StudentFocusAlertItem>>(() => {
    return liveSession?.studentFocusAlerts || {};
  });
  const [showFocusMonitorModal, setShowFocusMonitorModal] = useState<boolean>(false);

  // Low-Bandwidth Mode state (Tiết kiệm băng thông phòng máy)
  const isLowBandwidthMode = Boolean(liveSession?.lowBandwidthMode);

  // Web-Embed / Interactive Simulation Slide State
  const [isWebEmbedDrawerOpen, setIsWebEmbedDrawerOpen] = useState<boolean>(false);
  const [webEmbedInputUrl, setWebEmbedInputUrl] = useState<string>(() => {
    return liveSession?.webEmbedSlideUrl || '';
  });

  // Listen to Student Focus Alerts from BroadcastChannel & Firestore
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('cloudplay_realtime_sync');
    bc.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'STUDENT_FOCUS_ALERT' && data.alert) {
        const item: StudentFocusAlertItem = data.alert;
        setFocusAlerts((prev) => {
          const next = { ...prev, [item.studentId]: item };
          onUpdateLiveSession((ls) => ({
            ...ls,
            studentFocusAlerts: next,
            updatedAt: new Date().toISOString(),
          }));
          return next;
        });
      } else if (data.type === 'STUDENT_FOCUS_REGAINED' && data.studentId) {
        setFocusAlerts((prev) => {
          const existing = prev[data.studentId];
          if (!existing) return prev;
          const next = {
            ...prev,
            [data.studentId]: {
              ...existing,
              isCurrentlyBlurred: false,
            },
          };
          onUpdateLiveSession((ls) => ({
            ...ls,
            studentFocusAlerts: next,
            updatedAt: new Date().toISOString(),
          }));
          return next;
        });
      }
    };
    return () => bc.close();
  }, [onUpdateLiveSession]);

  useEffect(() => {
    if (liveSession?.studentFocusAlerts) {
      setFocusAlerts(liveSession.studentFocusAlerts);
    }
  }, [liveSession?.studentFocusAlerts]);

  const blurredStudentsList = Object.values(focusAlerts).filter((a) => a.isCurrentlyBlurred);
  const totalSwitchedCount = Object.values(focusAlerts).filter((a) => a.tabSwitchCount > 0).length;

  const handleToggleLowBandwidthMode = () => {
    const next = !isLowBandwidthMode;
    onUpdateLiveSession((prev) => ({
      ...prev,
      lowBandwidthMode: next,
      updatedAt: new Date().toISOString(),
    }));
    onShowToast(
      next
        ? '🌐 Đã BẬT Chế độ Tiết kiệm Băng thông Phòng máy: Nén xung đồng bộ & giảm tải switch mạng!'
        : '🌐 Đã TẮT Chế độ Tiết kiệm Băng thông: Trở về đồng bộ đầy đủ.'
    );
  };

  const handleCleanSlideMemory = () => {
    if (!existingSlideDeck || !Array.isArray(existingSlideDeck.slides)) {
      onShowToast('ℹ️ Bộ nhớ đệm slide hiện đang sạch sẽ, không cần dọn dẹp!');
      return;
    }
    const { prunedSlides, freedCount } = pruneSlideDeckMemory(
      existingSlideDeck.slides,
      safeCurrentSlideIndex,
      2
    );
    if (freedCount > 0) {
      onUpdateLiveSession((prev) => {
        const curDeck = prev.lectureSlidesByLesson?.[lessonKey];
        if (!curDeck) return prev;
        return {
          ...prev,
          lectureSlidesByLesson: {
            ...(prev.lectureSlidesByLesson || {}),
            [lessonKey]: {
              ...curDeck,
              slides: prunedSlides,
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });
      onShowToast(
        `🧹 Đã giải phóng thành công ${freedCount} slide khỏi bộ nhớ RAM! Giúp trình duyệt chạy nhẹ mượt trên máy tính 2GB-4GB RAM.`
      );
    } else {
      onShowToast('✨ Toàn bộ slide đã được tối ưu hóa bộ nhớ RAM ở mức tối đa!');
    }
  };

  const handleApplyWebEmbedSlide = (url: string) => {
    const formatted = formatInteractiveWebSlideUrl(url);
    if (!formatted) {
      onShowToast('⚠️ Vui lòng nhập đường dẫn Google Slides, Canva, Office 365 hoặc Mô phỏng web hợp lệ!');
      return;
    }
    onUpdateLiveSession((prev) => ({
      ...prev,
      slideDisplayMode: 'web-embed',
      webEmbedSlideUrl: formatted,
      updatedAt: new Date().toISOString(),
    }));
    setIsWebEmbedDrawerOpen(false);
    onShowToast('🌐 Đã chuyển sang Chế độ Trình chiếu Web/Google Slides tương tác có đầy đủ animation & video!');
  };

  const handleRevertToPdfSlide = () => {
    onUpdateLiveSession((prev) => ({
      ...prev,
      slideDisplayMode: 'pdf-canvas',
      updatedAt: new Date().toISOString(),
    }));
    onShowToast('📄 Đã quay lại Chế độ Trình chiếu Slide PDF nguyên bản.');
  };

  // Lucky wheel random student selection
  const [spinning, setSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);

  const classStudents = students.filter((s) => s.classId === classId);
  const gradeStudents = students.filter(
    (s) => s.grade === grade || Number(s.classId?.charAt(0)) === grade
  );

  const effectiveClassStudents = classStudents.length > 0 ? classStudents : gradeStudents;
  const rankedStudents = [
    ...(rankingScope === 'class' ? effectiveClassStudents : gradeStudents),
  ].sort((a, b) => b.xp - a.xp);

  const maxXpInList = Math.max(100, ...(rankedStudents.map((s) => s.xp) || [1000]));

  // Real-time Top Performers automatic glowing & flashing effect detection
  const [topPerformerAlert, setTopPerformerAlert] = useState<{
    id: string;
    name: string;
    partnerName?: string;
    xp: number;
  } | null>(null);
  const lastLeaderIdRef = useRef<string | null>(null);

  const currentTopLeaderId = rankedStudents[0]?.id || null;
  const currentTopLeaderXp = rankedStudents[0]?.xp || 0;

  useEffect(() => {
    if (rankedStudents.length > 0) {
      const currentLeader = rankedStudents[0];
      if (lastLeaderIdRef.current && lastLeaderIdRef.current !== currentLeader.id) {
        // Leader changed! Trigger Top Performer flashing alert & celebration
        setTopPerformerAlert({
          id: currentLeader.id,
          name: currentLeader.name,
          partnerName: currentLeader.partnerName,
          xp: currentLeader.xp,
        });
        triggerSynchronizedCelebration();
        onShowToast(
          `👑 TOP 1 BỨT PHÁ DẪN ĐẦU: ${currentLeader.name}${
            currentLeader.partnerName && currentLeader.partnerName !== 'Học cá nhân (1 mình)'
              ? ` & ${currentLeader.partnerName}`
              : ''
          } vừa vươn lên dẫn đầu bảng xếp hạng (${currentLeader.xp.toLocaleString()} XP)!`
        );
        const timer = setTimeout(() => {
          setTopPerformerAlert(null);
        }, 8000);
        lastLeaderIdRef.current = currentLeader.id;
        return () => clearTimeout(timer);
      }
      lastLeaderIdRef.current = currentLeader.id;
    }
  }, [currentTopLeaderId, currentTopLeaderXp]);

  // Simulate #2 student overtaking #1 to demonstrate real-time Top Performer flashing effect
  const handleSimulateTopPerformerTakeover = () => {
    if (rankedStudents.length < 2) return;
    const secondStudent = rankedStudents[1];
    const topXp = rankedStudents[0].xp;
    const boost = Math.max(150, topXp - secondStudent.xp + 150);
    secondStudent.xp += boost;
    secondStudent.stars = (secondStudent.stars || 0) + 2;

    lastLeaderIdRef.current = secondStudent.id;
    setTopPerformerAlert({
      id: secondStudent.id,
      name: secondStudent.name,
      partnerName: secondStudent.partnerName,
      xp: secondStudent.xp,
    });
    triggerSynchronizedCelebration();
    onShowToast(
      `👑 TOP 1 BỨT PHÁ DẪN ĐẦU: ${secondStudent.name}${
        secondStudent.partnerName && secondStudent.partnerName !== 'Học cá nhân (1 mình)'
          ? ` & ${secondStudent.partnerName}`
          : ''
      } vừa vươn lên dẫn đầu bảng xếp hạng (${secondStudent.xp.toLocaleString()} XP)!`
    );

    try {
      localStorage.setItem('cloudplay_students_roster_v4', JSON.stringify(students));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('cloudplay_realtime_sync');
        ch.postMessage({ type: 'ROSTER_UPDATED', students: [...students] });
        ch.close();
      }
    } catch {
      // ignore
    }

    onUpdateLiveSession((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Slide Auto-Advance Timer & Explanation Video Controller State
  const savedAutoAdvance = liveSession?.slideAutoAdvanceStateByLesson?.[lessonKey];
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(
    Boolean(savedAutoAdvance?.enabled)
  );
  const [autoAdvanceIntervalSec, setAutoAdvanceIntervalSec] = useState<number>(
    savedAutoAdvance?.intervalSec || 30
  );
  const [autoAdvanceCountdownSec, setAutoAdvanceCountdownSec] = useState<number>(
    savedAutoAdvance?.intervalSec || 30
  );

  const savedVideoState = liveSession?.slideVideoStateByLesson?.[lessonKey];
  const defaultSlideVideoUrl =
    activeSlidePage?.videoUrl ||
    savedVideoState?.videoUrl ||
    PRESET_EXPLANATION_VIDEOS[0].url;
  const defaultSlideVideoTitle =
    activeSlidePage?.videoTitle ||
    savedVideoState?.videoTitle ||
    PRESET_EXPLANATION_VIDEOS[0].title;
  const isExplanationVideoPlaying = Boolean(savedVideoState?.isPlaying);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState<string>('');

  // Practice Arena (Hoạt động 3) Countdown Timer State
  const arenaCountdownState = liveSession?.arenaCountdownStateByLesson?.[lessonKey];
  const [arenaDurationSec, setArenaDurationSec] = useState<number>(
    arenaCountdownState?.durationSec || 300
  );
  const [arenaRemainingSec, setArenaRemainingSec] = useState<number>(() =>
    computeArenaRemainingSeconds(arenaCountdownState)
  );

  useEffect(() => {
    const updateRemaining = () => {
      setArenaRemainingSec(
        computeArenaRemainingSeconds(
          liveSession?.arenaCountdownStateByLesson?.[lessonKey]
        )
      );
    };
    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [liveSession?.arenaCountdownStateByLesson, lessonKey]);

  const handleStartOrResetArenaCountdown = (durationSeconds = arenaDurationSec) => {
    setArenaDurationSec(durationSeconds);
    onUpdateLiveSession((prev) => ({
      ...prev,
      arenaCountdownStateByLesson: {
        ...(prev.arenaCountdownStateByLesson || {}),
        [lessonKey]: {
          isRunning: true,
          durationSec: durationSeconds,
          startedAtIso: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    }));
    onShowToast(
      `⏱️ Đã bắt đầu Đồng hồ đếm ngược Đấu trường Luyện tập (${formatCountdownMmSs(
        durationSeconds
      )}) đồng bộ sang màn hình học sinh!`
    );
  };

  const handleToggleArenaCountdownPause = () => {
    const currentArena = liveSession?.arenaCountdownStateByLesson?.[lessonKey];
    const currentlyRunning = Boolean(currentArena?.isRunning);
    const currentRem = computeArenaRemainingSeconds(currentArena);

    onUpdateLiveSession((prev) => ({
      ...prev,
      arenaCountdownStateByLesson: {
        ...(prev.arenaCountdownStateByLesson || {}),
        [lessonKey]: currentlyRunning
          ? {
              isRunning: false,
              durationSec: currentArena?.durationSec || arenaDurationSec,
              startedAtIso: new Date().toISOString(),
              remainingSecOnPause: currentRem,
            }
          : {
              isRunning: true,
              durationSec: currentRem > 0 ? currentRem : arenaDurationSec,
              startedAtIso: new Date().toISOString(),
            },
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  // Toggle Slide Bài Giảng lock/unlock synchronized with Student Live Room
  const handleToggleSlideLock = () => {
    const nextState = !isSlideUnlocked;
    const pushPayload = nextState
      ? {
          id: `push-${Date.now()}`,
          title: `🔔 PUSH NOTIFICATION: MỞ KHÓA SLIDE BÀI GIẢNG!`,
          body: `Thầy Đỗ Mạnh Trường vừa MỞ KHÓA Slide Bài giảng điện tử cho Lớp ${classId}. Hãy nhấp để xem đồng bộ ngay!`,
          stage: 'slide' as const,
          stageLabel: 'Slide Bài Giảng',
          lessonTitle: periodSpec.lessonTitle,
          classId,
          grade,
          period,
          timestampIso: new Date().toISOString(),
        }
      : null;

    onUpdateLiveSession((prev) => ({
      ...prev,
      unlockedSlideDeckByLesson: {
        ...(prev.unlockedSlideDeckByLesson || {}),
        [lessonKey]: nextState,
      },
      ...(pushPayload ? { lastPushNotification: pushPayload } : {}),
      updatedAt: new Date().toISOString(),
    }));
    onShowToast(
      nextState
        ? `🔓 Đã MỞ KHÓA & phát Push Notification Slide Bài giảng cho Lớp ${classId}!`
        : `🔒 Đã KHÓA Slide Bài giảng trên màn hình học sinh Lớp ${classId}!`
    );
  };

  // Broadcast Slide Bài Giảng to Student Live Room — LOCKS ALL OTHER ACTIVITIES SO ONLY SLIDE IMAGE IS SHOWN
  const handleBroadcastSlideDeck = (slideIdx = safeCurrentSlideIndex) => {
    playStageBroadcastSound();
    const syncVer = Date.now();
    const nowIso = new Date().toISOString();
    const pushPayload = {
      id: `push-${syncVer}`,
      title: `📢 PUSH NOTIFICATION: TRÌNH CHIẾU SLIDE BÀI GIẢNG!`,
      body: `Thầy Đỗ Mạnh Trường đang trình chiếu Slide #${slideIdx + 1} bài học "${periodSpec.lessonTitle}" cho Lớp ${classId}. Các hoạt động khác đã tạm khóa để tập trung xem Slide!`,
      stage: 'slide' as const,
      stageLabel: 'Slide Bài Giảng',
      lessonTitle: periodSpec.lessonTitle,
      classId,
      grade,
      period,
      timestampIso: nowIso,
    };

    onUpdateLiveSession((prev) =>
      buildBroadcastSingleActivityState(prev, {
        grade,
        period,
        classId,
        activity: 'slide',
        slideIndex: slideIdx,
        slideSyncVersion: syncVer,
        pushPayload,
      })
    );
    fetch('/api/live-session/slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonKey,
        slideIndex: slideIdx,
        slideSyncVersion: syncVer,
        activeLiveView: 'slide',
        grade,
        period,
        classId,
      }),
    }).catch(() => {});
    setActiveTab('slide');
    onShowToast(
      `📢 Đang phát trực tiếp Slide ${slideIdx + 1}/${Math.max(1, slidePages.length)} sang Lớp ${classId} — Hoạt động riêng biệt, đã khóa các hoạt động khác!`
    );
  };

  // Persist and immediately broadcast a newly loaded Slide Deck (from Google Drive link or Local Computer path/file)
  const saveAndBroadcastInstantSlideDeck = async (nextDeck: any, toastMsg: string) => {
    const syncVer = Date.now();
    const nowIso = new Date().toISOString();

    try {
      await saveSlideDeckToIndexedDb(lessonKey, nextDeck);
    } catch {
      // ignore IndexedDB warning
    }

    fetch('/api/db/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonKey,
        deck: nextDeck,
        activeSlideIndex: 0,
      }),
    }).catch(() => {});

    fetch('/api/live-session/slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonKey,
        slideIndex: 0,
        slideSyncVersion: syncVer,
        activeLiveView: 'slide',
        grade,
        period,
        classId,
      }),
    }).catch(() => {});

    onUpdateLiveSession((prev) => ({
      ...prev,
      isBroadcasting: true,
      activeGrade: grade,
      activePeriod: period,
      activeClassId: classId,
      activeLiveView: 'slide',
      lectureSlidesByLesson: {
        ...(prev.lectureSlidesByLesson || {}),
        [lessonKey]: nextDeck,
      },
      activeSlideIndexByLesson: {
        ...(prev.activeSlideIndexByLesson || {}),
        [lessonKey]: 0,
      },
      slideSyncVersionByLesson: {
        ...(prev.slideSyncVersionByLesson || {}),
        [lessonKey]: syncVer,
      },
      unlockedSlideDeckByLesson: {
        ...(prev.unlockedSlideDeckByLesson || {}),
        [lessonKey]: true,
      },
      unlockedStagesByLesson: {
        ...(prev.unlockedStagesByLesson || {}),
        [lessonKey]: { 1: false, 2: false, 3: false, 4: false },
      },
      unlockedPracticeStage3ByLesson: {
        ...(prev.unlockedPracticeStage3ByLesson || {}),
        [lessonKey]: false,
      },
      updatedAt: nowIso,
    }));

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('cloudplay_realtime_sync');
        ch.postMessage({
          type: 'SLIDE_CHANGED',
          lessonKey,
          slideIndex: 0,
          slideSyncVersion: syncVer,
          activeLiveView: 'slide',
        });
        ch.close();
      }
    } catch {
      // ignore BroadcastChannel error
    }

    setActiveTab('slide');
    playStageBroadcastSound();
    onShowToast(toastMsg);
  };

  // Convert a local File (.pptx, .pdf, .html, image, video) into slides and immediately run on Live
  const handleRunSlideFromFileObject = async (file: File, sourceLabel?: string) => {
    setIsQuickSlideLoading(true);
    setQuickSlideStatusText(`Đang tự động mở & chuyển đổi tệp "${file.name}"...`);
    try {
      const { fileType, slides } = await convertSlideFileToPages(file, periodSpec, (status) => {
        setQuickSlideStatusText(status);
      });
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      const nextDeck = {
        lessonKey,
        grade,
        period,
        fileName: sourceLabel ? `${file.name} (${sourceLabel})` : file.name,
        fileType,
        fileSize: `${sizeKb} KB`,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        storageBucket: 'slide-storage-1gb' as const,
        totalCompressedKb: sizeKb,
        isUserUploaded: true,
        hasRealPdfPages: fileType === 'pdf',
        isBlankSlideDeck: false,
        isLazyLoaded: true,
        slides,
      };

      await saveAndBroadcastInstantSlideDeck(
        nextDeck,
        `🚀 Đã nạp bản gốc & phát Live ngay ${slides.length} trang Slide (${fileType.toUpperCase()}) từ "${file.name}" sang Lớp ${classId}!`
      );
      setQuickSlideStatusText(
        `✅ Đang chạy trực tiếp ${slides.length} trang Slide từ "${file.name}" trên màn hình Live!`
      );
    } catch (err: any) {
      onShowToast(
        `⚠️ Không thể đọc tệp "${file.name}": ${err?.message || 'Định dạng không hợp lệ'}`
      );
      setQuickSlideStatusText('');
    } finally {
      setIsQuickSlideLoading(false);
    }
  };

  // Run slide immediately when teacher pastes or submits a Google Drive URL, Google Slides URL, Remote URL, or Local Computer Path
  const handleRunSlideFromPathOrUrl = async (overrideInput?: string) => {
    const raw = String(overrideInput !== undefined ? overrideInput : quickSlidePathOrUrl).trim();
    const resolved = resolveSlideSourceInput(raw);

    if (resolved.kind === 'empty') {
      onShowToast(
        '⚠️ Hãy dán đường dẫn Google Drive / Google Slides hoặc đường dẫn tệp (.pptx, .pdf) trên máy tính!'
      );
      return;
    }

    setIsQuickSlideLoading(true);
    setQuickSlideStatusText(
      resolved.kind === 'google-drive' || resolved.kind === 'google-slides'
        ? `Đang kết nối Google Drive & mở Slide "${resolved.displayName}"...`
        : resolved.kind === 'local-path'
        ? `Đang mở tệp từ đường dẫn máy tính "${resolved.displayName}"...`
        : `Đang mở Slide từ đường dẫn "${resolved.displayName}"...`
    );

    try {
      // 1. Query server helper to see if local path exists on host disk or if public Google Drive binary can be extracted
      let serverResp: any = null;
      try {
        const res = await fetch('/api/slides/load-from-path-or-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pathOrUrl: raw, lessonKey }),
        });
        if (res.ok) {
          serverResp = await res.json();
        }
      } catch {
        // Server offline (e.g. GitHub Pages static mode) -> handle directly in browser
      }

      // Case A: Server returned binary base64 (either from local disk path on teacher PC or public Google Drive export)
      if (serverResp?.ok && serverResp.mode === 'binary' && serverResp.base64Data) {
        const binaryString = atob(serverResp.base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], {
          type: serverResp.mimeType || 'application/octet-stream',
        });
        const fileObj = new File([blob], serverResp.fileName || resolved.displayName, {
          type: serverResp.mimeType || 'application/octet-stream',
        });

        await handleRunSlideFromFileObject(
          fileObj,
          resolved.kind === 'local-path' ? 'Đường dẫn máy tính' : 'Google Drive'
        );
        return;
      }

      // Case B: Local computer path when running on remote cloud/GitHub Pages
      if (resolved.kind === 'local-path') {
        setIsQuickSlideLoading(false);
        return;
      }

      // Case C: Google Drive / Google Slides / Remote PPTX or PDF URL -> Instant Live Embed Deck
      const embedUrl = serverResp?.embedUrl || resolved.embedUrl || resolved.cleanInput;
      const sourceBadge =
        resolved.kind === 'google-slides'
          ? 'Google Slides Live'
          : resolved.kind === 'google-drive'
          ? 'Google Drive Live (.PPTX / .PDF)'
          : 'Trình chiếu Trực tuyến (.PPTX / .PDF)';

      const embeddedSlide = {
        slideNumber: 1,
        title: `${sourceBadge}: ${resolved.displayName}`,
        subtitle: `Khối ${grade} • Tiết ${period}: ${periodSpec.lessonTitle}`,
        bulletPoints: [
          `Đang trình chiếu trực tiếp từ đường dẫn: ${resolved.cleanInput}`,
          `Hỗ trợ lật trang, phóng to và đồng bộ trực tiếp sang màn hình Học sinh Lớp ${classId}.`,
        ],
        highlightNote: `Đang chạy trực tiếp từ ${sourceBadge}`,
        htmlEmbedUrl: embedUrl,
        imageUrl: generateFallbackSlideSvgDataUrl({
          grade,
          period,
          slideIndex: 0,
          totalSlides: 1,
          title: `${sourceBadge}: ${resolved.displayName}`,
          subtitle: periodSpec.lessonTitle,
          bulletPoints: [`Nguồn: ${resolved.cleanInput}`],
        }),
      };

      const nextDeck = {
        lessonKey,
        grade,
        period,
        fileName: `${resolved.displayName} (${sourceBadge})`,
        fileType: resolved.inferredFileType,
        fileSize: 'Google Drive / Cloud Link',
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        storageBucket: 'slide-storage-1gb' as const,
        totalCompressedKb: 12,
        isUserUploaded: true,
        isLazyLoaded: true,
        htmlEmbedUrl: embedUrl,
        slides: [embeddedSlide],
      };

      await saveAndBroadcastInstantSlideDeck(
        nextDeck,
        `🚀 Đã mở & chạy ngay Slide "${resolved.displayName}" từ ${sourceBadge} trên màn hình Live Giáo viên và đồng bộ Học sinh!`
      );
      setQuickSlideStatusText(
        `✅ Đang phát trực tiếp "${resolved.displayName}" (${sourceBadge}) trên màn hình Live!`
      );
    } catch (err: any) {
      onShowToast(`⚠️ Lỗi khi mở đường dẫn Slide: ${err?.message || 'Vui lòng kiểm tra lại đường dẫn'}`);
      setQuickSlideStatusText('');
    } finally {
      setIsQuickSlideLoading(false);
    }
  };

  // Pin / save fixed slide root folder path
  const handleSaveFixedSlideRootFolder = (nextRoot?: string) => {
    const clean =
      String(nextRoot !== undefined ? nextRoot : fixedSlideRootFolder).trim() ||
      DEFAULT_FIXED_SLIDE_ROOT_FOLDER;
    setFixedSlideRootFolder(clean);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('cloudplay_fixed_slide_folder_v1', clean);
      } catch {
        // ignore storage quota warning
      }
    }
    const newMapping = buildFixedSlideFolderMapping(grade, period, clean);
    onShowToast(
      `📌 Đã cố định đường dẫn thư mục bài giảng: "${clean}" → Tự động ánh xạ ${newMapping.gradeFolderName} / Tiết ${period} (${newMapping.primaryFileName})!`
    );
  };

  // On-demand PDF mapping & loading ONLY when a period (grade, period) is selected/opened.
  // - Preserves 100% original PDF visual pages (via pdfjs-dist canvas rendering).
  // - Displays a Blank White Slide ("trang slide trắng") when no PDF file is found.
  const handleAutoMapPeriodSlideFromFixedFolder = async (
    targetGrade: 6 | 7 | 8 | 9 = grade,
    targetPeriod: number = period,
    rootFolderOverride?: string,
    silentIfAlreadyLoaded = false
  ) => {
    const activeRoot = normalizeFixedSlideRootFolder(
      rootFolderOverride || fixedSlideRootFolder || DEFAULT_FIXED_SLIDE_ROOT_FOLDER
    );
    const mapping = buildFixedSlideFolderMapping(targetGrade, targetPeriod, activeRoot);
    const targetLessonKey = mapping.lessonKey;

    setIsAutoMappingFolder(true);
    try {
      // 0. If a Google Sheet CSDL is connected, query Google Sheet for this lesson (k{grade}-tiet-{period})!
      //    If slide images exist in Google Sheet -> load & sync smoothly to Teacher & Student.
      //    If no slide data exists in Google Sheet for this lesson -> display Blank White Slide ("trang slide trắng").
      const savedSheetCfg = getSavedGoogleSheetsConfig();
      if (savedSheetCfg?.spreadsheetId) {
        const sheetRes = await loadLessonSlideDeckFromGoogleSheet({
          spreadsheetId: savedSheetCfg.spreadsheetId,
          accessToken: getGoogleSheetsAccessToken(),
          grade: targetGrade,
          period: targetPeriod,
          lessonTitle: periodSpec.lessonTitle,
        });

        if (sheetRes.foundInSheet && !sheetRes.isBlankSlide) {
          await saveSlideDeckToIndexedDb(targetLessonKey, sheetRes.deck).catch(() => {});
          fetch('/api/db/slides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lessonKey: targetLessonKey,
              deck: sheetRes.deck,
              activeSlideIndex: 0,
            }),
          }).catch(() => {});
        }

        onUpdateLiveSession((prev) => ({
          ...prev,
          lectureSlidesByLesson: {
            ...(prev.lectureSlidesByLesson || {}),
            [targetLessonKey]: sheetRes.deck,
          },
          activeSlideIndexByLesson: {
            ...(prev.activeSlideIndexByLesson || {}),
            [targetLessonKey]: 0,
          },
          unlockedSlideDeckByLesson: {
            ...(prev.unlockedSlideDeckByLesson || {}),
            [targetLessonKey]: true,
          },
          updatedAt: new Date().toISOString(),
        }));

        setQuickSlideStatusText(sheetRes.statusMessage);
        if (!silentIfAlreadyLoaded) {
          onShowToast(sheetRes.statusMessage);
        }
        return;
      }

      // 1. Check if teacher linked a local PDF folder in this session -> extract original PDF pages on demand for this period
      if (typeof window !== 'undefined') {
        const linkedFile: File | undefined = (window as any).__cloudplayLinkedPdfFilesByLesson?.[
          targetLessonKey
        ];
        if (linkedFile instanceof File) {
          await handleRunSlideFromFileObject(
            linkedFile,
            `Bản gốc PDF: ${mapping.gradeFolderName} / Tiết ${targetPeriod}`
          );
          return;
        }
      }

      // 2. Check IndexedDB Slide Image Cache for genuine rendered PDF pages (reject any legacy synthetic SVG decks)
      const cachedIdbDeck = await getSlideDeckFromIndexedDb(targetLessonKey);
      if (cachedIdbDeck) {
        if (isRealRenderedPdfSlideDeck(cachedIdbDeck)) {
          const normalizedCachedDeck = {
            ...cachedIdbDeck,
            fileType: 'pdf' as const,
            hasRealPdfPages: true,
            isBlankSlideDeck: false,
            mappedFolderPath: mapping.gradeFolderPath,
            mappedFilePath: mapping.primaryFilePath,
          };
          onUpdateLiveSession((prev) => ({
            ...prev,
            lectureSlidesByLesson: {
              ...(prev.lectureSlidesByLesson || {}),
              [targetLessonKey]: normalizedCachedDeck,
            },
            activeSlideIndexByLesson: {
              ...(prev.activeSlideIndexByLesson || {}),
              [targetLessonKey]: prev.activeSlideIndexByLesson?.[targetLessonKey] ?? 0,
            },
            unlockedSlideDeckByLesson: {
              ...(prev.unlockedSlideDeckByLesson || {}),
              [targetLessonKey]: true,
            },
            updatedAt: new Date().toISOString(),
          }));
          return;
        } else {
          // Purge legacy synthetic text deck from IndexedDB
          await deleteSlideDeckFromIndexedDb(targetLessonKey).catch(() => {});
        }
      }

      // 3. Ask server to resolve physical .PDF file from the fixed folder path ( Tin {grade} / Tiet {period}.pdf )
      let serverResp: any = null;
      try {
        const res = await fetch('/api/slides/resolve-fixed-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: targetGrade,
            period: targetPeriod,
            rootFolder: activeRoot,
            lessonTitle: periodSpec.lessonTitle,
            topic: periodSpec.topic,
            yccd: periodSpec.yccd,
          }),
        });
        if (res.ok) {
          serverResp = await res.json();
        }
      } catch {
        // Offline / static GitHub Pages fallback handled below
      }

      if (serverResp?.ok && serverResp.mode === 'binary' && serverResp.base64Data) {
        const binaryString = atob(serverResp.base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], {
          type: 'application/pdf',
        });
        const fileObj = new File([blob], serverResp.fileName || mapping.primaryFileName, {
          type: 'application/pdf',
        });
        await handleRunSlideFromFileObject(
          fileObj,
          `Bản gốc PDF: ${mapping.gradeFolderName} / Tiết ${targetPeriod}`
        );
        return;
      }

      // 4. No PDF file found -> Set to 1-page Blank White Slide ("trang slide trắng")
      const blankWhiteDeck = buildFixedFolderPdfSlideCacheDeck({
        grade: targetGrade,
        period: targetPeriod,
        rootFolder: activeRoot,
        lessonTitle: periodSpec.lessonTitle,
        topic: periodSpec.topic,
        yccd: periodSpec.yccd,
      });

      onUpdateLiveSession((prev) => ({
        ...prev,
        lectureSlidesByLesson: {
          ...(prev.lectureSlidesByLesson || {}),
          [targetLessonKey]: blankWhiteDeck,
        },
        activeSlideIndexByLesson: {
          ...(prev.activeSlideIndexByLesson || {}),
          [targetLessonKey]: 0,
        },
        unlockedSlideDeckByLesson: {
          ...(prev.unlockedSlideDeckByLesson || {}),
          [targetLessonKey]: true,
        },
        updatedAt: new Date().toISOString(),
      }));

      setQuickSlideStatusText(
        `⬜ Chưa có dữ liệu Slide ảnh trong Google Sheet "CSDL" cho ${targetLessonKey} — Đang hiển thị Trang Slide trắng.`
      );
      if (!silentIfAlreadyLoaded) {
        onShowToast(
          `⬜ Chưa có dữ liệu Slide trong Google Sheet "CSDL" (${targetLessonKey}) — Đang hiển thị Trang Slide trắng.`
        );
      }
    } finally {
      setIsAutoMappingFolder(false);
    }
  };

  // Store linked directory PDF files by lessonKey and immediately load the current period's PDF if present
  const handleBatchMapDirectoryFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsAutoMappingFolder(true);
    setQuickSlideStatusText('Đang liên kết thư mục PDF bài giảng (Tin 6, 7, 8, 9 → Tiết 1..29)...');
    let mappedCount = 0;
    let currentLessonMatchedFile: File | null = null;

    try {
      const files = Array.from(fileList);
      if (typeof window !== 'undefined') {
        if (!(window as any).__cloudplayLinkedPdfFilesByLesson) {
          (window as any).__cloudplayLinkedPdfFilesByLesson = {};
        }
      }
      for (const file of files) {
        const relPath = (file as any).webkitRelativePath || file.name;
        const matched = matchFileToGradeAndPeriod(relPath, grade);
        if (!matched || matched.inferredFileType !== 'pdf') continue;
        mappedCount++;
        if (typeof window !== 'undefined') {
          (window as any).__cloudplayLinkedPdfFilesByLesson[matched.lessonKey] = file;
        }
        if (matched.grade === grade && matched.period === period) {
          currentLessonMatchedFile = file;
        }
      }

      if (currentLessonMatchedFile) {
        await handleRunSlideFromFileObject(
          currentLessonMatchedFile,
          `Bản gốc PDF: Tin ${grade} / Tiết ${period}`
        );
      } else {
        await handleAutoMapPeriodSlideFromFixedFolder(grade, period, fixedSlideRootFolder, false);
      }
      onShowToast(
        `📂 Đã liên kết ${mappedCount} tệp PDF bản gốc trong thư mục! Khi chọn tiết học sẽ tự động nạp đúng tệp PDF của tiết đó.`
      );
    } finally {
      setIsAutoMappingFolder(false);
    }
  };

  // Auto-load mapped slide deck whenever TeacherLivePresenterRoom opens for (grade, period)
  useEffect(() => {
    handleAutoMapPeriodSlideFromFixedFolder(grade, period, fixedSlideRootFolder, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, period, lessonKey]);


  // Stop any currently active Live activity or Slide presentation and stay cleanly at the current spot without jumping tabs
  const handleStopActivityBroadcast = (activityLabel = 'Hoạt động hiện tại') => {
    setIsAutoAdvancing(false);
    onUpdateLiveSession((prev) => buildStopSingleActivityState(prev, lessonKey));
    onShowToast(
      `⏹️ Đã kết thúc phát Live "${activityLabel}"! Màn hình giữ nguyên tại chỗ và toàn bộ các hoạt động khác vẫn đóng khóa độc lập.`
    );
  };

  // End Slide Presentation: automatically closes lecture slide on Student screens while keeping all activity locks strictly closed!
  const handleEndSlidePresentation = () => {
    setIsAutoAdvancing(false);
    onUpdateLiveSession((prev) => buildEndSlidePresentationState(prev, lessonKey));
    onShowToast(
      `⏹️ Đã kết thúc Slide bài giảng! Đã dừng tại chỗ và khóa tất cả các hoạt động — Giáo viên bấm Phát Live hoạt động nào thì mới mở riêng hoạt động đó!`
    );
  };

  // Finalize an activity or specific exercise: locks submissions for all students to prevent late submissions
  const handleToggleFinalizeActivity = (
    activityKey: string | number,
    activityTitle?: string
  ) => {
    const isCurrentlyFinalized = isActivityFinalized(liveSession, lessonKey, activityKey);
    const nextFinalized = !isCurrentlyFinalized;
    onUpdateLiveSession((prev) =>
      buildToggleFinalizeActivityState(prev, {
        lessonKey,
        activityKey,
        finalized: nextFinalized,
        activityTitle: activityTitle || `Hoạt động ${activityKey}`,
      })
    );
    onShowToast(
      nextFinalized
        ? `🔒 Đã chốt ${activityTitle || `Hoạt động ${activityKey}`}! Toàn bộ cổng nộp bài phía học sinh đã được khóa an toàn.`
        : `🔓 Đã mở lại nộp bài cho ${activityTitle || `Hoạt động ${activityKey}`}.`
    );
  };

  // Change current slide index and sync with students via monotonic slideSyncVersion
  const handleChangeSlideIndex = (nextIdx: number) => {
    if (slidePages.length === 0) return;
    const bounded = Math.max(0, Math.min(slidePages.length - 1, nextIdx));
    const syncVer = Date.now();
    const nowIso = new Date().toISOString();
    setAutoAdvanceCountdownSec(autoAdvanceIntervalSec);
    onUpdateLiveSession((prev) => ({
      ...prev,
      activeSlideIndexByLesson: {
        ...(prev.activeSlideIndexByLesson || {}),
        [lessonKey]: bounded,
      },
      slideSyncVersionByLesson: {
        ...(prev.slideSyncVersionByLesson || {}),
        [lessonKey]: syncVer,
      },
      updatedAt: nowIso,
    }));
    fetch('/api/live-session/slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonKey,
        slideIndex: bounded,
        slideSyncVersion: syncVer,
        activeLiveView: liveSession?.activeLiveView || 'waiting',
        grade,
        period,
        classId,
      }),
    }).catch(() => {});

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('cloudplay_realtime_sync');
        ch.postMessage({
          type: 'SLIDE_CHANGED',
          lessonKey,
          slideIndex: bounded,
          slideSyncVersion: syncVer,
          activeLiveView: liveSession?.activeLiveView || 'slide',
        });
        ch.close();
      }
    } catch {
      // ignore BroadcastChannel error
    }
  };

  // Toggle synchronized Explanation Video accompanying the Slide Image
  const handleToggleExplanationVideo = (
    overrideUrl?: string,
    overrideTitle?: string,
    forcePlay?: boolean
  ) => {
    const nextPlaying =
      typeof forcePlay === 'boolean' ? forcePlay : !isExplanationVideoPlaying;
    const targetUrl = overrideUrl || defaultSlideVideoUrl;
    const targetTitle =
      overrideTitle ||
      defaultSlideVideoTitle ||
      `Video giải thích Slide #${safeCurrentSlideIndex + 1}`;

    onUpdateLiveSession((prev) => ({
      ...prev,
      slideVideoStateByLesson: {
        ...(prev.slideVideoStateByLesson || {}),
        [lessonKey]: {
          isPlaying: nextPlaying,
          videoUrl: targetUrl,
          videoTitle: targetTitle,
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    }));

    onShowToast(
      nextPlaying
        ? `🎬 Đang phát đồng bộ Video giải thích kiến thức đi kèm Slide #${
            safeCurrentSlideIndex + 1
          } sang màn hình học sinh!`
        : `⏸️ Đã tắt phát Video giải thích kiến thức đi kèm Slide.`
    );
  };

  // Auto-advance timer effect for Teacher Slide Controller
  useEffect(() => {
    if (!isAutoAdvancing || activeTab !== 'slide' || slidePages.length <= 1) return;
    const interval = setInterval(() => {
      setAutoAdvanceCountdownSec((prev) => {
        if (prev <= 1) {
          const nextSlideIdx =
            safeCurrentSlideIndex + 1 < slidePages.length ? safeCurrentSlideIndex + 1 : 0;
          const syncVer = Date.now();
          onUpdateLiveSession((sess) => ({
            ...sess,
            activeSlideIndexByLesson: {
              ...(sess.activeSlideIndexByLesson || {}),
              [lessonKey]: nextSlideIdx,
            },
            slideSyncVersionByLesson: {
              ...(sess.slideSyncVersionByLesson || {}),
              [lessonKey]: syncVer,
            },
            updatedAt: new Date().toISOString(),
          }));
          return autoAdvanceIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [
    isAutoAdvancing,
    activeTab,
    safeCurrentSlideIndex,
    slidePages.length,
    autoAdvanceIntervalSec,
    lessonKey,
    onUpdateLiveSession,
  ]);

  // Wireless Presenter Clicker & Remote Keyboard Navigation (ArrowLeft, ArrowRight, Space, PageUp, PageDown, F for Fullscreen, Escape)
  useEffect(() => {
    const isSlideActiveInLive =
      activeTab === 'slide' || liveSession?.activeLiveView === 'slide' || isFullscreen;
    if (!isSlideActiveInLive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      const action = resolvePresenterKeyAction(
        e.key,
        e.code,
        target?.tagName,
        target?.isContentEditable
      );
      if (!action) return;

      if (action === 'exit-fullscreen') {
        if (isFullscreen) {
          e.preventDefault();
          e.stopPropagation();
          handleToggleFullscreen(false);
        }
        return;
      }

      if (action === 'fullscreen') {
        e.preventDefault();
        e.stopPropagation();
        handleToggleFullscreen();
        return;
      }

      if (slidePages.length === 0) return;

      // Critical fix: blur any focused <button> so pressing Space does NOT also trigger button onClick on keyup!
      if (target && target.tagName === 'BUTTON') {
        target.blur();
      }
      e.preventDefault();
      e.stopPropagation();

      if (action === 'next') {
        const nextIdx = Math.min(slidePages.length - 1, safeCurrentSlideIndex + 1);
        if (nextIdx !== safeCurrentSlideIndex) {
          handleChangeSlideIndex(nextIdx);
          onShowToast(
            `⏭️ Điều khiển từ xa (Phím → / Space): Chuyển sang Slide ${nextIdx + 1}/${
              slidePages.length
            } (Đã đồng bộ HS)`
          );
        } else {
          onShowToast(
            `ℹ️ Đang ở trang Slide cuối cùng (${slidePages.length}/${slidePages.length}).`
          );
        }
      } else if (action === 'prev') {
        const prevIdx = Math.max(0, safeCurrentSlideIndex - 1);
        if (prevIdx !== safeCurrentSlideIndex) {
          handleChangeSlideIndex(prevIdx);
          onShowToast(
            `⏮️ Điều khiển từ xa (Phím ←): Quay lại Slide ${prevIdx + 1}/${
              slidePages.length
            } (Đã đồng bộ HS)`
          );
        } else {
          onShowToast(`ℹ️ Đang ở trang Slide đầu tiên (1/${slidePages.length}).`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [
    activeTab,
    liveSession?.activeLiveView,
    isFullscreen,
    safeCurrentSlideIndex,
    slidePages.length,
  ]);

  // Toggle Stage 3 Practical Activity (Hoạt động 3 - Tiết Thực hành) lock/unlock synchronized with Student Live Room
  const handleTogglePracticeStage3Lock = () => {
    const nextState = !isPracticeStage3Unlocked;
    const pushPayload = nextState
      ? {
          id: `push-${Date.now()}`,
          title: `🔔 PUSH NOTIFICATION: MỞ KHÓA THỰC HÀNH PHÒNG MÁY!`,
          body: `Thầy Đỗ Mạnh Trường vừa MỞ KHÓA Hoạt động 3 (Thực hành máy tính & Nộp bài Drive) cho Lớp ${classId}!`,
          stage: 'hd3-practice' as const,
          stageLabel: 'Thực hành máy tính',
          lessonTitle: periodSpec.lessonTitle,
          classId,
          grade,
          period,
          timestampIso: new Date().toISOString(),
        }
      : null;

    onUpdateLiveSession((prev) => ({
      ...prev,
      unlockedPracticeStage3ByLesson: {
        ...(prev.unlockedPracticeStage3ByLesson || {}),
        [lessonKey]: nextState,
      },
      unlockedStagesByLesson: nextState
        ? {
            ...prev.unlockedStagesByLesson,
            [lessonKey]: {
              ...(prev.unlockedStagesByLesson?.[lessonKey] || {
                1: true,
                2: false,
                3: false,
                4: false,
              }),
              3: true,
            },
          }
        : prev.unlockedStagesByLesson,
      ...(pushPayload ? { lastPushNotification: pushPayload } : {}),
      updatedAt: new Date().toISOString(),
    }));
    onShowToast(
      nextState
        ? `🔓 Đã MỞ KHÓA & phát Push Notification Hoạt động Thực hành cho Lớp ${classId}!`
        : `🔒 Đã KHÓA Hoạt động Thực hành với học sinh Lớp ${classId}!`
    );
  };

  // Broadcast Stage 3 Practical Activity to Student Live Room (strictly isolated from other activities)
  const handleBroadcastPracticeStage3 = () => {
    playStageBroadcastSound();
    const pushPayload = {
      id: `push-${Date.now()}`,
      title: `📢 PUSH NOTIFICATION: PHÁT TRỰC TIẾP HĐ 3 THỰC HÀNH!`,
      body: `Thầy Đỗ Mạnh Trường chuyển màn hình Lớp ${classId} sang Hoạt động 3 (Thực hành máy tính & Nộp bài Drive)!`,
      stage: 'hd3-practice' as const,
      stageLabel: 'Thực hành phòng máy',
      lessonTitle: periodSpec.lessonTitle,
      classId,
      grade,
      period,
      timestampIso: new Date().toISOString(),
    };

    onUpdateLiveSession((prev) =>
      buildBroadcastSingleActivityState(prev, {
        grade,
        period,
        classId,
        activity: 'hd3-practice',
        pushPayload,
      })
    );
    setActiveTab('hd3-practice');
    onShowToast(
      `📢 Đang phát Live riêng biệt Hoạt động 3 (Thực hành) sang Lớp ${classId} — Các hoạt động khác được giữ khóa độc lập!`
    );
  };

  // Toggle stage lock/unlock for students
  const handleToggleStageLock = (stage: 1 | 2 | 3 | 4) => {
    const nextState = !currentUnlockedMap[stage];
    const stageLabels: Record<number, string> = {
      1: 'Khởi động',
      2: 'Khám phá',
      3: 'Luyện tập',
      4: 'Vận dụng',
    };
    const pushPayload = nextState
      ? {
          id: `push-${Date.now()}`,
          title: `🔔 PUSH NOTIFICATION: MỞ KHÓA HOẠT ĐỘNG ${stage} (${stageLabels[stage]})!`,
          body: `Thầy Đỗ Mạnh Trường vừa MỞ KHÓA Hoạt động ${stage} - ${stageLabels[stage]} bài "${periodSpec.lessonTitle}" cho Lớp ${classId}!`,
          stage: stage,
          stageLabel: `Hoạt động ${stage}: ${stageLabels[stage]}`,
          lessonTitle: periodSpec.lessonTitle,
          classId,
          grade,
          period,
          timestampIso: new Date().toISOString(),
        }
      : null;

    onUpdateLiveSession((prev) => ({
      ...prev,
      unlockedStagesByLesson: {
        ...prev.unlockedStagesByLesson,
        [lessonKey]: {
          ...(prev.unlockedStagesByLesson?.[lessonKey] || {
            1: false,
            2: false,
            3: false,
            4: false,
          }),
          [stage]: nextState,
        },
      },
      ...(stage === 3 && nextState
        ? {
            arenaCountdownStateByLesson: {
              ...(prev.arenaCountdownStateByLesson || {}),
              [lessonKey]: {
                isRunning: true,
                durationSec: arenaDurationSec,
                startedAtIso: new Date().toISOString(),
              },
            },
          }
        : {}),
      ...(pushPayload ? { lastPushNotification: pushPayload } : {}),
      updatedAt: new Date().toISOString(),
    }));

    onShowToast(
      nextState
        ? `🔓 Đã MỞ KHÓA & phát Push Notification Hoạt động ${stage} cho Lớp ${classId}!`
        : `🔒 Đã KHÓA Hoạt động ${stage} với học sinh!`
    );
  };

  // Broadcast stage switch to student screens (strictly isolated: only unlocks & broadcasts this single activity)
  const handleBroadcastStage = (stage: 1 | 2 | 3 | 4) => {
    playStageBroadcastSound();
    const stageLabels: Record<number, string> = {
      1: 'Khởi động',
      2: 'Khám phá',
      3: 'Luyện tập',
      4: 'Vận dụng',
    };
    const pushPayload = {
      id: `push-${Date.now()}`,
      title: `📢 PUSH NOTIFICATION: PHÁT TRỰC TIẾP HĐ ${stage} (${stageLabels[stage]})!`,
      body: `Thầy Đỗ Mạnh Trường đang phát trực tiếp Hoạt động ${stage} - ${stageLabels[stage]} bài "${periodSpec.lessonTitle}" cho Lớp ${classId}!`,
      stage: stage,
      stageLabel: `Hoạt động ${stage}: ${stageLabels[stage]}`,
      lessonTitle: periodSpec.lessonTitle,
      classId,
      grade,
      period,
      timestampIso: new Date().toISOString(),
    };

    const activityKey = `hd${stage}` as 'hd1' | 'hd2' | 'hd3' | 'hd4';
    onUpdateLiveSession((prev) =>
      buildBroadcastSingleActivityState(prev, {
        grade,
        period,
        classId,
        activity: activityKey,
        arenaDurationSec,
        pushPayload,
      })
    );
    setActiveTab(activityKey);
    onShowToast(
      stage === 3
        ? `📢 Đang phát Live riêng biệt Đấu trường Luyện tập (HĐ 3) & Đồng hồ đếm ngược ${formatCountdownMmSs(
            arenaDurationSec
          )} sang Lớp ${classId}!`
        : `📢 Đang phát Live riêng biệt Hoạt động ${stage} (${stageLabels[stage]}) sang Lớp ${classId} — Không liên đới đến các hoạt động khác!`
    );
  };

  // Manual trigger broadcast push notification to students
  const handleManualTriggerPushNotification = (messageTitle?: string, messageBody?: string) => {
    const pushPayload = {
      id: `push-${Date.now()}`,
      title: messageTitle || `🔔 THÔNG BÁO TỪ GIÁO VIÊN (LỚP ${classId})`,
      body: messageBody || `Thầy Đỗ Mạnh Trường vừa phát tín hiệu nhắc nhở học sinh tập trung vào bài học "${periodSpec.lessonTitle}"!`,
      stage: activeTab === 'slide' ? ('slide' as const) : activeTab === 'hd3-practice' ? ('hd3-practice' as const) : (activeStage as 1|2|3|4),
      stageLabel: activeTab === 'slide' ? 'Slide Bài Giảng' : activeTab === 'hd3-practice' ? 'Thực hành máy tính' : `Hoạt động ${activeStage}`,
      lessonTitle: periodSpec.lessonTitle,
      classId,
      grade,
      period,
      timestampIso: new Date().toISOString(),
    };

    onUpdateLiveSession((prev) => ({
      ...prev,
      lastPushNotification: pushPayload,
      updatedAt: new Date().toISOString(),
    }));

    onShowToast(`🔔 Đã phát Push Notification tức thì tới thiết bị học sinh Lớp ${classId}!`);
  };

  // Spin wheel to call a random student
  const handleSpinRandomStudent = () => {
    if (effectiveClassStudents.length === 0 || spinning) return;
    setSpinning(true);
    setSelectedStudent(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * effectiveClassStudents.length);
      setSelectedStudent(effectiveClassStudents[randIdx]);
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        setSpinning(false);
        const finalWinner =
          effectiveClassStudents[Math.floor(Math.random() * effectiveClassStudents.length)];
        setSelectedStudent(finalWinner);
        triggerSynchronizedCelebration('xp');

        onUpdateLiveSession((prev) => ({
          ...prev,
          wheelCall: {
            isSpinning: false,
            winnerId: finalWinner.id,
            winnerName: finalWinner.name,
            winnerGroup: `Máy #${finalWinner.stationNumber || '01'}`,
            rewardLabel: '+30 XP Trả lời trực tiếp',
            calledAt: new Date().toLocaleTimeString('vi-VN'),
          },
        }));

        onShowToast(`🎉 Đã gọi tên học sinh: ${finalWinner.name} (Lớp ${finalWinner.classId})!`);
      }
    }, 90);
  };

  // Teacher exits the live room: end broadcast, mark period as taught for this class,
  // mark lesson as learned for students of this class, unlock all 4 activities for self-study,
  // and close the live room for students.
  const handleTeacherExitAndFinishLive = () => {
    const currentTaughtList = liveSession?.taughtPeriodsByClass?.[classId] || [];
    const updatedTaughtList = currentTaughtList.includes(period)
      ? currentTaughtList
      : [...currentTaughtList, period];

    const targetStudents = students.filter((s) => s.classId === classId);
    const updatedLearned: Record<string, string[]> = { ...(liveSession?.learnedPeriodsByStudent || {}) };
    targetStudents.forEach((st) => {
      const list = updatedLearned[st.id] || [];
      if (!list.includes(lessonKey)) {
        updatedLearned[st.id] = [...list, lessonKey];
      }
    });

    const updatedStages = {
      ...(liveSession?.unlockedStagesByLesson || {}),
      [lessonKey]: { 1: true, 2: true, 3: true, 4: true },
    };

    onUpdateLiveSession((prev) => {
      const prevTaught = prev.taughtPeriodsByClass?.[classId] || [];
      const finalTaught = prevTaught.includes(period) ? prevTaught : [...prevTaught, period];

      const prevLearned: Record<string, string[]> = { ...(prev.learnedPeriodsByStudent || {}) };
      targetStudents.forEach((st) => {
        const list = prevLearned[st.id] || [];
        if (!list.includes(lessonKey)) {
          prevLearned[st.id] = [...list, lessonKey];
        }
      });

      return {
        ...prev,
        isBroadcasting: false,
        taughtPeriodsByClass: {
          ...(prev.taughtPeriodsByClass || {}),
          [classId]: finalTaught,
        },
        learnedPeriodsByStudent: prevLearned,
        unlockedStagesByLesson: {
          ...(prev.unlockedStagesByLesson || {}),
          [lessonKey]: { 1: true, 2: true, 3: true, 4: true },
        },
        updatedAt: new Date().toISOString(),
      };
    });

    // Notify backend immediately
    fetch('/api/live-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isBroadcasting: false,
        activeClassId: classId,
        activeGrade: grade,
        activePeriod: period,
        taughtPeriodsByClass: {
          ...(liveSession?.taughtPeriodsByClass || {}),
          [classId]: updatedTaughtList,
        },
        learnedPeriodsByStudent: updatedLearned,
        unlockedStagesByLesson: updatedStages,
      }),
    }).catch(() => {});

    // Broadcast LIVE_SESSION_ENDED to all student browsers via BroadcastChannel
    try {
      const bc = new BroadcastChannel('slide-broadcast-channel');
      bc.postMessage({
        type: 'LIVE_SESSION_ENDED',
        classId,
        grade,
        period,
        lessonKey,
        timestampIso: new Date().toISOString(),
      });
      bc.close();
    } catch {
      // BroadcastChannel unsupported fallback
    }

    onShowToast(
      `🔔 Đã thoát & kết thúc phiên Live Tiết ${period} (Lớp ${classId})! Tự động đồng bộ đóng phòng Live trên máy toàn bộ học sinh và mở khóa hoạt động tự luyện.`
    );

    onExit();
  };

  // Embedded Live Class Leaderboard Chart Component rendered directly inside each Activity
  const renderEmbeddedClassLeaderboardChart = (stageNum: 1 | 2 | 3 | 4, stageName: string) => {
    const topEight = rankedStudents.slice(0, 8);
    const submittedCount = effectiveClassStudents.filter(
      (s) => s.submissionStatus === 'Đã nộp'
    ).length;
    const submissionPercent =
      effectiveClassStudents.length > 0
        ? Math.round((submittedCount / effectiveClassStudents.length) * 100)
        : 0;

    return (
      <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">leaderboard</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Biểu Đồ Bảng Xếp Hạng Lớp Trực Tiếp — Hoạt động {stageNum}: {stageName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tức thời điểm XP, tiến độ hoàn thành và thứ hạng học sinh ngay trong phần hoạt động
              </p>
            </div>
          </div>

          {/* Scope Switcher: Class vs Grade */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setRankingScope('class')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  rankingScope === 'class'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp {classId} ({effectiveClassStudents.length} HS)
              </button>
              <button
                type="button"
                onClick={() => setRankingScope('grade')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  rankingScope === 'grade'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn Khối {grade} ({gradeStudents.length} HS)
              </button>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Đã nộp HĐ {stageNum}: {submittedCount}/{effectiveClassStudents.length} ({submissionPercent}%)
            </div>
          </div>
        </div>

        {/* Visual Bar Chart of Top Students in Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Horizontal Bar Chart */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
            {/* Top Performer Real-time Notification Banner */}
            {topPerformerAlert && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-lg animate-bounce border-2 border-yellow-200">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl animate-spin">👑</span>
                  <div>
                    <span className="uppercase tracking-wider text-[11px] block text-amber-100">
                      ⚡ TOP PERFORMER BỨT PHÁ DẪN ĐẦU THỜI GIAN THỰC!
                    </span>
                    <span className="text-sm sm:text-base text-white">
                      {topPerformerAlert.name}
                      {topPerformerAlert.partnerName &&
                      topPerformerAlert.partnerName !== 'Học cá nhân (1 mình)'
                        ? ` & ${topPerformerAlert.partnerName}`
                        : ''}{' '}
                      — {topPerformerAlert.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white text-amber-800 text-xs font-black shadow-xs shrink-0">
                  VỊ TRÍ #1
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1 flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sky-600 text-[18px]">bar_chart</span>
                <span>Biểu đồ Top Điểm XP ({rankingScope === 'class' ? `Lớp ${classId}` : `Khối ${grade}`})</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateTopPerformerTakeover}
                  className="px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Cộng điểm bứt phá cho HS hạng #2 vượt lên #1 để kiểm tra hiệu ứng Top Performer chớp sáng"
                >
                  <span className="material-symbols-outlined text-[14px] text-amber-700">bolt</span>
                  <span>Mô phỏng HS vượt lên #1</span>
                </button>
                <span className="text-slate-400">Đơn vị: Điểm XP &amp; Sao</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {topEight.map((st, idx) => {
                const widthPct = Math.max(12, Math.min(100, Math.round((st.xp / maxXpInList) * 100)));
                const rankBadge =
                  idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
                const barGradient =
                  idx === 0
                    ? 'from-amber-400 via-orange-500 to-red-500'
                    : idx === 1
                    ? 'from-sky-400 to-blue-600'
                    : idx === 2
                    ? 'from-emerald-400 to-teal-600'
                    : 'from-slate-400 to-slate-500';

                return (
                  <div
                    key={st.id}
                    className={`flex flex-col gap-1 transition-all rounded-xl p-1.5 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-amber-100/90 via-yellow-50/90 to-amber-100/90 border-2 border-amber-400 shadow-md ring-2 ring-amber-300/80 animate-pulse'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-black text-[11px] shrink-0 ${
                            idx === 0
                              ? 'bg-amber-500 text-white shadow-xs'
                              : idx === 1
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : idx === 2
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {rankBadge}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <span>✨</span>
                            <span>TOP PERFORMER</span>
                            <span>👑</span>
                          </span>
                        )}
                        <span className="font-bold text-slate-900 truncate">{st.name}</span>
                        <span className="text-[11px] text-slate-500 truncate">
                          ({st.partnerName && st.partnerName !== 'Học cá nhân (1 mình)' ? `+ ${st.partnerName}` : 'Cá nhân'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-amber-600">⭐ {st.stars}</span>
                        <span className="font-black text-sky-700">{st.xp.toLocaleString()} XP</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Top 3 Podium & Live Student Status List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2.5">
              {rankedStudents.slice(0, 3).map((st, idx) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-b from-amber-100/90 to-yellow-50 border-2 border-amber-400 shadow-md ring-2 ring-amber-300/80 animate-pulse'
                      : idx === 1
                      ? 'bg-sky-50/90 border-sky-200'
                      : 'bg-emerald-50/90 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    {idx === 0 && (
                      <span className="text-xs animate-bounce" title="Top Performer">👑</span>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-900 line-clamp-1">{st.name}</span>
                  <span className="text-[11px] font-bold text-sky-700">{st.xp.toLocaleString()} XP</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-bold border border-slate-200">
                    TB: {st.avgScore.toFixed(1)}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Tiến độ học sinh trong HĐ {stageNum}</span>
                <span className="text-emerald-700">{submittedCount} Đã nộp</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {rankedStudents.slice(0, 10).map((st, idx) => (
                  <div
                    key={st.id}
                    className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-slate-400 w-5">#{idx + 1}</span>
                      <div className="truncate">
                        <span className="font-bold text-slate-800">{st.name}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({st.classId})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.submissionStatus === 'Đã nộp'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {st.submissionStatus || 'Đang làm'}
                      </span>
                      <span className="font-black text-slate-700">{st.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 text-slate-900">
      {/* 1. LEFT SIDEBAR - BRIGHT WHITE SYNCHRONIZED WITH STUDENT LIVE ROOM */}
      <aside className="w-72 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="flex flex-col gap-6">
          {/* Nút Thoát phiên Live Đồng bộ Học sinh */}
          <button
            type="button"
            onClick={handleTeacherExitAndFinishLive}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs shadow-md transition-all cursor-pointer border border-rose-800"
            title="Thoát phiên Live: Đồng bộ kết thúc và tự động đóng phiên Live trên thiết bị học sinh"
          >
            <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
            <span>Thoát phiên Live (Đóng phòng HS)</span>
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1.5">
            <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Điều khiển Slide &amp; Hoạt động Live
            </span>
            <nav className="flex flex-col gap-2">
              {/* -1. PHÒNG CHỜ LỚP HỌC LIVE (ĐÓN HỌC SINH LỚP CHỈ ĐỊNH VÀO BÀN) */}
              <div
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  activeTab === 'waiting'
                    ? 'bg-amber-50/95 border-2 border-amber-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  onClick={() => setActiveTab('waiting')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        liveSession?.activeLiveView === 'waiting'
                          ? 'text-amber-600'
                          : activeTab === 'waiting'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      meeting_room
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        🏫 Phòng Chờ Live (Lớp {classId})
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        Sơ đồ 2 dãy bàn Tổ 1 &amp; Tổ 2 • Bảng phấn
                      </span>
                    </div>
                  </div>

                  {liveSession?.activeLiveView === 'waiting' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                      ĐANG MỞ
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWaitingRoomLobby();
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                      liveSession?.activeLiveView === 'waiting'
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    🏫 Đón HS Lớp {classId}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('slide');
                      handleBroadcastSlideDeck(safeCurrentSlideIndex);
                    }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
                  >
                    🚀 Sẵn sàng cho việc học
                  </button>
                </div>
              </div>

              {/* 0. SLIDE BÀI GIẢNG (HOẠT ĐỘNG ĐỘC LẬP) */}
              <div
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  activeTab === 'slide'
                    ? 'bg-orange-50/90 border-2 border-orange-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  onClick={() => setActiveTab('slide')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        liveSession?.activeLiveView === 'slide'
                          ? 'text-orange-600'
                          : activeTab === 'slide'
                          ? 'text-sky-600'
                          : 'text-slate-500'
                      }`}
                    >
                      co_present
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        Slide Bài Giảng (Ảnh Slide PDF)
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {slidePages.length > 0
                          ? `Slide ${safeCurrentSlideIndex + 1}/${slidePages.length} • Bộ nhớ đệm PDF`
                          : 'Đang nạp Ảnh Slide PDF'}
                      </span>
                    </div>
                  </div>

                  {liveSession?.activeLiveView === 'slide' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 animate-pulse">
                      ĐANG PHÁT
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBroadcastSlideDeck(safeCurrentSlideIndex);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                      liveSession?.activeLiveView === 'slide'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }`}
                  >
                    📢 Phát Live Slide
                  </button>
                  <div className="flex items-center gap-1">
                    {liveSession?.activeLiveView === 'slide' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEndSlidePresentation();
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white hover:bg-rose-700 cursor-pointer transition-colors"
                        title="Kết thúc trình chiếu Slide bài giảng và dừng ngay tại chỗ"
                      >
                        ⏹️ Kết thúc
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSlideLock();
                      }}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        isSlideUnlocked
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSlideUnlocked ? '🔓 Đang mở' : '🔒 Đang khóa'}
                    </button>
                  </div>
                </div>
              </div>

              {/* THEO DÕI TIẾN ĐỘ HỌC SINH TRỰC TIẾP (MÔ TẢ CHI TIẾT 4 HOẠT ĐỘNG) */}
              <div
                onClick={() => setActiveTab('theo-doi-tien-do')}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'theo-doi-tien-do'
                    ? 'bg-indigo-50/90 border-2 border-indigo-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[22px] text-indigo-600">
                    monitoring
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      📊 Theo dõi tiến độ HS (4 HĐ)
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      Mô tả chi tiết bài làm thời gian thực
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black border border-emerald-200">
                  Live
                </span>
              </div>

              {[
                {
                  id: 'hd1' as const,
                  stage: 1 as const,
                  label: 'Khởi động (HĐ 1)',
                  icon: 'psychology',
                  desc: 'Tình huống & Khơi gợi (1.0đ)',
                },
                {
                  id: 'hd2' as const,
                  stage: 2 as const,
                  label: 'Khám phá (HĐ 2)',
                  icon: 'menu_book',
                  desc: 'Phiếu học tập tương tác (4.0đ)',
                },
                {
                  id: 'hd3' as const,
                  stage: 3 as const,
                  label: 'Luyện tập (HĐ 3)',
                  icon: 'extension',
                  desc: 'Đấu trường Trắc nghiệm 25s (3.0đ)',
                },
              ].map((item) => {
                const isSelected = activeTab === item.id;
                const isBroadcastingThis = Boolean(
                  liveSession?.isBroadcasting && liveSession?.activeLiveView === item.id
                );
                const isUnlocked = Boolean(currentUnlockedMap[item.stage]);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-orange-50/90 border-2 border-orange-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      onClick={() => setActiveTab(item.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[22px] ${
                            isBroadcastingThis
                              ? 'text-orange-600'
                              : isSelected
                              ? 'text-sky-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {isBroadcastingThis && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 animate-pulse">
                          ĐANG PHÁT
                        </span>
                      )}
                      {!isBroadcastingThis && isActivityFinalized(liveSession, lessonKey, item.stage) && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                          🔒 ĐÃ CHỐT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBroadcastStage(item.stage);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          isBroadcastingThis
                            ? 'bg-orange-600 text-white shadow-2xs'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }`}
                      >
                        📢 Phát Live HĐ {item.stage}
                      </button>

                      <div className="flex items-center gap-1">
                        {isBroadcastingThis && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStopActivityBroadcast(item.label);
                            }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white hover:bg-rose-700 cursor-pointer transition-colors"
                            title={`Kết thúc phát Live ${item.label} và dừng ngay tại chỗ`}
                          >
                            ⏹️ Kết thúc
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStageLock(item.stage);
                          }}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            isUnlocked
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isUnlocked ? '🔓 Đang mở' : '🔒 Đang khóa'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* HOẠT ĐỘNG 3 (TIẾT THỰC HÀNH) — HOẠT ĐỘNG ĐỘC LẬP */}
              <div
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  activeTab === 'hd3-practice'
                    ? 'bg-orange-50/90 border-2 border-orange-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  onClick={() => setActiveTab('hd3-practice')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        liveSession?.activeLiveView === 'hd3-practice'
                          ? 'text-orange-600'
                          : activeTab === 'hd3-practice'
                          ? 'text-sky-600'
                          : 'text-slate-500'
                      }`}
                    >
                      computer
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        HĐ 3 (Tiết Thực hành)
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        Thực hành máy tính &amp; Nộp Drive
                      </span>
                    </div>
                  </div>

                  {liveSession?.activeLiveView === 'hd3-practice' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 animate-pulse">
                      ĐANG PHÁT
                    </span>
                  )}
                  {liveSession?.activeLiveView !== 'hd3-practice' && isActivityFinalized(liveSession, lessonKey, 'hd3-practice') && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                      🔒 ĐÃ CHỐT
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBroadcastPracticeStage3();
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                      liveSession?.activeLiveView === 'hd3-practice'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }`}
                  >
                    📢 Phát Live Thực hành
                  </button>
                  <div className="flex items-center gap-1">
                    {liveSession?.activeLiveView === 'hd3-practice' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopActivityBroadcast('HĐ 3 (Tiết Thực hành)');
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white hover:bg-rose-700 cursor-pointer transition-colors"
                      >
                        ⏹️ Kết thúc
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePracticeStage3Lock();
                      }}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        isPracticeStage3Unlocked
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isPracticeStage3Unlocked ? '🔓 Đang mở' : '🔒 Đang khóa'}
                    </button>
                  </div>
                </div>
              </div>

              {/* HOẠT ĐỘNG 4 & KẾT QUẢ */}
              {[
                {
                  id: 'hd4' as const,
                  stage: 4 as const,
                  label: 'Vận dụng (HĐ 4)',
                  icon: 'assignment_turned_in',
                  desc: 'Bài tập thực tiễn (2.0đ)',
                },
                {
                  id: 'ket-qua' as const,
                  stage: null,
                  label: 'Tổng hợp Kết quả & Xếp hạng',
                  icon: 'leaderboard',
                  desc: 'Bảng điểm chi tiết cả lớp/khối',
                },
              ].map((item) => {
                const isSelected = activeTab === item.id;
                const isBroadcastingThis = Boolean(
                  item.stage &&
                    liveSession?.isBroadcasting &&
                    liveSession?.activeLiveView === item.id
                );
                const isUnlocked = item.stage ? Boolean(currentUnlockedMap[item.stage]) : true;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-orange-50/90 border-2 border-orange-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      onClick={() => setActiveTab(item.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[22px] ${
                            isBroadcastingThis
                              ? 'text-orange-600'
                              : isSelected
                              ? 'text-sky-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {isBroadcastingThis && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 animate-pulse">
                          ĐANG PHÁT
                        </span>
                      )}
                      {!isBroadcastingThis && item.stage && isActivityFinalized(liveSession, lessonKey, item.stage) && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                          🔒 ĐÃ CHỐT
                        </span>
                      )}
                    </div>

                    {item.stage && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBroadcastStage(item.stage!);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            isBroadcastingThis
                              ? 'bg-orange-600 text-white shadow-2xs'
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          }`}
                        >
                          📢 Phát Live HĐ {item.stage}
                        </button>

                        <div className="flex items-center gap-1">
                          {isBroadcastingThis && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStopActivityBroadcast(item.label);
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white hover:bg-rose-700 cursor-pointer transition-colors"
                            >
                              ⏹️ Kết thúc
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStageLock(item.stage!);
                            }}
                            className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              isUnlocked
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isUnlocked ? '🔓 Đang mở' : '🔒 Đang khóa'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Lucky Random Call Wheel */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-purple-600">casino</span>
              <span>Gọi tên ngẫu nhiên</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white text-purple-700 text-[11px] border border-purple-200">
              {effectiveClassStudents.length} HS
            </span>
          </div>

          {selectedStudent && (
            <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-center shadow-2xs">
              <span className="text-[11px] text-purple-600 block font-bold">
                Học sinh được chọn:
              </span>
              <strong className="text-sm text-slate-900 font-black block mt-0.5">
                {selectedStudent.name}
              </strong>
              <span className="text-[10px] text-slate-500">
                Lớp {selectedStudent.classId} • Máy #{selectedStudent.stationNumber || '01'}
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={spinning}
            onClick={handleSpinRandomStudent}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
              spinning
                ? 'bg-purple-200 text-purple-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${spinning ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{spinning ? 'Đang quay...' : 'Quay gọi tên HS'}</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN TEACHER LIVE STAGE - BRIGHT WHITE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/50">
        {/* Top Control Bar */}
        <header className="min-h-16 py-2.5 px-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black flex items-center gap-1.5 shrink-0 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>PHÒNG LIVE GIÁO VIÊN</span>
            </span>
            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[340px] xl:max-w-[480px]">
              Khối {grade} • Tiết {period}: {periodSpec.lessonTitle} — Lớp {classId}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Quick Broadcaster (Individual isolated activity broadcasters) */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 flex-wrap">
              <button
                type="button"
                onClick={handleOpenWaitingRoomLobby}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'waiting' || liveSession?.activeLiveView === 'waiting'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏫 Phòng Chờ ({classId})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('slide');
                  handleBroadcastSlideDeck(safeCurrentSlideIndex);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  liveSession?.activeLiveView === 'slide'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📢 Phát Slide
              </button>
              {([1, 2, 3] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleBroadcastStage(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    liveSession?.activeLiveView === `hd${st}`
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📢 Phát HĐ {st}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBroadcastPracticeStage3}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  liveSession?.activeLiveView === 'hd3-practice'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📢 Phát HĐ 3 (TH)
              </button>
              <button
                type="button"
                onClick={() => handleBroadcastStage(4)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  liveSession?.activeLiveView === 'hd4'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📢 Phát HĐ 4
              </button>
              {liveSession?.activeLiveView && liveSession.activeLiveView !== 'waiting' && (
                <button
                  type="button"
                  onClick={() =>
                    liveSession?.activeLiveView === 'slide'
                      ? handleEndSlidePresentation()
                      : handleStopActivityBroadcast('Hoạt động đang phát')
                  }
                  className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 hover:bg-rose-700 text-white transition-all cursor-pointer"
                  title="Kết thúc hoạt động đang phát và dừng ngay tại chỗ"
                >
                  ⏹️ Kết thúc hoạt động đang phát
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('theo-doi-tien-do')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'theo-doi-tien-do'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
                title="Theo dõi & mô tả tiến độ trực tiếp của học sinh trong 4 hoạt động"
              >
                <span className="material-symbols-outlined text-[15px]">monitoring</span>
                <span>Tiến độ HS</span>
              </button>
            </div>

              <button
                type="button"
                onClick={() => handleManualTriggerPushNotification()}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 animate-pulse"
                title="Gửi Push Notification nhắc nhở tập trung tức thì sang màn hình học sinh"
              >
                <span>🔔</span>
                <span>Push Nhắc HS</span>
              </button>

              {/* Real-time Focus Monitor Chip */}
              <button
                type="button"
                onClick={() => setShowFocusMonitorModal(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border ${
                  blurredStudentsList.length > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
                title="Xem giám sát tập trung học sinh thời gian thực (phát hiện rời tab/chơi game)"
              >
                <span>{blurredStudentsList.length > 0 ? '⚠️' : '👁️'}</span>
                <span>
                  {blurredStudentsList.length > 0
                    ? `${blurredStudentsList.length} HS rời tab!`
                    : '100% HS tập trung'}
                </span>
              </button>

              {/* Low-Bandwidth Mode Toggle Button */}
              <button
                type="button"
                onClick={handleToggleLowBandwidthMode}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border ${
                  isLowBandwidthMode
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                }`}
                title="Bật/Tắt Chế độ Tiết kiệm Băng thông Phòng máy khi mạng yếu hoặc 40+ HS cùng kết nối"
              >
                <span>🌐</span>
                <span>{isLowBandwidthMode ? 'Băng thông: Tiết kiệm' : 'Tiết kiệm mạng'}</span>
              </button>

            <button
              type="button"
              onClick={() => handleToggleFullscreen()}
              className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs border border-indigo-700 flex items-center gap-1.5"
              title={
                isFullscreen
                  ? 'Thoát Chế độ Toàn màn hình (Phím Esc hoặc F)'
                  : 'Bật Chế độ Toàn màn hình (Full Screen - Phím F) loại bỏ thanh công cụ trình duyệt để tập trung tối đa vào Slide giảng dạy'
              }
            >
              <span className="material-symbols-outlined text-[16px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span>{isFullscreen ? 'Thoát Toàn màn hình (Esc)' : '🖥️ Chế độ Toàn màn hình (Phím F)'}</span>
            </button>

            <button
              type="button"
              onClick={handleTeacherExitAndFinishLive}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black transition-all cursor-pointer shadow-sm border border-rose-700 flex items-center gap-1.5"
              title="Thoát phiên Live: Đồng bộ kết thúc và tự động đóng phiên Live trên thiết bị học sinh"
            >
              <span className="material-symbols-outlined text-[17px]">exit_to_app</span>
              <span>Thoát phiên Live (Đóng phòng HS)</span>
            </button>
          </div>
        </header>

        {/* Content Panel */}
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
          {/* HỆ THỐNG PHÒNG CHỜ PHIÊN LIVE (ĐẶT NGAY PHÍA TRÊN SLIDE BÀI GIẢNG — NHẤN SẴN SÀNG CHO VIỆC HỌC ĐỂ BẮT ĐẦU) */}
          {(activeTab === 'waiting' || activeTab === 'slide') && (
            <LiveClassroomWaitingRoom
              role="teacher"
              grade={grade}
              period={period}
              classId={classId}
              periodSpec={periodSpec}
              students={students}
              liveSession={liveSession}
              onUpdateLiveSession={onUpdateLiveSession}
              defaultCollapsedAfterReady={false}
              onReadyForLearning={() => {
                setActiveTab('slide');
                handleBroadcastSlideDeck(safeCurrentSlideIndex);
              }}
              onStartSlidePresentation={() => {
                setActiveTab('slide');
                handleBroadcastSlideDeck(safeCurrentSlideIndex);
              }}
              onStartActivityStage={(st) => {
                setActiveTab(`hd${st}` as any);
                handleBroadcastStage(st);
              }}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB 0: GIAO DIỆN TRÌNH ĐIỀU KHIỂN SLIDE CHO GIÁO VIÊN (HIỂN THỊ NGAY BÊN DƯỚI PHÒNG CHỜ LIVE) */}
          {(activeTab === 'slide' || activeTab === 'waiting') && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
              {/* Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                    <span className="material-symbols-outlined text-[24px]">co_present</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900">
                        Trình Điều Khiển Slide Bài Giảng Giáo Viên (Đồng Bộ Màn Hình Học Sinh)
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                        ☁️ Google Sheets CSDL &amp; Bộ Nhớ Đệm Ảnh Slide
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isRealRenderedPdfSlideDeck(existingSlideDeck)
                        ? `Đang trình chiếu: ${existingSlideDeck?.fileName} (${slidePages.length} trang Ảnh Slide • ${
                            existingSlideDeck?.totalCompressedKb || 180
                          } KB)`
                        : `⬜ Trang Slide trắng — Chưa có dữ liệu Slide ảnh cho Khối ${grade} • Tiết ${period} (${lessonKey}) trong Google Sheet`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCleanSlideMemory}
                    className="px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    title="Dọn dẹp bộ nhớ RAM trình duyệt, giải phóng các trang slide ở xa cho máy tính 2GB-4GB RAM phòng máy"
                  >
                    <span>🧹</span>
                    <span>Dọn RAM Slide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWebEmbedDrawerOpen((v) => !v)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border shadow-2xs ${
                      liveSession?.slideDisplayMode === 'web-embed'
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
                    }`}
                    title="Trình chiếu Google Slides, Canva, PhET hoặc Scratch có đầy đủ animation và tương tác"
                  >
                    <span>🌐</span>
                    <span>{liveSession?.slideDisplayMode === 'web-embed' ? 'Slide Web: Đang chiếu' : 'Trình chiếu Web/Animation'}</span>
                  </button>

                  {isRealRenderedPdfSlideDeck(existingSlideDeck) ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">
                        table_chart
                      </span>
                      <span>
                        Đã nạp <strong className="font-black">{slidePages.length} trang Ảnh Slide</strong> ({existingSlideDeck?.fileName})
                      </span>
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                      <span>⬜</span>
                      <span>
                        Tiết {period} chưa có dữ liệu Slide trong Sheet (Đang hiển thị Slide trắng)
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* TEACHER SLIDE CONTROLLER TOOLBAR: 1) AUTO-ADVANCE TIMER, 2) EXPLANATION VIDEO, 3) WIRELESS CLICKER KEYS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
                {/* 1. Chuyển đổi tự động theo thời gian định sẵn (Auto-Advance Timer) */}
                <div className="lg:col-span-5 p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-2.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-orange-600">
                        timer
                      </span>
                      <span>Chuyển Slide Tự Động Theo Thời Gian</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isAutoAdvancing
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isAutoAdvancing ? `Đang chạy (${autoAdvanceCountdownSec}s)` : 'Đang tắt'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const nextEnabled = !isAutoAdvancing;
                        setIsAutoAdvancing(nextEnabled);
                        setAutoAdvanceCountdownSec(autoAdvanceIntervalSec);
                        onUpdateLiveSession((prev) => ({
                          ...prev,
                          slideAutoAdvanceStateByLesson: {
                            ...(prev.slideAutoAdvanceStateByLesson || {}),
                            [lessonKey]: {
                              enabled: nextEnabled,
                              intervalSec: autoAdvanceIntervalSec,
                            },
                          },
                          updatedAt: new Date().toISOString(),
                        }));
                        onShowToast(
                          nextEnabled
                            ? `⏱️ Đã BẬT tự động chuyển Slide sau mỗi ${autoAdvanceIntervalSec} giây!`
                            : `⏸️ Đã TẮT tự động chuyển Slide.`
                        );
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition-all ${
                        isAutoAdvancing
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isAutoAdvancing ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{isAutoAdvancing ? 'Dừng tự chuyển' : 'Bật tự động chuyển'}</span>
                    </button>

                    <select
                      value={autoAdvanceIntervalSec}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setAutoAdvanceIntervalSec(val);
                        setAutoAdvanceCountdownSec(val);
                      }}
                      aria-label="Thời gian tự động chuyển slide"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <option value={10}>10 giây / slide</option>
                      <option value={15}>15 giây / slide</option>
                      <option value={30}>30 giây / slide</option>
                      <option value={45}>45 giây / slide</option>
                      <option value={60}>60 giây / slide</option>
                      <option value={90}>90 giây / slide</option>
                      <option value={120}>120 giây / slide</option>
                    </select>
                  </div>

                  {isAutoAdvancing && (
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            5,
                            Math.round((autoAdvanceCountdownSec / autoAdvanceIntervalSec) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Phát Video Giải Thích Kiến Thức Đi Kèm Slide Ảnh */}
                <div className="lg:col-span-7 p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-2.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">
                        smart_display
                      </span>
                      <span>Phát Video Giải Thích Kiến Thức Đi Kèm Slide Ảnh</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleExplanationVideo()}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                        isExplanationVideoPlaying
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isExplanationVideoPlaying ? 'stop_circle' : 'play_circle'}
                      </span>
                      <span>
                        {isExplanationVideoPlaying
                          ? 'Đang phát Video kèm Slide trên HS (Bấm để dừng)'
                          : '🎬 Phát Video Giải Thích Kèm Slide'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={defaultSlideVideoUrl}
                      onChange={(e) => {
                        const found = PRESET_EXPLANATION_VIDEOS.find(
                          (v) => v.url === e.target.value
                        );
                        if (found) {
                          handleToggleExplanationVideo(found.url, found.title, true);
                        }
                      }}
                      aria-label="Chọn video giải thích kiến thức"
                      className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      {PRESET_EXPLANATION_VIDEOS.map((v) => (
                        <option key={v.id} value={v.url}>
                          {v.title}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={customVideoUrlInput}
                      onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                      placeholder="Hoặc dán link MP4 giải thích..."
                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 w-44"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customVideoUrlInput.trim()) return;
                        handleToggleExplanationVideo(
                          customVideoUrlInput.trim(),
                          `Video giải thích Slide #${safeCurrentSlideIndex + 1}`,
                          true
                        );
                        setCustomVideoUrlInput('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
                    >
                      Phát Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Wireless Presenter Clicker & Keyboard Shortcut Status Strip */}
              <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-400">
                    settings_remote
                  </span>
                  <span className="font-bold">
                    Hỗ trợ Bút trình chiếu (Wireless Clicker) &amp; Phím tắt (Đồng bộ chống nhảy loạn):
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/15 text-amber-300 font-black">
                    Phím Space
                  </span>
                  <span>hoặc</span>
                  <span className="px-2 py-0.5 rounded bg-white/15 text-amber-300 font-black">
                    Phím → (Sang phải)
                  </span>
                  <span>để chuyển Slide tiếp •</span>
                  <span className="px-2 py-0.5 rounded bg-white/15 text-sky-300 font-black">
                    Phím ← (Sang trái)
                  </span>
                  <span>để lùi Slide</span>
                </div>

                {liveSession?.activeLiveView === 'slide' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[11px]">
                    🔒 Đã tự động khóa HĐ 1, 2, 3, 4 trên máy HS (Chỉ hiển thị Slide)
                  </span>
                )}
              </div>

              {/* Main Slide Image / HTML / Video + Optional Synchronized Explanation Video Side-by-Side */}
              {slidePages.length === 0 || !activeSlidePage ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center flex flex-col items-center justify-center gap-4 min-h-[340px]">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[34px]">co_present</span>
                  </div>
                  <div className="max-w-xl">
                    <h3 className="text-lg font-black text-slate-900">
                      Đang nạp Ảnh Slide từ Google Sheet &quot;CSDL&quot;...
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Hệ thống tự động tải các dòng Ảnh Slide ({lessonKey}) từ bảng <code>Slides_Pages</code> trên Google Sheet &quot;CSDL&quot; và đồng bộ trình chiếu mượt mà 60FPS.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  ref={slideStageContainerRef}
                  className={
                    isFullscreen
                      ? 'fixed inset-0 z-[100] w-screen h-screen bg-slate-950 text-white p-3 sm:p-5 flex flex-col justify-between overflow-hidden select-none'
                      : 'flex flex-col gap-4'
                  }
                >
                  <div
                    className={`grid grid-cols-1 ${
                      isExplanationVideoPlaying ? 'lg:grid-cols-12' : ''
                    } gap-4 items-start ${isFullscreen ? 'flex-1 min-h-0' : ''}`}
                  >
                    <div
                      className={`${
                        isExplanationVideoPlaying ? 'lg:col-span-7' : 'w-full'
                      } ${isFullscreen ? 'h-full flex flex-col justify-between' : ''}`}
                    >
                      {liveSession?.slideDisplayMode === 'web-embed' && liveSession?.webEmbedSlideUrl ? (
                        <div className={`flex flex-col gap-3 ${isFullscreen ? 'h-full' : ''}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-purple-950 border border-purple-800 text-white text-xs shrink-0">
                            <span className="px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-300 font-bold flex items-center gap-1.5">
                              <span>🌐</span>
                              <span>Đang chiếu Slide Web / Google Slides tương tác (Có animation &amp; âm thanh)</span>
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={handleRevertToPdfSlide}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] cursor-pointer shadow-2xs"
                              >
                                📄 Quay lại Slide PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleFullscreen()}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                </span>
                                <span>{isFullscreen ? 'Thoát' : 'Toàn màn hình (F)'}</span>
                              </button>
                            </div>
                          </div>
                          <div className={`w-full rounded-3xl overflow-hidden border-2 border-purple-400 shadow-xl bg-white ${isFullscreen ? 'flex-1 min-h-0' : 'h-[560px]'}`}>
                            <iframe
                              src={liveSession.webEmbedSlideUrl}
                              title="Trình chiếu Slide Web / Mô phỏng tương tác"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                              className="w-full h-full border-0"
                            />
                          </div>
                        </div>
                      ) : activeSlidePage.htmlContent || activeSlidePage.htmlEmbedUrl ? (
                        <div className={`flex flex-col gap-3 ${isFullscreen ? 'h-full' : ''}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs shrink-0">
                            <span className="px-3 py-1 rounded-full bg-sky-500/25 border border-sky-400/40 text-sky-300 font-bold">
                              🌐 HTML Slide Web #{activeSlidePage.slideNumber} / {slidePages.length}:{' '}
                              {activeSlidePage.title}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                {isSlideUnlocked
                                  ? `Học sinh Lớp ${classId} đang xem đồng bộ HTML Slide Web này`
                                  : `Đang khóa Slide trên màn hình học sinh`}
                              </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFullscreen()}
                                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Bật / Tắt Chế độ Toàn màn hình (Phím F hoặc Esc)"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                  </span>
                                  <span>
                                    {isFullscreen ? 'Thoát Toàn màn hình (Esc)' : 'Toàn màn hình (Phím F)'}
                                  </span>
                                </button>
                              </div>
                            </div>
                            <div
                              className={`w-full rounded-3xl overflow-hidden border-2 border-sky-400/70 shadow-xl bg-slate-950 ${
                                isFullscreen ? 'flex-1 min-h-0' : ''
                              }`}
                            >
                              {activeSlidePage.htmlContent ? (
                                <iframe
                                  srcDoc={activeSlidePage.htmlContent}
                                  title={`HTML Slide ${activeSlidePage.slideNumber}`}
                                  sandbox="allow-scripts allow-forms"
                                  className={`w-full border-0 bg-slate-950 ${
                                    isFullscreen ? 'h-[calc(100vh-135px)]' : 'h-[500px]'
                                  }`}
                                />
                              ) : (
                                <iframe
                                  src={activeSlidePage.htmlEmbedUrl}
                                  title={`Web Slide URL ${activeSlidePage.slideNumber}`}
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                  className={`w-full border-0 bg-white ${
                                    isFullscreen ? 'h-[calc(100vh-135px)]' : 'h-[500px]'
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        ) : activeSlidePage.videoUrl ? (
                          <div className={`flex flex-col gap-3 ${isFullscreen ? 'h-full' : ''}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs shrink-0">
                              <span className="px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-300 font-bold">
                                🎬 Video Slide #{activeSlidePage.slideNumber} / {slidePages.length}:{' '}
                                {activeSlidePage.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFullscreen()}
                                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] cursor-pointer flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                  </span>
                                  <span>
                                    {isFullscreen ? 'Thoát Toàn màn hình (Esc)' : 'Toàn màn hình (Phím F)'}
                                  </span>
                                </button>
                              </div>
                            </div>
                            <div
                              className={`w-full rounded-3xl overflow-hidden border-2 border-purple-400/70 shadow-xl bg-black flex items-center justify-center ${
                                isFullscreen ? 'flex-1 min-h-0' : ''
                              }`}
                            >
                              <video
                                key={activeSlidePage.videoUrl}
                                src={activeSlidePage.videoUrl}
                                controls
                                className={`w-full object-contain ${
                                  isFullscreen ? 'max-h-[calc(100vh-135px)]' : 'max-h-[500px]'
                                }`}
                              />
                            </div>
                          </div>
                        ) : (() => {
                          const isBlankSlide =
                            Boolean((activeSlidePage as any)?.isBlankSlide) ||
                            activeSlidePage.imageUrl === BLANK_WHITE_SLIDE_DATA_URL;
                          const effectiveSlideImageUrl =
                            activeSlidePage.imageUrl || BLANK_WHITE_SLIDE_DATA_URL;
                          return (
                            <div className={`flex flex-col gap-3 ${isFullscreen ? 'h-full' : ''}`}>
                              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs shrink-0">
                                <span className="px-3 py-1 rounded-full bg-orange-500/25 border border-orange-400/40 text-orange-300 font-bold">
                                  {isBlankSlide
                                    ? `⬜ Trang Slide trắng — Chưa có dữ liệu trong Google Sheet "CSDL" (${lessonKey})`
                                    : `🖼️ Slide PDF gốc #${activeSlidePage.slideNumber} / ${slidePages.length}: ${activeSlidePage.title}`}
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    {isFileStorageSlideUrl(effectiveSlideImageUrl)
                                      ? `File Storage 1GB • Đang đồng bộ Lớp ${classId}`
                                      : isSlideUnlocked
                                      ? `Học sinh Lớp ${classId} đang xem đồng bộ Slide này`
                                      : `Đang khóa Slide trên màn hình học sinh`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFullscreen()}
                                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Bật / Tắt Chế độ Toàn màn hình (Phím F hoặc Esc)"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                    </span>
                                    <span>
                                      {isFullscreen ? 'Thoát Toàn màn hình (Esc)' : 'Toàn màn hình (Phím F)'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            <div
                              data-testid="teacher-live-slide-canvas"
                              data-blank-slide={isBlankSlide ? 'true' : 'false'}
                              className={`relative w-full rounded-3xl overflow-hidden border-2 border-slate-300 shadow-xl bg-white flex items-center justify-center ${
                                isFullscreen ? 'flex-1 min-h-0' : 'min-h-[420px]'
                              }`}
                            >
                              <img
                                src={effectiveSlideImageUrl}
                                alt={
                                  isBlankSlide
                                    ? 'Trang Slide trắng'
                                    : `Slide ${activeSlidePage.slideNumber}: ${activeSlidePage.title}`
                                }
                                className={`w-full object-contain bg-white ${
                                  isFullscreen ? 'max-h-[calc(100vh-135px)]' : 'max-h-[500px]'
                                }`}
                                onError={(e) => {
                                  if (e.currentTarget.src !== BLANK_WHITE_SLIDE_DATA_URL) {
                                    e.currentTarget.src = BLANK_WHITE_SLIDE_DATA_URL;
                                  }
                                }}
                              />
                              {isBlankSlide && (
                                <div
                                  data-testid="teacher-blank-slide-notice"
                                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95"
                                >
                                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[34px]">
                                      insert_drive_file
                                    </span>
                                  </div>
                                  <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
                                    ⬜ TRANG SLIDE TRẮNG (CHƯA CÓ DỮ LIỆU SLIDE TRONG SHEET)
                                  </span>
                                  <h4 className="text-base sm:text-lg font-black text-slate-900 max-w-xl">
                                    Chưa có dữ liệu Slide ảnh cho Khối {grade} • Tiết {period} ({lessonKey}) trong Google Sheet
                                  </h4>
                                  <p className="text-xs text-slate-500 max-w-lg mt-1.5 leading-relaxed">
                                    Hãy nhấn nút <strong>&ldquo;📤 Nạp PDF → Lưu Từng Slide Ảnh Vào Sheet&rdquo;</strong> ở bảng Google Sheets phía trên để tách mỗi trang PDF thành 1 ảnh lưu vào Sheet cho tiết học này.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Synchronized Explanation Video Player Column */}
                    {isExplanationVideoPlaying && (
                      <div className="lg:col-span-5 rounded-3xl bg-slate-950 text-white p-4 border-2 border-indigo-500/40 shadow-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                            <span className="text-xs font-black text-indigo-300 truncate">
                              🎬 ĐANG PHÁT VIDEO GIẢI THÍCH KÈM SLIDE #{activeSlidePage.slideNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleExplanationVideo(undefined, undefined, false)}
                            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer shrink-0"
                          >
                            Đóng Video
                          </button>
                        </div>

                        <video
                          key={savedVideoState?.videoUrl || defaultSlideVideoUrl}
                          src={savedVideoState?.videoUrl || defaultSlideVideoUrl}
                          controls
                          autoPlay
                          className="w-full rounded-2xl bg-black aspect-video object-contain"
                        />

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex flex-col gap-1">
                          <strong className="text-white">
                            {savedVideoState?.videoTitle || defaultSlideVideoTitle}
                          </strong>
                          <span>
                            Video giải thích kiến thức này đang hiển thị đồng bộ ngay bên cạnh Slide ảnh trên màn hình học sinh Lớp {classId}.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Synchronized Slide Navigation Bar */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 pt-2 shrink-0 ${
                      isFullscreen
                        ? 'px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 text-white'
                        : ''
                    }`}
                  >
                    <button
                      type="button"
                      disabled={safeCurrentSlideIndex <= 0}
                      onMouseUp={(e) => e.currentTarget.blur()}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        handleChangeSlideIndex(safeCurrentSlideIndex - 1);
                      }}
                      className={`px-5 py-2.5 rounded-full disabled:opacity-40 text-xs font-bold cursor-pointer ${
                        isFullscreen
                          ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      ← Slide trước (Phím ←)
                    </button>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {slidePages.map((s, idx) => (
                        <button
                          key={s.slideNumber}
                          type="button"
                          onMouseUp={(e) => e.currentTarget.blur()}
                          onClick={(e) => {
                            e.currentTarget.blur();
                            handleChangeSlideIndex(idx);
                          }}
                          className={`w-9 h-9 rounded-full text-xs font-bold cursor-pointer transition-all ${
                            safeCurrentSlideIndex === idx
                              ? 'bg-orange-500 text-white shadow-sm'
                              : isFullscreen
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {s.slideNumber}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safeCurrentSlideIndex >= slidePages.length - 1}
                        onMouseUp={(e) => e.currentTarget.blur()}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          handleChangeSlideIndex(safeCurrentSlideIndex + 1);
                        }}
                        className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shadow-xs"
                      >
                        Slide tiếp theo (Space / Phím →)
                      </button>

                      {isFullscreen && (
                        <button
                          type="button"
                          onClick={() => handleToggleFullscreen(false)}
                          className="px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            fullscreen_exit
                          </span>
                          <span>Thoát Toàn màn hình (Esc)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: THEO DÕI TIẾN ĐỘ HỌC SINH TRỰC TIẾP Ở CÁC HOẠT ĐỘNG HỌC */}
          {activeTab === 'theo-doi-tien-do' && (
            <LiveStudentProgressTracker
              students={students}
              classId={classId}
              grade={grade}
              period={period}
              periodSpec={periodSpec}
              liveSession={liveSession}
              onShowToast={onShowToast}
              onUpdateLiveSession={onUpdateLiveSession}
              isEmbedded={true}
            />
          )}

          {/* SLIDE PRESENTER + EMBEDDED CLASS LEADERBOARD CHART FOR ACTIVE TAB */}
          {activeTab === 'hd1' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      1
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 1: Khởi động (Trình chiếu trực tiếp)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Khi Giáo viên phát HĐ 1, màn hình học sinh tự động chuyển sang HĐ 1
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(1)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[1]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[1] ? '🔒 Khóa HĐ 1' : '🔓 Mở khóa HĐ 1'}
                    </button>

                    {/* Chốt Hoạt động 1 */}
                    <button
                      type="button"
                      data-testid="finalize-stage-1-btn"
                      onClick={() => handleToggleFinalizeActivity(1, 'Hoạt động 1: Khởi động')}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-all ${
                        isActivityFinalized(liveSession, lessonKey, 1)
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title="Chốt kết quả Hoạt động 1 để khóa toàn bộ cổng nộp bài phía học sinh"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isActivityFinalized(liveSession, lessonKey, 1) ? 'lock' : 'lock_clock'}
                      </span>
                      <span>
                        {isActivityFinalized(liveSession, lessonKey, 1)
                          ? '✓ Đã chốt HĐ 1 (Mở lại)'
                          : '🔒 Chốt HĐ 1'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(1)}
                      className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát Live HĐ 1 sang HS</span>
                    </button>

                    {liveSession?.activeLiveView === 'hd1' && (
                      <button
                        type="button"
                        onClick={() => handleStopActivityBroadcast('Hoạt động 1: Khởi động')}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                        <span>⏹️ Kết thúc HĐ 1</span>
                      </button>
                    )}
                  </div>
                </div>

                {isActivityFinalized(liveSession, lessonKey, 1) && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-[20px]">lock</span>
                      <span>
                        <strong>HĐ 1 ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Đã khóa cổng nộp câu trả lời Khởi động phía học sinh, đảm bảo tính riêng biệt của phần này.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      ĐÃ ĐÓNG NỘP BÀI
                    </span>
                  </div>
                )}

                <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-3">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                    Tình huống Khởi động đang trình chiếu cho học sinh:
                  </span>
                  <p className="text-base text-slate-800 leading-relaxed font-semibold">
                    {periodSpec.yccd ||
                      'Hãy quan sát bảng dữ liệu thực tế và rút ra nhận định ban đầu của em.'}
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-amber-200/60 text-xs text-slate-600">
                    💡 <strong>Gợi ý sư phạm:</strong> Mời 1-2 cặp học sinh sử dụng tính năng "Quay gọi tên HS" để chia sẻ nhanh trước lớp (+30 XP).
                  </div>
                </div>

                {/* TRỰC QUAN HÓA TIẾN ĐỘ HOÀN THÀNH RIÊNG CỦA HOẠT ĐỘNG 1 */}
                <ActivityCompletionVisualizer
                  stage={1}
                  students={students}
                  classId={classId}
                  grade={grade}
                  period={period}
                  periodSpec={periodSpec}
                  liveSession={liveSession}
                  onShowToast={onShowToast}
                  onUpdateLiveSession={onUpdateLiveSession}
                />
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 1 */}
              {renderEmbeddedClassLeaderboardChart(1, 'Khởi động')}
            </>
          )}

          {activeTab === 'hd2' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black">
                      2
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 2: Khám phá (Phiếu học tập 4.0 điểm)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Kéo thả, Điền khuyết, Nối cột &amp; Trả lời ngắn — Tự động chuyển màn hình HS khi phát
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(2)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[2]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[2] ? '🔒 Khóa HĐ 2' : '🔓 Mở khóa HĐ 2'}
                    </button>

                    {/* Chốt toàn bộ Hoạt động 2 */}
                    <button
                      type="button"
                      data-testid="finalize-stage-2-btn"
                      onClick={() => handleToggleFinalizeActivity(2, 'Hoạt động 2: Khám phá')}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-all ${
                        isActivityFinalized(liveSession, lessonKey, 2)
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title="Chốt toàn bộ Phiếu Khám phá và khóa cổng nộp bài phía học sinh"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isActivityFinalized(liveSession, lessonKey, 2) ? 'lock' : 'lock_clock'}
                      </span>
                      <span>
                        {isActivityFinalized(liveSession, lessonKey, 2)
                          ? '✓ Đã chốt HĐ 2 (Mở lại)'
                          : '🔒 Chốt HĐ 2'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(2)}
                      className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát Live HĐ 2 sang HS</span>
                    </button>

                    {liveSession?.activeLiveView === 'hd2' && (
                      <button
                        type="button"
                        onClick={() => handleStopActivityBroadcast('Hoạt động 2: Khám phá')}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                        <span>⏹️ Kết thúc HĐ 2</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner when Activity 2 is finalized */}
                {isActivityFinalized(liveSession, lessonKey, 2) && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-[20px]">lock</span>
                      <span>
                        <strong>HĐ 2 ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Đã khóa toàn bộ Phiếu Khám phá và 4 bài tập phía học sinh, ngăn nộp thêm hoặc sửa bài.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      ĐÃ ĐÓNG NỘP BÀI
                    </span>
                  </div>
                )}

                {/* Granular Per-Exercise Finalization Toolbar for Activity 2 */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-sky-700">lock_clock</span>
                      <span>Chốt hoạt động cho từng bài tập (Khóa nộp bài độc lập từng phần):</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      (Đảm bảo tính riêng biệt: khi chốt bài nào, học sinh không thể nộp thêm bài đó)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {[
                      { key: 'hd2_drag', num: '1', title: '1. Kéo thả phân loại', pts: '1.0đ' },
                      { key: 'hd2_fill', num: '2', title: '2. Điền khuyết', pts: '1.0đ' },
                      { key: 'hd2_match', num: '3', title: '3. Nối cột định nghĩa', pts: '1.0đ' },
                      { key: 'hd2_short', num: '4', title: '4. Trả lời ngắn / Tự luận', pts: '1.0đ' },
                    ].map((ex) => {
                      const isExFinalized = isActivityFinalized(liveSession, lessonKey, ex.key);
                      return (
                        <div
                          key={ex.key}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                            isExFinalized
                              ? 'bg-rose-50 border-rose-300'
                              : 'bg-white border-sky-200/80 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {ex.title}
                            </span>
                            <span className="text-[11px] font-bold text-sky-700 font-mono">
                              {ex.pts}
                            </span>
                          </div>
                          <button
                            type="button"
                            data-testid={`finalize-exercise-${ex.key}-btn`}
                            onClick={() => handleToggleFinalizeActivity(ex.key, ex.title)}
                            className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs ${
                              isExFinalized
                                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isExFinalized ? 'lock' : 'lock_clock'}
                            </span>
                            <span>{isExFinalized ? '✓ Đã chốt bài' : '🔒 Chốt bài này'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TRỰC QUAN HÓA TIẾN ĐỘ HOÀN THÀNH RIÊNG CỦA HOẠT ĐỘNG 2 (VỊ TRÍ BÔI VÀNG TRONG ẢNH) */}
                <ActivityCompletionVisualizer
                  stage={2}
                  students={students}
                  classId={classId}
                  grade={grade}
                  period={period}
                  periodSpec={periodSpec}
                  liveSession={liveSession}
                  onShowToast={onShowToast}
                  onUpdateLiveSession={onUpdateLiveSession}
                />
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 2 */}
              {renderEmbeddedClassLeaderboardChart(2, 'Khám phá')}
            </>
          )}

          {activeTab === 'hd3' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                      3
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 3: Luyện tập (Đấu trường 25s &amp; Thực hành)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Trắc nghiệm tốc độ 25s &amp; Điều khiển Khóa/Mở Hoạt động Thực hành (3.0 điểm)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(3)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[3]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[3] ? '🔒 Khóa HĐ 3' : '🔓 Mở khóa HĐ 3'}
                    </button>

                    {/* Chốt Hoạt động 3 */}
                    <button
                      type="button"
                      data-testid="finalize-stage-3-btn"
                      onClick={() => handleToggleFinalizeActivity(3, 'Hoạt động 3: Luyện tập')}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-all ${
                        isActivityFinalized(liveSession, lessonKey, 3)
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title="Chốt kết quả Hoạt động 3 và khóa nộp bài phía học sinh"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isActivityFinalized(liveSession, lessonKey, 3) ? 'lock' : 'lock_clock'}
                      </span>
                      <span>
                        {isActivityFinalized(liveSession, lessonKey, 3)
                          ? '✓ Đã chốt HĐ 3 (Mở lại)'
                          : '🔒 Chốt HĐ 3'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(3)}
                      className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát Live HĐ 3 sang HS</span>
                    </button>

                    {liveSession?.activeLiveView === 'hd3' && (
                      <button
                        type="button"
                        onClick={() => handleStopActivityBroadcast('Hoạt động 3: Luyện tập')}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                        <span>⏹️ Kết thúc HĐ 3</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner when Activity 3 is finalized */}
                {isActivityFinalized(liveSession, lessonKey, 3) && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-[20px]">lock</span>
                      <span>
                        <strong>HĐ 3 ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Đã khóa toàn bộ bài làm Đấu trường Trắc nghiệm 25s phía học sinh, ngăn làm bài hoặc nộp thêm.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      ĐÃ ĐÓNG NỘP BÀI
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-lg font-black text-purple-800 block">
                          ⚡ Phần 1: Đấu Trường Luyện Tập &amp; Đồng Hồ Đếm Ngược
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-900 text-amber-300 font-black text-sm flex items-center gap-1.5 shadow-xs">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          <span>{formatCountdownMmSs(arenaRemainingSec)}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Khi mở Đấu trường Luyện tập, đồng hồ đếm ngược thời gian thực sẽ hiển thị đồng bộ trên màn hình học sinh.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleBroadcastStage(3)}
                        className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                      >
                        📢 Mở Đấu trường &amp; Bắt đầu Đếm ngược
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleArenaCountdownPause}
                        className="px-3 py-2 rounded-full bg-white border border-purple-300 text-purple-800 hover:bg-purple-100 text-xs font-bold cursor-pointer"
                      >
                        {arenaCountdownState?.isRunning ? '⏸️ Tạm dừng' : '▶️ Tiếp tục'}
                      </button>
                      <button
                        type="button"
                        data-testid="finalize-arena-part1-btn"
                        onClick={() => handleToggleFinalizeActivity(3, 'Đấu trường Trắc nghiệm 25s')}
                        className={`px-3 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs ${
                          isActivityFinalized(liveSession, lessonKey, 3)
                            ? 'bg-rose-700 hover:bg-rose-800 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isActivityFinalized(liveSession, lessonKey, 3) ? 'lock' : 'lock_clock'}
                        </span>
                        <span>{isActivityFinalized(liveSession, lessonKey, 3) ? '✓ Đã chốt Đấu trường' : '🔒 Chốt Đấu trường'}</span>
                      </button>
                      {[180, 300, 600].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleStartOrResetArenaCountdown(sec)}
                          className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer ${
                            arenaDurationSec === sec
                              ? 'bg-purple-800 text-white'
                              : 'bg-white border border-purple-200 text-purple-700'
                          }`}
                        >
                          {sec / 60} phút
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-black text-indigo-900">
                          💻 Phần 2: Hoạt động 3 (Tiết Thực hành)
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPracticeStage3Unlocked
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPracticeStage3Unlocked ? '🔓 Đã mở cho HS' : '🔒 Đang khóa'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Điều khiển Khóa / Mở đồng bộ hoạt động Thực hành trên máy tính &amp; Nộp sản phẩm Google Drive cho học sinh trong phòng Live.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleTogglePracticeStage3Lock}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer ${
                          isPracticeStage3Unlocked
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isPracticeStage3Unlocked
                          ? '🔒 Khóa Thực hành HĐ 3'
                          : '🔓 Mở khóa Thực hành HĐ 3'}
                      </button>

                      <button
                        type="button"
                        data-testid="finalize-practice-part2-btn"
                        onClick={() => handleToggleFinalizeActivity('hd3-practice', 'HĐ 3: Thực hành máy tính')}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs ${
                          isActivityFinalized(liveSession, lessonKey, 'hd3-practice')
                            ? 'bg-rose-700 hover:bg-rose-800 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isActivityFinalized(liveSession, lessonKey, 'hd3-practice') ? 'lock' : 'lock_clock'}
                        </span>
                        <span>{isActivityFinalized(liveSession, lessonKey, 'hd3-practice') ? '✓ Đã chốt Thực hành' : '🔒 Chốt Thực hành'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBroadcastPracticeStage3}
                        className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">cast</span>
                        <span>Phát Thực hành sang HS</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TRỰC QUAN HÓA TIẾN ĐỘ HOÀN THÀNH RIÊNG CỦA HOẠT ĐỘNG 3 (ĐẤU TRƯỜNG LUYỆN TẬP) */}
                <ActivityCompletionVisualizer
                  stage={3}
                  students={students}
                  classId={classId}
                  grade={grade}
                  period={period}
                  periodSpec={periodSpec}
                  liveSession={liveSession}
                  onShowToast={onShowToast}
                  onUpdateLiveSession={onUpdateLiveSession}
                />
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 3 */}
              {renderEmbeddedClassLeaderboardChart(3, 'Luyện tập')}
            </>
          )}

          {/* TAB 3B: HOẠT ĐỘNG 3 (TIẾT THỰC HÀNH) ĐỒNG BỘ KHÓA/MỞ GIÁO VIÊN & HỌC SINH */}
          {activeTab === 'hd3-practice' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
                      <span className="material-symbols-outlined text-[22px]">computer</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 3 (Tiết Thực hành) — Thực Hành Phòng Máy &amp; Nộp Sản Phẩm Số
                      </h2>
                      <p className="text-xs text-slate-500">
                        Khóa / Mở đồng bộ trực tiếp với Phòng Live Học sinh • Nộp tệp thực hành lên thư mục Google Drive Lớp {classId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleTogglePracticeStage3Lock}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        isPracticeStage3Unlocked
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isPracticeStage3Unlocked
                        ? '🔒 Khóa Hoạt động Thực hành'
                        : '🔓 Mở khóa Hoạt động Thực hành'}
                    </button>

                    {/* Chốt HĐ 3 Thực hành */}
                    <button
                      type="button"
                      data-testid="finalize-stage-3-practice-btn"
                      onClick={() => handleToggleFinalizeActivity('hd3-practice', 'HĐ 3: Thực hành máy tính')}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-all ${
                        isActivityFinalized(liveSession, lessonKey, 'hd3-practice')
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title="Chốt kết quả Thực hành máy tính và khóa nộp sản phẩm Google Drive phía học sinh"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isActivityFinalized(liveSession, lessonKey, 'hd3-practice') ? 'lock' : 'lock_clock'}
                      </span>
                      <span>
                        {isActivityFinalized(liveSession, lessonKey, 'hd3-practice')
                          ? '✓ Đã chốt Thực hành (Mở lại)'
                          : '🔒 Chốt Thực hành'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBroadcastPracticeStage3}
                      className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát Live HĐ 3 (Thực hành) sang HS</span>
                    </button>

                    {liveSession?.activeLiveView === 'hd3-practice' && (
                      <button
                        type="button"
                        onClick={() => handleStopActivityBroadcast('HĐ 3 (Tiết Thực hành)')}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                        <span>⏹️ Kết thúc HĐ 3 (Thực hành)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner when Practice is finalized */}
                {isActivityFinalized(liveSession, lessonKey, 'hd3-practice') && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-[20px]">lock</span>
                      <span>
                        <strong>HĐ THỰC HÀNH ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Đã khóa toàn bộ cổng nộp sản phẩm lên Google Drive phía học sinh, ngăn nộp thêm tệp.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      ĐÃ ĐÓNG NỘP SẢN PHẨM
                    </span>
                  </div>
                )}

                <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                      Trạng thái đồng bộ Phòng Live Học sinh:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isPracticeStage3Unlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isPracticeStage3Unlocked
                        ? '🔓 Đang MỞ cho Học sinh làm bài & nộp tệp thực hành'
                        : '🔒 Đang KHÓA trên màn hình Học sinh'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    Yêu cầu thực hành: Học sinh thực hiện thao tác trên máy tính theo chủ đề{' '}
                    <strong>{periodSpec.lessonTitle}</strong> và tải tệp sản phẩm (Word, Excel, Scratch, Ảnh chụp màn hình...) lên thư mục Google Drive của Lớp {classId}.
                  </p>
                </div>

                {/* TRỰC QUAN HÓA TIẾN ĐỘ HOÀN THÀNH RIÊNG CỦA HOẠT ĐỘNG 3 (THỰC HÀNH PHÒNG MÁY) */}
                <ActivityCompletionVisualizer
                  stage="hd3-practice"
                  students={students}
                  classId={classId}
                  grade={grade}
                  period={period}
                  periodSpec={periodSpec}
                  liveSession={liveSession}
                  onShowToast={onShowToast}
                  onUpdateLiveSession={onUpdateLiveSession}
                />
              </div>

              {renderEmbeddedClassLeaderboardChart(3, 'Thực hành Phòng máy')}
            </>
          )}

          {activeTab === 'hd4' && (
            <>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      4
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Hoạt động 4: Vận dụng (Giải quyết vấn đề thực tiễn)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Mở rộng bài học &amp; liên hệ thực tiễn cuộc sống số (2.0 điểm)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStageLock(4)}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer ${
                        currentUnlockedMap[4]
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {currentUnlockedMap[4] ? '🔒 Khóa HĐ 4' : '🔓 Mở khóa HĐ 4'}
                    </button>

                    {/* Chốt Hoạt động 4 */}
                    <button
                      type="button"
                      data-testid="finalize-stage-4-btn"
                      onClick={() => handleToggleFinalizeActivity(4, 'Hoạt động 4: Vận dụng')}
                      className={`px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-all ${
                        isActivityFinalized(liveSession, lessonKey, 4)
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title="Chốt kết quả Hoạt động 4 và khóa nộp bài phía học sinh"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isActivityFinalized(liveSession, lessonKey, 4) ? 'lock' : 'lock_clock'}
                      </span>
                      <span>
                        {isActivityFinalized(liveSession, lessonKey, 4)
                          ? '✓ Đã chốt HĐ 4 (Mở lại)'
                          : '🔒 Chốt HĐ 4'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBroadcastStage(4)}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">cast</span>
                      <span>📢 Phát Live HĐ 4 sang HS</span>
                    </button>

                    {liveSession?.activeLiveView === 'hd4' && (
                      <button
                        type="button"
                        onClick={() => handleStopActivityBroadcast('Hoạt động 4: Vận dụng')}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                        <span>⏹️ Kết thúc HĐ 4</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner when Activity 4 is finalized */}
                {isActivityFinalized(liveSession, lessonKey, 4) && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-[20px]">lock</span>
                      <span>
                        <strong>HĐ 4 ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Đã khóa toàn bộ cổng nộp bài Vận dụng phía học sinh, đảm bảo tính riêng biệt của phần này.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      ĐÃ ĐÓNG NỘP BÀI
                    </span>
                  </div>
                )}

                <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase">
                    Nhiệm vụ Vận dụng mở rộng:
                  </span>
                  <p className="text-sm text-slate-700 font-medium">
                    Học sinh hoàn thành 3 nhiệm vụ vận dụng thực tế. Học sinh có thể quay lại các Hoạt động 1, 2, 3 trước đó để rà soát và hoàn thiện bài làm trước khi kết thúc tiết học.
                  </p>
                </div>

                {/* TRỰC QUAN HÓA TIẾN ĐỘ HOÀN THÀNH RIÊNG CỦA HOẠT ĐỘNG 4 (VẬN DỤNG) */}
                <ActivityCompletionVisualizer
                  stage={4}
                  students={students}
                  classId={classId}
                  grade={grade}
                  period={period}
                  periodSpec={periodSpec}
                  liveSession={liveSession}
                  onShowToast={onShowToast}
                  onUpdateLiveSession={onUpdateLiveSession}
                />
              </div>

              {/* Embedded Class Leaderboard Chart right inside Activity 4 */}
              {renderEmbeddedClassLeaderboardChart(4, 'Vận dụng')}
            </>
          )}

          {activeTab === 'ket-qua' && (
            <div className="flex flex-col gap-6">
              {renderEmbeddedClassLeaderboardChart(activeStage, 'Tổng hợp cả tiết Live')}

              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                      🏆
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Bảng Chi Tiết Học Sinh &amp; Nhóm Đồng Hành — Lớp {classId}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Danh sách toàn bộ học sinh, bạn đồng hành cùng máy, trạng thái nộp bài và điểm số
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
                    Sĩ số: {effectiveClassStudents.length} học sinh
                  </span>
                </div>

                {/* Real-time Submissions Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Hạng</th>
                        <th className="p-3.5">Mã HS / Máy</th>
                        <th className="p-3.5">Học sinh</th>
                        <th className="p-3.5">Bạn đồng hành cùng máy</th>
                        <th className="p-3.5 text-center">Trạng thái</th>
                        <th className="p-3.5 text-right">Điểm XP</th>
                        <th className="p-3.5 text-right">Điểm TB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rankedStudents.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/80">
                          <td className="p-3.5 font-black text-slate-700">
                            {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                          </td>
                          <td className="p-3.5 font-bold text-sky-700">
                            {st.id} (Máy #{st.stationNumber || '01'})
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                          <td className="p-3.5 text-slate-600 font-medium">
                            {st.partnerName || 'Học cá nhân (1 mình)'}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                st.submissionStatus === 'Đã nộp'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {st.submissionStatus || 'Đang làm'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-black text-amber-600">
                            {st.xp.toLocaleString()} XP
                          </td>
                          <td className="p-3.5 text-right font-bold text-slate-900">
                            {(st.avgScore || 9.0).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 1. FOCUS & ANTI-DISTRACTION MONITOR MODAL */}
      {showFocusMonitorModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 flex flex-col gap-5 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                  👁️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Bảng Giám Sát Tập Trung Học Sinh (Phòng Máy Lớp {classId})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phát hiện học sinh chuyển tab sang Youtube/Game hoặc thu nhỏ cửa sổ học
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFocusMonitorModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-[11px] font-bold text-rose-700 block uppercase tracking-wider">
                  Đang rời tab học
                </span>
                <strong className="text-2xl font-black text-rose-600">
                  {blurredStudentsList.length}
                </strong>
                <span className="text-[10px] text-rose-500 block">học sinh</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">
                  Đang tập trung
                </span>
                <strong className="text-2xl font-black text-emerald-600">
                  {Math.max(0, effectiveClassStudents.length - blurredStudentsList.length)}
                </strong>
                <span className="text-[10px] text-emerald-500 block">học sinh</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wider">
                  Tổng lượt chuyển tab
                </span>
                <strong className="text-2xl font-black text-amber-600">
                  {Object.values(focusAlerts).reduce((sum, a) => sum + (a.tabSwitchCount || 0), 0)}
                </strong>
                <span className="text-[10px] text-amber-500 block">lượt vi phạm</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-600">
                Nhắc nhở học sinh tập trung:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleManualTriggerPushNotification();
                    onShowToast('📢 Đã phát chuông và gửi cảnh báo tập trung tới toàn bộ máy học sinh!');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>🔔</span>
                  <span>Phát chuông nhắc nhở toàn lớp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFocusAlerts({});
                    onUpdateLiveSession((prev) => ({
                      ...prev,
                      studentFocusAlerts: {},
                      updatedAt: new Date().toISOString(),
                    }));
                    onShowToast('🧹 Đã xóa sạch lịch sử cảnh báo tập trung.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              </div>
            </div>

            {/* Focus Table List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold tracking-wider uppercase border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-3">Máy #</th>
                    <th className="p-3">Học sinh</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-center">Số lần rời tab</th>
                    <th className="p-3 text-right">Thời điểm gần nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {effectiveClassStudents.map((st) => {
                    const alert = focusAlerts[st.id];
                    const isBlurred = alert?.isCurrentlyBlurred ?? false;
                    const switchCount = alert?.tabSwitchCount ?? 0;
                    return (
                      <tr
                        key={st.id}
                        className={
                          isBlurred
                            ? 'bg-rose-50/70'
                            : switchCount > 0
                            ? 'bg-amber-50/40'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="p-3 font-bold text-slate-700">
                          Máy #{st.stationNumber || '01'}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{st.name}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              isBlurred
                                ? 'bg-rose-600 text-white animate-pulse'
                                : switchCount > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isBlurred ? '⚠️ Đang rời tab' : switchCount > 0 ? 'Đã quay lại' : '✓ Tập trung'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-black">
                          {switchCount > 0 ? (
                            <span className="text-rose-600">{switchCount} lần</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono text-[11px]">
                          {alert?.lastBlurAtIso
                            ? new Date(alert.lastBlurAtIso).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. WEB-EMBED SLIDE DRAWER / MODAL */}
      {isWebEmbedDrawerOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
                  🌐
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Trình Chiếu Slide Web / Mô Phỏng Tương Tác
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ Google Slides, Canva, Microsoft Office 365, PhET, Scratch (Có đầy đủ animation/video)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWebEmbedDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">
                Dán đường dẫn bài giảng Google Slides / Canva / Mô phỏng:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={webEmbedInputUrl}
                  onChange={(e) => setWebEmbedInputUrl(e.target.value)}
                  placeholder="https://docs.google.com/presentation/d/... hoặc link Canva, PhET, Scratch"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-purple-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyWebEmbedSlide(webEmbedInputUrl)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs cursor-pointer shadow-md transition-all shrink-0"
                >
                  Mở &amp; Chiếu ngay 🚀
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex flex-col gap-1.5">
              <strong className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-purple-700">
                <span>💡</span> Gợi ý nền tảng tương thích 100%:
              </strong>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() =>
                    setWebEmbedInputUrl(
                      'https://docs.google.com/presentation/d/e/2PACX-1vQdemo/embed?start=false&loop=false&delayms=3000'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 hover:bg-purple-100 cursor-pointer"
                >
                  + Mẫu Google Slides
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWebEmbedInputUrl(
                      'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 hover:bg-purple-100 cursor-pointer"
                >
                  + Mẫu Mô phỏng PhET
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWebEmbedInputUrl(
                      'https://scratch.mit.edu/projects/10128407/embed'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 hover:bg-purple-100 cursor-pointer"
                >
                  + Mẫu Dự án Scratch Tin học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
