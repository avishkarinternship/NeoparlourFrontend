import React, { useState } from 'react';
import { Copy, MessageSquare, Check, Clock, Calendar, CheckCircle2, Link2, Smartphone, UserCheck, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  SENT: { label: '🟡 Sent', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  CLICKED: { label: '🔵 Clicked', bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
  INSTALLED: { label: '🟣 App Installed', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  REGISTERED: { label: '🟢 Registered', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  BOOKED: { label: '❇️ Converted (Booked)', bg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs font-black' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const StaffInvitationsTable = ({
  data = [],
  loading = false,
  showStaffColumn = true,
  isDarkMode = false
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const getInviteLink = (item) => {
    if (item.inviteUrl) return item.inviteUrl;
    const code = item.inviteCode || `STAFF-${item.staffId || 'REF'}`;
    return `https://neoparlour.com/invite/${code}`;
  };

  const handleCopyLink = (item) => {
    const link = getInviteLink(item);
    navigator.clipboard.writeText(link);
    setCopiedId(item.inviteCode || item.id);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppShare = (item) => {
    const link = getInviteLink(item);
    const text = encodeURIComponent(
      `Hi ${item.customerName || 'Friend'}! Book your appointment on NeoParlour using my invitation link:\n${link}`
    );
    const phoneClean = (item.customerPhone || '').replace(/\D/g, '');
    const url = phoneClean ? `https://wa.me/91${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
    }`}>
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          <div className="w-8 h-8 border-4 border-[#FF0B01] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading invitation data...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <Clock className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wide">No Invitation Data</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">
            No invitation records found matching your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 ${
                isDarkMode ? 'bg-zinc-800/50 border-zinc-800' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <th className="py-4 px-6">Customer Info</th>
                {showStaffColumn && <th className="py-4 px-6">Invited By</th>}
                <th className="py-4 px-6">Invite Code / Link</th>
                <th className="py-4 px-6">Current Status</th>
                <th className="py-4 px-6">Funnel Activity Timestamps</th>
                <th className="py-4 px-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs font-semibold">
              {data.map((item, idx) => {
                const statusKey = (item.status || 'SENT').toUpperCase();
                const badgeInfo = STATUS_BADGES[statusKey] || STATUS_BADGES.SENT;
                const key = item.inviteCode || item.id || idx;

                const sentAtStr = formatDate(item.createdAt);
                const clickedAtStr = formatDate(item.linkClickedAt);
                const installedAtStr = formatDate(item.appInstalledAt);
                const registeredAtStr = formatDate(item.registeredAt);
                const bookedAtStr = formatDate(item.bookedAt);

                return (
                  <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                    
                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{item.customerName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.customerPhone || 'N/A'}</div>
                    </td>

                    {/* Staff Name */}
                    {showStaffColumn && (
                      <td className="py-4 px-6 text-slate-700 dark:text-zinc-300 font-bold">
                        {item.staffName || 'Staff Member'}
                      </td>
                    )}

                    {/* Invite Code & Link */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-black text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700">
                          {item.inviteCode || 'N/A'}
                        </span>
                        {item.inviteUrl && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate max-w-[180px]">
                            {item.inviteUrl}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${badgeInfo.bg}`}>
                        {badgeInfo.label}
                      </span>
                    </td>

                    {/* Funnel Activity Timestamps */}
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-[10px] font-mono">
                        
                        {/* Sent At */}
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="font-bold">Sent:</span> {sentAtStr || 'N/A'}
                        </div>

                        {/* Link Clicked At */}
                        <div className={`flex items-center gap-1.5 ${clickedAtStr ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-zinc-600 opacity-60'}`}>
                          <Link2 className="w-3 h-3 text-sky-500 shrink-0" />
                          <span className="font-bold">Clicked:</span> {clickedAtStr || 'Pending'}
                        </div>

                        {/* App Installed At */}
                        <div className={`flex items-center gap-1.5 ${installedAtStr ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-zinc-600 opacity-60'}`}>
                          <Smartphone className="w-3 h-3 text-purple-500 shrink-0" />
                          <span className="font-bold">Installed:</span> {installedAtStr || 'Pending'}
                        </div>

                        {/* Registered At */}
                        <div className={`flex items-center gap-1.5 ${registeredAtStr ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600 opacity-60'}`}>
                          <UserCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="font-bold">Registered:</span> {registeredAtStr || 'Pending'}
                        </div>

                        {/* Booked At */}
                        <div className={`flex items-center gap-1.5 ${bookedAtStr ? 'text-emerald-700 dark:text-emerald-300 font-extrabold' : 'text-slate-400 dark:text-zinc-600 opacity-60'}`}>
                          <CalendarCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-bold">Booked:</span> {bookedAtStr || 'Pending'}
                        </div>

                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleWhatsAppShare(item)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition"
                          title="Resend WhatsApp Invite"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(item)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title="Copy Invitation Link"
                        >
                          {copiedId === (item.inviteCode || item.id) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffInvitationsTable;
