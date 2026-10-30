import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[CloudPlay OS Error Boundary Caught Error]:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleClearCacheAndReload = (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 sm:p-9 shadow-xl border border-slate-200/80 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[36px]">school</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                CloudPlay Learning OS • Tin Học THCS &amp; THPT
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Hệ thống đang tự động khôi phục kết nối
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
                Đã xảy ra sự cố khi tải giao diện hoặc đồng bộ dữ liệu. Mọi dữ liệu phiếu học tập của em đã được lưu an toàn.
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Tải lại trang</span>
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                title="Xóa cache và thiết lập lại dữ liệu"
              >
                Xóa bộ nhớ đệm
              </button>
            </div>

            {this.state.error && (
              <details className="w-full text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 mt-2">
                <summary className="cursor-pointer font-bold text-slate-700 hover:text-slate-900">
                  Chi tiết chẩn đoán lỗi kỹ thuật
                </summary>
                <pre className="mt-2 p-2 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-[10px] leading-relaxed">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
