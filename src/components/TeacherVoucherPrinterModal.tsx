import React, { useState } from 'react';
import { Printer, X, Plus, KeyRound, CheckCircle, Sparkles, QrCode } from 'lucide-react';
import { Teacher, Course, ActivationCode } from '../types';
import { getStoredActivationCodes, saveStoredActivationCodes } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  courses: Course[];
  onCodesCreated?: () => void;
}

export const TeacherVoucherPrinterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  teacher,
  courses,
  onCodesCreated,
}) => {
  const teacherCourses = courses.filter((c) => c.teacherId === teacher.id || c.teacherName === teacher.name);
  const [selectedCourseId, setSelectedCourseId] = useState(teacherCourses[0]?.id || courses[0]?.id || '');
  const [prefix, setPrefix] = useState('NAGHMA-');
  const [count, setCount] = useState<number>(6);
  const [generatedBatch, setGeneratedBatch] = useState<ActivationCode[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  if (!isOpen) return null;

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = getStoredActivationCodes();
    const newCards: ActivationCode[] = [];

    for (let i = 0; i < count; i++) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const codeStr = `${prefix.trim().toUpperCase()}${randomSuffix}`;
      const newCode: ActivationCode = {
        id: `act-${Date.now()}-${i}`,
        code: codeStr,
        courseId: currentCourse.id,
        courseTitle: currentCourse.title,
        teacherId: teacher.id,
        teacherName: teacher.name,
        isUsed: false,
        createdAt: new Date().toISOString().split('T')[0],
        maxUses: 1,
        usedCount: 0,
      };
      newCards.push(newCode);
    }

    const updated = [...newCards, ...existing];
    saveStoredActivationCodes(updated);
    setGeneratedBatch(newCards);
    setIsGenerated(true);
    if (onCodesCreated) onCodesCreated();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">إنشاء وطباعة كروت الأكواد للكورس</h3>
              <p className="text-[11px] text-amber-100">بطاقات تفعيل جاهزة للطباعة والتسليم للطلاب - {teacher.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Options form */}
          <form onSubmit={handleGenerateBatch} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اختر الكورس المستهدف:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden font-bold"
              >
                {teacherCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">بادئة كود التفعيل:</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden font-mono uppercase"
                placeholder="NAGHMA-"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عدد الكروت المطلوب توليدها:</label>
              <input
                type="number"
                min={1}
                max={24}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden font-bold text-center"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              توليد البطاقات فوراً
            </button>
          </form>

          {/* Printable cards sheet preview */}
          {generatedBatch.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">معاينة بطاقات التفعيل الجاهزة للطباعة ({generatedBatch.length} كارت)</h4>
                  <p className="text-xs text-slate-500">جاهزة للطباعة على ورق مقوى وقصها لتوزيعها على طلاب السنتر أو الأونلاين</p>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  طباعة الكروت على الورق الآن
                </button>
              </div>

              {/* Grid of Printable Voucher Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 bg-slate-100 rounded-2xl border border-slate-300">
                {generatedBatch.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-white border-2 border-dashed border-amber-500/70 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <img src={teacher.avatar} alt={teacher.name} className="w-9 h-9 rounded-full object-cover border border-amber-400" />
                        <div>
                          <span className="text-[10px] text-amber-700 font-bold block">منصة نغمة العلم 🎓</span>
                          <strong className="text-xs text-slate-900 block">{teacher.name}</strong>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                    </div>

                    {/* Course Title */}
                    <div>
                      <span className="text-[10px] text-slate-400 block">بطاقة تفعيل كورس:</span>
                      <div className="text-xs font-bold text-blue-900 leading-snug line-clamp-2">
                        {currentCourse.title}
                      </div>
                    </div>

                    {/* Code Display */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-amber-800 font-bold block mb-0.5">كود التفعيل السري:</span>
                      <div className="text-base font-black font-mono tracking-widest text-slate-900 select-all">
                        {card.code}
                      </div>
                    </div>

                    {/* Student Name line for handwriting */}
                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>اسم الطالب: ......................</span>
                      <QrCode className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            تُحفظ كافة الأكواد المولدة تلقائياً في قاعدة البيانات ونظام تتبع الأكواد
          </span>
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
