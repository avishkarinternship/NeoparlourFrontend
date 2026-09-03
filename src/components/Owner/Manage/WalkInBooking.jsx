import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import BillingSummaryCard from '../../common/BillingSummaryCard';
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
    Heart,
    Lock,
    AlertTriangle,
    Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

// Imported Layout Components
import BillDetails from '../../Customer/BillDetails.jsx';
import AppointmentBooked from '../../Customer/AppointmentBooked.jsx';
import InviteCustomerAnimationModal from '../../common/InviteCustomerAnimationModal.jsx';

// Local SVG and Image Assets from Logos and BookingScreen
import hairLogo from '../../../assets/Logos/Hair.svg';
import skinCareLogo from '../../../assets/Logos/Skin care.svg';
import hairRemovalLogo from '../../../assets/Logos/Hair removal.svg';
import nailCareLogo from '../../../assets/Logos/Nail care.svg';
import makeupLogo from '../../../assets/Logos/makeup.svg';
import groomingLogo from '../../../assets/Logos/grooming.svg';
import spaMassageLogo from '../../../assets/Logos/spa & massage.svg';
import hairStylingLogo from '../../../assets/Logos/Hair Styling.svg';
import hairTreatmentLogo from '../../../assets/Logos/Hair treatment.svg';
import hairColoringLogo from '../../../assets/Logos/Hair coloring.svg';
import hairSpaLogo from '../../../assets/Logos/Hair spa.svg';
import hairWashLogo from '../../../assets/Logos/Hair wash.svg';
import shavingLogo from '../../../assets/Logos/Shaving.svg';
import appleIcon from '../../../assets/Customer/BookingScreen/apple_icon.svg';
import playstoreIcon from '../../../assets/Customer/BookingScreen/playstore_icon.svg';

import expertOneImg from '../../../assets/Customer/BookingScreen/Expert_One.png';
import expertTwoImg from '../../../assets/Customer/BookingScreen/Expert_Two.png';
import expertThreeImg from '../../../assets/Customer/BookingScreen/Expert_Three.png';

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

