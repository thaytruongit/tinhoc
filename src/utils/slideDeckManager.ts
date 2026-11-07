export interface ManagedLectureSlidePage {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  highlightNote?: string;
  imageUrl?: string;
  imageBlob?: Blob;
  isLazyPlaceholder?: boolean;
  lazyLoadKey?: string;
  originalSizeKb?: number;
  storageFileId?: string;
  compressedSizeKb?: number;
  hasIndexedDbBackup?: boolean;
  videoUrl?: string;
  videoTitle?: string;
  htmlContent?: string;
  htmlEmbedUrl?: string;
  embedMode?: 'simulation-single' | 'full-deck-end';
}

export type HtmlSlideEmbedMode = 'simulation-single' | 'full-deck-end';

/**
 * Re-numbers all slides sequentially from 1..N so slideNumber is always consistent.
 */
export function renumberSlides<T extends { slideNumber: number }>(slides: T[]): T[] {
  if (!Array.isArray(slides)) return [];
  return slides.map((slide, idx) => ({
    ...slide,
    slideNumber: idx + 1,
  }));
}

/**
 * Inserts an HTML Slide Web into an existing lecture slide deck according to the user's rules:
 * - Mode 'simulation-single' (Slide mô phỏng): Automatically creates 1 new separate slide and inserts it
 *   at the 1-based `insertPosition` (clamped between 1 and existingSlides.length + 1), shifting subsequent slides.
 * - Mode 'full-deck-end' (Cả bộ slide web): Appends the HTML slide(s) to the very end of the lecture slide deck
 *   (position existingSlides.length + 1).
 */
export function insertHtmlSlideIntoDeck(
  existingSlides: ManagedLectureSlidePage[],
  newHtmlSlideOrSlides: ManagedLectureSlidePage | ManagedLectureSlidePage[],
  mode: HtmlSlideEmbedMode,
  insertPosition1Based?: number
): {
  slides: ManagedLectureSlidePage[];
  insertedZeroBasedIndex: number;
  insertedSlideNumber: number;
} {
  const safeExisting = Array.isArray(existingSlides) ? [...existingSlides] : [];
  const incomingList = Array.isArray(newHtmlSlideOrSlides)
    ? newHtmlSlideOrSlides
    : [newHtmlSlideOrSlides];

  if (incomingList.length === 0) {
    return {
      slides: renumberSlides(safeExisting),
      insertedZeroBasedIndex: Math.max(0, safeExisting.length - 1),
      insertedSlideNumber: Math.max(1, safeExisting.length),
    };
  }

  if (mode === 'full-deck-end') {
    const startIdx = safeExisting.length;
    const taggedIncoming = incomingList.map((sl) => ({
      ...sl,
      embedMode: 'full-deck-end' as const,
    }));
    const combined = renumberSlides([...safeExisting, ...taggedIncoming]);
    return {
      slides: combined,
      insertedZeroBasedIndex: startIdx,
      insertedSlideNumber: startIdx + 1,
    };
  }

  // Mode: 'simulation-single' -> create 1 separate slide and insert at user-specified 1-based position
  const rawPos = Number(insertPosition1Based);
  const clamped1Based = Number.isFinite(rawPos)
    ? Math.max(1, Math.min(safeExisting.length + 1, Math.floor(rawPos)))
    : safeExisting.length + 1;
  const targetZeroIdx = clamped1Based - 1;

  const singleSimSlide: ManagedLectureSlidePage = {
    ...incomingList[0],
    embedMode: 'simulation-single',
  };

  const before = safeExisting.slice(0, targetZeroIdx);
  const after = safeExisting.slice(targetZeroIdx);
  const combined = renumberSlides([...before, singleSimSlide, ...after]);

  return {
    slides: combined,
    insertedZeroBasedIndex: targetZeroIdx,
    insertedSlideNumber: targetZeroIdx + 1,
  };
}

/**
 * Updates a single slide at `slideIndex` (0-based) and optionally moves it to a new 1-based position.
 */
export function updateSlideInDeck(
  slides: ManagedLectureSlidePage[],
  slideIndex: number,
  patch: Partial<ManagedLectureSlidePage>,
  newPosition1Based?: number
): { slides: ManagedLectureSlidePage[]; activeIndex: number } {
  const safeSlides = Array.isArray(slides) ? [...slides] : [];
  if (slideIndex < 0 || slideIndex >= safeSlides.length) {
    return { slides: renumberSlides(safeSlides), activeIndex: 0 };
  }

  const updatedItem: ManagedLectureSlidePage = {
    ...safeSlides[slideIndex],
    ...patch,
  };
  safeSlides[slideIndex] = updatedItem;

  if (
    typeof newPosition1Based === 'number' &&
    Number.isFinite(newPosition1Based)
  ) {
    const targetIdx = Math.max(
      0,
      Math.min(safeSlides.length - 1, Math.floor(newPosition1Based) - 1)
    );
    if (targetIdx !== slideIndex) {
      const [removed] = safeSlides.splice(slideIndex, 1);
      safeSlides.splice(targetIdx, 0, removed);
      return {
        slides: renumberSlides(safeSlides),
        activeIndex: targetIdx,
      };
    }
  }

  return {
    slides: renumberSlides(safeSlides),
    activeIndex: slideIndex,
  };
}

/**
 * Deletes a single slide at `slideIndex` (0-based) and re-numbers remaining slides 1..N.
 */
export function deleteSlideFromDeck(
  slides: ManagedLectureSlidePage[],
  slideIndex: number
): { slides: ManagedLectureSlidePage[]; nextPreviewIndex: number } {
  const safeSlides = Array.isArray(slides) ? [...slides] : [];
  if (slideIndex < 0 || slideIndex >= safeSlides.length) {
    return {
      slides: renumberSlides(safeSlides),
      nextPreviewIndex: Math.max(0, safeSlides.length - 1),
    };
  }
  safeSlides.splice(slideIndex, 1);
  const renumbered = renumberSlides(safeSlides);
  const nextPreviewIndex =
    renumbered.length === 0
      ? 0
      : Math.min(slideIndex, renumbered.length - 1);
  return {
    slides: renumbered,
    nextPreviewIndex,
  };
}

