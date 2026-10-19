import React from 'react';
import { Compass, Home, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onGoHome: () => void;
  onBrowseTeachers?: () => void;
}

export const NotFoundView: React.FC<Props> = ({ onGoHome, onBrowseTeachers }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 text-right" dir="rtl">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in">
        {/* Visual 404 Badge */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-indigo-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-inner">
            <Compass className="w-12 h-12 text-amber-500 animate-spin-slow" />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-slate-900 text-amber-400 text-xs font-black px-2.5 py-1 rounded-full border border-slate-700 shadow-md">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            الصفحة المطلوبة غير موجودة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            ربما تم نقل هذا الرابط أو لم يعد متاحاً. يمكنك العودة مباشرة إلى الصفحة الرئيسية لمتابعة الكورسات والدروس.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية 🏠</span>
          </button>

          {onBrowseTeachers && (
            <button
              onClick={onBrowseTeachers}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>دليل الأساتذة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
