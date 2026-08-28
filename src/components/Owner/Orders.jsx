import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const LazyImage = ({ src, alt, className, isDarkMode = false }) => {
    if (!src) return null;

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`w-full h-full object-cover shrink-0 ${className}`}
        />
    );
};

const Orders = () => {
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode !== undefined 
      ? outletContext.isDarkMode 
      : document.documentElement.classList.contains('dark');

    const [activeTab, setActiveTab] = useState('ordered'); // 'ordered' | 'completed' | 'cancelled'
    


    // Filter states
    const [keyword, setKeyword] = useState('');
    const [mobile, setMobile] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // Pagination states
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Fetch orders from API
    const fetchOrders = () => {
        setLoading(true);
        const params = {
            page: currentPage,
            size: pageSize,
            sortBy: 'createdAt',
            direction: 'desc'
        };

        // Tab status mapping
        if (activeTab === 'completed') {
            params.status = 'completed';
        } else if (activeTab === 'cancelled') {
            params.status = 'cancelled';
        } else {
            // Active Tab is "ordered"
            params.status = 'ordered';
        }

        // Apply other filters if present
        if (keyword.trim()) params.keyword = keyword.trim();
        if (mobile.trim()) params.mobile = mobile.trim();
        if (minAmount) params.minAmount = minAmount;
        if (maxAmount) params.maxAmount = maxAmount;

        if (fromDate) {
            params.fromDate = fromDate + 'T00:00:00.000+05:30';
        }
        if (toDate) {
            params.toDate = toDate + 'T23:59:59.999+05:30';
        }

        axiosInstance.get('/orders/search', { params })
            .then((res) => {
                if (res.data) {
                    setOrders(res.data.content || []);
                    setTotalPages(res.data.totalPages || 0);
                    setTotalElements(res.data.totalElements || 0);
                } else {
                    setOrders([]);
                }
            })
            .catch((err) => {
                console.error('Error fetching orders:', err);
                setOrders([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Reset pagination when tab changes
    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab]);

    // Fetch orders when active filters or page change
    useEffect(() => {
        fetchOrders();
    }, [activeTab, currentPage]);

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchOrders();
    };

    // Clear all filters
    const handleClearFilters = () => {
        setKeyword('');
        setMobile('');
        setFromDate('');
        setToDate('');
        setMinAmount('');
        setMaxAmount('');
        setCurrentPage(0);
    };

    // Update order status directly
    const handleUpdateStatusDirect = (orderId, newStatus) => {
        axiosInstance.put(`/orders/${orderId}/status?status=${newStatus}`)
            .then(() => {
                toast.success(`Order #${orderId} status updated to ${newStatus}!`);
                fetchOrders();
            })
            .catch((err) => {
                console.error(`Error updating order status to ${newStatus}:`, err);
            });
    };

    // Confirm action modal popup states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalType, setConfirmModalType] = useState('cancel'); // 'cancel' | 'delete'
    const [confirmTargetId, setConfirmTargetId] = useState(null);

    const openConfirmModal = (type, orderId) => {
        setConfirmModalType(type);
        setConfirmTargetId(orderId);
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => {
        if (!confirmTargetId) return;

        if (confirmModalType === 'cancel') {
            axiosInstance.put(`/orders/${confirmTargetId}/status?status=cancelled`)
                .then(() => {
                    toast.success(`Order #${confirmTargetId} has been cancelled.`);
                    setShowConfirmModal(false);
                    setConfirmTargetId(null);
                    fetchOrders();
                })
                .catch((err) => {
                    console.error('Error cancelling order:', err);
                });
        } else if (confirmModalType === 'delete') {
            axiosInstance.delete(`/orders/${confirmTargetId}`)
                .then(() => {
                    toast.success(`Order #${confirmTargetId} deleted successfully.`);
                    setShowConfirmModal(false);
                    setConfirmTargetId(null);
                    fetchOrders();
                })
                .catch((err) => {
                    console.error('Error deleting order:', err);
                });
        }
    };

    // Helper to format date-time string
    const formatDateTime = (instantStr) => {
        if (!instantStr) return '';
        try {
            const date = new Date(instantStr);
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return instantStr;
        }
    };

    return (
                <main className={`flex-1 min-w-0 p-6 md:p-8 space-y-6 transition-colors duration-300 ${
                    isDarkMode ? 'bg-zinc-950 text-zinc-100 md:border-l md:border-zinc-800' : 'bg-white text-slate-800 md:border-l md:border-gray-200'
                }`}>
                    
                    {/* Header Title Section Line Block */}
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className={`text-[18px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Orders Management
                            </h1>
                            <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Manage product sales orders, status updates, and customer purchase logs</p>
                        </div>
                    </div>

                    {/* TABS CONTAINER */}
                    <div className={`max-w-6xl mx-auto border-b ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'}`}>
                        <div className={`flex space-x-6 text-[11px] font-bold tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                            {[
                                { key: 'ordered', label: 'Active / Ordered' },
                                { key: 'completed', label: 'Completed' },
                                { key: 'cancelled', label: 'Cancelled' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`pb-3 relative transition-colors uppercase ${
                                        activeTab === tab.key ? (isDarkMode ? 'text-white font-extrabold' : 'text-gray-900 font-extrabold') : (isDarkMode ? 'hover:text-zinc-300' : 'hover:text-gray-600')
                                    }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF0B01] rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter and Global Query Toolbar Input Row Segment Controls */}
                    <div className={`max-w-6xl mx-auto ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-100'} border rounded-xl p-4 shadow-2xs transition-colors duration-300`}>
                        <form onSubmit={handleSearchSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Keyword input */}
                                <div className="flex flex-col">
                                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider mb-1`}>Search Keyword</label>
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="Product or Customer name..."
                                        className={`w-full px-3 py-2 text-[11px] font-semibold rounded-lg placeholder-gray-400 focus:outline-none focus:border-[#FF0B01] transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'} border`}
                                    />
                                </div>

                                {/* Customer Mobile */}
                                <div className="flex flex-col">
                                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider mb-1`}>Customer Mobile</label>
                                    <input
                                        type="text"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="Filter by mobile..."
                                        className={`w-full px-3 py-2 text-[11px] font-semibold rounded-lg placeholder-gray-400 focus:outline-none focus:border-[#FF0B01] transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'} border`}
                                    />
                                </div>

                                {/* Amount Filters */}
                                <div className="flex flex-col">
                                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider mb-1`}>Min Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        placeholder="e.g. 100"
                                        className={`w-full px-3 py-2 text-[11px] font-semibold rounded-lg placeholder-gray-400 focus:outline-none focus:border-[#FF0B01] transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'} border`}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider mb-1`}>Max Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        placeholder="e.g. 5000"
                                        className={`w-full px-3 py-2 text-[11px] font-semibold rounded-lg placeholder-gray-400 focus:outline-none focus:border-[#FF0B01] transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'} border`}
                                    />
                                </div>

                                {/* Date Filters */}
                                <div className="flex flex-col">
                                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider mb-1`}>From Date</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className={`w-full px-3 py-2 text-[11px] font-semibold rounded-lg focus:outline-none focus:border-[#FF0B01] transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'} border`}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider mb-1`}>To Date</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className={`w-full px-3 py-2 text-[11px] font-semibold rounded-lg focus:outline-none focus:border-[#FF0B01] transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-700'} border`}
                                    />
                                </div>


                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className={`px-4 py-2 border rounded-lg text-[11px] font-bold transition-colors ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    Clear Filters
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#FF0B01] text-white rounded-lg text-[11px] font-bold shadow-xs hover:bg-[#e00a00] hover:shadow-md transition-all duration-150"
                                >
                                    Apply Search
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ORDER LIST / CARDS */}
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin h-8 w-8 border-2 border-[#FF0B01] border-t-transparent rounded-full mb-3"></div>
                                <p className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} tracking-wide uppercase`}>Loading orders...</p>
                            </div>
                        ) : !Array.isArray(orders) || orders.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-2xl ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50/50 border-gray-200'}`}>
                                <svg className={`w-10 h-10 ${isDarkMode ? 'text-zinc-500' : 'text-gray-300'} mb-3`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No orders found</h3>
                                <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} max-w-xs mt-1`}>No product purchase records match the selected active tab or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {orders.map((order) => {
                                    const isCompleted = order.status === 'completed';
                                    const isCancelled = order.status === 'cancelled';
                                    const isOrdered = order.status === 'ordered';
                                    const isReady = order.status === 'ready';

                                    return (
                                        <div 
                                            key={order.id}
                                            className={`border rounded-xl p-4 shadow-3xs transition-all duration-200 flex flex-col justify-between ${
                                                isCompleted
                                                    ? (isDarkMode ? 'bg-zinc-900 border-emerald-900/50 hover:border-emerald-700' : 'bg-white border-emerald-100 hover:border-emerald-250')
                                                    : (isDarkMode ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-600' : 'bg-white border-gray-100 hover:border-gray-200')
                                            }`}
                                        >
                                            <div>
                                                {/* Header */}
                                                <div className={`flex items-center justify-between border-b ${isDarkMode ? 'border-zinc-700' : 'border-gray-100'} pb-2 mb-2`}>
                                                    <div>
                                                        <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#ORD-{order.id}</span>
                                                        <div className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} font-medium mt-0.5`}>
                                                            {formatDateTime(order.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {isOrdered && (
                                                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-wider">
                                                                Ordered
                                                            </span>
                                                        )}
                                                        {isReady && (
                                                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border bg-amber-50 text-amber-600 border-amber-100 uppercase tracking-wider">
                                                                Ready
                                                            </span>
                                                        )}
                                                        {isCompleted && (
                                                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-wider">
                                                                Completed
                                                            </span>
                                                        )}
                                                        {isCancelled && (
                                                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border bg-red-50 text-red-600 border-red-100 uppercase tracking-wider">
                                                                Cancelled
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                <div className="space-y-0.5 mb-2.5">
                                                    <div className={`flex items-center text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${isCompleted ? 'bg-emerald-500' : isCancelled ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                                                        {order.customerName || 'Anonymous Customer'}
                                                    </div>
                                                    {order.customerMobile && (
                                                        <div className={`text-[9px] font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'} pl-3`}>
                                                            📞 {order.customerMobile}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Order Items */}
                                                <div className={`rounded-lg p-2.5 mb-3 space-y-1.5 max-h-36 overflow-y-auto ${isCompleted ? (isDarkMode ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-emerald-50/20 border border-emerald-100/30') : (isDarkMode ? 'bg-zinc-800/80' : 'bg-gray-50')}`}>
                                                    <div className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wider border-b ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-200/50'} pb-1 mb-1`}>Items</div>
                                                    {Array.isArray(order.items) && order.items.map((item) => (
                                                        <div key={item.id} className={`flex items-center justify-between text-[10px] font-medium ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'} py-0.5`}>
                                                            <div className="flex items-center min-w-0 mr-2">
                                                                {item.productImageUrl ? (
                                                                    <LazyImage 
                                                                        src={item.productImageUrl} 
                                                                        alt={item.productName} 
                                                                        isDarkMode={isDarkMode}
                                                                        className="w-7 h-7 rounded-md border border-gray-200/60 mr-2"
                                                                    />
                                                                ) : null}
                                                                <span className={`truncate font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.productName}</span>
                                                            </div>
                                                            <span className={`shrink-0 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {item.quantity} x ₹{parseFloat(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Total & Action Footer */}
                                            <div className={`border-t ${isDarkMode ? 'border-zinc-700' : 'border-gray-100'} pt-2.5`}>
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <span className={`text-[9px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} uppercase tracking-wide`}>Grand Total</span>
                                                    <span className={`text-sm font-black ${isCompleted ? 'text-emerald-600' : 'text-[#FF0B01]'}`}>
                                                        ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>

                                                {/* Context Action Buttons */}
                                                <div className="flex flex-wrap gap-1.5 justify-end">
                                                    {isOrdered && (
                                                        <>
                                                            <button
                                                                onClick={() => openConfirmModal('cancel', order.id)}
                                                                className="px-2.5 py-1 border border-red-200 text-red-500 rounded-md text-[9px] font-bold hover:bg-red-55 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatusDirect(order.id, 'completed')}
                                                                className="px-2.5 py-1 bg-green-600 text-white rounded-md text-[9px] font-bold hover:bg-green-700 transition-all"
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    )}

                                                    {isReady && (
                                                        <>
                                                            <button
                                                                onClick={() => openConfirmModal('cancel', order.id)}
                                                                className="px-2.5 py-1 border border-red-200 text-red-500 rounded-md text-[9px] font-bold hover:bg-red-55 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatusDirect(order.id, 'completed')}
                                                                className="px-2.5 py-1 bg-green-600 text-white rounded-md text-[9px] font-bold hover:bg-green-700 transition-all"
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    )}

                                                    {isCancelled && (
                                                        <div className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                            Order Cancelled
                                                        </div>
                                                    )}

                                                    {isCompleted && (
                                                        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 border border-emerald-100 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Paid & Delivered
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Custom Confirm Modal for Cancel / Delete Actions */}
                    {showConfirmModal && confirmTargetId && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className={`rounded-2xl p-6 w-full max-w-md shadow-xl border text-left transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-100'}`}>
                                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-tight mb-2`}>
                                    {confirmModalType === 'cancel' ? 'Cancel Product Order' : 'Delete Order Record'}
                                </h3>
                                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} font-semibold leading-relaxed mb-6`}>
                                    {confirmModalType === 'cancel' 
                                        ? `Are you sure you want to cancel Order #ORD-${confirmTargetId}? This will transition the order status to Cancelled. This action cannot be undone.`
                                        : `Are you sure you want to permanently delete the record of Order #ORD-${confirmTargetId}? This action will wipe the order from database logs and cannot be undone.`
                                    }
                                </p>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => {
                                            setShowConfirmModal(false);
                                            setConfirmTargetId(null);
                                        }}
                                        className={`flex-1 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${isDarkMode ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        No, Go Back
                                    </button>
                                    <button 
                                        onClick={handleConfirmAction}
                                        className={`flex-1 py-2 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                                            confirmModalType === 'cancel'
                                                ? 'bg-[#FF0B01] hover:bg-[#e00a00] hover:shadow-lg'
                                                : (isDarkMode ? 'bg-slate-200 text-slate-900 hover:bg-white hover:shadow-lg' : 'bg-gray-900 hover:bg-gray-800 hover:shadow-lg')
                                        }`}
                                    >
                                        {confirmModalType === 'cancel' ? 'Yes, Cancel Order' : 'Yes, Delete Record'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PAGINATION FOOTER */}
                    {!loading && Array.isArray(orders) && orders.length > 0 && (
                        <div className={`max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t ${isDarkMode ? 'border-zinc-700' : 'border-gray-100'}`}>
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'} uppercase`}>
                                Page {currentPage + 1} of {totalPages} ({totalElements} total orders)
                            </span>
                            <div className="flex items-center space-x-1.5">
                                <button
                                    onClick={() => setCurrentPage(0)}
                                    disabled={currentPage <= 0}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors cursor-pointer border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                >
                                    « First
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage <= 0}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors cursor-pointer border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                >
                                    ‹ Prev
                                </button>
                                
                                {/* Current Page Indicator Pill */}
                                <span className="px-3.5 py-1.5 bg-[#FF0B01] text-white text-[10px] font-black rounded-lg">
                                    {currentPage + 1}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(Math.max(0, totalPages - 1), prev + 1))}
                                    disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors cursor-pointer border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                >
                                    Next ›
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, totalPages - 1))}
                                    disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors cursor-pointer border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                >
                                    Last »
                                </button>
                            </div>
                        </div>
                    )}

                </main>
    );
};

export default Orders;
