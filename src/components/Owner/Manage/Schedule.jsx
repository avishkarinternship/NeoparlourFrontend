import React, { useState, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { CalendarClock, CheckCircle, XCircle, Eye, X, PlusCircle, Play, Package, Check, Sparkles, Clock, Hourglass, AlertTriangle, Filter, SlidersHorizontal } from 'lucide-react';
import RewardPointsAnimation from '../../common/RewardPointsAnimation';
import BillingSummaryCard from '../../common/BillingSummaryCard';

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

const parseConflictsFromMessage = (msg) => {
  if (!msg) return [];
  const lines = msg.split('\n');
  const conflicts = [];
  lines.forEach(line => {
    if (line.toLowerCase().includes('appointment id')) {
      const idMatch = line.match(/Appointment ID:?\s*(\d+)/i) || line.match(/Appointment\s*#?\s*(\d+)/i) || line.match(/ID:?\s*(\d+)/i);
      const apptId = idMatch ? parseInt(idMatch[1], 10) : null;
      if (apptId) {
        const customerMatch = line.match(/for\s+([A-Za-z\s]+?)\s+at/i) || line.match(/for\s+([A-Za-z\s]+?)\s+collides/i);
        const timeMatch = line.match(/at\s+([0-9:a-zA-Z\s-]+?)(?:\.|$)/i);
        
        let cleanedLine = line.replace(/^\s*-\s*/, '').trim();
        const cleanIdx = cleanedLine.indexOf('. No other');
        if (cleanIdx !== -1) {
          cleanedLine = cleanedLine.substring(0, cleanIdx).trim();
        }
        
        conflicts.push({
          id: apptId,
          lineText: cleanedLine,
          customer: customerMatch ? customerMatch[1].trim() : 'Customer',
          time: timeMatch ? timeMatch[1].trim() : ''
        });
      }
    }
  });
  return conflicts;
};

const Schedule = ({ staffOnlyId, isStaffPortal = false, isDarkMode: isDarkModeProp }) => {
  const outletContext = useOutletContext() || {};
  const isDarkMode = isDarkModeProp !== undefined ? isDarkModeProp : (outletContext.isDarkMode || document.documentElement.classList.contains('dark'));
  const location = useLocation();
  const currentStaffId = staffOnlyId || (isStaffPortal ? (localStorage.getItem('staff_id') || localStorage.getItem('user_id')) : null);

  const [currentSubTab, setCurrentSubTab] = useState('Scheduled');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardAnimationStatus, setRewardAnimationStatus] = useState('success');
  const [rewardAnimationMsg, setRewardAnimationMsg] = useState('');

  // Live Timer & Overdue State
  const [nowTime, setNowTime] = useState(Date.now());
  const [overdueNotified, setOverdueNotified] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getAppointmentTimerInfo = (appt, currentTime) => {
    if (!appt) return null;

    const start = appt.startedAt ? new Date(appt.startedAt) : (appt.appointmentAt ? new Date(appt.appointmentAt) : new Date());
    const durationMins = appt.serviceDuration || appt.durationMinutes || 30;

    let end;
    if (appt.estimatedEndAt) {
      end = new Date(appt.estimatedEndAt);
    } else {
      end = new Date(start.getTime() + durationMins * 60 * 1000);
    }

    const elapsedMs = Math.max(0, currentTime - start.getTime());
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

    const formattedElapsed = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;

    const formattedEstimatedEnd = end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

    const isOverdue = currentTime > end.getTime();
    const overdueMs = isOverdue ? (currentTime - end.getTime()) : 0;
    const is5MinOverdue = overdueMs >= 5 * 60 * 1000;

    return {
      start,
      end,
      durationMins,
      formattedElapsed,
      formattedEstimatedEnd,
      isOverdue,
      overdueMs,
      is5MinOverdue,
      overdueMins: Math.floor(overdueMs / (1000 * 60))
    };
  };

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    appointments.forEach((appt) => {
      if (appt.status?.toLowerCase() === 'in_progress' || appt.status?.toLowerCase() === 'booked' || appt.status?.toLowerCase() === 'confirmed') {
        const timerInfo = getAppointmentTimerInfo(appt, nowTime);
        if (timerInfo && timerInfo.is5MinOverdue && !overdueNotified[appt.id]) {
          toast.error(
            `⚠️ Appointment #${appt.id} for ${appt.customerName || 'Customer'} is ${timerInfo.overdueMins}m past estimated finish time! Is it completed or extended?`,
            { duration: 10000 }
          );
          setOverdueNotified((prev) => ({ ...prev, [appt.id]: true }));
        }
      }
    });
  }, [nowTime, appointments]);

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
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [extraSlotParams, setExtraSlotParams] = useState({});

  // Staff Modal
  const [newStaffId, setNewStaffId] = useState('');

  // View Appointment Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loadingViewAppointment, setLoadingViewAppointment] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);

  // Extend Appointment Modal States
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendAppointment, setExtendAppointment] = useState(null);
  const [extendServices, setExtendServices] = useState([]);
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendConflict, setExtendConflict] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  // Start Appointment Handler
  const handleStartAppointment = async (appt) => {
    try {
      await axiosInstance.put(`/appointments/${appt.id}/confirm`);
      toast.success('Appointment started successfully!', toastStyle);
      fetchAppointments(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start appointment', toastStyle);
    }
  };

  // Opened Products Completion Modal States
  const [showCompletionProductsModal, setShowCompletionProductsModal] = useState(false);
  const [completionAppt, setCompletionAppt] = useState(null);
  const [staffOpenedProducts, setStaffOpenedProducts] = useState([]);
  const [selectedProductUsages, setSelectedProductUsages] = useState([]);
  const [noProductsUsed, setNoProductsUsed] = useState(false);
  const [completionSubmitLoading, setCompletionSubmitLoading] = useState(false);

  const initiateCompletionModal = async (appt) => {
    setCompletionAppt(appt);
    setSelectedProductUsages([]);
    setNoProductsUsed(false);
    setShowCompletionProductsModal(true);

    const activeStaffId = currentStaffId || appt.staffId || localStorage.getItem('staff_id') || localStorage.getItem('user_id');
    if (activeStaffId) {
      try {
        const res = await axiosInstance.get(`/staff-inventory/opened/${activeStaffId}`);
        setStaffOpenedProducts(res.data?.content || res.data || []);
      } catch (err) {
        console.warn('Could not fetch staff opened products:', err);
        setStaffOpenedProducts([]);
      }
    } else {
      setStaffOpenedProducts([]);
    }
  };

  const handleFinalCompletionSubmit = async () => {
    if (!completionAppt) return;
    setCompletionSubmitLoading(true);
    try {
      const usagesPayload = noProductsUsed ? [] : selectedProductUsages;
      await axiosInstance.put(`/appointments/${completionAppt.id}/complete`, {
        openedProductUsages: usagesPayload
      });
      setRewardAnimationStatus('success');
      setRewardAnimationMsg('Reward points & commission successfully collected and added to wallet.');
      setShowRewardAnimation(true);
      toast.success('Appointment marked as completed!', toastStyle);
      setShowCompletionProductsModal(false);
      setCompletionAppt(null);
      fetchAppointments(currentPage);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to complete appointment. Please try again.';
      setRewardAnimationStatus('failure');
      setRewardAnimationMsg(errMsg);
      setShowRewardAnimation(true);
      toast.error(errMsg, toastStyle);
    } finally {
      setCompletionSubmitLoading(false);
    }
  };

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
      const targetStaffId = currentStaffId || filters.staffId;
      if (targetStaffId) params.append('staffId', targetStaffId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      params.append('sort', 'appointmentAt,desc');

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

      if (currentSubTab === 'Scheduled') {
        const fromDateVal = filters.fromDate ? convertToISTZoned(filters.fromDate) : startOfTodayIST;

        const paramsInProgress = new URLSearchParams(params);
        paramsInProgress.append('status', 'in_progress');
        if (fromDateVal) paramsInProgress.append('fromDate', fromDateVal);
        if (filters.toDate) paramsInProgress.append('toDate', convertToISTZoned(filters.toDate));

        const paramsBooked = new URLSearchParams(params);
        paramsBooked.append('status', 'booked');
        if (fromDateVal) paramsBooked.append('fromDate', fromDateVal);
        if (filters.toDate) paramsBooked.append('toDate', convertToISTZoned(filters.toDate));

        const [resInProgress, resBooked] = await Promise.all([
          axiosInstance.get(`/appointments/search/advanced?${paramsInProgress.toString()}`).catch(() => ({ data: { content: [] } })),
          axiosInstance.get(`/appointments/search/advanced?${paramsBooked.toString()}`).catch(() => ({ data: { content: [] } }))
        ]);

        const listInProgress = resInProgress.data?.content || (Array.isArray(resInProgress.data) ? resInProgress.data : []);
        const listBooked = resBooked.data?.content || (Array.isArray(resBooked.data) ? resBooked.data : []);

        const combinedMap = new Map();
        [...listInProgress, ...listBooked].forEach(item => {
          if (item && item.id) combinedMap.set(item.id, item);
        });

        const combinedList = Array.from(combinedMap.values());
        setAppointments(combinedList);

        // Dynamically compute totalPages and totalElements from API response
        const bookedPages = resBooked.data?.page?.totalPages ?? resBooked.data?.totalPages ?? 1;
        const inProgressPages = resInProgress.data?.page?.totalPages ?? resInProgress.data?.totalPages ?? 1;
        const maxPages = Math.max(bookedPages, inProgressPages, 1);

        const bookedElements = resBooked.data?.page?.totalElements ?? resBooked.data?.totalElements ?? listBooked.length;
        const inProgressElements = resInProgress.data?.page?.totalElements ?? resInProgress.data?.totalElements ?? listInProgress.length;
        const totalElems = bookedElements + inProgressElements;

        setTotalPages(maxPages);
        setTotalElements(totalElems);
        setCurrentPage(page);
      } else {
        const status = currentSubTab === 'Past Appointments' ? 'booked'
          : currentSubTab === 'Cancelled' ? 'cancelled' : 'completed';
        params.append('status', status);

        if (filters.fromDate) {
          params.append('fromDate', convertToISTZoned(filters.fromDate));
        }

        if (filters.toDate) {
          params.append('toDate', convertToISTZoned(filters.toDate));
        } else if (currentSubTab === 'Past Appointments') {
          params.append('toDate', startOfTodayIST);
        }

        const response = await axiosInstance.get(`/appointments/search/advanced?${params.toString()}`);
        const data = response.data;
        const contentList = data?.content || (Array.isArray(data) ? data : []);
        const computedPages = data?.page?.totalPages ?? data?.totalPages ?? 1;
        const computedElements = data?.page?.totalElements ?? data?.totalElements ?? contentList.length;

        setAppointments(contentList);
        setTotalPages(computedPages);
        setTotalElements(computedElements);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error('Failed to load appointments', toastStyle);
      setAppointments([]);
      setTotalPages(1);
      setTotalElements(0);
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

  useEffect(() => {
    if (rescheduleDate && selectedAppointment && actionType === 'reschedule') {
      fetchRescheduleSlots(rescheduleDate, selectedAppointment);
    }
  }, [rescheduleDate, selectedAppointment, actionType]);

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
    if (isNaN(date.getTime())) return { date: '', time: '' };

    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const formattedTime = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
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

  const getTodayDateString = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(now);
  };

  const fetchRescheduleSlots = async (dateStr, appointment) => {
    if (!dateStr || !appointment) return;
    setRescheduleSlotsLoading(true);
    try {
      const dateInstant = `${dateStr}T00:00:00.000+05:30`;
      const staffId = appointment.staffId;
      const salonId = appointment.salonId || localStorage.getItem('activeSalonId');
      const duration = appointment.serviceDuration || appointment.durationMinutes || 30;

      let res;
      if (staffId) {
        res = await axiosInstance.get(`/appointments/public/staff/${staffId}/available-slots`, {
          params: {
            salonId,
            durationMinutes: duration,
            selectedDate: dateInstant,
            excludeAppointmentId: appointment.id,
            ...extraSlotParams
          }
        });
      } else {
        res = await axiosInstance.get('/appointments/public/salon-slots', {
          params: {
            salonId,
            selectedDate: dateInstant,
            excludeAppointmentId: appointment.id,
            ...extraSlotParams
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

  const handleAction = async () => {
    const now = Date.now();
    if (!selectedAppointment || actionLoading || (now - lastActionTime < 800)) return;

    let selectedReason = '';

    if (actionType === 'reschedule') {
      if (!selectedRescheduleSlot) {
        toast.error("Please select an available time slot", toastStyle);
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
        const zonedTime = selectedRescheduleSlot.startTime;
        console.log("🚀 Sending to backend (IST):", zonedTime);   // Debug log

        const params = new URLSearchParams({ newTime: zonedTime });
        await axiosInstance.put(
          `/appointments/${selectedAppointment.id}/owner-reschedule?${params.toString()}`,
          selectedReason,
          { headers: { 'Content-Type': 'text/plain' } }
        );
        toast.success('Appointment rescheduled successfully', toastStyle);
      }

      setShowActionModal(false);
      resetActionForm();
      fetchAppointments(currentPage);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Action failed';
      toast.error(errorMsg, toastStyle);
    } finally {
      setActionLoading(false);
    }
  };

  const resetActionForm = () => {
    setNewDateTime('');
    setRescheduleReason('');
    setRescheduleReasonType('');
    setRescheduleDate('');
    setRescheduleSlots([]);
    setSelectedRescheduleSlot(null);
  };

  const openActionModal = (appt, type = 'reschedule', slotParams = {}) => {
    setSelectedAppointment(appt);
    setActionType(type);
    setExtraSlotParams(slotParams);
    resetActionForm();
    if (type === 'reschedule') {
      const today = getTodayDateString();
      setRescheduleDate(today);
      setSelectedRescheduleSlot(null);
      setRescheduleSlots([]);
    }
    setShowActionModal(true);
  };

  const handleComplete = async (appt) => {
    try {
      await axiosInstance.put(`/appointments/${appt.id}/complete`, {});
      setRewardAnimationStatus('success');
      setRewardAnimationMsg('Reward points & commission successfully collected and added to wallet.');
      setShowRewardAnimation(true);
      toast.success('Appointment marked as completed', toastStyle);
      fetchAppointments(currentPage);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to complete appointment. Please try again.';
      setRewardAnimationStatus('failure');
      setRewardAnimationMsg(errMsg);
      setShowRewardAnimation(true);
      toast.error(errMsg, toastStyle);
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
    const istTime = new Date(now.getTime() + (330 * 60000));
    return istTime.toISOString().slice(0, 16);
  };

  // ==================== GAP TIME HELPER ====================
  const getGapMinutes = (appt) => {
    if (!appt.estimatedEndAt || !appt.nextAppointmentAt) return null;
    const end = new Date(appt.estimatedEndAt);
    const next = new Date(appt.nextAppointmentAt);
    const diff = Math.round((next - end) / 60000);
    return diff > 0 ? diff : null;
  };

  // Helper to prevent extending services already present in the appointment
  const isServiceAlreadyInAppointment = (svc, appt) => {
    if (!svc || !appt) return false;

    const svcIdStr = String(svc.id || svc.serviceId || '');
    const svcNameLower = (svc.name || svc.serviceName || '').trim().toLowerCase();

    // 1. Check direct serviceId / serviceName
    if (appt.serviceId && String(appt.serviceId) === svcIdStr) return true;
    if (appt.serviceName && appt.serviceName.trim().toLowerCase() === svcNameLower) return true;

    // 2. Check serviceIds array
    if (Array.isArray(appt.serviceIds) && appt.serviceIds.map(String).includes(svcIdStr)) return true;

    // 3. Check serviceNames array
    if (Array.isArray(appt.serviceNames)) {
      if (appt.serviceNames.some(name => name?.trim().toLowerCase() === svcNameLower)) return true;
    }

    // 4. Check services array of objects
    if (Array.isArray(appt.services)) {
      if (appt.services.some(s => {
        const sId = String(s.id || s.serviceId || '');
        const sName = (s.name || s.serviceName || '').trim().toLowerCase();
        return (sId && sId === svcIdStr) || (sName && sName === svcNameLower);
      })) return true;
    }

    return false;
  };

  // ==================== EXTEND APPOINTMENT ====================
  const openExtendModal = async (appt) => {
    setExtendAppointment(appt);
    setExtendServices([]);
    setExtendConflict(null);
    setServiceSearchQuery('');
    setShowExtendModal(true);
    try {
      const res = await axiosInstance.get('/services');
      setAvailableServices(res.data?.filter(s => s.active !== false) || []);
    } catch {
      setAvailableServices([]);
    }
  };

  const addExtendService = (svc) => {
    if (!svc) return;
    if (isServiceAlreadyInAppointment(svc, extendAppointment)) {
      toast.error(`"${svc.name}" is already part of this appointment.`, toastStyle);
      return;
    }
    if (extendServices.find(s => s.serviceId === String(svc.id))) return;
    setExtendServices(prev => [...prev, {
      serviceId: String(svc.id),
      serviceName: svc.name,
      price: svc.price,
      duration: svc.duration
    }]);
  };

  const removeExtendService = (serviceId) => {
    setExtendServices(prev => prev.filter(s => s.serviceId !== serviceId));
  };

  const handleExtendSubmit = async () => {
    if (!extendAppointment || extendServices.length === 0) {
      toast.error('Please add at least one service to extend', toastStyle);
      return;
    }
    setExtendLoading(true);
    setExtendConflict(null);
    try {
      await axiosInstance.put(`/appointments/${extendAppointment.id}/extend`, {
        services: extendServices,
        offerId: null,
        packageId: null
      });
      toast.success('Appointment extended successfully!', toastStyle);
      setShowExtendModal(false);
      fetchAppointments(currentPage);
    } catch (error) {
      if (error.response?.status === 409) {
        setExtendConflict(error.response.data);
      } else {
        toast.error(error.response?.data?.message || 'Failed to extend appointment', toastStyle);
      }
    } finally {
      setExtendLoading(false);
    }
  };

  const handleRescheduleConflicting = async (apptId) => {
    setShowExtendModal(false);
    try {
      const res = await axiosInstance.get(`/appointments/${apptId}`);
      // Build override params: tell the API that appointment A (being extended)
      // now occupies its original duration + all newly added extension services.
      const existingDuration = extendAppointment?.durationMinutes || extendAppointment?.serviceDuration || 0;
      const addedDuration = extendServices.reduce((sum, s) => sum + (s.duration || 0), 0);
      const newTotalDuration = existingDuration + addedDuration;
      const slotParams = {};
      if (extendAppointment?.id) {
        slotParams.overrideAppointmentId = extendAppointment.id;
        slotParams.overrideDuration = newTotalDuration;
      }
      openActionModal(res.data, 'reschedule', slotParams);
    } catch (error) {
      toast.error("Failed to load conflicting appointment details for rescheduling", toastStyle);
    }
  };

  const handleReassignConflicting = async (apptId) => {
    setShowExtendModal(false);
    try {
      const res = await axiosInstance.get(`/appointments/${apptId}`);
      openStaffModal(res.data);
    } catch (error) {
      toast.error("Failed to load conflicting appointment details for staff re-assignment", toastStyle);
    }
  };

  const renderAppointmentCard = (appt) => {
    const istTime = formatToIST(appt.appointmentAt);
    const isStartedOrInProgress = appt.status?.toLowerCase() === 'in_progress' || appt.status?.toLowerCase() === 'confirmed';

    return (
      <div key={appt.id} className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-3.5 sm:p-5 border rounded-2xl sm:rounded-3xl hover:shadow-md transition-all relative overflow-hidden group pl-5 sm:pl-8 gap-3 sm:gap-4 w-full ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-slate-950/40' 
          : 'bg-white border-gray-100 text-slate-800'
      }`}>
        {/* Left status vertical border indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 sm:w-2.5 ${isStartedOrInProgress ? 'bg-orange-500' : currentSubTab === 'Scheduled' ? 'bg-[#FF0B01]' : currentSubTab === 'Past Appointments' ? 'bg-[#F59E0B]' : currentSubTab === 'Cancelled' ? 'bg-gray-300' : 'bg-green-500'}`}></div>
        
        <div 
          onClick={() => handleViewAppointment(appt.id)}
          className="flex items-start sm:items-center space-x-3 sm:space-x-3.5 cursor-pointer hover:opacity-85 transition-all group/info w-full lg:w-auto"
          title="Click to view details"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200 mt-0.5 sm:mt-0">
            <img src={appt.customerAvatar || profileIcon} alt={appt.customerName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs sm:text-[14px] font-bold tracking-tight group-hover/info:text-[#FF0B01] transition-colors truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{appt.customerName || 'Customer'}</h4>
            <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] font-semibold text-gray-400 mt-0.5 sm:mt-1 flex-wrap gap-y-1">
              <span className={`font-bold max-w-[180px] sm:max-w-none truncate ${
                isDarkMode ? 'text-zinc-300' : 'text-gray-600'
              }`}>{appt.serviceName || (appt.serviceNames && appt.serviceNames.join(", "))}</span>
              <span className="flex items-center text-gray-400 whitespace-nowrap">
                <img src={calendarIcon} alt="Calendar" className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1" />
                {istTime.date}
              </span>
              <span className="flex items-center text-gray-400 whitespace-nowrap">
                <img src={clockIcon} alt="Clock" className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1" />
                {istTime.time} <span className="text-[9px] sm:text-[10px] ml-0.5 sm:ml-1">(IST)</span>
              </span>
              {appt.customerMobile && (
                <span className={`font-medium whitespace-nowrap ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  📞 {appt.customerMobile}
                </span>
              )}
              {appt.staffId && appt.staffName && (
                <span className={`font-semibold flex items-center gap-1 whitespace-nowrap ${isDarkMode ? 'text-purple-300' : 'text-slate-700'}`}>
                  👤 Stylist: {appt.staffName}
                </span>
              )}
            </div>
            {currentSubTab === 'Cancelled' && appt.cancelReason && (
              <div className={`text-[10px] sm:text-[11px] font-bold mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl inline-flex items-center gap-1 break-words max-w-full border ${
                isDarkMode 
                  ? 'bg-rose-950/70 border-rose-900/60 text-rose-400' 
                  : 'bg-red-50/50 border-red-100/50 text-red-600'
              }`}>
                🚫 Cancellation Reason: {appt.cancelReason}
              </div>
            )}
            {currentSubTab === 'Scheduled' && isStartedOrInProgress && (() => {
              const timerInfo = getAppointmentTimerInfo(appt, nowTime);
              if (!timerInfo) return null;

              return (
                <div className="mt-2.5 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Live Timer Badge */}
                    <div className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl inline-flex items-center gap-1.5 border ${
                      isDarkMode 
                        ? 'bg-orange-950/70 border-orange-900/60 text-orange-400' 
                        : 'bg-orange-50 border-orange-200 text-orange-600'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span>In Progress</span>
                    </div>

                    <div className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl inline-flex items-center gap-1 border ${
                      isDarkMode 
                        ? 'bg-zinc-800/90 border-zinc-700 text-zinc-200' 
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <Clock className={`w-3 h-3 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                      <span>Elapsed: {timerInfo.formattedElapsed}</span>
                    </div>

                    {/* Dynamic Estimated Finishing Time Badge */}
                    <div className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl inline-flex items-center gap-1 border transition-all ${
                      timerInfo.is5MinOverdue
                        ? 'bg-rose-600 text-white animate-pulse shadow-xs font-black border-rose-700'
                        : timerInfo.isOverdue
                          ? 'bg-amber-500 text-white animate-pulse border-amber-600'
                          : isDarkMode 
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-900/60' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      <Hourglass className="w-3 h-3" />
                      <span>
                        Est. Finish: {timerInfo.formattedEstFinish}
                        {timerInfo.isOverdue && ` (${timerInfo.overdueMins}m overdue)`}
                      </span>
                    </div>

                    {/* Break gap notice */}
                    {(() => { const gap = getGapMinutes(appt); return gap ? (
                      <div className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl inline-flex items-center gap-1 border ${
                        isDarkMode
                          ? 'bg-indigo-950/70 text-indigo-300 border-indigo-900/60'
                          : 'bg-blue-50/50 text-blue-600 border-blue-100/50'
                      }`}>
                        ⏸ {gap}m break before next appt
                      </div>
                    ) : null; })()}
                  </div>
                </div>
              );
            })()}
            {currentSubTab === 'Scheduled' && !isStartedOrInProgress && (appt.status?.toLowerCase() === 'rescheduled' || appt.ownerRescheduleReason || appt.customerRescheduleReason) && (
              <div className={`text-[10px] sm:text-[11px] font-bold mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl inline-flex items-center gap-1 break-words max-w-full border ${
                isDarkMode 
                  ? 'bg-amber-950/70 text-amber-300 border-amber-900/60' 
                  : 'bg-amber-50/50 text-amber-600 border-amber-100/50'
              }`}>
                🔄 Reschedule Reason: {appt.ownerRescheduleReason || appt.customerRescheduleReason || 'Rescheduled'}
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-between sm:justify-start lg:justify-end text-[10px] font-extrabold uppercase tracking-widest pt-2.5 lg:pt-0 border-t lg:border-t-0 ${
          isDarkMode ? 'border-zinc-800' : 'border-gray-100'
        }`}>
          {/* View Details Eye Button */}
          <button 
            onClick={() => handleViewAppointment(appt.id)} 
            className={`w-8 sm:w-9 h-8 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition shadow-xs cursor-pointer border ${
              isDarkMode
                ? 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-[#FF0B01]'
                : 'bg-gray-50 text-gray-600 hover:text-[#FF0B01] hover:bg-red-50 border-gray-150'
            }`}
            title="View Details"
          >
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          
          {(!isStartedOrInProgress && appt.status?.toLowerCase() !== 'completed' && appt.status?.toLowerCase() !== 'cancelled') && (
            <button 
              onClick={() => handleStartAppointment(appt)} 
              className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 font-bold normal-case text-xs cursor-pointer whitespace-nowrap"
              title="Start Appointment"
            >
              <Play className="w-3.5 h-3.5" />
              Start
            </button>
          )}

          {isStartedOrInProgress && (
            <>
              <button 
                onClick={() => openExtendModal(appt)} 
                className="flex-1 sm:flex-none bg-orange-500 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-orange-600 transition shadow-sm flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer font-bold normal-case text-[11px] sm:text-xs whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm leading-none">➕</span>
                Extend
              </button>
              <button 
                onClick={() => initiateCompletionModal(appt)} 
                className="flex-1 sm:flex-none bg-emerald-600 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer font-bold normal-case text-[11px] sm:text-xs whitespace-nowrap"
              >
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                Complete <span className="hidden xs:inline">Session</span>
              </button>
            </>
          )}

          {(currentSubTab === 'Scheduled' || currentSubTab === 'Past Appointments') && !isStartedOrInProgress && (
            <>
              <button 
                onClick={() => openActionModal(appt, 'reschedule')} 
                className="w-8 sm:w-9 h-8 sm:h-9 flex-shrink-0 flex items-center justify-center bg-[#FF0B01] text-white rounded-xl hover:bg-red-700 transition shadow-sm cursor-pointer"
                title="Reschedule Appointment"
              >
                <CalendarClock className="w-4 h-4" />
              </button>
              {currentSubTab === 'Scheduled' && (
                <button 
                  onClick={() => openExtendModal(appt)} 
                  className="w-8 sm:w-9 h-8 sm:h-9 flex-shrink-0 flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition shadow-sm cursor-pointer"
                  title="Extend Appointment"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => initiateCompletionModal(appt)} 
                className="w-8 sm:w-9 h-8 sm:h-9 flex-shrink-0 flex items-center justify-center bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm cursor-pointer"
                title="Complete Appointment"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => openCancelModal(appt)} 
                className="w-8 sm:w-9 h-8 sm:h-9 flex-shrink-0 flex items-center justify-center bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition shadow-sm cursor-pointer"
                title="Cancel Appointment"
              >
                <XCircle className="w-4 h-4" />
              </button>
              {appt.staffId ? (
                <button onClick={() => openStaffModal(appt)} className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1 transition shadow-2xs text-[11px] sm:text-xs border ${
                  isDarkMode
                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  <img src={assignStaffIcon} alt="Staff" className="w-3.5 h-3.5" /> Change Staff
                </button>
              ) : (
                <button onClick={() => openStaffModal(appt)} className="border border-[#FF0B01] text-[#FF0B01] bg-red-50/20 dark:bg-red-950/40 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-red-50 flex items-center gap-1 transition shadow-2xs text-[11px] sm:text-xs">
                  <img src={assignStaffIcon} alt="Staff" className="w-3.5 h-3.5" style={{ filter: 'invert(15%) sepia(95%) saturate(6935%) hue-rotate(357deg) brightness(95%) contrast(115%)' }} /> Assign Staff
                </button>
              )}
            </>
          )}

          {currentSubTab === 'Completed' && (
            <button 
              onClick={() => handleDownloadInvoice(appt.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 font-bold normal-case text-xs cursor-pointer"
            >
              📄 Invoice
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
        <main className={`flex-1 p-3 sm:p-6 md:p-8 overflow-auto transition-colors duration-300 ${
          isDarkMode ? 'bg-zinc-950 text-zinc-100 md:border-l md:border-zinc-800' : 'bg-white text-slate-800 md:border-l md:border-gray-200'
        }`}>
          {/* Header Bar with Subtabs & Mobile Filter Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 sm:mb-8">
            <div className={`flex gap-1.5 sm:gap-2 p-1 rounded-2xl flex-1 max-w-3xl border shadow-xs overflow-x-auto scrollbar-none transition-colors duration-300 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'
            }`}>
              {['Scheduled', 'Past Appointments', 'Cancelled', 'Completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCurrentSubTab(tab)}
                  className={`flex-1 px-3 sm:px-5 py-2.5 sm:py-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    currentSubTab === tab 
                      ? 'bg-[#FF0B01] text-white shadow-md' 
                      : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xs cursor-pointer border ${
                showMobileFilters
                  ? 'bg-[#FF0B01] text-white border-[#FF0B01]'
                  : isDarkMode
                    ? 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800'
                    : 'bg-white text-slate-800 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-[#FF0B01]" />
              <span>{showMobileFilters ? 'Hide Filters' : 'Filter Appointments'}</span>
              {Object.values(filters).some(Boolean) && (
                <span className="w-2 h-2 rounded-full bg-[#FF0B01] ml-0.5 animate-pulse" />
              )}
            </button>
          </div>

          {/* Advanced Filters (Collapsible on Mobile with Smooth Animation) */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showMobileFilters
              ? 'max-h-[800px] opacity-100 mb-6'
              : 'max-h-0 sm:max-h-none opacity-0 sm:opacity-100 pointer-events-none sm:pointer-events-auto mb-0 sm:mb-8'
          }`}>
            <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md transition-all duration-300 ${
              isDarkMode 
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-slate-950/50 backdrop-blur-xl' 
                : 'bg-white border-gray-100 text-gray-900'
            }`}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Search Filters</h3>
                <div className="flex gap-2 sm:gap-3">
                  <button onClick={resetFilters} className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${isDarkMode ? 'text-zinc-400 hover:text-[#FF0B01]' : 'text-gray-400 hover:text-[#FF0B01]'}`}>Reset</button>
                  <button onClick={handleSearch} className="bg-[#FF0B01] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.985] cursor-pointer">Search</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className={`text-[10px] sm:text-xs font-bold mb-1.5 block uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Mobile Number</label>
                  <input type="text" value={filters.mobile} onChange={(e) => setFilters(prev => ({ ...prev, mobile: e.target.value }))} placeholder="Customer mobile" className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-slate-500 focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white'
                  }`} />
                </div>
                {!isStaffPortal && !staffOnlyId && (
                  <div>
                    <label className={`text-[10px] sm:text-xs font-bold mb-1.5 block uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Staff</label>
                    <div className="relative">
                      <select value={filters.staffId} onChange={(e) => setFilters(prev => ({ ...prev, staffId: e.target.value }))} className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 appearance-none cursor-pointer ${
                        isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white'
                      }`}>
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
                )}
                <div>
                  <label className={`text-[10px] sm:text-xs font-bold mb-1.5 block uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>From Date</label>
                  <input type="datetime-local" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white'
                  }`} />
                </div>
                <div>
                  <label className={`text-[10px] sm:text-xs font-bold mb-1.5 block uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>To Date</label>
                  <input type="datetime-local" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white'
                  }`} />
                </div>
                <div>
                  <label className={`text-[10px] sm:text-xs font-bold mb-1.5 block uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Min Amount (₹)</label>
                  <input type="number" value={filters.minAmount} onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))} placeholder="Minimum" className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-slate-500 focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white'
                  }`} />
                </div>
                <div>
                  <label className={`text-[10px] sm:text-xs font-bold mb-1.5 block uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Max Amount (₹)</label>
                  <input type="number" value={filters.maxAmount} onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))} placeholder="Maximum" className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-slate-500 focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className={`text-center py-12 text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className={`text-center py-12 text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>No appointments found</div>
          ) : currentSubTab === 'Scheduled' ? (
            (() => {
              const inProgressList = appointments.filter(a => a.status?.toLowerCase() === 'in_progress' || a.status?.toLowerCase() === 'confirmed');
              const upcomingList = appointments.filter(a => a.status?.toLowerCase() !== 'in_progress' && a.status?.toLowerCase() !== 'confirmed');

              return (
                <div className="space-y-4 sm:space-y-6 max-w-5xl">
                  {/* Top Section: Active In-Progress Sessions */}
                  {inProgressList.length > 0 && (
                    <div className={`border-2 rounded-2xl sm:rounded-[28px] p-3.5 sm:p-5 shadow-xl backdrop-blur-xl transition-all duration-300 space-y-3 sm:space-y-4 ${
                      isDarkMode 
                        ? 'bg-zinc-900/80 border-orange-500/40 text-zinc-100 shadow-orange-950/20' 
                        : 'bg-gradient-to-r from-orange-50/70 via-red-50/40 to-slate-50 border-orange-200 text-slate-900'
                    }`}>
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${
                        isDarkMode ? 'border-zinc-800' : 'border-orange-200/60'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500 animate-ping flex-shrink-0" />
                          <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight flex items-center gap-2 ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            🔥 Active In-Progress Sessions ({inProgressList.length})
                          </h3>
                        </div>
                        <span className="self-start sm:self-auto px-2.5 py-0.5 sm:px-3 sm:py-1 bg-orange-500 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider rounded-lg sm:rounded-xl shadow-2xs">
                          Live Active
                        </span>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {inProgressList.map(renderAppointmentCard)}
                      </div>
                    </div>
                  )}

                  {/* Bottom Section: Upcoming Scheduled Bookings */}
                  {upcomingList.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {inProgressList.length > 0 && (
                        <h3 className={`text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 pl-1 ${
                          isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          <CalendarClock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#FF0B01]" />
                          Upcoming Scheduled Bookings ({upcomingList.length})
                        </h3>
                      )}
                      {upcomingList.map(renderAppointmentCard)}
                    </div>
                  ) : (
                    inProgressList.length > 0 ? (
                      <div className={`text-center py-6 rounded-2xl border border-dashed font-semibold text-xs transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 backdrop-blur-md' 
                          : 'bg-slate-50 border-slate-200 text-zinc-400'
                      }`}>
                        No additional upcoming bookings scheduled for today.
                      </div>
                    ) : (
                      <div className={`text-center py-12 text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>No appointments found</div>
                    )
                  )}
                </div>
              );
            })()
          ) : (
            <div className="space-y-3 sm:space-y-4 max-w-5xl">
              {appointments.map(renderAppointmentCard)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t ${
              isDarkMode ? 'border-zinc-800 text-zinc-300' : 'border-gray-200 text-gray-600'
            }`}>
              <div className="text-xs font-semibold">
                Showing page <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentPage + 1}</span> of <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalPages}</span>
                {totalElements > 0 && <span className="ml-1">({totalElements.toLocaleString()} total appointments)</span>}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => fetchAppointments(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentPage === 0 || loading
                      ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                      : isDarkMode
                        ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs'
                  }`}
                >
                  Previous
                </button>

                {/* Page Number Buttons */}
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(0, currentPage - 2);
                  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(0, endPage - maxVisible + 1);
                  }

                  if (startPage > 0) {
                    pages.push(
                      <button
                        key={0}
                        type="button"
                        onClick={() => fetchAppointments(0)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        1
                      </button>
                    );
                    if (startPage > 1) {
                      pages.push(<span key="dots-start" className="px-1 text-xs text-gray-400">...</span>);
                    }
                  }

                  for (let p = startPage; p <= endPage; p++) {
                    const isActive = p === currentPage;
                    pages.push(
                      <button
                        key={p}
                        type="button"
                        onClick={() => fetchAppointments(p)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#FF0B01] text-white font-black shadow-md shadow-red-500/20 border-transparent'
                            : isDarkMode
                              ? 'border border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                              : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  }

                  if (endPage < totalPages - 1) {
                    if (endPage < totalPages - 2) {
                      pages.push(<span key="dots-end" className="px-1 text-xs text-gray-400">...</span>);
                    }
                    pages.push(
                      <button
                        key={totalPages - 1}
                        type="button"
                        onClick={() => fetchAppointments(totalPages - 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  return pages;
                })()}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => fetchAppointments(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentPage >= totalPages - 1 || loading
                      ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                      : isDarkMode
                        ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-900'} rounded-2xl border p-6 w-full max-w-md mx-4`}>
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
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-900'} rounded-2xl border p-6 w-full max-w-md mx-4`}>
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">New Date (IST)</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={getTodayDateString()}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Available Slots</label>
                    {rescheduleSlotsLoading ? (
                      <div className="text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider animate-pulse">
                        Loading slots...
                      </div>
                    ) : rescheduleSlots.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                        No slots available for this date
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                        {rescheduleSlots.map((slot, idx) => {
                          const isSelected = selectedRescheduleSlot?.startTime === slot.startTime;
                          return (
                            <button
                              type="button"
                              key={slot.startTime || idx}
                              disabled={slot.busy}
                              onClick={() => setSelectedRescheduleSlot(slot)}
                              className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all duration-200 ${
                                slot.busy
                                  ? 'bg-gray-100 border-gray-200 text-gray-400 line-through cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-500/10'
                                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <span>{slot.displayTime}</span>
                              {slot.discountPercentage > 0 && (
                                <span className={`block text-[8px] font-extrabold ${isSelected ? 'text-white' : 'text-green-600'}`}>
                                  {slot.discountPercentage}% Off
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
              <button type="button" onClick={handleAction} disabled={actionLoading || (actionType === 'reschedule' && !selectedRescheduleSlot)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium disabled:opacity-60">
                {actionLoading ? 'Processing...' : actionType === 'complete' ? 'Mark as Complete' : 'Reschedule Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showStaffModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-900'} rounded-2xl border p-6 w-full max-w-md mx-4`}>
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
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'} rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border p-6 md:p-8 animate-in fade-in zoom-in duration-200`}>
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
                      selectedAppointmentDetails.status === 'in_progress' ? 'bg-orange-500' :
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
                {/* Billing Summary Card */}
                <div className="pt-2">
                  <BillingSummaryCard
                    subtotal={selectedAppointmentDetails.totalPrice ?? 0}
                    discountAmount={selectedAppointmentDetails.discountAmount ?? 0}
                    homeCharge={selectedAppointmentDetails.homeService ? (selectedAppointmentDetails.homeCharge ?? 0) : 0}
                    includeGst={Boolean(selectedAppointmentDetails.includeGstInInvoice || selectedAppointmentDetails.salon?.includeGstInInvoice)}
                    gstin={selectedAppointmentDetails.gstin || selectedAppointmentDetails.salon?.gstin || ''}
                    isDarkMode={isDarkMode}
                  />
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
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-2xl flex items-center gap-3 border`}>
            <div className="animate-spin h-5 w-5 border-3 border-[#FF0B01] border-t-transparent rounded-full"></div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Fetching details...</span>
          </div>
        </div>
      )}

      {/* ===== EXTEND APPOINTMENT MODAL ===== */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'} rounded-3xl shadow-2xl border w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">➕ Extend Appointment</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{extendAppointment?.customerName} · #{extendAppointment?.id}</p>
              </div>
              <button onClick={() => setShowExtendModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Service Search */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 block">Search &amp; Add Services</label>
                <input
                  type="text"
                  placeholder="Search services by name or category..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50/60 hover:bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all"
                />
                {serviceSearchQuery.trim() && (
                  <div className="mt-2 border border-gray-100 rounded-2xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                    {availableServices
                      .filter(s => {
                        const matchesQuery = s.name?.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                          s.category?.toLowerCase().includes(serviceSearchQuery.toLowerCase());
                        const isAlreadyInAppt = isServiceAlreadyInAppointment(s, extendAppointment);
                        const isAlreadyAdded = extendServices.some(added => String(added.serviceId) === String(s.id));
                        return matchesQuery && !isAlreadyInAppt && !isAlreadyAdded;
                      })
                      .slice(0, 12)
                      .map(svc => (
                        <button
                          key={svc.id}
                          onClick={() => { addExtendService(svc); setServiceSearchQuery(''); }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition text-left border-b border-gray-50 last:border-b-0 cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{svc.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{svc.category} · {svc.duration} mins</p>
                          </div>
                          <span className="text-sm font-bold text-orange-600">₹{svc.price}</span>
                        </button>
                      ))}
                    {availableServices.filter(s => {
                        const matchesQuery = s.name?.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                          s.category?.toLowerCase().includes(serviceSearchQuery.toLowerCase());
                        const isAlreadyInAppt = isServiceAlreadyInAppointment(s, extendAppointment);
                        const isAlreadyAdded = extendServices.some(added => String(added.serviceId) === String(s.id));
                        return matchesQuery && !isAlreadyInAppt && !isAlreadyAdded;
                    }).length === 0 && (
                      <div className="px-4 py-4 text-xs text-gray-400 font-medium text-center">No available extension services found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Services */}
              {extendServices.length > 0 && (
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 block">Added Services</label>
                  <div className="space-y-2">
                    {extendServices.map(svc => (
                      <div key={svc.serviceId} className="flex items-center justify-between bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{svc.serviceName}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{svc.duration} mins · ₹{svc.price}</p>
                        </div>
                        <button
                          onClick={() => removeExtendService(svc.serviceId)}
                          className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-700 flex justify-between">
                    <span>Total Added</span>
                    <span>₹{extendServices.reduce((a, s) => a + (s.price || 0), 0)} · {extendServices.reduce((a, s) => a + (s.duration || 0), 0)} mins</span>
                  </div>
                </div>
              )}

              {/* Conflict Warning */}
              {/* Conflict Warning - Interactive Resolution Dialog */}
              {extendConflict && (() => {
                const msg = extendConflict.message || (typeof extendConflict === 'string' ? extendConflict : '');
                const parsedConflicts = parseConflictsFromMessage(msg);

                return (
                  <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm uppercase tracking-wide">
                      <span>⚠️ Staff Conflict Detected</span>
                    </div>

                    <p className="text-xs text-amber-900 font-semibold mb-1">
                      Extending this appointment collides with subsequent appointments:
                    </p>

                    {parsedConflicts.length > 0 ? (
                      <div className="space-y-3.5">
                        {parsedConflicts.map((conflict, idx) => (
                          <div key={conflict.id || idx} className={`${isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-white/90 border-amber-200'} border rounded-2xl p-4 shadow-2xs space-y-3`}>
                            <div className="text-[11px] font-bold text-gray-800 flex items-start gap-1 leading-relaxed">
                              <span>•</span>
                              <span>{conflict.lineText}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleRescheduleConflicting(conflict.id)}
                                className="flex-1 py-2 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                              >
                                🔄 Reschedule Appt #{conflict.id}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReassignConflicting(conflict.id)}
                                className="flex-1 py-2 px-2.5 border border-amber-400 bg-white hover:bg-amber-50 text-amber-800 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                👤 Reassign Staff
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-950 font-medium leading-relaxed">
                        {msg}
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExtendConflict(null)}
                        className="w-full py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel Extension
                      </button>
                    </div>

                    {/* Show suggested alternative staff as a list if provided */}
                    {extendConflict.suggestedStaff && extendConflict.suggestedStaff.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-amber-200">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Available Alternative Staff</p>
                        <div className="space-y-1.5">
                          {extendConflict.suggestedStaff.map(staff => (
                            <div key={staff.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-100">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                {staff.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{staff.name}</p>
                                {staff.specialization && <p className="text-[10px] text-gray-400">{staff.specialization}</p>}
                              </div>
                              <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">Available</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendSubmit}
                disabled={extendLoading || extendServices.length === 0}
                className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {extendLoading ? (
                  <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Extending...</>
                ) : (
                  'Confirm Extension'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== POST-COMPLETION OPENED PRODUCTS MODAL ===== */}
      {showCompletionProductsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'} rounded-3xl shadow-2xl border w-full max-w-lg overflow-hidden relative`}>
            <button
              onClick={() => setShowCompletionProductsModal(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight uppercase">Complete Appointment</h3>
                  <p className="text-xs text-gray-500 font-semibold">{completionAppt?.customerName} · #{completionAppt?.id}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs font-semibold text-amber-900">
                Please select any opened inventory products used during this service session, or choose <strong>"None / No Products Used"</strong>.
              </div>

              {/* None Option Toggle */}
              <div
                onClick={() => {
                  setNoProductsUsed(!noProductsUsed);
                  if (!noProductsUsed) setSelectedProductUsages([]);
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition cursor-pointer ${
                  noProductsUsed
                    ? 'bg-zinc-900 text-white border-slate-900 shadow-md'
                    : 'bg-gray-50/80 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${
                    noProductsUsed ? 'border-white bg-white text-slate-900' : 'border-gray-400'
                  }`}>
                    {noProductsUsed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs uppercase tracking-wider block">None / No Products Used</span>
                    <span className={`text-[10px] ${noProductsUsed ? 'text-gray-300' : 'text-gray-400'}`}>No opened items consumed for this booking</span>
                  </div>
                </div>
              </div>

              {/* Product list (Disabled if noProductsUsed is true) */}
              {!noProductsUsed && (
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">Select Used Opened Products</label>
                  {staffOpenedProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 font-medium italic text-center py-4 bg-gray-50 rounded-2xl">
                      No active opened products in staff inventory.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {staffOpenedProducts.map((prod) => {
                        const existingUsage = selectedProductUsages.find(p => p.staffOpenedProductId === prod.id);
                        const isSelected = !!existingUsage;

                        return (
                          <div
                            key={prod.id}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                              isSelected ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 bg-gray-50/50'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-800">{prod.productName}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Remaining: {prod.remainingQuantity} {prod.unit || 'units'}</p>
                            </div>

                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="Qty used"
                              value={existingUsage?.quantityUsed || ''}
                              className="w-24 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                              onChange={(e) => {
                                const qty = parseFloat(e.target.value);
                                if (!isNaN(qty) && qty > 0) {
                                  setSelectedProductUsages(prev => [
                                    ...prev.filter(p => p.staffOpenedProductId !== prod.id),
                                    { staffOpenedProductId: prod.id, quantityUsed: qty }
                                  ]);
                                } else {
                                  setSelectedProductUsages(prev => prev.filter(p => p.staffOpenedProductId !== prod.id));
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCompletionProductsModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalCompletionSubmit}
                  disabled={completionSubmitLoading}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {completionSubmitLoading ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Completing...</>
                  ) : (
                    'Confirm & Complete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Points Animation Component */}
      <RewardPointsAnimation
        isOpen={showRewardAnimation}
        status={rewardAnimationStatus}
        errorMessage={rewardAnimationMsg}
        onClose={() => setShowRewardAnimation(false)}
        points={50}
        title={rewardAnimationStatus === 'success' ? "Appointment Completed!" : "Completion Failed"}
        subtitle={rewardAnimationMsg || "Reward points successfully collected & added to wallet."}
      />
    </>
  );
};

export default Schedule;