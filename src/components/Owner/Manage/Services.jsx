import React, { useState } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";

// IMPORTING NEW CUSTOM IMAGES PATHS (SERVICES)
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import categoryIcon from '../../../assets/Owner/Manage/Services/category_icon.svg';
import durationIcon from '../../../assets/Owner/Manage/Services/duration_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import priceIcon from '../../../assets/Owner/Manage/Services/price_icon.svg';
import serviceNameIcon from '../../../assets/Owner/Manage/Services/service_name_icon.svg';

// Custom Staff Path Asset Icons
import nameIcon from '../../../assets/Owner/Manage/Staff/name_icon.svg';
import genderIcon from '../../../assets/Owner/Manage/Staff/gender_icon.svg';
import specialtyIcon from '../../../assets/Owner/Manage/Staff/speciality_icon.svg';
import dateIcon from '../../../assets/Owner/Manage/Staff/BirthDateIcon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';
import idIcon from '../../../assets/Owner/Manage/Staff/team_member_icon.svg'; 

// Import Schedule folder icons for back-compatibility fallback
import clockIcon from '../../../assets/Owner/Manage/Schedule/clock_icon.svg';
import profileIcon from '../../../assets/Owner/Manage/Schedule/profile_icon.jpg';

const Service = () => {
    // ACTIVE WORKSPACE SELECTION TRACKING FOR DYNAMIC VIEW TOGGLE
    const [currentTab, setCurrentTab] = useState('Service');

    // ==========================================
    // 1. SERVICE WORKSPACE STATES & LOGIC
    // ==========================================
    const [serviceName, setServiceName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');

    const [services, setServices] = useState([
        { name: 'HAIR CUT', category: 'Hair Cut', duration: '1 hour', price: '200', image: profileIcon },
        { name: 'Shaving', category: 'Hair Cut', duration: '1 hour', price: '150', image: profileIcon }
    ]);

    const handleServiceSave = (e) => {
        e.preventDefault();
        if (!serviceName || !price) return alert("Please fill out the required fields!");

        const newService = {
            name: serviceName.toUpperCase(),
            category: category || 'General',
            duration: duration || '1 hour',
            price: price,
            image: profileIcon
        };

        setServices([newService, ...services]);
        setServiceName('');
        setCategory('');
        setPrice('');
        setDuration('');
    };

    // ==========================================
    // 2. STAFF WORKSPACE STATES & LOGIC
    // ==========================================
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [speciality, setSpeciality] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [teamMemberId, setTeamMemberId] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const [staffList, setStaffList] = useState([
        { id: '1', name: 'Mitesh Waghmode', speciality: 'Hair Stylist', gender: 'Male', birthdate: '29 July 1998', initial: 'T' },
        { id: '2', name: 'Shubham Satpute', speciality: 'Grooming & Hair Removal', gender: 'Male', birthdate: '29 July 1998', initial: 'S' },
        { id: '3', name: 'Shubhada Acharya', speciality: 'Skin & Facial Services', gender: 'female', birthdate: '29 July 1998', initial: 'S' }
    ]);

    const handleStaffSave = (e) => {
        e.preventDefault();
        if (!name || !speciality) return alert("Please fill out the required fields!");

        const newStaff = {
            id: Date.now().toString(),
            name: name,
            speciality: speciality,
            gender: gender || 'Not Specified',
            birthdate: birthdate ? new Date(birthdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '29 July 1998',
            initial: name.charAt(0).toUpperCase()
        };

        setStaffList([newStaff, ...staffList]);
        setName('');
        setGender('');
        setSpeciality('');
        setBirthdate('');
        setStartDate('');
        setEndDate('');
        setTeamMemberId('');
    };

    const filterTags = ['All', 'Hair Stylist', 'Skin Treatment', 'Hair Treatment', 'Others'];
    const filteredStaff = staffList.filter((staff) => {
        if (activeFilter === 'All') return true;
        return staff.speciality.toLowerCase().includes(activeFilter.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVBAR */}
            <Navbar />

            {/* THREE-COLUMN LAYOUT FRAMEWORK */}
            <div className="flex flex-1 w-full">
                {/* LEVEL 1: PRIMARY APP SIDEBAR */}
                <Sidebar />

                {/* LEVEL 2: MANAGEMENT WORKSPACE SUB-SIDEBAR */}
                <ManageSideBar activeTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />

                {/* LEVEL 3: WORKING PANELS CANVAS */}
                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">

                    {/* ==========================================
                        VIEW RENDERER A: SERVICE DASHBOARD PANEL
                       ========================================== */}
                    {currentTab === 'Service' && (
                        <>
                            <div className="inline-block border-b-2 border-red-600 pb-2 mb-6">
                                <div className="flex items-center space-x-2 text-gray-900">
                                    <span className="text-xl font-light leading-none select-none tracking-tight">+</span>
                                    <span className="text-[13px] font-bold uppercase tracking-wider">Add Service</span>
                                </div>
                            </div>

                            <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-8">
                                <form onSubmit={handleServiceSave} className="space-y-5">
                                    <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-[#FAFAFA] flex flex-col items-center justify-center space-y-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                                            <img src={openCameraIcon} alt="Upload" className="w-10 h-10 object-contain" />
                                        </div>
                                        <div className="flex items-center space-x-6 text-xs font-bold text-gray-500 tracking-tight">
                                            <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors">
                                                <img src={cameraIcon} alt="Camera" className="w-4 h-4 object-contain" />
                                                <span>Camera</span>
                                            </button>
                                            <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors">
                                                <img src={galleryIcon} alt="Gallery" className="w-4 h-4 object-contain" />
                                                <span>Gallery</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                            <img src={serviceNameIcon} alt="Service Name" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Service Name"
                                                value={serviceName}
                                                onChange={(e) => setServiceName(e.target.value)}
                                                className="w-full text-xs font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                            />
                                        </div>

                                        <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                            <img src={categoryIcon} alt="Category" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full text-xs font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer placeholder-gray-400"
                                            >
                                                <option value="" disabled hidden>Category</option>
                                                <option value="Hair Cut">Hair Cut</option>
                                                <option value="Skin Care">Skin Care</option>
                                                <option value="Shaving">Shaving</option>
                                            </select>
                                            <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                        </div>

                                        <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                            <img src={priceIcon} alt="Price" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full text-xs font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                            />
                                        </div>

                                        <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                            <img src={durationIcon} alt="Duration" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Duration (e.g., 1 hour)"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full text-xs font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 text-xs font-bold uppercase tracking-wider">
                                        <button type="submit" className="w-full sm:flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-100">Save</button>
                                        <button type="button" onClick={() => { setServiceName(''); setCategory(''); setPrice(''); setDuration(''); }} className="w-full sm:flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                    </div>
                                </form>
                            </div>

                            <div>
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">View All</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                                    {services.map((service, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-shadow">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                    <img src={service.image} alt="Service View" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-extrabold text-gray-900 tracking-tight">{service.name}</h4>
                                                    <div className="flex items-center space-x-2.5 text-[10px] font-bold text-gray-400 mt-0.5 tracking-tight">
                                                        <span className="text-gray-500">{service.category}</span>
                                                        <span className="flex items-center">
                                                            <img src={durationIcon} alt="Duration" className="w-3 h-3 mr-1 opacity-60 object-contain" />
                                                            {service.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right pr-2">
                                                <p className="text-[15px] font-extrabold text-gray-900 tracking-tight">₹ {service.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ==========================================
                        VIEW RENDERER B: STAFF DASHBOARD PANEL
                       ========================================== */}
                    {currentTab === 'Staff' && (
                        <>
                            <div className="inline-block border-b-2 border-red-600 pb-2 mb-6">
                                <div className="flex items-center space-x-2 text-gray-900">
                                    <span className="text-xl font-light leading-none select-none tracking-tight">+</span>
                                    <span className="text-[13px] font-bold uppercase tracking-wider">Add Staff</span>
                                </div>
                            </div>

                            <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-8">
                                <form onSubmit={handleStaffSave} className="space-y-5">
                                    <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-[#FAFAFA] flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                                            <img src={openCameraIcon} alt="Upload" className="w-8 h-8 object-contain" />
                                        </div>
                                        <span className="text-xs text-gray-400 font-semibold -mt-1">Add Image</span>
                                        <div className="flex items-center space-x-6 text-[11px] font-bold text-gray-500 tracking-tight">
                                            <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors">
                                                <img src={cameraIcon} alt="Camera" className="w-3.5 h-3.5 object-contain" />
                                                <span>Camera</span>
                                            </button>
                                            <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors">
                                                <img src={galleryIcon} alt="Gallery" className="w-3.5 h-3.5 object-contain" />
                                                <span>Gallery</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                                <img src={nameIcon} alt="Name" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter Name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full text-xs font-medium placeholder-gray-400 text-gray-700 outline-none bg-transparent"
                                                />
                                            </div>

                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                                <img src={genderIcon} alt="Gender" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                                <select
                                                    value={gender}
                                                    onChange={(e) => setGender(e.target.value)}
                                                    className="w-full text-xs font-medium text-gray-700 appearance-none bg-transparent outline-none cursor-pointer"
                                                >
                                                    <option value="" disabled unselectable="true">Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <span className="absolute right-4 pointer-events-none text-gray-400 text-[9px]">▼</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                                <img src={specialtyIcon} alt="Speciality" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                                <input
                                                    type="text"
                                                    placeholder="Speciality"
                                                    value={speciality}
                                                    onChange={(e) => setSpeciality(e.target.value)}
                                                    className="w-full text-xs font-medium placeholder-gray-400 text-gray-700 outline-none bg-transparent"
                                                />
                                            </div>

                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                                <img src={dateIcon} alt="Birthdate" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                                <input
                                                    type="text"
                                                    placeholder="Birthdate"
                                                    onFocus={(e) => (e.target.type = "date")}
                                                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                                    value={birthdate}
                                                    onChange={(e) => setBirthdate(e.target.value)}
                                                    className="w-full text-xs font-medium placeholder-gray-400 text-gray-700 outline-none bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                                <img src={dateIcon} alt="Start Date" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                                <input
                                                    type="text"
                                                    placeholder="Start Date"
                                                    onFocus={(e) => (e.target.type = "date")}
                                                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full text-xs font-medium placeholder-gray-400 text-gray-700 outline-none bg-transparent"
                                                />
                                            </div>

                                            <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                                <img src={dateIcon} alt="End Date" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                                <input
                                                    type="text"
                                                    placeholder="End Date"
                                                    onFocus={(e) => (e.target.type = "date")}
                                                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full text-xs font-medium placeholder-gray-400 text-gray-700 outline-none bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative flex items-center border border-gray-200 rounded-xl px-3.5 py-2.5 bg-[#F9F9F9] focus-within:border-gray-400 transition-colors">
                                            <img src={idIcon} alt="Team Member ID" className="w-4 h-4 mr-2.5 object-contain opacity-60" />
                                            <input
                                                type="text"
                                                placeholder="Team Member ID"
                                                value={teamMemberId}
                                                onChange={(e) => setTeamMemberId(e.target.value)}
                                                className="w-full text-xs font-medium placeholder-gray-400 text-gray-700 outline-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2 text-xs font-bold uppercase tracking-wider">
                                        <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors">Save</button>
                                        <button type="button" onClick={() => { setName(''); setGender(''); setSpeciality(''); setBirthdate(''); setStartDate(''); setEndDate(''); setTeamMemberId(''); }} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                    </div>
                                </form>
                            </div>

                            <div className="max-w-3xl">
                                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-900 mb-3">Staff Details</h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {filterTags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setActiveFilter(tag)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight border transition-colors ${
                                                activeFilter === tag ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2.5">
                                    {filteredStaff.map((staff) => (
                                        <div key={staff.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-none">
                                            <div className="flex items-center space-x-3.5">
                                                <div className="w-10 h-10 min-w-[40px] rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-800 font-bold text-sm shadow-sm relative group">
                                                    {staff.initial}
                                                    <span className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-0.5 hidden group-hover:block">
                                                        <img src={editIcon} alt="Staff Icon" className="w-2.5 h-2.5 object-contain" />
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-gray-900 tracking-tight">{staff.name}</h4>
                                                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5 tracking-tight flex flex-wrap items-center gap-1">
                                                        <span className="text-gray-500">Speciality : {staff.speciality}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>Gender : {staff.gender}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>Birthdate : {staff.birthdate}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button" className="border border-gray-300 text-[10px] font-bold uppercase tracking-wider text-gray-700 px-3 py-1 rounded-md bg-white hover:bg-gray-50 transition-colors flex items-center space-x-1">
                                                <img src={editIcon} alt="Edit" className="w-3 h-3 object-contain opacity-70 mr-1 inline" />
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ==========================================
                        VIEW RENDERER C: DASHBOARD WORKSPACE PANEL
                       ========================================== */}
                    {currentTab === 'Dashboard' && (
                        <div className="max-w-4xl space-y-6">
                            <div className="inline-block border-b-2 border-red-600 pb-2 mb-2">
                                <div className="flex items-center space-x-2 text-gray-900">
                                    <span className="text-[13px] font-bold uppercase tracking-wider">Workspace Dashboard</span>
                                </div>
                            </div>

                            {/* Analytics KPI Summary Block Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Services</span>
                                    <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{services.length}</h3>
                                </div>
                                <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Active Staff</span>
                                    <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{staffList.length}</h3>
                                </div>
                                <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Avg Service Price</span>
                                    <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                                        ₹ {services.length ? Math.round(services.reduce((acc, s) => acc + Number(s.price), 0) / services.length) : 0}
                                    </h3>
                                </div>
                            </div>

                            {/* Info Canvas Split Zone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                                    <h4 className="text-xs font-extrabold uppercase text-gray-900 mb-3 tracking-wider">Recent Services</h4>
                                    <div className="divide-y divide-gray-100 space-y-2">
                                        {services.slice(0, 3).map((s, i) => (
                                            <div key={i} className="flex justify-between items-center pt-2 text-xs">
                                                <span className="font-bold text-gray-800">{s.name}</span>
                                                <span className="text-gray-500 font-semibold">₹{s.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                                    <h4 className="text-xs font-extrabold uppercase text-gray-900 mb-3 tracking-wider">Staff Roster</h4>
                                    <div className="divide-y divide-gray-100 space-y-2">
                                        {staffList.slice(0, 3).map((st, i) => (
                                            <div key={i} className="flex justify-between items-center pt-2 text-xs">
                                                <span className="font-bold text-gray-800">{st.name}</span>
                                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">{st.speciality}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* GLOBAL FOOTER */}
            <Footer />
        </div>
    );
}

export default Service;