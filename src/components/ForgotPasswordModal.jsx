import React, { useState } from 'react';
import { Lock, Phone, KeyRound, ArrowLeft, CheckCircle, X, Sparkles } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Enter Mobile, 2: Enter OTP & New Password
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await staffApi.sendForgotPasswordOtp(mobile);
      toast.success(`OTP sent via WhatsApp to ${mobile}`);
      setStep(2);
    } catch (err) {
      toast.error('Failed to send OTP: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter OTP and new password');
      return;
    }
    setLoading(true);
    try {
      await staffApi.resetPasswordWithOtp(mobile, otp, newPassword, fullName);
      toast.success('Password reset successfully! Please log in with your new password.');
      handleClose();
    } catch (err) {
      toast.error('Failed to reset password: ' + (err.response?.data?.message || 'Invalid OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setMobile('');
    setOtp('');
    setNewPassword('');
    setFullName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF0B01] flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-[0.2em] text-[#FF0B01] uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Security Reset
            </span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Forgot Password</h3>
            <p className="text-xs font-semibold text-slate-400">Step {step} of 2</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Registered Phone Number*</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-red-500/15 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  'Send OTP via WhatsApp'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Enter OTP Code*</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP code"
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">New Password*</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Full Name (Optional)</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Staff full name"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
              />
            </div>
            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
