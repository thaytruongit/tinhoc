import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePresenterKeyAction,
  isStudentLiveViewUnlocked,
  computeArenaRemainingSeconds,
  formatCountdownMmSs,
  estimateBase64Bytes,
  isFileStorageSlideUrl,
  getArenaCountdownVisualState,
  generateFallbackSlideSvgDataUrl,
  buildEndSlidePresentationState,
  buildStartLiveSessionStandbyState,
  buildBroadcastSingleActivityState,
  buildStopSingleActivityState,
  isActivityFinalized,
  buildToggleFinalizeActivityState,
  normalizeActivityKey,
  normalizeLiveSession,
  normalizeStudentRosterList,
  normalizeClassroomList,
} from './slideAndArenaController';

test('resolvePresenterKeyAction handles Space, ArrowRight, PageDown, ArrowLeft, PageUp for wireless clicker', () => {
  assert.equal(resolvePresenterKeyAction(' ', 'Space', 'DIV', false), 'next');
  assert.equal(resolvePresenterKeyAction('ArrowRight', 'ArrowRight', 'BODY', false), 'next');
  assert.equal(resolvePresenterKeyAction('PageDown', 'PageDown', 'BUTTON', false), 'next');
  assert.equal(resolvePresenterKeyAction('ArrowLeft', 'ArrowLeft', 'DIV', false), 'prev');
  assert.equal(resolvePresenterKeyAction('PageUp', 'PageUp', 'DIV', false), 'prev');

  // Ignored when inside input/textarea/select
  assert.equal(resolvePresenterKeyAction(' ', 'Space', 'INPUT', false), null);
  assert.equal(resolvePresenterKeyAction('ArrowRight', 'ArrowRight', 'TEXTAREA', false), null);
  assert.equal(resolvePresenterKeyAction('ArrowRight', 'ArrowRight', 'DIV', true), null);
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

  // 2. Broadcasting Slide unlocks only Slide
  const slideSession = buildBroadcastSingleActivityState(initialStandby, {
    grade: 6,
    period: 1,
    classId: '6A10',
    activity: 'slide',
    slideIndex: 2,
    slideSyncVersion: 1000,
  });
  assert.equal(slideSession.activeLiveView, 'slide');
  assert.equal(slideSession.unlockedSlideDeckByLesson['k6-tiet-1'], true);
  assert.deepEqual(slideSession.unlockedStagesByLesson['k6-tiet-1'], {
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // 3. Ending Slide stops at 'waiting' and locks all views
  const endedSlide = buildEndSlidePresentationState(slideSession, 'k6-tiet-1');
  assert.equal(endedSlide.activeLiveView, 'waiting');
  assert.equal(endedSlide.unlockedSlideDeckByLesson['k6-tiet-1'], false);
  const afterSlideEndParams = {
    teacherActiveView: endedSlide.activeLiveView,
    isSlideDeckUnlocked: endedSlide.unlockedSlideDeckByLesson['k6-tiet-1'],
    isPracticeStage3Unlocked: endedSlide.unlockedPracticeStage3ByLesson['k6-tiet-1'],
    unlockedStages: endedSlide.unlockedStagesByLesson['k6-tiet-1'],
    teacherCurrentStage: 1,
  };
  assert.equal(isStudentLiveViewUnlocked({ ...afterSlideEndParams, viewId: 'slide' }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...afterSlideEndParams, viewId: 1 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...afterSlideEndParams, viewId: 2 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...afterSlideEndParams, viewId: 3 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...afterSlideEndParams, viewId: 4 }), false);

  // 4. Broadcasting Hoạt động 2 unlocks ONLY Hoạt động 2 (does not affect HĐ 1, 3, 4)
  const hd2Session = buildBroadcastSingleActivityState(endedSlide, {
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
    isSlideDeckUnlocked: hd2Session.unlockedSlideDeckByLesson['k6-tiet-1'],
    isPracticeStage3Unlocked: hd2Session.unlockedPracticeStage3ByLesson['k6-tiet-1'],
    unlockedStages: hd2Session.unlockedStagesByLesson['k6-tiet-1'],
    teacherCurrentStage: 2,
  };
  assert.equal(isStudentLiveViewUnlocked({ ...hd2Params, viewId: 1 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...hd2Params, viewId: 2 }), true);
  assert.equal(isStudentLiveViewUnlocked({ ...hd2Params, viewId: 3 }), false);

  // 5. Stopping Hoạt động 2 stops cleanly at 'waiting'
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

test('file storage helpers detect file storage URLs, estimate base64 bytes, and generate SVG slide fallback', () => {
  assert.equal(isFileStorageSlideUrl('/api/file-storage/slides/file/slide-k6-t1-p1.webp'), true);
  assert.equal(isFileStorageSlideUrl('data:image/jpeg;base64,abcd'), false);
  assert.equal(estimateBase64Bytes('data:image/webp;base64,AAAA'), 3);

  const svgUrl = generateFallbackSlideSvgDataUrl({
    grade: 6,
    period: 1,
    slideIndex: 0,
    totalSlides: 5,
    title: 'Bài 1: Thông tin và dữ liệu',
    bulletPoints: ['Thông tin là những gì đem lại hiểu biết'],
  });
  assert.equal(svgUrl.startsWith('data:image/svg+xml;utf8,'), true);
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
    activityTitle: 'Bài tập 1: Kéo thả',
  });
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_drag'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_fill'), false);
  assert.equal(isActivityFinalized(session, lessonKey, 2), false); // Entire HĐ 2 not yet locked

  // 3. Finalize entire Activity 2 -> cascades lock to all sub-exercises
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 2,
    activityTitle: 'Hoạt động 2: Khám phá',
  });
  assert.equal(isActivityFinalized(session, lessonKey, 2), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_fill'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 'hd2_match'), true);

  // 4. Finalize Practical activity in Activity 3
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 'hd3-practice',
    activityTitle: 'HĐ 3: Thực hành máy tính',
  });
  assert.equal(isActivityFinalized(session, lessonKey, 'hd3-practice'), true);
  assert.equal(isActivityFinalized(session, lessonKey, 3), false); // Arena 25s still open

  // 5. Unlocking/reopening Activity 1 works
  session = buildToggleFinalizeActivityState(session, {
    lessonKey,
    activityKey: 1,
    finalized: false,
  });
  assert.equal(isActivityFinalized(session, lessonKey, 1), false);
});

