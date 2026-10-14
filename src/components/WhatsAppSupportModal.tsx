import React, { useState } from 'react';
import { MessageCircle, X, Send, Clock, ShieldCheck, HelpCircle, PhoneCall, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const WhatsAppSupportModal: React.FC<Props> = ({ isOpen, onClose, defaultTopic }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'طالب' | 'ولي أمر' | 'معلم'>('طالب');
  const [topic, setTopic] = useState(defaultTopic || 'استفسار عن كود تفعيل كورس');
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen) return null;

  const quickTopics = [
    'استفسار عن كود تفعيل كورس',
    'مشكلة في فتح الدرس التالي (القفل المتسلسل)',
    'استفسار ولي أمر بخصوص درجات الطالب',
    'مساعدة تقنية في تشغيل الفيديو أو تحميل PDF',
    'طلب انضمام معلم جديد للمنصة',
  ];

  const handleSend = () => {
    const phoneNumber = '201012345678';
    const text = `السلام عليكم ورحمة الله،
أنا: ${name || 'مستخدم في منصة نغمة العلم'} (${role})
الموضوع: ${topic}
التفاصيل: ${customMessage || 'أحتاج للمساعدة الفورية في هذا الخصوص، شكراً لكم.'}`;

    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <MessageCircle className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">الدعم الفني المباشر عبر واتساب</h3>
                <span className="flex items-center gap-1 text-[11px] bg-emerald-500/40 px-2 py-0.5 rounded text-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  متصل الآن
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">فريق نغمة العلم جاهز لحل مشكلتك في أقل من 5 دقائق</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-right">
          {/* Trust Banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>دعم متخصص لجميع المراحل: الطلاب، أولياء الأمور، والمعلمين.</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-medium shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>24/7 على مدار الساعة</span>
            </div>
          </div>

          {/* User Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">الاسم الكريم (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: أحمد عبد الله"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">صفتك في المنصة</label>
              <div className="flex gap-2">
                {(['طالب', 'ولي أمر', 'معلم'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      role === r
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fast Topics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">اختر موضوع الاستفسار السريع</label>
            <div className="space-y-1.5">
              {quickTopics.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between border ${
                    topic === item
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item}</span>
                  {topic === item && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">نص الرسالة أو تفاصيل المشكلة</label>
            <textarea
              rows={3}
              placeholder="اكتب هنا ما تواجهه من مشكلة وسيقوم الفني بالرد المباشر عليك في واتساب..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Quick Direct Number Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              رقم واتساب المنصة المباشر: <span className="font-mono font-bold text-slate-700 dir-ltr">+20 10 1234 5678</span>
            </span>
            <span className="text-slate-400">خدمة عملاء معتمدة</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Send className="w-4 h-4 rotate-180" />
            فتح المحادثة في واتساب الآن
          </button>
        </div>
      </div>
    </div>
  );
};
