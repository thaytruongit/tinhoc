import React, { useEffect, useState } from 'react';
import {
  INITIAL_DRIVE_FOLDERS,
  INITIAL_MINIGAME_QUESTIONS,
  INITIAL_PRACTICAL_SUBMISSIONS,
  INITIAL_STUDENTS,
  NOTEBOOK_GRADE_SOURCES,
  PDF_TIET_1_STAGE2,
  buildLessonBlueprintFromPeriod,
  getDefaultWorksheetForLesson,
  getPeriodsForGrade,
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type PracticalProductSubmission,
  type StudentRosterItem,
  type StudentWorkDraft,
  type TaggedLessonSubmission,
  INITIAL_TAGGED_SUBMISSIONS,
} from '../data/mockCurriculumData';
import {
  type ClassificationCard,
} from '../utils/pedagogyEngine';
import {
  submitWordCloudToCloud,
  submitWorksheetToCloud,
} from '../services/firebaseClient';
import {
  DragDropActivity,
  FillBlankActivity,
  MatchingActivity,
  ShortAnswerActivity,
  QuizArena25sActivity,
  GoogleDrivePracticalActivity,
  WarmupEssayActivity,
  ApplicationThreeTasksActivity,
} from './InteractiveActivities';
import { evaluateAnswerBySuggestedPercentage } from '../utils/essayPercentageGrader';
import { StudentNotificationBannerModal } from './StudentNotificationBannerModal';
import { StudentWorksheetScanner, type ExtractedWorksheetData } from './StudentWorksheetScanner';
import { DataBoundary } from './DataBoundary';
import { PeerReviewModal } from './PeerReviewModal';
import confetti from 'canvas-confetti';
import { StudentCompanionSelector, type CompanionSelectionMode } from './StudentCompanionSelector';
import { StudentLiveRoom } from './StudentLiveRoom';
import { StudentMetricsDashboard } from './StudentMetricsDashboard';
import { StudentActivityFeed } from './StudentActivityFeed';
import { BadgeLibraryPanel } from './BadgeLibraryPanel';
import { ClassLeaderboardPanel } from './ClassLeaderboardPanel';

export type StudentView = 'trang-chu' | 'tro-ly-ai-cu-vang' | 'huy-hieu' | 'bang-xep-hang' | 'nhat-ky-hoat-dong';

