import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, KeyRound, BookOpen, Users, Award, 
  Settings, CheckCircle, Search, Sparkles, RefreshCw, Layers, 
  FileText, Shield, Save, Eye, EyeOff, Lock, Check, Phone,
  GraduationCap, Bell, Megaphone, UserPlus, Star, ChevronDown,
  Globe, AlertCircle, FileCheck, Sliders, Smartphone, Palette, Image as ImageIcon,
  UserCheck, UserX, Clock, AlertOctagon, Filter
} from 'lucide-react';
import { 
  Course, Teacher, ActivationCode, StudentGradeRecord, 
  ActivatedCodeLog, LeaderboardStudent, AuthUser, EducationalStage, StudentStatus 
} from '../types';
import { 
  getStoredCourses, saveStoredCourses, 
  getStoredActivationCodes, saveStoredActivationCodes, 
  getStoredTeachers, saveStoredTeachers, 
  getStoredGradeRecords, saveStoredGradeRecords,
  getStoredActivationLogs, saveStoredActivationLogs,
  getStoredLeaderboard, saveStoredLeaderboard,
  getAdminSecretCode, setAdminSecretCode,
  getPlatformSettings, savePlatformSettings, PlatformSettings,
  getRegisteredStudents, saveRegisteredStudents, deleteRegisteredStudent, addOrUpdateStudent, updateStudentStatus
} from '../utils/storage';

