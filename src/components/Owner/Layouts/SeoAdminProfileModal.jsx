import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

export default function SeoAdminProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rawProfile, setRawProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
    const userId = ownerUser?.id || ownerUser?.userId || ownerUser?.user?.id;

    if (!userId) {
      toast.error("User session ID not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      // Calls @GetMapping("/api/auth/profile/{id}")
      const response = await axiosInstance.get(`/auth/profile/${userId}`);
      const data = response.data || {};
      setRawProfile(data);
      setFormData({
        name: data.name || ownerUser.name || '',
        phone: data.phone || ownerUser.phone || '',
        email: data.email || ownerUser.email || '',
        password: ''
      });
    } catch (err) {
      console.warn("Failed to fetch profile from API, fallback to storage:", err);
      // Fallback to localStorage data
      setFormData({
        name: ownerUser.name || '',
        phone: ownerUser.phone || '',
        email: ownerUser.email || '',
        password: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Mobile Number is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email Address is required");
      return;
    }

    const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
    const userId = ownerUser?.id || ownerUser?.userId || ownerUser?.user?.id;

    if (!userId) {
      toast.error("User ID not found in session");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...(rawProfile || {}),
        id: userId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim()
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      // Calls @PutMapping("/api/auth/users/{id}")
      await axiosInstance.put(`/auth/users/${userId}`, payload);

      // Sync localStorage with updated credentials
      const updatedUser = {
        ...ownerUser,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim()
      };
      localStorage.setItem('ownerStaffUser', JSON.stringify(updatedUser));

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }

      toast.success("SEO Admin Profile updated successfully! 🎉");
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 w-full max-w-md max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-red-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                SEO Admin Profile
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                Manage your credentials and account details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF2A14]" />
            <span className="text-xs font-bold text-zinc-400">Loading profile details...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-500" /> Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2A14] transition"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-500" /> Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2A14] transition font-mono"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-500" /> Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@neoparlour.com"
                  className="w-full px-4 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2A14] transition font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-500" /> Password
                </label>
                <span className="text-[10px] text-zinc-500 font-semibold">Leave blank to keep unchanged</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password (optional)"
                  className="w-full pl-4 pr-10 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2A14] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2A14] to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>,
    document.body
  );
}
