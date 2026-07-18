import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { updateOwnerSession, logoutOwnerStaff } from '../redux/slices/ownerStaffSlice';
import toast from 'react-hot-toast';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Sliders,
  Users,
  Database,
  Tag
} from 'lucide-react';

const decodeJwt = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT token:", e);
    return null;
  }
};

const PublicSubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const getActiveUser = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token') || localStorage.getItem('ownerStaffToken');

    let userId = queryParams.get('userId');
    let email = queryParams.get('email');
    let name = queryParams.get('name');
    let phone = queryParams.get('phone');

    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        if (!userId) userId = decoded.userId || decoded.id;
        if (!email) email = decoded.email;
        if (!name) name = decoded.name;
        if (!phone) phone = decoded.phone || decoded.sub;
      }
    }

    return {
      token,
      id: userId || '',
      email: email || '',
      name: name || '',
      phone: phone || ''
    };
  };

  const activeUserObj = getActiveUser();
  const ownerUser = activeUserObj;
  const ownerToken = activeUserObj.token;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingPlanCode, setPayingPlanCode] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState('');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [paymentMode, setPaymentMode] = useState('once'); // 'once' or 'autopay'
  const [couponCode, setCouponCode] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Reset payment mode and coupon code states when checkout plan changes
  useEffect(() => {
    if (selectedPlanForCheckout) {
      setPaymentMode('once');
      setCouponCode('');
    }
  }, [selectedPlanForCheckout]);

  // Parse URL query parameters to auto-login if redirected from the mobile app
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlToken = queryParams.get('token');

    if (urlToken) {
      const userObj = getActiveUser();
      localStorage.setItem('ownerStaffToken', urlToken);
      localStorage.setItem('ownerStaffUser', JSON.stringify(userObj));
      dispatch(updateOwnerSession({ token: urlToken, salonId: '' }));
      console.log("[PublicSubscriptionPlans] Auto-login from query params completed:", userObj);
    }
  }, [dispatch]);

  // Dynamically load Razorpay SDK on mount
  useEffect(() => {
    if (document.getElementById('razorpay-checkout-script') || window.Razorpay) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch active plans from the API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/subscriptions/plans');
        setPlans(response.data || []);
      } catch (error) {
        console.error('Failed to load subscription plans', error);
        toast.error('Could not fetch active subscription plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan, isAutoPayMode, couponCode = '') => {
    const activeUserObj = getActiveUser();
    const activeToken = activeUserObj.token;

    if (!activeToken) {
      toast.error('Session details not found. Please log in first or open this link from the app.');
      navigate('/owner/login');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Razorpay payment gateway failed to load. Please refresh and try again.');
      return;
    }

    try {
      setPayingPlanCode(plan.planCode);

      let response;
      if (isAutoPayMode) {
        // 1. Create AutoPay subscription on backend
        response = await axiosInstance.post(
          `/subscriptions/create-autopay?planCode=${plan.planCode}&userId=${activeUserObj?.id || ''}`
        );
      } else {
        // 1. Create one-time Order on backend
        let url = `/subscriptions/create-order?planCode=${plan.planCode}&userId=${activeUserObj?.id || ''}`;
        if (couponCode) {
          url += `&couponCode=${encodeURIComponent(couponCode.trim())}`;
        }
        response = await axiosInstance.post(url);
      }

      const data = response.data;
      if (isAutoPayMode && !data.ok) {
        toast.error("Failed to initiate Auto-Pay subscription: " + (data.error || "Unknown error"));
        setPayingPlanCode(null);
        return;
      }

      // If a 100% discount coupon is applied, backend directly activates subscription without creating a Razorpay order
      if (!isAutoPayMode && data.success && data.amount === 0) {
        setSuccessPlanName(plan.planName);
        setShowSuccessDialog(true);
        setPayingPlanCode(null);
        return;
      }

      if (!isAutoPayMode && !data.id) {
        toast.error("Failed to initiate one-time payment: " + (data.error || "Unknown error"));
        setPayingPlanCode(null);
        return;
      }

      // 2. Open Razorpay Checkout Payment Sheet
      const options = {
        key: data.key,
        name: "NeoParlour Salon Subscription",
        description: plan.planName,
        prefill: {
          name: activeUserObj?.name || '',
          email: activeUserObj?.email || '',
          contact: activeUserObj?.phone || ''
        },
        theme: {
          color: "#ff0b01"
        },
        modal: {
          ondismiss: function () {
            setPayingPlanCode(null);
            toast.error('Payment cancelled.');
          }
        }
      };

      if (isAutoPayMode) {
        options.subscription_id = data.subscriptionId;
        options.handler = async function (transaction) {
          try {
            toast.loading('Verifying your payment setup...', { id: 'payment-verifying' });
            console.log("Razorpay subscription complete. Payment ID: ", transaction.razorpay_payment_id);

            // 3. Verify AutoPay on backend synchronously
            const verifyRes = await axiosInstance.post(
              `/subscriptions/verify-autopay?razorpayPaymentId=${transaction.razorpay_payment_id}&razorpaySubscriptionId=${transaction.razorpay_subscription_id}&razorpaySignature=${transaction.razorpay_signature}&userId=${activeUserObj?.id || ''}`
            );

            toast.dismiss('payment-verifying');
            if (verifyRes.data.success) {
              setSuccessPlanName(plan.planName);
              setShowSuccessDialog(true);
            } else {
              toast.error('Subscription verification failed.');
            }
          } catch (err) {
            toast.dismiss('payment-verifying');
            console.error('Subscription verification failed', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Could not verify subscription setup. Please contact support.';
            toast.error(errMsg);
          } finally {
            setPayingPlanCode(null);
          }
        };
      } else {
        options.order_id = data.id;
        options.amount = data.amount;
        options.currency = data.currency;
        options.handler = async function (transaction) {
          try {
            toast.loading('Verifying your payment setup...', { id: 'payment-verifying' });
            console.log("Razorpay one-time order complete. Payment ID: ", transaction.razorpay_payment_id);

            // 3. Verify one-time Order on backend synchronously
            const verifyRes = await axiosInstance.post(
              `/subscriptions/verify-payment?razorpayPaymentId=${transaction.razorpay_payment_id}&razorpayOrderId=${transaction.razorpay_order_id}&razorpaySignature=${transaction.razorpay_signature}&userId=${activeUserObj?.id || ''}`
            );

            toast.dismiss('payment-verifying');
            if (verifyRes.data.success) {
              setSuccessPlanName(plan.planName);
              setShowSuccessDialog(true);
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            toast.dismiss('payment-verifying');
            console.error('Payment verification failed', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Could not verify payment setup. Please contact support.';
            toast.error(errMsg);
          } finally {
            setPayingPlanCode(null);
          }
        };
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Subscription initiation failed', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Could not generate Razorpay transaction. Please try again.';
      toast.error(errMsg);
      setPayingPlanCode(null);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);

    if (isMobile) {
      // Log out the user from the browser session so they are not kept logged in on web
      dispatch(logoutOwnerStaff());

      // Clear storage keys explicitly as well
      localStorage.removeItem('ownerStaffToken');
      localStorage.removeItem('ownerStaffUser');
      localStorage.removeItem('activeSalonId');

      // Launch the deep link protocol back to the mobile app
      window.location.href = "neoparlour://g98us9GoAaG";
    } else {
      navigate('/owner/dashboard');
    }
  };

  // Determine if both monthly and yearly plans exist in response to show/hide the billing toggle
  const hasMonthlyPlans = plans.some(p => p.durationMonths < 12);
  const hasYearlyPlans = plans.some(p => p.durationMonths >= 12);

  // Filter plans based on duration months (Show all plans directly in grid)
  const filteredPlans = plans;

  // Dynamic icon and feature mapping helpers based on index/planCode
  const getPlanIcon = (index) => {
    const icons = [Crown, Users, Sliders, Database];
    return icons[index % icons.length];
  };

  const getPlanBadge = (plan, index) => {
    if (plan.planCode.toLowerCase().includes('basic')) return 'Basic Plan';
    if (plan.planCode.toLowerCase().includes('pro') || plan.planCode.toLowerCase().includes('elite')) return 'Elite Pro';
    return index === 0 ? 'Starter' : 'Premium Pack';
  };

  const getPlanFeatures = (plan) => {
    const defaultFeatures = [
      'Advanced Appointment Booking',
      'Unlimited Staff Management',
      'Inventory & Stock Tracking',
      'Automated Billing & Invoices',
      'WhatsApp Customer Alerts',
      'Dynamic Discount Settings',
      'Advanced AI Analytics Reports'
    ];
    // If it's a basic plan, limit some features for mockup demonstration
    if (plan.planCode.toLowerCase().includes('basic')) {
      return defaultFeatures.slice(0, 5);
    }
    return defaultFeatures;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-[#ff0b01]/30 selection:text-white flex flex-col relative overflow-hidden">

      {/* Dynamic Background Blur Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff0b01]/5 blur-[150px] pointer-events-none" />

      {/* Standalone Header */}
      <header className="w-full py-8 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff0b01] to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-wider uppercase text-white">NeoParlour</span>
        </div>
        {ownerUser ? (
          <div className="text-xs text-gray-400 font-bold uppercase">
            Active User: <span className="text-white font-black">{ownerUser.name || ownerUser.phone}</span>
          </div>
        ) : (
          <button
            onClick={() => navigate('/owner/login')}
            className="text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Main Pricing Layout */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-12 z-10 w-full max-w-7xl mx-auto">

        {/* Title & Badge */}
        <div className="text-center max-w-2xl mb-12 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff0b01]/10 border border-[#ff0b01]/25 text-[#ff0b01] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Premium Access Pass
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Choose Your <span className="bg-gradient-to-r from-red-500 to-[#ff0b01] bg-clip-text text-transparent">Power Plan</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Select a subscription plan below to unlock your salon's management suite. Tap any option to continue securely to payment checkout.
          </p>
        </div>

        {/* Spacing spacer instead of toggles */}
        <div className="h-10" />

        {/* Pricing Cards Grid */}
        <div className="w-full max-w-[1200px] flex-1 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-24">
              <div className="h-10 w-10 border-[4px] border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Loading Live Plans...</p>
            </div>
          ) : filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full items-stretch mb-20">
              {filteredPlans.map((plan, index) => {
                const amountInRupees = plan.amountInPaise / 100;
                const monthlyCost = Math.round(amountInRupees / (plan.durationMonths || 1));
                const PlanIcon = getPlanIcon(index);
                const planBadge = getPlanBadge(plan, index);
                const features = getPlanFeatures(plan);
                const isFeatured = index === 0 || plan.planCode.includes('12month');

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-[36px] p-8 md:p-10 border transition-all duration-500 group overflow-hidden ${isFeatured
                        ? 'bg-[#121215] border-[#ff0b01]/40 shadow-[0_20px_50px_rgba(255,11,1,0.08)]'
                        : 'bg-[#121215]/60 border-neutral-850 hover:border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                      } hover:-translate-y-2`}
                  >
                    {/* Visual Accent top border for Featured Plan */}
                    {isFeatured && (
                      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-red-500 via-[#ff0b01] to-amber-500" />
                    )}

                    {/* Top Content */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${isFeatured ? 'bg-[#ff0b01]/20 text-[#ff0b01]' : 'bg-neutral-850 text-gray-400'
                            }`}>
                            {planBadge}
                          </span>
                          <h3 className="text-2xl font-extrabold text-white">{plan.planName}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${isFeatured ? 'bg-[#ff0b01]/10 text-[#ff0b01]' : 'bg-neutral-800 text-gray-300'
                          }`}>
                          <PlanIcon className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Pricing Display */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-black text-white">₹{amountInRupees.toLocaleString()}</span>
                          <span className="text-xs font-semibold text-gray-500">
                            / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                          </span>
                        </div>
                        {plan.durationMonths > 1 && (
                          <p className="text-xs text-[#ff0b01] font-black">
                            Equivalent to ₹{monthlyCost.toLocaleString()} / month
                          </p>
                        )}
                        {plan.gst > 0 && (
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            Includes {plan.gst}% GST (₹{plan.gstAmount})
                          </p>
                        )}
                      </div>

                      <hr className="border-neutral-850" />

                      {/* Feature List */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                          Included Modules
                        </span>
                        <ul className="space-y-3">
                          {features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isFeatured ? 'text-[#ff0b01]' : 'text-emerald-500'
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
                        onClick={() => setSelectedPlanForCheckout(plan)}
                        disabled={payingPlanCode !== null}
                        className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] ${isFeatured
                            ? 'bg-[#ff0b01] text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                            : 'bg-neutral-800 text-white hover:bg-neutral-700'
                          }`}
                      >
                        {payingPlanCode === plan.planCode ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 border-2 rounded-full animate-spin border-white/25 border-t-white" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            Subscribe Now <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#121215]/80 rounded-[32px] p-16 text-center shadow-lg border border-neutral-850 max-w-lg">
              <p className="text-gray-400 font-medium">No active subscription plans are currently available. Please contact support.</p>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="w-full bg-[#121215]/30 rounded-3xl border border-neutral-850 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Secure Payment Processing</h4>
              <p className="text-xs text-gray-400 font-medium">Subscription setup and auto-renewal mandates are safely processed via Razorpay 256-bit SSL gateway.</p>
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

      {/* Checkout Mode Consent Dialog Overlay */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#121215] border border-neutral-850 rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] max-w-xl w-[90%] p-8 flex flex-col relative"
            style={{ animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* Close Button */}
            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 bg-[#ff0b01]/10 text-[#ff0b01] rounded-2xl border border-[#ff0b01]/25">
                <Crown className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight uppercase">Select Renewal Mode</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Choose how you want to buy your subscription</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed">
              You are subscribing to <strong className="text-white font-bold">{selectedPlanForCheckout.planName}</strong> for a duration of <strong className="text-white font-bold">{selectedPlanForCheckout.durationMonths} {selectedPlanForCheckout.durationMonths === 1 ? 'Month' : 'Months'}</strong>. Please select your preferred payment mode:
            </p>

            {/* Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Option 1: Pay Once */}
              <div
                onClick={() => setPaymentMode('once')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between h-40 relative overflow-hidden ${
                  paymentMode === 'once'
                    ? 'border-[#ff0b01] bg-[#ff0b01]/10 shadow-[0_0_15px_rgba(255,11,1,0.05)]'
                    : 'border-neutral-850 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-800/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-sm font-black uppercase tracking-wider transition-colors ${
                      paymentMode === 'once' ? 'text-white' : 'text-gray-300'
                    }`}>
                      Pay Once
                    </h3>
                    {paymentMode === 'once' && (
                      <span className="w-5 h-5 rounded-full bg-[#ff0b01] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                    Set up a single, non-recurring payment. Your active subscription access will end naturally after {selectedPlanForCheckout.durationMonths} months.
                  </p>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                  paymentMode === 'once' ? 'text-[#ff0b01]' : 'text-gray-500'
                }`}>
                  One-Time Payment
                </div>
              </div>

              {/* Option 2: Auto-Pay */}
              <div
                onClick={() => setPaymentMode('autopay')}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between h-40 relative overflow-hidden ${
                  paymentMode === 'autopay'
                    ? 'border-[#ff0b01] bg-[#ff0b01]/10 shadow-[0_0_15px_rgba(255,11,1,0.05)]'
                    : 'border-neutral-850 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-800/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-black uppercase tracking-wider transition-colors ${
                        paymentMode === 'autopay' ? 'text-white' : 'text-gray-300'
                      }`}>
                        Auto-Pay
                      </h3>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Seamless
                      </span>
                    </div>
                    {paymentMode === 'autopay' && (
                      <span className="w-5 h-5 rounded-full bg-[#ff0b01] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                    Automate your renewals. Your payment method will be auto-debited at the end of each cycle. Cancel this mandate anytime from your settings.
                  </p>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                  paymentMode === 'autopay' ? 'text-[#ff0b01]' : 'text-gray-500'
                }`}>
                  Recurring Mandate
                </div>
              </div>
            </div>

            {/* Coupon Code Input (Only visible for Pay Once) */}
            {paymentMode === 'once' && (
              <div className="mb-6 space-y-2 animate-[fadeIn_0.2s_ease-out]">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">
                  Have a Coupon Code?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER COUPON CODE"
                    className="w-full pl-11 pr-4 py-3 bg-neutral-950/60 border border-neutral-800 focus:border-[#ff0b01] focus:ring-1 focus:ring-[#ff0b01]/30 rounded-2xl text-sm font-bold uppercase tracking-wider text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => {
                  const plan = selectedPlanForCheckout;
                  setSelectedPlanForCheckout(null);
                  handleSubscribe(plan, paymentMode === 'autopay', couponCode);
                }}
                disabled={payingPlanCode !== null}
                className="w-full py-4 bg-[#ff0b01] hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                {paymentMode === 'autopay' ? (
                  <>
                    Set Up Auto-Pay Mandate <Zap className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Proceed to Payment <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Cancel link */}
            <div className="text-center">
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
              >
                Cancel & Go Back
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Dialog Overlay */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="bg-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] max-w-md w-[90%] p-10 flex flex-col items-center text-center"
            style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff0b01] to-[#d80800] flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(255,11,1,0.3)]"
              style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Subscription Activated!
            </h2>

            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              Your <span className="font-bold text-[#ff0b01]">{successPlanName}</span> is now active.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Thank you for subscribing. Your salon subscription is now active. Please return to the mobile app to continue.
            </p>

            <div className="w-16 h-[3px] bg-gradient-to-r from-transparent via-[#ff0b01]/30 to-transparent rounded-full mb-8" />

            <button
              onClick={handleSuccessClose}
              className="w-full py-4 bg-[#ff0b01] hover:bg-[#d80800] text-white font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-[0_10px_25px_rgba(255,11,1,0.2)] hover:shadow-[0_15px_35px_rgba(255,11,1,0.3)] active:scale-95 cursor-pointer"
            >
              {isMobile ? 'Return to App' : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-neutral-850 py-6 px-6 md:px-12 text-center text-xs text-gray-500 mt-auto z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© {new Date().getFullYear()} NeoParlour Inc. All Rights Reserved.</span>
        <div className="flex gap-4">
          <a href="/customer/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/customer/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
};

export default PublicSubscriptionPlans;
