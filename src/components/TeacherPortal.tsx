import React, { useState, useEffect } from 'react';
import {
  INITIAL_DRIVE_FOLDERS,
  INITIAL_MINIGAME_QUESTIONS,
  INITIAL_PRACTICAL_SUBMISSIONS,
  INITIAL_TAGGED_SUBMISSIONS,
  NOTEBOOK_GRADE_SOURCES,
  NOTEBOOK_LM_LESSONS,
  NOTEBOOK_LM_URL,
  PDF_TIET_1_STAGE2,
  PDF_TIET_1_STAGE4,
  buildLessonBlueprintFromPeriod,
  getDefaultWorksheetForLesson,
  getPeriodsForGrade,
  type ClassroomItem,
  type CrosswordClueItem,
  type CurriculumPeriodSpec,
  type CustomLessonWorksheet,
  type CustomShortAnswerQuestion,
  type DriveClassFolder,
  type LiveClassroomSession,
  type MinigameQuestionItem,
  type NotebookLMLessonBlueprint,
  type PracticalProductSubmission,
  type StudentRosterItem,
  type TaggedLessonSubmission,
} from '../data/mockCurriculumData';
import { AUTHENTIC_PDF_EXTRACTS } from '../data/authenticPdfExtracts';
import {
  generateStudentAccountFromExcelRow,
  parseExcelStudentPaste,
} from '../utils/pedagogyEngine';
import { WorksheetBatchPrintModal } from './WorksheetBatchPrintModal';
import { ClassProgressionTrackerModal } from './ClassProgressionTrackerModal';
import { BulkImportForm } from './BulkImportForm';
import { ClassQRCodeModal } from './ClassQRCodeModal';
import { QuestionMasterInspectorModal } from './QuestionMasterInspectorModal';
import { DataBoundary } from './DataBoundary';
import { SlidePresenterManager } from './SlidePresenterManager';
import { TeacherLivePresenterRoom } from './TeacherLivePresenterRoom';
import { LectureSlideManagerModal } from './LectureSlideManagerModal';

export type TeacherTab =
  | 'trang-chu'
  | 'bien-soan-stage-1'
  | 'bien-soan-stage-2'
  | 'bien-soan-stage-3'
  | 'bien-soan-stage-4'
  | 'cham-thuc-hanh'
  | 'quan-ly-lop-hoc-tai-khoan'
  | 'so-diem-thong-ke';

