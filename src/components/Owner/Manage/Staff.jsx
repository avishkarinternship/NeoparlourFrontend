import React, { useState, useEffect, useCallback } from 'react';

// IMPORTING RELEVANT STAFF CUSTOM ICONS
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';

// Custom Staff Path Asset Icons
import nameIcon from '../../../assets/Owner/Manage/Staff/name_icon.svg';
import genderIcon from '../../../assets/Owner/Manage/Staff/gender_icon.svg';
import specialtyIcon from '../../../assets/Owner/Manage/Staff/speciality_icon.svg';
import dateIcon from '../../../assets/Owner/Manage/Staff/BirthDateIcon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg';
import idIcon from '../../../assets/Owner/Manage/Staff/team_member_icon.svg'; 

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from '../Layouts/ManageSideBar';
import axiosInstance from '../../../api/axiosInstance';

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
    return <span className="font-bold text-gray-800 text-xs">{fallbackText}</span>;
  }

  return <img src={src} alt={alt} className={className} />;
};

const Staff = () => {    
    // Controlled input form states for adding a new staff member
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [speciality, setSpeciality] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [teamMemberId, setTeamMemberId] = useState('');

    // Local and active search filters for API query
    const [localFilters, setLocalFilters] = useState({
        name: '',
        phone: '',
        email: '',
        status: ''
    });

    const [activeFilters, setActiveFilters] = useState({
        name: '',
        phone: '',
        email: '',
        status: ''
    });

    // Dynamic staff states
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchStaffList = useCallback(async (currentPage, currentFilters, signal) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: 5
            };
            if (currentFilters.name) params.name = currentFilters.name;
            if (currentFilters.phone) params.phone = currentFilters.phone;
            if (currentFilters.email) params.email = currentFilters.email;
            if (currentFilters.status) params.status = currentFilters.status;

            const response = await axiosInstance.get('/staff/search', {
                params,
                signal
            });
            const content = (response.data?.content || []).map(staff => ({
                ...staff,
                speciality: staff.speciality || ['Hair Stylist', 'Grooming', 'Skin Care', 'Others'][staff.id % 4]
            }));
            setStaffList(content);
            setTotalPages(response.data?.page?.totalPages || 1);
            setTotalElements(response.data?.page?.totalElements || 0);
        } catch (error) {
            if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
                console.error('Failed to fetch staff list:', error);
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchStaffList(page, activeFilters, controller.signal);
        return () => {
            controller.abort();
        };
    }, [page, activeFilters, fetchStaffList]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e) => {
        if (e) e.preventDefault();
        setActiveFilters(localFilters);
        setPage(0);
    };

    const clearFilters = () => {
        const cleared = { name: '', phone: '', email: '', status: '' };
        setLocalFilters(cleared);
        setActiveFilters(cleared);
        setPage(0);
    };

    const handleSave = (e) => {
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

        // Prepend locally for preview
        setStaffList([newStaff, ...staffList]);

        // Reset Form Elements
        setName('');
        setGender('');
        setSpeciality('');
        setBirthdate('');
        setStartDate('');
        setEndDate('');
        setTeamMemberId('');
    };

    const filteredStaff = staffList;

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVBAR */}
            <Navbar />

            {/* THREE-COLUMN LAYOUT FRAMEWORK CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">
                
                {/* LEVEL 1: PRIMARY APP SIDEBAR */}
                <Sidebar />

                {/* LEVEL 2: SUB-MANAGEMENT APP SIDEBAR */}
                <ManageSideBar activeTab="Staff" onTabChange={(tab) => console.log(`Routing to workspace: ${tab}`)} />

                {/* LEVEL 3: WORKING PANELS CANVAS */}
                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">

                    {/* Active Feature Headline View Header Indicator */}
                    <div className="inline-block border-b-2 border-red-600 pb-2 mb-6">
                        <div className="flex items-center space-x-2 text-gray-900">
                            <span className="text-xl font-light leading-none select-none tracking-tight">+</span>
                            <span className="text-[13px] font-bold uppercase tracking-wider">
                                Add Staff
                            </span>
                        </div>
                    </div>

                    {/* ADD STAFF WORKFLOW PANEL BOX */}
                    <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-8">
                        <form onSubmit={handleSave} className="space-y-5">

                            {/* Media Upload Container Zone */}
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

                            {/* COMPREHENSIVE VARIABLE FORM CONFIGURATION MATRIX */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Field 1: Enter Name */}
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

                                    {/* Field 2: Select Gender */}
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
                                    {/* Field 3: Speciality */}
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

                                    {/* Field 4: Birthdate */}
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
                                    {/* Field 5: Start Date */}
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

                                    {/* Field 6: End Date */}
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

                                {/* Field 7: Team Member ID */}
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

                            {/* ACTION BUTTONS SUBMIT BAR */}
                            <div className="flex items-center gap-4 pt-2 text-xs font-bold uppercase tracking-wider">
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setName(''); setGender(''); setSpeciality('');
                                        setBirthdate(''); setStartDate(''); setEndDate(''); setTeamMemberId('');
                                    }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* STAFF DETAILS DASHBOARD GRID CONTAINER */}
                    <div className="max-w-3xl">
                        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-900 mb-3">
                            Staff Details
                        </h3>

                        {/* Interactive Search Filter Section */}
                        <form onSubmit={applyFilters} className="max-w-3xl bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                                    </svg>
                                    Search Filters
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-[10px] text-gray-400 hover:text-red-600 font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Clear All
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow transition-all"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Name Filter */}
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Staff Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={localFilters.name}
                                        onChange={handleFilterChange}
                                        placeholder="Search name..."
                                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors font-medium text-gray-800"
                                    />
                                </div>

                                {/* Phone Filter */}
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                                    <input 
                                        type="text" 
                                        name="phone"
                                        value={localFilters.phone}
                                        onChange={handleFilterChange}
                                        placeholder="Search phone..."
                                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors font-medium text-gray-800"
                                    />
                                </div>

                                {/* Email Filter */}
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Email</label>
                                    <input 
                                        type="text" 
                                        name="email"
                                        value={localFilters.email}
                                        onChange={handleFilterChange}
                                        placeholder="Search email..."
                                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors font-medium text-gray-800"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Status</label>
                                    <select
                                        name="status"
                                        value={localFilters.status}
                                        onChange={handleFilterChange}
                                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors font-medium text-gray-800 appearance-none cursor-pointer"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <span className="absolute right-3.5 bottom-2 pointer-events-none text-gray-400 text-[8px]">▼</span>
                                </div>
                            </div>
                        </form>

                        {/* Horizontal Stacked List Rows */}
                        <div className="space-y-2.5 min-h-[150px]">
                            {loading ? (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <div className="animate-spin h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Loading staff...</span>
                                </div>
                            ) : filteredStaff.length === 0 ? (
                                <div className="text-center py-8 text-xs text-gray-400 font-bold border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    No staff members found.
                                </div>
                            ) : (
                                filteredStaff.map((staff) => {
                                    const nameInitial = staff.name?.charAt(0).toUpperCase() || 'S';
                                    return (
                                        <div
                                            key={staff.id}
                                            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all"
                                        >
                                            <div className="flex items-center space-x-3.5">
                                                {/* Colored Circle Initials Avatar Holder Block */}
                                                <div className="w-10 h-10 min-w-[40px] rounded-full bg-white border border-gray-300 overflow-hidden flex items-center justify-center text-gray-800 font-bold text-sm shadow-sm relative group">
                                                    {staff.imagePath ? (
                                                        <AsyncImage 
                                                            imagePath={staff.imagePath} 
                                                            alt={staff.name} 
                                                            className="w-full h-full object-cover" 
                                                            fallbackText={nameInitial} 
                                                        />
                                                    ) : (
                                                        nameInitial
                                                    )}
                                                    <span className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-0.5 hidden group-hover:block">
                                                        <img src={editIcon} alt="Staff Icon" className="w-2.5 h-2.5 object-contain" />
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-gray-900 tracking-tight">
                                                        {staff.name}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5 tracking-tight flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                        <span className="text-gray-500">Speciality: {staff.speciality || 'Stylist'}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>Gender: {staff.gender?.toLowerCase() || 'Not Specified'}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>Phone: {staff.phone || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Edit Interface Button */}
                                            <button 
                                                type="button" 
                                                className="border border-gray-300 text-[10px] font-bold uppercase tracking-wider text-gray-700 px-3 py-1 rounded-md bg-white hover:bg-gray-50 transition-colors flex items-center space-x-1"
                                            >
                                                <img src={editIcon} alt="Edit" className="w-3 h-3 object-contain opacity-70 mr-1 inline" />
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                                <p className="text-[10px] font-bold text-gray-400">
                                    Showing Page <span className="text-gray-900 font-extrabold">{page + 1}</span> of <span className="text-gray-900 font-extrabold">{totalPages}</span> ({totalElements} members)
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                                        disabled={page === 0}
                                        className={`px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg border transition-all ${
                                            page === 0 
                                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 shadow-sm active:scale-95'
                                        }`}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                                        disabled={page === totalPages - 1}
                                        className={`px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg border transition-all ${
                                            page === totalPages - 1 
                                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 shadow-sm active:scale-95'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                </main>
            </div>

            {/* GLOBAL FOOTER */}
            <Footer />
        </div>
    );
}

export default Staff;