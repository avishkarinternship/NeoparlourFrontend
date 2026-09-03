import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { GstStateInput, StateSelector, GstinInput } from "../common/GstStateInput";
import { BillingSummaryCard } from "../common/BillingSummaryCard";
import { getStateFromCityName, getGstInvoiceNotice, getStateDisplayName, INDIAN_STATES } from "../../constants/indianStates";
import searchService from "../../services/searchService";
import { MapPin, Navigation as NavigationIcon, Compass, Building } from "lucide-react";

const is18OrOlder = (birthdateString) => {
  if (!birthdateString) return false;
  const dob = new Date(birthdateString);
  if (isNaN(dob.getTime())) return false;
  
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};

const getMax18PlusDate = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Settings = () => {
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode !== undefined 
      ? outletContext.isDarkMode 
      : document.documentElement.classList.contains('dark');

    const [activeTab, setActiveTab] = useState("owner");

    const [isOwnerEdit, setIsOwnerEdit] = useState(false);
    const [isSalonEdit, setIsSalonEdit] = useState(false);

    // Delete account modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [consequence1, setConsequence1] = useState(false);
    const [consequence2, setConsequence2] = useState(false);
    const [consequence3, setConsequence3] = useState(false);
    const [consequence4, setConsequence4] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [ownerProfile, setOwnerProfile] = useState({
        salonName: "",
        email: "",
        phone: "",
        gender: "",
        birthdate: "",
        address: "",
        cityName: "",
        areaName: "",
        gstin: "",
        state: "",
        includeGstInInvoice: false,
    });

    const [salonProfile, setSalonProfile] = useState({
        salonName: "",
        email: "",
        phone: "",
        cityName: "",
        areaName: "",
        landmark: "",
        specificAddress: "",
        address: "",
        gstin: "",
        state: "",
        includeGstInInvoice: false,
        openingTime: "",
        closingTime: "",
        weeklyOffDay: "",
        homeServiceCharges: "",
        weekdayDiscount: "",
        morningDiscount: "",
        afternoonDiscount: "",
        eveningDiscount: "",
        nightDiscount: "",
    });

    // Location search states for Salon Settings (Photon Komoot API)
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [areaSuggestions, setAreaSuggestions] = useState([]);
    const [landmarkSuggestions, setLandmarkSuggestions] = useState([]);

    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);
    const [isLoadingLandmarks, setIsLoadingLandmarks] = useState(false);

    const [isUserTypingCity, setIsUserTypingCity] = useState(false);
    const [isUserTypingArea, setIsUserTypingArea] = useState(false);
    const [isUserTypingLandmark, setIsUserTypingLandmark] = useState(false);

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [showLandmarkDropdown, setShowLandmarkDropdown] = useState(false);

    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const [discountMode, setDiscountMode] = useState("NONE"); // "NONE", "WEEKDAY", "CATEGORY"

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    // Salon image upload states
    const [logoBase64, setLogoBase64] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [existingSalonImages, setExistingSalonImages] = useState([]);
    const [newGalleryBase64s, setNewGalleryBase64s] = useState([]);
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

    const [hasFetchedSalonProfile, setHasFetchedSalonProfile] = useState(false);

    useEffect(() => {
        fetchOwnerProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'salon' && !hasFetchedSalonProfile) {
            fetchSalonProfile();
            setHasFetchedSalonProfile(true);
        }
    }, [activeTab, hasFetchedSalonProfile]);

    const fetchOwnerProfile = async () => {
        try {
            const storedUserStr = localStorage.getItem('ownerStaffUser');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                setOwnerProfile({
                    ...storedUser,
                    gstin: storedUser.gstin || "",
                    state: storedUser.state || "",
                    includeGstInInvoice: storedUser.includeGstInInvoice !== undefined ? Boolean(storedUser.includeGstInInvoice) : false,
                    birthdate: storedUser.birthdate
                        ? storedUser.birthdate.split("T")[0]
                        : "",
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSalonProfile = async () => {
        try {
            const response = await axiosInstance.get("/salons/profile");
            const data = response.data;
            setSalonProfile({
                ...data,
                landmark: data.landmark || "",
                specificAddress: data.specificAddress || "",
                gstin: data.gstin || "",
                state: data.state || "",
                includeGstInInvoice: data.includeGstInInvoice !== undefined ? Boolean(data.includeGstInInvoice) : false,
                weekdayDiscount: data.weekdayDiscount !== null && data.weekdayDiscount !== undefined ? data.weekdayDiscount : "",
                morningDiscount: data.morningDiscount !== null && data.morningDiscount !== undefined ? data.morningDiscount : "",
                afternoonDiscount: data.afternoonDiscount !== null && data.afternoonDiscount !== undefined ? data.afternoonDiscount : "",
                eveningDiscount: data.eveningDiscount !== null && data.eveningDiscount !== undefined ? data.eveningDiscount : "",
                nightDiscount: data.nightDiscount !== null && data.nightDiscount !== undefined ? data.nightDiscount : "",
            });
            setIsUserTypingCity(false);
            setIsUserTypingArea(false);
            setIsUserTypingLandmark(false);
            setExistingSalonImages(data.salonImages || []);
            // reset new uploads
            setLogoBase64(null);
            setLogoPreview(null);
            setNewGalleryBase64s([]);
            setNewGalleryPreviews([]);

            // Determine active discount mode
            if (data.weekdayDiscount > 0) {
                setDiscountMode("WEEKDAY");
            } else if (
                data.morningDiscount > 0 ||
                data.afternoonDiscount > 0 ||
                data.eveningDiscount > 0 ||
                data.nightDiscount > 0
            ) {
                setDiscountMode("CATEGORY");
            } else {
                setDiscountMode("NONE");
            }
        } catch (error) {
            console.log(error);
        }
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
                        setIsUserTypingCity(false);
                        setIsUserTypingArea(false);
                        setSalonProfile(prev => ({
                            ...prev,
                            cityName: result.city,
                            areaName: result.area || ''
                        }));
                        toast.success(`Location detected: ${result.city}${result.area ? `, ${result.area}` : ''}`);
                    } else {
                        toast.error("Could not determine your city. Please enter it manually.");
                    }
                } catch (err) {
                    console.error("Location detection error:", err);
                    toast.error("Failed to detect location. Please enter manually.");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Location access denied or unavailable.");
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: false, timeout: 8000 }
        );
    };

    // Autocomplete city search (Photon Komoot API)
    useEffect(() => {
        if (!isUserTypingCity) return;
        if (!salonProfile.cityName || salonProfile.cityName.trim().length < 2) {
            setCitySuggestions([]);
            return;
        }

        setIsLoadingCities(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchExternalLocations(salonProfile.cityName, 'city', '', salonProfile.state);
                setCitySuggestions(results);
            } catch (err) {
                console.error("Settings City Search Error:", err);
            } finally {
                setIsLoadingCities(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [salonProfile.cityName, salonProfile.state, isUserTypingCity]);

    // Autocomplete area search (Photon Komoot API)
    useEffect(() => {
        if (!isUserTypingArea) return;
        if (!salonProfile.areaName || salonProfile.areaName.trim().length < 2) {
            setAreaSuggestions([]);
            return;
        }

        setIsLoadingAreas(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchExternalLocations(salonProfile.areaName, 'area', salonProfile.cityName, salonProfile.state);
                setAreaSuggestions(results);
            } catch (err) {
                console.error("Settings Area Search Error:", err);
            } finally {
                setIsLoadingAreas(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [salonProfile.areaName, salonProfile.cityName, salonProfile.state, isUserTypingArea]);

    // Autocomplete landmark search (Photon Komoot API)
    useEffect(() => {
        if (!isUserTypingLandmark) return;
        if (!salonProfile.landmark || salonProfile.landmark.trim().length < 2) {
            setLandmarkSuggestions([]);
            return;
        }

        setIsLoadingLandmarks(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchService.searchLandmarks(
                    salonProfile.landmark, 
                    salonProfile.areaName, 
                    salonProfile.cityName, 
                    salonProfile.state, 
                    salonProfile.areaDistrict
                );
                setLandmarkSuggestions(results);
            } catch (err) {
                console.error("Settings Landmark Search Error:", err);
            } finally {
                setIsLoadingLandmarks(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [salonProfile.landmark, salonProfile.areaName, salonProfile.cityName, salonProfile.state, salonProfile.areaDistrict, isUserTypingLandmark]);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            alert("Image size must be under 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoBase64(reader.result);
            setLogoPreview(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);
    };

    const handleGalleryUpload = (e) => {
        const files = Array.from(e.target.files);
        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                if (file.size > 2 * 1024 * 1024) {
                    alert(`${file.name} is too large (max 2MB)`);
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => resolve({ base64: reader.result, preview: URL.createObjectURL(file) });
                reader.onerror = () => reject(null);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(results => {
            const valid = results.filter(Boolean);
            setNewGalleryBase64s(prev => [...prev, ...valid.map(v => v.base64)]);
            setNewGalleryPreviews(prev => [...prev, ...valid.map(v => v.preview)]);
        });
    };

    const removeExistingGalleryImage = (indexToRemove) => {
        setExistingSalonImages(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const removeNewGalleryImage = (indexToRemove) => {
        setNewGalleryBase64s(prev => prev.filter((_, i) => i !== indexToRemove));
        setNewGalleryPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleOwnerChange = (e) => {
        const { name, value } = e.target;

        setOwnerProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSalonChange = (e) => {
        const { name, value } = e.target;

        setSalonProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleGstStateChange = ({ gstin, state }) => {
        setSalonProfile((prev) => ({
            ...prev,
            gstin,
            state,
        }));
    };

    const updateOwnerProfile = async () => {
        try {
            let userId = ownerProfile.id;
            if (!userId) {
                const storedUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
                userId = storedUser.id;
            }

            if (!userId) {
                alert("User ID not found. Please log in again.");
                return;
            }

            if (ownerProfile.birthdate && !is18OrOlder(ownerProfile.birthdate)) {
                toast.error("Salon Owner must be at least 18 years old.");
                return;
            }

            const payload = {
                ...ownerProfile,
                gstin: ownerProfile.gstin ? ownerProfile.gstin.trim() : null,
                state: ownerProfile.state || null,
                includeGstInInvoice: Boolean(ownerProfile.includeGstInInvoice),
            };

            const response = await axiosInstance.put(
                `/auth/users/${userId}`,
                payload
            );

            // Keep the local storage strictly synced with the database
            localStorage.setItem('ownerStaffUser', JSON.stringify(response.data));

            setPopupMessage("Owner profile updated successfully");
            setShowPopup(true);
            setIsOwnerEdit(false);
        } catch (error) {
            console.log(error);
        }
    };


    const updateSalonProfile = async () => {
        try {
            if (salonProfile.includeGstInInvoice && salonProfile.gstin) {
                const cleanGst = salonProfile.gstin.trim().toUpperCase();
                if (cleanGst.length >= 2) {
                    const prefix = cleanGst.substring(0, 2);
                    const selStateObj = salonProfile.state ? INDIAN_STATES.find(s => 
                        s.enumValue === salonProfile.state || 
                        s.displayName.toLowerCase() === salonProfile.state.toLowerCase() ||
                        s.enumValue.replace(/_/g, ' ').toLowerCase() === salonProfile.state.toLowerCase()
                    ) : null;
                    if (selStateObj && selStateObj.stateCode !== prefix) {
                        toast.error(`The entered GSTIN state code (${prefix}) does not belong to the selected state (${selStateObj.displayName}). If you don't have a GSTIN for ${selStateObj.displayName}, please keep it blank.`);
                        return;
                    }
                }
            }

            const formattedAddress = [
                salonProfile.specificAddress,
                salonProfile.landmark ? `(Near ${salonProfile.landmark})` : '',
                salonProfile.areaName
            ].filter(Boolean).join(', ');

            const payload = {
                ...salonProfile,
                state: salonProfile.state || null,
                cityName: salonProfile.cityName || null,
                areaName: salonProfile.areaName || null,
                landmark: salonProfile.landmark || null,
                specificAddress: salonProfile.specificAddress || null,
                address: formattedAddress || salonProfile.specificAddress || salonProfile.address || null,
                gstin: salonProfile.gstin ? salonProfile.gstin.trim() : null,
                includeGstInInvoice: Boolean(salonProfile.includeGstInInvoice),
                salonImages: existingSalonImages,
                imageBase64: logoBase64 || null,
                salonImagesBase64: newGalleryBase64s.length > 0 ? newGalleryBase64s : null
            };

            // Map and parse fields according to the chosen discount mode
            if (discountMode === "NONE") {
                payload.weekdayDiscount = 0;
                payload.morningDiscount = 0;
                payload.afternoonDiscount = 0;
                payload.eveningDiscount = 0;
                payload.nightDiscount = 0;
            } else if (discountMode === "WEEKDAY") {
                const val = payload.weekdayDiscount === "" ? 0 : parseFloat(payload.weekdayDiscount);
                if (isNaN(val) || val < 0 || val > 100) {
                    alert("Weekday Discount must be a number between 0 and 100.");
                    return;
                }
                payload.weekdayDiscount = val;
                payload.morningDiscount = 0;
                payload.afternoonDiscount = 0;
                payload.eveningDiscount = 0;
                payload.nightDiscount = 0;
            } else if (discountMode === "CATEGORY") {
                const m = payload.morningDiscount === "" ? 0 : parseFloat(payload.morningDiscount);
                const a = payload.afternoonDiscount === "" ? 0 : parseFloat(payload.afternoonDiscount);
                const e = payload.eveningDiscount === "" ? 0 : parseFloat(payload.eveningDiscount);
                const n = payload.nightDiscount === "" ? 0 : parseFloat(payload.nightDiscount);
                if (isNaN(m) || m < 0 || m > 100 ||
                    isNaN(a) || a < 0 || a > 100 ||
                    isNaN(e) || e < 0 || e > 100 ||
                    isNaN(n) || n < 0 || n > 100) {
                    alert("Time category discounts must be numbers between 0 and 100.");
                    return;
                }
                payload.weekdayDiscount = 0;
                payload.morningDiscount = m;
                payload.afternoonDiscount = a;
                payload.eveningDiscount = e;
                payload.nightDiscount = n;
            }

            await axiosInstance.put(
                `/salons/profile`,
                payload
            );

            setPopupMessage("Salon profile updated successfully");
            setShowPopup(true);
            setIsSalonEdit(false);

            // Refresh to load newly saved URLs and clear upload states
            fetchSalonProfile();
        } catch (error) {
            console.log(error);
        }
    };

    const downloadQRCode = () => {
        if (!salonProfile.qrCodeUrl) return;
        const link = document.createElement("a");
        link.href = salonProfile.qrCodeUrl;
        link.target = "_blank";
        link.download = "salon_qrcode.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenDeleteModal = () => {
        setConsequence1(false);
        setConsequence2(false);
        setConsequence3(false);
        setConsequence4(false);
        setConfirmText("");
        setShowDeleteModal(true);
    };

    const handleFinalDelete = async () => {
        let userId = ownerProfile.id;
        if (!userId) {
            const storedUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
            userId = storedUser.id;
        }

        if (!userId) {
            toast.error("User ID not found. Please log in again.");
            return;
        }

        setIsDeleting(true);
        try {
            const response = await axiosInstance.delete(`/auth/users/${userId}`);
            toast.success(response.data || "Account and salon deactivated successfully. 30 days recovery grace period active.", {
                duration: 6000
            });
            
            // Clear owner details
            localStorage.removeItem("ownerStaffToken");
            localStorage.removeItem("ownerStaffUser");
            localStorage.removeItem("activeSalonId");

            // Redirect
            navigate("/owner/login");
        } catch (error) {
            console.error("Failed to delete user account:", error);
            toast.error(error.response?.data?.message || "Failed to process account deletion request. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const storedUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
    const isAdmin = storedUser.role === 'ADMIN';

    return (
        <main className={`flex-1 p-8 overflow-y-auto transition-colors ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
            {/* TABS */}
            <div className={`flex space-x-4 mb-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                <button
                    className={`pb-3 px-4 font-semibold text-lg transition-colors ${
                        activeTab === 'owner' 
                            ? 'border-b-2 border-red-500 text-red-500' 
                            : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('owner')}
                >
                    {isAdmin ? 'Admin Profile' : 'Owner Profile'}
                </button>
                {!isAdmin && (
                    <button
                        className={`pb-3 px-4 font-semibold text-lg transition-colors ${
                            activeTab === 'salon' 
                                ? 'border-b-2 border-red-500 text-red-500' 
                                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('salon')}
                    >
                        Salon Profile
                    </button>
                )}
            </div>

            <div className={`rounded-2xl shadow-md border p-8 max-w-4xl mx-auto transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                {activeTab === 'owner' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isAdmin ? 'Admin Profile' : 'Owner Profile'}</h2>

                            <button
                                onClick={() => setIsOwnerEdit(!isOwnerEdit)}
                                className={`px-5 py-2 rounded-xl font-medium transition ${
                                    isOwnerEdit
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : isDarkMode
                                        ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                                        : "bg-gray-800 text-white hover:bg-black"
                                }`}
                            >
                                {isOwnerEdit ? "Done" : "Edit"}
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-zinc-300 border-zinc-800' : 'text-gray-700 border-gray-200'}`}>Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={ownerProfile.name || ''}
                                        disabled={!isOwnerEdit}
                                        onChange={handleOwnerChange}
                                        className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm transition-all focus:outline-none focus:border-[#ff0b01] ${
                                            isDarkMode 
                                                ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300 placeholder-zinc-500' 
                                                : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={ownerProfile.birthdate || ''}
                                        disabled={!isOwnerEdit}
                                        max={getMax18PlusDate()}
                                        onChange={handleOwnerChange}
                                        className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm transition-all focus:outline-none focus:border-[#ff0b01] ${
                                            isDarkMode 
                                                ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-950 disabled:text-zinc-500' 
                                                : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Gender</label>
                                    <select
                                        name="gender"
                                        value={ownerProfile.gender || ''}
                                        disabled={!isOwnerEdit}
                                        onChange={handleOwnerChange}
                                        className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm transition-all focus:outline-none focus:border-[#ff0b01] ${
                                            isDarkMode 
                                                ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                        }`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Contact Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={ownerProfile.phone || ''}
                                        disabled={!isOwnerEdit}
                                        onChange={handleOwnerChange}
                                        className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm transition-all focus:outline-none focus:border-[#ff0b01] ${
                                            isDarkMode 
                                                ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                                
                                <div className="mt-8">
                                    <button
                                        onClick={updateOwnerProfile}
                                        disabled={!isOwnerEdit}
                                        className={`px-8 py-3 rounded-xl font-semibold w-full transition-colors ${isOwnerEdit
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        Update Owner Profile
                                    </button>
                                </div>

                                {/* Danger Zone */}
                                <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-red-900/30' : 'border-red-100'}`}>
                                    <h3 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wide">Danger Zone</h3>
                                    <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Permanently delete your account and deactivate your salon listings.</p>
                                    <div className={`border rounded-2xl p-6 transition-colors ${isDarkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50/20 border-red-100'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="max-w-xl">
                                                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Account & Salon</h4>
                                                <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                                    Once deleted, your salon will be removed from location search immediately. All bookings, staff profiles, and client history will be suspended.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleOpenDeleteModal}
                                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm shadow-red-200 shrink-0"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'salon' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Salon Profile</h2>

                                    <button
                                        onClick={() => setIsSalonEdit(!isSalonEdit)}
                                        className={`px-5 py-2 rounded-xl font-medium transition ${isSalonEdit
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700" : "bg-gray-800 text-white hover:bg-black"
                                            }`}
                                    >
                                        {isSalonEdit ? "Done" : "Edit"}
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-zinc-300 border-zinc-800' : 'text-gray-700 border-gray-200'}`}>Salon Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div className="md:col-span-2">
                                            <label className={`text-sm font-bold block mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Salon Name</label>
                                            <input
                                                type="text"
                                                name="salonName"
                                                value={salonProfile.salonName || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className={`w-full border rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Location & Address Settings (State, City, Area, Landmark, Specific Address with Photon Komoot API) */}
                                    <div className={`my-6 p-6 border rounded-2xl shadow-xs text-left font-sans space-y-4 transition-colors ${
                                        isDarkMode ? 'bg-zinc-800/30 border-zinc-800/80' : 'bg-[#fafafa] border-gray-200'
                                    }`}>
                                        <h4 className={`text-xs font-black uppercase tracking-widest border-b pb-2 ${isDarkMode ? 'text-zinc-400 border-zinc-800' : 'text-gray-400 border-gray-200'}`}>📍 Salon Location & Address Details</h4>
                                        
                                        {/* Row 1: State & City Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* State Selector */}
                                            <div>
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>State</label>
                                                <StateSelector 
                                                    state={salonProfile.state} 
                                                    onChange={(newState) => setSalonProfile(prev => ({ ...prev, state: newState }))} 
                                                    disabled={!isSalonEdit}
                                                    isDarkMode={isDarkMode}
                                                    showLabel={false}
                                                />
                                            </div>

                                            {/* City / District Input with GPS detection and Photon autocomplete */}
                                            <div className="relative city-dropdown-container">
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>City / District</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        name="cityName"
                                                        value={salonProfile.cityName || ''}
                                                        disabled={!isSalonEdit}
                                                        onChange={(e) => {
                                                            setIsUserTypingCity(true);
                                                            handleSalonChange(e);
                                                            setShowCityDropdown(true);
                                                        }}
                                                        onFocus={() => isSalonEdit && setShowCityDropdown(true)}
                                                        placeholder="Select City / District" 
                                                        className={`w-full pr-12 pl-4 py-3.5 border rounded-2xl text-sm font-bold focus:outline-none focus:border-[#ff0b01] ${
                                                            isDarkMode 
                                                                ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300 placeholder-zinc-500' 
                                                                : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-100 disabled:text-gray-500'
                                                        }`}
                                                    />
                                                    {isSalonEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={handleDetectLocation}
                                                            disabled={isDetectingLocation}
                                                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-[#ff0b01] hover:bg-[#ff0b01]/5 transition-all duration-150 flex-shrink-0 z-10 ${
                                                                isDetectingLocation ? 'animate-pulse pointer-events-none' : 'hover:scale-105 active:scale-95'
                                                            }`}
                                                            title="Detect Current Location"
                                                        >
                                                            {isDetectingLocation ? (
                                                                <div className="h-4 w-4 border-2 border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
                                                            ) : (
                                                                <NavigationIcon className="w-4 h-4 -rotate-45" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                {isSalonEdit && showCityDropdown && salonProfile.cityName && (
                                                    <div className={`absolute top-full left-0 z-50 w-full mt-2 border rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left ${
                                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-800'
                                                    }`}>
                                                        {isLoadingCities ? (
                                                            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-[#ff0b01] border-t-transparent rounded-full animate-spin" />
                                                                <span>Searching...</span>
                                                            </div>
                                                        ) : citySuggestions.length > 0 ? (
                                                            citySuggestions.map((city, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    onClick={() => {
                                                                        setIsUserTypingCity(false);
                                                                        setSalonProfile(prev => ({
                                                                            ...prev,
                                                                            cityName: city.name,
                                                                            areaName: ''
                                                                        }));
                                                                        setCitySuggestions([]);
                                                                        setAreaSuggestions([]);
                                                                        setShowCityDropdown(false);
                                                                    }}
                                                                    className={`px-4 py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-colors ${
                                                                        isDarkMode ? 'hover:bg-zinc-800 hover:text-red-400 text-zinc-200' : 'hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] text-gray-700'
                                                                    }`}
                                                                >
                                                                    {city.name}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No cities found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 2: Area Name & Landmark */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Area Name Input */}
                                            <div className="relative area-dropdown-container">
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Area / Neighborhood</label>
                                                <input 
                                                    type="text" 
                                                    name="areaName"
                                                    value={salonProfile.areaName || ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={(e) => {
                                                        setIsUserTypingArea(true);
                                                        handleSalonChange(e);
                                                        setShowAreaDropdown(true);
                                                    }}
                                                    onFocus={() => isSalonEdit && setShowAreaDropdown(true)}
                                                    placeholder="Select Area" 
                                                    className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300 placeholder-zinc-500' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-100 disabled:text-gray-500'
                                                    }`} 
                                                />
                                                {isSalonEdit && showAreaDropdown && salonProfile.areaName && (
                                                    <div className={`absolute top-full left-0 z-50 w-full mt-2 border rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left ${
                                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-800'
                                                    }`}>
                                                        {isLoadingAreas ? (
                                                            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-[#ff0b01] border-t-transparent rounded-full animate-spin" />
                                                                <span>Searching...</span>
                                                            </div>
                                                        ) : areaSuggestions.length > 0 ? (
                                                            areaSuggestions.map((area, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    onClick={() => {
                                                                        setIsUserTypingArea(false);
                                                                        setSalonProfile(prev => ({ 
                                                                            ...prev, 
                                                                            areaName: area.name,
                                                                            areaDistrict: area.district || ''
                                                                        }));
                                                                        setAreaSuggestions([]);
                                                                        setShowAreaDropdown(false);
                                                                    }}
                                                                    className={`px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-colors text-left flex flex-col gap-0.5 ${
                                                                        isDarkMode ? 'hover:bg-zinc-800 hover:text-red-400 text-zinc-200' : 'hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] text-gray-700'
                                                                    }`}
                                                                >
                                                                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{area.name}</span>
                                                                    {area.city && (
                                                                        <span className="text-[11px] font-semibold text-gray-400">{area.city}</span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No areas found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Landmark Input */}
                                            <div className="relative landmark-dropdown-container">
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Landmark <span className="text-gray-400 font-normal">(Optional)</span></label>
                                                <input 
                                                    type="text" 
                                                    name="landmark"
                                                    value={salonProfile.landmark || ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={(e) => {
                                                        setIsUserTypingLandmark(true);
                                                        handleSalonChange(e);
                                                        setShowLandmarkDropdown(true);
                                                    }}
                                                    onFocus={() => isSalonEdit && setShowLandmarkDropdown(true)}
                                                    placeholder="Landmark (e.g. Siddhi Hospital)" 
                                                    className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300 placeholder-zinc-500' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-100 disabled:text-gray-500'
                                                    }`} 
                                                />
                                                {isSalonEdit && showLandmarkDropdown && salonProfile.landmark && (
                                                    <div className={`absolute top-full left-0 z-50 w-full mt-2 border rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left ${
                                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-800'
                                                    }`}>
                                                        {isLoadingLandmarks ? (
                                                            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-[#ff0b01] border-t-transparent rounded-full animate-spin" />
                                                                <span>Searching landmarks...</span>
                                                            </div>
                                                        ) : landmarkSuggestions.length > 0 ? (
                                                            landmarkSuggestions.map((lm, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    onClick={() => {
                                                                        setIsUserTypingLandmark(false);
                                                                        setSalonProfile(prev => ({ ...prev, landmark: lm.name }));
                                                                        setLandmarkSuggestions([]);
                                                                        setShowLandmarkDropdown(false);
                                                                    }}
                                                                    className={`px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-colors text-left flex flex-col gap-0.5 ${
                                                                        isDarkMode ? 'hover:bg-zinc-800 hover:text-red-400 text-zinc-200' : 'hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] text-gray-700'
                                                                    }`}
                                                                >
                                                                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lm.name}</span>
                                                                    {lm.details && (
                                                                        <span className="text-[11px] font-semibold text-gray-400">{lm.details}</span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No landmarks found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 3: Shop / Building Address */}
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Shop / Building Address</label>
                                            <textarea 
                                                name="specificAddress"
                                                value={salonProfile.specificAddress || ''}
                                                disabled={!isSalonEdit}
                                                onChange={(e) => {
                                                    handleSalonChange(e);
                                                    setSalonProfile(prev => ({ ...prev, address: e.target.value }));
                                                }}
                                                placeholder="Shop / Building Address (e.g. Shop No. 4, ABC Complex)" 
                                                rows="2"
                                                className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold focus:outline-none focus:border-[#ff0b01] resize-none ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300 placeholder-zinc-500' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-100 disabled:text-gray-500'
                                                }`} 
                                            />
                                        </div>

                                        {/* Live Formatted Address Preview */}
                                        {(salonProfile.specificAddress || salonProfile.address || salonProfile.landmark || salonProfile.areaName || salonProfile.cityName) && (
                                            <div className={`p-3.5 border rounded-2xl text-left font-sans ${
                                                isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-800'
                                            }`}>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">📍 Formatted Address Preview</span>
                                                <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                                                    {[
                                                        salonProfile.specificAddress,
                                                        salonProfile.landmark ? `(Near ${salonProfile.landmark})` : '',
                                                        salonProfile.areaName
                                                    ].filter(Boolean).join(', ') || salonProfile.address || 'No address specified'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Invoice & Tax Settings Block */}
                                    <div className={`my-6 p-6 border rounded-2xl shadow-xs text-left font-sans transition-colors ${
                                        isDarkMode ? 'bg-zinc-800/30 border-zinc-800/80' : 'bg-white border-gray-200/80'
                                    }`}>
                                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b ${
                                            isDarkMode ? 'border-zinc-800' : 'border-gray-100'
                                        }`}>
                                            <div>
                                                <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Include GST (18%) in Appointment Invoices</h4>
                                                <p className={`text-xs mt-0.5 leading-relaxed font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                                                    {getGstInvoiceNotice(salonProfile.state, salonProfile.gstin)}
                                                </p>
                                            </div>

                                            {/* Minimal Sleek Toggle Switch */}
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                <span className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${salonProfile.includeGstInInvoice ? 'text-[#ff0b01]' : 'text-gray-400'}`}>
                                                    {salonProfile.includeGstInInvoice ? 'Enabled' : 'Disabled'}
                                                </span>
                                                <label className={`relative inline-flex items-center cursor-pointer ${!isSalonEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={Boolean(salonProfile.includeGstInInvoice)} 
                                                        disabled={!isSalonEdit}
                                                        onChange={(e) => setSalonProfile(prev => ({ ...prev, includeGstInInvoice: e.target.checked }))}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-xs peer-checked:bg-[#ff0b01] transition-colors ${
                                                        isDarkMode ? 'bg-zinc-700' : 'bg-gray-200'
                                                    }`}></div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Conditional GSTIN Field */}
                                        {salonProfile.includeGstInInvoice && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                                                    Salon GSTIN Number
                                                </label>
                                                <GstinInput
                                                    gstin={salonProfile.gstin}
                                                    state={salonProfile.state}
                                                    onChange={handleGstStateChange}
                                                    disabled={!isSalonEdit}
                                                    isDarkMode={isDarkMode}
                                                    showLabel={false}
                                                />
                                            </div>
                                        )}

                                        {/* Live Invoice Tax Breakdown Preview Box */}
                                        <div className="mt-5">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Customer Invoice Preview</label>
                                            <BillingSummaryCard 
                                                subtotal={1000} 
                                                includeGst={Boolean(salonProfile.includeGstInInvoice)} 
                                                gstin={salonProfile.gstin} 
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 mt-4">
                                        <div>
                                            <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Salon Code</label>
                                            <input
                                                type="text"
                                                value={salonProfile.salonCode || ''}
                                                disabled
                                                className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm cursor-not-allowed ${
                                                    isDarkMode ? 'bg-zinc-800/40 border-zinc-800 text-zinc-300' : 'bg-gray-50 border-gray-200 text-gray-500'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Contact Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={salonProfile.phone || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-zinc-300 border-zinc-800' : 'text-gray-700 border-gray-200'}`}>Business Hours</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Opening Time</label>
                                            <input
                                                type="time"
                                                name="openingTime"
                                                value={salonProfile.openingTime || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Closing Time</label>
                                            <input
                                                type="time"
                                                name="closingTime"
                                                value={salonProfile.closingTime || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Weekly Off Day</label>
                                            <select
                                                name="weeklyOffDay"
                                                value={salonProfile.weeklyOffDay || ''}
                                                onChange={handleSalonChange}
                                                disabled={!isSalonEdit}
                                                className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                }`}
                                            >
                                                <option value="NONE">None</option>
                                                <option value="MONDAY">Monday</option>
                                                <option value="TUESDAY">Tuesday</option>
                                                <option value="WEDNESDAY">Wednesday</option>
                                                <option value="THURSDAY">Thursday</option>
                                                <option value="FRIDAY">Friday</option>
                                                <option value="SATURDAY">Saturday</option>
                                                <option value="SUNDAY">Sunday</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Home Service Charges</label>
                                            <input
                                                type="number"
                                                name="homeServiceCharges"
                                                value={salonProfile.homeServiceCharges || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                        : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={`mb-6 border-t pt-6 ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-zinc-300 border-zinc-800' : 'text-gray-700 border-gray-200'}`}>Discount Settings</h3>
                                    
                                    <div className="mb-6">
                                        <label className={`text-sm font-semibold block mb-3 ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>Active Discount Mode</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { mode: "NONE", label: "No Discount", desc: "Disable all slot discounts" },
                                                { mode: "WEEKDAY", label: "Weekday Discount", desc: "Same discount for all Mon-Fri slots" },
                                                { mode: "CATEGORY", label: "Time-Category Discounts", desc: "Different slot discounts throughout the day" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.mode}
                                                    type="button"
                                                    disabled={!isSalonEdit}
                                                    onClick={() => setDiscountMode(opt.mode)}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                                                        !isSalonEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                                    } ${
                                                        discountMode === opt.mode
                                                            ? (isDarkMode ? 'border-red-500 bg-red-500/10 text-red-400 shadow-sm' : 'border-red-500 bg-red-50/20 text-red-500 shadow-sm')
                                                            : isDarkMode
                                                            ? 'border-zinc-700/80 bg-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-200'
                                                            : 'border-gray-100 bg-[#fafafa] hover:bg-white hover:border-gray-300 text-gray-900'
                                                    }`}
                                                >
                                                    <span className="text-sm font-bold block">{opt.label}</span>
                                                    <span className="text-xs text-gray-400 mt-1 font-medium leading-tight">{opt.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {discountMode === "WEEKDAY" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div>
                                                <label className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Weekday Discount (%)</label>
                                                <input
                                                    type="number"
                                                    name="weekdayDiscount"
                                                    value={salonProfile.weekdayDiscount !== null && salonProfile.weekdayDiscount !== undefined ? salonProfile.weekdayDiscount : ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={handleSalonChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                    }`}
                                                    placeholder="e.g. 10"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {discountMode === "CATEGORY" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div>
                                                <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Morning Discount (%)</label>
                                                <span className="text-[10px] text-gray-400 block mb-1">06:00 AM - 12:00 PM</span>
                                                <input
                                                    type="number"
                                                    name="morningDiscount"
                                                    value={salonProfile.morningDiscount !== null && salonProfile.morningDiscount !== undefined ? salonProfile.morningDiscount : ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={handleSalonChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                    }`}
                                                    placeholder="e.g. 15"
                                                />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Afternoon Discount (%)</label>
                                                <span className="text-[10px] text-gray-400 block mb-1">12:00 PM - 04:00 PM</span>
                                                <input
                                                    type="number"
                                                    name="afternoonDiscount"
                                                    value={salonProfile.afternoonDiscount !== null && salonProfile.afternoonDiscount !== undefined ? salonProfile.afternoonDiscount : ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={handleSalonChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                    }`}
                                                    placeholder="e.g. 10"
                                                />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Evening Discount (%)</label>
                                                <span className="text-[10px] text-gray-400 block mb-1">04:00 PM - 08:00 PM</span>
                                                <input
                                                    type="number"
                                                    name="eveningDiscount"
                                                    value={salonProfile.eveningDiscount !== null && salonProfile.eveningDiscount !== undefined ? salonProfile.eveningDiscount : ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={handleSalonChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                    }`}
                                                    placeholder="e.g. 5"
                                                />
                                            </div>
                                            <div>
                                                <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Night Discount (%)</label>
                                                <span className="text-[10px] text-gray-400 block mb-1">08:00 PM - 06:00 AM</span>
                                                <input
                                                    type="number"
                                                    name="nightDiscount"
                                                    value={salonProfile.nightDiscount !== null && salonProfile.nightDiscount !== undefined ? salonProfile.nightDiscount : ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={handleSalonChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className={`w-full border rounded-xl px-4 py-3 mt-1 font-bold text-sm focus:outline-none focus:border-[#ff0b01] ${
                                                        isDarkMode 
                                                            ? 'bg-zinc-800 border-zinc-700 text-white disabled:bg-zinc-800/40 disabled:border-zinc-800 disabled:text-zinc-300' 
                                                            : 'bg-white border-gray-200 text-gray-800 disabled:bg-gray-50 disabled:text-gray-500'
                                                    }`}
                                                    placeholder="e.g. 20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {discountMode === "NONE" && (
                                        <div className={`rounded-xl p-4 border border-dashed text-center py-6 text-xs font-bold uppercase tracking-wider ${
                                            isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-zinc-400' : 'bg-gray-50 border-gray-200 text-gray-400'
                                        }`}>
                                            Discounts are currently disabled.
                                        </div>
                                    )}
                                </div>

                                <div className={`mb-6 border-t pt-6 ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-zinc-300 border-zinc-800' : 'text-gray-700 border-gray-200'}`}>Salon Images</h3>
                                    
                                    {/* Salon Logo */}
                                    <div className="mb-6">
                                        <label className={`text-sm font-semibold block mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>Salon Logo (Main Image)</label>
                                        <div className="flex items-center space-x-6">
                                            <div className={`w-24 h-24 rounded-xl border overflow-hidden flex items-center justify-center relative shadow-sm ${
                                                isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'
                                            }`}>
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="New Logo Preview" className="w-full h-full object-cover" />
                                                ) : salonProfile.imageUrl ? (
                                                    <img src={salonProfile.imageUrl} alt="Salon Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Logo</span>
                                                )}
                                            </div>
                                            {isSalonEdit && (
                                                <div>
                                                    <label className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-semibold shadow transition-colors inline-block ${
                                                        isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' : 'bg-gray-800 hover:bg-black text-white'
                                                    }`}>
                                                        Change Logo
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            onChange={handleLogoUpload} 
                                                            className="hidden" 
                                                        />
                                                    </label>
                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">JPG, PNG, GIF up to 2MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gallery Images */}
                                    <div>
                                        <label className={`text-sm font-semibold block mb-3 ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>Salon Gallery Images</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {/* Existing Gallery Images */}
                                            {existingSalonImages.map((imgUrl, idx) => (
                                                <div key={`existing-${idx}`} className={`aspect-square rounded-2xl border overflow-hidden relative group shadow-sm ${
                                                    isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                                    {isSalonEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingGalleryImage(idx)}
                                                            className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors"
                                                            title="Delete Image"
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Newly Uploaded Gallery Images */}
                                            {newGalleryPreviews.map((previewUrl, idx) => (
                                                <div key={`new-${idx}`} className="aspect-square rounded-2xl border border-dashed border-red-200 overflow-hidden bg-red-50/20 relative group shadow-sm">
                                                    <img src={previewUrl} alt={`New Gallery Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                    {isSalonEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewGalleryImage(idx)}
                                                            className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors"
                                                            title="Delete Image"
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Gallery Image Card */}
                                            {isSalonEdit && (
                                                <label className={`aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                                                    isDarkMode 
                                                        ? 'border-zinc-700 hover:border-[#FF0B01] hover:bg-red-500/10' 
                                                        : 'border-gray-300 hover:border-[#FF0B01] hover:bg-red-50/5'
                                                }`}>
                                                    <span className="text-2xl text-gray-400 group-hover:text-[#FF0B01] transition-colors">+</span>
                                                    <span className="text-[10px] font-black text-gray-400 group-hover:text-[#FF0B01] uppercase tracking-wider transition-colors">Add Image</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        multiple 
                                                        onChange={handleGalleryUpload} 
                                                        className="hidden" 
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={updateSalonProfile}
                                        disabled={!isSalonEdit}
                                        className={`px-8 py-3 rounded-xl font-semibold w-full transition-colors ${isSalonEdit
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : isDarkMode ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        Update Salon Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        

                        {salonProfile.qrCodeUrl && (
                            <div className={`mt-6 flex flex-col items-center p-4 rounded-xl border w-max mx-auto ${
                                isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50 border-gray-200'
                            }`}>
                                <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>Salon QR Code</h4>
                                <img
                                    src={salonProfile.qrCodeUrl}
                                    alt="Salon QR Code"
                                    className="w-40 h-40 object-contain mb-4 border rounded shadow-sm bg-white"
                                />
                                <button
                                    onClick={downloadQRCode}
                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                                >
                                    Download QR Code
                                </button>
                            </div>
                        )}
                    </div>

                    {showPopup && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50">
                            <div className={`rounded-2xl shadow-lg p-6 w-96 border ${
                                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                            }`}>
                                <h2 className="text-xl font-semibold text-green-500 mb-4">
                                    Success
                                </h2>

                                <p className={`mb-6 text-sm ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                                    {popupMessage}
                                </p>

                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 font-bold"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Salon Deactivation Warning Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className={`rounded-[32px] border shadow-2xl p-8 max-w-xl w-full relative overflow-hidden transition-all duration-300 transform scale-100 max-h-[90vh] overflow-y-auto ${
                                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-900'
                            }`}>
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="p-3 bg-red-50 text-red-500 rounded-2xl">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h2 className={`text-xl font-black tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Account & Deactivate Salon?</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">consequences acknowledgment required</p>
                                    </div>
                                </div>

                                {/* Consequences Acknowledgment checkboxes */}
                                <div className="space-y-4 mb-6">
                                    <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>To proceed, please acknowledge the following consequences of this action:</p>
                                    
                                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                                        isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/60' : 'border-gray-100 hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={consequence1}
                                            onChange={(e) => setConsequence1(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className={`text-xs leading-normal font-medium ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                                            <strong className={`block font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Salon Disappeared from Search</strong>
                                            I understand my salon ({salonProfile.salonName || ownerProfile.salonName || "your salon"}) will be made inactive immediately. Customers will no longer see it in location search results or browse its services.
                                        </span>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                                        isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/60' : 'border-gray-100 hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={consequence2}
                                            onChange={(e) => setConsequence2(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className={`text-xs leading-normal font-medium ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                                            <strong className={`block font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer Bookings Suspended</strong>
                                            I understand customers will be blocked from viewing my salon profile or booking any new appointments.
                                        </span>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                                        isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/60' : 'border-gray-100 hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={consequence3}
                                            onChange={(e) => setConsequence3(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className={`text-xs leading-normal font-medium ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                                            <strong className={`block font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Staff Members Suspended</strong>
                                            I understand all my staff members will be logged out immediately. They will be blocked from logging in or calling any salon APIs.
                                        </span>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                                        isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/60' : 'border-gray-100 hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={consequence4}
                                            onChange={(e) => setConsequence4(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className={`text-xs leading-normal font-medium ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                                            <strong className={`block font-bold mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Status</strong>
                                            I understand my active subscription will remain inactive but will not be automatically refunded.
                                        </span>
                                    </label>
                                </div>

                                {/* Grace Period Info Box */}
                                <div className={`border rounded-2xl p-4 mb-6 ${
                                    isDarkMode ? 'bg-amber-950/30 border-amber-800/40 text-amber-300' : 'bg-amber-50/50 border-amber-200/60 text-amber-900'
                                }`}>
                                    <div className="flex gap-2.5">
                                        <span className="text-amber-500 mt-0.5">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wide">30-Day Recovery Grace Period</h4>
                                            <p className="text-[11px] leading-relaxed font-medium mt-1 opacity-90">
                                                Your data is not permanently deleted immediately. You have a 30-day grace period to restore your account. If you log back into this owner account within 30 days, your owner profile will be restored, and your salon (along with active subscriptions) will be reactivated. After 30 days, all data is permanently wiped.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Double Confirmation Text Input */}
                                <div className="mb-6">
                                    <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                                        Type <span className="text-red-500 font-black">DELETE</span> to confirm:
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder="Type DELETE"
                                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-red-500 transition font-bold ${
                                            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-[#fafafa] border-gray-150 text-gray-900 placeholder-gray-300'
                                        }`}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className={`flex-1 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition border ${
                                            isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-150'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!consequence1 || !consequence2 || !consequence3 || !consequence4 || confirmText !== "DELETE" || isDeleting}
                                        onClick={handleFinalDelete}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition disabled:opacity-40 disabled:hover:bg-red-600 disabled:cursor-not-allowed shadow-md shadow-red-200"
                                    >
                                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
    );
};

export default Settings;