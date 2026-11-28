import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


import axiosInstance from '../../../api/axiosInstance';

// Icons
import productDetailsIcon from '../../../assets/Owner/Manage/Products/product_details_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Products/percentage_icon.svg';
import rateIcon from '../../../assets/Owner/Manage/Products/rate_icon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';
import { Package, PackagePlus, LayoutGrid, Sparkles, Check, Search as SearchIcon, AlertCircle, ArrowRight, Tag, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const AddPackages = () => {
    const { t } = useTranslation();
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode || document.documentElement.classList.contains('dark');

    const [activeTab, setActiveTab] = useState('add');

    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('manageSidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        const handleToggle = () => {
            const saved = localStorage.getItem('manageSidebarOpen');
            setSidebarOpen(saved !== null ? JSON.parse(saved) : true);
        };
        window.addEventListener('manageSidebarToggle', handleToggle);
        return () => window.removeEventListener('manageSidebarToggle', handleToggle);
    }, []);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        packagePrice: '',
        discountType: '',
        discountValue: '',
        active: true,
        serviceIds: [],
        usageLimitPerCustomer: '',
        totalUsageLimit: ''
    });

    const [priceError, setPriceError] = useState('');

    const [services, setServices] = useState([]);
    const [serviceSearch, setServiceSearch] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [totalServicePrice, setTotalServicePrice] = useState(0);

    // View Packages State
    const [packages, setPackages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [filters, setFilters] = useState({
        name: '',
        active: ''
    });

    // Fetch Services
    const fetchServices = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/services');
            setServices(res.data || []);
        } catch (error) {
            toast.error('Failed to load services', toastStyle);
        }
    }, []);

    const fetchPackages = useCallback(async (page = currentPage) => {
        setLoadingPackages(true);
        try {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.active !== '') params.append('active', filters.active);
            params.append('page', page);
            params.append('size', '10');
            params.append('sortBy', 'id');
            params.append('direction', 'desc');

            const res = await axiosInstance.get(`/packages/search?${params.toString()}`);
            setPackages(res.data?.content || []);
            setTotalPages(res.data?.page?.totalPages ?? res.data?.totalPages ?? 0);
            setTotalElements(res.data?.page?.totalElements ?? res.data?.totalElements ?? 0);
            setCurrentPage(page);
        } catch (error) {
            toast.error('Failed to load packages', toastStyle);
        } finally {
            setLoadingPackages(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    useEffect(() => {
        if (activeTab === 'view') fetchPackages(0);
    }, [activeTab, filters, fetchPackages]);

    // Calculate total price of selected services
    useEffect(() => {
        const total = selectedServices.reduce((sum, id) => {
            const service = services.find(s => s.id === id);
            return sum + (parseFloat(service?.price) || 0);
        }, 0);
        setTotalServicePrice(total);
    }, [selectedServices, services]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'packagePrice') {
            let val = value.replace(/[^0-9.]/g, '');
            const occurrences = (val.match(/\./g) || []).length;
            if (occurrences > 1) return;
            const parts = val.split('.');
            if (parts[0].length > 5) return;
            newValue = val;
            if (parts[0].length === 5) {
                setPriceError("Maximum price limit reached (5 digits)");
            } else {
                setPriceError("");
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };



    const toggleService = (serviceId) => {
        let newSelected = [...selectedServices];
        if (newSelected.includes(serviceId)) {
            newSelected = newSelected.filter(id => id !== serviceId);
        } else {
            newSelected.push(serviceId);
        }
        setSelectedServices(newSelected);
        setFormData(prev => ({ ...prev, serviceIds: newSelected }));
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', packagePrice: '', discountType: '', discountValue: '',
            active: true, serviceIds: [], usageLimitPerCustomer: '', totalUsageLimit: ''
        });
        setSelectedServices([]);
        setServiceSearch('');
        setIsEditing(false);
        setEditingId(null);
        setPriceError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.packagePrice) {
            toast.error("Please fill all required fields", toastStyle);
            return;
        }

        if (formData.name.trim().length > 120) {
            toast.error("Package name cannot exceed 120 characters", toastStyle);
            return;
        }

        if (formData.description && formData.description.trim().length > 500) {
            toast.error("Description cannot exceed 500 characters", toastStyle);
            return;
        }

        if (selectedServices.length === 0) {
            toast.error("Please select at least one service", toastStyle);
            return;
        }

        const priceVal = parseFloat(formData.packagePrice);
        if (isNaN(priceVal) || priceVal <= 0) {
            toast.error("Package price must be greater than 0", toastStyle);
            return;
        }

        if (priceVal >= 100000) {
            toast.error("Package price cannot exceed ₹99,999", toastStyle);
            return;
        }

        if (formData.usageLimitPerCustomer) {
            const limitVal = parseInt(formData.usageLimitPerCustomer, 10);
            if (isNaN(limitVal) || limitVal <= 0) {
                toast.error("Usage limit per customer must be greater than 0", toastStyle);
                return;
            }
        }

        if (formData.totalUsageLimit) {
            const totalVal = parseInt(formData.totalUsageLimit, 10);
            if (isNaN(totalVal) || totalVal <= 0) {
                toast.error("Total usage limit must be greater than 0", toastStyle);
                return;
            }
            if (formData.usageLimitPerCustomer && totalVal < parseInt(formData.usageLimitPerCustomer, 10)) {
                toast.error("Total usage limit cannot be less than usage limit per customer", toastStyle);
                return;
            }
        }

        // Calculate discount type and discount value automatically!
        const totalActualPrice = selectedServices.reduce((sum, id) => {
            const service = services.find(s => s.id === id);
            return sum + (parseFloat(service?.price) || 0);
        }, 0);

        let calculatedDiscountType = null;
        let calculatedDiscountValue = null;

        if (priceVal < totalActualPrice) {
            calculatedDiscountType = 'FLAT';
            calculatedDiscountValue = totalActualPrice - priceVal;
        }

        const payload = {
            name: formData.name.trim(),
            description: formData.description?.trim(),
            packagePrice: priceVal,
            active: formData.active !== false,
            discountType: calculatedDiscountType,
            discountValue: calculatedDiscountValue,
            serviceIds: selectedServices,
            usageLimitPerCustomer: formData.usageLimitPerCustomer ? parseInt(formData.usageLimitPerCustomer, 10) : null,
            totalUsageLimit: formData.totalUsageLimit ? parseInt(formData.totalUsageLimit, 10) : null,
        };

        try {
            if (isEditing && editingId) {
                await axiosInstance.put(`/packages/${editingId}`, payload);
                toast.success('Package updated successfully', toastStyle);
            } else {
                await axiosInstance.post('/packages', payload);
                toast.success('Package created successfully', toastStyle);
            }
            resetForm();
            if (activeTab === 'view') fetchPackages();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed', toastStyle);
        }
    };

    const handleEdit = async (pkg) => {
        const toastId = toast.loading('Loading package details...', toastStyle);
        try {
            const response = await axiosInstance.get(`/packages/${pkg.id}`);
            const fullPkg = response.data;
            setFormData({
                name: fullPkg.name || '',
                description: fullPkg.description || '',
                packagePrice: fullPkg.packagePrice || '',
                active: fullPkg.active !== false,
                serviceIds: fullPkg.services?.map(s => s.id) || [],
                usageLimitPerCustomer: fullPkg.usageLimitPerCustomer || '',
                totalUsageLimit: fullPkg.totalUsageLimit || ''
            });
            setSelectedServices(fullPkg.services?.map(s => s.id) || []);
            setIsEditing(true);
            setEditingId(fullPkg.id);
            setActiveTab('add');
            toast.dismiss(toastId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Failed to fetch package details:', error);
            toast.error('Failed to load package details', { id: toastId, ...toastStyle });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;
        try {
            await axiosInstance.delete(`/packages/${id}`);
            toast.success('Package deleted successfully', toastStyle);
            fetchPackages();
        } catch (error) {
            toast.error('Failed to delete package', toastStyle);
        }
    };

    const getPackageServicesDisplay = (pkg) => {
        if (!pkg) return '';
        if (pkg.services && pkg.services.length > 0) {
            return pkg.services.map(s => s.name).join(', ');
        }
        const sIds = pkg.serviceIds || [];
        if (sIds.length > 0 && services.length > 0) {
            return sIds
                .map(id => services.find(s => s.id === id)?.name)
                .filter(Boolean)
                .join(', ');
        }
        return '';
    };

    const getPackageServicesList = (pkg) => {
        if (!pkg) return [];
        if (pkg.services && pkg.services.length > 0) {
            return pkg.services;
        }
        const sIds = pkg.serviceIds || [];
        if (sIds.length > 0 && services.length > 0) {
            return sIds
                .map(id => services.find(s => s.id === id))
                .filter(Boolean);
        }
        return [];
    };

    const togglePackageStatus = async (id, currentActive) => {
        try {
            const isCurrentActive = currentActive !== false;
            const newActive = !isCurrentActive;
            await axiosInstance.put(`/packages/${id}/toggle`);
            toast.success(`Package ${newActive ? 'activated' : 'deactivated'} successfully!`, toastStyle);
            setPackages(prev =>
                prev.map(pkg =>
                    pkg.id === id ? { ...pkg, active: newActive } : pkg
                )
            );
        } catch (error) {
            console.error('Failed to toggle package:', error);
            toast.error('Failed to update package status.', toastStyle);
        }
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    return (
                <main className={`flex-1 p-6 md:p-8 md:border-l overflow-auto ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                    {/* Modern Segmented Navigation Tabs */}
                    <div className={`inline-flex p-1.5 rounded-2xl mb-8 border shadow-xs ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100/90 border-gray-200/80'
                    }`}>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === 'add'
                                    ? 'shadow-xs'
                                    : isDarkMode
                                    ? 'text-zinc-400 hover:text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                            style={activeTab === 'add' ? { backgroundColor: 'var(--brand-primary)', color: 'var(--color-button-text, #ffffff)' } : {}}
                        >
                            <PackagePlus className="w-4 h-4" />
                            <span>Add / Edit Package</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('view')}
                            className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === 'view'
                                    ? 'shadow-xs'
                                    : isDarkMode
                                    ? 'text-zinc-400 hover:text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                            style={activeTab === 'view' ? { backgroundColor: 'var(--brand-primary)', color: 'var(--color-button-text, #ffffff)' } : {}}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span>View All Packages ({packages.length})</span>
                        </button>
                    </div>

                    {activeTab === 'add' && (
                        <div className={`max-w-4xl mx-auto rounded-3xl transition-all duration-300 overflow-hidden border shadow-sm ${
                            isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200/80 text-gray-900'
                        }`}>
                            {/* Subtle Brand Accent Top Line */}
                            <div 
                                className="h-1.5 w-full"
                                style={{ background: 'linear-gradient(to right, var(--brand-primary), rgba(var(--brand-primary-rgb, 124, 58, 237), 0.3), transparent)' }}
                            />

                            {/* Clean, Standard Card Header */}
                            <div className={`px-8 pt-7 pb-6 border-b flex items-start gap-4 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                                <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                                    style={{ 
                                        backgroundColor: 'rgba(var(--brand-primary-rgb, 124, 58, 237), 0.1)',
                                        borderColor: 'rgba(var(--brand-primary-rgb, 124, 58, 237), 0.25)',
                                        color: 'var(--brand-primary)'
                                    }}
                                >
                                    <PackagePlus className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span 
                                        className="text-[10px] font-black uppercase tracking-widest block mb-1"
                                        style={{ color: 'var(--brand-primary)' }}
                                    >
                                        {isEditing ? 'PACKAGE CONFIGURATION' : 'BUNDLE & SAVE'}
                                    </span>
                                    <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {isEditing ? 'Edit Package' : 'Create New Package'}
                                    </h2>
                                    <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                        Combine popular salon services into high-converting discounted packages for your clients.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-7">
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Package Name *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all ${
                                                isDarkMode 
                                                    ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:bg-zinc-800' 
                                                    : 'bg-slate-50/70 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                                            }`}
                                            placeholder="e.g. Premium Bridal Glow Package"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                         <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Package Price (₹) *</label>
                                         <div className="relative">
                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                             <input
                                                 type="text"
                                                 inputMode="decimal"
                                                 name="packagePrice"
                                                 value={formData.packagePrice}
                                                 onChange={handleInputChange}
                                                 className={`w-full pl-9 pr-4 py-3.5 border rounded-xl text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all ${
                                                     isDarkMode 
                                                         ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:bg-zinc-800' 
                                                         : 'bg-slate-50/70 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                                                 }`}
                                                 placeholder="2999"
                                                 required
                                             />
                                             {priceError && <p className="text-red-500 text-xs mt-1 font-semibold">{priceError}</p>}
                                         </div>
                                    </div>

                                    <div>
                                         <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Total Services Value (₹)</label>
                                         <div className="relative">
                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                             <input
                                                 type="text"
                                                 readOnly
                                                 value={totalServicePrice.toFixed(2)}
                                                 className={`w-full pl-9 pr-4 py-3.5 border rounded-xl text-sm font-bold cursor-not-allowed ${
                                                     isDarkMode 
                                                         ? 'bg-zinc-800/40 border-zinc-800 text-zinc-400' 
                                                         : 'bg-gray-100/80 border-gray-200 text-gray-600'
                                                 }`}
                                             />
                                         </div>
                                    </div>

                                    <div>
                                         <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Discount / Savings (₹)</label>
                                         <div className="relative">
                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                             <input
                                                 type="text"
                                                 readOnly
                                                 value={
                                                     formData.packagePrice && parseFloat(formData.packagePrice) < totalServicePrice
                                                         ? (totalServicePrice - parseFloat(formData.packagePrice)).toFixed(2)
                                                         : '0.00'
                                                 }
                                                 className={`w-full pl-9 pr-4 py-3.5 border rounded-xl text-sm font-bold cursor-not-allowed ${
                                                     isDarkMode 
                                                         ? 'bg-zinc-800/40 border-zinc-800 text-emerald-400' 
                                                         : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-700'
                                                 }`}
                                             />
                                         </div>
                                    </div>
                                </div>

                                {totalServicePrice > 0 && formData.packagePrice && parseFloat(formData.packagePrice) < totalServicePrice && (
                                     <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                                             💰
                                         </div>
                                         <div>
                                             <p className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                                 Client Savings: ₹{(totalServicePrice - parseFloat(formData.packagePrice)).toFixed(2)}
                                             </p>
                                             <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                                 Combined regular price ₹{totalServicePrice.toFixed(0)} bundled for ₹{formData.packagePrice}
                                             </p>
                                         </div>
                                     </div>
                                 )}

                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Package Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`w-full border rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none ${
                                            isDarkMode 
                                                ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:bg-zinc-800' 
                                                : 'bg-slate-50/70 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
                                        }`}
                                        placeholder="Describe the package benefits, included treatments, and recommended clients..."
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                                            Select Included Services ({selectedServices.length} Selected)
                                        </label>
                                        {selectedServices.length > 0 && (
                                            <span className="text-xs font-bold" style={{ color: 'var(--brand-primary)' }}>
                                                Total Value: ₹{totalServicePrice.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`border rounded-2xl p-4 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-gray-200 bg-gray-50/60'}`}>
                                        <div className="relative mb-3">
                                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search services to bundle..."
                                                value={serviceSearch}
                                                onChange={(e) => setServiceSearch(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' 
                                                        : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            />
                                        </div>

                                        <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                            {filteredServices.length === 0 ? (
                                                <p className={`py-6 text-center text-xs col-span-2 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>No services found</p>
                                            ) : (
                                                filteredServices.map(service => {
                                                    const isSelected = selectedServices.includes(service.id);
                                                    return (
                                                        <label
                                                            key={service.id}
                                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${
                                                                isSelected 
                                                                    ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-xs' 
                                                                    : isDarkMode 
                                                                    ? 'bg-zinc-800/80 border-zinc-700/80 hover:border-zinc-600' 
                                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                                            }`}
                                                            style={isSelected ? { borderColor: 'var(--brand-primary)' } : {}}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleService(service.id)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                                style={{ accentColor: 'var(--brand-primary)' }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`font-bold text-xs truncate ${isSelected ? 'text-brand-primary' : isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`} style={isSelected ? { color: 'var(--brand-primary)' } : {}}>
                                                                    {service.name}
                                                                </div>
                                                                <div className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                                                    ₹{service.price}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Usage Limit per Customer</label>
                                        <input
                                            type="number"
                                            name="usageLimitPerCustomer"
                                            value={formData.usageLimitPerCustomer}
                                            onChange={handleInputChange}
                                            min="1"
                                            step="1"
                                            className={`w-full border rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all ${
                                                isDarkMode 
                                                    ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' 
                                                    : 'bg-slate-50/70 border-gray-200 text-gray-900 placeholder-gray-400'
                                            }`}
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Total Usage Limit</label>
                                        <input
                                            type="number"
                                            name="totalUsageLimit"
                                            value={formData.totalUsageLimit}
                                            onChange={handleInputChange}
                                            min="1"
                                            step="1"
                                            className={`w-full border rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all ${
                                                isDarkMode 
                                                    ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500' 
                                                    : 'bg-slate-50/70 border-gray-200 text-gray-900 placeholder-gray-400'
                                            }`}
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider mb-0.5">Availability Note</p>
                                        <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 font-medium leading-relaxed">
                                            This package bundle will remain active and bookable by clients until toggled inactive or deleted.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                                        style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--color-button-text, #ffffff)' }}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{isEditing ? 'Update Package' : 'Create Package'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className={`px-6 py-4 rounded-xl font-bold transition uppercase text-xs tracking-wider cursor-pointer border ${
                                            isDarkMode 
                                                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                                                : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        Discard Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ==================== VIEW PACKAGES ==================== */}
                    {activeTab === 'view' && (
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Packages</h2>

                                <div className="flex flex-wrap gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search packages..."
                                        value={filters.name}
                                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                        className={`border rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all w-80 shadow-sm ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-slate-500 hover:bg-zinc-700 focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 hover:bg-gray-50 focus:bg-white'}`}
                                    />
                                    <select
                                        value={filters.active}
                                        onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                                        className={`border rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all shadow-sm cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-900 hover:bg-gray-50 focus:bg-white'}`}
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {loadingPackages ? (
                                <div className={`text-center py-20 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Loading packages...</div>
                            ) : packages.length === 0 ? (
                                <div className={`text-center py-20 border rounded-3xl shadow-sm ${isDarkMode ? 'text-zinc-400 bg-zinc-900 border-zinc-700' : 'text-gray-500 bg-white border-gray-100'}`}>
                                    No packages found
                                </div>
                            ) : (
                                <>
                                <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${sidebarOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
                                    {packages.map(pkg => {
                                        const pkgServices = getPackageServicesList(pkg);
                                        const totalServicesVal = pkgServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
                                        const savingsVal = totalServicesVal > pkg.packagePrice ? totalServicesVal - pkg.packagePrice : 0;

                                        return (
                                            <div
                                                key={pkg.id}
                                                className={`border border-l-4 border-l-brand-primary rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}
                                                style={{ borderLeftColor: 'var(--brand-primary)' }}
                                            >
                                                {/* Subtle top indicator bar */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary/10 group-hover:bg-brand-primary/20 transition-colors duration-300"></div>

                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h3 className={`font-extrabold text-xl group-hover:text-brand-primary transition-colors duration-300 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={pkg.name}>
                                                                {pkg.name}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                                            <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-colors ${pkg.active ? 'bg-green-55 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                                                {pkg.active ? 'ACTIVE' : 'INACTIVE'}
                                                            </span>
                                                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pkg.active !== false}
                                                                    onChange={() => togglePackageStatus(pkg.id, pkg.active)}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-baseline mt-4">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-black text-brand-primary" style={{ color: 'var(--brand-primary)' }}>₹{pkg.packagePrice}</span>
                                                            {totalServicesVal > pkg.packagePrice && (
                                                                <span className="text-sm text-gray-400 line-through font-semibold">₹{totalServicesVal.toFixed(0)}</span>
                                                            )}
                                                        </div>
                                                        {savingsVal > 0 && (
                                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                                Save ₹{savingsVal.toFixed(0)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className={`mt-4 line-clamp-3 text-xs font-medium leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                                        {pkg.description || "No description provided."}
                                                    </p>

                                                    {/* Services list */}
                                                    {pkgServices.length > 0 && (
                                                        <div className="mt-5">
                                                            <span className={`text-[9px] font-bold uppercase tracking-wider block mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Services Included</span>
                                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                                                {pkgServices.map(service => (
                                                                    <span key={service.id} className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}>
                                                                        {service.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`mt-6 pt-4 border-t flex items-center gap-2 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                                                     <button
                                                         onClick={() => handleEdit(pkg)}
                                                         className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold transition-all py-2.5 rounded-xl border cursor-pointer ${
                                                             isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-700' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                         }`}
                                                     >
                                                         <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                                         <span>Edit</span>
                                                     </button>
                                                     <button
                                                         onClick={() => handleDelete(pkg.id)}
                                                         className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                                                             isDarkMode ? 'border-zinc-700 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30' : 'border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                                                         }`}
                                                         title="Delete package"
                                                     >
                                                         <Trash2 className="w-3.5 h-3.5" />
                                                     </button>
                                                 </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* PAGINATION FOOTER */}
                                <div className={`max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'}`}>
                                    <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                                        PAGE {totalPages === 0 ? 1 : currentPage + 1} OF {totalPages} ({totalElements} TOTAL PACKAGES)
                                    </span>
                                    <div className="flex items-center space-x-1.5">
                                        <button
                                            onClick={() => fetchPackages(0)}
                                            disabled={currentPage <= 0}
                                            className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                        >
                                            « First
                                        </button>
                                        <button
                                            onClick={() => fetchPackages(Math.max(0, currentPage - 1))}
                                            disabled={currentPage <= 0}
                                            className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                        >
                                            ‹ Prev
                                        </button>
                                        
                                        {/* Current Page Indicator Pill */}
                                        <span className="px-3.5 py-1.5 bg-brand-primary text-white text-[10px] font-black rounded-lg" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                            {totalPages === 0 ? 1 : currentPage + 1}
                                        </span>

                                        <button
                                            onClick={() => fetchPackages(Math.min(Math.max(0, totalPages - 1), currentPage + 1))}
                                            disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                            className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                        >
                                            Next ›
                                        </button>
                                        <button
                                            onClick={() => fetchPackages(Math.max(0, totalPages - 1))}
                                            disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                            className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:hover:bg-zinc-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:hover:bg-white'}`}
                                        >
                                            Last »
                                        </button>
                                    </div>
                                </div>
                                </>
                            )}
                        </div>
                    )}
                </main>
    );
};

export default AddPackages;