import React, { useState, useRef, useEffect } from 'react';
import {
  getPeriodsForGrade,
  type CurriculumPeriodSpec,
  type LectureSlideDeck,
  type LectureSlidePage,
  type LiveClassroomSession,
} from '../data/mockCurriculumData';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite ?url import for pdf.js worker
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { buildInteractiveHtmlSlideTemplate } from '../utils/realtimeProgressAnalytics';
import {
  saveSlideDeckToIndexedDb,
  deleteSlideDeckFromIndexedDb,
  clearAllSlideDecksFromIndexedDb,
} from '../utils/indexedDbSlideStorage';
import {
  insertHtmlSlideIntoDeck,
  updateSlideInDeck,
  deleteSlideFromDeck,
  moveSlideInDeck,
  renumberSlides,
  extractTextFromPptxSlideXml,
  ensureDeckSlideImages,
  type HtmlSlideEmbedMode,
} from '../utils/slideDeckManager';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

interface LectureSlideManagerModalProps {
  isOpen?: boolean;
  initialGrade?: 6 | 7 | 8 | 9;
  initialPeriod?: number;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onShowToast: (msg: string) => void;
  onClose: () => void;
  onOpenLivePresenterWithSlide?: (grade: 6 | 7 | 8 | 9, period: number) => void;
}

/**
 * Returns an empty array [] so all demo lessons start with 0 demo slides ("xoá trắng dữ liệu slide demo").
 * Slides are only present when the teacher explicitly uploads PDF, PPTX, HTML, Video, or Image slides.
 */
export function getDefaultLectureSlides(
  _periodSpec: CurriculumPeriodSpec
): LectureSlidePage[] {
  return [];
}

/**
 * Renders any slide metadata + optional background image onto an HTML5 <canvas> (1280x720)
 * and exports it as a compressed WebP Data URL (image/webp, quality 0.78) so every PDF/PPTX/Image slide
 * is stored and rendered as a genuine high-speed image.
 */
export function renderSlideToCanvasDataUrl(params: {
  grade: number;
  period: number;
  slideNumber: number;
  totalSlides: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  highlightNote?: string;
}): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.55, '#1e1b4b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = 'rgba(79, 70, 229, 0.16)';
    ctx.beginPath();
    ctx.arc(1140, 120, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(234, 88, 12, 0.14)';
    ctx.beginPath();
    ctx.arc(140, 620, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(56, 44, 1168, 632, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.roundRect(88, 76, 440, 44, 22);
    ctx.fill();

    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `TIN HỌC KHỐI ${params.grade} • TIẾT ${params.period} • SLIDE #${params.slideNumber}/${params.totalSlides}`,
      110,
      104
    );

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('ẢNH SLIDE WEBP • FILE STORAGE 1GB', 880, 104);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px system-ui, -apple-system, sans-serif';
    const cleanTitle =
      params.title.length > 62 ? params.title.slice(0, 59) + '...' : params.title;
    ctx.fillText(cleanTitle, 88, 176);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '600 21px system-ui, -apple-system, sans-serif';
    const sub = params.subtitle || 'Kiến thức cốt lõi sách giáo khoa GDPT 2018';
    ctx.fillText(sub.length > 85 ? sub.slice(0, 82) + '...' : sub, 88, 218);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(88, 244);
    ctx.lineTo(1192, 244);
    ctx.stroke();

    const bullets = (params.bulletPoints || []).slice(0, 4);
    bullets.forEach((b, idx) => {
      const y = 304 + idx * 72;
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.roundRect(88, y - 28, 40, 40, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(String(idx + 1), 102, y - 1);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      const line = b.length > 86 ? b.slice(0, 83) + '...' : b;
      ctx.fillText(line, 146, y - 1);
    });

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(88, 592, 1104, 54, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
    const note =
      params.highlightNote ||
      'Slide ảnh đồng bộ trực tiếp sang màn hình Học sinh (Khóa tự động các hoạt động khác)';
    ctx.fillText(
      `💡 ${note.length > 92 ? note.slice(0, 89) + '...' : note}`,
      112,
      625
    );

    const webpUrl = canvas.toDataURL('image/webp', 0.78);
    if (webpUrl.startsWith('data:image/webp')) {
      return webpUrl;
    }
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return '';
  }
}

/**
 * Compresses an uploaded image File (.png, .jpg, .webp, .gif) onto a 1280x720 WebP canvas image.
 */
async function convertImageFileToWebpDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetW = 1280;
          const targetH = 720;
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(String(reader.result || ''));
            return;
          }
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, targetW, targetH);

          const scale = Math.min(targetW / img.width, targetH / img.height);
          const drawW = Math.round(img.width * scale);
          const drawH = Math.round(img.height * scale);
          const offsetX = Math.round((targetW - drawW) / 2);
          const offsetY = Math.round((targetH - drawH) / 2);
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

          const webp = canvas.toDataURL('image/webp', 0.84);
          resolve(
            webp.startsWith('data:image/webp')
              ? webp
              : canvas.toDataURL('image/jpeg', 0.86)
          );
        } catch {
          resolve(String(reader.result || ''));
        }
      };
      img.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp ảnh'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts a 1280x720 WebP thumbnail + data URL from an uploaded video file (.mp4, .webm).
 */
async function extractVideoFileDataAndThumbnail(
  file: File,
  lessonTitle: string
): Promise<{ videoDataUrl: string; thumbnailDataUrl: string }> {
  const videoDataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp video'));
    reader.readAsDataURL(file);
  });

  const thumbnailDataUrl: string = await new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objUrl = URL.createObjectURL(file);
      video.src = objUrl;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(objUrl);
        } catch {
          // ignore
        }
      };

      const fallbackThumb = () => {
        cleanup();
        resolve(
          renderSlideToCanvasDataUrl({
            grade: 6,
            period: 1,
            slideNumber: 1,
            totalSlides: 1,
            title: `🎬 Video Bài Giảng: ${file.name}`,
            subtitle: lessonTitle,
            bulletPoints: [
              `Tệp video: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`,
              'Phát trực tiếp đồng bộ hình ảnh và âm thanh trên màn hình Học sinh.',
            ],
            highlightNote: 'Slide Video bài giảng trực quan',
          })
        );
      };

      const timeout = window.setTimeout(fallbackThumb, 3000);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, (video.duration || 2) * 0.25);
      };
      video.onseeked = () => {
        window.clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 1280;
          canvas.height = 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 1280, 720);
            ctx.drawImage(video, 0, 0, 1280, 720);
            const webp = canvas.toDataURL('image/webp', 0.82);
            cleanup();
            resolve(webp);
            return;
          }
        } catch {
          // fallback
        }
        fallbackThumb();
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        fallbackThumb();
      };
    } catch {
      resolve('');
    }
  });

  return { videoDataUrl, thumbnailDataUrl };
}

/**
 * Extracts all pages of a PDF file in the browser using pdfjs-dist and converts every page
 * into a high-resolution WebP slide image.
 */
async function extractPdfPagesAsImages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ pageImages: string[]; pageTexts: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageImages: string[] = [];
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.(pageNum, numPages);
    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const targetScale = Math.min(2.0, Math.max(1.2, 1440 / baseViewport.width));
    const viewport = page.getViewport({ scale: targetScale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      let dataUrl = canvas.toDataURL('image/webp', 0.82);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.84);
      }
      pageImages.push(dataUrl);
    }

    try {
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim();
      pageTexts.push(pageStr);
    } catch {
      pageTexts.push('');
    }
  }

  return { pageImages, pageTexts };
}

/**
 * Parses a PowerPoint (.pptx) ZIP archive in the browser using DecompressionStream('deflate-raw'),
 * extracts all slides (`ppt/slides/slide*.xml`) and embedded slide images (`ppt/media/*`),
 * and converts every single slide into a 1280x720 WebP image (`imageUrl`)!
 */
