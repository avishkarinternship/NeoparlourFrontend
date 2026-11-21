/**
 * Dynamic Logo-Based Theme Generation & Adaptive Color Science System
 *
 * Implements WCAG 2.1 contrast standards, perimeter-aware logo extraction,
 * brand-tinted adaptive light and dark modes, and dual-mode stylesheet injection.
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
    clean = clean.split('').map((c) => c + c).join('');
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
  const hNorm = ((h % 360) + 360) % 360 / 360;

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
 * Calculates WCAG 2.1 relative luminance of an sRGB color.
 */
export const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates contrast ratio between two hex colors according to WCAG 2.1.
 * Returns ratio from 1.0 to 21.0.
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

/**
 * Intelligently adapts brand color for Dark Mode.
 * - Deep colors (Navy, dark maroon, forest green): lifted so they remain legible on dark surfaces.
 * - Bright/neon/golden colors: gently softened to luxury metallic tones to prevent eye strain.
 * - Midtones (Purple, Emerald, Crimson): balanced saturation & lightness.
 */
export const adaptBrandForDarkMode = (primaryHex) => {
  const { r, g, b } = hexToRgb(primaryHex);
  const hsl = rgbToHsl(r, g, b);

  if (hsl.l < 0.38) {
    // Too dark for dark mode surface: lift lightness
    const adapted = hslToRgb(hsl.h, Math.min(1, hsl.s * 1.1), 0.58);
    return rgbToHex(adapted.r, adapted.g, adapted.b);
  }

  if (hsl.l > 0.65) {
    // Too light/neon: soften to elegant metallic tone
    const adapted = hslToRgb(hsl.h, Math.min(1, hsl.s * 0.9), 0.50);
    return rgbToHex(adapted.r, adapted.g, adapted.b);
  }

  // Already well-balanced
  return primaryHex;
};

// ==========================================
// 2. INTELLIGENT LOGO IMAGE ANALYZER
// ==========================================

