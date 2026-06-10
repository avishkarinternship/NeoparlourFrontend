import React, { useState, useEffect } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

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

    const [activeServices, setActiveServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const [offers, setOffers] = useState([]);

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
    const fetchOffers = async () => {
        try {
            setLoadingOffers(true);
            let url = '/offers/search';
            if (activeFilter === 'active') url += '?active=true';
            else if (activeFilter === 'inactive') url += '?active=false';

            const response = await axiosInstance.get(url);
            setOffers(response.data?.content || response.data || []);
        } catch (error) {
            toast.error('Failed to load offers', toastStyle);
            setOffers([]);
        } finally {
            setLoadingOffers(false);
        }
    };

    useEffect(() => {
        fetchActiveServices();
        fetchOffers();
    }, [activeFilter]);

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
        setEditingOfferId(null);
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

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to load offer details', toastStyle);
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!offerName || !discountValue || !validFrom || !validTo || selectedServices.length === 0) {
            toast.error("Please fill all required fields and select at least one service", toastStyle);
            return;
        }

        if (parseFloat(discountValue) <= 0) {
            toast.error("Discount value must be greater than 0", toastStyle);
            return;
        }

        if (usageLimitPerCustomer && parseInt(usageLimitPerCustomer) <= 0) {
            toast.error("Usage limit per customer must be greater than 0", toastStyle);
            return;
        }

        if (totalUsageLimit && parseInt(totalUsageLimit) <= 0) {
            toast.error("Total usage limit must be greater than 0", toastStyle);
            return;
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
            fetchOffers();
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

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full items-stretch">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab="Add Offers" onTabChange={() => { }} />

                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    <div className="max-w-5xl mx-auto">
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
                                        <input
                                            type="number"
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                            placeholder="Discount Value *"
                                            min="0.01"
                                            step="any"
                                            className="w-full px-5 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                                            required
                                        />
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
                                            activeServices.map(service => (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {offers.map((offer) => (
                                    <div key={offer.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                        {/* Subtle top indicator bar */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF0B01]/10 group-hover:bg-[#FF0B01] transition-colors duration-300"></div>
                                        
                                        <div className="flex justify-between items-start mt-2">
                                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#FF0B01] transition-colors duration-300">{offer.name}</h4>
                                            <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full ${offer.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                                {offer.active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{offer.description}</p>
                                        
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
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default AddOffers;