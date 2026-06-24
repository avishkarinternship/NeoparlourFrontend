import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'booked', label: 'Booked' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
];

const formatDate = (dt) => {
    if (!dt) return '—';
    try {
        return new Date(dt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return '—'; }
};

const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s === 'confirmed') return 'bg-violet-50 text-violet-700 border-violet-100';
    if (s === 'booked') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'cancelled') return 'bg-red-50 text-red-700 border-red-100';
    if (s === 'no_show') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-gray-50 text-gray-600 border-gray-200';
};

const formatStatusText = (status) => {
    if (!status) return '';
    return status.replace('_', ' ');
};

const Customers = () => {
    const location = useLocation();

    // Filters
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [lastStatus, setLastStatus] = useState('');
    const [minVisits, setMinVisits] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [minRevenue, setMinRevenue] = useState('');

    // Applied filters (triggered by search)
    const [appliedFilters, setAppliedFilters] = useState({});

    // Data
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchVisits = useCallback(async (page = 0, filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.customerName) params.append('customerName', filters.customerName);
            if (filters.customerMobile) params.append('customerMobile', filters.customerMobile);
            if (filters.lastStatus) params.append('lastStatus', filters.lastStatus);
            if (filters.minVisits) params.append('minVisits', filters.minVisits);
            if (filters.fromDate) params.append('fromDate', `${filters.fromDate}T00:00:00.000+05:30`);
            if (filters.toDate) params.append('toDate', `${filters.toDate}T23:59:59.999+05:30`);
            if (filters.minRevenue) params.append('minRevenue', filters.minRevenue);
            params.append('page', page);
            params.append('size', 12);
            params.append('sortBy', 'lastVisitDate');
            params.append('sortDir', 'desc');

            const response = await axiosInstance.get(`/salon-visits/owner?${params.toString()}`);
            const data = response.data;
            setVisits(data?.content || []);
            setTotalPages(data?.page?.totalPages ?? data?.totalPages ?? 0);
            setTotalElements(data?.page?.totalElements ?? data?.totalElements ?? 0);
            setCurrentPage(page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load customer visits', toastStyle);
            setVisits([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const nameParam = location.state?.customerName || '';
        const mobileParam = location.state?.customerMobile || '';
        if (nameParam || mobileParam) {
            setCustomerName(nameParam);
            setCustomerMobile(mobileParam);
            const initFilters = { customerName: nameParam, customerMobile: mobileParam };
            setAppliedFilters(initFilters);
            fetchVisits(0, initFilters);
        } else {
            fetchVisits(0, {});
        }
    }, [location.state, fetchVisits]);

    const handleSearch = () => {
        const filters = { customerName, customerMobile, lastStatus, minVisits, fromDate, toDate, minRevenue };
        setAppliedFilters(filters);
        fetchVisits(0, filters);
    };

    const handleClear = () => {
        setCustomerName('');
        setCustomerMobile('');
        setLastStatus('');
        setMinVisits('');
        setFromDate('');
        setToDate('');
        setMinRevenue('');
        setAppliedFilters({});
        fetchVisits(0, {});
    };

    const goToPage = (page) => {
        fetchVisits(page, appliedFilters);
    };

    const hasFilters = Object.values(appliedFilters).some(Boolean);

    return (
                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#FF0B01]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">Customers</h1>
                                <p className="text-xs text-gray-400 font-medium">Customer visit history at your salon</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm mb-7">
                        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Filter Visits</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {/* Customer Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="Search by name..."
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                />
                            </div>

                            {/* Mobile */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={customerMobile}
                                    onChange={e => setCustomerMobile(e.target.value)}
                                    placeholder="Search by mobile..."
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                />
                            </div>

                            {/* Status */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Last Status</label>
                                <select
                                    value={lastStatus}
                                    onChange={e => setLastStatus(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                >
                                    {STATUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Min Visits */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Min Visits</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={minVisits}
                                    onChange={e => setMinVisits(e.target.value)}
                                    placeholder="e.g. 2"
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                />
                            </div>

                            {/* From Date */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                />
                            </div>

                            {/* To Date */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                />
                            </div>

                            {/* Min Revenue */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Min Revenue (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={minRevenue}
                                    onChange={e => setMinRevenue(e.target.value)}
                                    placeholder="e.g. 500"
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-[#F9F9F9] outline-none focus:border-red-400 transition"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleSearch}
                                className="px-5 py-2 bg-[#FF0B01] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                            >
                                Search
                            </button>
                            {hasFilters && (
                                <button
                                    onClick={handleClear}
                                    className="px-5 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Header */}
                    {!loading && (
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                {totalElements > 0 ? `${totalElements} customer visit${totalElements !== 1 ? 's' : ''} found` : 'No visits found'}
                            </p>
                            <p className="text-[10px] text-gray-300 font-medium">Sorted by most recent visit</p>
                        </div>
                    )}

                    {/* Visit Cards */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin h-8 w-8 border-[3px] border-[#FF0B01] border-t-transparent rounded-full mb-3" />
                            <p className="text-xs text-gray-400 font-semibold animate-pulse">Loading customer visits...</p>
                        </div>
                    ) : visits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">No customer visits found</h3>
                            <p className="text-[10px] text-gray-300 mt-1">Try adjusting your filters or wait for visits to arrive.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {visits.map((visit) => (
                                <div
                                    key={visit.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-3"
                                >
                                    {/* Customer Header */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-sm">
                                            {(visit.customerName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-black text-gray-900 truncate">{visit.customerName || 'Unknown Customer'}</h3>
                                            <p className="text-[11px] text-gray-400 font-medium">{visit.customerMobile || '—'}</p>
                                        </div>
                                        {visit.lastStatus && (
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge(visit.lastStatus)}`}>
                                                {formatStatusText(visit.lastStatus)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-50" />

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col items-center bg-gray-50 rounded-xl py-2.5 px-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Visits</span>
                                            <span className="text-base font-black text-gray-900">{visit.visitCount ?? 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-gray-50 rounded-xl py-2.5 px-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Revenue</span>
                                            <span className="text-sm font-black text-[#FF0B01]">
                                                ₹{parseFloat(visit.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center bg-gray-50 rounded-xl py-2.5 px-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Last Visit</span>
                                            <span className="text-[10px] font-bold text-gray-700 text-center">{formatDate(visit.lastVisitDate || visit.visitDate)}</span>
                                        </div>
                                    </div>

                                    {/* Appointment ID */}
                                    {visit.lastAppointmentId && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                                            </svg>
                                            Last Appt #{visit.lastAppointmentId}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && visits.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                Page {currentPage + 1} of {totalPages} · {totalElements} records
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => goToPage(0)}
                                    disabled={currentPage <= 0}
                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    « First
                                </button>
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage <= 0}
                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    ‹ Prev
                                </button>
                                <span className="px-3.5 py-1.5 bg-[#FF0B01] text-white text-[10px] font-black rounded-lg">
                                    {currentPage + 1}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    Next ›
                                </button>
                                <button
                                    onClick={() => goToPage(totalPages - 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    Last »
                                </button>
                            </div>
                        </div>
                    )}
                </main>
    );
};

export default Customers;
