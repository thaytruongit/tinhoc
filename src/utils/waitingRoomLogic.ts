import type {
  ClassroomHonorRole,
  StudentRosterItem,
  WaitingRoomChatItem,
  WaitingRoomState,
} from '../data/mockCurriculumData';

export interface ChalkboardWarmupQuiz {
  id: string;
  order: number;
  question: string;
  options: {
    letter: 'A' | 'B' | 'C';
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface ClassroomDeskSeat {
  studentId: string;
  studentName: string;
  shortName: string;
  classId: string;
  stationNumber: string;
  team: 1 | 2;
  deskIndexInTeam: number;
  xp: number;
  avatarTone: 'amber' | 'sky' | 'emerald' | 'rose' | 'indigo' | 'purple';
  isFemale: boolean;
}

const SUPPLEMENTARY_STUDENT_NAMES = [
  'Nguyễn Quỳnh Chi',
  'Đỗ Tấn Đạt',
  'Phạm Thị Thanh Hà',
  'Vương Quỳnh Hoa',
  'Nguyễn Duy Gia Hưng',
  'Nguyễn Thị Khánh Linh',
  'Nguyễn Quang Nam',
  'Nguyễn Linh Nhi',
  'Nguyễn Bách Tùng',
  'Trần Minh Quân',
  'Lê Hoàng Bảo Ngọc',
  'Vũ Đức Anh',
  'Hoàng Minh Thư',
  'Đặng Gia Huy',
  'Phạm Ngọc Hân',
  'Ngô Quốc Khánh',
  'Bùi Phương Thảo',
  'Trương Tuấn Kiệt',
];

const AVATAR_TONES: ClassroomDeskSeat['avatarTone'][] = [
  'amber',
  'sky',
  'emerald',
  'rose',
  'indigo',
  'purple',
];

export function formatShortStudentSeatName(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  return `${parts[0]} ${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
}

function detectLikelyFemaleName(fullName: string): boolean {
  const lower = (fullName || '').toLowerCase();
  return (
    lower.includes('thị ') ||
    lower.includes('quỳnh') ||
    lower.includes('hoa') ||
    lower.includes('chi') ||
    lower.includes('linh') ||
    lower.includes('nhi') ||
    lower.includes('hà') ||
    lower.includes('ngọc') ||
    lower.includes('thảo') ||
    lower.includes('hân') ||
    lower.includes('thư') ||
    lower.includes('ngân') ||
    lower.includes('vy') ||
    lower.includes('châu')
  );
}

/**
 * Builds the 2-wing classroom desk roster strictly for the designated `classId`.
 * Ensures all real students in `classId` are seated first, and pads up to `minDesks` (default 18: 9 in Tổ 1, 9 in Tổ 2)
 * so the 2-wing wooden classroom layout (3 columns x N rows per wing) is always balanced.
 */
export function buildDesignatedClassDeskRoster(
  allStudents: StudentRosterItem[],
  classId: string,
  grade: 6 | 7 | 8 | 9 = 6,
  minDesks = 18
): {
  allSeats: ClassroomDeskSeat[];
  team1Seats: ClassroomDeskSeat[];
  team2Seats: ClassroomDeskSeat[];
} {
  const normalizedClassId = (classId || '6A10').trim();
  const realClassStudents = (allStudents || []).filter(
    (s) => s.classId === normalizedClassId
  );

  const combinedList: {
    id: string;
    name: string;
    classId: string;
    stationNumber: string;
    xp: number;
    groupNumber?: number;
  }[] = realClassStudents.map((s, idx) => ({
    id: s.id,
    name: s.name,
    classId: s.classId,
    stationNumber: s.stationNumber || String(idx + 1).padStart(2, '0'),
    xp: s.xp || 1000,
    groupNumber: s.groupNumber,
  }));

  const existingNames = new Set(combinedList.map((s) => s.name.toLowerCase()));
  let suppIdx = 0;

  while (combinedList.length < minDesks && suppIdx < SUPPLEMENTARY_STUDENT_NAMES.length) {
    const candidateName = SUPPLEMENTARY_STUDENT_NAMES[suppIdx];
    suppIdx++;
    if (existingNames.has(candidateName.toLowerCase())) continue;
    const seatNumber = combinedList.length + 1;
    combinedList.push({
      id: `${grade}${normalizedClassId.replace(/[^0-9]/g, '') || '10'}_seat_${String(seatNumber).padStart(2, '0')}`,
      name: candidateName,
      classId: normalizedClassId,
      stationNumber: String(seatNumber).padStart(2, '0'),
      xp: 1050 + ((seatNumber * 37) % 350),
      groupNumber: (seatNumber % 4) + 1,
    });
  }

  const team1Seats: ClassroomDeskSeat[] = [];
  const team2Seats: ClassroomDeskSeat[] = [];

  combinedList.forEach((st, idx) => {
    // Alternate or assign by groupNumber so Team 1 (Left Wing) and Team 2 (Right Wing) have equal counts
    const targetTeam: 1 | 2 =
      team1Seats.length <= team2Seats.length ? 1 : 2;
    const seat: ClassroomDeskSeat = {
      studentId: st.id,
      studentName: st.name,
      shortName: formatShortStudentSeatName(st.name),
      classId: st.classId,
      stationNumber: st.stationNumber,
      team: targetTeam,
      deskIndexInTeam: targetTeam === 1 ? team1Seats.length : team2Seats.length,
      xp: st.xp,
      avatarTone: AVATAR_TONES[idx % AVATAR_TONES.length],
      isFemale: detectLikelyFemaleName(st.name),
    };
    if (targetTeam === 1) {
      team1Seats.push(seat);
    } else {
      team2Seats.push(seat);
    }
  });

  return {
    allSeats: [...team1Seats, ...team2Seats],
    team1Seats,
    team2Seats,
  };
}

/**
 * Generates 5 chalkboard warmup questions (3 options A, B, C) tailored to the Grade & Period.
 */
export function getWaitingRoomChalkboardQuizzes(
  grade: 6 | 7 | 8 | 9,
  period: number,
  lessonTitle?: string
): ChalkboardWarmupQuiz[] {
  const cleanTitle = (lessonTitle || `Tiết ${period} Tin học ${grade}`).replace(
    /^Tiết\s*\d+\s*:\s*/i,
    ''
  );

  return [
    {
      id: `wr-k${grade}-p${period}-q1`,
      order: 1,
      question: `Khởi động "${cleanTitle}": Mục tiêu quan trọng nhất mà em cần đạt được trong bài học này là gì?`,
      options: [
        {
          letter: 'A',
          text: `Nắm vững kiến thức trọng tâm của "${cleanTitle}", rèn luyện kỹ năng số và ứng dụng giải quyết bài toán thực tế.`,
          isCorrect: true,
        },
        {
          letter: 'B',
          text: 'Chỉ đọc lướt qua lý thuyết mà không cần thực hành hay kiểm chứng kết quả.',
          isCorrect: false,
        },
        {
          letter: 'C',
          text: 'Tùy ý thao tác phần mềm mà không tuân thủ hướng dẫn kỹ thuật.',
          isCorrect: false,
        },
      ],
      explanation: `Mỗi bài học Tin học đều hướng tới việc hình thành phẩm chất, năng lực số và giải quyết vấn đề thực tiễn.`,
    },
    {
      id: `wr-k${grade}-p${period}-q2`,
      order: 2,
      question: `Khi thực hành và làm bài tập về "${cleanTitle}", thao tác nào sau đây là chuẩn mực nhất?`,
      options: [
        {
          letter: 'A',
          text: 'Làm việc tùy tiện, không lưu tệp sản phẩm và không đặt tên có ý nghĩa.',
          isCorrect: false,
        },
        {
          letter: 'B',
          text: 'Quan sát kỹ hướng dẫn, thực hiện tuần tự các bước và lưu bài vào đúng thư mục được chỉ định.',
          isCorrect: true,
        },
        {
          letter: 'C',
          text: 'Tắt máy tính ngay khi chuông reo mà chưa lưu dữ liệu bài làm.',
          isCorrect: false,
        },
      ],
      explanation: 'Tuân thủ quy trình chuẩn mực giúp bảo vệ dữ liệu và rèn luyện tác phong làm việc khoa học trong môi trường số.',
    },
    {
      id: `wr-k${grade}-p${period}-q3`,
      order: 3,
      question: `Trong môi trường học tập số và mạng Internet liên quan đến "${cleanTitle}", hành động nào thể hiện văn hóa số và an toàn thông tin?`,
      options: [
        {
          letter: 'A',
          text: 'Chia sẻ mật khẩu tài khoản học tập cá nhân cho người lạ trên mạng.',
          isCorrect: false,
        },
        {
          letter: 'B',
          text: 'Tải và cài đặt các phần mềm lạ không rõ nguồn gốc lên máy tính phòng học.',
          isCorrect: false,
        },
        {
          letter: 'C',
          text: 'Bảo mật thông tin cá nhân, tôn trọng bản quyền số và hỏi ý kiến thầy cô khi gặp tình huống nghi vấn.',
          isCorrect: true,
        },
      ],
      explanation: 'Bảo mật thông tin và tôn trọng bản quyền là chuẩn mực cốt lõi của công dân số văn minh.',
    },
    {
      id: `wr-k${grade}-p${period}-q4`,
      order: 4,
      question: `Phương pháp học tập nào giúp em ghi nhớ sâu và làm chủ kiến thức bài "${cleanTitle}"?`,
      options: [
        {
          letter: 'A',
          text: 'Tóm tắt từ khóa bằng sơ đồ tư duy, tích cực trao đổi cùng bạn và thực hành trực tiếp trên máy.',
          isCorrect: true,
        },
        {
          letter: 'B',
          text: 'Chỉ học vẹt các định nghĩa mà không mở phần mềm thao tác.',
          isCorrect: false,
        },
        {
          letter: 'C',
          text: 'Sao chép bài làm của bạn khác để nộp cho nhanh.',
          isCorrect: false,
        },
      ],
      explanation: 'Học thông qua trải nghiệm thực hành và tư duy trực quan giúp phát triển năng lực Tin học bền vững.',
    },
    {
      id: `wr-k${grade}-p${period}-q5`,
      order: 5,
      question: `Khi ứng dụng Trợ lý Trí tuệ nhân tạo (AI) hỗ trợ học tập bài "${cleanTitle}", em nên làm gì?`,
      options: [
        {
          letter: 'A',
          text: 'Phụ thuộc 100% vào AI, sao chép nguyên văn câu trả lời mà không suy nghĩ hay kiểm chứng.',
          isCorrect: false,
        },
        {
          letter: 'B',
          text: 'Đặt câu lệnh rõ ràng, sử dụng AI như một trợ lý gợi ý ý tưởng và luôn tự mình kiểm tra, đối chiếu SGK.',
          isCorrect: true,
        },
        {
          letter: 'C',
          text: 'Cung cấp thông tin nhạy cảm của bản thân và gia đình lên các công cụ AI công cộng.',
          isCorrect: false,
        },
      ],
      explanation: 'Sử dụng AI có trách nhiệm: xem AI là công cụ hỗ trợ tư duy, luôn kiểm chứng thông tin và bảo mật dữ liệu.',
    },
  ];
}

/**
 * Creates the initial synchronized WaitingRoomState for a designated class and lesson.
 */
export function createInitialWaitingRoomState(params: {
  classId: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  students: StudentRosterItem[];
  preJoinRealStudents?: boolean;
}): WaitingRoomState {
  const { classId, grade, period, students, preJoinRealStudents = true } = params;
  const { allSeats, team1Seats, team2Seats } = buildDesignatedClassDeskRoster(
    students,
    classId,
    grade,
    18
  );

  const initialJoinedIds = preJoinRealStudents
    ? [
        ...team1Seats.slice(0, 6).map((s) => s.studentId),
        ...team2Seats.slice(0, 6).map((s) => s.studentId),
      ]
    : [];

  const studentRoles: Record<string, ClassroomHonorRole> = {};
  if (team1Seats[0]) studentRoles[team1Seats[0].studentId] = 'lop-truong';
  if (team2Seats[0]) studentRoles[team2Seats[0].studentId] = 'lop-pho';
  if (team1Seats[1]) studentRoles[team1Seats[1].studentId] = 'sao-do';
  if (team2Seats[1]) studentRoles[team2Seats[1].studentId] = 'tuyen-duong';

  const nowIso = new Date().toISOString();
  const feedMessages: WaitingRoomChatItem[] = initialJoinedIds.slice(0, 4).map((id, i) => {
    const found = allSeats.find((s) => s.studentId === id);
    return {
      id: `init-join-${id}-${i}`,
      studentId: id,
      studentName: found?.studentName || 'Học sinh',
      stationNumber: found?.stationNumber || '01',
      type: 'join',
      text: `${found?.studentName || 'Học sinh'} (Máy #${found?.stationNumber || '01'}) đã vào phòng chờ Lớp ${classId}`,
      timestampIso: nowIso,
    };
  });

