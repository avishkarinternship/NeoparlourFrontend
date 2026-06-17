import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Footer from './Layouts/Footer';
import Navbar from './Layouts/Navbar';
import Sidebar from './Layouts/SideBar';

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

    /* ─── Leave counts ───────────────────────────────────── */
    const approvedCount = leaveRequests.filter(i => i.status === 'APPROVED').length;
    const pendingCount = leaveRequests.filter(i => i.status === 'PENDING').length;
    const rejectedCount = leaveRequests.filter(i => i.status === 'REJECTED').length;

    /* ─── Month navigation ───────────────────────────────── */
    const previousMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };


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

    const fetchAttendanceHistory = async () => {
        try {
            const res = await axiosInstance.get('/staff-attendance/search', {
                params: { page: 0, size: 200, sortBy: 'attendanceDate', sortDir: 'desc' }
            });
            const data = res.data.content || [];
            setAttendanceData(data);
        } catch (e) {
            console.error(e);
            setAttendanceData([]);
        }
    };

    const fetchStaffSummary = async () => {
        try {
            // Total staff count
            const staffRes = await axiosInstance.get('/staff');
            const total = (staffRes.data || []).length;

            // Attendance for selected date
            const attRes = await axiosInstance.get('/staff-attendance/search', {
                params: {
                    startDate: selectedDate,
                    endDate: selectedDate,
                    page: 0,
                    size: 200
                }
            });

            const attendanceList = attRes.data.content || [];

            // Count unique present staff
            const presentStaff = attendanceList.filter(
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
                total,
                present: uniquePresent.length,
                absent: Math.max(0, total - uniquePresent.length - leaveCount),
                onLeave: leaveCount
            });

        } catch (e) {
            console.error(e);
            setStaffSummary({
                total: 0,
                present: 0,
                absent: 0,
                onLeave: 0
            });
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
    }, []);

    useEffect(() => {
        if (activeTab === 'ATTENDANCE') {
            fetchAttendanceHistory();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'ATTENDANCE') {
            fetchStaffSummary();
        }
    }, [selectedDate, leaveRequests, activeTab]);

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
        const matchesSearch = String(l.staffId).includes(searchQuery);

        const matchesStatus =
            leaveStatusFilter === "ALL"
                ? true
                : l.status === leaveStatusFilter;

        return matchesSearch && matchesStatus;
    });

    const filteredAttendance = attendanceForDate.filter(a =>
        String(a.staffId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* ─── Status badge helper ────────────────────────────── */
    const statusBadge = (status) => {
        const map = {
            PRESENT: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            ABSENT: 'bg-red-100 text-red-600 border border-red-200',
            LATE: 'bg-amber-100 text-amber-700 border border-amber-200',
            APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
            PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
            REJECTED: 'bg-red-100 text-red-600 border border-red-200',
        };
        return map[status] || 'bg-gray-100 text-gray-600';
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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 p-8 bg-[#FDFDFD] flex flex-col justify-between overflow-x-hidden">
                    <div>
                        {/* ── Page Header ───────────────────────────── */}
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-gray-800 mb-5">
                                Employee Attendance
                            </h1>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActiveTab('LEAVE_REQUEST')}
                                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
                                        ${activeTab === 'LEAVE_REQUEST'
                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                                        }`}
                                >
                                    Leave Requests
                                    {pendingCount > 0 && (
                                        <span className="ml-2 bg-white text-orange-500 text-xs font-bold rounded-full px-1.5 py-0.5">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveTab('ATTENDANCE')}
                                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
                                        ${activeTab === 'ATTENDANCE'
                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                                        }`}
                                >
                                    Attendance
                                </button>
                            </div>
                        </div>

                        {/* ── Summary cards (Attendance tab only) ───── */}
                        {activeTab === 'ATTENDANCE' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Total Staff</p>
                                    <p className="text-3xl font-bold text-blue-500 mt-1">{staffSummary.total}</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Present Today</p>
                                    <p className="text-3xl font-bold text-emerald-500 mt-1">{staffSummary.present}</p>
                                </div>
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">On Leave</p>
                                    {/* <p className="text-3xl font-bold text-amber-500 mt-1">{approvedCount}</p> */}
                                    <p className="text-3xl font-bold text-amber-500 mt-1">
                                        {staffSummary.onLeave}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Absent</p>
                                    <p className="text-3xl font-bold text-red-400 mt-1">
                                        {/* {Math.max(0, staffSummary.total - staffSummary.present - approvedCount)} */}
                                        {staffSummary.absent}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Leave summary cards (Leave Request tab) ─ */}
                        {activeTab === 'LEAVE_REQUEST' && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                                    <p className="text-amber-600 text-xs font-semibold uppercase tracking-wide">Pending</p>
                                    <p className="text-3xl font-bold text-amber-500 mt-1">{pendingCount}</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                                    <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wide">Approved</p>
                                    <p className="text-3xl font-bold text-emerald-500 mt-1">{approvedCount}</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                                    <p className="text-red-500 text-xs font-semibold uppercase tracking-wide">Rejected</p>
                                    <p className="text-3xl font-bold text-red-400 mt-1">{rejectedCount}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Date Strip ────────────────────────────── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-5">
                            {/* Month / Year navigation */}
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Selected Date</h2>
                                    <p className="text-sm font-medium text-gray-700 mt-0.5">{selectedDateLabel}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={previousMonth}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-lg transition"
                                    >
                                        ‹
                                    </button>
                                    <span className="font-semibold text-gray-700 min-w-[80px] text-center text-sm">
                                        {monthNames[currentMonth]}
                                    </span>
                                    <button
                                        onClick={nextMonth}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-lg transition"
                                    >
                                        ›
                                    </button>

                                    <div className="w-px h-5 bg-gray-200 mx-1" />

                                    <button
                                        onClick={() => setCurrentYear(y => y - 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-lg transition"
                                    >
                                        ‹
                                    </button>
                                    <span className="font-semibold text-gray-700 min-w-[44px] text-center text-sm">
                                        {currentYear}
                                    </span>
                                    <button
                                        onClick={() => setCurrentYear(y => y + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold text-lg transition"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>

                            {/* Date bubbles */}
                            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                                {stripDates.map(dateStr => {
                                    const d = parseLocalDate(dateStr);
                                    const isSelected = selectedDate === dateStr;
                                    const hasAttendance = attendanceDates.has(dateStr);
                                    const hasPendingLeave = leaveRequests.some(l => {
                                        if (l.status !== 'PENDING') return false;
                                        const s = parseLocalDate(l.startDate);
                                        const e = parseLocalDate(l.endDate);
                                        const dt = parseLocalDate(dateStr);
                                        return dt >= s && dt <= e;
                                    });

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => setSelectedDate(dateStr)}
                                            className="flex flex-col items-center min-w-[56px] group"
                                        >
                                            <span className="text-[11px] text-gray-400 font-medium mb-1">
                                                {d ? dayNames[d.getDay()] : ''}
                                            </span>
                                            <div
                                                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 relative
                                                    ${isSelected
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'
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
                                    <p className="text-sm text-gray-400 py-3">No dates available for this month.</p>
                                )}
                            </div>
                        </div>

                        {/* ── Search & Filter Row ───────────────────── */}
                        {/* ── Search & Filter Row ───────────────────── */}
                        <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between border border-gray-100 shadow-sm">
                            <div className="relative w-full sm:w-80">
                                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <img src={searchIcon} alt="Search" className="w-4 h-4 opacity-50" />
                                </span>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={
                                        activeTab === "ATTENDANCE"
                                            ? "Search by staff ID..."
                                            : "Search by staff name or ID..."
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition"
                                />
                            </div>

                            {/* Show filter only in Leave Request tab */}
                            {activeTab === "LEAVE_REQUEST" && (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                    <img src={customOrder} alt="Filter" className="w-4 h-4" />

                                    <select
                                        value={leaveStatusFilter}
                                        onChange={(e) => setLeaveStatusFilter(e.target.value)}
                                        className="bg-transparent text-xs text-gray-600 outline-none cursor-pointer"
                                    >
                                        <option value="ALL">All Requests</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* ── Pending leave banner (shown in both tabs when date has pending leaves) ── */}
                        {pendingLeavesOnDate.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-amber-800 font-semibold text-sm">
                                        {pendingLeavesOnDate.length} pending leave request{pendingLeavesOnDate.length > 1 ? 's' : ''} on this date
                                    </p>
                                    <p className="text-amber-600 text-xs mt-0.5">
                                        Staff ID{pendingLeavesOnDate.length > 1 ? 's' : ''}: {pendingLeavesOnDate.map(l => l.staffId).join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ─────────────────────────────────────────── */}
                        {/* ── LEAVE REQUEST TAB ─────────────────────── */}
                        {/* ─────────────────────────────────────────── */}
                        {activeTab === 'LEAVE_REQUEST' && (
                            <>
                                {filteredLeave.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-medium">No leave requests for this date</p>
                                        <p className="text-xs mt-1">Select another date or check pending requests</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                                        {filteredLeave.map(leave => (
                                            <div
                                                key={leave.id}
                                                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200
                                                    ${leave.status === 'PENDING' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}
                                            >
                                                {/* Card Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-sm leading-tight">
                                                                    {leave.staffName || `Staff #${leave.staffId}`}
                                                                </p>
                                                                <p className="text-xs text-gray-400">ID: {leave.staffId}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                </div>

                                                {/* Leave Type */}
                                                {leave.leaveType && (
                                                    <div className="mb-3">
                                                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium border border-blue-100">
                                                            {leave.leaveType}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Date Range */}
                                                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            Start
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {parseLocalDate(leave.startDate)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || '--'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-px bg-gray-200" />
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            End
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {parseLocalDate(leave.endDate)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || '--'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Reason */}
                                                {leave.reason && (
                                                    <p className="text-xs text-gray-500 mb-4 bg-gray-50 rounded-lg p-2.5 border border-gray-100 line-clamp-2">
                                                        <span className="font-medium text-gray-600">Reason: </span>
                                                        {leave.reason}
                                                    </p>
                                                )}

                                                {/* Actions */}
                                                {leave.status === 'PENDING' && (
                                                    <div className="flex gap-2 mt-1">
                                                        <button
                                                            onClick={() => approveLeave(leave.id)}
                                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => rejectLeave(leave.id)}
                                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
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

                        {/* ─────────────────────────────────────────── */}
                        {/* ── ATTENDANCE TAB ────────────────────────── */}
                        {/* ─────────────────────────────────────────── */}
                        {activeTab === 'ATTENDANCE' && (
                            <>
                                {filteredAttendance.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <svg className="w-14 h-14 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-sm font-medium">No attendance records for this date</p>
                                        <p className="text-xs mt-1">Select a date with attendance data (look for green dots)</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
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
                                                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200
                                                        ${hasPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}
                                                >
                                                    {/* Card Top accent bar */}
                                                    <div className={`h-1.5 w-full
                                                        ${att.status === 'PRESENT' ? 'bg-emerald-400'
                                                            : att.status === 'ABSENT' ? 'bg-red-400'
                                                                : 'bg-amber-400'}`}
                                                    />

                                                    <div className="p-5">
                                                        {/* Header */}
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                                                    ${att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600'
                                                                        : att.status === 'ABSENT' ? 'bg-red-100 text-red-500'
                                                                            : 'bg-amber-100 text-amber-600'}`}
                                                                >
                                                                    {(att.staffName || String(att.staffId)).charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 text-sm leading-tight">
                                                                        {att.staffName || `Staff #${att.staffId}`}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">ID: {att.staffId}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(att.status)}`}>
                                                                    {att.status}
                                                                </span>
                                                                {hasPending && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                                                        Leave Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Check In / Check Out */}
                                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                                            {/* Check In */}
                                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center">
                                                                <div className="w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center mb-1.5">
                                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide">Check In</p>
                                                                <p className="text-sm font-bold text-gray-800 mt-0.5">
                                                                    {formatTime(att.checkIn)}
                                                                </p>
                                                            </div>

                                                            {/* Check Out */}
                                                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col items-center">
                                                                <div className="w-7 h-7 bg-red-400 rounded-full flex items-center justify-center mb-1.5">
                                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wide">Check Out</p>
                                                                <p className="text-sm font-bold text-gray-800 mt-0.5">
                                                                    {formatTime(att.checkOut)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Date footer */}
                                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {parseLocalDate(att.attendanceDate)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || '--'}
                                                            </span>

                                                            {att.workHours != null && (
                                                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
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

                    <Footer />
                </main>
            </div>
        </div>
    );
}