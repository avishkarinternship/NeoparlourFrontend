import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCw,
    IndianRupee,
    CreditCard,
    Building2,
    Activity,
    Server,
    ExternalLink,
    ArrowUpRight,
    ShieldCheck,
    Layers,
    LifeBuoy,
    FileText,
    TrendingUp,
    RefreshCw,
    Check,
    Sparkles,
    CalendarRange,
    ChevronRight,
    SlidersHorizontal,
    Scissors,
    Users,
    UserCheck,
    Package,
    Tag,
    Plus,
    ArrowRight,
    LayoutGrid,
    Receipt,
    CalendarPlus,
    AlertCircle
} from 'lucide-react';
import Way2SmartGatewayWidget from '../Admin/Way2SmartGatewayWidget';

// Asset Imports
import upcomingAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/upcoming_appointment_icon.svg';
import todaysAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/todays_appointment_icon.svg';
import appointmentActivityIcon from '../../assets/Owner/Dashboard/CenterScreen/appointment_activity.svg';

const getISTMidnightString = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (330 * 60000));
    const istYear = istTime.getUTCFullYear();
    const istMonth = istTime.getUTCMonth();
    const istDate = istTime.getUTCDate();
    return `${istYear}-${String(istMonth + 1).padStart(2, '0')}-${String(istDate).padStart(2, '0')}T00:00:00.000+05:30`;
};

// Helper to format X-axis labels based on the view type (timezone-safe)
const formatLabel = (label, viewType) => {
    if (!label) return '';
    try {
        // If it's a custom week label (e.g. "Jun week 1"), return it directly
        if (typeof label === 'string' && label.toLowerCase().includes('week')) {
            return label;
        }

        // Handle "YYYY-MM" format timezone-safely (e.g. "2026-05")
        if (viewType === 'year' && /^\d{4}-\d{2}$/.test(label)) {
            const [year, month] = label.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        }
        
        // Handle "YYYY-MM-DD" format timezone-safely (e.g. "2026-06-01")
        if ((viewType === 'month' || viewType === 'week') && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
            const [year, month, day] = label.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }

        const cleanLabel = label.replace('.0', '');
        const date = new Date(cleanLabel.replace(' ', 'T'));
        if (isNaN(date.getTime())) return label;

        switch (viewType) {
            case 'day':
                return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            case 'week':
                return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            case 'month':
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            case 'year':
                return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            default:
                return label;
        }
    } catch {
        return label;
    }
};

// Timezone-safe helper for formatting appointment slot items
const formatAppointmentTime = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const todayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
        const dateStrIST = todayFormatter.format(date);
        const todayStrIST = todayFormatter.format(new Date());

        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStrIST = todayFormatter.format(tomorrowDate);

        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

        if (dateStrIST === todayStrIST) {
            return `Today, ${timeStr}`;
        } else if (dateStrIST === tomorrowStrIST) {
            return `Tomorrow, ${timeStr}`;
        } else {
            const dateDisplayStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
            return `${dateDisplayStr}, ${timeStr}`;
        }
    } catch {
        return dateString;
    }
};

// Premium Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label, viewType }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs border border-white/10">
                <p className="font-semibold text-gray-400 mb-1.5 tracking-wide uppercase text-[9px]">{formatLabel(label, viewType)}</p>
                <p className="font-black text-lg text-[#ff0b01]">₹ {payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        );
    }
    return null;
};

const VIEW_TYPES = ['day', 'week', 'month', 'year', 'custom'];

const getFirstDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
};

const getFirstDayOfYearString = () => {
    const year = new Date().getFullYear();
    return `${year}-01-01`;
};

