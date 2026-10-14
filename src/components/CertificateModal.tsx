import React, { useRef, useState } from 'react';
import { 
  Award, Download, Printer, X, CheckCircle2, Sparkles, 
  Share2, ShieldCheck, Star, Calendar, User, BookOpen 
} from 'lucide-react';
import { Course } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  studentName?: string;
}

export const CertificateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  course,
  studentName: initialStudentName = 'طالب نغمة العلم المتفوق',
}) => {
  const [studentName, setStudentName] = useState(initialStudentName);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certSerial = `NGM-${course.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'CERT'}-${Date.now().toString().slice(-4)}`;

  // Download high-resolution PNG using HTML5 Canvas
  const handleDownloadPNG = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High-res landscape resolution (1920 x 1080)
      canvas.width = 1920;
      canvas.height = 1080;

      // 1. Background gradient (Parchment & Ivory luxury feel)
      const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
      bgGrad.addColorStop(0, '#0f172a'); // Slate 900
      bgGrad.addColorStop(0.5, '#1e1b4b'); // Indigo 950
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Certificate Inner Card
      const innerGrad = ctx.createLinearGradient(100, 60, 1820, 1020);
      innerGrad.addColorStop(0, '#ffffff');
      innerGrad.addColorStop(0.5, '#fefce8'); // Warm ivory
      innerGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = innerGrad;
      ctx.roundRect(80, 50, 1760, 980, 24);
      ctx.fill();

      // Golden Borders
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#d97706'; // Amber 600
      ctx.roundRect(100, 70, 1720, 940, 20);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f59e0b'; // Amber 500
      ctx.roundRect(118, 88, 1684, 904, 16);
      ctx.stroke();

      // Corner Accents (Gold flourish triangles)
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(45, 0);
        ctx.lineTo(0, 45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      drawCorner(122, 92, 0);
      drawCorner(1798, 92, 90);
      drawCorner(1798, 988, 180);
      drawCorner(122, 988, 270);

      // Top Header Arabic Title
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';

      // Platform Header
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('منصة نغمة العلم التعليمية الذكية 🎓', 960, 160);

      ctx.fillStyle = '#64748b';
      ctx.font = '22px sans-serif';
      ctx.fillText('جمهورية مصر العربية · إدارة التعليم والتميز الأكاديمي الرقمي', 960, 200);

      // Certificate Title
      ctx.fillStyle = '#b45309';
      ctx.font = '900 62px sans-serif';
      ctx.fillText('شهادة تقدير وإتمام منهج معتمدة', 960, 290);

      // Subtitle
      ctx.fillStyle = '#475569';
      ctx.font = '26px sans-serif';
      ctx.fillText('تُمنح هذه الشهادة المعتمدة تقديراً للاجتهاد والتفوق العلمي واجتياز كافة متطلبات الكورس بنجاح', 960, 345);

      // Student Honor Text
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('تشهد إدارة المنصة ومعلم المادة بأن الطالبـ/ـة المتميز/ة:', 960, 430);

      // Student Name Box (Highlight Banner)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.roundRect(460, 470, 1000, 95, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e1b4b';
      ctx.font = '900 54px sans-serif';
      ctx.fillText(studentName.trim() || 'طالب نغمة العلم', 960, 538);

      // Course Details Paragraph
      ctx.fillStyle = '#334155';
      ctx.font = '30px sans-serif';
      ctx.fillText(
        `قد أتمّ بنجاح واقتدار دراسة كورس: « ${course.title} »`,
        960,
        630
      );

      ctx.fillStyle = '#475569';
      ctx.font = '26px sans-serif';
      ctx.fillText(
        `المرحلة والصف: ${course.gradeLevel} · مادة: ${course.subject}`,
        960,
        680
      );

      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(
        `تحت إشراف الأستاذ: ${course.teacherName} (نسبة الإنجاز: 100% مكتمل مع فتح القفل النهائي)`,
        960,
        730
      );

      // Golden Medal / Seal in Canvas (Center-bottom)
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(960, 840, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('امتياز ★', 960, 835);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('معتمد 100%', 960, 860);

      // Footer Grid: Issue Date (Right) and Teacher Signature (Left)
      // In RTL, 1450 is on the right side
      ctx.textAlign = 'center';

      // Date Section
      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.fillText('تاريخ التخرج والإصدار:', 1400, 860);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(issueDate, 1400, 900);

      // Teacher Section
      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.fillText('معلم المادة المعتمد:', 520, 860);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`أ. ${course.teacherName}`, 520, 900);
      ctx.fillStyle = '#2563eb';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('توقيع رسمي إلكتروني ✓', 520, 930);

      // Bottom Serial bar
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText(`كود التحقق الرقمي: ${certSerial} · منصة نغمة العلم للتعليم الذكي`, 960, 975);

      // Trigger download
      const imageURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageURL;
      downloadLink.download = `شهادة_تقدير_${studentName.trim().replace(/\s+/g, '_')}_${course.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Failed to export certificate:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(`شهادة تقدير معتمدة من منصة نغمة العلم - الطالب: ${studentName} - كود التحقق: ${certSerial} - الكورس: ${course.title}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col text-right my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                شهادة التقدير الرقمية المعتمدة
                <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  إنجاز 100% 🏆
                </span>
              </h2>
              <p className="text-xs text-slate-300">منصة نغمة العلم التعليمية الذكية</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Name Customization */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              اسم الطالب على الشهادة:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 font-bold flex-1"
              placeholder="اكتب اسم الطالب الرباعي..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'جاري التوليد...' : 'تحميل الشهادة (PNG فائقة الدقة)'}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              طباعة / PDF
            </button>

            <button
              onClick={handleCopyVerification}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5"
              title="نسخ كود التحقق الرسمي"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink ? 'تم النسخ ✓' : 'مشاركة'}
            </button>
          </div>
        </div>

        {/* Certificate Visual Preview */}
        <div className="p-4 sm:p-6 bg-slate-100 overflow-x-auto flex justify-center">
          <div 
            ref={certificateRef}
            className="w-full max-w-2xl bg-gradient-to-br from-white via-amber-50/20 to-white rounded-2xl p-6 sm:p-10 border-4 border-amber-500 shadow-xl relative overflow-hidden text-center space-y-6"
            style={{
              boxShadow: '0 10px 30px -5px rgba(217, 119, 6, 0.25)',
            }}
          >
            {/* Ornamental Inner Border */}
            <div className="absolute inset-2 border-2 border-dashed border-amber-300 rounded-xl pointer-events-none" />

            {/* Corner Decorative Badges */}
            <div className="absolute top-3 right-3 text-amber-500 text-xl select-none">❖</div>
            <div className="absolute top-3 left-3 text-amber-500 text-xl select-none">❖</div>
            <div className="absolute bottom-3 right-3 text-amber-500 text-xl select-none">❖</div>
            <div className="absolute bottom-3 left-3 text-amber-500 text-xl select-none">❖</div>

            {/* Top Brand Header */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-center gap-2 text-blue-900 font-black text-sm">
                <span>جمهورية مصر العربية</span>
                <span>·</span>
                <span className="text-amber-700">منصة نغمة العلم التعليمية الذكية 🎓</span>
              </div>
              <p className="text-[11px] text-slate-500">إدارة التفوق والتدريب الأكاديمي المعتمد</p>
            </div>

            {/* Certificate Title */}
            <div className="space-y-2 relative z-10 pt-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-amber-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                شهادة تقدير واجتياز تفوق دراسي
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                شهادة إتمام الكورس بنجاح
              </h1>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                تُمنح هذه الشهادة الرسمية تقديراً للاجتهاد والمثابرة الأكاديمية واجتياز كافة المحاضرات والاختبارات التقييمية بنسبة إتقان تامة.
              </p>
            </div>

            {/* Honoree Box */}
            <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 relative z-10 shadow-inner">
              <span className="text-xs font-bold text-slate-600 block mb-1">
                تشهد المنصة ومعلم المادة بأن الطالبـ/ـة المتميز/ة:
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-serif my-1">
                {studentName.trim() || 'طالب نغمة العلم'}
              </h2>
              <div className="h-0.5 w-32 bg-amber-500/40 mx-auto my-2" />
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                قد اجتاز بنجاح واقتدار كافة دروس ووحدات كورس: <span className="text-amber-800 font-bold">« {course.title} »</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600 mt-2">
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold">
                  {course.gradeLevel}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold">
                  المادة: {course.subject}
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  نسبة الإتقان: 100% (القفل النهائي مفتوح)
                </span>
              </div>
            </div>

            {/* Accreditation Footer */}
            <div className="grid grid-cols-3 gap-2 items-center text-center pt-3 border-t border-slate-200/80 relative z-10">
              {/* Teacher Signature */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">معلم المادة المعتمد</span>
                <span className="text-xs font-black text-slate-900 block">أ. {course.teacherName}</span>
                <div className="inline-block text-[10px] text-blue-600 italic font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  توقيع إلكتروني موثق ✓
                </div>
              </div>

              {/* Gold Seal Emblem */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white border border-amber-200 flex flex-col items-center justify-center text-amber-700">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span className="text-[8px] font-black leading-none mt-0.5">معتمد رسمياً</span>
                  </div>
                </div>
              </div>

              {/* Date & Serial */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">تاريخ الإتمام والإصدار</span>
                <span className="text-xs font-bold text-slate-900 block">{issueDate}</span>
                <span className="text-[9px] text-slate-400 font-mono block">
                  كود: {certSerial}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            شهادة رقمية معتمدة ومسجلة في قاعدة بيانات المنصة.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
