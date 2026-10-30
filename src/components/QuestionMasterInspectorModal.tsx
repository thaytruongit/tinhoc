import React, { useState, useMemo } from 'react';
import type { LiveClassroomSession } from '../data/mockCurriculumData';

export interface QuestionInspectorItem {
  id: string;
  lessonKey: string;
  grade: number;
  period: number;
  lessonTitle: string;
  stageName: string;
  questionType: 'dragDrop' | 'fillBlank' | 'matching' | 'shortAnswer' | 'quiz' | 'stage4';
  mappedFieldLabel: string;
  questionText: string;
  optionsOrItems?: string[];
  correctAnswerText: string;
  points: number;
  isVerifiedInDb: boolean;
}

interface QuestionMasterInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (
    updater: (prev: LiveClassroomSession) => LiveClassroomSession
  ) => void;
  onShowToast: (msg: string) => void;
}

export const QuestionMasterInspectorModal: React.FC<QuestionMasterInspectorModalProps> = ({
  isOpen,
  onClose,
  liveSession,
  onUpdateLiveSession,
  onShowToast,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Edit form state
  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editPoints, setEditPoints] = useState(1.0);

  // Flatten all questions across all 29 periods x 4 grades from liveSession customWorksheetsByLesson
  const allMasterQuestions = useMemo<QuestionInspectorItem[]>(() => {
    const list: QuestionInspectorItem[] = [];
    const worksheetsMap = liveSession?.customWorksheetsByLesson || {};
    const verifiedMap = liveSession?.verifiedLessonsMap || {};

    ([6, 7, 8, 9] as const).forEach((g) => {
      for (let p = 1; p <= 29; p++) {
        const lessonKey = `k${g}-tiet-${p}`;
        const ws = worksheetsMap[lessonKey] as any;
        const isVerified = Boolean(verifiedMap[lessonKey]);
        if (!ws) continue;

        const lessonTitle = ws.worksheetTitle || `Khối ${g} • Tiết ${p}`;

        // 1. Stage 2: Drag Drop
        if (ws.stage2?.dragDropQuestions && Array.isArray(ws.stage2.dragDropQuestions)) {
          ws.stage2.dragDropQuestions.forEach((q: any, idx: number) => {
            list.push({
              id: `${lessonKey}_dd_${q.slotNum || idx}`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 2: Khám phá',
              questionType: 'dragDrop',
              mappedFieldLabel: `stage2.dragDropQuestions[${q.slotNum || idx + 1}]`,
              questionText: q.prefix ? `${q.prefix} [...] ${q.suffix || ''}` : `Vị trí (${q.slotNum || idx + 1})`,
              optionsOrItems: ws.stage2.dragDropWordBank || [],
              correctAnswerText: q.correctWord || '',
              points: q.points || 0.2,
              isVerifiedInDb: isVerified,
            });
          });
        }

        // 2. Stage 2: Fill Blank
        if (ws.stage2?.fillBlankQuestions && Array.isArray(ws.stage2.fillBlankQuestions)) {
          ws.stage2.fillBlankQuestions.forEach((q: any, idx: number) => {
            list.push({
              id: `${lessonKey}_fb_${q.id || idx}`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 2: Khám phá',
              questionType: 'fillBlank',
              mappedFieldLabel: `stage2.fillBlankQuestions[${q.label || idx}]`,
              questionText: `${q.preText || ''} [...] ${q.postText || ''}`,
              correctAnswerText: q.correctAnswer || (q.accepted ? q.accepted.join(', ') : ''),
              points: q.points || 0.3,
              isVerifiedInDb: isVerified,
            });
          });
        }

        // 3. Stage 2: Matching
        if (ws.stage2?.matchingQuestions && Array.isArray(ws.stage2.matchingQuestions)) {
          ws.stage2.matchingQuestions.forEach((q: any, idx: number) => {
            list.push({
              id: `${lessonKey}_m_${q.id || idx}`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 2: Khám phá',
              questionType: 'matching',
              mappedFieldLabel: `stage2.matchingQuestions[${q.num || idx + 1}]`,
              questionText: `Cột A: ${q.leftText || ''}`,
              correctAnswerText: `Cột B (${q.rightKey}): ${q.rightText || ''}`,
              points: q.points || 0.25,
              isVerifiedInDb: isVerified,
            });
          });
        }

        // 4. Stage 2: Short Answer
        if (ws.stage2?.shortAnswerQuestions && Array.isArray(ws.stage2.shortAnswerQuestions)) {
          ws.stage2.shortAnswerQuestions.forEach((q: any, idx: number) => {
            list.push({
              id: `${lessonKey}_sa_${q.id || idx}`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 2: Khám phá',
              questionType: 'shortAnswer',
              mappedFieldLabel: `stage2.shortAnswerQuestions[${q.id || idx}]`,
              questionText: q.question || ws.stage2.shortAnswerPrompt || 'Trả lời ngắn',
              correctAnswerText: q.sampleAnswer || '',
              points: q.points || 1.0,
              isVerifiedInDb: isVerified,
            });
          });
        }

        // 5. Stage 3: Quiz Arena 25s
        const quizList = ws.stage3QuizQuestions || ws.stage3Questions || [];
        if (Array.isArray(quizList)) {
          quizList.forEach((q: any, idx: number) => {
            const correctOpt = q.options?.find((o: any) => o.isCorrect);
            list.push({
              id: `${lessonKey}_quiz_${q.id || idx}`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 3: Luyện tập',
              questionType: 'quiz',
              mappedFieldLabel: `stage3QuizQuestions[${idx + 1}]`,
              questionText: q.question || `Câu ${idx + 1}`,
              optionsOrItems: q.options?.map((o: any) => `${o.letter}. ${o.text}`) || [],
              correctAnswerText: correctOpt ? `${correctOpt.letter}. ${correctOpt.text}` : 'Chưa có',
              points: q.points || 0.5,
              isVerifiedInDb: isVerified,
            });
          });
        }

        // 6. Stage 4: Vận dụng
        if (ws.stage4) {
          if (ws.stage4.deepAnalysis?.prompt) {
            list.push({
              id: `${lessonKey}_st4_deep`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 4: Vận dụng',
              questionType: 'stage4',
              mappedFieldLabel: 'stage4.deepAnalysis',
              questionText: ws.stage4.deepAnalysis.prompt,
              correctAnswerText: ws.stage4.deepAnalysis.guideAnswer || 'Đáp án gợi ý',
              points: ws.stage4.deepAnalysis.points || 1.0,
              isVerifiedInDb: isVerified,
            });
          }
          if (ws.stage4.practicalTask?.prompt) {
            list.push({
              id: `${lessonKey}_st4_prac`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 4: Vận dụng',
              questionType: 'stage4',
              mappedFieldLabel: 'stage4.practicalTask',
              questionText: ws.stage4.practicalTask.prompt,
              correctAnswerText: ws.stage4.practicalTask.guideAnswer || 'Đáp án gợi ý',
              points: ws.stage4.practicalTask.points || 1.0,
              isVerifiedInDb: isVerified,
            });
          }
          if (ws.stage4.extendedTask?.prompt) {
            list.push({
              id: `${lessonKey}_st4_ext`,
              lessonKey,
              grade: g,
              period: p,
              lessonTitle,
              stageName: 'Hoạt động 4: Vận dụng',
              questionType: 'stage4',
              mappedFieldLabel: 'stage4.extendedTask',
              questionText: ws.stage4.extendedTask.prompt,
              correctAnswerText: ws.stage4.extendedTask.guideAnswer || 'Đáp án gợi ý',
              points: ws.stage4.extendedTask.points || 1.0,
              isVerifiedInDb: isVerified,
            });
          }
        }
      }
    });

    return list;
  }, [liveSession]);

  // Filter questions by grade, period, type, search term
  const filteredQuestions = useMemo(() => {
    return allMasterQuestions.filter((item) => {
      if (selectedGrade !== 'ALL' && item.grade !== selectedGrade) return false;
      if (selectedPeriod !== 'ALL' && item.period !== selectedPeriod) return false;
      if (selectedType !== 'ALL' && item.questionType !== selectedType) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchText = (
          item.questionText +
          ' ' +
          item.correctAnswerText +
          ' ' +
          item.lessonTitle +
          ' ' +
          item.mappedFieldLabel
        ).toLowerCase();
        if (!matchText.includes(query)) return false;
      }
      return true;
    });
  }, [allMasterQuestions, selectedGrade, selectedPeriod, selectedType, searchTerm]);

  if (!isOpen) return null;

  const handleStartEditing = (item: QuestionInspectorItem) => {
    setEditingQuestionId(item.id);
    setEditPrompt(item.questionText);
    setEditAnswer(item.correctAnswerText);
    setEditPoints(item.points);
  };

  const handleSaveEdit = (item: QuestionInspectorItem) => {
    if (!onUpdateLiveSession) return;

    onUpdateLiveSession((prev) => {
      const customMap = { ...prev.customWorksheetsByLesson };
      const ws = customMap[item.lessonKey] ? JSON.parse(JSON.stringify(customMap[item.lessonKey])) : null;
      if (!ws) return prev;

      if (item.questionType === 'dragDrop' && ws.stage2?.dragDropQuestions) {
        ws.stage2.dragDropQuestions = ws.stage2.dragDropQuestions.map((q: any) =>
          item.id.includes(`_${q.slotNum}`)
            ? { ...q, prefix: editPrompt, correctWord: editAnswer, points: editPoints }
            : q
        );
      } else if (item.questionType === 'fillBlank' && ws.stage2?.fillBlankQuestions) {
        ws.stage2.fillBlankQuestions = ws.stage2.fillBlankQuestions.map((q: any) =>
          item.id.includes(`_${q.id}`)
            ? { ...q, preText: editPrompt, correctAnswer: editAnswer, points: editPoints }
            : q
        );
      } else if (item.questionType === 'matching' && ws.stage2?.matchingQuestions) {
        ws.stage2.matchingQuestions = ws.stage2.matchingQuestions.map((q: any) =>
          item.id.includes(`_${q.id}`)
            ? { ...q, leftText: editPrompt, rightText: editAnswer, points: editPoints }
            : q
        );
      } else if (item.questionType === 'shortAnswer' && ws.stage2?.shortAnswerQuestions) {
        ws.stage2.shortAnswerQuestions = ws.stage2.shortAnswerQuestions.map((q: any) =>
          item.id.includes(`_${q.id}`)
            ? { ...q, question: editPrompt, sampleAnswer: editAnswer, points: editPoints }
            : q
        );
      } else if (item.questionType === 'quiz') {
        const quizList = ws.stage3QuizQuestions || ws.stage3Questions || [];
        ws.stage3QuizQuestions = quizList.map((q: any) =>
          item.id.includes(`_${q.id}`)
            ? { ...q, question: editPrompt, points: editPoints }
            : q
        );
      } else if (item.questionType === 'stage4' && ws.stage4) {
        if (item.mappedFieldLabel.includes('deepAnalysis')) {
          ws.stage4.deepAnalysis = { ...ws.stage4.deepAnalysis, prompt: editPrompt, guideAnswer: editAnswer, points: editPoints };
        } else if (item.mappedFieldLabel.includes('practicalTask')) {
          ws.stage4.practicalTask = { ...ws.stage4.practicalTask, prompt: editPrompt, guideAnswer: editAnswer, points: editPoints };
        } else if (item.mappedFieldLabel.includes('extendedTask')) {
          ws.stage4.extendedTask = { ...ws.stage4.extendedTask, prompt: editPrompt, guideAnswer: editAnswer, points: editPoints };
        }
      }

      customMap[item.lessonKey] = ws;
      return {
        ...prev,
        customWorksheetsByLesson: customMap,
      };
    });

    setEditingQuestionId(null);
    onShowToast(`✓ Đã lưu thay đổi cho câu hỏi [${item.mappedFieldLabel}] lên CSDL!`);
  };

  const handleDeleteQuestion = (item: QuestionInspectorItem) => {
    if (!onUpdateLiveSession) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi "${item.questionText.slice(0, 40)}..."?`)) return;

    onUpdateLiveSession((prev) => {
      const customMap = { ...prev.customWorksheetsByLesson };
      const ws = customMap[item.lessonKey] ? JSON.parse(JSON.stringify(customMap[item.lessonKey])) : null;
      if (!ws) return prev;

      if (item.questionType === 'dragDrop' && ws.stage2?.dragDropQuestions) {
        ws.stage2.dragDropQuestions = ws.stage2.dragDropQuestions.filter((q: any) => !item.id.includes(`_${q.slotNum}`));
      } else if (item.questionType === 'fillBlank' && ws.stage2?.fillBlankQuestions) {
        ws.stage2.fillBlankQuestions = ws.stage2.fillBlankQuestions.filter((q: any) => !item.id.includes(`_${q.id}`));
      } else if (item.questionType === 'matching' && ws.stage2?.matchingQuestions) {
        ws.stage2.matchingQuestions = ws.stage2.matchingQuestions.filter((q: any) => !item.id.includes(`_${q.id}`));
      } else if (item.questionType === 'shortAnswer' && ws.stage2?.shortAnswerQuestions) {
        ws.stage2.shortAnswerQuestions = ws.stage2.shortAnswerQuestions.filter((q: any) => !item.id.includes(`_${q.id}`));
      } else if (item.questionType === 'quiz') {
        const quizList = ws.stage3QuizQuestions || ws.stage3Questions || [];
        ws.stage3QuizQuestions = quizList.filter((q: any) => !item.id.includes(`_${q.id}`));
      }

      customMap[item.lessonKey] = ws;
      return {
        ...prev,
        customWorksheetsByLesson: customMap,
      };
    });

    onShowToast(`🗑️ Đã xóa câu hỏi [${item.mappedFieldLabel}] khỏi tệp phiếu!`);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(filteredQuestions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Cau_Hoi_Inspector_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`📥 Đã xuất tệp JSON gồm ${filteredQuestions.length} câu hỏi!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-primary/30 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shadow-inner">
              <span className="material-symbols-outlined text-[26px]">checklist_rtl</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span>Master Question Inspector &amp; ListView</span>
                <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black border border-primary/20">
                  {allMasterQuestions.length} câu hỏi CSDL
                </span>
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Kiểm thử toàn bộ câu hỏi đã nạp, đối chiếu ánh xạ lên các trường phiếu học tập và chỉnh sửa/xóa trực tiếp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold hover:brightness-105 cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Xuất JSON ({filteredQuestions.length})</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm nội dung câu hỏi, từ khóa, bài học..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filter Grade */}
            <select
              value={selectedGrade}
              onChange={(e) =>
                setSelectedGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="px-3 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface border border-outline-variant/40"
            >
              <option value="ALL">Tất cả Khối (6, 7, 8, 9)</option>
              <option value={6}>Khối 6</option>
              <option value={7}>Khối 7</option>
              <option value={8}>Khối 8</option>
              <option value={9}>Khối 9</option>
            </select>

            {/* Filter Period */}
            <select
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="px-3 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface border border-outline-variant/40"
            >
              <option value="ALL">Tất cả 29 Tiết</option>
              {Array.from({ length: 29 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Tiết {p}
                </option>
              ))}
            </select>

            {/* Filter Question Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface border border-outline-variant/40"
            >
              <option value="ALL">Tất cả dạng bài</option>
              <option value="dragDrop">Kéo - Thả (dragDrop)</option>
              <option value="fillBlank">Điền khuyết (fillBlank)</option>
              <option value="matching">Nối cột (matching)</option>
              <option value="shortAnswer">Trả lời ngắn (shortAnswer)</option>
              <option value="quiz">Trắc nghiệm 25s (quiz)</option>
              <option value="stage4">Vận dụng (stage4)</option>
            </select>
          </div>

          <span className="text-xs font-bold text-on-surface-variant">
            Hiển thị: <strong className="text-primary">{filteredQuestions.length}</strong> / {allMasterQuestions.length} câu hỏi
          </span>
        </div>

        {/* Question ListView Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant text-on-surface-variant flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
              <p className="font-bold text-base">Không tìm thấy câu hỏi phù hợp bộ lọc</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Thử thay đổi từ khóa hoặc chọn khối / tiết khác
              </p>
            </div>
          ) : (
            filteredQuestions.map((item) => {
              const isEditing = editingQuestionId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 transition-all flex flex-col gap-3 shadow-2xs"
                >
                  {/* Top Bar: Metadata & Mapping Label */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                        Khối {item.grade} • Tiết {item.period}
                      </span>
                      <span className="text-xs font-semibold text-on-surface">
                        {item.lessonTitle}
                      </span>
                      <span className="text-xs font-bold text-tertiary">
                        • {item.stageName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mapping Field Badge */}
                      <span
                        className="px-2.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[11px] font-mono font-bold"
                        title="Tên trường dữ liệu được ánh xạ lên phiếu học tập"
                      >
                        📍 Trường phiếu: {item.mappedFieldLabel}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isVerifiedInDb
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.isVerifiedInDb ? '✓ Đã xác thực CSDL' : '⚠️ Chưa xác thực'}
                      </span>
                    </div>
                  </div>

                  {/* Main Content Render or Inline Edit Form */}
                  {isEditing ? (
                    <div className="p-3 bg-surface-container-lowest rounded-xl border border-primary flex flex-col gap-2.5 animate-in fade-in">
                      <span className="text-xs font-bold text-primary">Biên soạn trực tiếp câu hỏi:</span>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-on-surface-variant">
                          Nội dung câu hỏi / Mệnh đề:
                        </label>
                        <textarea
                          rows={2}
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-9 flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-tertiary">
                            Đáp án chuẩn / Từ khóa gợi ý:
                          </label>
                          <input
                            type="text"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            className="w-full p-2 rounded-lg border border-outline bg-surface-container-lowest text-xs font-bold text-tertiary"
                          />
                        </div>
                        <div className="sm:col-span-3 flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-on-surface-variant">
                            Thang điểm:
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={editPoints}
                            onChange={(e) => setEditPoints(Number(e.target.value) || 1.0)}
                            className="w-full p-2 rounded-lg border border-outline bg-surface-container-lowest text-xs font-bold text-primary text-center"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(null)}
                          className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item)}
                          className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs cursor-pointer"
                        >
                          💾 Lưu cập nhật vào CSDL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Question Text */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-relaxed">
                          {item.questionText}
                        </p>
                        <span className="px-2 py-0.5 rounded bg-primary-fixed/50 text-primary font-bold text-xs shrink-0">
                          {item.points.toFixed(1)}đ
                        </span>
                      </div>

                      {/* Options / Word bank if available */}
                      {item.optionsOrItems && item.optionsOrItems.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {item.optionsOrItems.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="px-2.5 py-0.5 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-xs font-medium text-on-surface-variant"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Correct Answer */}
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
                        <span className="font-semibold">
                          💡 Đáp án chuẩn: <strong>{item.correctAnswerText || 'Đang cập nhật'}</strong>
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditing(item)}
                            className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold hover:opacity-90 cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(item)}
                            className="p-1 rounded-full bg-rose-500/15 text-rose-700 hover:bg-rose-500/30 cursor-pointer"
                            title="Xóa câu hỏi này"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            Hệ thống tự động kiểm tra tính hợp lệ và đồng bộ với CSDL PostgreSQL / Supabase
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold shadow-md cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