/**
 * Moves a slide from `fromIndex` to `toIndex` (0-based) and re-numbers all slides 1..N.
 */
export function moveSlideInDeck(
  slides: ManagedLectureSlidePage[],
  fromIndex: number,
  toIndex: number
): { slides: ManagedLectureSlidePage[]; nextPreviewIndex: number } {
  const safeSlides = Array.isArray(slides) ? [...slides] : [];
  if (
    fromIndex < 0 ||
    fromIndex >= safeSlides.length ||
    toIndex < 0 ||
    toIndex >= safeSlides.length ||
    fromIndex === toIndex
  ) {
    return {
      slides: renumberSlides(safeSlides),
      nextPreviewIndex: Math.max(0, Math.min(safeSlides.length - 1, fromIndex)),
    };
  }
  const [moved] = safeSlides.splice(fromIndex, 1);
  safeSlides.splice(toIndex, 0, moved);
  return {
    slides: renumberSlides(safeSlides),
    nextPreviewIndex: toIndex,
  };
}

/**
 * Prevents erratic slide jumping ("nhảy loạn xạ qua lại giữa các slide") between Teacher and Student
 * caused by out-of-order HTTP polling, stale Supabase realtime events, or Student-side session updates.
 *
 * For each lessonKey:
 * - Compares `incomingSyncVersions[lessonKey]` against `currentSyncVersions[lessonKey]`.
 * - Only accepts `incomingSlideIndices[lessonKey]` if `incomingVersion >= currentVersion` (or if local has no version yet).
 * - Otherwise preserves `currentSlideIndices[lessonKey]` and `currentSyncVersions[lessonKey]`.
 */
export function resolveMonotonicSlideSyncState(params: {
  currentSlideIndices: Record<string, number>;
  currentSyncVersions: Record<string, number>;
  incomingSlideIndices?: Record<string, number>;
  incomingSyncVersions?: Record<string, number>;
}): {
  activeSlideIndexByLesson: Record<string, number>;
  slideSyncVersionByLesson: Record<string, number>;
} {
  const currentIndices = { ...(params.currentSlideIndices || {}) };
  const currentVersions = { ...(params.currentSyncVersions || {}) };
  const incomingIndices = params.incomingSlideIndices || {};
  const incomingVersions = params.incomingSyncVersions || {};

  const mergedIndices: Record<string, number> = { ...currentIndices };
  const mergedVersions: Record<string, number> = { ...currentVersions };

  const allKeys = new Set([
    ...Object.keys(currentIndices),
    ...Object.keys(incomingIndices),
  ]);

  for (const lessonKey of allKeys) {
    const curIdx = currentIndices[lessonKey];
    const curVer = Number(currentVersions[lessonKey]) || 0;
    const incIdx = incomingIndices[lessonKey];
    const incVer = Number(incomingVersions[lessonKey]) || 0;

    if (typeof incIdx !== 'number' || !Number.isFinite(incIdx)) {
      continue;
    }

    // If local has a strictly newer slideSyncVersion than incoming, keep local slide index!
    if (curVer > 0 && incVer < curVer) {
      mergedIndices[lessonKey] = typeof curIdx === 'number' ? curIdx : 0;
      mergedVersions[lessonKey] = curVer;
    } else {
      mergedIndices[lessonKey] = Math.max(0, Math.floor(incIdx));
      mergedVersions[lessonKey] = Math.max(curVer, incVer);
    }
  }

  return {
    activeSlideIndexByLesson: mergedIndices,
    slideSyncVersionByLesson: mergedVersions,
  };
}

export const BLANK_WHITE_SLIDE_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#ffffff"/></svg>'
  );

/**
 * Checks whether a slide deck contains genuine rendered PDF page bitmaps (WebP/PNG/JPEG/FileStorage)
 * rather than a blank white placeholder or legacy synthetic SVG text slides.
 */
export function isRealRenderedPdfSlideDeck(deck: any): boolean {
  if (!deck || typeof deck !== 'object') return false;
  if (deck.isBlankSlideDeck === true) return false;
  if (deck.hasRealPdfPages === true) return true;
  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  if (slides.length === 0) return false;
  return slides.some((s: any) => {
    if (!s || typeof s !== 'object' || s.isBlankSlide === true) return false;
    const url = typeof s.imageUrl === 'string' ? s.imageUrl.trim() : '';
    if (!url) return false;
    // Reject synthetic SVG text slides
    if (url.startsWith('data:image/svg+xml')) return false;
    return (
      url.startsWith('data:image/webp') ||
      url.startsWith('data:image/png') ||
      url.startsWith('data:image/jpeg') ||
      url.startsWith('data:image/jpg') ||
      url.startsWith('blob:') ||
      url.startsWith('/api/file-storage/slides/file/') ||
      Boolean(s.storageFileId)
    );
  });
}

/**
 * Checks whether a stored slide deck is a legacy auto-generated demo deck or synthetic SVG text deck (which should be wiped).
 * Real uploaded decks either contain real bitmap images (WebP/PNG/JPEG/FileStorage), HTML, or video, or are an explicit blank white slide deck.
 */
