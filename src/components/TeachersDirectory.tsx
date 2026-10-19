import React, { useState } from 'react';
import { Teacher, Course, AuthUser } from '../types';
import { Star, Users, Award, BookOpen, MessageSquare, Sparkles, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  teachers: Teacher[];
  courses: Course[];
  onSelectTeacher: (teacher: Teacher) => void;
  onOpenTeacherGradeModal: (teacher: Teacher) => void;
  onOpenWhatsApp: (topic?: string) => void;
  currentUser?: AuthUser | null;
}

export const TeachersDirectory: React.FC<Props> = ({
  teachers,
  courses,
  onSelectTeacher,
  onOpenTeacherGradeModal,
  onOpenWhatsApp,
  currentUser,
}) => {
  const [searchSubject, setSearchSubject] = useState('all');
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const subjects = Array.from(new Set(teachers.map((t) => t.subject)));
  const filtered = teachers.filter((t) => searchSubject === 'all' || t.subject === searchSubject);

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner Notice */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              النظام المباشر للمعلمين
            </span>
            <span className="text-xs text-slate-500">تم إلغاء تعقيد المراحل الدراسية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            اختر الأستاذ الذي تريد الانضمام إليه مباشرة 👨‍🏫
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            لكل أستاذ ملفه الخاص، كورساته، زر مخصص لرفع درجات أولياء الأمور، غرفة دردشة جماعية تفاعلية، وطباعة كروت الأكواد.
          </p>
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">تصفية التخصص:</span>
          <select
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="all">كافة التخصصات والمواد ({teachers.length})</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">لا يوجد معلمون في هذا التخصص حالياً</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            يمكنك اختيار "كافة التخصصات والمواد" لعرض جميع الأساتذة المعتمدين في المنظومة.
          </p>
          <button
            onClick={() => setSearchSubject('all')}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            عرض كافة المعلمين
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => {
            const teacherCoursesCount = courses.filter(
              (c) => c.teacherId === t.id || c.teacherName === t.name
            ).length;

          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-400"
            >
              <div>
                {/* Header Profile Info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          {t.name}
                        </h3>
                      </div>
                      <span className="text-xs text-blue-700 font-bold block mt-0.5">
                        {t.title}
                      </span>
                      <span className="inline-block mt-1 bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold px-2 py-0.2 rounded-md">
                        مادة: {t.subject}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {t.bio}
                  </p>

                  {/* Numbers */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">التقييم</span>
                      <strong className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {t.rating}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الطلاب</span>
                      <strong className="text-xs font-black text-slate-800 font-mono">
                        {t.studentsCount.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الكورسات</span>
                      <strong className="text-xs font-black text-blue-700 font-mono">
                        {teacherCoursesCount}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => onSelectTeacher(t)}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>انضم للأستاذ ودخول الكورسات والدردشة</span>
                </button>

                <div className="flex items-center gap-2">
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => onOpenTeacherGradeModal(t)}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                      title="زر رفع الدرجات الخاص بهذا المعلم (خاص بالمعلم)"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>زر رفع الدرجات</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectTeacher(t)}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                    title="الدردشة الجماعية لطلاب الأستاذ"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الدردشة الجماعية</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
};
