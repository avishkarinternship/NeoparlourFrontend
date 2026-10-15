import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, ChevronDown } from 'lucide-react';
import { openAddressDrawer } from '../../redux/slices/locationSlice';

export default function LocationHeaderPill({ className = "" }) {
  const dispatch = useDispatch();
  const { activeLocation } = useSelector((state) => state.location);

  const savedLoc = (() => {
    try {
      return JSON.parse(localStorage.getItem('customerLocation'));
    } catch {
      return null;
    }
  })();

  const city = activeLocation?.cityName || activeLocation?.city || savedLoc?.cityName || savedLoc?.city || localStorage.getItem('customerCurrentCity') || localStorage.getItem('customerCity') || '';
  const area = activeLocation?.areaName ?? activeLocation?.area ?? savedLoc?.areaName ?? savedLoc?.area ?? localStorage.getItem('customerCurrentArea') ?? localStorage.getItem('customerArea') ?? '';
  const label = activeLocation?.label || savedLoc?.label;

  const displayTitle = area || city || label || 'Select Location';
  const displaySubtitle = city 
    ? `${area ? area + ', ' : ''}${city}`
    : 'Set delivery / salon location';

  return (
    <button
      type="button"
      onClick={() => dispatch(openAddressDrawer())}
      className={`group flex items-center gap-1.5 px-1 py-0.5 transition-all text-left cursor-pointer bg-transparent border-0 hover:opacity-85 ${className}`}
      title="Click to change your location"
    >
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#FF0B01] shrink-0" />
          <span className="font-black text-xs sm:text-sm uppercase tracking-wide text-gray-900 dark:text-white truncate">
            {displayTitle}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF0B01] group-hover:translate-y-0.5 transition-all shrink-0" />
        </div>
        <span className="text-[10px] text-gray-500 dark:text-zinc-400 truncate leading-tight pl-4.5">
          {displaySubtitle}
        </span>
      </div>
    </button>
  );
}
