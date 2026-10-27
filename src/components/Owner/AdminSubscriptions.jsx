import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  Info,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Lock,
  Unlock,
  Filter
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
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode !== undefined 
    ? outletContext.isDarkMode 
    : document.documentElement.classList.contains('dark');

  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'plans' | 'coupons'

  // ==================== State: Contracts (Subscriptions) ====================
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    salonId: '',
    salonName: '',
    salonCode: '',
    planCode: '',
    status: '',
    paymentId: '',
    razorpaySubscriptionId: '',
    couponCode: '',
    fromDate: '',
    toDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    salonId: '',
    salonName: '',
    salonCode: '',
    planCode: '',
    status: '',
    paymentId: '',
    razorpaySubscriptionId: '',
    couponCode: '',
    fromDate: '',
    toDate: '',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // ==================== State: Salon Details Modal ====================
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [selectedSalonDetails, setSelectedSalonDetails] = useState(null);
  const [loadingSalonDetails, setLoadingSalonDetails] = useState(false);

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
  const fetchSubscriptions = useCallback(async (currentPage, currentSize, currentAppliedFilters) => {
    setLoadingContracts(true);
    try {
      const params = {
        page: currentPage,
        size: currentSize,
        sort: 'createdAt,desc'
      };

      if (currentAppliedFilters?.search?.trim()) params.search = currentAppliedFilters.search.trim();
      if (currentAppliedFilters?.salonId?.toString().trim()) params.salonId = currentAppliedFilters.salonId.toString().trim();
      if (currentAppliedFilters?.salonName?.trim()) params.salonName = currentAppliedFilters.salonName.trim();
      if (currentAppliedFilters?.salonCode?.trim()) params.salonCode = currentAppliedFilters.salonCode.trim();
      if (currentAppliedFilters?.planCode?.trim()) params.planCode = currentAppliedFilters.planCode.trim();
      if (currentAppliedFilters?.status?.trim()) params.status = currentAppliedFilters.status.trim();
      if (currentAppliedFilters?.paymentId?.trim()) params.paymentId = currentAppliedFilters.paymentId.trim();
      if (currentAppliedFilters?.razorpaySubscriptionId?.trim()) params.razorpaySubscriptionId = currentAppliedFilters.razorpaySubscriptionId.trim();
      if (currentAppliedFilters?.couponCode?.trim()) params.couponCode = currentAppliedFilters.couponCode.trim();
      if (currentAppliedFilters?.fromDate?.trim()) {
        try {
          params.fromDate = new Date(currentAppliedFilters.fromDate).toISOString();
        } catch (_) {}
      }
      if (currentAppliedFilters?.toDate?.trim()) {
        try {
          const d = new Date(currentAppliedFilters.toDate);
          d.setHours(23, 59, 59, 999);
          params.toDate = d.toISOString();
        } catch (_) {}
      }

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

  const handleOpenSalonDetails = async (salonId) => {
    if (!salonId) return;
    setSelectedSalonId(salonId);
    setSelectedSalonDetails(null);
    setIsSalonModalOpen(true);
    setLoadingSalonDetails(true);

    try {
      const response = await axiosInstance.get(`/salons/${salonId}`);
      if (response.data) {
        setSelectedSalonDetails(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch salon details:", err);
      toast.error("Could not load salon details", toastStyle);
    } finally {
      setLoadingSalonDetails(false);
    }
  };

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
    fetchSubscriptions(page, pageSize, appliedFilters);
  }, [page, pageSize, appliedFilters, fetchSubscriptions]);

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
  // Filtering is now handled server-side via JPA Specification query params
  const filteredSubscriptions = subscriptions;

  const uniquePlans = Array.from(new Set([
    '1month', '3month', 'lifetime',
    ...plans.map(p => (p.planCode || '').toLowerCase()).filter(Boolean)
  ]));

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPage(0);
    setAppliedFilters({ ...filters });
  };

  const handleSearchReset = () => {
    const emptyFilters = {
      search: '',
      salonId: '',
      salonName: '',
      salonCode: '',
      planCode: '',
      status: '',
      paymentId: '',
      razorpaySubscriptionId: '',
      couponCode: '',
      fromDate: '',
      toDate: '',
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
  };

  const isFilterActive = Object.entries(appliedFilters).some(([_, val]) => val && String(val).trim() !== '');
  const advancedFiltersActiveCount = [
    'salonId', 'salonName', 'salonCode', 'paymentId', 'razorpaySubscriptionId', 'couponCode', 'fromDate', 'toDate'
  ].filter(key => appliedFilters[key] && String(appliedFilters[key]).trim() !== '').length;

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
    <main className={`flex-1 p-6 md:p-8 transition-colors duration-300 overflow-y-auto max-w-7xl mx-auto w-full font-sans ${
      isDarkMode ? 'bg-zinc-950 text-white' : 'bg-[#FAFAFA] text-gray-900'
    }`}>
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Administration Portal
          </span>
          <h1 className={`text-2xl font-black tracking-tight uppercase leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription & Coupon Control</h1>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Manage membership plans, promotional coupons, and active contracts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (activeTab === 'contracts') fetchSubscriptions(page, pageSize, appliedFilters);
              if (activeTab === 'plans') fetchPlans();
              if (activeTab === 'coupons') fetchCoupons();
            }}
            disabled={loadingContracts || loadingPlans || loadingCoupons}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition disabled:opacity-50 cursor-pointer ${
              isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800' : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 shadow-xs'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${(loadingContracts || loadingPlans || loadingCoupons) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex items-center gap-2 p-1.5 rounded-2xl w-fit mb-8 border ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-200/60 border-gray-200'
      }`}>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'contracts'
              ? isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
              : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-red-500" />
          <span>Contracts ({totalElements > 0 ? totalElements : subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'plans'
              ? isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
              : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4 text-red-500" />
          <span>Subscription Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
              : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
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
            <div className={`p-4 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Total Contracts</p>
              <p className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {Array.isArray(subscriptions) ? subscriptions.length : 0}
              </p>
            </div>
            <div className={`p-4 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Active Plans</p>
              <p className="text-2xl font-black text-emerald-500 mt-1">
                {Array.isArray(subscriptions) ? subscriptions.filter(s => s?.status?.toLowerCase() === 'active').length : 0}
              </p>
            </div>
            <div className={`p-4 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Pending Orders</p>
              <p className="text-2xl font-black text-amber-500 mt-1">
                {Array.isArray(subscriptions) ? subscriptions.filter(s => s?.status?.toLowerCase() === 'pending').length : 0}
              </p>
            </div>
            <div className={`p-4 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Expired Contracts</p>
              <p className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                {Array.isArray(subscriptions) ? subscriptions.filter(s => s?.status?.toLowerCase() === 'expired').length : 0}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className={`p-4 rounded-2xl border shadow-sm mb-6 ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'
          }`}>
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by Salon Name, Code, ID, Plan, Payment ID, Coupon..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white focus:bg-zinc-800 placeholder-zinc-500' : 'bg-[#FAFAFA] border-gray-100 text-gray-800 focus:bg-white placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="w-full md:w-44">
                <select
                  value={filters.planCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters(prev => ({ ...prev, planCode: val }));
                    setAppliedFilters(prev => ({ ...prev, planCode: val }));
                    setPage(0);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-red-500 transition-all border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200 focus:bg-zinc-800' : 'bg-[#FAFAFA] border-gray-100 text-gray-600 focus:bg-white'
                  }`}
                >
                  <option value="">All Plans</option>
                  {uniquePlans.map(plan => (
                    <option key={plan} value={plan}>{plan.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-44">
                <select
                  value={filters.status}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters(prev => ({ ...prev, status: val }));
                    setAppliedFilters(prev => ({ ...prev, status: val }));
                    setPage(0);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-red-500 transition-all border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200 focus:bg-zinc-800' : 'bg-[#FAFAFA] border-gray-100 text-gray-600 focus:bg-white'
                  }`}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="cancelled">Cancelled Only</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(prev => !prev)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border flex-shrink-0 ${
                  showAdvancedFilters || advancedFiltersActiveCount > 0
                    ? isDarkMode ? 'bg-zinc-800 border-red-500/50 text-red-400' : 'bg-red-50/70 border-red-200 text-red-600'
                    : isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                title="Toggle specific parameter filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {advancedFiltersActiveCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                    {advancedFiltersActiveCount}
                  </span>
                )}
                {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" /> Search
              </button>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleSearchReset}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 ${
                    isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </form>

            {/* Expandable Advanced Filters (JPA Specification parameters) */}
            {showAdvancedFilters && (
              <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" /> Search By Any Parameter (JPA Specification)
                  </span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                    Match contracts precisely by individual database columns
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Salon Name</label>
                    <input
                      type="text"
                      value={filters.salonName}
                      onChange={(e) => setFilters(prev => ({ ...prev, salonName: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                      placeholder="e.g. Naturals, L'Oreal..."
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Salon Code</label>
                    <input
                      type="text"
                      value={filters.salonCode}
                      onChange={(e) => setFilters(prev => ({ ...prev, salonCode: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                      placeholder="e.g. SLN-101..."
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Salon ID</label>
                    <input
                      type="number"
                      value={filters.salonId}
                      onChange={(e) => setFilters(prev => ({ ...prev, salonId: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                      placeholder="e.g. 42"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Payment ID</label>
                    <input
                      type="text"
                      value={filters.paymentId}
                      onChange={(e) => setFilters(prev => ({ ...prev, paymentId: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                      placeholder="e.g. pay_..."
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Razorpay Subscription ID</label>
                    <input
                      type="text"
                      value={filters.razorpaySubscriptionId}
                      onChange={(e) => setFilters(prev => ({ ...prev, razorpaySubscriptionId: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                      placeholder="e.g. sub_..."
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Coupon Code</label>
                    <input
                      type="text"
                      value={filters.couponCode}
                      onChange={(e) => setFilters(prev => ({ ...prev, couponCode: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                      placeholder="e.g. DIWALI50..."
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>From Date</label>
                    <input
                      type="date"
                      value={filters.fromDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>To Date</label>
                    <input
                      type="date"
                      value={filters.toDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition-all border ${
                        isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/50">
                  <button
                    type="button"
                    onClick={handleSearchReset}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Reset Fields
                  </button>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="px-4 py-1.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-xs"
                  >
                    Apply Specification Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}>
                    <th className="py-4 px-6">Salon Details</th>
                    <th className="py-4 px-6">Plan Info</th>
                    <th className="py-4 px-6">Validity Period</th>
                    <th className="py-4 px-6">Transaction Ref</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-zinc-800/60 text-zinc-300' : 'divide-gray-100 text-gray-700'}`}>
                  {loadingContracts ? (
                    <tr>
                      <td colSpan="5" className={`py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                        <span className="font-bold">Fetching contracts...</span>
                      </td>
                    </tr>
                  ) : filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={`py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <CreditCard className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                        <p className={`font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>No subscription contracts found.</p>
                        {isFilterActive && (
                          <button onClick={handleSearchReset} className="mt-3 text-xs text-red-500 font-bold hover:underline cursor-pointer">Clear filters</button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className={`transition-colors ${isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-[#FAFAFA]/70'}`}>
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isDarkMode ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              <Building2 className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleOpenSalonDetails(sub.salonId)}
                                className="text-left font-black leading-tight text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline flex items-center gap-1.5 cursor-pointer group text-xs md:text-sm"
                                title="Click to view complete salon details"
                              >
                                <span>{sub.salonName || `Salon #${sub.salonId}`}</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition shrink-0" />
                              </button>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {sub.salonCode && (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                    {sub.salonCode}
                                  </span>
                                )}
                                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                  Salon ID: {sub.salonId} • Ref: #{sub.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="space-y-1">
                            <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                              <Tag className="w-3.5 h-3.5 text-gray-400" />
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] ${
                                isDarkMode ? 'bg-red-950/60 text-red-400 border border-red-900' : 'bg-red-50 text-red-600'
                              }`}>
                                {sub.planCode ? sub.planCode.toUpperCase() : 'N/A'}
                              </span>
                            </div>
                            {sub.couponCode && (
                              <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                                <Ticket className="w-3 h-3" /> {sub.couponCode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className={`space-y-0.5 font-medium ${isDarkMode ? 'text-zinc-300' : 'text-gray-800'}`}>
                            <p className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>Start: {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</span>
                            </p>
                            <p className={`flex items-center gap-1.5 text-[10px] pl-5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                              <span>End: {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Lifetime / Continuous'}</span>
                            </p>
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="max-w-[200px] truncate">
                            <p className={`font-bold break-all ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>{sub.paymentId || 'N/A'}</p>
                            {sub.razorpaySubscriptionId && (
                              <p className={`text-[9px] mt-0.5 truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Sub: {sub.razorpaySubscriptionId}</p>
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
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t rounded-b-2xl ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-gray-50/50 border-gray-100 text-gray-500'
            }`}>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold outline-none focus:border-red-400 transition-all cursor-pointer ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-400'}>
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
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ← Prev
                </button>
                <span className={`text-xs font-black px-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loadingContracts}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
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
          <div className={`flex items-center justify-between border p-4 rounded-2xl shadow-xs ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-red-950/60 text-red-400' : 'bg-red-50 text-red-600'
              }`}>
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-extrabold text-sm uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configured Subscription Plans</h3>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Plans shown to salon owners on registration and management screens.</p>
              </div>
            </div>

            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl shadow-md shadow-red-500/10 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPlans ? (
              <div className={`col-span-full py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                <span className="font-bold">Loading plans...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className={`col-span-full py-12 text-center rounded-2xl border ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-gray-100 text-gray-400'
              }`}>
                <Tag className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                <p className={`font-bold ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>No subscription plans found.</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Click "Create Plan" above to configure your first plan.</p>
              </div>
            ) : (
              plans.map((plan) => {
                const amountInRupees = plan.amountInPaise ? (plan.amountInPaise / 100).toFixed(0) : '0';
                return (
                  <div 
                    key={plan.id}
                    className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                      plan.active 
                        ? isDarkMode ? 'bg-zinc-900/90 border-zinc-800 hover:shadow-md' : 'bg-white border-gray-100 hover:shadow-md'
                        : isDarkMode ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60' : 'bg-gray-50/50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
                          isDarkMode ? 'bg-red-950/60 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          Code: {plan.planCode}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                            isDarkMode ? 'bg-emerald-950/60 border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{plan.completedPaymentClaimCount ?? 0} Paid Subscriptions</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.active 
                              ? isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900' : 'bg-green-50 text-green-600 border border-green-100' 
                              : isDarkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {plan.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <h4 className={`text-xl font-extrabold tracking-tight mb-2 uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {plan.planName}
                      </h4>

                      <div className="flex items-baseline gap-1 mb-4">
                        <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{amountInRupees}</span>
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                          / {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>

                      {plan.razorpayPlanId && (
                        <div className={`text-[10px] font-mono p-2 rounded-xl mb-4 truncate border ${
                          isDarkMode ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700' : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                          Razorpay ID: {plan.razorpayPlanId}
                        </div>
                      )}
                    </div>

                    <div className={`pt-4 border-t flex items-center justify-between gap-2 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                      <button
                        onClick={() => handleTogglePlanActive(plan)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          plan.active 
                            ? isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100' 
                            : isDarkMode ? 'border-emerald-900 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/60' : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {plan.active ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isDarkMode ? 'bg-white hover:bg-zinc-200 text-black' : 'bg-gray-900 hover:bg-black text-white'
                        }`}
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
          <div className={`flex items-center justify-between border p-4 rounded-2xl shadow-xs ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-red-950/60 text-red-400' : 'bg-red-50 text-red-600'
              }`}>
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-extrabold text-sm uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Promotional Coupons & Discounts</h3>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Manage promotional discount codes and 100% free trial coupons.</p>
              </div>
            </div>

            <button
              onClick={handleOpenCreateCoupon}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl shadow-md shadow-red-500/10 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className={`border rounded-2xl shadow-sm overflow-hidden ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}>
                    <th className="py-4 px-6">Coupon Code</th>
                    <th className="py-4 px-6">Discount Type & Value</th>
                    <th className="py-4 px-6">Applicable Plan</th>
                    <th className="py-4 px-6">Usage Count</th>
                    <th className="py-4 px-6">Validity Period</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-zinc-800/60 text-zinc-300' : 'divide-gray-100 text-gray-700'}`}>
                  {loadingCoupons ? (
                    <tr>
                      <td colSpan="7" className={`py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                        <span className="font-bold">Loading coupons...</span>
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={`py-12 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                        <Ticket className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-gray-200'}`} />
                        <p className={`font-bold ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>No promotional coupons created yet.</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Click "Create Coupon" above to create discount codes.</p>
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className={`transition-colors ${isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-[#FAFAFA]/70'}`}>
                        <td className="py-4.5 px-6 font-black">
                          <span className={`px-3 py-1 border rounded-xl font-mono text-xs tracking-wider ${
                            isDarkMode ? 'bg-red-950/60 text-red-400 border-red-900' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {coupon.couponCode}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${(coupon.discountValue / 100).toFixed(0)} OFF`}
                          </span>
                          <span className={`block text-[10px] font-bold uppercase mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                            {coupon.discountType}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`font-bold ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                            {coupon.applicablePlanCode ? coupon.applicablePlanCode.toUpperCase() : 'All Plans'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-semibold">
                          <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{coupon.usedCount || 0}</span>
                          <span className={isDarkMode ? 'text-zinc-500' : 'text-gray-400'}> / {coupon.maxUses !== null && coupon.maxUses !== undefined ? coupon.maxUses : '∞'}</span>
                        </td>
                        <td className={`py-4.5 px-6 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                          {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'Immediate'} → {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString() : 'Forever'}
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            coupon.active 
                              ? isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900' : 'bg-green-50 text-green-600 border border-green-100'
                              : isDarkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditCoupon(coupon)}
                              className={`p-2 rounded-lg transition cursor-pointer ${
                                isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className={`p-2 rounded-lg transition cursor-pointer ${
                                isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-950/50' : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                              }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className={`absolute top-6 right-6 p-2 rounded-full transition cursor-pointer ${
                isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDarkMode ? 'bg-red-950/60 text-red-400' : 'bg-red-50 text-red-600'
              }`}>
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
                </h3>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Configure membership pricing and terms.</p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Plan Code *</label>
                <input
                  type="text"
                  value={planForm.planCode}
                  onChange={(e) => setPlanForm({ ...planForm, planCode: e.target.value })}
                  placeholder="e.g. 1month, 12month, basic, pro"
                  required
                  disabled={!!editingPlan}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition disabled:opacity-60 border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Plan Display Name *</label>
                <input
                  type="text"
                  value={planForm.planName}
                  onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                  placeholder="e.g. Monthly Basic Plan"
                  required
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.amountInRupees}
                    onChange={(e) => setPlanForm({ ...planForm, amountInRupees: e.target.value })}
                    placeholder="e.g. 2999"
                    required
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Duration (Months) *</label>
                  <input
                    type="number"
                    min="1"
                    value={planForm.durationMonths}
                    onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                    placeholder="e.g. 1, 3, 6, 12"
                    required
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Razorpay Plan ID (Optional)</label>
                <input
                  type="text"
                  value={planForm.razorpayPlanId}
                  onChange={(e) => setPlanForm({ ...planForm, razorpayPlanId: e.target.value })}
                  placeholder="e.g. plan_N12345ABC"
                  className={`w-full px-4 py-3 rounded-xl text-xs font-mono focus:outline-none focus:border-red-500 transition border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-gray-50 border-gray-100'
              }`}>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'}`}>Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.active}
                    onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2A14] ${
                    isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'
                  }`}></div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className={`flex-1 py-3 border font-bold rounded-xl text-xs uppercase transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border relative max-h-[90vh] overflow-y-auto custom-scrollbar ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className={`absolute top-6 right-6 p-2 rounded-full transition cursor-pointer ${
                isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDarkMode ? 'bg-red-950/60 text-red-400' : 'bg-red-50 text-red-600'
              }`}>
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h3>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Configure promotional discount codes.</p>
              </div>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Coupon Code *</label>
                <input
                  type="text"
                  value={couponForm.couponCode}
                  onChange={(e) => setCouponForm({ ...couponForm, couponCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. FREESUB, SAVE50, WELCOME10"
                  required
                  className={`w-full px-4 py-3 rounded-xl text-sm font-black tracking-wider uppercase focus:outline-none focus:border-red-500 transition border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (Paise)</option>
                  </select>
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                    {couponForm.discountType === 'PERCENTAGE' ? 'Discount Value (%) *' : 'Flat Value (in Paise) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    placeholder={couponForm.discountType === 'PERCENTAGE' ? 'e.g. 100 (for 100% free)' : 'e.g. 50000 (for ₹500)'}
                    required
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Applicable Plan (Optional)</label>
                <select
                  value={couponForm.applicablePlanCode}
                  onChange={(e) => setCouponForm({ ...couponForm, applicablePlanCode: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  <option value="">All Subscription Plans</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.planCode}>{p.planName} ({p.planCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Max Uses (Optional)</label>
                <input
                  type="number"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                  placeholder="Leave blank for unlimited uses"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500 transition border ${
                    isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Valid From (Optional)</label>
                  <input
                    type="datetime-local"
                    value={couponForm.validFrom}
                    onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Valid To (Optional)</label>
                  <input
                    type="datetime-local"
                    value={couponForm.validTo}
                    onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 transition border ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-gray-50 border-gray-100'
              }`}>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'}`}>Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.active}
                    onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF2A14] ${
                    isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'
                  }`}></div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className={`flex-1 py-3 border font-bold rounded-xl text-xs uppercase transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
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

      {/* MODAL: SALON DETAILS POPUP */}
      {isSalonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 transition-all ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-zinc-100 dark:border-zinc-800 gap-4">
              <div className="flex items-center gap-4">
                {selectedSalonDetails?.imageUrl ? (
                  <img
                    src={selectedSalonDetails.imageUrl}
                    alt={selectedSalonDetails.salonName || 'Salon'}
                    className="w-16 h-16 rounded-2xl object-cover border shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-[#FF2A14] flex items-center justify-center border border-red-200 dark:border-red-900/50 flex-shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                      {selectedSalonDetails?.salonName || `Salon #${selectedSalonId}`}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {selectedSalonDetails?.salonCode || `ID #${selectedSalonId}`}
                    </span>
                  </div>
                  {selectedSalonDetails && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {selectedSalonDetails.active ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          🟢 Active Salon
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-500 border border-zinc-500/30">
                          ⚪ Inactive
                        </span>
                      )}

                      {selectedSalonDetails.banned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Normal Status
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSalonModalOpen(false)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {loadingSalonDetails ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-3" />
                <p className="text-sm font-bold text-zinc-400">Loading salon profile from server...</p>
              </div>
            ) : !selectedSalonDetails ? (
              <div className="py-12 text-center text-zinc-400 text-sm">
                Unable to retrieve salon information.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {/* Contact Channels & Area */}
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
                        <strong className="font-bold">{selectedSalonDetails.phone || 'N/A'}</strong>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-zinc-400 font-semibold">Email:</span>
                        <strong className="font-bold break-all">{selectedSalonDetails.email || 'N/A'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Area & City
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <p className="flex items-center justify-between">
                        <span className="text-zinc-400 font-semibold">Area / Suburb:</span>
                        <strong className="font-bold">{selectedSalonDetails.areaName || '—'}</strong>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-zinc-400 font-semibold">City & State:</span>
                        <strong className="font-bold">
                          {selectedSalonDetails.cityName || '—'}{selectedSalonDetails.stateName ? `, ${selectedSalonDetails.stateName}` : ''}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Street Address & Geolocation */}
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Street Address & Landmark</span>
                    {selectedSalonDetails.latitude && selectedSalonDetails.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedSalonDetails.latitude},${selectedSalonDetails.longitude}`}
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
                    {selectedSalonDetails.address || 'No street address provided.'}
                    {selectedSalonDetails.landmark ? ` (Landmark: ${selectedSalonDetails.landmark})` : ''}
                  </p>
                  {selectedSalonDetails.latitude && selectedSalonDetails.longitude && (
                    <p className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/40">
                      Coordinates: {selectedSalonDetails.latitude.toFixed(5)}, {selectedSalonDetails.longitude.toFixed(5)}
                    </p>
                  )}
                </div>

                {/* Operational Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                    <span className="text-[9px] font-black uppercase text-zinc-400 block">Working Hours</span>
                    <p className="text-xs font-bold mt-0.5">
                      {selectedSalonDetails.openingTime && selectedSalonDetails.closingTime
                        ? `${selectedSalonDetails.openingTime} - ${selectedSalonDetails.closingTime}`
                        : 'Not set'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Calendar className="w-4 h-4 mx-auto text-red-500 mb-1" />
                    <span className="text-[9px] font-black uppercase text-zinc-400 block">Weekly Off</span>
                    <p className="text-xs font-bold mt-0.5">
                      {selectedSalonDetails.weeklyOffDay || 'None (Open 7d)'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Star className="w-4 h-4 mx-auto text-amber-400 fill-amber-400 mb-1" />
                    <span className="text-[9px] font-black uppercase text-zinc-400 block">Rating</span>
                    <p className="text-xs font-bold mt-0.5">
                      {selectedSalonDetails.rating ? `${Number(selectedSalonDetails.rating).toFixed(1)} / 5.0` : 'Unrated'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Award className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <span className="text-[9px] font-black uppercase text-zinc-400 block">Home Charge</span>
                    <p className="text-xs font-bold mt-0.5">
                      {selectedSalonDetails.homeServiceCharges ? `₹${selectedSalonDetails.homeServiceCharges}` : 'None'}
                    </p>
                  </div>
                </div>

                {/* Tax & Registration Card */}
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                    Tax & Business Registration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-zinc-400 text-[10px] block uppercase font-bold">GSTIN:</span>
                      <strong className="font-mono">{selectedSalonDetails.gstin || 'Not registered'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block uppercase font-bold">State Code:</span>
                      <strong className="font-mono">{selectedSalonDetails.stateCode || selectedSalonDetails.state || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block uppercase font-bold">GST in Invoice:</span>
                      <strong>{selectedSalonDetails.includeGstInInvoice ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>
                  {selectedSalonDetails.banReason && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-semibold mt-2">
                      <strong>Ban Reason:</strong> {selectedSalonDetails.banReason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSalonModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
