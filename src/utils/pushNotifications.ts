/**
 * Web Push Notification & Real-Time Alert Utilities for CloudPlay Learning OS
 */

let pushAudioCtx: AudioContext | null = null;

function getPushAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!pushAudioCtx) {
      pushAudioCtx = new AudioCtx();
    }
    if (pushAudioCtx.state === 'suspended') {
      pushAudioCtx.resume().catch(() => {});
    }
    return pushAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Play an ascending 3-note chime sound effect for Push Notifications (C5 -> F5 -> A5)
 */
export function playPushNotificationChime(): void {
  const ctx = getPushAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, delay: 0, duration: 0.12 }, // C5
      { freq: 698.46, delay: 0.09, duration: 0.12 }, // F5
      { freq: 880.0, delay: 0.18, duration: 0.32 }, // A5
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.22, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    });
  } catch {
    // ignore audio restrictions
  }
}

/**
 * Request native browser Push Notification permission
 */
export async function requestPushNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return Notification.permission || 'denied';
  }
}

/**
 * Check if browser Push Notifications are permitted
 */
export function isPushNotificationGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Send a native OS/Browser Push Notification if permitted
 */
export function sendNativePushNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
  }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || 'Thầy/Cô vừa cập nhật tiến trình tiết học!',
        icon: options?.icon || 'pwa-192x192.png',
        tag: options?.tag || 'live-activity-unlock',
        badge: 'pwa-192x192.png',
        silent: false,
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        if (typeof options?.data?.onClick === 'function') {
          options.data.onClick();
        }
        notif.close();
      };
      return true;
    } catch (err) {
      console.warn('[Native Push Notification Notice]:', err);
      return false;
    }
  }
  return false;
}
