/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LectureSlideDeck, LectureSlidePage } from '../data/mockCurriculumData';

const DB_NAME = 'cloudplay_slides_db_v1';
const STORE_NAME = 'lecture_slide_decks';
const DB_VERSION = 1;

export interface StoredSlidePageRecord extends Omit<LectureSlidePage, 'imageUrl'> {
  imageUrl?: string;
  imageBlob?: Blob;
  hasBlobStorage?: boolean;
}

export interface StoredSlideDeckRecord extends Omit<LectureSlideDeck, 'slides'> {
  lessonKey: string;
  savedAtIso: string;
  slides: StoredSlidePageRecord[];
  pdfBlob?: Blob;
}

/**
 * Converts a Base64 Data URL (e.g. data:image/webp;base64,...) into a binary Blob.
 * Storing Blobs directly in IndexedDB avoids large V8 string allocations and heap exhaustion.
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null;
  }
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
    const b64Data = parts[1];
    if (!b64Data) return null;

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const binaryStr = window.atob(b64Data);
      const len = binaryStr.length;
      const u8arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        u8arr[i] = binaryStr.charCodeAt(i);
      }
      return new Blob([u8arr], { type: mime });
    } else if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(b64Data, 'base64');
      return new Blob([buf], { type: mime });
    }
    return null;
  } catch (err) {
    console.warn('[dataUrlToBlob notice]:', err);
    return null;
  }
}

/**
 * Converts a binary Blob back into a Base64 Data URL for <img src="..." /> display.
 */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  if (!blob || !(blob instanceof Blob)) return '';
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(String(reader.result || ''));
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  }
  try {
    const arrayBuffer = await blob.arrayBuffer();
    if (typeof Buffer !== 'undefined') {
      const b64 = Buffer.from(arrayBuffer).toString('base64');
      const mime = blob.type || 'image/webp';
      return `data:${mime};base64,${b64}`;
    }
  } catch {
    // fallback empty
  }
  return '';
}

/**
 * Opens or upgrades the IndexedDB instance for persistent slide deck storage.
 * IndexedDB provides 500MB+ storage capacity in modern browsers, completely eliminating
 * the 5MB browser localStorage QuotaExceededError when storing high-resolution slide images.
 */
function openSlidesDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'lessonKey' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        console.warn('[IndexedDB Slide Storage] Open error:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('[IndexedDB Slide Storage] Initialization failed:', e);
      resolve(null);
    }
  });
}

/**
 * Prepares a LectureSlideDeck for stable IndexedDB storage, converting heavy Base64
 * data URLs into native Blob objects where possible while preserving URL references.
 */
export function prepareDeckForStorage(lessonKey: string, deck: LectureSlideDeck): StoredSlideDeckRecord {
  const safeSlides = Array.isArray(deck.slides) ? deck.slides : [];
  const storedSlides: StoredSlidePageRecord[] = safeSlides.map((s) => {
    let imageBlob: Blob | undefined = (s as any).imageBlob;
    let imageUrl = s.imageUrl;

    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
      const convertedBlob = dataUrlToBlob(imageUrl);
      if (convertedBlob) {
        imageBlob = convertedBlob;
      }
    }

    return {
      ...s,
      imageUrl,
      ...(imageBlob ? { imageBlob, hasBlobStorage: true } : {}),
    };
  });

  let pdfBlob: Blob | undefined;
  if (typeof deck.pdfDataUrl === 'string' && deck.pdfDataUrl.startsWith('data:')) {
    const convertedPdf = dataUrlToBlob(deck.pdfDataUrl);
    if (convertedPdf) {
      pdfBlob = convertedPdf;
    }
  }

  return {
    ...deck,
    lessonKey,
    savedAtIso: new Date().toISOString(),
    slides: storedSlides,
    ...(pdfBlob ? { pdfBlob } : {}),
  };
}

/**
 * Reconstructs a LectureSlideDeck from an IndexedDB record, ensuring all slide images
 * have accessible Base64 data URLs or Object URLs so they render directly in <img> tags.
 */
