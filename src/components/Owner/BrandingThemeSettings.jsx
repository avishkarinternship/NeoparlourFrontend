import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Sparkles, RotateCcw, Eye, ShieldCheck, 
  Sliders, ShoppingBag, Star, ArrowRight, Sun, Moon
} from 'lucide-react';
import { 
  getSalonTheme, 
  saveSalonTheme, 
  generateBalancedPalette, 
  extractBrandPaletteFromLogo, 
  getContrastRatio, 
  getContrastingTextColor,
  adaptBrandForDarkMode,
  removeDynamicTheme
} from '../../utils/themeGenerator';
import { SalonLogoImage } from '../../utils/whiteLabelHelper';

const PRESET_BG_STYLES = [
  { 
    id: 'brand-tint', 
    label: 'Intelligent Brand Tint', 
    badge: 'Recommended',
    desc: 'Light Mode: Soft brand-tinted white. Dark Mode: Deep midnight brand tint.' 
  },
  { 
    id: 'pure-white', 
    label: 'Pure White & Obsidian', 
    desc: 'Light Mode: Stark white. Dark Mode: Deep obsidian neutral.' 
  },
  { 
    id: 'warm-ivory', 
    label: 'Warm Ivory & Charcoal', 
    desc: 'Light Mode: Organic ivory. Dark Mode: Warm dark charcoal.' 
  }
];

