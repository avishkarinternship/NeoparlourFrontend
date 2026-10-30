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
import attendanceIcon from '../../../assets/Owner/Attendance/total_attendance.svg';
import { 
  FileText, MessageSquareQuote, Globe, ExternalLink, 
  Sparkles, Bot, Sun, Moon, Bell, ChevronLeft, ChevronRight,
  ShieldCheck, LayoutDashboard, CreditCard, Activity,
  Terminal, LifeBuoy, Bug, TrendingUp, Wrench, Building2,
  Calendar, Users, Clock, ShoppingBag
} from 'lucide-react';
import { LanguageSwitcher } from '../../LanguageSwitcher';

const Sidebar = ({ 
  isOpen, 
  isDesktopOpen = true, 
  onToggleDesktop, 
  onClose, 
  isDarkMode = false, 
  toggleDarkMode 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
      if (ownerUser.role === 'ADMIN') {
        setUnreadCount(0);
        return;
      }
      try {
        const salonId = localStorage.getItem('activeSalonId') || ownerUser.salonId;
        if (!salonId || salonId === 'SYSTEM' || salonId === 'null' || isNaN(Number(salonId))) {
          setUnreadCount(0);
          return;
        }
        const response = await axiosInstance.get(`/notifications/search?salonId=${salonId}&page=0&size=10`);
        const notifs = response.data.content || [];
        setUnreadCount(notifs.filter(n => n.status === 'pending').length);
      } catch (err) {
        // silent catch
      }
    };
    if (isOpen) {
      fetchUnreadCount();
    }
  }, [isOpen]);

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
    if (isMobile) {
      setShowManageDrawer(!showManageDrawer);
    } else {
      if (!isManagePath) {
        navigate('/owner/manage/schedule');
      }
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

  const renderSidebarContent = (isMobile = false, isCollapsed = false) => {
    const user = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
    const roleStr = String(user.role || user.userRole || '').toUpperCase();
    const isAdmin = roleStr === 'ADMIN';
    const isSupportEngineer = roleStr === 'SUPPORT_ENGINEER' || roleStr.includes('SUPPORT');
    const isSeoAdmin = roleStr === 'SEO_ADMIN' || roleStr.includes('SEO');
    const isRail = isCollapsed && !isMobile;

    const renderNavButton = ({
      path,
      label,
      icon,
      badge = null,
      badgeColor = '',
      onClick = null,
      isActive = null,
      key = null
    }) => {
      const active = isActive !== null ? isActive : (path ? location.pathname === path : false);
      const handleClick = () => {
        if (onClick) {
          onClick();
        } else if (path) {
          navigate(path);
        }
        if (isMobile && onClose) onClose();
      };

      return (
        <div key={key || path || label} className="relative group">
          <button
            type="button"
            onClick={handleClick}
            className={`w-full flex items-center rounded-xl text-[13px] font-bold relative transition-all duration-150 cursor-pointer sidebar-btn ${
              isRail
                ? 'justify-center p-2.5 h-11'
                : 'space-x-3.5 px-3.5 py-2.5 text-left justify-between'
            } ${
              active
                ? isDarkMode ? 'bg-red-500/15 text-[#FF0B01] font-black shadow-xs' : 'bg-red-50 text-[#FF0B01] font-black shadow-xs'
                : isDarkMode
                  ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            }`}
            title={isRail ? label : undefined}
          >
            {/* Active Left Indicator */}
            {active && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FF0B01] rounded-r-full shadow-[0_0_8px_rgba(255,11,1,0.6)]"></span>
            )}

            <div className={`flex items-center ${isRail ? 'justify-center' : 'space-x-3.5 min-w-0'}`}>
              <div className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                active ? 'active-icon-glow text-[#FF0B01]' : 'opacity-70 group-hover:opacity-100'
              }`}>
                {icon}
              </div>
              {!isRail && (
                <span className="truncate">{label}</span>
              )}
            </div>

            {/* Badge when expanded */}
            {!isRail && badge && (
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ml-1.5 ${
                badgeColor || 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {badge}
              </span>
            )}

            {/* Collapsed Badge Notification Dot */}
            {isRail && badge && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF0B01] ring-2 ring-white dark:ring-zinc-800"></span>
            )}
          </button>

          {/* Modern Floating Hover Tooltip in Collapsed Mode */}
          {isRail && (
            <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 shadow-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-700/80 dark:border-zinc-200 items-center gap-2">
              <span>{label}</span>
              {badge && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white">
                  {badge}
                </span>
              )}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-white"></span>
            </div>
          )}
        </div>
      );
    };

    const renderMobileUtilities = () => {
      if (!isMobile) return null;
      return (
        <div className={`pt-3 mt-3 border-t space-y-2 px-1 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
          <div className={`text-[10px] font-black uppercase tracking-wider px-2.5 ${
            isDarkMode ? 'text-zinc-500' : 'text-gray-400'
          }`}>
            Preferences & Quick Links
          </div>

          {!isSeoAdmin && (
            <button
              onClick={() => {
                navigate('/owner/notifications');
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-colors duration-150 text-left cursor-pointer ${
                location.pathname === '/owner/notifications'
                  ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01]' : 'text-red-600 bg-red-50'
                  : isDarkMode ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/80' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-[18px] h-[18px] opacity-75 flex-shrink-0" />
                <span>{t('notifications.title', 'Notifications')}</span>
              </div>
              {unreadCount > 0 ? (
                <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              ) : (
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                  0
                </span>
              )}
            </button>
          )}

          <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl border ${
            isDarkMode ? 'bg-zinc-800/40 border-zinc-700/60 text-zinc-300' : 'bg-gray-50 border-gray-100 text-gray-700'
          }`}>
            <div className="flex items-center space-x-3 text-[13px] font-bold">
              {isDarkMode ? <Moon className="w-[18px] h-[18px] text-amber-400 flex-shrink-0" /> : <Sun className="w-[18px] h-[18px] text-amber-500 flex-shrink-0" />}
              <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            {toggleDarkMode && (
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isDarkMode ? 'bg-[#FF0B01]' : 'bg-gray-300'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            )}
          </div>
        </div>
      );
    };

    // 1. ADMIN ROLE VIEW
    if (isAdmin) {
      const adminNavItems = [
        {
          label: 'Dashboard',
          path: '/owner/dashboard',
          icon: <img src={homeIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />,
          isActive: location.pathname === '/owner/dashboard'
        },
        {
          label: 'Salons & KYC',
          path: '/admin/salons',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          isActive: location.pathname === '/admin/salons' || location.pathname === '/owner/salons' || location.pathname === '/owner/kyc'
        },
        {
          label: 'Subscriptions',
          path: '/owner/subscriptions',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
          isActive: location.pathname === '/owner/subscriptions' || location.pathname === '/admin/subscriptions'
        },
        {
          label: 'Server Health',
          path: '/owner/monitoring',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          ),
          isActive: location.pathname === '/owner/monitoring' || location.pathname === '/admin/monitoring'
        },
        {
          label: 'Server Logs',
          path: '/admin/logs',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          isActive: location.pathname === '/admin/logs' || location.pathname === '/owner/logs' || location.pathname === '/admin/system/logs'
        },
        {
          label: 'Support Requests',
          path: '/admin/support-requests',
          badge: 'TIER-1 HELPDESK',
          badgeColor: 'bg-red-500/10 text-red-500 border border-red-500/20',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          ),
          isActive: location.pathname === '/admin/support-requests' || location.pathname === '/owner/support-requests'
        },
        {
          label: 'Developer Bug Queue',
          path: '/admin/developer-bugs',
          badge: 'DEV ESCALATIONS',
          badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          ),
          isActive: location.pathname === '/admin/developer-bugs' || location.pathname === '/owner/developer-bugs'
        },
        {
          label: 'Support Analytics',
          path: '/admin/support-analytics',
          badge: 'SLA & VELOCITY',
          badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          ),
          isActive: location.pathname === '/admin/support-analytics' || location.pathname === '/owner/support-analytics'
        },
        {
          label: 'System Maintenance',
          path: '/admin/maintenance',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          isActive: location.pathname === '/admin/maintenance' || location.pathname === '/owner/maintenance'
        },
        {
          label: 'Blog Manager',
          path: '/admin/blogs',
          icon: <FileText className="w-[18px] h-[18px] shrink-0" />,
          isActive: location.pathname === '/admin/blogs' || location.pathname === '/owner/blogs'
        },
        {
          label: 'Testimonials Manager',
          path: '/admin/testimonials',
          icon: <MessageSquareQuote className="w-[18px] h-[18px] shrink-0" />,
          isActive: location.pathname === '/admin/testimonials' || location.pathname === '/owner/testimonials'
        }
      ];

      return (
        <div className="flex flex-col h-full justify-between">
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
          <div className={`pt-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar ${isRail ? 'px-2' : 'px-3'}`}>
            {adminNavItems.map(item => renderNavButton(item))}
          </div>

          {/* Bottom Admin Utility Actions Group */}
          <div className={`p-2 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-gray-100 bg-gray-50/50'}`}>
            {renderNavButton({
              path: '/owner/settings',
              label: t('owner.sidebar.settings', 'Settings'),
              icon: <img src={settingIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
              isActive: location.pathname === '/owner/settings'
            })}

            {renderMobileUtilities()}

            <div className={`pt-1 border-t mt-1 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              {renderNavButton({
                label: t('owner.sidebar.logout', 'Logout'),
                onClick: handleLogout,
                icon: <img src={logoutIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
                isActive: false
              })}
            </div>
          </div>
        </div>
      );
    }

    // 2. SUPPORT ENGINEER ROLE VIEW
    if (isSupportEngineer) {
      const supportItems = [
        {
          label: 'Support Requests',
          path: '/admin/support-requests',
          badge: 'Tier-1 Helpdesk',
          badgeColor: 'bg-red-500/10 text-red-500 border border-red-500/20',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          ),
          isActive: location.pathname === '/admin/support-requests' || location.pathname === '/owner/support-requests'
        },
        {
          label: 'Developer Bug Queue',
          path: '/admin/developer-bugs',
          badge: 'Dev Escalations',
          badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          ),
          isActive: location.pathname === '/admin/developer-bugs' || location.pathname === '/owner/developer-bugs'
        },
        {
          label: 'Support Analytics',
          path: '/admin/support-analytics',
          badge: 'SLA & Velocity',
          badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          ),
          isActive: location.pathname === '/admin/support-analytics' || location.pathname === '/owner/support-analytics'
        },
        {
          label: 'Salons & KYC',
          path: '/admin/salons',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          isActive: location.pathname === '/admin/salons' || location.pathname === '/owner/salons' || location.pathname === '/owner/kyc'
        },
        {
          label: 'Server Health',
          path: '/owner/monitoring',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          ),
          isActive: location.pathname === '/owner/monitoring' || location.pathname === '/admin/monitoring'
        },
        {
          label: 'Server Logs',
          path: '/admin/logs',
          icon: (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          isActive: location.pathname === '/admin/logs' || location.pathname === '/owner/logs'
        }
      ];

      return (
        <div className="flex flex-col h-full justify-between">
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

          <div className={`pt-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar ${isRail ? 'px-2' : 'px-3'}`}>
            {supportItems.map(item => renderNavButton(item))}
          </div>

          <div className={`p-2 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-gray-100 bg-gray-50/50'}`}>
            {renderNavButton({
              path: '/owner/settings',
              label: t('owner.sidebar.settings', 'Settings'),
              icon: <img src={settingIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
              isActive: location.pathname === '/owner/settings'
            })}

            {renderMobileUtilities()}

            <div className={`pt-1 border-t mt-1 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              {renderNavButton({
                label: t('owner.sidebar.logout', 'Logout'),
                onClick: handleLogout,
                icon: <img src={logoutIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
                isActive: false
              })}
            </div>
          </div>
        </div>
      );
    }

    // 3. SEO ADMIN ROLE VIEW
    if (isSeoAdmin) {
      const seoItems = [
        {
          label: 'Blog Manager',
          path: '/admin/blogs',
          badge: 'SEO Content',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
          icon: <FileText className="w-[18px] h-[18px] shrink-0" />,
          isActive: location.pathname === '/admin/blogs' || location.pathname === '/owner/blogs'
        },
        {
          label: 'Testimonials Manager',
          path: '/admin/testimonials',
          icon: <MessageSquareQuote className="w-[18px] h-[18px] shrink-0" />,
          isActive: location.pathname === '/admin/testimonials' || location.pathname === '/owner/testimonials'
        },
        {
          label: 'SEO Salons Directory',
          path: '/admin/seo-salons',
          icon: <Globe className="w-[18px] h-[18px] shrink-0" />,
          isActive: location.pathname === '/admin/seo-salons' || location.pathname === '/owner/seo-salons' || location.pathname === '/seo-salons'
        },
        {
          label: 'Sitemap XML',
          path: '/admin/seo/sitemap',
          icon: (
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          ),
          isActive: location.pathname === '/admin/seo/sitemap'
        }
      ];

      return (
        <div className="flex flex-col h-full justify-between">
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

          <div className={`pt-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar ${isRail ? 'px-2' : 'px-3'}`}>
            {seoItems.map(item => renderNavButton(item))}
          </div>

          <div className={`p-2 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-gray-100 bg-gray-50/50'}`}>
            {renderNavButton({
              path: '/owner/settings',
              label: t('owner.sidebar.settings', 'Settings'),
              icon: <img src={settingIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
              isActive: location.pathname === '/owner/settings'
            })}

            {renderMobileUtilities()}

            <div className={`pt-1 border-t mt-1 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              {renderNavButton({
                label: t('owner.sidebar.logout', 'Logout'),
                onClick: handleLogout,
                icon: <img src={logoutIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
                isActive: false
              })}
            </div>
          </div>
        </div>
      );
    }

    // 4. STANDARD SALON OWNER & STAFF VIEW
    const standardOwnerItems = [
      {
        label: t('owner.sidebar.dashboard', 'Dashboard'),
        path: '/owner/dashboard',
        icon: <img src={homeIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />,
        isActive: location.pathname === '/owner/dashboard'
      },
      {
        label: t('owner.sidebar.appointments', 'Appointments'),
        path: '/owner/appointments',
        icon: (
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        isActive: location.pathname === '/owner/appointments'
      },
      {
        label: t('owner.sidebar.manage', 'Manage'),
        path: '/owner/manage/schedule',
        icon: <img src={manageIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />,
        isActive: isManagePath,
        onClick: () => handleManageClick(isMobile)
      },
      {
        label: t('owner.sidebar.customers', 'Customers'),
        path: '/owner/customers',
        icon: (
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        isActive: location.pathname === '/owner/customers'
      },
      {
        label: t('owner.sidebar.staff_attendance', 'Staff Attendance'),
        path: '/owner/attendance',
        icon: <img src={attendanceIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />,
        isActive: location.pathname === '/owner/attendance'
      },
      {
        label: t('owner.sidebar.orders', 'Orders'),
        path: '/owner/orders',
        icon: <img src={ordersIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />,
        isActive: location.pathname === '/owner/orders'
      },
      {
        label: t('owner.sidebar.billing', 'Billing'),
        path: '/owner/billing',
        icon: <img src={ordersIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />,
        isActive: location.pathname === '/owner/billing'
      },
      {
        label: t('owner.sidebar.kyc', 'KYC Verification'),
        path: '/owner/kyc',
        icon: (
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        isActive: location.pathname === '/owner/kyc'
      }
    ];

    return (
      <div className="flex flex-col h-full justify-between">
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

        <div className={`pt-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar ${isRail ? 'px-2' : 'px-3'}`}>
          {standardOwnerItems.map(item => renderNavButton(item))}

          {/* Manage Submenu Accordion when expanded */}
          {isMobile && showManageDrawer && (
            <div className={`ml-4 pl-3 border-l space-y-1 my-1.5 transition-all ${
              isDarkMode ? 'border-zinc-800' : 'border-gray-200'
            }`}>
              {subMenu.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? isDarkMode ? 'bg-red-500/15 text-[#FF0B01] font-bold' : 'bg-red-50 text-[#FF0B01] font-bold'
                        : isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={`p-2 border-t space-y-1 flex-shrink-0 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-gray-100 bg-gray-50/50'}`}>
          {renderNavButton({
            path: '/customer/support',
            label: t('drawer.support', 'Help'),
            icon: <img src={helpIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
            isActive: location.pathname === '/customer/support'
          })}

          {renderNavButton({
            path: '/owner/settings',
            label: t('owner.sidebar.settings', 'Settings'),
            icon: <img src={settingIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
            isActive: location.pathname === '/owner/settings'
          })}

          {renderMobileUtilities()}

          <div className={`pt-1 border-t mt-1 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            {renderNavButton({
              label: t('owner.sidebar.logout', 'Logout'),
              onClick: handleLogout,
              icon: <img src={logoutIcon} alt="" className="w-[18px] h-[18px] object-contain shrink-0 opacity-70" />,
              isActive: false
            })}
          </div>
        </div>
      </div>
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

      {/* Desktop Column: Smooth Collapsible Mini-Rail (w-20) / Expanded (w-64) Column */}
      <div className={`hidden lg:block lg:flex-shrink-0 transition-all duration-300 ease-in-out relative ${
        isDesktopOpen 
          ? 'lg:w-64 lg:border-r' 
          : 'lg:w-20 lg:border-r'
      } ${
        isDarkMode ? 'lg:bg-zinc-900 lg:border-zinc-800 text-zinc-100' : 'lg:bg-white lg:border-gray-200 text-gray-900'
      }`}>
        <aside className={`sticky top-16 h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ease-in-out relative ${
          isDesktopOpen ? 'w-64' : 'w-20'
        }`}>
          {/* Interactive Edge Floating Toggle Pill (On the vertical border line!) */}
          <button 
            type="button"
            onClick={onToggleDesktop}
            className={`absolute ${isManagePath ? 'top-16' : 'top-4'} -right-3.5 z-40 w-7 h-7 rounded-full border shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-500 shadow-black/40' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600 shadow-gray-200/60'
            }`}
            title={!isDesktopOpen ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            aria-label={!isDesktopOpen ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${!isDesktopOpen ? 'rotate-180 text-red-600' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Scrollable Items Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden flex flex-col justify-between">
            {renderSidebarContent(false, !isDesktopOpen)}
          </div>
        </aside>
      </div>

      {/* Mobile Column: Slide-over drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out lg:hidden
        ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {renderSidebarContent(true, false)}
      </aside>
    </>
  );
};

export default Sidebar;
