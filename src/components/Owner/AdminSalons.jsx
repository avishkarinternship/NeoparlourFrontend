import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  Award
} from 'lucide-react';
import BanSalonModal from './Modals/BanSalonModal';
import adminSalonService from '../../services/adminSalonService';

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

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search Parameters
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

  // Expanded Row IDs
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
    fetchSalons(currentPage, pageSize);
  }, [currentPage, pageSize]);

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

  // Generate visible page numbers (up to 5 at a time)
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

  return (
    <main className={`flex-1 p-6 md:p-8 transition-colors duration-300 overflow-y-auto max-w-7xl mx-auto w-full font-sans ${
      isDarkMode ? 'bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-gray-900'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Administration Portal
          </span>
          <h1 className={`text-2xl font-black tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Salons Management</h1>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Search, monitor, and regulate salon registrations and KYC verifications system-wide.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showFilters 
                ? isDarkMode ? 'bg-red-950/60 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-200'
                : isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button 
            onClick={() => fetchSalons(currentPage)}
            disabled={loading}
            className={`p-2.5 rounded-xl border shadow-xs transition disabled:opacity-50 cursor-pointer ${
              isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800' : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border-gray-200'
            }`}
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <form onSubmit={handleSearchSubmit} className={`mb-6 p-5 rounded-2xl border shadow-sm space-y-4 ${
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
              <label className={`block text-[10px] font-black uppercase mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Email</label>
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
                placeholder="e.g. Andheri"
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
                Search
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

      {/* Salons Table */}
      <div className={`border rounded-2xl shadow-sm overflow-hidden mb-6 ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}>
                <th className="py-4 px-6">Salon Details</th>
                <th className="py-4 px-6">Contact / Location</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">KYC Docs</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-zinc-800/60 text-zinc-300' : 'divide-gray-100 text-gray-700'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className={`py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                    <span className="font-bold">Fetching salons records...</span>
                  </td>
                </tr>
              ) : salons.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                    <Building2 className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                    <p className={`font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>No salons found matching current filters.</p>
                  </td>
                </tr>
              ) : (
                salons.map((salon) => {
                  const isExpanded = expandedSalonId === salon.salonId;
                  return (
                    <React.Fragment key={salon.salonId}>
                      <tr className={`transition-colors ${
                        isExpanded 
                          ? (isDarkMode ? 'bg-zinc-800/40' : 'bg-[#FAFAFA]/50') 
                          : (isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-[#FAFAFA]/70')
                      }`}>
                        {/* Details */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            {salon.imageUrl ? (
                              <img src={salon.imageUrl} alt={salon.salonName} className={`w-10 h-10 rounded-xl object-cover border shadow-xs ${
                                isDarkMode ? 'border-zinc-800' : 'border-gray-100'
                              }`} />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-red-500 ${
                                isDarkMode ? 'bg-red-950/40 border-red-900/50' : 'bg-red-50 border-red-100'
                              }`}>
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h3 className={`font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{salon.salonName}</h3>
                              <p className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Code: {salon.salonCode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4.5 px-6">
                          <div className="space-y-0.5">
                            <p className={`font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                              <Phone className="w-3.5 h-3.5 text-gray-400" /> {salon.phone || 'N/A'}
                            </p>
                            <p className={`text-[10px] flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {salon.areaName || 'N/A'}, {salon.cityName || 'N/A'}
                            </p>
                          </div>
                        </td>

                        {/* Status badges */}
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col gap-1.5 items-start">
                            {salon.banned ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isDarkMode ? 'bg-red-950/60 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                <Lock className="w-2.5 h-2.5 mr-1" /> Banned
                              </span>
                            ) : salon.active ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900' : 'bg-green-50 text-green-600 border-green-100'
                              }`}>
                                <Unlock className="w-2.5 h-2.5 mr-1" /> Active
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isDarkMode ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-gray-50 text-gray-500 border-gray-200'
                              }`}>
                                Draft / Pending
                              </span>
                            )}
                          </div>
                        </td>

                        {/* KYC State */}
                        <td className="py-4.5 px-6 text-center">
                          <button
                            onClick={() => handleRowExpandToggle(salon.salonId)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-lg font-bold text-[10px] transition cursor-pointer ${
                              isDarkMode 
                                ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200' 
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span>View KYC</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {salon.banned ? (
                              <button
                                onClick={() => handleUnbanSalon(salon.salonId || salon.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Unlock className="w-3 h-3" /> Unban Access
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenBanModal(salon)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all border flex items-center gap-1 cursor-pointer ${
                                  isDarkMode 
                                    ? 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border-red-900' 
                                    : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                                }`}
                              >
                                <Lock className="w-3 h-3" /> Ban Salon
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Panel */}
                      {isExpanded && (
                        <tr className={isDarkMode ? 'bg-zinc-950/50' : 'bg-gray-50/50'}>
                          <td colSpan="5" className={`p-6 border-b ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Metadata section */}
                              <div className={`border rounded-xl p-4.5 shadow-2xs space-y-3.5 ${
                                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
                              }`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> General Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <p className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Email Address</p>
                                    <p className={`font-bold break-all ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{salon.email || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Registration Date</p>
                                    <p className={`font-bold flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                      {salon.createdAt ? new Date(salon.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Business Address</p>
                                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{salon.address || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Coordinates</p>
                                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                      Lat: {salon.latitude?.toFixed(5) || 'N/A'}, Lon: {salon.longitude?.toFixed(5) || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Operating Hours</p>
                                    <p className={`font-bold flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                                      {salon.openingTime ? `${salon.openingTime} - ${salon.closingTime}` : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Weekly Off</p>
                                    <p className={`font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                                      isDarkMode ? 'text-red-400 bg-red-950/50' : 'text-red-600 bg-red-50/50'
                                    }`}>
                                      {salon.weeklyOffDay || 'None'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* KYC Records Section */}
                              <div className={`border rounded-xl p-4.5 shadow-2xs ${
                                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
                              }`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                  <Award className="w-3.5 h-3.5 text-gray-400" /> Owner KYC Verification
                                </h4>
                                {loadingKycId === salon.salonId ? (
                                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                    <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
                                    <span className="font-semibold text-xs">Loading documents...</span>
                                  </div>
                                ) : expandedKycData?.noKyc ? (
                                  <div className="text-center py-8 text-gray-400">
                                    <FileText className={`w-8 h-8 mx-auto mb-1.5 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                                    <p className={`font-bold text-xs ${isDarkMode ? 'text-zinc-300' : 'text-gray-500'}`}>No KYC Documents Uploaded</p>
                                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Owner has not submitted their identity verification yet.</p>
                                  </div>
                                ) : expandedKycData ? (
                                  <div className="space-y-4">
                                    {/* Owner Metadata */}
                                    <div className={`p-3 rounded-xl text-xs space-y-1.5 ${
                                      isDarkMode ? 'bg-zinc-800/60 text-zinc-300' : 'bg-gray-50 text-gray-800'
                                    }`}>
                                      <p className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        <User className="w-3.5 h-3.5 text-gray-400" /> Owner: {expandedKycData.ownerName}
                                      </p>
                                      <div className={`grid grid-cols-2 gap-2 text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {expandedKycData.ownerMobile}</span>
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {expandedKycData.ownerEmail}</span>
                                      </div>
                                    </div>

                                    {/* Files list */}
                                    <div className="space-y-2">
                                      <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Uploaded Documents</p>
                                      {expandedKycData.kycDocuments && expandedKycData.kycDocuments.length > 0 ? (
                                        expandedKycData.kycDocuments.map((doc) => (
                                          <div key={doc.id} className={`flex items-center justify-between p-3 border rounded-xl transition ${
                                            isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/40' : 'border-gray-100 hover:bg-gray-50/50'
                                          }`}>
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-950/50 text-red-400' : 'bg-red-50 text-red-500'}`}>
                                                <FileText className="w-4 h-4" />
                                              </div>
                                              <div className="min-w-0">
                                                <p className={`font-bold text-[11px] truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{doc.fileName}</p>
                                                <p className={`text-[9px] uppercase mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{doc.documentType} ({doc.contentType.split('/')[1]})</p>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => handleDownloadKyc(doc.id, doc.fileName)}
                                              className={`p-2 rounded-lg transition cursor-pointer ${
                                                isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                              }`}
                                              title="Download document file"
                                            >
                                              <Download className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-gray-400 italic">No document file lists associated with KYC metadata.</p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-400">
                                    <p className="text-xs">Select "View KYC" to load details.</p>
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

        {/* Pagination footer */}
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
              {/* First */}
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
              {/* Prev */}
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
              {/* Page Numbers */}
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
              {/* Next */}
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
              {/* Last */}
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

      {/* Ban Salon Modal */}
      <BanSalonModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        salon={selectedSalonForBan}
        onSuccess={() => fetchSalons(currentPage)}
      />
    </main>
  );
}
