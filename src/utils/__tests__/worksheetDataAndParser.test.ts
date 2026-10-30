import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPeriodsForGrade,
  getDefaultWorksheetForLesson,
  buildLessonBlueprintFromPeriod,
} from '../../data/mockCurriculumData';
import {
  build29PeriodsRawTextTemplate,
  parse29PeriodsFromDocxText,
} from '../docxTemplateGenerator';
import {
  parseExcelStudentPaste,
  generateStudentAccountFromExcelRow,
} from '../pedagogyEngine';

test('getPeriodsForGrade returns 29 authentic lesson titles for Grades 6, 7, 8, 9 without Chưa có dữ liệu', () => {
  for (const grade of [6, 7, 8, 9] as const) {
    const periods = getPeriodsForGrade(grade);
    assert.equal(periods.length, 29, `Grade ${grade} should have 29 periods`);
    for (const spec of periods) {
      assert.ok(
        spec.lessonTitle && !spec.lessonTitle.includes('Chưa có dữ liệu'),
        `Grade ${grade} Period ${spec.period} has invalid title: ${spec.lessonTitle}`
      );
      const blueprint = buildLessonBlueprintFromPeriod(spec);
      assert.ok(blueprint.stage2.bucketA && blueprint.stage2.bucketB);
      assert.ok(blueprint.stage2.dragItems.length >= 2);
      assert.ok(blueprint.stage2.shortAnswerQuestions && blueprint.stage2.shortAnswerQuestions.length >= 2);
    }
  }
});

test('getDefaultWorksheetForLesson populates Hộp A, Hộp B, clean dragDropParagraph, and shortAnswerQuestions', () => {
  for (const grade of [6, 7, 8, 9] as const) {
    for (const period of [1, 2, 10, 29]) {
      const ws = getDefaultWorksheetForLesson(grade, period);
      assert.ok(ws.stage2.bucketA && ws.stage2.bucketA.length > 0, 'bucketA must be populated');
      assert.ok(ws.stage2.bucketB && ws.stage2.bucketB.length > 0, 'bucketB must be populated');
      assert.ok(
        ws.stage2.dragDropQuestions.length >= 4,
        `Grade ${grade} Period ${period} should have at least 4 dragDropQuestions`
      );
      const paragraph = ws.stage2.dragDropParagraph || '';
      assert.ok(
        paragraph.includes('(1)') && !paragraph.includes('['),
        `Grade ${grade} Period ${period} dragDropParagraph should contain (1) placeholder and no leaked [brackets]`
      );
      assert.ok(
        ws.stage2.shortAnswerQuestions && ws.stage2.shortAnswerQuestions.length >= 3,
        `Grade ${grade} Period ${period} should have at least 3 shortAnswerQuestions`
      );
      for (const sq of ws.stage2.shortAnswerQuestions) {
        assert.ok(sq.question && sq.question.trim().length > 5, 'Short answer question stem must be non-empty');
      }
    }
  }
});

test('parse29PeriodsFromDocxText round-trips 29 periods including Drag & Drop and Short Answer questions', () => {
  const rawTemplate = build29PeriodsRawTextTemplate(6);
  const parsed = parse29PeriodsFromDocxText(rawTemplate, 6);
  assert.equal(parsed.worksheets.length, 29);
  const p2 = parsed.worksheets.find((w) => w.period === 2);
  assert.ok(p2, 'Period 2 worksheet should be parsed');
  assert.ok(p2.stage2.dragDropQuestions.length >= 4);
  assert.ok((p2.stage2.shortAnswerQuestions || []).length >= 3);
  assert.ok(
    (p2.stage2.shortAnswerQuestions || [])[0].question.length > 5,
    'Parsed short answer question must preserve question text'
  );
});

test('parseExcelStudentPaste generates student accounts with default password 12345 and grade/class mapping', () => {
  const samplePaste =
    '1\tLê Bảo Ngọc\t20/11/2013\t6A10\n2\tTrần Minh Khang\t14/06/2012\t7A10';
  const accounts = parseExcelStudentPaste(samplePaste, '6A10', 10);
  assert.equal(accounts.length, 2);
  assert.equal(accounts[0].name, 'Lê Bảo Ngọc');
  assert.equal(accounts[0].classId, '6A10');
  assert.equal(accounts[0].grade, 6);
  assert.equal(accounts[0].passwordDefault, '12345');
  assert.equal(accounts[1].classId, '7A10');
  assert.equal(accounts[1].grade, 7);

  const single = generateStudentAccountFromExcelRow('Vũ Gia Hưng', '15/05/2013', '8A11', 25);
  assert.equal(single.classId, '8A11');
  assert.equal(single.grade, 8);
  assert.equal(single.passwordDefault, '12345');
});
