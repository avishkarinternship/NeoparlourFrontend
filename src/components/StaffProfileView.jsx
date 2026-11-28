import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Award, Edit2, X, Check, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import { SalonLogoImage } from '../utils/whiteLabelHelper';
import toast from 'react-hot-toast';

export default function StaffProfileView({ staffId, staffUserId, isDarkMode = false }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const salonLogo = localStorage.getItem('activeSalonLogo') || localStorage.getItem('salon_logo') || '';
  const salonName = profile?.salonName || localStorage.getItem('activeSalonName') || localStorage.getItem('salon_name') || 'NeoParlour';

  useEffect(() => {
    if (staffId) {
      loadProfile();
    }
  }, [staffId]);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const res = await (staffApi.getStaffProfile ? staffApi.getStaffProfile(staffId) : staffApi.getStaffById(staffId));
      const data = res.data?.content || res.data || {};
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Failed to load staff profile.');
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffApi.updateStaffProfile(staffUserId || staffId, formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      toast.error('Error updating profile: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="glass-card p-12 text-center rounded-[24px] shadow-sm max-w-2xl mx-auto my-6">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary,#7C3AED)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">Loading staff profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto glass-card rounded-[32px] shadow-sm">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20 dark:border-white/10">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[var(--brand-primary,#7C3AED)] uppercase mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Account Info
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-[var(--brand-primary,#7C3AED)]" />
            Staff Profile
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-0.5">Personal details & contact information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            isEditing
              ? 'glass-card text-slate-700 dark:text-zinc-200'
              : 'bg-[var(--brand-primary,#7C3AED)]/10 text-[var(--brand-primary,#7C3AED)] hover:bg-[var(--brand-primary,#7C3AED)]/20 border border-[var(--brand-primary,#7C3AED)]/20'
          }`}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" /> Edit Profile
            </>
          )}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* Profile Identity Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl glass-card border border-white/20 dark:border-white/10 text-center sm:text-left">
            <img
              src={profile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Staff')}&background=FF0B01&color=fff`}
              alt={profile?.name || 'Staff Profile'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/80 dark:border-zinc-700 shadow-md shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                {profile?.name || 'Staff Member'}
              </h3>
              
              {/* Salon Affiliation with White-Labeled Logo */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <SalonLogoImage
                  logo={salonLogo}
                  name={salonName}
                  className="w-4 h-4 rounded-md object-cover"
                />
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 truncate">
                  {salonName}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Staff
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" /> {profile?.role || 'Service Specialist'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div className="p-4 rounded-2xl glass-card border border-white/20 dark:border-white/10">
              <span className="font-black text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[var(--brand-primary,#7C3AED)]" /> Phone Number
              </span>
              <span className="text-slate-900 dark:text-white font-bold text-base">{profile?.phone || 'N/A'}</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-white/20 dark:border-white/10">
              <span className="font-black text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--brand-primary,#7C3AED)]" /> Email Address
              </span>
              <span className="text-slate-900 dark:text-white font-bold text-base">{profile?.email || 'N/A'}</span>
            </div>

            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl glass-card border border-white/20 dark:border-white/10">
              <span className="font-black text-slate-400 dark:text-zinc-500 block text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary,#7C3AED)]" /> Physical Address
              </span>
              <span className="text-slate-900 dark:text-white font-bold text-base">{profile?.address || 'N/A'}</span>
            </div>

            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl glass-card border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="font-black text-amber-700 dark:text-amber-400 block text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Referral & Loyalty Points
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-300 font-medium">Points accumulated from customer referrals</span>
              </div>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">⭐ {profile?.rewardPoints || 0} Points</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Full Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Phone Number*</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--brand-primary,#7C3AED)] hover:brightness-110 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving Changes...
              </span>
            ) : (
              <>
                <Check className="w-4 h-4" /> Save Profile Changes
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
