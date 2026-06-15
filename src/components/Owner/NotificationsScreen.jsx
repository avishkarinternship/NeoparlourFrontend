import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Sidebar from './Layouts/SideBar';
import axiosInstance from '../../api/axiosInstance';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const fetchNotifications = async (currentPage) => {
        setLoading(true);
        try {
            const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
            const salonId = localStorage.getItem('activeSalonId') || ownerUser.salonId || 1;
            
            const response = await axiosInstance.get(`/notifications/search?salonId=${salonId}&page=${currentPage}&size=10`);
            setNotifications(response.data.content || []);
            setTotalPages(response.data.page?.totalPages || 0);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'APPOINTMENT': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'PRODUCT_ORDERED': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'PRODUCT_LOW_STOCK': return 'bg-orange-50 text-orange-600 border-orange-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'pending') {
            return <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Pending</span>;
        } else if (status === 'sent') {
            return <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Sent</span>;
        }
        return <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">{status}</span>;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex flex-1">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
                    <h1 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">Notifications</h1>
                    
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[500px] flex flex-col">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="animate-pulse border border-gray-100 rounded-2xl p-4 flex gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <h3 className="text-lg font-bold text-gray-900">No notifications found</h3>
                                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row gap-4 justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getTypeColor(notification.type)}`}>
                                                    {notification.type?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                                        </div>
                                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                            {getStatusBadge(notification.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-4">
                                <button 
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-semibold text-gray-500">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            <Footer />
        </div>
    );
}
