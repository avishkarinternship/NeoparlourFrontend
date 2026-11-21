/**
 * Dynamic Logo-Based Theme Generation & Color Science Utility
 *
 * Implements WCAG 2.1 contrast standards, intelligent brand color extraction,
 * harmonic palette generation, and dynamic CSS token application.
 */

import axiosInstance from '../api/axiosInstance';
import { getSalonImageSrc } from './whiteLabelHelper';

export const THEME_CHANGE_EVENT = 'np_salon_theme_changed';

// ==========================================
// 1. COLOR MATHEMATICS & CONVERSIONS
// ==========================================

export const hexToRgb = (hex) => {
  if (!hex) return { r: 255, g: 11, b: 1 };
  let clean = String(hex).replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 11, b: 1 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
};

export const rgbToHex = (r, g, b) => {
  const clamp = (n) => Math.min(255, Math.max(0, Math.round(n)));
  const toHex = (n) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsl = (r, g, b) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: parseFloat(s.toFixed(3)),
    l: parseFloat(l.toFixed(3))
  };
};

export const hslToRgb = (h, s, l) => {
  let r, g, b;
  const hNorm = h / 360;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      let tNorm = t;
      if (tNorm < 0) tNorm += 1;
      if (tNorm > 1) tNorm -= 1;
      if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
      if (tNorm < 1 / 2) return q;
      if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Calculates WCAG relative luminance of an sRGB color.
 */
export const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates contrast ratio between two hex colors according to WCAG 2.1 standards.
 * Returns ratio from 1 to 21 (e.g. 4.5 for WCAG AA).
 */
export const getContrastRatio = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Returns optimal contrasting text color (#FFFFFF or #111827) for any background color.
 */
export const getContrastingTextColor = (bgHex) => {
  const whiteContrast = getContrastRatio(bgHex, '#FFFFFF');
  const darkContrast = getContrastRatio(bgHex, '#111827');
  return whiteContrast >= darkContrast ? '#FFFFFF' : '#111827';
};

export const darken = (hex, percent = 12) => {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const newL = Math.max(0, hsl.l - percent / 100);
  const newRgb = hslToRgb(hsl.h, hsl.s, newL);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

export const lighten = (hex, percent = 15) => {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const newL = Math.min(1, hsl.l + percent / 100);
  const newRgb = hslToRgb(hsl.h, hsl.s, newL);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

// ==========================================
// 2. INTELLIGENT LOGO IMAGE ANALYZER
// ==========================================

/**
 * Analyzes an image (URL, Blob, or DataURI) and extracts dominant brand colors
 * following professional color harmony guidelines.
 */
export const extractBrandPaletteFromLogo = async (imageSource) => {
  if (!imageSource) return null;

  return new Promise((resolve) => {
    let resolvedUrl = imageSource;
    if (typeof imageSource === 'string') {
      resolvedUrl = getSalonImageSrc(imageSource);
    }

    const processCanvas = (srcUrl, isBlob = false) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      let done = false;

      const finish = (result) => {
        if (!done) {
          done = true;
          if (isBlob && srcUrl && srcUrl.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(srcUrl);
            } catch (err) {
              console.debug('Failed to revoke blob:', err);
            }
          }
          resolve(result);
        }
      };

      const timer = setTimeout(() => finish(null), 6000);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return finish(null);

          const size = 64; // High accuracy sampling size
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size).data;
          const clusters = {};

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            // 1. Ignore transparent & translucent pixels
            if (a < 130) continue;

            const hsl = rgbToHsl(r, g, b);

            // 2. Ignore near-white & bleached backgrounds
            if (hsl.l > 0.94) continue;
            // 3. Ignore pitch black shadows & noise
            if (hsl.l < 0.08) continue;

            // Quantize to smooth clusters
            const qr = Math.round(r / 18) * 18;
            const qg = Math.round(g / 18) * 18;
            const qb = Math.round(b / 18) * 18;
            const key = `${qr},${qg},${qb}`;

            if (!clusters[key]) {
              clusters[key] = {
                r: qr,
                g: qg,
                b: qb,
                count: 1,
                h: hsl.h,
                s: hsl.s,
                l: hsl.l
              };
            } else {
              clusters[key].count++;
            }
          }

          const items = Object.values(clusters);
          if (items.length === 0) return finish(null);

          // Classify items into chromatic (colorful brand elements) and neutrals
          const chromatic = items.filter(item => item.s >= 0.14 && item.l >= 0.12 && item.l <= 0.88);

          let primaryCluster = null;
          let secondaryCluster = null;

          if (chromatic.length > 0) {
            // Score chromatic clusters: favor vibrant brand presence + sufficient pixel area
            chromatic.forEach(item => {
              // Sweet spot for lightness is between 0.30 and 0.65 for high visual impact
              const lightnessScore = 1 - Math.abs(item.l - 0.48);
              item.score = item.count * (1 + item.s * 3.0) * (0.8 + lightnessScore);
            });
            chromatic.sort((a, b) => b.score - a.score);

            primaryCluster = chromatic[0];

            // Look for a secondary color with distinct hue (>= 25deg) or distinct lightness (>= 0.25)
            secondaryCluster = chromatic.find(item => {
              const hueDiff = Math.abs(item.h - primaryCluster.h);
              const lightDiff = Math.abs(item.l - primaryCluster.l);
              return (hueDiff >= 28 && hueDiff <= 332) || lightDiff >= 0.26;
            });
          }

          // If no secondary color or no chromatic colors found
          if (!primaryCluster) {
            // Neutral / monochrome logo (e.g. black and white or silver/dark grey)
            items.sort((a, b) => b.count - a.count);
            primaryCluster = items[0] || { r: 24, g: 24, b: 27, h: 240, s: 0.05, l: 0.1 };
          }

          if (!secondaryCluster) {
            // Find another cluster or synthesize an elegant harmonious accent
            secondaryCluster = items.find(i => i !== primaryCluster && Math.abs(i.l - primaryCluster.l) >= 0.25);
          }

          const primaryHex = rgbToHex(primaryCluster.r, primaryCluster.g, primaryCluster.b);
          let secondaryHex = secondaryCluster 
            ? rgbToHex(secondaryCluster.r, secondaryCluster.g, secondaryCluster.b) 
            : lighten(primaryHex, 22);

          // If secondary is nearly identical to primary, create an analogous or lighter tint
          if (getContrastRatio(primaryHex, secondaryHex) < 1.35) {
            secondaryHex = lighten(primaryHex, 25);
          }

          const palette = generateBalancedPalette(primaryHex, secondaryHex, false);
          finish(palette);
        } catch (err) {
          console.warn('Dynamic theme extraction failed:', err);
          finish(null);
        }
      };

      img.onerror = () => finish(null);
      img.src = srcUrl;
    };

    // If remote API domain image, attempt blob fetch to prevent canvas CORS taint
    if (typeof resolvedUrl === 'string' && resolvedUrl.startsWith('http') && typeof window !== 'undefined' && !resolvedUrl.startsWith(window.location.origin)) {
      axiosInstance.get(resolvedUrl, { responseType: 'blob' })
        .then(res => {
          const blobUrl = URL.createObjectURL(res.data);
          processCanvas(blobUrl, true);
        })
        .catch(() => {
          processCanvas(resolvedUrl, false);
        });
    } else {
      processCanvas(resolvedUrl, false);
    }
  });
};

