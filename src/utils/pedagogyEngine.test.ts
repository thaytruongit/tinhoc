import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gradeWorksheetStage2,
  calculateMinigameScore,
  generateSmartReviewPath,
  generateStudentAccountFromExcelRow,
  parseExcelStudentPaste,
  classifyOcrWorksheetDocument,
  sanitizeId,
  sanitizeString,
  type ClassificationCard,
} from './pedagogyEngine';
import {
  getPeriodsForGrade,
  buildLessonBlueprintFromPeriod,
  NOTEBOOK_GRADE_SOURCES,
} from '../data/mockCurriculumData';

test('gradeWorksheetStage2 calculates accurate 10/10 score when all tasks are correct', () => {
  const cards: ClassificationCard[] = [
    { id: 'c1', text: '"Nhiệt độ kế chỉ 38°C"', icon: 'device_thermostat', correctBox: 'data', assignedBox: 'data' },
    { id: 'c2', text: '"Bạn An đang bị sốt nhẹ"', icon: 'sick', correctBox: 'info', assignedBox: 'info' },
    { id: 'c3', text: '"Biển báo vòng tròn đỏ có gạch chéo"', icon: 'signpost', correctBox: 'data', assignedBox: 'data' },
    { id: 'c4', text: '"Đã đến giờ vào lớp học rồi"', icon: 'alarm', correctBox: 'info', assignedBox: 'info' },
  ];

  const result = gradeWorksheetStage2({
    cards,
    blankStep2: 'xl',
    blankStep3: 'lt',
    scenarioText: 'Dữ liệu là bầu trời đen và tiếng sấm, thông tin là trời sắp mưa nên em mang áo mưa.',
  });

  assert.equal(result.task1Score, 4.0);
  assert.equal(result.task2Score, 4.0);
  assert.equal(result.task3Score, 2.0);
  assert.equal(result.totalScore, 10.0);
  assert.equal(result.completionPercent, 100);
  assert.equal(result.competencyLevel, 'Xuất sắc (NLA-Tốt)');
});

test('gradeWorksheetStage2 supports Vietnamese diacritic-insensitive fill-in-the-blank grading', () => {
  const result = gradeWorksheetStage2({
    cards: [],
    blankStep2: 'xu ly thong tin',
    blankStep3: 'Ghi nhớ',
    scenarioText: 'Trời mây đen báo hiệu sắp mưa to.',
  });

  assert.equal(result.task2Score, 4.0);
  assert.equal(result.task3Score, 2.0);
});

test('calculateMinigameScore awards speed bonus within first 5 seconds and unlocks wheel on 3x streak', () => {
  const res = calculateMinigameScore({
    isCorrect: true,
    timeRemainingSec: 17,
    maxTimeSec: 20,
    currentStreak: 2,
  });

  assert.equal(res.speedBonusXp, 50);
  assert.equal(res.newStreak, 3);
  assert.equal(res.unlockedWheelSpin, true);
  assert.ok(res.pointsEarned >= 150);

  const wrongRes = calculateMinigameScore({
    isCorrect: false,
    timeRemainingSec: 18,
    maxTimeSec: 20,
    currentStreak: 4,
  });
  assert.equal(wrongRes.pointsEarned, 0);
  assert.equal(wrongRes.newStreak, 0);
  assert.equal(wrongRes.unlockedWheelSpin, false);
});

test('generateSmartReviewPath personalizes learning path by student score tier', () => {
  const advanced = generateSmartReviewPath({
    studentCode: '61008',
    studentName: 'Trần Minh',
    avgScore: 9.2,
    completedLessons: 2,
    totalLessons: 12,
    weakTopics: [],
  });
  assert.equal(advanced.tier, 'Khá & Giỏi (Mở rộng)');
  assert.equal(advanced.recommendedModules[0].xpReward, 50);

  const support = generateSmartReviewPath({
    studentCode: '61015',
    studentName: 'Phạm Khánh Vy',
    avgScore: 5.5,
    completedLessons: 1,
    totalLessons: 12,
    weakTopics: ['Vật mang tin'],
  });
  assert.equal(support.tier, 'Cần củng cố (Hỗ trợ)');
  assert.equal(support.recommendedModules[0].type, 'mindmap');
});

test('generateStudentAccountFromExcelRow and parseExcelStudentPaste auto-generate accounts with password 12345', () => {
  const acc = generateStudentAccountFromExcelRow('Nguyễn Hoàng Nam', '15/05/2013', '6A10', 41);
  assert.equal(acc.passwordDefault, '12345');
  assert.equal(acc.classId, '6A10');
  assert.equal(acc.grade, 6);
  assert.ok(acc.username.includes('namnh'));

  const batch = parseExcelStudentPaste(
    '1\tLê Bảo Ngọc\t20/11/2013\t6A12\n2\tPhạm Minh Đức\t04/02/2010\t10A1',
    '6A10',
    50
  );
  assert.equal(batch.length, 2);
  assert.equal(batch[0].name, 'Lê Bảo Ngọc');
  assert.equal(batch[0].classId, '6A12');
  assert.equal(batch[0].passwordDefault, '12345');
  assert.equal(batch[1].grade, 10);
});

test('classifyOcrWorksheetDocument extracts all 4 interactive worksheet types with correct answers', () => {
  const parsed = classifyOcrWorksheetDocument('De_Kiem_Tra_Thong_Tin_Du_Lieu.docx', 'Thông tin và dữ liệu');
  assert.equal(parsed.blocks.length, 4);
  assert.equal(parsed.blocks[0].blockType, 'drag_drop');
  assert.equal(parsed.blocks[1].blockType, 'fill_blank');
  assert.equal(parsed.blocks[3].blockType, 'short_answer');
  assert.equal(parsed.totalPoints, 4.0);
});

test('NotebookLM curriculum mapping provides 29 periods per grade (6, 7, 8, 9) with YCCĐ, NLS (CV 3456), and AI competency (Khung 3439)', () => {
  assert.equal(NOTEBOOK_GRADE_SOURCES.length, 4);
  for (const grade of [6, 7, 8, 9] as const) {
    const periods = getPeriodsForGrade(grade);
    assert.equal(periods.length, 29);
    assert.equal(periods[0].nlsAiFile, `NLS-AI-${grade}.docx`);
    assert.equal(periods[0].sgkFile, `SGK Tin${grade}.pdf`);
    assert.ok(periods[0].yccd.length > 10);
    assert.ok(periods[0].digitalCompetency.includes('TC'));
    assert.ok(periods[0].aiCompetency.startsWith(`${grade}.`));
    assert.ok(periods[0].nlsPdfUrl.startsWith('/assets/aistudio/NLS-AI-'));

    const blueprint = buildLessonBlueprintFromPeriod(periods[14]);
    assert.equal(blueprint.grade, grade);
    assert.equal(blueprint.periodNumber, 15);
    assert.equal(blueprint.stage2.dragItems.length, 4);
  }
});

test('sanitizeId and sanitizeString enforce firebase-blueprint volumetric constraints', () => {
  assert.equal(sanitizeId('invalid$id!@#'), 'invalid_id___');
  assert.equal(sanitizeString('Hello World', 5), 'Hello');
});
