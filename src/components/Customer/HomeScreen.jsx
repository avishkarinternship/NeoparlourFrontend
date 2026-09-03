import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    searchSalonsByLocation,
    switchTenant,
    fetchCustomerProfile,
    fetchDefaultSalon
} from '../../redux/slices/customerSlice';
import axiosInstance from '../../api/axiosInstance';
import searchService from '../../services/searchService';
import { useTranslation } from 'react-i18next';
import { translateServiceName } from '../../utils/serviceTranslation';


// Navbar Specific Assets (Adjusted paths to match HomeScreen folder depth)
import logoIcon from '../../assets/Neoparlour_logo.png';
import signupIcon from '../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../assets/Customer/Navbar/login_icon.svg';
import offersIcon from '../../assets/Customer/Navbar/offers_icon.svg';

// 2. Fixed Asset Imports (Step back twice '../../' to escape 'components/Customer')
import salonIcon from '../../assets/Customer/HomeScreen/salon_icon.svg';
import reviewIcon from '../../assets/Customer/HomeScreen/review_icon.svg';
import citiesIcon from '../../assets/Customer/HomeScreen/cities_icon.svg';
import appDownloadIcon from '../../assets/Customer/HomeScreen/app_download_icon.svg';
import salonOneIcon from '../../assets/Customer/HomeScreen/Recommended/salon_one.jpg';
import salonTwoIcon from '../../assets/Customer/HomeScreen/Recommended/salon_two.jpg';
import salonThreeIcon from '../../assets/Customer/HomeScreen/Recommended/salon_three.jpg';
import salonFourIcon from '../../assets/Customer/HomeScreen/Recommended/salon_four.jpg';




// Main Screen Form Elements Icons
import searchIcon from '../../assets/Customer/HomeScreen/MainScreen/search_icon.svg';
import locationIcon from '../../assets/Customer/HomeScreen/MainScreen/location_icon.svg';
// import dateIcon from '../../assets/Customer/HomeScreen/MainScreen/date_icon.svg';
import dropdownIcon from '../../assets/Customer/HomeScreen/MainScreen/dropdown_icon.svg';

// Newly Added Main Screen Background & Graphic Assets
import blowDryer from '../../assets/Customer/HomeScreen/MainScreen/blow_dryer.png';
import combImg from '../../assets/Customer/HomeScreen/MainScreen/comb.png';
import sprayImg from '../../assets/Customer/HomeScreen/MainScreen/spray.png';
import scissorsImg from '../../assets/Customer/HomeScreen/MainScreen/scissors.png';
import exploreMoreIcon from '../../assets/Customer/HomeScreen/MainScreen/explore_more.svg';

// 3. New Services Images Imports
import salonImg from '../../assets/Customer/HomeScreen/Services/salon.jpg';
import wellnessImg from '../../assets/Customer/HomeScreen/Services/wellness.jpg';
import nailLashesImg from '../../assets/Customer/HomeScreen/Services/nail_lashes.png';
import spaImg from '../../assets/Customer/HomeScreen/Services/spa.jpg';
import nailSalonImg from '../../assets/Customer/HomeScreen/Services/nail_salon.jpg';
import skinClinicImg from '../../assets/Customer/HomeScreen/Services/skin_clinic.png';

// 4. Salon Growth Section Image Imports
import manageInventoryImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/manage_inventory.png';
import easyAppointmentImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/easy_appointment.jpg';
import leadMagnetImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/lead_magnet.png';
import aiPoweredFeatureImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/ai_powered_feature.png';

// Compare Slider Face Images
import colorFace1 from '../../assets/Customer/HomeScreen/Compare/color_face_1.png';
import colorFace2 from '../../assets/Customer/HomeScreen/Compare/color_face_2.png';

// 5. Partners Section Image Imports
import oliviaImg from '../../assets/Customer/HomeScreen/Partners/olivia_img.png';
import kapilImg from '../../assets/Customer/HomeScreen/Partners/kapil_img.png';
import natulasImg from '../../assets/Customer/HomeScreen/Partners/natulas_img.png';
import mariaImg from '../../assets/Customer/HomeScreen/Partners/maria_img.png';
import toniaguyImg from '../../assets/Customer/HomeScreen/Partners/toniaguy_img.png';
import vlccImg from '../../assets/Customer/HomeScreen/Partners/vlcc_img.png';
import biguineImg from '../../assets/Customer/HomeScreen/Partners/biguine_img.png';

// 6. Review Section Background SVG Imports
import reviewImgOne from '../../assets/Customer/HomeScreen/Review/img_one.svg';
import reviewImgTwo from '../../assets/Customer/HomeScreen/Review/img_two.svg';
import reviewImgThree from '../../assets/Customer/HomeScreen/Review/img_three.svg';
import reviewImgFour from '../../assets/Customer/HomeScreen/Review/img_four.svg';
import reviewImgFive from '../../assets/Customer/HomeScreen/Review/img_five.svg';
import reviewImgSix from '../../assets/Customer/HomeScreen/Review/img_six.svg';

// 7. Review Section Text-Inline Sub SVGs
import subOneImg from '../../assets/Customer/HomeScreen/Review/sub_one_img.svg';
import subTwoImg from '../../assets/Customer/HomeScreen/Review/sub_two_img.svg';
import subThreeImg from '../../assets/Customer/HomeScreen/Review/sub_three_img.svg';
import subFourImg from '../../assets/Customer/HomeScreen/Review/sub_four_img.svg';
import subFiveImg from '../../assets/Customer/HomeScreen/Review/sub_five_img.svg';
import subSixImg from '../../assets/Customer/HomeScreen/Review/sub_six_img.svg';

//footer
import footerLogoIcon from '../../assets/Neoparlour_logo.png';

