import React from 'react';
import { Sparkles, Award, Lock, BookOpen, MessageCircle, KeyRound, ChevronDown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { AuthUser, Role } from '../types';

interface Props {
  onBrowseCourses: () => void;
  onOpenTeacherGrades: () => void;
  onOpenQuickAccess: () => void;
  onOpenWhatsApp: (topic?: string) => void;
  onOpenTeacherLogin?: () => void;
  currentUser?: AuthUser | null;
  currentRole?: Role;
}

export const HeroSection: React.FC<Props> = ({
  onBrowseCourses,
  onOpenTeacherGrades,
  onOpenQuickAccess,
  onOpenWhatsApp,
  onOpenTeacherLogin,
  currentUser,
  currentRole,
}) => {
  // Only show for Teacher and Admin (المعلم والادمن فقط)
  // Strictly hide from students and parents
  const isTeacherOrAdmin = Boolean(
    currentUser?.role === 'teacher' ||
    currentUser?.role === 'admin' ||
    currentUser?.isAdmin === true ||
    (!currentUser && (currentRole === 'teacher' || currentRole === 'admin'))
  ) && currentUser?.role !== 'student' && currentUser?.role !== 'parent';
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800 text-right">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-6">
        {/* Slogan Pill / Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>منظومة نغمة العلم التعليمية الذكية 🎓</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </div>

        {/* Famous Quote */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            "طلب العلم كالنقش على الحجر،<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-400">
              وكل خطوة تخطوها اليوم هي لحن تفوقك في الغد."
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            منظومة تعليمية متطورة لجميع المراحل (الابتدائية، الإعدادية، والثانوية) تضمن التزام الطالب ومتابعة مستواه الدراسي الدقيق، مع نظام القفل المتسلسل وبوابة مباشرة لرفع درجات أولياء الأمور تحت إشراف نخبة من أفضل المعلمين المعتمدين.
          </p>
        </div>

        {/* Primary Action Buttons (100% functional) */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onBrowseCourses}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            تصفح الكورسات والمراحل الدراسية
          </button>

          {onOpenTeacherLogin && currentUser?.role !== 'student' && currentUser?.role !== 'teacher' && currentUser?.role !== 'admin' && (
            <button
              onClick={onOpenTeacherLogin}
              className="px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-blue-400/30 shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-300" />
              بوابة دخول الأساتذة 👨‍🏫
            </button>
          )}

          {/* Button 3: رفع درجات أولياء الأمور - خاص بالمعلم والأدمن فقط */}
          {isTeacherOrAdmin && (
            <button
              onClick={onOpenTeacherGrades}
              className="px-5 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-bold rounded-xl border border-blue-400/40 shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
              title="خاص بالمعلم والأدمن فقط: رفع تقارير درجات أولياء الأمور"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>رفع درجات أولياء الأمور (خاص بالمعلم والأدمن) 📊</span>
            </button>
          )}

          {/* Quick Access - Visible to Teacher and Supervisor only as requested */}
          {isTeacherOrAdmin && (
            <button
              onClick={onOpenQuickAccess}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              الوصول السريع ⚡
            </button>
          )}
        </div>

        {/* Platform Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>القفل المتسلسل</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              لا يُفتح الدرس التالي إلا بعد اجتياز كويز الدرس السابق بنجاح.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>تقارير أولياء الأمور</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              رصد وإرسال الدرجات الشهرية ونسبة الحضور مباشرة عبر واتساب.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>أكواد التفعيل</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              تأمين كامل للكورسات وحماية للمحتوى التعليمي بأعلى معايير الجودة.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>دعم واتساب 24/7</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              تواصل دائم ومباشر لحل أي استفسار أو مشكلة تقنية في لحظات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
