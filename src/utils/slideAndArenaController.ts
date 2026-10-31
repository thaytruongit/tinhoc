export type PresenterKeyAction = 'next' | 'prev' | null;

/**
 * Resolves keyboard / wireless presenter clicker key events into slide navigation actions.
 * Supports Space, ArrowRight, PageDown ('next') and ArrowLeft, PageUp ('prev').
 * Ignores events when focus is inside an interactive text input/textarea/select.
 */
export function resolvePresenterKeyAction(
  key: string,
  code: string,
  targetTagName?: string,
  isContentEditable?: boolean
): PresenterKeyAction {
  const tag = (targetTagName || '').toUpperCase();
  if (
    isContentEditable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT'
  ) {
    return null;
  }

  if (
    key === ' ' ||
    code === 'Space' ||
    key === 'ArrowRight' ||
    code === 'ArrowRight' ||
    key === 'PageDown' ||
    code === 'PageDown'
  ) {
    return 'next';
  }

  if (
    key === 'ArrowLeft' ||
    code === 'ArrowLeft' ||
    key === 'PageUp' ||
    code === 'PageUp'
  ) {
    return 'prev';
  }

  return null;
}

/**
 * Determines whether a student live room view is unlocked.
 * CRITICAL RULE: When the teacher is actively broadcasting a slide image (teacherActiveView === 'slide'),
 * ALL other activities (1, 2, 3, 'hd3-practice', 4) are locked so ONLY the slide is available.
 */
export function isStudentLiveViewUnlocked(params: {
  viewId: 'slide' | 1 | 2 | 3 | 'hd3-practice' | 4;
  teacherActiveView?: string;
  isSlideDeckUnlocked: boolean;
  isPracticeStage3Unlocked: boolean;
  unlockedStages: Record<number, boolean>;
  teacherCurrentStage: number;
}): boolean {
  const {
    viewId,
    teacherActiveView,
    isSlideDeckUnlocked,
    isPracticeStage3Unlocked,
    unlockedStages,
    teacherCurrentStage,
  } = params;

  // When teacher broadcasts slide image, lock all other activities
  if (teacherActiveView === 'slide') {
    return viewId === 'slide';
  }

  if (viewId === 'slide') {
    return isSlideDeckUnlocked;
  }

  if (viewId === 'hd3-practice') {
    return isPracticeStage3Unlocked;
  }

  return Boolean(
    viewId === 1 || unlockedStages[viewId] || viewId <= teacherCurrentStage
  );
}

/**
 * Computes remaining seconds for the Practice Arena (Đấu trường Luyện tập) countdown timer.
 */
export function computeArenaRemainingSeconds(
  arenaState:
    | {
        isRunning: boolean;
        durationSec: number;
        startedAtIso: string;
        remainingSecOnPause?: number;
      }
    | undefined,
  nowMs: number = Date.now()
): number {
  if (!arenaState) return 300; // Default 5 minutes (300s)
  const duration = Math.max(10, Number(arenaState.durationSec) || 300);
  if (!arenaState.isRunning) {
    return typeof arenaState.remainingSecOnPause === 'number'
      ? Math.max(0, arenaState.remainingSecOnPause)
      : duration;
  }
  const startedMs = Date.parse(arenaState.startedAtIso);
  if (Number.isNaN(startedMs)) return duration;
  const elapsedSec = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
  return Math.max(0, duration - elapsedSec);
}

/**
 * Formats seconds into MM:SS string (e.g. 300 -> "05:00").
 */
export function formatCountdownMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Estimates binary size in bytes of a base64 data URL.
 */
export function estimateBase64Bytes(dataUrl: string): number {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64Part = dataUrl.includes(';base64,')
    ? dataUrl.split(';base64,')[1]
    : dataUrl;
  return Math.round((base64Part.length * 3) / 4);
}

/**
 * Checks if a slide imageUrl is already stored in the 1GB File Storage bucket.
 */
export function isFileStorageSlideUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('/api/file-storage/slides/file/') ||
    url.includes('/storage/v1/object/public/')
  );
}

/**
 * Computes visual urgency state (percentage, color classes, warning label) for the
 * Practice Arena Countdown Clock (Đồng hồ đếm ngược Đấu trường Luyện tập).
 */
export function getArenaCountdownVisualState(
  remainingSec: number,
  durationSec: number
): {
  percent: number;
  urgencyLevel: 'normal' | 'warning' | 'critical' | 'expired';
  statusLabel: string;
  progressBarClass: string;
  timerBadgeClass: string;
} {
  const safeDuration = Math.max(10, Number(durationSec) || 300);
  const clampedRemaining = Math.max(0, Math.floor(remainingSec));
  const percent = Math.max(
    0,
    Math.min(100, Math.round((clampedRemaining / safeDuration) * 100))
  );

  if (clampedRemaining <= 0) {
    return {
      percent: 0,
      urgencyLevel: 'expired',
      statusLabel: '⏰ Đã hết giờ làm bài Đấu trường',
      progressBarClass: 'bg-rose-600',
      timerBadgeClass: 'bg-rose-700 text-white border-rose-300',
    };
  }

  if (clampedRemaining <= 60 || percent <= 20) {
    return {
      percent,
      urgencyLevel: 'critical',
      statusLabel: '🔴 Cảnh báo: Sắp hết giờ! Khẩn trương hoàn thành!',
      progressBarClass:
        'bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 animate-pulse',
      timerBadgeClass:
        'bg-rose-600 text-white border-rose-200 animate-pulse shadow-lg',
    };
  }

  if (clampedRemaining <= 120 || percent <= 45) {
    return {
      percent,
      urgencyLevel: 'warning',
      statusLabel: '🟡 Chú ý tốc độ: Thời gian đang trôi nhanh!',
      progressBarClass:
        'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600',
      timerBadgeClass: 'bg-amber-500 text-slate-950 border-amber-200',
    };
  }

  return {
    percent,
    urgencyLevel: 'normal',
    statusLabel: '🟢 Đang mở Đấu trường Luyện tập',
    progressBarClass:
      'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400',
    timerBadgeClass: 'bg-black/40 text-amber-300 border-amber-400/40',
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

