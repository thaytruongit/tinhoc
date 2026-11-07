import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CSDL_GOOGLE_SHEETS_SCHEMA,
  extractSpreadsheetIdFromInput,
  buildGoogleSheetUrlFromId,
  splitBase64IntoSheetChunks,
  reassembleBase64FromSheetChunks,
  calculateBase64ChunkStats,
  serializeSlideToSheetPageRow,
  deserializeSheetPageRowToSlide,
  buildSheetUpdatePlanForLesson,
  extractLessonSlideDeckFromSheetRows,
  resolveSlidePreviewKeyNavigation,
  sanitizeBrowserProcessForPdfJs,
} from './googleSheetsConnector';
import { BLANK_WHITE_SLIDE_DATA_URL } from './slideDeckManager';

test('CSDL_GOOGLE_SHEETS_SCHEMA defines exact 2-table structure Slides_Index (A->I) and Slides_Pages (A->N)', () => {
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.DEFAULT_SPREADSHEET_TITLE, 'CSDL');
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.INDEX_SHEET_NAME, 'Slides_Index');
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.PAGES_SHEET_NAME, 'Slides_Pages');
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.INDEX_HEADERS.length, 9);
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.PAGES_HEADERS.length, 14);
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.MAX_CHARS_PER_CELL, 45000);
  assert.equal(CSDL_GOOGLE_SHEETS_SCHEMA.MAX_IMAGE_CHUNKS, 6);
});

test('splitBase64IntoSheetChunks and reassembleBase64FromSheetChunks handle up to 6 chunks <= 45,000 chars', () => {
  const sampleWebp =
    'data:image/webp;base64,' +
    'X'.repeat(45000) +
    'Y'.repeat(45000) +
    'Z'.repeat(45000) +
    'W'.repeat(12000);

  const chunks = splitBase64IntoSheetChunks(sampleWebp);
  assert.equal(chunks.length, 6);
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 45000, 'Each cell chunk must be <= 45,000 chars');
  }

  const stats = calculateBase64ChunkStats(sampleWebp);
  assert.equal(stats.activeChunkCount, 4);
  assert.equal(stats.fitsWithinSheetRow, true);
  assert.equal(stats.maxChunkLength, 45000);

  const reassembled = reassembleBase64FromSheetChunks(chunks);
  assert.equal(reassembled, sampleWebp);
});

test('serializeSlideToSheetPageRow and deserializeSheetPageRowToSlide preserve 14 columns A->N and WebP image', () => {
  const webpDataUrl =
    'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  const pageRow = serializeSlideToSheetPageRow({
    lessonKey: 'k7-tiet-4',
    grade: 7,
    period: 4,
    slideNumber: 3,
    totalSlides: 10,
    slide: {
      slideNumber: 3,
      title: 'Slide 3/10: Mạng máy tính',
      subtitle: 'Khối 7 • Tiết 4',
      bulletPoints: ['Khái niệm mạng LAN và Internet'],
      highlightNote: 'Ảnh WebP độ nét cao',
      imageUrl: webpDataUrl,
    },
  });

  assert.equal(pageRow.length, 14);
  assert.equal(pageRow[0], 'k7-tiet-4__s3');
  assert.equal(pageRow[1], 'k7-tiet-4');
  assert.equal(pageRow[2], '7');
  assert.equal(pageRow[3], '4');

  const decoded = deserializeSheetPageRowToSlide(pageRow);
  assert.ok(decoded);
  assert.equal(decoded.lessonKey, 'k7-tiet-4');
  assert.equal(decoded.slideNumber, 3);
  assert.equal(decoded.slide.imageUrl, webpDataUrl);
});

