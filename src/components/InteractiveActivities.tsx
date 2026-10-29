import React, { useState, useEffect } from 'react';
import { DragDropSentenceLine } from '../data/mockCurriculumData';
import { evaluateAnswerBySuggestedPercentage } from '../utils/essayPercentageGrader';

// ==========================================
// 0. HOẠT ĐỘNG 1: KHỞI ĐỘNG (TÌNH HUỐNG ĐẶT VẤN ĐỀ — TỰ LUẬN NGẮN)
// ==========================================
export interface WarmupEssayProps {
  title?: string;
  scenario: string;
  question: string;
  sampleAnswer?: string;
  points?: number;
  studentAnswer?: string;
  onAnswerChange?: (val: string) => void;
  onSubmitAnswer?: () => void;
  onSubmit?: (val: string) => void;
  isSubmitted?: boolean;
  isReadOnly?: boolean;
}

export const WarmupEssayActivity: React.FC<WarmupEssayProps> = ({
  title,
  scenario,
  question,
  sampleAnswer,
  points = 1.0,
  studentAnswer,
  onAnswerChange,
  onSubmitAnswer,
  onSubmit,
  isSubmitted = false,
  isReadOnly = false,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [localAnswer, setLocalAnswer] = useState('');
  const [localSubmitted, setLocalSubmitted] = useState(false);

  const currentAnswer = studentAnswer !== undefined ? studentAnswer : localAnswer;
  const submittedState = isSubmitted || localSubmitted;

  const handleChange = (val: string) => {
    if (onAnswerChange) {
      onAnswerChange(val);
    } else {
      setLocalAnswer(val);
    }
  };

  const handleSubmit = () => {
    setLocalSubmitted(true);
    if (onSubmitAnswer) onSubmitAnswer();
    if (onSubmit) onSubmit(currentAnswer);
  };

  if (!scenario && !question) {
    return (
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center text-sm text-on-surface-variant italic">
        Chưa có dữ liệu câu hỏi Khởi động cho tiết học này.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-low border border-primary/20 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          {title || 'Khởi động'}
        </h3>
        <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary font-bold text-xs">
          {points.toFixed(1)} điểm
        </span>
      </div>

      {/* Tình huống đặt vấn đề */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border-l-4 border-primary flex flex-col gap-1.5">
        <span className="text-xs font-bold text-primary">Tình huống:</span>
        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line font-medium">
          {scenario}
        </p>
      </div>

      {/* Câu hỏi */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-on-surface">
          Câu hỏi: <strong className="text-primary">{question}</strong>
        </label>
        <textarea
          rows={3}
          value={currentAnswer}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isReadOnly}
          placeholder="Nhập câu trả lời..."
          className="w-full p-3.5 rounded-xl border border-outline bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition-all"
        />
        <div className="flex items-center justify-between text-xs text-on-surface-variant flex-wrap gap-2">
          <span>{currentAnswer?.trim() ? `${currentAnswer.trim().split(/\s+/).length} từ` : 'Chưa nhập câu trả lời'}</span>
          <div className="flex items-center gap-2">
            {sampleAnswer && (
              <button
                type="button"
                onClick={() => setShowGuide((v) => !v)}
                className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>{showGuide ? 'Ẩn đáp án gợi ý' : 'Đáp án gợi ý'}</span>
              </button>
            )}
            {(onSubmitAnswer || onSubmit) && !isReadOnly && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-bold hover:opacity-95 cursor-pointer shadow-xs"
              >
                {submittedState ? '✓ Đã ghi nhận câu trả lời' : 'Gửi câu trả lời Khởi động'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Định hướng trả lời sư phạm */}
      {showGuide && sampleAnswer && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-col gap-1">
          <span className="font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Định hướng trả lời &amp; Gợi ý sư phạm:
          </span>
          <p className="leading-relaxed whitespace-pre-line">{sampleAnswer}</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. KÉO - THẢ HOẠT ĐỘNG (DRAG & DROP ACTIVITY — 1.0 ĐIỂM)
// ==========================================
interface DragDropProps {
  title?: string;
  instruction?: string;
  wordBank: string[];
  slots: Record<number, string | null>;
  onSlotChange: (slotNum: number, value: string | null) => void;
  isReadOnly?: boolean;
  showAnswers?: boolean;
  paragraph?: string;
  customQuestions?: Array<{
    slotNum: number;
    promptFragment: string;
    correctWord: string;
    points: number;
    prefix?: string;
    suffix?: string;
  }>;
  sentenceLines?: DragDropSentenceLine[];
}

export const DragDropActivity: React.FC<DragDropProps> = ({
  title,
  instruction,
  wordBank,
  slots,
  onSlotChange,
  isReadOnly = false,
  showAnswers = false,
  paragraph,
  customQuestions,
  sentenceLines,
}) => {
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const correctAnswers: Record<number, string> =
    customQuestions !== undefined
      ? customQuestions.reduce((acc, q) => {
          acc[q.slotNum] = q.correctWord;
          return acc;
        }, {} as Record<number, string>)
      : {
          1: 'Dữ liệu',
          2: 'Thông tin',
          3: 'Hiểu biết',
          4: 'Vật mang tin',
        };

  const totalPoints =
    customQuestions !== undefined
      ? customQuestions.reduce((acc, q) => acc + (Number(q.points) || 0.2), 0)
      : 1.0;

  const handleDragStart = (e: React.DragEvent, word: string) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('text/plain', word);
    setDraggedWord(word);
  };

  const handleDrop = (e: React.DragEvent, slotNum: number) => {
    if (isReadOnly) return;
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain') || draggedWord || selectedWord;
    if (word) {
      onSlotChange(slotNum, word);
      setSelectedWord(null);
      setDraggedWord(null);
    }
  };

  const handleSlotClick = (slotNum: number) => {
    if (isReadOnly) return;
    if (selectedWord) {
      onSlotChange(slotNum, selectedWord);
      setSelectedWord(null);
    } else if (slots[slotNum]) {
      onSlotChange(slotNum, null);
    }
  };

  const renderSlot = (num: number) => {
    const val = slots[num];
    const isCorrect = val === correctAnswers[num];

    return (
      <span
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => handleDrop(e, num)}
        onClick={() => handleSlotClick(num)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 mx-1.5 rounded-lg border-2 border-dashed transition-all cursor-pointer font-bold select-none text-sm ${
          val
            ? showAnswers
              ? isCorrect
                ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                : 'bg-rose-100 text-rose-800 border-rose-500'
              : 'bg-primary-container text-on-primary-container border-primary shadow-xs'
            : selectedWord
            ? 'bg-primary-fixed/30 border-primary animate-pulse text-primary'
            : 'bg-surface-container border-outline text-on-surface-variant hover:border-primary'
        }`}
        title={val ? 'Bấm để xóa từ này' : 'Kéo từ gợi ý thả vào hoặc bấm chọn từ rồi bấm vào đây'}
      >
        <span>
          ({num}) {val || '...kéo từ thả vào đây...'}
        </span>
        {val && !isReadOnly && (
          <span className="material-symbols-outlined text-[15px] opacity-70 hover:opacity-100 text-error">
            cancel
          </span>
        )}
        {showAnswers && (
          <span className="text-[11px] font-normal block ml-1">
            {isCorrect ? '✓' : `(ĐA: ${correctAnswers[num]})`}
          </span>
        )}
      </span>
    );
  };

  const isDefaultPassage =
    (!sentenceLines || sentenceLines.length === 0) &&
    customQuestions === undefined;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-secondary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">pan_tool</span>
          {title || 'Kéo - Thả'}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
          {totalPoints.toFixed(1)} điểm
        </span>
      </div>

      {/* Word bank */}
      <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-on-surface-variant mr-1">HỘP TỪ GỢI Ý:</span>
        {wordBank.map((word) => {
          const isSelected = selectedWord === word;
          return (
            <button
              key={word}
              type="button"
              draggable={!isReadOnly}
              onDragStart={(e) => handleDragStart(e, word)}
              onClick={() => setSelectedWord(isSelected ? null : word)}
              disabled={isReadOnly}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all select-none cursor-grab active:cursor-grabbing border ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary ring-2 ring-primary-fixed shadow-md'
                  : 'bg-surface-container text-on-surface border-outline-variant/60 hover:bg-surface-container-high'
              }`}
            >
              [ {word} ]
            </button>
          );
        })}
      </div>

      {/* Reading passage, sentence lines, or dynamic period items */}
      {paragraph ? (
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 leading-loose text-base text-on-surface">
          {paragraph.split(/(\(\d+\)|\{\d+\})/g).map((part, i) => {
            const match = part.match(/\(?\{?(\d+)\}?\)?/);
            if (match && match[1]) {
              const slotIdx = Number(match[1]);
              return <React.Fragment key={i}>{renderSlot(slotIdx)}</React.Fragment>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      ) : sentenceLines && sentenceLines.length > 0 ? (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-sm text-on-surface">
          {sentenceLines.map((line, idx) => (
            <div
              key={idx}
              className="leading-loose flex flex-wrap items-center py-1.5 border-b border-outline-variant/15 last:border-none"
            >
              {line.textBefore && <span className="font-medium mr-1">{line.textBefore}</span>}
              {line.slotNum !== undefined && renderSlot(line.slotNum)}
              {line.textMid && <span className="font-medium mx-1">{line.textMid}</span>}
              {line.slotNum2 !== undefined && renderSlot(line.slotNum2)}
              {line.textAfter && <span className="font-medium ml-1">{line.textAfter}</span>}
            </div>
          ))}
        </div>
      ) : isDefaultPassage ? (
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 leading-loose text-base text-on-surface">
          &ldquo;Khi quan sát bản tin dự báo thời tiết trên truyền hình, những thông số nhiệt độ 32°C và biểu tượng hình mặt trời là{' '}
          {renderSlot(1)}. Qua đó, em biết được &lsquo;Hôm nay trời nắng nóng&rsquo;, đây chính là{' '}
          {renderSlot(2)} mang lại {renderSlot(3)} giúp em quyết định mang theo mũ nón khi ra ngoài. Chiếc tivi hay màn hình điện thoại chiếu bản tin đó đóng vai trò là{' '}
          {renderSlot(4)}.&rdquo;
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
          {customQuestions?.map((q) => (
            <div
              key={q.slotNum}
              className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-outline-variant/15 last:border-none text-sm text-on-surface"
            >
              <span>• {q.promptFragment}:</span>
              {renderSlot(q.slotNum)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. ĐIỀN KHUYẾT HOẠT ĐỘNG (FILL BLANK - INPUT TEXT — 1.0 ĐIỂM)
// ==========================================
interface FillBlankProps {
  title?: string;
  instruction?: string;
  answers: { a: string; b: string; c: string };
  onChange: (key: 'a' | 'b' | 'c', val: string) => void;
  isReadOnly?: boolean;
  showAnswers?: boolean;
  customItems?: Array<{
    id: string;
    label: string;
    preText: string;
    postText: string;
    correctAnswer: string;
    accepted?: string[];
    points: number;
  }>;
}

export const FillBlankActivity: React.FC<FillBlankProps> = ({
  title,
  instruction,
  answers,
  onChange,
  isReadOnly = false,
  showAnswers = false,
  customItems,
}) => {
  const defaultItems = [
    {
      id: 'fb-a',
      label: 'a)',
      preText: '',
      postText:
        ' là những gì đem lại hiểu biết cho con người về thế giới xung quanh và về chính bản thân mình.',
      correctAnswer: 'Thông tin',
      accepted: ['thông tin', 'thong tin'],
      points: 0.4,
    },
    {
      id: 'fb-b',
      label: 'b)',
      preText: 'Thông tin được ghi lên vật mang tin trở thành ',
      postText: ', được thể hiện dưới dạng con số, văn bản, hình ảnh, âm thanh.',
      correctAnswer: 'Dữ liệu',
      accepted: ['dữ liệu', 'du lieu'],
      points: 0.3,
    },
    {
      id: 'fb-c',
      label: 'c)',
      preText: '',
      postText:
        ' là phương tiện được dùng để lưu trữ và truyền tải thông tin (ví dụ: giấy viết, thẻ nhớ, đĩa CD, bảng hiệu).',
      correctAnswer: 'Vật mang tin',
      accepted: ['vật mang tin', 'vat mang tin'],
      points: 0.3,
    },
  ];

  const itemsToRender =
    customItems !== undefined ? customItems.slice(0, 3) : defaultItems;
  const totalPoints = itemsToRender.reduce((acc, it) => acc + (Number(it.points) || 0.3), 0);

  const keys: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          {title || 'Điền khuyết'}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold text-xs">
          {totalPoints.toFixed(1)} điểm
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {itemsToRender.map((item, idx) => {
          const key = keys[idx] || 'a';
          const userVal = answers[key] || '';
          const acceptedList =
            item.accepted && item.accepted.length > 0
              ? item.accepted
              : [item.correctAnswer.toLowerCase()];
          const isOk =
            userVal.trim().length > 0 &&
            acceptedList.some((k) => userVal.trim().toLowerCase().includes(k.toLowerCase()));

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col md:flex-row md:items-center gap-2"
            >
              <span className="font-bold text-sm text-primary shrink-0">{item.label}</span>
              <div className="flex-1 flex flex-wrap items-center gap-2 text-sm text-on-surface">
                {item.preText && <span>{item.preText}</span>}
                <input
                  type="text"
                  value={userVal}
                  onChange={(e) => onChange(key, e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Nhập từ cần điền..."
                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold outline-hidden transition-all min-w-[160px] ${
                    showAnswers
                      ? isOk
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-rose-500 bg-rose-50 text-rose-800'
                      : 'border-outline focus:border-primary bg-surface-container'
                  }`}
                />
                {item.postText && <span>{item.postText}</span>}
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-md shrink-0">
                {item.points}đ
              </span>
              {showAnswers && !isOk && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
                  Đáp án: {item.correctAnswer}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. NỐI CỘT HOẠT ĐỘNG (INTERACTIVE COLUMN MATCHING — 1.0 ĐIỂM)
// ==========================================
interface MatchingProps {
  title?: string;
  instruction?: string;
  connections: Record<string, string>; // e.g. { '1': 'b', '2': 'c', '3': 'a' }
  onConnect: (colAId: string, colBId: string) => void;
  onDisconnect: (colAId: string) => void;
  isReadOnly?: boolean;
  showAnswers?: boolean;
  customQuestions?: Array<{
    id: string;
    num: number;
    leftText: string;
    rightKey: string;
    rightText: string;
    points: number;
  }>;
  customPairs?: Array<{
    id: string;
    num: number;
    leftText: string;
    rightKey: string;
    rightText: string;
    points: number;
  }>;
}

export const MatchingActivity: React.FC<MatchingProps> = ({
  title,
  instruction,
  connections,
  onConnect,
  onDisconnect,
  isReadOnly = false,
  showAnswers = false,
  customQuestions,
  customPairs,
}) => {
  const [selectedA, setSelectedA] = useState<string | null>(null);

  const items = customQuestions ?? customPairs;
  const hasCustom = items !== undefined;

  const columnA = hasCustom && items
    ? items.map((q, idx) => ({
        id: String(q.num || idx + 1),
        title: q.leftText.startsWith(`${idx + 1}`) ? q.leftText : `${idx + 1}) ${q.leftText}`,
      }))
    : [
        { id: '1', title: '1. Đèn tín hiệu giao thông chuyển sang màu xanh.' },
        { id: '2', title: '2. Lời hiểu biết: "Được phép đi qua đường an toàn".' },
        { id: '3', title: '3. Hộp đèn giao thông bằng kim loại ở ngã tư.' },
      ];

  const columnB = hasCustom && items
    ? items.map((q) => ({
        id: q.rightKey,
        title: q.rightText.startsWith(q.rightKey) ? q.rightText : `${q.rightKey}) ${q.rightText}`,
      }))
    : [
        { id: 'a', title: 'a) Vật mang tin (phương tiện chứa đựng dữ liệu)' },
        { id: 'b', title: 'b) Dữ liệu (tín hiệu hình ảnh / màu sắc quan sát được)' },
        { id: 'c', title: 'c) Thông tin (hiểu biết thu nhận được để hành động)' },
      ];

  const correctPairs: Record<string, string> = hasCustom && items
    ? items.reduce((acc, q, idx) => {
        acc[String(q.num || idx + 1)] = q.rightKey;
        return acc;
      }, {} as Record<string, string>)
    : {
        '1': 'b',
        '2': 'c',
        '3': 'a',
      };

  const totalPoints = hasCustom && items
    ? items.reduce((acc, q) => acc + (Number(q.points) || 0.25), 0)
    : 1.0;

  const handleSelectA = (id: string) => {
    if (isReadOnly) return;
    if (selectedA === id) {
      setSelectedA(null);
    } else {
      setSelectedA(id);
    }
  };

  const handleSelectB = (id: string) => {
    if (isReadOnly) return;
    if (selectedA) {
      onConnect(selectedA, id);
      setSelectedA(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-tertiary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">alt_route</span>
          {title || 'Nối cột'}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs">
          {totalPoints.toFixed(1)} điểm
        </span>
      </div>

      {/* Grid of Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Column A */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Cột A
          </span>
          {columnA.map((item) => {
            const isSelected = selectedA === item.id;
            const connectedB = connections[item.id];
            const isCorrect = connectedB === correctPairs[item.id];

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary-fixed/20'
                    : 'border-outline-variant/40 bg-surface-container-lowest'
                }`}
              >
                <span className="text-sm font-medium text-on-surface leading-snug">{item.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {connectedB && (
                    <span
                      onClick={() => !isReadOnly && onDisconnect(item.id)}
                      className={`px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer flex items-center gap-1 ${
                        showAnswers
                          ? isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                          : 'bg-primary-container text-on-primary-container'
                      }`}
                      title="Bấm để hủy đường nối này"
                    >
                      Nối: {connectedB.toUpperCase()}
                      {!isReadOnly && <span className="text-[12px]">✕</span>}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectA(item.id)}
                    disabled={isReadOnly}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary ring-4 ring-primary-fixed animate-bounce'
                        : connectedB
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface border border-outline hover:bg-primary-container'
                    }`}
                    title="Bấm điểm nối A"
                  >
                    A{item.id}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Column B */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Cột B
          </span>
          {columnB.map((item) => {
            const connectedAKey = Object.keys(connections).find((k) => connections[k] === item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleSelectB(item.id)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  selectedA
                    ? 'border-dashed border-primary hover:bg-primary-fixed/20 bg-surface-container-lowest'
                    : 'border-outline-variant/40 bg-surface-container-lowest'
                }`}
              >
                <button
                  type="button"
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                    connectedAKey
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-high text-on-surface border border-outline'
                  }`}
                  title="Điểm nối B"
                >
                  B{item.id}
                </button>
                <span className="text-sm font-medium text-on-surface leading-snug flex-1">{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Summary Panel */}
      <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-on-surface-variant">Kết quả ghép nối hiện tại:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {columnA.map((item) => {
            const aKey = item.id;
            const bVal = connections[aKey];
            return (
              <span
                key={aKey}
                className={`px-3 py-1 rounded-md font-bold ${
                  bVal ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {aKey} ──► {bVal ? bVal.toUpperCase() : '?'}
              </span>
            );
          })}
        </div>
        {showAnswers && (
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Đáp án chuẩn:{' '}
            {columnA.map((item) => `${item.id} ──► ${correctPairs[item.id]?.toUpperCase()}`).join(' | ')}
          </span>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. CÂU HỎI TRẢ LỜI NGẮN (SHORT ANSWER / ESSAY — 1.0 ĐIỂM)
// ==========================================
interface ShortAnswerProps {
  answers: Record<string, string>;
  onChange: (key: string, val: string) => void;
  isReadOnly?: boolean;
  showAnswers?: boolean;
  customPrompt?: string;
  customQuestions?: Array<{
    id: string;
    label: string;
    question: string;
    placeholder: string;
    sampleAnswer: string;
    points: number;
  }>;
}

export const ShortAnswerActivity: React.FC<ShortAnswerProps> = ({
  answers,
  onChange,
  isReadOnly = false,
  showAnswers = false,
  customPrompt,
  customQuestions,
}) => {
  const [showSuggestedGuide, setShowSuggestedGuide] = useState(false);

  const defaultQuestions = [
    {
      id: 'sa-verbatim-default',
      label: 'Câu 4 [Dạng Trả lời ngắn - Nguyên bản PDF gốc]:',
      question:
        customPrompt ||
        'Tình huống: Trong giờ học Địa lý, thầy giáo chiếu bản đồ lượng mưa trung bình của Việt Nam lên màn hình. Hãy chỉ ra rõ: Dữ liệu là gì? Thông tin em thu nhận được là gì? Vật mang tin trong tình huống này là gì?',
      placeholder:
        'Nhập câu trả lời của em (Hệ thống tự động đối chiếu từ khóa với Đáp án gợi ý để tính % điểm đạt được)...',
      sampleAnswer:
        'Dữ liệu là các con số đo lượng mưa (mm) và ký hiệu màu sắc trên bản đồ. Thông tin là hiểu biết về sự phân bố lượng mưa giữa các vùng miền ở Việt Nam. Vật mang tin là màn hình máy chiếu hoặc tờ bản đồ giấy.',
      points: 1.0,
    },
  ];

  // Nếu có customQuestions nhưng muốn giữ nguyên 1 câu hỏi gốc từ PDF thì gộp đáp án gợi ý chuẩn xác
  const rawQuestions =
    customQuestions !== undefined ? customQuestions : defaultQuestions;

  const combinedSuggestedAnswer = rawQuestions
    .map((q) => q.sampleAnswer)
    .filter(Boolean)
    .join(' ');

  const verbatimQuestionText =
    customPrompt !== undefined
      ? customPrompt.replace(/^:\s*/, '').trim() || rawQuestions[0]?.question || ''
      : rawQuestions[0]?.question || defaultQuestions[0].question;

  const primaryQuestionId = rawQuestions[0]?.id || 'sa-verbatim-default';
  const totalPoints = rawQuestions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  const studentAnswerText =
    answers[primaryQuestionId] ??
    answers['data'] ??
    Object.values(answers).filter(Boolean).join(' ') ??
    '';

  const gradeResult = evaluateAnswerBySuggestedPercentage(
    studentAnswerText,
    combinedSuggestedAnswer,
    totalPoints
  );

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-rose-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          Trả lời ngắn
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            Khớp: {gradeResult.matchPercentage}%
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
            {gradeResult.earnedPoints.toFixed(2)} / {totalPoints.toFixed(1)} điểm
          </span>
        </div>
      </div>

      {/* Câu hỏi */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border-l-4 border-rose-500 flex flex-col gap-1.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-rose-600">Câu hỏi:</span>
          <button
            type="button"
            onClick={() => setShowSuggestedGuide((v) => !v)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span>{showSuggestedGuide ? 'Ẩn đáp án gợi ý' : 'Đáp án gợi ý'}</span>
          </button>
        </div>
        <p className="text-sm text-on-surface font-semibold leading-relaxed whitespace-pre-line">
          {verbatimQuestionText}
        </p>
      </div>

      {/* Ô nhập câu trả lời của học sinh */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2.5">
        <label className="text-xs font-bold text-primary">
          Câu trả lời của em:
        </label>

        <textarea
          rows={3}
          value={studentAnswerText}
          onChange={(e) => {
            const val = e.target.value;
            onChange(primaryQuestionId, val);
            onChange('data', val);
          }}
          disabled={isReadOnly}
          placeholder="Nhập câu trả lời của em..."
          className="w-full p-3.5 rounded-xl border border-outline focus:border-primary bg-surface-container text-sm font-normal text-on-surface outline-hidden leading-relaxed"
        />

        {/* Thanh tiến trình % khớp Đáp án gợi ý */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-on-surface-variant">
              Tỷ lệ khớp Đáp án gợi ý:{' '}
              <strong className="text-emerald-700">{gradeResult.matchPercentage}%</strong>
            </span>
            <span className="font-bold text-primary">
              Điểm quy đổi: {gradeResult.earnedPoints.toFixed(2)} / {totalPoints.toFixed(1)}đ
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-500 transition-all duration-300"
              style={{ width: `${gradeResult.matchPercentage}%` }}
            />
          </div>
          {gradeResult.matchedKeywords.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-emerald-700">Từ khóa đạt điểm:</span>
              {gradeResult.matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {(showAnswers || showSuggestedGuide) && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-col gap-1.5">
          <span className="font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Đáp án gợi ý chuẩn (Dùng để đối chiếu tính % điểm tự động):
          </span>
          <p className="leading-relaxed">{combinedSuggestedAnswer}</p>
          {gradeResult.missingKeywords.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-amber-800">
                Từ khóa gợi ý bổ sung để đạt 100% điểm:
              </span>
              {gradeResult.missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold"
                >
                  + {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. ĐẤU TRƯỜNG TRẮC NGHIỆM 25S (HOẠT ĐỘNG 3 - DUY NHẤT 1 LOẠI)
// ==========================================
interface QuizArena25sProps {
  questions: Array<{
    id: string;
    level: string;
    question: string;
    points?: number;
    options: Array<{ letter: 'A' | 'B' | 'C' | 'D'; text: string; isCorrect: boolean }>;
    explanation: string;
  }>;
  onFinish?: (score: number) => void;
  onShowToast: (msg: string) => void;
  learningMode?: 'IN_CLASS_LIVE' | 'HOME_SELF_PACED';
  lessonContext?: string;
}

export const QuizArena25sActivity: React.FC<QuizArena25sProps> = ({
  questions,
  onFinish,
  onShowToast,
  learningMode = 'HOME_SELF_PACED',
  lessonContext = 'Tin học GDPT 2018',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [answersHistory, setAnswersHistory] = useState<
    Record<number, { selected: 'A' | 'B' | 'C' | 'D'; isCorrect: boolean }>
  >({});
  const [timeLeft, setTimeLeft] = useState(25);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [streak, setStreak] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiScaffoldingReply, setAiScaffoldingReply] = useState<string>('');
  const [isLoadingScaffolding, setIsLoadingScaffolding] = useState<boolean>(false);

  // Reset quiz when question bank changes (e.g., when switching period/grade)
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOpt(null);
    setAnswersHistory({});
    setTimeLeft(25);
    setIsConfirmed(false);
    setStreak(1);
    setTotalScore(0);
    setEarnedPoints(0);
    setIsCompleted(false);
  }, [questions[0]?.id, questions.length]);

  const currentQ = questions[currentIndex] || questions[0];
  const maxStage3Points =
    Math.round(questions.reduce((acc, q) => acc + (q.points ?? 0.5), 0) * 100) / 100 || 0;

  // 25s Countdown timer
  useEffect(() => {
    if (isConfirmed || isCompleted || !currentQ) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired! Auto confirm with whatever is selected (or incorrect)
          handleConfirmAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isConfirmed, isCompleted, selectedOpt, currentQ]);

  const handleConfirmAnswer = () => {
    if (isConfirmed || isCompleted || !currentQ) return;

    const chosen = currentQ.options.find((o) => o.letter === selectedOpt);
    const correct = Boolean(chosen?.isCorrect);
    const qPts = currentQ.points ?? 0.5;

    setIsConfirmed(true);
    setAnswersHistory((prev) => ({
      ...prev,
      [currentIndex]: {
        selected: selectedOpt || ('A' as const),
        isCorrect: correct,
      },
    }));

    if (correct) {
      setStreak((s) => s + 1);
      setTotalScore((sc) => sc + 1);
      setEarnedPoints((pts) => Math.round((pts + qPts) * 100) / 100);
      onShowToast(`🎉 Chính xác! (+${qPts} điểm • Chuỗi x${streak + 1})`);
    } else {
      setStreak(1);
      onShowToast(`Chưa chính xác! Xem giải thích bên dưới để ôn bài nhé.`);
    }
  };

  const handleNextQuestion = () => {
    setAiScaffoldingReply('');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOpt(null);
      setIsConfirmed(false);
      setTimeLeft(25);
    } else {
      setIsCompleted(true);
      if (onFinish) onFinish(earnedPoints);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOpt(null);
    setAnswersHistory({});
    setTimeLeft(25);
    setIsConfirmed(false);
    setStreak(1);
    setTotalScore(0);
    setEarnedPoints(0);
    setIsCompleted(false);
    setAiScaffoldingReply('');
  };

  const handleAskAiWhyWrong = async () => {
    if (!currentQ || isLoadingScaffolding) return;
    const chosenObj = currentQ.options.find((o) => o.letter === selectedOpt);
    const correctObj = currentQ.options.find((o) => o.isCorrect);
    setIsLoadingScaffolding(true);
    try {
      const promptText = `Em vừa làm câu trắc nghiệm: "${currentQ.question}". Em đã chọn phương án ${
        selectedOpt || 'Chưa chọn'
      } ("${chosenObj?.text || 'Hết giờ'}") nhưng đáp án đúng là ${correctObj?.letter} ("${
        correctObj?.text
      }"). Hãy đóng vai Gia sư Cú Vàng hướng dẫn từng bước (Scaffolding): giải thích tại sao phương án em chọn lại sai, và gợi mở cách suy luận đúng theo YCCĐ GDPT 2018 & Khung Năng lực AI QĐ 3439.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: promptText }],
          lessonContext,
          learningMode,
          pedagogicalAction: 'explain_wrong_quiz',
          role: 'student',
        }),
      });
      const data = await res.json();
      setAiScaffoldingReply(
        data.reply ||
          `🦉 **Gia sư Cú Vàng phân tích lỗi sai (Scaffolding):**\n- Phương án **${selectedOpt} (${chosenObj?.text})** chưa chính xác vì chưa phản ánh đúng bản chất khái niệm trong bài.\n- **Gợi mở tư duy:** ${currentQ.explanation}\n- **Đáp án chuẩn:** **${correctObj?.letter}. ${correctObj?.text}**.`
      );
    } catch {
      setAiScaffoldingReply(
        `🦉 **Gia sư Cú Vàng phân tích lỗi sai (Scaffolding):**\n- Phương án em chọn (**${selectedOpt}**) chưa chính xác.\n- **Gợi mở tư duy theo YCCĐ 2018:** ${currentQ.explanation}\n- **Kết luận:** Phương án đúng là **${correctObj?.letter}. ${correctObj?.text}**.`
      );
    } finally {
      setIsLoadingScaffolding(false);
    }
  };

  if (!currentQ || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-center gap-2">
        <span className="material-symbols-outlined text-[42px] text-outline">quiz</span>
        <h3 className="font-headline-sm text-base font-bold text-on-surface">
          Chưa có câu hỏi trắc nghiệm 25s cho tiết học này
        </h3>
      </div>
    );
  }

  if (isCompleted) {
    const percentage = Math.round((totalScore / questions.length) * 100);

    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-center gap-4">
        <span className="material-symbols-outlined text-[64px] text-primary">emoji_events</span>
        <h3 className="font-headline-md text-2xl font-black text-on-surface">
          HOÀN THÀNH ĐẤU TRƯỜNG TRẮC NGHIỆM 25S!
        </h3>
        <p className="text-on-surface-variant max-w-md">
          Em đã hoàn thành {questions.length} câu hỏi của Hoạt động 3 (Thang điểm chuẩn: {maxStage3Points.toFixed(1)} / 10 điểm tiết học).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 my-2">
          <div className="p-4 rounded-xl bg-primary-fixed/40 flex flex-col">
            <span className="text-2xl font-black text-primary">
              {earnedPoints.toFixed(1)} / {maxStage3Points.toFixed(1)}đ
            </span>
            <span className="text-xs uppercase font-bold text-on-surface-variant">
              Điểm Hoạt động 3
            </span>
          </div>
          <div className="p-4 rounded-xl bg-tertiary-fixed/40 flex flex-col">
            <span className="text-2xl font-black text-tertiary">
              {totalScore}/{questions.length}
            </span>
            <span className="text-xs uppercase font-bold text-on-surface-variant">Số câu đúng</span>
          </div>
          <div className="p-4 rounded-xl bg-secondary-fixed/40 flex flex-col">
            <span className="text-2xl font-black text-secondary">{percentage}%</span>
            <span className="text-xs uppercase font-bold text-on-surface-variant">Tỷ lệ chính xác</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          Làm lại Đấu trường 25s
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-md">
      {/* Header with 25s Timer and Streak */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            Hoạt động 3: Đấu trường trắc nghiệm (25 giây/câu • Thang điểm 3.0đ)
          </span>
          <h3 className="text-base font-bold text-on-surface mt-0.5">
            Câu {currentIndex + 1} / {questions.length} ({currentQ.level} •{' '}
            {(currentQ.points ?? 0.5).toFixed(1)} điểm)
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 25s Timer ring */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-sm ${
              timeLeft <= 5
                ? 'bg-rose-500 text-white animate-pulse'
                : timeLeft <= 10
                ? 'bg-amber-400 text-amber-950'
                : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">alarm</span>
            <span>{timeLeft}s</span>
          </div>

          <span className="px-3 py-1.5 rounded-full bg-secondary-fixed text-secondary font-bold text-sm flex items-center gap-1">
            <span>🔥</span>
            <span>Chuỗi x{streak}</span>
          </span>

          <span className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-bold text-sm">
            Điểm HĐ3: {earnedPoints.toFixed(1)} / {maxStage3Points.toFixed(1)}đ
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="p-4 rounded-xl bg-surface-container-low text-base font-semibold text-on-surface leading-relaxed">
        {currentQ.question}
      </div>

      {/* Options A, B, C, D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOpt === opt.letter;
          let btnStyle = 'bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container';

          if (isConfirmed) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900 font-bold';
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = 'bg-rose-100 border-2 border-rose-500 text-rose-900 font-bold';
            } else {
              btnStyle = 'bg-surface-container opacity-50';
            }
          } else if (isSelected) {
            btnStyle = 'bg-primary-fixed border-2 border-primary text-on-primary-fixed-variant font-bold shadow-xs';
          }

          return (
            <button
              key={opt.letter}
              type="button"
              disabled={isConfirmed}
              onClick={() => setSelectedOpt(opt.letter)}
              className={`p-4 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer ${btnStyle}`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isConfirmed && opt.isCorrect
                    ? 'bg-emerald-600 text-white'
                    : isConfirmed && isSelected && !opt.isCorrect
                    ? 'bg-rose-600 text-white'
                    : isSelected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {opt.letter}
              </span>
              <span className="text-sm font-medium leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation & AI Cú Vàng Scaffolding Tutor when confirmed */}
      {isConfirmed && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Giải thích sư phạm chuẩn SGK GDPT 2018:
            </span>

            <button
              type="button"
              onClick={handleAskAiWhyWrong}
              disabled={isLoadingScaffolding}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-xs hover:brightness-105 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isLoadingScaffolding ? 'sync' : 'psychology'}
              </span>
              <span>
                {isLoadingScaffolding
                  ? 'Cú Vàng đang phân tích...'
                  : answersHistory[currentIndex]?.isCorrect
                  ? '🦉 Cú Vàng AI mở rộng kiến thức thực tiễn'
                  : '🦉 Gia sư Cú Vàng giải thích tại sao sai (Scaffolding)'}
              </span>
            </button>
          </div>
          <p className="text-on-surface-variant font-medium leading-relaxed">{currentQ.explanation}</p>

          {aiScaffoldingReply && (
            <div className="mt-1 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-on-surface flex flex-col gap-1.5 animate-in fade-in duration-200">
              <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                <span>Gia Sư AI Cú Vàng Hướng Dẫn Tư Duy (Scaffolding • YCCĐ 2018 &amp; QĐ 3439):</span>
              </span>
              <p className="whitespace-pre-line leading-relaxed text-xs">{aiScaffoldingReply}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-on-surface-variant">
          {!isConfirmed ? 'Chọn phương án và bấm Xác nhận' : 'Xem giải thích rồi bấm Tiếp tục'}
        </span>

        {!isConfirmed ? (
          <button
            type="button"
            disabled={!selectedOpt}
            onClick={handleConfirmAnswer}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md disabled:opacity-40 cursor-pointer"
          >
            Xác nhận đáp án
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md cursor-pointer flex items-center gap-1"
          >
            <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả tổng kết'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. BẢNG VẬN DỤNG THỰC TẾ (HOẠT ĐỘNG 4: 3.0 ĐIỂM)
// ==========================================
interface PracticalRow {
  id: string;
  carrier: string;
  data: string;
  infoAction: string;
}

interface PracticalTableProps {
  rows: PracticalRow[];
  onAddRow: (row: PracticalRow) => void;
  onDeleteRow: (id: string) => void;
  isReadOnly?: boolean;
}

export const PracticalTableActivity: React.FC<PracticalTableProps> = ({
  rows,
  onAddRow,
  onDeleteRow,
  isReadOnly = false,
}) => {
  const [carrier, setCarrier] = useState('');
  const [data, setData] = useState('');
  const [infoAction, setInfoAction] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier.trim() || !data.trim()) return;
    onAddRow({
      id: `row_${Date.now()}`,
      carrier: carrier.trim(),
      data: data.trim(),
      infoAction: infoAction.trim(),
    });
    setCarrier('');
    setData('');
    setInfoAction('');
  };

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Hoạt động 4: Vận dụng thực tế — Khảo sát thế giới xung quanh (3.0 điểm)
          </span>
          <h3 className="text-base font-bold text-on-surface mt-0.5">
            Bảng thống kê quan sát Vật mang tin, Dữ liệu và Thông tin trong đời sống
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide((g) => !g)}
          className="px-3.5 py-1.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span>{showGuide ? 'Ẩn hướng dẫn chấm (3.0đ)' : 'Xem Rubric (3.0đ) & Đáp án mẫu'}</span>
        </button>
      </div>

      {showGuide && (
        <div className="p-4 rounded-xl bg-secondary-fixed/20 border border-secondary/30 flex flex-col gap-2 text-xs">
          <span className="font-bold text-secondary uppercase">
            Phần D. Hướng dẫn đánh giá &amp; Đáp án tham khảo (Hoạt động 4: 3.0 điểm / 10 điểm tiết học)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-on-surface-variant">
            <div className="p-2.5 rounded-lg bg-surface-container-lowest">
              <span className="font-bold text-on-surface block mb-1">Tiêu chí chấm điểm (Tổng 3.0 điểm):</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Xác định đúng vật mang tin: 1.0 điểm</li>
                <li>Trích xuất dữ liệu chính xác dạng số, chữ, ảnh: 1.0 điểm</li>
                <li>Nêu được thông tin và hành động phù hợp: 1.0 điểm</li>
              </ul>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-lowest">
              <span className="font-bold text-on-surface block mb-1">Ví dụ chuẩn mẫu:</span>
              <p>
                - Vật mang tin: Bảng giá tại căng tin trường.<br />
                - Dữ liệu: Các con số: Bánh mì 15.000đ, Sữa 10.000đ.<br />
                - Thông tin &amp; Hành động: Biết giá tiền để chuẩn bị đủ tiền mua đồ ăn sáng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Observation Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/30">
              <th className="p-3">#</th>
              <th className="p-3">Vật mang tin quan sát</th>
              <th className="p-3">Dữ liệu chứa trên vật</th>
              <th className="p-3">Thông tin rút ra &amp; Hành động</th>
              {!isReadOnly && <th className="p-3 text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-surface-container-low/50">
                <td className="p-3 font-bold text-on-surface-variant">{idx + 1}</td>
                <td className="p-3 font-semibold text-on-surface">{row.carrier}</td>
                <td className="p-3 text-on-surface">{row.data}</td>
                <td className="p-3 text-on-surface">{row.infoAction}</td>
                {!isReadOnly && (
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteRow(row.id)}
                      className="p-1 rounded-md text-error hover:bg-error-container/40 cursor-pointer"
                      title="Xóa dòng này"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form to add a new observation row */}
      {!isReadOnly && (
        <form onSubmit={handleAdd} className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            + Thêm quan sát thực tế của em:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="Vật mang tin (ví dụ: Biển báo giao thông)..."
              className="px-3.5 py-2 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface"
              required
            />
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Dữ liệu (ví dụ: Vòng tròn đỏ viền trắng, số 50)..."
              className="px-3.5 py-2 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface"
              required
            />
            <input
              type="text"
              value={infoAction}
              onChange={(e) => setInfoAction(e.target.value)}
              placeholder="Thông tin & hành động (ví dụ: Đi không quá 50km/h)..."
              className="px-3.5 py-2 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-sm cursor-pointer"
            >
              Thêm dòng quan sát vào bảng
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ==========================================
// 6.2 HOẠT ĐỘNG 4: VẬN DỤNG (3.0 ĐIỂM) — GỒM ĐỦ 3 DẠNG YÊU CẦU:
// 1. CÂU HỎI TỰ LUẬN PHÂN TÍCH SÂU (1.0Đ)
// 2. BÀI TẬP THỰC HÀNH TỰ LUẬN (1.0Đ)
// 3. BÀI TẬP VẬN DỤNG SGK MỞ RỘNG (1.0Đ)
// ==========================================
export interface ApplicationThreeTasksProps {
  title?: string;
  deepAnalysis: {
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  };
  practicalTask: {
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  };
  extendedTask: {
    title: string;
    prompt: string;
    guideAnswer?: string;
    points?: number;
  };
  answers: {
    deepAnalysis: string;
    practicalTask: string;
    extendedTask: string;
  };
  onAnswerChange: (field: 'deepAnalysis' | 'practicalTask' | 'extendedTask', val: string) => void;
  onSubmit?: () => void;
  isSubmitted?: boolean;
  isReadOnly?: boolean;
  showAnswers?: boolean;
}

export const ApplicationThreeTasksActivity: React.FC<ApplicationThreeTasksProps> = ({
  title,
  deepAnalysis,
  practicalTask,
  extendedTask,
  answers,
  onAnswerChange,
  onSubmit,
  isSubmitted = false,
  isReadOnly = false,
  showAnswers = false,
}) => {
  const [showAllGuides, setShowAllGuides] = useState(false);
  const [showScaffoldingHint, setShowScaffoldingHint] = useState(false);

  const maxPoints1 = deepAnalysis?.points || 1.0;
  const maxPoints2 = practicalTask?.points || 1.0;
  const maxPoints3 = extendedTask?.points || 1.0;
  const totalPoints = maxPoints1 + maxPoints2 + maxPoints3;

  const grade1 = evaluateAnswerBySuggestedPercentage(
    answers?.deepAnalysis || '',
    deepAnalysis?.guideAnswer || '',
    maxPoints1
  );
  const grade2 = evaluateAnswerBySuggestedPercentage(
    answers?.practicalTask || '',
    practicalTask?.guideAnswer || '',
    maxPoints2
  );
  const grade3 = evaluateAnswerBySuggestedPercentage(
    answers?.extendedTask || '',
    extendedTask?.guideAnswer || '',
    maxPoints3
  );

  const totalEarnedPoints =
    Math.round((grade1.earnedPoints + grade2.earnedPoints + grade3.earnedPoints) * 100) / 100;
  const avgMatchPercentage = Math.round(
    (grade1.matchPercentage + grade2.matchPercentage + grade3.matchPercentage) / 3
  );

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div>
          <h3 className="text-base font-bold text-on-surface">
            {title || 'Vận dụng'}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowScaffoldingHint((v) => !v)}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>
              {showScaffoldingHint
                ? 'Ẩn Gia sư Cú Vàng gợi mở'
                : '🦉 Gia sư Cú Vàng gợi ý giải quyết vấn đề (Scaffolding)'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowAllGuides((v) => !v)}
            className="px-3.5 py-1.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>{showAllGuides ? 'Ẩn đáp án gợi ý' : 'Đáp án gợi ý'}</span>
          </button>
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            Khớp: {avgMatchPercentage}%
          </span>
          <span className="px-3 py-1.5 rounded-full bg-primary-fixed text-primary font-bold text-xs">
            {totalEarnedPoints.toFixed(2)} / {totalPoints.toFixed(1)} điểm
          </span>
        </div>
      </div>

      {/* Pedagogical Scaffolding Guide Box (YCCĐ GDPT 2018 & QĐ 3439) */}
      {showScaffoldingHint && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-on-surface flex flex-col gap-2 animate-in fade-in duration-200">
          <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span>
              🦉 Phương Pháp Giải Quyết Vấn Đề Thực Tiễn Từng Bước (Scaffolding — Chuẩn YCCĐ GDPT 2018, CV 3456 &amp; Khung AI QĐ 3439):
            </span>
          </span>
          <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
            <li>
              <strong>Bước 1 — Phân tích bản chất (Bài 1 - 1.0đ):</strong> Xác định đối tượng dữ liệu đầu vào (Input), quá trình xử lý và thông tin có ích thu được (Output).
            </li>
            <li>
              <strong>Bước 2 — Quy trình kỹ năng số (Bài 2 - 1.0đ - CV 3456):</strong> Liệt kê rõ các thao tác thực hành theo thứ tự tuần tự, cách đặt tên tệp/thư mục khoa học và lưu trữ an toàn.
            </li>
            <li>
              <strong>Bước 3 — Ứng dụng &amp; Đạo đức AI (Bài 3 - 1.0đ - QĐ 3439):</strong> Khi sử dụng công cụ AI hỗ trợ giải quyết tình huống thực tế, luôn kiểm chứng nguồn thông tin, tôn trọng bản quyền và bảo mật dữ liệu cá nhân.
            </li>
          </ul>
        </div>
      )}

      {/* Task 1: Tự luận phân tích */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="font-bold text-sm text-on-surface">
              {deepAnalysis?.title || 'Tự luận phân tích'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              Khớp: {grade1.matchPercentage}%
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-xs">
              {grade1.earnedPoints.toFixed(2)} / {maxPoints1.toFixed(1)} điểm
            </span>
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-container-lowest border-l-4 border-primary text-sm font-medium text-on-surface leading-relaxed whitespace-pre-line">
          {deepAnalysis?.prompt || 'Phân tích bản chất và mối quan hệ thực tế của các khái niệm trong bài học.'}
        </div>
        <textarea
          rows={3}
          value={answers?.deepAnalysis || ''}
          onChange={(e) => onAnswerChange('deepAnalysis', e.target.value)}
          disabled={isReadOnly}
          placeholder="Nhập câu trả lời của em..."
          className="w-full p-3 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface outline-hidden focus:border-primary"
        />
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${grade1.matchPercentage}%` }}
          />
        </div>
        {(showAllGuides || showAnswers) && deepAnalysis?.guideAnswer && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Đáp án gợi ý:</strong> {deepAnalysis.guideAnswer}
          </div>
        )}
      </div>

      {/* Task 2: Bài tập thực hành */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center">
              2
            </span>
            <span className="font-bold text-sm text-on-surface">
              {practicalTask?.title || 'Bài tập thực hành'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              Khớp: {grade2.matchPercentage}%
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
              {grade2.earnedPoints.toFixed(2)} / {maxPoints2.toFixed(1)} điểm
            </span>
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-container-lowest border-l-4 border-secondary text-sm font-medium text-on-surface leading-relaxed whitespace-pre-line">
          {practicalTask?.prompt || 'Thực hiện thao tác kỹ thuật và ghi nhận các bước thực hiện.'}
        </div>
        <textarea
          rows={3}
          value={answers?.practicalTask || ''}
          onChange={(e) => onAnswerChange('practicalTask', e.target.value)}
          disabled={isReadOnly}
          placeholder="Nhập câu trả lời của em..."
          className="w-full p-3 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface outline-hidden focus:border-primary"
        />
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-300"
            style={{ width: `${grade2.matchPercentage}%` }}
          />
        </div>
        {(showAllGuides || showAnswers) && practicalTask?.guideAnswer && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Đáp án gợi ý:</strong> {practicalTask.guideAnswer}
          </div>
        )}
      </div>

      {/* Task 3: Vận dụng mở rộng */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-tertiary text-on-tertiary font-bold text-xs flex items-center justify-center">
              3
            </span>
            <span className="font-bold text-sm text-on-surface">
              {extendedTask?.title || 'Vận dụng mở rộng'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              Khớp: {grade3.matchPercentage}%
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-xs">
              {grade3.earnedPoints.toFixed(2)} / {maxPoints3.toFixed(1)} điểm
            </span>
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-container-lowest border-l-4 border-tertiary text-sm font-medium text-on-surface leading-relaxed whitespace-pre-line">
          {extendedTask?.prompt || 'Liên hệ kiến thức bài học với ứng dụng thực tế trong đời sống.'}
        </div>
        <textarea
          rows={3}
          value={answers?.extendedTask || ''}
          onChange={(e) => onAnswerChange('extendedTask', e.target.value)}
          disabled={isReadOnly}
          placeholder="Nhập câu trả lời của em..."
          className="w-full p-3 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface outline-hidden focus:border-primary"
        />
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-tertiary transition-all duration-300"
            style={{ width: `${grade3.matchPercentage}%` }}
          />
        </div>
        {(showAllGuides || showAnswers) && extendedTask?.guideAnswer && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Đáp án gợi ý:</strong> {extendedTask.guideAnswer}
          </div>
        )}
      </div>

      {/* Footer Submit */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-outline-variant/20">
        <span className="text-xs text-on-surface-variant font-medium">
          {isSubmitted
            ? `✓ Đã nộp bài! Đạt ${totalEarnedPoints.toFixed(2)} / ${totalPoints.toFixed(1)} điểm`
            : `Điểm dự kiến: ${totalEarnedPoints.toFixed(2)} / ${totalPoints.toFixed(1)} điểm`}
        </span>
        {onSubmit && !isReadOnly && (
          <button
            type="button"
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md cursor-pointer hover:opacity-95"
          >
            {isSubmitted ? '✓ Cập nhật bài nộp' : 'Nộp bài Vận dụng'}
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 7. HOẠT ĐỘNG 3 (TIẾT THỰC HÀNH): CÂY THƯ MỤC GOOGLE DRIVE THEO KHỐI LỚP & NỘP SẢN PHẨM
// ==========================================
export interface GoogleDrivePracticalProps {
  grade: 6 | 7 | 8 | 9;
  classId: string;
  period: number;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  studentUsername: string;
  folderName: string;
  drivePath: string;
  existingSubmissions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    period: number;
    fileName: string;
    fileType: string;
    fileSize: string;
    studentNote: string;
    submittedAt: string;
    status: 'Chờ chấm' | 'Đã chấm';
    score: number | null;
    maxPoints: number;
    teacherFeedback: string;
  }>;
  onSubmitProduct: (payload: {
    fileName: string;
    fileType: string;
    fileSize: string;
    studentNote: string;
  }) => void;
}

export const GoogleDrivePracticalActivity: React.FC<GoogleDrivePracticalProps> = ({
  grade,
  classId,
  period,
  lessonTitle,
  studentId,
  studentName,
  folderName,
  drivePath,
  existingSubmissions,
  onSubmitProduct,
}) => {
  const [selectedFileName, setSelectedFileName] = useState(
    `SanPham_Tiet${period}_${studentName.replace(/\s+/g, '')}_${classId}.docx`
  );
  const [selectedFileType, setSelectedFileType] = useState('Tài liệu Word (.docx)');
  const [studentNote, setStudentNote] = useState(
    `Em nộp bài thực hành ${lessonTitle} vào thư mục Google Drive của lớp ${classId}.`
  );

  const mySubmission = existingSubmissions.find(
    (s) => s.studentId === studentId && s.classId === classId && s.period === period
  );
  const classSubmissions = existingSubmissions.filter(
    (s) => s.classId === classId && s.period === period
  );

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      setSelectedFileType('Ảnh chụp màn hình (.png/.jpg)');
    } else if (ext === 'xlsx' || ext === 'xls') {
      setSelectedFileType('Bảng tính Excel (.xlsx)');
    } else if (ext === 'pptx' || ext === 'ppt') {
      setSelectedFileType('Bài trình chiếu (.pptx)');
    } else if (ext === 'sb3') {
      setSelectedFileType('Dự án Scratch (.sb3)');
    } else {
      setSelectedFileType(`Tệp thực hành (.${ext || 'docx'})`);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/25">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">add_to_drive</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Hoạt động 3 (Tiết Thực hành) • Cây thư mục Google Drive theo Khối / Lớp
            </span>
            <h3 className="text-base font-extrabold text-on-surface">
              Nộp sản phẩm thực hành lên Google Drive Lớp {classId} (Khối {grade})
            </h3>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">folder_shared</span>
          Thư mục: {folderName}
        </span>
      </div>

      {/* Visual Google Drive Folder Tree */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">account_tree</span>
            Đường dẫn Cây thư mục Google Drive của Lớp {classId}:
          </span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            {drivePath}
          </span>
        </div>

        <div className="pl-2 pt-1 flex flex-col gap-1.5 text-xs font-medium text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">cloud</span>
            <span className="font-bold text-on-surface">Google Drive Trường THCS (CloudPlay Drive)</span>
          </div>
          <div className="flex items-center gap-2 pl-5">
            <span className="text-outline">├──</span>
            <span className="material-symbols-outlined text-amber-500 text-[18px]">folder</span>
            <span className="font-bold text-on-surface">Khối {grade} (Chương trình Tin học {grade})</span>
          </div>
          <div className="flex items-center gap-2 pl-11">
            <span className="text-outline">├──</span>
            <span className="material-symbols-outlined text-amber-500 text-[18px]">folder_open</span>
            <span className="font-bold text-primary">Lớp {classId}</span>
          </div>
          <div className="flex items-center gap-2 pl-18">
            <span className="text-outline">└──</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">drive_folder_upload</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold">
              {folderName} ({classSubmissions.length} sản phẩm đã nộp)
            </span>
          </div>
        </div>
      </div>

      {/* Student's Own Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Tải sản phẩm thực hành của {studentName} lên thư mục lớp {classId}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-on-surface-variant">
                Tên tệp sản phẩm trên Google Drive:
              </label>
              <input
                type="text"
                value={selectedFileName}
                onChange={(e) => setSelectedFileName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline bg-surface-container-lowest text-xs font-semibold text-on-surface"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-on-surface-variant">
                Loại sản phẩm số:
              </label>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline bg-surface-container-lowest text-xs font-semibold text-on-surface"
              >
                <option value="Tài liệu Word (.docx)">Tài liệu Word (.docx)</option>
                <option value="Bảng tính Excel (.xlsx)">Bảng tính Excel (.xlsx)</option>
                <option value="Bài trình chiếu (.pptx)">Bài trình chiếu (.pptx)</option>
                <option value="Ảnh chụp màn hình (.png/.jpg)">Ảnh chụp màn hình (.png/.jpg)</option>
                <option value="Dự án Scratch (.sb3)">Dự án Scratch (.sb3)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-on-surface-variant">
              Chọn tệp từ máy tính (tùy chọn):
            </label>
            <input
              type="file"
              onChange={handleFilePick}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary-fixed file:text-on-primary-fixed cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-on-surface-variant">
              Mô tả / Ghi chú sản phẩm gửi giáo viên:
            </label>
            <textarea
              rows={2}
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline bg-surface-container-lowest text-xs text-on-surface"
              placeholder="Ghi chú kết quả thực hành của em..."
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-on-surface-variant">
              Tệp sẽ được lưu vào <strong>{folderName}</strong> để Giáo viên chấm điểm theo lớp.
            </span>
            <button
              type="button"
              onClick={() =>
                onSubmitProduct({
                  fileName: selectedFileName.trim() || `BaiThucHanh_Tiet${period}_${classId}.docx`,
                  fileType: selectedFileType,
                  fileSize: '1.2 MB',
                  studentNote: studentNote.trim(),
                })
              }
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>{mySubmission ? 'Cập nhật sản phẩm trên Drive' : 'Nộp sản phẩm lên Google Drive'}</span>
            </button>
          </div>
        </div>

        {/* Submission Status & Teacher Grade */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">fact_check</span>
              Trạng thái bài nộp &amp; Điểm thực hành của em
            </span>

            {mySubmission ? (
              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-emerald-300 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    {mySubmission.fileName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      mySubmission.status === 'Đã chấm'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {mySubmission.status}
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  Định dạng: {mySubmission.fileType} • Lúc: {mySubmission.submittedAt}
                </span>
                {mySubmission.score !== null ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                    <span className="text-sm font-black text-emerald-700">
                      Điểm giáo viên chấm: {mySubmission.score} / {mySubmission.maxPoints} điểm
                    </span>
                    <span className="text-xs text-emerald-900">
                      Nhận xét của GV: &ldquo;{mySubmission.teacherFeedback || 'Hoàn thành tốt yêu cầu thực hành!'}&rdquo;
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-700 font-semibold">
                    Đang chờ Giáo viên chấm điểm trong mục &ldquo;Chấm sản phẩm thực hành theo lớp&rdquo;.
                  </span>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant text-center text-xs text-on-surface-variant">
                Em chưa nộp sản phẩm thực hành tiết {period} vào thư mục Google Drive của lớp {classId}. Hãy bấm nút nộp bài bên trái!
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-outline-variant/25 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-on-surface-variant">
              Danh sách tệp trong thư mục lớp {classId} ({classSubmissions.length} tệp):
            </span>
            <div className="max-h-28 overflow-y-auto flex flex-col gap-1">
              {classSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-md bg-surface-container-lowest"
                >
                  <span className="truncate font-medium text-on-surface">
                    {sub.studentName}: {sub.fileName}
                  </span>
                  <span className="font-bold text-emerald-700 shrink-0 ml-2">
                    {sub.score !== null ? `${sub.score}đ` : 'Đã nộp'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

