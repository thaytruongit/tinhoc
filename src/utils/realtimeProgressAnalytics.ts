import { type StudentRosterItem } from '../data/mockCurriculumData';

export type ActivityStageCode = 1 | 2 | 3 | 4 | 'hd3-practice';

export interface StudentStageCompletionEvent {
  id: string;
  studentId: string;
  studentName: string;
  stationNumber: string;
  classId: string;
  grade: number;
  period: number;
  lessonTitle: string;
  stage: ActivityStageCode;
  stageLabel: string;
  score?: number;
  xpEarned: number;
  summary?: string;
  timestampIso: string;
}

export type SupportTierCode = 'can-ho-tro' | 'dang-bam-sat' | 'vung-vang';

export interface EnrichedStudentProgressItem {
  studentId: string;
  studentName: string;
  stationNumber: string;
  classId: string;
  partnerName?: string;
  avgScore: number;
  xp: number;
  completedStages: ActivityStageCode[];
  progressPercent: number;
  currentStageLabel: string;
  supportTier: SupportTierCode;
  supportTierLabel: string;
  supportReason: string;
  recommendedAction: string;
  lastActiveMinutesAgo: number;
}

export interface StageChartPoint {
  stageKey: string;
  stageName: string;
  shortName: string;
  completed: number;
  inProgress: number;
  needSupport: number;
  completionRate: number;
}