interface StudentPortalProps {
  currentStudent: StudentRosterItem;
  students?: StudentRosterItem[];
  onSelectStudentAccount?: (student: StudentRosterItem) => void;
  activeView: StudentView;
  onChangeView: (view: StudentView) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAwardXp: (deltaXp: number) => void;
  onShowToast: (msg: string) => void;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onSwitchToTeacherPortal?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  students = INITIAL_STUDENTS,
  onSelectStudentAccount,
  activeView,
  onChangeView,
  onLogout,
  darkMode,
  onToggleDarkMode,
  onAwardXp,
  onShowToast,
  liveSession,
  onUpdateLiveSession,
}) => {
  // Strictly authorize student roadmap based on student's class (e.g., 6A10 -> Grade 6 only)
  const parsedClassGrade = Number(currentStudent.classId?.charAt(0));
  const selectedGrade: 6 | 7 | 8 | 9 =
    parsedClassGrade === 6 ||
    parsedClassGrade === 7 ||
    parsedClassGrade === 8 ||
    parsedClassGrade === 9
      ? (parsedClassGrade as 6 | 7 | 8 | 9)
      : currentStudent.grade === 6 ||
        currentStudent.grade === 7 ||
        currentStudent.grade === 8 ||
        currentStudent.grade === 9
      ? currentStudent.grade
      : 6;

  // null = showing the 29-period roadmap grid; number (1..29) = opened that period's Lesson Learning Roadmap page
  const [openedPeriodNumber, setOpenedPeriodNumber] = useState<number | null>(null);
  // Active stage rendered directly below the serpentine roadmap on the Lesson Learning Roadmap page
  const [activeInlineStage, setActiveInlineStage] = useState<1 | 2 | 3 | 4>(1);
  const [examFilter, setExamFilter] = useState<'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2'>('ALL');
  const [lessonDisplayMode, setLessonDisplayMode] = useState<'grid' | 'list'>('grid');

  // Chế độ tập trung (Focus Mode): Cho phép ẩn các bảng điều khiển phụ, thanh bên và các khối thông tin không cần thiết để học sinh tập trung tối đa vào nội dung câu hỏi bài tập
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cloudplay_student_focus_mode');
      if (saved !== null) return saved === 'true';
    } catch {}
    return false;
  });

  const handleToggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cloudplay_student_focus_mode', String(next));
      } catch {}
      onShowToast(
        next
          ? '🎯 Đã BẬT Chế độ tập trung: Đã ẩn các bảng điều khiển phụ để em tập trung 100% vào nội dung câu hỏi!'
          : '👁️ Đã TẮT Chế độ tập trung: Hiển thị lại toàn bộ bảng điều khiển và thông tin lộ trình.'
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
        try {
          localStorage.setItem('cloudplay_student_focus_mode', 'false');
        } catch {}
        onShowToast('👁️ Đã thoát Chế độ tập trung.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, onShowToast]);
  const [stage2SubTab, setStage2SubTab] = useState<'drag' | 'fill' | 'match' | 'short'>('drag');

  // 3 Tabs for Student Homepage:
  // Tab 1: 'hoc-live' (only displays the single active live session period)
  // Tab 2: 'toan-bo-tiet-hoc' (displays all 29 periods with self-study lock restriction)
  // Tab 3: 'bang-xep-hang' (displays the Class XP Leaderboard)
  const [homeTab, setHomeTab] = useState<'hoc-live' | 'toan-bo-tiet-hoc' | 'bang-xep-hang'>('hoc-live');
  const [studentResultScope, setStudentResultScope] = useState<'ca-nhan' | 'lop' | 'khoi'>('ca-nhan');
  const [isInLiveRoom, setIsInLiveRoom] = useState<boolean>(false);

  // Mandatory Companion Selection Gate before entering Live Room:
  // Student must explicitly confirm a companion ('paired') or no companion ('solo') first
  const [companionMode, setCompanionMode] = useState<CompanionSelectionMode>('unselected');
  const [forceCompanionModal, setForceCompanionModal] = useState<boolean>(false);
  const [pendingLiveTarget, setPendingLiveTarget] = useState<{
    period: number;
    stage: 1 | 2 | 3 | 4;
  } | null>(null);

  // Class and Grade Rankings
  const classMatesList = students.filter((s) => s.classId === currentStudent.classId);
  const sortedClass = [...classMatesList].sort((a, b) => b.xp - a.xp);
  const classRank = Math.max(1, sortedClass.findIndex((s) => s.id === currentStudent.id) + 1);

  const gradeStudentsList = students.filter(
    (s) => s.grade === selectedGrade || Number(s.classId?.charAt(0)) === selectedGrade
  );
  const sortedGrade = [...gradeStudentsList].sort((a, b) => b.xp - a.xp);
  const gradeRank = Math.max(1, sortedGrade.findIndex((s) => s.id === currentStudent.id) + 1);

  const handleUpdatePartner = (partner: StudentRosterItem | null) => {
    const nextPartnerName = partner ? partner.name : 'Học cá nhân (1 mình)';
    const nextPartnerId = partner ? partner.id : '';
    currentStudent.partnerName = nextPartnerName;
    currentStudent.partnerId = nextPartnerId;
    setCompanionMode(partner ? 'paired' : 'solo');

    try {
      const saved = localStorage.getItem('cloudplay_students_roster_v4');
      if (saved) {
        const list = JSON.parse(saved);
        const updated = list.map((s: any) =>
          s.id === currentStudent.id
            ? { ...s, partnerName: nextPartnerName, partnerId: nextPartnerId }
            : s
        );
        localStorage.setItem('cloudplay_students_roster_v4', JSON.stringify(updated));
      }
    } catch {}

    // Sync updated student partner info to Cloud Database
    fetch('/api/db/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        students: [{ ...currentStudent, partnerName: nextPartnerName, partnerId: nextPartnerId }],
      }),
    }).catch(() => {});

    if (partner) {
      onShowToast(`Đã chọn bạn ${partner.name} ngồi cùng máy thành công!`);
    } else {
      onShowToast('Đã xác nhận chế độ Học cá nhân (Không có bạn đồng hành ngồi cùng máy)!');
    }
  };

  const handleRequestEnterLiveRoom = (periodNum: number, stageNum: 1 | 2 | 3 | 4) => {
    if (companionMode === 'unselected') {
      setPendingLiveTarget({ period: periodNum, stage: stageNum });
      setForceCompanionModal(true);
      onShowToast(
        '👥 Vui lòng chọn Bạn đồng hành ngồi cùng máy hoặc chọn "Không có bạn đồng hành (1 mình)" trước khi vào Phòng Live!'
      );
      return;
    }
    setOpenedPeriodNumber(periodNum);
    setActiveInlineStage(stageNum);
    setIsInLiveRoom(true);
  };

  // Check if Teacher is currently broadcasting Live specifically to this student's Grade AND Class
  const isLiveForStudentClass = Boolean(
    liveSession?.isBroadcasting &&
      liveSession.activeGrade === selectedGrade &&
      liveSession.activeClassId === currentStudent.classId
  );

  const [studentManuallyExitedLive, setStudentManuallyExitedLive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // When Teacher is broadcasting Live to this student's class, lock the student to the Live period and open StudentLiveRoom
  useEffect(() => {
    if (isLiveForStudentClass && liveSession?.activePeriod) {
      if (openedPeriodNumber !== liveSession.activePeriod) {
        setOpenedPeriodNumber(liveSession.activePeriod);
      }
      if (liveSession.activeStage) {
        setActiveInlineStage(liveSession.activeStage);
      }
      if (!studentManuallyExitedLive) {
        setIsInLiveRoom(true);
      }
    }
  }, [
    isLiveForStudentClass,
    liveSession?.activePeriod,
    liveSession?.activeStage,
    liveSession?.activeLiveView,
    studentManuallyExitedLive,
  ]);

  // Reset manual exit flag whenever Teacher switches Live view or stage so student re-syncs immediately
  useEffect(() => {
    if (isLiveForStudentClass) {
      setStudentManuallyExitedLive(false);
      setIsInLiveRoom(true);
    }
  }, [isLiveForStudentClass, liveSession?.activeLiveView, liveSession?.activeStage]);

  // When Teacher stops broadcasting Live, automatically close student live room
  useEffect(() => {
    if (isInLiveRoom && liveSession && liveSession.isBroadcasting === false) {
      setIsInLiveRoom(false);
      setOpenedPeriodNumber(null);
      onShowToast(
        '🔔 Tiết Live đã kết thúc! Thầy/Cô đã đánh dấu hoàn thành tiết học — Toàn bộ 4 hoạt động đã được mở khóa để các em tự luyện!'
      );
    }
  }, [isInLiveRoom, liveSession?.isBroadcasting, onShowToast]);

  // Check if a period was marked as taught by Teacher for this student's class
  const isPeriodTaughtByTeacher = (period: number): boolean => {
    const taughtList = liveSession?.taughtPeriodsByClass?.[currentStudent.classId] || [];
    return taughtList.includes(period);
  };

  // STRICT PEDAGOGICAL POLICY: Students can ONLY open self-study mode when the period has
  // been taught and marked finished by the Teacher. No student self-marking permitted!
  const isSelfStudyUnlocked = (period: number): boolean => isPeriodTaughtByTeacher(period);

  // Strict guard: if student is on an un-taught period in self-study mode, kick back to overview
  useEffect(() => {
    if (openedPeriodNumber !== null) {
      const isLiveNow = isLiveForStudentClass && liveSession?.activePeriod === openedPeriodNumber;
      if (!isLiveNow && !isPeriodTaughtByTeacher(openedPeriodNumber)) {
        onShowToast(
          `🔒 Tiết ${openedPeriodNumber} chưa được Giáo viên dạy trên lớp (chưa đánh dấu hoàn thành). Em chỉ được mở chế độ Tự luyện sau khi Thầy/Cô đã giảng dạy tiết học này!`
        );
        setOpenedPeriodNumber(null);
      }
    }
  }, [
    openedPeriodNumber,
    isLiveForStudentClass,
    liveSession?.activePeriod,
    liveSession?.taughtPeriodsByClass,
    currentStudent.classId,
    onShowToast,
  ]);

  const gradePeriods = getPeriodsForGrade(selectedGrade);

  // Student Profile Metrics
  const profileMetrics = (
    <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-center">
            <span className="text-secondary font-bold">Điểm XP</span>
            <span className="text-2xl font-black text-primary">{currentStudent.xp}</span>
            <span className="text-xs text-on-surface-variant">Còn {1000 - (currentStudent.xp % 1000)} XP nữa lên cấp</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-center">
            <span className="text-secondary font-bold">Ngôi sao</span>
            <span className="text-2xl font-black text-amber-500">{currentStudent.stars}</span>
            <span className="text-xs text-on-surface-variant">Hạng #{currentStudent.groupNumber} trong Lớp</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-center">
            <span className="text-secondary font-bold">Thành tích</span>
            <span className="text-2xl font-black text-emerald-600">Top {currentStudent.groupNumber}</span>
            <span className="text-xs text-on-surface-variant">Khối {selectedGrade}</span>
        </div>
    </div>
  );

  const filteredPeriods =
    examFilter === 'ALL'
      ? gradePeriods
      : gradePeriods.filter((p) => p.examMilestone === examFilter);

  const currentPeriodSpec: CurriculumPeriodSpec =
    gradePeriods.find((p) => p.period === (openedPeriodNumber || 1)) || gradePeriods[0];
  const currentLessonKey = `k${selectedGrade}-tiet-${currentPeriodSpec.period}`;
  const isLessonVerified = Boolean(
    liveSession?.customWorksheetsByLesson?.[currentLessonKey] ||
      liveSession?.verifiedLessonsMap?.[currentLessonKey] !== false
  );
  const currentBlueprint = isLessonVerified
    ? buildLessonBlueprintFromPeriod(currentPeriodSpec)
    : {
        ...buildLessonBlueprintFromPeriod(currentPeriodSpec),
        stage1: {
          title: 'Khởi động',
          secretPictureTitle: 'Khởi động bài học',
          secretPictureMeaning: 'Chưa có dữ liệu',
          videoStops: [],
          crosswordClues: [],
        },
        stage3Questions: [],
        stage4Prompts: [],
      };
  const customWorksheet = liveSession?.customWorksheetsByLesson?.[currentLessonKey];
  const activeWorksheet = isLessonVerified
    ? (customWorksheet || getDefaultWorksheetForLesson(selectedGrade, currentPeriodSpec.period))
    : {
        lessonId: currentLessonKey,
        stage1: {
          title: '',
          scenario: '',
          question: '',
          sampleAnswer: '',
          points: 1.0,
        },
        stage2: {
          bucketA: '',
          bucketB: '',
          dragItems: [],
          dragDropTitle: '',
          dragDropInstruction: '',
          dragDropWordBank: [],
          dragDropParagraph: '',
          dragDropQuestions: [],
          dragDropSentenceLines: [],
          fillBlankTitle: '',
          fillBlankInstruction: '',
          fillBlankQuestions: [],
          matchingTitle: '',
          matchingInstruction: '',
          matchingQuestions: [],
          shortAnswerPrompt: '',
          shortAnswerQuestions: [],
        },
        stage3QuizQuestions: [],
        stage4: {
          deepAnalysis: {
            title: '',
            prompt: '',
            guideAnswer: '',
            points: 1.0,
          },
          practicalTask: {
            title: '',
            prompt: '',
            guideAnswer: '',
            points: 1.0,
          },
          extendedTask: {
            title: '',
            prompt: '',
            guideAnswer: '',
            points: 1.0,
          },
        },
      };

  const currentGradeSource =
    NOTEBOOK_GRADE_SOURCES.find((g) => g.grade === selectedGrade) ||
    NOTEBOOK_GRADE_SOURCES[0];

  // Determine unlocked stages for a given (grade, period) — strictly synchronized between StudentPortal and StudentLiveRoom
  const getUnlockedStagesForPeriod = (
    grade: 6 | 7 | 8 | 9,
    period: number
  ): Record<1 | 2 | 3 | 4, boolean> => {
    const key = `k${grade}-tiet-${period}`;
    const isActiveLiveLesson =
      liveSession?.activeGrade === grade && liveSession?.activePeriod === period;

    // When Teacher is actively projecting Slide or just ended Slide ('waiting'), all 4 activities are strictly locked
    if (
      isActiveLiveLesson &&
      (liveSession?.activeLiveView === 'slide' || liveSession?.activeLiveView === 'waiting')
    ) {
      return { 1: false, 2: false, 3: false, 4: false };
    }

    const fromSession = liveSession?.unlockedStagesByLesson?.[key];
    if (fromSession && typeof fromSession === 'object') {
      return {
        1: Boolean(fromSession[1]),
        2: Boolean(fromSession[2]),
        3: Boolean(fromSession[3]),
        4: Boolean(fromSession[4]),
      };
    }

    if (isSelfStudyUnlocked(period) && !liveSession?.isBroadcasting) {
      return { 1: true, 2: true, 3: true, 4: true };
    }

    return {
      1: false,
      2: false,
      3: false,
      4: false,
    };
  };

  const currentPeriodUnlocked = getUnlockedStagesForPeriod(
    selectedGrade,
    currentPeriodSpec.period
  );

  // ================= STAGE 1 INLINE WORKSPACE STATE =================
  const [stage1SubTab, setStage1SubTab] = useState<'scenario' | 'video' | 'crossword'>('scenario');
  const [selectedVideoQuizOpt, setSelectedVideoQuizOpt] = useState<string | null>(null);
  const [solvedClueIds, setSolvedClueIds] = useState<string[]>([]);
  const [clueInputs, setClueInputs] = useState<Record<string, string>>({});
  const [wordCloudInput, setWordCloudInput] = useState('Mây đen');
  const [wordCloudList, setWordCloudList] = useState([
    { word: 'Mây đen', count: 28, style: 'primary' },
    { word: 'Sấm chớp', count: 19, style: 'secondary' },
    { word: 'Gió to', count: 14, style: 'tertiary' },
    { word: 'Trời tối', count: 11, style: 'peach' },
    { word: 'Không khí ẩm', count: 7, style: 'neutral' },
  ]);

  // ================= STAGE 2 INLINE WORKSPACE STATE =================
  const [worksheetCards, setWorksheetCards] = useState<ClassificationCard[]>([
    {
      id: 'card_1',
      text: '"Nhiệt độ kế chỉ 38°C"',
      icon: 'device_thermostat',
      correctBox: 'data',
      assignedBox: 'pool',
    },
    {
      id: 'card_2',
      text: '"Bạn An đang bị sốt nhẹ"',
      icon: 'sick',
      correctBox: 'info',
      assignedBox: 'pool',
    },
    {
      id: 'card_3',
      text: '"Biển báo vòng tròn đỏ có gạch chéo"',
      icon: 'signpost',
      correctBox: 'data',
      assignedBox: 'pool',
    },
    {
      id: 'card_4',
      text: '"Đã đến giờ vào lớp học rồi"',
      icon: 'alarm',
      correctBox: 'info',
      assignedBox: 'pool',
    },
  ]);
  // ================= HOẠT ĐỘNG 2: PHIẾU HỌC TẬP CHUẨN PDF / ẢNH MẪU =================
  const [dragSlots, setDragSlots] = useState<{ [key: number]: string | null }>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  });
  const [selectedWordBank, setSelectedWordBank] = useState<string | null>(null);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  const [fillBlankInputs, setFillBlankInputs] = useState<{ a: string; b: string; c: string }>({
    a: '',
    b: '',
    c: '',
  });

  const [selectedColA, setSelectedColA] = useState<string | null>(null);
  const [matchingConnections, setMatchingConnections] = useState<Record<string, string>>({});

  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});

  const [worksheetSubmitted, setWorksheetSubmitted] = useState(false);
  const [worksheetScore, setWorksheetScore] = useState<number | null>(null);
  
  // Achievement Toast Notification
  const [achievementToast, setAchievementToast] = useState<{title: string, stars: number} | null>(null);
  useEffect(() => {
    if (achievementToast) {
      const timer = setTimeout(() => setAchievementToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [achievementToast]);


  // ================= HOẠT ĐỘNG 4: VẬN DỤNG =================
  const [stage4Submitted, setStage4Submitted] = useState(false);
  const [stage4Answers, setStage4Answers] = useState({
    deepAnalysis: '',
    practicalTask: '',
    extendedTask: '',
  });

  // ================= SCANNER COMPONENT (AI GEMINI VISION OCR) =================
  const [showWorksheetScannerModal, setShowWorksheetScannerModal] = useState<boolean>(false);
  const [showPeerReviewModal, setShowPeerReviewModal] = useState<boolean>(false);


  const handleApplyExtractedScannerData = (data: ExtractedWorksheetData) => {
    if (data.dragSlots && Object.keys(data.dragSlots).length > 0) {
      setDragSlots((prev) => ({ ...prev, ...data.dragSlots }));
    }
    if (data.fillBlankInputs && Object.keys(data.fillBlankInputs).length > 0) {
      setFillBlankInputs((prev) => ({ ...prev, ...data.fillBlankInputs }));
    }
    if (data.matchingConnections && Object.keys(data.matchingConnections).length > 0) {
      setMatchingConnections((prev) => ({ ...prev, ...data.matchingConnections }));
    }
    if (data.shortAnswers && Object.keys(data.shortAnswers).length > 0) {
      setShortAnswers((prev) => ({ ...prev, ...data.shortAnswers }));
    }
    if (data.stage4Answers && Object.keys(data.stage4Answers).length > 0) {
      setStage4Answers((prev) => ({ ...prev, ...data.stage4Answers }));
    }
    onAwardXp(30);
    onShowToast('🎉 Đã tự động điền các câu trả lời từ phiếu quét OCR (+30 XP)!');
  };

  // ================= DUAL-MODE ENGINE & AUTO-SAVE CROSS-DEVICE RESUME STATE =================
  const currentDraftKey = `${currentStudent.id}_k${selectedGrade}_tiet_${currentPeriodSpec.period}`;
  const localDraftStorageKey = `CLOUDPLAY_AUTOSAVE_${currentDraftKey}`;

  const [manualModeOverride, setManualModeOverride] = useState<'IN_CLASS_LIVE' | 'HOME_SELF_PACED' | null>(null);
  const activeLearningMode: 'IN_CLASS_LIVE' | 'HOME_SELF_PACED' =
    manualModeOverride ||
    (isLiveForStudentClass &&
    (!openedPeriodNumber || openedPeriodNumber === liveSession?.activePeriod)
      ? 'IN_CLASS_LIVE'
      : 'HOME_SELF_PACED');

  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string>('Vừa đồng bộ');
  const [restoredFromCloudBanner, setRestoredFromCloudBanner] = useState<string | null>(null);
  const [fastFinisherChallenge, setFastFinisherChallenge] = useState<string | null>(null);
  const [fastFinisherReplyInput, setFastFinisherReplyInput] = useState<string>('');
  const [isLoadingFastFinisher, setIsLoadingFastFinisher] = useState<boolean>(false);

  // Restore saved draft when switching period/grade or logging in from another device (school lab PC -> home phone/laptop)
  useEffect(() => {
    let restoredDraft: StudentWorkDraft | null = null;
    try {
      const rawLocal = localStorage.getItem(localDraftStorageKey);
      if (rawLocal) {
        restoredDraft = JSON.parse(rawLocal) as StudentWorkDraft;
      }
    } catch {
      // ignore local parse error
    }

    const sessionDraft = liveSession?.studentDraftsByKey?.[currentDraftKey];
    if (
      sessionDraft &&
      (!restoredDraft ||
        new Date(sessionDraft.updatedAt).getTime() > new Date(restoredDraft.updatedAt || 0).getTime())
    ) {
      restoredDraft = sessionDraft;
    }

    const applyDraft = (d: StudentWorkDraft) => {
      if (d.dragSlots) setDragSlots(d.dragSlots);
      if (d.fillBlankInputs) setFillBlankInputs(d.fillBlankInputs);
      if (d.matchingConnections) setMatchingConnections(d.matchingConnections);
      if (d.shortAnswers && Object.keys(d.shortAnswers).length > 0) setShortAnswers(d.shortAnswers);
      if (d.stage4Answers) setStage4Answers(d.stage4Answers);
      if (d.clueInputs) setClueInputs(d.clueInputs);
      if (d.solvedClueIds) setSolvedClueIds(d.solvedClueIds);
      if (d.attemptCount) setAttemptCount(d.attemptCount);
      const timeStr = d.updatedAt
        ? new Date(d.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Vừa xong';
      setLastAutoSavedAt(timeStr);
      setRestoredFromCloudBanner(
        `Đã khôi phục nguyên vẹn bài làm dở dang của ${currentStudent.name} (Lưu lúc ${timeStr})`
      );
    };

    if (restoredDraft) {
      applyDraft(restoredDraft);
    } else {
      setDragSlots({ 1: null, 2: null, 3: null, 4: null, 5: null });
      setFillBlankInputs({ a: '', b: '', c: '' });
      setMatchingConnections({});
      const saList = activeWorksheet.stage2.shortAnswerQuestions || [];
      const nextSa: Record<string, string> = {};
      saList.forEach((sq) => {
        nextSa[sq.id] = '';
      });
      setShortAnswers(nextSa);
      setWorksheetSubmitted(false);
      setWorksheetScore(null);
      setStage4Submitted(false);
      setStage4Answers({ deepAnalysis: '', practicalTask: '', extendedTask: '' });
      setAttemptCount(1);
      setRestoredFromCloudBanner(null);
    }

    // Also check backend database for newer cross-device state
    fetch(`/api/worksheets/draft-sync/${currentDraftKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.draft) {
          const remoteDraft = data.draft as StudentWorkDraft;
          if (
            !restoredDraft ||
            new Date(remoteDraft.updatedAt).getTime() > new Date(restoredDraft.updatedAt || 0).getTime()
          ) {
            applyDraft(remoteDraft);
            try {
              localStorage.setItem(localDraftStorageKey, JSON.stringify(remoteDraft));
            } catch {
              // ignore quota
            }
          }
        }
      })
      .catch(() => {
        // ignore offline
      });
    setFastFinisherChallenge(null);
  }, [selectedGrade, currentPeriodSpec.period, currentStudent.id]);

  // Auto-save every second to LocalStorage AND sync to Database when student types, drags, matches, or answers
  useEffect(() => {
    const hasAnyInput =
      Object.values(dragSlots).some((v) => v !== null) ||
      Boolean(fillBlankInputs.a || fillBlankInputs.b || fillBlankInputs.c) ||
      Object.keys(matchingConnections).length > 0 ||
      Object.values(shortAnswers).some((v) => Boolean(v && v.trim())) ||
      Boolean(
        stage4Answers.deepAnalysis.trim() ||
          stage4Answers.practicalTask.trim() ||
          stage4Answers.extendedTask.trim()
      ) ||
      solvedClueIds.length > 0;

    if (!hasAnyInput) return;

    const timer = setTimeout(() => {
      const nowIso = new Date().toISOString();
      const draftPayload: StudentWorkDraft = {
        draftKey: currentDraftKey,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        classId: currentStudent.classId,
        grade: selectedGrade,
        period: currentPeriodSpec.period,
        clueInputs,
        solvedClueIds,
        dragSlots,
        fillBlankInputs,
        matchingConnections,
        shortAnswers,
        stage4Answers,
        attemptCount,
        updatedAt: nowIso,
      };

      try {
        localStorage.setItem(localDraftStorageKey, JSON.stringify(draftPayload));
      } catch {
        // ignore storage quota
      }

      setLastAutoSavedAt(
        new Date(nowIso).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      fetch('/api/worksheets/draft-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: draftPayload }),
      }).catch(() => {
        // ignore network
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    dragSlots,
    fillBlankInputs,
    matchingConnections,
    shortAnswers,
    stage4Answers,
    clueInputs,
    solvedClueIds,
    attemptCount,
    currentDraftKey,
    localDraftStorageKey,
  ]);

  // Helper to record a Tagged Submission ([TRÊN LỚP] vs [TỰ LUYỆN Ở NHÀ]) into Teacher Gradebook
  const recordTaggedSubmission = (
    stageId: 1 | 2 | 3 | 4,
    stageLabel: string,
    score: number,
    maxScore: number
  ) => {
    const nextAttempt = attemptCount;
    setAttemptCount((c) => c + 1);
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const isLive = activeLearningMode === 'IN_CLASS_LIVE';

    const evaluation = isLive
      ? `Tập trung cao độ ngay tại lớp (Giờ học: ${timeLabel}), đạt ${score.toFixed(1)}/${maxScore.toFixed(1)}đ.`
      : nextAttempt > 1
      ? `Thái độ tự giác & kiên trì: Tự luyện ở nhà Lần #${nextAttempt}, cải thiện năng lực đạt ${score.toFixed(1)}/${maxScore.toFixed(1)}đ.`
      : `Chủ động tự luyện tại nhà (Lần #1 lúc ${timeLabel}), đạt ${score.toFixed(1)}/${maxScore.toFixed(1)}đ.`;

    const newTagged: TaggedLessonSubmission = {
      id: `tag-${currentStudent.id}-k${selectedGrade}-p${currentPeriodSpec.period}-s${stageId}-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentUsername: currentStudent.username || currentStudent.id,
      classId: currentStudent.classId,
      grade: selectedGrade,
      period: currentPeriodSpec.period,
      lessonTitle: currentPeriodSpec.lessonTitle,
      stageId,
      stageLabel,
      score,
      maxScore,
      mode: activeLearningMode,
      attemptCount: nextAttempt,
      submittedAt: isLive
        ? `${timeLabel} • Giờ học trên lớp`
        : `${timeLabel} • Tự luyện ở nhà (Lần #${nextAttempt})`,
      timestampIso: now.toISOString(),
      pedagogicalEvaluation: evaluation,
    };

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        taggedSubmissions: [
          newTagged,
          ...(prev.taggedSubmissions || INITIAL_TAGGED_SUBMISSIONS),
        ],
      }));
    }

    fetch('/api/worksheets/draft-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taggedSubmission: newTagged }),
    }).catch(() => {
      // ignore offline
    });
  };

  // Trigger Fast-Finisher AI Challenge when student finishes early in In-Class Live mode
  const handleRequestFastFinisherChallenge = async () => {
    setIsLoadingFastFinisher(true);
    const lessonContextString = `Khối ${selectedGrade} • ${currentPeriodSpec.lessonTitle} (${currentPeriodSpec.knowledgeSection}) | YCCĐ: ${currentPeriodSpec.yccd}`;
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: `Em đã hoàn thành sớm Hoạt động ${activeInlineStage} của ${currentPeriodSpec.lessonTitle} trên lớp! Hãy đặt cho em 1 câu hỏi thử thách nhanh (Fast-finisher) để em suy nghĩ trong lúc chờ các bạn nhé!`,
            },
          ],
          lessonContext: lessonContextString,
          learningMode: 'IN_CLASS_LIVE',
          pedagogicalAction: 'fast_finisher',
          role: 'student',
        }),
      });
      const data = await res.json();
      setFastFinisherChallenge(
        data.reply ||
          `🦉 **🔴 [THỬ THÁCH FAST-FINISHER TRÊN LỚP — +15 XP]**\nChúc mừng ${currentStudent.name} đã hoàn thành bài sớm! Câu hỏi nâng cao dành cho em: Hãy nêu 1 ví dụ thực tế ứng dụng kiến thức **${currentPeriodSpec.lessonTitle}** giúp nâng cao hiệu quả học tập hoặc bảo vệ an toàn thông tin cá nhân!`
      );
    } catch {
      setFastFinisherChallenge(
        `🦉 **🔴 [THỬ THÁCH FAST-FINISHER TRÊN LỚP — +15 XP]**\nChúc mừng ${currentStudent.name} đã hoàn thành bài sớm! Câu hỏi nâng cao dành cho em: Hãy nêu 1 ví dụ thực tế ứng dụng kiến thức **${currentPeriodSpec.lessonTitle}** giúp nâng cao hiệu quả học tập hoặc bảo vệ an toàn thông tin cá nhân!`
      );
    } finally {
      setIsLoadingFastFinisher(false);
    }
  };

  // ================= HOẠT ĐỘNG 3: ĐẤU TRƯỜNG TRẮC NGHIỆM 25S (DUY NHẤT 1 LOẠI - 3.0 ĐIỂM) =================
  const [arenaQuestionIndex, setArenaQuestionIndex] = useState(0);
  const [selectedArenaOption, setSelectedArenaOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [arenaTimeLeft, setArenaTimeLeft] = useState(25);
  const [arenaScore, setArenaScore] = useState(0);
  const [arenaAnswers, setArenaAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [arenaFinished, setArenaFinished] = useState(false);
  const [arenaStreak, setArenaStreak] = useState(1);
  const [arenaXp, setArenaXp] = useState(100);

  // ================= GEMINI CHATBOT STATE (TRỢ LÝ AI CÚ VÀNG) =================
  const [chatModelMode, setChatModelMode] = useState<'standard' | 'fast'>('standard');
  const [tutorInput, setTutorInput] = useState('');
  const [tutorMessages, setTutorMessages] = useState<
    { role: 'user' | 'model'; text: string; model?: string; timestamp: string }[]
  >([
    {
      role: 'model',
      text: `🦉 Xin chào **${currentStudent.name}**! Mình là **Trợ lý AI Cú Vàng** (tích hợp mô hình Gemini). Mình hoạt động theo **2 Chế độ Sư phạm thông minh**:\n- 🔴 **Trên lớp (In-Class Live):** Đặt câu hỏi thử thách nhanh (*Fast-finisher*) khi em hoàn thành bài sớm hơn các bạn.\n- 🏠 **Ở nhà (Self-Paced Practice):** Đóng vai trò **Gia sư hướng dẫn (Scaffolding)**, giải thích tại sao câu trắc nghiệm bị sai và gợi ý phương pháp giải quyết vấn đề thực tiễn theo chuẩn **YCCĐ GDPT 2018 & Khung Năng lực AI (QĐ 3439)**.\n\nEm đang tìm hiểu bài nào, hoặc cần mình hỗ trợ nội dung nào hôm nay?`,
      model: 'gemini-3.8-flash',
      timestamp: 'Vừa xong',
    },
  ]);
  const [tutorLoading, setTutorLoading] = useState(false);

  // Calculate Stage 2 score out of 4.0 points (DragDrop 1.0 + FillBlank 1.0 + Matching 1.0 + ShortAnswer 1.0)
  const calculatePdfStage2Score = () => {
    let score = 0;
    const ddQuestions = activeWorksheet.stage2.dragDropQuestions || [];
    const ddItems = activeWorksheet.stage2.dragItems || [];
    ddQuestions.forEach((dq, idx) => {
      const slotKey = dq.slotNum ?? (dq as unknown as { slot?: number }).slot ?? idx + 1;
      const rawVal = dragSlots[slotKey];
      if (!rawVal) return;
      const normVal = String(rawVal).trim().toUpperCase();
      const cwUpper = String(dq.correctWord || '').trim().toUpperCase();
      const targetBox: 'A' | 'B' =
        cwUpper === 'A' || cwUpper === 'DATA' || cwUpper === 'HỘP A'
          ? 'A'
          : cwUpper === 'B' || cwUpper === 'INFO' || cwUpper === 'HỘP B'
          ? 'B'
          : ddItems[idx]?.correctBox === 'data'
          ? 'A'
          : ddItems[idx]?.correctBox === 'info'
          ? 'B'
          : idx < Math.ceil(ddQuestions.length / 2)
          ? 'A'
          : 'B';
      if (
        normVal === targetBox ||
        (normVal === 'DATA' && targetBox === 'A') ||
        (normVal === 'INFO' && targetBox === 'B') ||
        String(rawVal).trim() === String(dq.correctWord || '').trim()
      ) {
        score += Number(dq.points) || 0.25;
      }
    });

    const fbQuestions = activeWorksheet.stage2.fillBlankQuestions || [];
    fbQuestions.forEach((fb, idx) => {
      const fallbackKey = idx === 0 ? 'a' : idx === 1 ? 'b' : 'c';
      const rawVal = ((fillBlankInputs as Record<string, string>)[fb.id] ??
        (fillBlankInputs as Record<string, string>)[fallbackKey] ??
        '')
        .trim()
        .toLowerCase();
      if (
        rawVal &&
        (rawVal.includes(fb.correctAnswer.toLowerCase()) ||
          fb.accepted.some((acc) => rawVal.includes(acc.toLowerCase())))
      ) {
        score += fb.points ?? (idx === 0 ? 0.35 : 0.3);
      }
    });

    const matchQuestions = activeWorksheet.stage2.matchingQuestions || [];
    matchQuestions.forEach((mq, idx) => {
      const key = String(mq.num || idx + 1);
      if (matchingConnections[key] === mq.rightKey) {
        score += mq.points ?? 0.25;
      }
    });

    const saQuestions = activeWorksheet.stage2.shortAnswerQuestions || [];
    saQuestions.forEach((sq, idx) => {
      const fallbackKey = idx === 0 ? 'data' : idx === 1 ? 'info' : 'carrier';
      const val = (
        shortAnswers[sq.id] ??
        shortAnswers[fallbackKey] ??
        Object.values(shortAnswers)[0] ??
        ''
      ).trim();
      if (val.length > 0) {
        const evalRes = evaluateAnswerBySuggestedPercentage(
          val,
          sq.sampleAnswer || '',
          sq.points ?? (saQuestions.length === 1 ? 1.0 : idx === 0 ? 0.4 : 0.3)
        );
        score += evalRes.earnedPoints;
      }
    });

    return Math.min(4.0, Math.round(score * 100) / 100);
  };

  // 25s Countdown timer for Hoạt động 3 (Đấu trường trắc nghiệm 25s)
  useEffect(() => {
    if (
      activeView !== 'trang-chu' ||
      openedPeriodNumber === null ||
      activeInlineStage !== 3 ||
      arenaFinished
    ) {
      return;
    }
    const timer = setInterval(() => {
      setArenaTimeLeft((prev) => {
        if (prev <= 1) {
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeView, openedPeriodNumber, activeInlineStage, arenaFinished, arenaQuestionIndex]);

  // Jump directly into the Teacher's Live Broadcast Lesson (strictly class-specific)
  const handleJoinTeacherLiveLesson = () => {
    if (!liveSession) return;
    if (!isLiveForStudentClass) {
      onShowToast(
        `Giáo viên hiện đang phát Live cho Lớp ${liveSession.activeClassId} (Khối ${liveSession.activeGrade}), chưa phát cho Lớp ${currentStudent.classId} của em.`
      );
      return;
    }
    setStudentManuallyExitedLive(false);
    setOpenedPeriodNumber(liveSession.activePeriod);
    setActiveInlineStage(liveSession.activeStage || 1);
    setIsInLiveRoom(true);
    onChangeView('trang-chu');
    onShowToast(
      `Đã đồng bộ vào Tiết Live của Lớp ${currentStudent.classId}: Khối ${selectedGrade} • Tiết ${liveSession.activePeriod} (${
        liveSession.activeLiveView === 'slide'
          ? 'Slide Bài Giảng'
          : `Hoạt động ${liveSession.activeStage}`
      })!`
    );
  };

  // Submit student practical file into Google Drive Class Folder (Max 3.0 points for Hoạt động 3)
  const handleSubmitPracticalDriveFile = async (payload: {
    fileName: string;
    fileType: string;
    fileSize: string;
    studentNote: string;
  }) => {
    const driveFolders = liveSession?.driveFolders || INITIAL_DRIVE_FOLDERS;
    const targetFolder =
      driveFolders.find(
        (f) => f.grade === selectedGrade && f.classId === currentStudent.classId
      ) || driveFolders[0];
    const newSub: PracticalProductSubmission = {
      id: `sub-drive-${Date.now()}`,
      folderId: targetFolder?.id || `drive-k${selectedGrade}-${currentStudent.classId}`,
      grade: selectedGrade,
      classId: currentStudent.classId,
      period: currentPeriodSpec.period,
      lessonTitle: currentPeriodSpec.lessonTitle,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentUsername: currentStudent.username || currentStudent.id,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      drivePath: `Google Drive / Khối ${selectedGrade} / Lớp ${currentStudent.classId} / Tiết ${currentPeriodSpec.period} / ${payload.fileName}`,
      studentNote: payload.studentNote,
      submittedAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Chờ chấm',
      score: null,
      maxPoints: 3,
      teacherFeedback: '',
    };

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        practicalSubmissions: [
          newSub,
          ...(prev.practicalSubmissions || INITIAL_PRACTICAL_SUBMISSIONS),
        ],
      }));
    }
    try {
      await fetch('/api/drive/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission: newSub }),
      });
    } catch {
      // fallback local
    }
    onAwardXp(50);
    onShowToast(
      `☁️ Đã nộp sản phẩm "${payload.fileName}" lên cây thư mục Google Drive Lớp ${currentStudent.classId} (+50 XP)!`
    );
  };

  const handleClassifyCard = (cardId: string, targetBox: 'data' | 'info') => {
    setWorksheetCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, assignedBox: targetBox } : c))
    );
    onShowToast(
      `Đã phân loại vào ${
        targetBox === 'data' ? currentBlueprint.stage2.bucketA : currentBlueprint.stage2.bucketB
      }! (+1.0 Điểm)`
    );
  };

  const handleSubmitStage1Word = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = wordCloudInput.trim();
    if (!clean) return;
    setWordCloudList((prev) => {
      const idx = prev.findIndex((item) => item.word.toLowerCase() === clean.toLowerCase());
      if (idx >= 0) {
        return prev.map((item, i) => (i === idx ? { ...item, count: item.count + 1 } : item));
      }
      return [{ word: clean, count: 1, style: 'primary' }, ...prev];
    });
    onAwardXp(10);
    onShowToast(`Đã gửi từ khóa "${clean}" lên Đám mây từ khóa! (+10 XP)`);
    await submitWordCloudToCloud({
      word: clean,
      authorName: currentStudent.name,
      classId: currentStudent.classId,
      lessonId: currentPeriodSpec.id,
    });
  };

  const handleSubmitWorksheetStage2 = async () => {
    setWorksheetSubmitted(true);
    const score = worksheetScore ?? 10;
    onAwardXp(score * 10);
    onShowToast(`🎉 Hoàn thành Hoạt động 2! Đạt ${score}/10 điểm (+${score * 10} XP).`);
    try {
      await submitWorksheetToCloud({
        submissionId: `sub_${currentStudent.id}_${currentPeriodSpec.id}_stage2`,
        studentName: currentStudent.name,
        studentCode: currentStudent.id,
        classId: currentStudent.classId,
        lessonId: currentPeriodSpec.id,
        stageId: 2,
        score,
        status: 'submitted',
        answersSummary: JSON.stringify({
          dragSlots,
          fillBlankInputs,
          matchingConnections,
          shortAnswers,
        }),
      });
    } catch {
      // cloud submit fallback
    }
  };

  // Multi-turn Gemini Chat submission with Dual-Mode Pedagogical Context
  const sendGeminiChatMessage = async (textToSend: string, customAction?: string) => {
    const clean = textToSend.trim();
    if (!clean || tutorLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: clean,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedMessages = [...tutorMessages, userMsg];
    setTutorMessages(updatedMessages);
    setTutorInput('');
    setTutorLoading(true);

    const lessonContextString = `Khối ${selectedGrade} • ${currentPeriodSpec.lessonTitle} (${currentPeriodSpec.knowledgeSection}) | YCCĐ: ${currentPeriodSpec.yccd} | Năng lực số: ${currentPeriodSpec.digitalCompetency} | Năng lực AI: ${currentPeriodSpec.aiCompetency}`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          lessonContext: lessonContextString,
          modelMode: chatModelMode,
          learningMode: activeLearningMode,
          pedagogicalAction: customAction || '',
          role: 'student',
        }),
      });
      const data = await res.json();
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.reply || 'Cú Vàng AI đã ghi nhận câu hỏi của em!',
          model: data.model || (chatModelMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'),
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      onAwardXp(data.xpBonus || 10);
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `🦉 Cú Vàng AI gợi ý cho **${currentPeriodSpec.lessonTitle}**:\n- **Mục tiêu trọng tâm:** ${currentPeriodSpec.yccd}\n- **Năng lực số:** ${currentPeriodSpec.digitalCompetency}\n- **Năng lực AI:** ${currentPeriodSpec.aiCompetency}`,
          model: 'gemini-3.8-flash',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleSendTutorForm = (e: React.FormEvent) => {
    e.preventDefault();
    sendGeminiChatMessage(tutorInput);
  };

  // DEDICATED STUDENT LIVE ROOM (BRIGHT WHITE THEME, AUTO-FOLLOWS TEACHER BROADCAST STAGE & SLIDE)
  if ((isInLiveRoom || (isLiveForStudentClass && !studentManuallyExitedLive)) && openedPeriodNumber !== null) {
    return (
      <StudentLiveRoom
        currentStudent={currentStudent}
        students={students}
        periodSpec={currentPeriodSpec}
        liveSession={liveSession}
        unlockedStages={currentPeriodUnlocked}
        companionMode={companionMode}
        onExitLiveRoom={() => {
          setStudentManuallyExitedLive(true);
          setIsInLiveRoom(false);
          setOpenedPeriodNumber(null);
        }}
        onAwardXp={onAwardXp}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
      {/* LEFT SIDEBAR — HIDDEN IN FOCUS MODE FOR ZERO DISTRACTION */}
      {!isFocusMode && (
        <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_16px_rgba(77,183,254,0.12)] z-50 flex flex-col justify-between py-space-lg px-space-md overflow-y-auto">
          <div className="flex flex-col gap-space-lg">
            <div className="flex items-center gap-space-sm px-space-sm">
              <div className="w-11 h-11 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_4px_12px_rgba(255,158,88,0.35)]">
                <span className="material-symbols-outlined text-[26px]">cloud_done</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface leading-tight tracking-tight">
                  CloudPlay OS
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-bold tracking-wide uppercase">
                  Lớp {currentStudent.classId} • Khối {selectedGrade}
                </span>
              </div>
            </div>

            {/* ONLY 2 MAIN NAVIGATION MENUS: 1. Trang chủ, 2. Trợ lý AI Cú Vàng */}
            <nav className="flex flex-col gap-space-xs" aria-label="Menu chính Học sinh">
              <button
                type="button"
                onClick={() => {
                  onChangeView('trang-chu');
                }}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-lg transition-all group text-left cursor-pointer ${
                  activeView === 'trang-chu'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-[0_4px_12px_rgba(149,74,5,0.12)] font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[22px]">home</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg truncate">Trang chủ</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Lộ trình Khối {selectedGrade} (Lớp {currentStudent.classId})
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('tro-ly-ai-cu-vang')}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-lg transition-all group text-left cursor-pointer ${
                  activeView === 'tro-ly-ai-cu-vang'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-[0_4px_12px_rgba(149,74,5,0.12)] font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg truncate">Trợ lý AI Cú Vàng</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Gemini Chatbot Sư Phạm
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('huy-hieu')}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-lg transition-all group text-left cursor-pointer ${
                  activeView === 'huy-hieu'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-[0_4px_12px_rgba(149,74,5,0.12)] font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[22px]">military_tech</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg truncate">Huy hiệu thành tựu</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {currentStudent.stars} Sao • Hồ sơ huy hiệu
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('nhat-ky-hoat-dong')}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-lg transition-all group text-left cursor-pointer ${
                  activeView === 'nhat-ky-hoat-dong'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-[0_4px_12px_rgba(149,74,5,0.12)] font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[22px]">history</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg truncate">Nhật ký hoạt động</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Lịch sử học tập & Thành tựu
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('bang-xep-hang')}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-lg transition-all group text-left cursor-pointer ${
                  activeView === 'bang-xep-hang'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-[0_4px_12px_rgba(149,74,5,0.12)] font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[22px]">leaderboard</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-label-lg truncate">Kết quả &amp; Xếp hạng</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Cá nhân • Lớp • Khối
                  </span>
                </div>
              </button>
            </nav>

            {/* Live Classroom Sync Status Box in Sidebar (Class-Specific) */}
            {isLiveForStudentClass && liveSession ? (
              <div className="p-space-md rounded-xl bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-fixed/30 border border-primary/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                    Đang phát Live Lớp {currentStudent.classId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-label-sm font-bold">
                    Khối {liveSession.activeGrade}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-on-surface leading-snug">
                  Tiết {liveSession.activePeriod} • Đang mở Hoạt động {liveSession.activeStage}
                </p>
                <button
                  type="button"
                  onClick={handleJoinTeacherLiveLesson}
                  className="w-full py-2 px-3 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  <span>Vào tiết GV đang mở cho {currentStudent.classId}</span>
                </button>
              </div>
            ) : (
              <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
                  Trạng thái Lớp {currentStudent.classId}
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {liveSession?.isBroadcasting
                    ? `GV đang phát Live cho Lớp ${liveSession.activeClassId} (Khối ${liveSession.activeGrade}). Lớp ${currentStudent.classId} ở chế độ Tự luyện.`
                    : 'Chưa phát Live. Em có thể tìm hiểu trước Hoạt động 1 hoặc Tự luyện các tiết đã học.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-space-sm px-space-sm">
            <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Đồng bộ Thời gian thực
                </span>
                <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse inline-block" />
                  Live 24/7
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="mt-space-xs flex items-center justify-center gap-space-xs py-1.5 px-space-sm rounded-full bg-surface-container-lowest text-on-surface hover:text-error font-label-sm text-label-sm shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">logout</span>
                Đăng xuất / Đổi tài khoản
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT SHELL */}
      <div className={isFocusMode ? 'pl-0 transition-all duration-300' : 'pl-72 transition-all duration-300'}>
        {/* TOP HEADER — PERMANENT DISTRACTION-FREE FOCUS BAR FOR STUDENTS */}
        {isFocusMode ? (
          <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-primary/20 shadow-md z-40 flex items-center justify-between px-4 sm:px-8 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={handleToggleFocusMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-label-sm text-xs font-bold shadow-xs transition-all cursor-pointer ring-2 ring-indigo-400/40"
                title="Đang bật Chế độ tập trung (Phím F). Bấm để hiển thị lại thanh bên và các bảng điều khiển phụ"
              >
                <span className="material-symbols-outlined text-[16px] animate-pulse">center_focus_strong</span>
                <span>Tập trung: BẬT</span>
              </button>
              <div className="hidden lg:flex items-center gap-2 text-on-surface min-w-0">
                <span className="font-headline-sm text-sm font-bold truncate">
                  {openedPeriodNumber !== null
                    ? `Tiết ${currentPeriodSpec.period}: ${currentPeriodSpec.lessonTitle}`
                    : `Khối ${selectedGrade} • Lớp ${currentStudent.classId}`}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-xs font-bold shrink-0">
                  {currentStudent.name} ({currentStudent.classId})
                </span>
              </div>
            </div>

            {/* Quick Activity Selector Tabs when inside a lesson */}
            {openedPeriodNumber !== null && activeView === 'trang-chu' && (
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full">
                {([
                  { stage: 1, label: 'Khởi động' },
                  { stage: 2, label: 'Khám phá (4.0đ)' },
                  { stage: 3, label: 'Luyện tập (3.0đ)' },
                  { stage: 4, label: 'Vận dụng (3.0đ)' },
                ] as const).map((s) => {
                  const isUnlocked = currentPeriodUnlocked[s.stage];
                  const isActive = activeInlineStage === s.stage;
                  return (
                    <button
                      key={s.stage}
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => setActiveInlineStage(s.stage)}
                      className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-primary text-on-primary shadow-xs'
                          : isUnlocked
                          ? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                          : 'text-outline opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span>HĐ{s.stage}</span>
                      <span className="hidden xl:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Essential Focus Bar Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onChangeView(activeView === 'tro-ly-ai-cu-vang' ? 'trang-chu' : 'tro-ly-ai-cu-vang')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'tro-ly-ai-cu-vang'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {activeView === 'tro-ly-ai-cu-vang' ? 'menu_book' : 'smart_toy'}
                </span>
                <span className="hidden sm:inline">
                  {activeView === 'tro-ly-ai-cu-vang' ? 'Bài học' : 'AI Cú Vàng'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeView(activeView === 'bang-xep-hang' ? 'trang-chu' : 'bang-xep-hang')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'bang-xep-hang'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
                title="Xem kết quả học tập Cá nhân, cả Lớp và cả Khối"
              >
                <span className="material-symbols-outlined text-[16px]">leaderboard</span>
                <span className="hidden sm:inline">Kết quả (Cá nhân • Lớp • Khối)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeView(activeView === 'huy-hieu' ? 'trang-chu' : 'huy-hieu')}
                className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'huy-hieu'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
                title="Hồ sơ học sinh & Thư viện huy hiệu"
              >
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                <span className="hidden sm:inline">Huy hiệu</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label="Phóng to toàn màn hình"
                className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-label-sm text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
                title={isFullscreen ? 'Thu nhỏ màn hình (Esc)' : 'Phóng to toàn màn hình để xem bài giảng rõ ràng hơn'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
                <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Phóng to'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label="Chuyển đổi Chế độ tối"
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Giao diện sáng / tối"
              >
                <span className="material-symbols-outlined text-[17px] text-primary">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-error/15 text-on-surface hover:text-error font-label-sm text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </header>
        ) : (
          <header className="fixed top-0 left-72 right-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(77,183,254,0.08)] z-40 flex items-center justify-between px-space-xl gap-2">
            <div className="flex items-center gap-space-md">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Cổng Học Sinh • Lộ Trình 29 Tiết Học
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Khối {selectedGrade} • Đồng bộ trực tiếp với Giáo viên bộ môn
                </span>
              </div>

              {/* Locked Assigned Class Badge (Strictly 1 Class & Grade Per Student) */}
              <div className="flex items-center gap-1.5 bg-primary-fixed/30 border border-primary/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                <span className="font-label-md text-label-md font-bold text-primary">
                  Lớp {currentStudent.classId} • Khối {selectedGrade}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-space-sm">
              {/* SCANNER COMPONENT BUTTON (GEMINI OCR) */}
              <button
                type="button"
                onClick={() => setShowWorksheetScannerModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                title="Chụp hoặc tải ảnh phiếu học tập, AI tự động quét OCR và điền câu trả lời"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  document_scanner
                </span>
                <span className="hidden sm:inline">Quét Phiếu AI</span>
              </button>

              {/* Student Push Notification & Announcement Bell Modal */}
              <StudentNotificationBannerModal
                currentStudent={currentStudent}
                liveSession={liveSession}
                currentPeriodSpec={currentPeriodSpec}
                onOpenPeriod={(p) => {
                  if (!isPeriodTaughtByTeacher(p)) {
                    onShowToast(
                      `🔒 Tiết ${p} chưa được Giáo viên dạy trên lớp (chưa đánh dấu hoàn thành). Chế độ Tự luyện chỉ mở sau khi Thầy/Cô đã giảng dạy tiết học này!`
                    );
                    return;
                  }
                  setOpenedPeriodNumber(p);
                }}
                onShowToast={onShowToast}
              />

              <div className="flex items-center gap-space-xs bg-primary-fixed px-space-md py-1.5 rounded-full text-on-primary-fixed-variant shadow-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
                <span className="font-label-lg text-label-lg">
                  {currentStudent.xp.toLocaleString()} XP
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleFocusMode}
                aria-label="Bật Chế độ tập trung"
                className="px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-label-sm text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
                title="Bật Chế độ tập trung để ẩn thanh bên và các bảng điều khiển phụ, dồn 100% chú ý vào câu hỏi (Phím F)"
              >
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                <span className="hidden sm:inline">Chế độ tập trung</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label="Phóng to toàn màn hình"
                className="px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-label-sm text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
                title={isFullscreen ? 'Thu nhỏ màn hình (Esc)' : 'Phóng to toàn màn hình để xem bài giảng rõ ràng hơn'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
                <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Phóng to'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label="Chuyển đổi Chế độ tối"
                className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              <div
                onClick={() => onChangeView('huy-hieu')}
                className="flex items-center gap-space-sm pl-space-xs cursor-pointer hover:opacity-80 transition-opacity"
                title="Xem hồ sơ học sinh & thư viện huy hiệu"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">
                    person
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                    {currentStudent.name}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Mã: {currentStudent.id} • Lớp {currentStudent.classId}
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* MAIN STAGE */}
        <main
          className={`relative w-full ${
            isFocusMode ? 'pt-20 max-w-5xl mx-auto px-4 sm:px-6' : 'pt-20 px-space-xl'
          } bg-background min-h-screen py-space-lg`}
        >

          {/* ================= MENU 1: TRANG CHỦ (CHỌN KHỐI 6,7,8,9 -> LỘ TRÌNH 29 TIẾT HỌC -> TRANG LỘ TRÌNH HỌC TẬP INLINE) ================= */}
          {activeView === 'trang-chu' && (
            <div className="flex flex-col w-full gap-space-lg pb-space-2xl">
              {/* CASE A: 29-PERIOD CURRICULUM ROADMAP OVERVIEW */}
              {openedPeriodNumber === null ? (
                <>
                  {/* 1. STUDENT COMPANION SELECTOR (MATCHES IMAGE 2 WITH GREETING, XP PROGRESS BAR & COMPANION CARDS) */}
                  <StudentCompanionSelector
                    currentStudent={currentStudent}
                    students={students}
                    classRank={classRank}
                    totalClassStudents={classMatesList.length || 40}
                    gradeRank={gradeRank}
                    totalGradeStudents={gradeStudentsList.length || 80}
                    companionMode={companionMode}
                    onConfirmCompanionMode={(mode) => setCompanionMode(mode)}
                    onUpdatePartner={handleUpdatePartner}
                    onShowToast={onShowToast}
                    forceOpenModal={forceCompanionModal}
                    onCloseForcedModal={() => setForceCompanionModal(false)}
                    onProceedToLiveAfterSelect={() => {
                      const targetPeriod =
                        pendingLiveTarget?.period || liveSession?.activePeriod || 1;
                      const targetStage =
                        pendingLiveTarget?.stage || liveSession?.activeStage || 1;
                      setPendingLiveTarget(null);
                      setOpenedPeriodNumber(targetPeriod);
                      setActiveInlineStage(targetStage);
                      setIsInLiveRoom(true);
                    }}
                  />

                  {/* 2. DUAL TAB SWITCHER: TAB 1 (HỌC LIVE), TAB 2 (TOÀN BỘ TIẾT HỌC) & KẾT QUẢ HỌC TẬP */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit flex-wrap">
                      <button
                        type="button"
                        onClick={() => setHomeTab('hoc-live')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                          homeTab === 'hoc-live'
                            ? 'bg-white text-orange-600 shadow-xs border border-orange-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span>Tab 1: Học Live</span>
                        {isLiveForStudentClass && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                            ĐANG PHÁT
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setHomeTab('toan-bo-tiet-hoc')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                          homeTab === 'toan-bo-tiet-hoc'
                            ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">calendar_view_month</span>
                        <span>Tab 2: Toàn bộ tiết học (29 tiết)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHomeTab('bang-xep-hang')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                          homeTab === 'bang-xep-hang'
                            ? 'bg-white text-amber-700 shadow-xs border border-amber-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-amber-600">leaderboard</span>
                        <span>Tab 3: Bảng xếp hạng Lớp #{classRank}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onChangeView('bang-xep-hang')}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">analytics</span>
                      <span>Kết quả học tập: Cá nhân • Lớp {currentStudent.classId} • Khối {selectedGrade}</span>
                    </button>
                  </div>

                  {/* TAB 1: HỌC LIVE (HIỂN THỊ DUY NHẤT TIẾT LIVE) */}
                  {homeTab === 'hoc-live' ? (
                    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col gap-5">
                      {isLiveForStudentClass && liveSession ? (
                        <div className="flex flex-col gap-6">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <span className="px-3.5 py-1.5 rounded-full bg-red-500 text-white text-xs font-black flex items-center gap-1.5 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white" />
                                <span>TIẾT HỌC ĐANG PHÁT TRỰC TIẾP</span>
                              </span>
                              <span className="text-xs text-slate-500 font-semibold">
                                Lớp {liveSession.activeClassId} • Khối {liveSession.activeGrade}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                              <span>Trạng thái ghép cặp:</span>
                              {companionMode === 'paired' ? (
                                <strong className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-bold">
                                  👥 Học cùng: {currentStudent.partnerName}
                                </strong>
                              ) : companionMode === 'solo' ? (
                                <strong className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                                  👤 Học cá nhân (1 mình)
                                </strong>
                              ) : (
                                <strong className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold">
                                  ⚠️ Chưa xác nhận bạn đồng hành
                                </strong>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-red-50 via-orange-50/50 to-amber-50 p-6 rounded-2xl border border-red-100">
                            <div className="flex flex-col gap-2">
                              <span className="text-xs uppercase tracking-wider font-bold text-red-600">
                                Tiết {liveSession.activePeriod} • Chương trình GDPT 2018
                              </span>
                              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                {gradePeriods.find((p) => p.period === liveSession.activePeriod)
                                  ?.lessonTitle || 'Thông tin và dữ liệu'}
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-600">
                                Giáo viên đang phát <strong>Hoạt động {liveSession.activeStage || 1}</strong>.{' '}
                                {companionMode === 'unselected' ? (
                                  <span className="text-amber-700 font-bold">
                                    (Hãy xác nhận bạn đồng hành hoặc học 1 mình để mở khóa vào Phòng Live)
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-bold">
                                    ✓ Đã xác nhận chế độ đồng hành — Sẵn sàng vào Phòng Live!
                                  </span>
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRequestEnterLiveRoom(
                                  liveSession.activePeriod,
                                  liveSession.activeStage || 1
                                )
                              }
                              className="px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-black text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 animate-pulse"
                            >
                              <span className="material-symbols-outlined text-[22px]">
                                {companionMode === 'unselected' ? 'group_add' : 'play_circle'}
                              </span>
                              <span>
                                {companionMode === 'unselected'
                                  ? 'CHỌN BẠN ĐỒNG HÀNH & VÀO PHÒNG LIVE'
                                  : 'VÀO PHÒNG HỌC LIVE NGAY'}
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[32px]">sensors_off</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-800">
                            Chưa có tiết học nào đang phát trực tiếp
                          </h3>
                          <p className="text-xs text-slate-500 max-w-md">
                            Thầy/Cô sẽ kích hoạt tiết live khi bắt đầu buổi học trên lớp. Em hãy chuẩn bị máy và bạn đồng hành, hoặc chuyển sang <strong>Tab 2: Toàn bộ tiết học</strong> để tự luyện bài tập đã học!
                          </p>
                          <button
                            type="button"
                            onClick={() => setHomeTab('toan-bo-tiet-hoc')}
                            className="mt-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Xem toàn bộ 29 tiết học
                          </button>
                        </div>
                      )}
                    </div>
                  ) : homeTab === 'bang-xep-hang' ? (
                    <ClassLeaderboardPanel
                      currentStudent={currentStudent}
                      students={students}
                      classId={currentStudent.classId}
                      grade={selectedGrade}
                      onShowToast={onShowToast}
                      onSelectStudent={onSelectStudentAccount}
                    />
                  ) : (
                    /* TAB 2: TOÀN BỘ TIẾT HỌC (29 TIẾT CÓ KHÓA TỰ LUYỆN CHỈ MỞ SAU KHI ĐÃ HỌC) */
                    <div className="flex flex-col gap-4">
                      {/* Filter Bar */}
                      <section className="relative w-full rounded-2xl bg-white p-4 shadow-xs border border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setLessonDisplayMode('grid')}
                              className={`p-1.5 rounded-lg transition-all ${
                                lessonDisplayMode === 'grid'
                                  ? 'bg-sky-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                              title="Chế độ lưới icon"
                            >
                              <span className="material-symbols-outlined text-[18px]">grid_view</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLessonDisplayMode('list')}
                              className={`p-1.5 rounded-lg transition-all ${
                                lessonDisplayMode === 'list'
                                  ? 'bg-sky-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                              title="Chế độ danh sách"
                            >
                              <span className="material-symbols-outlined text-[18px]">list</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              { id: 'ALL', label: 'Tất cả (29)' },
                              { id: 'GK1', label: 'GK1 (T1–T7)' },
                              { id: 'CK1', label: 'CK1 (T8–T15)' },
                              { id: 'GK2', label: 'GK2 (T16–T22)' },
                              { id: 'CK2', label: 'CK2 (T23–T27)' },
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() =>
                                  setExamFilter(f.id as 'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2')
                                }
                                className={`px-3 py-1 rounded-full font-label-sm text-xs transition-all cursor-pointer ${
                                  examFilter === f.id
                                    ? 'bg-sky-700 text-white font-bold shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* 29 Periods Icon Grid View */}
                      <DataBoundary
                        data={filteredPeriods}
                        isLoading={false}
                        emptyTitle={`Chưa có tiết học nào thuộc đợt ${examFilter}`}
                        emptyDescription="Vui lòng chọn 'Tất cả (29)' để xem đầy đủ chương trình."
                      >
                        {(periodsList) => (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                            {periodsList.map((spec) => {
                              const isLiveLesson =
                                isLiveForStudentClass && liveSession?.activePeriod === spec.period;
                              // STRICT POLICY: Only unlocked if taught and marked completed by the Teacher
                              const isSelfStudyUnlocked = isPeriodTaughtByTeacher(spec.period);

                              return (
                                <button
                                  key={spec.id}
                                  type="button"
                                  onClick={() => {
                                    if (isLiveLesson) {
                                      handleRequestEnterLiveRoom(
                                        spec.period,
                                        liveSession?.activeStage || 1
                                      );
                                      return;
                                    }
                                    if (!isSelfStudyUnlocked) {
                                      onShowToast(
                                        `🔒 Tiết ${spec.period} chưa được Giáo viên dạy trên lớp (chưa đánh dấu hoàn thành). Chế độ Tự luyện chỉ mở sau khi Thầy/Cô đã giảng dạy tiết học này!`
                                      );
                                      return;
                                    }
                                    // Open in self practice mode
                                    setOpenedPeriodNumber(spec.period);
                                    setActiveInlineStage(1);
                                  }}
                                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between text-center gap-2.5 transition-all cursor-pointer relative ${
                                    isLiveLesson
                                      ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-400/40'
                                      : isSelfStudyUnlocked
                                      ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-400 shadow-xs'
                                      : 'bg-slate-50 border-slate-200/60 opacity-60 hover:opacity-80'
                                  }`}
                                >
                                  {/* Period Number Badge */}
                                  <div className="flex items-center justify-between w-full">
                                    <span
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        isLiveLesson
                                          ? 'bg-red-600 text-white'
                                          : isSelfStudyUnlocked
                                          ? 'bg-sky-600 text-white'
                                          : 'bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      {spec.period}
                                    </span>

                                    {isLiveLesson ? (
                                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                                        LIVE
                                      </span>
                                    ) : isSelfStudyUnlocked ? (
                                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                                        check_circle
                                      </span>
                                    ) : (
                                      <span className="material-symbols-outlined text-slate-400 text-[16px]">
                                        lock
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-2xl">
                                    {isLiveLesson ? '🔴' : spec.lessonType === 'practice' ? '💻' : '📖'}
                                  </span>

                                  <div className="flex flex-col min-w-0 w-full">
                                    <span className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                                      {spec.lessonTitle}
                                    </span>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-full truncate ${
                                      isLiveLesson
                                        ? 'bg-red-100 text-red-700 font-black'
                                        : isSelfStudyUnlocked
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {isLiveLesson
                                      ? 'Đang phát Live'
                                      : isSelfStudyUnlocked
                                      ? '✓ Mở tự luyện'
                                      : '🔒 Khóa tự luyện'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </DataBoundary>
                    </div>
                  )}

                  {/* 3. STUDENT METRICS DASHBOARD (RANKINGS, XP REMAINING, BADGES GALLERY) */}
                  <StudentMetricsDashboard
                    currentStudent={currentStudent}
                    students={students}
                    classRank={classRank}
                    totalClassStudents={classMatesList.length || 40}
                    gradeRank={gradeRank}
                    totalGradeStudents={gradeStudentsList.length || 80}
                    onShowToast={onShowToast}
                  />
                </>
              ) : (
                /* CASE B: TRANG BÀI HỌC TẬP TRUNG CỦA TIẾT HỌC */
                <div className="flex flex-col gap-space-lg">
                  {/* Top Bar: Back to Compact ListView (disabled during Live) + Lesson Metadata */}
                  <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm">
                      {isLiveForStudentClass || activeLearningMode === 'IN_CLASS_LIVE' ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-label-sm text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                            <span>
                              Đang học Live Tiết {currentPeriodSpec.period} — Khóa chuyển tiết khác
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPeerReviewModal(true)}
                            className="px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-label-sm text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer hover:brightness-105"
                          >
                            <span className="material-symbols-outlined text-[16px]">rate_review</span>
                            <span>Đánh giá đồng đẳng ({currentStudent.partnerName || 'Bạn cặp'})</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenedPeriodNumber(null)}
                          className="px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                          <span>Danh sách tiết học</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {isSelfStudyUnlocked(currentPeriodSpec.period) ? (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                            <span>Đã học trên lớp (Mở tự luyện)</span>
                          </span>
                        ) : (
                          <span
                            className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                            title="Chờ giáo viên giảng dạy trên lớp để mở tự luyện"
                          >
                            <span className="material-symbols-outlined text-[16px] text-amber-700">lock</span>
                            <span>Chưa học trên lớp (Khóa tự luyện)</span>
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-xs font-bold">
                          Khối {selectedGrade} • Lớp {currentStudent.classId}
                        </span>

                        <button
                          type="button"
                          onClick={handleToggleFocusMode}
                          className={`px-3.5 py-1.5 rounded-full font-label-sm text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                            isFocusMode
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-400/40'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                          title={
                            isFocusMode
                              ? 'Đang bật Chế độ tập trung (Phím F). Bấm để hiển thị lại bảng điều khiển phụ'
                              : 'Bật Chế độ tập trung để ẩn thanh bên và các bảng điều khiển phụ, dồn 100% chú ý vào câu hỏi (Phím F)'
                          }
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isFocusMode ? 'animate-pulse' : ''}`}>
                            center_focus_strong
                          </span>
                          <span>{isFocusMode ? '🎯 Tập trung (BẬT)' : '🎯 Chế độ tập trung'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h1 className="font-headline-lg text-headline-lg text-on-surface">
                        {currentPeriodSpec.lessonTitle}
                      </h1>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        <strong>Mục tiêu cần đạt:</strong> {currentPeriodSpec.yccd}
                      </p>
                    </div>

                    {/* DUAL-MODE STATUS BANNER & AUTO-SAVE CROSS-DEVICE RESUME BAR (HIDDEN IN FOCUS MODE) */}
                    {isFocusMode ? (
                      <div className="pt-2.5 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs bg-indigo-50/70 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                          <span>🎯 Chế độ tập trung đang BẬT: Đã ẩn các bảng điều khiển phụ để em tập trung tối đa vào nội dung câu hỏi.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-slate-500 font-medium">
                            💾 Tự động lưu ({lastAutoSavedAt})
                          </span>
                          <button
                            type="button"
                            onClick={handleToggleFocusMode}
                            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Hiện lại bảng phụ
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Dual-Mode Indicator & Switcher */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-on-surface-variant">
                            Cơ chế Học tập Kép (Dual-Mode):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualModeOverride('IN_CLASS_LIVE');
                              onShowToast(
                                '🔴 Đã chuyển sang Chế độ Trên lớp (In-Class Live): Đồng bộ thời gian thực & Thử thách Fast-Finisher!'
                              );
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              activeLearningMode === 'IN_CLASS_LIVE'
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                activeLearningMode === 'IN_CLASS_LIVE'
                                  ? 'bg-white animate-ping'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span>🔴 Chế độ Trên lớp (In-Class Live)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setManualModeOverride('HOME_SELF_PACED');
                              onShowToast(
                                '🏠 Đã chuyển sang Chế độ Ở nhà (Self-Paced Practice): Mở khóa tự luyện & Gia sư AI Scaffolding!'
                              );
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              activeLearningMode === 'HOME_SELF_PACED'
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">home</span>
                            <span>🏠 Chế độ Ở nhà (Self-Paced Practice • Lần #{attemptCount})</span>
                          </button>
                        </div>

                        {/* Auto-Save Per Second & Cross-Device State Resume Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px]">cloud_sync</span>
                            <span>
                              💾 Tự động lưu từng giây ({lastAutoSavedAt}) • Đồng bộ Phòng máy ↔ Ở nhà
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Restored Cross-Device State Banner */}
                      {restoredFromCloudBanner && (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span className="material-symbols-outlined text-[17px]">restore_page</span>
                            <span>
                              {restoredFromCloudBanner} — Mọi ô điền khuyết, ghép nối và tự luận đã được phục hồi nguyên vẹn!
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRestoredFromCloudBanner(null)}
                            className="text-[11px] font-bold hover:underline cursor-pointer"
                          >
                            Ẩn
                          </button>
                        </div>
                      )}

                      {/* Teacher Live Random Wheel / Name Call Alert Banner (In-Class Live) */}
                      {liveSession?.wheelCall &&
                        (liveSession.wheelCall.isSpinning || liveSession.wheelCall.winnerName) && (
                          <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-primary-fixed/30 border-2 border-rose-500/40 flex flex-wrap items-center justify-between gap-3 animate-pulse">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-rose-600 text-[24px]">
                                campaign
                              </span>
                              <div>
                                <span className="text-xs font-black uppercase text-rose-600 block">
                                  🔴 Lệnh Quay Thưởng / Gọi Tên Trực Tiếp Từ Giáo Viên:
                                </span>
                                <span className="text-sm font-bold text-on-surface">
                                  {liveSession.wheelCall.isSpinning
                                    ? '🎡 Vòng quay may mắn đang quay tìm học sinh trả lời...'
                                    : `🎉 Giáo viên vừa gọi tên: ${liveSession.wheelCall.winnerName} (${
                                        liveSession.wheelCall.winnerGroup || `Lớp ${currentStudent.classId}`
                                      }) — ${liveSession.wheelCall.rewardLabel || '+20 XP Thưởng nóng'}!`}
                                </span>
                              </div>
                            </div>
                            {liveSession.wheelCall.winnerId === currentStudent.id && (
                              <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black">
                                🌟 ĐẾN LƯỢT EM TRẢ LỜI!
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                  </div>

                  {/* SERPENTINE 4-HOẠT-ĐỘNG LEARNING ROADMAP (CONDENSED IN FOCUS MODE) */}
                  {isFocusMode ? (
                    <div className="bg-surface-container-lowest border border-primary/20 rounded-xl px-5 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          Đang tập trung làm: Hoạt động {activeInlineStage} •{' '}
                          {activeInlineStage === 1
                            ? 'Khởi động'
                            : activeInlineStage === 2
                            ? 'Khám phá (4.0 điểm)'
                            : activeInlineStage === 3
                            ? 'Đấu trường Trắc nghiệm 25s (3.0 điểm)'
                            : 'Vận dụng & Mở rộng (3.0 điểm)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {([1, 2, 3, 4] as const).map((st) => {
                          const unlocked = currentPeriodUnlocked[st];
                          const active = activeInlineStage === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={!unlocked}
                              onClick={() => setActiveInlineStage(st)}
                              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                                active
                                  ? 'bg-primary text-on-primary shadow-2xs'
                                  : unlocked
                                  ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                                  : 'bg-surface-container text-outline opacity-40 cursor-not-allowed'
                              }`}
                            >
                              Hoạt động {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_12px_32px_-8px_rgba(77,183,254,0.18)] overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-space-md relative z-10">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                          Trang Lộ Trình Học Tập Tương Tác • Tổng điểm 1 tiết = 10.0 điểm (HĐ2: 4.0đ • HĐ3: 3.0đ • HĐ4: 3.0đ)
                        </span>
                        <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                          TIẾN TRÌNH 4 HOẠT ĐỘNG — {currentPeriodSpec.lessonTitle.toUpperCase()}
                        </h2>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-container font-label-sm text-label-sm font-bold">
                        Đang mở: Hoạt động {activeInlineStage} • Khối {selectedGrade} Tiết {currentPeriodSpec.period}
                      </span>
                    </div>

                    {/* Serpentine S-Curve SVG & 4 Milestone Nodes */}
                    <div className="relative py-space-md min-h-[165px] flex items-center justify-between z-10 px-2 sm:px-6">
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 800 160"
                      >
                        <path
                          className="text-secondary-fixed"
                          d="M 60 85 C 160 30, 240 140, 360 85 C 460 35, 540 145, 740 85"
                          stroke="currentColor"
                          strokeDasharray="10 8"
                          strokeLinecap="round"
                          strokeWidth="8"
                        />
                        <path
                          className="text-tertiary-container"
                          d="M 60 85 C 160 30, 240 140, 360 85"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="8"
                        />
                      </svg>

                      {(
                        [
                          {
                            stage: 1 as const,
                            title: 'Hoạt động 1: Khởi động',
                            subtitle: 'Mở sẵn • Thưởng XP',
                            icon: 'play_circle',
                          },
                          {
                            stage: 2 as const,
                            title: 'Hoạt động 2: Khám phá',
                            subtitle: 'Phiếu học tập (4.0 điểm)',
                            icon: 'assignment_turned_in',
                          },
                          {
                            stage: 3 as const,
                            title: 'Hoạt động 3: Luyện tập',
                            subtitle: 'Đấu trường 25s (3.0 điểm)',
                            icon: 'timer',
                          },
                          {
                            stage: 4 as const,
                            title: 'Hoạt động 4: Vận dụng',
                            subtitle: 'Thực tế & Rubric (3.0 điểm)',
                            icon: 'rocket_launch',
                          },
                        ] as const
                      ).map((node) => {
                        const isUnlocked = currentPeriodUnlocked[node.stage];
                        const isSelected = activeInlineStage === node.stage;

                        return (
                          <button
                            key={node.stage}
                            type="button"
                            onClick={() => {
                              if (!isUnlocked) {
                                onShowToast(
                                  `🔒 ${node.title} đang khóa — Chỉ khi Giáo viên mở khóa hoạt động này thì em mới được mở!`
                                );
                              }
                              setActiveInlineStage(node.stage);
                            }}
                            className={`relative flex flex-col items-center z-10 group cursor-pointer transition-transform ${
                              isSelected ? 'scale-110' : 'hover:scale-105'
                            }`}
                          >
                            <div className="relative">
                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                  isSelected
                                    ? 'bg-primary text-on-primary ring-4 ring-primary-fixed'
                                    : isUnlocked
                                    ? 'bg-tertiary-container text-on-tertiary-container'
                                    : 'bg-surface-container-highest text-on-surface-variant'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[30px]">
                                  {node.icon}
                                </span>
                              </div>
                              <div
                                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-surface-container-lowest shadow-sm ${
                                  isUnlocked
                                    ? 'bg-tertiary text-on-tertiary'
                                    : 'bg-inverse-surface text-inverse-on-surface'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {isUnlocked ? 'lock_open' : 'lock'}
                                </span>
                              </div>
                            </div>
                            <div className="text-center mt-2 max-w-[140px]">
                              <span
                                className={`font-headline-sm text-headline-sm block leading-tight ${
                                  isSelected ? 'text-primary font-black' : 'text-on-surface'
                                }`}
                              >
                                {node.title}
                              </span>
                              <span
                                className={`font-label-sm text-label-sm block mt-0.5 ${
                                  isUnlocked ? 'text-tertiary font-bold' : 'text-outline'
                                }`}
                              >
                                {isUnlocked ? node.subtitle : '🔒 Đang khóa (Chờ GV mở)'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  )}

                  {/* ================= INLINE STAGE CONTENT RENDERED DIRECTLY BELOW THE SERPENTINE ROADMAP ================= */}
                  {!currentPeriodUnlocked[activeInlineStage] ? (
                    <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-md text-center flex flex-col items-center gap-space-md border-2 border-dashed border-outline-variant">
                      <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px]">lock_clock</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        🔒 Hoạt động {activeInlineStage} đang khóa đồng bộ theo Giáo viên
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                        Trạng thái mở/khóa hoạt động được đồng bộ nghiêm ngặt giữa{' '}
                        <strong>Phòng Học Live</strong> và <strong>Lộ Trình Học Tập</strong>. Chỉ khi Giáo viên
                        mở khóa <strong>Hoạt động {activeInlineStage}</strong> thì em mới được phép truy cập hoạt
                        động này!
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {([1, 2, 3, 4] as const).some((s) => currentPeriodUnlocked[s]) && (
                          <button
                            type="button"
                            onClick={() => {
                              const firstOpen = ([1, 2, 3, 4] as const).find(
                                (s) => currentPeriodUnlocked[s]
                              );
                              if (firstOpen) setActiveInlineStage(firstOpen);
                            }}
                            className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
                          >
                            Chuyển tới Hoạt động đã được Giáo viên mở khóa
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* INLINE STAGE 1: KHỞI ĐỘNG (VIDEO TƯƠNG TÁC + Ô CHỮ TRANH BÍ MẬT + ĐÁM MÂY TỪ KHÓA) */}
                      {activeInlineStage === 1 && (
                        <div className="flex flex-col gap-space-lg">
                          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-headline-sm font-black">
                                  1
                                </span>
                                <div>
                                  <h3 className="font-headline-md text-headline-md text-on-surface">
                                    Khởi động
                                  </h3>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full flex-wrap">
                                {[
                                  { id: 'scenario', label: 'Tình huống' },
                                  { id: 'video', label: 'Video' },
                                  { id: 'crossword', label: 'Ô chữ' },
                                ].map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() =>
                                      setStage1SubTab(
                                        t.id as 'video' | 'crossword' | 'scenario'
                                      )
                                    }
                                    className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                                      stage1SubTab === t.id
                                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {stage1SubTab === 'video' && (
                              <div className="flex flex-col gap-space-md">
                                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-inverse-surface p-space-lg flex flex-col justify-between text-inverse-on-surface">
                                  <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold">
                                      Điểm dừng tương tác 00:45 • +15 XP
                                    </span>
                                    <span className="font-label-sm text-label-sm text-tertiary-fixed">
                                      Khối {selectedGrade} • Tiết {currentPeriodSpec.period}
                                    </span>
                                  </div>

                                  <div className="bg-surface-container-lowest text-on-surface p-space-md rounded-xl max-w-2xl mx-auto w-full shadow-2xl flex flex-col gap-space-sm">
                                    <p className="font-headline-sm text-headline-sm text-on-surface">
                                      Câu hỏi dừng video:{' '}
                                      {currentBlueprint.stage1.videoStops[0]?.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {[
                                        {
                                          id: 'A',
                                          text:
                                            currentBlueprint.stage1.videoStops[0]?.answer ||
                                            'Xử lý dữ liệu chính xác và an toàn',
                                          correct: true,
                                        },
                                        {
                                          id: 'B',
                                          text: 'Bỏ qua dữ liệu và không cần kiểm chứng thông tin',
                                          correct: false,
                                        },
                                      ].map((opt) => (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedVideoQuizOpt(opt.id);
                                            if (opt.correct) {
                                              onAwardXp(15);
                                              onShowToast(
                                                'Chính xác! Em nhận được +15 XP từ Video tương tác Khởi động!'
                                              );
                                            }
                                          }}
                                          className={`p-3 rounded-lg text-left font-body-sm text-body-sm flex items-center gap-2 cursor-pointer ${
                                            selectedVideoQuizOpt === opt.id
                                              ? opt.correct
                                                ? 'bg-tertiary-fixed text-on-tertiary-container font-bold ring-2 ring-tertiary'
                                                : 'bg-error-container text-on-error-container'
                                              : 'bg-surface-container-low hover:bg-surface-container'
                                          }`}
                                        >
                                          <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                                            {opt.id}
                                          </span>
                                          <span>{opt.text}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-xs opacity-90">
                                    <span>00:45 / 03:00</span>
                                    <span>2 Điểm dừng câu hỏi tương tác</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {stage1SubTab === 'crossword' && (
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                                <div className="lg:col-span-7 flex flex-col gap-2">
                                  {currentBlueprint.stage1.crosswordClues.map((c) => {
                                    const isSolved = solvedClueIds.includes(c.id);
                                    return (
                                      <div
                                        key={c.id}
                                        className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1.5"
                                      >
                                        <span className="font-label-md text-label-md text-on-surface font-bold">
                                          Hàng ngang {c.rowNumber}: {c.clue}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={
                                              isSolved ? c.answer : clueInputs[c.id] || ''
                                            }
                                            onChange={(e) =>
                                              setClueInputs((prev) => ({
                                                ...prev,
                                                [c.id]: e.target.value.toUpperCase(),
                                              }))
                                            }
                                            placeholder={`Nhập từ khóa (${c.answer.length} chữ cái)...`}
                                            className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSolvedClueIds((prev) =>
                                                prev.includes(c.id) ? prev : [...prev, c.id]
                                              );
                                              onAwardXp(10);
                                              onShowToast(
                                                `Đã mở mảnh ghép ${c.rowNumber}: ${c.answer} (+10 XP)!`
                                              );
                                            }}
                                            className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold cursor-pointer"
                                          >
                                            {isSolved ? 'Đã mở ✓' : 'Mở mảnh ghép'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="lg:col-span-5 rounded-xl bg-secondary-fixed/40 p-space-md flex flex-col justify-between">
                                  <h4 className="font-headline-sm text-headline-sm text-secondary">
                                    {currentBlueprint.stage1.secretPictureTitle}
                                  </h4>
                                  <p className="font-body-sm text-body-sm text-on-surface mt-2">
                                    {currentBlueprint.stage1.secretPictureMeaning}
                                  </p>
                                  <span className="mt-3 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-container font-label-sm text-label-sm font-bold self-start">
                                    Đã lật mở {solvedClueIds.length} /{' '}
                                    {currentBlueprint.stage1.crosswordClues.length} mảnh ghép
                                  </span>
                                </div>
                              </div>
                            )}

                            {stage1SubTab === 'scenario' && (
                              <div className="flex flex-col gap-space-md">
                                <WarmupEssayActivity
                                  title={activeWorksheet.stage1?.title ?? ''}
                                  scenario={activeWorksheet.stage1?.scenario ?? ''}
                                  question={activeWorksheet.stage1?.question ?? ''}
                                  sampleAnswer={activeWorksheet.stage1?.sampleAnswer}
                                  points={activeWorksheet.stage1?.points ?? 1.0}
                                  onSubmit={() => {
                                    onAwardXp(30);
                                    onShowToast('✓ Đã ghi nhận câu trả lời Tự luận Khởi động (+30 XP)!');
                                  }}
                                />

                                {/* Đồng bộ Đám mây từ khóa lớp học */}
                                <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-[16px]">cloud</span>
                                      Đám mây từ khóa trực tiếp cả lớp (Lớp {currentStudent.classId})
                                    </span>
                                    <span className="text-xs text-on-surface-variant font-medium">Gửi từ khóa để hiển thị trên bảng từ lớp</span>
                                  </div>
                                  <form
                                    onSubmit={handleSubmitStage1Word}
                                    className="flex flex-col sm:flex-row gap-2"
                                  >
                                    <input
                                      type="text"
                                      value={wordCloudInput}
                                      onChange={(e) => setWordCloudInput(e.target.value)}
                                      placeholder="Gửi từ khóa ngắn vào đám mây từ..."
                                      className="flex-1 px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/30"
                                    />
                                    <button
                                      type="submit"
                                      className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold cursor-pointer"
                                    >
                                      Gửi từ khóa (+10 XP)
                                    </button>
                                  </form>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {wordCloudList.map((item, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold shadow-xs"
                                      >
                                        #{item.word} ({item.count})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t border-outline-variant/20 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setActiveInlineStage(2)}
                                className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Sang Khám phá</span>
                                <span className="material-symbols-outlined text-[18px]">
                                  arrow_forward
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ================= HOẠT ĐỘNG 2: KHÁM PHÁ ================= */}
                      {activeInlineStage === 2 && (
                        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-lg">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                            <div className="flex items-center gap-2">
                              <span className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-headline-sm font-black">
                                2
                              </span>
                              <div>
                                <h3 className="font-headline-md text-headline-md text-on-surface">
                                  Khám phá
                                </h3>
                                <span className="text-xs text-on-surface-variant font-medium">Phiếu học tập điện tử (4.0 điểm)</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setShowWorksheetScannerModal(true)}
                                className="px-3.5 py-1.5 rounded-full bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                title="Chụp hoặc tải ảnh phiếu học tập giấy, AI tự động nhận diện và điền câu trả lời"
                              >
                                <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                                <span>📷 Quét Phiếu AI (OCR)</span>
                              </button>
                              {worksheetSubmitted && (
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                  ✓ Đã nộp: {(worksheetScore ?? 4.0).toFixed(2)} / 4.0 điểm
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Thanh 4 tab ngang theo đúng bố cục ảnh mẫu */}
                          <div
                            data-testid="stage2-subtabs-bar"
                            className="p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-2 lg:grid-cols-4 gap-2.5"
                          >
                            {(
                              [
                                {
                                  id: 'drag' as const,
                                  icon: 'extension',
                                  label: '1. Kéo Thả (1.0đ)',
                                },
                                {
                                  id: 'fill' as const,
                                  icon: 'edit_square',
                                  label: '2. Điền Khuyết (1.0đ)',
                                },
                                {
                                  id: 'match' as const,
                                  icon: 'account_tree',
                                  label: '3. Nối Cột (1.0đ)',
                                },
                                {
                                  id: 'short' as const,
                                  icon: 'format_list_bulleted',
                                  label: '4. Trả Lời Ngắn (1.0đ)',
                                },
                              ] as const
                            ).map((tab) => {
                              const isActive = stage2SubTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  data-testid={`stage2-tab-${tab.id}`}
                                  onClick={() => setStage2SubTab(tab.id)}
                                  className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-[#4f39f6] text-white shadow-sm'
                                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/75'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {tab.icon}
                                  </span>
                                  <span>{tab.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* 1. KÉO - THẢ MINIGAME (1.0đ) */}
                          {stage2SubTab === 'drag' && (
                            <DragDropActivity
                              title={activeWorksheet.stage2.dragDropTitle}
                              instruction={activeWorksheet.stage2.dragDropInstruction}
                              wordBank={activeWorksheet.stage2.dragDropWordBank}
                              paragraph={activeWorksheet.stage2.dragDropParagraph}
                              customQuestions={activeWorksheet.stage2.dragDropQuestions}
                              sentenceLines={activeWorksheet.stage2.dragDropSentenceLines}
                              bucketA={activeWorksheet.stage2.bucketA}
                              bucketB={activeWorksheet.stage2.bucketB}
                              dragItems={activeWorksheet.stage2.dragItems}
                              slots={dragSlots}
                              onSlotChange={(num, val) =>
                                setDragSlots((prev) => ({ ...prev, [num]: val }))
                              }
                              showAnswers={worksheetSubmitted}
                            />
                          )}

                          {/* 2. ĐIỀN KHUYẾT (1.0đ) */}
                          {stage2SubTab === 'fill' && (
                            <FillBlankActivity
                              title={activeWorksheet.stage2.fillBlankTitle}
                              instruction={activeWorksheet.stage2.fillBlankInstruction}
                              answers={fillBlankInputs}
                              onChange={(k, val) =>
                                setFillBlankInputs((prev) => ({ ...prev, [k]: val }))
                              }
                              showAnswers={worksheetSubmitted}
                              customItems={activeWorksheet.stage2.fillBlankQuestions}
                            />
                          )}

                          {/* 3. NỐI CỘT (1.0đ) */}
                          {stage2SubTab === 'match' && (
                            <MatchingActivity
                              title={activeWorksheet.stage2.matchingTitle}
                              instruction={activeWorksheet.stage2.matchingInstruction}
                              connections={matchingConnections}
                              onConnect={(aId, bId) =>
                                setMatchingConnections((prev) => ({ ...prev, [aId]: bId }))
                              }
                              onDisconnect={(aId) =>
                                setMatchingConnections((prev) => {
                                  const next = { ...prev };
                                  delete next[aId];
                                  return next;
                                })
                              }
                              showAnswers={worksheetSubmitted}
                              customPairs={activeWorksheet.stage2.matchingQuestions}
                            />
                          )}

                          {/* 4. CÂU HỎI TRẢ LỜI NGẮN (1.0đ) */}
                          {stage2SubTab === 'short' && (
                            <ShortAnswerActivity
                              answers={shortAnswers}
                              onChange={(k, val) =>
                                setShortAnswers((prev) => ({ ...prev, [k]: val }))
                              }
                              showAnswers={worksheetSubmitted}
                              customPrompt={activeWorksheet.stage2.shortAnswerPrompt}
                              customQuestions={activeWorksheet.stage2.shortAnswerQuestions}
                            />
                          )}

                          {/* Submission Footer */}
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-outline-variant/30">
                            <span className="text-sm font-bold text-tertiary">
                              {worksheetSubmitted
                                ? '✓ Phiếu học tập Hoạt động 2 (4.0đ) đã được chấm tự động và nộp lên hệ thống!'
                                : 'Hoàn thành 4 nhiệm vụ trên rồi bấm Nộp Phiếu để chấm điểm Hoạt động 2 (Thang 4.0 điểm)'}
                            </span>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  const sc = calculatePdfStage2Score();
                                  setWorksheetScore(sc);
                                  setWorksheetSubmitted(true);
                                  recordTaggedSubmission(
                                    2,
                                    'HĐ2: Phiếu học tập Khám phá',
                                    sc,
                                    4.0
                                  );
                                  const xpEarned = Math.round(sc * 25) + 20;
                                  onAwardXp(xpEarned);
                                  onShowToast(
                                    `🎉 Đã nộp Phiếu Học Tập HĐ2 [${
                                      activeLearningMode === 'IN_CLASS_LIVE'
                                        ? 'TRÊN LỚP'
                                        : `TỰ LUYỆN Ở NHÀ #${attemptCount}`
                                    }]! Đạt ${sc.toFixed(2)} / 4.0 điểm (+${xpEarned} XP)`
                                  );
                                  if (activeLearningMode === 'IN_CLASS_LIVE') {
                                    handleRequestFastFinisherChallenge();
                                  }
                                }}
                                className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md cursor-pointer hover:bg-primary/90"
                              >
                                {worksheetSubmitted
                                  ? `🔄 Chấm lại Hoạt động 2 (Lần #${attemptCount})`
                                  : `📝 Nộp Phiếu Học Tập HĐ2 (${
                                      activeLearningMode === 'IN_CLASS_LIVE'
                                        ? '🔴 Trên lớp'
                                        : '🏠 Tự luyện'
                                    })`}
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveInlineStage(3)}
                                className="px-5 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-sm cursor-pointer hover:bg-secondary/90 flex items-center gap-1"
                              >
                                <span>Sang Luyện tập</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                              </button>
                            </div>
                          </div>

                          {/* Fast-Finisher AI Cú Vàng Card when finished early in In-Class Live mode */}
                          {worksheetSubmitted && activeLearningMode === 'IN_CLASS_LIVE' && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-primary-fixed/30 border border-rose-500/30 flex flex-col gap-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-xs font-extrabold uppercase text-rose-600 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                                  <span>
                                    🦉 Trợ lý AI Cú Vàng — Hoạt động Fast-Finisher (Dành cho HS hoàn thành bài sớm trên lớp)
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={handleRequestFastFinisherChallenge}
                                  disabled={isLoadingFastFinisher}
                                  className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-bold cursor-pointer"
                                >
                                  {isLoadingFastFinisher
                                    ? 'Đang tạo câu đố...'
                                    : '⚡ Đổi câu hỏi thử thách khác'}
                                </button>
                              </div>
                              <p className="text-xs text-on-surface whitespace-pre-line leading-relaxed">
                                {fastFinisherChallenge ||
                                  'Đang tải câu hỏi thử thách nhanh từ Cú Vàng AI...'}
                              </p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={fastFinisherReplyInput}
                                  onChange={(e) => setFastFinisherReplyInput(e.target.value)}
                                  placeholder="Nhập câu trả lời nhanh của em để nhận +15 XP..."
                                  className="flex-1 px-3.5 py-2 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!fastFinisherReplyInput.trim()) return;
                                    onAwardXp(15);
                                    setFastFinisherReplyInput('');
                                    onShowToast(
                                      '🌟 Xuất sắc! Cú Vàng AI đã ghi nhận câu trả lời Fast-Finisher (+15 XP)!'
                                    );
                                  }}
                                  className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold cursor-pointer"
                                >
                                  Gửi trả lời (+15 XP)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ================= HOẠT ĐỘNG 3: LUYỆN TẬP ================= */}
                      {activeInlineStage === 3 && (
                        <div className="flex flex-col gap-5">
                          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-headline-sm font-black">
                                3
                              </span>
                              <div>
                                <h3 className="font-headline-md text-headline-md text-on-surface">
                                  Luyện tập
                                </h3>
                                <span className="text-xs text-on-surface-variant">
                                  {activeLearningMode === 'IN_CLASS_LIVE'
                                    ? '🔴 Chế độ Trên lớp: Phản xạ 25 giây & Thử thách Fast-Finisher'
                                    : '🏠 Chế độ Ở nhà: Làm lại không giới hạn & Gia sư Cú Vàng giải thích câu sai (Scaffolding)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <QuizArena25sActivity
                            learningMode={activeLearningMode}
                            lessonContext={`Khối ${selectedGrade} • ${currentPeriodSpec.lessonTitle} | YCCĐ: ${currentPeriodSpec.yccd}`}
                            questions={(
                              ((activeWorksheet as any).stage3QuizQuestions ||
                               (activeWorksheet as any).stage3Questions ||
                               []) as any[]
                            ).map((q: any) => ({
                              id: q.id,
                              level: q.question?.includes('Vận dụng')
                                ? 'Vận dụng'
                                : q.question?.includes('Thông hiểu')
                                ? 'Thông hiểu'
                                : 'Nhận biết',
                              question: q.question,
                              points: q.points ?? 0.5,
                              options: (q.options || []).map((o: any) => ({
                                letter: o.letter,
                                text: o.text,
                                isCorrect: o.isCorrect,
                              })),
                              explanation:
                                'explanation' in ((q.options || []).find((o: any) => o.isCorrect) || {})
                                  ? ((q.options || []).find((o: any) => o.isCorrect) as { explanation?: string })
                                      ?.explanation || 'Theo chuẩn kiến thức SGK Tin học GDPT 2018'
                                  : 'Theo chuẩn kiến thức SGK Tin học GDPT 2018',
                            }))}
                            onFinish={(earnedPts) => {
                              recordTaggedSubmission(
                                3,
                                'HĐ3: Đấu trường Trắc nghiệm 25s',
                                earnedPts,
                                3.0
                              );
                              const xpEarned = Math.round(earnedPts * 40);
                              onAwardXp(xpEarned);
                              onShowToast(
                                `🏆 Đã hoàn thành Đấu trường 25s [${
                                  activeLearningMode === 'IN_CLASS_LIVE'
                                    ? 'TRÊN LỚP'
                                    : `TỰ LUYỆN Ở NHÀ #${attemptCount}`
                                }]! Điểm HĐ3: ${earnedPts.toFixed(1)} / 3.0 điểm (+${xpEarned} XP)`
                              );
                            }}
                            onReadyStart={() => {
                              onShowToast('🚀 Đã bắt đầu tính giờ Đấu trường Luyện tập! Chúc em đạt kết quả cao!');
                            }}
                            onShowToast={onShowToast}
                          />

                          {/* Cây thư mục Google Drive Theo Khối Lớp cho Tiết Thực Hành */}
                          <GoogleDrivePracticalActivity
                            grade={selectedGrade}
                            classId={currentStudent.classId}
                            period={currentPeriodSpec.period}
                            lessonTitle={currentPeriodSpec.lessonTitle}
                            studentId={currentStudent.id}
                            studentName={currentStudent.name}
                            studentUsername={currentStudent.username || currentStudent.id}
                            folderName={`TH_Tiet${currentPeriodSpec.period}_${currentStudent.classId}`}
                            drivePath={`Google Drive / Khối ${selectedGrade} / Lớp ${currentStudent.classId} / ${currentPeriodSpec.lessonTitle}`}
                            existingSubmissions={
                              liveSession?.practicalSubmissions || INITIAL_PRACTICAL_SUBMISSIONS
                            }
                            onSubmitProduct={handleSubmitPracticalDriveFile}
                          />

                          <div className="flex justify-end p-3 bg-surface-container-lowest rounded-2xl shadow-xs">
                            <button
                              type="button"
                              onClick={() => setActiveInlineStage(4)}
                              className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-sm cursor-pointer hover:bg-secondary/90 flex items-center gap-1.5"
                            >
                              <span>Sang Vận dụng</span>
                              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ================= HOẠT ĐỘNG 4: VẬN DỤNG ================= */}
                      {activeInlineStage === 4 && (
                        <div className="flex flex-col gap-5">
                          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-headline-sm font-black">
                                4
                              </span>
                              <h3 className="font-headline-md text-headline-md text-on-surface">
                                Vận dụng
                              </h3>
                            </div>
                          </div>
                          <ApplicationThreeTasksActivity
                            deepAnalysis={(activeWorksheet as any)?.stage4?.deepAnalysis || { title: '', prompt: '', guideAnswer: '', points: 1.0 }}
                            practicalTask={(activeWorksheet as any)?.stage4?.practicalTask || { title: '', prompt: '', guideAnswer: '', points: 1.0 }}
                            extendedTask={(activeWorksheet as any)?.stage4?.extendedTask || { title: '', prompt: '', guideAnswer: '', points: 1.0 }}
                            answers={stage4Answers}
                            onAnswerChange={(field, val) =>
                              setStage4Answers((prev) => ({ ...prev, [field]: val }))
                            }
                            isSubmitted={stage4Submitted}
                            onSubmit={() => {
                              const stage4Obj = (activeWorksheet as any)?.stage4;
                              const eval1 = evaluateAnswerBySuggestedPercentage(
                                stage4Answers.deepAnalysis,
                                stage4Obj?.deepAnalysis?.guideAnswer || '',
                                stage4Obj?.deepAnalysis?.points || 1.0
                              );
                              const eval2 = evaluateAnswerBySuggestedPercentage(
                                stage4Answers.practicalTask,
                                stage4Obj?.practicalTask?.guideAnswer || '',
                                stage4Obj?.practicalTask?.points || 1.0
                              );
                              const eval3 = evaluateAnswerBySuggestedPercentage(
                                stage4Answers.extendedTask,
                                stage4Obj?.extendedTask?.guideAnswer || '',
                                stage4Obj?.extendedTask?.points || 1.0
                              );
                              const totalPts =
                                Math.round(
                                  (eval1.earnedPoints + eval2.earnedPoints + eval3.earnedPoints) *
                                    100
                                ) / 100;
                              const avgPct = Math.round(
                                (eval1.matchPercentage + eval2.matchPercentage + eval3.matchPercentage) / 3
                              );
                              setStage4Submitted(true);
                              recordTaggedSubmission(
                                4,
                                'HĐ4: Vận dụng thực tiễn (3 Bài)',
                                totalPts,
                                3.0
                              );
                              onAwardXp(Math.max(40, Math.round(totalPts * 35)));
                              onShowToast(
                                `🎉 Đã hoàn thành Hoạt động 4 [${
                                  activeLearningMode === 'IN_CLASS_LIVE'
                                    ? 'TRÊN LỚP'
                                    : `TỰ LUYỆN Ở NHÀ #${attemptCount}`
                                }]: Đạt ${avgPct}% (${totalPts.toFixed(2)} / 3.0 điểm)!`
                              );
                            }}
                          />

                          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                              <span className="font-bold text-on-surface text-sm">
                                {stage4Submitted
                                  ? `✓ Đã hoàn thành bài Vận dụng (${
                                      activeLearningMode === 'IN_CLASS_LIVE'
                                        ? '🔴 Trên lớp'
                                        : '🏠 Tự luyện ở nhà'
                                    })`
                                  : 'Hoàn thành các nhiệm vụ vận dụng'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setStage4Submitted(true);
                                recordTaggedSubmission(
                                  4,
                                  'HĐ4: Vận dụng thực tiễn (3 Bài)',
                                  3.0,
                                  3.0
                                );
                                onAwardXp(100);
                                confetti({
                                  particleCount: 150,
                                  spread: 70,
                                  origin: { y: 0.6 }
                                });
                                setAchievementToast({title: 'Hoàn thành bài Vận dụng', stars: 5});
                                onShowToast(
                                  `Đã nộp bài Vận dụng [${
                                    activeLearningMode === 'IN_CLASS_LIVE'
                                      ? 'TRÊN LỚP'
                                      : `TỰ LUYỆN Ở NHÀ #${attemptCount}`
                                  }]!`
                                );
                              }}
                              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md cursor-pointer hover:bg-primary/90 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">send</span>
                              <span>{stage4Submitted ? '✓ Đã nộp bài' : 'Nộp bài Vận dụng'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= MENU 2: TRỢ LÝ AI CÚ VÀNG (GEMINI MULTI-TURN CHATBOT) ================= */}
          {activeView === 'tro-ly-ai-cu-vang' && (
            <div className="flex flex-col w-full gap-space-lg pb-space-2xl max-w-5xl mx-auto">
              <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">
                {/* Chatbot Header & Model Mode Selector */}
                <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-sm border-b border-outline-variant/20">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[32px]">smart_toy</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="font-headline-md text-headline-md text-on-surface">
                          Trợ Lý AI Cú Vàng • Gemini Chatbot Sư Phạm
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-container font-label-sm text-label-sm font-bold">
                          Multi-Turn AI
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Đang đồng hành cùng <strong>{currentStudent.name}</strong> và{' '}
                        <strong>{currentStudent.partnerName || 'Bạn cùng bàn'}</strong> • Bối cảnh:{' '}
                        <strong className="text-primary">
                          Khối {selectedGrade} - {currentPeriodSpec.lessonTitle}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Gemini Model Selector */}
                  <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => setChatModelMode('standard')}
                      className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                        chatModelMode === 'standard'
                          ? 'bg-primary text-on-primary font-bold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      ✨ Chuẩn Sư Phạm (gemini-3.8-flash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatModelMode('fast')}
                      className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                        chatModelMode === 'fast'
                          ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      ⚡ Phản Hồi Siêu Tốc (gemini-3.1-flash-lite)
                    </button>
                  </div>
                </div>

                {/* Quick Context & Dual-Mode Starter Prompt Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Vai trò Sư phạm ({activeLearningMode === 'IN_CLASS_LIVE' ? '🔴 Trên lớp' : '🏠 Ở nhà'}):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      sendGeminiChatMessage(
                        `Em đã hoàn thành bài sớm trên lớp trong ${currentPeriodSpec.lessonTitle}! Hãy đặt cho em 1 câu hỏi thử thách nhanh (Fast-finisher) để nhận +15 XP!`,
                        'fast_finisher'
                      )
                    }
                    className="px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-label-sm text-label-sm font-bold transition-colors cursor-pointer"
                  >
                    🔴 Thử thách Fast-Finisher (Trên lớp • +15 XP)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      sendGeminiChatMessage(
                        `Hãy đóng vai Gia sư hướng dẫn (Scaffolding) giải thích tại sao các phương án gây nhiễu trong ${currentPeriodSpec.lessonTitle} lại sai và gợi mở phương pháp giải quyết vấn đề thực tiễn theo YCCĐ GDPT 2018 & Khung AI QĐ 3439.`,
                        'explain_wrong_quiz'
                      )
                    }
                    className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-label-sm text-label-sm font-bold transition-colors cursor-pointer"
                  >
                    🏠 Gia sư Scaffolding giải thích câu sai &amp; Gợi mở (Ở nhà)
                  </button>
                  {[
                    `Giải thích dễ hiểu trọng tâm ${currentPeriodSpec.lessonTitle}`,
                    'Hướng dẫn phương pháp giải bài tập Vận dụng theo YCCĐ 2018 & QĐ 3439',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendGeminiChatMessage(chip)}
                      className="px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-primary-fixed text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
                    >
                      💬 {chip}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setTutorMessages([
                        {
                          role: 'model',
                          text: `🦉 Đã làm mới cuộc trò chuyện! Mình sẵn sàng giải đáp mọi thắc mắc của **${currentStudent.name}** về **Khối ${selectedGrade} • ${currentPeriodSpec.lessonTitle}**.`,
                          model:
                            chatModelMode === 'fast'
                              ? 'gemini-3.1-flash-lite'
                              : 'gemini-3.8-flash',
                          timestamp: 'Vừa xong',
                        },
                      ])
                    }
                    className="ml-auto px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-error font-label-sm text-label-sm cursor-pointer"
                  >
                    Làm mới hội thoại
                  </button>
                </div>

                {/* Scrollable Multi-Turn Conversation Thread */}
                <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl min-h-[380px] max-h-[460px] overflow-y-auto">
                  {tutorMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-space-md rounded-2xl max-w-[85%] flex flex-col gap-1 ${
                        m.role === 'model'
                          ? 'bg-surface-container-lowest text-on-surface self-start shadow-xs border border-outline-variant/20'
                          : 'bg-primary text-on-primary self-end shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] opacity-80">
                        <span className="font-bold">
                          {m.role === 'model'
                            ? `🦉 Cú Vàng AI (${m.model || 'gemini-3.8-flash'})`
                            : `👤 ${currentStudent.name}`}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="font-body-md text-body-md whitespace-pre-line leading-relaxed">
                        {m.text}
                      </p>
                    </div>
                  ))}
                  {tutorLoading && (
                    <div className="p-3 rounded-xl bg-surface-container-lowest text-secondary font-label-sm text-label-sm self-start animate-pulse flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        autorenew
                      </span>
                      <span>
                        🦉 Cú Vàng AI đang suy nghĩ câu trả lời sư phạm cho {currentStudent.name}...
                      </span>
                    </div>
                  )}
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendTutorForm} className="flex gap-space-sm">
                  <input
                    type="text"
                    aria-label="Nhập câu hỏi cho Trợ lý Cú Vàng AI"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder={`Hỏi Cú Vàng AI về ${currentPeriodSpec.lessonTitle}, thuật toán, bảng tính, an toàn số...`}
                    className="flex-1 px-space-md py-3.5 rounded-full bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={tutorLoading}
                    className="px-6 py-3.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Gửi câu hỏi</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================= MENU 3: HỒ SƠ HỌC SINH & THƯ VIỆN HUY HIỆU (FLIP CARDS) ================= */}
          {activeView === 'huy-hieu' && (
            <div className="flex flex-col w-full gap-space-lg pb-space-2xl max-w-5xl mx-auto">
              {/* Profile Overview Card */}
              <div className="bg-gradient-to-r from-sky-50 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-500 p-1 shadow-lg">
                      <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center font-black text-2xl text-slate-800">
                        {currentStudent.name.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-sm font-bold text-xs">
                      ★
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {currentStudent.name}
                      </h1>
                      <span className="px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-xs">
                        Lớp {currentStudent.classId}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                        Khối {selectedGrade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Mã học sinh: <strong className="font-mono text-slate-700">{currentStudent.id}</strong> • Bạn cùng máy: <strong className="text-slate-800">{currentStudent.partnerName || 'Chưa ghép cặp'}</strong>
                    </p>
                  </div>
                </div>

                {/* Quick Summary Pill Stats */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                    <span className="text-[11px] text-slate-500 font-semibold">Tổng điểm XP</span>
                    <span className="text-lg font-black text-sky-700">{currentStudent.xp.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                    <span className="text-[11px] text-slate-500 font-semibold">Ngôi sao</span>
                    <span className="text-lg font-black text-amber-500">⭐ {currentStudent.stars}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-[90px]">
                    <span className="text-[11px] text-slate-500 font-semibold">Hạng Lớp</span>
                    <span className="text-lg font-black text-emerald-600">#{classRank}</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Flip-Card Badge Library */}
              <BadgeLibraryPanel
                currentStudent={currentStudent}
                onShowToast={onShowToast}
                title="Bảng Điều Khiển: Thư Viện Huy Hiệu"
                subtitle="Hiệu ứng lật thẻ 3D (Flip Card): Chạm hoặc nhấp vào bất kỳ huy hiệu nào để lật sang mặt sau và xem chi tiết yêu cầu, điểm XP, số sao còn thiếu và mẹo sư phạm để mở khóa!"
              />
            </div>
          )}

          {/* ================= MENU 5: NHẬT KÝ HOẠT ĐỘNG (ACTIVITY FEED) ================= */}
          {activeView === 'nhat-ky-hoat-dong' && (
            <div className="flex flex-col w-full gap-space-lg pb-space-2xl max-w-4xl mx-auto">
              <StudentActivityFeed
                currentStudent={currentStudent}
                completedPeriods={
                  liveSession?.learnedPeriodsByStudent?.[currentStudent.id]
                    ? [1]
                    : [1]
                }
              />
            </div>
          )}

          {/* ================= MENU 4: KẾT QUẢ HỌC TẬP & BẢNG XẾP HẠNG (CÁ NHÂN • CẢ LỚP • CẢ KHỐI) ================= */}
          {activeView === 'bang-xep-hang' && (
            <div className="flex flex-col w-full gap-space-lg pb-space-2xl max-w-5xl mx-auto">
              <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 flex flex-col gap-6">
                {/* Header + Back Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[32px]">analytics</span>
                    </div>
                    <div>
                      <h1 className="font-headline-md text-headline-md text-on-surface font-black">
                        Kết Quả Học Tập &amp; Xếp Hạng (Cá Nhân • Lớp • Khối)
                      </h1>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Theo dõi điểm số, xếp loại Thông tư 22, điểm XP và vị trí xếp hạng của {currentStudent.name} ({currentStudent.classId} • Khối {selectedGrade})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onChangeView('trang-chu')}
                    className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Quay lại Bài học</span>
                  </button>
                </div>

                {/* 3 Scope Tabs: 1. Kết quả Cá nhân | 2. Kết quả cả Lớp | 3. Kết quả cả Khối */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit">
                  <button
                    type="button"
                    onClick={() => setStudentResultScope('ca-nhan')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      studentResultScope === 'ca-nhan'
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span>1. Kết quả Cá nhân ({currentStudent.name})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentResultScope('lop')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      studentResultScope === 'lop'
                        ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">groups</span>
                    <span>2. Kết quả cả Lớp {currentStudent.classId}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentResultScope('khoi')}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      studentResultScope === 'khoi'
                        ? 'bg-white text-amber-700 shadow-xs border border-amber-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                    <span>3. Kết quả cả Khối {selectedGrade}</span>
                  </button>
                </div>

                {/* SCOPE 1: KẾT QUẢ CÁ NHÂN */}
                {studentResultScope === 'ca-nhan' && (() => {
                  const myScore = Number(currentStudent.avgScore || 0);
                  const myRankLabel =
                    myScore >= 8.0
                      ? 'Mức Tốt'
                      : myScore >= 6.5
                      ? 'Mức Khá'
                      : myScore >= 5.0
                      ? 'Mức Đạt'
                      : 'Chưa đạt';
                  const taughtPeriodsForMyClass =
                    liveSession?.taughtPeriodsByClass?.[currentStudent.classId] || [];

                  return (
                    <div className="flex flex-col gap-5">
                      {/* 4 Personal KPI Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                          <span className="text-xs font-bold text-emerald-700 uppercase">
                            Điểm TB Môn Tin Học
                          </span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-black text-emerald-900">
                              {myScore.toFixed(1)} <span className="text-xs font-semibold">/ 10</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                              {myRankLabel}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-1">
                          <span className="text-xs font-bold text-amber-800 uppercase">
                            Điểm Kinh Nghiệm &amp; Sao
                          </span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-black text-amber-900">
                              {currentStudent.xp.toLocaleString()} XP
                            </span>
                            <span className="text-xs font-bold text-amber-700">
                              ⭐ {currentStudent.stars} sao
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col gap-1">
                          <span className="text-xs font-bold text-sky-800 uppercase">
                            Thứ Hạng Trong Lớp {currentStudent.classId}
                          </span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-black text-sky-900">
                              Hạng #{classRank}
                            </span>
                            <span className="text-xs font-semibold text-sky-700">
                              / {sortedClass.length} HS
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col gap-1">
                          <span className="text-xs font-bold text-indigo-800 uppercase">
                            Thứ Hạng Toàn Khối {selectedGrade}
                          </span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-black text-indigo-900">
                              Hạng #{gradeRank}
                            </span>
                            <span className="text-xs font-semibold text-indigo-700">
                              / {sortedGrade.length} HS
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Personal Lesson Progress Table */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600">fact_check</span>
                            <span>Bảng Kết Quả Chi Tiết Của {currentStudent.name} (Lớp {currentStudent.classId})</span>
                          </h3>
                          <span className="text-xs font-bold text-slate-600">
                            Trạng thái bài nộp hiện tại: <strong className="text-emerald-700">{currentStudent.submissionStatus || 'Đã nộp'}</strong> • Đã học: {taughtPeriodsForMyClass.length}/29 tiết
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="py-2.5 px-3">Tiết</th>
                                <th className="py-2.5 px-3">Tên bài học (GDPT 2018)</th>
                                <th className="py-2.5 px-3">Trạng thái tiết học</th>
                                <th className="py-2.5 px-3">Điểm quy đổi</th>
                                <th className="py-2.5 px-3 text-right">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {gradePeriods.slice(0, 10).map((sp) => {
                                const isTaught = taughtPeriodsForMyClass.includes(sp.period);
                                return (
                                  <tr key={sp.period} className="hover:bg-slate-50">
                                    <td className="py-2.5 px-3 font-bold text-slate-900">
                                      Tiết {sp.period}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-800">
                                      {sp.lessonTitle}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {isTaught ? (
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                          ✓ Đã học &amp; Mở tự luyện
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                                          🔒 Chưa dạy trên lớp
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 font-black text-emerald-700">
                                      {isTaught ? `${myScore.toFixed(1)} đ` : '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button
                                        type="button"
                                        disabled={!isTaught}
                                        onClick={() => {
                                          onChangeView('trang-chu');
                                          setOpenedPeriodNumber(sp.period);
                                        }}
                                        className="px-3 py-1 rounded-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-[11px] cursor-pointer disabled:cursor-not-allowed"
                                      >
                                        {isTaught ? 'Tự luyện lại' : 'Đang khóa'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SCOPE 2: KẾT QUẢ CẢ LỚP */}
                {studentResultScope === 'lop' && (
                  <ClassLeaderboardPanel
                    currentStudent={currentStudent}
                    students={students}
                    classId={currentStudent.classId}
                    grade={selectedGrade}
                    onShowToast={onShowToast}
                    onSelectStudent={onSelectStudentAccount}
                  />
                )}

                {/* SCOPE 3: KẾT QUẢ CẢ KHỐI */}
                {studentResultScope === 'khoi' && (() => {
                  // Group by classId within this grade
                  const classIdsInGrade = Array.from(
                    new Set(sortedGrade.map((s) => s.classId))
                  ).sort();

                  return (
                    <div className="flex flex-col gap-5">
                      {/* Class Comparison Table across the Grade */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-600">bar_chart</span>
                          <span>Tổng Hợp Kết Quả Giữa Các Lớp Thuộc Khối {selectedGrade}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {classIdsInGrade.map((cid) => {
                            const clsList = sortedGrade.filter((s) => s.classId === cid);
                            const clsAvg =
                              clsList.length > 0
                                ? clsList.reduce((a, b) => a + (b.avgScore || 0), 0) / clsList.length
                                : 0;
                            const clsTotalXp = clsList.reduce((a, b) => a + (b.xp || 0), 0);
                            const isMyClass = cid === currentStudent.classId;
                            return (
                              <div
                                key={cid}
                                className={`p-4 rounded-2xl border flex flex-col gap-1 ${
                                  isMyClass
                                    ? 'bg-amber-50 border-amber-300 shadow-xs'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-black text-slate-900">
                                    Lớp {cid}
                                  </span>
                                  {isMyClass && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                                      Lớp của em
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-600">
                                  Sĩ số: <strong>{clsList.length} HS</strong> • ĐTB: <strong>{clsAvg.toFixed(2)}đ</strong>
                                </span>
                                <span className="text-xs font-bold text-sky-700 mt-1">
                                  Tổng XP lớp: {clsTotalXp.toLocaleString()} XP
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Grade Leaderboard */}
                      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                            <span>Bảng Xếp Hạng Kết Quả Toàn Khối {selectedGrade}</span>
                          </h3>
                          <span className="px-3 py-1 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
                            Hạng Khối của em: #{gradeRank} / {sortedGrade.length}
                          </span>
                        </div>

                        <div className="divide-y divide-outline-variant/15 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
                          {sortedGrade.slice(0, 20).map((st, idx) => {
                            const isMe = st.id === currentStudent.id;
                            const isTop1 = idx === 0;
                            return (
                              <div
                                key={st.id}
                                className={`p-3.5 flex items-center justify-between gap-3 ${
                                  isTop1
                                    ? 'bg-amber-50/80 border-l-4 border-amber-400'
                                    : isMe
                                    ? 'bg-secondary-fixed/30 font-bold'
                                    : 'hover:bg-surface-container-low/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                                      idx === 0
                                        ? 'bg-amber-400 text-amber-950 shadow-xs animate-pulse'
                                        : idx === 1
                                        ? 'bg-slate-300 text-slate-800'
                                        : idx === 2
                                        ? 'bg-amber-700 text-amber-100'
                                        : 'bg-surface-container text-on-surface-variant'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                                      <span>
                                        {st.name} (Lớp {st.classId}) {isMe && '(Em)'}
                                      </span>
                                      {isTop1 && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                                          👑 TOP 1 KHỐI {selectedGrade}
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-xs text-on-surface-variant">
                                      Điểm TB: <strong>{Number(st.avgScore || 0).toFixed(1)}đ</strong> • Trạng thái: {st.submissionStatus || 'Đã nộp'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold">
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {Number(st.avgScore || 0).toFixed(1)} điểm
                                  </span>
                                  <span className="flex items-center gap-1 text-amber-600">
                                    <span className="material-symbols-outlined text-[16px]">star</span>
                                    <span>{st.stars}</span>
                                  </span>
                                  <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary">
                                    {st.xp.toLocaleString()} XP
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </main>

        {/* Student Worksheet Scanner Modal (Gemini Vision OCR) */}
        <StudentWorksheetScanner
          isOpen={showWorksheetScannerModal}
          onClose={() => setShowWorksheetScannerModal(false)}
          grade={selectedGrade}
          period={currentPeriodSpec.period}
          lessonTitle={currentPeriodSpec.lessonTitle}
          onApplyExtractedData={handleApplyExtractedScannerData}
          onShowToast={onShowToast}
        />

        {/* Peer Review Modal */}
        <PeerReviewModal
          isOpen={showPeerReviewModal}
          onClose={() => setShowPeerReviewModal(false)}
          currentStudent={currentStudent}
          onShowToast={onShowToast}
        />

        {/* Achievement Toast */}
        {achievementToast && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-amber-500 text-white shadow-xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-500">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            <div>
              <p className="font-bold">Đã mở khóa huy hiệu mới!</p>
              <p className="text-sm font-medium">{achievementToast.title}</p>
              <p className="text-xs font-bold">+ {achievementToast.stars} Sao</p>
            </div>
            <button onClick={() => setAchievementToast(null)} className="ml-2 hover:bg-amber-600 rounded-full p-1">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
