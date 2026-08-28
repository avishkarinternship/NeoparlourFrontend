import React, { useState, useEffect } from 'react';
import { UserCheck, Phone, Calendar, User, Send, X, Loader2, Sparkles, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkCustomerPhoneForWalkIn } from '../services/customerService';
import CustomerCheckBadge from './appointments/CustomerCheckBadge';
import { staffApi } from '../services/staffApi';

export default function WalkInBookingModal({ staffId, salonId, isOpen, onClose, onBookingSuccess, isDarkMode = false }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone Verification States
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneCheckResult, setPhoneCheckResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setCustomerPhone('');
      setAppointmentTime('');
      setPhoneCheckResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Debounced / onBlur Phone Check Handler
  const handlePhoneBlur = async () => {
    const cleanedMobile = customerPhone.trim();
    if (!cleanedMobile || cleanedMobile.length < 10) {
      setPhoneCheckResult(null);
      return;
    }

    try {
      setIsCheckingPhone(true);
      const result = await checkCustomerPhoneForWalkIn(cleanedMobile);
      setPhoneCheckResult(result);

      if (result.exists) {
        // ⚠️ Registered Customer
        toast('Customer is already registered. No referral points will be claimed.', {
          icon: 'ℹ️',
          style: { background: '#FFFBEB', color: '#92400E' }
        });
        if (result.fullName || result.name) {
          setCustomerName(result.fullName || result.name);
        }
      } else {
        // 🎁 New Customer -> Staff earns 3 points
        toast.success('New Customer! You will receive 3 referral points after booking.', {
          icon: '🎁'
        });
      }
    } catch (err) {
      console.warn("Failed to verify customer phone status:", err);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please enter the customer name');
      return;
    }
    if (!appointmentTime) {
      toast.error('Please select an appointment time');
      return;
    }

    setLoading(true);
    try {
      // 1. Book Walk-in Appointment directly
      const bookingData = {
        salonId,
        staffId,
        customerName: customerName.trim(),
        customerNumber: customerPhone.trim(),
        appointmentAt: new Date(appointmentTime).toISOString()
      };
      
      const res = await staffApi.bookWalkIn(bookingData);
      const responseData = res?.data || res || {};
      const { appointment, isNewCustomer: isNewCustProp, newCustomer: newCustProp, referralPointsClaimed = 0, referralMessage } = responseData;
      const isNewCustomer = isNewCustProp !== undefined ? isNewCustProp : (newCustProp !== undefined ? newCustProp : true);

      // 🔔 Handle Referral Response Toast Notifications
      if (referralPointsClaimed > 0) {
        // 🎁 Scenario 1: Brand New Customer -> Points Claimed
        try {
          await staffApi.sendWhatsAppInvite({
            staffId,
            salonId,
            customerPhone: customerPhone.trim(),
            customerName: customerName.trim(),
          });
        } catch (inviteErr) {
          console.warn('Invite dispatch note:', inviteErr);
        }
        toast.success(`🎉 Walk-In Booked! +${referralPointsClaimed} Referral Points credited to Staff!`, {
          duration: 6000
        });
      } else if (isNewCustomer && referralPointsClaimed === 0) {
        // ℹ️ Scenario 2: Unregistered Customer with Existing Invite -> Re-invited, 0 Points
        toast(referralMessage || 'An invite has already been sent to this customer. No reward points claimed.', {
          icon: 'ℹ️',
          style: { background: '#FFFBEB', color: '#92400E', borderRadius: '16px', fontWeight: '600' },
          duration: 5000
        });
      } else {
        // ℹ️ Scenario 3: Already Registered Customer -> 0 Points
        toast(referralMessage || 'Customer is already registered. No referral points claimed.', {
          icon: 'ℹ️',
          duration: 4000
        });
      }

      if (onBookingSuccess) onBookingSuccess(appointment || responseData);
      onClose();
    } catch (err) {
      console.error('Walk-in booking failed:', err);
      toast.error(err.response?.data?.message || 'Failed to create walk-in booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-[#FF2A14] flex items-center justify-center font-bold border border-red-100 dark:border-red-900/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#FF2A14] uppercase tracking-widest block">
                Walk-In Appointment
              </span>
              <h3 className="text-base font-black tracking-tight">
                Book Walk-In Customer
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleWalkInBooking} className="p-5 space-y-4 font-sans">
          
          {/* Customer Mobile Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Customer Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                maxLength={10}
                required
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value.replace(/\D/g, ''));
                  setPhoneCheckResult(null); // Reset badge when user changes number
                }}
                onBlur={handlePhoneBlur}
                placeholder="10-digit mobile number"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              {isCheckingPhone && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF2A14]" />
                  Verifying...
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              Tab out or click away to verify referral points eligibility.
            </p>
          </div>

          {/* Dynamic Customer Referral / Registration Badge */}
          <CustomerCheckBadge
            phoneCheckResult={phoneCheckResult}
            isDarkMode={isDarkMode}
          />

          {/* Customer Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Customer Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Appointment Time Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Appointment Time *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="datetime-local"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !customerPhone || !customerName}
              className="px-5 py-2.5 rounded-xl bg-[#FF2A14] hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Confirm Walk-In Booking
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
