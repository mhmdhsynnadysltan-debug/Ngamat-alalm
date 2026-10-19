import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, ShieldAlert, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import { Course } from '../types';
import { getStoredActivationCodes, activateCourse, saveStoredActivationCodes, saveActivationLog, getStoredAuthUser } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetCourse: Course | null;
  onSuccess: (courseId: string) => void;
  onOpenWhatsAppSupport: (topic?: string) => void;
}

export const ActivationCodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetCourse,
  onSuccess,
  onOpenWhatsAppSupport,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !targetCourse) return null;



  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const entered = code.trim().toUpperCase();
    if (!entered) {
      setError('يرجى إدخال كود التفعيل المكون من حروف وأرقام');
      return;
    }

    const allCodes = getStoredActivationCodes();
    const foundIndex = allCodes.findIndex(
      (c) => c.code.toUpperCase() === entered && (c.courseId === targetCourse.id || c.code === 'VIP-FREE-PASS')
    );

    if (foundIndex !== -1) {
      // Mark usage
      const updatedCodes = [...allCodes];
      updatedCodes[foundIndex].usedCount += 1;
      saveStoredActivationCodes(updatedCodes);

      // Save real-time log with exact hour, student, and teacher name!
      const currentUser = getStoredAuthUser();
      saveActivationLog({
        code: entered,
        studentName: currentUser?.name || 'عمر خالد المنشاوي',
        studentPhone: currentUser?.phone || '+201099887766',
        courseTitle: targetCourse.title,
        teacherName: targetCourse.teacherName,
        teacherId: targetCourse.teacherId,
      });

      // Activate course for this user
      activateCourse(targetCourse.id);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setCode('');
        onSuccess(targetCourse.id);
        onClose();
      }, 1400);
    } else {
      setError('كود التفعيل غير صحيح أو غير مخصص لهذا الكورس. يمكنك طلب كود جديد عبر واتساب.');
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">تأمين وتفعيل محتوى الكورس</h3>
              <p className="text-[11px] text-amber-100">نظام حماية المحتوى بأكواد التفعيل الذكية</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-right">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">تم تفعيل الكورس بنجاح! 🎓</h4>
              <p className="text-xs text-slate-500">تم فك تشفير المحاضرات وبدء مسار التعلم المتسلسل...</p>
            </div>
          ) : (
            <>
              {/* Course info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[11px] text-slate-500 block mb-0.5">الكورس المطلوب تفعيله:</span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{targetCourse.title}</h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <span>المعلم: {targetCourse.teacherName}</span>
                  <span className="font-bold text-amber-700">{targetCourse.price} ج.م</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleValidate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    أدخل كود التفعيل المطبوع على بطاقتك أو المرسل لك:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: NAGHMA-PHYS-2026"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center font-mono font-bold tracking-widest text-sm px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 uppercase"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}



                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  فك قفل الكورس وبدء المشاهدة
                </button>
              </form>

              {/* Purchase / WhatsApp link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">ليس لديك كود تفعيل؟</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWhatsAppSupport(`أريد شراء كود تفعيل لكورس: ${targetCourse.title}`);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  طلب كود فوري عبر واتساب
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
