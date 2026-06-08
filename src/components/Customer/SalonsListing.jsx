import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { switchTenant, fetchCustomerProfile } from '../../redux/slices/customerSlice';
import searchService from '../../services/searchService';
import toast from 'react-hot-toast';

import NavBar from './Layouts/NavBar';
import Footer from './Layouts/Footer';

import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import salonOneIcon from '../../assets/Customer/HomeScreen/Recommended/salon_one.jpg';
import salonTwoIcon from '../../assets/Customer/HomeScreen/Recommended/salon_two.jpg';
import salonThreeIcon from '../../assets/Customer/HomeScreen/Recommended/salon_three.jpg';
import salonFourIcon from '../../assets/Customer/HomeScreen/Recommended/salon_four.jpg';

const ITEMS_PER_PAGE = 10;

const staticSalons = [
    { id: 1001, name: "Enrich Salon", areaName: "Mukund Nagar", cityName: "Pune", img: salonOneIcon, rating: "4.6", openingTime: "09:00", closingTime: "21:00", gstNumber: "27AAAAA1111A1Z1" },
    { id: 1002, name: "Habibs Salon", areaName: "Kothrud", cityName: "Pune", img: salonTwoIcon, rating: "4.8", openingTime: "10:00", closingTime: "22:00", gstNumber: "27BBBBB2222B2Z2" },
    { id: 1003, name: "Bodycraft", areaName: "Viman Nagar", cityName: "Pune", img: salonThreeIcon, rating: "4.5", openingTime: "09:30", closingTime: "20:30", gstNumber: "27CCCCC3333C3Z3" },
    { id: 1004, name: "Lakme Salon", areaName: "Aundh", cityName: "Pune", img: salonFourIcon, rating: "4.7", openingTime: "10:00", closingTime: "21:00", gstNumber: "27DDDDD4444D4Z4" },
];

