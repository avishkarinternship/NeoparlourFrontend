import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useTimeSlots } from '../../hooks/useTimeSlots';

export function SlotSelector({ 
  salonId, 
  staffId = null, 
  selectedDate, 
  onSlotSelect,
  selectedSlotTime = null,
  isDarkMode = false
}) => {
  const { slots, loading, isRefetching, error, refetch } = useTimeSlots(salonId, staffId, selectedDate);
  const [selectedSlot, setSelectedSlot] = useState(selectedSlotTime);

  useEffect(() => {
    setSelectedSlot(selectedSlotTime);
  }, [selectedSlotTime]);

  const handleSelect = (slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot.time);
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  if (!selectedDate) {
    return (
      <div className={`p-6 rounded-2xl border text-center text-xs font-semibold ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        Please select an appointment date first to view available time slots.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-36 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
        <p className="text-xs font-bold text-red-600 dark:text-red-400">
          Unable to fetch available slots for {selectedDate}.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition"
        >
          Retry Slot Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slot Selector Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FF2A14]" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Available Time Slots ({slots.filter(s => s.available).length} Open)
          </h3>
        </div>

        {/* Sync Indicator */}
        {isRefetching ? (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-[#FF2A14] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" /> ⚡ Syncing live slots...
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Live updated
          </span>
        )}
      </div>

      {/* Time Slot Buttons Grid */}
      {slots.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center text-xs font-semibold ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          No time slots are available for the selected date. Please pick another date or staff member.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.time;
            const isAvailable = slot.available;

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleSelect(slot)}
                className={`relative py-3 px-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FF2A14] text-white border-[#FF2A14] shadow-lg shadow-red-500/20 scale-[1.02]'
                    : !isAvailable
                      ? isDarkMode
                        ? 'bg-zinc-900/40 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                        : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-red-500/50 hover:bg-zinc-800'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-red-200 hover:bg-red-50/40'
                }`}
              >
                <span>{slot.time}</span>
                {!isAvailable ? (
                  <span className="text-[9px] font-extrabold text-red-500 dark:text-red-400 flex items-center gap-0.5 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Booked
                  </span>
                ) : isSelected ? (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/90">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SlotSelector;
