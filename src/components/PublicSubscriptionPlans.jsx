import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare,
  Lock,
  Globe,
  Sliders,
  Users,
  Database
} from 'lucide-react';

const PublicSubscriptionPlans = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('yearly'); // 'monthly' or 'yearly'

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for independent salons starting their digital journey.',
      icon: Sliders,
      badge: 'Starter Pack',
      priceMonthly: 999,
      priceYearly: 7999, // ~666/month
      durationMonths: 1,
      features: [
        'Advanced Appointment Booking',
        'Basic Staff Management (up to 3 staff)',
        'Standard Billing & Invoicing',
        'Customer Database (CRM)',
        'Email Notifications',
        'Mobile App Access'
      ],
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10',
      tagline: 'Get started in minutes'
    },
    {
      name: 'Growth',
      description: 'Perfect for established salons looking to automate operations.',
      icon: Users,
      badge: 'Most Popular',
      priceMonthly: 1999,
      priceYearly: 15999, // ~1333/month
      durationMonths: 3,
      features: [
        'Everything in Starter',
        'Unlimited Staff Management',
        'Inventory & Stock Tracking',
        'Basic WhatsApp Reminders',
        'Dynamic Discount Settings',
        'Standard Analytics Reports',
        'Priority Chat Support'
      ],
      color: 'from-[#ff0b01] to-red-600',
      shadow: 'shadow-red-500/20',
      tagline: 'Accelerate your salon growth',
      featured: true
    },
    {
      name: 'Pro Elite',
      description: 'Ultimate power and customization for luxury salons.',
      icon: Crown,
      badge: 'Best Value',
      priceMonthly: 2999,
      priceYearly: 23999, // ~1999/month
      durationMonths: 12,
      features: [
        'Everything in Growth',
        'Advanced Analytics & AI Forecasting',
        'Automated Custom Marketing Campaigns',
        'Custom Domain & Brand Integration',
        'Dedicated Success Manager',
        'SMS & Whatsapp API Integration',
        '24/7 Phone Support'
      ],
      color: 'from-amber-500 to-yellow-600',
      shadow: 'shadow-amber-500/10',
      tagline: 'Experience luxury automation'
    }
  ];

  const handleCheckoutRedirect = (plan) => {
    // Standard mock callback since there are no active owner APIs required
    // We can redirect the user to WhatsApp for immediate assistance or render a secure payment sheet placeholder.
    const message = `Hello NeoParlour Support! I am interested in purchasing the *${plan.name}* subscription plan (${billingPeriod} billing). Please guide me with the checkout process.`;
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/919999999999?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-[#ff0b01]/30 selection:text-white flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff0b01]/5 blur-[150px] pointer-events-none" />

      {/* Standalone Logo Header */}
      <header className="w-full py-8 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff0b01] to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-wider uppercase text-white">NeoParlour</span>
        </div>
        <button 
          onClick={() => navigate('/owner/login')}
          className="text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-12 z-10 w-full max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="text-center max-w-2xl mb-12 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff0b01]/10 border border-[#ff0b01]/25 text-[#ff0b01] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Premium Access Pass
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Choose Your <span className="bg-gradient-to-r from-red-500 to-[#ff0b01] bg-clip-text text-transparent">Power Plan</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Save play store commissions and gain direct web activation. Select a billing cycle and unlock your salon dashboard immediately.
          </p>
        </div>

        {/* Custom Billing Cycle Toggle Switch */}
        <div className="flex items-center gap-4 mb-16 bg-neutral-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              billingPeriod === 'monthly'
                ? 'bg-neutral-800 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative flex items-center gap-1.5 ${
              billingPeriod === 'yearly'
                ? 'bg-[#ff0b01] text-white shadow-lg shadow-red-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-3 -right-3 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider scale-95 shadow-md">
              Save 33%
            </span>
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch mb-20">
          {plans.map((plan) => {
            const isFeatured = plan.featured;
            const price = billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const monthlyEquivalent = billingPeriod === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

            return (
              <div 
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-[36px] p-8 md:p-10 border transition-all duration-500 group overflow-hidden ${
                  isFeatured 
                    ? 'bg-[#121215] border-[#ff0b01]/40 shadow-[0_20px_50px_rgba(255,11,1,0.08)]' 
                    : 'bg-[#121215]/60 border-neutral-850 hover:border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                } hover:-translate-y-2`}
              >
                {/* Visual Accent for Featured Plan */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-red-500 via-[#ff0b01] to-amber-500" />
                )}

                {/* Top Half */}
                <div className="space-y-6">
                  {/* Badge & Title */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${
                        isFeatured ? 'bg-[#ff0b01]/20 text-[#ff0b01]' : 'bg-neutral-850 text-gray-400'
                      }`}>
                        {plan.badge}
                      </span>
                      <h3 className="text-2xl font-extrabold text-white">{plan.name}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      isFeatured ? 'bg-[#ff0b01]/10 text-[#ff0b01]' : 'bg-neutral-800 text-gray-300'
                    }`}>
                      <plan.icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">₹{price.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-gray-500">
                        / {billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <p className="text-xs text-[#ff0b01] font-black">
                        Equivalent to ₹{monthlyEquivalent.toLocaleString()} / month
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 font-medium italic pt-1">
                      {plan.tagline}
                    </p>
                  </div>

                  <hr className="border-neutral-850" />

                  {/* Checklist */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                      Key Highlights
                    </span>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isFeatured ? 'text-[#ff0b01]' : 'text-emerald-500'
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-10">
                  <button
                    onClick={() => handleCheckoutRedirect(plan)}
                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] ${
                      isFeatured 
                        ? 'bg-[#ff0b01] text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                        : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    }`}
                  >
                    Select Plan <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* trust badging section */}
        <div className="w-full bg-[#121215]/30 rounded-3xl border border-neutral-850 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Secure Payment Routing</h4>
              <p className="text-xs text-gray-400 font-medium">Encrypting checking credentials in compliance with standard SSL gateway networks.</p>
            </div>
          </div>
          <button 
            onClick={() => window.open('https://wa.me/919999999999', '_blank')}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl transition-colors shrink-0"
          >
            <MessageSquare className="w-4 h-4" /> Live Support Chat
          </button>
        </div>

      </main>

      {/* Standalone Minimal Footer */}
      <footer className="w-full border-t border-neutral-850 py-6 px-6 md:px-12 text-center text-xs text-gray-500 mt-auto z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© {new Date().getFullYear()} NeoParlour Inc. All Rights Reserved.</span>
        <div className="flex gap-4">
          <a href="/customer/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/customer/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
};

export default PublicSubscriptionPlans;
