import React, { useState } from 'react';
import { 
  User, Users, Phone, CheckCircle2, Sparkles, GraduationCap, 
  BookOpen, Award, Shield, Lock, Eye, EyeOff, KeyRound, HeartHandshake
} from 'lucide-react';
import { AuthUser, Teacher } from '../types';

interface Props {
  onRegisterStudent: (user: AuthUser) => void;
  onOpenTeacherLogin: () => void;
  onOpenParentLogin: () => void;
  onOpenAdminLogin: () => void;
  onSkipAsGuest: () => void;
  teachers: Teacher[];
}

export const InitialRegistrationView: React.FC<Props> = ({
  onRegisterStudent,
  onOpenTeacherLogin,
  onOpenParentLogin,
  onOpenAdminLogin,
  onSkipAsGuest,
  teachers,
}) => {
  const [studentName, setStudentName] = useState('عمر خالد المنشاوي');
  const [studentPhone, setStudentPhone] = useState('+201099887766');
  const [studentPassword, setStudentPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [parentName, setParentName] = useState('خالد المنشاوي');
  const [parentPhone, setParentPhone] = useState('+201012345678');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setFormError('اسم الطالب إجباري');
      return;
    }
    if (!studentPhone.trim()) {
      setFormError('رقم هاتف الطالب إجباري');
      return;
    }
    if (!studentPassword.trim()) {
      setFormError('كلمة المرور إجبارية لحماية حساب الطالب');
      return;
    }
    if (!parentName.trim()) {
      setFormError('اسم ولي الأمر إجباري');
      return;
    }
    if (!parentPhone.trim()) {
      setFormError('رقم هاتف ولي الأمر إجباري');
      return;
    }

    setFormError(null);
    const newUser: AuthUser = {
      role: 'student',
      name: studentName.trim(),
      phone: studentPhone.trim(),
      password: studentPassword.trim(),
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      studentCode: 'ST-101',
    };
    onRegisterStudent(newUser);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-500/30 text-right animate-in fade-in duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Top Header & Welcome */}
        <div className="text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بوابة التسجيل والالتحاق الأولى 🎓</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                منصة نغمة العلم التعليمية الذكية
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTeacherLogin}
              className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>دخول الأساتذة 👨‍🏫</span>
            </button>

            <button
              onClick={onOpenParentLogin}
              className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span>بوابة أولياء الأمور 👨‍👩‍👦</span>
            </button>
          </div>
        </div>

        {/* Intro Text */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-bold mb-0.5">
              مرحباً بك في منظومة التعلم الذكية!
            </strong>
            يرجى تسجيل بياناتك وبيانات ولي أمرك (الاسم ورقم الهاتف لكلاكما) للربط المباشر مع المنصة، واستلام كروت التفعيل وتقارير الدرجات الشهرية وشهادات التقدير الرسمية فوراً.
          </div>
        </div>

        {/* The 5 Core Student Registration Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Student Name */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>1. اسم الطالب الرباعي</span>
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="مثال: عمر خالد المنشاوي"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:border-amber-400 text-white font-bold placeholder-slate-500"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                يُطبع هذا الاسم على شهادات التقدير ولوحة الشرف الرسمية.
              </span>
            </div>

            {/* 2. Student Phone */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>2. رقم هاتف الطالب (واتساب)</span>
                </span>
                <span className="text-[10px] bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
              </label>
              <input
                type="tel"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="+201099887766"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-400 text-white font-mono text-left dir-ltr placeholder-slate-500"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                رقم التواصل الرسمي لاستلام إشعارات الحصص المباشرة.
              </span>
            </div>

            {/* 3. Student Password (NEW - MANDATORY) */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-yellow-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-yellow-400" />
                  <span>3. كلمة مرور حساب الطالب</span>
                </span>
                <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="اكتب كلمة مرور قوية لحماية حسابك (مثال: 123456)"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 pl-10 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:border-yellow-400 text-white font-mono placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block">
                تُستخدم لتسجيل دخولك الآمن لمتابعة الفيديوهات واجتياز الامتحانات.
              </span>
            </div>

            {/* 4. Parent Name */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>4. اسم ولي الأمر</span>
                </span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="مثال: خالد المنشاوي"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-400 text-white font-bold placeholder-slate-500"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                لربط ملف المتابعة الأكاديمية بحساب ولي الأمر الرسمي.
              </span>
            </div>

            {/* 5. Parent Phone */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>5. رقم هاتف ولي الأمر (واتساب)</span>
                </span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+201012345678"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-400 text-white font-mono text-left dir-ltr placeholder-slate-500"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                لإرسال تقارير الدرجات ونسب الحضور فورياً عبر واتساب.
              </span>
            </div>
          </div>

          {/* Quick Trial Samples */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span>نماذج سريعة للتجربة:</span>
              <button
                type="button"
                onClick={() => {
                  setStudentName('عمر خالد المنشاوي');
                  setStudentPhone('+201099887766');
                  setStudentPassword('123456');
                  setParentName('خالد المنشاوي');
                  setParentPhone('+201012345678');
                }}
                className="text-amber-400 hover:underline font-bold"
              >
                عمر وخالد
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setStudentName('سارة إبراهيم القاضي');
                  setStudentPhone('+201055443322');
                  setStudentPassword('654321');
                  setParentName('إبراهيم القاضي');
                  setParentPhone('+201088776655');
                }}
                className="text-amber-400 hover:underline font-bold"
              >
                سارة وإبراهيم
              </button>
            </div>

            <button
              type="button"
              onClick={onSkipAsGuest}
              className="text-slate-400 hover:text-white underline text-xs transition-colors"
            >
              تخطي والتصفح كزائر مؤقتاً 👁️
            </button>
          </div>

          {/* Submit Registration Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              حفظ التسجيل والالتحاق بمنصة نغمة العلم 🎓
            </button>
          </div>
        </form>

        {/* Discreet Admin Login at bottom */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            بياناتك مشفرة ومحفوظة بأمان محلياً.
          </span>
          <button
            onClick={onOpenAdminLogin}
            className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1"
            title="بوابة إدارة المنظومة الخاصة"
          >
            <Lock className="w-3 h-3" />
            <span>دخول المنشئ 🔒</span>
          </button>
        </div>
      </div>
    </div>
  );
};
