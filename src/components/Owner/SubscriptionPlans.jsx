import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { updateOwnerSession, loginOwner } from '../../redux/slices/ownerStaffSlice';
import toast from 'react-hot-toast';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Retrieve user session
  const ownerUser = useSelector((state) => state.ownerStaff?.user);
  const ownerToken = useSelector((state) => state.ownerStaff?.token);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanCode, setSelectedPlanCode] = useState(null);
  const [payingPlanCode, setPayingPlanCode] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState('');

  // Retrieve salon details from navigation state or localStorage fallback
  const salonDetails = location.state?.salonDetails || JSON.parse(localStorage.getItem('tempSalonDetails')) || null;

  // Dynamically load Razorpay script immediately on mount
  useEffect(() => {
    if (document.getElementById('razorpay-checkout-script') || window.Razorpay) {
      return; // Already loaded or loading
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch plans on mount
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

  const handleSkip = () => {
    toast('Subscription skipped. You can purchase a plan later from your dashboard.', {
      icon: 'ℹ️',
      style: { background: '#1c1c1e', color: '#fff', borderRadius: '16px' }
    });
    navigate('/owner/appointments');
  };

  const handleSubscribe = async (plan) => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK failed to load. Please refresh the page and try again.');
      return;
    }

    try {
      setPayingPlanCode(plan.planCode);
      
      // 1. Create order on the backend with @RequestParam: planCode & userId
      const orderResponse = await axiosInstance.post(`/subscriptions/create-order?planCode=${plan.planCode}&userId=${ownerUser?.id || ''}`);
      const orderData = orderResponse.data;

      // Backend returns "id" (not "order_id") as the Razorpay order identifier
      const razorpayOrderId = orderData.id;

      // 2. Open Razorpay Checkout Payment Sheet
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NeoParlour Network",
        description: `Subscription: ${orderData.planCode || plan.planCode}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            toast.loading('Verifying your payment and setting up your salon...', { id: 'payment-verifying' });
            
            // Use razorpay response values, with stored orderId as fallback
            const orderId = response.razorpay_order_id || razorpayOrderId;
            const paymentId = response.razorpay_payment_id;
            const signature = response.razorpay_signature;

            // 3. Verify Payment on backend using @RequestParam query params
            const verifyResponse = await axiosInstance.post(
              `/subscriptions/verify-payment?razorpayOrderId=${encodeURIComponent(orderId)}&razorpayPaymentId=${encodeURIComponent(paymentId)}&razorpaySignature=${encodeURIComponent(signature)}&userId=${ownerUser?.id || ''}`
            );

            const { success, message } = verifyResponse.data;

            if (success) {
              // 4. Re-login the owner to get a fresh JWT token containing the new salonId
              const savedPhone = localStorage.getItem('tempRegisterPhone');
              const savedPassword = localStorage.getItem('tempRegisterPassword');

              if (savedPhone && savedPassword) {
                try {
                  await dispatch(loginOwner({ username: savedPhone, password: savedPassword })).unwrap();
                } catch (loginErr) {
                  console.error('Re-login after payment failed:', loginErr);
                }
              }

              // Clean up temporary local storage variables
              localStorage.removeItem('tempSalonDetails');
              localStorage.removeItem('tempRegisterPhone');
              localStorage.removeItem('tempRegisterPassword');

              toast.dismiss('payment-verifying');

              // Show the beautiful success dialog
              setSuccessPlanName(plan.planName);
              setShowSuccessDialog(true);
            } else {
              toast.dismiss('payment-verifying');
              toast.error(message || 'Payment verification failed.');
            }
          } catch (err) {
            toast.dismiss('payment-verifying');
            console.error('Payment verification failed', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Could not verify payment. Please contact support.';
            toast.error(errMsg);
          } finally {
            setPayingPlanCode(null);
          }
        },
        prefill: {
          name: ownerUser?.name || '',
          email: ownerUser?.email || '',
          contact: ownerUser?.phone || ''
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

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Order creation failed', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Could not generate Razorpay order. Please try again.';
      toast.error(errMsg);
      setPayingPlanCode(null);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate('/owner/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] font-sans relative flex flex-col items-center py-16 px-6">
      
      {/* Top Bar Actions */}
      <div className="w-full max-w-[1200px] flex justify-between items-center mb-16">
        <div>
          <h2 className="text-[12px] font-black text-gray-400 tracking-[0.4em] uppercase">Membership Plans</h2>
          <div className="relative mt-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SUBSCRIPTION PLAN</h1>
            <div className="absolute -bottom-2.5 left-0 w-24 h-1 bg-[#ff0b01] rounded-full" />
          </div>
        </div>
        
        <button 
          onClick={handleSkip}
          className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-100 shadow-[0_4px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] rounded-2xl transition-all duration-300 transform active:scale-95 cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      {/* Plans Container */}
      <div className="w-full max-w-[1200px] flex-1 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="h-10 w-10 border-[4px] border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Loading Premium Plans</p>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {plans.map((plan) => {
              const amountInRupees = plan.amountInPaise / 100;
              const isYearlyOrMulti = plan.durationMonths > 1;
              const monthlyCost = Math.round(amountInRupees / (plan.durationMonths || 1));
              
              // We designate the 12 Months (yearly) plan as our stunning "Featured/Platinum" plan matching the mockup
              const isFeatured = plan.planCode === '12month';

              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-[32px] p-8 md:p-10 border transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transform hover:-translate-y-2 group overflow-hidden ${
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

                      {/* Tier Tag */}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        isFeatured ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isFeatured ? 'Platinum' : 'Gold'}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight">₹{amountInRupees}</span>
                        <span className={`text-sm ${isFeatured ? 'text-white/70' : 'text-gray-400'}`}>
                          / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>
                      {isYearlyOrMulti && (
                        <p className={`text-xs mt-2 font-semibold ${isFeatured ? 'text-white/80' : 'text-[#ff0b01]'}`}>
                          ₹{monthlyCost} / Month
                        </p>
                      )}
                    </div>

                    {/* Feature Checklist */}
                    <div className="space-y-4 mb-8">
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        isFeatured ? 'text-white/90' : 'text-gray-400'
                      }`}>What You Can Get?</p>
                      
                      <ul className="space-y-3.5">
                        <li className="flex items-center gap-3.5 text-sm font-medium">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isFeatured ? 'border-white/20 bg-white/10 text-white' : 'border-gray-100 bg-[#ffebeb]/30 text-[#ff0b01]'
                          }`}>
                            ✓
                          </div>
                          <span>Inventory Management</span>
                        </li>
                        <li className="flex items-center gap-3.5 text-sm font-medium">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isFeatured ? 'border-white/20 bg-white/10 text-white' : 'border-gray-100 bg-[#ffebeb]/30 text-[#ff0b01]'
                          }`}>
                            ✓
                          </div>
                          <span>Staff Management</span>
                        </li>
                        <li className="flex items-center gap-3.5 text-sm font-medium">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            isFeatured ? 'border-white/20 bg-white/10 text-white' : 'border-gray-100 bg-[#ffebeb]/30 text-[#ff0b01]'
                          }`}>
                            ✓
                          </div>
                          <span>Advanced Analytics</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <button 
                    onClick={() => handleSubscribe(plan)}
                    disabled={payingPlanCode !== null}
                    className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transform transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer ${
                      isFeatured 
                        ? 'bg-white text-[#ff0b01] hover:bg-white/90 shadow-[0_10px_25px_rgba(255,255,255,0.1)]' 
                        : 'bg-[#ff0b01] text-white hover:bg-[#d80800] shadow-[0_10px_25px_rgba(255,11,1,0.15)]'
                    }`}
                  >
                    {payingPlanCode === plan.planCode ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className={`h-4 w-4 border-2 rounded-full animate-spin ${isFeatured ? 'border-[#ff0b01]/25 border-t-[#ff0b01]' : 'border-white/25 border-t-white'}`} />
                        Processing...
                      </div>
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
