import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, CheckCircle, AlertTriangle, RefreshCw, UserCheck, Package, PlusCircle, X, Sparkles } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function AppointmentsView({ staffId, salonId }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active appointment for action modals
  const [activeAppointment, setActiveAppointment] = useState(null);

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Extension Conflict State (409 Exception Handling)
  const [conflictModal, setConflictModal] = useState(false);
  const [conflictError, setConflictError] = useState('');

  // Post-completion Opened Products Modal State
  const [completionModal, setCompletionModal] = useState(false);
  const [openedProducts, setOpenedProducts] = useState([]);
  const [selectedProductUsages, setSelectedProductUsages] = useState([]);
  const [completionLoading, setCompletionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const isoFormatted = new Date(selectedDate).toISOString();
      const res = await staffApi.getAppointmentsByDate(isoFormatted);
      setAppointments(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      toast.error('Failed to fetch appointments for selected date');
    } finally {
      setLoading(false);
    }
  };

  // Action: Start Appointment
  const handleStart = async (id) => {
    try {
      await staffApi.startAppointment(id);
      toast.success('Appointment started!');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start appointment');
    }
  };

  // Action: Extend Appointment (Handles 409 Conflict Exception)
  const handleExtend = async (appointment, extraMinutes = 15) => {
    try {
      await staffApi.extendAppointment(appointment.id, extraMinutes);
      toast.success(`Extended appointment duration by ${extraMinutes} mins!`);
      fetchAppointments();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.status === 400) {
        setActiveAppointment(appointment);
        setConflictError(err.response?.data?.message || 'Appointment time conflicts with upcoming bookings.');
        setConflictModal(true);
      } else {
        toast.error('Extension error: ' + (err.response?.data?.message || 'Server error'));
      }
    }
  };

  // Action: Submit Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTime) {
      toast.error('Please select a new date and time');
      return;
    }
    setRescheduleLoading(true);
    try {
      await staffApi.rescheduleAppointment(activeAppointment.id, {
        appointmentAt: new Date(rescheduleTime).toISOString()
      });
      toast.success('Appointment rescheduled successfully!');
      setRescheduleModal(false);
      setRescheduleTime('');
      fetchAppointments();
    } catch (err) {
      toast.error('Reschedule failed: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Action: Submit Cancel
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason) {
      toast.error('Please enter a cancellation reason');
      return;
    }
    setCancelLoading(true);
    try {
      await staffApi.cancelAppointment(activeAppointment.id, cancelReason);
      toast.success('Appointment cancelled');
      setCancelModal(false);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      toast.error('Cancel failed: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setCancelLoading(false);
    }
  };

  // Action: Open Post-Completion Tab
  const initiateCompletion = async (appointment) => {
    setActiveAppointment(appointment);
    try {
      const res = await staffApi.getActiveOpenedProducts(staffId);
      setOpenedProducts(res.data?.content || res.data || []);
      setSelectedProductUsages([]);
      setCompletionModal(true);
    } catch (err) {
      console.error('Failed to fetch staff opened products:', err);
      setOpenedProducts([]);
      setSelectedProductUsages([]);
      setCompletionModal(true);
    }
  };

  // Action: Submit Final Completion with Opened Products
  const submitCompletion = async () => {
    setCompletionLoading(true);
    try {
      await staffApi.completeAppointment(activeAppointment.id, selectedProductUsages);
      setCompletionModal(false);
      toast.success('Appointment completed successfully!');
      fetchAppointments();
    } catch (err) {
      toast.error('Error completing appointment: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setCompletionLoading(false);
    }
  };

  return (
    <div className="appointments-container p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header & Date Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[#FF0B01] uppercase mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Live Management
          </span>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            Appointments Timeline
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            View & update customer booking lifecycles
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 self-stretch md:self-auto">
          <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 pl-2">
            <Clock className="w-4 h-4 text-[#FF0B01]" /> Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
          />
          <button
            onClick={fetchAppointments}
            className="p-2 text-slate-500 hover:text-[#FF0B01] hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh appointments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Appointment Cards Timeline */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-[24px] shadow-sm border border-slate-100">
          <div className="w-10 h-10 border-4 border-[#FF0B01] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 font-bold text-sm">Fetching scheduled bookings...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[24px] shadow-sm border border-slate-100 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-800 font-black text-lg uppercase tracking-tight">No appointments scheduled</p>
          <p className="text-slate-400 font-semibold text-xs mt-1">Select another date or create a walk-in booking above.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="border border-slate-150 rounded-[24px] p-5 shadow-xs bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl ${getStatusColor(app.status)}`}>
                    {app.status?.toUpperCase() || 'BOOKED'}
                  </span>
                  <span className="text-xs text-slate-400 font-bold font-mono">ID: #{app.id}</span>
                </div>

                <h4 className="font-black text-lg text-slate-900 tracking-tight mt-1">
                  {app.customerName || 'Walk-in Customer'} <span className="text-xs font-semibold text-slate-400">({app.customerPhone || app.customerNumber || 'No Phone'})</span>
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-[#FF0B01]" />
                    {app.appointmentAt ? new Date(app.appointmentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : 'N/A'}
                    <span className="text-slate-400 font-medium">({app.serviceDuration || 30} mins)</span>
                  </span>

                  <span className="font-bold text-[#FF0B01] bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                    Services: {Array.isArray(app.serviceNames) ? app.serviceNames.join(', ') : (app.serviceName || app.serviceNames || 'General Service')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap self-end md:self-center pt-2 md:pt-0">
                {(app.status === 'booked' || app.status === 'PENDING' || app.status === 'BOOKED') && (
                  <button
                    onClick={() => handleStart(app.id)}
                    className="bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                )}

                {(app.status === 'confirmed' || app.status === 'in_progress' || app.status === 'CONFIRMED' || app.status === 'IN_PROGRESS') && (
                  <>
                    <button
                      onClick={() => handleExtend(app, 15)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> +15 Mins
                    </button>
                    <button
                      onClick={() => initiateCompletion(app)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Complete
                    </button>
                  </>
                )}

                {app.status !== 'completed' && app.status !== 'COMPLETED' && app.status !== 'cancelled' && app.status !== 'CANCELLED' && (
                  <>
                    <button
                      onClick={() => { setActiveAppointment(app); setRescheduleModal(true); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => { setActiveAppointment(app); setCancelModal(true); }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL A: 409 EXTENSION CONFLICT RESOLUTION TAB ================= */}
      {conflictModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight">Extension Conflict Warning</h3>
                <p className="text-xs font-semibold text-slate-400">Overlapping booking slot detected</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-rose-50/70 border border-rose-100 p-4 rounded-2xl mb-4 font-semibold">
              {conflictError}
            </p>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">Choose Resolution Action:</h4>
              <button
                onClick={() => { setConflictModal(false); setRescheduleModal(true); }}
                className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> 1. Reschedule Conflicting Appointment
              </button>
              <button
                onClick={() => {
                  setConflictModal(false);
                  const targetStaffId = prompt('Enter new Staff ID to reassign next appointment:');
                  if (targetStaffId) {
                    staffApi.changeAppointmentStaff(activeAppointment.id, targetStaffId, 'Reassigned Staff');
                    toast.success('Reassigned conflicting appointment!');
                    fetchAppointments();
                  }
                }}
                className="w-full bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" /> 2. Reassign to Available Staff
              </button>
            </div>

            <button
              onClick={() => setConflictModal(false)}
              className="mt-4 text-slate-400 hover:text-slate-600 text-xs w-full text-center font-bold uppercase tracking-wider cursor-pointer"
            >
              Dismiss / Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL B: POST-COMPLETION OPENED PRODUCTS SELECTOR ================= */}
      {completionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setCompletionModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Post-Completion Products</h3>
                <p className="text-xs font-semibold text-slate-400">Record items used from active opened stock</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-150 font-medium">
              Select items from your active opened inventory that were consumed during this service session.
            </p>

            {openedProducts.length === 0 ? (
              <p className="text-xs text-slate-500 my-6 text-center italic bg-slate-50/50 py-4 rounded-2xl font-semibold">
                No active opened products currently in your staff inventory.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                {openedProducts.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center border border-slate-200 p-3.5 rounded-2xl text-sm bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-900">{prod.productName}</p>
                      <p className="text-xs text-slate-500 font-semibold">Remaining: {prod.remainingQuantity} {prod.unit || 'units'}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Qty used"
                      className="border border-slate-300 rounded-xl w-24 px-3 py-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value);
                        if (!isNaN(qty) && qty > 0) {
                          setSelectedProductUsages((prev) => [
                            ...prev.filter((p) => p.staffOpenedProductId !== prod.id),
                            { staffOpenedProductId: prod.id, quantityUsed: qty },
                          ]);
                        } else {
                          setSelectedProductUsages((prev) => prev.filter((p) => p.staffOpenedProductId !== prod.id));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => submitCompletion()}
                className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Skip Products
              </button>
              <button
                onClick={submitCompletion}
                disabled={completionLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {completionLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Finish & Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black mb-4 text-slate-900 uppercase tracking-tight">Reschedule Booking</h3>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">New Date & Time*</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModal(false)}
                  className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-5 py-3 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  {rescheduleLoading ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black mb-2 text-rose-600 uppercase tracking-tight">Cancel Appointment</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">Please specify a reason for cancelling this booking.</p>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Reason*</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer request, Unforeseen conflict..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModal(false)}
                  className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'booked':
    case 'pending':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'confirmed':
    case 'in_progress':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}
