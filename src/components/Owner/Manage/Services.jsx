import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

const PREDEFINED_CATEGORIES = {
    "Hair Services": [
        "Hair Cut", "Hair Styling", "Hair Wash", "Blow Dry", "Hair Coloring", 
        "Highlights / Streaks", "Hair Spa", "Keratin Treatment", 
        "Hair Smoothening", "Hair Straightening", "Perming / Curling", "Hair Extensions"
    ],
    "Skin Care": [
        "Facial", "Cleanup", "Skin Polishing", "Bleaching", "De-Tan Treatment", 
        "Face Treatment", "Anti-Aging Treatment", "Acne Treatment", 
        "Skin Brightening Treatment", "Chemical Peel"
    ],
    "Hair Removal": [
        "Waxing", "Full Body Waxing", "Eyebrow Shaping", "Eyebrow Styling", "Eyelash Services", "Upper Lip", "Forehead", "Full Face Waxing"
    ],
    "Nail Care": [
        "Manicure", "Pedicure", "Nail Cutting", "Nail Shaping", "Nail Art", 
        "Nail Extensions", "Gel Polish"
    ],
    "Makeup": [
        "Party Makeup", "Bridal Makeup", "Engagement Makeup", "Reception Makeup", 
        "HD Makeup", "Basic Makeup"
    ],
    "Grooming": [
        "Beard Trim", "Beard Styling", "Shaving", "Moustache Styling", "Basic Grooming"
    ],
    "Spa & Massage": [
        "Relaxation Massage", "Aroma Therapy", "Head Massage", "Body Massage", "Body Scrub", "Body Wrap"
    ],
    "Bridal Packages": [
        "Bridal Hair", "Bridal Makeup", "Bridal Facial", "Bridal Manicure/Pedicure", 
        "Pre-Bridal Package"
    ],
    "Hair Treatment": [
        "Hair Treatment"
    ]
};

const getNormalisedCategory = (cat) => {
    if (!cat) return '';
    const lower = cat.toLowerCase().trim();
    if (lower === 'hair services' || lower === 'hair') return 'Hair Services';
    if (lower === 'skin care' || lower === 'skin') return 'Skin Care';
    if (lower === 'hair removal' || lower === 'waxing') return 'Hair Removal';
    if (lower === 'nail care' || lower === 'nails') return 'Nail Care';
    if (lower === 'makeup') return 'Makeup';
    if (lower === 'grooming' || lower === 'unisex') return 'Grooming';
    if (lower === 'spa & massage' || lower === 'spa' || lower === 'massage') return 'Spa & Massage';
    if (lower === 'bridal packages' || lower === 'bridal') return 'Bridal Packages';
    if (lower === 'hair treatment') return 'Hair Treatment';
    if (lower === 'face') return 'Hair Removal';
    if (lower === 'body') return 'Spa & Massage';
    
    const match = [
        "Hair Services", "Skin Care", "Hair Removal", "Nail Care", 
        "Makeup", "Grooming", "Spa & Massage", "Bridal Packages", "Hair Treatment"
    ].find(c => c.toLowerCase() === lower || c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()));
    
    return match || cat;
};

