import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Search,
  CreditCard,
  Calendar,
  Building2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  SearchCode,
  Tag
} from 'lucide-react';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600'
  }
};

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/subscriptions/admin/all');
      if (response.data) {
        setSubscriptions(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      toast.error("Failed to load subscription contracts", toastStyle);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Client-side filtering
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      (sub.salonId && sub.salonId.toString().includes(searchTerm)) ||
      (sub.planCode && sub.planCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.paymentId && sub.paymentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || (sub.status && sub.status.toLowerCase() === statusFilter.toLowerCase());
    const matchesPlan = planFilter === '' || (sub.planCode && sub.planCode.toLowerCase() === planFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Extract unique plans for select filter
  const uniquePlans = [...new Set(subscriptions.map(sub => sub.planCode))].filter(Boolean);

  const getStatusBadge = (status) => {
    if (!status) return null;
    const cleanStatus = status.toLowerCase();

    switch (cleanStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-150">
            <Clock className="w-3 h-3 mr-1 text-gray-400" /> Expired
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-3 h-3 mr-1 text-amber-400 animate-pulse" /> Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
            <XCircle className="w-3 h-3 mr-1 text-red-500" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-100">
            {status}
          </span>
        );
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">System Subscriptions</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor Razorpay subscription contracts, check payments, and verify active plans.</p>
        </div>

        <button 
          onClick={fetchSubscriptions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl shadow-xs transition disabled:opacity-50 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Contracts</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{subscriptions.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Plans</p>
          <p className="text-2xl font-black text-green-600 mt-1">
            {subscriptions.filter(s => s.status?.toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pending Orders</p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {subscriptions.filter(s => s.status?.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Expired Contracts</p>
          <p className="text-2xl font-black text-gray-400 mt-1">
            {subscriptions.filter(s => s.status?.toLowerCase() === 'expired').length}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Salon ID, Plan Code, or Payment ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder-gray-400"
          />
        </div>

        {/* Plan Filter */}
        <div className="w-full md:w-48">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
          >
            <option value="">All Plans</option>
            {uniquePlans.map(plan => (
              <option key={plan} value={plan}>{plan.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
            <option value="pending">Pending Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">ID / Salon</th>
                <th className="py-4 px-6">Plan Info</th>
                <th className="py-4 px-6">Validity Period</th>
                <th className="py-4 px-6">Transaction Ref</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                    <span className="font-bold">Fetching contracts...</span>
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                    <p className="font-bold text-gray-500">No subscription contracts found.</p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FAFAFA]/70 transition-colors">
                    {/* ID / Salon */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">Salon ID: {sub.salonId}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Contract Ref: #{sub.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan Code */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg text-[10px]">
                          {sub.planCode ? sub.planCode.toUpperCase() : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Validity Period */}
                    <td className="py-4.5 px-6">
                      <div className="space-y-0.5 text-gray-800 font-medium">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Start: {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[10px] text-gray-500 pl-5">
                          <span>End: {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Lifetime / Continuous'}</span>
                        </p>
                      </div>
                    </td>

                    {/* Payment Ref */}
                    <td className="py-4.5 px-6">
                      <div className="max-w-[200px] truncate">
                        <p className="font-bold text-gray-800 break-all">{sub.paymentId || 'N/A'}</p>
                        {sub.razorpaySubscriptionId && (
                          <p className="text-[9px] text-gray-400 mt-0.5 truncate">Sub: {sub.razorpaySubscriptionId}</p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6 text-right">
                      {getStatusBadge(sub.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
