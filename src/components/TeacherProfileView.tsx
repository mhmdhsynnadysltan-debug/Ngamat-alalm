import React, { useState } from 'react';
import { 
  Teacher, Course, AuthUser 
} from '../types';
import { 
  Award, MessageSquare, KeyRound, BookOpen, Star, 
  Users, Phone, CheckCircle2, ArrowRight, Printer, Sparkles, Lock, Unlock 
} from 'lucide-react';
import { TeacherGroupChat } from './TeacherGroupChat';
import { TeacherVoucherPrinterModal } from './TeacherVoucherPrinterModal';

interface Props {
  teacher: Teacher;
  courses: Course[];
  currentUser: AuthUser | null;
  onBackToTeachers: () => void;
  onSelectCourse: (course: Course) => void;
  onOpenActivationModal: (course: Course) => void;
  onOpenTeacherGradeModal: (teacher: Teacher) => void;
  activatedCourseIds: string[];
}

export const TeacherProfileView: React.FC<Props> = ({
  teacher,
  courses,
  currentUser,
  onBackToTeachers,
  onSelectCourse,
  onOpenActivationModal,
  onOpenTeacherGradeModal,
  activatedCourseIds,
}) => {
  const teacherCourses = courses.filter((c) => c.teacherId === teacher.id || c.teacherName === teacher.name);
  const [activeTab, setActiveTab] = useState<'courses' | 'chat'>('courses');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6 text-right">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToTeachers}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لاختيار أستاذ آخر</span>
        </button>

        <span className="text-xs text-slate-500 font-bold">
          ملف المعلم الرسمي المعتمد 🎓
        </span>
      </div>

      {/* Teacher Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative shrink-0">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-amber-400 shadow-xl"
            />
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900" title="معلم معتمد">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">{teacher.name}</h1>
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                {teacher.subject}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-blue-200 font-semibold">{teacher.title}</p>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{teacher.bio}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>التقييم العام: <strong>{teacher.rating} / 5</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span><strong>{teacher.studentsCount.toLocaleString()}</strong> طالب مسجل</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="font-mono dir-ltr">{teacher.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons for this specific teacher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          {/* 1. Teacher Grade Upload Button (Visible to Teacher & Admin only) */}
          {isTeacherOrAdmin && (
            <button
              onClick={() => onOpenTeacherGradeModal(teacher)}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>زر رفع درجات أولياء الأمور (خاص بالمعلم) 📊</span>
            </button>
          )}

          {/* 2. Print & Create Vouchers Button (Visible to Teacher & Admin only) */}
          {isTeacherOrAdmin && (
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>إنشاء وطباعة كروت الأكواد للكورس 🎫</span>
            </button>
          )}

          {/* 3. Group Chat switch */}
          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? 'courses' : 'chat')}
            className={`p-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-slate-950 border-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>{activeTab === 'chat' ? 'العودة لقائمة الكورسات' : `الدردشة الجماعية لطلاب ${teacher.name}`}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Area */}
      {activeTab === 'chat' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">غرفة الدردشة والمناقشة الجماعية لطلاب {teacher.name}</h3>
            <button
              onClick={() => setActiveTab('courses')}
              className="text-xs text-blue-700 font-bold hover:underline"
            >
              عرض الكورسات والمحاضرات ←
            </button>
          </div>
          <TeacherGroupChat teacher={teacher} currentUser={currentUser} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                كورسات ومناهج {teacher.name} ({teacherCourses.length}) 📚
              </h3>
              <p className="text-xs text-slate-500">
                اختر الكورس للبدء في مسار التعلم المتسلسل وحل الكويزات لفك قفل المحاضرات
              </p>
            </div>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>دخول دردشة الطلاب الجماعية</span>
            </button>
          </div>

          {/* Courses Grid */}
          {teacherCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-800">لا توجد كورسات مضافة لهذا المعلم حالياً</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                يتم حالياً تجهيز ورفع المحاضرات والمناهج الدراسية الجديدة. تفضل بزيارة غرفة الدردشة للتواصل مع الأستاذ.
              </p>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                دخول غرفة الدردشة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherCourses.map((course) => {
              const isActivated = activatedCourseIds.includes(course.id) || !course.requiresActivationCode;
              const lessonsTotal = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        {course.gradeLevel}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded shadow-xs">
                        {course.price} ج.م
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <span>{lessonsTotal} محاضرات تفاعلية</span>
                        <span className="font-semibold text-emerald-700">نظام القفل المتسلسل 🔒</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" />
                        {isActivated ? 'دخول الكورس والمحاضرات' : 'استعراض محتوى الكورس'}
                      </button>

                      {!isActivated && course.requiresActivationCode ? (
                        <button
                          onClick={() => onOpenActivationModal(course)}
                          className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors"
                          title="تفعيل الكورس بكود التفعيل"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                          <Unlock className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    {!isActivated && course.requiresActivationCode && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>يلزم إدخال كود التفعيل</span>
                        <button
                          onClick={() => onOpenActivationModal(course)}
                          className="text-amber-700 font-bold hover:underline"
                        >
                          تفعيل الكود الآن ⚡
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Voucher Printer Modal */}
      <TeacherVoucherPrinterModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        teacher={teacher}
        courses={courses}
      />
    </div>
  );
};
