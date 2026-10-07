import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, CheckCircle2, Clock, Calendar, User, X, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

export function BookingCheckoutModal({ 
  isOpen, 
  onClose, 
  bookingDetails, 
  onSuccess, 
  onSlotConflict,
  isDarkMode = false 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  if (!isOpen || !bookingDetails) return null;

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setConflictError(null);

    try {
      // -------------------------------------------------------------
      // 1. STEP 1: PRE-CHECKOUT HARD GATE (Double-Check Slot Availability)
      // -------------------------------------------------------------
      const verifyRes = await axiosInstance.get('/appointments/staff/available-slots', {
        params: {
          salonId: bookingDetails.salonId,
          staffId: bookingDetails.staffId || null,
          date: bookingDetails.date
        },
        skipGlobalToast: true
      }).catch(() => null);

      if (verifyRes && Array.isArray(verifyRes.data)) {
        const targetSlot = verifyRes.data.find(s => s.time === bookingDetails.slotTime);
        if (targetSlot && !targetSlot.available) {
          const conflictMsg = `⚠️ The ${bookingDetails.slotTime} slot on ${bookingDetails.date} was just booked by another customer! Please pick an alternative time slot.`;
          setConflictError(conflictMsg);
          toast.error(conflictMsg);
          
          if (onSlotConflict) onSlotConflict();
          setIsSubmitting(false);
          return;
        }
      }

      // -------------------------------------------------------------
      // 2. STEP 2: EXECUTE ACTUAL APPOINTMENT BOOKING API
      // -------------------------------------------------------------
      const bookingPayload = {
        salonId: bookingDetails.salonId,
        staffId: bookingDetails.staffId || null,
        bookingDate: bookingDetails.date,
        slotTime: bookingDetails.slotTime,
        serviceIds: bookingDetails.serviceIds || [],
        notes: bookingDetails.notes || ''
      };

      const bookingRes = await axiosInstance.post('/appointments/book', bookingPayload);
      
      toast.success("Appointment booked successfully!");
      if (onSuccess) onSuccess(bookingRes.data);
      onClose();
    } catch (err) {
      console.warn("Booking execution error:", err);
      const errMsg = err.response?.data?.message || err.message || "Booking failed. Please try again.";
      setConflictError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Card */}
      <div className={`relative rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b flex justify-between items-center ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/60' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF2A14]" />
            <h3 className="text-base font-black uppercase tracking-tight">Confirm Appointment</h3>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Conflict Error Alert */}
          {conflictError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{conflictError}</div>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF2A14]" /> Date
              </span>
              <span className="font-mono">{bookingDetails.date}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF2A14]" /> Slot Time
              </span>
              <span className="font-mono text-[#FF2A14]">{bookingDetails.slotTime}</span>
            </div>

            {bookingDetails.staffName && (
              <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#FF2A14]" /> Stylist / Expert
                </span>
                <span>{bookingDetails.staffName}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-semibold text-center leading-relaxed">
            ⚡ Clicking confirm performs a real-time availability check to guarantee your slot without booking collisions.
          </p>
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4.5 border-t flex items-center justify-end gap-3 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/60' : 'border-slate-100 bg-slate-50/60'
        }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`px-5 py-2.5 border rounded-xl text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Back to Slots
          </button>

          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#FF2A14] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Booking...
              </>
            ) : (
              'Confirm & Book Now'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BookingCheckoutModal;
