import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
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
 * - Primary: Darkest dominant brand color from logo
 * - Secondary / Light: Lighter accent / theme color from logo
 */
export const applySalonTheme = (palette) => {
  if (!palette || !palette.primaryDark || typeof document === 'undefined') return;
  try {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    let styleEl = document.getElementById('np-salon-dynamic-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'np-salon-dynamic-theme';
      head.appendChild(styleEl);
    }

    const darkRgb = palette.darkRgb || '255, 11, 1';
    const lightRgb = palette.lightRgb || '255, 235, 235';

    styleEl.innerHTML = `
      :root {
        --salon-primary: ${palette.primaryDark};
        --salon-secondary: ${palette.themeLight || palette.primaryDark};
        --salon-primary-rgb: ${darkRgb};
        --salon-secondary-rgb: ${lightRgb};
        --salon-theme-light-bg: rgba(${darkRgb}, 0.08);
      }

      /* Primary Brand Buttons & Badges */
      .bg-\\[\\#FF0B01\\], 
      .bg-\\[\\#ff0b01\\], 
      .bg-\\[\\#EF3E23\\],
      .bg-red-600 {
        background-color: var(--salon-primary) !important;
      }

      .hover\\:bg-red-700:hover, 
      .hover\\:bg-red-600:hover {
        filter: brightness(0.88) !important;
      }

      /* Primary Brand Text */
      .text-\\[\\#FF0B01\\], 
      .text-\\[\\#ff0b01\\], 
      .text-\\[\\#EF3E23\\],
      .text-red-600,
      .text-red-500 {
        color: var(--salon-primary) !important;
      }

      /* Primary Brand Borders */
      .border-\\[\\#FF0B01\\], 
      .border-\\[\\#ff0b01\\], 
      .border-\\[\\#EF3E23\\],
      .border-red-600,
      .border-red-500 {
        border-color: var(--salon-primary) !important;
      }

      /* Focus rings and active borders */
      .ring-\\[\\#FF0B01\\]\\/20,
      .focus-within\\:ring-red-500:focus-within {
        --tw-ring-color: rgba(var(--salon-primary-rgb), 0.28) !important;
      }

      /* Light Theme / Secondary Accent Tints */
      .bg-red-50, 
      .bg-\\[\\#ffebeb\\],
      .bg-red-500\\/10,
      .bg-red-500\\/15 {
        background-color: rgba(var(--salon-primary-rgb), 0.09) !important;
      }

      /* Dark mode subtle accents */
      .dark .bg-red-950\\/40,
      .dark .bg-red-950\\/50 {
        background-color: rgba(var(--salon-primary-rgb), 0.22) !important;
      }
    `;
  } catch (e) {
    console.error('Failed to apply salon dynamic theme:', e);
  }
};

/**
 * Removes the dynamic theme style element, returning to default colors.
 */
export const removeSalonTheme = () => {
  try {
    if (typeof document === 'undefined') return;
    const styleEl = document.getElementById('np-salon-dynamic-theme');
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  } catch (e) {
    console.error('Failed to remove salon dynamic theme:', e);
  }
};

/**
 * Client-side color extractor: extracts 2 colors from a salon logo image:
 * - primaryDark: Darkest dominant brand color
 * - themeLight: Lighter accent / theme color
 */
export const extractPaletteFromImage = async (imageUrl) => {
  if (!imageUrl) return null;

  return new Promise((resolve) => {
    const resolvedUrl = getSalonImageSrc(imageUrl);

    const processImageSource = (srcUrl, isBlob = false) => {
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

      const timer = setTimeout(() => finish(null), 5000);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return finish(null);

          const w = 48;
          const h = 48;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);

          const data = ctx.getImageData(0, 0, w, h).data;
          const clusters = {};

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Ignore transparent / translucent background
            if (a < 120) continue;

            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            // Ignore near white background
            if (brightness > 240) continue;
            // Ignore near black borders/shadows
            if (brightness < 18) continue;

            // Quantize to step of 20 to cluster similar shades
            const qr = Math.round(r / 20) * 20;
            const qg = Math.round(g / 20) * 20;
            const qb = Math.round(b / 20) * 20;
            const key = `${qr},${qg},${qb}`;

            if (!clusters[key]) {
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const delta = max - min;
              const sat = max === 0 ? 0 : delta / max;
              clusters[key] = { r: qr, g: qg, b: qb, count: 1, brightness, sat };
            } else {
              clusters[key].count++;
            }
          }

          const items = Object.values(clusters);
          if (items.length === 0) return finish(null);

          // Score clusters: prefer vibrant brand presence
          items.forEach(item => {
            item.score = item.count * (1 + item.sat * 2);
          });
          items.sort((a, b) => b.score - a.score);

          // Take top candidates
          const candidates = items.slice(0, 8);
          // Darkest candidate = lowest brightness (Primary Colour)
          candidates.sort((a, b) => a.brightness - b.brightness);
          const darkCandidate = candidates[0];

          // Lighter candidate = higher brightness with noticeable separation (Theme Colour)
          let lightCandidate = candidates.find(c => c.brightness >= darkCandidate.brightness + 35) || candidates[candidates.length - 1];

          const toHex = (n) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
          const darkHex = `#${toHex(darkCandidate.r)}${toHex(darkCandidate.g)}${toHex(darkCandidate.b)}`;
          let lightHex = `#${toHex(lightCandidate.r)}${toHex(lightCandidate.g)}${toHex(lightCandidate.b)}`;

          // If dark and light are almost the same shade, generate lighter tint
          if (Math.abs(darkCandidate.brightness - lightCandidate.brightness) < 30) {
            const lr = Math.min(255, darkCandidate.r + 65);
            const lg = Math.min(255, darkCandidate.g + 65);
            const lb = Math.min(255, darkCandidate.b + 65);
            lightHex = `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
          }

          const palette = {
            primaryDark: darkHex,
            themeLight: lightHex,
            darkRgb: `${darkCandidate.r}, ${darkCandidate.g}, ${darkCandidate.b}`,
            lightRgb: `${lightCandidate.r}, ${lightCandidate.g}, ${lightCandidate.b}`
          };
          finish(palette);
        } catch (err) {
          console.warn('Palette extraction failed:', err);
          finish(null);
        }
      };

      img.onerror = () => finish(null);
      img.src = srcUrl;
    };

    // Attempt blob fetch first if on remote API domain to avoid any canvas taint
    if (resolvedUrl.startsWith('http') && typeof window !== 'undefined' && !resolvedUrl.startsWith(window.location.origin)) {
      axiosInstance.get(resolvedUrl, { responseType: 'blob' })
        .then(res => {
          const blobUrl = URL.createObjectURL(res.data);
          processImageSource(blobUrl, true);
        })
        .catch(() => {
          processImageSource(resolvedUrl, false);
        });
    } else {
      processImageSource(resolvedUrl, false);
    }
  });
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
