import React, { useState } from 'react';
import { Search, UserCheck, Award, Calendar, CheckCircle2, AlertCircle, MessageSquare, Printer, Sparkles, BookOpen } from 'lucide-react';
import { StudentGradeRecord } from '../types';
import { getStoredGradeRecords } from '../utils/storage';

interface Props {
  onOpenTeacherGradeModal: () => void;
  onOpenWhatsApp: (topic?: string) => void;
}

export const ParentPortalView: React.FC<Props> = ({ onOpenTeacherGradeModal, onOpenWhatsApp }) => {
  const [records] = useState<StudentGradeRecord[]>(getStoredGradeRecords());
  const [searchTerm, setSearchTerm] = useState('ST-101'); // default search so data is displayed immediately
  const [selectedRecord, setSelectedRecord] = useState<StudentGradeRecord | null>(records[0] || null);

  const filtered = records.filter(
    (r) =>
      r.studentName.includes(searchTerm) ||
      r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parentPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-right">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-blue-950 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                بوابة أولياء الأمور الذكية
              </span>
              <span className="text-xs text-blue-200">متابعة يومية ومباشرة لمستوى الطالب</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">تقرير متابعة درجات واختبارات الطالب 👨‍👩‍👦</h1>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
              تابع نتائج الامتحانات الشهرية، نسبة الحضور، وتوصيات المعلمين المعتمدين أولاً بأول لضمان تحقيق أعلى الدرجات.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenTeacherGradeModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              أداة المعلم لرفع درجات جديدة 📊
            </button>
          </div>
        </div>

        {/* Search bar for parents */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم كود الطالب (مثال: ST-101)، رقم الهاتف، أو اسم الابن..."
              className="w-full text-xs pr-10 pl-4 py-2.5 bg-white text-slate-900 rounded-xl focus:outline-hidden font-bold"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-blue-200">
            <span className="text-amber-300 font-bold">نماذج سريعة:</span>
            {['ST-101', 'ST-102', 'ST-201', 'ST-301'].map((code) => (
              <button
                key={code}
                onClick={() => setSearchTerm(code)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded font-mono text-[11px] font-bold text-white transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Student results cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Records */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>التقارير المتوفرة ({filtered.length})</span>
            <span className="text-slate-400 font-normal">اختر تقريراً لعرض التفاصيل الكاملة</span>
          </div>

          <div className="space-y-2.5">
            {filtered.map((record) => {
              const isSelected = selectedRecord?.id === record.id;
              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 rounded-xl border text-right cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{record.studentName}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        كود: {record.studentId} · {record.gradeLevel}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        record.status === 'ممتاز'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.status === 'جيد جداً'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{record.examTitle}</span>
                    <span className="font-bold text-blue-700 font-mono">
                      {record.score} / {record.maxScore}
                    </span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                لم يتم العثور على تقارير مطابقة لبحثك. تأكد من كود الطالب أو تواصل مع الدعم الفني.
              </div>
            )}
          </div>
        </div>

        {/* Right Details Card */}
        <div className="lg:col-span-7">
          {selectedRecord ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded">
                    بطاقة التقرير المعتمدة لولي الأمر
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedRecord.studentName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedRecord.courseTitle} - {selectedRecord.gradeLevel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                    title="طباعة التقرير"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenWhatsApp(`استفسار ولي أمر بخصوص تقرير الطالب: ${selectedRecord.studentName} (كود: ${selectedRecord.studentId})`)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    مراسلة المعلم عبر واتساب
                  </button>
                </div>
              </div>

              {/* Numbers grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-center">
                  <span className="text-[11px] text-blue-700 font-bold block mb-1">نتيجة الامتحان</span>
                  <div className="text-3xl font-black text-blue-900 font-mono">
                    {selectedRecord.score} <span className="text-xs text-slate-500">/ {selectedRecord.maxScore}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 mt-1 block">
                    {Math.round((selectedRecord.score / selectedRecord.maxScore) * 100)}%
                  </span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-center">
                  <span className="text-[11px] text-emerald-700 font-bold block mb-1">التقدير العام</span>
                  <div className="text-2xl font-black text-emerald-800 mt-1">
                    {selectedRecord.status}
                  </div>
                  <span className="text-xs text-emerald-600 mt-1 block">
                    مستوى دراسي مشرف
                  </span>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 text-center">
                  <span className="text-[11px] text-indigo-700 font-bold block mb-1">نسبة الحضور والالتزام</span>
                  <div className="text-3xl font-black text-indigo-900 font-mono">
                    {selectedRecord.attendancePercentage}%
                  </div>
                  <span className="text-xs text-indigo-600 mt-1 block">
                    انتظام كامل بالمحاضرات
                  </span>
                </div>
              </div>

              {/* Teacher comments */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  ملاحظات وتوجيهات المعلم التربوية:
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 italic">
                  "{selectedRecord.teacherNotes}"
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  تاريخ الامتحان: {selectedRecord.examDate}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تقرير رسمي موثق من منصة نغمة العلم
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              اختر طالباً من القائمة للاطلاع على تقرير الدرجات الشامل.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
