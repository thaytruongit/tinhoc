import React, { useState, useMemo } from 'react';
import {
  type CustomLessonWorksheet,
  type CustomDragItem,
  type CustomFillBlankQuestion,
  type CustomMatchingQuestion as CustomMatchingPair,
  type CustomShortAnswerQuestion,
} from '../data/mockCurriculumData';
import { triggerSynchronizedCelebration } from '../utils/soundEffects';

export interface UnifiedDiscoveryWorksheetProps {
  lessonTitle: string;
  grade: number;
  period: number;
  worksheet: CustomLessonWorksheet;
  isReadOnly?: boolean;
  isFinalized?: boolean;
  submitted?: boolean;
  submittedScore?: number | null;
  initialAnswers?: {
    dragAssignments?: Record<string, 'data' | 'info'>;
    fillBlankInputs?: Record<string, string>;
    matchingConnections?: Record<string, string>;
    shortAnswers?: Record<string, string>;
  };
  onSubmit?: (result: {
    totalScore: number;
    subScores: {
      game1: number;
      game2: number;
      game3: number;
      game4: number;
    };
    answers: {
      dragAssignments: Record<string, 'data' | 'info'>;
      fillBlankInputs: Record<string, string>;
      matchingConnections: Record<string, string>;
      shortAnswers: Record<string, string>;
    };
  }) => void;
  onShowToast: (msg: string) => void;
  onAwardXp?: (xp: number) => void;
}

