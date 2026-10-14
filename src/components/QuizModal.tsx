import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Award, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Lesson } from '../types';
import { addStudentXP, markLessonCompleted } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  nextLesson?: Lesson;
  onPassed: (unlockedLessonId?: string) => void;
}

export const QuizModal: React.FC<Props> = ({ isOpen, onClose, lesson, nextLesson, onPassed }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen || !lesson.quiz) return null;

  const questions = lesson.quiz.questions;
  const passingScore = lesson.quiz.passingScore;

  const handleSelectOption = (questionId: string, index: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= passingScore) {
      // Mark current lesson completed
      markLessonCompleted(lesson.id);
      if (nextLesson) {
        markLessonCompleted(nextLesson.id);
      }
      addStudentXP(150);
      onPassed(nextLesson?.id);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const isPassed = score >= passingScore;
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">الكويز الإلكتروني والتصحيح الفوري</h3>
              <p className="text-[11px] text-blue-100">اجتياز الكويز بنسبة {passingScore}% أو أكثر يفك قفل الدرس التالي تلقائياً</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-right flex-1">
          {/* Result Banner after submit */}
          {isSubmitted && (
            <div
              className={`p-5 rounded-2xl border text-center space-y-2 animate-in zoom-in-95 ${
                isPassed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="text-3xl font-black font-mono">
                {score}%
              </div>
              <h4 className="text-lg font-bold">
                {isPassed ? 'مبارك! اجتزت التقييم بنجاح باهر 🎓' : 'للأسف لم تصل لدرجة النجاح المطلوبة'}
              </h4>
              <p className="text-xs max-w-md mx-auto leading-relaxed">
                {isPassed
                  ? `أحسنت! تم فك قفل الدرس التالي تلقائياً وإضافة 150 نقطة خبرة (XP) إلى ملفك الشخصي.`
                  : `درجة النجاح هي ${passingScore}%. راجع الشروحات التوضيحية أدناه ثم أعد المحاولة لتتمكن من فك قفل الدرس التالي.`}
              </p>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((q, qIndex) => {
              const selected = selectedAnswers[q.id];
              const isCorrect = selected === q.correctAnswerIndex;

              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      سؤال {qIndex + 1} من {questions.length}
                    </span>
                    {isSubmitted && (
                      <span className={`text-xs font-bold flex items-center gap-1 ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            إجابة صحيحة (+1)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            إجابة خاطئة
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selected === optIndex;
                      const isOptionCorrect = optIndex === q.correctAnswerIndex;

                      let buttonStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          buttonStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isChosen && !isOptionCorrect) {
                          buttonStyle = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                        }
                      } else if (isChosen) {
                        buttonStyle = 'bg-blue-100/70 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20';
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          className={`w-full text-right p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${buttonStyle}`}
                        >
                          <span>{opt}</span>
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono">
                            {['أ', 'ب', 'ج', 'د'][optIndex]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {isSubmitted && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                      <strong className="block text-blue-950 mb-0.5">💡 التفسير والشرح العلمي:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <span className="text-xs text-slate-500">
                {allAnswered ? 'جاهز للتسليم والتقييم' : 'يرجى الإجابة عن جميع الأسئلة'}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                تسليم الإجابات والتصحيح الفوري ⚡
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة المحاولة
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
              >
                {isPassed ? 'متابعة إلى المحاضرة التالية 🔓' : 'إغلاق ومراجعة الشرح'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
