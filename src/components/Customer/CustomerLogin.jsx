import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginCustomerWithOtp, clearCustomerError, switchTenant } from '../../redux/slices/customerSlice';
import { Sparkles, AlertCircle, Phone, Lock, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

// Using existing assets
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import rightBackground from '../../assets/CustomerLogin/right_background.jpg';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '16px',
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  }
};

const CustomerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Pulling customer state from redux thunks
  const { loading, error } = useSelector((state) => state.customer);

  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearCustomerError());
    
    // Load saved mobile number if present
    const savedMobile = localStorage.getItem('neoparlour_remembered_mobile');
    if (savedMobile) {
      setMobile(savedMobile);
      setRememberMe(true);
    }
  }, [dispatch]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!mobile || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      setLocalError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSendingOtp(true);
    setLocalError('');
    dispatch(clearCustomerError());

    try {
      const response = await axiosInstance.post(`/customer/send-otp?mobile=${mobile}`);
      if (response.data?.ok) {
        toast.success(response.data.message || 'OTP sent successfully!', toastStyle);
        setStep('otp');
        setTimer(30);
      } else {
        setLocalError(response.data?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setLocalError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleEditMobile = () => {
    setStep('phone');
    setOtp('');
    setLocalError('');
    dispatch(clearCustomerError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setLocalError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLocalError('');
    dispatch(clearCustomerError());

    dispatch(loginCustomerWithOtp({
      mobile: Number(mobile),
      otp: Number(otp)
    })).unwrap().then((res) => {
      // Save or clear mobile number based on rememberMe selection
      if (rememberMe) {
        localStorage.setItem('neoparlour_remembered_mobile', mobile);
      } else {
        localStorage.removeItem('neoparlour_remembered_mobile');
      }

      const customerToken = res?.token;
      const activeSalonId = localStorage.getItem('activeSalonId');
      const activeSalonName = localStorage.getItem('activeSalonName') || 'Selected Salon';
      
      if (activeSalonId && customerToken) {
        dispatch(switchTenant({
          token: customerToken,
          salonId: activeSalonId,
          salonName: activeSalonName
        })).unwrap().then(() => {
          const from = location.state?.from || '/';
          navigate(from, { state: location.state?.bookingState });
        }).catch(() => {
          const from = location.state?.from || '/';
          navigate(from);
        });
      } else {
        const from = location.state?.from || '/';
        navigate(from);
      }
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* Left Form Side - Full Height */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col items-center justify-center py-12 md:py-16 px-8 sm:px-16 lg:px-20 bg-white z-10">
        <div className="w-full max-w-[420px]" data-aos="fade-right" data-aos-delay="200">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-10 justify-center lg:justify-start">
            <img src={logoIcon} alt="NeoParlour Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">NeoParlour</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#ff0b01]/80 uppercase mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Premium Grooming
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">
              Customer Login
            </h2>
            <p className="text-gray-400 font-medium text-xs">
              {step === 'phone' 
                ? 'Sign in to view nearby salons, book appointments, and manage beauty services.'
                : 'Enter the 6-digit verification code sent to your mobile number.'}
            </p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl border border-red-100 shadow-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Blinkit/District-style login flow */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {step === 'phone' ? (
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                    <Phone className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="absolute inset-y-0 left-12 flex items-center text-sm font-bold text-gray-500">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    name="mobile"
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobile(val);
                    }}
                    placeholder="Enter mobile number" 
                    required
                    className="w-full pl-24 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold tracking-wide" 
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-[#ff0b01] border-gray-300 rounded focus:ring-[#ff0b01] accent-[#ff0b01] cursor-pointer" 
                  />
                  <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer font-bold">
                    Remember my mobile number
                  </label>
                </div>

                <button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || mobile.length !== 10}
                  className={`w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all mt-4 shadow-xl flex items-center justify-center gap-4 ${sendingOtp || mobile.length !== 10 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                  {sendingOtp && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {sendingOtp ? 'SENDING OTP...' : 'SEND OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Preview & Edit Info */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#ff0b01] font-bold text-sm">
                      +91
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Mobile Number</p>
                      <p className="text-sm font-black text-gray-800">{mobile}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleEditMobile}
                    className="text-xs font-bold text-[#ff0b01] hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                    <Lock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input 
                    type="tel" 
                    name="otp"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    placeholder="Enter 6-digit OTP" 
                    required
                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold tracking-[0.5em] text-center" 
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-400 py-1">
                  <span>Didn't receive OTP?</span>
                  {timer > 0 ? (
                    <span className="text-gray-500">Resend in {timer}s</span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleSendOtp} 
                      className="text-[#ff0b01] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                  className={`w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all mt-4 shadow-xl flex items-center justify-center gap-4 ${loading || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                </button>
              </div>
            )}
          </form>

          {/* Login Options & Help */}
          <div className="mt-8 space-y-4">
            <div className="text-xs space-y-2 border-t pt-4">
              <p className="text-gray-400 font-semibold">
                Are you an Owner or Staff? <Link to="/owner/login" className="text-[#ff0b01] font-black hover:underline ml-1.5">Owner Login</Link>
              </p>
              <p className="text-gray-400 font-semibold">
                Don't have account? <Link to="/register" className="text-[#ff0b01] font-black hover:underline ml-1.5">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Side - Full Screen Cover */}
      <div className="hidden lg:block lg:flex-1 relative bg-gray-100 h-screen overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={rightBackground} 
            alt="Professional looking at tablet" 
            className="w-full h-full object-cover scale-105"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8a1a16]/95 via-[#8a1a16]/50 to-transparent"></div>
          
          {/* Full-screen impact text */}
          <div className="absolute bottom-20 left-20 text-white max-w-lg" data-aos="fade-up" data-aos-delay="500">
            <h2 className="text-5xl font-black mb-4 leading-tight tracking-tighter">Elevate Your Salon Experience.</h2>
            <p className="text-lg text-white/80 font-medium tracking-wide leading-relaxed">The ultimate platform for professionals and beauty enthusiasts.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerLogin;