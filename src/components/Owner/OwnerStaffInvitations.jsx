import React, { useState, useEffect } from 'react';
import { Plus, Search, Send, RefreshCw, XCircle, CheckCircle, Clock, AlertTriangle, UserPlus, Phone, Briefcase, DollarSign, X, MessageSquare, Sparkles, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { staffInvitationService } from '../../services/staffInvitationService';

const SAMPLE_INVITATIONS = [
  {
    id: 101,
    staffName: "Karan Johar",
    mobile: "+919876543210",
    designation: "Senior Hair Stylist",
    salaryType: "Commission (40%)",
    createdAt: "2026-08-18T10:30:00Z",
    status: "PENDING"
  },
  {
    id: 102,
    staffName: "Sneha Reddy",
    mobile: "+919876543211",
    designation: "Beautician & Spa Specialist",
    salaryType: "Fixed Salary (₹25,000/mo)",
    createdAt: "2026-08-17T14:15:00Z",
    status: "ACCEPTED"
  },
  {
    id: 103,
    staffName: "Vikram Malhotra",
    mobile: "+919876543212",
    designation: "Barber",
    salaryType: "Hybrid",
    createdAt: "2026-08-15T09:00:00Z",
    status: "REJECTED"
  },
  {
    id: 104,
    staffName: "Ananya Deshmukh",
    mobile: "+919876543213",
    designation: "Nail Technician",
    salaryType: "Commission (35%)",
    createdAt: "2026-08-10T11:20:00Z",
    status: "EXPIRED"
  }
];

const OwnerStaffInvitations = ({ isDarkMode: isDarkModeProp }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    staffName: '',
    mobile: '',
    designation: 'Senior Hair Stylist',
    salaryType: 'Commission (40%)'
  });

  // Action Loading States
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const activeSalonId = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '';
      const res = await staffInvitationService.getOwnerInvitations(activeSalonId);
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        setInvitations(fetched);
      } else {
        setInvitations(SAMPLE_INVITATIONS);
      }
    } catch (err) {
      console.warn("Using fallback owner invitations:", err.message);
      setInvitations(SAMPLE_INVITATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!formData.staffName.trim()) {
      toast.error("Staff name is required");
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setSending(true);
      const activeSalonId = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '3';
      const payload = {
        salonId: activeSalonId,
        name: formData.staffName,
        staffName: formData.staffName,
        phone: cleanMobile,
        mobile: cleanMobile,
        designation: formData.designation,
        salaryType: formData.salaryType
      };

      await staffInvitationService.sendInvitation(payload);
      
      // Generate WhatsApp Invite Link
      const salonName = localStorage.getItem('salon_name') || 'NeoParlour Salon';
      const inviteMsg = encodeURIComponent(
        `Hello ${formData.staffName}! You have been invited by ${salonName} to join as ${formData.designation}. Please log in to NeoParlour App to accept your invitation: https://www.neoparlour.com/staff/invitations`
      );
      const whatsappUrl = `https://wa.me/91${cleanMobile}?text=${inviteMsg}`;

      toast.success(`Invitation sent successfully to ${formData.staffName}!`);
      
      // Open WhatsApp invitation optionally
      window.open(whatsappUrl, '_blank');

      setShowInviteModal(false);
      setFormData({
        staffName: '',
        mobile: '',
        designation: 'Senior Hair Stylist',
        salaryType: 'Commission (40%)'
      });
      fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send staff invitation");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (item) => {
    try {
      setActionLoading(prev => ({ ...prev, [item.id]: 'resend' }));
      await staffInvitationService.resendInvitation(item.id);
      
      const cleanMobile = (item.mobile || item.phone || '').replace(/\D/g, '');
      const inviteMsg = encodeURIComponent(
        `Reminder: You have a pending salon invitation from NeoParlour! Log in to accept: https://www.neoparlour.com/staff/invitations`
      );
      if (cleanMobile) {
        window.open(`https://wa.me/91${cleanMobile}?text=${inviteMsg}`, '_blank');
      }

      toast.success(`Invitation reminder resent to ${item.staffName}!`);
      fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend invitation");
    } finally {
      setActionLoading(prev => ({ ...prev, [item.id]: null }));
    }
  };

  const handleRevoke = async (item) => {
    try {
      setActionLoading(prev => ({ ...prev, [item.id]: 'revoke' }));
      await staffInvitationService.revokeInvitation(item.id);
      toast.success(`Invitation for ${item.staffName} cancelled successfully`);
      fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke invitation");
    } finally {
      setActionLoading(prev => ({ ...prev, [item.id]: null }));
    }
  };

  // Metrics Calculation
  const totalSent = invitations.length;
  const pendingCount = invitations.filter(i => (i.status || '').toUpperCase() === 'PENDING').length;
  const acceptedCount = invitations.filter(i => (i.status || '').toUpperCase() === 'ACCEPTED').length;
  const expiredCount = invitations.filter(i => ['REJECTED', 'EXPIRED', 'CANCELLED'].includes((i.status || '').toUpperCase())).length;

  const filteredInvitations = invitations.filter(i => {
    const matchesSearch =
      (i.staffName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.mobile || i.phone || '').includes(searchQuery) ||
      (i.designation || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (i.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#FF2A14]" /> Staff Recruitment & Invitations
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-1">
            Invite new stylists, track pending response statuses, and manage staff onboarding.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="bg-[#FF2A14] hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> Invite New Staff
        </button>
      </div>

      {/* Header Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Sent</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalSent}</div>
        </div>

        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-200/60 dark:border-amber-900/40 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Responses
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</div>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Accepted Staff
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{acceptedCount}</div>
        </div>

        <div className="bg-slate-100/70 dark:bg-zinc-800/60 p-5 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Expired / Declined
          </span>
          <div className="text-2xl font-black text-slate-700 dark:text-zinc-300">{expiredCount}</div>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#FF2A14] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">Loading invitations...</div>
        ) : filteredInvitations.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">No invitations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-800/50">
                  <th className="py-4 px-6">Staff Member</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Salary / Commission</th>
                  <th className="py-4 px-6">Sent Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs font-semibold">
                {filteredInvitations.map((item) => {
                  const statusUpper = (item.status || 'PENDING').toUpperCase();
                  const sentDateFormatted = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">{item.staffName || item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.mobile || item.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-zinc-300 font-bold">{item.designation || 'Stylist'}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-zinc-400 text-[11px]">{item.salaryType || 'Commission (40%)'}</td>
                      <td className="py-4 px-6 text-slate-400 dark:text-zinc-500 text-[11px]">{sentDateFormatted}</td>
                      <td className="py-4 px-6">
                        {statusUpper === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full uppercase border border-amber-200 dark:border-amber-800">
                            🟡 Pending
                          </span>
                        )}
                        {statusUpper === 'ACCEPTED' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase border border-emerald-200 dark:border-emerald-800">
                            🟢 Accepted
                          </span>
                        )}
                        {statusUpper === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full uppercase border border-red-200 dark:border-red-800">
                            🔴 Rejected
                          </span>
                        )}
                        {statusUpper === 'EXPIRED' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-2.5 py-1 rounded-full uppercase border border-slate-200 dark:border-zinc-700">
                            ⚪ Expired
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {statusUpper === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleResend(item)}
                              disabled={actionLoading[item.id] === 'resend'}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              title="Resend WhatsApp/SMS Reminder"
                            >
                              <RefreshCw className={`w-3 h-3 ${actionLoading[item.id] === 'resend' ? 'animate-spin' : ''}`} /> Resend
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevoke(item)}
                              disabled={actionLoading[item.id] === 'revoke'}
                              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-100 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition"
                              title="Revoke / Cancel Invitation"
                            >
                              <XCircle className="w-3 h-3" /> Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF2A14]" /> Invite New Staff Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.staffName}
                  onChange={(e) => setFormData(prev => ({ ...prev, staffName: e.target.value }))}
                  placeholder="e.g. Karan Johar"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Mobile Number (WhatsApp/SMS) *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Designation / Role</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  >
                    <option value="Senior Hair Stylist">Senior Hair Stylist</option>
                    <option value="Hair Dresser">Hair Dresser</option>
                    <option value="Beautician & Spa Specialist">Beautician & Spa Specialist</option>
                    <option value="Barber">Barber</option>
                    <option value="Nail Technician">Nail Technician</option>
                    <option value="Makeup Artist">Makeup Artist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Commission / Salary</label>
                  <select
                    value={formData.salaryType}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryType: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  >
                    <option value="Commission (40%)">Commission (40%)</option>
                    <option value="Commission (35%)">Commission (35%)</option>
                    <option value="Fixed Salary (₹25,000/mo)">Fixed Salary (₹25,000/mo)</option>
                    <option value="Fixed Salary (₹30,000/mo)">Fixed Salary (₹30,000/mo)</option>
                    <option value="Hybrid">Hybrid (Base + Commission)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] font-semibold text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold uppercase flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Automatic WhatsApp Invite</span>
                <p>Sending this invitation will automatically generate a WhatsApp invite link for instant staff onboarding.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-3 bg-[#FF2A14] hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? 'Sending...' : <><Send className="w-3.5 h-3.5" /> Send Invitation</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerStaffInvitations;
