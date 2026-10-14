import React, { useState } from 'react';
import { 
  GraduationCap, User, Users, Phone, KeyRound, Eye, EyeOff, 
  CheckCircle2, Sparkles, Award, Shield, BookOpen, Clock, 
  MessageCircle, ArrowLeft, Star, HeartHandshake, Lock, Compass,
  Check, FileCheck, HelpCircle
} from 'lucide-react';
import { AuthUser, Teacher } from '../types';
import { getPlatformSettings, addOrUpdateStudent } from '../utils/storage';

interface Props {
  onRegisterStudent: (user: AuthUser) => void;
  onOpenTeacherLogin: () => void;
  onOpenParentLogin: () => void;
  onOpenAdminLogin: () => void;
  teachers?: Teacher[];
}

export const WelcomeRegistrationPage: React.FC<Props> = ({
  onRegisterStudent,
  onOpenTeacherLogin,
  onOpenParentLogin,
  onOpenAdminLogin,
  teachers = [],
}) => {
  const [settings] = useState(getPlatformSettings());
  const [activeTab, setActiveTab] = useState<'register' | 'quickLogin'>('register');

  // Registration Form State
  const [studentName, setStudentName] = useState('عمر خالد المنشاوي');
  const [studentPhone, setStudentPhone] = useState('+201099887766');
  const [studentPassword, setStudentPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [parentName, setParentName] = useState('خالد المنشاوي');
  const [parentPhone, setParentPhone] = useState('+201012345678');
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Login State
  const [loginPhone, setLoginPhone] = useState('+201099887766');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setFormError('يرجى كتابة اسم الطالب الرباعي (إجباري)');
      return;
    }
    if (!studentPhone.trim()) {
      setFormError('يرجى كتابة رقم هاتف الطالب (إجباري)');
      return;
    }
    if (!studentPassword.trim()) {
      setFormError('يرجى تحديد كلمة المرور لحماية الحساب (إجباري)');
      return;
    }
    if (!parentName.trim()) {
      setFormError('يرجى كتابة اسم ولي الأمر (إجباري)');
      return;
    }
    if (!parentPhone.trim()) {
      setFormError('يرجى كتابة رقم هاتف ولي الأمر لاستلام التقارير (إجباري)');
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
      studentCode: 'ST-' + Math.floor(100 + Math.random() * 900),
    };
    addOrUpdateStudent(newUser);
    onRegisterStudent(newUser);
  };

  const handleQuickLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setFormError('يرجى كتابة رقم الهاتف المسجل أو كود الطالب');
      return;
    }
    if (!loginPassword.trim()) {
      setFormError('يرجى إدخال كلمة المرور');
      return;
    }

    setFormError(null);
    const loggedUser: AuthUser = {
      role: 'student',
      name: studentName.trim() || 'الطالب المسجل',
      phone: loginPhone.trim(),
      password: loginPassword.trim(),
      parentName: parentName.trim() || 'ولي الأمر',
      parentPhone: parentPhone.trim() || '+201012345678',
      studentCode: 'ST-101',
    };
    onRegisterStudent(loggedUser);
  };

  const applyDemoData = (sName: string, sPhone: string, sPass: string, pName: string, pPhone: string) => {
    setStudentName(sName);
    setStudentPhone(sPhone);
    setStudentPassword(sPass);
    setParentName(pName);
    setParentPhone(pPhone);
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden text-right font-sans">
      {/* Background ambient radial gradients & lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-20 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-20 right-10 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '32px 32px' }} 
        />
      </div>

      {/* Top Standalone Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <GraduationCap className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight">{settings.platformName}</span>
                <span className="text-[11px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-2 py-0.5 rounded-full">
                  {settings.platformBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{settings.platformSlogan}</p>
            </div>
          </div>

          {/* Quick External Portals Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenTeacherLogin}
              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>دخول الأساتذة 👨‍🏫</span>
            </button>

            <button
              onClick={onOpenParentLogin}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>بوابة أولياء الأمور 👨‍👩‍👦</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Welcome & Registration Together */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Welcome Banner: المقدمة الترحيبية الشاملة */}
        <section className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          {/* Creator entry via 'أهلاً ومرحباً في نغمة العلم' with password 2035 */}
          <div>
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-yellow-500/25 border-2 border-amber-400/60 hover:border-amber-300 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
              title="دخول المنشئ بكلمة مرور (2035)"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse group-hover:rotate-12 transition-transform" />
              <span>أهلاً ومرحباً في نغمة العلم ✨</span>
              <Lock className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-300 transition-colors" />
              <span className="text-[10px] bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full font-bold border border-amber-400/40">
                دخول المنشئ 🔒
              </span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {settings.welcomeTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {settings.welcomeDescription}
          </p>
        </section>

        {/* 4 Feature Cards introducing the platform highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-6xl mx-auto mb-10">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 hover:border-amber-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">نخبة الأساتذة المعتمدين</h3>
              <p className="text-[11px] text-slate-400 leading-snug">شروحات فيديو تفاعلية ومذكرات نموذجية لكل مادة دراسية.</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 hover:border-blue-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">شهادات تقدير رقمية فورية</h3>
              <p className="text-[11px] text-slate-400 leading-snug">تحميل فوري لشهادة التفوق الرسمية فور إتمام جميع محاضرات الكورس.</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 hover:border-emerald-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">متابعة دقيقة لولي الأمر</h3>
              <p className="text-[11px] text-slate-400 leading-snug">إشعارات وتقارير درجات شهرية ترسل لولي الأمر مباشرة عبر واتساب.</p>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 hover:border-yellow-400/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0 border border-yellow-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">أمان وحساب مشفر</h3>
              <p className="text-[11px] text-slate-400 leading-snug">كلمة مرور خاصة لحساب الطالب مع نظام القفل المتسلسل للمحاضرات.</p>
            </div>
          </div>
        </div>

        {/* Central Registration / Login Card (صفحة التسجيل لوحدها مع المقدمة) */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-amber-500/5 relative overflow-hidden">
          {/* Card subtle top glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>تسجيل طالب جديد (الاسم والرقم إجباري) ✍️</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quickLogin')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'quickLogin'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>دخول سريع بحساب مسجل 🔑</span>
            </button>
          </div>

          {/* Validation Feedback */}
          {formError && (
            <div className="mb-5 bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2.5 animate-shake">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span className="font-bold">{formError}</span>
            </div>
          )}

          {activeTab === 'register' ? (
            /* TAB 1: FULL STUDENT REGISTRATION */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Student Full Name (Required) */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-amber-400 transition-colors">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. اسم الطالب الرباعي</span>
                    </span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="مثال: عمر خالد المنشاوي"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-amber-400 text-white font-bold placeholder-slate-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    يُطبع رسمياً على شهادات التقدير المعتمدة ولوحة الشرف.
                  </span>
                </div>

                {/* 2. Student Phone (Required) */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-blue-400 transition-colors">
                  <label className="text-xs font-bold text-blue-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>2. رقم هاتف الطالب (واتساب)</span>
                    </span>
                    <span className="text-[10px] bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
                  </label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="+201099887766"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-blue-400 text-white font-mono text-left dir-ltr placeholder-slate-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    رقم هاتف الطالب الأساسي للتواصل وإشعارات الحصص.
                  </span>
                </div>

                {/* 3. Student Password (Required) */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-yellow-400 transition-colors sm:col-span-2">
                  <label className="text-xs font-bold text-yellow-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                      <span>3. كلمة مرور حساب الطالب</span>
                    </span>
                    <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="اكتب كلمة مرور قوية (مثال: 123456)"
                      className="w-full text-xs sm:text-sm px-3 py-2 pl-10 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-yellow-400 text-white font-mono placeholder-slate-500"
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
                    لحماية حسابك ومتابعة تقدمك في الفيديوهات والاختبارات بأمان تام.
                  </span>
                </div>

                {/* 4. Parent Name (Required) */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-emerald-400 transition-colors">
                  <label className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>4. اسم ولي الأمر</span>
                    </span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="مثال: خالد المنشاوي"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-emerald-400 text-white font-bold placeholder-slate-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    لربط ملف المتابعة الأكاديمية وبوابة أولياء الأمور.
                  </span>
                </div>

                {/* 5. Parent Phone (Required) */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-emerald-400 transition-colors">
                  <label className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>5. رقم هاتف ولي الأمر (واتساب)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">إجباري *</span>
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-emerald-400 text-white font-mono text-left dir-ltr placeholder-slate-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    لإرسال درجات الاختبارات وكشف المتابعة فورياً عبر واتساب.
                  </span>
                </div>
              </div>

              {/* Quick Demo Fill Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>نماذج سريعة للتجربة:</span>
                  <button
                    type="button"
                    onClick={() => applyDemoData('عمر خالد المنشاوي', '+201099887766', '123456', 'خالد المنشاوي', '+201012345678')}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    عمر وخالد
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => applyDemoData('سارة إبراهيم القاضي', '+201055443322', '654321', 'إبراهيم القاضي', '+201088776655')}
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

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/10 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>حفظ التسجيل والالتحاق بمنصة نغمة العلم 🎓</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: QUICK LOGIN FOR REGISTERED STUDENTS */
            <form onSubmit={handleQuickLoginSubmit} className="space-y-4">
              <div className="space-y-3.5">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-blue-400 transition-colors">
                  <label className="text-xs font-bold text-blue-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>رقم الهاتف المسجل أو كود الطالب</span>
                    </span>
                    <span className="text-[10px] text-slate-400">مثال: +201099887766 أو ST-101</span>
                  </label>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="+201099887766 أو ST-101"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-blue-400 text-white font-mono dir-ltr placeholder-slate-500"
                    required
                  />
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 focus-within:border-amber-400 transition-colors">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>كلمة المرور</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setLoginPassword('123456')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      تجربة الكلمة الافتراضية (123456)
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 pl-10 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-amber-400 text-white font-mono placeholder-slate-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>دخول مباشر لمتابعة الكورسات 🚀</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  طالب جديد؟ اضغط هنا لإنشاء حساب وتسجيل بياناتك
                </button>
              </div>
            </form>
          )}

          {/* Discreet Admin Login at bottom (رمز المنشئ المخفي 2035) */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>بياناتك مسجلة بأمان تام في المنظومة.</span>
            </span>
            <button
              onClick={onOpenAdminLogin}
              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
              title="بوابة إدارة المنظومة الخاصة بالمنشئ"
            >
              <Lock className="w-3 h-3 text-amber-400/70" />
              <span>دخول المنشئ 🔒</span>
            </button>
          </div>
        </div>

        {/* Platform stats summary strip */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-xl font-black text-amber-400">+15,000</span>
            <span className="text-[11px] text-slate-400">طالب وطالبة متفوقين</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-xl font-black text-blue-400">+120</span>
            <span className="text-[11px] text-slate-400">محاضرة تفاعلية مؤمنة</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-xl font-black text-emerald-400">100%</span>
            <span className="text-[11px] text-slate-400">متابعة دقيقة لولي الأمر</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-xl font-black text-yellow-400">معتمدة</span>
            <span className="text-[11px] text-slate-400">شهادات تقدير رقمية فورية</span>
          </div>
        </div>
      </main>

      {/* Standalone Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-4 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 منصة نغمة العلم التعليمية الذكية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>نظام القفل المتسلسل</span>
            <span>·</span>
            <span>أكواد التفعيل المطبوعة</span>
            <span>·</span>
            <span>شهادات التقدير الرسمية</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