const Service = () => {
    const location = useLocation();


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
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [selectedServiceName, setSelectedServiceName] = useState('');
    const [customServiceName, setCustomServiceName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [editingServiceId, setEditingServiceId] = useState(null);

    // Search / Filter states
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [hasSearched, setHasSearched] = useState(true);
    const [filteredServices, setFilteredServices] = useState([]);

    // Drag and Drop reordering states
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dndMode, setDndMode] = useState('shift'); // 'shift' or 'swap'
    const [dndLoading, setDndLoading] = useState(false);



    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/services/categories');
            const cats = (response.data || []).map(c => typeof c === 'object' ? c.name : c);
            if (cats.length > 0) {
                setCategories(cats);
                return;
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
        // Fallback to static master categories list
        setCategories(["Hair Services", "Skin Care", "Hair Removal", "Nail Care", "Makeup", "Grooming", "Spa & Massage", "Bridal Packages", "Hair Treatment"]);
    };

    const handleSwapServices = async (serviceId1, serviceId2) => {
        try {
            await axiosInstance.put(`/services/swap-priority?serviceId1=${serviceId1}&serviceId2=${serviceId2}`);
            toast.success('Service priorities updated successfully!', toastStyle);
            fetchServices();
        } catch (error) {
            console.error('Failed to swap priorities:', error);
            toast.error(error.response?.data?.message || 'Failed to update service priority.', toastStyle);
        }
    };

    const handleSwapCategories = async (cat1, cat2) => {
        const newCats = [...categories];
        const idx1 = newCats.indexOf(cat1);
        const idx2 = newCats.indexOf(cat2);
        if (idx1 === -1 || idx2 === -1) return;
        newCats[idx1] = cat2;
        newCats[idx2] = cat1;
        setCategories(newCats);
        try {
            await axiosInstance.put('/services/categories/reorder', newCats);
            toast.success('Category priorities updated successfully!', toastStyle);
        } catch (error) {
            console.error('Failed to reorder categories:', error);
            toast.error(error.response?.data?.message || 'Failed to update category priority.', toastStyle);
            fetchCategories(); // revert
        }
    };

    // ==================== DRAG & DROP SERVICE REORDERING ====================
    const handleServiceDragStart = (e, index) => {
        if (dndLoading) {
            e.preventDefault();
            return;
        }
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleServiceDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleServiceDragLeave = (e, index) => {
        if (dragOverIndex === index) {
            setDragOverIndex(null);
        }
    };

    const handleServiceDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleServiceDrop = async (e, targetIndex) => {
        e.preventDefault();
        if (dndLoading || draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const sourceService = filteredServices[draggedIndex];
        const targetService = filteredServices[targetIndex];
        if (!sourceService || !targetService) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const fullSourceIdx = services.findIndex(s => s.id === sourceService.id);
        const fullTargetIdx = services.findIndex(s => s.id === targetService.id);
        if (fullSourceIdx === -1 || fullTargetIdx === -1) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        setDndLoading(true);

        const previousServices = [...services];
        const previousFiltered = [...filteredServices];

        const updatedFull = [...services];
        const updatedFiltered = [...filteredServices];

        if (dndMode === 'shift') {
            // Shifting: remove source and insert at target
            const [movedItem] = updatedFull.splice(fullSourceIdx, 1);
            updatedFull.splice(fullTargetIdx, 0, movedItem);

            const [movedFiltered] = updatedFiltered.splice(draggedIndex, 1);
            updatedFiltered.splice(targetIndex, 0, movedFiltered);
        } else {
            // Swapping: swap positions
            updatedFull[fullSourceIdx] = services[fullTargetIdx];
            updatedFull[fullTargetIdx] = services[fullSourceIdx];

            updatedFiltered[draggedIndex] = filteredServices[targetIndex];
            updatedFiltered[targetIndex] = filteredServices[draggedIndex];
        }

        // Apply optimistic updates
        setServices(updatedFull);
        setFilteredServices(updatedFiltered);
        setDraggedIndex(null);
        setDragOverIndex(null);

        if (dndMode === 'shift') {
            try {
                const orderedIds = updatedFull.map(s => s.id);
                await axiosInstance.put('/services/reorder', orderedIds);
                toast.success('Services reordered successfully!', toastStyle);
            } catch (error) {
                console.error('Failed to reorder services:', error);
                toast.error(error.response?.data?.message || 'Failed to reorder services.', toastStyle);
                // Rollback
                setServices(previousServices);
                setFilteredServices(previousFiltered);
            } finally {
                setDndLoading(false);
            }
        } else {
            try {
                await axiosInstance.put(`/services/swap-priority?serviceId1=${sourceService.id}&serviceId2=${targetService.id}`);
                toast.success('Service priorities swapped successfully!', toastStyle);
            } catch (error) {
                console.error('Failed to swap priorities:', error);
                toast.error(error.response?.data?.message || 'Failed to swap service priorities.', toastStyle);
                // Rollback
                setServices(previousServices);
                setFilteredServices(previousFiltered);
            } finally {
                setDndLoading(false);
            }
        }
    };

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
        fetchCategories();
    }, []);

    // ==================== FORM VALIDATION ====================
    const validateServiceForm = () => {
        const errors = {};

        const finalCategory = selectedCategory;
        const finalServiceName = (selectedCategory === 'Other' || selectedServiceName === 'Other') ? customServiceName.trim() : selectedServiceName;

        if (!finalCategory) {
            errors.category = "Please select a category";
        }

        if (!finalServiceName) {
            errors.serviceName = "Please select or type a service name";
        } else if (finalServiceName.length < 3) {
            errors.serviceName = "Service name must be at least 3 characters";
        } else if (finalServiceName.length > 100) {
            errors.serviceName = "Service name cannot exceed 100 characters";
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
        setSelectedCategory('');
        setCustomCategory('');
        setSelectedServiceName('');
        setCustomServiceName('');
        setPrice('');
        setDuration('');
        setFormErrors({});
        setEditingServiceId(null);
    };

    const handleEditService = (service) => {
        const rawCat = service.category || '';
        const cat = getNormalisedCategory(rawCat);
        const name = service.name || '';

        // Determine Category mapping
        if (PREDEFINED_CATEGORIES[cat]) {
            setSelectedCategory(cat);
            setCustomCategory('');

            // Determine Service Name mapping
            if (PREDEFINED_CATEGORIES[cat].includes(name)) {
                setSelectedServiceName(name);
                setCustomServiceName('');
            } else {
                setSelectedServiceName('Other');
                setCustomServiceName(name);
            }
        } else {
            // Unrecognized category fallback: try case-insensitive or default to Hair Services
            const fallbackCat = Object.keys(PREDEFINED_CATEGORIES).find(c => c.toLowerCase() === cat.toLowerCase()) || 'Hair Services';
            setSelectedCategory(fallbackCat);
            setCustomCategory('');
            setSelectedServiceName('Other');
            setCustomServiceName(name);
        }

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

        const finalCategory = selectedCategory;
        const finalServiceName = selectedServiceName === 'Other' ? customServiceName.trim() : selectedServiceName;

        try {
            const payload = {
                name: finalServiceName,
                category: finalCategory,
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
                <main className="flex-1 p-6 md:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
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
                                            {/* Category Option (GIVEN FIRST) */}
                                            <div className="relative">
                                                <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                    <img src={categoryIcon} alt="Category" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <select
                                                        value={selectedCategory}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setSelectedCategory(val);
                                                            setSelectedServiceName('');
                                                            setCustomCategory('');
                                                            setCustomServiceName('');
                                                            if (formErrors.category) setFormErrors(prev => ({ ...prev, category: '' }));
                                                            if (formErrors.serviceName) setFormErrors(prev => ({ ...prev, serviceName: '' }));
                                                        }}
                                                        className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                                                    >
                                                        <option value="" disabled hidden>Category</option>
                                                        {Object.keys(PREDEFINED_CATEGORIES).map((catName) => (
                                                            <option key={catName} value={catName}>{catName}</option>
                                                        ))}
                                                    </select>
                                                    <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                                </div>
                                                {formErrors.category && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.category}</p>}
                                            </div>
 
                                            {/* Predefined Service Select (Only if selectedCategory is predefined and not 'Other') */}
                                            {selectedCategory && selectedCategory !== 'Other' && (
                                                <div className="relative">
                                                    <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                        <img src={serviceNameIcon} alt="Service Name" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                        <select
                                                            value={selectedServiceName}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setSelectedServiceName(val);
                                                                if (val !== 'Other') {
                                                                    setCustomServiceName('');
                                                                }
                                                                if (formErrors.serviceName) setFormErrors(prev => ({ ...prev, serviceName: '' }));
                                                            }}
                                                            className="w-full text-sm font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer"
                                                        >
                                                            <option value="" disabled hidden>Service Name</option>
                                                            {(PREDEFINED_CATEGORIES[selectedCategory] || []).map((srvName) => (
                                                                <option key={srvName} value={srvName}>{srvName}</option>
                                                            ))}
                                                            <option value="Other">Other (Type Custom Service)</option>
                                                        </select>
                                                        <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                                    </div>
                                                    {formErrors.serviceName && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.serviceName}</p>}
                                                </div>
                                            )}
 
                                            {/* Custom Service Name Input (If selectedCategory === 'Other' OR selectedServiceName === 'Other') */}
                                            {(selectedCategory === 'Other' || selectedServiceName === 'Other') && (
                                                <div className="relative">
                                                    <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                        <img src={serviceNameIcon} alt="Service Name" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                        <input
                                                            type="text"
                                                            placeholder="Custom Service Name"
                                                            value={customServiceName}
                                                            onChange={(e) => {
                                                                setCustomServiceName(e.target.value);
                                                                if (formErrors.serviceName) setFormErrors(prev => ({ ...prev, serviceName: '' }));
                                                            }}
                                                            className="w-full text-sm font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                                        />
                                                    </div>
                                                    {formErrors.serviceName && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.serviceName}</p>}
                                                </div>
                                            )}
 
                                            {/* Price Input */}
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
 
                                            {/* Duration Input */}
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
                                                     {Array.from(new Set([
                                                         ...categories,
                                                         ...services.map(s => getNormalisedCategory(s.category)).filter(Boolean)
                                                     ])).map(catName => (
                                                         <option key={catName} value={catName}>{catName}</option>
                                                     ))}
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

                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 max-w-3xl">
                                         <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">All Services</h3>
                                         <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1 shadow-sm text-xs font-bold uppercase select-none">
                                             <button 
                                                 type="button" 
                                                 onClick={() => setDndMode('shift')}
                                                 className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${dndMode === 'shift' ? 'bg-[#FF0B01] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                             >
                                                 Shift Mode
                                             </button>
                                             <button 
                                                 type="button" 
                                                 onClick={() => setDndMode('swap')}
                                                 className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${dndMode === 'swap' ? 'bg-[#FF0B01] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                             >
                                                 Swap Mode
                                             </button>
                                         </div>
                                     </div>
                                     
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
                                                 filteredServices.map((service, index) => {
                                                     const getCategoryTheme = (cat) => {
                                                         const norm = (cat || '').toLowerCase().trim();
                                                         if (norm.includes('hair services')) {
                                                             return {
                                                                 accent: 'bg-[#FF0B01]',
                                                                 bg: 'bg-red-50/70',
                                                                 text: 'text-[#FF0B01]',
                                                                 border: 'border-red-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('hair treatment')) {
                                                             return {
                                                                 accent: 'bg-orange-500',
                                                                 bg: 'bg-orange-50/70',
                                                                 text: 'text-orange-700',
                                                                 border: 'border-orange-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('skin care')) {
                                                             return {
                                                                 accent: 'bg-amber-500',
                                                                 bg: 'bg-amber-50/70',
                                                                 text: 'text-amber-700',
                                                                 border: 'border-amber-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('hair removal')) {
                                                             return {
                                                                 accent: 'bg-purple-500',
                                                                 bg: 'bg-purple-50/70',
                                                                 text: 'text-purple-700',
                                                                 border: 'border-purple-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('nail care')) {
                                                             return {
                                                                 accent: 'bg-teal-500',
                                                                 bg: 'bg-teal-50/70',
                                                                 text: 'text-teal-700',
                                                                 border: 'border-teal-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('makeup')) {
                                                             return {
                                                                 accent: 'bg-rose-500',
                                                                 bg: 'bg-rose-50/70',
                                                                 text: 'text-rose-700',
                                                                 border: 'border-rose-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('grooming')) {
                                                             return {
                                                                 accent: 'bg-blue-500',
                                                                 bg: 'bg-blue-50/70',
                                                                 text: 'text-blue-700',
                                                                 border: 'border-blue-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('spa & massage')) {
                                                             return {
                                                                 accent: 'bg-emerald-500',
                                                                 bg: 'bg-emerald-50/70',
                                                                 text: 'text-emerald-700',
                                                                 border: 'border-emerald-100/50',
                                                             };
                                                         }
                                                         if (norm.includes('bridal')) {
                                                             return {
                                                                 accent: 'bg-pink-500',
                                                                 bg: 'bg-pink-50/70',
                                                                 text: 'text-pink-700',
                                                                 border: 'border-pink-100/50',
                                                             };
                                                         }
                                                         return {
                                                             accent: 'bg-gray-400',
                                                             bg: 'bg-gray-50/70',
                                                             text: 'text-gray-700',
                                                             border: 'border-gray-100/50',
                                                         };
                                                     };
                                                     const theme = getCategoryTheme(service.category);

                                                return (
                                                     <div 
                                                         key={service.id} 
                                                         draggable
                                                         onDragStart={(e) => handleServiceDragStart(e, index)}
                                                         onDragOver={(e) => handleServiceDragOver(e, index)}
                                                         onDragLeave={(e) => handleServiceDragLeave(e, index)}
                                                         onDragEnd={handleServiceDragEnd}
                                                         onDrop={(e) => handleServiceDrop(e, index)}
                                                         className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border rounded-3xl hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300 relative overflow-hidden group pl-7 gap-4 cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'opacity-40 border-dashed border-red-300 scale-[0.98]' : dragOverIndex === index ? 'border-2 border-[#FF0B01] bg-red-50/10' : 'border-gray-100'}`}
                                                     >
                                                         {/* Sleek Vertical Accent stripe */}
                                                         <div className={`absolute left-0 top-0 bottom-0 w-1.25 ${theme.accent} rounded-r-md`}></div>
                                                         
                                                         {/* Left section: Service Details */}
                                                         <div className="flex items-center space-x-3.5 min-w-0 flex-1 w-full">
                                                             {/* Drag Handle Icon */}
                                                             <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing mr-1 select-none text-base">
                                                                 ☰
                                                             </div>
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

                                                             <div className="flex items-center gap-2">
                                                                  {/* Priority swap: Move Up */}
                                                                  <button
                                                                      onClick={() => {
                                                                          const idx = filteredServices.findIndex(s => s.id === service.id);
                                                                          if (idx > 0) handleSwapServices(service.id, filteredServices[idx - 1].id);
                                                                      }}
                                                                      disabled={filteredServices.findIndex(s => s.id === service.id) === 0}
                                                                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 bg-gray-50/50 hover:bg-blue-50 rounded-lg border border-gray-100 hover:border-blue-100 transition-all duration-200 flex-shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                                                      title="Move Up"
                                                                  >▲</button>
                                                                  {/* Priority swap: Move Down */}
                                                                  <button
                                                                      onClick={() => {
                                                                          const idx = filteredServices.findIndex(s => s.id === service.id);
                                                                          if (idx < filteredServices.length - 1) handleSwapServices(service.id, filteredServices[idx + 1].id);
                                                                      }}
                                                                      disabled={filteredServices.findIndex(s => s.id === service.id) === filteredServices.length - 1}
                                                                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 bg-gray-50/50 hover:bg-blue-50 rounded-lg border border-gray-100 hover:border-blue-100 transition-all duration-200 flex-shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                                                      title="Move Down"
                                                                  >▼</button>
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

                                 {/* Category Ordering Panel */}
                                 {categories.length > 0 && (
                                     <div className="max-w-3xl mt-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                         <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                             <span>📂</span> Category Display Order
                                         </h4>
                                         <p className="text-[11px] text-gray-400 font-medium mb-4">Drag the order in which categories are shown on the salon dashboard. Use ▲/▼ to reorder.</p>
                                         <div className="space-y-2">
                                             {categories.map((cat, idx) => (
                                                 <div key={cat} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                     <div className="flex items-center gap-3">
                                                         <span className="text-[10px] font-black text-gray-300 w-5 text-center">{idx + 1}</span>
                                                         <span className="text-sm font-semibold text-gray-800">{cat}</span>
                                                     </div>
                                                     <div className="flex items-center gap-1.5">
                                                         <button
                                                             onClick={() => idx > 0 && handleSwapCategories(cat, categories[idx - 1])}
                                                             disabled={idx === 0}
                                                             className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                             title="Move Up"
                                                         >▲</button>
                                                         <button
                                                             onClick={() => idx < categories.length - 1 && handleSwapCategories(cat, categories[idx + 1])}
                                                             disabled={idx === categories.length - 1}
                                                             className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                             title="Move Down"
                                                         >▼</button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                            </>
                    </div>
                </main>
    );
};

export default Service;