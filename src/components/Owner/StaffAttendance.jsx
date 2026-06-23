import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { 
    Search, Calendar, Check, X, Clock, User, 
    ChevronLeft, ChevronRight, Filter, AlertCircle, 
    CheckCircle2, XCircle, RefreshCw, UserCheck, Users, CalendarDays, ClipboardList
} from 'lucide-react';

import searchIcon from '../../assets/Owner/Attendance/search.svg';
import customOrder from '../../assets/Owner/Attendance/custom_order.svg';

// Helper: format a Date to "YYYY-MM-DD" in local time (avoids UTC shift)
const toLocalISODate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Helper: parse "YYYY-MM-DD" or ISO string into local date parts safely
const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    // Handles "2025-06-17" or "2025-06-17T..." — always treat as local
    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = raw.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StaffAttendance() {
    const today = toLocalISODate(new Date());

    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);   // "YYYY-MM-DD"
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState('LEAVE_REQUEST');
    const [searchQuery, setSearchQuery] = useState('');
    const [staffSummary, setStaffSummary] = useState({ total: 0, present: 0, absent: 0, onLeave: 0 });
    const [leaveStatusFilter, setLeaveStatusFilter] = useState("ALL");
    const [totalStaff, setTotalStaff] = useState(0);
    const [staffList, setStaffList] = useState([]);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const container = scrollContainerRef.current;
            if (container) {
                const todayElement = container.querySelector('[data-today="true"]');
                if (todayElement) {
                    todayElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    /* ─── Leave counts ───────────────────────────────────── */
    const approvedCount = leaveRequests.filter(i => i.status === 'APPROVED').length;
    const pendingCount = leaveRequests.filter(i => i.status === 'PENDING').length;
    const rejectedCount = leaveRequests.filter(i => i.status === 'REJECTED').length;

    /* ─── Allowed Months List (Current month and 3 months prior) ─── */
    const allowedMonthsList = [];
    for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        allowedMonthsList.push({
            month: d.getMonth(),
            year: d.getFullYear(),
            label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`
        });
    }


    /* ─── API calls ──────────────────────────────────────── */
    const fetchLeaveRequests = async () => {
        try {
            const res = await axiosInstance.get('staff-attendance/leave/search', {
                params: { page: 0, size: 100 }
            });
            setLeaveRequests(res.data.content || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAttendanceHistory = async (date) => {
        if (!date) return;
        setAttendanceData([]);
        try {
            const res = await axiosInstance.get('/staff-attendance/search', {
                params: { 
                    startDate: date,
                    endDate: date,
                    page: 0, 
                    size: 200, 
                    sortBy: 'attendanceDate', 
                    sortDir: 'desc' 
                }
            });
            const data = res.data.content || [];
            setAttendanceData(data);
        } catch (e) {
            console.error(e);
            setAttendanceData([]);
        }
    };

    const fetchTotalStaff = async () => {
        try {
            const staffRes = await axiosInstance.get('/staff');
            const data = staffRes.data || [];
            setStaffList(data);
            setTotalStaff(data.length);
        } catch (e) {
            console.error(e);
            setStaffList([]);
        }
    };

    const approveLeave = async (id) => {
        try {
            await axiosInstance.post(`/staff-attendance/leave/${id}/approve`);
            fetchLeaveRequests();
        } catch (e) { console.error(e); }
    };

    const rejectLeave = async (id) => {
        try {
            await axiosInstance.post(`/staff-attendance/leave/${id}/reject`);
            fetchLeaveRequests();
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchLeaveRequests();
        fetchTotalStaff();
    }, []);

    useEffect(() => {
        if (activeTab === 'ATTENDANCE') {
            fetchAttendanceHistory(selectedDate);
        }
    }, [activeTab, selectedDate]);

    useEffect(() => {
        if (activeTab === 'ATTENDANCE') {
            // Count unique present staff
            const presentStaff = attendanceData.filter(
                item => item.status === "PRESENT"
            );

            const uniquePresent = [
                ...new Set(presentStaff.map(item => item.staffId))
            ];

            // Count approved leaves on selected date
            const leaveCount = leaveRequests.filter(leave => {
                if (leave.status !== "APPROVED") return false;

                const start = parseLocalDate(leave.startDate);
                const end = parseLocalDate(leave.endDate);
                const selected = parseLocalDate(selectedDate);

                return selected >= start && selected <= end;
            }).length;

            setStaffSummary({
                total: totalStaff,
                present: uniquePresent.length,
                absent: Math.max(0, totalStaff - uniquePresent.length - leaveCount),
                onLeave: leaveCount
            });
        }
    }, [attendanceData, leaveRequests, activeTab, totalStaff, selectedDate]);

    /* ─── Build the date strip for the current month ─────── */
    // For ATTENDANCE tab: only dates that have data in attendanceData
    // For LEAVE_REQUEST tab: all calendar days of current month

    // unique attendance dates as Set<"YYYY-MM-DD">
    const attendanceDates = new Set(
        attendanceData.map(item => {
            const raw = item.attendanceDate?.includes('T')
                ? item.attendanceDate.split('T')[0]
                : item.attendanceDate;
            return raw;
        })
    );

    // Build all calendar days for the current month/year
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const allCalendarDays = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(currentYear, currentMonth, i + 1);
        return toLocalISODate(d);
    });

    // Strip dates: for ATTENDANCE show only dates with data; for LEAVE_REQUEST show all
    const stripDates = activeTab === 'ATTENDANCE'
        ? allCalendarDays
        : allCalendarDays;

    /* ─── Filter attendance for selected date ────────────── */
    const attendanceForDate = attendanceData.filter(item => {
        const raw = item.attendanceDate?.includes('T')
            ? item.attendanceDate.split('T')[0]
            : item.attendanceDate;
        return raw === selectedDate;
    });

    /* ─── Pending leaves covering selected date ──────────── */
    const pendingLeavesOnDate = leaveRequests.filter(leave => {
        if (leave.status !== 'PENDING') return false;
        const start = parseLocalDate(leave.startDate);
        const end = parseLocalDate(leave.endDate);
        const sel = parseLocalDate(selectedDate);
        if (!start || !end || !sel) return false;
        return sel >= start && sel <= end;
    });

    /* ─── Leave requests filtered by selected date ───────── */
    const leaveRequestsForDate = leaveRequests.filter(leave => {
        const start = parseLocalDate(leave.startDate);
        const end = parseLocalDate(leave.endDate);
        const sel = parseLocalDate(selectedDate);
        if (!start || !end || !sel) return false;
        return sel >= start && sel <= end;
    });

    /* ─── Search filter ──────────────────────────────────── */
    const filteredLeave = leaveRequestsForDate.filter(l => {
        const matchesSearch = searchQuery === "" 
            ? true 
            : String(l.staffId) === String(searchQuery);
        const matchesStatus = leaveStatusFilter === "ALL" ? true : l.status === leaveStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredAttendance = attendanceForDate.filter(a =>
        searchQuery === "" 
            ? true 
            : String(a.staffId) === String(searchQuery)
    );

    /* ─── Status badge helper ────────────────────────────── */
    const statusBadge = (status) => {
        const map = {
            PRESENT: 'bg-emerald-50 text-emerald-700 border border-emerald-100/50',
            ABSENT: 'bg-red-50 text-red-600 border border-red-100/50',
            LATE: 'bg-amber-50 text-amber-700 border border-amber-100/50',
            APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100/50',
            PENDING: 'bg-amber-50 text-amber-700 border border-amber-100/50',
            REJECTED: 'bg-red-50 text-red-600 border border-red-100/50',
        };
        return map[status] || 'bg-gray-50 text-gray-500 border border-gray-100/50';
    };

    /* ─── Format time "HH:MM:SS" → "HH:MM AM/PM" ─────────── */
    const formatTime = (timeStr) => {
        if (!timeStr) return '--';
        const parts = timeStr.split(':');
        let h = parseInt(parts[0], 10);
        const min = parts[1] || '00';
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${min} ${ampm}`;
    };

    /* ─── Selected date display ──────────────────────────── */
    const selectedDateObj = parseLocalDate(selectedDate);
    const selectedDateLabel = selectedDateObj
        ? selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    return (
        <main className="flex-1 p-6 md:p-8 bg-gray-50/30 flex flex-col justify-between overflow-x-hidden min-h-screen">
            <div>
                {/* ── Page Header ───────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            Staff Attendance
                        </h1>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Manage attendance logs & leaves</p>
                    </div>
                </div>

                {/* Sleek Minimalist Tabs */}
                <div className="flex border-b border-gray-200/60 mb-6 gap-8">
                    <button
                        onClick={() => setActiveTab('LEAVE_REQUEST')}
                        className={`pb-3 text-sm font-semibold tracking-wide transition-all relative flex items-center gap-2 cursor-pointer
                            ${activeTab === 'LEAVE_REQUEST'
                                ? 'text-[#FF0B01] border-b-2 border-[#FF0B01]'
                                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
                            }`}
                    >
                        <ClipboardList className="w-4 h-4" />
                        Leave Requests
                        {pendingCount > 0 && (
                            <span className="ml-1 bg-red-50 text-[#FF0B01] text-[10px] font-black rounded-full px-1.5 py-0.5 border border-red-100/50">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('ATTENDANCE')}
                        className={`pb-3 text-sm font-semibold tracking-wide transition-all relative flex items-center gap-2 cursor-pointer
                            ${activeTab === 'ATTENDANCE'
                                ? 'text-[#FF0B01] border-b-2 border-[#FF0B01]'
                                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
                            }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        Attendance Logs
                    </button>
                </div>

                {/* ── Summary cards (Attendance tab only) ───── */}
                {activeTab === 'ATTENDANCE' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                        {[
                            { label: "Total Staff", value: staffSummary.total, color: "text-slate-800", bg: "bg-slate-50", icon: Users },
                            { label: "Present Today", value: staffSummary.present, color: "text-emerald-600", bg: "bg-emerald-50/50", icon: UserCheck },
                            { label: "On Leave", value: staffSummary.onLeave, color: "text-amber-600", bg: "bg-amber-50/50", icon: CalendarDays },
                            { label: "Absent", value: staffSummary.absent, color: "text-red-600", bg: "bg-red-50/50", icon: XCircle }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{card.label}</p>
                                    <p className={`text-3xl font-black ${card.color} mt-1.5`}>{card.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Leave summary cards (Leave Request tab) ─ */}
                {activeTab === 'LEAVE_REQUEST' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                        {[
                            { label: "Pending Requests", value: pendingCount, color: "text-amber-600", bg: "bg-amber-50/50", icon: AlertCircle },
                            { label: "Approved Leaves", value: approvedCount, color: "text-emerald-600", bg: "bg-emerald-50/50", icon: CheckCircle2 },
                            { label: "Rejected Requests", value: rejectedCount, color: "text-red-600", bg: "bg-red-50/50", icon: XCircle }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{card.label}</p>
                                    <p className={`text-3xl font-black ${card.color} mt-1.5`}>{card.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Date Strip ────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-6">
                    {/* Month / Year navigation */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
                        <div>
                            <h2 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Selected Date</h2>
                            <p className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#FF0B01]" />
                                {selectedDateLabel}
                            </p>
                        </div>

                        <div className="flex items-center bg-gray-50 rounded-xl p-2 border border-gray-200 relative">
                            <select
                                value={`${currentMonth}-${currentYear}`}
                                onChange={(e) => {
                                    const [m, y] = e.target.value.split('-').map(Number);
                                    setCurrentMonth(m);
                                    setCurrentYear(y);
                                    const newTodayStr = toLocalISODate(new Date());
                                    const todayObj = parseLocalDate(newTodayStr);
                                    if (y === todayObj.getFullYear() && m === todayObj.getMonth()) {
                                        setSelectedDate(newTodayStr);
                                    } else {
                                        const firstDayStr = toLocalISODate(new Date(y, m, 1));
                                        setSelectedDate(firstDayStr);
                                    }
                                }}
                                className="bg-transparent text-xs text-gray-600 font-bold uppercase tracking-wider outline-none cursor-pointer border-none pr-8 appearance-none"
                            >
                                {allowedMonthsList.map((item, idx) => (
                                    <option key={idx} value={`${item.month}-${item.year}`}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                                ▼
                            </span>
                        </div>
                    </div>

                    {/* Date bubbles */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-hide custom-scrollbar"
                    >
                        {stripDates.map(dateStr => {
                            const d = parseLocalDate(dateStr);
                            const isSelected = selectedDate === dateStr;
                            const isToday = dateStr === today;
                            const hasAttendance = attendanceDates.has(dateStr);
                            const hasPendingLeave = leaveRequests.some(l => {
                                if (l.status !== 'PENDING') return false;
                                const s = parseLocalDate(l.startDate);
                                const e = parseLocalDate(l.endDate);
                                const dt = parseLocalDate(dateStr);
                                return dt >= s && dt <= e;
                            });

                            const isFuture = dateStr > today;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr)}
                                    disabled={isFuture}
                                    data-today={isToday}
                                    className={`flex flex-col items-center min-w-[50px] group transition
                                        ${isFuture ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 transition
                                        ${isToday 
                                            ? 'text-[#FF0B01]' 
                                            : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                    >
                                        {isToday ? 'Today' : (d ? dayNames[d.getDay()] : '')}
                                    </span>
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 relative cursor-pointer
                                            ${isSelected
                                                ? 'bg-[#FF0B01] text-white shadow-md shadow-red-100/50 scale-105'
                                                : isToday
                                                    ? 'bg-red-50 text-[#FF0B01] border-2 border-[#FF0B01] hover:bg-red-100/50'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-red-50/30 hover:text-[#FF0B01]'
                                            }`}
                                    >
                                        {d ? d.getDate() : ''}
                                        {/* dot indicators */}
                                        {(hasAttendance || hasPendingLeave) && !isSelected && (
                                            <span className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full
                                                ${hasPendingLeave ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                            />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                        {stripDates.length === 0 && (
                            <p className="text-xs text-gray-400 py-3 font-semibold uppercase tracking-widest text-center w-full">No dates available for this month.</p>
                        )}
                    </div>
                </div>

                {/* ── Search & Filter Row ───────────────────── */}
                <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-100 shadow-sm">
                    <div className="relative w-full sm:w-80">
                        <div className="relative w-full">
                            <select
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF0B01] focus:ring-4 focus:ring-red-100/10 focus:bg-white transition appearance-none cursor-pointer font-bold text-gray-600"
                            >
                                <option value="">All Staff</option>
                                {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name} (ID: {staff.id})
                                    </option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                                <Users className="w-4 h-4" />
                            </span>
                            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400 text-[10px]">
                                ▼
                            </span>
                        </div>
                    </div>

                    {/* Show filter only in Leave Request tab */}
                    {activeTab === "LEAVE_REQUEST" && (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={leaveStatusFilter}
                                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                                className="bg-transparent text-xs text-gray-600 font-bold uppercase tracking-wider outline-none cursor-pointer border-none"
                            >
                                <option value="ALL">All Requests</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* ── Pending leave banner ── */}
                {pendingLeavesOnDate.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600 mt-0.5 border border-amber-200/50">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-amber-800 font-bold text-sm">
                                {pendingLeavesOnDate.length} pending leave request{pendingLeavesOnDate.length > 1 ? 's' : ''} on this date
                            </p>
                            <p className="text-amber-600/90 text-xs font-semibold mt-1">
                                Staff ID{pendingLeavesOnDate.length > 1 ? 's' : ''}: {pendingLeavesOnDate.map(l => l.staffId).join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── LEAVE REQUEST TAB ── */}
                {activeTab === 'LEAVE_REQUEST' && (
                    <>
                        {filteredLeave.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
                                <p className="text-sm font-semibold uppercase tracking-wider">No leave requests for this date</p>
                                <p className="text-xs text-gray-400 mt-1">Select another date or check filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {filteredLeave.map(leave => (
                                    <div
                                        key={leave.id}
                                        className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between
                                            ${leave.status === 'PENDING' ? 'border-amber-200 ring-1 ring-amber-100/50' : 'border-gray-100'}`}
                                    >
                                        <div>
                                            {/* Card Header */}
                                            <div className="flex justify-between items-start mb-4 gap-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#FF0B01] font-bold text-sm flex-shrink-0 border border-red-100/50">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm leading-tight truncate">
                                                            {leave.staffName || `Staff #${leave.staffId}`}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: {leave.staffId}</p>
                                                    </div>
                                                </div>

                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusBadge(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </div>

                                            {/* Leave Type */}
                                            {leave.leaveType && (
                                                <div className="mb-4">
                                                    <span className="text-[10px] bg-red-50 text-[#FF0B01] px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider border border-red-100/30">
                                                        {leave.leaveType}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Date Range */}
                                            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 mb-4 space-y-2.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        Start
                                                    </span>
                                                    <span className="font-bold text-gray-700">
                                                        {parseLocalDate(leave.startDate)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || '--'}
                                                    </span>
                                                </div>
                                                <div className="w-full h-px bg-gray-200/50" />
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        End
                                                    </span>
                                                    <span className="font-bold text-gray-700">
                                                        {parseLocalDate(leave.endDate)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || '--'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            {leave.reason && (
                                                <p className="text-xs text-gray-500 mb-5 bg-gray-50 rounded-xl p-3 border border-gray-100 line-clamp-2">
                                                    <span className="font-bold text-gray-600">Reason: </span>
                                                    {leave.reason}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {leave.status === 'PENDING' && (
                                            <div className="flex gap-2.5 mt-auto pt-2">
                                                <button
                                                    onClick={() => approveLeave(leave.id)}
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => rejectLeave(leave.id)}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── ATTENDANCE TAB ── */}
                {activeTab === 'ATTENDANCE' && (
                    <>
                        {filteredAttendance.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
                                <p className="text-sm font-semibold uppercase tracking-wider">No logs for this date</p>
                                <p className="text-xs text-gray-400 mt-1">Select a date with attendance indicator (dot)</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {filteredAttendance.map(att => {
                                    // Check if this staff has a pending leave on selected date
                                    const hasPending = leaveRequests.some(l => {
                                        if (l.status !== 'PENDING') return false;
                                        if (String(l.staffId) !== String(att.staffId)) return false;
                                        const s = parseLocalDate(l.startDate);
                                        const e = parseLocalDate(l.endDate);
                                        const sel = parseLocalDate(selectedDate);
                                        return sel >= s && sel <= e;
                                    });

                                    return (
                                        <div
                                            key={att.id}
                                            className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between
                                                ${hasPending ? 'border-amber-200 ring-1 ring-amber-100/50' : 'border-gray-100'}`}
                                        >
                                            {/* Status Top bar indicator */}
                                            <div className={`h-1.5 w-full
                                                ${att.status === 'PRESENT' ? 'bg-emerald-500'
                                                    : att.status === 'ABSENT' ? 'bg-red-500'
                                                        : 'bg-amber-400'}`}
                                            />

                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    {/* Card Header */}
                                                    <div className="flex justify-between items-start mb-5 gap-2">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border
                                                                ${att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                                                    : att.status === 'ABSENT' ? 'bg-red-50 text-red-500 border-red-100/50'
                                                                        : 'bg-amber-50 text-amber-600 border-amber-100/50'}`}
                                                            >
                                                                {(att.staffName || String(att.staffId)).charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-800 text-sm leading-tight truncate">
                                                                    {att.staffName || `Staff #${att.staffId}`}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: {att.staffId}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusBadge(att.status)}`}>
                                                                {att.status}
                                                            </span>
                                                            {hasPending && (
                                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                                                    Leave Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Check-In Check-Out */}
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="bg-emerald-50/30 border border-emerald-100/30 rounded-xl p-3 flex flex-col items-center">
                                                            <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-1.5 border border-emerald-200/50">
                                                                <Clock className="w-3.5 h-3.5" />
                                                            </div>
                                                            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Check In</p>
                                                            <p className="text-xs font-black text-gray-800 mt-1">
                                                                {formatTime(att.checkIn)}
                                                            </p>
                                                        </div>

                                                        <div className="bg-red-50/30 border border-red-100/30 rounded-xl p-3 flex flex-col items-center">
                                                            <div className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-1.5 border border-red-200/50">
                                                                <Clock className="w-3.5 h-3.5" />
                                                            </div>
                                                            <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Check Out</p>
                                                            <p className="text-xs font-black text-gray-800 mt-1">
                                                                {formatTime(att.checkOut)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {parseLocalDate(att.attendanceDate)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) || '--'}
                                                    </span>

                                                    {att.workHours != null && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                                            {att.workHours}h worked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}