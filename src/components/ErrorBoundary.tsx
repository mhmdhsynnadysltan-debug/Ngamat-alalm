import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans text-right" dir="rtl">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                عذراً، حدث خطأ غير متوقع
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                لا تقلق، بياناتك ودرجاتك في أمان تام. واجه النظام مشكلة مؤقتة في معالجة هذه الصفحة.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل المنصة</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>الرئيسية</span>
              </button>
            </div>

            {/* Collapsible Error Info for Debugging */}
            {this.state.error && (
              <details className="text-[11px] text-slate-500 text-left dir-ltr bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 cursor-pointer">
                <summary className="font-mono text-slate-400 hover:text-slate-200 cursor-pointer text-right dir-rtl">
                  تفاصيل الخطأ التقني (للمطورين)
                </summary>
                <p className="mt-2 text-rose-400 font-mono break-all text-xs">
                  {this.state.error.toString()}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
