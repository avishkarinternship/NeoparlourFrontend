import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, User, Package, UserPlus, LogOut, Lock, CheckCircle2, LogIn, Sparkles, FileText, Scissors, Moon, Sun, TrendingUp, Wallet, Building2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { performCleanLogout } from '../utils/auth';
import { SalonLogoImage, applySalonTheme, extractPaletteFromImage, getSalonTheme } from '../utils/whiteLabelHelper';
import { useDarkMode } from '../context/DarkModeContext';

// Sub components
import Schedule from './Owner/Manage/Schedule';
import StaffLeaveManagement from './StaffLeaveManagement';
import StaffProfileView from './StaffProfileView';
import StaffInventoryView from './StaffInventoryView';
import StaffReferralStatsView from './StaffReferralStatsView';
import WalkInBooking from './Owner/Manage/WalkInBooking';
import StaffInvitations from './StaffInvitations';
import StaffPayoutDashboard from '../pages/staff/StaffPayoutDashboard';
import ForgotPasswordModal from './ForgotPasswordModal';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function StaffDashboard() {
  // Global Dark Mode Context
  const { isDark, toggleDark } = useDarkMode();

  // Read staff ID and salon ID from localStorage
  const [staffId, setStaffId] = useState(
    localStorage.getItem('staff_id') || localStorage.getItem('user_id') || '1'
  );
  const [staffUserId, setStaffUserId] = useState(
    localStorage.getItem('staff_user_id') || localStorage.getItem('user_id') || '1'
  );
  const [salonId, setSalonId] = useState(
    localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '1'
  );

  // White-label Salon State
  const [salonName, setSalonName] = useState(
    localStorage.getItem('activeSalonName') || localStorage.getItem('salon_name') || 'NeoParlour'
  );
  const [salonLogo, setSalonLogo] = useState(
    localStorage.getItem('activeSalonLogo') || localStorage.getItem('salon_logo') || ''
  );

  // Active Tab State
  const [activeTab, setActiveTab] = useState('appointments');

  // Attendance Status State
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [staffProfile, setStaffProfile] = useState(null);

  // Modals state
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  // Horizontal Navigation Scroll State & Ref
  const navScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (!navScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // Smooth mouse-wheel horizontal scrolling over the navigation bar
  const handleNavWheel = (e) => {
    if (!navScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      navScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollNav = (direction) => {
    if (!navScrollRef.current) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    navScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Automatically center active tab button into viewport smoothly
  useEffect(() => {
    if (!navScrollRef.current) return;
    const activeBtn = navScrollRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
    const timer = setTimeout(checkScrollPosition, 300);
    return () => clearTimeout(timer);
  }, [activeTab, checkScrollPosition]);

  // Keep body and root backgrounds seamlessly synchronized with active theme to eliminate any margin gutters
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const targetBg = isDark ? 'var(--color-background, #09090b)' : 'var(--color-background, #f8fafc)';
      document.body.style.backgroundColor = targetBg;
      document.documentElement.style.backgroundColor = targetBg;
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }, [isDark]);

  // Initial check for any cached active salon theme on mount
  useEffect(() => {
    try {
      const globalCached = localStorage.getItem('activeSalonTheme');
      if (globalCached && globalCached !== 'undefined' && globalCached !== 'null') {
        const parsed = JSON.parse(globalCached);
        if (parsed && parsed.primary) {
          applySalonTheme(parsed);
          document.documentElement.style.setProperty('--brand-primary', parsed.primary);
          if (parsed.secondary || parsed.accent) {
            document.documentElement.style.setProperty('--brand-accent', parsed.secondary || parsed.accent);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (staffId) {
      loadTodayAttendance();
      loadProfileHeader();
    }
  }, [staffId]);

  // Fetch and apply dynamic salon branding theme
  useEffect(() => {
    const sId = salonId || staffProfile?.salonId;
    if (!sId) return;

    // Check if saved theme exists
    const saved = getSalonTheme(sId);
    if (saved) {
      applySalonTheme(saved);
      if (saved.primary) {
        document.documentElement.style.setProperty('--brand-primary', saved.primary);
      }
      if (saved.secondary || saved.accent) {
        document.documentElement.style.setProperty('--brand-accent', saved.secondary || saved.accent);
      }
    }

    const fetchSalonBranding = async () => {
      try {
        const res = await axiosInstance.get(`/salons/${sId}`);
        const data = res.data?.content || res.data;
        if (data) {
          const resolvedName = data.salonName || data.name || 'NeoParlour';
          const resolvedLogo = data.imageUrl || data.logo || data.logoUrl || '';

          setSalonName(resolvedName);
          localStorage.setItem('activeSalonName', resolvedName);
          localStorage.setItem('salon_name', resolvedName);

          if (resolvedLogo) {
            setSalonLogo(resolvedLogo);
            localStorage.setItem('activeSalonLogo', resolvedLogo);
            localStorage.setItem('salon_logo', resolvedLogo);

            // Automatically extract colors and apply theme
            extractPaletteFromImage(resolvedLogo).then((palette) => {
              if (palette) {
                localStorage.setItem(`salon_theme_${sId}`, JSON.stringify(palette));
                localStorage.setItem('activeSalonTheme', JSON.stringify(palette));
                applySalonTheme(palette);
                if (palette.primary) {
                  document.documentElement.style.setProperty('--brand-primary', palette.primary);
                }
                if (palette.secondary || palette.accent) {
                  document.documentElement.style.setProperty('--brand-accent', palette.secondary || palette.accent);
                }
              }
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch salon branding details:', err);
      }
    };

    fetchSalonBranding();
  }, [salonId, staffProfile?.salonId]);

  const loadTodayAttendance = async () => {
    try {
      const res = await staffApi.getTodayAttendance(staffId);
      setTodayAttendance(res.data?.content || res.data || null);
    } catch (err) {
      console.warn('Could not fetch today attendance:', err);
    }
  };

  const loadProfileHeader = async () => {
    try {
      const res = await (staffApi.getStaffProfile ? staffApi.getStaffProfile(staffId) : staffApi.getStaffById(staffId));
      const data = res.data?.content || res.data || null;
      setStaffProfile(data);

      if (data?.salonId) {
        setSalonId(String(data.salonId));
        localStorage.setItem('activeSalonId', String(data.salonId));
        localStorage.setItem('salon_id', String(data.salonId));
      }
      if (data?.salonName) {
        setSalonName(data.salonName);
      }
      if (data?.salonLogo || data?.salonImageUrl) {
        setSalonLogo(data.salonLogo || data.salonImageUrl);
      }
    } catch (err) {
      console.warn('Could not fetch staff profile:', err);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      await staffApi.checkIn(staffId, salonId);
      toast.success('Successfully Checked In! Have a great shift.', {
        style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
      });
      loadTodayAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check-in.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      await staffApi.checkOut(staffId, salonId);
      toast.success('Successfully Checked Out! See you next shift.', {
        style: { borderRadius: '12px', background: '#F59E0B', color: '#fff' }
      });
      loadTodayAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check-out.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleLogout = () => {
    performCleanLogout('/owner/login');
  };

  const isCheckedIn = todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime;

  const navTabs = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'walkin', label: 'Walk-In Booking', icon: Scissors },
    { id: 'attendance', label: 'Attendance & Leaves', icon: FileText },
    { id: 'inventory', label: 'My Inventory', icon: Package },
    { id: 'referrals', label: 'My Referrals', icon: TrendingUp },
    { id: 'payouts', label: 'Reward Payouts', icon: Wallet },
    { id: 'invitations', label: 'Salon Invitations', icon: UserPlus },
    { id: 'profile', label: 'Staff Profile', icon: User },
  ];

  return (
    <div 
      className={`min-h-screen w-full font-sans relative overflow-x-hidden transition-colors duration-300 staff-portal-canvas ${
        isDark ? 'dark text-zinc-100' : 'text-slate-800'
      }`}
      style={{
        backgroundColor: isDark ? 'var(--color-background, #09090b)' : 'var(--color-background, #f8fafc)',
        color: isDark ? 'var(--color-text-primary, #faf4ff)' : 'var(--color-text-primary, #1e293b)'
      }}
    >
      {/* Ambient Decorative Glass Refraction Orbs */}
      <div 
        className="fixed top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none -z-10 opacity-20"
        style={{ background: 'radial-gradient(circle, var(--brand-primary, #7C3AED) 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-[-10%] right-[10%] w-[650px] h-[650px] rounded-full blur-[180px] pointer-events-none -z-10 opacity-15"
        style={{ background: 'radial-gradient(circle, var(--brand-accent, #A78BFA) 0%, transparent 70%)' }}
      />

      {/* Brand Header Bar (Full width edge-to-edge background) */}
      <header className={`w-full sticky top-0 z-30 transition-all duration-300 border-b shadow-xs ${
        isDark 
          ? 'bg-zinc-900 border-zinc-800 shadow-black/20' 
          : 'bg-white border-slate-200 shadow-slate-200/30'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo & White-Labeled Branding Info */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              {/* Salon Brand Logo & Identity */}
              <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all ${
                isDark 
                  ? 'bg-zinc-800/70 border-zinc-700/60 shadow-xs' 
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}>
                <SalonLogoImage
                  logo={salonLogo}
                  name={salonName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-xs border border-white/40 dark:border-white/10 shrink-0"
                />
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className={`text-xs sm:text-sm font-black tracking-tight truncate max-w-[120px] sm:max-w-[180px] ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {salonName}
                    </h2>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Active Salon" />
                  </div>
                  <span 
                    className="text-[9px] font-black uppercase tracking-widest block text-brand-primary"
                    style={{ color: 'var(--brand-primary, var(--color-primary, #7C3AED))' }}
                  >
                    Staff Portal
                  </span>
                </div>
              </div>

              {/* Staff Member Avatar & Status */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/70 dark:border-zinc-800">
                <div className="relative shrink-0">
                  <img
                    src={staffProfile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffProfile?.name || 'Staff')}&background=7C3AED&color=fff`}
                    alt={staffProfile?.name || 'Staff Avatar'}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 shadow-xs"
                    style={{ borderColor: 'var(--brand-primary, var(--color-primary, #7C3AED))' }}
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                    isDark ? 'border-zinc-900' : 'border-white'
                  } ${isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>

                <div className="min-w-0 hidden sm:block">
                  <h1 className={`text-xs sm:text-sm font-black tracking-tight leading-none truncate max-w-[140px] ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {staffProfile?.name || 'Staff Member'}
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 mt-0.5 truncate">
                    {staffProfile?.role || 'Service Specialist'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile quick checkin status pill */}
            <span className={`md:hidden px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-xl shrink-0 border ${
              isCheckedIn 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center sm:justify-end w-full md:w-auto">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={toggleDark}
              className={`w-10 h-10 rounded-xl transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                isDark 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-zinc-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Attendance Status Badge & Toggle Button */}
            <div className={`flex items-center gap-1.5 p-1 rounded-2xl border transition-colors shadow-xs ${
              isDark ? 'bg-zinc-800/80 border-zinc-700/80' : 'bg-white/90 border-slate-200/80'
            }`}>
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl ${
                isCheckedIn 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isCheckedIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </span>

              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={attendanceLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> Check-In
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={attendanceLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Check-Out
                </button>
              )}
            </div>

            {/* Password Reset Modal Button */}
            <button
              onClick={() => setForgotPasswordModalOpen(true)}
              className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isDark 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Reset Password"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" /> <span className="hidden sm:inline">Password</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`p-2.5 rounded-xl transition border cursor-pointer shadow-xs ${
                isDark 
                  ? 'bg-zinc-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-zinc-700' 
                  : 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200'
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brand Nav Tabs (Edge-to-edge scroll navigation bar with arrow controls & hidden scrollbars) */}
        <div className={`w-full border-t transition-colors relative ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative flex items-center">
            
            {/* Left Scroll Arrow Button */}
            {canScrollLeft && (
              <div className="absolute left-1 sm:left-4 z-20 flex items-center h-full">
                <button
                  type="button"
                  onClick={() => scrollNav('left')}
                  className={`p-1.5 sm:p-2 rounded-xl border shadow-md transition-all active:scale-90 cursor-pointer ${
                    isDark 
                      ? 'bg-zinc-900/95 text-zinc-200 border-zinc-700/80 hover:bg-zinc-800 hover:text-white' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  aria-label="Scroll navigation left"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}

            {/* Left Edge Gradient Fade Mask */}
            {canScrollLeft && (
              <div className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none transition-opacity duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent' 
                  : 'bg-gradient-to-r from-slate-100/90 via-slate-100/60 to-transparent'
              }`} />
            )}

            {/* Horizontal Scrollable Tabs */}
            <div
              ref={navScrollRef}
              id="staff-nav-scroll"
              data-no-scrollbar="true"
              onWheel={handleNavWheel}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 px-6 sm:px-8 no-scrollbar scrollbar-none scroll-smooth select-none"
            >
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-active={isActive ? "true" : "false"}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-md scale-[1.02]'
                        : isDark
                          ? 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--brand-primary, var(--color-primary, #7C3AED))', color: '#ffffff' } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Edge Gradient Fade Mask */}
            {canScrollRight && (
              <div className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none transition-opacity duration-300 ${
                isDark 
                  ? 'bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent' 
                  : 'bg-gradient-to-l from-slate-100/90 via-slate-100/60 to-transparent'
              }`} />
            )}

            {/* Right Scroll Arrow Button */}
            {canScrollRight && (
              <div className="absolute right-1 sm:right-4 z-20 flex items-center h-full">
                <button
                  type="button"
                  onClick={() => scrollNav('right')}
                  className={`p-1.5 sm:p-2 rounded-xl border shadow-md transition-all active:scale-90 cursor-pointer ${
                    isDark 
                      ? 'bg-zinc-900/95 text-zinc-200 border-zinc-700/80 hover:bg-zinc-800 hover:text-white' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  aria-label="Scroll navigation right"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 relative z-10">
        {activeTab === 'appointments' && (
          <Schedule staffOnlyId={staffId} isStaffPortal={true} isDarkMode={isDark} />
        )}

        {activeTab === 'walkin' && (
          <WalkInBooking 
            onBookingSuccess={() => setActiveTab('appointments')} 
            isDarkMode={isDark}
            isStaffPortal={true}
            staffOnlyId={staffId}
          />
        )}

        {activeTab === 'attendance' && (
          <StaffLeaveManagement staffId={staffId} isDarkMode={isDark} />
        )}

        {activeTab === 'inventory' && (
          <StaffInventoryView staffId={staffId} isDarkMode={isDark} />
        )}

        {activeTab === 'referrals' && (
          <StaffReferralStatsView 
            staffId={staffId} 
            isDarkMode={isDark} 
            onNavigateToPayouts={() => setActiveTab('payouts')}
          />
        )}

        {activeTab === 'payouts' && (
          <StaffPayoutDashboard staffId={staffId} isDarkMode={isDark} />
        )}

        {activeTab === 'invitations' && (
          <StaffInvitations isStandalone={false} isDarkMode={isDark} />
        )}

        {activeTab === 'profile' && (
          <StaffProfileView staffId={staffId} staffUserId={staffUserId} isDarkMode={isDark} />
        )}
      </main>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
      />
    </div>
  );
}
