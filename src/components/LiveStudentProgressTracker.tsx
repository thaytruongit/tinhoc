import React, { useState, useMemo } from 'react';
import {
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
  type StudentRosterItem,
} from '../data/mockCurriculumData';

export interface StudentActivityProgressDetail {
  studentId: string;
  studentName: string;
  stationNumber: string;
  classId: string;
  partnerName?: string;
  currentStage: 1 | 2 | 3 | 4 | 'hd3-practice' | 'completed';
  overallPercent: number;
  xpEarnedThisLesson: number;
  totalXp: number;
  lastActiveTime: string;
  stages: {
    hd1: {
      status: 'hoan-thanh' | 'dang-lam' | 'chua-lam';
      submittedAt?: string;
      keyword?: string;
      answerSummary?: string;
      score?: number;
      xp: number;
    };
    hd2: {
      status: 'hoan-thanh' | 'dang-lam' | 'chua-lam';
      submittedAt?: string;
      correctBlanks?: number;
      totalBlanks?: number;
      diagramMatched?: boolean;
      score?: number;
      xp: number;
    };
    hd3Quiz: {
      status: 'hoan-thanh' | 'dang-lam' | 'chua-lam';
      completedAt?: string;
      correctCount?: number;
      totalCount?: number;
      timeSpent?: string;
      score?: number;
      xp: number;
    };
    hd3Practice: {
      status: 'hoan-thanh' | 'dang-lam' | 'chua-lam';
      submittedAt?: string;
      driveUrl?: string;
      fileType?: string;
      fileName?: string;
      gradeScore?: number;
      teacherFeedback?: string;
    };
    hd4: {
      status: 'hoan-thanh' | 'dang-lam' | 'chua-lam';
      submittedAt?: string;
      practicalSolution?: string;
      reflection?: string;
      score?: number;
      xp: number;
    };
  };
}