const SalonsListing = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, user, isAuthenticated, profile } = useSelector((state) => state.customer);

    // Search state
    const [cityName, setCityName] = useState('');
    const [areaName, setAreaName] = useState('');
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

    // Fetch salons by city (paginated)
    const fetchSalons = async (city, pageNum = 0) => {
        if (!city || city.trim().length === 0) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get('/salons/by-city', {
                params: {
                    cityName: city,
                    page: pageNum,
                    limit: ITEMS_PER_PAGE
                }
            });
            const data = response.data;
            setSalons(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setPage(pageNum);
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

    // Auto-detect location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const geo = await searchService.reverseGeocode(latitude, longitude);
                        if (geo.city) {
                            isUserTypingCityRef.current = false;
                            setCityName(geo.city);
                            if (geo.area) {
                                isUserTypingAreaRef.current = false;
                                setAreaName(geo.area);
                            }
                            fetchSalons(geo.city, 0);
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
        setPage(0);
        fetchSalons(cityName.trim(), 0);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= totalPages) return;
        fetchSalons(searchedCity, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                                isUserTypingCityRef.current = false;
                                setCityName(geo.city);
                                if (geo.area) {
                                    isUserTypingAreaRef.current = false;
                                    setAreaName(geo.area);
                                }
                                fetchSalons(geo.city, 0);
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
        localStorage.setItem('activeSalonId', salonId);

        if (!token) {
            navigate('/customer/salon');
            return;
        }
        setSwitchingId(salonId);
        const payload = {
            token: token,
            salonId: salonId,
            salonName: salon.salonName || salon.name
        };
        dispatch(switchTenant(payload))
            .unwrap()
            .then(() => {
                toast.success(`Switched to ${salon.salonName || salon.name}`);
                navigate('/customer/salon');
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

    const getSalonRating = (salon, index) => {
        if (salon.rating) return parseFloat(salon.rating).toFixed(1);
        const ratings = [4.5, 4.8, 4.3, 4.6, 4.7, 4.4, 4.9, 4.2, 4.1, 4.0];
        return ratings[(salon.salonId || salon.id || index) % ratings.length];
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans">
            <NavBar />

            {/* Hero Search Section */}
            <section className="relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F4] via-white to-[#FFF0EE]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2A14]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF2A14]/3 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
                    {/* Page Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-3">
                            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A14] to-[#FF6B5A]">Salons</span> Near You
                        </h1>
                        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto font-medium">
                            Find and book the best salons in your city. Premium experiences, trusted professionals.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* City Input */}
                                <div ref={cityDropdownRef} className="relative flex-1">
                                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-[#FF2A14]/30 focus-within:bg-white focus-within:shadow-sm transition-all">
                                        <svg className="w-[18px] h-[18px] text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input
                                            id="salon-city-search"
                                            type="text"
                                            placeholder="Search city..."
                                            value={cityName}
                                            onChange={(e) => {
                                                isUserTypingCityRef.current = true;
                                                setCityName(e.target.value);
                                                setShowCityDropdown(true);
                                            }}
                                            onFocus={() => { if (citySuggestions.length > 0) setShowCityDropdown(true); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                            className="flex-1 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 outline-none w-full"
                                        />
                                        {cityName && (
                                            <button onClick={() => { setCityName(''); setCitySuggestions([]); }} className="text-gray-300 hover:text-gray-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* City Dropdown */}
                                    {showCityDropdown && (citySuggestions.length > 0 || isLoadingCities) && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 z-50 max-h-60 overflow-y-auto">
                                            {isLoadingCities ? (
                                                <div className="flex items-center justify-center py-6 gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#FF2A14] border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-xs text-gray-400 font-medium">Searching cities...</span>
                                                </div>
                                            ) : (
                                                citySuggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            isUserTypingCityRef.current = false;
                                                            setCityName(suggestion.name);
                                                            setShowCityDropdown(false);
                                                            setCitySuggestions([]);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-[#FFF5F4] transition-colors flex items-center gap-2.5 border-b border-gray-50 last:border-b-0"
                                                    >
                                                        <svg className="w-4 h-4 text-[#FF2A14]/60 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-700">{suggestion.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Area Input */}
                                <div ref={areaDropdownRef} className="relative flex-1">
                                    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-[#FF2A14]/30 focus-within:bg-white focus-within:shadow-sm transition-all">
                                        <svg className="w-[18px] h-[18px] text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
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
                                            onFocus={() => { if (areaSuggestions.length > 0) setShowAreaDropdown(true); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                            className="flex-1 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 outline-none w-full"
                                        />
                                        {areaName && (
                                            <button onClick={() => { setAreaName(''); setAreaSuggestions([]); }} className="text-gray-300 hover:text-gray-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Area Dropdown */}
                                    {showAreaDropdown && (areaSuggestions.length > 0 || isLoadingAreas) && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 z-50 max-h-60 overflow-y-auto">
                                            {isLoadingAreas ? (
                                                <div className="flex items-center justify-center py-6 gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#FF2A14] border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-xs text-gray-400 font-medium">Searching areas...</span>
                                                </div>
                                            ) : (
                                                areaSuggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            isUserTypingAreaRef.current = false;
                                                            setAreaName(suggestion.name);
                                                            setShowAreaDropdown(false);
                                                            setAreaSuggestions([]);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-[#FFF5F4] transition-colors border-b border-gray-50 last:border-b-0"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-700">{suggestion.name}</span>
                                                            {suggestion.city && (
                                                                <span className="text-xs text-gray-400 mt-0.5">{suggestion.city}</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Search Button */}
                                <button
                                    id="salon-search-btn"
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-[#FF2A14] to-[#FF4D3A] hover:from-[#E02510] hover:to-[#FF2A14] text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md shadow-[#FF2A14]/20 hover:shadow-lg hover:shadow-[#FF2A14]/30 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 justify-center whitespace-nowrap"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                    Search
                                </button>
                            </div>
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
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Salons in <span className="text-[#FF2A14]">{searchedCity}</span>
                            </h2>
                            <p className="text-sm text-gray-400 font-medium mt-0.5">
                                {totalElements} salon{totalElements !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        {totalPages > 1 && (
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
                                Page {page + 1} of {totalPages}
                            </span>
                        )}
                    </div>
                )}

                {isShowingStatic && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 mt-2">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
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
                {(salons.length > 0 || isShowingStatic) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {displaySalons.map((salon, index) => {
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

                            return (
                                <div
                                    key={salonId || index}
                                    onClick={() => !isSwitching && handleSalonClick(salon)}
                                    className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-300 cursor-pointer group relative ${
                                        isSwitching ? 'opacity-70 pointer-events-none' : ''
                                    } ${loading && isShowingStatic ? 'opacity-65 pointer-events-none animate-pulse' : ''}`}
                                >
                                    {/* Switching overlay */}
                                    {isSwitching && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-10 flex items-center justify-center rounded-2xl">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-[#FF2A14] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-xs font-semibold text-gray-500">Switching...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className="h-48 relative overflow-hidden bg-gray-50">
                                        {hasImage ? (
                                            <>
                                                <img
                                                    src={coverImg}
                                                    alt={salon.salonName || salon.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                <img src={logoIcon} alt="NeoParlour" className="w-10 h-10 object-contain opacity-40" />
                                                <span className="text-[11px] font-semibold text-gray-400">No image available</span>
                                            </div>
                                        )}
                                        
                                        {/* Rating badge */}
                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-gray-800">{rating}</span>
                                        </div>

                                        {/* Open/Closed badge */}
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${
                                            isOpen
                                                ? 'bg-emerald-50/95 text-emerald-600 border border-emerald-200/50'
                                                : 'bg-red-50/95 text-red-500 border border-red-200/50'
                                        }`}>
                                            <span className="flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                {isOpen ? 'Open' : 'Closed'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-[#FF2A14] transition-colors duration-200 line-clamp-1">
                                            {salon.salonName || salon.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-gray-400 mb-3">
                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-xs font-medium line-clamp-1">
                                                {[salon.areaName, salon.cityName].filter(Boolean).join(', ') || 'Location not specified'}
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {salon.openingTime && salon.closingTime && (
                                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {salon.openingTime} - {salon.closingTime}
                                                </span>
                                            )}
                                            {salon.gstNumber && (
                                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && salons.length === 0 && searchedCity && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No salons found</h3>
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
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-md shadow-sm active:scale-[0.97]'
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
                                            : 'bg-white text-gray-500 border border-gray-200 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-sm'
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
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF2A14]/30 hover:text-[#FF2A14] hover:shadow-md shadow-sm active:scale-[0.97]'
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

            <Footer />
        </div>
    );
};

export default SalonsListing;