const WalkInBooking = ({ onBookingSuccess, isDarkMode: isDarkModeProp, isStaffPortal, staffOnlyId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const outletContext = useOutletContext() || {};
    const isDarkMode = isDarkModeProp !== undefined ? isDarkModeProp : (outletContext.isDarkMode || document.documentElement.classList.contains('dark'));
    const activeSalonId = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    const ownerStaffToken = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');

    const currentStaffId = staffOnlyId || (isStaffPortal ? (localStorage.getItem('staff_id') || localStorage.getItem('user_id')) : null);
    const isStaffMode = !!isStaffPortal || (!!currentStaffId && !location.pathname.startsWith('/owner'));

    const servicesSectionRef = useRef(null);
    const staffSectionRef = useRef(null);
    const dateTimeSectionRef = useRef(null);

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
        return location.state?.selectedDateObj || nextDays[0];
    });
    const [selectedTime, setSelectedTime] = useState(() => {
        return location.state?.selectedTime || null;
    });
    const [selectedSlot, setSelectedSlot] = useState(() => {
        return location.state?.selectedSlot || null;
    }); // Full slot object {startTime, displayTime}

    // --- API-BASED SLOT & AVAILABILITY STATE ---
    const [salonSlots, setSalonSlots] = useState([]);       // All salon slots for the day
    const [staffSlots, setStaffSlots] = useState([]);       // Slots filtered for selected staff
    const [availableStaffList, setAvailableStaffList] = useState([]); // Staff available at selected time
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [availableStaffLoading, setAvailableStaffLoading] = useState(false);

    const [selectedExpert, setSelectedExpert] = useState(() => {
        if (currentStaffId) return String(currentStaffId);
        return location.state?.selectedExpert || 'any';
    });

    useEffect(() => {
        if (isStaffMode && currentStaffId) {
            setSelectedExpert(String(currentStaffId));
        }
    }, [isStaffMode, currentStaffId]);

    const [firstSelected, setFirstSelected] = useState(() => {
        if (location.state?.selectedSlot) {
            return 'slot';
        }
        if (location.state?.selectedExpert && location.state.selectedExpert !== 'any') {
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
    const [isWalkInPopupOpen, setIsWalkInPopupOpen] = useState(false);
    const [isBillOpen, setIsBillOpen] = useState(false);
    const [isBookedOpen, setIsBookedOpen] = useState(false);
    const [walkInName, setWalkInName] = useState('');
    const [walkInPhone, setWalkInPhone] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showDiscardOfferModal, setShowDiscardOfferModal] = useState(false);
    const [showBanWarningModal, setShowBanWarningModal] = useState(false);

    // --- INVITE ANIMATION STATES ---
    const [inviteAnimationOpen, setInviteAnimationOpen] = useState(false);
    const [inviteAnimationType, setInviteAnimationType] = useState('NEW_INVITE'); // 'NEW_INVITE' | 'ALREADY_REGISTERED'
    const [inviteAnimationPoints, setInviteAnimationPoints] = useState(3);
    const [inviteAnimationMessage, setInviteAnimationMessage] = useState('');

    const handleInviteAndBook = async () => {
        if (!walkInName.trim()) {
            toast.error('Please enter customer name.');
            return;
        }
        if (!walkInPhone.trim()) {
            toast.error('Please enter customer mobile number.');
            return;
        }
        if (walkInPhone.length !== 10 || !/^[0-9]{10}$/.test(walkInPhone)) {
            toast.error('Mobile number must be exactly 10 digits.');
            return;
        }

        setIsWalkInPopupOpen(false);
        await handleConfirmBooking();
    };

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
        
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const parts = formatter.formatToParts(date);
        const getPart = (type) => parts.find(p => p.type === type)?.value;
        let hourVal = getPart('hour');
        if (hourVal === '24') hourVal = '00';
        return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${hourVal}:${getPart('minute')}:${getPart('second')}.000+05:30`;
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
        if (!activeSalonId || activeSalonId === 'SYSTEM' || isNaN(Number(activeSalonId))) {
            toast.error('No active salon selected. Redirecting to dashboard.');
            navigate('/owner/dashboard');
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

        fetchSalonDetails();
    }, [activeSalonId, navigate]);

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

    // --- FETCH STAFF-SPECIFIC SLOTS when expert selected ---
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
                axiosInstance.get('/services/public/categories', {
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
        if (homeService && !customerAddress.trim()) {
            toast.error('Please enter complete address for home service.');
            return;
        }
        if (!selectedSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }
        if (checkConflict(selectedSlot, durationMinutes)) {
            toast.error("Overlapping error: Selected services and slot conflict with an existing appointment. Please choose a different time slot.", {
                style: { background: '#7f1d1d', color: '#fecaca', borderRadius: '16px', padding: '16px 24px' }
            });
            return;
        }
        if (!ownerStaffToken) {
            toast.error('Authentication expired. Please log in.');
            navigate('/owner/login');
            return;
        }
        if (salon?.banned || salon?.isBanned) {
            setShowBanWarningModal(true);
            return;
        }
        setIsWalkInPopupOpen(true);
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
        'haircut': hairLogo,
        'hair cut': hairLogo,
        'hair services': hairLogo,
        'hair': hairLogo,
        'coloring': hairColoringLogo,
        'hair coloring': hairColoringLogo,
        'hairspa': hairSpaLogo,
        'hair spa': hairSpaLogo,
        'hairstyling': hairStylingLogo,
        'hair styling': hairStylingLogo,
        'shaving': shavingLogo,
        'hair wash': hairWashLogo,
        'hairwash': hairWashLogo,
        'straightening': hairStylingLogo,
        'straightning': hairStylingLogo,
        'skin care': skinCareLogo,
        'skin': skinCareLogo,
        'hair removal': hairRemovalLogo,
        'nail care': nailCareLogo,
        'makeup': makeupLogo,
        'grooming': groomingLogo,
        'spa & massage': spaMassageLogo,
        'spa and massage': spaMassageLogo,
        'spa': spaMassageLogo,
        'massage': spaMassageLogo,
        'bridal packages': hairStylingLogo,
        'bridal': hairStylingLogo,
        'hair treatment': hairTreatmentLogo,
    };

    // Filtered services
    const filteredServicesList = services.filter(s => {
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
        if (!walkInName.trim()) {
            toast.error('Please enter customer name.');
            return;
        }
        if (!walkInPhone.trim()) {
            toast.error('Please enter customer mobile number.');
            return;
        }
        if (walkInPhone.length !== 10 || !/^[0-9]{10}$/.test(walkInPhone)) {
            toast.error('Mobile number must be exactly 10 digits.');
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
                userId: null,
                customerId: null,
                salonId: parseInt(activeSalonId, 10),
                staffId: selectedExpert && selectedExpert !== 'any' ? parseInt(selectedExpert, 10) : null,
                staffName: selectedExpertObj?.name && selectedExpertObj.name !== 'No Preference' ? selectedExpertObj.name : null,
                customerName: walkInName,
                customerNumber: walkInPhone,
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

            const res = await axiosInstance.post('/appointments/walk-in', bookingPayload);
            const responseData = res.data || {};
            
            // Backend response payload: { appointment, referralPointsClaimed, referralMessage, newCustomer }
            const isNew = responseData.newCustomer !== undefined ? responseData.newCustomer : responseData.isNewCustomer;
            const points = responseData.referralPointsClaimed;
            const msg = responseData.referralMessage;

            if (isNew === true && (points > 0 || (points === undefined && msg?.includes('claimed')))) {
                // 🎁 Scenario 1: Brand New Customer -> 3 Points Claimed
                const pts = points || 3;
                setInviteAnimationType('NEW_INVITE');
                setInviteAnimationPoints(pts);
                setInviteAnimationMessage(msg || `🎉 Appointment Booked! +${pts} Referral Points credited to Staff!`);
                setInviteAnimationOpen(true);
                toast.success(msg || `🎉 Appointment Booked! +${pts} Referral Points credited to Staff!`, { duration: 5000 });
            } else if (isNew === true && points === 0) {
                // ⚠️ Scenario 2: Unregistered Customer with Existing Invite -> Re-invited, 0 Points
                setInviteAnimationType('RE_INVITED');
                setInviteAnimationPoints(0);
                setInviteAnimationMessage(msg || 'An invite has already been sent to this customer. No reward points claimed.');
                setInviteAnimationOpen(true);
                toast(msg || 'An invite has already been sent to this customer. No reward points claimed.', {
                    icon: '⚠️',
                    duration: 6000
                });
            } else if (isNew === false) {
                // ℹ️ Scenario 3: Already Registered Customer -> 0 Points
                setInviteAnimationType('ALREADY_REGISTERED');
                setInviteAnimationPoints(0);
                setInviteAnimationMessage(msg || 'Customer is already registered. No referral points claimed.');
                setInviteAnimationOpen(true);
                toast(msg || 'Customer is already registered. No referral points claimed.', {
                    icon: 'ℹ️',
                    duration: 5000
                });
            } else {
                // Fallback for response payloads without newCustomer field
                if (msg) {
                    toast(msg, { icon: 'ℹ️' });
                } else {
                    toast.success('Walk-in appointment booked successfully!');
                }
                setIsBookedOpen(true);
            }

            setIsWalkInPopupOpen(false);
        } catch (error) {
            console.error('[WalkInBooking] Error booking walk-in appointment:', error);
            const status = error.response?.status;
            const message = String(error.response?.data?.message || error.message || '');
            
            if (status === 401 || status === 403 || message.toLowerCase().includes('token') || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('not logged in')) {
                toast.error('Session expired. Please log in.');
                navigate('/owner/login');
            } else {
                setInviteAnimationType('FAILURE');
                setInviteAnimationMessage(message || 'Failed to book walk-in appointment. Please check details and try again.');
                setInviteAnimationOpen(true);
                toast.error(message || 'Failed to book walk-in appointment. Please try again.');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex-1 flex flex-col items-center justify-center py-32 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : ''}`}>
                <div className="animate-spin h-12 w-12 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-4 shadow-sm"></div>
                <p className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Syncing Booking Portal...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-slate-800'} flex flex-col font-sans antialiased transition-colors duration-300`}>

            {/* ==================== BREADCRUMBS ==================== */}
            <nav className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} border-b py-3.5 shadow-sm`}>
                <div className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'} flex items-center gap-1.5 font-bold uppercase tracking-widest`}>
                    <span className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => navigate('/owner/dashboard')}>Dashboard</span>
                    <span>&gt;</span>
                    <span className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => navigate('/owner/manage/schedule')}>Manage</span>
                    <span>&gt;</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-black`}>Walk-in Booking</span>
                </div>
            </nav>

            {/* ==================== MAIN CONTENT ==================== */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

                {/* Header Block */}
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} p-6 rounded-3xl border shadow-sm`}>
                    <div className="min-w-0 flex-1 space-y-2.5">
                        <h1 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'} tracking-tight uppercase`}>
                            {salon?.name || salon?.salonName || 'Salon Details'}
                        </h1>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'} font-bold flex items-center gap-1.5 uppercase`}>
                            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{salon?.address || [salon?.areaName, salon?.cityName].filter(Boolean).join(', ') || 'No address specified'}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                                isSalonOpenNow() 
                                    ? (isDarkMode ? 'bg-green-950/40 border border-green-800/50 text-green-400' : 'bg-green-50 border border-green-200 text-green-700')
                                    : (isDarkMode ? 'bg-red-950/40 border border-red-800/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-600')
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSalonOpenNow() ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
                                <span className="whitespace-nowrap">{isSalonOpenNow() ? 'Open Now' : 'Closed'}</span>
                                <span className={isDarkMode ? "text-slate-700" : "text-zinc-300"}>|</span>
                                <span className="whitespace-nowrap">{salon?.openingTime ? formatTimeStr(salon.openingTime) : '10:00 AM'} - {salon?.closingTime ? formatTimeStr(salon.closingTime) : '10:00 PM'}</span>
                            </div>
                            {salon?.salonCode && (
                                <span className={`text-[9px] font-bold ${isDarkMode ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-slate-50 text-slate-450 border-slate-150/60'} border px-2.5 py-1.5 rounded uppercase tracking-widest`}>
                                    Code: {salon.salonCode}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-center">
                        <button 
                            type="button" 
                            onClick={handleShare}
                            className={`p-2.5 border ${isDarkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'} rounded-2xl transition shadow-sm cursor-pointer`}
                            title="Share Salon"
                        >
                            <Share2 className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>

                {/* Master Two-Column Flex Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start w-full">

                    {/* LEFT CONTAINER CANVAS (60% Width) */}
                    <div className="w-full lg:w-[60%] shrink-0 space-y-8">

                        {/* Services Picker Section */}
                        <section ref={servicesSectionRef} id="walkin-services-section" className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} p-6 sm:p-8 rounded-3xl border shadow-sm min-h-[180px]`}>
                            {!servicesLoaded ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin h-8 w-8 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                    <p className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Loading catalog...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                                            <Scissors className="w-4.5 h-4.5 text-[#FF0B01]" /> Select Services
                                        </h3>
                                        {/* Gender filter dropdown */}
                                        <div className="relative">
                                            <select 
                                                value={selectedGender} 
                                                onChange={(e) => setSelectedGender(e.target.value)}
                                                className={`appearance-none ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'} border rounded-xl px-4 py-2.5 pr-10 text-xs font-bold outline-none focus:border-red-500 cursor-pointer shadow-sm transition-all`}
                                            >
                                                <option value="All">All Genders</option>
                                                <option value="Male">Male Only</option>
                                                <option value="Female">Female Only</option>
                                            </select>
                                            <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-450'} absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`} />
                                        </div>
                                    </div>

                                    {categories.length > 0 ? (
                                        <div className={`flex items-center gap-3.5 overflow-x-auto pb-4 mb-6 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'} scrollbar-none`}>
                                            {/* All Services Tab */}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategory('All')}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[90px] h-[90px] transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                                                    selectedCategory.toLowerCase() === 'all'
                                                        ? 'border-[#FF0B01] bg-gradient-to-b from-[#FF0B01] to-[#D00600] text-white shadow-md shadow-red-500/10'
                                                        : (isDarkMode ? 'border-zinc-800 bg-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm')
                                                }`}
                                            >
                                                <Sparkles
                                                    className={`w-7 h-7 mb-1.5 ${selectedCategory.toLowerCase() === 'all' ? 'text-white' : (isDarkMode ? 'text-zinc-400' : 'text-zinc-500')}`}
                                                />
                                                <span className="text-[10px] font-black tracking-tight uppercase line-clamp-1">All</span>
                                            </button>

                                            {categories.map((catName) => {
                                                const catLower = catName.toLowerCase();
                                                const isActive = selectedCategory === catName;
                                                const catIcon = categoryIcons[catLower] || hairLogo;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={catName}
                                                        onClick={() => setSelectedCategory(catName)}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[90px] h-[90px] transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                                                            isActive
                                                                ? 'border-[#FF0B01] bg-gradient-to-b from-[#FF0B01] to-[#D00600] text-white shadow-md shadow-red-500/10'
                                                                : (isDarkMode ? 'border-zinc-800 bg-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm')
                                                        }`}
                                                    >
                                                        <img
                                                            src={catIcon}
                                                            alt={catName}
                                                            className={`w-7 h-7 object-contain mb-1.5 ${isActive ? 'invert brightness-0' : (isDarkMode ? 'opacity-75 hover:opacity-100 transition-opacity' : 'opacity-90')}`}
                                                        />
                                                        <span className="text-[10px] font-black tracking-tight uppercase line-clamp-1">{catName}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className={`text-center py-6 text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'} font-bold uppercase tracking-wider`}>No Categories Found.</div>
                                    )}

                                    {/* Selected Offer Services Section */}
                                    {selectedOffer && selectedOffer.services && selectedOffer.services.length > 0 && (
                                        <div className={`mb-8 p-5 ${isDarkMode ? 'bg-zinc-800/90 border-red-900/50' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-150'} rounded-3xl border shadow-sm relative overflow-hidden`}>
                                            {/* Decorative background accent */}
                                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-500/5 rounded-full" />
                                            
                                            <div className={`flex items-center justify-between border-b ${isDarkMode ? 'border-zinc-700' : 'border-red-100'} pb-3 mb-4`}>
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-[#FF0B01] animate-pulse shrink-0" />
                                                    <div>
                                                        <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tight`}>
                                                            {selectedOffer.name} Special Bundle
                                                        </h4>
                                                        <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} font-bold uppercase tracking-wider mt-0.5`}>
                                                            Services Included ({selectedOffer.percentage}% OFF Applied)
                                                        </p>
                                                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] font-extrabold uppercase tracking-wider">
                                                            <span className={`px-2.5 py-1 ${isDarkMode ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300' : 'bg-white/80 border-slate-200/50 text-zinc-500'} border rounded-lg shadow-sm`}>
                                                                Services Amount: <span className="line-through text-zinc-400 font-bold ml-1">₹{offerOriginalTotal}</span>
                                                            </span>
                                                            <span className={`px-2.5 py-1 ${isDarkMode ? 'bg-green-950/40 border-green-800/50 text-green-400' : 'bg-green-50/80 border-green-100 text-green-700'} border rounded-lg shadow-sm`}>
                                                                Discount: <span className="font-black ml-1">-₹{offerDiscount}</span>
                                                            </span>
                                                            <span className={`px-2.5 py-1 ${isDarkMode ? 'bg-red-950/40 border-red-800/50 text-white' : 'bg-red-50/80 border-red-100 text-slate-900'} border rounded-lg shadow-sm`}>
                                                                Difference/Final: <span className="text-[#FF0B01] font-black ml-1">₹{offerFinalTotal}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={handleDiscardOffer}
                                                    className="px-3.5 py-1.5 bg-[#FF0B01] hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm shadow-red-500/10 shrink-0"
                                                >
                                                    Discard Offer
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
                                                            className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-900' : 'bg-white'} border transition-all duration-300 flex items-center justify-between gap-3 shadow-sm ${
                                                                isAdded 
                                                                    ? 'border-[#FF0B01] bg-[#FF0B01]/[0.01]' 
                                                                    : (isDarkMode ? 'border-zinc-800 opacity-65 hover:opacity-100 hover:border-zinc-700' : 'border-slate-100 opacity-65 hover:opacity-100 hover:border-slate-200')
                                                            }`}
                                                        >
                                                            <div className="min-w-0">
                                                                <h5 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase truncate`}>
                                                                    {service.name}
                                                                </h5>
                                                                <div className={`flex items-center gap-3 mt-1 text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'} font-bold uppercase tracking-wider`}>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-450'} shrink-0`} />
                                                                        {actualService.duration || actualService.durationMinutes || service.duration || service.durationMinutes || 30} Min
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1.5 font-bold">
                                                                        <span className="line-through text-zinc-400 font-semibold">₹{originalPrice}</span>
                                                                        <span className="text-[#FF0B01] font-black">₹{discountedPrice}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleServiceToggle(service.id)}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 w-16 text-center ${
                                                                    isAdded 
                                                                        ? (isDarkMode ? 'bg-red-950/60 text-[#FF0B01] border border-red-900/50' : 'bg-red-50 text-[#FF0B01] border border-red-100')
                                                                        : (isDarkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                                                                }`}
                                                            >
                                                                {isAdded ? 'Added' : 'Add'}
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
                                                    className={`flex gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                                                        isAdded 
                                                            ? 'border-[#FF0B01] bg-[#FF0B01]/[0.02] shadow-sm shadow-[#FF0B01]/5 ring-1 ring-[#FF0B01]/10' 
                                                            : isDarkMode 
                                                              ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:shadow-md' 
                                                              : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/50'
                                                    }`}
                                                >
                                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                                                        isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50'
                                                    }`}>
                                                        <Scissors className="w-7 h-7 text-zinc-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className={`text-sm sm:text-base font-bold tracking-tight uppercase leading-tight ${
                                                                isDarkMode ? 'text-white' : 'text-slate-900'
                                                            }`}>{service.name}</h4>
                                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-zinc-500'
                                                            }`}>
                                                                {service.category}
                                                            </span>
                                                            {isOfferIncluded && (
                                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                                                                    isDarkMode ? 'bg-red-950/40 text-[#FF0B01]' : 'bg-red-50 text-[#FF0B01]'
                                                                }`}>
                                                                    <Sparkles className="w-2.5 h-2.5 animate-pulse shrink-0" /> Offer Included
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={`text-xs mt-1 flex items-center gap-1.5 font-medium ${
                                                            isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                                                        }`}>
                                                            <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-450'}`} />
                                                            Approx. {service.duration || 30} Min duration
                                                        </p>
                                                        <p className={`text-base font-black mt-2 ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>₹{service.price}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleServiceToggle(service.id)}
                                                            className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 w-24 hover:scale-105 active:scale-95 shadow-sm ${
                                                                isAdded
                                                                    ? 'bg-[#FF0B01] text-white hover:bg-red-700 shadow-red-500/10'
                                                                    : isDarkMode 
                                                                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                                                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {isAdded ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    <span>Added</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                                    <span>Add</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {filteredServicesList.length === 0 && (
                                            <div className="text-center py-8 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                                No services found matching filters.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Calendar Selector Component */}
                        <section ref={dateTimeSectionRef} id="walkin-datetime-section" className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} p-6 sm:p-8 rounded-3xl border shadow-sm`}>
                            <h3 className={`text-sm font-black uppercase tracking-wider mb-5 flex items-center gap-2 ${
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                                <Calendar className="w-4.5 h-4.5 text-[#FF0B01]" /> Select Date and Time
                            </h3>
                            
                            {/* Months Indicator header */}
                            <div className={`flex items-center justify-between border-b pb-4 mb-5 text-xs font-black tracking-wider ${
                                isDarkMode ? 'border-zinc-800 text-zinc-400' : 'border-slate-100 text-slate-700'
                            }`}>
                                <span className={`uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedDateObj?.month || 'Date'}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${
                                        isDarkMode ? 'bg-red-950/40 text-red-400 border border-red-900/50' : 'bg-red-50 text-[#FF0B01]'
                                    }`}>
                                        Year {selectedDateObj?.year || '2026'}
                                    </span>
                                </div>
                            </div>

                            {/* Scroller Days Container */}
                            <div className={`flex gap-2.5 overflow-x-auto pb-4 border-b scrollbar-none ${
                                isDarkMode ? 'border-zinc-800' : 'border-slate-100'
                            }`}>
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
                                                    : isDarkMode 
                                                      ? 'text-zinc-400 bg-zinc-800 border border-zinc-700/60 hover:bg-zinc-700 hover:text-zinc-200' 
                                                      : 'text-zinc-400 bg-slate-50 border border-slate-100 hover:bg-white hover:text-slate-700 hover:shadow-sm'
                                            }`}
                                        >
                                            <span className="text-[10px] font-extrabold uppercase mb-1">{d.day}</span>
                                            <span className={`text-sm font-black ${isSelectedDate ? 'text-white' : (isDarkMode ? 'text-zinc-100' : 'text-slate-900')}`}>{d.num}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time Slots grid */}
                            {slotsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 mt-5">
                                    <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading available slots...</p>
                                </div>
                            ) : displayedSlots.length === 0 ? (
                                <div className="text-center py-8 mt-5">
                                    <Clock className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No slots available for this day</p>
                                    {selectedExpert && selectedExpert !== 'any' && (
                                        <p className="text-[10px] text-slate-350 font-medium mt-1">Try selecting a different date or "No Preference"</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mt-5">
                                    {/* Conflict legend — shown only when a slot is selected and services have duration */}
                                    {selectedSlot && durationMinutes > 0 && occupiedSlotTimes.size > 0 && (
                                        <div className="col-span-full mb-1 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block border border-amber-500"></span>
                                                <span className="text-zinc-500">Appointment window</span>
                                            </span>
                                            {displayedSlots.some(s => occupiedSlotTimes.has(s.startTime) && s.busy) && (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded-sm bg-red-400 inline-block border border-red-500"></span>
                                                    <span className="text-red-500">Conflict — slot already booked</span>
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
                                            slotClass = isDarkMode 
                                                ? 'bg-zinc-800/40 border-zinc-700/60 text-zinc-500 line-through cursor-not-allowed opacity-50' 
                                                : 'bg-slate-100 border-slate-200 text-zinc-400 line-through cursor-not-allowed opacity-60';
                                        } else if (isConflict) {
                                            slotClass = isDarkMode 
                                                ? 'bg-red-950/40 border-red-800 text-red-400 cursor-not-allowed ring-2 ring-red-900 ring-offset-zinc-950 animate-pulse' 
                                                : 'bg-red-100 border-red-400 text-red-600 cursor-not-allowed ring-2 ring-red-300 ring-offset-1 animate-pulse';
                                        } else if (isSelectedTime) {
                                            slotClass = 'bg-gradient-to-b from-[#FF0B01] to-[#D00600] border-transparent text-white shadow-md shadow-red-500/10 hover:scale-105 active:scale-95';
                                        } else if (isInWindow) {
                                            slotClass = isDarkMode 
                                                ? 'bg-amber-950/30 border-amber-850 text-amber-450 cursor-not-allowed ring-1 ring-amber-900' 
                                                : 'bg-amber-50 border-amber-400 text-amber-700 cursor-not-allowed ring-1 ring-amber-300';
                                        } else {
                                            slotClass = isDarkMode 
                                                ? 'border-zinc-800 text-zinc-300 bg-zinc-800/60 hover:bg-zinc-700 hover:border-zinc-600 hover:scale-105 active:scale-95' 
                                                : 'border-slate-100 text-slate-700 bg-slate-50 hover:bg-white hover:border-slate-300 hover:scale-105 active:scale-95';
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
                                                     <span className={`text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-full ${
                                                         isDarkMode ? 'bg-red-950/60 text-red-400' : 'bg-red-200 text-red-700'
                                                     }`}>
                                                         Conflict
                                                     </span>
                                                 )}
                                                 {isInWindow && !isConflict && (
                                                     <span className={`text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-full ${
                                                         isDarkMode ? 'bg-amber-950/50 text-amber-400' : 'bg-amber-100 text-amber-700'
                                                     }`}>
                                                         In use
                                                     </span>
                                                 )}
                                                 {!isInWindow && !isConflict && slot.discountPercentage > 0 && slot.discountMessage && (
                                                     <span className={`text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-full ${
                                                         isSelectedTime 
                                                             ? 'bg-white text-[#FF0B01]' 
                                                             : isDarkMode 
                                                               ? 'bg-emerald-950/50 text-emerald-400' 
                                                               : 'bg-green-100 text-green-700'
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
                        <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} p-6 sm:p-8 rounded-3xl border shadow-sm text-center space-y-4`}>
                            <button
                                type="button"
                                onClick={handleBookClick}
                                className="w-full max-w-md bg-gradient-to-b from-[#FF0B01] to-[#D00600] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md shadow-red-500/15"
                            >
                                Book and Pay After Services
                            </button>
                            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                                By booking an appointment, you agree to our{' '}
                                <span className="text-slate-650 underline cursor-pointer" onClick={() => navigate('/terms-and-conditions')}>Terms of Service</span>{' '}
                                and{' '}
                                <span className="text-slate-650 underline cursor-pointer" onClick={() => navigate('/privacy-policy')}>Privacy Policy</span>.
                            </p>
                        </div>

                    </div>

                    {/* RIGHT CONTAINER SIDEBAR (40% Width) */}
                    <div className="w-full lg:w-[40%] space-y-6 lg:sticky lg:top-6">

                        {/* Real-time Booking Summary Card */}
                        <section className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} p-6 rounded-3xl border shadow-sm space-y-4`}>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                                <Scissors className="w-4.5 h-4.5 text-[#FF0B01]" /> Booking Summary
                            </h3>
                            {selectedServiceObjects.length === 0 ? (
                                <div className="text-center py-6 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                    No services selected yet.
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
                                                        Discard
                                                    </button>
                                                </div>
                                                <div className="pl-2 border-l-2 border-red-200 space-y-2">
                                                    {selectedServiceObjects.filter(s => offerServiceIds.includes(s.id)).map(s => (
                                                        <div key={s.id} className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-700 uppercase leading-tight line-clamp-1">{s.name}</span>
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
                                                    <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                                                        Regular Services
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    {selectedServiceObjects.filter(s => !offerServiceIds.includes(s.id)).map(s => (
                                                        <div key={s.id} className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-700 uppercase leading-tight line-clamp-1">{s.name}</span>
                                                            <span className="font-extrabold text-slate-900">₹{s.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Cost breakdown ledger */}
                                    <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs font-semibold text-zinc-500">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span className="text-slate-800 font-bold">₹{serviceSubtotal}</span>
                                        </div>
                                        
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-[#FF0B01]" /> Offer Discount
                                                </span>
                                                <span className="font-bold">-₹{discountAmount}</span>
                                            </div>
                                        )}

                                        {/* Home Service toggle */}
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">Home Service?</span>
                                                <span className="text-[9px] text-zinc-400 font-medium normal-case">Avail services at your place</span>
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
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                                                <span className="w-3 h-3 border-2 border-[#FF0B01] border-t-transparent rounded-full animate-spin"></span>
                                                Fetching home charges...
                                            </div>
                                        )}

                                        {homeService && !fetchingHomeCharges && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {homeServiceCharges > 0 && (
                                                    <div className="flex justify-between text-xs font-bold text-slate-700 bg-red-50/50 border border-red-100/50 p-2.5 rounded-xl">
                                                        <span>Home Charges</span>
                                                        <span className="text-[#FF0B01]">₹{homeServiceCharges}</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-0.5">Delivery Address <span className="text-[#FF0B01] font-black">*</span></label>
                                                    <textarea
                                                        value={customerAddress}
                                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                                        placeholder="Enter complete home address"
                                                        rows="2"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition-all text-slate-700 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-dashed border-slate-100">
                                            <BillingSummaryCard
                                                subtotal={serviceSubtotal}
                                                discountAmount={discountAmount + weekdayDiscountAmount}
                                                homeCharge={homeService ? homeServiceCharges : 0}
                                                includeGst={Boolean(salon?.includeGstInInvoice)}
                                                gstin={salon?.gstin || ''}
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Promo Download App callout
                        <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm text-center`}>
                            <Smartphone className="w-8 h-8 text-[#FF0B01] mx-auto mb-3" />
                            <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                                Get Into Neoparlour App Today!
                            </h4>
                            <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">
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

                        {/* Select Expert Section - Hidden for Staff */}
                        {!isStaffMode && (
                            <section ref={staffSectionRef} id="walkin-staff-section" className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} p-6 rounded-3xl border shadow-sm space-y-4`}>
                                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b pb-3 mb-2 ${
                                    isDarkMode ? 'text-white border-zinc-800' : 'text-slate-900 border-slate-100'
                                }`}>
                                    <Sparkles className="w-4.5 h-4.5 text-[#FF0B01]" /> Select Expert
                                </h3>
                                {firstSelected === 'slot' && availableStaffLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Finding available stylists...</p>
                                    </div>
                                ) : !staffLoaded ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="animate-spin h-7 w-7 border-4 border-[#FF0B01] border-t-transparent rounded-full mb-3 shadow-sm"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Loading roster...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {displayedStaffList.length === 0 ? (
                                            <div className="text-center py-8 text-xs text-red-500 font-bold uppercase tracking-wider bg-red-50/50 rounded-2xl border border-red-100 p-4">
                                                No stylists available for the selected slot. Please select a different slot.
                                            </div>
                                        ) : (
                                            <>
                                                {/* Auto-Assign slot */}
                                                <div 
                                                    onClick={() => {
                                                        setSelectedExpert('any');
                                                        setStaffSlots([]);
                                                    }}
                                                    className={`relative border-2 rounded-2xl p-4 shadow-sm flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                                                        selectedExpert === 'any' 
                                                            ? 'border-[#FF0B01] bg-red-50/[0.01]' 
                                                            : isDarkMode 
                                                              ? 'bg-zinc-900 border-zinc-805 hover:border-zinc-700' 
                                                              : 'bg-white border-slate-100 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className={`w-20 h-24 rounded-xl flex flex-col items-center justify-center border-2 transition-all shrink-0 ${
                                                        selectedExpert === 'any' 
                                                            ? (isDarkMode ? 'border-[#FF0B01] bg-red-950/40 text-red-400' : 'border-[#FF0B01] bg-red-50 text-[#FF0B01]') 
                                                            : (isDarkMode ? 'border-dashed border-zinc-700 bg-zinc-850 text-zinc-500' : 'border-dashed border-slate-300 bg-slate-50 text-zinc-400')
                                                    }`}>
                                                        <Sparkles className={`w-6 h-6 ${selectedExpert === 'any' ? 'text-[#FF0B01] animate-pulse' : 'text-zinc-400'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Preference</h4>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3 self-stretch justify-between shrink-0">
                                                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            Instant
                                                        </span>
                                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 w-16 text-center ${
                                                            selectedExpert === 'any' 
                                                                ? 'bg-[#FF0B01] text-white shadow-sm' 
                                                                : isDarkMode 
                                                                  ? 'bg-zinc-800 text-zinc-350 hover:bg-zinc-700' 
                                                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-250'
                                                        }`}>
                                                            {selectedExpert === 'any' ? 'Selected' : 'Select'}
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
                                                            className={`relative rounded-2xl p-4 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all duration-300 border ${
                                                                isSelectedExp 
                                                                    ? 'ring-1 ring-[#FF0B01]/30 border-[#FF0B01]/50 bg-red-500/[0.01]' 
                                                                    : isDarkMode 
                                                                      ? 'bg-zinc-900 border-zinc-805 hover:border-zinc-700' 
                                                                      : 'bg-white border-slate-100 hover:border-slate-200'
                                                            }`}
                                                        >
                                                            {/* Stylist Image left block */}
                                                            <div className={`w-20 h-24 rounded-xl overflow-hidden relative shrink-0 ${
                                                                isDarkMode ? 'bg-zinc-805' : 'bg-slate-50'
                                                            }`}>
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
                                                                <h4 className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{staff.name}</h4>
                                                                <p className={`text-[10px] mt-0.5 font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>{role}</p>
                                                                
                                                                {/* Star Rating - use actual rating */}
                                                                {staff.rating != null && (
                                                                    <div className="flex items-center gap-1 mt-1.5">
                                                                        <div className="flex items-center">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <Star key={i} className={`w-3 h-3 ${
                                                                                    i < Math.round(parseFloat(staff.rating))
                                                                                        ? 'text-amber-400 fill-amber-400'
                                                                                        : isDarkMode ? 'text-zinc-800' : 'text-zinc-200'
                                                                                }`} />
                                                                            ))}
                                                                        </div>
                                                                        <span className={`text-[10px] font-black ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{parseFloat(staff.rating).toFixed(1)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Right selection button */}
                                                            <div className="flex flex-col items-end gap-3 self-stretch justify-between shrink-0">
                                                                {/* Dynamic Availability status */}
                                                                {availableStaffLoading ? (
                                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-zinc-400">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
                                                                        Checking...
                                                                    </span>
                                                                ) : selectedSlot && availableStaffList.length > 0 ? (
                                                                    availableStaffIds.has(staff.id) ? (
                                                                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                            Available
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-zinc-400">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                            Unavailable
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                        Available
                                                                    </span>
                                                                )}
                                                                
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedExpert(staff.id)}
                                                                    className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-300 w-16 shadow-sm ${
                                                                        isSelectedExp
                                                                            ? 'bg-[#FF0B01] text-white hover:bg-red-700'
                                                                            : isDarkMode 
                                                                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                                                                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                                >
                                                                    {isSelectedExp ? 'Added' : 'Add'}
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
                        )}

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
                customerName={walkInName}
                customerPhone={walkInPhone}
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
                onClose={() => {
                    setIsBookedOpen(false);
                    if (onBookingSuccess) {
                        onBookingSuccess();
                    } else if (window.location.pathname.startsWith('/staff')) {
                        navigate('/staff/dashboard');
                    } else {
                        navigate('/owner/manage/schedule');
                    }
                }}
                selectedServices={selectedServiceObjects}
                date={selectedDateObj ? `${selectedDateObj.num}-${selectedDateObj.month}-${selectedDateObj.year}` : ''}
                time={selectedTime}
                expert={selectedExpertObj}
                customerName={walkInName}
                customerPhone={walkInPhone}
                selectedOffer={selectedOffer}
                discountAmount={discountAmount}
                weekdayDiscountAmount={weekdayDiscountAmount}
                homeService={homeService}
                homeCharge={homeService ? homeServiceCharges : 0}
                address={homeService ? customerAddress : ''}
            />

            {/* ==================== WALK-IN DETAILS POPUP ==================== */}
            {isWalkInPopupOpen && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} rounded-[32px] border shadow-2xl p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 transform scale-100`}>
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[80px]" />
                        
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon container */}
                            <div className="w-16 h-16 bg-red-50 rounded-[24px] flex items-center justify-center shadow-lg shadow-red-500/10 shrink-0">
                                <Sparkles className="w-8 h-8 text-[#FF0B01]" />
                            </div>

                            <div className="space-y-2 w-full">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Walk-In Customer Details</h3>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-4">
                                    Please enter the customer's name and mobile number to proceed with the booking.
                                </p>
                                
                                <div className="space-y-3 text-left">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Customer Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Customer Name"
                                            value={walkInName}
                                            onChange={(e) => setWalkInName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-zinc-400 focus:bg-white focus:border-[#FF0B01] focus:ring-1 focus:ring-[#FF0B01]/30 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Mobile Number</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter Mobile Number"
                                            value={walkInPhone}
                                            onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-zinc-400 focus:bg-white focus:border-[#FF0B01] focus:ring-1 focus:ring-[#FF0B01]/30 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="w-full space-y-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={handleInviteAndBook}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Invite & Book
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!walkInName.trim()) {
                                            toast.error('Please enter customer name.');
                                            return;
                                        }
                                        if (!walkInPhone.trim()) {
                                            toast.error('Please enter customer mobile number.');
                                            return;
                                        }
                                        if (walkInPhone.length !== 10 || !/^[0-9]{10}$/.test(walkInPhone)) {
                                            toast.error('Mobile number must be exactly 10 digits.');
                                            return;
                                        }
                                        setIsWalkInPopupOpen(false);
                                        setIsBillOpen(true);
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-red-500/15 cursor-pointer"
                                >
                                    Book
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsWalkInPopupOpen(false)}
                                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 border border-slate-150 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== INVITE & BOOK ANIMATION MODAL ==================== */}
            <InviteCustomerAnimationModal
                isOpen={inviteAnimationOpen}
                type={inviteAnimationType}
                phone={walkInPhone}
                name={walkInName}
                points={inviteAnimationPoints}
                message={inviteAnimationMessage}
                onClose={() => setInviteAnimationOpen(false)}
                onProceed={() => {
                    setInviteAnimationOpen(false);
                    setIsBookedOpen(true);
                }}
            />
            {/* ==================== DISCARD OFFER CONFIRMATION MODAL ==================== */}
            {showDiscardOfferModal && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'} rounded-[32px] border shadow-2xl p-8 max-w-md w-full relative overflow-hidden transition-all duration-300 transform scale-100`}>
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
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Discard Offer?</h3>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                    Deselecting this service will remove your currently selected offer and its associated services. Do you want to proceed?
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
                                    className="w-full py-3.5 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-red-500/15 cursor-pointer"
                                >
                                    Yes, Discard Offer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDiscardOfferModal(false)}
                                    className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 border border-slate-150 cursor-pointer"
                                >
                                    No, Keep Offer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Walk-In Booking Blocked Modal */}
            {showBanWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 text-center space-y-4 transition-all ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
                    }`}>
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-base font-black uppercase tracking-tight">Cannot Create Walk-In Booking</h4>
                            <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-1">
                                Your salon has been banned by Admin.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-left border border-slate-200 dark:border-zinc-700 text-xs space-y-1">
                            <span className="font-extrabold text-red-500 uppercase tracking-wider block">Ban Reason:</span>
                            <p className="font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed">
                                {salon?.banReason || salon?.reason || "Violation of Terms of Service"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowBanWarningModal(false)}
                            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WalkInBooking;