import Marquee from 'react-fast-marquee';
import { MapPin, Clock, Sparkles, ArrowRight, Star, Home, ShieldCheck, Lock, Navigation as NavigationIcon, MousePointerClick, User, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOFooter from '../common/SEOFooter';



const partners = [
    { src: oliviaImg, alt: "Olivia" },
    { src: kapilImg, alt: "Kapil's" },
    { src: natulasImg, alt: "Naturals" },
    { src: mariaImg, alt: "Marie Claire" },
    { src: toniaguyImg, alt: "Toni & Guy" },
    { src: vlccImg, alt: "VLCC" },
    { src: biguineImg, alt: "Jean-Claude Biguine" },
];

const recommendedSalons = [
    { id: 1, name: "Enrich Salon", location: "Mukund Nagar", img: salonOneIcon, rating: "4.6" },
    { id: 2, name: "Habibs Salon", location: "Kothrud", img: salonTwoIcon, rating: "4.8" },
    { id: 3, name: "Bodycraft", location: "Viman Nagar", img: salonThreeIcon, rating: "4.5" },
    { id: 4, name: "Lakme Salon", location: "Aundh", img: salonFourIcon, rating: "4.7" },
];

const HomeScreen = () => {
    const { t } = useTranslation();
    const { isDark } = useDarkMode();
    const dispatch = useDispatch();
    const [isUserTypingCity, setIsUserTypingCity] = useState(false);
    const [isUserTypingArea, setIsUserTypingArea] = useState(false);
    const { token, loading, salonResults, user, isAuthenticated, profile, defaultSalon } = useSelector((state) => state.customer);

    useEffect(() => {
        if (isAuthenticated && user && !profile) {
            const customerId = user.id || user.user?.id;
            if (customerId) {
                dispatch(fetchCustomerProfile(customerId));
            }
        }
        if (isAuthenticated) {
            dispatch(fetchDefaultSalon());
        }
    }, [isAuthenticated, user, profile, dispatch]);

    const [searchData, setSearchData] = useState({
        cityName: localStorage.getItem('customerCity') || '',
        areaName: localStorage.getItem('customerArea') || '',
        category: '',
    });
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [geoFetched, setGeoFetched] = useState(false);

    const [citySuggestions, setCitySuggestions] = useState([]);
    const [areaSuggestions, setAreaSuggestions] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);

    const navigate = useNavigate();
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationPermission, setLocationPermission] = useState('prompt');
    const [recommendedList, setRecommendedList] = useState(recommendedSalons);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

    // Search Dropdown States
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchSalonsList, setSearchSalonsList] = useState([]);
    const [searchDropdownLoading, setSearchDropdownLoading] = useState(false);
    const [isLocationChanged, setIsLocationChanged] = useState(false);

    // Click outside dropdowns handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.city-dropdown-container')) {
                setShowCityDropdown(false);
            }
            if (!event.target.closest('.area-dropdown-container')) {
                setShowAreaDropdown(false);
            }
            if (!event.target.closest('.search-dropdown-container')) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // OpenStreetMap City autocomplete with debouncing
    useEffect(() => {
        if (!isUserTypingCity) return;
        if (!searchData.cityName || searchData.cityName.trim().length < 2) {
            setCitySuggestions([]);
            return;
        }

        setIsLoadingCities(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchExternalLocations(searchData.cityName, 'city');
                setCitySuggestions(results);
            } catch (err) {
                console.error("OSM City Search Error:", err);
            } finally {
                setIsLoadingCities(false);
            }
        }, 450);

        return () => clearTimeout(delayDebounce);
    }, [searchData.cityName, isUserTypingCity]);

    // OpenStreetMap Area autocomplete with debouncing (scoped by city if present)
    useEffect(() => {
        if (!isUserTypingArea) return;
        if (!searchData.areaName || searchData.areaName.trim().length < 2) {
            setAreaSuggestions([]);
            return;
        }

        setIsLoadingAreas(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchExternalLocations(
                    searchData.areaName,
                    'area',
                    searchData.cityName
                );
                setAreaSuggestions(results);
            } catch (err) {
                console.error("OSM Area Search Error:", err);
            } finally {
                setIsLoadingAreas(false);
            }
        }, 450);

        return () => clearTimeout(delayDebounce);
    }, [searchData.areaName, searchData.cityName, isUserTypingArea]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const result = await searchService.reverseGeocode(latitude, longitude);
                    if (result.city) {
                        setSearchData({
                            cityName: result.city,
                            areaName: result.area || ''
                        });
                        localStorage.setItem('customerCity', result.city);
                        localStorage.setItem('customerArea', result.area || '');
                        setIsLocationChanged(false);

                        // Immediately dispatch salon search
                        dispatch(
                            searchSalonsByLocation({
                                cityName: result.city,
                                areaName: result.area || '',
                            })
                        );
                        toast.success(`Location detected: ${result.city}${result.area ? `, ${result.area}` : ''}`);
                    } else {
                        toast.error("Could not determine your city. Please enter it manually.");
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    toast.error("Error detecting location. Please enter it manually.");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Error retrieving location.";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location permission denied. Please enter your location manually.";
                }
                toast.error(msg);
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const getSalonImageSrc = (imageUrl, fallbackImg) => {
        if (!imageUrl) return fallbackImg;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const base = axiosInstance.defaults.baseURL || 'https://sb.neoparlour.com/api';
        return `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    const fetchCitySalons = async (cityName) => {
        try {
            const response = await axiosInstance.get(`/salons/by-city`, {
                params: { cityName }
            });
            return response.data?.content || [];
        } catch (err) {
            console.error("Error fetching salons by city:", err);
            return [];
        }
    };

    const requestLocationAndFetchSalons = (isClickTriggered = false) => {
        if (!navigator.geolocation) {
            if (isClickTriggered) {
                toast.error("Geolocation is not supported by your browser");
            }
            setLocationPermission('denied');
            setRecommendedList(recommendedSalons);
            setIsPageLoading(false);
            return;
        }

        if (isClickTriggered) {
            setIsDetectingLocation(true);
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocationPermission('granted');
                try {
                    const result = await searchService.reverseGeocode(latitude, longitude);
                    const detectedCity = result.city || "Pune";

                    // Fetch salons from city
                    const apiSalons = await fetchCitySalons(detectedCity);

                    // Format and map cover images and ratings
                    const formatted = apiSalons.map((s, index) => ({
                        name: s.salonName,
                        location: s.areaName || s.cityName,
                        img: s.imageUrl ? getSalonImageSrc(s.imageUrl, null) : null,
                        rating: s.rating || (((s.salonId || 0) % 5) * 0.1 + 4.5).toFixed(1),
                        isApiSalon: true,
                        originalSalon: s
                    }));

                    // Sort by rating descending (top-rated first)
                    formatted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

                    setRecommendedList(formatted);

                    // Save to localStorage
                    localStorage.setItem('customerCity', result.city || detectedCity);
                    localStorage.setItem('customerArea', result.area || '');

                    // Also auto-populate search bar if detecting location
                    setSearchData({
                        cityName: result.city || detectedCity,
                        areaName: result.area || ''
                    });
                    setIsLocationChanged(false);

                    if (isClickTriggered) {
                        toast.success(`Location detected: ${detectedCity}! Recommended list updated.`);
                    }
                } catch (error) {
                    console.error("Error retrieving salons:", error);
                    setRecommendedList(recommendedSalons);
                    if (isClickTriggered) {
                        toast.error("Error identifying location details.");
                    }
                } finally {
                    setIsPageLoading(false);
                    if (isClickTriggered) {
                        setIsDetectingLocation(false);
                    }
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationPermission('denied');
                setRecommendedList(recommendedSalons);
                setIsPageLoading(false);
                if (isClickTriggered) {
                    let msg = "Location permission denied.";
                    if (error.code === error.PERMISSION_DENIED) {
                        msg = "Location permission denied. Please allow location access in your browser settings to see nearby salons.";
                    }
                    toast.error(msg);
                    setIsDetectingLocation(false);
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Website loaded first geolocation trigger
    useEffect(() => {
        if (geoFetched) return;
        setGeoFetched(true);

        const storedCity = localStorage.getItem('customerCity');
        if (storedCity) {
            setIsPageLoading(true);
            fetchCitySalons(storedCity).then(apiSalons => {
                const formatted = apiSalons.map((s, index) => ({
                    name: s.salonName,
                    location: s.areaName || s.cityName,
                    img: s.imageUrl ? getSalonImageSrc(s.imageUrl, null) : null,
                    rating: s.rating || (((s.salonId || 0) % 5) * 0.1 + 4.5).toFixed(1),
                    isApiSalon: true,
                    originalSalon: s
                }));
                formatted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                setRecommendedList(formatted);
                setIsPageLoading(false);
            }).catch(() => {
                setRecommendedList(recommendedSalons);
                setIsPageLoading(false);
            });
        } else {
            requestLocationAndFetchSalons(false);
        }
    }, []);

    const handleRecommendedCardClick = (salon) => {
        handleSalonSelect(salon.originalSalon || salon);
    };

    const handleServiceCardClick = (service) => {
        setSearchData(prev => ({
            ...prev,
            category: service.name
        }));

        const city = searchData.cityName || localStorage.getItem('customerCity');
        if (!city) {
            toast.error("Please select a city first to explore salons!");
            return;
        }

        handleLocationSearch(service.name);
    };

    const handleLocationSearch = async (forcedCategory = null) => {
        const activeCategory = forcedCategory !== null && typeof forcedCategory === 'string' ? forcedCategory : searchData.category;
        if (!searchData.cityName && !searchData.areaName && !activeCategory) return;

        setSearchDropdownLoading(true);
        setShowSearchDropdown(true);
        setIsLocationChanged(true);

        if (searchData.cityName) {
            localStorage.setItem('customerCity', searchData.cityName);
            localStorage.setItem('customerArea', searchData.areaName || '');
        }

        try {
            let results = [];
            if (activeCategory || searchData.areaName) {
                const response = await axiosInstance.get('/salons/location-search', {
                    params: {
                        cityName: searchData.cityName || undefined,
                        areaName: searchData.areaName || undefined,
                        category: activeCategory || undefined
                    }
                });
                results = response.data || [];
            } else {
                const response = await axiosInstance.get('/salons/by-city', {
                    params: { cityName: searchData.cityName }
                });
                results = response.data?.content || response.data || [];
            }

            const formatted = results.map(s => ({
                name: s.salonName || s.name,
                location: s.areaName || s.cityName,
                cityName: s.cityName,
                areaName: s.areaName,
                img: s.imageUrl ? getSalonImageSrc(s.imageUrl, null) : null,
                rating: s.rating || (((s.salonId || 0) % 5) * 0.1 + 4.5).toFixed(1),
                isApiSalon: true,
                originalSalon: s
            }));

            // Sort by rating descending (highest rated first)
            formatted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

            setSearchSalonsList(formatted);
            setRecommendedList(formatted);
        } catch (error) {
            console.error("Location search failed:", error);
            setSearchSalonsList([]);
            setRecommendedList([]);
        } finally {
            setSearchDropdownLoading(false);
        }
    };

    const handleSalonSelect = (salon) => {
        const salonId = salon.salonId || salon.id;
        const salonName = salon.salonName || salon.name || 'Selected Salon';
        localStorage.setItem('activeSalonId', salonId);
        localStorage.setItem('activeSalonName', salonName);

        const hasCategory = !!searchData.category;
        const targetPath = hasCategory ? '/book-service' : '/salon';
        const navState = hasCategory ? { state: { selectedCategory: searchData.category } } : undefined;

        if (!token) {
            navigate(targetPath, navState);
            return;
        }
        const payload = {
            token: token,
            salonId: salonId,
            salonName: salonName
        };
        dispatch(switchTenant(payload))
            .unwrap()
            .then(() => {
                navigate(targetPath, navState);
            })
            .catch((err) => {
                const errMsg = String(err).toLowerCase();
                if (errMsg.includes('token not present') || errMsg.includes('login') || errMsg.includes('unauthorized') || errMsg.includes('token')) {
                    setShowLoginPopup(true);
                }
            });
    };

    const isOpen = (opening, closing) => {
        if (!opening || !closing) return true;
        const now = new Date();
        const [openH, openM] = opening.split(':').map(Number);
        const [closeH, closeM] = closing.split(':').map(Number);
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;
        return currentTime >= openTime && currentTime <= closeTime;
    };

    const handleExploreMore = () => {
        const resultsSection = document.getElementById('results-section');
        const statsSection = document.getElementById('stats-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } else if (statsSection) {
            statsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
        }
    };

    const location = useLocation();
    const currentPath = location.pathname;
    const [activeFaq, setActiveFaq] = useState(null);

    const navLinkClass = (paths) => {
        const isActive = paths.some(p => currentPath === p);
        return `pb-1 transition-colors ${isActive
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'hover:text-gray-900'
            }`;
    };

    // Inline navbar states and display variables removed since shared Navbar handles them internally.


    const servicesData = [
        { name: 'Hair Services', img: salonImg },
        { name: 'Skin Care', img: skinClinicImg },
        { name: 'Hair Removal', img: wellnessImg },
        { name: 'Nail Care', img: nailLashesImg },
        { name: 'Makeup', img: nailSalonImg },
        { name: 'Grooming', img: salonImg },
        { name: 'Spa & Massage', img: spaImg },
        { name: 'Bridal Packages', img: wellnessImg },
        { name: 'Hair Treatment', img: salonImg },
    ];

    const homeTestimonials = [
        {
            id: 1,
            stars: 5,
            title: "The Best Booking System",
            quote: "Great Experience, Easy To Book, Paying For Treatments Is So Convenient - No Cash Or Cards Needed!",
            author: "Avishkar",
            location: "Pune, Maharashtra"
        },
        {
            id: 2,
            stars: 5,
            title: "Highly Recommend",
            quote: "Very fast and seamless booking. I found a top-rated salon in my locality and booked my slot in less than a minute!",
            author: "Rohit Sharma",
            location: "Mumbai, Maharashtra"
        },
        {
            id: 3,
            stars: 5,
            title: "Extremely Convenient",
            quote: "The real-time availability feature is amazing. No phone calls or waiting times. I just walk in at my booked time.",
            author: "Neha Kulkarni",
            location: "Pune, Maharashtra"
        },
        {
            id: 4,
            stars: 5,
            title: "Brilliant App",
            quote: "I love the digital invoices and transparent pricing. There are no hidden charges. Payments are safe and secure.",
            author: "Sneha Patil",
            location: "Bangalore, Karnataka"
        },
        {
            id: 5,
            stars: 5,
            title: "A Lifesaver!",
            quote: "I always get instant WhatsApp reminders and notifications about my bookings, so I never miss an appointment.",
            author: "Pooja Deshmukh",
            location: "Nagpur, Maharashtra"
        },
        {
            id: 6,
            stars: 5,
            title: "Awesome Services",
            quote: "Found the best hair stylist in my area. The review system is authentic, helping me choose the right salon.",
            author: "Amit Verma",
            location: "Delhi, NCR"
        },
        {
            id: 7,
            stars: 5,
            title: "Super Fast Booking",
            quote: "The layout is extremely clean and simple. Easiest way to find premium salons nearby and secure an appointment.",
            author: "Priya Ranade",
            location: "Mumbai, Maharashtra"
        },
        {
            id: 8,
            stars: 5,
            title: "Perfect Experience",
            quote: "Excellent customer service and zero hassle. Love the option to pay online or at the salon directly.",
            author: "Karan Johar",
            location: "Pune, Maharashtra"
        },
        {
            id: 9,
            stars: 5,
            title: "Very Reliable",
            quote: "Highly secure transaction options and prompt booking confirmation. NeoParlour has completely upgraded my grooming routine.",
            author: "Vikram Malhotra",
            location: "Hyderabad, Telangana"
        },
        {
            id: 10,
            stars: 5,
            title: "Simply Amazing",
            quote: "The salon recommendations are spot on. I've tried three different salons through the platform and all were outstanding.",
            author: "Anjali Gupta",
            location: "Kolkata, West Bengal"
        }
    ];

    const faqData = [
        {
            q: t('home.faq.q1', "What is NeoParlour?"),
            a: t('home.faq.a1', "NeoParlour is your complete beauty ecosystem designed to bring premium salon discovery, inventory optimization, and direct appointment management into one simple platform.")
        },
        {
            q: t('home.faq.q2', "Is NeoParlour free to use?"),
            a: t('home.faq.a2', "Listing your basic salon profile and exploring local beauty businesses is completely free. We also offer premium growth tools for inventory and staff optimization.")
        },
        {
            q: t('home.faq.q3', "Who can use NeoParlour?"),
            a: t('home.faq.a3', "Both beauty customers looking to book appointments and salon owners managing operations can seamlessly use our unified ecosystem.")
        },
        {
            q: t('home.faq.q4', "How does the appointment system work?"),
            a: t('home.faq.a4', "Customers pick a service, preferred date, and localized time window. The appointment updates the salon calendar automatically in real time.")
        },
        {
            q: t('home.faq.q5', "How does inventory management help my salon?"),
            a: t('home.faq.a5', "It maps stock levels against actual product consumption during services, alerting you before critical items drop below operational limits.")
        }
    ];

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    // Drawer and profile view states removed since shared Navbar handles them internally.

    if (isPageLoading) {
        return (
            <div className={`min-h-screen font-sans overflow-x-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
                {/* 1. Hero Section Skeleton */}
                <section className="relative min-h-[500px] w-full flex flex-col items-center justify-center py-20 px-6 text-center bg-[#f4f4f4] dark:bg-gray-900 space-y-6">
                    <div className="h-12 w-3/4 max-w-2xl yt-skeleton rounded-2xl mx-auto"></div>
                    <div className="h-5 w-1/2 max-w-lg yt-skeleton rounded-lg mx-auto"></div>
                    {/* Search Bar Skeleton */}
                    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col md:flex-row items-center gap-3 mt-6">
                        <div className="h-12 yt-skeleton rounded-xl w-full md:w-1/3"></div>
                        <div className="h-12 yt-skeleton rounded-xl w-full md:w-1/3"></div>
                        <div className="h-12 yt-skeleton rounded-xl w-full md:w-1/3"></div>
                        <div className="h-12 yt-skeleton rounded-xl w-full md:w-36"></div>
                    </div>
                </section>

                {/* 2. Categories Carousel Skeleton */}
                <section className="max-w-7xl mx-auto px-6 py-12 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="h-7 w-48 yt-skeleton rounded-xl"></div>
                        <div className="h-5 w-20 yt-skeleton rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="flex flex-col items-center space-y-2">
                                <div className="w-16 h-16 rounded-full yt-skeleton"></div>
                                <div className="h-3 w-12 rounded yt-skeleton"></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Recommended Salons Grid Skeleton */}
                <section className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="h-7 w-56 yt-skeleton rounded-xl"></div>
                        <div className="h-5 w-24 yt-skeleton rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4 bg-white dark:bg-gray-900 shadow-sm">
                                <div className="h-44 rounded-xl yt-skeleton"></div>
                                <div className="space-y-2">
                                    <div className="h-5 rounded-lg yt-skeleton w-3/4"></div>
                                    <div className="h-4 rounded-lg yt-skeleton w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Promotional Banner Skeleton */}
                <section className="max-w-7xl mx-auto px-6 py-8">
                    <div className="h-44 rounded-3xl yt-skeleton w-full"></div>
                </section>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>

            {/* 2. HERO SECTION - WITH DECORATIVE CORNER IMAGES AND GREY BACKGROUND */}
            <section className="relative min-h-[540px] w-full flex flex-col items-center justify-center py-20 px-6 text-center overflow-visible bg-[#f4f4f4]">
                {/* Absolute Wrapper to clip the decorative corner images to the grey region */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                    {/* Left side: Blow Dryer (Top Left) */}
                    <div className="absolute left-0 top-[8%] h-[32%] sm:h-[36%] md:h-[40%] pointer-events-none hidden md:block">
                        <img
                            src={blowDryer}
                            alt="Blow dryer"
                            data-aos="fade-right"
                            data-aos-duration="1200"
                            className="h-full w-auto object-contain pointer-events-none"
                        />
                    </div>

                    {/* Left side: Comb (Bottom Left) */}
                    <div className="absolute left-0 bottom-[8%] h-[24%] sm:h-[28%] md:h-[32%] pointer-events-none hidden md:block">
                        <img
                            src={combImg}
                            alt="Comb"
                            data-aos="fade-right"
                            data-aos-duration="1500"
                            className="h-full w-auto object-contain pointer-events-none"
                        />
                    </div>

                    {/* Right side: Spray (Top Right) */}
                    <div className="absolute right-0 top-[8%] h-[32%] sm:h-[36%] md:h-[40%] pointer-events-none hidden md:block">
                        <img
                            src={sprayImg}
                            alt="Spray"
                            data-aos="fade-left"
                            data-aos-duration="1200"
                            className="h-full w-auto object-contain pointer-events-none"
                        />
                    </div>

                    {/* Right side: Scissors (Bottom Right) */}
                    <div className="absolute right-0 bottom-[8%] h-[24%] sm:h-[28%] md:h-[32%] pointer-events-none hidden md:block">
                        <img
                            src={scissorsImg}
                            alt="Scissors"
                            data-aos="fade-left"
                            data-aos-duration="1500"
                            className="h-full w-auto object-contain pointer-events-none"
                        />
                    </div>
                </div>

                <div className="relative z-40 w-full max-w-5xl mx-auto flex flex-col items-center pb-6">
                    <div className="text-gray-900 text-sm md:text-base font-black uppercase tracking-wider mb-4">
                        {t('home.list_your_salon_free', 'List your salon free')}
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 tracking-tight leading-tight">
                        {t('home.hero_title_prefix', 'Everything For')} <span className="text-[#FF2A14]">{t('home.hero_title_accent', 'Salon')}</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-600 mb-10 font-medium text-sm md:text-base leading-relaxed">
                        {t('home.hero_subtitle', 'Not Just A Salon Platform, Your Complete Beauty Ecosystem. Explore Services, Manage Appointments, And Unlock Exclusive Deals, All Under One Roof.')}
                    </p>


                    <div className="relative search-dropdown-container w-full max-w-4xl z-50">
                        <div className={`p-2.5 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] flex flex-col md:flex-row items-center gap-2 border ${isDark ? 'bg-[#1A1A1A] border-gray-500' : 'bg-white border-gray-100'}`}>
                            <div className="relative city-dropdown-container flex items-center gap-3 px-4 py-2 w-full md:border-r border-gray-200">
                                <img src={searchIcon} alt="Search" className="w-5 h-5 object-contain flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder={isDetectingLocation ? t('home.detecting_location', 'DETECTING...') : t('home.select_city', 'SELECT CITY')}
                                    value={searchData.cityName}
                                    onChange={(e) => {
                                        setIsUserTypingCity(true);
                                        setSearchData((prev) => ({
                                            ...prev,
                                            cityName: e.target.value,
                                        }));
                                        setShowCityDropdown(true);
                                        setIsLocationChanged(true);
                                        setShowSearchDropdown(false);
                                    }}
                                    onFocus={() => setShowCityDropdown(true)}
                                    className={`w-full outline-none text-sm font-medium bg-transparent ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-700 placeholder-gray-400'}`} />
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={isDetectingLocation}
                                    className={`p-1.5 rounded-lg text-gray-400 hover:text-[#FF2A14] hover:bg-[#FF2A14]/5 transition-all duration-150 flex-shrink-0 relative ${isDetectingLocation ? 'animate-pulse pointer-events-none' : 'hover:scale-105 active:scale-95'
                                        }`}
                                    title="Detect Current Location"
                                >
                                    {isDetectingLocation ? (
                                        <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                    ) : (
                                        <NavigationIcon className="w-4 h-4 -rotate-45" />
                                    )}
                                </button>
                                {showCityDropdown && searchData.cityName && (
                                    <div className="absolute left-0 top-full z-45 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2">
                                        {isLoadingCities ? (
                                            <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                                <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                                Locating...
                                            </div>
                                        ) : citySuggestions.length > 0 ? (
                                            citySuggestions.map((city, idx) => (
                                                <div key={idx} onClick={() => {
                                                    setIsUserTypingCity(false);
                                                    setIsUserTypingArea(false);
                                                    setSearchData(p => ({ ...p, cityName: city.name, areaName: '' }));
                                                    setShowCityDropdown(false);
                                                    setIsLocationChanged(true);
                                                    setShowSearchDropdown(false);
                                                }} className="px-6 py-3 rounded-lg hover:bg-[#FF2A14]/5 hover:text-[#FF2A14] cursor-pointer transition-all font-bold text-gray-700 text-sm text-left">{city.name}</div>
                                            ))
                                        ) : (
                                            <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No cities found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="relative area-dropdown-container flex items-center justify-between px-4 py-2 w-full md:border-r border-gray-200 gap-2">
                                <div className="flex items-center gap-3 w-full">
                                    <img src={locationIcon} alt="Location" className="w-5 h-5 object-contain flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={t('home.select_area', 'SELECT AREA')}
                                        value={searchData.areaName}
                                        onChange={(e) => {
                                            setIsUserTypingArea(true);
                                            setSearchData((prev) => ({
                                                ...prev,
                                                areaName: e.target.value,
                                            }));
                                            setShowAreaDropdown(true);
                                            setIsLocationChanged(true);
                                            setShowSearchDropdown(false);
                                        }}
                                        onFocus={() => setShowAreaDropdown(true)}
                                        className={`w-full outline-none text-sm font-medium bg-transparent ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-700 placeholder-gray-400'}`}
                                    />
                                </div>
                                <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60" onClick={() => setShowAreaDropdown(!showAreaDropdown)} />
                                {showAreaDropdown && searchData.areaName && (
                                    <div className="absolute left-0 top-full z-45 w-full mt-2 bg-[#ffffff] border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2">
                                        {isLoadingAreas ? (
                                            <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                                <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                                Locating...
                                            </div>
                                        ) : areaSuggestions.length > 0 ? (
                                            areaSuggestions.map((area, idx) => (
                                                <div key={idx} onClick={() => {
                                                    setIsUserTypingCity(false);
                                                    setIsUserTypingArea(false);
                                                    setSearchData(p => ({ ...p, areaName: area.name }));
                                                    setShowAreaDropdown(false);
                                                    setIsLocationChanged(true);
                                                    setShowSearchDropdown(false);
                                                }} className="px-6 py-3 rounded-lg hover:bg-[#FF2A14]/5 hover:text-[#FF2A14] cursor-pointer transition-all font-bold text-gray-700 text-sm text-left">
                                                    {area.name} <span className="text-[10px] text-gray-400 font-normal">({area.city})</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No areas found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Category/Service Select Dropdown */}
                            <div className="relative flex items-center justify-between px-4 py-2 w-full md:border-r border-gray-200 gap-2">
                                <div className="flex items-center gap-3 w-full pointer-events-none">
                                    <Sparkles className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <select
                                        value={searchData.category}
                                        onChange={(e) => {
                                            setSearchData((prev) => ({
                                                ...prev,
                                                category: e.target.value,
                                            }));
                                            setShowSearchDropdown(false);
                                        }}
                                        className="w-full outline-none text-sm font-medium text-gray-700 bg-transparent cursor-pointer appearance-none"
                                    >
                                        <option value="">{t('home.select_service', 'SELECT SERVICE')}</option>
                                        <option value="Hair Services">{t('home.services_grid.hair_services', 'Hair Services')}</option>
                                        <option value="Skin Care">{t('home.services_grid.skin_care', 'Skin Care')}</option>
                                        <option value="Hair Removal">{t('home.services_grid.hair_removal', 'Hair Removal')}</option>
                                        <option value="Nail Care">{t('home.services_grid.nail_care', 'Nail Care')}</option>
                                        <option value="Makeup">{t('home.services_grid.makeup', 'Makeup')}</option>
                                        <option value="Grooming">{t('home.services_grid.grooming', 'Grooming')}</option>
                                        <option value="Spa & Massage">{t('home.services_grid.spa_massage', 'Spa & Massage')}</option>
                                        <option value="Bridal Packages">{t('home.services_grid.bridal_packages', 'Bridal Packages')}</option>
                                        <option value="Hair Treatment">{t('home.services_grid.hair_treatment', 'Hair Treatment')}</option>
                                    </select>
                                </div>
                                <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain opacity-60 pointer-events-none" />
                                
                                <select
                                    value={searchData.category}
                                    onChange={(e) => {
                                        setSearchData((prev) => ({
                                            ...prev,
                                            category: e.target.value,
                                        }));
                                        setShowSearchDropdown(false);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                >
                                    <option value="">SELECT SERVICE</option>
                                    <option value="Hair Services">Hair Services</option>
                                    <option value="Skin Care">Skin Care</option>
                                    <option value="Hair Removal">Hair Removal</option>
                                    <option value="Nail Care">Nail Care</option>
                                    <option value="Makeup">Makeup</option>
                                    <option value="Grooming">Grooming</option>
                                    <option value="Spa & Massage">Spa & Massage</option>
                                    <option value="Bridal Packages">Bridal Packages</option>
                                    <option value="Hair Treatment">Hair Treatment</option>
                                </select>
                            </div>

                            <button
                                onClick={handleLocationSearch}
                                className="w-full md:w-auto bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-3.5 rounded-xl font-bold text-sm tracking-widest shadow-md hover:shadow-lg transition-all duration-150 flex-shrink-0 cursor-pointer"
                            >
                                {searchDropdownLoading ? t('buttons.searching', 'SEARCHING...') : t('buttons.search', 'SEARCH')}
                            </button>
                        </div>

                        {/* Search Dropdown of Salons in Rows */}
                        {showSearchDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-2.5 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-2 z-50">
                                {searchDropdownLoading ? (
                                    <div className="flex items-center justify-center py-8 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                        <div className="h-5 w-5 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                        Searching Salons...
                                    </div>
                                ) : searchSalonsList.length > 0 ? (
                                    <div className="divide-y divide-gray-50 text-left">
                                        {searchSalonsList.map((salon) => (
                                            <div
                                                key={salon.id}
                                                onClick={() => {
                                                    setShowSearchDropdown(false);
                                                    handleSalonSelect(salon.originalSalon);
                                                }}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition rounded-xl"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 flex items-center justify-center">
                                                        {salon.img ? (
                                                            <img src={salon.img} alt={salon.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-[#FF2A14] text-white font-black text-sm uppercase">
                                                                {salon.name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase truncate tracking-tight">{salon.name}</h4>
                                                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                                            <MapPin className="w-3.5 h-3.5 text-[#FF2A14]" />
                                                            <span className="truncate">{salon.location}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                    <span>{salon.rating}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No salons found in this location</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    onClick={handleExploreMore}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 cursor-pointer hover:scale-105 transition-transform duration-200 select-none"
                >
                    <img src={exploreMoreIcon} alt="Explore Now" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
                </div>
            </section>

            {/* QUICK BOOK CARD — Default Salon */}
            {isAuthenticated && defaultSalon && (
                <section className="px-6 pt-12 max-w-5xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8 shadow-xl border border-gray-700/30">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#ff0b01]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest mb-3">
                                    <Zap className="w-3 h-3" />
                                    {t('home.quick_book.badge', 'Quick Book')}
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug">
                                    {t('home.quick_book.title', 'Ready for your next look?')}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium mt-1.5 max-w-md">
                                    {t('home.quick_book.subtitle', 'Book your slot at {{salonName}} in just 2 clicks!', { salonName: defaultSalon.salonName })}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const salonId = defaultSalon.salonId;
                                    const salonName = defaultSalon.salonName || 'Default Salon';
                                    localStorage.setItem('activeSalonId', salonId);
                                    localStorage.setItem('activeSalonName', salonName);
                                    dispatch(switchTenant({ token, salonId, salonName }))
                                        .unwrap()
                                        .then(() => navigate('/salon'))
                                        .catch(() => navigate('/salon'));
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff0b01] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                            >
                                {t('buttons.book_now', 'Book Now')}
                                <Zap className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>
            )}


            {/* 3. FIXED STATS SECTION */}
            {/* <section id="stats-section" className="pt-16 pb-12 border-b" data-aos="fade-up">
                <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-4 px-6">
                    {[
                        { label: t('labels.reviews', 'REVIEWS'), value: "1.14k", img: reviewIcon },
                        { label: t('labels.salons', 'SALONS'), value: "10k", img: salonIcon },
                        { label: t('labels.cities', 'CITIES'), value: "20k", img: citiesIcon },
                        { label: t('labels.app_download', 'APP DOWNLOAD'), value: "20000+", img: appDownloadIcon }
                    ].map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-left">
                            <img src={stat.img} alt={stat.label} className="w-12 h-12 object-contain" />
                            <div className="flex flex-col">
                                <div className="text-xl md:text-2xl font-black text-gray-800 leading-tight">{stat.value}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section> */}

            {/* 4. PREMIUM SALONS NEARBY SECTION */}
            <section className="pt-12 pb-6 px-6 max-w-7xl mx-auto" data-aos="fade-up">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{t('home.premium_salons.title', 'Premium Salons Nearby')}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A14] animate-pulse"></span>
                            {isLocationChanged
                                ? t('home.premium_salons.showing_typed', 'Showing salons according to your typed city and area name')
                                : t('home.premium_salons.showing_current', 'Showing salons of your current location')
                            }
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/salons')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[#FF2A14] hover:text-[#E02510] transition-colors group cursor-pointer self-start md:self-auto"
                    >
                        {t('buttons.see_more', 'See More')}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isPageLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden border shadow-sm bg-white">
                                <div className="h-48 yt-skeleton" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 yt-skeleton rounded w-3/4" />
                                    <div className="h-3 yt-skeleton rounded w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : (
                        recommendedList.slice(0, 8).map((salon, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleRecommendedCardClick(salon)}
                                className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition cursor-pointer group"
                            >
                                <div className="h-48 relative overflow-hidden bg-gray-50">
                                    {salon.img ? (
                                        <img src={salon.img} alt={salon.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                            <img src={logoIcon} alt="NeoParlour" className="w-10 h-10 object-contain opacity-30" />
                                            <span className="text-[11px] font-semibold text-gray-400">No image available</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        {salon.rating != null ? `⭐ ${parseFloat(salon.rating).toFixed(1)}` : '⭐ NEW'}
                                    </div>
                                </div>
                                <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                                    <h4 className="font-bold text-gray-800 uppercase tracking-tight">{salon.name}</h4>
                                    <p className="text-xs text-gray-500">{salon.location}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {(!isPageLoading && recommendedList.length === 0) && (
                    <div className="text-center py-10 bg-gray-55 rounded-2xl border border-dashed border-gray-200 mt-4">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('home.premium_salons.no_salons', 'No salons found nearby')}</p>
                    </div>
                )}
            </section>

            {/* 5. SERVICES GRID */}
            <section className="pt-6 pb-12 px-6 max-w-7xl mx-auto" data-aos="fade-up">
                <h3 className="text-2xl font-bold mb-4">{t('home.services_grid.title', 'Services')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {servicesData.map((service) => (
                        <div
                            key={service.name}
                            onClick={() => handleServiceCardClick(service)}
                            className="relative h-64 rounded-2xl overflow-hidden group bg-gray-100 cursor-pointer"
                        >
                            <img src={service.img} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                            <div className="absolute bottom-6 left-6 text-white text-xl font-bold z-10">{translateServiceName(service.name, t)}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. GROWTH SECTIONS */}
            <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-[#F9FAFB]'}`}>
                <div className="max-w-7xl mx-auto px-6 space-y-28">
                    {/* Feature 1 - Manage Inventory & Staff */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left Container for Staff & Dashboard Composite Image */}
                        <div className="flex-1 w-full" data-aos="fade-right">
                            <div className={`rounded-2xl overflow-hidden shadow-sm border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                                <img
                                    src={manageInventoryImg}
                                    alt="Manage Inventory & Staff"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Right Content Container matching layout and typography hierarchy */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full" data-aos="fade-left">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                {t('home.inventory_section.title', 'MANAGE INVENTORY & STAFF')}
                            </h2>

                            {/* Sub-heading with Red Accent on 'maximize' and 'profit.' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                {t('home.inventory_section.sub_title', 'Control your stock. maximize your profit.')}
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                {t('home.inventory_section.desc', "Never run out of essentials or overstock products again. Track usage, get low-stock alerts, and manage everything from a single dashboard whether it's shampoos, colors, or retail products.")}
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">{t('labels.key_points', 'Key Points')}</h4>

                            {/* Bullet Points with Left-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-start">
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.inventory_section.point1', 'Real-Time Stock Tracking Across Services & Products')}</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.inventory_section.point2', 'Smart Low-Stock Alerts Before You Run Out')}</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.inventory_section.point3', 'Product Usage Insights Per Service')}</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.inventory_section.point4', 'Reduce Wastage & Increase Margins')}</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                {t('buttons.manage_smarter', 'MANAGE SMARTER →')}
                            </button>
                        </div>
                    </div>

                    {/* Feature 2 - Easy Appointments */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Right Container for Image */}
                        <div className="flex-1 w-full" data-aos="fade-left">
                            <div className={`rounded-2xl overflow-hidden shadow-sm border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                                <img
                                    src={easyAppointmentImg}
                                    alt="Easy Appointments"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Left Content Container styled exactly to the right-aligned design layout */}
                        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right w-full" data-aos="fade-right">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                {t('home.appointments_section.title', 'EASY APPOINTMENTS')}
                            </h2>

                            {/* Sub-heading with Red Accent on 'calendar,' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                {t('home.appointments_section.sub_title', 'Fill your calendar, not your waiting area')}
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                {t('home.appointments_section.desc', 'Let your customers book instantly, anytime. No calls, no confusion just smooth, automated scheduling that keeps your chairs occupied all day.')}
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">{t('labels.key_points', 'Key Points')}</h4>

                            {/* Bullet Points with Right-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-end">
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>{t('home.appointments_section.point1', 'Real-Time Sync of Online & Walk-in Appointments')}</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>{t('home.appointments_section.point2', 'Automated WhatsApp Reminders')}</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>{t('home.appointments_section.point3', 'Live Tracking of Staff Schedule & Slots')}</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>{t('home.appointments_section.point4', 'Dramatically Reduce Client No-Shows')}</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                {t('buttons.start_booking', 'START BOOKING →')}
                            </button>
                        </div>
                    </div>

                    {/* Feature 3 - NeoParlour Lead Magnet */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left Container for Product Dashboard Image */}
                        <div className="flex-1 w-full" data-aos="fade-right">
                            <div className={`rounded-2xl overflow-hidden shadow-sm border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                                <img
                                    src={leadMagnetImg}
                                    alt="NeoParlour Lead Magnet"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Right Content Container matching layout and typography hierarchy */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full" data-aos="fade-left">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                {t('home.lead_magnet_section.title', 'NEOPARLOUR LEAD MAGNET')}
                            </h2>

                            {/* Sub-heading with Red Accent on 'paying clients' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                {t('home.lead_magnet_section.sub_title', 'Turn searches into paying clients.')}
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                {t('home.lead_magnet_section.desc', 'Get discovered by people actively looking for salon services near them. NeoParlour brings high-intent customers directly to your business.')}
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">{t('labels.key_points', 'Key Points')}</h4>

                            {/* Bullet Points with Left-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-start">
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.lead_magnet_section.point1', 'Appear In Local Search Results Instantly')}</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.lead_magnet_section.point2', 'Get Verified Leads, Not Random Traffic')}</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.lead_magnet_section.point3', 'Boost Visibility Without Extra Marketing Cost')}</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>{t('home.lead_magnet_section.point4', 'Convert Walk-Ins Into Loyal Customers')}</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                {t('buttons.get_more_clients', 'GET MORE CLIENTS →')}
                            </button>
                        </div>
                    </div>

                    {/* Feature 4 - AI Powered Features */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Right Container - Compare Slider with Floating Labels */}
                        <div className="flex-1 w-full" data-aos="fade-left">
                            <div className="relative">
                                {/* Compare Slider */}
                                <div className={`rounded-2xl overflow-hidden shadow-lg border h-[320px] md:h-[420px] ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                                    <ReactCompareSlider
                                        itemOne={
                                            <ReactCompareSliderImage
                                                src={colorFace1}
                                                alt="Before - Original Look"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        }
                                        itemTwo={
                                            <ReactCompareSliderImage
                                                src={colorFace2}
                                                alt="After - AI Suggested Look"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        }
                                        position={50}
                                        style={{ height: '100%' }}
                                        handle={
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <div className="w-[3px] h-full bg-white shadow-lg"></div>
                                                <div className="absolute w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-[#FF2A14]">
                                                    <svg className="w-5 h-5 text-[#FF2A14]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                                    </svg>
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>

                                {/* Floating AI Feature Labels */}
                                {/* Top Left - AI Assistant */}
                                <div className="hidden md:flex absolute top-8 -left-4 md:-left-8 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '3s' }}>
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.ai_assistant', 'AI Assistant')}</span>
                                </div>

                                {/* Top Right - Haircut Suggestions */}
                                <div className="hidden md:flex absolute top-4 -right-2 md:-right-6 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '3.5s' }}>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.haircut_suggestions', 'Haircut Suggestions')}</span>
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Middle Left - Beard Suggestions */}
                                <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-4 md:-left-10 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '2.8s' }}>
                                    <div className="w-7 h-7 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase block">{t('home.ai_badges.beard_suggestions', 'Beard Suggestions')}</span>
                                    </div>
                                </div>

                                {/* Middle Right - Chatbot */}
                                <div className="hidden md:flex absolute top-[40%] -right-2 md:-right-8 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '3.2s' }}>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.ai_chatbot', 'Chatbot')}</span>
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Bottom Right - WhatsApp Booking */}
                                <div className="hidden md:flex absolute bottom-8 -right-2 md:-right-6 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '2.5s' }}>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.whatsapp_booking', 'WhatsApp Booking')}</span>
                                    <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Bottom Left - Style Matcher Icon */}
                                <div className="hidden md:flex absolute bottom-12 -left-2 md:-left-4 w-9 h-9 bg-[#FF2A14] rounded-full items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Mobile-only AI Feature Checkpoints */}
                            <div className="grid grid-cols-2 gap-3 mt-6 md:hidden px-2">
                                {/* AI Assistant */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.ai_assistant', 'AI Assistant')}</span>
                                </div>

                                {/* Haircut Suggestions */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase font-sans">{t('home.ai_badges.haircut_suggestions', 'Haircut Suggests')}</span>
                                </div>

                                {/* Beard Suggestions */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.beard_suggestions', 'Beard Suggests')}</span>
                                </div>

                                {/* Chatbot */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.ai_chatbot', 'AI Chatbot')}</span>
                                </div>

                                {/* WhatsApp Booking */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.whatsapp_booking', 'WhatsApp Book')}</span>
                                </div>

                                {/* Style Matcher */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">{t('home.ai_badges.style_matcher', 'Style Matcher')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Container styled exactly to the design layout */}
                        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right w-full" data-aos="fade-right">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                AI POWERED FEATURES
                            </h2>

                            {/* Sub-heading with Red Accent */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Smarter Decisions. <br />
                                <span className="text-gray-500">Higher </span>
                                <span className="text-[#FF2A14]">Revenue.</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Leverage AI to understand customer behavior, predict demand, and automate growth so you focus on service while we handle intelligence.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Right-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-end">
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>AI-Driven Customer Insights & Preferences</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Smart Pricing & Offer Recommendations</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Predict Peak Hours & Optimize Staff</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Automated Marketing Suggestions</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                UNLOCK AI GROWTH →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PARTNERS SECTION - UPDATED INFINITE MARQUEE WITH 3 ROW LOOPS */}
            <section className="py-16 bg-white border-b border-gray-100 overflow-hidden select-none">
                <div className="w-full text-center">
                    <h2 className="text-gray-400 font-bold text-sm tracking-[0.3em] uppercase mb-10 px-6">
                        Partners
                    </h2>

                    <div className="flex flex-col gap-10">
                        {/* First Row - Left to Right */}
                        <Marquee
                            speed={40}
                            gradient={false}
                            pauseOnHover={true}
                        >
                            {partners.map((partner, idx) => (
                                <img
                                    key={idx}
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="h-8 sm:h-10 mx-10 object-contain opacity-75 hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </Marquee>

                        {/* Second Row - Right to Left */}
                        <Marquee
                            speed={35}
                            direction="right"
                            gradient={false}
                            pauseOnHover={true}
                        >
                            {partners.map((partner, idx) => (
                                <img
                                    key={idx}
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="h-8 sm:h-10 mx-10 object-contain opacity-75 hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </Marquee>

                        {/* Third Row - Left to Right (optional) */}
                        <Marquee
                            speed={45}
                            gradient={false}
                            pauseOnHover={true}
                        >
                            {partners.map((partner, idx) => (
                                <img
                                    key={idx}
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="h-8 sm:h-10 mx-10 object-contain opacity-75 hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </Marquee>
                    </div>
                </div>
            </section>

            {/* 8. REVIEWS & STATS GRAPHIC BANNER */}
            <section className="relative py-24 bg-[#EAEAEA] overflow-hidden flex items-center justify-center min-h-[340px]">

                {/* Floating Decorative SVG Assets Layer */}
                <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
                    <img src={reviewImgOne} alt="" className="absolute top-10 left-[10%] w-12 h-12 object-contain opacity-90 animate-pulse" />
                    <img src={reviewImgTwo} alt="" className="absolute top-1/4 right-[15%] w-10 h-10 object-contain opacity-90" />
                    <img src={reviewImgThree} alt="" className="absolute bottom-12 left-[18%] w-14 h-14 object-contain opacity-90" />
                    <img src={reviewImgFour} alt="" className="absolute top-12 left-[45%] w-8 h-8 object-contain opacity-40" />
                    <img src={reviewImgFive} alt="" className="absolute bottom-6 left-[50%] w-10 h-10 object-contain opacity-90" />
                    <img src={reviewImgSix} alt="" className="absolute bottom-14 right-[12%] w-14 h-14 object-contain opacity-90" />
                </div>

                {/* Central Statistics Typographic Content Layer with explicit block flex bounds for sub images */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col justify-center items-center select-none w-full">

                    {/* Reviews Headline Block with Sub 1 & Sub 2 */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 w-full">
                        <img src={subOneImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                        <div className="text-gray-400 font-extrabold text-xl md:text-2xl tracking-[0.25em] uppercase whitespace-nowrap">
                            1.14k Reviews
                        </div>
                        <img src={subTwoImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                    </div>

                    {/* Salons Headline Block with Sub 3 & Sub 4 */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 my-2 w-full">
                        <img src={subThreeImg} alt="" className="w-8 h-8 sm:w-12 sm:h-12 min-w-[32px] min-h-[32px] sm:min-w-[48px] sm:min-h-[48px] object-contain block" />
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none whitespace-nowrap">
                            <span className="text-[#FF2A14]">10K</span> SALONS
                        </h2>
                        <img src={subFourImg} alt="" className="w-8 h-8 sm:w-12 sm:h-12 min-w-[32px] min-h-[32px] sm:min-w-[48px] sm:min-h-[48px] object-contain block" />
                    </div>

                    {/* Cities Headline Block with Sub 5 & Sub 6 */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 w-full">
                        <img src={subFiveImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                        <div className="text-gray-400 font-extrabold text-xl md:text-2xl tracking-[0.25em] uppercase whitespace-nowrap">
                            20k Cities
                        </div>
                        <img src={subSixImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                    </div>
                </div>
            </section>

            {/* 9. FAQ SECTION */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <h2 className="text-center text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">{t('home.faq.header', 'FREQUENTLY ASKED QUESTIONS')}</h2>
                <div className="space-y-4">
                    {faqData.map((item, i) => (
                        <div key={i} className="border-b border-gray-100 pb-4">
                            <div
                                onClick={() => toggleFaq(i)}
                                className="flex items-center justify-between p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100/70 transition-all"
                            >
                                <span className="font-bold text-gray-700">{i + 1}. {item.q}</span>
                                <span className={`text-gray-400 text-2xl font-light transform transition-transform duration-200 ${activeFaq === i ? 'rotate-45' : ''}`}>+</span>
                            </div>
                            {activeFaq === i && (
                                <div className="p-6 bg-white text-sm text-gray-500 leading-relaxed transition-all">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 10. TESTIMONIALS */}
            <section className="py-16 px-6 bg-white overflow-hidden">
                <h2 className="text-center text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">{t('home.testimonials.header', 'WHAT OUR USERS SAY')}</h2>
                <div className="w-full overflow-hidden">
                    <Marquee
                        gradient={false}
                        speed={45}
                        pauseOnHover={true}
                        className="py-10 flex items-center"
                    >
                        {homeTestimonials.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gray-50 border border-gray-100 hover:border-gray-200/80 rounded-[16px] sm:rounded-[24px] p-4 sm:p-8 flex flex-col justify-between text-left h-[15rem] sm:h-[22rem] w-[42vw] sm:w-[20rem] mx-2 sm:mx-4 shrink-0 shadow-sm hover:shadow-lg hover:-translate-y-3 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
                            >
                                <div className="min-h-0">
                                    {/* Stars */}
                                    <div className="text-yellow-500 mb-2 sm:mb-4 flex gap-0.5">
                                        {"★".repeat(item.stars).split("").map((star, i) => (
                                            <span key={i} className="text-[10px] sm:text-sm">{star}</span>
                                        ))}
                                    </div>
                                    <h4 className="font-black text-xs sm:text-base text-gray-900 mb-1.5 sm:mb-3 italic line-clamp-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-gray-500 text-[9px] sm:text-xs leading-normal sm:leading-relaxed font-medium line-clamp-4 overflow-hidden">
                                        {item.quote}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4 mt-auto">
                                    <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-gray-300/80 shrink-0"></div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-[10px] sm:text-xs">{item.author}</div>
                                        <div className="text-[8px] sm:text-[10px] text-gray-400 font-semibold">{item.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Marquee>
                </div>
            </section>

            {/* Global Custom Login Required Modal Popup */}
            {showLoginPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes scaleUp {
                            from { transform: scale(0.95); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        .animate-fade-in {
                            animation: fadeIn 0.2s ease-out forwards;
                        }
                        .animate-scale-up {
                            animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                    `}</style>
                    <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 p-8 text-center animate-scale-up">
                        {/* Elegant background highlight blur */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF2A14]/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#FF2A14]/5 rounded-full blur-2xl pointer-events-none" />

                        {/* Top Icon Block */}
                        <div className="mx-auto w-16 h-16 bg-[#FF2A14]/10 rounded-2xl flex items-center justify-center text-[#FF2A14] mb-6 shadow-inner relative z-10">
                            <Lock className="w-7 h-7" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3 relative z-10">
                            Login Required
                        </h3>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 px-2 relative z-10">
                            To view details and book custom services at this premium salon, you need to sign in to your NeoParlour account first.
                        </p>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <button
                                onClick={() => setShowLoginPopup(false)}
                                className="w-full py-4 border border-gray-200 text-gray-700 font-bold text-xs tracking-wider rounded-2xl hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowLoginPopup(false);
                                    navigate('/customer/login');
                                }}
                                className="w-full py-4 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-bold text-xs tracking-wider rounded-2xl shadow-lg shadow-[#FF2A14]/20 hover:shadow-[#FF2A14]/35 active:scale-95 transition-all uppercase"
                            >
                                Login Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <SEOFooter />
        </div>
    );
};

export default HomeScreen;