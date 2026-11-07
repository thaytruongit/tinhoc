import React, { useState, useEffect, useMemo, useRef } from 'react';
import type {
  ClassroomHonorRole,
  CurriculumPeriodSpec,
  LiveClassroomSession,
  StudentRosterItem,
  WaitingRoomState,
} from '../data/mockCurriculumData';
import {
  buildDesignatedClassDeskRoster,
  createInitialWaitingRoomState,
  registerStudentJoinWaitingRoom,
  admitAllClassStudentsToWaitingRoom,
  submitWaitingRoomQuickAnswer,
  assignWaitingRoomHonorRole,
  appendWaitingRoomChatMessage,
  getWaitingRoomChalkboardQuizzes,
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
  onAwardXp,
  onShowToast,
  defaultCollapsedAfterReady = false,
}) => {
  const lessonKey = `k${grade}-tiet-${period}`;

  const { allSeats, team1Seats, team2Seats } = useMemo(
    () => buildDesignatedClassDeskRoster(students, classId, grade, 18),
    [students, classId, grade]
  );

  // Precomputed 2.5D classroom coordinates (x, y) for every station (Máy #01 - Máy #42)
  const station25DCoordinateMap = useMemo(
    () => buildAllStations25DCoordinateMap({ totalDesks: Math.max(18, allSeats.length) }),
    [allSeats.length]
  );

  const quizzes = useMemo(
    () => getWaitingRoomChalkboardQuizzes(grade, period, periodSpec?.lessonTitle),
    [grade, period, periodSpec?.lessonTitle]
  );

  const fallbackWaitingState = useMemo(
    () =>
      createInitialWaitingRoomState({
        classId,
        grade,
        period,
        students,
        preJoinRealStudents: true,
      }),
    [classId, grade, period, students]
  );

  const waitingState: WaitingRoomState =
    liveSession?.waitingRoomByLesson?.[lessonKey] &&
    liveSession.waitingRoomByLesson[lessonKey].classId === classId
      ? liveSession.waitingRoomByLesson[lessonKey]
      : fallbackWaitingState;

  const isReadyForLearning = Boolean(
    waitingState.isReadyForLearning ||
      (liveSession?.activeLiveView && liveSession.activeLiveView !== 'waiting')
  );

  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    Boolean(defaultCollapsedAfterReady && isReadyForLearning)
  );
  const [selectedRoleBrush, setSelectedRoleBrush] = useState<ClassroomHonorRole | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [quizCountdownSec, setQuizCountdownSec] = useState<number>(20);
  const [isQuizTimerRunning, setIsQuizTimerRunning] = useState<boolean>(false);

  // Floating Hearts & Fireworks Celebration State when a new student joins
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

    // 1. Step and draw ascending firework rockets launched from student tables
    const nextRockets: TableFireworkRocket[] = [];
    for (const rocket of fireworksRocketsRef.current) {
      const nextY = rocket.y + rocket.vy;
      const nextTrail = [
        { x: rocket.x, y: rocket.y, alpha: 0.95 },
        ...rocket.trail.map((t) => ({ ...t, alpha: t.alpha - 0.14 })).filter((t) => t.alpha > 0.05),
      ].slice(0, 8);

      // Draw rocket comet trail
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
        // Rocket reached apex above student's table -> spawn aerial firework burst
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

    // 2. Step and draw firework explosion particles (rings, sparks, hearts, stars)
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

  const demoJoinCursorRef = useRef<number>(0);

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

    // Immediate starburst directly at the student's table location (x, y)
    const deskParticles = createTableFireworkBurstParticles({
      originX: origin.x,
      originY: origin.y,
      team: matchedSeat?.team || team,
      burstId: `${nowId}-desk`,
    });
    fireworksParticlesRef.current.push(...deskParticles);

    // Ascending firework rocket launching from the student's table up above their name tag
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

    // Launch custom 2D canvas firework overlay + confetti directly from this student's table location (Máy #01 - Máy #42)
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

    // Anchor floating heart & firework particles directly around the student's 2.5D desk coordinates
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

  // Detect when a new student connects to the waiting room and trigger localized desk + name-tag fireworks
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
    const timer = setTimeout(() => {
      setJoinBannerAlert(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [joinBannerAlert]);

  useEffect(() => {
    if (!recentJoinedStudentId) return;
    const timer = setTimeout(() => {
      setRecentJoinedStudentId(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [recentJoinedStudentId]);

  const safeQuizIdx =
    quizzes.length > 0
      ? Math.max(0, Math.min(waitingState.currentQuizIndex || 0, quizzes.length - 1))
      : 0;
  const activeQuiz = quizzes[safeQuizIdx] || quizzes[0];

  const updateWaitingRoom = (updater: (prev: WaitingRoomState) => WaitingRoomState) => {
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
        waitingRoomByLesson: {
          ...(prevSession.waitingRoomByLesson || {}),
          [lessonKey]: nextWR,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Ensure initial waitingRoomByLesson is persisted when Teacher opens the Waiting Room
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

  // When Student of the designated class enters Waiting Room, auto-register their seat and broadcast join event
  useEffect(() => {
    if (role !== 'student' || !currentStudent) return;
    if (currentStudent.classId !== classId) return;

    const mySeat = allSeats.find((s) => s.studentId === currentStudent.id);
    const alreadyIn = waitingState.joinedStudentIds.includes(currentStudent.id);

    if (!alreadyIn) {
      updateWaitingRoom((prev) => {
        const res = registerStudentJoinWaitingRoom(prev, {
          id: currentStudent.id,
          name: currentStudent.name,
          classId: currentStudent.classId,
          stationNumber: currentStudent.stationNumber,
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
            stationNumber: currentStudent.stationNumber,
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

  // Listen for real-time BroadcastChannel waiting room updates across tabs
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
      }
    };
    return () => bc.close();
  }, [lessonKey, onUpdateLiveSession]);

  // Countdown timer for chalkboard warmup question
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
        // Quick praise +3 points for student's team
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

    // Student clicking their own seat
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
          text: `🎆❤️ ${nextSeat.studentName} (Máy #${nextSeat.stationNumber}) vừa kết nối thành công vào Phòng Chờ Tổ ${nextSeat.team}!`,
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
      `🎆❤️ Toàn bộ ${allSeats.length} học sinh Lớp ${classId} đã vào phòng chờ và ổn định chỗ ngồi tại 2 dãy bàn!`
    );
  };

  const handleTeacherMarkReadyForLearning = () => {
    updateWaitingRoom((prev) => ({
      ...prev,
      isReadyForLearning: true,
      reactionBurstCount: (prev.reactionBurstCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    }));
    triggerSynchronizedCelebration();
    if (defaultCollapsedAfterReady) {
      setIsCollapsed(true);
    }
    if (onReadyForLearning) {
      onReadyForLearning();
    }
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

  const handleSelectOption = (letter: 'A' | 'B' | 'C') => {
    const opt = activeQuiz.options.find((o) => o.letter === letter);
    const isCorrect = Boolean(opt?.isCorrect);

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
            choice: letter,
            isCorrect,
            team: picker.team,
          })
        );
        onShowToast(
          `🎯 ${picker.studentName} (Tổ ${picker.team}) vừa chọn đáp án ${letter}${
            isCorrect ? ' — Chính xác (+2đ)!' : '!'
          }`
        );
      }
      return;
    }

    if (!currentStudent) return;
    if (currentStudent.classId !== classId) {
      onShowToast(`⚠️ Phòng chờ này chỉ dành cho học sinh Lớp ${classId}!`);
      return;
    }
    if (waitingState.isQuizLocked) {
      onShowToast('⏰ Đã hết giờ trả lời câu hỏi này! Chờ Thầy/Cô chuyển câu tiếp theo nhé.');
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
        choice: letter,
        isCorrect,
        team: myTeam,
      })
    );

    if (!alreadyAnswered && isCorrect && onAwardXp) {
      onAwardXp(15);
    }

    onShowToast(
      isCorrect
        ? `🎉 Chính xác! Em đã mang về +2 điểm cho Tổ ${myTeam} (+15 XP)!`
        : `👍 Đã ghi nhận đáp án ${letter} của em trên bảng lớp!`
    );
  };

  const handleNextQuizQuestion = () => {
    const nextIdx = (safeQuizIdx + 1) % quizzes.length;
    setQuizCountdownSec(20);
    setIsQuizTimerRunning(false);
    updateWaitingRoom((prev) => ({
      ...prev,
      currentQuizIndex: nextIdx,
      isQuizLocked: false,
      showQuizAnswer: false,
      studentQuickAnswers: {},
    }));
    onShowToast(`📋 Đã chuyển sang Câu hỏi khởi động ${nextIdx + 1}/${quizzes.length}!`);
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
      onShowToast(`✨ Đã chốt & công bố đáp án đúng trên bảng phấn!`);
    }
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
        {/* LOCALIZED FIREWORK & FLOATING HEARTS EXPLOSION AT THE STUDENT'S NAME TAG & DESK */}
        {isNewlyJoined && (
          <>
            {/* Expanding Firework Shockwave Rings behind Desk & Name Tag */}
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-rose-300/80 animate-ping"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -inset-1.5 rounded-3xl border border-amber-300/75 animate-pulse"
              aria-hidden="true"
            />

            {/* Radiating Hearts & Firework Sparks directly around Name Tag & Desk */}
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
              <span className="absolute top-3 -left-2 text-sm sm:text-base animate-pulse">
                💖
              </span>
              <span className="absolute top-3 -right-2 text-sm sm:text-base animate-pulse">
                ✨
              </span>
              <span className="absolute bottom-3 -left-2 text-sm sm:text-base animate-bounce">
                💝
              </span>
              <span className="absolute bottom-3 -right-2 text-sm sm:text-base animate-bounce">
                🎉
              </span>
            </div>

            {/* Celebratory Ribbon right above the Student's Name Tag */}
            <div className="absolute -top-3.5 inset-x-0 z-40 flex justify-center pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 text-white text-[9px] font-black shadow-[0_0_12px_rgba(244,63,94,0.95)] border border-yellow-200 animate-bounce whitespace-nowrap">
                🎆❤️ ĐÃ KẾT NỐI • M#{seat.stationNumber}
              </span>
            </div>
          </>
        )}

        {/* Answer Bubble above student head */}
        {quickAnswer && (
          <div
            className={`absolute -top-1 right-1 z-20 w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center shadow-md border ${
              waitingState.showQuizAnswer
                ? activeQuiz.options.find((o) => o.letter === quickAnswer)?.isCorrect
                  ? 'bg-emerald-500 text-white border-emerald-200 animate-bounce'
                  : 'bg-rose-600 text-white border-rose-200'
                : 'bg-amber-400 text-slate-950 border-white animate-pulse'
            }`}
          >
            {quickAnswer}
          </div>
        )}

        {/* Honor Role Badge */}
        {honorMeta && (
          <div
            className={`absolute -top-1 left-0.5 z-20 px-1.5 py-0.5 rounded-full bg-gradient-to-r ${honorMeta.badgeBg} text-white text-[9px] font-black shadow-md border border-white/60 flex items-center gap-0.5`}
            title={honorMeta.label}
          >
            <span>{honorMeta.icon}</span>
            <span className="hidden xl:inline">{honorMeta.label}</span>
          </div>
        )}

        {/* Floating Student Name Tag (Highlights with Hearts & Fireworks when Newly Connected) */}
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

        {/* Desk + Student Avatar Graphic (2.5D Top-Down Classroom Perspective) */}
        <div className="relative w-16 sm:w-20 h-16 sm:h-[70px] flex flex-col items-center justify-end">
          {/* Wooden Desk Surface at Top */}
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

          {/* Student Head & Shoulders sitting at Desk */}
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

          {/* Wooden Chair Backrest at Bottom */}
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

  // If collapsed above Slide Bài Giảng after Teacher clicked "Sẵn sàng cho việc học"
  if (isCollapsed && role === 'teacher') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-[#3B2311] via-[#1B4D3E] to-[#3B2311] text-white px-5 py-3.5 border-2 border-[#8C5622] shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-xs">
            🏫
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white">
                Hệ Thống Phòng Chờ Phiên Live — Lớp {classId} (Khối {grade} • Tiết {period})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                ✓ ĐÃ SẴN SÀNG CHO VIỆC HỌC ({joinedCount}/{allSeats.length} HS)
              </span>
            </div>
            <p className="text-[11px] text-amber-200/90">
              Điểm khởi động: Tổ 1 ({waitingState.team1Score}đ) vs Tổ 2 ({waitingState.team2Score}đ) • Đang tiến hành Hoạt động học bên dưới
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualHeartFireworkReaction}
            className="px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold cursor-pointer shadow-xs flex items-center gap-1"
          >
            <span>❤️🎆</span>
            <span>Thả tim &amp; Pháo hoa</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-xs flex items-center gap-1"
          >
            <span>🗖</span>
            <span>Mở rộng Phòng Chờ 2.5D</span>
          </button>
        </div>
      </div>
    );
  }

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

      {/* FLOATING HEARTS & FIREWORKS ANIMATION OVERLAY WHEN NEW STUDENT JOINS */}
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

      {/* 1. TOP CLASSROOM CONTROL BAR (TEACHER INFO + DESIGNATED CLASS STATUS + READY FOR LEARNING CTA) */}
      <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#4A2E16] via-[#5C3A1D] to-[#4A2E16] border-b-2 border-[#8D5B2E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Teacher Profile Pill */}
          <div className="flex items-center gap-2.5 bg-black/35 border border-amber-400/30 rounded-full pl-1.5 pr-3.5 py-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-lg font-black text-slate-950 border-2 border-white shadow-sm">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  Thầy Đỗ Mạnh Trường
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                  LIVE PHÒNG CHỜ
                </span>
                {isReadyForLearning && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                    ✓ ĐÃ SẴN SÀNG HỌC
                  </span>
                )}
              </div>
              <div className="text-[11px] text-amber-200/90 font-medium">
                Đang đón học sinh chỉ định: <strong className="text-white">Lớp {classId}</strong> • Sĩ số vào phòng:{' '}
                <strong className="text-emerald-300 tabular-nums">
                  {joinedCount}/{allSeats.length} bạn
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: Admit Classmates / Heart & Firework / Ready For Learning CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualHeartFireworkReaction}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs cursor-pointer shadow-md border border-pink-300/50 transition-all flex items-center gap-1"
            title="Bắn hiệu ứng Thả tim & Pháo hoa chào mừng học sinh vào phòng chờ"
          >
            <span>❤️🎆</span>
            <span>Thả tim &amp; Pháo hoa</span>
          </button>

          {role === 'teacher' ? (
            <>
              <button
                type="button"
                onClick={handleAdmitSingleWaitingStudent}
                className="px-3 py-2 rounded-full bg-pink-100 hover:bg-pink-200 text-rose-950 font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-1"
                title="Đón học sinh mới kết nối vào phòng chờ kèm hiệu ứng Thả tim & Pháo hoa tại bàn học"
              >
                <span>👋❤️</span>
                <span>+1 HS vào phòng</span>
              </button>
              {joinedCount < allSeats.length && (
                <button
                  type="button"
                  onClick={handleAdmitNextBatchOrAll}
                  className="px-3.5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                  title="Đón toàn bộ học sinh Lớp chỉ định vào chỗ ngồi tại 2 dãy bàn"
                >
                  <span>⚡</span>
                  <span>Đón đủ {allSeats.length} HS Lớp {classId} vào bàn</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleTeacherMarkReadyForLearning}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs cursor-pointer shadow-lg border-2 border-emerald-200 transition-all flex items-center gap-1.5 animate-pulse"
                title="Nhấn Sẵn sàng cho việc học để bắt đầu mở tiến trình các hoạt động học"
              >
                <span>🚀</span>
                <span>Sẵn sàng cho việc học (Bắt đầu Hoạt động)</span>
              </button>

              {defaultCollapsedAfterReady && (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="px-2.5 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-amber-200 text-[11px] font-bold cursor-pointer border border-white/15"
                  title="Thu gọn Phòng Chờ xuống thanh trạng thái phía trên Hoạt động học"
                >
                  Thu gọn ▲
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-200 text-xs font-bold">
                ✓ Em đã ngồi vào bàn Lớp {classId} ({currentStudent?.name})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NEW STUDENT JOIN HEART & FIREWORK BANNER ON TEACHER & STUDENT UI */}
      {joinBannerAlert && (
        <div className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg border-b border-white/30 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎆❤️</span>
            <span>
              CHÀO MỪNG THÀNH VIÊN MỚI VÀO PHÒNG CHỜ: <strong>{joinBannerAlert.name}</strong> (Máy #{joinBannerAlert.stationNumber} • Tổ {joinBannerAlert.team}) vừa vào lớp {classId}! 💖✨
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 text-[11px] font-black shrink-0">
            +1đ TỔ {joinBannerAlert.team} 🎉
          </span>
        </div>
      )}

      {/* 2. GREEN CHALKBOARD SECTION (BẢNG PHẤN XANH + THANH KÉO CO TỔ 1 - TỔ 2 + CÂU HỎI KHỞI ĐỘNG) */}
      <div className="relative bg-gradient-to-b from-[#1B4D3E] via-[#174235] to-[#12352A] border-b-[10px] border-[#8C5622] px-4 sm:px-8 pt-3 pb-5 shadow-inner">
        {/* Top Wooden Class Banner Plaque */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
              Câu {activeQuiz.order}/{quizzes.length}
            </span>
            <span className="text-xs text-emerald-200/80 hidden sm:inline">
              · Khởi động trong lúc chờ đủ lớp
            </span>
          </div>

          {/* Center Wooden Scroll Plaque */}
          <div className="px-6 py-1 rounded-full bg-gradient-to-b from-[#FCE7C8] to-[#E5C08D] border-2 border-[#8C5622] shadow-md text-[#4A2C11] font-black text-xs sm:text-sm tracking-tight">
            Lớp {classId} · Tin Học {grade} (Tiết {period})
          </div>

          {/* Right Team 1 vs Team 2 Tug-of-War Score Bar */}
          <div className="flex items-center gap-2 bg-black/25 px-3 py-1 rounded-full border border-white/15">
            <span className="text-xs font-black text-amber-300 tabular-nums">
              TỔ 1 · {waitingState.team1Score}
            </span>
            <div className="w-24 sm:w-28 h-2.5 rounded-full bg-sky-500 overflow-hidden relative flex items-center border border-white/30">
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${team1Percent}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-sm"
                style={{ left: `calc(${team1Percent}% - 2px)` }}
              />
            </div>
            <span className="text-xs font-black text-sky-300 tabular-nums">
              {waitingState.team2Score} · TỔ 2
            </span>
          </div>
        </div>

        {/* Chalkboard Question Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
            {activeQuiz.question}
          </h2>

          {role === 'teacher' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isQuizTimerRunning) {
                    setIsQuizTimerRunning(false);
                  } else {
                    setQuizCountdownSec(20);
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
                {isQuizTimerRunning ? `⏳ ${quizCountdownSec}s` : '⏱️ Đếm ngược 20s'}
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

        {/* 3 Yellow-Framed Chalkboard Option Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeQuiz.options.map((opt) => {
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
                onClick={() => handleSelectOption(opt.letter)}
                className={`text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isRevealedCorrect
                    ? 'bg-emerald-700/70 border-emerald-300 ring-2 ring-emerald-300/60 shadow-lg'
                    : isSelectedByMe
                    ? 'bg-amber-500/30 border-amber-300 ring-2 ring-amber-300/50'
                    : 'bg-[#215846]/90 hover:bg-[#276652] border-[#C5B358]/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-white leading-snug">
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
                    {isSelectedByMe ? '⭐ Em đã chọn đáp án này' : 'Bấm để chọn đáp án'}
                  </span>
                  <span className="font-bold tabular-nums">{pickCount} bạn chọn</span>
                </div>
              </button>
            );
          })}
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
        className="relative px-3 sm:px-6 pt-4 pb-6 min-h-[540px] flex flex-col justify-between"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(120,65,20,0.14) 0px, rgba(120,65,20,0.14) 2px, transparent 2px, transparent 48px), linear-gradient(180deg, #D59B5A 0%, #C18242 50%, #B17234 100%)',
        }}
      >
        {/* Top Classroom Aisle Header: Teacher Character + Status Pill */}
        <div className="relative flex flex-col items-center justify-center mb-2">
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-300/30 text-amber-100 text-xs font-bold">
              🪑 Sơ đồ bàn học Lớp {classId}: {joinedCount}/{allSeats.length} học sinh đã vào chỗ
            </div>

            <div className="px-3.5 py-1 rounded-full bg-[#244432]/90 border border-emerald-300/40 text-white text-xs font-extrabold shadow-md">
              {waitingState.isQuizLocked
                ? `Hết giờ! Đang chốt (${answeredCount} bạn)`
                : isQuizTimerRunning
                ? `Đang trả lời: còn ${quizCountdownSec}s (${answeredCount} bạn đã chọn)`
                : `Đang mở câu hỏi khởi động (${answeredCount} bạn đã trả lời)`}
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
          {/* LEFT WING: TỔ 1 (3 Columns of Desks) */}
          <div className="lg:col-span-5 bg-amber-950/10 rounded-3xl p-3 border border-amber-900/20 flex flex-col items-center">
            <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-3 w-full justify-items-center">
              {team1Seats.map((seat) => renderStudentDeskCard(seat))}
            </div>
            <div className="mt-4 px-5 py-1 rounded-full bg-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-md border border-rose-300">
              TỔ 1 ({team1Seats.filter((s) => joinedSet.has(s.studentId)).length}/{team1Seats.length} HS)
            </div>
          </div>

          {/* CENTER AISLE (Lối đi giữa lớp + Bảng Danh Hiệu Lớp không che bàn học) */}
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

          {/* RIGHT WING: TỔ 2 (3 Columns of Desks) */}
          <div className="lg:col-span-5 bg-amber-950/10 rounded-3xl p-3 border border-amber-900/20 flex flex-col items-center">
            <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-3 w-full justify-items-center">
              {team2Seats.map((seat) => renderStudentDeskCard(seat))}
            </div>
            <div className="mt-4 px-5 py-1 rounded-full bg-sky-600 text-white font-black text-xs tracking-wider uppercase shadow-md border border-sky-300">
              TỔ 2 ({team2Seats.filter((s) => joinedSet.has(s.studentId)).length}/{team2Seats.length} HS)
            </div>
          </div>
        </div>

        {/* 4. BOTTOM-LEFT LIVE JOIN STREAM & INTERACTIVE CHAT BAR */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Live Join & Answer Stream */}
          <div className="lg:col-span-6 bg-slate-950/65 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {(waitingState.feedMessages || []).slice(0, 4).map((msg) => (
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

          {/* Interactive Chat & Quick Greeting Bar */}
          <div className="lg:col-span-6 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                '👋 Em chào Thầy ạ!',
                '🔥 Quyết tâm 10 điểm Tin học!',
                '🙋 Em đã vào đúng máy!',
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
                placeholder="Nhập lời chào hoặc bình luận vào phòng chờ..."
                aria-label="Nhập lời chào vào phòng chờ"
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
    </div>
  );
};
