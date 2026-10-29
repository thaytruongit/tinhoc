import React, { useState } from 'react';
import {
  getPeriodsForGrade,
  getDefaultWorksheetForLesson,
  type CustomLessonWorksheet,
  type LiveClassroomSession,
} from '../data/mockCurriculumData';

interface WorksheetBatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: 6 | 7 | 8 | 9;
  liveSession?: LiveClassroomSession | null;
  onShowToast: (msg: string) => void;
}

export const WorksheetBatchPrintModal: React.FC<WorksheetBatchPrintModalProps> = ({
  isOpen,
  onClose,
  defaultGrade = 7,
  liveSession,
  onShowToast,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<6 | 7 | 8 | 9>(defaultGrade);
  const [printScope, setPrintScope] = useState<'ALL_29' | 'GK1' | 'CK1' | 'GK2' | 'CK2' | 'SINGLE'>('ALL_29');
  const [singlePeriod, setSinglePeriod] = useState<number>(1);
  const [printMode, setPrintMode] = useState<'STUDENT' | 'TEACHER_KEY'>('STUDENT');
  const [includeRubrics, setIncludeRubrics] = useState<boolean>(true);
  const [schoolName, setSchoolName] = useState<string>('TRƯỜNG THCS NGUYỄN DU');

  if (!isOpen) return null;

  const allPeriods = getPeriodsForGrade(selectedGrade);

  // Filter periods based on user selection
  const targetPeriods = allPeriods.filter((p) => {
    if (printScope === 'SINGLE') return p.period === singlePeriod;
    if (printScope === 'ALL_29') return true;
    return p.examMilestone === printScope;
  });

  // Retrieve worksheet for each period (from liveSession DB or default authentic OCR blueprint)
  const getWorksheetForPeriod = (pNum: number): CustomLessonWorksheet => {
    const key = `k${selectedGrade}-tiet-${pNum}`;
    return (
      liveSession?.customWorksheetsByLesson?.[key] ||
      getDefaultWorksheetForLesson(selectedGrade, pNum)
    );
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      
      {/* ================= SCREEN-ONLY CONTROL TOOLBAR (HIDDEN WHEN PRINTING) ================= */}
      <div className="print:hidden bg-surface-container px-6 py-4 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[24px]">print</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-xs uppercase">
                Chế độ xem &amp; In ấn Toàn bộ Phiếu học tập
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
                Khối {selectedGrade} • {targetPeriods.length} Phiếu
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs">
                Chuẩn GDPT 2018
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
              Print View Toàn Bộ 29 Phiếu Dữ Liệu Học Tập (Khối {selectedGrade})
            </h2>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Grade selection */}
          <div className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-xl border border-outline-variant/30">
            <span className="text-xs font-bold text-on-surface-variant mr-1">Khối:</span>
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Khối {g}
              </button>
            ))}
          </div>

          {/* Scope selection */}
          <select
            value={printScope}
            onChange={(e) => setPrintScope(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/30 cursor-pointer"
          >
            <option value="ALL_29">Trọn bộ tất cả 29 Tiết</option>
            <option value="GK1">Giữa kỳ 1 (Tiết 1 – 7)</option>
            <option value="CK1">Cuối kỳ 1 (Tiết 8 – 15)</option>
            <option value="GK2">Giữa kỳ 2 (Tiết 16 – 22)</option>
            <option value="CK2">Cuối kỳ 2 (Tiết 23 – 27)</option>
            <option value="SINGLE">Chỉ in 1 tiết cụ thể</option>
          </select>

          {printScope === 'SINGLE' && (
            <select
              value={singlePeriod}
              onChange={(e) => setSinglePeriod(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/30 cursor-pointer"
            >
              {allPeriods.map((p) => (
                <option key={p.period} value={p.period}>
                  Tiết {p.period}: {p.lessonTitle}
                </option>
              ))}
            </select>
          )}

          {/* Mode: Student Blank vs Teacher Key */}
          <div className="flex items-center p-0.5 rounded-xl bg-surface-container-high">
            <button
              type="button"
              onClick={() => setPrintMode('STUDENT')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printMode === 'STUDENT'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant'
              }`}
            >
              Phiếu Học sinh
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('TEACHER_KEY')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printMode === 'TEACHER_KEY'
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant'
              }`}
            >
              Đáp án Giáo viên
            </button>
          </div>

          {/* Trigger Print Button */}
          <button
            type="button"
            onClick={handleTriggerPrint}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>In / Xuất PDF (Ctrl + P)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* ================= PRINT PREVIEW CONTAINER ================= */}
      <div className="flex-1 overflow-y-auto bg-neutral-200 p-4 sm:p-8 print:p-0 print:bg-white print:overflow-visible">
        <div className="max-w-[850px] mx-auto space-y-8 print:space-y-0 print:max-w-none">
          
          {targetPeriods.map((spec, index) => {
            const ws = getWorksheetForPeriod(spec.period);
            const isSaved = Boolean(liveSession?.customWorksheetsByLesson?.[ws.lessonKey]);

            return (
              <div
                key={spec.period}
                className="bg-white text-neutral-900 p-8 sm:p-10 rounded-2xl shadow-xl print:shadow-none print:rounded-none print:p-8 border border-neutral-300 print:border-none print:break-after-page min-h-[1100px] flex flex-col justify-between"
                style={{ breakAfter: index < targetPeriods.length - 1 ? 'page' : 'auto' }}
              >
                <div>
                  {/* ====== OFFICIAL WORKSHEET HEADER ====== */}
                  <div className="border-b-2 border-neutral-900 pb-4 mb-5">
                    <div className="flex justify-between items-start text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      <div>
                        <p>{schoolName}</p>
                        <p>TỔ CHUYÊN MÔN TIN HỌC</p>
                      </div>
                      <div className="text-right">
                        <p>MÔN: TIN HỌC {selectedGrade} (GDPT 2018)</p>
                        <p>HỌC KỲ: {spec.examMilestone === 'GK1' || spec.examMilestone === 'CK1' ? 'HỌC KỲ I' : 'HỌC KỲ II'}</p>
                      </div>
                    </div>

                    <div className="text-center my-4">
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
                        PHIẾU HỌC TẬP ĐIỆN TỬ • TIẾT {spec.period}
                      </h1>
                      <h2 className="text-sm sm:text-base font-bold text-neutral-800 uppercase mt-1">
                        BÀI HỌC: {spec.lessonTitle.toUpperCase()}
                      </h2>
                      <p className="text-xs italic text-neutral-600 mt-0.5">
                        (Sách giáo khoa: {spec.sgkPages} • Nguồn số hóa: {ws.sourceFileName || 'Chuẩn GDPT 2018'})
                        {printMode === 'TEACHER_KEY' && (
                          <span className="ml-2 font-bold text-red-600">[BẢN ĐÁP ÁN &amp; HƯỚNG DẪN CHẤM CỦA GIÁO VIÊN]</span>
                        )}
                      </p>
                    </div>

                    {/* Student Info Box */}
                    <div className="grid grid-cols-12 gap-2 text-xs border border-neutral-400 p-2.5 rounded bg-neutral-50/60 font-medium">
                      <div className="col-span-6">
                        <span>Họ và tên học sinh: ................................................................</span>
                      </div>
                      <div className="col-span-3">
                        <span>Lớp: .................</span>
                      </div>
                      <div className="col-span-3 text-right">
                        <span>Số máy / Trạm: ...........</span>
                      </div>
                      <div className="col-span-8 pt-1">
                        <span>Lời phê của giáo viên: ........................................................................</span>
                      </div>
                      <div className="col-span-4 pt-1 text-right font-bold text-sm">
                        <span>Điểm tổng kết: ........... / 10.0đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Competency Goals / Yêu cầu cần đạt */}
                  <div className="mb-4 text-xs bg-neutral-100 p-2.5 rounded border border-neutral-300">
                    <p>
                      <strong>• Yêu cầu cần đạt:</strong> {spec.yccd}
                    </p>
                    <p className="mt-1 text-neutral-700">
                      <strong>• Tích hợp năng lực số &amp; AI:</strong> {spec.digitalCompetency} • {spec.aiCompetency}
                    </p>
                  </div>

                  {/* ================= 4 ACTIVITIES (CHẨN 10.0 ĐIỂM) ================= */}
                  <div className="space-y-5 text-xs text-neutral-900">
                    
                    {/* HOẠT ĐỘNG 1: KHỞI ĐỘNG (TÌNH HUỐNG ĐẶT VẤN ĐỀ - TỰ LUẬN NGẮN) */}
                    <div className="border border-neutral-300 rounded-lg p-3.5">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-neutral-200">
                        <h3 className="font-bold text-sm text-neutral-900 uppercase">
                          I. HOẠT ĐỘNG 1: KHỞI ĐỘNG (Tình huống đặt vấn đề • Tự luận ngắn)
                        </h3>
                        <span className="font-semibold text-neutral-600">Khích lệ tâm thế</span>
                      </div>
                      {ws.stage1?.scenario ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-neutral-100 rounded border border-neutral-200">
                            <p className="font-bold text-neutral-900">
                              📖 {ws.stage1.title || `Tình huống bài học: ${spec.lessonTitle}`}
                            </p>
                            <p className="mt-1 text-neutral-800 leading-relaxed italic">
                              {ws.stage1.scenario}
                            </p>
                          </div>
                          <div className="pl-1">
                            <p className="font-bold text-neutral-900">
                              ❓ Câu hỏi tự luận ngắn: {ws.stage1.question}
                            </p>
                            {printMode === 'TEACHER_KEY' ? (
                              <p className="font-bold text-red-600 mt-1 pl-3">
                                ➔ Định hướng trả lời: {ws.stage1.sampleAnswer || 'Học sinh phân tích tình huống thực tế, liên hệ kiến thức bài học.'}
                              </p>
                            ) : (
                              <div className="mt-1 space-y-2">
                                <div className="border-b border-dotted border-neutral-400 h-5" />
                                <div className="border-b border-dotted border-neutral-400 h-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2 italic text-neutral-700">
                            Quan sát tình huống hoặc giải các gợi ý hàng ngang sau để mở mảnh ghép tranh bí mật chủ đề &ldquo;{spec.topic}&rdquo;:
                          </p>
                          <div className="grid grid-cols-1 gap-1.5 pl-2">
                            {(ws.stage1Questions || []).map((cw) => (
                              <div key={cw.id} className="flex justify-between items-start">
                                <span>
                                  <strong>Hàng ngang {cw.rowNumber}:</strong> {cw.clue}
                                </span>
                                {printMode === 'TEACHER_KEY' ? (
                                  <span className="font-bold text-red-600 ml-2">➔ {cw.answer}</span>
                                ) : (
                                  <span className="text-neutral-400 ml-2">({cw.answer.length} chữ cái: ................)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* HOẠT ĐỘNG 2: KHÁM PHÁ KIẾN THỨC (4.0 ĐIỂM) */}
                    <div className="border-2 border-neutral-800 rounded-lg p-3.5">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b-2 border-neutral-300">
                        <h3 className="font-bold text-sm text-neutral-900 uppercase">
                          II. HOẠT ĐỘNG 2: KHÁM PHÁ KIẾN THỨC
                        </h3>
                        <span className="font-bold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded">
                          4.0 ĐIỂM (Mỗi câu 1.0đ)
                        </span>
                      </div>

                      {/* Câu 1: Kéo - Thả / Điền từ (1.0đ) */}
                      <div className="mb-3.5 pb-3 border-b border-dashed border-neutral-300">
                        <p className="font-bold mb-1.5">
                          Câu 1 [Dạng Kéo - Thả / Chọn từ điền chỗ trống] (1.0 điểm):
                        </p>
                        <div className="p-2 bg-neutral-100 rounded border border-neutral-300 mb-2 font-mono text-[11px]">
                          <strong>HỘP TỪ GỢI Ý:</strong> {ws.stage2.dragDropWordBank.join('   |   ')}
                        </div>

                        {ws.stage2.dragDropSentenceLines && ws.stage2.dragDropSentenceLines.length > 0 ? (
                          <div className="space-y-1 pl-2">
                            {ws.stage2.dragDropSentenceLines.map((line, lIdx) => (
                              <p key={line.sentenceNum || lIdx}>
                                {line.textBefore}{' '}
                                {line.slotNum ? (
                                  printMode === 'TEACHER_KEY' ? (
                                    <span className="font-bold text-red-600 underline">
                                      [{ws.stage2.dragDropQuestions.find((q) => q.slotNum === line.slotNum)?.correctWord}]
                                    </span>
                                  ) : (
                                    <span className="border-b border-dotted border-neutral-700 px-6 font-bold text-neutral-500">
                                      ({line.slotNum})........................
                                    </span>
                                  )
                                ) : null}
                                {line.textMid}{' '}
                                {line.slotNum2 ? (
                                  printMode === 'TEACHER_KEY' ? (
                                    <span className="font-bold text-red-600 underline">
                                      [{ws.stage2.dragDropQuestions.find((q) => q.slotNum === line.slotNum2)?.correctWord}]
                                    </span>
                                  ) : (
                                    <span className="border-b border-dotted border-neutral-700 px-6 font-bold text-neutral-500">
                                      ({line.slotNum2})........................
                                    </span>
                                  )
                                ) : null}
                                {line.textAfter}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1 pl-2">
                            {ws.stage2.dragDropQuestions.map((dq) => (
                              <p key={dq.slotNum}>
                                {dq.promptFragment}{' '}
                                {printMode === 'TEACHER_KEY' && (
                                  <span className="font-bold text-red-600 ml-2">➔ {dq.correctWord}</span>
                                )}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Câu 2: Điền khuyết (1.0đ) */}
                      <div className="mb-3.5 pb-3 border-b border-dashed border-neutral-300">
                        <p className="font-bold mb-1.5">
                          Câu 2 [Dạng Điền khuyết]: Hoàn thành các mệnh đề tri thức còn thiếu (1.0 điểm):
                        </p>
                        <div className="space-y-1.5 pl-2">
                          {ws.stage2.fillBlankQuestions.map((fb) => (
                            <p key={fb.id}>
                              <strong>{fb.label}</strong> {fb.preText}
                              {printMode === 'TEACHER_KEY' ? (
                                <span className="font-bold text-red-600 underline px-1">
                                  [{fb.correctAnswer}]
                                </span>
                              ) : (
                                <span className="border-b-2 border-neutral-800 px-8 text-neutral-400">
                                  .............................
                                </span>
                              )}
                              {fb.postText}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Câu 3: Nối cột (1.0đ) */}
                      <div className="mb-3.5 pb-3 border-b border-dashed border-neutral-300">
                        <p className="font-bold mb-1.5">
                          Câu 3 [Dạng Nối cột]: Ghép mỗi nội dung ở Cột A với một nội dung phù hợp ở Cột B (1.0 điểm):
                        </p>
                        <div className="grid grid-cols-2 gap-4 border border-neutral-400 rounded p-2">
                          <div>
                            <p className="font-bold text-center border-b border-neutral-300 pb-1 mb-1">
                              CỘT A (Khái niệm / Thiết bị)
                            </p>
                            <div className="space-y-1.5">
                              {ws.stage2.matchingQuestions.map((m) => (
                                <p key={m.id}>
                                  <strong>{m.num})</strong> {m.leftText.replace(/^\d+\)\s*/, '')}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-center border-b border-neutral-300 pb-1 mb-1">
                              CỘT B (Chức năng / Đặc điểm)
                            </p>
                            <div className="space-y-1.5">
                              {ws.stage2.matchingQuestions.map((m) => (
                                <p key={m.id}>
                                  <strong>{m.rightKey})</strong> {m.rightText.replace(/^[a-z]\)\s*/i, '')}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-right italic font-medium">
                          {printMode === 'TEACHER_KEY' ? (
                            <span className="font-bold text-red-600">
                              Đáp án nối: {ws.stage2.matchingQuestions.map((m) => `${m.num}-${m.rightKey}`).join('  •  ')}
                            </span>
                          ) : (
                            <span>Ghi kết quả nối: 1 - ..... ; 2 - ..... ; 3 - ..... ; 4 - .....</span>
                          )}
                        </div>
                      </div>

                      {/* Câu 4: Trả lời ngắn / Tự luận (1.0đ) */}
                      <div>
                        <p className="font-bold mb-1">
                          Câu 4 [Dạng Trả lời ngắn / Tình huống thực tế] (1.0 điểm):
                        </p>
                        <p className="mb-2 italic text-neutral-800 bg-neutral-50 p-2 rounded border border-neutral-200">
                          {ws.stage2.shortAnswerPrompt}
                        </p>
                        <div className="space-y-2 pl-2">
                          {ws.stage2.shortAnswerQuestions.map((sa) => (
                            <div key={sa.id}>
                              <p className="font-semibold text-neutral-800">
                                {sa.label} ({sa.points.toFixed(1)}đ): {sa.question}
                              </p>
                              {printMode === 'TEACHER_KEY' ? (
                                <p className="font-bold text-red-600 pl-4 py-0.5">
                                  ➔ Gợi ý trả lời: {sa.sampleAnswer}
                                </p>
                              ) : (
                                <div className="border-b border-dotted border-neutral-400 h-6 mt-0.5" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* HOẠT ĐỘNG 3: LUYỆN TẬP (3.0 ĐIỂM) */}
                    <div className="border border-neutral-300 rounded-lg p-3.5">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-neutral-200">
                        <h3 className="font-bold text-sm text-neutral-900 uppercase">
                          III. HOẠT ĐỘNG 3: LUYỆN TẬP (Đấu trường trắc nghiệm 25s &amp; Thực hành)
                        </h3>
                        <span className="font-bold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded">
                          3.0 ĐIỂM (6 câu x 0.5đ)
                        </span>
                      </div>

                      <div className="space-y-3 pl-1">
                        {ws.stage3QuizQuestions.map((q, qIndex) => (
                          <div key={q.id || qIndex}>
                            <p className="font-bold">
                              Câu {qIndex + 1}: {q.question.replace(/^Câu \d+:\s*/, '')} (0.5đ)
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-3 mt-1">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.letter}
                                  className={
                                    printMode === 'TEACHER_KEY' && opt.isCorrect
                                      ? 'font-bold text-red-600 underline'
                                      : ''
                                  }
                                >
                                  <strong>{opt.letter}.</strong> {opt.text}
                                  {printMode === 'TEACHER_KEY' && opt.isCorrect && ' ✓'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* HOẠT ĐỘNG 4: VẬN DỤNG THỰC TẾ (3.0 ĐIỂM: 3 BÀI TẬP) */}
                    <div className="border border-neutral-300 rounded-lg p-3.5">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-neutral-200">
                        <h3 className="font-bold text-sm text-neutral-900 uppercase">
                          IV. HOẠT ĐỘNG 4: VẬN DỤNG THỰC TẾ (3 Nhiệm vụ phân hóa • 3.0 điểm)
                        </h3>
                        <span className="font-bold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded">
                          3.0 ĐIỂM (1.0đ + 1.0đ + 1.0đ)
                        </span>
                      </div>

                      {ws.stage4?.deepAnalysis ? (
                        <div className="space-y-3">
                          {/* Nhiệm vụ 1: Tự luận phân tích sâu */}
                          <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                            <p className="font-bold text-neutral-900">
                              1. {ws.stage4.deepAnalysis.title || (ws.stage4.deepAnalysis as unknown as { taskName?: string }).taskName || 'Tự luận phân tích'} ({(ws.stage4.deepAnalysis.points ?? 1.0).toFixed(1)} điểm):
                            </p>
                            <p className="mt-1 text-neutral-800">
                              {ws.stage4.deepAnalysis.prompt || (ws.stage4.deepAnalysis as unknown as { question?: string }).question}
                            </p>
                            {printMode === 'TEACHER_KEY' ? (
                              <p className="font-bold text-red-600 mt-1 pl-3">
                                ➔ Định hướng: {ws.stage4.deepAnalysis.guideAnswer || (ws.stage4.deepAnalysis as unknown as { sampleAnswer?: string }).sampleAnswer}
                              </p>
                            ) : (
                              <div className="mt-2 space-y-1.5">
                                <div className="border-b border-dotted border-neutral-400 h-5" />
                                <div className="border-b border-dotted border-neutral-400 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Nhiệm vụ 2: Bài tập thực hành tự luận */}
                          {ws.stage4.practicalTask && (
                            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                              <p className="font-bold text-neutral-900">
                                2. {ws.stage4.practicalTask.title || (ws.stage4.practicalTask as unknown as { taskName?: string }).taskName || 'Bài tập thực hành'} ({(ws.stage4.practicalTask.points ?? 1.0).toFixed(1)} điểm):
                              </p>
                              <p className="mt-1 text-neutral-800">
                                {ws.stage4.practicalTask.prompt || (ws.stage4.practicalTask as unknown as { requirement?: string }).requirement}
                              </p>
                              {ws.stage4.practicalTask.guideAnswer && (
                                <p className="text-xs text-neutral-600 italic mt-0.5">
                                  Gợi ý: {ws.stage4.practicalTask.guideAnswer}
                                </p>
                              )}
                              {printMode !== 'TEACHER_KEY' && (
                                <div className="mt-2 space-y-1.5">
                                  <div className="border-b border-dotted border-neutral-400 h-5" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Nhiệm vụ 3: Bài tập Vận dụng SGK mở rộng */}
                          {ws.stage4.extendedTask && (
                            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                              <p className="font-bold text-neutral-900">
                                3. {ws.stage4.extendedTask.title || (ws.stage4.extendedTask as unknown as { taskName?: string }).taskName || 'Vận dụng mở rộng'} ({(ws.stage4.extendedTask.points ?? 1.0).toFixed(1)} điểm):
                              </p>
                              <p className="mt-1 text-neutral-800">
                                {ws.stage4.extendedTask.prompt || (ws.stage4.extendedTask as unknown as { exercise?: string }).exercise}
                              </p>
                              {ws.stage4.extendedTask.guideAnswer && (
                                <p className="mt-1 text-neutral-700 italic">
                                  Gợi ý: {ws.stage4.extendedTask.guideAnswer}
                                </p>
                              )}
                              {printMode !== 'TEACHER_KEY' && (
                                <div className="mt-2 space-y-1.5">
                                  <div className="border-b border-dotted border-neutral-400 h-5" />
                                  <div className="border-b border-dotted border-neutral-400 h-5" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2 italic text-neutral-800">
                            {ws.stage4.prompt}
                          </p>
                          <table className="w-full border-collapse border border-neutral-400 text-left text-xs mb-2">
                            <thead>
                              <tr className="bg-neutral-100">
                                <th className="border border-neutral-400 p-1.5 w-1/4">Thành phần khảo sát</th>
                                <th className="border border-neutral-400 p-1.5 w-1/3">Dữ liệu quan sát được</th>
                                <th className="border border-neutral-400 p-1.5">Thông tin rút ra &amp; Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-neutral-400 p-1.5 italic text-neutral-600">
                                  Mẫu: {ws.stage4.sampleRow?.carrier}
                                </td>
                                <td className="border border-neutral-400 p-1.5 italic text-neutral-600">
                                  {ws.stage4.sampleRow?.data}
                                </td>
                                <td className="border border-neutral-400 p-1.5 italic text-neutral-600">
                                  {ws.stage4.sampleRow?.infoAction}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {includeRubrics && ws.stage4?.rubrics && (
                        <div className="mt-2 pt-2 border-t border-neutral-200">
                          <p className="font-bold text-neutral-700 mb-1">
                            Tiêu chí đánh giá định kỳ Rubric (Tối đa 3.0 điểm):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                            {ws.stage4.rubrics.map((r, rIdx) => (
                              <div key={r.id || rIdx} className="bg-neutral-50 p-1.5 rounded border border-neutral-300">
                                <p className="font-bold">{r.title} ({r.points.toFixed(1)}đ)</p>
                                <p className="text-neutral-600 text-[10px]">{r.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Footer Signature Box */}
                <div className="mt-6 pt-3 border-t border-neutral-400 flex justify-between items-end text-xs text-neutral-700">
                  <div>
                    <p>Mã phiếu số hóa: <strong>{ws.lessonKey}</strong></p>
                    <p className="text-[10px] text-neutral-500">
                      Trạng thái Database: {isSaved ? '✓ Đã đồng bộ Cloud Database' : 'Bản hệ thống chuẩn GDPT 2018'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
                    <p className="font-bold mt-1">GIÁO VIÊN BỘ MÔN KÝ TÊN</p>
                    <div className="h-10" />
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};
