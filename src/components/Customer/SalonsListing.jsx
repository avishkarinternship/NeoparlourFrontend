import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { switchTenant, fetchCustomerProfile, searchSalonsByLocation } from '../../redux/slices/customerSlice';
import searchService from '../../services/searchService';
import toast from 'react-hot-toast';
import { Navigation, Sparkles } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';

import searchIcon from '../../assets/Customer/HomeScreen/MainScreen/search_icon.svg';
import locationIcon from '../../assets/Customer/HomeScreen/MainScreen/location_icon.svg';
import dropdownIcon from '../../assets/Customer/HomeScreen/MainScreen/dropdown_icon.svg';

import logoIcon from '../../assets/Neoparlour_logo.png';
import salonOneIcon from '../../assets/Customer/HomeScreen/Recommended/salon_one.jpg';
import salonTwoIcon from '../../assets/Customer/HomeScreen/Recommended/salon_two.jpg';
import salonThreeIcon from '../../assets/Customer/HomeScreen/Recommended/salon_three.jpg';
import salonFourIcon from '../../assets/Customer/HomeScreen/Recommended/salon_four.jpg';
import SEOFooter from '../common/SEOFooter';

const ITEMS_PER_PAGE = 10;

const staticSalons = [
    { id: 1001, name: "Enrich Salon", areaName: "Mukund Nagar", cityName: "Pune", img: salonOneIcon, rating: "4.6", openingTime: "09:00", closingTime: "21:00", gstNumber: "27AAAAA1111A1Z1" },
    { id: 1002, name: "Habibs Salon", areaName: "Kothrud", cityName: "Pune", img: salonTwoIcon, rating: "4.8", openingTime: "10:00", closingTime: "22:00", gstNumber: "27BBBBB2222B2Z2" },
    { id: 1003, name: "Bodycraft", areaName: "Viman Nagar", cityName: "Pune", img: salonThreeIcon, rating: "4.5", openingTime: "09:30", closingTime: "20:30", gstNumber: "27CCCCC3333C3Z3" },
    { id: 1004, name: "Lakme Salon", areaName: "Aundh", cityName: "Pune", img: salonFourIcon, rating: "4.7", openingTime: "10:00", closingTime: "21:00", gstNumber: "27DDDDD4444D4Z4" },
];

