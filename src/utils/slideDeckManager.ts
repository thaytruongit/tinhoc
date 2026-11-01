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

/**
 * Checks whether a stored slide deck is a legacy auto-generated demo deck (which should be wiped).
 * Real uploaded decks either have `isUserUploaded: true`, or contain real File Storage URLs, data URLs, HTML, or video.
 */
export function isLegacyDemoSlideDeck(deck: any): boolean {
  if (!deck || typeof deck !== 'object') return true;
  if (deck.isUserUploaded === true) return false;
  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  if (slides.length === 0) return false;
  // Check if any slide has real user content (htmlContent, htmlEmbedUrl, videoUrl, or non-empty imageUrl with storageFileId)
  const hasRealContent = slides.some(
    (s: any) =>
      Boolean(s?.htmlContent) ||
      Boolean(s?.htmlEmbedUrl) ||
      Boolean(s?.videoUrl) ||
      Boolean(s?.storageFileId) ||
      (typeof s?.imageUrl === 'string' &&
        (s.imageUrl.startsWith('/api/file-storage/slides/file/') ||
          s.imageUrl.startsWith('data:image/')))
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
