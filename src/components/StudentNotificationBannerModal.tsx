import React, { useState, useEffect } from 'react';
import type { StudentRosterItem, LiveClassroomSession, CurriculumPeriodSpec } from '../data/mockCurriculumData';

export interface StudentNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'live' | 'exercise' | 'grade' | 'announcement';
  periodNumber?: number;
  read: boolean;
  actionText?: string;
  actionPeriod?: number;
}

export interface StudentNotificationBannerModalProps {
  currentStudent: StudentRosterItem;
  liveSession?: LiveClassroomSession;
  currentPeriodSpec: CurriculumPeriodSpec;
  onOpenPeriod: (period: number) => void;
  onShowToast: (msg: string) => void;
}

export const StudentNotificationBannerModal: React.FC<StudentNotificationBannerModalProps> = ({
  currentStudent,
  liveSession,
  currentPeriodSpec,
  onOpenPeriod,
  onShowToast,
}) => {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true);
  const [showBellPopover, setShowBellPopover] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [pushPermissionGranted, setPushPermissionGranted] = useState<boolean>(false);

  // Check browser Notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Generate dynamic announcements & exercise summary based on student's grade & class
  useEffect(() => {
    const isLive = Boolean(
      liveSession?.isBroadcasting && liveSession.activeClassId === currentStudent.classId
    );

    const initialList: StudentNotificationItem[] = [
      {
        id: 'notif-live',
        title: isLive
          ? `🔴 Thầy Đỗ Mạnh Trường đang phát Live cho Lớp ${currentStudent.classId}!`
          : `📢 Thông Báo Giảng Dạy Lớp ${currentStudent.classId}`,
        message: isLive
          ? `Giáo viên đã mở Tiết ${liveSession?.activePeriod} - ${currentPeriodSpec.lessonTitle}. Em hãy vào làm bài tập Hoạt động ${liveSession?.activeStage} ngay!`
          : `Lớp ${currentStudent.classId} sẵn sàng học Tiết ${currentPeriodSpec.period}: ${currentPeriodSpec.lessonTitle}.`,
        timestamp: 'Vừa xong',
        type: isLive ? 'live' : 'announcement',
        periodNumber: currentPeriodSpec.period,
        read: false,
        actionText: isLive ? 'Vào lớp phát Live' : 'Mở bài học',
        actionPeriod: currentPeriodSpec.period,
      },
      {
        id: 'notif-ex1',
        title: '📝 Bài tập mới: Phiếu Học Tập Khám Phá (Hoạt động 2)',
        message: `Đã nạp câu hỏi nguyên bản Kéo-Thả, Điền khuyết và Trả lời ngắn cho ${currentPeriodSpec.lessonTitle}. Điểm tối đa 4.0 điểm.`,
        timestamp: '5 phút trước',
        type: 'exercise',
        periodNumber: currentPeriodSpec.period,
        read: false,
        actionText: 'Làm Hoạt động 2',
        actionPeriod: currentPeriodSpec.period,
      },
      {
        id: 'notif-ex2',
        title: '⚡ Đấu Trường Trắc Nghiệm 25s (Hoạt động 3)',
        message: 'Hoàn thành 6 câu trắc nghiệm tốc độ để tích lũy +3.0 điểm và nhận điểm thưởng XP!',
        timestamp: '15 phút trước',
        type: 'exercise',
        periodNumber: currentPeriodSpec.period,
        read: false,
        actionText: 'Vào Đấu trường 25s',
        actionPeriod: currentPeriodSpec.period,
      },
      {
        id: 'notif-drive',
        title: '☁️ Nhắc nhở nộp sản phẩm Google Drive (Hoạt động 4)',
        message: `Hạn chót nộp tệp sản phẩm thực hành vào thư mục Lớp ${currentStudent.classId} trên Google Drive để nhận tối đa 3.0 điểm.`,
        timestamp: '30 phút trước',
        type: 'grade',
        periodNumber: currentPeriodSpec.period,
        read: false,
        actionText: 'Nộp bài Drive',
        actionPeriod: currentPeriodSpec.period,
      },
    ];

    setNotifications(initialList);

    // Trigger Browser Push Notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔔 Cổng Học Sinh Lớp ${currentStudent.classId}`, {
          body: isLive
            ? `Thầy giáo đang mở Live Tiết ${liveSession?.activePeriod} - ${currentPeriodSpec.lessonTitle}!`
            : `Có bài tập mới cho ${currentPeriodSpec.lessonTitle}. Chúc em học tốt!`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore notification error
      }
    }
  }, [currentStudent, liveSession, currentPeriodSpec]);

  // Request Web Notification permission from browser
  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setPushPermissionGranted(true);
          onShowToast('🎉 Đã bật thông báo đẩy Web Push Notification thành công!');
        } else {
          onShowToast('Trình duyệt chưa cấp quyền thông báo đẩy.');
        }
      } catch {
        onShowToast('Không thể bật thông báo trình duyệt.');
      }
    } else {
      onShowToast('Trình duyệt của em không hỗ trợ Web Notifications.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onShowToast('Đã đánh dấu đọc tất cả thông báo!');
  };

  const handleNotificationAction = (notif: StudentNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.actionPeriod) {
      onOpenPeriod(notif.actionPeriod);
    }
    setShowLoginModal(false);
    setShowBellPopover(false);
    onShowToast(`Mở bài học: ${notif.title}`);
  };

  return (
    <>
      {/* Top Header Bell Notification Trigger & Popover */}
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowBellPopover(!showBellPopover)}
          className="relative w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          title="Xem thông báo bài tập mới từ giáo viên"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-error text-on-error font-bold text-[10px] animate-bounce shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Bell Popover Drawer */}
        {showBellPopover && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl z-50 p-4 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
                <span className="font-bold text-xs text-on-surface">Thông Báo Bài Tập & Giảng Dạy</span>
              </div>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
              >
                Đọc tất cả
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationAction(notif)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                    notif.read
                      ? 'bg-surface-container-low/50 border-outline-variant/15 opacity-80'
                      : 'bg-primary-fixed/20 border-primary/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-on-surface line-clamp-1">{notif.title}</span>
                    <span className="text-[10px] text-on-surface-variant shrink-0 font-medium">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2">{notif.message}</p>
                  {notif.actionText && (
                    <span className="text-[10px] font-bold text-primary self-end hover:underline mt-1">
                      {notif.actionText} →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant">Lớp {currentStudent.classId}</span>
              <button
                type="button"
                onClick={() => setShowBellPopover(false)}
                className="font-bold text-on-surface hover:text-primary cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login Welcome Push Notification Summary Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-tertiary text-white flex items-center justify-center font-bold shadow-md">
                  <span className="material-symbols-outlined text-[26px]">mark_email_unread</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                    <span>Chào mừng {currentStudent.name}!</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">
                      {currentStudent.classId}
                    </span>
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Tóm tắt bài tập mới & thông báo giảng dạy từ Giáo viên
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors"
                title="Đóng thông báo"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Notification Items List */}
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border flex flex-col gap-1.5 transition-all ${
                    notif.type === 'live'
                      ? 'bg-gradient-to-r from-primary-fixed/40 via-surface-container-low to-secondary-fixed/30 border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        {notif.type === 'live'
                          ? 'sensors'
                          : notif.type === 'exercise'
                          ? 'assignment'
                          : 'campaign'}
                      </span>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed pl-5">
                    {notif.message}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleNotificationAction(notif)}
                      className="px-3.5 py-1 rounded-full bg-primary text-on-primary font-bold text-xs hover:brightness-110 cursor-pointer shadow-xs transition-all flex items-center gap-1"
                    >
                      <span>{notif.actionText || 'Vào học ngay'}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Browser Push Notification Permission Prompt */}
            {!pushPermissionGranted && (
              <div className="bg-primary-container/20 border border-primary/20 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
                  <span className="text-on-surface-variant font-medium">
                    Nhận thông báo đẩy Web Push trực tiếp trên trình duyệt khi có bài tập mới?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPushPermission}
                  className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-bold shrink-0 cursor-pointer hover:brightness-105"
                >
                  Bật Push
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Lớp {currentStudent.classId} • Khối {currentStudent.grade}
              </span>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:brightness-110 cursor-pointer shadow-xs transition-all"
              >
                Đã Hiểu & Bắt Đầu Học →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