interface LiveStudentProgressTrackerProps {
  students: StudentRosterItem[];
  classId: string;
  grade: number;
  period: number;
  periodSpec: CurriculumPeriodSpec;
  liveSession?: LiveClassroomSession;
  onShowToast: (msg: string) => void;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const LiveStudentProgressTracker: React.FC<LiveStudentProgressTrackerProps> = ({
  students,
  classId,
  grade,
  period,
  periodSpec,
  liveSession,
  onShowToast,
  onUpdateLiveSession,
  onClose,
  isEmbedded = false,
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<
    'all' | 'hd1' | 'hd2' | 'hd3' | 'hd3-practice' | 'hd4' | 'done'
  >('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    'all' | 'hoan-thanh' | 'dang-lam' | 'chua-lam'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] =
    useState<StudentActivityProgressDetail | null>(null);

  // Filter students by class
  const classStudents = useMemo(() => {
    const list = students.filter((s) => s.classId === classId);
    return list.length > 0 ? list : students.slice(0, 40);
  }, [students, classId]);

  // Generate deterministic descriptive progress data for students in this period
  const studentProgressList: StudentActivityProgressDetail[] = useMemo(() => {
    return classStudents.map((st, idx) => {
      // Seed variation based on student id and index
      const seed = (parseInt(st.id.replace(/\D/g, ''), 10) || idx * 17) + period * 7;
      const isHighAchiever = idx < 8 || st.xp > 1200;
      const isMidAchiever = idx >= 8 && idx < 28;

      // Realistic activity status
      const hd1Done = true; // Most students finish Warmup
      const hd2Done = isHighAchiever || isMidAchiever;
      const hd3QuizDone = isHighAchiever || (isMidAchiever && idx % 3 !== 0);
      const hd3PracticeDone = isHighAchiever || (isMidAchiever && idx % 2 === 0);
      const hd4Done = isHighAchiever;

      let currentStage: StudentActivityProgressDetail['currentStage'] = 1;
      let doneCount = 0;
      if (hd1Done) doneCount++;
      if (hd2Done) doneCount++;
      if (hd3QuizDone) doneCount++;
      if (hd3PracticeDone) doneCount++;
      if (hd4Done) doneCount++;

      if (doneCount >= 5) {
        currentStage = 'completed';
      } else if (!hd2Done) {
        currentStage = 2;
      } else if (!hd3QuizDone) {
        currentStage = 3;
      } else if (!hd3PracticeDone) {
        currentStage = 'hd3-practice';
      } else {
        currentStage = 4;
      }

      const overallPercent = Math.round((doneCount / 5) * 100);

      // Lesson specific descriptive text
      const lessonTopics: Record<number, string> = {
        1: 'Thông tin & Dữ liệu trong đời sống',
        2: 'Xử lí thông tin trong máy tính',
        3: 'Máy tính & các thiết bị lưu trữ số',
        4: 'Mạng máy tính & Internet toàn cầu',
      };
      const topicSnippet = lessonTopics[period] || periodSpec.lessonTitle;

      return {
        studentId: st.id,
        studentName: st.name,
        stationNumber: st.stationNumber || String(idx + 1).padStart(2, '0'),
        classId: st.classId,
        partnerName: st.partnerName,
        currentStage,
        overallPercent,
        xpEarnedThisLesson: doneCount * 30 + (isHighAchiever ? 40 : 10),
        totalXp: st.xp,
        lastActiveTime: `${Math.max(1, 15 - (idx % 12))} phút trước`,
        stages: {
          hd1: {
            status: hd1Done ? 'hoan-thanh' : 'dang-lam',
            submittedAt: `08:${String(10 + (idx % 10)).padStart(2, '0')}`,
            keyword: `Từ khóa: "${topicSnippet.split(' ')[0]} - Trực quan & Số hoá"`,
            answerSummary: `Em nhận thấy thông tin quanh em rất phong phú, từ âm thanh tiếng trống trường đến sách vở.`,
            score: 1.0,
            xp: 20,
          },
          hd2: {
            status: hd2Done ? 'hoan-thanh' : 'dang-lam',
            submittedAt: hd2Done ? `08:${String(22 + (idx % 10)).padStart(2, '0')}` : undefined,
            correctBlanks: hd2Done ? 3 : 1,
            totalBlanks: 3,
            diagramMatched: hd2Done,
            score: hd2Done ? (isHighAchiever ? 4.0 : 3.5) : 1.5,
            xp: hd2Done ? 40 : 15,
          },
          hd3Quiz: {
            status: hd3QuizDone ? 'hoan-thanh' : hd2Done ? 'dang-lam' : 'chua-lam',
            completedAt: hd3QuizDone ? `08:${String(32 + (idx % 8)).padStart(2, '0')}` : undefined,
            correctCount: hd3QuizDone ? (isHighAchiever ? 5 : 4) : 2,
            totalCount: 5,
            timeSpent: hd3QuizDone ? `0${1 + (idx % 3)}:${String(12 + (idx * 4) % 45).padStart(2, '0')}` : undefined,
            score: hd3QuizDone ? (isHighAchiever ? 10.0 : 8.0) : 4.0,
            xp: hd3QuizDone ? 50 : 0,
          },
          hd3Practice: {
            status: hd3PracticeDone ? 'hoan-thanh' : hd3QuizDone ? 'dang-lam' : 'chua-lam',
            submittedAt: hd3PracticeDone ? `08:${String(38 + (idx % 6)).padStart(2, '0')}` : undefined,
            driveUrl: hd3PracticeDone
              ? `https://drive.google.com/drive/folders/thaytruongit_${classId.toLowerCase()}_${st.id}`
              : undefined,
            fileType: 'Google Drive (.docx/.pptx)',
            fileName: `BaiTapThucHanh_Tiet${period}_${st.name.replace(/\s+/g, '')}.docx`,
            gradeScore: hd3PracticeDone ? (isHighAchiever ? 9.5 : 8.5) : undefined,
            teacherFeedback: hd3PracticeDone ? 'Thao tác chuẩn xác, định dạng đẹp mắt.' : undefined,
          },
          hd4: {
            status: hd4Done ? 'hoan-thanh' : hd3PracticeDone ? 'dang-lam' : 'chua-lam',
            submittedAt: hd4Done ? `08:${String(42 + (idx % 4)).padStart(2, '0')}` : undefined,
            practicalSolution: `Áp dụng phân loại dữ liệu trong việc quản lý tủ sách gia đình và thời khóa biểu học tập cá nhân.`,
            reflection: `Hiểu rõ bản chất thông tin và phân biệt với dữ liệu thô.`,
            score: hd4Done ? 2.5 : undefined,
            xp: hd4Done ? 30 : 0,
          },
        },
      };
    });
  }, [classStudents, period, periodSpec.lessonTitle, classId]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = studentProgressList.length;
    const completedAll = studentProgressList.filter((s) => s.currentStage === 'completed').length;
    const hd1Count = studentProgressList.filter((s) => s.stages.hd1.status === 'hoan-thanh').length;
    const hd2Count = studentProgressList.filter((s) => s.stages.hd2.status === 'hoan-thanh').length;
    const hd3QuizCount = studentProgressList.filter((s) => s.stages.hd3Quiz.status === 'hoan-thanh').length;
    const hd3PracticeCount = studentProgressList.filter((s) => s.stages.hd3Practice.status === 'hoan-thanh').length;
    const hd4Count = studentProgressList.filter((s) => s.stages.hd4.status === 'hoan-thanh').length;

    const avgCompletion =
      total > 0
        ? Math.round(
            studentProgressList.reduce((acc, curr) => acc + curr.overallPercent, 0) / total
          )
        : 0;

    return {
      total,
      completedAll,
      avgCompletion,
      hd1Count,
      hd2Count,
      hd3QuizCount,
      hd3PracticeCount,
      hd4Count,
    };
  }, [studentProgressList]);

  // Filtered list
  const filteredStudents = useMemo(() => {
    return studentProgressList.filter((st) => {
      // Stage filter
      if (selectedStageFilter === 'hd1' && st.stages.hd1.status !== 'hoan-thanh') return false;
      if (selectedStageFilter === 'hd2' && st.stages.hd2.status !== 'hoan-thanh') return false;
      if (selectedStageFilter === 'hd3' && st.stages.hd3Quiz.status !== 'hoan-thanh') return false;
      if (selectedStageFilter === 'hd3-practice' && st.stages.hd3Practice.status !== 'hoan-thanh')
        return false;
      if (selectedStageFilter === 'hd4' && st.stages.hd4.status !== 'hoan-thanh') return false;
      if (selectedStageFilter === 'done' && st.currentStage !== 'completed') return false;

      // Status filter
      if (selectedStatusFilter === 'hoan-thanh' && st.currentStage !== 'completed') return false;
      if (selectedStatusFilter === 'chua-lam' && st.overallPercent > 20) return false;
      if (
        selectedStatusFilter === 'dang-lam' &&
        (st.currentStage === 'completed' || st.overallPercent === 0)
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = st.studentName.toLowerCase().includes(q);
        const matchesId = st.studentId.toLowerCase().includes(q);
        const matchesStation = st.stationNumber.includes(q);
        if (!matchesName && !matchesId && !matchesStation) return false;
      }

      return true;
    });
  }, [studentProgressList, selectedStageFilter, selectedStatusFilter, searchQuery]);

  const handleRewardStudent = (st: StudentActivityProgressDetail) => {
    onShowToast(`🎉 Đã cộng +20 XP khen thưởng nỗ lực học tập cho học sinh: ${st.studentName}!`);
  };

  const handleRemindStudent = (st: StudentActivityProgressDetail) => {
    onShowToast(`🔔 Đã gửi nhắc nhở tập trung trực tiếp tới Máy #${st.stationNumber} (${st.studentName})!`);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col ${
        isEmbedded ? 'w-full' : 'max-w-6xl mx-auto w-full my-4'
      }`}
    >
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <span className="material-symbols-outlined text-[28px]">monitoring</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Bảng Theo Dõi &amp; Mô Tả Tiến Độ Học Sinh Trực Tiếp
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              Khối {grade} • Tiết {period}: {periodSpec.lessonTitle} • Lớp {classId} (Sĩ số: {stats.total} HS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-right">
            <span className="text-[11px] text-indigo-200 block">Tiến độ lớp chung</span>
            <span className="text-base font-black text-amber-300">{stats.avgCompletion}%</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Đóng bảng theo dõi"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 5 Stage Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
        {/* HĐ 1 Card */}
        <div
          onClick={() => setSelectedStageFilter(selectedStageFilter === 'hd1' ? 'all' : 'hd1')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedStageFilter === 'hd1'
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>HĐ 1: Khởi động</span>
            <span className="text-indigo-600 font-black">1.0đ</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.hd1Count}</span>
            <span className="text-xs text-slate-500">/{stats.total} HS</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${(stats.hd1Count / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">Huy động từ khóa &amp; tình huống</span>
        </div>

        {/* HĐ 2 Card */}
        <div
          onClick={() => setSelectedStageFilter(selectedStageFilter === 'hd2' ? 'all' : 'hd2')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedStageFilter === 'hd2'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>HĐ 2: Khám phá</span>
            <span className="text-blue-600 font-black">4.0đ</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.hd2Count}</span>
            <span className="text-xs text-slate-500">/{stats.total} HS</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${(stats.hd2Count / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">Phiếu học tập &amp; Điền khuyết</span>
        </div>

        {/* HĐ 3 Đấu trường Card */}
        <div
          onClick={() => setSelectedStageFilter(selectedStageFilter === 'hd3' ? 'all' : 'hd3')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedStageFilter === 'hd3'
              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>HĐ 3: Luyện tập</span>
            <span className="text-purple-600 font-black">Quiz</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.hd3QuizCount}</span>
            <span className="text-xs text-slate-500">/{stats.total} HS</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${(stats.hd3QuizCount / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">Đấu trường trắc nghiệm tính giờ</span>
        </div>

        {/* HĐ 3 Thực hành Card */}
        <div
          onClick={() =>
            setSelectedStageFilter(selectedStageFilter === 'hd3-practice' ? 'all' : 'hd3-practice')
          }
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedStageFilter === 'hd3-practice'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>HĐ 3: Thực hành</span>
            <span className="text-emerald-600 font-black">Drive</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.hd3PracticeCount}</span>
            <span className="text-xs text-slate-500">/{stats.total} HS</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${(stats.hd3PracticeCount / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">Nộp bài phòng máy Google Drive</span>
        </div>

        {/* HĐ 4 Vận dụng Card */}
        <div
          onClick={() => setSelectedStageFilter(selectedStageFilter === 'hd4' ? 'all' : 'hd4')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedStageFilter === 'hd4'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>HĐ 4: Vận dụng</span>
            <span className="text-amber-600 font-black">2.5đ</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.hd4Count}</span>
            <span className="text-xs text-slate-500">/{stats.total} HS</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${(stats.hd4Count / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">Tình huống thực tế &amp; Liên hệ</span>
        </div>

        {/* Hoàn thành cả 4 HĐ Card */}
        <div
          onClick={() => setSelectedStageFilter(selectedStageFilter === 'done' ? 'all' : 'done')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedStageFilter === 'done'
              ? 'bg-green-50 border-green-400 ring-2 ring-green-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Hoàn thành 100%</span>
            <span className="text-green-600 font-black">Đạt</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-green-700">{stats.completedAll}</span>
            <span className="text-xs text-slate-500">/{stats.total} HS</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-green-600 h-full rounded-full transition-all"
              style={{ width: `${(stats.completedAll / Math.max(1, stats.total)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">Đã nộp xong toàn bộ các hoạt động</span>
        </div>
      </div>

      {/* Control & Search Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã HS hoặc số máy..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Lọc theo:</span>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedStageFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({studentProgressList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStageFilter('hd1')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'hd1'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HĐ 1 ({stats.hd1Count})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStageFilter('hd2')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'hd2'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HĐ 2 ({stats.hd2Count})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStageFilter('hd3')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'hd3'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HĐ 3 Quiz ({stats.hd3QuizCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStageFilter('hd3-practice')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'hd3-practice'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HĐ 3 Thực hành ({stats.hd3PracticeCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStageFilter('hd4')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'hd4'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HĐ 4 ({stats.hd4Count})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStageFilter('done')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStageFilter === 'done'
                  ? 'bg-white text-green-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoàn thành ({stats.completedAll})
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Descriptive List */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Máy #</th>
              <th className="py-3 px-4 min-w-[180px]">Học sinh &amp; Ghép đôi</th>
              <th className="py-3 px-4 text-center w-28">Tiến độ chung</th>
              <th className="py-3 px-4 min-w-[280px]">Mô tả chi tiết bài làm thời gian thực</th>
              <th className="py-3 px-4 text-center w-28">Điểm / XP</th>
              <th className="py-3 px-4 text-right min-w-[140px]">Tương tác GV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">
                    inbox
                  </span>
                  Không tìm thấy học sinh phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => (
                <tr
                  key={st.studentId}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => setSelectedStudentDetail(st)}
                >
                  {/* Station Number */}
                  <td className="py-3.5 px-4 text-center font-black text-indigo-700 bg-indigo-50/30">
                    <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-900 text-xs">
                      #{st.stationNumber}
                    </span>
                  </td>

                  {/* Student Name & Companion */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{st.studentName}</span>
                      {st.currentStage === 'completed' && (
                        <span className="text-emerald-600 text-xs" title="Đã hoàn thành toàn bộ bài học">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>Mã HS: {st.studentId}</span>
                      {st.partnerName && st.partnerName !== 'Học cá nhân (1 mình)' && (
                        <>
                          <span>•</span>
                          <span className="text-purple-600 font-semibold truncate max-w-[120px]">
                            Đôi bạn: {st.partnerName}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Overall Completion % Bar */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-xs">
                          {st.overallPercent}%
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            st.currentStage === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {st.currentStage === 'completed'
                            ? 'Xong'
                            : st.currentStage === 'hd3-practice'
                            ? 'HĐ3-TH'
                            : `HĐ ${st.currentStage}`}
                        </span>
                      </div>
                      <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            st.overallPercent === 100
                              ? 'bg-emerald-500'
                              : st.overallPercent >= 60
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${st.overallPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Descriptive Action & Submission Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 text-[11px]">
                      {/* Active / Last Stage Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* HĐ 1 Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            st.stages.hd1.status === 'hoan-thanh'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title={`HĐ1: ${st.stages.hd1.keyword}`}
                        >
                          HĐ1: {st.stages.hd1.status === 'hoan-thanh' ? 'Đã gửi từ khóa' : 'Đang làm'}
                        </span>

                        {/* HĐ 2 Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            st.stages.hd2.status === 'hoan-thanh'
                              ? 'bg-blue-100 text-blue-800'
                              : st.stages.hd2.status === 'dang-lam'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                          title={`HĐ2: Điền khuyết ${st.stages.hd2.correctBlanks}/${st.stages.hd2.totalBlanks}`}
                        >
                          HĐ2:{' '}
                          {st.stages.hd2.status === 'hoan-thanh'
                            ? `Phiếu ${st.stages.hd2.score}đ`
                            : st.stages.hd2.status === 'dang-lam'
                            ? 'Đang điền'
                            : 'Chờ'}
                        </span>

                        {/* HĐ 3 Quiz Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            st.stages.hd3Quiz.status === 'hoan-thanh'
                              ? 'bg-purple-100 text-purple-800'
                              : st.stages.hd3Quiz.status === 'dang-lam'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                          title={`Đấu trường Quiz: ${st.stages.hd3Quiz.correctCount}/${st.stages.hd3Quiz.totalCount} câu`}
                        >
                          HĐ3-Quiz:{' '}
                          {st.stages.hd3Quiz.status === 'hoan-thanh'
                            ? `${st.stages.hd3Quiz.score}đ (${st.stages.hd3Quiz.timeSpent})`
                            : st.stages.hd3Quiz.status === 'dang-lam'
                            ? 'Đang thi'
                            : 'Chờ'}
                        </span>

                        {/* HĐ 3 Practical Drive Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            st.stages.hd3Practice.status === 'hoan-thanh'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                          title={st.stages.hd3Practice.driveUrl || 'Chưa nộp bài thực hành Drive'}
                        >
                          HĐ3-TH:{' '}
                          {st.stages.hd3Practice.status === 'hoan-thanh' ? 'Đã nộp Drive' : 'Chưa'}
                        </span>

                        {/* HĐ 4 Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            st.stages.hd4.status === 'hoan-thanh'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          HĐ4: {st.stages.hd4.status === 'hoan-thanh' ? 'Đã vận dụng' : 'Chờ'}
                        </span>
                      </div>

                      {/* Descriptive narrative */}
                      <p className="text-slate-600 line-clamp-1 italic">
                        {st.currentStage === 'completed'
                          ? `🏆 Đã hoàn tất cả 4 hoạt động, nộp bài thực hành và phản hồi tình huống thực tiễn xuất sắc.`
                          : st.currentStage === 'hd3-practice'
                          ? `💻 Đang thực hành phòng máy & tải tệp lên Google Drive của lớp.`
                          : st.currentStage === 3
                          ? `⚡ Đang tham gia Đấu trường trắc nghiệm tính giờ tại trạm máy.`
                          : st.currentStage === 2
                          ? `📖 Đang hoàn thành phiếu học tập khám phá và ghép nối sơ đồ tư duy.`
                          : `💡 Đã gửi từ khóa khởi động: "${st.stages.hd1.keyword}".`}
                      </p>
                    </div>
                  </td>

                  {/* Score & XP Earned */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-black text-indigo-700 block text-xs">
                      +{st.xpEarnedThisLesson} XP
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tổng: {st.totalXp.toLocaleString()} XP
                    </span>
                  </td>

                  {/* Teacher Quick Interaction Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleRewardStudent(st)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors cursor-pointer"
                        title="Khen thưởng +20 XP cho học sinh"
                      >
                        ⭐ Khen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemindStudent(st)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-colors cursor-pointer"
                        title="Gửi nhắc nhở tập trung trực tiếp tới máy HS"
                      >
                        🔔 Nhắc
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal when a student row is clicked */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center">
                  #{selectedStudentDetail.stationNumber}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedStudentDetail.studentName} — Máy #{selectedStudentDetail.stationNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mã HS: {selectedStudentDetail.studentId} • Lớp {selectedStudentDetail.classId}
                    {selectedStudentDetail.partnerName && (
                      <span className="text-purple-700 font-bold ml-1.5">
                        (Đôi bạn: {selectedStudentDetail.partnerName})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stages Detailed Breakdown */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {/* HĐ 1 Detail */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                    <span>💡 Hoạt động 1: Khởi động</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800">
                      {selectedStudentDetail.stages.hd1.status === 'hoan-thanh' ? 'Đã nộp' : 'Đang làm'}
                    </span>
                  </span>
                  <span className="text-xs font-black text-indigo-700">
                    {selectedStudentDetail.stages.hd1.score}đ (+{selectedStudentDetail.stages.hd1.xp} XP)
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  {selectedStudentDetail.stages.hd1.keyword}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  "{selectedStudentDetail.stages.hd1.answerSummary}"
                </p>
              </div>

              {/* HĐ 2 Detail */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900 flex items-center gap-1">
                    <span>📖 Hoạt động 2: Khám phá kiến thức</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                      {selectedStudentDetail.stages.hd2.status === 'hoan-thanh' ? 'Đã nộp' : 'Đang làm'}
                    </span>
                  </span>
                  <span className="text-xs font-black text-blue-700">
                    {selectedStudentDetail.stages.hd2.score}đ (+{selectedStudentDetail.stages.hd2.xp} XP)
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  Phiếu học tập: Đúng {selectedStudentDetail.stages.hd2.correctBlanks}/
                  {selectedStudentDetail.stages.hd2.totalBlanks} chỗ điền khuyết. Sơ đồ tư duy:{' '}
                  {selectedStudentDetail.stages.hd2.diagramMatched ? 'Chính xác 100%' : 'Chưa hoàn tất'}.
                </p>
              </div>

              {/* HĐ 3 Quiz Detail */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-900 flex items-center gap-1">
                    <span>⚡ Hoạt động 3: Đấu trường Luyện tập</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                      {selectedStudentDetail.stages.hd3Quiz.status === 'hoan-thanh' ? 'Đã nộp' : 'Đang làm'}
                    </span>
                  </span>
                  <span className="text-xs font-black text-purple-700">
                    {selectedStudentDetail.stages.hd3Quiz.score}đ (+{selectedStudentDetail.stages.hd3Quiz.xp} XP)
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  Kết quả trắc nghiệm: Đúng {selectedStudentDetail.stages.hd3Quiz.correctCount}/
                  {selectedStudentDetail.stages.hd3Quiz.totalCount} câu. Thời gian làm bài:{' '}
                  {selectedStudentDetail.stages.hd3Quiz.timeSpent || 'Đang thi'}.
                </p>
              </div>

              {/* HĐ 3 Practice Detail */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                    <span>💻 Hoạt động 3: Thực hành phòng máy</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      {selectedStudentDetail.stages.hd3Practice.status === 'hoan-thanh' ? 'Đã nộp bài' : 'Chưa nộp'}
                    </span>
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {selectedStudentDetail.stages.hd3Practice.gradeScore ? `${selectedStudentDetail.stages.hd3Practice.gradeScore}đ` : 'Chờ chấm'}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  Tệp nộp: <span className="font-mono">{selectedStudentDetail.stages.hd3Practice.fileName}</span>
                </p>
                {selectedStudentDetail.stages.hd3Practice.driveUrl && (
                  <a
                    href={selectedStudentDetail.stages.hd3Practice.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>📁 Mở thư mục Google Drive bài làm học sinh</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                )}
              </div>

              {/* HĐ 4 Detail */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
                    <span>🌟 Hoạt động 4: Vận dụng thực tế</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                      {selectedStudentDetail.stages.hd4.status === 'hoan-thanh' ? 'Đã nộp' : 'Đang làm'}
                    </span>
                  </span>
                  <span className="text-xs font-black text-amber-700">
                    {selectedStudentDetail.stages.hd4.score ? `${selectedStudentDetail.stages.hd4.score}đ` : 'Chờ nộp'}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  {selectedStudentDetail.stages.hd4.practicalSolution}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleRemindStudent(selectedStudentDetail)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                🔔 Nhắc nhở tập trung
              </button>
              <button
                type="button"
                onClick={() => handleRewardStudent(selectedStudentDetail)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                ⭐ Khen thưởng +20 XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
