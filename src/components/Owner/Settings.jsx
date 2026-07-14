import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const Settings = () => {
    const navigate = useNavigate();
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
    });

    const [salonProfile, setSalonProfile] = useState({
        salonName: "",
        email: "",
        phone: "",
        cityName: "",
        areaName: "",
        address: "",
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

    const [discountMode, setDiscountMode] = useState("NONE"); // "NONE", "WEEKDAY", "CATEGORY"

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    // Salon image upload states
    const [logoBase64, setLogoBase64] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [existingSalonImages, setExistingSalonImages] = useState([]);
    const [newGalleryBase64s, setNewGalleryBase64s] = useState([]);
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

    useEffect(() => {
        fetchOwnerProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'salon') {
            fetchSalonProfile();
        }
    }, [activeTab]);

    const fetchOwnerProfile = async () => {
        try {
            const storedUserStr = localStorage.getItem('ownerStaffUser');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                setOwnerProfile({
                    ...storedUser,
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
                weekdayDiscount: data.weekdayDiscount !== null && data.weekdayDiscount !== undefined ? data.weekdayDiscount : "",
                morningDiscount: data.morningDiscount !== null && data.morningDiscount !== undefined ? data.morningDiscount : "",
                afternoonDiscount: data.afternoonDiscount !== null && data.afternoonDiscount !== undefined ? data.afternoonDiscount : "",
                eveningDiscount: data.eveningDiscount !== null && data.eveningDiscount !== undefined ? data.eveningDiscount : "",
                nightDiscount: data.nightDiscount !== null && data.nightDiscount !== undefined ? data.nightDiscount : "",
            });
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

    console.log(ownerProfile);

    const handleSalonChange = (e) => {
        const { name, value } = e.target;

        setSalonProfile((prev) => ({
            ...prev,
            [name]: value,
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

            const response = await axiosInstance.put(
                `/auth/users/${userId}`,
                ownerProfile
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
            const payload = {
                ...salonProfile,
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

    return (
                <main className="flex-1 p-8 overflow-y-auto">
                    {/* TABS */}
                    <div className="flex space-x-4 mb-8 border-b border-gray-200">
                        <button
                            className={`pb-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'owner' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('owner')}
                        >
                            Owner Profile
                        </button>
                        <button
                            className={`pb-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'salon' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('salon')}
                        >
                            Salon Profile
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 max-w-4xl mx-auto">
                        {activeTab === 'owner' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Owner Profile</h2>

                                    <button
                                        onClick={() => setIsOwnerEdit(!isOwnerEdit)}
                                        className={`px-5 py-2 rounded-xl font-medium transition ${isOwnerEdit
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "bg-gray-800 text-white hover:bg-black"
                                            }`}
                                    >
                                        {isOwnerEdit ? "Done" : "Edit"}
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-sm text-gray-500">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={ownerProfile.name || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="birthdate"
                                                value={ownerProfile.birthdate || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Gender</label>
                                            <select
                                                name="gender"
                                                value={ownerProfile.gender || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1 bg-white"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Contact Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={ownerProfile.phone || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
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
                                <div className="mt-12 pt-8 border-t border-red-100">
                                    <h3 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wide">Danger Zone</h3>
                                    <p className="text-xs text-gray-500 mb-4">Permanently delete your account and deactivate your salon listings.</p>
                                    <div className="bg-red-50/20 border border-red-100 rounded-2xl p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="max-w-xl">
                                                <h4 className="text-sm font-bold text-gray-900">Delete Account & Salon</h4>
                                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
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
                                    <h2 className="text-2xl font-bold">Salon Profile</h2>

                                    <button
                                        onClick={() => setIsSalonEdit(!isSalonEdit)}
                                        className={`px-5 py-2 rounded-xl font-medium transition ${isSalonEdit
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "bg-gray-800 text-white hover:bg-black"
                                            }`}
                                    >
                                        {isSalonEdit ? "Done" : "Edit"}
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Salon Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-500">Salon Name</label>
                                            <input
                                                type="text"
                                                name="salonName"
                                                value={salonProfile.salonName || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Salon Code</label>
                                            <input
                                                type="text"
                                                value={salonProfile.salonCode || ''}
                                                disabled
                                                className="w-full border rounded-xl px-4 py-3 mt-1 bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Contact Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={salonProfile.phone || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* {salonProfile.qrCodeUrl && (
                                        <div className="mt-6 flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-max mx-auto">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-3">Salon QR Code</h4>
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
                                    )} */}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Business Hours</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-sm text-gray-500">Opening Time</label>
                                            <input
                                                type="time"
                                                name="openingTime"
                                                value={salonProfile.openingTime || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Closing Time</label>
                                            <input
                                                type="time"
                                                name="closingTime"
                                                value={salonProfile.closingTime || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Weekly Off Day</label>
                                            <select
                                                name="weeklyOffDay"
                                                value={salonProfile.weeklyOffDay || ''}
                                                onChange={handleSalonChange}
                                                disabled={!isSalonEdit}
                                                className="w-full border rounded-xl px-4 py-3 mt-1 bg-white"
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
                                            <label className="text-sm text-gray-500">Home Service Charges</label>
                                            <input
                                                type="number"
                                                name="homeServiceCharges"
                                                value={salonProfile.homeServiceCharges || ''}
                                                disabled={!isSalonEdit}
                                                onChange={handleSalonChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Discount Settings</h3>
                                    
                                    <div className="mb-6">
                                        <label className="text-sm font-semibold text-gray-600 block mb-3">Active Discount Mode</label>
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
                                                            ? 'border-red-500 bg-red-50/20 text-red-950 shadow-sm'
                                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300'
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
                                                <label className="text-sm text-gray-500">Weekday Discount (%)</label>
                                                <input
                                                    type="number"
                                                    name="weekdayDiscount"
                                                    value={salonProfile.weekdayDiscount !== null && salonProfile.weekdayDiscount !== undefined ? salonProfile.weekdayDiscount : ''}
                                                    disabled={!isSalonEdit}
                                                    onChange={handleSalonChange}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:border-red-500 bg-white"
                                                    placeholder="e.g. 10"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {discountMode === "CATEGORY" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 block mb-1">Morning Discount (%)</label>
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
                                                    className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:border-red-500 bg-white"
                                                    placeholder="e.g. 15"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 block mb-1">Afternoon Discount (%)</label>
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
                                                    className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:border-red-500 bg-white"
                                                    placeholder="e.g. 10"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 block mb-1">Evening Discount (%)</label>
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
                                                    className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:border-red-500 bg-white"
                                                    placeholder="e.g. 5"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 block mb-1">Night Discount (%)</label>
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
                                                    className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:border-red-500 bg-white"
                                                    placeholder="e.g. 20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {discountMode === "NONE" && (
                                        <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            Discounts are currently disabled.
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Address Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-500">Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={ownerProfile.address || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">City</label>
                                            <input
                                                type="text"
                                                name="cityName"
                                                value={ownerProfile.cityName || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Area</label>
                                            <input
                                                type="text"
                                                name="areaName"
                                                value={ownerProfile.areaName || ''}
                                                disabled={!isOwnerEdit}
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Salon Images</h3>
                                    
                                    {/* Salon Logo */}
                                    <div className="mb-6">
                                        <label className="text-sm font-semibold text-gray-600 block mb-2">Salon Logo (Main Image)</label>
                                        <div className="flex items-center space-x-6">
                                            <div className="w-24 h-24 rounded-xl border overflow-hidden bg-gray-50 flex items-center justify-center relative shadow-sm">
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
                                                    <label className="cursor-pointer bg-gray-800 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow transition-colors inline-block">
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
                                        <label className="text-sm font-semibold text-gray-600 block mb-3">Salon Gallery Images</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {/* Existing Gallery Images */}
                                            {existingSalonImages.map((imgUrl, idx) => (
                                                <div key={`existing-${idx}`} className="aspect-square rounded-2xl border overflow-hidden bg-gray-50 relative group shadow-sm">
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
                                                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FF0B01] hover:bg-red-50/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group">
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
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        Update Salon Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        

                        {salonProfile.qrCodeUrl && (
                            <div className="mt-6 flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-max mx-auto">
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">Salon QR Code</h4>
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
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
                                <h2 className="text-xl font-semibold text-green-600 mb-4">
                                    Success
                                </h2>

                                <p className="text-gray-700 mb-6">
                                    {popupMessage}
                                </p>

                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Salon Deactivation Warning Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl p-8 max-w-xl w-full relative overflow-hidden transition-all duration-300 transform scale-100 max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="p-3 bg-red-50 text-red-500 rounded-2xl">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Delete Account & Deactivate Salon?</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">consequences acknowledgment required</p>
                                    </div>
                                </div>

                                {/* Consequences Acknowledgment checkboxes */}
                                <div className="space-y-4 mb-6">
                                    <p className="text-xs text-gray-500 font-medium">To proceed, please acknowledge the following consequences of this action:</p>
                                    
                                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consequence1}
                                            onChange={(e) => setConsequence1(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 leading-normal font-medium">
                                            <strong className="text-gray-900 block font-bold mb-0.5">Salon Disappeared from Search</strong>
                                            I understand my salon ({salonProfile.salonName || ownerProfile.salonName || "your salon"}) will be made inactive immediately. Customers will no longer see it in location search results or browse its services.
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consequence2}
                                            onChange={(e) => setConsequence2(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 leading-normal font-medium">
                                            <strong className="text-gray-900 block font-bold mb-0.5">Customer Bookings Suspended</strong>
                                            I understand customers will be blocked from viewing my salon profile or booking any new appointments.
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consequence3}
                                            onChange={(e) => setConsequence3(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 leading-normal font-medium">
                                            <strong className="text-gray-900 block font-bold mb-0.5">Staff Members Suspended</strong>
                                            I understand all my staff members will be logged out immediately. They will be blocked from logging in or calling any salon APIs.
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consequence4}
                                            onChange={(e) => setConsequence4(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 leading-normal font-medium">
                                            <strong className="text-gray-900 block font-bold mb-0.5">Subscription Status</strong>
                                            I understand my active subscription will remain inactive but will not be automatically refunded.
                                        </span>
                                    </label>
                                </div>

                                {/* Grace Period Info Box */}
                                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 mb-6">
                                    <div className="flex gap-2.5">
                                        <span className="text-amber-600 mt-0.5">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                        <div>
                                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">30-Day Recovery Grace Period</h4>
                                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium mt-1">
                                                Your data is not permanently deleted immediately. You have a 30-day grace period to restore your account. If you log back into this owner account within 30 days, your owner profile will be restored, and your salon (along with active subscriptions) will be reactivated. After 30 days, all data is permanently wiped.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Double Confirmation Text Input */}
                                <div className="mb-6">
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                                        Type <span className="text-red-600 font-black">DELETE</span> to confirm:
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder="Type DELETE"
                                        className="w-full px-4 py-3 bg-[#fafafa] border border-gray-150 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:bg-white transition placeholder-gray-300 font-bold"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition border border-slate-150"
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