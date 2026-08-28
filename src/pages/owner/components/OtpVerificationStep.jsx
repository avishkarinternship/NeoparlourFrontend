import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const OtpVerificationStep = ({
  phone = '',
  otp = '',
  setOtp,
  onResendOtp,
  isDarkMode = false
}) => {
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await onResendOtp();
      setTimer(60);
      setCanResend(false);
      toast.success(`OTP re-sent to +91 ${phone}`);
    } catch (err) {
      toast.error("Failed to resend OTP.");
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50/70 border-slate-200'
    }`}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#FF2A14]" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Mobile OTP Verification
        </h4>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Enter 6-Digit OTP *</span>
          <span className="text-[10px] text-slate-400 font-mono">Sent to +91 {phone || 'XXXXXXXXXX'}</span>
        </label>

        <input
          type="text"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 123456"
          className={`w-full p-3 rounded-xl text-center font-mono text-lg font-black tracking-widest border focus:outline-none focus:border-[#FF2A14] transition ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-400 text-[11px]">
          {canResend ? "Didn't receive OTP?" : `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}`}
        </span>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={`font-bold flex items-center gap-1 cursor-pointer text-xs transition ${
            canResend
              ? 'text-[#FF2A14] hover:underline'
              : 'text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <RefreshCw className="w-3 h-3" />
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerificationStep;
