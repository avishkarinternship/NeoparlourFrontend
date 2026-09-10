import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Trash2, Bell, AlertTriangle } from 'lucide-react';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const fetchNotifications = async (currentPage) => {
        setLoading(true);
        try {
            const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
            if (ownerUser.role === 'ADMIN') {
                setNotifications([]);
                setTotalPages(0);
                setLoading(false);
                return;
            }
            const salonId = localStorage.getItem('activeSalonId') || ownerUser.salonId;
            if (!salonId || salonId === 'SYSTEM' || salonId === 'null' || isNaN(Number(salonId))) {
                setNotifications([]);
                setTotalPages(0);
                setLoading(false);
                return;
            }
            
            const response = await axiosInstance.get(`/notifications/search?salonId=${salonId}&page=${currentPage}&size=10`);
            setNotifications(response.data.content || []);
            setTotalPages(response.data.page?.totalPages || 0);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSingle = async (id, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (deletingId === id) return;
        setDeletingId(id);

        // Optimistically remove from state immediately
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await axiosInstance.delete(`/notifications/${id}`);
            toast.success("Notification deleted successfully");
            await fetchNotifications(page);
        } catch (error) {
            console.error("Failed to delete notification:", error);
            if (error.response?.status !== 404) {
                toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to delete notification");
                await fetchNotifications(page);
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("Are you sure you want to delete all notifications?")) return;
        setIsDeletingAll(true);
        // Optimistically clear state immediately
        setNotifications([]);
        setTotalPages(0);

        try {
            await axiosInstance.delete('/notifications/all');
            toast.success("All notifications deleted successfully");
            await fetchNotifications(0);
        } catch (error) {
            console.error("Failed to delete all notifications:", error);
            if (error.response?.status !== 404) {
                toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to delete all notifications");
                await fetchNotifications(0);
            }
        } finally {
            setIsDeletingAll(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'APPOINTMENT': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40';
            case 'PRODUCT_ORDERED': return 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40';
            case 'PRODUCT_LOW_STOCK': return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/40';
            default: return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'pending') {
            return <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Pending</span>;
        } else if (status === 'sent') {
            return <span className="text-[10px] bg-green-50 text-green-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Sent</span>;
        }
        return <span className="text-[10px] bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-1 rounded-md font-bold uppercase tracking-wider">{status}</span>;
    };

    return (
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full font-sans">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Bell className="w-6 h-6 text-[#ff0b01]" />
                    Notifications
                </h1>
                {notifications.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        disabled={isDeletingAll}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-[#ff0b01] font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-red-100 dark:border-red-900/40 shadow-sm"
                    >
                        {isDeletingAll ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#ff0b01] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        <span>Delete All</span>
                    </button>
                )}
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 min-h-[500px] flex flex-col">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="animate-pulse border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex gap-4">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No notifications found</h3>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-3 flex-1">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md transition-all bg-white dark:bg-zinc-900/60 flex flex-col sm:flex-row gap-4 justify-between items-start group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getTypeColor(notification.type)}`}>
                                            {notification.type?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{notification.message}</p>
                                </div>
                                <div className="flex items-center gap-3 sm:flex-row sm:items-center self-end sm:self-center">
                                    {getStatusBadge(notification.status)}
                                    <button
                                        onClick={(e) => handleDeleteSingle(notification.id, e)}
                                        disabled={deletingId === notification.id}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                                        title="Delete notification"
                                    >
                                        {deletingId === notification.id ? (
                                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-4">
                        <button 
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
