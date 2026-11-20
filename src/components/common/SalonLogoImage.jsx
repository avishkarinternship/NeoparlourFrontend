import React, { useState, useEffect } from 'react';
import { getSalonImageSrc } from '../../utils/whiteLabelHelper';

/**
 * Robust Salon Logo component with graceful letter monogram fallback.
 */
export default function SalonLogoImage({ logo, name, className = "w-8 h-8 rounded-xl" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo]);

  if (!logo || failed) {
    const initial = name ? String(name).trim().charAt(0).toUpperCase() : 'S';
    return (
      <div className={`bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 ${className}`}>
        {initial || 'S'}
      </div>
    );
  }

  return (
    <img
      src={getSalonImageSrc(logo)}
      alt={name || 'Salon'}
      className={`object-cover border border-gray-200 dark:border-zinc-700 shadow-xs shrink-0 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
