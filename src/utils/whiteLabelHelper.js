import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  applyDynamicTheme, 
  removeDynamicTheme, 
  extractBrandPaletteFromLogo, 
  getSalonTheme 
} from './themeGenerator';
export { default as SalonLogoImage } from '../components/common/SalonLogoImage';

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
 * Injects dynamic CSS rules to customize website colors based on extracted salon logo palette.
 * Delegates to themeGenerator.js.
 */
export const applySalonTheme = (palette) => {
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
export const initSalonTheme = () => {
  try {
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
    document.addEventListener('DOMContentLoaded', initSalonTheme);
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
