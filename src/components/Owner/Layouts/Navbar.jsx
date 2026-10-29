import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, Moon, X, Building2, LifeBuoy, Bug, BarChart3, 
  CreditCard, Activity, FileText, AlertTriangle, BookOpen, 
  MessageSquare, Settings, ArrowRight, ShieldCheck, Search 
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import supportService from '../../../services/supportService';
import { kycAdminService } from '../../../services/kycAdminService';

// 1. Keep these correct relative imports (climbing out of your layout folder to src/assets)
import logoIcon from '../../../assets/Neoparlour_logo.png';
import profileIcon from '../../../assets/Owner/profile.jpg';
import { LanguageSwitcher } from '../../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import SeoAdminProfileModal from './SeoAdminProfileModal';

const AsyncImage = ({ imagePath, alt, className, fallbackText }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (!imagePath) {
      setSrc(null);
      setError(true);
      return;
    }

    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      setSrc(imagePath);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axiosInstance.get(`/images/${imagePath}`, {
          responseType: 'blob',
        });
        const blobUrl = URL.createObjectURL(response.data);
        setSrc(blobUrl);
      } catch (err) {
        console.error(`Failed to load image from API: ${imagePath}`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imagePath]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-zinc-800 flex items-center justify-center ${className}`}>
        <span className="text-[10px] text-gray-400 font-bold">...</span>
      </div>
    );
  }

  if (error || !src) {
    return (
      <div className={`bg-red-50 dark:bg-red-950/40 text-[#ff0b01] flex items-center justify-center font-bold text-xs uppercase ${className}`}>
        {fallbackText ? fallbackText.charAt(0) : '?'}
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
};

const ADMIN_NAV_SHORTCUTS = [
  { name: 'Salons & KYC Directory', path: '/admin/salons', keywords: ['salon', 'salons', 'kyc', 'directory', 'documents', 'banned', 'active'], icon: 'Building2' },
  { name: 'KYC Verification Queue', path: '/admin/salons?tab=kyc', keywords: ['kyc', 'verification', 'verify', 'queue', 'documents', 'pending'], icon: 'ShieldCheck' },
  { name: 'Support Requests (Tier-1 Helpdesk)', path: '/admin/support-requests', keywords: ['support', 'help', 'ticket', 'tickets', 'request', 'complaint', 'customer', 'issue'], icon: 'LifeBuoy' },
  { name: 'Developer Bug Queue (Dev Escalations)', path: '/admin/developer-bugs', keywords: ['bug', 'bugs', 'developer', 'dev', 'escalate', 'escalation', 'trace', 'error', 'fault'], icon: 'Bug' },
  { name: 'Support Analytics & SLA Monitor', path: '/admin/support-analytics', keywords: ['analytics', 'sla', 'velocity', 'performance', 'engineer', 'resolved', 'metrics'], icon: 'BarChart3' },
  { name: 'Subscriptions & Plan Contracts', path: '/owner/subscriptions', keywords: ['subscription', 'subscriptions', 'plan', 'plans', 'contract', 'contracts', 'coupon', 'coupons'], icon: 'CreditCard' },
  { name: 'Server Health & Infrastructure', path: '/owner/monitoring', keywords: ['server', 'health', 'monitor', 'monitoring', 'grafana', 'cpu', 'memory'], icon: 'Activity' },
  { name: 'Live Server Logs', path: '/admin/logs', keywords: ['log', 'logs', 'server', 'system', 'console', 'stream'], icon: 'FileText' },
  { name: 'System Maintenance Page', path: '/owner/maintenance', keywords: ['maintenance', 'server down', 'system maintenance'], icon: 'AlertTriangle' },
  { name: 'Blog Articles Manager', path: '/owner/blogs', keywords: ['blog', 'blogs', 'article', 'articles', 'content', 'post'], icon: 'BookOpen' },
  { name: 'Testimonials Manager', path: '/owner/testimonials', keywords: ['testimonial', 'testimonials', 'review', 'reviews'], icon: 'MessageSquare' },
  { name: 'Admin Settings & Profile', path: '/owner/settings', keywords: ['setting', 'settings', 'profile', 'password', 'account'], icon: 'Settings' }
];

const renderAdminIcon = (iconName, className = "w-4 h-4") => {
  switch (iconName) {
    case 'Building2': return <Building2 className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'LifeBuoy': return <LifeBuoy className={className} />;
    case 'Bug': return <Bug className={className} />;
    case 'BarChart3': return <BarChart3 className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'AlertTriangle': return <AlertTriangle className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Settings': return <Settings className={className} />;
    default: return <ArrowRight className={className} />;
  }
};

export default function Navbar({ onToggleSidebar, isSidebarOpen = true, isDarkMode = false, toggleDarkMode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Salon Owner Search Results
  const [searchResults, setSearchResults] = useState({
    staff: [],
    customerSalonVisits: [],
    appointments: [],
    services: [],
    products: [],
    offers: []
  });

  // Admin / Support Search Results
  const [adminResults, setAdminResults] = useState({
    navigation: [],
    salons: [],
    tickets: [],
    kyc: [],
    subscriptions: []
  });

  const [searching, setSearching] = useState(false);
  const [salonProfile, setSalonProfile] = useState({
    salonName: "",
    imageUrl: null
  });

  const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
  const userRole = String(
    ownerUser?.role || 
    ownerUser?.userRole || 
    (Array.isArray(ownerUser?.roles) ? ownerUser.roles[0] : ownerUser?.roles) || 
    ''
  ).toUpperCase();
  const isSeoAdmin = userRole === 'SEO_ADMIN' || userRole.includes('SEO');
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ROLE_ADMIN';
  const isSupport = userRole === 'SUPPORT_ENGINEER' || userRole.includes('SUPPORT');
  const isAdminOrSupport = isAdmin || isSupport || location.pathname.startsWith('/admin') || (location.pathname.startsWith('/owner') && (isAdmin || isSupport));

  const [showSeoProfileModal, setShowSeoProfileModal] = useState(false);
  const [seoAdminUser, setSeoAdminUser] = useState(ownerUser);

  // Close dropdown on click outside or on Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setIsMobileSearchOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin && !isSeoAdmin) {
      fetchSalonProfile();
      fetchNotifications();
    }
  }, [isAdmin, isSeoAdmin]);

  const fetchNotifications = async () => {
    const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
    if (ownerUser.role === 'ADMIN') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const salonId = localStorage.getItem('activeSalonId') || ownerUser.salonId;
      if (!salonId || salonId === 'SYSTEM' || salonId === 'null' || isNaN(Number(salonId))) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      const response = await axiosInstance.get(`/notifications/search?salonId=${salonId}&page=0&size=10`);
      const notifs = response.data.content || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => n.status === 'pending').length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const [deletingNotifId, setDeletingNotifId] = useState(null);

  const handleDeleteNotification = async (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (deletingNotifId === id) return;
    setDeletingNotifId(id);

    // Optimistically remove notification from state immediately
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      setUnreadCount(updated.filter(n => n.status === 'pending').length);
      return updated;
    });

    try {
      await axiosInstance.delete(`/notifications/${id}`);
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      if (error.response?.status !== 404) {
        await fetchNotifications();
      }
    } finally {
      setDeletingNotifId(null);
    }
  };

  const handleDeleteAllNotifications = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Optimistically clear state immediately
    setNotifications([]);
    setUnreadCount(0);

    try {
      await axiosInstance.delete('/notifications/all');
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      if (error.response?.status !== 404) {
        await fetchNotifications();
      }
    }
  };

  const fetchSalonProfile = async () => {
    if (isAdmin) return;
    try {
      const response = await axiosInstance.get("/salons/profile");

      setSalonProfile({
        salonName: response.data.salonName,
        imageUrl:
          response.data.imageUrl ||
          (response.data.salonImages?.length > 0
            ? response.data.salonImages[0].imageUrl
            : null)
      });
    } catch (error) {
      console.error("Salon profile fetch failed:", error);
    }
  };

  // Admin search executor across relevant admin endpoints
  const executeAdminSearch = async (searchQuery, signal) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearching(false);
      return;
    }

    // 1. Instant local matching for Admin navigation shortcuts
    const matchingNav = ADMIN_NAV_SHORTCUTS.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q) || q.includes(k))
    );

    setAdminResults(prev => ({
      ...prev,
      navigation: matchingNav
    }));

    // 2. Fetch live data across Admin endpoints in parallel
    try {
      const [salonsRes, ticketsRes, kycRes, subsRes] = await Promise.allSettled([
        axiosInstance.get('/salons/admin/all', {
          params: { page: 0, size: 5, salonName: searchQuery.trim() },
          skipGlobalToast: true,
          signal
        }),
        supportService.getSupportRequests({
          search: searchQuery.trim(),
          page: 0,
          size: 5,
          sort: 'createdAt,desc'
        }),
        kycAdminService.getKycQueue({
          search: searchQuery.trim(),
          status: 'ALL',
          page: 0,
          size: 5
        }),
        isAdmin ? axiosInstance.get('/subscriptions/admin/all', {
          params: { search: searchQuery.trim(), page: 0, size: 5 },
          skipGlobalToast: true,
          signal
        }) : Promise.resolve({ data: [] })
      ]);

      const salonsData = salonsRes.status === 'fulfilled' && salonsRes.value?.data ?
        (salonsRes.value.data.content || (Array.isArray(salonsRes.value.data) ? salonsRes.value.data : [])) : [];
      
      const ticketsData = ticketsRes.status === 'fulfilled' && ticketsRes.value?.data ?
        (ticketsRes.value.data.content || (Array.isArray(ticketsRes.value.data) ? ticketsRes.value.data : [])) : [];

      const kycData = kycRes.status === 'fulfilled' && kycRes.value?.data ?
        (kycRes.value.data.content || (Array.isArray(kycRes.value.data) ? kycRes.value.data : [])) : [];

      const subsData = subsRes.status === 'fulfilled' && subsRes.value?.data ?
        (subsRes.value.data.content || (Array.isArray(subsRes.value.data) ? subsRes.value.data : [])) : [];

      setAdminResults({
        navigation: matchingNav,
        salons: salonsData,
        tickets: ticketsData,
        kyc: kycData,
        subscriptions: subsData
      });
    } catch (err) {
      if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
        console.error("Admin search failed:", err);
      }
    } finally {
      setSearching(false);
    }
  };

  // Salon Owner search executor (Universal Search)
  const executeOwnerSearch = async (searchQuery, signal) => {
    try {
      const response = await axiosInstance.get('/search', {
        params: { query: searchQuery.trim(), limit: 5 },
        skipGlobalToast: true,
        signal
      });
      const data = response.data || {};
      setSearchResults({
        staff: data.staff || [],
        customerSalonVisits: data.customerSalonVisits || [],
        appointments: data.appointments || [],
        services: data.services || [],
        products: data.products || [],
        offers: data.offers || []
      });
    } catch (err) {
      if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
        console.error("Universal search failed:", err);
      }
    } finally {
      setSearching(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setSearching(false);
      setShowDropdown(false);
      setSearchResults({
        staff: [],
        customerSalonVisits: [],
        appointments: [],
        services: [],
        products: [],
        offers: []
      });
      setAdminResults({
        navigation: [],
        salons: [],
        tickets: [],
        kyc: [],
        subscriptions: []
      });
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const delayDebounce = setTimeout(() => {
      if (isAdminOrSupport) {
        executeAdminSearch(query, controller.signal);
      } else {
        executeOwnerSearch(query, controller.signal);
      }
    }, 250);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [query, isAdminOrSupport]);

  const handleManualSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(true);
    setSearching(true);
    const controller = new AbortController();
    if (isAdminOrSupport) {
      executeAdminSearch(query, controller.signal);
    } else {
      executeOwnerSearch(query, controller.signal);
    }
  };

  const handleResultClick = (callback) => {
    if (callback) callback();
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
  };

  const renderSearchResults = () => {
    if (!query.trim()) {
      return null;
    }

    const hasAnyAdminResults = 
      (adminResults.navigation && adminResults.navigation.length > 0) ||
      (adminResults.salons && adminResults.salons.length > 0) ||
      (adminResults.tickets && adminResults.tickets.length > 0) ||
      (adminResults.kyc && adminResults.kyc.length > 0) ||
      (adminResults.subscriptions && adminResults.subscriptions.length > 0);

    const hasAnyOwnerResults = 
      (searchResults.staff && searchResults.staff.length > 0) ||
      (searchResults.customerSalonVisits && searchResults.customerSalonVisits.length > 0) ||
      (searchResults.appointments && searchResults.appointments.length > 0) ||
      (searchResults.services && searchResults.services.length > 0) ||
      (searchResults.products && searchResults.products.length > 0) ||
      (searchResults.offers && searchResults.offers.length > 0);

    // 1. ADMIN & SUPPORT SEARCH RESULTS RENDERER
    if (isAdminOrSupport) {
      return (
        <div className="space-y-4">
          {/* Header with Title and explicit Close button */}
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Admin Search Results
              </span>
              {searching && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Searching...
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
              title="Close search window (Esc)"
            >
              <span className="hidden sm:inline text-[9px] text-gray-400 font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-zinc-800">ESC</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading state when no results yet */}
          {searching && !hasAnyAdminResults && (
            <div className="flex items-center justify-center py-8 gap-2.5">
              <div className="animate-spin h-5 w-5 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Searching admin records...</span>
            </div>
          )}

          {/* Category A: Portal Quick Actions */}
          {adminResults.navigation && adminResults.navigation.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                <h4 className={`text-[9px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-500' : 'text-gray-400'
                }`}>
                  Portal Quick Actions
                </h4>
                <span className="text-[9px] font-bold text-gray-400">
                  {adminResults.navigation.length} {adminResults.navigation.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {adminResults.navigation.map((nav, idx) => (
                  <button
                    key={`nav-${idx}`}
                    onClick={() => handleResultClick(() => navigate(nav.path))}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group cursor-pointer border ${
                      isDarkMode ? 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/60 text-zinc-100' : 'bg-gray-50/80 hover:bg-red-50/20 border-gray-100 hover:border-red-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 text-[#ff0b01] flex items-center justify-center flex-shrink-0">
                        {renderAdminIcon(nav.icon, "w-3.5 h-3.5")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors">{nav.name}</div>
                        <div className="text-[9px] text-gray-400 font-mono truncate">{nav.path}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#ff0b01] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category B: Salons */}
          {adminResults.salons && adminResults.salons.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                <h4 className={`text-[9px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-500' : 'text-gray-400'
                }`}>
                  Salons Directory
                </h4>
                <span className="text-[9px] font-bold text-gray-400">
                  {adminResults.salons.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {adminResults.salons.map(salon => {
                  const salonId = salon.salonId || salon.id;
                  const isBanned = salon.banned || salon.status === 'BANNED';
                  return (
                    <button
                      key={`salon-${salonId}`}
                      onClick={() => handleResultClick(() => navigate('/admin/salons'))}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group cursor-pointer border ${
                        isDarkMode ? 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/40' : 'bg-white hover:bg-red-50/20 border-gray-100 hover:border-red-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {salon.salonName || salon.name || `Salon #${salonId}`}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold truncate flex items-center gap-2">
                            {salon.contactNumber && <span>📞 {salon.contactNumber}</span>}
                            {salon.cityName && <span>📍 {salon.cityName}</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isBanned 
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {isBanned ? 'Banned' : 'Active'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category C: Support Requests / Tickets */}
          {adminResults.tickets && adminResults.tickets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                <h4 className={`text-[9px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-500' : 'text-gray-400'
                }`}>
                  Support Requests & Helpdesk
                </h4>
                <span className="text-[9px] font-bold text-gray-400">
                  {adminResults.tickets.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {adminResults.tickets.map(ticket => {
                  const ticketId = ticket.id;
                  const status = ticket.status || 'PENDING';
                  return (
                    <button
                      key={`ticket-${ticketId}`}
                      onClick={() => handleResultClick(() => navigate('/admin/support-requests'))}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group cursor-pointer border ${
                        isDarkMode ? 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/40' : 'bg-white hover:bg-red-50/20 border-gray-100 hover:border-red-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                          <LifeBuoy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-black text-[#ff0b01]">#{ticketId}</span>
                            <span className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {ticket.name || ticket.userName || 'Customer Issue'}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium truncate max-w-xs">
                            {ticket.description || ticket.subject || 'Support request details'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        status === 'ESCALATED_TO_DEV' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                        status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category D: KYC Documents */}
          {adminResults.kyc && adminResults.kyc.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                <h4 className={`text-[9px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-500' : 'text-gray-400'
                }`}>
                  KYC Verifications
                </h4>
                <span className="text-[9px] font-bold text-gray-400">
                  {adminResults.kyc.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {adminResults.kyc.map(item => {
                  const docId = item.id;
                  const status = item.status || 'PENDING';
                  return (
                    <button
                      key={`kyc-${docId}`}
                      onClick={() => handleResultClick(() => navigate('/admin/salons?tab=kyc'))}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group cursor-pointer border ${
                        isDarkMode ? 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/40' : 'bg-white hover:bg-red-50/20 border-gray-100 hover:border-red-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.salonName || item.ownerName || `KYC Submission #${docId}`}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold truncate">
                            {item.documentType || 'Verification Document'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        status === 'VERIFIED' || status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category E: Subscriptions */}
          {adminResults.subscriptions && adminResults.subscriptions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                <h4 className={`text-[9px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-500' : 'text-gray-400'
                }`}>
                  Subscriptions & Contracts
                </h4>
                <span className="text-[9px] font-bold text-gray-400">
                  {adminResults.subscriptions.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {adminResults.subscriptions.map(sub => {
                  const subId = sub.id || sub.subscriptionId;
                  const status = sub.status || 'ACTIVE';
                  return (
                    <button
                      key={`sub-${subId}`}
                      onClick={() => handleResultClick(() => navigate('/owner/subscriptions'))}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group cursor-pointer border ${
                        isDarkMode ? 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/40' : 'bg-white hover:bg-red-50/20 border-gray-100 hover:border-red-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {sub.salonName || sub.planName || `Subscription #${subId}`}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold truncate">
                            Plan: {sub.planCode || sub.planName || 'Standard'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State when no results and not searching */}
          {!searching && !hasAnyAdminResults && (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-700 dark:text-zinc-200">
                  No records matching "{query}"
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Try searching for a salon name, city, ticket ID, or navigation keyword
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleResultClick(() => navigate('/admin/salons'))}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-red-500 hover:text-[#ff0b01] text-gray-600 dark:text-zinc-300 transition"
                >
                  Browse Salons
                </button>
                <button
                  type="button"
                  onClick={() => handleResultClick(() => navigate('/admin/support-requests'))}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-red-500 hover:text-[#ff0b01] text-gray-600 dark:text-zinc-300 transition"
                >
                  Support Requests
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleResultClick(() => navigate('/owner/subscriptions'))}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-red-500 hover:text-[#ff0b01] text-gray-600 dark:text-zinc-300 transition"
                  >
                    Subscriptions
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer with Keyboard Dismissal Hint */}
          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[9px] border border-gray-200 dark:border-zinc-700">ESC</kbd> to close</span>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition font-bold"
            >
              Dismiss Window
            </button>
          </div>
        </div>
      );
    }

    // 2. SALON OWNER SEARCH RESULTS RENDERER
    return (
      <div className="space-y-4">
        {/* Header with Title and explicit Close button */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              Salon Search Results
            </span>
            {searching && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Searching...
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowDropdown(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title="Close search window (Esc)"
          >
            <span className="hidden sm:inline text-[9px] text-gray-400 font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-zinc-800">ESC</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {searching && !hasAnyOwnerResults && (
          <div className="flex items-center justify-center py-8 gap-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Searching records...</span>
          </div>
        )}

        {!searching && !hasAnyOwnerResults && (
          <div className="text-center py-6 text-xs text-gray-400 font-bold">
            No matching records found.
          </div>
        )}

        {/* Category 1: Staff Stylists */}
        {searchResults.staff && searchResults.staff.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest border-b pb-1 ${
              isDarkMode ? 'text-zinc-500 border-zinc-800' : 'text-gray-400 border-gray-100'
            }`}>
              Team Stylists
            </h4>
            <div className="space-y-1.5">
              {searchResults.staff.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => handleResultClick(() => navigate('/owner/manage/staff', { state: { editStaffId: staff.id } }))}
                  className="w-full flex items-center justify-between p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[#ff0b01] text-[10px] border ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-red-50 border-gray-200'
                    }`}>
                      {staff.imageUrl || staff.imagePath ? (
                        <img 
                          src={staff.imageUrl || staff.imagePath} 
                          alt={staff.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.src = staff.gender === 'FEMALE' 
                              ? 'https://cdn-icons-png.flaticon.com/512/6997/6997671.png'
                              : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                      ) : (
                        <img 
                          src={staff.gender === 'FEMALE' 
                            ? 'https://cdn-icons-png.flaticon.com/512/6997/6997671.png'
                            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                          alt={staff.name} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{staff.name}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">{staff.phone}</div>
                    </div>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold capitalize ${
                    isDarkMode ? 'bg-red-950/40 text-red-400' : 'bg-red-50 text-[#ff0b01]'
                  }`}>
                    {staff.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category 2: Salon Visits */}
        {searchResults.customerSalonVisits && searchResults.customerSalonVisits.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest border-b pb-1 ${
              isDarkMode ? 'text-zinc-500 border-zinc-800' : 'text-gray-400 border-gray-100'
            }`}>
              Salon Visits / Customers
            </h4>
            <div className="space-y-1.5">
              {searchResults.customerSalonVisits.map(visit => (
                <button
                  key={visit.id}
                  onClick={() => handleResultClick(() => navigate('/owner/customers', { state: { customerMobile: visit.customerMobile, customerName: visit.customerName } }))}
                  className="w-full p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-xs font-bold group-hover:text-[#ff0b01] transition-colors truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {visit.customerName}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {visit.visitCount} Visits
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="text-[9px] text-gray-400 font-semibold truncate">
                      {visit.customerMobile}
                    </span>
                    <span className="text-[9px] font-bold text-green-600">
                      ₹ {visit.totalRevenue?.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category 3: Appointments */}
        {searchResults.appointments && searchResults.appointments.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest border-b pb-1 ${
              isDarkMode ? 'text-zinc-500 border-zinc-800' : 'text-gray-400 border-gray-100'
            }`}>
              Appointments
            </h4>
            <div className="space-y-1.5">
              {searchResults.appointments.map(appt => (
                <button
                  key={appt.id}
                  onClick={() => handleResultClick(() => navigate('/owner/manage/schedule', { state: { appointmentId: appt.id } }))}
                  className="w-full p-2.5 hover:bg-red-50/10 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {appt.customerName || appt.customer?.fullName || 'Customer'}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      ₹ {(appt.finalAmount || appt.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[150px]">
                      {appt.serviceNames?.join(', ') || appt.serviceName || (appt.services && appt.services.map(s => s.serviceName).join(', ')) || 'Grooming'}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      appt.status === 'booked' 
                        ? isDarkMode ? 'bg-red-950/40 text-red-400' : 'bg-red-50 text-[#ff0b01]'
                        : appt.status === 'completed' 
                          ? isDarkMode ? 'bg-emerald-950/30 text-emerald-400' : 'bg-[#E3F9EC] text-[#299764]'
                          : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {appt.status === 'booked' ? 'scheduled' : appt.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category 4: Services */}
        {searchResults.services && searchResults.services.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest border-b pb-1 ${
              isDarkMode ? 'text-zinc-500 border-zinc-800' : 'text-gray-400 border-gray-100'
            }`}>
              Services
            </h4>
            <div className="space-y-1.5">
              {searchResults.services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleResultClick(() => navigate('/owner/manage/services', { state: { serviceId: service.id } }))}
                  className="w-full p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{service.name}</div>
                    <div className="text-[9px] text-gray-400 font-semibold capitalize">{service.category} • {service.duration} mins</div>
                  </div>
                  <span className="text-xs font-black text-[#ff0b01] flex-shrink-0">
                    ₹ {service.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category 5: Products */}
        {searchResults.products && searchResults.products.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest border-b pb-1 ${
              isDarkMode ? 'text-zinc-500 border-zinc-800' : 'text-gray-400 border-gray-100'
            }`}>
              Products
            </h4>
            <div className="space-y-1.5">
              {(searchResults.products ?? []).map(product => {
                const prodNameInitial = product.name?.charAt(0).toUpperCase() || 'P';
                return (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(() => navigate('/owner/manage/add-products', { state: { editProductId: product.id } }))}
                    className="w-full flex items-center justify-between p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-red-50 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-[#ff0b01] text-[10px]">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                            }}
                          />
                        ) : (
                          prodNameInitial
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{product.name}</div>
                        <div className="text-[9px] text-gray-400 font-semibold">{product.category} • {product.stock} in stock</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#ff0b01] flex-shrink-0">
                      ₹ {product.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category 6: Offers */}
        {searchResults.offers && searchResults.offers.length > 0 && (
          <div className="space-y-2">
            <h4 className={`text-[9px] font-black uppercase tracking-widest border-b pb-1 ${
              isDarkMode ? 'text-zinc-500 border-zinc-800' : 'text-gray-400 border-gray-100'
            }`}>
              Offers
            </h4>
            <div className="space-y-1.5">
              {searchResults.offers.map(offer => {
                const discountLabel = (offer.discountType?.toUpperCase() === 'PERCENTAGE')
                  ? `${offer.discountValue}% OFF`
                  : `₹${offer.discountValue} OFF`;
                return (
                  <button
                    key={offer.id}
                    onClick={() => handleResultClick(() => navigate('/owner/manage/add-offers', { state: { editOfferId: offer.id } }))}
                    className="w-full p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className={`text-xs font-bold truncate group-hover:text-[#ff0b01] transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{offer.name}</div>
                      <div className="text-[9px] text-gray-400 font-semibold">
                        {discountLabel}
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      offer.active 
                        ? isDarkMode ? 'bg-emerald-950/30 text-emerald-400' : 'bg-[#E3F9EC] text-[#299764]' 
                        : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {offer.active ? 'active' : 'inactive'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer with Keyboard Dismissal Hint */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[9px] border border-gray-200 dark:border-zinc-700">ESC</kbd> to close</span>
          <button
            type="button"
            onClick={() => setShowDropdown(false)}
            className="text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition font-bold"
          >
            Dismiss Window
          </button>
        </div>
      </div>
    );
  };

  const searchPlaceholder = isAdminOrSupport
    ? t('owner.navbar.admin_search_placeholder', 'Search salons, support tickets, KYC, subscriptions...')
    : t('owner.navbar.search_placeholder', 'Search staff, bookings, customers, services...');

  return (
    <header className={`h-16 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300 border-b relative ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
    }`}>

      {/* Left Logo Area */}
      <div className={`h-full flex items-center px-3 sm:px-4 md:px-5 border-r flex-shrink-0 transition-all duration-300 ${
        isSidebarOpen ? 'lg:w-64' : 'w-auto'
      } ${
        isDarkMode ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`mr-2.5 sm:mr-3 p-1.5 rounded-xl transition-colors cursor-pointer focus:outline-none flex items-center justify-center ${
            isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={isSidebarOpen ? "Hide sidebar (Ctrl+B)" : "Show sidebar (Ctrl+B)"}
          aria-label={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div 
          className="flex items-center space-x-2.5 cursor-pointer" 
          onClick={() => {
            const user = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
            const roleStr = String(user?.role || user?.userRole || '').toUpperCase();
            if (roleStr === 'SUPPORT_ENGINEER' || roleStr.includes('SUPPORT')) {
              navigate('/admin/support-requests');
            } else if (roleStr.includes('STAFF')) {
              navigate('/staff/dashboard');
            } else {
              navigate('/owner/dashboard');
            }
          }}
        >
          <img
            src={logoIcon}
            alt="NeoParlour Logo"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          <span className={`text-base font-bold tracking-tight hidden md:inline ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            NeoParlour
          </span>
        </div>
      </div>

      {/* Right Container Elements */}
      <div className="flex items-center justify-end flex-1 px-3 sm:px-6 space-x-2 sm:space-x-4 min-w-0">

        {/* Desktop Pill-Shaped Inline Search Field */}
        {!isSeoAdmin && (
          <div ref={dropdownRef} className="hidden sm:block relative flex-1 max-w-xs md:max-w-md transition-all duration-300">
            <form 
              onSubmit={handleManualSearch}
              className={`border rounded-full p-1 pl-3 sm:pl-4 flex items-center focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 transition-all duration-200 ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-gray-300'
              }`}
            >
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (val.trim().length > 0) {
                    setShowDropdown(true);
                  } else {
                    setShowDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (query.trim().length > 0) {
                    setShowDropdown(true);
                  }
                }}
                className={`w-full bg-transparent text-[11px] sm:text-xs focus:outline-none ${
                  isDarkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-gray-700 placeholder-gray-400'
                }`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setShowDropdown(false);
                  }}
                  className={`mr-2 text-[10px] font-bold p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 ${
                    isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="hidden sm:block bg-red-600 text-white px-5 py-1.5 text-xs font-bold rounded-full hover:bg-red-700 uppercase tracking-wider transition-colors duration-150 flex-shrink-0 cursor-pointer"
              >
                {t('buttons.search', 'Search')}
              </button>
            </form>

            {/* Absolute Search Dropdown results for Desktop */}
            {showDropdown && query.trim().length > 0 && (
              <div className={`absolute top-full left-0 w-full mt-2 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto p-4 space-y-4 border animate-in fade-in zoom-in-95 duration-150 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
              }`}>
                {renderSearchResults()}
              </div>
            )}
          </div>
        )}

        {/* Mobile Search Icon Button */}
        {!isSeoAdmin && (
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
            }}
            className={`sm:hidden p-2 rounded-xl transition-colors ${
              isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}

        {/* Language Switcher (Desktop only - mobile is in sidebar) */}
        {!isAdmin && !isSeoAdmin && (
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
        )}

        {/* Dark Mode Toggle Button (Desktop only - mobile is in sidebar) */}
        <button
          onClick={toggleDarkMode}
          className={`hidden sm:flex w-11 h-11 rounded-2xl transition border items-center justify-center cursor-pointer relative overflow-hidden ${
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

        {/* Notification Bell with Badge */}
        {!isAdmin && !isSeoAdmin && (
        <div ref={notifDropdownRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-11 h-11 rounded-2xl transition border flex items-center justify-center cursor-pointer relative ${
              isDarkMode 
                ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-zinc-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Window */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-xl z-50 border overflow-hidden flex flex-col ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
            }`} style={{ maxHeight: '480px' }}>
              <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-zinc-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-4 transition-colors relative group ${
                        notif.status === 'pending' 
                          ? isDarkMode ? 'bg-zinc-800/50' : 'bg-red-50/20' 
                          : isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-gray-50'
                      }`}
                    >
                        <div className="flex items-start justify-between gap-2 mb-1">
                           <div className="flex items-center space-x-2 min-w-0 pr-4">
                              {notif.type === 'APPOINTMENT_BOOKED' ? (
                                 <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              ) : notif.type === 'PRODUCT_ORDERED' ? (
                                 <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                              ) : (
                                 <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                              )}
                              <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>{notif.title}</h4>
                           </div>
                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                             notif.status === 'pending' 
                               ? isDarkMode ? 'bg-red-950/40 text-red-400' : 'bg-red-50 text-red-600' 
                               : 'bg-green-50 text-green-600'
                           }`}>
                              {notif.status}
                           </span>
                        </div>
                        <p className={`text-xs pl-6 pr-6 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{notif.message}</p>
                        <button
                          onClick={(e) => handleDeleteNotification(notif.id, e)}
                          className="absolute top-2.5 right-2 text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                    </div>
                  ))
                )}
              </div>
              <div className={`p-3 border-t mt-auto ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/owner/notifications');
                  }}
                  className={`w-full py-2 text-xs font-bold text-[#ff0b01] rounded-xl transition-colors cursor-pointer ${
                    isDarkMode ? 'bg-red-950/40 hover:bg-red-950/60' : 'bg-red-50 hover:bg-red-100'
                  }`}
                >
                  View All
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* User Identity Profile Block */}
        {isSeoAdmin ? (
          <button
            type="button"
            onClick={() => setShowSeoProfileModal(true)}
            className="flex items-center space-x-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full cursor-pointer transition-all border shrink-0 bg-zinc-800/90 border-zinc-700 hover:border-[#FF2A14]/60 hover:bg-zinc-800 shadow-xs group"
            title="SEO Admin Profile Settings"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-red-500/20 group-hover:scale-105 transition-transform">
              {(seoAdminUser?.name ? seoAdminUser.name.charAt(0).toUpperCase() : (ownerUser?.name ? ownerUser.name.charAt(0).toUpperCase() : 'S'))}
            </div>
            <div className="hidden sm:flex flex-col text-left min-w-0 pr-1">
              <span className="text-xs font-black text-white leading-tight truncate max-w-[120px]">
                {seoAdminUser?.name || ownerUser?.name || 'SEO Admin'}
              </span>
              <span className="text-[10px] font-bold text-amber-400 leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                SEO Content Admin
              </span>
            </div>
          </button>
        ) : isAdmin ? (
          <div className="flex items-center space-x-2 sm:space-x-3.5 pl-1 sm:pl-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-red-500/20 shrink-0">
              A
            </div>
            <div className="hidden sm:flex flex-col">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                Admin Portal
              </span>
              <span className={`text-[10px] font-black uppercase text-red-500`}>
                System Administrator
              </span>
            </div>
          </div>
        ) : isSupport ? (
          <div className="flex items-center space-x-2 sm:space-x-3.5 pl-1 sm:pl-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-md ring-2 ring-blue-500/20 shrink-0">
              S
            </div>
            <div className="hidden sm:flex flex-col">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                {ownerUser?.name || 'Support Staff'}
              </span>
              <span className={`text-[10px] font-black uppercase text-blue-500`}>
                Support Engineer
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-3.5 pl-1 sm:pl-2">
            {/* User Profile Avatar */}
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 shrink-0">
              {salonProfile.imageUrl ? (
                <img
                  src={salonProfile.imageUrl}
                  alt={salonProfile.salonName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <img
                  src={profileIcon}
                  alt="Default Profile"
                  className="h-full w-full rounded-full object-cover"
                />
              )}
            </div>

            {/* Salon Name */}
            <div className="hidden sm:flex flex-col">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                {salonProfile.salonName || "NeoParlour"}
              </span>

              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                Salon Owner
              </span>
            </div>
          </div>
        )}

      </div>

      {/* SEO Admin Profile Modal */}
      {isSeoAdmin && (
        <SeoAdminProfileModal
          isOpen={showSeoProfileModal}
          onClose={() => setShowSeoProfileModal(false)}
          onProfileUpdated={(updated) => setSeoAdminUser(updated)}
        />
      )}

      {/* Mobile Search Overlay Bar */}
      {!isSeoAdmin && isMobileSearchOpen && (
        <div 
          ref={mobileSearchRef}
          className={`sm:hidden absolute inset-0 z-50 px-3 flex items-center gap-2 transition-all ${
            isDarkMode ? 'bg-zinc-900 border-b border-zinc-800 text-zinc-100' : 'bg-white border-b border-gray-200 text-gray-900'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false);
              setShowDropdown(false);
            }}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <form 
            onSubmit={handleManualSearch}
            className={`flex-1 flex items-center px-3.5 py-1.5 rounded-full border transition-all ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          >
            <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim().length > 0) {
                  setShowDropdown(true);
                } else {
                  setShowDropdown(false);
                }
              }}
              onFocus={() => {
                if (query.trim().length > 0) {
                  setShowDropdown(true);
                }
              }}
              className={`w-full bg-transparent text-xs focus:outline-none ${
                isDarkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-gray-800 placeholder-gray-400'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setShowDropdown(false);
                }}
                className={`p-1 text-xs font-bold ${
                  isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                ✕
              </button>
            )}
          </form>

          {/* Search Dropdown for Mobile Overlay */}
          {showDropdown && query.trim().length > 0 && (
            <div className={`fixed top-16 left-2 right-2 rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-80px)] overflow-y-auto p-4 space-y-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              {renderSearchResults()}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
