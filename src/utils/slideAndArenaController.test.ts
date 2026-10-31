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

test('isStudentLiveViewUnlocked locks all other activities when teacher broadcasts slide', () => {
  const baseParams = {
    teacherActiveView: 'slide',
    isSlideDeckUnlocked: true,
    isPracticeStage3Unlocked: true,
    unlockedStages: { 1: true, 2: true, 3: true, 4: true },
    teacherCurrentStage: 3,
  };

  assert.equal(isStudentLiveViewUnlocked({ ...baseParams, viewId: 'slide' }), true);
  assert.equal(isStudentLiveViewUnlocked({ ...baseParams, viewId: 1 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...baseParams, viewId: 2 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...baseParams, viewId: 3 }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...baseParams, viewId: 'hd3-practice' }), false);
  assert.equal(isStudentLiveViewUnlocked({ ...baseParams, viewId: 4 }), false);
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

