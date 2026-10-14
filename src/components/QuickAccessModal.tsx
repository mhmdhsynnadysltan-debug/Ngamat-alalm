import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, User, GraduationCap, Shield, Award, MessageCircle, KeyRound, Zap, Sparkles } from 'lucide-react';
import { Course, Teacher } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  teachers: Teacher[];
  onSelectCourse: (course: Course) => void;
  onOpenTeacherGradeModal: () => void;
  onOpenWhatsApp: (topic?: string) => void;
  onSwitchRole: (role: 'student' | 'teacher' | 'parent' | 'admin') => void;
  onGoToSection: (sectionId: string) => void;
}

export const QuickAccessModal: React.FC<Props> = ({
  isOpen,
  onClose,
  courses,
  teachers,
  onSelectCourse,
  onOpenTeacherGradeModal,
  onOpenWhatsApp,
  onSwitchRole,
  onGoToSection,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'grades-tool',
      title: 'رفع تقرير درجات أولياء الأمور 📊',
      subtitle: 'أداة المعلم الخاصة لرصد نتائج الامتحانات وإرسالها فوراً لولي الأمر',
      category: 'أدوات الأساتذة',
      icon: Award,
      action: () => {
        onClose();
        onOpenTeacherGradeModal();
      },
    },
    {
      id: 'teacher-login-action',
      title: 'بوابة دخول الأساتذة 👨‍🏫',
      subtitle: 'تسجيل دخول الأساتذة المعتمدين لمتابعة الطلاب والأكواد',
      category: 'أدوات الأساتذة',
      icon: Award,
      action: () => {
        onClose();
        onSwitchRole('teacher');
      },
    },
    {
      id: 'admin-dash',
      title: 'بوابة المنشئ السرية (لوحة التحكم) 🔒',
      subtitle: 'محمية برمز سري خاص لإدارة الكورسات والمناهج والمحتوى بالكامل',
      category: 'لوحة الإدارة',
      icon: Shield,
      action: () => {
        onClose();
        onSwitchRole('admin');
        onGoToSection('admin-section');
      },
    },
    {
      id: 'parent-portal',
      title: 'بوابة متابعة ولي الأمر 👨‍👩‍👦',
      subtitle: 'كشف درجات الابن، نسبة الحضور، والملاحظات التربوية',
      category: 'أولياء الأمور',
      icon: User,
      action: () => {
        onClose();
        onSwitchRole('parent');
        onGoToSection('parent-section');
      },
    },
    {
      id: 'whatsapp-support',
      title: 'الدعم الفني عبر واتساب 💬',
      subtitle: 'محادثة فورية لحل أي مشكلة تقنية أو استفسار كود تفعيل',
      category: 'الدعم والمساعدة',
      icon: MessageCircle,
      action: () => {
        onClose();
        onOpenWhatsApp();
      },
    },
    {
      id: 'leaderboard-sec',
      title: 'لوحة شرف الأوائل والمسابقات 🏆',
      subtitle: 'ترتيب عباقرة نغمة العلم وتحديات الأسبوع والـ XP',
      category: 'الطلاب والتحفيز',
      icon: Sparkles,
      action: () => {
        onClose();
        onGoToSection('leaderboard-section');
      },
    },
  ];

  const filteredCourses = courses.filter(
    (c) =>
      c.title.includes(query) ||
      c.subject.includes(query) ||
      c.teacherName.includes(query) ||
      c.gradeLevel.includes(query)
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.includes(query) ||
      t.subject.includes(query) ||
      t.title.includes(query)
  );

  const filteredActions = quickActions.filter(
    (a) =>
      a.title.includes(query) ||
      a.subtitle.includes(query) ||
      a.category.includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="الوصول السريع: ابحث عن مادة، كورس، معلم، أو أداة في أقل من ثانية..."
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden text-right"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
              ⚡ سريع
            </span>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-5 text-right flex-1">
          {/* Quick Platform Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>إجراءات وأدوات الوصول السريع</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="text-right p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-start gap-2.5 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                          {action.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {action.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courses Search */}
          {filteredCourses.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>الكورسات والمناهج الدراسية ({filteredCourses.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onSelectCourse(c);
                    }}
                    className="w-full text-right p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-slate-50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.thumbnail}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {c.gradeLevel} · المعلم: {c.teacherName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 font-mono">
                      {c.price} ج.م
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teachers Search */}
          {filteredTeachers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>المعلمون المعتمدون ({filteredTeachers.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center gap-2.5"
                  >
                    <img
                      src={t.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 &&
            filteredCourses.length === 0 &&
            filteredTeachers.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                لا توجد نتائج مطابقة لبحثك "{query}". جرب كلمة أخرى مثل: فيزياء، رياضيات، درجات، أدمن...
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>نصيحة:</span>
            <span>استخدم الوصول السريع للتنقل الفوري في أي لحظة</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
