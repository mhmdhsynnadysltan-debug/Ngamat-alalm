import React, { useState, useEffect, useRef } from 'react';
import { 
  X, CheckCircle2, XCircle, AlertCircle, Award, Sparkles, 
  ArrowRight, RotateCcw, Clock, AlertTriangle, Video, Edit3, Check 
} from 'lucide-react';
import { Lesson } from '../types';
import { addStudentXP, markLessonCompleted } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  nextLesson?: Lesson;
  onPassed: (unlockedLessonId?: string) => void;
  onFailed?: (score: number, passingScore: number) => void;
  onOpenEditor?: () => void;
  onReviewVideo?: () => void;
}

export const QuizModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  lesson, 
  nextLesson, 
  onPassed,
  onFailed,
  onOpenEditor,
  onReviewVideo,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);

  // Timer configuration
  const durationMinutes = lesson.quiz?.durationMinutes || 5;
  const initialSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);

  // Reset state whenever a new quiz is opened or lesson changes
  useEffect(() => {
    if (isOpen) {
      setSelectedAnswers({});
      setIsSubmitted(false);
      setScore(0);
      setTimeExpired(false);
      setSecondsRemaining((lesson.quiz?.durationMinutes || 5) * 60);
    }
  }, [isOpen, lesson.id]);

  // Timer countdown hook
  useEffect(() => {
    if (!isOpen || isSubmitted || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isSubmitted, secondsRemaining]);

  if (!isOpen || !lesson.quiz) return null;

  const questions = lesson.quiz.questions;
  const passingScore = lesson.quiz.passingScore;

  const handleSelectOption = (questionId: string, index: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const calculateAndFinish = (answers: Record<string, number>, isFromTimeout = false) => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= passingScore) {
      // Mark current lesson completed
      markLessonCompleted(lesson.id);
      addStudentXP(150);
      onPassed(nextLesson?.id);
    } else {
      // Failed quiz
      onFailed?.(calculatedScore, passingScore);
    }
  };

  const handleSubmit = () => {
    calculateAndFinish(selectedAnswers, false);
  };

  const handleTimeUp = () => {
    setTimeExpired(true);
    calculateAndFinish(selectedAnswers, true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimeExpired(false);
    setSecondsRemaining((lesson.quiz?.durationMinutes || 5) * 60);
  };

  const isPassed = score >= passingScore;
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  // Time format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalDurationSec = (lesson.quiz?.durationMinutes || 5) * 60;
  const timePercentRemaining = Math.max(0, (secondsRemaining / totalDurationSec) * 100);
  const isTimeCritical = secondsRemaining <= 60 && !isSubmitted;

  return (
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
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
                <span>{lesson.quiz.title || 'الكويز الإلكتروني والتصحيح الفوري'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  القفل المتسلسل 🔒
                </span>
              </h3>
              <p className="text-[11px] text-blue-100 mt-0.5">
                اجتياز الكويز بنسبة {passingScore}% أو أكثر يفك قفل الدرس التالي تلقائياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEditor && (
              <button
                type="button"
                onClick={onOpenEditor}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="تعديل أسئلة الكويز والمؤقت"
              >
                <Edit3 className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">تعديل الكويز</span>
              </button>
            )}

            <button 
              type="button" 
              onClick={onClose} 
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timer Bar & Status */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">عدد الأسئلة:</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {questions.length} أسئلة
            </span>
          </div>

          {/* Active Countdown Timer */}
          <div className="flex items-center gap-3">
            <div 
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold transition-all ${
                isSubmitted 
                  ? 'bg-slate-200 text-slate-600'
                  : isTimeCritical 
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? 'text-rose-600' : 'text-blue-700'}`} />
              <span>{isSubmitted ? 'تم انتهاء الوقت' : `المؤقت: ${formattedTime}`}</span>
            </div>
          </div>
        </div>

        {/* Countdown Visual Line Indicator */}
        {!isSubmitted && (
          <div className="w-full h-1 bg-slate-200 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                isTimeCritical ? 'bg-rose-600' : 'bg-blue-600'
              }`}
              style={{ width: `${timePercentRemaining}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-right flex-1">
          {/* Timeout Alert if submitted via timer */}
          {timeExpired && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3 text-xs font-bold animate-in fade-in">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                ⏰ انتهى الوقت المحدد للاختبار! تم إغلاق الاختبار تلقائياً وإرسال إجاباتك للتصحيح الفوري.
              </span>
            </div>
          )}

          {/* Result Banner after submit */}
          {isSubmitted && (
            <div
              className={`p-5 rounded-2xl border text-center space-y-3 animate-in zoom-in-95 shadow-sm ${
                isPassed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="text-4xl font-black font-mono">
                {score}%
              </div>
              <h4 className="text-lg font-bold flex items-center justify-center gap-2">
                {isPassed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>مبارك! اجتزت التقييم بنجاح باهر 🎓</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>للأسف لم تصل لدرجة النجاح المطلوبة ({passingScore}%)</span>
                  </>
                )}
              </h4>
              <p className="text-xs max-w-md mx-auto leading-relaxed text-slate-700">
                {isPassed
                  ? `أحسنت يا بطل! تم فك قفل الدرس التالي تلقائياً بنجاح، وإضافة 150 نقطة خبرة (XP) إلى ملفك.`
                  : `درجة النجاح المطلوبة لفك القفل هي ${passingScore}%. نوصيك بإعادة مشاهدة فيديو الدرس والتركيز على النقاط التوضيحية ثم إعادة المحاولة لتحقيق التفوق وفك القفل!`}
              </p>

              {/* Action for failed student: Review Lesson Video */}
              {!isPassed && onReviewVideo && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onReviewVideo();
                      onClose();
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Video className="w-4 h-4 text-amber-300" />
                    <span>مراجعة فيديو الدرس مرة أخرى الآن 📺</span>
                  </button>
                </div>
              )}
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
                          disabled={isSubmitted}
                          className={`w-full text-right p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${buttonStyle}`}
                        >
                          <span>{opt}</span>
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                            {['أ', 'ب', 'ج', 'د'][optIndex]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submit */}
                  {isSubmitted && q.explanation && (
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
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {!isSubmitted ? (
            <>
              <span className="text-xs text-slate-500 font-medium">
                {allAnswered ? 'جاهز للتسليم والتقييم الفوري' : 'يرجى الإجابة عن جميع الأسئلة قبل انتهاء المؤقت'}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>تسليم الإجابات والتصحيح الفوري ⚡</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>

              <div className="flex items-center gap-2">
                {!isPassed && onReviewVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      onReviewVideo();
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>مشاهدة فيديو الدرس</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors ${
                    isPassed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isPassed ? 'متابعة إلى المحاضرة التالية 🔓' : 'إغلاق ومراجعة الشرح'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