/**
 * Analyzes an image (URL, Blob, or DataURI), detects canvas background vs brand colors,
 * rejects solid canvas backgrounds, and extracts the primary and secondary brand colors.
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
              console.debug('Failed to revoke blob URL:', err);
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

          const size = 64; // High accuracy sampling grid
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size).data;

          // Step A: Detect canvas background by sampling perimeter edge pixels
          const perimeterCounts = {};
          let totalPerimeter = 0;

          const samplePerimeterPixel = (x, y) => {
            const idx = (y * size + x) * 4;
            const a = imgData[idx + 3];
            if (a < 120) return; // ignore transparent edges
            const r = Math.round(imgData[idx] / 16) * 16;
            const g = Math.round(imgData[idx + 1] / 16) * 16;
            const b = Math.round(imgData[idx + 2] / 16) * 16;
            const key = `${r},${g},${b}`;
            perimeterCounts[key] = (perimeterCounts[key] || 0) + 1;
            totalPerimeter++;
          };

          for (let x = 0; x < size; x++) {
            samplePerimeterPixel(x, 0); // top edge
            samplePerimeterPixel(x, size - 1); // bottom edge
          }
          for (let y = 1; y < size - 1; y++) {
            samplePerimeterPixel(0, y); // left edge
            samplePerimeterPixel(size - 1, y); // right edge
          }

          let canvasBgRgb = null;
          if (totalPerimeter > 10) {
            let maxCount = 0;
            let dominantPerimeterKey = null;
            Object.entries(perimeterCounts).forEach(([key, count]) => {
              if (count > maxCount) {
                maxCount = count;
                dominantPerimeterKey = key;
              }
            });

            // If a single color occupies > 40% of perimeter, it's the logo canvas background
            if (maxCount / totalPerimeter > 0.40 && dominantPerimeterKey) {
              const [cR, cG, cB] = dominantPerimeterKey.split(',').map(Number);
              canvasBgRgb = { r: cR, g: cG, b: cB };
            }
          }

          // Step B: Collect color clusters from the logo
          const clusters = {};

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            // 1. Ignore transparent & translucent pixels
            if (a < 120) continue;

            // 2. Reject pixels identical/very close to detected canvas background
            if (canvasBgRgb) {
              const dist = Math.sqrt(
                Math.pow(r - canvasBgRgb.r, 2) +
                Math.pow(g - canvasBgRgb.g, 2) +
                Math.pow(b - canvasBgRgb.b, 2)
              );
              if (dist < 32) continue; // Skip canvas background color
            }

            const hsl = rgbToHsl(r, g, b);

            // 3. Ignore bleached white pixels
            if (hsl.l > 0.94) continue;
            // 4. Ignore pure black noise
            if (hsl.l < 0.08) continue;

            // Quantize to smooth clusters
            const qr = Math.round(r / 16) * 16;
            const qg = Math.round(g / 16) * 16;
            const qb = Math.round(b / 16) * 16;
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
          if (items.length === 0) {
            // If all filtered out (e.g. solid white or black icon), fall back to neutral
            return finish(generateBalancedPalette('#18181B', '#7C3AED'));
          }

          // Step C: Classify into chromatic (colorful brand elements) and neutrals
          const chromatic = items.filter((item) => item.s >= 0.14 && item.l >= 0.10 && item.l <= 0.90);

          let primaryCluster = null;
          let secondaryCluster = null;

          if (chromatic.length > 0) {
            // Score chromatic clusters: favor vibrant brand presence + balance
            chromatic.forEach((item) => {
              const lightnessScore = 1 - Math.abs(item.l - 0.48);
              item.score = item.count * (1 + item.s * 3.2) * (0.8 + lightnessScore);
            });
            chromatic.sort((a, b) => b.score - a.score);

            primaryCluster = chromatic[0];

            // Find distinct secondary color
            secondaryCluster = chromatic.find((item) => {
              const hueDiff = Math.abs(item.h - primaryCluster.h);
              const lightDiff = Math.abs(item.l - primaryCluster.l);
              return (hueDiff >= 26 && hueDiff <= 334) || lightDiff >= 0.24;
            });
          }

          // If no chromatic color found (e.g. monochrome / grayscale logo)
          if (!primaryCluster) {
            items.sort((a, b) => b.count - a.count);
            primaryCluster = items[0] || { r: 24, g: 24, b: 27, h: 240, s: 0.05, l: 0.1 };
          }

          if (!secondaryCluster) {
            secondaryCluster = items.find(
              (i) => i !== primaryCluster && Math.abs(i.l - primaryCluster.l) >= 0.20
            );
          }

          const primaryHex = rgbToHex(primaryCluster.r, primaryCluster.g, primaryCluster.b);
          let secondaryHex = secondaryCluster
            ? rgbToHex(secondaryCluster.r, secondaryCluster.g, secondaryCluster.b)
            : lighten(primaryHex, 20);

          if (getContrastRatio(primaryHex, secondaryHex) < 1.30) {
            secondaryHex = lighten(primaryHex, 24);
          }

          const palette = generateBalancedPalette(primaryHex, secondaryHex, 'brand-tint');
          finish(palette);
        } catch (err) {
          console.warn('Dynamic theme extraction failed:', err);
          finish(null);
        }
      };

      img.onerror = () => finish(null);
      img.src = srcUrl;
    };

    if (
      typeof resolvedUrl === 'string' &&
      resolvedUrl.startsWith('http') &&
      typeof window !== 'undefined' &&
      !resolvedUrl.startsWith(window.location.origin)
    ) {
      axiosInstance
        .get(resolvedUrl, { responseType: 'blob' })
        .then((res) => {
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
// 3. COMPLETE DUAL-MODE DESIGN TOKEN GENERATOR
// ==========================================

/**
 * Takes primary & secondary brand colors and generates a complete dual-mode design token
 * palette obeying WCAG AA standards.
 *
 * In Light Mode:
 * - website background: luminous, soft light version of brand color (e.g. light purple #FAF7FF)
 * - card surface: pure white #FFFFFF
 * - text: crisp dark charcoal / black
 * - buttons: primary brand color with contrasting text
 *
 * In Dark Mode:
 * - website background: rich, deep dark version of brand color (e.g. midnight purple #0F091B)
 * - card surface: elevated dark brand surface #1A112C
 * - text: pure white #FFFFFF
 * - buttons: adapted brand color with contrasting text
 */
