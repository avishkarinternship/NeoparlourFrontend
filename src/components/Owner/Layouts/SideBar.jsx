import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  const isManagePath = location.pathname.startsWith('/owner/manage');
  const [showManageDrawer, setShowManageDrawer] = useState(isManagePath);

  useEffect(() => {
    setShowManageDrawer(isManagePath);
  }, [location.pathname, isManagePath]);

  const subMenu = [
    { label: 'Schedule', path: '/owner/manage/schedule' },
    { label: 'Walk-in Booking', path: '/owner/manage/walk-in' },
    { label: 'Service', path: '/owner/manage/services' },
    { label: 'Inventory', path: '/owner/manage/inventory' },
    { label: 'Staff', path: '/owner/manage/staff' },
    { label: 'Staff Invitations', path: '/owner/staff-invitations' },
    { label: 'Feedback', path: '/owner/manage/feedback' },
    { label: 'Home Services', path: '/owner/manage/home-services' },
    { label: 'Subscription', path: '/owner/manage/subscription' },
    { label: 'Add Offers', path: '/owner/manage/add-offers' },
    { label: 'Add Products', path: '/owner/manage/add-products' },
    { label: 'Add Packages', path: '/owner/manage/add-package' },
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
    const isAdmin = user.role === 'ADMIN';

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
            <button
              onClick={() => {
                navigate('/owner/dashboard');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/dashboard'
                  ? 'bg-red-50 text-[#FF0B01] border-r-4 border-[#FF0B01]'
                  : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <img src={homeIcon} alt="Home" className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            {/* Salons & KYC */}
            <button
              onClick={() => {
                navigate(isAdmin ? '/admin/salons' : '/owner/kyc');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn ${
                location.pathname === '/owner/kyc' || location.pathname === '/admin/salons' || location.pathname === '/owner/salons'
                  ? 'bg-red-50 text-[#FF0B01] border-r-4 border-[#FF0B01]'
                  : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/salons' ? 'active-icon-glow text-red-600' : 'opacity-65'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Salons & KYC</span>
            </button>

            {/* Subscriptions */}
            <button
              onClick={() => {
                navigate('/owner/subscriptions');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/subscriptions'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {location.pathname === '/owner/subscriptions' && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <svg
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/subscriptions' ? 'active-icon-glow text-red-600' : 'opacity-65'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Subscriptions</span>
            </button>

            {/* Server Health */}
            <button
              onClick={() => {
                navigate('/owner/monitoring');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/monitoring'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {location.pathname === '/owner/monitoring' && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <svg
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/monitoring' ? 'active-icon-glow text-red-600' : 'opacity-60'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              <span>Server Health</span>
            </button>

            {/* Support Requests */}
            <button
              onClick={() => {
                navigate('/owner/support-requests');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/support-requests'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {location.pathname === '/owner/support-requests' && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <svg 
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/support-requests' ? 'active-icon-glow text-red-600' : 'opacity-60'
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Support Requests</span>
            </button>

            {/* System Maintenance */}
            <button
              onClick={() => {
                navigate('/owner/maintenance');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/maintenance' || location.pathname === '/admin/maintenance'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {(location.pathname === '/owner/maintenance' || location.pathname === '/admin/maintenance') && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <svg 
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/maintenance' || location.pathname === '/admin/maintenance' ? 'active-icon-glow text-red-600' : 'opacity-60'
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zm-6 8a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zm12 0a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zM4 20h16" />
              </svg>
              <span>System Maintenance</span>
            </button>

            {/* Blog Manager */}
            <button
              onClick={() => {
                navigate('/owner/blogs');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/blogs' || location.pathname === '/admin/blogs'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {(location.pathname === '/owner/blogs' || location.pathname === '/admin/blogs') && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <svg 
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/blogs' || location.pathname === '/admin/blogs' ? 'active-icon-glow text-red-600' : 'opacity-60'
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>Blog Manager</span>
            </button>

            {/* Testimonials Manager */}
            <button
              onClick={() => {
                navigate('/owner/testimonials');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/testimonials' || location.pathname === '/admin/testimonials'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {(location.pathname === '/owner/testimonials' || location.pathname === '/admin/testimonials') && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <svg 
                className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                  location.pathname === '/owner/testimonials' || location.pathname === '/admin/testimonials' ? 'active-icon-glow text-red-600' : 'opacity-60'
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Testimonials Manager</span>
            </button>
          </div>

          {/* Bottom Admin Utility Actions Group */}
          <div className="p-3 border-t border-gray-100 space-y-1 flex-shrink-0">
            <button
              onClick={() => {
                navigate('/owner/settings');
                if (isMobile && onClose) onClose();
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
                ${location.pathname === '/owner/settings'
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {location.pathname === '/owner/settings' && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
              )}
              <img
                src={settingIcon}
                alt="Settings"
                className={`w-[18px] h-[18px] sidebar-icon ${
                  location.pathname === '/owner/settings' ? 'active-icon-glow' : 'opacity-60'
                }`}
              />
              <span>Settings</span>
            </button>

            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3.5 px-4 py-2.5 text-gray-500 hover:text-red-600 text-[13px] font-bold transition-colors duration-150 cursor-pointer sidebar-btn"
              >
                <img src={logoutIcon} alt="Logout" className="w-[18px] h-[18px] object-contain flex-shrink-0 sidebar-icon opacity-60" />
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
            <span>Dashboard</span>
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
            <span>Manage</span>
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
            <span>Analytics</span>
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
            <span>Customers</span>
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
            <span>Orders</span>
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
            <span>Attendance</span>
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
            <span>KYC Verification</span>
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
            <span>Help</span>
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
            <span>Settings</span>
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
              <span>Logout</span>
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