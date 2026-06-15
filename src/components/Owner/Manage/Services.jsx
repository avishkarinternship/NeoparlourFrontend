import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

// Icons
import priceIcon from '../../../assets/Owner/Manage/Services/price_icon.svg';
import serviceNameIcon from '../../../assets/Owner/Manage/Services/service_name_icon.svg';
import durationIcon from '../../../assets/Owner/Manage/Services/duration_icon.svg';
import categoryIcon from '../../../assets/Owner/Manage/Services/category_icon.svg';

// Staff Icons
import nameIcon from '../../../assets/Owner/Manage/Staff/name_icon.svg';
import genderIcon from '../../../assets/Owner/Manage/Staff/gender_icon.svg';
import specialtyIcon from '../../../assets/Owner/Manage/Staff/speciality_icon.svg';
import dateIcon from '../../../assets/Owner/Manage/Staff/BirthDateIcon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';
import idIcon from '../../../assets/Owner/Manage/Staff/team_member_icon.svg';

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
    iconTheme: {
        primary: '#ff0b01',
        secondary: '#fff',
    }
};

const Service = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    // ==================== SERVICE STATES ====================
    const [serviceName, setServiceName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [editingServiceId, setEditingServiceId] = useState(null);

    // Search / Filter states
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [hasSearched, setHasSearched] = useState(true);
    const [filteredServices, setFilteredServices] = useState([]);



    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/services');
            const allServices = response.data || [];
            setServices(allServices);

            const filtered = allServices.filter(service => {
                const matchesName = !searchName.trim() || service.name?.toLowerCase().includes(searchName.trim().toLowerCase());
                const matchesCategory = !searchCategory || service.category?.toLowerCase() === searchCategory.toLowerCase();
                return matchesName && matchesCategory;
            });
            setFilteredServices(filtered);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchServices = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            const response = await axiosInstance.get('/services');
            const allServices = response.data || [];
            setServices(allServices);

            const filtered = allServices.filter(service => {
                const matchesName = !searchName.trim() || service.name?.toLowerCase().includes(searchName.trim().toLowerCase());
                const matchesCategory = !searchCategory || service.category?.toLowerCase() === searchCategory.toLowerCase();
                return matchesName && matchesCategory;
            });
            setFilteredServices(filtered);
        } catch (error) {
            console.error('Failed to search services:', error);
            toast.error('Failed to load services', toastStyle);
            setFilteredServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // ==================== FORM VALIDATION ====================
    const validateServiceForm = () => {
        const errors = {};

        if (!serviceName?.trim()) {
            errors.serviceName = "Service name is required";
        } else if (serviceName.trim().length < 3) {
            errors.serviceName = "Service name must be at least 3 characters";
        } else if (serviceName.trim().length > 100) {
            errors.serviceName = "Service name cannot exceed 100 characters";
        }

        if (!category) {
            errors.category = "Please select a category";
        }

        const priceNum = parseFloat(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            errors.price = "Price must be a positive number";
        } else if (priceNum >= 100000) {
            errors.price = "Price cannot exceed ₹99,999";
        }

        const durationNum = parseInt(duration, 10);
        if (!duration || isNaN(durationNum) || durationNum < 5 || durationNum > 480) {
            errors.duration = "Duration must be between 5 and 480 minutes";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetServiceForm = () => {
        setServiceName('');
        setCategory('');
        setPrice('');
        setDuration('');
        setFormErrors({});
        setEditingServiceId(null);
    };

    const handleEditService = (service) => {
        setServiceName(service.name || '');
        setCategory(service.category || '');
        setPrice(service.price?.toString() || '');
        setDuration(service.duration?.toString() || '');
        setEditingServiceId(service.id);
        setFormErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (location.state?.serviceId) {
            axiosInstance.get(`/services/${location.state.serviceId}`)
                .then(res => {
                    handleEditService(res.data);
                })
                .catch(err => {
                    console.error("Failed to load service details for edit:", err);
                });
        }
    }, [location.state?.serviceId]);

    const handleServiceSave = async (e) => {
        e.preventDefault();

        if (!validateServiceForm()) {
            toast.error("Please fix the errors in the form", toastStyle);
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                name: serviceName.trim(),
                category: category,
                duration: parseInt(duration, 10),
                price: parseFloat(price),
                active: true
            };

            if (editingServiceId) {
                // Update using /services/{id}
                await axiosInstance.put(`/services/${editingServiceId}`, payload);
                toast.success('Service updated successfully!', toastStyle);
            } else {
                // Create new service
                await axiosInstance.post('/services', payload);
                toast.success('Service saved successfully!', toastStyle);
            }

            resetServiceForm();
            setHasSearched(true);
            fetchServices();
        } catch (error) {
            const errMsg = error.response?.data?.message ||
                (editingServiceId ? 'Failed to update service.' : 'Failed to save service.');
            toast.error(errMsg, toastStyle);
        } finally {
            setSubmitting(false);
        }
    };

    // ==================== TOGGLE SERVICE STATUS ====================
    const toggleServiceStatus = async (id, currentActive) => {
        try {
            const isCurrentActive = currentActive !== false;
            const newActive = !isCurrentActive;
            await axiosInstance.put(`/services/${id}/toggle?active=${newActive}`);

            toast.success(`Service ${newActive ? 'activated' : 'deactivated'} successfully!`, toastStyle);

            setServices(prev =>
                prev.map(service =>
                    service.id === id ? { ...service, active: newActive } : service
                )
            );
            setFilteredServices(prev =>
                prev.map(service =>
                    service.id === id ? { ...service, active: newActive } : service
                )
            );
        } catch (error) {
            console.error('Failed to toggle service:', error);
            toast.error('Failed to update service status.', toastStyle);
            setHasSearched(true);
            fetchServices();
        }
    };



    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar />

                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* ==================== SERVICE TAB ==================== */}
                        <>
                                <div className="inline-block border-b-2 border-red-600 pb-2 mb-6">
                                    <div className="flex items-center space-x-2 text-gray-900">
                                        <span className="text-xl font-light leading-none select-none tracking-tight">+</span>
                                        <span className="text-[13px] font-bold uppercase tracking-wider">
                                            {editingServiceId ? 'Edit Service' : 'Add Service'}
                                        </span>
                                    </div>
                                </div>

                                <div className="max-w-3xl border border-gray-100 rounded-3xl p-8 bg-white shadow-md hover:shadow-lg transition-all duration-300 mb-8">
                                    <form onSubmit={handleServiceSave} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="relative">
                                                <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                    <img src={serviceNameIcon} alt="Service Name" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="Service Name"
                                                        value={serviceName}
                                                        onChange={(e) => {
                                                            setServiceName(e.target.value);
                                                            if (formErrors.serviceName) setFormErrors(prev => ({ ...prev, serviceName: '' }));
                                                        }}
                                                        className="w-full text-sm font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                                    />
                                                </div>
                                                {formErrors.serviceName && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.serviceName}</p>}
                                            </div>

                                            <div className="relative">
                                                <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                    <img src={categoryIcon} alt="Category" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <select
                                                        value={category}
                                                        onChange={(e) => {
                                                            setCategory(e.target.value);
                                                            if (formErrors.category) setFormErrors(prev => ({ ...prev, category: '' }));
                                                        }}
                                                        className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                                                    >
                                                        <option value="" disabled hidden>Category</option>
                                                        <option value="Hair Cut">Hair Cut</option>
                                                        <option value="Skin Care">Skin Care</option>
                                                        <option value="Shaving">Shaving</option>
                                                        <option value="Hair Styling">Hair Styling</option>
                                                    </select>
                                                    <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                                </div>
                                                {formErrors.category && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.category}</p>}
                                            </div>

                                            <div className="relative">
                                                <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                    <img src={priceIcon} alt="Price" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Price"
                                                        value={price}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                                            const occurrences = (val.match(/\./g) || []).length;
                                                            if (occurrences > 1) return;
                                                            const parts = val.split('.');
                                                            if (parts[0].length > 5) return;
                                                            setPrice(val);
                                                            if (parts[0].length === 5) {
                                                                setFormErrors(prev => ({ ...prev, price: "Maximum price limit reached (5 digits)" }));
                                                            } else {
                                                                setFormErrors(prev => ({ ...prev, price: "" }));
                                                            }
                                                        }}
                                                        className="w-full text-sm font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                                    />
                                                </div>
                                                {formErrors.price && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.price}</p>}
                                            </div>

                                            <div className="relative">
                                                <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                    <img src={durationIcon} alt="Duration" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="Duration (in minutes)"
                                                        value={duration}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            setDuration(val);
                                                            if (formErrors.duration) setFormErrors(prev => ({ ...prev, duration: '' }));
                                                        }}
                                                        className="w-full text-sm font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                                    />
                                                </div>
                                                {formErrors.duration && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.duration}</p>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 text-xs font-bold uppercase tracking-wider">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full sm:flex-1 bg-[#FF0B01] text-white py-4 rounded-2xl hover:bg-red-700 transition active:scale-[0.985] shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Saving...' : editingServiceId ? 'Update Service' : 'Save Service'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={resetServiceForm}
                                                className="w-full sm:flex-1 border border-gray-300 text-gray-700 py-4 rounded-2xl hover:bg-gray-50 transition"
                                            >
                                                {editingServiceId ? 'Discard' : 'Cancel'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                 {/* Services List */}
                                 <div>
                                     {/* Search Filters */}
                                     <form onSubmit={handleSearchServices} className="max-w-3xl bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
                                         <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">Search Filters</h4>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                             {/* Name filter */}
                                             <div className="space-y-1.5">
                                                 <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Service Name</label>
                                                 <input 
                                                     type="text" 
                                                     placeholder="Filter by Name" 
                                                     value={searchName} 
                                                     onChange={(e) => setSearchName(e.target.value)} 
                                                     className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all" 
                                                 />
                                             </div>

                                             {/* Category filter */}
                                             <div className="space-y-1.5">
                                                 <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Category</label>
                                                 <select 
                                                     value={searchCategory} 
                                                     onChange={(e) => setSearchCategory(e.target.value)} 
                                                     className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all cursor-pointer"
                                                 >
                                                     <option value="">All Categories</option>
                                                     <option value="Hair Cut">Hair Cut</option>
                                                     <option value="Skin Care">Skin Care</option>
                                                     <option value="Shaving">Shaving</option>
                                                     <option value="Hair Styling">Hair Styling</option>
                                                 </select>
                                             </div>
                                         </div>

                                         {/* Action Buttons */}
                                         <div className="flex justify-end gap-3 mt-5">
                                             <button 
                                                 type="button" 
                                                 onClick={() => {
                                                     setSearchName('');
                                                     setSearchCategory('');
                                                 }} 
                                                 className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                                             >
                                                 Clear Filters
                                             </button>
                                             <button 
                                                 type="submit" 
                                                 className="px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#FF0B01] rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                                             >
                                                 Search
                                             </button>
                                         </div>
                                     </form>

                                     <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">All Services</h3>
                                     
                                     {!hasSearched ? (
                                         <div className="text-center py-20 text-gray-500 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 max-w-3xl">
                                             <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                             </svg>
                                             <h4 className="text-base font-bold text-gray-800">Search Services</h4>
                                             <p className="text-xs font-semibold text-gray-400 max-w-md mx-auto">Use the filters above and click Search to display the services list.</p>
                                         </div>
                                     ) : loading ? (
                                         <div className="py-10 flex flex-col items-center justify-center gap-2 max-w-3xl">
                                             <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                             <span className="text-xs font-semibold text-gray-400">Loading services...</span>
                                         </div>
                                     ) : (
                                         <div className={`grid gap-4 max-w-3xl ${sidebarOpen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                             {filteredServices.length > 0 ? (
                                                 filteredServices.map((service) => {
                                                // Local theme helper for category styles
                                                const getCategoryTheme = (cat) => {
                                                    switch (cat) {
                                                        case 'Hair Cut':
                                                            return {
                                                                accent: 'bg-[#FF0B01]',
                                                                bg: 'bg-red-50/70',
                                                                text: 'text-[#FF0B01]',
                                                                border: 'border-red-100/50',
                                                            };
                                                        case 'Skin Care':
                                                            return {
                                                                accent: 'bg-amber-400',
                                                                bg: 'bg-amber-50/70',
                                                                text: 'text-amber-700',
                                                                border: 'border-amber-100/50',
                                                            };
                                                        case 'Shaving':
                                                            return {
                                                                accent: 'bg-blue-400',
                                                                bg: 'bg-blue-50/70',
                                                                text: 'text-blue-700',
                                                                border: 'border-blue-100/50',
                                                            };
                                                        default:
                                                            return {
                                                                accent: 'bg-green-400',
                                                                bg: 'bg-green-50/70',
                                                                text: 'text-green-700',
                                                                border: 'border-green-100/50',
                                                            };
                                                    }
                                                };
                                                const theme = getCategoryTheme(service.category);

                                                return (
                                                     <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300 relative overflow-hidden group pl-7 gap-4">
                                                         {/* Sleek Vertical Accent stripe */}
                                                         <div className={`absolute left-0 top-0 bottom-0 w-1.25 ${theme.accent} rounded-r-md`}></div>
                                                         
                                                         {/* Left section: Service Details */}
                                                         <div className="flex items-center space-x-3.5 min-w-0 flex-1 w-full">
                                                             {/* Category themed avatar box */}
                                                             <div className={`w-11 h-11 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center ${theme.text} font-black text-sm uppercase flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                                                                 {service.name?.charAt(0) || 'S'}
                                                             </div>
                                                             <div className="min-w-0 flex-1">
                                                                 <h4 className="text-sm font-semibold text-gray-900 tracking-tight truncate mb-1" title={service.name}>
                                                                     {service.name}
                                                                 </h4>
                                                                 <div className="flex flex-wrap items-center gap-2">
                                                                     {/* Category Tag */}
                                                                     <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-gray-100">
                                                                         {service.category}
                                                                     </span>
                                                                     {/* Duration Badge */}
                                                                     <span className="flex items-center text-[10px] font-semibold text-gray-400 gap-1 flex-shrink-0">
                                                                         <img src={durationIcon} alt="Duration" className="w-3.5 h-3.5 opacity-40 object-contain" />
                                                                         {service.duration} mins
                                                                     </span>
                                                                 </div>
                                                             </div>
                                                         </div>

                                                         {/* Right section: Price & Controls */}
                                                         <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-gray-50 pt-3 sm:pt-0 sm:border-t-0">
                                                             <div className="text-left sm:text-right pr-1 flex-shrink-0">
                                                                 <p className="text-[16px] font-bold text-gray-900 tracking-tight">₹{service.price}</p>
                                                             </div>

                                                             <div className="flex items-center gap-3">
                                                                 {/* Circular icon button for edit */}
                                                                 <button
                                                                     onClick={() => handleEditService(service)}
                                                                     className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#FF0B01] bg-gray-50/50 hover:bg-red-55 rounded-full border border-gray-100 hover:border-red-100 transition-all duration-200 flex-shrink-0 cursor-pointer"
                                                                     title="Edit Service"
                                                                 >
                                                                     <img src={editIcon} alt="Edit" className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                                                 </button>

                                                                 {/* Premium active/inactive switch */}
                                                                 <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={service.active !== false}
                                                                    onChange={() => toggleServiceStatus(service.id, service.active)}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-11 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-[#FF0B01] transition-colors duration-200"></div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                        ) : (
                                            <div className="col-span-full py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                No services found
                                            </div>
                                        )}
                                    </div>
                                )}
                                 </div>
                            </>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Service;