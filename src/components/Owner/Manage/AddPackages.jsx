import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from '../Layouts/ManageSideBar';
import axiosInstance from '../../../api/axiosInstance';

// Icons
import productDetailsIcon from '../../../assets/Owner/Manage/Products/product_details_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Products/percentage_icon.svg';
import rateIcon from '../../../assets/Owner/Manage/Products/rate_icon.svg';

const toastStyle = {
    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
};

const AddPackages = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('add');

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

    const [services, setServices] = useState([]);
    const [serviceSearch, setServiceSearch] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [totalServicePrice, setTotalServicePrice] = useState(0);

    // View Packages State
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [filters, setFilters] = useState({
        name: '',
        active: '',
        discountType: ''
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

    const fetchPackages = useCallback(async () => {
        setLoadingPackages(true);
        try {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.active !== '') params.append('active', filters.active);
            if (filters.discountType) params.append('discountType', filters.discountType);

            const res = await axiosInstance.get(`/packages/search?${params.toString()}`);
            setPackages(res.data?.content || []);
        } catch (error) {
            toast.error('Failed to load packages', toastStyle);
        } finally {
            setLoadingPackages(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    useEffect(() => {
        if (activeTab === 'view') fetchPackages();
    }, [activeTab, fetchPackages]);

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

        if (name === 'discountValue') {
            const numValue = parseFloat(value) || 0;
            if (formData.discountType === 'PERCENTAGE') {
                newValue = Math.min(numValue, 100).toString();
            } else if (formData.discountType === 'FLAT' && totalServicePrice > 0) {
                newValue = Math.min(numValue, totalServicePrice).toString();
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleDiscountTypeChange = (e) => {
        const newType = e.target.value;
        setFormData(prev => ({
            ...prev,
            discountType: newType,
            discountValue: ''
        }));
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.packagePrice || formData.serviceIds.length === 0) {
            toast.error("Package Name, Price & at least one Service are required", toastStyle);
            return;
        }

        if (parseFloat(formData.packagePrice) <= 0) {
            toast.error("Package price must be greater than 0", toastStyle);
            return;
        }

        if (formData.discountType && (!formData.discountValue || parseFloat(formData.discountValue) <= 0)) {
            toast.error("Discount value must be greater than 0", toastStyle);
            return;
        }

        if (formData.usageLimitPerCustomer && parseInt(formData.usageLimitPerCustomer) <= 0) {
            toast.error("Usage limit per customer must be greater than 0", toastStyle);
            return;
        }

        if (formData.totalUsageLimit && parseInt(formData.totalUsageLimit) <= 0) {
            toast.error("Total usage limit must be greater than 0", toastStyle);
            return;
        }

        const payload = {
            ...formData,
            packagePrice: parseFloat(formData.packagePrice),
            discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
            usageLimitPerCustomer: formData.usageLimitPerCustomer ? parseInt(formData.usageLimitPerCustomer) : null,
            totalUsageLimit: formData.totalUsageLimit ? parseInt(formData.totalUsageLimit) : null,
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
            discountType: pkg.discountType || '',
            discountValue: pkg.discountValue || '',
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

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full items-stretch">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab="Add Packages" onTabChange={() => { }} />

                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    {/* Tabs */}
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

                    {/* ==================== ADD / EDIT FORM ==================== */}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Package Price (₹)</label>
                                        <div className="relative">
                                            <img src={rateIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" alt="" />
                                            <input
                                                type="number"
                                                name="packagePrice"
                                                value={formData.packagePrice}
                                                onChange={handleInputChange}
                                                min="0.01"
                                                step="any"
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                                placeholder="2999"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

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

                                {/* Services Selection - Improved */}
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

                                {/* Discount Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discount Type</label>
                                        <div className="relative">
                                            <select
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleDiscountTypeChange}
                                                className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 appearance-none cursor-pointer"
                                            >
                                                <option value="">No Discount</option>
                                                <option value="PERCENTAGE">Percentage Off</option>
                                                <option value="FLAT">Flat Amount Off</option>
                                            </select>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Discount Value {formData.discountType === 'PERCENTAGE' ? '(in %)' : '(in ₹)'}
                                        </label>
                                        <div className="relative">
                                            <img src={percentageIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" alt="" />
                                            <input
                                                type="number"
                                                name="discountValue"
                                                value={formData.discountValue}
                                                onChange={handleInputChange}
                                                min="0.01"
                                                step="any"
                                                max={formData.discountType === 'PERCENTAGE' ? 100 : totalServicePrice}
                                                className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Limits */}
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
                                <h2 className="text-3xl font-bold">All Packages</h2>

                                <div className="flex flex-wrap gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search packages..."
                                        value={filters.name}
                                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                        className="border border-gray-300 rounded-xl px-5 py-3 w-80"
                                    />
                                    <select
                                        value={filters.active}
                                        onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                                        className="border border-gray-300 rounded-xl px-5 py-3"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                    <select
                                        value={filters.discountType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, discountType: e.target.value }))}
                                        className="border border-gray-300 rounded-xl px-5 py-3"
                                    >
                                        <option value="">All Discounts</option>
                                        <option value="PERCENTAGE">Percentage</option>
                                        <option value="FLAT">Flat</option>
                                    </select>
                                </div>
                            </div>

                            {loadingPackages ? (
                                <div className="text-center py-20">Loading packages...</div>
                            ) : packages.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">No packages found</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {packages.map(pkg => (
                                        <div key={pkg.id} className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-2xl">{pkg.name}</h3>
                                                    <p className="text-4xl font-bold text-red-600 mt-2">₹{pkg.packagePrice}</p>
                                                </div>
                                                <span className={`text-xs font-bold px-4 py-2 rounded-full ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {pkg.active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>

                                            {pkg.discountType && (
                                                <p className="mt-3 text-lg font-medium">
                                                    {pkg.discountType === 'PERCENTAGE' ? `${pkg.discountValue}% OFF` : `₹${pkg.discountValue} OFF`}
                                                </p>
                                            )}

                                            <p className="mt-4 text-gray-600 line-clamp-3 text-sm leading-relaxed">
                                                {pkg.description}
                                            </p>

                                            <div className="mt-8 flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(pkg)}
                                                    className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl font-semibold hover:bg-black transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg.id)}
                                                    className="flex-1 border border-red-200 text-red-600 py-3.5 rounded-2xl font-semibold hover:bg-red-50 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default AddPackages;