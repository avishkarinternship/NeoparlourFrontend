import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Sparkles, RotateCcw, Check, Palette, Eye, ShieldCheck, 
  Layers, Sliders, AlertCircle, ShoppingBag, Star, ArrowRight 
} from 'lucide-react';
import { 
  getSalonTheme, 
  saveSalonTheme, 
  generateBalancedPalette, 
  extractBrandPaletteFromLogo, 
  getContrastRatio, 
  getContrastingTextColor,
  removeDynamicTheme
} from '../../utils/themeGenerator';
import { SalonLogoImage } from '../../utils/whiteLabelHelper';

const PRESET_BACKGROUNDS = [
  { label: 'Pure White', value: '#FFFFFF', desc: 'Crisp, modern & ultra-clean' },
  { label: 'Warm Ivory', value: '#FAF9F6', desc: 'Soft, luxury & organic' },
  { label: 'Cool Slate', value: '#F8FAFC', desc: 'Refined, high-tech & corporate' }
];

export default function BrandingThemeSettings({ salon, isDarkMode }) {
  const salonId = salon?.id || salon?.salonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
  const salonLogo = salon?.imageUrl || salon?.logo || salon?.logoUrl || localStorage.getItem('activeSalonLogo') || localStorage.getItem('salon_logo');
  const salonName = salon?.salonName || salon?.name || localStorage.getItem('salon_name') || 'Your Salon';

  const [currentPalette, setCurrentPalette] = useState(() => {
    return getSalonTheme(salonId) || generateBalancedPalette('#FF0B01', '#FFFFFF', isDarkMode);
  });

  const [primaryColor, setPrimaryColor] = useState(currentPalette.primary || '#FF0B01');
  const [secondaryColor, setSecondaryColor] = useState(currentPalette.secondary || '#FFFFFF');
  const [bgChoice, setBgChoice] = useState(currentPalette.background || '#FFFFFF');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with storage
  useEffect(() => {
    const saved = getSalonTheme(salonId);
    if (saved) {
      setCurrentPalette(saved);
      setPrimaryColor(saved.primary || '#FF0B01');
      setSecondaryColor(saved.secondary || '#FFFFFF');
      setBgChoice(saved.background || '#FFFFFF');
    }
  }, [salonId]);

  // Compute live preview palette based on form inputs
  const previewPalette = generateBalancedPalette(primaryColor, secondaryColor, isDarkMode);
  previewPalette.background = bgChoice;

  // Calculate contrast score for primary button
  const buttonTextColor = getContrastingTextColor(primaryColor);
  const contrastRatio = getContrastRatio(primaryColor, buttonTextColor).toFixed(1);
  const isWcagCompliant = parseFloat(contrastRatio) >= 4.5;

  // Auto-generate from current logo
  const handleGenerateFromLogo = async () => {
    if (!salonLogo) {
      toast.error('No salon logo found. Please upload a logo in the "Salon Profile" tab first.');
      return;
    }

    try {
      setIsExtracting(true);
      toast('🎨 Analyzing logo colors & computing harmonic palette...', { icon: '✨' });
      const extracted = await extractBrandPaletteFromLogo(salonLogo);
      if (extracted) {
        setPrimaryColor(extracted.primary);
        setSecondaryColor(extracted.secondary);
        setBgChoice(extracted.background || '#FFFFFF');
        setCurrentPalette(extracted);
        saveSalonTheme(salonId, extracted);
        toast.success('Generated and applied balanced brand theme from your logo!');
      } else {
        toast.error('Could not extract colors from the logo image. Using default platform theme.');
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
      const finalPalette = {
        ...previewPalette,
        background: bgChoice,
        buttonText: buttonTextColor
      };
      saveSalonTheme(salonId, finalPalette);
      setCurrentPalette(finalPalette);
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
    const defaultPalette = generateBalancedPalette('#FF0B01', '#FFFFFF', isDarkMode);
    setCurrentPalette(defaultPalette);
    setPrimaryColor('#FF0B01');
    setSecondaryColor('#FFFFFF');
    setBgChoice('#FFFFFF');
    toast.success('Reset website colors to default NeoParlour theme.');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-gradient-to-r from-red-50/40 via-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <SalonLogoImage logo={salonLogo} name={salonName} className="w-14 h-14 rounded-2xl shadow-md shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dynamic Branding & Color Theme
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                  Logo-Powered
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                Automatically harmonizes your entire website's buttons, badges, navigation, and accents around {salonName}'s official logo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateFromLogo}
            disabled={isExtracting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            {isExtracting ? 'Analyzing Logo...' : 'Auto-Generate from Logo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-2xl border space-y-5 ${
            isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
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
                Applied to primary buttons, highlights, active tabs, and key icons.
              </p>
            </div>

            {/* Secondary Accent Color */}
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
                Applied to secondary badges, soft tints, and decorative gradients.
              </p>
            </div>

            {/* Background Style Preset */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                Background Tone Preference
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_BACKGROUNDS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBgChoice(preset.value)}
                    className={`p-2.5 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                      bgChoice === preset.value
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/10'
                        : isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{preset.label}</div>
                      <div className="text-[10px] text-gray-400">{preset.desc}</div>
                    </div>
                    <span 
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-xs shrink-0" 
                      style={{ backgroundColor: preset.value }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility & Contrast Monitor */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              isWcagCompliant 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Button Contrast: <strong>{contrastRatio}:1</strong></span>
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
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
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
          <div className={`p-6 rounded-2xl border space-y-6 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-zinc-800">
              <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                <Eye className="w-4 h-4 text-red-500" />
                Live Brand Preview
              </h4>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Real-Time Simulation
              </span>
            </div>

            {/* Mock Navigation Header */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between shadow-xs ${
              isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-2.5">
                <SalonLogoImage logo={salonLogo} name={salonName} className="w-8 h-8 rounded-lg shrink-0 shadow-xs" />
                <span className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {salonName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ 
                    backgroundColor: `rgba(${previewPalette.primaryRgb}, 0.1)`, 
                    color: primaryColor 
                  }}
                >
                  Verified Salon
                </span>
                <button 
                  type="button" 
                  className="px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-95"
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                >
                  Book Slot
                </button>
              </div>
            </div>

            {/* Mock Service Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-gray-50/50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: primaryColor }} 
                    />
                    <span 
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: primaryColor }}
                    >
                      Signature Treatment
                    </span>
                  </div>
                  <h5 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Luxury Keratin Hair Spa & Styling
                  </h5>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                    Includes deep scalp detox, organic keratin mask, and professional blowout.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black" style={{ color: primaryColor }}>
                    ₹ 1,499
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold justify-end">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>4.9 (128)</span>
                  </div>
                </div>
              </div>

              {/* Sample Action Row */}
              <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                    style={{ 
                      backgroundColor: `rgba(${previewPalette.primaryRgb}, 0.08)`, 
                      color: primaryColor,
                      border: `1px solid rgba(${previewPalette.primaryRgb}, 0.2)`
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
                      borderColor: `rgba(${previewPalette.primaryRgb}, 0.3)`, 
                      color: primaryColor 
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    type="button" 
                    className="px-5 py-2 rounded-xl text-xs font-black shadow-sm transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                    style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                  >
                    Add Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Design Tokens Grid */}
            <div className="space-y-3">
              <h5 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                Active Design Tokens
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-white border-gray-200'
                }`}>
                  <span className="text-gray-400 text-[10px]">Primary</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <span className="truncate">{primaryColor}</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-white border-gray-200'
                }`}>
                  <span className="text-gray-400 text-[10px]">Hover State</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: previewPalette.primaryHover }} />
                    <span className="truncate">{previewPalette.primaryHover}</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-white border-gray-200'
                }`}>
                  <span className="text-gray-400 text-[10px]">Button Text</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: buttonTextColor }} />
                    <span className="truncate">{buttonTextColor}</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-white border-gray-200'
                }`}>
                  <span className="text-gray-400 text-[10px]">Accent Tint</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: previewPalette.accent }} />
                    <span className="truncate">{previewPalette.accent}</span>
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