export default function BrandingThemeSettings({ salon, isDarkMode }) {
  const salonId =
    salon?.id ||
    salon?.salonId ||
    localStorage.getItem('activeSalonId') ||
    localStorage.getItem('salon_id');
  const salonLogo =
    salon?.imageUrl ||
    salon?.logo ||
    salon?.logoUrl ||
    localStorage.getItem('activeSalonLogo') ||
    localStorage.getItem('salon_logo');
  const salonName =
    salon?.salonName ||
    salon?.name ||
    localStorage.getItem('salon_name') ||
    'Your Salon';

  const [currentPalette, setCurrentPalette] = useState(() => {
    return getSalonTheme(salonId) || generateBalancedPalette('#7C3AED', '#A78BFA', 'brand-tint');
  });

  const [primaryColor, setPrimaryColor] = useState(currentPalette.primary || '#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState(currentPalette.secondary || '#A78BFA');
  const [bgStyle, setBgStyle] = useState(currentPalette.bgStyle || 'brand-tint');
  const [previewMode, setPreviewMode] = useState(isDarkMode ? 'dark' : 'light');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with storage
  useEffect(() => {
    const saved = getSalonTheme(salonId);
    if (saved) {
      setCurrentPalette(saved);
      setPrimaryColor(saved.primary || '#7C3AED');
      setSecondaryColor(saved.secondary || '#A78BFA');
      setBgStyle(saved.bgStyle || 'brand-tint');
    }
  }, [salonId]);

  // Compute live palette based on form inputs
  const fullPalette = generateBalancedPalette(primaryColor, secondaryColor, bgStyle);
  const activePreviewTokens = previewMode === 'dark' ? fullPalette.dark : fullPalette.light;

  // Dark mode adapted brand color
  const darkAdaptedBrand = adaptBrandForDarkMode(primaryColor);

  // Contrast scores
  const lightBtnTextColor = getContrastingTextColor(primaryColor);
  const lightContrast = getContrastRatio(primaryColor, lightBtnTextColor).toFixed(1);

  const darkBtnTextColor = getContrastingTextColor(darkAdaptedBrand);
  const darkContrast = getContrastRatio(darkAdaptedBrand, darkBtnTextColor).toFixed(1);

  const activeContrast = previewMode === 'dark' ? darkContrast : lightContrast;
  const isWcagCompliant = parseFloat(activeContrast) >= 4.5;

  // Auto-generate from current logo
  const handleGenerateFromLogo = async () => {
    if (!salonLogo) {
      toast.error('No salon logo found. Please upload a logo in the "Salon Profile" tab first.');
      return;
    }

    try {
      setIsExtracting(true);
      toast('🎨 Analyzing logo colors & generating adaptive palette...', { icon: '✨' });
      const extracted = await extractBrandPaletteFromLogo(salonLogo);
      if (extracted) {
        setPrimaryColor(extracted.primary);
        setSecondaryColor(extracted.secondary);
        setBgStyle(extracted.bgStyle || 'brand-tint');
        setCurrentPalette(extracted);
        saveSalonTheme(salonId, extracted);
        toast.success('Generated and applied adaptive brand theme from your logo!');
      } else {
        toast.error('Could not extract colors from the logo image. Using default theme.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze logo.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save customized theme
  const handleSaveTheme = () => {
    setIsSaving(true);
    try {
      saveSalonTheme(salonId, fullPalette);
      setCurrentPalette(fullPalette);
      toast.success('Custom salon theme saved and applied across the entire website!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save theme settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to platform default red theme
  const handleResetToDefault = () => {
    removeDynamicTheme();
    localStorage.removeItem(`salon_theme_${salonId}`);
    localStorage.removeItem('activeSalonTheme');
    const defaultPalette = generateBalancedPalette('#FF0B01', '#FFFFFF', 'pure-white');
    setCurrentPalette(defaultPalette);
    setPrimaryColor('#FF0B01');
    setSecondaryColor('#FFFFFF');
    setBgStyle('pure-white');
    toast.success('Reset website colors to default NeoParlour theme.');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isDarkMode
            ? 'bg-zinc-900/60 border-zinc-800'
            : 'bg-gradient-to-r from-red-50/40 via-white to-gray-50 border-gray-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <SalonLogoImage
              logo={salonLogo}
              name={salonName}
              className="w-14 h-14 rounded-2xl shadow-md shrink-0 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Intelligent Dynamic Branding System
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                  Logo-Powered
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                Automatically harmonizes background tones, surfaces, text, buttons, and badges around {salonName}'s official logo in both Light and Dark modes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateFromLogo}
            disabled={isExtracting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isExtracting ? 'Analyzing Logo...' : 'Auto-Generate from Logo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <h4
              className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                isDarkMode ? 'text-zinc-200' : 'text-gray-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-red-500" />
              Palette Controls
            </h4>

            {/* Primary Brand Color */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase border ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="#HEX"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                Applied to primary buttons, interactive highlights, active tabs, and accents.
              </p>
            </div>

            {/* Dark Mode Adapted Color Chip */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-zinc-800/40 border-zinc-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div>
                <span className={`text-[11px] font-bold block ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Dark-Mode Adapted Accent
                </span>
                <span className="text-[10px] text-gray-400">
                  Tuned for readability on dark surfaces
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-xs"
                  style={{ backgroundColor: darkAdaptedBrand }}
                />
                <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                  {darkAdaptedBrand}
                </span>
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                Secondary / Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase border ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="#HEX"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                Used for soft secondary tags, subtle gradients, and decorative rings.
              </p>
            </div>

            {/* Background Style Preset */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                Background Tone Architecture
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_BG_STYLES.map((preset) => {
                  const isSelected = bgStyle === preset.id;
                  const mockPalette = generateBalancedPalette(primaryColor, secondaryColor, preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setBgStyle(preset.id)}
                      className={`p-3 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/10'
                          : isDarkMode
                          ? 'border-zinc-800 hover:border-zinc-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {preset.label}
                          </span>
                          {preset.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">{preset.desc}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-xs"
                          style={{ backgroundColor: mockPalette.light.background }}
                          title="Light Mode Background"
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-600 shadow-xs"
                          style={{ backgroundColor: mockPalette.dark.background }}
                          title="Dark Mode Background"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessibility & Contrast Monitor */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                isWcagCompliant
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  {previewMode === 'dark' ? 'Dark' : 'Light'} Button Contrast: <strong>{activeContrast}:1</strong>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/20">
                {isWcagCompliant ? 'WCAG AA Pass' : 'Low Contrast'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSaveTheme}
                disabled={isSaving}
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer hover:brightness-95 active:scale-98"
                style={{
                  backgroundColor: primaryColor,
                  color: lightBtnTextColor
                }}
              >
                {isSaving ? 'Applying Changes...' : 'Save & Apply Theme'}
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDarkMode
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to NeoParlour Default
              </button>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className={`p-6 rounded-2xl border space-y-6 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            {/* Preview Header with Light/Dark Mode Switcher */}
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-500" />
                <h4 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Live Brand Preview
                </h4>
              </div>

              {/* Mode Toggle Controls */}
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-gray-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setPreviewMode('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === 'light'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === 'dark'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Dark Mode
                </button>
              </div>
            </div>

            {/* Simulated Page Background Container */}
            <div
              className="p-5 rounded-2xl border space-y-5 transition-colors duration-200"
              style={{
                backgroundColor: activePreviewTokens.background,
                borderColor: activePreviewTokens.border,
                color: activePreviewTokens.textPrimary
              }}
            >
              {/* Mock Navigation Header */}
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between shadow-xs transition-colors duration-200"
                style={{
                  backgroundColor: activePreviewTokens.surface,
                  borderColor: activePreviewTokens.border
                }}
              >
                <div className="flex items-center space-x-2.5">
                  <SalonLogoImage
                    logo={salonLogo}
                    name={salonName}
                    className="w-8 h-8 rounded-lg shrink-0 shadow-xs object-cover"
                  />
                  <span
                    className="text-sm font-black tracking-tight"
                    style={{ color: activePreviewTokens.textPrimary }}
                  >
                    {salonName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: `rgba(${activePreviewTokens.primaryRgb}, 0.12)`,
                      color: activePreviewTokens.primary
                    }}
                  >
                    Verified Salon
                  </span>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-95"
                    style={{
                      backgroundColor: activePreviewTokens.primary,
                      color: activePreviewTokens.buttonText
                    }}
                  >
                    Book Slot
                  </button>
                </div>
              </div>

              {/* Mock Service Card */}
              <div
                className="p-5 rounded-2xl border shadow-xs transition-colors duration-200"
                style={{
                  backgroundColor: activePreviewTokens.surface,
                  borderColor: activePreviewTokens.border
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: activePreviewTokens.primary }}
                      />
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: activePreviewTokens.primary }}
                      >
                        Signature Service
                      </span>
                    </div>
                    <h5
                      className="text-base font-black"
                      style={{ color: activePreviewTokens.textPrimary }}
                    >
                      Luxury Keratin Hair Spa & Blowout
                    </h5>
                    <p
                      className="text-xs"
                      style={{ color: activePreviewTokens.textSecondary }}
                    >
                      Deep scalp detox, organic keratin mask, and professional salon styling.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="text-lg font-black"
                      style={{ color: activePreviewTokens.primary }}
                    >
                      ₹ 1,499
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold justify-end">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>4.9 (128)</span>
                    </div>
                  </div>
                </div>

                {/* Sample Action Row */}
                <div
                  className="mt-4 pt-4 border-t flex items-center justify-between gap-3"
                  style={{ borderColor: activePreviewTokens.border }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                      style={{
                        backgroundColor: `rgba(${activePreviewTokens.primaryRgb}, 0.10)`,
                        color: activePreviewTokens.primary,
                        border: `1px solid rgba(${activePreviewTokens.primaryRgb}, 0.2)`
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Popular Service
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                      style={{
                        borderColor: `rgba(${activePreviewTokens.primaryRgb}, 0.35)`,
                        color: activePreviewTokens.primary
                      }}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      className="px-5 py-2 rounded-xl text-xs font-black shadow-sm transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                      style={{
                        backgroundColor: activePreviewTokens.primary,
                        color: activePreviewTokens.buttonText
                      }}
                    >
                      Add Service
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Background & Surface Swatch Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: activePreviewTokens.surface,
                    borderColor: activePreviewTokens.border
                  }}
                >
                  <span className="text-[10px] opacity-70">Background</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-400"
                      style={{ backgroundColor: activePreviewTokens.background }}
                    />
                    <span className="truncate">{activePreviewTokens.background}</span>
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: activePreviewTokens.surface,
                    borderColor: activePreviewTokens.border
                  }}
                >
                  <span className="text-[10px] opacity-70">Card Surface</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-400"
                      style={{ backgroundColor: activePreviewTokens.surface }}
                    />
                    <span className="truncate">{activePreviewTokens.surface}</span>
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: activePreviewTokens.surface,
                    borderColor: activePreviewTokens.border
                  }}
                >
                  <span className="text-[10px] opacity-70">Primary Button</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activePreviewTokens.primary }}
                    />
                    <span className="truncate">{activePreviewTokens.primary}</span>
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: activePreviewTokens.surface,
                    borderColor: activePreviewTokens.border
                  }}
                >
                  <span className="text-[10px] opacity-70">Text Primary</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-400"
                      style={{ backgroundColor: activePreviewTokens.textPrimary }}
                    />
                    <span className="truncate">{activePreviewTokens.textPrimary}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
