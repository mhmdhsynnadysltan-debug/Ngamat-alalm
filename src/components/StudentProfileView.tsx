import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, AlertOctagon, User, Phone, Users, Shield, 
  Award, BookOpen, MessageSquare, Plus, Trash2, Share2, FileText, 
  Sparkles, Calendar, ExternalLink, RefreshCw, KeyRound, ArrowRight
} from 'lucide-react';
import { AuthUser, Course, StudentGradeRecord, StudentNote, StudentStatus } from '../types';
import { 
  getStudentNotes, saveStudentNotes, addStudentNote, deleteStudentNote, 
  toggleShareNoteWithTeacher, getPlatformSettings, getRegisteredStudents, updateStudentStatus 
} from '../utils/storage';

interface Props {
  student: AuthUser;
  courses: Course[];
  gradeRecords: StudentGradeRecord[];
  onOpenWhatsApp: (topic?: string) => void;
  onNavigate: (tab: string) => void;
  onOpenCourse?: (course: Course) => void;
  onBackToCourses?: () => void;
  isAdmin?: boolean;
}

export const StudentProfileView: React.FC<Props> = ({
  student,
  courses,
  gradeRecords,
  onOpenWhatsApp,
  onNavigate,
  onOpenCourse,
  onBackToCourses,
  isAdmin,
}) => {
  const [currentStudent, setCurrentStudent] = useState<AuthUser>(student);
  const [adminReasonInput, setAdminReasonInput] = useState(student.statusReason || '');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'notes' | 'grades' | 'courses'>('status');
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const settings = getPlatformSettings();

  // Sync currentStudent if prop or storage changes
  useEffect(() => {
    setCurrentStudent(student);
    setAdminReasonInput(student.statusReason || '');
  }, [student]);

  useEffect(() => {
    const handleStudentSync = () => {
      const all = getRegisteredStudents();
      const match = all.find(
        (s) => s.phone === student.phone || (s.studentCode && s.studentCode === student.studentCode)
      );
      if (match) {
        setCurrentStudent(match);
      }
    };
    window.addEventListener('registered-students-updated', handleStudentSync);
    window.addEventListener('auth-user-updated', handleStudentSync);
    return () => {
      window.removeEventListener('registered-students-updated', handleStudentSync);
      window.removeEventListener('auth-user-updated', handleStudentSync);
    };
  }, [student.phone, student.studentCode]);

  // New Note Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');

  const status: StudentStatus = currentStudent.status || 'active';

  const handleAdminChangeStatus = (newStatus: StudentStatus) => {
    updateStudentStatus(currentStudent.phone, newStatus, adminReasonInput);
    setCurrentStudent((prev) => ({
      ...prev,
      status: newStatus,
      statusReason: adminReasonInput,
      statusUpdatedAt: new Date().toISOString(),
    }));
    const label = newStatus === 'active' ? 'نشط 🟢' : newStatus === 'pending' ? 'قيد المراجعة 🟡' : 'موقوف 🔴';
    setStatusFeedback(`تم تغيير حالة الطالب إلى "${label}" بنجاح!`);
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleSaveAdminReason = () => {
    updateStudentStatus(currentStudent.phone, status, adminReasonInput);
    setCurrentStudent((prev) => ({
      ...prev,
      statusReason: adminReasonInput,
      statusUpdatedAt: new Date().toISOString(),
    }));
    setStatusFeedback('تم حفظ وتحديث ملاحظة حالة الطالب بنجاح!');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Load student personal notes
  useEffect(() => {
    const allNotes = getStudentNotes();
    const myNotes = allNotes.filter(
      (n) => n.studentId === currentStudent.studentCode || n.studentName === currentStudent.name || !n.studentId
    );
    setNotes(myNotes);

    const handleNotesUpdate = () => {
      const refreshed = getStudentNotes();
      setNotes(
        refreshed.filter(
          (n) => n.studentId === currentStudent.studentCode || n.studentName === currentStudent.name || !n.studentId
        )
      );
    };

    window.addEventListener('student-notes-updated', handleNotesUpdate);
    return () => window.removeEventListener('student-notes-updated', handleNotesUpdate);
  }, [currentStudent]);

  // Selected Course for Notes
  const activeCourseForNotes = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allLessonsForActiveCourse = activeCourseForNotes?.chapters?.flatMap((ch) => ch.lessons) || [];

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const q = noteSearch.trim().toLowerCase();
    return (
      !q ||
      n.noteText.toLowerCase().includes(q) ||
      n.courseTitle.toLowerCase().includes(q) ||
      n.lessonTitle.toLowerCase().includes(q)
    );
  });

  // Filter student grades
  const studentGrades = gradeRecords.filter(
    (g) => g.studentName === currentStudent.name || g.studentId === currentStudent.studentCode
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      studentId: currentStudent.studentCode || 'ST-101',
      studentName: currentStudent.name,
      courseId: selectedCourseId,
      courseTitle: activeCourseForNotes?.title || 'كورس تعليمي',
      lessonId: `l-${Date.now()}`,
      lessonTitle: selectedLessonTitle || allLessonsForActiveCourse[0]?.title || 'ملاحظة عامة على الكورس',
      noteText: noteContent.trim(),
      isSharedWithTeacher: isShared,
      createdAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    addStudentNote(newNote);
    setNotes([newNote, ...notes]);
    setNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    deleteStudentNote(noteId);
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  const handleToggleShare = (noteId: string) => {
    toggleShareNoteWithTeacher(noteId);
    setNotes(
      notes.map((n) => (n.id === noteId ? { ...n, isSharedWithTeacher: !n.isSharedWithTeacher } : n))
    );
  };

  return (
    <div className="space-y-6 text-right font-sans animate-in fade-in pb-12">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCourses || (() => onNavigate('teachers'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/80 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>العودة للكورسات والمناهج</span>
        </button>

        <div className="text-xs text-slate-400 font-bold">
          منصة {settings.platformName} • الملف الشخصي للطالب
        </div>
      </div>

      {/* Admin Quick Status Control Panel (Visible to Admin Only) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white">
                  لوحة تحكم الأدمن: إدارة حالة الطالب الأكاديمية (Student Status)
                </h3>
                <p className="text-[11px] text-slate-300">
                  تحديد مباشر لحالة الطالب وتحديث الصلاحيات وملاحظة الحساب فوراً
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">الحالة المختارة الآن:</span>
              <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${
                status === 'active'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : status === 'pending'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-rose-500/20 border-rose-400 text-rose-300'
              }`}>
                {status === 'active' ? 'نشط 🟢 (Active)' : status === 'pending' ? 'قيد المراجعة 🟡 (Pending)' : 'موقوف 🔴 (Suspended)'}
              </span>
            </div>
          </div>

          {/* Quick Status Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleAdminChangeStatus('active')}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                status === 'active'
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300/40 shadow-md font-black'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>نشط (Active) 🟢</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">كامل الصلاحيات للكورسات والامتحانات</div>
              </div>
              {status === 'active' && <span className="text-xs">✓</span>}
            </button>

            <button
              type="button"
              onClick={() => handleAdminChangeStatus('pending')}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                status === 'pending'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-300/40 shadow-md font-black'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>قيد المراجعة (Pending) 🟡</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">تدقيق البيانات ومطابقة الأرقام</div>
              </div>
              {status === 'pending' && <span className="text-xs">✓</span>}
            </button>

            <button
              type="button"
              onClick={() => handleAdminChangeStatus('suspended')}
              className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                status === 'suspended'
                  ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300/40 shadow-md font-black'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-200" />
                  <span>موقوف (Suspended) 🔴</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">تجميد مؤقت للحساب والصلاحيات</div>
              </div>
              {status === 'suspended' && <span className="text-xs">✓</span>}
            </button>
          </div>

          {/* Reason input and toast */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={adminReasonInput}
                onChange={(e) => setAdminReasonInput(e.target.value)}
                placeholder="ملاحظة أو سبب الحالة (يظهر للطالب في بانر التنبيه)..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleSaveAdminReason}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shrink-0 transition-colors cursor-pointer"
              >
                حفظ الملاحظة
              </button>
            </div>

            {statusFeedback && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl animate-in fade-in">
                {statusFeedback}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Student Header Card with Profile Info & Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                  <User className="w-10 h-10 text-amber-400" />
                </div>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-xs ${
                  status === 'active' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                title={status === 'active' ? 'نشط' : status === 'pending' ? 'قيد المراجعة' : 'موقوف'}
              >
                {status === 'active' ? '✓' : status === 'pending' ? '⋯' : '!'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentStudent.name}</h1>
                <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {currentStudent.studentCode || 'ST-101'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
                <span className="flex items-center gap-1 font-mono dir-ltr text-left">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentStudent.phone}</span>
                </span>
                {currentStudent.parentName && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>ولي الأمر: <strong>{currentStudent.parentName}</strong></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Large Student Status Badge (حالة الطالب) */}
          <div className="shrink-0 w-full md:w-auto">
            {status === 'active' && (
              <div className="bg-emerald-50 border-2 border-emerald-400/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-emerald-950">حالة الحساب: نشط ومعتمد 🟢</span>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.2 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                    كامل الصلاحيات مفعلة لمتابعة الكورسات وأداء الامتحانات.
                  </p>
                </div>
              </div>
            )}

            {status === 'pending' && (
              <div className="bg-amber-50 border-2 border-amber-400/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-amber-950">حالة الحساب: قيد المراجعة والتدقيق 🟡</span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.2 rounded-full font-bold">
                      Under Review
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                    يجري تدقيق بياناتك بواسطة المشرف، وسيتم التأكيد قريباً.
                  </p>
                </div>
              </div>
            )}

            {status === 'suspended' && (
              <div className="bg-rose-50 border-2 border-rose-400/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-rose-950">حالة الحساب: موقوف مؤقتاً 🔴</span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.2 rounded-full font-bold">
                      Suspended
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800 mt-0.5 font-medium">
                    تم تجميد الصلاحيات مؤقتاً، يرجى التواصل مع الإدارة.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Status Explanation Banner if not active */}
        {status !== 'active' && (
          <div
            className={`mt-4 p-4 rounded-2xl border text-xs leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              status === 'pending'
                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                : 'bg-rose-50/80 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {status === 'pending' ? (
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block font-bold">
                  {status === 'pending' ? 'ملاحظة تدقيق الحساب:' : 'سبب إيقاف الحساب:'}
                </strong>
                <span>
                  {currentStudent.statusReason ||
                    (status === 'pending'
                      ? 'حسابك في مرحلة التدقيق للتأكد من بيانات ولي الأمر وتحديث كشوف الطلاب.'
                      : 'يرجى مراجعة إدارة المنصة أو سداد رسوم الفصل الدراسي لإعادة التفعيل.')}
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenWhatsApp(`طلب مساعدة بخصوص حالة حسابي (${currentStudent.name} - ${currentStudent.studentCode})`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>مراسلة الإدارة عبر واتساب</span>
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>حالة الطالب والملف الأكاديمي 🎓</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>المفكرة الرقمية للدروس 📝 ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'grades'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-200" />
            <span>سجل درجاتي وامتحاناتي 📊 ({studentGrades.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>كورساتي ومناهجي 📚 ({courses.length})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: STUDENT STATUS & FULL ACADEMIC OVERVIEW */}
      {/* ===================================================================== */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Details Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>تفاصيل الصلاحيات وحالة الحساب الحالية:</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">مشاهدة الدروس والشروحات:</span>
                  <strong className={`text-xs font-black block ${status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {status === 'active' ? 'متاحة بالكامل ✅' : 'محدودة ومقيدة 🔒'}
                  </strong>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">دخول الاختبارات الإلكترونية:</span>
                  <strong className={`text-xs font-black block ${status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {status === 'active' ? 'مفعلة وتُسجل النتائج 🏆' : 'معلقة مؤقتاً ⚠️'}
                  </strong>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">المفكرة والمشاركة مع المعلم:</span>
                  <strong className="text-xs font-black text-purple-700 block">
                    متاحة للكتابة والتسجيل 📝
                  </strong>
                </div>
              </div>

              {/* Status explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h3 className="text-xs font-black text-slate-900">ماذا تعني حالة حسابك في المنصة؟</h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong className="text-emerald-700 font-bold">نشط (Active):</strong> الحساب مكتمل البيانات، ومصرّح له بالوصول لكافة الدروس والتسلسل التعليمي بدون أي قيود.
                  </li>
                  <li>
                    <strong className="text-amber-700 font-bold">قيد المراجعة (Pending):</strong> يجري مطابقة بيانات الهاتف مع سجل ولي الأمر المعتمد لدى المعلم.
                  </li>
                  <li>
                    <strong className="text-rose-700 font-bold">موقوف (Suspended):</strong> الحساب معطل بقرار إداري مؤقت حتى التواصل لتسوية الحساب أو دفع الرسوم.
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Notes Preview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>آخر الملاحظات في المفكرة الرقمية ({notes.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-bold"
                >
                  فتح المفكرة كاملة ←
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  لم تقم بتدوين أي ملاحظات بعد. افتح المفكرة الرقمية لتسجيل تلخيصاتك حول الدروس.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notes.slice(0, 2).map((n) => (
                    <div key={n.id} className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-950">
                        <span>{n.lessonTitle}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{n.createdAt}</span>
                      </div>
                      <p className="text-slate-700 text-[11px] line-clamp-2">{n.noteText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>بيانات المتابعة وولي الأمر</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">اسم ولي الأمر:</span>
                  <strong className="text-slate-800">{currentStudent.parentName || 'غير مسجل'}</strong>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">رقم هاتف ولي الأمر:</span>
                  <span className="font-mono text-slate-800 font-bold dir-ltr block text-left">
                    {currentStudent.parentPhone || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">كود الطالب الأكاديمي:</span>
                  <span className="font-mono text-blue-700 font-black block">
                    {currentStudent.studentCode || 'ST-101'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenWhatsApp(`استفسار من الطالب: ${currentStudent.name}`)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>الدعم الفني عبر واتساب</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DIGITAL NOTEBOOK (المفكرة الرقمية للدروس ومشاركتها مع المعلم) */}
      {/* ===================================================================== */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-purple-500/40 shadow-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/20 text-purple-200 text-xs font-bold border border-purple-400/30">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>المفكرة الرقمية الذكية للطالب 📝</span>
            </div>
            <h2 className="text-xl font-black">مفكرتي الدراسية وملاحظاتي على الدروس</h2>
            <p className="text-xs text-purple-200/90 leading-relaxed max-w-2xl">
              اكتب ملاحظاتك وتلخيصاتك الشخصية لكل درس، واحفظ الأسئلة الصعبة. يمكنك تفعيل خيار مشاركة الملاحظة ليطّلع عليها الأستاذ مباشرة ويقدم لك التوجيه التربوي.
            </p>
          </div>

          {/* New Note Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>إضافة ملاحظة جديدة حول أحد الدروس</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اختر الكورس:</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.teacherName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اختر الدرس:</label>
                  <select
                    value={selectedLessonTitle}
                    onChange={(e) => setSelectedLessonTitle(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    {allLessonsForActiveCourse.length === 0 ? (
                      <option value="ملاحظة عامة على الكورس">ملاحظة عامة على الكورس</option>
                    ) : (
                      allLessonsForActiveCourse.map((l) => (
                        <option key={l.id} value={l.title}>
                          {l.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص الملاحظة أو التلخيص:</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="سجّل النقاط المهمة، القوانين، الملاحظات، أو الأسئلة التي تحتاج مراجعتها مع الأستاذ..."
                  rows={3}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-purple-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300"
                  />
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>مشاركة هذه الملاحظة مع الأستاذ للاطلاع والرد 👨‍🏫</span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ الملاحظة في مفكرتي 💾</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notes List with Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-900">الملاحظات والملخصات المحفوظة ({filteredNotes.length})</h3>
              <input
                type="text"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                placeholder="بحث في الملاحظات..."
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl w-48 sm:w-64"
              />
            </div>

            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                لا توجد ملاحظات مسجلة حالياً. استخدم النموذج أعلاه لتدوين أول ملاحظة لك!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-400 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                          {note.courseTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{note.createdAt}</span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900">{note.lessonTitle}</h4>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {note.noteText}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleShare(note.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                          note.isSharedWithTeacher
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="تبديل المشاركة مع المعلم"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>{note.isSharedWithTeacher ? 'مشاركة مع المعلم ✓' : 'ملاحظة خاصة بي فقط'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: GRADES & EXAMS (سجل الدرجات والامتحانات) */}
      {/* ===================================================================== */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">سجل الامتحانات الشهرية وكشف الدرجات المعتمد</h2>
              <p className="text-xs text-slate-500 mt-0.5">درجاتك المسجلة من قِبل كبار الأساتذة والمرسلة لولي الأمر عبر واتساب.</p>
            </div>

            {studentGrades.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                لم يتم رصد درجات امتحانات مسجلة حتى الآن. ستظهر نتائجك هنا فور تصحيح الاختبارات من قِبل معلم المادة.
              </div>
            ) : (
              <div className="space-y-3">
                {studentGrades.map((g) => {
                  const percentage = Math.round((g.score / g.maxScore) * 100);
                  return (
                    <div
                      key={g.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{g.courseTitle}</h4>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                            {g.examTitle}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          تاريخ الامتحان: {g.examDate} • المعلم: {g.teacherName || 'الأستاذ المعتمد'}
                        </p>
                        {g.teacherNotes && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200/60 mt-2 font-medium">
                            ملاحظة الأستاذ: {g.teacherNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 block">الدرجة المحصلة</span>
                          <span className="text-lg font-black text-blue-700 font-mono">
                            {g.score} / {g.maxScore}
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 block">النسبة</span>
                          <span className={`text-base font-black font-mono ${percentage >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            %{percentage}
                          </span>
                        </div>

                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs">
                          {g.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: COURSES SHORTCUT */}
      {/* ===================================================================== */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">الكورسات المتاحة والمناهج الدراسية ({courses.length})</h3>
            <button
              onClick={() => onNavigate('teachers')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              عرض قائمة الأساتذة بالكامل ←
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => onOpenCourse && onOpenCourse(course)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-36 relative overflow-hidden bg-slate-950">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {course.gradeLevel}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {course.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>الأستاذ: {course.teacherName}</span>
                    <span className="text-emerald-700 font-bold">{course.isFree ? 'مجاني' : `${course.price} ج.م`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
