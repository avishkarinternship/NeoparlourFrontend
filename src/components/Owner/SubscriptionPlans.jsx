import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { updateOwnerSession, loginOwner } from '../../redux/slices/ownerStaffSlice';
import toast from 'react-hot-toast';
import { CheckCircle2, Tag, Zap, ArrowRight, Check, Crown, Sparkles, ShieldCheck, X } from 'lucide-react';

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Retrieve user session from Redux
  const ownerUser = useSelector((state) => state.ownerStaff?.user);
  const ownerToken = useSelector((state) => state.ownerStaff?.token);
  const storedUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
  const userId = ownerUser?.id || ownerUser?.userId || storedUser?.id || storedUser?.userId || '';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingPlanCode, setPayingPlanCode] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState('');

  // Per-card coupon tracking state: { [planCode]: { inputCode: '', validating: false, info: null, error: '' } }
  const [cardCoupons, setCardCoupons] = useState({});

  // Dynamically load Razorpay script immediately on mount
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

  // Fetch active subscription plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/subscriptions/plans-with-claims');
        setPlans(response.data || []);
      } catch (error) {
        console.error('Failed to load subscription plans with claims', error);
        try {
          const fallbackRes = await axiosInstance.get('/subscriptions/plans');
          setPlans(fallbackRes.data || []);
        } catch (fallbackErr) {
          toast.error('Could not fetch active subscription plans. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Attempt auto-login on mount if not authenticated but registration details exist
  useEffect(() => {
    if (!ownerToken) {
      const savedPhone = localStorage.getItem('tempRegisterPhone');
      const savedPassword = localStorage.getItem('tempRegisterPassword');
      if (savedPhone && savedPassword) {
        dispatch(loginOwner({ username: savedPhone, password: savedPassword }))
          .unwrap()
          .catch((loginErr) => {
            console.error('Auto login attempt on mount failed:', loginErr);
          });
      }
    }
  }, [ownerToken, dispatch]);

  const handleSkip = () => {
    toast('Subscription skipped. You can purchase a plan later from your dashboard.', {
      icon: 'ℹ️',
      style: { background: '#1c1c1e', color: '#fff', borderRadius: '16px' }
    });
    navigate('/owner/appointments');
  };

  // Update input text for a specific plan card's coupon
  const handleCouponInputChange = (planCode, text) => {
    setCardCoupons((prev) => ({
      ...prev,
      [planCode]: {
        ...prev[planCode],
        inputCode: text,
        info: null,
        error: ''
      }
    }));
  };

  // Clear coupon for a specific plan card
  const handleClearCardCoupon = (planCode) => {
    setCardCoupons((prev) => ({
      ...prev,
      [planCode]: {
        inputCode: '',
        validating: false,
        info: null,
        error: ''
      }
    }));
  };

  // Validate coupon for a specific plan card using backend API
  const handleValidateCardCoupon = async (planCode) => {
    const couponState = cardCoupons[planCode] || {};
    const code = (couponState.inputCode || '').trim();

    if (!code) {
      toast.error('Please enter a coupon code for this plan.');
      return;
    }
    if (!userId) {
      toast.error('User session not found. Please log in again.');
      return;
    }

    try {
      setCardCoupons((prev) => ({
        ...prev,
        [planCode]: { ...prev[planCode], validating: true, error: '' }
      }));

      const res = await axiosInstance.get(
        `/subscriptions/validate-coupon?couponCode=${encodeURIComponent(code)}&planCode=${planCode}&userId=${userId}`
      );

      const data = res.data;
      if (data && data.valid) {
        setCardCoupons((prev) => ({
          ...prev,
          [planCode]: {
            ...prev[planCode],
            validating: false,
            info: data,
            error: ''
          }
        }));
        if (data.isFree) {
          toast.success(`🎉 100% OFF Coupon "${code.toUpperCase()}" applied! Claim your free plan below.`);
        } else {
          toast.success(`Coupon "${code.toUpperCase()}" applied! Discount: ₹${(data.discountAmount / 100).toFixed(0)}.`);
        }
      } else {
        setCardCoupons((prev) => ({
          ...prev,
          [planCode]: { ...prev[planCode], validating: false, info: null, error: 'Invalid coupon' }
        }));
        toast.error('Invalid coupon code.');
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Invalid or expired coupon code.';
      setCardCoupons((prev) => ({
        ...prev,
        [planCode]: { ...prev[planCode], validating: false, info: null, error: errMsg }
      }));
      toast.error(errMsg);
    }
  };

  // Handle plan subscription CTA click
  const handleSubscribePlan = async (plan) => {
    const effectiveUserId = userId || ownerUser?.id || ownerUser?.userId || storedUser?.id || storedUser?.userId;

    if (!effectiveUserId) {
      toast.error('You must be logged in to purchase a subscription. Redirecting to login...');
      navigate('/owner/login');
      return;
    }

    const cardCoupon = cardCoupons[plan.planCode] || {};
    const code = (cardCoupon.inputCode || '').trim();
    const couponInfo = cardCoupon.info;
    const isFreePlan = couponInfo?.isFree || (couponInfo?.finalAmount === 0);

    try {
      setPayingPlanCode(plan.planCode);

      // ===== 100% FREE SUBSCRIPTION FLOW (NO RAZORPAY SDK CALL NEEDED) =====
      if (isFreePlan) {
        toast.loading('Activating your free subscription plan...', { id: 'free-activating' });
        try {
          // Attempt 1: Call activate-free endpoint directly
          await axiosInstance.post(
            `/subscriptions/activate-free?planCode=${plan.planCode}&userId=${effectiveUserId}&couponCode=${encodeURIComponent(code)}`
          );
        } catch (freeErr) {
          // Fallback to create-order endpoint if activate-free is handled there
          await axiosInstance.post(
            `/subscriptions/create-order?planCode=${plan.planCode}&userId=${effectiveUserId}&couponCode=${encodeURIComponent(code)}`
          );
        }

        // Re-login owner if registration details exist
        const savedPhone = localStorage.getItem('tempRegisterPhone');
        const savedPassword = localStorage.getItem('tempRegisterPassword');
        if (savedPhone && savedPassword) {
          try {
            await dispatch(loginOwner({ username: savedPhone, password: savedPassword })).unwrap();
          } catch (loginErr) {
            console.error('Re-login after free activation failed:', loginErr);
          }
        }

        localStorage.removeItem('tempSalonDetails');
        localStorage.removeItem('tempRegisterPhone');
        localStorage.removeItem('tempRegisterPassword');

        toast.dismiss('free-activating');
        setSuccessPlanName(plan.planName);
        setShowSuccessDialog(true);
        setPayingPlanCode(null);
        return;
      }

      // ===== STANDARD PAID ORDER FLOW (CALL RAZORPAY SDK) =====
      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Please refresh the page and try again.');
        setPayingPlanCode(null);
        return;
      }

      let url = `/subscriptions/create-order?planCode=${plan.planCode}&userId=${effectiveUserId}`;
      if (code) {
        url += `&couponCode=${encodeURIComponent(code)}`;
      }

      const response = await axiosInstance.post(url);
      const data = response.data;

      // Double-check if backend activated free subscription without Razorpay
      if ((data.success || data.ok) && (data.amount === 0 || data.freeActivated)) {
        setSuccessPlanName(plan.planName);
        setShowSuccessDialog(true);
        setPayingPlanCode(null);
        return;
      }

      if (!data.id) {
        toast.error("Failed to initiate payment order: " + (data.error || "Unknown error"));
        setPayingPlanCode(null);
        return;
      }

      // Save pending payment details to localStorage for network recovery
      localStorage.setItem('pending_subscription_payment', JSON.stringify({
        razorpayOrderId: data.id,
        planCode: plan.planCode,
        timestamp: Date.now()
      }));

      // Open Razorpay Checkout Payment Sheet
      const options = {
        key: data.key,
        order_id: data.id,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: "NeoParlour Salon Subscription",
        description: plan.planName,
        prefill: {
          name: ownerUser?.name || storedUser?.name || '',
          email: ownerUser?.email || storedUser?.email || '',
          contact: ownerUser?.phone || storedUser?.phone || ''
        },
        theme: {
          color: "#ff0b01"
        },
        handler: async function (transaction) {
          try {
            toast.loading('Verifying your payment...', { id: 'payment-verifying' });

            const verifyRes = await axiosInstance.post(
              `/subscriptions/verify-payment?razorpayOrderId=${transaction.razorpay_order_id}&razorpayPaymentId=${transaction.razorpay_payment_id}&razorpaySignature=${transaction.razorpay_signature}&userId=${effectiveUserId}`
            );

            const savedPhone = localStorage.getItem('tempRegisterPhone');
            const savedPassword = localStorage.getItem('tempRegisterPassword');
            if (savedPhone && savedPassword) {
              try {
                await dispatch(loginOwner({ username: savedPhone, password: savedPassword })).unwrap();
              } catch (loginErr) {
                console.error('Re-login after payment failed:', loginErr);
              }
            }

            localStorage.removeItem('tempSalonDetails');
            localStorage.removeItem('tempRegisterPhone');
            localStorage.removeItem('tempRegisterPassword');

            toast.dismiss('payment-verifying');
            if (verifyRes.data?.success) {
              localStorage.removeItem('pending_subscription_payment');
              setSuccessPlanName(plan.planName);
              setShowSuccessDialog(true);
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            toast.dismiss('payment-verifying');
            console.error('Payment verification failed', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Could not verify payment setup.';
            toast.error(errMsg);
          } finally {
            setPayingPlanCode(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingPlanCode(null);
            localStorage.removeItem('pending_subscription_payment');
            toast.error('Payment cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      window.activeRazorpayInstance = rzp;
      rzp.open();
    } catch (error) {
      console.error('Payment initiation failed', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Could not generate Razorpay payment. Please try again.';
      toast.error(errMsg);
      setPayingPlanCode(null);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate('/owner/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] font-sans relative flex flex-col items-center py-12 px-6">
      
      {/* Top Bar Actions */}
      <div className="w-full max-w-[1200px] flex justify-between items-center mb-10">
        <div>
          <h2 className="text-[12px] font-black text-gray-400 tracking-[0.4em] uppercase">{t('subscriptions_page.membership_plans', 'MEMBERSHIP PLANS')}</h2>
          <div className="relative mt-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('subscriptions_page.title', 'SUBSCRIPTION PLANS')}</h1>
            <div className="absolute -bottom-2.5 left-0 w-24 h-1 bg-[#ff0b01] rounded-full" />
          </div>
        </div>
        
        <button 
          onClick={handleSkip}
          className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-100 shadow-[0_4px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] rounded-2xl transition-all duration-300 transform active:scale-95 cursor-pointer"
        >
          {t('subscriptions_page.skip_button', 'Skip for now')}
        </button>
      </div>

      {/* Plans Grid */}
      <div className="w-full max-w-[1200px] flex-1 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="h-10 w-10 border-[4px] border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">{t('subscriptions_page.loading_plans', 'Loading Live Plans...')}</p>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full items-stretch">
            {plans.map((plan) => {
              const originalAmountRupees = plan.amountInPaise / 100;
              const isYearlyOrMulti = plan.durationMonths > 1;
              const monthlyCost = Math.round(originalAmountRupees / (plan.durationMonths || 1));
              const isFeatured = plan.planCode === '12month';

              // Coupon State for this plan card
              const couponState = cardCoupons[plan.planCode] || {};
              const couponInfo = couponState.info;
              const isFree = couponInfo?.isFree || (couponInfo?.finalAmount === 0);
              const finalAmountRupees = couponInfo ? (couponInfo.finalAmount / 100) : originalAmountRupees;
              const discountAmountRupees = couponInfo ? (couponInfo.discountAmount / 100) : 0;

              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-[32px] p-8 md:p-10 border transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] group overflow-hidden ${
                    isFeatured 
                      ? 'bg-[#ff0b01] border-transparent text-white' 
                      : 'bg-white border-gray-100 text-gray-900'
                  }`}
                >
                  {/* Subtle Pattern Backdrops */}
                  {isFeatured && (
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                  )}

                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      {/* Icon */}
                      <div className={`p-4 rounded-2xl flex items-center justify-center ${
                        isFeatured ? 'bg-white/10 text-white' : 'bg-[#ffebeb] text-[#ff0b01]'
                      }`}>
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2 4l3 6 7-8 7 8 3-6v16H2V4zm18 13v-3l-2.5-3-3.5 4-3-3-4.5 5H4v3h16z" />
                        </svg>
                      </div>

                      {/* Tier & Claims Badge */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          isFeatured ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isFeatured ? 'Platinum' : 'Gold'}
                        </span>
                        <div className={`px-2.5 py-0.5 rounded-xl text-[10px] font-bold flex items-center gap-1 ${
                          isFeatured ? 'bg-white/20 text-white' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                        }`}>
                          <CheckCircle2 className={`w-3 h-3 ${isFeatured ? 'text-white' : 'text-emerald-500'}`} />
                          <span>{plan.completedPaymentClaimCount ?? 0} Paid Subscriptions</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl font-extrabold tracking-tight">
                          ₹{finalAmountRupees}
                        </span>
                        {couponInfo && discountAmountRupees > 0 && (
                          <span className={`text-lg line-through font-bold ${isFeatured ? 'text-white/60' : 'text-gray-400'}`}>
                            ₹{originalAmountRupees}
                          </span>
                        )}
                        <span className={`text-sm ${isFeatured ? 'text-white/70' : 'text-gray-400'}`}>
                          / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>

                      {isFree ? (
                        <p className={`text-xs mt-2 font-black uppercase tracking-wider ${isFeatured ? 'text-yellow-300' : 'text-emerald-600'}`}>
                          🎉 100% OFF — FREE SUBSCRIPTION
                        </p>
                      ) : isYearlyOrMulti && (
                        <p className={`text-xs mt-2 font-semibold ${isFeatured ? 'text-white/80' : 'text-[#ff0b01]'}`}>
                          ₹{monthlyCost} / Month
                        </p>
                      )}
                    </div>

                    {/* Feature Checklist */}
                    <div className="space-y-4 mb-6">
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        isFeatured ? 'text-white/90' : 'text-gray-400'
                      }`}>What You Can Get?</p>
                      
                      <ul className="space-y-3 pl-0.5 text-sm font-medium">
                        <li className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isFeatured ? 'border-white/20 bg-white/10 text-white' : 'border-gray-100 bg-[#ffebeb]/30 text-[#ff0b01]'
                          }`}>
                            ✓
                          </div>
                          <span>Inventory Management</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isFeatured ? 'border-white/20 bg-white/10 text-white' : 'border-gray-100 bg-[#ffebeb]/30 text-[#ff0b01]'
                          }`}>
                            ✓
                          </div>
                          <span>Staff Management</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isFeatured ? 'border-white/20 bg-white/10 text-white' : 'border-gray-100 bg-[#ffebeb]/30 text-[#ff0b01]'
                          }`}>
                            ✓
                          </div>
                          <span>Advanced Analytics</span>
                        </li>
                      </ul>
                    </div>

                    {/* Per-Card Subscription Coupon Field */}
                    <div className="mt-4 mb-6">
                      <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                        isFeatured ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        Have a Coupon Code?
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={couponState.inputCode || ''}
                            onChange={(e) => handleCouponInputChange(plan.planCode, e.target.value)}
                            placeholder="ENTER CODE"
                            className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none transition ${
                              isFeatured
                                ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:bg-white/20'
                                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#ff0b01]'
                            }`}
                          />
                          {couponState.inputCode && (
                            <button
                              type="button"
                              onClick={() => handleClearCardCoupon(plan.planCode)}
                              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                                isFeatured ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleValidateCardCoupon(plan.planCode)}
                          disabled={couponState.validating || !(couponState.inputCode || '').trim()}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0 disabled:opacity-50 ${
                            isFeatured
                              ? 'bg-white text-[#ff0b01] hover:bg-white/90'
                              : 'bg-gray-900 text-white hover:bg-black'
                          }`}
                        >
                          {couponState.validating ? '...' : 'Apply'}
                        </button>
                      </div>

                      {couponInfo && (
                        <div className={`mt-2 p-2 rounded-lg text-[11px] font-bold flex items-center justify-between ${
                          isFeatured ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        }`}>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            {couponInfo.couponCode} Applied!
                          </span>
                          {discountAmountRupees > 0 && (
                            <span>-₹{discountAmountRupees}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <button 
                    onClick={() => handleSubscribePlan(plan)}
                    disabled={payingPlanCode !== null}
                    className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transform transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer ${
                      isFree
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.3)]'
                        : isFeatured 
                          ? 'bg-white text-[#ff0b01] hover:bg-white/90 shadow-[0_10px_25px_rgba(255,255,255,0.1)]' 
                          : 'bg-[#ff0b01] text-white hover:bg-[#d80800] shadow-[0_10px_25px_rgba(255,11,1,0.15)]'
                    }`}
                  >
                    {payingPlanCode === plan.planCode ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className={`h-4 w-4 border-2 rounded-full animate-spin ${
                          isFree ? 'border-white/25 border-t-white' : isFeatured ? 'border-[#ff0b01]/25 border-t-[#ff0b01]' : 'border-white/25 border-t-white'
                        }`} />
                        Processing...
                      </div>
                    ) : isFree ? (
                      'Claim Free Plan 🎉'
                    ) : isFeatured ? (
                      'Upgrade Plan'
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 max-w-lg">
            <p className="text-gray-500 font-medium">No active subscription plans found. Please contact support.</p>
          </div>
        )}
      </div>

      {/* ====== Success Dialog Overlay ====== */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="bg-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] max-w-md w-[90%] p-10 flex flex-col items-center text-center"
            style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            
            {/* Success Checkmark Circle */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff0b01] to-[#d80800] flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(255,11,1,0.3)]"
              style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Subscription Activated!
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              Your <span className="font-bold text-[#ff0b01]">{successPlanName}</span> plan has been successfully activated.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Your salon has been created and is ready to go. Welcome to NeoParlour!
            </p>

            {/* Divider */}
            <div className="w-16 h-[3px] bg-gradient-to-r from-transparent via-[#ff0b01]/30 to-transparent rounded-full mb-8" />

            {/* CTA Button */}
            <button
              onClick={handleSuccessClose}
              className="w-full py-4 bg-[#ff0b01] hover:bg-[#d80800] text-white font-bold text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-[0_10px_25px_rgba(255,11,1,0.2)] hover:shadow-[0_15px_35px_rgba(255,11,1,0.3)] active:scale-95 cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Inline keyframe animations for the dialog */}
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

export default SubscriptionPlans;
