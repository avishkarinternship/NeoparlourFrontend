import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Phone, Lock, Eye, EyeOff, KeyRound, Sparkles, Send } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { logoutCustomer } from '../../redux/slices/customerSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PasswordResetModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, profile } = useSelector((state) => state.customer);

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

    // Initialize mobile number if user is logged in
    useEffect(() => {
        if (isOpen) {
            const currentMobile = profile?.mobile || user?.mobile || user?.phone || '';
            setResetFlow({
                mobile: currentMobile,
                otp: '',
                newPassword: '',
                confirmPassword: '',
                loading: false,
                resendTimer: 0
            });
            setStep(1);
        }
    }, [isOpen, user, profile]);

    // Resend OTP cooldown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResetFlow(prev => ({ ...prev, resendTimer: prev.resendTimer - 1 }));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    if (!isOpen) return null;

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        
        if (!mobile) {
            toast.error("Please enter your mobile number");
            return;
        }
        if (!/^[0-9]{10}$/.test(mobile)) {
            toast.error("Mobile number must be exactly 10 digits");
            return;
        }

        setResetFlow(prev => ({ ...prev, loading: true }));
        try {
            await axiosInstance.post(`/customer/forgot-password/send-otp?mobile=${mobile}`);
            toast.success("OTP sent successfully to your mobile number");
            setStep(2);
            setResetFlow(prev => ({ ...prev, resendTimer: 60 }));
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send OTP. Please verify your mobile number.";
            toast.error(msg);
        } finally {
            setResetFlow(prev => ({ ...prev, loading: false }));
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp) {
            toast.error("Please enter the OTP");
            return;
        }
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setResetFlow(prev => ({ ...prev, loading: true }));
        try {
            await axiosInstance.post('/customer/forgot-password/reset', {
                mobile,
                otp,
                newPassword
            });
            toast.success("Password reset successfully. Please log in with your new password.");
            
            // If the user was logged in, log them out client-side
            if (user) {
                dispatch(logoutCustomer());
            }
            onClose();
            navigate('/customer/login');
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to reset password. Please check the OTP.";
            toast.error(msg);
        } finally {
            setResetFlow(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 transition-all duration-300 font-sans">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 z-10 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                    {/* Header Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#FF2A14] flex items-center justify-center shadow-sm mb-4">
                        <KeyRound className="w-7 h-7" />
                    </div>

                    <span className="text-[9px] font-black tracking-[0.2em] text-[#FF2A14]/80 uppercase mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Security Center
                    </span>
                    
                    <h3 className="text-xl font-black text-gray-900 tracking-tight text-center uppercase mb-6">
                        {user ? 'Change Password' : 'Reset Password'}
                    </h3>

                    {step === 1 ? (
                        /* Step 1: Send OTP Form */
                        <form onSubmit={handleSendOtp} className="w-full space-y-5">
                            <p className="text-xs text-gray-400 font-medium text-center leading-relaxed mb-2">
                                Enter your registered mobile number below. We will send you an OTP to verify your identity.
                            </p>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF2A14] transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setResetFlow(prev => ({ ...prev, mobile: e.target.value }))}
                                    placeholder="Registered 10 digit number"
                                    required
                                    disabled={!!user} // Block editing if already logged in
                                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400 disabled:opacity-65 disabled:bg-gray-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] disabled:bg-red-400 text-white py-4 rounded-2xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer text-xs uppercase tracking-widest"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? 'SENDING...' : 'SEND VERIFICATION OTP'}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: Verification and Reset Password Form */
                        <form onSubmit={handleResetPassword} className="w-full space-y-4">
                            <p className="text-xs text-gray-400 font-medium text-center leading-relaxed mb-2">
                                We sent a 6-digit OTP to <span className="font-bold text-gray-600">{mobile}</span>. Enter the code and your new security credentials.
                            </p>

                            {/* OTP input */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">OTP Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setResetFlow(prev => ({ ...prev, otp: e.target.value }))}
                                    placeholder="Enter OTP"
                                    required
                                    maxLength="6"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400 text-center tracking-[0.25em]"
                                />
                            </div>

                            {/* New Password */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF2A14] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setResetFlow(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="Min 6 characters"
                                        required
                                        className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#FF2A14] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider pl-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF2A14] transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setResetFlow(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="Repeat new password"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Submit and Resend */}
                            <div className="pt-2 space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] disabled:bg-red-400 text-white py-3.5 rounded-2xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer text-xs uppercase tracking-widest"
                                >
                                    <KeyRound className="w-4 h-4" />
                                    {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                                </button>

                                <div className="text-center">
                                    {resendTimer > 0 ? (
                                        <span className="text-[11px] font-bold text-gray-400">
                                            Resend OTP in {resendTimer}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            className="text-[11px] font-extrabold text-[#FF2A14] hover:underline uppercase tracking-wider"
                                        >
                                            Resend Verification OTP
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordResetModal;
