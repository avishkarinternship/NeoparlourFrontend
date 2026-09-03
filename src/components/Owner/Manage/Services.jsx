import React, { useState, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';

import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { calculateInclusiveGst } from '../../../utils/taxUtils';

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

// Category Logos
import hairIcon from '../../../assets/Logos/Hair.svg';
import skinCareIcon from '../../../assets/Logos/Skin care.svg';
import hairRemovalIcon from '../../../assets/Logos/Hair removal.svg';
import nailCareIcon from '../../../assets/Logos/Nail care.svg';
import makeupIcon from '../../../assets/Logos/makeup.svg';
import groomingIcon from '../../../assets/Logos/grooming.svg';
import spaMassageIcon from '../../../assets/Logos/spa & massage.svg';
import bridalPackagesIcon from '../../../assets/Logos/Hair Styling.svg';
import hairTreatmentIcon from '../../../assets/Logos/Hair treatment.svg';


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

const getCategoryIcon = (catName) => {
    const norm = (catName || '').toLowerCase().trim();
    if (norm.includes('hair services')) return hairIcon;
    if (norm.includes('skin care')) return skinCareIcon;
    if (norm.includes('hair removal')) return hairRemovalIcon;
    if (norm.includes('nail care')) return nailCareIcon;
    if (norm.includes('makeup')) return makeupIcon;
    if (norm.includes('grooming')) return groomingIcon;
    if (norm.includes('spa & massage')) return spaMassageIcon;
    if (norm.includes('bridal')) return bridalPackagesIcon;
    if (norm.includes('hair treatment')) return hairTreatmentIcon;
    return categoryIcon; // Fallback
};

const Service = () => {
    const location = useLocation();
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode || document.documentElement.classList.contains('dark');


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
    const [draggedCategory, setDraggedCategory] = useState(null);
    const [dragOverCategory, setDragOverCategory] = useState(null);
    const [catDndLoading, setCatDndLoading] = useState(false);
    const [expandedCats, setExpandedCats] = useState({});

    const [draggedServiceId, setDraggedServiceId] = useState(null);
    const [dragOverServiceId, setDragOverServiceId] = useState(null);
    const [svcDndLoading, setSvcDndLoading] = useState(false);
    const [dndMode, setDndMode] = useState('shift'); // 'shift' or 'swap' for service reordering

    // GST Status & Live Breakdown state
    const [salonGstStatus, setSalonGstStatus] = useState(null);
    const [gstBreakdown, setGstBreakdown] = useState(null);



    const fetchCategories = async (currentServices = []) => {
        const PREDEFINED = ["Hair Services", "Skin Care", "Hair Removal", "Nail Care", "Makeup", "Grooming", "Spa & Massage", "Bridal Packages", "Hair Treatment"];
        let fetchedCats = [];
        try {
            const response = await axiosInstance.get('/services/categories');
            fetchedCats = (response.data || []).map(c => typeof c === 'object' ? c.name : c);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }

        const serviceCats = currentServices.map(s => getNormalisedCategory(s.category)).filter(Boolean);

        const combined = Array.from(new Set([
            ...PREDEFINED,
            ...fetchedCats,
            ...serviceCats
        ]));

        setCategories(combined);
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

    // ==================== DRAG & DROP CATEGORY REORDERING ====================
    const handleCategoryDragStart = (e, catName) => {
        if (catDndLoading) {
            e.preventDefault();
            return;
        }
        setDraggedCategory(catName);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleCategoryDragOver = (e, catName) => {
        e.preventDefault();
        if (draggedCategory !== null && draggedCategory !== catName) {
            setDragOverCategory(catName);
        }
    };

    const handleCategoryDragLeave = (e, catName) => {
        if (dragOverCategory === catName) {
            setDragOverCategory(null);
        }
    };

    const handleCategoryDragEnd = () => {
        setDraggedCategory(null);
        setDragOverCategory(null);
    };

    const handleCategoryDrop = async (e, targetCatName) => {
        e.preventDefault();
        if (catDndLoading || draggedCategory === null || draggedCategory === targetCatName) {
            setDraggedCategory(null);
            setDragOverCategory(null);
            return;
        }

        const idx1 = categories.indexOf(draggedCategory);
        const idx2 = categories.indexOf(targetCatName);
        if (idx1 === -1 || idx2 === -1) {
            setDraggedCategory(null);
            setDragOverCategory(null);
            return;
        }

        setCatDndLoading(true);
        const previousCats = [...categories];
        const newCats = [...categories];

        if (dndMode === 'shift') {
            const [moved] = newCats.splice(idx1, 1);
            newCats.splice(idx2, 0, moved);
            setCategories(newCats);
            setDraggedCategory(null);
            setDragOverCategory(null);

            try {
                await axiosInstance.put('/services/categories/reorder', newCats);
                toast.success('Category display order updated successfully!', toastStyle);
            } catch (error) {
                console.error('Failed to reorder categories:', error);
                toast.error(error.response?.data?.message || 'Failed to reorder categories.', toastStyle);
                setCategories(previousCats);
            } finally {
                setCatDndLoading(false);
            }
        } else {
            newCats[idx1] = targetCatName;
            newCats[idx2] = draggedCategory;
            setCategories(newCats);
            setDraggedCategory(null);
            setDragOverCategory(null);

            try {
                await axiosInstance.put(`/services/categories/swap-priority?category1=${encodeURIComponent(draggedCategory)}&category2=${encodeURIComponent(targetCatName)}`);
                toast.success('Category priorities swapped successfully!', toastStyle);
            } catch (error) {
                console.error('Failed to swap category priorities:', error);
                toast.error(error.response?.data?.message || 'Failed to swap category priorities.', toastStyle);
                setCategories(previousCats);
            } finally {
                setCatDndLoading(false);
            }
        }
    };

    // ==================== DRAG & DROP SERVICE REORDERING ====================
    const handleServiceDragStart = (e, serviceId) => {
        if (svcDndLoading) {
            e.preventDefault();
            return;
        }
        setDraggedServiceId(serviceId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleServiceDragOver = (e, serviceId) => {
        e.preventDefault();
        if (draggedServiceId !== null && draggedServiceId !== serviceId) {
            setDragOverServiceId(serviceId);
        }
    };

    const handleServiceDragLeave = (e, serviceId) => {
        if (dragOverServiceId === serviceId) {
            setDragOverServiceId(null);
        }
    };

    const handleServiceDragEnd = () => {
        setDraggedServiceId(null);
        setDragOverServiceId(null);
    };

    const handleServiceDrop = async (e, targetServiceId) => {
        e.preventDefault();
        if (svcDndLoading || draggedServiceId === null || draggedServiceId === targetServiceId) {
            setDraggedServiceId(null);
            setDragOverServiceId(null);
            return;
        }

        const sourceService = services.find(s => s.id === draggedServiceId);
        const targetService = services.find(s => s.id === targetServiceId);
        if (!sourceService || !targetService) {
            setDraggedServiceId(null);
            setDragOverServiceId(null);
            return;
        }

        if (sourceService.category !== targetService.category) {
            toast.error("Cannot move services between different categories via drag-and-drop", toastStyle);
            setDraggedServiceId(null);
            setDragOverServiceId(null);
            return;
        }

        const fullSourceIdx = services.findIndex(s => s.id === draggedServiceId);
        const fullTargetIdx = services.findIndex(s => s.id === targetServiceId);
        if (fullSourceIdx === -1 || fullTargetIdx === -1) {
            setDraggedServiceId(null);
            setDragOverServiceId(null);
            return;
        }

        setSvcDndLoading(true);

        const previousServices = [...services];
        const previousFiltered = [...filteredServices];

        const updatedFull = [...services];
        const updatedFiltered = [...filteredServices];

        if (dndMode === 'shift') {
            const [movedItem] = updatedFull.splice(fullSourceIdx, 1);
            updatedFull.splice(fullTargetIdx, 0, movedItem);

            const fSourceIdx = filteredServices.findIndex(s => s.id === draggedServiceId);
            const fTargetIdx = filteredServices.findIndex(s => s.id === targetServiceId);
            if (fSourceIdx !== -1 && fTargetIdx !== -1) {
                const [movedFiltered] = updatedFiltered.splice(fSourceIdx, 1);
                updatedFiltered.splice(fTargetIdx, 0, movedFiltered);
            }
        } else {
            updatedFull[fullSourceIdx] = services[fullTargetIdx];
            updatedFull[fullTargetIdx] = services[fullSourceIdx];

            const fSourceIdx = filteredServices.findIndex(s => s.id === draggedServiceId);
            const fTargetIdx = filteredServices.findIndex(s => s.id === targetServiceId);
            if (fSourceIdx !== -1 && fTargetIdx !== -1) {
                updatedFiltered[fSourceIdx] = filteredServices[fTargetIdx];
                updatedFiltered[fTargetIdx] = filteredServices[fSourceIdx];
            }
        }

        setServices(updatedFull);
        setFilteredServices(updatedFiltered);
        setDraggedServiceId(null);
        setDragOverServiceId(null);

        if (dndMode === 'shift') {
            try {
                const orderedIds = updatedFull.map(s => s.id);
                await axiosInstance.put('/services/reorder', orderedIds);
                toast.success('Services reordered successfully!', toastStyle);
            } catch (error) {
                console.error('Failed to reorder services:', error);
                toast.error(error.response?.data?.message || 'Failed to reorder services.', toastStyle);
                setServices(previousServices);
                setFilteredServices(previousFiltered);
            } finally {
                setSvcDndLoading(false);
            }
        } else {
            try {
                await axiosInstance.put(`/services/swap-priority?serviceId1=${draggedServiceId}&serviceId2=${targetServiceId}`);
                toast.success('Service priorities swapped successfully!', toastStyle);
            } catch (error) {
                console.error('Failed to swap priorities:', error);
                toast.error(error.response?.data?.message || 'Failed to swap service priorities.', toastStyle);
                setServices(previousServices);
                setFilteredServices(previousFiltered);
            } finally {
                setSvcDndLoading(false);
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
            await fetchCategories(allServices);
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
            await fetchCategories(allServices);
        } catch (error) {
            console.error('Failed to search services:', error);
            toast.error('Failed to load services', toastStyle);
            setFilteredServices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchGstStatus = async () => {
        try {
            const res = await axiosInstance.get('/salons/profile');
            const data = res.data || {};
            setSalonGstStatus({
                hasGstin: Boolean(data.gstin),
                gstin: data.gstin || '',
                state: data.state || ''
            });
        } catch (err) {
            console.error("Failed to fetch salon GST status:", err);
        }
    };

    const hasGstin = Boolean(salonGstStatus?.hasGstin || salonGstStatus?.gstin);
    const stateUpper = (salonGstStatus?.state || '').toUpperCase();
    const isUt = stateUpper === 'LADAKH' || 
                 stateUpper === 'CHANDIGARH' || 
                 stateUpper === 'LAKSHADWEEP' || 
                 stateUpper === 'ANDAMAN_AND_NICOBAR_ISLANDS' || 
                 stateUpper === 'DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU' ||
                 stateUpper.includes('DAMAN') ||
                 stateUpper.includes('ANDAMAN');

    useEffect(() => {
        if (hasGstin && price) {
            setGstBreakdown(calculateInclusiveGst(price, isUt));
        } else {
            setGstBreakdown(null);
        }
    }, [price, hasGstin, isUt]);

    useEffect(() => {
        fetchServices();
        fetchGstStatus();
    }, []);

    const toggleCategoryExpand = (catName) => {
        setExpandedCats(prev => ({
            ...prev,
            [catName]: !prev[catName]
        }));
    };

    useEffect(() => {
        if (searchName.trim()) {
            const autoExpand = {};
            categories.forEach(cat => {
                const matches = services.some(s => 
                    getNormalisedCategory(s.category) === cat &&
                    s.name?.toLowerCase().includes(searchName.trim().toLowerCase())
                );
                if (matches) {
                    autoExpand[cat] = true;
                }
            });
            setExpandedCats(autoExpand);
        }
    }, [searchName, categories, services]);

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
                 <main className={`flex-1 p-6 md:p-8 overflow-auto transition-colors duration-300 ${
                     isDarkMode ? 'bg-zinc-950 text-zinc-100 md:border-l md:border-zinc-800' : 'bg-white text-slate-800 md:border-l md:border-gray-200'
                 }`}>
                     <div className="max-w-5xl mx-auto">

                         {/* ==================== SERVICE TAB ==================== */}
                         <>                                 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-[#FF0B01] font-extrabold text-xs tracking-wider uppercase mb-5">
                                     <span className="w-2 h-2 rounded-full bg-[#FF0B01] animate-pulse"></span>
                                     <span>{editingServiceId ? 'Edit Service Details' : 'Add New Service'}</span>
                                 </div>

                                 <div className={`max-w-3xl border rounded-[28px] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 mb-8 ${
                                     isDarkMode ? 'bg-zinc-900/90 border-zinc-800 backdrop-blur-md' : 'bg-white border-gray-100/90'
                                 }`}>
                                    <form onSubmit={handleServiceSave} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Category Option (GIVEN FIRST) */}
                                            <div className="space-y-1.5">
                                                <label className={`text-[11px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Category</label>
                                                <div className={`relative flex items-center border rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
                                                    isDarkMode ? 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60 focus-within:bg-white'
                                                }`}>
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
                                                        className={`w-full text-sm font-bold appearance-none bg-transparent outline-none cursor-pointer ${
                                                            isDarkMode ? 'text-white' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        <option value="" disabled hidden className={isDarkMode ? 'bg-zinc-900 text-zinc-400' : ''}>Select Category</option>
                                                        {Object.keys(PREDEFINED_CATEGORIES).map((catName) => (
                                                            <option key={catName} value={catName} className={isDarkMode ? 'bg-zinc-900 text-white' : ''}>{catName}</option>
                                                        ))}
                                                    </select>
                                                    <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                                </div>
                                                {formErrors.category && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{formErrors.category}</p>}
                                            </div>

                                            {/* Predefined Service Select (Only if selectedCategory is predefined and not 'Other') */}
                                            {selectedCategory && selectedCategory !== 'Other' && (
                                                <div className="space-y-1.5">
                                                    <label className={`text-[11px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Service Name</label>
                                                    <div className={`relative flex items-center border rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
                                                        isDarkMode ? 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60 focus-within:bg-white'
                                                    }`}>
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
                                                            className={`w-full text-sm font-bold appearance-none bg-transparent outline-none cursor-pointer ${
                                                                isDarkMode ? 'text-white' : 'text-gray-900'
                                                            }`}
                                                        >
                                                            <option value="" disabled hidden className={isDarkMode ? 'bg-zinc-900 text-zinc-400' : ''}>Select Service Name</option>
                                                            {(PREDEFINED_CATEGORIES[selectedCategory] || []).map((srvName) => (
                                                                <option key={srvName} value={srvName} className={isDarkMode ? 'bg-zinc-900 text-white' : ''}>{srvName}</option>
                                                            ))}
                                                            <option value="Other" className={isDarkMode ? 'bg-zinc-900 text-white' : ''}>Other (Type Custom Service)</option>
                                                        </select>
                                                        <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                                    </div>
                                                    {formErrors.serviceName && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{formErrors.serviceName}</p>}
                                                </div>
                                            )}

                                            {/* Custom Service Name Input (If selectedCategory === 'Other' OR selectedServiceName === 'Other') */}
                                            {(selectedCategory === 'Other' || selectedServiceName === 'Other') && (
                                                <div className="space-y-1.5">
                                                    <label className={`text-[11px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Custom Service Name</label>
                                                    <div className={`relative flex items-center border rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
                                                        isDarkMode ? 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60 focus-within:bg-white'
                                                    }`}>
                                                        <img src={serviceNameIcon} alt="Service Name" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                        <input
                                                            type="text"
                                                            placeholder="Type Custom Service Name"
                                                            value={customServiceName}
                                                            onChange={(e) => {
                                                                setCustomServiceName(e.target.value);
                                                                if (formErrors.serviceName) setFormErrors(prev => ({ ...prev, serviceName: '' }));
                                                            }}
                                                            className={`w-full text-sm font-bold outline-none bg-transparent ${
                                                                isDarkMode ? 'placeholder-zinc-500 text-white' : 'placeholder-gray-400 text-gray-900'
                                                            }`}
                                                        />
                                                    </div>
                                                    {formErrors.serviceName && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{formErrors.serviceName}</p>}
                                                </div>
                                            )}

                                            {/* Price Input */}
                                            <div className="space-y-1.5">
                                                <label className={`text-[11px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Service Price (₹)</label>
                                                <div className={`relative flex items-center border rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
                                                    isDarkMode ? 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60 focus-within:bg-white'
                                                }`}>
                                                    <img src={priceIcon} alt="Price" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <span className={`mr-1 font-extrabold text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>₹</span>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="0.00"
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
                                                        className={`w-full text-sm font-extrabold outline-none bg-transparent ${
                                                            isDarkMode ? 'placeholder-zinc-500 text-white' : 'placeholder-gray-400 text-gray-900'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.price && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{formErrors.price}</p>}
                                            </div>

                                            {/* Duration Input */}
                                            <div className="space-y-1.5">
                                                <label className={`text-[11px] font-black uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Duration (in minutes)</label>
                                                <div className={`relative flex items-center border rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-200 ${
                                                    isDarkMode ? 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60 focus-within:bg-white'
                                                }`}>
                                                    <img src={durationIcon} alt="Duration" className="w-5 h-5 mr-3 object-contain opacity-40 flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 45"
                                                        value={duration}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            setDuration(val);
                                                            if (formErrors.duration) setFormErrors(prev => ({ ...prev, duration: '' }));
                                                        }}
                                                        className={`w-full text-sm font-extrabold outline-none bg-transparent ${
                                                            isDarkMode ? 'placeholder-zinc-500 text-white' : 'placeholder-gray-400 text-gray-900'
                                                        }`}
                                                    />
                                                    <span className={`text-xs font-bold uppercase tracking-wider ml-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>mins</span>
                                                </div>
                                                {formErrors.duration && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{formErrors.duration}</p>}
                                            </div>

                                            {/* LIVE GST BREAKDOWN PREVIEW CARD (Visible only when GSTIN exists) */}
                                            {hasGstin && gstBreakdown && (
                                                <div className={`col-span-1 md:col-span-2 p-5 border rounded-2xl space-y-3 transition-all ${
                                                    isDarkMode 
                                                        ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-indigo-950/30 border-purple-800/50 text-purple-200' 
                                                        : 'bg-gradient-to-r from-purple-50/90 via-purple-50/50 to-indigo-50/70 border-purple-200/80 text-purple-950'
                                                }`}>
                                                    <div className={`flex items-center justify-between font-bold border-b pb-2.5 ${
                                                        isDarkMode ? 'border-purple-800/50' : 'border-purple-200/80'
                                                    }`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                            <span className="text-xs uppercase tracking-wider font-extrabold">Inclusive GST Breakdown (18%)</span>
                                                        </div>
                                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold tracking-wider ${
                                                            isDarkMode ? 'bg-purple-900/90 text-purple-200 border border-purple-700/50' : 'bg-purple-200/80 text-purple-900 border border-purple-300/60'
                                                        }`}>
                                                            GSTIN: {salonGstStatus?.gstin || 'Registered'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                                        <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-purple-900/40' : 'bg-white/80 border-purple-100 shadow-2xs'}`}>
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Base Value</span>
                                                            <strong className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{gstBreakdown.baseValue}</strong>
                                                        </div>
                                                        <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-purple-900/40' : 'bg-white/80 border-purple-100 shadow-2xs'}`}>
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Tax (18%)</span>
                                                            <strong className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{gstBreakdown.totalGst}</strong>
                                                        </div>
                                                        <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-purple-900/40' : 'bg-white/80 border-purple-100 shadow-2xs'}`}>
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block">CGST (9%)</span>
                                                            <strong className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{gstBreakdown.cgst}</strong>
                                                        </div>
                                                        <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-purple-900/40' : 'bg-white/80 border-purple-100 shadow-2xs'}`}>
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 block">{gstBreakdown.secondTaxLabel}</span>
                                                            <strong className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{gstBreakdown.sgstOrUtgst}</strong>
                                                        </div>
                                                    </div>

                                                    <div className={`text-[11px] font-medium pt-1 space-y-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <span className="text-emerald-500">✔</span> Customer invoice amount: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">₹{gstBreakdown.totalPrice}</strong>
                                                        </div>
                                                        <div className={`text-[10px] italic leading-relaxed ${isDarkMode ? 'text-purple-400/80' : 'text-purple-600/90'}`}>
                                                            ℹ️ Note: This tax distribution is for salon accounting reference only and will not be displayed to customers when booking.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 text-xs font-black uppercase tracking-wider">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-[#FF0B01] text-white py-4 rounded-2xl hover:brightness-110 active:scale-[0.985] transition-all shadow-md shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {submitting ? 'Saving...' : editingServiceId ? 'Update Service' : 'Save Service'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={resetServiceForm}
                                                className={`w-full sm:flex-1 border py-4 rounded-2xl transition-all cursor-pointer ${
                                                    isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800/80' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {editingServiceId ? 'Discard Changes' : 'Reset Form'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                 {/* Services List */}
                                 <div>
                                     {/* Search Filters */}
                                     <form onSubmit={handleSearchServices} className={`max-w-3xl border rounded-3xl p-6 mb-8 shadow-sm ${
                                         isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                                     }`}>
                                         <h4 className={`text-xs font-extrabold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Search Filters</h4>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                             {/* Name filter */}
                                             <div className="space-y-1.5">
                                                 <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Service Name</label>
                                                 <input 
                                                     type="text" 
                                                     placeholder="Filter by Name" 
                                                     value={searchName} 
                                                     onChange={(e) => setSearchName(e.target.value)} 
                                                     className={`w-full border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#FF0B01] transition-all ${
                                                         isDarkMode ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-white' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-55 focus:bg-white text-gray-900'
                                                     }`} 
                                                 />
                                             </div>

                                             {/* Category filter */}
                                             <div className="space-y-1.5">
                                                 <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Category</label>
                                                 <select 
                                                     value={searchCategory} 
                                                     onChange={(e) => setSearchCategory(e.target.value)} 
                                                     className={`w-full border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#FF0B01] transition-all cursor-pointer ${
                                                         isDarkMode ? 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-white' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-55 focus:bg-white text-gray-900'
                                                     }`}
                                                 >
                                                     <option value="" className={isDarkMode ? 'bg-zinc-900 text-zinc-400' : ''}>All Categories</option>
                                                     {Array.from(new Set([
                                                         ...categories,
                                                         ...services.map(s => getNormalisedCategory(s.category)).filter(Boolean)
                                                     ])).map(catName => (
                                                         <option key={catName} value={catName} className={isDarkMode ? 'bg-zinc-900 text-white' : ''}>{catName}</option>
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
                                                 className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-xl transition-all ${
                                                     isDarkMode ? 'text-zinc-300 border-zinc-700 hover:bg-zinc-800' : 'text-gray-500 border-gray-200 hover:bg-gray-55'
                                                 }`}
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
                                         <h3 className={`text-xs font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>All Services</h3>
                                         <div className={`flex items-center border rounded-2xl p-1 shadow-sm text-xs font-bold uppercase select-none ${
                                             isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'
                                         }`}>
                                             <button 
                                                 type="button" 
                                                 onClick={() => setDndMode('shift')}
                                                 className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${dndMode === 'shift' ? 'bg-[#FF0B01] text-white shadow-sm' : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                             >
                                                 Shift Mode
                                             </button>
                                             <button 
                                                 type="button" 
                                                 onClick={() => setDndMode('swap')}
                                                 className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${dndMode === 'swap' ? 'bg-[#FF0B01] text-white shadow-sm' : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                             >
                                                 Swap Mode
                                             </button>
                                         </div>
                                     </div>
                                     
                                     {!hasSearched ? (
                                         <div className={`text-center py-20 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 max-w-3xl border ${
                                             isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'text-gray-500 bg-white border-gray-100'
                                         }`}>
                                             <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                             </svg>
                                             <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Search Services</h4>
                                             <p className={`text-xs font-semibold max-w-md mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Use the filters above and click Search to display the services list.</p>
                                         </div>
) : loading ? (
                                         <div className="py-10 flex flex-col items-center justify-center gap-2 max-w-3xl">
                                             <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                             <span className="text-xs font-semibold text-gray-400">Loading services...</span>
                                         </div>
                                     ) : (
                                         <div className="space-y-4 max-w-3xl">
                                             {categories.filter(cat => {
                                                 if (searchCategory) {
                                                     return cat.toLowerCase() === searchCategory.toLowerCase();
                                                 }
                                                 return true;
                                             }).map((cat, catIdx) => {
                                                 const catServices = filteredServices.filter(s => getNormalisedCategory(s.category) === cat);
                                                 const isExpanded = !!expandedCats[cat];
                                                 const isDragged = draggedCategory === cat;
                                                 const isDragOver = dragOverCategory === cat;

                                                 return (
                                                     <div 
                                                         key={cat} 
                                                         draggable
                                                         onDragStart={(e) => handleCategoryDragStart(e, cat)}
                                                         onDragOver={(e) => handleCategoryDragOver(e, cat)}
                                                         onDragLeave={(e) => handleCategoryDragLeave(e, cat)}
                                                         onDragEnd={handleCategoryDragEnd}
                                                         onDrop={(e) => handleCategoryDrop(e, cat)}
                                                         className={`border rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'} ${isDragged ? 'opacity-40 border-dashed border-red-300 scale-[0.98]' : isDragOver ? 'border-2 border-[#FF0B01] bg-red-50/10' : isDarkMode ? 'hover:border-zinc-700' : 'hover:border-gray-250'}`}
                                                     >
                                                         {/* Category Header Row */}
                                                         <div 
                                                             onClick={() => toggleCategoryExpand(cat)}
                                                             className={`flex items-center justify-between p-5 cursor-pointer select-none transition-colors ${isDarkMode ? 'bg-zinc-900/50 hover:bg-zinc-800/80' : 'bg-gray-50/50 hover:bg-gray-55'}`}
                                                         >
                                                             <div className="flex items-center space-x-3.5 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
                                                                 {/* Category Drag Handle */}
                                                                 <div 
                                                                     draggable
                                                                     onDragStart={(e) => handleCategoryDragStart(e, cat)}
                                                                     onDragEnd={handleCategoryDragEnd}
                                                                     className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none text-base p-1"
                                                                     title="Drag to reorder category"
                                                                 >
                                                                     ☰
                                                                 </div>
                                                                  <div 
                                                                      className={`w-10 h-10 rounded-xl border flex items-center justify-center p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105 cursor-pointer ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}
                                                                      onClick={() => toggleCategoryExpand(cat)}
                                                                  >
                                                                      <img 
                                                                          src={getCategoryIcon(cat)} 
                                                                          alt={cat} 
                                                                          className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                                                                      />
                                                                  </div>
                                                                 <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleCategoryExpand(cat)}>
                                                                     <h4 className={`text-sm font-extrabold tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                                         {cat}
                                                                     </h4>
                                                                     <p className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                                                         {catServices.length} {catServices.length === 1 ? 'Service' : 'Services'}
                                                                     </p>
                                                                 </div>
                                                             </div>
                                                             <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                                                                 {/* Up / Down category arrows */}
                                                                 <div className="flex items-center gap-1">
                                                                     <button
                                                                         onClick={() => catIdx > 0 && handleSwapCategories(cat, categories[catIdx - 1])}
                                                                         disabled={catIdx === 0}
                                                                         className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                                                                             isDarkMode 
                                                                                 ? 'text-zinc-400 hover:text-[#FF0B01] bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                                                                                 : 'text-gray-400 hover:text-[#FF0B01] bg-white hover:bg-red-50 border-gray-250 hover:border-red-200'
                                                                         }`}
                                                                         title="Move Category Up"
                                                                     >▲</button>
                                                                     <button
                                                                         onClick={() => catIdx < categories.length - 1 && handleSwapCategories(cat, categories[catIdx + 1])}
                                                                         disabled={catIdx === categories.length - 1}
                                                                         className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                                                                             isDarkMode 
                                                                                 ? 'text-zinc-400 hover:text-[#FF0B01] bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                                                                                 : 'text-gray-400 hover:text-[#FF0B01] bg-white hover:bg-red-55 border-gray-250 hover:border-red-200'
                                                                         }`}
                                                                         title="Move Category Down"
                                                                     >▼</button>
                                                                 </div>
                                                                 
                                                                 {/* Expand / Collapse Indicator */}
                                                                 <button 
                                                                     onClick={() => toggleCategoryExpand(cat)}
                                                                     className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors text-xs font-bold ${
                                                                         isDarkMode 
                                                                             ? 'bg-slate-850 border-zinc-700 hover:bg-slate-750 text-zinc-300' 
                                                                             : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                                                     }`}
                                                                 >
                                                                     {isExpanded ? '▼' : '►'}
                                                                 </button>
                                                             </div>
                                                         </div>
 
                                                         {/* Expanded Category Services List */}
                                         {isExpanded && (
                                                             <div className={`p-5 border-t space-y-4 ${
                                                                 isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'
                                                             }`}>
                                                                 {catServices.length > 0 ? (
                                                                     catServices.map((service) => {
                                                                         const getCategoryTheme = (cat) => {
                                                                             const norm = (cat || '').toLowerCase().trim();
                                                                             if (norm.includes('hair services')) {
                                                                                 return {
                                                                                     accent: 'bg-[#FF0B01]',
                                                                                     bg: isDarkMode ? 'bg-red-950/40' : 'bg-red-50/70',
                                                                                     text: 'text-[#FF0B01]',
                                                                                     border: isDarkMode ? 'border-red-900/40' : 'border-red-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('hair treatment')) {
                                                                                 return {
                                                                                     accent: 'bg-orange-500',
                                                                                     bg: isDarkMode ? 'bg-orange-950/40' : 'bg-orange-50/70',
                                                                                     text: isDarkMode ? 'text-orange-400' : 'text-orange-700',
                                                                                     border: isDarkMode ? 'border-orange-900/40' : 'border-orange-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('skin care')) {
                                                                                 return {
                                                                                     accent: 'bg-amber-500',
                                                                                     bg: isDarkMode ? 'bg-amber-950/40' : 'bg-amber-50/70',
                                                                                     text: isDarkMode ? 'text-amber-400' : 'text-amber-700',
                                                                                     border: isDarkMode ? 'border-amber-900/40' : 'border-amber-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('hair removal')) {
                                                                                 return {
                                                                                     accent: 'bg-purple-500',
                                                                                     bg: isDarkMode ? 'bg-purple-950/40' : 'bg-purple-50/70',
                                                                                     text: isDarkMode ? 'text-purple-300' : 'text-purple-700',
                                                                                     border: isDarkMode ? 'border-purple-900/40' : 'border-purple-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('nail care')) {
                                                                                 return {
                                                                                     accent: 'bg-teal-500',
                                                                                     bg: isDarkMode ? 'bg-teal-950/40' : 'bg-teal-50/70',
                                                                                     text: isDarkMode ? 'text-teal-300' : 'text-teal-700',
                                                                                     border: isDarkMode ? 'border-teal-900/40' : 'border-teal-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('makeup')) {
                                                                                 return {
                                                                                     accent: 'bg-rose-500',
                                                                                     bg: isDarkMode ? 'bg-rose-950/40' : 'bg-rose-50/70',
                                                                                     text: isDarkMode ? 'text-rose-300' : 'text-rose-700',
                                                                                     border: isDarkMode ? 'border-rose-900/40' : 'border-rose-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('grooming')) {
                                                                                 return {
                                                                                     accent: 'bg-blue-500',
                                                                                     bg: isDarkMode ? 'bg-blue-950/40' : 'bg-blue-50/70',
                                                                                     text: isDarkMode ? 'text-blue-300' : 'text-blue-700',
                                                                                     border: isDarkMode ? 'border-blue-900/40' : 'border-blue-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('spa & massage')) {
                                                                                 return {
                                                                                     accent: 'bg-emerald-500',
                                                                                     bg: isDarkMode ? 'bg-emerald-950/40' : 'bg-emerald-50/70',
                                                                                     text: isDarkMode ? 'text-emerald-300' : 'text-emerald-700',
                                                                                     border: isDarkMode ? 'border-emerald-900/40' : 'border-emerald-100/50',
                                                                                 };
                                                                             }
                                                                             if (norm.includes('bridal')) {
                                                                                 return {
                                                                                     accent: 'bg-pink-500',
                                                                                     bg: isDarkMode ? 'bg-pink-950/40' : 'bg-pink-50/70',
                                                                                     text: isDarkMode ? 'text-pink-300' : 'text-pink-700',
                                                                                     border: isDarkMode ? 'border-pink-900/40' : 'border-pink-100/50',
                                                                                 };
                                                                             }
                                                                             return {
                                                                                 accent: 'bg-gray-400',
                                                                                 bg: isDarkMode ? 'bg-zinc-800/70' : 'bg-gray-50/70',
                                                                                 text: isDarkMode ? 'text-zinc-300' : 'text-gray-700',
                                                                                 border: isDarkMode ? 'border-zinc-700/50' : 'border-gray-100/50',
                                                                             };
                                                                         };
                                                                         const theme = getCategoryTheme(service.category);
                                                                         const isSvcDragged = draggedServiceId === service.id;
                                                                         const isSvcDragOver = dragOverServiceId === service.id;

                                                                         return (
                                                                             <div 
                                                                                 key={service.id} 
                                                                                 draggable
                                                                                 onDragStart={(e) => handleServiceDragStart(e, service.id)}
                                                                                 onDragOver={(e) => handleServiceDragOver(e, service.id)}
                                                                                 onDragLeave={(e) => handleServiceDragLeave(e, service.id)}
                                                                                 onDragEnd={handleServiceDragEnd}
                                                                                 onDrop={(e) => handleServiceDrop(e, service.id)}
                                                                                 className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-3xl transition-all duration-300 relative overflow-hidden group pl-7 gap-4 cursor-grab active:cursor-grabbing ${
                                                                                     isDarkMode 
                                                                                         ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]' 
                                                                                         : 'bg-white border-gray-100 hover:border-gray-250 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
                                                                                 } ${isSvcDragged ? 'opacity-40 border-dashed border-red-300 scale-[0.98]' : isSvcDragOver ? 'border-2 border-[#FF0B01] bg-red-50/10' : ''}`}
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
                                                                                         <h4 className={`text-sm font-semibold tracking-tight truncate mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={service.name}>
                                                                                             {service.name}
                                                                                         </h4>
                                                                                         <div className="flex flex-wrap items-center gap-2">
                                                                                             {/* Category Tag */}
                                                                                             <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                                                                 isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                                                             }`}>
                                                                                                 {service.category}
                                                                                             </span>
                                                                                             {/* Duration Badge */}
                                                                                             <span className={`flex items-center text-[10px] font-semibold gap-1 flex-shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                                                                                 <img src={durationIcon} alt="Duration" className="w-3.5 h-3.5 opacity-40 object-contain" />
                                                                                                 {service.duration} mins
                                                                                             </span>
                                                                                         </div>
                                                                                     </div>
                                                                                 </div>

                                                                                 {/* Right section: Price & Controls */}
                                                                                 <div className={`flex items-center gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t pt-3 sm:pt-0 sm:border-t-0 ${isDarkMode ? 'border-zinc-800' : 'border-gray-50'}`}>
                                                                                     <div className="text-left sm:text-right pr-1 flex-shrink-0">
                                                                                         <p className={`text-[16px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{service.price}</p>
                                                                                     </div>

                                                                                     <div className="flex items-center gap-2">
                                                                                         {/* Priority swap: Move Up */}
                                                                                         <button
                                                                                             onClick={() => {
                                                                                                 const idx = catServices.findIndex(s => s.id === service.id);
                                                                                                 if (idx > 0) handleSwapServices(service.id, catServices[idx - 1].id);
                                                                                             }}
                                                                                             disabled={catServices.findIndex(s => s.id === service.id) === 0}
                                                                                             className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 flex-shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs ${
                                                                                                 isDarkMode 
                                                                                                     ? 'text-zinc-400 hover:text-blue-400 bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                                                                                                     : 'text-gray-400 hover:text-blue-600 bg-gray-50/50 hover:bg-blue-55 border-gray-100 hover:border-blue-100'
                                                                                             }`}
                                                                                             title="Move Up"
                                                                                         >▲</button>
                                                                                         {/* Priority swap: Move Down */}
                                                                                         <button
                                                                                             onClick={() => {
                                                                                                 const idx = catServices.findIndex(s => s.id === service.id);
                                                                                                 if (idx < catServices.length - 1) handleSwapServices(service.id, catServices[idx + 1].id);
                                                                                             }}
                                                                                             disabled={catServices.findIndex(s => s.id === service.id) === catServices.length - 1}
                                                                                             className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 flex-shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs ${
                                                                                                 isDarkMode 
                                                                                                     ? 'text-zinc-400 hover:text-blue-400 bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                                                                                                     : 'text-gray-400 hover:text-blue-600 bg-gray-50/50 hover:bg-blue-55 border-gray-100 hover:border-blue-100'
                                                                                             }`}
                                                                                             title="Move Down"
                                                                                         >▼</button>
                                                                                         {/* Circular icon button for edit */}
                                                                                         <button
                                                                                             onClick={() => handleEditService(service)}
                                                                                             className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 flex-shrink-0 cursor-pointer ${
                                                                                                 isDarkMode 
                                                                                                     ? 'text-zinc-400 hover:text-[#FF0B01] bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                                                                                                     : 'text-gray-400 hover:text-[#FF0B01] bg-gray-50/50 hover:bg-red-55 border-gray-100 hover:border-red-100'
                                                                                             }`}
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
                                                                                             <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-[#FF0B01] transition-colors duration-200 ${
                                                                                                 isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'
                                                                                             }`}></div>
                                                                                         </label>
                                                                                     </div>
                                                                                 </div>
                                                                             </div>
                                                                         );
                                                                     })
                                                                 ) : (
                                                                     <div className={`py-4 text-center text-xs font-bold uppercase tracking-widest rounded-2xl border ${
                                                                         isDarkMode ? 'bg-zinc-800/30 text-zinc-400 border-zinc-800' : 'bg-gray-50/30 text-gray-400 border-gray-100'
                                                                     }`}>
                                                                         No services in this category
                                                                     </div>
                                                                 )}
                                                             </div>
                                                         )}
                                                      </div>
                                              );
                                          })}
                                      </div>
                                      )}
                                 </div>
                                 </>
                    </div>
                </main>
    );
};

export default Service;