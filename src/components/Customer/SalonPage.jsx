import React, { useState, useEffect, useMemo } from 'react';
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
    Sunrise,
    Sun,
    Sunset,
    Moon,
    Smartphone,
    Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { updateSEOMetadata, injectJSONLD, generateSalonSlug } from '../../utils/seoHelper';
import { setActiveSalon, getSalonImageSrc, SalonLogoImage, useActiveSalon } from '../../utils/whiteLabelHelper';
import { useDarkMode } from '../../context/DarkModeContext';
import { useTranslation } from 'react-i18next';
import { translateServiceName } from '../../utils/serviceTranslation';
import { calculateDistanceKm, formatDistance } from '../../services/searchService';

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

import expertOneImg from '../../assets/Customer/BookingScreen/Expert_One.png';
import expertTwoImg from '../../assets/Customer/BookingScreen/Expert_Two.png';
import expertThreeImg from '../../assets/Customer/BookingScreen/Expert_Three.png';

// Fallback Products
import productOne from '../../assets/Customer/ProductSearch/product_one.jpg';
import productTwo from '../../assets/Customer/ProductSearch/product_two.jpg';
import productThree from '../../assets/Customer/ProductSearch/product_three.jpg';

// --- ASYNC IMAGE HELPER ---
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

    return <img src={src} alt={alt || 'Artisan'} className={className} />;
};

