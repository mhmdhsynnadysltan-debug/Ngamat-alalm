import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, X, Shield, Eye, EyeOff } from 'lucide-react';
import { verifyAdminSecretCode, normalizeDigits } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = normalizeDigits(password.trim());
    if (verifyAdminSecretCode(cleanPass)) {
      setError(null);
      setPassword('');
      onSuccess();
    } else {
      setError('الرمز السري غير صحيح. يرجى إدخال الرمز المعتمد في إعدادات المنصة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>التحقق من صلاحيات الإدارة</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">محمية برمز</span>
              </h3>
              <p className="text-xs text-slate-300">لوحة التحكم العامة للمنظومة التعليمية</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              هذه البوابة مخصصة للإدارة لإعداد ومتابعة كافة أقسام المنظومة. يرجى إدخال الرمز السري المعتمد للمتابعة.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              أدخل كلمة المرور السرية:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full text-center font-mono text-xl font-bold tracking-widest px-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                title={showPassword ? 'إخفاء الرمز' : 'إظهار الرمز'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-bold flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>تأكيد الدخول للوحة التحكم</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
