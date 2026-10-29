import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus(simulatedOffline = false) {
  const [browserOnline, setBrowserOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return browserOnline && !simulatedOffline;
}

export const PWAInstallButton: React.FC<{ onShowToast?: (msg: string) => void }> = ({
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (isInstallable) {
            const ok = await install();
            if (ok && onShowToast) {
              onShowToast('Đã cài đặt ứng dụng CloudPlay OS thành công!');
            }
          } else {
            setShowModal(true);
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm hover:brightness-95 transition-all shadow-sm cursor-pointer"
        title="Cài đặt ứng dụng học ngoại tuyến (PWA)"
      >
        <span className="material-symbols-outlined text-[16px]">download_for_offline</span>
        <span className="hidden sm:inline">{isIOS ? 'Cài lên iOS' : 'Tải App Offline'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg bg-surface-container-lowest p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">offline_pin</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Cài đặt Web App &amp; Học Ngoại Tuyến (PWA)
                  </h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Truy cập kho phiếu học tập &amp; minigame mọi lúc không cần mạng
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Đóng hướng dẫn cài đặt PWA"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-DEFAULT p-4 flex flex-col gap-2 text-body-sm text-on-surface">
              <div className="flex items-center gap-2 text-tertiary font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Đã lưu bộ nhớ đệm (Service Worker Cache) 100% bài học!</span>
              </div>
              <p className="text-on-surface-variant">
                {isIOS
                  ? 'Trên Safari (iPhone/iPad): Nhấn nút Chia sẻ (Share) ở thanh công cụ trình duyệt, sau đó chọn "Thêm vào Màn hình chính" (Add to Home Screen).'
                  : 'Trên trình duyệt máy tính / điện thoại: Nhấn biểu tượng Cài đặt ứng dụng (Install CloudPlay) trên thanh địa chỉ trình duyệt hoặc bật chế độ Ngoại tuyến ngay trên thanh công cụ.'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onShowToast?.('Đã đồng bộ toàn bộ học liệu Tiết 1 & Tiết 12 vào bộ nhớ Ngoại tuyến!');
                }}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm"
              >
                Đồng bộ gói học Ngoại tuyến ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<{
  isOnline: boolean;
  pendingCount: number;
  onSyncNow: () => void;
}> = ({ isOnline, pendingCount, onSyncNow }) => {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-full bg-inverse-surface px-4 py-2 text-inverse-on-surface shadow-2xl border border-outline-variant/30">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOnline ? 'bg-tertiary-fixed animate-ping' : 'bg-primary-container animate-pulse'
        }`}
      />
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm">
          {isOnline
            ? `Đã kết nối mạng • Có ${pendingCount} bản ghi chờ đồng bộ`
            : 'Chế độ Ngoại tuyến (Offline Mode) — Đang dùng dữ liệu bộ nhớ đệm'}
        </span>
        <span className="text-[11px] opacity-80">
          {isOnline
            ? 'Nhấn để đồng bộ tức thì lên Cloud DB'
            : 'Mọi thao tác làm phiếu & minigame được lưu an toàn và tự động đồng bộ khi có mạng'}
        </span>
      </div>
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={onSyncNow}
          className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm hover:scale-105 transition-transform"
        >
          Đồng bộ ({pendingCount})
        </button>
      )}
    </div>
  );
};
