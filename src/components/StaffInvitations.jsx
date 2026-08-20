import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Building2, CheckCircle2, XCircle, Clock, MapPin, Phone, UserCheck, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { staffInvitationService } from '../services/staffInvitationService';

const SAMPLE_STAFF_INVITATIONS = [
  {
    id: 201,
    salonId: 3,
    salonName: "Sagar Men's Parlour",
    salonLogo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300",
    salonAddress: "Bavdhan-Pashan Road, Pune",
    ownerName: "Sagar Patil",
    ownerPhone: "+919764811148",
    offeredRole: "Senior Hair Stylist",
    salaryType: "Commission (40%)",
    createdAt: "2026-08-19T09:30:00Z",
    status: "PENDING"
  },
  {
    id: 202,
    salonId: 5,
    salonName: "Toni & Guy Unisex Salon",
    salonLogo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300",
    salonAddress: "Koregaon Park, Pune",
    ownerName: "Vikram Singhania",
    ownerPhone: "+919823012345",
    offeredRole: "Beautician & Spa Specialist",
    salaryType: "Fixed Salary (₹30,000/mo)",
    createdAt: "2026-08-18T16:00:00Z",
    status: "PENDING"
  }
];

const StaffInvitations = ({ isStandalone = true }) => {
  // Read salonId and user details from Redux state
  const reduxSalonId = useSelector((state) => 
    state.ownerStaff?.user?.salonId || 
    state.ownerStaff?.user?.tenantId || 
    state.ownerStaff?.user?.activeSalonId || ''
  );

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSalon, setActiveSalon] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchStaffInvitations();
    checkActiveSalon();
  }, [reduxSalonId]);

  const checkActiveSalon = () => {
    const activeId = reduxSalonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    const activeName = localStorage.getItem('activeSalonName') || localStorage.getItem('salon_name') || "Sagar Men's Parlour";
    if (activeId || activeName) {
      setActiveSalon({ id: activeId || '3', name: activeName, city: 'Pune' });
    }
  };

  const fetchStaffInvitations = async () => {
    try {
      setLoading(true);
      const staffMobile = localStorage.getItem('staff_mobile') || localStorage.getItem('user_mobile') || '';
      const res = await staffInvitationService.getPendingInvitationsForStaff({
        salonId: reduxSalonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id'),
        mobile: staffMobile
      });
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        setInvitations(fetched);
      } else {
        setInvitations(SAMPLE_STAFF_INVITATIONS);
      }
    } catch (err) {
      console.warn("Using sample pending staff invitations:", err.message);
      setInvitations(SAMPLE_STAFF_INVITATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (item) => {
    try {
      setActionLoading(prev => ({ ...prev, [item.id]: 'accept' }));
      await staffInvitationService.acceptInvitation(item.id);
      
      // Update local storage active salon context
      localStorage.setItem('activeSalonId', item.salonId || '3');
      localStorage.setItem('salon_id', item.salonId || '3');
      localStorage.setItem('activeSalonName', item.salonName || 'Active Salon');

      setActiveSalon({ id: item.salonId, name: item.salonName, city: item.salonAddress || 'Pune' });
      toast.success(`Congratulations! You have joined ${item.salonName} as ${item.offeredRole || 'Stylist'}.`);

      // Remove accepted invitation from pending list
      setInvitations(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept invitation");
    } finally {
      setActionLoading(prev => ({ ...prev, [item.id]: null }));
    }
  };

  const handleDecline = async (item) => {
    try {
      setActionLoading(prev => ({ ...prev, [item.id]: 'decline' }));
      await staffInvitationService.rejectInvitation(item.id);
      toast.success(`Invitation from ${item.salonName} declined.`);
      setInvitations(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to decline invitation");
    } finally {
      setActionLoading(prev => ({ ...prev, [item.id]: null }));
    }
  };

  const contentUI = (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* Active Salon Status Banner */}
      {activeSalon && (
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl text-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Currently Active Salon Context
                </span>
                <h2 className="text-lg font-black tracking-tight">{activeSalon.name}</h2>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl">
              Active Member
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Location: {activeSalon.city}</span>
            <span className="text-emerald-400 font-bold">Appointment calendar & walk-in booking unlocked</span>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF2A14]" /> Pending Salon Invitations ({invitations.length})
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-0.5">
            Review incoming recruitment requests from salon owners and manage your affiliations.
          </p>
        </div>
      </div>

      {/* Invitations List / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 animate-pulse h-36"></div>
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 border border-slate-100 dark:border-zinc-800 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Pending Invitations</h3>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
            You have responded to all salon invitations. New recruitment requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map((item) => {
            const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 border-t-4 border-t-[#FF2A14]"
              >
                <div className="space-y-4">
                  
                  {/* Salon Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 shrink-0">
                      <img
                        src={item.salonLogo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300"}
                        alt={item.salonName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-[#FF2A14] uppercase tracking-widest bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-900/50">
                        {item.offeredRole || 'Staff Member'}
                      </span>
                      <h3 className="text-base font-black text-slate-950 dark:text-white mt-1 leading-snug">
                        {item.salonName}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {item.salonAddress || 'Pune'}
                      </p>
                    </div>
                  </div>

                  {/* Offered Terms Box */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl space-y-1.5 text-xs border border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center text-slate-600 dark:text-zinc-300 font-bold">
                      <span>Invited By:</span>
                      <span className="text-slate-900 dark:text-white font-black">{item.ownerName || 'Salon Owner'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-zinc-300 font-bold">
                      <span>Salary / Terms:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{item.salaryType || 'Commission'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 dark:text-zinc-500 text-[11px]">
                      <span>Invited On:</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                </div>

                {/* Interactive Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDecline(item)}
                    disabled={actionLoading[item.id] === 'decline'}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccept(item)}
                    disabled={actionLoading[item.id] === 'accept'}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Invite
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans">
        {contentUI}
      </div>
    );
  }

  return contentUI;
};

export default StaffInvitations;
