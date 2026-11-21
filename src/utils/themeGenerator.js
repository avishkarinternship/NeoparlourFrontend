/**
 * Dynamic Logo-Based Theme Generation & Brand-Driven Background Theming System
 *
 * Implements WCAG 2.1 contrast standards, perimeter-aware logo extraction,
 * brand-tinted adaptive light and dark modes with complete visual hierarchy,
 * and dual-mode stylesheet injection.
 */

import axiosInstance from '../api/axiosInstance';
import { getSalonImageSrc } from './whiteLabelHelper';

export const THEME_CHANGE_EVENT = 'np_salon_theme_changed';

// ==========================================
// 1. COLOR MATHEMATICS & CONVERSIONS
// ==========================================

export const hexToRgb = (hex) => {
  if (!hex) return { r: 124, g: 58, b: 237 };
  let clean = String(hex).replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 124, g: 58, b: 237 };
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
 * Calibrates the brand color into a refined, comfortable, non-fluorescent tone.
 * Keeps lightness in the balanced range (0.44 - 0.49) and moderates saturation (0.55 - 0.72)
 * so interactive elements look premium and sophisticated without bright neon/glow glare.
 */
export const adaptBrandForDarkMode = (primaryHex) => {
  if (!primaryHex) return '#6D28D9';
  const { r, g, b } = hexToRgb(primaryHex);
  const hsl = rgbToHsl(r, g, b);

  // If achromatic / grayscale (pure grey, black, silver, white)
  if (hsl.s < 0.12) {
    const adapted = hslToRgb(0, 0, 0.78);
    return rgbToHex(adapted.r, adapted.g, adapted.b);
  }

  // Refined Dark Mode Accent Calibration:
  // Avoid neon glowing/blinding highlights. Keep lightness in the comfortable,
  // premium range (0.44 - 0.49) with controlled saturation (0.55 - 0.72)
  // so elements look sophisticated, rich, and readable with crisp white text.
  let targetL;
  if (hsl.l < 0.38) {
    // Dark original color (e.g. deep forest green, navy, wine):
    // Lift gently to 0.45 so it stands out comfortably from dark surfaces without glowing
    targetL = 0.45;
  } else if (hsl.l > 0.52) {
    // Very bright, pastel, or fluorescent original color:
    // Settle down to 0.47 so it is not a glowing highlighter
    targetL = 0.47;
  } else {
    // Already in a comfortable range (0.38 - 0.52): preserve close to original
    targetL = Math.max(0.44, Math.min(0.49, hsl.l));
  }

  // Controlled saturation: preserve brand hue identity without fluorescent neon glare
  let targetS;
  if (hsl.h >= 15 && hsl.h <= 65) {
    // Warm hues (orange, amber, gold): rich caramel/honey gold, not neon yellow
    targetL = Math.max(0.45, Math.min(0.50, targetL));
    targetS = Math.min(0.75, Math.max(0.55, hsl.s * 0.90));
  } else if (hsl.h > 65 && hsl.h <= 100) {
    // Yellow/lime: tone down to warm olive/moss to avoid electric green
    targetL = 0.45;
    targetS = Math.min(0.65, Math.max(0.48, hsl.s * 0.75));
  } else if (hsl.h > 100 && hsl.h <= 170) {
    // Emerald / Green / Mint: rich, deep jade/emerald, NOT neon mint highlighter
    targetL = 0.45;
    targetS = Math.min(0.68, Math.max(0.50, hsl.s * 0.82));
  } else if (hsl.h > 170 && hsl.h <= 250) {
    // Cyan / Ocean / Blue: sophisticated sapphire/teal, NOT neon cyan
    targetL = 0.47;
    targetS = Math.min(0.70, Math.max(0.52, hsl.s * 0.85));
  } else {
    // Purple / Violet / Crimson: elegant royal amethyst / ruby
    targetL = Math.max(0.45, Math.min(0.50, targetL));
    targetS = Math.min(0.75, Math.max(0.55, hsl.s * 0.90));
  }

  const adapted = hslToRgb(hsl.h, targetS, targetL);
  return rgbToHex(adapted.r, adapted.g, adapted.b);
};

