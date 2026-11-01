import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  insertHtmlSlideIntoDeck,
  updateSlideInDeck,
  deleteSlideFromDeck,
  moveSlideInDeck,
  resolveMonotonicSlideSyncState,
  extractTextFromPptxSlideXml,
  ensureDeckSlideImages,
  stripLargeBlobsForLocalStorage,
  isHeavySlideImage,
  createLazySlidePlaceholder,
  createLazySlideDeckPlaceholder,
  hydrateSlideDeckImages,
  filterActiveSlideDecksForMemory,
  type ManagedLectureSlidePage,
} from './slideDeckManager';
import {
  dataUrlToBlob,
  blobToDataUrl,
} from './indexedDbSlideStorage';

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

  it('guarantees every slide in deck has a valid imageUrl using ensureDeckSlideImages', () => {
    const rawSlides: ManagedLectureSlidePage[] = [
      {
        slideNumber: 1,
        title: 'Trang 1: Có ảnh sẵn',
        bulletPoints: ['Điểm 1'],
        imageUrl: '/api/file-storage/slides/file/real-slide-1.webp',
      },
      {
        slideNumber: 2,
        title: 'Trang 2: Chưa có ảnh',
        subtitle: 'Kiến thức cốt lõi',
        bulletPoints: ['Điểm 2a', 'Điểm 2b'],
      },
    ];

    const guaranteed = ensureDeckSlideImages(rawSlides, { grade: 7, period: 2 });
    assert.equal(guaranteed.length, 2);
    // Preserves existing imageUrl
    assert.equal(guaranteed[0].imageUrl, '/api/file-storage/slides/file/real-slide-1.webp');
    // Generates high-fidelity SVG data URL for missing imageUrl
    assert.ok(typeof guaranteed[1].imageUrl === 'string');
    assert.ok(guaranteed[1].imageUrl!.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(guaranteed[1].imageUrl!.includes('KH%E1%BB%90I%207%20%E2%80%A2%20TI%E1%BA%BET%202'));
  });

  it('safely strips massive base64 image strings for localStorage to prevent 5MB quota errors', () => {
    const hugeBase64 = 'data:image/webp;base64,' + 'A'.repeat(8000);
    const mockSession = {
      activeGrade: 6,
      activePeriod: 1,
      lectureSlidesByLesson: {
        'k6-tiet-1': {
          grade: 6,
          period: 1,
          pdfDataUrl: 'data:application/pdf;base64,' + 'B'.repeat(9000),
          slides: [
            {
              slideNumber: 1,
              title: 'Slide 1',
              bulletPoints: [],
              imageUrl: hugeBase64,
              storageFileId: 'slide-k6-tiet-1.webp',
            },
            {
              slideNumber: 2,
              title: 'Slide 2',
              bulletPoints: [],
              imageUrl: '/api/file-storage/slides/file/slide-2.webp',
            },
          ],
        },
      },
    };

    const stripped = stripLargeBlobsForLocalStorage(mockSession, 4000);
    const targetDeck = stripped.lectureSlidesByLesson['k6-tiet-1'];
    // Huge PDF string removed from localStorage payload
    assert.equal(targetDeck.pdfDataUrl, undefined);
    // Huge base64 replaced with server storage URL fallback
    assert.equal(
      targetDeck.slides[0].imageUrl,
      '/api/file-storage/slides/file/slide-k6-tiet-1.webp'
    );
    assert.equal((targetDeck.slides[0] as any).hasIndexedDbBackup, true);
    // File storage URL preserved untouched
    assert.equal(
      targetDeck.slides[1].imageUrl,
      '/api/file-storage/slides/file/slide-2.webp'
    );
  });

  it('detects heavy in-memory slide images using isHeavySlideImage', () => {
    const lightUrl = '/api/file-storage/slides/file/slide-1.webp';
    const lightDataUrl = 'data:image/svg+xml;utf8,<svg></svg>';
    const heavyDataUrl = 'data:image/webp;base64,' + 'A'.repeat(9000);

    assert.equal(isHeavySlideImage(lightUrl), false);
    assert.equal(isHeavySlideImage(lightDataUrl), false);
    assert.equal(isHeavySlideImage(heavyDataUrl), true);
  });

  it('creates lightweight lazy placeholders for heavy slide images and preserves pedagogical metadata', () => {
    const heavySlide: ManagedLectureSlidePage = {
      slideNumber: 1,
      title: 'Khái niệm Thông tin',
      subtitle: 'SGK Tin học 6',
      bulletPoints: ['Thông tin là nhận thức'],
      imageUrl: 'data:image/webp;base64,' + 'X'.repeat(12000),
      storageFileId: 'stored-slide-1.webp',
    };

    const placeholder = createLazySlidePlaceholder(heavySlide, 'k6-tiet-1');
    assert.equal(placeholder.isLazyPlaceholder, true);
    assert.equal(placeholder.lazyLoadKey, 'k6-tiet-1-slide-1');
    assert.equal(placeholder.title, 'Khái niệm Thông tin');
    assert.equal(placeholder.bulletPoints[0], 'Thông tin là nhận thức');
    // Offloaded to storage endpoint
    assert.equal(placeholder.imageUrl, '/api/file-storage/slides/file/stored-slide-1.webp');

    // Slide without storageFileId gets high-fidelity SVG fallback marker
    const heavyWithoutFileId: ManagedLectureSlidePage = {
      ...heavySlide,
      storageFileId: undefined,
    };
    const placeholderSvg = createLazySlidePlaceholder(heavyWithoutFileId, 'k6-tiet-1');
    assert.equal(placeholderSvg.isLazyPlaceholder, true);
    assert.ok(placeholderSvg.imageUrl?.startsWith('data:image/svg+xml;utf8,'));
  });

  it('filters active slide decks for memory governance (keeps active deck uncompressed, offloads inactive decks)', () => {
    const heavyDeck1 = {
      grade: 6,
      period: 1,
      slides: [
        {
          slideNumber: 1,
          title: 'Tiết 1 - Slide 1',
          bulletPoints: [],
          imageUrl: 'data:image/webp;base64,' + 'M'.repeat(10000),
        },
      ],
    };
    const heavyDeck2 = {
      grade: 6,
      period: 2,
      slides: [
        {
          slideNumber: 1,
          title: 'Tiết 2 - Slide 1',
          bulletPoints: [],
          imageUrl: 'data:image/webp;base64,' + 'N'.repeat(10000),
        },
      ],
    };

    const decks = {
      'k6-tiet-1': heavyDeck1,
      'k6-tiet-2': heavyDeck2,
    };

    // When Tiết 2 is active, Tiết 2 stays uncompressed and Tiết 1 is turned into lazy placeholder
    const governed: Record<string, any> = filterActiveSlideDecksForMemory(decks, 'k6-tiet-2');
    assert.equal(governed['k6-tiet-2'].isLazyLoaded, true);
    assert.equal(governed['k6-tiet-2'].slides[0].imageUrl.startsWith('data:image/webp;base64,'), true);

    assert.equal(governed['k6-tiet-1'].isLazyLoaded, false);
    assert.equal(governed['k6-tiet-1'].slides[0].isLazyPlaceholder, true);
  });

  it('hydrates slide deck images on-demand from map of URLs or Blobs', () => {
    const lazyDeck = {
      grade: 6,
      period: 1,
      isLazyLoaded: false,
      slides: [
        {
          slideNumber: 1,
          title: 'Slide 1',
          bulletPoints: [],
          imageUrl: 'data:image/svg+xml;utf8,<svg>placeholder</svg>',
          isLazyPlaceholder: true,
        },
      ],
    };

    const hydrated = hydrateSlideDeckImages(lazyDeck, {
      1: 'data:image/webp;base64,FULL_IMAGE_DATA',
    });
    assert.equal(hydrated.isLazyLoaded, true);
    assert.equal(hydrated.slides[0].isLazyPlaceholder, false);
    assert.equal(hydrated.slides[0].imageUrl, 'data:image/webp;base64,FULL_IMAGE_DATA');
  });

  it('converts base64 data URLs to Blobs and back to data URLs stably', async () => {
    const rawDataUrl = 'data:image/webp;base64,QUJDREVGR0g='; // "ABCDEFGH"
    const blob = dataUrlToBlob(rawDataUrl);
    assert.ok(blob instanceof Blob);
    assert.equal(blob.type, 'image/webp');

    const reconstructed = await blobToDataUrl(blob);
    assert.ok(reconstructed.startsWith('data:image/webp;base64,'));
    assert.equal(reconstructed, rawDataUrl);
  });
});
