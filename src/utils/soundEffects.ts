import confetti from 'canvas-confetti';

export interface AchievementBadgeSpec {
  id: string;
  name: string;
  starsRequired: number;
  xpRequired: number;
  icon: string;
  color: string;
  description: string;
  category: 'sao' | 'tien-do' | 'dong-dang';
}

export const ACHIEVEMENT_BADGES: AchievementBadgeSpec[] = [
  {
    id: 'b1',
    name: 'Tập Sự Số Nhí',
    starsRequired: 5,
    xpRequired: 300,
    icon: 'school',
    color: 'from-blue-400 to-indigo-500',
    description: 'Hoàn thành tiết học đầu tiên và kết nối bạn đồng hành cùng máy.',
    category: 'tien-do',
  },
  {
    id: 'b2',
    name: 'Chiến Binh GDPT 2018',
    starsRequired: 10,
    xpRequired: 600,
    icon: 'workspace_premium',
    color: 'from-amber-400 to-orange-500',
    description: 'Đạt điểm tối đa trong Đấu trường 25s và nộp đầy đủ Phiếu học tập.',
    category: 'sao',
  },
  {
    id: 'b3',
    name: 'Ngôi Sao Đồng Đẳng',
    starsRequired: 15,
    xpRequired: 1000,
    icon: 'diversity_3',
    color: 'from-pink-400 to-rose-500',
    description: 'Nhận 5 lượt đánh giá tích cực từ các bạn cùng nhóm và cùng máy.',
    category: 'dong-dang',
  },
  {
    id: 'b4',
    name: 'Chuyên Gia Dữ Liệu',
    starsRequired: 18,
    xpRequired: 1250,
    icon: 'database',
    color: 'from-emerald-400 to-teal-500',
    description: 'Nắm vững phân biệt Thông tin - Dữ liệu - Vật mang tin chuẩn mực.',
    category: 'sao',
  },
  {
    id: 'b5',
    name: 'Học Giả Đám Mây',
    starsRequired: 22,
    xpRequired: 1500,
    icon: 'cloud_done',
    color: 'from-sky-400 to-cyan-600',
    description: 'Lưu trữ thành thạo sản phẩm thực hành lên Google Drive lớp học.',
    category: 'tien-do',
  },
  {
    id: 'b6',
    name: 'Đại Kiện Tướng AI',
    starsRequired: 30,
    xpRequired: 2000,
    icon: 'psychology',
    color: 'from-purple-500 to-violet-600',
    description: 'Vận dụng thành công các công cụ trí tuệ nhân tạo vào học tập Tin học.',
    category: 'sao',
  },
];

export function getNextBadgeProgress(currentXp: number, currentStars: number) {
  const nextBadge =
    ACHIEVEMENT_BADGES.find(
      (b) => currentXp < b.xpRequired || currentStars < b.starsRequired
    ) || ACHIEVEMENT_BADGES[ACHIEVEMENT_BADGES.length - 1];

  const prevBadges = ACHIEVEMENT_BADGES.filter(
    (b) => currentXp >= b.xpRequired && currentStars >= b.starsRequired
  );
  const currentBadge = prevBadges.length > 0 ? prevBadges[prevBadges.length - 1] : null;

  const xpRemaining = Math.max(0, nextBadge.xpRequired - currentXp);
  const starsRemaining = Math.max(0, nextBadge.starsRequired - currentStars);
  const progressPercent = Math.min(
    100,
    Math.max(5, Math.round((currentXp / nextBadge.xpRequired) * 100))
  );

  return {
    currentBadge,
    nextBadge,
    xpRemaining,
    starsRemaining,
    progressPercent,
    unlockedCount: prevBadges.length,
    totalBadges: ACHIEVEMENT_BADGES.length,
  };
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Phát âm thanh fanfare chiến thắng khi mở khóa Huy hiệu thành tựu (C5 -> E5 -> G5 -> C6)
 */
export function playBadgeUnlockSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, delay: 0, duration: 0.14 },     // C5
      { freq: 659.25, delay: 0.11, duration: 0.14 },  // E5
      { freq: 783.99, delay: 0.22, duration: 0.16 },  // G5
      { freq: 1046.5, delay: 0.34, duration: 0.45 },  // C6
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.24, now + delay + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * Phát âm thanh chuông leng keng khi đạt mốc XP mới (G5 -> B5 -> D6)
 */
export function playXpMilestoneSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 783.99, delay: 0, duration: 0.12 },    // G5
      { freq: 987.77, delay: 0.09, duration: 0.12 }, // B5
      { freq: 1174.66, delay: 0.18, duration: 0.32 }, // D6
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * Phát âm thanh báo hiệu nhẹ khi Giáo viên chuyển hoạt động trong Phòng Live
 */
export function playStageBroadcastSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, delay: 0, duration: 0.12 },   // E5
      { freq: 880.0, delay: 0.11, duration: 0.25 }, // A5
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.15, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * Kích hoạt đồng bộ hiệu ứng Âm thanh (Audio Cue) + Pháo hoa (Confetti)
 */
export function triggerSynchronizedCelebration(mode: 'badge' | 'xp' = 'badge'): void {
  if (mode === 'badge') {
    playBadgeUnlockSound();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
    });
  } else {
    playXpMilestoneSound();
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#38bdf8', '#10b981'],
    });
  }
}