// ==========================================
// 2. INTELLIGENT LOGO IMAGE ANALYZER
// ==========================================

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

          const size = 64;
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
            if (a < 120) return;
            const r = Math.round(imgData[idx] / 16) * 16;
            const g = Math.round(imgData[idx + 1] / 16) * 16;
            const b = Math.round(imgData[idx + 2] / 16) * 16;
            const key = `${r},${g},${b}`;
            perimeterCounts[key] = (perimeterCounts[key] || 0) + 1;
            totalPerimeter++;
          };

          for (let x = 0; x < size; x++) {
            samplePerimeterPixel(x, 0);
            samplePerimeterPixel(x, size - 1);
          }
          for (let y = 1; y < size - 1; y++) {
            samplePerimeterPixel(0, y);
            samplePerimeterPixel(size - 1, y);
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

            if (a < 120) continue;

            if (canvasBgRgb) {
              const dist = Math.sqrt(
                Math.pow(r - canvasBgRgb.r, 2) +
                Math.pow(g - canvasBgRgb.g, 2) +
                Math.pow(b - canvasBgRgb.b, 2)
              );
              if (dist < 32) continue;
            }

            const hsl = rgbToHsl(r, g, b);

            if (hsl.l > 0.94) continue;
            if (hsl.l < 0.08) continue;

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
            return finish(generateBalancedPalette('#7C3AED', '#A78BFA', 'brand-tint'));
          }

          const chromatic = items.filter((item) => item.s >= 0.14 && item.l >= 0.10 && item.l <= 0.90);

          let primaryCluster = null;
          let secondaryCluster = null;

          if (chromatic.length > 0) {
            chromatic.forEach((item) => {
              const lightnessScore = 1 - Math.abs(item.l - 0.48);
              item.score = item.count * (1 + item.s * 3.2) * (0.8 + lightnessScore);
            });
            chromatic.sort((a, b) => b.score - a.score);

            primaryCluster = chromatic[0];

            secondaryCluster = chromatic.find((item) => {
              const hueDiff = Math.abs(item.h - primaryCluster.h);
              const lightDiff = Math.abs(item.l - primaryCluster.l);
              return (hueDiff >= 26 && hueDiff <= 334) || lightDiff >= 0.24;
            });
          }

          if (!primaryCluster) {
            items.sort((a, b) => b.count - a.count);
            primaryCluster = items[0] || { r: 124, g: 58, b: 237, h: 270, s: 0.8, l: 0.58 };
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
 * Generates an exhaustive 16-token design system where the salon's primary brand colour
 * determines the ENTIRE website background in both Light Mode (soft luminous pastel)
 * and Dark Mode (deep royal midnight shade), establishing visual hierarchy across cards,
 * sidebars, navigation, inputs, and buttons.
 */
export const generateBalancedPalette = (primaryHex, secondaryHex = null, bgStyle = 'brand-tint') => {
  const pRgb = hexToRgb(primaryHex);
  const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);

  let secHex = secondaryHex;
  if (!secHex) {
    secHex = lighten(primaryHex, 20);
  }
  const sRgb = hexToRgb(secHex);

  const darkPrimaryHex = adaptBrandForDarkMode(primaryHex);
  const darkPRgb = hexToRgb(darkPrimaryHex);

  const isChromatic = pHsl.s >= 0.10;
  const h = pHsl.h;
  const s = pHsl.s;

  // ----------------------------------------------------
  // LIGHT MODE TOKENS (Brand-Driven Atmosphere)
  // ----------------------------------------------------
  let lightBgHex = '#EBE0F5';
  let lightSecBgHex = '#F0EAF6';
  let lightSurfaceHex = '#FCFCFD';
  let lightSurfaceElevated = '#FFFFFF';
  let lightSidebarBg = '#F2EDF8';
  let lightNavBg = '#F2EDF8';
  let lightBorderHex = '#DBCBEB';
  let lightInputBg = '#F5F1F8';
  let lightInputBorder = '#DFD2ED';
  let lightInputText = '#191122';
  let lightTextPrimary = '#191122';
  let lightTextSecondary = '#614979';
  let lightTextParagraph = '#423253';

  if (bgStyle === 'pure-white') {
    lightBgHex = '#FFFFFF';
    lightSecBgHex = '#F9FAFB';
    lightSurfaceHex = '#FFFFFF';
    lightSurfaceElevated = '#FFFFFF';
    lightSidebarBg = '#FFFFFF';
    lightNavBg = '#FFFFFF';
    lightBorderHex = '#E5E7EB';
    lightInputBg = '#FFFFFF';
    lightInputBorder = '#D1D5DB';
    lightInputText = '#111827';
    lightTextPrimary = '#111827';
    lightTextSecondary = '#6B7280';
    lightTextParagraph = '#4B5563';
  } else if (bgStyle === 'warm-ivory') {
    lightBgHex = '#FAF7EE';
    lightSecBgHex = '#F4EFE2';
    lightSurfaceHex = '#FCFBF8';
    lightSurfaceElevated = '#FFFFFF';
    lightSidebarBg = '#F7F2E7';
    lightNavBg = '#F7F2E7';
    lightBorderHex = '#E4DBC8';
    lightInputBg = '#F9F6ED';
    lightInputBorder = '#E2D8C3';
    lightInputText = '#241E15';
    lightTextPrimary = '#241E15';
    lightTextSecondary = '#6A5E4F';
    lightTextParagraph = '#4A4033';
  } else if (isChromatic) {
    // Dynamic brand tint
    const toHexStr = (rgbObj) => rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);
    lightBgHex = toHexStr(hslToRgb(h, Math.min(s * 0.65, 0.50), 0.92));
    lightSecBgHex = toHexStr(hslToRgb(h, Math.min(s * 0.55, 0.42), 0.94));
    lightSurfaceHex = toHexStr(hslToRgb(h, Math.min(s * 0.35, 0.22), 0.985));
    lightSurfaceElevated = '#FFFFFF';
    lightSidebarBg = toHexStr(hslToRgb(h, Math.min(s * 0.50, 0.38), 0.95));
    lightNavBg = toHexStr(hslToRgb(h, Math.min(s * 0.50, 0.38), 0.95));
    lightBorderHex = toHexStr(hslToRgb(h, Math.min(s * 0.50, 0.42), 0.86));
    lightInputBg = toHexStr(hslToRgb(h, Math.min(s * 0.45, 0.35), 0.96));
    lightInputBorder = toHexStr(hslToRgb(h, Math.min(s * 0.45, 0.38), 0.88));
    lightInputText = toHexStr(hslToRgb(h, 0.35, 0.10));
    lightTextPrimary = toHexStr(hslToRgb(h, 0.35, 0.10));
    lightTextSecondary = toHexStr(hslToRgb(h, 0.25, 0.38));
    lightTextParagraph = toHexStr(hslToRgb(h, 0.28, 0.25));
  } else {
    // Neutral monochrome
    lightBgHex = '#F1F3F6';
    lightSecBgHex = '#E9ECEF';
    lightSurfaceHex = '#FFFFFF';
    lightSurfaceElevated = '#FFFFFF';
    lightSidebarBg = '#F5F6F8';
    lightNavBg = '#F5F6F8';
    lightBorderHex = '#DDE0E5';
    lightInputBg = '#FFFFFF';
    lightInputBorder = '#D1D5DB';
    lightInputText = '#111827';
    lightTextPrimary = '#111827';
    lightTextSecondary = '#5A626A';
    lightTextParagraph = '#3D4248';
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
    surface: lightSurfaceHex,
    surfaceElevated: lightSurfaceElevated,
    sidebarBg: lightSidebarBg,
    navBg: lightNavBg,
    textPrimary: lightTextPrimary,
    textSecondary: lightTextSecondary,
    textParagraph: lightTextParagraph,
    border: lightBorderHex,
    inputBg: lightInputBg,
    inputBorder: lightInputBorder,
    inputText: lightInputText,
    iconColor: primaryHex,

    primaryRgb: `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`,
    secondaryRgb: `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`
  };

  // ----------------------------------------------------
  // DARK MODE TOKENS (Deep Royal Midnight Atmosphere)
  // ----------------------------------------------------
  let darkBgHex = '#170925';
  let darkSecBgHex = '#210F33';
  let darkSurfaceHex = '#29123F';
  let darkSurfaceElevated = '#33174F';
  let darkSidebarBg = '#12061D';
  let darkNavBg = '#150822';
  let darkBorderHex = '#40235C';
  let darkInputBg = '#241236';
  let darkInputBorder = '#432560';
  let darkInputText = '#FAF9FB';
  let darkTextPrimary = '#FAF9FB';
  let darkTextSecondary = '#CCBFD9';
  let darkTextParagraph = '#DED6E7';

  if (bgStyle === 'pure-white') {
    darkBgHex = '#0C0D12';
    darkSecBgHex = '#14161E';
    darkSurfaceHex = '#1B1E28';
    darkSurfaceElevated = '#242836';
    darkSidebarBg = '#101117';
    darkNavBg = '#12141A';
    darkBorderHex = '#2E3344';
    darkInputBg = '#181A24';
    darkInputBorder = '#3D4358';
    darkInputText = '#FFFFFF';
    darkTextPrimary = '#FFFFFF';
    darkTextSecondary = '#9DA4B4';
    darkTextParagraph = '#D1D5DB';
  } else if (bgStyle === 'warm-ivory') {
    darkBgHex = '#181613';
    darkSecBgHex = '#221F1B';
    darkSurfaceHex = '#2C2822';
    darkSurfaceElevated = '#38332C';
    darkSidebarBg = '#14120F';
    darkNavBg = '#161411';
    darkBorderHex = '#4A4339';
    darkInputBg = '#24201A';
    darkInputBorder = '#4E463A';
    darkInputText = '#FAF7EE';
    darkTextPrimary = '#FAF7EE';
    darkTextSecondary = '#C9BEA8';
    darkTextParagraph = '#DDD4C3';
  } else if (isChromatic) {
    const toHexStr = (rgbObj) => rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b);

    // Perceptually balanced dark surfaces:
    // Warm hues (orange, gold, amber, brown, olive 15-75 deg) need gentle saturation (10-14%)
    // to prevent murky brown/sludge, while cool hues (purple, blue, emerald) can sustain deeper tone (20-26%).
    const isWarmHue = (h >= 15 && h <= 75);
    const maxBgS = isWarmHue ? 0.12 : 0.24;
    const maxCardS = isWarmHue ? 0.14 : 0.26;
    const maxElevatedS = isWarmHue ? 0.14 : 0.24;
    const maxBorderS = isWarmHue ? 0.18 : 0.28;

    const bgS = Math.min(s * 0.35, maxBgS);
    const cardS = Math.min(s * 0.40, maxCardS);
    const elevatedS = Math.min(s * 0.38, maxElevatedS);
    const borderS = Math.min(s * 0.45, maxBorderS);

    // Lightness hierarchy: background (0.105), sidebar (0.095), cards (0.175), elevated (0.23), borders (0.29)
    darkBgHex = toHexStr(hslToRgb(h, bgS, 0.105));
    darkSecBgHex = toHexStr(hslToRgb(h, cardS, 0.145));
    darkSurfaceHex = toHexStr(hslToRgb(h, cardS, 0.175));
    darkSurfaceElevated = toHexStr(hslToRgb(h, elevatedS, 0.23));
    darkSidebarBg = toHexStr(hslToRgb(h, Math.min(s * 0.30, isWarmHue ? 0.10 : 0.20), 0.095));
    darkNavBg = toHexStr(hslToRgb(h, bgS, 0.105));
    darkBorderHex = toHexStr(hslToRgb(h, borderS, 0.29));
    darkInputBg = toHexStr(hslToRgb(h, cardS, 0.14));
    darkInputBorder = toHexStr(hslToRgb(h, borderS, 0.28));
    darkInputText = '#FAF9FB';
    darkTextPrimary = '#FAF9FB';
    darkTextSecondary = toHexStr(hslToRgb(h, isWarmHue ? 0.15 : 0.20, 0.78));
    darkTextParagraph = toHexStr(hslToRgb(h, isWarmHue ? 0.12 : 0.18, 0.85));
  } else {
    // Neutral monochrome dark
    darkBgHex = '#0F1015';
    darkSecBgHex = '#171821';
    darkSurfaceHex = '#1E202B';
    darkSurfaceElevated = '#262937';
    darkSidebarBg = '#121319';
    darkNavBg = '#121319';
    darkBorderHex = '#2F3343';
    darkInputBg = '#1A1C25';
    darkInputBorder = '#3D4155';
    darkInputText = '#FFFFFF';
    darkTextPrimary = '#FFFFFF';
    darkTextSecondary = '#A6ABB5';
    darkTextParagraph = '#D1D5DB';
  }

  const darkButtonText = '#FFFFFF';
  const darkPrimaryHover = lighten(darkPrimaryHex, 6);
  const darkPrimaryActive = darken(darkPrimaryHex, 6);

  const darkTokens = {
    primary: darkPrimaryHex,
    primaryHover: darkPrimaryHover,
    primaryActive: darkPrimaryActive,
    secondary: lighten(darkPrimaryHex, 8),
    accent: lighten(darkPrimaryHex, 12),
    buttonText: darkButtonText,

    background: darkBgHex,
    secondaryBackground: darkSecBgHex,
    surface: darkSurfaceHex,
    surfaceElevated: darkSurfaceElevated,
    sidebarBg: darkSidebarBg,
    navBg: darkNavBg,
    textPrimary: darkTextPrimary,
    textSecondary: darkTextSecondary,
    textParagraph: darkTextParagraph,
    border: darkBorderHex,
    inputBg: darkInputBg,
    inputBorder: darkInputBorder,
    inputText: darkInputText,
    iconColor: darkPrimaryHex,

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
    surface: lightSurfaceHex,
    surfaceElevated: lightSurfaceElevated,
    sidebarBg: lightSidebarBg,
    navBg: lightNavBg,
    textPrimary: lightTextPrimary,
    textSecondary: lightTextSecondary,
    textParagraph: lightTextParagraph,
    border: lightBorderHex,
    inputBg: lightInputBg,
    inputBorder: lightInputBorder,
    inputText: lightInputText,

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

    const balanced = generateBalancedPalette(
      palette.primary,
      palette.secondary || palette.themeLight,
      palette.bgStyle || 'brand-tint'
    );
    const light = palette.light && palette.light.background ? palette.light : balanced.light;
    const dark = balanced.dark;

    const lightPr = light.primaryRgb || palette.primaryRgb || '124, 58, 237';
    const lightSec = light.secondaryRgb || palette.secondaryRgb || '167, 139, 250';
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
        --color-background: ${light.background || '#EBE0F5'};
        --color-secondary-background: ${light.secondaryBackground || '#F0EAF6'};
        --color-surface: ${light.surface || '#FCFCFD'};
        --color-surface-elevated: ${light.surfaceElevated || '#FFFFFF'};
        --color-sidebar-bg: ${light.sidebarBg || '#F2EDF8'};
        --color-nav-bg: ${light.navBg || '#F2EDF8'};
        --color-text-primary: ${light.textPrimary || '#191122'};
        --color-text-secondary: ${light.textSecondary || '#614979'};
        --color-text-paragraph: ${light.textParagraph || '#423253'};
        --color-border: ${light.border || '#DBCBEB'};
        --color-input-bg: ${light.inputBg || '#F5F1F8'};
        --color-input-border: ${light.inputBorder || '#DFD2ED'};
        --color-input-text: ${light.inputText || '#191122'};
        --color-icon: ${light.iconColor || light.primary};
        --color-primary-rgb: ${lightPr};
        --color-secondary-rgb: ${lightSec};

        /* Legacy variables */
        --salon-primary: var(--color-primary);
        --salon-secondary: var(--color-secondary);
        --salon-primary-rgb: ${lightPr};
        --salon-secondary-rgb: ${lightSec};
        --salon-theme-light-bg: rgba(${lightPr}, 0.12);
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
        --color-background: ${dark.background || '#170925'};
        --color-secondary-background: ${dark.secondaryBackground || '#210F33'};
        --color-surface: ${dark.surface || '#29123F'};
        --color-surface-elevated: ${dark.surfaceElevated || '#33174F'};
        --color-sidebar-bg: ${dark.sidebarBg || '#12061D'};
        --color-nav-bg: ${dark.navBg || '#150822'};
        --color-text-primary: ${dark.textPrimary || '#FAF9FB'};
        --color-text-secondary: ${dark.textSecondary || '#CCBFD9'};
        --color-text-paragraph: ${dark.textParagraph || '#DED6E7'};
        --color-border: ${dark.border || '#40235C'};
        --color-input-bg: ${dark.inputBg || '#241236'};
        --color-input-border: ${dark.inputBorder || '#432560'};
        --color-input-text: ${dark.inputText || '#FAF9FB'};
        --color-icon: ${dark.iconColor || dark.primary};
        --color-primary-rgb: ${darkPr};
        --color-secondary-rgb: ${darkSec};

        /* Legacy variables */
        --salon-primary: var(--color-primary);
        --salon-secondary: var(--color-secondary);
        --salon-primary-rgb: ${darkPr};
        --salon-secondary-rgb: ${darkSec};
        --salon-theme-light-bg: rgba(${darkPr}, 0.22);
      }

      /* ============================================================
         3. LIGHT MODE GLOBAL THEME APPLICATION (Atmospheric Tint)
         ============================================================ */
      html:not(.dark) body {
        background-color: var(--color-background);
        background-image: 
          radial-gradient(ellipse 80% 50% at 75% -10%, rgba(${lightPr}, 0.12), transparent),
          radial-gradient(ellipse 60% 40% at 15% 15%, rgba(${lightPr}, 0.07), transparent);
        background-attachment: fixed;
        color: var(--color-text-primary);
      }

      /* Page & layout backgrounds */
      html:not(.dark) .bg-\\[\\#FAFAFA\\],
      html:not(.dark) .bg-gray-50,
      html:not(.dark) .bg-slate-50,
      html:not(.dark) .bg-zinc-50,
      html:not(.dark) main {
        background-color: var(--color-background) !important;
        color: var(--color-text-primary) !important;
      }

      /* Navigation Header */
      html:not(.dark) header,
      html:not(.dark) nav {
        background-color: var(--color-nav-bg) !important;
        border-color: var(--color-border) !important;
        color: var(--color-text-primary) !important;
      }

      /* Sidebars */
      html:not(.dark) aside,
      html:not(.dark) .sidebar-container {
        background-color: var(--color-sidebar-bg) !important;
        border-color: var(--color-border) !important;
      }

      /* Cards & Surfaces */
      html:not(.dark) .bg-white,
      html:not(.dark) .rounded-xl.bg-white,
      html:not(.dark) .rounded-2xl.bg-white,
      html:not(.dark) .rounded-3xl.bg-white {
        background-color: var(--color-surface) !important;
        border-color: var(--color-border) !important;
        color: var(--color-text-primary) !important;
      }

      /* Inputs, Search Bars & Selects */
      html:not(.dark) input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),
      html:not(.dark) select,
      html:not(.dark) textarea {
        background-color: var(--color-input-bg) !important;
        border-color: var(--color-input-border) !important;
        color: var(--color-input-text) !important;
      }

      /* Text Hierarchy in Light Mode */
      html:not(.dark) .text-gray-900,
      html:not(.dark) .text-gray-800,
      html:not(.dark) .text-slate-900,
      html:not(.dark) .text-slate-800,
      html:not(.dark) h1, 
      html:not(.dark) h2, 
      html:not(.dark) h3, 
      html:not(.dark) h4, 
      html:not(.dark) h5 {
        color: var(--color-text-primary) !important;
      }

      html:not(.dark) .text-gray-600,
      html:not(.dark) .text-gray-500,
      html:not(.dark) .text-slate-600,
      html:not(.dark) .text-slate-500,
      html:not(.dark) p {
        color: var(--color-text-secondary) !important;
      }

      html:not(.dark) .border-gray-200,
      html:not(.dark) .border-gray-100,
      html:not(.dark) .border-slate-200,
      html:not(.dark) .border-slate-100 {
        border-color: var(--color-border) !important;
      }

      /* ============================================================
         4. DARK MODE GLOBAL THEME APPLICATION (Royal Midnight Night)
         ============================================================ */
      html.dark body {
        background-color: var(--color-background) !important;
        background-image: 
          radial-gradient(ellipse 80% 50% at 75% -10%, rgba(${darkPr}, 0.07), transparent),
          radial-gradient(ellipse 60% 40% at 15% 15%, rgba(${darkPr}, 0.04), transparent) !important;
        background-attachment: fixed !important;
        color: var(--color-text-primary) !important;
      }

      /* Dark page backgrounds */
      html.dark .bg-zinc-950,
      html.dark.bg-zinc-950,
      html.dark .bg-black,
      html.dark main {
        background-color: var(--color-background) !important;
        color: var(--color-text-primary) !important;
      }

      /* Dark Navigation Header */
      html.dark header,
      html.dark nav {
        background-color: var(--color-nav-bg) !important;
        border-color: var(--color-border) !important;
        color: var(--color-text-primary) !important;
      }

      /* Dark Sidebars */
      html.dark aside,
      html.dark .sidebar-container {
        background-color: var(--color-sidebar-bg) !important;
        border-color: var(--color-border) !important;
      }

      /* Dark Cards & Surfaces */
      html.dark .bg-zinc-900,
      html.dark.bg-zinc-900,
      html.dark .bg-zinc-900\\/80,
      html.dark .bg-zinc-900\\/60,
      html.dark .bg-slate-900 {
        background-color: var(--color-surface) !important;
        border-color: var(--color-border) !important;
        color: var(--color-text-primary) !important;
      }

      /* Dark Secondary Elevated Cards & Tables */
      html.dark .bg-zinc-800,
      html.dark.bg-zinc-800,
      html.dark .bg-zinc-800\\/80,
      html.dark .bg-zinc-800\\/60 {
        background-color: var(--color-secondary-background) !important;
        border-color: var(--color-border) !important;
      }

      /* Dark Inputs, Search Bars & Selects */
      html.dark input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),
      html.dark select,
      html.dark textarea {
        background-color: var(--color-input-bg) !important;
        border-color: var(--color-input-border) !important;
        color: var(--color-input-text) !important;
      }

      /* Dark Text Hierarchy */
      html.dark .text-white,
      html.dark .text-zinc-100,
      html.dark .text-zinc-200,
      html.dark .text-slate-100,
      html.dark h1, 
      html.dark h2, 
      html.dark h3, 
      html.dark h4, 
      html.dark h5 {
        color: var(--color-text-primary) !important;
      }

      html.dark .text-zinc-400,
      html.dark .text-zinc-500,
      html.dark .text-slate-400,
      html.dark p {
        color: var(--color-text-secondary) !important;
      }

      html.dark .border-zinc-800,
      html.dark .border-zinc-700,
      html.dark .border-zinc-800\\/80 {
        border-color: var(--color-border) !important;
      }

      /* ============================================================
         5. ACTIVE SIDEBAR TAB (Matching Reference Mockup)
         ============================================================ */
      html:not(.dark) .sidebar-btn.bg-red-50,
      html:not(.dark) .sidebar-btn.bg-red-500\\/15,
      html:not(.dark) .sidebar-btn[data-active="true"] {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover)) !important;
        color: var(--color-button-text) !important;
        box-shadow: 0 4px 14px rgba(var(--color-primary-rgb), 0.25) !important;
      }

      html:not(.dark) .sidebar-btn.bg-red-50 span,
      html:not(.dark) .sidebar-btn.bg-red-500\\/15 span,
      html:not(.dark) .sidebar-btn.bg-red-50 svg,
      html:not(.dark) .sidebar-btn.bg-red-500\\/15 svg,
      html:not(.dark) .sidebar-btn.bg-red-50 div,
      html:not(.dark) .sidebar-btn.bg-red-500\\/15 div {
        color: var(--color-button-text) !important;
        stroke: var(--color-button-text) !important;
      }

      /* Dark Mode Active Sidebar Tab: Rich, Clean, Non-Glowy */
      .dark .sidebar-btn.bg-red-50,
      .dark .sidebar-btn.bg-red-500\\/15,
      .dark .sidebar-btn[data-active="true"] {
        background: var(--color-primary) !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
      }

      .dark .sidebar-btn.bg-red-50 span,
      .dark .sidebar-btn.bg-red-500\\/15 span,
      .dark .sidebar-btn.bg-red-50 svg,
      .dark .sidebar-btn.bg-red-500\\/15 svg,
      .dark .sidebar-btn.bg-red-50 div,
      .dark .sidebar-btn.bg-red-500\\/15 div {
        color: #FFFFFF !important;
        stroke: #FFFFFF !important;
      }

      .dark .sidebar-btn.bg-red-50 .active-icon-glow,
      .dark .sidebar-btn.bg-red-500\\/15 .active-icon-glow,
      .dark .sidebar-btn[data-active="true"] .active-icon-glow {
        filter: none !important;
        color: #FFFFFF !important;
      }

      /* ============================================================
         6. PRIMARY BRAND BUTTONS, BADGES, AND HIGHLIGHTS
         ============================================================ */
      .bg-\\[\\#FF0B01\\], 
      .bg-\\[\\#ff0b01\\], 
      .bg-\\[\\#EF3E23\\],
      .bg-red-600,
      .bg-red-500 {
        background-color: var(--color-primary) !important;
        color: var(--color-button-text) !important;
      }

      .hover\\:bg-red-700:hover, 
      .hover\\:bg-red-600:hover,
      .hover\\:bg-\\[\\#E02510\\]:hover {
        background-color: var(--color-primary-hover) !important;
        color: var(--color-button-text) !important;
      }

      /* Dark Mode Button Overrides: Crisp White Text, No Neon Glare */
      .dark .bg-\\[\\#FF0B01\\], 
      .dark .bg-\\[\\#ff0b01\\], 
      .dark .bg-\\[\\#EF3E23\\],
      .dark .bg-red-600,
      .dark .bg-red-500 {
        background-color: var(--color-primary) !important;
        color: #FFFFFF !important;
      }

      .dark .hover\\:bg-red-700:hover, 
      .dark .hover\\:bg-red-600:hover,
      .dark .hover\\:bg-\\[\\#E02510\\]:hover {
        background-color: var(--color-primary-hover) !important;
        color: #FFFFFF !important;
      }

      .active\\:scale-95:active,
      .active\\:scale-\\[0\\.98\\]:active {
        background-color: var(--color-primary-active);
      }

      .text-\\[\\#FF0B01\\], 
      .text-\\[\\#ff0b01\\], 
      .text-\\[\\#EF3E23\\],
      .text-\\[\\#FF2A14\\],
      .text-red-600,
      .text-red-500 {
        color: var(--color-primary) !important;
      }

      svg.text-\\[\\#FF0B01\\],
      svg.text-\\[\\#ff0b01\\],
      svg.text-red-600,
      svg.text-red-500 {
        color: var(--color-primary) !important;
      }

      .border-\\[\\#FF0B01\\], 
      .border-\\[\\#ff0b01\\], 
      .border-\\[\\#EF3E23\\],
      .border-red-600,
      .border-red-500 {
        border-color: var(--color-primary) !important;
      }

      .ring-\\[\\#FF0B01\\]\\/20,
      .ring-red-500\\/20,
      .focus-within\\:ring-red-500:focus-within,
      .focus\\:ring-red-500:focus {
        --tw-ring-color: rgba(var(--color-primary-rgb), 0.35) !important;
      }

      .bg-red-50, 
      .bg-\\[\\#ffebeb\\],
      .bg-red-500\\/10,
      .bg-red-500\\/15,
      .bg-red-500\\/20 {
        background-color: rgba(var(--color-primary-rgb), 0.12) !important;
        color: var(--color-primary) !important;
      }

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

      .dark .bg-red-950\\/40,
      .dark .bg-red-950\\/50,
      .dark .bg-red-900\\/20,
      .dark .bg-red-50, 
      .dark .bg-\\[\\#ffebeb\\],
      .dark .bg-red-500\\/10,
      .dark .bg-red-500\\/15,
      .dark .bg-red-500\\/20 {
        background-color: rgba(var(--color-primary-rgb), 0.16) !important;
        color: var(--color-primary) !important;
      }

      .dark .text-red-400 {
        color: var(--color-primary) !important;
      }
    `;
  } catch (e) {
    console.error('Failed to apply dynamic theme stylesheet:', e);
  }
};

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

export const getSalonTheme = (salonId = null) => {
  try {
    const effectiveId =
      salonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    let themeObj = null;
    if (effectiveId) {
      const specific = localStorage.getItem(`salon_theme_${effectiveId}`);
      if (specific && specific !== 'undefined' && specific !== 'null') {
        themeObj = JSON.parse(specific);
      }
    }
    if (!themeObj) {
      const globalCached = localStorage.getItem('activeSalonTheme');
      if (globalCached && globalCached !== 'undefined' && globalCached !== 'null') {
        themeObj = JSON.parse(globalCached);
      }
    }
    if (themeObj && themeObj.primary) {
      // Re-balance with updated non-sludgy dark tokens so previously saved themes upgrade automatically
      return generateBalancedPalette(
        themeObj.primary,
        themeObj.secondary || themeObj.themeLight,
        themeObj.bgStyle || 'brand-tint'
      );
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
