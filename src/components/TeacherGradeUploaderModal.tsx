import React, { useState } from 'react';
import { X, Send, Award, FileSpreadsheet, CheckCircle2, UserCheck, MessageSquare, Printer, Plus, AlertCircle } from 'lucide-react';
import { StudentGradeRecord, Course, Teacher } from '../types';
import { getStoredGradeRecords, saveStoredGradeRecords } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  activeTeacher?: Teacher | null;
  onGradesUpdated?: () => void;
}

export const TeacherGradeUploaderModal: React.FC<Props> = ({ isOpen, onClose, courses, activeTeacher, onGradesUpdated }) => {
  const teacherCourses = activeTeacher
    ? courses.filter((c) => c.teacherId === activeTeacher.id || c.teacherName === activeTeacher.name)
    : courses;

  const [records, setRecords] = useState<StudentGradeRecord[]>(getStoredGradeRecords());
  const [selectedCourse, setSelectedCourse] = useState(
    teacherCourses[0]?.title || courses[0]?.title || 'الفيزياء الحديثة والتيار الكهربي'
  );

  const [examTitle, setExamTitle] = useState('امتحان شهر أكتوبر الشامل 2026');
  const [activeTab, setActiveTab] = useState<'upload' | 'list' | 'preview'>('upload');

  // Form fields for single or new student
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [parentPhone, setParentPhone] = useState('+2010');
  const [score, setScore] = useState<number>(55);
  const [maxScore, setMaxScore] = useState<number>(60);
  const [attendance, setAttendance] = useState<number>(95);
  const [teacherNotes, setTeacherNotes] = useState('طالب مجتهد، أظهر التزاماً ممتازاً في حل المسائل والتفاعل في الحصة.');
  const [previewRecord, setPreviewRecord] = useState<StudentGradeRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const calculateStatus = (s: number, max: number): 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج متابعة' => {
    const ratio = s / max;
    if (ratio >= 0.85) return 'ممتاز';
    if (ratio >= 0.75) return 'جيد جداً';
    if (ratio >= 0.60) return 'جيد';
    return 'يحتاج متابعة';
  };

  const handleSaveAndUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast('يرجى كتابة اسم الطالب أولاً');
      return;
    }

    const currentRecords = getStoredGradeRecords();
    const newRecord: StudentGradeRecord = {
      id: `rec-${Date.now()}`,
      studentId: studentId.trim() || `ST-${Math.floor(100 + Math.random() * 900)}`,
      studentName: studentName.trim(),
      parentPhone: parentPhone.trim() || '+201012345678',
      stage: 'secondary',
      gradeLevel: 'الصف الثالث الثانوي (الثانوية العامة)',
      courseTitle: selectedCourse,
      examTitle: examTitle.trim(),
      examDate: new Date().toISOString().split('T')[0],
      score: Number(score),
      maxScore: Number(maxScore),
      attendancePercentage: Number(attendance),
      status: calculateStatus(Number(score), Number(maxScore)),
      teacherNotes: teacherNotes.trim(),
      sentToParent: false,
    };

    const updated = [newRecord, ...currentRecords];
    saveStoredGradeRecords(updated);
    setRecords(updated);
    if (onGradesUpdated) onGradesUpdated();

    showToast(`تم رفع تقرير درجات الطالب (${newRecord.studentName}) بنجاح إلى منصة أولياء الأمور!`);
    setStudentName('');
    setStudentId('');
    setActiveTab('list');
  };

  const handleSendViaWhatsApp = (rec: StudentGradeRecord) => {
    const cleanPhone = rec.parentPhone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('0') ? '20' + cleanPhone.substring(1) : cleanPhone;
    
    const percentage = Math.round((rec.score / rec.maxScore) * 100);
    const message = `السلام عليكم ورحمة الله وبركاته،
حضرة ولي أمر الطالب/ة: ${rec.studentName} المحترم.

تحية طيبة من منصة *نغمة العلم* التعليمية 🎓
نحيطكم علماً بتقرير الأداء والدرجات الأحدث:
━━━━━━━━━━━━━━━━━
📚 المادة: ${rec.courseTitle}
📝 الامتحان: ${rec.examTitle}
🎯 الدرجة المحققة: ${rec.score} من ${rec.maxScore} (${percentage}%)
🏅 التقدير العام: ${rec.status}
📅 نسبة الحضور والالتزام: ${rec.attendancePercentage}%

💬 ملاحظة المعلم وتوصياته:
"${rec.teacherNotes}"
━━━━━━━━━━━━━━━━━
نقدر حرصكم الدائم على متابعة تفوق أبنائكم.
إدارة منصة نغمة العلم 🌟`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;
    window.open(url, '_blank');

    // Update sent status
    const all = getStoredGradeRecords();
    const modified = all.map(r => r.id === rec.id ? { ...r, sentToParent: true, sentAt: new Date().toLocaleString('ar-EG') } : r);
    saveStoredGradeRecords(modified);
    setRecords(modified);
    if (onGradesUpdated) onGradesUpdated();
    showToast(`تم فتح رسالة الواتساب وتحديث حالة الإرسال لولي أمر الطالب ${rec.studentName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with prominence */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {activeTeacher ? `بوابة ${activeTeacher.name}: رفع درجات أولياء الأمور` : 'بوابة المعلم: رفع درجات وتقارير أولياء الأمور'}
                </h2>
                <span className="text-[11px] bg-amber-400 text-blue-950 font-bold px-2 py-0.5 rounded-full">
                  إشعار فوري لولي الأمر
                </span>
              </div>
              <p className="text-xs text-blue-100">رصد نتائج الامتحانات الشهرية، الحضور، وملاحظات التوجيه التربوي مع إرسال مباشر</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 flex items-center justify-between animate-in slide-in-from-top">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              رصد درجة جديدة
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              كشف درجات الطلاب ({records.length})
            </button>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            كل تقرير يُرفع يظهر مباشرة في حساب ولي أمر الطالب
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-right flex-1">
          {activeTab === 'upload' ? (
            <form onSubmit={handleSaveAndUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المادة / الكورس</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-bold"
                  >
                    {teacherCourses.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الامتحان / التقييم</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    placeholder="مثال: امتحان شهر أكتوبر الشامل"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الرباعي</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    placeholder="مثال: يوسف حسام الدين خليل"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كود الطالب / رقم الجلوس</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    placeholder="مثال: ST-104"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم واتساب ولي الأمر</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono dir-ltr text-right"
                    placeholder="+201012345678"
                    required
                  />
                </div>
              </div>

              {/* Grades & Attendance */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة المحققة</label>
                  <input
                    type="number"
                    min={0}
                    max={maxScore}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full text-sm font-bold text-blue-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة النهائية</label>
                  <input
                    type="number"
                    min={1}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full text-sm font-bold text-slate-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نسبة الحضور (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full text-sm font-bold text-emerald-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التقدير المحسوب</label>
                  <div className="w-full py-2 px-3 text-xs font-bold text-center rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                    {calculateStatus(Number(score), Number(maxScore))} ({Math.round((score / maxScore) * 100)}%)
                  </div>
                </div>
              </div>

              {/* Teacher Educational Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات المعلم وتوجيهاته لولي الأمر</label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  placeholder="اكتب توجيهاتك التربوية: نقاط القوة، ما يحتاج إلى تحسين، والواجبات المطلوبة..."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  سيتم حفظ التقرير في النظام وإتاحته للبحث برقم الطالب أو هاتفه
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentName('عائشة محمد إبراهيم');
                      setStudentId('ST-109');
                      setScore(59);
                      setMaxScore(60);
                      setAttendance(100);
                      setTeacherNotes('ممتازة جداً وتستحق التكريم في لوحة شرف المنصة.');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    تعبئة بيانات نموذجية للتجربة
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    حفظ ورفع التقرير الآن
                  </button>
                </div>
              </div>
            </form>
          ) : activeTab === 'list' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">قائمة تقارير الطلاب المرفوعة</h4>
                  <p className="text-xs text-slate-500">يمكنك إرسال التقرير فوراً لولي الأمر عبر الواتساب أو استعراض بطاقة الدرجات</p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة تقرير طالب
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">الطالب</th>
                      <th className="p-3">المادة / الامتحان</th>
                      <th className="p-3 text-center">الدرجة</th>
                      <th className="p-3 text-center">التقدير</th>
                      <th className="p-3 text-center">الحضور</th>
                      <th className="p-3 text-center">حالة الإرسال</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{r.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{r.studentId} · {r.parentPhone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-700">{r.courseTitle}</div>
                          <div className="text-[11px] text-slate-500">{r.examTitle} ({r.examDate})</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-blue-700 text-sm">
                            {r.score}
                          </span>
                          <span className="text-slate-400"> / {r.maxScore}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            r.status === 'ممتاز' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'جيد جداً' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'جيد' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          {r.attendancePercentage}%
                        </td>
                        <td className="p-3 text-center">
                          {r.sentToParent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              تم الإرسال
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              قيد الإرسال
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSendViaWhatsApp(r)}
                              title="إرسال لولي الأمر عبر واتساب"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 font-bold text-[11px]"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>واتساب</span>
                            </button>
                            <button
                              onClick={() => {
                                setPreviewRecord(r);
                                setActiveTab('preview');
                              }}
                              title="معاينة بطاقة الدرجات الرسمية"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Preview card
            previewRecord && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('list')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    ← العودة لقائمة الطلاب
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    طباعة بطاقة الدرجات
                  </button>
                </div>

                {/* Printable certificate / report card */}
                <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-right">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-blue-900">منصة نغمة العلم 🎓</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">بطاقة الأداء الدراسي وتقييم أولياء الأمور المعتمدة</p>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-700">تاريخ الإصدار: {previewRecord.examDate}</div>
                      <div className="text-xs text-slate-500 font-mono">رقم الاعتماد: {previewRecord.id}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[11px] block">اسم الطالب</span>
                      <strong className="text-slate-900 text-sm">{previewRecord.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">كود الطالب</span>
                      <strong className="text-slate-900 font-mono text-sm">{previewRecord.studentId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">المادة المقررة</span>
                      <strong className="text-blue-700 text-sm">{previewRecord.courseTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">الامتحان</span>
                      <strong className="text-slate-900 text-sm">{previewRecord.examTitle}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-center">
                      <span className="text-xs text-blue-700 font-semibold block mb-1">الدرجة المحققة</span>
                      <div className="text-3xl font-black text-blue-900 font-mono">
                        {previewRecord.score} <span className="text-sm font-normal text-slate-500">/ {previewRecord.maxScore}</span>
                      </div>
                      <span className="text-xs text-blue-600 mt-1 block">
                        النسبة المئوية: {Math.round((previewRecord.score / previewRecord.maxScore) * 100)}%
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
                      <span className="text-xs text-emerald-700 font-semibold block mb-1">التقدير العام</span>
                      <div className="text-2xl font-black text-emerald-800 mt-1">
                        {previewRecord.status}
                      </div>
                      <span className="text-xs text-emerald-600 mt-2 block">
                        مستوى تفوق متقدم
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 text-center">
                      <span className="text-xs text-indigo-700 font-semibold block mb-1">نسبة الحضور والالتزام</span>
                      <div className="text-3xl font-black text-indigo-900 font-mono">
                        {previewRecord.attendancePercentage}%
                      </div>
                      <span className="text-xs text-indigo-600 mt-1 block">
                        حضور ومشاركة منتظمة
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">توجيهات المعلم لولي الأمر:</h5>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{previewRecord.teacherNotes}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <div>
                      <span>توقيع المعلم المعتمد: </span>
                      <span className="font-bold text-slate-800">أ. د. محمود الشريف ✍️</span>
                    </div>
                    <div>
                      <span>ختم منصة نغمة العلم للتعليم الذكي ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            تنبيه: يتم تحديث تقارير أولياء الأمور فوراً دون الحاجة لإعادة تحميل الصفحة
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