export async function reconstructDeckFromRecord(record: any): Promise<LectureSlideDeck> {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const rawSlides: any[] = Array.isArray(record.slides) ? record.slides : [];
  const hydratedSlides: LectureSlidePage[] = await Promise.all(
    rawSlides.map(async (s: any) => {
      let imageUrl = typeof s.imageUrl === 'string' ? s.imageUrl : '';

      // If imageUrl is empty or stripped but an imageBlob is present in IndexedDB, reconstruct it
      if ((!imageUrl || imageUrl.length < 50) && s.imageBlob instanceof Blob) {
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          try {
            imageUrl = URL.createObjectURL(s.imageBlob);
          } catch {
            imageUrl = await blobToDataUrl(s.imageBlob);
          }
        } else {
          imageUrl = await blobToDataUrl(s.imageBlob);
        }
      }

      return {
        ...s,
        imageUrl,
      };
    })
  );

  let pdfDataUrl = record.pdfDataUrl;
  if (!pdfDataUrl && record.pdfBlob instanceof Blob) {
    pdfDataUrl = await blobToDataUrl(record.pdfBlob);
  }

  return {
    ...record,
    slides: hydratedSlides,
    ...(pdfDataUrl ? { pdfDataUrl } : {}),
  };
}

/**
 * Saves a lecture slide deck persistently into IndexedDB with native Blob / Base64 stability.
 */
export async function saveSlideDeckToIndexedDb(
  lessonKey: string,
  deck: LectureSlideDeck
): Promise<boolean> {
  if (!deck || typeof deck !== 'object') return false;

  // Guard against overwriting an existing full slide deck in IndexedDB with an in-memory lazy placeholder stub
  if (
    (deck as any).isLazyLoaded === false &&
    Array.isArray(deck.slides) &&
    deck.slides.length > 0 &&
    deck.slides.every((s: any) => s.isLazyPlaceholder === true)
  ) {
    return false;
  }

  const db = await openSlidesDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = prepareDeckForStorage(lessonKey, deck);
      const req = store.put(record);

      req.onsuccess = () => {
        resolve(true);
      };

      req.onerror = (err) => {
        console.warn('[IndexedDB Slide Storage] Put error for', lessonKey, err);
        resolve(false);
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch (e) {
      console.warn('[IndexedDB Slide Storage] Write transaction error:', e);
      resolve(false);
    }
  });
}

/**
 * Retrieves a single lecture slide deck by lessonKey from IndexedDB with full Blob / Base64 image reconstruction.
 */
export async function getSlideDeckFromIndexedDb(
  lessonKey: string
): Promise<LectureSlideDeck | null> {
  const db = await openSlidesDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(lessonKey);

      req.onsuccess = async () => {
        const rawResult = req.result;
        if (!rawResult) {
          resolve(null);
          return;
        }
        try {
          const reconstructed = await reconstructDeckFromRecord(rawResult);
          resolve(reconstructed);
        } catch {
          resolve(rawResult);
        }
      };

      req.onerror = () => {
        resolve(null);
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieves ALL saved lecture slide decks from IndexedDB and reconstructs Blob / Base64 images.
 */
export async function getAllSlideDecksFromIndexedDb(): Promise<
  Record<string, LectureSlideDeck>
> {
  const db = await openSlidesDatabase();
  if (!db) return {};

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = async () => {
        const list: any[] = req.result || [];
        const map: Record<string, LectureSlideDeck> = {};
        for (const item of list) {
          if (item && item.lessonKey) {
            try {
              map[item.lessonKey] = await reconstructDeckFromRecord(item);
            } catch {
              map[item.lessonKey] = item;
            }
          }
        }
        resolve(map);
      };

      req.onerror = () => {
        resolve({});
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch {
      resolve({});
    }
  });
}

/**
 * Loads the slide deck for a single lesson on demand from IndexedDB (Lazy Loading pattern).
 */
export async function getSlideDeckForLessonFromIndexedDb(
  lessonKey: string
): Promise<LectureSlideDeck | null> {
  return getSlideDeckFromIndexedDb(lessonKey);
}

/**
 * Deletes a single slide deck by lessonKey from IndexedDB.
 */
export async function deleteSlideDeckFromIndexedDb(
  lessonKey: string
): Promise<boolean> {
  const db = await openSlidesDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(lessonKey);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);

      tx.oncomplete = () => db.close();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Clears ALL stored slide decks from IndexedDB ("xoá trắng dữ liệu slide demo và toàn bộ slide").
 */
export async function clearAllSlideDecksFromIndexedDb(): Promise<boolean> {
  const db = await openSlidesDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);

      tx.oncomplete = () => db.close();
    } catch {
      resolve(false);
    }
  });
}
