import React from 'react';

interface Props {
  isEyeComfortMode?: boolean;
}

export const InteractiveBackground: React.FC<Props> = ({ isEyeComfortMode }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-500 overflow-hidden ${
        isEyeComfortMode ? 'bg-[#fbf7ee]' : 'bg-slate-50'
      }`}
    >
      {/* Subtle organic light meshes */}
      <div
        className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-35 transition-all duration-700 ${
          isEyeComfortMode ? 'bg-amber-200/50' : 'bg-blue-200/40'
        }`}
      />
      <div
        className={`absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 transition-all duration-700 ${
          isEyeComfortMode ? 'bg-orange-200/40' : 'bg-indigo-200/35'
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          isEyeComfortMode ? 'bg-yellow-200/40' : 'bg-teal-200/30'
        }`}
      />

      {/* Subtle educational floating watermark glyphs */}
      <div className="absolute inset-0 opacity-[0.035] select-none text-slate-900 font-serif text-8xl flex flex-wrap justify-between p-12 pointer-events-none">
        <span>∫</span>
        <span>♫</span>
        <span>∑</span>
        <span>λ</span>
        <span>π</span>
        <span>Ω</span>
        <span>∞</span>
        <span>♩</span>
      </div>

      {/* Grid texture for modern crisp feel */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
