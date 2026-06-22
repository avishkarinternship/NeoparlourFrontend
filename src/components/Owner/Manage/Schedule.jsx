import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { CalendarClock, CheckCircle, XCircle, Eye, X } from 'lucide-react';

// Icons
import assignStaffIcon from '../../../assets/Owner/Manage/Schedule/assign_staff_icon.svg';
import calendarIcon from '../../../assets/Owner/Manage/Schedule/calender_icon.svg';
import clockIcon from '../../../assets/Owner/Manage/Schedule/clock_icon.svg';
import profileIcon from '../../../assets/Owner/Manage/Schedule/profile_icon.jpg';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '16px',
    padding: '20px 24px',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    minWidth: '350px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  iconTheme: { primary: '#ff0b01', secondary: '#fff' }
};

const Schedule = () => {
  const location = useLocation();

  const [currentSubTab, setCurrentSubTab] = useState('Scheduled');
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  // Advanced Filters
  const [filters, setFilters] = useState({
    mobile: '',
    staffId: '',
    fromDate: '',
    toDate: '',
    minAmount: '',
    maxAmount: ''
  });

  // Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Action Modal States
  const [actionType, setActionType] = useState('reschedule');
  const [newDateTime, setNewDateTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleReasonType, setRescheduleReasonType] = useState('');

  // Staff Modal
  const [newStaffId, setNewStaffId] = useState('');

  // View Appointment Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingViewAppointment, setLoadingViewAppointment] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);

  const handleViewAppointment = async (id) => {
    setLoadingViewAppointment(true);
    try {
      const response = await axiosInstance.get(`/appointments/${id}`);
      setSelectedAppointmentDetails(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load appointment details', toastStyle);
    } finally {
      setLoadingViewAppointment(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get('/staff');
      setStaffList(response.data || []);
    } catch (error) {
      toast.error('Failed to load staff list', toastStyle);
    }
  };

  const fetchAppointments = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);

      if (filters.mobile) params.append('mobile', filters.mobile);
      if (filters.staffId) params.append('staffId', filters.staffId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

      const status = (currentSubTab === 'Scheduled' || currentSubTab === 'Past Appointments') ? 'booked'
        : currentSubTab === 'Cancelled' ? 'cancelled' : 'completed';
      params.append('status', status);

      params.append('sort', 'appointmentAt,desc');

      // Get the start of today in IST (Asia/Kolkata) timezone
      const getStartOfTodayIST = () => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const dateStr = formatter.format(now);
        return `${dateStr}T00:00:00+05:30`;
      };
      
      const startOfTodayIST = getStartOfTodayIST();

      if (filters.fromDate) {
        params.append('fromDate', convertToISTZoned(filters.fromDate));
      } else if (currentSubTab === 'Scheduled') {
        params.append('fromDate', startOfTodayIST);
      }

      if (filters.toDate) {
        params.append('toDate', convertToISTZoned(filters.toDate));
      } else if (currentSubTab === 'Past Appointments') {
        params.append('toDate', startOfTodayIST);
      }

      const response = await axiosInstance.get(`/appointments/search/advanced?${params.toString()}`);

      const data = response.data;
      setAppointments(data?.content || []);
      setTotalPages(data?.page?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to load appointments', toastStyle);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(0);
    fetchStaff();
  }, [currentSubTab]);

  useEffect(() => {
    if (location.state?.appointmentId) {
      handleViewAppointment(location.state.appointmentId);
    }
  }, [location.state?.appointmentId]);

  const handleSearch = () => fetchAppointments(0);
  const resetFilters = () => setFilters({ mobile: '', staffId: '', fromDate: '', toDate: '', minAmount: '', maxAmount: '' });

  // ==================== CORRECTED: CONVERT datetime-local TO IST ZonedDateTime ====================
  const convertToISTZoned = (localDateTimeStr) => {
    if (!localDateTimeStr) return null;

    const [datePart, timePart] = localDateTimeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const hourStr = hour.toString().padStart(2, '0');
    const minuteStr = minute.toString().padStart(2, '0');

    // Returns proper format: 2026-06-13T23:30:00+05:30
    return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:00+05:30`;
  };

  // ==================== FORMAT UTC TIME TO IST FOR DISPLAY ====================
  const formatToIST = (utcDateStr) => {
    if (!utcDateStr) return { date: '', time: '' };

    const date = new Date(utcDateStr);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

    const formattedDate = istDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const formattedTime = istDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return { date: formattedDate, time: formattedTime };
  };

  // Client-side validation (45 minutes in advance)
  const isValidRescheduleTime = (newTime) => {
    if (!newTime) return true;
    const selected = new Date(newTime);
    const now = new Date();
    const diffMinutes = (selected - now) / (1000 * 60);
    return diffMinutes >= 45;
  };

  const handleAction = async () => {
    const now = Date.now();
    if (!selectedAppointment || actionLoading || (now - lastActionTime < 800)) return;

    let selectedReason = '';

    if (actionType === 'reschedule') {
      if (!newDateTime) {
        toast.error("Please select new date & time", toastStyle);
        return;
      }
      if (!isValidRescheduleTime(newDateTime)) {
        toast.error("Appointment must be rescheduled at least 45 minutes in advance", toastStyle);
        return;
      }

      selectedReason = rescheduleReasonType === 'Other' 
        ? rescheduleReason.trim() 
        : rescheduleReasonType;

      if (!selectedReason) {
        toast.error("Please select or specify a reason for rescheduling", toastStyle);
        return;
      }
    }

    setActionLoading(true);
    setLastActionTime(now);

    try {
      if (actionType === 'complete') {
        await axiosInstance.put(`/appointments/${selectedAppointment.id}/complete`, {});
        toast.success('Appointment marked as completed', toastStyle);
      } else {
        const zonedTime = convertToISTZoned(newDateTime);
        console.log("🚀 Sending to backend (IST):", zonedTime);   // Debug log

        const params = new URLSearchParams({ newTime: zonedTime });
        await axiosInstance.put(
          `/appointments/${selectedAppointment.id}/reschedule?${params.toString()}`,
          selectedReason
        );
        toast.success('Appointment rescheduled successfully', toastStyle);
      }

      setShowActionModal(false);
      resetActionForm();
      fetchAppointments(currentPage);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Action failed';
      if (!errorMsg.toLowerCase().includes('45 minutes')) {
        toast.error(errorMsg, toastStyle);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const resetActionForm = () => {
    setNewDateTime('');
    setRescheduleReason('');
    setRescheduleReasonType('');
  };

  const openActionModal = (appt, type = 'reschedule') => {
    setSelectedAppointment(appt);
    setActionType(type);
    resetActionForm();
    setShowActionModal(true);
  };

  const handleComplete = async (appt) => {
    try {
      await axiosInstance.put(`/appointments/${appt.id}/complete`, {});
      toast.success('Appointment marked as completed', toastStyle);
      fetchAppointments(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete appointment', toastStyle);
    }
  };

  const handleDownloadInvoice = async (appointmentId) => {
    const toastId = toast.loading('Generating invoice PDF...', toastStyle);
    try {
      const response = await axiosInstance.get(`/invoices/appointment/${appointmentId}`, {
        responseType: 'blob'
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
      
      toast.success('Invoice opened successfully!', { id: toastId, ...toastStyle });
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.error('Failed to generate invoice. Please try again.', { id: toastId, ...toastStyle });
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason", toastStyle);
      return;
    }
    try {
      await axiosInstance.put(
        `/appointments/${selectedAppointment.id}/cancel`,
        cancelReason,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      toast.success('Appointment cancelled successfully', toastStyle);
      setShowCancelModal(false);
      setCancelReason('');
      fetchAppointments(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment', toastStyle);
    }
  };

  const openCancelModal = (appt) => {
    setSelectedAppointment(appt);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openStaffModal = (appt) => {
    setSelectedAppointment(appt);
    setNewStaffId('');
    setShowStaffModal(true);
  };

  const handleChangeStaff = async () => {
    if (!selectedAppointment || !newStaffId) {
      toast.error("Please select a staff member", toastStyle);
      return;
    }
    try {
      const payload = { staffId: parseInt(newStaffId) };
      await axiosInstance.put(`/appointments/${selectedAppointment.id}/change-staff`, payload);
      toast.success('Staff updated successfully', toastStyle);
      setShowStaffModal(false);
      setNewStaffId('');
      fetchAppointments(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff', toastStyle);
    }
  };

  const getTodayDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <>
        <main className="flex-1 p-6 md:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-8 max-w-3xl border border-gray-100 shadow-sm overflow-x-auto scrollbar-none">
            {['Scheduled', 'Past Appointments', 'Cancelled', 'Completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentSubTab(tab)}
                className={`flex-1 px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${currentSubTab === tab ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Advanced Search Filters</h3>
              <div className="flex gap-3">
                <button onClick={resetFilters} className="text-gray-400 hover:text-[#FF0B01] text-xs font-bold uppercase tracking-wider transition-all">Reset</button>
                <button onClick={handleSearch} className="bg-[#FF0B01] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.985]">Search</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Mobile Number</label>
                <input type="text" value={filters.mobile} onChange={(e) => setFilters(prev => ({ ...prev, mobile: e.target.value }))} placeholder="Customer mobile" className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Staff</label>
                <div className="relative">
                  <select value={filters.staffId} onChange={(e) => setFilters(prev => ({ ...prev, staffId: e.target.value }))} className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 appearance-none cursor-pointer">
                    <option value="">All Staff</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} {staff.phone ? `(${staff.phone})` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">From Date</label>
                <input type="datetime-local" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">To Date</label>
                <input type="datetime-local" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Min Amount (₹)</label>
                <input type="number" value={filters.minAmount} onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))} placeholder="Minimum" className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Max Amount (₹)</label>
                <input type="number" value={filters.maxAmount} onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))} placeholder="Maximum" className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
              </div>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="text-center py-12">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No appointments found</div>
          ) : (
            <div className="space-y-4 max-w-5xl">
              {appointments.map((appt) => {
                const istTime = formatToIST(appt.appointmentAt);
                return (
                  <div key={appt.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-all relative overflow-hidden group pl-8 gap-4">
                    {/* Left status vertical border indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${currentSubTab === 'Scheduled' ? 'bg-[#FF0B01]' : currentSubTab === 'Past Appointments' ? 'bg-[#F59E0B]' : currentSubTab === 'Cancelled' ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                    
                    <div 
                      onClick={() => handleViewAppointment(appt.id)}
                      className="flex items-center space-x-3.5 cursor-pointer hover:opacity-85 transition-all group/info"
                      title="Click to view details"
                    >
                      <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={appt.customerAvatar || profileIcon} alt={appt.customerName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900 tracking-tight group-hover/info:text-[#FF0B01] transition-colors">{appt.customerName || 'Customer'}</h4>
                        <div className="flex items-center space-x-3 text-[11px] font-semibold text-gray-400 mt-1 flex-wrap">
                          <span className="text-gray-500">{appt.serviceName || (appt.serviceNames && appt.serviceNames.join(", "))}</span>
                          <span className="flex items-center text-gray-400">
                            <img src={calendarIcon} alt="Calendar" className="w-3.5 h-3.5 mr-1" />
                            {istTime.date}
                          </span>
                          <span className="flex items-center text-gray-400">
                            <img src={clockIcon} alt="Clock" className="w-3.5 h-3.5 mr-1" />
                            {istTime.time} <span className="text-[10px] ml-1">(IST)</span>
                          </span>
                          {appt.customerMobile && <span className="text-emerald-600 font-medium">📞 {appt.customerMobile}</span>}
                          {appt.staffId && appt.staffName && (
                            <span className="text-blue-600 font-semibold flex items-center gap-1">
                              👤 Stylist: {appt.staffName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end text-[10px] font-extrabold uppercase tracking-widest pt-2 lg:pt-0 border-t border-gray-50 lg:border-t-0">
                      {/* View Details Eye Button */}
                      <button 
                        onClick={() => handleViewAppointment(appt.id)} 
                        className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-600 hover:text-[#FF0B01] hover:bg-red-50 border border-gray-150 rounded-xl transition shadow-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(currentSubTab === 'Scheduled' || currentSubTab === 'Past Appointments') && (
                        <>
                          <button 
                            onClick={() => openActionModal(appt, 'reschedule')} 
                            className="w-9 h-9 flex items-center justify-center bg-[#FF0B01] text-white rounded-xl hover:bg-red-700 transition shadow-sm cursor-pointer"
                          >
                            <CalendarClock className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleComplete(appt)} 
                            className="w-9 h-9 flex items-center justify-center bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm cursor-pointer"
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => openCancelModal(appt)} 
                            className="w-9 h-9 flex items-center justify-center bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition shadow-sm cursor-pointer"
                          >
                            <XCircle className="w-4.5 h-4.5" />
                          </button>
                          {appt.staffId ? (
                            <button onClick={() => openStaffModal(appt)} className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-1 transition shadow-2xs">
                              <img src={assignStaffIcon} alt="Staff" className="w-3.5 h-3.5" /> Change Staff
                            </button>
                          ) : (
                            <button onClick={() => openStaffModal(appt)} className="border border-[#FF0B01] text-[#FF0B01] bg-red-50/20 px-4 py-2.5 rounded-xl hover:bg-red-50 flex items-center gap-1 transition shadow-2xs">
                              <img src={assignStaffIcon} alt="Staff" className="w-3.5 h-3.5" style={{ filter: 'invert(15%) sepia(95%) saturate(6935%) hue-rotate(357deg) brightness(95%) contrast(115%)' }} /> Assign Staff
                            </button>
                          )}
                        </>
                      )}
                      {currentSubTab === 'Completed' && (
                        <button 
                          onClick={() => handleDownloadInvoice(appt.id)} 
                          className="bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-10">
            <button onClick={() => fetchAppointments(currentPage - 1)} disabled={currentPage === 0 || loading} className="px-6 py-2 border rounded-xl disabled:opacity-50">Previous</button>
            <span className="px-6 py-2 font-medium">Page {currentPage + 1} of {totalPages}</span>
            <button onClick={() => fetchAppointments(currentPage + 1)} disabled={currentPage >= totalPages - 1 || loading} className="px-6 py-2 border rounded-xl disabled:opacity-50">Next</button>
          </div>
        </main>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Cancel Appointment</h3>
            <p className="text-sm text-gray-600 mb-3">Customer: <strong>{selectedAppointment.customerName}</strong></p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." className="w-full border border-gray-300 rounded-xl p-3 h-28 resize-y text-sm" />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">Close</button>
              <button onClick={handleCancel} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              {actionType === 'complete' ? 'Mark Appointment as Complete' : 'Reschedule Appointment'}
            </h3>
            <p className="text-sm text-gray-600 mb-5">Customer: <strong>{selectedAppointment.customerName}</strong></p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Action</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActionType('reschedule')} className={`flex-1 py-3 rounded-xl text-sm font-medium border ${actionType === 'reschedule' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300'}`}>Reschedule</button>
                  <button type="button" onClick={() => setActionType('complete')} className={`flex-1 py-3 rounded-xl text-sm font-medium border ${actionType === 'complete' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300'}`}>Mark Complete</button>
                </div>
              </div>

              {actionType === 'reschedule' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">New Date & Time (IST)</label>
                  <input
                    type="datetime-local"
                    value={newDateTime}
                    min={getTodayDateTime()}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm"
                  />
                </div>
              )}

              {actionType === 'reschedule' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Reason for Rescheduling</label>
                    <select
                      value={rescheduleReasonType}
                      onChange={(e) => setRescheduleReasonType(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white"
                    >
                      <option value="" disabled>Select a reason...</option>
                      <option value="Staff not available">Staff not available</option>
                      <option value="Salon fully booked / Slot overlap">Salon fully booked / Slot overlap</option>
                      <option value="Power cut / Technical issue">Power cut / Technical issue</option>
                      <option value="Emergency store closure">Emergency store closure</option>
                      <option value="Other">Other (Type custom reason)</option>
                    </select>
                  </div>
                  {rescheduleReasonType === 'Other' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Custom Reason</label>
                      <textarea
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        placeholder="Reason for rescheduling..."
                        className="w-full border border-gray-300 rounded-xl p-3 h-24 resize-y text-sm"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes for Completion (Optional)</label>
                  <textarea
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Notes for completion..."
                    className="w-full border border-gray-300 rounded-xl p-3 h-24 resize-y text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowActionModal(false)} disabled={actionLoading} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">Cancel</button>
              <button type="button" onClick={handleAction} disabled={actionLoading || (actionType === 'reschedule' && !newDateTime)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium disabled:opacity-60">
                {actionLoading ? 'Processing...' : actionType === 'complete' ? 'Mark as Complete' : 'Reschedule Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showStaffModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              {selectedAppointment.staffId ? 'Change Assigned Staff' : 'Assign Staff'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Appointment: <strong>{selectedAppointment.customerName}</strong></p>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Select Staff</label>
              <select value={newStaffId} onChange={(e) => setNewStaffId(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm">
                <option value="">-- Select Staff --</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} {staff.phone ? `(${staff.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowStaffModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">Cancel</button>
              <button onClick={handleChangeStaff} disabled={!newStaffId} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium disabled:opacity-60">
                {selectedAppointment.staffId ? 'Update Staff' : 'Assign Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Appointment Details Modal */}
      {isViewModalOpen && selectedAppointmentDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 p-6 md:p-8 animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-[#FF0B01] flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#FF0B01] font-bold text-lg">
                📅
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 block">
                  Appointment Overview
                </span>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Appointment #NP-{selectedAppointmentDetails.id}
                </h3>
              </div>
            </div>

            {/* Details Grid (Premium dashboard card key-value cells) */}
            <div className="space-y-4 text-left">
              {/* Client & Booking details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50/60 border border-gray-100 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Customer</span>
                  <span className="text-xs font-bold text-gray-800 break-words">
                    {selectedAppointmentDetails.customerName || selectedAppointmentDetails.customer?.fullName || 'N/A'}
                  </span>
                </div>
                <div className="bg-gray-50/60 border border-gray-100 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Customer Contact</span>
                  <span className="text-xs font-bold text-gray-800 break-words">
                    {selectedAppointmentDetails.customerNumber || selectedAppointmentDetails.customerMobile || selectedAppointmentDetails.customer?.mobile || 'N/A'}
                  </span>
                </div>
                <div className="bg-gray-50/60 border border-gray-100 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Stylist</span>
                  <span className="text-xs font-bold text-gray-800 break-words">
                    {selectedAppointmentDetails.staffName || 'Unassigned'}
                  </span>
                </div>
                <div className="bg-gray-50/60 border border-gray-100 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Duration</span>
                  <span className="text-xs font-extrabold text-[#FF0B01] uppercase tracking-wider">
                    {selectedAppointmentDetails.serviceDuration ? `${selectedAppointmentDetails.serviceDuration} Mins` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Schedule & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-50/60 border border-gray-100 p-3.5 rounded-2xl md:col-span-2 flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Scheduled Date & Time (IST)</span>
                  <span className="text-xs font-semibold text-gray-800">
                    {selectedAppointmentDetails.appointmentAt 
                      ? new Date(selectedAppointmentDetails.appointmentAt).toLocaleString('en-IN', { 
                          timeZone: 'Asia/Kolkata', 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        }) 
                      : 'N/A'}
                  </span>
                </div>
                <div className="bg-gray-50/60 border border-gray-100 p-3.5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      selectedAppointmentDetails.status === 'booked' ? 'bg-[#FF0B01]' :
                      selectedAppointmentDetails.status === 'completed' ? 'bg-green-500' :
                      'bg-gray-400'
                    }`}></span>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider capitalize">
                      {selectedAppointmentDetails.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Merged Services & Price Calculation Ledger */}
              <div className="border border-dashed border-gray-200 bg-gray-50/30 p-5 rounded-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-dashed border-gray-200">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-sans">Services & Billing Ledger</span>
                  <span className="text-[9px] text-gray-400 uppercase font-sans tracking-widest font-bold font-mono">Receipt</span>
                </div>

                {/* Services List and their individual prices */}
                <div className="space-y-2">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block font-sans">Services Booked</span>
                  <div className="divide-y divide-gray-100/60">
                    {(() => {
                      const services = selectedAppointmentDetails.services || [];
                      if (services.length > 0) {
                        return services.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0 text-xs">
                            <span className="text-gray-800 font-sans">{s.serviceName || `Service ${idx + 1}`}</span>
                            <span className="font-bold text-gray-650 font-mono">₹{(s.price ?? 0).toFixed(2)}</span>
                          </div>
                        ));
                      }
                      
                      const serviceNames = selectedAppointmentDetails.serviceNames || [];
                      if (serviceNames.length > 0) {
                        return serviceNames.map((name, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0 text-xs">
                            <span className="text-gray-800 font-sans">{name}</span>
                            <span className="font-bold text-gray-400 font-mono">N/A</span>
                          </div>
                        ));
                      }
                      
                      if (selectedAppointmentDetails.serviceName) {
                        return (
                          <div className="flex justify-between items-center py-1.5 text-xs">
                            <span className="text-gray-800 font-sans">{selectedAppointmentDetails.serviceName}</span>
                            <span className="font-bold text-gray-650 font-mono">₹{(selectedAppointmentDetails.totalPrice ?? 0).toFixed(2)}</span>
                          </div>
                        );
                      }
                      
                      return <p className="text-xs text-gray-400 font-sans">No services specified</p>;
                    })()}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100/60 my-2"></div>

                {/* Service Subtotal */}
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="font-sans">Service Subtotal:</span>
                  <span className="font-bold">₹{(selectedAppointmentDetails.totalPrice ?? 0).toFixed(2)}</span>
                </div>

                {/* Home Service Charge */}
                {selectedAppointmentDetails.homeService && (
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="font-sans">🏠 Home Service Charge:</span>
                    <span className="font-bold text-amber-600">
                      {selectedAppointmentDetails.homeCharge ? `+ ₹${Number(selectedAppointmentDetails.homeCharge).toFixed(2)}` : 'Included / Free'}
                    </span>
                  </div>
                )}

                {/* Discount Applied */}
                {(selectedAppointmentDetails.discountAmount ?? 0) > 0 && (
                  <div className="flex flex-col gap-1 py-1 bg-green-50/30 px-2 rounded-lg border border-green-100/50">
                    <div className="flex justify-between text-xs text-green-700">
                      <span className="font-sans">🎁 Promo Discount:</span>
                      <span className="font-bold">- ₹{(selectedAppointmentDetails.discountAmount ?? 0).toFixed(2)}</span>
                    </div>
                    {selectedAppointmentDetails.offerName && (
                      <div className="text-[9px] font-sans text-green-600 font-bold uppercase tracking-wider">
                        Offer: {selectedAppointmentDetails.offerName}
                        {selectedAppointmentDetails.discountValue && (
                          <span> ({selectedAppointmentDetails.discountType === 'percentage' ? `${selectedAppointmentDetails.discountValue}%` : `₹${selectedAppointmentDetails.discountValue}`} Off)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Package Applied */}
                {selectedAppointmentDetails.packageName && (
                  <div className="flex justify-between text-xs text-blue-750 bg-blue-50/30 px-2 py-1 rounded-lg border border-blue-100/50">
                    <span className="text-[9px] font-sans uppercase font-bold tracking-wider">📦 Package: {selectedAppointmentDetails.packageName}</span>
                    <span className="text-[9px] font-sans text-blue-500 font-semibold">Applied</span>
                  </div>
                )}

                {/* Horizontal divider */}
                <div className="border-t border-dashed border-gray-250 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800 font-sans">Final Net Amount:</span>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-[#FF0B01]">
                      ₹{(selectedAppointmentDetails.finalAmount ?? selectedAppointmentDetails.totalPrice ?? 0).toFixed(2)}
                    </span>
                    <span className="text-[8px] font-semibold text-gray-400 font-sans uppercase tracking-widest mt-0.5">Calculated & Verified</span>
                  </div>
                </div>
              </div>

              {/* Home Service Address details */}
              {selectedAppointmentDetails.homeService && selectedAppointmentDetails.address && (
                <div className="border border-amber-200 bg-amber-50/20 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    🏠 Home Delivery Address
                  </span>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {selectedAppointmentDetails.address}
                  </p>
                  {(selectedAppointmentDetails.latitude || selectedAppointmentDetails.longitude) && (
                    <div className="text-[9px] font-mono text-gray-400">
                      Coordinates: {selectedAppointmentDetails.latitude || 'N/A'}, {selectedAppointmentDetails.longitude || 'N/A'}
                    </div>
                  )}
                </div>
              )}

              {/* Reason / Notes */}
              {(selectedAppointmentDetails.cancelReason || 
                selectedAppointmentDetails.ownerRescheduleReason || 
                selectedAppointmentDetails.customerRescheduleReason) && (
                <div className="border border-red-100 bg-red-50/10 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-[#FF0B01] uppercase tracking-wider">📝 Reschedule / Cancellation Info</span>
                  {selectedAppointmentDetails.cancelReason && (
                    <div className="text-xs text-gray-750">
                      <span className="font-bold">Cancellation Reason: </span>
                      <span>{selectedAppointmentDetails.cancelReason}</span>
                    </div>
                  )}
                  {selectedAppointmentDetails.ownerRescheduleReason && (
                    <div className="text-xs text-gray-755">
                      <span className="font-bold">Owner Rescheduled: </span>
                      <span>{selectedAppointmentDetails.ownerRescheduleReason}</span>
                    </div>
                  )}
                  {selectedAppointmentDetails.customerRescheduleReason && (
                    <div className="text-xs text-gray-755">
                      <span className="font-bold">Customer Rescheduled: </span>
                      <span>{selectedAppointmentDetails.customerRescheduleReason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 bg-[#FF0B01] hover:bg-[#d90900] transition text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg text-xs tracking-wider uppercase cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fetching loading state indicator overlay */}
      {loadingViewAppointment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3 border border-gray-100">
            <div className="animate-spin h-5 w-5 border-3 border-[#FF0B01] border-t-transparent rounded-full"></div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Fetching details...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Schedule;