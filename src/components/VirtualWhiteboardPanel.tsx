import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LessonWhiteboardState,
  WhiteboardStroke,
  WhiteboardTextNote,
  WhiteboardPoint,
} from '../data/mockCurriculumData';

interface VirtualWhiteboardPanelProps {
  lessonKey: string;
  lessonTitle: string;
  grade: number;
  period: number;
  classId: string;
  whiteboardState?: LessonWhiteboardState;
  slideBackgroundUrl?: string;
  readOnly?: boolean;
  onUpdateWhiteboard?: (nextState: LessonWhiteboardState) => void;
  onClose?: () => void;
  onShowToast?: (message: string) => void;
}

const COLOR_PALETTE = [
  { id: '#EA580C', label: 'Cam nổi bật' },
  { id: '#DC2626', label: 'Đỏ nhấn mạnh' },
  { id: '#2563EB', label: 'Xanh dương' },
  { id: '#16A34A', label: 'Xanh lá' },
  { id: '#9333EA', label: 'Tím' },
  { id: '#FACC15', label: 'Vàng dạ quang' },
  { id: '#0F172A', label: 'Đen mực' },
  { id: '#FFFFFF', label: 'Phấn trắng' },
];

export const VirtualWhiteboardPanel: React.FC<VirtualWhiteboardPanelProps> = ({
  lessonKey,
  lessonTitle,
  grade,
  period,
  classId,
  whiteboardState,
  slideBackgroundUrl,
  readOnly = false,
  onUpdateWhiteboard,
  onClose,
  onShowToast,
}) => {
  const defaultState: LessonWhiteboardState = {
    isOpen: whiteboardState?.isOpen ?? false,
    backgroundMode: whiteboardState?.backgroundMode ?? 'grid',
    strokes: whiteboardState?.strokes ?? [],
    textNotes: whiteboardState?.textNotes ?? [],
    updatedAt: whiteboardState?.updatedAt ?? new Date().toISOString(),
  };

  const currentState = whiteboardState ? {
    ...defaultState,
    ...whiteboardState,
    strokes: Array.isArray(whiteboardState.strokes) ? whiteboardState.strokes : [],
    textNotes: Array.isArray(whiteboardState.textNotes) ? whiteboardState.textNotes : [],
  } : defaultState;

  const [activeTool, setActiveTool] = useState<WhiteboardStroke['tool'] | 'text'>('pen');
  const [activeColor, setActiveColor] = useState<string>('#EA580C');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [draftPoints, setDraftPoints] = useState<WhiteboardPoint[]>([]);
  const [pendingNotePos, setPendingNotePos] = useState<WhiteboardPoint | null>(null);
  const [pendingNoteText, setPendingNoteText] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [bgImageLoaded, setBgImageLoaded] = useState<number>(0);

  useEffect(() => {
    if (slideBackgroundUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgImageRef.current = img;
        setBgImageLoaded(prev => prev + 1);
      };
      img.src = slideBackgroundUrl;
    } else {
      bgImageRef.current = null;
    }
  }, [slideBackgroundUrl]);

  const broadcastAndPersist = useCallback(
    (nextState: LessonWhiteboardState) => {
      onUpdateWhiteboard?.(nextState);
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const ch = new BroadcastChannel('cloudplay_realtime_sync');
          ch.postMessage({
            type: 'WHITEBOARD_UPDATED',
            lessonKey,
            whiteboardState: nextState,
            timestamp: Date.now(),
          });
          ch.close();
        } catch {
          // ignore broadcast channel error
        }
      }
    },
    [lessonKey, onUpdateWhiteboard]
  );

  const drawSingleStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: {
      tool: WhiteboardStroke['tool'];
      color: string;
      width: number;
      points: WhiteboardPoint[];
    },
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!stroke.points || stroke.points.length === 0) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'eraser') {
      ctx.strokeStyle = currentState.backgroundMode === 'chalkboard' ? '#0F291E' : '#FFFFFF';
      ctx.lineWidth = stroke.width * 4;
    } else if (stroke.tool === 'highlighter') {
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = stroke.width * 3.2;
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
    }

    const pts = stroke.points.map(p => ({
      x: p.x * canvasWidth,
      y: p.y * canvasHeight,
    }));

    if (stroke.tool === 'pen' || stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        ctx.lineTo(pts[0].x + 0.5, pts[0].y + 0.5);
      } else {
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
      }
      ctx.stroke();
    } else if (stroke.tool === 'line' && pts.length >= 2) {
      const start = pts[0];
      const end = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (stroke.tool === 'arrow' && pts.length >= 2) {
      const start = pts[0];
      const end = pts[pts.length - 1];
      const headLen = Math.max(12, stroke.width * 3.5);
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle - Math.PI / 6),
        end.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        end.x - headLen * Math.cos(angle + Math.PI / 6),
        end.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = stroke.color;
      ctx.fill();
    } else if (stroke.tool === 'rect' && pts.length >= 2) {
      const start = pts[0];
      const end = pts[pts.length - 1];
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (stroke.tool === 'circle' && pts.length >= 2) {
      const start = pts[0];
      const end = pts[pts.length - 1];
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Render canvas whenever state or draft changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (currentState.backgroundMode === 'chalkboard') {
      ctx.fillStyle = '#0F291E';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (currentState.backgroundMode === 'slide' && bgImageRef.current) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);
      const img = bgImageRef.current;
      const scale = Math.min(width / img.width, height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (height - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw saved strokes
    for (const stroke of currentState.strokes) {
      drawSingleStroke(ctx, stroke, width, height);
    }

    // Draw active draft stroke
    if (isDrawing && draftPoints.length > 0 && activeTool !== 'text') {
      drawSingleStroke(
        ctx,
        {
          tool: activeTool,
          color: activeColor,
          width: strokeWidth,
          points: draftPoints,
        },
        width,
        height
      );
    }
  }, [
    currentState.strokes,
    currentState.backgroundMode,
    isDrawing,
    draftPoints,
    activeTool,
    activeColor,
    strokeWidth,
    bgImageLoaded,
  ]);

  const getNormalizedCoords = (e: React.PointerEvent<HTMLCanvasElement>): WhiteboardPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const pt = getNormalizedCoords(e);

    if (activeTool === 'text') {
      setPendingNotePos(pt);
      setPendingNoteText('');
      return;
    }

    setIsDrawing(true);
    setDraftPoints([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawing) return;
    const pt = getNormalizedCoords(e);
    setDraftPoints(prev => [...prev, pt]);
  };

  const handlePointerUp = () => {
    if (readOnly || !isDrawing) return;
    setIsDrawing(false);
    if (draftPoints.length === 0 || activeTool === 'text') return;

    const newStroke: WhiteboardStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tool: activeTool,
      color: activeColor,
      width: strokeWidth,
      points: draftPoints,
    };

    const nextState: LessonWhiteboardState = {
      ...currentState,
      strokes: [...currentState.strokes, newStroke],
      updatedAt: new Date().toISOString(),
    };
    setDraftPoints([]);
    broadcastAndPersist(nextState);
  };

  const handleAddTextNote = () => {
    if (!pendingNotePos || !pendingNoteText.trim()) {
      setPendingNotePos(null);
      return;
    }
    const newNote: WhiteboardTextNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x: pendingNotePos.x,
      y: pendingNotePos.y,
      text: pendingNoteText.trim(),
      color: activeColor,
      fontSize: 16,
    };
    const nextState: LessonWhiteboardState = {
      ...currentState,
      textNotes: [...currentState.textNotes, newNote],
      updatedAt: new Date().toISOString(),
    };
    setPendingNotePos(null);
    setPendingNoteText('');
    broadcastAndPersist(nextState);
  };

  const handleRemoveNote = (noteId: string) => {
    if (readOnly) return;
    const nextState: LessonWhiteboardState = {
      ...currentState,
      textNotes: currentState.textNotes.filter(n => n.id !== noteId),
      updatedAt: new Date().toISOString(),
    };
    broadcastAndPersist(nextState);
  };

  const handleUndo = () => {
    if (readOnly || currentState.strokes.length === 0) return;
    const nextState: LessonWhiteboardState = {
      ...currentState,
      strokes: currentState.strokes.slice(0, -1),
      updatedAt: new Date().toISOString(),
    };
    broadcastAndPersist(nextState);
  };

  const handleClearBoard = () => {
    if (readOnly) return;
    const nextState: LessonWhiteboardState = {
      ...currentState,
      strokes: [],
      textNotes: [],
      updatedAt: new Date().toISOString(),
    };
    broadcastAndPersist(nextState);
    onShowToast?.('🧹 Đã xóa sạch nội dung Bảng trắng ảo & đồng bộ tới Học sinh!');
  };

  const handleToggleBroadcastToStudents = () => {
    if (readOnly) return;
    const nextOpen = !currentState.isOpen;
    const nextState: LessonWhiteboardState = {
      ...currentState,
      isOpen: nextOpen,
      updatedAt: new Date().toISOString(),
    };
    broadcastAndPersist(nextState);
    onShowToast?.(
      nextOpen
        ? '🔴 Đang phát trực tiếp Bảng trắng ảo sang màn hình Học sinh!'
        : '⏹️ Đã tắt phát Bảng trắng ảo trên màn hình Học sinh.'
    );
  };

  const handleSwitchBackground = (mode: LessonWhiteboardState['backgroundMode']) => {
    if (readOnly) return;
    const nextState: LessonWhiteboardState = {
      ...currentState,
      backgroundMode: mode,
      updatedAt: new Date().toISOString(),
    };
    broadcastAndPersist(nextState);
    if (mode === 'chalkboard' && activeColor === '#0F172A') {
      setActiveColor('#FFFFFF');
    } else if (mode === 'grid' && activeColor === '#FFFFFF') {
      setActiveColor('#0F172A');
    }
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Bang-trang-Tin-hoc-K${grade}-T${period}.png`;
      link.href = dataUrl;
      link.click();
      onShowToast?.('📥 Đã tải ảnh Bảng trắng bài giảng về máy!');
    } catch {
      onShowToast?.('⚠️ Không thể xuất ảnh do chính sách CORS của ảnh nền.');
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border-2 border-[#EA580C]/30 shadow-xl overflow-hidden flex flex-col"
    >
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#EA580C] flex items-center justify-center text-lg shadow-sm">
            🎨
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-300">
                {readOnly
                  ? '🎨 Bảng Trắng Ảo Đồng Bộ Trực Tiếp Từ Giáo Viên'
                  : '🎨 Bảng Trắng Ảo Tin Học (Vẽ & Ghi Chú Thời Gian Thực)'}
              </span>
              {currentState.isOpen && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black animate-pulse">
                  ● ĐANG ĐỒNG BỘ LIVE
                </span>
              )}
            </div>
            <h3 className="text-sm font-black text-white truncate max-w-xl">
              Lớp {classId} • Khối {grade} • Tiết {period}: {lessonTitle}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={handleToggleBroadcastToStudents}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  currentState.isOpen
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {currentState.isOpen
                  ? '⏹️ Dừng chiếu Bảng trắng ở máy HS'
                  : '🔴 Phát đồng bộ Bảng trắng sang HS'}
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                📥 Lưu ảnh (.PNG)
              </button>
            </>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-rose-600 text-white text-xs font-extrabold transition-all cursor-pointer"
            >
              ✕ Đóng bảng
            </button>
          )}
        </div>
      </div>

      {/* Teacher Drawing Toolbar */}
      {!readOnly && (
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {/* Tools */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'pen', label: '✏️ Bút vẽ' },
              { id: 'highlighter', label: '🖍️ Dạ quang' },
              { id: 'arrow', label: '↗️ Mũi tên' },
              { id: 'rect', label: '▭ Khối lệnh' },
              { id: 'circle', label: '◯ Hình tròn' },
              { id: 'line', label: '╱ Đường thẳng' },
              { id: 'text', label: '🔤 Ghi chú chữ' },
              { id: 'eraser', label: '🧽 Tẩy' },
            ].map(tool => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id as WhiteboardStroke['tool'] | 'text')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTool === tool.id
                    ? 'bg-[#EA580C] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Colors & Stroke Width */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => setActiveColor(c.id)}
                  className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                    activeColor === c.id ? 'scale-125 ring-2 ring-[#EA580C]' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: c.id }}
                />
              ))}
            </div>

            <select
              value={strokeWidth}
              onChange={e => setStrokeWidth(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700"
              aria-label="Độ dày nét vẽ"
            >
              <option value={2}>Nét mảnh (2px)</option>
              <option value={4}>Nét vừa (4px)</option>
              <option value={7}>Nét đậm (7px)</option>
              <option value={12}>Nét lớn (12px)</option>
            </select>

            {/* Background mode */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleSwitchBackground('grid')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                  currentState.backgroundMode === 'grid'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📄 Bảng ô ly
              </button>
              <button
                type="button"
                onClick={() => handleSwitchBackground('chalkboard')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                  currentState.backgroundMode === 'chalkboard'
                    ? 'bg-emerald-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🟩 Bảng phấn
              </button>
              {slideBackgroundUrl && (
                <button
                  type="button"
                  onClick={() => handleSwitchBackground('slide')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                    currentState.backgroundMode === 'slide'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🖼️ Vẽ lên Slide
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleUndo}
              disabled={currentState.strokes.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
            >
              ↩️ Hoàn tác
            </button>
            <button
              type="button"
              onClick={handleClearBoard}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 cursor-pointer"
            >
              🗑️ Xóa bảng
            </button>
          </div>
        </div>
      )}

      {/* Interactive Canvas Surface */}
      <div className="relative w-full aspect-[16/9] max-h-[68vh] bg-slate-100 select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full h-full block touch-none ${
            readOnly ? 'cursor-default' : activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'
          }`}
        />

        {/* Synchronized Text Notes Overlay */}
        {currentState.textNotes.map(note => (
          <div
            key={note.id}
            style={{
              left: `${note.x * 100}%`,
              top: `${note.y * 100}%`,
            }}
            className="absolute -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-50/95 border-2 border-amber-400 shadow-md flex items-center gap-1.5 max-w-xs pointer-events-auto"
          >
            <span
              className="text-xs md:text-sm font-extrabold break-words"
              style={{ color: note.color === '#FFFFFF' ? '#0F172A' : note.color }}
            >
              {note.text}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleRemoveNote(note.id)}
                className="text-[10px] font-black text-rose-600 hover:text-rose-800 ml-1 cursor-pointer"
                title="Xóa ghi chú"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Pending Text Input Popover for Teacher */}
        {!readOnly && pendingNotePos && (
          <div
            style={{
              left: `${Math.min(75, Math.max(5, pendingNotePos.x * 100))}%`,
              top: `${Math.min(80, Math.max(10, pendingNotePos.y * 100))}%`,
            }}
            className="absolute bg-white p-2.5 rounded-xl border-2 border-[#EA580C] shadow-xl flex items-center gap-2 z-20"
          >
            <input
              type="text"
              autoFocus
              value={pendingNoteText}
              onChange={e => setPendingNoteText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddTextNote();
                if (e.key === 'Escape') setPendingNotePos(null);
              }}
              placeholder="Nhập ghi chú thuật toán / kiến thức..."
              className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-[#EA580C] w-56 text-slate-900"
            />
            <button
              type="button"
              onClick={handleAddTextNote}
              className="px-2.5 py-1 rounded-lg bg-[#EA580C] text-white text-xs font-extrabold cursor-pointer"
            >
              Gắn
            </button>
            <button
              type="button"
              onClick={() => setPendingNotePos(null)}
              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Footer status bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-[11px] font-semibold flex flex-wrap items-center justify-between gap-2">
        <span>
          {readOnly
            ? '👁️ Chế độ Học sinh: Mọi nét vẽ và ghi chú của Giáo viên được cập nhật trực tiếp theo thời gian thực.'
            : '💡 Mẹo: Chọn công cụ "▭ Khối lệnh" và "↗️ Mũi tên" để minh họa sơ đồ khối thuật toán hoặc chọn "🖼️ Vẽ lên Slide" để khoanh trực tiếp lên bài giảng.'}
        </span>
        <span className="text-orange-300 font-bold">
          {currentState.strokes.length} nét vẽ • {currentState.textNotes.length} ghi chú
        </span>
      </div>
    </div>
  );
};
