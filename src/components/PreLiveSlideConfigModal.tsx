import React, { useState, useEffect, useRef } from 'react';
import {
  getPeriodsForGrade,
  type CurriculumPeriodSpec,
  type LiveClassroomSession,
} from '../data/mockCurriculumData';
import {
  convertFilesToHybridSlidePages,
  loadHybridSlideDeck3Tier,
  saveHybridSlideDeck3Tier,
  deleteHybridDeckFromIndexedDb,
  deleteHybridDeckFromServer,
  buildDefaultHighResSlideDeck,
  buildDefaultAnimatedHtmlSimulation,
  buildDefaultWarmupSvgDataUrl,
  type HybridSlideDeckRecord,
  type HybridWarmupMediaConfig,
} from '../utils/hybridSlideStorage';

interface PreLiveSlideConfigModalProps {
  isOpen: boolean;
  initialGrade: 6 | 7 | 8 | 9;
  initialPeriod: number;
  liveSession?: LiveClassroomSession;
  onUpdateLiveSession?: (updater: (prev: LiveClassroomSession) => LiveClassroomSession) => void;
  onClose: () => void;
  onLaunchLiveRoom?: (grade: 6 | 7 | 8 | 9, period: number) => void;
  onShowToast: (msg: string) => void;
  onDeckSaved?: (deck: HybridSlideDeckRecord) => void;
}