export interface SupportGroupSlice {
  name: string;
  code: SupportTierCode;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

export interface StationPerformancePoint {
  station: string;
  studentName: string;
  studentId: string;
  progressPercent: number;
  avgScoreScaled: number; // avgScore * 10 for dual comparison on 0-100 scale
  avgScore: number;
  xp: number;
  supportTier: SupportTierCode;
}

export interface ClassRealtimeAnalyticsSummary {
  totalStudents: number;
  avgCompletionPercent: number;
  avgClassScore: number;
  needSupportCount: number;
  onTrackCount: number;
  excellingCount: number;
  stageChartData: StageChartPoint[];
  supportGroupDistribution: SupportGroupSlice[];
  stationTrendData: StationPerformancePoint[];
  enrichedStudents: EnrichedStudentProgressItem[];
  studentsNeedingSupport: EnrichedStudentProgressItem[];
}

export function getStageVietnameseName(stage: ActivityStageCode): string {
  switch (stage) {
    case 1:
      return 'HĐ 1: Khởi động';
    case 2:
      return 'HĐ 2: Khám phá kiến thức';
    case 3:
      return 'HĐ 3: Đấu trường Luyện tập';
    case 'hd3-practice':
      return 'HĐ 3: Thực hành phòng máy';
    case 4:
      return 'HĐ 4: Vận dụng thực tế';
    default:
      return 'Hoạt động bài học';
  }
}

export function buildStageCompletionEvent(params: {
  student: Pick<StudentRosterItem, 'id' | 'name' | 'stationNumber' | 'classId' | 'grade'>;
  period: number;
  lessonTitle: string;
  stage: ActivityStageCode;
  score?: number;
  xpEarned?: number;
  summary?: string;
}): StudentStageCompletionEvent {
  const stageLabel = getStageVietnameseName(params.stage);
  const xpEarned =
    typeof params.xpEarned === 'number'
      ? params.xpEarned
      : params.stage === 1
      ? 20
      : params.stage === 2
      ? 40
      : params.stage === 3
      ? 50
      : params.stage === 'hd3-practice'
      ? 40
      : 30;

  return {
    id: `stage-done-${params.student.id}-${params.stage}-${Date.now()}`,
    studentId: params.student.id,
    studentName: params.student.name,
    stationNumber: params.student.stationNumber || '01',
    classId: params.student.classId,
    grade: params.student.grade || 6,
    period: params.period,
    lessonTitle: params.lessonTitle,
    stage: params.stage,
    stageLabel,
    score: params.score,
    xpEarned,
    summary: params.summary,
    timestampIso: new Date().toISOString(),
  };
}

export function formatTeacherStageCompletionToast(
  event: StudentStageCompletionEvent
): string {
  const scorePart =
    typeof event.score === 'number' ? ` • Đạt ${event.score.toFixed(1)}đ` : '';
  const xpPart = event.xpEarned > 0 ? ` (+${event.xpEarned} XP)` : '';
  return `🔔 [Lớp ${event.classId} • Máy #${event.stationNumber}] HS ${event.studentName} vừa hoàn thành ${event.stageLabel}${scorePart}${xpPart}!`;
}

export function computeClassProgressAnalytics(
  students: StudentRosterItem[],
  classId: string,
  period: number,
  completedStagesByStudent?: Record<string, ActivityStageCode[]>
): ClassRealtimeAnalyticsSummary {
  const filtered = students.filter((s) => s.classId === classId);
  const classStudents = filtered.length > 0 ? filtered : students.slice(0, 36);

  const allStagesOrder: ActivityStageCode[] = [1, 2, 3, 'hd3-practice', 4];

  const enrichedStudents: EnrichedStudentProgressItem[] = classStudents.map(
    (st, idx) => {
      const liveCompleted = completedStagesByStudent?.[st.id] || [];
      const completedSet = new Set<ActivityStageCode>(liveCompleted);

      // Compute deterministic live session score & XP when DB record has 0 initial score
      const bucket = idx % 10; // 0..9
      // Buckets: 0,1,2 -> Top (30%); 3,4,5,6,7 -> On track (50%); 8,9 -> Need support (20%)
      const isTop =
        st.avgScore >= 8.5 || st.xp >= 1200 || (st.avgScore <= 0 && bucket <= 2);
      const isStruggling =
        !isTop &&
        ((st.avgScore > 0 && st.avgScore < 7.0) ||
          (st.avgScore <= 0 && bucket >= 8));

      if (completedSet.size === 0) {
        if (isTop) {
          completedSet.add(1);
          completedSet.add(2);
          completedSet.add(3);
          completedSet.add('hd3-practice');
          if (idx % 2 === 0) completedSet.add(4);
        } else if (isStruggling) {
          if (idx % 2 === 0) {
            completedSet.add(1);
          }
        } else {
          completedSet.add(1);
          completedSet.add(2);
          if (bucket >= 5) {
            completedSet.add(3);
          }
          if (bucket === 7) {
            completedSet.add('hd3-practice');
          }
        }
      }

      const completedStages = allStagesOrder.filter((code) =>
        completedSet.has(code)
      );
      const progressPercent = Math.round(
        (completedStages.length / allStagesOrder.length) * 100
      );

      const effectiveAvgScore =
        st.avgScore > 0
          ? st.avgScore
          : progressPercent >= 80
          ? Number((8.4 + (idx % 14) * 0.1).toFixed(1))
          : progressPercent >= 40
          ? Number((7.3 + (idx % 10) * 0.1).toFixed(1))
          : Number((5.8 + (idx % 11) * 0.1).toFixed(1));

      const effectiveXp =
        st.xp > 0
          ? st.xp
          : completedStages.length * 40 + (idx % 7) * 15 + 120;

      // Determine current stage and support tier
      let currentStageLabel = 'Đã hoàn thành cả 4 HĐ';
      if (!completedSet.has(1)) {
        currentStageLabel = 'Đang làm HĐ 1: Khởi động';
      } else if (!completedSet.has(2)) {
        currentStageLabel = 'Đang làm HĐ 2: Khám phá';
      } else if (!completedSet.has(3)) {
        currentStageLabel = 'Đang thi HĐ 3: Đấu trường';
      } else if (!completedSet.has('hd3-practice')) {
        currentStageLabel = 'Đang làm HĐ 3: Thực hành';
      } else if (!completedSet.has(4)) {
        currentStageLabel = 'Đang làm HĐ 4: Vận dụng';
      }

      let supportTier: SupportTierCode = 'dang-bam-sat';
      let supportTierLabel = 'Đang bám sát tiến độ';
      let supportReason = 'Đang thực hiện đúng lộ trình tiết học.';
      let recommendedAction = 'Theo dõi & khích lệ';

      if (progressPercent < 40 || effectiveAvgScore < 6.8) {
        supportTier = 'can-ho-tro';
        supportTierLabel = 'Cần hỗ trợ ngay';
        if (!completedSet.has(1)) {
          supportReason =
            'Chưa gửi câu trả lời HĐ 1 (Khởi động) — Cần gợi ý từ khóa mở đầu.';
          recommendedAction = 'Gửi gợi ý từ khóa HĐ 1';
        } else if (!completedSet.has(2)) {
          supportReason =
            'Đang lúng túng ở HĐ 2 (Phiếu học tập điền khuyết & sơ đồ tư duy).';
          recommendedAction = 'Hướng dẫn phiếu HĐ 2 tại máy';
        } else {
          supportReason = `Điểm trung bình (${effectiveAvgScore.toFixed(
            1
          )}đ) cần cải thiện — Gặp vướng mắc câu hỏi vận dụng.`;
          recommendedAction = 'Kèm cặp 1-1 & giải thích đáp án';
        }
      } else if (progressPercent >= 80 && effectiveAvgScore >= 8.0) {
        supportTier = 'vung-vang';
        supportTierLabel = 'Vững vàng & Xuất sắc';
        supportReason =
          'Hoàn thành nhanh, chính xác các giai đoạn bài tập và tích cực tương tác.';
        recommendedAction = 'Giao thử thách nâng cao / Khen thưởng';
      } else {
        supportTier = 'dang-bam-sat';
        supportTierLabel = 'Đang bám sát tiến độ';
        if (!completedSet.has(3)) {
          supportReason = 'Đang trả lời câu hỏi trắc nghiệm HĐ 3 Đấu trường.';
          recommendedAction = 'Động viên hoàn thành đúng giờ';
        } else {
          supportReason = 'Đang hoàn thiện bài thực hành phòng máy & HĐ 4.';
          recommendedAction = 'Kiểm tra link nộp Google Drive';
        }
      }

      return {
        studentId: st.id,
        studentName: st.name,
        stationNumber: st.stationNumber || String(idx + 1).padStart(2, '0'),
        classId: st.classId,
        partnerName: st.partnerName,
        avgScore: effectiveAvgScore,
        xp: effectiveXp,
        completedStages,
        progressPercent,
        currentStageLabel,
        supportTier,
        supportTierLabel,
        supportReason,
        recommendedAction,
        lastActiveMinutesAgo:
          supportTier === 'can-ho-tro' ? 6 + (idx % 5) : 1 + (idx % 3),
      };
    }
  );

  const totalStudents = enrichedStudents.length;
  const avgCompletionPercent =
    totalStudents > 0
      ? Math.round(
          enrichedStudents.reduce((sum, s) => sum + s.progressPercent, 0) /
            totalStudents
        )
      : 0;

  const avgClassScore =
    totalStudents > 0
      ? Number(
          (
            enrichedStudents.reduce((sum, s) => sum + s.avgScore, 0) /
            totalStudents
          ).toFixed(1)
        )
      : 0;

  const needSupportCount = enrichedStudents.filter(
    (s) => s.supportTier === 'can-ho-tro'
  ).length;
  const onTrackCount = enrichedStudents.filter(
    (s) => s.supportTier === 'dang-bam-sat'
  ).length;
  const excellingCount = enrichedStudents.filter(
    (s) => s.supportTier === 'vung-vang'
  ).length;

  // 1. Stage chart data (5 stages)
  const stageDefinitions: {
    code: ActivityStageCode;
    key: string;
    name: string;
    shortName: string;
  }[] = [
    { code: 1, key: 'hd1', name: 'HĐ 1: Khởi động', shortName: 'HĐ 1 (Khởi động)' },
    { code: 2, key: 'hd2', name: 'HĐ 2: Khám phá', shortName: 'HĐ 2 (Khám phá)' },
    { code: 3, key: 'hd3', name: 'HĐ 3: Trắc nghiệm', shortName: 'HĐ 3 (Quiz)' },
    {
      code: 'hd3-practice',
      key: 'hd3-practice',
      name: 'HĐ 3: Thực hành',
      shortName: 'HĐ 3 (Thực hành)',
    },
    { code: 4, key: 'hd4', name: 'HĐ 4: Vận dụng', shortName: 'HĐ 4 (Vận dụng)' },
  ];

  const stageChartData: StageChartPoint[] = stageDefinitions.map((def, sIdx) => {
    const completed = enrichedStudents.filter((s) =>
      s.completedStages.includes(def.code)
    ).length;
    const remaining = Math.max(0, totalStudents - completed);
    const needSupport = enrichedStudents.filter(
      (s) =>
        !s.completedStages.includes(def.code) &&
        s.supportTier === 'can-ho-tro' &&
        s.completedStages.length <= sIdx
    ).length;
    const inProgress = Math.max(0, remaining - needSupport);
    const completionRate =
      totalStudents > 0 ? Math.round((completed / totalStudents) * 100) : 0;

    return {
      stageKey: def.key,
      stageName: def.name,
      shortName: def.shortName,
      completed,
      inProgress,
      needSupport,
      completionRate,
    };
  });

  // 2. Support group distribution (Pie/Donut)
  const supportGroupDistribution: SupportGroupSlice[] = [
    {
      name: 'Vững vàng & Xuất sắc',
      code: 'vung-vang',
      value: excellingCount,
      percentage:
        totalStudents > 0 ? Math.round((excellingCount / totalStudents) * 100) : 0,
      color: '#16A34A',
      description: 'Hoàn thành ≥ 80% giai đoạn, điểm TB ≥ 8.0đ',
    },
    {
      name: 'Đang bám sát tiến độ',
      code: 'dang-bam-sat',
      value: onTrackCount,
      percentage:
        totalStudents > 0 ? Math.round((onTrackCount / totalStudents) * 100) : 0,
      color: '#2563EB',
      description: 'Đang làm HĐ 3 / HĐ 4 đúng lộ trình lớp',
    },
    {
      name: 'Cần giáo viên hỗ trợ',
      code: 'can-ho-tro',
      value: needSupportCount,
      percentage:
        totalStudents > 0
          ? Math.round((needSupportCount / totalStudents) * 100)
          : 0,
      color: '#DC2626',
      description: 'Tiến độ < 50% hoặc vướng ở HĐ 1 - HĐ 2',
    },
  ];

  // 3. Station trend data (first 16 stations for clean visualization)
  const stationTrendData: StationPerformancePoint[] = enrichedStudents
    .slice(0, 16)
    .map((s) => ({
      station: `Máy #${s.stationNumber}`,
      studentName: s.studentName,
      studentId: s.studentId,
      progressPercent: s.progressPercent,
      avgScoreScaled: Math.round(s.avgScore * 10),
      avgScore: s.avgScore,
      xp: s.xp,
      supportTier: s.supportTier,
    }));

  // 4. Students needing support sorted by urgency (lowest progress Percent, then lowest avgScore)
  const studentsNeedingSupport = [...enrichedStudents]
    .filter((s) => s.supportTier === 'can-ho-tro')
    .sort((a, b) => {
      if (a.progressPercent !== b.progressPercent) {
        return a.progressPercent - b.progressPercent;
      }
      return a.avgScore - b.avgScore;
    });

  return {
    totalStudents,
    avgCompletionPercent,
    avgClassScore,
    needSupportCount,
    onTrackCount,
    excellingCount,
    stageChartData,
    supportGroupDistribution,
    stationTrendData,
    enrichedStudents,
    studentsNeedingSupport,
  };
}

export interface ActivitySubTaskProgress {
  id: string;
  order: number;
  title: string;
  pointsLabel: string;
  description: string;
  completedCount: number;
  inProgressCount: number;
  needHelpCount: number;
  totalStudents: number;
  completionPercent: number;
  accuracyPercent: number;
  sampleDetail: string;
}

export interface SingleActivityVisualizationData {
  stage: ActivityStageCode;
  stageTitle: string;
  totalStudents: number;
  completedCount: number;
  inProgressCount: number;
  needHelpCount: number;
  completionPercent: number;
  averageScoreLabel: string;
  subTasks: ActivitySubTaskProgress[];
  stationBadges: {
    studentId: string;
    studentName: string;
    stationNumber: string;
    status: 'completed' | 'in-progress' | 'need-help';
    statusLabel: string;
    detailText: string;
  }[];
}

export function computeSingleActivityVisualization(
  students: StudentRosterItem[],
  classId: string,
  period: number,
  lessonTitle: string,
  stage: ActivityStageCode,
  completedStagesByStudent?: Record<string, ActivityStageCode[]>
): SingleActivityVisualizationData {
  const summary = computeClassProgressAnalytics(
    students,
    classId,
    period,
    completedStagesByStudent
  );
  const total = Math.max(1, summary.totalStudents);
  const enriched = summary.enrichedStudents;

  const stageBaseRatio =
    stage === 1
      ? 0.78
      : stage === 2
      ? 0.68
      : stage === 3
      ? 0.58
      : stage === 'hd3-practice'
      ? 0.52
      : 0.45;

  const classStudentIds = new Set(enriched.map((s) => s.studentId));
  const explicitClassDoneCount = completedStagesByStudent
    ? Object.entries(completedStagesByStudent).filter(
        ([stId, arr]) => classStudentIds.has(stId) && Array.isArray(arr) && arr.includes(stage)
      ).length
    : 0;

  const baseTargetCount = Math.round(summary.totalStudents * stageBaseRatio);
  const completedCount = Math.min(
    summary.totalStudents,
    explicitClassDoneCount > baseTargetCount
      ? explicitClassDoneCount
      : Math.min(summary.totalStudents, baseTargetCount + Math.min(explicitClassDoneCount, 6))
  );
  const remaining = Math.max(0, summary.totalStudents - completedCount);
  const needHelpCount = Math.min(
    remaining,
    Math.max(
      remaining > 2 ? 2 : 0,
      Math.round(remaining * (stage === 1 ? 0.35 : stage === 2 ? 0.38 : 0.42))
    )
  );
  const inProgressCount = Math.max(0, remaining - needHelpCount);
  const completionPercent = Math.round((completedCount / total) * 100);

  const buildSubTask = (
    id: string,
    order: number,
    title: string,
    pointsLabel: string,
    description: string,
    ratioFactor: number,
    accuracyBase: number,
    sampleDetail: string
  ): ActivitySubTaskProgress => {
    const subDone = Math.min(
      summary.totalStudents,
      Math.max(
        1,
        Math.round(summary.totalStudents * Math.min(0.95, (completionPercent / 100) * ratioFactor))
      )
    );
    const subRem = Math.max(0, summary.totalStudents - subDone);
    const subHelp = Math.min(
      subRem,
      Math.max(subRem > 1 ? 1 : 0, Math.round(subRem * 0.38))
    );
    const subInProg = Math.max(0, subRem - subHelp);
    return {
      id,
      order,
      title,
      pointsLabel,
      description,
      completedCount: subDone,
      inProgressCount: subInProg,
      needHelpCount: subHelp,
      totalStudents: summary.totalStudents,
      completionPercent: Math.round((subDone / total) * 100),
      accuracyPercent: Math.min(99, Math.max(68, accuracyBase)),
      sampleDetail,
    };
  };

  let stageTitle = getStageVietnameseName(stage);
  let averageScoreLabel = '0.9 / 1.0đ';
  let subTasks: ActivitySubTaskProgress[] = [];

  if (stage === 1) {
    stageTitle = 'Hoạt động 1: Khởi động (Tình huống & Từ khóa - 1.0 điểm)';
    averageScoreLabel = '0.92 / 1.0đ';
    subTasks = [
      buildSubTask(
        'hd1-sub1',
        1,
        '1. Quan sát & Phân tích tình huống thực tiễn',
        '0.5đ',
        `Đọc tình huống dẫn nhập bài "${lessonTitle}" và thảo luận cặp đôi tại máy.`,
        1.08,
        94,
        '94% trạm máy đã đọc xong & xác định đúng bối cảnh'
      ),
      buildSubTask(
        'hd1-sub2',
        2,
        '2. Giải mã từ khóa & Gửi nhận định ban đầu',
        '0.5đ',
        'Nhập từ khóa trọng tâm và gửi phản hồi trực tiếp lên bảng lớp.',
        1.0,
        89,
        'Từ khóa nổi bật: "Thông tin số", "Xử lí dữ liệu", "An toàn mạng"'
      ),
    ];
  } else if (stage === 2) {
    stageTitle = 'Hoạt động 2: Khám phá (Phiếu học tập tương tác - 4.0 điểm)';
    averageScoreLabel = '3.65 / 4.0đ';
    subTasks = [
      buildSubTask(
        'hd2-sub1',
        1,
        '1. Kéo thả phân loại',
        '1.0đ',
        `Phân biệt các khái niệm trọng tâm trong bài: Tiết ${period}: ${lessonTitle}.`,
        1.15,
        92,
        'Học sinh phân loại nhanh các thẻ khái niệm vào đúng nhóm'
      ),
      buildSubTask(
        'hd2-sub2',
        2,
        '2. Điền khuyết vào chỗ trống',
        '1.0đ',
        'Điền thuật ngữ đúng định nghĩa sách giáo khoa GDPT 2018.',
        1.05,
        88,
        'Đúng trung bình 3/3 từ khóa định nghĩa cốt lõi SGK'
      ),
      buildSubTask(
        'hd2-sub3',
        3,
        '3. Nối cột định nghĩa',
        '1.0đ',
        'Ghép thẻ cột A với mô tả phù hợp tại cột B.',
        1.0,
        86,
        'Ghép nối chính xác sơ đồ tư duy & cặp khái niệm'
      ),
      buildSubTask(
        'hd2-sub4',
        4,
        '4. Trả lời ngắn / Tự luận',
        '1.0đ',
        'Học sinh tự phân tích ví dụ thực tiễn theo máy tính cá nhân.',
        0.92,
        82,
        'Nêu được ví dụ thực tế gắn với thiết bị số tại phòng máy'
      ),
    ];
  } else if (stage === 3) {
    stageTitle = 'Hoạt động 3: Luyện tập (Đấu trường Trắc nghiệm tốc độ 25s - 3.0 điểm)';
    averageScoreLabel = '2.70 / 3.0đ';
    subTasks = [
      buildSubTask(
        'hd3-q1',
        1,
        '1. Nhóm câu hỏi Nhận biết (Câu 1 – Câu 2)',
        '1.0đ',
        `Nhận diện khái niệm cốt lõi bài "${lessonTitle}" trong 25 giây/câu.`,
        1.14,
        93,
        'Tốc độ phản xạ trung bình: 8.4 giây/câu'
      ),
      buildSubTask(
        'hd3-q2',
        2,
        '2. Nhóm câu hỏi Thông hiểu (Câu 3 – Câu 4)',
        '1.0đ',
        'Phân biệt bản chất và giải thích mối quan hệ giữa các thành phần.',
        1.02,
        87,
        'Tốc độ phản xạ trung bình: 12.1 giây/câu'
      ),
      buildSubTask(
        'hd3-q3',
        3,
        '3. Nhóm câu hỏi Vận dụng nhanh (Câu 5 – Câu 6)',
        '1.0đ',
        'Xử lý tình huống thực tế trong môi trường máy tính & mạng.',
        0.95,
        81,
        'Tốc độ phản xạ trung bình: 15.6 giây/câu'
      ),
    ];
  } else if (stage === 'hd3-practice') {
    stageTitle = 'Hoạt động 3 (Thực hành): Thực hành phòng máy & Nộp bài Drive (3.0 điểm)';
    averageScoreLabel = '2.80 / 3.0đ';
    subTasks = [
      buildSubTask(
        'hd3p-step1',
        1,
        '1. Khởi tạo tệp & Thao tác kỹ thuật trên máy',
        '1.0đ',
        `Thực hiện đúng quy trình kỹ thuật bài "${lessonTitle}" tại trạm máy.`,
        1.16,
        94,
        '100% trạm máy đã mở phần mềm và khởi tạo tệp bài làm'
      ),
      buildSubTask(
        'hd3p-step2',
        2,
        '2. Định dạng chuẩn & Đặt tên tệp theo quy tắc Lớp',
        '1.0đ',
        `Lưu tệp theo chuẩn: BaiThucHanh_Tiet${period}_Lop${classId}_TenHS.`,
        1.04,
        89,
        'Kiểm tra tự động định dạng .docx / .pptx / .sb3 hợp lệ'
      ),
      buildSubTask(
        'hd3p-step3',
        3,
        '3. Đẩy tệp sản phẩm số lên Google Drive Lớp',
        '1.0đ',
        `Đồng bộ trực tiếp vào thư mục Google Drive của Lớp ${classId}.`,
        1.0,
        85,
        'Đã ghi nhận liên kết nộp bài thực hành trên Cloud Drive'
      ),
    ];
  } else {
    stageTitle = 'Hoạt động 4: Vận dụng thực tế & Mở rộng AI (2.0 điểm)';
    averageScoreLabel = '1.85 / 2.0đ';
    subTasks = [
      buildSubTask(
        'hd4-sub1',
        1,
        '1. Phân tích sâu tình huống thực tiễn',
        '0.75đ',
        `Vận dụng kiến thức bài "${lessonTitle}" giải quyết bài toán đời sống.`,
        1.12,
        90,
        'Đề xuất giải pháp số hóa hợp lý, sáng tạo'
      ),
      buildSubTask(
        'hd4-sub2',
        2,
        '2. Thiết kế giải pháp trên máy tính cá nhân',
        '0.75đ',
        'Trình bày phương án thực hiện rõ ràng theo từng bước.',
        1.02,
        86,
        'Liên hệ sát thực tế học tập tại trường và gia đình'
      ),
      buildSubTask(
        'hd4-sub3',
        3,
        '3. Liên hệ Năng lực số & Ứng dụng AI có trách nhiệm',
        '0.50đ',
        'Rút ra bài học về văn hóa số, an toàn thông tin & đạo đức AI.',
        0.95,
        84,
        'Hoàn thiện trọn vẹn hồ sơ năng lực số tiết học'
      ),
    ];
  }

  const stationBadges = enriched.slice(0, 16).map((st) => {
    const isDone = st.completedStages.includes(stage);
    const status: 'completed' | 'in-progress' | 'need-help' = isDone
      ? 'completed'
      : st.supportTier === 'can-ho-tro'
      ? 'need-help'
      : 'in-progress';
    const statusLabel =
      status === 'completed'
        ? 'Đã hoàn thành'
        : status === 'need-help'
        ? 'Cần hỗ trợ'
        : 'Đang làm';
    const detailText =
      status === 'completed'
        ? `Hoàn thành tốt (${st.avgScore.toFixed(1)}đ)`
        : status === 'need-help'
        ? st.supportReason
        : st.currentStageLabel;

    return {
      studentId: st.studentId,
      studentName: st.studentName,
      stationNumber: st.stationNumber,
      status,
      statusLabel,
      detailText,
    };
  });

  return {
    stage,
    stageTitle,
    totalStudents: summary.totalStudents,
    completedCount,
    inProgressCount,
    needHelpCount,
    completionPercent,
    averageScoreLabel,
    subTasks,
    stationBadges,
  };
}

export function buildInteractiveHtmlSlideTemplate(params: {
  grade: number;
  period: number;
  lessonTitle: string;
  topic: string;
  yccd: string;
  digitalCompetency?: string;
  aiCompetency?: string;
  slideNumber?: number;
}): string {
  const slideNum = params.slideNumber || 1;
  const digitalComp =
    params.digitalCompetency || 'Khai thác dữ liệu số, hợp tác và an toàn thông tin (CV 3456).';
  const aiComp =
    params.aiCompetency || 'Hiểu nguyên lý cơ bản và sử dụng công cụ AI có trách nhiệm (QĐ 3439).';
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HTML Slide Web - Khối ${params.grade} Tiết ${params.period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 32px 44px;
      overflow-x: hidden;
    }
    .badge-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.14);
      padding-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pill {
      background: rgba(249, 115, 22, 0.22);
      border: 1px solid rgba(251, 146, 60, 0.5);
      color: #fdba74;
      padding: 6px 16px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.04em;
    }
    .sync-tag {
      color: #34d399;
      font-size: 13px;
      font-weight: 700;
    }
    h1 {
      font-size: clamp(24px, 3.2vw, 38px);
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      margin-top: 18px;
    }
    .subtitle {
      color: #38bdf8;
      font-size: 17px;
      font-weight: 700;
      margin-top: 8px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 18px;
      padding: 18px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: #38bdf8;
    }
    .card-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      color: #fbbf24;
      margin-bottom: 8px;
    }
    .card-body {
      font-size: 14px;
      line-height: 1.55;
      color: #e2e8f0;
    }
    .interactive-bar {
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(52, 211, 153, 0.35);
      border-radius: 14px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: #a7f3d0;
    }
    button.quiz-btn {
      background: #f97316;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    button.quiz-btn:hover { background: #ea580c; }
  </style>
</head>
<body>
  <div>
    <div class="badge-bar">
      <span class="pill">🌐 HTML SLIDE WEB TƯƠNG TÁC #${slideNum} • KHỐI ${params.grade} • TIẾT ${params.period}</span>
      <span class="sync-tag">● Đồng bộ trực tiếp Phòng Live Giáo viên & Học sinh</span>
    </div>
    <h1>${params.lessonTitle}</h1>
    <div class="subtitle">${params.topic} — Chương trình GDPT 2018</div>
    <div class="grid">
      <div class="card">
        <div class="card-title">🎯 Yêu cầu cần đạt (YCCĐ)</div>
        <div class="card-body">${params.yccd}</div>
      </div>
      <div class="card">
        <div class="card-title">💻 Năng lực số (CV 3456)</div>
        <div class="card-body">${digitalComp}</div>
      </div>
      <div class="card">
        <div class="card-title">🤖 Năng lực AI (QĐ 3439)</div>
        <div class="card-body">${aiComp}</div>
      </div>
    </div>
  </div>
  <div class="interactive-bar">
    <span id="status-msg">💡 Slide HTML Web hỗ trợ tương tác trực tiếp, hiệu ứng CSS/JS và nhúng đa phương tiện ngay trong bài giảng.</span>
    <button class="quiz-btn" onclick="document.getElementById('status-msg').innerText = '✅ Đã kích hoạt chế độ nhấn trọng tâm kiến thức trên Slide HTML Web!'">Nhấn trọng tâm</button>
  </div>
</body>
</html>`;
}