export const generateBalancedPalette = (primaryHex, secondaryHex = null, bgStyle = 'brand-tint') => {
  const pRgb = hexToRgb(primaryHex);
  const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);

  // Secondary color fallback
  let secHex = secondaryHex;
  if (!secHex) {
    secHex = lighten(primaryHex, 20);
  }
  const sRgb = hexToRgb(secHex);

  // Dark-mode adapted primary
  const darkPrimaryHex = adaptBrandForDarkMode(primaryHex);
  const darkPRgb = hexToRgb(darkPrimaryHex);

  // ----------------------------------------------------
  // LIGHT MODE TOKENS
  // ----------------------------------------------------
  let lightBgHex = '#FAF9FB';
  let lightSecBgHex = '#F3EEFC';
  let lightBorderHex = '#EAE2F7';

  if (bgStyle === 'pure-white') {
    lightBgHex = '#FFFFFF';
    lightSecBgHex = '#F9FAFB';
    lightBorderHex = '#E5E7EB';
  } else if (bgStyle === 'warm-ivory') {
    lightBgHex = '#FAF9F6';
    lightSecBgHex = '#F5F3EF';
    lightBorderHex = '#EAE5D8';
  } else {
    // 'brand-tint' (default): Derive soft, luminous light tint from brand hue
    if (pHsl.s >= 0.10) {
      const bRgb = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.35, 0.25), 0.98);
      lightBgHex = rgbToHex(bRgb.r, bRgb.g, bRgb.b);

      const secRgbBg = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.35, 0.28), 0.955);
      lightSecBgHex = rgbToHex(secRgbBg.r, secRgbBg.g, secRgbBg.b);

      const brdRgb = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.30, 0.25), 0.90);
      lightBorderHex = rgbToHex(brdRgb.r, brdRgb.g, brdRgb.b);
    } else {
      lightBgHex = '#FAFAFA';
      lightSecBgHex = '#F4F4F5';
      lightBorderHex = '#E4E4E7';
    }
  }

  const lightButtonText = getContrastingTextColor(primaryHex);
  const lightPrimaryHover = darken(primaryHex, 12);
  const lightPrimaryActive = darken(primaryHex, 18);

  const lightTokens = {
    primary: primaryHex,
    primaryHover: lightPrimaryHover,
    primaryActive: lightPrimaryActive,
    secondary: secHex,
    accent: lighten(primaryHex, 16),
    buttonText: lightButtonText,

    background: lightBgHex,
    secondaryBackground: lightSecBgHex,
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    border: lightBorderHex,
    inputBg: '#FFFFFF',
    inputBorder: '#D1D5DB',

    primaryRgb: `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`,
    secondaryRgb: `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`
  };

  // ----------------------------------------------------
  // DARK MODE TOKENS
  // ----------------------------------------------------
  let darkBgHex = '#0F091B';
  let darkSecBgHex = '#150D24';
  let darkSurfaceHex = '#1A112C';
  let darkBorderHex = '#2B1D47';

  if (bgStyle === 'pure-white') {
    // Pure neutral dark
    darkBgHex = '#09090B';
    darkSecBgHex = '#121215';
    darkSurfaceHex = '#18181B';
    darkBorderHex = '#27272A';
  } else if (bgStyle === 'warm-ivory') {
    // Warm dark charcoal
    darkBgHex = '#15130C';
    darkSecBgHex = '#1C1912';
    darkSurfaceHex = '#242117';
    darkBorderHex = '#383428';
  } else {
    // 'brand-tint' (default): Derive deep, rich dark version of brand
    if (pHsl.s >= 0.10) {
      const dRgb = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.40, 0.32), 0.065);
      darkBgHex = rgbToHex(dRgb.r, dRgb.g, dRgb.b);

      const dSecRgb = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.35, 0.30), 0.09);
      darkSecBgHex = rgbToHex(dSecRgb.r, dSecRgb.g, dSecRgb.b);

      const dSurfRgb = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.35, 0.28), 0.115);
      darkSurfaceHex = rgbToHex(dSurfRgb.r, dSurfRgb.g, dSurfRgb.b);

      const dBrgRgb = hslToRgb(pHsl.h, Math.min(pHsl.s * 0.30, 0.25), 0.20);
      darkBorderHex = rgbToHex(dBrgRgb.r, dBrgRgb.g, dBrgRgb.b);
    } else {
      darkBgHex = '#09090B';
      darkSecBgHex = '#121215';
      darkSurfaceHex = '#18181B';
      darkBorderHex = '#27272A';
    }
  }

  const darkButtonText = getContrastingTextColor(darkPrimaryHex);
  const darkPrimaryHover = lighten(darkPrimaryHex, 10);
  const darkPrimaryActive = darken(darkPrimaryHex, 10);

  const darkTokens = {
    primary: darkPrimaryHex,
    primaryHover: darkPrimaryHover,
    primaryActive: darkPrimaryActive,
    secondary: lighten(darkPrimaryHex, 16),
    accent: lighten(darkPrimaryHex, 22),
    buttonText: darkButtonText,

    background: darkBgHex,
    secondaryBackground: darkSecBgHex,
    surface: darkSurfaceHex,
    textPrimary: '#FFFFFF',
    textSecondary: '#D4D4D8',
    border: darkBorderHex,
    inputBg: darkSurfaceHex,
    inputBorder: darkBorderHex,

    primaryRgb: `${darkPRgb.r}, ${darkPRgb.g}, ${darkPRgb.b}`,
    secondaryRgb: `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`
  };

  // ----------------------------------------------------
  // UNIFIED PALETTE OUTPUT (Backward Compatible)
  // ----------------------------------------------------
  return {
    light: lightTokens,
    dark: darkTokens,
    bgStyle: bgStyle,

    // Root properties mapped for backward compatibility
    primary: primaryHex,
    primaryHover: lightPrimaryHover,
    primaryActive: lightPrimaryActive,
    secondary: secHex,
    accent: lightTokens.accent,
    buttonText: lightButtonText,
    background: lightBgHex,
    secondaryBackground: lightSecBgHex,
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    border: lightBorderHex,
    inputBg: '#FFFFFF',
    inputBorder: '#D1D5DB',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    primaryDark: primaryHex,
    themeLight: secHex,
    primaryRgb: lightTokens.primaryRgb,
    secondaryRgb: lightTokens.secondaryRgb,
    darkRgb: lightTokens.primaryRgb,
    lightRgb: lightTokens.secondaryRgb
  };
};

