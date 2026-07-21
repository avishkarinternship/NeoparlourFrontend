import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Phone, KeyRound, Sparkles, Send, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

// Using existing assets
import logoIcon from '../../assets/Neoparlour_logo.png';
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

const OwnerForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
    const [resetFlow, setResetFlow] = useState({
        mobile: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
        resendTimer: 0
    });
    const [showPassword, setShowPassword] = useState(false);

    const { mobile, otp, newPassword, confirmPassword, loading, resendTimer } = resetFlow;

    // Resend OTP cooldown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResetFlow(prev => ({ ...prev, resendTimer: prev.resendTimer - 1 }));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        
        if (!mobile) {
            toast.error("Please enter your mobile number", toastStyle);
            return;
        }
        if (!/^[0-9]{10}$/.test(mobile)) {
            toast.error("Mobile number must be exactly 10 digits", toastStyle);
            return;
        }

        setResetFlow(prev => ({ ...prev, loading: true }));
        try {
            await axiosInstance.post(`/auth/forgot-password/send-otp?mobile=${mobile}`);
            toast.success("OTP sent successfully to your mobile number", toastStyle);
            setStep(2);
            setResetFlow(prev => ({ ...prev, resendTimer: 60 }));
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send OTP. Please verify your mobile number.";
            toast.error(msg, toastStyle);
        } finally {
            setResetFlow(prev => ({ ...prev, loading: false }));
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp) {
            toast.error("Please enter the OTP", toastStyle);
            return;
        }
        if (!newPassword) {
            toast.error("Please enter a new password", toastStyle);
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters", toastStyle);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match", toastStyle);
            return;
        }

        setResetFlow(prev => ({ ...prev, loading: true }));
        try {
            await axiosInstance.post('/auth/forgot-password/reset', null, {
                params: {
                    mobile,
                    otp,
                    newPassword
                }
            });
            toast.success("Password reset successfully. Please log in with your new password.", toastStyle);
            navigate('/owner/login');
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to reset password. Please check the OTP.";
            toast.error(msg, toastStyle);
        } finally {
            setResetFlow(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
            {/* Left Form Side */}
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
                            <Sparkles className="w-3.5 h-3.5" /> Security Center
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">
                            Reset Password
                        </h2>
                        <p className="text-gray-400 font-medium text-xs">
                            {step === 1 
                                ? "Enter your registered mobile number below to receive an OTP." 
                                : "Enter the verification code and your new password."
                            }
                        </p>
                    </div>

                    {step === 1 ? (
                        /* Step 1: Send OTP Form */
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setResetFlow(prev => ({ ...prev, mobile: val }));
                                    }}
                                    placeholder="Registered 10 digit number"
                                    required
                                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all mt-4 shadow-xl flex items-center justify-center gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                            >
                                {loading && (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'SENDING OTP...' : 'SEND OTP'}
                            </button>

                            <div className="pt-4 text-center">
                                <Link to="/owner/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#ff0b01] transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        /* Step 2: Reset Form */
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {/* OTP */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setResetFlow(prev => ({ ...prev, otp: e.target.value }))}
                                    placeholder="Enter 6-digit OTP"
                                    required
                                    maxLength="6"
                                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold"
                                />
                            </div>

                            {/* New Password */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setResetFlow(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="New Password (min 6 chars)"
                                    required
                                    className="w-full pl-14 pr-10 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setResetFlow(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirm Password"
                                    required
                                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all mt-4 shadow-xl flex items-center justify-center gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                            >
                                {loading && (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}
                            </button>

                            <div className="pt-4 flex justify-between items-center px-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="font-bold text-gray-400 hover:text-[#ff0b01] transition-colors"
                                >
                                    Change Number
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={resendTimer > 0 || loading}
                                    className="font-black text-[#ff0b01] hover:text-red-700 disabled:text-gray-300 transition-colors"
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Image Side */}
            <div className="hidden lg:block lg:flex-1 relative bg-gray-100 h-screen overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    <img 
                        src={rightBackground} 
                        alt="Professional looking at tablet" 
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#8a1a16]/95 via-[#8a1a16]/50 to-transparent"></div>
                    <div className="absolute bottom-20 left-20 text-white max-w-lg" data-aos="fade-up" data-aos-delay="500">
                        <h2 className="text-5xl font-black mb-4 leading-tight tracking-tighter">Elevate Your Salon Experience.</h2>
                        <p className="text-lg text-white/80 font-medium tracking-wide leading-relaxed">The ultimate platform for professionals and beauty enthusiasts.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerForgotPassword;
