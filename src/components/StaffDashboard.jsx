import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, UserPlus, LogOut, Lock, CheckCircle2, LogIn, Sparkles, FileText, Scissors, Moon, Sun, TrendingUp } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

// Sub components
import Schedule from './Owner/Manage/Schedule';
import StaffLeaveManagement from './StaffLeaveManagement';
import StaffProfileView from './StaffProfileView';
import StaffInventoryView from './StaffInventoryView';
import StaffReferralStatsView from './StaffReferralStatsView';
import WalkInBooking from './Owner/Manage/WalkInBooking';
import ForgotPasswordModal from './ForgotPasswordModal';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function StaffDashboard() {
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

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('staff_dark_mode') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('staff_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'walkin', 'attendance', 'inventory', 'profile'

  // Attendance Status State
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [staffProfile, setStaffProfile] = useState(null);

  // Modals state
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (staffId) {
      loadTodayAttendance();
      loadProfileHeader();
    }
  }, [staffId]);

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
      const res = await staffApi.getStaffById(staffId);
      setStaffProfile(res.data || null);
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
    localStorage.clear();
    window.location.href = '/login';
  };

  const isCheckedIn = todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#fafafa] text-slate-800'
    }`}>
      {/* Brand Header Bar */}
      <header className={`border-b sticky top-0 z-30 shadow-xs transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo & Staff Info */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src={staffProfile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffProfile?.name || 'Staff')}&background=FF0B01&color=fff`}
                  alt={staffProfile?.name || 'Staff Avatar'}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-[#FF0B01] shadow-md"
                />
                <span className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 ${
                  isDarkMode ? 'border-slate-900' : 'border-white'
                } ${isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className={`text-base sm:text-xl font-black tracking-tight leading-none truncate max-w-[140px] sm:max-w-none ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {staffProfile?.name || 'Staff Member'}
                  </h1>
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/60 text-[#FF0B01] text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100 dark:border-red-900/50 flex items-center gap-1 flex-shrink-0">
                    <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#FF0B01]" /> Portal
                  </span>
                </div>
                <p className={`text-[10px] sm:text-xs font-semibold mt-0.5 truncate ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  {staffProfile?.salonName || 'NeoParlour Staff'} • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Mobile quick checkin status pill */}
            <span className={`md:hidden px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg flex-shrink-0 ${
              isCheckedIn 
                ? isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isDarkMode ? 'bg-amber-950/80 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end w-full md:w-auto">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`w-11 h-11 rounded-2xl transition border flex items-center justify-center cursor-pointer relative overflow-hidden ${
                isDarkMode 
                  ? 'bg-zinc-800 text-amber-400 border-zinc-700 hover:bg-zinc-700' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Sun className={`w-4 h-4 text-amber-400 absolute ${
                  isDarkMode ? 'animate-sun-enter' : 'animate-sun-exit'
                }`} />
                <Moon className={`w-4 h-4 text-slate-600 absolute ${
                  !isDarkMode ? 'animate-moon-enter' : 'animate-moon-exit'
                }`} />
              </div>
            </button>

            {/* Attendance Status Badge & Toggle Button */}
            <div className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl border transition-colors ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl ${
                isCheckedIn 
                  ? isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : isDarkMode ? 'bg-amber-950/80 text-amber-400 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200'
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
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold transition border flex items-center gap-1 cursor-pointer ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Reset Password"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" /> <span className="hidden sm:inline">Password</span> Reset
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`p-2 sm:p-2.5 rounded-2xl transition border border-transparent cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Logout"
            >
              <LogOut className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
            </button>
          </div>
        </div>

        {/* Brand Nav Tabs */}
        <div className={`max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 border-t flex items-center gap-1 sm:gap-3 overflow-x-auto pt-1 scrollbar-none transition-colors duration-300 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Appointments
          </button>

          <button
            onClick={() => setActiveTab('walkin')}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'walkin'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Walk-In Booking
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Attendance & Leaves
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> My Inventory
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'referrals'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> My Referrals
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Staff Profile
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        {activeTab === 'appointments' && (
          <Schedule staffOnlyId={staffId} isStaffPortal={true} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'walkin' && (
          <WalkInBooking onBookingSuccess={() => setActiveTab('appointments')} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'attendance' && (
          <StaffLeaveManagement staffId={staffId} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'inventory' && (
          <StaffInventoryView staffId={staffId} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'referrals' && (
          <StaffReferralStatsView staffId={staffId} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'profile' && (
          <StaffProfileView staffId={staffId} staffUserId={staffUserId} isDarkMode={isDarkMode} />
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