export function isLegacyDemoSlideDeck(deck: any): boolean {
  if (!deck || typeof deck !== 'object') return true;
  if (deck.isBlankSlideDeck === true) return false;
  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  if (slides.length === 0) return true;
  // Check if any slide has real user content (htmlContent, htmlEmbedUrl, videoUrl, or non-SVG bitmap imageUrl)
  const hasRealContent = slides.some(
    (s: any) =>
      Boolean(s?.htmlContent) ||
      Boolean(s?.htmlEmbedUrl) ||
      Boolean(s?.videoUrl) ||
      Boolean(s?.storageFileId) ||
      (typeof s?.imageUrl === 'string' &&
        !s.imageUrl.startsWith('data:image/svg+xml') &&
        (s.imageUrl.startsWith('/api/file-storage/slides/file/') ||
          s.imageUrl.startsWith('data:image/') ||
          s.imageUrl.startsWith('blob:')))
  );
  return !hasRealContent;
}

/**
 * Extracts text paragraphs from a PPTX slide XML string (<a:t>...</a:t>).
 */
export function extractTextFromPptxSlideXml(xmlContent: string): {
  title: string;
  bulletPoints: string[];
} {
  if (!xmlContent || typeof xmlContent !== 'string') {
    return { title: '', bulletPoints: [] };
  }
  const decodeXml = (str: string) =>
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

  // Group text runs by paragraph <a:p>...</a:p>
  const paragraphs: string[] = [];
  const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pRegex.exec(xmlContent)) !== null) {
    const pBody = pMatch[1];
    const tRegex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g;
    let tMatch: RegExpExecArray | null;
    const runs: string[] = [];
    while ((tMatch = tRegex.exec(pBody)) !== null) {
      runs.push(decodeXml(tMatch[1]));
    }
    const line = runs.join('').trim();
    if (line.length > 0) {
      paragraphs.push(line);
    }
  }

  if (paragraphs.length === 0) {
    return { title: '', bulletPoints: [] };
  }

  return {
    title: paragraphs[0],
    bulletPoints: paragraphs.slice(1, 8),
  };
}

/**
 * Generates a crisp 16:9 SVG Data URL slide image when a slide does not yet have an uploaded bitmap imageUrl,
 * ensuring the Slide Presenter & Student Live Room always display a genuine <img> Slide Image.
 */