const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const OwnerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode !== undefined 
      ? outletContext.isDarkMode 
      : document.documentElement.classList.contains('dark');

    const user = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
    const roleStr = String(user?.role || user?.userRole || '').toUpperCase();
    const isAdmin = roleStr === 'ADMIN';

    useEffect(() => {
        if (roleStr === 'SUPPORT_ENGINEER' || roleStr.includes('SUPPORT')) {
            navigate('/admin/support-requests', { replace: true });
        }
    }, [roleStr, navigate]);

    const [adminStats, setAdminStats] = useState({
        totalSalons: 0,
        totalActiveSubscriptions: 0,
        serverStatus: 'checking'
    });
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    const [overviewFromDate, setOverviewFromDate] = useState(getFirstDayOfYearString());
    const [overviewToDate, setOverviewToDate] = useState(getTodayDateString());
    const [datePreset, setDatePreset] = useState('ytd');
    const [lastSyncedTime, setLastSyncedTime] = useState(() => new Date());

    const handleDatePreset = (preset) => {
        setDatePreset(preset);
        const today = getTodayDateString();
        if (preset === 'today') {
            setOverviewFromDate(today);
            setOverviewToDate(today);
        } else if (preset === 'week') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setOverviewFromDate(`${year}-${month}-${day}`);
            setOverviewToDate(today);
        } else if (preset === 'month') {
            setOverviewFromDate(getFirstDayOfMonth());
            setOverviewToDate(today);
        } else if (preset === 'ytd') {
            setOverviewFromDate(getFirstDayOfYearString());
            setOverviewToDate(today);
        }
    };

    const [adminOverview, setAdminOverview] = useState({
        bookedAndRescheduledAppointmentsCount: 0,
        completedAppointmentsCount: 0,
        ongoingAppointmentsCount: 0,
        cancelledAppointmentsCount: 0,
        completedAppointmentsRevenue: 0,
        rescheduledAppointmentsCount: 0,
        subscriptionsRevenue: 0
    });
    const [overviewLoading, setOverviewLoading] = useState(false);

    const fetchAdminOverview = useCallback(async (fromDateStr, toDateStr) => {
        setOverviewLoading(true);
        try {
            const params = {};
            if (fromDateStr) {
                params.fromDate = new Date(fromDateStr + 'T00:00:00.000Z').toISOString();
            }
            if (toDateStr) {
                params.toDate = new Date(toDateStr + 'T23:59:59.999Z').toISOString();
            }

            const response = await axiosInstance.get('/admin/dashboard/overview', { params });
            if (response.data) {
                setAdminOverview(response.data);
            }
        } catch (err) {
            console.warn("Notice: /admin/dashboard/overview returned an error (backend JPQL parameter type resolution). Graceful fallback applied.", err?.response?.data || err?.message);
        } finally {
            setOverviewLoading(false);
        }
    }, []);

    const fetchAdminStats = async () => {
        setLoadingAdmin(true);
        try {
            const [salonsRes, subsRes] = await Promise.allSettled([
                axiosInstance.get('/salons/admin/all', { params: { size: 1 } }),
                axiosInstance.get('/subscriptions/admin/all')
            ]);
            
            let serverUp = 'down';
            try {
                const healthRes = await axiosInstance.get('/subscriptions/plans');
                if (healthRes.status === 200) serverUp = 'up';
            } catch {
                serverUp = 'down';
            }

            const salonsData = salonsRes.status === 'fulfilled' ? salonsRes.value.data : null;
            const subsData = subsRes.status === 'fulfilled' ? subsRes.value.data : null;

            const activeSubsCount = Array.isArray(subsData) ? subsData.filter(s => s.status?.toLowerCase() === 'active').length : 0;

            setAdminStats({
                totalSalons: salonsData?.page?.totalElements ?? salonsData?.totalElements ?? 0,
                totalActiveSubscriptions: activeSubsCount,
                serverStatus: serverUp
            });

            // If overview is not populated yet, set fallback subscription revenue from contracts list
            if (Array.isArray(subsData) && subsData.length > 0) {
                const calcSubRev = subsData.reduce((sum, sub) => sum + (sub.amountPaid || sub.price || 0), 0);
                setAdminOverview(prev => ({
                    ...prev,
                    subscriptionsRevenue: prev.subscriptionsRevenue || calcSubRev
                }));
            }
        } catch (err) {
            console.error("Failed to load admin stats:", err);
        } finally {
            setLoadingAdmin(false);
            setLastSyncedTime(new Date());
        }

        fetchAdminOverview(overviewFromDate, overviewToDate);
    };

    useEffect(() => {
        if (isAdmin) {
            fetchAdminStats();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            fetchAdminOverview(overviewFromDate, overviewToDate);
        }
    }, [isAdmin, overviewFromDate, overviewToDate, fetchAdminOverview]);

    // API states
    const [viewType, setViewType] = useState('day');
    const [customStartDate, setCustomStartDate] = useState(getFirstDayOfMonth());
    const [customEndDate, setCustomEndDate] = useState(getTodayDateString());
    const [revenueData, setRevenueData] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [upcomingLoading, setUpcomingLoading] = useState(false);
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [completedLoading, setCompletedLoading] = useState(false);
    const [cancelledAppointments, setCancelledAppointments] = useState([]);
    const [cancelledLoading, setCancelledLoading] = useState(false);

    // Unallocated appointments states
    const [unallocatedAppointments, setUnallocatedAppointments] = useState([]);
    const [unallocatedLoading, setUnallocatedLoading] = useState(false);
    const [availableStaffMap, setAvailableStaffMap] = useState({});
    const [staffDropdownLoadingMap, setStaffDropdownLoadingMap] = useState({});
    const [selectedStaffMap, setSelectedStaffMap] = useState({});
    const [assigningMap, setAssigningMap] = useState({});

    // Dashboard View Mode & Unified Tab states
    const [dashboardViewMode, setDashboardViewMode] = useState('grid'); // 'grid' | 'tabbed'
    const [activeApptTab, setActiveApptTab] = useState('upcoming'); // 'upcoming' | 'unallocated' | 'completed' | 'cancelled'

    // Active Salon Name for White-labeling
    const activeSalonName = localStorage.getItem('salon_name') || 
                            localStorage.getItem('activeSalonName') || 
                            user?.salonName || 
                            user?.name || 
                            'Salon Owner';

    // Stylist availability list states
    const [staffStatusList, setStaffStatusList] = useState([]);
    const [staffAvailabilityLoading, setStaffAvailabilityLoading] = useState(false);

    // Fetch Revenue Graph Data
    const fetchRevenueData = useCallback(async (type, startDateVal, endDateVal, signal) => {
        setRevenueLoading(true);
        try {
            const params = { viewType: type, onlyOffers: false };
            if (type === 'custom') {
                if (startDateVal) params.startDate = startDateVal;
                if (endDateVal) params.endDate = endDateVal;
            }
            const response = await axiosInstance.get(`/revenue/graph`, {
                params,
                signal
            });
            const data = response.data || [];
            setRevenueData(data);
            const total = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
            setTotalRevenue(total);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch revenue data:', error);
                setRevenueData([]);
                setTotalRevenue(0);
            }
        } finally {
            setRevenueLoading(false);
        }
    }, []);

    // Fetch Live Booked Appointments
    const fetchUpcomingAppointments = useCallback(async (signal) => {
        setUpcomingLoading(true);
        try {
            const fromDateStr = getISTMidnightString();

            const response = await axiosInstance.get('/appointments/search/advanced', {
                params: { status: 'booked', fromDate: fromDateStr, page: 0, size: 3 },
                signal
            });
            setUpcomingAppointments(response.data?.content || []);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch upcoming appointments:', error);
                setUpcomingAppointments([]);
            }
        } finally {
            setUpcomingLoading(false);
        }
    }, []);

    // Fetch Live Completed Appointments
    const fetchCompletedAppointments = useCallback(async (signal) => {
        setCompletedLoading(true);
        try {
            const fromDateStr = getISTMidnightString();

            const response = await axiosInstance.get('/appointments/search/advanced', {
                params: { status: 'completed', fromDate: fromDateStr, page: 0, size: 5 },
                signal
            });
            setCompletedAppointments(response.data?.content || []);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch completed appointments:', error);
                setCompletedAppointments([]);
            }
        } finally {
            setCompletedLoading(false);
        }
    }, []);

    // Fetch Booked Appointments without Allocated Staff
    const fetchUnallocatedAppointments = useCallback(async (signal) => {
        setUnallocatedLoading(true);
        try {
            const fromDateStr = getISTMidnightString();

            const response = await axiosInstance.get('/appointments/search/advanced', {
                params: { status: 'booked', isStaffAllocated: false, fromDate: fromDateStr, page: 0, size: 10 },
                signal
            });
            setUnallocatedAppointments(response.data?.content || []);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch unallocated appointments:', error);
                setUnallocatedAppointments([]);
            }
        } finally {
            setUnallocatedLoading(false);
        }
    }, []);

    // Fetch Live Cancelled Appointments
    const fetchCancelledAppointments = useCallback(async (signal) => {
        setCancelledLoading(true);
        try {
            const fromDateStr = getISTMidnightString();

            const response = await axiosInstance.get('/appointments/search/advanced', {
                params: { status: 'cancelled', fromDate: fromDateStr, page: 0, size: 3 },
                signal
            });
            setCancelledAppointments(response.data?.content || []);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch cancelled appointments:', error);
                setCancelledAppointments([]);
            }
        } finally {
            setCancelledLoading(false);
        }
    }, []);

    // Fetch Available Staff for a specific appointment time slot dynamically
    const fetchAvailableStaff = async (apptId, appointmentAt, durationMinutes) => {
        // Only fetch if we haven't already fetched or if it's currently empty
        if (availableStaffMap[apptId] && availableStaffMap[apptId].length > 0) return;

        setStaffDropdownLoadingMap(prev => ({ ...prev, [apptId]: true }));
        try {
            const response = await axiosInstance.get('/appointments/available-staff', {
                params: {
                    selectedTime: appointmentAt,
                    durationMinutes: durationMinutes
                }
            });
            setAvailableStaffMap(prev => ({ ...prev, [apptId]: response.data || [] }));
        } catch (error) {
            console.error('Failed to fetch available staff:', error);
        } finally {
            setStaffDropdownLoadingMap(prev => ({ ...prev, [apptId]: false }));
        }
    };

    // Assign selected staff member to the appointment
    const handleAssignStaff = async (apptId) => {
        const staffId = selectedStaffMap[apptId];
        if (!staffId) {
            toast.error('Please select a staff member first');
            return;
        }

        setAssigningMap(prev => ({ ...prev, [apptId]: true }));
        try {
            const payload = { staffId: parseInt(staffId) };
            await axiosInstance.put(`/appointments/${apptId}/change-staff`, payload);
            toast.success('Staff assigned successfully');
            
            // Clear maps for this appointment
            setSelectedStaffMap(prev => {
                const copy = { ...prev };
                delete copy[apptId];
                return copy;
            });
            setAvailableStaffMap(prev => {
                const copy = { ...prev };
                delete copy[apptId];
                return copy;
            });

            // Refresh dashboards lists
            fetchUnallocatedAppointments();
            fetchUpcomingAppointments();
        } catch (error) {
            console.error('Failed to assign staff:', error);
        } finally {
            setAssigningMap(prev => ({ ...prev, [apptId]: false }));
        }
    };

    // Fetch Stylist Availability Status
    const fetchStaffAvailability = useCallback(async (signal) => {
        const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
        const salonId = localStorage.getItem('activeSalonId') || ownerUser.tenantName || ownerUser.salonId || ownerUser.user?.salonId || ownerUser.salon?.id;
        if (!salonId) return;

        // Ensure salonId is set in localStorage for subsequent API interceptors
        if (!localStorage.getItem('activeSalonId')) {
            localStorage.setItem('activeSalonId', salonId);
        }

        setStaffAvailabilityLoading(true);
        try {
            const response = await axiosInstance.get('/staff/availability', {
                params: { salonId },
                signal
            });
            setStaffStatusList(response.data || []);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch staff availability:', error);
            }
        } finally {
            setStaffAvailabilityLoading(false);
        }
    }, []);

    // Trigger API fetches
    useEffect(() => {
        if (isAdmin) return;
        const controller = new AbortController();
        
        let shouldCall = true;
        let effectiveEndDate = customEndDate;
        
        if (viewType === 'custom') {
            if (!customStartDate) {
                shouldCall = false;
            } else if (!customEndDate) {
                effectiveEndDate = getTodayDateString();
            }
        }
        
        if (shouldCall) {
            fetchRevenueData(viewType, customStartDate, effectiveEndDate, controller.signal);
        } else {
            setRevenueData([]);
            setTotalRevenue(0);
        }
        
        return () => {
            controller.abort();
        };
    }, [isAdmin, viewType, customStartDate, customEndDate, fetchRevenueData]);

    useEffect(() => {
        if (isAdmin) return;
        const controller = new AbortController();
        fetchUpcomingAppointments(controller.signal);
        fetchCompletedAppointments(controller.signal);
        fetchUnallocatedAppointments(controller.signal);
        fetchCancelledAppointments(controller.signal);
        fetchStaffAvailability(controller.signal);
        return () => {
            controller.abort();
        };
    }, [isAdmin, fetchUpcomingAppointments, fetchCompletedAppointments, fetchUnallocatedAppointments, fetchCancelledAppointments, fetchStaffAvailability]);

    const handleViewTypeChange = (type) => {
        setViewType(type);
    };

    // Filter today's appointments from upcoming booked list
    const isTodayDate = (dateString) => {
        if (!dateString) return false;
        try {
            const date = new Date(dateString);
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        } catch {
            return false;
        }
    };
    const todaysAppointments = Array.isArray(upcomingAppointments)
        ? upcomingAppointments.filter(appt => isTodayDate(appt?.appointmentAt))
        : [];

    if (isAdmin) {
        const totalAppointmentsCount = adminOverview.bookedAndRescheduledAppointmentsCount ?? 0;
        const completedCount = adminOverview.completedAppointmentsCount ?? 0;
        const ongoingCount = adminOverview.ongoingAppointmentsCount ?? 0;
        const rescheduledCount = adminOverview.rescheduledAppointmentsCount ?? 0;
        const cancelledCount = adminOverview.cancelledAppointmentsCount ?? 0;

        // Progress bar percentage calculation
        const activityTotal = completedCount + ongoingCount + rescheduledCount + cancelledCount;
        const completedPct = activityTotal > 0 ? (completedCount / activityTotal) * 100 : 0;
        const ongoingPct = activityTotal > 0 ? (ongoingCount / activityTotal) * 100 : 0;
        const rescheduledPct = activityTotal > 0 ? (rescheduledCount / activityTotal) * 100 : 0;
        const cancelledPct = activityTotal > 0 ? (cancelledCount / activityTotal) * 100 : 0;

        const presets = [
            { id: 'today', label: 'Today' },
            { id: 'week', label: '7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'ytd', label: 'YTD 2026' },
            { id: 'custom', label: 'Custom' },
        ];

        return (
            <main className={`flex-1 p-3 sm:p-6 lg:p-8 transition-colors duration-300 overflow-y-auto max-w-7xl mx-auto w-full font-sans ${
                isDarkMode ? 'bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-gray-900'
            }`}>
                {/* 1. Header & Live Global Control */}
                <div className="mb-5 sm:mb-6 space-y-3.5 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                        <div>
                            <div className="flex items-center justify-between sm:justify-start gap-2 mb-1.5">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                    <span>Core Controller</span>
                                </div>

                                {/* Compact Mobile Sync Button */}
                                <button
                                    onClick={fetchAdminStats}
                                    disabled={loadingAdmin || overviewLoading}
                                    className={`sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition disabled:opacity-50 cursor-pointer ${
                                        isDarkMode 
                                            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800' 
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
                                    }`}
                                    title="Sync System Data"
                                >
                                    <RefreshCw className={`w-3 h-3 ${loadingAdmin || overviewLoading ? 'animate-spin text-red-600' : ''}`} />
                                    <span>{loadingAdmin || overviewLoading ? 'Syncing...' : 'Sync Data'}</span>
                                </button>
                            </div>

                            <h1 className={`text-lg sm:text-2xl font-black tracking-tight uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Admin Control Panel
                            </h1>
                            <p className={`text-[11px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                Real-time platform metrics, salon subscriptions, revenue & gateway.
                            </p>
                        </div>

                        {/* Desktop Sync Button */}
                        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                            <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                                Synced {lastSyncedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                                onClick={fetchAdminStats}
                                disabled={loadingAdmin || overviewLoading}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition disabled:opacity-50 cursor-pointer ${
                                    isDarkMode 
                                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800' 
                                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
                                }`}
                                title="Refresh live backend counters and stats"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loadingAdmin || overviewLoading ? 'animate-spin text-red-600' : ''}`} />
                                <span>{loadingAdmin || overviewLoading ? 'Syncing...' : 'Sync System Data'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Date Presets & Responsive Filter Strip */}
                    <div className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                        isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-gray-200 shadow-2xs'
                    }`}>
                        {/* Presets row */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 shrink-0 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                                Period:
                            </span>
                            {presets.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleDatePreset(p.id)}
                                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                        datePreset === p.id
                                            ? 'bg-red-600 text-white shadow-xs'
                                            : isDarkMode 
                                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800 bg-zinc-800/40' 
                                                : 'text-gray-600 hover:text-gray-900 bg-gray-100/70 hover:bg-gray-100'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Responsive Date Inputs (Never overflows screen!) */}
                        <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5 min-w-0 bg-gray-50 dark:bg-zinc-800/70 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700/80">
                                <span className={`text-[9px] font-black uppercase shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>From</span>
                                <input 
                                    type="date" 
                                    value={overviewFromDate}
                                    onChange={(e) => {
                                        setOverviewFromDate(e.target.value);
                                        setDatePreset('custom');
                                    }}
                                    className={`bg-transparent text-[11px] font-bold w-full min-w-0 outline-none p-0 cursor-pointer ${
                                        isDarkMode ? 'text-zinc-200' : 'text-gray-700'
                                    }`}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0 bg-gray-50 dark:bg-zinc-800/70 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700/80">
                                <span className={`text-[9px] font-black uppercase shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>To</span>
                                <input 
                                    type="date" 
                                    value={overviewToDate}
                                    onChange={(e) => {
                                        setOverviewToDate(e.target.value);
                                        setDatePreset('custom');
                                    }}
                                    className={`bg-transparent text-[11px] font-bold w-full min-w-0 outline-none p-0 cursor-pointer ${
                                        isDarkMode ? 'text-zinc-200' : 'text-gray-700'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Core Executive Platform KPIs: EXACTLY 2 CARDS PER ROW ON MOBILE! */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
                    {/* Card 1: Registered Salons */}
                    <div 
                        onClick={() => navigate('/admin/salons')}
                        className={`p-3 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-red-500/40 shadow-xs' 
                                : 'bg-white border-gray-200 hover:border-red-200 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Salons
                                </span>
                                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition shrink-0 ${
                                    isDarkMode ? 'bg-red-500/10 text-red-400 group-hover:bg-red-600 group-hover:text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
                                }`}>
                                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-xl sm:text-2xl lg:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {loadingAdmin ? '...' : adminStats.totalSalons}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">salons</span>
                            </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className={`truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>KYC & Listings</span>
                            <span className="text-red-600 font-bold flex items-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Active Subscriptions */}
                    <div 
                        onClick={() => navigate('/owner/subscriptions')}
                        className={`p-3 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/40 shadow-xs' 
                                : 'bg-white border-gray-200 hover:border-indigo-200 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Subscriptions
                                </span>
                                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition shrink-0 ${
                                    isDarkMode ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                }`}>
                                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-xl sm:text-2xl lg:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {loadingAdmin ? '...' : adminStats.totalActiveSubscriptions}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">active</span>
                            </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className={`truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Plans & Billing</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Subscriptions Revenue */}
                    <div 
                        className={`p-3 sm:p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 shadow-xs' 
                                : 'bg-white border-gray-200 shadow-2xs'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Sub Revenue
                                </span>
                                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${
                                    isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                    <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-0.5 min-w-0">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">₹</span>
                                <span className={`text-base sm:text-2xl lg:text-3xl font-black truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {overviewLoading ? '...' : (adminOverview.subscriptionsRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className={`truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Salon Appts:</span>
                            <span className="font-bold text-gray-700 dark:text-zinc-300 shrink-0 text-[10px]">
                                ₹{(adminOverview.completedAppointmentsRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Server & API Status */}
                    <div 
                        onClick={() => navigate('/owner/monitoring')}
                        className={`p-3 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-500/40 shadow-xs' 
                                : 'bg-white border-gray-200 hover:border-emerald-200 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Server Health
                                </span>
                                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition shrink-0 ${
                                    isDarkMode ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                }`}>
                                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                {adminStats.serverStatus === 'checking' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                                        Syncing...
                                    </span>
                                ) : adminStats.serverStatus === 'up' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        ONLINE
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        OFFLINE
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className={`truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Grafana Live</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Salon Appointments & Fulfillment Hub */}
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border mb-5 sm:mb-6 transition ${
                    isDarkMode ? 'bg-zinc-900/90 border-zinc-800 shadow-xs' : 'bg-white border-gray-200 shadow-xs'
                }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
                        <div>
                            <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                <Calendar className="w-4 h-4 text-red-600" />
                                <span>Salon Appointment Performance</span>
                            </h2>
                            <p className={`text-[10px] sm:text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                Aggregated booking sessions across salons for selected period
                            </p>
                        </div>
                        <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border ${
                            isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                            Total: <strong className="text-red-600">{totalAppointmentsCount}</strong> Bookings
                        </span>
                    </div>

                    {/* 5-Column Metrics Segment (2-cols on mobile) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                        {/* Booked / Confirmed */}
                        <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
                            isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/70'
                        }`}>
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                <span>Booked</span>
                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <p className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {overviewLoading ? '...' : totalAppointmentsCount}
                            </p>
                            <span className="text-[9px] text-gray-400">Scheduled slots</span>
                        </div>

                        {/* Ongoing */}
                        <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
                            isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/70'
                        }`}>
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-500 mb-1">
                                <span>In Progress</span>
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <p className="text-lg sm:text-xl font-black text-amber-500">
                                {overviewLoading ? '...' : ongoingCount}
                            </p>
                            <span className="text-[9px] text-gray-400">Live in salon</span>
                        </div>

                        {/* Completed */}
                        <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
                            isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/70'
                        }`}>
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-1">
                                <span>Completed</span>
                                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <p className="text-lg sm:text-xl font-black text-emerald-500">
                                {overviewLoading ? '...' : completedCount}
                            </p>
                            <span className="text-[9px] text-gray-400">Finished</span>
                        </div>

                        {/* Rescheduled */}
                        <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
                            isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/70'
                        }`}>
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-purple-500 mb-1">
                                <span>Rescheduled</span>
                                <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <p className="text-lg sm:text-xl font-black text-purple-500">
                                {overviewLoading ? '...' : rescheduledCount}
                            </p>
                            <span className="text-[9px] text-gray-400">Shifted slots</span>
                        </div>

                        {/* Cancelled */}
                        <div className={`p-2.5 sm:p-3.5 rounded-xl border col-span-2 sm:col-span-1 ${
                            isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/70 border-gray-200/70'
                        }`}>
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-red-500 mb-1">
                                <span>Cancelled</span>
                                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <p className="text-lg sm:text-xl font-black text-red-500">
                                {overviewLoading ? '...' : cancelledCount}
                            </p>
                            <span className="text-[9px] text-gray-400">Terminated</span>
                        </div>
                    </div>

                    {/* Fulfillment Visual Distribution Bar */}
                    <div>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1.5 font-semibold">
                            <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>Fulfillment Distribution</span>
                            <span className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                                {activityTotal > 0 ? `${Math.round(completedPct)}% Completed` : 'No activity recorded'}
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 flex">
                            {activityTotal > 0 ? (
                                <>
                                    <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Completed: ${completedCount}`} />
                                    <div style={{ width: `${ongoingPct}%` }} className="bg-amber-400 h-full transition-all" title={`Ongoing: ${ongoingCount}`} />
                                    <div style={{ width: `${rescheduledPct}%` }} className="bg-purple-400 h-full transition-all" title={`Rescheduled: ${rescheduledCount}`} />
                                    <div style={{ width: `${cancelledPct}%` }} className="bg-red-500 h-full transition-all" title={`Cancelled: ${cancelledCount}`} />
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-zinc-800" />
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Way2Smart Messaging & OTP Gateway Monitor Widget */}
                <div className="mb-5 sm:mb-6">
                    <Way2SmartGatewayWidget isDarkMode={isDarkMode} />
                </div>

                {/* 5. Fast Operations & System Observability Hub: EXACTLY 2 CARDS PER ROW ON MOBILE! */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            <Layers className="w-4 h-4 text-red-600" />
                            <span>Observability & Platform Navigation</span>
                        </h2>
                        <span className={`text-[10px] sm:text-[11px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Direct shortcuts</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                        {/* Action 1: Grafana Dashboard */}
                        <div
                            onClick={() => navigate('/owner/monitoring')}
                            className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                                isDarkMode 
                                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-red-500/40 shadow-2xs' 
                                    : 'bg-white border-gray-200 hover:border-red-200 shadow-2xs hover:shadow-xs'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-1.5 sm:p-2 rounded-xl ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                        <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <h3 className={`text-[11px] sm:text-xs font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    System Telemetry
                                </h3>
                                <p className={`text-[10px] sm:text-[11px] mt-1 line-clamp-2 leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Grafana graphs, JVM heap & DB pools.
                                </p>
                            </div>
                        </div>

                        {/* Action 2: Server Logs */}
                        <div
                            onClick={() => navigate('/admin/logs')}
                            className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                                isDarkMode 
                                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/40 shadow-2xs' 
                                    : 'bg-white border-gray-200 hover:border-emerald-200 shadow-2xs hover:shadow-xs'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-1.5 sm:p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <h3 className={`text-[11px] sm:text-xs font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Live Server Logs
                                </h3>
                                <p className={`text-[10px] sm:text-[11px] mt-1 line-clamp-2 leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Stream Spring Boot logs & security events.
                                </p>
                            </div>
                        </div>

                        {/* Action 3: Salons & KYC */}
                        <div
                            onClick={() => navigate('/admin/salons')}
                            className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                                isDarkMode 
                                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-blue-500/40 shadow-2xs' 
                                    : 'bg-white border-gray-200 hover:border-blue-200 shadow-2xs hover:shadow-xs'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-1.5 sm:p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <h3 className={`text-[11px] sm:text-xs font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Salon Approvals
                                </h3>
                                <p className={`text-[10px] sm:text-[11px] mt-1 line-clamp-2 leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Verify GSTIN & trade licenses.
                                </p>
                            </div>
                        </div>

                        {/* Action 4: Support & Escalations */}
                        <div
                            onClick={() => navigate('/admin/support-requests')}
                            className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                                isDarkMode 
                                ? 'bg-zinc-900/80 border-zinc-800 hover:border-purple-500/40 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-purple-200 shadow-2xs hover:shadow-xs'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-1.5 sm:p-2 rounded-xl ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                        <LifeBuoy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <h3 className={`text-[11px] sm:text-xs font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Support Queue
                                </h3>
                                <p className={`text-[10px] sm:text-[11px] mt-1 line-clamp-2 leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    Tier-1 tickets & developer bug queues.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // --- RENDER HELPERS FOR 6 SPACE-OPTIMIZED CARDS ---

    const renderRevenueCard = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue</h3>
                        <p className={`text-[11px] font-medium capitalize ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>{viewType} view</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-[10px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Total Revenue</p>
                        <p className="text-lg sm:text-xl font-black text-[#ff0b01]">₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Pill-shaped Time Filter Tabs */}
                <div className="flex gap-1.5 mb-3 flex-wrap">
                    {VIEW_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => handleViewTypeChange(type)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                                viewType === type
                                    ? 'bg-[#ff0b01] text-white shadow-xs'
                                    : isDarkMode ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/60' : 'bg-slate-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80 shadow-3xs'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {viewType === 'custom' && (
                    <div className={`flex items-center space-x-2 mb-3 border p-2 rounded-xl max-w-sm ${
                        isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex-1 min-w-0">
                            <label className={`text-[8px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>From</label>
                            <input 
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className={`w-full border rounded text-[11px] font-semibold px-2 py-1 focus:outline-none focus:border-[#ff0b01] ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                                }`}
                            />
                        </div>
                        <div className={`text-[10px] mt-3 ${isDarkMode ? 'text-zinc-500' : 'text-gray-300'}`}>to</div>
                        <div className="flex-1 min-w-0">
                            <label className={`text-[8px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>To</label>
                            <input 
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className={`w-full border rounded text-[11px] font-semibold px-2 py-1 focus:outline-none focus:border-[#ff0b01] ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                                }`}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Revenue Chart */}
            <div className="h-[145px] w-full mt-1">
                {revenueLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                    </div>
                ) : revenueData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-2">
                        <svg className={`w-8 h-8 mb-1.5 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>No revenue data available</p>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Billed customer sessions will appear here in real-time</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff0b01" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#ff0b01" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f5f5f5'} vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickFormatter={(val) => formatLabel(val, viewType)}
                                tick={{ fontSize: 9, fill: isDarkMode ? '#94a3b8' : '#9ca3af', fontWeight: 600 }}
                                axisLine={{ stroke: isDarkMode ? '#334155' : '#e5e7eb' }}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickFormatter={(val) => `₹${val}`}
                                tick={{ fontSize: 9, fill: isDarkMode ? '#94a3b8' : '#9ca3af', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip viewType={viewType} />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#ff0b01"
                                strokeWidth={2.5}
                                fill="url(#revenueGradient)"
                                dot={{ r: 3, fill: '#ff0b01', stroke: isDarkMode ? '#0f172a' : '#fff', strokeWidth: 1.5 }}
                                activeDot={{ r: 5, fill: '#ff0b01', stroke: isDarkMode ? '#0f172a' : '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );

    const renderUpcomingAppointmentsCard = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Appointments</h3>
                    <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Booked sessions status</p>
                </div>
                <button 
                    onClick={() => navigate('/owner/manage/schedule')}
                    className="text-[#ff0b01] hover:text-red-700 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 group"
                >
                    <span>More</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
            </div>

            {upcomingLoading ? (
                <div className="flex-1 flex items-center justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                </div>
            ) : upcomingAppointments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 my-auto">
                    <img
                        src={upcomingAppointmentIcon}
                        alt="Upcoming Appointments Icon"
                        className="w-8 h-8 object-contain opacity-70 dark:invert mb-1.5"
                    />
                    <h4 className={`text-[13px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>Your Schedule Is Empty</h4>
                    <p className={`text-[11px] font-medium max-w-[220px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                        No upcoming booked slots found.
                    </p>
                    <button
                        onClick={() => navigate('/owner/manage/walk-in')}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ff0b01] text-white text-[11px] font-bold shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <span>+ Book Walk-in</span>
                    </button>
                </div>
            ) : (
                <div className={`divide-y flex-1 overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                    {upcomingAppointments.slice(0, 4).map((appt) => (
                        <div key={appt.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                            <div className="min-w-0 pr-2">
                                <h4 className={`text-[12px] sm:text-[13px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{appt.customerName}</h4>
                                <p className={`text-[10px] sm:text-[11px] font-semibold truncate mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                    {appt.serviceNames?.join(', ') || 'Service'} • {appt.staffName || 'Any Stylist'}
                                </p>
                                <p className={`text-[9px] sm:text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                                    {formatAppointmentTime(appt.appointmentAt)}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[12px] sm:text-[13px] font-black text-[#ff0b01]">₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}</p>
                                <span className={`inline-block text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 capitalize ${
                                    appt.status === 'in_progress' 
                                        ? 'bg-orange-50 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400' 
                                        : 'bg-red-50 dark:bg-red-950/70 text-[#ff0b01]'
                                }`}>
                                    {appt.status === 'in_progress' ? 'In Progress' : appt.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderUnallocatedAppointmentsCard = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Unallocated Appointments</h3>
                        {unallocatedAppointments.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {unallocatedAppointments.length}
                            </span>
                        )}
                    </div>
                    <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Appointments waiting for staff allocation</p>
                </div>
            </div>

            {unallocatedLoading ? (
                <div className="flex-1 flex items-center justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                </div>
            ) : unallocatedAppointments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 my-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1.5 opacity-80" />
                    <h4 className={`text-[13px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>All Staff Allocated</h4>
                    <p className={`text-[11px] font-medium max-w-[220px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                        There are no appointments waiting for staff allocation.
                    </p>
                </div>
            ) : (
                <div className={`divide-y flex-1 overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                    {unallocatedAppointments.map((appt) => (
                        <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1.5">
                                    <h4 className={`text-[12px] sm:text-[13px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{appt.customerName || 'Customer'}</h4>
                                    {appt.customerMobile && (
                                        <>
                                            <span className="text-[9px] text-gray-400 font-semibold">•</span>
                                            <p className="text-[10px] text-gray-500 font-semibold truncate">{appt.customerMobile}</p>
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                    {appt.serviceNames?.join(', ') || 'Service'} • ₹{(appt.finalAmount || appt.totalPrice || 0).toFixed(0)}
                                </p>
                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                                    {formatAppointmentTime(appt.appointmentAt)}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                                <select
                                    value={selectedStaffMap[appt.id] || ''}
                                    onChange={(e) => setSelectedStaffMap(prev => ({ ...prev, [appt.id]: e.target.value }))}
                                    onFocus={() => fetchAvailableStaff(appt.id, appt.appointmentAt, appt.durationMinutes)}
                                    className={`text-[10px] border rounded-lg px-2 py-1 focus:outline-none focus:border-[#ff0b01] font-semibold min-w-[110px] h-7 ${
                                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                                    }`}
                                >
                                    {staffDropdownLoadingMap[appt.id] ? (
                                        <option value="">Loading...</option>
                                    ) : (
                                        <>
                                            <option value="">Select Staff</option>
                                            {availableStaffMap[appt.id]?.length === 0 ? (
                                                <option value="" disabled>No staff available</option>
                                            ) : (
                                                availableStaffMap[appt.id]?.map((staff) => {
                                                    const staffId = staff.id || staff.staffId;
                                                    const staffName = staff.name || staff.staffName;
                                                    return (
                                                        <option key={staffId} value={staffId}>
                                                            {staffName}
                                                        </option>
                                                    );
                                                })
                                            )}
                                        </>
                                    )}
                                </select>
                                
                                <button
                                    onClick={() => handleAssignStaff(appt.id)}
                                    disabled={!selectedStaffMap[appt.id] || assigningMap[appt.id]}
                                    className="bg-[#ff0b01] hover:bg-red-700 text-white text-[10px] font-bold px-2.5 h-7 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-[#ff0b01] cursor-pointer"
                                >
                                    {assigningMap[appt.id] ? '...' : 'Assign'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStylistAvailabilityCard = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stylist Status & Availability</h3>
                    <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Real-time team active status</p>
                </div>
                <button 
                    onClick={() => navigate('/owner/manage/staff')}
                    className="text-[#ff0b01] hover:text-red-700 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 group"
                >
                    <span>Staff</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
            </div>
            
            {staffAvailabilityLoading ? (
                <div className="flex-1 flex items-center justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                </div>
            ) : staffStatusList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 my-auto">
                    <Users className={`w-8 h-8 mb-1.5 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} />
                    <p className={`text-[12px] font-bold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>No staff status available</p>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Add stylists to track active presence</p>
                </div>
            ) : (
                <div className={`divide-y flex-1 overflow-y-auto max-h-[160px] pr-1 ${
                    isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'
                }`}>
                    {staffStatusList.map((staff, idx) => (
                        <div key={staff.id || idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                            <div className="flex items-center space-x-2.5 min-w-0">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs border shadow-2xs overflow-hidden shrink-0 ${
                                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                                }`}>
                                    <img 
                                        src={staff.imageUrl || staff.imagePath || (staff.gender === 'FEMALE' 
                                            ? 'https://cdn-icons-png.flaticon.com/512/6997/6997671.png'
                                            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png')} 
                                        alt={staff.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`text-[12px] sm:text-[13px] font-bold truncate ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{staff.name || 'Stylist'}</h4>
                                    <p className={`text-[9px] sm:text-[10px] font-semibold truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                        {(staff.specialization || staff.speciality || 'Stylist')} • {(!staff.rating || Number(staff.rating) === 0) ? '★ New' : `★ ${Number(staff.rating).toFixed(1)}`}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 ml-2">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                    staff.status === 'Available' ? (isDarkMode ? 'bg-[#E3F9EC]/10 text-[#299764]' : 'bg-[#E3F9EC] text-[#299764]') :
                                    staff.status === 'In Session' ? (isDarkMode ? 'bg-red-950/40 text-red-400' : 'bg-red-50 text-[#ff0b01]') :
                                    staff.status === 'On Leave' ? (isDarkMode ? 'bg-amber-950/30 text-amber-500' : 'bg-amber-50 text-amber-600') :
                                    isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {staff.status || 'Offline'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCompletedAppointmentsCard = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Completed Appointments</h3>
                    <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Feed of successful sessions</p>
                </div>
                <button 
                    onClick={() => navigate('/owner/appointments')}
                    className="text-[#ff0b01] hover:text-red-700 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 group"
                >
                    <span>All</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
            </div>

            {completedLoading ? (
                <div className="flex-1 flex items-center justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                </div>
            ) : completedAppointments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 my-auto">
                    <img src={appointmentActivityIcon} alt="Log Icon" className="w-8 h-8 opacity-40 dark:invert mb-1.5" />
                    <h4 className={`text-[13px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>No Completed Sessions</h4>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Mark sessions as completed to see activity.</p>
                </div>
            ) : (
                <div className={`divide-y flex-1 overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                    {completedAppointments.slice(0, 4).map((appt) => (
                        <div key={appt.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                            <div className="min-w-0 pr-2">
                                <h4 className={`text-[12px] sm:text-[13px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{appt.serviceNames?.join(', ') || 'Service'}</h4>
                                <div className="flex items-center space-x-1.5 mt-0.5 truncate">
                                    <img
                                        src={appointmentActivityIcon}
                                        alt="Log Icon"
                                        className="w-3 h-3 object-contain shrink-0 opacity-70"
                                    />
                                    <p className={`text-[10px] sm:text-[11px] font-semibold truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>{appt.customerName} • {formatAppointmentTime(appt.appointmentAt)}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-[12px] sm:text-[13px] font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}</p>
                                <span className="inline-block text-[8px] sm:text-[9px] bg-[#E3F9EC] dark:bg-emerald-950/70 text-[#299764] dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md mt-1">Completed</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCancelledAppointmentsCard = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cancelled Appointments</h3>
                    <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Booked slots cancelled for today</p>
                </div>
                <button 
                    onClick={() => navigate('/owner/appointments')}
                    className="text-[#ff0b01] hover:text-red-700 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 group"
                >
                    <span>All</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
            </div>

            {cancelledLoading ? (
                <div className="flex-1 flex items-center justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                </div>
            ) : cancelledAppointments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 my-auto">
                    <img
                        src={todaysAppointmentIcon}
                        alt="Cancelled Appointments Icon"
                        className="w-8 h-8 object-contain opacity-50 mb-1.5"
                    />
                    <h4 className={`text-[13px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>No Cancelled Appointments</h4>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>There are no cancelled slots for today.</p>
                </div>
            ) : (
                <div className={`divide-y flex-1 overflow-y-auto max-h-[160px] pr-1 ${
                    isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'
                }`}>
                    {cancelledAppointments.map((appt) => (
                        <div key={appt.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                            <div className="min-w-0 pr-2">
                                <h4 className={`text-[12px] sm:text-[13px] font-bold truncate ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{appt.customerName}</h4>
                                <p className={`text-[10px] sm:text-[11px] font-semibold truncate mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                    {appt.serviceNames?.join(', ') || 'Service'} • {appt.staffName || 'Any Stylist'}
                                </p>
                                <p className={`text-[9px] sm:text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                                    {formatAppointmentTime(appt.appointmentAt)}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[12px] sm:text-[13px] font-black text-[#ff0b01]">₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}</p>
                                <span className={`inline-block text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 capitalize ${
                                    isDarkMode ? 'bg-red-950/40 text-red-400' : 'bg-red-50 text-[#ff0b01]'
                                }`}>
                                    {appt.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderUnifiedAppointmentsHub = () => (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[250px] transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-sm sm:text-[15px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Appointments Command Hub
                        </h3>
                    </div>
                    <button 
                        onClick={() => navigate('/owner/appointments')}
                        className="text-[#ff0b01] hover:text-red-700 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 group self-start sm:self-auto"
                    >
                        <span>Full Bookings</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                </div>

                {/* Hub Tab Switchers */}
                <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setActiveApptTab('upcoming')}
                        className={`px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeApptTab === 'upcoming'
                                ? 'bg-[#ff0b01] text-white shadow-xs'
                                : isDarkMode ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>Upcoming</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">{upcomingAppointments.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveApptTab('unallocated')}
                        className={`px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeApptTab === 'unallocated'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : isDarkMode ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>Unallocated</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${unallocatedAppointments.length > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-white/20'}`}>
                            {unallocatedAppointments.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveApptTab('completed')}
                        className={`px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeApptTab === 'completed'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isDarkMode ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>Completed</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">{completedAppointments.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveApptTab('cancelled')}
                        className={`px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeApptTab === 'cancelled'
                                ? 'bg-zinc-700 text-white shadow-xs'
                                : isDarkMode ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>Cancelled</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">{cancelledAppointments.length}</span>
                    </button>
                </div>
            </div>

            {/* Tab Content Display */}
            <div className="flex-1">
                {activeApptTab === 'upcoming' && (
                    upcomingLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                        </div>
                    ) : upcomingAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 my-auto">
                            <img src={upcomingAppointmentIcon} alt="Empty" className="w-8 h-8 object-contain opacity-70 dark:invert mb-1" />
                            <h4 className="text-xs font-bold">No upcoming booked slots</h4>
                            <button onClick={() => navigate('/owner/manage/walk-in')} className="mt-2 px-3 py-1 rounded-lg bg-[#ff0b01] text-white text-[10px] font-bold cursor-pointer">+ Book Walk-in</button>
                        </div>
                    ) : (
                        <div className={`divide-y overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                            {upcomingAppointments.map((appt) => (
                                <div key={appt.id} className="flex justify-between items-center py-2">
                                    <div className="min-w-0 pr-2">
                                        <h4 className="text-xs font-bold truncate">{appt.customerName}</h4>
                                        <p className="text-[10px] text-gray-400 truncate">{appt.serviceNames?.join(', ')} • {appt.staffName || 'Any'}</p>
                                        <p className="text-[9px] text-gray-500">{formatAppointmentTime(appt.appointmentAt)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-black text-[#ff0b01]">₹{(appt.finalAmount || appt.totalPrice).toFixed(0)}</p>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/70 text-[#ff0b01] uppercase">{appt.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeApptTab === 'unallocated' && (
                    unallocatedLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                        </div>
                    ) : unallocatedAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 my-auto">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                            <h4 className="text-xs font-bold text-emerald-600">All staff allocated</h4>
                            <p className="text-[10px] text-gray-400">Zero unassigned appointments</p>
                        </div>
                    ) : (
                        <div className={`divide-y overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                            {unallocatedAppointments.map((appt) => (
                                <div key={appt.id} className="flex justify-between items-center py-2 gap-2">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-bold truncate">{appt.customerName}</h4>
                                        <p className="text-[10px] text-gray-400 truncate">{appt.serviceNames?.join(', ')} • {formatAppointmentTime(appt.appointmentAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <select
                                            value={selectedStaffMap[appt.id] || ''}
                                            onChange={(e) => setSelectedStaffMap(prev => ({ ...prev, [appt.id]: e.target.value }))}
                                            onFocus={() => fetchAvailableStaff(appt.id, appt.appointmentAt, appt.durationMinutes)}
                                            className="text-[10px] border rounded px-1.5 py-1 font-semibold dark:bg-zinc-800 dark:border-zinc-700"
                                        >
                                            <option value="">Staff</option>
                                            {availableStaffMap[appt.id]?.map((staff) => (
                                                <option key={staff.id || staff.staffId} value={staff.id || staff.staffId}>{staff.name || staff.staffName}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleAssignStaff(appt.id)}
                                            disabled={!selectedStaffMap[appt.id] || assigningMap[appt.id]}
                                            className="bg-[#ff0b01] text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeApptTab === 'completed' && (
                    completedLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                        </div>
                    ) : completedAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 my-auto">
                            <img src={appointmentActivityIcon} alt="Log" className="w-8 h-8 opacity-40 dark:invert mb-1" />
                            <h4 className="text-xs font-bold">No completed sessions yet</h4>
                        </div>
                    ) : (
                        <div className={`divide-y overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                            {completedAppointments.map((appt) => (
                                <div key={appt.id} className="flex justify-between items-center py-2">
                                    <div className="min-w-0 pr-2">
                                        <h4 className="text-xs font-bold truncate">{appt.serviceNames?.join(', ')}</h4>
                                        <p className="text-[10px] text-gray-400 truncate">{appt.customerName} • {formatAppointmentTime(appt.appointmentAt)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-black">₹{(appt.finalAmount || appt.totalPrice).toFixed(0)}</p>
                                        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded">Completed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeApptTab === 'cancelled' && (
                    cancelledLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                        </div>
                    ) : cancelledAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 my-auto">
                            <img src={todaysAppointmentIcon} alt="Log" className="w-8 h-8 opacity-40 dark:invert mb-1" />
                            <h4 className="text-xs font-bold">Zero cancellations today</h4>
                        </div>
                    ) : (
                        <div className={`divide-y overflow-y-auto max-h-[160px] pr-1 ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'}`}>
                            {cancelledAppointments.map((appt) => (
                                <div key={appt.id} className="flex justify-between items-center py-2">
                                    <div className="min-w-0 pr-2">
                                        <h4 className="text-xs font-bold truncate">{appt.customerName}</h4>
                                        <p className="text-[10px] text-gray-400 truncate">{appt.serviceNames?.join(', ')} • {formatAppointmentTime(appt.appointmentAt)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-black text-[#ff0b01]">₹{(appt.finalAmount || appt.totalPrice).toFixed(0)}</p>
                                        <span className="text-[8px] font-bold text-red-500 bg-red-50 dark:bg-red-950/70 px-1.5 py-0.5 rounded">Cancelled</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );

    return (
        <main className={`flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full bg-transparent min-w-0 transition-colors duration-300 ${
            isDarkMode ? 'text-zinc-100' : 'text-gray-900'
        }`}>
            {/* 1. Welcome Banner & Live Quick Metric Counters */}
            <div className={`p-4 sm:p-5 rounded-2xl border mb-5 transition-all ${
                isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-xs' : 'bg-white border-gray-200 text-gray-900 shadow-2xs'
            }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Salon Operations Hub</span>
                            </span>
                            <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                Live Workspace
                            </span>
                        </div>
                        <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Welcome back, {activeSalonName}!
                        </h1>
                        <p className={`text-xs sm:text-[13px] font-medium mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                            Manage your appointments, track real-time revenue, and operate your salon efficiently.
                        </p>
                    </div>

                    {/* Quick Metric Counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                        <div className={`px-3 py-2 rounded-xl border text-center ${
                            isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-gray-50 border-gray-200/80'
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Today</p>
                            <p className="text-sm sm:text-base font-black text-[#ff0b01]">{todaysAppointments.length}</p>
                        </div>
                        <div className={`px-3 py-2 rounded-xl border text-center ${
                            isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-gray-50 border-gray-200/80'
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Upcoming</p>
                            <p className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">{upcomingAppointments.length}</p>
                        </div>
                        <div className={`px-3 py-2 rounded-xl border text-center ${
                            isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-gray-50 border-gray-200/80'
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Unallocated</p>
                            <p className={`text-sm sm:text-base font-black ${unallocatedAppointments.length > 0 ? 'text-amber-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {unallocatedAppointments.length}
                            </p>
                        </div>
                        <div className={`px-3 py-2 rounded-xl border text-center ${
                            isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-gray-50 border-gray-200/80'
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Completed</p>
                            <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">{completedAppointments.length}</p>
                        </div>
                        <div className={`px-3 py-2 rounded-xl border text-center col-span-2 sm:col-span-1 ${
                            isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-gray-50 border-gray-200/80'
                        }`}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Revenue</p>
                            <p className={`text-sm sm:text-base font-black truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Quick Links to Important Features */}
            <div className="mb-5 sm:mb-6">
                <div className="flex items-center justify-between mb-2.5">
                    <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        <Sparkles className="w-4 h-4 text-[#ff0b01]" />
                        <span>Quick Links & Important Features</span>
                    </h2>
                    <span className={`text-[10px] sm:text-[11px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        1-Click Shortcuts
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
                    {/* 1. Book Walk-in (Primary highlighted action) */}
                    <div
                        onClick={() => navigate('/owner/manage/walk-in')}
                        className="p-3 rounded-2xl bg-[#ff0b01] text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md flex flex-col justify-between group min-h-[92px]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-1.5 rounded-xl bg-white/20 text-white">
                                <CalendarPlus className="w-4 h-4" />
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Book Walk-in</h3>
                            <p className="text-[10px] text-white/80 font-medium truncate">New customer slot</p>
                        </div>
                    </div>

                    {/* 2. Manage Services */}
                    <div
                        onClick={() => navigate('/owner/manage/services')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-pink-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-pink-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
                                <Scissors className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Services</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Prices & catalog</p>
                        </div>
                    </div>

                    {/* 3. Manage Staff */}
                    <div
                        onClick={() => navigate('/owner/manage/staff')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-blue-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-blue-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <Users className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Manage Staff</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Team & stylists</p>
                        </div>
                    </div>

                    {/* 4. Salon Schedule */}
                    <div
                        onClick={() => navigate('/owner/manage/schedule')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-amber-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                                <CalendarRange className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Schedule</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Calendar & slots</p>
                        </div>
                    </div>

                    {/* 5. Billing & Invoices */}
                    <div
                        onClick={() => navigate('/owner/billing')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-emerald-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Receipt className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Billing & POS</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Invoices & GST</p>
                        </div>
                    </div>

                    {/* 6. Customers */}
                    <div
                        onClick={() => navigate('/owner/customers')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-purple-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-purple-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                <UserCheck className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Customers</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Client database</p>
                        </div>
                    </div>

                    {/* 7. Inventory */}
                    <div
                        onClick={() => navigate('/owner/manage/inventory')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-cyan-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-cyan-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                                <Package className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Inventory</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Stock & supplies</p>
                        </div>
                    </div>

                    {/* 8. Offers & Deals */}
                    <div
                        onClick={() => navigate('/owner/manage/add-offers')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between min-h-[92px] active:scale-95 ${
                            isDarkMode 
                                ? 'bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/40 text-zinc-100 shadow-2xs' 
                                : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-900 shadow-2xs hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Tag className="w-4 h-4" />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-xs font-black tracking-tight leading-tight">Offers & Deals</h3>
                            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Promos & combos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Section Header & Layout Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        Operations & Activity Hub
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                        Real-time
                    </span>
                </div>

                {/* View Mode Switcher */}
                <div className={`inline-flex items-center p-1 rounded-xl border text-xs font-bold self-start sm:self-auto ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-3xs'
                }`}>
                    <button
                        type="button"
                        onClick={() => setDashboardViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            dashboardViewMode === 'grid'
                                ? 'bg-[#ff0b01] text-white shadow-xs'
                                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Compact Grid</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDashboardViewMode('tabbed')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            dashboardViewMode === 'tabbed'
                                ? 'bg-[#ff0b01] text-white shadow-xs'
                                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Unified Hub</span>
                    </button>
                </div>
            </div>

            {/* 4. The 6 Operation Cards (Space-Optimized Layout) */}
            {dashboardViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {renderRevenueCard()}
                    {renderUpcomingAppointmentsCard()}
                    {renderUnallocatedAppointmentsCard()}
                    {renderStylistAvailabilityCard()}
                    {renderCompletedAppointmentsCard()}
                    {renderCancelledAppointmentsCard()}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {renderRevenueCard()}
                    {renderUnifiedAppointmentsHub()}
                    <div className="md:col-span-2">
                        {renderStylistAvailabilityCard()}
                    </div>
                </div>
            )}
        </main>
    );
};

export default OwnerDashboard;
