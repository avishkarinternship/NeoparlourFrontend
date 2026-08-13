import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Download, 
  UserCheck, 
  CalendarCheck, 
  Award, 
  IndianRupee, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  TrendingUp,
  User
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function StaffReferralStatsView({ staffId, staffList = [], onSelectStaff, isDarkMode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeStaffId = staffId || (staffList.length > 0 ? staffList[0].id : null);

  useEffect(() => {
    if (activeStaffId) {
      fetchReferralStats(activeStaffId);
    }
  }, [activeStaffId]);

  const fetchReferralStats = async (id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/staff/${id}/referral-stats`);
      const data = response.data?.content || response.data || null;
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch staff referral stats:", err);
      // Fallback empty DTO structure if server returns mock or error
      setStats({
        staffId: id,
        staffName: 'Staff Member',
        invitesSent: 0,
        downloads: 0,
        registrations: 0,
        bookings: 0,
        totalPointsEarned: 0,
        totalRewardsEarned: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const referralCode = `STAFF-${activeStaffId}`;
  const referralLink = `https://neoparlour.com/signup?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Book your salon appointment on NeoParlour using my referral code ${referralCode} and get instant discounts!\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className={`p-12 text-center rounded-[24px] shadow-sm border max-w-4xl mx-auto my-6 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="w-10 h-10 border-4 border-[#FF0B01] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Loading staff referral statistics...
        </p>
      </div>
    );
  }

  const invites = stats?.invitesSent || 0;
  const downloads = stats?.downloads || 0;
  const registrations = stats?.registrations || 0;
  const bookings = stats?.bookings || 0;
  const points = stats?.totalPointsEarned || 0;
  const rewards = stats?.totalRewardsEarned || 0;

  const conversionRate = invites > 0 ? ((bookings / invites) * 100).toFixed(1) : 0;

  return (
    <div className={`p-6 max-w-5xl mx-auto rounded-[32px] shadow-sm border transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
    }`}>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[#FF0B01] uppercase mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Referral & Earnings Tracker
          </span>
          <h2 className={`text-2xl font-black uppercase tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <TrendingUp className="w-6 h-6 text-[#FF0B01]" />
            Staff Referrals Dashboard
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Track invitation conversions, customer registrations, points & cash rewards
          </p>
        </div>

        {/* Optional Staff Selection Dropdown for Owners */}
        {staffList && staffList.length > 0 && onSelectStaff && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={activeStaffId}
              onChange={(e) => onSelectStaff(Number(e.target.value))}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition ${
                isDarkMode 
                  ? 'bg-slate-800 text-white border-slate-700 focus:border-[#FF0B01]' 
                  : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-[#FF0B01]'
              }`}
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.phone || `ID: ${st.id}`})
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchReferralStats(activeStaffId)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* Primary Rewards Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Total Reward Points
            </span>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-300">{points} <span className="text-xs font-bold">PTS</span></p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">Accumulated from successful invitations</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 text-2xl font-black">
            ⭐
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-500" /> Total Cash Earnings
            </span>
            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-300">₹{Number(rewards).toFixed(2)}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Earned on completed customer bookings</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 text-2xl font-black">
            💰
          </div>
        </div>
      </div>

      {/* 4 Conversion Funnel Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Send className="w-3.5 h-3.5 text-blue-500" /> Invites Sent
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{invites}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">WhatsApp & SMS</span>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Download className="w-3.5 h-3.5 text-purple-500" /> App Downloads
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{downloads}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Installed App</span>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Registrations
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{registrations}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Signed-Up Users</span>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" /> Bookings Made
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{bookings}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">{conversionRate}% Conversion</span>
        </div>
      </div>

      {/* Shareable Referral Code & Link Box */}
      <div className={`p-5 rounded-2xl border ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#FF0B01]" />
              Personalized Staff Referral Link
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Share this link with customers to earn reward points on every booking
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-black text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 break-all">
          <span>{referralLink}</span>
          <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-950/60 text-[#FF0B01] font-bold rounded-md uppercase ml-2 flex-shrink-0">
            {referralCode}
          </span>
        </div>
      </div>
    </div>
  );
}