export function generateFallbackSlideSvgDataUrl(params: {
  grade: number;
  period: number;
  slideIndex: number;
  totalSlides: number;
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  highlightNote?: string;
}): string {
  const esc = (str: string) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const bullets = (params.bulletPoints || []).slice(0, 4);
  const bulletSvg = bullets
    .map((b, i) => {
      const y = 310 + i * 74;
      const truncated = b.length > 92 ? b.slice(0, 89) + '...' : b;
      return `
        <g transform="translate(88, ${y})">
          <rect x="0" y="-26" width="38" height="38" rx="12" fill="#4f46e5" />
          <text x="19" y="0" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="800">${
            i + 1
          }</text>
          <text x="56" y="-1" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="22" font-weight="600">${esc(
            truncated
          )}</text>
        </g>
      `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="55%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="1160" cy="110" r="210" fill="#4f46e5" opacity="0.14"/>
    <circle cx="120" cy="640" r="180" fill="#ea580c" opacity="0.12"/>
    <rect x="64" y="48" width="1152" height="624" rx="28" fill="#1e293b" fill-opacity="0.55" stroke="#475569" stroke-width="2"/>
    <rect x="88" y="78" width="360" height="42" rx="21" fill="#312e81" stroke="#6366f1" stroke-width="1.5"/>
    <text x="268" y="105" text-anchor="middle" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="17" font-weight="800">KHỐI ${
      params.grade
    } • TIẾT ${params.period} • SLIDE ${params.slideIndex + 1}/${
    params.totalSlides
  }</text>
    <text x="1180" y="105" text-anchor="end" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" font-weight="700">CHUẨN GDPT 2018 TIN HỌC</text>
    <text x="88" y="182" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="900">${esc(
      params.title.length > 62 ? params.title.slice(0, 59) + '...' : params.title
    )}</text>
    <text x="88" y="226" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="21" font-weight="600">${esc(
      params.subtitle || 'Kiến thức trọng tâm bài giảng trực tuyến đồng bộ'
    )}</text>
    <line x1="88" y1="252" x2="1192" y2="252" stroke="#334155" stroke-width="2"/>
    ${bulletSvg}
    <rect x="88" y="596" width="1104" height="50" rx="14" fill="#0f172a" fill-opacity="0.7" stroke="#334155" stroke-width="1"/>
    <text x="112" y="627" fill="#fcd34d" font-family="system-ui, sans-serif" font-size="18" font-weight="700">💡 ${esc(
      params.highlightNote ||
        'Slide bài giảng đồng bộ trực tiếp từ Giáo viên sang màn hình Học sinh'
    )}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Guarantees that EVERY slide in a deck has a valid, sharp imageUrl.
 * If imageUrl is missing, empty, or stripped, automatically generates a high-fidelity SVG slide image
 * so the slide NEVER degrades into a text-only card in subsequent sessions!
 */
export function ensureDeckSlideImages(
  slides: ManagedLectureSlidePage[],
  params?: {
    grade?: number;
    period?: number;
  }
): ManagedLectureSlidePage[] {
  if (!Array.isArray(slides)) return [];
  const total = slides.length;
  const grade = params?.grade || 6;
  const period = params?.period || 1;

  return slides.map((s, idx) => {
    if (s.imageUrl && typeof s.imageUrl === 'string' && s.imageUrl.trim().length > 0) {
      return s;
    }
    const fallbackSvg = generateFallbackSlideSvgDataUrl({
      grade,
      period,
      slideIndex: idx,
      totalSlides: total,
      title: s.title || `Slide ${idx + 1}`,
      subtitle: s.subtitle,
      bulletPoints: s.bulletPoints,
      highlightNote: s.highlightNote,
    });
    return {
      ...s,
      imageUrl: fallbackSvg,
    };
  });
}

/**
 * Strips massive inline base64 data URLs from the session object before writing to localStorage
 * to prevent the 5MB browser QuotaExceededError. Full image data URLs and assets are safely
 * stored in IndexedDB and on the server file storage.
 */
export function stripLargeBlobsForLocalStorage<T extends Record<string, any>>(
  session: T,
  maxBase64Length = 4000
): T {
  if (!session || typeof session !== 'object') return session;
  const rawDecks = session.lectureSlidesByLesson;
  if (!rawDecks || typeof rawDecks !== 'object') return session;

  const cleanedDecks: Record<string, any> = {};
  for (const [lessonKey, deck] of Object.entries(rawDecks as Record<string, any>)) {
    if (!deck || typeof deck !== 'object') {
      cleanedDecks[lessonKey] = deck;
      continue;
    }
    const cleanDeck = { ...deck };
    if (typeof cleanDeck.pdfDataUrl === 'string' && cleanDeck.pdfDataUrl.length > maxBase64Length) {
      delete cleanDeck.pdfDataUrl;
    }
    if (Array.isArray(cleanDeck.slides)) {
      cleanDeck.slides = cleanDeck.slides.map((s: any) => {
        if (!s || typeof s !== 'object') return s;
        if (
          typeof s.imageUrl === 'string' &&
          s.imageUrl.startsWith('data:') &&
          s.imageUrl.length > maxBase64Length
        ) {
          const fallbackUrl = s.storageFileId
            ? `/api/file-storage/slides/file/${s.storageFileId}`
            : '';
          return {
            ...s,
            imageUrl: fallbackUrl,
            hasIndexedDbBackup: true,
          };
        }
        return s;
      });
    }
    cleanedDecks[lessonKey] = cleanDeck;
  }

  return {
    ...session,
    lectureSlidesByLesson: cleanedDecks,
  };
}

/**
 * Detects whether a slide imageUrl is a heavy in-memory payload (e.g. Base64 > thresholdChars).
 */
export function isHeavySlideImage(
  imageUrl?: string,
  thresholdChars = 8000
): boolean {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  return imageUrl.startsWith('data:image/') && imageUrl.length > thresholdChars;
}

/**
 * Creates a lightweight lazy placeholder for a slide.
 * Replaces heavy Base64 image payload with a lightweight SVG marker,
 * preserving all pedagogical metadata and setting `isLazyPlaceholder: true`.
 */
export function createLazySlidePlaceholder(
  slide: ManagedLectureSlidePage,
  lessonKey: string
): ManagedLectureSlidePage {
  if (!isHeavySlideImage(slide.imageUrl)) {
    return slide;
  }
  const sizeEstimateKb = Math.round((slide.imageUrl?.length || 0) / 1024);
  return {
    ...slide,
    isLazyPlaceholder: true,
    lazyLoadKey: `${lessonKey}-slide-${slide.slideNumber}`,
    originalSizeKb: sizeEstimateKb,
    imageUrl:
      slide.storageFileId
        ? `/api/file-storage/slides/file/${slide.storageFileId}`
        : generateFallbackSlideSvgDataUrl({
            grade: 6,
            period: 1,
            slideIndex: slide.slideNumber - 1,
            totalSlides: 1,
            title: slide.title,
            subtitle: slide.subtitle,
            bulletPoints: slide.bulletPoints,
            highlightNote: `[Lazy Loading] Ảnh Slide #${slide.slideNumber} sẵn sàng tải khi mở tiết học`,
          }),
  };
}

/**
 * Transforms all heavy slides in a deck into lazy placeholders to prevent memory bloat
 * when loading multiple lecture decks across the school curriculum.
 */
export function createLazySlideDeckPlaceholder<
  T extends { slides?: any[]; isLazyLoaded?: boolean }
>(deck: T, lessonKey: string): T {
  if (!deck || typeof deck !== 'object' || !Array.isArray(deck.slides)) {
    return deck;
  }
  const lazySlides = deck.slides.map((s) =>
    createLazySlidePlaceholder(s, lessonKey)
  );
  return {
    ...deck,
    isLazyLoaded: false,
    slides: lazySlides,
  };
}

/**
 * Hydrates full-resolution slide images into a deck on-demand when the teacher
 * or student switches to the lesson.
 */
export function hydrateSlideDeckImages<
  T extends { slides?: any[]; isLazyLoaded?: boolean }
>(deck: T, imageSourceMap: Record<number, string | Blob>): T {
  if (!deck || typeof deck !== 'object' || !Array.isArray(deck.slides)) {
    return deck;
  }
  const hydratedSlides = deck.slides.map((s: any) => {
    const slideNum = s.slideNumber;
    const incoming = imageSourceMap[slideNum];
    if (!incoming) return s;

    let imageUrl = s.imageUrl;
    let imageBlob: Blob | undefined;
    if (typeof Blob !== 'undefined' && incoming instanceof Blob) {
      imageBlob = incoming;
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        imageUrl = URL.createObjectURL(incoming);
      }
    } else if (typeof incoming === 'string' && incoming.trim().length > 0) {
      imageUrl = incoming;
    }

    return {
      ...s,
      imageUrl,
      ...(imageBlob ? { imageBlob } : {}),
      isLazyPlaceholder: false,
    };
  });

  return {
    ...deck,
    isLazyLoaded: true,
    slides: hydratedSlides,
  };
}

/**
 * Memory Governor: Keeps full heavy slide images ONLY for the currently active lesson
 * (and any explicitly requested keepKeys / recent lessons), while converting all other
 * decks into lightweight lazy placeholders. This avoids browser memory exhaustion
 * even when 30-100 lessons are stored in state.
 */
export function filterActiveSlideDecksForMemory<
  T extends { slides?: any[]; isLazyLoaded?: boolean }
>(
  allDecks: Record<string, T>,
  activeLessonKey: string,
  options?: {
    maxActiveDecks?: number;
    keepKeys?: string[];
  }
): Record<string, T> {
  if (!allDecks || typeof allDecks !== 'object') return allDecks;

  const keepSet = new Set<string>([
    activeLessonKey,
    ...(options?.keepKeys || []),
  ]);
  const result: Record<string, T> = {};

  for (const [key, deck] of Object.entries(allDecks)) {
    if (!deck || typeof deck !== 'object') {
      result[key] = deck;
      continue;
    }
    // If this deck belongs to the active lesson or keepSet, keep full images
    if (keepSet.has(key)) {
      result[key] = {
        ...deck,
        isLazyLoaded: true,
      };
    } else {
      // Offload heavy image payloads to lazy placeholders
      result[key] = createLazySlideDeckPlaceholder(deck, key);
    }
  }

  return result;
}

/**
 * Resolves the slide image for display: if the slide is a lazy placeholder and its
 * lesson is active, returns the best available URL or fallback.
 */
export function resolveSlideImageLazy(
  slide: ManagedLectureSlidePage,
  _activeLessonKey: string,
  _lessonKey: string
): string {
  if (!slide) return '';
  return slide.imageUrl || '';
}

export type SlideSourceInputKind =
  | 'google-drive'
  | 'google-slides'
  | 'local-path'
  | 'remote-url'
  | 'empty';

export interface ResolvedSlideSourceInput {
  kind: SlideSourceInputKind;
  rawInput: string;
  cleanInput: string;
  displayName: string;
  inferredFileType: 'pptx' | 'pdf' | 'html' | 'video' | 'image';
  driveFileId?: string;
  embedUrl?: string;
  downloadUrl?: string;
  exportPdfUrl?: string;
  normalizedLocalPath?: string;
}

/**
 * Parses a pasted URL or file path (from Google Drive, Google Slides, direct HTTP/HTTPS link,
 * or a local computer path like `C:\BaiGiang\Tiet1.pptx`, `D:/Slide/Bai1.pdf`, `file:///...`)
 * into a structured descriptor ready for immediate presentation on the Teacher Live screen.
 */
export function resolveSlideSourceInput(rawInput: string): ResolvedSlideSourceInput {
  const raw = String(rawInput || '').trim();
  // Strip surrounding double or single quotes (e.g. Windows "Copy as path" produces "C:\...\slide.pptx")
  const clean = raw.replace(/^["']+|["']+$/g, '').trim();

  if (!clean) {
    return {
      kind: 'empty',
      rawInput: raw,
      cleanInput: '',
      displayName: '',
      inferredFileType: 'pptx',
    };
  }

  const lower = clean.toLowerCase();
  const inferTypeFromExt = (str: string, fallback: 'pptx' | 'pdf' = 'pptx'): 'pptx' | 'pdf' | 'html' | 'video' | 'image' => {
    const s = str.toLowerCase().split('?')[0].split('#')[0];
    if (s.endsWith('.pdf')) return 'pdf';
    if (s.endsWith('.pptx') || s.endsWith('.ppt') || s.endsWith('.ppsx')) return 'pptx';
    if (s.endsWith('.html') || s.endsWith('.htm')) return 'html';
    if (s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.mov')) return 'video';
    if (s.endsWith('.png') || s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.webp')) return 'image';
    return fallback;
  };

  // 1. Google Slides presentation URL: https://docs.google.com/presentation/d/<ID>/...
  const gSlidesMatch = clean.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
  if (gSlidesMatch && gSlidesMatch[1]) {
    const fileId = gSlidesMatch[1];
    return {
      kind: 'google-slides',
      rawInput: raw,
      cleanInput: clean,
      displayName: `Google_Slides_${fileId.slice(0, 8)}.pptx`,
      inferredFileType: 'pptx',
      driveFileId: fileId,
      embedUrl: `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`,
      downloadUrl: `https://docs.google.com/presentation/d/${fileId}/export/pptx`,
      exportPdfUrl: `https://docs.google.com/presentation/d/${fileId}/export/pdf`,
    };
  }

  // 2. Google Drive file URL:
  // - https://drive.google.com/file/d/<ID>/view...
  // - https://drive.google.com/open?id=<ID>
  // - https://drive.google.com/uc?id=<ID>
  // - https://docs.google.com/file/d/<ID>/...
  const gDrivePathMatch = clean.match(/(?:drive|docs)\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  const gDriveQueryMatch = clean.match(/drive\.google\.com\/(?:open|uc|file)\?[^#]*?\bid=([a-zA-Z0-9_-]+)/i);
  const driveFileId = (gDrivePathMatch && gDrivePathMatch[1]) || (gDriveQueryMatch && gDriveQueryMatch[1]);

  if (driveFileId) {
    const inferredFileType = lower.includes('pdf') ? 'pdf' : 'pptx';
    const ext = inferredFileType === 'pdf' ? 'pdf' : 'pptx';
    return {
      kind: 'google-drive',
      rawInput: raw,
      cleanInput: clean,
      displayName: `Google_Drive_${driveFileId.slice(0, 8)}.${ext}`,
      inferredFileType,
      driveFileId,
      embedUrl: `https://drive.google.com/file/d/${driveFileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${driveFileId}`,
    };
  }

  // 3. Local computer path:
  // - file:///C:/... or file:///Users/...
  // - Windows drive path: C:\... or D:/...
  // - Windows UNC path: \\Server\Share\...
  // - Unix/macOS absolute/home path: /Users/..., /home/..., ~/...
  // - Bare filename ending with .pptx, .ppt, .pdf
  const isFileProtocol = /^file:\/\//i.test(clean);
  const isWindowsDrive = /^[a-zA-Z]:[\\/]/.test(clean);
  const isUncPath = /^\\\\[^\\]+/.test(clean);
  const isUnixLocalPath = /^(\/Users\/|\/home\/|\/var\/|\/tmp\/|\/mnt\/|\/media\/|~\/)/i.test(clean);
  const isBareSlideFilename = !/^https?:\/\//i.test(clean) && /\.(pptx?|ppsx|pdf|html?)$/i.test(clean);

  if (isFileProtocol || isWindowsDrive || isUncPath || isUnixLocalPath || isBareSlideFilename) {
    let normalizedLocalPath = clean;
    if (isFileProtocol) {
      try {
        normalizedLocalPath = decodeURIComponent(clean.replace(/^file:\/\/\/?/i, ''));
        // On Unix/macOS if it doesn't start with Windows drive letter like C:, restore leading slash
        if (!/^[a-zA-Z]:/.test(normalizedLocalPath) && !normalizedLocalPath.startsWith('/')) {
          normalizedLocalPath = '/' + normalizedLocalPath;
        }
      } catch {
        normalizedLocalPath = clean.replace(/^file:\/\/\/?/i, '');
      }
    }
    const parts = normalizedLocalPath.split(/[\\/]+/).filter(Boolean);
    const baseName = parts[parts.length - 1] || 'Slide_May_Tinh.pptx';
    const inferredFileType = inferTypeFromExt(baseName, 'pptx');

    return {
      kind: 'local-path',
      rawInput: raw,
      cleanInput: clean,
      displayName: baseName,
      inferredFileType,
      normalizedLocalPath,
    };
  }

  // 4. Remote HTTP/HTTPS URL (or domain URL)
  const fullUrl = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  const urlPath = fullUrl.split('?')[0].split('#')[0];
  const segments = urlPath.split('/').filter(Boolean);
  const lastSeg = segments[segments.length - 1] || 'Slide_Truc_Tuyen.pptx';
  const inferredFileType = inferTypeFromExt(urlPath, 'pptx');

  let embedUrl = fullUrl;
  if (inferredFileType === 'pptx') {
    // Use Microsoft Office Online Viewer for remote .pptx/.ppt links so it renders directly in iframe
    if (/\.(pptx?|ppsx)$/i.test(urlPath)) {
      embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    }
  }

  return {
    kind: 'remote-url',
    rawInput: raw,
    cleanInput: fullUrl,
    displayName: decodeURIComponent(lastSeg),
    inferredFileType,
    embedUrl,
    downloadUrl: fullUrl,
  };
}

export const DEFAULT_FIXED_SLIDE_ROOT_FOLDER = 'D:\\BaiGiangTinHoc';

export interface FixedSlideFolderMapping {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  rootFolder: string;
  gradeFolderName: string;
  gradeFolderPath: string;
  primaryFileName: string;
  primaryFilePath: string;
  candidateRelativePaths: string[];
  displayLabel: string;
}

/**
 * Normalizes a user-configured fixed slide root folder path so that:
 * - Trailing slashes or quotes are removed.
 * - If the user pasted a path ending in a file name (e.g. `...\Tin 6\Tiet 1.pdf`), the file name is stripped.
 * - If the user entered a path already ending in a grade folder (e.g. `C:\BaiGiang\Slide\Tin 6`),
 *   the trailing `Tin 6` segment is stripped so `buildFixedSlideFolderMapping` never duplicates `\Tin 6\Tin 6`.
 */
export function normalizeFixedSlideRootFolder(customRootFolder?: string): string {
  const raw =
    String(customRootFolder || DEFAULT_FIXED_SLIDE_ROOT_FOLDER)
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .trim() || DEFAULT_FIXED_SLIDE_ROOT_FOLDER;

  const sep = raw.includes('\\') ? '\\' : '/';
  let cleaned = raw.replace(/[\\/]+$/, '');

  // Strip trailing file segment if user pasted a file path like "...\Tin 6\Tiet 1.pdf"
  if (/\.(pdf|pptx?|ppsx|html?)$/i.test(cleaned)) {
    const lastSepIdx = Math.max(cleaned.lastIndexOf('\\'), cleaned.lastIndexOf('/'));
    if (lastSepIdx > 0) {
      cleaned = cleaned.slice(0, lastSepIdx).replace(/[\\/]+$/, '');
    }
  }

  // Strip trailing grade folder segment if user included "\Tin 6", "\Tin 7", "\Khối 8", etc.
  const trailingGradeRegex =
    /[\\/](?:tin\s*h[oọ]c|tin|kh[oố]i|khoi|l[oớ]p|lop)[_\s-]*[6789]$/i;
  if (trailingGradeRegex.test(cleaned)) {
    cleaned = cleaned.replace(trailingGradeRegex, '').replace(/[\\/]+$/, '');
  }

  return cleaned || (sep === '\\' ? DEFAULT_FIXED_SLIDE_ROOT_FOLDER : '/BaiGiangTinHoc');
}

/**
 * Builds deterministic fixed-folder mapping for a specific Grade (6, 7, 8, 9) and Period (1..29).
 * Exclusively maps `.pdf` lecture files (e.g. `Tin 6\Tiet 1.pdf`) to extract Slide Images into the Slide Image Cache
 * and push them onto `Slide Bài Giảng` ready for Live presentation.
 */
export function buildFixedSlideFolderMapping(
  grade: 6 | 7 | 8 | 9,
  period: number,
  customRootFolder?: string
): FixedSlideFolderMapping {
  const safeGrade = ([6, 7, 8, 9].includes(Number(grade)) ? Number(grade) : 6) as 6 | 7 | 8 | 9;
  const safePeriod = Math.max(1, Math.min(29, Math.round(Number(period) || 1)));
  const cleanRoot = normalizeFixedSlideRootFolder(customRootFolder);
  const sep = cleanRoot.includes('\\') ? '\\' : '/';

  const gradeFolderName = `Tin ${safeGrade}`;
  const gradeFolderPath = `${cleanRoot}${sep}${gradeFolderName}`;
  const paddedPeriod = String(safePeriod).padStart(2, '0');
  const primaryFileName = `Tiet ${safePeriod}.pdf`;
  const primaryFilePath = `${gradeFolderPath}${sep}${primaryFileName}`;

  const gradeVariants = [
    `Tin ${safeGrade}`,
    `Tin_${safeGrade}`,
    `Tin${safeGrade}`,
    `Khoi ${safeGrade}`,
    `Khối ${safeGrade}`,
    `Khoi_${safeGrade}`,
  ];
  const fileVariants = [
    `Tiet ${safePeriod}.pdf`,
    `Tiết ${safePeriod}.pdf`,
    `Tiet_${safePeriod}.pdf`,
    `Tiet_${paddedPeriod}.pdf`,
    `Tiet_${safePeriod}_Tin_${safeGrade}.pdf`,
    `Bai ${safePeriod}.pdf`,
    `Bài ${safePeriod}.pdf`,
  ];

  const candidateRelativePaths: string[] = [];
  for (const gFolder of gradeVariants) {
    for (const fName of fileVariants) {
      candidateRelativePaths.push(`${gFolder}/${fName}`);
    }
  }

  return {
    lessonKey: `k${safeGrade}-tiet-${safePeriod}`,
    grade: safeGrade,
    period: safePeriod,
    rootFolder: cleanRoot,
    gradeFolderName,
    gradeFolderPath,
    primaryFileName,
    primaryFilePath,
    candidateRelativePaths,
    displayLabel: `Thư mục ${gradeFolderName} / Tiết ${safePeriod} (PDF → Ảnh Slide)`,
  };
}

export interface MatchedSlideFileDescriptor {
  lessonKey: string;
  grade: 6 | 7 | 8 | 9;
  period: number;
  fileName: string;
  inferredFileType: 'pdf';
}

/**
 * Matches a `.pdf` file path or relative path from a fixed directory (e.g. "BaiGiang/Tin 6/Tiet 1.pdf",
 * "Tin 7/Tiết 15 - Bài 8.pdf", "Khoi_8/Tiet_04.pdf") to its corresponding Grade (6..9)
 * and Period (1..29). Strictly accepts `.pdf` files only so they can be extracted into Slide Images.
 */
export function matchFileToGradeAndPeriod(
  relativePathOrFileName: string,
  fallbackGrade: 6 | 7 | 8 | 9 = 6
): MatchedSlideFileDescriptor | null {
  const raw = String(relativePathOrFileName || '').trim();
  if (!raw) return null;

  const normalized = raw.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  const fileName = parts[parts.length - 1] || '';
  const lowerFile = fileName.toLowerCase();

  // Strictly accept ONLY .pdf files for fixed folder mapping -> slide image extraction
  if (!/\.pdf$/i.test(lowerFile)) {
    return null;
  }

  // 1. Detect Grade (6, 7, 8, 9) from folder path or filename
  let detectedGrade: 6 | 7 | 8 | 9 | null = null;
  const fullLower = normalized.toLowerCase();
  const gradeMatch = fullLower.match(/(?:tin\s*h[oọ]c|tin|kh[oố]i|khoi|l[oớ]p|lop|grade|k)[_\s-]*([6789])(?![0-9])/i);
  if (gradeMatch && gradeMatch[1]) {
    detectedGrade = Number(gradeMatch[1]) as 6 | 7 | 8 | 9;
  }
  const finalGrade = detectedGrade || fallbackGrade;

  // 2. Detect Period (1..29) from filename
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  let detectedPeriod: number | null = null;

  // Explicit "Tiet X" / "Tiết X" / "Period X" / "T01" / "Bai X" pattern
  const explicitPeriodMatch = nameWithoutExt.match(
    /(?:ti[eế]t|tiet|period|b[aà]i|bai|t)[_\s-]*0*([1-9]|[12][0-9])(?![0-9])/i
  );
  if (explicitPeriodMatch && explicitPeriodMatch[1]) {
    const p = Number(explicitPeriodMatch[1]);
    if (p >= 1 && p <= 29) {
      detectedPeriod = p;
    }
  }

  // Fallback: leading number in filename like "01_ThongTin.pdf" or "1 - Bai 1.pdf"
  if (!detectedPeriod) {
    const leadingNumMatch = nameWithoutExt.match(/^0*([1-9]|[12][0-9])(?:[_\s.-]|$)/);
    if (leadingNumMatch && leadingNumMatch[1]) {
      const p = Number(leadingNumMatch[1]);
      if (p >= 1 && p <= 29) {
        detectedPeriod = p;
      }
    }
  }

  if (!detectedPeriod) return null;

  return {
    lessonKey: `k${finalGrade}-tiet-${detectedPeriod}`,
    grade: finalGrade,
    period: detectedPeriod,
    fileName,
    inferredFileType: 'pdf',
  };
}

/**
 * Builds a Slide Image Deck for `(grade, period)` from the fixed `.pdf` folder mapping.
 * - When `extractedPageImages` is provided (from rendering a real `.pdf` file via `pdfjs-dist`),
 *   it preserves the exact original PDF visual pages (`hasRealPdfPages: true`, `isBlankSlideDeck: false`).
 * - When `extractedPageImages` is omitted or empty (no `.pdf` file found for this period),
 *   it returns a 1-page Blank White Slide (`trang slide trắng`, `isBlankSlideDeck: true`) instead of synthetic text slides.
 */
export function buildFixedFolderPdfSlideCacheDeck(params: {
  grade: 6 | 7 | 8 | 9;
  period: number;
  rootFolder?: string;
  lessonTitle?: string;
  topic?: string;
  yccd?: string;
  extractedPageImages?: string[];
  extractedPageTexts?: string[];
  sourceFileName?: string;
  sizeKb?: number;
}) {
  const mapping = buildFixedSlideFolderMapping(
    params.grade,
    params.period,
    params.rootFolder
  );
  const cleanTitle =
    String(params.lessonTitle || `Tiết ${mapping.period}: Bài học Tin học ${mapping.grade}`)
      .replace(/^Tiết\s*\d+:\s*/i, '')
      .trim() || `Bài học Tin học ${mapping.grade}`;
  const cleanTopic =
    String(params.topic || `Chủ đề Tin học Khối ${mapping.grade}`).trim();

  const hasExtractedPages =
    Array.isArray(params.extractedPageImages) && params.extractedPageImages.length > 0;

  if (hasExtractedPages) {
    const total = params.extractedPageImages!.length;
    const rawSlides: ManagedLectureSlidePage[] = params.extractedPageImages!.map((imgUrl, idx) => {
      const pageTxt = String(params.extractedPageTexts?.[idx] || '').trim();
      return {
        slideNumber: idx + 1,
        title: `Slide ${idx + 1}/${total}: Tiết ${mapping.period} — ${cleanTitle}`,
        subtitle: `${mapping.gradeFolderPath} • ${params.sourceFileName || mapping.primaryFileName}`,
        bulletPoints: pageTxt
          ? [
              pageTxt.slice(0, 180),
              `Bản gốc PDF: ${mapping.primaryFilePath} (Trang ${idx + 1}/${total})`,
            ]
          : [
              `Trang Slide #${idx + 1}/${total} nguyên bản từ tệp PDF ${mapping.primaryFilePath}.`,
              `Chủ đề: ${cleanTopic}`,
            ],
        highlightNote: `🖼️ Bản gốc PDF (${mapping.gradeFolderName} / ${mapping.primaryFileName} • Trang ${idx + 1}/${total})`,
        imageUrl: imgUrl,
      };
    });

    const displayFileName = params.sourceFileName || mapping.primaryFileName;
    const totalKb = params.sizeKb || rawSlides.length * 48;

    return {
      lessonKey: mapping.lessonKey,
      grade: mapping.grade,
      period: mapping.period,
      fileName: `${displayFileName} (${mapping.gradeFolderName} • Bản gốc PDF)`,
      fileType: 'pdf' as const,
      fileSize: `${totalKb} KB`,
      fileSizeLabel: `Bản gốc PDF: ${mapping.primaryFilePath}`,
      uploadedAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      storageBucket: 'slide-storage-1gb' as const,
      totalCompressedKb: totalKb,
      isUserUploaded: true,
      hasRealPdfPages: true,
      isBlankSlideDeck: false,
      isLazyLoaded: true,
      mappedFolderPath: mapping.gradeFolderPath,
      mappedFilePath: mapping.primaryFilePath,
      slides: rawSlides,
    };
  }

  // No PDF file found -> Return a 1-page Blank White Slide ("trang slide trắng")
  const blankSlide: ManagedLectureSlidePage & { isBlankSlide?: boolean } = {
    slideNumber: 1,
    title: `Trang Slide trắng (Chưa tìm thấy tệp ${mapping.primaryFileName})`,
    subtitle: `${mapping.primaryFilePath}`,
    bulletPoints: [],
    highlightNote: `Trang Slide trắng — Chưa có tệp PDF tại ${mapping.primaryFilePath}`,
    imageUrl: BLANK_WHITE_SLIDE_DATA_URL,
    isBlankSlide: true,
  };

  return {
    lessonKey: mapping.lessonKey,
    grade: mapping.grade,
    period: mapping.period,
    fileName: `Trang Slide trắng (${mapping.primaryFileName})`,
    fileType: 'pdf' as const,
    fileSize: '0 KB',
    fileSizeLabel: `Chưa tìm thấy tệp PDF: ${mapping.primaryFilePath}`,
    uploadedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    storageBucket: 'slide-storage-1gb' as const,
    totalCompressedKb: 1,
    isUserUploaded: false,
    hasRealPdfPages: false,
    isBlankSlideDeck: true,
    isLazyLoaded: true,
    mappedFolderPath: mapping.gradeFolderPath,
    mappedFilePath: mapping.primaryFilePath,
    slides: [blankSlide],
  };
}

/**
 * Prunes non-visible slide images from JavaScript heap memory to prevent browser tab crashes
 * on low-spec lab PCs (2GB - 4GB RAM).
 * Keeps a sliding window of [currentSlideIndex - windowRadius, currentSlideIndex + windowRadius].
 * Slides outside this window have heavy image strings cleared into placeholder references
 * while preserving title, metadata, and backup keys so they can be reloaded on-demand.
 */
export function pruneSlideDeckMemory<T extends ManagedLectureSlidePage>(
  slides: T[],
  currentSlideIndex: number,
  windowRadius = 2
): {
  prunedSlides: T[];
  freedCount: number;
} {
  if (!Array.isArray(slides) || slides.length === 0) {
    return { prunedSlides: slides, freedCount: 0 };
  }

  let freedCount = 0;
  const prunedSlides = slides.map((slide, idx) => {
    const isWithinWindow = Math.abs(idx - currentSlideIndex) <= windowRadius;
    if (isWithinWindow) {
      return slide;
    }

    // Outside the visible window: if it holds a large base64 dataUrl (> 50KB), clear it to placeholder
    if (slide.imageUrl && slide.imageUrl.startsWith('data:image/') && slide.imageUrl.length > 50000) {
      freedCount++;
      return {
        ...slide,
        imageUrl: undefined,
        isLazyPlaceholder: true,
        lazyLoadKey: slide.lazyLoadKey || `slide_p${slide.slideNumber}`,
      };
    }
    return slide;
  });

  return { prunedSlides, freedCount };
}

/**
 * Formats interactive slide and simulation URLs (Google Slides, Canva, PhET, Scratch, Office 365)
 * into safe, high-performance embeddable URLs for live classrooms.
 */
export function formatInteractiveWebSlideUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // Google Slides edit/present link -> embed link
  if (trimmed.includes('docs.google.com/presentation/d/')) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
    }
  }

  // Canva view link -> embed link
  if (trimmed.includes('canva.com/design/')) {
    if (!trimmed.includes('/view?embed')) {
      return trimmed.replace(/\/view(\?.*)?$/, '/view?embed');
    }
  }

  return trimmed;
}
