import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

// 1. Keep these correct relative imports (climbing out of your layout folder to src/assets)
import logoIcon from '../../../assets/Owner/logo_icon.svg';
import profileIcon from '../../../assets/Owner/profile.jpg';

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
    return <span className="font-bold text-gray-800 text-[10px]">{fallbackText}</span>;
  }

  return <img src={src} alt={alt} className={className} />;
};

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [staffResults, setStaffResults] = useState([]);
  const [appointmentResults, setAppointmentResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setStaffResults([]);
      setAppointmentResults([]);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const searchTerm = query.trim();
        const isNumeric = /^\d+$/.test(searchTerm);
        const isEmail = searchTerm.includes('@');

        // Build search parameters dynamically based on input format
        const staffParams = { page: 0, size: 5 };
        if (isEmail) staffParams.email = searchTerm;
        else if (isNumeric) staffParams.phone = searchTerm;
        else staffParams.name = searchTerm;

        const staffPromise = axiosInstance.get('/staff/search', {
          params: staffParams,
          signal: controller.signal
        });

        let appointmentPromise = Promise.resolve({ data: { content: [] } });
        if (isNumeric) {
          appointmentPromise = axiosInstance.get('/appointments/search/advanced', {
            params: { mobile: searchTerm, page: 0, size: 5 },
            signal: controller.signal
          });
        }

        const [staffRes, appointmentRes] = await Promise.all([
          staffPromise,
          appointmentPromise
        ]);

        setStaffResults(staffRes.data?.content || []);
        setAppointmentResults(appointmentRes.data?.content || []);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
          console.error("Universal search failed:", err);
        }
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [query]);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between sticky top-0 z-50">

      {/* Left Logo Area */}
      <div className="w-20 md:w-44 lg:w-64 h-full flex items-center px-3 sm:px-4 md:px-6 border-r border-gray-200 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="mr-3 p-1 text-gray-500 hover:text-gray-900 lg:hidden focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/owner/dashboard')}>
          <img
            src={logoIcon}
            alt="NeoParlour Logo"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          <span className="text-gray-900 text-base font-bold tracking-tight hidden md:inline">
            NeoParlour
          </span>
        </div>
      </div>

      {/* Right Container Elements */}
      <div className="flex items-center justify-end flex-1 px-3 sm:px-6 space-x-2.5 sm:space-x-6 min-w-0">

        {/* Pill-Shaped Inline Search Field with Dropdown container */}
        <div ref={dropdownRef} className="relative flex-1 max-w-[140px] sm:max-w-xs md:max-w-md transition-all duration-300">
          <div className="border border-gray-300 rounded-full p-1 pl-3 sm:pl-4 flex items-center bg-white focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 transition-all duration-200">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-transparent text-[11px] sm:text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            {query && (
              <button 
                type="button"
                onClick={() => {
                  setQuery('');
                  setShowDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600 mr-2 text-[10px] font-bold"
              >
                ✕
              </button>
            )}
            <button className="hidden sm:block bg-red-600 text-white px-5 py-1.5 text-xs font-bold rounded-full hover:bg-red-700 uppercase tracking-wider transition-colors duration-150 flex-shrink-0">
              Search
            </button>
          </div>

          {/* Absolute Search Dropdown results */}
          {showDropdown && (query.trim().length > 0 || searching) && (
            <div className="absolute top-full right-0 w-[280px] sm:left-0 sm:w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto p-4 space-y-4">
              {searching && staffResults.length === 0 && appointmentResults.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Searching...</span>
                </div>
              ) : staffResults.length === 0 && appointmentResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-bold">
                  No matching records found.
                </div>
              ) : (
                <>
                  {/* Category 1: Staff Stylists */}
                  {staffResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Team Stylists
                      </h4>
                      <div className="space-y-1.5">
                        {staffResults.map(staff => {
                          const nameInitial = staff.name?.charAt(0).toUpperCase() || 'S';
                          return (
                            <button
                              key={staff.id}
                              onClick={() => {
                                navigate('/owner/manage/staff');
                                setShowDropdown(false);
                              }}
                              className="w-full flex items-center justify-between p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-red-50 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-[#ff0b01] text-[10px]">
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
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate group-hover:text-[#ff0b01]">{staff.name}</div>
                                  <div className="text-[9px] text-gray-400 font-semibold">{staff.phone}</div>
                                </div>
                              </div>
                              <span className="text-[8px] bg-red-50 text-[#ff0b01] px-1.5 py-0.5 rounded font-bold capitalize">
                                {staff.staffStatus}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Appointments */}
                  {appointmentResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Appointments
                      </h4>
                      <div className="space-y-1.5">
                        {appointmentResults.map(appt => (
                          <button
                            key={appt.id}
                            onClick={() => {
                              navigate('/owner/manage/schedule');
                              setShowDropdown(false);
                            }}
                            className="w-full p-2.5 hover:bg-red-50/10 rounded-xl text-left transition-all group flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#ff0b01] truncate">
                                {appt.customerName}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">
                                ₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-full mt-1">
                              <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[150px]">
                                {appt.serviceNames?.join(', ') || 'Grooming'}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                appt.status === 'booked' ? 'bg-red-50 text-[#ff0b01]' :
                                appt.status === 'completed' ? 'bg-[#E3F9EC] text-[#299764]' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {appt.status === 'booked' ? 'scheduled' : appt.status}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell with Badge */}
        <button className="text-gray-400 hover:text-gray-600 relative transition-colors">
          <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white">
            1
          </span>
        </button>

        {/* User Identity Profile Block */}
        <div className="flex items-center space-x-2 cursor-pointer group">
          {/* Circular image frame container */}
          <div className="h-8 w-8 rounded-full border border-gray-900 flex items-center justify-center overflow-hidden">
            <img
              src={profileIcon}
              alt="Prowin Wadkar Profile"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <span className="text-xs font-bold text-gray-800 tracking-tight hidden sm:inline group-hover:text-gray-600 transition-colors">
            Prowin Wadkar
          </span>
        </div>

      </div>
    </header>
  );
}