const SalonsListing = () => {
    const { t } = useTranslation();
    const { isDark } = useDarkMode();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { token, user, isAuthenticated, profile } = useSelector((state) => state.customer);

    const isFromProducts = location.state?.purpose === 'products';

    // Search state
    const [cityName, setCityName] = useState(localStorage.getItem('customerCity') || '');
    const [areaName, setAreaName] = useState(localStorage.getItem('customerArea') || '');
    const [category, setCategory] = useState(location.state?.selectedCategory || location.state?.category || '');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [areaSuggestions, setAreaSuggestions] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const cityDropdownRef = useRef(null);
    const areaDropdownRef = useRef(null);
    const isUserTypingCityRef = useRef(false);
    const isUserTypingAreaRef = useRef(false);

    // Salon data state
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchedCity, setSearchedCity] = useState('');
    const [switchingId, setSwitchingId] = useState(null);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [favouriteIds, setFavouriteIds] = useState(new Set());

    const isShowingStatic = salons.length === 0;
    const displaySalons = isShowingStatic ? staticSalons : salons;

    // Fetch profile if needed
    useEffect(() => {
        if (isAuthenticated && user && !profile) {
            const customerId = user.id || user.user?.id;
            if (customerId) {
                dispatch(fetchCustomerProfile(customerId));
            }
        }
    }, [isAuthenticated, user, profile, dispatch]);

    // Fetch favourites on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const fetchFavourites = async () => {
                try {
                    const res = await axiosInstance.get('/customer/favourites');
                    const ids = new Set((res.data || []).map(fav => fav.salonId));
                    setFavouriteIds(ids);
                } catch (err) {
                    console.error("Failed to fetch favourites:", err);
                }
            };
            fetchFavourites();
        } else {
            setFavouriteIds(new Set());
        }
    }, [isAuthenticated]);

    const handleToggleFavourite = async (salonId, salonName, e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error("Please login to add to favourites", {
                style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
            });
            navigate('/customer/login');
            return;
        }

        const isFav = favouriteIds.has(salonId);
        const newFavs = new Set(favouriteIds);
        if (isFav) {
            newFavs.delete(salonId);
        } else {
            newFavs.add(salonId);
        }
        setFavouriteIds(newFavs); // Optimistic UI update

        try {
            if (isFav) {
                await axiosInstance.delete(`/customer/favourites/${salonId}`);
                toast.success(`Removed ${salonName} from favourites`, {
                    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
                });
            } else {
                await axiosInstance.post(`/customer/favourites/${salonId}`);
                toast.success(`Added ${salonName} to favourites`, {
                    style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
                });
            }
        } catch (err) {
            console.error("Failed to toggle favourite:", err);
            // Revert optimistic update
            const revertFavs = new Set(favouriteIds);
            setFavouriteIds(revertFavs);
            toast.error(err.response?.data?.message || "Failed to update favourites", {
                style: { background: '#1a1a1a', color: '#fff', borderRadius: '16px', padding: '20px 24px' }
            });
        }
    };

    // Click outside dropdowns
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

    // City autocomplete debouncing
    useEffect(() => {
        if (!isUserTypingCityRef.current) return;
        if (!cityName || cityName.trim().length < 2) {
            setCitySuggestions([]);
            return;
        }
        setIsLoadingCities(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchExternalLocations(cityName, 'city');
                setCitySuggestions(results);
            } catch (err) {
                console.error('City Search Error:', err);
            } finally {
                setIsLoadingCities(false);
            }
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [cityName]);

    // Area autocomplete debouncing (scoped by city)
    useEffect(() => {
        if (!isUserTypingAreaRef.current) return;
        if (!areaName || areaName.trim().length < 2) {
            setAreaSuggestions([]);
            return;
        }
        setIsLoadingAreas(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchExternalLocations(areaName, 'area', cityName);
                setAreaSuggestions(results);
            } catch (err) {
                console.error('Area Search Error:', err);
            } finally {
                setIsLoadingAreas(false);
            }
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [areaName]);

    // Fetch salons by city and area
    const fetchSalons = async (city, area = '', pageNum = 0, cat = '') => {
        if (!city || city.trim().length === 0) return;
        setLoading(true);
        try {
            const results = await dispatch(
                searchSalonsByLocation({
                    cityName: city.trim(),
                    areaName: area ? area.trim() : '',
                    category: cat ? cat.trim() : undefined
                })
            ).unwrap();
            setSalons(results || []);
            setTotalPages(1);
            setTotalElements(results ? results.length : 0);
            setPage(0);
            setSearchedCity(city);
        } catch (err) {
            console.error('Error fetching salons:', err);
            setSalons([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // Auto-detect location on mount or read from localStorage
    useEffect(() => {
        const storedCity = localStorage.getItem('customerCity');
        const storedArea = localStorage.getItem('customerArea') || '';
        const initialCategory = location.state?.selectedCategory || location.state?.category || '';
        
        if (storedCity) {
            isUserTypingCityRef.current = false;
            setCityName(storedCity);
            if (storedArea) {
                isUserTypingAreaRef.current = false;
                setAreaName(storedArea);
            }
            fetchSalons(storedCity, storedArea, 0, initialCategory);
        } else if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const geo = await searchService.reverseGeocode(latitude, longitude);
                        if (geo.city) {
                            localStorage.setItem('customerCity', geo.city);
                            if (geo.area) {
                                localStorage.setItem('customerArea', geo.area);
                            }
                            isUserTypingCityRef.current = false;
                            setCityName(geo.city);
                            if (geo.area) {
                                isUserTypingAreaRef.current = false;
                                setAreaName(geo.area);
                            }
                            fetchSalons(geo.city, geo.area || '', 0, initialCategory);
                        }
                    } catch (err) {
                        console.error('Geolocation error:', err);
                    }
                },
                () => {
                    // Permission denied - do nothing, user can search manually
                },
                { enableHighAccuracy: false, timeout: 8000 }
            );
        }
    }, []);

    const handleSearch = () => {
        if (!cityName.trim()) {
            toast.error('Please enter a city name');
            return;
        }
        localStorage.setItem('customerCity', cityName.trim());
        localStorage.setItem('customerArea', areaName.trim());
        setPage(0);
        fetchSalons(cityName.trim(), areaName.trim(), 0, category);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= totalPages) return;
        fetchSalons(searchedCity, areaName, newPage, category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                        isUserTypingCityRef.current = false;
                        isUserTypingAreaRef.current = false;
                        setCityName(result.city);
                        setAreaName(result.area || '');
                        localStorage.setItem('customerCity', result.city);
                        localStorage.setItem('customerArea', result.area || '');
                        
                        // Immediately fetch salons
                        fetchSalons(result.city, result.area || '', 0, category);
                        toast.success(`Location detected: ${result.city}${result.area ? `, ${result.area}` : ''}`);
                    } else {
                        toast.error("Could not determine your city. Please enter it manually.");
                    }
                } catch (error) {
                    toast.error("Could not determine your city. Please enter it manually.");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                toast.error("Location permission denied. Please enter it manually.");
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: false, timeout: 8000 }
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

    const handleSalonClick = (salon) => {
        if (isShowingStatic) {
            if ('geolocation' in navigator) {
                toast.loading('Detecting location to find real salons...', { id: 'geo-detect' });
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        toast.dismiss('geo-detect');
                        try {
                            const { latitude, longitude } = position.coords;
                            const geo = await searchService.reverseGeocode(latitude, longitude);
                            if (geo.city) {
                                localStorage.setItem('customerCity', geo.city);
                                if (geo.area) {
                                    localStorage.setItem('customerArea', geo.area);
                                }
                                isUserTypingCityRef.current = false;
                                setCityName(geo.city);
                                if (geo.area) {
                                    isUserTypingAreaRef.current = false;
                                    setAreaName(geo.area);
                                }
                                fetchSalons(geo.city, geo.area || '', 0, category);
                                toast.success(`Location detected: ${geo.city}`);
                            }
                        } catch (err) {
                            toast.error('Could not detect location. Please search manually using the search bar.');
                        }
                    },
                    () => {
                        toast.dismiss('geo-detect');
                        toast.error('Location permission denied. Please enter a city manually.');
                    },
                    { enableHighAccuracy: false, timeout: 8000 }
                );
            } else {
                toast.error('Please enter a city manually in the search bar.');
            }
            return;
        }
        const salonId = salon.salonId || salon.id;
        const salonName = salon.salonName || salon.name || 'Selected Salon';
        localStorage.setItem('activeSalonId', salonId);
        localStorage.setItem('activeSalonName', salonName);

        const hasCategory = !!category;
        const targetPath = isFromProducts 
            ? '/customer/product-search' 
            : (hasCategory ? '/book-service' : '/salon');
        const navState = (hasCategory && !isFromProducts) 
            ? { state: { selectedCategory: category } } 
            : undefined;

        if (!token) {
            navigate(targetPath, navState);
            return;
        }
        setSwitchingId(salonId);
        const payload = {
            token: token,
            salonId: salonId,
            salonName: salonName
        };
        dispatch(switchTenant(payload))
            .unwrap()
            .then(() => {
                toast.success(`Switched to ${salonName}`);
                navigate(targetPath, navState);
            })
            .catch((err) => {
                const errMsg = String(err).toLowerCase();
                if (errMsg.includes('token') || errMsg.includes('login') || errMsg.includes('unauthorized')) {
                    toast.error('Session expired. Please login again.');
                    navigate('/customer/login');
                }
            })
            .finally(() => {
                setSwitchingId(null);
            });
    };

    const getSalonRating = (salon) => {
        if (salon.rating != null) return parseFloat(salon.rating).toFixed(1);
        return null;
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(0, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible);
        if (end - start < maxVisible) {
            start = Math.max(0, end - maxVisible);
        }
        for (let i = start; i < end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
            {/* Hero Search Section */}
            <section className="relative z-35 overflow-visible">
                {/* Background decorative elements */}
                <div className={`absolute inset-0 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gradient-to-br from-[#FFF5F4] via-white to-[#FFF0EE]'}`} />
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? 'bg-[#FF2A14]/2' : 'bg-[#FF2A14]/5'}`} />
                <div className={`absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 transition-colors duration-300 ${isDark ? 'bg-[#FF2A14]/1' : 'bg-[#FF2A14]/3'}`} />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
                    {/* Page Title */}
                    <div className="text-center mb-10">
                        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {isFromProducts ? (
                                <>{t('salons_page.select_salon_products', 'Select a Salon to Browse Products')}</>
                            ) : (
                                <>{t('salons_page.page_title', 'Discover Salons Near You')}</>
                            )}
                        </h1>
                        <p className={`text-sm sm:text-base max-w-xl mx-auto font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isFromProducts ? (
                                t('salons_page.select_partner_desc', 'Select one of our partner salons below to view their premium beauty formulations and place orders.')
                            ) : (
                                t('salons_page.find_best_desc', 'Find and book the best salons in your city. Premium experiences, trusted professionals.')
                            )}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-4xl mx-auto">
                        <div className={`p-2.5 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] flex flex-col md:flex-row items-center gap-2 border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            {/* City Input */}
                            <div className={`relative flex items-center gap-3 px-4 py-2 w-full md:border-r transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`} ref={cityDropdownRef}>
                                <img src={searchIcon} alt="Search" className="w-5 h-5 object-contain flex-shrink-0" />
                                <input
                                    id="salon-city-search"
                                    type="text"
                                    placeholder={isDetectingLocation ? t('salons_page.detecting', 'DETECTING...') : t('salons_page.city_placeholder', 'Search city...')}
                                    value={cityName}
                                    onChange={(e) => {
                                        isUserTypingCityRef.current = true;
                                        setCityName(e.target.value);
                                        setShowCityDropdown(true);
                                    }}
                                    onFocus={() => setShowCityDropdown(true)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                    className={`w-full outline-none text-sm font-medium bg-transparent text-left transition-colors duration-300 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                                />
                                {cityName && (
                                    <button onClick={() => { setCityName(''); setCitySuggestions([]); }} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
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
                                {showCityDropdown && cityName && (
                                    <div className={`absolute left-0 top-full z-50 w-full mt-2 border rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                        {isLoadingCities ? (
                                            <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                                <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                                Locating...
                                            </div>
                                        ) : citySuggestions.length > 0 ? (
                                            citySuggestions.map((city, idx) => (
                                                <div key={idx} onClick={() => {
                                                    isUserTypingCityRef.current = false;
                                                    isUserTypingAreaRef.current = false;
                                                    setCityName(city.name);
                                                    setAreaName('');
                                                    setShowCityDropdown(false);
                                                }} className={`px-6 py-3 rounded-lg hover:bg-[#FF2A14]/5 hover:text-[#FF2A14] cursor-pointer transition-all font-bold text-sm text-left ${isDark ? 'text-gray-250' : 'text-gray-700'}`}>{city.name}</div>
                                            ))
                                        ) : (
                                            <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No cities found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Area Input */}
                            <div className={`relative flex items-center justify-between px-4 py-2 w-full md:border-r gap-2 transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`} ref={areaDropdownRef}>
                                <div className="flex items-center gap-3 w-full">
                                    <img src={locationIcon} alt="Location" className="w-5 h-5 object-contain flex-shrink-0" />
                                    <input
                                        id="salon-area-search"
                                        type="text"
                                        placeholder="Search area (optional)..."
                                        value={areaName}
                                        onChange={(e) => {
                                            isUserTypingAreaRef.current = true;
                                            setAreaName(e.target.value);
                                            setShowAreaDropdown(true);
                                        }}
                                        onFocus={() => setShowAreaDropdown(true)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                        className={`w-full outline-none text-sm font-medium bg-transparent text-left transition-colors duration-300 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                                    />
                                    {areaName && (
                                        <button onClick={() => { setAreaName(''); setAreaSuggestions([]); }} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60 flex-shrink-0 animate-pulse hover:scale-110 transition-transform" onClick={() => setShowAreaDropdown(!showAreaDropdown)} />
                                {showAreaDropdown && areaName && (
                                    <div className={`absolute left-0 top-full z-50 w-full mt-2 border rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                        {isLoadingAreas ? (
                                            <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                                                <div className="h-4 w-4 border-2 border-[#FF2A14]/10 border-t-[#FF2A14] rounded-full animate-spin" />
                                                Locating...
                                            </div>
                                        ) : areaSuggestions.length > 0 ? (
                                            areaSuggestions.map((area, idx) => (
                                                <div key={idx} onClick={() => {
                                                    isUserTypingCityRef.current = false;
                                                    isUserTypingAreaRef.current = false;
                                                    setAreaName(area.name);
                                                    setShowAreaDropdown(false);
                                                }} className={`px-6 py-3 rounded-lg hover:bg-[#FF2A14]/5 hover:text-[#FF2A14] cursor-pointer transition-all font-bold text-sm text-left ${isDark ? 'text-gray-250' : 'text-gray-700'}`}>
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
                            <div className={`relative flex items-center justify-between px-4 py-2 w-full md:border-r gap-2 transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3 w-full">
                                    <Sparkles className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            const newCat = e.target.value;
                                            setCategory(newCat);
                                            if (cityName.trim()) {
                                                setPage(0);
                                                fetchSalons(cityName.trim(), areaName.trim(), 0, newCat);
                                            }
                                        }}
                                        className={`w-full outline-none text-sm font-medium bg-transparent cursor-pointer appearance-none text-left transition-colors duration-300 ${isDark ? 'text-white [&>option]:bg-gray-900 [&>option]:text-white' : 'text-gray-700 [&>option]:bg-white [&>option]:text-gray-700'}`}
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
                                <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60 pointer-events-none" />
                            </div>

                            {/* Search Button */}
                            <button
                                id="salon-search-btn"
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full md:w-auto bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-3.5 rounded-xl font-bold text-sm tracking-widest shadow-md hover:shadow-lg transition-all duration-150 flex-shrink-0"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Results Header */}
                {!isShowingStatic && searchedCity && !loading && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 mt-2">
                        <div>
                            <h2 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Salons in <span className="text-[#FF2A14]">{searchedCity}</span>
                            </h2>
                            <p className="text-sm text-gray-400 font-medium mt-0.5">
                                {totalElements} salon{totalElements !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        {totalPages > 1 && (
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto transition-colors duration-300 ${isDark ? 'text-gray-300 bg-gray-900' : 'text-gray-400 bg-gray-100'}`}>
                                Page {page + 1} of {totalPages}
                            </span>
                        )}
                    </div>
                )}

                {isShowingStatic && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 mt-2">
                        <div>
                            <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Recommended <span className="text-[#FF2A14]">Salons</span>
                                {loading && <div className="w-4 h-4 border-2 border-[#FF2A14] border-t-transparent rounded-full animate-spin" />}
                            </h2>
                            <p className="text-sm text-gray-400 font-medium mt-0.5">
                                {loading ? 'Detecting location and fetching salons...' : 'Showing curated suggestions near you'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Salon Cards Grid */}
                {(salons.length > 0 || isShowingStatic || loading) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {loading && !switchingId ? (
                            Array.from({ length: 8 }).map((_, idx) => (
                                <div key={idx} className={`rounded-[32px] border p-6 space-y-4 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className="h-44 rounded-2xl yt-skeleton" />
                                    <div className="space-y-3">
                                        <div className="h-4 rounded w-1/4 yt-skeleton" />
                                        <div className="h-6 rounded w-3/4 yt-skeleton" />
                                        <div className="h-4 rounded w-1/2 yt-skeleton" />
                                        <div className="h-3 rounded w-2/3 yt-skeleton" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            displaySalons.map((salon, index) => {
                            const salonId = salon.salonId || salon.id;
                            const hasImage = !!salon.imageUrl || !!salon.img;
                            const coverImg = salon.img || (hasImage ? getSalonImageSrc(salon.imageUrl, null) : null);
                            const rating = getSalonRating(salon, index);
                            const isSwitching = switchingId === salonId;
                            const isOpen = (() => {
                                if (!salon.openingTime || !salon.closingTime) return true;
                                const now = new Date();
                                const [openH, openM] = salon.openingTime.split(':').map(Number);
                                const [closeH, closeM] = salon.closingTime.split(':').map(Number);
                                const currentTime = now.getHours() * 60 + now.getMinutes();
                                return currentTime >= openH * 60 + openM && currentTime <= closeH * 60 + closeM;
                            })();

                            const reviewsCount = (((salon.salonId || salon.id || 0) * 17) % 80) + 40;

                            return (
                                <div
                                    key={salonId || index}
                                    onClick={() => !isSwitching && handleSalonClick(salon)}
                                    className={`rounded-[32px] overflow-hidden border hover:border-[#FF2A14]/30 hover:shadow-[0_24px_50px_-15px_rgba(255,42,20,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative flex flex-col ${
                                        isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
                                    } ${
                                        isSwitching ? 'opacity-70 pointer-events-none' : ''
                                    } ${loading && isShowingStatic ? 'opacity-65 pointer-events-none animate-pulse' : ''}`}
                                >
                                    {/* Switching overlay */}
                                    {isSwitching && (
                                        <div className={`absolute inset-0 backdrop-blur-xs z-10 flex items-center justify-center rounded-[32px] ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-[#FF2A14] border-t-transparent rounded-full animate-spin" />
                                                <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Switching...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Section */}
                                    <div className={`h-44 relative overflow-hidden flex-shrink-0 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
                                        {hasImage ? (
                                            <>
                                                <img
                                                    src={coverImg}
                                                    alt={salon.salonName || salon.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F9FAFB] py-6">
                                                <svg className="w-14 h-14 text-rose-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <circle cx="9" cy="17" r="3.5" />
                                                    <circle cx="15" cy="17" r="3.5" />
                                                    <path d="M11.5 14.5L16 5.5" strokeLinecap="round" />
                                                    <path d="M12.5 14.5L8 5.5" strokeLinecap="round" />
                                                    <circle cx="12" cy="11.5" r="0.75" fill="currentColor" />
                                                </svg>
                                                <span className="text-[11px] font-semibold text-gray-400">No image available</span>
                                            </div>
                                        )}

                                        {/* Top Badges */}
                                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                                            {/* Open/Closed Badge */}
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border transition-colors duration-300 ${
                                                isOpen
                                                    ? isDark ? 'bg-gray-900/95 border-emerald-500/30 text-emerald-400' : 'bg-white/95 border-emerald-500/20 text-emerald-700'
                                                    : isDark ? 'bg-gray-900/95 border-rose-500/30 text-rose-400' : 'bg-white/95 border-rose-500/20 text-rose-700'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                {isOpen ? 'Open' : 'Closed'}
                                            </div>

                                            {/* Rating Badge */}
                                            {rating != null ? (
                                                <div className={`backdrop-blur-md border rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors duration-300 ${
                                                    isDark
                                                        ? 'bg-gray-900/95 border-amber-500/30 text-amber-400'
                                                        : 'bg-white/95 border-amber-500/20 text-amber-600'
                                                }`}>
                                                    <svg className="w-3.5 h-3.5 fill-amber-500 text-amber-500" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span>{rating} ({reviewsCount}+)</span>
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-600 text-white rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                                    NEW
                                                </div>
                                            )}
                                        </div>

                                        {/* Floating Heart Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleFavourite(salonId, salon.salonName || salon.name, e)}
                                            className={`absolute bottom-3 right-3 w-8 h-8 rounded-full backdrop-blur-xs shadow-md border flex items-center justify-center text-[#ff0b01] hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 transition-colors duration-300 ${
                                                isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-150'
                                            }`}
                                            title={favouriteIds.has(salonId) ? "Remove from Favourites" : "Mark as Favourite"}
                                        >
                                            <svg className={`w-4 h-4 ${favouriteIds.has(salonId) ? 'fill-[#ff0b01]' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Avatar Logo Overlay */}
                                    <div className={`relative -mt-8 ml-6 z-20 w-16 h-16 rounded-2xl overflow-hidden border-[3px] shadow-xl group-hover:scale-105 transition-transform duration-300 flex-shrink-0 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-900' : 'bg-white border-white'}`}>
                                        {salon.imageBase64 ? (
                                            <img src={`data:image/png;base64,${salon.imageBase64}`} alt={salon.salonName || salon.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#FF2A14] to-[#FF6B57] text-white text-2xl font-black">
                                                {(salon.salonName || salon.name || 'S')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6 pt-3 flex flex-col flex-grow text-left">
                                        <span className="text-[9px] font-black tracking-[0.2em] text-[#FF2A14] uppercase mb-1.5 flex items-center gap-1">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"/>
                                            </svg>
                                            NEOPARLOUR PARTNER
                                        </span>

                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className={`text-xl font-bold group-hover:text-[#FF2A14] transition-colors leading-snug uppercase tracking-tight flex-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {salon.salonName || salon.name}
                                            </h4>
                                            {(salon.salonCode || salon.gstNumber) && (
                                                <span className={`text-[9px] font-bold border px-2 py-0.5 rounded uppercase tracking-widest flex-shrink-0 mt-1 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-400 border-gray-800' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                    {salon.salonCode || '02FBD8E7'}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 transition-colors duration-300 ${isDark ? 'text-gray-250' : 'text-gray-700'}`}>
                                            <svg className="w-3.5 h-3.5 text-[#FF2A14] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{salon.areaName || 'Kothrud'}, {salon.cityName || 'Pune'}</span>
                                        </div>

                                        <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-1 ml-5 mb-4">
                                            {salon.address || 'Dhankawadi'}
                                        </p>

                                        {/* Home Service Badge */}
                                        {salon.homeServiceCharges ? (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#FF2A14] w-fit mb-4 border transition-colors duration-300 ${
                                                isDark ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'
                                            }`}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span>Home Service (₹{salon.homeServiceCharges})</span>
                                            </div>
                                        ) : (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#FF2A14] w-fit mb-4 border transition-colors duration-300 ${
                                                isDark ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'
                                            }`}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span>Home Service (₹50)</span>
                                            </div>
                                        )}

                                        {/* Card Footer */}
                                        <div className={`mt-auto pt-4 border-t flex items-center justify-between transition-colors duration-300 ${isDark ? 'border-gray-800' : 'border-gray-100/60'}`}>
                                            <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[11px] font-black tracking-widest">
                                                    {salon.openingTime?.slice(0, 5) || '09:00'} - {salon.closingTime?.slice(0, 5) || '21:00'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#FF2A14] group-hover:gap-1.5 transition-all group/btn">
                                                <span>Book Session</span>
                                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[#FF2A14] group-hover/btn:bg-[#FF2A14] group-hover/btn:text-white transition-all duration-300 ${isDark ? 'bg-gray-850' : 'bg-red-50'}`}>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) ) }
                    </div>
                )}

                {/* Empty State */}
                {!loading && salons.length === 0 && searchedCity && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}>No salons found</h3>
                        <p className="text-sm text-gray-400 max-w-sm font-medium">
                            We couldn't find any salons in <span className="text-[#FF2A14] font-semibold">{searchedCity}</span>. Try searching for a different city.
                        </p>
                    </div>
                )}

                {/* Initial State (no search yet) */}
                {/* Handled by recommended static salons above */}

                {/* Pagination */}
                {!isShowingStatic && !loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {/* Previous */}
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                page === 0
                                    ? isDark ? 'bg-gray-900 text-gray-650 cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : isDark ? 'bg-gray-900 text-gray-200 border border-gray-800 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-md shadow-sm active:scale-[0.97]' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-md shadow-sm active:scale-[0.97]'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                                        p === page
                                            ? 'bg-gradient-to-r from-[#FF2A14] to-[#FF4D3A] text-white shadow-md shadow-[#FF2A14]/20'
                                            : isDark ? 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-sm'
                                    }`}
                                >
                                    {p + 1}
                                </button>
                            ))}
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                page >= totalPages - 1
                                    ? isDark ? 'bg-gray-900 text-gray-650 cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : isDark ? 'bg-gray-900 text-gray-200 border border-gray-800 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-md shadow-sm active:scale-[0.97]' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-md shadow-sm active:scale-[0.97]'
                            }`}
                        >
                            <span className="hidden sm:inline">Next</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </section>
            <SEOFooter  />
        </div>
    );
};

export default SalonsListing;