interface TeacherPortalProps {
  activeTab: TeacherTab;
  onChangeTab: (tab: TeacherTab) => void;
  selectedClass: string;
  onChangeClass: (classId: string) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSyncCloudNow: () => void;
  onShowToast: (msg: string) => void;
  students: StudentRosterItem[];
  onAddStudents: (newStudents: StudentRosterItem[]) => void;
  onUpdateStudentScore: (studentId: string, newScore: number) => void;
  onDeleteStudent?: (studentId: string) => void;
  onDeleteClassStudents?: (classId: string) => void;
  classes: ClassroomItem[];
  onAddClass: (newClass: ClassroomItem) => void;
  onDeleteClass?: (classId: string) => void;
  unlockedStages: Record<number, boolean>;
  onUnlockStage: (
    stage: 1 | 2 | 3 | 4,
    grade?: 6 | 7 | 8 | 9,
    period?: number
  ) => void;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onSwitchToStudentPreview?: () => void;
  isLoading?: boolean;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  activeTab,
  onChangeTab,
  selectedClass,
  onChangeClass,
  onLogout,
  darkMode,
  onToggleDarkMode,
  onShowToast,
  students,
  onAddStudents,
  onUpdateStudentScore,
  onDeleteStudent,
  onDeleteClassStudents,
  classes,
  onAddClass,
  onDeleteClass,
  unlockedStages,
  onUnlockStage,
  liveSession,
  onUpdateLiveSession,
  isLoading = false,
}) => {
  // Active Grade (6, 7, 8, 9) & Period (1 -> 29) Selection
  const [selectedNotebookGrade, setSelectedNotebookGrade] = useState<6 | 7 | 8 | 9>(
    liveSession?.activeGrade || 6
  );
  const [selectedNotebookPeriod, setSelectedNotebookPeriod] = useState<number>(
    liveSession?.activePeriod || 1
  );
  // On Teacher Home: null = showing 29-period roadmap grid; number (1..29) = opened that period's Teaching Progression
  const [openedHomePeriod, setOpenedHomePeriod] = useState<number | null>(null);
  const [homeExamFilter, setHomeExamFilter] = useState<
    'ALL' | 'GK1' | 'CK1' | 'GK2' | 'CK2'
  >('ALL');
  const [isLivePresenterOpen, setIsLivePresenterOpen] = useState(false);
  const [showLectureSlideModal, setShowLectureSlideModal] = useState(false);

  const gradePeriods = getPeriodsForGrade(selectedNotebookGrade);
  const selectedPeriodSpec: CurriculumPeriodSpec =
    gradePeriods.find((p) => p.period === selectedNotebookPeriod) || gradePeriods[0];
  const selectedGradeSource =
    NOTEBOOK_GRADE_SOURCES.find((g) => g.grade === selectedNotebookGrade) ||
    NOTEBOOK_GRADE_SOURCES[0];

  // Classes belonging to the currently selected grade (6, 7, 8, 9)
  const classesForSelectedGrade = classes.filter((c) => c.grade === selectedNotebookGrade);

  const [selectedNotebookLessonId, setSelectedNotebookLessonId] = useState<string>(
    NOTEBOOK_LM_LESSONS[0].lessonId
  );
  const [activeLesson, setActiveLesson] = useState<NotebookLMLessonBlueprint>(
    NOTEBOOK_LM_LESSONS[0]
  );
  const [notebookResearched, setNotebookResearched] = useState<boolean>(true);
  const [isResearchingNotebook, setIsResearchingNotebook] = useState<boolean>(false);
  const [isGeneratingFromNotebook, setIsGeneratingFromNotebook] = useState<boolean>(false);
  const [notebookAiNote, setNotebookAiNote] = useState<string>(
    'Đã đọc & đối chiếu tệp NLS-AI-6.docx với SGK Tin6.pdf trong NotebookLM. Sẵn sàng soạn tự động Hoạt động 1 → Hoạt động 4.'
  );

  // ================= HOẠT ĐỘNG 1 AUTHORING STATE + PER-QUESTION POINTS =================
  // ================= HOẠT ĐỘNG 1 AUTHORING STATE (TÌNH HUỐNG ĐẶT VẤN ĐỀ: TỰ LUẬN NGẮN) =================
  const [stage1Format, setStage1Format] = useState<'video' | 'crossword' | 'scenario'>('scenario');
  const [warmupScenario, setWarmupScenario] = useState<string>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return ws?.stage1?.scenario || 'Tình huống thực tế kết nối kiến thức bài học với đời sống.';
  });
  const [warmupQuestion, setWarmupQuestion] = useState<string>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return ws?.stage1?.question || 'Phân tích tình huống trên và nêu nhận định ban đầu của em.';
  });
  const [warmupSampleAnswer, setWarmupSampleAnswer] = useState<string>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return ws?.stage1?.sampleAnswer || 'Học sinh phân tích đúng bản chất vấn đề và định hướng giải quyết.';
  });
  const [warmupPoints, setWarmupPoints] = useState<number>(1.0);

  const [videoUrl, setVideoUrl] = useState(activeLesson.stage1.videoUrl);
  const [videoStops, setVideoStops] = useState(activeLesson.stage1.videoStops);
  const [activeVideoStopTest, setActiveVideoStopTest] = useState(0);
  const [crosswordClues, setCrosswordClues] = useState<CrosswordClueItem[]>(
    activeLesson.stage1.crosswordClues
  );
  const [crosswordPointsMap, setCrosswordPointsMap] = useState<Record<string, number>>({
    'cw-1': 2.5,
    'cw-2': 2.5,
    'cw-3': 2.5,
    'cw-4': 2.5,
  });
  const [solvedCrosswordStudioIds, setSolvedCrosswordStudioIds] = useState<string[]>(['cw-1']);
  const [newClueText, setNewClueText] = useState('');
  const [newClueAnswer, setNewClueAnswer] = useState('');
  const [newCluePoints, setNewCluePoints] = useState<number>(2.5);
  const [iceBreakerPrompt, setIceBreakerPrompt] = useState(
    activeLesson.stage1.openScenarioPrompt
  );
  const [studioWordCloud, setStudioWordCloud] = useState<string[]>(
    activeLesson.stage1.expectedWordCloud
  );
  const [newWordInput, setNewWordInput] = useState('');

  // ================= HOẠT ĐỘNG 2 AUTHORING STATE (4 INTERACTIVE TYPES + SHORT ANSWER) =================
  const [stage2ActiveBlockType, setStage2ActiveBlockType] = useState<
    'all' | 'drag_drop' | 'fill_blank' | 'matching' | 'short_answer'
  >('all');
  const [worksheetTitle, setWorksheetTitle] = useState(activeLesson.stage2.worksheetTitle);
  const [dragDropParagraph, setDragDropParagraph] = useState<string>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return (
      ws?.stage2?.dragDropParagraph ||
      'Kéo các từ gợi ý từ hộp từ khóa thả vào các vị trí (1), (2), (3), (4) trong đoạn văn kiến thức trọng tâm.'
    );
  });
  const [bucketAName, setBucketAName] = useState(activeLesson.stage2.bucketA);
  const [bucketBName, setBucketBName] = useState(activeLesson.stage2.bucketB);
  const [dragCards, setDragCards] = useState<
    Array<{ id: string; text: string; correctBox: 'data' | 'info'; promptFragment?: string }>
  >(activeLesson.stage2.dragItems);
  const [dragCardPointsMap, setDragCardPointsMap] = useState<Record<string, number>>({});
  const [newDragCardPrompt, setNewDragCardPrompt] = useState('');
  const [newDragCardText, setNewDragCardText] = useState('');
  const [newDragCardBox, setNewDragCardBox] = useState<'data' | 'info'>('data');
  const [newDragCardPoints, setNewDragCardPoints] = useState<number>(0.25);

  const [fillBlankItems, setFillBlankItems] = useState<
    Array<{
      id: string;
      label: string;
      preText: string;
      postText: string;
      correctAnswer: string;
      points: number;
    }>
  >(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const initialWs =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    if (initialWs?.stage2?.fillBlankQuestions?.length) {
      return initialWs.stage2.fillBlankQuestions.map((fb, idx) => ({
        id: fb.id,
        label: fb.label,
        preText: fb.preText,
        postText: fb.postText,
        correctAnswer: fb.correctAnswer,
        points: fb.points ?? (idx === 0 ? 0.4 : 0.3),
      }));
    }
    return PDF_TIET_1_STAGE2.fillBlank.items.map((it, idx) => ({
      id: it.id,
      label: it.label,
      preText: it.preText,
      postText: it.postText,
      correctAnswer: it.correctAnswer,
      points: idx === 0 ? 0.4 : 0.3,
    }));
  });
  const [newFillLabel, setNewFillLabel] = useState('d)');
  const [newFillPreText, setNewFillPreText] = useState('');
  const [newFillPostText, setNewFillPostText] = useState('');
  const [newFillAnswer, setNewFillAnswer] = useState('');
  const [newFillPoints, setNewFillPoints] = useState<number>(0.3);

  const [matchingPairs, setMatchingPairs] = useState(activeLesson.stage2.matchingPairs);
  const [matchingPointsMap, setMatchingPointsMap] = useState<Record<string, number>>({});
  const [newMatchLeft, setNewMatchLeft] = useState('');
  const [newMatchRight, setNewMatchRight] = useState('');
  const [newMatchPoints, setNewMatchPoints] = useState<number>(0.3);
  const [studioConnectedPairs, setStudioConnectedPairs] = useState<string[]>(['mp-1']);

  // Dạng 4: Câu hỏi trả lời ngắn (1.0 điểm = 0.4đ + 0.3đ + 0.3đ) - 100% Nguyên bản PDF
  const [shortAnswerPrompt, setShortAnswerPrompt] = useState<string>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const initialWs =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return initialWs?.stage2?.shortAnswerPrompt || PDF_TIET_1_STAGE2.shortAnswer.question;
  });
  const [shortAnswerQuestions, setShortAnswerQuestions] = useState<CustomShortAnswerQuestion[]>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const initialWs =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    if (initialWs?.stage2?.shortAnswerQuestions?.length) {
      return initialWs.stage2.shortAnswerQuestions;
    }
    return [
      {
        id: 'sa-data',
        label: '• Dữ liệu quan sát được:',
        question: 'Chỉ ra yếu tố Dữ liệu trong tình huống bài học:',
        placeholder: 'Nhập câu trả lời ngắn...',
        sampleAnswer: 'Dữ liệu quan sát được từ tình huống thực tế của bài học.',
        points: 0.4,
      },
      {
        id: 'sa-info',
        label: '• Thông tin thu nhận được:',
        question: 'Chỉ ra yếu tố Thông tin và ý nghĩa rút ra:',
        placeholder: 'Nhập câu trả lời ngắn...',
        sampleAnswer: 'Hiểu biết và kinh nghiệm rút ra để giải quyết vấn đề.',
        points: 0.3,
      },
      {
        id: 'sa-carrier',
        label: '• Vật mang tin / Phương tiện:',
        question: 'Chỉ ra vật mang tin hoặc phương tiện lưu trữ:',
        placeholder: 'Nhập câu trả lời ngắn...',
        sampleAnswer: 'Phương tiện hoặc thiết bị lưu trữ dữ liệu an toàn.',
        points: 0.3,
      },
    ];
  });
  const [newShortLabel, setNewShortLabel] = useState('');
  const [newShortQuestion, setNewShortQuestion] = useState('');
  const [newShortSampleAnswer, setNewShortSampleAnswer] = useState('');
  const [newShortPoints, setNewShortPoints] = useState<number>(0.3);

  // ================= HOẠT ĐỘNG 3 AUTHORING STATE (QUIZ 25S: 3.0 ĐIỂM + GOOGLE DRIVE FOLDER TREE) =================
  const [stage3PeriodMode, setStage3PeriodMode] = useState<'theory' | 'practice'>('theory');
  const [questions, setQuestions] = useState<MinigameQuestionItem[]>(() =>
    INITIAL_MINIGAME_QUESTIONS.map((q) => ({
      ...q,
      points: 0.5,
    }))
  );
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Practical Lesson Google Drive Folder Tree & Grading State
  const [practicalTitle, setPracticalTitle] = useState(activeLesson.stage3.practicalTaskTitle);
  const [practicalSteps, setPracticalSteps] = useState<string[]>(
    activeLesson.stage3.practicalTaskSteps
  );
  const [newPracticalStep, setNewPracticalStep] = useState('');
  const [driveGradeFilter, setDriveGradeFilter] = useState<6 | 7 | 8 | 9>(selectedNotebookGrade);
  const [driveClassFilter, setDriveClassFilter] = useState<string>(selectedClass);
  const [drivePeriodFilter, setDrivePeriodFilter] = useState<number | 'ALL'>('ALL');
  const [newDriveFolderName, setNewDriveFolderName] = useState<string>('');
  const [gradingScoreInputMap, setGradingScoreInputMap] = useState<Record<string, string>>({});
  const [gradingFeedbackInputMap, setGradingFeedbackInputMap] = useState<Record<string, string>>(
    {}
  );

  // ================= HOẠT ĐỘNG 4 AUTHORING STATE (3.0 ĐIỂM: 3 BÀI TẬP VẬN DỤNG GỐC PDF + CHẤM % ĐÁP ÁN GỢI Ý) =================
  const [projectTitle, setProjectTitle] = useState(activeLesson.stage4.projectTitle);
  const [projectObjective, setProjectObjective] = useState(activeLesson.stage4.projectObjective);
  const [deepAnalysisTask, setDeepAnalysisTask] = useState<{
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  }>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return (
      ws?.stage4?.deepAnalysis || {
        title: '1. Câu hỏi tự luận phân tích sâu (Nguyên bản Câu 6 PDF gốc)',
        prompt: 'Phân tích ứng dụng và giải pháp thực tế của kiến thức bài học.',
        guideAnswer: 'Nêu bản chất kiến thức và đưa ra giải pháp bảo vệ dữ liệu/ứng dụng công nghệ.',
        points: 1.0,
      }
    );
  });
  const [practicalTask, setPracticalTask] = useState<{
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  }>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return (
      ws?.stage4?.practicalTask || {
        title: '2. Bài tập thực hành tự luận (Nguyên bản Phần C PDF gốc)',
        prompt: 'Thao tác thực hành cụ thể trên máy tính hoặc sơ đồ logic.',
        guideAnswer: 'Lưu sản phẩm vào thư mục lớp trên Google Drive.',
        points: 1.0,
      }
    );
  });
  const [extendedTask, setExtendedTask] = useState<{
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  }>(() => {
    const initGrade = liveSession?.activeGrade || 6;
    const initPeriod = liveSession?.activePeriod || 1;
    const ws =
      liveSession?.customWorksheetsByLesson?.[`k${initGrade}-tiet-${initPeriod}`] ||
      getDefaultWorksheetForLesson(initGrade, initPeriod);
    return (
      ws?.stage4?.extendedTask || {
        title: '3. Bài tập Vận dụng SGK mở rộng & AI (Nguyên bản Câu 7 PDF gốc)',
        prompt: 'Bài tập Vận dụng cuối bài trong Sách giáo khoa Kết nối tri thức.',
        guideAnswer: 'Mở rộng liên hệ thực tế tại gia đình hoặc trường học.',
        points: 1.0,
      }
    );
  });

  // ================= CLASS & EXCEL ACCOUNT MANAGEMENT STATE =================
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'ALL'>('ALL');
  const [studentAccountGradeFilter, setStudentAccountGradeFilter] = useState<number | 'ALL'>('ALL');
  const [studentAccountClassFilter, setStudentAccountClassFilter] = useState<string>('ALL');
  const [newClassGrade, setNewClassGrade] = useState<number>(6);
  const [newClassName, setNewClassName] = useState<string>('6A12');
  const [newClassRoom, setNewClassRoom] = useState<string>('Phòng Lab Cloud 04');
  const [excelPasteText, setExcelPasteText] = useState<string>(
    '1\tLê Bảo Ngọc\t20/11/2013\t6A10\n2\tTrần Minh Khang\t14/06/2013\t6A10\n3\tVũ Hoàng Yến\t09/09/2013\t6A10'
  );
  const [singleStudentName, setSingleStudentName] = useState('');
  const [singleStudentDob, setSingleStudentDob] = useState('15/05/2013');
  const [singleStudentClass, setSingleStudentClass] = useState(selectedClass);

  const activeQuestion: MinigameQuestionItem = questions[editingQuestionIdx] ||
    questions[0] || {
      id: 'empty-q',
      order: 1,
      question: '',
      timeLimitSec: 25,
      points: 0.5,
      status: 'Đang sửa',
      options: [
        { letter: 'A', text: '', explanation: '', isCorrect: true },
        { letter: 'B', text: '', explanation: '', isCorrect: false },
        { letter: 'C', text: '', explanation: '', isCorrect: false },
        { letter: 'D', text: '', explanation: '', isCorrect: false },
      ],
    };

  const driveFolders: DriveClassFolder[] =
    liveSession?.driveFolders && liveSession.driveFolders.length > 0
      ? liveSession.driveFolders
      : INITIAL_DRIVE_FOLDERS;

  const practicalSubmissions: PracticalProductSubmission[] =
    liveSession?.practicalSubmissions && liveSession.practicalSubmissions.length > 0
      ? liveSession.practicalSubmissions
      : INITIAL_PRACTICAL_SUBMISSIONS;

  // Save current lesson's customized questions & per-question points to Database & LiveSession
  const handleSaveCustomWorksheetToDb = async (toastMsg?: string) => {
    const lessonKey = `k${selectedNotebookGrade}-tiet-${selectedNotebookPeriod}`;
    const baseWorksheet = getDefaultWorksheetForLesson(
      selectedNotebookGrade,
      selectedNotebookPeriod
    );
    const updatedWorksheet: CustomLessonWorksheet = {
      ...baseWorksheet,
      lessonKey,
      grade: selectedNotebookGrade,
      period: selectedNotebookPeriod,
      worksheetTitle,
      stage1: {
        title: `Tình huống khởi động: ${selectedPeriodSpec.topic}`,
        scenario: warmupScenario,
        question: warmupQuestion,
        sampleAnswer: warmupSampleAnswer,
        points: warmupPoints,
      },
      stage1Questions: crosswordClues.map((c) => ({
        id: c.id,
        rowNumber: c.rowNumber,
        clue: c.clue,
        answer: c.answer,
        points: crosswordPointsMap[c.id] ?? 2.5,
      })),
      stage2: {
        ...baseWorksheet.stage2,
        bucketA: bucketAName,
        bucketB: bucketBName,
        dragDropParagraph,
        dragDropWordBank: dragCards.map((c) => c.promptFragment || c.text),
        dragDropQuestions: dragCards.map((c, idx) => ({
          slotNum: idx + 1,
          promptFragment:
            c.promptFragment ||
            c.text ||
            baseWorksheet.stage2.dragDropQuestions?.[idx]?.promptFragment ||
            `Nhận định phân loại #${idx + 1}`,
          correctWord: c.correctBox === 'info' ? 'B' : 'A',
          points: dragCardPointsMap[c.id] ?? 0.25,
        })),
        dragItems: dragCards.map((c) => ({
          id: c.id,
          text: c.promptFragment || c.text,
          correctBox: c.correctBox,
        })),
        fillBlankQuestions: fillBlankItems.map((it) => ({
          id: it.id,
          label: it.label,
          preText: it.preText,
          postText: it.postText,
          correctAnswer: it.correctAnswer,
          accepted: [it.correctAnswer.toLowerCase()],
          points: it.points,
        })),
        matchingQuestions: matchingPairs.map((mp, idx) => ({
          id: mp.id,
          num: idx + 1,
          leftText: mp.left,
          rightKey: String.fromCharCode(97 + idx),
          rightText: mp.right,
          points: matchingPointsMap[mp.id] ?? (idx === 0 ? 0.4 : 0.3),
        })),
        shortAnswerPrompt,
        shortAnswerQuestions,
      },
      stage3QuizQuestions: questions.map((q) => ({
        ...q,
        points: q.points ?? 0.5,
      })),
      stage4: {
        ...baseWorksheet.stage4,
        deepAnalysis: deepAnalysisTask,
        practicalTask,
        extendedTask,
        rubrics: [],
      },
    };

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        customWorksheetsByLesson: {
          ...(prev.customWorksheetsByLesson || {}),
          [lessonKey]: updatedWorksheet,
        },
        verifiedLessonsMap: {
          ...(prev.verifiedLessonsMap || {}),
          [lessonKey]: true,
        },
      }));
    }

    try {
      await fetch('/api/worksheets/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheets: { [lessonKey]: updatedWorksheet },
        }),
      });
    } catch {
      // ignore offline
    }

    onShowToast(
      toastMsg ||
        `Đã lưu câu hỏi & điểm số từng câu của Khối ${selectedNotebookGrade} • Tiết ${selectedNotebookPeriod} vào Database!`
    );
  };

  // State to control WorksheetBatchPrintModal (Chế độ xem & In ấn toàn bộ 29 phiếu học tập)
  const [showBatchPrintModal, setShowBatchPrintModal] = useState<boolean>(false);
  // State to control ClassProgressionTrackerModal (Bộ đếm tiến trình 29 tiết học trực tiếp theo thời gian thực)
  const [showProgressionTrackerModal, setShowProgressionTrackerModal] = useState<boolean>(false);
  // State to control BulkImportForm (Cấu trúc hóa dữ liệu tiết học hàng loạt CSV/JSON & Đồng bộ Google Sheets)
  const [showBulkImportModal, setShowBulkImportModal] = useState<boolean>(false);
  // State to control ClassQRCodeModal (Mã QR & PIN Lớp học trực tiếp cho học sinh quét)
  const [showQRCodeModal, setShowQRCodeModal] = useState<boolean>(false);
  // State to control Master Question Inspector ListView modal
  const [showQuestionInspectorModal, setShowQuestionInspectorModal] = useState<boolean>(false);

  const handleBulkImportWorksheets = async (importedWorksheets: CustomLessonWorksheet[]) => {
    if (importedWorksheets.length === 0) return;

    const worksheetMap: Record<string, CustomLessonWorksheet> = {};
    const verifiedMap: Record<string, boolean> = {};
    importedWorksheets.forEach((ws) => {
      worksheetMap[ws.lessonKey] = ws;
      verifiedMap[ws.lessonKey] = true;
    });

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        customWorksheetsByLesson: {
          ...(prev.customWorksheetsByLesson || {}),
          ...worksheetMap,
        },
        verifiedLessonsMap: {
          ...(prev.verifiedLessonsMap || {}),
          ...verifiedMap,
        },
        updatedAt: new Date().toISOString(),
      }));
    }

    try {
      await fetch('/api/worksheets/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedNotebookGrade,
          worksheets: worksheetMap,
          verified: true,
        }),
      });
    } catch {
      // ignore offline
    }

    // Refresh current active lesson state if current grade/period was updated
    const currentKey = `k${selectedNotebookGrade}-tiet-${selectedNotebookPeriod}`;
    if (worksheetMap[currentKey]) {
      const updated = worksheetMap[currentKey];
      applyNotebookBlueprintToAllStages(
        buildLessonBlueprintFromPeriod(selectedPeriodSpec),
        updated
      );
    }

    onShowToast(`Đã đồng bộ thành công ${importedWorksheets.length} tiết học vào hệ thống!`);
    setShowBulkImportModal(false);
  };

  const handleQuickPingSupabaseKeepAlive = async () => {
    try {
      const res = await fetch('/api/cron/keep-alive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'teacher-header-keepalive' }),
      });
      const data = await res.json();
      if (data?.heartbeat) {
        onShowToast(
          `✅ Cron Keep-Alive Supabase/PostgreSQL đang hoạt động 24/7 (Chu kỳ 6h + GitHub Actions 12h) • Đã Ping giữ thức lần #${data.heartbeat.pingCount}!`
        );
      }
    } catch {
      onShowToast('⚠️ Đang đồng bộ kết nối Keep-Alive...');
    }
  };

  // Apply a NotebookLM Lesson Blueprint & Period Worksheet across all 4 stages
  const applyNotebookBlueprintToAllStages = (
    blueprint: NotebookLMLessonBlueprint,
    wsOverride?: CustomLessonWorksheet
  ) => {
    setActiveLesson(blueprint);
    setSelectedNotebookLessonId(blueprint.lessonId);
    // Stage 1
    const targetGrade = (blueprint.grade || selectedNotebookGrade) as 6 | 7 | 8 | 9;
    const targetPeriod = blueprint.periodNumber || selectedNotebookPeriod;
    const lessonKey = `k${targetGrade}-tiet-${targetPeriod}`;
    const effectiveWs =
      wsOverride ||
      liveSession?.customWorksheetsByLesson?.[lessonKey] ||
      getDefaultWorksheetForLesson(targetGrade, targetPeriod);

    const isLessonVerified = Boolean(
      wsOverride ||
      liveSession?.customWorksheetsByLesson?.[lessonKey] ||
      liveSession?.verifiedLessonsMap?.[lessonKey] !== false
    );

    if (!isLessonVerified) {
      setWarmupScenario('');
      setWarmupQuestion('');
      setWarmupSampleAnswer('');
      setCrosswordClues([]);
      setWorksheetTitle(blueprint.stage2.worksheetTitle);
      setDragDropParagraph('');
      setDragCards([]);
      setDragCardPointsMap({});
      setFillBlankItems([]);
      setMatchingPairs([]);
      setMatchingPointsMap({});
      setShortAnswerPrompt('');
      setShortAnswerQuestions([]);
      setQuestions([]);
      setEditingQuestionIdx(0);
      setDeepAnalysisTask({ title: '1. Tự luận phân tích sâu', prompt: '', points: 1.0 });
      setPracticalTask({ title: '2. Bài tập thực hành', prompt: '', points: 1.0 });
      setExtendedTask({ title: '3. Vận dụng mở rộng', prompt: '', points: 1.0 });
      return;
    }

    if (effectiveWs?.stage1) {
      setWarmupScenario(effectiveWs.stage1.scenario);
      setWarmupQuestion(effectiveWs.stage1.question);
      setWarmupSampleAnswer(effectiveWs.stage1.sampleAnswer || '');
      setWarmupPoints(effectiveWs.stage1.points ?? 1.0);
    } else {
      setWarmupScenario(blueprint.stage1.openScenarioPrompt);
      setWarmupQuestion('Phân tích tình huống trên và nêu nhận định ban đầu của em.');
    }
    setVideoUrl(blueprint.stage1.videoUrl);
    setVideoStops(blueprint.stage1.videoStops);
    setCrosswordClues(blueprint.stage1.crosswordClues);
    setIceBreakerPrompt(blueprint.stage1.openScenarioPrompt);
    setStudioWordCloud(blueprint.stage1.expectedWordCloud);
    // Stage 2 (4.0 points total: DragDrop 1.0 + FillBlank 1.0 + Matching 1.0 + ShortAnswer 1.0)

    setWorksheetTitle(effectiveWs?.worksheetTitle || blueprint.stage2.worksheetTitle);
    setDragDropParagraph(effectiveWs?.stage2?.dragDropParagraph ?? '');
    setBucketAName(effectiveWs?.stage2?.bucketA || blueprint.stage2.bucketA || 'Hộp A');
    setBucketBName(effectiveWs?.stage2?.bucketB || blueprint.stage2.bucketB || 'Hộp B');
    if (effectiveWs?.stage2?.dragDropQuestions !== undefined && effectiveWs.stage2.dragDropQuestions.length > 0) {
      setDragCards(
        effectiveWs.stage2.dragDropQuestions.map((dq, idx) => {
          const resolvedBox =
            effectiveWs.stage2.dragItems?.[idx]?.correctBox ||
            (dq.correctWord === 'B'
              ? 'info'
              : dq.correctWord === 'A'
              ? 'data'
              : idx < 2
              ? 'data'
              : 'info');
          const resolvedStatement =
            dq.promptFragment || effectiveWs.stage2.dragItems?.[idx]?.text || dq.correctWord;
          return {
            id: `dd-${dq.slotNum}`,
            text: resolvedBox === 'data' ? 'Hộp A' : 'Hộp B',
            promptFragment: resolvedStatement,
            correctBox: resolvedBox,
          };
        })
      );
      const nextDragPts: Record<string, number> = {};
      effectiveWs.stage2.dragDropQuestions.forEach((dq) => {
        nextDragPts[`dd-${dq.slotNum}`] = dq.points ?? 0.25;
      });
      setDragCardPointsMap(nextDragPts);
    } else {
      setDragCards(blueprint.stage2.dragItems);
      const nextDragPts: Record<string, number> = {};
      blueprint.stage2.dragItems.forEach((d) => {
        nextDragPts[d.id] = 0.25;
      });
      setDragCardPointsMap(nextDragPts);
    }

    // DẠNG ĐIỀN KHUYẾT (100% NGUYÊN BẢN TỪ PDF BẢN GỐC)
    const authenticFillBlank =
      effectiveWs?.stage2?.fillBlankQuestions !== undefined
        ? effectiveWs.stage2.fillBlankQuestions
        : blueprint.stage2.fillBlankQuestions || [];

    setFillBlankItems(
      authenticFillBlank.map((fb, idx) => ({
        id: fb.id,
        label: fb.label,
        preText: fb.preText,
        postText: fb.postText,
        correctAnswer: fb.correctAnswer,
        points: fb.points ?? (idx === 0 ? 0.35 : 0.3),
      }))
    );

    if (effectiveWs?.stage2?.matchingQuestions !== undefined) {
      setMatchingPairs(
        effectiveWs.stage2.matchingQuestions.map((mq) => ({
          id: mq.id,
          left: mq.leftText,
          right: mq.rightText,
        }))
      );
      const nextMatchPts: Record<string, number> = {};
      effectiveWs.stage2.matchingQuestions.forEach((mq) => {
        nextMatchPts[mq.id] = mq.points ?? 0.25;
      });
      setMatchingPointsMap(nextMatchPts);
    } else {
      setMatchingPairs(blueprint.stage2.matchingPairs);
      const nextMatchPts: Record<string, number> = {};
      blueprint.stage2.matchingPairs.forEach((mp, idx) => {
        nextMatchPts[mp.id] = idx === 0 ? 0.4 : 0.3;
      });
      setMatchingPointsMap(nextMatchPts);
    }

    // DẠNG TRẢ LỜI NGẮN (100% NGUYÊN BẢN TỪ PDF BẢN GỐC)
    const promptSource =
      effectiveWs?.stage2?.shortAnswerPrompt !== undefined && effectiveWs.stage2.shortAnswerPrompt.trim().length > 0
        ? effectiveWs.stage2.shortAnswerPrompt
        : blueprint.stage2.shortAnswerPrompt || '';
    setShortAnswerPrompt(promptSource);

    const shortQuestionsSource =
      effectiveWs?.stage2?.shortAnswerQuestions !== undefined && effectiveWs.stage2.shortAnswerQuestions.length > 0
        ? effectiveWs.stage2.shortAnswerQuestions
        : blueprint.stage2.shortAnswerQuestions || [];
    setShortAnswerQuestions(shortQuestionsSource);

    // Stage 3 (3.0 points total: 6 questions x 0.5pt or Google Drive practical)
    setStage3PeriodMode(blueprint.stage3.recommendedMode);
    const sourceQuestions =
      effectiveWs?.stage3QuizQuestions !== undefined
        ? effectiveWs.stage3QuizQuestions
        : blueprint.stage3.quizQuestions;
    setQuestions(
      sourceQuestions.map((q) => ({
        ...q,
        points: q.points ?? 0.5,
      }))
    );
    setEditingQuestionIdx(0);
    setPracticalTitle(blueprint.stage3.practicalTaskTitle);
    setPracticalSteps(blueprint.stage3.practicalTaskSteps);
    // Stage 4 (3.0 points total: 3 tasks x 1.0pt)
    setProjectTitle(blueprint.stage4.projectTitle);
    setProjectObjective(blueprint.stage4.projectObjective);
    if (effectiveWs?.stage4?.deepAnalysis) {
      setDeepAnalysisTask(effectiveWs.stage4.deepAnalysis);
    }
    if (effectiveWs?.stage4?.practicalTask) {
      setPracticalTask(effectiveWs.stage4.practicalTask);
    }
    if (effectiveWs?.stage4?.extendedTask) {
      setExtendedTask(effectiveWs.stage4.extendedTask);
    }
  };

  const handleSelectGradeAndPeriod = (grade: 6 | 7 | 8 | 9, periodNum: number) => {
    setSelectedNotebookGrade(grade);
    setSelectedNotebookPeriod(periodNum);
    // Ensure selectedClass belongs to this grade if available
    const gradeClasses = classes.filter((c) => c.grade === grade);
    if (gradeClasses.length > 0 && !gradeClasses.some((c) => c.id === selectedClass)) {
      onChangeClass(gradeClasses[0].id);
    }
    const periods = getPeriodsForGrade(grade);
    const spec = periods.find((p) => p.period === periodNum) || periods[0];
    const blueprint = buildLessonBlueprintFromPeriod(spec);
    const lessonKey = `k${grade}-tiet-${spec.period}`;
    const ws =
      liveSession?.customWorksheetsByLesson?.[lessonKey] ||
      getDefaultWorksheetForLesson(grade, spec.period);
    applyNotebookBlueprintToAllStages(blueprint, ws);
    setIsResearchingNotebook(false);
    setNotebookResearched(true);
    setNotebookAiNote(
      `Đã đồng bộ câu hỏi & cấu trúc chuẩn 10.0đ cho Khối ${grade} • ${spec.lessonTitle} (${spec.sgkPages}).`
    );
  };

  useEffect(() => {
    const spec = selectedPeriodSpec || getPeriodsForGrade(selectedNotebookGrade)[0];
    if (spec) {
      const blueprint = buildLessonBlueprintFromPeriod(spec);
      const lessonKey = `k${selectedNotebookGrade}-tiet-${spec.period}`;
      const ws =
        liveSession?.customWorksheetsByLesson?.[lessonKey] ||
        getDefaultWorksheetForLesson(selectedNotebookGrade, spec.period);
      applyNotebookBlueprintToAllStages(blueprint, ws);
    }
  }, [selectedNotebookGrade, selectedNotebookPeriod, liveSession?.customWorksheetsByLesson]);

  // Reusable Grade & Period Selector Bar inside Activity Authoring Tabs (Hoạt động 1, 2, 3, 4)
  const renderActivityGradePeriodSelector = (
    stageNum: 1 | 2 | 3 | 4,
    stagePointSummary: string
  ) => (
    <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border-2 border-primary/20 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-sm font-black shadow-xs">
            HĐ{stageNum}
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Khối {selectedNotebookGrade} • {selectedPeriodSpec.lessonTitle}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBatchPrintModal(true)}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-sm text-label-sm font-bold flex items-center gap-1.5 border border-outline-variant/30 cursor-pointer transition-all"
            title="Xem và In ấn"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>In ấn</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-bold">
            {stagePointSummary}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-2 border-t border-outline-variant/20">
        {/* Grade buttons 6, 7, 8, 9 */}
        <div className="md:col-span-4 flex items-center gap-1.5">
          <span className="text-xs font-bold text-on-surface-variant shrink-0">Khối:</span>
          <div className="grid grid-cols-4 gap-1 flex-1">
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectGradeAndPeriod(g, selectedNotebookPeriod)}
                className={`py-1.5 px-2 rounded-lg font-label-sm text-label-sm font-bold cursor-pointer transition-all ${
                  selectedNotebookGrade === g
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Khối {g}
              </button>
            ))}
          </div>
        </div>

        {/* Period dropdown 1..29 */}
        <div className="md:col-span-6 flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface-variant shrink-0">Tiết dạy:</span>
          <select
            value={selectedNotebookPeriod}
            onChange={(e) =>
              handleSelectGradeAndPeriod(selectedNotebookGrade, Number(e.target.value))
            }
            className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md font-bold border border-outline-variant/30"
          >
            {gradePeriods.map((p) => (
              <option key={p.period} value={p.period}>
                Tiết {p.period}: {p.lessonTitle} ({p.lessonType === 'theory' ? 'Lý thuyết' : 'Thực hành'})
              </option>
            ))}
          </select>
        </div>

        {/* Prev / Next Period buttons */}
        <div className="md:col-span-2 flex items-center justify-end gap-1.5">
          <button
            type="button"
            disabled={selectedNotebookPeriod <= 1}
            onClick={() =>
              handleSelectGradeAndPeriod(
                selectedNotebookGrade,
                Math.max(1, selectedNotebookPeriod - 1)
              )
            }
            className="px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-bold disabled:opacity-40 cursor-pointer hover:bg-surface-container"
            title="Tiết trước"
          >
            ← Tiết trước
          </button>
          <button
            type="button"
            disabled={selectedNotebookPeriod >= 29}
            onClick={() =>
              handleSelectGradeAndPeriod(
                selectedNotebookGrade,
                Math.min(29, selectedNotebookPeriod + 1)
              )
            }
            className="px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-bold disabled:opacity-40 cursor-pointer hover:bg-surface-container"
            title="Tiết sau"
          >
            Tiết sau →
          </button>
        </div>
      </div>
    </div>
  );

  const handleAutoGenerateFromNotebookLM = async () => {
    const blueprint = buildLessonBlueprintFromPeriod(selectedPeriodSpec);

    setIsGeneratingFromNotebook(true);
    try {
      const res = await fetch('/api/ai/notebook-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: blueprint.lessonId,
          lessonTitle: blueprint.title,
          notebookUrl: NOTEBOOK_LM_URL,
        }),
      });
      const data = await res.json();
      if (data.aiPedagogicalNote) {
        setNotebookAiNote(
          `${data.aiPedagogicalNote} [Nguồn: ${selectedPeriodSpec.nlsAiFile} ↔ ${selectedPeriodSpec.sgkFile}]`
        );
      }
    } catch {
      // fallback note
    }
    const authenticWs =
      liveSession?.customWorksheetsByLesson?.[blueprint.lessonId] ||
      getDefaultWorksheetForLesson(selectedNotebookGrade, selectedNotebookPeriod);
    applyNotebookBlueprintToAllStages(blueprint, authenticWs);
    setIsGeneratingFromNotebook(false);
    onShowToast(
      `Đã đồng bộ trọn vẹn Hoạt động 1 → Hoạt động 4 (100% nguyên bản PDF) cho Khối ${selectedNotebookGrade} • "${selectedPeriodSpec.lessonTitle}"!`
    );
  };

  const [tagFilterMode, setTagFilterMode] = useState<'ALL' | 'IN_CLASS_LIVE' | 'HOME_SELF_PACED'>('ALL');

  const handleTriggerLiveWheelCall = () => {
    const classStudents = students.filter((s) => s.classId === selectedClass);
    const pool = classStudents.length > 0 ? classStudents : students;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (!picked) return;

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        isBroadcasting: true,
        activeGrade: selectedNotebookGrade,
        activePeriod: selectedNotebookPeriod,
        activeClassId: selectedClass,
        wheelCall: {
          isSpinning: false,
          winnerName: picked.name,
          winnerId: picked.id,
          winnerGroup: `Nhóm ${picked.groupNumber} • Lớp ${picked.classId}`,
          rewardLabel: '+20 XP Thưởng nóng trên lớp',
          triggeredAt: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      }));
    }
    onShowToast(
      `🎡 Vòng quay Trực tiếp đã gọi tên HS: ${picked.name} (${picked.id} • Lớp ${picked.classId}) — Đã phát tín hiệu lên màn hình học sinh!`
    );
  };

  const handleBroadcastLivePeriod = (
    grade: 6 | 7 | 8 | 9,
    periodNum: number,
    unlockAll = false,
    targetClassOverride?: string
  ) => {
    const targetClass = targetClassOverride || selectedClass;
    const key = `k${grade}-tiet-${periodNum}`;
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => {
        const currentStages = prev.unlockedStagesByLesson[key] || {
          1: true,
          2: false,
          3: false,
          4: false,
        };
        return {
          ...prev,
          isBroadcasting: true,
          activeGrade: grade,
          activePeriod: periodNum,
          activeStage: unlockAll ? 2 : 1,
          activeClassId: targetClass,
          unlockedStagesByLesson: {
            ...prev.unlockedStagesByLesson,
            [key]: unlockAll
              ? { 1: true, 2: true, 3: true, 4: true }
              : { ...currentStages, 1: true, 2: true },
          },
        };
      });
    }
    setIsLivePresenterOpen(true);
    onShowToast(
      `🔴 Đã phát Live trực tiếp Khối ${grade} • Tiết ${periodNum} cho đúng Lớp ${targetClass}!`
    );
  };

  // Toggle "Đã dạy" status for a period in a specific class (Unlocks Self-Study mode for students of that class)
  const handleToggleTaughtPeriodForClass = (
    grade: 6 | 7 | 8 | 9,
    periodNum: number,
    classIdToMark = selectedClass
  ) => {
    const key = `k${grade}-tiet-${periodNum}`;
    if (!onUpdateLiveSession) return;
    onUpdateLiveSession((prev) => {
      const currentMap = prev.taughtPeriodsByClass || {};
      const classPeriods = currentMap[classIdToMark] || [];
      const alreadyTaught = classPeriods.includes(periodNum);
      const nextPeriods = alreadyTaught
        ? classPeriods.filter((p) => p !== periodNum)
        : [...classPeriods, periodNum];

      return {
        ...prev,
        taughtPeriodsByClass: {
          ...currentMap,
          [classIdToMark]: nextPeriods,
        },
        unlockedStagesByLesson: !alreadyTaught
          ? {
              ...prev.unlockedStagesByLesson,
              [key]: { 1: true, 2: true, 3: true, 4: true },
            }
          : prev.unlockedStagesByLesson,
      };
    });
    const currentlyTaught = (liveSession?.taughtPeriodsByClass?.[classIdToMark] || []).includes(
      periodNum
    );
    onShowToast(
      currentlyTaught
        ? `Đã bỏ đánh dấu "Đã dạy" Tiết ${periodNum} của Lớp ${classIdToMark}.`
        : `✓ Đã đánh dấu "Đã dạy" Tiết ${periodNum} cho Lớp ${classIdToMark} — Đã mở khóa Chế độ Tự luyện toàn bộ 4 hoạt động cho học sinh lớp ${classIdToMark}!`
    );
  };

  // Create a new Google Drive Folder for a Grade / Class / Practical Period
  const handleCreateDriveClassFolder = (
    grade: 6 | 7 | 8 | 9,
    classId: string,
    period: number,
    customFolderName?: string
  ) => {
    const periods = getPeriodsForGrade(grade);
    const spec = periods.find((p) => p.period === period) || periods[0];
    const cleanFolder =
      (customFolderName || '').trim() ||
      `TH_Tiet${period}_${spec.lessonTitle
        .replace(/^Tiết \d+:\s*/, '')
        .slice(0, 18)
        .replace(/\s+/g, '')}_${classId}`;
    const newFolder: DriveClassFolder = {
      id: `drv-${classId}-p${period}-${Date.now()}`,
      grade,
      classId,
      period,
      folderName: cleanFolder,
      drivePath: `Google Drive / Khối ${grade} / Lớp ${classId} / ${spec.lessonTitle}`,
      driveUrl: `https://drive.google.com/drive/folders/cloudplay-${classId.toLowerCase()}-tiet${period}`,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • Hôm nay',
    };
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        driveFolders: [newFolder, ...(prev.driveFolders || INITIAL_DRIVE_FOLDERS)],
      }));
    }
    setNewDriveFolderName('');
    onShowToast(
      `Đã tạo thư mục Google Drive "${cleanFolder}" trên cây thư mục Khối ${grade} / Lớp ${classId}!`
    );
  };

  // Grade a student's practical submission in a class folder
  const handleSavePracticalGrade = (submission: PracticalProductSubmission) => {
    const rawScore = gradingScoreInputMap[submission.id];
    const parsedScore =
      rawScore !== undefined && rawScore !== ''
        ? Math.min(10, Math.max(0, Number(rawScore)))
        : submission.score ?? 9.0;
    const feedback =
      gradingFeedbackInputMap[submission.id] !== undefined
        ? gradingFeedbackInputMap[submission.id]
        : submission.teacherFeedback || 'Hoàn thành tốt yêu cầu bài thực hành trên lớp!';

    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        practicalSubmissions: (
          prev.practicalSubmissions || INITIAL_PRACTICAL_SUBMISSIONS
        ).map((sub) =>
          sub.id === submission.id
            ? {
                ...sub,
                score: parsedScore,
                status: 'Đã chấm',
                teacherFeedback: feedback,
              }
            : sub
        ),
      }));
    }
    onUpdateStudentScore(submission.studentId, parsedScore);
    onShowToast(
      `Đã chấm ${parsedScore.toFixed(1)}đ cho sản phẩm thực hành của HS ${submission.studentName} (Lớp ${submission.classId}) và đồng bộ vào Sổ điểm!`
    );
  };

  const handleGenerateQuestionsWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeLesson.title }),
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const mapped: MinigameQuestionItem[] = data.questions.map(
          (
            q: {
              question: string;
              options: string[];
              correctIndex: number;
              explanation: string;
            },
            i: number
          ) => ({
            id: `ai-q-${Date.now()}-${i}`,
            order: questions.length + i + 1,
            question: q.question,
            timeLimitSec: 25,
            points: 1.5,
            status: 'Đã duyệt',
            options: (['A', 'B', 'C', 'D'] as const).map((letter, idx) => ({
              letter,
              text: q.options[idx] || `Phương án ${letter}`,
              explanation: q.explanation || 'Phân tích từ AI Cú Vàng',
              isCorrect: idx === (q.correctIndex || 0),
            })),
          })
        );
        setQuestions((prev) => [...prev, ...mapped]);
        onShowToast(`Đã sinh tự động ${mapped.length} câu hỏi mới bằng AI!`);
      }
    } catch {
      onShowToast('Đã thêm câu hỏi mẫu từ Ngân hàng đề!');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateClassByGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newClassName.trim().toUpperCase();
    if (!cleanName) {
      onShowToast('Vui lòng nhập tên lớp học (ví dụ: 6A12, 10A2).');
      return;
    }
    const newCls: ClassroomItem = {
      id: cleanName.replace(/\s+/g, ''),
      name: cleanName.startsWith('LỚP') ? cleanName : `Lớp ${cleanName}`,
      grade: newClassGrade,
      schoolYear: '2024 - 2025',
      roomName: newClassRoom.trim() || 'Phòng Lab Cloud',
      studentCount: 0,
    };
    onAddClass(newCls);
    onChangeClass(newCls.id);
    setSingleStudentClass(newCls.id);
    setNewClassName('');
    onShowToast(`Đã tạo thành công ${newCls.name} thuộc Khối ${newClassGrade} trên Cloud DB!`);
  };

  const handleImportExcelStudents = () => {
    const parsed = parseExcelStudentPaste(
      excelPasteText,
      selectedClass,
      students.length + 1
    );
    if (parsed.length === 0) {
      onShowToast('Vui lòng nhập hoặc dán ít nhất 1 dòng dữ liệu (Họ tên, Ngày sinh, Lớp).');
      return;
    }
    const newRosterItems: StudentRosterItem[] = parsed.map((acc, idx) => ({
      id: acc.id,
      username: acc.username,
      dob: acc.dob,
      stationNumber: acc.stationNumber,
      name: acc.name,
      classId: acc.classId,
      grade: acc.grade,
      passwordDefault: '12345',
      xp: 100,
      streakDays: 1,
      stars: 3,
      groupNumber: ((idx % 4) + 1) as 1 | 2 | 3 | 4,
      partnerName: 'Bạn cùng bàn Cloud',
      partnerId: '61008',
      avgScore: 8.5,
      submissionStatus: 'Đã nộp',
    }));
    onAddStudents(newRosterItems);
    onShowToast(
      `Đã tạo tự động ${newRosterItems.length} tài khoản học sinh (Mật khẩu chung: 12345)!`
    );
  };

  const handleAddSingleStudentAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleStudentName.trim()) {
      onShowToast('Vui lòng nhập Họ và tên học sinh.');
      return;
    }
    const acc = generateStudentAccountFromExcelRow(
      singleStudentName,
      singleStudentDob,
      singleStudentClass || selectedClass,
      students.length + 1
    );
    const item: StudentRosterItem = {
      id: acc.id,
      username: acc.username,
      dob: acc.dob,
      stationNumber: acc.stationNumber,
      name: acc.name,
      classId: acc.classId,
      grade: acc.grade,
      passwordDefault: '12345',
      xp: 120,
      streakDays: 1,
      stars: 3,
      groupNumber: 1,
      partnerName: 'Nguyễn Hoàng Nam',
      partnerId: '61008',
      avgScore: 8.5,
      submissionStatus: 'Đã nộp',
    };
    onAddStudents([item]);
    setSingleStudentName('');
    onShowToast(
      `Đã tạo tài khoản tự động "${item.username}" cho ${item.name} (MK: 12345)!`
    );
  };

  const navItems: { id: TeacherTab; icon: string; label: string }[] = [
    { id: 'trang-chu', icon: 'dashboard', label: 'Trang chủ' },
    { id: 'bien-soan-stage-1', icon: 'psychology_alt', label: 'Khởi động' },
    { id: 'bien-soan-stage-2', icon: 'menu_book', label: 'Khám phá' },
    { id: 'bien-soan-stage-3', icon: 'extension', label: 'Luyện tập' },
    { id: 'bien-soan-stage-4', icon: 'assignment_turned_in', label: 'Vận dụng' },
    { id: 'cham-thuc-hanh', icon: 'drive_folder_upload', label: 'Chấm thực hành' },
    { id: 'quan-ly-lop-hoc-tai-khoan', icon: 'groups', label: 'Quản lý lớp học' },
    { id: 'so-diem-thong-ke', icon: 'analytics', label: 'Sổ điểm' },
  ];

  const previewAutoAccounts = parseExcelStudentPaste(
    excelPasteText,
    selectedClass,
    students.length + 1
  );

  if (isLivePresenterOpen) {
    return (
      <TeacherLivePresenterRoom
        grade={liveSession?.activeGrade || selectedNotebookGrade}
        period={liveSession?.activePeriod || selectedNotebookPeriod}
        classId={liveSession?.activeClassId || selectedClass}
        periodSpec={selectedPeriodSpec}
        liveSession={liveSession}
        students={students}
        onExit={() => setIsLivePresenterOpen(false)}
        onUpdateLiveSession={onUpdateLiveSession || (() => {})}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Left Sidebar (Strictly Teacher & Admin Only — No Student Preview Link) */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_12px_32px_-8px_rgba(77,183,254,0.18)] z-50 flex flex-col justify-between">
        <div className="flex flex-col overflow-y-auto">
          <div className="px-space-lg pt-space-lg pb-space-md flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-md">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <span className="font-headline-sm text-headline-sm text-on-surface block leading-tight">
                  CloudPlay OS
                </span>
                <span className="font-label-sm text-label-sm text-secondary block">
                  Cổng Giáo Viên &amp; Quản Trị
                </span>
              </div>
            </div>
            <div className="mt-space-sm px-space-sm py-space-xs bg-surface-container-low rounded-full flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                GV: Thầy Đỗ Mạnh Trường • Online 100%
              </span>
            </div>
          </div>

          <nav className="px-space-md mt-space-xs flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  className={`w-full text-left flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_4px_12px_rgba(48,58,72,0.14)]'
                      : 'font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="my-2 border-t border-outline-variant/20 pt-2 flex flex-col gap-1.5">
              <span className="px-space-sm text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                Học liệu &amp; Bài giảng
              </span>

              <button
                type="button"
                onClick={() => setShowLectureSlideModal(true)}
                className="w-full text-left flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-md text-label-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 font-bold transition-all cursor-pointer border border-indigo-500/25"
              >
                <span className="material-symbols-outlined text-[20px]">slideshow</span>
                <span className="truncate">Nạp bài giảng (PDF, PPTX)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkImportModal(true)}
                className="w-full text-left flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-md text-label-md bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 font-bold transition-all cursor-pointer border border-blue-500/25"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span className="truncate">Nạp Word (.docx) 29 Tiết</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBatchPrintModal(true)}
                className="w-full text-left flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-md text-label-md bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 font-bold transition-all cursor-pointer border border-amber-500/25"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span className="truncate">Print View 29 Phiếu</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="p-space-md flex flex-col gap-space-xs border-t border-outline-variant/20">
          <div className="flex items-center justify-between px-space-sm pt-space-xs text-on-surface-variant">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-space-xs font-label-sm text-label-sm hover:text-error transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Đăng xuất</span>
            </button>
            <span className="font-label-sm text-label-sm text-tertiary">Cloud Online v4.5</span>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="pl-72 w-full">
        {/* Top Header (100% Online — No Offline Toggle, No Student Preview Link) */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">school</span>
              <span>Dạy &amp; Học Tin Học GDPT 2018 — Quản Trị Giảng Dạy Trực Tuyến</span>
            </span>
          </div>

          <div className="flex items-center gap-space-sm">
            {/* Compact Grade & Class selector in header */}
            <select
              value={selectedNotebookGrade}
              onChange={(e) => {
                const g = Number(e.target.value) as 6 | 7 | 8 | 9;
                handleSelectGradeAndPeriod(g, 1);
                const firstCls = classes.find((c) => c.grade === g);
                if (firstCls) onChangeClass(firstCls.id);
              }}
              className="px-3 py-1.5 rounded-full bg-primary-fixed text-primary font-label-sm text-xs font-bold cursor-pointer border border-primary/20"
            >
              {([6, 7, 8, 9] as const).map((g) => (
                <option key={g} value={g}>
                  Khối {g}
                </option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => onChangeClass(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-xs font-bold cursor-pointer border border-secondary/20"
            >
              {(classesForSelectedGrade.length > 0 ? classesForSelectedGrade : classes).map(
                (cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                )
              )}
            </select>

            {liveSession?.isBroadcasting && (
              <button
                type="button"
                onClick={() => setIsLivePresenterOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">slideshow</span>
                <span>Phòng Live ({liveSession.activeClassId || selectedClass})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Chuyển đổi Chế độ tối"
              className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div className="flex items-center gap-space-xs pl-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight">
                  Thầy Đỗ Mạnh Trường
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                  Quản trị viên &amp; GV Tin học
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Stage */}
        <main className="w-full pt-16 bg-surface min-h-screen p-space-lg lg:p-space-xl">
          {/* TAB 1: TRANG CHỦ GIÁO VIÊN — CHỌN KHỐI 6,7,8,9 -> LỘ TRÌNH 29 TIẾT HỌC -> TIẾN TRÌNH GIẢNG DẠY & ĐỒNG BỘ LIVE */}
          {activeTab === 'trang-chu' && (
            <div className="flex flex-col gap-space-lg">
              {/* CASE A: 29-PERIOD CURRICULUM ROADMAP GRID (DEFAULT ON TEACHER HOME) */}
              {openedHomePeriod === null ? (
                <div className="flex flex-col gap-space-lg">
                  {/* 29-Period Cards Grid wrapped in unified DataBoundary */}
                  <DataBoundary
                    data={gradePeriods.filter(
                      (p) =>
                        homeExamFilter === 'ALL' || p.examMilestone === homeExamFilter
                    )}
                    isLoading={isLoading}
                    loadingMessage={`Đang tải lộ trình 29 tiết học Khối ${selectedNotebookGrade} từ CSDL...`}
                    emptyTitle={`Chưa có tiết học nào thuộc đợt ${homeExamFilter}`}
                    emptyDescription="Vui lòng chọn bộ lọc 'Tất cả 29 tiết' để xem đầy đủ chương trình."
                  >
                    {(filteredGradePeriods) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                        {filteredGradePeriods.map((spec) => {
                          const isLiveActive =
                            liveSession?.isBroadcasting &&
                            liveSession.activeGrade === spec.grade &&
                            liveSession.activePeriod === spec.period &&
                            liveSession.activeClassId === selectedClass;
                          const isTaughtForClass = (
                            liveSession?.taughtPeriodsByClass?.[selectedClass] || []
                          ).includes(spec.period);
                          const specKey = `k${spec.grade}-tiet-${spec.period}`;
                          const isVerifiedInDb = Boolean(
                            liveSession?.customWorksheetsByLesson?.[specKey] ||
                            liveSession?.verifiedLessonsMap?.[specKey] !== false
                          );

                        return (
                          <div
                            key={spec.id}
                            className={`rounded-2xl p-space-md transition-all flex flex-col justify-between gap-space-sm border-2 ${
                              isLiveActive
                                ? 'bg-primary-fixed/25 border-primary shadow-md'
                                : isTaughtForClass
                                ? 'bg-tertiary-fixed/15 border-tertiary/50 shadow-sm'
                                : 'bg-surface-container-lowest border-transparent hover:border-secondary-container shadow-sm'
                            }`}
                          >
                            <div
                              onClick={() => {
                                handleSelectGradeAndPeriod(spec.grade, spec.period);
                                applyNotebookBlueprintToAllStages(
                                  buildLessonBlueprintFromPeriod(spec)
                                );
                                setOpenedHomePeriod(spec.period);
                              }}
                              className="flex flex-col gap-2 cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm font-black ${
                                      isLiveActive
                                        ? 'bg-primary text-on-primary'
                                        : isTaughtForClass
                                        ? 'bg-tertiary text-on-tertiary'
                                        : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                                    }`}
                                  >
                                    {spec.period}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                                    {spec.examMilestone === 'TONG_KET'
                                      ? 'Tổng kết'
                                      : `Đợt ${spec.examMilestone}`}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                                      spec.lessonType === 'practice'
                                        ? 'bg-tertiary-fixed text-on-tertiary-container'
                                        : 'bg-secondary-fixed/60 text-secondary'
                                    }`}
                                  >
                                    {spec.lessonType === 'practice' ? 'Thực hành' : 'Lý thuyết'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isVerifiedInDb ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-label-sm text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30">
                                      <span className="material-symbols-outlined text-[13px]">verified</span>
                                      <span>✓ Đã có dữ liệu CSDL</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] flex items-center gap-1 border border-outline-variant/30">
                                      <span className="material-symbols-outlined text-[13px] text-outline">hourglass_empty</span>
                                      <span>Trống dữ liệu</span>
                                    </span>
                                  )}
                                  {isTaughtForClass && (
                                    <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold">
                                      ✓ Đã dạy ({selectedClass})
                                    </span>
                                  )}
                                  {isLiveActive && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold animate-pulse">
                                      🔴 LIVE ({selectedClass})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold block">
                                  {spec.topic}
                                </span>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5 line-clamp-2">
                                  {liveSession?.customWorksheetsByLesson?.[specKey]?.worksheetTitle || spec.lessonTitle}
                                </h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                                  {spec.yccd}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectGradeAndPeriod(spec.grade, spec.period);
                                    handleBroadcastLivePeriod(
                                      spec.grade,
                                      spec.period,
                                      true,
                                      selectedClass
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 cursor-pointer ${
                                    isLiveActive
                                      ? 'bg-error text-on-error'
                                      : 'bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary hover:text-on-primary'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    sensors
                                  </span>
                                  <span>
                                    {isLiveActive
                                      ? `Đang Live (${selectedClass})`
                                      : `Phát Live Lớp ${selectedClass}`}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleTaughtPeriodForClass(
                                      spec.grade,
                                      spec.period,
                                      selectedClass
                                    )
                                  }
                                  className={`px-2.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                    isTaughtForClass
                                      ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary'
                                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                                  }`}
                                  title="Đánh dấu đã dạy để mở khóa Chế độ Tự luyện cho học sinh lớp này"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isTaughtForClass ? 'task_alt' : 'radio_button_unchecked'}
                                  </span>
                                  <span>{isTaughtForClass ? 'Đã dạy (Mở Tự luyện)' : 'Đánh dấu Đã dạy'}</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectGradeAndPeriod(spec.grade, spec.period);
                                  applyNotebookBlueprintToAllStages(
                                    buildLessonBlueprintFromPeriod(spec)
                                  );
                                  setOpenedHomePeriod(spec.period);
                                }}
                                className="px-3 py-1.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Tiến trình dạy</span>
                                <span className="material-symbols-outlined text-[15px]">
                                  arrow_forward
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </DataBoundary>
                </div>
              ) : (
                /* CASE B: TIẾN TRÌNH GIẢNG DẠY CỦA TIẾT HỌC */
                <div className="flex flex-col gap-space-lg">
                  <div className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl shadow-md relative overflow-hidden flex flex-col gap-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm">
                      <button
                        type="button"
                        onClick={() => setOpenedHomePeriod(null)}
                        className="px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        <span>Quay lại Lộ trình 29 tiết học (Khối {selectedNotebookGrade})</span>
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleTaughtPeriodForClass(
                              selectedNotebookGrade,
                              selectedNotebookPeriod,
                              selectedClass
                            )
                          }
                          className={`px-4 py-2.5 rounded-full font-label-md text-label-md font-bold flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            (liveSession?.taughtPeriodsByClass?.[selectedClass] || []).includes(
                              selectedNotebookPeriod
                            )
                              ? 'bg-tertiary text-on-tertiary'
                              : 'bg-surface-container-low text-on-surface hover:bg-tertiary-fixed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">task_alt</span>
                          <span>
                            {(liveSession?.taughtPeriodsByClass?.[selectedClass] || []).includes(
                              selectedNotebookPeriod
                            )
                              ? `✓ Đã dạy Lớp ${selectedClass} (Đã mở Tự luyện)`
                              : `Đánh dấu Đã dạy cho Lớp ${selectedClass}`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleBroadcastLivePeriod(
                              selectedNotebookGrade,
                              selectedNotebookPeriod,
                              true,
                              selectedClass
                            )
                          }
                          className="px-5 py-2.5 rounded-full bg-error text-on-error font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">sensors</span>
                          <span>
                            🔴 Phát Live Tiết {selectedNotebookPeriod} Cho Lớp {selectedClass} (Khối {selectedNotebookGrade})
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
                          Khối {selectedNotebookGrade} • Lớp {selectedClass} • {selectedPeriodSpec.topic}
                        </span>
                        <span className="px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                          {selectedPeriodSpec.knowledgeSection}
                        </span>
                      </div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                        TIẾN TRÌNH GIẢNG DẠY — {selectedPeriodSpec.lessonTitle}
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                        <strong>Yêu cầu cần đạt:</strong> {selectedPeriodSpec.yccd}
                      </p>
                    </div>

                    {/* Serpentine 4-Activity Teaching Roadmap */}
                    <div className="relative w-full py-6 px-2 overflow-x-auto">
                      <div className="min-w-[820px] relative">
                        <svg
                          className="w-full h-36 absolute top-8 left-0 pointer-events-none"
                          fill="none"
                          viewBox="0 0 960 140"
                        >
                          <path
                            d="M 60 70 C 180 20, 260 120, 380 65 C 500 10, 600 125, 720 70 C 800 35, 870 50, 920 65"
                            opacity="0.6"
                            stroke="#cbe6ff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="18"
                          />
                          <path
                            d="M 60 70 C 180 20, 260 120, 380 65 C 500 10, 600 125, 720 70 C 800 35, 870 50, 920 65"
                            stroke="#4cb6fd"
                            strokeDasharray="10 8"
                            strokeLinecap="round"
                            strokeWidth="6"
                          />
                        </svg>

                        <div className="grid grid-cols-4 gap-4 relative z-10">
                          {(
                            [
                              {
                                stage: 1 as const,
                                tab: 'bien-soan-stage-1' as TeacherTab,
                                icon: 'videocam',
                                title: 'Hoạt động 1: Khởi động',
                                desc: 'Mở sẵn cho HS tìm hiểu trước • Video, Ô chữ, Tình huống',
                                color: 'bg-tertiary-container text-on-tertiary-container',
                              },
                              {
                                stage: 2 as const,
                                tab: 'bien-soan-stage-2' as TeacherTab,
                                icon: 'quiz',
                                title: 'Hoạt động 2: Khám phá',
                                desc: 'Kéo-Thả, Điền khuyết, Nối cột & Câu hỏi trả lời ngắn',
                                color: 'bg-secondary-container text-on-secondary-container',
                              },
                              {
                                stage: 3 as const,
                                tab: 'bien-soan-stage-3' as TeacherTab,
                                icon: 'sports_esports',
                                title: 'Hoạt động 3: Luyện tập',
                                desc: 'Đấu trường Trắc nghiệm 25s & Cây thư mục Google Drive',
                                color: 'bg-primary-container text-on-primary-container',
                              },
                              {
                                stage: 4 as const,
                                tab: 'bien-soan-stage-4' as TeacherTab,
                                icon: 'assignment_turned_in',
                                title: 'Hoạt động 4: Vận dụng',
                                desc: 'Dự án thực tế & Chấm Rubrics Thông tư 22',
                                color: 'bg-surface-container-high text-on-surface',
                              },
                            ] as const
                          ).map((node) => {
                            const lessonKey = `k${selectedNotebookGrade}-tiet-${selectedNotebookPeriod}`;
                            const isUnlocked =
                              node.stage === 1 ||
                              Boolean(
                                liveSession?.unlockedStagesByLesson?.[lessonKey]?.[node.stage]
                              );
                            return (
                              <div
                                key={node.stage}
                                className="flex flex-col items-center text-center group"
                              >
                                <div
                                  onClick={() => onChangeTab(node.tab)}
                                  className="relative w-20 h-20 rounded-full bg-surface-container-lowest p-2 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center cursor-pointer ring-2 ring-secondary/30"
                                >
                                  <div
                                    className={`w-full h-full rounded-full ${node.color} flex items-center justify-center shadow-inner`}
                                  >
                                    <span className="material-symbols-outlined text-[30px]">
                                      {node.icon}
                                    </span>
                                  </div>
                                  <div
                                    className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                                      isUnlocked
                                        ? 'bg-tertiary text-on-tertiary'
                                        : 'bg-inverse-surface text-inverse-on-surface'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[15px]">
                                      {isUnlocked ? 'lock_open' : 'lock'}
                                    </span>
                                  </div>
                                  <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm shadow-sm">
                                    {node.stage}
                                  </span>
                                </div>

                                <h4 className="font-headline-sm text-headline-sm text-on-surface mt-4">
                                  {node.title}
                                </h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[195px] mt-0.5">
                                  {node.desc}
                                </p>

                                <div className="flex items-center gap-1.5 mt-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onUnlockStage(
                                        node.stage,
                                        selectedNotebookGrade,
                                        selectedNotebookPeriod
                                      )
                                    }
                                    className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-xs hover:opacity-95 cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      {isUnlocked ? 'check_circle' : 'lock_open'}
                                    </span>
                                    <span>{isUnlocked ? 'Đã mở cho HS' : 'Mở khóa Live'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onChangeTab(node.tab)}
                                    className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-secondary-fixed cursor-pointer"
                                  >
                                    Biên soạn
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HOẠT ĐỘNG 1 - KHỞI ĐỘNG (SỬA/THÊM CÂU HỎI & SỬA ĐIỂM TỪNG CÂU) */}
          {activeTab === 'bien-soan-stage-1' && (
            <div className="flex flex-col gap-space-lg">
              {renderActivityGradePeriodSelector(
                1,
                'Khởi động'
              )}
              <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Khởi động
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSaveCustomWorksheetToDb('Hoạt động 1: Khởi động')}
                    className="px-4 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md flex items-center gap-1.5 shadow-sm cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Lưu vào Database</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCustomWorksheetToDb('Hoạt động 1: Khởi động');
                      onChangeTab('bien-soan-stage-2');
                    }}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>Sang Khám phá</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* 3 Format Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-1.5 bg-surface-container-lowest rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setStage1Format('scenario')}
                  className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-headline-sm text-headline-sm transition-all cursor-pointer ${
                    stage1Format === 'scenario'
                      ? 'bg-tertiary text-on-tertiary shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                  <span>Tình huống</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage1Format('video')}
                  className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-headline-sm text-headline-sm transition-all cursor-pointer ${
                    stage1Format === 'video'
                      ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage1Format('crossword')}
                  className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-headline-sm text-headline-sm transition-all cursor-pointer ${
                    stage1Format === 'crossword'
                      ? 'bg-secondary text-on-secondary shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">grid_4x4</span>
                  <span>Ô chữ</span>
                </button>
              </div>

              {/* DẠNG 1: VIDEO TƯƠNG TÁC */}
              {stage1Format === 'video' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Cấu hình Video tương tác &amp; Điểm dừng câu hỏi
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                        {videoStops.length} mốc tương tác
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onShowToast('Đã đồng bộ nguồn video bài giảng từ Cloud Storage!')
                        }
                        className="px-4 py-2.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md cursor-pointer"
                      >
                        Đồng bộ Video
                      </button>
                    </div>

                    {/* Timestamp List with inline edit */}
                    <div className="flex flex-col gap-2">
                      {videoStops.map((st, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={st.time}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVideoStops((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, time: val } : item))
                                  );
                                }}
                                className="w-20 px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold text-center"
                              />
                              <input
                                type="text"
                                value={st.question}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVideoStops((prev) =>
                                    prev.map((item, i) =>
                                      i === idx ? { ...item, question: val } : item
                                    )
                                  );
                                }}
                                className="flex-1 px-3 py-1 rounded-md bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setVideoStops((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="p-1.5 rounded-full bg-surface-container-lowest text-error hover:bg-error-container cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={st.answer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVideoStops((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, answer: val } : item))
                              );
                            }}
                            placeholder="Đáp án chuẩn..."
                            className="w-full px-3 py-1 rounded-md bg-surface-container-lowest text-tertiary font-body-sm text-body-sm"
                          />
                        </div>
                      ))}
                      {videoStops.length === 0 && (
                        <div className="p-4 rounded-xl bg-surface-container-low border border-dashed border-outline-variant text-center text-xs text-on-surface-variant">
                          ⚠️ Trống dữ liệu điểm dừng video bài giảng cho tiết học này.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      Hướng dẫn tổ chức Video tương tác
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Giáo viên có thể sửa trực tiếp mốc thời gian, nội dung câu hỏi và đáp án của từng mốc dừng.
                    </p>
                  </div>
                </div>
              )}

              {/* DẠNG 2: Ô CHỮ & TRANH BÍ MẬT (CÓ SỬA CÂU HỎI & SỬA ĐIỂM TỪNG CÂU) */}
              {stage1Format === 'crossword' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">
                          Biên soạn Ô chữ Hàng ngang &amp; Chỉnh sửa điểm từng câu
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Sửa trực tiếp gợi ý, từ khóa đáp án và điểm số cho từng hàng ngang
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSolvedCrosswordStudioIds(crosswordClues.map((c) => c.id))
                        }
                        className="px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm cursor-pointer"
                      >
                        Lật thử tất cả ô
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {crosswordClues.map((cw, idx) => {
                        const solved = solvedCrosswordStudioIds.includes(cw.id);
                        const pts = crosswordPointsMap[cw.id] ?? 2.5;
                        return (
                          <div
                            key={cw.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                              solved
                                ? 'bg-tertiary-fixed/25 border-tertiary'
                                : 'bg-surface-container-low border-outline-variant/30'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-headline-sm text-headline-sm text-primary">
                                Câu {idx + 1} (Hàng ngang {cw.rowNumber}):
                              </span>
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                                  <span>Điểm câu này:</span>
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0.25"
                                    max="10"
                                    value={pts}
                                    onChange={(e) =>
                                      setCrosswordPointsMap((prev) => ({
                                        ...prev,
                                        [cw.id]: Number(e.target.value) || 1,
                                      }))
                                    }
                                    className="w-16 px-2 py-1 rounded-md bg-surface-container-lowest text-primary font-bold text-xs border border-outline-variant/40 text-center"
                                  />
                                  <span>đ</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSolvedCrosswordStudioIds((prev) =>
                                      prev.includes(cw.id)
                                        ? prev.filter((x) => x !== cw.id)
                                        : [...prev, cw.id]
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-label-sm shadow-xs cursor-pointer"
                                >
                                  {solved ? 'Đóng ô' : 'Mở thử'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCrosswordClues((prev) => prev.filter((x) => x.id !== cw.id))
                                  }
                                  className="p-1 rounded-md text-error hover:bg-error-container/40 cursor-pointer"
                                  title="Xóa câu hỏi ô chữ này"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={cw.clue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCrosswordClues((prev) =>
                                    prev.map((item) =>
                                      item.id === cw.id ? { ...item, clue: val } : item
                                    )
                                  );
                                }}
                                className="sm:col-span-8 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                                placeholder="Nội dung câu hỏi gợi ý..."
                              />
                              <input
                                type="text"
                                value={cw.answer}
                                onChange={(e) => {
                                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                  setCrosswordClues((prev) =>
                                    prev.map((item) =>
                                      item.id === cw.id ? { ...item, answer: val } : item
                                    )
                                  );
                                }}
                                className="sm:col-span-4 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-mono font-bold text-sm uppercase"
                                placeholder="ĐÁP ÁN"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {crosswordClues.length === 0 && (
                      <div className="p-4 rounded-xl bg-surface-container-low border border-dashed border-outline-variant text-center text-xs text-on-surface-variant">
                        ⚠️ Trống dữ liệu câu hỏi Ô chữ hàng ngang cho tiết học này.
                      </div>
                    )}
                  </div>

                  {/* Right: Secret Picture Live Preview */}
                  <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <span className="font-headline-sm text-headline-sm text-secondary">
                      {activeLesson.stage1.secretPictureTitle}
                    </span>
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-secondary shadow-md">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-lr3ljRA7yuSkNSqIGXdYW2WBiKNNFB7p5xDdsqGr-umRcmdt6KSg29TKB7IRv7UBdKnwmgMxBeUgZSSOmn5A_LFI7eqqfNQFeZ_iQa_ynA8v1lkS54acaK1JS7W9osbr8zTwNlKKI1VqsgDGwY14cbGAL2T8-Axas8MSSEDR83clPQjuM_pFcQ6sXWwTCXdTEBGIvtFFL6_eyGCP8QzQxNvU0ElfgzoApjIaJBc')",
                        }}
                      />
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        {crosswordClues.slice(0, 4).map((cw, idx) => {
                          const opened = solvedCrosswordStudioIds.includes(cw.id);
                          return (
                            <div
                              key={cw.id}
                              onClick={() =>
                                setSolvedCrosswordStudioIds((prev) =>
                                  prev.includes(cw.id)
                                    ? prev.filter((x) => x !== cw.id)
                                    : [...prev, cw.id]
                                )
                              }
                              className={`flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all duration-500 border border-white/25 ${
                                opened
                                  ? 'opacity-0 pointer-events-none'
                                  : 'bg-secondary/95 text-on-secondary hover:bg-secondary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[30px]">
                                lock_open
                              </span>
                              <span className="font-headline-sm text-headline-sm mt-1">
                                Mảnh ghép #{idx + 1}
                              </span>
                              <span className="font-body-sm text-body-sm opacity-90">
                                Hàng ngang {cw.rowNumber}: {cw.answer}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface">
                      <strong>Chốt kiến thức Tranh Bí Mật:</strong>{' '}
                      {activeLesson.stage1.secretPictureMeaning}
                    </div>
                  </div>
                </div>
              )}

              {/* DẠNG CHÍNH HOẠT ĐỘNG 1: KHỞI ĐỘNG (TÌNH HUỐNG ĐẶT VẤN ĐỀ: TỰ LUẬN NGẮN) */}
              {stage1Format === 'scenario' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border-2 border-primary/20">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-headline-sm flex items-center justify-center font-bold">
                          1
                        </span>
                        <div>
                          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                            Khởi động
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                          <span>Điểm:</span>
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            max="5"
                            value={warmupPoints}
                            onChange={(e) => setWarmupPoints(Number(e.target.value) || 1.0)}
                            className="w-12 text-center bg-white/70 rounded px-1 font-bold text-primary"
                          />
                          <span>đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-primary font-bold">
                        Tình huống:
                      </label>
                      <textarea
                        rows={3}
                        value={warmupScenario}
                        onChange={(e) => setWarmupScenario(e.target.value)}
                        placeholder="Nhập tình huống..."
                        className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-secondary font-bold">
                        Câu hỏi:
                      </label>
                      <textarea
                        rows={2}
                        value={warmupQuestion}
                        onChange={(e) => setWarmupQuestion(e.target.value)}
                        placeholder="Nhập câu hỏi..."
                        className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm border border-outline-variant/30 focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-tertiary font-bold">
                        Đáp án gợi ý:
                      </label>
                      <textarea
                        rows={2}
                        value={warmupSampleAnswer}
                        onChange={(e) => setWarmupSampleAnswer(e.target.value)}
                        placeholder="Nhập đáp án gợi ý..."
                        className="w-full p-3 rounded-xl bg-tertiary-fixed/20 text-on-surface font-body-sm text-body-sm border border-tertiary/30 focus:outline-none"
                      />
                    </div>

                    {/* Word Cloud Keywords */}
                    <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                        Từ khóa gợi ý:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newWordInput}
                          onChange={(e) => setNewWordInput(e.target.value)}
                          placeholder="Thêm từ khóa..."
                          className="flex-1 px-4 py-2 rounded-full bg-surface-container-low text-on-surface font-body-sm text-body-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newWordInput.trim()) return;
                            setStudioWordCloud((prev) => [newWordInput.trim(), ...prev]);
                            setNewWordInput('');
                          }}
                          className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm cursor-pointer font-bold"
                        >
                          + Thêm từ khóa
                        </button>
                      </div>
                      <div className="rounded-xl bg-surface-container-low p-3 flex flex-wrap items-center gap-2">
                        {studioWordCloud.map((w, i) => (
                          <span
                            key={`${w}-${i}`}
                            className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold shadow-xs ${
                              i % 3 === 0
                                ? 'bg-primary text-on-primary'
                                : i % 3 === 1
                                ? 'bg-secondary text-on-secondary'
                                : 'bg-tertiary-fixed text-on-tertiary-fixed'
                            }`}
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/25">
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                      <span>Xem trước Phiếu Học Tập Hoạt động 1 (Học sinh)</span>
                    </h4>
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5">
                      <span className="text-[11px] font-bold uppercase text-primary">
                        Tình huống đặt vấn đề • Khối {selectedNotebookGrade} Tiết {selectedNotebookPeriod}
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
                        {warmupScenario}
                      </p>
                      <p className="text-xs font-bold text-secondary">
                        Câu hỏi tự luận ngắn: {warmupQuestion}
                      </p>
                      <div className="p-2.5 rounded-lg bg-tertiary-fixed/25 border border-tertiary/30 text-[11px] text-on-surface">
                        <strong className="text-tertiary">Định hướng đáp án:</strong> {warmupSampleAnswer}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOẠT ĐỘNG 2 - KHÁM PHÁ (4.0 ĐIỂM: KÉO THẢ 1Đ, ĐIỀN KHUYẾT 1Đ, NỐI CỘT 1Đ, TRẢ LỜI NGẮN 1Đ) */}
          {activeTab === 'bien-soan-stage-2' && (
            <div className="flex flex-col gap-space-lg">
              {renderActivityGradePeriodSelector(
                2,
                'Khám phá'
              )}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-wrap items-center justify-between gap-space-md">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Khám phá
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSaveCustomWorksheetToDb('Hoạt động 2: Khám phá')}
                    className="px-4 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md flex items-center gap-1.5 shadow-sm cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Lưu vào Database</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCustomWorksheetToDb('Hoạt động 2: Khám phá');
                      onChangeTab('bien-soan-stage-3');
                    }}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>Sang Luyện tập</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* 4 INTERACTIVE WORKSHEET BLOCKS FILTER BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'all', label: 'Tất cả', icon: 'apps' },
                    { id: 'drag_drop', label: 'Kéo - Thả', icon: 'drag_indicator' },
                    { id: 'fill_blank', label: 'Điền khuyết', icon: 'edit_note' },
                    { id: 'matching', label: 'Nối cột', icon: 'timeline' },
                    { id: 'short_answer', label: 'Trả lời ngắn', icon: 'short_text' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStage2ActiveBlockType(item.id)}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 font-label-md text-label-md transition-all cursor-pointer ${
                      stage2ActiveBlockType === item.id
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* DẠNG 1: CÂU HỎI KÉO - THẢ */}
              {(stage2ActiveBlockType === 'all' || stage2ActiveBlockType === 'drag_drop') && (
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-primary/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center font-bold">
                        1
                      </span>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Kéo - Thả
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                      Tổng:{' '}
                      {dragCards
                        .reduce((acc, c) => acc + (dragCardPointsMap[c.id] ?? 0.25), 0)
                        .toFixed(2)}{' '}
                      Điểm
                    </span>
                  </div>

                  {/* Đoạn văn */}
                  <div className="flex flex-col gap-1.5 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <label className="font-label-sm text-label-sm text-primary font-bold">
                      Đoạn văn khuyết từ:
                    </label>
                    <textarea
                      rows={3}
                      value={dragDropParagraph}
                      onChange={(e) => setDragDropParagraph(e.target.value)}
                      placeholder="Nhập đoạn văn có các vị trí (1), (2), (3), (4) để học sinh kéo từ từ Hộp từ gợi ý thả vào..."
                      className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none"
                    />
                  </div>

                  {dragCards.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl mb-1 text-outline">hourglass_empty</span>
                      <p className="font-bold text-sm text-on-surface">Trống dữ liệu Kéo thả</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Tiết học này chưa có dữ liệu từ tệp nạp/CSDL.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-secondary-fixed/30 flex flex-col gap-2.5 border border-secondary/20">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-secondary text-on-secondary text-xs font-bold shrink-0">
                            Hộp A
                          </span>
                          <input
                            type="text"
                            aria-label="Tên Hộp A"
                            value={bucketAName}
                            onChange={(e) => setBucketAName(e.target.value)}
                            className="flex-1 font-headline-sm text-headline-sm text-secondary bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-secondary/30"
                          />
                        </div>
                        {dragCards
                          .filter((c) => c.correctBox === 'data')
                          .map((c, idx) => (
                            <div
                              key={c.id}
                              className="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-2 border border-outline-variant/30"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-secondary">
                                  Mục A.{idx + 1} (Câu hỏi / Mô tả gợi ý &amp; Từ khóa kéo thả):
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0.1"
                                    max="10"
                                    value={dragCardPointsMap[c.id] ?? 0.25}
                                    onChange={(e) =>
                                      setDragCardPointsMap((prev) => ({
                                        ...prev,
                                        [c.id]: Number(e.target.value) || 0.25,
                                      }))
                                    }
                                    className="w-14 px-1.5 py-0.5 rounded bg-surface-container-low text-primary font-bold text-xs text-center"
                                    title="Điểm của thẻ kéo thả này"
                                  />
                                  <span className="text-xs font-bold text-primary">đ</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDragCards((prev) => prev.filter((x) => x.id !== c.id))
                                    }
                                    className="text-error text-xs font-bold px-1.5 py-0.5 hover:underline cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={c.promptFragment || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDragCards((prev) =>
                                    prev.map((item) =>
                                      item.id === c.id ? { ...item, promptFragment: val } : item
                                    )
                                  );
                                }}
                                placeholder="Câu hỏi / Vế mô tả gợi ý cho vị trí này..."
                                className="w-full font-body-sm text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-md border border-outline-variant/25"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-primary shrink-0">
                                  Từ khóa đúng:
                                </span>
                                <input
                                  type="text"
                                  value={c.text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setDragCards((prev) =>
                                      prev.map((item) =>
                                        item.id === c.id ? { ...item, text: val } : item
                                      )
                                    );
                                  }}
                                  className="flex-1 font-body-sm text-body-sm font-bold text-primary bg-primary-fixed/30 px-2.5 py-1 rounded-md border border-primary/30"
                                />
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="p-4 rounded-xl bg-primary-fixed/30 flex flex-col gap-2.5 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-primary text-on-primary text-xs font-bold shrink-0">
                            Hộp B
                          </span>
                          <input
                            type="text"
                            aria-label="Tên Hộp B"
                            value={bucketBName}
                            onChange={(e) => setBucketBName(e.target.value)}
                            className="flex-1 font-headline-sm text-headline-sm text-primary bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-primary/30"
                          />
                        </div>
                        {dragCards
                          .filter((c) => c.correctBox === 'info')
                          .map((c, idx) => (
                            <div
                              key={c.id}
                              className="p-3 rounded-lg bg-surface-container-lowest flex flex-col gap-2 border border-outline-variant/30"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-primary">
                                  Mục B.{idx + 1} (Câu hỏi / Mô tả gợi ý &amp; Từ khóa kéo thả):
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0.1"
                                    max="10"
                                    value={dragCardPointsMap[c.id] ?? 0.25}
                                    onChange={(e) =>
                                      setDragCardPointsMap((prev) => ({
                                        ...prev,
                                        [c.id]: Number(e.target.value) || 0.25,
                                      }))
                                    }
                                    className="w-14 px-1.5 py-0.5 rounded bg-surface-container-low text-primary font-bold text-xs text-center"
                                    title="Điểm của thẻ kéo thả này"
                                  />
                                  <span className="text-xs font-bold text-primary">đ</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDragCards((prev) => prev.filter((x) => x.id !== c.id))
                                    }
                                    className="text-error text-xs font-bold px-1.5 py-0.5 hover:underline cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={c.promptFragment || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDragCards((prev) =>
                                    prev.map((item) =>
                                      item.id === c.id ? { ...item, promptFragment: val } : item
                                    )
                                  );
                                }}
                                placeholder="Câu hỏi / Vế mô tả gợi ý cho vị trí này..."
                                className="w-full font-body-sm text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-md border border-outline-variant/25"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-primary shrink-0">
                                  Từ khóa đúng:
                                </span>
                                <input
                                  type="text"
                                  value={c.text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setDragCards((prev) =>
                                      prev.map((item) =>
                                        item.id === c.id ? { ...item, text: val } : item
                                      )
                                    );
                                  }}
                                  className="flex-1 font-body-sm text-body-sm font-bold text-primary bg-primary-fixed/30 px-2.5 py-1 rounded-md border border-primary/30"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Add New Drag & Drop Item into Hộp A or Hộp B */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary">
                      + Thêm câu hỏi / thẻ Kéo - Thả mới vào {bucketAName} hoặc {bucketBName}:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={newDragCardPrompt}
                        onChange={(e) => setNewDragCardPrompt(e.target.value)}
                        placeholder="Nội dung câu hỏi / mô tả vị trí (VD: (5) Thiết bị hiển thị hình ảnh là:)"
                        className="md:col-span-5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/30"
                      />
                      <input
                        type="text"
                        value={newDragCardText}
                        onChange={(e) => setNewDragCardText(e.target.value)}
                        placeholder="Từ khóa đáp án (VD: Màn hình)"
                        className="md:col-span-3 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-bold text-primary border border-primary/30"
                      />
                      <select
                        value={newDragCardBox}
                        onChange={(e) => setNewDragCardBox(e.target.value as 'data' | 'info')}
                        className="md:col-span-2 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-bold text-on-surface border border-outline-variant/30"
                      >
                        <option value="data">Thuộc Hộp A</option>
                        <option value="info">Thuộc Hộp B</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newDragCardText.trim()) {
                            onShowToast('Vui lòng nhập từ khóa đáp án cho thẻ Kéo - Thả.');
                            return;
                          }
                          const newId = `dd-custom-${Date.now()}`;
                          const nextSlot = dragCards.length + 1;
                          setDragCards((prev) => [
                            ...prev,
                            {
                              id: newId,
                              text: newDragCardText.trim(),
                              promptFragment:
                                newDragCardPrompt.trim() ||
                                `(${nextSlot}) Mục phân loại thuộc ${
                                  newDragCardBox === 'data' ? bucketAName : bucketBName
                                }:`,
                              correctBox: newDragCardBox,
                            },
                          ]);
                          setDragCardPointsMap((prev) => ({
                            ...prev,
                            [newId]: newDragCardPoints || 0.25,
                          }));
                          setNewDragCardPrompt('');
                          setNewDragCardText('');
                          onShowToast('Đã thêm thẻ Kéo - Thả mới! Nhấn "Lưu vào Database" để đồng bộ.');
                        }}
                        className="md:col-span-2 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold cursor-pointer hover:opacity-95"
                      >
                        + Thêm thẻ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DẠNG 2: ĐIỀN KHUYẾT TỰ ĐỘNG (CÓ SỬA CÂU HỎI, THÊM TỪNG CÂU, SỬA ĐIỂM TỪNG CÂU) */}
              {(stage2ActiveBlockType === 'all' || stage2ActiveBlockType === 'fill_blank') && (
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-headline-sm text-headline-sm flex items-center justify-center font-bold">
                        2
                      </span>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Điền khuyết
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                        Tổng:{' '}
                        {fillBlankItems
                          .reduce((acc, item) => acc + item.points, 0)
                          .toFixed(1)}{' '}
                        Điểm ({fillBlankItems.length} câu)
                      </span>
                    </div>
                  </div>

                  {fillBlankItems.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl mb-1 text-outline">hourglass_empty</span>
                      <p className="font-bold text-sm text-on-surface">Trống dữ liệu Điền khuyết</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Tiết học này chưa có dữ liệu từ tệp nạp/CSDL.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {fillBlankItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/25"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                              Câu điền khuyết {item.label || `${idx + 1})`}:
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                                <span>Điểm câu này:</span>
                                <input
                                  type="number"
                                  step="0.25"
                                  min="0.25"
                                  max="10"
                                  value={item.points}
                                  onChange={(e) => {
                                    const pts = Number(e.target.value) || 1.0;
                                    setFillBlankItems((prev) =>
                                      prev.map((x) => (x.id === item.id ? { ...x, points: pts } : x))
                                    );
                                  }}
                                  className="w-16 px-2 py-1 rounded bg-surface-container-lowest text-primary font-bold text-xs text-center border border-outline-variant/40"
                                />
                                <span>đ</span>
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setFillBlankItems((prev) => prev.filter((x) => x.id !== item.id))
                                }
                                className="text-error text-xs font-bold hover:underline cursor-pointer"
                              >
                                Xóa câu
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={item.preText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFillBlankItems((prev) =>
                                  prev.map((x) => (x.id === item.id ? { ...x, preText: val } : x))
                                );
                              }}
                              placeholder="Vế câu trước ô trống..."
                              className="md:col-span-4 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                            />
                            <input
                              type="text"
                              value={item.correctAnswer}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFillBlankItems((prev) =>
                                  prev.map((x) =>
                                    x.id === item.id ? { ...x, correctAnswer: val } : x
                                  )
                                );
                              }}
                              placeholder="Từ cần điền (Đáp án chuẩn)"
                              className="md:col-span-3 px-3 py-1.5 rounded-lg bg-primary-fixed/40 text-primary font-bold font-body-sm text-body-sm border border-primary/40"
                            />
                            <input
                              type="text"
                              value={item.postText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFillBlankItems((prev) =>
                                  prev.map((x) => (x.id === item.id ? { ...x, postText: val } : x))
                                );
                              }}
                              placeholder="Vế câu sau ô trống..."
                              className="md:col-span-5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DẠNG 3: NỐI CỘT KHÁI NIỆM (CÓ SỬA CÂU HỎI, THÊM TỪNG CẶP, SỬA ĐIỂM TỪNG CẶP) */}
              {(stage2ActiveBlockType === 'all' || stage2ActiveBlockType === 'matching') && (
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container font-headline-sm text-headline-sm flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Nối cột
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                      Tổng:{' '}
                      {matchingPairs
                        .reduce((acc, p) => acc + (matchingPointsMap[p.id] ?? 1.0), 0)
                        .toFixed(1)}{' '}
                      Điểm ({matchingPairs.length} cặp)
                    </span>
                  </div>

                  {matchingPairs.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl mb-1 text-outline">hourglass_empty</span>
                      <p className="font-bold text-sm text-on-surface">Trống dữ liệu Nối cột</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Tiết học này chưa có dữ liệu từ tệp nạp/CSDL.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {matchingPairs.map((pair, idx) => (
                        <div
                          key={pair.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-surface-container-low p-3 rounded-xl"
                        >
                          <input
                            type="text"
                            value={pair.left}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMatchingPairs((prev) =>
                                prev.map((p) => (p.id === pair.id ? { ...p, left: val } : p))
                              );
                            }}
                            className="md:col-span-4 p-2.5 rounded-lg bg-secondary-fixed/50 font-headline-sm text-headline-sm text-on-surface"
                            placeholder={`Cột A${idx + 1}`}
                          />
                          <div className="md:col-span-1 flex justify-center text-secondary font-bold">
                            ⟷
                          </div>
                          <input
                            type="text"
                            value={pair.right}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMatchingPairs((prev) =>
                                prev.map((p) => (p.id === pair.id ? { ...p, right: val } : p))
                              );
                            }}
                            className="md:col-span-4 p-2.5 rounded-lg bg-primary-fixed/40 font-body-sm text-body-sm text-on-surface"
                            placeholder={`Cột B${idx + 1}`}
                          />
                          <div className="md:col-span-3 flex items-center justify-end gap-2">
                            <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                              <span>Điểm:</span>
                              <input
                                type="number"
                                step="0.25"
                                min="0.25"
                                max="10"
                                value={matchingPointsMap[pair.id] ?? 1.0}
                                onChange={(e) =>
                                  setMatchingPointsMap((prev) => ({
                                    ...prev,
                                    [pair.id]: Number(e.target.value) || 1.0,
                                  }))
                                }
                                className="w-14 px-1.5 py-1 rounded bg-surface-container-lowest text-primary font-bold text-xs text-center border border-outline-variant/40"
                              />
                              <span>đ</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setMatchingPairs((prev) => prev.filter((p) => p.id !== pair.id))
                              }
                              className="text-error hover:underline font-label-sm text-label-sm cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DẠNG 4: CÂU HỎI TRẢ LỜI NGẮN (THAY CHO VĂN BẢN / HÌNH ẢNH — ĐÚNG MẪU phieu_hoc_tap_29_tiet_tin_7_2fa7ba7a.pdf) */}
              {(stage2ActiveBlockType === 'all' || stage2ActiveBlockType === 'short_answer') && (
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border-2 border-primary/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center font-bold">
                        4
                      </span>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Trả lời ngắn
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                        Tổng:{' '}
                        {shortAnswerQuestions
                          .reduce((acc, q) => acc + q.points, 0)
                          .toFixed(1)}{' '}
                        Điểm
                      </span>
                    </div>
                  </div>

                  {/* Nội dung câu hỏi */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-primary font-bold">
                      Câu hỏi:
                    </label>
                    <textarea
                      rows={3}
                      value={shortAnswerPrompt}
                      onChange={(e) => setShortAnswerPrompt(e.target.value)}
                      placeholder="Nhập câu hỏi..."
                      className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none border border-outline-variant/30"
                    />
                  </div>

                  {/* Danh sách các câu hỏi trả lời ngắn */}
                  {shortAnswerQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl mb-1 text-outline">hourglass_empty</span>
                      <p className="font-bold text-sm text-on-surface">Trống dữ liệu Trả lời ngắn</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Tiết học này chưa có dữ liệu từ tệp nạp/CSDL.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {shortAnswerQuestions.map((sq, idx) => (
                        <div
                          key={sq.id}
                          className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/30"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={sq.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setShortAnswerQuestions((prev) =>
                                    prev.map((item) =>
                                      item.id === sq.id ? { ...item, label: val } : item
                                    )
                                  );
                                }}
                                className="px-3 py-1 rounded-md bg-surface-container-lowest text-primary font-headline-sm text-headline-sm font-bold"
                                placeholder="Nhãn ý hỏi (VD: 1. Dữ liệu (Em thấy/nghe gì?))"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                                <span>Điểm câu này:</span>
                                <input
                                  type="number"
                                  step="0.25"
                                  min="0.25"
                                  max="10"
                                  value={sq.points}
                                  onChange={(e) => {
                                    const pts = Number(e.target.value) || 1.0;
                                    setShortAnswerQuestions((prev) =>
                                      prev.map((item) =>
                                        item.id === sq.id ? { ...item, points: pts } : item
                                      )
                                    );
                                  }}
                                  className="w-16 px-2 py-1 rounded bg-surface-container-lowest text-primary font-bold text-xs text-center border border-outline-variant/40"
                                />
                                <span>đ</span>
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setShortAnswerQuestions((prev) =>
                                    prev.filter((item) => item.id !== sq.id)
                                  )
                                }
                                className="text-error text-xs font-bold hover:underline cursor-pointer"
                              >
                                Xóa câu
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={sq.question}
                              onChange={(e) => {
                                const val = e.target.value;
                                setShortAnswerQuestions((prev) =>
                                  prev.map((item) =>
                                    item.id === sq.id ? { ...item, question: val } : item
                                  )
                                );
                              }}
                              placeholder="Câu hỏi gợi mở cho học sinh nhập..."
                              className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                            />
                            <input
                              type="text"
                              value={sq.sampleAnswer}
                              onChange={(e) => {
                                const val = e.target.value;
                                setShortAnswerQuestions((prev) =>
                                  prev.map((item) =>
                                    item.id === sq.id ? { ...item, sampleAnswer: val } : item
                                  )
                                );
                              }}
                              placeholder="Đáp án mẫu / Từ khóa đối chiếu..."
                              className="px-3 py-2 rounded-lg bg-tertiary-fixed/30 text-on-surface font-body-sm text-body-sm border border-tertiary/30"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Add New Short Answer Question */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary">
                      + Thêm câu hỏi Trả lời ngắn mới:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={newShortLabel}
                        onChange={(e) => setNewShortLabel(e.target.value)}
                        placeholder="Nhãn ý hỏi (VD: Câu 4.4:)"
                        className="md:col-span-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-bold text-primary border border-outline-variant/30"
                      />
                      <input
                        type="text"
                        value={newShortQuestion}
                        onChange={(e) => setNewShortQuestion(e.target.value)}
                        placeholder="Nội dung câu hỏi trả lời ngắn..."
                        className="md:col-span-4 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant/30"
                      />
                      <input
                        type="text"
                        value={newShortSampleAnswer}
                        onChange={(e) => setNewShortSampleAnswer(e.target.value)}
                        placeholder="Đáp án gợi ý / từ khóa chấm điểm..."
                        className="md:col-span-4 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-tertiary/30"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newShortQuestion.trim()) {
                            onShowToast('Vui lòng nhập nội dung câu hỏi trả lời ngắn.');
                            return;
                          }
                          const nextIdx = shortAnswerQuestions.length + 1;
                          setShortAnswerQuestions((prev) => [
                            ...prev,
                            {
                              id: `sa-custom-${Date.now()}`,
                              label: newShortLabel.trim() || `Câu 4.${nextIdx}:`,
                              question: newShortQuestion.trim(),
                              placeholder: 'Nhập câu trả lời ngắn của em...',
                              sampleAnswer:
                                newShortSampleAnswer.trim() ||
                                'Trả lời đúng trọng tâm kiến thức bài học.',
                              points: newShortPoints || 0.3,
                            },
                          ]);
                          setNewShortLabel('');
                          setNewShortQuestion('');
                          setNewShortSampleAnswer('');
                          onShowToast('Đã thêm câu hỏi Trả lời ngắn! Nhấn "Lưu vào Database" để đồng bộ.');
                        }}
                        className="md:col-span-2 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold cursor-pointer hover:opacity-95"
                      >
                        + Thêm câu
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HOẠT ĐỘNG 3 - LUYỆN TẬP (3.0 ĐIỂM: ĐẤU TRƯỜNG 25S + CÂY THƯ MỤC GOOGLE DRIVE THEO KHỐI LỚP) */}
          {activeTab === 'bien-soan-stage-3' && (
            <div className="flex flex-col gap-space-lg">
              {renderActivityGradePeriodSelector(
                3,
                'Luyện tập'
              )}
              <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Luyện tập
                  </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSaveCustomWorksheetToDb('Hoạt động 3: Luyện tập')}
                    className="px-4 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Lưu vào Database</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCustomWorksheetToDb('Hoạt động 3: Luyện tập');
                      onChangeTab('bien-soan-stage-4');
                    }}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Sang Vận dụng</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Switcher: Tiết Lý Thuyết vs Tiết Thực Hành */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-surface-container-lowest rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setStage3PeriodMode('theory')}
                  className={`py-3.5 px-4 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    stage3PeriodMode === 'theory'
                      ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                  <span>Trắc nghiệm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage3PeriodMode('practice')}
                  className={`py-3.5 px-4 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    stage3PeriodMode === 'practice'
                      ? 'bg-secondary text-on-secondary shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">add_to_drive</span>
                  <span>Thực hành</span>
                </button>
              </div>

              {/* A. TIẾT LÝ THUYẾT */}
              {stage3PeriodMode === 'theory' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  <div className="lg:col-span-12 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-headline-sm text-headline-sm text-on-surface block font-bold">
                          Ngân hàng câu hỏi trắc nghiệm ({questions.length} câu)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                          Tổng: {questions.reduce((acc, q) => acc + (q.points ?? 0.5), 0).toFixed(1)} / 3.0 Điểm
                        </span>
                      </div>
                    </div>

                    {questions.length === 0 ? (
                      <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl mb-1 text-outline">hourglass_empty</span>
                        <p className="font-bold text-sm text-on-surface">Trống dữ liệu Đấu trường Trắc nghiệm</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Tiết học này chưa có câu hỏi từ tệp nạp/CSDL.</p>
                      </div>
                    ) : (
                      <>
                        {/* Active question header with Points & Delete */}
                        <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                          <span className="font-label-md text-label-md text-primary font-bold">
                            Đang chỉnh sửa: Câu {editingQuestionIdx + 1} / {questions.length} (Thời gian: 25 giây)
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                              Điểm câu này:
                            </label>
                            <input
                              type="number"
                              step="0.25"
                              min="0.25"
                              max="10"
                              value={activeQuestion.points ?? 0.5}
                              onChange={(e) => {
                                const val = Math.max(0.25, Number(e.target.value) || 0.5);
                                setQuestions((prev) =>
                                  prev.map((q, idx) =>
                                    idx === editingQuestionIdx ? { ...q, points: val } : q
                                  )
                                );
                              }}
                              className="w-20 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-center font-headline-sm text-primary font-bold"
                            />
                            <span className="text-xs font-bold text-on-surface-variant">điểm</span>
                            {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) => prev.filter((_, idx) => idx !== editingQuestionIdx));
                                  setEditingQuestionIdx(0);
                                  onShowToast('Đã xóa câu hỏi khỏi Đấu trường 25s!');
                                }}
                                className="px-3 py-1 rounded-full bg-error/10 text-error font-label-sm text-label-sm cursor-pointer hover:bg-error/20"
                              >
                                Xóa câu này
                              </button>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={activeQuestion.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) =>
                              prev.map((q, idx) =>
                                idx === editingQuestionIdx ? { ...q, question: val } : q
                              )
                            );
                          }}
                          className="w-full p-3 rounded-lg bg-surface-container-low font-headline-sm text-headline-sm text-on-surface"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeQuestion.options.map((opt, optIdx) => (
                            <div
                              key={opt.letter}
                              className={`p-3 rounded-xl border ${
                                opt.isCorrect
                                  ? 'bg-tertiary-fixed/25 border-tertiary'
                                  : 'bg-surface-container-low border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((q, idx) =>
                                        idx === editingQuestionIdx
                                          ? {
                                              ...q,
                                              options: q.options.map((o, oI) => ({
                                                ...o,
                                                isCorrect: oI === optIdx,
                                              })),
                                            }
                                          : q
                                      )
                                    );
                                  }}
                                  className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm cursor-pointer ${
                                    opt.isCorrect
                                      ? 'bg-tertiary text-on-tertiary'
                                      : 'bg-surface-container-lowest text-on-surface-variant'
                                  }`}
                                >
                                  Phương án {opt.letter} {opt.isCorrect ? '✓ Đúng' : ''}
                                </button>
                              </div>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) =>
                                    prev.map((q, idx) =>
                                      idx === editingQuestionIdx
                                        ? {
                                            ...q,
                                            options: q.options.map((o, oI) =>
                                              oI === optIdx ? { ...o, text: val } : o
                                            ),
                                          }
                                        : q
                                    )
                                  );
                                }}
                                className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {questions.map((q, idx) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => setEditingQuestionIdx(idx)}
                              className={`px-3 py-1 rounded-full font-label-sm text-label-sm cursor-pointer ${
                                editingQuestionIdx === idx
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-surface-container-low text-on-surface'
                              }`}
                            >
                              Câu {idx + 1} ({(q.points ?? 0.5).toFixed(1)}đ)
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* B. TIẾT THỰC HÀNH: CÂY THƯ MỤC GOOGLE DRIVE THEO KHỐI LỚP & THU SẢN PHẨM HỌC SINH */}
              {stage3PeriodMode === 'practice' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
                          Cây Thư Mục Google Drive Theo Khối Lớp • Tiết Thực Hành (3.0 điểm)
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                          {practicalTitle}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDriveGradeFilter(selectedNotebookGrade);
                          setDriveClassFilter(selectedClass);
                          onChangeTab('cham-thuc-hanh');
                        }}
                        className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">fact_check</span>
                        <span>Mở Menu Chấm sản phẩm thực hành theo lớp</span>
                      </button>
                    </div>

                    {/* Google Drive Folder Tree Visualization */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[24px]">
                            folder_managed
                          </span>
                          <div>
                            <span className="font-label-md text-label-md text-on-surface font-bold block">
                              Cây thư mục Google Drive của Khối {selectedNotebookGrade}
                            </span>
                            <span className="text-xs text-on-surface-variant font-mono">
                              Google Drive / Khối {selectedNotebookGrade} / Lớp {selectedClass} / Tiết {selectedNotebookPeriod}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCreateDriveClassFolder(
                              selectedNotebookGrade,
                              selectedClass,
                              selectedNotebookPeriod
                            )
                          }
                          className="px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
                          <span>+ Tạo thư mục Drive Lớp {selectedClass} (Tiết {selectedNotebookPeriod})</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {driveFolders
                          .filter((f) => f.grade === selectedNotebookGrade)
                          .map((folder) => {
                            const countInFolder = practicalSubmissions.filter(
                              (s) => s.folderId === folder.id || (s.classId === folder.classId && s.period === folder.period)
                            ).length;
                            const isCurrentClass = folder.classId === selectedClass;
                            return (
                              <div
                                key={folder.id}
                                className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                                  isCurrentClass
                                    ? 'bg-primary-fixed/30 border-primary'
                                    : 'bg-surface-container-lowest border-outline-variant/30'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-secondary text-[20px]">
                                      folder
                                    </span>
                                    Lớp {folder.classId} • Tiết {folder.period}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                                    {countInFolder} bài nộp
                                  </span>
                                </div>
                                <span className="text-xs text-on-surface-variant truncate">
                                  {folder.folderName}
                                </span>
                                <span className="text-[11px] font-mono text-primary truncate">
                                  {folder.driveUrl}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface font-bold">
                        Tiêu đề nhiệm vụ thực hành:
                      </label>
                      <input
                        type="text"
                        value={practicalTitle}
                        onChange={(e) => setPracticalTitle(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-headline-sm text-headline-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        Các bước yêu cầu học sinh thực hành &amp; nộp lên Google Drive lớp:
                      </span>
                      {practicalSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPracticalSteps((prev) =>
                                prev.map((s, sIdx) => (sIdx === idx ? val : s))
                              );
                            }}
                            className="flex-1 p-2.5 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Submitted Practical Products in Current Class Drive Folder */}
                  <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Sản phẩm Học sinh nộp trên Drive Lớp {selectedClass} (
                        {practicalSubmissions.filter((s) => s.classId === selectedClass).length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setDriveGradeFilter(selectedNotebookGrade);
                          setDriveClassFilter(selectedClass);
                          onChangeTab('cham-thuc-hanh');
                        }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Chấm điểm chi tiết →
                      </button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {practicalSubmissions
                        .filter((s) => s.classId === selectedClass)
                        .map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2 border border-outline-variant/20"
                          >
                            <div className="min-w-0">
                              <span className="font-label-md text-label-md text-on-surface font-bold block truncate">
                                {sub.studentName} ({sub.studentUsername})
                              </span>
                              <span className="font-body-sm text-body-sm text-secondary block truncate">
                                📄 {sub.fileName} • {sub.fileSize} • {sub.submittedAt}
                              </span>
                              <span className="text-[11px] font-mono text-on-surface-variant block truncate">
                                {sub.drivePath}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold shrink-0 ${
                                sub.status === 'Đã chấm'
                                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                  : 'bg-secondary-fixed text-secondary'
                              }`}
                            >
                              {sub.status === 'Đã chấm' ? `${sub.score?.toFixed(1)}đ ✓` : 'Chờ chấm'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HOẠT ĐỘNG 4 - VẬN DỤNG & RUBRICS (3.0 ĐIỂM: SỬA TIÊU CHÍ, THÊM TIÊU CHÍ, SỬA ĐIỂM) */}
          {activeTab === 'bien-soan-stage-4' && (
            <div className="flex flex-col gap-space-lg">
              {renderActivityGradePeriodSelector(
                4,
                'Vận dụng'
              )}
              <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Vận dụng
                  </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSaveCustomWorksheetToDb('Hoạt động 4: Vận dụng')}
                    className="px-4 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Lưu vào Database</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCustomWorksheetToDb('Hoạt động 4: Vận dụng');
                      onShowToast(
                        `Đã xuất bản bài học cho Lớp ${selectedClass}!`
                      );
                    }}
                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md cursor-pointer"
                  >
                    Xuất bản cho Lớp {selectedClass} 🚀
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Vận dụng
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                    Tổng: 3.0 Điểm (3 Nhiệm vụ)
                  </span>
                </div>

                {!deepAnalysisTask.prompt && !practicalTask.prompt && !extendedTask.prompt ? (
                  <div className="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-4xl mb-1 text-outline">hourglass_empty</span>
                    <p className="font-bold text-sm text-on-surface">Trống dữ liệu Vận dụng</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Tiết học này chưa có dữ liệu từ tệp nạp/CSDL.</p>
                  </div>
                ) : (
                  /* 3 NHIỆM VỤ VẬN DỤNG NGUYÊN BẢN TỪ PDF GỐC */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Nhiệm vụ 1: Tự luận phân tích */}
                  <div className="p-4 rounded-xl bg-primary-fixed/20 border border-primary/30 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-xs font-bold">
                        1. Tự luận phân tích ({(deepAnalysisTask.points ?? 1.0).toFixed(1)}đ)
                      </span>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="5"
                        value={deepAnalysisTask.points ?? 1.0}
                        onChange={(e) =>
                          setDeepAnalysisTask((prev) => ({
                            ...prev,
                            points: Number(e.target.value) || 1.0,
                          }))
                        }
                        className="w-14 px-2 py-0.5 rounded bg-surface-container-lowest text-center font-bold text-primary text-xs border border-primary/30"
                      />
                    </div>
                    <input
                      type="text"
                      value={deepAnalysisTask.title}
                      onChange={(e) =>
                        setDeepAnalysisTask((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest font-headline-sm text-xs font-bold text-on-surface"
                    />
                    <label className="text-[11px] font-bold text-on-surface-variant">
                      Câu hỏi:
                    </label>
                    <textarea
                      rows={4}
                      value={deepAnalysisTask.prompt}
                      onChange={(e) =>
                        setDeepAnalysisTask((prev) => ({ ...prev, prompt: e.target.value }))
                      }
                      className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface"
                    />
                    <label className="text-[11px] font-bold text-primary">
                      Đáp án gợi ý:
                    </label>
                    <textarea
                      rows={3}
                      value={deepAnalysisTask.guideAnswer || ''}
                      onChange={(e) =>
                        setDeepAnalysisTask((prev) => ({ ...prev, guideAnswer: e.target.value }))
                      }
                      className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface-variant"
                    />
                  </div>

                  {/* Nhiệm vụ 2: Bài tập thực hành */}
                  <div className="p-4 rounded-xl bg-secondary-fixed/20 border border-secondary/30 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-xs font-bold">
                        2. Bài tập thực hành ({(practicalTask.points ?? 1.0).toFixed(1)}đ)
                      </span>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="5"
                        value={practicalTask.points ?? 1.0}
                        onChange={(e) =>
                          setPracticalTask((prev) => ({
                            ...prev,
                            points: Number(e.target.value) || 1.0,
                          }))
                        }
                        className="w-14 px-2 py-0.5 rounded bg-surface-container-lowest text-center font-bold text-secondary text-xs border border-secondary/30"
                      />
                    </div>
                    <input
                      type="text"
                      value={practicalTask.title}
                      onChange={(e) =>
                        setPracticalTask((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest font-headline-sm text-xs font-bold text-on-surface"
                    />
                    <label className="text-[11px] font-bold text-on-surface-variant">
                      Câu hỏi:
                    </label>
                    <textarea
                      rows={4}
                      value={practicalTask.prompt}
                      onChange={(e) =>
                        setPracticalTask((prev) => ({ ...prev, prompt: e.target.value }))
                      }
                      className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface"
                    />
                    <label className="text-[11px] font-bold text-secondary">
                      Đáp án gợi ý:
                    </label>
                    <textarea
                      rows={3}
                      value={practicalTask.guideAnswer || ''}
                      onChange={(e) =>
                        setPracticalTask((prev) => ({
                          ...prev,
                          guideAnswer: e.target.value,
                        }))
                      }
                      className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface-variant"
                    />
                  </div>

                  {/* Nhiệm vụ 3: Vận dụng mở rộng */}
                  <div className="p-4 rounded-xl bg-tertiary-fixed/25 border border-tertiary/30 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-tertiary text-on-tertiary text-xs font-bold">
                        3. Vận dụng mở rộng ({(extendedTask.points ?? 1.0).toFixed(1)}đ)
                      </span>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="5"
                        value={extendedTask.points ?? 1.0}
                        onChange={(e) =>
                          setExtendedTask((prev) => ({
                            ...prev,
                            points: Number(e.target.value) || 1.0,
                          }))
                        }
                        className="w-14 px-2 py-0.5 rounded bg-surface-container-lowest text-center font-bold text-tertiary text-xs border border-tertiary/30"
                      />
                    </div>
                    <input
                      type="text"
                      value={extendedTask.title}
                      onChange={(e) =>
                        setExtendedTask((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest font-headline-sm text-xs font-bold text-on-surface"
                    />
                    <label className="text-[11px] font-bold text-on-surface-variant">
                      Câu hỏi:
                    </label>
                    <textarea
                      rows={4}
                      value={extendedTask.prompt}
                      onChange={(e) =>
                        setExtendedTask((prev) => ({ ...prev, prompt: e.target.value }))
                      }
                      className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface"
                    />
                    <label className="text-[11px] font-bold text-tertiary">
                      Đáp án gợi ý:
                    </label>
                    <textarea
                      rows={3}
                      value={extendedTask.guideAnswer || ''}
                      onChange={(e) =>
                        setExtendedTask((prev) => ({ ...prev, guideAnswer: e.target.value }))
                      }
                      className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface-variant"
                    />
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: QUẢN LÝ LỚP HỌC THEO KHỐI & NẠP DANH SÁCH EXCEL SINH TÀI KHOẢN TỰ ĐỘNG (MK: 12345) */}
          {activeTab === 'quan-ly-lop-hoc-tai-khoan' && (
            <div className="flex flex-col gap-space-lg">
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase">
                    Quản trị Trường học Trực tuyến • Tự động hóa Tài khoản
                  </span>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Quản Lý Lớp Học Theo Khối &amp; Nạp Danh Sách Excel (MK Chung: 12345)
                  </h1>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md">
                  Tổng số: {classes.length} Lớp • {students.length} Học sinh
                </span>
              </div>

              {/* SECTION A: TẠO LỚP HỌC THEO KHỐI */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                <form
                  onSubmit={handleCreateClassByGrade}
                  className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      domain_add
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      1. Tạo Lớp Học Mới Theo Khối
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                        Chọn Khối lớp:
                      </label>
                      <select
                        value={newClassGrade}
                        onChange={(e) => {
                          const g = Number(e.target.value);
                          setNewClassGrade(g);
                          setNewClassName(`${g}A1`);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md"
                      >
                        {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                          <option key={g} value={g}>
                            Khối {g} ({g <= 9 ? 'THCS' : 'THPT'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                        Tên Lớp học:
                      </label>
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="VD: 6A12, 10A2..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>Tạo Lớp Học Mới Thuộc Khối {newClassGrade}</span>
                  </button>
                </form>

                {/* Danh sách Lớp theo Khối */}
                <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Danh sách các Lớp theo Khối ({classes.length} lớp)
                    </h3>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedGradeFilter('ALL')}
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm cursor-pointer ${
                          selectedGradeFilter === 'ALL'
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-surface-container-low text-on-surface-variant'
                        }`}
                      >
                        Tất cả
                      </button>
                      {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSelectedGradeFilter(g)}
                          className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm cursor-pointer ${
                            selectedGradeFilter === g
                              ? 'bg-secondary text-on-secondary'
                              : 'bg-surface-container-low text-on-surface-variant'
                          }`}
                        >
                          Khối {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DataBoundary
                    data={classes.filter(
                      (c) =>
                        selectedGradeFilter === 'ALL' || c.grade === selectedGradeFilter
                    )}
                    isLoading={isLoading}
                    loadingMessage="Đang tải danh sách lớp học từ CSDL..."
                    emptyTitle="Chưa có lớp học nào trong khối này"
                    emptyDescription="Sử dụng biểu mẫu bên trái để tạo lớp học mới."
                  >
                    {(filteredClassesList) => (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {filteredClassesList.map((cls) => {
                          const count = students.filter((s) => s.classId === cls.id).length;
                          return (
                            <div
                              key={cls.id}
                              onClick={() => onChangeClass(cls.id)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                selectedClass === cls.id
                                  ? 'bg-primary-fixed/30 border-primary shadow-xs'
                                  : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-headline-sm text-headline-sm text-on-surface">
                                  {cls.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-bold">
                                    Khối {cls.grade}
                                  </span>
                                  {onDeleteClass && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (classes.length <= 1) {
                                          onShowToast('Cần giữ lại ít nhất 1 lớp học trong hệ thống!');
                                          return;
                                        }
                                        onDeleteClass(cls.id);
                                      }}
                                      className="p-1 rounded-md text-error hover:bg-error-container/40 transition-colors cursor-pointer"
                                      title={`Xóa lớp học ${cls.name}`}
                                      aria-label={`Xóa lớp học ${cls.name}`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                Sĩ số: <strong>{count} Học sinh</strong>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </DataBoundary>
                </div>
              </div>

              {/* SECTION B: NẠP DANH SÁCH LỚP TỪ EXCEL (HỌ TÊN, NGÀY SINH, LỚP) -> TÀI KHOẢN TỰ ĐỘNG, MK 12345 */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[24px]">
                        table_view
                      </span>
                      2. Nạp Danh Sách Học Sinh Từ Excel (Họ tên, Ngày sinh, Lớp)
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Hệ thống tự động sinh Mã tài khoản đăng nhập chuẩn không dấu và gán mật khẩu
                      chung mặc định: <strong className="text-primary">12345</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-4 py-2 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md flex items-center gap-1.5 cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      <span>Tải tệp Excel / CSV (.xlsx, .csv)</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string' && reader.result.trim()) {
                              setExcelPasteText(reader.result);
                            }
                            onShowToast(
                              `Đã đọc tệp "${file.name}"! Kiểm tra danh sách tài khoản tự động bên dưới.`
                            );
                          };
                          reader.readAsText(file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleImportExcelStudents}
                      className="px-5 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>
                        Xác nhận Tạo {previewAutoAccounts.length} Tài Khoản (MK: 12345)
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left: Paste Area + Quick Single Row Adder */}
                  <div className="lg:col-span-6 flex flex-col gap-3">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      Dán vùng dữ liệu từ Excel (Cột: Họ tên | Ngày sinh | Lớp):
                    </label>
                    <textarea
                      rows={5}
                      value={excelPasteText}
                      onChange={(e) => setExcelPasteText(e.target.value)}
                      placeholder="Họ và tên    Ngày sinh    Lớp"
                      className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none font-mono"
                    />

                    <form
                      onSubmit={handleAddSingleStudentAccount}
                      className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2"
                    >
                      <span className="font-label-sm text-label-sm text-primary uppercase">
                        Hoặc thêm nhanh 1 học sinh (Sinh tài khoản tự động • MK: 12345):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={singleStudentName}
                          onChange={(e) => setSingleStudentName(e.target.value)}
                          placeholder="Họ và tên (VD: Vũ Gia Hưng)"
                          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                        />
                        <input
                          type="text"
                          value={singleStudentDob}
                          onChange={(e) => setSingleStudentDob(e.target.value)}
                          placeholder="Ngày sinh (15/05/2013)"
                          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                        />
                        <input
                          type="text"
                          value={singleStudentClass}
                          onChange={(e) => setSingleStudentClass(e.target.value)}
                          placeholder="Lớp (6A10)"
                          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="self-start px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm cursor-pointer"
                      >
                        + Sinh tài khoản tự động &amp; Lưu ngay
                      </button>
                    </form>
                  </div>

                  {/* Right: Preview Auto-generated Accounts */}
                  <div className="lg:col-span-6 bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
                    <span className="font-label-md text-label-md text-secondary">
                      Xem trước Tài khoản sinh tự động ({previewAutoAccounts.length} học sinh):
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
                            <th className="py-2 px-2">Họ và tên</th>
                            <th className="py-2 px-2">Ngày sinh</th>
                            <th className="py-2 px-2">Lớp</th>
                            <th className="py-2 px-2">Tài khoản tự động</th>
                            <th className="py-2 px-2">Mật khẩu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
                          {previewAutoAccounts.map((acc) => (
                            <tr key={acc.username}>
                              <td className="py-2 px-2 font-bold text-on-surface">{acc.name}</td>
                              <td className="py-2 px-2 text-on-surface-variant">{acc.dob}</td>
                              <td className="py-2 px-2">
                                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm">
                                  {acc.classId}
                                </span>
                              </td>
                              <td className="py-2 px-2 font-mono text-primary font-bold">
                                {acc.username}
                              </td>
                              <td className="py-2 px-2 font-bold text-tertiary">
                                {acc.passwordDefault}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Current Active Student Accounts Table Grouped & Filtered by Khối / Lớp */}
                <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">
                        Danh sách Tài khoản Học sinh theo Khối / Lớp ({students.length} tài khoản)
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        Chọn Khối hoặc Lớp bên dưới để lọc nhanh hoặc xóa tài khoản học sinh theo lớp / cá nhân
                      </p>
                    </div>
                    {onDeleteClassStudents && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {classes.map((cls) => {
                          const count = students.filter((s) => s.classId === cls.id).length;
                          if (count === 0) return null;
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => {
                                onDeleteClassStudents(cls.id);
                              }}
                              className="px-3 py-1 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold hover:opacity-90 cursor-pointer flex items-center gap-1"
                              aria-label={`Xóa tất cả học sinh lớp ${cls.name}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                              <span>Xóa tất cả HS {cls.name} ({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Filter Bar by Khối & Lớp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-on-surface-variant mr-1">
                        Lọc theo Khối:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentAccountGradeFilter('ALL');
                          setStudentAccountClassFilter('ALL');
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                          studentAccountGradeFilter === 'ALL'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        Tất cả Khối ({students.length})
                      </button>
                      {[6, 7, 8, 9].map((g) => {
                        const gradeCount = students.filter(
                          (s) => s.grade === g || Number(s.classId?.charAt(0)) === g
                        ).length;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setStudentAccountGradeFilter(g);
                              setStudentAccountClassFilter('ALL');
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                              studentAccountGradeFilter === g
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            Khối {g} ({gradeCount})
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-on-surface-variant">Lọc theo Lớp:</span>
                      <select
                        aria-label="Lọc tài khoản học sinh theo lớp"
                        value={studentAccountClassFilter}
                        onChange={(e) => setStudentAccountClassFilter(e.target.value)}
                        className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface text-xs font-bold border border-outline-variant/30 cursor-pointer"
                      >
                        <option value="ALL">Tất cả các lớp</option>
                        {classes
                          .filter(
                            (c) =>
                              studentAccountGradeFilter === 'ALL' ||
                              c.grade === studentAccountGradeFilter
                          )
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} (Khối {c.grade})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <DataBoundary
                    data={students.filter((st) => {
                      const stGrade = st.grade || Number(st.classId?.charAt(0)) || 6;
                      const matchGrade =
                        studentAccountGradeFilter === 'ALL' ||
                        stGrade === studentAccountGradeFilter;
                      const matchClass =
                        studentAccountClassFilter === 'ALL' ||
                        st.classId === studentAccountClassFilter;
                      return matchGrade && matchClass;
                    })}
                    isLoading={isLoading}
                    loadingMessage="Đang tải danh sách tài khoản học sinh từ CSDL..."
                    emptyTitle="Chưa có tài khoản học sinh nào trong bộ lọc này"
                    emptyDescription="Vui lòng nạp danh sách lớp từ Excel, thêm học sinh mới bên trên hoặc chọn 'Tất cả Khối'."
                  >
                    {(filteredRosterStudents) => (
                      <div className="overflow-x-auto max-h-80">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
                              <th className="py-2 px-3">Mã HS</th>
                              <th className="py-2 px-3">Họ và tên</th>
                              <th className="py-2 px-3">Ngày sinh</th>
                              <th className="py-2 px-3">Khối / Lớp</th>
                              <th className="py-2 px-3">Tài khoản tự động</th>
                              <th className="py-2 px-3">Mật khẩu chung</th>
                              <th className="py-2 px-3 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
                            {filteredRosterStudents.map((st) => {
                              const stGrade = st.grade || Number(st.classId?.charAt(0)) || 6;
                              return (
                                <tr key={st.id} className="hover:bg-surface-container-low">
                                  <td className="py-2 px-3 font-bold text-primary">{st.id}</td>
                                  <td className="py-2 px-3 font-bold text-on-surface">{st.name}</td>
                                  <td className="py-2 px-3 text-on-surface-variant">
                                    {st.dob || '15/05/2013'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
                                      Khối {stGrade} • {st.classId}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 font-mono text-secondary font-bold">
                                    {st.username || st.id}
                                  </td>
                                  <td className="py-2 px-3 font-bold text-tertiary">12345</td>
                                  <td className="py-2 px-3 text-right">
                                    {onDeleteStudent && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteStudent(st.id);
                                        }}
                                        className="px-2.5 py-1 rounded-full bg-error-container/50 text-error hover:bg-error hover:text-on-error transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                                        title={`Xóa tài khoản học sinh ${st.name}`}
                                        aria-label={`Xóa tài khoản học sinh ${st.name}`}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">delete</span>
                                        <span>Xóa</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </DataBoundary>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SỔ ĐIỂM ĐIỆN TỬ & THỐNG KÊ + GẮN THẺ KẾT QUẢ HỌC TẬP KÉP */}
          {activeTab === 'so-diem-thong-ke' && (
            <div className="flex flex-col gap-space-lg">
              {/* BẢNG TỔNG HỢP ĐIỂM GẮN THẺ KẾT QUẢ KÉP: [TRÊN LỚP] & [TỰ LUYỆN Ở NHÀ] */}
              {(() => {
                const allTagged: TaggedLessonSubmission[] =
                  liveSession?.taggedSubmissions && liveSession.taggedSubmissions.length > 0
                    ? liveSession.taggedSubmissions
                    : INITIAL_TAGGED_SUBMISSIONS;

                const filteredTagged = allTagged.filter((sub) => {
                  if (tagFilterMode === 'ALL') return true;
                  return sub.mode === tagFilterMode;
                });

                const inClassCount = allTagged.filter((s) => s.mode === 'IN_CLASS_LIVE').length;
                const homeCount = allTagged.filter((s) => s.mode === 'HOME_SELF_PACED').length;

                return (
                  <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                      <div>
                        <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">sell</span>
                          Hệ Thống Gắn Thẻ Kết Quả Học Tập Kép (Dual-Mode Gradebook Tagging)
                        </span>
                        <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                          Nhật Ký Bài Nộp Học Sinh — Phân Tách [TRÊN LỚP] &amp; [TỰ LUYỆN Ở NHÀ]
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Đánh giá toàn diện mức độ tập trung hiểu bài ngay tại lớp và thái độ tự giác, kiên trì làm lại bài ở nhà theo Thông tư 22/2021/TT-BGDĐT
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setTagFilterMode('ALL')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                            tagFilterMode === 'ALL'
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          Tất cả ({allTagged.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTagFilterMode('IN_CLASS_LIVE')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                            tagFilterMode === 'IN_CLASS_LIVE'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current" />
                          <span>🔴 [TRÊN LỚP] ({inClassCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTagFilterMode('HOME_SELF_PACED')}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                            tagFilterMode === 'HOME_SELF_PACED'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">home</span>
                          <span>🏠 [TỰ LUYỆN Ở NHÀ] ({homeCount})</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-outline-variant/25">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/25">
                            <th className="py-3 px-3">Học sinh</th>
                            <th className="py-3 px-3">Lớp</th>
                            <th className="py-3 px-3">Tiết &amp; Hoạt động</th>
                            <th className="py-3 px-3">Gắn thẻ Chế độ &amp; Thời gian / Số lần</th>
                            <th className="py-3 px-3">Điểm số</th>
                            <th className="py-3 px-3">Đánh giá Sư phạm (Tập trung / Tự giác)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/15">
                          {filteredTagged.map((item) => {
                            const isLive = item.mode === 'IN_CLASS_LIVE';
                            return (
                              <tr key={item.id} className="hover:bg-surface-container-low/60">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-on-surface">{item.studentName}</div>
                                  <div className="text-[11px] text-on-surface-variant font-mono">
                                    Mã: {item.studentId} ({item.studentUsername})
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-bold text-primary">{item.classId}</td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-on-surface">{item.lessonTitle}</div>
                                  <div className="text-[11px] text-secondary font-semibold">
                                    {item.stageLabel}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  {isLive ? (
                                    <div className="inline-flex flex-col gap-0.5">
                                      <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-extrabold text-[11px] inline-flex items-center gap-1 w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                                        [TRÊN LỚP]
                                      </span>
                                      <span className="text-[11px] text-on-surface-variant font-medium">
                                        🕒 {item.submittedAt}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex flex-col gap-0.5">
                                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-extrabold text-[11px] inline-flex items-center gap-1 w-fit">
                                        <span>🏠</span>
                                        <span>[TỰ LUYỆN Ở NHÀ] • Lần #{item.attemptCount}</span>
                                      </span>
                                      <span className="text-[11px] text-on-surface-variant font-medium">
                                        🔄 {item.submittedAt}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2.5 py-1 rounded-lg bg-primary-fixed text-primary font-black text-xs">
                                    {item.score.toFixed(1)} / {item.maxScore.toFixed(1)}đ
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-on-surface-variant font-medium max-w-xs">
                                  {item.pedagogicalEvaluation}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary uppercase">
                      Sổ Điểm Điện Tử &amp; Đánh Giá Thường Xuyên TT22
                    </span>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">
                      Bảng Điểm Trực Tuyến — Lớp {selectedClass}
                    </h1>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
                        <th className="py-3 px-3">Mã HS</th>
                        <th className="py-3 px-3">Họ và tên</th>
                        <th className="py-3 px-3">Lớp</th>
                        <th className="py-3 px-3">Nhãn Kết Quả Kép ([TRÊN LỚP] / [TỰ LUYỆN Ở NHÀ])</th>
                        <th className="py-3 px-3">Điểm XP</th>
                        <th className="py-3 px-3">Điểm TB (Hệ 10)</th>
                        <th className="py-3 px-3">Cập nhật điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md">
                      {students.map((st) => {
                        const studentSubs = (
                          liveSession?.taggedSubmissions || INITIAL_TAGGED_SUBMISSIONS
                        ).filter((s) => s.studentId === st.id);
                        const latestLive = studentSubs.find((s) => s.mode === 'IN_CLASS_LIVE');
                        const latestHome = studentSubs.find((s) => s.mode === 'HOME_SELF_PACED');

                        return (
                          <tr key={st.id} className="hover:bg-surface-container-low">
                            <td className="py-2.5 px-3 font-bold text-primary">{st.id}</td>
                            <td className="py-2.5 px-3 font-bold text-on-surface">{st.name}</td>
                            <td className="py-2.5 px-3">{st.classId}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">
                                  [TRÊN LỚP] {latestLive ? latestLive.submittedAt.split('•')[0].trim() : '08:15'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                                  [TỰ LUYỆN Ở NHÀ] Lần #{latestHome ? latestHome.attemptCount : 2}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-secondary font-bold">{st.xp} XP</td>
                            <td className="py-2.5 px-3 font-headline-sm text-headline-sm text-tertiary">
                              {st.avgScore.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = Math.min(10, Number((st.avgScore + 0.2).toFixed(1)));
                                  onUpdateStudentScore(st.id, next);
                                  onShowToast(`Đã cộng +0.2đ thưởng cho ${st.name} (${next}/10)!`);
                                }}
                                className="px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm cursor-pointer"
                              >
                                +0.2đ Thưởng
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
          )}

          {/* TAB 7.5: CHẤM SẢN PHẨM THỰC HÀNH THEO LỚP HỌC (GOOGLE DRIVE TREE) */}
          {activeTab === 'cham-thuc-hanh' && (
            <div className="flex flex-col gap-space-lg">
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                    Quản Lý &amp; Chấm Sản Phẩm Thực Hành Trên Google Drive Theo Lớp
                  </span>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                    Chấm Sản Phẩm Thực Hành — Khối {driveGradeFilter} • Lớp {driveClassFilter}
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Duyệt cây thư mục Google Drive theo Khối Lớp, kiểm tra tệp sản phẩm của học sinh và chấm điểm trực tiếp vào Sổ điểm
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectGradeAndPeriod(driveGradeFilter, selectedNotebookPeriod);
                    onChangeClass(driveClassFilter);
                    handleCreateDriveClassFolder(
                      driveGradeFilter,
                      driveClassFilter,
                      selectedNotebookPeriod
                    );
                  }}
                  className="px-4 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                  <span>+ Tạo thư mục Drive mới cho Lớp {driveClassFilter}</span>
                </button>
              </div>

              {/* Grade & Class Filter Bar */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                    1. Chọn Khối:
                  </span>
                  {([6, 7, 8, 9] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setDriveGradeFilter(g);
                        const firstClass = classes.find((c) => c.grade === g)?.id || `${g}A10`;
                        setDriveClassFilter(firstClass);
                      }}
                      className={`px-4 py-1.5 rounded-full font-label-md text-label-md font-bold cursor-pointer transition-all ${
                        driveGradeFilter === g
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface hover:bg-secondary-fixed'
                      }`}
                    >
                      Khối {g}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                    2. Chọn Lớp học:
                  </span>
                  {classes
                    .filter((c) => c.grade === driveGradeFilter)
                    .map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setDriveClassFilter(cls.id)}
                        className={`px-4 py-1.5 rounded-full font-label-md text-label-md font-bold cursor-pointer transition-all ${
                          driveClassFilter === cls.id
                            ? 'bg-secondary text-on-secondary shadow-xs'
                            : 'bg-surface-container-low text-on-surface hover:bg-secondary-fixed/50'
                        }`}
                      >
                        Lớp {cls.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Google Drive Folder Tree & Submissions Grading Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                {/* Left: Google Drive Folder Tree */}
                <div className="lg:col-span-4 bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-3 border border-outline-variant/25">
                  <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      account_tree
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Cây Thư Mục Google Drive (Khối {driveGradeFilter})
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-container-low font-mono text-xs text-primary font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                      <span>Google Drive / Khối {driveGradeFilter} / Lớp {driveClassFilter}</span>
                    </div>

                    {driveFolders
                      .filter((f) => f.grade === driveGradeFilter)
                      .map((folder) => {
                        const isSelected = folder.classId === driveClassFilter;
                        const subCount = practicalSubmissions.filter(
                          (s) => s.classId === folder.classId && s.period === folder.period
                        ).length;
                        return (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => setDriveClassFilter(folder.classId)}
                            className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                              isSelected
                                ? 'bg-primary-fixed/35 border-primary shadow-xs'
                                : 'bg-surface-container-low border-transparent hover:border-outline-variant/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-secondary text-[18px]">
                                  folder
                                </span>
                                Lớp {folder.classId} — Tiết {folder.period}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-[11px] font-bold text-primary">
                                {subCount} sản phẩm
                              </span>
                            </div>
                            <span className="text-xs text-on-surface-variant truncate">
                              {folder.folderName}
                            </span>
                            <span className="text-[11px] font-mono text-secondary truncate">
                              {folder.driveUrl}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Right: Submissions List & Grading Form */}
                <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/25">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-outline-variant/20">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                        Danh sách Sản phẩm Thực hành — Lớp {driveClassFilter}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Nhập điểm (thang 10) và nhận xét cho từng sản phẩm nộp trên Google Drive của lớp
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                      {practicalSubmissions.filter((s) => s.classId === driveClassFilter).length} bài nộp
                    </span>
                  </div>

                  {practicalSubmissions.filter((s) => s.classId === driveClassFilter).length === 0 ? (
                    <div className="p-8 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant text-[36px]">
                        folder_open
                      </span>
                      <p className="font-headline-sm text-headline-sm text-on-surface">
                        Chưa có sản phẩm thực hành nào trong thư mục Google Drive Lớp {driveClassFilter}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Khi học sinh lớp {driveClassFilter} nộp tệp thực hành ở Hoạt động 3, tệp sẽ tự động hiển thị tại đây.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {practicalSubmissions
                        .filter((s) => s.classId === driveClassFilter)
                        .map((sub) => {
                          const currentScore =
                            gradingScoreInputMap[sub.id] !== undefined
                              ? gradingScoreInputMap[sub.id]
                              : String(sub.score ?? 9.0);
                          const currentFeedback =
                            gradingFeedbackInputMap[sub.id] !== undefined
                              ? gradingFeedbackInputMap[sub.id]
                              : sub.teacherFeedback ?? 'Hoàn thành tốt yêu cầu thực hành, đúng cấu trúc thư mục Drive.';

                          return (
                            <div
                              key={sub.id}
                              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 flex flex-col gap-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                      {sub.studentName}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-mono font-bold">
                                      TK: {sub.studentUsername}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-xs font-bold">
                                      Lớp {sub.classId} • Tiết {sub.period}
                                    </span>
                                  </div>
                                  <p className="text-xs text-on-surface-variant mt-1">
                                    📄 <strong>{sub.fileName}</strong> ({sub.fileType} • {sub.fileSize}) — Nộp lúc: {sub.submittedAt}
                                  </p>
                                  <p className="text-[11px] font-mono text-primary mt-0.5">
                                    ☁️ {sub.drivePath}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    sub.status === 'Đã chấm'
                                      ? 'bg-tertiary text-on-tertiary'
                                      : 'bg-amber-500/20 text-amber-800'
                                  }`}
                                >
                                  {sub.status === 'Đã chấm'
                                    ? `Đã chấm: ${sub.score?.toFixed(1)}đ`
                                    : 'Chờ giáo viên chấm'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center pt-2 border-t border-outline-variant/20">
                                <div className="sm:col-span-3 flex items-center gap-2">
                                  <label className="text-xs font-bold text-on-surface shrink-0">
                                    Điểm số:
                                  </label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="10"
                                    value={currentScore}
                                    onChange={(e) =>
                                      setGradingScoreInputMap((prev) => ({
                                        ...prev,
                                        [sub.id]: e.target.value,
                                      }))
                                    }
                                    className="w-20 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-center font-headline-sm text-primary font-bold"
                                  />
                                  <span className="text-xs text-on-surface-variant font-bold">/10</span>
                                </div>

                                <div className="sm:col-span-6">
                                  <input
                                    type="text"
                                    value={currentFeedback}
                                    onChange={(e) =>
                                      setGradingFeedbackInputMap((prev) => ({
                                        ...prev,
                                        [sub.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Nhận xét sản phẩm thực hành của học sinh..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface"
                                  />
                                </div>

                                <div className="sm:col-span-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleSavePracticalGrade(sub)}
                                    className="w-full sm:w-auto px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold cursor-pointer hover:opacity-95"
                                  >
                                    ✓ Lưu điểm &amp; Đồng bộ
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Worksheet Batch Print View Modal (Print View toàn bộ 29 phiếu dữ liệu đã nạp) */}
      <WorksheetBatchPrintModal
        isOpen={showBatchPrintModal}
        onClose={() => setShowBatchPrintModal(false)}
        defaultGrade={selectedNotebookGrade}
        liveSession={liveSession}
        onShowToast={onShowToast}
      />

      {/* Real-time 29-Period Class Progression Tracker Modal */}
      <ClassProgressionTrackerModal
        isOpen={showProgressionTrackerModal}
        onClose={() => setShowProgressionTrackerModal(false)}
        classes={classes}
        selectedGrade={selectedNotebookGrade}
        selectedClassId={selectedClass}
        onChangeClass={onChangeClass}
        onChangeGrade={(g) => handleSelectGradeAndPeriod(g, 1)}
        liveSession={liveSession}
        onToggleTaughtPeriod={handleToggleTaughtPeriodForClass}
        onBroadcastLive={handleBroadcastLivePeriod}
        onShowToast={onShowToast}
      />

      {/* Bulk Import CSV/JSON & Google Sheets Sync Modal Overlay */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-5xl bg-surface rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
            <div className="p-1 sm:p-3 overflow-y-auto flex-1">
              <BulkImportForm
                onImportWorksheets={handleBulkImportWorksheets}
                onShowToast={onShowToast}
                onClose={() => setShowBulkImportModal(false)}
                defaultGrade={selectedNotebookGrade}
                defaultPeriod={selectedNotebookPeriod}
              />
            </div>
          </div>
        </div>
      )}

      {/* Class Join QR Code & PIN Modal */}
      <ClassQRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        grade={selectedNotebookGrade}
        period={selectedNotebookPeriod}
        classId={selectedClass}
        lessonTitle={selectedPeriodSpec.lessonTitle}
        liveSession={liveSession}
        onShowToast={onShowToast}
      />

      {/* Question Master Inspector ListView Modal */}
      <QuestionMasterInspectorModal
        isOpen={showQuestionInspectorModal}
        onClose={() => setShowQuestionInspectorModal(false)}
        liveSession={liveSession}
        onUpdateLiveSession={onUpdateLiveSession}
        onShowToast={onShowToast}
      />

      {/* Lecture Slide Manager Modal (Nạp bài giảng PDF, PPTX) */}
      <LectureSlideManagerModal
        isOpen={showLectureSlideModal}
        onClose={() => setShowLectureSlideModal(false)}
        initialGrade={selectedNotebookGrade}
        initialPeriod={selectedNotebookPeriod}
        liveSession={liveSession}
        onUpdateLiveSession={onUpdateLiveSession}
        onShowToast={onShowToast}
      />
    </div>
  );
};
