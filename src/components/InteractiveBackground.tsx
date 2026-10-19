import React, { useEffect, useState } from 'react';
import { getPlatformSettings, PlatformSettings } from '../utils/storage';

interface Props {
  isEyeComfortMode?: boolean;
  settingsOverride?: PlatformSettings;
}

export const PRESET_BACKGROUND_STYLES: Record<string, { name: string; style: React.CSSProperties; isDark: boolean }> = {
  default: {
    name: 'الافتراضي (Modern Academic)',
    style: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    },
    isDark: true,
  },
  royalNavy: {
    name: 'الكحلي الملكي الفاخر (Royal Navy)',
    style: {
      background: 'linear-gradient(135deg, #070b19 0%, #0e1d42 50%, #081126 100%)',
    },
    isDark: true,
  },
  emeraldAcademic: {
    name: 'الزمردي الأكاديمي (Emerald Academic)',
    style: {
      background: 'linear-gradient(135deg, #021a13 0%, #063d2c 50%, #022219 100%)',
    },
    isDark: true,
  },
  midnightDark: {
    name: 'الأسود الملكي الفخم (Midnight Obsidian)',
    style: {
      background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090c 100%)',
    },
    isDark: true,
  },
  warmCream: {
    name: 'راحة العين والورق الطبيعي (Warm Paper)',
    style: {
      background: '#fbf7ee',
    },
    isDark: false,
  },
  sunsetGlow: {
    name: 'شفق الإبداع والتركيز (Sunset Nebula)',
    style: {
      background: 'linear-gradient(135deg, #1e1124 0%, #36173a 50%, #180b20 100%)',
    },
    isDark: true,
  },
};

export const InteractiveBackground: React.FC<Props> = ({ isEyeComfortMode, settingsOverride }) => {
  const [settings, setSettings] = useState<PlatformSettings>(() => settingsOverride || getPlatformSettings());

  // Listen for real-time background settings changes dispatched from Admin Dashboard
  useEffect(() => {
    if (settingsOverride) {
      setSettings(settingsOverride);
      return;
    }

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getPlatformSettings());
      }
    };

    window.addEventListener('platform-settings-updated', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);

    return () => {
      window.removeEventListener('platform-settings-updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, [settingsOverride]);

  // Compute background container style
  const getBackgroundStyle = (): React.CSSProperties => {
    // If eye comfort mode toggle is active on top nav, take precedence with warm eye comfort
    if (isEyeComfortMode) {
      return {
        background: '#fbf7ee',
      };
    }

    const mode = settings.backgroundMode || 'preset';

    if (mode === 'solid') {
      return {
        backgroundColor: settings.backgroundColor || '#0f172a',
      };
    }

    if (mode === 'gradient') {
      return {
        background: settings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      };
    }

    if (mode === 'custom' && settings.customBackgroundUrl) {
      return {
        backgroundImage: `url(${settings.customBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: settings.backgroundBlur > 0 ? `blur(${settings.backgroundBlur}px)` : undefined,
        opacity: (settings.backgroundOpacity ?? 100) / 100,
      };
    }

    // Default or Preset
    const presetKey = settings.backgroundPreset || 'default';
    const preset = PRESET_BACKGROUND_STYLES[presetKey] || PRESET_BACKGROUND_STYLES.default;
    return preset.style;
  };

  const isLightMode = isEyeComfortMode || (settings.backgroundMode === 'preset' && settings.backgroundPreset === 'warmCream');

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 transition-all duration-700 overflow-hidden"
      style={getBackgroundStyle()}
    >
      {/* Dynamic Glowing Mesh Orbs */}
      {settings.showMeshOrbs !== false && !isEyeComfortMode && (
        <>
          <div
            className={`absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-1000 ${
              isLightMode ? 'bg-amber-200/40 opacity-30' : 'bg-blue-600/15 opacity-50'
            }`}
          />
          <div
            className={`absolute bottom-10 left-10 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-1000 ${
              isLightMode ? 'bg-orange-200/35 opacity-25' : 'bg-purple-600/15 opacity-40'
            }`}
          />
          <div
            className={`absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-1000 ${
              isLightMode ? 'bg-yellow-200/30 opacity-20' : 'bg-emerald-500/10 opacity-35'
            }`}
          />
        </>
      )}

      {/* Subtle Educational & Scientific Floating Symbols */}
      {settings.showFloatingSymbols !== false && (
        <div
          className={`absolute inset-0 select-none font-serif text-7xl sm:text-8xl flex flex-wrap justify-between p-8 sm:p-16 pointer-events-none transition-opacity duration-500 ${
            isLightMode ? 'opacity-[0.04] text-slate-900' : 'opacity-[0.05] text-amber-300'
          }`}
        >
          <span className="transform -rotate-12">∫</span>
          <span className="transform rotate-6">♫</span>
          <span className="transform -rotate-6">∑</span>
          <span className="transform rotate-12">λ</span>
          <span className="transform -rotate-12">π</span>
          <span className="transform rotate-6">Ω</span>
          <span className="transform -rotate-6">∞</span>
          <span className="transform rotate-12">♩</span>
          <span className="transform -rotate-12">Δ</span>
          <span className="transform rotate-6">√</span>
          <span className="transform -rotate-6">⚡</span>
          <span className="transform rotate-12">⚛</span>
        </div>
      )}

      {/* Grid Texture for Modern Crisp High-End Look */}
      {settings.showGridTexture !== false && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            isLightMode ? 'opacity-[0.025]' : 'opacity-[0.03]'
          }`}
          style={{
            backgroundImage: `radial-gradient(currentColor 1.2px, transparent 1.2px)`,
            backgroundSize: '28px 28px',
          }}
        />
      )}
    </div>
  );
};
