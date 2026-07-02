import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Scissors,
    MapPin,
    Share2,
    Clock,
    Sparkles,
    Smartphone,
    Compass,
    Info,
    Star,
    Map,
    Users,
    Award,
    ChevronRight,
    Phone,
    Mail,
    Calendar,
    Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';



// Local SVG and Image Assets
import hairCutIcon from '../../assets/Customer/BookingScreen/hair_cut.svg';
import hairSpaIcon from '../../assets/Customer/BookingScreen/hair_spa.svg';
import hairStylingIcon from '../../assets/Customer/BookingScreen/hair_styling.svg';
import hairWashIcon from '../../assets/Customer/BookingScreen/hair_wash.svg';
import coloringIcon from '../../assets/Customer/BookingScreen/coloring.svg';
import shavingIcon from '../../assets/Customer/BookingScreen/shaving.svg';
import straighteningIcon from '../../assets/Customer/BookingScreen/straightning.svg';
import appleIcon from '../../assets/Customer/BookingScreen/apple_icon.svg';
import playstoreIcon from '../../assets/Customer/BookingScreen/playstore_icon.svg';

import expertOneImg from '../../assets/Customer/BookingScreen/Expert_One.png';
import expertTwoImg from '../../assets/Customer/BookingScreen/Expert_Two.png';
import expertThreeImg from '../../assets/Customer/BookingScreen/Expert_Three.png';

// Fallback Products
import productOne from '../../assets/Customer/ProductSearch/product_one.jpg';
import productTwo from '../../assets/Customer/ProductSearch/product_two.jpg';
import productThree from '../../assets/Customer/ProductSearch/product_three.jpg';
import productFour from '../../assets/Customer/ProductSearch/product_four.jpg';
import productFive from '../../assets/Customer/ProductSearch/product_five.jpg';

