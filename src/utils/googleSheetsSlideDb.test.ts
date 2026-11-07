import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSpreadsheetIdFromInput,
  buildGoogleSheetUrlFromId,
  chunkSlideImageForSheetCells,
  reassembleSlideImageFromSheetChunks,
  serializeSlideToSheetPageRow,
  deserializeSheetPageRowToSlide,
  buildSheetUpdatePlanForLesson,
  extractLessonSlideDeckFromSheetRows,
  GOOGLE_SHEETS_SLIDE_DB_SCHEMA,
} from './googleSheetsSlideDb';
import { BLANK_WHITE_SLIDE_DATA_URL } from './slideDeckManager';

test('extractSpreadsheetIdFromInput parses full Google Sheets URLs and bare IDs accurately', () => {
  const fullUrl =
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
  assert.equal(
    extractSpreadsheetIdFromInput(fullUrl),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  );

  const bareId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  assert.equal(extractSpreadsheetIdFromInput(bareId), bareId);
  assert.equal(
    buildGoogleSheetUrlFromId(bareId),
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
  );
  assert.equal(extractSpreadsheetIdFromInput(''), '');
});

test('chunkSlideImageForSheetCells and reassembleSlideImageFromSheetChunks split and restore large base64 images losslessly', () => {
  const prefix = 'data:image/webp;base64,';
  const syntheticBase64 = prefix + 'A'.repeat(45000) + 'B'.repeat(45000) + 'C'.repeat(12345);

  const chunks = chunkSlideImageForSheetCells(syntheticBase64, 45000, 6);
  assert.equal(chunks.length, 6);
  assert.ok(chunks[0].length <= 45000);
  assert.ok(chunks[1].length <= 45000);
  assert.ok(chunks[2].length <= 45000);
  assert.equal(chunks[3], '');
  assert.equal(chunks[4], '');
  assert.equal(chunks[5], '');

  const restored = reassembleSlideImageFromSheetChunks(chunks);
  assert.equal(restored, syntheticBase64);
});

test('serializeSlideToSheetPageRow and deserializeSheetPageRowToSlide round-trip slide image and metadata', () => {
  const sampleImage = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  const row = serializeSlideToSheetPageRow({
    lessonKey: 'k6-tiet-1',
    grade: 6,
    period: 1,
    slideNumber: 2,
    totalSlides: 5,
    slide: {
      slideNumber: 2,
      title: 'Slide 2: Thông tin và dữ liệu',
      subtitle: 'Khối 6 • Tiết 1',
      bulletPoints: ['Điểm chính 1', 'Điểm chính 2'],
      highlightNote: 'Ghi chú quan trọng',
      imageUrl: sampleImage,
    },
  });

  assert.equal(row.length, GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_HEADERS.length);
  assert.equal(row[0], 'k6-tiet-1__s2');
  assert.equal(row[1], 'k6-tiet-1');

  const decoded = deserializeSheetPageRowToSlide(row);
  assert.ok(decoded);
  assert.equal(decoded.lessonKey, 'k6-tiet-1');
  assert.equal(decoded.grade, 6);
  assert.equal(decoded.period, 1);
  assert.equal(decoded.slideNumber, 2);
  assert.equal(decoded.totalSlides, 5);
  assert.equal(decoded.slide.title, 'Slide 2: Thông tin và dữ liệu');
  assert.equal(decoded.slide.imageUrl, sampleImage);
  assert.deepEqual(decoded.slide.bulletPoints, ['Điểm chính 1', 'Điểm chính 2']);
});

