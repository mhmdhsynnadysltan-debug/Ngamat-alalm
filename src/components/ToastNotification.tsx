import React, { useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles, 
  X, Video, Award, ArrowLeft, Trophy 
} from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'milestone';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number; // ms, default 7000
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotificationContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  return (
    <div 
      dir="rtl" 
      className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] sm:w-[420px] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastSingle key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastSingle: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 7000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          progress: 'bg-emerald-400',
          badgeBg: 'bg-emerald-500/30 text-emerald-300',
        };
      case 'warning':
      case 'error':
        return {
          bg: 'bg-rose-950/95 border-rose-500/50 text-rose-100',
          iconBg: 'bg-rose-500/20 text-rose-400',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
          progress: 'bg-rose-500',
          badgeBg: 'bg-rose-500/30 text-rose-200',
        };
      case 'milestone':
        return {
          bg: 'bg-gradient-to-br from-amber-950/95 via-slate-900/95 to-yellow-950/95 border-amber-400/60 text-amber-100 shadow-amber-500/20',
          iconBg: 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40',
          icon: <Trophy className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />,
          progress: 'bg-gradient-to-r from-amber-400 to-yellow-300',
          badgeBg: 'bg-amber-400/30 text-amber-200',
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border-blue-500/50 text-blue-100',
          iconBg: 'bg-blue-500/20 text-blue-400',
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          progress: 'bg-blue-400',
          badgeBg: 'bg-blue-500/30 text-blue-200',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto rounded-2xl border shadow-2xl p-4 transition-all duration-300 animate-in slide-in-from-bottom-5 backdrop-blur-md relative overflow-hidden flex flex-col gap-2.5 ${style.bg}`}
      role="alert"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
            {style.icon}
          </div>
          <div>
            <h4 className="text-sm font-black leading-tight flex items-center gap-2">
              <span>{toast.title}</span>
              {toast.type === 'milestone' && (
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                  إنجاز 🌟
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-200/90 leading-relaxed mt-1 font-medium">
              {toast.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
          title="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action button if provided */}
      {toast.actionText && toast.onAction && (
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={() => {
              toast.onAction?.();
              onDismiss(toast.id);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            {toast.type === 'warning' || toast.type === 'error' ? (
              <Video className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{toast.actionText}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Auto-dismiss countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <div 
          className={`h-full ${style.progress} animate-pulse`} 
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};