// ==========================================
// 4. DYNAMIC DUAL-MODE STYLESHEET ENGINE
// ==========================================

/**
 * Injects a dynamic <style> tag into the document head containing CSS variables
 * for both :root (Light Mode) and .dark (Dark Mode), ensuring instantaneous mode
 * switching and complete UI adaptation.
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

    const light = palette.light || palette;
    const dark = palette.dark || palette;

    const lightPr = light.primaryRgb || palette.primaryRgb || '255, 11, 1';
    const lightSec = light.secondaryRgb || palette.secondaryRgb || '255, 235, 235';
    const darkPr = dark.primaryRgb || lightPr;
    const darkSec = dark.secondaryRgb || lightSec;

    styleEl.innerHTML = `
      /* ============================================================
         1. LIGHT MODE DESIGN TOKENS (:root)
         ============================================================ */
      :root {
        --color-primary: ${light.primary};
        --color-primary-hover: ${light.primaryHover || darken(light.primary, 12)};
        --color-primary-active: ${light.primaryActive || darken(light.primary, 18)};
        --color-secondary: ${light.secondary || light.primary};
        --color-accent: ${light.accent || light.primary};
        --color-button-text: ${light.buttonText || '#FFFFFF'};
        --color-background: ${light.background || '#FAF9FB'};
        --color-secondary-background: ${light.secondaryBackground || '#F3EEFC'};
        --color-surface: ${light.surface || '#FFFFFF'};
        --color-text-primary: ${light.textPrimary || '#111827'};
        --color-text-secondary: ${light.textSecondary || '#4B5563'};
        --color-border: ${light.border || '#EAE2F7'};
        --color-input-bg: ${light.inputBg || '#FFFFFF'};
        --color-input-border: ${light.inputBorder || '#D1D5DB'};
        --color-primary-rgb: ${lightPr};
        --color-secondary-rgb: ${lightSec};

        /* Legacy salon variables for complete backward compatibility */
        --salon-primary: var(--color-primary);
        --salon-secondary: var(--color-secondary);
        --salon-primary-rgb: ${lightPr};
        --salon-secondary-rgb: ${lightSec};
        --salon-theme-light-bg: rgba(${lightPr}, 0.08);
      }

      /* ============================================================
         2. DARK MODE DESIGN TOKENS (.dark)
         ============================================================ */
      .dark {
        --color-primary: ${dark.primary};
        --color-primary-hover: ${dark.primaryHover || lighten(dark.primary, 10)};
        --color-primary-active: ${dark.primaryActive || darken(dark.primary, 10)};
        --color-secondary: ${dark.secondary || dark.primary};
        --color-accent: ${dark.accent || dark.primary};
        --color-button-text: ${dark.buttonText || '#FFFFFF'};
        --color-background: ${dark.background || '#0F091B'};
        --color-secondary-background: ${dark.secondaryBackground || '#150D24'};
        --color-surface: ${dark.surface || '#1A112C'};
        --color-text-primary: ${dark.textPrimary || '#FFFFFF'};
        --color-text-secondary: ${dark.textSecondary || '#D4D4D8'};
        --color-border: ${dark.border || '#2B1D47'};
        --color-input-bg: ${dark.inputBg || '#1A112C'};
        --color-input-border: ${dark.inputBorder || '#2B1D47'};
        --color-primary-rgb: ${darkPr};
        --color-secondary-rgb: ${darkSec};

        /* Legacy dark mode overrides */
        --salon-primary: var(--color-primary);
        --salon-secondary: var(--color-secondary);
        --salon-primary-rgb: ${darkPr};
        --salon-secondary-rgb: ${darkSec};
        --salon-theme-light-bg: rgba(${darkPr}, 0.16);
      }

      /* ============================================================
         3. ADAPTIVE LIGHT MODE BACKGROUND & SURFACE APPLICATION
         ============================================================ */
      body:not(.dark) {
        background-color: var(--color-background);
        color: var(--color-text-primary);
      }

      :not(.dark) .bg-\\[\\#FAFAFA\\],
      :not(.dark) .bg-gray-50,
      :not(.dark) .bg-slate-50 {
        background-color: var(--color-background) !important;
      }

      /* ============================================================
         4. ADAPTIVE DARK MODE BACKGROUND & SURFACE APPLICATION
         ============================================================ */
      .dark body,
      html.dark body {
        background-color: var(--color-background) !important;
        color: var(--color-text-primary) !important;
      }

      .dark .bg-zinc-950,
      .dark.bg-zinc-950 {
        background-color: var(--color-background) !important;
      }

      .dark .bg-zinc-900,
      .dark.bg-zinc-900 {
        background-color: var(--color-surface) !important;
      }

      .dark .bg-zinc-800,
      .dark.bg-zinc-800 {
        background-color: var(--color-secondary-background) !important;
      }

      .dark .border-zinc-800,
      .dark .border-zinc-700 {
        border-color: var(--color-border) !important;
      }

      .dark .text-white,
      .dark .text-zinc-100 {
        color: var(--color-text-primary) !important;
      }

      .dark .text-zinc-400,
      .dark .text-zinc-300 {
        color: var(--color-text-secondary) !important;
      }

      /* ============================================================
         5. PRIMARY BRAND BUTTONS, BADGES, AND HIGHLIGHTS
         ============================================================ */

      /* Buttons & Solid Brand Elements */
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
        background-color: rgba(var(--color-primary-rgb), 0.10) !important;
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
    const effectiveId =
      salonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
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
    const effectiveId =
      salonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    if (effectiveId) {
      localStorage.setItem(`salon_theme_${effectiveId}`, JSON.stringify(palette));
    }
    localStorage.setItem('activeSalonTheme', JSON.stringify(palette));
    applyDynamicTheme(palette);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(THEME_CHANGE_EVENT, { detail: { salonId: effectiveId, palette } })
      );
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
