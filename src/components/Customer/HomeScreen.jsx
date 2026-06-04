import React, { useState, useEffect, useRef } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    searchSalonsByLocation,
    switchTenant,
    fetchCustomerProfile
} from '../../redux/slices/customerSlice';
import axiosInstance from '../../api/axiosInstance';
import searchService from '../../services/searchService';


// Navbar Specific Assets (Adjusted paths to match HomeScreen folder depth)
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
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
import backgroundImg from '../../assets/Customer/HomeScreen/MainScreen/background_img.png';
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
import footerLogoIcon from '../../assets/Owner/logo_icon.svg';

import Drawer from './Drawer';
import Marquee from 'react-fast-marquee';
import { MapPin, Clock, Sparkles, ArrowRight, Star, Home, ShieldCheck, Lock, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';


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
    { name: "Enrich Salon", location: "Mukund Nagar", img: salonOneIcon, rating: "4.6" },
    { name: "Habibs Salon", location: "Kothrud", img: salonTwoIcon, rating: "4.8" },
    { name: "Bodycraft", location: "Viman Nagar", img: salonThreeIcon, rating: "4.5" },
    { name: "Lakme Salon", location: "Aundh", img: salonFourIcon, rating: "4.7" },
];

const HomeScreen = () => {
    const dispatch = useDispatch();
    const { token, loading, salonResults, user, isAuthenticated, profile } = useSelector((state) => state.customer);

    useEffect(() => {
        if (isAuthenticated && user && !profile) {
            const customerId = user.id || user.user?.id;
            if (customerId) {
                dispatch(fetchCustomerProfile(customerId));
            }
        }
    }, [isAuthenticated, user, profile, dispatch]);

    const [searchData, setSearchData] = useState({
        cityName: '',
        areaName: '',
    });

    const [citySuggestions, setCitySuggestions] = useState([]);
    const [areaSuggestions, setAreaSuggestions] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);

    const cityDropdownRef = useRef(null);
    const areaDropdownRef = useRef(null);

    const navigate = useNavigate();
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationPermission, setLocationPermission] = useState('prompt');
    const [recommendedList, setRecommendedList] = useState(recommendedSalons);

    // Click outside dropdowns handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
                setShowCityDropdown(false);
            }
            if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
                setShowAreaDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // OpenStreetMap City autocomplete with debouncing
    useEffect(() => {
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
    }, [searchData.cityName]);

    // OpenStreetMap Area autocomplete with debouncing (scoped by city if present)
    useEffect(() => {
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
    }, [searchData.areaName, searchData.cityName]);

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
                    const coverImages = [salonOneIcon, salonTwoIcon, salonThreeIcon, salonFourIcon];
                    const formatted = apiSalons.map((s, index) => ({
                        name: s.salonName,
                        location: s.areaName || s.cityName,
                        img: coverImages[index % 4],
                        rating: s.rating || (((s.salonId || 0) % 5) * 0.1 + 4.5).toFixed(1),
                        isApiSalon: true,
                        originalSalon: s
                    }));

                    // Sort by rating descending (top-rated first)
                    formatted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

                    setRecommendedList(formatted);

                    // Also auto-populate search bar if detecting location
                    setSearchData({
                        cityName: result.city || detectedCity,
                        areaName: result.area || ''
                    });

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
                    if (isClickTriggered) {
                        setIsDetectingLocation(false);
                    }
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationPermission('denied');
                setRecommendedList(recommendedSalons);
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
        requestLocationAndFetchSalons(false);
    }, []);

    const handleRecommendedCardClick = (salon) => {
        if (locationPermission !== 'granted') {
            requestLocationAndFetchSalons(true);
        } else if (salon.isApiSalon) {
            handleSalonSelect(salon.originalSalon);
        } else {
            requestLocationAndFetchSalons(true);
        }
    };

    const handleServiceCardClick = (service) => {
        if (locationPermission !== 'granted') {
            requestLocationAndFetchSalons(true);
        } else {
            toast.success(`Exploring ${service.name} services near you!`);
        }
    };

    const handleLocationSearch = async () => {
        console.log(searchData);

        if (!searchData.cityName && !searchData.areaName) return;

        try {
            await dispatch(
                searchSalonsByLocation({
                    cityName: searchData.cityName,
                    areaName: searchData.areaName,
                })
            ).unwrap();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSalonSelect = (salon) => {
        if (!token) {
            setShowLoginPopup(true);
            return;
        }
        const payload = {
            token: token,
            tenantId: salon.salonCode,
            salonName: salon.salonName
        };
        dispatch(switchTenant(payload))
            .unwrap()
            .then(() => {
                navigate('/customer/home');
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


    const servicesData = [
        { name: 'Salon', img: salonImg },
        { name: 'Wellness & Spa', img: wellnessImg },
        { name: 'Nail & Lashes', img: nailLashesImg },
        { name: 'Spa', img: spaImg },
        { name: 'Nail Salon', img: nailSalonImg },
        { name: 'Skin Clinic', img: skinClinicImg },
    ];

    const faqData = [
        {
            q: "What is NeoParlour?",
            a: "NeoParlour is your complete beauty ecosystem designed to bring premium salon discovery, inventory optimization, and direct appointment management into one simple platform."
        },
        {
            q: "Is NeoParlour free to use?",
            a: "Listing your basic salon profile and exploring local beauty businesses is completely free. We also offer premium growth tools for inventory and staff optimization."
        },
        {
            q: "Who can use NeoParlour?",
            a: "Both beauty customers looking to book appointments and salon owners managing operations can seamlessly use our unified ecosystem."
        },
        {
            q: "How does the appointment system work?",
            a: "Customers pick a service, preferred date, and localized time window. The appointment updates the salon calendar automatically in real time."
        },
        {
            q: "How does inventory management help my salon?",
            a: "It maps stock levels against actual product consumption during services, alerting you before critical items drop below operational limits."
        }
    ];

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentView, setCurrentView] = useState('home');

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

            {/* 1. NAVBAR */}
            <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b sticky top-0 z-50 font-sans">
                {/* Logo Section */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <img src={logoIcon} alt="NeoParlour" className="h-8 object-contain" />
                    <span className="text-xl font-black tracking-tight text-gray-900">NeoParlour</span>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider text-gray-600">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/home'); }} className={navLinkClass(['/customer/home', '/customer/dashboard', '/'])}>HOME</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/about'); }} className={navLinkClass(['/customer/about', '/about'])}>ABOUT</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/features'); }} className={navLinkClass(['/customer/features', '/features'])}>FEATURES</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">PARTNER WITH US</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">GIFTCARD</a>
                    <a href="#" className="hover:text-gray-900 transition-colors flex items-center gap-1">
                        OFFERS
                        <img src={offersIcon} alt="Offers" className="w-4 h-4 object-contain" />
                    </a>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && (user || profile) ? (
                        <button 
                            onClick={() => navigate('/customer/dashboard')} 
                            className="flex items-center gap-2.5 px-3 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-gray-900 rounded-full transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer pl-2 pr-4 font-sans"
                        >
                            {/* Circular Logo/Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                                {((profile?.fullName || user?.name || user?.username || 'P').charAt(0)).toUpperCase()}
                            </div>
                            {/* User Name */}
                            <span className="text-xs font-black text-gray-800 tracking-tight">
                                {profile?.fullName || user?.name || user?.username || 'Profile'}
                            </span>
                        </button>
                    ) : (
                        <>
                            {/* Signup Button */}
                            <button onClick={() => navigate('/register')} className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition text-gray-500">
                                <img src={signupIcon} alt="Signup" className="w-5 h-5 object-contain" />
                                SIGNUP
                            </button>

                            {/* Login Button */}
                            <button onClick={() => navigate('/customer/login')} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                                <img src={loginIcon} alt="Login" className="w-5 h-5 object-contain" />
                                LOGIN
                            </button>
                        </>
                    )}

                    {/* Hamburger Menu Icon */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition ml-1"
                        title="Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </nav>

            {/* 2. Place your standalone Drawer component here */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                setCurrentView={setCurrentView}
            />

            {/* 2. HERO SECTION - WITH ONE BACKGROUND IMAGE */}
            <section className="relative min-h-[540px] w-full flex flex-col items-center justify-center py-20 px-6 text-center overflow-visible bg-[#F3F4F6]">
                <img
                    src={backgroundImg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
                />
                <div className="absolute inset-0 bg-white/5 pointer-events-none z-10"></div>

                <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center pb-6">
                    <div className="text-gray-900 text-sm md:text-base font-black uppercase tracking-wider mb-4">
                        List your salon free
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 tracking-tight leading-tight">
                        Everything For <span className="text-[#FF2A14]">Salon</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-600 mb-10 font-medium text-sm md:text-base leading-relaxed">
                        Not Just A Salon Platform, Your Complete Beauty Ecosystem. Explore Services, Manage Appointments, And Unlock Exclusive Deals, All Under One Roof.
                    </p>


                    <div className="w-full max-w-4xl bg-white p-2.5 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] flex flex-col md:flex-row items-center gap-2 border border-gray-100">
                        <div className="relative flex items-center gap-3 px-4 py-2 w-full md:border-r border-gray-200" ref={cityDropdownRef}>
                            <img src={searchIcon} alt="Search" className="w-5 h-5 object-contain flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={isDetectingLocation ? "DETECTING..." : "SELECT CITY"}
                                value={searchData.cityName}
                                onChange={(e) => {
                                    setSearchData((prev) => ({
                                        ...prev,
                                        cityName: e.target.value,
                                    }));
                                    setShowCityDropdown(true);
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                className="w-full outline-none text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent" />
                            <button
                                type="button"
                                onClick={handleDetectLocation}
                                disabled={isDetectingLocation}
                                className={`p-1.5 rounded-lg text-gray-400 hover:text-[#FF2A14] hover:bg-[#FF2A14]/5 transition-all duration-150 flex-shrink-0 relative ${
                                    isDetectingLocation ? 'animate-pulse pointer-events-none' : 'hover:scale-105 active:scale-95'
                                }`}
                                title="Detect Current Location"
                            >
                                {isDetectingLocation ? (
                                    <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                ) : (
                                    <Navigation className="w-4 h-4 -rotate-45" />
                                )}
                            </button>
                            {showCityDropdown && searchData.cityName && (
                                <div className="absolute left-0 top-full z-40 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2">
                                    {isLoadingCities ? (
                                        <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                            <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                            Locating...
                                        </div>
                                    ) : citySuggestions.length > 0 ? (
                                        citySuggestions.map((city, idx) => (
                                            <div key={idx} onClick={() => {
                                                setSearchData(p => ({ ...p, cityName: city.name, areaName: '' }));
                                                setShowCityDropdown(false);
                                            }} className="px-6 py-3 rounded-lg hover:bg-[#FF2A14]/5 hover:text-[#FF2A14] cursor-pointer transition-all font-bold text-gray-700 text-sm text-left">{city.name}</div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No cities found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative flex items-center justify-between px-4 py-2 w-full md:border-r border-gray-200 gap-2" ref={areaDropdownRef}>
                            <div className="flex items-center gap-3 w-full">
                                <img src={locationIcon} alt="Location" className="w-5 h-5 object-contain flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="SELECT AREA"
                                    value={searchData.areaName}
                                    onChange={(e) => {
                                        setSearchData((prev) => ({
                                            ...prev,
                                            areaName: e.target.value,
                                        }));
                                        setShowAreaDropdown(true);
                                    }}
                                    onFocus={() => setShowAreaDropdown(true)}
                                    className="w-full outline-none text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent"
                                />
                            </div>
                            <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60" onClick={() => setShowAreaDropdown(!showAreaDropdown)} />
                            {showAreaDropdown && searchData.areaName && (
                                <div className="absolute left-0 top-full z-40 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2">
                                    {isLoadingAreas ? (
                                        <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                            <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                            Locating...
                                        </div>
                                    ) : areaSuggestions.length > 0 ? (
                                        areaSuggestions.map((area, idx) => (
                                            <div key={idx} onClick={() => {
                                                setSearchData(p => ({ ...p, areaName: area.name }));
                                                setShowAreaDropdown(false);
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

                        {/* <div className="flex items-center justify-between px-4 py-2 w-full gap-2">
                            <div className="flex items-center gap-3 w-full">
                                <img src={dateIcon} alt="Date" className="w-5 h-5 object-contain flex-shrink-0" />
                                <input type="text" placeholder="Date" className="w-full outline-none text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent" />
                            </div>
                            <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60" />
                        </div> */}

                        <button
                            onClick={handleLocationSearch}
                            className="w-full md:w-auto bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-3.5 rounded-xl font-bold text-sm tracking-widest shadow-md hover:shadow-lg transition-all duration-150 flex-shrink-0"
                        >
                            {loading ? 'Searching...' : 'SEARCH'}
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-30 cursor-pointer hover:scale-105 transition-transform duration-200 select-none">
                    <img src={exploreMoreIcon} alt="Explore Now" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
                </div>
            </section>

            {/* Salon Search Results Section */}
            {salonResults && salonResults.length > 0 && (
                <section className="py-16 bg-[#F9FAFB] px-6 border-b" data-aos="fade-up">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center mb-12 text-center">
                            <h2 className="text-[#FF2A14] text-xs font-black tracking-[0.3em] uppercase mb-3">Found Destinations</h2>
                            <h3 className="text-gray-900 text-3xl font-black uppercase tracking-tight">Premium Salons Nearby</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {salonResults.map((salon, index) => {
                                const currentlyOpen = isOpen(salon.openingTime, salon.closingTime);
                                const coverImages = [salonOneIcon, salonTwoIcon, salonThreeIcon, salonFourIcon];
                                const coverImg = coverImages[index % 4];
                                const rating = (((salon.salonId || 0) % 5) * 0.1 + 4.5).toFixed(1);
                                const reviewsCount = (((salon.salonId || 0) * 17) % 80) + 40;
                                return (
                                    <div
                                        key={salon.salonId || index}
                                        onClick={() => handleSalonSelect(salon)}
                                        className="group relative flex flex-col rounded-[32px] bg-white border border-gray-100/80 hover:border-[#FF2A14]/30 hover:shadow-[0_24px_50px_-15px_rgba(255,42,20,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden text-left shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
                                    >
                                        {/* Card Header: Cover Image block with metadata tags overlay */}
                                        <div className="h-44 relative overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={coverImg}
                                                alt={salon.salonName}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />
                                            {/* Gradient Overlay for better contrast */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                                            {/* Top Metadata Badges */}
                                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                                                {/* Open / Closed Badge */}
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${currentlyOpen
                                                        ? 'bg-white/95 border-emerald-500/20 text-emerald-700'
                                                        : 'bg-white/95 border-rose-500/20 text-rose-700'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${currentlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                    {currentlyOpen ? 'Open' : 'Closed'}
                                                </div>

                                                {/* Deterministic Rating Badge */}
                                                <div className="bg-white/95 backdrop-blur-md border border-amber-500/20 text-amber-600 rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    <span>{rating} ({reviewsCount}+)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Avatar Overlay */}
                                        <div className="relative -mt-8 ml-6 z-20 w-16 h-16 bg-white rounded-2xl overflow-hidden border-[3px] border-white shadow-xl group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                                            {salon.imageBase64 ? (
                                                <img src={`data:image/png;base64,${salon.imageBase64}`} alt={salon.salonName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#FF2A14] to-[#FF6B57] text-white text-2xl font-black">
                                                    {salon.salonName ? salon.salonName[0] : 'S'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body Details */}
                                        <div className="p-6 pt-3 flex flex-col flex-grow">
                                            <span className="text-[9px] font-black tracking-[0.2em] text-[#FF2A14]/75 uppercase mb-1 flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" /> NeoParlour Partner
                                            </span>

                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#FF2A14] transition-colors leading-snug uppercase tracking-tight line-clamp-1 flex-1">
                                                    {salon.salonName}
                                                </h4>
                                                <span className="text-[9px] font-bold bg-gray-50 text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-widest flex-shrink-0 mt-1">
                                                    {salon.salonCode}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-2">
                                                <MapPin className="w-3.5 h-3.5 text-[#FF2A14] flex-shrink-0" />
                                                <span>{salon.areaName}, {salon.cityName}</span>
                                            </div>

                                            <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2 min-h-[32px]">
                                                {salon.address || 'Address updating...'}
                                            </p>

                                            {/* Dynamic Services Tag & Weekly Off */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {salon.homeServiceCharges ? (
                                                    <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full text-[9px] font-bold text-[#FF2A14]">
                                                        <Home className="w-2.5 h-2.5" />
                                                        <span>Home Service (₹{salon.homeServiceCharges})</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-bold text-gray-400">
                                                        <ShieldCheck className="w-2.5 h-2.5" />
                                                        <span>In-Salon Services</span>
                                                    </div>
                                                )}
                                                {salon.weeklyOffDay && (
                                                    <div className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full text-[9px] font-bold text-amber-700">
                                                        Off: {salon.weeklyOffDay}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Footer */}
                                            <div className="mt-5 pt-4 border-t border-gray-100/60 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <span className="text-[10px] font-black tracking-widest">
                                                        {salon.openingTime?.slice(0, 5)} - {salon.closingTime?.slice(0, 5)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#FF2A14] group-hover:gap-1.5 transition-all group/btn">
                                                    <span>Book Session</span>
                                                    <div className="h-6 w-6 rounded-full bg-[#FF2A14]/5 flex items-center justify-center text-[#FF2A14] group-hover/btn:bg-[#FF2A14] group-hover/btn:text-white transition-all duration-300">
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. FIXED STATS SECTION */}
            <section className="pt-16 pb-12 border-b">
                <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-4 px-6">
                    {[
                        { label: "REVIEWS", value: "1.14k", img: reviewIcon },
                        { label: "SALONS", value: "10k", img: salonIcon },
                        { label: "CITIES", value: "20k", img: citiesIcon },
                        { label: "APP DOWNLOAD", value: "20000+", img: appDownloadIcon }
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
            </section>

            {/* 4. RECOMMENDED SECTION */}
            <section className="pt-12 pb-6 px-6 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Recommended</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendedList.map((salon, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleRecommendedCardClick(salon)}
                            className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition cursor-pointer group"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <img src={salon.img} alt={salon.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    ⭐ {salon.rating}
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <h4 className="font-bold text-gray-800">{salon.name}</h4>
                                <p className="text-xs text-gray-500">{salon.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. SERVICES GRID */}
            <section className="pt-6 pb-12 px-6 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {servicesData.map((service) => (
                        <div 
                            key={service.name} 
                            onClick={() => handleServiceCardClick(service)}
                            className="relative h-64 rounded-2xl overflow-hidden group bg-gray-100 cursor-pointer"
                        >
                            <img src={service.img} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                            <div className="absolute bottom-6 left-6 text-white text-xl font-bold z-10">{service.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. GROWTH SECTIONS */}
            <section className="py-20 bg-[#F9FAFB]">
                <div className="max-w-7xl mx-auto px-6 space-y-28">
                    {/* Feature 1 - Manage Inventory & Staff */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left Container for Staff & Dashboard Composite Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={manageInventoryImg}
                                    alt="Manage Inventory & Staff"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Right Content Container matching layout and typography hierarchy */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                MANAGE INVENTORY & STAFF
                            </h2>

                            {/* Sub-heading with Red Accent on 'maximize' and 'profit.' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Control your stock. <br />
                                <span className="text-[#FF2A14]">maximize</span> your <span className="text-[#FF2A14]">profit.</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Never run out of essentials or overstock products again. Track usage, get
                                low-stock alerts, and manage everything from a single dashboard
                                whether it's shampoos, colors, or retail products.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Left-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-start">
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Real-Time Stock Tracking Across Services & Products</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Smart Low-Stock Alerts Before You Run Out</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Product Usage Insights Per Service</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Reduce Wastage & Increase Margins</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                MANAGE SMARTER →
                            </button>
                        </div>
                    </div>

                    {/* Feature 2 - Easy Appointments */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Right Container for Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={easyAppointmentImg}
                                    alt="Easy Appointments"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Left Content Container styled exactly to the right-aligned design layout */}
                        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                EASY APPOINTMENTS
                            </h2>

                            {/* Sub-heading with Red Accent on 'calendar,' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Fill your <span className="text-[#FF2A14]">calendar,</span> <br />
                                <span className="text-gray-400">not your waiting area</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Let your customers book instantly, anytime. No calls, no confusion just
                                smooth, automated scheduling that keeps your chairs occupied all day.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Right-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-end">
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Real-Time Stock Tracking Across Services & Products</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Smart Low-Stock Alerts Before You Run Out</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Product Usage Insights Per Service</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Reduce Wastage & Increase Margins</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                START BOOKING →
                            </button>
                        </div>
                    </div>

                    {/* Feature 3 - NeoParlour Lead Magnet */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left Container for Product Dashboard Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={leadMagnetImg}
                                    alt="NeoParlour Lead Magnet"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Right Content Container matching layout and typography hierarchy */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                NEOPARLOUR LEAD MAGNET
                            </h2>

                            {/* Sub-heading with Red Accent on 'paying clients' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Turn searches into <br />
                                <span className="text-[#FF2A14]">paying clients.</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Get discovered by people actively looking for salon services near them.
                                NeoParlour brings high-intent customers directly to your business.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Left-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-start">
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Appear In Local Search Results Instantly</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Get Verified Leads, Not Random Traffic</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Boost Visibility Without Extra Marketing Cost</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Convert Walk-Ins Into Loyal Customers</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                GET MORE CLIENTS →
                            </button>
                        </div>
                    </div>

                    {/* Feature 4 - AI Powered Features */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Right Container - Compare Slider with Floating Labels */}
                        <div className="flex-1 w-full">
                            <div className="relative">
                                {/* Compare Slider */}
                                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white h-[320px] md:h-[420px]">
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
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">AI Assistant</span>
                                </div>

                                {/* Top Right - Haircut Suggestions */}
                                <div className="hidden md:flex absolute top-4 -right-2 md:-right-6 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '3.5s' }}>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">Haircut Suggestions</span>
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
                                        <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase block">Beard</span>
                                        <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase block">Suggestions</span>
                                    </div>
                                </div>

                                {/* Middle Right - Chatbot */}
                                <div className="hidden md:flex absolute top-[40%] -right-2 md:-right-8 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '3.2s' }}>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">Chatbot</span>
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Bottom Right - WhatsApp Booking */}
                                <div className="hidden md:flex absolute bottom-8 -right-2 md:-right-6 items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-pulse" style={{ animationDuration: '2.5s' }}>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">WhatsApp Booking</span>
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
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">AI Assistant</span>
                                </div>

                                {/* Haircut Suggestions */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase font-sans">Haircut Suggests</span>
                                </div>

                                {/* Beard Suggestions */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">Beard Suggests</span>
                                </div>

                                {/* Chatbot */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">AI Chatbot</span>
                                </div>

                                {/* WhatsApp Booking */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">WhatsApp Book</span>
                                </div>

                                {/* Style Matcher */}
                                <div className="flex items-center gap-2.5 bg-white/95 px-3 py-2.5 rounded-xl shadow-sm border border-gray-100">
                                    <div className="w-6 h-6 bg-[#FF2A14] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">Style Matcher</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Container styled exactly to the design layout */}
                        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right w-full">
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
                <h2 className="text-center text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Frequently Asked Questions</h2>
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
                <h2 className="text-center text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Testimonials</h2>
                <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="min-w-[300px] bg-gray-50 p-8 rounded-2xl snap-start">
                            <div className="text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
                            <h4 className="font-black text-lg mb-4 italic">The Best Booking System</h4>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                Great Experience, Easy To Book, Paying For Treatments Is So Convenient - No Cash Or Cards Needed!
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                                <div>
                                    <div className="font-bold">Avishkar</div>
                                    <div className="text-[10px] text-gray-400">Pune, Maharashtra</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 11. FOOTER */}
            {/* 11. FOOTER */}
            <footer className="bg-[#EAEAEA] text-gray-900 pt-16 pb-8 px-6 md:px-12 font-sans w-full mt-auto">
                {/* Main Footer Container */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 items-start">

                    {/* Identity Column */}
                    <div className="md:col-span-4 flex items-center space-x-2.5">
                        <img
                            src={footerLogoIcon}
                            alt="NeoParlour Logo"
                            className="w-8 h-8 object-contain flex-shrink-0"
                        />
                        <span className="text-xl font-black text-gray-900 tracking-tight">
                            NeoParlour
                        </span>
                    </div>

                    {/* Column 1: Company Info */}
                    <div className="md:col-span-2">
                        <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Company</h4>
                        <ul className="space-y-3 text-sm font-semibold text-gray-700">
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Influencer Program</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">
                                • Careers
                            </li>
                            <li onClick={() => setCurrentView('about')} className="cursor-pointer hover:text-gray-900 transition-colors">
                                • About Us
                            </li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Partner With Us</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Buy Gift Card</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Blogs</li>
                        </ul>
                    </div>

                    {/* Column 2: Legal */}
                    <div className="md:col-span-2">
                        <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Legal</h4>
                        <ul className="space-y-3 text-sm font-semibold text-gray-700">
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Privacy Policy</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Terms Of Service</li>
                        </ul>
                    </div>

                    {/* Column 3: Contact/Socials Links */}
                    <div className="md:col-span-2">
                        <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Contact</h4>
                        <ul className="space-y-3 text-sm font-semibold text-gray-700">
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Whatsapp</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Emails</li>
                        </ul>
                    </div>

                    {/* App Download Store Badges */}
                    <div className="md:col-span-2 flex flex-col gap-3 w-full sm:max-w-48 justify-self-start md:justify-self-end">
                        {/* App Store */}
                        <a href="#" className="bg-black hover:bg-neutral-900 text-white rounded-xl py-2 px-4 flex items-center gap-3 shadow transition">
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400">Get it on</span>
                                <span className="text-sm font-bold tracking-tight">App Store</span>
                            </div>
                        </a>

                        {/* Google Play */}
                        <a href="#" className="bg-[#FF190D] hover:bg-red-700 text-white rounded-xl py-2 px-4 flex items-center gap-3 shadow transition">
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.25 3.062c-.156.172-.25.438-.25.781v16.313c0 .344.094.609.25.781l.063.063 9.125-9.125v-.125L5.313 3l-.063.063zM16.656 14.5l3.188-1.813c.906-.516.906-1.359 0-1.875L16.656 9.5l-2.188 2.188v.125l2.188 2.188zM14.469 11.812L5.438 3.125c-.141-.125-.344-.141-.531-.047l9.563 9.563v-.828zM14.469 12.188l-9.563 9.563c.188.094.391.078.531-.047l9.031-8.688v-.828z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-red-200">Get it on</span>
                                <span className="text-sm font-bold tracking-tight">Google Play</span>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Bottom Sub-Footer Separator */}
                <hr className="border-gray-400/60 my-8 max-w-7xl mx-auto" />

                {/* Copyright and Social Media Icons */}
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        copyright@neopaceinfotech.com
                    </span>

                    <div className="flex items-center gap-4">
                        {/* Instagram */}
                        <a href="#" className="p-1 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white hover:opacity-90 transition shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="#" className="text-[#1877F2] hover:opacity-80 transition">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>

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
        </div>
    );
};

export default HomeScreen;