export const PreLiveSlideConfigModal: React.FC<PreLiveSlideConfigModalProps> = ({
  isOpen,
  initialGrade,
  initialPeriod,
  onUpdateLiveSession,
  onClose,
  onLaunchLiveRoom,
  onShowToast,
  onDeckSaved,
}) => {
  const [grade, setGrade] = useState<6 | 7 | 8 | 9>(initialGrade);
  const [period, setPeriod] = useState<number>(initialPeriod);
  const [activeConfigTab, setActiveConfigTab] = useState<'slides' | 'warmup'>('slides');
  const [deck, setDeck] = useState<HybridSlideDeckRecord | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const pdfFileInputRef = useRef<HTMLInputElement | null>(null);
  const warmupImageInputRef = useRef<HTMLInputElement | null>(null);
  const warmupVideoInputRef = useRef<HTMLInputElement | null>(null);

  const gradePeriods = getPeriodsForGrade(grade);
  const currentPeriodSpec: CurriculumPeriodSpec =
    gradePeriods.find((p) => p.period === period) || gradePeriods[0];

  useEffect(() => {
    setGrade(initialGrade);
    setPeriod(initialPeriod);
  }, [initialGrade, initialPeriod]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);
    loadHybridSlideDeck3Tier({
      grade,
      period,
      lessonTitle: currentPeriodSpec.lessonTitle,
      topic: currentPeriodSpec.topic,
      yccd: currentPeriodSpec.yccd,
      nlsCode: currentPeriodSpec.nlsCode,
      nlsAction: currentPeriodSpec.nlsAction,
      aiCompetency: currentPeriodSpec.aiCompetency,
    })
      .then((loaded) => {
        if (!cancelled) {
          setDeck(loaded);
          setPreviewSlideIdx(0);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, grade, period, currentPeriodSpec.lessonTitle]);

  if (!isOpen) return null;

  const handleUploadSlideFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    e.target.value = '';

    try {
      setIsSaving(true);
      setProgressPercent(5);
      setProgressText('Đang khởi tạo Tầng 1 (High-Fidelity Rendering)...');

      const converted = await convertFilesToHybridSlidePages(
        files,
        (cur, tot, msg) => {
          setProgressPercent(Math.round((cur / Math.max(1, tot)) * 80));
          setProgressText(msg);
        }
      );

      setProgressPercent(88);
      setProgressText('Đang ghi vào Tầng 2 (IndexedDB Cache) & Tầng 3 (Server Permanent Storage)...');

      const baseDeck =
        deck ||
        buildDefaultHighResSlideDeck({
          grade,
          period,
          lessonTitle: currentPeriodSpec.lessonTitle,
          topic: currentPeriodSpec.topic,
          yccd: currentPeriodSpec.yccd,
        });

      const nextDeck: HybridSlideDeckRecord = {
        ...baseDeck,
        lessonKey: `k${grade}-tiet-${period}`,
        grade,
        period,
        lessonTitle: currentPeriodSpec.lessonTitle,
        topic: currentPeriodSpec.topic,
        fileName: converted.fileName,
        totalPages: converted.slides.length,
        slides: converted.slides,
        renderQuality: converted.renderQuality,
      };

      const savedRes = await saveHybridSlideDeck3Tier(nextDeck);
      setDeck(savedRes.deck);
      setPreviewSlideIdx(0);
      setProgressPercent(100);
      setProgressText('');
      setIsSaving(false);

      if (onUpdateLiveSession) {
        onUpdateLiveSession((prev) => ({
          ...prev,
          activeSlideIndexByLesson: {
            ...(prev.activeSlideIndexByLesson || {}),
            [savedRes.deck.lessonKey]: 0,
          },
          slideDeckVersionByLesson: {
            ...(prev.slideDeckVersionByLesson || {}),
            [savedRes.deck.lessonKey]: Date.now(),
          },
          updatedAt: new Date().toISOString(),
        }));
      }

      onDeckSaved?.(savedRes.deck);
      onShowToast(
        `✅ Đã nạp ${savedRes.deck.slides.length} trang Slide chuẩn gốc (Hybrid 3 Tầng) cho Khối ${grade} • Tiết ${period}!`
      );
    } catch (err: any) {
      setIsSaving(false);
      setProgressText('');
      onShowToast(`⚠️ Lỗi nạp Slide: ${err?.message || 'Không thể xử lý tệp'}`);
    }
  };

  const handleSaveCurrentConfig = async (launchAfterSave = false) => {
    if (!deck) return;
    setIsSaving(true);
    setProgressText('Đang đồng bộ 3 tầng (IndexedDB + Server Storage)...');
    const res = await saveHybridSlideDeck3Tier(deck);
    setDeck(res.deck);
    setIsSaving(false);
    setProgressText('');
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        slideDeckVersionByLesson: {
          ...(prev.slideDeckVersionByLesson || {}),
          [res.deck.lessonKey]: Date.now(),
        },
        updatedAt: new Date().toISOString(),
      }));
    }
    onDeckSaved?.(res.deck);
    onShowToast(
      `💾 Đã lưu cấu hình Slide & Hoạt động Khởi động (Khối ${grade} • Tiết ${period}) vào IndexedDB & Server!`
    );
    if (launchAfterSave && onLaunchLiveRoom) {
      onClose();
      onLaunchLiveRoom(grade, period);
    }
  };

  const handleResetToDefault = async () => {
    const lessonKey = `k${grade}-tiet-${period}`;
    await Promise.all([
      deleteHybridDeckFromIndexedDb(lessonKey),
      deleteHybridDeckFromServer(lessonKey),
    ]);
    const def = buildDefaultHighResSlideDeck({
      grade,
      period,
      lessonTitle: currentPeriodSpec.lessonTitle,
      topic: currentPeriodSpec.topic,
      yccd: currentPeriodSpec.yccd,
      nlsCode: currentPeriodSpec.nlsCode,
      nlsAction: currentPeriodSpec.nlsAction,
      aiCompetency: currentPeriodSpec.aiCompetency,
    });
    setDeck(def);
    setPreviewSlideIdx(0);
    if (onUpdateLiveSession) {
      onUpdateLiveSession((prev) => ({
        ...prev,
        activeSlideIndexByLesson: {
          ...(prev.activeSlideIndexByLesson || {}),
          [lessonKey]: 0,
        },
        slideDeckVersionByLesson: {
          ...(prev.slideDeckVersionByLesson || {}),
          [lessonKey]: Date.now(),
        },
        updatedAt: new Date().toISOString(),
      }));
    }
    onDeckSaved?.(def);
    onShowToast(`🔄 Đã khôi phục bộ Slide Vector HD mặc định cho Khối ${grade} • Tiết ${period}.`);
  };

  const updateWarmupField = (patch: Partial<HybridWarmupMediaConfig>) => {
    if (!deck) return;
    setDeck({
      ...deck,
      warmupConfig: {
        ...deck.warmupConfig,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const handleUploadWarmupImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateWarmupField({
        activeMediaType: 'image',
        imageUrl: String(reader.result || ''),
        imageCaption: f.name,
      });
      onShowToast(`🖼️ Đã nạp ảnh khởi động nguyên bản "${f.name}"!`);
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const handleUploadWarmupVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateWarmupField({
        activeMediaType: 'video',
        videoUrl: String(reader.result || ''),
        videoTitle: f.name,
      });
      onShowToast(`🎬 Đã nạp video khởi động "${f.name}"!`);
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const activeSlide = deck?.slides?.[previewSlideIdx] || deck?.slides?.[0];

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full border-2 border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0f3d2e] via-[#134e4a] to-[#0f3d2e] text-white flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-md">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Cấu Hình Trước Phiên Live: Slide Bài Giảng &amp; Khởi Động (Kiến Trúc Hybrid 3 Tầng)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-black">
                  GIỮ NGUYÊN 100% ẢNH GỐC
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Tầng 1: Render Gốc 2.4x Ultra-HD / Lossless • Tầng 2: IndexedDB Tức Thì (&lt;10ms) • Tầng 3: Lưu Bền Vững Trên Server
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Grade & Period Selector Bar + 3-Tier Architecture Status Indicators */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700">Chọn Khối &amp; Tiết dạy:</span>
            {([6, 7, 8, 9] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGrade(g);
                  setPeriod(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  grade === g
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Khối {g}
              </button>
            ))}

            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              aria-label="Chọn tiết học cần cấu hình Slide"
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {gradePeriods.map((p) => (
                <option key={p.period} value={p.period}>
                  Tiết {p.period}: {p.lessonTitle}
                </option>
              ))}
            </select>
          </div>

          {/* 3-Tier Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              ✨ Tầng 1: {deck?.renderQuality === 'original-lossless' ? 'Ảnh Gốc Lossless' : deck?.renderQuality === 'ultra-hd-2.4x' ? 'PDF 2.4x Ultra-HD' : 'Vector SVG 1080p'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full border ${
                deck?.tierStatus?.tier2IndexedDb
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              ⚡ Tầng 2 IndexedDB: {deck?.tierStatus?.tier2IndexedDb ? 'Đã lưu đệm' : 'Sẵn sàng'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full border ${
                deck?.tierStatus?.tier3ServerStorage
                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              ☁️ Tầng 3 Server: {deck?.tierStatus?.tier3ServerStorage ? 'Đã đồng bộ bền vững' : 'Sẵn sàng lưu'}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs: Slide Bài Giảng vs Hoạt động 1 (Khởi động: Video / Ảnh / HTML Mô phỏng) */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveConfigTab('slides')}
              className={`px-4 py-2 rounded-t-2xl text-xs sm:text-sm font-black cursor-pointer transition-all border-b-2 ${
                activeConfigTab === 'slides'
                  ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              📑 1. Slide Bài Giảng PDF / Ảnh Gốc ({deck?.slides?.length || 0} trang)
            </button>
            <button
              type="button"
              onClick={() => setActiveConfigTab('warmup')}
              className={`px-4 py-2 rounded-t-2xl text-xs sm:text-sm font-black cursor-pointer transition-all border-b-2 ${
                activeConfigTab === 'warmup'
                  ? 'bg-white text-amber-800 border-amber-500 shadow-2xs'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              🎬 2. Hoạt động Khởi động (Chỉ Video • Ảnh • Mã HTML Mô Phỏng Chuyển Động)
            </button>
          </div>

          {progressText && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span>{progressText} ({progressPercent}%)</span>
            </div>
          )}
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 font-bold">
              ⏳ Đang nạp dữ liệu Slide &amp; Khởi động từ Kiến trúc Hybrid 3 Tầng...
            </div>
          ) : activeConfigTab === 'slides' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 cols: Upload PDF / Original Images & Slide Thumbnails */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-dashed border-emerald-400 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-900">
                      📂 Nạp Bài Giảng PDF hoặc Bộ Ảnh Slide Gốc
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Khối {grade} • Tiết {period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chọn tệp <strong>.PDF</strong> bài giảng (tự động chuyển thành các trang ảnh Ultra-HD 2.4x giữ nguyên chữ &amp; hình gốc) hoặc chọn nhiều tệp <strong>Ảnh gốc (.PNG, .JPG, .WebP)</strong>. Mỗi khi chọn tiết dạy, bài giảng sẽ có sẵn tức thì!
                  </p>

                  <input
                    ref={pdfFileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp,image/svg+xml"
                    multiple
                    onChange={handleUploadSlideFiles}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => pdfFileInputRef.current?.click()}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md transition-all"
                    >
                      📤 Chọn File PDF hoặc Bộ Ảnh Slide Gốc
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                      title="Khôi phục bộ Slide mặc định"
                    >
                      🔄 Mặc định
                    </button>
                  </div>
                </div>

                {/* Slide Page List */}
                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                    <span>Danh sách trang Slide ({deck?.slides?.length || 0} trang)</span>
                    <span className="truncate max-w-[200px] text-slate-500">{deck?.fileName}</span>
                  </div>
                  {(deck?.slides || []).map((sl, idx) => (
                    <div
                      key={sl.slideNumber}
                      onClick={() => setPreviewSlideIdx(idx)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        previewSlideIdx === idx
                          ? 'bg-emerald-50 border-2 border-emerald-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={sl.imageUrl}
                          alt={sl.title}
                          className="w-16 h-10 object-cover rounded-lg border border-slate-300 bg-slate-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">
                            Trang {idx + 1}: {sl.title}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Độ phân giải gốc: {sl.width}×{sl.height}px
                          </div>
                        </div>
                      </div>
                      {(deck?.slides?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (!deck) return;
                            const filtered = deck.slides
                              .filter((_, i) => i !== idx)
                              .map((s, i) => ({ ...s, slideNumber: i + 1 }));
                            setDeck({
                              ...deck,
                              totalPages: filtered.length,
                              slides: filtered,
                            });
                            setPreviewSlideIdx(Math.max(0, idx - 1));
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold"
                          title="Xoá trang này"
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 7 cols: Live Chalkboard Slide Preview */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1B4D3E] via-[#174235] to-[#12352A] border-4 border-[#8C5622] shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
                    <span>
                      📺 Xem trước trên Bảng Trình Chiếu Phòng Live Chính — Trang {previewSlideIdx + 1}/
                      {deck?.slides?.length || 1}
                    </span>
                    <span>
                      {activeSlide?.width || 1920}×{activeSlide?.height || 1080}px (Chuẩn Gốc)
                    </span>
                  </div>

                  <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-white/20 overflow-hidden flex items-center justify-center">
                    {activeSlide ? (
                      <img
                        src={activeSlide.imageUrl}
                        alt={activeSlide.title}
                        className="w-full h-full object-contain select-none"
                      />
                    ) : (
                      <span className="text-xs text-white/70">Chưa có trang Slide</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx((p) => Math.max(0, p - 1))}
                      disabled={previewSlideIdx <= 0}
                      className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      ◀ Trang trước
                    </button>
                    <span className="text-xs font-extrabold text-white truncate max-w-md">
                      {activeSlide?.title}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewSlideIdx((p) =>
                          Math.min((deck?.slides?.length || 1) - 1, p + 1)
                        )
                      }
                      disabled={previewSlideIdx >= (deck?.slides?.length || 1) - 1}
                      className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      Trang tiếp ▶
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: CẤU HÌNH HOẠT ĐỘNG 1 — KHỞI ĐỘNG (CHỈ VIDEO, ẢNH, MÃ HTML MÔ PHỎNG CHUYỂN ĐỘNG) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col gap-2.5">
                  <span className="text-xs font-black uppercase text-amber-900">
                    🎯 Chọn Phương Tiện Khởi Động Mặc Định Khi Bấm HĐ 1
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'html-sim' as const, label: '⚡ Mô phỏng HTML', desc: 'Chuyển động tương tác' },
                      { id: 'video' as const, label: '🎬 Video', desc: 'MP4 / YouTube' },
                      { id: 'image' as const, label: '🖼️ Ảnh trực quan', desc: 'Infographic sắc nét' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateWarmupField({ activeMediaType: m.id })}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          deck?.warmupConfig?.activeMediaType === m.id
                            ? 'bg-amber-500 text-slate-950 border-amber-700 font-black shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100/50 font-bold'
                        }`}
                      >
                        <div className="text-xs">{m.label}</div>
                        <div className="text-[10px] opacity-80">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Cấu hình Video Khởi động */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">🎬 1. Video Khởi Động (MP4 / YouTube)</span>
                    <input
                      ref={warmupVideoInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleUploadWarmupVideo}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => warmupVideoInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      📤 Tải tệp Video
                    </button>
                  </div>
                  <input
                    type="text"
                    value={deck?.warmupConfig?.videoUrl || ''}
                    onChange={(e) => updateWarmupField({ videoUrl: e.target.value })}
                    placeholder="Dán link Video MP4 hoặc link YouTube..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs"
                  />
                </div>

                {/* 2. Cấu hình Ảnh Trực Quan */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">🖼️ 2. Ảnh Khởi Động Trực Quan</span>
                    <input
                      ref={warmupImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadWarmupImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => warmupImageInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      📤 Tải Ảnh gốc
                    </button>
                  </div>
                  <input
                    type="text"
                    value={deck?.warmupConfig?.imageUrl || ''}
                    onChange={(e) => updateWarmupField({ imageUrl: e.target.value })}
                    placeholder="Hoặc dán URL hình ảnh minh họa..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs"
                  />
                </div>

                {/* 3. Cấu hình Mã HTML Mô Phỏng Chuyển Động */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      ⚡ 3. Nhúng Mã HTML Mô Phỏng Chuyển Động
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateWarmupField({
                          activeMediaType: 'html-sim',
                          htmlSimulationCode: buildDefaultAnimatedHtmlSimulation({
                            grade,
                            period,
                            lessonTitle: currentPeriodSpec.lessonTitle,
                            topic: currentPeriodSpec.topic,
                            yccd: currentPeriodSpec.yccd,
                          }),
                          imageUrl: buildDefaultWarmupSvgDataUrl({
                            grade,
                            period,
                            lessonTitle: currentPeriodSpec.lessonTitle,
                            topic: currentPeriodSpec.topic,
                            yccd: currentPeriodSpec.yccd,
                          }),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold cursor-pointer"
                    >
                      ✨ Tạo lại mẫu HTML5 theo bài
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={deck?.warmupConfig?.htmlSimulationCode || ''}
                    onChange={(e) =>
                      updateWarmupField({
                        activeMediaType: 'html-sim',
                        htmlSimulationCode: e.target.value,
                      })
                    }
                    placeholder="Dán mã HTML5 / CSS / Canvas / JS mô phỏng chuyển động tại đây..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] border border-slate-700"
                  />
                </div>
              </div>

              {/* Right 7 cols: Live Preview of Warmup Media on Chalkboard */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1B4D3E] via-[#174235] to-[#12352A] border-4 border-[#8C5622] shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
                    <span>📺 Xem trước Hoạt động 1 (Khởi động) trên Bảng Phòng Live Chính</span>
                    <div className="flex items-center gap-1">
                      {(['html-sim', 'video', 'image'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateWarmupField({ activeMediaType: t })}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black cursor-pointer ${
                            deck?.warmupConfig?.activeMediaType === t
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {t === 'html-sim' ? '⚡ HTML Mô phỏng' : t === 'video' ? '🎬 Video' : '🖼️ Ảnh'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-white/20 overflow-hidden flex items-center justify-center">
                    {deck?.warmupConfig?.activeMediaType === 'video' ? (
                      deck.warmupConfig.videoUrl.includes('youtube.com') ||
                      deck.warmupConfig.videoUrl.includes('youtu.be') ? (
                        <iframe
                          title="Warmup Video"
                          src={deck.warmupConfig.videoUrl
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'www.youtube.com/embed/')}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media; fullscreen"
                        />
                      ) : (
                        <video
                          src={deck.warmupConfig.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : deck?.warmupConfig?.activeMediaType === 'image' ? (
                      <img
                        src={deck.warmupConfig.imageUrl}
                        alt={deck.warmupConfig.imageCaption}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        title="HTML5 Motion Simulation Preview"
                        srcDoc={deck?.warmupConfig?.htmlSimulationCode || ''}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-bold">
            📌 Khi chọn <strong>Khối {grade} • Tiết {period}</strong> để dạy, hệ thống sẽ tự động nạp ngay bộ Slide &amp; Khởi động này lên Bảng Phòng Live Chính.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveCurrentConfig(false)}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md"
            >
              💾 Lưu Cấu Hình (IndexedDB + Server)
            </button>
            {onLaunchLiveRoom && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveCurrentConfig(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black cursor-pointer shadow-lg"
              >
                🚀 Lưu &amp; Mở Ngay Phòng Live Chính (Tiết {period})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

