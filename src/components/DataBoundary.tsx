import React from 'react';

export interface DataBoundaryProps<T = unknown> {
  /** Optional array of items fetched from the backend / CSDL */
  data?: T[] | null;
  /** Whether data is currently being fetched from the backend / CSDL */
  isLoading: boolean;
  /** Optional explicit flag whether the fetched data collection is empty */
  isEmpty?: boolean;
  /** Optional explicit state override: 'loading' | 'empty' | 'data-loaded' */
  status?: 'loading' | 'empty' | 'data-loaded';
  /** Custom message shown during loading state */
  loadingMessage?: string;
  /** Custom title shown when data is empty */
  emptyTitle?: string;
  /** Custom description shown when data is empty */
  emptyDescription?: string;
  /** Material symbol icon name for the empty state */
  emptyIcon?: string;
  /** Optional retry or action callback in empty state */
  onRetry?: () => void;
  /** Label for the retry/action button */
  retryLabel?: string;
  /** Optional extra action element in empty state */
  emptyAction?: React.ReactNode;
  /** Optional compact mode for inline sections */
  compact?: boolean;
  /** Content rendered when state is 'data-loaded' (supports render-prop or ReactNode) */
  children: React.ReactNode | ((items: T[]) => React.ReactNode);
}

/**
 * Unified DataBoundary wrapper component that manages transitions between
 * 'loading', 'empty', and 'data-loaded' states based on fetch results.
 */
export function DataBoundary<T = unknown>({
  data,
  isLoading,
  isEmpty,
  status,
  loadingMessage = 'Đang đồng bộ dữ liệu từ CSDL PostgreSQL...',
  emptyTitle = 'Chưa có dữ liệu trong hệ thống',
  emptyDescription = 'Dữ liệu hiện đang trống hoặc chưa được khởi tạo. Vui lòng nạp dữ liệu hoặc thử tải lại.',
  emptyIcon = 'database_off',
  onRetry,
  retryLabel = 'Tải lại dữ liệu',
  emptyAction,
  compact = false,
  children,
}: DataBoundaryProps<T>): React.ReactElement {
  const resolvedItems: T[] = Array.isArray(data) ? data : [];
  const computedEmpty =
    typeof isEmpty === 'boolean' ? isEmpty : Array.isArray(data) ? data.length === 0 : false;

  const effectiveState: 'loading' | 'empty' | 'data-loaded' =
    status ?? (isLoading ? 'loading' : computedEmpty ? 'empty' : 'data-loaded');

  if (effectiveState === 'loading') {
    return (
      <div
        data-testid="data-boundary-loading"
        data-state="loading"
        className={`w-full flex flex-col items-center justify-center text-center bg-white/90 border border-sky-200 rounded-2xl shadow-sm ${
          compact ? 'py-6 px-4' : 'py-12 px-6'
        }`}
      >
        <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-3 shadow-xs">
          <span className="material-symbols-outlined animate-spin text-2xl">
            progress_activity
          </span>
        </div>
        <p className="text-sm font-black text-slate-700 tracking-tight">
          {loadingMessage}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Vui lòng đợi trong giây lát...
        </p>
      </div>
    );
  }

  if (effectiveState === 'empty') {
    return (
      <div
        data-testid="data-boundary-empty"
        data-state="empty"
        className={`w-full flex flex-col items-center justify-center text-center bg-slate-50/90 border-2 border-dashed border-slate-200 rounded-2xl ${
          compact ? 'py-6 px-4' : 'py-12 px-6'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
          <span className="material-symbols-outlined text-2xl">{emptyIcon}</span>
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
          {emptyTitle}
        </h4>
        <p className="text-xs font-medium text-slate-500 max-w-md mt-1.5 leading-relaxed">
          {emptyDescription}
        </p>
        {(onRetry || emptyAction) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                {retryLabel}
              </button>
            )}
            {emptyAction}
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-testid="data-boundary-loaded" data-state="data-loaded" className="w-full">
      {typeof children === 'function' ? children(resolvedItems) : children}
    </div>
  );
}

export default DataBoundary;
