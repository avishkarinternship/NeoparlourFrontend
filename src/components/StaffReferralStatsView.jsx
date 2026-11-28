import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  User,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import staffInvitationService from '../services/staffInvitationService';
import useStaffInvitations from '../hooks/useStaffInvitations';
import InvitationFilterBar from './common/InvitationFilterBar';
import StaffInvitationsTable from './common/StaffInvitationsTable';
import TablePaginationBar from './common/TablePaginationBar';

const DEFAULT_STAFF_LIST = [];

export default function StaffReferralStatsView({ 
  staffId = 'ALL', 
  staffList = DEFAULT_STAFF_LIST, 
  onSelectStaff, 
  isDarkMode = false, 
  onNavigateToPayouts 
}) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // If staffId is undefined / null / empty / 'ALL', it's 'ALL'
  const activeStaffId = staffId === 'ALL' || !staffId ? 'ALL' : staffId;
  const isAll = activeStaffId === 'ALL';
  const activeSalonId = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '';

  // For table invitations: when 'ALL', pass '' so backend fetches across all staff in salon
  const tableStaffId = isAll ? '' : String(activeStaffId);

  // Custom hook for paginated staff referral invitations
  const { data, loading: loadingTable, filters, updateFilter, setPage, setSize, resetFilters, refresh } = useStaffInvitations(activeSalonId, tableStaffId);

  const inFlightRef = React.useRef(false);
  const lastFetchedKeyRef = React.useRef('');
  const hasLoadedOnceRef = React.useRef(false);

  const fetchReferralStats = useCallback(async (targetId, currentStaffList = DEFAULT_STAFF_LIST) => {
    const isAllSelected = targetId === 'ALL' || !targetId;
    const fetchKey = `${isAllSelected ? 'ALL' : targetId}_${currentStaffList?.length || 0}`;

    if (inFlightRef.current && lastFetchedKeyRef.current === fetchKey) {
      return;
    }

    inFlightRef.current = true;
    lastFetchedKeyRef.current = fetchKey;

    if (!hasLoadedOnceRef.current) {
      setLoadingStats(true);
    }

    try {
      if (isAllSelected) {
        if (!currentStaffList || currentStaffList.length === 0) {
          setStats({
            staffId: 'ALL',
            staffName: 'All Staff Members',
            invitesSent: 0,
            downloads: 0,
            registrations: 0,
            bookings: 0,
            totalPointsEarned: 0,
            totalRewardsEarned: 0
          });
          setLoadingStats(false);
          hasLoadedOnceRef.current = true;
          inFlightRef.current = false;
          return;
        }

        // Call the stats API for all the staff members in parallel and aggregate
        const results = await Promise.allSettled(
          currentStaffList.map(st => staffInvitationService.getStaffStats(st.id))
        );

        let totalInvites = 0;
        let totalDownloads = 0;
        let totalRegistrations = 0;
        let totalBookings = 0;
        let totalPoints = 0;
        let totalRewards = 0;

        results.forEach(res => {
          if (res.status === 'fulfilled' && res.value) {
            const data = res.value.data?.content || res.value.data || {};
            totalInvites += Number(data.invitesSent ?? data.totalInvitesSent ?? 0);
            totalDownloads += Number(data.downloads ?? data.totalAppDownloads ?? data.appDownloads ?? 0);
            totalRegistrations += Number(data.registrations ?? data.totalRegistrations ?? 0);
            totalBookings += Number(data.bookings ?? data.totalBookings ?? 0);
            totalPoints += Number(data.totalPointsEarned ?? data.rewardPoints ?? data.points ?? 0);
            totalRewards += Number(data.totalRewardsEarned ?? data.totalCashEarnings ?? data.rewards ?? 0);
          }
        });

        setStats({
          staffId: 'ALL',
          staffName: `All Staff Members (${currentStaffList.length})`,
          invitesSent: totalInvites,
          downloads: totalDownloads,
          registrations: totalRegistrations,
          bookings: totalBookings,
          totalPointsEarned: totalPoints,
          totalRewardsEarned: totalRewards
        });
      } else {
        // Individual staff member
        const response = await staffInvitationService.getStaffStats(targetId);
        const resData = response.data?.content || response.data || null;
        setStats(resData || {
          staffId: targetId,
          staffName: 'Staff Member',
          invitesSent: 0,
          downloads: 0,
          registrations: 0,
          bookings: 0,
          totalPointsEarned: 0,
          totalRewardsEarned: 0
        });
      }
    } catch (err) {
      console.warn("Failed to fetch staff referral stats:", err?.message);
      setStats({
        staffId: targetId,
        staffName: 'Staff Member',
        invitesSent: 0,
        downloads: 0,
        registrations: 0,
        bookings: 0,
        totalPointsEarned: 0,
        totalRewardsEarned: 0
      });
    } finally {
      setLoadingStats(false);
      hasLoadedOnceRef.current = true;
      inFlightRef.current = false;
    }
  }, []);

  // Fetch stats whenever activeStaffId or staffList length changes
  useEffect(() => {
    fetchReferralStats(activeStaffId, staffList);
  }, [activeStaffId, staffList?.length, fetchReferralStats]);

  const referralCode = `STAFF-${activeStaffId || 'REF'}`;
  const referralHost = typeof window !== 'undefined' && window.location.hostname.includes('uat')
    ? 'https://uat.neoparlour.com'
    : (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://neoparlour.com');
  const referralLink = `${referralHost}/signup?ref=${referralCode}`;

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

  if (loadingStats && !stats) {
    return (
      <div className="glass-card p-12 text-center rounded-[24px] shadow-sm max-w-5xl mx-auto my-6">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary,#7C3AED)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className={`font-bold text-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
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
    <div className={`p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto rounded-[32px] shadow-sm transition-colors duration-300 space-y-6 glass-card ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-800'
    }`}>
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/20 dark:border-white/10 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[var(--brand-primary,#7C3AED)] uppercase mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Referral & Earnings Tracker
          </span>
          <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <TrendingUp className="w-6 h-6 text-[var(--brand-primary,#7C3AED)]" />
            Staff Referrals Dashboard
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-0.5">
            {isAll 
              ? `Combined referral conversions, registrations, points & earnings across all ${staffList.length} staff members`
              : `Track invitation conversions, customer registrations, points & cash rewards for ${stats?.staffName || 'Staff Member'}`
            }
          </p>
        </div>

        {/* Staff Selection Dropdown for Owners */}
        {staffList && staffList.length > 0 && onSelectStaff && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            {isAll ? (
              <Users className="w-4 h-4 text-[var(--brand-primary,#7C3AED)]" />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
            <select
              value={activeStaffId}
              onChange={(e) => {
                const val = e.target.value;
                onSelectStaff(val === 'ALL' || val === '' ? 'ALL' : Number(val));
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold glass-input outline-none cursor-pointer transition text-slate-900 dark:text-zinc-100"
            >
              <option value="ALL">All Staff Members ({staffList.length})</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name || st.staffName} ({st.phone || `ID: ${st.id}`})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                staffInvitationService.clearInvitationsCache();
                fetchReferralStats(activeStaffId, staffList);
                refresh();
              }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Refresh Stats & Table"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* Primary Rewards Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Total Reward Points
            </span>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-300">{points} <span className="text-xs font-bold">PTS</span></p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">Accumulated from successful customer referrals</p>
            <button
              type="button"
              onClick={() => onNavigateToPayouts ? onNavigateToPayouts() : navigate('/staff/payouts')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-wider shadow-sm transition active:scale-95 cursor-pointer"
            >
              Redeem for Cash Payout →
            </button>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 text-2xl font-black">
            ⭐
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between shadow-2xs">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-3xl border transition ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Send className="w-3.5 h-3.5 text-blue-500" /> Invites Sent
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{invites}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">WhatsApp & Link Shares</span>
        </div>

        <div className={`p-4 rounded-3xl border transition ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Download className="w-3.5 h-3.5 text-purple-500" /> App Downloads
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{downloads}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Installed App</span>
        </div>

        <div className={`p-4 rounded-3xl border transition ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Registrations
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{registrations}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Signed-Up Users</span>
        </div>

        <div className={`p-4 rounded-3xl border transition ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" /> Bookings Made
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{bookings}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">{conversionRate}% Conversion</span>
        </div>
      </div>

      {/* Shareable Referral Code & Link Box / Aggregated Info Banner */}
      {isAll ? (
        <div className="p-5 rounded-3xl glass-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--brand-primary,#7C3AED)]" />
                Salon Staff Referrals Overview ({staffList.length} Staff Members)
              </h4>
              <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium mt-0.5">
                Displaying aggregated referral performance across all staff members. Select an individual staff member from the dropdown above to view or share their unique referral link.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl glass-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[var(--brand-primary,#7C3AED)]" />
                Personalized Staff Referral Link
              </h4>
              <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium mt-0.5">
                Share this link with customers to earn reward points on every booking
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial px-4 py-2.5 glass-card-interactive text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-slate-900 dark:text-white"
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

          <div className="mt-3 p-3 rounded-2xl glass-card border border-white/20 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-300 break-all">
            <span>{referralLink}</span>
            <span className="px-2.5 py-0.5 bg-[var(--brand-primary,#7C3AED)]/10 text-[var(--brand-primary,#7C3AED)] font-bold rounded-md uppercase ml-2 flex-shrink-0">
              {referralCode}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Search & Filter Bar Component */}
      <InvitationFilterBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        staffList={staffList}
        isDarkMode={isDarkMode}
        onSelectStaff={onSelectStaff}
      />

      {/* Staff Invitations Data Table Component */}
      <StaffInvitationsTable
        data={data.content}
        loading={loadingTable}
        showStaffColumn={isAll}
        isDarkMode={isDarkMode}
      />

      {/* Table Pagination Bar Component */}
      <TablePaginationBar
        page={filters.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        size={filters.size}
        onPageChange={setPage}
        onSizeChange={setSize}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
