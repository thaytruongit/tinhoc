export interface ManagedLectureSlidePage {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  highlightNote?: string;
  imageUrl?: string;
  storageFileId?: string;
  compressedSizeKb?: number;
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
