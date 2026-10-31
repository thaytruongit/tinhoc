import React, { useState, useEffect, useRef } from 'react';
import {
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
  type StudentWorkDraft,
  type TaggedLessonSubmission,
  INITIAL_MINIGAME_QUESTIONS,
} from '../data/mockCurriculumData';
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
import { getDefaultLectureSlides } from './LectureSlideManagerModal';
import {
  playStageBroadcastSound,
  triggerSynchronizedCelebration,
} from '../utils/soundEffects';
import {
  playPushNotificationChime,
  requestPushNotificationPermission,
  sendNativePushNotification,
  isPushNotificationGranted,
} from '../utils/pushNotifications';
import {
  isStudentLiveViewUnlocked,
  computeArenaRemainingSeconds,
  formatCountdownMmSs,
  isFileStorageSlideUrl,
  getArenaCountdownVisualState,
  generateFallbackSlideSvgDataUrl,
} from '../utils/slideAndArenaController';
import { VirtualWhiteboardPanel } from './VirtualWhiteboardPanel';

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
  onUpdateDraft?: (updater: (prev: StudentWorkDraft) => StudentWorkDraft) => void;
  onSaveSubmission?: (sub: Partial<TaggedLessonSubmission>) => void;
}

type StudentLiveViewId = 'slide' | 1 | 2 | 3 | 'hd3-practice' | 4;

