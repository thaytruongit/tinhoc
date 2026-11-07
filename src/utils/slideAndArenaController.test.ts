import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePresenterKeyAction,
  isStudentLiveViewUnlocked,
  computeArenaRemainingSeconds,
  formatCountdownMmSs,
  estimateBase64Bytes,
  getArenaCountdownVisualState,
  buildStartLiveSessionStandbyState,
  buildBroadcastSingleActivityState,
  buildStopSingleActivityState,
  isActivityFinalized,
  buildToggleFinalizeActivityState,
  normalizeActivityKey,
  normalizeLiveSession,
  normalizeStudentRosterList,
  normalizeClassroomList,
  filterTeacherPortalStudents,
  computeStudentFilterSummary,
  getEffectiveStudentSubmissionStatus,
} from './slideAndArenaController';

test('resolvePresenterKeyAction handles Space, ArrowRight, PageDown, ArrowLeft, PageUp, F (fullscreen), and Escape for wireless clicker', () => {
  assert.equal(resolvePresenterKeyAction(' ', 'Space', 'DIV', false), 'next');
  assert.equal(resolvePresenterKeyAction('ArrowRight', 'ArrowRight', 'BODY', false), 'next');
  assert.equal(resolvePresenterKeyAction('PageDown', 'PageDown', 'BUTTON', false), 'next');
  assert.equal(resolvePresenterKeyAction('ArrowLeft', 'ArrowLeft', 'DIV', false), 'prev');
  assert.equal(resolvePresenterKeyAction('PageUp', 'PageUp', 'DIV', false), 'prev');
  assert.equal(resolvePresenterKeyAction('f', 'KeyF', 'DIV', false), 'fullscreen');
  assert.equal(resolvePresenterKeyAction('F', 'KeyF', 'BODY', false), 'fullscreen');
  assert.equal(resolvePresenterKeyAction('Escape', 'Escape', 'BODY', false), 'exit-fullscreen');

  // Ignored when inside input/textarea/select
  assert.equal(resolvePresenterKeyAction(' ', 'Space', 'INPUT', false), null);
  assert.equal(resolvePresenterKeyAction('ArrowRight', 'ArrowRight', 'TEXTAREA', false), null);
  assert.equal(resolvePresenterKeyAction('ArrowRight', 'ArrowRight', 'DIV', true), null);
  assert.equal(resolvePresenterKeyAction('f', 'KeyF', 'INPUT', false), null);
});

