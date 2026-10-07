import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const CreateSupportEngineerModal = ({ isOpen, onClose, onSuccess, isDarkMode = false }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter support engineer full name');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/admin/create-support-engineer', {
        name: fullName.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        password
      });

      toast.success('Support Engineer account provisioned successfully!');
      if (onSuccess) onSuccess(response.data);
      onClose();
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Failed to create support engineer:', error);
      toast.error(error.response?.data?.message || 'Failed to create support engineer account.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#FF0B01]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">Provision Support Engineer</h3>
              <p className="text-xs text-slate-400 font-medium">Create staff account with ticketing access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Full Name <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#FF0B01]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#FF0B01]'
                }`}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Mobile Number (10 Digits) <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#FF0B01]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#FF0B01]'
                }`}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Email Address <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul.support@neoparlour.com"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#FF0B01]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#FF0B01]'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Account Password <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#FF0B01]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#FF0B01]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Indicator Info */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Assigned Role: <strong>SUPPORT_ENGINEER</strong> (Access to ticketing engine, blocked from revenue reports).</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#FF0B01] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating Account...
                </>
              ) : (
                'Create Support Staff'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

export default CreateSupportEngineerModal;
