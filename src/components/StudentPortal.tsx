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

export type StudentView = 'trang-chu' | 'tro-ly-ai-cu-vang';

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

  // Focus Mode (Chế độ tập trung) to minimize all non-essential UI, hide sidebars & notification banners, and focus purely on the active exercise
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Keyboard shortcut: ESC to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        onShowToast?.('Đã thoát Chế độ tập trung.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, onShowToast]);

  const handleToggleFocusMode = () => {
    if (!isFocusMode) {
      if (openedPeriodNumber === null) {
        setOpenedPeriodNumber(liveSession?.activePeriod || 1);
      }
      if (activeView !== 'trang-chu') {
        onChangeView('trang-chu');
      }
      setIsFocusMode(true);
      onShowToast?.('🎯 Đã kích hoạt Chế độ tập trung! Nhấn ESC để thoát bất cứ lúc nào.');
    } else {
      setIsFocusMode(false);
      onShowToast?.('Đã thoát Chế độ tập trung.');
    }
  };

  // Check if Teacher is currently broadcasting Live specifically to this student's Grade AND Class
  const isLiveForStudentClass = Boolean(
    liveSession?.isBroadcasting &&
      liveSession.activeGrade === selectedGrade &&
      liveSession.activeClassId === currentStudent.classId
  );

  // Check if a period was marked as taught by Teacher for this class OR marked as learned by this Student
  const isPeriodTaughtByTeacher = (period: number): boolean => {
    const taughtList = liveSession?.taughtPeriodsByClass?.[currentStudent.classId] || [];
    return taughtList.includes(period);
  };

  const isPeriodLearnedByStudent = (period: number): boolean => {
    const lessonKey = `k${selectedGrade}-tiet-${period}`;
    const learnedList = liveSession?.learnedPeriodsByStudent?.[currentStudent.id] || [];
    return learnedList.includes(lessonKey);
  };

  const isSelfStudyUnlocked = (period: number): boolean =>
    isPeriodTaughtByTeacher(period) || isPeriodLearnedByStudent(period);

  const handleToggleStudentLearnedPeriod = (period: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const lessonKey = `k${selectedGrade}-tiet-${period}`;
    const currentList = liveSession?.learnedPeriodsByStudent?.[currentStudent.id] || [];
    const alreadyLearned = currentList.includes(lessonKey);
    const nextList = alreadyLearned
      ? currentList.filter((k) => k !== lessonKey)
      : [...currentList, lessonKey];

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        learnedPeriodsByStudent: {
          ...(prev.learnedPeriodsByStudent || {}),
          [currentStudent.id]: nextList,
        },
        unlockedStagesByLesson: !alreadyLearned
          ? {
              ...prev.unlockedStagesByLesson,
              [lessonKey]: { 1: true, 2: true, 3: true, 4: true },
            }
          : prev.unlockedStagesByLesson,
      }));
    }
    onShowToast(
      !alreadyLearned
        ? `✓ Đã đánh dấu "Đã học" Tiết ${period} — Mở khóa toàn bộ Chế độ Tự luyện cho 4 hoạt động!`
        : `Đã bỏ đánh dấu "Đã học" Tiết ${period}.`
    );
  };

  const gradePeriods = getPeriodsForGrade(selectedGrade);
  const filteredPeriods =
    examFilter === 'ALL'
      ? gradePeriods
      : gradePeriods.filter((p) => p.examMilestone === examFilter);

  const currentPeriodSpec: CurriculumPeriodSpec =
    gradePeriods.find((p) => p.period === (openedPeriodNumber || 1)) || gradePeriods[0];
  const currentBlueprint = buildLessonBlueprintFromPeriod(currentPeriodSpec);
  const currentLessonKey = `k${selectedGrade}-tiet-${currentPeriodSpec.period}`;
  const customWorksheet = liveSession?.customWorksheetsByLesson?.[currentLessonKey];
  const activeWorksheet =
    customWorksheet || getDefaultWorksheetForLesson(selectedGrade, currentPeriodSpec.period);

  const currentGradeSource =
    NOTEBOOK_GRADE_SOURCES.find((g) => g.grade === selectedGrade) ||
    NOTEBOOK_GRADE_SOURCES[0];

  // Determine unlocked stages for a given (grade, period)
  const getUnlockedStagesForPeriod = (
    grade: 6 | 7 | 8 | 9,
    period: number
  ): Record<1 | 2 | 3 | 4, boolean> => {
    // If taught by teacher or learned by student -> Self-Study mode unlocks all 4 activities
    if (isSelfStudyUnlocked(period)) {
      return { 1: true, 2: true, 3: true, 4: true };
    }
    const key = `k${grade}-tiet-${period}`;
    const fromSession = liveSession?.unlockedStagesByLesson?.[key];
    // Only unlock stages 2,3,4 from live session if the teacher is broadcasting to this student's class (or already unlocked for this lesson)
    const allowLiveStages =
      !liveSession?.isBroadcasting || liveSession.activeClassId === currentStudent.classId;
    return {
      1: true, // Always unlock Stage 1 (Khởi động) for all 29 periods so students can preview ahead
      2: allowLiveStages && Boolean(fromSession?.[2]),
      3: allowLiveStages && Boolean(fromSession?.[3]),
      4: allowLiveStages && Boolean(fromSession?.[4]),
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

  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({
    data: 'Dòng chữ "Tiết 1: Tin học" viết bằng phấn trắng trên góc bảng đen',
    info: 'Giúp cả lớp biết hôm nay có tiết học Tin học để chuẩn bị sẵn sách vở và bật máy tính',
    carrier: 'Tấm bảng đen treo trang trọng ở đầu lớp học',
  });

  const [worksheetSubmitted, setWorksheetSubmitted] = useState(false);
  const [worksheetScore, setWorksheetScore] = useState<number | null>(null);

  // ================= HOẠT ĐỘNG 4: VẬN DỤNG =================
  const [stage4Submitted, setStage4Submitted] = useState(false);
  const [stage4Answers, setStage4Answers] = useState({
    deepAnalysis: '',
    practicalTask: '',
    extendedTask: '',
  });

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
    ddQuestions.forEach((dq) => {
      const slotKey = dq.slotNum ?? (dq as unknown as { slot?: number }).slot;
      if (slotKey !== undefined && dragSlots[slotKey] === dq.correctWord) {
        score += dq.points ?? 0.2;
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
    setOpenedPeriodNumber(liveSession.activePeriod);
    setActiveInlineStage(liveSession.activeStage || 1);
    onChangeView('trang-chu');
    onShowToast(
      `Đã đồng bộ vào Tiết Live của Lớp ${currentStudent.classId}: Khối ${selectedGrade} • Tiết ${liveSession.activePeriod} (Hoạt động ${liveSession.activeStage})!`
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
        {/* TOP HEADER — SWITCHES TO DISTRACTION-FREE FOCUS BAR WHEN IN FOCUS MODE */}
        {isFocusMode ? (
          <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-primary/20 shadow-md z-40 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 font-label-sm text-label-sm font-bold animate-pulse">
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                <span>CHẾ ĐỘ TẬP TRUNG</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-on-surface">
                <span className="font-headline-sm text-headline-sm font-bold">
                  Tiết {currentPeriodSpec.period}: {currentPeriodSpec.lessonTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-xs font-bold">
                  Lớp {currentStudent.classId}
                </span>
              </div>
            </div>

            {/* Quick Activity Selector Tabs for Distraction-free Jumping */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full">
              {([
                { stage: 1, label: 'Khởi động' },
                { stage: 2, label: 'Phiếu học tập (4.0đ)' },
                { stage: 3, label: 'Đấu trường 25s (3.0đ)' },
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
                    <span className="hidden lg:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Focus Mode Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label="Chuyển đổi Chế độ tối"
                className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Giao diện sáng / tối"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleToggleFocusMode}
                className="px-3.5 py-1.5 rounded-full bg-error/15 hover:bg-error/25 text-error border border-error/30 font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Thoát Chế độ tập trung (Nhấn phím ESC)"
              >
                <span className="material-symbols-outlined text-[18px]">fullscreen_exit</span>
                <span>Thoát tập trung</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant text-[10px] font-mono border border-outline-variant/30">
                  ESC
                </kbd>
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
              {/* CHẾ ĐỘ TẬP TRUNG BUTTON (ZEN / FOCUS MODE TOGGLE) */}
              <button
                type="button"
                onClick={handleToggleFocusMode}
                className="px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                title="Ẩn thông báo và menu phụ để học sinh tập trung làm bài"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  center_focus_strong
                </span>
                <span className="hidden sm:inline">Chế độ tập trung</span>
              </button>

              {/* Student Push Notification & Announcement Bell Modal */}
              <StudentNotificationBannerModal
                currentStudent={currentStudent}
                liveSession={liveSession}
                currentPeriodSpec={currentPeriodSpec}
                onOpenPeriod={(p) => setOpenedPeriodNumber(p)}
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
                onClick={onToggleDarkMode}
                aria-label="Chuyển đổi Chế độ tối"
                className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              <div className="flex items-center gap-space-sm pl-space-xs">
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
                  {/* Top Banner & Live Broadcast Highlight */}
                  <section className="relative w-full rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-container font-label-sm text-label-sm font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                            100% Tiết Học Mở Sẵn Hoạt Động 1: Khởi Động • Tự Động Mở Tự Luyện Khi Đã Học
                          </span>
                          <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                            Phân quyền Lớp {currentStudent.classId} • Khối {selectedGrade}
                          </span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                          Lộ Trình 29 Tiết Học Môn Tin Học • Khối {selectedGrade} (Lớp {currentStudent.classId})
                        </h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {currentGradeSource.description} •{' '}
                          <strong className="text-primary">
                            {currentGradeSource.examScheduleNote}
                          </strong>
                        </p>
                      </div>

                      {isLiveForStudentClass && liveSession ? (
                        <div className="bg-primary-fixed/40 border border-primary/30 rounded-xl p-space-md flex flex-col gap-2 min-w-[290px]">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-primary font-extrabold uppercase flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                              GV Đang Phát Live Lớp {currentStudent.classId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                              Khối {liveSession.activeGrade} • Tiết {liveSession.activePeriod}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleJoinTeacherLiveLesson}
                            className="w-full py-2.5 px-4 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              rocket_launch
                            </span>
                            <span>Vào Học Trực Tiếp Tiết {liveSession.activePeriod} Ngay</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md flex flex-col gap-1 min-w-[270px]">
                          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
                            Trạng thái Phát Live Lớp {currentStudent.classId}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {liveSession?.isBroadcasting
                              ? `Giáo viên đang phát Live cho Lớp ${liveSession.activeClassId} (Khối ${liveSession.activeGrade}).`
                              : 'Hiện chưa có phiên phát Live cho lớp của em.'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Authorized Grade Badge & Exam Period Filter */}
                    <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-md">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-label-md text-label-md text-on-surface-variant">
                          Lộ trình được phân quyền theo tài khoản:
                        </span>
                        <span className="px-5 py-2 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">verified_user</span>
                          <span>Học sinh Lớp {currentStudent.classId} — Lộ trình Khối {selectedGrade} (29 Tiết)</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: 'ALL', label: 'Tất cả 29 tiết' },
                          { id: 'GK1', label: 'Giữa kỳ 1 (T1–T7)' },
                          { id: 'CK1', label: 'Cuối kỳ 1 (T8–T15)' },
                          { id: 'GK2', label: 'Giữa kỳ 2 (T16–T22)' },
                          { id: 'CK2', label: 'Cuối kỳ 2 (T23–T27)' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() =>
                              setExamFilter(f.id as 'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2')
                            }
                            className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                              examFilter === f.id
                                ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* 29-Period Roadmap Cards Grid */}
                  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                    {filteredPeriods.map((spec) => {
                      const unlockedMap = getUnlockedStagesForPeriod(selectedGrade, spec.period);
                      const isLiveLesson =
                        isLiveForStudentClass && liveSession?.activePeriod === spec.period;
                      const taughtByTeacher = isPeriodTaughtByTeacher(spec.period);
                      const learnedByStudent = isPeriodLearnedByStudent(spec.period);
                      const selfStudyReady = taughtByTeacher || learnedByStudent;
                      const unlockedCount = [1, 2, 3, 4].filter(
                        (s) => unlockedMap[s as 1 | 2 | 3 | 4]
                      ).length;

                      return (
                        <div
                          key={spec.id}
                          onClick={() => {
                            setOpenedPeriodNumber(spec.period);
                            setActiveInlineStage(
                              isLiveLesson && liveSession?.activeStage
                                ? liveSession.activeStage
                                : 1
                            );
                          }}
                          className={`rounded-2xl p-space-md transition-all cursor-pointer flex flex-col justify-between gap-space-sm border-2 ${
                            isLiveLesson
                              ? 'bg-primary-fixed/25 border-primary shadow-[0_8px_24px_rgba(149,74,5,0.18)] scale-[1.01]'
                              : selfStudyReady
                              ? 'bg-tertiary-fixed/15 border-tertiary/50 shadow-sm hover:shadow-md'
                              : 'bg-surface-container-lowest border-transparent hover:border-secondary-container shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm text-headline-sm font-black shadow-xs ${
                                    isLiveLesson
                                      ? 'bg-primary text-on-primary'
                                      : selfStudyReady
                                      ? 'bg-tertiary text-on-tertiary'
                                      : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                                  }`}
                                >
                                  {spec.period}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-bold">
                                  {spec.examMilestone === 'TONG_KET'
                                    ? 'Tổng kết'
                                    : `Đợt ${spec.examMilestone}`}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                                    spec.lessonType === 'practice'
                                      ? 'bg-tertiary-fixed text-on-tertiary-container'
                                      : 'bg-secondary-fixed/60 text-secondary'
                                  }`}
                                >
                                  {spec.lessonType === 'practice' ? 'Thực hành' : 'Lý thuyết'}
                                </span>
                              </div>

                              {isLiveLesson ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold flex items-center gap-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-on-error" />
                                  ĐANG HỌC LIVE ({currentStudent.classId})
                                </span>
                              ) : selfStudyReady ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold">
                                  {taughtByTeacher ? 'GV Đã dạy' : 'Đã học'} • Mở Tự luyện ✓
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed/70 text-on-tertiary-container font-label-sm text-label-sm font-bold">
                                  Mở Khởi động ✓
                                </span>
                              )}
                            </div>

                            <div>
                              <span className="font-label-sm text-label-sm text-secondary uppercase font-bold block">
                                {spec.topic}
                              </span>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5 line-clamp-2">
                                {spec.lessonTitle}
                              </h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                                {spec.yccd}
                              </p>
                            </div>
                          </div>

                          {/* 4 Activity Status Pills & Self-Study Toggle */}
                          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              {([1, 2, 3, 4] as const).map((stNum) => {
                                const isOpen = unlockedMap[stNum];
                                return (
                                  <span
                                    key={stNum}
                                    title={`Hoạt động ${stNum}: ${isOpen ? 'Đã mở khóa' : 'Chờ GV mở'}`}
                                    className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] flex items-center gap-0.5 ${
                                      isOpen
                                        ? 'bg-tertiary-fixed text-on-tertiary-container font-bold'
                                        : 'bg-surface-container text-on-surface-variant opacity-70'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[11px]">
                                      {isOpen ? 'lock_open' : 'lock'}
                                    </span>
                                    HĐ{stNum}
                                  </span>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleToggleStudentLearnedPeriod(spec.period, e)}
                                className={`px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold cursor-pointer transition-all ${
                                  learnedByStudent
                                    ? 'bg-tertiary text-on-tertiary'
                                    : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-fixed'
                                }`}
                              >
                                {learnedByStudent ? '✓ Đã học (Tự luyện)' : '+ Đánh dấu Đã học'}
                              </button>
                              <span className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-0.5">
                                <span>Vào ({unlockedCount}/4)</span>
                                <span className="material-symbols-outlined text-[15px]">
                                  arrow_forward
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </section>
                </>
              ) : (
                /* CASE B: TRANG LỘ TRÌNH HỌC TẬP CỦA TIẾT HỌC (SERPENTINE ROADMAP + INLINE STAGE WORKSPACE BELOW) */
                <div className="flex flex-col gap-space-lg">
                  {/* Top Bar: Back to 29-Period Roadmap + Lesson Metadata */}
                  <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm">
                      <button
                        type="button"
                        onClick={() => setOpenedPeriodNumber(null)}
                        className="px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        <span>Quay lại Lộ trình 29 tiết học (Khối {selectedGrade} • Lớp {currentStudent.classId})</span>
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Focus Mode button in Lesson Top Bar */}
                        <button
                          type="button"
                          onClick={handleToggleFocusMode}
                          className="px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Ẩn thông báo và menu điều hướng phụ để học sinh tập trung làm bài"
                        >
                          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                          <span>{isFocusMode ? 'Thoát tập trung (ESC)' : '🎯 Chế độ tập trung'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStudentLearnedPeriod(currentPeriodSpec.period)}
                          className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold cursor-pointer flex items-center gap-1 ${
                            isSelfStudyUnlocked(currentPeriodSpec.period)
                              ? 'bg-tertiary text-on-tertiary shadow-xs'
                              : 'bg-surface-container-low text-on-surface hover:bg-secondary-fixed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isSelfStudyUnlocked(currentPeriodSpec.period) ? 'task_alt' : 'check_circle'}
                          </span>
                          <span>
                            {isSelfStudyUnlocked(currentPeriodSpec.period)
                              ? '✓ Đã học / Đã dạy (Đang mở Chế độ Tự luyện)'
                              : 'Đánh dấu Đã học để mở khóa Tự luyện'}
                          </span>
                        </button>
                        <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                          Khối {selectedGrade} • Lớp {currentStudent.classId}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                      <div className="flex flex-col gap-1">
                        <h1 className="font-headline-lg text-headline-lg text-on-surface">
                          {currentPeriodSpec.lessonTitle}
                        </h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          <strong>Mục tiêu cần đạt:</strong> {currentPeriodSpec.yccd}
                        </p>
                      </div>

                      {/* Quick period prev/next switcher */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={currentPeriodSpec.period <= 1}
                          onClick={() =>
                            setOpenedPeriodNumber((p) => Math.max(1, (p || 1) - 1))
                          }
                          className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm disabled:opacity-40 cursor-pointer"
                        >
                          ← Tiết trước
                        </button>
                        <span className="font-label-md text-label-md text-primary font-bold">
                          Tiết {currentPeriodSpec.period} / 29
                        </span>
                        <select
                          value={currentPeriodSpec.period}
                          onChange={(e) => setOpenedPeriodNumber(Number(e.target.value))}
                          className="px-3 py-1.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold cursor-pointer"
                        >
                          {gradePeriods.map((p) => (
                            <option key={p.period} value={p.period}>
                              Chuyển nhanh: {p.lessonTitle}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={currentPeriodSpec.period >= 29}
                          onClick={() =>
                            setOpenedPeriodNumber((p) => Math.min(29, (p || 1) + 1))
                          }
                          className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm disabled:opacity-40 cursor-pointer"
                        >
                          Tiết tiếp →
                        </button>
                      </div>
                    </div>

                    {/* DUAL-MODE STATUS BANNER & AUTO-SAVE CROSS-DEVICE RESUME BAR */}
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
                  </div>

                  {/* SERPENTINE 4-HOẠT-ĐỘNG LEARNING ROADMAP (CONDENSED IN FOCUS MODE) */}
                  {isFocusMode ? (
                    <div className="bg-surface-container-lowest border border-primary/20 rounded-xl px-5 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          Đang tập trung làm: Hoạt động {activeInlineStage} • {
                            activeInlineStage === 1
                              ? 'Khởi động'
                              : activeInlineStage === 2
                              ? 'Phiếu học tập Khám phá (4.0 điểm)'
                              : activeInlineStage === 3
                              ? 'Đấu trường Trắc nghiệm 25s (3.0 điểm)'
                              : 'Vận dụng & Mở rộng (3.0 điểm)'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant hidden sm:inline">
                          Các thông báo & menu phụ đã được ẩn
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFocusMode(false);
                            onShowToast?.('Đã thoát Chế độ tập trung.');
                          }}
                          className="text-xs text-error hover:underline font-bold flex items-center gap-1 cursor-pointer bg-error/10 px-3 py-1 rounded-full"
                        >
                          <span className="material-symbols-outlined text-[14px]">fullscreen_exit</span>
                          Thoát tập trung (ESC)
                        </button>
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
                                {isUnlocked ? node.subtitle : 'Chờ GV mở khóa'}
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
                        Hoạt động {activeInlineStage} đang chờ Giáo viên mở khóa trực tiếp
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                        Tất cả 29 tiết học đều mở sẵn <strong>Hoạt động 1: Khởi động</strong> để em tìm
                        hiểu trước. Khi Thầy Đỗ Mạnh Trường phát Live mở khóa{' '}
                        <strong>Hoạt động {activeInlineStage}</strong> của tiết này trên Cổng Giáo Viên,
                        nội dung sẽ lập tức hiển thị tại đây!
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveInlineStage(1)}
                          className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
                        >
                          Vào học Hoạt động 1: Khởi động ngay
                        </button>
                        {onUpdateLiveSession && (
                          <button
                            type="button"
                            onClick={() => {
                              const key = `k${selectedGrade}-tiet-${currentPeriodSpec.period}`;
                              onUpdateLiveSession((prev) => ({
                                ...prev,
                                unlockedStagesByLesson: {
                                  ...prev.unlockedStagesByLesson,
                                  [key]: {
                                    ...(prev.unlockedStagesByLesson[key] || {
                                      1: true,
                                      2: false,
                                      3: false,
                                      4: false,
                                    }),
                                    [activeInlineStage]: true,
                                  },
                                },
                              }));
                              onShowToast(
                                `Đã đồng bộ mở khóa Hoạt động ${activeInlineStage} cho ${currentPeriodSpec.lessonTitle}!`
                              );
                            }}
                            className="px-5 py-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold shadow-sm cursor-pointer"
                          >
                            🔓 Mở khóa nhanh Hoạt động {activeInlineStage} (Chế độ tự luyện)
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
                                            placeholder={`Gợi ý: ${c.answer.length} chữ cái (${c.answer})`}
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
                              <h3 className="font-headline-md text-headline-md text-on-surface">
                                Khám phá
                              </h3>
                            </div>
                            {worksheetSubmitted && (
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                ✓ Đã nộp: {(worksheetScore ?? 4.0).toFixed(2)} / 4.0 điểm
                              </span>
                            )}
                          </div>

                          {/* 1. KÉO - THẢ (1.0đ) */}
                          <DragDropActivity
                            title={activeWorksheet.stage2.dragDropTitle}
                            instruction={activeWorksheet.stage2.dragDropInstruction}
                            wordBank={activeWorksheet.stage2.dragDropWordBank}
                            paragraph={activeWorksheet.stage2.dragDropParagraph}
                            customQuestions={activeWorksheet.stage2.dragDropQuestions}
                            sentenceLines={activeWorksheet.stage2.dragDropSentenceLines}
                            slots={dragSlots}
                            onSlotChange={(num, val) =>
                              setDragSlots((prev) => ({ ...prev, [num]: val }))
                            }
                            showAnswers={worksheetSubmitted}
                          />

                          {/* 2. ĐIỀN KHUYẾT (1.0đ) */}
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

                          {/* 3. NỐI CỘT (1.0đ) */}
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

                          {/* 4. CÂU HỎI TRẢ LỜI NGẮN (1.0đ) */}
                          <ShortAnswerActivity
                            answers={shortAnswers}
                            onChange={(k, val) =>
                              setShortAnswers((prev) => ({ ...prev, [k]: val }))
                            }
                            showAnswers={worksheetSubmitted}
                            customPrompt={activeWorksheet.stage2.shortAnswerPrompt}
                            customQuestions={activeWorksheet.stage2.shortAnswerQuestions}
                          />

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
                              activeWorksheet.stage3QuizQuestions || INITIAL_MINIGAME_QUESTIONS
                            ).map((q) => ({
                              id: q.id,
                              level: q.question.includes('Vận dụng')
                                ? 'Vận dụng'
                                : q.question.includes('Thông hiểu')
                                ? 'Thông hiểu'
                                : 'Nhận biết',
                              question: q.question,
                              points: q.points ?? 0.5,
                              options: q.options.map((o) => ({
                                letter: o.letter,
                                text: o.text,
                                isCorrect: o.isCorrect,
                              })),
                              explanation:
                                'explanation' in (q.options.find((o) => o.isCorrect) || {})
                                  ? (q.options.find((o) => o.isCorrect) as { explanation?: string })
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
                            deepAnalysis={activeWorksheet.stage4?.deepAnalysis}
                            practicalTask={activeWorksheet.stage4?.practicalTask}
                            extendedTask={activeWorksheet.stage4?.extendedTask}
                            answers={stage4Answers}
                            onAnswerChange={(field, val) =>
                              setStage4Answers((prev) => ({ ...prev, [field]: val }))
                            }
                            isSubmitted={stage4Submitted}
                            onSubmit={() => {
                              const eval1 = evaluateAnswerBySuggestedPercentage(
                                stage4Answers.deepAnalysis,
                                activeWorksheet.stage4?.deepAnalysis?.guideAnswer || '',
                                activeWorksheet.stage4?.deepAnalysis?.points || 1.0
                              );
                              const eval2 = evaluateAnswerBySuggestedPercentage(
                                stage4Answers.practicalTask,
                                activeWorksheet.stage4?.practicalTask?.guideAnswer || '',
                                activeWorksheet.stage4?.practicalTask?.points || 1.0
                              );
                              const eval3 = evaluateAnswerBySuggestedPercentage(
                                stage4Answers.extendedTask,
                                activeWorksheet.stage4?.extendedTask?.guideAnswer || '',
                                activeWorksheet.stage4?.extendedTask?.points || 1.0
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
        </main>

        {/* Floating Focus Mode Helper Badge with Quick ESC Exit */}
        {isFocusMode && (
          <aside
            aria-label="Thoát chế độ tập trung"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-surface-container-lowest/95 backdrop-blur-md border border-primary/30 rounded-full px-4 py-2 shadow-2xl text-on-surface"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
            <span className="font-label-sm text-xs font-bold text-on-surface">
              Chế độ tập trung đang bật
            </span>
            <button
              type="button"
              onClick={handleToggleFocusMode}
              className="ml-1.5 px-3 py-1 rounded-full bg-error/15 hover:bg-error/25 text-error font-label-sm text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Thoát Chế độ tập trung (phím ESC)"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              <span>Thoát (ESC)</span>
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};