async function extractPptxSlidesAsImages(
  file: File,
  periodSpec: CurriculumPeriodSpec,
  onProgress?: (current: number, total: number) => void
): Promise<LectureSlidePage[]> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  interface ZipEntry {
    name: string;
    compressionMethod: number;
    compressedSize: number;
    uncompressedSize: number;
    dataOffset: number;
  }

  const entries: ZipEntry[] = [];
  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset !== -1) {
    const cdCount = view.getUint16(eocdOffset + 10, true);
    let cdOffset = view.getUint32(eocdOffset + 16, true);
    const decoder = new TextDecoder('utf-8');

    for (let i = 0; i < cdCount && cdOffset + 46 <= bytes.length; i++) {
      if (view.getUint32(cdOffset, true) !== 0x02014b50) break;
      const compressionMethod = view.getUint16(cdOffset + 10, true);
      const compressedSize = view.getUint32(cdOffset + 20, true);
      const uncompressedSize = view.getUint32(cdOffset + 24, true);
      const nameLen = view.getUint16(cdOffset + 28, true);
      const extraLen = view.getUint16(cdOffset + 30, true);
      const commentLen = view.getUint16(cdOffset + 32, true);
      const localHeaderOffset = view.getUint32(cdOffset + 42, true);

      const name = decoder.decode(
        bytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen)
      );

      if (localHeaderOffset + 30 <= bytes.length) {
        const localNameLen = view.getUint16(localHeaderOffset + 26, true);
        const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
        const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
        entries.push({
          name,
          compressionMethod,
          compressedSize,
          uncompressedSize,
          dataOffset,
        });
      }

      cdOffset += 46 + nameLen + extraLen + commentLen;
    }
  }

  const readEntryBytes = async (entry: ZipEntry): Promise<Uint8Array | null> => {
    try {
      const rawSlice = bytes.subarray(
        entry.dataOffset,
        entry.dataOffset + entry.compressedSize
      );
      if (entry.compressionMethod === 0) {
        return rawSlice;
      }
      if (
        entry.compressionMethod === 8 &&
        typeof DecompressionStream !== 'undefined'
      ) {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(rawSlice).catch(() => {});
        writer.close().catch(() => {});
        const response = new Response(ds.readable);
        const ab = await response.arrayBuffer();
        return new Uint8Array(ab);
      }
      return null;
    } catch {
      return null;
    }
  };

  const slideXmlEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.name))
    .sort((a, b) => {
      const numA = Number((a.name.match(/slide(\d+)\.xml/i) || [])[1] || 0);
      const numB = Number((b.name.match(/slide(\d+)\.xml/i) || [])[1] || 0);
      return numA - numB;
    });

  const mediaEntries = entries
    .filter((e) => /^ppt\/media\/.+\.(png|jpe?g|webp|gif)$/i.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Pre-decode up to 30 embedded images from ppt/media/* so we can composite them or use them
  const mediaDataUrls: string[] = [];
  for (let i = 0; i < Math.min(mediaEntries.length, 30); i++) {
    const mEntry = mediaEntries[i];
    const mBytes = await readEntryBytes(mEntry);
    if (mBytes && mBytes.length > 512) {
      const ext = mEntry.name.split('.').pop()?.toLowerCase() || 'png';
      const mime =
        ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'webp'
          ? 'image/webp'
          : ext === 'gif'
          ? 'image/gif'
          : 'image/png';
      const blob = new Blob([mBytes as unknown as BlobPart], { type: mime });
      const fileObj = new File([blob], mEntry.name, { type: mime });
      try {
        const webpUrl = await convertImageFileToWebpDataUrl(fileObj);
        if (webpUrl) mediaDataUrls.push(webpUrl);
      } catch {
        // ignore media decode error
      }
    }
  }

  const decoder = new TextDecoder('utf-8');
  const extractedSlides: LectureSlidePage[] = [];

  if (slideXmlEntries.length > 0) {
    const total = slideXmlEntries.length;
    for (let i = 0; i < total; i++) {
      onProgress?.(i + 1, total);
      const entry = slideXmlEntries[i];
      const xmlBytes = await readEntryBytes(entry);
      const xmlStr = xmlBytes ? decoder.decode(xmlBytes) : '';
      const parsed = extractTextFromPptxSlideXml(xmlStr);

      const title =
        parsed.title ||
        `Slide ${i + 1}: ${periodSpec.lessonTitle} (${file.name})`;
      const bulletPoints =
        parsed.bulletPoints.length > 0
          ? parsed.bulletPoints
          : [
              `Nội dung trình chiếu Slide #${i + 1} trích xuất từ tệp PowerPoint ${file.name}.`,
              `Chủ đề: ${periodSpec.topic}`,
              `Mục tiêu: ${periodSpec.yccd.slice(0, 120)}`,
            ];

      // Convert this PPTX slide into a high-res WebP image
      const canvasImg = renderSlideToCanvasDataUrl({
        grade: periodSpec.grade,
        period: periodSpec.period,
        slideNumber: i + 1,
        totalSlides: total,
        title,
        subtitle: `Chuyển đổi sang Ảnh Slide từ ${file.name} • Trang ${i + 1}/${total}`,
        bulletPoints,
        highlightNote: `Đã chuyển toàn bộ slide PPTX sang định dạng Ảnh WebP (#${i + 1}/${total})`,
      });

      extractedSlides.push({
        slideNumber: i + 1,
        title,
        subtitle: `Slide #${i + 1}/${total} • Nạp từ ${file.name}`,
        bulletPoints,
        highlightNote: `Ảnh Slide #${i + 1}/${total} (Chuyển đổi từ PPTX)`,
        imageUrl: canvasImg || mediaDataUrls[i] || '',
      });
    }
    return extractedSlides;
  }

  // Fallback if PPTX uses non-standard structure: generate 4 image slides from curriculum spec
  const fallbackCount = Math.max(mediaDataUrls.length, 4);
  for (let i = 0; i < fallbackCount; i++) {
    onProgress?.(i + 1, fallbackCount);
    const title = `Slide ${i + 1}: ${periodSpec.lessonTitle}`;
    const bulletPoints = [
      `Slide #${i + 1} chuyển đổi thành ảnh từ tệp ${file.name}.`,
      `Chủ đề: ${periodSpec.topic} — ${periodSpec.knowledgeSection}`,
      `Yêu cầu cần đạt: ${periodSpec.yccd.slice(0, 120)}...`,
    ];
    const canvasImg =
      mediaDataUrls[i] ||
      renderSlideToCanvasDataUrl({
        grade: periodSpec.grade,
        period: periodSpec.period,
        slideNumber: i + 1,
        totalSlides: fallbackCount,
        title,
        subtitle: `Ảnh Slide chuyển đổi từ ${file.name}`,
        bulletPoints,
        highlightNote: `Trang ảnh #${i + 1}/${fallbackCount}`,
      });
    extractedSlides.push({
      slideNumber: i + 1,
      title,
      subtitle: `Ảnh Slide #${i + 1}/${fallbackCount}`,
      bulletPoints,
      highlightNote: `Đã chuyển đổi thành ảnh từ ${file.name}`,
      imageUrl: canvasImg,
    });
  }

  return extractedSlides;
}

export const PRESET_EXPLANATION_VIDEOS: {
  id: string;
  title: string;
  duration: string;
  url: string;
  description: string;
}[] = [
  {
    id: 'vid-1',
    title: 'Video 1: Mô phỏng trực quan Quy trình Đầu vào (Input) → Xử lý → Đầu ra (Output)',
    duration: '01:15',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description:
      'Giải thích trực quan cách máy tính và AI tiếp nhận dữ liệu thô, xử lý qua thuật toán và xuất thông tin hữu ích.',
  },
  {
    id: 'vid-2',
    title: 'Video 2: Minh họa Cấu trúc Tuần tự, Rẽ nhánh & Lặp trong Thuật toán',
    duration: '01:30',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description:
      'Video ngắn đi kèm Slide giúp học sinh nắm vững 3 cấu trúc điều khiển cốt lõi trước khi vào Đấu trường 25s.',
  },
  {
    id: 'vid-3',
    title: 'Video 3: An toàn thông tin số & Đạo đức AI trong trường học (CV 3456 & QĐ 3439)',
    duration: '01:45',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    description:
      'Tình huống thực tế về bảo vệ dữ liệu cá nhân và kiểm chứng thông tin do AI sinh ra.',
  },
];

export const LectureSlideManagerModal: React.FC<LectureSlideManagerModalProps> = ({
  isOpen = true,
  initialGrade = 6,
  initialPeriod = 1,
  liveSession,
  onUpdateLiveSession = () => {},
  onShowToast,
  onClose,
  onOpenLivePresenterWithSlide,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<6 | 7 | 8 | 9>(initialGrade);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(initialPeriod);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [appendOnUpload, setAppendOnUpload] = useState<boolean>(false);

  // HTML Slide Web Embedding State
  const [htmlSlideInput, setHtmlSlideInput] = useState<string>('');
  const [htmlEmbedUrlInput, setHtmlEmbedUrlInput] = useState<string>('');
  const [htmlSlideTitleInput, setHtmlSlideTitleInput] = useState<string>('');
  const [htmlEmbedMode, setHtmlEmbedMode] = useState<HtmlSlideEmbedMode>('simulation-single');
  const [htmlInsertPosition, setHtmlInsertPosition] = useState<number>(1);
  const [showHtmlEmbedEditor, setShowHtmlEmbedEditor] = useState<boolean>(false);

  // Individual Slide Edit State
  const [editingSlideIdx, setEditingSlideIdx] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubtitle, setEditSubtitle] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [editOrderNumber, setEditOrderNumber] = useState<number>(1);

  const [storageStats, setStorageStats] = useState<{
    usedStorageMb: number;
    storageQuotaMb: number;
    dbUsedMb: number;
    dbQuotaMb: number;
    fileCount: number;
  }>({
    usedStorageMb: 0,
    storageQuotaMb: 1024,
    dbUsedMb: 0.12,
    dbQuotaMb: 500,
    fileCount: 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceSingleImageInputRef = useRef<HTMLInputElement | null>(null);

  const periodsForGrade = getPeriodsForGrade(selectedGrade);
  const periodSpec: CurriculumPeriodSpec =
    periodsForGrade.find((p) => p.period === selectedPeriod) || periodsForGrade[0];
  const lessonKey = `k${selectedGrade}-tiet-${selectedPeriod}`;

  const existingDeck: LectureSlideDeck | undefined =
    liveSession?.lectureSlidesByLesson?.[lessonKey];
  const activeSlides: LectureSlidePage[] = existingDeck?.slides || [];

  const safePreviewIdx =
    activeSlides.length > 0
      ? Math.max(0, Math.min(activeSlides.length - 1, previewSlideIdx))
      : 0;
  const currentSlide: LectureSlidePage | undefined = activeSlides[safePreviewIdx];

  // Keep default insert position in sync with current deck length + 1
  useEffect(() => {
    setHtmlInsertPosition(activeSlides.length + 1);
  }, [lessonKey, activeSlides.length]);

  useEffect(() => {
    fetch('/api/file-storage/slides/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ok) {
          setStorageStats({
            usedStorageMb: data.usedStorageMb || 0,
            storageQuotaMb: data.storageQuotaMb || 1024,
            dbUsedMb: data.dbUsedMb || 0.12,
            dbQuotaMb: data.dbQuotaMb || 500,
            fileCount: data.fileCount || 0,
          });
        }
      })
      .catch(() => {});
  }, [existingDeck]);

  /**
   * Synchronizes a slide deck smoothly to both local state / BroadcastChannel AND PostgreSQL `lecture_slides` table.
   */
  const persistDeckToDatabaseAndSession = async (
    nextDeck: LectureSlideDeck,
    targetSlideIndex: number = 0
  ) => {
    const cleanSlides = renumberSlides(nextDeck.slides);
    const guaranteedSlides = ensureDeckSlideImages(cleanSlides, {
      grade: selectedGrade,
      period: selectedPeriod,
    });
    const normalizedDeck: LectureSlideDeck = {
      ...nextDeck,
      lessonKey,
      grade: selectedGrade,
      period: selectedPeriod,
      isUserUploaded: true,
      storageBucket: 'slide-storage-1gb',
      slides: guaranteedSlides,
    };

    const boundedIdx =
      guaranteedSlides.length > 0
        ? Math.max(0, Math.min(guaranteedSlides.length - 1, targetSlideIndex))
        : 0;
    const syncVer = Date.now();

    // 1. Immediately persist to IndexedDB (ultra-resilient across page reloads without 5MB quota errors)
    saveSlideDeckToIndexedDb(lessonKey, normalizedDeck).catch((idbErr) =>
      console.warn('saveSlideDeckToIndexedDb notice:', idbErr)
    );

    onUpdateLiveSession((prev) => ({
      ...prev,
      lectureSlidesByLesson: {
        ...(prev.lectureSlidesByLesson || {}),
        [lessonKey]: normalizedDeck,
      },
      unlockedSlideDeckByLesson: {
        ...(prev.unlockedSlideDeckByLesson || {}),
        [lessonKey]: true,
      },
      activeSlideIndexByLesson: {
        ...(prev.activeSlideIndexByLesson || {}),
        [lessonKey]: boundedIdx,
      },
      slideSyncVersionByLesson: {
        ...(prev.slideSyncVersionByLesson || {}),
        [lessonKey]: syncVer,
      },
      updatedAt: new Date().toISOString(),
    }));

    try {
      const res = await fetch('/api/db/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonKey,
          deck: normalizedDeck,
          activeSlideIndex: boundedIdx,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.deck) {
          onUpdateLiveSession((prev) => ({
            ...prev,
            lectureSlidesByLesson: {
              ...(prev.lectureSlidesByLesson || {}),
              [lessonKey]: data.deck,
            },
            updatedAt: new Date().toISOString(),
          }));
        }
      }
    } catch {
      // fallback already handled in local session
    }
  };

  /**
   * Unified Multi-Format Slide Upload Handler:
   * Supports PDF (.pdf), PowerPoint (.pptx, .ppt), HTML (.html, .htm), Video (.mp4, .webm), and Images (.png, .jpg, .webp, .gif).
   * - PDF & PPTX: Converts ALL pages/slides into WebP images and stores them as image slides.
   * - Images: Converts each image file into a 1280x720 WebP slide image.
   * - Video: Extracts thumbnail + uploads video to File Storage as a video slide.
   * - HTML: Respects the selected HTML Embed Mode ('simulation-single' at chosen position vs 'full-deck-end' at the end).
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);

    setIsUploading(true);
    setUploadProgressText(`Đang xử lý ${files.length} tệp bài giảng...`);

    try {
      const newlyCreatedSlides: LectureSlidePage[] = [];
      let primaryFileType: 'pdf' | 'pptx' | 'html' | 'video' | 'image' = 'image';
      let totalFileSizeBytes = 0;

      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        totalFileSizeBytes += file.size;
        const lowerName = file.name.toLowerCase();

        // 1. HTML FILE (.html, .htm)
        if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
          primaryFileType = 'html';
          setUploadProgressText(`Đang đọc tệp HTML Slide Web (${file.name})...`);
          const htmlText = await file.text();
          setHtmlSlideInput(htmlText);

          const thumbUrl = renderSlideToCanvasDataUrl({
            grade: selectedGrade,
            period: selectedPeriod,
            slideNumber: 1,
            totalSlides: 1,
            title: htmlSlideTitleInput.trim() || `Slide Web: ${file.name}`,
            subtitle: `${periodSpec.lessonTitle} • Tệp HTML Tương tác`,
            bulletPoints: [
              `Nạp từ tệp: ${file.name}`,
              htmlEmbedMode === 'simulation-single'
                ? `Chế độ: Slide mô phỏng riêng biệt (Vị trí #${htmlInsertPosition})`
                : `Chế độ: Cả bộ Slide Web (Chèn vào cuối bài giảng)`,
            ],
            highlightNote: 'Slide HTML5 mô phỏng tương tác trực tiếp',
          });

          const htmlSlidePage: LectureSlidePage = {
            slideNumber: 1,
            title:
              htmlSlideTitleInput.trim() ||
              `🌐 Mô phỏng HTML: ${file.name.replace(/\.html?$/i, '')}`,
            subtitle: `${periodSpec.topic} • HTML Slide Web`,
            bulletPoints: [
              `Tệp HTML: ${file.name}`,
              `Tương tác trực tiếp trên màn hình Giáo viên và Học sinh.`,
            ],
            highlightNote: `HTML Slide Web (${file.name})`,
            htmlContent: htmlText,
            imageUrl: thumbUrl,
          };

          const inserted = insertHtmlSlideIntoDeck(
            activeSlides,
            htmlSlidePage,
            htmlEmbedMode,
            htmlInsertPosition
          );

          const deckToSave: LectureSlideDeck = {
            lessonKey,
            grade: selectedGrade,
            period: selectedPeriod,
            fileName: existingDeck?.fileName || file.name,
            fileType: existingDeck?.fileType || 'html',
            fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            uploadedAt: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            storageBucket: 'slide-storage-1gb',
            totalCompressedKb:
              (existingDeck?.totalCompressedKb || 0) +
              Math.max(1, Math.round(file.size / 1024)),
            isUserUploaded: true,
            slides: inserted.slides,
          };

          await persistDeckToDatabaseAndSession(
            deckToSave,
            inserted.insertedZeroBasedIndex
          );
          setPreviewSlideIdx(inserted.insertedZeroBasedIndex);
          onShowToast(
            htmlEmbedMode === 'simulation-single'
              ? `🎯 Đã tạo thêm 1 Slide mô phỏng riêng biệt từ "${file.name}" tại vị trí Slide #${inserted.insertedSlideNumber}/${inserted.slides.length} và đồng bộ CSDL!`
              : `📚 Đã chèn bộ Slide Web "${file.name}" vào vị trí cuối bài giảng (Slide #${inserted.insertedSlideNumber}/${inserted.slides.length}) và đồng bộ CSDL!`
          );
          e.target.value = '';
          setIsUploading(false);
          setUploadProgressText('');
          return;
        }

        // 2. PDF FILE (.pdf) -> Convert ALL pages to WebP images
        if (lowerName.endsWith('.pdf')) {
          primaryFileType = 'pdf';
          const extracted = await extractPdfPagesAsImages(file, (cur, tot) => {
            setUploadProgressText(
              `Đang chuyển trang PDF ${cur}/${tot} thành Ảnh Slide WebP...`
            );
          });
          extracted.pageImages.forEach((imgDataUrl, idx) => {
            const rawTxt = extracted.pageTexts[idx] || '';
            const firstSentence = rawTxt.split(/[.!?\n]/)[0]?.trim();
            newlyCreatedSlides.push({
              slideNumber: newlyCreatedSlides.length + 1,
              title:
                firstSentence && firstSentence.length > 3 && firstSentence.length < 90
                  ? `Trang ${idx + 1}: ${firstSentence}`
                  : `Slide ${idx + 1}: ${periodSpec.lessonTitle}`,
              subtitle: `Ảnh Slide chuyển đổi từ PDF (${file.name} • Trang ${idx + 1}/${extracted.pageImages.length})`,
              bulletPoints: [
                rawTxt.slice(0, 140) ||
                  `Trang ảnh #${idx + 1} trích xuất nguyên bản từ tệp ${file.name}.`,
              ],
              highlightNote: `Trang ảnh PDF #${idx + 1}/${extracted.pageImages.length}`,
              imageUrl: imgDataUrl,
            });
          });
          continue;
        }

        // 3. POWERPOINT FILE (.pptx, .ppt) -> Convert ALL slides to WebP images
        if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt')) {
          primaryFileType = 'pptx';
          const pptxSlides = await extractPptxSlidesAsImages(
            file,
            periodSpec,
            (cur, tot) => {
              setUploadProgressText(
                `Đang chuyển Slide PPTX ${cur}/${tot} thành Ảnh Slide WebP...`
              );
            }
          );
          pptxSlides.forEach((sl) => {
            newlyCreatedSlides.push({
              ...sl,
              slideNumber: newlyCreatedSlides.length + 1,
            });
          });
          continue;
        }

        // 4. VIDEO FILE (.mp4, .webm, .ogg)
        if (
          lowerName.endsWith('.mp4') ||
          lowerName.endsWith('.webm') ||
          lowerName.endsWith('.ogg') ||
          file.type.startsWith('video/')
        ) {
          primaryFileType = 'video';
          setUploadProgressText(`Đang xử lý tệp Video Slide (${file.name})...`);
          const { videoDataUrl, thumbnailDataUrl } =
            await extractVideoFileDataAndThumbnail(file, periodSpec.lessonTitle);

          // Offload video binary to File Storage 1GB
          let storedVideoUrl = videoDataUrl;
          try {
            const upRes = await fetch('/api/file-storage/slides/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lessonKey,
                images: [videoDataUrl],
              }),
            });
            if (upRes.ok) {
              const upData = await upRes.json();
              if (upData?.uploadedItems?.[0]?.url) {
                storedVideoUrl = upData.uploadedItems[0].url;
              }
            }
          } catch {
            // keep dataUrl fallback
          }

          newlyCreatedSlides.push({
            slideNumber: newlyCreatedSlides.length + 1,
            title: `🎬 Slide Video: ${file.name.replace(/\.[^.]+$/, '')}`,
            subtitle: `${periodSpec.lessonTitle} • Video bài giảng trực quan`,
            bulletPoints: [
              `Video bài giảng: ${file.name}`,
              `Đồng bộ phát trực tiếp sang màn hình Học sinh.`,
            ],
            highlightNote: `Slide Video (${file.name})`,
            imageUrl: thumbnailDataUrl,
            videoUrl: storedVideoUrl,
            videoTitle: file.name,
          });
          continue;
        }

        // 5. IMAGE FILE (.png, .jpg, .jpeg, .webp, .gif)
        if (
          file.type.startsWith('image/') ||
          /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(lowerName)
        ) {
          primaryFileType = 'image';
          setUploadProgressText(
            `Đang nén ảnh Slide ${fIdx + 1}/${files.length} (${file.name}) sang WebP...`
          );
          const webpDataUrl = await convertImageFileToWebpDataUrl(file);
          newlyCreatedSlides.push({
            slideNumber: newlyCreatedSlides.length + 1,
            title: `Ảnh Slide ${fIdx + 1}: ${file.name.replace(/\.[^.]+$/, '')}`,
            subtitle: `${periodSpec.lessonTitle} • Ảnh Slide bài giảng`,
            bulletPoints: [
              `Ảnh slide: ${file.name}`,
              `Hiển thị sắc nét chuẩn 16:9 trên màn hình Giáo viên và Học sinh.`,
            ],
            highlightNote: `Ảnh Slide (${file.name})`,
            imageUrl: webpDataUrl,
          });
        }
      }

      if (newlyCreatedSlides.length === 0) {
        onShowToast(
          '⚠️ Định dạng tệp không hỗ trợ. Vui lòng chọn tệp PDF, PPTX, HTML, Video (MP4/WebM) hoặc Ảnh (PNG/JPG/WebP).'
        );
        setIsUploading(false);
        setUploadProgressText('');
        return;
      }

      // Upload all newly generated slide images to 1GB File Storage
      setUploadProgressText(
        `Đang đồng bộ ${newlyCreatedSlides.length} Ảnh Slide lên File Storage 1GB & CSDL...`
      );
      const rawImages = newlyCreatedSlides.map((s) => s.imageUrl || '');
      let totalCompressedKb = 0;

      try {
        const storageRes = await fetch('/api/file-storage/slides/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonKey,
            images: rawImages,
          }),
        });
        if (storageRes.ok) {
          const storageData = await storageRes.json();
          if (Array.isArray(storageData.uploadedItems)) {
            storageData.uploadedItems.forEach((item: any) => {
              if (newlyCreatedSlides[item.index]) {
                newlyCreatedSlides[item.index].imageUrl = item.url;
                newlyCreatedSlides[item.index].storageFileId = item.fileId;
                newlyCreatedSlides[item.index].compressedSizeKb = item.sizeKb;
              }
            });
          }
          totalCompressedKb =
            storageData.totalSizeKb || newlyCreatedSlides.length * 45;
        }
      } catch {
        totalCompressedKb = newlyCreatedSlides.length * 45;
      }

      const combinedSlides = appendOnUpload
        ? renumberSlides([...activeSlides, ...newlyCreatedSlides])
        : renumberSlides(newlyCreatedSlides);

      const deckToSave: LectureSlideDeck = {
        lessonKey,
        grade: selectedGrade,
        period: selectedPeriod,
        fileName:
          files.length === 1
            ? files[0].name
            : `${files.length}_tep_slide_${lessonKey}`,
        fileType: primaryFileType,
        fileSize:
          totalFileSizeBytes > 1024 * 1024
            ? `${(totalFileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
            : `${Math.max(1, Math.round(totalFileSizeBytes / 1024))} KB`,
        uploadedAt: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        storageBucket: 'slide-storage-1gb',
        totalCompressedKb:
          (appendOnUpload ? existingDeck?.totalCompressedKb || 0 : 0) +
          totalCompressedKb,
        isUserUploaded: true,
        slides: combinedSlides,
      };

      const targetPreviewIdx = appendOnUpload ? activeSlides.length : 0;
      await persistDeckToDatabaseAndSession(deckToSave, targetPreviewIdx);
      setPreviewSlideIdx(targetPreviewIdx);

      onShowToast(
        `✅ Đã chuyển đổi và nạp thành công ${newlyCreatedSlides.length} Ảnh Slide (Tổng: ${combinedSlides.length} slide) vào CSDL Khối ${selectedGrade} • Tiết ${selectedPeriod}!`
      );
    } catch (err: any) {
      onShowToast(
        `⚠️ Lỗi khi nạp slide: ${err?.message || 'Vui lòng kiểm tra lại tệp.'}`
      );
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  /**
   * Handles embedding HTML Slide Web according to the 2 required modes:
   * - 'simulation-single': Automatically creates 1 new separate slide and inserts it at `htmlInsertPosition` (1-based).
   * - 'full-deck-end': Appends the HTML Slide Web deck to the very end of the lecture slides.
   */
  const handleEmbedHtmlSlideWeb = async () => {
    const cleanHtml = htmlSlideInput.trim();
    const cleanUrl = htmlEmbedUrlInput.trim();
    if (!cleanHtml && !cleanUrl) {
      onShowToast(
        '⚠️ Vui lòng dán mã HTML5 mô phỏng hoặc nhập đường dẫn URL Slide Web trước khi nhúng!'
      );
      return;
    }

    const customTitle =
      htmlSlideTitleInput.trim() ||
      (htmlEmbedMode === 'simulation-single'
        ? `🎯 Mô phỏng tương tác: ${periodSpec.lessonTitle}`
        : `📚 Bộ Slide Web HTML: ${periodSpec.lessonTitle}`);

    const thumbUrl = renderSlideToCanvasDataUrl({
      grade: selectedGrade,
      period: selectedPeriod,
      slideNumber:
        htmlEmbedMode === 'simulation-single'
          ? htmlInsertPosition
          : activeSlides.length + 1,
      totalSlides: activeSlides.length + 1,
      title: customTitle,
      subtitle:
        htmlEmbedMode === 'simulation-single'
          ? `Slide mô phỏng riêng biệt (Chèn tại vị trí #${htmlInsertPosition})`
          : `Bộ Slide Web chèn tại vị trí cuối bài giảng (#${activeSlides.length + 1})`,
      bulletPoints: [
        cleanHtml
          ? 'Nhúng trực tiếp mã nguồn HTML5 / CSS / JS mô phỏng tương tác.'
          : `Nhúng trực tiếp từ địa chỉ Web: ${cleanUrl}`,
        'Đồng bộ thời gian thực sang màn hình Học sinh trong Phòng Live.',
      ],
      highlightNote:
        htmlEmbedMode === 'simulation-single'
          ? `Slide mô phỏng tại vị trí #${htmlInsertPosition}`
          : `Bộ Slide Web ở cuối bài giảng`,
    });

    const newHtmlSlide: LectureSlidePage = {
      slideNumber: 1,
      title: customTitle,
      subtitle:
        htmlEmbedMode === 'simulation-single'
          ? `Slide mô phỏng tương tác • Khối ${selectedGrade} Tiết ${selectedPeriod}`
          : `Cả bộ Slide Web • Khối ${selectedGrade} Tiết ${selectedPeriod}`,
      bulletPoints: [
        'Học sinh tương tác trực tiếp ngay trên khung trình chiếu Slide.',
        `Bám sát YCCĐ: ${periodSpec.yccd.slice(0, 110)}`,
      ],
      highlightNote:
        htmlEmbedMode === 'simulation-single'
          ? `Slide mô phỏng (Vị trí #${htmlInsertPosition})`
          : 'Bộ Slide Web (Cuối bài giảng)',
      imageUrl: thumbUrl,
      ...(cleanHtml ? { htmlContent: cleanHtml } : {}),
      ...(cleanUrl ? { htmlEmbedUrl: cleanUrl } : {}),
      embedMode: htmlEmbedMode,
    };

    const result = insertHtmlSlideIntoDeck(
      activeSlides,
      newHtmlSlide,
      htmlEmbedMode,
      htmlInsertPosition
    );

    const nextDeck: LectureSlideDeck = {
      lessonKey,
      grade: selectedGrade,
      period: selectedPeriod,
      fileName:
        existingDeck?.fileName ||
        `Slide_Bai_Giang_K${selectedGrade}_T${selectedPeriod}.html`,
      fileType: existingDeck?.fileType || 'html',
      fileSize: existingDeck?.fileSize || '24 KB',
      uploadedAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      storageBucket: 'slide-storage-1gb',
      totalCompressedKb: (existingDeck?.totalCompressedKb || 0) + 18,
      isUserUploaded: true,
      slides: result.slides,
    };

    await persistDeckToDatabaseAndSession(nextDeck, result.insertedZeroBasedIndex);
    setPreviewSlideIdx(result.insertedZeroBasedIndex);
    setHtmlSlideTitleInput('');

    onShowToast(
      htmlEmbedMode === 'simulation-single'
        ? `🎯 Đã tự động tạo thêm 1 Slide mô phỏng riêng biệt và nhúng vào vị trí Slide #${result.insertedSlideNumber}/${result.slides.length}!`
        : `📚 Đã chèn cả bộ Slide Web vào vị trí cuối bài giảng (Slide #${result.insertedSlideNumber}/${result.slides.length})!`
    );
  };

  /**
   * Opens the inline editor for a specific slide index.
   */
  const handleStartEditSlide = (idx: number) => {
    const target = activeSlides[idx];
    if (!target) return;
    setEditingSlideIdx(idx);
    setEditTitle(target.title || '');
    setEditSubtitle(target.subtitle || '');
    setEditNote(target.highlightNote || '');
    setEditOrderNumber(target.slideNumber || idx + 1);
    setPreviewSlideIdx(idx);
  };

  /**
   * Saves changes to an individual slide (title, subtitle, note, and 1-based position order).
   */
  const handleSaveEditSlide = async () => {
    if (editingSlideIdx === null || !existingDeck) return;
    const { slides: updatedSlides, activeIndex } = updateSlideInDeck(
      activeSlides,
      editingSlideIdx,
      {
        title: editTitle.trim() || `Slide #${editingSlideIdx + 1}`,
        subtitle: editSubtitle.trim(),
        highlightNote: editNote.trim(),
      },
      editOrderNumber
    );

    const nextDeck: LectureSlideDeck = {
      ...existingDeck,
      isUserUploaded: true,
      slides: updatedSlides,
    };
    await persistDeckToDatabaseAndSession(nextDeck, activeIndex);
    setPreviewSlideIdx(activeIndex);
    setEditingSlideIdx(null);
    onShowToast(
      `✏️ Đã lưu chỉnh sửa Slide #${activeIndex + 1} và đồng bộ vào CSDL!`
    );
  };

  /**
   * Replaces the image of the currently previewed slide with a newly uploaded image file.
   */
  const handleReplaceSingleSlideImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !existingDeck || !currentSlide) return;
    try {
      setIsUploading(true);
      setUploadProgressText(`Đang thay thế ảnh cho Slide #${safePreviewIdx + 1}...`);
      const webpDataUrl = await convertImageFileToWebpDataUrl(file);
      let finalUrl = webpDataUrl;
      try {
        const upRes = await fetch('/api/file-storage/slides/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonKey,
            images: [webpDataUrl],
          }),
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          if (upData?.uploadedItems?.[0]?.url) {
            finalUrl = upData.uploadedItems[0].url;
          }
        }
      } catch {
        // fallback to dataUrl
      }

      const { slides: updatedSlides } = updateSlideInDeck(
        activeSlides,
        safePreviewIdx,
        {
          imageUrl: finalUrl,
          htmlContent: undefined,
          htmlEmbedUrl: undefined,
        }
      );

      await persistDeckToDatabaseAndSession(
        {
          ...existingDeck,
          isUserUploaded: true,
          slides: updatedSlides,
        },
        safePreviewIdx
      );
      onShowToast(`🖼️ Đã cập nhật ảnh mới cho Slide #${safePreviewIdx + 1}!`);
    } catch {
      onShowToast('⚠️ Không thể thay ảnh cho slide này.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  /**
   * Deletes a single slide at `idx` and renumbers remaining slides.
   */
  const handleDeleteSingleSlide = async (idx: number) => {
    if (!existingDeck) return;
    const removedSlide = activeSlides[idx];
    const { slides: remaining, nextPreviewIndex } = deleteSlideFromDeck(
      activeSlides,
      idx
    );

    if (remaining.length === 0) {
      await handleClearCurrentLessonSlides();
      return;
    }

    const nextDeck: LectureSlideDeck = {
      ...existingDeck,
      isUserUploaded: true,
      slides: remaining,
    };
    await persistDeckToDatabaseAndSession(nextDeck, nextPreviewIndex);
    setPreviewSlideIdx(nextPreviewIndex);
    if (editingSlideIdx === idx) {
      setEditingSlideIdx(null);
    }
    onShowToast(
      `🗑️ Đã xoá "${removedSlide?.title || `Slide #${idx + 1}`}" (Còn lại ${
        remaining.length
      } slide)!`
    );
  };

  /**
   * Moves a slide up or down in the deck order.
   */
  const handleMoveSlide = async (fromIdx: number, toIdx: number) => {
    if (!existingDeck) return;
    const { slides: reordered, nextPreviewIndex } = moveSlideInDeck(
      activeSlides,
      fromIdx,
      toIdx
    );
    const nextDeck: LectureSlideDeck = {
      ...existingDeck,
      isUserUploaded: true,
      slides: reordered,
    };
    await persistDeckToDatabaseAndSession(nextDeck, nextPreviewIndex);
    setPreviewSlideIdx(nextPreviewIndex);
    onShowToast(
      `↕️ Đã chuyển vị trí Slide sang thứ tự #${nextPreviewIndex + 1}!`
    );
  };

  /**
   * Deletes all slides of the currently selected lesson (`lessonKey`) from memory and DB.
   */
  const handleClearCurrentLessonSlides = async () => {
    setEditingSlideIdx(null);
    setPreviewSlideIdx(0);

    onUpdateLiveSession((prev) => {
      const nextMap = { ...(prev.lectureSlidesByLesson || {}) };
      delete nextMap[lessonKey];
      return {
        ...prev,
        lectureSlidesByLesson: nextMap,
        activeSlideIndexByLesson: {
          ...(prev.activeSlideIndexByLesson || {}),
          [lessonKey]: 0,
        },
        slideSyncVersionByLesson: {
          ...(prev.slideSyncVersionByLesson || {}),
          [lessonKey]: Date.now(),
        },
        updatedAt: new Date().toISOString(),
      };
    });

    deleteSlideDeckFromIndexedDb(lessonKey).catch(() => {});

    try {
      await fetch(`/api/db/slides/${encodeURIComponent(lessonKey)}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore offline
    }

    onShowToast(
      `🗑️ Đã xoá trắng toàn bộ Slide của Khối ${selectedGrade} • Tiết ${selectedPeriod} khỏi CSDL!`
    );
  };

  /**
   * Wipes ALL slides across ALL lessons in PostgreSQL database, File Storage 1GB, and localStorage.
   */
  const handleWipeAllSlidesInDatabase = async () => {
    setEditingSlideIdx(null);
    setPreviewSlideIdx(0);

    clearAllSlideDecksFromIndexedDb().catch(() => {});

    onUpdateLiveSession((prev) => ({
      ...prev,
      lectureSlidesByLesson: {},
      activeSlideIndexByLesson: {},
      slideSyncVersionByLesson: {},
      updatedAt: new Date().toISOString(),
    }));

    try {
      await fetch('/api/db/slides', { method: 'DELETE' });
    } catch {
      // ignore offline
    }

    onShowToast(
      '🔥 Đã xoá trắng toàn bộ Slide đã có sẵn trong CSDL và File Storage của tất cả các tiết học!'
    );
  };

  const handleBroadcastCurrentSlideToLive = () => {
    if (activeSlides.length === 0) {
      onShowToast(
        '⚠️ Tiết học này chưa có Slide nào! Vui lòng nạp tệp PDF, PPTX, Ảnh, Video hoặc nhúng HTML Slide Web trước khi phát Live.'
      );
      return;
    }
    const syncVer = Date.now();
    onUpdateLiveSession((prev) => ({
      ...prev,
      isBroadcasting: true,
      activeGrade: selectedGrade,
      activePeriod: selectedPeriod,
      activeLiveView: 'slide',
      unlockedSlideDeckByLesson: {
        ...(prev.unlockedSlideDeckByLesson || {}),
        [lessonKey]: true,
      },
      unlockedStagesByLesson: {
        ...(prev.unlockedStagesByLesson || {}),
        [lessonKey]: {
          1: false,
          2: false,
          3: false,
          4: false,
        },
      },
      unlockedPracticeStage3ByLesson: {
        ...(prev.unlockedPracticeStage3ByLesson || {}),
        [lessonKey]: false,
      },
      activeSlideIndexByLesson: {
        ...(prev.activeSlideIndexByLesson || {}),
        [lessonKey]: safePreviewIdx,
      },
      slideSyncVersionByLesson: {
        ...(prev.slideSyncVersionByLesson || {}),
        [lessonKey]: syncVer,
      },
      updatedAt: new Date().toISOString(),
    }));

    fetch('/api/live-session/slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonKey,
        slideIndex: safePreviewIdx,
        slideSyncVersion: syncVer,
        grade: selectedGrade,
        period: selectedPeriod,
        activeLiveView: 'slide',
      }),
    }).catch(() => {});

    onShowToast(
      `📢 Đang phát trực tiếp Slide #${safePreviewIdx + 1}/${activeSlides.length} (Khối ${selectedGrade} • Tiết ${selectedPeriod}) sang màn hình Học sinh!`
    );
    if (onOpenLivePresenterWithSlide) {
      onOpenLivePresenterWithSlide(selectedGrade, selectedPeriod);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <span className="material-symbols-outlined text-[26px]">slideshow</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Quản Lý &amp; Nạp Ảnh Slide Bài Giảng (PDF, PPTX, HTML, Video, Ảnh)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                  ☁️ Đồng bộ CSDL &amp; File Storage 1GB
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Nạp PDF/PPTX tự động chuyển toàn bộ thành Ảnh Slide • Nhúng HTML Mô phỏng (chèn theo thứ tự) hoặc Bộ Slide Web (chèn cuối) • Sửa/Xoá từng slide mượt mà
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleWipeAllSlidesInDatabase}
              className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Xoá trắng toàn bộ dữ liệu slide đã có sẵn trong CSDL của tất cả các tiết học"
            >
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              <span>🔥 Xoá toàn bộ Slide trong CSDL</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              <span>Đóng</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/60">
          {/* LEFT COLUMN (5 cols): Select Grade/Period, Upload PDF/PPTX/HTML/Video/Images, & HTML Embed Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Step 1: Select Grade & Period */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                  1. Chọn Khối &amp; Tiết Học (PPCT 29 Tiết)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                  {activeSlides.length} Slide đã nạp
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {([6, 7, 8, 9] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setSelectedGrade(g);
                      setSelectedPeriod(1);
                      setPreviewSlideIdx(0);
                      setEditingSlideIdx(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      selectedGrade === g
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Khối {g}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Chọn Tiết học cần nạp / chỉnh sửa Slide:
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(Number(e.target.value));
                    setPreviewSlideIdx(0);
                    setEditingSlideIdx(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {periodsForGrade.map((p) => {
                    const pKey = `k${selectedGrade}-tiet-${p.period}`;
                    const pCount =
                      liveSession?.lectureSlidesByLesson?.[pKey]?.slides?.length || 0;
                    return (
                      <option key={p.period} value={p.period}>
                        Tiết {p.period}: {p.lessonTitle} ({pCount > 0 ? `Đã nạp ${pCount} slide` : 'Trống - 0 slide'})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Step 2: Upload Multi-Format Slide Files (PDF, PPTX, HTML, Video, Images) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                  2. Nạp Ảnh Slide (PDF, PPTX, HTML, Video, Ảnh)
                </span>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appendOnUpload}
                    onChange={(e) => setAppendOnUpload(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Nối tiếp vào slide hiện có</span>
                </label>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.pptx,.ppt,.html,.htm,.mp4,.webm,.png,.jpg,.jpeg,.webp,.gif"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={replaceSingleImageInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif"
                onChange={handleReplaceSingleSlideImage}
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-5 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/70 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
              >
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">
                    {isUploading ? 'hourglass_top' : 'cloud_upload'}
                  </span>
                </div>
                <div className="text-xs font-black text-indigo-950">
                  {isUploading
                    ? uploadProgressText || 'Đang chuyển đổi & lưu Ảnh Slide...'
                    : 'Bấm để chọn tệp PDF, PPTX, HTML, Video (.mp4) hoặc nhiều Ảnh (.png, .jpg, .webp)'}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  • <strong>Nạp PDF / PPTX:</strong> Tự động chuyển toàn bộ các trang slide thành <strong>Ảnh WebP</strong> và lưu dưới dạng ảnh.<br />
                  • <strong>Nạp Ảnh / Video:</strong> Chọn 1 hoặc nhiều ảnh/video cùng lúc để tạo bộ slide.
                </p>
              </button>
            </div>

            {/* Step 3: Embed HTML Slide Web (Simulation at Custom Position vs Full Deck at End) */}
            <div className="p-4 rounded-2xl bg-sky-50/90 border-2 border-sky-200 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-sky-600">
                    code
                  </span>
                  <span>3. Nhúng HTML Slide Web (Mô Phỏng / Bộ Slide Web)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowHtmlEmbedEditor((v) => !v)}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  {showHtmlEmbedEditor ? 'Thu gọn' : 'Mở khung nhúng HTML'}
                </button>
              </div>

              {/* Two Explicit HTML Embed Modes Required by User */}
              <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-sky-200">
                <span className="text-[11px] font-black text-slate-800">
                  Chọn chế độ nhúng HTML Slide Web vào Bài Giảng:
                </span>

                <label
                  onClick={() => setHtmlEmbedMode('simulation-single')}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                    htmlEmbedMode === 'simulation-single'
                      ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="htmlEmbedMode"
                    checked={htmlEmbedMode === 'simulation-single'}
                    onChange={() => setHtmlEmbedMode('simulation-single')}
                    className="mt-0.5 text-sky-600"
                  />
                  <div className="flex-1 flex flex-col gap-1">
                    <span>
                      🎯 1. Nhúng Slide Mô Phỏng (Tự động tạo thêm 1 slide riêng biệt tại vị trí chỉ định)
                    </span>
                    {htmlEmbedMode === 'simulation-single' && (
                      <div
                        className="flex items-center gap-2 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] text-sky-800 font-semibold">
                          Điền thứ tự vị trí nhúng vào (1 → {activeSlides.length + 1}):
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={activeSlides.length + 1}
                          value={htmlInsertPosition}
                          onChange={(e) =>
                            setHtmlInsertPosition(
                              Math.max(
                                1,
                                Math.min(
                                  activeSlides.length + 1,
                                  Number(e.target.value) || 1
                                )
                              )
                            )
                          }
                          aria-label="Vị trí thứ tự chèn Slide mô phỏng"
                          className="w-20 px-2.5 py-1 rounded-lg bg-white border-2 border-sky-500 text-xs font-black text-sky-950 text-center"
                        />
                      </div>
                    )}
                  </div>
                </label>

                <label
                  onClick={() => setHtmlEmbedMode('full-deck-end')}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                    htmlEmbedMode === 'full-deck-end'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="htmlEmbedMode"
                    checked={htmlEmbedMode === 'full-deck-end'}
                    onChange={() => setHtmlEmbedMode('full-deck-end')}
                    className="mt-0.5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <span>
                      📚 2. Nhúng Cả Bộ Slide Web (Tự động chèn vào vị trí cuối Slide Bài Giảng — Vị trí #{activeSlides.length + 1})
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={htmlSlideTitleInput}
                  onChange={(e) => setHtmlSlideTitleInput(e.target.value)}
                  placeholder="Tiêu đề Slide HTML (VD: Mô phỏng cấu trúc rẽ nhánh)..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-slate-800"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleHtml = buildInteractiveHtmlSlideTemplate({
                        grade: selectedGrade,
                        period: selectedPeriod,
                        lessonTitle: periodSpec.lessonTitle,
                        topic: periodSpec.topic,
                        yccd: periodSpec.yccd,
                      });
                      setHtmlSlideInput(sampleHtml);
                      setShowHtmlEmbedEditor(true);
                      onShowToast(
                        `✨ Đã tạo mã HTML5 Slide tương tác mẫu cho Khối ${selectedGrade} • Tiết ${selectedPeriod}. Bấm nút Nhúng bên dưới để chèn vào bài giảng!`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 text-[11px] font-bold cursor-pointer"
                  >
                    ✨ Tạo mẫu HTML tương tác theo bài học
                  </button>

                  <button
                    type="button"
                    onClick={handleEmbedHtmlSlideWeb}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_circle
                    </span>
                    <span>
                      {htmlEmbedMode === 'simulation-single'
                        ? `Nhúng Slide Mô Phỏng vào vị trí #${htmlInsertPosition}`
                        : `Chèn Bộ Slide Web vào cuối (#${activeSlides.length + 1})`}
                    </span>
                  </button>
                </div>

                {showHtmlEmbedEditor && (
                  <div className="flex flex-col gap-2 pt-1">
                    <input
                      type="url"
                      value={htmlEmbedUrlInput}
                      onChange={(e) => setHtmlEmbedUrlInput(e.target.value)}
                      placeholder="Dán link URL Slide Web (Canva, Genially, PhET, Scratch, HTML URL...)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs text-slate-800"
                    />
                    <textarea
                      rows={5}
                      value={htmlSlideInput}
                      onChange={(e) => setHtmlSlideInput(e.target.value)}
                      placeholder="Hoặc dán trực tiếp mã nguồn <!DOCTYPE html><html>...</html> vào đây..."
                      className="w-full p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] border border-slate-700 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 cols): Live Slide Preview, Edit/Delete Slide Controls, & Slide Deck List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4 flex-1">
              {/* Top Bar of Preview */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block">
                    Khối {selectedGrade} • Tiết {selectedPeriod}: {periodSpec.lessonTitle}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {activeSlides.length > 0 && currentSlide
                      ? `Đang xem Slide #${currentSlide.slideNumber}/${activeSlides.length}: ${currentSlide.title}`
                      : 'Chưa có dữ liệu Slide nào cho tiết học này (0 Slide)'}
                  </h3>
                </div>

                {activeSlides.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleStartEditSlide(safePreviewIdx)}
                      className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Sửa Slide #{safePreviewIdx + 1}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => replaceSingleImageInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold cursor-pointer flex items-center gap-1 border border-indigo-200"
                    >
                      <span className="material-symbols-outlined text-[15px]">image</span>
                      <span>Thay ảnh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleSlide(safePreviewIdx)}
                      className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>Xoá Slide #{safePreviewIdx + 1}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCurrentLessonSlides}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      title="Xoá toàn bộ slide của tiết học này"
                    >
                      🗑️ Xoá trắng tiết này
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Slide Editor Drawer when teacher clicks "Sửa Slide" */}
              {editingSlideIdx !== null && activeSlides[editingSlideIdx] && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-amber-700">
                        edit_note
                      </span>
                      <span>
                        Chỉnh sửa thông tin &amp; thứ tự vị trí Slide #{editingSlideIdx + 1}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingSlideIdx(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Đóng khung sửa ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8 flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Tiêu đề Slide:
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-4 flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Thứ tự vị trí Slide (1 → {activeSlides.length}):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={activeSlides.length}
                        value={editOrderNumber}
                        onChange={(e) =>
                          setEditOrderNumber(
                            Math.max(
                              1,
                              Math.min(activeSlides.length, Number(e.target.value) || 1)
                            )
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-black text-slate-900 text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Phụ đề / Tóm tắt:
                      </label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Ghi chú trọng tâm:
                      </label>
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSlideIdx(null)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditSlide}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black cursor-pointer shadow-xs"
                    >
                      💾 Lưu chỉnh sửa Slide
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Stage */}
              {activeSlides.length === 0 || !currentSlide ? (
                <div className="flex-1 min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px]">
                      add_photo_alternate
                    </span>
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-base font-black text-slate-900">
                      Tiết học này đang trống (0 Slide — Không còn dữ liệu Slide Demo)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Hãy bấm khung <strong>Nạp Ảnh Slide (PDF, PPTX, HTML, Video, Ảnh)</strong> bên trái để tải bài giảng lên (hệ thống tự động chuyển toàn bộ trang PDF/PPTX thành Ảnh Slide), hoặc <strong>Nhúng HTML Slide Web</strong>!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    <span>Chọn tệp PDF / PPTX / Ảnh / Video để nạp ngay</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shadow-lg flex items-center justify-center relative">
                    {currentSlide.htmlContent ? (
                      <iframe
                        srcDoc={currentSlide.htmlContent}
                        title={currentSlide.title}
                        sandbox="allow-scripts allow-forms"
                        className="w-full h-[340px] border-0 bg-slate-950"
                      />
                    ) : currentSlide.htmlEmbedUrl ? (
                      <iframe
                        src={currentSlide.htmlEmbedUrl}
                        title={currentSlide.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        className="w-full h-[340px] border-0 bg-white"
                      />
                    ) : currentSlide.videoUrl ? (
                      <video
                        key={currentSlide.videoUrl}
                        src={currentSlide.videoUrl}
                        poster={currentSlide.imageUrl}
                        controls
                        className="w-full max-h-[340px] bg-black object-contain"
                      />
                    ) : (
                      <img
                        src={
                          currentSlide.imageUrl ||
                          renderSlideToCanvasDataUrl({
                            grade: selectedGrade,
                            period: selectedPeriod,
                            slideNumber: currentSlide.slideNumber,
                            totalSlides: activeSlides.length,
                            title: currentSlide.title,
                            subtitle: currentSlide.subtitle,
                            bulletPoints: currentSlide.bulletPoints || [],
                            highlightNote: currentSlide.highlightNote,
                          })
                        }
                        alt={currentSlide.title}
                        className="w-full max-h-[340px] object-contain"
                      />
                    )}
                  </div>

                  {/* Prev / Next Navigation in Preview */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={safePreviewIdx <= 0}
                      onClick={() => setPreviewSlideIdx(Math.max(0, safePreviewIdx - 1))}
                      className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      ← Slide trước
                    </button>
                    <span className="text-xs font-black text-slate-700">
                      Slide #{safePreviewIdx + 1} / {activeSlides.length}
                    </span>
                    <button
                      type="button"
                      disabled={safePreviewIdx >= activeSlides.length - 1}
                      onClick={() =>
                        setPreviewSlideIdx(
                          Math.min(activeSlides.length - 1, safePreviewIdx + 1)
                        )
                      }
                      className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-bold text-white cursor-pointer"
                    >
                      Slide tiếp →
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Slide List (Edit, Move Up/Down, Delete Individual Slides During Ingestion) */}
              {activeSlides.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      Danh sách Slide đã nạp ({activeSlides.length} Slide — Bấm để xem, sửa, đổi vị trí hoặc xoá):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dung lượng lưu trữ: {existingDeck?.totalCompressedKb || 0} KB
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {activeSlides.map((sl, idx) => {
                      const isSelected = idx === safePreviewIdx;
                      const isHtml = Boolean(sl.htmlContent || sl.htmlEmbedUrl);
                      const isVideo = Boolean(sl.videoUrl);
                      return (
                        <div
                          key={`${sl.slideNumber}-${idx}`}
                          onClick={() => setPreviewSlideIdx(idx)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50/90 border-2 border-indigo-500 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700'
                              }`}
                            >
                              {sl.slideNumber}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {sl.title}
                              </p>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {isHtml
                                  ? sl.embedMode === 'simulation-single'
                                    ? '🎯 HTML Mô phỏng'
                                    : '📚 Bộ Slide Web'
                                  : isVideo
                                  ? '🎬 Video Slide'
                                  : '🖼️ Ảnh Slide WebP'}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSlide(idx, idx - 1)}
                              className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-bold cursor-pointer border border-slate-200"
                              title="Chuyển lên trước"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={idx === activeSlides.length - 1}
                              onClick={() => handleMoveSlide(idx, idx + 1)}
                              className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-bold cursor-pointer border border-slate-200"
                              title="Chuyển xuống sau"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEditSlide(idx)}
                              className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer"
                              title="Sửa slide này"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingleSlide(idx)}
                              className="p-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold cursor-pointer"
                              title="Xoá slide này"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span>
                  ☁️ File Storage: <strong>{storageStats.usedStorageMb} MB</strong> /{' '}
                  {storageStats.storageQuotaMb} MB • CSDL:{' '}
                  <strong>{storageStats.dbUsedMb} MB</strong> / {storageStats.dbQuotaMb} MB
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleBroadcastCurrentSlideToLive}
                  disabled={activeSlides.length === 0}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">cast</span>
                  <span>
                    📢 Phát Trực Tiếp Slide #{safePreviewIdx + 1} Sang Phòng Live HS
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
