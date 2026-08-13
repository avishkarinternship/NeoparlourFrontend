import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  Search, User, Mail, Phone, Calendar, Filter, RotateCcw, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  MessageSquare, Info, X, Clock, HelpCircle
} from 'lucide-react';

const AdminSupportRequests = () => {
  // Main Data States
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination States (Spring API uses 0-indexed pages)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters State
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [mobileFilter, setMobileFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Selected Request for Detail Modal
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch Support Requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: 'createdAt,desc',
        ...(nameFilter && { name: nameFilter.trim() }),
        ...(emailFilter && { email: emailFilter.trim() }),
        ...(mobileFilter && { mobile: mobileFilter.trim() }),
        ...(searchFilter && { search: searchFilter.trim() }),
        ...(startDateFilter && { startDate: new Date(startDateFilter).toISOString() }),
        ...(endDateFilter && { endDate: new Date(endDateFilter).toISOString() })
      };

      const response = await axiosInstance.get('/admin/support-requests', { params });
      const data = response.data;
      
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch support requests:', error);
      toast.error(error.response?.data?.message || 'Failed to load support requests.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when pagination or page size changes
  useEffect(() => {
    fetchRequests();
  }, [page, size]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when filtering
    fetchRequests();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setMobileFilter('');
    setSearchFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setPage(0);
    // Directly trigger fetch with empty filters
    setLoading(true);
    axiosInstance.get('/admin/support-requests', {
      params: { page: 0, size, sort: 'createdAt,desc' }
    }).then(response => {
      const data = response.data;
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    }).catch(error => {
      console.error('Failed to fetch support requests:', error);
      toast.error('Failed to reset support requests.');
    }).finally(() => {
      setLoading(false);
    });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Entries range text
  const startEntry = totalElements === 0 ? 0 : page * size + 1;
  const endEntry = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[#ff0b01] uppercase mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Support Administration
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight uppercase">Customer Support Requests</h1>
          <p className="text-slate-450 font-medium text-xs">View, filter, and review queries submitted by customers.</p>
        </div>
        
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6 shrink-0 self-start md:self-center">
          <div className="text-left">
            <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Queries</span>
            <span className="text-xl font-black text-slate-900">{totalElements}</span>
          </div>
        </div>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Filter className="w-4 h-4 text-[#ff0b01]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Advanced Specification Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Global Search */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Search Keyword</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-[#ff0b01] transition-all">
              <Search className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="text" 
                placeholder="Keyword..." 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Name Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Customer Name</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-[#ff0b01] transition-all">
              <User className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="text" 
                placeholder="Name..." 
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Email Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Customer Email</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-[#ff0b01] transition-all">
              <Mail className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="text" 
                placeholder="Email..." 
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Mobile Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Customer Mobile</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-[#ff0b01] transition-all">
              <Phone className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="text" 
                placeholder="Mobile..." 
                value={mobileFilter}
                onChange={(e) => setMobileFilter(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Start Date</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-[#ff0b01] transition-all">
              <Calendar className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="date" 
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">End Date</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-[#ff0b01] transition-all">
              <Calendar className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="date" 
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#ff0b01] hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" /> {loading ? 'Searching...' : 'Apply Filters'}
          </button>
        </div>
      </form>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        
        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="animate-spin h-10 w-10 border-4 border-[#ff0b01] border-t-transparent rounded-full shadow-sm"></div>
            <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading inquiries...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4 text-[#ff0b01]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-base uppercase tracking-tight mb-1">No Support Requests Found</h3>
            <p className="text-xs text-slate-450 max-w-sm">No queries match your specifications or none have been submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="px-6 py-4.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-4.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">Message Description</th>
                  <th className="px-6 py-4.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{formatDate(req.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-900 block truncate max-w-[150px]">{req.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-600 block truncate max-w-[180px]">{req.email || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{req.mobile || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 flex-1">
                      <p className="text-xs font-medium text-zinc-500 line-clamp-1 max-w-[320px]">{req.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#ff0b01]/10 text-slate-700 hover:text-[#ff0b01] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 inline-flex ml-auto cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Counter Footer */}
        {totalPages > 0 && (
          <div className="bg-white border-t border-slate-100 px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Range Counter & Size Selector */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="font-semibold text-slate-450">
                Showing <strong className="text-slate-900 font-bold">{startEntry}</strong> - <strong className="text-slate-900 font-bold">{endEntry}</strong> of <strong className="text-slate-900 font-bold">{totalElements}</strong> entries
              </span>
              <span className="text-zinc-200">|</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-450">Size:</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0); // Reset page to first when page size changes
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-[#ff0b01] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 self-end md:self-center">
              {/* First Page */}
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="p-2 border border-slate-250/30 rounded-xl hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-600" />
              </button>
              
              {/* Prev Page */}
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="p-2 border border-slate-250/30 rounded-xl hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer animate-none"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    page === pageNum
                      ? 'bg-[#ff0b01] text-white shadow-md shadow-red-500/10'
                      : 'border border-slate-250/30 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  {pageNum + 1}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1}
                className="p-2 border border-slate-250/30 rounded-xl hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page === totalPages - 1}
                className="p-2 border border-slate-250/30 rounded-xl hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details modal overlay */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glassmorphism backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedRequest(null)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#ff0b01]" />
                <div>
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">Support Request Details</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Submitted via customer portal</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-zinc-400 hover:text-slate-600 hover:bg-slate-150/40 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Date Metadata */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Submitted On: <strong className="text-slate-700 ml-1">{formatDate(selectedRequest.createdAt)}</strong>
                </span>
              </div>

              {/* Customer details info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Customer Name</span>
                  <span className="text-xs font-bold text-slate-900">{selectedRequest.name || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Email Address</span>
                  <span className="text-xs font-semibold text-slate-700 break-all">{selectedRequest.email || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mobile Number</span>
                  <span className="text-xs font-bold text-slate-900">{selectedRequest.mobile || 'N/A'}</span>
                </div>
              </div>

              {/* Support Query details */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">Inquiry Message</label>
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl min-h-[140px] text-xs font-medium text-slate-650 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.description}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Close Request View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportRequests;