export const UnifiedDiscoveryWorksheet: React.FC<UnifiedDiscoveryWorksheetProps> = ({
  lessonTitle,
  grade,
  period,
  worksheet,
  isReadOnly = false,
  isFinalized = false,
  submitted = false,
  submittedScore = null,
  initialAnswers,
  onSubmit,
  onShowToast,
  onAwardXp,
}) => {
  const stage2 = worksheet.stage2;

  // 1. Minigame 1 State: Phân loại thẻ vào Hộp A (data) hoặc Hộp B (info)
  const dragItems: CustomDragItem[] = useMemo(() => {
    if (stage2.dragItems && stage2.dragItems.length > 0) return stage2.dragItems;
    return [
      { id: 'd1', text: 'Nắm vững khái niệm cốt lõi của bài học', correctBox: 'data' },
      { id: 'd2', text: 'Ứng dụng kỹ năng số vào giải quyết vấn đề', correctBox: 'info' },
      { id: 'd3', text: 'Tuân thủ quy trình an toàn thao tác trên máy', correctBox: 'data' },
      { id: 'd4', text: 'Khai thác trợ lý AI có trách nhiệm và kiểm chứng', correctBox: 'info' },
    ];
  }, [stage2.dragItems]);

  const [dragAssignments, setDragAssignments] = useState<Record<string, 'data' | 'info'>>(
    () => initialAnswers?.dragAssignments || {}
  );

  // 2. Minigame 2 State: Điền từ khuyết (Word Bank)
  const fillQuestions: CustomFillBlankQuestion[] = useMemo(() => {
    if (stage2.fillBlankQuestions && stage2.fillBlankQuestions.length > 0) {
      return stage2.fillBlankQuestions;
    }
    return [
      {
        id: 'fb-1',
        label: 'a)',
        preText: 'Mục tiêu trọng tâm của bài học là',
        postText: 'giúp học sinh hình thành tư duy khoa học.',
        correctAnswer: stage2.dragDropWordBank?.[0] || 'Thông tin',
        accepted: [(stage2.dragDropWordBank?.[0] || 'Thông tin').toLowerCase()],
        points: 0.35,
      },
      {
        id: 'fb-2',
        label: 'b)',
        preText: 'Phương tiện lưu trữ và truyền tải dữ liệu số là',
        postText: 'trong hệ thống máy tính.',
        correctAnswer: stage2.dragDropWordBank?.[1] || 'Dữ liệu',
        accepted: [(stage2.dragDropWordBank?.[1] || 'Dữ liệu').toLowerCase()],
        points: 0.35,
      },
      {
        id: 'fb-3',
        label: 'c)',
        preText: 'Quy tắc đảm bảo an toàn trên môi trường số là',
        postText: 'để bảo vệ bản thân và dữ liệu.',
        correctAnswer: stage2.dragDropWordBank?.[2] || 'An toàn thông tin',
        accepted: [(stage2.dragDropWordBank?.[2] || 'An toàn thông tin').toLowerCase()],
        points: 0.3,
      },
    ];
  }, [stage2.fillBlankQuestions, stage2.dragDropWordBank]);

  const [fillBlankInputs, setFillBlankInputs] = useState<Record<string, string>>(
    () => initialAnswers?.fillBlankInputs || {}
  );
  const [selectedFillSlotId, setSelectedFillSlotId] = useState<string | null>(null);

  // 3. Minigame 3 State: Nối cột Khái niệm - Chức năng
  const matchPairs: CustomMatchingPair[] = useMemo(() => {
    if (stage2.matchingQuestions && stage2.matchingQuestions.length > 0) {
      return stage2.matchingQuestions;
    }
    return [
      {
        id: 'm1',
        num: 1,
        leftKey: '1',
        leftText: '1. Khái niệm cốt lõi SGK',
        rightKey: 'a',
        rightText: 'a) Nền tảng tri thức chuẩn mực của bài học',
        points: 0.35,
      },
      {
        id: 'm2',
        num: 2,
        leftKey: '2',
        leftText: '2. Kỹ năng thực hành số',
        rightKey: 'b',
        rightText: 'b) Thao tác chuẩn mực trên máy tính và phần mềm',
        points: 0.35,
      },
      {
        id: 'm3',
        num: 3,
        leftKey: '3',
        leftText: '3. Ứng dụng Trợ lý AI',
        rightKey: 'c',
        rightText: 'c) Hỗ trợ gợi ý ý tưởng và tự động hóa có kiểm chứng',
        points: 0.3,
      },
    ];
  }, [stage2.matchingQuestions]);

  const [matchingConnections, setMatchingConnections] = useState<Record<string, string>>(
    () => initialAnswers?.matchingConnections || {}
  );
  const [selectedLeftKey, setSelectedLeftKey] = useState<string | null>(null);

  // 4. Minigame 4 State: Trả lời ngắn / Thử thách thực tế
  const shortQuestions: CustomShortAnswerQuestion[] = useMemo(() => {
    if (stage2.shortAnswerQuestions && stage2.shortAnswerQuestions.length > 0) {
      return stage2.shortAnswerQuestions;
    }
    return [
      {
        id: 'sa-1',
        label: '• Thử thách 1 (Đầu vào):',
        question: 'Xác định dữ liệu hoặc thông tin quan trọng nhất trong tình huống bài học:',
        placeholder: 'Ví dụ: Dữ liệu văn bản, hình ảnh, bài toán cần giải quyết...',
        sampleAnswer: 'Dữ liệu đầu vào thu thập từ bài học thực tế.',
        points: 0.4,
      },
      {
        id: 'sa-2',
        label: '• Thử thách 2 (Xử lý & An toàn):',
        question: 'Quy trình thao tác phần mềm chuẩn mực và lưu ý an toàn số là gì?',
        placeholder: 'Ví dụ: Tuân thủ quy trình các bước, lưu tệp và bảo mật tài khoản...',
        sampleAnswer: 'Thực hiện tuần tự đúng hướng dẫn và giữ an toàn dữ liệu.',
        points: 0.3,
      },
      {
        id: 'sa-3',
        label: '• Thử thách 3 (Ứng dụng thực tế):',
        question: 'Em vận dụng kiến thức này vào đời sống hoặc học tập như thế nào?',
        placeholder: 'Ví dụ: Tạo sản phẩm số phục vụ học tập, chia sẻ thông tin văn minh...',
        sampleAnswer: 'Ứng dụng giải quyết bài tập và hỗ trợ học tập hàng ngày.',
        points: 0.3,
      },
    ];
  }, [stage2.shortAnswerQuestions]);

  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>(
    () => initialAnswers?.shortAnswers || {}
  );

  const [localSubmitted, setLocalSubmitted] = useState<boolean>(submitted);
  const [localScore, setLocalScore] = useState<number | null>(submittedScore);

  const isLocked = isReadOnly || isFinalized || localSubmitted;

  // Tính toán tiến độ hoàn thành các minigame (0 đến 4)
  const progressCount = useMemo(() => {
    let count = 0;
    // Game 1: Đã phân loại đủ các thẻ
    if (Object.keys(dragAssignments).length >= Math.max(1, dragItems.length)) count++;
    // Game 2: Đã điền đủ các ô khuyết
    const fillDone = fillQuestions.every((q) => Boolean(fillBlankInputs[q.id]?.trim()));
    if (fillDone && fillQuestions.length > 0) count++;
    // Game 3: Đã nối đủ các cặp
    if (Object.keys(matchingConnections).length >= Math.max(1, matchPairs.length)) count++;
    // Game 4: Đã trả lời ít nhất 2 câu hỏi ngắn
    const shortDone = shortQuestions.filter((q) => Boolean(shortAnswers[q.id]?.trim())).length;
    if (shortDone >= Math.min(2, shortQuestions.length)) count++;
    return count;
  }, [dragAssignments, dragItems.length, fillQuestions, fillBlankInputs, matchingConnections, matchPairs.length, shortQuestions, shortAnswers]);

  const progressPercent = Math.round((progressCount / 4) * 100);

  // Tính điểm tự động cho từng Minigame (Tổng thang 4.0 điểm)
  const computeScores = () => {
    // Game 1: 1.0 điểm
    let g1Points = 0;
    const g1Each = 1.0 / Math.max(1, dragItems.length);
    dragItems.forEach((item) => {
      if (dragAssignments[item.id] === item.correctBox) {
        g1Points += g1Each;
      }
    });

    // Game 2: 1.0 điểm
    let g2Points = 0;
    fillQuestions.forEach((q) => {
      const userVal = (fillBlankInputs[q.id] || '').trim().toLowerCase();
      const acceptedList = (q.accepted || [q.correctAnswer]).map((a) => a.trim().toLowerCase());
      if (acceptedList.some((acc) => userVal === acc || (userVal.length > 2 && acc.includes(userVal)))) {
        g2Points += q.points ?? (1.0 / fillQuestions.length);
      }
    });

    // Game 3: 1.0 điểm
    let g3Points = 0;
    const g3Each = 1.0 / Math.max(1, matchPairs.length);
    matchPairs.forEach((pair) => {
      const userRight = matchingConnections[pair.leftKey || pair.id];
      const correctRight = pair.rightKey || pair.rightText;
      if (userRight === correctRight || userRight === pair.rightKey) {
        g3Points += pair.points ?? g3Each;
      }
    });

    // Game 4: 1.0 điểm
    let g4Points = 0;
    shortQuestions.forEach((q) => {
      const val = (shortAnswers[q.id] || '').trim();
      if (val.length >= 8) {
        g4Points += q.points ?? (1.0 / shortQuestions.length);
      } else if (val.length >= 3) {
        g4Points += (q.points ?? (1.0 / shortQuestions.length)) * 0.6;
      }
    });

    const subScores = {
      game1: Math.min(1.0, Math.round(g1Points * 100) / 100),
      game2: Math.min(1.0, Math.round(g2Points * 100) / 100),
      game3: Math.min(1.0, Math.round(g3Points * 100) / 100),
      game4: Math.min(1.0, Math.round(g4Points * 100) / 100),
    };

    const totalScore = Math.min(4.0, Math.round((subScores.game1 + subScores.game2 + subScores.game3 + subScores.game4) * 100) / 100);
    return { totalScore, subScores };
  };

  // Xử lý nộp phiếu
  const handleSubmitWorksheet = () => {
    if (isLocked && !isFinalized) return;
    const { totalScore, subScores } = computeScores();
    setLocalScore(totalScore);
    setLocalSubmitted(true);

    triggerSynchronizedCelebration('xp');
    onAwardXp?.(30);
    onShowToast(`🎉 Đã nộp thành công Phiếu Khám Phá! Đạt: ${totalScore.toFixed(2)}/4.0 điểm (+30 XP)`);

    onSubmit?.({
      totalScore,
      subScores,
      answers: {
        dragAssignments,
        fillBlankInputs,
        matchingConnections,
        shortAnswers,
      },
    });
  };

  // Minigame 1: Chuyển thẻ vào Hộp A hoặc Hộp B
  const handleAssignItem = (itemId: string, box: 'data' | 'info') => {
    if (isLocked) return;
    setDragAssignments((prev) => {
      if (prev[itemId] === box) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: box };
    });
  };

  // Minigame 2: Click từ khoá từ Word Bank để điền
  const handleSelectWordFromBank = (word: string) => {
    if (isLocked) return;
    const targetSlotId = selectedFillSlotId || fillQuestions.find((q) => !fillBlankInputs[q.id]?.trim())?.id || fillQuestions[0]?.id;
    if (!targetSlotId) return;

    setFillBlankInputs((prev) => ({
      ...prev,
      [targetSlotId]: word,
    }));
    onShowToast(`🧩 Đã điền từ "${word}" vào ô đang chọn!`);
  };

  // Minigame 3: Click chọn và nối cặp
  const handleLeftItemClick = (key: string) => {
    if (isLocked) return;
    setSelectedLeftKey((prev) => (prev === key ? null : key));
  };

  const handleRightItemClick = (rightKey: string) => {
    if (isLocked) return;
    if (!selectedLeftKey) {
      onShowToast('💡 Hãy bấm chọn 1 thẻ ở Cột Trái trước, rồi bấm thẻ Cột Phải để tạo cặp nối!');
      return;
    }
    setMatchingConnections((prev) => ({
      ...prev,
      [selectedLeftKey]: rightKey,
    }));
    setSelectedLeftKey(null);
  };

  const handleRemoveConnection = (leftKey: string) => {
    if (isLocked) return;
    setMatchingConnections((prev) => {
      const copy = { ...prev };
      delete copy[leftKey];
      return copy;
    });
  };

  const bucketAName = stage2.bucketA || 'Hộp A: Kiến thức Cốt lõi & Phần cứng';
  const bucketBName = stage2.bucketB || 'Hộp B: Ứng dụng Năng lực số & Trí tuệ nhân tạo (AI)';
  const wordBankList = stage2.dragDropWordBank && stage2.dragDropWordBank.length > 0
    ? stage2.dragDropWordBank
    : ['Thông tin', 'Dữ liệu', 'Vật mang tin', 'An toàn thông tin', 'Xử lý thông tin'];

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* 1. TOP HEADER & GAMIFIED PROGRESS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🧩
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Phiếu Khám Phá Tri Thức: {lessonTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black border border-sky-200">
                THANG ĐIỂM: 4.0 ĐIỂM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khối {grade} • Tiết {period} • 4 Chặng Minigame Khám Phá Chuẩn GDPT 2018 (Làm trực tiếp trên 1 trang duy nhất)
            </p>
          </div>
        </div>

        {/* Real-time Score Badge & Submit Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {localSubmitted && (
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 flex items-center gap-2 font-black text-xs sm:text-sm shadow-xs">
              <span className="text-base">🏆</span>
              <span>ĐIỂM ĐẠT ĐƯỢC: {localScore !== null ? localScore.toFixed(2) : '4.00'}/4.0 ĐIỂM</span>
            </div>
          )}
          {isFinalized && (
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 font-black text-xs border border-rose-300 flex items-center gap-1">
              <span>🔒</span>
              <span>GV ĐÃ CHỐT HOẠT ĐỘNG 2</span>
            </span>
          )}
        </div>
      </div>

      {/* GAMIFIED PROGRESS TRACKER (0% -> 100%) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-indigo-600">sports_esports</span>
            <span>Tiến độ hoàn thành 4 Chặng Minigame:</span>
            <strong className="text-indigo-600 font-black">{progressCount}/4 chặng ({progressPercent}%)</strong>
          </span>
          <span className="text-slate-500 text-[11px]">
            {progressPercent === 100 ? '✨ Đã sẵn sàng bấm Nộp Phiếu!' : 'Tiếp tục hoàn thành các thử thách bên dưới'}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* =========================================================================================
          MINIGAME 1: 🎮 ĐẤU TRƯỜNG PHÂN LOẠI THẺ TRI THỨC (1.0 ĐIỂM)
         ========================================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-sky-50/50 border border-sky-200 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Minigame 1: Đấu trường Phân loại Thẻ Khái niệm (1.0 điểm)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sky-700">
            {Object.keys(dragAssignments).length}/{dragItems.length} thẻ đã xếp
          </span>
        </div>

        <p className="text-xs text-slate-600">
          👉 <strong>Cách chơi:</strong> Bấm chọn nút <strong className="text-sky-700">[Vào Hộp A]</strong> hoặc <strong className="text-amber-700">[Vào Hộp B]</strong> ở mỗi thẻ để phân loại nhận định chính xác:
        </p>

        {/* 2 Distribution Buckets Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Hộp A */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-dashed border-sky-400 flex flex-col gap-2 min-h-[140px] shadow-2xs">
            <div className="flex items-center justify-between text-xs font-black text-sky-900 pb-1.5 border-b border-sky-100">
              <span className="flex items-center gap-1.5">
                <span>📦</span>
                <span>{bucketAName}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px]">
                {dragItems.filter((it) => dragAssignments[it.id] === 'data').length} thẻ
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 justify-start">
              {dragItems
                .filter((it) => dragAssignments[it.id] === 'data')
                .map((it) => (
                  <div
                    key={it.id}
                    className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-950 flex items-center justify-between gap-2"
                  >
                    <span>{it.text}</span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleAssignItem(it.id, 'data')}
                        className="text-rose-500 hover:text-rose-700 text-xs font-black px-1"
                        title="Bỏ khỏi hộp"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              {dragItems.filter((it) => dragAssignments[it.id] === 'data').length === 0 && (
                <div className="flex items-center justify-center flex-1 text-slate-400 text-xs italic">
                  Chưa có thẻ nào trong Hộp A
                </div>
              )}
            </div>
          </div>

          {/* Hộp B */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-dashed border-amber-400 flex flex-col gap-2 min-h-[140px] shadow-2xs">
            <div className="flex items-center justify-between text-xs font-black text-amber-900 pb-1.5 border-b border-amber-100">
              <span className="flex items-center gap-1.5">
                <span>✨</span>
                <span>{bucketBName}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {dragItems.filter((it) => dragAssignments[it.id] === 'info').length} thẻ
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 justify-start">
              {dragItems
                .filter((it) => dragAssignments[it.id] === 'info')
                .map((it) => (
                  <div
                    key={it.id}
                    className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-950 flex items-center justify-between gap-2"
                  >
                    <span>{it.text}</span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleAssignItem(it.id, 'info')}
                        className="text-rose-500 hover:text-rose-700 text-xs font-black px-1"
                        title="Bỏ khỏi hộp"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              {dragItems.filter((it) => dragAssignments[it.id] === 'info').length === 0 && (
                <div className="flex items-center justify-center flex-1 text-slate-400 text-xs italic">
                  Chưa có thẻ nào trong Hộp B
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kho Thẻ Cần Phân Loại */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-bold text-slate-700">Các thẻ nhận định cần phân loại:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dragItems.map((item) => {
              const currentBox = dragAssignments[item.id];
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    currentBox === 'data'
                      ? 'bg-sky-50/70 border-sky-300'
                      : currentBox === 'info'
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-900 font-medium">{item.text}</span>
                  {!isLocked ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAssignItem(item.id, 'data')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                          currentBox === 'data'
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-sky-100 hover:bg-sky-200 text-sky-800'
                        }`}
                      >
                        Hộp A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignItem(item.id, 'info')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                          currentBox === 'info'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        }`}
                      >
                        Hộp B
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {currentBox === 'data' ? 'Đã xếp Hộp A' : currentBox === 'info' ? 'Đã xếp Hộp B' : 'Chưa xếp'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================================
          MINIGAME 2: 🧩 MẢNH GHÉP ĐIỀN TỪ KHUYẾT (1.0 ĐIỂM)
         ========================================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-200 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Minigame 2: Mảnh ghép Điền khuyết Tri thức (1.0 điểm)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-indigo-700">
            {fillQuestions.filter((q) => Boolean(fillBlankInputs[q.id]?.trim())).length}/{fillQuestions.length} câu hoàn thành
          </span>
        </div>

        {/* Word Bank Chips */}
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
            <span>💡</span>
            <span>Ngân hàng từ khóa (Bấm vào từ khóa để điền nhanh vào câu):</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {wordBankList.map((word, wIdx) => (
              <button
                key={wIdx}
                type="button"
                disabled={isLocked}
                onClick={() => handleSelectWordFromBank(word)}
                className="px-3 py-1 rounded-full bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-950 font-bold text-xs cursor-pointer shadow-2xs transition-all active:scale-95 disabled:opacity-60"
              >
                + {word}
              </button>
            ))}
          </div>
        </div>

        {/* Fill Sentences List */}
        <div className="flex flex-col gap-3">
          {fillQuestions.map((q) => {
            const currentVal = fillBlankInputs[q.id] || '';
            const isSelected = selectedFillSlotId === q.id;
            return (
              <div
                key={q.id}
                onClick={() => !isLocked && setSelectedFillSlotId(q.id)}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center gap-2.5 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-2 border-indigo-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-700 shrink-0">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] flex items-center justify-center font-black">
                    {q.label}
                  </span>
                  <span>{q.preText}</span>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    disabled={isLocked}
                    value={currentVal}
                    onFocus={() => setSelectedFillSlotId(q.id)}
                    onChange={(e) =>
                      setFillBlankInputs((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    placeholder="Điền từ khóa..."
                    className="flex-1 max-w-[260px] px-3 py-1.5 rounded-lg border border-indigo-300 bg-white text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  <span className="text-xs text-slate-600 font-medium">{q.postText}</span>
                </div>

                {isFinalized && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                    Đáp án: {q.correctAnswer}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================================
          MINIGAME 3: ⚡ NỐI CẶP KHÁI NIỆM & ỨNG DỤNG (1.0 ĐIỂM)
         ========================================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-purple-50/50 border border-purple-200 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Minigame 3: Nối Cặp Khái Niệm &amp; Ứng Dụng (1.0 điểm)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-purple-700">
            {Object.keys(matchingConnections).length}/{matchPairs.length} cặp đã nối
          </span>
        </div>

        <p className="text-xs text-slate-600">
          👉 <strong>Cách chơi:</strong> Bấm chọn 1 thẻ ở Cột Trái (sẽ phát sáng), sau đó bấm vào thẻ tương ứng ở Cột Phải để tạo cặp liên kết:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cột Trái */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-purple-900">Cột A (Khái niệm / Thành phần):</span>
            {matchPairs.map((pair) => {
              const lKey = pair.leftKey || pair.id;
              const isSelected = selectedLeftKey === lKey;
              const connectedRight = matchingConnections[lKey];
              return (
                <button
                  key={pair.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleLeftItemClick(lKey)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md scale-[1.01] ring-2 ring-purple-400'
                      : connectedRight
                      ? 'bg-purple-50 text-purple-900 border-purple-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span>{pair.leftText}</span>
                  {connectedRight && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black shrink-0">
                      Nối với: {connectedRight}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cột Phải */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-purple-900">Cột B (Chức năng / Ý nghĩa):</span>
            {matchPairs.map((pair) => {
              const rKey = pair.rightKey || pair.rightText;
              const isPairedWith = Object.entries(matchingConnections).find(([, r]) => r === rKey)?.[0];
              return (
                <button
                  key={pair.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleRightItemClick(rKey)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isPairedWith
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span>{pair.rightText}</span>
                  {isPairedWith && !isLocked && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveConnection(isPairedWith);
                      }}
                      className="px-2 py-0.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black cursor-pointer shrink-0"
                      title="Hủy nối"
                    >
                      Hủy nối ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================================
          MINIGAME 4: 💡 CHINH PHỤC THỬ THÁCH THỰC TẾ (1.0 ĐIỂM)
         ========================================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white to-amber-50/50 border border-amber-200 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Minigame 4: Chinh phục Thử thách Thực tế &amp; Câu hỏi Ngắn (1.0 điểm)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-amber-700">
            {shortQuestions.filter((q) => Boolean(shortAnswers[q.id]?.trim())).length}/{shortQuestions.length} câu hoàn thành
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {shortQuestions.map((q) => {
            const currentText = shortAnswers[q.id] || '';
            return (
              <div key={q.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-900">
                  <span className="text-amber-800">{q.label}</span>
                  <span className="text-[10px] text-slate-400">{(q.points ?? 0.33).toFixed(2)} điểm</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{q.question}</p>
                <textarea
                  disabled={isLocked}
                  rows={2}
                  value={currentText}
                  onChange={(e) =>
                    setShortAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                  placeholder={q.placeholder || 'Nhập câu trả lời ngắn của em...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
                {isFinalized && q.sampleAnswer && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200 font-medium">
                    💡 <strong>Gợi ý đáp án:</strong> {q.sampleAnswer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================================
          SUBMISSION BAR AT BOTTOM OF THE 1-PAGE WORKSHEET
         ========================================================================================= */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-black flex items-center gap-1.5">
            <span>🚀</span>
            <span>Chốt Hoàn Thành Toàn Bộ 4 Minigame Khám Phá</span>
          </span>
          <span className="text-xs text-slate-300 mt-0.5">
            {localSubmitted
              ? '✓ Em đã nộp phiếu thành công. Điểm số và bài làm đã được đồng bộ với Giáo viên!'
              : 'Sau khi hoàn thành 4 minigame trên 1 trang duy nhất, bấm nút bên phải để chấm điểm và nhận thưởng XP!'}
          </span>
        </div>

        <button
          type="button"
          disabled={isFinalized}
          onClick={handleSubmitWorksheet}
          className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-98 ${
            localSubmitted
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600 hover:from-amber-300 hover:to-indigo-500 text-white shadow-indigo-500/25'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-base">{localSubmitted ? '🔄' : '✨'}</span>
          <span>{localSubmitted ? 'Nộp Lại / Cập Nhật Điểm' : 'Nộp Phiếu Khám Phá & Nhận Điểm'}</span>
        </button>
      </div>
    </div>
  );
};
