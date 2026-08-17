import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { updateSEOMetadata, injectJSONLD, generateSalonSlug } from '../../utils/seoHelper';
import { useTranslation } from 'react-i18next';
import { translateServiceName } from '../../utils/serviceTranslation';



// SVG Category Logos from src/assets/Logos
import hairLogo from '../../assets/Logos/Hair.svg';
import hairStylingLogo from '../../assets/Logos/Hair Styling.svg';
import hairColoringLogo from '../../assets/Logos/Hair coloring.svg';
import hairRemovalLogo from '../../assets/Logos/Hair removal.svg';
import hairSpaLogo from '../../assets/Logos/Hair spa.svg';
import hairTreatmentLogo from '../../assets/Logos/Hair treatment.svg';
import hairWashLogo from '../../assets/Logos/Hair wash.svg';
import nailCareLogo from '../../assets/Logos/Nail care.svg';
import shavingLogo from '../../assets/Logos/Shaving.svg';
import skinCareLogo from '../../assets/Logos/Skin care.svg';
import dryerLogo from '../../assets/Logos/Dryer.svg';
import groomingLogo from '../../assets/Logos/grooming.svg';
import makeupLogo from '../../assets/Logos/makeup.svg';
import spaMassageLogo from '../../assets/Logos/spa & massage.svg';

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
import SEOFooter from '../common/SEOFooter';

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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { salonSlug } = useParams();
    const { isAuthenticated } = useSelector((state) => state.customer);
    const [resolvedSalonId, setResolvedSalonId] = useState(null);

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
    const [packages, setPackages] = useState([]);
    const [packagesLoaded, setPackagesLoaded] = useState(false);
    const [packagesLoading, setPackagesLoading] = useState(false);

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

    // Slug resolution effect
    useEffect(() => {
        const resolveSlug = async () => {
            if (!salonSlug) {
                const activeId = localStorage.getItem('activeSalonId');
                if (activeId) {
                    setResolvedSalonId(activeId);
                } else {
                    toast.error('No active salon selected. Redirecting to search.');
                    navigate('/customer/salons');
                }
                return;
            }

            try {
                const slugLower = salonSlug.toLowerCase();
                let detectedCity = '';
                const knownCities = ['pune', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'delhi', 'new-delhi', 'navi-mumbai'];
                for (const kc of knownCities) {
                    if (slugLower.endsWith(`-${kc}`)) {
                        detectedCity = kc;
                        break;
                    }
                }
                if (!detectedCity) {
                    const parts = slugLower.split('-');
                    detectedCity = parts[parts.length - 1];
                }

                // Fetch salons in that city
                const response = await axiosInstance.get('/salons/by-city', {
                    params: { cityName: detectedCity }
                });
                const salonsList = response.data?.content || response.data || [];
                const generateSlug = (name, city) => {
                    const cleanName = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const cleanCity = (city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return `${cleanName}-${cleanCity}`;
                };
                const matched = salonsList.find(s => generateSlug(s.salonName || s.name, s.cityName) === slugLower);
                if (matched) {
                    const id = matched.salonId || matched.id;
                    localStorage.setItem('activeSalonId', id);
                    localStorage.setItem('activeSalonName', matched.salonName || matched.name);
                    setResolvedSalonId(id);
                } else {
                    toast.error('Salon not found. Redirecting...');
                    navigate('/customer/salons');
                }
            } catch (e) {
                console.error("Error resolving salon slug:", e);
                toast.error('Error finding salon.');
                navigate('/customer/salons');
            }
        };

        resolveSlug();
    }, [salonSlug, navigate]);

    // Load Salon Details and active offers immediately on mount when resolvedSalonId is set
    useEffect(() => {
        if (!resolvedSalonId) return;

        const fetchSalonDetails = async () => {
            setLoading(true);
            try {
                const salonRes = await axiosInstance.get(`/salons/${resolvedSalonId}`);
                const salonData = salonRes.data;
                setSalon(salonData);

                // Dynamically update SEO metadata with exact salon name & location
                const salonName = salonData.salonName || salonData.name || 'Salon';
                const cityStr = salonData.cityName || salonData.city || '';
                const areaStr = salonData.areaName || salonData.area || '';
                const servicesStr = salonData.services ? salonData.services.join(', ') : 'Hair Spa, Facial & Bridal Makeup';

                const seoTitle = `${salonName}${cityStr ? ' (' + cityStr + ')' : ''} | Hair Spa, Facial & Bridal Makeup | NeoParlour`;
                const seoDesc = `Book appointment online at ${salonName} in ${areaStr ? areaStr + ', ' : ''}${cityStr}. Read customer reviews, check price list, opening hours and get exclusive discounts on NeoParlour.`;
                const seoKeywords = `${salonName.toLowerCase()}, ${salonName.toLowerCase()} ${cityStr.toLowerCase()}, beauty parlour ${cityStr.toLowerCase()}, hair salon ${cityStr.toLowerCase()}, book ${salonName.toLowerCase()} online`;

                updateSEOMetadata({
                    title: seoTitle,
                    description: seoDesc,
                    keywords: seoKeywords
                });

                // If accessed via generic /salon URL, update browser address bar seamlessly to /salon/:slug for SEO
                const slug = generateSalonSlug(salonName, cityStr);
                if (!salonSlug && slug && window.history.replaceState) {
                    window.history.replaceState(null, '', `/salon/${slug}`);
                }

                // Inject dynamic Schema.org JSON-LD structured data
                const reviewsCount = (((salonData.salonId || salonData.id || 0) * 17) % 80) + 40;
                const rating = salonData.rating || "4.7";
                injectJSONLD({
                    "@context": "https://schema.org",
                    "@type": "BeautySalon",
                    "name": salonName,
                    "image": salonData.imageUrl ? getSalonImageSrc(salonData.imageUrl, "https://neoparlour.com/android-chrome-512x512.png") : "https://neoparlour.com/android-chrome-512x512.png",
                    "url": window.location.href,
                    "telephone": salonData.phone || "+91 99999 99999",
                    "priceRange": "₹₹",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": salonData.address || "Main Street",
                        "addressLocality": salonData.areaName || "",
                        "addressRegion": cityStr,
                        "addressCountry": "IN"
                    },
                    "openingHoursSpecification": {
                        "@type": "OpeningHoursSpecification",
                        "opens": salonData.openingTime || "09:00",
                        "closes": salonData.closingTime || "21:00"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": rating,
                        "reviewCount": reviewsCount
                    },
                    "review": {
                        "@type": "Review",
                        "author": {
                            "@type": "Person",
                            "name": "Verified Customer"
                        },
                        "reviewRating": {
                            "@type": "Rating",
                            "ratingValue": rating
                        },
                        "reviewBody": `Excellent services at ${salonName}! Very professional staff and great ambiance.`
                    }
                });

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
                    params: { active: true, page: 0, size: 10, salonId: resolvedSalonId }
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
            if (isAuthenticated && resolvedSalonId) {
                try {
                    const res = await axiosInstance.get(`/customer/favourites/${resolvedSalonId}/check`);
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
                const res = await axiosInstance.get(`/salons/${resolvedSalonId}/home-service-charges`);
                const charge = parseFloat(res.data) || 0;
                setHomeServiceCharges(charge);
            } catch (error) {
                console.error("Error loading home service charges:", error);
            }
        };

        const fetchServices = async () => {
            try {
                const categoriesRes = await axiosInstance.get('/services/public/categories', {
                    params: { salonId: resolvedSalonId }
                });
                setCategories(categoriesRes.data || []);
                setServicesLoaded(true);
            } catch (error) {
                console.error("Error fetching services categories dynamically:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const productsRes = await axiosInstance.get('/products/public/filter', {
                    params: { active: true, size: 4, salonId: resolvedSalonId }
                });
                const productData = productsRes.data?.content || productsRes.data || [];
                setProducts(productData.slice(0, 4));
                setProductsLoaded(true);
            } catch (error) {
                console.error("Error fetching products dynamically:", error);
            }
        };

        const fetchPackages = async () => {
            setPackagesLoading(true);
            try {
                const res = await axiosInstance.get('/packages/search', {
                    params: {
                        active: true,
                        salonId: resolvedSalonId,
                        page: 0,
                        size: 10
                    }
                });
                setPackages(res.data?.content || []);
                setPackagesLoaded(true);
            } catch (error) {
                console.error("Error fetching packages dynamically:", error);
            } finally {
                setPackagesLoading(false);
            }
        };

        Promise.allSettled([
            fetchSalonDetails(),
            fetchActiveOffers(),
            checkFavStatus(),
            fetchHomeServiceCharges(),
            fetchServices(),
            fetchProducts(),
            isAuthenticated ? fetchPackages() : Promise.resolve()
        ]);
    }, [resolvedSalonId, navigate, isAuthenticated]);


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
                await axiosInstance.post(`/customer/favourites/${resolvedSalonId}`);
                toast.success(`Added ${salonName} to favourites`, {
                    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
                });
            } else {
                await axiosInstance.delete(`/customer/favourites/${resolvedSalonId}`);
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
        if (!resolvedSalonId) return;
        const fetchSalonSlots = async () => {
            setSlotsLoading(true);
            try {
                const dateInstant = dateObjToInstant(selectedDateObj);
                const params = { salonId: resolvedSalonId };
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
    }, [resolvedSalonId, selectedDateObj]);

    // --- FETCH AVAILABLE STAFF when time slot selected ---
    useEffect(() => {
        if (!resolvedSalonId || !selectedSlot?.startTime) {
            setAvailableStaffForSlot([]);
            return;
        }
        const fetchAvailableStaff = async () => {
            setAvailableStaffLoading(true);
            try {
                const res = await axiosInstance.get('/appointments/public/available-staff', {
                    params: {
                        salonId: resolvedSalonId,
                        selectedTime: selectedSlot.startTime,
                        durationMinutes: 0 // default for salon page (no services selected yet)
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
    }, [resolvedSalonId, selectedSlot]);

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

    // Lazy load Staff — fetch top 3 by rating via /staff/public/search
    const fetchStaff = async () => {
        if (staffLoaded) return;
        try {
            console.log("[SalonPage] Scroll down triggered: Fetching top 3 staff from /staff/public/search...");
            const staffRes = await axiosInstance.get('/staff/public/search', {
                params: { size: 3, page: 0, salonId: resolvedSalonId }
            });
            const staffData = staffRes.data?.content || staffRes.data || [];
            setStaffList(staffData);
            setStaffLoaded(true);
        } catch (error) {
            console.error("Error fetching staff dynamically:", error);
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

        const staffObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchStaff();
                staffObserver.disconnect();
            }
        }, observerOptions);

        if (staffSectionRef.current && !staffLoaded) staffObserver.observe(staffSectionRef.current);

        return () => {
            staffObserver.disconnect();
        };
    }, [loading, staffLoaded]);

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

    // Category mapping helper using SVG Logos from src/assets/Logos
    const getCategoryIcon = (catName) => {
        if (!catName) return hairLogo;
        const catLower = String(catName).toLowerCase().trim();

        const exactMap = {
            'hair': hairLogo,
            'haircut': hairLogo,
            'hair cut': hairLogo,
            'hair styling': hairStylingLogo,
            'hairstyling': hairStylingLogo,
            'styling': hairStylingLogo,
            'hair coloring': hairColoringLogo,
            'coloring': hairColoringLogo,
            'hair color': hairColoringLogo,
            'hair removal': hairRemovalLogo,
            'hairremoval': hairRemovalLogo,
            'waxing': hairRemovalLogo,
            'threading': hairRemovalLogo,
            'hair spa': hairSpaLogo,
            'hairspa': hairSpaLogo,
            'hair treatment': hairTreatmentLogo,
            'hairtreatment': hairTreatmentLogo,
            'hair wash': hairWashLogo,
            'hairwash': hairWashLogo,
            'shampoo': hairWashLogo,
            'nail care': nailCareLogo,
            'nailcare': nailCareLogo,
            'nails': nailCareLogo,
            'nail': nailCareLogo,
            'manicure': nailCareLogo,
            'pedicure': nailCareLogo,
            'shaving': shavingLogo,
            'beard': shavingLogo,
            'skin care': skinCareLogo,
            'skincare': skinCareLogo,
            'skin': skinCareLogo,
            'facial': skinCareLogo,
            'clean up': skinCareLogo,
            'cleanup': skinCareLogo,
            'dryer': dryerLogo,
            'blowdry': dryerLogo,
            'grooming': groomingLogo,
            'makeup': makeupLogo,
            'make up': makeupLogo,
            'bridal': makeupLogo,
            'spa': spaMassageLogo,
            'massage': spaMassageLogo,
            'spa & massage': spaMassageLogo,
            'wellness': spaMassageLogo,
        };

        if (exactMap[catLower]) return exactMap[catLower];

        // Keyword fuzzy matching against SVG logos
        if (catLower.includes('color') || catLower.includes('dye') || catLower.includes('highlight')) {
            return hairColoringLogo;
        }
        if (catLower.includes('removal') || catLower.includes('wax') || catLower.includes('thread') || catLower.includes('laser')) {
            return hairRemovalLogo;
        }
        if (catLower.includes('spa') || catLower.includes('massage') || catLower.includes('wellness')) {
            return spaMassageLogo;
        }
        if (catLower.includes('treatment') || catLower.includes('keratin') || catLower.includes('rebond') || catLower.includes('smooth')) {
            return hairTreatmentLogo;
        }
        if (catLower.includes('makeup') || catLower.includes('make-up') || catLower.includes('bridal') || catLower.includes('cosmetic')) {
            return makeupLogo;
        }
        if (catLower.includes('style') || catLower.includes('styling')) {
            return hairStylingLogo;
        }
        if (catLower.includes('dry') || catLower.includes('blow')) {
            return dryerLogo;
        }
        if (catLower.includes('wash') || catLower.includes('shampoo') || catLower.includes('cleanse')) {
            return hairWashLogo;
        }
        if (catLower.includes('shave') || catLower.includes('beard') || catLower.includes('mustache')) {
            return shavingLogo;
        }
        if (catLower.includes('groom')) {
            return groomingLogo;
        }
        if (catLower.includes('skin') || catLower.includes('facial') || catLower.includes('bleach') || catLower.includes('derma')) {
            return skinCareLogo;
        }
        if (catLower.includes('nail') || catLower.includes('mani') || catLower.includes('pedi') || catLower.includes('lash') || catLower.includes('extens')) {
            return nailCareLogo;
        }
        if (catLower.includes('cut') || catLower.includes('hair') || catLower.includes('trim') || catLower.includes('barber')) {
            return hairLogo;
        }

        return hairLogo;
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
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans antialiased text-slate-800 dark:text-zinc-100">
                <nav className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-3.5 shadow-sm">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-[10px] text-slate-300 dark:text-zinc-600 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                        <div className="h-3 yt-skeleton rounded w-16"></div>
                        <span>&gt;</span>
                        <div className="h-3 yt-skeleton rounded w-28"></div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
                    {/* Salon Header Hero Card Skeleton */}
                    <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="h-64 sm:h-80 w-full yt-skeleton rounded-2xl"></div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-3 w-full">
                                <div className="h-8 yt-skeleton rounded-2xl w-64"></div>
                                <div className="h-4 yt-skeleton rounded-lg w-48"></div>
                                <div className="flex gap-2">
                                    <div className="h-6 yt-skeleton rounded-xl w-24"></div>
                                    <div className="h-6 yt-skeleton rounded-xl w-20"></div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <div className="w-10 h-10 yt-skeleton rounded-2xl"></div>
                                <div className="w-10 h-10 yt-skeleton rounded-2xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* 2-Column Content Skeleton */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                        <div className="w-full lg:w-[60%] shrink-0 space-y-6">
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    <div className="h-9 w-24 yt-skeleton rounded-xl shrink-0"></div>
                                    <div className="h-9 w-28 yt-skeleton rounded-xl shrink-0"></div>
                                    <div className="h-9 w-24 yt-skeleton rounded-xl shrink-0"></div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl flex justify-between items-center">
                                            <div className="space-y-2">
                                                <div className="h-5 yt-skeleton rounded-lg w-44"></div>
                                                <div className="h-4 yt-skeleton rounded-lg w-28"></div>
                                            </div>
                                            <div className="h-9 w-20 yt-skeleton rounded-xl"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[40%] bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="h-6 yt-skeleton rounded-xl w-36"></div>
                            <div className="h-32 yt-skeleton rounded-2xl"></div>
                            <div className="h-12 yt-skeleton rounded-2xl w-full"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const mainImageToShow = galleryImages[0] || null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans antialiased text-slate-800 dark:text-zinc-100">

            {/* ==================== BREADCRUMBS ==================== */}
            <nav className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-3.5 shadow-sm">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-[10px] text-slate-400 dark:text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                    <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => navigate('/customer/salons')}>{t('salon_page.search', 'Search')}</span>
                    <span>&gt;</span>
                    <span className="text-slate-900 dark:text-zinc-100 font-black">{t('salon_page.salon_description', 'Salon Description')}</span>
                </div>
            </nav>

            {/* ==================== MAIN CONTENT ==================== */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

                {/* Salon Headline Block */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6 sm:mb-8 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                    <div className="min-w-0 flex-1 space-y-2.5">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 dark:text-white tracking-tight uppercase truncate">
                            {salon?.name || salon?.salonName || 'Salon Details'}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                            <span className="truncate">{[salon?.address, salon?.areaName, salon?.cityName].filter(Boolean).join(', ') || 'No address specified'}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                                isSalonOpenNow()
                                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSalonOpenNow() ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
                                <span className="whitespace-nowrap">{isSalonOpenNow() ? t('salon_page.open', 'Open') : t('salon_page.closed', 'Closed')}</span>
                                <span className="text-slate-300 dark:text-zinc-600">|</span>
                                <span className="whitespace-nowrap">{salon?.openingTime ? formatTimeStr(salon.openingTime) : '10:00 AM'} - {salon?.closingTime ? formatTimeStr(salon.closingTime) : '10:00 PM'}</span>
                            </div>
                            {salon?.salonCode && (
                                <span className="text-[9px] font-bold bg-slate-50 dark:bg-zinc-800 text-slate-450 dark:text-zinc-300 border border-slate-150/60 dark:border-zinc-700 px-2.5 py-1.5 rounded uppercase tracking-widest">
                                    {t('salon_page.code', 'Code: {{code}}', { code: salon.salonCode })}
                                </span>
                            )}
                            {homeServiceCharges > 0 && (
                                <span className="text-[9px] font-bold bg-red-50 dark:bg-red-950/30 text-[#FF0B01] dark:text-red-400 border border-red-200 dark:border-red-800 px-2.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                                    {t('salon_page.home_service', 'Home Service: ₹{{amount}}', { amount: homeServiceCharges })}
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
                            {t('salon_page.book_services', 'Book Services')}
                        </button>
                        <button
                            type="button"
                            onClick={handleShare}
                            className="p-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition shadow-sm cursor-pointer"
                            title="Share Salon"
                        >
                            <Share2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleFavourite}
                            className={`p-2.5 border rounded-2xl transition shadow-sm cursor-pointer ${
                                isFavourite 
                                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-[#ff0b01]' 
                                    : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                            }`}
                            title={isFavourite ? "Remove from Favourites" : "Mark as Favourite"}
                        >
                            <Heart className={`w-4.5 h-4.5 ${isFavourite ? 'fill-[#ff0b01] text-[#ff0b01]' : 'text-slate-600 dark:text-zinc-300'}`} />
                        </button>
                    </div>
                </div>

                {/* Master Two-Column Grid Setup */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">

                    {/* LEFT CONTAINER CANVAS (Full Width since sidebar has no active cards) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Salon Images Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4" data-aos="fade-up">
                            {/* Large Image (Left) */}
                            <div className="md:col-span-2 h-[220px] sm:h-[320px] md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-150 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                {mainImageToShow ? (
                                    <img
                                        src={getSalonImageSrc(mainImageToShow)}
                                        alt={salon?.name || 'Salon Cover'}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500">
                                        <Scissors className="w-10 h-10 text-slate-350 dark:text-zinc-600 mb-2 animate-bounce" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{t('salon_page.no_image', 'No Image Available')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Two Stacked Images (Right) */}
                            <div className="flex flex-row md:flex-col gap-3 sm:gap-4 h-[140px] sm:h-[180px] md:h-[400px]">
                                <div
                                    onClick={() => galleryImages[1] && swapGalleryImage(1)}
                                    className="flex-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-all"
                                    title="Click to swap with main image"
                                >
                                    {galleryImages[1] ? (
                                        <img
                                            src={getSalonImageSrc(galleryImages[1])}
                                            alt="Gallery 1"
                                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500">
                                            <Scissors className="w-6 h-6 text-slate-350 dark:text-zinc-600 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">{t('salon_page.no_image_short', 'No Image')}</span>
                                        </div>
                                    )}
                                </div>
                                <div
                                    onClick={() => galleryImages[2] && swapGalleryImage(2)}
                                    className="flex-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-all"
                                    title="Click to swap with main image"
                                >
                                    {galleryImages[2] ? (
                                        <img
                                            src={getSalonImageSrc(galleryImages[2])}
                                            alt="Gallery 2"
                                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500">
                                            <Scissors className="w-6 h-6 text-slate-350 dark:text-zinc-600 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">{t('salon_page.no_image_short', 'No Image')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Photos Gallery Section (placed directly below header images) */}
                        {galleryImages.filter(Boolean).length > 0 && (
                            <section className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                        <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff0b01]" /> {t('salon_page.photos_gallery', 'Photos Gallery')}
                                    </h3>
                                    <span className="bg-red-50 dark:bg-red-950/30 text-[#ff0b01] dark:text-red-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-transparent dark:border-red-900/50">
                                        {t('salon_page.photos_count', '{{count}} photos', { count: galleryImages.filter(Boolean).length })}
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
                                                        : 'border-slate-100 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-500 hover:scale-105 cursor-pointer'
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
                                                        <span className="bg-[#ff0b01] text-white text-[8px] font-black uppercase px-1 rounded-sm">{t('salon_page.main', 'Main')}</span>
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

                        {/* Offers Available For You */}
                        {offers.length > 0 && (
                            <section className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-visible relative" data-aos="fade-up">
                                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff0b01]" /> {t('salon_page.exclusive_offers', 'Exclusive Offers for You')}
                                </h3>
                                {offersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="animate-spin h-6 w-6 border-2 border-[#ff0b01] border-t-transparent rounded-full mb-2"></div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('salon_page.syncing_deals', 'Syncing Exclusive Deals...')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {offers.map((offer) => {
                                            const isPercentage = offer.discountType === 'PERCENTAGE' || offer.percentage !== undefined;
                                            const value = offer.discountValue ?? offer.percentage ?? 0;
                                            const discountText = isPercentage ? `${value}%` : `₹${value}`;
                                            const offText = "OFF";
                                            
                                            return (
                                                <div
                                                    key={offer.id}
                                                    className="flex flex-row relative bg-white dark:bg-zinc-900 border border-red-100 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-500 hover:shadow-lg rounded-2xl transition-all duration-300 group"
                                                >
                                                    {/* Left Side (Voucher Value Card) */}
                                                    <div className="w-24 sm:w-28 md:w-32 flex-shrink-0 bg-gradient-to-br from-red-50/70 via-red-50/30 to-white dark:from-red-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center justify-center p-3 rounded-l-2xl relative border-r border-dashed border-red-100/60 dark:border-zinc-800 overflow-hidden">
                                                        {formatDiscountText(discountText)}
                                                        <span className="text-[8px] sm:text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">{offText}</span>
                                                        <span className="text-red-500/5 select-none font-black text-5xl absolute -left-1 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500">%</span>
                                                    </div>
     
                                                    {/* Tear Notch Cutouts */}
                                                    <div className="absolute -top-2.5 left-[96px] sm:left-[112px] md:left-[128px] -translate-x-1/2 w-5 h-5 rounded-full bg-slate-50 dark:bg-zinc-950 border border-red-100/60 dark:border-zinc-800 z-10"></div>
                                                    <div className="absolute -bottom-2.5 left-[96px] sm:left-[112px] md:left-[128px] -translate-x-1/2 w-5 h-5 rounded-full bg-slate-50 dark:bg-zinc-950 border border-red-100/60 dark:border-zinc-800 z-10"></div>
                                                    
                                                    {/* Dashed Separator Line */}
                                                    <div className="absolute top-2.5 bottom-2.5 left-[96px] sm:left-[112px] md:left-[128px] border-l border-dashed border-red-150 dark:border-zinc-800 -translate-x-[0.5px] pointer-events-none z-10"></div>
     
                                                    {/* Right Side (Voucher Details) */}
                                                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0 bg-white dark:bg-zinc-900 rounded-r-2xl">
                                                        <div>
                                                            <h4 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight truncate group-hover:text-[#ff0b01] transition-colors">{offer.name}</h4>
                                                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1.5 font-semibold leading-relaxed line-clamp-2">
                                                                {offer.description || `Get ${discountText} off on ${offer.services?.map(s => s.name).join(', ') || 'selected services'}.`}
                                                            </p>
                                                        </div>
     
                                                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50 dark:border-zinc-800/80 mt-4">
                                                            <div className="min-w-0">
                                                                {offer.validTo ? (
                                                                    <>
                                                                        <span className="text-[8px] text-slate-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider block leading-none">{t('salon_page.expires_on', 'Expires on')}</span>
                                                                        <span className="text-[11px] font-black text-slate-800 dark:text-zinc-200 mt-1 block truncate">
                                                                            {new Date(offer.validTo).toLocaleDateString()}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('salon_page.valid_today', 'Valid Today')}</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate('/customer/book-service', { state: { selectedOffer: offer } })}
                                                                className="bg-[#ff0b01] hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition duration-300 shadow-xs whitespace-nowrap cursor-pointer transform hover:scale-105 active:scale-95"
                                                            >
                                                                {t('salon_page.claim_deal', 'Claim Deal')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Services Categories icons list */}
                        {categories.length > 0 && (
                            <section ref={servicesSectionRef} className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2">
                                    <Scissors className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF0B01]" /> {t('salon_page.services_categories', 'SERVICES CATEGORIES')}
                                </h3>
                                {!servicesLoaded ? (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('salon_page.loading_categories', 'Loading Categories...')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-4">
                                        {categories.map((catName) => {
                                            const catIcon = getCategoryIcon(catName);
                                            return (
                                                <div
                                                    key={catName}
                                                    onClick={() => navigate('/customer/book-service', { state: { selectedCategory: catName } })}
                                                    className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 min-w-0 sm:min-w-[84px] h-[76px] sm:h-[84px] shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 transition-all transform hover:scale-105 active:scale-95"
                                                >
                                                    <img
                                                        src={catIcon}
                                                        alt={catName}
                                                        className="w-7 h-7 object-contain mb-1.5"
                                                    />
                                                    <span className="text-[10px] font-black tracking-tight uppercase text-slate-700 dark:text-zinc-200">{translateServiceName(catName, t)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Packages Section */}
                        {isAuthenticated && packages.length > 0 && (
                            <section className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm relative" data-aos="fade-up">
                                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff0b01]" /> {t('salon_page.special_packages', 'Special Packages')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {packages.map((pkg) => {
                                        const savings = pkg.discountValue || 0;
                                        return (
                                            <div
                                                key={pkg.id}
                                                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#ff0b01] dark:border-l-[#ff0b01] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start gap-3">
                                                        <h4 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-tight line-clamp-1">{pkg.name}</h4>
                                                        {savings > 0 && (
                                                            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                                                                {t('salon_page.save', 'Save ₹{{amount}}', { amount: savings })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-2 font-semibold leading-relaxed line-clamp-2">
                                                        {pkg.description || "No description provided."}
                                                    </p>
                                                    
                                                    {/* Services included list */}
                                                    {pkg.services && pkg.services.length > 0 && (
                                                        <div className="mt-4">
                                                            <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase block mb-1.5">{t('salon_page.services_included', 'Services Included:')}</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {pkg.services.map(service => (
                                                                    <span key={service.id} className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-50 dark:bg-zinc-800 text-slate-650 dark:text-zinc-300 border border-slate-100 dark:border-zinc-700">
                                                                        {translateServiceName(service.name, t)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-50 dark:border-zinc-800 mt-4">
                                                    <div>
                                                        <span className="text-[8px] text-slate-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider block leading-none">{t('salon_page.price', 'Price')}</span>
                                                        <span className="text-sm font-black text-[#ff0b01] mt-1.5 block">₹{pkg.packagePrice}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/customer/book-service', { state: { selectedPackage: pkg } })}
                                                        className="bg-slate-900 hover:bg-[#ff0b01] text-white text-[9px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition duration-300 shadow-sm whitespace-nowrap cursor-pointer transform hover:scale-105 active:scale-95"
                                                    >
                                                        {t('salon_page.book_package', 'Book Package')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Opening Times */}
                        <section className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 sm:mb-5 flex items-center gap-2">
                                <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF0B01]" /> {t('salon_page.opening_times', 'Opening Times')}
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
                                                ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-zinc-800 border border-red-100 dark:border-zinc-800 shadow-sm'
                                                : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                                                }`}
                                        >
                                            <span className={`uppercase tracking-tight flex items-center gap-1.5 ${isToday ? 'text-[#FF0B01] font-black' : 'text-slate-500 dark:text-zinc-400'
                                                }`}>
                                                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#FF0B01] animate-pulse shrink-0"></span>}
                                                {t('days.' + day.toLowerCase(), day)}
                                                {isToday && <span className="text-[6px] sm:text-[7px] bg-[#FF0B01] text-white px-1 sm:px-1.5 py-0.5 rounded-md font-black tracking-widest">{t('salon_page.today', 'TODAY')}</span>}
                                            </span>
                                            <span className={`uppercase tracking-tight text-[10px] sm:text-xs ${isOff ? 'text-red-500' : isToday ? 'text-slate-900 dark:text-white font-black' : 'text-slate-700 dark:text-zinc-300'
                                                }`}>
                                                {isOff ? t('salon_page.closed', 'Closed') : operatingHours}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* ── Top Experts (Staff) ── */}
                        <section ref={staffSectionRef} className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden" data-aos="fade-up">
                            {/* Section Header */}
                            <div className="flex justify-between items-center px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('salon_page.our_experts', 'Our Experts')}
                                </h3>
                                <span
                                    onClick={() => navigate('/customer/book-service')}
                                    className="text-xs font-black text-[#FF0B01] cursor-pointer hover:underline uppercase tracking-wider flex items-center gap-0.5"
                                >
                                    {t('salon_page.view_all', 'View All')} <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>

                            {!staffLoaded ? (
                                <div className="flex flex-col items-center justify-center py-10 px-6">
                                    <div className="animate-spin h-8 w-8 border-[3px] border-[#FF0B01] border-t-transparent rounded-full mb-3"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">{t('salon_page.loading_experts', 'Loading top experts...')}</p>
                                </div>
                            ) : staffList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 px-6">
                                    <Users className="w-10 h-10 text-slate-200 dark:text-zinc-700 mb-2" />
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{t('salon_page.no_experts', 'No experts currently listed')}</p>
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
                                                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center justify-between group relative overflow-hidden"
                                            >
                                                <div className="flex flex-col items-center w-full">
                                                    {/* Avatar */}
                                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-red-50 dark:border-zinc-800 shadow-sm bg-slate-50 dark:bg-zinc-800 shrink-0">
                                                        {staff.imagePath ? (
                                                            <AsyncImage
                                                                imagePath={staff.imagePath}
                                                                alt={staff.name}
                                                                className="w-full h-full object-cover"
                                                                fallbackText={staff.name ? staff.name.charAt(0) : 'S'}
                                                            />
                                                        ) : (
                                                            <img 
                                                                src={staff.avatar 
                                                                    ? staff.avatar 
                                                                    : getExpertImg(index)} 
                                                                alt={staff.name} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Name */}
                                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{staff.name}</h4>

                                                    {/* Role */}
                                                    <p className="text-[10px] text-slate-400 dark:text-zinc-400 mt-1 font-bold uppercase tracking-wider">{role}</p>

                                                    {/* Rating */}
                                                    {rating && (
                                                        <div className="mt-3 flex items-center gap-1.5">
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3.5 h-3.5 ${i < Math.round(parseFloat(rating))
                                                                            ? 'text-amber-400 fill-amber-400'
                                                                            : 'text-slate-200 dark:text-zinc-700'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-black text-slate-700 dark:text-zinc-300">{rating}</span>
                                                        </div>
                                                    )}

                                                    {/* Contact Info */}
                                                    {(staff.phone || staff.email) && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 w-full space-y-1">
                                                            {staff.phone && (
                                                                <p className="text-[10px] text-slate-400 dark:text-zinc-400 font-semibold flex items-center justify-center gap-1 truncate">
                                                                    <Phone className="w-3 h-3 shrink-0" /> {staff.phone}
                                                                </p>
                                                            )}
                                                            {staff.email && (
                                                                <p className="text-[10px] text-slate-400 dark:text-zinc-400 font-semibold flex items-center justify-center gap-1 truncate">
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
                                                        {t('salon_page.book_now', 'Book Now')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* ── Quick Book — Date & Time Slots ── */}
                        <section ref={quickBookSectionRef} className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                <Calendar className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('salon_page.available_slots', 'Available Slots')}
                            </h3>

                            {/* Month/Year Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-5 text-xs font-black tracking-wider text-slate-700 dark:text-zinc-300">
                                <span className="uppercase text-slate-900 dark:text-white">{selectedDateObj?.month || 'Date'}</span>
                                <span className="bg-red-50 dark:bg-red-950/30 text-[#FF0B01] dark:text-red-400 text-[9.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                                    {t('salon_page.year', 'Year {{year}}', { year: selectedDateObj?.year || '2026' })}
                                </span>
                            </div>

                            {/* Date Picker Scroller */}
                            <div className="flex gap-2.5 overflow-x-auto pb-4 border-b border-slate-100 dark:border-zinc-800 scrollbar-none">
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
                                                : 'text-slate-400 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 hover:shadow-sm'
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
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('salon_page.loading_slots', 'Loading available slots...')}</p>
                                </div>
                            ) : salonSlots.length === 0 ? (
                                <div className="text-center py-8 mt-5">
                                    <Clock className="w-8 h-8 text-slate-200 dark:text-zinc-700 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{t('salon_page.no_slots', 'No slots available for this day')}</p>
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
                                                    : 'border-slate-100 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
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
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
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
                                        {t('salon_page.continue_booking', 'Continue Booking for {{time}}', { time: selectedTime })}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Products Grid */}
                        {products.length > 0 && (
                            <section ref={productsSectionRef} className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('salon_page.specialized_products', 'Products')}
                                    </h3>
                                    <span
                                        onClick={() => navigate('/customer/product-search', { state: { salonId: resolvedSalonId } })}
                                        className="text-xs font-black text-[#FF0B01] cursor-pointer hover:underline uppercase tracking-wider"
                                    >
                                        {t('salon_page.see_more', 'See More')}
                                    </span>
                                </div>
                                {!productsLoaded ? (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Loading catalog...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {products.map((product, index) => (
                                            <div key={product.id} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                                                <div>
                                                    <div className="aspect-video bg-slate-50 dark:bg-zinc-800 rounded-xl overflow-hidden mb-3.5 relative">
                                                        <img
                                                            src={getProductImg(product, index)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                                                        />
                                                    </div>
                                                    <span className="text-[9px] font-black text-[#FF0B01] uppercase tracking-wider bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md">
                                                        {product.category || 'Shampoo'}
                                                    </span>
                                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2.5 line-clamp-1 uppercase">{product.name}</h4>
                                                    <p className="text-[10px] text-slate-400 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{product.description || 'Premium salon-grade styling product for daily use.'}</p>
                                                </div>
                                                <div className="mt-4 pt-3.5 border-t border-slate-150 dark:border-zinc-800 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold block leading-none uppercase">{t('salon_page.price', 'Price')}</span>
                                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 block">₹{product.price}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/customer/product-details', { state: { product } })}
                                                        className="bg-slate-950 hover:bg-black text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm"
                                                    >
                                                        {t('salon_page.buy_now', 'Buy Now')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Customer Reviews */}
                        <section className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm" data-aos="fade-up">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                <Star className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('salon_page.reviews_rating', 'Customer Reviews')}
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Rahul Sharma', rating: 5, date: '2 days ago', comment: 'Excellent service! The staff was very professional and the haircut was exactly what I wanted.' },
                                    { name: 'Priya Patel', rating: 4, date: '1 week ago', comment: 'Great ambiance and clean salon. The hair spa was relaxing. Highly recommended!' },
                                    { name: 'Amit Verma', rating: 5, date: '2 weeks ago', comment: 'Best salon in town. Fast booking and premium experience.' }
                                ].map((rev, index) => {
                                    const initials = rev.name.split(' ').map(n => n[0]).join('');
                                    return (
                                        <div key={index} className="p-3 sm:p-4 bg-slate-50/50 dark:bg-zinc-800/40 rounded-xl sm:rounded-2xl border border-slate-50 dark:border-zinc-800/80 flex gap-3 sm:gap-4 transition hover:bg-slate-50/80 dark:hover:bg-zinc-800/60">
                                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-[#FF0B01] dark:text-red-400 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                                {initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{rev.name}</h4>
                                                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{rev.date}</span>
                                                </div>
                                                <div className="flex items-center text-amber-400 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200 dark:text-zinc-700'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-650 dark:text-zinc-300 mt-2 leading-relaxed">{rev.comment}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>


                </div>
            </main>
            {/* <SEOFooter /> */}
        </div>
    );
};

export default SalonPage;