test('buildSheetUpdatePlanForLesson and extractLessonSlideDeckFromSheetRows manage lessons and fallback to Blank Slide', () => {
  const plan = buildSheetUpdatePlanForLesson({
    existingIndexRows: [[...CSDL_GOOGLE_SHEETS_SCHEMA.INDEX_HEADERS]],
    existingPageRows: [[...CSDL_GOOGLE_SHEETS_SCHEMA.PAGES_HEADERS]],
    lessonKey: 'k8-tiet-3',
    grade: 8,
    period: 3,
    lessonTitle: 'Bài 3: Biểu đồ trong bảng tính',
    fileName: 'Tiet_3_Khoi_8.pdf',
    slides: [
      {
        slideNumber: 1,
        title: 'Slide 1',
        bulletPoints: [],
        imageUrl: 'data:image/webp;base64,PAGE_1_WEBP',
      },
      {
        slideNumber: 2,
        title: 'Slide 2',
        bulletPoints: [],
        imageUrl: 'data:image/webp;base64,PAGE_2_WEBP',
      },
    ],
  });

  const foundLesson = extractLessonSlideDeckFromSheetRows({
    grade: 8,
    period: 3,
    indexRows: plan.nextIndexValues,
    pageRows: plan.nextPageValues,
  });
  assert.equal(foundLesson.foundInSheet, true);
  assert.equal(foundLesson.isBlankSlide, false);
  assert.equal(foundLesson.slideCount, 2);

  const missingLesson = extractLessonSlideDeckFromSheetRows({
    grade: 8,
    period: 9,
    indexRows: plan.nextIndexValues,
    pageRows: plan.nextPageValues,
  });
  assert.equal(missingLesson.foundInSheet, false);
  assert.equal(missingLesson.isBlankSlide, true);
  assert.equal(missingLesson.deck.slides[0].imageUrl, BLANK_WHITE_SLIDE_DATA_URL);
});

test('extractSpreadsheetIdFromInput and buildGoogleSheetUrlFromId parse URLs and IDs', () => {
  const id = '1o0QYDVE_sampleSpreadsheetId12345';
  const url = `https://docs.google.com/spreadsheets/d/${id}/edit#gid=0`;
  assert.equal(extractSpreadsheetIdFromInput(url), id);
  assert.equal(buildGoogleSheetUrlFromId(id), `https://docs.google.com/spreadsheets/d/${id}/edit`);
});

test('resolveSlidePreviewKeyNavigation switches slide index accurately with ArrowLeft, ArrowRight, Home, End and ignores input focus', () => {
  const nextStep = resolveSlidePreviewKeyNavigation({
    key: 'ArrowRight',
    currentIndex: 1,
    totalSlides: 5,
  });
  assert.equal(nextStep.handled, true);
  assert.equal(nextStep.nextIndex, 2);
  assert.equal(nextStep.action, 'next');

  const prevStep = resolveSlidePreviewKeyNavigation({
    key: 'ArrowLeft',
    currentIndex: 2,
    totalSlides: 5,
  });
  assert.equal(prevStep.handled, true);
  assert.equal(prevStep.nextIndex, 1);
  assert.equal(prevStep.action, 'prev');

  const clampStart = resolveSlidePreviewKeyNavigation({
    key: 'ArrowLeft',
    currentIndex: 0,
    totalSlides: 5,
  });
  assert.equal(clampStart.handled, true);
  assert.equal(clampStart.nextIndex, 0);

  const clampEnd = resolveSlidePreviewKeyNavigation({
    key: 'ArrowRight',
    currentIndex: 4,
    totalSlides: 5,
  });
  assert.equal(clampEnd.handled, true);
  assert.equal(clampEnd.nextIndex, 4);

  const ignoredWhenTyping = resolveSlidePreviewKeyNavigation({
    key: 'ArrowRight',
    currentIndex: 1,
    totalSlides: 5,
    isInputFocused: true,
  });
  assert.equal(ignoredWhenTyping.handled, false);
  assert.equal(ignoredWhenTyping.nextIndex, 1);
});

test('sanitizeBrowserProcessForPdfJs ensures process.getBuiltinModule is always a safe callable function', () => {
  sanitizeBrowserProcessForPdfJs();
  assert.equal(typeof (globalThis as any).process?.getBuiltinModule, 'function');
});


