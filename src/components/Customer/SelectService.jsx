import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Scissors,
    Search,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Star,
    Check,
    Plus,
    Share2,
    Clock,
    Sparkles,
    Shield,
    Smartphone,
    Compass,
    Info,
    CheckCircle2,
    Map,
    Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { useTranslation } from 'react-i18next';
import { translateServiceName } from '../../utils/serviceTranslation';

// Imported Layout Components
import BillDetails from './BillDetails.jsx';
import AppointmentBooked from './AppointmentBooked.jsx';
import SEOFooter from '../common/SEOFooter.jsx';
import { useDarkMode } from '../../context/DarkModeContext';

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
      isMounted = false ;
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

// Helper to generate dynamic days
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

const SelectService = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const activeSalonId = localStorage.getItem('activeSalonId');
    const { isAuthenticated, token } = useSelector((state) => state.customer);
    const { isDark } = useDarkMode();

    // --- STATE ---
    const [salon, setSalon] = useState(null);
    const [services, setServices] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavourite, setIsFavourite] = useState(false);

    // Track loaded statuses to prevent multiple calls
    const [servicesLoaded, setServicesLoaded] = useState(false);
    const [staffLoaded, setStaffLoaded] = useState(false);
    const [dateTimeLoaded, setDateTimeLoaded] = useState(() => {
        // If arriving with a pre-selected slot or expert, trigger loading immediately
        return !!(location.state?.selectedSlot || (location.state?.selectedExpert && location.state.selectedExpert !== 'any'));
    });

    // Refs for scrolling lazy-load
    const servicesSectionRef = useRef(null);
    const staffSectionRef = useRef(null);
    const dateTimeSectionRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState(location.state?.selectedCategory || '');
    const [selectedGender, setSelectedGender] = useState('All');
    const [selectedOffer, setSelectedOffer] = useState(location.state?.selectedOffer || null);
    const [addedServices, setAddedServices] = useState(() => {
        if (location.state?.addedServices) {
            return location.state.addedServices;
        }
        const offer = location.state?.selectedOffer;
        if (offer && offer.services) {
            return offer.services.map(s => s.id);
        }
        return [];
    });
    
    // Date & Time states
    const nextDays = getNextDays();
    const [selectedDateObj, setSelectedDateObj] = useState(() => {
        if (location.state?.selectedDateObj) {
            return location.state.selectedDateObj;
        }
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
        return location.state?.selectedTime || localStorage.getItem('bookingSelectedTime') || null;
    });
    const [selectedSlot, setSelectedSlot] = useState(() => {
        if (location.state?.selectedSlot) {
            return location.state.selectedSlot;
        }
        const stored = localStorage.getItem('bookingSelectedSlot');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error(e);
            }
        }
        return null;
    }); // Full slot object {startTime, displayTime}

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

    // --- API-BASED SLOT & AVAILABILITY STATE ---
    const [salonSlots, setSalonSlots] = useState([]);       // All salon slots for the day
    const [staffSlots, setStaffSlots] = useState([]);       // Slots filtered for selected staff
    const [availableStaffList, setAvailableStaffList] = useState([]); // Staff available at selected time
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [availableStaffLoading, setAvailableStaffLoading] = useState(false);

    const [selectedExpert, setSelectedExpert] = useState(() => {
        if (location.state?.selectedExpert) {
            return location.state.selectedExpert;
        }
        return localStorage.getItem('bookingSelectedExpert') || 'any';
    });

    useEffect(() => {
        if (selectedExpert && selectedExpert !== 'any') {
            localStorage.setItem('bookingSelectedExpert', selectedExpert);
        } else {
            localStorage.removeItem('bookingSelectedExpert');
        }
    }, [selectedExpert]);

    const [firstSelected, setFirstSelected] = useState(() => {
        if (location.state?.selectedSlot || localStorage.getItem('bookingSelectedSlot')) {
            return 'slot';
        }
        const expert = location.state?.selectedExpert || localStorage.getItem('bookingSelectedExpert');
        if (expert && expert !== 'any') {
            return 'staff';
        }
        return null;
    });

    // --- HOME SERVICE STATES ---
    const [homeService, setHomeService] = useState(false);
    const [homeServiceCharges, setHomeServiceCharges] = useState(0);
    const [customerAddress, setCustomerAddress] = useState(() => {
        try {
            const profile = JSON.parse(localStorage.getItem('customerProfile')) || {};
            return profile.address || '';
        } catch (e) {
            return '';
        }
    });
    const [fetchingHomeCharges, setFetchingHomeCharges] = useState(false);

    useEffect(() => {
        if (!selectedSlot && (!selectedExpert || selectedExpert === 'any')) {
            setFirstSelected(null);
            return;
        }
        if (selectedSlot && (!selectedExpert || selectedExpert === 'any')) {
            setFirstSelected('slot');
            return;
        }
        if (selectedExpert && selectedExpert !== 'any' && !selectedSlot) {
            setFirstSelected('staff');
            return;
        }
    }, [selectedSlot, selectedExpert]);

    // Derive the time slots to display: staffSlots if staff was selected first, otherwise salonSlots
    const displayedSlots = (firstSelected === 'staff') ? staffSlots : salonSlots;

    // --- MODAL STATE ---
    const [isBillOpen, setIsBillOpen] = useState(false);
    const [isBookedOpen, setIsBookedOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showDiscardOfferModal, setShowDiscardOfferModal] = useState(false);

    // --- HELPERS ---
    // Convert dateObj {day, num, month, year, fullDate:'06-06-2026'} → ISO Instant string
    const dateObjToInstant = (dateObj) => {
        if (!dateObj) return null;
        const [dd, mm, yyyy] = dateObj.fullDate.split('-');
        return `${yyyy}-${mm}-${dd}T00:00:00.000+05:30`;
    };

    const getISTZonedDateTime = (dateInput) => {
        if (!dateInput) return null;
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return dateInput;
        
        const istTime = new Date(date.getTime() + (330 * 60000));
        const year = istTime.getUTCFullYear();
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istTime.getUTCDate()).padStart(2, '0');
        const hours = String(istTime.getUTCHours()).padStart(2, '0');
        const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000+05:30`;
    };

    // Helper to get the set of available staff IDs for quick lookup
    const availableStaffIds = useMemo(() => {
        return new Set(availableStaffList.map(s => s.staffId));
    }, [availableStaffList]);

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

    // Load Salon Details immediately on mount
    useEffect(() => {
        if (!activeSalonId) {
            toast.error('No active salon selected. Redirecting to search.');
            navigate('/salons');
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

    // --- Compute durationMinutes from selected services ---
    const durationMinutes = useMemo(() => {
        const objs = allServices.length > 0
            ? allServices.filter(s => addedServices.includes(s.id))
            : [];
        if (objs.length === 0) return 0;
        return objs.reduce((sum, s) => sum + (s.duration || s.durationMinutes || 30), 0);
    }, [addedServices, allServices]);

    // --- SLOT RANGE HIGHLIGHTING ---
    // Parse a slot's startTime (ISO string or HH:mm) to minutes since midnight
    const parseSlotToMinutes = (startTime) => {
        if (!startTime) return null;
        try {
            const date = new Date(startTime);
            if (!isNaN(date.getTime())) {
                const istDate = new Date(date.getTime() + 330 * 60000);
                return istDate.getUTCHours() * 60 + istDate.getUTCMinutes();
            }
            const parts = startTime.split(':');
            if (parts.length >= 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        } catch (e) { /* ignore */ }
        return null;
    };

    // Build a Set of slot startTimes that fall inside the selected appointment window
    const occupiedSlotTimes = useMemo(() => {
        if (!selectedSlot?.startTime || durationMinutes <= 0) return new Set();
        const startMins = parseSlotToMinutes(selectedSlot.startTime);
        if (startMins === null) return new Set();
        const endMins = startMins + durationMinutes;
        const occupied = new Set();
        displayedSlots.forEach(slot => {
            const slotMins = parseSlotToMinutes(slot.startTime);
            if (slotMins === null) return;
            if (slotMins > startMins && slotMins < endMins) {
                occupied.add(slot.startTime);
            }
        });
        return occupied;
    }, [selectedSlot, durationMinutes, displayedSlots]);

    // --- FETCH SALON SLOTS on mount / date change ---
    useEffect(() => {
        if (!activeSalonId || !dateTimeLoaded) return;
        const fetchSalonSlots = async () => {
            setSlotsLoading(true);
            try {
                const dateInstant = dateObjToInstant(selectedDateObj);
                const params = { salonId: activeSalonId };
                if (dateInstant) params.selectedDate = dateInstant;
                const res = await axiosInstance.get('/appointments/public/salon-slots', { params });
                setSalonSlots(res.data || []);
            } catch (error) {
                console.error('[SelectService] Error fetching salon slots:', error);
                setSalonSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSalonSlots();
    }, [activeSalonId, selectedDateObj, dateTimeLoaded]);

    // --- FETCH STAFF-SPECIFIC SLOTS ---
    // Runs whenever: staff changes, date changes, durationMinutes changes (service added/removed).
    // Always re-fetches regardless of which was selected first so slot availability
    // reflects the correct service duration at all times.
    useEffect(() => {
        if (!activeSalonId || !selectedExpert || selectedExpert === 'any' || !dateTimeLoaded) {
            setStaffSlots([]);
            return;
        }
        const fetchStaffSlots = async () => {
            setSlotsLoading(true);
            try {
                const dateInstant = dateObjToInstant(selectedDateObj);
                const params = {
                    salonId: activeSalonId,
                    durationMinutes: durationMinutes
                };
                if (dateInstant) params.selectedDate = dateInstant;
                const res = await axiosInstance.get(`/appointments/public/staff/${selectedExpert}/available-slots`, { params });
                setStaffSlots(res.data || []);
            } catch (error) {
                console.error('[SelectService] Error fetching staff slots:', error);
                setStaffSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchStaffSlots();
    }, [activeSalonId, selectedExpert, selectedDateObj, durationMinutes, dateTimeLoaded]);

    // --- FETCH AVAILABLE STAFF when time slot selected ---
    // Runs whenever: slot changes, date changes, durationMinutes changes (service added/removed).
    // Always re-fetches regardless of which was selected first so staff availability
    // reflects the correct service duration at all times.
    useEffect(() => {
        if (!activeSalonId || !selectedSlot?.startTime || !dateTimeLoaded) {
            setAvailableStaffList([]);
            return;
        }
        // Prevent calling API for slots that are in the past to avoid 400 Bad Request
        if (new Date(selectedSlot.startTime) < new Date()) {
            setAvailableStaffList([]);
            return;
        }
        const fetchAvailableStaff = async () => {
            setAvailableStaffLoading(true);
            try {
                const res = await axiosInstance.get('/appointments/public/available-staff', {
                    params: {
                        salonId: activeSalonId,
                        selectedTime: selectedSlot.startTime,
                        durationMinutes: durationMinutes
                    }
                });
                setAvailableStaffList(res.data || []);
            } catch (error) {
                console.error('[SelectService] Error fetching available staff:', error);
                setAvailableStaffList([]);
            } finally {
                setAvailableStaffLoading(false);
            }
        };
        fetchAvailableStaff();
    }, [activeSalonId, selectedSlot, durationMinutes, dateTimeLoaded]);

    const fetchServices = async () => {
        if (servicesLoaded) return;
        try {
            console.log("[SelectService] Scroll down triggered: Fetching categories & active services from API...");
            const [categoriesRes, servicesRes] = await Promise.all([
                axiosInstance.get('/service/public/categories', {
                    params: { salonId: activeSalonId }
                }),
                axiosInstance.get('/services/public/active', {
                    params: { salonId: activeSalonId }
                })
            ]);

            const cats = categoriesRes.data || [];
            setCategories(cats);

            const activeSrv = servicesRes.data || [];
            setAllServices(activeSrv);

            // Initialize category
            const initialCat = location.state?.selectedCategory || cats[0] || '';
            if (initialCat) {
                setSelectedCategory(initialCat);
            }
            setServicesLoaded(true);
        } catch (error) {
            console.error("Error fetching categories and active services dynamically:", error);
        }
    };

    // Lazy load Staff using search API
    const fetchStaff = async () => {
        if (staffLoaded) return;
        try {
            console.log("[SelectService] Scroll down triggered: Fetching staff search list from API...");
            const staffRes = await axiosInstance.get('/staff/public/search', {
                params: { size: 50, salonId: activeSalonId, status: 'active' }
            });
            const staffData = staffRes.data?.content || staffRes.data || [];
            setStaffList(staffData);
            setStaffLoaded(true);
        } catch (error) {
            console.error("Error fetching staff dynamically:", error);
        }
    };

    // Filter services by selected category locally from allServices
    useEffect(() => {
        if (!selectedCategory || selectedCategory.toLowerCase() === 'all') {
            setServices(allServices);
        } else {
            const activeSrv = allServices.filter(s => s.category?.toLowerCase() === selectedCategory?.toLowerCase());
            setServices(activeSrv);
        }
    }, [selectedCategory, allServices]);

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

        const dateTimeObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setDateTimeLoaded(true);
                dateTimeObserver.disconnect();
            }
        }, observerOptions);

        if (servicesSectionRef.current && !servicesLoaded) servicesObserver.observe(servicesSectionRef.current);
        if (staffSectionRef.current && !staffLoaded) staffObserver.observe(staffSectionRef.current);
        if (dateTimeSectionRef.current && !dateTimeLoaded) dateTimeObserver.observe(dateTimeSectionRef.current);

        return () => {
            servicesObserver.disconnect();
            staffObserver.disconnect();
            dateTimeObserver.disconnect();
        };
    }, [loading, servicesLoaded, staffLoaded, dateTimeLoaded]);

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

    // --- ACTIONS ---
    const handleHomeServiceToggle = async (e) => {
        const checked = e.target.checked;
        setHomeService(checked);
        if (checked && homeServiceCharges === 0 && activeSalonId) {
            setFetchingHomeCharges(true);
            try {
                const res = await axiosInstance.get(`/salons/${activeSalonId}/home-service-charges`);
                const charge = parseFloat(res.data) || 0;
                setHomeServiceCharges(charge);
            } catch (error) {
                console.error("Error loading home service charges:", error);
                toast.error("Failed to fetch home service charges");
            } finally {
                setFetchingHomeCharges(false);
            }
        }
    };

    const handleDiscardOffer = () => {
        if (selectedOffer && selectedOffer.services) {
            const offerServiceIds = selectedOffer.services.map(s => s.id);
            setAddedServices(prev => prev.filter(sid => !offerServiceIds.includes(sid)));
        }
        setSelectedOffer(null);
        toast.success('Offer and related services discarded.');
    };

    const handleServiceToggle = (id) => {
        if (addedServices.includes(id)) {
            if (selectedOffer && selectedOffer.services) {
                const isOfferService = selectedOffer.services.some(s => s.id === id);
                if (isOfferService) {
                    setShowDiscardOfferModal(true);
                    return;
                }
            }
            setAddedServices(addedServices.filter(sid => sid !== id));
        } else {
            setAddedServices([...addedServices, id]);
        }
    };

    // --- CONFLICT & OVERLAP VALIDATION ---
    const checkConflict = (slot, duration) => {
        if (!slot || !slot.startTime || duration <= 0) return false;
        const startMins = parseSlotToMinutes(slot.startTime);
        if (startMins === null) return false;
        const endMins = startMins + duration;

        return displayedSlots.some(s => {
            const sMins = parseSlotToMinutes(s.startTime);
            if (sMins === null) return false;
            // A slot is conflicting if it is busy and:
            // - it is the selected slot itself, or
            // - its start time falls within the appointment window (startMins, endMins)
            if (s.busy) {
                if (s.startTime === slot.startTime) return true;
                if (sMins > startMins && sMins < endMins) return true;
            }
            return false;
        });
    };

    // --- SLOT SELECTION WITH CLOSING TIME VALIDATION ---
    const handleSlotSelect = (slot) => {
        if (checkConflict(slot, durationMinutes)) {
            toast.error("Overlapping error: This time slot conflicts with an existing appointment.", {
                style: { background: '#7f1d1d', color: '#fecaca', borderRadius: '16px', padding: '16px 24px' }
            });
            return;
        }

        setSelectedTime(slot.displayTime);
        setSelectedSlot(slot);

        // Check if appointment end time overflows salon closing time
        if (salon?.closingTime && durationMinutes > 0 && slot.startTime) {
            const slotStartMins = parseSlotToMinutes(slot.startTime);
            if (slotStartMins !== null) {
                const appointmentEndMins = slotStartMins + durationMinutes;

                const [closeH, closeM] = salon.closingTime.split(':').map(Number);
                const closingMins = closeH * 60 + closeM;

                if (appointmentEndMins > closingMins) {
                    const overflowMins = appointmentEndMins - closingMins;
                    const endH = Math.floor(appointmentEndMins / 60) % 24;
                    const endM = String(appointmentEndMins % 60).padStart(2, '0');
                    const ampm = endH >= 12 ? 'PM' : 'AM';
                    const displayEnd = `${endH % 12 || 12}:${endM} ${ampm}`;

                    toast(
                        `⚠️ This appointment ends at ${displayEnd}, which is ${overflowMins} min past the salon's closing time (${formatTimeStr(salon.closingTime)}). The salon may not be able to complete all services.`,
                        {
                            duration: 6000,
                            style: {
                                background: '#7c2d12',
                                color: '#fed7aa',
                                borderRadius: '16px',
                                padding: '16px 20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(251,146,60,0.3)',
                                maxWidth: '420px',
                            },
                            icon: '🕐',
                        }
                    );
                }
            }
        }
    };

    const handleBookClick = () => {
        if (addedServices.length === 0) {
            toast.error('Please select at least one service to proceed.');
            return;
        }
        if (!selectedSlot) {
            toast.error('Please select a time slot first.');
            return;
        }
        if (checkConflict(selectedSlot, durationMinutes)) {
            toast.error("Overlapping error: Selected services and slot conflict with an existing appointment. Please choose a different time slot.", {
                style: { background: '#7f1d1d', color: '#fecaca', borderRadius: '16px', padding: '16px 24px' }
            });
            return;
        }
        if (homeService && !customerAddress.trim()) {
            toast.error('Please enter your complete address for home service.');
            return;
        }
        if (!token) {
            setShowLoginPrompt(true);
            return;
        }
        setIsBillOpen(true);
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

    // Filtered services
    const filteredServicesList = (Array.isArray(services) ? services : []).filter(s => {
        const matchesCategory = selectedCategory.toLowerCase() === 'all' || s.category?.toLowerCase() === selectedCategory?.toLowerCase();
        if (!matchesCategory) return false;
        
        if (selectedGender !== 'All') {
            const nameLower = (s.name || '').toLowerCase();
            if (selectedGender === 'Male') {
                return !nameLower.includes('women') && !nameLower.includes('female');
            } else if (selectedGender === 'Female') {
                return !nameLower.includes('men') && !nameLower.includes('male');
            }
        }
        return true;
    });

    // Derived staff list to display
    const displayedStaffList = useMemo(() => {
        if (firstSelected === 'slot') {
            return availableStaffList.map(s => {
                const staffId = s.staffId || s.id;
                const fullStaff = staffList.find(item => item.id === staffId);
                return {
                    ...s,
                    ...fullStaff,
                    id: staffId,
                    name: s.name || s.staffName || fullStaff?.name || 'Stylist',
                    speciality: s.speciality || fullStaff?.speciality,
                    imagePath: s.imagePath || fullStaff?.imagePath,
                    rating: s.rating !== undefined ? s.rating : fullStaff?.rating
                };
            });
        }
        return staffList;
    }, [firstSelected, availableStaffList, staffList]);

    // Selected Expert details
    const selectedExpertObj = displayedStaffList.find(s => s.id === selectedExpert) || (selectedExpert === 'any' ? { name: 'No Preference' } : { name: 'Stylist' });

    // Customer details from cache
    const customerUser = JSON.parse(localStorage.getItem('customerUser')) || {};
    const customerProfile = JSON.parse(localStorage.getItem('customerProfile')) || {};
    const customerName = customerProfile.name || customerUser.name || 'Valued Customer';
    const customerPhone = customerProfile.phone || customerUser.phone || 'N/A';

    // Services selected objects (looking up in allServices cache for cross-category selection persistence)
    const selectedServiceObjects = allServices.length > 0 
        ? allServices.filter(s => addedServices.includes(s.id))
        : services.filter(s => addedServices.includes(s.id));

    // Real-time Billing & Offer Discount Calculations
    const serviceSubtotal = selectedServiceObjects.reduce((sum, s) => sum + (s.price || 0), 0);
    let discountAmount = 0;
    let offerServiceIds = [];
    let offerOriginalTotal = 0;
    let offerDiscount = 0;
    let offerFinalTotal = 0;
    if (selectedOffer && selectedOffer.services) {
        offerServiceIds = selectedOffer.services.map(s => s.id);
        const offerServicesTotal = selectedServiceObjects
            .filter(s => offerServiceIds.includes(s.id))
            .reduce((sum, s) => sum + (s.price || 0), 0);
        discountAmount = Math.round(offerServicesTotal * ((selectedOffer.percentage || 0) / 100));

        // Calculations for offer banner itself (total package value)
        offerOriginalTotal = selectedOffer.services.reduce((sum, os) => {
            const actualSrv = allServices.find(s => s.id === os.id) || services.find(s => s.id === os.id) || os;
            return sum + (actualSrv.price || 0);
        }, 0);
        offerDiscount = Math.round(offerOriginalTotal * ((selectedOffer.percentage || 0) / 100));
        offerFinalTotal = offerOriginalTotal - offerDiscount;
    }
    const weekdayDiscountPercent = selectedSlot?.discountPercentage || 0;
    const weekdayDiscountAmount = Math.round((serviceSubtotal - discountAmount) * (weekdayDiscountPercent / 100));
    const grandTotal = Math.max(0, serviceSubtotal - discountAmount - weekdayDiscountAmount + (homeService ? homeServiceCharges : 0));

    // Staff avatar fallback map
    const expertFallbacks = [expertOneImg, expertTwoImg, expertThreeImg];
    const getExpertImg = (index) => expertFallbacks[index % expertFallbacks.length];

    const handleConfirmBooking = async () => {
        if (homeService && !customerAddress.trim()) {
            toast.error('Please enter your complete address for home service.');
            return;
        }
        setBookingLoading(true);
        try {
            let appointmentAtStr = selectedSlot?.startTime || null;
            if (appointmentAtStr) {
                appointmentAtStr = getISTZonedDateTime(appointmentAtStr);
            } else if (selectedDateObj && selectedTime) {
                const match = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (match) {
                    let hour = parseInt(match[1], 10);
                    const minutes = parseInt(match[2], 10);
                    const ampm = match[3].toUpperCase();
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                    
                    const [dd, mm, yyyy] = selectedDateObj.fullDate.split('-');
                    appointmentAtStr = `${yyyy}-${mm}-${dd}T${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000+05:30`;
                }
            }

            const appointmentServices = selectedServiceObjects.map(s => ({
                serviceId: String(s.id),
                serviceName: s.name,
                price: s.price,
                duration: s.duration || s.durationMinutes || 30
            }));

            const bookingPayload = {
                userId: customerUser.id || null,
                customerId: customerProfile.id || null,
                salonId: parseInt(activeSalonId, 10),
                staffId: selectedExpert && selectedExpert !== 'any' ? parseInt(selectedExpert, 10) : null,
                staffName: selectedExpertObj?.name && selectedExpertObj.name !== 'No Preference' ? selectedExpertObj.name : null,
                customerName: customerName,
                customerNumber: customerPhone,
                appointmentAt: appointmentAtStr,
                serviceDuration: durationMinutes,
                totalPrice: serviceSubtotal,
                discountAmount: discountAmount,
                weekdayDiscountAmount: weekdayDiscountAmount,
                finalAmount: Math.max(0, serviceSubtotal - discountAmount - weekdayDiscountAmount + (homeService ? homeServiceCharges : 0)),
                homeCharge: homeService ? homeServiceCharges : 0.00,
                homeService: homeService,
                address: homeService ? customerAddress : null,
                status: 'booked',
                services: appointmentServices
            };

            if (selectedOffer) {
                bookingPayload.offerId = selectedOffer.id;
                bookingPayload.offerName = selectedOffer.name;
                bookingPayload.discountType = 'PERCENTAGE';
                bookingPayload.discountValue = selectedOffer.percentage;
            }

            const res = await axiosInstance.post('/appointments/book', bookingPayload);
            toast.success('Appointment booked successfully!');
            
            // Clear selections from localStorage
            localStorage.removeItem('bookingSelectedSlot');
            localStorage.removeItem('bookingSelectedTime');
            localStorage.removeItem('bookingSelectedExpert');
            localStorage.removeItem('bookingSelectedDateObj');
            
            setIsBillOpen(false);
            setIsBookedOpen(true);
        } catch (error) {
            console.error('[SelectService] Error booking appointment:', error);
            const status = error.response?.status;
            const message = String(error.response?.data?.message || error.message || '').toLowerCase();
            
            if (status === 401 || status === 403 || message.includes('token') || message.includes('unauthorized') || message.includes('not logged in')) {
                toast.error('Please login to book an appointment.');
                navigate('/customer/login', { 
                    state: { 
                        from: '/book-service',
                        bookingState: { 
                            addedServices, 
                            selectedExpert, 
                            selectedSlot, 
                            selectedDateObj, 
                            selectedTime, 
                            selectedOffer, 
                            selectedCategory 
                        } 
                    } 
                });
            } else {
                toast.error(error.response?.data?.message || 'Failed to book appointment. Please try again.');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
                <nav className="bg-white border-b border-slate-100 py-3.5 shadow-sm">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-[10px] text-slate-300 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                        <div className="h-3 yt-skeleton rounded w-16"></div>
                        <span>&gt;</span>
                        <div className="h-3 yt-skeleton rounded w-24"></div>
                        <span>&gt;</span>
                        <div className="h-3 yt-skeleton rounded w-20"></div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
                    {/* Header Card Skeleton */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div className="space-y-3 flex-1 w-full">
                            <div className="h-8 yt-skeleton rounded-2xl w-64"></div>
                            <div className="h-4 yt-skeleton rounded-lg w-48"></div>
                            <div className="flex gap-2">
                                <div className="h-6 yt-skeleton rounded-xl w-24"></div>
                                <div className="h-6 yt-skeleton rounded-xl w-20"></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 yt-skeleton rounded-2xl"></div>
                            <div className="w-10 h-10 yt-skeleton rounded-2xl"></div>
                        </div>
                    </div>

                    {/* Content Columns Skeleton */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                        <div className="w-full lg:w-[60%] shrink-0 space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    <div className="h-9 w-24 yt-skeleton rounded-xl shrink-0"></div>
                                    <div className="h-9 w-28 yt-skeleton rounded-xl shrink-0"></div>
                                    <div className="h-9 w-24 yt-skeleton rounded-xl shrink-0"></div>
                                    <div className="h-9 w-32 yt-skeleton rounded-xl shrink-0"></div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center">
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
                        <div className="w-full lg:w-[40%] bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <div className="h-6 yt-skeleton rounded-xl w-36"></div>
                            <div className="h-28 yt-skeleton rounded-2xl"></div>
                            <div className="h-12 yt-skeleton rounded-2xl w-full"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">

            {/* ==================== BREADCRUMBS ==================== */}
            <nav className="bg-white border-b border-slate-100 py-3.5 shadow-sm">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-[10px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                    <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => navigate('/customer/salons')}>{t('salon_page.search', 'Search')}</span>
                    <span>&gt;</span>
                    <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => navigate(`/customer/salon`)}>{t('salon_page.salon_description', 'Salon Description')}</span>
                    <span>&gt;</span>
                    <span className="text-slate-900 font-black">{t('select_service.select_service', 'Select Service')}</span>
                </div>
            </nav>

            {/* ==================== MAIN CONTENT ==================== */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

                {/* Header Block */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="min-w-0 flex-1 space-y-2.5">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                            {salon?.name || salon?.salonName || 'Salon Details'}
                        </h1>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 uppercase">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{[salon?.address, salon?.areaName, salon?.cityName].filter(Boolean).join(', ') || 'No address specified'}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                                isSalonOpenNow() 
                                    ? 'bg-green-50 border border-green-200 text-green-700' 
                                    : 'bg-red-50 border border-red-200 text-red-600'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSalonOpenNow() ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
                                <span className="whitespace-nowrap">{isSalonOpenNow() ? t('salon_page.open', 'Open') : t('salon_page.closed', 'Closed')}</span>
                                <span className="text-slate-300">|</span>
                                <span className="whitespace-nowrap">{salon?.openingTime ? formatTimeStr(salon.openingTime) : '10:00 AM'} - {salon?.closingTime ? formatTimeStr(salon.closingTime) : '10:00 PM'}</span>
                            </div>
                            {salon?.salonCode && (
                                <span className="text-[9px] font-bold bg-slate-50 text-slate-450 border border-slate-150/60 px-2.5 py-1.5 rounded uppercase tracking-widest">
                                    {t('salon_page.code', 'Code: {{code}}', { code: salon.salonCode })}
                                </span>
                            )}
                            {homeServiceCharges > 0 && (
                                <span className="text-[9px] font-bold bg-red-50 text-[#FF0B01] border border-red-200 px-2.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                                    {t('salon_page.home_service', 'Home Service: ₹{{amount}}', { amount: homeServiceCharges })}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-center">
                        <button 
                            type="button" 
                            onClick={handleShare}
                            className="p-2.5 border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition shadow-sm cursor-pointer"
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

                {/* Master Two-Column Flex Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start w-full">

                    {/* LEFT CONTAINER CANVAS (60% Width) */}
                    <div className="w-full lg:w-[60%] shrink-0 space-y-8">

                        {/* Services Picker Section */}
                        <section ref={servicesSectionRef} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[180px]">
                            {!servicesLoaded ? (
                                <div className="space-y-6">
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        <div className="h-9 w-24 yt-skeleton rounded-xl shrink-0"></div>
                                        <div className="h-9 w-28 yt-skeleton rounded-xl shrink-0"></div>
                                        <div className="h-9 w-24 yt-skeleton rounded-xl shrink-0"></div>
                                        <div className="h-9 w-32 yt-skeleton rounded-xl shrink-0"></div>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center">
                                                <div className="space-y-2">
                                                    <div className="h-5 yt-skeleton rounded-lg w-44"></div>
                                                    <div className="h-4 yt-skeleton rounded-lg w-28"></div>
                                                </div>
                                                <div className="h-9 w-20 yt-skeleton rounded-xl"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Scissors className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('select_service.select_services', 'Select Services')}
                                        </h3>
                                        {/* Gender filter dropdown */}
                                        <div className="relative">
                                            <select 
                                                value={selectedGender} 
                                                onChange={(e) => setSelectedGender(e.target.value)}
                                                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-red-500 cursor-pointer shadow-sm hover:bg-white transition-all"
                                            >
                                                <option value="All">{t('select_service.all_genders', 'All Genders')}</option>
                                                <option value="Male">{t('select_service.male_only', 'Male Only')}</option>
                                                <option value="Female">{t('select_service.female_only', 'Female Only')}</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-450 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {categories.length > 0 ? (
                                        <div className="flex items-center gap-3.5 overflow-x-auto pb-4 mb-6 border-b border-slate-100 scrollbar-none">
                                            {/* All Services Tab */}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategory('All')}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[90px] h-[90px] transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                                                    selectedCategory.toLowerCase() === 'all'
                                                        ? 'border-[#FF0B01] bg-gradient-to-b from-[#FF0B01] to-[#D00600] text-white shadow-md shadow-red-500/10'
                                                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                                                }`}
                                            >
                                                <Sparkles
                                                    className={`w-7 h-7 mb-1.5 ${selectedCategory.toLowerCase() === 'all' ? 'text-white' : 'text-slate-500'}`}
                                                />
                                                <span className="text-[10px] font-black tracking-tight uppercase line-clamp-1">{t('services.all', 'All')}</span>
                                            </button>

                                            {categories.map((catName) => {
                                                const isActive = selectedCategory === catName;
                                                const catIcon = getCategoryIcon(catName);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={catName}
                                                        onClick={() => setSelectedCategory(catName)}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[90px] h-[90px] transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                                                            isActive
                                                                ? 'border-[#FF0B01] bg-gradient-to-b from-[#FF0B01] to-[#D00600] text-white shadow-md shadow-red-500/10'
                                                                : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <img
                                                            src={catIcon}
                                                            alt={catName}
                                                            className={`w-7 h-7 object-contain mb-1.5 ${isActive ? 'invert brightness-0' : ''}`}
                                                        />
                                                        <span className="text-[10px] font-black tracking-tight uppercase line-clamp-1">{translateServiceName(catName, t)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-xs text-slate-400 font-bold uppercase tracking-wider">{t('book_service.no_categories', 'No Categories Found.')}</div>
                                    )}

                                    {/* Selected Offer Services Section */}
                                    {selectedOffer && selectedOffer.services && selectedOffer.services.length > 0 && (
                                        <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl border border-red-150 shadow-sm relative overflow-hidden">
                                            {/* Decorative background accent */}
                                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-500/5 rounded-full" />
                                            
                                            <div className="flex items-center justify-between border-b border-red-100 pb-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-[#FF0B01] animate-pulse shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                            {selectedOffer.name} {t('book_service.special_bundle', 'Special Bundle')}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                            {t('book_service.services_included_off', 'Services Included ({{percent}}% OFF Applied)', { percent: selectedOffer.percentage })}
                                                        </p>
                                                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] font-extrabold uppercase tracking-wider">
                                                            <span className="px-2.5 py-1 bg-white/80 border border-slate-200/50 rounded-lg text-slate-500 shadow-sm">
                                                                {t('book_service.services_amount', 'Services Amount:')} <span className="line-through text-slate-400 font-bold ml-1">₹{offerOriginalTotal}</span>
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-green-50/80 border border-green-100 rounded-lg text-green-700 shadow-sm">
                                                                {t('book_service.discount', 'Discount:')} <span className="font-black ml-1">-₹{offerDiscount}</span>
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-red-50/80 border border-red-100 rounded-lg text-slate-900 shadow-sm">
                                                                {t('book_service.difference_final', 'Difference/Final:')} <span className="text-[#FF0B01] font-black ml-1">₹{offerFinalTotal}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={handleDiscardOffer}
                                                    className="px-3.5 py-1.5 bg-[#FF0B01] hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm shadow-red-500/10 shrink-0"
                                                >
                                                    {t('book_service.discard_offer', 'Discard Offer')}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedOffer.services.map((service) => {
                                                    const isAdded = addedServices.includes(service.id);
                                                    const actualService = allServices.find(s => s.id === service.id) || services.find(s => s.id === service.id) || service;
                                                    const originalPrice = actualService.price || 0;
                                                    const discountedPrice = Math.round(originalPrice * (1 - (selectedOffer.percentage || 0) / 100));
                                                    return (
                                                        <div 
                                                            key={service.id}
                                                            className={`p-4 rounded-2xl bg-white border transition-all duration-300 flex items-center justify-between gap-3 shadow-sm ${
                                                                isAdded 
                                                                    ? 'border-[#FF0B01] bg-[#FF0B01]/[0.01]' 
                                                                    : 'border-slate-100 opacity-65 hover:opacity-100 hover:border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="min-w-0">
                                                                <h5 className="text-xs font-black text-slate-900 uppercase truncate">
                                                                    {translateServiceName(service.name, t)}
                                                                </h5>
                                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                                                                        {actualService.duration || actualService.durationMinutes || service.duration || service.durationMinutes || 30} Min
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1.5 font-bold">
                                                                        <span className="line-through text-slate-400 font-semibold">₹{originalPrice}</span>
                                                                        <span className="text-[#FF0B01] font-black">₹{discountedPrice}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleServiceToggle(service.id)}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 w-16 text-center ${
                                                                    isAdded 
                                                                        ? 'bg-red-50 text-[#FF0B01] border border-red-100' 
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                }`}
                                                            >
                                                                {t(isAdded ? 'buttons.added' : 'buttons.add', isAdded ? 'Added' : 'Add')}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Services List Rendering */}
                                    <div className="space-y-4">
                                        {filteredServicesList.map((service) => {
                                            const isAdded = addedServices.includes(service.id);
                                            const isOfferIncluded = selectedOffer && selectedOffer.services?.some(s => s.id === service.id);
                                            return (
                                                <div
                                                    key={service.id}
                                                    className={`flex gap-4 p-5 rounded-2xl bg-white border transition-all duration-300 ${
                                                        isAdded 
                                                            ? 'border-[#FF0B01] bg-[#FF0B01]/[0.02] shadow-sm shadow-[#FF0B01]/5 ring-1 ring-[#FF0B01]/10' 
                                                            : 'border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/50'
                                                    }`}
                                                >
                                                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                                        <Scissors className="w-7 h-7 text-slate-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase leading-tight">{translateServiceName(service.name, t)}</h4>
                                                            <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                {translateServiceName(service.category, t)}
                                                            </span>
                                                            {isOfferIncluded && (
                                                                <span className="bg-red-50 text-[#FF0B01] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                                    <Sparkles className="w-2.5 h-2.5 animate-pulse shrink-0" /> {t('book_service.offer_included', 'Offer Included')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                                                            <Clock className="w-3.5 h-3.5 text-slate-450" />
                                                            {t('book_service.approx_duration', 'Approx. {{mins}} Min duration', { mins: service.duration || 30 })}
                                                        </p>
                                                        <p className="text-base font-black text-slate-900 mt-2">₹{service.price}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleServiceToggle(service.id)}
                                                            className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 w-24 hover:scale-105 active:scale-95 shadow-sm ${
                                                                isAdded
                                                                    ? 'bg-[#FF0B01] text-white hover:bg-red-700 shadow-red-500/10'
                                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {isAdded ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    <span>{t('buttons.added', 'Added')}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                                    <span>{t('buttons.add', 'Add')}</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {filteredServicesList.length === 0 && (
                                            <div className="text-center py-8 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                {t('book_service.no_services', 'No services found matching filters.')}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Calendar Selector Component */}
                        <section ref={dateTimeSectionRef} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
                                <Calendar className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('book_service.select_date_time', 'Select Date and Time')}
                            </h3>
                            
                            {/* Months Indicator header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-xs font-black tracking-wider text-slate-700">
                                <span className="uppercase text-slate-900">{selectedDateObj?.month || 'Date'}</span>
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-50 text-[#FF0B01] text-[9.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                                        {t('book_service.year', 'Year {{year}}', { year: selectedDateObj?.year || '2026' })}
                                    </span>
                                </div>
                            </div>

                            {/* Scroller Days Container */}
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
                                                setAvailableStaffList([]);
                                            }}
                                            className={`flex flex-col items-center justify-center py-3.5 px-4.5 rounded-2xl min-w-[62px] cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 ${
                                                isSelectedDate
                                                    ? 'bg-gradient-to-b from-[#FF0B01] to-[#D00600] text-white shadow-md shadow-red-500/10'
                                                    : isDark
                                                        ? 'text-slate-400 bg-[#1A1A1A] border border-gray-700 hover:bg-orange-500 hover:text-white'
                                                        : 'text-slate-400 bg-slate-50 border border-slate-100 hover:bg-white hover:text-slate-700 hover:shadow-sm'
                                            }`}
                                        >
                                            <span className="text-[10px] font-extrabold uppercase mb-1">{d.day}</span>
                                            <span className="text-sm font-black">{d.num}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time Slots grid */}
                            {slotsLoading ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mt-5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                        <div key={i} className="h-14 yt-skeleton rounded-xl"></div>
                                    ))}
                                </div>
                            ) : displayedSlots.length === 0 ? (
                                <div className="text-center py-8 mt-5">
                                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('book_service.no_slots', 'No slots available for this day')}</p>
                                    {selectedExpert && selectedExpert !== 'any' && (
                                        <p className="text-[10px] text-slate-350 font-medium mt-1">{t('book_service.try_different_date', 'Try selecting a different date or "No Preference"')}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mt-5">
                                    {/* Conflict legend — shown only when a slot is selected and services have duration */}
                                    {selectedSlot && durationMinutes > 0 && occupiedSlotTimes.size > 0 && (
                                        <div className="col-span-full mb-1 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block border border-amber-500"></span>
                                                <span className="text-slate-500">{t('book_service.appointment_window', 'Appointment window')}</span>
                                            </span>
                                            {displayedSlots.some(s => occupiedSlotTimes.has(s.startTime) && s.busy) && (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded-sm bg-red-400 inline-block border border-red-500"></span>
                                                    <span className="text-red-500">{t('book_service.conflict_booked', 'Conflict — slot already booked')}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {displayedSlots.map((slot, idx) => {
                                        const isSelectedTime = selectedSlot?.startTime === slot.startTime;
                                        const isInWindow = occupiedSlotTimes.has(slot.startTime);
                                        const isConflict = isInWindow && slot.busy;

                                        let slotClass = '';
                                        if (slot.busy && !isInWindow) {
                                            // Normal booked slot (outside our window)
                                            slotClass = 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed opacity-60';
                                        } else if (isConflict) {
                                            // Slot inside our window that is already booked — hard conflict
                                            slotClass = 'bg-red-100 border-red-400 text-red-600 cursor-not-allowed ring-2 ring-red-300 ring-offset-1 animate-pulse';
                                        } else if (isSelectedTime) {
                                            // The slot the user clicked
                                            slotClass = 'bg-gradient-to-b from-[#FF0B01] to-[#D00600] border-transparent text-white shadow-md shadow-red-500/10 hover:scale-105 active:scale-95';
                                        } else if (isInWindow) {
                                            // Slots inside appointment window but not yet booked
                                            slotClass = 'bg-amber-50 border-amber-400 text-amber-700 cursor-not-allowed ring-1 ring-amber-300';
                                        } else {
                                            // Normal available slot
                                            slotClass = 'border-slate-100 text-slate-700 bg-slate-50 hover:bg-white hover:border-slate-300 hover:scale-105 active:scale-95';
                                        }

                                        return (
                                            <button
                                                type="button"
                                                key={slot.startTime || idx}
                                                disabled={slot.busy || isInWindow}
                                                onClick={() => handleSlotSelect(slot)}
                                                className={`py-3 px-2 rounded-xl border text-center text-xs font-bold transition-all duration-300 shadow-sm flex flex-col items-center justify-center min-h-[4rem] ${slotClass}`}
                                                title={isConflict ? 'Conflict: This slot overlaps with an existing appointment' : isInWindow ? `Occupied by your ${durationMinutes}-min appointment` : ''}
                                            >
                                                <span>{slot.displayTime}</span>
                                                {isConflict && (
                                                    <span className="text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-full bg-red-200 text-red-700">
                                                        {t('book_service.conflict', 'Conflict')}
                                                    </span>
                                                )}
                                                {isInWindow && !isConflict && (
                                                    <span className="text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                        {t('book_service.in_use', 'In use')}
                                                    </span>
                                                )}
                                                {!isInWindow && !isConflict && slot.discountPercentage > 0 && slot.discountMessage && (
                                                    <span className={`text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-full ${
                                                        isSelectedTime ? 'bg-white text-[#FF0B01]' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {slot.discountMessage}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Booking Trigger button and disclaimer */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
                            <button
                                type="button"
                                onClick={handleBookClick}
                                className="w-full max-w-md bg-gradient-to-b from-[#FF0B01] to-[#D00600] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-red-500/15"
                            >
                                {t('book_service.book_pay_after', 'Book and Pay After Services')}
                            </button>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                                {t('book_service.terms_agree', 'By booking an appointment, you agree to our')}{' '}
                                <span className="text-slate-650 underline cursor-pointer" onClick={() => navigate('/customer/terms-and-conditions')}>{t('book_service.terms_of_service', 'Terms of Service')}</span>{' '}
                                {t('book_service.and', 'and')}{' '}
                                <span className="text-slate-650 underline cursor-pointer" onClick={() => navigate('/customer/privacy-policy')}>{t('book_service.privacy_policy', 'Privacy Policy')}</span>.
                            </p>
                        </div>

                    </div>

                    {/* RIGHT CONTAINER SIDEBAR (40% Width) */}
                    <div className="w-full lg:w-[40%] space-y-6 lg:sticky lg:top-6">

                        {/* Real-time Booking Summary Card */}
                        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                                <Scissors className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('book_service.booking_summary', 'Booking Summary')}
                            </h3>
                            {selectedServiceObjects.length === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                    {t('book_service.no_services_selected', 'No services selected yet.')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Grouped Services List */}
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                        {/* Group 1: Offer Services */}
                                        {selectedOffer ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between bg-red-50/50 border border-red-100/50 rounded-xl p-2.5">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#FF0B01] tracking-wider">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span className="line-clamp-1">{selectedOffer.name} ({selectedOffer.percentage}% OFF)</span>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={handleDiscardOffer}
                                                        className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 bg-red-100/50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors shrink-0"
                                                        title="Discard offer and related services"
                                                    >
                                                        {t('book_service.discard', 'Discard')}
                                                    </button>
                                                </div>
                                                <div className="pl-2 border-l-2 border-red-200 space-y-2">
                                                    {selectedServiceObjects.filter(s => offerServiceIds.includes(s.id)).map(s => (
                                                        <div key={s.id} className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-700 uppercase leading-tight line-clamp-1">{translateServiceName(s.name, t)}</span>
                                                            <span className="font-extrabold text-slate-900">₹{s.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Group 2: Regular Services */}
                                        {selectedServiceObjects.filter(s => !offerServiceIds.includes(s.id)).length > 0 ? (
                                            <div className="space-y-2 pt-2">
                                                {selectedOffer && (
                                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                        {t('book_service.regular_services', 'Regular Services')}
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    {selectedServiceObjects.filter(s => !offerServiceIds.includes(s.id)).map(s => (
                                                        <div key={s.id} className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-700 uppercase leading-tight line-clamp-1">{translateServiceName(s.name, t)}</span>
                                                            <span className="font-extrabold text-slate-900">₹{s.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Cost breakdown ledger */}
                                    <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs font-semibold text-slate-500">
                                        <div className="flex justify-between">
                                            <span>{t('book_service.subtotal', 'Subtotal')}</span>
                                            <span className="text-slate-800 font-bold">₹{serviceSubtotal}</span>
                                        </div>
                                        
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-[#FF0B01]" /> {t('book_service.offer_discount', 'Offer Discount')}
                                                </span>
                                                <span className="font-bold">-₹{discountAmount}</span>
                                            </div>
                                        )}

                                        {/* Home Service toggle */}
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{t('book_service.home_service_q', 'Home Service?')}</span>
                                                <span className="text-[9px] text-slate-400 font-medium normal-case">{t('book_service.avail_home', 'Avail services at your place')}</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={homeService} 
                                                    onChange={handleHomeServiceToggle}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF0B01]"></div>
                                            </label>
                                        </div>

                                        {fetchingHomeCharges && (
                                            <div className="h-4 bg-slate-200 rounded-md w-36 animate-pulse my-1"></div>
                                        )}

                                        {homeService && !fetchingHomeCharges && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {homeServiceCharges > 0 && (
                                                    <div className="flex justify-between text-xs font-bold text-slate-700 bg-red-50/50 border border-red-100/50 p-2.5 rounded-xl">
                                                        <span>{t('book_service.home_charges', 'Home Charges')}</span>
                                                        <span className="text-[#FF0B01]">₹{homeServiceCharges}</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">{t('book_service.delivery_address', 'Delivery Address')} <span className="text-[#FF0B01] font-black">*</span></label>
                                                    <textarea
                                                        rows={2}
                                                        value={homeAddress}
                                                        onChange={(e) => setHomeAddress(e.target.value)}
                                                        placeholder={t('book_service.address_placeholder', 'Enter complete home address')}
                                                        className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl outline-none focus:border-[#FF0B01] transition-all bg-slate-50"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm font-black text-slate-950 pt-2.5 border-t border-dashed border-slate-100">
                                            <span>{t('book_service.grand_total', 'Grand Total')}</span>
                                            <span className="text-base text-[#FF0B01] font-black">₹{grandTotal}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Promo Download App callout
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center">
                            <Smartphone className="w-8 h-8 text-[#FF0B01] mx-auto mb-3" />
                            <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                                Get Into Neoparlour App Today!
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                                Your All in One Solution for Salons, Spas, and Wellness right in your pocket.
                            </p>

                            <div className="flex flex-col gap-2.5 mt-5">
                                <a
                                    href="#"
                                    className="flex items-center bg-black text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all justify-center h-12 shadow-sm"
                                >
                                    <img src={appleIcon} alt="App Store" className="w-5 h-5 mr-2" />
                                    <div className="text-left leading-none">
                                        <span className="text-[8px] uppercase tracking-wider block text-gray-400">Download on</span>
                                        <span className="text-xs font-bold font-sans block mt-0.5">App Store</span>
                                    </div>
                                </a>

                                <a
                                    href="#"
                                    className="flex items-center bg-[#FF0B01] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all justify-center h-12 shadow-sm"
                                >
                                    <img src={playstoreIcon} alt="Google Play" className="w-5 h-5 mr-2" />
                                    <div className="text-left leading-none">
                                        <span className="text-[8px] uppercase tracking-wider block text-red-200">Get it on</span>
                                        <span className="text-xs font-bold font-sans block mt-0.5">Google Play</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                        */ }

                        {/* Select Expert Section */}
                        <section ref={staffSectionRef} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                                <Sparkles className="w-4.5 h-4.5 text-[#FF0B01]" /> {t('book_service.select_expert', 'Select Expert')}
                            </h3>
                            {(firstSelected === 'slot' && availableStaffLoading) || !staffLoaded ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 yt-skeleton rounded-full"></div>
                                                <div className="space-y-1.5">
                                                    <div className="h-4 yt-skeleton rounded w-28"></div>
                                                    <div className="h-3 yt-skeleton rounded w-16"></div>
                                                </div>
                                            </div>
                                            <div className="h-8 w-16 yt-skeleton rounded-xl"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {displayedStaffList.length === 0 ? (
                                        <div className="text-center py-8 text-xs text-red-500 font-bold uppercase tracking-wider bg-red-50/50 rounded-2xl border border-red-100 p-4">
                                            {t('book_service.no_stylists', 'No stylists available for the selected slot. Please select a different slot.')}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Auto-Assign slot */}
                                            <div 
                                                onClick={() => {
                                                    setSelectedExpert('any');
                                                    setStaffSlots([]);
                                                }}
                                                className={`relative bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                                                    selectedExpert === 'any' 
                                                        ? 'border-[#FF0B01] bg-red-50/[0.01]' 
                                                        : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className={`w-20 h-24 rounded-xl flex flex-col items-center justify-center border-2 transition-all shrink-0 ${
                                                    selectedExpert === 'any' ? 'border-[#FF0B01] bg-red-50 text-[#FF0B01]' : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                                                }`}>
                                                    <Sparkles className={`w-6 h-6 ${selectedExpert === 'any' ? 'text-[#FF0B01] animate-pulse' : 'text-slate-400'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-black text-slate-900 uppercase">{t('book_service.no_preference', 'No Preference')}</h4>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 self-stretch justify-between shrink-0">
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        {t('book_service.instant', 'Instant')}
                                                    </span>
                                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 w-16 text-center ${
                                                        selectedExpert === 'any' ? 'bg-[#FF0B01] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {selectedExpert === 'any' ? t('book_service.selected', 'Selected') : t('book_service.select_btn', 'Select')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stylists roster list */}
                                            {displayedStaffList.map((staff, index) => {
                                                const isSelectedExp = selectedExpert === staff.id;
                                                const role = staff.speciality || ['Hair Stylist', 'Skin Specialist', 'Makeup Artist', 'General Expert'][index % 4];
                                                return (
                                                    <div 
                                                        key={staff.id} 
                                                        className={`relative bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all duration-300 ${
                                                            isSelectedExp ? 'ring-1 ring-[#FF0B01]/30 border-[#FF0B01]/50' : ''
                                                        }`}
                                                    >
                                                        {/* Stylist Image left block */}
                                                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-50 relative shrink-0">
                                                            {staff.imageUrl || staff.imagePath ? (
                                                                <img 
                                                                    src={staff.imageUrl || staff.imagePath} 
                                                                    alt={staff.name} 
                                                                    className="w-full h-full object-cover" 
                                                                    onError={(e) => {
                                                                        e.target.src = staff.gender === 'FEMALE' 
                                                                            ? 'https://cdn-icons-png.flaticon.com/512/6997/6997671.png'
                                                                            : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <img 
                                                                    src={staff.gender === 'FEMALE' 
                                                                        ? 'https://cdn-icons-png.flaticon.com/512/6997/6997671.png'
                                                                        : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                                                                    alt={staff.name} 
                                                                    className="w-full h-full object-cover" 
                                                                />
                                                            )}
                                                            {/* bottom name overlay inside image */}
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-center">
                                                                <span className="text-[9px] font-bold text-white block truncate">{staff.name}</span>
                                                                <span className="text-[7px] text-slate-350 block truncate leading-none mt-0.5">{role}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Center details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-black text-slate-900 uppercase">{staff.name}</h4>
                                                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{role}</p>
                                                            
                                                            {/* Star Rating - use actual rating */}
                                                            {staff.rating != null && (
                                                                <div className="flex items-center gap-1 mt-1.5">
                                                                    <div className="flex items-center">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star key={i} className={`w-3 h-3 ${
                                                                                i < Math.round(parseFloat(staff.rating))
                                                                                    ? 'text-amber-400 fill-amber-400'
                                                                                    : 'text-slate-200'
                                                                            }`} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-600">{parseFloat(staff.rating).toFixed(1)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Right selection button */}
                                                        <div className="flex flex-col items-end gap-3 self-stretch justify-between shrink-0">
                                                            {/* Dynamic Availability status */}
                                                            {availableStaffLoading ? (
                                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
                                                                    {t('book_service.checking', 'Checking...')}
                                                                </span>
                                                            ) : selectedSlot && availableStaffList.length > 0 ? (
                                                                availableStaffIds.has(staff.id) ? (
                                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                        {t('book_service.available', 'Available')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                        {t('book_service.unavailable', 'Unavailable')}
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                    {t('book_service.available', 'Available')}
                                                                </span>
                                                            )}
                                                            
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedExpert(staff.id)}
                                                                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-300 w-16 shadow-sm ${
                                                                    isSelectedExp
                                                                        ? 'bg-[#FF0B01] text-white hover:bg-red-700'
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                }`}
                                                            >
                                                                {isSelectedExp ? t('buttons.added', 'Added') : t('buttons.add', 'Add')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Booking Trigger button and disclaimer */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
                            <button
                                type="button"
                                onClick={handleBookClick}
                                className="w-full max-w-md bg-gradient-to-b from-[#FF0B01] to-[#D00600] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-red-500/15"
                            >
                                Book and Pay After Services
                            </button>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                                By booking an appointment, you agree to our{' '}
                                <span className="text-slate-650 underline cursor-pointer" onClick={() => navigate('/terms-and-conditions')}>Terms of Service</span>{' '}
                                and{' '}
                                <span className="text-slate-650 underline cursor-pointer" onClick={() => navigate('/privacy-policy')}>Privacy Policy</span>.
                            </p>
                        </div>

                    </div>
                </div>
            </main>

            {/* ==================== BILL DETAILS MODAL ==================== */}
            <BillDetails
                isOpen={isBillOpen}
                onClose={() => setIsBillOpen(false)}
                onConfirm={handleConfirmBooking}
                loading={bookingLoading}
                selectedServices={selectedServiceObjects}
                date={selectedDateObj ? `${selectedDateObj.num}-${selectedDateObj.month}-${selectedDateObj.year}` : ''}
                time={selectedTime}
                expert={selectedExpertObj}
                customerName={customerName}
                customerPhone={customerPhone}
                selectedOffer={selectedOffer}
                discountAmount={discountAmount}
                weekdayDiscountAmount={weekdayDiscountAmount}
                weekdayDiscountPercent={weekdayDiscountPercent}
                homeService={homeService}
                homeCharge={homeService ? homeServiceCharges : 0}
                address={homeService ? customerAddress : ''}
            />

            {/* ==================== APPOINTMENT BOOKED MODAL ==================== */}
            <AppointmentBooked
                isOpen={isBookedOpen}
                onClose={() => setIsBookedOpen(false)}
                selectedServices={selectedServiceObjects}
                date={selectedDateObj ? `${selectedDateObj.num}-${selectedDateObj.month}-${selectedDateObj.year}` : ''}
                time={selectedTime}
                expert={selectedExpertObj}
                customerName={customerName}
                customerPhone={customerPhone}
                selectedOffer={selectedOffer}
                discountAmount={discountAmount}
                weekdayDiscountAmount={weekdayDiscountAmount}
                homeService={homeService}
                homeCharge={homeService ? homeServiceCharges : 0}
                address={homeService ? customerAddress : ''}
            />

            {/* ==================== LOGIN PROMPT MODAL ==================== */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 transform scale-100">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[80px]" />
                        
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon container */}
                            <div className="w-16 h-16 bg-red-50 rounded-[24px] flex items-center justify-center shadow-lg shadow-red-500/10 shrink-0">
                                <Sparkles className="w-8 h-8 text-[#FF0B01] animate-pulse" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('book_service.login_required', 'Login Required')}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    {t('book_service.login_required_msg', 'To confirm your slot and book this appointment, please log in to your account. We will preserve your selected services and booking details!')}
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="w-full space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLoginPrompt(false);
                                        navigate('/customer/login', {
                                            state: {
                                                from: location.pathname,
                                                bookingState: {
                                                    addedServices,
                                                    selectedDateObj,
                                                    selectedTime,
                                                    selectedExpert,
                                                    selectedOffer
                                                }
                                            }
                                        });
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-red-500/15"
                                >
                                    {t('book_service.log_in_now', 'Log In Now')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPrompt(false)}
                                    className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 border border-slate-150"
                                >
                                    {t('book_service.cancel', 'Cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ==================== DISCARD OFFER CONFIRMATION MODAL ==================== */}
            {showDiscardOfferModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 transform scale-100">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[80px]" />
                        
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon container */}
                            <div className="w-16 h-16 bg-red-50 rounded-[24px] flex items-center justify-center shadow-lg shadow-red-500/10 shrink-0">
                                <svg className="w-8 h-8 text-[#FF0B01]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('book_service.discard_offer_title', 'Discard Offer?')}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    {t('book_service.discard_offer_desc', 'Deselecting this service will remove your currently selected offer and its associated services. Do you want to proceed?')}
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="w-full space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleDiscardOffer();
                                        setShowDiscardOfferModal(false);
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-red-500/15"
                                >
                                    {t('book_service.yes_discard', 'Yes, Discard Offer')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDiscardOfferModal(false)}
                                    className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 border border-slate-150"
                                >
                                    {t('book_service.no_keep', 'No, Keep Offer')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Mobile Bottom Bar for Quick Booking Summary */}
            {selectedServiceObjects.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-300">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {selectedServiceObjects.length} {selectedServiceObjects.length === 1 ? 'Service' : 'Services'}
                        </span>
                        <span className="text-sm font-black text-[#FF0B01]">₹{grandTotal}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (dateTimeSectionRef.current) {
                                dateTimeSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="bg-gradient-to-r from-[#FF0B01] to-[#D00600] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-red-500/20 active:scale-95 transition-all"
                    >
                        {t('buttons.proceed_to_book', 'Proceed to Book')}
                    </button>
                </div>
            )}

        </div>
    );
};

export default SelectService;