// ==========================================
// 3. COMPLETE DESIGN TOKEN GENERATOR
// ==========================================

/**
 * Takes primary & secondary brand colors and generates a complete,
 * production-grade design token palette obeying WCAG AA standards.
 */
export const generateBalancedPalette = (primaryHex, secondaryHex = null, isDarkMode = false) => {
  const primaryRgb = hexToRgb(primaryHex);
  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  // Compute primary hover and active states
  const isPrimaryLight = primaryHsl.l >= 0.65;
  const primaryHover = isPrimaryLight ? darken(primaryHex, 14) : lighten(primaryHex, 10);
  const primaryActive = isPrimaryLight ? darken(primaryHex, 20) : darken(primaryHex, 12);

  // Resolve secondary and accent
  let secHex = secondaryHex;
  if (!secHex) {
    secHex = lighten(primaryHex, 22);
  }
  const secRgb = hexToRgb(secHex);

  const accentHex = lighten(primaryHex, 18);
  const accentRgb = hexToRgb(accentHex);

  // Contrast-checked text colors
  const buttonTextColor = getContrastingTextColor(primaryHex);

  // Background and surface selection based on theme warmth
  const isWarmHue = (primaryHsl.h >= 25 && primaryHsl.h <= 75); // Gold / Amber / Warm orange
  const lightBg = isWarmHue ? '#FAF9F6' : '#FFFFFF';
  const lightSurface = '#FFFFFF';
  const lightBorder = isWarmHue ? '#EAE5D8' : '#E5E7EB';

  const tokens = {
    // Brand Tokens
    primary: primaryHex,
    primaryHover: primaryHover,
    primaryActive: primaryActive,
    secondary: secHex,
    accent: accentHex,
    buttonText: buttonTextColor,

    // Layout Tokens (Light Mode default)
    background: isDarkMode ? '#09090B' : lightBg,
    secondaryBackground: isDarkMode ? '#18181B' : (isWarmHue ? '#F5F3EF' : '#F9FAFB'),
    surface: isDarkMode ? '#18181B' : lightSurface,
    textPrimary: isDarkMode ? '#F4F4F5' : '#111827',
    textSecondary: isDarkMode ? '#A1A1AA' : '#6B7280',
    border: isDarkMode ? '#27272A' : lightBorder,
    inputBg: isDarkMode ? '#18181B' : '#FFFFFF',
    inputBorder: isDarkMode ? '#3F3F46' : '#D1D5DB',

    // System Feedback Tokens
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Navigation & Shell Tokens
    sidebarBg: isDarkMode ? '#121215' : '#FFFFFF',
    sidebarText: isDarkMode ? '#E4E4E7' : '#18181B',
    navBg: isDarkMode ? '#0E0E11' : '#FFFFFF',

    // RGB Strings for Tailwind Alpha Opacity Support
    primaryRgb: `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
    secondaryRgb: `${secRgb.r}, ${secRgb.g}, ${secRgb.b}`,
    accentRgb: `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`,

    // Backward Compatibility aliases
    primaryDark: primaryHex,
    themeLight: secHex,
    darkRgb: `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
    lightRgb: `${secRgb.r}, ${secRgb.g}, ${secRgb.b}`
  };

  return tokens;
};

