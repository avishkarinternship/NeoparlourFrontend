import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Award, Edit2, X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function StaffProfileView({ staffId, staffUserId }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (staffId) {
      loadProfile();
    }
  }, [staffId]);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const res = await staffApi.getStaffProfile(staffId);
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
      <div className="p-12 text-center bg-white rounded-[24px] shadow-sm border border-slate-100 max-w-2xl mx-auto my-6">
        <div className="w-10 h-10 border-4 border-[#FF0B01] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 font-bold text-sm">Loading staff profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[#FF0B01] uppercase mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Account Info
          </span>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-[#FF0B01]" />
            Staff Profile
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Personal details & contact information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            isEditing
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-red-50 text-[#FF0B01] hover:bg-red-100 border border-red-100'
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
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-red-50/70 via-red-50/40 to-slate-50 border border-red-100/60">
            <img
              src={profile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Staff')}&background=FF0B01&color=fff`}
              alt={profile?.name || 'Staff Profile'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{profile?.name || 'Staff Member'}</h3>
              <p className="text-xs text-slate-500 font-semibold">{profile?.salonName || 'NeoParlour Staff'}</p>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Staff
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" /> {profile?.role || 'Service Expert'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-150">
              <span className="font-black text-slate-400 block text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF0B01]" /> Phone Number
              </span>
              <span className="text-slate-900 font-bold text-base">{profile?.phone || 'N/A'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-150">
              <span className="font-black text-slate-400 block text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF0B01]" /> Email Address
              </span>
              <span className="text-slate-900 font-bold text-base">{profile?.email || 'N/A'}</span>
            </div>

            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-150">
              <span className="font-black text-slate-400 block text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF0B01]" /> Physical Address
              </span>
              <span className="text-slate-900 font-bold text-base">{profile?.address || 'N/A'}</span>
            </div>

            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-150 flex items-center justify-between">
              <div>
                <span className="font-black text-amber-800 block text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" /> Referral & Loyalty Points
                </span>
                <span className="text-xs text-amber-700 font-medium">Points accumulated from customer referrals</span>
              </div>
              <span className="text-xl font-black text-amber-800">⭐ {profile?.rewardPoints || 0} Points</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Full Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Phone Number*</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/15 flex items-center justify-center gap-2 cursor-pointer"
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
