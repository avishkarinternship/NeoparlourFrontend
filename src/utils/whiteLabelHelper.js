import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  applyDynamicTheme, 
  removeDynamicTheme, 
  extractBrandPaletteFromLogo, 
  getSalonTheme,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  THEME_CHANGE_EVENT
} from './themeGenerator';
export { default as SalonLogoImage } from '../components/common/SalonLogoImage';
export { getSalonTheme } from './themeGenerator';

export const WHITE_LABEL_EVENT = 'np_active_salon_changed';

/**
 * Resolves full URL for salon logos and images.
 */
export const getSalonImageSrc = (imageUrl, fallbackImg = '') => {
  if (!imageUrl) return fallbackImg;
  const str = String(imageUrl).trim();
  if (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('blob:') ||
    str.startsWith('data:')
  ) {
    return str;
  }
  const base = axiosInstance?.defaults?.baseURL || 'https://sb.neoparlour.com/api';
  let cleanedUrl = str;
  if (cleanedUrl.startsWith('/api/')) {
    const domain = base.replace(/\/api$/, '');
    return `${domain}${cleanedUrl}`;
  }
  if (cleanedUrl.startsWith('api/')) {
    const domain = base.replace(/\/api$/, '');
    return `${domain}/${cleanedUrl}`;
  }
  if (cleanedUrl.startsWith('/images/')) {
    return `${base}${cleanedUrl}`;
  }
  if (cleanedUrl.startsWith('images/')) {
    return `${base}/${cleanedUrl}`;
  }
  // Bare filename: prepend /images/
  return `${base}/images/${cleanedUrl.startsWith('/') ? cleanedUrl.slice(1) : cleanedUrl}`;
};

/**
 * Normalizes and returns the currently active salon from localStorage.
 */
export const getActiveSalon = () => {
  try {
    const id = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '';
    const name = localStorage.getItem('activeSalonName') || localStorage.getItem('salon_name') || '';
    const logo = localStorage.getItem('activeSalonLogo') || localStorage.getItem('salon_logo') || '';
    const address = localStorage.getItem('activeSalonAddress') || localStorage.getItem('salon_address') || '';
    const phone = localStorage.getItem('activeSalonPhone') || localStorage.getItem('salon_phone') || '';
    const rating = localStorage.getItem('activeSalonRating') || '';

    // If activeSalonInfo JSON is present, merge it safely
    const infoRaw = localStorage.getItem('activeSalonInfo');
    let info = {};
    if (infoRaw && infoRaw !== 'undefined' && infoRaw !== 'null') {
      try {
        info = JSON.parse(infoRaw) || {};
      } catch (e) {
        console.warn('Failed to parse activeSalonInfo:', e);
      }
    }

    const effectiveId = id || info.id || info.salonId || '';
    const effectiveName = name || info.name || info.salonName || '';
    const effectiveLogo = logo || info.logo || info.imageUrl || info.logoUrl || '';
    const effectiveAddress = address || info.address || info.cityName || '';
    const effectivePhone = phone || info.phone || info.contactNumber || '';
    const effectiveRating = rating || info.rating || info.avgRating || '';

    const isWhiteLabeled = Boolean(
      effectiveId &&
      effectiveId !== 'SYSTEM' &&
      effectiveId !== 'null' &&
      effectiveId !== 'undefined' &&
      effectiveName &&
      effectiveName !== 'null' &&
      effectiveName !== 'undefined'
    );

    return {
      id: effectiveId,
      name: effectiveName,
      logo: effectiveLogo,
      address: effectiveAddress,
      phone: effectivePhone,
      rating: effectiveRating,
      isWhiteLabeled
    };
  } catch (err) {
    console.error('Error reading active salon from localStorage:', err);
    return {
      id: '',
      name: '',
      logo: '',
      address: '',
      phone: '',
      rating: '',
      isWhiteLabeled: false
    };
  }
};

/**
 * Determines whether the dynamic salon theme is allowed to run on the given path.
 * Disallowed on:
 * - Auth pages (login, register, signup, forgot password, delete-account)
 * - Public static pages (Home, About Us, Privacy Policy, Terms, Features, Support, etc.)
 * - Admin back-office pages (Superadmin, Support Engineer, Maintenance)
 * Allowed ONLY on:
 * - Authenticated Owner Portal (/owner/*, /subscription-plans)
 * - Authenticated Staff Portal (/staff/*)
 * - Customer salon-specific pages (/salon, /salon/*, /book-service)
 */