// ==========================================
// 4. DYNAMIC CSS APPLICATION ENGINE
// ==========================================

/**
 * Injects a dynamic <style> tag into the document head containing CSS variables
 * and Tailwind overrides.
 */
export const applyDynamicTheme = (palette) => {
  if (!palette || !palette.primary || typeof document === 'undefined') return;

  try {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    let styleEl = document.getElementById('np-salon-dynamic-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'np-salon-dynamic-theme';
      head.appendChild(styleEl);
    }

    const pr = palette.primaryRgb || '255, 11, 1';
    const btnText = palette.buttonText || '#FFFFFF';

    styleEl.innerHTML = `
      :root {
        /* Design Tokens */
        --color-primary: ${palette.primary};
        --color-primary-hover: ${palette.primaryHover || darken(palette.primary, 12)};
        --color-primary-active: ${palette.primaryActive || darken(palette.primary, 18)};
        --color-secondary: ${palette.secondary || palette.primary};
        --color-accent: ${palette.accent || palette.primary};
        --color-button-text: ${btnText};
        --color-background: ${palette.background || '#FFFFFF'};
        --color-secondary-background: ${palette.secondaryBackground || '#F9FAFB'};
        --color-surface: ${palette.surface || '#FFFFFF'};
        --color-text-primary: ${palette.textPrimary || '#111827'};
        --color-text-secondary: ${palette.textSecondary || '#6B7280'};
        --color-border: ${palette.border || '#E5E7EB'};
        --color-input-bg: ${palette.inputBg || '#FFFFFF'};
        --color-input-border: ${palette.inputBorder || '#D1D5DB'};
        --color-success: ${palette.success || '#10B981'};
        --color-warning: ${palette.warning || '#F59E0B'};
        --color-error: ${palette.error || '#EF4444'};

        /* RGB Variations */
        --color-primary-rgb: ${pr};
        --color-secondary-rgb: ${palette.secondaryRgb || pr};

        /* Legacy salon variables */
        --salon-primary: var(--color-primary);
        --salon-secondary: var(--color-secondary);
        --salon-primary-rgb: ${pr};
        --salon-secondary-rgb: ${palette.secondaryRgb || pr};
        --salon-theme-light-bg: rgba(${pr}, 0.08);
      }

      /* ============================================================
         GLOBAL THEME OVERRIDES FOR BUTTONS, BADGES, AND HIGHLIGHTS
         ============================================================ */

      /* Primary Brand Backgrounds & Buttons */
      .bg-\\[\\#FF0B01\\], 
      .bg-\\[\\#ff0b01\\], 
      .bg-\\[\\#EF3E23\\],
      .bg-red-600,
      .bg-red-500 {
        background-color: var(--color-primary) !important;
        color: var(--color-button-text) !important;
      }

      /* Hover States */
      .hover\\:bg-red-700:hover, 
      .hover\\:bg-red-600:hover,
      .hover\\:bg-\\[\\#E02510\\]:hover {
        background-color: var(--color-primary-hover) !important;
        color: var(--color-button-text) !important;
      }

      /* Active States */
      .active\\:scale-95:active,
      .active\\:scale-\\[0\\.98\\]:active {
        background-color: var(--color-primary-active);
      }

      /* Text Brand Accents */
      .text-\\[\\#FF0B01\\], 
      .text-\\[\\#ff0b01\\], 
      .text-\\[\\#EF3E23\\],
      .text-\\[\\#FF2A14\\],
      .text-red-600,
      .text-red-500 {
        color: var(--color-primary) !important;
      }

      /* SVG Icon Colors */
      svg.text-\\[\\#FF0B01\\],
      svg.text-\\[\\#ff0b01\\],
      svg.text-red-600,
      svg.text-red-500 {
        color: var(--color-primary) !important;
      }

      /* Primary Borders */
      .border-\\[\\#FF0B01\\], 
      .border-\\[\\#ff0b01\\], 
      .border-\\[\\#EF3E23\\],
      .border-red-600,
      .border-red-500 {
        border-color: var(--color-primary) !important;
      }

      /* Focus Rings */
      .ring-\\[\\#FF0B01\\]\\/20,
      .ring-red-500\\/20,
      .focus-within\\:ring-red-500:focus-within,
      .focus\\:ring-red-500:focus {
        --tw-ring-color: rgba(var(--color-primary-rgb), 0.35) !important;
      }

      /* Light Accent Badges & Tints */
      .bg-red-50, 
      .bg-\\[\\#ffebeb\\],
      .bg-red-500\\/10,
      .bg-red-500\\/15,
      .bg-red-500\\/20 {
        background-color: rgba(var(--color-primary-rgb), 0.08) !important;
      }

      /* Subtle Hover Backgrounds */
      .hover\\:bg-red-50:hover,
      .hover\\:bg-red-50\\/10:hover,
      .hover\\:bg-red-50\\/20:hover {
        background-color: rgba(var(--color-primary-rgb), 0.09) !important;
      }

      /* Gradients */
      .from-\\[\\#ff0b01\\],
      .from-\\[\\#FF0B01\\],
      .from-red-600 {
        --tw-gradient-from: var(--color-primary) !important;
        --tw-gradient-to: rgba(var(--color-primary-rgb), 0) !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
      }

      .to-red-600,
      .to-red-700,
      .to-\\[\\#FF4D3A\\] {
        --tw-gradient-to: var(--color-primary-hover) !important;
      }

      /* Dark mode subtle accents */
      .dark .bg-red-950\\/40,
      .dark .bg-red-950\\/50,
      .dark .bg-red-900\\/20 {
        background-color: rgba(var(--color-primary-rgb), 0.22) !important;
      }

      .dark .text-red-400 {
        color: var(--color-primary) !important;
        filter: brightness(1.25);
      }
    `;
  } catch (e) {
    console.error('Failed to apply dynamic theme stylesheet:', e);
  }
};

