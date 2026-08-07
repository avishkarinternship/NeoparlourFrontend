import React, { useState } from 'react';
import { UserCheck, Phone, Calendar, User, Send, X } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function WalkInBookingModal({ staffId, salonId, isOpen, onClose, onBookingSuccess }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!appointmentTime) {
      toast.error('Please select an appointment time');
      return;
    }

    setLoading(true);
    try {
      // 1. Book Walk-in Appointment
      const bookingData = {
        salonId,
        staffId,
        customerName,
        customerNumber: customerPhone,
        appointmentAt: new Date(appointmentTime).toISOString(),
      };
      await staffApi.bookWalkIn(bookingData);

      // 2. Check if customer is registered or new
      let isRegistered = false;
      try {
        const existsRes = await staffApi.checkPhoneExists(customerPhone);
        isRegistered = !!(existsRes.data?.exists || existsRes.data);
      } catch (err) {
        console.warn('Customer phone check failed, assuming new customer:', err);
      }

      // 3. If customer is NOT registered, automatically send WhatsApp App Link with inviteCode
      if (!isRegistered) {
        try {
          await staffApi.sendWhatsAppInvite({
            staffId,
            salonId,
            customerPhone,
            customerName,
          });
          toast.success(`Walk-in booked! WhatsApp invitation link with referral code dispatched to ${customerPhone}`);
        } catch (inviteErr) {
          console.error('Invite dispatch error:', inviteErr);
          toast.success('Walk-in booking created successfully!');
        }
      } else {
        toast.success('Walk-in booking created successfully!');
      }

      if (onBookingSuccess) onBookingSuccess();
      handleClose();
    } catch (err) {
      toast.error('Error creating walk-in booking: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setCustomerPhone('');
    setAppointmentTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Book Walk-In Customer</h3>
            <p className="text-xs text-gray-500">Instant registration & optional WhatsApp referral invite</p>
          </div>
        </div>

        <form onSubmit={handleWalkInBooking} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone (10 digits)*</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full border border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time*</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="datetime-local"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Booking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Book & Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