export const isThemeAllowedOnPath = (pathname = '') => {
  if (typeof window === 'undefined') return false;
  const currentPath = pathname || (window.location ? window.location.pathname : '') || '';
  const path = currentPath.toLowerCase().split('?')[0].split('#')[0];

  // 1. Explicitly disallow any auth route across all roles
  if (
    path.includes('/login') ||
    path.includes('/register') ||
    path.includes('/signup') ||
    path.includes('/forgot-password') ||
    path.includes('/delete-account')
  ) {
    return false;
  }

  // 2. Explicitly disallow legal, maintenance, sitemap, robots, subscription checkout
  if (
    path.includes('/terms-and-conditions') ||
    path.includes('/privacy-policy') ||
    path.includes('/maintenance') ||
    path.includes('/sitemap') ||
    path.includes('/robots') ||
    path.includes('/buy-subscription')
  ) {
    return false;
  }

  // 3. Static public & marketing pages
  const staticPublicExactOrPrefix = [
    '/',
    '/home',
    '/about',
    '/features',
    '/support',
    '/partner-with-us',
    '/salons',
    '/influencer-program',
    '/blogs',
    '/blog',
    '/testimonials',
    '/client-testimonials',
    '/leadership',
    '/videos',
    '/security',
    '/services',
    '/updates',
    '/case-studies',
    '/seo-salons'
  ];

  if (path === '' || path === '/') {
    return false;
  }

  for (const p of staticPublicExactOrPrefix) {
    if (p === '/') continue;
    if (
      path === p || 
      path.startsWith(`${p}/`) || 
      path === `/customer${p}` || 
      path.startsWith(`/customer${p}/`)
    ) {
      return false;
    }
  }

  // 4. Admin back-office pages
  if (path.startsWith('/admin')) {
    return false;
  }

  // 5. Explicitly ALLOW salon white-label pages:
  if (path.startsWith('/owner')) {
    return true;
  }

  if (path.startsWith('/staff')) {
    return true;
  }

  if (path === '/subscription-plans' || path.startsWith('/subscription-plans/')) {
    return true;
  }

  if (path === '/salon' || path.startsWith('/salon/') || path === '/book-service' || path.startsWith('/book-service/')) {
    return true;
  }

  return false;
};

/**
 * Checks if the current path is a salon-scoped customer route (where the salon white-labeled navbar/footer should appear).
 */
export const isSalonCustomerRoute = (pathname = '') => {
  if (typeof window === 'undefined') return false;
  const currentPath = pathname || (window.location ? window.location.pathname : '') || '';
  const path = currentPath.toLowerCase().split('?')[0].split('#')[0];

  // Disallow home, marketing, public pages, admin, owner, staff
  const nonSalonCustomerPaths = [
    '',
    '/',
    '/customer/home',
    '/customer/dashboard',
    '/about',
    '/customer/about',
    '/features',
    '/customer/features',
    '/salons',
    '/customer/salons',
    '/partner-with-us',
    '/customer/partner-with-us',
    '/blogs',
    '/customer/blogs',
    '/blog',
    '/customer/blog',
    '/support',
    '/customer/support',
    '/influencer-program',
    '/customer/influencer-program',
    '/terms-and-conditions',
    '/customer/terms-and-conditions',
    '/privacy-policy',
    '/customer/privacy-policy'
  ];

  if (nonSalonCustomerPaths.includes(path) || path.startsWith('/salons/')) {
    return false;
  }

  const salonPrefixes = [
    '/salon',
    '/customer/salon',
    '/book-service',
    '/customer/book-service'
  ];

  return salonPrefixes.some(p => path === p || path.startsWith(`${p}/`));
};

/**
 * Injects dynamic CSS rules to customize website colors based on extracted salon logo palette.
 * Delegates to themeGenerator.js.
 */
export const applySalonTheme = (palette) => {
  if (typeof window !== 'undefined' && !isThemeAllowedOnPath(window.location.pathname)) {
    removeSalonTheme();
    return null;
  }
  return applyDynamicTheme(palette);
};

/**
 * Removes the dynamic theme style element, returning to default colors.
 */
export const removeSalonTheme = () => {
  return removeDynamicTheme();
};

/**
 * Client-side color extractor: extracts dominant brand color from a salon logo image.
 */
