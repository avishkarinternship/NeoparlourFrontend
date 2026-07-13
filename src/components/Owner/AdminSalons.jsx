import React, { useState, useEffect } from 'react';
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
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600'
  }
};

export default function AdminSalons() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

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

  // Expanded Row IDs
  const [expandedSalonId, setExpandedSalonId] = useState(null);
  const [expandedKycData, setExpandedKycData] = useState(null);
  const [loadingKycId, setLoadingKycId] = useState(null);

  const fetchSalons = async (page = 0) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
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
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setCurrentPage(response.data.number || 0);
      }
    } catch (err) {
      console.error("Failed to fetch salons:", err);
      toast.error("Failed to load salons list", toastStyle);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons(0);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSalons(0);
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
    // Triggers fetch immediately on next tick after setting state
    setTimeout(() => fetchSalons(0), 0);
  };

  const toggleBanSalon = async (salonId, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    try {
      const response = await axiosInstance.put(`/v1/maintenance/salon/${salonId}/${action}`);
      toast.success(response.data || `Salon ${action}ned successfully!`, toastStyle);
      fetchSalons(currentPage);
      // Refresh KYC panel details if expanded
      if (expandedSalonId === salonId) {
        fetchKycDetails(salonId);
      }
    } catch (err) {
      console.error(`Failed to ${action} salon:`, err);
      toast.error(err.response?.data || `Failed to ${action} salon`, toastStyle);
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
    <main className="flex-1 p-6 md:p-8 bg-[#FAFAFA] overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Administration Portal
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Salons Management</h1>
          <p className="text-xs text-gray-500 mt-1">Search, monitor, and regulate salon registrations and KYC verifications system-wide.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs
              ${showFilters 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button 
            onClick={() => fetchSalons(currentPage)}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl shadow-xs transition disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <form onSubmit={handleSearchSubmit} className="mb-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Salon Name</label>
              <input
                type="text"
                name="salonName"
                value={filters.salonName}
                onChange={handleFilterChange}
                placeholder="e.g. Grace & Glam"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                name="contact"
                value={filters.contact}
                onChange={handleFilterChange}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email</label>
              <input
                type="text"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                placeholder="e.g. owner@salon.com"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">City Name</label>
              <input
                type="text"
                name="cityName"
                value={filters.cityName}
                onChange={handleFilterChange}
                placeholder="e.g. Mumbai"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Area Name</label>
              <input
                type="text"
                name="areaName"
                value={filters.areaName}
                onChange={handleFilterChange}
                placeholder="e.g. Andheri"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Active Status</label>
              <select
                name="active"
                value={filters.active}
                onChange={handleFilterChange}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              >
                <option value="">All statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Ban Status</label>
              <select
                name="banned"
                value={filters.banned}
                onChange={handleFilterChange}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              >
                <option value="">All</option>
                <option value="true">Banned Only</option>
                <option value="false">Unbanned Only</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Salons Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Salon Details</th>
                <th className="py-4 px-6">Contact / Location</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">KYC Docs</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                    <span className="font-bold">Fetching salons records...</span>
                  </td>
                </tr>
              ) : salons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                    <p className="font-bold text-gray-500">No salons found matching current filters.</p>
                  </td>
                </tr>
              ) : (
                salons.map((salon) => {
                  const isExpanded = expandedSalonId === salon.salonId;
                  return (
                    <React.Fragment key={salon.salonId}>
                      <tr className={`hover:bg-[#FAFAFA]/70 transition-colors ${isExpanded ? 'bg-[#FAFAFA]/50' : ''}`}>
                        {/* Details */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            {salon.imageUrl ? (
                              <img src={salon.imageUrl} alt={salon.salonName} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-xs" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900 leading-snug">{salon.salonName}</h3>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Code: {salon.salonCode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4.5 px-6">
                          <div className="space-y-0.5">
                            <p className="font-medium flex items-center gap-1.5 text-gray-800">
                              <Phone className="w-3.5 h-3.5 text-gray-400" /> {salon.phone || 'N/A'}
                            </p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {salon.areaName || 'N/A'}, {salon.cityName || 'N/A'}
                            </p>
                          </div>
                        </td>

                        {/* Status badges */}
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col gap-1.5 items-start">
                            {salon.banned ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                                <Lock className="w-2.5 h-2.5 mr-1" /> Banned
                              </span>
                            ) : salon.active ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                                <Unlock className="w-2.5 h-2.5 mr-1" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200">
                                Draft / Pending
                              </span>
                            )}
                          </div>
                        </td>

                        {/* KYC State */}
                        <td className="py-4.5 px-6 text-center">
                          <button
                            onClick={() => handleRowExpandToggle(salon.salonId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg font-bold text-[10px] transition"
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
                                onClick={() => toggleBanSalon(salon.salonId, true)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] transition-all shadow-xs flex items-center gap-1"
                              >
                                <Unlock className="w-3 h-3" /> Unban Access
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleBanSalon(salon.salonId, false)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-[10px] transition-all border border-red-100 flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" /> Ban Salon
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Panel */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan="5" className="p-6 border-b border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Metadata section */}
                              <div className="bg-white border border-gray-100 rounded-xl p-4.5 shadow-2xs space-y-3.5">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> General Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Email Address</p>
                                    <p className="font-bold text-gray-800 break-all">{salon.email || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Registration Date</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                      {salon.createdAt ? new Date(salon.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Business Address</p>
                                    <p className="font-bold text-gray-800">{salon.address || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Coordinates</p>
                                    <p className="font-bold text-gray-800">
                                      Lat: {salon.latitude?.toFixed(5) || 'N/A'}, Lon: {salon.longitude?.toFixed(5) || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Operating Hours</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                                      {salon.openingTime ? `${salon.openingTime} - ${salon.closingTime}` : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Weekly Off</p>
                                    <p className="font-bold text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                      {salon.weeklyOffDay || 'None'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* KYC Records Section */}
                              <div className="bg-white border border-gray-100 rounded-xl p-4.5 shadow-2xs">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-gray-400" /> Owner KYC Verification
                                </h4>
                                {loadingKycId === salon.salonId ? (
                                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                    <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
                                    <span className="font-semibold text-xs">Loading documents...</span>
                                  </div>
                                ) : expandedKycData?.noKyc ? (
                                  <div className="text-center py-8 text-gray-400">
                                    <FileText className="w-8 h-8 mx-auto text-gray-200 mb-1.5" />
                                    <p className="font-bold text-xs text-gray-500">No KYC Documents Uploaded</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Owner has not submitted their identity verification yet.</p>
                                  </div>
                                ) : expandedKycData ? (
                                  <div className="space-y-4">
                                    {/* Owner Metadata */}
                                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5">
                                      <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-gray-400" /> Owner: {expandedKycData.ownerName}
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {expandedKycData.ownerMobile}</span>
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {expandedKycData.ownerEmail}</span>
                                      </div>
                                    </div>

                                    {/* Files list */}
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Uploaded Documents</p>
                                      {expandedKycData.kycDocuments && expandedKycData.kycDocuments.length > 0 ? (
                                        expandedKycData.kycDocuments.map((doc) => (
                                          <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                                <FileText className="w-4 h-4" />
                                              </div>
                                              <div className="min-w-0">
                                                <p className="font-bold text-gray-800 text-[11px] truncate">{doc.fileName}</p>
                                                <p className="text-[9px] text-gray-400 uppercase mt-0.5">{doc.documentType} ({doc.contentType.split('/')[1]})</p>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => handleDownloadKyc(doc.id, doc.fileName)}
                                              className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg transition"
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

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between text-xs text-gray-500">
            <span>Showing page <b>{currentPage + 1}</b> of <b>{totalPages}</b> (Total elements: {totalElements})</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchSalons(currentPage - 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => fetchSalons(currentPage + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