/**
 * Removes the dynamic theme stylesheet, restoring default platform styling.
 */
export const removeDynamicTheme = () => {
  try {
    if (typeof document === 'undefined') return;
    const styleEl = document.getElementById('np-salon-dynamic-theme');
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  } catch (e) {
    console.error('Failed to remove dynamic theme stylesheet:', e);
  }
};

// ==========================================
// 5. STORAGE & SYNCHRONIZATION HELPERS
// ==========================================

export const getSalonTheme = (salonId = null) => {
  try {
    const effectiveId = salonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    if (effectiveId) {
      const specific = localStorage.getItem(`salon_theme_${effectiveId}`);
      if (specific && specific !== 'undefined' && specific !== 'null') {
        return JSON.parse(specific);
      }
    }
    const globalCached = localStorage.getItem('activeSalonTheme');
    if (globalCached && globalCached !== 'undefined' && globalCached !== 'null') {
      return JSON.parse(globalCached);
    }
  } catch (e) {
    console.warn('Failed to read salon theme from storage:', e);
  }
  return null;
};

export const saveSalonTheme = (salonId, palette) => {
  if (!palette) return;
  try {
    const effectiveId = salonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    if (effectiveId) {
      localStorage.setItem(`salon_theme_${effectiveId}`, JSON.stringify(palette));
    }
    localStorage.setItem('activeSalonTheme', JSON.stringify(palette));
    applyDynamicTheme(palette);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { salonId: effectiveId, palette } }));
    }
  } catch (e) {
    console.error('Failed to save salon theme:', e);
  }
};

export const resetSalonThemeToLogo = async (salonId, logoUrl) => {
  if (!logoUrl) return null;
  const palette = await extractBrandPaletteFromLogo(logoUrl);
  if (palette) {
    saveSalonTheme(salonId, palette);
  }
  return palette;
};
