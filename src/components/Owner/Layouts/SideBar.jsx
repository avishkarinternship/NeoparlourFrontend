import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

import homeIcon from '../../../assets/Owner/Dashboard/SideBar/home_icon.svg';
import manageIcon from '../../../assets/Owner/Dashboard/SideBar/manage_icon.svg';
import analyticsIcon from '../../../assets/Owner/Dashboard/SideBar/analytics_icon.svg';
import ordersIcon from '../../../assets/Owner/Manage/Subscription/invoice_icon.svg';
import helpIcon from '../../../assets/Owner/Dashboard/SideBar/help_icon.svg';
import settingIcon from '../../../assets/Owner/Dashboard/SideBar/setting_icon.svg';
import logoutIcon from '../../../assets/Owner/Dashboard/SideBar/logout_icon.svg';
import attendanceIcon from '../../../assets/Owner/Attendance/total_attendance.svg'

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isManagePath = location.pathname.startsWith('/owner/manage');
  const [showManageDrawer, setShowManageDrawer] = useState(isManagePath);

  useEffect(() => {
    setShowManageDrawer(isManagePath);
  }, [location.pathname, isManagePath]);

  const subMenu = [
    { label: 'Schedule', path: '/owner/manage/schedule' },
    { label: 'Service', path: '/owner/manage/services' },
    { label: 'Inventory', path: '/owner/manage/inventory' },
    { label: 'Staff', path: '/owner/manage/staff' },
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

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auth/logout', {});
    } catch (err) {
      console.error("Server logout request failed:", err);
    } finally {
      localStorage.removeItem('ownerStaffToken');
      localStorage.removeItem('ownerStaffUser');
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');

      toast.success('Successfully logged out!', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '600'
        }
      });
      navigate('/owner/login');
    }
  };

  const renderSidebarContent = (isMobile = false) => {
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
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/dashboard' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
            )}

            <img
              src={homeIcon}
              alt="Dashboard"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/dashboard' ? 'active-icon-glow' : 'opacity-60'
              }`}
            />
            <span>Dashboard</span>
          </button>

          {/* Manage */}
          <button
            onClick={() => handleManageClick(isMobile)}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${isManagePath
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {isManagePath && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
            )}

            <img
              src={manageIcon}
              alt="Manage"
              className={`w-[18px] h-[18px] sidebar-icon ${
                isManagePath ? 'active-icon-glow' : 'opacity-60'
              }`}
            />
            <span>Manage</span>
            <span className="ml-auto text-[10px] text-gray-400 md:hidden">
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
                      ${isActive ? 'text-red-600 bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}
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
            onClick={() => navigate('/owner/analytics')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/analytics'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/analytics' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
            )}

            <img
              src={analyticsIcon}
              alt="Analytics"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/analytics' ? 'active-icon-glow' : 'opacity-60'
              }`}
            />
            <span>Analytics</span>
          </button>

          {/* Customers */}
          <button
            onClick={() => navigate('/owner/customers')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/customers'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/customers' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
            )}

            <svg
              className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${
                location.pathname === '/owner/customers' ? 'active-icon-glow text-red-600' : 'opacity-60'
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
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/orders' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
            )}

            <img
              src={ordersIcon}
              alt="Orders"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/orders' ? 'active-icon-glow' : 'opacity-60'
              }`}
            />
            <span>Orders</span>
          </button>

          {/* Attendance */}
          <button
            onClick={() => navigate('/owner/attendance')}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-md text-[13px] font-bold relative text-left transition-colors duration-150 sidebar-btn
              ${location.pathname === '/owner/attendance'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {location.pathname === '/owner/attendance' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
            )}

            <img
              src={attendanceIcon}
              alt="Attendance"
              className={`w-[18px] h-[18px] sidebar-icon ${
                location.pathname === '/owner/attendance' ? 'active-icon-glow' : 'opacity-60'
              }`}
            />
            <span>Attendance</span>
          </button>


        </div>

        {/* Bottom Utility Profile/Config Actions Group */}
        <div className="p-3 border-t border-gray-100 space-y-1 flex-shrink-0">

          {/* Help Link Option */}
          <a href="#" className="flex items-center space-x-3.5 px-4 py-2.5 text-gray-500 hover:text-gray-900 text-[13px] font-bold transition-colors duration-150 sidebar-btn">
            <img src={helpIcon} alt="Help" className="w-[18px] h-[18px] object-contain flex-shrink-0 sidebar-icon opacity-60" />
            <span>Help</span>
          </a>

          {/* Settings Link Option */}
          <button
            onClick={() => navigate('/owner/settings')}
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

          {/* Session Termination Area */}
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
      <div className="hidden lg:block lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:flex-shrink-0">
        <aside className="sticky top-16 h-[calc(100vh-64px)] w-full flex flex-col justify-between overflow-y-auto">
          {renderSidebarContent(false)}
        </aside>
      </div>

      {/* Mobile Column: Slide-over drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};

export default Sidebar;