export const StudentLiveRoom: React.FC<StudentLiveRoomProps> = ({
  currentStudent,
  students,
  periodSpec,
  liveSession,
  unlockedStages,
  companionMode = 'paired',
  onExitLiveRoom,
  onAwardXp,
  onShowToast,
}) => {
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
    if (teacherActiveView === 'slide') return 'slide';
    if (teacherActiveView === 'hd3-practice') return 'hd3-practice';
    if (teacherActiveView === 'hd1') return 1;
    if (teacherActiveView === 'hd2') return 2;
    if (teacherActiveView === 'hd3') return 3;
    if (teacherActiveView === 'hd4') return 4;
    if (effectiveUnlockedStages[teacherCurrentStage]) return teacherCurrentStage;
    const firstUnlocked = ([1, 2, 3, 4] as const).find((s) => Boolean(effectiveUnlockedStages[s]));
    return firstUnlocked || 1;
  };

  const [activeView, setActiveView] = useState<StudentLiveViewId>(resolveInitialView);
  const [stage2SubTab, setStage2SubTab] = useState<'drag' | 'fill' | 'match' | 'short'>('drag');
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({});
  const [isStudentArenaReady, setIsStudentArenaReady] = useState<boolean>(false);

  useEffect(() => {
    setIsStudentArenaReady(false);
  }, [lessonKey]);

  // Slide state synchronized with Teacher
  const uploadedDeck = liveSession?.lectureSlidesByLesson?.[lessonKey];
  const slidesList =
    uploadedDeck?.slides && uploadedDeck.slides.length > 0
      ? uploadedDeck.slides
      : getDefaultLectureSlides(periodSpec);
  const deckFileName =
    uploadedDeck?.fileName ||
    `Bai_giang_Khoi_${periodSpec.grade}_Tiet_${periodSpec.period}.pptx`;
  const deckFileType = uploadedDeck?.fileType || 'pptx';
  const deckPdfDataUrl = uploadedDeck?.pdfDataUrl;
  const teacherSlideIndex = liveSession?.activeSlideIndexByLesson?.[lessonKey] || 0;
  const [studentSlideIndex, setStudentSlideIndex] = useState<number>(teacherSlideIndex);

  useEffect(() => {
    setStudentSlideIndex(teacherSlideIndex);
  }, [teacherSlideIndex]);

  // Direct BroadcastChannel listener for instant slide & lock synchronization from TeacherPortal / TeacherLivePresenterRoom
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('cloudplay_realtime_sync');
    ch.onmessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'SLIDE_CHANGED') {
        if (!data.lessonKey || data.lessonKey === lessonKey) {
          if (typeof data.slideIndex === 'number') {
            setStudentSlideIndex(data.slideIndex);
          }
          if (data.activeLiveView === 'slide') {
            setActiveView('slide');
          }
        }
      } else if (data.type === 'SLIDE_ENDED') {
        if (!data.lessonKey || data.lessonKey === lessonKey) {
          setActiveView(1);
          onShowToast(
            '⏹️ Giáo viên đã kết thúc trình chiếu Slide bài giảng — Các hoạt động đang khóa, chờ Giáo viên mở khóa hoạt động tiếp theo!'
          );
        }
      } else if (data.type === 'LIVE_SESSION_UPDATED' && data.session) {
        const nextIdx = data.session.activeSlideIndexByLesson?.[lessonKey];
        if (typeof nextIdx === 'number') {
          setStudentSlideIndex(nextIdx);
        }
        if (data.session.activeLiveView === 'slide') {
          setActiveView('slide');
        } else if (data.session.activeLiveView === 'waiting') {
          setActiveView(1);
        }
      }
    };
    return () => {
      ch.close();
    };
  }, [lessonKey, onShowToast]);

  // Synchronized lock states for Slide Deck and Stage 3 Practical Activity
  const isSlideDeckUnlocked =
    teacherActiveView === 'waiting'
      ? false
      : Boolean(liveSession?.unlockedSlideDeckByLesson?.[lessonKey]);
  const isPracticeStage3Unlocked = Boolean(
    liveSession?.unlockedPracticeStage3ByLesson?.[lessonKey]
  );
  const whiteboardState = liveSession?.whiteboardByLesson?.[lessonKey];
  const isWhiteboardOpen = Boolean(whiteboardState?.isOpen || teacherActiveView === 'whiteboard');

  // Synchronized Explanation Video state accompanying Slide Image
  const slideVideoState = liveSession?.slideVideoStateByLesson?.[lessonKey];
  const isSlideVideoPlaying = Boolean(slideVideoState?.isPlaying && slideVideoState?.videoUrl);

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
        onShowToast('🖥️ Đã bật chế độ Phóng to toàn màn hình (Fullscreen) để xem rõ bài giảng!');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        onShowToast('🖥️ Đã thoát chế độ Phóng to toàn màn hình.');
      }
    } catch {
      setIsFullscreen((prev) => !prev);
      onShowToast(
        !isFullscreen
          ? '🖥️ Đã tối ưu không gian hiển thị phóng to Slide Bài Giảng!'
          : '🖥️ Đã thu nhỏ khung hiển thị về mặc định.'
      );
    }
  };

  // Force activeView to 'slide' whenever Teacher broadcasts Slide Image, or close 'slide' when Teacher ends Slide
  useEffect(() => {
    if (teacherActiveView === 'slide' && activeView !== 'slide') {
      setActiveView('slide');
    } else if (teacherActiveView !== 'slide' && !isSlideDeckUnlocked && activeView === 'slide') {
      const firstOpen = ([1, 2, 3, 4] as const).find((s) => Boolean(effectiveUnlockedStages[s]));
      setActiveView(firstOpen || 1);
    }
  }, [teacherActiveView, isSlideDeckUnlocked, activeView, effectiveUnlockedStages]);

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

  // Real-time Push Notification alert state for Student Live Room
  const [activePushAlert, setActivePushAlert] = useState<{
    id: string;
    title: string;
    body: string;
    stage?: 'slide' | 'whiteboard' | 'hd3-practice' | 1 | 2 | 3 | 4;
    stageLabel?: string;
    timestampIso: string;
  } | null>(null);
  const [pushPermissionGranted, setPushPermissionGranted] = useState<boolean>(isPushNotificationGranted());
  const lastPushNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const pushData = liveSession?.lastPushNotification;
    if (pushData && pushData.id !== lastPushNotificationIdRef.current) {
      if (pushData.classId && pushData.classId !== currentStudent.classId) {
        return;
      }
      lastPushNotificationIdRef.current = pushData.id;
      setActivePushAlert(pushData);

      // Play 3-note chime sound
      playPushNotificationChime();

      // Trigger native browser Push Notification
      sendNativePushNotification(pushData.title, {
        body: pushData.body,
        tag: pushData.id,
        icon: '/favicon.ico',
      });

      // Auto dismiss banner after 14 seconds
      const timer = setTimeout(() => {
        setActivePushAlert(null);
      }, 14000);
      return () => clearTimeout(timer);
    }
  }, [liveSession?.lastPushNotification, currentStudent.classId]);

  const handleRequestPushPermission = async () => {
    const perm = await requestPushNotificationPermission();
    const ok = perm === 'granted';
    setPushPermissionGranted(ok);
    if (ok) {
      onShowToast('🔔 Đã bật Push Notification thành công! Mọi thông báo từ Giáo viên sẽ hiển thị tức thì.');
      playPushNotificationChime();
    } else {
      onShowToast('⚠️ Chưa cấp quyền Push Notification trên trình duyệt. Hãy cho phép trên thanh địa chỉ!');
    }
  };

  // Track last teacher broadcast view/stage so whenever Teacher switches activity, Student automatically follows
  const lastTeacherStageRef = useRef<number>(teacherCurrentStage);
  const lastTeacherViewRef = useRef<string | undefined>(teacherActiveView);

  useEffect(() => {
    if (teacherActiveView && teacherActiveView !== lastTeacherViewRef.current) {
      lastTeacherViewRef.current = teacherActiveView;
      if (teacherActiveView === 'slide') {
        setActiveView('slide');
        playStageBroadcastSound();
        onShowToast(
          '📢 Giáo viên vừa phát trực tiếp Slide Bài Giảng — Màn hình của em đã tự động chuyển sang Slide Bài Giảng!'
        );
        return;
      }
      if (teacherActiveView === 'waiting') {
        setActiveView(1);
        playStageBroadcastSound();
        onShowToast(
          '⏹️ Giáo viên đã kết thúc trình chiếu Slide Bài Giảng — Các hoạt động vẫn khóa nghiêm ngặt, chờ Giáo viên mở khóa hoạt động tiếp theo!'
        );
        return;
      }
      if (teacherActiveView === 'hd3-practice') {
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
      const mapped = stageMap[teacherActiveView];
      if (mapped) {
        lastTeacherStageRef.current = mapped;
        setActiveView(mapped);
        playStageBroadcastSound();
        onShowToast(
          `📢 Giáo viên vừa phát trực tiếp Hoạt động ${mapped} — Màn hình của em đã tự động chuyển sang Hoạt động ${mapped}!`
        );
      }
    }
  }, [teacherActiveView]);

  useEffect(() => {
    const incomingStage = liveSession?.activeStage;
    if (incomingStage && incomingStage !== lastTeacherStageRef.current) {
      lastTeacherStageRef.current = incomingStage;
      setActiveView(incomingStage);
      playStageBroadcastSound();
      onShowToast(
        `📢 Giáo viên vừa phát trực tiếp Hoạt động ${incomingStage} — Màn hình của em đã tự động chuyển sang Hoạt động ${incomingStage}!`
      );
    }
  }, [liveSession?.activeStage]);

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
    return isStudentLiveViewUnlocked({
      viewId,
      teacherActiveView,
      isSlideDeckUnlocked,
      isPracticeStage3Unlocked,
      unlockedStages: effectiveUnlockedStages,
      teacherCurrentStage,
    });
  };

  const navItems: {
    id: StudentLiveViewId;
    label: string;
    icon: string;
    points: string;
  }[] = [
    {
      id: 'slide',
      label: 'Slide Bài Giảng',
      icon: 'slideshow',
      points: 'PDF/PPTX',
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

  const markStageCompleted = (stageKey: string | number, xpBonus: number, msg: string) => {
    setCompletedStages((prev) => ({ ...prev, [String(stageKey)]: true }));
    triggerSynchronizedCelebration('xp');
    onAwardXp(xpBonus);
    onShowToast(msg);
  };

  const safeSlideIdx = Math.min(studentSlideIndex, Math.max(0, slidesList.length - 1));
  const activeSlide = slidesList[safeSlideIdx];
  const activeSlideImageSrc =
    activeSlide?.imageUrl ||
    generateFallbackSlideSvgDataUrl({
      grade: periodSpec.grade,
      period: periodSpec.period,
      slideIndex: safeSlideIdx,
      totalSlides: slidesList.length,
      title: activeSlide?.title || periodSpec.lessonTitle,
      subtitle: activeSlide?.subtitle,
      bulletPoints: activeSlide?.bulletPoints || [],
      highlightNote: activeSlide?.highlightNote,
    });
  const isArenaStage3Unlocked = isViewUnlocked(3);

  return (
    <div className="flex w-full min-h-screen bg-white text-slate-900">
      {/* 1. LEFT VERTICAL SIDEBAR - BRIGHT WHITE THEME MATCHING IMAGE 1 */}
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

          {/* Activities + Slide + Practice Menu */}
          <div className="flex flex-col gap-1.5">
            <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tiến trình bài học Live
            </span>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const unlocked = isViewUnlocked(item.id);
                const isActive = activeView === item.id;
                const isTeacherBroadcastingThis =
                  (item.id === 'slide' && teacherActiveView === 'slide') ||
                  (item.id === 'hd3-practice' && teacherActiveView === 'hd3-practice') ||
                  (typeof item.id === 'number' &&
                    teacherCurrentStage === item.id &&
                    teacherActiveView !== 'slide' &&
                    teacherActiveView !== 'hd3-practice');
                const isDone = Boolean(completedStages[String(item.id)]);

                return (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        onShowToast(
                          teacherActiveView === 'slide'
                            ? `🔒 Giáo viên đang trình chiếu Slide Bài Giảng — Các hoạt động khác tạm khóa để em tập trung xem Slide!`
                            : `🔒 "${item.label}" đang khóa — Chờ Giáo viên mở khóa trên màn hình điều khiển!`
                        );
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
                      {!unlocked ? (
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
              Màn hình tự động chuyển khi Giáo viên phát Slide hoặc hoạt động mới. Em có thể bấm vào các mục đã mở khóa để hoàn thiện bài!
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

      {/* 2. MAIN LIVE ROOM CONTENT AREA - BRIGHT WHITE STUDENT-FRIENDLY */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/40">
        {/* Top Header of Live Room */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-black flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>
                ĐANG HỌC LIVE (
                {teacherActiveView === 'slide'
                  ? 'Slide Bài Giảng'
                  : teacherActiveView === 'hd3-practice'
                  ? 'HĐ 3 Thực Hành'
                  : `HĐ ${teacherCurrentStage}`}
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
              onClick={handleRequestPushPermission}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                pushPermissionGranted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
              }`}
              title={pushPermissionGranted ? 'Push Notification đang hoạt động' : 'Bật Push Notification để nhận thông báo tức thì từ GV'}
            >
              <span>🔔</span>
              <span className="hidden sm:inline">
                {pushPermissionGranted ? 'Push: Đã bật' : 'Bật Push Thầy Cô'}
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
                  : 'Phóng to toàn màn hình (Fullscreen) tối ưu hiển thị Slide'
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
          {/* TOP HORIZONTAL NAVIGATION BAR: SLIDE BÀI GIẢNG & HOẠT ĐỘNG 1, 2, 3, 3-THỰC HÀNH, 4 (WITH LOCK ICONS WHEN SLIDE IS BROADCAST) */}
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {navItems.map((item) => {
                const unlocked = isViewUnlocked(item.id);
                const isActive = activeView === item.id;
                const isLockedBySlideBroadcast =
                  teacherActiveView === 'slide' && item.id !== 'slide';

                return (
                  <button
                    key={`top-nav-${String(item.id)}`}
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        onShowToast(
                          teacherActiveView === 'slide'
                            ? `🔒 Giáo viên đang trình chiếu Slide Bài Giảng — Các hoạt động khác tạm khóa để em tập trung xem Slide!`
                            : `🔒 "${item.label}" đang khóa — Chờ Giáo viên mở khóa trên màn hình điều khiển!`
                        );
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
                        ? isLockedBySlideBroadcast
                          ? `Đang khóa "${item.label}" vì Giáo viên đang chiếu Slide Bài Giảng`
                          : `"${item.label}" đang chờ Giáo viên mở khóa`
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

            {teacherActiveView === 'slide' && (
              <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-black flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>Chế độ Chiếu Slide: Đã khóa HĐ 1, 2, 3, 3-TH, 4</span>
              </span>
            )}
          </div>

          {/* SYNCHRONIZED REAL-TIME VIRTUAL WHITEBOARD FROM TEACHER */}
          {isWhiteboardOpen && (
            <VirtualWhiteboardPanel
              lessonKey={lessonKey}
              lessonTitle={periodSpec.lessonTitle}
              grade={periodSpec.grade}
              period={periodSpec.period}
              classId={currentStudent.classId}
              whiteboardState={whiteboardState}
              slideBackgroundUrl={activeSlideImageSrc}
              readOnly={true}
              onShowToast={onShowToast}
            />
          )}

          {/* GLOBAL REAL-TIME PRACTICE ARENA COUNTDOWN CLOCK BAR WHEN HOẠT ĐỘNG 3 IS UNLOCKED */}
          {isArenaStage3Unlocked && teacherActiveView !== 'slide' && (
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
          {/* Real-time Push Notification Card from Teacher */}
          {activePushAlert && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-sm shadow-xl animate-pulse border-2 border-yellow-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
                  🔔
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black uppercase tracking-wider">
                      PUSH NOTIFICATION MỚI TỪ THẦY CÔ
                    </span>
                    <span className="text-xs text-amber-100 font-normal">
                      {activePushAlert.stageLabel}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {activePushAlert.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-50 font-normal mt-0.5">
                    {activePushAlert.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    if (activePushAlert.stage && activePushAlert.stage !== 'whiteboard') {
                      setActiveView(activePushAlert.stage);
                      onShowToast(`🚀 Đã chuyển sang ${activePushAlert.stageLabel}!`);
                    } else if (activePushAlert.stage === 'whiteboard') {
                      onShowToast('🎨 Đang hiển thị Bảng trắng ảo từ Giáo viên!');
                    }
                    setActivePushAlert(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-orange-800 hover:bg-orange-50 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Tham gia ngay</span>
                  <span className="text-sm">🚀</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePushAlert(null)}
                  className="p-2 rounded-xl hover:bg-white/20 text-white text-xs cursor-pointer"
                  title="Đóng thông báo"
                >
                  ✕
                </button>
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
          {!isViewUnlocked(activeView) ? (
            /* LOCKED ITEM NOTICE — STRICT TEACHER LOCK ENFORCEMENT */
            <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">lock_clock</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {teacherActiveView === 'waiting'
                    ? '⏹️ Đã kết thúc Slide bài giảng — Các hoạt động đang khóa nghiêm ngặt'
                    : `${navItems.find((n) => n.id === activeView)?.label} đang chờ Giáo viên mở khóa`}
                </h2>
                <p className="text-sm text-slate-500 max-w-md mt-1">
                  {teacherActiveView === 'waiting'
                    ? 'Giáo viên đã đóng Slide bài giảng. Toàn bộ các hoạt động 1, 2, 3, 4 hiện đang khóa nghiêm ngặt — khi Giáo viên bấm mở khóa hoạt động nào thì màn hình của em mới được mở hoạt động đó!'
                    : 'Thầy/Cô đang điều khiển tiến trình lớp học trực tiếp. Khi thầy/cô bấm mở khóa mục này, màn hình của em sẽ tự động mở khóa và hiển thị ngay!'}
                </p>
              </div>
              {teacherActiveView !== 'waiting' && (
                <button
                  type="button"
                  onClick={() => setActiveView(resolveInitialView())}
                  className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Quay về mục Giáo viên đang phát
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* VIEW 0: SLIDE BÀI GIẢNG (PDF/PPTX) ĐỒNG BỘ — CHỈ HIỂN THỊ SLIDE ẢNH (& VIDEO GIẢI THÍCH NẾU BẬT) KHI GV PHÁT */}
              {activeView === 'slide' && (
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col gap-5">
                  {teacherActiveView === 'slide' && (
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        <span>
                          📢 Giáo viên đang phát trực tiếp Slide Bài Giảng — Các hoạt động khác đã tạm khóa để chỉ hiển thị Slide ảnh đồng bộ!
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black">
                        Slide {safeSlideIdx + 1}/{slidesList.length}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">slideshow</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-bold text-slate-900">
                            Slide Bài Giảng Đồng Bộ: {deckFileName}
                          </h2>
                          {isFileStorageSlideUrl(activeSlide?.imageUrl) && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              ☁️ File Storage 1GB
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Đồng bộ trực tiếp theo trang trình chiếu của Giáo viên ({deckFileType.toUpperCase()})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">sync</span>
                        <span>Đồng bộ trực tiếp với GV</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleFullscreen}
                        className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Phóng to toàn màn hình để xem rõ Slide Bài Giảng"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                        <span>{isFullscreen ? 'Thu nhỏ Slide' : 'Phóng to Slide'}</span>
                      </button>
                      {studentSlideIndex !== teacherSlideIndex && (
                        <button
                          type="button"
                          onClick={() => setStudentSlideIndex(teacherSlideIndex)}
                          className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                        >
                          Đồng bộ về Slide {teacherSlideIndex + 1} của GV
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Synchronized Slide Image + Optional Synchronized Explanation Video */}
                  <div
                    className={`grid grid-cols-1 ${
                      isSlideVideoPlaying ? 'lg:grid-cols-12' : ''
                    } gap-4 items-start`}
                  >
                    <div className={isSlideVideoPlaying ? 'lg:col-span-7' : 'w-full'}>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-black uppercase tracking-wider">
                            Khối {periodSpec.grade} • Tiết {periodSpec.period} • Ảnh Slide{' '}
                            {safeSlideIdx + 1}/{slidesList.length}
                          </span>
                          <span className="text-emerald-300 font-bold">
                            {activeSlide?.title || periodSpec.lessonTitle}
                          </span>
                        </div>
                        <div className="w-full rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl bg-slate-950 flex items-center justify-center">
                          <img
                            src={activeSlideImageSrc}
                            alt={`Slide ${safeSlideIdx + 1}: ${
                              activeSlide?.title || periodSpec.lessonTitle
                            }`}
                            className={`w-full object-contain ${
                              isFullscreen ? 'max-h-[75vh]' : 'max-h-[540px]'
                            }`}
                          />
                        </div>
                        {teacherActiveView !== 'slide' && (
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <span className="text-xs text-slate-600 font-medium">
                              💡{' '}
                              {activeSlide?.highlightNote ||
                                'Theo dõi bài giảng đồng bộ của Giáo viên trên lớp'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={safeSlideIdx === 0}
                                onClick={() =>
                                  setStudentSlideIndex(Math.max(0, safeSlideIdx - 1))
                                }
                                className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  arrow_back
                                </span>
                                <span>Trang trước</span>
                              </button>
                              <button
                                type="button"
                                disabled={safeSlideIdx >= slidesList.length - 1}
                                onClick={() =>
                                  setStudentSlideIndex(
                                    Math.min(slidesList.length - 1, safeSlideIdx + 1)
                                  )
                                }
                                className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                              >
                                <span>Trang tiếp</span>
                                <span className="material-symbols-outlined text-[16px]">
                                  arrow_forward
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Synchronized Explanation Video Player (when Teacher activates video alongside slide) */}
                    {isSlideVideoPlaying && slideVideoState && (
                      <div className="lg:col-span-5 rounded-3xl bg-slate-950 text-white p-4 border-2 border-indigo-500/40 shadow-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                          <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span>🎬 VIDEO GIẢI THÍCH KIẾN THỨC TỪ GIÁO VIÊN</span>
                          </span>
                        </div>
                        <video
                          key={slideVideoState.videoUrl}
                          src={slideVideoState.videoUrl}
                          controls
                          autoPlay
                          className="w-full rounded-2xl bg-black aspect-video object-contain"
                        />
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                          <strong className="text-white block">
                            {slideVideoState.videoTitle ||
                              `Video giải thích Slide #${safeSlideIdx + 1}`}
                          </strong>
                          <span>
                            Quan sát video giải thích đi kèm Slide ảnh bài giảng của Thầy/Cô.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 1: KHỞI ĐỘNG */}
              {activeView === 1 && (
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                        1
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Hoạt động 1: Khởi động</h2>
                        <p className="text-xs text-slate-500">
                          Tình huống dẫn nhập &amp; khám phá bài học mới
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      1.0 điểm
                    </span>
                  </div>

                  <WarmupEssayActivity
                    title="Tình huống mở đầu bài học"
                    scenario={`Trong bài học "${periodSpec.lessonTitle}", em hãy quan sát tình huống thực tế và thảo luận câu trả lời.`}
                    question={
                      periodSpec.yccd || 'Nêu những hiểu biết ban đầu của em về chủ đề này.'
                    }
                    sampleAnswer="Gợi ý: Dữ liệu là các con số, hình ảnh, văn bản; thông tin là ý nghĩa rút ra từ dữ liệu."
                    points={1.0}
                    studentAnswer={warmupAnswer}
                    onAnswerChange={(val) => setWarmupAnswer(val)}
                    onSubmitAnswer={() => {
                      markStageCompleted(
                        1,
                        30,
                        '🎵✓ Đã hoàn thành Hoạt động 1: Khởi động (+30 XP)!'
                      );
                    }}
                  />
                </div>
              )}

              {/* STAGE 2: KHÁM PHÁ (WORKSHEET) */}
              {activeView === 2 && (
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black">
                        2
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Hoạt động 2: Khám phá</h2>
                        <p className="text-xs text-slate-500">
                          Phiếu học tập tương tác chuẩn GDPT 2018 (4.0 điểm)
                        </p>
                      </div>
                    </div>

                    {/* Sub-tabs for Stage 2 */}
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100">
                      {[
                        { id: 'drag', label: '1. Kéo thả' },
                        { id: 'fill', label: '2. Điền khuyết' },
                        { id: 'match', label: '3. Nối cột' },
                        { id: 'short', label: '4. Trả lời ngắn' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStage2SubTab(st.id as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            stage2SubTab === st.id
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {stage2SubTab === 'drag' && (
                    <DragDropActivity
                      title="Kéo thả thuật ngữ & phân loại"
                      instruction="Kéo các từ ngữ vào đúng ô phân loại phù hợp."
                      wordBank={['Thông tin', 'Dữ liệu', 'Vật mang tin', 'Xử lý thông tin']}
                      slots={dragSlots}
                      onSlotChange={(s, val) =>
                        setDragSlots((prev) => ({ ...prev, [s]: val }))
                      }
                    />
                  )}

                  {stage2SubTab === 'fill' && (
                    <FillBlankActivity
                      title="Điền từ thích hợp vào chỗ trống"
                      answers={fillBlankAnswers}
                      onChange={(k, val) =>
                        setFillBlankAnswers((prev) => ({ ...prev, [k]: val }))
                      }
                    />
                  )}

                  {stage2SubTab === 'match' && (
                    <MatchingActivity
                      title="Nối cột Khái niệm với Diễn giải tương ứng"
                      connections={matchingConnections}
                      onConnect={(a: string, b: string) =>
                        setMatchingConnections((prev) => ({ ...prev, [a]: b }))
                      }
                      onDisconnect={(a: string) =>
                        setMatchingConnections((prev) => {
                          const copy = { ...prev };
                          delete copy[a];
                          return copy;
                        })
                      }
                    />
                  )}

                  {stage2SubTab === 'short' && (
                    <ShortAnswerActivity
                      answers={shortAnswers}
                      onChange={(k, val) =>
                        setShortAnswers((prev) => ({ ...prev, [k]: val }))
                      }
                    />
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-xs text-slate-500">
                      💡 Em có thể chuyển qua lại giữa 4 phần hoặc quay lại Hoạt động 1 bất cứ lúc nào.
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        markStageCompleted(
                          2,
                          40,
                          '🎵🎉 Đã nộp Phiếu học tập Hoạt động 2: Khám phá (+40 XP)!'
                        )
                      }
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Hoàn thành &amp; Nộp Phiếu Khám Phá (+40 XP)</span>
                    </button>
                  </div>
                </div>
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
                    onReadyStart={() => setIsStudentArenaReady(true)}
                    onShowToast={onShowToast}
                    onFinish={(earned) => {
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
                        existingSubmissions={[]}
                        onSubmitProduct={() =>
                          markStageCompleted(
                            'hd3-practice',
                            50,
                            '🎵☁️ Đã nộp sản phẩm thực hành lên Google Drive thành công (+50 XP)!'
                          )
                        }
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
                    existingSubmissions={[]}
                    onSubmitProduct={() =>
                      markStageCompleted(
                        'hd3-practice',
                        50,
                        '🎵☁️ Đã nộp sản phẩm thực hành lên Google Drive thành công (+50 XP)!'
                      )
                    }
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

                  <ApplicationThreeTasksActivity
                    title="Vận dụng kiến thức vào đời sống"
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
                    onAnswerChange={(field, val) =>
                      setAppAnswers((prev) => ({ ...prev, [field]: val }))
                    }
                    onSubmit={() => {
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