export const extractPaletteFromImage = async (imageUrl) => {
  return extractBrandPaletteFromLogo(imageUrl);
};

/**
 * Initializes the salon theme from localStorage on application startup.
 */
export const initSalonTheme = (pathname) => {
  try {
    const targetPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (!isThemeAllowedOnPath(targetPath)) {
      removeSalonTheme();
      return;
    }
    const cached = localStorage.getItem('activeSalonTheme');
    if (cached && cached !== 'undefined' && cached !== 'null') {
      const palette = JSON.parse(cached);
      applySalonTheme(palette);
    }
  } catch (e) {
    console.error('Error initializing salon theme:', e);
  }
};

// Initialize theme safely after DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSalonTheme());
  } else {
    initSalonTheme();
  }
}

/**
 * Updates localStorage and dispatches event so all components react immediately.
 */
export const setActiveSalon = (salonData) => {
  if (!salonData) return;
  try {
    const id = salonData.salonId || salonData.id || '';
    const name = salonData.salonName || salonData.name || '';
    const logo = salonData.logo || salonData.logoUrl || salonData.imageUrl || (salonData.images && salonData.images[0]) || '';
    const address = salonData.address 
      ? `${salonData.address}${salonData.cityName ? ', ' + salonData.cityName : ''}` 
      : (salonData.cityName || salonData.areaName || '');
    const phone = salonData.contactNumber || salonData.phone || '';
    const rating = salonData.rating || salonData.avgRating || '';

    if (id) {
      localStorage.setItem('activeSalonId', String(id));
      localStorage.setItem('salon_id', String(id));
    }
    if (name) {
      localStorage.setItem('activeSalonName', String(name));
      localStorage.setItem('salon_name', String(name));
    }
    if (logo) {
      localStorage.setItem('activeSalonLogo', String(logo));
      localStorage.setItem('salon_logo', String(logo));
    }
    if (address) {
      localStorage.setItem('activeSalonAddress', String(address));
      localStorage.setItem('salon_address', String(address));
    }
    if (phone) {
      localStorage.setItem('activeSalonPhone', String(phone));
      localStorage.setItem('salon_phone', String(phone));
    }
    if (rating) {
      localStorage.setItem('activeSalonRating', String(rating));
    }

    const info = { id, name, logo, address, phone, rating };
    localStorage.setItem('activeSalonInfo', JSON.stringify(info));

    // Automatically extract palette and apply dynamic theme
    if (logo) {
      extractPaletteFromImage(logo).then(palette => {
        if (palette) {
          localStorage.setItem('activeSalonTheme', JSON.stringify(palette));
          applySalonTheme(palette);
        }
      });
    }

    window.dispatchEvent(new CustomEvent(WHITE_LABEL_EVENT, { detail: info }));
    window.dispatchEvent(new Event('activeSalonChanged'));
  } catch (err) {
    console.error('Error setting active salon in localStorage:', err);
  }
};

/**
 * Clears active salon and resets to marketplace/directory view.
 */
export const clearActiveSalon = () => {
  try {
    localStorage.removeItem('activeSalonId');
    localStorage.removeItem('activeSalonName');
    localStorage.removeItem('activeSalonLogo');
    localStorage.removeItem('activeSalonAddress');
    localStorage.removeItem('activeSalonPhone');
    localStorage.removeItem('activeSalonRating');
    localStorage.removeItem('activeSalonInfo');
    localStorage.removeItem('activeSalonTheme');
    removeSalonTheme();

    window.dispatchEvent(new CustomEvent(WHITE_LABEL_EVENT, { detail: null }));
    window.dispatchEvent(new Event('activeSalonChanged'));
  } catch (err) {
    console.error('Error clearing active salon:', err);
  }
};

/**
 * React hook to subscribe to white-labeled active salon updates.
 */
