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
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 dark:bg-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 border border-gray-200/60 dark:border-zinc-700/60 transition-all text-left max-w-[210px] sm:max-w-[260px] ${className}`}
      title="Click to change your location"
    >
      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
        <MapPin className="w-3.5 h-3.5" />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-gray-900 dark:text-white truncate">
            {displayTitle}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-red-500 shrink-0 transition-transform group-hover:translate-y-0.5" />
        </div>
        <span className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">
          {displaySubtitle}
        </span>
      </div>
    </button>
  );
}
