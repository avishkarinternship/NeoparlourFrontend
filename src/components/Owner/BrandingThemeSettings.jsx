import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Sparkles, RotateCcw, Eye, ShieldCheck, 
  Sliders, Calendar, Users, DollarSign, Clock,
  PlusCircle, Scissors, BarChart3, Star, ArrowRight, Sun, Moon, Search
} from 'lucide-react';
import { 
  getSalonTheme, 
  saveSalonTheme, 
  generateBalancedPalette, 
  extractBrandPaletteFromLogo, 
  getContrastRatio, 
  getContrastingTextColor,
  adaptBrandForDarkMode,
  removeDynamicTheme,
  applyDynamicTheme
} from '../../utils/themeGenerator';
import { SalonLogoImage } from '../../utils/whiteLabelHelper';

const PRESET_BG_STYLES = [
  { 
    id: 'brand-tint', 
    label: 'Brand-Driven Atmosphere', 
    badge: 'Recommended',
    desc: 'Light Mode: Soft pastel brand background. Dark Mode: Deep royal midnight brand atmosphere.' 
  },
  { 
    id: 'pure-white', 
    label: 'Pure White & Obsidian', 
    desc: 'Light Mode: Stark white surface. Dark Mode: Deep neutral obsidian.' 
  },
  { 
    id: 'warm-ivory', 
    label: 'Warm Ivory & Charcoal', 
    desc: 'Light Mode: Soft champagne ivory. Dark Mode: Warm dark bronze charcoal.' 
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
  const activeTokens = previewMode === 'dark' ? fullPalette.dark : fullPalette.light;

  // Apply real-time preview across the application when controls change
  useEffect(() => {
    applyDynamicTheme(fullPalette);
  }, [primaryColor, secondaryColor, bgStyle]);

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
      toast('🎨 Analyzing logo colors & generating brand-driven atmosphere...', { icon: '✨' });
      const extracted = await extractBrandPaletteFromLogo(salonLogo);
      if (extracted) {
        setPrimaryColor(extracted.primary);
        setSecondaryColor(extracted.secondary);
        setBgStyle(extracted.bgStyle || 'brand-tint');
        setCurrentPalette(extracted);
        saveSalonTheme(salonId, extracted);
        toast.success('Generated and applied brand-driven atmosphere from your logo!');
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
      toast.success('Custom brand theme saved and applied across the entire application!');
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
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-2xl transition-all glass-panel ${
          isDarkMode ? 'text-zinc-100' : 'text-gray-900'
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
                  Brand-Driven Atmospheric Theming
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Logo-Powered Atmosphere
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                The dominant logo colour dictates the complete website background: soft pastel in Light Mode and deep royal midnight in Dark Mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateFromLogo}
            disabled={isExtracting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
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
            className={`p-6 rounded-2xl space-y-5 glass-panel ${
              isDarkMode ? 'text-zinc-100' : 'text-gray-900'
            }`}
          >
            <h4
              className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                isDarkMode ? 'text-zinc-200' : 'text-gray-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-500" />
              Brand Palette Controls
            </h4>

            {/* Primary Brand Color */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                Dominant Brand Color (Logo Extracted)
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
                Determines main background tint, buttons, active sidebar tab, and ambient glow.
              </p>
            </div>

            {/* Dark Mode Adapted Accent */}
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
                  Calibrated for contrast against midnight background
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
                Secondary Accent Color
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
                Used for soft secondary tags, subtle borders, and gradient highlights.
              </p>
            </div>

            {/* Background Style Architecture */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                Background Theme Philosophy
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
                          ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10'
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
                      <div className="flex items-center gap-1.5 shrink-0">
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

        {/* Live Interactive Dashboard Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className={`p-6 rounded-2xl space-y-6 glass-panel ${
              isDarkMode ? 'text-zinc-100' : 'text-gray-900'
            }`}
          >
            {/* Preview Header with Light/Dark Mode Switcher */}
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <h4 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Live Application Simulation
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

            {/* Simulated Complete Application Shell (Matching User Reference Image) */}
            <div
              className="p-5 sm:p-6 rounded-2xl border space-y-5 transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: activeTokens.background,
                borderColor: activeTokens.border,
                color: activeTokens.textPrimary,
                backgroundImage: `radial-gradient(ellipse 80% 50% at 75% -10%, rgba(${activeTokens.primaryRgb}, ${previewMode === 'dark' ? 0.08 : 0.12}), transparent)`
              }}
            >
              {/* Simulated Navigation Bar */}
              <div
                className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors duration-200"
                style={{
                  backgroundColor: activeTokens.navBg,
                  borderColor: activeTokens.border
                }}
              >
                <div className="flex items-center space-x-2.5">
                  <SalonLogoImage
                    logo={salonLogo}
                    name={salonName}
                    className="w-9 h-9 rounded-xl shrink-0 shadow-xs object-cover"
                  />
                  <div>
                    <span
                      className="text-sm font-black tracking-tight block"
                      style={{ color: activeTokens.textPrimary }}
                    >
                      {salonName}
                    </span>
                    <span className="text-[10px] opacity-70 block" style={{ color: activeTokens.textSecondary }}>
                      ABC Complex, Kothrud, Pune
                    </span>
                  </div>
                </div>

                {/* Pill Search Input */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs"
                    style={{
                      backgroundColor: activeTokens.inputBg,
                      borderColor: activeTokens.inputBorder,
                      color: activeTokens.textSecondary
                    }}
                  >
                    <Search className="w-3.5 h-3.5 opacity-60" />
                    <span className="text-[11px] opacity-70">Search services, customers...</span>
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="space-y-1">
                <h3
                  className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: activeTokens.textPrimary }}
                >
                  Welcome back, {salonName}!
                </h3>
                <p className="text-xs" style={{ color: activeTokens.textSecondary }}>
                  Manage your salon efficiently and grow your business.
                </p>
              </div>

              {/* 4 KPI Metric Cards (Matching Reference Mockup) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Appointments', value: '128', change: '↑ 12%', icon: Calendar },
                  { label: 'Total Customers', value: '86', change: '↑ 8%', icon: Users },
                  { label: 'Total Revenue', value: '₹48,500', change: '↑ 15%', icon: DollarSign },
                  { label: 'Pending Appts', value: '24', change: '↓ 5%', icon: Clock }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border shadow-xs transition-all"
                    style={{
                      backgroundColor: activeTokens.surface,
                      borderColor: activeTokens.border
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold" style={{ color: activeTokens.textSecondary }}>
                        {stat.label}
                      </span>
                      <stat.icon
                        className="w-3.5 h-3.5"
                        style={{ color: activeTokens.primary }}
                      />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-lg font-black tracking-tight"
                        style={{ color: activeTokens.textPrimary }}
                      >
                        {stat.value}
                      </span>
                      <span className="text-[9px] font-black text-emerald-500">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions (Matching Reference Mockup) */}
              <div className="space-y-2">
                <span className="text-xs font-bold" style={{ color: activeTokens.textPrimary }}>
                  Quick Actions
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    style={{
                      backgroundColor: activeTokens.primary,
                      color: activeTokens.buttonText
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Appointment →
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: activeTokens.surface,
                      borderColor: activeTokens.border,
                      color: activeTokens.textPrimary
                    }}
                  >
                    <PlusCircle className="w-3.5 h-3.5" style={{ color: activeTokens.primary }} />
                    Add Customer
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: activeTokens.surface,
                      borderColor: activeTokens.border,
                      color: activeTokens.textPrimary
                    }}
                  >
                    <Scissors className="w-3.5 h-3.5" style={{ color: activeTokens.primary }} />
                    Manage Services
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: activeTokens.surface,
                      borderColor: activeTokens.border,
                      color: activeTokens.textPrimary
                    }}
                  >
                    <BarChart3 className="w-3.5 h-3.5" style={{ color: activeTokens.primary }} />
                    View Reports
                  </button>
                </div>
              </div>

              {/* Active Tokens Swatch Grid */}
              <div className="pt-2 border-t" style={{ borderColor: activeTokens.border }}>
                <span className="text-[10px] font-black uppercase tracking-wider block mb-2" style={{ color: activeTokens.textSecondary }}>
                  Active Generated Palette Hierarchy
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div
                    className="p-2 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: activeTokens.surface, borderColor: activeTokens.border }}
                  >
                    <span style={{ color: activeTokens.textSecondary }}>Page Bg</span>
                    <span className="font-mono font-bold" style={{ color: activeTokens.textPrimary }}>{activeTokens.background}</span>
                  </div>
                  <div
                    className="p-2 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: activeTokens.surface, borderColor: activeTokens.border }}
                  >
                    <span style={{ color: activeTokens.textSecondary }}>Card Surface</span>
                    <span className="font-mono font-bold" style={{ color: activeTokens.textPrimary }}>{activeTokens.surface}</span>
                  </div>
                  <div
                    className="p-2 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: activeTokens.surface, borderColor: activeTokens.border }}
                  >
                    <span style={{ color: activeTokens.textSecondary }}>Primary Brand</span>
                    <span className="font-mono font-bold" style={{ color: activeTokens.primary }}>{activeTokens.primary}</span>
                  </div>
                  <div
                    className="p-2 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: activeTokens.surface, borderColor: activeTokens.border }}
                  >
                    <span style={{ color: activeTokens.textSecondary }}>Text Primary</span>
                    <span className="font-mono font-bold" style={{ color: activeTokens.textPrimary }}>{activeTokens.textPrimary}</span>
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
