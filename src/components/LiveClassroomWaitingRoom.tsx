import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  buildLessonBlueprintFromPeriod,
  type ClassroomHonorRole,
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
  type WaitingRoomState,
} from '../data/mockCurriculumData';
import {
  buildDesignatedClassDeskRoster,
  createInitialWaitingRoomState,
  registerStudentJoinWaitingRoom,
  admitAllClassStudentsToWaitingRoom,
  submitWaitingRoomQuickAnswer,
  assignWaitingRoomHonorRole,
  appendWaitingRoomChatMessage,
  detectNewlyJoinedWaitingRoomStudents,
  buildWaitingRoomStudentJoinedBroadcastPayload,
  broadcastWaitingRoomStudentJoined,
  calculateDeskCanvasOrigin,
  getStationDesk25DCoordinates,
  buildAllStations25DCoordinateMap,
  createTableFireworkBurstParticles,
  stepFireworkBurstParticles,
  type ClassroomDeskSeat,
  type TableFireworkParticle,
} from '../utils/waitingRoomLogic';
import {
  playStageBroadcastSound,
  triggerSynchronizedCelebration,
  triggerStudentDeskFireworkCelebration,
} from '../utils/soundEffects';
import {
  loadHybridSlideDeck3Tier,
  buildDefaultHighResSlideDeck,
  type HybridSlideDeckRecord,
} from '../utils/hybridSlideStorage';
import { PreLiveSlideConfigModal } from './PreLiveSlideConfigModal';

export type ChalkboardStageMode = 'slide' | 'hd1' | 'hd2' | 'hd3' | 'hd3-practice' | 'hd4';

