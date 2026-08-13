import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

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
  iconTheme: {
    primary: '#ff0b01',
    secondary: '#fff',
  }
};

const Appointments = () => {
  const navigate = useNavigate();
  
  // Detect User Role dynamically
  const customerState = useSelector((state) => state.customer);
  const ownerState = useSelector((state) => state.ownerStaff);

  const isCustomer = customerState.isAuthenticated;
  const currentUser = isCustomer ? customerState.user : ownerState.user;
  const customerId = currentUser?.id || currentUser?.customerId || currentUser?.userId || 1;
  // Read mobile from localStorage or Redux state for appointment filtering
  const customerProfile = (() => { try { return JSON.parse(localStorage.getItem('customerProfile')) || {}; } catch { return {}; } })();
  const customerUser = (() => { try { return JSON.parse(localStorage.getItem('customerUser')) || {}; } catch { return {}; } })();
  const customerMobile = customerProfile.phone || customerProfile.mobile || customerUser.phone || customerUser.mobile || currentUser?.phone || currentUser?.mobile || null;

  const [activeTab, setActiveTab] = useState('TODAY'); // 'TODAY', 'UPCOMING', 'PREVIOUS', 'CANCELLED', 'COMPLETED'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Action States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonType, setCancelReasonType] = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [rescheduleReasonType, setRescheduleReasonType] = useState('');
  const [customRescheduleReason, setCustomRescheduleReason] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);

  const fetchRescheduleSlots = async (dateStr, appointment) => {
    if (!dateStr || !appointment) return;
    setRescheduleSlotsLoading(true);
    try {
      const dateInstant = `${dateStr}T00:00:00.000+05:30`;
      const staffId = appointment.staffId;
      const salonId = appointment.salonId;
      const duration = appointment.serviceDuration || 30;

      let res;
      if (staffId) {
        res = await axiosInstance.get(`/appointments/public/staff/${staffId}/available-slots`, {
          params: {
            salonId,
            durationMinutes: duration,
            selectedDate: dateInstant,
            excludeAppointmentId: appointment.id
          }
        });
      } else {
        res = await axiosInstance.get('/appointments/public/salon-slots', {
          params: {
            salonId,
            selectedDate: dateInstant,
            excludeAppointmentId: appointment.id
          }
        });
      }
      setRescheduleSlots(res.data || []);
    } catch (error) {
      console.error('Failed to fetch slots for rescheduling:', error);
      setRescheduleSlots([]);
    } finally {
      setRescheduleSlotsLoading(false);
    }
  };

  // Mock Stylists for Assignment (Only relevant to Owner)
  const mockStylists = [
    { id: 1, name: 'Gaurav', role: 'Master Stylist', rating: '4.9', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Sneha', role: 'Color Expert', rating: '4.8', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Rohit', role: 'Hair Therapist', rating: '4.7', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { id: 4, name: 'Karan', role: 'Senior Barber', rating: '4.9', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  ];

  const fetchAppointments = async (signal) => {
    setLoading(true);
    try {
      const customerFilter = isCustomer && customerMobile ? `&mobile=${encodeURIComponent(customerMobile)}` : '';
      
      const now = new Date();
      const istTime = new Date(now.getTime() + (330 * 60000));
      const istYear = istTime.getUTCFullYear();
      const istMonth = istTime.getUTCMonth();
      const istDate = istTime.getUTCDate();
      
      const startOfTodayISO = `${istYear}-${String(istMonth + 1).padStart(2, '0')}-${String(istDate).padStart(2, '0')}T00:00:00.000+05:30`;
      const endOfTodayISO = `${istYear}-${String(istMonth + 1).padStart(2, '0')}-${String(istDate).padStart(2, '0')}T23:59:59.999+05:30`;

      let queryParams = `page=${page}&size=10&sort=appointmentAt,desc${customerFilter}`;
      
      if (activeTab === 'TODAY') {
        queryParams += `&status=booked&fromDate=${encodeURIComponent(startOfTodayISO)}&toDate=${encodeURIComponent(endOfTodayISO)}`;
      } else if (activeTab === 'UPCOMING') {
        queryParams += `&status=booked&fromDate=${encodeURIComponent(endOfTodayISO)}`;
      } else if (activeTab === 'PREVIOUS') {
        queryParams += `&status=booked&toDate=${encodeURIComponent(startOfTodayISO)}`;
      } else if (activeTab === 'CANCELLED') {
        queryParams += `&status=cancelled`;
      } else if (activeTab === 'COMPLETED') {
        queryParams += `&status=completed`;
      }

      const response = await axiosInstance.get(`/appointments/search/advanced?${queryParams}`, { signal });
      
      if (!signal?.aborted) {
        setAppointments(response.data?.content || []);
        setTotalElements(response.data?.page?.totalElements || 0);
        setTotalPages(response.data?.page?.totalPages || 1);
      }
    } catch (error) {
      if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
        console.error('Failed to fetch appointments', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Could not load appointments. Please check your network.';
        toast.error(errorMessage, {
          duration: 6000,
          style: { background: '#1c1c1e', color: '#fff', borderRadius: '16px' }
        });
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAppointments(controller.signal);
    return () => {
      controller.abort();
    };
  }, [activeTab, page]);

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

  // Actions
  const handleAssignStaff = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedStaffId(appointment.staffId || null);
    setShowAssignModal(true);
  };

  const confirmAssignStaff = () => {
    const stylist = mockStylists.find(s => s.id === selectedStaffId);
    if (!stylist) return;
    
    // Simulate updating local state
    setAppointments(prev => prev.map(app => {
      if (app.id === selectedAppointment.id) {
        return { ...app, staffId: stylist.id, staffName: stylist.name };
      }
      return app;
    }));
    
    toast.success(`Assigned ${stylist.name} to ${selectedAppointment.customerName}'s appointment!`, {
      style: { background: '#1a1a1a', color: '#fff', borderRadius: '14px' }
    });
    setShowAssignModal(false);
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    // Preset current date & time if available
    const appDate = new Date(appointment.appointmentAt);
    const istAppDate = new Date(appDate.getTime() + (330 * 60000));
    const dateStr = istAppDate.toISOString().split('T')[0];
    const timeStr = istAppDate.toISOString().split('T')[1].slice(0, 5);
    setRescheduleData({ date: dateStr, time: timeStr });
    setRescheduleReasonType('');
    setCustomRescheduleReason('');
    setRescheduleSlots([]);
    setShowRescheduleModal(true);
    fetchRescheduleSlots(dateStr, appointment);
  };

  const confirmReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error('Please select both a date and time.', toastStyle);
      return;
    }

    const selectedReason = rescheduleReasonType === 'Other' 
      ? customRescheduleReason.trim() 
      : rescheduleReasonType;

    if (!selectedReason) {
      toast.error('Please select or specify a reason for rescheduling.', toastStyle);
      return;
    }

    // Convert date + time to IST ZonedDateTime format (YYYY-MM-DDTHH:mm:00+05:30)
    const zonedTime = `${rescheduleData.date}T${rescheduleData.time}:00+05:30`;

    try {
      const params = new URLSearchParams({ newTime: zonedTime });
      const response = await axiosInstance.put(
        `/appointments/${selectedAppointment.id}/reschedule?${params.toString()}`,
        selectedReason
      );

      setAppointments(prev => prev.map(app => {
        if (app.id === selectedAppointment.id) {
          return { 
            ...app, 
            appointmentAt: response.data?.appointmentAt || `${rescheduleData.date}T${rescheduleData.time}:00+05:30`, 
            status: 'rescheduled' 
          };
        }
        return app;
      }));

      toast.success('Appointment rescheduled successfully!', toastStyle);
      setShowRescheduleModal(false);
    } catch (error) {
      console.error('Failed to reschedule:', error);
      const errorMsg = error.response?.data?.message || 'Failed to reschedule appointment.';
      toast.error(errorMsg, toastStyle);
    }
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReasonType('');
    setCustomCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    const selectedReason = cancelReasonType === 'Other'
      ? customCancelReason.trim()
      : cancelReasonType;

    if (!selectedReason) {
      toast.error('Please select or specify a reason for cancellation.', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '14px' }
      });
      return;
    }
    try {
      await axiosInstance.put(
        `/appointments/${selectedAppointment.id}/cancel`,
        selectedReason,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      setAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
      toast.success('Appointment cancelled successfully.', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '14px' }
      });
      setShowCancelModal(false);
      setCancelReasonType('');
      setCustomCancelReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '14px' }
      });
    }
  };

  // Helper to format Date & Time elegantly
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const dateObj = new Date(isoString);
    
    const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

    return {
      date: dateObj.toLocaleDateString('en-US', dateOptions),
      time: dateObj.toLocaleTimeString('en-US', timeOptions)
    };
  };

  // Filtered Appointments based on search query
  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter(app => 
        app?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app?.customerMobile?.includes(searchQuery) ||
        app?.serviceNames?.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];



  const renderAppointmentCard = (app, index) => {
    const { date, time } = formatDateTime(app.appointmentAt);
    const isRescheduled = app.status?.toLowerCase() === 'rescheduled';
    const isInProgress = app.status?.toLowerCase() === 'in_progress';
    
    return (
      <div 
        key={app.id || index}
        className={`py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 ${
          isInProgress ? 'bg-orange-50/30 rounded-2xl px-6 border-l-4 border-orange-500 my-2 shadow-sm' : isRescheduled ? 'bg-amber-50/30 rounded-2xl px-6 border-l-4 border-amber-500 my-2 shadow-sm' : ''
        }`}
      >
        {/* Customer & Info Card */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-50 border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.customerName || 'NP')}&backgroundColor=ffebeb&textColor=ff0b01&fontWeight=800&fontSize=34`}
                alt={app.customerName}
                className="w-full h-full object-cover"
              />
            </div>
            {isRescheduled && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white" title="Rescheduled">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {isInProgress && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs select-none" title="In Progress">
                🔥
              </div>
            )}
          </div>

          {/* Text info */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-gray-900 tracking-tight">{app.customerName}</h3>
              {isRescheduled && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-black tracking-widest uppercase rounded-md shadow-sm border border-amber-200">
                  Rescheduled
                </span>
              )}
              {isInProgress && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[8px] font-black tracking-widest uppercase rounded-md shadow-sm border border-orange-200">
                  In Progress
                </span>
              )}
            </div>
            
            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">
              {app.serviceNames?.join(', ') || 'General Grooming'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 pt-1">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{date}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{time}</span>
              </div>
              
              {app.staffName && (
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Stylist: {app.staffName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-5">
          {/* Price Badge */}
          <div className="text-left sm:text-right pr-4">
            <span className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase block">Final Amount</span>
            <span className="text-lg font-black text-[#ff0b01]">₹{app.finalAmount?.toFixed(2)}</span>
          </div>

          {/* Action buttons (Only for TODAY, UPCOMING, and PREVIOUS tabs) */}
          {(activeTab === 'TODAY' || activeTab === 'UPCOMING' || activeTab === 'PREVIOUS') && !isInProgress && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleReschedule(app)}
                className="flex-1 sm:flex-none px-5 py-3.5 bg-[#ff0b01] text-white font-black tracking-widest text-[9px] rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-[#ff0b01]/10 uppercase"
              >
                Reschedule
              </button>
              
              <button
                onClick={() => handleCancelClick(app)}
                className="flex-1 sm:flex-none px-5 py-3.5 bg-[#858585] text-white font-black tracking-widest text-[9px] rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 active:scale-95 transition-all shadow-md uppercase"
              >
                Cancel
              </button>
              
              {/* Assign Staff Button is ONLY shown to salon Owners */}
              {!isCustomer && (
                <button
                  onClick={() => handleAssignStaff(app)}
                  className="flex-1 sm:flex-none px-5 py-3.5 bg-white text-gray-700 font-black tracking-widest text-[9px] rounded-xl border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Assign Staff
                </button>
              )}
            </div>
          )}

          {/* Action buttons (Only for Completed tab) */}
          {activeTab === 'COMPLETED' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleDownloadInvoice(app.id)}
                className="flex-1 sm:flex-none px-5 py-3.5 bg-green-600 text-white font-black tracking-widest text-[9px] rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-green-600/10 uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };



  const handleBackNavigation = () => {
    navigate(isCustomer ? '/' : '/owner/dashboard');
  };

  const renderMainContent = () => {
    return (
      <>
        {/* Header Container */}
        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Section with Back and Navigation Title */}
          <div className="flex items-center gap-6">
            <button 
              onClick={handleBackNavigation}
              className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff0b01] hover:scale-105 active:scale-95 transition-all"
              title="Go Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                {isCustomer ? 'My Bookings' : 'Bookings'}
              </h1>
              <p className="text-gray-400 font-medium text-sm mt-0.5">
                {isCustomer ? 'Track your salon sessions and scheduling' : 'Manage and monitor customer slots'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text"
              placeholder={isCustomer ? "Search services..." : "Search client, mobile..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-all shadow-sm placeholder:font-medium placeholder-gray-400"
            />
          </div>
        </div>

        {/* Main Tabs Container */}
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="border-b border-gray-100 flex gap-8 md:gap-12 bg-white px-6 rounded-2xl shadow-sm border border-gray-50/50 mb-8 overflow-x-auto whitespace-nowrap">
            {['TODAY', 'UPCOMING', 'PREVIOUS', 'CANCELLED', 'COMPLETED'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(0);
                }}
                className={`py-5 text-xs font-black tracking-[0.25em] transition-all relative ${
                  activeTab === tab ? 'text-gray-900 font-black' : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ff0b01] rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List Container */}
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.02)] p-6 md:p-10 space-y-6">
            
            {loading ? (
              <div className="flex flex-col items-center py-24 gap-4">
                <div className="h-10 w-10 border-[4px] border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Retrieving Bookings</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredAppointments.map((app, index) => renderAppointmentCard(app, index))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p className="text-gray-300 font-black tracking-[0.4em] text-xs uppercase">No Bookings Found</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-gray-400">
                  Showing Page <span className="text-gray-900 font-extrabold">{page + 1}</span> of <span className="text-gray-900 font-extrabold">{totalPages}</span> ({totalElements} bookings)
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-lg border transition-all ${
                      page === 0
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#ff0b01] hover:text-[#ff0b01] hover:bg-red-50/10 shadow-sm active:scale-95'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                    className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-lg border transition-all ${
                      page === totalPages - 1
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#ff0b01] hover:text-[#ff0b01] hover:bg-red-50/10 shadow-sm active:scale-95'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 1. ASSIGN STAFF MODAL (Owner Only) */}
        {!isCustomer && showAssignModal && selectedAppointment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-6">Assign Luxury Stylist</h3>
              
              <div className="space-y-4">
                {mockStylists.map(stylist => (
                  <div 
                    key={stylist.id}
                    onClick={() => setSelectedStaffId(stylist.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedStaffId === stylist.id 
                        ? 'border-[#ff0b01] bg-[#ff0b01]/5 shadow-md shadow-[#ff0b01]/5' 
                        : 'border-gray-100 bg-[#fafafa] hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src={stylist.avatar} alt={stylist.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900">{stylist.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stylist.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">★ {stylist.rating}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black tracking-widest uppercase rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAssignStaff}
                  className="flex-1 py-4 bg-[#ff0b01] hover:bg-red-700 text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-[#ff0b01]/10"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. RESCHEDULE MODAL */}
        {showRescheduleModal && selectedAppointment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-6">Reschedule Slot</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Select New Date</label>
                  <input 
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setRescheduleData(prev => ({ ...prev, date: newDate, time: '' }));
                      fetchRescheduleSlots(newDate, selectedAppointment);
                    }}
                    className="w-full px-6 py-4 bg-[#fafafa] border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Select New Time</label>
                  {rescheduleSlotsLoading ? (
                    <div className="flex items-center justify-center py-4 bg-[#fafafa] border border-gray-100 rounded-xl">
                      <div className="animate-spin h-5 w-5 border-2 border-[#ff0b01] border-t-transparent rounded-full mr-2"></div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Loading slots...</span>
                    </div>
                  ) : rescheduleSlots.length === 0 ? (
                    <div className="text-center py-4 bg-[#fafafa] border border-gray-100 rounded-xl text-xs text-gray-400 font-bold uppercase">
                      No slots available for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-[#fafafa] border border-gray-100 rounded-xl">
                      {rescheduleSlots.map((slot, idx) => {
                        let timeValue = "";
                        try {
                          const dateObj = new Date(slot.startTime);
                          const istDate = new Date(dateObj.getTime() + (330 * 60000));
                          timeValue = istDate.toISOString().split('T')[1].slice(0, 5);
                        } catch (e) {
                          const match = slot.startTime?.match(/T(\d{2}:\d{2})/);
                          timeValue = match ? match[1] : "";
                        }

                        const isSelected = rescheduleData.time === timeValue;

                        return (
                          <button
                            type="button"
                            key={slot.startTime || idx}
                            disabled={slot.busy}
                            onClick={() => setRescheduleData(prev => ({ ...prev, time: timeValue }))}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-bold transition-all duration-300 shadow-sm flex flex-col items-center justify-center ${
                              slot.busy
                                ? 'bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-gradient-to-b from-[#ff0b01] to-red-650 border-transparent text-white shadow-md'
                                : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <span>{slot.displayTime}</span>
                            {slot.discountPercentage > 0 && slot.discountMessage && (
                              <span className={`text-[8px] font-extrabold mt-0.5 px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-white text-[#ff0b01]' : 'bg-green-100 text-green-700'
                              }`}>
                                {slot.discountMessage}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Reason for Rescheduling</label>
                  <select
                    value={rescheduleReasonType}
                    onChange={(e) => setRescheduleReasonType(e.target.value)}
                    className="w-full px-6 py-4 bg-[#fafafa] border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-all font-bold text-gray-800"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="Running late / Stuck in traffic">Running late / Stuck in traffic</option>
                    <option value="Work or school emergency">Work or school emergency</option>
                    <option value="Personal / Family conflict">Personal / Family conflict</option>
                    <option value="Weather / Commute issues">Weather / Commute issues</option>
                    <option value="Found a more convenient time slot">Found a more convenient time slot</option>
                    <option value="Other">Other (Type custom reason)</option>
                  </select>
                </div>

                {rescheduleReasonType === 'Other' && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Custom Reason</label>
                    <textarea
                      value={customRescheduleReason}
                      onChange={(e) => setCustomRescheduleReason(e.target.value)}
                      placeholder="Enter custom reason for rescheduling..."
                      className="w-full px-6 py-4 bg-[#fafafa] border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-all font-bold text-gray-800 h-24 resize-y"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black tracking-widest uppercase rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={confirmReschedule}
                  className="flex-1 py-4 bg-[#ff0b01] hover:bg-red-700 text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-[#ff0b01]/10"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. CANCEL MODAL */}
        {showCancelModal && selectedAppointment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
            <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-red-50 border border-red-100 text-[#ff0b01] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Cancel Appointment</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">Please select a reason for cancelling this appointment.</p>
              
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Cancellation Reason</label>
                  <select
                    value={cancelReasonType}
                    onChange={(e) => setCancelReasonType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#ff0b01] transition-all font-bold text-gray-800"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="Change of plans / Schedule conflict">Change of plans / Schedule conflict</option>
                    <option value="Booked by mistake / Duplicate booking">Booked by mistake / Duplicate booking</option>
                    <option value="Unexpected personal emergency / Illness">Unexpected personal emergency / Illness</option>
                    <option value="Running late / Traffic issues">Running late / Traffic issues</option>
                    <option value="Wanted to change salon or service">Wanted to change salon or service</option>
                    <option value="Preferred stylist is not available">Preferred stylist is not available</option>
                    <option value="No longer needed / Change of mind">No longer needed / Change of mind</option>
                    <option value="Other">Other (Type custom reason)</option>
                  </select>
                </div>

                {cancelReasonType === 'Other' && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Custom Reason</label>
                    <textarea 
                      value={customCancelReason} 
                      onChange={(e) => setCustomCancelReason(e.target.value)} 
                      placeholder="Enter custom reason for cancellation..." 
                      className="w-full border border-gray-200 rounded-xl p-3 h-24 resize-y text-xs mb-2 outline-none focus:border-[#ff0b01] transition-all font-medium bg-[#fafafa]" 
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black tracking-widest uppercase rounded-xl transition-all"
                >
                  No, Keep
                </button>
                <button 
                  type="button"
                  onClick={confirmCancel}
                  className="flex-1 py-4 bg-[#ff0b01] hover:bg-red-700 text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-[#ff0b01]/10"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  if (isCustomer) {
    return (
      <div className="bg-[#fcfcfd] text-gray-900 font-sans pb-16">
        {renderMainContent()}
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto pb-16">
      {renderMainContent()}
    </main>
  );
};

export default Appointments;
