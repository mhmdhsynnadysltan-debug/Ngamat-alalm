import React, { useState } from 'react';
import { BookOpen, GraduationCap, Lock, Unlock, Star, Users, ArrowLeft, Check, Sparkles, Filter, ChevronLeft } from 'lucide-react';
import { Course, Teacher, EducationalStage } from '../types';
import { STAGES } from '../data/mockData';

interface Props {
  courses: Course[];
  teachers: Teacher[];
  activatedCourseIds: string[];
  onSelectCourse: (course: Course) => void;
  onOpenActivationModal: (course: Course) => void;
  onOpenWhatsApp: (topic?: string) => void;
}

export const StagesBrowser: React.FC<Props> = ({
  courses,
  teachers,
  activatedCourseIds,
  onSelectCourse,
  onOpenActivationModal,
  onOpenWhatsApp,
}) => {
  const [selectedStage, setSelectedStage] = useState<'all' | EducationalStage>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredCourses = courses.filter((c) => {
    const matchStage = selectedStage === 'all' || c.stage === selectedStage;
    const matchSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    return matchStage && matchSubject;
  });

  const subjects = Array.from(new Set(courses.map((c) => c.subject)));

  return (
    <div className="space-y-8 text-right">
      {/* Stages Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAGES.map((st) => {
          const isCurrent = selectedStage === st.id;
          const coursesCount = courses.filter((c) => c.stage === st.id).length;

          return (
            <div
              key={st.id}
              onClick={() => setSelectedStage(selectedStage === st.id ? 'all' : st.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                isCurrent
                  ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-blue-500 shadow-lg ring-2 ring-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {coursesCount} كورسات متاحة
                </span>
                <span className="text-xl">
                  {st.id === 'primary' ? '🌱' : st.id === 'preparatory' ? '📐' : '🎓'}
                </span>
              </div>

              <h3 className={`text-lg font-black ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                {st.name}
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                {st.subtitle}
              </p>

              {/* Grades preview */}
              <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-slate-200/50">
                {st.grades.map((grade, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      isCurrent ? 'bg-white/10 text-slate-200' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {grade}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Subject Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedStage('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedStage === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            جميع المراحل ({courses.length})
          </button>
          {STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedStage === st.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>

        {/* Subject filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">تصفية المادة:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="all">كل المواد الدراسية</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isActivated = activatedCourseIds.includes(course.id) || !course.requiresActivationCode;
          const lessonsTotal = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {course.gradeLevel}
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                    <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                      {course.price} ج.م
                    </span>
                    <span className="text-xs bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      {lessonsTotal} محاضرات
                    </span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-blue-700 font-bold">
                    <span>{course.subject}</span>
                    <span>·</span>
                    <span>{course.stage === 'secondary' ? 'المرحلة الثانوية' : course.stage === 'preparatory' ? 'المرحلة الإعدادية' : 'المرحلة الابتدائية'}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Teacher card info */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <img
                      src={course.teacherAvatar}
                      alt={course.teacherName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-400 block">المعلم المعتمد</span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{course.teacherName}</h4>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1.5 pt-1">
                    {course.features.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: 100% functional */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    {isActivated ? 'دخول الكورس والمحاضرات' : 'استعراض المحتوى والمسار'}
                  </button>

                  {!isActivated && course.requiresActivationCode ? (
                    <button
                      onClick={() => onOpenActivationModal(course)}
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors"
                      title="فك قفل الكورس بكود التفعيل"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  ) : (
                    <span
                      className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl"
                      title="الكورس مفتوح ومفعل"
                    >
                      <Unlock className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {!isActivated && course.requiresActivationCode && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>متاح كود تجريبي مجاناً</span>
                    <button
                      onClick={() => onOpenActivationModal(course)}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      تفعيل سريع ⚡
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teachers Spotlight Section */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">نخبة كبار المعلمين المعتمدين 👩‍🏫</h3>
            <p className="text-xs text-slate-500">نخبة من أساتذة الجمهورية ومؤلفي كتب الوزارة وسلاسل التفوق</p>
          </div>
          <button
            onClick={() => onOpenWhatsApp('طلب انضمام معلم جديد لمنصة نغمة العلم')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            انضم كمعلم معتمد في نغمة العلم ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teachers.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-center space-y-2 hover:border-blue-300 transition-colors"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-blue-100"
              />
              <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
              <p className="text-[11px] text-blue-700 font-semibold">{t.title}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 pt-1">
                <span>⭐ {t.rating}</span>
                <span>👥 {t.studentsCount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
