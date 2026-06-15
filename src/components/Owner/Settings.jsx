import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Navbar from "./Layouts/Navbar";
import Sidebar from "./Layouts/SideBar";
import Footer from "./Layouts/Footer";

const Settings = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("owner");

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
    });

    useEffect(() => {
        fetchOwnerProfile();
        fetchSalonProfile();
    }, []);

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

            setSalonProfile(response.data);
        } catch (error) {
            console.log(error);
        }
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

            alert("Owner profile updated successfully");
        } catch (error) {
            console.log(error);
        }
    };


    const updateSalonProfile = async () => {
        try {
            await axiosInstance.put(
                `/salons/profile`,
                salonProfile
            );

            alert("Salon profile updated successfully");
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


    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col">

            <Navbar
                onToggleSidebar={() =>
                    setIsSidebarOpen(!isSidebarOpen)
                }
            />

            <div className="flex flex-1">

                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

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
                                <h2 className="text-2xl font-bold mb-6">Owner Profile</h2>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-sm text-gray-500">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={ownerProfile.name || ''}
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
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Gender</label>
                                            <select
                                                name="gender"
                                                value={ownerProfile.gender || ''}
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
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                    </div>
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
                                                onChange={handleOwnerChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={updateOwnerProfile}
                                        className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold w-full hover:bg-red-600 transition-colors"
                                    >
                                        Update Owner Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'salon' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Salon Profile</h2>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Salon Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-gray-500">Salon Name</label>
                                            <input
                                                type="text"
                                                name="salonName"
                                                value={salonProfile.salonName || ''}
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
                                                onChange={handleSalonChange}
                                                className="w-full border rounded-xl px-4 py-3 mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={updateSalonProfile}
                                        className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold w-full hover:bg-red-600 transition-colors"
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
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Settings;