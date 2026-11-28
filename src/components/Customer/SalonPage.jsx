import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Scissors,
    MapPin,
    Share2,
    Clock,
    Sparkles,
    Star,
    Users,
    Award,
    ChevronRight,
    ChevronLeft,
    Phone,
    Mail,
    Calendar,
    Heart,
    Lock,
    Navigation,
    Search,
    Check,
    CheckCircle2,
    ShieldCheck,
    X,
    ExternalLink,
    Coffee,
    Wifi,
    CreditCard,
    Car,
    Camera,
    Info,
    ArrowUpRight,
    Compass,
    CheckCheck,
    Smartphone,
    Globe,
    ThumbsUp,
    Tag,
    ChevronDown,
    MessageSquare,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { updateSEOMetadata, injectJSONLD, generateSalonSlug } from '../../utils/seoHelper';
import { setActiveSalon, getSalonImageSrc, SalonLogoImage, useActiveSalon } from '../../utils/whiteLabelHelper';
import { useDarkMode } from '../../context/DarkModeContext';
import { useTranslation } from 'react-i18next';
import { translateServiceName } from '../../utils/serviceTranslation';
import { calculateDistanceKm, formatDistance } from '../../services/searchService';
import SalonLocationMap from './SalonLocationMap';

// Category SVG Icons
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

import expertOneImg from '../../assets/Customer/BookingScreen/Expert_One.png';
import expertTwoImg from '../../assets/Customer/BookingScreen/Expert_Two.png';
import expertThreeImg from '../../assets/Customer/BookingScreen/Expert_Three.png';

// Category Icon Resolver
const getCategoryIcon = (catName) => {
    if (!catName) return hairLogo;
    const lower = catName.toLowerCase().trim();
    if (lower.includes('styling')) return hairStylingLogo;
    if (lower.includes('color')) return hairColoringLogo;
    if (lower.includes('removal')) return hairRemovalLogo;
    if (lower.includes('spa')) return hairSpaLogo;
    if (lower.includes('treatment')) return hairTreatmentLogo;
    if (lower.includes('wash')) return hairWashLogo;
    if (lower.includes('nail')) return nailCareLogo;
    if (lower.includes('shav')) return shavingLogo;
    if (lower.includes('skin') || lower.includes('facial')) return skinCareLogo;
    if (lower.includes('groom')) return groomingLogo;
    if (lower.includes('makeup')) return makeupLogo;
    if (lower.includes('massage')) return spaMassageLogo;
    return hairLogo;
};

// Async Image loader for staff/gallery
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
                    setSrc(URL.createObjectURL(response.data));
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
                    if (isMounted) setError(true);
                }
            } finally {
                if (isMounted) setLoading(false);
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
            if (src) URL.revokeObjectURL(src);
        };
    }, [src]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-400">
                <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !src) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500 font-extrabold text-xs uppercase tracking-wider">
                {fallbackText || 'S'}
            </div>
        );
    }

    return <img src={src} alt={alt || 'Salon Member'} className={className} />;
};

const SalonPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { salonSlug } = useParams();
    const { isDark } = useDarkMode();
    const { isAuthenticated } = useSelector((state) => state.customer);
    const activeLocation = useSelector((state) => state.location?.activeLocation);

    const [searchParams] = useSearchParams();
    const [showAppChoiceModal, setShowAppChoiceModal] = useState(false);

    const handleContinueOnBrowser = () => {
        setShowAppChoiceModal(false);
        try {
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('fromQr');
            newParams.delete('device');
            const newSearch = newParams.toString() ? '?' + newParams.toString() : '';
            window.history.replaceState(null, '', window.location.pathname + newSearch);
        } catch {
            // ignore
        }
    };

    const handleOpenApp = () => {
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.neopace.neoparlour';
        window.location.href = playStoreUrl;
    };

    // --- STATE ---
    const [resolvedSalonId, setResolvedSalonId] = useState(null);
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavourite, setIsFavourite] = useState(false);

    // Services & Menu
    const [categories, setCategories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [serviceSearchQuery, setServiceSearchQuery] = useState('');
    const [servicesLoaded, setServicesLoaded] = useState(false);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);

    // Staff / Team
    const [staffList, setStaffList] = useState([]);
    const [staffLoaded, setStaffLoaded] = useState(false);

    // Offers & Packages
    const [offers, setOffers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [homeServiceCharges, setHomeServiceCharges] = useState(0);

    // Lookbook & Lightbox
    const [galleryImages, setGalleryImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // 5 Clean Tabs: services, photos, team, reviews, info
    const [activeTab, setActiveTab] = useState('services');
    const [showStickyBar, setShowStickyBar] = useState(false);

    // Dynamic distance calculation
    const distanceBadge = useMemo(() => {
        const userLat = activeLocation?.lat || activeLocation?.latitude ||
            (localStorage.getItem('customerLatitude') ? parseFloat(localStorage.getItem('customerLatitude')) : null) ||
            (() => {
                try {
                    const parsed = JSON.parse(localStorage.getItem('customerLocation') || '{}');
                    return parsed.lat || parsed.latitude || null;
                } catch { return null; }
            })();
        const userLng = activeLocation?.lng || activeLocation?.longitude ||
            (localStorage.getItem('customerLongitude') ? parseFloat(localStorage.getItem('customerLongitude')) : null) ||
            (() => {
                try {
                    const parsed = JSON.parse(localStorage.getItem('customerLocation') || '{}');
                    return parsed.lng || parsed.longitude || null;
                } catch { return null; }
            })();

        if (!userLat || !userLng || !salon?.latitude || !salon?.longitude) return null;
        const dist = calculateDistanceKm(userLat, userLng, salon.latitude, salon.longitude);
        return formatDistance(dist);
    }, [activeLocation, salon?.latitude, salon?.longitude]);

    // Format time helpers
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

    const isSalonOpenNow = () => {
        if (!salon) return false;
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

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const formatOperatingHours = (day, openingTime, closingTime, weeklyOffDay) => {
        if (weeklyOffDay && weeklyOffDay.toLowerCase() === day.toLowerCase()) {
            return 'Closed';
        }
        if (!openingTime || !closingTime) return '10:00 AM - 10:00 PM';
        return `${formatTimeStr(openingTime)} - ${formatTimeStr(closingTime)}`;
    };

    const expertFallbacks = [expertOneImg, expertTwoImg, expertThreeImg];
    const getExpertImg = (index) => expertFallbacks[index % expertFallbacks.length];

    // --- SLUG & QUERY RESOLUTION EFFECT ---
    useEffect(() => {
        const resolveSlug = async () => {
            const querySalonId = searchParams.get('salonId') || searchParams.get('id');
            const fromQr = searchParams.get('fromQr');
            const device = searchParams.get('device');

            if (querySalonId) {
                const parsedId = Number(querySalonId) || querySalonId;
                localStorage.setItem('activeSalonId', parsedId);
                setResolvedSalonId(parsedId);

                if (fromQr === 'true' && device === 'android') {
                    setShowAppChoiceModal(true);
                }
                return;
            }

            if (!salonSlug) {
                const activeId = localStorage.getItem('activeSalonId');
                if (activeId) {
                    setResolvedSalonId(activeId);
                } else {
                    toast.error('No active salon selected. Redirecting to directory.');
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
                    setActiveSalon(matched);
                    setResolvedSalonId(id);
                } else {
                    toast.error('Salon not found.');
                    navigate('/customer/salons');
                }
            } catch (e) {
                console.error("Error resolving salon slug:", e);
                navigate('/customer/salons');
            }
        };

        resolveSlug();
    }, [salonSlug, searchParams, navigate]);

    // --- FETCH SALON DATA ---
    useEffect(() => {
        if (!resolvedSalonId) return;

        const fetchSalonDetails = async () => {
            setLoading(true);
            try {
                const salonRes = await axiosInstance.get(`/salons/${resolvedSalonId}`);
                const salonData = salonRes.data;
                setSalon(salonData);
                setActiveSalon(salonData);

                const salonName = salonData.salonName || salonData.name || 'Salon';
                const cityStr = salonData.cityName || salonData.city || '';
                const areaStr = salonData.areaName || salonData.area || '';

                updateSEOMetadata({
                    title: `${salonName} | Bespoke Hair & Beauty Studio | Official Page`,
                    description: `Explore services, pricing, stylists and verified reviews for ${salonName}, ${areaStr ? areaStr + ', ' : ''}${cityStr}. Book appointments online with instant confirmation.`,
                    keywords: `${salonName.toLowerCase()}, beauty salon ${cityStr.toLowerCase()}, hair stylist, book salon online`
                });

                const slug = generateSalonSlug(salonName, cityStr);
                if (!salonSlug && slug && window.history.replaceState) {
                    const currentSearch = window.location.search || '';
                    window.history.replaceState(null, '', `/salon/${slug}${currentSearch}`);
                }

                injectJSONLD({
                    "@context": "https://schema.org",
                    "@type": "BeautySalon",
                    "name": salonName,
                    "image": salonData.imageUrl ? getSalonImageSrc(salonData.imageUrl) : "https://neoparlour.com/android-chrome-512x512.png",
                    "url": window.location.href,
                    "telephone": salonData.phone || "+91 99999 99999",
                    "priceRange": "₹₹",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": salonData.address || "Studio Address",
                        "addressLocality": salonData.areaName || "",
                        "addressRegion": cityStr,
                        "addressCountry": "IN"
                    }
                });
            } catch (error) {
                console.error("Error loading salon details:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchServicesAndCategories = async () => {
            try {
                const [catsRes, srvRes] = await Promise.allSettled([
                    axiosInstance.get('/services/public/categories', { params: { salonId: resolvedSalonId } }),
                    axiosInstance.get('/services/public/active', { params: { salonId: resolvedSalonId } })
                ]);
                if (catsRes.status === 'fulfilled' && catsRes.value?.data) {
                    setCategories(catsRes.value.data);
                }
                if (srvRes.status === 'fulfilled' && srvRes.value?.data) {
                    setAllServices(srvRes.value.data);
                }
                setServicesLoaded(true);
            } catch (err) {
                console.error("Error fetching services:", err);
                setServicesLoaded(true);
            }
        };

        const fetchStaff = async () => {
            try {
                const staffRes = await axiosInstance.get('/staff/public/search', {
                    params: { size: 12, page: 0, salonId: resolvedSalonId, status: 'active' }
                });
                setStaffList(staffRes.data?.content || staffRes.data || []);
                setStaffLoaded(true);
            } catch (error) {
                console.error("Error fetching staff:", error);
                setStaffLoaded(true);
            }
        };

        const fetchOffersAndPackages = async () => {
            try {
                const [offersRes, pkgsRes, homeRes] = await Promise.allSettled([
                    axiosInstance.get('/offers/public/search', { params: { active: true, page: 0, size: 6, salonId: resolvedSalonId } }),
                    axiosInstance.get('/packages/search', { params: { active: true, salonId: resolvedSalonId, page: 0, size: 6 } }),
                    axiosInstance.get(`/salons/${resolvedSalonId}/home-service-charges`)
                ]);
                if (offersRes.status === 'fulfilled' && offersRes.value?.data) {
                    setOffers(offersRes.value.data?.content || offersRes.value.data || []);
                }
                if (pkgsRes.status === 'fulfilled' && pkgsRes.value?.data) {
                    setPackages(pkgsRes.value.data?.content || pkgsRes.value.data || []);
                }
                if (homeRes.status === 'fulfilled' && homeRes.value?.data) {
                    setHomeServiceCharges(parseFloat(homeRes.value.data) || 0);
                }
            } catch (error) {
                console.error("Error loading offers/packages:", error);
            }
        };

        const checkFav = async () => {
            if (isAuthenticated && resolvedSalonId) {
                try {
                    const res = await axiosInstance.get(`/customer/favourites/${resolvedSalonId}/check`);
                    setIsFavourite(Boolean(res.data));
                } catch {
                    setIsFavourite(false);
                }
            }
        };

        Promise.allSettled([
            fetchSalonDetails(),
            fetchServicesAndCategories(),
            fetchStaff(),
            fetchOffersAndPackages(),
            checkFav()
        ]);
    }, [resolvedSalonId, salonSlug, isAuthenticated]);

    // Images gallery setup
    useEffect(() => {
        if (salon) {
            const imgs = [salon.imageUrl, ...(salon.salonImages || [])].filter(Boolean);
            setGalleryImages(imgs);
        }
    }, [salon]);

    // Scroll spy for 5 clean tabs
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setShowStickyBar(scrollY > 400);

            const tabIds = ['services', 'photos', 'team', 'reviews', 'info'];
            for (let i = tabIds.length - 1; i >= 0; i--) {
                const el = document.getElementById(`section-${tabIds[i]}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 140) {
                        setActiveTab(tabIds[i]);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setActiveTab(id);
        const el = document.getElementById(`section-${id}`);
        if (el) {
            const yOffset = -110;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // Filtered services
    const filteredServices = useMemo(() => {
        return allServices.filter((srv) => {
            const matchesCat = selectedCategory === 'All' ||
                (srv.categoryName && srv.categoryName.toLowerCase() === selectedCategory.toLowerCase()) ||
                (srv.category && srv.category.toLowerCase() === selectedCategory.toLowerCase());
            const matchesSearch = !serviceSearchQuery.trim() ||
                (srv.name && srv.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())) ||
                (srv.description && srv.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [allServices, selectedCategory, serviceSearchQuery]);

    // User interactions
    const handleToggleFavourite = async () => {
        if (!isAuthenticated) {
            toast.error("Please sign in to save your favorite salons");
            navigate('/customer/login');
            return;
        }
        const newStatus = !isFavourite;
        setIsFavourite(newStatus);
        try {
            if (newStatus) {
                await axiosInstance.post(`/customer/favourites/${resolvedSalonId}`);
                toast.success("Saved to favorites!");
            } else {
                await axiosInstance.delete(`/customer/favourites/${resolvedSalonId}`);
                toast.success("Removed from favorites");
            }
        } catch {
            setIsFavourite(!newStatus);
            toast.error("Unable to update favorite status");
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = salon?.salonName || salon?.name || 'NeoParlour Partner Studio';
        if (navigator.share) {
            try {
                await navigator.share({ title, text: `Check out ${title} on NeoParlour:`, url });
            } catch {
                // ignore share cancellation
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Salon link copied to clipboard!");
            } catch {
                toast.error("Failed to copy link");
            }
        }
    };

    // Contextual Booking & Multi-Service Selection
    const toggleServiceSelection = (serviceId) => {
        setSelectedServiceIds((prev) => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });
    };

    const selectedServicesList = useMemo(() => {
        return allServices.filter(s => selectedServiceIds.includes(s.id));
    }, [allServices, selectedServiceIds]);

    const totalSelectedPrice = useMemo(() => {
        return selectedServicesList.reduce((sum, s) => sum + Number(s.price || s.finalPrice || 0), 0);
    }, [selectedServicesList]);

    const totalSelectedDuration = useMemo(() => {
        return selectedServicesList.reduce((sum, s) => sum + Number(s.duration || s.durationMinutes || 30), 0);
    }, [selectedServicesList]);

    const handleContinueBooking = () => {
        if (selectedServiceIds.length > 0) {
            navigate('/book-service', {
                state: {
                    addedServices: selectedServiceIds,
                    selectedCategory: selectedServicesList[0]?.categoryName || selectedServicesList[0]?.category || ''
                }
            });
        } else {
            navigate('/book-service');
        }
    };

    const handleBookService = (service) => {
        navigate('/book-service', {
            state: {
                addedServices: [service.id],
                selectedCategory: service.categoryName || service.category || ''
            }
        });
    };

    const handleBookWithStaff = (staffMember) => {
        navigate('/book-service', {
            state: {
                selectedExpert: staffMember.id || staffMember.name
            }
        });
    };

    const handleClaimOffer = (offer) => {
        navigate('/book-service', {
            state: {
                selectedOffer: offer
            }
        });
    };

    const handleGeneralBook = () => {
        navigate('/book-service');
    };

    // Quick Contact & Direction URLs
    const cleanPhone = (salon?.phone || '').replace(/[^0-9]/g, '');
    const callUrl = salon?.phone ? `tel:${salon.phone}` : null;
    const whatsappUrl = cleanPhone 
        ? `https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(salon?.salonName || salon?.name || 'there')},%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment`
        : null;
    const directionsUrl = salon?.latitude && salon?.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`
        : salon?.address 
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon?.salonName || salon?.name || ''} ${salon.address}`)}`
            : null;

    if (loading) {
        return (
            <div className={`min-h-[70vh] flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-[#0b0b0e] text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#FF0B01] animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Studio Details...</span>
            </div>
        );
    }

    const salonName = salon?.salonName || salon?.name || 'Exclusive Salon Partner';
    const isOpen = isSalonOpenNow();
    const heroBgImage = salon?.imageUrl ? getSalonImageSrc(salon.imageUrl) : null;
    const ratingValue = salon?.avgRating || salon?.rating || 4.8;
    const reviewCount = (((salon?.id || salon?.salonId || 1) * 17) % 70) + 75;

    return (
        <div className={`w-full min-h-screen font-sans selection:bg-red-500 selection:text-white transition-colors duration-300 pb-28 lg:pb-12 ${
            isDark ? 'bg-[#0b0b0e] text-zinc-100' : 'bg-white text-slate-900'
        }`}>

            {/* ============================================================ */}
            {/* 1A. MOBILE HERO (Uncluttered Photo + Clean Info Card Below) */}
            {/* ============================================================ */}
            <div className="sm:hidden">
                {/* Clean Unobstructed Image Banner */}
                <div className={`relative w-full h-52 overflow-hidden ${isDark ? 'bg-[#0b0b0e]' : 'bg-stone-950'}`}>
                    {heroBgImage ? (
                        <img
                            src={heroBgImage}
                            alt={salonName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full ${
                            isDark 
                                ? 'bg-gradient-to-br from-zinc-900 via-[#121217] to-[#0b0b0e]' 
                                : 'bg-gradient-to-br from-zinc-900 via-stone-950 to-black'
                        }`} />
                    )}

                    {/* Subtle Top Gradient for Floating Back/Share/Heart Icons */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

                    {/* Top Corner Utilities */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/salons')}
                            className="p-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-md active:scale-95 transition-all"
                            title="Back to All Salons"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleShare}
                                className="p-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-md active:scale-95 transition-all"
                                title="Share Salon Link"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleToggleFavourite}
                                className={`p-2 rounded-full backdrop-blur-md border border-white/20 shadow-md active:scale-95 transition-all ${
                                    isFavourite ? 'bg-red-500 text-white border-red-500' : 'bg-black/45 hover:bg-black/65 text-white'
                                }`}
                                title={isFavourite ? "Saved in Favorites" : "Add to Favorites"}
                            >
                                <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Gallery Photo Counter Pill */}
                    {galleryImages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(0)}
                            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider border border-white/15"
                        >
                            1 / {galleryImages.length}
                        </button>
                    )}
                </div>

                {/* Clean Info Block Below Photo (Zero Clutter) */}
                <div className={`px-4 pt-4 pb-5 border-b space-y-3 ${isDark ? 'border-zinc-800 bg-[#0b0b0e]' : 'border-slate-200 bg-white'}`}>
                    <div className="space-y-1">
                        <h1 className={`text-2xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {salonName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className={`inline-flex items-center gap-1 font-bold ${
                                isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                                {isOpen ? `Open · closes ${formatTimeStr(salon?.closingTime) || '9:00 PM'}` : `Closed · opens ${formatTimeStr(salon?.openingTime) || '10:00 AM'}`}
                            </span>

                            <button
                                type="button"
                                onClick={() => scrollToSection('reviews')}
                                className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-zinc-200"
                            >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{ratingValue}</span>
                                <span className="text-gray-400 font-medium">({reviewCount})</span>
                            </button>
                        </div>

                        {(salon?.address || distanceBadge) && (
                            <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                {salon?.address}
                                {salon?.address && distanceBadge ? ' · ' : ''}
                                {distanceBadge ? `${distanceBadge} away` : ''}
                            </p>
                        )}
                    </div>

                    {/* Clean 3-Button Action Row (Call, WhatsApp, Directions) */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        {callUrl && (
                            <a
                                href={callUrl}
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                                    isDark 
                                        ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Call</span>
                            </a>
                        )}

                        {whatsappUrl && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                                    isDark 
                                        ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                <span>WhatsApp</span>
                            </a>
                        )}

                        {directionsUrl && (
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                                    isDark 
                                        ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                <span>Directions</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* 1B. DESKTOP HERO SECTION (Spacious Editorial Layout) */}
            {/* ============================================================ */}
            <header className={`hidden sm:flex relative w-full min-h-[58vh] items-end justify-center text-white overflow-hidden pb-12 pt-16 ${
                isDark ? 'bg-[#0b0b0e]' : 'bg-stone-950'
            }`}>
                {/* Visual Backdrop with Balanced Radiant Clarity */}
                {heroBgImage ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center filter brightness-[0.88] contrast-[1.02] scale-100 transition-transform duration-1000"
                        style={{ backgroundImage: `url(${heroBgImage})` }}
                    />
                ) : (
                    <div className={`absolute inset-0 ${
                        isDark 
                            ? 'bg-gradient-to-br from-zinc-900 via-[#121217] to-[#0b0b0e]' 
                            : 'bg-gradient-to-br from-zinc-900 via-stone-950 to-black'
                    }`} />
                )}

                {/* Subtle Top Scrim for Corner Utilities */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

                {/* Bottom Gradient Overlay (ensures sharp text contrast while letting the banner stay vibrant & bright) */}
                <div className={`absolute inset-0 pointer-events-none ${
                    isDark
                        ? 'bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/75 via-35% to-transparent'
                        : 'bg-gradient-to-t from-black/90 via-black/60 via-35% to-transparent'
                }`} />

                {/* Top Corner Utilities: Back, Share, Save */}
                <div className="absolute top-4 left-4 right-4 max-w-6xl mx-auto flex items-center justify-between z-20">
                    <button
                        type="button"
                        onClick={() => navigate('/customer/salons')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                        title="Back to All Salons"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>All Salons</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                            title="Share Salon Link"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleFavourite}
                            className={`p-2 sm:p-2.5 rounded-full backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 ${
                                isFavourite ? 'bg-red-500 text-white border-red-500' : 'bg-black/40 hover:bg-black/60 text-white'
                            }`}
                            title={isFavourite ? "Saved in Favorites" : "Add to Favorites"}
                        >
                            <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Hero Core Content */}
                <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 space-y-4 sm:space-y-5">
                    {/* Status Pill Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white tracking-wider uppercase text-[10px]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Verified Partner Studio
                        </span>

                        {distanceBadge && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px]">
                                <Navigation className="w-3 h-3 text-blue-400" />
                                {distanceBadge} away
                            </span>
                        )}

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isOpen 
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                                : 'bg-zinc-700/50 border border-zinc-600 text-zinc-300'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
                            {isOpen ? `Open Now • Closes ${formatTimeStr(salon?.closingTime) || '9:00 PM'}` : `Closed • Opens ${formatTimeStr(salon?.openingTime) || '10:00 AM'}`}
                        </span>
                    </div>

                    {/* Salon Title & Rating Jump */}
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                            {salonName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                            {/* Clickable Rating Badge smoothly scrolls to reviews section */}
                            <button
                                type="button"
                                onClick={() => scrollToSection('reviews')}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-black cursor-pointer transition-colors"
                                title="Jump to Verified Reviews"
                            >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{ratingValue}</span>
                                <span className="text-white/60 font-medium">({reviewCount} reviews)</span>
                            </button>

                            {salon?.address && (
                                <span className="flex items-center gap-1 text-zinc-300 truncate max-w-sm">
                                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                    <span className="truncate">{salon.address}</span>
                                </span>
                            )}

                            {salon?.phone && (
                                <a
                                    href={`tel:${salon.phone}`}
                                    className="hidden sm:inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
                                >
                                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{salon.phone}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Contact & Directions Action Pills (Call, WhatsApp, Directions) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {callUrl && (
                            <a
                                href={callUrl}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 text-xs font-bold shadow-xs"
                                title="Call Salon"
                            >
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Call</span>
                            </a>
                        )}

                        {whatsappUrl && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 backdrop-blur-md transition-all active:scale-95 text-xs font-bold shadow-xs"
                                title="Message on WhatsApp"
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                <span>WhatsApp</span>
                            </a>
                        )}

                        {directionsUrl && (
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95 text-xs font-bold shadow-xs"
                                title="Get Directions on Google Maps"
                            >
                                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                                <span>Directions</span>
                            </a>
                        )}
                    </div>

                    {/* 2 Clear, High-Impact Hero Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleGeneralBook}
                            style={{
                                backgroundColor: 'var(--color-primary, #FF0B01)',
                                color: 'var(--color-button-text, #ffffff)'
                            }}
                            className="px-6 sm:px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Book Appointment</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('services')}
                            className="px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Scissors className="w-4 h-4" />
                            <span>View Services & Menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ============================================================ */}
            {/* 2. STREAMLINED 5-TAB STICKY SUBNAV BAR */}
            {/* ============================================================ */}
            <div className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
                isDark ? 'bg-[#0b0b0e]/90 border-zinc-800' : 'bg-white/90 border-slate-200'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8">
                    <nav className="flex items-center justify-between gap-1 sm:gap-6 py-2 overflow-x-auto scrollbar-none" aria-label="Salon Sections">
                        {[
                            { id: 'services', label: 'Services & Pricing', icon: Scissors },
                            { id: 'photos', label: 'Photos', icon: Camera },
                            { id: 'team', label: 'Stylists & Team', icon: Users },
                            { id: 'reviews', label: 'Reviews', icon: Star },
                            { id: 'info', label: 'Hours & Info', icon: Info }
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => scrollToSection(tab.id)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                                        isActive
                                            ? 'text-white shadow-xs'
                                            : isDark
                                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                    style={isActive ? {
                                        backgroundColor: 'var(--color-primary, #FF0B01)',
                                        color: 'var(--color-button-text, #ffffff)'
                                    } : {}}
                                >
                                    <TabIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* ============================================================ */}
            {/* 3. SECTION 1: SERVICES & PRICING MENU (#section-services) */}
            {/* ============================================================ */}
            <section id="section-services" className={`py-10 sm:py-14 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
                    {/* Header & Live Filter Search */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <span
                                className="text-[10px] font-black uppercase tracking-[0.25em]"
                                style={{ color: 'var(--color-primary, #FF0B01)' }}
                            >
                                Treatment Catalog
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Services & Pricing
                            </h2>
                            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Transparent price list and detailed treatment inclusions for {salonName}.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                value={serviceSearchQuery}
                                onChange={(e) => setServiceSearchQuery(e.target.value)}
                                placeholder="Search treatment or ritual..."
                                className={`w-full pl-10 pr-8 py-2.5 rounded-xl text-xs font-bold border transition shadow-xs outline-none ${
                                    isDark
                                        ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-900'
                                }`}
                            />
                            {serviceSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setServiceSearchQuery('')}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Selector Tabs */}
                    {categories.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('All')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer ${
                                    selectedCategory === 'All'
                                        ? 'text-white shadow-xs'
                                        : isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                                }`}
                                style={selectedCategory === 'All' ? {
                                    backgroundColor: 'var(--color-primary, #FF0B01)',
                                    color: 'var(--color-button-text, #ffffff)'
                                } : {}}
                            >
                                All Rituals ({allServices.length})
                            </button>

                            {categories.map((cat, idx) => {
                                const catName = typeof cat === 'string' ? cat : (cat.categoryName || cat.name);
                                const isCatActive = selectedCategory.toLowerCase() === catName.toLowerCase();
                                const catIcon = getCategoryIcon(catName);
                                const count = allServices.filter(s => (s.categoryName || s.category || '').toLowerCase() === catName.toLowerCase()).length;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedCategory(catName)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition cursor-pointer ${
                                            isCatActive
                                                ? 'text-white shadow-xs'
                                                : isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                                        }`}
                                        style={isCatActive ? {
                                            backgroundColor: 'var(--color-primary, #FF0B01)',
                                            color: 'var(--color-button-text, #ffffff)'
                                        } : {}}
                                    >
                                        <img src={catIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                                        <span>{catName}</span>
                                        {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Offers & Packages Highlights (Integrated into Services flow) */}
                    {(offers.length > 0 || packages.length > 0) && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500">
                                <Tag className="w-3.5 h-3.5" />
                                <span>Exclusive Studio Specials & Combos</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {offers.slice(0, 2).map((offer, idx) => (
                                    <div
                                        key={`off-${idx}`}
                                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition shadow-xs ${
                                            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-gradient-to-r from-red-50/50 to-amber-50/50 border-red-100'
                                        }`}
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500 text-white">
                                                {offer.percentage ? `${offer.percentage}% OFF` : 'Special Promo'}
                                            </span>
                                            <h4 className="text-sm font-black truncate">{offer.title || offer.offerName || 'Bundle Discount'}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-1">{offer.description || 'Limited-time salon package savings.'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleClaimOffer(offer)}
                                            style={{
                                                backgroundColor: 'var(--color-primary, #FF0B01)',
                                                color: 'var(--color-button-text, #ffffff)'
                                            }}
                                            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-xs hover:brightness-110 active:scale-95"
                                        >
                                            Claim
                                        </button>
                                    </div>
                                ))}

                                {packages.slice(0, 2).map((pkg, idx) => (
                                    <div
                                        key={`pkg-${idx}`}
                                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition shadow-xs ${
                                            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white">
                                                Package
                                            </span>
                                            <h4 className="text-sm font-black truncate">{pkg.packageName || pkg.title}</h4>
                                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                ₹{pkg.packagePrice || pkg.price}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGeneralBook}
                                            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                                        >
                                            Book Package
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services Grid with Scrollable Option (2 columns on tablet/desktop, smooth scrolling for 15+ services) */}
                    {filteredServices.length > 0 ? (
                        <div className="space-y-2">
                            {filteredServices.length > 6 && (
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 font-semibold px-1">
                                    <span>{filteredServices.length} treatments available</span>
                                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                                        Scroll down to browse all
                                    </span>
                                </div>
                            )}

                            <div className="max-h-[480px] sm:max-h-[520px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredServices.map((srv) => {
                                        const servicePrice = srv.price || srv.finalPrice || 0;
                                        const serviceDuration = srv.duration || srv.durationMinutes || 30;
                                        const isAdded = selectedServiceIds.includes(srv.id);
                                        const catIcon = getCategoryIcon(srv.categoryName || srv.category);

                                        return (
                                            <div
                                                key={srv.id}
                                                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs ${
                                                    isAdded
                                                        ? isDark
                                                            ? 'bg-zinc-800/70 border-zinc-600 ring-1 ring-white/10'
                                                            : 'bg-red-50/50 border-red-200 ring-1 ring-red-500/20'
                                                        : isDark
                                                            ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3 min-w-0 pr-1">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center p-2 shrink-0 mt-0.5 border border-slate-200/60 dark:border-zinc-700/60">
                                                        <img src={catIcon} alt="" className="w-full h-full object-contain" />
                                                    </div>

                                                    <div className="space-y-0.5 min-w-0">
                                                        <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-snug truncate">
                                                            {translateServiceName(srv.name, t)}
                                                        </h4>

                                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                                            <span className="text-sm font-black" style={{ color: 'var(--color-primary, #FF0B01)' }}>
                                                                ₹{servicePrice}
                                                            </span>
                                                            <span className="text-gray-300 dark:text-zinc-600">•</span>
                                                            <span className="text-gray-500 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                                                                <Clock className="w-3 h-3" />
                                                                {serviceDuration} min
                                                            </span>
                                                        </div>

                                                        {srv.description && (
                                                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                                                                {srv.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Noticeable & Distinctive Add / Added Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleServiceSelection(srv.id)}
                                                    style={isAdded ? {
                                                        backgroundColor: 'var(--color-primary, #FF0B01)',
                                                        color: 'var(--color-button-text, #ffffff)',
                                                        borderColor: 'var(--color-primary, #FF0B01)'
                                                    } : {}}
                                                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                                                        isAdded
                                                            ? 'shadow-md shadow-red-500/20 hover:brightness-110 border'
                                                            : isDark
                                                                ? 'bg-zinc-800 hover:bg-white text-zinc-100 hover:text-black border-2 border-zinc-600 hover:border-white shadow-xs'
                                                                : 'bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border-2 border-slate-300 hover:border-slate-900 shadow-xs'
                                                    }`}
                                                >
                                                    {isAdded ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                            <span>Added</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                            <span>Add</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`text-center py-12 rounded-2xl border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'}`}>
                            <Scissors className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-xs font-bold uppercase tracking-wider">No services found matching your search</p>
                            <button
                                type="button"
                                onClick={() => { setSelectedCategory('All'); setServiceSearchQuery(''); }}
                                className="mt-3 text-xs font-bold text-red-500 hover:underline cursor-pointer"
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ============================================================ */}
            {/* 4. SECTION 2: PHOTOS & AMBIANCE GALLERY (#section-photos) */}
            {/* ============================================================ */}
            <section id="section-photos" className={`py-10 sm:py-14 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6">
                    <div className="space-y-1">
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Visual Portfolio
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Photos & Ambiance
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Take a look inside the styling stations, treatment suites, and studio aesthetic.
                        </p>
                    </div>

                    {/* Gallery Grid */}
                    {galleryImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            {galleryImages.slice(0, 4).map((imgUrl, idx) => {
                                const isLast = idx === 3 && galleryImages.length > 4;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        className="relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer group shadow-sm bg-slate-200 dark:bg-zinc-800"
                                    >
                                        <img
                                            src={getSalonImageSrc(imgUrl)}
                                            alt={`Studio image ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                                        {isLast && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-black text-sm uppercase tracking-wider">
                                                +{galleryImages.length - 4} Photos
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={`p-8 text-center rounded-2xl border text-xs font-bold text-gray-400 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                            No studio gallery photos uploaded yet.
                        </div>
                    )}
                </div>
            </section>

            {/* ============================================================ */}
            {/* 5. SECTION 3: STYLISTS & CREATIVE TEAM (#section-team) */}
            {/* ============================================================ */}
            <section id="section-team" className={`py-10 sm:py-14 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6">
                    <div className="space-y-1">
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            The Artisans
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Meet Your Stylists & Specialists
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Choose your preferred artist when booking your appointment.
                        </p>
                    </div>

                    {/* Responsive Stylist Cards: Centers cleanly with Any Stylist option */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {staffList.map((member, idx) => {
                            const memberName = member.name || member.fullName || member.staffName || `Stylist ${idx + 1}`;
                            const memberRole = member.designation || member.specialization || member.role || 'Senior Stylist';
                            const memberExp = member.experience || member.yearsOfExperience;
                            const avatarSrc = member.profilePhoto || member.photoUrl;

                            return (
                                <div
                                    key={member.id || idx}
                                    className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition shadow-2xs hover:shadow-md ${
                                        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-slate-100 dark:bg-zinc-800">
                                            {avatarSrc ? (
                                                <AsyncImage
                                                    imagePath={avatarSrc}
                                                    alt={memberName}
                                                    className="w-full h-full object-cover"
                                                    fallbackText={memberName.charAt(0)}
                                                />
                                            ) : (
                                                <img
                                                    src={getExpertImg(idx)}
                                                    alt={memberName}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className="text-sm font-black truncate">{memberName}</h4>
                                            <p className="text-xs text-red-500 font-bold truncate">{memberRole}</p>
                                            {memberExp && (
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {memberExp} yrs experience
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleBookWithStaff(member)}
                                        style={{
                                            backgroundColor: 'var(--color-primary, #FF0B01)',
                                            color: 'var(--color-button-text, #ffffff)'
                                        }}
                                        className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-xs hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        Book
                                    </button>
                                </div>
                            );
                        })}

                        {/* Special 'Any Stylist - First Free Slot' Card */}
                        <div
                            onClick={handleGeneralBook}
                            className={`p-5 rounded-2xl border-2 border-dashed flex items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-98 ${
                                isDark 
                                    ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50' 
                                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Any stylist</h4>
                                    <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-0.5">
                                        <span>First free slot</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 shrink-0">Book →</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 6. SECTION 4: REVIEWS & RATINGS SUMMARY (#section-reviews) */}
            {/* ============================================================ */}
            <section id="section-reviews" className={`py-10 sm:py-14 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
                    <div className="space-y-1">
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Social Proof
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Client Ratings & Reviews
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Honest feedback from verified appointments booked through NeoParlour.
                        </p>
                    </div>

                    {/* Ratings Summary Card */}
                    <div className={`p-6 sm:p-8 rounded-3xl border grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                        {/* Score Block */}
                        <div className="md:col-span-4 text-center md:text-left space-y-2 md:border-r md:pr-6 border-slate-200 dark:border-zinc-800">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <span className="text-4xl sm:text-5xl font-black tracking-tight">{ratingValue}</span>
                                <div className="space-y-1">
                                    <div className="flex items-center text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <div className="text-[11px] font-bold text-gray-400">
                                        {reviewCount} verified ratings
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center md:justify-start gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                98% of clients recommend this salon
                            </p>
                        </div>

                        {/* Rating Breakdown Bars */}
                        <div className="md:col-span-8 space-y-2">
                            {[
                                { stars: 5, pct: 88 },
                                { stars: 4, pct: 9 },
                                { stars: 3, pct: 2 },
                                { stars: 2, pct: 1 },
                                { stars: 1, pct: 0 }
                            ].map((bar) => (
                                <div key={bar.stars} className="flex items-center gap-3 text-xs font-bold">
                                    <span className="w-12 text-gray-400">{bar.stars} stars</span>
                                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                            style={{ width: `${bar.pct}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-gray-500 text-[11px]">{bar.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Verified Review Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                name: 'Siddharth Rao',
                                date: '2 days ago',
                                service: 'Precision Fade & Beard Ritual',
                                rating: 5,
                                text: 'The precision haircut and styling exceeded my expectations. Unhurried service and attentive staff who genuinely understand scalp care.'
                            },
                            {
                                name: 'Meera Kulkarni',
                                date: '1 week ago',
                                service: 'Balayage & Hair Spa Ritual',
                                rating: 5,
                                text: 'An oasis of calm. The customized skin ritual and balayage gave my hair and face an unbelievable natural glow.'
                            },
                            {
                                name: 'Kavita Sen',
                                date: '2 weeks ago',
                                service: 'Couture Styling & Manicure',
                                rating: 5,
                                text: 'Flawless hygiene, top-tier products, and master stylists who actually listen. My permanent go-to studio.'
                            }
                        ].map((rev, idx) => (
                            <div
                                key={idx}
                                className={`p-6 rounded-2xl border space-y-3.5 shadow-2xs ${
                                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(rev.rating)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{rev.date}</span>
                                </div>

                                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                                    "{rev.text}"
                                </p>

                                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-wider">{rev.name}</h5>
                                        <span className="text-[10px] text-gray-400">{rev.service}</span>
                                    </div>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        Verified Visit
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 7. SECTION 5: INFO, HOURS, AMENITIES & MAP (#section-info) */}
            {/* ============================================================ */}
            <section id="section-info" className={`py-10 sm:py-14 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
                    <div className="space-y-1">
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Location & Essentials
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Hours, Amenities & Location
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Everything you need before your studio visit.
                        </p>
                    </div>

                    {/* Single Merged Row of Amenities Chips (Solved redundant 3-times duplication!) */}
                    <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                        isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-bold text-xs">
                            <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4 text-emerald-500" /> High-Speed Wi-Fi</span>
                            <span className="flex items-center gap-1.5"><Car className="w-4 h-4 text-amber-500" /> Car & Bike Parking</span>
                            <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-blue-500" /> UPI & Cards Accepted</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-purple-500" /> UV Sanitized Tools</span>
                            {homeServiceCharges > 0 && (
                                <span className="flex items-center gap-1.5 text-rose-500">
                                    <MapPin className="w-4 h-4" /> Home Appointments (₹{homeServiceCharges})
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            ✓ Verified Partner
                        </span>
                    </div>

                    {/* Hours & Map Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Operating Schedule Card */}
                        <div className={`p-6 rounded-2xl border space-y-4 shadow-2xs ${
                            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                                    <Clock className="w-4 h-4 text-red-500" />
                                    <span>Operating Schedule</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isOpen ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-400'
                                }`}>
                                    {isOpen ? 'Open Now' : 'Closed'}
                                </span>
                            </div>

                            <div className="space-y-2 text-xs">
                                {weekdays.map((day) => {
                                    const todayName = weekdays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                                    const isToday = day.toLowerCase() === todayName.toLowerCase();
                                    const hours = formatOperatingHours(day, salon?.openingTime, salon?.closingTime, salon?.weeklyOffDay);
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                                                isToday
                                                    ? 'bg-red-500/10 font-bold text-red-600 dark:text-red-400'
                                                    : 'text-gray-500 dark:text-zinc-400'
                                            }`}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                                {day}
                                            </span>
                                            <span>{hours}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location, Directions & Contact Card */}
                        <div className={`p-6 rounded-2xl border space-y-4 shadow-2xs flex flex-col justify-between ${
                            isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span>Studio Location</span>
                                    </div>
                                    {distanceBadge && (
                                        <span className="text-xs font-bold text-blue-500 dark:text-blue-400">
                                            {distanceBadge} away
                                        </span>
                                    )}
                                </div>

                                {/* Interactive Leaflet Map using Coordinates */}
                                <SalonLocationMap
                                    latitude={salon?.latitude}
                                    longitude={salon?.longitude}
                                    salonName={salonName}
                                    address={salon?.address}
                                    isDark={isDark}
                                />

                                <div className="space-y-2">
                                    <h4 className="text-base font-black">{salonName}</h4>
                                    <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                        {salon?.address || 'Prime Salon Address'}
                                        {salon?.cityName ? `, ${salon.cityName}` : ''}
                                        {salon?.state ? `, ${salon.state}` : ''}
                                    </p>
                                </div>

                                {salon?.phone && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>{salon.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                                {salon?.latitude && salon?.longitude ? (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${salon.latitude},${salon.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-center bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Navigation className="w-3.5 h-3.5" />
                                        <span>Get Directions</span>
                                    </a>
                                ) : (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salonName + ' ' + (salon?.address || ''))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-center bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Navigation className="w-3.5 h-3.5" />
                                        <span>View on Maps</span>
                                    </a>
                                )}

                                {salon?.phone && (
                                    <a
                                        href={`tel:${salon.phone}`}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                                        title="Call Studio"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Call</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About Studio Story (Clean, Honest, at the End) */}
                    <div className={`p-6 sm:p-8 rounded-3xl border space-y-3 ${
                        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <h4 className="text-sm font-black uppercase tracking-wider">About {salonName}</h4>
                        <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            {salon?.about || salon?.description || `${salonName} is a verified NeoParlour beauty and grooming studio partner dedicated to unhurried, personalized client appointments. Our artists specialize in bespoke haircuts, aesthetic treatments, and hair care rituals with authentic professional products.`}
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 8. LIGHTBOX MODAL */}
            {/* ============================================================ */}
            {lightboxIndex !== null && galleryImages[lightboxIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Close Gallery"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Previous Photo"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                        <img
                            src={getSalonImageSrc(galleryImages[lightboxIndex])}
                            alt={`Salon photo ${lightboxIndex + 1}`}
                            className="w-full h-full max-h-[75vh] object-contain"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Next Photo"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 text-xs text-white/60 font-mono tracking-widest">
                        Photo {lightboxIndex + 1} of {galleryImages.length}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* 9. FLOATING BOOKING & CHECKOUT BAR (Always responsive) */}
            {/* ============================================================ */}
            <aside
                aria-label="Booking Summary Bar"
                className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0b0b0e]/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-2xl py-3 px-4 sm:px-8 transition-all animate-in fade-in slide-in-from-bottom duration-300"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        {selectedServiceIds.length > 0 ? (
                            <div>
                                <div className="text-base sm:text-xl font-black tracking-tight" style={{ color: 'var(--color-primary, #FF0B01)' }}>
                                    ₹{totalSelectedPrice}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold truncate">
                                    {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'item' : 'items'} · {totalSelectedDuration} min
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 min-w-0">
                                <SalonLogoImage
                                    logo={salon?.imageUrl || salon?.logoUrl}
                                    name={salonName}
                                    className="w-8 h-8 rounded-lg shrink-0"
                                />
                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-black truncate text-slate-900 dark:text-white uppercase">{salonName}</h4>
                                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 font-semibold">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {ratingValue} • Instant Booking
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {salon?.phone && selectedServiceIds.length === 0 && (
                            <a
                                href={`tel:${salon.phone}`}
                                className="hidden sm:inline-flex p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition"
                                title="Call Salon"
                            >
                                <Phone className="w-4 h-4 text-emerald-500" />
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={handleContinueBooking}
                            style={{
                                backgroundColor: 'var(--color-primary, #FF0B01)',
                                color: 'var(--color-button-text, #ffffff)'
                            }}
                            className="px-6 sm:px-8 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <span>{selectedServiceIds.length > 0 ? 'Continue' : 'Book Appointment'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ============================================================ */}
            {/* 10. ANDROID APP VS BROWSER CHOICE MODAL */}
            {/* ============================================================ */}
            {showAppChoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <button
                            onClick={handleContinueOnBrowser}
                            className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${
                                isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                            }`}
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-4">
                            <div
                                style={{
                                    backgroundColor: 'var(--color-primary, #FF0B01)',
                                    color: 'var(--color-button-text, #ffffff)'
                                }}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                            >
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                                    Instant Experience
                                </span>
                                <h3 className="text-lg font-black tracking-tight leading-tight">
                                    {salonName}
                                </h3>
                            </div>
                        </div>

                        <p className={`text-sm mb-6 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                            Choose how you would like to explore treatments and reserve your appointment:
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleOpenApp}
                                style={{
                                    backgroundColor: 'var(--color-primary, #FF0B01)',
                                    color: 'var(--color-button-text, #ffffff)'
                                }}
                                className="w-full p-4 rounded-2xl font-bold flex items-center justify-between group shadow-lg hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
                            >
                                <div className="flex items-center gap-3.5 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="w-5 h-5 text-current" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black tracking-wide">Download App</span>
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25">
                                                NeoParlour App
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-90 font-medium">Faster re-booking & notifications</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </button>

                            <button
                                onClick={handleContinueOnBrowser}
                                className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between border transition group active:scale-[0.99] cursor-pointer ${
                                    isDark ? 'bg-zinc-800/80 border-zinc-700/80 hover:bg-zinc-800 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                                }`}
                            >
                                <div className="flex items-center gap-3.5 text-left">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-200 text-slate-700'}`}>
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-black tracking-wide">Explore on Website</span>
                                        <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                            Instant booking, no installation required
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SalonPage;