interface Props {
  onUpdateCourses: () => void;
  onPreviewCourse: (course: Course) => void;
  onOpenQuickAccess: () => void;
  onViewStudentProfile?: (student: AuthUser) => void;
  onLockAdmin?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ 
  onUpdateCourses, 
  onPreviewCourse, 
  onOpenQuickAccess,
  onViewStudentProfile,
  onLockAdmin
}) => {
  // Main Data States
  const [courses, setCourses] = useState<Course[]>(getStoredCourses());
  const [codes, setCodes] = useState<ActivationCode[]>(getStoredActivationCodes());
  const [teachers, setTeachers] = useState<Teacher[]>(getStoredTeachers());
  const [gradeRecords, setGradeRecords] = useState<StudentGradeRecord[]>(getStoredGradeRecords());
  const [activationLogs, setActivationLogs] = useState<ActivatedCodeLog[]>(getStoredActivationLogs());
  const [students, setStudents] = useState<AuthUser[]>(getRegisteredStudents());
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>(getStoredLeaderboard());
  const [settings, setSettings] = useState<PlatformSettings>(getPlatformSettings());

  // Dashboard Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'settings' | 'background' | 'courses' | 'teachers' | 'students' | 'grades' | 'tracking' | 'codes' | 'leaderboard' | 'security'
  >('settings');

  // Admin Passcode & Security State
  const [adminPasscode, setAdminPasscode] = useState(getAdminSecretCode());
  const [showPasscodeInDashboard, setShowPasscodeInDashboard] = useState(false);
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState<string | null>(null);

  // Search & Toast
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Course Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Teacher Modal
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Student Modal & Filtering
  const [editingStudent, setEditingStudent] = useState<AuthUser | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | StudentStatus>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Grade Modal
  const [editingGrade, setEditingGrade] = useState<StudentGradeRecord | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Leaderboard Modal
  const [editingLeaderboard, setEditingLeaderboard] = useState<LeaderboardStudent | null>(null);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);

  // Code Generation Form State
  const [newCodeCourseId, setNewCodeCourseId] = useState(courses[0]?.id || '');
  const [customCodePrefix, setCustomCodePrefix] = useState('NAGHMA-VIP-');
  const [maxUsesInput, setMaxUsesInput] = useState(50);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    setCourses(getStoredCourses());
    setCodes(getStoredActivationCodes());
    setTeachers(getStoredTeachers());
    setGradeRecords(getStoredGradeRecords());
    setActivationLogs(getStoredActivationLogs());
    setStudents(getRegisteredStudents());
    setLeaderboard(getStoredLeaderboard());
    setSettings(getPlatformSettings());
    showToast('تم تحديث كافة بيانات المنظومة بنجاح 🔄');
  };

  // 1. Save Platform Global Settings
  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePlatformSettings(settings);
    onUpdateCourses();
    showToast('تم حفظ كافة إعدادات وهوية المنصة بنجاح! تم تطبيق التغييرات على الفور ✅');
  };

  // 2. Course Handlers
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    let updatedList: Course[];
    const exists = courses.some((c) => c.id === editingCourse.id);

    if (exists) {
      updatedList = courses.map((c) => (c.id === editingCourse.id ? editingCourse : c));
      showToast(`تم حفظ تعديلات كورس (${editingCourse.title}) بنجاح!`);
    } else {
      updatedList = [editingCourse, ...courses];
      showToast(`تمت إضافة الكورس الجديد (${editingCourse.title}) بنجاح!`);
    }

    saveStoredCourses(updatedList);
    setCourses(updatedList);
    setIsCourseModalOpen(false);
    setEditingCourse(null);
    onUpdateCourses();
  };

  const handleDeleteCourse = (courseId: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف كورس "${title}" بالكامل؟`)) {
      const updated = courses.filter((c) => c.id !== courseId);
      saveStoredCourses(updated);
      setCourses(updated);
      onUpdateCourses();
      showToast(`تم حذف كورس "${title}" بنجاح`);
    }
  };

  // 3. Teacher Handlers
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    let updatedList: Teacher[];
    const exists = teachers.some((t) => t.id === editingTeacher.id);

    if (exists) {
      updatedList = teachers.map((t) => (t.id === editingTeacher.id ? editingTeacher : t));
      showToast(`تم حفظ بيانات الأستاذ (${editingTeacher.name}) بنجاح!`);
    } else {
      updatedList = [...teachers, editingTeacher];
      showToast(`تمت إضافة الأستاذ الجديد (${editingTeacher.name}) بنجاح!`);
    }

    saveStoredTeachers(updatedList);
    setTeachers(updatedList);
    setIsTeacherModalOpen(false);
    setEditingTeacher(null);
    onUpdateCourses();
  };

  const handleDeleteTeacher = (teacherId: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الأستاذ "${name}" من المنصة؟`)) {
      const updated = teachers.filter((t) => t.id !== teacherId);
      saveStoredTeachers(updated);
      setTeachers(updated);
      onUpdateCourses();
      showToast(`تم حذف الأستاذ "${name}" بنجاح`);
    }
  };

  // 4. Student Handlers
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    addOrUpdateStudent(editingStudent);
    setStudents(getRegisteredStudents());
    setIsStudentModalOpen(false);
    setEditingStudent(null);
    showToast(`تم حفظ بيانات الطالب (${editingStudent.name}) بنجاح!`);
  };

  const handleDeleteStudent = (phoneOrCode: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف حساب الطالب "${name}"؟`)) {
      deleteRegisteredStudent(phoneOrCode);
      setStudents(getRegisteredStudents());
      showToast(`تم حذف حساب الطالب "${name}" بنجاح`);
    }
  };

  const handleQuickStatusChange = (student: AuthUser, newStatus: StudentStatus) => {
    updateStudentStatus(student.phone, newStatus);
    setStudents(getRegisteredStudents());
    const label = newStatus === 'active' ? 'نشط 🟢' : newStatus === 'pending' ? 'قيد المراجعة 🟡' : 'موقوف 🔴';
    showToast(`تم تغيير حالة الطالب (${student.name}) إلى "${label}" بنجاح!`);
  };

  // 5. Grade Record Handlers
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    let updatedList: StudentGradeRecord[];
    const exists = gradeRecords.some((g) => g.id === editingGrade.id);

    if (exists) {
      updatedList = gradeRecords.map((g) => (g.id === editingGrade.id ? editingGrade : g));
      showToast(`تم تحديث تقرير درجات الطالب (${editingGrade.studentName}) بنجاح!`);
    } else {
      updatedList = [editingGrade, ...gradeRecords];
      showToast(`تمت إضافة تقرير درجات جديد للطالب (${editingGrade.studentName}) بنجاح!`);
    }

    saveStoredGradeRecords(updatedList);
    setGradeRecords(updatedList);
    setIsGradeModalOpen(false);
    setEditingGrade(null);
  };

  const handleDeleteGrade = (id: string, studentName: string) => {
    if (confirm(`هل أنت متأكد من حذف تقرير درجات الطالب "${studentName}"؟`)) {
      const updated = gradeRecords.filter((g) => g.id !== id);
      saveStoredGradeRecords(updated);
      setGradeRecords(updated);
      showToast(`تم حذف التقرير بنجاح`);
    }
  };

  // 6. Leaderboard Handlers
  const handleSaveLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeaderboard) return;

    let updatedList: LeaderboardStudent[];
    const exists = leaderboard.some((l) => l.id === editingLeaderboard.id);

    if (exists) {
      updatedList = leaderboard.map((l) => (l.id === editingLeaderboard.id ? editingLeaderboard : l));
      showToast(`تم تحديث بيانات المتفوق (${editingLeaderboard.name}) بنجاح!`);
    } else {
      updatedList = [...leaderboard, editingLeaderboard];
      showToast(`تمت إضافة المتفوق (${editingLeaderboard.name}) للوحة الشرف!`);
    }

    saveStoredLeaderboard(updatedList);
    setLeaderboard(updatedList);
    setIsLeaderboardModalOpen(false);
    setEditingLeaderboard(null);
  };

  const handleDeleteLeaderboard = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المتفوق "${name}" من لوحة الشرف؟`)) {
      const updated = leaderboard.filter((l) => l.id !== id);
      saveStoredLeaderboard(updated);
      setLeaderboard(updated);
      showToast(`تم حذف الطالب من لوحة الشرف`);
    }
  };

  // 7. Codes Handlers
  const handleCreateNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourse = courses.find((c) => c.id === newCodeCourseId) || courses[0];
    const generatedCode = `${customCodePrefix.trim()}${Math.floor(1000 + Math.random() * 9000)}`;

    const newCodeObj: ActivationCode = {
      id: `act-${Date.now()}`,
      code: generatedCode,
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      teacherId: targetCourse.teacherId,
      teacherName: targetCourse.teacherName,
      isUsed: false,
      createdAt: new Date().toISOString().split('T')[0],
      maxUses: Number(maxUsesInput),
      usedCount: 0,
    };

    const updated = [newCodeObj, ...codes];
    saveStoredActivationCodes(updated);
    setCodes(updated);
    showToast(`تم إنشاء كود التفعيل الجديد: ${generatedCode}`);
  };

  const handleDeleteCode = (id: string) => {
    const updated = codes.filter((c) => c.id !== id);
    saveStoredActivationCodes(updated);
    setCodes(updated);
    showToast(`تم حذف الكود بنجاح`);
  };

  const handleClearActivationLogs = () => {
    if (confirm('هل أنت متأكد من مسح جميع سجلات تتبع الأكواد المفعلة؟')) {
      saveStoredActivationLogs([]);
      setActivationLogs([]);
      showToast('تم تفريغ سجلات التفعيل بنجاح');
    }
  };

  // 8. Secret Passcode Handler
  const handleUpdateSecretPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscodeInput.trim()) return;

    const trimmed = newPasscodeInput.trim();
    setAdminSecretCode(trimmed);
    setAdminPasscode(trimmed);
    setNewPasscodeInput('');
    setPasscodeSuccessMsg(`تم تحديث وحفظ الرمز السري الجديد بنجاح!`);
    showToast('تم حفظ وتأمين الرمز السري الجديد للمنشئ بنجاح 🔐');
    setTimeout(() => setPasscodeSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6 text-right font-sans animate-in fade-in pb-16">
      {/* Top Banner & Creator Powers Indicator */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>صلاحيات المنشئ الكاملة المطلقة 👑</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 group cursor-default">
              <span>لوحة تحكم الأدمن</span>
              <span className="inline-block transition-all duration-300 ease-in-out hover:animate-bounce group-hover:scale-125 group-hover:rotate-12">
                🎓
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              بصفتك المنشئ المعتمد، لديك الصلاحية الكاملة لتعديل أو إضافة أو حذف أي شيء في المنصة: هُوِيّة المنصة، الأساتذة، الكورسات والمحاضرات، حسابات وكلمات مرور الطلاب، كشوف الدرجات، أكواد التفعيل، لوحة الشرف، والرمز السري.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={reloadData}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 shadow-sm"
              title="تحديث فوري لجميع البيانات المخزنة"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>تحديث البيانات 🔄</span>
            </button>

            <button
              onClick={onOpenQuickAccess}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>الوصول السريع ⚡</span>
            </button>

            {onLockAdmin && (
              <button
                onClick={onLockAdmin}
                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-rose-500/40 shadow-sm"
                title="قفل لوحة الأدمن والخروج (يتطلب الرمز السري للدخول مجدداً)"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>قفل اللوحة 🔒</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Numerical Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 block font-medium">الكورسات المتاحة</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5">{courses.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 block font-medium">هيئة التدريس</span>
            <span className="text-xl font-black text-blue-400 font-mono mt-0.5">{teachers.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 block font-medium">الطلاب المسجلين</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5">{students.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 block font-medium">تقارير الدرجات</span>
            <span className="text-xl font-black text-purple-400 font-mono mt-0.5">{gradeRecords.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 block font-medium">أكواد التفعيل</span>
            <span className="text-xl font-black text-yellow-400 font-mono mt-0.5">{codes.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 block font-medium">الأكواد المفعلة</span>
            <span className="text-xl font-black text-teal-400 font-mono mt-0.5">{activationLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top border border-emerald-400/40">
          <span className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-sm font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1.5 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>إعدادات وهُوِيّة المنصة ⚙️</span>
        </button>

        <button
          onClick={() => setActiveTab('background')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'background'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-black shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4 text-purple-400" />
          <span>التحكم في خلفية المنصة 🎨</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'courses' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الكورسات والمناهج ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'teachers' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>هيئة التدريس والأساتذة ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'students' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>الطلاب وأولياء الأمور ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'grades' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>سجل درجات الطلاب ({gradeRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tracking' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>تتبع الأكواد بالساعة 🕒 ({activationLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('codes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'codes' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>توليد الأكواد ({codes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'leaderboard' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>لوحة الشرف ({leaderboard.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-slate-950 text-white ring-2 ring-amber-400/50 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>رمز المنشئ السري 🔐</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GLOBAL PLATFORM SETTINGS & BRANDING (صلاحية تغيير هوية المنصة) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSavePlatformSettings} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  <span>تعديل إعدادات وهوية المنصة الشاملة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك تعديل اسم المنصة، الشعار، نصوص الترحيب، أرقام الدعم الفني، وإعلانات المنصة في أي وقت.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ كافة التغييرات فوراً ✅</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المنصة الأساسي</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الشارة اللفظية (Badge)</label>
                <input
                  type="text"
                  value={settings.platformBadge}
                  onChange={(e) => setSettings({ ...settings, platformBadge: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم هاتف الدعم الفني وواتساب</label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 font-mono dir-ltr text-left"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الشعار اللفظي للمنصة (Slogan)</label>
              <input
                type="text"
                value={settings.platformSlogan}
                onChange={(e) => setSettings({ ...settings, platformSlogan: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الواجهة الترحيبية الأولى</label>
                <input
                  type="text"
                  value={settings.welcomeTitle}
                  onChange={(e) => setSettings({ ...settings, welcomeTitle: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نص شريط الإعلانات العلوية</label>
                <input
                  type="text"
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نص المقدمة الترحيبية الشاملة للطلاب وأولياء الأمور</label>
              <textarea
                rows={3}
                value={settings.welcomeDescription}
                onChange={(e) => setSettings({ ...settings, welcomeDescription: e.target.value })}
                className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 leading-relaxed"
                required
              />
            </div>

            {/* Platform Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="block text-xs font-bold text-slate-800">إظهار شريط الإعلانات العلوية</span>
                  <span className="text-[10px] text-slate-500">يعرض العروض والخصومات بأعلى الصفحة</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showAnnouncement}
                  onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded"
                />
              </label>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="block text-xs font-bold text-slate-800">تفعيل الشهادات الرقمية الرسمية</span>
                  <span className="text-[10px] text-slate-500">تتيح للطلاب تحميل الشهادات عند إتمام الكورس</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableDigitalCertificates}
                  onChange={(e) => setSettings({ ...settings, enableDigitalCertificates: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded"
                />
              </label>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="block text-xs font-bold text-slate-800">صفحة التسجيل كواجهة أولى</span>
                  <span className="text-[10px] text-slate-500">عرض صفحة التسجيل والمقدمة في أول زيارة</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.forceFirstScreenRegistration}
                  onChange={(e) => setSettings({ ...settings, forceFirstScreenRegistration: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded"
                />
              </label>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB: PLATFORM BACKGROUND CONTROL (التحكم في خلفية المنصة ومظهرها) */}
      {/* ========================================================================= */}
      {activeTab === 'background' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
            {/* Header & Actions */}
            <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black mb-2">
                  <Palette className="w-3.5 h-3.5 text-purple-600" />
                  <span>استوديو تخصيص مظهر وخلفية المنصة 🎨</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  التحكم الكامل في خلفية ومظهر منصة {settings.platformName}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  بصفتك المنشئ والمتحكم بالمنظومة، يمكنك اختيار أي نمط خلفية: أنماط تعليمية جاهزة فاخرة، ألوان سادة مريحة للعين، تدرجات لونية عصرية، أو وضع رابط صورة مخصصة مع سلايدرات الضبابية والشفافية. يتم الحفظ في التخزين المحلي وتطبيق التغييرات فوراً.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const defaultSettings: PlatformSettings = {
                      ...settings,
                      backgroundMode: 'preset',
                      backgroundPreset: 'default',
                      backgroundColor: '#0f172a',
                      backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                      customBackgroundUrl: '',
                      backgroundBlur: 0,
                      backgroundOpacity: 100,
                      showFloatingSymbols: true,
                      showMeshOrbs: true,
                      showGridTexture: true,
                    };
                    setSettings(defaultSettings);
                    savePlatformSettings(defaultSettings);
                    showToast('تمت استعادة الخلفية الافتراضية بنجاح 🔄');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>الافتراضي 🔄</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    savePlatformSettings(settings);
                    showToast('تم تطبيق وحفظ مظهر الخلفية الجديد فورياً على كامل المنصة 🚀🎨');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>تطبيق وحفظ الخلفية فوراً 🚀</span>
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>معاينة حية فورية لشكل المنصة بالخلفية المختارة:</span>
                </span>
                <span className="text-[11px] text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full font-bold">
                  {settings.backgroundMode === 'preset' && `النمط الجاهز: ${settings.backgroundPreset || 'الافتراضي'}`}
                  {settings.backgroundMode === 'solid' && `لون سادة: ${settings.backgroundColor}`}
                  {settings.backgroundMode === 'gradient' && 'تدرج لوني مخصص'}
                  {settings.backgroundMode === 'custom' && 'صورة خلفية مخصصة'}
                </span>
              </div>

              {/* Miniature mockup window */}
              <div className="rounded-2xl border-2 border-slate-300 overflow-hidden shadow-xl relative min-h-[190px] flex flex-col justify-between p-5 text-right transition-all">
                {/* Embedded preview background */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500"
                  style={
                    settings.backgroundMode === 'solid'
                      ? { backgroundColor: settings.backgroundColor || '#0f172a' }
                      : settings.backgroundMode === 'gradient'
                      ? { background: settings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }
                      : settings.backgroundMode === 'custom' && settings.customBackgroundUrl
                      ? {
                          backgroundImage: `url(${settings.customBackgroundUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: settings.backgroundBlur > 0 ? `blur(${settings.backgroundBlur}px)` : undefined,
                          opacity: (settings.backgroundOpacity ?? 100) / 100,
                        }
                      : settings.backgroundPreset === 'royalNavy'
                      ? { background: 'linear-gradient(135deg, #070b19 0%, #0d1b3e 50%, #0a1128 100%)' }
                      : settings.backgroundPreset === 'emeraldAcademic'
                      ? { background: 'linear-gradient(135deg, #021a13 0%, #063828 50%, #022018 100%)' }
                      : settings.backgroundPreset === 'midnightDark'
                      ? { background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #0f0f11 100%)' }
                      : settings.backgroundPreset === 'warmCream'
                      ? { background: '#fbf7ee' }
                      : settings.backgroundPreset === 'sunsetIndigo'
                      ? { background: 'linear-gradient(135deg, #130924 0%, #29124e 50%, #110820 100%)' }
                      : settings.backgroundPreset === 'auroraBorealis'
                      ? { background: 'linear-gradient(135deg, #03141b 0%, #0a2d33 50%, #061922 100%)' }
                      : settings.backgroundPreset === 'cyberSlate'
                      ? { background: 'linear-gradient(135deg, #0b1120 0%, #1e293b 50%, #0f172a 100%)' }
                      : { background: '#f8fafc' }
                  }
                />

                {/* Ambient Orbs in preview */}
                {(settings.showMeshOrbs ?? true) && (
                  <>
                    <div className="absolute top-0 right-10 w-40 h-40 rounded-full blur-2xl opacity-40 bg-purple-500/30 pointer-events-none" />
                    <div className="absolute bottom-0 left-10 w-40 h-40 rounded-full blur-2xl opacity-30 bg-blue-500/30 pointer-events-none" />
                  </>
                )}

                {/* Floating Symbols in preview */}
                {(settings.showFloatingSymbols ?? true) && (
                  <div className="absolute inset-0 select-none font-serif text-3xl opacity-10 flex justify-between p-4 pointer-events-none text-slate-400">
                    <span>∫</span>
                    <span>∑</span>
                    <span>π</span>
                    <span>∞</span>
                  </div>
                )}

                {/* Simulated Platform Content Header */}
                <div className="relative z-10 flex items-center justify-between bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-xs">
                      🎓
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{settings.platformName}</span>
                      <span className="text-[9px] text-slate-500 font-medium">{settings.platformSlogan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">الأساتذة</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">الكورسات</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">الدرجات</span>
                  </div>
                </div>

                {/* Simulated Content Cards */}
                <div className="relative z-10 grid grid-cols-3 gap-2.5 mt-3">
                  <div className="bg-white/85 backdrop-blur-md p-2.5 rounded-xl border border-white/40 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 block">المحاضرات</span>
                    <span className="text-sm font-black text-amber-600 font-mono">+120</span>
                  </div>
                  <div className="bg-white/85 backdrop-blur-md p-2.5 rounded-xl border border-white/40 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 block">الطلاب المتفوقين</span>
                    <span className="text-sm font-black text-blue-600 font-mono">+15K</span>
                  </div>
                  <div className="bg-white/85 backdrop-blur-md p-2.5 rounded-xl border border-white/40 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 block">نسبة النجاح</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">99.4%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODE SELECTION TABS */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-800">
                اختر طريقة التحكم في الخلفية:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'preset', title: 'أنماط جاهزة فاخرة ✨', desc: '8 قوالب أكاديمية مختارة بدقة' },
                  { id: 'gradient', title: 'تدرجات لونية 🌈', desc: 'تدرجات عصرية غنية بالعمق' },
                  { id: 'solid', title: 'ألوان سادة مريحة 🎨', desc: 'ألوان نقية وهادئة للعين' },
                  { id: 'custom', title: 'صورة خلفية مخصصة 🖼️', desc: 'برابط صورة مع ضبابية وشفافية' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, backgroundMode: mode.id as any };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                      settings.backgroundMode === mode.id
                        ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className={`text-xs font-black block ${settings.backgroundMode === mode.id ? 'text-purple-950' : 'text-slate-800'}`}>
                      {mode.title}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: PRESETS */}
            {settings.backgroundMode === 'preset' && (
              <div className="space-y-3 pt-2">
                <span className="block text-xs font-black text-slate-800">
                  اختر من بين القوالب الجاهزة المصممة خصيصاً للمنصات التعليمية:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'royalNavy', title: 'الكحلي الملكي الفاخر 👑', previewBg: 'from-[#070b19] via-[#0d1b3e] to-[#0a1128]', tag: 'فخامة داكنة' },
                    { id: 'emeraldAcademic', title: 'الزمردي الأكاديمي 🌿', previewBg: 'from-[#021a13] via-[#063828] to-[#022018]', tag: 'تركيز دراسي عالي' },
                    { id: 'midnightDark', title: 'الأسود الملكي الفخم 🖤', previewBg: 'from-[#09090b] via-[#18181b] to-[#0f0f11]', tag: 'أوبسيديان مودرن' },
                    { id: 'warmCream', title: 'ورق البردي / راحة العين 📜', previewBg: 'from-[#fbf7ee] via-[#f7f0df] to-[#fbf7ee]', tag: 'أقصى راحة للعين' },
                    { id: 'sunsetIndigo', title: 'الغسق والنيلي الداكن 🌆', previewBg: 'from-[#130924] via-[#29124e] to-[#110820]', tag: 'فيوليت ملهم' },
                    { id: 'auroraBorealis', title: 'الشفق القطبي 🌌', previewBg: 'from-[#03141b] via-[#0a2d33] to-[#061922]', tag: 'تيل وسماوي ساحر' },
                    { id: 'cyberSlate', title: 'سليت تقني داكن 💻', previewBg: 'from-[#0b1120] via-[#1e293b] to-[#0f172a]', tag: 'أكاديمي عصري' },
                    { id: 'default', title: 'المنظومة القياسية ⚪', previewBg: 'from-slate-50 via-blue-50/50 to-slate-100', tag: 'رمادي فاتح كلاسيكي' },
                  ].map((p) => {
                    const isSelected = settings.backgroundPreset === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          const updated = { ...settings, backgroundPreset: p.id, backgroundMode: 'preset' as const };
                          setSettings(updated);
                          savePlatformSettings(updated);
                          showToast(`تم تفعيل قالب (${p.title}) بنجاح!`);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className={`h-14 rounded-xl bg-gradient-to-r ${p.previewBg} border border-black/10 shadow-inner flex items-center justify-center mb-2.5`}>
                          {isSelected && <span className="bg-white/90 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">مفعل حالياً ✓</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{p.tag}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 2: SOLID COLORS */}
            {settings.backgroundMode === 'solid' && (
              <div className="space-y-4 pt-2">
                <span className="block text-xs font-black text-slate-800">
                  اختر لوناً ساداً أو حدد درجتك المفضلة عبر أداة الألوان:
                </span>

                {/* Preset Solid Swatches */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {[
                    { color: '#0f172a', name: 'سليت داكن' },
                    { color: '#0a1128', name: 'كحلي ليلي' },
                    { color: '#022c22', name: 'زمردي ملكي' },
                    { color: '#09090b', name: 'أسود فاحم' },
                    { color: '#1e1b4b', name: 'نيلي عميق' },
                    { color: '#fbf7ee', name: 'ورقي مريح' },
                    { color: '#f8fafc', name: 'أبيض ناصع' },
                    { color: '#1e293b', name: 'رمادي صلب' },
                  ].map((swatch) => (
                    <button
                      key={swatch.color}
                      type="button"
                      onClick={() => {
                        const updated = { ...settings, backgroundColor: swatch.color, backgroundMode: 'solid' as const };
                        setSettings(updated);
                        savePlatformSettings(updated);
                        showToast(`تم اختيار لون ${swatch.name}!`);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        settings.backgroundColor === swatch.color
                          ? 'border-purple-600 ring-2 ring-purple-400/40 shadow-xs'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg border border-black/15 shadow-inner"
                        style={{ backgroundColor: swatch.color }}
                      />
                      <span className="text-[10px] font-bold text-slate-700">{swatch.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.backgroundColor || '#0f172a'}
                      onChange={(e) => {
                        const updated = { ...settings, backgroundColor: e.target.value, backgroundMode: 'solid' as const };
                        setSettings(updated);
                        savePlatformSettings(updated);
                      }}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">منتقي الألوان الحر</span>
                      <span className="text-[10px] text-slate-500">اختر أي درجة لون بدقة عبر عجلة الألوان</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={settings.backgroundColor || '#0f172a'}
                    onChange={(e) => {
                      const updated = { ...settings, backgroundColor: e.target.value, backgroundMode: 'solid' as const };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    placeholder="#0f172a"
                    className="text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl dir-ltr text-center w-32"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: GRADIENTS */}
            {settings.backgroundMode === 'gradient' && (
              <div className="space-y-4 pt-2">
                <span className="block text-xs font-black text-slate-800">
                  اختر تدرجاً لونياً عالي الجودة أو اكتب كود التدرج الخاص بك:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { title: 'كحلي ملكي ونيلي', css: 'linear-gradient(135deg, #0a1128 0%, #1c2541 50%, #0b132b 100%)' },
                    { title: 'زمردي غامق احترافي', css: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022018 100%)' },
                    { title: 'أوبسيديان وأسود أنيق', css: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #0f172a 100%)' },
                    { title: 'غسق بنفسجي ونيلي', css: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)' },
                    { title: 'أورورا وتيل المحيط', css: 'linear-gradient(135deg, #042f2e 0%, #0f172a 50%, #064e3b 100%)' },
                    { title: 'أزرق علمي ملكي', css: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)' },
                    { title: 'رمادي أكاديمي فاتح', css: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' },
                    { title: 'ورق كريمي دافئ', css: 'linear-gradient(135deg, #fdfbf7 0%, #f7f2e7 50%, #fbf7ee 100%)' },
                  ].map((grad, i) => {
                    const isSelected = settings.backgroundGradient === grad.css;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          const updated = { ...settings, backgroundGradient: grad.css, backgroundMode: 'gradient' as const };
                          setSettings(updated);
                          savePlatformSettings(updated);
                          showToast(`تم تطبيق التدرج: ${grad.title}!`);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-600 ring-2 ring-purple-400/30 bg-purple-50/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="h-12 rounded-xl mb-2 shadow-inner border border-black/10 flex items-center justify-center"
                          style={{ background: grad.css }}
                        >
                          {isSelected && <span className="bg-white/90 text-purple-950 text-[10px] font-black px-2 py-0.5 rounded-full">مفعل ✓</span>}
                        </div>
                        <span className="text-xs font-bold text-slate-800 block text-center truncate">{grad.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom CSS gradient string */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    كود التدرج اللوني (CSS linear-gradient):
                  </label>
                  <input
                    type="text"
                    value={settings.backgroundGradient || ''}
                    onChange={(e) => {
                      const updated = { ...settings, backgroundGradient: e.target.value, backgroundMode: 'gradient' as const };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    placeholder="linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl dir-ltr focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* SECTION 4: CUSTOM IMAGE WALLPAPER */}
            {settings.backgroundMode === 'custom' && (
              <div className="space-y-4 pt-2">
                <span className="block text-xs font-black text-slate-800">
                  حدد رابط صورة خلفية للمنصة أو اختر من الصور الأكاديمية المقترحة:
                </span>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">رابط الصورة المباشر (Image URL):</label>
                  <input
                    type="url"
                    value={settings.customBackgroundUrl || ''}
                    onChange={(e) => {
                      const updated = { ...settings, customBackgroundUrl: e.target.value, backgroundMode: 'custom' as const };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl dir-ltr focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                {/* Quick Presets for Wallpapers */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-bold block">صور أكاديمية مقترحة عالية الدقة:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { name: 'مكتبة كبرى عريقة 📚', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80' },
                      { name: 'فضاء ونجوم وعلم فلك 🌌', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
                      { name: 'مدرج تفاعلي وتكنولوجيا 💻', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80' },
                      { name: 'نمط تجريدي هندسي 📐', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80' },
                    ].map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...settings,
                            customBackgroundUrl: sample.url,
                            backgroundMode: 'custom' as const,
                            backgroundBlur: 4,
                            backgroundOpacity: 60,
                          };
                          setSettings(updated);
                          savePlatformSettings(updated);
                          showToast(`تم تعيين خلفية: ${sample.name}`);
                        }}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-right text-xs font-bold text-slate-700 transition-colors"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders for Blur and Opacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                      <span>درجة الضبابية والتنعيم (Blur):</span>
                      <span className="font-mono text-purple-700">{settings.backgroundBlur || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={settings.backgroundBlur || 0}
                      onChange={(e) => {
                        const updated = { ...settings, backgroundBlur: Number(e.target.value) };
                        setSettings(updated);
                        savePlatformSettings(updated);
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">تساعد في جعل النصوص والبطاقات مقروءة وواضحة جداً.</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                      <span>درجة الشفافية (Opacity):</span>
                      <span className="font-mono text-purple-700">{settings.backgroundOpacity ?? 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.backgroundOpacity ?? 100}
                      onChange={(e) => {
                        const updated = { ...settings, backgroundOpacity: Number(e.target.value) };
                        setSettings(updated);
                        savePlatformSettings(updated);
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">تحديد مدى سطوع الصورة واندماجها مع محتوى المنصة.</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: VISUAL AMBIENCE & EFFECTS TOGGLES */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="block text-xs font-black text-slate-800">
                المؤثرات البصرية التفاعلية الإضافية:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">الهالات الضوئية المتحركة</span>
                    <span className="text-[10px] text-slate-500">إضاءات ناعمة (Ambient Mesh Orbs)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showMeshOrbs ?? true}
                    onChange={(e) => {
                      const updated = { ...settings, showMeshOrbs: e.target.checked };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    className="w-4 h-4 text-purple-600 rounded accent-purple-600"
                  />
                </label>

                <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">الرموز الأكاديمية العائمة</span>
                    <span className="text-[10px] text-slate-500">علامات الرياضيات والعلوم (∫, ∑, π, ∞)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showFloatingSymbols ?? true}
                    onChange={(e) => {
                      const updated = { ...settings, showFloatingSymbols: e.target.checked };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    className="w-4 h-4 text-purple-600 rounded accent-purple-600"
                  />
                </label>

                <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">شبكة النقاط الهندسية</span>
                    <span className="text-[10px] text-slate-500">مصفوفة نقاط خفيفة فائقة الأناقة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showGridTexture ?? true}
                    onChange={(e) => {
                      const updated = { ...settings, showGridTexture: e.target.checked };
                      setSettings(updated);
                      savePlatformSettings(updated);
                    }}
                    className="w-4 h-4 text-purple-600 rounded accent-purple-600"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COURSES MANAGEMENT (إدارة وتعديل الكورسات بالكامل) */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="تصفية الكورسات حسب المادة أو الأستاذ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => {
                const newCourse: Course = {
                  id: `course-${Date.now()}`,
                  title: 'كورس جديد قيد الإعداد',
                  stage: 'secondary',
                  gradeLevel: 'الصف الثالث الثانوي',
                  subject: 'الفيزياء',
                  teacherId: teachers[0]?.id || 't-phy-1',
                  teacherName: teachers[0]?.name || 'الأستاذ أحمد فؤاد',
                  teacherAvatar: teachers[0]?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
                  thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800',
                  description: 'شرح مفصل مع حل أهم المسائل وأسئلة الامتحانات السابقة بنظام التقييم الذكي.',
                  price: 180,
                  requiresActivationCode: true,
                  activationCodeSample: 'NAGHMA-NEW-2026',
                  chapters: [
                    {
                      id: `ch-1-${Date.now()}`,
                      title: 'الفصل الأول: المفاهيم التأسيسية',
                      description: 'محاضرات الشرح والأسئلة التطبيقية',
                      order: 1,
                      lessons: [
                        {
                          id: `les-1-${Date.now()}`,
                          title: 'المحاضرة الأولى: مقدمة تأسيسية هامة',
                          duration: '45 دقيقة',
                          videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
                          summary: 'ملخص شامل لأبرز القوانين والنقاط الأساسية.',
                          hasPdf: true,
                          order: 1,
                          isLocked: false,
                        },
                      ],
                    },
                  ],
                  features: ['شرح تفاعلي', 'كويزات بعد كل درس', 'شهادة تقدير رقمية'],
                  enrolledStudentsCount: 0,
                };
                setEditingCourse(newCourse);
                setIsCourseModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كورس جديد للمنصة ➕</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses
              .filter((c) => c.title.includes(searchQuery) || c.subject.includes(searchQuery) || c.teacherName.includes(searchQuery))
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 overflow-hidden bg-slate-100">
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        {c.gradeLevel}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-lg shadow-xs">
                        {c.price} ج.م
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{c.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <span>المعلم: {c.teacherName}</span>
                        <span className="font-mono text-slate-500">
                          {c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} محاضرة
                        </span>
                      </div>

                      {c.requiresActivationCode && (
                        <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-2 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1 font-bold">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            كود التفعيل:
                          </span>
                          <span className="font-mono font-bold">{c.activationCodeSample || 'مؤمن'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPreviewCourse(c)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      معاينة الكورس
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse({ ...c });
                          setIsCourseModalOpen(true);
                        }}
                        className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-200 rounded-xl transition-colors"
                        title="تعديل تفاصيل الكورس بالكامل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                        title="حذف الكورس"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TEACHERS MANAGEMENT (إدارة وتعديل هيئة التدريس بالكامل) */}
      {/* ========================================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-slate-900">هيئة التدريس والأساتذة المعتمدين ({teachers.length})</h3>
            <button
              onClick={() => {
                const newTeacher: Teacher = {
                  id: `teacher-${Date.now()}`,
                  name: 'أستاذ جديد',
                  title: 'خبير تدريس المادة',
                  subject: 'اللغة العربية',
                  stage: 'secondary',
                  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
                  experienceYears: 10,
                  rating: 4.9,
                  studentsCount: 1500,
                  phone: '+201012345678',
                  bio: 'خبرة تزيد عن 10 سنوات في تبسيط المناهج وإعداد أوائل الجمهورية.',
                  welcomeMessage: 'أهلاً بكم في رحلة التفوق والدرجات النهائية!',
                };
                setEditingTeacher(newTeacher);
                setIsTeacherModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة أستاذ جديد 👨‍🏫</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                    <div className="text-xs text-blue-700 font-semibold">{t.title} - {t.subject}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{t.bio}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span>⭐ {t.rating}</span>
                    <span>👥 {t.studentsCount.toLocaleString()} طالب</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTeacher({ ...t });
                        setIsTeacherModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="تعديل بيانات الأستاذ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t.id, t.name)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف الأستاذ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENTS MANAGEMENT (إدارة حسابات وبيانات وكلمات مرور الطلاب وحالة الحساب) */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (() => {
        const activeCount = students.filter((s) => (s.status || 'active') === 'active').length;
        const pendingCount = students.filter((s) => s.status === 'pending').length;
        const suspendedCount = students.filter((s) => s.status === 'suspended').length;

        const filteredStudents = students.filter((s) => {
          const status = s.status || 'active';
          const matchesStatus = studentStatusFilter === 'all' || status === studentStatusFilter;
          const q = studentSearchQuery.trim().toLowerCase();
          const matchesSearch =
            !q ||
            s.name.toLowerCase().includes(q) ||
            s.phone.includes(q) ||
            (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
            (s.parentName && s.parentName.toLowerCase().includes(q));
          return matchesStatus && matchesSearch;
        });

        return (
          <div className="space-y-4">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>سجل حسابات الطلاب وإدارة حالة الحساب (نشط / موقوف / قيد المراجعة) ({students.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحكم كامل في حالة كل طالب الأكاديمية وصلاحية وصوله للكورسات وتعديل كلمة المرور أو بيانات ولي الأمر مباشرة.
                </p>
              </div>

              <button
                onClick={() => {
                  const newStudent: AuthUser = {
                    role: 'student',
                    name: 'طالب جديد',
                    phone: '+2010' + Math.floor(10000000 + Math.random() * 90000000),
                    password: '123456',
                    parentName: 'ولي الأمر',
                    parentPhone: '+2010' + Math.floor(10000000 + Math.random() * 90000000),
                    studentCode: 'ST-' + Math.floor(100 + Math.random() * 900),
                    status: 'active',
                    statusReason: 'حساب جديد مفعل',
                  };
                  setEditingStudent(newStudent);
                  setIsStudentModalOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة طالب جديد يدوياً ➕</span>
              </button>
            </div>

            {/* Quick KPI Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setStudentStatusFilter('all')}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  studentStatusFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold block opacity-75">إجمالي الطلاب المسجلين</span>
                  <span className="text-lg font-black">{students.length}</span>
                </div>
                <Users className="w-5 h-5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('active')}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  studentStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold block">طلاب نشطون (نشط 🟢)</span>
                  <span className="text-lg font-black">{activeCount}</span>
                </div>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('pending')}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  studentStatusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100/70'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold block">قيد المراجعة (🟡)</span>
                  <span className="text-lg font-black">{pendingCount}</span>
                </div>
                <Clock className="w-5 h-5 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('suspended')}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  studentStatusFilter === 'suspended'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-rose-50/60 text-rose-900 border-rose-200 hover:bg-rose-100/60'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold block">موقوفون مؤقتاً (🔴)</span>
                  <span className="text-lg font-black">{suspendedCount}</span>
                </div>
                <UserX className="w-5 h-5 text-rose-600" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="بحث باسم الطالب، الكود، الهاتف، أو ولي الأمر..."
                  className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>تصفية بالحالة:</span>
                </span>
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                  className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                >
                  <option value="all">كافة الحالات ({students.length})</option>
                  <option value="active">نشط فقط 🟢 ({activeCount})</option>
                  <option value="pending">قيد المراجعة فقط 🟡 ({pendingCount})</option>
                  <option value="suspended">موقوف فقط 🔴 ({suspendedCount})</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">اسم الطالب والكود</th>
                    <th className="p-3.5">رقم هاتف الطالب</th>
                    <th className="p-3.5">حالة الطالب (Student Status) 🔄</th>
                    <th className="p-3.5">كلمة المرور</th>
                    <th className="p-3.5">اسم ولي الأمر وهاتفه</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        لا يوجد طلاب يطابقون شروط البحث والتصفية المختارة.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const status = s.status || 'active';
                      return (
                        <tr key={s.phone || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {status === 'active' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="نشط" />
                              )}
                              {status === 'pending' && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="قيد المراجعة" />
                              )}
                              {status === 'suspended' && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="موقوف" />
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-blue-600 flex items-center gap-1 mt-0.5">
                              <span>{s.studentCode || `ST-${101 + idx}`}</span>
                              {s.statusReason && (
                                <span className="text-slate-400 font-sans truncate max-w-[150px]" title={s.statusReason}>
                                  • {s.statusReason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono dir-ltr text-left text-slate-700">{s.phone}</td>
                          <td className="p-3.5">
                            {/* Inline Interactive Status Dropdown Selector */}
                            <div className="inline-flex items-center gap-1.5">
                              <select
                                value={status}
                                onChange={(e) => handleQuickStatusChange(s, e.target.value as StudentStatus)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                                  status === 'active'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 focus:ring-1 focus:ring-emerald-400'
                                    : status === 'pending'
                                    ? 'bg-amber-50 border-amber-300 text-amber-900 focus:ring-1 focus:ring-amber-400'
                                    : 'bg-rose-50 border-rose-300 text-rose-800 focus:ring-1 focus:ring-rose-400'
                                }`}
                              >
                                <option value="active">🟢 نشط (Active)</option>
                                <option value="pending">🟡 قيد المراجعة (Pending)</option>
                                <option value="suspended">🔴 موقوف (Suspended)</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-amber-700 bg-amber-50/50 rounded px-2 font-bold">
                            {s.password || '123456'}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{s.parentName || 'غير مسجل'}</div>
                            <div className="font-mono text-[10px] text-slate-500 dir-ltr text-left">{s.parentPhone || '—'}</div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  if (onViewStudentProfile) {
                                    onViewStudentProfile(s);
                                  }
                                }}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                                title="معاينة الملف الشخصي للطالب وحالته"
                              >
                                <Eye className="w-4 h-4 text-emerald-600" />
                                <span className="hidden sm:inline">معاينة الملف</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStudent({ ...s });
                                  setIsStudentModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="تعديل بيانات وحالة الطالب وكلمة المرور"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(s.phone, s.name)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف حساب الطالب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB 5: GRADES RECORDS (سجل درجات أولياء الأمور) */}
      {/* ========================================================================= */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">سجل درجات أولياء الأمور المعتمدة ({gradeRecords.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">يمكنك إضافة أو تعديل أي درجة وكتابة تقارير متابعة مخصصة.</p>
            </div>
            <button
              onClick={() => {
                const newRecord: StudentGradeRecord = {
                  id: `gr-${Date.now()}`,
                  studentId: 'ST-101',
                  studentName: 'عمر خالد المنشاوي',
                  parentPhone: '+201012345678',
                  stage: 'secondary',
                  gradeLevel: 'الصف الثالث الثانوي',
                  courseTitle: 'الفيزياء للثانوية العامة',
                  examTitle: 'امتحان الفصل الأول الشامل',
                  examDate: new Date().toISOString().split('T')[0],
                  score: 48,
                  maxScore: 50,
                  attendancePercentage: 100,
                  status: 'ممتاز',
                  teacherNotes: 'أداء متميز وتفوق ملحوظ في حل المسائل المركبة.',
                  sentToParent: true,
                };
                setEditingGrade(newRecord);
                setIsGradeModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقرير درجات جديد ➕</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">الطالب</th>
                  <th className="p-3.5">المادة والامتحان</th>
                  <th className="p-3.5 text-center">الدرجة</th>
                  <th className="p-3.5 text-center">التقدير</th>
                  <th className="p-3.5">ملاحظات المعلم لولي الأمر</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {r.studentName} <span className="font-mono text-slate-400 text-[10px]">({r.studentId})</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div className="font-bold">{r.courseTitle}</div>
                      <div className="text-[10px] text-slate-500">{r.examTitle}</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-700 font-mono">
                      {r.score} / {r.maxScore}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{r.teacherNotes}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGrade({ ...r });
                            setIsGradeModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="تعديل تقرير الدرجات"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(r.id, r.studentName)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف التقرير"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: REAL-TIME TRACKING LOGS (تتبع الأكواد بالساعة والأستاذ) */}
      {/* ========================================================================= */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-black text-slate-900">سجل تتبع الأكواد المفعلة لحظياً (مسجلاً بالساعة واسم الأستاذ) 🕒</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                يتم رصد أي كود يقوم الطالب بتفعيله وتوثيقه فوراً مع توقيت الساعة والدقيقة واسم الأستاذ المشرف.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivationLogs(getStoredActivationLogs())}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث السجل
              </button>
              <button
                onClick={handleClearActivationLogs}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
              >
                مسح السجلات 🗑️
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">كود التفعيل</th>
                  <th className="p-3.5">اسم الطالب وهاتفه</th>
                  <th className="p-3.5">الأستاذ المعني</th>
                  <th className="p-3.5 text-center">ساعة التفعيل 🕒</th>
                  <th className="p-3.5 text-center">التاريخ</th>
                  <th className="p-3.5">الكورس المفعل</th>
                  <th className="p-3.5 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 text-xs">
                        {log.code}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{log.studentName}</td>
                    <td className="p-3.5 text-blue-700 font-bold">{log.teacherName}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700 font-mono">{log.activatedAtTime}</td>
                    <td className="p-3.5 text-center text-slate-500 font-mono">{log.activatedAtDate}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{log.courseTitle}</td>
                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        مفعل وناجح
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CODES GENERATOR (توليد أكواد التفعيل) */}
      {/* ========================================================================= */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateNewCode} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>توليد أكواد تفعيل جديدة للكورسات المطبوعة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكورس المستهدف</label>
                <select
                  value={newCodeCourseId}
                  onChange={(e) => setNewCodeCourseId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بادئة الكود (Prefix)</label>
                <input
                  type="text"
                  value={customCodePrefix}
                  onChange={(e) => setCustomCodePrefix(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  placeholder="NAGHMA-VIP-"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الحد الأقصى لمرات الاستخدام</label>
                <input
                  type="number"
                  value={maxUsesInput}
                  onChange={(e) => setMaxUsesInput(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>توليد وحفظ الكود فوراً 🚀</span>
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">الكود</th>
                  <th className="p-3.5">الكورس المرتبط</th>
                  <th className="p-3.5 text-center">الاستخدام</th>
                  <th className="p-3.5 text-center">تاريخ الإنشاء</th>
                  <th className="p-3.5 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-amber-800 font-mono text-sm">{code.code}</td>
                    <td className="p-3.5 font-medium text-slate-800">{code.courseTitle}</td>
                    <td className="p-3.5 text-center font-mono">
                      {code.usedCount} / {code.maxUses}
                    </td>
                    <td className="p-3.5 text-center text-slate-500 font-mono">{code.createdAt}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteCode(code.id)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="حذف الكود"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: LEADERBOARD MANAGEMENT (لوحة الشرف وتحديات المتفوقين) */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">إدارة لوحة الشرف وأوائل الطلبة ({leaderboard.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">يمكنك إضافة أو تعديل مراكز المتفوقين ونقاطهم وأوسمتهم.</p>
            </div>
            <button
              onClick={() => {
                const newStudent: LeaderboardStudent = {
                  id: `lb-${Date.now()}`,
                  name: 'طالب متفوق جديد',
                  stage: 'secondary',
                  gradeLevel: 'الصف الثالث الثانوي',
                  points: 9800,
                  quizzesCompleted: 35,
                  rank: leaderboard.length + 1,
                  badge: 'نجم الأسبوع 🌟',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                };
                setEditingLeaderboard(newStudent);
                setIsLeaderboardModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة متفوق للوحة الشرف 🌟</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5 text-center">المركز</th>
                  <th className="p-3.5">اسم المتفوق</th>
                  <th className="p-3.5">الصف الدراسي</th>
                  <th className="p-3.5 text-center">النقاط (XP)</th>
                  <th className="p-3.5 text-center">الكويزات المكتملة</th>
                  <th className="p-3.5 text-center">الوسام الشرفي</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-center font-black text-amber-600 font-mono text-sm">#{item.rank}</td>
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full object-cover border" />
                      <span>{item.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{item.gradeLevel}</td>
                    <td className="p-3.5 text-center font-bold font-mono text-blue-700">{item.points.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono">{item.quizzesCompleted}</td>
                    <td className="p-3.5 text-center font-bold text-amber-700">{item.badge}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingLeaderboard({ ...item });
                            setIsLeaderboardModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="تعديل بيانات المتفوق"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLeaderboard(item.id, item.name)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف من لوحة الشرف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: SECURITY & SECRET PASSCODE (رمز المنشئ السري المخفي) */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">إدارة الرمز السري الخاص بالمنشئ (مخفي تماماً)</h3>
                </div>
                <p className="text-xs text-slate-500 pr-11 leading-relaxed">
                  هذا الرمز السري مخصص لك وحدك للدخول إلى لوحة التحكم والإدارة. لا يظهر لأي طالب أو ولي أمر أو معلم في المنصة.
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black px-3 py-1 rounded-full shrink-0 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                الحماية مفعلة
              </span>
            </div>

            {passcodeSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passcodeSuccessMsg}</span>
              </div>
            )}

            {/* Current Passcode Display (Masked) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">الرمز السري الحالي المعتمد:</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-black text-slate-900 tracking-widest bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    {showPasscodeInDashboard ? adminPasscode : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasscodeInDashboard(!showPasscodeInDashboard)}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-white transition-colors"
                    title={showPasscodeInDashboard ? 'إخفاء الرمز' : 'كشف الرمز للتحقق'}
                  >
                    {showPasscodeInDashboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                الرمز مشفر ومخزن بأمان داخل المنظومة. يمكنك استخدامه لتسجيل الدخول في أي وقت.
              </p>
            </div>

            {/* Change Passcode Form */}
            <form onSubmit={handleUpdateSecretPasscode} className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-slate-900">تعيين رمز سري جديد لا يعلمه غيرك:</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newPasscodeInput}
                  onChange={(e) => setNewPasscodeInput(e.target.value)}
                  placeholder="اكتب الرمز السري الجديد هنا..."
                  className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!newPasscodeInput.trim()}
                  className="px-5 py-3 bg-slate-950 hover:bg-black disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  حفظ الرمز السري الجديد
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                ملاحظة: يمكنك كتابة أي رمز أرقام أو حروف تريده. فور الحفظ، لن يقبل النظام سوى الرمز الجديد.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT OR ADD COURSE */}
      {/* ========================================================================= */}
      {isCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold">تعديل وإدارة بيانات الكورس بالكامل</h3>
              </div>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الكورس</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
                  <select
                    value={editingCourse.stage}
                    onChange={(e) => setEditingCourse({ ...editingCourse, stage: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="primary">المرحلة الابتدائية</option>
                    <option value="preparatory">المرحلة الإعدادية</option>
                    <option value="secondary">المرحلة الثانوية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
                  <input
                    type="text"
                    value={editingCourse.gradeLevel}
                    onChange={(e) => setEditingCourse({ ...editingCourse, gradeLevel: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الكورس (ج.م)</label>
                  <input
                    type="number"
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلم المشرف</label>
                  <input
                    type="text"
                    value={editingCourse.teacherName}
                    onChange={(e) => setEditingCourse({ ...editingCourse, teacherName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كود التفعيل الافتراضي</label>
                  <input
                    type="text"
                    value={editingCourse.activationCodeSample || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, activationCodeSample: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="NAGHMA-CODE-2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة الغلاف</label>
                <input
                  type="text"
                  value={editingCourse.thumbnail}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف والمنهج التفصيلي</label>
                <textarea
                  rows={3}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">تفعيل نظام القفل المتسلسل للمحاضرات 🔒</div>
                  <div className="text-[11px] text-slate-500">لا يتم فتح الدرس التالي إلا بعد اجتياز كويز الدرس الحالي</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingCourse.requiresActivationCode}
                  onChange={(e) => setEditingCourse({ ...editingCourse, requiresActivationCode: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ التعديلات الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT OR ADD TEACHER */}
      {/* ========================================================================= */}
      {isTeacherModalOpen && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">تعديل بيانات الأستاذ 👨‍🏫</h3>
              <button onClick={() => setIsTeacherModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الأستاذ الكامل</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللقب / التخصص</label>
                  <input
                    type="text"
                    value={editingTeacher.title}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية</label>
                  <input
                    type="text"
                    value={editingTeacher.subject}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (واتساب)</label>
                  <input
                    type="text"
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
                  <select
                    value={editingTeacher.stage}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, stage: e.target.value as EducationalStage })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="primary">ابتدائي</option>
                    <option value="preparatory">إعدادي</option>
                    <option value="secondary">ثانوي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط الصورة الشخصية</label>
                <input
                  type="text"
                  value={editingTeacher.avatar}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, avatar: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السيرة الذاتية (Bio)</label>
                <textarea
                  rows={2}
                  value={editingTeacher.bio}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, bio: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ بيانات الأستاذ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT OR ADD STUDENT (تعديل بيانات وحساب الطالب) */}
      {/* ========================================================================= */}
      {isStudentModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">تعديل حساب وبيانات الطالب 👨‍🎓</h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الرباعي</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف الطالب (واتساب)</label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 mb-1">كلمة مرور حساب الطالب</label>
                  <input
                    type="text"
                    value={editingStudent.password || '123456'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم ولي الأمر</label>
                  <input
                    type="text"
                    value={editingStudent.parentName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف ولي الأمر (واتساب)</label>
                  <input
                    type="text"
                    value={editingStudent.parentPhone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود الطالب الأكاديمي (Student Code)</label>
                <input
                  type="text"
                  value={editingStudent.studentCode || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  placeholder="ST-101"
                />
              </div>

              {/* Student Status (حالة الطالب: نشط / موقوف / قيد المراجعة) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  حالة الطالب الأكاديمية (Student Status) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active', label: 'نشط 🟢', desc: 'صلاحيات كاملة', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                    { id: 'pending', label: 'قيد المراجعة 🟡', desc: 'تدقيق البيانات', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                    { id: 'suspended', label: 'موقوف 🔴', desc: 'تجميد مؤقت', color: 'border-rose-500 bg-rose-50 text-rose-900' },
                  ].map((st) => {
                    const isSelected = (editingStudent.status || 'active') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setEditingStudent({ ...editingStudent, status: st.id as StudentStatus })}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected ? `${st.color} ring-2 ring-blue-500/30 shadow-xs font-bold` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-black block">{st.label}</span>
                        <span className="text-[10px] opacity-75 mt-0.5">{st.desc}</span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 mt-2">
                    ملاحظة أو سبب الحالة (يظهر في صفحة الملف الشخصي للطالب):
                  </label>
                  <input
                    type="text"
                    value={editingStudent.statusReason || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, statusReason: e.target.value })}
                    placeholder="مثال: تم سداد المصروفات، أو بانتظار تأكيد رقم ولي الأمر..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ بيانات الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT OR ADD GRADE RECORD */}
      {/* ========================================================================= */}
      {isGradeModalOpen && editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">تعديل وإدارة تقرير درجات الطالب 📊</h3>
              <button onClick={() => setIsGradeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب</label>
                  <input
                    type="text"
                    value={editingGrade.studentName}
                    onChange={(e) => setEditingGrade({ ...editingGrade, studentName: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كود الطالب</label>
                  <input
                    type="text"
                    value={editingGrade.studentId}
                    onChange={(e) => setEditingGrade({ ...editingGrade, studentId: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الكورس والمادة</label>
                <input
                  type="text"
                  value={editingGrade.courseTitle}
                  onChange={(e) => setEditingGrade({ ...editingGrade, courseTitle: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الامتحان</label>
                <input
                  type="text"
                  value={editingGrade.examTitle}
                  onChange={(e) => setEditingGrade({ ...editingGrade, examTitle: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة المحققة</label>
                  <input
                    type="number"
                    value={editingGrade.score}
                    onChange={(e) => setEditingGrade({ ...editingGrade, score: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة العظمى</label>
                  <input
                    type="number"
                    value={editingGrade.maxScore}
                    onChange={(e) => setEditingGrade({ ...editingGrade, maxScore: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التقدير</label>
                  <select
                    value={editingGrade.status}
                    onChange={(e) => setEditingGrade({ ...editingGrade, status: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد جداً">جيد جداً</option>
                    <option value="جيد">جيد</option>
                    <option value="يحتاج متابعة">يحتاج متابعة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المعلم لولي الأمر</label>
                <textarea
                  rows={2}
                  value={editingGrade.teacherNotes}
                  onChange={(e) => setEditingGrade({ ...editingGrade, teacherNotes: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ تقرير الدرجات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT OR ADD LEADERBOARD STUDENT */}
      {/* ========================================================================= */}
      {isLeaderboardModalOpen && editingLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">تعديل بيانات المتفوق في لوحة الشرف 🌟</h3>
              <button onClick={() => setIsLeaderboardModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveLeaderboard} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المتفوق</label>
                <input
                  type="text"
                  value={editingLeaderboard.name}
                  onChange={(e) => setEditingLeaderboard({ ...editingLeaderboard, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المركز الشرفي (Rank)</label>
                  <input
                    type="number"
                    value={editingLeaderboard.rank}
                    onChange={(e) => setEditingLeaderboard({ ...editingLeaderboard, rank: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مجموع النقاط (XP)</label>
                  <input
                    type="number"
                    value={editingLeaderboard.points}
                    onChange={(e) => setEditingLeaderboard({ ...editingLeaderboard, points: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
                  <input
                    type="text"
                    value={editingLeaderboard.gradeLevel}
                    onChange={(e) => setEditingLeaderboard({ ...editingLeaderboard, gradeLevel: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوسام الشرفي (Badge)</label>
                  <input
                    type="text"
                    value={editingLeaderboard.badge}
                    onChange={(e) => setEditingLeaderboard({ ...editingLeaderboard, badge: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط الصورة الشخصية</label>
                <input
                  type="text"
                  value={editingLeaderboard.avatar}
                  onChange={(e) => setEditingLeaderboard({ ...editingLeaderboard, avatar: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono dir-ltr text-left"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaderboardModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ في لوحة الشرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
