import React, { useState } from 'react';
import { 
  Lock, Unlock, CheckCircle2, PlayCircle, FileText, ArrowRight, 
  HelpCircle, Sparkles, BookOpen, Clock, Download, Share2, 
  Award, MessageSquare, ChevronDown, Check, User, GraduationCap, Star,
  Plus, Edit3, Video, AlertCircle
} from 'lucide-react';
import { Course, Lesson, QuizQuestion, AuthUser } from '../types';
import { 
  getCompletedLessonIds, markLessonCompleted, 
  updateLessonQuiz 
} from '../utils/storage';
import { QuizModal } from './QuizModal';
import { QuizEditorModal } from './QuizEditorModal';
import { CertificateModal } from './CertificateModal';
import { ToastNotificationContainer, ToastItem } from './ToastNotification';

interface Props {
  course: Course;
  onBack: () => void;
  onOpenActivationModal: () => void;
  isCourseActivated: boolean;
  onOpenTeacherGradeModal: () => void;
  currentUser?: AuthUser | null;
}

export const CourseViewer: React.FC<Props> = ({
  course,
  onBack,
  onOpenActivationModal,
  isCourseActivated,
  onOpenTeacherGradeModal,
  currentUser,
}) => {
  const [currentCourse, setCurrentCourse] = useState<Course>(course);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(getCompletedLessonIds());
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Find all lessons flattened
  const allLessons: Lesson[] = currentCourse.chapters.flatMap((c) => c.lessons);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(allLessons[0]);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'essay'>('video');

  // Quiz Modal & Editor Modal states
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isQuizEditorOpen, setIsQuizEditorOpen] = useState(false);

  // Essay student answer state
  const [essayAnswer, setEssayAnswer] = useState('');
  const [essaySubmitted, setEssaySubmitted] = useState(false);

  // Toast Helpers
  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check if a lesson is unlocked
  // Rule: Lesson 1 is always unlocked if course is activated.
  // Lesson N is unlocked if Lesson N-1 is in completedLessonIds!
  const isLessonUnlocked = (lessonIndex: number, lessonId: string) => {
    if (!isCourseActivated && currentCourse.requiresActivationCode) return false;
    if (lessonIndex === 0) return true;
    const previousLesson = allLessons[lessonIndex - 1];
    return completedLessonIds.includes(previousLesson.id) || completedLessonIds.includes(lessonId);
  };

  const handleLessonPassed = (nextLessonId?: string) => {
    const prevCompletedCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
    const updated = getCompletedLessonIds();
    setCompletedLessonIds(updated);

    const newCompletedCount = allLessons.filter((l) => updated.includes(l.id)).length;
    const total = allLessons.length;
    const prevPercent = total > 0 ? (prevCompletedCount / total) * 100 : 0;
    const newPercent = total > 0 ? (newCompletedCount / total) * 100 : 0;

    // Toast Milestone: 50% course progress
    if (prevPercent < 50 && newPercent >= 50) {
      addToast({
        type: 'milestone',
        title: 'إنجاز رائع 50%! 🌟',
        message: 'أحسنت يا بطل! لقد قطعت نصف الطريق نحو التفوق والتميز وأتممت 50% من محتوى الكورس! استمر في التألق والجدية، فالقمة بانتظارك!',
        duration: 8000,
      });
    }

    // Toast Milestone: 100% course completion
    if (prevPercent < 100 && newPercent >= 100) {
      addToast({
        type: 'milestone',
        title: 'مبارك التخرج من الكورس بنسبة 100%! 🎓🏆',
        message: 'إنجاز استثنائي! أتممت كافة دروس ووحدات المنهج واجتزت جميع الكويزات بنجاح. أصبحت شهادة التقدير الرسمية المعتمدة جاهزة للتحميل الفوري الآن!',
        actionText: 'عرض شهادة التقدير 📜',
        onAction: () => setIsCertificateOpen(true),
        duration: 9000,
      });
    }

    if (nextLessonId) {
      const nextLes = allLessons.find((l) => l.id === nextLessonId);
      if (nextLes) {
        setSelectedLesson(nextLes);
      }
    }
  };

  const handleQuizFailed = (score: number, passingScore: number) => {
    addToast({
      type: 'warning',
      title: 'تنبيه تربوي: لم تجتز الكويز هذه المرة',
      message: `حصلت على ${score}% بينما درجة النجاح المطلوبة لفك القفل هي ${passingScore}%. نوصيك بإعادة مشاهدة فيديو الدرس والتركيز على النقاط التوضيحية ثم إعادة المحاولة لتحقيق التفوق وفك قفل الدرس التالي! 💡📺`,
      actionText: 'مراجعة فيديو الدرس الآن 📺',
      onAction: () => {
        setActiveTab('video');
        setIsQuizOpen(false);
      },
      duration: 8000,
    });
  };

  const handleSaveQuiz = (newQuiz: {
    passingScore: number;
    durationMinutes: number;
    title?: string;
    questions: QuizQuestion[];
  }) => {
    const updatedCourses = updateLessonQuiz(currentCourse.id, selectedLesson.id, newQuiz);
    const updatedCourse = updatedCourses.find((c) => c.id === currentCourse.id) || {
      ...currentCourse,
      chapters: currentCourse.chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((les) => (les.id === selectedLesson.id ? { ...les, quiz: newQuiz } : les)),
      })),
    };
    setCurrentCourse(updatedCourse);
    setSelectedLesson((prev) => ({ ...prev, quiz: newQuiz }));
    setIsQuizEditorOpen(false);

    addToast({
      type: 'success',
      title: 'تم حفظ وتفعيل الكويز بنجاح! 🚀',
      message: `تم تحديث كويز (${selectedLesson.title}) بنجاح بمؤقت ${newQuiz.durationMinutes} دقائق و${newQuiz.questions.length} أسئلة ونسبة نجاح ${newQuiz.passingScore}%. أصبح متاحاً للطلاب الآن!`,
      duration: 6000,
    });
  };

  const handleManualUnlockNext = (lessonId: string) => {
    markLessonCompleted(lessonId);
    setCompletedLessonIds(getCompletedLessonIds());
  };

  const completedInThisCourseCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const isAllCourseCompleted = allLessons.length > 0 && completedInThisCourseCount === allLessons.length;



  const currentLessonIndex = allLessons.findIndex((l) => l.id === selectedLesson.id);
  const nextLesson = allLessons[currentLessonIndex + 1];
  const isCurrentCompleted = completedLessonIds.includes(selectedLesson.id);

  return (
    <div dir="rtl" className="space-y-6 text-right">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لقائمة المناهج
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">{currentCourse.title}</h1>
            <span className="text-[11px] text-slate-500">{currentCourse.gradeLevel} · أستاذ المادة: {currentCourse.teacherName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Certificate Download Button (Golden when all completed, or preview) */}
          {isAllCourseCompleted ? (
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 animate-pulse"
            >
              <Award className="w-4 h-4 text-slate-950" />
              تحميل شهادة التقدير 📜✨ (مكتمل 100%)
            </button>
          ) : (
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="px-3 py-2 bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              title="تُفتح الشهادة الرسمية عند إتمام جميع دروس المنهج واجتياز الكويزات"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>شهادة التقدير ({completedInThisCourseCount}/{allLessons.length})</span>
            </button>
          )}

          {!isCourseActivated && currentCourse.requiresActivationCode ? (
            <button
              onClick={onOpenActivationModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 animate-pulse"
            >
              <Lock className="w-4 h-4" />
              تفعيل الكورس بكود التفعيل
            </button>
          ) : (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              الكورس مفعّل بالكامل ✓
            </span>
          )}

          {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
            <button
              onClick={onOpenTeacherGradeModal}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              رفع تقرير لولي الأمر (خاص بالمعلم)
            </button>
          )}
        </div>
      </div>

      {/* Course Completion & Certificate Celebration Banner */}
      {isAllCourseCompleted && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-amber-300 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">تهانينا الحارة يا بطل! تم إتمام المنهج بالكامل بنجاح 🎓</h2>
                <span className="bg-slate-950 text-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  القفل النهائي مفتوح ✓
                </span>
              </div>
              <p className="text-xs text-slate-900 font-semibold mt-0.5">
                اجتزت جميع المحاضرات والكويزات بنجاح. أصبحت شهادة التقدير الرسمية المعتمدة جاهزة للتحميل الفوري باسمك وباسم أستاذ المادة.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-400" />
            عرض وتحميل شهادة التقدير الرقمية 📜
          </button>
        </div>
      )}

      {/* Main Content Grid: 8 Cols Player/Details + 4 Cols Sequential Outline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Section (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Video Player or Locked state */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center text-white shadow-lg">
            {!isCourseActivated && currentCourse.requiresActivationCode ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">هذا الكورس محمي بنظام أكواد التفعيل</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  للوصول إلى الفيديوهات وحل الامتحانات، يرجى إدخال كود التفعيل المخصص لهذا الكورس.
                </p>
                <button
                  onClick={onOpenActivationModal}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition-all"
                >
                  إدخال كود التفعيل الآن
                </button>
              </div>
            ) : !isLessonUnlocked(currentLessonIndex, selectedLesson.id) ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold">المحاضرة مقفلة بنظام القفل المتسلسل 🔒</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  وفقاً لنظام نغمة العلم التربوي، يجب أولاً إتقان واجتياز كويز المحاضرة السابقة بنسبة {allLessons[Math.max(0, currentLessonIndex - 1)]?.quiz?.passingScore || 70}% على الأقل لفك قفل هذه المحاضرة.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (currentLessonIndex > 0) {
                        setSelectedLesson(allLessons[currentLessonIndex - 1]);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    الانتقال للمحاضرة السابقة لحل الكويز
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative group">
                <iframe
                  className="w-full h-full"
                  src={`${selectedLesson.videoUrl}?autoplay=0`}
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Lesson Action Bar & Meta */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded">
                  المحاضرة رقم {currentLessonIndex + 1}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1.5">{selectedLesson.title}</h2>
              </div>

              {/* Quiz Buttons & Creation Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedLesson.quiz ? (
                  <>
                    <button
                      onClick={() => setIsQuizOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isCurrentCompleted ? 'مراجعة الكويز الإلكتروني (مجتاز ✓)' : 'بدء الكويز الإلكتروني لفك القفل ⚡'}</span>
                    </button>

                    <button
                      onClick={() => setIsQuizEditorOpen(true)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      title="تعديل أسئلة الكويز والمؤقت الزمني"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>تعديل الكويز</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsQuizEditorOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء كويز لهذا الدرس 📝</span>
                  </button>
                )}

                {isCurrentCompleted && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    تم الإتقان
                  </span>
                )}
              </div>
            </div>

            {/* Quiz Info Badge */}
            {selectedLesson.quiz && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    مؤقت الاختبار: <strong>{selectedLesson.quiz.durationMinutes || 5} دقائق</strong>
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    نسبة النجاح لفك القفل: <strong>{selectedLesson.quiz.passingScore}%</strong>
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    عدد الأسئلة: <strong>{selectedLesson.quiz.questions.length}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  تصحيح فوري ⚡
                </span>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pt-2">
              <button
                onClick={() => setActiveTab('video')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'video'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                ملخص وشرح المحاضرة
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                المذكرة وملف PDF
              </button>
              {selectedLesson.essayQuestion && (
                <button
                  onClick={() => setActiveTab('essay')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'essay'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  السؤال المقالي والتصحيح
                </button>
              )}
            </div>

            {/* Tab 1: Video Summary */}
            {activeTab === 'video' && (
              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p>{selectedLesson.summary}</p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>مدة المحاضرة: {selectedLesson.duration}</span>
                  </div>
                  <span className="text-slate-500">جودة Full HD 1080p</span>
                </div>
              </div>
            )}

            {/* Tab 2: Notes & PDF */}
            {activeTab === 'notes' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <FileText className="w-5 h-5 text-rose-600" />
                    <span>مذكرة الشرح والتدريبات النموذجية (PDF)</span>
                  </div>
                  <button
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'جاري تحميل المذكرة',
                        message: `بدء تحميل مذكرة المحاضرة (${selectedLesson.title}) بصيغة PDF الملونة.`,
                      });
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تحميل المذكرة
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  تحتوي المذكرة على خرائط ذهنية ملونة، القوانين المستنتجة، وأكثر من 50 سؤالاً من امتحانات السنوات السابقة وبنك المعرفة.
                </p>
              </div>
            )}

            {/* Tab 3: Essay question */}
            {activeTab === 'essay' && selectedLesson.essayQuestion && (
              <div className="space-y-4">
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                  <span className="font-bold text-amber-900 block">السؤال المقالي للدرس:</span>
                  <p className="text-slate-800 text-sm font-semibold">{selectedLesson.essayQuestion.question}</p>
                  <span className="text-[11px] text-amber-800 font-mono block">الدرجة المخصصة: {selectedLesson.essayQuestion.maxScore} درجات</span>
                </div>

                {!essaySubmitted ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">اكتب إجابتك المقالية النموذجية هنا:</label>
                    <textarea
                      rows={4}
                      value={essayAnswer}
                      onChange={(e) => setEssayAnswer(e.target.value)}
                      placeholder="اشرح بالتفصيل مع ذكر الأسباب العلمية..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!essayAnswer.trim()) {
                          addToast({
                            type: 'warning',
                            title: 'تنبيه',
                            message: 'يرجى كتابة الإجابة المقالية أولاً قبل التسليم.',
                          });
                          return;
                        }
                        setEssaySubmitted(true);
                        addToast({
                          type: 'success',
                          title: 'تم تسليم السؤال المقالي 📝',
                          message: 'وصلت إجابتك المقالية لمعلم المادة للمراجعة والرصد بنجاح.',
                        });
                      }}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      تسليم الإجابة المقالية للمراجعة
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم تسليم الإجابة بنجاح ووصلت لمعلم المادة للتصحيح والرصد!</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100">
                      <strong className="block text-slate-800 mb-1">الإجابة النموذجية الاسترشادية:</strong>
                      <p className="text-slate-700 leading-relaxed">{selectedLesson.essayQuestion.modelAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Sequential Units & Lessons Outline (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                المسار التعليمي المتسلسل
              </h3>
              <span className="text-[11px] text-slate-500 font-bold">
                {completedLessonIds.filter((id) => allLessons.some((l) => l.id === id)).length} من {allLessons.length} مكتمل
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (completedLessonIds.filter((id) => allLessons.some((l) => l.id === id)).length /
                      allLessons.length) *
                      100
                  )}%`,
                }}
              />
            </div>

            <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100/80">
              💡 <strong>نظام القفل:</strong> لا يُفتح الدرس التالي إلا بعد اجتياز كويز الدرس السابق بنجاح.
            </div>

            {/* Chapters list */}
            <div className="space-y-4 pt-1">
              {currentCourse.chapters.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {chapter.title}
                  </div>

                  <div className="space-y-1.5 pr-1">
                    {chapter.lessons.map((lesson, idx) => {
                      const lessonGlobalIndex = allLessons.findIndex((l) => l.id === lesson.id);
                      const isUnlocked = isLessonUnlocked(lessonGlobalIndex, lesson.id);
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isSelected = selectedLesson.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-400 text-blue-900 ring-1 ring-blue-400/40 shadow-xs'
                              : isUnlocked
                              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              : 'bg-slate-50 border-slate-200/60 text-slate-400'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isUnlocked ? (
                              <PlayCircle className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="font-bold truncate leading-tight">{lesson.title}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                              <span>⏱️ {lesson.duration}</span>
                              {lesson.quiz && (
                                <span className="text-blue-600 font-semibold">
                                  📝 كويز ({lesson.quiz.durationMinutes || 5}د)
                                </span>
                              )}
                              {!isUnlocked && (
                                <span className="text-rose-500 font-semibold">مقفل 🔒</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Final Lock Milestone: Official Certificate of Appreciation */}
              <div className="pt-2">
                <div
                  className={`p-3.5 rounded-2xl border transition-all text-xs ${
                    isAllCourseCompleted
                      ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-amber-400 text-amber-950 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isAllCourseCompleted ? (
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                          <Award className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          القفل النهائي: شهادة التقدير الرسمية 🏆
                        </span>
                        {isAllCourseCompleted ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            مفتوح ✓
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                            مقفل 🔒
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 mb-2.5">
                        {isAllCourseCompleted
                          ? 'أحسنت! فتحت القفل النهائي وتم اعتماد شهادة التقدير الرسمية بإشراف أستاذ المادة.'
                          : `يتطلب إتمام كافة دروس ووحدات المنهج (${completedInThisCourseCount} من ${allLessons.length} مكتمل).`}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setIsCertificateOpen(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAllCourseCompleted
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          {isAllCourseCompleted ? 'تحميل الشهادة الآن (PNG)' : 'معاينة الشهادة الرقمية'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Taking Modal */}
      {selectedLesson.quiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          lesson={selectedLesson}
          nextLesson={nextLesson}
          onPassed={handleLessonPassed}
          onFailed={handleQuizFailed}
          onOpenEditor={() => {
            setIsQuizOpen(false);
            setIsQuizEditorOpen(true);
          }}
          onReviewVideo={() => setActiveTab('video')}
        />
      )}

      {/* Quiz Creation & Editor Modal */}
      <QuizEditorModal
        isOpen={isQuizEditorOpen}
        onClose={() => setIsQuizEditorOpen(false)}
        lesson={selectedLesson}
        courseTitle={currentCourse.title}
        onSaveQuiz={handleSaveQuiz}
      />

      {/* Digital Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        course={currentCourse}
        studentName={currentUser?.name}
      />

      {/* In-App Toast Notifications */}
      <ToastNotificationContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
};