export const useActiveSalon = () => {
  const [activeSalon, setActiveSalonState] = useState(getActiveSalon);

  useEffect(() => {
    const handleUpdate = () => {
      setActiveSalonState(getActiveSalon());
    };

    window.addEventListener(WHITE_LABEL_EVENT, handleUpdate);
    window.addEventListener('activeSalonChanged', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    handleUpdate();

    return () => {
      window.removeEventListener(WHITE_LABEL_EVENT, handleUpdate);
      window.removeEventListener('activeSalonChanged', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    salon: activeSalon,
    isWhiteLabeled: activeSalon.isWhiteLabeled,
    setActiveSalon,
    clearActiveSalon
  };
};

/**
 * Calculates graph and chart colors dynamically based on the white-labeled salon branding.
 * - Dark mode: Uses the LIGHT version of the brand color for high visibility against dark backgrounds.
 * - Light mode: Uses the DARK version of the brand color for high contrast against light backgrounds.
 */
export const getWhitelabelGraphColors = (isDarkMode = false, salonId = null) => {
  let primaryHex = '#FF0B01';
  try {
    const saved = getSalonTheme(salonId);
    if (saved && saved.primary) {
      primaryHex = saved.primary;
    } else if (typeof document !== 'undefined') {
      const cssBrand = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
      if (cssBrand && cssBrand.startsWith('#')) {
        primaryHex = cssBrand;
      }
    }
  } catch (err) {
    // fallback
  }

  const rgb = hexToRgb(primaryHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (isDarkMode) {
    // Dark mode: Use LIGHT colour to show the graph
    const targetL = Math.max(0.68, Math.min(0.78, hsl.l > 0.65 ? hsl.l : hsl.l + 0.28));
    const targetS = Math.min(0.90, Math.max(0.60, hsl.s));
    const lightRgb = hslToRgb(hsl.h, targetS, targetL);
    const stroke = rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b);

    const piePalette = [
      stroke,
      rgbToHex(...Object.values(hslToRgb((hsl.h + 35) % 360, 0.75, 0.72))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 70) % 360, 0.75, 0.70))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, 0.70, 0.72))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, 0.70, 0.74))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, 0.75, 0.74))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 300) % 360, 0.75, 0.72))),
    ];

    return {
      stroke,
      fill: stroke,
      gradientStart: stroke,
      gradientEnd: stroke,
      startOpacity: 0.35,
      endOpacity: 0.0,
      dotFill: stroke,
      dotStroke: '#09090b',
      gridStroke: '#27272a',
      axisText: '#94a3b8',
      piePalette,
      isDarkMode: true,
      brandPrimary: primaryHex
    };
  } else {
    // Light mode: Use DARK colour to show the graph
    const targetL = Math.max(0.28, Math.min(0.40, hsl.l < 0.38 ? hsl.l : hsl.l - 0.20));
    const targetS = Math.min(0.95, Math.max(0.65, hsl.s));
    const darkRgb = hslToRgb(hsl.h, targetS, targetL);
    const stroke = rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b);

    const piePalette = [
      stroke,
      rgbToHex(...Object.values(hslToRgb((hsl.h + 35) % 360, 0.80, 0.36))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 70) % 360, 0.80, 0.35))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, 0.75, 0.34))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, 0.75, 0.35))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, 0.80, 0.36))),
      rgbToHex(...Object.values(hslToRgb((hsl.h + 300) % 360, 0.80, 0.36))),
    ];

    return {
      stroke,
      fill: stroke,
      gradientStart: stroke,
      gradientEnd: stroke,
      startOpacity: 0.22,
      endOpacity: 0.0,
      dotFill: stroke,
      dotStroke: '#ffffff',
      gridStroke: '#e2e8f0',
      axisText: '#64748b',
      piePalette,
      isDarkMode: false,
      brandPrimary: primaryHex
    };
  }
};

/**
 * Hook to reactively track white-label graph colors across theme and dark mode updates.
 */
export const useWhitelabelGraphColors = (isDarkMode = false, salonId = null) => {
  const [colors, setColors] = useState(() => getWhitelabelGraphColors(isDarkMode, salonId));

  useEffect(() => {
    const update = () => {
      setColors(getWhitelabelGraphColors(isDarkMode, salonId));
    };

    update();
    window.addEventListener(WHITE_LABEL_EVENT, update);
    window.addEventListener('activeSalonChanged', update);
    window.addEventListener(THEME_CHANGE_EVENT, update);
    window.addEventListener('np_dark_mode_changed', update);
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener(WHITE_LABEL_EVENT, update);
      window.removeEventListener('activeSalonChanged', update);
      window.removeEventListener(THEME_CHANGE_EVENT, update);
      window.removeEventListener('np_dark_mode_changed', update);
      window.removeEventListener('storage', update);
    };
  }, [isDarkMode, salonId]);

  return colors;
};