test('buildSheetUpdatePlanForLesson replaces existing lesson slides while preserving other lessons and flags overwrite', () => {
  const existingPlan = buildSheetUpdatePlanForLesson({
    existingIndexRows: [[...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.INDEX_HEADERS]],
    existingPageRows: [[...GOOGLE_SHEETS_SLIDE_DB_SCHEMA.PAGES_HEADERS]],
    lessonKey: 'k6-tiet-1',
    grade: 6,
    period: 1,
    lessonTitle: 'Bài 1: Thông tin và dữ liệu',
    fileName: 'Tiet 1.pdf',
    slides: [
      {
        slideNumber: 1,
        title: 'Slide 1',
        bulletPoints: [],
        imageUrl: 'data:image/webp;base64,SLIDE1_OLD',
      },
    ],
  });

  assert.equal(existingPlan.isOverwritingExistingLesson, false);

  // Add a second lesson k6-tiet-2
  const twoLessonPlan = buildSheetUpdatePlanForLesson({
    existingIndexRows: existingPlan.nextIndexValues,
    existingPageRows: existingPlan.nextPageValues,
    lessonKey: 'k6-tiet-2',
    grade: 6,
    period: 2,
    lessonTitle: 'Bài 2: Xử lý thông tin',
    fileName: 'Tiet 2.pdf',
    slides: [
      {
        slideNumber: 1,
        title: 'Slide 1 Tiet 2',
        bulletPoints: [],
        imageUrl: 'data:image/webp;base64,TIET2_S1',
      },
    ],
  });

  assert.equal(twoLessonPlan.isOverwritingExistingLesson, false);
  assert.equal(twoLessonPlan.nextIndexValues.length, 3); // header + 2 lessons

  // Now overwrite k6-tiet-1 with 2 new slides
  const overwritePlan = buildSheetUpdatePlanForLesson({
    existingIndexRows: twoLessonPlan.nextIndexValues,
    existingPageRows: twoLessonPlan.nextPageValues,
    lessonKey: 'k6-tiet-1',
    grade: 6,
    period: 1,
    lessonTitle: 'Bài 1: Thông tin và dữ liệu (Cập nhật)',
    fileName: 'Tiet 1_v2.pdf',
    slides: [
      {
        slideNumber: 1,
        title: 'Slide 1 New',
        bulletPoints: [],
        imageUrl: 'data:image/webp;base64,SLIDE1_NEW',
      },
      {
        slideNumber: 2,
        title: 'Slide 2 New',
        bulletPoints: [],
        imageUrl: 'data:image/webp;base64,SLIDE2_NEW',
      },
    ],
  });

  assert.equal(overwritePlan.isOverwritingExistingLesson, true);
  assert.equal(overwritePlan.existingSlideCount, 1);

  // Verify k6-tiet-1 has 2 slides in the sheet and k6-tiet-2 is preserved
  const extractedTiet1 = extractLessonSlideDeckFromSheetRows({
    grade: 6,
    period: 1,
    indexRows: overwritePlan.nextIndexValues,
    pageRows: overwritePlan.nextPageValues,
  });
  assert.equal(extractedTiet1.foundInSheet, true);
  assert.equal(extractedTiet1.isBlankSlide, false);
  assert.equal(extractedTiet1.slideCount, 2);
  assert.equal(extractedTiet1.deck.slides[0].imageUrl, 'data:image/webp;base64,SLIDE1_NEW');
  assert.equal(extractedTiet1.deck.slides[1].imageUrl, 'data:image/webp;base64,SLIDE2_NEW');

  // Verify unuploaded lesson k6-tiet-5 returns Blank White Slide ("trang slide trắng")
  const extractedEmptyTiet5 = extractLessonSlideDeckFromSheetRows({
    grade: 6,
    period: 5,
    indexRows: overwritePlan.nextIndexValues,
    pageRows: overwritePlan.nextPageValues,
  });
  assert.equal(extractedEmptyTiet5.foundInSheet, false);
  assert.equal(extractedEmptyTiet5.isBlankSlide, true);
  assert.equal(extractedEmptyTiet5.deck.isBlankSlideDeck, true);
  assert.equal(extractedEmptyTiet5.deck.slides[0].imageUrl, BLANK_WHITE_SLIDE_DATA_URL);
});
