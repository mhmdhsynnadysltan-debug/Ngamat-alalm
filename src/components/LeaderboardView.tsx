import React, { useState } from 'react';
import { Trophy, Award, Sparkles, Flame, CheckCircle, Zap, Star, ShieldCheck } from 'lucide-react';
import { LeaderboardStudent } from '../types';
import { getStoredLeaderboard, getStudentXP, addStudentXP } from '../utils/storage';

export const LeaderboardView: React.FC = () => {
  const [students] = useState<LeaderboardStudent[]>(getStoredLeaderboard());
  const [stageFilter, setStageFilter] = useState<'all' | 'secondary' | 'preparatory' | 'primary'>('all');
  const [myXP, setMyXP] = useState(getStudentXP());

  // Weekly challenge modal/box
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const filtered = students.filter((s) => stageFilter === 'all' || s.stage === stageFilter);

  const handleSolveChallenge = (optionIndex: number) => {
    setChallengeAnswer(optionIndex);
    if (optionIndex === 1) { // option 1 is correct
      const updatedXP = addStudentXP(250);
      setMyXP(updatedXP);
      setChallengeCompleted(true);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white text-amber-900 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                لوحة الشرف وتحدي الأوائل
              </span>
              <span className="text-xs text-amber-100">كل خطوة اليوم هي لحن تفوقك في الغد</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">لوحة شرف نغمة العلم للمتفوقين 🏆</h1>
            <p className="text-sm text-amber-100 mt-1 max-w-2xl leading-relaxed">
              تكريم دوري لأوائل المراحل الابتدائية والإعدادية والثانوية الذين حققوا العلامات الكاملة في الامتحانات الإلكترونية والمقالية.
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-amber-200 block mb-0.5 font-bold">نقاط تفوقك الحالية</span>
            <div className="text-3xl font-black text-amber-300 font-mono flex items-center justify-center gap-1">
              <Flame className="w-6 h-6 text-amber-300" />
              {myXP.toLocaleString()} XP
            </div>
            <span className="text-[11px] text-white/80 mt-1 block">المرتبة السادسة على مستوى المنصة!</span>
          </div>
        </div>
      </div>

      {/* Weekly Challenge Spotlight */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl p-6 border border-indigo-700 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-400 text-slate-900 rounded-lg">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">تحدي العباقرة الأسبوعي (+250 XP فورية)</h3>
              <p className="text-xs text-indigo-200">أجب عن سؤال التحدي الذهني وارفع رصيدك في لوحة الشرف</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-full text-indigo-200">
            ينتهي خلال 3 أيام ⏳
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 space-y-3">
          <p className="text-sm font-bold text-amber-200 leading-relaxed">
            السؤال: في دائرة كهربية تحتوي على بطارية ومقاومة R، إذا تم استبدال المقاومة بأخرى قيمتها 3R مع ثبات فرق الجهد، فكم تصبح القدرة الكهربية المستنفدة في الدائرة؟
          </p>

          {!challengeCompleted ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {[
                { label: 'تزداد إلى ثلاثة أمثالها', correct: false },
                { label: 'تقل إلى ثلث قيمتها الأصلية (P = V² / R)', correct: true },
                { label: 'تظل ثابتة بدون تغيير', correct: false },
              ].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSolveChallenge(idx)}
                  className={`p-2.5 text-xs font-bold rounded-lg border transition-all text-right ${
                    challengeAnswer === idx
                      ? opt.correct
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-600/30 border border-emerald-400 text-emerald-200 p-3 rounded-lg text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                إجابة صحيحة وعبقرية! تمت إضافة 250 نقطة خبرة فورية إلى رصيدك.
              </span>
              <span className="font-black text-amber-300 font-mono text-sm">+250 XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {[
            { id: 'all', label: 'جميع المراحل' },
            { id: 'secondary', label: 'المرحلة الثانوية' },
            { id: 'preparatory', label: 'المرحلة الإعدادية' },
            { id: 'primary', label: 'المرحلة الابتدائية' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStageFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                stageFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          يتم تحديث الترتيب أسبوعياً بناءً على نتائج الكويزات وسرعة الإجابة
        </span>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="p-4 text-center">الترتيب</th>
              <th className="p-4">الطالب المتفوق</th>
              <th className="p-4">المرحلة الدراسية</th>
              <th className="p-4">وسام التميز</th>
              <th className="p-4 text-center">الكويزات المكتملة</th>
              <th className="p-4 text-center">نقاط التفوق (XP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-4 text-center">
                  {student.rank === 1 ? (
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center mx-auto shadow-xs text-sm">
                      🥇
                    </span>
                  ) : student.rank === 2 ? (
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black flex items-center justify-center mx-auto text-sm">
                      🥈
                    </span>
                  ) : student.rank === 3 ? (
                    <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-800 font-black flex items-center justify-center mx-auto text-sm">
                      🥉
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-slate-500">{student.rank}</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={student.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                      <span className="text-[11px] text-slate-500">{student.gradeLevel}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-700">
                  {student.stage === 'secondary'
                    ? 'الثانوية'
                    : student.stage === 'preparatory'
                    ? 'الإعدادية'
                    : 'الابتدائية'}
                </td>
                <td className="p-4">
                  <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-md text-[11px] inline-flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                    {student.badge}
                  </span>
                </td>
                <td className="p-4 text-center font-bold text-slate-700 font-mono">
                  {student.quizzesCompleted} كويز
                </td>
                <td className="p-4 text-center">
                  <span className="font-black text-amber-700 font-mono text-sm bg-amber-50 px-3 py-1 rounded-lg">
                    {student.points.toLocaleString()} XP
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
