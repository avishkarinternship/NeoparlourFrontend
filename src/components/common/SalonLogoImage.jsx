import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { getSalonImageSrc } from '../../utils/whiteLabelHelper';

/**
 * Resilient Salon Logo component that handles full URLs, relative paths,
 * auth-backed blob fetching, and elegant monogram fallbacks.
 */
export default function SalonLogoImage({ logo, name, className = "w-8 h-8 rounded-xl" }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!logo) {
      setSrc(null);
      setFailed(false);
      return;
    }

    const str = String(logo).trim();
    if (!str || str === 'null' || str === 'undefined') {
      setSrc(null);
      setFailed(false);
      return;
    }

    // Direct web/blob/data URLs
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('blob:') || str.startsWith('data:')) {
      setSrc(str);
      setFailed(false);
      return;
    }

    // Relative backend path - fetch via axios with auth header for blob
    let isMounted = true;
    let blobUrl = null;

    const cleanPath = str.startsWith('/images/')
      ? str.replace(/^\/images\//, '')
      : str.startsWith('images/')
      ? str.replace(/^images\//, '')
      : str.startsWith('/')
      ? str.slice(1)
      : str;

    const fetchImageBlob = async () => {
      try {
        const response = await axiosInstance.get(`/images/${cleanPath}`, {
          responseType: 'blob',
        });
        if (isMounted) {
          blobUrl = URL.createObjectURL(response.data);
          setSrc(blobUrl);
          setFailed(false);
        }
      } catch (err) {
        // Fall back to direct image URL if blob fetch fails
        if (isMounted) {
          const directUrl = getSalonImageSrc(str);
          if (directUrl && directUrl !== str) {
            setSrc(directUrl);
          } else {
            setFailed(true);
          }
        }
      }
    };

    fetchImageBlob();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [logo]);

  if (!logo || failed || !src) {
    const initial = name ? String(name).trim().charAt(0).toUpperCase() : 'S';
    return (
      <div 
        className={`bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 select-none ${className}`}
        title={name || 'Salon'}
      >
        {initial || 'S'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'Salon Logo'}
      className={`object-cover border border-gray-200 dark:border-zinc-700 shadow-xs shrink-0 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
