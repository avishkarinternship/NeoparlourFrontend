import React, { useState, useEffect } from 'react';

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

    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingSubs, setLoadingSubs] = useState(true);

    // Replace with actual salonId from auth/context (example: 1)
    const salonId = 1; // TODO: Get from auth context

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

    // Fetch Owner's Active Subscriptions
    const fetchSubscriptions = async () => {
        try {
            setLoadingSubs(true);
            const response = await axiosInstance.get(`/subscriptions/salon/${salonId}/status/active`);
            setUserSubscriptions(response.data || []);
        } catch (error) {
            toast.error('Failed to load your subscriptions', toastStyle);
            setUserSubscriptions([]);
        } finally {
            setLoadingSubs(false);
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchSubscriptions();
    }, []);

    const handlePlanAction = (planCode) => {
        // Redirect to payment flow
        console.log(`Initiating checkout for plan: ${planCode}`);
        // You can call /subscriptions/create-order here
    };

    const handleDownloadInvoice = (invoiceId) => {
        console.log(`Downloading invoice: ${invoiceId}`);
        // Implement actual download logic
    };

    return (
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white md:border-l md:border-gray-200 space-y-10">
                    {/* Subscription Plans Section */}
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div className="inline-block border-b-2 border-red-600 pb-1">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-gray-900">
                                Subscription Plans
                            </span>
                        </div>

                        {loadingPlans ? (
                            <div className="text-center py-12">Loading plans...</div>
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
                                                    : 'bg-white border-gray-200 text-gray-800'
                                                }`}
                                        >
                                            <div>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider text-right mb-1 ${isCurrent ? 'text-white/90' : 'text-gray-500'
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
                                                    <span className={`text-[11px] font-medium ml-0.5 ${isCurrent ? 'text-white/80' : 'text-gray-400'
                                                        }`}>
                                                        / {plan.durationMonths ? `${plan.durationMonths} Months` : 'Lifetime'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2.5 mb-6 max-w-md mx-auto">
                                                    <div className={`text-[11px] font-bold tracking-wide ${isCurrent ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                        What You Get
                                                    </div>
                                                    <ul className="space-y-2 pl-0.5 text-[11px]">
                                                        <li className="flex items-center space-x-2.5">
                                                            <span className={`font-bold flex-shrink-0 ${isCurrent ? 'text-white' : 'text-[#FF0B01]'}`}>✓</span>
                                                            <span>Full Access to All Features</span>
                                                        </li>
                                                        {/* Add more dynamic features if available in DTO */}
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
                                                {isCurrent ? 'Current Plan' : 'Subscribe Now'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Billing / Invoice History */}
                    <div className="max-w-5xl mx-auto space-y-4 pt-4 border-t border-dashed border-gray-200">
                        <div className="inline-block border-b-2 border-red-600 pb-1 mb-4">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-gray-900">
                                Billing History
                            </span>
                        </div>

                        <div className="bg-[#F8F9FA] px-6 py-3 rounded-lg grid grid-cols-4 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <div>Invoice</div>
                            <div>Plan</div>
                            <div>Amount</div>
                            <div className="text-right pr-14">Billing Date</div>
                        </div>

                        <div className="divide-y divide-gray-100 px-2">
                            {userSubscriptions.length > 0 ? (
                                userSubscriptions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="grid grid-cols-4 gap-4 items-center py-4 text-[12px] text-gray-800 font-medium"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <img src={invoiceIcon} alt="Invoice" className="w-4 h-4" />
                                            <span className="font-semibold text-gray-900">SUB-{sub.id}</span>
                                        </div>
                                        <div className="text-gray-700">{sub.planName || sub.planCode}</div>
                                        <div className="font-bold text-gray-900">
                                            ₹{(sub.amountInPaise || 0) / 100}
                                        </div>
                                        <div className="flex items-center justify-end space-x-7 text-right">
                                            <span className="text-gray-500 text-[11px]">
                                                {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                            <button
                                                onClick={() => handleDownloadInvoice(sub.id)}
                                                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                            >
                                                <img src={billingIcon} alt="Download" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    No billing history available
                                </div>
                            )}
                        </div>
                    </div>
                </main>
    );
};

export default Subscription;