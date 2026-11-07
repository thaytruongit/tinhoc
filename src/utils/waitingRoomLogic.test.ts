import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDesignatedClassDeskRoster,
  createInitialWaitingRoomState,
  registerStudentJoinWaitingRoom,
  admitAllClassStudentsToWaitingRoom,
  submitWaitingRoomQuickAnswer,
  assignWaitingRoomHonorRole,
  getWaitingRoomChalkboardQuizzes,
  formatTeacherStudentJoinedAlertMessage,
  buildWaitingRoomStudentJoinedBroadcastPayload,
  detectNewlyJoinedWaitingRoomStudents,
  calculateDeskCanvasOrigin,
  getStationDesk25DCoordinates,
  buildAllStations25DCoordinateMap,
  parseStationNumberIndex,
  formatStationCode,
  createTableFireworkBurstParticles,
  stepFireworkBurstParticles,
} from './waitingRoomLogic';
import { INITIAL_STUDENTS } from '../data/mockCurriculumData';

test('buildDesignatedClassDeskRoster filters designated class and splits equally into Tổ 1 and Tổ 2', () => {
  const { allSeats, team1Seats, team2Seats } = buildDesignatedClassDeskRoster(
    INITIAL_STUDENTS,
    '6A10',
    6,
    18
  );
  assert.equal(allSeats.length, 18);
  assert.equal(team1Seats.length, 9);
  assert.equal(team2Seats.length, 9);
  assert.ok(allSeats.every((s) => s.classId === '6A10'));
});

test('registerStudentJoinWaitingRoom only admits students of the designated classId', () => {
  const state = createInitialWaitingRoomState({
    classId: '6A10',
    grade: 6,
    period: 1,
    students: INITIAL_STUDENTS,
    preJoinRealStudents: false,
  });
  assert.equal(state.joinedStudentIds.length, 0);

  // Reject student from wrong class (7A10)
  const wrongClassRes = registerStudentJoinWaitingRoom(state, {
    id: '71001',
    name: 'Hoàng Gia Bảo',
    classId: '7A10',
    stationNumber: '01',
    team: 1,
  });
  assert.equal(wrongClassRes.accepted, false);
  assert.equal(wrongClassRes.nextState.joinedStudentIds.length, 0);

  // Accept student from designated class (6A10)
  const rightClassRes = registerStudentJoinWaitingRoom(state, {
    id: '61008',
    name: 'Nguyễn Hoàng Nam',
    classId: '6A10',
    stationNumber: '08',
    team: 1,
  });
  assert.equal(rightClassRes.accepted, true);
  assert.equal(rightClassRes.alreadyJoined, false);
  assert.ok(rightClassRes.nextState.joinedStudentIds.includes('61008'));
  assert.equal(rightClassRes.nextState.team1Score, state.team1Score + 1);
});

test('submitWaitingRoomQuickAnswer records answer and awards +2 team points on correct choice', () => {
  const state = createInitialWaitingRoomState({
    classId: '6A10',
    grade: 6,
    period: 1,
    students: INITIAL_STUDENTS,
    preJoinRealStudents: true,
  });
  const prevT2 = state.team2Score;
  const updated = submitWaitingRoomQuickAnswer(state, {
    studentId: '61012',
    studentName: 'Đỗ Tuấn Minh',
    stationNumber: '12',
    choice: 'A',
    isCorrect: true,
    team: 2,
  });
  assert.equal(updated.studentQuickAnswers['61012'], 'A');
  assert.equal(updated.team2Score, prevT2 + 2);
});

test('assignWaitingRoomHonorRole assigns role and increments team score', () => {
  const state = createInitialWaitingRoomState({
    classId: '6A10',
    grade: 6,
    period: 1,
    students: INITIAL_STUDENTS,
    preJoinRealStudents: true,
  });
  const prevT1 = state.team1Score;
  const updated = assignWaitingRoomHonorRole(state, {
    studentId: '61008',
    studentName: 'Nguyễn Hoàng Nam',
    role: 'tuyen-duong',
    team: 1,
  });
  assert.equal(updated.studentRoles['61008'], 'tuyen-duong');
  assert.equal(updated.team1Score, prevT1 + 3);
});

test('admitAllClassStudentsToWaitingRoom seats all students in the designated class', () => {
  const { allSeats } = buildDesignatedClassDeskRoster(INITIAL_STUDENTS, '6A10', 6, 18);
  const state = createInitialWaitingRoomState({
    classId: '6A10',
    grade: 6,
    period: 1,
    students: INITIAL_STUDENTS,
    preJoinRealStudents: false,
  });
  const next = admitAllClassStudentsToWaitingRoom(state, allSeats);
  assert.equal(next.joinedStudentIds.length, 18);
});

test('getWaitingRoomChalkboardQuizzes returns valid 3-choice quizzes', () => {
  const quizzes = getWaitingRoomChalkboardQuizzes(6, 1, 'Thông tin và dữ liệu');
  assert.ok(quizzes.length >= 3);
  assert.equal(quizzes[0].options.length, 3);
  assert.ok(quizzes[0].options.some((o) => o.isCorrect));
});

