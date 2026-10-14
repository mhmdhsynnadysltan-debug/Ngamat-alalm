import React, { useState } from 'react';
import { 
  User, Shield, KeyRound, CheckCircle2, GraduationCap, 
  Users, Award, ArrowLeft, Sparkles, X, Phone, Lock, Eye, EyeOff 
} from 'lucide-react';
import { Role, Teacher, AuthUser } from '../types';
import { verifyAdminSecretCode } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  defaultTab?: 'student' | 'parent' | 'teacher' | 'admin';
  onLoginSuccess: (user: AuthUser) => void;
  onOpenAdminWithPassword: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  teachers,
  defaultTab = 'student',
  onLoginSuccess,
  onOpenAdminWithPassword,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'teacher' | 'admin'>(defaultTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Student fields (الاسم والرقم وكلمة المرور واسم ولي الأمر ورقمه - جميعها إجبارية)
  const [studentName, setStudentName] = useState('عمر خالد المنشاوي');
  const [studentPhone, setStudentPhone] = useState('+201099887766');
  const [studentPassword, setStudentPassword] = useState('123456');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [parentName, setParentName] = useState('خالد المنشاوي');
  const [parentPhoneForStudent, setParentPhoneForStudent] = useState('+201012345678');
  const [studentError, setStudentError] = useState<string | null>(null);

  // Parent fields
  const [parentStudentCode, setParentStudentCode] = useState('ST-101');
  const [parentPhone, setParentPhone] = useState('+201012345678');

  // Teacher fields
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || 't-1');
  const [teacherPin, setTeacherPin] = useState('1234');


  // Admin field
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim() || !studentPassword.trim() || !parentName.trim() || !parentPhoneForStudent.trim()) {
      setStudentError('جميع الحقول إجبارية: اسم الطالب، رقم الهاتف، كلمة المرور، اسم ولي الأمر، ورقم هاتفه.');
      return;
    }
    setStudentError(null);
    const user: AuthUser = {
      role: 'student',
      name: studentName.trim(),
      phone: studentPhone.trim(),
      password: studentPassword.trim(),
      parentName: parentName.trim(),
      parentPhone: parentPhoneForStudent.trim(),
      studentCode: 'ST-101',
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: AuthUser = {
      role: 'parent',
      name: `ولي أمر (${parentStudentCode})`,
      phone: parentPhone.trim() || '+201000000000',
      studentCode: parentStudentCode.trim() || 'ST-101',
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
    const user: AuthUser = {
      role: 'teacher',
      name: targetTeacher.name,
      phone: targetTeacher.phone,
      selectedTeacherId: targetTeacher.id,
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminSecretCode(adminPassword)) {
      const user: AuthUser = {
        role: 'admin',
        name: 'مدير المنظومة (المنشئ)',
        phone: '+201012345678',
      };
      onLoginSuccess(user);
      onClose();
    } else {
      setAdminError('الرمز السري غير صحيح. يرجى إدخال الرمز الخاص بالمنشئ.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">بوابة تسجيل الدخول الموحدة</h2>
              <p className="text-xs text-slate-300">منصة نغمة العلم التعليمية الذكية 🎓</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'student' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍🎓</span>
            <span>طالب</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'parent' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍👩‍👦</span>
            <span>ولي أمر</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'teacher' ? 'bg-white text-blue-900 shadow-xs ring-1 ring-blue-500/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍🏫</span>
            <span>الأساتذة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
              activeTab === 'admin' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="بوابة المنشئ السرية"
          >
            <span>🔒</span>
            <span>المنشئ</span>
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 space-y-4">
          {/* STUDENT REGISTRATION & LOGIN */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              {studentError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3 text-xs text-blue-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold mb-0.5">تسجيل بيانات الطالب وكلمة المرور وولي الأمر:</strong>
                  سجّل بياناتك وبيانات ولي أمرك وكلمة المرور (جميعها إجبارية) للربط المباشر واستلام التقارير وشهادات التقدير.
                </div>
              </div>

              {/* Student Details */}
              <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>بيانات الطالب:</span>
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full font-bold">إجباري</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="مثال: عمر خالد المنشاوي"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم هاتف الطالب (واتساب) *</label>
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="+201099887766"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 font-mono text-left dir-ltr"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">كلمة مرور حساب الطالب *</label>
                  <div className="relative">
                    <input
                      type={showStudentPassword ? 'text' : 'password'}
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="كلمة مرور لحماية الحساب (مثال: 123456)"
                      className="w-full text-xs px-3 py-2 pl-9 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showStudentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/70 space-y-3">
                <span className="text-[11px] font-black text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>بيانات ولي الأمر (لإرسال التقارير والدرجات):</span>
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full font-bold">إجباري</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم ولي الأمر *</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="مثال: خالد المنشاوي"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم هاتف ولي الأمر (واتساب) *</label>
                    <input
                      type="tel"
                      value={parentPhoneForStudent}
                      onChange={(e) => setParentPhoneForStudent(e.target.value)}
                      placeholder="+201012345678"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-mono text-left dir-ltr"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <span className="text-[11px]">نماذج سريعة للتجربة:</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentName('عمر خالد المنشاوي');
                    setStudentPhone('+201099887766');
                    setParentName('خالد المنشاوي');
                    setParentPhoneForStudent('+201012345678');
                  }}
                  className="text-blue-700 font-bold hover:underline text-[11px]"
                >
                  عمر وخالد
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentName('سارة إبراهيم القاضي');
                    setStudentPhone('+201055443322');
                    setParentName('إبراهيم القاضي');
                    setParentPhoneForStudent('+201088776655');
                  }}
                  className="text-blue-700 font-bold hover:underline text-[11px]"
                >
                  سارة وإبراهيم
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                حفظ التسجيل ودخول منصة نغمة العلم 🎓
              </button>
            </form>
          )}

          {/* PARENT LOGIN */}
          {activeTab === 'parent' && (
            <form onSubmit={handleParentSubmit} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                بوابة ولي الأمر: ادخل كود الطالب لمتابعة نتائج الامتحانات ونسبة الحضور وملاحظات المعلم فوراً.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود الطالب / رقم الجلوس</label>
                <input
                  type="text"
                  value={parentStudentCode}
                  onChange={(e) => setParentStudentCode(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold text-center uppercase"
                  placeholder="ST-101"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف ولي الأمر (واتساب)</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-left dir-ltr"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>أكواد تجريبية:</span>
                {['ST-101', 'ST-102', 'ST-201', 'ST-301'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setParentStudentCode(c)}
                    className="font-mono font-bold text-emerald-700 hover:underline"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                عرض تقرير درجات الطالب لولي الأمر
              </button>
            </form>
          )}

          {/* TEACHER LOGIN */}
          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-center justify-between">
                <span>بوابة دخول المدرسين المعتمدين 👩‍🏫</span>
                <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-amber-300">
                  تحكم كامل في الدرجات والأكواد
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  اختر حساب الأستاذ للدخول المباشر:
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                  {teachers.map((t) => {
                    const isSelected = selectedTeacherId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTeacherId(t.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-2xs ring-1 ring-blue-500/30'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-900 truncate">{t.name}</h4>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                              {t.subject}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{t.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرمز السري (PIN)</label>
                  <input
                    type="password"
                    value={teacherPin}
                    onChange={(e) => setTeacherPin(e.target.value)}
                    className="w-full text-center font-mono text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden font-bold"
                    placeholder="1234"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setTeacherPin('1234')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    تجربة برمز 1234
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>دخول حساب الأستاذ المختار ({teachers.find((t) => t.id === selectedTeacherId)?.name.split(' ')[0] || 'المعلم'})</span>
              </button>
            </form>
          )}

          {/* ADMIN LOGIN (SECRET PASSCODE) */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-slate-950 text-white rounded-2xl p-3.5 text-xs flex items-center gap-2.5 border border-slate-800">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="leading-relaxed">منطقة المنشئ والأدمن محمية برمز سري خاص لا يعلمه غيرك.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">أدخل الرمز السري الخاص بك:</label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError(null);
                    }}
                    className="w-full text-center font-mono text-xl font-bold tracking-widest px-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-slate-950/20"
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    title={showAdminPassword ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-bold">
                  {adminError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>تأكيد الدخول للوحة التحكم</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            متابعة التصفح السريع كزائر
          </button>
        </div>
      </div>
    </div>
  );
};
