import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

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
    if (s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    if (s === 'confirmed') return 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800';
    if (s === 'booked') return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    if (s === 'cancelled') return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    if (s === 'no_show') return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
};

const formatStatusText = (status) => {
    if (!status) return '';
    return status.replace('_', ' ');
};

const MySalons = () => {
    const navigate = useNavigate();

    // Filters
    const [salonName, setSalonName] = useState('');
    const [lastStatus, setLastStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Applied filters
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
            if (filters.salonName) params.append('salonName', filters.salonName);
            if (filters.lastStatus) params.append('lastStatus', filters.lastStatus);
            if (filters.fromDate) params.append('fromDate', `${filters.fromDate}T00:00:00.000+05:30`);
            if (filters.toDate) params.append('toDate', `${filters.toDate}T23:59:59.999+05:30`);
            params.append('page', page);
            params.append('size', 12);
            params.append('sortBy', 'lastVisitDate');
            params.append('sortDir', 'desc');

            const response = await axiosInstance.get(`/salon-visits/my?${params.toString()}`);
            const data = response.data;
            setVisits(data?.content || []);
            setTotalPages(data?.page?.totalPages ?? data?.totalPages ?? 0);
            setTotalElements(data?.page?.totalElements ?? data?.totalElements ?? 0);
            setCurrentPage(page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load salon visits', toastStyle);
            setVisits([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVisits(0, {});
    }, [fetchVisits]);

    const handleSearch = () => {
        const filters = { salonName, lastStatus, fromDate, toDate };
        setAppliedFilters(filters);
        fetchVisits(0, filters);
    };

    const handleClear = () => {
        setSalonName('');
        setLastStatus('');
        setFromDate('');
        setToDate('');
        setAppliedFilters({});
        fetchVisits(0, {});
    };

    const goToPage = (page) => {
        fetchVisits(page, appliedFilters);
    };

    const hasFilters = Object.values(appliedFilters).some(Boolean);

    return (
        <div className="min-h-screen bg-[#fcfcfd] dark:bg-black text-gray-900 dark:text-gray-300 font-sans flex flex-col">

            {/* Page Header */}
            <div className="max-w-[1200px] w-full mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="w-11 h-11 rounded-full bg-white dark:bg-gray-900 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-700 hover:text-[#ff0b01] hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                    title="Go Back"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">My Salons</h1>
                    <p className="text-gray-400 font-medium text-sm mt-0.5">Your visit history across all salons</p>
                </div>
            </div>

            <div className="max-w-[1200px] w-full mx-auto px-6 pb-16 flex-1">

                {/* Filter Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm mb-7">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Filter Visits</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Salon Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Salon Name</label>
                            <input
                                type="text"
                                value={salonName}
                                onChange={e => setSalonName(e.target.value)}
                                placeholder="Search by salon..."
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 outline-none focus:border-[#ff0b01] focus:bg-white dark:focus:bg-gray-900 transition"
                            />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Last Status</label>
                            <select
                                value={lastStatus}
                                onChange={e => setLastStatus(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 outline-none focus:border-[#ff0b01] focus:bg-white dark:focus:bg-gray-900 transition"
                            >
                                {STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* From Date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 outline-none focus:border-[#ff0b01] focus:bg-white dark:focus:bg-gray-900 transition"
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 outline-none focus:border-[#ff0b01] focus:bg-white dark:focus:bg-gray-900 transition"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleSearch}
                            className="px-5 py-2 bg-[#ff0b01] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                        >
                            Search
                        </button>
                        {hasFilters && (
                            <button
                                onClick={handleClear}
                                className="px-5 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Results header */}
                {!loading && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            {totalElements > 0
                                ? `${totalElements} salon visit${totalElements !== 1 ? 's' : ''} found`
                                : 'No visits found'}
                        </p>
                        <p className="text-[10px] text-gray-300 font-medium">Sorted by most recent visit</p>
                    </div>
                )}

                {/* Visit Cards */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="animate-spin h-9 w-9 border-[3px] border-[#ff0b01] border-t-transparent rounded-full mb-4" />
                        <p className="text-xs text-gray-400 font-semibold animate-pulse">Loading your salon visits...</p>
                    </div>
                ) : visits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                        <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
                        </svg>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">No salon visits yet</h3>
                        <p className="text-[10px] text-gray-300 mt-1.5 max-w-xs text-center">Book a service at one of our salons to see your visit history here.</p>
                        <button
                            onClick={() => navigate('/salons')}
                            className="mt-5 px-5 py-2 bg-[#ff0b01] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                        >
                            Browse Salons
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {visits.map((visit) => (
                            <div
                                key={visit.id}
                                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200 transition-all duration-200 flex flex-col gap-3"
                            >
                                {/* Salon Header */}
                                <div className="flex items-start gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-sm">
                                        {(visit.salonName || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">{visit.salonName || 'Unknown Salon'}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                            Last visited {formatDate(visit.lastVisitDate || visit.visitDate)}
                                        </p>
                                    </div>
                                    {visit.lastStatus && (
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${statusBadge(visit.lastStatus)}`}>
                                            {formatStatusText(visit.lastStatus)}
                                        </span>
                                    )}
                                </div>

                                <div className="border-t border-gray-50 dark:border-gray-800" />

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl py-3 px-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Visits</span>
                                        <span className="text-xl font-black text-gray-900">{visit.visitCount ?? 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 rounded-xl py-3 px-2">
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-1">Total Spent</span>
                                        <span className="text-base font-black text-[#ff0b01]">
                                            ₹{parseFloat(visit.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer row */}
                                {visit.lastAppointmentId && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                                        </svg>
                                        Last Appointment #{visit.lastAppointmentId}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && visits.length > 0 && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-6 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Page {currentPage + 1} of {totalPages} · {totalElements} records
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => goToPage(0)} disabled={currentPage <= 0}
                                className="px-3 py-1.5 bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer">
                                « First
                            </button>
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 0}
                                className="px-3 py-1.5 bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer">
                                ‹ Prev
                            </button>
                            <span className="px-3.5 py-1.5 bg-[#ff0b01] text-white text-[10px] font-black rounded-lg">
                                {currentPage + 1}
                            </span>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1.5 bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer">
                                Next ›
                            </button>
                            <button onClick={() => goToPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1.5 bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer">
                                Last »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySalons;