test('isStudentLiveViewUnlocked and isolated activity builders enforce standby on Live start, isolated per-activity broadcast, and clean stop', () => {
  // 1. Entering Live period starts in standby ('waiting') with zero activities auto-activated
  const initialStandby = buildStartLiveSessionStandbyState(
    {
      isBroadcasting: false,
      activeGrade: 6,
      activePeriod: 1,
      activeStage: 1,
      activeClassId: '6A10',
      unlockedStagesByLesson: { 'k6-tiet-1': { 1: true, 2: true, 3: true, 4: true } },
    },
    { grade: 6, period: 1, classId: '6A10' }
  );
  assert.equal(initialStandby.isBroadcasting, true);
  assert.equal(initialStandby.activeLiveView, 'waiting');
  assert.deepEqual(initialStandby.unlockedStagesByLesson['k6-tiet-1'], {
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // 2. Broadcasting Hoạt động 2 unlocks ONLY Hoạt động 2 (does not affect HĐ 1, 3, 4)
  const hd2Session = buildBroadcastSingleActivityState(initialStandby, {
    grade: 6,
    period: 1,
    classId: '6A10',
    activity: 'hd2',
  });
  assert.equal(hd2Session.activeLiveView, 'hd2');
  assert.deepEqual(hd2Session.unlockedStagesByLesson['k6-tiet-1'], {
    1: false,
    2: true,
    3: false,
    4: false,
  });
  const hd2Params = {
    teacherActiveView: hd2Session.activeLiveView,
    unlockedStages: hd2Session.unlockedStagesByLesson['k6-tiet-1'],
    teacherCurrentStage: 2,
  };
  assert.equal(isStudentLiveViewUnlocked({ ...hd2Params, viewId: 1 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...hd2Params, viewId: 2 }), true);
  assert.equal(isStudentLiveViewUnlocked({ ...hd2Params, viewId: 3 }), false);

  // 3. Stopping Hoạt động 2 stops cleanly at 'waiting'
  const stoppedHd2 = buildStopSingleActivityState(hd2Session, 'k6-tiet-1');
  assert.equal(stoppedHd2.activeLiveView, 'waiting');
  assert.deepEqual(stoppedHd2.unlockedStagesByLesson['k6-tiet-1'], {
    1: false,
    2: false,
    3: false,
    4: false,
  });
});

test('computeArenaRemainingSeconds and formatCountdownMmSs calculate accurate countdown', () => {
  const startIso = '2026-05-01T10:00:00.000Z';
  const startMs = Date.parse(startIso);
  const state = {
    isRunning: true,
    durationSec: 300,
    startedAtIso: startIso,
  };

  const remAfter65s = computeArenaRemainingSeconds(state, startMs + 65_000);
  assert.equal(remAfter65s, 235);
  assert.equal(formatCountdownMmSs(remAfter65s), '03:55');
});

test('getArenaCountdownVisualState transitions colors from normal to warning, critical, and expired', () => {
  const normal = getArenaCountdownVisualState(240, 300);
  assert.equal(normal.urgencyLevel, 'normal');
  assert.equal(normal.percent, 80);

  const warning = getArenaCountdownVisualState(90, 300);
  assert.equal(warning.urgencyLevel, 'warning');
  assert.equal(warning.percent, 30);

  const critical = getArenaCountdownVisualState(45, 300);
  assert.equal(critical.urgencyLevel, 'critical');
  assert.equal(critical.percent, 15);

  const expired = getArenaCountdownVisualState(0, 300);
  assert.equal(expired.urgencyLevel, 'expired');
  assert.equal(expired.percent, 0);
});

test('estimateBase64Bytes computes accurate size', () => {
  assert.equal(estimateBase64Bytes('data:image/webp;base64,AAAA'), 3);
});

test('normalizeLiveSession, normalizeStudentRosterList, and normalizeClassroomList protect against malformed DB payloads', () => {
  const defaultSess = {
    isBroadcasting: false,
    activeGrade: 6,
    activePeriod: 1,
    activeStage: 1,
    activeClassId: '6A10',
    unlockedStagesByLesson: { 'k6-tiet-1': { 1: true, 2: false, 3: false, 4: false } },
    verifiedLessonsMap: { 'k6-tiet-1': true },
    updatedAt: '2026-05-01T00:00:00.000Z',
  };

  // Rejects diagnostic payload
  const fromDiag = normalizeLiveSession({ testMessage: 'diag', updatedAt: '2026-05-02T00:00:00.000Z' }, defaultSess);
  assert.equal(fromDiag.unlockedStagesByLesson['k6-tiet-1'][1], true);

  // Normalizes snake_case students from Supabase
  const normStudents = normalizeStudentRosterList([
    { id: '61001', full_name: 'Bùi Minh Anh', class_id: '6A10', xp: 250 },
  ]);
  assert.equal(normStudents[0].name, 'Bùi Minh Anh');
  assert.equal(normStudents[0].classId, '6A10');

  const normClasses = normalizeClassroomList([
    { id: '6A10', name: 'Lớp 6A10', grade: 6, school_year: '2025-2026' },
  ]);
  assert.equal(normClasses[0].schoolYear, '2025-2026');
});

test('activity finalization ("Chốt hoạt động") toggles and locks submission independently per exercise and activity', () => {
  const lessonKey = 'k6-tiet-1';
  let session: any = {
    isBroadcasting: true,
    activeGrade: 6,
    activePeriod: 1,
    finalizedActivitiesByLesson: {},
  };

  // Initially nothing is finalized
  assert.equal(isActivityFinalized(session, lessonKey, 1), false);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_drag'), false);

  // 1. Finalize Activity 1
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 1,
    activityTitle: 'Hoạt động 1: Khởi động',
  });
  assert.equal(isActivityFinalized(session, lessonKey, 1), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd1'), true);
  // Other activities remain unlocked
  assert.equal(isActivityFinalized(session, lessonKey, 2), false);
  assert.equal(isActivityFinalized(session, lessonKey, 3), false);

  // 2. Finalize single exercise in Activity 2: Kéo thả
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 'hd2_drag',
    activityTitle: 'Hoạt động 2: Kéo thả',
  });
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_drag'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_fill'), false);

  // 3. Finalize entire Activity 2 -> auto locks all sub-exercises
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 2,
    activityTitle: 'Hoạt động 2: Khám phá',
  });
  assert.equal(isActivityFinalized(session, lessonKey, 2), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_fill'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_match'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_short'), true);

  // 4. Unfinalize Activity 1
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 1,
    finalized: false,
  });
  assert.equal(isActivityFinalized(session, lessonKey, 1), false);
});

