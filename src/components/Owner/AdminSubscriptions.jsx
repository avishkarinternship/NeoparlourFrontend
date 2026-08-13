import React, { useState, useEffect, useCallback } from 'react';
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
  Tag,
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Percent,
  Check,
  X,
  ShieldCheck,
  Layers,
  Zap,
  Info
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
  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'plans' | 'coupons'

  // ==================== State: Contracts (Subscriptions) ====================
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // ==================== State: Plans ====================
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    planCode: '',
    planName: '',
    amountInRupees: '',
    durationMonths: '1',
    razorpayPlanId: '',
    active: true
  });
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // ==================== State: Coupons ====================
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    couponCode: '',
    discountType: 'PERCENTAGE', // 'PERCENTAGE' | 'FLAT'
    discountValue: '',
    applicablePlanCode: '',
    maxUses: '',
    validFrom: '',
    validTo: '',
    active: true
  });
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  // ==================== Data Fetching ====================
  const fetchSubscriptions = useCallback(async (currentPage, currentSize, currentSearch, currentStatus, currentPlan) => {
    setLoadingContracts(true);
    try {
      const params = {
        page: currentPage,
        size: currentSize,
        sort: 'createdAt,desc'
      };
      if (currentSearch?.trim()) params.search = currentSearch.trim();
      if (currentStatus) params.status = currentStatus;
      if (currentPlan) params.planCode = currentPlan;

      const response = await axiosInstance.get('/subscriptions/admin/all', { params });
      const data = response.data;

      // Handle both paginated (Page<>) and flat list responses
      if (data?.content !== undefined) {
        setSubscriptions(Array.isArray(data.content) ? data.content : []);
        // Spring Data REST wraps metadata under data.page; standard Page<T> puts it at root level
        const meta = data.page ?? data;
        setTotalPages(meta.totalPages ?? 1);
        setTotalElements(meta.totalElements ?? 0);
      } else if (Array.isArray(data)) {
        // Flat list fallback (non-paginated backend)
        setSubscriptions(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setSubscriptions([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      toast.error("Failed to load subscription contracts", toastStyle);
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await axiosInstance.get('/subscriptions/plans-with-claims');
      if (response.data) {
        setPlans(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription plans with claims:", err);
      // Fallback to /subscriptions/plans if needed
      try {
        const fallbackRes = await axiosInstance.get('/subscriptions/plans');
        if (fallbackRes.data) {
          setPlans(fallbackRes.data);
        }
      } catch (fallbackErr) {
        toast.error("Failed to load subscription plans", toastStyle);
      }
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await axiosInstance.get('/subscriptions/admin/coupons');
      if (response.data) {
        setCoupons(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      toast.error("Failed to load discount coupons", toastStyle);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(page, pageSize, searchTerm, statusFilter, planFilter);
  }, [page, pageSize, searchTerm, statusFilter, planFilter, fetchSubscriptions]);

  useEffect(() => {
    fetchPlans();
    fetchCoupons();
  }, []);

  // ==================== Handlers: Plans ====================
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      planCode: '',
      planName: '',
      amountInRupees: '',
      durationMonths: '1',
      razorpayPlanId: '',
      active: true
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      planCode: plan.planCode || '',
      planName: plan.planName || '',
      amountInRupees: plan.amountInPaise ? (plan.amountInPaise / 100).toString() : '',
      durationMonths: plan.durationMonths ? plan.durationMonths.toString() : '1',
      razorpayPlanId: plan.razorpayPlanId || '',
      active: plan.active !== undefined ? plan.active : true
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.planCode.trim() || !planForm.planName.trim() || !planForm.amountInRupees) {
      toast.error("Please fill in Plan Code, Name, and Price", toastStyle);
      return;
    }

    setSubmittingPlan(true);
    const amountInPaise = Math.round(parseFloat(planForm.amountInRupees) * 100);
    const payload = {
      planCode: planForm.planCode.trim().toLowerCase(),
      planName: planForm.planName.trim(),
      amountInPaise: amountInPaise,
      durationMonths: parseInt(planForm.durationMonths) || 1,
      razorpayPlanId: planForm.razorpayPlanId.trim() || null,
      active: planForm.active
    };

    try {
      if (editingPlan) {
        await axiosInstance.put(`/subscriptions/admin/plans/${editingPlan.id}`, payload);
        toast.success("Subscription plan updated successfully", toastStyle);
      } else {
        await axiosInstance.post('/subscriptions/admin/plans', payload);
        toast.success("Subscription plan created successfully", toastStyle);
      }
      setIsPlanModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error("Save plan failed:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to save subscription plan";
      toast.error(msg, toastStyle);
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleTogglePlanActive = async (plan) => {
    const newStatus = !plan.active;
    try {
      await axiosInstance.put(`/subscriptions/admin/plans/${plan.id}/toggle-active?active=${newStatus}`);
      toast.success(`Plan ${newStatus ? 'activated' : 'deactivated'} successfully`, toastStyle);
      fetchPlans();
    } catch (err) {
      console.error("Toggle plan status failed:", err);
      toast.error("Failed to update plan status", toastStyle);
    }
  };

  // ==================== Handlers: Coupons ====================
  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      couponCode: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      applicablePlanCode: '',
      maxUses: '',
      validFrom: '',
      validTo: '',
      active: true
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      couponCode: coupon.couponCode || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue !== undefined ? coupon.discountValue.toString() : '',
      applicablePlanCode: coupon.applicablePlanCode || '',
      maxUses: coupon.maxUses !== null && coupon.maxUses !== undefined ? coupon.maxUses.toString() : '',
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : '',
      validTo: coupon.validTo ? coupon.validTo.slice(0, 16) : '',
      active: coupon.active !== undefined ? coupon.active : true
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.couponCode.trim() || !couponForm.discountValue) {
      toast.error("Please fill in Coupon Code and Discount Value", toastStyle);
      return;
    }

    setSubmittingCoupon(true);
    const payload = {
      couponCode: couponForm.couponCode.trim().toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: parseFloat(couponForm.discountValue),
      applicablePlanCode: couponForm.applicablePlanCode.trim() || null,
      maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
      validFrom: couponForm.validFrom ? new Date(couponForm.validFrom).toISOString() : null,
      validTo: couponForm.validTo ? new Date(couponForm.validTo).toISOString() : null,
      active: couponForm.active
    };

    try {
      if (editingCoupon) {
        await axiosInstance.put(`/subscriptions/admin/coupons/${editingCoupon.id}`, payload);
        toast.success("Coupon updated successfully", toastStyle);
      } else {
        await axiosInstance.post('/subscriptions/admin/coupons', payload);
        toast.success("Coupon created successfully", toastStyle);
      }
      setIsCouponModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error("Save coupon failed:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to save coupon";
      toast.error(msg, toastStyle);
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axiosInstance.delete(`/subscriptions/admin/coupons/${couponId}`);
      toast.success("Coupon deleted successfully", toastStyle);
      fetchCoupons();
    } catch (err) {
      console.error("Delete coupon failed:", err);
      toast.error("Failed to delete coupon", toastStyle);
    }
  };

  // ==================== Filtering Logic ====================
  // Filtering is now handled server-side via query params
  const filteredSubscriptions = subscriptions; // server already filters

  const uniquePlans = ['1month', '3month', 'lifetime'];

  const handleSearchSubmit = () => {
    setPage(0);
    setSearchTerm(searchInput);
  };

  const handleSearchReset = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('');
    setPlanFilter('');
    setPage(0);
  };

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
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Administration Portal
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Subscription & Coupon Control</h1>
          <p className="text-xs text-gray-500 mt-1">Manage membership plans, promotional coupons, and active contracts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (activeTab === 'contracts') fetchSubscriptions(page, pageSize, searchTerm, statusFilter, planFilter);
              if (activeTab === 'plans') fetchPlans();
              if (activeTab === 'coupons') fetchCoupons();
            }}
            disabled={loadingContracts || loadingPlans || loadingCoupons}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl shadow-xs transition disabled:opacity-50 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingContracts || loadingPlans || loadingCoupons) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab === 'plans' && (
            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl shadow-md shadow-red-500/10 transition text-xs font-extrabold cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          )}

          {activeTab === 'coupons' && (
            <button
              onClick={handleOpenCreateCoupon}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl shadow-md shadow-red-500/10 transition text-xs font-extrabold cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-200/60 rounded-2xl w-fit mb-8 border border-gray-200">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'contracts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-red-500" />
          <span>Contracts ({totalElements > 0 ? totalElements : subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4 text-red-500" />
          <span>Subscription Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Ticket className="w-4 h-4 text-red-500" />
          <span>Coupons & Offers ({coupons.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTRACTS / SUBSCRIPTIONS */}
      {activeTab === 'contracts' && (
        <>
          {/* Stats Quick Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Contracts</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {Array.isArray(subscriptions) ? subscriptions.length : 0}
              </p>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Plans</p>
              <p className="text-2xl font-black text-green-600 mt-1">
                {Array.isArray(subscriptions) ? subscriptions.filter(s => s?.status?.toLowerCase() === 'active').length : 0}
              </p>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pending Orders</p>
              <p className="text-2xl font-black text-amber-500 mt-1">
                {Array.isArray(subscriptions) ? subscriptions.filter(s => s?.status?.toLowerCase() === 'pending').length : 0}
              </p>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Expired Contracts</p>
              <p className="text-2xl font-black text-gray-400 mt-1">
                {Array.isArray(subscriptions) ? subscriptions.filter(s => s?.status?.toLowerCase() === 'expired').length : 0}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search by Salon ID, Plan Code, or Payment ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all placeholder-gray-400"
              />
            </div>

            <div className="w-full md:w-44">
              <select
                value={planFilter}
                onChange={(e) => { setPlanFilter(e.target.value); setPage(0); }}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              >
                <option value="">All Plans</option>
                {uniquePlans.map(plan => (
                  <option key={plan} value={plan}>{plan.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="pending">Pending Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>

            <button
              onClick={handleSearchSubmit}
              className="px-5 py-2.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 flex-shrink-0"
            >
              <Search className="w-3.5 h-3.5" /> Search
            </button>

            {(searchTerm || statusFilter || planFilter) && (
              <button
                onClick={handleSearchReset}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Table */}
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
                  {loadingContracts ? (
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
                        {(searchTerm || statusFilter || planFilter) && (
                          <button onClick={handleSearchReset} className="mt-3 text-xs text-red-500 font-bold hover:underline cursor-pointer">Clear filters</button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FAFAFA]/70 transition-colors">
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
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800">
                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                            <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg text-[10px]">
                              {sub.planCode ? sub.planCode.toUpperCase() : 'N/A'}
                            </span>
                          </div>
                        </td>
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
                        <td className="py-4.5 px-6">
                          <div className="max-w-[200px] truncate">
                            <p className="font-bold text-gray-800 break-all">{sub.paymentId || 'N/A'}</p>
                            {sub.razorpaySubscriptionId && (
                              <p className="text-[9px] text-gray-400 mt-0.5 truncate">Sub: {sub.razorpaySubscriptionId}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          {getStatusBadge(sub.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-semibold">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-red-400 transition-all cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-400">
                  {totalElements > 0
                    ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, totalElements)} of ${totalElements} contracts`
                    : `${subscriptions.length} contracts`
                  }
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0 || loadingContracts}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  ← Prev
                </button>
                <span className="text-xs font-black text-gray-700 px-2">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loadingContracts}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm uppercase">Configured Subscription Plans</h3>
                <p className="text-xs text-gray-400">Plans shown to salon owners on registration and management screens.</p>
              </div>
            </div>

            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPlans ? (
              <div className="col-span-full py-12 text-center text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                <span className="font-bold">Loading plans...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                <Tag className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                <p className="font-bold text-gray-600">No subscription plans found.</p>
                <p className="text-xs text-gray-400 mt-1">Click "Create Plan" above to configure your first plan.</p>
              </div>
            ) : (
              plans.map((plan) => {
                const amountInRupees = plan.amountInPaise ? (plan.amountInPaise / 100).toFixed(0) : '0';
                return (
                  <div 
                    key={plan.id}
                    className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                      plan.active ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <span className="text-[10px] font-black tracking-widest uppercase bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
                          Code: {plan.planCode}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{plan.completedPaymentClaimCount ?? 0} Paid Subscriptions</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {plan.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2 uppercase">
                        {plan.planName}
                      </h4>

                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-black text-gray-900">₹{amountInRupees}</span>
                        <span className="text-xs font-semibold text-gray-400">
                          / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>

                      {plan.razorpayPlanId && (
                        <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-2 rounded-xl mb-4 truncate border border-gray-100">
                          Razorpay ID: {plan.razorpayPlanId}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTogglePlanActive(plan)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          plan.active 
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100' 
                            : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {plan.active ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm uppercase">Promotional Coupons & Discounts</h3>
                <p className="text-xs text-gray-400">Manage promotional discount codes and 100% free trial coupons.</p>
              </div>
            </div>

            <button
              onClick={handleOpenCreateCoupon}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Coupon
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Coupon Code</th>
                    <th className="py-4 px-6">Discount Type & Value</th>
                    <th className="py-4 px-6">Applicable Plan</th>
                    <th className="py-4 px-6">Usage Count</th>
                    <th className="py-4 px-6">Validity Period</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {loadingCoupons ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                        <span className="font-bold">Loading coupons...</span>
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400">
                        <Ticket className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                        <p className="font-bold text-gray-600">No promotional coupons created yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Coupon" above to create discount codes.</p>
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-[#FAFAFA]/70 transition-colors">
                        <td className="py-4.5 px-6 font-black text-gray-900">
                          <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-xl font-mono text-xs tracking-wider">
                            {coupon.couponCode}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="font-extrabold text-gray-900">
                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${(coupon.discountValue / 100).toFixed(0)} OFF`}
                          </span>
                          <span className="block text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            {coupon.discountType}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="font-bold text-gray-700">
                            {coupon.applicablePlanCode ? coupon.applicablePlanCode.toUpperCase() : 'All Plans'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-semibold">
                          <span className="text-gray-900 font-extrabold">{coupon.usedCount || 0}</span>
                          <span className="text-gray-400"> / {coupon.maxUses !== null && coupon.maxUses !== undefined ? coupon.maxUses : '∞'}</span>
                        </td>
                        <td className="py-4.5 px-6 text-gray-600 font-medium">
                          {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'Immediate'} → {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString() : 'Forever'}
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            coupon.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditCoupon(coupon)}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREATE / EDIT PLAN ==================== */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">
                  {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
                </h3>
                <p className="text-xs text-gray-400 font-semibold">Configure membership pricing and terms.</p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Plan Code *</label>
                <input
                  type="text"
                  value={planForm.planCode}
                  onChange={(e) => setPlanForm({ ...planForm, planCode: e.target.value })}
                  placeholder="e.g. 1month, 12month, basic, pro"
                  required
                  disabled={!!editingPlan} // Code should be unique key
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Plan Display Name *</label>
                <input
                  type="text"
                  value={planForm.planName}
                  onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                  placeholder="e.g. Monthly Basic Plan"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.amountInRupees}
                    onChange={(e) => setPlanForm({ ...planForm, amountInRupees: e.target.value })}
                    placeholder="e.g. 2999"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    min="1"
                    value={planForm.durationMonths}
                    onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                    placeholder="e.g. 1, 3, 6, 12"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Razorpay Plan ID (Optional)</label>
                <input
                  type="text"
                  value={planForm.razorpayPlanId}
                  onChange={(e) => setPlanForm({ ...planForm, razorpayPlanId: e.target.value })}
                  placeholder="e.g. plan_N12345ABC"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-700">Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.active}
                    onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2A14]"></div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPlan}
                  className="flex-1 py-3 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {submittingPlan ? 'Saving...' : editingPlan ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREATE / EDIT COUPON ==================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h3>
                <p className="text-xs text-gray-400 font-semibold">Configure promotional discount codes.</p>
              </div>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={couponForm.couponCode}
                  onChange={(e) => setCouponForm({ ...couponForm, couponCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. FREESUB, SAVE50, WELCOME10"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-800 tracking-wider uppercase focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (Paise)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {couponForm.discountType === 'PERCENTAGE' ? 'Discount Value (%) *' : 'Flat Value (in Paise) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    placeholder={couponForm.discountType === 'PERCENTAGE' ? 'e.g. 100 (for 100% free)' : 'e.g. 50000 (for ₹500)'}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Applicable Plan (Optional)</label>
                <select
                  value={couponForm.applicablePlanCode}
                  onChange={(e) => setCouponForm({ ...couponForm, applicablePlanCode: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                >
                  <option value="">All Subscription Plans</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.planCode}>{p.planName} ({p.planCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Max Uses (Optional)</label>
                <input
                  type="number"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                  placeholder="Leave blank for unlimited uses"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Valid From (Optional)</label>
                  <input
                    type="datetime-local"
                    value={couponForm.validFrom}
                    onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Valid To (Optional)</label>
                  <input
                    type="datetime-local"
                    value={couponForm.validTo}
                    onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-700">Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.active}
                    onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2A14]"></div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="flex-1 py-3 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {submittingCoupon ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
