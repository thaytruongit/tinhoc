import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
  type StudentWorkDraft,
  type TaggedLessonSubmission,
  type PracticalProductSubmission,
  INITIAL_MINIGAME_QUESTIONS,
  INITIAL_PRACTICAL_SUBMISSIONS,
  getPeriodsForGrade,
  getDefaultWorksheetForLesson,
} from '../data/mockCurriculumData';
import { UnifiedDiscoveryWorksheet } from './UnifiedDiscoveryWorksheet';
import {
  WarmupEssayActivity,
  DragDropActivity,
  FillBlankActivity,
  MatchingActivity,
  ShortAnswerActivity,
  QuizArena25sActivity,
  GoogleDrivePracticalActivity,
  ApplicationThreeTasksActivity,
} from './InteractiveActivities';
import { PeerReviewModal } from './PeerReviewModal';
import {
  playStageBroadcastSound,
  triggerSynchronizedCelebration,
} from '../utils/soundEffects';
import {
  isStudentLiveViewUnlocked,
  computeArenaRemainingSeconds,
  formatCountdownMmSs,
  getArenaCountdownVisualState,
  isActivityFinalized,
} from '../utils/slideAndArenaController';
import { LiveClassroomWaitingRoom } from './LiveClassroomWaitingRoom';
import { getTeacherGoogleDriveFolderUrl } from '../utils/googleDriveService';

interface StudentLiveRoomProps {
  currentStudent: StudentRosterItem;
  students: StudentRosterItem[];
  periodSpec: CurriculumPeriodSpec;
  liveSession?: LiveClassroomSession;
  unlockedStages: Record<number, boolean>;
  companionMode?: 'unselected' | 'paired' | 'solo';
  onExitLiveRoom: () => void;
  onAwardXp: (delta: number) => void;
  onShowToast: (msg: string) => void;
  onUpdateLiveSession?: (updater: (prev: LiveClassroomSession) => LiveClassroomSession) => void;
  onUpdateDraft?: (updater: (prev: StudentWorkDraft) => StudentWorkDraft) => void;
  onSaveSubmission?: (sub: Partial<TaggedLessonSubmission>) => void;
}

type StudentLiveViewId = 'waiting' | 1 | 2 | 3 | 'hd3-practice' | 4;

