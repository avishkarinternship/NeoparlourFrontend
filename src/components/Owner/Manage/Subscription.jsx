import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';

import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

import subscriptionIcon from '../../../assets/Owner/Manage/Subscription/subscription_icon.svg';
import invoiceIcon from '../../../assets/Owner/Manage/Subscription/invoice_icon.svg';
import billingIcon from '../../../assets/Owner/Manage/Subscription/billing_icon.svg';

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

const Subscription = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode || document.documentElement.classList.contains('dark');

    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingSubs, setLoadingSubs] = useState(true);

    const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
    const salonId = localStorage.getItem('activeSalonId') || ownerUser.tenantName || ownerUser.salonId || ownerUser.user?.salonId || ownerUser.salon?.id || 1;

    // Fetch Subscription Plans
    const fetchPlans = async () => {
        try {
            setLoadingPlans(true);
            const response = await axiosInstance.get('/subscriptions/plans');
            setSubscriptionPlans(response.data || []);
        } catch (error) {
            toast.error('Failed to load subscription plans', toastStyle);
            setSubscriptionPlans([]);
        } finally {
            setLoadingPlans(false);
        }
    };

    // Fetch Owner's Subscriptions List
    const fetchSubscriptions = async () => {
        try {
            setLoadingSubs(true);
            const response = await axiosInstance.get(`/subscriptions/salon/${salonId}`);
            setUserSubscriptions(response.data || []);
        } catch (error) {
            toast.error('Failed to load your subscriptions', toastStyle);
            setUserSubscriptions([]);
        } finally {
            setLoadingSubs(false);
        }
    };

    const getPlanDetails = (sub) => {
        const plan = subscriptionPlans.find(p => p.planCode === sub.planCode) || {};
        return {
            name: sub.planName || plan.planName || sub.planCode,
            amount: sub.amountInPaise ? (sub.amountInPaise / 100) : (plan.amountInPaise ? plan.amountInPaise / 100 : 0)
        };
    };

    const getActiveDurationMonths = (startDateStr, endDateStr) => {
        if (!startDateStr || !endDateStr) return null;
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        const diffMs = end - start;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return Math.round(diffDays / 30.44);
    };

    const getRemainingMonths = (endDateStr) => {
        if (!endDateStr) return null;
        const end = new Date(endDateStr);
        const now = new Date();
        if (end <= now) return 0;
        const diffMs = end - now;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const remaining = diffDays / 30.44;
        return Math.max(0, Math.round(remaining * 10) / 10);
    };

    useEffect(() => {
        fetchPlans();
        fetchSubscriptions();
    }, []);

    const handlePlanAction = (planCode) => {
        // Redirect to payment flow
        console.log(`Initiating checkout for plan: ${planCode}`);
        navigate('/subscription-plans');
    };

    const handleDownloadInvoice = async (invoiceId) => {
        const toastId = toast.loading('Generating invoice PDF...', toastStyle);
        try {
            const response = await axiosInstance.get(`/invoices/subscription/${invoiceId}`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            
            window.open(fileURL, '_blank');
            
            toast.success('Invoice opened successfully!', { id: toastId, ...toastStyle });
        } catch (error) {
            console.error('Failed to download invoice:', error);
            toast.error('Failed to download invoice. Please try again.', { id: toastId, ...toastStyle });
        }
    };

    return (
                <main className={`flex-1 min-w-0 p-6 md:p-8 space-y-10 transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 md:border-l md:border-zinc-800' : 'bg-white md:border-l md:border-gray-200'}`}>
                    {/* Subscription Plans Section */}
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div className="inline-block border-b-2 border-red-600 pb-1">
                            <span className={`text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {t('subscriptions_page.title', 'SUBSCRIPTION PLANS')}
                            </span>
                        </div>

                        {loadingPlans ? (
                            <div className={`text-center py-12 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{t('subscriptions_page.loading_plans', 'Loading Live Plans...')}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {subscriptionPlans.map((plan) => {
                                    const isCurrent = userSubscriptions.some(
                                        sub => sub.planCode === plan.planCode && sub.status === 'active'
                                    );

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`rounded-xl border p-6 flex flex-col justify-between relative shadow-sm transition-all duration-200 ${isCurrent
                                                    ? 'bg-[#FF0B01] border-[#FF0B01] text-white'
                                                    : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                                                }`}
                                        >
                                            <div>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider text-right mb-1 ${isCurrent ? 'text-white/90' : isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                                                    }`}>
                                                    {plan.planName}
                                                </div>

                                                <div className="flex justify-center mb-2.5">
                                                    <img
                                                        src={subscriptionIcon}
                                                        alt="Subscription Icon"
                                                        className={`w-9 h-9 ${isCurrent ? 'invert brightness-0' : ''}`}
                                                    />
                                                </div>

                                                <div className="text-center mb-6">
                                                    <span className="text-2xl font-black tracking-tight">
                                                        ₹{(plan.amountInPaise / 100).toFixed(0)}
                                                    </span>
                                                    <span className={`text-[11px] font-medium ml-0.5 ${isCurrent ? 'text-white/80' : isDarkMode ? 'text-zinc-400' : 'text-gray-400'
                                                        }`}>
                                                        / {plan.durationMonths ? `${plan.durationMonths} ${t('subscriptions_page.months', 'Months')}` : 'Lifetime'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2.5 mb-6 max-w-md mx-auto">
                                                    <div className={`text-[11px] font-bold tracking-wide ${isCurrent ? 'text-white' : isDarkMode ? 'text-zinc-200' : 'text-gray-900'
                                                        }`}>
                                                        {t('subscriptions_page.what_you_get', 'What You Can Get?')}
                                                    </div>
                                                    <ul className="space-y-2 pl-0.5 text-[11px]">
                                                        <li className="flex items-center space-x-2.5">
                                                            <span className={`font-bold flex-shrink-0 ${isCurrent ? 'text-white' : 'text-[#FF0B01]'}`}>✓</span>
                                                            <span>Full Access to All Features</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handlePlanAction(plan.planCode)}
                                                className={`w-full py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm ${isCurrent
                                                        ? 'bg-white text-[#FF0B01] hover:bg-gray-50'
                                                        : 'bg-[#FF0B01] text-white hover:bg-red-700'
                                                    }`}
                                            >
                                                {isCurrent ? t('subscriptions_page.current_plan', 'Current Plan') : t('subscriptions_page.subscribe_now', 'Subscribe Now')}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Billing / Invoice History */}
                    <div className={`max-w-5xl mx-auto space-y-4 pt-4 border-t border-dashed ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                        <div className="inline-block border-b-2 border-red-600 pb-1 mb-4">
                            <span className={`text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {t('subscriptions_page.billing_history', 'Billing History')}
                            </span>
                        </div>

                        <div className={`px-6 py-3 rounded-lg grid grid-cols-5 gap-4 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-[#F8F9FA] text-gray-400'}`}>
                            <div>{t('subscriptions_page.invoice', 'Invoice')}</div>
                            <div>{t('subscriptions_page.plan', 'Plan')}</div>
                            <div>{t('subscriptions_page.amount', 'Amount')}</div>
                            <div>{t('subscriptions_page.status', 'Status')}</div>
                            <div className="text-right pr-14">{t('subscriptions_page.billing_date', 'Billing Date')}</div>
                        </div>

                        <div className={`divide-y px-2 ${isDarkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
                            {userSubscriptions.length > 0 ? (
                                [...userSubscriptions]
                                    .sort((a, b) => {
                                        if (a.status === 'active' && b.status !== 'active') return -1;
                                        if (a.status !== 'active' && b.status === 'active') return 1;
                                        return b.id - a.id;
                                    })
                                    .map((sub) => {
                                        const planInfo = getPlanDetails(sub);
                                        const isActive = sub.status === 'active';
                                        const isPending = sub.status === 'pending';
                                        const isEnded = sub.status === 'ended' || (sub.endDate && new Date(sub.endDate) < new Date());
                                        
                                        const totalMonths = getActiveDurationMonths(sub.startDate, sub.endDate);
                                        const remainingMonths = getRemainingMonths(sub.endDate);

                                        return (
                                            <div
                                                key={sub.id}
                                                className={`grid grid-cols-5 gap-4 items-center py-4 px-4 text-[12px] rounded-xl transition-all duration-200 ${
                                                    isActive
                                                        ? isDarkMode
                                                            ? 'bg-red-950/30 border border-red-900/50 text-white font-semibold'
                                                            : 'bg-red-50/40 border border-red-100/80 text-gray-900 font-semibold'
                                                        : isDarkMode
                                                            ? 'text-zinc-300 font-medium hover:bg-zinc-800/50'
                                                            : 'text-gray-600 font-medium opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2.5">
                                                    <img src={invoiceIcon} alt="Invoice" className="w-4 h-4" />
                                                    <span className={`font-semibold ${isActive ? 'text-[#FF0B01]' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>SUB-{sub.id}</span>
                                                </div>
                                                <div className={isDarkMode ? 'text-zinc-200' : 'text-gray-700'}>{planInfo.name}</div>
                                                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    ₹{planInfo.amount}
                                                </div>
                                                <div>
                                                    {isActive ? (
                                                        <div className="space-y-0.5">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                                                {t('subscriptions_page.currently_in_use', 'Currently In Use')}
                                                            </span>
                                                            {totalMonths && (
                                                                <div className={`text-[10px] font-semibold leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                                                    Active: {totalMonths} months {remainingMonths !== null && `(${remainingMonths} left)`}
                                                                </div>
                                                            )}
                                                            <div className={`text-[9px] font-semibold leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                                                Starting from: {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'} till {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                                                            </div>
                                                        </div>
                                                    ) : isPending ? (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'bg-yellow-900/40 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {t('subscriptions_page.pending', 'Pending')}
                                                        </span>
                                                    ) : isEnded ? (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-800'}`}>
                                                            {t('subscriptions_page.ended', 'Ended')}
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-800'}`}>
                                                            {sub.status || t('subscriptions_page.inactive', 'Inactive')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-end space-x-7 text-right">
                                                    <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(sub.id)}
                                                        disabled={isPending}
                                                        className={`p-1.5 rounded-lg border ${isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700/50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} ${isPending ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                        title={isPending ? 'Invoice not available for pending subscription' : 'Download Invoice'}
                                                    >
                                                        <img src={billingIcon} alt="Download" className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className={`text-center py-12 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    {t('subscriptions_page.no_billing_history', 'No billing history available')}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
    );
};

export default Subscription;