test('normalizeLiveSession ensures every slide has valid imageUrl and merges fallback images so slides never degrade to plain text on reload', () => {
  const defaultSess: any = {
    activeGrade: 6,
    activePeriod: 1,
    lectureSlidesByLesson: {
      'k6-tiet-1': {
        grade: 6,
        period: 1,
        isUserUploaded: true,
        slides: [
          {
            slideNumber: 1,
            title: 'Tiết 1 - Slide 1',
            bulletPoints: ['Gốc từ ban đầu'],
            imageUrl: '/api/file-storage/slides/file/initial-slide-1.webp',
          },
        ],
      },
    },
  };

  // Simulate a raw session from localStorage or DB where imageUrl was lost, stripped or empty
  const rawSessionWithEmptyImages = {
    activeGrade: 6,
    activePeriod: 1,
    lectureSlidesByLesson: {
      'k6-tiet-1': {
        grade: 6,
        period: 1,
        slides: [
          {
            slideNumber: 1,
            title: 'Tiết 1 - Slide 1',
            bulletPoints: ['Nội dung mới'],
            imageUrl: '', // stripped or empty
          },
          {
            slideNumber: 2,
            title: 'Tiết 1 - Slide 2 (Mới thêm)',
            bulletPoints: ['Điểm 2'],
            // no imageUrl provided
          },
        ],
      },
    },
  };

  const normalized = normalizeLiveSession(rawSessionWithEmptyImages, defaultSess);
  const deck = normalized.lectureSlidesByLesson['k6-tiet-1'];
  assert.equal(deck.slides.length, 2);

  // Slide 1 should recover imageUrl from fallback
  assert.equal(deck.slides[0].imageUrl, '/api/file-storage/slides/file/initial-slide-1.webp');

  // Slide 2 should have guaranteed high-fidelity SVG slide image data URL instead of empty string
  assert.ok(typeof deck.slides[1].imageUrl === 'string');
  assert.ok(deck.slides[1].imageUrl.length > 50);
  assert.ok(deck.slides[1].imageUrl.startsWith('data:image/svg+xml;utf8,'));
});


