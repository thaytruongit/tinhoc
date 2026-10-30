import React, { useState } from 'react';

interface DiagnosticMetrics {
  writeLatencyMs: number;
  readLatencyMs: number;
  updateLatencyMs: number;
  totalLatencyMs: number;
}

interface DiagnosticResult {
  ok: boolean;
  status: string;
  databaseEngine: string;
  activeClassId: string;
  metrics: DiagnosticMetrics;
  readRecord?: any;
  logs: string[];
  error?: string;
  instructions?: string;
}

interface DatabaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClassId: string;
  onShowToast: (msg: string) => void;
}

export const DatabaseDiagnosticModal: React.FC<DatabaseDiagnosticModalProps> = ({
  isOpen,
  onClose,
  activeClassId,
  onShowToast,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isInitializingSchema, setIsInitializingSchema] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  if (!isOpen) return null;

  const handleInitSchema = async () => {
    setIsInitializingSchema(true);
    try {
      const res = await fetch('/api/db/init-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        onShowToast(data.message || '🎉 Khởi tạo 5 bảng CSDL thành công!');
        // Automatically run CRUD test after schema init
        await handleRunCrudTest();
      } else {
        onShowToast(`⚠️ Lỗi khởi tạo bảng: ${data.error}`);
      }
    } catch (err: any) {
      onShowToast(`❌ Lỗi kết nối khởi tạo bảng: ${err.message}`);
    } finally {
      setIsInitializingSchema(false);
    }
  };

  const handleRunCrudTest = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/db/diagnostic-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: activeClassId }),
      });
      const data: DiagnosticResult = await res.json();
      setResult(data);
      if (data.ok) {
        onShowToast(`🎉 Kiểm tra CRUD CSDL thành công (${data.metrics?.totalLatencyMs}ms)! Layer đồng bộ hoạt động hoàn hảo.`);
      } else if (data.status === 'UNCONFIGURED') {
        onShowToast(`⚠️ CSDL chưa được cấu hình biến môi trường DATABASE_URL trong .env.`);
      } else {
        onShowToast(`⚠️ Lỗi kiểm tra CRUD CSDL: ${data.error}`);
      }
    } catch (err: any) {
      setResult({
        ok: false,
        status: 'ERROR',
        databaseEngine: 'Supabase / PostgreSQL',
        activeClassId,
        metrics: { writeLatencyMs: 0, readLatencyMs: 0, updateLatencyMs: 0, totalLatencyMs: 0 },
        logs: [`[CRITICAL] Request failed: ${err.message}`],
        error: err.message || 'Không thể kết nối API chẩn đoán',
      });
      onShowToast(`❌ Lỗi kết nối CSDL: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyEnvTemplate = () => {
    const envSnippet = `DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"`;
    navigator.clipboard.writeText(envSnippet);
    onShowToast('📋 Đã sao chép mẫu biến môi trường DATABASE_URL vào bộ nhớ tạm!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-primary/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Chẩn đoán Kết nối &amp; Cấu hình Supabase / PostgreSQL
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Tự động tạo 5 bảng CSDL &amp; kiểm tra độ trễ đồng bộ CRUD trực tiếp cho Lớp {activeClassId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Action trigger card */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase text-primary block">Trạng thái lớp hiện tại:</span>
              <span className="font-headline-sm text-sm font-bold text-on-surface">
                Lớp học: {activeClassId} • Môi trường Cloud / Supabase
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleInitSchema}
                disabled={isInitializingSchema || isRunning}
                className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                title="Khởi tạo tự động 5 bảng CSDL bằng SQL CREATE TABLE IF NOT EXISTS"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isInitializingSchema ? 'sync' : 'schema'}
                </span>
                <span>{isInitializingSchema ? 'Đang tạo bảng...' : '⚡ Tự Động Tạo 9 Bảng CSDL'}</span>
              </button>

              <button
                type="button"
                onClick={handleRunCrudTest}
                disabled={isRunning || isInitializingSchema}
                className="px-4 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isRunning ? 'sync' : 'play_arrow'}
                </span>
                <span>{isRunning ? 'Đang thực thi CRUD...' : 'Test CRUD CSDL'}</span>
              </button>
            </div>
          </div>

          {/* Database Schema Summary Card */}
          <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-on-surface">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[16px]">table_chart</span>
                <span>9 Bảng CSDL Tự Động Khởi Tạo Trên Supabase:</span>
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">PostgreSQL DDL</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> users
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> lesson_worksheets
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> student_submissions
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> word_cloud_entries
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> live_classroom_states
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> classes
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> students
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> curriculum_data
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-1 col-span-2 sm:col-span-1">
                <span className="text-emerald-500">✓</span> student_progress
              </div>
            </div>
          </div>

          {/* Diagnostic Metrics Display */}
          {result && (
            <div className="space-y-3 animate-in fade-in">
              {/* Overall Status Badge */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-2 ${
                  result.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : result.status === 'UNCONFIGURED'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[26px]">
                    {result.ok ? 'check_circle' : result.status === 'UNCONFIGURED' ? 'warning' : 'error'}
                  </span>
                  <div>
                    <span className="font-bold text-sm block">
                      {result.ok
                        ? '✓ KẾT NỐI & LAYER ĐỒNG BỘ CSDL HOẠT ĐỘNG HOÀN HẢO'
                        : result.status === 'UNCONFIGURED'
                        ? '⚠️ CSDL CHƯA CẤU HÌNH DATABASE_URL TRONG .ENV'
                        : '❌ LỖI KẾT NỐI CSDL'}
                    </span>
                    <span className="text-xs opacity-90 leading-tight block mt-0.5">
                      {result.error || result.databaseEngine}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-surface-container-lowest shrink-0">
                  {result.metrics?.totalLatencyMs || 0} ms
                </span>
              </div>

              {/* Guidance for UNCONFIGURED status */}
              {result.status === 'UNCONFIGURED' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300">
                    💡 Hướng dẫn kết nối Supabase CSDL đã có sẵn:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-on-surface leading-relaxed">
                    <li>Vào <strong>Supabase Dashboard &gt; Project Settings &gt; Database</strong>.</li>
                    <li>Sao chép <strong>URI Connection String</strong> (ví dụ: <code className="bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres</code>).</li>
                    <li>Mở tệp <code className="bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">.env</code> và dán vào dòng <code className="bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded font-mono">DATABASE_URL="..."</code>.</li>
                    <li>Nhấn nút <strong>"⚡ Tự Động Tạo 5 Bảng CSDL"</strong> ở trên để khởi tạo bảng tự động.</li>
                  </ol>
                  <button
                    type="button"
                    onClick={copyEnvTemplate}
                    className="self-start px-3 py-1.5 rounded-full bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 cursor-pointer flex items-center gap-1 shadow-xs mt-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Sao chép mẫu biến DATABASE_URL</span>
                  </button>
                </div>
              )}

              {/* Latency Breakdown Grid */}
              {result.ok && result.metrics && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <span className="text-on-surface-variant block font-medium">Ghi (Create)</span>
                    <strong className="text-primary text-sm font-bold">{result.metrics.writeLatencyMs} ms</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <span className="text-on-surface-variant block font-medium">Đọc (Read)</span>
                    <strong className="text-tertiary text-sm font-bold">{result.metrics.readLatencyMs} ms</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <span className="text-on-surface-variant block font-medium">Sửa (Update)</span>
                    <strong className="text-secondary text-sm font-bold">{result.metrics.updateLatencyMs} ms</strong>
                  </div>
                </div>
              )}

              {/* Execution Logs Terminal */}
              <div className="p-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-mono text-[11px] space-y-1.5 max-h-52 overflow-y-auto">
                <span className="text-emerald-400 font-bold block pb-1 border-b border-inverse-on-surface/20">
                  === LOG THỰC THI DIAGNOSTIC LOGS ===
                </span>
                {result.logs?.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs cursor-pointer shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
