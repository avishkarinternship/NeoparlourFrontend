import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { performCleanLogout } from '../../../utils/auth';

import homeIcon from '../../../assets/Owner/Dashboard/SideBar/home_icon.svg';
import manageIcon from '../../../assets/Owner/Dashboard/SideBar/manage_icon.svg';
import analyticsIcon from '../../../assets/Owner/Dashboard/SideBar/analytics_icon.svg';
import ordersIcon from '../../../assets/Owner/Manage/Subscription/invoice_icon.svg';
import helpIcon from '../../../assets/Owner/Dashboard/SideBar/help_icon.svg';
import settingIcon from '../../../assets/Owner/Dashboard/SideBar/setting_icon.svg';
import logoutIcon from '../../../assets/Owner/Dashboard/SideBar/logout_icon.svg';
import attendanceIcon from '../../../assets/Owner/Attendance/total_attendance.svg'

const Sidebar = ({ isOpen, onClose, isDarkMode = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isManagePath = location.pathname.startsWith('/owner/manage');
  const [showManageDrawer, setShowManageDrawer] = useState(isManagePath);

  useEffect(() => {
    setShowManageDrawer(isManagePath);
  }, [location.pathname, isManagePath]);

  const subMenu = [
    { label: t('owner.manage_sidebar.schedule', 'Schedule'), path: '/owner/manage/schedule' },
    { label: t('owner.manage_sidebar.walk_in', 'Walk-in Booking'), path: '/owner/manage/walk-in' },
    { label: t('owner.manage_sidebar.services', 'Service'), path: '/owner/manage/services' },
    { label: t('owner.manage_sidebar.inventory', 'Inventory'), path: '/owner/manage/inventory' },
    { label: t('owner.manage_sidebar.staff', 'Staff'), path: '/owner/manage/staff' },
    { label: t('owner.sidebar.staff_invitations', 'Staff Invitations'), path: '/owner/staff-invitations' },
    { label: t('owner.manage_sidebar.feedback', 'Feedback'), path: '/owner/manage/feedback' },
    { label: t('owner.manage_sidebar.home_services', 'Home Services'), path: '/owner/manage/home-services' },
    { label: t('owner.manage_sidebar.subscription', 'Subscription'), path: '/owner/manage/subscription' },
    { label: t('owner.manage_sidebar.add_offers', 'Add Offers'), path: '/owner/manage/add-offers' },
    { label: t('owner.manage_sidebar.add_products', 'Add Products'), path: '/owner/manage/add-products' },
    { label: t('owner.manage_sidebar.add_packages', 'Add Packages'), path: '/owner/manage/add-package' },
  ];

  const handleManageClick = (isMobile = false) => {
    setShowManageDrawer(!showManageDrawer);
    if (!isMobile && !isManagePath) {
      navigate('/owner/manage/schedule');
    }
  };

  const handleLogout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    toast.success('Successfully logged out!', {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        borderRadius: '12px',
        fontWeight: '600'
      }
    });
    performCleanLogout('/owner/login');
  };

  const renderSidebarContent = (isMobile = false) => {
    const user = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
    const roleStr = String(user.role || user.userRole || '').toUpperCase();
    const isAdmin = roleStr === 'ADMIN';
    const isSupportEngineer = roleStr === 'SUPPORT_ENGINEER' || roleStr.includes('SUPPORT');

    if (isSupportEngineer) {
      return (
        <>
          {/* Mobile Header with Close Button */}
          {isMobile && (
            <div className={`flex items-center justify-between p-4 border-b lg:hidden flex-shrink-0 ${
              isDarkMode ? 'border-zinc-800' : 'border-gray-100'
            }`}>
              <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support Engineer Portal</span>
              <button onClick={onClose} className={`p-1 ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Support Engineer Navigation Items */}
          <div className="pt-4 px-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            
            {/* 1. Support Requests (Tier-1 Helpdesk Workspace) */}
            {(() => {
              const isActive = location.pathname === '/admin/support-requests' || location.pathname === '/owner/support-requests';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/support-requests');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <div className="flex items-center space-x-3.5">
                    <svg 
                      className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>Support Requests</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                    Tier-1 Helpdesk
                  </span>
                </button>
              );
            })()}

            {/* 2. Developer Bug Queue (Dev Escalations Portal) */}
            {(() => {
              const isActive = location.pathname === '/admin/developer-bugs';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/developer-bugs');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <div className="flex items-center space-x-3.5">
                    <svg 
                      className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Developer Bug Queue</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    Dev Escalations
                  </span>
                </button>
              );
            })()}

            {/* 3. Support Analytics (SLA & Velocity Monitor) */}
            {(() => {
              const isActive = location.pathname === '/admin/support-analytics' || location.pathname === '/admin/support-dashboard';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/support-analytics');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <div className="flex items-center space-x-3.5">
                    <svg 
                      className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Support Analytics</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    SLA & Velocity
                  </span>
                </button>
              );
            })()}

            {/* Salons & KYC */}
            {(() => {
              const isActive = location.pathname === '/admin/salons' || location.pathname === '/owner/salons' || location.pathname === '/owner/kyc';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/salons');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Salons & KYC</span>
                </button>
              );
            })()}

            {/* KYC Queue */}
            {(() => {
              const isActive = location.pathname === '/admin/kyc-requests' || location.pathname === '/admin/kyc';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/kyc-requests');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>KYC Queue</span>
                </button>
              );
            })()}

          </div>

          {/* Bottom Utility Actions Group */}
          <div className={`p-3 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            {(() => {
              const isActive = location.pathname === '/owner/settings';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/settings');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <img
                    src={settingIcon}
                    alt="Settings"
                    className={`w-[18px] h-[18px] sidebar-icon ${isActive ? 'active-icon-glow' : 'opacity-70'}`}
                  />
                  <span>Settings</span>
                </button>
              );
            })()}

            <div className={`pt-2 border-t mt-2 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-3.5 px-4 py-2.5 text-[13px] font-bold transition-colors duration-150 cursor-pointer sidebar-btn ${
                  isDarkMode ? 'text-zinc-300 hover:text-red-400 hover:bg-zinc-800/80' : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                <img src={logoutIcon} alt="Logout" className="w-[18px] h-[18px] object-contain flex-shrink-0 sidebar-icon opacity-70" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      );
    }

    if (isAdmin) {
      return (
        <>
          {/* Mobile Header with Close Button */}
          {isMobile && (
            <div className={`flex items-center justify-between p-4 border-b lg:hidden flex-shrink-0 ${
              isDarkMode ? 'border-zinc-800' : 'border-gray-100'
            }`}>
              <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Navigation</span>
              <button onClick={onClose} className={`p-1 ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Top Admin Controls Group */}
          <div className="pt-4 px-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            {/* Dashboard */}
            {(() => {
              const isActive = location.pathname === '/owner/dashboard';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/dashboard');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <img
                    src={homeIcon}
                    alt="Home"
                    className={`w-[18px] h-[18px] sidebar-icon ${isActive ? 'active-icon-glow' : 'opacity-70'}`}
                  />
                  <span>Dashboard</span>
                </button>
              );
            })()}

            {/* Salons & KYC */}
            {(() => {
              const isActive = location.pathname === '/admin/salons' || location.pathname === '/owner/salons' || location.pathname === '/owner/kyc';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/salons');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Salons & KYC</span>
                </button>
              );
            })()}

            {/* KYC Verification Queue (Admin) */}
            {(() => {
              const isActive = location.pathname === '/admin/kyc-requests' || location.pathname === '/admin/kyc';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/kyc-requests');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>KYC Queue</span>
                </button>
              );
            })()}

            {/* Subscriptions */}
            {(() => {
              const isActive = location.pathname === '/owner/subscriptions';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/subscriptions');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Subscriptions</span>
                </button>
              );
            })()}

            {/* Server Health */}
            {(() => {
              const isActive = location.pathname === '/owner/monitoring';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/monitoring');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  <span>Server Health</span>
                </button>
              );
            })()}

            {/* Server Logs */}
            {(() => {
              const isActive = location.pathname === '/admin/logs' || location.pathname === '/owner/logs';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/logs');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Server Logs</span>
                </button>
              );
            })()}

            {/* 1. Support Requests (Tier-1 Helpdesk Workspace) */}
            {(() => {
              const isActive = location.pathname === '/admin/support-requests' || location.pathname === '/owner/support-requests';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/support-requests');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <div className="flex items-center space-x-3.5">
                    <svg 
                      className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>Support Requests</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                    Tier-1 Helpdesk
                  </span>
                </button>
              );
            })()}

            {/* 2. Developer Bug Queue (Dev Escalations Portal) */}
            {(() => {
              const isActive = location.pathname === '/admin/developer-bugs';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/developer-bugs');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <div className="flex items-center space-x-3.5">
                    <svg 
                      className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Developer Bug Queue</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    Dev Escalations
                  </span>
                </button>
              );
            })()}

            {/* 3. Support Analytics (SLA & Velocity Monitor) */}
            {(() => {
              const isActive = location.pathname === '/admin/support-analytics' || location.pathname === '/admin/support-dashboard';
              return (
                <button
                  onClick={() => {
                    navigate('/admin/support-analytics');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <div className="flex items-center space-x-3.5">
                    <svg 
                      className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Support Analytics</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    SLA & Velocity
                  </span>
                </button>
              );
            })()}

            {/* System Maintenance */}
            {(() => {
              const isActive = location.pathname === '/owner/maintenance' || location.pathname === '/admin/maintenance';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/maintenance');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg 
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zm-6 8a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zm12 0a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zM4 20h16" />
                  </svg>
                  <span>System Maintenance</span>
                </button>
              );
            })()}

            {/* Blog Manager */}
            {(() => {
              const isActive = location.pathname === '/owner/blogs' || location.pathname === '/admin/blogs';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/blogs');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg 
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Blog Manager</span>
                </button>
              );
            })()}

            {/* Testimonials Manager */}
            {(() => {
              const isActive = location.pathname === '/owner/testimonials' || location.pathname === '/admin/testimonials';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/testimonials');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <svg 
                    className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${isActive ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>Testimonials Manager</span>
                </button>
              );
            })()}
          </div>

          {/* Bottom Admin Utility Actions Group */}
          <div className={`p-3 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            {(() => {
              const isActive = location.pathname === '/owner/settings';
              return (
                <button
                  onClick={() => {
                    navigate('/owner/settings');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                    isActive
                      ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
                  )}
                  <img
                    src={settingIcon}
                    alt="Settings"
                    className={`w-[18px] h-[18px] sidebar-icon ${isActive ? 'active-icon-glow' : 'opacity-70'}`}
                  />
                  <span>Settings</span>
                </button>
              );
            })()}

            <div className={`pt-2 border-t mt-2 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-3.5 px-4 py-2.5 text-[13px] font-bold transition-colors duration-150 cursor-pointer sidebar-btn ${
                  isDarkMode ? 'text-zinc-300 hover:text-red-400 hover:bg-zinc-800/80' : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                <img src={logoutIcon} alt="Logout" className="w-[18px] h-[18px] object-contain flex-shrink-0 sidebar-icon opacity-70" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        {/* Mobile Header with Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden flex-shrink-0">
            <span className="text-gray-900 font-bold text-sm">Navigation</span>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Top Application Feature Controls Group */}
        <div className="pt-4 px-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar">

          {/* Dashboard */}
          <button
            onClick={() => navigate('/owner/dashboard')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/dashboard'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/dashboard' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <img
              src={homeIcon}
              alt="Dashboard"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/dashboard' ? 'active-icon-glow' : 'opacity-70'
              }`}
            />
            <span>{t('owner.sidebar.dashboard', 'Dashboard')}</span>
          </button>

          {/* Manage */}
          <button
            onClick={() => handleManageClick(isMobile)}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${isManagePath
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {isManagePath && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <img
              src={manageIcon}
              alt="Manage"
              className={`w-[18px] h-[18px] sidebar-icon ${
                isManagePath ? 'active-icon-glow' : 'opacity-70'
              }`}
            />
            <span>{t('owner.sidebar.manage', 'Manage')}</span>
            <span className={`ml-auto text-[10px] md:hidden ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
              {showManageDrawer ? '▼' : '▶'}
            </span>
          </button>

          {/* Inline Nested Sub-Menu for Mobile */}
          {showManageDrawer && (
            <div className="pl-9 pr-3 py-1.5 space-y-1 md:hidden">
              {subMenu.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      if (onClose) onClose(); // Close mobile main sidebar
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-[12px] font-bold text-left transition-colors duration-150
                      ${isActive 
                        ? (isDarkMode ? 'text-[#FF0B01] bg-white/[0.07]' : 'text-red-600 bg-red-50/50') 
                        : (isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-50')}
                    `}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Analytics */}
          <button
            onClick={() => {
              navigate('/owner/analytics');
              if (isMobile && onClose) onClose();
            }}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/analytics'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/analytics' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <img
              src={analyticsIcon}
              alt="Analytics"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/analytics' ? 'active-icon-glow' : 'opacity-70'
              }`}
            />
            <span>{t('owner.sidebar.analytics', 'Analytics')}</span>
          </button>

          {/* Customers */}
          <button
            onClick={() => navigate('/owner/customers')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/customers'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/customers' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <svg
              className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                location.pathname === '/owner/customers' ? 'active-icon-glow text-red-600' : 'opacity-70'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('owner.sidebar.customers', 'Customers')}</span>
          </button>

          {/* Orders */}
          <button
            onClick={() => navigate('/owner/orders')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/orders'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/orders' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <img
              src={ordersIcon}
              alt="Orders"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/orders' ? 'active-icon-glow' : 'opacity-70'
              }`}
            />
            <span>{t('owner.sidebar.orders', 'Orders')}</span>
          </button>

          {/* Attendance */}
          <button
            onClick={() => navigate('/owner/attendance')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/attendance'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/attendance' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <img
              src={attendanceIcon}
              alt="Attendance"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/attendance' ? 'active-icon-glow' : 'opacity-70'
              }`}
            />
            <span>{t('owner.sidebar.staff_attendance', 'Attendance')}</span>
          </button>

          {/* KYC Verification */}
          <button
            onClick={() => {
              navigate('/owner/kyc');
              if (isMobile && onClose) onClose();
            }}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/kyc'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/kyc' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <svg
              className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                location.pathname === '/owner/kyc' ? 'active-icon-glow text-red-600' : 'opacity-70'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{t('owner.sidebar.kyc', 'KYC Verification')}</span>
          </button>

        </div>

        {/* Bottom Utility Profile/Config Actions Group */}
        <div className={`p-3 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>

          {/* Help Link Option */}
          <button
            onClick={() => navigate('/customer/support')}
            className={`w-full flex items-center space-x-3.5 px-4 py-2.5 text-[13px] font-bold transition-colors duration-150 sidebar-btn text-left ${
              isDarkMode ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/80' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <img src={helpIcon} alt="Help" className="w-[18px] h-[18px] object-contain flex-shrink-0 sidebar-icon opacity-70" />
            <span>{t('drawer.support', 'Help')}</span>
          </button>

          {/* Settings Link Option */}
          <button
            onClick={() => navigate('/owner/settings')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/settings'
                ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/settings' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
            )}

            <img
              src={settingIcon}
              alt="Settings"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/settings' ? 'active-icon-glow' : 'opacity-70'
              }`}
            />
            <span>{t('owner.sidebar.settings', 'Settings')}</span>
          </button>

          {/* Session Termination Area */}
          <div className={`pt-2 border-t mt-2 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3.5 px-4 py-2.5 text-[13px] font-bold transition-colors duration-150 cursor-pointer sidebar-btn ${
                isDarkMode ? 'text-zinc-300 hover:text-red-400 hover:bg-zinc-800/80' : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <img src={logoutIcon} alt="Logout" className="w-[18px] h-[18px] object-contain flex-shrink-0 sidebar-icon opacity-70" />
              <span>{t('owner.sidebar.logout', 'Logout')}</span>
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Desktop Column: Wrapper stretches background to footer, inner box is sticky */}
      <div className={`hidden lg:block lg:w-64 lg:border-r lg:flex-shrink-0 transition-colors duration-300 ${
        isDarkMode ? 'lg:bg-zinc-800 lg:border-zinc-700 text-zinc-100' : 'lg:bg-white lg:border-gray-200 text-gray-900'
      }`}>
        <aside className="sticky top-16 h-[calc(100vh-64px)] w-full flex flex-col justify-between overflow-y-auto">
          {renderSidebarContent(false)}
        </aside>
      </div>

      {/* Mobile Column: Slide-over drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col justify-between h-screen overflow-y-auto transition-all duration-300 ease-in-out lg:hidden
        ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};

export default Sidebar;