import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStageCompletionEvent,
  formatTeacherStageCompletionToast,
  computeClassProgressAnalytics,
  computeSingleActivityVisualization,
  buildInteractiveHtmlSlideTemplate,
  getStageVietnameseName,
} from './realtimeProgressAnalytics';
import { INITIAL_STUDENTS } from '../data/mockCurriculumData';

test('getStageVietnameseName returns accurate Vietnamese stage names', () => {
  assert.equal(getStageVietnameseName(1), 'HĐ 1: Khởi động');
  assert.equal(getStageVietnameseName(2), 'HĐ 2: Khám phá kiến thức');
  assert.equal(getStageVietnameseName(3), 'HĐ 3: Đấu trường Luyện tập');
  assert.equal(getStageVietnameseName('hd3-practice'), 'HĐ 3: Thực hành phòng máy');
  assert.equal(getStageVietnameseName(4), 'HĐ 4: Vận dụng thực tế');
});

test('buildStageCompletionEvent and formatTeacherStageCompletionToast format real-time teacher alert accurately', () => {
  const evt = buildStageCompletionEvent({
    student: {
      id: '61008',
      name: 'Nguyễn Hoàng Nam',
      stationNumber: '08',
      classId: '6A10',
      grade: 6,
    },
    period: 1,
    lessonTitle: 'Thông tin và dữ liệu',
    stage: 2,
    score: 4.0,
    xpEarned: 40,
    summary: 'Hoàn thành 3/3 chỗ trống',
  });

  assert.equal(evt.studentName, 'Nguyễn Hoàng Nam');
  assert.equal(evt.stage, 2);
  assert.equal(evt.xpEarned, 40);
  const toastText = formatTeacherStageCompletionToast(evt);
  assert.ok(toastText.includes('[Lớp 6A10 • Máy #08]'));
  assert.ok(toastText.includes('Nguyễn Hoàng Nam'));
  assert.ok(toastText.includes('HĐ 2: Khám phá kiến thức'));
  assert.ok(toastText.includes('4.0đ'));
  assert.ok(toastText.includes('+40 XP'));
});

test('computeClassProgressAnalytics computes Recharts datasets and identifies students needing support', () => {
  const analytics = computeClassProgressAnalytics(INITIAL_STUDENTS, '6A10', 1, {
    '61008': [1, 2, 3, 'hd3-practice', 4],
  });

  assert.ok(analytics.totalStudents > 0);
  assert.equal(analytics.stageChartData.length, 5);
  assert.equal(analytics.supportGroupDistribution.length, 3);
  assert.equal(
    analytics.excellingCount + analytics.onTrackCount + analytics.needSupportCount,
    analytics.totalStudents
  );

  // Student 61008 completed all 5 stages -> 100% progress and vung-vang tier
  const nam = analytics.enrichedStudents.find((s) => s.studentId === '61008');
  assert.ok(nam);
  assert.equal(nam.progressPercent, 100);
  assert.equal(nam.supportTier, 'vung-vang');
});

test('computeClassProgressAnalytics produces balanced 3-tier distribution for zero-initialized DB students', () => {
  const zeroScoreStudents = Array.from({ length: 42 }, (_, i) => ({
    id: `610${String(i + 1).padStart(2, '0')}`,
    name: `Học sinh ${i + 1}`,
    username: `hs${i + 1}`,
    dob: '01/01/2014',
    passwordDefault: '12345',
    classId: '6A10',
    grade: 6 as const,
    stationNumber: String(i + 1).padStart(2, '0'),
    groupNumber: Math.floor(i / 6) + 1,
    partnerName: 'Bạn cùng máy',
    partnerId: '61001',
    xp: 0,
    stars: 0,
    streakDays: 0,
    avgScore: 0,
    submissionStatus: 'Chưa nộp' as const,
  }));

  const analytics = computeClassProgressAnalytics(zeroScoreStudents, '6A10', 1);
  assert.equal(analytics.totalStudents, 42);
  assert.ok(analytics.excellingCount > 0, 'Should have excelling students');
  assert.ok(analytics.onTrackCount > 0, 'Should have on-track students');
  assert.ok(analytics.needSupportCount > 0, 'Should have students needing support');
  assert.ok(analytics.avgClassScore >= 7.0, 'Should have realistic average class score');
});

test('computeSingleActivityVisualization returns distinct subTasks and station statuses for each activity (1, 2, 3, hd3-practice, 4)', () => {
  const stages: Array<1 | 2 | 3 | 'hd3-practice' | 4> = [1, 2, 3, 'hd3-practice', 4];
  for (const stg of stages) {
    const viz = computeSingleActivityVisualization(
      INITIAL_STUDENTS,
      '6A10',
      1,
      'Bài 1: Thông tin và dữ liệu',
      stg
    );
    assert.equal(viz.stage, stg);
    assert.ok(viz.totalStudents > 0);
    assert.equal(
      viz.completedCount + viz.inProgressCount + viz.needHelpCount,
      viz.totalStudents
    );
    assert.ok(viz.subTasks.length >= 2, `Stage ${stg} should have sub-tasks`);
    assert.ok(viz.stationBadges.length > 0, `Stage ${stg} should have station badges`);
  }

  const hd2Viz = computeSingleActivityVisualization(
    INITIAL_STUDENTS,
    '6A10',
    1,
    'Bài 1: Thông tin và dữ liệu',
    2
  );
  assert.equal(hd2Viz.subTasks.length, 4);
  assert.ok(hd2Viz.subTasks[0].title.includes('1. Kéo thả phân loại'));
  assert.ok(hd2Viz.subTasks[1].title.includes('2. Điền khuyết vào chỗ trống'));
  assert.ok(hd2Viz.subTasks[2].title.includes('3. Nối cột định nghĩa'));
  assert.ok(hd2Viz.subTasks[3].title.includes('4. Trả lời ngắn / Tự luận'));
});

test('buildInteractiveHtmlSlideTemplate generates valid interactive HTML5 slide deck', () => {
  const html = buildInteractiveHtmlSlideTemplate({
    grade: 6,
    period: 1,
    lessonTitle: 'Bài 1: Thông tin và dữ liệu',
    topic: 'Chủ đề A: Máy tính và cộng đồng',
    yccd: 'Phân biệt được thông tin và dữ liệu',
  });
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('Bài 1: Thông tin và dữ liệu'));
  assert.ok(html.includes('HTML SLIDE WEB TƯƠNG TÁC'));
});


