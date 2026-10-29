import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Search,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Award,
  ShieldCheck,
  ExternalLink,
  X,
  Eye,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Image as ImageIcon,
  Star,
  Percent,
  Store
} from 'lucide-react';
import BanSalonModal from './Modals/BanSalonModal';
import adminSalonService from '../../services/adminSalonService';
import AdminKycDashboard from './AdminKycDashboard';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600'
  }
};

export default function AdminSalons() {
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode !== undefined 
    ? outletContext.isDarkMode 
    : document.documentElement.classList.contains('dark');

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') === 'kyc' ? 'kyc' : 'salons';

  const setTab = (tab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'salons') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search Parameters from Filters
  const [filters, setFilters] = useState({
    salonName: '',
    contact: '',
    email: '',
    cityName: '',
    areaName: '',
    active: '',
    banned: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Ban Modal State
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedSalonForBan, setSelectedSalonForBan] = useState(null);

  // View Full Details Modal State
  const [selectedSalonForDetails, setSelectedSalonForDetails] = useState(null);

  // Expanded Row IDs for inline KYC view
  const [expandedSalonId, setExpandedSalonId] = useState(null);
  const [expandedKycData, setExpandedKycData] = useState(null);
  const [loadingKycId, setLoadingKycId] = useState(null);

  const fetchSalons = async (page = 0, size = pageSize) => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
      };

      // Only append filters that have values
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          params[key] = filters[key];
        }
      });

      const response = await axiosInstance.get('/salons/admin/all', { params });
      if (response.data) {
        setSalons(response.data.content || []);
        const pageInfo = response.data.page || {};
        setTotalPages(pageInfo.totalPages ?? response.data.totalPages ?? 0);
        setTotalElements(pageInfo.totalElements ?? response.data.totalElements ?? 0);
        setCurrentPage(pageInfo.number ?? response.data.number ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch salons:", err);
      toast.error("Failed to load salons list", toastStyle);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever currentPage or pageSize changes
  useEffect(() => {
    if (currentTab === 'salons') {
      fetchSalons(currentPage, pageSize);
    }
  }, [currentPage, pageSize, currentTab]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchSalons(0, pageSize);
  };

  const handleResetFilters = () => {
    setFilters({
      salonName: '',
      contact: '',
      email: '',
      cityName: '',
      areaName: '',
      active: '',
      banned: ''
    });
    setCurrentPage(0);
    setTimeout(() => fetchSalons(0, pageSize), 0);
  };

  // Generate visible page numbers
  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(0, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const startEntry = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endEntry = Math.min((currentPage + 1) * pageSize, totalElements);

  const handleOpenBanModal = (salon) => {
    setSelectedSalonForBan({
      id: salon.salonId || salon.id,
      name: salon.salonName || salon.name || `Salon #${salon.salonId || salon.id}`
    });
    setBanModalOpen(true);
  };

  const handleUnbanSalon = async (salonId) => {
    try {
      await adminSalonService.unbanSalon(salonId);
      toast.success('Salon unbanned successfully!', toastStyle);
      fetchSalons(currentPage);
      if (expandedSalonId === salonId) {
        fetchKycDetails(salonId);
      }
      if (selectedSalonForDetails && (selectedSalonForDetails.salonId === salonId || selectedSalonForDetails.id === salonId)) {
        setSelectedSalonForDetails(prev => ({ ...prev, banned: false }));
      }
    } catch (err) {
      console.error('Failed to unban salon:', err);
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to unban salon', toastStyle);
    }
  };

  const fetchKycDetails = async (salonId) => {
    setLoadingKycId(salonId);
    setExpandedKycData(null);
    try {
      const response = await axiosInstance.get('/auth/kyc-documents', {
        params: { salonId }
      });
      if (response.data && response.data.content && response.data.content.length > 0) {
        setExpandedKycData(response.data.content[0]);
      } else {
        setExpandedKycData({ noKyc: true });
      }
    } catch (err) {
      console.error("Failed to fetch KYC documents:", err);
      toast.error("Failed to fetch KYC records", toastStyle);
    } finally {
      setLoadingKycId(null);
    }
  };

  const handleRowExpandToggle = (salonId) => {
    if (expandedSalonId === salonId) {
      setExpandedSalonId(null);
      setExpandedKycData(null);
    } else {
      setExpandedSalonId(salonId);
      fetchKycDetails(salonId);
    }
  };

  const handleDownloadKyc = async (documentId, fileName) => {
    try {
      const response = await axiosInstance.get(`/auth/kyc-documents/${documentId}/file`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download KYC document:", err);
      toast.error("Failed to download file", toastStyle);
    }
  };

  // Close details modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedSalonForDetails(null);
      }
    };
    if (selectedSalonForDetails) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSalonForDetails]);

  // Open Full Details modal and pre-fetch KYC + enriched details
  const handleOpenDetailsModal = async (salon) => {
    if (!salon) return;
    const salonId = salon.salonId || salon.id;
    setSelectedSalonForDetails(salon);
    if (salonId) {
      fetchKycDetails(salonId);
      try {
        const res = await adminSalonService.getSalonById(salonId);
        if (res?.data) {
          setSelectedSalonForDetails(prev => (prev ? { ...prev, ...res.data } : res.data));
        }
      } catch (err) {
        console.warn("Could not fetch enriched salon details:", err);
      }
    }
  };

  return (
    <main className={`flex-1 p-4 sm:p-6 md:p-8 transition-colors duration-300 overflow-y-auto max-w-7xl mx-auto w-full font-sans ${
      isDarkMode ? 'bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-gray-900'
    }`}>
      
      {/* Top Header & Integrated Combined Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Administration Portal
          </span>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Salons & KYC Management
          </h1>
          <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
            Full salon directory with contact, location, timings & compliance KYC verification queue in one place.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full md:w-auto">
          <button
            onClick={() => setTab('salons')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              currentTab === 'salons'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-red-600" />
            <span>Salons Directory</span>
            {totalElements > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                {totalElements}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('kyc')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              currentTab === 'kyc'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#FF2A14]" />
            <span>KYC Verification Queue</span>
          </button>
        </div>
      </div>

      {/* KYC TAB VIEW */}
      {currentTab === 'kyc' ? (
        <div className="animate-in fade-in duration-200">
          <AdminKycDashboard isDarkMode={isDarkMode} onSelectSalon={handleOpenDetailsModal} />
        </div>
      ) : (
        /* SALONS DIRECTORY TAB VIEW */
        <div className="animate-in fade-in duration-200 space-y-6">
          {/* Action Bar & Quick Filter Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  showFilters 
                    ? isDarkMode ? 'bg-red-950/60 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-200'
                    : isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{showFilters ? 'Hide Filters' : 'Filter Salons'}</span>
                {Object.values(filters).some(v => v !== '') && (
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                )}
              </button>

              <button 
                onClick={() => fetchSalons(currentPage)}
                disabled={loading}
                className={`p-2.5 rounded-xl border shadow-xs transition disabled:opacity-50 cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800' : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border-gray-200'
                }`}
                title="Refresh list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Showing <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{startEntry} – {endEntry}</strong> of <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{totalElements}</strong> salons
            </div>
          </div>

          {/* Filter Panel (Contains all queryable criteria) */}
          {showFilters && (
            <form onSubmit={handleSearchSubmit} className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Salon Name</label>
                  <input
                    type="text"
                    name="salonName"
                    value={filters.salonName}
                    onChange={handleFilterChange}
                    placeholder="e.g. Grace & Glam"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800 placeholder-zinc-500' : 'bg-[#FAFAFA] border-gray-100 text-gray-800 focus:bg-white placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Contact Phone</label>
                  <input
                    type="text"
                    name="contact"
                    value={filters.contact}
                    onChange={handleFilterChange}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800 placeholder-zinc-500' : 'bg-[#FAFAFA] border-gray-100 text-gray-800 focus:bg-white placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Email Address</label>
                  <input
                    type="text"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    placeholder="e.g. owner@salon.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800 placeholder-zinc-500' : 'bg-[#FAFAFA] border-gray-100 text-gray-800 focus:bg-white placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>City Name</label>
                  <input
                    type="text"
                    name="cityName"
                    value={filters.cityName}
                    onChange={handleFilterChange}
                    placeholder="e.g. Mumbai"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800 placeholder-zinc-500' : 'bg-[#FAFAFA] border-gray-100 text-gray-800 focus:bg-white placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Area Name</label>
                  <input
                    type="text"
                    name="areaName"
                    value={filters.areaName}
                    onChange={handleFilterChange}
                    placeholder="e.g. Andheri West"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800 placeholder-zinc-500' : 'bg-[#FAFAFA] border-gray-100 text-gray-800 focus:bg-white placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Active Status</label>
                  <select
                    name="active"
                    value={filters.active}
                    onChange={handleFilterChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200 focus:bg-zinc-800' : 'bg-[#FAFAFA] border-gray-100 text-gray-600 focus:bg-white'
                    }`}
                  >
                    <option value="">All statuses</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Ban Status</label>
                  <select
                    name="banned"
                    value={filters.banned}
                    onChange={handleFilterChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-red-500 transition-all border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200 focus:bg-zinc-800' : 'bg-[#FAFAFA] border-gray-100 text-gray-600 focus:bg-white'
                    }`}
                  >
                    <option value="">All</option>
                    <option value="true">Banned Only</option>
                    <option value="false">Unbanned Only</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={`text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer ${
                      isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Salons Table (Every row displaying all filter attributes: Name, Contact, Email, City, Area, Address, Schedule, Active, Ban, KYC) */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'
          }`}>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isDarkMode ? 'bg-zinc-900/70 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}>
                    <th className="py-4 px-5">Salon & Identity</th>
                    <th className="py-4 px-5">Contact Details (Phone / Email)</th>
                    <th className="py-4 px-5">Location (Area, City & Address)</th>
                    <th className="py-4 px-5">Operating Schedule</th>
                    <th className="py-4 px-5 text-center">Account & Ban Status</th>
                    <th className="py-4 px-5 text-center">KYC Docs</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-zinc-800/60 text-zinc-300' : 'divide-gray-100 text-gray-700'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className={`py-14 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                        <span className="font-bold">Fetching salons records...</span>
                      </td>
                    </tr>
                  ) : salons.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={`py-14 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <Building2 className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                        <p className={`font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>No salons found matching current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    salons.map((salon) => {
                      const salonId = salon.salonId || salon.id;
                      const isExpanded = expandedSalonId === salonId;
                      return (
                        <React.Fragment key={salonId}>
                          <tr className={`transition-colors ${
                            isExpanded 
                              ? (isDarkMode ? 'bg-zinc-800/40' : 'bg-[#FAFAFA]/50') 
                              : (isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-[#FAFAFA]/70')
                          }`}>
                            
                            {/* 1. Salon Details & Identity */}
                            <td className="py-4.5 px-5">
                              <div 
                                onClick={() => handleOpenDetailsModal(salon)}
                                className="flex items-start gap-3 p-1.5 -m-1.5 rounded-2xl cursor-pointer hover:bg-red-500/10 dark:hover:bg-red-500/15 transition-all group"
                                title={`Click to view full details of ${salon.salonName || 'salon'}`}
                              >
                                {salon.imageUrl ? (
                                  <img 
                                    src={salon.imageUrl} 
                                    alt={salon.salonName} 
                                    className={`w-11 h-11 rounded-xl object-cover border shadow-xs shrink-0 group-hover:scale-105 transition-transform ${
                                      isDarkMode ? 'border-zinc-800' : 'border-gray-100'
                                    }`} 
                                  />
                                ) : (
                                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-red-500 shrink-0 group-hover:scale-105 transition-transform ${
                                    isDarkMode ? 'bg-red-950/40 border-red-900/50' : 'bg-red-50 border-red-100'
                                  }`}>
                                    <Building2 className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <div
                                    className={`font-black text-left group-hover:text-red-600 transition flex items-center gap-1.5 ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}
                                  >
                                    <span>{salon.salonName}</span>
                                    <Eye className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-500 transition-colors" />
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                      {salon.salonCode || `ID #${salonId}`}
                                    </span>
                                    {salon.createdAt && (
                                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(salon.createdAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Contact Details (Phone & Email from filters) */}
                            <td className="py-4.5 px-5">
                              <div className="space-y-1">
                                <a 
                                  href={`tel:${salon.phone || ''}`}
                                  className={`font-semibold flex items-center gap-1.5 hover:text-red-600 transition ${
                                    isDarkMode ? 'text-zinc-200' : 'text-gray-800'
                                  }`}
                                >
                                  <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                  <span>{salon.phone || 'N/A'}</span>
                                </a>
                                <a 
                                  href={`mailto:${salon.email || ''}`}
                                  className={`text-[11px] font-medium flex items-center gap-1.5 hover:text-red-600 transition truncate max-w-[190px] ${
                                    isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                                  }`}
                                  title={salon.email || 'N/A'}
                                >
                                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span className="truncate">{salon.email || 'N/A'}</span>
                                </a>
                              </div>
                            </td>

                            {/* 3. Location (Area, City & Address from filters) */}
                            <td className="py-4.5 px-5">
                              <div className="space-y-1">
                                <div className={`font-bold flex items-center gap-1.5 ${
                                  isDarkMode ? 'text-zinc-200' : 'text-gray-800'
                                }`}>
                                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  <span>{salon.areaName || '—'}, {salon.cityName || '—'}</span>
                                </div>
                                <p 
                                  className={`text-[10px] font-medium truncate max-w-[220px] ${
                                    isDarkMode ? 'text-zinc-400' : 'text-gray-500'
                                  }`}
                                  title={salon.address || 'N/A'}
                                >
                                  {salon.address || 'Street address not provided'}
                                </p>
                                {salon.latitude && salon.longitude && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${salon.latitude},${salon.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-mono text-zinc-400 hover:text-red-500 flex items-center gap-1"
                                  >
                                    <span>Lat: {salon.latitude.toFixed(4)}, Lon: {salon.longitude.toFixed(4)}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* 4. Operating Schedule & Hours */}
                            <td className="py-4.5 px-5">
                              <div className="space-y-1">
                                <div className={`font-semibold flex items-center gap-1.5 text-[11px] ${
                                  isDarkMode ? 'text-zinc-200' : 'text-gray-800'
                                }`}>
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>
                                    {salon.openingTime && salon.closingTime
                                      ? `${salon.openingTime} – ${salon.closingTime}`
                                      : 'Hours not set'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                                  <span>Weekly Off:</span>
                                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                                    salon.weeklyOffDay 
                                      ? isDarkMode ? 'bg-red-950/60 text-red-400' : 'bg-red-50 text-red-600'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                  }`}>
                                    {salon.weeklyOffDay || 'None'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 5. Account & Ban Status (Active & Banned from filters) */}
                            <td className="py-4.5 px-5 text-center">
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                {/* Active Badge */}
                                {salon.active ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mr-1.5"></span>
                                    Inactive / Draft
                                  </span>
                                )}

                                {/* Ban Badge */}
                                {salon.banned ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                    <Lock className="w-2.5 h-2.5 mr-1" />
                                    Banned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                                    <Unlock className="w-2.5 h-2.5 mr-1" />
                                    Normal
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 6. KYC State & View */}
                            <td className="py-4.5 px-5 text-center">
                              <button
                                onClick={() => handleRowExpandToggle(salonId)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-bold text-[10px] transition cursor-pointer shadow-2xs ${
                                  isExpanded
                                    ? 'bg-red-600 text-white border-red-600'
                                    : isDarkMode 
                                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200' 
                                      : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                                }`}
                                title="Inspect KYC documents uploaded by salon"
                              >
                                <FileText className="w-3.5 h-3.5 text-red-500" />
                                <span>Inspect KYC</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </td>

                            {/* 7. Action Controls */}
                            <td className="py-4.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenDetailsModal(salon)}
                                  className={`p-2 rounded-xl border text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                    isDarkMode
                                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                                      : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700'
                                  }`}
                                  title="View complete salon information"
                                >
                                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                                  <span className="hidden sm:inline">Details</span>
                                </button>

                                {salon.banned ? (
                                  <button
                                    onClick={() => handleUnbanSalon(salonId)}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-[10px] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    title="Unban salon access"
                                  >
                                    <Unlock className="w-3 h-3" />
                                    <span>Unban</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenBanModal(salon)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all border flex items-center gap-1 cursor-pointer ${
                                      isDarkMode 
                                        ? 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border-red-900' 
                                        : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                                    }`}
                                    title="Ban salon account"
                                  >
                                    <Lock className="w-3 h-3" />
                                    <span>Ban</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Row Panel for Inline KYC Inspection */}
                          {isExpanded && (
                            <tr className={isDarkMode ? 'bg-zinc-950/60' : 'bg-gray-50/70'}>
                              <td colSpan="7" className={`p-6 border-b ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Full Detailed Attributes */}
                                  <div className={`border rounded-2xl p-5 shadow-2xs space-y-3.5 ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
                                  }`}>
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                      <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <Building2 className="w-4 h-4 text-red-600" /> Full Salon Specifications
                                      </h4>
                                      <button
                                        onClick={() => handleOpenDetailsModal(salon)}
                                        className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
                                      >
                                        <span>Open in Fullscreen Modal</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Salon Name & Code</p>
                                        <p className="font-bold">{salon.salonName} ({salon.salonCode || 'N/A'})</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Registered On</p>
                                        <p className="font-bold">{salon.createdAt ? new Date(salon.createdAt).toLocaleString() : 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Contact Number</p>
                                        <p className="font-bold">{salon.phone || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Email Address</p>
                                        <p className="font-bold break-all">{salon.email || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Area & City</p>
                                        <p className="font-bold">{salon.areaName || 'N/A'}, {salon.cityName || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Coordinates</p>
                                        <p className="font-bold font-mono">
                                          {salon.latitude?.toFixed(5) || 'N/A'}, {salon.longitude?.toFixed(5) || 'N/A'}
                                        </p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Complete Street Address</p>
                                        <p className="font-bold">{salon.address || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Daily Operating Hours</p>
                                        <p className="font-bold">{salon.openingTime && salon.closingTime ? `${salon.openingTime} - ${salon.closingTime}` : 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase text-zinc-400">Weekly Off Day</p>
                                        <p className="font-bold">{salon.weeklyOffDay || 'None'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* KYC Compliance Section */}
                                  <div className={`border rounded-2xl p-5 shadow-2xs ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
                                  }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      <Award className="w-4 h-4 text-[#FF2A14]" /> Owner KYC Records & Documents
                                    </h4>
                                    {loadingKycId === salonId ? (
                                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                        <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
                                        <span className="font-semibold text-xs">Loading KYC documents...</span>
                                      </div>
                                    ) : expandedKycData?.noKyc ? (
                                      <div className="text-center py-8 text-gray-400">
                                        <FileText className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                                        <p className={`font-bold text-xs ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>No KYC Documents Uploaded</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">This salon owner has not uploaded any identity verification files yet.</p>
                                      </div>
                                    ) : expandedKycData ? (
                                      <div className="space-y-4">
                                        {/* Owner Info Box */}
                                        <div className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                                          isDarkMode ? 'bg-zinc-800/60 text-zinc-300' : 'bg-slate-50 text-gray-800'
                                        }`}>
                                          <p className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <User className="w-3.5 h-3.5 text-red-500" /> Owner: {expandedKycData.ownerName}
                                          </p>
                                          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {expandedKycData.ownerMobile}</span>
                                            <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {expandedKycData.ownerEmail}</span>
                                          </div>
                                        </div>

                                        {/* Uploaded Documents List */}
                                        <div className="space-y-2">
                                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Uploaded Files</p>
                                          {expandedKycData.kycDocuments && expandedKycData.kycDocuments.length > 0 ? (
                                            expandedKycData.kycDocuments.map((doc) => (
                                              <div key={doc.id} className={`flex items-center justify-between p-3 border rounded-xl transition ${
                                                isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/40' : 'border-gray-100 hover:bg-gray-50'
                                              }`}>
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-950/50 text-red-400' : 'bg-red-50 text-red-500'}`}>
                                                    <FileText className="w-4 h-4" />
                                                  </div>
                                                  <div className="min-w-0">
                                                    <p className="font-bold text-[11px] truncate">{doc.fileName}</p>
                                                    <p className="text-[9px] uppercase text-zinc-400 mt-0.5">{doc.documentType} ({doc.contentType?.split('/')[1] || 'file'})</p>
                                                  </div>
                                                </div>
                                                <button
                                                  onClick={() => handleDownloadKyc(doc.id, doc.fileName)}
                                                  className={`p-2 rounded-lg transition cursor-pointer ${
                                                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                                  }`}
                                                  title="Download file"
                                                >
                                                  <Download className="w-4 h-4" />
                                                </button>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-xs text-gray-400 italic">No document file attachments found.</p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-6 text-gray-400">
                                        <p className="text-xs">Click Inspect KYC to load records.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {!loading && totalPages > 0 && (
              <div className={`border-t px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-500'
              }`}>
                {/* Counter & Size Selector */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold">
                    Showing{' '}
                    <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{startEntry}</strong>
                    {' – '}
                    <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{endEntry}</strong>
                    {' of '}
                    <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{totalElements}</strong>
                    {' entries'}
                  </span>
                  <span className={isDarkMode ? 'text-zinc-700' : 'text-gray-200'}>|</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Size:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className={`border rounded-lg px-2 py-1 text-xs font-bold outline-none focus:border-red-500 cursor-pointer ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className={`p-2 border rounded-xl disabled:opacity-40 transition cursor-pointer ${
                      isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className={`p-2 border rounded-xl disabled:opacity-40 transition cursor-pointer ${
                      isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                          : isDarkMode 
                            ? 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className={`p-2 border rounded-xl disabled:opacity-40 transition cursor-pointer ${
                      isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`p-2 border rounded-xl disabled:opacity-40 transition cursor-pointer ${
                      isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BAN SALON MODAL */}
      <BanSalonModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        salon={selectedSalonForBan}
        onSuccess={() => fetchSalons(currentPage)}
      />

      {/* COMPREHENSIVE SALON FULL DETAILS MODAL */}
      {selectedSalonForDetails && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSalonForDetails(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto custom-scrollbar transition-colors ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-zinc-100 dark:border-zinc-800 gap-4">
              <div className="flex items-center gap-4">
                {selectedSalonForDetails.imageUrl ? (
                  <img
                    src={selectedSalonForDetails.imageUrl}
                    alt={selectedSalonForDetails.salonName}
                    className="w-16 h-16 rounded-2xl object-cover border shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-[#FF2A14] flex items-center justify-center border border-red-200 dark:border-red-900/50">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                      {selectedSalonForDetails.salonName}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {selectedSalonForDetails.salonCode || `ID #${selectedSalonForDetails.salonId || selectedSalonForDetails.id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {selectedSalonForDetails.active ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        🟢 Active Account
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-500 border border-zinc-500/30">
                        ⚪ Inactive / Draft
                      </span>
                    )}

                    {selectedSalonForDetails.banned ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Banned Salon
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Normal Status
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedSalonForDetails(null)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Information Grid */}
            <div className="mt-6 space-y-6">
              
              {/* Banned Alert Banner (if salon is banned) */}
              {selectedSalonForDetails.banned && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-3">
                  <Lock className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Salon Account is Banned by Admin</p>
                    <p className="text-zinc-600 dark:text-zinc-300 font-medium">
                      Reason: <strong className="font-bold text-red-600 dark:text-red-400">{selectedSalonForDetails.banReason || 'Violation of Platform Terms'}</strong>
                    </p>
                    {selectedSalonForDetails.bannedAt && (
                      <p className="text-[10px] text-zinc-400">
                        Banned On: {new Date(selectedSalonForDetails.bannedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section 1: Contact & Physical Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Contact Channels
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold">Phone:</span>
                      <strong className="font-bold">{selectedSalonForDetails.phone || 'N/A'}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold">Email:</span>
                      <strong className="font-bold break-all">{selectedSalonForDetails.email || 'N/A'}</strong>
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Location & Geolocation
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold">Area & City:</span>
                      <strong className="font-bold">{selectedSalonForDetails.areaName || '—'}, {selectedSalonForDetails.cityName || '—'}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold">Coordinates:</span>
                      <strong className="font-bold font-mono">
                        {selectedSalonForDetails.latitude && selectedSalonForDetails.longitude
                          ? `${selectedSalonForDetails.latitude.toFixed(5)}, ${selectedSalonForDetails.longitude.toFixed(5)}`
                          : 'Not set'}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Address Card with Maps Link */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Street Address</span>
                  {selectedSalonForDetails.latitude && selectedSalonForDetails.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedSalonForDetails.latitude},${selectedSalonForDetails.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs font-medium leading-relaxed">
                  {selectedSalonForDetails.address || 'No full street address specified.'}
                </p>
                {selectedSalonForDetails.landmark && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    <span className="font-semibold text-zinc-400">Landmark:</span> {selectedSalonForDetails.landmark}
                  </p>
                )}
              </div>

              {/* Business, Tax & Charges Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block">GSTIN</span>
                  <p className="text-xs font-bold font-mono mt-1 truncate" title={selectedSalonForDetails.gstin || 'Unregistered'}>
                    {selectedSalonForDetails.gstin || 'Unregistered'}
                  </p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                    selectedSalonForDetails.includeGstInInvoice 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {selectedSalonForDetails.includeGstInInvoice ? 'GST in Invoice' : 'No Invoice GST'}
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block">State / Region</span>
                  <p className="text-xs font-bold mt-1 truncate" title={selectedSalonForDetails.stateName || (selectedSalonForDetails.state && typeof selectedSalonForDetails.state === 'string' ? selectedSalonForDetails.state : 'N/A')}>
                    {selectedSalonForDetails.stateName || (selectedSalonForDetails.state && typeof selectedSalonForDetails.state === 'string' ? selectedSalonForDetails.state : 'N/A')}
                  </p>
                  {selectedSalonForDetails.stateCode && (
                    <span className="text-[9px] font-mono font-bold text-zinc-400">Code: {selectedSalonForDetails.stateCode}</span>
                  )}
                </div>

                <div className={`p-3.5 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block">Customer Rating</span>
                  <p className="text-xs font-bold mt-1 flex items-center justify-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{selectedSalonForDetails.rating ? Number(selectedSalonForDetails.rating).toFixed(1) : '5.0'} / 5.0</span>
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block">Home Service Fee</span>
                  <p className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                    {selectedSalonForDetails.homeServiceCharges ? `₹${selectedSalonForDetails.homeServiceCharges}` : 'Free / N/A'}
                  </p>
                </div>
              </div>

              {/* Media & QR Code (if available) */}
              {(selectedSalonForDetails.qrCodeUrl || (Array.isArray(selectedSalonForDetails.salonImages) && selectedSalonForDetails.salonImages.length > 0)) && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Media & QR Code
                  </h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    {selectedSalonForDetails.qrCodeUrl && (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border">
                        <img 
                          src={selectedSalonForDetails.qrCodeUrl} 
                          alt="Salon QR" 
                          className="w-14 h-14 rounded-lg object-contain" 
                        />
                        <div className="text-[10px]">
                          <p className="font-bold">Salon QR Code</p>
                          <a 
                            href={selectedSalonForDetails.qrCodeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-red-500 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>Open QR</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                    {Array.isArray(selectedSalonForDetails.salonImages) && selectedSalonForDetails.salonImages.map((imgUrl, idx) => (
                      <a 
                        key={idx} 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group relative"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Salon Photo ${idx + 1}`} 
                          className="w-14 h-14 rounded-xl object-cover border group-hover:opacity-80 transition" 
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Operating Timings & Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Working Hours</span>
                  <p className="text-xs font-bold mt-1">
                    {selectedSalonForDetails.openingTime && selectedSalonForDetails.closingTime
                      ? `${selectedSalonForDetails.openingTime} - ${selectedSalonForDetails.closingTime}`
                      : 'Not configured'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <Calendar className="w-5 h-5 mx-auto text-red-500 mb-1" />
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Weekly Off</span>
                  <p className="text-xs font-bold mt-1">
                    {selectedSalonForDetails.weeklyOffDay || 'None (Open 7 Days)'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border text-center ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <Award className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Registration Date</span>
                  <p className="text-xs font-bold mt-1">
                    {selectedSalonForDetails.createdAt
                      ? new Date(selectedSalonForDetails.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Section 3: Owner KYC Records */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <h4 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Compliance & KYC Documents
                </h4>

                {loadingKycId ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-zinc-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                    <span className="text-xs font-bold">Checking KYC records...</span>
                  </div>
                ) : expandedKycData?.noKyc ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-400">
                    No KYC compliance documents uploaded yet.
                  </div>
                ) : expandedKycData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs p-3 rounded-xl bg-white dark:bg-zinc-800/80 border">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">Owner Name</span>
                        <strong className="font-bold">{expandedKycData.ownerName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">Owner Phone</span>
                        <strong className="font-bold">{expandedKycData.ownerMobile}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">Owner Email</span>
                        <strong className="font-bold break-all">{expandedKycData.ownerEmail}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Uploaded Document Files:</span>
                      {expandedKycData.kycDocuments?.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-zinc-800/80">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="text-xs font-bold">{doc.fileName}</p>
                              <p className="text-[9px] uppercase text-zinc-400">{doc.documentType} ({doc.contentType?.split('/')[1]})</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadKyc(doc.id, doc.fileName)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                            title="Download document file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400">Loading details...</div>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {selectedSalonForDetails.banned ? (
                  <button
                    onClick={() => {
                      handleUnbanSalon(selectedSalonForDetails.salonId || selectedSalonForDetails.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unban Salon Access</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedSalonForDetails(null);
                      handleOpenBanModal(selectedSalonForDetails);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Ban Salon Access</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedSalonForDetails(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </main>
  );
}
