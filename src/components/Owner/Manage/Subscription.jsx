import React, { useState } from 'react';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';

// Custom Specified Subscription Asset Imports
import subscriptionIcon from '../../../assets/Owner/Manage/Subscription/subscription_icon.svg';
import invoiceIcon from '../../../assets/Owner/Manage/Subscription/invoice_icon.svg';
import billingIcon from '../../../assets/Owner/Manage/Subscription/billing_icon.svg';
import ManageSideBar from '../Layouts/ManageSideBar';

const Subscription = () => {
    // Subscription tiers configuration map arranged in a 2x2 presentation grid layout
    const [subscriptionPlans] = useState([
        {
            id: 'plan_gold_1',
            tier: 'Gold',
            price: '399',
            period: 'Monthly',
            isCurrent: false,
            features: ['Inventory Management', 'Staff Management']
        },
        {
            id: 'plan_platinum',
            tier: 'Platinum',
            price: '199',
            period: 'Monthly',
            isCurrent: true, // Highlights with solid red branding background styles
            features: ['Inventory Management', 'Staff Management']
        },
        {
            id: 'plan_gold_2',
            tier: 'Gold',
            price: '399',
            period: 'Monthly',
            isCurrent: false,
            features: ['Inventory Management', 'Staff Management']
        },
        {
            id: 'plan_gold_3',
            tier: 'Gold',
            price: '399',
            period: 'Monthly',
            isCurrent: false,
            features: ['Inventory Management', 'Staff Management']
        }
    ]);

    // Itemized billing history dataset mapping matching tabular output
    const [invoiceHistory] = useState([
        {
            id: 'Invoice 10001',
            plan: 'Platinum',
            amount: '199',
            billingDate: '24-06-2026'
        },
        {
            id: 'Invoice 10002',
            plan: 'Platinum',
            amount: '199',
            billingDate: '24-06-2026'
        }
    ]);

    const handlePlanAction = (planId, isCurrent) => {
        if (isCurrent) {
            console.log(`Open subscription upgrade context configuration matrix for: ${planId}`);
        } else {
            console.log(`Redirecting to checkout processing terminal logic gateway for: ${planId}`);
        }
    };

    const handleDownloadInvoice = (invoiceId) => {
        console.log(`Generating local print stream payload execution downriver for: ${invoiceId}`);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVIGATION PANEL */}
            <Navbar />

            {/* THREE COLUMN INTEGRATION BODY WRAPPER CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">
                
                {/* LEVEL 1: APPLICATION WORKSPACE PRIMARY NAVIGATION CONTROL */}
                <Sidebar />

                {/* LEVEL 2: SUB-MANAGEMENT DRAWER ACTIONS CONTROLLER */}
                <ManageSideBar activeTab="Subscription" onTabChange={(tab) => console.log(`Redirecting UI Context: ${tab}`)} />

                {/* LEVEL 3: ACTIVE SUBSCRIPTION PLAN METRICS PANEL INTERACTION ENV */}
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200 space-y-10">
                    
                    {/* Upper Subscription Cards System Environment */}
                    <div className="space-y-6 max-w-5xl mx-auto">
                        <div className="inline-block border-b-2 border-red-600 pb-1">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-gray-900">
                                Subscription Plan
                            </span>
                        </div>

                        {/* Forced Dual Balanced 2-Column Grid Setup across viewports */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subscriptionPlans.map((plan) => (
                                <div 
                                    key={plan.id}
                                    className={`rounded-xl border p-6 flex flex-col justify-between relative shadow-sm transition-all duration-200 ${
                                        plan.isCurrent 
                                            ? 'bg-[#FF0B01] border-[#FF0B01] text-white' 
                                            : 'bg-white border-gray-200 text-gray-800'
                                    }`}
                                >
                                    {/* Top Profile Core Parameters Segment Header */}
                                    <div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider text-right mb-1 ${
                                            plan.isCurrent ? 'text-white/90' : 'text-gray-500'
                                        }`}>
                                            {plan.tier}
                                        </div>

                                        {/* Styled Vector Asset King Crown Element Icon placement mapping */}
                                        <div className="flex justify-center mb-2.5">
                                            <img 
                                                src={subscriptionIcon} 
                                                alt="Subscription Level Indicator Badge" 
                                                className={`w-9 h-9 ${plan.isCurrent ? 'invert brightness-0' : ''}`}
                                            />
                                        </div>

                                        {/* Pricing Metric Block Segment Layout */}
                                        <div className="text-center mb-6">
                                            <span className="text-2xl font-black tracking-tight">₹{plan.price}</span>
                                            <span className={`text-[11px] font-medium ml-0.5 ${
                                                plan.isCurrent ? 'text-white/80' : 'text-gray-400'
                                            }`}>
                                                /{plan.period}
                                            </span>
                                        </div>

                                        {/* Line Deliverable Matrix Lists Array */}
                                        <div className="space-y-2.5 mb-6 max-w-md mx-auto">
                                            <div className={`text-[11px] font-bold tracking-wide ${
                                                plan.isCurrent ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                What You Can Get?
                                            </div>
                                            <ul className="space-y-2 pl-0.5">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center space-x-2.5">
                                                        <span className={`text-[11px] font-bold flex-shrink-0 ${
                                                            plan.isCurrent ? 'text-white' : 'text-[#FF0B01]'
                                                        }`}>
                                                            ✓
                                                        </span>
                                                        <span className="text-[11px] leading-tight font-medium tracking-tight opacity-95">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                                {/* Consistent empty item matching standard layout checkbox styles perfectly */}
                                                <li className="flex items-center space-x-2.5">
                                                    <span className={`text-[11px] font-bold flex-shrink-0 ${
                                                        plan.isCurrent ? 'text-white' : 'text-[#FF0B01]'
                                                    }`}>
                                                        ✓
                                                    </span>
                                                    <span className="w-12 h-1 bg-transparent inline-block"></span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Action Buttons Trigger Components */}
                                    <div className="max-w-md w-full mx-auto">
                                        <button
                                            type="button"
                                            onClick={() => handlePlanAction(plan.id, plan.isCurrent)}
                                            className={`w-full py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm text-center ${
                                                plan.isCurrent 
                                                    ? 'bg-white text-[#FF0B01] hover:bg-gray-50' 
                                                    : 'bg-[#FF0B01] text-white hover:bg-red-700'
                                            }`}
                                        >
                                            {plan.isCurrent ? 'Upgrade Plan' : 'Subscribe'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lower Ledger Statement Invoicing Activity Subsystem Module */}
                    <div className="max-w-5xl mx-auto space-y-4 pt-4 border-t border-dashed border-gray-200">
                        
                        {/* Tabular Header Stripe Element Framework Layout */}
                        <div className="bg-[#F8F9FA] px-6 py-3 rounded-lg grid grid-cols-4 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <div>Invoice</div>
                            <div>Plan</div>
                            <div>Amount</div>
                            <div className="text-right pr-14">Billing Date</div>
                        </div>

                        {/* Interactive List Statement Breakdown Row Elements */}
                        <div className="divide-y divide-gray-100 px-2">
                            {invoiceHistory.map((invoice) => (
                                <div 
                                    key={invoice.id}
                                    className="grid grid-cols-4 gap-4 items-center py-4 text-[12px] text-gray-800 font-medium"
                                >
                                    {/* SVG Document Node Trigger Parameter Entry */}
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                        <img 
                                            src={invoiceIcon} 
                                            alt="Document Receipt Graphic Asset" 
                                            className="w-4 h-4 flex-shrink-0"
                                        />
                                        <span className="font-semibold text-gray-900 truncate">{invoice.id}</span>
                                    </div>

                                    {/* Tier Active Segment Marker Mapping */}
                                    <div className="text-gray-700">{invoice.plan}</div>

                                    {/* Pricing Metric Breakdown Fields */}
                                    <div className="font-bold text-gray-900">₹ {invoice.amount}</div>

                                    {/* Downloader Trigger Node Call To Actions Line */}
                                    <div className="flex items-center justify-end space-x-7 text-right">
                                        <span className="text-gray-500 text-[11px]">{invoice.billingDate}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDownloadInvoice(invoice.id)}
                                            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-950 transition-colors flex-shrink-0 flex items-center justify-center"
                                            title="Download Receipt Statement Sheet"
                                        >
                                            <img 
                                                src={billingIcon} 
                                                alt="Download Bill Icon" 
                                                className="w-3.5 h-3.5"
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>

            {/* GLOBAL REUSABLE APPLICATION FOOTER PANEL */}
            <Footer />
        </div>
    );
}

export default Subscription;