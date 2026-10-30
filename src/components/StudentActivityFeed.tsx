import React from 'react';
import { type StudentRosterItem } from '../data/mockCurriculumData';

interface ActivityItem {
  id: string;
  type: 'lesson' | 'badge' | 'peer' | 'streak';
  title: string;
  description: string;
  timestamp: string;
  xpDelta: number;
  starDelta?: number;
  icon: string;
  color: string;
}

interface StudentActivityFeedProps {
  currentStudent: StudentRosterItem;
  completedPeriods: number[];
}

export const StudentActivityFeed: React.FC<StudentActivityFeedProps> = ({
  currentStudent,
  completedPeriods,
}) => {
  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'badge',
      title: 'Mở khóa huy hiệu: Chiến Binh Số Nhí',
      description: 'Đạt chuỗi tự học 5 ngày liên tiếp và hoàn thành xuất sắc Phiếu học tập.',
      timestamp: 'Hôm nay, 08:30',
      xpDelta: 100,
      starDelta: 2,
      icon: 'workspace_premium',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      id: 'act-2',
      type: 'peer',
      title: 'Đánh giá đồng đẳng từ bạn cùng máy',
      description: `Bạn ${currentStudent.partnerName || 'Nguyễn Bảo An'} đã gửi phản hồi: "Làm việc nhóm rất ăn ý và gõ bài nhanh!"`,
      timestamp: 'Hôm nay, 08:15',
      xpDelta: 20,
      starDelta: 1,
      icon: 'rate_review',
      color: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    {
      id: 'act-3',
      type: 'lesson',
      title: 'Hoàn thành Tiết 1: Thông tin và dữ liệu',
      description: 'Đã hoàn thành cả 4 hoạt động: Khởi động, Khám phá, Luyện tập và Vận dụng.',
      timestamp: 'Hôm qua, 15:45',
      xpDelta: 150,
      starDelta: 3,
      icon: 'task_alt',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      id: 'act-4',
      type: 'streak',
      title: `Duy trì chuỗi học tập ${currentStudent.streakDays || 5} ngày`,
      description: 'Nhận thưởng điểm danh tự học và chăm chỉ thực hành trên CloudPlay OS.',
      timestamp: '2 ngày trước',
      xpDelta: 50,
      starDelta: 1,
      icon: 'local_fire_department',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 rounded-3xl bg-white shadow-xs border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">history_edu</span>
            <span>Nhật Ký Hoạt Động &amp; Tiến Trình Học Tập</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận lịch sử hoàn thành các tiết học, huy hiệu và đánh giá đồng đẳng theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Đã học {completedPeriods.length}/29 Tiết</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
            <span>⭐</span>
            <span>{currentStudent.stars} Ngôi sao</span>
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="flex flex-col gap-4 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-200">
        {activities.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4 pl-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border z-10 ${item.color}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>

            <div className="flex-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{item.title}</span>
                <span className="text-xs text-slate-400">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold">
                  +{item.xpDelta} XP
                </span>
                {item.starDelta && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                    +{item.starDelta} ⭐
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