interface TableFireworkRocket {
  id: string;
  x: number;
  y: number;
  startY: number;
  targetY: number;
  vy: number;
  team: 1 | 2;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

function drawCanvasHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.translate(x, y);
  ctx.beginPath();
  const s = size * 0.65;
  ctx.moveTo(0, s * 0.45);
  ctx.bezierCurveTo(-s * 1.2, -s * 0.35, -s * 0.65, -s * 1.25, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.65, -s * 1.25, s * 1.2, -s * 0.35, 0, s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCanvasStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.translate(x, y);
  ctx.beginPath();
  const spikes = 4;
  const outerR = size;
  const innerR = size * 0.38;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / spikes;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

interface LiveClassroomWaitingRoomProps {
  role: 'teacher' | 'student';
  grade: 6 | 7 | 8 | 9;
  period: number;
  classId: string;
  periodSpec: CurriculumPeriodSpec;
  students: StudentRosterItem[];
  currentStudent?: StudentRosterItem;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onReadyForLearning?: () => void;
  onStartActivityStage?: (stage: 1 | 2 | 3 | 4) => void;
  onBoardModeChange?: (mode: ChalkboardStageMode) => void;
  externalBoardMode?: ChalkboardStageMode;
  onAwardXp?: (delta: number) => void;
  onShowToast: (msg: string) => void;
  defaultCollapsedAfterReady?: boolean;
}

interface FloatingReactionParticle {
  id: string;
  symbol: string;
  leftPercent: number;
  topPercent: number;
  delayMs: number;
  durationMs: number;
  scale: number;
}

const REACTION_SYMBOLS = ['❤️', '💖', '🎆', '✨', '💝', '🎉', '🌟', '💗', '🎇', '❤️'];

const HONOR_ROLE_META: {
  id: ClassroomHonorRole;
  label: string;
  icon: string;
  badgeBg: string;
}[] = [
  {
    id: 'tuyen-duong',
    label: 'Tuyên dương',
    icon: '🌹',
    badgeBg: 'from-rose-500 to-pink-600',
  },
  {
    id: 'sao-do',
    label: 'Sao đỏ',
    icon: '🫡',
    badgeBg: 'from-amber-500 to-orange-600',
  },
  {
    id: 'lop-pho',
    label: 'Lớp phó',
    icon: '🌺',
    badgeBg: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'lop-truong',
    label: 'Lớp trưởng',
    icon: '👑',
    badgeBg: 'from-sky-500 to-indigo-600',
  },
];

const CHALKBOARD_STAGE_TABS: {
  id: ChalkboardStageMode;
  label: string;
  shortLabel: string;
  icon: string;
}[] = [
  { id: 'slide', label: 'Slide Bài Giảng', shortLabel: 'Slide', icon: '📑' },
  { id: 'hd1', label: 'HĐ 1: Khởi động', shortLabel: 'HĐ 1', icon: '🎬' },
  { id: 'hd2', label: 'HĐ 2: Khám phá', shortLabel: 'HĐ 2', icon: '🔍' },
  { id: 'hd3', label: 'HĐ 3: Luyện tập', shortLabel: 'HĐ 3', icon: '⚡' },
  { id: 'hd3-practice', label: 'HĐ 3: Thực hành', shortLabel: 'HĐ 3 (TH)', icon: '💻' },
  { id: 'hd4', label: 'HĐ 4: Vận dụng', shortLabel: 'HĐ 4', icon: '🚀' },
];

export const LiveClassroomWaitingRoom: React.FC<LiveClassroomWaitingRoomProps> = ({
  role,
  grade,
  period,
  classId,
  periodSpec,
  students,
  currentStudent,
  liveSession,
  onUpdateLiveSession,
  onReadyForLearning,
  onStartActivityStage,
  onBoardModeChange,
  externalBoardMode,
  onAwardXp,
  onShowToast,
}) => {
  const lessonKey = `k${grade}-tiet-${period}`;

  const blueprint = useMemo(
    () => buildLessonBlueprintFromPeriod(periodSpec),
    [periodSpec]
  );

  const { allSeats, team1Seats, team2Seats } = useMemo(
    () => buildDesignatedClassDeskRoster(students, classId, grade, 18),
    [students, classId, grade]
  );

  const station25DCoordinateMap = useMemo(
    () => buildAllStations25DCoordinateMap({ totalDesks: Math.max(18, allSeats.length) }),
    [allSeats.length]
  );

  const fallbackWaitingState = useMemo(
    () => ({
      ...createInitialWaitingRoomState({
        classId,
        grade,
        period,
        students,
        preJoinRealStudents: true,
      }),
      activeBoardMode: 'slide' as const,
      activeSlideIndex: 0,
      activeWarmupTab: 'html-sim' as const,
    }),
    [classId, grade, period, students]
  );

  const waitingState: WaitingRoomState =
    liveSession?.waitingRoomByLesson?.[lessonKey] &&
    liveSession.waitingRoomByLesson[lessonKey].classId === classId
      ? liveSession.waitingRoomByLesson[lessonKey]
      : fallbackWaitingState;

  // Resolve current unified chalkboard mode ('slide' | 'hd1' | 'hd2' | 'hd3' | 'hd3-practice' | 'hd4')
  const resolvedBoardMode: ChalkboardStageMode = useMemo(() => {
    if (externalBoardMode) return externalBoardMode;
    if (waitingState.activeBoardMode) return waitingState.activeBoardMode;
    const lv = liveSession?.activeLiveView;
    if (
      lv === 'slide' ||
      lv === 'hd1' ||
      lv === 'hd2' ||
      lv === 'hd3' ||
      lv === 'hd3-practice' ||
      lv === 'hd4'
    ) {
      return lv;
    }
    return 'slide';
  }, [externalBoardMode, waitingState.activeBoardMode, liveSession?.activeLiveView]);

  // Hybrid 3-Tier Slide Deck & Warmup Configuration State
  const [hybridDeck, setHybridDeck] = useState<HybridSlideDeckRecord>(() =>
    buildDefaultHighResSlideDeck({
      grade,
      period,
      lessonTitle: periodSpec.lessonTitle,
      topic: periodSpec.topic,
      yccd: periodSpec.yccd,
      nlsCode: periodSpec.nlsCode,
      nlsAction: periodSpec.nlsAction,
      aiCompetency: periodSpec.aiCompetency,
    })
  );
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isBoardExpanded, setIsBoardExpanded] = useState<boolean>(false);
  const [slideZoomPercent, setSlideZoomPercent] = useState<number>(100);

  // Load 3-Tier Hybrid Slide Deck (IndexedDB Cache + Server Permanent Storage) whenever grade/period changes
  useEffect(() => {
    let cancelled = false;
    loadHybridSlideDeck3Tier({
      grade,
      period,
      lessonTitle: periodSpec.lessonTitle,
      topic: periodSpec.topic,
      yccd: periodSpec.yccd,
      nlsCode: periodSpec.nlsCode,
      nlsAction: periodSpec.nlsAction,
      aiCompetency: periodSpec.aiCompetency,
    })
      .then((loaded) => {
        if (!cancelled) {
          setHybridDeck(loaded);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [grade, period, periodSpec.lessonTitle]);

  const slides = hybridDeck.slides || [];
  const rawSlideIndex =
    waitingState.activeSlideIndex ??
    liveSession?.activeSlideIndexByLesson?.[lessonKey] ??
    0;
  const safeSlideIndex =
    slides.length > 0 ? Math.max(0, Math.min(rawSlideIndex, slides.length - 1)) : 0;
  const activeSlide = slides[safeSlideIndex] || slides[0];

  const activeWarmupTab: 'html-sim' | 'video' | 'image' =
    waitingState.activeWarmupTab || hybridDeck.warmupConfig?.activeMediaType || 'html-sim';

  // Interactive Stage 2 (Khám phá) state on Chalkboard
  const [hd2SubTab, setHd2SubTab] = useState<'drag' | 'fill' | 'match' | 'short'>('drag');
  const [hd2DragAssignments, setHd2DragAssignments] = useState<Record<string, 'data' | 'info'>>({});
  const [hd2Blank1, setHd2Blank1] = useState<string>('');
  const [hd2Blank2, setHd2Blank2] = useState<string>('');
  const [hd2MatchSelections, setHd2MatchSelections] = useState<Record<string, string>>({});
  const [hd2ShortAnswer, setHd2ShortAnswer] = useState<string>('');
  const [hd2SubmittedScore, setHd2SubmittedScore] = useState<number | null>(null);
  const [hd2RevealAnswers, setHd2RevealAnswers] = useState<boolean>(false);

  // Interactive Stage 3 (Luyện tập 25s & Thực hành) state on Chalkboard
  const arenaQuizzes = blueprint.stage3.quizQuestions || [];
  const safeQuizIdx =
    arenaQuizzes.length > 0
      ? Math.max(0, Math.min(waitingState.currentQuizIndex || 0, arenaQuizzes.length - 1))
      : 0;
  const activeArenaQuiz = arenaQuizzes[safeQuizIdx] || arenaQuizzes[0];
  const [quizCountdownSec, setQuizCountdownSec] = useState<number>(25);
  const [isQuizTimerRunning, setIsQuizTimerRunning] = useState<boolean>(false);

  // Stage 3 Practice & Stage 4 Application states on Chalkboard
  const [practiceNoteInput, setPracticeNoteInput] = useState<string>('');
  const [practiceSubmitted, setPracticeSubmitted] = useState<boolean>(false);
  const [hd4SolutionInput, setHd4SolutionInput] = useState<string>('');
  const [hd4Submitted, setHd4Submitted] = useState<boolean>(false);

  const [selectedRoleBrush, setSelectedRoleBrush] = useState<ClassroomHonorRole | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Floating Hearts & Fireworks Celebration State
  const [floatingParticles, setFloatingParticles] = useState<FloatingReactionParticle[]>([]);
  const [joinBannerAlert, setJoinBannerAlert] = useState<{
    id: string;
    name: string;
    stationNumber: string;
    team: 1 | 2;
  } | null>(null);
  const [recentJoinedStudentId, setRecentJoinedStudentId] = useState<string | null>(null);
  const [activeDeskBursts, setActiveDeskBursts] = useState<Record<string, number>>({});
  const seatElementsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fireworksParticlesRef = useRef<TableFireworkParticle[]>([]);
  const fireworksRocketsRef = useRef<TableFireworkRocket[]>([]);
  const fireworksRafRef = useRef<number | null>(null);

  const prevJoinedIdsRef = useRef<string[]>(waitingState.joinedStudentIds || []);
  const prevBurstCountRef = useRef<number>(waitingState.reactionBurstCount || 0);
  const demoJoinCursorRef = useRef<number>(0);

  const renderFireworksCanvasFrame = () => {
    const canvas = fireworksCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      fireworksRafRef.current = null;
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      fireworksRafRef.current = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nextRockets: TableFireworkRocket[] = [];
    for (const rocket of fireworksRocketsRef.current) {
      const nextY = rocket.y + rocket.vy;
      const nextTrail = [
        { x: rocket.x, y: rocket.y, alpha: 0.95 },
        ...rocket.trail.map((t) => ({ ...t, alpha: t.alpha - 0.14 })).filter((t) => t.alpha > 0.05),
      ].slice(0, 8);

      for (let i = 0; i < nextTrail.length; i++) {
        const pt = nextTrail[i];
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = i === 0 ? '#ffffff' : rocket.color;
        ctx.shadowColor = rocket.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1.8, 4.5 - i * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (nextY <= rocket.targetY) {
        const apexParticles = createTableFireworkBurstParticles({
          originX: rocket.x,
          originY: rocket.targetY,
          team: rocket.team,
          burstId: `${rocket.id}-apex`,
        });
        fireworksParticlesRef.current.push(...apexParticles);
      } else {
        nextRockets.push({
          ...rocket,
          y: nextY,
          vy: rocket.vy * 0.96,
          trail: nextTrail,
        });
      }
    }
    fireworksRocketsRef.current = nextRockets;

    fireworksParticlesRef.current = stepFireworkBurstParticles(fireworksParticlesRef.current, 1);

    for (const p of fireworksParticlesRef.current) {
      if (p.shape === 'ring') {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.ringRadius ?? 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (p.shape === 'heart') {
        drawCanvasHeart(ctx, p.x, p.y, p.size, p.color, p.alpha);
      } else if (p.shape === 'star') {
        drawCanvasStar(ctx, p.x, p.y, p.size, p.color, p.alpha);
      } else {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.strokeStyle = p.color;
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = p.size * 0.78;
        ctx.lineCap = 'round';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (fireworksRocketsRef.current.length > 0 || fireworksParticlesRef.current.length > 0) {
      fireworksRafRef.current = requestAnimationFrame(renderFireworksCanvasFrame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fireworksRafRef.current = null;
    }
  };

  const launchTableFireworkOnCanvas = (studentId: string, team: 1 | 2 = 1) => {
    const matchedSeat = allSeats.find((s) => s.studentId === studentId);
    const seatEl = seatElementsRef.current[studentId];
    const containerEl = containerRef.current;
    const seatRect = seatEl ? seatEl.getBoundingClientRect() : null;
    const containerRect = containerEl ? containerEl.getBoundingClientRect() : null;
    const origin = calculateDeskCanvasOrigin(seatRect, containerRect, {
      stationNumber: matchedSeat?.stationNumber || '01',
      team: matchedSeat?.team || team,
      deskIndexInTeam: matchedSeat?.deskIndexInTeam,
      totalDesks: allSeats.length,
    });

    const nowId = `fw-${studentId}-${Date.now()}`;
    const deskParticles = createTableFireworkBurstParticles({
      originX: origin.x,
      originY: origin.y,
      team: matchedSeat?.team || team,
      burstId: `${nowId}-desk`,
    });
    fireworksParticlesRef.current.push(...deskParticles);

    fireworksRocketsRef.current.push({
      id: nowId,
      x: origin.x,
      y: origin.y + 18,
      startY: origin.y + 18,
      targetY: origin.apexY,
      vy: -6.4,
      team: matchedSeat?.team || team,
      color: (matchedSeat?.team || team) === 1 ? '#fb7185' : '#38bdf8',
      trail: [],
    });

    if (fireworksRafRef.current === null && typeof requestAnimationFrame !== 'undefined') {
      fireworksRafRef.current = requestAnimationFrame(renderFireworksCanvasFrame);
    }
  };

  useEffect(() => {
    return () => {
      if (fireworksRafRef.current !== null && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(fireworksRafRef.current);
      }
    };
  }, []);

  const activateDeskBurstForStudent = (studentId: string, teamOverride?: 1 | 2) => {
    if (!studentId) return;
    const matchedSeat = allSeats.find((s) => s.studentId === studentId);
    const resolvedTeam: 1 | 2 = teamOverride || matchedSeat?.team || 1;

    setRecentJoinedStudentId(studentId);
    setActiveDeskBursts((prev) => ({
      ...prev,
      [studentId]: Date.now(),
    }));

    setTimeout(() => {
      const seatEl = seatElementsRef.current[studentId];
      launchTableFireworkOnCanvas(studentId, resolvedTeam);
      triggerStudentDeskFireworkCelebration(seatEl, {
        stationNumber: matchedSeat?.stationNumber || '01',
        team: resolvedTeam,
        deskIndexInTeam: matchedSeat?.deskIndexInTeam,
        totalDesks: allSeats.length,
      });
    }, 50);

    setTimeout(() => {
      setActiveDeskBursts((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }, 6500);
  };

  const triggerHeartAndFireworkBurst = (studentInfo?: {
    id: string;
    name: string;
    stationNumber: string;
    team: 1 | 2;
  }) => {
    const now = Date.now();
    const matchedSeat = studentInfo
      ? allSeats.find((s) => s.studentId === studentInfo.id) ||
        allSeats.find((s) => s.stationNumber === studentInfo.stationNumber)
      : allSeats[demoJoinCursorRef.current % Math.max(1, allSeats.length)];

    const stationCoord = getStationDesk25DCoordinates(
      studentInfo?.stationNumber || matchedSeat?.stationNumber || '01',
      {
        totalDesks: allSeats.length,
        teamOverride: studentInfo?.team || matchedSeat?.team,
        deskIndexInTeamOverride: matchedSeat?.deskIndexInTeam,
      }
    );

    const baseLeftPct = stationCoord.normalizedX * 100;
    const baseTopPct = stationCoord.normalizedY * 100;

    const newParticles: FloatingReactionParticle[] = Array.from({ length: 14 }).map((_, idx) => {
      const offsetX = ((idx % 7) - 3) * 2.4;
      const offsetY = -((idx % 4) * 3.2);
      return {
        id: `pt-${now}-${idx}`,
        symbol: REACTION_SYMBOLS[idx % REACTION_SYMBOLS.length],
        leftPercent: Math.min(94, Math.max(6, baseLeftPct + offsetX)),
        topPercent: Math.min(90, Math.max(18, baseTopPct + offsetY)),
        delayMs: (idx % 5) * 95,
        durationMs: 1700 + (idx % 4) * 320,
        scale: 0.92 + (idx % 3) * 0.22,
      };
    });

    setFloatingParticles((prev) => [...prev.slice(-14), ...newParticles]);

    if (studentInfo) {
      setJoinBannerAlert(studentInfo);
      activateDeskBurstForStudent(studentInfo.id, studentInfo.team);
    } else if (matchedSeat) {
      activateDeskBurstForStudent(matchedSeat.studentId, matchedSeat.team);
    } else {
      triggerSynchronizedCelebration();
    }

    setTimeout(() => {
      setFloatingParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 3200);
  };

  useEffect(() => {
    const currentIds = waitingState.joinedStudentIds || [];
    const currentBurst = waitingState.reactionBurstCount || 0;
    const newlyJoinedSeats = detectNewlyJoinedWaitingRoomStudents(
      prevJoinedIdsRef.current,
      currentIds,
      allSeats
    );

    if (newlyJoinedSeats.length > 0) {
      newlyJoinedSeats.slice(-4).forEach((seat) => {
        activateDeskBurstForStudent(seat.studentId, seat.team);
      });
      const latestSeat = newlyJoinedSeats[newlyJoinedSeats.length - 1];
      setJoinBannerAlert({
        id: latestSeat.studentId,
        name: latestSeat.studentName,
        stationNumber: latestSeat.stationNumber,
        team: latestSeat.team,
      });
    } else if (currentBurst > prevBurstCountRef.current) {
      const lastJoined = waitingState.lastJoinedStudent;
      if (lastJoined) {
        triggerHeartAndFireworkBurst({
          id: lastJoined.id,
          name: lastJoined.name,
          stationNumber: lastJoined.stationNumber,
          team: lastJoined.team,
        });
      } else {
        triggerHeartAndFireworkBurst();
      }
    }

    prevJoinedIdsRef.current = currentIds;
    prevBurstCountRef.current = currentBurst;
  }, [
    waitingState.joinedStudentIds,
    waitingState.reactionBurstCount,
    waitingState.lastJoinedStudent?.timestampIso,
    allSeats,
  ]);

  useEffect(() => {
    if (!joinBannerAlert) return;
    const timer = setTimeout(() => setJoinBannerAlert(null), 5500);
    return () => clearTimeout(timer);
  }, [joinBannerAlert]);

  useEffect(() => {
    if (!recentJoinedStudentId) return;
    const timer = setTimeout(() => setRecentJoinedStudentId(null), 6500);
    return () => clearTimeout(timer);
  }, [recentJoinedStudentId]);

  const updateWaitingRoom = (
    updater: (prev: WaitingRoomState) => WaitingRoomState,
    extraSessionPatch?: Partial<LiveClassroomSession>
  ) => {
    if (!onUpdateLiveSession) return;
    onUpdateLiveSession((prevSession) => {
      const currentWR =
        prevSession.waitingRoomByLesson?.[lessonKey] &&
        prevSession.waitingRoomByLesson[lessonKey].classId === classId
          ? prevSession.waitingRoomByLesson[lessonKey]
          : fallbackWaitingState;
      const nextWR = updater(currentWR);

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('cloudplay_realtime_sync');
          bc.postMessage({
            type: 'WAITING_ROOM_SYNC',
            lessonKey,
            waitingRoomState: nextWR,
          });
          bc.close();
        }
      } catch {
        // ignore BroadcastChannel error
      }

      return {
        ...prevSession,
        ...(extraSessionPatch || {}),
        waitingRoomByLesson: {
          ...(prevSession.waitingRoomByLesson || {}),
          [lessonKey]: nextWR,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  useEffect(() => {
    if (
      role === 'teacher' &&
      onUpdateLiveSession &&
      (!liveSession?.waitingRoomByLesson?.[lessonKey] ||
        liveSession.waitingRoomByLesson[lessonKey].classId !== classId)
    ) {
      updateWaitingRoom(() => fallbackWaitingState);
    }
  }, [role, lessonKey, classId]);

  useEffect(() => {
    if (role !== 'student' || !currentStudent) return;

    const mySeat =
      allSeats.find((s) => s.studentId === currentStudent.id) || allSeats[0];
    const alreadyIn = waitingState.joinedStudentIds.includes(currentStudent.id);

    if (!alreadyIn) {
      updateWaitingRoom((prev) => {
        const res = registerStudentJoinWaitingRoom(prev, {
          id: currentStudent.id,
          name: currentStudent.name,
          classId,
          stationNumber: currentStudent.stationNumber || mySeat?.stationNumber || '01',
          team: mySeat?.team || 1,
        });
        if (res.accepted && !res.alreadyJoined) {
          const payload = buildWaitingRoomStudentJoinedBroadcastPayload({
            lessonKey,
            classId,
            grade,
            period,
            studentId: currentStudent.id,
            studentName: currentStudent.name,
            stationNumber: currentStudent.stationNumber || mySeat?.stationNumber || '01',
            team: mySeat?.team || 1,
            totalCount: allSeats.length,
            waitingRoomState: res.nextState,
          });
          broadcastWaitingRoomStudentJoined(payload);
        }
        return res.nextState;
      });
    }
  }, [role, currentStudent?.id, classId, lessonKey]);

  // Listen for real-time BroadcastChannel updates across tabs (including Hybrid 3-Tier slide updates)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('cloudplay_realtime_sync');
    bc.onmessage = (ev) => {
      const data = ev.data;
      if (!data) return;
      if (data.type === 'WAITING_ROOM_STUDENT_JOINED' && data.lessonKey === lessonKey) {
        if (data.studentId) {
          triggerHeartAndFireworkBurst({
            id: data.studentId,
            name: data.studentName || 'Học sinh',
            stationNumber: data.stationNumber || '01',
            team: data.team || 1,
          });
        }
        if (data.waitingRoomState && onUpdateLiveSession) {
          onUpdateLiveSession((prev) => ({
            ...prev,
            waitingRoomByLesson: {
              ...(prev.waitingRoomByLesson || {}),
              [lessonKey]: data.waitingRoomState,
            },
            updatedAt: new Date().toISOString(),
          }));
        }
      } else if (
        data.type === 'WAITING_ROOM_SYNC' &&
        data.lessonKey === lessonKey &&
        data.waitingRoomState &&
        onUpdateLiveSession
      ) {
        onUpdateLiveSession((prev) => ({
          ...prev,
          waitingRoomByLesson: {
            ...(prev.waitingRoomByLesson || {}),
            [lessonKey]: data.waitingRoomState,
          },
          updatedAt: new Date().toISOString(),
        }));
      } else if (data.type === 'HYBRID_SLIDE_DECK_UPDATED' && data.lessonKey === lessonKey) {
        loadHybridSlideDeck3Tier({
          grade,
          period,
          lessonTitle: periodSpec.lessonTitle,
          topic: periodSpec.topic,
          yccd: periodSpec.yccd,
          nlsCode: periodSpec.nlsCode,
          nlsAction: periodSpec.nlsAction,
          aiCompetency: periodSpec.aiCompetency,
        })
          .then((reloaded) => setHybridDeck(reloaded))
          .catch(() => {});
      }
    };
    return () => bc.close();
  }, [lessonKey, grade, period, periodSpec.lessonTitle, onUpdateLiveSession]);

  // Keyboard navigation for Teacher when Slide mode is active on the Chalkboard
  useEffect(() => {
    if (role !== 'teacher' || resolvedBoardMode !== 'slide') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleStepSlide(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handleStepSlide(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [role, resolvedBoardMode, safeSlideIndex, slides.length]);

  // Countdown timer for Stage 3 25s Arena Quiz on Chalkboard
  useEffect(() => {
    if (!isQuizTimerRunning) return;
    const timer = setInterval(() => {
      setQuizCountdownSec((prev) => {
        if (prev <= 1) {
          setIsQuizTimerRunning(false);
          updateWaitingRoom((wr) => ({
            ...wr,
            isQuizLocked: true,
            showQuizAnswer: true,
          }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuizTimerRunning]);

  const joinedSet = useMemo(
    () => new Set(waitingState.joinedStudentIds || []),
    [waitingState.joinedStudentIds]
  );

  const joinedCount = allSeats.filter((s) => joinedSet.has(s.studentId)).length;
  const waitingSeats = allSeats.filter((s) => !joinedSet.has(s.studentId));
  const answeredCount = Object.keys(waitingState.studentQuickAnswers || {}).length;

  const totalScore = Math.max(1, waitingState.team1Score + waitingState.team2Score);
  const team1Percent = Math.min(
    85,
    Math.max(15, Math.round((waitingState.team1Score / totalScore) * 100))
  );

  // Switch active mode on the Chalkboard Stage (Synchronized between Teacher and Student)
  const handleSelectBoardMode = (mode: ChalkboardStageMode) => {
    onBoardModeChange?.(mode);
    if (role === 'teacher') {
      const stageNum: 1 | 2 | 3 | 4 =
        mode === 'hd2'
          ? 2
          : mode === 'hd3' || mode === 'hd3-practice'
          ? 3
          : mode === 'hd4'
          ? 4
          : 1;
      playStageBroadcastSound();
      updateWaitingRoom(
        (prev) => ({
          ...prev,
          isReadyForLearning: true,
          activeBoardMode: mode,
          updatedAt: new Date().toISOString(),
        }),
        {
          isBroadcasting: true,
          activeLiveView: mode,
          activeStage: stageNum,
          unlockedSlideDeckByLesson: {
            ...(liveSession?.unlockedSlideDeckByLesson || {}),
            [lessonKey]: true,
          },
          unlockedPracticeStage3ByLesson:
            mode === 'hd3-practice'
              ? {
                  ...(liveSession?.unlockedPracticeStage3ByLesson || {}),
                  [lessonKey]: true,
                }
              : liveSession?.unlockedPracticeStage3ByLesson,
          unlockedStagesByLesson: {
            ...(liveSession?.unlockedStagesByLesson || {}),
            [lessonKey]: {
              ...(liveSession?.unlockedStagesByLesson?.[lessonKey] || {
                1: true,
                2: true,
                3: true,
                4: true,
              }),
              [stageNum]: true,
            },
          },
        }
      );
      if (mode === 'hd1' || mode === 'hd2' || mode === 'hd3' || mode === 'hd4') {
        const sNum = Number(mode.replace('hd', '')) as 1 | 2 | 3 | 4;
        onStartActivityStage?.(sNum);
      }
    }
  };

  const handleGoToSlide = (targetIdx: number) => {
    if (slides.length === 0) return;
    const clamped = Math.max(0, Math.min(targetIdx, slides.length - 1));
    updateWaitingRoom(
      (prev) => ({
        ...prev,
        activeBoardMode: 'slide',
        activeSlideIndex: clamped,
        updatedAt: new Date().toISOString(),
      }),
      {
        activeLiveView: 'slide',
        activeSlideIndexByLesson: {
          ...(liveSession?.activeSlideIndexByLesson || {}),
          [lessonKey]: clamped,
        },
      }
    );
  };

  const handleStepSlide = (delta: number) => {
    handleGoToSlide(safeSlideIndex + delta);
  };

  const handleSelectWarmupTab = (tab: 'html-sim' | 'video' | 'image') => {
    updateWaitingRoom((prev) => ({
      ...prev,
      activeBoardMode: 'hd1',
      activeWarmupTab: tab,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSeatClick = (seat: ClassroomDeskSeat) => {
    if (role === 'teacher') {
      if (selectedRoleBrush) {
        updateWaitingRoom((prev) =>
          assignWaitingRoomHonorRole(prev, {
            studentId: seat.studentId,
            studentName: seat.studentName,
            role: selectedRoleBrush,
            team: seat.team,
          })
        );
        const roleMeta = HONOR_ROLE_META.find((r) => r.id === selectedRoleBrush);
        triggerSynchronizedCelebration('xp');
        onShowToast(
          `${roleMeta?.icon || '🌟'} Đã trao danh hiệu "${roleMeta?.label}" cho ${seat.studentName} (Tổ ${seat.team})!`
        );
        setSelectedRoleBrush(null);
        return;
      }

      if (!joinedSet.has(seat.studentId)) {
        updateWaitingRoom((prev) => {
          const res = registerStudentJoinWaitingRoom(prev, {
            id: seat.studentId,
            name: seat.studentName,
            classId: seat.classId,
            stationNumber: seat.stationNumber,
            team: seat.team,
          });
          return res.nextState;
        });
        playStageBroadcastSound();
        triggerHeartAndFireworkBurst({
          id: seat.studentId,
          name: seat.studentName,
          stationNumber: seat.stationNumber,
          team: seat.team,
        });
        onShowToast(
          `🎆❤️ Chào mừng học sinh ${seat.studentName} (Máy #${seat.stationNumber}) vừa vào bàn Tổ ${seat.team}!`
        );
      } else {
        updateWaitingRoom((prev) =>
          assignWaitingRoomHonorRole(prev, {
            studentId: seat.studentId,
            studentName: seat.studentName,
            role: 'tuyen-duong',
            team: seat.team,
          })
        );
        triggerHeartAndFireworkBurst({
          id: seat.studentId,
          name: seat.studentName,
          stationNumber: seat.stationNumber,
          team: seat.team,
        });
        onShowToast(
          `🌹❤️ Đã thả tim & tuyên dương ${seat.studentName} (+3 điểm thi đua cho Tổ ${seat.team})!`
        );
      }
      return;
    }

    if (currentStudent && seat.studentId === currentStudent.id) {
      triggerHeartAndFireworkBurst({
        id: seat.studentId,
        name: seat.studentName,
        stationNumber: seat.stationNumber,
        team: seat.team,
      });
      onShowToast(
        `🪑❤️ Đây là vị trí bàn của em (${seat.studentName} • Máy #${seat.stationNumber} • Tổ ${seat.team})!`
      );
    }
  };

  const handleAdmitSingleWaitingStudent = () => {
    const fallbackSeat =
      allSeats[demoJoinCursorRef.current % Math.max(1, allSeats.length)] || allSeats[0];
    demoJoinCursorRef.current = (demoJoinCursorRef.current + 1) % Math.max(1, allSeats.length);
    const nextSeat = waitingSeats[0] || fallbackSeat;
    if (!nextSeat) return;

    if (waitingSeats.length > 0) {
      updateWaitingRoom((prev) => {
        const res = registerStudentJoinWaitingRoom(prev, {
          id: nextSeat.studentId,
          name: nextSeat.studentName,
          classId: nextSeat.classId,
          stationNumber: nextSeat.stationNumber,
          team: nextSeat.team,
        });
        return res.nextState;
      });
    } else {
      const nowIso = new Date().toISOString();
      updateWaitingRoom((prev) => ({
        ...appendWaitingRoomChatMessage(prev, {
          studentId: nextSeat.studentId,
          studentName: nextSeat.studentName,
          stationNumber: nextSeat.stationNumber,
          text: `🎆❤️ ${nextSeat.studentName} (Máy #${nextSeat.stationNumber}) vừa kết nối thành công vào Phòng Live Tổ ${nextSeat.team}!`,
        }),
        lastJoinedStudent: {
          id: nextSeat.studentId,
          name: nextSeat.studentName,
          stationNumber: nextSeat.stationNumber,
          team: nextSeat.team,
          timestampIso: nowIso,
        },
        reactionBurstCount: (prev.reactionBurstCount || 0) + 1,
        updatedAt: nowIso,
      }));
    }

    playStageBroadcastSound();
    triggerHeartAndFireworkBurst({
      id: nextSeat.studentId,
      name: nextSeat.studentName,
      stationNumber: nextSeat.stationNumber,
      team: nextSeat.team,
    });
    onShowToast(
      `🎆❤️ Học sinh ${nextSeat.studentName} (Máy #${nextSeat.stationNumber}) vừa kết nối vào bàn Tổ ${nextSeat.team}!`
    );
  };

  const handleAdmitNextBatchOrAll = () => {
    updateWaitingRoom((prev) => admitAllClassStudentsToWaitingRoom(prev, allSeats));
    triggerHeartAndFireworkBurst({
      id: allSeats[allSeats.length - 1]?.studentId || 'all',
      name: `Toàn bộ ${allSeats.length} học sinh Lớp ${classId}`,
      stationNumber: '01-42',
      team: 1,
    });
    onShowToast(
      `🎆❤️ Toàn bộ ${allSeats.length} học sinh Lớp ${classId} đã vào Phòng Live Chính và ổn định chỗ ngồi tại 2 dãy bàn!`
    );
  };

  const handleTeacherMarkReadyForLearning = () => {
    // Chuyển từ trình chiếu Slide sang Hoạt động 1 (Khởi động) hoặc chu trình hoạt động ngay trên Bảng chính
    const nextMode: ChalkboardStageMode = resolvedBoardMode === 'slide' ? 'hd1' : 'slide';
    handleSelectBoardMode(nextMode);
    triggerSynchronizedCelebration();
    onReadyForLearning?.();
  };

  const handleManualHeartFireworkReaction = () => {
    const targetSeat =
      (currentStudent && allSeats.find((s) => s.studentId === currentStudent.id)) ||
      (waitingState.lastJoinedStudent &&
        allSeats.find((s) => s.studentId === waitingState.lastJoinedStudent?.id)) ||
      allSeats[demoJoinCursorRef.current % Math.max(1, allSeats.length)] ||
      allSeats[0];
    demoJoinCursorRef.current = (demoJoinCursorRef.current + 1) % Math.max(1, allSeats.length);

    const actorName =
      role === 'teacher'
        ? targetSeat
          ? `${targetSeat.studentName} (Máy #${targetSeat.stationNumber})`
          : 'Thầy Đỗ Mạnh Trường'
        : currentStudent?.name || 'Học sinh';
    const actorStation = targetSeat?.stationNumber || currentStudent?.stationNumber || '01';
    const actorTeam: 1 | 2 = targetSeat?.team || 1;

    updateWaitingRoom((prev) => ({
      ...appendWaitingRoomChatMessage(prev, {
        studentId: targetSeat?.studentId || currentStudent?.id || 'teacher',
        studentName: actorName,
        stationNumber: actorStation,
        text: `❤️🎆 Pháo hoa & thả tim tại bàn Máy #${actorStation} (${actorName} • Tổ ${actorTeam})!`,
      }),
      reactionBurstCount: (prev.reactionBurstCount || 0) + 1,
    }));

    triggerHeartAndFireworkBurst({
      id: targetSeat?.studentId || currentStudent?.id || 'teacher',
      name: targetSeat?.studentName || actorName,
      stationNumber: actorStation,
      team: actorTeam,
    });
    onShowToast(
      `❤️🎆 Đã bắn pháo hoa & thả tim tại vị trí bàn Máy #${actorStation} (${targetSeat?.studentName || actorName})!`
    );
  };

  const notifyStageCompletionToTeacher = (
    stageCode: 'stage2' | 'stage3' | 'stage4',
    scoreEarned: number
  ) => {
    const actor =
      currentStudent ||
      students.find((s) => s.classId === classId) ||
      students[0];
    if (!actor) return;

    const nowIso = new Date().toISOString();
    const completionEvent = {
      id: `comp-${actor.id}-${lessonKey}-${stageCode}-${Date.now()}`,
      studentId: actor.id,
      studentName: actor.name,
      classId,
      grade,
      period,
      stage: stageCode,
      score: scoreEarned,
      xpAwarded: 30,
      timestampIso: nowIso,
    };

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('cloudplay_realtime_sync');
        bc.postMessage({
          type: 'STUDENT_STAGE_COMPLETED',
          completionEvent,
        });
        bc.close();
      }
    } catch {
      // ignore
    }

    if (onUpdateLiveSession) {
      const numericStage: 1 | 2 | 3 | 4 =
        stageCode === 'stage2' ? 2 : stageCode === 'stage3' ? 3 : 4;
      onUpdateLiveSession((prev) => {
        const prevMap = prev.completedStagesByStudent || {};
        const prevStages = prevMap[actor.id] || [];
        const nextStages: ('hd3-practice' | 1 | 2 | 3 | 4)[] = prevStages.includes(numericStage)
          ? prevStages
          : [...prevStages, numericStage];
        return {
          ...prev,
          lastStudentStageCompletion: completionEvent as any,
          completedStagesByStudent: {
            ...prevMap,
            [actor.id]: nextStages,
          },
          updatedAt: nowIso,
        };
      });
    }
  };

  // Stage 2 (Khám phá) Submission on Chalkboard
  const handleSubmitStage2OnBoard = () => {
    const dragItems = blueprint.stage2.dragItems || [];
    let correctCount = 0;
    dragItems.forEach((item) => {
      if (hd2DragAssignments[item.id] === item.correctBox) correctCount++;
    });
    if (hd2Blank1.trim().length > 0) correctCount++;
    if (hd2Blank2.trim().length > 0) correctCount++;
    if (Object.keys(hd2MatchSelections).length > 0) correctCount++;
    if (hd2ShortAnswer.trim().length > 3) correctCount++;

    const totalPossible = Math.max(1, dragItems.length + 4);
    const score = Math.max(4, Math.min(10, Math.round((correctCount / totalPossible) * 10 * 10) / 10));
    setHd2SubmittedScore(score);

    const targetSeat =
      (currentStudent && allSeats.find((s) => s.studentId === currentStudent.id)) ||
      allSeats[0];
    const team: 1 | 2 = targetSeat?.team || 1;

    updateWaitingRoom((prev) => ({
      ...appendWaitingRoomChatMessage(prev, {
        studentId: targetSeat?.studentId || 'student',
        studentName: targetSeat?.studentName || 'Học sinh',
        stationNumber: targetSeat?.stationNumber || '01',
        text: `🔍 ${targetSeat?.studentName || 'Học sinh'} vừa hoàn thành Phiếu học tập HĐ 2 trên bảng (${score}/10đ • +3đ Tổ ${team})!`,
      }),
      team1Score: team === 1 ? prev.team1Score + 3 : prev.team1Score,
      team2Score: team === 2 ? prev.team2Score + 3 : prev.team2Score,
      reactionBurstCount: (prev.reactionBurstCount || 0) + 1,
    }));

    if (targetSeat) {
      triggerHeartAndFireworkBurst({
        id: targetSeat.studentId,
        name: targetSeat.studentName,
        stationNumber: targetSeat.stationNumber,
        team: targetSeat.team,
      });
    }
    notifyStageCompletionToTeacher('stage2', score);
    onAwardXp?.(30);
    onShowToast(`🎉 Đã nộp Phiếu học tập HĐ 2 (${score}/10 điểm) • +3 điểm thi đua cho Tổ ${team}!`);
  };

  // Stage 3 (Đấu trường 25s) Option Selection on Chalkboard
  const handleSelectArenaOption = (letter: 'A' | 'B' | 'C' | 'D') => {
    const opt = activeArenaQuiz?.options?.find((o) => o.letter === letter);
    const isCorrect = Boolean(opt?.isCorrect);
    const mappedChoice: 'A' | 'B' | 'C' = letter === 'D' ? 'C' : letter;

    if (role === 'teacher') {
      const joinedSeats = allSeats.filter((s) => joinedSet.has(s.studentId));
      const picker =
        joinedSeats.length > 0
          ? joinedSeats[Math.floor(Math.random() * joinedSeats.length)]
          : allSeats[0];
      if (picker) {
        updateWaitingRoom((prev) =>
          submitWaitingRoomQuickAnswer(prev, {
            studentId: picker.studentId,
            studentName: picker.studentName,
            stationNumber: picker.stationNumber,
            choice: mappedChoice,
            isCorrect,
            team: picker.team,
          })
        );
        if (isCorrect) {
          activateDeskBurstForStudent(picker.studentId, picker.team);
        }
        onShowToast(
          `🎯 ${picker.studentName} (Tổ ${picker.team}) vừa chọn đáp án ${letter}${
            isCorrect ? ' — Chính xác (+2đ)!' : '!'
          }`
        );
      }
      return;
    }

    if (!currentStudent) return;
    if (waitingState.isQuizLocked) {
      onShowToast('⏰ Đã hết giờ trả lời câu hỏi này!');
      return;
    }

    const mySeat = allSeats.find((s) => s.studentId === currentStudent.id);
    const myTeam: 1 | 2 = mySeat?.team || 1;
    const alreadyAnswered = waitingState.studentQuickAnswers?.[currentStudent.id];

    updateWaitingRoom((prev) =>
      submitWaitingRoomQuickAnswer(prev, {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        stationNumber: currentStudent.stationNumber,
        choice: mappedChoice,
        isCorrect,
        team: myTeam,
      })
    );

    if (isCorrect) {
      activateDeskBurstForStudent(currentStudent.id, myTeam);
      notifyStageCompletionToTeacher('stage3', 10);
      if (!alreadyAnswered && onAwardXp) {
        onAwardXp(20);
      }
    }

    onShowToast(
      isCorrect
        ? `🎉 Chính xác! Em đã mang về +2 điểm cho Tổ ${myTeam} (+20 XP)!`
        : `👍 Đã ghi nhận đáp án ${letter} của em trên bảng lớp!`
    );
  };

  const handleNextQuizQuestion = () => {
    if (arenaQuizzes.length === 0) return;
    const nextIdx = (safeQuizIdx + 1) % arenaQuizzes.length;
    setQuizCountdownSec(25);
    setIsQuizTimerRunning(false);
    updateWaitingRoom((prev) => ({
      ...prev,
      currentQuizIndex: nextIdx,
      isQuizLocked: false,
      showQuizAnswer: false,
      studentQuickAnswers: {},
    }));
    onShowToast(`📋 Đã chuyển sang Câu hỏi Luyện tập ${nextIdx + 1}/${arenaQuizzes.length}!`);
  };

  const handleToggleRevealAnswer = () => {
    const nextShow = !waitingState.showQuizAnswer;
    setIsQuizTimerRunning(false);
    updateWaitingRoom((prev) => ({
      ...prev,
      isQuizLocked: nextShow,
      showQuizAnswer: nextShow,
    }));
    if (nextShow) {
      triggerSynchronizedCelebration('xp');
      onShowToast(`✨ Đã chốt & công bố đáp án đúng trên Bảng lớp!`);
    }
  };

  // Stage 3 Practice & Stage 4 Application Submissions on Chalkboard
  const handleSubmitPracticeOnBoard = () => {
    if (!practiceNoteInput.trim()) {
      onShowToast('⚠️ Vui lòng nhập kết quả hoặc đường dẫn sản phẩm thực hành!');
      return;
    }
    setPracticeSubmitted(true);
    const targetSeat =
      (currentStudent && allSeats.find((s) => s.studentId === currentStudent.id)) ||
      allSeats[0];
    const team: 1 | 2 = targetSeat?.team || 1;
    updateWaitingRoom((prev) => ({
      ...appendWaitingRoomChatMessage(prev, {
        studentId: targetSeat?.studentId || 'student',
        studentName: targetSeat?.studentName || 'Học sinh',
        stationNumber: targetSeat?.stationNumber || '01',
        text: `💻 [Thực hành HĐ 3] ${targetSeat?.studentName || 'Học sinh'}: "${practiceNoteInput.trim()}" (+3đ Tổ ${team})`,
      }),
      team1Score: team === 1 ? prev.team1Score + 3 : prev.team1Score,
      team2Score: team === 2 ? prev.team2Score + 3 : prev.team2Score,
      reactionBurstCount: (prev.reactionBurstCount || 0) + 1,
    }));
    if (targetSeat) {
      triggerHeartAndFireworkBurst({
        id: targetSeat.studentId,
        name: targetSeat.studentName,
        stationNumber: targetSeat.stationNumber,
        team: targetSeat.team,
      });
    }
    notifyStageCompletionToTeacher('stage3', 10);
    onAwardXp?.(30);
    onShowToast(`💻 Đã nộp sản phẩm Thực hành lên Bảng lớp (+3đ Tổ ${team})!`);
  };

  const handleSubmitStage4OnBoard = () => {
    if (!hd4SolutionInput.trim()) {
      onShowToast('⚠️ Vui lòng nhập phương án vận dụng thực tiễn của em!');
      return;
    }
    setHd4Submitted(true);
    const targetSeat =
      (currentStudent && allSeats.find((s) => s.studentId === currentStudent.id)) ||
      allSeats[0];
    const team: 1 | 2 = targetSeat?.team || 1;
    updateWaitingRoom((prev) => ({
      ...appendWaitingRoomChatMessage(prev, {
        studentId: targetSeat?.studentId || 'student',
        studentName: targetSeat?.studentName || 'Học sinh',
        stationNumber: targetSeat?.stationNumber || '01',
        text: `🚀 [Vận dụng HĐ 4] ${targetSeat?.studentName || 'Học sinh'}: "${hd4SolutionInput.trim()}" (+3đ Tổ ${team})`,
      }),
      team1Score: team === 1 ? prev.team1Score + 3 : prev.team1Score,
      team2Score: team === 2 ? prev.team2Score + 3 : prev.team2Score,
      reactionBurstCount: (prev.reactionBurstCount || 0) + 1,
    }));
    if (targetSeat) {
      triggerHeartAndFireworkBurst({
        id: targetSeat.studentId,
        name: targetSeat.studentName,
        stationNumber: targetSeat.stationNumber,
        team: targetSeat.team,
      });
    }
    notifyStageCompletionToTeacher('stage4', 10);
    onAwardXp?.(25);
    onShowToast(`🚀 Đã gửi bài Vận dụng thực tiễn lên Bảng lớp (+3đ Tổ ${team})!`);
  };

  const handleSendQuickChat = (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const raw = presetText ?? chatInput;
    const clean = raw.trim();
    if (!clean) return;

    const senderId =
      role === 'teacher' ? 'teacher' : currentStudent?.id || 'student';
    const senderName =
      role === 'teacher' ? 'Thầy/Cô Giáo' : currentStudent?.name || 'Học sinh';
    const senderStation =
      role === 'teacher' ? 'GV' : currentStudent?.stationNumber || '01';

    updateWaitingRoom((prev) =>
      appendWaitingRoomChatMessage(prev, {
        studentId: senderId,
        studentName: senderName,
        stationNumber: senderStation,
        text: clean,
      })
    );
    if (!presetText) setChatInput('');
  };

  const renderStudentDeskCard = (seat: ClassroomDeskSeat) => {
    const isJoined = joinedSet.has(seat.studentId);
    const isMe = Boolean(currentStudent && currentStudent.id === seat.studentId);
    const isNewlyJoined =
      recentJoinedStudentId === seat.studentId || Boolean(activeDeskBursts[seat.studentId]);
    const honorRole = waitingState.studentRoles?.[seat.studentId];
    const honorMeta = honorRole
      ? HONOR_ROLE_META.find((r) => r.id === honorRole)
      : null;
    const quickAnswer = waitingState.studentQuickAnswers?.[seat.studentId];
    const station25D =
      station25DCoordinateMap[seat.stationNumber] ||
      getStationDesk25DCoordinates(seat.stationNumber, {
        totalDesks: allSeats.length,
        teamOverride: seat.team,
        deskIndexInTeamOverride: seat.deskIndexInTeam,
      });

    return (
      <button
        key={seat.studentId}
        ref={(el) => {
          seatElementsRef.current[seat.studentId] = el;
        }}
        data-seat-id={seat.studentId}
        data-station-number={seat.stationNumber}
        data-desk-25d-xy={`${station25D.x},${station25D.y}`}
        type="button"
        onClick={() => handleSeatClick(seat)}
        aria-label={`Bàn học sinh ${seat.studentName} Máy ${seat.stationNumber} Tổ ${seat.team}`}
        className={`group relative flex flex-col items-center justify-end pt-5 pb-1.5 px-1 rounded-2xl transition-all cursor-pointer select-none ${
          isNewlyJoined
            ? 'z-30 ring-4 ring-rose-400 bg-gradient-to-b from-rose-500/45 via-amber-400/35 to-fuchsia-600/40 scale-110 shadow-[0_0_28px_rgba(244,63,94,0.9)]'
            : isMe
            ? 'ring-2 ring-yellow-300 bg-yellow-400/20 scale-[1.03]'
            : isJoined
            ? 'hover:scale-[1.04] hover:bg-amber-900/15'
            : 'opacity-70 hover:opacity-100 hover:bg-amber-900/10'
        }`}
      >
        {isNewlyJoined && (
          <>
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-rose-300/80 animate-ping"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -inset-1.5 rounded-3xl border border-amber-300/75 animate-pulse"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -inset-4 z-40 overflow-visible"
              aria-hidden="true"
            >
              <span className="absolute -top-3 left-0 text-base sm:text-lg animate-bounce drop-shadow-[0_2px_6px_rgba(244,63,94,0.9)]">
                🎆
              </span>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg sm:text-xl animate-bounce drop-shadow-[0_2px_8px_rgba(244,63,94,1)]">
                ❤️
              </span>
              <span className="absolute -top-3 right-0 text-base sm:text-lg animate-bounce drop-shadow-[0_2px_6px_rgba(251,191,36,0.95)]">
                🎇
              </span>
            </div>
            <div className="absolute -top-3.5 inset-x-0 z-40 flex justify-center pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 text-white text-[9px] font-black shadow-[0_0_12px_rgba(244,63,94,0.95)] border border-yellow-200 animate-bounce whitespace-nowrap">
                🎆❤️ TƯƠNG TÁC • M#{seat.stationNumber}
              </span>
            </div>
          </>
        )}

        {quickAnswer && (
          <div
            className={`absolute -top-1 right-1 z-20 w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center shadow-md border ${
              waitingState.showQuizAnswer
                ? activeArenaQuiz?.options?.find((o) => o.letter === quickAnswer)?.isCorrect
                  ? 'bg-emerald-500 text-white border-emerald-200 animate-bounce'
                  : 'bg-rose-600 text-white border-rose-200'
                : 'bg-amber-400 text-slate-950 border-white animate-pulse'
            }`}
          >
            {quickAnswer}
          </div>
        )}

        {honorMeta && (
          <div
            className={`absolute -top-1 left-0.5 z-20 px-1.5 py-0.5 rounded-full bg-gradient-to-r ${honorMeta.badgeBg} text-white text-[9px] font-black shadow-md border border-white/60 flex items-center gap-0.5`}
            title={honorMeta.label}
          >
            <span>{honorMeta.icon}</span>
            <span className="hidden xl:inline">{honorMeta.label}</span>
          </div>
        )}

        <div
          className={`z-20 mb-1 px-2 py-0.5 rounded-full max-w-[116px] truncate text-[10px] sm:text-[11px] font-extrabold tracking-tight shadow-sm border transition-all ${
            isNewlyJoined
              ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white border-2 border-yellow-200 font-black shadow-[0_0_14px_rgba(244,63,94,0.95)] scale-105'
              : isMe
              ? 'bg-amber-400 text-slate-950 border-white font-black'
              : isJoined
              ? 'bg-slate-950/80 text-white border-white/25'
              : 'bg-slate-900/45 text-amber-100/90 border-amber-200/20 border-dashed'
          }`}
          title={`${seat.studentName} (Máy #${seat.stationNumber})`}
        >
          {isNewlyJoined ? `❤️ ${seat.shortName} 🎆` : seat.shortName}
        </div>

        <div className="relative w-16 sm:w-20 h-16 sm:h-[70px] flex flex-col items-center justify-end">
          <div
            className={`w-15 sm:w-18 h-7 sm:h-8 rounded-t-lg border-b-4 shadow-md flex items-center justify-center relative ${
              isJoined
                ? 'bg-gradient-to-b from-[#E5A967] to-[#C88742] border-[#8C5620]'
                : 'bg-gradient-to-b from-[#C68B50]/60 to-[#A66E38]/60 border-[#73461A]/50 border-dashed'
            }`}
          >
            {isJoined ? (
              <>
                <div className="w-8 sm:w-9 h-4.5 rounded-xs bg-amber-50 border border-slate-300 shadow-2xs flex overflow-hidden">
                  <div className="w-1/2 border-r border-slate-300 p-0.5 flex flex-col gap-0.5">
                    <div className="w-full h-0.5 bg-slate-400/60" />
                    <div className="w-3/4 h-0.5 bg-slate-400/60" />
                  </div>
                  <div className="w-1/2 p-0.5 flex flex-col gap-0.5">
                    <div className="w-full h-0.5 bg-sky-500/60" />
                    <div className="w-2/3 h-0.5 bg-sky-500/60" />
                  </div>
                </div>
                <span className="absolute -bottom-1 right-0.5 px-1 rounded-xs bg-amber-950/85 text-amber-200 text-[8px] font-black leading-tight border border-amber-400/30">
                  #{seat.stationNumber}
                </span>
              </>
            ) : (
              <span className="text-[9px] font-bold text-amber-950/70">
                M#{seat.stationNumber}
              </span>
            )}
          </div>

          {isJoined ? (
            <div className="relative -mt-3.5 z-10 flex flex-col items-center">
              <div className="relative w-8 sm:w-9 h-7 sm:h-8 rounded-full bg-gradient-to-b from-[#3B2314] to-[#24140B] border border-[#5A3822] shadow-md flex items-center justify-center">
                {seat.isFemale && (
                  <>
                    <div className="absolute -left-1.5 bottom-0.5 w-2.5 h-3.5 rounded-full bg-[#24140B] border border-[#4A2C18] rotate-12" />
                    <div className="absolute -right-1.5 bottom-0.5 w-2.5 h-3.5 rounded-full bg-[#24140B] border border-[#4A2C18] -rotate-12" />
                    <div className="absolute -left-1 bottom-2.5 w-1.5 h-1 rounded-full bg-rose-400" />
                    <div className="absolute -right-1 bottom-2.5 w-1.5 h-1 rounded-full bg-rose-400" />
                  </>
                )}
                <div className="w-4 h-1.5 rounded-full bg-amber-200/20 -mt-2" />
              </div>

              <div className="w-10 sm:w-11 h-3.5 -mt-1 rounded-t-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center overflow-hidden">
                <div className="w-6 h-1.5 bg-rose-600 rounded-b-full shadow-2xs" />
              </div>
            </div>
          ) : (
            <div className="relative -mt-1 z-10 flex flex-col items-center">
              <div className="w-7 h-5 rounded-full border border-dashed border-amber-100/50 bg-amber-950/20 flex items-center justify-center text-[9px] text-amber-100/80 font-bold">
                Chờ
              </div>
            </div>
          )}

          <div
            className={`w-11 sm:w-12 h-2.5 -mt-0.5 rounded-b-md border-t-2 shadow-sm ${
              isJoined
                ? 'bg-[#B97735] border-[#8C5620]'
                : 'bg-[#9C632B]/50 border-[#73461A]/40'
            }`}
          />
        </div>
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl overflow-hidden border-2 border-[#7C4D25] shadow-2xl bg-[#B87638] text-white flex flex-col select-none"
    >
      {/* DEDICATED 2D FIREWORKS CANVAS OVERLAY LAUNCHING FROM STUDENT TABLE LOCATIONS */}
      <canvas
        ref={fireworksCanvasRef}
        data-testid="waiting-room-fireworks-canvas"
        className="pointer-events-none absolute inset-0 w-full h-full z-40"
        aria-hidden="true"
      />

      {/* FLOATING HEARTS & FIREWORKS ANIMATION OVERLAY */}
      {floatingParticles.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
          aria-hidden="true"
        >
          {floatingParticles.map((pt) => (
            <div
              key={pt.id}
              className="absolute animate-bounce transition-all"
              style={{
                left: `${pt.leftPercent}%`,
                top: `${pt.topPercent}%`,
                animationDelay: `${pt.delayMs}ms`,
                animationDuration: `${pt.durationMs}ms`,
                transform: `translate(-50%, -50%) scale(${pt.scale})`,
              }}
            >
              <div className="flex flex-col items-center gap-1 -translate-y-10 opacity-95 drop-shadow-[0_4px_12px_rgba(244,63,94,0.85)]">
                <span className="text-xl sm:text-2xl">{pt.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW STUDENT JOIN BANNER */}
      {joinBannerAlert && (
        <div className="px-5 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg border-b border-white/30 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎆❤️</span>
            <span>
              TƯƠNG TÁC TRỰC TIẾP: <strong>{joinBannerAlert.name}</strong> (Máy #{joinBannerAlert.stationNumber} • Tổ {joinBannerAlert.team}) — Lớp {classId}! 💖✨
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 text-[11px] font-black shrink-0">
            TỔ {joinBannerAlert.team} 🎉
          </span>
        </div>
      )}

      {/* GREEN CHALKBOARD SECTION — BẢNG TRÌNH CHIẾU SLIDE & TOÀN BỘ HOẠT ĐỘNG TRỰC QUAN ĐỒNG BỘ GV - HS */}
      <div className="relative bg-gradient-to-b from-[#1B4D3E] via-[#174235] to-[#12352A] border-b-[10px] border-[#8C5622] px-4 sm:px-7 pt-4 pb-6 shadow-inner">
        {/* =========================================================================================
            MAIN CHALKBOARD STAGE CONTENT (REPLACES OLD WARMUP QUESTION WITH SLIDES & ALL ACTIVITIES)
           ========================================================================================= */}
        <div
          className={`w-full rounded-2xl bg-[#113328]/90 border-2 border-[#C5B358]/75 p-3 sm:p-4 shadow-xl flex flex-col justify-between gap-3 transition-all ${
            isBoardExpanded ? 'min-h-[540px]' : 'min-h-[360px] sm:min-h-[410px]'
          }`}
        >
          {/* MODE 1: SLIDE BÀI GIẢNG (CHÈN VÀO ĐÚNG VỊ TRÍ CÂU HỎI KHỞI ĐỘNG TRÊN BẢNG) */}
          {resolvedBoardMode === 'slide' && (
            <div className="flex flex-col h-full justify-between gap-3 flex-1">
              {/* Slide Top Sub-bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black shrink-0">
                    📑 SLIDE {safeSlideIndex + 1}/{slides.length}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {activeSlide?.title || periodSpec.lessonTitle}
                  </span>
                  <span className="hidden lg:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                    ⚡ Hybrid 3 Tầng • Độ nét gốc ({activeSlide?.width || 1920}×{activeSlide?.height || 1080})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setSlideZoomPercent((z) => (z === 100 ? 125 : z === 125 ? 150 : 100))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 text-[11px] font-bold cursor-pointer border border-white/15"
                  >
                    🔍 Zoom {slideZoomPercent}%
                  </button>

                  {role === 'teacher' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStepSlide(-1)}
                        disabled={safeSlideIndex <= 0}
                        className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white text-xs font-extrabold cursor-pointer border border-white/25"
                      >
                        ◀ Trước
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepSlide(1)}
                        disabled={safeSlideIndex >= slides.length - 1}
                        className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 text-xs font-black cursor-pointer"
                      >
                        Tiếp ▶
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfigModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer border border-emerald-300/40"
                      >
                        📂 Đổi PDF / Ảnh Slide
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* High-Fidelity Slide Image Viewport */}
              <div
                className={`relative w-full flex-1 rounded-xl bg-slate-950/90 border border-white/20 overflow-auto flex items-center justify-center ${
                  isBoardExpanded ? 'max-h-[480px]' : 'max-h-[300px] sm:max-h-[340px]'
                }`}
              >
                {activeSlide ? (
                  <img
                    src={activeSlide.imageUrl}
                    alt={activeSlide.title}
                    style={{
                      width: slideZoomPercent === 100 ? '100%' : `${slideZoomPercent}%`,
                      height: slideZoomPercent === 100 ? '100%' : 'auto',
                    }}
                    className="object-contain select-none transition-all duration-200"
                  />
                ) : (
                  <div className="p-8 text-center text-amber-200 text-sm font-bold">
                    Chưa có trang Slide nào được nạp.
                  </div>
                )}
              </div>

              {/* Bottom Slide Page Strip */}
              <div className="flex items-center justify-between gap-2 pt-1 overflow-x-auto">
                <div className="flex items-center gap-1.5">
                  {slides.map((sl, idx) => (
                    <button
                      key={sl.slideNumber}
                      type="button"
                      onClick={() => {
                        if (role === 'teacher') handleGoToSlide(idx);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                        idx === safeSlideIndex
                          ? 'bg-amber-400 text-slate-950 shadow-sm scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      } ${role === 'teacher' ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      Trang {idx + 1}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-emerald-200/90 font-bold shrink-0">
                  {role === 'teacher'
                    ? '💡 Mẹo: Nhấn phím ⬅️ / ➡️ để chuyển trang Slide đồng bộ tức thì sang máy Học sinh'
                    : `📡 Đang xem trực tiếp Slide Trang ${safeSlideIndex + 1}/${slides.length} cùng Giáo viên`}
                </span>
              </div>
            </div>
          )}

          {/* MODE 2: HOẠT ĐỘNG 1 — KHỞI ĐỘNG (CHỈ CÓ VIDEO, ẢNH, NHÚNG MÃ HTML MÔ PHỎNG CHUYỂN ĐỘNG) */}
          {resolvedBoardMode === 'hd1' && (
            <div className="flex flex-col h-full justify-between gap-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black">
                    🎬 HOẠT ĐỘNG 1: KHỞI ĐỘNG TRỰC QUAN
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-white">
                    {periodSpec.lessonTitle}
                  </span>
                </div>

                {/* 3 Visual Media Sub-tabs: HTML Motion Simulation, Video, Image */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'html-sim' as const, label: '⚡ Mô phỏng HTML chuyển động' },
                    { id: 'video' as const, label: '🎬 Video khởi động' },
                    { id: 'image' as const, label: '🖼️ Ảnh trực quan' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectWarmupTab(tab.id)}
                      className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition-all ${
                        activeWarmupTab === tab.id
                          ? 'bg-emerald-400 text-slate-950 shadow-sm'
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {role === 'teacher' && (
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(true)}
                      className="px-2.5 py-1 rounded-full bg-amber-400/25 hover:bg-amber-400/40 border border-amber-300/50 text-amber-200 text-[11px] font-bold cursor-pointer"
                    >
                      ✏️ Cấu hình Video/Ảnh/HTML
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Media Stage (Only Video, Image, or Embedded HTML Motion Simulation) */}
              <div
                className={`relative w-full flex-1 rounded-xl bg-slate-950 border border-white/20 overflow-hidden flex items-center justify-center ${
                  isBoardExpanded ? 'min-h-[450px]' : 'h-[300px] sm:h-[330px]'
                }`}
              >
                {activeWarmupTab === 'video' ? (
                  hybridDeck.warmupConfig.videoUrl.includes('youtube.com') ||
                  hybridDeck.warmupConfig.videoUrl.includes('youtu.be') ? (
                    <iframe
                      title="Warmup Video"
                      src={hybridDeck.warmupConfig.videoUrl
                        .replace('watch?v=', 'embed/')
                        .replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen"
                    />
                  ) : (
                    <video
                      src={hybridDeck.warmupConfig.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )
                ) : activeWarmupTab === 'image' ? (
                  <img
                    src={hybridDeck.warmupConfig.imageUrl}
                    alt={hybridDeck.warmupConfig.imageCaption}
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <iframe
                    title="Interactive HTML5 Motion Simulation"
                    srcDoc={hybridDeck.warmupConfig.htmlSimulationCode}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0"
                  />
                )}
              </div>
            </div>
          )}

          {/* MODE 3: HOẠT ĐỘNG 2 — KHÁM PHÁ (PHIẾU HỌC TẬP TƯƠNG TÁC TRỰC QUAN ĐỒNG BỘ TRÊN BẢNG) */}
          {resolvedBoardMode === 'hd2' && (
            <div className="flex flex-col h-full justify-between gap-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950 text-[11px] font-black">
                    🔍 HOẠT ĐỘNG 2: KHÁM PHÁ (PHIẾU HỌC TẬP SỐ)
                  </span>
                  <span className="text-xs font-bold text-emerald-200">
                    {blueprint.stage2.worksheetTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'drag' as const, label: '1. Phân loại' },
                    { id: 'fill' as const, label: '2. Điền khuyết' },
                    { id: 'match' as const, label: '3. Ghép cột' },
                    { id: 'short' as const, label: '4. Tự luận ngắn' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setHd2SubTab(st.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-black cursor-pointer ${
                        hd2SubTab === st.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}

                  {role === 'teacher' && (
                    <button
                      type="button"
                      onClick={() => setHd2RevealAnswers((prev) => !prev)}
                      className="px-3 py-1 rounded-full bg-emerald-500/30 hover:bg-emerald-500/45 border border-emerald-300/50 text-emerald-100 text-xs font-black cursor-pointer"
                    >
                      {hd2RevealAnswers ? '🙈 Ẩn đáp án mẫu' : '✨ Hiện đáp án mẫu'}
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Worksheet Body inside Chalkboard */}
              <div className="flex-1 bg-black/25 rounded-xl p-3.5 border border-white/15 overflow-y-auto max-h-[280px]">
                {hd2SubTab === 'drag' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {(blueprint.stage2.dragItems || []).map((item) => {
                      const picked = hd2DragAssignments[item.id];
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-white/10 border border-white/20 flex flex-col justify-between gap-2"
                        >
                          <span className="text-xs sm:text-sm font-bold text-white">
                            • {item.text}
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setHd2DragAssignments((p) => ({ ...p, [item.id]: 'data' }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                                  picked === 'data'
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-white/15 text-white hover:bg-white/25'
                                }`}
                              >
                                {blueprint.stage2.bucketA}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setHd2DragAssignments((p) => ({ ...p, [item.id]: 'info' }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                                  picked === 'info'
                                    ? 'bg-sky-400 text-slate-950'
                                    : 'bg-white/15 text-white hover:bg-white/25'
                                }`}
                              >
                                {blueprint.stage2.bucketB}
                              </button>
                            </div>
                            {hd2RevealAnswers && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                                ✓ Đúng: {item.correctBox === 'data' ? 'Hộp A' : 'Hộp B'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {hd2SubTab === 'fill' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex flex-col gap-2">
                      <label className="text-xs font-black text-amber-300">
                        1. {blueprint.stage2.blank1Label}:
                      </label>
                      <input
                        type="text"
                        value={hd2Blank1}
                        onChange={(e) => setHd2Blank1(e.target.value)}
                        placeholder="Nhập cụm từ còn thiếu..."
                        className="px-3 py-2 rounded-lg bg-slate-950/70 border border-white/30 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-300"
                      />
                      {hd2RevealAnswers && (
                        <span className="text-xs font-black text-emerald-300">
                          ✓ Đáp án chuẩn: {blueprint.stage2.blank1Answer}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex flex-col gap-2">
                      <label className="text-xs font-black text-amber-300">
                        2. {blueprint.stage2.blank2Label}:
                      </label>
                      <input
                        type="text"
                        value={hd2Blank2}
                        onChange={(e) => setHd2Blank2(e.target.value)}
                        placeholder="Nhập cụm từ còn thiếu..."
                        className="px-3 py-2 rounded-lg bg-slate-950/70 border border-white/30 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-amber-300"
                      />
                      {hd2RevealAnswers && (
                        <span className="text-xs font-black text-emerald-300">
                          ✓ Đáp án chuẩn: {blueprint.stage2.blank2Answer}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {hd2SubTab === 'match' && (
                  <div className="flex flex-col gap-2.5">
                    {(blueprint.stage2.matchingPairs || []).map((pair) => (
                      <div
                        key={pair.id}
                        className="p-3 rounded-xl bg-white/10 border border-white/20 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                      >
                        <div className="md:col-span-5 text-xs font-black text-amber-200">
                          🔗 {pair.left}
                        </div>
                        <div className="md:col-span-7">
                          <select
                            value={hd2MatchSelections[pair.id] || ''}
                            onChange={(e) =>
                              setHd2MatchSelections((p) => ({ ...p, [pair.id]: e.target.value }))
                            }
                            aria-label={`Chọn nội dung ghép cho ${pair.left}`}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/30 text-white text-xs font-bold"
                          >
                            <option value="">-- Chọn mệnh đề tương ứng --</option>
                            {(blueprint.stage2.matchingPairs || []).map((opt) => (
                              <option key={opt.id} value={opt.right}>
                                {opt.right}
                              </option>
                            ))}
                          </select>
                          {hd2RevealAnswers && (
                            <div className="text-[11px] font-bold text-emerald-300 mt-1">
                              ✓ Ghép đúng: {pair.right}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {hd2SubTab === 'short' && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs sm:text-sm font-extrabold text-amber-200">
                      💡 Câu hỏi khám phá: {blueprint.stage2.textImagePrompt}
                    </p>
                    <textarea
                      rows={3}
                      value={hd2ShortAnswer}
                      onChange={(e) => setHd2ShortAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời của em ngay trên Bảng lớp..."
                      className="w-full p-3 rounded-xl bg-slate-950/75 border border-white/30 text-white text-xs font-medium outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-bold text-emerald-200">
                  {hd2SubmittedScore !== null
                    ? `🌟 Điểm Phiếu học tập HĐ 2: ${hd2SubmittedScore}/10 điểm`
                    : '📌 Hoàn thành 4 mục khám phá và nhấn Nộp bài lên Bảng lớp'}
                </span>
                <button
                  type="button"
                  onClick={handleSubmitStage2OnBoard}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                >
                  ✅ Nộp Phiếu Học Tập HĐ 2 Lên Bảng (+3đ Tổ)
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: HOẠT ĐỘNG 3 — LUYỆN TẬP (ĐẤU TRƯỜNG TỐC ĐỘ 25S TRỰC QUAN TRÊN BẢNG) */}
          {resolvedBoardMode === 'hd3' && activeArenaQuiz && (
            <div className="flex flex-col h-full justify-between gap-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-400 text-slate-950 text-[11px] font-black">
                    ⚡ HĐ 3: ĐẤU TRƯỜNG 25S • CÂU {safeQuizIdx + 1}/{arenaQuizzes.length}
                  </span>
                  <span className="text-xs text-emerald-200 font-bold">
                    Đã trả lời: {answeredCount}/{allSeats.length} bạn
                  </span>
                </div>

                {role === 'teacher' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isQuizTimerRunning) {
                          setIsQuizTimerRunning(false);
                        } else {
                          setQuizCountdownSec(25);
                          setIsQuizTimerRunning(true);
                          updateWaitingRoom((wr) => ({
                            ...wr,
                            isQuizLocked: false,
                            showQuizAnswer: false,
                          }));
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/50 text-amber-200 text-xs font-bold cursor-pointer"
                    >
                      {isQuizTimerRunning ? `⏳ ${quizCountdownSec}s` : '⏱️ Đếm ngược 25s'}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleRevealAnswer}
                      className="px-3 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-300/50 text-emerald-200 text-xs font-bold cursor-pointer"
                    >
                      {waitingState.showQuizAnswer ? '🙈 Ẩn đáp án' : '✅ Chốt đáp án'}
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold cursor-pointer"
                    >
                      Câu tiếp →
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-sm sm:text-lg font-black text-white leading-snug">
                {activeArenaQuiz.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(activeArenaQuiz.options || []).map((opt) => {
                  const myAnswer =
                    currentStudent && waitingState.studentQuickAnswers?.[currentStudent.id];
                  const isSelectedByMe = myAnswer === opt.letter;
                  const pickCount = Object.values(waitingState.studentQuickAnswers || {}).filter(
                    (v) => v === opt.letter
                  ).length;
                  const isRevealedCorrect = waitingState.showQuizAnswer && opt.isCorrect;

                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => handleSelectArenaOption(opt.letter)}
                      className={`text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isRevealedCorrect
                          ? 'bg-emerald-700/80 border-emerald-300 ring-2 ring-emerald-300/60 shadow-lg'
                          : isSelectedByMe
                          ? 'bg-amber-500/35 border-amber-300 ring-2 ring-amber-300/50'
                          : 'bg-[#215846]/90 hover:bg-[#276652] border-[#C5B358]/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                          {opt.letter}. {opt.text}
                        </span>
                        {isRevealedCorrect && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black shrink-0">
                            ✓ ĐÚNG
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-amber-200/90 pt-1 border-t border-white/10">
                        <span>
                          {isSelectedByMe ? '⭐ Em đã chọn' : 'Bấm để chọn đáp án'}
                        </span>
                        <span className="font-bold tabular-nums">{pickCount} bạn chọn</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 5: HOẠT ĐỘNG 3 (THỰC HÀNH PHÒNG MÁY TRÊN BẢNG) */}
          {resolvedBoardMode === 'hd3-practice' && (
            <div className="flex flex-col h-full justify-between gap-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-400 text-slate-950 text-[11px] font-black">
                    💻 HOẠT ĐỘNG 3: THỰC HÀNH PHÒNG MÁY &amp; NỘP SẢN PHẨM SỐ
                  </span>
                  <span className="text-xs font-bold text-emerald-200">
                    {periodSpec.lessonTitle}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-start">
                <div className="lg:col-span-6 p-3.5 rounded-xl bg-black/25 border border-white/15 flex flex-col gap-2">
                  <span className="text-xs font-black text-amber-300 uppercase">
                    📋 Nhiệm vụ Thực hành trên máy tính:
                  </span>
                  <p className="text-xs text-white/95 leading-relaxed">
                    • <strong>Yêu cầu cần đạt:</strong> {periodSpec.yccd}
                  </p>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    • <strong>Năng lực số (CV 3456):</strong> {periodSpec.digitalCompetency || periodSpec.nlsAction}
                  </p>
                  <p className="text-xs text-sky-200 leading-relaxed">
                    • <strong>Tích hợp AI:</strong> {periodSpec.aiCompetency}
                  </p>
                </div>

                <div className="lg:col-span-6 p-3.5 rounded-xl bg-black/25 border border-white/15 flex flex-col gap-2.5">
                  <span className="text-xs font-black text-amber-300 uppercase">
                    📤 Nộp kết quả / Đường dẫn sản phẩm Thực hành lên Bảng lớp:
                  </span>
                  <textarea
                    rows={3}
                    value={practiceNoteInput}
                    onChange={(e) => setPracticeNoteInput(e.target.value)}
                    placeholder="Nhập mô tả kết quả thực hành, tên tệp hoặc đường dẫn sản phẩm của em..."
                    className="w-full p-2.5 rounded-xl bg-slate-950/75 border border-white/30 text-white text-xs outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-300 font-bold">
                      {practiceSubmitted ? '✓ Đã nộp sản phẩm thực hành lên bảng!' : 'Cộng +3đ thi đua cho Tổ khi hoàn thành'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitPracticeOnBoard}
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                    >
                      📤 Nộp bài Thực hành lên Bảng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 6: HOẠT ĐỘNG 4 — VẬN DỤNG (GIẢI QUYẾT TÌNH HUỐNG THỰC TIỄN TRÊN BẢNG) */}
          {resolvedBoardMode === 'hd4' && (
            <div className="flex flex-col h-full justify-between gap-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-black">
                    🚀 HOẠT ĐỘNG 4: VẬN DỤNG VÀO CUỘC SỐNG SỐ
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    {periodSpec.topic}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/25 border border-white/15 flex flex-col gap-2.5 flex-1 justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-amber-300">
                    🌟 Tình huống Vận dụng thực tiễn ({periodSpec.lessonTitle}):
                  </span>
                  <p className="text-xs sm:text-sm text-white leading-relaxed">
                    Em hãy vận dụng kiến thức <strong>{periodSpec.yccd}</strong> kết hợp cùng{' '}
                    <strong>{periodSpec.aiCompetency}</strong> để đề xuất giải pháp thực tế cho tình huống trong học tập và đời sống hằng ngày.
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={hd4SolutionInput}
                  onChange={(e) => setHd4SolutionInput(e.target.value)}
                  placeholder="Nhập giải pháp vận dụng sáng tạo của em để trình bày lên Bảng lớp..."
                  className="w-full p-3 rounded-xl bg-slate-950/75 border border-white/30 text-white text-xs outline-none focus:ring-2 focus:ring-emerald-400"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-bold">
                    {hd4Submitted
                      ? '🎉 Đã trình bày bài Vận dụng lên Bảng lớp!'
                      : '💡 Câu trả lời của em sẽ hiển thị trực tiếp trên luồng tương tác của lớp'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmitStage4OnBoard}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    🚀 Gửi Bài Vận Dụng Lên Bảng (+3đ Tổ)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chalk Tray Details at Bottom of Board */}
        <div className="absolute bottom-1 right-8 flex items-center gap-3">
          <div className="w-8 h-1.5 rounded-full bg-white/90 shadow-xs" />
          <div className="w-10 h-1.5 rounded-full bg-amber-200/90 shadow-xs" />
          <div className="w-12 h-2.5 rounded-xs bg-amber-400 border border-amber-600 shadow-xs" />
        </div>
      </div>

      {/* 3. WOODEN CLASSROOM FLOOR WITH TEACHER AVATAR & 2 SYMMETRIC DESK WINGS (TỔ 1 & TỔ 2) */}
      <div
        className="relative px-3 sm:px-6 pt-4 pb-6 min-h-[520px] flex flex-col justify-between"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(120,65,20,0.14) 0px, rgba(120,65,20,0.14) 2px, transparent 2px, transparent 48px), linear-gradient(180deg, #D59B5A 0%, #C18242 50%, #B17234 100%)',
        }}
      >
        {/* Top Classroom Aisle Header: Teacher Character + Live Stage Status Pill */}
        <div className="relative flex flex-col items-center justify-center mb-2">
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-300/30 text-amber-100 text-xs font-bold">
              🪑 Không gian Lớp học ảo Lớp {classId}: {joinedCount}/{allSeats.length} học sinh tại bàn
            </div>

            <div className="px-3.5 py-1 rounded-full bg-[#244432]/90 border border-emerald-300/40 text-white text-xs font-extrabold shadow-md">
              {resolvedBoardMode === 'slide'
                ? `📑 Đang trình chiếu Slide Bài Giảng (Trang ${safeSlideIndex + 1}/${slides.length})`
                : resolvedBoardMode === 'hd1'
                ? `🎬 Đang hoạt động Khởi động (${activeWarmupTab === 'html-sim' ? 'Mô phỏng HTML5' : activeWarmupTab === 'video' ? 'Video' : 'Ảnh trực quan'})`
                : resolvedBoardMode === 'hd2'
                ? '🔍 Đang thực hiện Hoạt động 2: Khám phá trên Bảng lớp'
                : resolvedBoardMode === 'hd3'
                ? `⚡ Đang thi đấu HĐ 3: Luyện tập (${answeredCount} bạn đã chọn đáp án)`
                : resolvedBoardMode === 'hd3-practice'
                ? '💻 Đang thực hành Phòng máy (HĐ 3) & Nộp sản phẩm số'
                : '🚀 Đang thực hiện Hoạt động 4: Vận dụng thực tiễn'}
            </div>
          </div>

          {/* Illustrated Teacher Standing at Front Center Aisle */}
          <div className="relative flex flex-col items-center my-1">
            <div className="relative w-20 h-24 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#4A2A18] border-2 border-[#2D180C] shadow-md flex flex-col items-center justify-center relative z-10">
                <div className="w-9 h-8 rounded-full bg-[#FAD6B8] flex flex-col items-center justify-center pt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2 rounded-full border border-amber-900 bg-white/40" />
                    <div className="w-3 h-2 rounded-full border border-amber-900 bg-white/40" />
                  </div>
                  <div className="w-2.5 h-1 border-b-2 border-rose-600 rounded-full mt-0.5" />
                </div>
              </div>
              <div className="w-11 h-12 -mt-1.5 rounded-t-2xl bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-300 border border-amber-600 shadow-md flex items-center justify-center relative">
                <div className="w-4 h-5 rounded-xs bg-emerald-700 border border-emerald-900 -ml-2 shadow-2xs" />
                <div className="absolute -right-5 -top-4 w-8 h-0.5 bg-amber-900 rotate-[-35deg] origin-left" />
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/75 text-amber-200 text-[10px] font-bold border border-amber-400/30 -mt-1">
              GV Chủ trì • Lớp {classId}
            </span>
          </div>
        </div>

        {/* MAIN 2-WING CLASSROOM DESK GRID (LEFT: TỔ 1, CENTER AISLE, RIGHT: TỔ 2) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* LEFT WING: TỔ 1 */}
          <div className="lg:col-span-5 bg-amber-950/10 rounded-3xl p-3 border border-amber-900/20 flex flex-col items-center">
            <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-3 w-full justify-items-center">
              {team1Seats.map((seat) => renderStudentDeskCard(seat))}
            </div>
            <div className="mt-4 px-5 py-1 rounded-full bg-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-md border border-rose-300">
              TỔ 1 ({team1Seats.filter((s) => joinedSet.has(s.studentId)).length}/{team1Seats.length} HS)
            </div>
          </div>

          {/* CENTER AISLE (Bảng Danh Hiệu Lớp) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-start gap-2 self-stretch py-1">
            <div className="w-full bg-slate-950/80 backdrop-blur-md p-2.5 rounded-2xl border border-amber-300/30 shadow-xl flex flex-row lg:flex-col gap-1.5 flex-wrap justify-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 px-1 text-center w-full">
                🏆 Danh hiệu lớp
              </span>
              {HONOR_ROLE_META.map((item) => {
                const isSelected = selectedRoleBrush === item.id;
                const assignedStudentId = Object.entries(waitingState.studentRoles || {}).find(
                  ([, r]) => r === item.id
                )?.[0];
                const assignedSeat = allSeats.find((s) => s.studentId === assignedStudentId);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (role !== 'teacher') {
                        onShowToast(
                          `${item.icon} ${item.label}: ${
                            assignedSeat ? assignedSeat.studentName : 'Đang chờ Thầy/Cô bầu chọn'
                          }`
                        );
                        return;
                      }
                      setSelectedRoleBrush((prev) => (prev === item.id ? null : item.id));
                      onShowToast(
                        `👉 Đã chọn huy hiệu "${item.icon} ${item.label}" — Hãy bấm vào 1 học sinh trên bàn để trao danh hiệu!`
                      );
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-300 scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="truncate text-[11px]">{item.label}</span>
                      {assignedSeat && (
                        <span
                          className={`text-[9px] truncate max-w-[95px] ${
                            isSelected ? 'text-slate-800' : 'text-amber-300'
                          }`}
                        >
                          {assignedSeat.shortName}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="hidden lg:block flex-1 w-1 rounded-full bg-amber-900/25 my-1" />
          </div>

          {/* RIGHT WING: TỔ 2 */}
          <div className="lg:col-span-5 bg-amber-950/10 rounded-3xl p-3 border border-amber-900/20 flex flex-col items-center">
            <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-3 w-full justify-items-center">
              {team2Seats.map((seat) => renderStudentDeskCard(seat))}
            </div>
            <div className="mt-4 px-5 py-1 rounded-full bg-sky-600 text-white font-black text-xs tracking-wider uppercase shadow-md border border-sky-300">
              TỔ 2 ({team2Seats.filter((s) => joinedSet.has(s.studentId)).length}/{team2Seats.length} HS)
            </div>
          </div>
        </div>

        {/* 4. BOTTOM LIVE STREAM & INTERACTIVE CHAT BAR */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-6 bg-slate-950/65 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {(waitingState.feedMessages || []).slice(0, 5).map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-2 text-xs text-white/95 py-0.5"
              >
                <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs shrink-0">
                  {msg.type === 'join'
                    ? '👋'
                    : msg.type === 'answer'
                    ? '🎯'
                    : msg.type === 'honor'
                    ? '🌹'
                    : '💬'}
                </span>
                <span className="font-medium truncate">{msg.text}</span>
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                '👋 Em chào Thầy ạ!',
                '🔥 Quyết tâm 10 điểm Tin học!',
                '🙋 Em đã làm xong trên bảng!',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSendQuickChat(undefined, preset)}
                  className="px-2.5 py-1 rounded-full bg-amber-950/65 hover:bg-amber-950/90 text-amber-100 border border-amber-300/30 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={handleManualHeartFireworkReaction}
                className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white border border-pink-300/40 text-[11px] font-black cursor-pointer transition-colors"
              >
                ❤️🎆 Thả tim &amp; Pháo hoa
              </button>
            </div>

            <form onSubmit={(e) => handleSendQuickChat(e)} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập ý kiến hoặc câu trả lời vào Phòng Live Lớp học..."
                aria-label="Nhập ý kiến vào Phòng Live Lớp học"
                className="flex-1 px-4 py-2.5 rounded-full bg-slate-950/65 border border-white/25 text-white placeholder:text-amber-100/60 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs cursor-pointer shadow-md shrink-0"
              >
                Gửi lên lớp 🚀
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL CẤU HÌNH SLIDE & KHỞI ĐỘNG (HYBRID 3 TẦNG) */}
      <PreLiveSlideConfigModal
        isOpen={isConfigModalOpen}
        initialGrade={grade}
        initialPeriod={period}
        liveSession={liveSession}
        onUpdateLiveSession={onUpdateLiveSession}
        onClose={() => setIsConfigModalOpen(false)}
        onShowToast={onShowToast}
        onDeckSaved={(saved) => setHybridDeck(saved)}
      />
    </div>
  );
};
