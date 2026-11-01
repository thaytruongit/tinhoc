import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  insertHtmlSlideIntoDeck,
  updateSlideInDeck,
  deleteSlideFromDeck,
  moveSlideInDeck,
  resolveMonotonicSlideSyncState,
  extractTextFromPptxSlideXml,
  type ManagedLectureSlidePage,
} from './slideDeckManager';

describe('slideDeckManager pure logic unit tests', () => {
  const sampleDeck: ManagedLectureSlidePage[] = [
    {
      slideNumber: 1,
      title: 'Slide 1: Mở đầu',
      bulletPoints: ['Ý 1'],
      imageUrl: '/api/file-storage/slides/file/slide-1.webp',
    },
    {
      slideNumber: 2,
      title: 'Slide 2: Kiến thức mới',
      bulletPoints: ['Ý 2'],
      imageUrl: '/api/file-storage/slides/file/slide-2.webp',
    },
    {
      slideNumber: 3,
      title: 'Slide 3: Tổng kết',
      bulletPoints: ['Ý 3'],
      imageUrl: '/api/file-storage/slides/file/slide-3.webp',
    },
  ];

  it('inserts a single simulation HTML slide at a specified 1-based position and renumbers slides', () => {
    const simSlide: ManagedLectureSlidePage = {
      slideNumber: 99,
      title: 'Mô phỏng tương tác HTML',
      bulletPoints: ['Mô phỏng trực quan'],
      htmlContent: '<html><body>Sim</body></html>',
    };

    const result = insertHtmlSlideIntoDeck(sampleDeck, simSlide, 'simulation-single', 2);
    assert.equal(result.slides.length, 4);
    assert.equal(result.insertedZeroBasedIndex, 1);
    assert.equal(result.insertedSlideNumber, 2);
    assert.equal(result.slides[0].title, 'Slide 1: Mở đầu');
    assert.equal(result.slides[1].title, 'Mô phỏng tương tác HTML');
    assert.equal(result.slides[1].slideNumber, 2);
    assert.equal(result.slides[2].title, 'Slide 2: Kiến thức mới');
    assert.equal(result.slides[2].slideNumber, 3);
    assert.equal(result.slides[3].slideNumber, 4);
  });

  it('appends a full HTML slide deck to the very end when mode is full-deck-end', () => {
    const webDeckSlides: ManagedLectureSlidePage[] = [
      {
        slideNumber: 1,
        title: 'Bộ Slide Web - Phần 1',
        bulletPoints: [],
        htmlContent: '<html><body>Web 1</body></html>',
      },
      {
        slideNumber: 2,
        title: 'Bộ Slide Web - Phần 2',
        bulletPoints: [],
        htmlContent: '<html><body>Web 2</body></html>',
      },
    ];

    const result = insertHtmlSlideIntoDeck(sampleDeck, webDeckSlides, 'full-deck-end', 1);
    assert.equal(result.slides.length, 5);
    assert.equal(result.insertedZeroBasedIndex, 3);
    assert.equal(result.insertedSlideNumber, 4);
    assert.equal(result.slides[3].title, 'Bộ Slide Web - Phần 1');
    assert.equal(result.slides[3].slideNumber, 4);
    assert.equal(result.slides[4].title, 'Bộ Slide Web - Phần 2');
    assert.equal(result.slides[4].slideNumber, 5);
  });

  it('updates and deletes slides in deck with clean renumbering', () => {
    const { slides: updated } = updateSlideInDeck(
      sampleDeck,
      1,
      { title: 'Slide 2 (Đã sửa)' },
      1
    );
    assert.equal(updated[0].title, 'Slide 2 (Đã sửa)');
    assert.equal(updated[0].slideNumber, 1);
    assert.equal(updated[1].title, 'Slide 1: Mở đầu');
    assert.equal(updated[1].slideNumber, 2);

    const { slides: afterDelete, nextPreviewIndex } = deleteSlideFromDeck(updated, 0);
    assert.equal(afterDelete.length, 2);
    assert.equal(afterDelete[0].slideNumber, 1);
    assert.equal(afterDelete[1].slideNumber, 2);
    assert.equal(nextPreviewIndex, 0);

    const { slides: afterMove } = moveSlideInDeck(afterDelete, 0, 1);
    assert.equal(afterMove[0].title, 'Slide 3: Tổng kết');
    assert.equal(afterMove[0].slideNumber, 1);
  });

  it('prevents erratic slide jumping by rejecting stale slideSyncVersion values', () => {
    const state = resolveMonotonicSlideSyncState({
      currentSlideIndices: { 'k6-tiet-1': 4 },
      currentSyncVersions: { 'k6-tiet-1': 1005 },
      incomingSlideIndices: { 'k6-tiet-1': 1 }, // stale poll saying slide 1!
      incomingSyncVersions: { 'k6-tiet-1': 1002 },
    });

    assert.equal(state.activeSlideIndexByLesson['k6-tiet-1'], 4);
    assert.equal(state.slideSyncVersionByLesson['k6-tiet-1'], 1005);

    const newerState = resolveMonotonicSlideSyncState({
      currentSlideIndices: state.activeSlideIndexByLesson,
      currentSyncVersions: state.slideSyncVersionByLesson,
      incomingSlideIndices: { 'k6-tiet-1': 5 },
      incomingSyncVersions: { 'k6-tiet-1': 1006 },
    });

    assert.equal(newerState.activeSlideIndexByLesson['k6-tiet-1'], 5);
    assert.equal(newerState.slideSyncVersionByLesson['k6-tiet-1'], 1006);
  });

  it('extracts title and bullet points from PPTX slide XML', () => {
    const xml = `
      <p:sld>
        <a:p><a:r><a:t>Bài 1: Thông tin và dữ liệu</a:t></a:r></a:p>
        <a:p><a:r><a:t>Khái niệm thông tin</a:t></a:r></a:p>
        <a:p><a:r><a:t>Khái niệm dữ liệu &amp; vật mang tin</a:t></a:r></a:p>
      </p:sld>
    `;
    const parsed = extractTextFromPptxSlideXml(xml);
    assert.equal(parsed.title, 'Bài 1: Thông tin và dữ liệu');
    assert.deepEqual(parsed.bulletPoints, [
      'Khái niệm thông tin',
      'Khái niệm dữ liệu & vật mang tin',
    ]);
  });
});