  const t1Joined = team1Seats.filter((s) => initialJoinedIds.includes(s.studentId)).length;
  const t2Joined = team2Seats.filter((s) => initialJoinedIds.includes(s.studentId)).length;

  return {
    isOpen: true,
    isReadyForLearning: false,
    classId,
    grade,
    period,
    joinedStudentIds: initialJoinedIds,
    studentRoles,
    studentQuickAnswers: {},
    currentQuizIndex: 0,
    isQuizLocked: false,
    showQuizAnswer: false,
    team1Score: Math.max(1, t1Joined),
    team2Score: Math.max(1, t2Joined),
    feedMessages,
    reactionBurstCount: 0,
    updatedAt: nowIso,
  };
}

/**
 * Registers a student joining the waiting room.
 * Strictly validates that the student belongs to the designated `state.classId`.
 */
export function registerStudentJoinWaitingRoom(
  state: WaitingRoomState,
  student: {
    id: string;
    name: string;
    classId: string;
    stationNumber?: string;
    team?: 1 | 2;
  }
): {
  nextState: WaitingRoomState;
  accepted: boolean;
  alreadyJoined: boolean;
} {
  if (!state || student.classId !== state.classId) {
    return {
      nextState: state,
      accepted: false,
      alreadyJoined: false,
    };
  }

  const alreadyJoined = state.joinedStudentIds.includes(student.id);
  if (alreadyJoined) {
    return {
      nextState: state,
      accepted: true,
      alreadyJoined: true,
    };
  }

  const nowIso = new Date().toISOString();
  const team = student.team || 1;
  const station = student.stationNumber || '01';
  const joinMsg: WaitingRoomChatItem = {
    id: `join-${student.id}-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    stationNumber: station,
    type: 'join',
    text: `🎆❤️ ${student.name} (Máy #${station}) đã tham gia phòng chờ Lớp ${state.classId}`,
    timestampIso: nowIso,
  };

  return {
    accepted: true,
    alreadyJoined: false,
    nextState: {
      ...state,
      joinedStudentIds: [...state.joinedStudentIds, student.id],
      team1Score: team === 1 ? state.team1Score + 1 : state.team1Score,
      team2Score: team === 2 ? state.team2Score + 1 : state.team2Score,
      feedMessages: [joinMsg, ...(state.feedMessages || [])].slice(0, 25),
      lastJoinedStudent: {
        id: student.id,
        name: student.name,
        stationNumber: station,
        team,
        timestampIso: nowIso,
      },
      reactionBurstCount: (state.reactionBurstCount || 0) + 1,
      updatedAt: nowIso,
    },
  };
}

/**
 * Admits all seats of the designated class into the waiting room at once.
 */
export function admitAllClassStudentsToWaitingRoom(
  state: WaitingRoomState,
  allSeats: ClassroomDeskSeat[]
): WaitingRoomState {
  const nowIso = new Date().toISOString();
  const allIds = allSeats.map((s) => s.studentId);
  const t1Count = allSeats.filter((s) => s.team === 1).length;
  const t2Count = allSeats.filter((s) => s.team === 2).length;
  const newlyJoinedSeats = allSeats.filter((s) => !state.joinedStudentIds.includes(s.studentId));
  const lastSeat = newlyJoinedSeats[newlyJoinedSeats.length - 1] || allSeats[allSeats.length - 1];

  const summaryMsg: WaitingRoomChatItem = {
    id: `join-all-${Date.now()}`,
    studentId: 'teacher',
    studentName: 'Thầy/Cô Giáo',
    type: 'join',
    text: `🎆❤️ Toàn bộ ${allIds.length} học sinh Lớp ${state.classId} đã ổn định chỗ ngồi tại 2 dãy bàn!`,
    timestampIso: nowIso,
  };

  return {
    ...state,
    joinedStudentIds: allIds,
    team1Score: Math.max(state.team1Score, t1Count),
    team2Score: Math.max(state.team2Score, t2Count),
    feedMessages: [summaryMsg, ...(state.feedMessages || [])].slice(0, 25),
    lastJoinedStudent: lastSeat
      ? {
          id: lastSeat.studentId,
          name: `${newlyJoinedSeats.length > 1 ? `${newlyJoinedSeats.length} học sinh (cùng ${lastSeat.studentName})` : lastSeat.studentName}`,
          stationNumber: lastSeat.stationNumber,
          team: lastSeat.team,
          timestampIso: nowIso,
        }
      : state.lastJoinedStudent,
    reactionBurstCount: (state.reactionBurstCount || 0) + 1,
    updatedAt: nowIso,
  };
}

/**
 * Submits a student's quick answer (A, B, or C) to the chalkboard warmup question.
 */
export function submitWaitingRoomQuickAnswer(
  state: WaitingRoomState,
  params: {
    studentId: string;
    studentName: string;
    stationNumber?: string;
    choice: 'A' | 'B' | 'C';
    isCorrect: boolean;
    team: 1 | 2;
  }
): WaitingRoomState {
  if (state.isQuizLocked) return state;

  const { studentId, studentName, stationNumber, choice, isCorrect, team } = params;
  const prevChoice = state.studentQuickAnswers?.[studentId];
  const nowIso = new Date().toISOString();

  const scoreDelta = !prevChoice && isCorrect ? 2 : 0;

  const answerMsg: WaitingRoomChatItem = {
    id: `ans-${studentId}-${Date.now()}`,
    studentId,
    studentName,
    stationNumber: stationNumber || '01',
    type: 'answer',
    text: `${studentName} chọn đáp án ${choice}${isCorrect ? ' (+2đ Tổ ' + team + ')' : ''}`,
    answerChoice: choice,
    timestampIso: nowIso,
  };

  return {
    ...state,
    joinedStudentIds: state.joinedStudentIds.includes(studentId)
      ? state.joinedStudentIds
      : [...state.joinedStudentIds, studentId],
    studentQuickAnswers: {
      ...(state.studentQuickAnswers || {}),
      [studentId]: choice,
    },
    team1Score: team === 1 ? state.team1Score + scoreDelta : state.team1Score,
    team2Score: team === 2 ? state.team2Score + scoreDelta : state.team2Score,
    feedMessages: [answerMsg, ...(state.feedMessages || [])].slice(0, 25),
    updatedAt: nowIso,
  };
}

/**
 * Assigns a classroom honor role (Lớp trưởng, Lớp phó, Sao đỏ, Tuyên dương) to a student.
 */
export function assignWaitingRoomHonorRole(
  state: WaitingRoomState,
  params: {
    studentId: string;
    studentName: string;
    role: ClassroomHonorRole;
    team: 1 | 2;
  }
): WaitingRoomState {
  const { studentId, studentName, role, team } = params;
  const roleLabels: Record<ClassroomHonorRole, string> = {
    'lop-truong': '👑 Lớp trưởng',
    'lop-pho': '🌺 Lớp phó',
    'sao-do': '🫡 Sao đỏ',
    'tuyen-duong': '🌹 Tuyên dương',
  };

  const nowIso = new Date().toISOString();
  const honorMsg: WaitingRoomChatItem = {
    id: `honor-${studentId}-${Date.now()}`,
    studentId,
    studentName,
    type: 'honor',
    text: `Thầy/Cô đã trao danh hiệu ${roleLabels[role]} cho ${studentName} (+3đ Tổ ${team})!`,
    timestampIso: nowIso,
  };

  return {
    ...state,
    studentRoles: {
      ...(state.studentRoles || {}),
      [studentId]: role,
    },
    team1Score: team === 1 ? state.team1Score + 3 : state.team1Score,
    team2Score: team === 2 ? state.team2Score + 3 : state.team2Score,
    feedMessages: [honorMsg, ...(state.feedMessages || [])].slice(0, 25),
    updatedAt: nowIso,
  };
}

/**
 * Appends a student or teacher greeting/comment to the waiting room live feed.
 */
export function appendWaitingRoomChatMessage(
  state: WaitingRoomState,
  params: {
    studentId: string;
    studentName: string;
    stationNumber?: string;
    text: string;
  }
): WaitingRoomState {
  const cleanText = (params.text || '').trim();
  if (!cleanText) return state;

  const nowIso = new Date().toISOString();
  const msg: WaitingRoomChatItem = {
    id: `chat-${params.studentId}-${Date.now()}`,
    studentId: params.studentId,
    studentName: params.studentName,
    stationNumber: params.stationNumber || '01',
    type: 'chat',
    text: cleanText,
    timestampIso: nowIso,
  };

  return {
    ...state,
    feedMessages: [msg, ...(state.feedMessages || [])].slice(0, 25),
    updatedAt: nowIso,
  };
}

export interface WaitingRoomJoinNotificationPayload {
  type: 'WAITING_ROOM_STUDENT_JOINED';
  notificationId: string;
  lessonKey: string;
  classId: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  studentId: string;
  studentName: string;
  stationNumber: string;
  team: 1 | 2;
  joinedCount: number;
  totalCount: number;
  timestampIso: string;
  waitingRoomState: WaitingRoomState;
}

/**
 * Formats a clear Vietnamese notification string for the teacher when a new student joins the waiting room.
 */
export function formatTeacherStudentJoinedAlertMessage(params: {
  studentName: string;
  stationNumber: string;
  classId: string;
  team: 1 | 2;
  joinedCount?: number;
  totalCount?: number;
}): string {
  const { studentName, stationNumber, classId, team, joinedCount, totalCount } = params;
  const countSuffix =
    typeof joinedCount === 'number' && typeof totalCount === 'number'
      ? ` (Sĩ số phòng chờ: ${joinedCount}/${totalCount} HS)`
      : '';
  return `🔔 Học sinh mới vào phòng chờ: ${studentName} (Máy #${stationNumber || '01'} • Lớp ${classId}) vừa ngồi vào bàn Tổ ${team}!${countSuffix}`;
}

/**
 * Builds the BroadcastChannel payload when a student newly joins the waiting room.
 */
export function buildWaitingRoomStudentJoinedBroadcastPayload(params: {
  lessonKey: string;
  classId: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  studentId: string;
  studentName: string;
  stationNumber?: string;
  team: 1 | 2;
  totalCount: number;
  waitingRoomState: WaitingRoomState;
}): WaitingRoomJoinNotificationPayload {
  const nowIso = new Date().toISOString();
  const joinedCount = (params.waitingRoomState.joinedStudentIds || []).length;
  return {
    type: 'WAITING_ROOM_STUDENT_JOINED',
    notificationId: `wr-join-${params.lessonKey}-${params.studentId}-${Date.now()}`,
    lessonKey: params.lessonKey,
    classId: params.classId,
    grade: params.grade,
    period: params.period,
    studentId: params.studentId,
    studentName: params.studentName,
    stationNumber: params.stationNumber || '01',
    team: params.team,
    joinedCount,
    totalCount: Math.max(joinedCount, params.totalCount),
    timestampIso: nowIso,
    waitingRoomState: params.waitingRoomState,
  };
}

/**
 * Detects which students newly joined by comparing previous and next joinedStudentIds.
 */
export function detectNewlyJoinedWaitingRoomStudents(
  prevJoinedIds: string[],
  nextJoinedIds: string[],
  allSeats: ClassroomDeskSeat[]
): ClassroomDeskSeat[] {
  const prevSet = new Set(prevJoinedIds || []);
  const newlyJoinedIds = (nextJoinedIds || []).filter((id) => !prevSet.has(id));
  if (newlyJoinedIds.length === 0) return [];
  const newlySet = new Set(newlyJoinedIds);
  return (allSeats || []).filter((seat) => newlySet.has(seat.studentId));
}

/**
 * Broadcasts a student join event and state sync over the existing 'cloudplay_realtime_sync' BroadcastChannel.
 */
export function broadcastWaitingRoomStudentJoined(
  payload: WaitingRoomJoinNotificationPayload,
  channelName = 'cloudplay_realtime_sync'
): boolean {
  try {
    if (typeof BroadcastChannel === 'undefined') return false;
    const bc = new BroadcastChannel(channelName);
    bc.postMessage(payload);
    bc.postMessage({
      type: 'WAITING_ROOM_SYNC',
      lessonKey: payload.lessonKey,
      waitingRoomState: payload.waitingRoomState,
    });
    bc.close();
    return true;
  } catch {
    return false;
  }
}

export interface BoundingBoxLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DeskCanvasOrigin {
  x: number;
  y: number;
  apexY: number;
  normalizedX: number;
  normalizedY: number;
  stationNumber?: string;
  team?: 1 | 2;
  rowIndex?: number;
  colIndex?: number;
}

export interface StationDesk25DCoordinates extends DeskCanvasOrigin {
  stationNumber: string; // '01' .. '42'
  stationIndex: number; // 1 .. 42
  label: string; // 'Máy #01' .. 'Máy #42'
  team: 1 | 2; // 1 (Tổ 1 - Left wing) | 2 (Tổ 2 - Right wing)
  deskIndexInTeam: number; // 0 .. 20
  rowIndex: number; // 0 .. 6 (7 rows per wing)
  colIndex: number; // 0 .. 2 (3 columns per wing)
}

export interface StationCoordinateOptions {
  containerWidth?: number;
  containerHeight?: number;
  totalDesks?: number;
  teamOverride?: 1 | 2;
  deskIndexInTeamOverride?: number;
}

export interface TableFireworkParticle {
  id: string;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'spark' | 'heart' | 'star' | 'ring';
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  drag: number;
  ringRadius?: number;
  maxRingRadius?: number;
}

/**
 * Parses any station number input (e.g., '01', '42', 'Máy #14', 'M#08', 8)
 * into a 1-based station index clamped strictly to [1..42].
 */
export function parseStationNumberIndex(
  stationInput: string | number | null | undefined
): number {
  if (typeof stationInput === 'number' && Number.isFinite(stationInput)) {
    return Math.min(42, Math.max(1, Math.round(stationInput)));
  }
  const raw = String(stationInput ?? '').trim();
  const match = raw.match(/(\d+)/);
  if (!match) return 1;
  const parsed = parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(42, parsed);
}

/**
 * Formats a station index or string into a standard 2-digit station code ('01' .. '42').
 */
export function formatStationCode(
  stationInput: string | number | null | undefined
): string {
  return String(parseStationNumberIndex(stationInput)).padStart(2, '0');
}

/**
 * Calculates the exact (x, y) and normalized [0..1] coordinates on the 2.5D classroom
 * layout for each station number (Máy #01 - Máy #42).
 *
 * Layout Geometry:
 * - 2 symmetric wings: TỔ 1 (Left wing, 3 columns) and TỔ 2 (Right wing, 3 columns), separated by the center aisle.
 * - Up to 42 stations (21 desks per wing = 7 rows × 3 columns per wing).
 * - Incorporates 2.5D perspective foreshortening across rows (front row near the teacher podium vs back row).
 */
export function getStationDesk25DCoordinates(
  stationInput: string | number | null | undefined,
  options: StationCoordinateOptions = {}
): StationDesk25DCoordinates {
  const stationIndex = parseStationNumberIndex(stationInput);
  const stationNumber = String(stationIndex).padStart(2, '0');
  const containerW =
    options.containerWidth && options.containerWidth > 0
      ? options.containerWidth
      : 1000;
  const containerH =
    options.containerHeight && options.containerHeight > 0
      ? options.containerHeight
      : 700;
  const totalDesks = Math.min(
    42,
    Math.max(6, options.totalDesks && options.totalDesks > 0 ? options.totalDesks : 42)
  );

  // Determine team (1 = Left Wing Tổ 1, 2 = Right Wing Tổ 2) and desk index within that wing
  const team: 1 | 2 =
    options.teamOverride ?? (stationIndex % 2 === 1 ? 1 : 2);
  const defaultDeskIndexInTeam = Math.floor((stationIndex - 1) / 2);
  const maxDesksPerWing = Math.max(1, Math.ceil(totalDesks / 2));
  const deskIndexInTeam = Math.min(
    maxDesksPerWing - 1,
    Math.max(
      0,
      typeof options.deskIndexInTeamOverride === 'number'
        ? options.deskIndexInTeamOverride
        : defaultDeskIndexInTeam
    )
  );

  const colsPerWing = 3;
  const totalRowsPerWing = Math.max(1, Math.ceil(maxDesksPerWing / colsPerWing));
  const rowIndex = Math.floor(deskIndexInTeam / colsPerWing);
  const colIndex = deskIndexInTeam % colsPerWing;

  // Vertical progress from front row (row 0, below chalkboard/teacher) to back row
  const rowProgress =
    totalRowsPerWing > 1 ? rowIndex / (totalRowsPerWing - 1) : 0;

  // 2.5D vertical mapping: floor desk area spans normalizedY [0.47 .. 0.89]
  const normalizedY = Math.min(
    0.92,
    Math.max(0.42, Number((0.47 + rowProgress * 0.42).toFixed(4)))
  );

  // 2.5D horizontal mapping for the 3 columns of TỔ 1 (left wing) and TỔ 2 (right wing)
  // Includes subtle 2.5D perspective convergence toward the center aisle on upper rows
  const leftWingCols = [0.105, 0.235, 0.365];
  const rightWingCols = [0.635, 0.765, 0.895];
  const perspectiveShift = (1 - rowProgress) * 0.012;

  const rawNormalizedX =
    team === 1
      ? leftWingCols[colIndex] + perspectiveShift
      : rightWingCols[colIndex] - perspectiveShift;
  const normalizedX = Math.min(
    0.94,
    Math.max(0.06, Number(rawNormalizedX.toFixed(4)))
  );

  const x = Math.round(normalizedX * containerW * 10) / 10;
  const y = Math.round(normalizedY * containerH * 10) / 10;
  const apexY = Math.max(
    32,
    Math.round((y - Math.min(95, containerH * 0.105)) * 10) / 10
  );

  return {
    stationNumber,
    stationIndex,
    label: `Máy #${stationNumber}`,
    team,
    deskIndexInTeam,
    rowIndex,
    colIndex,
    x,
    y,
    apexY,
    normalizedX,
    normalizedY,
  };
}

/**
 * Builds the complete 2.5D coordinate lookup map for all 42 stations (Máy #01 - Máy #42).
 * Indexed by both 2-digit station code ('01'..'42') and label ('Máy #01'..'Máy #42').
 */
export function buildAllStations25DCoordinateMap(
  options: Omit<StationCoordinateOptions, 'teamOverride' | 'deskIndexInTeamOverride'> = {}
): Record<string, StationDesk25DCoordinates> {
  const map: Record<string, StationDesk25DCoordinates> = {};
  for (let i = 1; i <= 42; i++) {
    const coord = getStationDesk25DCoordinates(i, {
      ...options,
      totalDesks: options.totalDesks ?? 42,
    });
    map[coord.stationNumber] = coord;
    map[coord.label] = coord;
    map[String(i)] = coord;
  }
  return map;
}

/**
 * Computes the exact canvas-local pixel coordinates and normalized [0..1] coordinates
 * for launching fireworks from a student's table.
 * - Uses live DOM bounding boxes (`deskRect` & `containerRect`) when available on screen.
 * - Deterministically resolves the exact 2.5D desk coordinates for the student's station (`Máy #01` - `Máy #42`)
 *   via `getStationDesk25DCoordinates` whenever DOM rects are unmeasured, ensuring fireworks ALWAYS launch
 *   at the student's designated desk rather than a random screen location.
 */
export function calculateDeskCanvasOrigin(
  deskRect: BoundingBoxLike | null | undefined,
  containerRect: BoundingBoxLike | null | undefined,
  stationMeta?: {
    stationNumber?: string | number;
    team?: 1 | 2;
    deskIndexInTeam?: number;
    totalDesks?: number;
  }
): DeskCanvasOrigin {
  const containerW =
    containerRect && containerRect.width > 0 ? containerRect.width : 1000;
  const containerH =
    containerRect && containerRect.height > 0 ? containerRect.height : 700;

  const fallbackStationCoord = getStationDesk25DCoordinates(
    stationMeta?.stationNumber ?? '01',
    {
      containerWidth: containerW,
      containerHeight: containerH,
      totalDesks: stationMeta?.totalDesks ?? 42,
      teamOverride: stationMeta?.team,
      deskIndexInTeamOverride: stationMeta?.deskIndexInTeam,
    }
  );

  if (!deskRect || !containerRect || deskRect.width <= 0 || deskRect.height <= 0) {
    return {
      x: fallbackStationCoord.x,
      y: fallbackStationCoord.y,
      apexY: fallbackStationCoord.apexY,
      normalizedX: fallbackStationCoord.normalizedX,
      normalizedY: fallbackStationCoord.normalizedY,
      stationNumber: fallbackStationCoord.stationNumber,
      team: fallbackStationCoord.team,
      rowIndex: fallbackStationCoord.rowIndex,
      colIndex: fallbackStationCoord.colIndex,
    };
  }

  const rawX = deskRect.left - containerRect.left + deskRect.width * 0.5;
  const rawY = deskRect.top - containerRect.top + deskRect.height * 0.38;

  const clampedX = Math.min(containerW - 24, Math.max(24, rawX));
  const clampedY = Math.min(containerH - 24, Math.max(36, rawY));
  const apexY = Math.max(32, clampedY - Math.min(95, deskRect.height * 0.85));

  return {
    x: Math.round(clampedX * 10) / 10,
    y: Math.round(clampedY * 10) / 10,
    apexY: Math.round(apexY * 10) / 10,
    normalizedX: Math.min(0.96, Math.max(0.04, clampedX / containerW)),
    normalizedY: Math.min(0.96, Math.max(0.04, clampedY / containerH)),
    stationNumber: fallbackStationCoord.stationNumber,
    team: fallbackStationCoord.team,
    rowIndex: fallbackStationCoord.rowIndex,
    colIndex: fallbackStationCoord.colIndex,
  };
}

/**
 * Creates a rich set of custom canvas firework particles (shockwave rings, radial sparks,
 * floating hearts, and golden stars) launching directly from the student's table location.
 */
export function createTableFireworkBurstParticles(params: {
  originX: number;
  originY: number;
  team?: 1 | 2;
  burstId?: string;
}): TableFireworkParticle[] {
  const { originX, originY, team = 1, burstId = `fw-${Date.now()}` } = params;
  const palette =
    team === 1
      ? ['#f43f5e', '#fbbf24', '#ec4899', '#fde047', '#fb7185', '#ffffff', '#a855f7']
      : ['#38bdf8', '#fbbf24', '#ec4899', '#34d399', '#fde047', '#f43f5e', '#ffffff'];

  const particles: TableFireworkParticle[] = [];

  // 1. Dual expanding shockwave rings at the table position
  particles.push({
    id: `${burstId}-ring-1`,
    x: originX,
    y: originY,
    prevX: originX,
    prevY: originY,
    vx: 0,
    vy: 0,
    color: team === 1 ? '#fb7185' : '#38bdf8',
    shape: 'ring',
    size: 3,
    alpha: 0.95,
    decay: 0.022,
    gravity: 0,
    drag: 1,
    ringRadius: 8,
    maxRingRadius: 96,
  });

  particles.push({
    id: `${burstId}-ring-2`,
    x: originX,
    y: originY,
    prevX: originX,
    prevY: originY,
    vx: 0,
    vy: 0,
    color: '#fde047',
    shape: 'ring',
    size: 2.2,
    alpha: 0.85,
    decay: 0.026,
    gravity: 0,
    drag: 1,
    ringRadius: 4,
    maxRingRadius: 68,
  });

  // 2. Radial firework chrysanthemum sparks & stars (36 particles)
  const radialCount = 36;
  for (let i = 0; i < radialCount; i++) {
    const baseAngle = (Math.PI * 2 * i) / radialCount;
    const jitter = ((i % 3) - 1) * 0.06;
    const angle = baseAngle + jitter;
    const speedTier = i % 3 === 0 ? 5.8 : i % 2 === 0 ? 4.2 : 2.9;
    const vx = Math.cos(angle) * speedTier;
    const vy = Math.sin(angle) * speedTier - 1.35; // slight upward launch bias from the desk
    const shape: TableFireworkParticle['shape'] =
      i % 6 === 0 ? 'heart' : i % 4 === 0 ? 'star' : 'spark';

    particles.push({
      id: `${burstId}-p-${i}`,
      x: originX,
      y: originY,
      prevX: originX,
      prevY: originY,
      vx,
      vy,
      color: palette[i % palette.length],
      shape,
      size: shape === 'heart' ? 7.5 : shape === 'star' ? 6.2 : 3.4,
      alpha: 1,
      decay: 0.014 + (i % 4) * 0.003,
      gravity: 0.09,
      drag: 0.975,
    });
  }

  // 3. Upward fountain of glowing hearts & golden sparks rising from the student's table (12 particles)
  for (let j = 0; j < 12; j++) {
    const spreadAngle = -Math.PI / 2 + ((j - 5.5) / 6) * 0.65;
    const speed = 3.6 + (j % 4) * 0.85;
    particles.push({
      id: `${burstId}-fountain-${j}`,
      x: originX + ((j % 3) - 1) * 8,
      y: originY,
      prevX: originX,
      prevY: originY,
      vx: Math.cos(spreadAngle) * speed,
      vy: Math.sin(spreadAngle) * speed - 0.8,
      color: j % 2 === 0 ? '#f43f5e' : '#fde047',
      shape: j % 2 === 0 ? 'heart' : 'star',
      size: j % 2 === 0 ? 8.2 : 6.5,
      alpha: 1,
      decay: 0.013,
      gravity: 0.055,
      drag: 0.985,
    });
  }

  return particles;
}

/**
 * Advances all active firework particles by `frameScale` (default 1 = 60fps frame)
 * and removes particles whose alpha has decayed below visibility.
 */
export function stepFireworkBurstParticles(
  particles: TableFireworkParticle[],
  frameScale = 1
): TableFireworkParticle[] {
  const next: TableFireworkParticle[] = [];
  const scale = Math.min(2.5, Math.max(0.2, frameScale));

  for (const p of particles) {
    const nextAlpha = p.alpha - p.decay * scale;
    if (nextAlpha <= 0.02) continue;

    if (p.shape === 'ring') {
      const currentR = p.ringRadius ?? 6;
      const maxR = p.maxRingRadius ?? 90;
      const nextR = currentR + (maxR - currentR) * 0.14 * scale;
      next.push({
        ...p,
        ringRadius: nextR,
        alpha: nextAlpha,
      });
      continue;
    }

    const dragFactor = Math.pow(p.drag, scale);
    const nextVx = p.vx * dragFactor;
    const nextVy = p.vy * dragFactor + p.gravity * scale;
    const nextX = p.x + nextVx * scale;
    const nextY = p.y + nextVy * scale;

    next.push({
      ...p,
      prevX: p.x,
      prevY: p.y,
      x: nextX,
      y: nextY,
      vx: nextVx,
      vy: nextVy,
      alpha: nextAlpha,
    });
  }

  return next;
}


