import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, UserPlus, LogOut, Lock, CheckCircle2, LogIn, Sparkles, FileText, Scissors } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

// Sub components
import Schedule from './Owner/Manage/Schedule';
import StaffLeaveManagement from './StaffLeaveManagement';
import StaffProfileView from './StaffProfileView';
import StaffInventoryView from './StaffInventoryView';
import WalkInBooking from './Owner/Manage/WalkInBooking';
import ForgotPasswordModal from './ForgotPasswordModal';

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
      const res = await staffApi.getStaffProfile(staffId);
      setStaffProfile(res.data?.content || res.data || null);
    } catch (err) {
      console.warn('Could not fetch profile header:', err);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      await staffApi.checkIn(staffId);
      toast.success('Successfully checked in!');
      loadTodayAttendance();
    } catch (err) {
      toast.error('Check-in error: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      await staffApi.checkOut(staffId);
      toast.success('Successfully checked out!');
      loadTodayAttendance();
    } catch (err) {
      toast.error('Check-out error: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('ownerStaffToken');
    window.location.href = '/staff/login';
  };

  const isCheckedIn = !!(todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-800">
      {/* Brand Header Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Staff Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={staffProfile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffProfile?.name || 'Staff')}&background=FF0B01&color=fff`}
                alt={staffProfile?.name || 'Staff Avatar'}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#FF0B01] shadow-md"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  {staffProfile?.name || 'Staff Member'}
                </h1>
                <span className="px-2.5 py-0.5 bg-red-50 text-[#FF0B01] text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF0B01]" /> Staff Portal
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                {staffProfile?.salonName || 'NeoParlour Staff'} • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Attendance Status Badge & Toggle Button */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl ${
                isCheckedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isCheckedIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </span>

              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={attendanceLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> Check-In
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={attendanceLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Check-Out
                </button>
              )}
            </div>

            {/* Walk-in Quick Tab Switcher */}
            <button
              onClick={() => setActiveTab('walkin')}
              className="bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-red-500/15 flex items-center gap-2 cursor-pointer"
            >
              <Scissors className="w-4 h-4" /> Walk-In Booking
            </button>

            {/* Password Reset Modal Button */}
            <button
              onClick={() => setForgotPasswordModalOpen(true)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold transition border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              title="Reset Password"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password Reset
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition border border-transparent hover:border-rose-100 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Brand Nav Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-3 overflow-x-auto pt-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" /> Appointments
          </button>

          <button
            onClick={() => setActiveTab('walkin')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'walkin'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-4 h-4" /> Walk-In Booking
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Attendance & Leaves
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" /> My Inventory
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#FF0B01] text-[#FF0B01]'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Staff Profile
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto py-6">
        {activeTab === 'appointments' && (
          <Schedule staffOnlyId={staffId} isStaffPortal={true} />
        )}

        {activeTab === 'walkin' && (
          <WalkInBooking onBookingSuccess={() => setActiveTab('appointments')} />
        )}

        {activeTab === 'attendance' && (
          <StaffLeaveManagement staffId={staffId} />
        )}

        {activeTab === 'inventory' && (
          <StaffInventoryView staffId={staffId} />
        )}

        {activeTab === 'profile' && (
          <StaffProfileView staffId={staffId} staffUserId={staffUserId} />
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
