import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, Lock, Eye, EyeOff, Globe, Sparkles } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const CreateSeoAdminModal = ({ isOpen, onClose, onSuccess, isDarkMode = false }) => {
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
      toast.error('Please enter SEO Admin full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid work email address');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const payload = {
      name: fullName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      password
    };

    try {
      const response = await axiosInstance.post('/auth/admin/create-seo-admin', payload);
      toast.success('SEO Admin account provisioned successfully! 🎉');
      if (onSuccess) onSuccess(response?.data);
      onClose();
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Failed to create SEO admin account:', error);
      toast.error(error.response?.data?.message || 'Failed to provision SEO Admin account. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">Provision SEO Admin</h3>
              <p className="text-xs text-slate-400 font-medium">Create staff account with Blog & SEO authority</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope info card */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            The SEO Admin can create & format blogs with styling tools, curate customer testimonials, and manage sitemap visibility.
          </p>
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
                placeholder="e.g. Aakash Verma"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-amber-500 text-white placeholder-zinc-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              10-Digit Mobile <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-amber-500 text-white placeholder-zinc-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Work Email <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aakash.seo@neoparlour.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-amber-500 text-white placeholder-zinc-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Password <span className="text-[#FF0B01]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold border outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-800/80 border-zinc-700 focus:border-amber-500 text-white placeholder-zinc-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900 placeholder-slate-400'
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <span>Provision SEO Admin</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};

export default CreateSeoAdminModal;
