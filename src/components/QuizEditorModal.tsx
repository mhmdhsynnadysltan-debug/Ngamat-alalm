import React, { useState } from 'react';
import { 
  X, Plus, Trash2, CheckCircle2, Clock, Award, HelpCircle, 
  Sparkles, Save, BookOpen, AlertCircle, FileText 
} from 'lucide-react';
import { Lesson, QuizQuestion } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  courseTitle: string;
  onSaveQuiz: (updatedQuiz: {
    passingScore: number;
    durationMinutes: number;
    title?: string;
    questions: QuizQuestion[];
  }) => void;
}

export const QuizEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lesson,
  courseTitle,
  onSaveQuiz,
}) => {
  const existingQuiz = lesson.quiz;

  const [passingScore, setPassingScore] = useState<number>(existingQuiz?.passingScore || 70);
  const [durationMinutes, setDurationMinutes] = useState<number>(existingQuiz?.durationMinutes || 5);
  const [quizTitle, setQuizTitle] = useState<string>(
    existingQuiz?.title || `اختبار تقييمي: ${lesson.title}`
  );

  const initialQuestions: QuizQuestion[] = existingQuiz?.questions && existingQuiz.questions.length > 0
    ? existingQuiz.questions
    : [
        {
          id: `q-${Date.now()}-1`,
          question: `ما هي الفكرة الأساسية المستنتجة من درس (${lesson.title})؟`,
          options: [
            'التحليل العلمي الدقيق وتطبيق القوانين المستنتجة',
            'الحفظ الآلي دون فهم التجربة العلمية',
            'تجاهل الوحدات الفيزيائية والمعادلات',
            'الاعتماد على التخمين السريع',
          ],
          correctAnswerIndex: 0,
          explanation: 'الفهم العميق والتحليل الرياضي والتطبيقي هو مفتاح استيعاب المادة والتفوق فيها.',
        },
        {
          id: `q-${Date.now()}-2`,
          question: 'ما هي الخطوة الأولى الموصى بها عند حل المسائل والتمارين المرتبطة بهذا الدرس؟',
          options: [
            'استخراج المعطيات وتحديد القانون الرياضي المناسب',
            'كتابة أرقام عشوائية في ورقة الإجابة',
            'تخطي المسألة دون قراءة متأنية',
            'البحث عن خيارات لا علاقة لها بالمسألة',
          ],
          correctAnswerIndex: 0,
          explanation: 'استخراج المعطيات والمطلوب بدقة يضمن اختيار القانون الرياضي الأمثل والوصول للناتج الصحيح.',
        },
      ];

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      question: '',
      options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
      correctAnswerIndex: 0,
      explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      setErrorMsg('يجب أن يحتوي الاختبار على سؤال واحد على الأقل.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setErrorMsg(null);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], question: text };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: newOptions };
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], correctAnswerIndex: optIndex };
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], explanation: text };
    setQuestions(updated);
  };

  const handleAddSampleQuestions = () => {
    const sampleQuestions: QuizQuestion[] = [
      {
        id: `q-sample-1-${Date.now()}`,
        question: 'أي من المفاهيم التالية يعتبر شرطاً أساسياً لمرور التيار في مسار مغلق؟',
        options: [
          'وجود فرق جهد وتوفر مسار مغلق متصل',
          'انقطاع المفتاح الكهربائي في الدائرة',
          'استخدام موصلات ذات مقاومة لا نهائية',
          'عدم وجود بطارية أو مصدر للجهد',
        ],
        correctAnswerIndex: 0,
        explanation: 'يشترط لمرور التيار وجود مصدر لفرق الجهد (قوة دافعة كهربائية) ومسار مغلق متصل يسمح بحركة الشحنات.',
      },
      {
        id: `q-sample-2-${Date.now()}`,
        question: 'العلاقة بين شدة التيار وفرق الجهد عند ثبوت درجة الحرارة تكون:',
        options: [
          'علاقة طردية خطية طبقاً لقانون أوم',
          'علاقة عكسية متناقصة',
          'ثابتة لا تتغير بتغير الجهد',
          'عشوائية غير منتظمة',
        ],
        correctAnswerIndex: 0,
        explanation: 'ينص قانون أوم على أن شدة التيار تتناسب طردياً مع فرق الجهد المطبق بين طرفي الموصل عند ثبوت درجة الحرارة.',
      },
      {
        id: `q-sample-3-${Date.now()}`,
        question: 'تطبيق التفكير الناقد عند مراجعة القوانين الفيزيائية يساهم في:',
        options: [
          'الربط المنطقي بين القوانين وحل المسائل غير المألوفة بنجاح',
          'زيادة صعوبة الاختبارات على الطالب',
          'إهدار وقت المذاكرة اليومية',
          'الابتعاد عن منهج الوزارة المعتمد',
        ],
        correctAnswerIndex: 0,
        explanation: 'التفكير الناقد يساعد الطالب على ربط المفاهيم واستنتاج حلول للمسائل الابتكارية وبنك المعرفة.',
      },
    ];

    setQuestions([...questions, ...sampleQuestions]);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (questions.length === 0) {
      setErrorMsg('يرجى إضافة سؤال واحد على الأقل للاختبار.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`السؤال رقم (${i + 1}) لا يحتوي على نص. يرجى كتابة نص السؤال.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setErrorMsg(`السؤال رقم (${i + 1}) يحتوي على خيار فارغ (الخيار ${j + 1}).`);
          return;
        }
      }
    }

    setErrorMsg(null);
    onSaveQuiz({
      passingScore: Number(passingScore) || 70,
      durationMinutes: Number(durationMinutes) || 5,
      title: quizTitle.trim() || `كويز: ${lesson.title}`,
      questions,
    });
    onClose();
  };

  return (
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{existingQuiz ? 'تعديل كويز الدرس ونظام الاختبار' : 'إنشاء كويز جديد للدرس'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  نظام القفل المتسلسل 🔒
                </span>
              </h3>
              <p className="text-[11px] text-blue-100 mt-0.5">
                الكورس: {courseTitle} · الدرس: {lesson.title}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quiz General Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>نسبة النجاح المطلوبة لفك القفل</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="100"
                  step="5"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  required
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                لا يفتح الدرس التالي إلا بتحقيق هذه النسبة.
              </span>
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>المؤقت الزمني للاختبار (بالدقائق)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  required
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">دقيقة</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                عند انتهاء الوقت يُقفل الاختبار ويرسل النتائج فوراً.
              </span>
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>عنوان الكويز التقييمي</span>
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="مثال: كويز المحاضرة الأولى"
                className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 block">
                يظهر للطالب في رأس نافذة الاختبار.
              </span>
            </div>
          </div>

          {/* Questions Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>أسئلة الاختيار من متعدد (MCQ)</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  {questions.length} {questions.length === 1 ? 'سؤال' : 'أسئلة'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                حدد الإجابة الصحيحة بالضغط على الدائرة، وأضف التفسير العلمي ليظهر للطالب بعد التصحيح الفوري.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddSampleQuestions}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="إضافة 3 أسئلة نموذجية للمراجعة"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>+ أسئلة نموذجية سريعة</span>
              </button>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سؤال جديد</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-5">
            {questions.map((q, qIndex) => (
              <div 
                key={q.id} 
                className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                      {qIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">نص السؤال {qIndex + 1}:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="حذف هذا السؤال"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف</span>
                  </button>
                </div>

                {/* Question Input */}
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  placeholder="اكتب صيغة السؤال بوضوح هنا..."
                  required
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                />

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>الخيارات الأربعة (اختر الدائرة للإجابة الصحيحة):</span>
                    <span className="text-emerald-700 font-semibold text-[10px]">
                      الإجابة الصحيحة المحددة: الخيار رقم ({['أ', 'ب', 'ج', 'د'][q.correctAnswerIndex]})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correctAnswerIndex === optIndex;
                      return (
                        <div 
                          key={optIndex}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400/30' 
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange(qIndex, optIndex)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isCorrect 
                                ? 'border-emerald-600 bg-emerald-600 text-white' 
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}
                            title="تعيين كإجابة صحيحة"
                          >
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <span className="text-xs font-black text-slate-700 shrink-0">
                            {['أ', 'ب', 'ج', 'د'][optIndex]}:
                          </span>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            placeholder={`الخيار ${optIndex + 1}`}
                            required
                            className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Input */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    💡 التفسير والشرح العلمي (يظهر للطالب بعد التصحيح الفوري):
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                    placeholder="مثال: طبقاً لقانون أوم فإن فرق الجهد يتناسب طردياً مع التيار..."
                    className="w-full text-xs p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Submit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال آخر</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الكويز وتفعيله للطلاب 🚀</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
