import React from 'react';
import { 
  GraduationCap, Search, MessageCircle, Award, Shield, User, 
  Sparkles, KeyRound, Menu, X, BookOpen, Layers, Eye, LogIn, LogOut 
} from 'lucide-react';
import { Role, AuthUser } from '../types';
import { getPlatformSettings } from '../utils/storage';

interface Props {
  currentRole: Role;
  currentUser: AuthUser | null;
  isAdminUnlocked: boolean;
  onRoleChange: (role: Role) => void;
  activeNav: string;
  onNavigate: (section: string) => void;
  onOpenQuickAccess: () => void;
  onOpenTeacherGrades: () => void;
  onOpenWhatsApp: () => void;
  onOpenAuthModal: (tab?: 'student' | 'parent' | 'teacher' | 'admin') => void;
  onLogout: () => void;
  isEyeComfortMode: boolean;
  onToggleEyeComfort: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentRole,
  currentUser,
  isAdminUnlocked,
  onRoleChange,
  activeNav,
  onNavigate,
  onOpenQuickAccess,
  onOpenTeacherGrades,
  onOpenWhatsApp,
  onOpenAuthModal,
  onLogout,
  isEyeComfortMode,
  onToggleEyeComfort,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const settings = getPlatformSettings();
  const isTeacherOrAdmin = Boolean(
    currentUser?.role === 'teacher' ||
    currentUser?.role === 'admin' ||
    currentUser?.isAdmin === true ||
    (!currentUser && (currentRole === 'teacher' || currentRole === 'admin'))
  ) && currentUser?.role !== 'student' && currentUser?.role !== 'parent';

  // Only consider admin unlocked when verified with secret passcode
  const isAdminUser = Boolean(isAdminUnlocked && (currentRole === 'admin' || currentUser?.role === 'admin' || currentUser?.isAdmin));

  const roleLabels: Record<Role, { label: string; icon: string }> = {
    student: { label: 'طالب', icon: '👨‍🎓' },
    teacher: { label: 'أستاذ', icon: '👨‍🏫' },
    parent: { label: 'ولي أمر', icon: '👨‍👩‍👦' },
    admin: { label: 'لوحة التحكم', icon: '⚙️' },
  };

  const availableRoles: Role[] = ['student', 'teacher', 'parent', 'admin'];

  const navLinks = [
    { id: 'welcome', label: 'صفحة التسجيل والترحيب 🎓' },
    { id: 'teachers', label: 'الأساتذة المعتمدون' },
    { id: 'leaderboard', label: 'لوحة الشرف والتحديات' },
    { id: 'parent', label: 'بوابة أولياء الأمور' },
    ...(currentUser?.role === 'student' || currentRole === 'student' ? [{ id: 'profile', label: 'ملف الطالب 👨‍🎓' }] : []),
    ...(isAdminUnlocked ? [{ id: 'admin', label: 'لوحة التحكم 👑' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-right shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Slogan */}
          <div 
            onClick={() => onNavigate('teachers')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">{settings.platformName}</span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                  {settings.platformBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{settings.platformSlogan}</p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeNav === link.id
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Quick Access, Actions, Login */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Eye comfort background toggle */}
            <button
              onClick={onToggleEyeComfort}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                isEyeComfortMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="تفعيل وضع راحة العين والخلفية الهادئة"
            >
              <Eye className="w-4 h-4 text-amber-600" />
              <span className="text-[11px]">راحة العين</span>
            </button>

            {/* Quick Access trigger button (Visible to Teacher & Supervisor only) */}
            {isTeacherOrAdmin && (
              <button
                onClick={onOpenQuickAccess}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="الوصول السريع لأي قسم في أقل من ثانية"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>الوصول السريع ⚡</span>
              </button>
            )}

            {/* Prominent Teacher Grade Upload Button (Teacher & Admin Only) */}
            {isTeacherOrAdmin && (
              <button
                onClick={onOpenTeacherGrades}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 hover:shadow"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>رفع درجات أولياء الأمور (خاص بالمعلم)</span>
              </button>
            )}

            {/* WhatsApp Direct Support */}
            <button
              onClick={onOpenWhatsApp}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>الدعم الفني</span>
            </button>

            {/* Login / User Session */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 py-1 px-2.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-right cursor-pointer"
                  title="عرض الملف الشخصي وحالة الطالب"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      (currentUser.status || 'active') === 'active'
                        ? 'bg-emerald-500'
                        : currentUser.status === 'pending'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-bold text-blue-900 max-w-[120px] truncate">{currentUser.name}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                      (currentUser.status || 'active') === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentUser.status === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(currentUser.status || 'active') === 'active'
                      ? 'نشط'
                      : currentUser.status === 'pending'
                      ? 'قيد المراجعة'
                      : 'موقوف'}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors mr-1"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('teacher')}
                  className="px-3 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="تسجيل دخول الأساتذة الخاص"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>دخول الأساتذة 👨‍🏫</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal('student')}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            )}

            {/* Role Switcher Pill (Visible only after admin unlock) */}
            {isAdminUnlocked && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {availableRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      currentRole === r
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`التبديل إلى وضع ${roleLabels[r].label}`}
                  >
                    <span>{roleLabels[r].icon}</span>
                    <span className="text-[11px]">{roleLabels[r].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onOpenAuthModal('teacher')}
              className="p-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
              title="دخول الأساتذة"
            >
              <Award className="w-4 h-4 text-amber-300" />
            </button>
            <button
              onClick={() => onOpenAuthModal('student')}
              className="p-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black"
              title="تسجيل الدخول"
            >
              <LogIn className="w-4 h-4" />
            </button>
            {isTeacherOrAdmin && (
              <button
                onClick={onOpenTeacherGrades}
                className="p-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
                title="رفع درجات أولياء الأمور (خاص بالمعلم)"
              >
                <Award className="w-4 h-4 text-amber-300" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right p-2.5 rounded-lg text-xs font-bold ${
                  activeNav === link.id ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {isAdminUnlocked && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-amber-600">تبديل دور المستخدم (صلاحية المنشئ):</div>
              <div className="grid grid-cols-2 gap-1.5">
                {availableRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      currentRole === r ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{roleLabels[r].icon}</span>
                    <span>وضع {roleLabels[r].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAuthModal('teacher');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-300" />
              دخول الأساتذة 👨‍🏫
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenAuthModal('student');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-black flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول (طالب / ولي أمر)
              </button>
              <button
                onClick={() => {
                  onToggleEyeComfort();
                }}
                className="p-2.5 bg-slate-100 rounded-lg text-xs"
                title="راحة العين"
              >
                <Eye className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
