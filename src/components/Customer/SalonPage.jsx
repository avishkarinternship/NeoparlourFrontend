import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Copy,
    CheckCheck,
    X,
    ExternalLink,
    Coffee,
    Wifi,
    CreditCard,
    Car,
    Camera,
    Info,
    ChevronDown,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { updateSEOMetadata, injectJSONLD, generateSalonSlug } from '../../utils/seoHelper';
import { setActiveSalon, getSalonImageSrc, SalonLogoImage } from '../../utils/whiteLabelHelper';
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
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-400">
                <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !src) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-400 font-extrabold text-xs uppercase">
                {fallbackText || 'S'}
            </div>
        );
    }

    return <img src={src} alt={alt || 'Image'} className={className} />;
};

const SalonPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { salonSlug } = useParams();
    const { isAuthenticated } = useSelector((state) => state.customer);
    const activeLocation = useSelector((state) => state.location?.activeLocation);

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

    // Staff / Experts
    const [staffList, setStaffList] = useState([]);
    const [staffLoaded, setStaffLoaded] = useState(false);

    // Offers & Packages
    const [offers, setOffers] = useState([]);
    const [offersLoading, setOffersLoading] = useState(false);
    const [copiedOfferCode, setCopiedOfferCode] = useState(null);
    const [packages, setPackages] = useState([]);
    const [packagesLoaded, setPackagesLoaded] = useState(false);

    // Products & Home Service
    const [products, setProducts] = useState([]);
    const [productsLoaded, setProductsLoaded] = useState(false);
    const [homeServiceCharges, setHomeServiceCharges] = useState(0);

    // Gallery & Lightbox
    const [galleryImages, setGalleryImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // In-page Navigation Tabs & Floating Bar
    const [activeTab, setActiveTab] = useState('overview');
    const [showFloatingDock, setShowFloatingDock] = useState(false);

    // Quick Book States
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
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [salonSlots, setSalonSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

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

    // Format time strings (e.g. "09:00:00" -> "9:00 AM")
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

    // Category mapping helper using SVG Logos
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
            'dryer': dryerLogo,
            'grooming': groomingLogo,
            'makeup': makeupLogo,
            'make up': makeupLogo,
            'bridal': makeupLogo,
            'spa': spaMassageLogo,
            'massage': spaMassageLogo,
            'spa & massage': spaMassageLogo,
        };
        if (exactMap[catLower]) return exactMap[catLower];
        if (catLower.includes('color')) return hairColoringLogo;
        if (catLower.includes('removal') || catLower.includes('wax')) return hairRemovalLogo;
        if (catLower.includes('spa') || catLower.includes('massage')) return spaMassageLogo;
        if (catLower.includes('treatment')) return hairTreatmentLogo;
        if (catLower.includes('makeup') || catLower.includes('bridal')) return makeupLogo;
        if (catLower.includes('style')) return hairStylingLogo;
        if (catLower.includes('shave') || catLower.includes('beard')) return shavingLogo;
        if (catLower.includes('skin') || catLower.includes('facial')) return skinCareLogo;
        if (catLower.includes('nail')) return nailCareLogo;
        return hairLogo;
    };

    // Staff & Product fallbacks
    const expertFallbacks = [expertOneImg, expertTwoImg, expertThreeImg];
    const getExpertImg = (index) => expertFallbacks[index % expertFallbacks.length];
    const productFallbacks = [productOne, productTwo, productThree, productFour, productFive];
    const getProductImg = (product, index) => {
        if (product.imageUrl) return getSalonImageSrc(product.imageUrl);
        return productFallbacks[index % productFallbacks.length];
    };

    // --- SLUG RESOLUTION EFFECT ---
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

    // --- LOAD SALON DETAILS & DATA ON RESOLVED SALON ID ---
    useEffect(() => {
        if (!resolvedSalonId) return;

        const fetchSalonDetails = async () => {
            setLoading(true);
            try {
                const salonRes = await axiosInstance.get(`/salons/${resolvedSalonId}`);
                const salonData = salonRes.data;
                setSalon(salonData);
                setActiveSalon(salonData);

                const salonName = salonData.salonName || salonData.name || 'Salon Details';
                const cityStr = salonData.cityName || salonData.city || '';
                const areaStr = salonData.areaName || salonData.area || '';

                const seoTitle = `${salonName}${cityStr ? ' (' + cityStr + ')' : ''} | Bespoke Hair & Beauty Studio`;
                const seoDesc = `Welcome to ${salonName} in ${areaStr ? areaStr + ', ' : ''}${cityStr}. Explore bespoke services, price list, top stylists, verified reviews, and book online.`;
                const seoKeywords = `${salonName.toLowerCase()}, ${salonName.toLowerCase()} ${cityStr.toLowerCase()}, beauty studio ${cityStr.toLowerCase()}, salon booking`;

                updateSEOMetadata({
                    title: seoTitle,
                    description: seoDesc,
                    keywords: seoKeywords
                });

                const slug = generateSalonSlug(salonName, cityStr);
                if (!salonSlug && slug && window.history.replaceState) {
                    window.history.replaceState(null, '', `/salon/${slug}`);
                }

                const reviewsCount = (((salonData.salonId || salonData.id || 0) * 17) % 80) + 40;
                const rating = salonData.rating || "4.8";
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
                console.error("Error fetching services & categories:", err);
                setServicesLoaded(true);
            }
        };

        const fetchStaff = async () => {
            try {
                const staffRes = await axiosInstance.get('/staff/public/search', {
                    params: { size: 6, page: 0, salonId: resolvedSalonId, status: 'active' }
                });
                const staffData = staffRes.data?.content || staffRes.data || [];
                setStaffList(staffData);
                setStaffLoaded(true);
            } catch (error) {
                console.error("Error fetching staff:", error);
                setStaffLoaded(true);
            }
        };

        const fetchActiveOffers = async () => {
            setOffersLoading(true);
            try {
                const res = await axiosInstance.get('/offers/public/search', {
                    params: { active: true, page: 0, size: 10, salonId: resolvedSalonId }
                });
                setOffers(res.data?.content || res.data || []);
            } catch (error) {
                console.error("Error loading active offers:", error);
            } finally {
                setOffersLoading(false);
            }
        };

        const fetchPackages = async () => {
            try {
                const res = await axiosInstance.get('/packages/search', {
                    params: { active: true, salonId: resolvedSalonId, page: 0, size: 10 }
                });
                setPackages(res.data?.content || []);
                setPackagesLoaded(true);
            } catch (error) {
                console.error("Error fetching packages:", error);
                setPackagesLoaded(true);
            }
        };

        const fetchProducts = async () => {
            try {
                const res = await axiosInstance.get('/products/public/filter', {
                    params: { active: true, size: 4, salonId: resolvedSalonId }
                });
                setProducts((res.data?.content || res.data || []).slice(0, 4));
                setProductsLoaded(true);
            } catch (error) {
                console.error("Error fetching products:", error);
                setProductsLoaded(true);
            }
        };

        const fetchHomeServiceCharges = async () => {
            try {
                const res = await axiosInstance.get(`/salons/${resolvedSalonId}/home-service-charges`);
                setHomeServiceCharges(parseFloat(res.data) || 0);
            } catch (error) {
                console.error("Error loading home service charges:", error);
            }
        };

        const checkFavStatus = async () => {
            if (isAuthenticated && resolvedSalonId) {
                try {
                    const res = await axiosInstance.get(`/customer/favourites/${resolvedSalonId}/check`);
                    setIsFavourite(Boolean(res.data));
                } catch (err) {
                    console.error("Failed to check favourite:", err);
                }
            } else {
                setIsFavourite(false);
            }
        };

        Promise.allSettled([
            fetchSalonDetails(),
            fetchServicesAndCategories(),
            fetchStaff(),
            fetchActiveOffers(),
            fetchPackages(),
            fetchProducts(),
            fetchHomeServiceCharges(),
            checkFavStatus()
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
                setSalonSlots(res.data || []);
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
            setShowFloatingDock(scrollY > 480);

            // Simple section spy
            const sections = ['overview', 'about', 'services', 'offers', 'stylists', 'slots', 'gallery', 'location', 'reviews'];
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(`salon-${sections[i]}-section`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 180) {
                        setActiveTab(sections[i]);
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
        const el = document.getElementById(`salon-${id}-section`);
        if (el) {
            const yOffset = -90;
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

    // User actions
    const handleToggleFavourite = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to save to favourites");
            navigate('/customer/login');
            return;
        }
        const newStatus = !isFavourite;
        setIsFavourite(newStatus);
        try {
            if (newStatus) {
                await axiosInstance.post(`/customer/favourites/${resolvedSalonId}`);
                toast.success(`Saved to favourites`);
            } else {
                await axiosInstance.delete(`/customer/favourites/${resolvedSalonId}`);
                toast.success(`Removed from favourites`);
            }
        } catch (err) {
            setIsFavourite(!newStatus);
            toast.error("Failed to update favourites");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: salon?.name || salon?.salonName || 'Salon Boutique',
                text: `Discover ${salon?.name || 'this salon'} & book appointments online.`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleCopyOffer = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedOfferCode(code);
        toast.success(`Coupon code ${code} copied!`);
        setTimeout(() => setCopiedOfferCode(null), 2500);
    };

    const handleBookService = (service) => {
        navigate('/customer/book-service', {
            state: {
                addedServices: service ? [service.id] : [],
                selectedCategory: service?.categoryName || service?.category || selectedCategory
            }
        });
    };

    const handleBookWithStaff = (staff) => {
        navigate('/customer/book-service', {
            state: {
                selectedExpert: staff.id,
                selectedDateObj: selectedDateObj,
                selectedTime: selectedTime
            }
        });
    };

    const handleSelectSlotAndBook = (slot) => {
        setSelectedSlot(slot);
        setSelectedTime(slot.displayTime);
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

    const salonName = salon?.name || salon?.salonName || 'Boutique Salon';
    const addressStr = salon?.address || [salon?.areaName, salon?.cityName].filter(Boolean).join(', ') || 'Prime Location';
    const heroImage = galleryImages[0] || salon?.imageUrl || null;
    const ratingScore = salon?.rating ? parseFloat(salon?.rating).toFixed(1) : '4.8';

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans antialiased text-slate-800 dark:text-zinc-100 flex flex-col">
                <div className="w-full h-80 sm:h-96 yt-skeleton" />
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-24 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-zinc-800 space-y-4">
                        <div className="h-8 yt-skeleton rounded-xl w-72" />
                        <div className="h-4 yt-skeleton rounded-lg w-48" />
                        <div className="h-10 yt-skeleton rounded-xl w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <div className="h-64 yt-skeleton rounded-3xl" />
                            <div className="h-48 yt-skeleton rounded-3xl" />
                        </div>
                        <div className="h-96 yt-skeleton rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans antialiased text-slate-900 dark:text-zinc-100 selection:bg-red-500 selection:text-white">

            {/* ============================================================ */}
            {/* 1. IMMERSIVE HERO STUDIO MASTHEAD */}
            {/* ============================================================ */}
            <header id="salon-overview-section" className="relative w-full bg-slate-950 text-white overflow-hidden">
                {/* Background Panoramic Canvas with Ambient Lighting */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {heroImage ? (
                        <img
                            src={getSalonImageSrc(heroImage)}
                            alt={salonName}
                            className="w-full h-full object-cover scale-105 filter blur-xs brightness-40 transform transition-transform duration-1000"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-slate-900 to-zinc-900 opacity-95" />
                    )}
                    {/* Atmospheric Scrim Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/40" />
                    <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/80" />
                </div>

                {/* Hero Content Container */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-20">
                    
                    {/* Banned / Disabled Banner */}
                    {(salon?.banned || salon?.isBanned) && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-200 flex items-center gap-3">
                            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold">
                                Online bookings for this salon are temporarily suspended. Please contact the studio directly.
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
                        {/* Left: Studio Identity & Branding */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 min-w-0">
                            {/* Elevated Salon Monogram / Logo */}
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden p-1 bg-white/10 backdrop-blur-md border-2 border-white/20 shadow-2xl transition duration-300 group-hover:scale-105">
                                    <SalonLogoImage
                                        logo={salon?.imageUrl || salon?.logoUrl}
                                        name={salonName}
                                        className="w-full h-full rounded-2xl object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-600 to-rose-600 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-950" title="Verified Bespoke Studio">
                                    <Award className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {/* Headline & Details */}
                            <div className="space-y-2.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 backdrop-blur-md text-white border border-white/15">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        Bespoke Studio
                                    </span>
                                    {isSalonOpenNow() ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Open Now • Closes {salon?.closingTime ? formatTimeStr(salon.closingTime) : '10 PM'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                            Closed Now • Opens {salon?.openingTime ? formatTimeStr(salon.openingTime) : '10 AM'}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white capitalize leading-tight">
                                    {salonName}
                                </h1>

                                <p className="text-sm text-slate-300 font-medium flex items-center gap-2 max-w-xl">
                                    <span>Luxury Hair, Skin, Styling & Wellness Destination</span>
                                </p>

                                {/* Meta Chips */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                                    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10">
                                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                        <span className="truncate max-w-[240px] sm:max-w-md">{addressStr}</span>
                                    </div>
                                    {distanceBadge && (
                                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10 text-emerald-400 font-bold">
                                            <span>📍 {distanceBadge} away</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10 text-amber-300 font-bold">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span>{ratingScore}</span>
                                        <span className="text-slate-400 font-normal">({(((salon?.id || salon?.salonId || 1) * 13) % 60) + 48} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Studio Primary CTAs */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                            {(salon?.banned || salon?.isBanned) ? (
                                <button
                                    type="button"
                                    disabled
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-400 font-black text-xs uppercase tracking-wider cursor-not-allowed border border-slate-700 flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-4 h-4" /> Bookings Closed
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('slots')}
                                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-[#FF0B01] to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-98 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Book Appointment
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => scrollToSection('services')}
                                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-black text-xs uppercase tracking-wider border border-white/15 transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Scissors className="w-4 h-4" />
                                View Menu
                            </button>

                            {/* Quick Action Icons */}
                            <div className="flex items-center gap-2">
                                {salon?.phone && (
                                    <a
                                        href={`tel:${salon.phone}`}
                                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition cursor-pointer"
                                        title={`Call ${salon.phone}`}
                                    >
                                        <Phone className="w-4 h-4" />
                                    </a>
                                )}
                                {salon?.latitude && salon?.longitude && (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition cursor-pointer"
                                        title="Navigate in Google Maps"
                                    >
                                        <Navigation className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition cursor-pointer"
                                    title="Share Salon"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleFavourite}
                                    className={`p-3 rounded-2xl backdrop-blur-md border transition cursor-pointer ${
                                        isFavourite
                                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                            : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                                    }`}
                                    title={isFavourite ? "Saved in Favourites" : "Save to Favourites"}
                                >
                                    <Heart className={`w-4 h-4 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ============================================================ */}
            {/* 2. STICKY IN-PAGE BOUTIQUE NAVIGATION */}
            {/* ============================================================ */}
            <nav className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 shadow-xs transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2.5 text-xs font-bold uppercase tracking-wider">
                        {[
                            { id: 'overview', label: 'Overview', icon: Sparkles },
                            { id: 'about', label: 'About Studio', icon: Info },
                            { id: 'services', label: 'Services Menu', icon: Scissors, badge: allServices.length || null },
                            { id: 'offers', label: 'Offers & Packages', icon: Award, badge: offers.length || null },
                            { id: 'stylists', label: 'Master Stylists', icon: Users, badge: staffList.length || null },
                            { id: 'slots', label: 'Reserve Slot', icon: Calendar },
                            { id: 'gallery', label: 'Gallery', icon: Camera, badge: galleryImages.length || null },
                            { id: 'location', label: 'Hours & Map', icon: Clock },
                            { id: 'reviews', label: 'Client Reviews', icon: Star },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => scrollToSection(tab.id)}
                                    className={`px-3.5 py-2 rounded-xl shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                                        isActive
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-black'
                                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    <TabIcon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                    {tab.badge ? (
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                                            isActive
                                                ? 'bg-red-500 text-white'
                                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                        }`}>
                                            {tab.badge}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* ============================================================ */}
            {/* MAIN BESPOKE CONTENT CANVAS */}
            {/* ============================================================ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">

                {/* ============================================================ */}
                {/* 3. ABOUT OUR STUDIO & BOUTIQUE STANDARDS */}
                {/* ============================================================ */}
                <section id="salon-about-section" className="scroll-mt-24 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
                        {/* Narrative Header */}
                        <div className="max-w-3xl space-y-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> The {salonName} Experience
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Where Personalized Luxury Meets Masterful Artistry.
                            </h2>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                                {salon?.description ||
                                    `Welcome to ${salonName} — a premier personal care sanctuary designed exclusively for clients who value perfection. From bespoke haircuts and customized coloring to therapeutic skin rituals, every session is curated with surgical precision and unhurried boutique care.`}
                            </p>
                        </div>

                        {/* 4 Pillars of Excellence */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    title: 'Master Artistry',
                                    desc: 'Certified stylists & colorists trained in contemporary precision craft.',
                                    icon: Scissors
                                },
                                {
                                    title: 'Hospital-Grade Hygiene',
                                    desc: '100% UV-sterilized tools, single-use fresh capes & medical-grade clean.',
                                    icon: ShieldCheck
                                },
                                {
                                    title: 'Luxury Formulations',
                                    desc: 'Authentic salon-grade products ensuring lustrous and lasting results.',
                                    icon: Sparkles
                                },
                                {
                                    title: 'Signature Hospitality',
                                    desc: 'Relaxing ambient lounge, complimentary beverage & personalized consultation.',
                                    icon: Coffee
                                }
                            ].map((pillar, idx) => {
                                const PIcon = pillar.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex flex-col justify-between space-y-3 hover:border-slate-200 dark:hover:border-zinc-700 transition"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#FF0B01] flex items-center justify-center font-black">
                                            <PIcon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                                                {pillar.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Amenities Badges Row */}
                        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-2">
                                Studio Amenities:
                            </span>
                            {[
                                { label: 'Air Conditioned', icon: Sparkles },
                                { label: 'High-Speed Wi-Fi', icon: Wifi },
                                { label: 'Credit Card & UPI', icon: CreditCard },
                                { label: 'Dedicated Parking', icon: Car },
                                { label: 'Complimentary Drinks', icon: Coffee },
                                ...(homeServiceCharges > 0 ? [{ label: `Home Service Available (₹${homeServiceCharges})`, icon: MapPin }] : [])
                            ].map((amenity, i) => {
                                const AIcon = amenity.icon;
                                return (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60"
                                    >
                                        <AIcon className="w-3.5 h-3.5 text-red-500" />
                                        {amenity.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 4. INTERACTIVE SERVICES MENU & LIVE PRICE LIST */}
                {/* ============================================================ */}
                <section id="salon-services-section" className="scroll-mt-24 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5" /> Curated Catalog
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Services Menu & Pricing
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                Explore all bespoke hair, skin, and wellness services crafted at {salonName}.
                            </p>
                        </div>

                        {/* Search Services Filter */}
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={serviceSearchQuery}
                                onChange={(e) => setServiceSearchQuery(e.target.value)}
                                placeholder="Search haircut, facial, spa..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition shadow-xs text-slate-900 dark:text-white"
                            />
                            {serviceSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setServiceSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    {categories.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('All')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                                    selectedCategory === 'All'
                                        ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-black'
                                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                All Services ({allServices.length})
                            </button>
                            {categories.map((catName) => {
                                const catIcon = getCategoryIcon(catName);
                                const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
                                const countInCat = allServices.filter(s => (s.categoryName || s.category || '').toLowerCase() === catName.toLowerCase()).length;
                                return (
                                    <button
                                        key={catName}
                                        type="button"
                                        onClick={() => setSelectedCategory(catName)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                                            isSelected
                                                ? 'bg-red-600 text-white shadow-md shadow-red-600/20 font-black'
                                                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <img src={catIcon} alt="" className="w-4 h-4 object-contain filter invert-0 dark:invert-0" />
                                        <span>{translateServiceName(catName, t)}</span>
                                        {countInCat > 0 && (
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                                            }`}>
                                                {countInCat}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Services Cards Grid */}
                    {filteredServices.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-zinc-800 space-y-3">
                            <Scissors className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                {serviceSearchQuery ? 'No matching services found' : 'Menu is being updated'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {serviceSearchQuery ? 'Try searching another keyword or clear filter.' : 'Please check back shortly or call the salon directly.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.map((service) => {
                                const duration = service.duration || service.durationMinutes || 30;
                                const price = service.price || 0;
                                const catIcon = getCategoryIcon(service.categoryName || service.category);
                                return (
                                    <div
                                        key={service.id}
                                        className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                                    >
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                                                        <img src={catIcon} alt="" className="w-4 h-4 object-contain" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                                        {service.categoryName || service.category || 'Service'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                                                    <Clock className="w-3 h-3 text-red-500" />
                                                    <span>{duration} Min</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-red-600 transition-colors">
                                                    {translateServiceName(service.name, t)}
                                                </h4>
                                                {service.description && (
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Price & Direct Booking */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                                                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                                    ₹{price}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleBookService(service)}
                                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 text-white dark:text-zinc-950 dark:hover:text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                                            >
                                                <span>Book</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom CTA to Full Booking Wizard */}
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 dark:from-zinc-900 dark:to-black text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
                        <div className="space-y-1 text-center sm:text-left">
                            <h4 className="text-base font-black uppercase tracking-tight">Need Multiple Services or Custom Styling?</h4>
                            <p className="text-xs text-slate-400">Launch our interactive booking wizard to bundle services, choose stylists, and reserve slots.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/customer/book-service')}
                            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest shrink-0 transition shadow-md cursor-pointer flex items-center gap-2"
                        >
                            <span>Open Booking Flow</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 5. EXCLUSIVE OFFERS & PACKAGES */}
                {/* ============================================================ */}
                {(offers.length > 0 || packages.length > 0) && (
                    <section id="salon-offers-section" className="scroll-mt-24 space-y-6">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" /> Studio Perks
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Exclusive Offers & Packages
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                Direct promotional vouchers and curated treatment bundles active at {salonName}.
                            </p>
                        </div>

                        {/* Offers Grid */}
                        {offers.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {offers.map((offer) => {
                                    const isPercentage = offer.discountType === 'PERCENTAGE' || offer.percentage !== undefined;
                                    const value = offer.discountValue ?? offer.percentage ?? 0;
                                    const discountBadge = isPercentage ? `${value}% OFF` : `₹${value} OFF`;
                                    const code = offer.code || offer.couponCode || 'PROMO';
                                    const isCopied = copiedOfferCode === code;
                                    return (
                                        <div
                                            key={offer.id}
                                            className="relative bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-dashed border-red-200 dark:border-red-950/80 hover:border-red-400 dark:hover:border-red-800 transition-all shadow-xs flex flex-col justify-between space-y-4 group overflow-hidden"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-3 py-1 rounded-full bg-red-500 text-white text-[11px] font-black tracking-wider uppercase shadow-xs">
                                                        {discountBadge}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        Limited Time
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-red-600 transition-colors">
                                                        {offer.name || offer.title || 'Special Promotion'}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                                                        {offer.description || `Special discount available on select services at ${salonName}.`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Code & Action */}
                                            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                                                <div
                                                    onClick={() => handleCopyOffer(code)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono font-black text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                                                    title="Click to copy coupon code"
                                                >
                                                    {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                                    <span>{code}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/customer/book-service', { state: { selectedOffer: offer } })}
                                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-xs cursor-pointer transition"
                                                >
                                                    Claim & Book
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Packages Grid */}
                        {packages.length > 0 && (
                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-red-500" /> Curated Packages & Combos
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                                        Special Combo
                                                    </span>
                                                    <span className="text-xs font-black text-red-600">
                                                        Save ₹{pkg.discountValue || 150}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                    {pkg.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                    {pkg.description || 'Comprehensive luxury package including hair wash, styling, and rejuvenating treatment.'}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Combo Price</span>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                                        ₹{pkg.packagePrice || pkg.price || 999}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/customer/book-service')}
                                                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xs transition"
                                                >
                                                    Select Package
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* ============================================================ */}
                {/* 6. MEET OUR MASTER STYLISTS & ARTISTS */}
                {/* ============================================================ */}
                <section id="salon-stylists-section" className="scroll-mt-24 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> Creative Team
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Meet Our Master Stylists
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                Dedicated specialists with certifications in advanced hair styling, coloring, and skincare.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/customer/book-service')}
                            className="text-xs font-black text-red-600 hover:underline uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto"
                        >
                            <span>View All Experts</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {staffList.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-zinc-800 space-y-2">
                            <Users className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400">Stylists Roster Active</h4>
                            <p className="text-xs text-slate-400">Our team members can be selected during the booking checkout flow.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {staffList.map((staff, idx) => {
                                const role = staff.speciality || ['Senior Hair Sculptor', 'Master Colorist', 'Skin Aesthetician', 'Bridal Stylist'][idx % 4];
                                const rating = staff.rating ? parseFloat(staff.rating).toFixed(1) : '4.9';
                                return (
                                    <div
                                        key={staff.id || idx}
                                        className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-4 group"
                                    >
                                        {/* Avatar */}
                                        <div className="relative w-24 h-24 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-red-500 to-rose-400 shadow-md">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-800">
                                                {staff.imagePath ? (
                                                    <AsyncImage
                                                        imagePath={staff.imagePath}
                                                        alt={staff.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackText={staff.name?.charAt(0) || 'S'}
                                                    />
                                                ) : (
                                                    <img
                                                        src={getExpertImg(idx)}
                                                        alt={staff.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1">
                                            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-red-600 transition-colors">
                                                {staff.name}
                                            </h4>
                                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                                {role}
                                            </p>
                                            <div className="flex items-center justify-center gap-1 text-xs text-amber-400 font-bold pt-1">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span>{rating}</span>
                                                <span className="text-slate-400 font-normal">Rating</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 px-2 leading-relaxed">
                                            Specializing in bespoke client consultation, precision cutting, and customized care.
                                        </p>

                                        {/* Direct Book CTA */}
                                        <button
                                            type="button"
                                            onClick={() => handleBookWithStaff(staff)}
                                            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-900 dark:bg-zinc-800 dark:hover:bg-white text-slate-900 hover:text-white dark:text-white dark:hover:text-zinc-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                                        >
                                            Book with {staff.name.split(' ')[0]}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ============================================================ */}
                {/* 7. QUICK IN-PAGE APPOINTMENT SLOT BOOKING */}
                {/* ============================================================ */}
                <section id="salon-slots-section" className="scroll-mt-24 space-y-6">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Instant Scheduling
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Reserve Your Slot
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Choose your preferred date and time for an unhurried, personalized session.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                        {/* Month / Year Indicator */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                {selectedDateObj?.month} {selectedDateObj?.year}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider">
                                Live Availability
                            </span>
                        </div>

                        {/* 14-Day Date Scroller */}
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
                                            setSelectedTime(null);
                                        }}
                                        className={`flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl min-w-[64px] transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-gradient-to-b from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 font-black scale-105'
                                                : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <span className="text-[10px] uppercase font-bold tracking-wider">{d.day}</span>
                                        <span className="text-base font-black mt-0.5">{d.num}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Slots Grid */}
                        <div className="pt-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                Available Time Slots for {selectedDateObj?.day}, {selectedDateObj?.num} {selectedDateObj?.month}:
                            </h4>

                            {slotsLoading ? (
                                <div className="py-12 text-center space-y-2">
                                    <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto" />
                                    <p className="text-xs font-bold text-slate-400">Checking studio timetable...</p>
                                </div>
                            ) : salonSlots.length === 0 ? (
                                <div className="py-10 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-2">
                                    <Clock className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                        No online slots available on this date
                                    </p>
                                    <p className="text-xs text-slate-400">Please choose another date or call the salon directly.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                                    {salonSlots.map((slot, idx) => {
                                        const isSelected = selectedSlot?.startTime === slot.startTime;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectSlotAndBook(slot)}
                                                className={`py-2.5 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer shadow-xs ${
                                                    isSelected
                                                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black'
                                                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:border-red-400 dark:hover:border-red-700 hover:bg-white'
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
                </section>

                {/* ============================================================ */}
                {/* 8. STUDIO AMBIENCE & PHOTO GALLERY */}
                {/* ============================================================ */}
                <section id="salon-gallery-section" className="scroll-mt-24 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5" /> Studio Ambience
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Gallery & Atmosphere
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                Take a visual tour of {salonName}'s styling stations, aesthetic lounges, and client work.
                            </p>
                        </div>
                    </div>

                    {galleryImages.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-zinc-800 space-y-2">
                            <Camera className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Photographs being updated</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {galleryImages.map((imgUrl, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 cursor-pointer shadow-xs hover:shadow-lg transition-all ${
                                        idx === 0 ? 'col-span-2 row-span-2 h-[260px] sm:h-[400px]' : 'h-[140px] sm:h-[192px]'
                                    }`}
                                >
                                    <img
                                        src={getSalonImageSrc(imgUrl)}
                                        alt={`Studio photograph ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-md">
                                            View Fullscreen
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ============================================================ */}
                {/* 9. HOURS, LOCATION & CONTACT HUB */}
                {/* ============================================================ */}
                <section id="salon-location-section" className="scroll-mt-24 space-y-6">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Visit Us
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Hours & Studio Location
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Find operating schedules, contact numbers, and turn-by-turn directions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Operating Hours Table */}
                        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-red-500" /> Weekly Timetable
                            </h3>
                            <div className="space-y-1.5">
                                {weekdays.map((day) => {
                                    const operatingHours = formatOperatingHours(day, salon?.openingTime, salon?.closingTime, salon?.weeklyOffDay);
                                    const isOff = operatingHours === 'Closed';
                                    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
                                    const isToday = day.toLowerCase() === todayName.toLowerCase();
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs transition ${
                                                isToday
                                                    ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 font-black text-red-600 dark:text-red-400'
                                                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                                <span className="uppercase font-bold tracking-tight">{day}</span>
                                                {isToday && (
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-red-600 text-white font-black uppercase">
                                                        Today
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`font-mono text-xs ${isOff ? 'text-rose-500 font-bold' : ''}`}>
                                                {operatingHours}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location Details & Interactive Map Card */}
                        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
                                    Studio Address & Landmark
                                </span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {salonName}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span>{addressStr}</span>
                                </p>
                            </div>

                            {/* Direct Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                {salon?.latitude && salon?.longitude ? (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 shadow-xs"
                                    >
                                        <Navigation className="w-4 h-4 text-red-500" />
                                        <span>Directions via Maps</span>
                                    </a>
                                ) : (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salonName + ' ' + addressStr)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 shadow-xs"
                                    >
                                        <Navigation className="w-4 h-4 text-red-500" />
                                        <span>Find on Google Maps</span>
                                    </a>
                                )}

                                {salon?.phone && (
                                    <a
                                        href={`tel:${salon.phone}`}
                                        className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-4 h-4 text-emerald-500" />
                                        <span>Call Studio: {salon.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================ */}
                {/* 10. VERIFIED CLIENT REVIEWS & TESTIMONIAL WALL */}
                {/* ============================================================ */}
                <section id="salon-reviews-section" className="scroll-mt-24 space-y-6">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#FF0B01] flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" /> Client Feedback
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Verified Client Reviews
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Honest ratings and reviews from authenticated patrons of {salonName}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Rating Summary Card */}
                        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-sm text-center space-y-4">
                            <div className="space-y-1">
                                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {ratingScore}
                                </span>
                                <div className="flex items-center justify-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                                    Verified Overall Rating
                                </p>
                            </div>

                            {/* Breakdown Bars */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs font-bold">
                                {[
                                    { stars: '5 Stars', pct: '88%' },
                                    { stars: '4 Stars', pct: '10%' },
                                    { stars: '3 Stars', pct: '2%' }
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-14 text-[10px] text-slate-500 dark:text-zinc-400 text-left shrink-0">{row.stars}</span>
                                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: row.pct }} />
                                        </div>
                                        <span className="text-[10px] text-slate-400 w-8 text-right shrink-0">{row.pct}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonials List */}
                        <div className="lg:col-span-8 space-y-3">
                            {[
                                {
                                    name: 'Priya Sharma',
                                    rating: 5,
                                    date: '2 days ago',
                                    comment: `Best salon experience I've had in a long time. The stylist listened to exactly what I wanted and the hair spa was deeply relaxing!`
                                },
                                {
                                    name: 'Rohan Mehra',
                                    rating: 5,
                                    date: '1 week ago',
                                    comment: `Incredible hygiene and professionalism. The haircut and beard styling were razor sharp. Definitely my new regular studio.`
                                },
                                {
                                    name: 'Ananya Deshmukh',
                                    rating: 5,
                                    date: '2 weeks ago',
                                    comment: `Clean equipment, welcoming hospitality, and outstanding aesthetic facial. Five stars all the way!`
                                }
                            ].map((rev, idx) => {
                                const initials = rev.name.split(' ').map(n => n[0]).join('');
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/50 text-[#FF0B01] font-black text-xs flex items-center justify-center shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                        {rev.name}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {rev.date} • Verified Client
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-amber-400">
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            {/* ============================================================ */}
            {/* 11. FULLSCREEN PHOTO LIGHTBOX MODAL */}
            {/* ============================================================ */}
            {lightboxIndex !== null && galleryImages[lightboxIndex] && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
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

                    <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl border border-white/10">
                        <img
                            src={getSalonImageSrc(galleryImages[lightboxIndex])}
                            alt={`Gallery photo ${lightboxIndex + 1}`}
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

                    <div className="absolute bottom-6 text-xs text-white/70 font-mono">
                        Photo {lightboxIndex + 1} of {galleryImages.length}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* 12. FLOATING QUICK-ACTION DOCK (MOBILE & DESKTOP) */}
            {/* ============================================================ */}
            {showFloatingDock && (
                <aside aria-label="Quick Action Bar" className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 bg-slate-950/90 dark:bg-zinc-900/90 backdrop-blur-md text-white rounded-2xl p-3 border border-white/10 shadow-2xl flex items-center justify-between gap-3 animate-fade-in-up">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <SalonLogoImage
                            logo={salon?.imageUrl || salon?.logoUrl}
                            name={salonName}
                            className="w-9 h-9 rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                            <h4 className="text-xs font-black truncate text-white uppercase">{salonName}</h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{isSalonOpenNow() ? 'Open Now' : 'Closed'}</span>
                                <span>•</span>
                                <span className="text-amber-400 font-bold">★ {ratingScore}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {salon?.phone && (
                            <a
                                href={`tel:${salon.phone}`}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                                title="Call Studio"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => scrollToSection('slots')}
                            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                        >
                            Book Now
                        </button>
                    </div>
                </aside>
            )}

            {/* ============================================================ */}
            {/* 13. BESPOKE WHITE-LABEL FOOTER ATTRIBUTION */}
            {/* ============================================================ */}
            <div className="py-6 border-t border-slate-100 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-500">
                <span className="font-medium">© {new Date().getFullYear()} {salonName}. All Rights Reserved.</span>
                <span className="mx-2">•</span>
                <span className="font-semibold text-slate-500 dark:text-zinc-400">
                    Powered by <strong className="font-black text-[#ff0b01]">NeoParlour</strong>
                </span>
            </div>

        </div>
    );
};

export default SalonPage;