// --- LOCAL ASYNC IMAGE COMPONENT ---
const AsyncImage = ({ imagePath, alt, className, fallbackText }) => {
    const [src, setSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!imagePath) {
            setSrc(null);
            setError(true);
            return;
        }

        let isMounted = true;
        const controller = new AbortController();
        setLoading(true);
        setError(false);

        const fetchImage = async () => {
            try {
                const response = await axiosInstance.get(`/images/${imagePath}`, {
                    responseType: 'blob',
                    signal: controller.signal
                });

                if (isMounted) {
                    const blobUrl = URL.createObjectURL(response.data);
                    setSrc(blobUrl);
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
                    console.error("Failed to load async image:", err);
                    if (isMounted) {
                        setError(true);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [imagePath]);

    useEffect(() => {
        return () => {
            if (src) {
                URL.revokeObjectURL(src);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#ffebeb] text-[#ff0b01]">
                <div className="animate-spin h-3.5 w-3.5 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !src) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-extrabold text-sm uppercase">
                {fallbackText}
            </div>
        );
    }

    return <img src={src} alt={alt} className={className} />;
};

const formatDiscountText = (text) => {
    const textStr = String(text);
    if (textStr.startsWith('₹')) {
        return (
            <span className="flex items-baseline font-black text-[#ff0b01]">
                <span className="text-xs sm:text-sm mr-0.5">₹</span>
                <span className="text-xl sm:text-2xl md:text-3xl">{textStr.slice(1)}</span>
            </span>
        );
    }
    if (textStr.endsWith('%')) {
        return (
            <span className="flex items-baseline font-black text-[#ff0b01]">
                <span className="text-xl sm:text-2xl md:text-3xl">{textStr.slice(0, -1)}</span>
                <span className="text-xs sm:text-sm ml-0.5">%</span>
            </span>
        );
    }
    const num = parseFloat(textStr);
    if (!isNaN(num)) {
        return (
            <span className="flex items-baseline font-black text-[#ff0b01]">
                <span className="text-xl sm:text-2xl md:text-3xl">{textStr}</span>
                <span className="text-xs sm:text-sm ml-0.5">%</span>
            </span>
        );
    }
    return <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#ff0b01]">{textStr}</span>;
};

const SalonPage = () => {
    const navigate = useNavigate();
    const activeSalonId = localStorage.getItem('activeSalonId');
    const { isAuthenticated } = useSelector((state) => state.customer);

    // --- STATE ---
    const [isFavourite, setIsFavourite] = useState(false);
    const [salon, setSalon] = useState(null);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Track loaded statuses to prevent multiple calls
    const [servicesLoaded, setServicesLoaded] = useState(false);
    const [staffLoaded, setStaffLoaded] = useState(false);
    const [productsLoaded, setProductsLoaded] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [offers, setOffers] = useState([]);
    const [offersLoading, setOffersLoading] = useState(false);
    const [homeServiceCharges, setHomeServiceCharges] = useState(0);

    // Refs for scrolling lazy-load
    const servicesSectionRef = useRef(null);
    const staffSectionRef = useRef(null);
    const productsSectionRef = useRef(null);

    // --- QUICK BOOK STATE ---
    const getNextDays = () => {
        const days = [];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                day: weekdays[d.getDay()],
                num: d.getDate(),
                month: d.toLocaleString('default', { month: 'long' }),
                year: d.getFullYear(),
                fullDate: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
            });
        }
        return days;
    };
    const nextDays = getNextDays();
    const [selectedDateObj, setSelectedDateObj] = useState(() => {
        const stored = localStorage.getItem('bookingSelectedDateObj');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const exists = nextDays.find(d => d.fullDate === parsed.fullDate);
                if (exists) return exists;
            } catch (e) {
                console.error(e);
            }
        }
        return nextDays[0];
    });
    const [selectedTime, setSelectedTime] = useState(() => {
        return localStorage.getItem('bookingSelectedTime') || null;
    });
    const [selectedSlot, setSelectedSlot] = useState(() => {
        const stored = localStorage.getItem('bookingSelectedSlot');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error(e);
            }
        }
        return null;
    });
    const [selectedExpert, setSelectedExpert] = useState(() => {
        return localStorage.getItem('bookingSelectedExpert') || null;
    });

    useEffect(() => {
        if (selectedDateObj) {
            localStorage.setItem('bookingSelectedDateObj', JSON.stringify(selectedDateObj));
        } else {
            localStorage.removeItem('bookingSelectedDateObj');
        }
    }, [selectedDateObj]);

    useEffect(() => {
        if (selectedTime) {
            localStorage.setItem('bookingSelectedTime', selectedTime);
        } else {
            localStorage.removeItem('bookingSelectedTime');
        }
    }, [selectedTime]);

    useEffect(() => {
        if (selectedSlot) {
            localStorage.setItem('bookingSelectedSlot', JSON.stringify(selectedSlot));
        } else {
            localStorage.removeItem('bookingSelectedSlot');
        }
    }, [selectedSlot]);

    useEffect(() => {
        if (selectedExpert) {
            localStorage.setItem('bookingSelectedExpert', selectedExpert);
        } else {
            localStorage.removeItem('bookingSelectedExpert');
        }
    }, [selectedExpert]);

    const [salonSlots, setSalonSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [availableStaffForSlot, setAvailableStaffForSlot] = useState([]);
    const [availableStaffLoading, setAvailableStaffLoading] = useState(false);
    const quickBookSectionRef = useRef(null);

    const dateObjToInstant = (dateObj) => {
        if (!dateObj) return null;
        const [dd, mm, yyyy] = dateObj.fullDate.split('-');
        return `${yyyy}-${mm}-${dd}T00:00:00.000+05:30`;
    };

    const availableStaffIds = useMemo(() => {
        return new Set(availableStaffForSlot.map(s => s.staffId));
    }, [availableStaffForSlot]);

    // --- BASEURL PATH UTILITY ---
    const getSalonImageSrc = (imageUrl, fallbackImg) => {
        if (!imageUrl) return fallbackImg;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const base = axiosInstance.defaults.baseURL || 'https://sb.neoparlour.com/api';
        let cleanedUrl = imageUrl;
        if (cleanedUrl.startsWith('/api')) {
            const domain = base.replace(/\/api$/, '');
            return `${domain}${cleanedUrl}`;
        }
        if (cleanedUrl.startsWith('api')) {
            const domain = base.replace(/\/api$/, '');
            return `${domain}/${cleanedUrl}`;
        }
        return `${base}${cleanedUrl.startsWith('/') ? '' : '/'}${cleanedUrl}`;
    };

    // Load Salon Details and active offers immediately on mount
    useEffect(() => {
        if (!activeSalonId) {
            toast.error('No active salon selected. Redirecting to search.');
            navigate('/customer/salons');
            return;
        }

        const fetchSalonDetails = async () => {
            setLoading(true);
            try {
                const salonRes = await axiosInstance.get(`/salons/${activeSalonId}`);
                setSalon(salonRes.data);
            } catch (error) {
                console.error("Error loading salon details:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchActiveOffers = async () => {
            setOffersLoading(true);
            try {
                const res = await axiosInstance.get('/offers/public/search', {
                    params: { active: true, page: 0, size: 10, salonId: activeSalonId }
                });
                const offersData = res.data?.content || res.data || [];
                setOffers(offersData);
            } catch (error) {
                console.error("Error loading active offers:", error);
            } finally {
                setOffersLoading(false);
            }
        };

        const checkFavStatus = async () => {
            if (isAuthenticated && activeSalonId) {
                try {
                    const res = await axiosInstance.get(`/customer/favourites/${activeSalonId}/check`);
                    setIsFavourite(res.data);
                } catch (err) {
                    console.error("Failed to check favourite status:", err);
                }
            } else {
                setIsFavourite(false);
            }
        };

        const fetchHomeServiceCharges = async () => {
            try {
                const res = await axiosInstance.get(`/salons/${activeSalonId}/home-service-charges`);
                const charge = parseFloat(res.data) || 0;
                setHomeServiceCharges(charge);
            } catch (error) {
                console.error("Error loading home service charges:", error);
            }
        };

        fetchSalonDetails();
        fetchActiveOffers();
        checkFavStatus();
        fetchHomeServiceCharges();
    }, [activeSalonId, navigate, isAuthenticated]);

    const handleToggleFavourite = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to add to favourites", {
                style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
            });
            navigate('/customer/login');
            return;
        }

        const salonName = salon?.name || salon?.salonName || 'this salon';
        const newFavStatus = !isFavourite;
        setIsFavourite(newFavStatus); // Optimistic UI update

        try {
            if (newFavStatus) {
                await axiosInstance.post(`/customer/favourites/${activeSalonId}`);
                toast.success(`Added ${salonName} to favourites`, {
                    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
                });
            } else {
                await axiosInstance.delete(`/customer/favourites/${activeSalonId}`);
                toast.success(`Removed ${salonName} from favourites`, {
                    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
                });
            }
        } catch (err) {
            console.error("Failed to toggle favourite status:", err);
            setIsFavourite(!newFavStatus); // Revert
            toast.error(err.response?.data?.message || "Failed to update favourite status", {
                style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
            });
        }
    };

    // --- FETCH SALON SLOTS on mount / date change ---
    useEffect(() => {
        if (!activeSalonId) return;
        const fetchSalonSlots = async () => {
            setSlotsLoading(true);
            try {
                const dateInstant = dateObjToInstant(selectedDateObj);
                const params = { salonId: activeSalonId };
                if (dateInstant) params.selectedDate = dateInstant;
                const res = await axiosInstance.get('/appointments/public/salon-slots', { params });
                setSalonSlots(res.data || []);
            } catch (error) {
                console.error('[SalonPage] Error fetching salon slots:', error);
                setSalonSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSalonSlots();
    }, [activeSalonId, selectedDateObj]);

    // --- FETCH AVAILABLE STAFF when time slot selected ---
    useEffect(() => {
        if (!activeSalonId || !selectedSlot?.startTime) {
            setAvailableStaffForSlot([]);
            return;
        }
        const fetchAvailableStaff = async () => {
            setAvailableStaffLoading(true);
            try {
                const res = await axiosInstance.get('/appointments/public/available-staff', {
                    params: {
                        salonId: activeSalonId,
                        selectedTime: selectedSlot.startTime,
                        durationMinutes: 30 // default for salon page (no services selected yet)
                    }
                });
                setAvailableStaffForSlot(res.data || []);
            } catch (error) {
                console.error('[SalonPage] Error fetching available staff:', error);
                setAvailableStaffForSlot([]);
            } finally {
                setAvailableStaffLoading(false);
            }
        };
        fetchAvailableStaff();
    }, [activeSalonId, selectedSlot]);

    // Initialize gallery images from salon data
    useEffect(() => {
        if (salon) {
            const images = [salon.imageUrl, ...(salon.salonImages || [])].filter(Boolean);
            setGalleryImages(images);
        }
    }, [salon]);

    // Swap clicked image with main (index 0)
    const swapGalleryImage = (clickedIndex) => {
        if (clickedIndex === 0 || clickedIndex >= galleryImages.length) return;
        setGalleryImages(prev => {
            const newArr = [...prev];
            [newArr[0], newArr[clickedIndex]] = [newArr[clickedIndex], newArr[0]];
            return newArr;
        });
    };

    // Lazy load Services Categories
    const fetchServices = async () => {
        if (servicesLoaded) return;
        try {
            console.log("[SalonPage] Scroll down triggered: Fetching categories from API...");
            const categoriesRes = await axiosInstance.get('/services/public/categories', {
                params: { salonId: activeSalonId }
            });
            setCategories(categoriesRes.data || []);
            setServicesLoaded(true);
        } catch (error) {
            console.error("Error fetching services categories dynamically:", error);
        }
    };

    // Lazy load Staff — fetch top 3 by rating via /staff/public/search
    const fetchStaff = async () => {
        if (staffLoaded) return;
        try {
            console.log("[SalonPage] Scroll down triggered: Fetching top 3 staff from /staff/public/search...");
            const staffRes = await axiosInstance.get('/staff/public/search', {
                params: { size: 3, page: 0, salonId: activeSalonId }
            });
            const staffData = staffRes.data?.content || staffRes.data || [];
            setStaffList(staffData);
            setStaffLoaded(true);
        } catch (error) {
            console.error("Error fetching staff dynamically:", error);
        }
    };

    // Lazy load Products
    const fetchProducts = async () => {
        if (productsLoaded) return;
        try {
            console.log("[SalonPage] Scroll down triggered: Fetching products list from API...");
            const productsRes = await axiosInstance.get('/products/public/filter', {
                params: { active: true, size: 4, salonId: activeSalonId }
            });
            const productData = productsRes.data?.content || productsRes.data || [];
            setProducts(productData.slice(0, 4));
            setProductsLoaded(true);
        } catch (error) {
            console.error("Error fetching products dynamically:", error);
        }
    };

    // Setup IntersectionObservers for lazy loading
    useEffect(() => {
        if (loading) return; // Wait until initial salon details are ready

        const observerOptions = {
            root: null, // viewport
            rootMargin: '120px', // Load slightly before they enter the screen
            threshold: 0.05
        };

        const servicesObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchServices();
                servicesObserver.disconnect();
            }
        }, observerOptions);

        const staffObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchStaff();
                staffObserver.disconnect();
            }
        }, observerOptions);

        const productsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchProducts();
                productsObserver.disconnect();
            }
        }, observerOptions);

        if (servicesSectionRef.current && !servicesLoaded) servicesObserver.observe(servicesSectionRef.current);
        if (staffSectionRef.current && !staffLoaded) staffObserver.observe(staffSectionRef.current);
        if (productsSectionRef.current && !productsLoaded) productsObserver.observe(productsSectionRef.current);

        return () => {
            servicesObserver.disconnect();
            staffObserver.disconnect();
            productsObserver.disconnect();
        };
    }, [loading, servicesLoaded, staffLoaded, productsLoaded]);

    // Timings Formatting Utility
    const formatTimeStr = (timeStr) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
    };

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const formatOperatingHours = (day, openingTime, closingTime, weeklyOffDay) => {
        if (weeklyOffDay && weeklyOffDay.toLowerCase() === day.toLowerCase()) {
            return 'Closed';
        }
        if (!openingTime || !closingTime) return '10:00 AM To 10:00 PM';
        return `${formatTimeStr(openingTime)} To ${formatTimeStr(closingTime)}`;
    };

    const isSalonOpenNow = () => {
        if (!salon) return false;

        // Check if today is weeklyOffDay
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDayName = daysOfWeek[new Date().getDay()];
        if (salon.weeklyOffDay && salon.weeklyOffDay.toLowerCase() === todayDayName.toLowerCase()) {
            return false;
        }

        if (!salon.openingTime || !salon.closingTime) return true;

        const now = new Date();
        const [openH, openM] = salon.openingTime.split(':').map(Number);
        const [closeH, closeM] = salon.closingTime.split(':').map(Number);
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;
        return currentTime >= openTime && currentTime <= closeTime;
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: salon?.name || 'Neoparlour Salon',
                text: `Book appointment at ${salon?.name || 'Neoparlour'}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    // Category mapping helper
    const categoryIcons = {
        'haircut': hairCutIcon,
        'hair cut': hairCutIcon,
        'coloring': coloringIcon,
        'hair coloring': coloringIcon,
        'hairspa': hairSpaIcon,
        'hair spa': hairSpaIcon,
        'hairstyling': hairStylingIcon,
        'hair styling': hairStylingIcon,
        'shaving': shavingIcon,
        'hair wash': hairWashIcon,
        'hairwash': hairWashIcon,
        'straightening': straighteningIcon,
        'straightning': straighteningIcon,
    };

    // Staff avatar fallback map
    const expertFallbacks = [expertOneImg, expertTwoImg, expertThreeImg];
    const getExpertImg = (index) => expertFallbacks[index % expertFallbacks.length];

    // Product fallbacks
    const productFallbacks = [productOne, productTwo, productThree, productFour, productFive];
    const getProductImg = (product, index) => {
        if (product.imageUrl) return getSalonImageSrc(product.imageUrl);
        return productFallbacks[index % productFallbacks.length];
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-32">
                <div className="animate-spin h-12 w-12 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-4 shadow-sm"></div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Syncing Salon Portal...</p>
            </div>
        );
    }

    const mainImageToShow = galleryImages[0] || null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">

            {/* ==================== BREADCRUMBS ==================== */}
            <nav className="bg-white border-b border-slate-100 py-3.5 shadow-sm">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-[10px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                    <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => navigate('/customer/salons')}>Search</span>
                    <span>&gt;</span>
                    <span className="text-slate-900 font-black">Salon Description</span>
                </div>
            </nav>

            {/* ==================== MAIN CONTENT ==================== */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

                {/* Salon Headline Block */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6 sm:mb-8 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                    <div className="min-w-0 flex-1 space-y-2.5">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight uppercase truncate">
                            {salon?.name || salon?.salonName || 'Salon Details'}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-bold flex items-center gap-1.5 uppercase">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                            <span className="truncate">{[salon?.address, salon?.areaName, salon?.cityName].filter(Boolean).join(', ') || 'No address specified'}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                                isSalonOpenNow()
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-600'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSalonOpenNow() ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
                                <span className="whitespace-nowrap">{isSalonOpenNow() ? 'Open' : 'Closed'}</span>
                                <span className="text-slate-300">|</span>
                                <span className="whitespace-nowrap">{salon?.openingTime ? formatTimeStr(salon.openingTime) : '10:00 AM'} - {salon?.closingTime ? formatTimeStr(salon.closingTime) : '10:00 PM'}</span>
                            </div>
                            {salon?.salonCode && (
                                <span className="text-[9px] font-bold bg-slate-50 text-slate-450 border border-slate-150/60 px-2.5 py-1.5 rounded uppercase tracking-widest">
                                    Code: {salon.salonCode}
                                </span>
                            )}
                            {homeServiceCharges > 0 && (
                                <span className="text-[9px] font-bold bg-red-50 text-[#FF0B01] border border-red-200 px-2.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                                    Home Service: ₹{homeServiceCharges}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-center">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/book-service')}
                            className="bg-[#FF0B01] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            Book Services
                        </button>
                        <button
                            type="button"
                            onClick={handleShare}
                            className="p-2.5 border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-605 transition shadow-sm cursor-pointer"
                            title="Share Salon"
                        >
                            <Share2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleFavourite}
                            className={`p-2.5 border rounded-2xl transition shadow-sm cursor-pointer ${
                                isFavourite 
                                    ? 'bg-red-50 border-red-200 text-[#ff0b01]' 
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                            title={isFavourite ? "Remove from Favourites" : "Mark as Favourite"}
                        >
                            <Heart className={`w-4.5 h-4.5 ${isFavourite ? 'fill-[#ff0b01] text-[#ff0b01]' : 'text-slate-600'}`} />
                        </button>
                    </div>
                </div>

                {/* Master Two-Column Grid Setup */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">

                    {/* LEFT CONTAINER CANVAS (Full Width since sidebar has no active cards) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Salon Images Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            {/* Large Image (Left) */}
                            <div className="md:col-span-2 h-[220px] sm:h-[320px] md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-150 bg-white">
                                {mainImageToShow ? (
                                    <img
                                        src={getSalonImageSrc(mainImageToShow)}
                                        alt={salon?.name || 'Salon Cover'}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                        <Scissors className="w-10 h-10 text-slate-350 mb-2 animate-bounce" />
                                        <span className="text-xs font-bold uppercase tracking-widest">No Image Available</span>
                                    </div>
                                )}
                            </div>

                            {/* Two Stacked Images (Right) */}
                            <div className="flex flex-row md:flex-col gap-3 sm:gap-4 h-[140px] sm:h-[180px] md:h-[400px]">
                                <div
                                    onClick={() => galleryImages[1] && swapGalleryImage(1)}
                                    className="flex-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-150 bg-white cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-all"
                                    title="Click to swap with main image"
                                >
                                    {galleryImages[1] ? (
                                        <img
                                            src={getSalonImageSrc(galleryImages[1])}
                                            alt="Gallery 1"
                                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                            <Scissors className="w-6 h-6 text-slate-350 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div
                                    onClick={() => galleryImages[2] && swapGalleryImage(2)}
                                    className="flex-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-150 bg-white cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-all"
                                    title="Click to swap with main image"
                                >
                                    {galleryImages[2] ? (
                                        <img
                                            src={getSalonImageSrc(galleryImages[2])}
                                            alt="Gallery 2"
                                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                            <Scissors className="w-6 h-6 text-slate-350 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">No Image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>                        {/* Photos Gallery Section (placed directly below header images) */}
                        {galleryImages.filter(Boolean).length > 0 && (
                            <section className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                        <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff0b01]" /> Photos Gallery
                                    </h3>
                                    <span className="bg-red-50 text-[#ff0b01] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {galleryImages.filter(Boolean).length} photos
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                                    {galleryImages.map((imgUrl, idx) => {
                                        if (!imgUrl) return null;
                                        const isMain = idx === 0;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => !isMain && swapGalleryImage(idx)}
                                                className={`h-16 sm:h-20 rounded-xl overflow-hidden shadow-xs border transition-all duration-300 relative group ${
                                                    isMain
                                                        ? 'border-[#ff0b01] ring-2 ring-red-500/10 scale-[0.98]'
                                                        : 'border-slate-100 hover:border-red-300 hover:scale-105 cursor-pointer'
                                                }`}
                                                title={isMain ? "Currently active main image" : "Click to view as main image"}
                                            >
                                                <img
                                                    src={getSalonImageSrc(imgUrl)}
                                                    alt={`Gallery ${idx}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                {isMain ? (
                                                    <div className="absolute inset-0 bg-[#ff0b01]/5 flex items-center justify-center">
                                                        <span className="bg-[#ff0b01] text-white text-[8px] font-black uppercase px-1 rounded-sm">Main</span>
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                                                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Offers Available For You (Redesigned with attractive, premium styling) */}
                        <section className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-visible relative">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff0b01]" /> Exclusive Offers for You
                            </h3>
                            {offersLoading ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full mb-2"></div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Syncing Exclusive Deals...</p>
                                </div>
                            ) : offers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {offers.map((offer) => {
                                        const isPercentage = offer.discountType === 'PERCENTAGE' || offer.percentage !== undefined;
                                        const value = offer.discountValue ?? offer.percentage ?? 0;
                                        const discountText = isPercentage ? `${value}%` : `₹${value}`;
                                        const offText = "OFF";
                                        
                                        return (
                                            <div
                                                key={offer.id}
                                                className="flex flex-row relative bg-white border border-red-100 hover:border-red-300 hover:shadow-[0_15px_30px_-10px_rgba(255,11,1,0.14)] hover:-translate-y-0.5 rounded-2xl transition-all duration-300 group"
                                            >
                                                {/* Left Side (Voucher Value Card) */}
                                                <div className="w-24 sm:w-28 md:w-32 flex-shrink-0 bg-gradient-to-br from-red-50/70 via-red-50/30 to-white flex flex-col items-center justify-center p-3 rounded-l-2xl relative border-r border-dashed border-red-100/60 overflow-hidden">
                                                    {formatDiscountText(discountText)}
                                                    <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{offText}</span>
                                                    <span className="text-red-500/5 select-none font-black text-5xl absolute -left-1 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500">%</span>
                                                </div>

                                                {/* Tear Notch Cutouts */}
                                                <div className="absolute -top-2.5 left-[96px] sm:left-[112px] md:left-[128px] -translate-x-1/2 w-5 h-5 rounded-full bg-slate-50 border border-red-100/60 z-10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]"></div>
                                                <div className="absolute -bottom-2.5 left-[96px] sm:left-[112px] md:left-[128px] -translate-x-1/2 w-5 h-5 rounded-full bg-slate-50 border border-red-100/60 z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"></div>
                                                
                                                {/* Dashed Separator Line */}
                                                <div className="absolute top-2.5 bottom-2.5 left-[96px] sm:left-[112px] md:left-[128px] border-l border-dashed border-red-150 -translate-x-[0.5px] pointer-events-none z-10"></div>

                                                {/* Right Side (Voucher Details) */}
                                                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0 bg-white rounded-r-2xl">
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-tight truncate group-hover:text-[#ff0b01] transition-colors">{offer.name}</h4>
                                                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed line-clamp-2">
                                                            {offer.description || `Get ${discountText} off on ${offer.services?.map(s => s.name).join(', ') || 'selected services'}.`}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50 mt-4">
                                                        <div className="min-w-0">
                                                            {offer.validTo ? (
                                                                <>
                                                                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">Expires on</span>
                                                                    <span className="text-[10px] text-slate-650 font-bold block mt-1 truncate">
                                                                        {new Date(offer.validTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">Limited Time</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate('/customer/book-service', { state: { selectedOffer: offer } })}
                                                            className="bg-slate-900 hover:bg-[#ff0b01] text-white text-[9px] font-black uppercase tracking-wider px-4.5 py-2.5 rounded-xl transition duration-300 shadow-sm whitespace-nowrap cursor-pointer transform hover:scale-105 active:scale-95"
                                                        >
                                                            Claim Deal
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="border border-slate-100 border-dashed rounded-2xl p-6 text-center shadow-xs">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No active offers available today.</p>
                                </div>
                            )}
                        </section>

                        {/* Services Categories icons list */}
                        <section ref={servicesSectionRef} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <Scissors className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF0B01]" /> SERVICES CATEGORIES
                            </h3>
                            {!servicesLoaded ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Loading Categories...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-4">
                                    {categories.map((catName) => {
                                        const catLower = catName.toLowerCase();
                                        const catIcon = categoryIcons[catLower] || hairCutIcon;
                                        return (
                                            <div
                                                key={catName}
                                                onClick={() => navigate('/customer/book-service', { state: { selectedCategory: catName } })}
                                                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 min-w-0 sm:min-w-[84px] h-[76px] sm:h-[84px] shadow-sm cursor-pointer hover:bg-slate-100 hover:border-slate-200 transition-all transform hover:scale-105 active:scale-95"
                                            >
                                                <img
                                                    src={catIcon}
                                                    alt={catName}
                                                    className="w-7 h-7 object-contain mb-1.5"
                                                />
                                                <span className="text-[10px] font-black tracking-tight uppercase text-slate-700">{catName}</span>
                                            </div>
                                        );
                                    })}
                                    {categories.length === 0 && (
                                        <div className="text-xs text-slate-400 font-bold uppercase py-2">No Services Configured.</div>
                                    )}
                                </div>
                            )}
                        </section>



                        {/* Opening Times */}
                        <section className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF0B01]" /> Opening Times
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                                {weekdays.map((day) => {
                                    const operatingHours = formatOperatingHours(day, salon?.openingTime, salon?.closingTime, salon?.weeklyOffDay);
                                    const isOff = operatingHours === 'Closed';
                                    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                                    const isToday = day.toLowerCase() === todayName.toLowerCase();
                                    return (
                                        <div
                                            key={day}
                                            className={`flex justify-between items-center text-[11px] sm:text-xs font-bold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all ${isToday
                                                ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 shadow-sm'
                                                : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={`uppercase tracking-tight flex items-center gap-1.5 ${isToday ? 'text-[#FF0B01] font-black' : 'text-slate-500'
                                                }`}>
                                                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#FF0B01] animate-pulse shrink-0"></span>}
                                                {day}
                                                {isToday && <span className="text-[6px] sm:text-[7px] bg-[#FF0B01] text-white px-1 sm:px-1.5 py-0.5 rounded-md font-black tracking-widest">TODAY</span>}
                                            </span>
                                            <span className={`uppercase tracking-tight text-[10px] sm:text-xs ${isOff ? 'text-red-500' : isToday ? 'text-slate-900 font-black' : 'text-slate-700'
                                                }`}>
                                                {isOff ? 'Closed' : operatingHours}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* ── Top Experts (Staff) ── */}
                        <section ref={staffSectionRef} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Section Header */}
                            <div className="flex justify-between items-center px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Users className="w-4.5 h-4.5 text-[#FF0B01]" /> Top Experts
                                </h3>
                                <span
                                    onClick={() => navigate('/customer/book-service')}
                                    className="text-xs font-black text-[#FF0B01] cursor-pointer hover:underline uppercase tracking-wider flex items-center gap-0.5"
                                >
                                    View All <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>

                            {!staffLoaded ? (
                                <div className="flex flex-col items-center justify-center py-10 px-6">
                                    <div className="animate-spin h-8 w-8 border-[3px] border-[#FF0B01] border-t-transparent rounded-full mb-3"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading top experts...</p>
                                </div>
                            ) : staffList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 px-6">
                                    <Users className="w-10 h-10 text-slate-200 mb-2" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No experts currently listed</p>
                                </div>
                            ) : (
                                <div className="px-4 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {staffList.map((staff, index) => {
                                        const role = staff.speciality || ['Hair Stylist', 'Skin Specialist', 'Makeup Artist', 'General Expert'][index % 4];
                                        const rating = staff.rating != null ? parseFloat(staff.rating).toFixed(1) : null;
                                        const isTopRated = index === 0 && rating && parseFloat(rating) >= 4.0;
                                        return (
                                            <div
                                                key={staff.id}
                                                onClick={() => {
                                                    setSelectedExpert(staff.id);
                                                    localStorage.setItem('bookingSelectedExpert', staff.id);
                                                    localStorage.setItem('bookingSelectedDateObj', JSON.stringify(selectedDateObj));
                                                    if (selectedTime) localStorage.setItem('bookingSelectedTime', selectedTime);
                                                    if (selectedSlot) localStorage.setItem('bookingSelectedSlot', JSON.stringify(selectedSlot));
                                                    navigate('/customer/book-service', {
                                                        state: {
                                                            selectedExpert: staff.id,
                                                            selectedDateObj: selectedDateObj,
                                                            selectedTime: selectedTime
                                                        }
                                                    });
                                                }}
                                                className={`relative group rounded-xl sm:rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                                                    selectedExpert === staff.id
                                                        ? 'border-[#FF0B01] bg-red-50/20 shadow-md ring-2 ring-[#FF0B01]'
                                                        : isTopRated
                                                        ? 'border-amber-200 bg-gradient-to-b from-amber-50/60 via-white to-white shadow-md'
                                                        : 'border-slate-100 bg-slate-50/50 shadow-sm hover:border-slate-200'
                                                    }`}
                                            >
                                                {/* Top Rated Badge */}
                                                {isTopRated && (
                                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                                                            <Award className="w-3 h-3" /> Top Rated
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="p-5 flex flex-col items-center text-center">
                                                    {/* Avatar */}
                                                    <div className={`w-20 h-20 rounded-full overflow-hidden mb-4 relative flex items-center justify-center ring-[3px] ring-offset-2 ${isTopRated ? 'ring-amber-300' : 'ring-slate-200'
                                                        }`}>
                                                        {staff.imagePath ? (
                                                            <AsyncImage
                                                                imagePath={staff.imagePath}
                                                                alt={staff.name}
                                                                className="w-full h-full object-cover"
                                                                fallbackText={staff.name?.[0] || 'S'}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={getExpertImg(index)}
                                                                alt={staff.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Name */}
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{staff.name}</h4>

                                                    {/* Role */}
                                                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{role}</p>

                                                    {/* Rating */}
                                                    {rating && (
                                                        <div className="mt-3 flex items-center gap-1.5">
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3.5 h-3.5 ${i < Math.round(parseFloat(rating))
                                                                            ? 'text-amber-400 fill-amber-400'
                                                                            : 'text-slate-200'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-black text-slate-700">{rating}</span>
                                                        </div>
                                                    )}

                                                    {/* Contact Info */}
                                                    {(staff.phone || staff.email) && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 w-full space-y-1">
                                                            {staff.phone && (
                                                                <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 truncate">
                                                                    <Phone className="w-3 h-3 shrink-0" /> {staff.phone}
                                                                </p>
                                                            )}
                                                            {staff.email && (
                                                                <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 truncate">
                                                                    <Mail className="w-3 h-3 shrink-0" /> {staff.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Book Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/customer/book-service', {
                                                            state: {
                                                                selectedExpert: staff.id,
                                                                selectedDateObj: selectedDateObj,
                                                                selectedTime: selectedTime
                                                            }
                                                        })}
                                                        className={`mt-4 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.03] active:scale-95 ${isTopRated
                                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md'
                                                            : 'bg-slate-900 hover:bg-black text-white shadow-sm'
                                                            }`}
                                                    >
                                                        Book Now
                                                    </button>

                                                    {/* Availability badge */}
                                                    {selectedSlot && (
                                                        <div className="mt-2 text-center">
                                                            {availableStaffLoading ? (
                                                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Checking...</span>
                                                            ) : availableStaffIds.has(staff.id) ? (
                                                                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-green-600">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                    Available at {selectedTime}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                    Unavailable at {selectedTime}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* ── Quick Book — Date & Time Slots ── */}
                        <section ref={quickBookSectionRef} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
                                <Calendar className="w-4.5 h-4.5 text-[#FF0B01]" /> Available Slots
                            </h3>

                            {/* Month/Year Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-xs font-black tracking-wider text-slate-700">
                                <span className="uppercase text-slate-900">{selectedDateObj?.month || 'Date'}</span>
                                <span className="bg-red-50 text-[#FF0B01] text-[9.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                                    Year {selectedDateObj?.year || '2026'}
                                </span>
                            </div>

                            {/* Date Picker Scroller */}
                            <div className="flex gap-2.5 overflow-x-auto pb-4 border-b border-slate-100 scrollbar-none">
                                {nextDays.map((d, idx) => {
                                    const isSelectedDate = selectedDateObj?.fullDate === d.fullDate;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setSelectedDateObj(d);
                                                setSelectedTime(null);
                                                setSelectedSlot(null);
                                                setAvailableStaffForSlot([]);
                                                localStorage.removeItem('bookingSelectedSlot');
                                                localStorage.removeItem('bookingSelectedTime');
                                            }}
                                            className={`flex flex-col items-center justify-center py-3.5 px-4.5 rounded-2xl min-w-[62px] cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${isSelectedDate
                                                ? 'bg-gradient-to-b from-[#FF0B01] to-[#D00600] text-white shadow-md shadow-red-500/10'
                                                : 'text-slate-400 bg-slate-50 border border-slate-100 hover:bg-white hover:text-slate-700 hover:shadow-sm'
                                                }`}
                                        >
                                            <span className="text-[10px] font-extrabold uppercase mb-1">{d.day}</span>
                                            <span className="text-sm font-black">{d.num}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time Slots Grid */}
                            {slotsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 mt-5">
                                    <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Loading available slots...</p>
                                </div>
                            ) : salonSlots.length === 0 ? (
                                <div className="text-center py-8 mt-5">
                                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No slots available for this day</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mt-5">
                                    {salonSlots.map((slot, idx) => {
                                        const isSelected = selectedSlot?.startTime === slot.startTime;
                                        return (
                                            <button
                                                type="button"
                                                key={slot.startTime || idx}
                                                onClick={() => {
                                                    localStorage.setItem('bookingSelectedDateObj', JSON.stringify(selectedDateObj));
                                                    localStorage.setItem('bookingSelectedTime', slot.displayTime);
                                                    localStorage.setItem('bookingSelectedSlot', JSON.stringify(slot));
                                                    navigate('/customer/book-service', {
                                                        state: {
                                                            selectedDateObj: selectedDateObj,
                                                            selectedTime: slot.displayTime,
                                                            selectedSlot: slot
                                                        }
                                                    });
                                                }}
                                                className={`py-3 rounded-xl border text-center text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${isSelected
                                                    ? 'bg-gradient-to-b from-[#FF0B01] to-[#D00600] border-transparent text-white shadow-md shadow-red-500/10'
                                                    : 'border-slate-100 text-slate-700 bg-slate-50 hover:bg-white hover:border-slate-300'
                                                    }`}
                                            >
                                                {slot.displayTime}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* CTA to full booking page */}
                            {selectedSlot && (
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            localStorage.setItem('bookingSelectedDateObj', JSON.stringify(selectedDateObj));
                                            localStorage.setItem('bookingSelectedTime', selectedTime);
                                            localStorage.setItem('bookingSelectedSlot', JSON.stringify(selectedSlot));
                                            navigate('/customer/book-service', {
                                                state: {
                                                    selectedDateObj: selectedDateObj,
                                                    selectedTime: selectedTime
                                                }
                                            });
                                        }}
                                        className="w-full bg-gradient-to-b from-[#FF0B01] to-[#D00600] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-red-500/15"
                                    >
                                        Continue Booking for {selectedTime}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Products Grid */}
                        <section ref={productsSectionRef} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-4.5 h-4.5 text-[#FF0B01]" /> Products
                                </h3>
                                <span
                                    onClick={() => navigate('/customer/product-search', { state: { salonId: activeSalonId } })}
                                    className="text-xs font-black text-[#FF0B01] cursor-pointer hover:underline uppercase tracking-wider"
                                >
                                    See More
                                </span>
                            </div>
                            {!productsLoaded ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Loading catalog...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map((product, index) => (
                                        <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                                            <div>
                                                <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden mb-3.5 relative">
                                                    <img
                                                        src={getProductImg(product, index)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                                                    />
                                                </div>
                                                <span className="text-[9px] font-black text-[#FF0B01] uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md">
                                                    {product.category || 'Shampoo'}
                                                </span>
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-2.5 line-clamp-1 uppercase">{product.name}</h4>
                                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{product.description || 'Premium salon-grade styling product for daily use.'}</p>
                                            </div>
                                            <div className="mt-4 pt-3.5 border-t border-slate-55 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[9px] text-slate-450 font-bold block leading-none uppercase">Price</span>
                                                    <span className="text-sm font-extrabold text-slate-900 mt-1.5 block">₹{product.price}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/customer/product-details', { state: { product } })}
                                                    className="bg-slate-950 hover:bg-black text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {products.length === 0 && (
                                        <div className="col-span-2 text-center py-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                            No active catalog items.
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Customer Reviews */}
                        <section className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
                                <Star className="w-4.5 h-4.5 text-[#FF0B01]" /> Customer Reviews
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Rahul Sharma', rating: 5, date: '2 days ago', comment: 'Excellent service! The staff was very professional and the haircut was exactly what I wanted.' },
                                    { name: 'Priya Patel', rating: 4, date: '1 week ago', comment: 'Great ambiance and clean salon. The hair spa was relaxing. Highly recommended!' },
                                    { name: 'Amit Verma', rating: 5, date: '2 weeks ago', comment: 'Best salon in town. Fast booking and premium experience.' }
                                ].map((rev, index) => {
                                    const initials = rev.name.split(' ').map(n => n[0]).join('');
                                    return (
                                        <div key={index} className="p-3 sm:p-4 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-50 flex gap-3 sm:gap-4 transition hover:bg-slate-50/80">
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-[#FF0B01] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                                {initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{rev.name}</h4>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{rev.date}</span>
                                                </div>
                                                <div className="flex items-center text-amber-400 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-650 mt-2 leading-relaxed">{rev.comment}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>


                </div>
            </main>
        </div>
    );
};

export default SalonPage;
