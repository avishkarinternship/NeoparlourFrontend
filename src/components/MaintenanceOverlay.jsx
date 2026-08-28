import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import toast from 'react-hot-toast';
import serverMaintenanceImg from '../assets/Server/server_under_maintenance.gif';
import neoLogo from '../assets/Neoparlour_logo.png';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ShieldAlert, RefreshCw, Power, Clock, Sparkles, Zap, Lock, Headphones, User, Scissors } from 'lucide-react';

export const MaintenanceOverlay = () => {
  const { t } = useTranslation();
  const [maintenance, setMaintenance] = useState(null);
  const [checking, setChecking] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial maintenance status on mount across Customer, Staff, and Owner modules
    const checkInitialMaintenanceStatus = async () => {
      try {
        const res = await axiosInstance.get('/v1/maintenance/status');
        if (res?.data && res.data.enabled === true) {
          setMaintenance(res.data);
        }
      } catch (err) {
        if (err.response?.status === 503 || err.response?.data?.maintenance === true) {
          setMaintenance({
            enabled: true,
            is503: true,
            message: t('maintenance.default_message'),
            ...(err.response?.data || {})
          });
        }
      }
    };

    checkInitialMaintenanceStatus();

    const handleMaintenanceActiveEvent = (event) => {
      const data = event?.detail;
      if (data && data.enabled !== false) {
        setMaintenance(data);
      }
    };

    const handleMaintenanceClearedEvent = () => {
      setMaintenance(null);
    };

    window.addEventListener('SYSTEM_MAINTENANCE_ACTIVE', handleMaintenanceActiveEvent);
    window.addEventListener('SYSTEM_MAINTENANCE_CLEARED', handleMaintenanceClearedEvent);

    return () => {
      window.removeEventListener('SYSTEM_MAINTENANCE_ACTIVE', handleMaintenanceActiveEvent);
      window.removeEventListener('SYSTEM_MAINTENANCE_CLEARED', handleMaintenanceClearedEvent);
    };
  }, [t]);

  // Detect module role (Owner, Staff, or Customer)
  const isOwnerOrAdminUser = () => {
    const currentPath = location.pathname.toLowerCase();
    if (currentPath.startsWith('/owner') || currentPath.startsWith('/admin')) {
      return true;
    }

    try {
      const userToken = localStorage.getItem('ownerStaffToken');
      if (userToken) {
        return true;
      }
      const userStr = localStorage.getItem('ownerStaffUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.role === 'SALON_OWNER' || user?.role === 'ADMIN') {
          return true;
        }
      }
    } catch (e) {
      console.warn("Error parsing user role for maintenance check:", e);
    }

    return false;
  };

  const isStaffUser = () => {
    const currentPath = location.pathname.toLowerCase();
    if (currentPath.startsWith('/staff')) return true;
    if (localStorage.getItem('staff_id')) return true;
    return false;
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await axiosInstance.get('/v1/maintenance/status');
      if (res?.data && res.data.enabled === false) {
        setMaintenance(null);
        toast.success(t('status.operational'));
        window.location.reload();
      } else {
        toast.error(t('maintenance.active_tag'));
      }
    } catch (e) {
      console.warn("System is still under maintenance:", e);
      toast.error(t('maintenance.active_tag'));
    } finally {
      setChecking(false);
    }
  };

  // Detect if current user has ADMIN role
  const isAdminUser = () => {
    try {
      const userStr = localStorage.getItem('ownerStaffUser') || localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ROLE_ADMIN') {
          return true;
        }
      }
      const userRole = localStorage.getItem('role') || localStorage.getItem('user_role');
      if (userRole && (userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'ROLE_ADMIN')) {
        return true;
      }
    } catch (e) {
      console.warn("Error parsing user role for admin check:", e);
    }
    return false;
  };

  // Do not render overlay if maintenance is inactive
  if (!maintenance || maintenance.enabled === false) {
    return null;
  }

  // Do not render overlay for ADMIN users, login screens, or maintenance admin control pages
  const currentPath = location.pathname.toLowerCase();
  if (
    isAdminUser() ||
    currentPath.includes('/login') ||
    currentPath === '/owner/maintenance' ||
    currentPath === '/admin/maintenance'
  ) {
    return null;
  }

  const isOwnerAdmin = isOwnerOrAdminUser();
  const isStaff = isStaffUser();

  const displayMessage =
    maintenance.message && !maintenance.message.toLowerCase().includes('operational')
      ? maintenance.message
      : t('maintenance.default_message');

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/65 backdrop-blur-xl text-slate-900 flex items-center justify-center p-2 sm:p-4 overflow-hidden h-screen w-screen font-sans animate-in fade-in duration-300">
      
      {/* Outer Card Container - Fixed viewport height fit */}
      <div className="max-w-6xl w-full h-full max-h-[96vh] sm:max-h-[92vh] bg-white/95 border border-slate-200/90 rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 my-auto">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={neoLogo} alt="NeoParlour Logo" className="h-7 sm:h-9 object-contain" />
            <span className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 hidden sm:block">
              {isOwnerAdmin ? t('labels.owner_portal') : isStaff ? t('labels.staff_portal') : t('labels.customer_portal')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-[11px] font-black uppercase tracking-wider text-[#FF0B01]">
              <span className="w-2 h-2 rounded-full bg-[#FF0B01] animate-ping" />
              {t('maintenance.active_tag')}
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Section - Fit inside viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center flex-1 my-auto overflow-hidden py-2 sm:py-4">
          
          {/* Left Column: API Message, Heading & Actions */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4 text-left overflow-y-auto max-h-full py-1 pr-1 custom-scrollbar">
            
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg">
                <Sparkles className="w-3 h-3 text-amber-600" /> {t('maintenance.badge')}
              </span>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                {t('maintenance.title')}
              </h1>
            </div>

            {/* API Received Announcement Message Above Box */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50/80 via-amber-50/50 to-slate-50 border border-red-100/80 rounded-xl sm:rounded-2xl">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#FF0B01] block mb-0.5">
                {t('maintenance.announcement_header')}
              </span>
              <p className="text-slate-800 text-xs sm:text-sm font-bold leading-snug">
                "{displayMessage}"
              </p>
            </div>

            {/* Estimated Completion Badge */}
            {maintenance.estimatedEndTime && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[11px] font-extrabold text-slate-700 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#FF0B01]" />
                <span>{t('maintenance.estimated_completion', { time: new Date(maintenance.estimatedEndTime).toLocaleString() })}</span>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="px-6 py-3.5 bg-[#FF0B01] hover:bg-red-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-red-600/25 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? t('buttons.check_status') : t('buttons.refresh_status')}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Server GIF Camouflaged Seamlessly into Card Background */}
          <div className="lg:col-span-6 relative flex items-center justify-center h-full w-full py-1 min-h-[240px] sm:min-h-[320px]">
            
            {/* Server GIF Graphic - Camouflaged into background using mix-blend-multiply */}
            <img
              src={serverMaintenanceImg}
              alt="Server Under Maintenance"
              className="max-h-[280px] sm:max-h-[380px] lg:max-h-[460px] w-full h-auto object-contain mix-blend-multiply transition-all duration-300"
            />

          </div>

        </div>

        {/* Bottom Feature Footer Indicators */}
        <div className="border-t border-slate-100 pt-3 sm:pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-150">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#FF0B01] flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 uppercase truncate">{t('maintenance.speed_opt')}</h4>
              <p className="text-[10px] font-semibold text-slate-500 truncate">{t('maintenance.speed_opt_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-150">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 uppercase truncate">{t('maintenance.data_sec')}</h4>
              <p className="text-[10px] font-semibold text-slate-500 truncate">{t('maintenance.data_sec_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-150">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 uppercase truncate">{t('maintenance.support_standby')}</h4>
              <p className="text-[10px] font-semibold text-slate-500 truncate">{t('maintenance.support_standby_desc')}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MaintenanceOverlay;
