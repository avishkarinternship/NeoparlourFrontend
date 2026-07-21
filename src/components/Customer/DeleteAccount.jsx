import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendDeleteCustomerOtp, verifyDeleteCustomerOtp, logoutCustomer } from '../../redux/slices/customerSlice';
import { sendDeleteUserOtp, verifyDeleteUserOtp, logoutOwnerStaff } from '../../redux/slices/ownerStaffSlice';
import { Sparkles, AlertCircle, Phone, Lock, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDarkMode } from '../../context/DarkModeContext';
import logoIcon from '../../assets/Neoparlour_logo.png';

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

export default function DeleteAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const [activeTab, setActiveTab] = useState('CUSTOMER'); // 'CUSTOMER' or 'PARTNER'
  const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Enter OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [timer, setTimer] = useState(0);

  // Checkboxes for danger zone acknowledgement
  const [ackGrace, setAckGrace] = useState(false);
  const [ackSalon, setAckSalon] = useState(false);

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
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
      setLocalError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      if (activeTab === 'CUSTOMER') {
        await dispatch(sendDeleteCustomerOtp(phone)).unwrap();
      } else {
        await dispatch(sendDeleteUserOtp(phone)).unwrap();
      }
      toast.success('OTP sent successfully!', toastStyle);
      setStep(2);
      setTimer(30);
    } catch (err) {
      setLocalError(err || 'Failed to send OTP. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setLocalError('Please enter a valid 6-digit OTP.');
      return;
    }
    if (!ackGrace) {
      setLocalError('You must acknowledge the 30-day grace period.');
      return;
    }
    if (activeTab === 'PARTNER' && !ackSalon) {
      setLocalError('You must acknowledge the salon listing deactivation.');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      let message = '';
      if (activeTab === 'CUSTOMER') {
        message = await dispatch(verifyDeleteCustomerOtp({ mobile: phone, otp })).unwrap();
      } else {
        message = await dispatch(verifyDeleteUserOtp({ phone, otp })).unwrap();
      }

      toast.success(message || 'Account successfully scheduled for deletion.', toastStyle);

      // Perform local session logout
      dispatch(logoutCustomer());
      dispatch(logoutOwnerStaff());

      // Redirect home
      navigate('/');
    } catch (err) {
      setLocalError(err || 'Verification failed. Incorrect or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setOtp('');
    setLocalError('');
  };

  return (
    <div className={`min-h-[80vh] flex items-center justify-center font-sans p-6 transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl transition-all duration-300 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}>
        
        {/* Brand identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <img src={logoIcon} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-black tracking-tight text-red-500 uppercase">NeoParlour</span>
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] text-red-500 uppercase mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Security Hub
          </span>
          <h1 className="text-2xl font-black uppercase text-center leading-tight">Delete Your Account</h1>
          <p className={`text-xs font-semibold text-center mt-1.5 max-w-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
            Permanently delete your account. You can restore it anytime within 30 days.
          </p>
        </div>

        {/* Tab selection (only when on step 1) */}
        {step === 1 && (
          <div className={`flex rounded-2xl p-1 mb-8 ${isDark ? 'bg-zinc-950' : 'bg-gray-100'}`}>
            <button
              onClick={() => {
                setActiveTab('CUSTOMER');
                setLocalError('');
                setPhone('');
              }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                activeTab === 'CUSTOMER'
                  ? 'bg-red-500 text-white shadow-md'
                  : `text-gray-500 ${isDark ? 'hover:text-zinc-300' : 'hover:text-gray-800'}`
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                setActiveTab('PARTNER');
                setLocalError('');
                setPhone('');
              }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                activeTab === 'PARTNER'
                  ? 'bg-red-500 text-white shadow-md'
                  : `text-gray-500 ${isDark ? 'hover:text-zinc-300' : 'hover:text-gray-800'}`
              }`}
            >
              Partner / Staff
            </button>
          </div>
        )}

        {/* Local error banner */}
        {localError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl mb-6 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-bold leading-relaxed">{localError}</span>
          </div>
        )}

        {/* Step 1: Input Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider pl-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                Registered Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  required
                  className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-extrabold outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-950 border border-zinc-800 text-white focus:border-red-500 focus:bg-zinc-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 focus:border-red-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition cursor-pointer text-white ${
                phone.length === 10 && !loading
                  ? 'bg-[#FF2A14] hover:bg-[#E01E0A] shadow-lg shadow-red-500/10'
                  : 'bg-zinc-300 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
              }`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Input OTP & Consequence */}
        {step === 2 && (
          <form onSubmit={handleConfirmDelete} className="space-y-6 animate-in slide-in-from-right-1 duration-200">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={handleBackToStep1}
                className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Change number"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                OTP sent to <span className="font-extrabold text-red-500">+91 {phone}</span>
              </span>
            </div>

            {/* OTP Entry */}
            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-wider pl-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP code"
                  required
                  className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-extrabold outline-none tracking-[0.25em] text-center transition-all ${
                    isDark
                      ? 'bg-zinc-950 border border-zinc-800 text-white focus:border-red-500 focus:bg-zinc-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 focus:border-red-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Danger Zone Warning Checks */}
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Safety Confirmations
              </h4>
              
              {/* Check 1: 30 days recovery grace */}
              <label className="flex items-start gap-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ackGrace}
                  onChange={(e) => setAckGrace(e.target.checked)}
                  className="w-4.5 h-4.5 mt-0.5 accent-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 leading-normal">
                  I understand that my account data will be scheduled for permanent deletion, and I have a 30-day grace period to recover it by logging back in.
                </span>
              </label>

              {/* Check 2: Salon owner implications */}
              {activeTab === 'PARTNER' && (
                <label className="flex items-start gap-3.5 cursor-pointer animate-in fade-in duration-200">
                  <input
                    type="checkbox"
                    checked={ackSalon}
                    onChange={(e) => setAckSalon(e.target.checked)}
                    className="w-4.5 h-4.5 mt-0.5 accent-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-[11px] font-bold text-red-500 dark:text-red-400 leading-normal">
                    [SALON OWNER WARNING] I understand that deactivating my account will permanently deactivate my salon listings and revoke all associated staff access.
                  </span>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3.5 pt-4">
              <button
                type="submit"
                disabled={loading || otp.length !== 6 || !ackGrace || (activeTab === 'PARTNER' && !ackSalon)}
                className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition cursor-pointer text-white ${
                  otp.length === 6 && ackGrace && (activeTab !== 'PARTNER' || ackSalon) && !loading
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                    : 'bg-zinc-300 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
                }`}
              >
                {loading ? 'Deleting Account...' : 'Confirm Delete Account'}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={timer > 0 || loading}
                className={`text-xs font-black uppercase tracking-widest text-center py-2 transition ${
                  timer === 0 && !loading
                    ? 'text-red-500 hover:text-red-600 cursor-pointer'
                    : 'text-zinc-400 cursor-not-allowed dark:text-zinc-600'
                }`}
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