// Helper: classify time slot into morning, afternoon, evening, night
const getSlotPeriod = (slot) => {
    let hour = null;
    if (slot.displayTime) {
        const match = slot.displayTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
            hour = parseInt(match[1], 10);
            const period = match[3] ? match[3].toUpperCase() : null;
            if (period === 'PM' && hour < 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
        }
    }
    if (hour === null && slot.startTime) {
        if (slot.startTime.includes('T')) {
            const d = new Date(slot.startTime);
            if (!isNaN(d.getTime())) {
                const ist = new Date(d.getTime() + 330 * 60000);
                hour = ist.getUTCHours();
            }
        } else {
            const parts = slot.startTime.split(':');
            if (parts.length >= 1) hour = parseInt(parts[0], 10);
        }
    }
    if (hour === null) hour = 10;
    if (hour < 12) return 'morning';
    if (hour < 16) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
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

    // Staff / Creative Collective
    const [staffList, setStaffList] = useState([]);
    const [staffLoaded, setStaffLoaded] = useState(false);

    // Curations (Offers & Packages)
    const [offers, setOffers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [homeServiceCharges, setHomeServiceCharges] = useState(0);

    // Lookbook & Lightbox
    const [galleryImages, setGalleryImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Concierge Dock & Active Section Tracking
    const [activeSection, setActiveSection] = useState('atelier');
    const [showConciergeDock, setShowConciergeDock] = useState(false);

    // Concierge Slot Booking & Time-of-Day Segmenting
    const getNextDays = () => {
        const days = [];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                day: weekdays[d.getDay()],
                num: d.getDate(),
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                fullDate: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
            });
        }
        return days;
    };
    const nextDays = useMemo(() => getNextDays(), []);
    const [selectedDateObj, setSelectedDateObj] = useState(nextDays[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [salonSlots, setSalonSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    // Segmented Slots by Time of Day
    const segmentedSlots = useMemo(() => {
        const morning = [];
        const afternoon = [];
        const evening = [];
        const night = [];

        salonSlots.forEach((slot) => {
            const period = getSlotPeriod(slot);
            if (period === 'morning') morning.push(slot);
            else if (period === 'afternoon') afternoon.push(slot);
            else if (period === 'evening') evening.push(slot);
            else night.push(slot);
        });

        return { morning, afternoon, evening, night };
    }, [salonSlots]);

    // Active slots displayed according to selected period
    const displayedSlots = useMemo(() => {
        if (selectedPeriod === 'morning') return segmentedSlots.morning;
        if (selectedPeriod === 'afternoon') return segmentedSlots.afternoon;
        if (selectedPeriod === 'evening') return segmentedSlots.evening;
        if (selectedPeriod === 'night') return segmentedSlots.night;
        return salonSlots;
    }, [selectedPeriod, segmentedSlots, salonSlots]);

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

    // Format time
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
            // Direct query parameter (e.g. from QR scan: /salon?salonId=123&fromQr=true&device=android)
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

    // --- FETCH SALON & ATELIER DATA ---
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
                    title: `${salonName} | Bespoke Hair & Beauty Atelier | Official Website`,
                    description: `Experience couture hairdressing, aesthetic skincare & luxury wellness rituals at ${salonName}, ${areaStr ? areaStr + ', ' : ''}${cityStr}. Explore treatment menu & reserve appointment online.`,
                    keywords: `${salonName.toLowerCase()}, luxury salon ${cityStr.toLowerCase()}, hair atelier, couture beauty`
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
                    "priceRange": "₹₹₹",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": salonData.address || "Prime Atelier",
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
                    params: { size: 6, page: 0, salonId: resolvedSalonId, status: 'active' }
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

    // Fetch slots when date or salon changes
    useEffect(() => {
        if (!resolvedSalonId || !selectedDateObj) return;
        const fetchSalonSlots = async () => {
            setSlotsLoading(true);
            try {
                const [dd, mm, yyyy] = selectedDateObj.fullDate.split('-');
                const dateInstant = `${yyyy}-${mm}-${dd}T00:00:00.000+05:30`;
                const res = await axiosInstance.get('/appointments/public/salon-slots', {
                    params: { salonId: resolvedSalonId, selectedDate: dateInstant }
                });
                const fetchedSlots = res.data || [];
                setSalonSlots(fetchedSlots);

                // Auto-set the selectedPeriod to first non-empty period
                const morning = fetchedSlots.filter(s => getSlotPeriod(s) === 'morning');
                const afternoon = fetchedSlots.filter(s => getSlotPeriod(s) === 'afternoon');
                const evening = fetchedSlots.filter(s => getSlotPeriod(s) === 'evening');
                const night = fetchedSlots.filter(s => getSlotPeriod(s) === 'night');

                if (morning.length > 0) setSelectedPeriod('morning');
                else if (afternoon.length > 0) setSelectedPeriod('afternoon');
                else if (evening.length > 0) setSelectedPeriod('evening');
                else if (night.length > 0) setSelectedPeriod('night');
                else setSelectedPeriod('all');

            } catch (err) {
                console.error('Error fetching slots:', err);
                setSalonSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSalonSlots();
    }, [resolvedSalonId, selectedDateObj]);

    // Scroll listener for sticky dock & active section spy
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setShowConciergeDock(scrollY > 500);

            const sections = ['atelier', 'philosophy', 'menu', 'curations', 'collective', 'lookbook', 'reservation', 'concierge'];
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(`section-${sections[i]}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 160) {
                        setActiveSection(sections[i]);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setActiveSection(id);
        const el = document.getElementById(`section-${id}`);
        if (el) {
            const yOffset = -80;
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
            toast.error("Please sign in to add to your private list");
            navigate('/customer/login');
            return;
        }
        const newStatus = !isFavourite;
        setIsFavourite(newStatus);
        try {
            if (newStatus) {
                await axiosInstance.post(`/customer/favourites/${resolvedSalonId}`);
                toast.success(`Saved to your private salon list`);
            } else {
                await axiosInstance.delete(`/customer/favourites/${resolvedSalonId}`);
                toast.success(`Removed from your list`);
            }
        } catch {
            setIsFavourite(!newStatus);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: salon?.name || salon?.salonName || 'Salon Atelier',
                text: `Discover ${salon?.name || 'this atelier'} & reserve treatments online.`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Atelier invitation link copied.');
        }
    };

    const handleReserveService = (service) => {
        navigate('/customer/book-service', {
            state: {
                addedServices: service ? [service.id] : [],
                selectedCategory: service?.categoryName || service?.category || selectedCategory
            }
        });
    };

    const handleReserveWithArtisan = (staff) => {
        navigate('/customer/book-service', {
            state: {
                selectedExpert: staff.id,
                selectedDateObj: selectedDateObj
            }
        });
    };

    const handleConfirmSlot = (slot) => {
        setSelectedSlot(slot);
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
    };

    const salonName = salon?.name || salon?.salonName || 'The Atelier';
    const addressStr = salon?.address || [salon?.areaName, salon?.cityName].filter(Boolean).join(', ') || 'Prime Destination';
    const heroImage = galleryImages[0] || salon?.imageUrl || null;
    const ratingScore = salon?.rating ? parseFloat(salon?.rating).toFixed(1) : '4.9';

    // Skeleton
    if (loading) {
        return (
            <div className={`min-h-screen font-sans ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col`}>
                <div className="w-full h-[60vh] yt-skeleton opacity-60" />
                <div className="max-w-6xl mx-auto w-full px-6 -mt-32 space-y-6">
                    <div className={`rounded-3xl p-8 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} space-y-4`}>
                        <div className="h-10 yt-skeleton rounded-xl w-80" />
                        <div className="h-4 yt-skeleton rounded-lg w-52" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
            isDark ? 'bg-[#0E0E10] text-white' : 'bg-[#FDFBF7] text-slate-950'
        }`}>

            {/* ============================================================ */}
            {/* 1. EDITORIAL LUXURY STUDIO MASTHEAD (HERO) */}
            {/* ============================================================ */}
            <header id="section-atelier" className="relative w-full min-h-[82vh] lg:min-h-[88vh] flex items-end justify-center bg-stone-950 text-white overflow-hidden pb-12 sm:pb-20 pt-20">
                {/* Full-Bleed Atmospheric Fashion Canvas */}
                <div className="absolute inset-0 z-0">
                    {heroImage ? (
                        <img
                            src={getSalonImageSrc(heroImage)}
                            alt={salonName}
                            className="w-full h-full object-cover scale-105 filter brightness-45 contrast-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-b from-stone-900 via-stone-950 to-black" />
                    )}
                    {/* Editorial Scrim Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-black/60 to-black/30" />
                    <div className="absolute inset-0 bg-radial-at-t from-transparent via-transparent to-black/80" />
                </div>

                {/* Hero Main Content */}
                <div className="relative z-10 max-w-6xl mx-auto w-full px-6 sm:px-8">
                    
                    {/* Banned Notice */}
                    {(salon?.banned || salon?.isBanned) && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                            <Lock className="w-4 h-4 shrink-0" />
                            <span>Online reservations for this private atelier are temporarily offline. Please contact the concierge directly.</span>
                        </div>
                    )}

                    <div className="flex flex-col items-start space-y-6">
                        {/* Upper Atelier Tag & Status Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span 
                                className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-md border border-white/20 text-white"
                                style={{ backgroundColor: 'rgba(var(--color-primary-rgb, 255, 11, 1), 0.25)' }}
                            >
                                <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                                Haute Coiffure & Beauty Atelier
                            </span>

                            {isSalonOpenNow() ? (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Atelier Open Today • Closes {salon?.closingTime ? formatTimeStr(salon.closingTime) : '10 PM'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/20 backdrop-blur-md text-rose-300 border border-rose-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    Closed for the day • Opens {salon?.openingTime ? formatTimeStr(salon.openingTime) : '10 AM'}
                                </span>
                            )}
                        </div>

                        {/* Salon Monogram & Grand Headline */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
                            <div 
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 backdrop-blur-md border-2 shadow-2xl shrink-0"
                                style={{ borderColor: 'var(--color-primary, #ffffff)' }}
                            >
                                <SalonLogoImage
                                    logo={salon?.imageUrl || salon?.logoUrl}
                                    name={salonName}
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none capitalize">
                                    {salonName}
                                </h1>
                                <p className="text-sm sm:text-base text-zinc-200 font-medium tracking-wide">
                                    An exclusive sanctuary of precision hairdressing, aesthetics & luxury rituals in {salon?.cityName || 'the city'}.
                                </p>
                            </div>
                        </div>

                        {/* Location, Distance & Accolades */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
                            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span className="truncate max-w-xs">{addressStr}</span>
                            </div>
                            {distanceBadge && (
                                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-emerald-300 font-bold">
                                    <span>📍 {distanceBadge} from you</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-amber-300 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{ratingScore}</span>
                                <span className="text-zinc-400 font-normal">({(((salon?.id || salon?.salonId || 1) * 17) % 70) + 52} curated reviews)</span>
                            </div>
                        </div>

                        {/* Action Bar with Dynamic White Label Color */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-4 w-full sm:w-auto">
                            {(salon?.banned || salon?.isBanned) ? (
                                <button
                                    type="button"
                                    disabled
                                    className="px-8 py-4 rounded-xl bg-zinc-800 text-zinc-500 font-black text-xs uppercase tracking-[0.2em] cursor-not-allowed border border-zinc-700"
                                >
                                    Reservations Suspended
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('reservation')}
                                    style={{
                                        backgroundColor: 'var(--color-primary, #FF0B01)',
                                        color: 'var(--color-button-text, #ffffff)'
                                    }}
                                    className="px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 hover:scale-[1.02] active:scale-98 transition duration-200 cursor-pointer flex items-center gap-2.5"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Reserve An Experience</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => scrollToSection('menu')}
                                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black text-xs uppercase tracking-[0.2em] border border-white/20 transition cursor-pointer flex items-center gap-2"
                            >
                                <Scissors className="w-4 h-4" />
                                <span>Treatment Menu</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {salon?.phone && (
                                    <a
                                        href={`tel:${salon.phone}`}
                                        className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition"
                                        title={`Concierge: ${salon.phone}`}
                                    >
                                        <Phone className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition cursor-pointer"
                                    title="Share Atelier"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleFavourite}
                                    className={`p-3.5 rounded-xl backdrop-blur-md border transition cursor-pointer ${
                                        isFavourite
                                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                            : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                                    }`}
                                    title={isFavourite ? "Saved to your list" : "Save to private list"}
                                >
                                    <Heart className={`w-4 h-4 ${isFavourite ? 'fill-rose-500 text-rose-500' : ''}`} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            {/* ============================================================ */}
            {/* 2. MINIMALIST EDITORIAL NAVIGATION BAR */}
            {/* ============================================================ */}
            <nav className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors ${
                isDark ? 'bg-[#0E0E10]/95 border-zinc-800' : 'bg-white/95 border-slate-200'
            }`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3 text-[11px] font-black uppercase tracking-[0.18em]">
                        {[
                            { id: 'atelier', label: 'The Atelier' },
                            { id: 'philosophy', label: 'Our Philosophy' },
                            { id: 'menu', label: 'Treatment Menu', count: allServices.length || null },
                            { id: 'curations', label: 'Curated Rituals', count: (offers.length + packages.length) || null },
                            { id: 'collective', label: 'Artisan Collective' },
                            { id: 'lookbook', label: 'Lookbook & Ambience' },
                            { id: 'reservation', label: 'Concierge Booking' },
                            { id: 'concierge', label: 'Atelier Hours & Visit' },
                        ].map((item) => {
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => scrollToSection(item.id)}
                                    style={isActive ? {
                                        backgroundColor: 'var(--color-primary, #0f172a)',
                                        color: 'var(--color-button-text, #ffffff)'
                                    } : {}}
                                    className={`px-3.5 py-1.5 rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                                        isActive
                                            ? 'font-black shadow-xs'
                                            : isDark
                                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {item.count ? (
                                        <span className={`text-[9px] px-1.5 rounded-full font-bold ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : isDark
                                                ? 'bg-zinc-800 text-zinc-300'
                                                : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {item.count}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* ============================================================ */}
            {/* 3. ATELIER PHILOSOPHY & ARTISAN PILLARS */}
            {/* ============================================================ */}
            <section id="section-philosophy" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-16">
                    
                    {/* Top Editorial Story Feature */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        <div className="lg:col-span-5 relative group">
                            <div className={`w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl border ${
                                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                            }`}>
                                <img
                                    src={galleryImages[1] ? getSalonImageSrc(galleryImages[1]) : (heroImage ? getSalonImageSrc(heroImage) : '')}
                                    alt="Atelier interior"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-zinc-900 text-white p-5 rounded-2xl shadow-2xl max-w-xs border border-zinc-700">
                                <p className="text-xs font-serif italic leading-relaxed text-zinc-300">
                                    "Every ritual begins with an unhurried diagnosis of your hair texture, lifestyle, and aesthetic vision."
                                </p>
                                <span 
                                    className="block text-[9px] font-black uppercase tracking-widest mt-2"
                                    style={{ color: 'var(--color-primary, #f59e0b)' }}
                                >
                                    — The {salonName} Guarantee
                                </span>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-5">
                            <span 
                                className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                                style={{ color: 'var(--color-primary, #f59e0b)' }}
                            >
                                The Atelier Philosophy
                            </span>
                            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}>
                                Tailored Perfection.<br />Unhurried Boutique Care.
                            </h2>
                            <p className={`text-sm sm:text-base leading-relaxed font-normal ${
                                isDark ? 'text-zinc-300' : 'text-slate-600'
                            }`}>
                                {salon?.description ||
                                    `At ${salonName}, we consider personal styling an intimate art form. We reject factory-line salon conveyor belts in favor of bespoke private consultations, medical-grade hygiene protocols, and precision techniques customized exclusively for you.`}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className={`p-4 rounded-2xl border ${
                                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                                }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider ${
                                        isDark ? 'text-white' : 'text-slate-950'
                                    }`}>Private Suites</h4>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Calm, private aesthetic treatment cabins.</p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${
                                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                                }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider ${
                                        isDark ? 'text-white' : 'text-slate-950'
                                    }`}>Master Formulations</h4>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>100% authentic salon-grade formulations.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4 Pillars Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            {
                                title: 'Couture Precision',
                                desc: 'Bespoke cuts, custom balayage, and aesthetic therapies designed for you.',
                                icon: Scissors
                            },
                            {
                                title: 'Clinical Sanitization',
                                desc: '100% UV-sterilized stainless steel instruments & single-use disposable capes.',
                                icon: ShieldCheck
                            },
                            {
                                title: 'Artisan Refreshments',
                                desc: 'Complimentary pour-over coffee, specialty teas, and artisanal infused waters.',
                                icon: Coffee
                            },
                            {
                                title: 'Dedicated Concierge',
                                desc: 'Personalized appointment scheduling with private stylist allocation.',
                                icon: Compass
                            }
                        ].map((pillar, idx) => {
                            const PIcon = pillar.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`p-6 rounded-2xl border space-y-3 shadow-xs transition ${
                                        isDark 
                                            ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                                        style={{
                                            backgroundColor: 'rgba(var(--color-primary-rgb, 255, 11, 1), 0.12)',
                                            color: 'var(--color-primary, #FF0B01)'
                                        }}
                                    >
                                        <PIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className={`text-sm font-black uppercase tracking-wider ${
                                        isDark ? 'text-white' : 'text-slate-950'
                                    }`}>
                                        {pillar.title}
                                    </h3>
                                    <p className={`text-xs leading-relaxed ${
                                        isDark ? 'text-zinc-400' : 'text-slate-600'
                                    }`}>
                                        {pillar.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Amenities Ribbon */}
                    <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border text-xs ${
                        isDark 
                            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' 
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                        <div className="flex flex-wrap items-center gap-6">
                            <span className="flex items-center gap-2 font-bold"><Wifi className="w-4 h-4 text-emerald-500" /> High-Speed Guest Wi-Fi</span>
                            <span className="flex items-center gap-2 font-bold"><Car className="w-4 h-4 text-amber-500" /> Valet & Parking Available</span>
                            <span className="flex items-center gap-2 font-bold"><CreditCard className="w-4 h-4 text-blue-500" /> All Cards & UPI Accepted</span>
                            {homeServiceCharges > 0 && (
                                <span className="flex items-center gap-2 font-bold text-rose-500"><MapPin className="w-4 h-4" /> Home Appointments (₹{homeServiceCharges})</span>
                            )}
                        </div>
                        <span 
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Verified Studio Partner
                        </span>
                    </div>

                </div>
            </section>

            {/* ============================================================ */}
            {/* 4. THE COUTURE TREATMENT MENU & PRICING */}
            {/* ============================================================ */}
            <section id="section-menu" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <span 
                                className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                                style={{ color: 'var(--color-primary, #FF0B01)' }}
                            >
                                Couture Catalog
                            </span>
                            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}>
                                The Treatment Collection
                            </h2>
                            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Transparent price list and detailed treatment inclusions for {salonName}.
                            </p>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                value={serviceSearchQuery}
                                onChange={(e) => setServiceSearchQuery(e.target.value)}
                                placeholder="Search treatment or ritual..."
                                className={`w-full pl-10 pr-8 py-3 rounded-xl text-xs font-bold border transition shadow-xs outline-none ${
                                    isDark 
                                        ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500' 
                                        : 'bg-white border-slate-200 text-slate-950 placeholder-slate-400 focus:border-slate-900'
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

                    {categories.length > 0 && (
                        <div className={`flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b ${
                            isDark ? 'border-zinc-800' : 'border-slate-200'
                        }`}>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('All')}
                                style={selectedCategory === 'All' ? {
                                    backgroundColor: 'var(--color-primary, #0f172a)',
                                    color: 'var(--color-button-text, #ffffff)'
                                } : {}}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition cursor-pointer ${
                                    selectedCategory === 'All'
                                        ? 'font-black shadow-xs'
                                        : isDark
                                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                                }`}
                            >
                                All Treatments ({allServices.length})
                            </button>
                            {categories.map((catName) => {
                                const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
                                const countInCat = allServices.filter(s => (s.categoryName || s.category || '').toLowerCase() === catName.toLowerCase()).length;
                                return (
                                    <button
                                        key={catName}
                                        type="button"
                                        onClick={() => setSelectedCategory(catName)}
                                        style={isSelected ? {
                                            backgroundColor: 'var(--color-primary, #0f172a)',
                                            color: 'var(--color-button-text, #ffffff)'
                                        } : {}}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition cursor-pointer flex items-center gap-2 ${
                                            isSelected
                                                ? 'font-black shadow-xs'
                                                : isDark
                                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>{translateServiceName(catName, t)}</span>
                                        {countInCat > 0 && (
                                            <span className={`text-[9px] px-1.5 rounded-full font-bold ${
                                                isSelected 
                                                    ? 'bg-white/20 text-white' 
                                                    : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {countInCat}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {filteredServices.length === 0 ? (
                        <div className={`py-16 text-center rounded-3xl border space-y-2 ${
                            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <Scissors className={`w-10 h-10 mx-auto ${isDark ? 'text-zinc-700' : 'text-slate-300'}`} />
                            <h4 className={`text-sm font-black uppercase tracking-wider ${
                                isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                                {serviceSearchQuery ? 'No matching treatments found' : 'Menu being refined'}
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Please try another term or contact the atelier desk directly.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {filteredServices.map((service) => {
                                const duration = service.duration || service.durationMinutes || 30;
                                const price = service.price || 0;
                                return (
                                    <div
                                        key={service.id}
                                        className={`p-6 rounded-2xl border transition shadow-xs flex flex-col justify-between group space-y-4 ${
                                            isDark 
                                                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <span 
                                                        className="text-[10px] font-black uppercase tracking-widest"
                                                        style={{ color: 'var(--color-primary, #f59e0b)' }}
                                                    >
                                                        {service.categoryName || service.category || 'Treatment'}
                                                    </span>
                                                    <h3 className={`text-base font-black tracking-tight uppercase transition-colors ${
                                                        isDark ? 'text-white' : 'text-slate-950'
                                                    }`}>
                                                        {translateServiceName(service.name, t)}
                                                    </h3>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`text-lg font-black block ${
                                                        isDark ? 'text-white' : 'text-slate-950'
                                                    }`}>
                                                        ₹{price}
                                                    </span>
                                                    <span className={`text-[10px] font-bold block ${
                                                        isDark ? 'text-zinc-400' : 'text-slate-500'
                                                    }`}>
                                                        {duration} Mins
                                                    </span>
                                                </div>
                                            </div>

                                            <p className={`text-xs leading-relaxed font-normal ${
                                                isDark ? 'text-zinc-300' : 'text-slate-600'
                                            }`}>
                                                {service.description ||
                                                    'Includes consultation, customized preparation, precision execution, and final finishing.'}
                                            </p>
                                        </div>

                                        <div className={`pt-3 border-t flex items-center justify-between ${
                                            isDark ? 'border-zinc-800' : 'border-slate-100'
                                        }`}>
                                            <span className={`text-[10px] font-bold flex items-center gap-1 ${
                                                isDark ? 'text-zinc-400' : 'text-slate-500'
                                            }`}>
                                                <Clock className="w-3 h-3 text-amber-500" /> Consultation included
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleReserveService(service)}
                                                style={{
                                                    backgroundColor: 'var(--color-primary, #0f172a)',
                                                    color: 'var(--color-button-text, #ffffff)'
                                                }}
                                                className="px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-xs hover:brightness-110"
                                            >
                                                <span>Reserve Treatment</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="p-8 rounded-3xl bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800">
                        <div className="space-y-1 text-center md:text-left">
                            <h4 className="text-lg font-black tracking-tight uppercase text-white">Custom Bridal, Makeover or Editorial Project?</h4>
                            <p className="text-xs text-zinc-300">Our creative directors curate personalized private sessions for special occasions.</p>
                        </div>
                        {salon?.phone ? (
                            <a
                                href={`tel:${salon.phone}`}
                                style={{
                                    backgroundColor: 'var(--color-primary, #ffffff)',
                                    color: 'var(--color-button-text, #0f172a)'
                                }}
                                className="px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shrink-0 transition hover:brightness-105"
                            >
                                Speak With Concierge: {salon.phone}
                            </a>
                        ) : (
                            <button
                                type="button"
                                onClick={() => scrollToSection('reservation')}
                                style={{
                                    backgroundColor: 'var(--color-primary, #ffffff)',
                                    color: 'var(--color-button-text, #0f172a)'
                                }}
                                className="px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shrink-0 transition hover:brightness-105"
                            >
                                Inquire Online
                            </button>
                        )}
                    </div>

                </div>
            </section>

            {/* ============================================================ */}
            {/* 5. CURATED RITUALS & SEASONAL EXPERIENCES */}
            {/* ============================================================ */}
            {(offers.length > 0 || packages.length > 0) && (
                <section id="section-curations" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
                        <div className="space-y-2">
                            <span 
                                className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                                style={{ color: 'var(--color-primary, #FF0B01)' }}
                            >
                                Signature Collections
                            </span>
                            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}>
                                Curated Studio Rituals
                            </h2>
                            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Multi-treatment packages curated by {salonName}'s senior artists.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`p-7 rounded-3xl border flex flex-col justify-between space-y-6 shadow-xs transition ${
                                        isDark 
                                            ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-slate-100 text-slate-800'
                                            }`}>
                                                Signature Package
                                            </span>
                                            {pkg.discountValue > 0 && (
                                                <span className="text-xs font-black text-amber-500">
                                                    Save ₹{pkg.discountValue}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`text-lg font-black uppercase tracking-tight ${
                                            isDark ? 'text-white' : 'text-slate-950'
                                        }`}>
                                            {pkg.name}
                                        </h3>
                                        <p className={`text-xs leading-relaxed font-normal ${
                                            isDark ? 'text-zinc-300' : 'text-slate-600'
                                        }`}>
                                            {pkg.description || 'Full-body ritual including hair spa, styling, and rejuvenating skin treatment.'}
                                        </p>
                                    </div>

                                    <div className={`pt-4 border-t flex items-center justify-between ${
                                        isDark ? 'border-zinc-800' : 'border-slate-100'
                                    }`}>
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                                                isDark ? 'text-zinc-400' : 'text-slate-500'
                                            }`}>Atelier Fee</span>
                                            <span className={`text-xl font-black ${
                                                isDark ? 'text-white' : 'text-slate-950'
                                            }`}>
                                                ₹{pkg.packagePrice || pkg.price || 999}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/customer/book-service')}
                                            style={{
                                                backgroundColor: 'var(--color-primary, #0f172a)',
                                                color: 'var(--color-button-text, #ffffff)'
                                            }}
                                            className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition hover:brightness-110"
                                        >
                                            Reserve Package
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {offers.map((offer) => {
                                const isPct = offer.discountType === 'PERCENTAGE' || offer.percentage !== undefined;
                                const val = offer.discountValue ?? offer.percentage ?? 0;
                                const privilegeBadge = isPct ? `${val}% Privilege` : `₹${val} Privilege`;
                                return (
                                    <div
                                        key={offer.id}
                                        className="p-7 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 flex flex-col justify-between space-y-6 shadow-md"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                                    {privilegeBadge}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-400">
                                                    {offer.code || 'ATELIER'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                                {offer.name || 'Seasonal Patron Privilege'}
                                            </h3>
                                            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                                                {offer.description || `Exclusive reservation privilege for patrons of ${salonName}.`}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/customer/book-service', { state: { selectedOffer: offer } })}
                                            style={{
                                                backgroundColor: 'var(--color-primary, #f59e0b)',
                                                color: 'var(--color-button-text, #0f172a)'
                                            }}
                                            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition hover:brightness-110"
                                        >
                                            Claim Privilege
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================ */}
            {/* 6. THE ARTISAN COLLECTIVE (STYLISTS) */}
            {/* ============================================================ */}
            <section id="section-collective" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-12">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <span 
                                className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                                style={{ color: 'var(--color-primary, #FF0B01)' }}
                            >
                                Creative Leadership
                            </span>
                            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}>
                                The Artisan Collective
                            </h2>
                            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                Certified masters of precision cutting, balayage, and restorative skin rituals.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/customer/book-service')}
                            className={`text-xs font-black uppercase tracking-wider hover:underline flex items-center gap-1 ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}
                        >
                            <span>Browse Collective Roster</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {staffList.length === 0 ? (
                        <div className={`py-12 text-center rounded-3xl border space-y-2 ${
                            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <Users className={`w-10 h-10 mx-auto ${isDark ? 'text-zinc-700' : 'text-slate-300'}`} />
                            <h4 className={`text-xs font-black uppercase tracking-wider ${
                                isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                                Stylist allocation active
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>You may request a preferred stylist during reservation checkout.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {staffList.map((artisan, idx) => {
                                const role = artisan.speciality || ['Creative Director', 'Master Colorist', 'Skin Aesthetician', 'Lead Stylist'][idx % 4];
                                const rating = artisan.rating ? parseFloat(artisan.rating).toFixed(1) : '4.9';
                                return (
                                    <div
                                        key={artisan.id || idx}
                                        className={`p-6 rounded-3xl border flex flex-col items-center text-center space-y-4 transition group shadow-xs ${
                                            isDark 
                                                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div 
                                            className="w-28 h-28 rounded-2xl overflow-hidden p-1 border-2"
                                            style={{ borderColor: 'var(--color-primary, #FF0B01)' }}
                                        >
                                            <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-800">
                                                {artisan.imagePath ? (
                                                    <AsyncImage
                                                        imagePath={artisan.imagePath}
                                                        alt={artisan.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackText={artisan.name?.charAt(0) || 'A'}
                                                    />
                                                ) : (
                                                    <img
                                                        src={getExpertImg(idx)}
                                                        alt={artisan.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className={`text-base font-black uppercase tracking-tight ${
                                                isDark ? 'text-white' : 'text-slate-950'
                                            }`}>
                                                {artisan.name}
                                            </h3>
                                            <p 
                                                className="text-xs font-bold uppercase tracking-widest"
                                                style={{ color: 'var(--color-primary, #f59e0b)' }}
                                            >
                                                {role}
                                            </p>
                                            <div className="flex items-center justify-center gap-1 text-xs text-amber-400 pt-1">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="font-bold">{rating}</span>
                                                <span className={`font-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Rating</span>
                                            </div>
                                        </div>

                                        <p className={`text-xs leading-relaxed font-normal ${
                                            isDark ? 'text-zinc-300' : 'text-slate-600'
                                        }`}>
                                            Dedicated to unhurried consultations and bespoke precision styling.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => handleReserveWithArtisan(artisan)}
                                            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs ${
                                                isDark
                                                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                            }`}
                                        >
                                            Reserve with {artisan.name.split(' ')[0]}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ============================================================ */}
            {/* 7. LOOKBOOK & STUDIO AMBIENCE */}
            {/* ============================================================ */}
            <section id="section-lookbook" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
                    <div className="space-y-2">
                        <span 
                            className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Studio Aesthetic
                        </span>
                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            isDark ? 'text-white' : 'text-slate-950'
                        }`}>
                            Lookbook & Studio Visuals
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            An inside look at {salonName}'s private wash lounge, styling stations, and aesthetic suites.
                        </p>
                    </div>

                    {galleryImages.length === 0 ? (
                        <div className={`py-12 text-center rounded-3xl border space-y-2 ${
                            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <Camera className={`w-10 h-10 mx-auto ${isDark ? 'text-zinc-700' : 'text-slate-300'}`} />
                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Lookbook images being cataloged.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryImages.map((imgUrl, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`relative group rounded-2xl overflow-hidden cursor-pointer border ${
                                        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                                    } ${
                                        idx === 0 ? 'col-span-2 row-span-2 h-[260px] sm:h-[420px]' : 'h-[140px] sm:h-[200px]'
                                    }`}
                                >
                                    <img
                                        src={getSalonImageSrc(imgUrl)}
                                        alt={`Atelier photograph ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-3.5 py-1.5 rounded-full bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-md">
                                            Fullscreen
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ============================================================ */}
            {/* 8. CONCIERGE SLOT RESERVATION — COMPACT & DIVIDED BY TIME PERIOD */}
            {/* ============================================================ */}
            <section id="section-reservation" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-8">
                    <div className="space-y-2">
                        <span 
                            className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Private Scheduling
                        </span>
                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            isDark ? 'text-white' : 'text-slate-950'
                        }`}>
                            Concierge Reservation Desk
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Select your date and preferred session — Morning, Afternoon, Evening or Night.
                        </p>
                    </div>

                    <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
                        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                    }`}>
                        {/* Month / Year Indicator */}
                        <div className={`flex items-center justify-between border-b pb-3 ${
                            isDark ? 'border-zinc-800' : 'border-slate-200'
                        }`}>
                            <span className={`text-xs font-black uppercase tracking-widest ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}>
                                {selectedDateObj?.month} {selectedDateObj?.year}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                Live Timetable Synchronized
                            </span>
                        </div>

                        {/* 14-Day Calendar Strip */}
                        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2">
                            {nextDays.map((d, i) => {
                                const isSelected = selectedDateObj?.fullDate === d.fullDate;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDateObj(d);
                                            setSelectedSlot(null);
                                        }}
                                        style={isSelected ? {
                                            backgroundColor: 'var(--color-primary, #0f172a)',
                                            color: 'var(--color-button-text, #ffffff)'
                                        } : {}}
                                        className={`flex flex-col items-center justify-center py-3 px-3.5 rounded-2xl min-w-[62px] transition cursor-pointer ${
                                            isSelected
                                                ? 'font-black shadow-md scale-105'
                                                : isDark
                                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span className="text-[10px] uppercase font-bold tracking-wider">{d.day}</span>
                                        <span className="text-base font-black mt-0.5">{d.num}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time Period Tabs: Morning, Afternoon, Evening, Night */}
                        <div className="space-y-4 pt-1">
                            <div className={`flex flex-wrap items-center gap-2 border-b pb-3 ${
                                isDark ? 'border-zinc-800' : 'border-slate-100'
                            }`}>
                                {[
                                    { id: 'all', label: 'All Sessions', count: salonSlots.length, icon: Clock },
                                    { id: 'morning', label: 'Morning', sub: '8 AM - 12 PM', count: segmentedSlots.morning.length, icon: Sunrise },
                                    { id: 'afternoon', label: 'Afternoon', sub: '12 PM - 4 PM', count: segmentedSlots.afternoon.length, icon: Sun },
                                    { id: 'evening', label: 'Evening', sub: '4 PM - 8 PM', count: segmentedSlots.evening.length, icon: Sunset },
                                    { id: 'night', label: 'Night', sub: '8 PM - 10 PM', count: segmentedSlots.night.length, icon: Moon }
                                ].map((period) => {
                                    const PIcon = period.icon;
                                    const isCurrent = selectedPeriod === period.id;
                                    const hasSlots = period.count > 0;
                                    return (
                                        <button
                                            key={period.id}
                                            type="button"
                                            disabled={!hasSlots && period.id !== 'all'}
                                            onClick={() => setSelectedPeriod(period.id)}
                                            style={isCurrent ? {
                                                backgroundColor: 'var(--color-primary, #0f172a)',
                                                color: 'var(--color-button-text, #ffffff)'
                                            } : {}}
                                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                isCurrent
                                                    ? 'font-black shadow-xs'
                                                    : hasSlots
                                                    ? isDark
                                                        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                                                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                                    : 'opacity-40 bg-zinc-800/30 text-zinc-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <PIcon className="w-3.5 h-3.5" />
                                            <span>{period.label}</span>
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                                                isCurrent 
                                                    ? 'bg-white/20 text-white' 
                                                    : isDark ? 'bg-zinc-700 text-zinc-200' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {period.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Shrunk Slots Display */}
                            {slotsLoading ? (
                                <div className="py-8 text-center space-y-2">
                                    <div className="animate-spin h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full mx-auto" />
                                    <p className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Checking timetable availability...</p>
                                </div>
                            ) : displayedSlots.length === 0 ? (
                                <div className={`py-8 text-center rounded-2xl border space-y-1 ${
                                    isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <Clock className={`w-6 h-6 mx-auto ${isDark ? 'text-zinc-600' : 'text-slate-300'}`} />
                                    <p className={`text-xs font-black uppercase tracking-wider ${
                                        isDark ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        No slots available in this session
                                    </p>
                                    <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Please choose another session (Morning, Afternoon, Evening, Night) or date.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                                    {displayedSlots.map((slot, idx) => {
                                        const isSelected = selectedSlot?.startTime === slot.startTime;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleConfirmSlot(slot)}
                                                style={isSelected ? {
                                                    backgroundColor: 'var(--color-primary, #0f172a)',
                                                    color: 'var(--color-button-text, #ffffff)'
                                                } : {}}
                                                className={`py-2.5 px-2.5 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                                                    isSelected
                                                        ? 'font-black shadow-md scale-105 border-transparent'
                                                        : isDark
                                                        ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 hover:bg-zinc-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'
                                                }`}
                                            >
                                                {slot.displayTime}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 9. ATELIER HOURS, MAP & VISITING DETAILS */}
            {/* ============================================================ */}
            <section id="section-concierge" className={`py-16 sm:py-24 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
                    <div className="space-y-2">
                        <span 
                            className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Location & Schedule
                        </span>
                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            isDark ? 'text-white' : 'text-slate-950'
                        }`}>
                            Hours & Atelier Visit
                        </h2>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Everything you need to know for your upcoming visit to {salonName}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Weekly Schedule */}
                        <div className={`lg:col-span-5 p-8 rounded-3xl border space-y-4 ${
                            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                                isDark ? 'text-white' : 'text-slate-950'
                            }`}>
                                <Clock className="w-4 h-4 text-amber-500" /> Weekly Atelier Schedule
                            </h3>
                            <div className="space-y-2">
                                {weekdays.map((day) => {
                                    const hours = formatOperatingHours(day, salon?.openingTime, salon?.closingTime, salon?.weeklyOffDay);
                                    const isOff = hours === 'Closed';
                                    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                                    const isToday = day.toLowerCase() === todayName.toLowerCase();
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs ${
                                                isToday
                                                    ? isDark ? 'bg-zinc-800 text-white font-black' : 'bg-slate-100 text-slate-950 font-black'
                                                    : isDark ? 'text-zinc-300' : 'text-slate-700'
                                            }`}
                                        >
                                            <span className="uppercase">{day}</span>
                                            <span className={`font-mono text-xs ${isOff ? 'text-rose-500 font-bold' : ''}`}>
                                                {hours}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className={`lg:col-span-7 p-8 rounded-3xl border space-y-6 ${
                            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                        }`}>
                            <div className="space-y-2">
                                <span 
                                    className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: 'var(--color-primary, #FF0B01)' }}
                                >
                                    Atelier Address
                                </span>
                                <h3 className={`text-xl font-black uppercase tracking-tight ${
                                    isDark ? 'text-white' : 'text-slate-950'
                                }`}>
                                    {salonName}
                                </h3>
                                <p className={`text-sm leading-relaxed flex items-start gap-2 ${
                                    isDark ? 'text-zinc-300' : 'text-slate-700'
                                }`}>
                                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{addressStr}</span>
                                </p>
                            </div>

                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t ${
                                isDark ? 'border-zinc-800' : 'border-slate-200'
                            }`}>
                                {salon?.latitude && salon?.longitude ? (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            backgroundColor: 'var(--color-primary, #0f172a)',
                                            color: 'var(--color-button-text, #ffffff)'
                                        }}
                                        className="px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 hover:brightness-110"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        <span>Directions via Maps</span>
                                    </a>
                                ) : (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salonName + ' ' + addressStr)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            backgroundColor: 'var(--color-primary, #0f172a)',
                                            color: 'var(--color-button-text, #ffffff)'
                                        }}
                                        className="px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 hover:brightness-110"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        <span>Find on Google Maps</span>
                                    </a>
                                )}

                                {salon?.phone && (
                                    <a
                                        href={`tel:${salon.phone}`}
                                        className={`px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 ${
                                            isDark 
                                                ? 'bg-zinc-800 hover:bg-zinc-700 text-white' 
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                                        }`}
                                    >
                                        <Phone className="w-4 h-4 text-emerald-500" />
                                        <span>Call: {salon.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 10. PATRON TESTIMONIALS */}
            {/* ============================================================ */}
            <section className="py-16 sm:py-24">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
                    <div className="space-y-2 text-center">
                        <span 
                            className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                            style={{ color: 'var(--color-primary, #FF0B01)' }}
                        >
                            Patron Words
                        </span>
                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            isDark ? 'text-white' : 'text-slate-950'
                        }`}>
                            Client Reflections
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Siddharth Rao',
                                quote: `The precision haircut and styling exceeded my expectations. Total focus on detail and true unhurried hospitality.`,
                                discipline: 'Hair Sculpture Patron'
                            },
                            {
                                name: 'Meera Kulkarni',
                                quote: `An oasis of calm. The customized skin ritual and balayage gave my hair and face an unbelievable natural glow.`,
                                discipline: 'Aesthetic Ritual Patron'
                            },
                            {
                                name: 'Kavita Sen',
                                quote: `Flawless hygiene, top-tier products, and master stylists who actually listen. My new permanent studio.`,
                                discipline: 'Couture Styling Patron'
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-8 rounded-3xl border space-y-4 shadow-xs ${
                                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                    ))}
                                </div>
                                <p className={`text-xs sm:text-sm font-serif italic leading-relaxed ${
                                    isDark ? 'text-zinc-300' : 'text-slate-700'
                                }`}>
                                    "{item.quote}"
                                </p>
                                <div className={`pt-2 border-t ${
                                    isDark ? 'border-zinc-800' : 'border-slate-100'
                                }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider ${
                                        isDark ? 'text-white' : 'text-slate-950'
                                    }`}>
                                        {item.name}
                                    </h4>
                                    <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{item.discipline}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 11. LIGHTBOX MODAL */}
            {/* ============================================================ */}
            {lightboxIndex !== null && galleryImages[lightboxIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
                    <button
                        type="button"
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Previous"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl border border-white/10">
                        <img
                            src={getSalonImageSrc(galleryImages[lightboxIndex])}
                            alt={`Lookbook photo ${lightboxIndex + 1}`}
                            className="w-full h-full max-h-[75vh] object-contain"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Next"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-6 text-xs text-white/60 font-mono tracking-widest">
                        Photograph {lightboxIndex + 1} of {galleryImages.length}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* 12. FLOATING CONCIERGE DOCK */}
            {/* ============================================================ */}
            {showConciergeDock && (
                <aside aria-label="Concierge Bar" className="fixed bottom-5 left-5 right-5 max-w-md mx-auto z-40 bg-zinc-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 border border-white/15 shadow-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <SalonLogoImage
                            logo={salon?.imageUrl || salon?.logoUrl}
                            name={salonName}
                            className="w-8 h-8 rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                            <h4 className="text-xs font-black truncate text-white uppercase">{salonName}</h4>
                            <span className="text-[10px] text-zinc-400">Atelier Concierge Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {salon?.phone && (
                            <a
                                href={`tel:${salon.phone}`}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                                title="Call Atelier"
                            >
                                <Phone className="w-3.5 h-3.5" />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => scrollToSection('reservation')}
                            style={{
                                backgroundColor: 'var(--color-primary, #ffffff)',
                                color: 'var(--color-button-text, #0f172a)'
                            }}
                            className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm cursor-pointer hover:brightness-110"
                        >
                            Reserve
                        </button>
                    </div>
                </aside>
            )}

            {/* ============================================================ */}
            {/* 13. PROPRIETARY BESPOKE FOOTER */}
            {/* ============================================================ */}
            <footer className={`py-8 border-t text-center text-xs transition-colors ${
                isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'
            }`}>
                <span>© {new Date().getFullYear()} {salonName}. All Rights Reserved.</span>
                <span className="mx-2">•</span>
                <span>Powered by <strong className="font-black text-red-600">NeoParlour</strong></span>
            </footer>

            {/* ============================================================ */}
            {/* 14. ANDROID APP VS BROWSER CHOICE MODAL */}
            {/* ============================================================ */}
            {showAppChoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        {/* Close button */}
                        <button
                            onClick={handleContinueOnBrowser}
                            className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Brand Emblem / Icon Header */}
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
                                    {salon?.salonName || salon?.name || 'Salon Experience'}
                                </h3>
                            </div>
                        </div>

                        <p className={`text-sm mb-6 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                            Choose how you would like to explore treatments and reserve your appointment:
                        </p>

                        <div className="space-y-3">
                            {/* Option 1: Open NeoParlour Mobile App */}
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

                            {/* Option 2: Continue on Web Browser */}
                            <button
                                onClick={handleContinueOnBrowser}
                                className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between border transition group active:scale-[0.99] cursor-pointer ${isDark ? 'bg-zinc-800/80 border-zinc-700/80 hover:bg-zinc-800 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'}`}
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

                        <div className="mt-5 text-center">
                            <button
                                onClick={handleContinueOnBrowser}
                                className={`text-xs font-semibold underline underline-offset-4 transition cursor-pointer ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Skip and explore on website
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SalonPage;