test('normalizeActivityKey standardizes alias formats', () => {
  assert.equal(normalizeActivityKey('1'), '1');
  assert.equal(normalizeActivityKey('hd1'), '1');
  assert.equal(normalizeActivityKey('stage1'), '1');
  assert.equal(normalizeActivityKey('drag'), 'hd2_drag');
  assert.equal(normalizeActivityKey('keo-tha'), 'hd2_drag');
  assert.equal(normalizeActivityKey('tu-luan'), 'hd2_short');
  assert.equal(normalizeActivityKey('practice'), 'hd3-practice');
});

test('filterTeacherPortalStudents and computeStudentFilterSummary filter accurately by grade, class, submission, and group', () => {
  const sampleStudents = [
    { id: '61001', name: 'Nguyễn Văn A', classId: '6A1', grade: 6, groupNumber: 1, submissionStatus: 'Đã nộp' },
    { id: '61002', name: 'Trần Thị B', classId: '6A1', grade: 6, groupNumber: 2, submissionStatus: 'Chưa nộp' },
    { id: '61003', name: 'Lê Văn C', classId: '6A1', grade: 6, groupNumber: 1, submissionStatus: 'Đã nộp' },
    { id: '71001', name: 'Phạm Thị D', classId: '7A1', grade: 7, groupNumber: 3, submissionStatus: 'Chưa nộp' },
  ];

  // Grade filter
  const grade6Only = filterTeacherPortalStudents(sampleStudents, { gradeFilter: 6 });
  assert.equal(grade6Only.length, 3);

  // Class filter
  const class6A1 = filterTeacherPortalStudents(sampleStudents, { classFilter: '6A1' });
  assert.equal(class6A1.length, 3);

  // Submission status filter
  const submittedOnly = filterTeacherPortalStudents(sampleStudents, {
    classFilter: '6A1',
    submissionStatusFilter: 'Đã nộp',
  });
  assert.equal(submittedOnly.length, 2);

  // Group filter
  const group1Only = filterTeacherPortalStudents(sampleStudents, {
    classFilter: '6A1',
    groupFilter: 1,
  });
  assert.equal(group1Only.length, 2);

  // Summary counts
  const summary = computeStudentFilterSummary(sampleStudents, { classFilter: '6A1' });
  assert.equal(summary.total, 3);
  assert.equal(summary.submittedCount, 2);
  assert.equal(summary.notSubmittedCount, 1);
  assert.equal(summary.groupCounts[1], 2);
  assert.equal(summary.groupCounts[2], 1);
  assert.equal(summary.groupCounts[3], 0);

  // Live session submission override
  const effectiveStatus = getEffectiveStudentSubmissionStatus(
    { id: '61002', submissionStatus: 'Chưa nộp' },
    { taggedSubmissions: [{ studentId: '61002' }] }
  );
  assert.equal(effectiveStatus, 'Đã nộp');
});
