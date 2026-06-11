import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Sidebar from './Layouts/SideBar';
import axiosInstance from '../../api/axiosInstance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// Asset Imports
import upcomingAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/upcoming_appointment_icon.svg';
import todaysAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/todays_appointment_icon.svg';
import appointmentActivityIcon from '../../assets/Owner/Dashboard/CenterScreen/appointment_activity.svg';

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

        const today = new Date();
        const isTodayVal = date.getDate() === today.getDate() &&
                           date.getMonth() === today.getMonth() &&
                           date.getFullYear() === today.getFullYear();

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrowVal = date.getDate() === tomorrow.getDate() &&
                              date.getMonth() === tomorrow.getMonth() &&
                              date.getFullYear() === tomorrow.getFullYear();

        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (isTodayVal) {
            return `Today, ${timeStr}`;
        } else if (isTomorrowVal) {
            return `Tomorrow, ${timeStr}`;
        } else {
            const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            return `${dateStr}, ${timeStr}`;
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

const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const fromDateStr = today.toISOString();

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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const fromDateStr = today.toISOString();

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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const fromDateStr = today.toISOString();

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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const fromDateStr = today.toISOString();

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
                    durationMinutes: durationMinutes || 30
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
    }, [viewType, customStartDate, customEndDate, fetchRevenueData]);

    useEffect(() => {
        const controller = new AbortController();
        fetchUpcomingAppointments(controller.signal);
        fetchCompletedAppointments(controller.signal);
        fetchUnallocatedAppointments(controller.signal);
        fetchCancelledAppointments(controller.signal);
        fetchStaffAvailability(controller.signal);
        return () => {
            controller.abort();
        };
    }, [fetchUpcomingAppointments, fetchCompletedAppointments, fetchUnallocatedAppointments, fetchCancelledAppointments, fetchStaffAvailability]);

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
    const todaysAppointments = upcomingAppointments.filter(appt => isTodayDate(appt.appointmentAt));

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">

            {/* --- TOP NAVBAR --- */}
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* --- MAIN LAYOUT WRAPPER --- */}
            <div className="flex flex-1">

                {/* --- SIDEBAR --- */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* --- MAIN GRID DASHBOARD CANVAS --- */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
                    {/* Workspace Header Title */}
                    <h1 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">Dashboard</h1>

                    {/* Responsive Workspace Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* 1. Revenue Graph Card (Upgraded UI) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[350px]">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Revenue</h3>
                                        <p className="text-[11px] text-gray-400 font-medium capitalize">{viewType} view</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] text-gray-400 font-medium">Total Revenue</p>
                                        <p className="text-2xl font-black text-[#ff0b01]">₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>

                                {/* Pill-shaped Time Filter Tabs */}
                                <div className="flex gap-2 mb-6 mt-3 flex-wrap">
                                    {VIEW_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleViewTypeChange(type)}
                                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
                                                viewType === type
                                                    ? 'bg-[#ff0b01] text-white shadow-lg shadow-red-200 scale-105'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                {viewType === 'custom' && (
                                    <div className="flex items-center space-x-3 mb-6 bg-gray-50 border border-gray-200 p-3 rounded-2xl max-w-md">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">From</label>
                                            <input 
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:border-[#ff0b01] text-gray-700"
                                            />
                                        </div>
                                        <div className="text-gray-300 text-xs mt-4">to</div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">To</label>
                                            <input 
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:border-[#ff0b01] text-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Revenue Chart */}
                            <div className="h-[200px] w-full mt-2">
                                {revenueLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="animate-spin h-8 w-8 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                    </div>
                                ) : revenueData.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                        <p className="text-[12px] font-semibold text-gray-400">No revenue data available</p>
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
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                tickFormatter={(val) => formatLabel(val, viewType)}
                                                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(val) => `₹${val}`}
                                            />
                                            <Tooltip content={<CustomTooltip viewType={viewType} />} />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#ff0b01"
                                                strokeWidth={3}
                                                fill="url(#revenueGradient)"
                                                dot={{ r: 4, fill: '#ff0b01', stroke: '#fff', strokeWidth: 2 }}
                                                activeDot={{ r: 6, fill: '#ff0b01', stroke: '#fff', strokeWidth: 2, className: 'animate-pulse' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* 2. Upcoming Appointments (Booked) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Upcoming Appointments</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Booked sessions status</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/owner/manage/schedule')}
                                    className="text-[#ff0b01] hover:text-red-700 text-[11px] font-black uppercase tracking-wider transition-colors"
                                >
                                    More
                                </button>
                            </div>

                            {upcomingLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin h-7 w-7 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                </div>
                            ) : upcomingAppointments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-6">
                                    <img
                                        src={upcomingAppointmentIcon}
                                        alt="Upcoming Appointments Icon"
                                        className="w-12"
                                    />
                                    <h4 className="text-[14px] font-bold text-gray-800 mt-3">Your Schedule Is Empty</h4>
                                    <p className="text-[11px] font-semibold text-gray-400 max-w-[240px] mt-1.5 leading-relaxed">
                                        No upcoming booked slots found.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[260px] pr-1">
                                    {upcomingAppointments.slice(0, 3).map((appt) => (
                                        <div key={appt.id} className="flex justify-between items-center py-3">
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-800">{appt.customerName}</h4>
                                                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                                    {appt.serviceNames?.join(', ') || 'Service'} • Stylist: {appt.staffName || 'Any'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    {formatAppointmentTime(appt.appointmentAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-black text-[#ff0b01]">₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}</p>
                                                <span className="inline-block text-[9px] bg-red-50 text-[#ff0b01] font-bold px-2 py-0.5 rounded-md mt-1.5 capitalize">
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Completed Appointments Activity Log */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[350px] flex flex-col">
                            <div>
                                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Completed Appointments</h3>
                                <p className="text-[11px] text-gray-400 font-medium mb-4">Feed of successful sessions</p>
                            </div>

                            {completedLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin h-7 w-7 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                </div>
                            ) : completedAppointments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-6">
                                    <img src={appointmentActivityIcon} alt="Log Icon" className="w-10 opacity-40" />
                                    <h4 className="text-[14px] font-bold text-gray-400 mt-3">No Completed Sessions</h4>
                                    <p className="text-[11px] text-gray-300 mt-1">Mark sessions as completed to see activity.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[260px] pr-1">
                                    {completedAppointments.slice(0, 3).map((appt) => (
                                        <div key={appt.id} className="flex justify-between items-center py-3">
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-800">{appt.serviceNames?.join(', ') || 'Service'}</h4>
                                                <div className="flex items-center space-x-1.5 mt-0.5">
                                                    <img
                                                        src={appointmentActivityIcon}
                                                        alt="Log Icon"
                                                        className="w-3.5 h-3.5 object-contain flex-shrink-0"
                                                    />
                                                    <p className="text-[11px] text-gray-400 font-semibold">{appt.customerName} • {formatAppointmentTime(appt.appointmentAt)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-black text-gray-900">₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}</p>
                                                <span className="inline-block text-[9px] bg-[#E3F9EC] text-[#299764] font-bold px-2 py-0.5 rounded-md mt-1.5">Completed</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 4. Unallocated Appointments Panel */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Unallocated Appointments</h3>
                            <p className="text-[11px] text-gray-400 font-medium mb-4">Appointments waiting for staff allocation</p>

                            {unallocatedLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin h-7 w-7 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                </div>
                            ) : unallocatedAppointments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-4">
                                    <img
                                        src={todaysAppointmentIcon}
                                        alt="No Unallocated Appointments Icon"
                                        className="w-12 h-12 object-contain opacity-50"
                                    />
                                    <h4 className="text-[14px] font-bold text-gray-800 mt-3">All Staff Allocated</h4>
                                    <p className="text-[11px] font-semibold text-gray-400 max-w-[240px] mt-1.5 leading-relaxed">
                                        There are no appointments waiting for staff allocation.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[260px] pr-1">
                                    {unallocatedAppointments.map((appt) => (
                                        <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-[13px] font-bold text-gray-900 truncate">{appt.customerName || 'Customer'}</h4>
                                                    {appt.customerMobile && (
                                                        <>
                                                            <span className="text-[10px] text-gray-400 font-semibold">•</span>
                                                            <p className="text-[11px] text-gray-500 font-semibold">{appt.customerMobile}</p>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                                    {appt.serviceNames?.join(', ') || 'Service'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    {formatAppointmentTime(appt.appointmentAt)} • <strong className="text-gray-600">₹{(appt.finalAmount || appt.totalPrice || 0).toFixed(2)}</strong>
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={selectedStaffMap[appt.id] || ''}
                                                    onChange={(e) => setSelectedStaffMap(prev => ({ ...prev, [appt.id]: e.target.value }))}
                                                    onFocus={() => fetchAvailableStaff(appt.id, appt.appointmentAt, appt.durationMinutes)}
                                                    className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#ff0b01] font-semibold text-gray-700 min-w-[130px] h-9"
                                                >
                                                    {staffDropdownLoadingMap[appt.id] ? (
                                                        <option value="">Loading staff...</option>
                                                    ) : (
                                                        <>
                                                            <option value="">-- Select Staff --</option>
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
                                                    className="bg-[#ff0b01] hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 h-9 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-[#ff0b01]"
                                                >
                                                    {assigningMap[appt.id] ? 'Assigning...' : 'Assign'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 5. Stylist Status & Availability */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[350px] flex flex-col">
                            <div>
                                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Stylist Status & Availability</h3>
                                <p className="text-[11px] text-gray-400 font-medium mb-4">Real-time team active status</p>
                            </div>
                            
                            {staffAvailabilityLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin h-7 w-7 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                </div>
                            ) : staffStatusList.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-4">
                                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                    <p className="text-[12px] font-semibold text-gray-400">No staff status available</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[260px] pr-1">
                                    {staffStatusList.map((staff, idx) => (
                                        <div key={staff.id || idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-800 font-bold text-xs border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
                                                    {staff.imageUrl ? (
                                                        <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        staff.name ? staff.name.charAt(0) : 'S'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-gray-800">{staff.name || 'Stylist'}</h4>
                                                    <p className="text-[10px] text-gray-400 font-semibold">
                                                        {(staff.specialization || staff.speciality || 'Stylist')} • {(!staff.rating || Number(staff.rating) === 0) ? 'No rating yet' : `★ ${Number(staff.rating).toFixed(1)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                                    staff.status === 'Available' ? 'bg-[#E3F9EC] text-[#299764]' :
                                                    staff.status === 'In Session' ? 'bg-red-50 text-[#ff0b01]' :
                                                    staff.status === 'On Leave' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {staff.status || 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 6. Cancelled Appointments Panel */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
                            <div>
                                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Cancelled Appointments</h3>
                                <p className="text-[11px] text-gray-400 font-medium mb-4">Booked slots cancelled for today</p>
                            </div>

                            {cancelledLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin h-7 w-7 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                </div>
                            ) : cancelledAppointments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-6">
                                    <img
                                        src={todaysAppointmentIcon}
                                        alt="Cancelled Appointments Icon"
                                        className="w-12 h-12 object-contain opacity-50"
                                    />
                                    <h4 className="text-[14px] font-bold text-gray-400 mt-3">No Cancelled Appointments</h4>
                                    <p className="text-[11px] text-gray-300 mt-1">There are no cancelled slots for today.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[260px] pr-1">
                                    {cancelledAppointments.map((appt) => (
                                        <div key={appt.id} className="flex justify-between items-center py-3">
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-800">{appt.customerName}</h4>
                                                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                                    {appt.serviceNames?.join(', ') || 'Service'} • Stylist: {appt.staffName || 'Any'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    {formatAppointmentTime(appt.appointmentAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-black text-[#ff0b01]">₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}</p>
                                                <span className="inline-block text-[9px] bg-red-50 text-[#ff0b01] font-bold px-2 py-0.5 rounded-md mt-1.5 capitalize">
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* --- SITE FOOTER --- */}
            <Footer />

        </div>
    );
};

export default OwnerDashboard;