test('buildWaitingRoomStudentJoinedBroadcastPayload and detectNewlyJoinedWaitingRoomStudents work accurately', () => {
  const { allSeats } = buildDesignatedClassDeskRoster(INITIAL_STUDENTS, '6A10', 6, 18);
  const state = createInitialWaitingRoomState({
    classId: '6A10',
    grade: 6,
    period: 1,
    students: INITIAL_STUDENTS,
    preJoinRealStudents: false,
  });
  const targetSeat = allSeats[0];
  const joinRes = registerStudentJoinWaitingRoom(state, {
    id: targetSeat.studentId,
    name: targetSeat.studentName,
    classId: targetSeat.classId,
    stationNumber: targetSeat.stationNumber,
    team: targetSeat.team,
  });

  const newlyJoined = detectNewlyJoinedWaitingRoomStudents(
    state.joinedStudentIds,
    joinRes.nextState.joinedStudentIds,
    allSeats
  );
  assert.equal(newlyJoined.length, 1);
  assert.equal(newlyJoined[0].studentId, targetSeat.studentId);

  const payload = buildWaitingRoomStudentJoinedBroadcastPayload({
    lessonKey: 'k6-tiet-1',
    classId: '6A10',
    grade: 6,
    period: 1,
    studentId: targetSeat.studentId,
    studentName: targetSeat.studentName,
    stationNumber: targetSeat.stationNumber,
    team: targetSeat.team,
    totalCount: allSeats.length,
    waitingRoomState: joinRes.nextState,
  });
  assert.equal(payload.type, 'WAITING_ROOM_STUDENT_JOINED');
  assert.equal(payload.studentId, targetSeat.studentId);
  assert.equal(payload.joinedCount, 1);
  assert.equal(payload.totalCount, allSeats.length);

  const alertMsg = formatTeacherStudentJoinedAlertMessage({
    studentName: payload.studentName,
    stationNumber: payload.stationNumber,
    classId: payload.classId,
    team: payload.team,
    joinedCount: payload.joinedCount,
    totalCount: payload.totalCount,
  });
  assert.ok(alertMsg.includes(targetSeat.studentName));
  assert.ok(alertMsg.includes('Lớp 6A10'));
  assert.ok(alertMsg.includes(`1/${allSeats.length} HS`));
});

test('calculateDeskCanvasOrigin and table firework particle physics step accurately', () => {
  const containerRect = { left: 100, top: 50, width: 1000, height: 800 };
  const deskRect = { left: 310, top: 450, width: 80, height: 100 };

  const origin = calculateDeskCanvasOrigin(deskRect, containerRect);
  // x should be (310 - 100) + 40 = 250
  assert.equal(origin.x, 250);
  // y should be (450 - 50) + 38 = 438
  assert.equal(origin.y, 438);
  assert.equal(origin.normalizedX, 0.25);
  assert.ok(origin.apexY < origin.y);

  const initialParticles = createTableFireworkBurstParticles({
    originX: origin.x,
    originY: origin.y,
    team: 1,
    burstId: 'test-burst',
  });
  assert.equal(initialParticles.length, 50); // 2 rings + 36 radial + 12 fountain
  assert.ok(initialParticles.some((p) => p.shape === 'heart'));
  assert.ok(initialParticles.some((p) => p.shape === 'star'));
  assert.ok(initialParticles.some((p) => p.shape === 'ring'));

  const stepped = stepFireworkBurstParticles(initialParticles, 1);
  assert.equal(stepped.length, 50);
  assert.ok(stepped[0].alpha < initialParticles[0].alpha);
});

test('getStationDesk25DCoordinates and buildAllStations25DCoordinateMap compute unique (x, y) for Máy #01 - Máy #42', () => {
  assert.equal(parseStationNumberIndex('Máy #01'), 1);
  assert.equal(parseStationNumberIndex('M#42'), 42);
  assert.equal(parseStationNumberIndex(14), 14);
  assert.equal(formatStationCode(8), '08');

  const map = buildAllStations25DCoordinateMap({
    containerWidth: 1200,
    containerHeight: 800,
    totalDesks: 42,
  });

  const uniqueXY = new Set<string>();
  for (let i = 1; i <= 42; i++) {
    const code = String(i).padStart(2, '0');
    const coord = map[code];
    assert.ok(coord, `Station ${code} must exist in map`);
    assert.equal(coord.stationNumber, code);
    assert.equal(coord.label, `Máy #${code}`);
    assert.equal(map[`Máy #${code}`].x, coord.x);

    // Odd stations default to Tổ 1 (Left Wing, normalizedX < 0.45), Even stations to Tổ 2 (Right Wing, normalizedX > 0.55)
    if (i % 2 === 1) {
      assert.equal(coord.team, 1);
      assert.ok(coord.normalizedX < 0.45, `Station #${code} should be on Left Wing`);
    } else {
      assert.equal(coord.team, 2);
      assert.ok(coord.normalizedX > 0.55, `Station #${code} should be on Right Wing`);
    }

    uniqueXY.add(`${coord.x},${coord.y}`);
  }

  // Every single station from Máy #01 to Máy #42 must have a distinct (x, y) coordinate on the 2.5D classroom
  assert.equal(uniqueXY.size, 42);

  // Front row (Máy #01, row 0) must be higher up (smaller Y) than back row (Máy #41, row 6)
  const frontLeft = getStationDesk25DCoordinates('Máy #01', {
    containerWidth: 1200,
    containerHeight: 800,
  });
  const backLeft = getStationDesk25DCoordinates('Máy #41', {
    containerWidth: 1200,
    containerHeight: 800,
  });
  assert.equal(frontLeft.rowIndex, 0);
  assert.equal(backLeft.rowIndex, 6);
  assert.ok(frontLeft.y < backLeft.y);

  // Fallback in calculateDeskCanvasOrigin without DOM rects uses exact station 2.5D coordinates
  const fallbackOrigin14 = calculateDeskCanvasOrigin(null, { left: 0, top: 0, width: 1200, height: 800 }, {
    stationNumber: '14',
    team: 2,
  });
  assert.equal(fallbackOrigin14.x, map['14'].x);
  assert.equal(fallbackOrigin14.y, map['14'].y);
  assert.equal(fallbackOrigin14.stationNumber, '14');
});