export const StudentLiveRoom: React.FC<StudentLiveRoomProps> = ({
  currentStudent,
  students,
  periodSpec: propPeriodSpec,
  liveSession,
  unlockedStages,
  companionMode = 'paired',
  onExitLiveRoom,
  onAwardXp,
  onShowToast,
  onUpdateLiveSession,
}) => {
  // Always synchronize to the exact Grade & Period the Teacher is broadcasting
  const periodSpec: CurriculumPeriodSpec = React.useMemo(() => {
    if (liveSession?.isBroadcasting && liveSession.activeGrade && liveSession.activePeriod) {
      const gPeriods = getPeriodsForGrade(liveSession.activeGrade);
      const found = gPeriods.find((p) => p.period === liveSession.activePeriod);
      if (found) return found;
    }
    return propPeriodSpec;
  }, [
    liveSession?.isBroadcasting,
    liveSession?.activeGrade,
    liveSession?.activePeriod,
    propPeriodSpec,
  ]);

  const lessonKey = `k${periodSpec.grade}-tiet-${periodSpec.period}`;
  const teacherCurrentStage = (liveSession?.activeStage as 1 | 2 | 3 | 4) || 1;
  const teacherActiveView = liveSession?.activeLiveView;
  const effectiveUnlockedStages: Record<number, boolean> =
    liveSession?.unlockedStagesByLesson?.[lessonKey] || unlockedStages || {
      1: false,
      2: false,
      3: false,
      4: false,
    };

  const resolveInitialView = (): StudentLiveViewId => {
    const wrMode = liveSession?.waitingRoomByLesson?.[lessonKey]?.activeBoardMode;
    const mode =
      teacherActiveView && teacherActiveView !== 'waiting'
        ? teacherActiveView
        : wrMode || teacherActiveView;
    if (!mode || mode === 'waiting' || mode === 'slide') return 'waiting';
    if (
      mode === 'hd3-practice' &&
      Boolean(liveSession?.unlockedPracticeStage3ByLesson?.[lessonKey])
    ) {
      return 'hd3-practice';
    }
    if (mode === 'hd1' && effectiveUnlockedStages[1]) return 1;
    if (mode === 'hd2' && effectiveUnlockedStages[2]) return 2;
    if (mode === 'hd3' && effectiveUnlockedStages[3]) return 3;
    if (mode === 'hd4' && effectiveUnlockedStages[4]) return 4;
    return 'waiting';
  };

  const [activeView, setActiveView] = useState<StudentLiveViewId>(resolveInitialView);
  const [stage2SubTab, setStage2SubTab] = useState<'drag' | 'fill' | 'match' | 'short'>('drag');
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({});
  const [isStudentArenaReady, setIsStudentArenaReady] = useState<boolean>(false);

  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cloudplay_student_focus_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cloudplay_student_focus_mode', String(next));
      } catch {}
      onShowToast(
        next
          ? '🎯 Đã BẬT Chế độ tập trung: Đã ẩn thanh điều hướng để em dồn 100% sự tập trung vào bài tập!'
          : '👁️ Đã TẮT Chế độ tập trung: Hiển thị lại thanh điều hướng bài học.'
      );
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl && (activeEl as HTMLElement).isContentEditable);
      if (isInput) return;

      if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleToggleFocusMode();
        }
      } else if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, onShowToast]);

  useEffect(() => {
    setIsStudentArenaReady(false);
  }, [lessonKey]);

  // Direct BroadcastChannel listener for live session events from TeacherPortal / TeacherLivePresenterRoom
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('cloudplay_realtime_sync');
    ch.onmessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'LIVE_SESSION_ENDED') {
        if (!data.classId || data.classId === currentStudent.classId) {
          onShowToast(
            '🔔 Giáo viên đã kết thúc & thoát phiên Live! Phiên học trực tiếp của lớp đã đóng lại, em có thể tiếp tục tự luyện tập.'
          );
          onExitLiveRoom();
        }
      }
    };
    return () => {
      ch.close();
    };
  }, [onShowToast, onExitLiveRoom, currentStudent.classId]);

  // Synchronized lock state for Stage 3 Practical Activity
  const isPracticeStage3Unlocked = Boolean(
    liveSession?.unlockedPracticeStage3ByLesson?.[lessonKey]
  );

  // Synchronized Practice Arena Countdown Clock state (when Hoạt động 3 is opened AND student clicked Sẵn sàng luyện tập)
  const arenaCountdownState = liveSession?.arenaCountdownStateByLesson?.[lessonKey];
  const arenaDurationSec = Math.max(10, Number(arenaCountdownState?.durationSec) || 300);
  const [arenaRemainingSec, setArenaRemainingSec] = useState<number>(arenaDurationSec);
  const arenaVisual = getArenaCountdownVisualState(arenaRemainingSec, arenaDurationSec);

  useEffect(() => {
    if (!isStudentArenaReady) {
      setArenaRemainingSec(arenaDurationSec);
      return;
    }
    const tick = () => {
      setArenaRemainingSec((prev) => {
        const synced = computeArenaRemainingSeconds(
          liveSession?.arenaCountdownStateByLesson?.[lessonKey]
        );
        if (liveSession?.arenaCountdownStateByLesson?.[lessonKey]?.isRunning) {
          return synced;
        }
        return Math.max(0, prev - 1);
      });
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isStudentArenaReady, arenaDurationSec, liveSession?.arenaCountdownStateByLesson, lessonKey]);

  // Fullscreen ('Phóng to' / 'Thu nhỏ') state for projectors and interactive screens
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        onShowToast('🖥️ Đã bật chế độ Phóng to toàn màn hình (Fullscreen) để xem rõ bài học!');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        onShowToast('🖥️ Đã thoát chế độ Phóng to toàn màn hình.');
      }
    } catch {
      setIsFullscreen((prev) => !prev);
      onShowToast(
        !isFullscreen
          ? '🖥️ Đã tối ưu không gian hiển thị phóng to toàn màn hình!'
          : '🖥️ Đã thu nhỏ khung hiển thị về mặc định.'
      );
    }
  };

  // Track real-time Top Performers in Class
  const rankedLiveStudents = [...students]
    .filter((s) => s.classId === currentStudent.classId)
    .sort((a, b) => b.xp - a.xp);

  const [liveTopPerformerAlert, setLiveTopPerformerAlert] = useState<{
    id: string;
    name: string;
    xp: number;
  } | null>(null);
  const [showLiveLeaderboardDrawer, setShowLiveLeaderboardDrawer] = useState(false);
  const lastStudentLeaderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (rankedLiveStudents.length > 0) {
      const topOne = rankedLiveStudents[0];
      if (lastStudentLeaderIdRef.current && lastStudentLeaderIdRef.current !== topOne.id) {
        setLiveTopPerformerAlert({
          id: topOne.id,
          name: topOne.name,
          xp: topOne.xp,
        });
        triggerSynchronizedCelebration();
        onShowToast(
          `👑 TOP PERFORMER MỚI: Bạn ${topOne.name} vừa bứt phá dẫn đầu Lớp (${topOne.xp} XP)! ✨`
        );
        const timer = setTimeout(() => {
          setLiveTopPerformerAlert(null);
        }, 7000);
        return () => clearTimeout(timer);
      }
      lastStudentLeaderIdRef.current = topOne.id;
    }
  }, [rankedLiveStudents, onShowToast]);

  // Track last teacher broadcast view and waitingRoom board mode so whenever Teacher switches to an activity, Student follows cleanly in real time
  const waitingRoomBoardMode = liveSession?.waitingRoomByLesson?.[lessonKey]?.activeBoardMode;
  const effectiveTeacherBroadcastMode =
    teacherActiveView === 'waiting' || teacherActiveView === 'slide'
      ? 'slide'
      : teacherActiveView || waitingRoomBoardMode || 'slide';
  const broadcastTriggerKey = `${lessonKey}_${effectiveTeacherBroadcastMode}_${liveSession?.lastPushNotification?.id || ''}`;
  const lastTeacherViewRef = useRef<string | undefined>(broadcastTriggerKey);

  useEffect(() => {
    if (
      effectiveTeacherBroadcastMode &&
      broadcastTriggerKey !== lastTeacherViewRef.current
    ) {
      lastTeacherViewRef.current = broadcastTriggerKey;
      if (effectiveTeacherBroadcastMode === 'slide') {
        setActiveView('waiting');
        playStageBroadcastSound();
        onShowToast(
          `🏫 Đang trình chiếu Slide Bài Giảng: Tiết ${periodSpec.period} - ${periodSpec.lessonTitle}!`
        );
        return;
      }
      if (effectiveTeacherBroadcastMode === 'hd3-practice' && isPracticeStage3Unlocked) {
        setActiveView('hd3-practice');
        playStageBroadcastSound();
        onShowToast(
          '📢 Giáo viên vừa phát trực tiếp Hoạt động 3 (Tiết Thực hành) — Màn hình của em đã tự động mở Thực hành!'
        );
        return;
      }
      const stageMap: Record<string, 1 | 2 | 3 | 4> = {
        hd1: 1,
        hd2: 2,
        hd3: 3,
        hd4: 4,
      };
      const mapped = stageMap[effectiveTeacherBroadcastMode];
      if (mapped && effectiveUnlockedStages[mapped]) {
        setActiveView(mapped);
        playStageBroadcastSound();
        onShowToast(
          `📢 Giáo viên vừa phát trực tiếp Hoạt động ${mapped} — Màn hình của em đã tự động chuyển sang Hoạt động ${mapped}!`
        );
      }
    }
  }, [
    broadcastTriggerKey,
    effectiveTeacherBroadcastMode,
    isPracticeStage3Unlocked,
    effectiveUnlockedStages,
    periodSpec.period,
    periodSpec.lessonTitle,
    onShowToast,
  ]);

  // When Teacher exits the live room or ends broadcast, automatically close student live room
  useEffect(() => {
    if (liveSession && liveSession.isBroadcasting === false) {
      onShowToast(
        '🔔 Tiết Live đã kết thúc! Thầy/Cô đã đánh dấu hoàn thành tiết học — Toàn bộ hoạt động đã được mở khóa để các em tự luyện!'
      );
      onExitLiveRoom();
    }
  }, [liveSession?.isBroadcasting, onExitLiveRoom, onShowToast]);

  // Stage 2 local state
  const [dragSlots, setDragSlots] = useState<Record<number, string | null>>({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<{ a: string; b: string; c: string }>({
    a: '',
    b: '',
    c: '',
  });
  const [matchingConnections, setMatchingConnections] = useState<Record<string, string>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
  const [warmupAnswer, setWarmupAnswer] = useState('');
  const [appAnswers, setAppAnswers] = useState({
    deepAnalysis: '',
    practicalTask: '',
    extendedTask: '',
  });

  const livePracticalSubmissions: PracticalProductSubmission[] = useMemo(() => {
    return liveSession?.practicalSubmissions || INITIAL_PRACTICAL_SUBMISSIONS;
  }, [liveSession?.practicalSubmissions]);

  const teacherDriveUrl = useMemo(() => {
    return (
      liveSession?.teacherDriveGlobalUrl ||
      getTeacherGoogleDriveFolderUrl(periodSpec.grade, currentStudent.classId)
    );
  }, [liveSession?.teacherDriveGlobalUrl, periodSpec.grade, currentStudent.classId]);

  const handleSubmitPracticalProduct = (payload: {
    fileName: string;
    fileType: string;
    fileSize: string;
    studentNote: string;
    fileDataUrl?: string;
    driveFileUrl?: string;
  }) => {
    if (isStage3PracticeFinalized) {
      onShowToast('⚠️ Hoạt động thực hành đã được Giáo viên chốt kết quả và đóng nộp bài!');
      return;
    }
    const newSub: PracticalProductSubmission = {
      id: `sub-${currentStudent.id}-p${periodSpec.period}-${Date.now()}`,
      folderId: `drv-${currentStudent.classId}-p${periodSpec.period}`,
      grade: periodSpec.grade,
      classId: currentStudent.classId,
      period: periodSpec.period,
      lessonTitle: periodSpec.lessonTitle,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentUsername: currentStudent.username || currentStudent.id,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      fileDataUrl: payload.fileDataUrl,
      driveFileUrl: payload.driveFileUrl,
      teacherDriveFolderUrl: teacherDriveUrl,
      drivePath: `Google Drive / Khối ${periodSpec.grade} / Lớp ${currentStudent.classId} / Tiết ${periodSpec.period} / ${payload.fileName}`,
      studentNote: payload.studentNote,
      submittedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Chờ chấm',
      score: null,
      maxPoints: 3,
      teacherFeedback: '',
    };

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => {
        const existing = prev.practicalSubmissions || INITIAL_PRACTICAL_SUBMISSIONS;
        const filtered = existing.filter(
          (s) =>
            !(
              s.studentId === currentStudent.id &&
              s.period === periodSpec.period &&
              s.classId === currentStudent.classId
            )
        );
        return {
          ...prev,
          practicalSubmissions: [newSub, ...filtered],
        };
      });
    }

    markStageCompleted(
      'hd3-practice',
      50,
      `🎵☁️ Đã nộp sản phẩm "${payload.fileName}" lên Google Drive của Thầy Đỗ Mạnh Trường (+50 XP)!`
    );
  };

  const isSolo =
    companionMode === 'solo' ||
    !currentStudent.partnerName ||
    currentStudent.partnerName === 'Học cá nhân (1 mình)';

  const partnerStudent = isSolo
    ? null
    : students.find((s) => s.id === currentStudent.partnerId) || {
        name: currentStudent.partnerName || 'Nguyễn Bảo An',
      };

  const isViewUnlocked = (viewId: StudentLiveViewId): boolean => {
    if (viewId === 'waiting') return true;
    return isStudentLiveViewUnlocked({
      viewId,
      teacherActiveView,
      isPracticeStage3Unlocked,
      unlockedStages: effectiveUnlockedStages,
      teacherCurrentStage,
    });
  };

  // Whenever Teacher locks the activity the Student is currently viewing, immediately return to Slide view
  useEffect(() => {
    if (activeView !== 'waiting' && !isViewUnlocked(activeView)) {
      setActiveView('waiting');
      onShowToast(
        '🔒 Giáo viên vừa khóa hoạt động này — Màn hình của em đã tự động chuyển về Bảng Slide Bài Giảng!'
      );
    }
  }, [
    activeView,
    teacherActiveView,
    isPracticeStage3Unlocked,
    effectiveUnlockedStages[1],
    effectiveUnlockedStages[2],
    effectiveUnlockedStages[3],
    effectiveUnlockedStages[4],
  ]);

  const navItems: {
    id: StudentLiveViewId;
    label: string;
    icon: string;
    points: string;
  }[] = [
    {
      id: 'waiting',
      label: 'Phòng Live Chính (Slide)',
      icon: 'meeting_room',
      points: 'Bảng Chính',
    },
    {
      id: 1,
      label: 'Khởi động',
      icon: 'psychology',
      points: '1.0đ',
    },
    {
      id: 2,
      label: 'Khám phá',
      icon: 'menu_book',
      points: '4.0đ',
    },
    {
      id: 3,
      label: 'Luyện tập',
      icon: 'extension',
      points: '3.0đ',
    },
    {
      id: 'hd3-practice',
      label: 'HĐ 3 (Tiết Thực hành)',
      icon: 'folder_managed',
      points: 'Thực hành',
    },
    {
      id: 4,
      label: 'Vận dụng',
      icon: 'assignment_turned_in',
      points: '2.0đ',
    },
  ];

  const isStage1Finalized = isActivityFinalized(liveSession, lessonKey, 1);
  const isStage2Finalized = isActivityFinalized(liveSession, lessonKey, 2);
  const isStage2DragFinalized = isActivityFinalized(liveSession, lessonKey, 'hd2_drag');
  const isStage2FillFinalized = isActivityFinalized(liveSession, lessonKey, 'hd2_fill');
  const isStage2MatchFinalized = isActivityFinalized(liveSession, lessonKey, 'hd2_match');
  const isStage2ShortFinalized = isActivityFinalized(liveSession, lessonKey, 'hd2_short');
  const isStage3ArenaFinalized = isActivityFinalized(liveSession, lessonKey, 3);
  const isStage3PracticeFinalized = isActivityFinalized(liveSession, lessonKey, 'hd3-practice');
  const isStage4Finalized = isActivityFinalized(liveSession, lessonKey, 4);

  const markStageCompleted = (stageKey: string | number, xpBonus: number, msg: string) => {
    if (isActivityFinalized(liveSession, lessonKey, stageKey)) {
      onShowToast('⚠️ Hoạt động này đã được Giáo viên chốt kết quả và đóng nộp bài!');
      return;
    }
    setCompletedStages((prev) => ({ ...prev, [String(stageKey)]: true }));
    triggerSynchronizedCelebration('xp');
    onAwardXp(xpBonus);
    onShowToast(msg);

    const completedStageItem: 'hd3-practice' | 1 | 2 | 3 | 4 =
      stageKey === 'hd3-practice'
        ? 'hd3-practice'
        : stageKey === 3 || stageKey === '3'
        ? 3
        : stageKey === 2 || stageKey === '2' || String(stageKey).startsWith('hd2')
        ? 2
        : stageKey === 4 || stageKey === '4'
        ? 4
        : 1;
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => {
        const prevMap = prev.completedStagesByStudent || {};
        const prevList = prevMap[currentStudent.id] || [];
        const nextList: ('hd3-practice' | 1 | 2 | 3 | 4)[] = prevList.includes(completedStageItem)
          ? prevList
          : [...prevList, completedStageItem];
        return {
          ...prev,
          completedStagesByStudent: {
            ...prevMap,
            [currentStudent.id]: nextList,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    }
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('cloudplay_realtime_sync');
        bc.postMessage({
          type: 'STUDENT_STAGE_COMPLETED',
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          classId: liveSession?.activeClassId || currentStudent.classId,
          lessonKey,
          stage: completedStageItem,
          score: 10,
          timestampIso: new Date().toISOString(),
        });
        bc.close();
      }
    } catch {
      // ignore
    }
  };

  const isArenaStage3Unlocked = isViewUnlocked(3);

  return (
    <div className="flex w-full min-h-screen bg-white text-slate-900">
      {/* 1. LEFT VERTICAL SIDEBAR - BRIGHT WHITE THEME MATCHING IMAGE 1 (HIDDEN IN FOCUS MODE) */}
      {!isFocusMode && (
      <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="flex flex-col gap-6">
          {/* Orange Rounded Pill "Trang chủ" Button from Image 1 */}
          <button
            type="button"
            onClick={onExitLiveRoom}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            title="Quay lại Trang chủ học sinh"
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span>Trang chủ</span>
          </button>

          {/* Activities + Practice Menu */}
          <div className="flex flex-col gap-1.5">
            <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tiến trình bài học Live
            </span>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const unlocked = isViewUnlocked(item.id);
                const isActive = activeView === item.id;
                const isTeacherBroadcastingThis =
                  (item.id === 'hd3-practice' && teacherActiveView === 'hd3-practice') ||
                  (typeof item.id === 'number' && teacherActiveView === `hd${item.id}`);
                const isDone = Boolean(completedStages[String(item.id)]);

                return (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        onShowToast(`🔒 "${item.label}" đang khóa — Chờ Giáo viên mở khóa trên màn hình điều khiển!`);
                        return;
                      }
                      setActiveView(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left font-bold text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-orange-50 text-orange-900 border-2 border-orange-300 shadow-xs'
                        : unlocked
                        ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100 hover:border-slate-200'
                        : 'text-slate-400 bg-slate-50/70 border border-slate-100 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[21px] ${
                          isActive
                            ? 'text-orange-600'
                            : unlocked
                            ? 'text-slate-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.label}</span>
                        {isTeacherBroadcastingThis && (
                          <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                            GV đang phát
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActivityFinalized(liveSession, lessonKey, item.id) ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black border border-rose-200">
                          🔒 Đã chốt
                        </span>
                      ) : !unlocked ? (
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          lock
                        </span>
                      ) : isDone ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                          ✓ Xong
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">
                          {item.points}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Guide notice that students can go back to earlier stages */}
          <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-900 flex flex-col gap-1">
            <div className="font-bold flex items-center gap-1.5 text-sky-800">
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Đồng bộ tự động &amp; Quay lại</span>
            </div>
            <p className="text-[11px] text-sky-700 leading-relaxed">
              Màn hình tự động chuyển khi Giáo viên phát hoạt động mới. Em có thể bấm vào các mục đã mở khóa để hoàn thiện bài!
            </p>
          </div>
        </div>

        {/* Live Status & Companion Mini Card at bottom of sidebar */}
        <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Phòng Học Live</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px]">
              Tiết {periodSpec.period}
            </span>
          </div>

          <div className="text-xs text-slate-600 truncate">
            {partnerStudent ? (
              <>
                Bạn cùng máy: <strong className="text-sky-700">{partnerStudent.name}</strong>
              </>
            ) : (
              <>
                Hình thức: <strong className="text-indigo-700">Học cá nhân (1 mình)</strong>
              </>
            )}
          </div>

          {partnerStudent && (
            <button
              type="button"
              onClick={() => setShowPeerReviewModal(true)}
              className="w-full py-2 px-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">rate_review</span>
              <span>Đánh giá bạn cùng cặp</span>
            </button>
          )}
        </div>
      </aside>
      )}

      {/* Floating restore button when in Focus Mode */}
      {isFocusMode && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            type="button"
            onClick={handleToggleFocusMode}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition-all cursor-pointer border border-slate-700"
            title="Hiển thị lại menu tiến trình (Phím F hoặc Esc)"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Hiện lại menu</span>
          </button>
        </div>
      )}

      {/* 2. MAIN LIVE ROOM CONTENT AREA - BRIGHT WHITE STUDENT-FRIENDLY */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/40">
        {/* Top Header of Live Room */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-black flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>
                ĐANG HỌC LIVE (
                {teacherActiveView === 'hd3-practice'
                  ? 'HĐ 3 Thực Hành'
                  : teacherActiveView === 'hd1'
                  ? 'HĐ 1'
                  : teacherActiveView === 'hd2'
                  ? 'HĐ 2'
                  : teacherActiveView === 'hd3'
                  ? 'HĐ 3'
                  : teacherActiveView === 'hd4'
                  ? 'HĐ 4'
                  : 'Đang chờ GV phát'}
                )
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
              Khối {periodSpec.grade} • Tiết {periodSpec.period}: {periodSpec.lessonTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">
              <span>HS:</span>
              <strong className="text-orange-600">{currentStudent.name}</strong>
              <span className="text-slate-300">|</span>
              {partnerStudent ? (
                <>
                  <span>Cùng máy:</span>
                  <strong className="text-sky-700">{partnerStudent.name}</strong>
                </>
              ) : (
                <strong className="text-indigo-700">Học cá nhân (1 mình)</strong>
              )}
            </div>

            <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black flex items-center gap-1">
              <span>✪</span>
              <span>{currentStudent.xp.toLocaleString()} XP</span>
            </div>

            <button
              type="button"
              onClick={handleToggleFocusMode}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                isFocusMode
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-sm'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
              title={
                isFocusMode
                  ? 'Đang bật Chế độ tập trung (Phím F). Bấm để hiển thị lại menu bên trái'
                  : 'Bật Chế độ tập trung (Ẩn menu bên trái để mở rộng 100% không gian cho câu hỏi) (Phím F)'
              }
            >
              <span className={`material-symbols-outlined text-[16px] ${isFocusMode ? 'animate-pulse' : ''}`}>
                center_focus_strong
              </span>
              <span className="hidden sm:inline">
                {isFocusMode ? 'Tập trung: Bật' : 'Chế độ tập trung'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                isFullscreen
                  ? 'bg-slate-900 text-white border border-slate-700'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
              }`}
              title={
                isFullscreen
                  ? 'Thu nhỏ màn hình (Thoát Fullscreen)'
                  : 'Phóng to toàn màn hình (Fullscreen) tối ưu hiển thị bài học'
              }
            >
              <span className="material-symbols-outlined text-[16px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span className="hidden sm:inline">
                {isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowLiveLeaderboardDrawer((v) => !v)}
              className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Xem bảng xếp hạng trực tiếp của Lớp"
            >
              <span>🏆</span>
              <span className="hidden sm:inline">Top Lớp</span>
            </button>

            {partnerStudent && (
              <button
                type="button"
                onClick={() => setShowPeerReviewModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">stars</span>
                <span className="hidden sm:inline">Đánh giá bạn</span>
              </button>
            )}
          </div>
        </header>

        {/* Content of the active view */}
        <div
          className={`p-6 sm:p-8 mx-auto w-full flex flex-col gap-5 ${
            isFullscreen ? 'max-w-7xl' : 'max-w-5xl'
          }`}
        >
          {/* TOP HORIZONTAL NAVIGATION BAR: HOẠT ĐỘNG 1, 2, 3, 3-THỰC HÀNH, 4 */}
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {navItems.map((item) => {
                const unlocked = isViewUnlocked(item.id);
                const isActive = activeView === item.id;

                return (
                  <button
                    key={`top-nav-${String(item.id)}`}
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        onShowToast(`🔒 "${item.label}" đang khóa — Chờ Giáo viên mở khóa trên màn hình điều khiển!`);
                        return;
                      }
                      setActiveView(item.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-xs ring-2 ring-orange-300'
                        : unlocked
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-slate-100/70 text-slate-400 border border-slate-200/70 opacity-65 cursor-not-allowed'
                    }`}
                    title={
                      !unlocked
                        ? `"${item.label}" đang chờ Giáo viên mở khóa`
                        : item.label
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {!unlocked ? 'lock' : item.icon}
                    </span>
                    <span>{item.label}</span>
                    {!unlocked && (
                      <span className="material-symbols-outlined text-[14px] text-rose-500">
                        lock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GLOBAL REAL-TIME PRACTICE ARENA COUNTDOWN CLOCK BAR WHEN HOẠT ĐỘNG 3 IS UNLOCKED */}
          {isArenaStage3Unlocked && (
            <div className="rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-4 shadow-md border border-purple-400/30 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] animate-pulse">
                      timer
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-200">
                        ⏱️ ĐỒNG HỒ ĐẾM NGƯỢC ĐẤU TRƯỜNG LUYỆN TẬP (HOẠT ĐỘNG 3)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-amber-200">
                        {isStudentArenaReady ? arenaVisual.statusLabel : '⏸️ Chờ em bấm Sẵn sàng luyện tập'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isStudentArenaReady
                        ? 'Đang tính giờ làm bài trực tiếp • Thanh tiến trình tự động đổi màu cảnh báo khi sắp hết giờ'
                        : 'Bấm "🚀 Sẵn sàng luyện tập" trong Hoạt động 3 để bắt đầu tính giờ làm bài!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    className={`px-4 py-1.5 rounded-xl font-mono text-xl sm:text-2xl font-black tracking-wider border ${arenaVisual.timerBadgeClass}`}
                  >
                    {formatCountdownMmSs(arenaRemainingSec)}
                  </div>
                  {!isStudentArenaReady && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView(3);
                        setIsStudentArenaReady(true);
                        onShowToast('🚀 Đã bắt đầu tính giờ Đấu trường Luyện tập!');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      🚀 Sẵn sàng luyện tập
                    </button>
                  )}
                  {activeView !== 3 && (
                    <button
                      type="button"
                      onClick={() => setActiveView(3)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Vào Đấu trường ngay →
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${arenaVisual.progressBarClass}`}
                  style={{ width: `${Math.max(3, arenaVisual.percent)}%` }}
                />
              </div>
            </div>
          )}

          {/* Top Performer Flash Alert */}
          {liveTopPerformerAlert && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-lg animate-bounce border-2 border-yellow-200">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-spin">👑</span>
                <div>
                  <span className="uppercase tracking-wider text-[11px] block text-amber-100">
                    ⚡ TOP PERFORMER MỚI DẪN ĐẦU LỚP {currentStudent.classId}!
                  </span>
                  <span className="text-sm sm:text-base text-white">
                    {liveTopPerformerAlert.name} vừa bứt phá lên vị trí #1 với {liveTopPerformerAlert.xp.toLocaleString()} XP!
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-white text-amber-800 text-xs font-black shadow-xs shrink-0">
                #1 LỚP ✨
              </span>
            </div>
          )}
          {/* PHÒNG LIVE CHÍNH LỚP HỌC (KHÔNG GIAN ẢO ĐỒNG BỘ SLIDE & TOÀN BỘ HOẠT ĐỘNG VỚI GIÁO VIÊN) */}
          <LiveClassroomWaitingRoom
            role="student"
            grade={([6, 7, 8, 9].includes(Number(periodSpec.grade)) ? Number(periodSpec.grade) : 6) as 6 | 7 | 8 | 9}
            period={periodSpec.period}
            classId={liveSession?.activeClassId || currentStudent.classId}
            periodSpec={periodSpec}
            students={students}
            currentStudent={currentStudent}
            liveSession={liveSession}
            externalBoardMode={
              activeView === 'waiting'
                ? 'slide'
                : activeView === 1
                ? 'hd1'
                : activeView === 2
                ? 'hd2'
                : activeView === 3
                ? 'hd3'
                : activeView === 'hd3-practice'
                ? 'hd3-practice'
                : 'hd4'
            }
            onBoardModeChange={(mode) => {
              setActiveView(
                mode === 'slide'
                  ? 'waiting'
                  : mode === 'hd1'
                  ? 1
                  : mode === 'hd2'
                  ? 2
                  : mode === 'hd3'
                  ? 3
                  : mode === 'hd3-practice'
                  ? 'hd3-practice'
                  : 4
              );
            }}
            onUpdateLiveSession={onUpdateLiveSession}
            onAwardXp={onAwardXp}
            onShowToast={onShowToast}
          />

          {activeView !== 'waiting' && !isViewUnlocked(activeView) ? (
            /* LOCKED ITEM NOTICE — STRICT TEACHER LOCK ENFORCEMENT */
            <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">lock_clock</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {`${navItems.find((n) => n.id === activeView)?.label} đang chờ Giáo viên mở khóa`}
                </h2>
                <p className="text-sm text-slate-500 max-w-md mt-1">
                  Thầy/Cô đang điều khiển tiến trình lớp học trực tiếp trên Bảng Phòng Live Chính phía trên.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('waiting')}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                🏫 Xem Slide trên Bảng Phòng Live Chính
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* STAGE 2: KHÁM PHÁ (1 TRANG PHIẾU HỌC TẬP MINIGAME CHUẨN GDPT 2018 - 4.0 ĐIỂM) */}
              {activeView === 2 && (
                <UnifiedDiscoveryWorksheet
                  lessonTitle={periodSpec.lessonTitle}
                  grade={periodSpec.grade}
                  period={periodSpec.period}
                  worksheet={getDefaultWorksheetForLesson(periodSpec.grade, periodSpec.period)}
                  isReadOnly={isStage2Finalized}
                  isFinalized={isStage2Finalized}
                  submitted={Boolean(completedStages[2])}
                  onSubmit={(result) => {
                    markStageCompleted(
                      2,
                      40,
                      `🎵🎉 Đã nộp thành công Phiếu Khám Phá: ${result.totalScore.toFixed(2)}/4.0 điểm (+40 XP)!`
                    );
                  }}
                  onShowToast={onShowToast}
                  onAwardXp={onAwardXp}
                />
              )}

              {/* STAGE 3: LUYỆN TẬP (ARENA 25S, ĐỒNG HỒ ĐẾM NGƯỢC ĐẤU TRƯỜNG & SYNCHRONIZED PRACTICAL ACTIVITY) */}
              {activeView === 3 && (
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col gap-6">
                  {/* Prominent Practice Arena Countdown Clock Banner inside Stage 3 */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-purple-400/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[26px] animate-pulse">
                          timer
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-purple-200 block">
                          ⚡ ĐỒNG HỒ ĐẾM NGƯỢC ĐẤU TRƯỜNG LUYỆN TẬP
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          Thời gian làm bài Đấu trường Luyện tập (Hoạt động 3)
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div
                        className={`px-5 py-2.5 rounded-2xl font-mono text-2xl sm:text-3xl font-black tracking-wider shadow-inner border ${arenaVisual.timerBadgeClass}`}
                      >
                        {formatCountdownMmSs(arenaRemainingSec)}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-200 text-xs font-bold">
                        {arenaVisual.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Color-changing Progress bar of Arena Countdown */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden -mt-3">
                    <div
                      className={`h-full transition-all duration-500 ${arenaVisual.progressBarClass}`}
                      style={{
                        width: `${Math.max(4, arenaVisual.percent)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                        3
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Hoạt động 3: Luyện tập</h2>
                        <p className="text-xs text-slate-500">
                          Đấu trường trắc nghiệm 25s &amp; Hoạt động Thực hành đồng bộ
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                      3.0 điểm
                    </span>
                  </div>

                  {isStage3ArenaFinalized && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-rose-600 text-[22px]">lock</span>
                        <span>
                          <strong>ĐẤU TRƯỜNG TRẮC NGHIỆM ĐÃ ĐƯỢC CHỐT KẾT QUẢ:</strong> Giáo viên đã chốt và đóng làm bài Đấu trường 25s, không thể làm thêm hoặc nộp bài.
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                        ĐÃ ĐÓNG NỘP BÀI
                      </span>
                    </div>
                  )}

                  <QuizArena25sActivity
                    questions={INITIAL_MINIGAME_QUESTIONS.map((q) => ({
                      id: q.id,
                      level: q.status || 'Nhận biết',
                      question: q.question,
                      points: 0.5,
                      options: q.options,
                      explanation:
                        q.options.find((o) => o.isCorrect)?.explanation ||
                        'Đáp án chính xác theo sách giáo khoa.',
                    }))}
                    lessonContext={`Tiết ${periodSpec.period}: ${periodSpec.lessonTitle}`}
                    onReadyStart={() => {
                      if (isStage3ArenaFinalized) {
                        onShowToast('⚠️ Đấu trường trắc nghiệm 25s đã được Giáo viên chốt kết quả!');
                        return;
                      }
                      setIsStudentArenaReady(true);
                    }}
                    onShowToast={onShowToast}
                    onFinish={(earned) => {
                      if (isStage3ArenaFinalized) {
                        onShowToast('⚠️ Đấu trường trắc nghiệm 25s đã được Giáo viên chốt kết quả!');
                        return;
                      }
                      const bonus = Math.max(20, Math.round(earned * 20));
                      markStageCompleted(
                        3,
                        bonus,
                        `🎵🎉 Hoàn thành Đấu trường 25s! Em nhận được +${bonus} XP!`
                      );
                    }}
                  />

                  {/* Synchronized Lock/Unlock Practical Activity inside Stage 3 */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {isStage3PracticeFinalized && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-rose-600 text-[22px]">lock</span>
                          <span>
                            <strong>HOẠT ĐỘNG THỰC HÀNH ĐÃ ĐƯỢC CHỐT:</strong> Đã khóa nộp sản phẩm Google Drive. Em không thể nộp thêm sản phẩm mới.
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                          ĐÃ ĐÓNG NỘP SẢN PHẨM
                        </span>
                      </div>
                    )}

                    {isPracticeStage3Unlocked ? (
                      <GoogleDrivePracticalActivity
                        classId={currentStudent.classId}
                        studentName={currentStudent.name}
                        studentId={currentStudent.id}
                        studentUsername={currentStudent.username || currentStudent.id}
                        grade={periodSpec.grade}
                        period={periodSpec.period}
                        lessonTitle={periodSpec.lessonTitle}
                        folderName={`Thư mục Tiết ${periodSpec.period}`}
                        drivePath={`Google Drive / Lớp ${currentStudent.classId}`}
                        teacherDriveUrl={teacherDriveUrl}
                        existingSubmissions={livePracticalSubmissions}
                        onSubmitProduct={handleSubmitPracticalProduct}
                        onShowToast={onShowToast}
                      />
                    ) : (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              Hoạt động 3 (Tiết Thực hành) đang khóa
                            </h4>
                            <p className="text-xs text-slate-500">
                              Khi Giáo viên mở khóa Thực hành trên phòng Live, khu vực nộp bài thực hành sẽ tự động mở!
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                          🔒 Chờ GV mở khóa
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DEDICATED VIEW: HĐ 3 (TIẾT THỰC HÀNH) ĐỒNG BỘ KHOÁ/MỞ */}
              {activeView === 'hd3-practice' && (
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col gap-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                        <span className="material-symbols-outlined text-[22px]">folder_managed</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Hoạt động 3 (Tiết Thực hành) — Nộp Sản Phẩm Máy Tính
                        </h2>
                        <p className="text-xs text-slate-500">
                          Đã được Giáo viên mở khóa đồng bộ • Nộp bài thực hành trực tiếp lên Cây thư mục lớp {currentStudent.classId}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">lock_open</span>
                      <span>Đang mở khóa</span>
                    </span>
                  </div>

                  {isStage3PracticeFinalized && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-rose-600 text-[22px]">lock</span>
                        <span>
                          <strong>HOẠT ĐỘNG THỰC HÀNH ĐÃ ĐƯỢC CHỐT:</strong> Đã khóa nộp sản phẩm Google Drive. Em không thể nộp thêm sản phẩm mới.
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                        ĐÃ ĐÓNG NỘP SẢN PHẨM
                      </span>
                    </div>
                  )}

                  <GoogleDrivePracticalActivity
                    classId={currentStudent.classId}
                    studentName={currentStudent.name}
                    studentId={currentStudent.id}
                    studentUsername={currentStudent.username || currentStudent.id}
                    grade={periodSpec.grade}
                    period={periodSpec.period}
                    lessonTitle={periodSpec.lessonTitle}
                    folderName={`Thư mục Tiết ${periodSpec.period}`}
                    drivePath={`Google Drive / Lớp ${currentStudent.classId}`}
                    teacherDriveUrl={teacherDriveUrl}
                    existingSubmissions={livePracticalSubmissions}
                    onSubmitProduct={handleSubmitPracticalProduct}
                    onShowToast={onShowToast}
                  />
                </div>
              )}

              {/* STAGE 4: VẬN DỤNG */}
              {activeView === 4 && (
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col gap-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                        4
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Hoạt động 4: Vận dụng</h2>
                        <p className="text-xs text-slate-500">
                          Giải quyết vấn đề thực tiễn &amp; ứng dụng số
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      2.0 điểm
                    </span>
                  </div>

                  {isStage4Finalized && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-semibold flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-rose-600 text-[22px]">lock</span>
                        <span>
                          <strong>HOẠT ĐỘNG 4 ĐÃ ĐƯỢC GIÁO VIÊN CHỐT KẾT QUẢ:</strong> Đã khóa toàn bộ bài làm Vận dụng. Em chỉ xem lại bài làm, không thể nộp thêm hoặc sửa bài.
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                        ĐÃ ĐÓNG NỘP BÀI
                      </span>
                    </div>
                  )}

                  <ApplicationThreeTasksActivity
                    title="Vận dụng kiến thức vào đời sống"
                    isReadOnly={isStage4Finalized}
                    deepAnalysis={{
                      title: '1. Phân tích thực tế',
                      prompt:
                        'Em hãy nêu một ví dụ về dữ liệu số trong đời sống hàng ngày của gia đình em.',
                    }}
                    practicalTask={{
                      title: '2. Nhiệm vụ thực hành',
                      prompt:
                        'Thiết kế một bảng danh mục thông tin để ghi chép các công việc trong tuần.',
                    }}
                    extendedTask={{
                      title: '3. Mở rộng sáng tạo',
                      prompt:
                        'Đề xuất cách bảo vệ thông tin cá nhân khi sử dụng mạng xã hội.',
                    }}
                    answers={appAnswers}
                    onAnswerChange={(field, val) => {
                      if (isStage4Finalized) return;
                      setAppAnswers((prev) => ({ ...prev, [field]: val }));
                    }}
                    onSubmit={() => {
                      if (isStage4Finalized) {
                        onShowToast('⚠️ Hoạt động 4 đã được Giáo viên chốt kết quả và đóng nộp bài!');
                        return;
                      }
                      markStageCompleted(
                        4,
                        50,
                        '🎵🎉 Đã nộp bài Vận dụng thành công! (+50 XP)'
                      );
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Peer Review Modal */}
      <PeerReviewModal
        isOpen={showPeerReviewModal}
        onClose={() => setShowPeerReviewModal(false)}
        currentStudent={currentStudent}
        onShowToast={onShowToast}
      />

      {/* Live Leaderboard Drawer Modal for Students */}
      {showLiveLeaderboardDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col gap-5 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                  🏆
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Bảng Xếp Hạng Trực Tiếp (Lớp {currentStudent.classId})
                  </h3>
                  <p className="text-xs text-slate-500">Thành tích thời gian thực trong phiên học Live</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveLeaderboardDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 divide-y divide-slate-100">
              {rankedLiveStudents.map((st, idx) => {
                const isMe = st.id === currentStudent.id;
                return (
                  <div
                    key={st.id}
                    className={`pt-2.5 pb-1 flex items-center justify-between gap-3 ${
                      idx === 0
                        ? 'p-3 rounded-2xl bg-gradient-to-r from-amber-100/90 to-yellow-50 border-2 border-amber-400 shadow-sm animate-pulse'
                        : isMe
                        ? 'p-3 rounded-2xl bg-sky-50 border border-sky-200 font-bold'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? 'bg-amber-500 text-white shadow-xs'
                            : idx === 1
                            ? 'bg-sky-200 text-sky-900'
                            : idx === 2
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">{st.name}</span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[9px] font-black uppercase">
                              Bạn
                            </span>
                          )}
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                              Top 1 ✨
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {st.partnerName && st.partnerName !== 'Học cá nhân (1 mình)'
                            ? `Cùng máy: ${st.partnerName}`
                            : 'Cá nhân'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-sky-700">{st.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
