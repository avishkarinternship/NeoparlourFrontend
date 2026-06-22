import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';


import axiosInstance from '../../../api/axiosInstance';

// Icons
import productDetailsIcon from '../../../assets/Owner/Manage/Products/product_details_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Products/percentage_icon.svg';
import rateIcon from '../../../assets/Owner/Manage/Products/rate_icon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const AddPackages = () => {

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

    const handleEdit = (pkg) => {
        setFormData({
            name: pkg.name || '',
            description: pkg.description || '',
            packagePrice: pkg.packagePrice || '',
            active: pkg.active !== false,
            serviceIds: pkg.services?.map(s => s.id) || [],
            usageLimitPerCustomer: pkg.usageLimitPerCustomer || '',
            totalUsageLimit: pkg.totalUsageLimit || ''
        });
        setSelectedServices(pkg.services?.map(s => s.id) || []);
        setIsEditing(true);
        setEditingId(pkg.id);
        setActiveTab('add');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <main className="flex-1 p-6 md:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-10 max-w-md border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 px-6 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'add' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Add / Edit Package
                        </button>
                        <button
                            onClick={() => setActiveTab('view')}
                            className={`flex-1 px-6 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'view' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            View All Packages
                        </button>
                    </div>

                    {activeTab === 'add' && (
                        <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[32px] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#FF0B01] via-red-650 to-orange-600 text-white px-8 py-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
                                <h2 className="text-3xl font-black tracking-tight">
                                    {isEditing ? 'Edit Package' : 'Create New Package'}
                                </h2>
                                <p className="text-red-100/90 text-sm mt-1">Fill in the details below to publish this bundle</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Package Name</label>
                                        <div className="relative">
                                            <img src={productDetailsIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" alt="" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                                placeholder="Premium Bridal Glow Package"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Package Price (₹)</label>
                                         <div className="relative">
                                             <img src={rateIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" alt="" />
                                             <input
                                                 type="text"
                                                 inputMode="decimal"
                                                 name="packagePrice"
                                                 value={formData.packagePrice}
                                                 onChange={handleInputChange}
                                                 className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                                 placeholder="2999"
                                                 required
                                             />
                                             {priceError && <p className="text-red-500 text-xs mt-1 ml-1">{priceError}</p>}
                                         </div>
                                    </div>

                                    <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Services Value (₹)</label>
                                         <div className="relative">
                                             <img src={rateIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" alt="" />
                                             <input
                                                 type="text"
                                                 readOnly
                                                 value={totalServicePrice.toFixed(2)}
                                                 className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-100 rounded-2xl text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                                             />
                                         </div>
                                    </div>

                                    <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discount Price / Savings (₹)</label>
                                         <div className="relative">
                                              <img src={rateIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" alt="" />
                                             <input
                                                 type="text"
                                                 readOnly
                                                 value={
                                                     formData.packagePrice && parseFloat(formData.packagePrice) < totalServicePrice
                                                         ? (totalServicePrice - parseFloat(formData.packagePrice)).toFixed(2)
                                                         : '0.00'
                                                 }
                                                 className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-100 rounded-2xl text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                                             />
                                         </div>
                                    </div>
                                </div>

                                {totalServicePrice > 0 && formData.packagePrice && parseFloat(formData.packagePrice) < totalServicePrice && (
                                     <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                                         <div className="text-emerald-600 text-xl leading-none">💰</div>
                                         <div>
                                             <p className="font-extrabold text-[11px] text-emerald-700 uppercase tracking-wider">Discounted Savings: ₹{(totalServicePrice - parseFloat(formData.packagePrice)).toFixed(2)}</p>
                                             <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Actual Value: ₹{totalServicePrice} → Package: ₹{formData.packagePrice}</p>
                                         </div>
                                     </div>
                                 )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                        placeholder="Describe the package benefits and included services..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Services</label>

                                    <div className="border border-gray-300 rounded-2xl p-4 bg-gray-50">
                                        <input
                                            type="text"
                                            placeholder="Search services..."
                                            value={serviceSearch}
                                            onChange={(e) => setServiceSearch(e.target.value)}
                                            className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-xl focus:border-red-500"
                                        />

                                        <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {filteredServices.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center col-span-2">No services found</p>
                                            ) : (
                                                filteredServices.map(service => (
                                                    <label
                                                        key={service.id}
                                                        className="flex items-center gap-3 p-3 bg-white border border-gray-100 hover:border-gray-200 rounded-xl cursor-pointer transition group shadow-sm"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedServices.includes(service.id)}
                                                            onChange={() => toggleService(service.id)}
                                                            className="w-5 h-5 accent-red-600 flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm truncate">{service.name}</div>
                                                            <div className="text-xs text-gray-500">₹{service.price}</div>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>

                                        {selectedServices.length > 0 && (
                                            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                                                Selected: <span className="font-semibold text-red-600">{selectedServices.length}</span> services |
                                                Total Value: <span className="font-semibold">₹{totalServicePrice}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usage Limit per Customer</label>
                                        <input
                                            type="number"
                                            name="usageLimitPerCustomer"
                                            value={formData.usageLimitPerCustomer}
                                            onChange={handleInputChange}
                                            min="1"
                                            step="1"
                                            className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Usage Limit</label>
                                        <input
                                            type="number"
                                            name="totalUsageLimit"
                                            value={formData.totalUsageLimit}
                                            onChange={handleInputChange}
                                            min="1"
                                            step="1"
                                            className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                                    <span className="text-amber-500 text-lg leading-none mt-0.5">⚠️</span>
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">Disclaimer</p>
                                        <p className="text-[11px] text-amber-700/95 font-medium leading-relaxed">
                                            This package will be available until and unless disabled manually.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#FF0B01] hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-95 uppercase text-sm tracking-wider"
                                    >
                                        {isEditing ? 'Update Package' : 'Create Package'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 border border-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-50 transition uppercase text-sm tracking-wider"
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
                                <h2 className="text-3xl font-black tracking-tight text-gray-900">All Packages</h2>

                                <div className="flex flex-wrap gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search packages..."
                                        value={filters.name}
                                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                        className="border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all w-80 shadow-sm"
                                    />
                                    <select
                                        value={filters.active}
                                        onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                                        className="border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {loadingPackages ? (
                                <div className="text-center py-20 text-gray-500 font-medium">Loading packages...</div>
                            ) : packages.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 bg-white border border-gray-100 rounded-3xl shadow-sm">
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
                                                className="bg-white border border-gray-200 border-l-4 border-l-[#FF0B01] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                                            >
                                                {/* Subtle top indicator bar */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF0B01]/5 group-hover:bg-[#FF0B01]/10 transition-colors duration-300"></div>

                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-[#FF0B01] transition-colors duration-300 truncate" title={pkg.name}>
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
                                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF0B01]"></div>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-baseline mt-4">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-3xl font-black text-[#FF0B01]">₹{pkg.packagePrice}</span>
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

                                                    <p className="mt-4 text-gray-500 line-clamp-3 text-xs font-medium leading-relaxed">
                                                        {pkg.description || "No description provided."}
                                                    </p>

                                                    {/* Services list */}
                                                    {pkgServices.length > 0 && (
                                                        <div className="mt-5">
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Services Included</span>
                                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                                                {pkgServices.map(service => (
                                                                    <span key={service.id} className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition-colors">
                                                                        {service.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                                                    <button
                                                        onClick={() => handleEdit(pkg)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 text-gray-700 hover:text-[#FF0B01] hover:bg-red-50 text-xs font-bold transition-all bg-gray-50 py-3 rounded-xl border border-gray-150"
                                                    >
                                                        <img src={editIcon} alt="edit" className="w-3.5 h-3.5 opacity-70" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pkg.id)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 text-red-650 hover:bg-red-100 text-xs font-bold transition-all border border-red-200 py-3 rounded-xl"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* PAGINATION FOOTER */}
                                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-gray-150">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                                        PAGE {totalPages === 0 ? 1 : currentPage + 1} OF {totalPages} ({totalElements} TOTAL PACKAGES)
                                    </span>
                                    <div className="flex items-center space-x-1.5">
                                        <button
                                            onClick={() => fetchPackages(0)}
                                            disabled={currentPage <= 0}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                        >
                                            « First
                                        </button>
                                        <button
                                            onClick={() => fetchPackages(Math.max(0, currentPage - 1))}
                                            disabled={currentPage <= 0}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                        >
                                            ‹ Prev
                                        </button>
                                        
                                        {/* Current Page Indicator Pill */}
                                        <span className="px-3.5 py-1.5 bg-[#FF0B01] text-white text-[10px] font-black rounded-lg">
                                            {totalPages === 0 ? 1 : currentPage + 1}
                                        </span>

                                        <button
                                            onClick={() => fetchPackages(Math.min(Math.max(0, totalPages - 1), currentPage + 1))}
                                            disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                        >
                                            Next ›
                                        </button>
                                        <button
                                            onClick={() => fetchPackages(Math.max(0, totalPages - 1))}
                                            disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
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