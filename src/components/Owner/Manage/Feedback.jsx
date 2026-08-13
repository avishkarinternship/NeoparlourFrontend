import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

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

const Feedback = () => {
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode || document.documentElement.classList.contains('dark');

    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'
    const [pendingFeedbacks, setPendingFeedbacks] = useState([]);
    const [approvedFeedbacks, setApprovedFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    // Fetch Pending Feedbacks
    const fetchPendingFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/feedback/pending');
            setPendingFeedbacks(response.data || []);
        } catch (error) {
            toast.error('Failed to load pending feedbacks', toastStyle);
            setPendingFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Approved Feedbacks
    const fetchApprovedFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/feedback/approved');
            setApprovedFeedbacks(response.data || []);
        } catch (error) {
            toast.error('Failed to load approved feedbacks', toastStyle);
            setApprovedFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingFeedbacks();
        } else {
            fetchApprovedFeedbacks();
        }
    }, [activeTab]);

    const handleApprove = async (feedbackId) => {
        setProcessingId(feedbackId);
        try {
            await axiosInstance.put(`/feedback/${feedbackId}/approve`);
            toast.success('Feedback approved successfully!', toastStyle);
            fetchPendingFeedbacks(); // Refresh pending list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve feedback', toastStyle);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (feedbackId) => {
        setProcessingId(feedbackId);
        try {
            await axiosInstance.delete(`/feedback/${feedbackId}/reject`);
            toast.success('Feedback rejected successfully!', toastStyle);
            fetchPendingFeedbacks(); // Refresh pending list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject feedback', toastStyle);
        } finally {
            setProcessingId(null);
        }
    };

    const currentFeedbacks = activeTab === 'pending' ? pendingFeedbacks : approvedFeedbacks;

    return (
                <main className={`flex-1 p-6 md:p-8 overflow-auto transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 md:border-l md:border-zinc-800' : 'bg-white md:border-l md:border-gray-200'}`}>
                    <div className="max-w-5xl mx-auto">
                        <div className="inline-block border-b-2 border-red-600 pb-2 mb-8">
                            <span className={`text-[13px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Feedback Management</span>
                        </div>

                        {/* Tab Navigation */}
                        <div className={`flex border-b mb-8 ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-8 py-4 font-medium border-b-2 transition-colors ${activeTab === 'pending'
                                    ? 'border-red-600 text-red-600'
                                    : isDarkMode ? 'border-transparent text-zinc-400 hover:text-zinc-200' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Pending Feedbacks
                            </button>
                            <button
                                onClick={() => setActiveTab('approved')}
                                className={`px-8 py-4 font-medium border-b-2 transition-colors ${activeTab === 'approved'
                                    ? 'border-red-600 text-red-600'
                                    : isDarkMode ? 'border-transparent text-zinc-400 hover:text-zinc-200' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Approved Feedbacks
                            </button>
                        </div>

                        {/* Feedback List */}
                        {loading ? (
                            <div className={`py-20 text-center ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Loading feedbacks...</div>
                        ) : currentFeedbacks.length === 0 ? (
                            <div className={`text-center py-20 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400' : 'bg-white border-gray-100 text-gray-500'}`}>
                                No {activeTab} feedbacks found.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {currentFeedbacks.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`rounded-2xl p-6 hover:shadow-sm transition-shadow border ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                            {/* Left: Avatar + Details */}
                                            <div className="flex gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-red-600 font-bold text-xl flex-shrink-0 ${isDarkMode ? 'bg-red-950/40' : 'bg-red-50'}`}>
                                                    {item.customerName?.charAt(0) || item.name?.charAt(0) || 'U'}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.customerName || item.name || 'Anonymous'}
                                                    </h4>
                                                    <p className={`text-sm mt-1 leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                                                        {item.comment || item.feedback}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-3">
                                                        <span className="text-amber-500 text-xl">★</span>
                                                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'}`}>{item.rating || item.averageRating || '4.5'}</span>
                                                        {item.appointmentId && (
                                                            <span className={`text-xs ml-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                                                Appointment #{item.appointmentId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Status + Action Buttons */}
                                            <div className="flex flex-col items-end gap-3">
                                                {activeTab === 'pending' ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleApprove(item.id)}
                                                            disabled={processingId === item.id}
                                                            className="bg-[#FF0B01] hover:bg-red-700 text-white text-sm font-bold px-7 py-2.5 rounded-xl transition disabled:opacity-70"
                                                        >
                                                            {processingId === item.id ? 'Approving...' : 'Approve'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(item.id)}
                                                            disabled={processingId === item.id}
                                                            className={`border text-sm font-bold px-7 py-2.5 rounded-xl transition disabled:opacity-70 ${isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700/50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            {processingId === item.id ? 'Rejecting...' : 'Reject'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                        APPROVED
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
    );
};

export default Feedback;