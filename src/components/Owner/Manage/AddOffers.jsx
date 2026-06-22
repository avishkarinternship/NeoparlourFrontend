import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

// Icons
import couponCodeIcon from '../../../assets/Owner/Manage/Offers/coupon_code.svg';
import offerDetailsIcon from '../../../assets/Owner/Manage/Offers/offer_details_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Offers/percentage_icon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';

const toastStyle = {
    style: {
        background: '#1a1a1a',
        color: '#fff',
        borderRadius: '16px',
        padding: '20px 24px',
        fontSize: '15px',
        fontWeight: '600',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        minWidth: '350px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    iconTheme: { primary: '#ff0b01', secondary: '#fff' }
};

const DISCOUNT_TYPES = [
    { value: 'PERCENTAGE', label: 'Percentage Off' },
    { value: 'FLAT', label: 'Flat Amount Off' }
];

const AddOffers = () => {
    const location = useLocation();

    const [activeFilter, setActiveFilter] = useState('all');
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

    // Form States
    const [editingOfferId, setEditingOfferId] = useState(null);

    const [offerName, setOfferName] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');
    const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState('');
    const [totalUsageLimit, setTotalUsageLimit] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [initialSelectedIds, setInitialSelectedIds] = useState([]);
    const [discountError, setDiscountError] = useState('');

    const [activeServices, setActiveServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const [offers, setOffers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch Active Services
    const fetchActiveServices = async () => {
        try {
            setLoadingServices(true);
            const response = await axiosInstance.get('/services/active');
            setActiveServices(response.data || []);
        } catch (error) {
            toast.error('Failed to load services', toastStyle);
        } finally {
            setLoadingServices(false);
        }
    };

    // Fetch Offers List
    const fetchOffers = async (page = currentPage) => {
        try {
            setLoadingOffers(true);
            const params = new URLSearchParams();
            if (activeFilter === 'active') params.append('active', 'true');
            else if (activeFilter === 'inactive') params.append('active', 'false');
            params.append('page', page);
            params.append('size', '10');
            params.append('sortBy', 'id');
            params.append('direction', 'desc');

            const response = await axiosInstance.get(`/offers/search?${params.toString()}`);
            setOffers(response.data?.content || response.data || []);
            setTotalPages(response.data?.page?.totalPages ?? response.data?.totalPages ?? 0);
            setTotalElements(response.data?.page?.totalElements ?? response.data?.totalElements ?? 0);
            setCurrentPage(page);
        } catch (error) {
            toast.error('Failed to load offers', toastStyle);
            setOffers([]);
        } finally {
            setLoadingOffers(false);
        }
    };

    useEffect(() => {
        fetchActiveServices();
    }, []);

    useEffect(() => {
        if (activeTab === 'view') {
            fetchOffers(0);
        }
    }, [activeTab, activeFilter]);

    const toggleService = (serviceId) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const totalOriginalPrice = selectedServices.reduce((sum, id) => {
        const service = activeServices.find(s => s.id === id);
        return sum + (service?.price || 0);
    }, 0);

    const discountAmount = discountType === 'PERCENTAGE' && discountValue
        ? (totalOriginalPrice * parseFloat(discountValue)) / 100
        : (parseFloat(discountValue) || 0);

    const finalPrice = Math.max(0, totalOriginalPrice - discountAmount);

    const handleDiscountValueChange = (value) => {
        let val = value.replace(/[^0-9.]/g, '');
        const occurrences = (val.match(/\./g) || []).length;
        if (occurrences > 1) return;

        if (discountType === 'PERCENTAGE') {
            const numValue = parseFloat(val) || 0;
            const newVal = Math.min(numValue, 100).toString();
            setDiscountValue(newVal);
            setDiscountError("");
        } else if (discountType === 'FLAT') {
            const parts = val.split('.');
            if (parts[0].length > 5) return;
            setDiscountValue(val);
            if (parts[0].length === 5) {
                setDiscountError("Maximum discount limit reached (5 digits)");
            } else {
                setDiscountError("");
            }
        } else {
            setDiscountValue(val);
            setDiscountError("");
        }
    };

    const toInstant = (datetimeLocal) => {
        if (!datetimeLocal) return null;
        return datetimeLocal + ':00Z';
    };

    const resetForm = () => {
        setOfferName('');
        setDescription('');
        setDiscountType('PERCENTAGE');
        setDiscountValue('');
        setValidFrom('');
        setValidTo('');
        setUsageLimitPerCustomer('');
        setTotalUsageLimit('');
        setSelectedServices([]);
        setInitialSelectedIds([]);
        setEditingOfferId(null);
        setDiscountError('');
    };

    // Fetch Full Offer Data for Editing + Pre-select Services
    const handleEdit = async (offer) => {
        setLoadingEdit(true);
        try {
            const response = await axiosInstance.get(`/offers/${offer.id}`);
            const fullOffer = response.data;

            setEditingOfferId(fullOffer.id);
            setOfferName(fullOffer.name || '');
            setDescription(fullOffer.description || '');
            setDiscountType(fullOffer.discountType || 'PERCENTAGE');
            setDiscountValue(fullOffer.discountValue?.toString() || fullOffer.percentage?.toString() || '');
            setUsageLimitPerCustomer(fullOffer.usageLimitPerCustomer?.toString() || '');
            setTotalUsageLimit(fullOffer.totalUsageLimit?.toString() || '');

            if (fullOffer.validFrom) {
                setValidFrom(fullOffer.validFrom.slice(0, 16));
            }
            if (fullOffer.validTo) {
                setValidTo(fullOffer.validTo.slice(0, 16));
            }

            const serviceIds = fullOffer.applicableServices
                ? fullOffer.applicableServices.map(s => s.id)
                : [];
            setSelectedServices(serviceIds);
            setInitialSelectedIds(serviceIds);
            setActiveTab('add');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to load offer details', toastStyle);
        } finally {
            setLoadingEdit(false);
        }
    };

    useEffect(() => {
        if (location.state?.editOfferId) {
            handleEdit({ id: location.state.editOfferId });
        }
    }, [location.state?.editOfferId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!offerName?.trim() || !discountValue || !validFrom || !validTo) {
            toast.error("Please fill all required fields", toastStyle);
            return;
        }

        if (offerName.trim().length > 100) {
            toast.error("Offer name cannot exceed 100 characters", toastStyle);
            return;
        }

        if (selectedServices.length === 0) {
            toast.error("Please select at least one service", toastStyle);
            return;
        }

        const discVal = parseFloat(discountValue);
        if (isNaN(discVal) || discVal <= 0) {
            toast.error("Discount value must be greater than 0", toastStyle);
            return;
        }

        if (discVal >= 100000) {
            toast.error("Discount value cannot exceed ₹99,999", toastStyle);
            return;
        }

        if (discountType === 'PERCENTAGE' && discVal > 100) {
            toast.error("Percentage discount cannot exceed 100%", toastStyle);
            return;
        }

        if (discountType === 'FLAT' && discVal > totalOriginalPrice) {
            toast.error(`Flat discount cannot exceed total service price (₹${totalOriginalPrice})`, toastStyle);
            return;
        }

        if (new Date(validTo) <= new Date(validFrom)) {
            toast.error("Valid To date must be after Valid From date", toastStyle);
            return;
        }

        if (usageLimitPerCustomer) {
            const limitVal = parseInt(usageLimitPerCustomer, 10);
            if (isNaN(limitVal) || limitVal <= 0) {
                toast.error("Usage limit per customer must be greater than 0", toastStyle);
                return;
            }
        }

        if (totalUsageLimit) {
            const totalVal = parseInt(totalUsageLimit, 10);
            if (isNaN(totalVal) || totalVal <= 0) {
                toast.error("Total usage limit must be greater than 0", toastStyle);
                return;
            }
            if (usageLimitPerCustomer && totalVal < parseInt(usageLimitPerCustomer, 10)) {
                toast.error("Total usage limit cannot be less than usage limit per customer", toastStyle);
                return;
            }
        }

        setLoadingSubmit(true);

        const payload = {
            name: offerName.trim(),
            description: description.trim(),
            discountType: discountType,
            discountValue: parseFloat(discountValue),
            validFrom: toInstant(validFrom),
            validTo: toInstant(validTo),
            active: true,
            applicableServiceIds: selectedServices,
            usageLimitPerCustomer: usageLimitPerCustomer ? parseInt(usageLimitPerCustomer) : null,
            totalUsageLimit: totalUsageLimit ? parseInt(totalUsageLimit) : null,
        };

        try {
            if (editingOfferId) {
                await axiosInstance.put(`/offers/${editingOfferId}`, payload);
            } else {
                await axiosInstance.post('/offers', payload);
            }

            resetForm();
            setActiveTab('view');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save offer', toastStyle);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleCancel = () => {
        resetForm();
    };

    // Helper to get discount value safely (handles both discountValue and percentage)
    const getDiscountDisplay = (offer) => {
        if (!offer) return '';

        const value = offer.discountValue ?? offer.percentage ?? 0;

        if (offer.discountType === 'PERCENTAGE' || offer.percentage !== undefined) {
            return `${value}% OFF`;
        }
        return `₹${value} OFF`;
    };

    // Helper to get service names display for an offer card
    const getOfferServicesDisplay = (offer) => {
        if (!offer) return '';
        // 1. Check services array from API structure
        if (offer.services && offer.services.length > 0) {
            return offer.services.map(s => s.name).join(', ');
        }
        // 2. If applicableServices exists and has items
        if (offer.applicableServices && offer.applicableServices.length > 0) {
            return offer.applicableServices.map(s => s.name).join(', ');
        }
        // 3. Fallback to lookup from activeServices via applicableServiceIds
        const serviceIds = offer.applicableServiceIds || [];
        if (serviceIds.length > 0 && activeServices.length > 0) {
            return serviceIds
                .map(id => activeServices.find(s => s.id === id)?.name)
                .filter(Boolean)
                .join(', ');
        }
        return '';
    };

    const toggleOfferStatus = async (id, currentActive) => {
        try {
            const isCurrentActive = currentActive !== false;
            const newActive = !isCurrentActive;
            await axiosInstance.put(`/offers/${id}/toggle`);
            toast.success(`Offer ${newActive ? 'activated' : 'deactivated'} successfully!`, toastStyle);
            setOffers(prev =>
                prev.map(offer =>
                    offer.id === id ? { ...offer, active: newActive } : offer
                )
            );
        } catch (error) {
            console.error('Failed to toggle offer:', error);
            toast.error('Failed to update offer status.', toastStyle);
        }
    };

    const sortedServices = [...activeServices].sort((a, b) => {
        const aSelected = initialSelectedIds.includes(a.id);
        const bSelected = initialSelectedIds.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
                    <div className="max-w-5xl mx-auto">
                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-10 max-w-md border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`flex-1 px-6 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'add' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Add / Edit Offer
                            </button>
                            <button
                                onClick={() => setActiveTab('view')}
                                className={`flex-1 px-6 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'view' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                View Offers
                            </button>
                        </div>

                        {activeTab === 'add' && (
                            <>
                                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#FF0B01] font-bold text-lg">
                                %
                            </div>
                            <div>
                                <span className="text-[12px] font-extrabold uppercase tracking-widest text-red-600 block">
                                    {editingOfferId ? 'Edit Mode' : 'Creation Mode'}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                                    {editingOfferId ? 'Edit Offer Details' : 'Add New Offer'}
                                </h2>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 mb-12">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <img src={offerDetailsIcon} alt="Details" className="w-5 h-5 opacity-55" />
                                        </div>
                                        <input
                                            type="text"
                                            value={offerName}
                                            onChange={(e) => setOfferName(e.target.value)}
                                            placeholder="Offer Name *"
                                            className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <img src={couponCodeIcon} alt="Coupon" className="w-5 h-5 opacity-55" />
                                        </div>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Description"
                                            className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Discount */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <img src={percentageIcon} alt="%" className="w-5 h-5 opacity-55" />
                                        </div>
                                        <select
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                            className="w-full pl-12 pr-10 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 appearance-none cursor-pointer"
                                        >
                                            {DISCOUNT_TYPES.map(dt => (
                                                <option key={dt.value} value={dt.value}>{dt.label}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                    </div>

                                    <div>
                                         <div className="relative">
                                             <input
                                                 type="text"
                                                 inputMode="decimal"
                                                 value={discountValue}
                                                 onChange={(e) => handleDiscountValueChange(e.target.value)}
                                                 placeholder="Discount Value *"
                                                 className="w-full px-5 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                                 required
                                             />
                                         </div>
                                         {discountError && <p className="text-red-500 text-xs mt-1 ml-1">{discountError}</p>}
                                     </div>

                                    <div>
                                        <input
                                            type="number"
                                            value={usageLimitPerCustomer}
                                            onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
                                            placeholder="Usage Limit per Customer"
                                            min="1"
                                            step="1"
                                            className="w-full px-5 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <input
                                        type="number"
                                        value={totalUsageLimit}
                                        onChange={(e) => setTotalUsageLimit(e.target.value)}
                                        placeholder="Total Usage Limit (Optional)"
                                        min="1"
                                        step="1"
                                        className="w-full px-5 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                    />
                                </div>

                                {/* Validity */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Valid From *</label>
                                        <input
                                            type="datetime-local"
                                            value={validFrom}
                                            onChange={(e) => setValidFrom(e.target.value)}
                                            className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Valid To *</label>
                                        <input
                                            type="datetime-local"
                                            value={validTo}
                                            onChange={(e) => setValidTo(e.target.value)}
                                            className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Services + Price Breakdown */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">
                                        Applicable Services * ({selectedServices.length} selected)
                                    </label>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 bg-gray-50/30 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-2 shadow-inner">
                                        {loadingServices ? (
                                            <p className="text-gray-500">Loading services...</p>
                                        ) : activeServices.length === 0 ? (
                                            <p className="text-gray-500">No active services available</p>
                                        ) : (
                                            sortedServices.map(service => (
                                                <label
                                                    key={service.id}
                                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedServices.includes(service.id)}
                                                            onChange={() => toggleService(service.id)}
                                                            className="w-4 h-4 accent-red-600"
                                                        />
                                                        <span className="text-sm">{service.name}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">₹{service.price || 0}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>

                                    {selectedServices.length > 0 && discountValue && (
                                        <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                                            <h4 className="font-semibold text-green-800 mb-3">Price Breakdown</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Original Total</span>
                                                    <span className="font-medium">₹{totalOriginalPrice.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-600">
                                                    <span>Discount Amount</span>
                                                    <span>- ₹{discountAmount.toFixed(2)}</span>
                                                </div>
                                                <hr className="border-gray-200 my-2" />
                                                <div className="flex justify-between font-bold text-lg text-gray-900">
                                                    <span>Final Price After Discount</span>
                                                    <span>₹{finalPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                                    <span className="text-amber-500 text-lg leading-none mt-0.5">⚠️</span>
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">Disclaimer</p>
                                        <p className="text-[11px] text-amber-700/95 font-medium leading-relaxed">
                                            This offer will be for a limited period and will expire automatically on the specified end date.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={loadingSubmit || loadingEdit}
                                        className="flex-1 bg-[#FF0B01] hover:bg-red-700 disabled:opacity-70 transition-all text-white py-4 rounded-2xl font-bold shadow-md hover:shadow-lg active:scale-[0.985] text-sm tracking-wider uppercase"
                                    >
                                        {loadingSubmit ? 'Saving...' : editingOfferId ? 'Update Offer' : 'Create Offer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 border border-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm tracking-wider uppercase"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </form>
                        </div>
                            </>
                        )}

                        {activeTab === 'view' && (
                            <>
                                {/* Existing Offers */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Existing Offers</h3>
                            <div className="flex gap-2">
                                {['all', 'active', 'inactive'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === filter ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingOffers ? (
                            <div className="text-center py-12">Loading offers...</div>
                        ) : offers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white border border-gray-100 rounded-2xl">
                                No offers found
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${sidebarOpen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                {offers.map((offer) => (
                                    <div key={offer.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                        {/* Subtle top indicator bar */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF0B01]/10 group-hover:bg-[#FF0B01] transition-colors duration-300"></div>
                                        
                                        <div className="flex justify-between items-start mt-2">
                                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#FF0B01] transition-colors duration-300">{offer.name}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full ${offer.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                                    {offer.active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={offer.active !== false}
                                                        onChange={() => toggleOfferStatus(offer.id, offer.active)}
                                                        className="sr-only peer"
                                                    />
                                                     <div className="w-11 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-[#FF0B01] transition-colors duration-200"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{offer.description}</p>
                                        
                                        {/* Services list */}
                                        {getOfferServicesDisplay(offer) && (
                                            <div className="mt-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Services Included</span>
                                                <span className="text-xs font-semibold text-gray-700 mt-0.5 block whitespace-normal break-words" title={getOfferServicesDisplay(offer)}>
                                                    {getOfferServicesDisplay(offer)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="mt-5 flex justify-between items-center">
                                            <div className="px-3 py-1 bg-red-50 text-[#FF0B01] rounded-xl text-xs font-black tracking-wider uppercase">
                                                {getDiscountDisplay(offer)}
                                            </div>

                                            <button
                                                onClick={() => handleEdit(offer)}
                                                disabled={loadingEdit}
                                                className="flex items-center gap-1.5 text-gray-700 hover:text-[#FF0B01] text-xs font-bold transition-all disabled:opacity-60 bg-gray-50 hover:bg-red-50 px-3.5 py-2 rounded-xl border border-gray-100"
                                            >
                                                <img src={editIcon} alt="edit" className="w-3.5 h-3.5" />
                                                {loadingEdit ? 'Loading...' : 'Edit Offer'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PAGINATION FOOTER */}
                        {!loadingOffers && (
                            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-gray-150">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                    PAGE {totalPages === 0 ? 1 : currentPage + 1} OF {totalPages} ({totalElements} TOTAL OFFERS)
                                </span>
                                <div className="flex items-center space-x-1.5">
                                    <button
                                        onClick={() => fetchOffers(0)}
                                        disabled={currentPage <= 0}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                    >
                                        « First
                                    </button>
                                    <button
                                        onClick={() => fetchOffers(Math.max(0, currentPage - 1))}
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
                                        onClick={() => fetchOffers(Math.min(Math.max(0, totalPages - 1), currentPage + 1))}
                                        disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                    >
                                        Next ›
                                    </button>
                                    <button
                                        onClick={() => fetchOffers(Math.max(0, totalPages - 1))}
                                        disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                    >
                                        Last »
                                    </button>
                                </div>
                            </div>
                        )}
                            </>
                        )}
                    </div>
                </main>
    );
};

export default AddOffers;