import React, { useState } from 'react';
import { X, Store, User, Mail, Phone, Lock, MapPin, Building, ShieldCheck, Sparkles, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import CompulsoryGalleryUploader from './components/CompulsoryGalleryUploader';
import OtpVerificationStep from './components/OtpVerificationStep';
import salonRegistrationService from '../../services/salonRegistrationService';

const SalonRegistrationModal = ({ isOpen, onClose, onSuccess, isDarkMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    salonName: '',
    cityName: '',
    areaName: '',
    specificAddress: '',
    openingTime: '09:00',
    closingTime: '21:00',
    tncAccepted: true
  });

  const [logoBase64, setLogoBase64] = useState('');
  const [galleryImagesBase64, setGalleryImagesBase64] = useState([]);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Form & Media, 2: OTP Verification

  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Step 1: Send OTP trigger
  const handleProceedToOtp = async (e) => {
    e.preventDefault();

    if (!formData.salonName.trim()) {
      toast.error('Salon Name is required!');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Owner Name is required!');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Valid 10-digit Mobile Number is required!');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    // 🔒 Validation Rules: Compulsory Salon Images
    if (!logoBase64) {
      toast.error('Salon Logo is required! (Compulsory)');
      return;
    }
    if (!galleryImagesBase64 || galleryImagesBase64.length === 0) {
      toast.error('At least 1 compulsory salon photo is required for client listing!');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Sending 6-digit OTP to mobile...", { id: "send-otp" });
      await salonRegistrationService.sendOtp(formData.phone.trim());
      toast.success(`OTP sent successfully to +91 ${formData.phone}`, { id: "send-otp" });
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please check mobile number.';
      toast.error(msg, { id: "send-otp" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    if (isSubmitting || isCompressing) return;

    if (!otp.trim() || otp.length < 4) {
      toast.error('Please enter the valid OTP sent to your mobile number.');
      return;
    }

    setIsSubmitting(true);

    // Clean Base64 strings (remove data:image/...;base64, prefix if needed by backend)
    const cleanLogo = logoBase64.includes(',') ? logoBase64.split(',')[1] : logoBase64;
    const cleanGallery = galleryImagesBase64.map(img => img.includes(',') ? img.split(',')[1] : img);

    const payload = {
      ...formData,
      imageBase64: cleanLogo,
      salonImagesBase64: cleanGallery
    };

    try {
      toast.loading("Verifying OTP & Registering Salon...", { id: "register-salon" });
      const response = await salonRegistrationService.registerWithOtp(otp.trim(), payload);
      toast.success("Salon registered successfully! Welcome to NeoParlour.", { id: "register-salon" });

      if (onSuccess) onSuccess(response);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Invalid OTP or server error.';
      toast.error(msg, { id: "register-salon" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    await salonRegistrationService.sendOtp(formData.phone.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-[#FF2A14] flex items-center justify-center font-bold border border-red-100 dark:border-red-900/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#FF2A14] uppercase tracking-widest block">
                Instant Onboarding
              </span>
              <h3 className="text-base font-black tracking-tight">
                Register Your Salon Page
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-sans">
          
          {step === 1 ? (
            <form onSubmit={handleProceedToOtp} className="space-y-4">
              
              {/* Salon Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Step 1: Salon & Owner Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Salon Name *</label>
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.salonName}
                        onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                        placeholder="e.g. Elegant Beauty Lounge"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Owner Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Avishkar Mandlik"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Mobile Phone *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="e.g. 9876543210"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="At least 6 characters"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">City Name</label>
                    <input
                      type="text"
                      value={formData.cityName}
                      onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                      placeholder="e.g. Pune"
                      className={`w-full p-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Area Name</label>
                    <input
                      type="text"
                      value={formData.areaName}
                      onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                      placeholder="e.g. Kothrud"
                      className={`w-full p-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Compulsory Gallery & Logo Media Section */}
              <CompulsoryGalleryUploader
                logoBase64={logoBase64}
                setLogoBase64={setLogoBase64}
                galleryImagesBase64={galleryImagesBase64}
                setGalleryImagesBase64={setGalleryImagesBase64}
                isCompressing={isCompressing}
                setIsCompressing={setIsCompressing}
                isDarkMode={isDarkMode}
              />

              {/* Submit Step 1 Action Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing || !logoBase64 || galleryImagesBase64.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-[#FF2A14] hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 transition"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Optimizing Photos...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Proceed to OTP Verification
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Step 2: Enter OTP & Complete Registration
                </h4>
                <p className="text-xs text-slate-500">
                  Confirm your mobile number <strong className="text-slate-900 dark:text-white">+91 {formData.phone}</strong> to complete salon registration.
                </p>
              </div>

              {/* OTP Input Component */}
              <OtpVerificationStep
                phone={formData.phone}
                otp={otp}
                setOtp={setOtp}
                onResendOtp={handleResendOtp}
                isDarkMode={isDarkMode}
              />

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  ← Back to Details
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !otp.trim() || otp.length < 4}
                  className="px-6 py-2.5 rounded-xl bg-[#FF2A14] hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20 active:scale-95 transition"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying & Registering...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Complete Registration (&lt; 1.5s)
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default SalonRegistrationModal;
