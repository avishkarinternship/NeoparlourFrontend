import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import axiosInstance from '../../../api/axiosInstance';

// FILE PATH INTEGRATION (Climbing out 3 levels to source assets)
import assignStaffIcon from '../../../assets/Owner/Manage/Schedule/assign_staff_icon.svg';
import calendarIcon from '../../../assets/Owner/Manage/Schedule/calender_icon.svg';
import clockIcon from '../../../assets/Owner/Manage/Schedule/clock_icon.svg';
import ManageSideBar from "../Layouts/ManageSideBar";

const getStatusParam = (tab) => {
  switch (tab) {
    case 'Scheduled':
      return 'booked';
    case 'Cancelled':
      return 'cancelled';
    case 'Completed':
      return 'completed';
    default:
      return 'booked';
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return { date: 'N/A', time: 'N/A' };
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return { date: isoString, time: '' };
    
    const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

    return {
      date: dateObj.toLocaleDateString('en-IN', dateOptions),
      time: dateObj.toLocaleTimeString('en-IN', timeOptions)
    };
  } catch {
    return { date: isoString, time: '' };
  }
};

const formatToISOInstant = (dateString, isEnd = false) => {
  if (!dateString) return undefined;
  return isEnd ? `${dateString}T23:59:59.999Z` : `${dateString}T00:00:00.000Z`;
};

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
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-[#ff0b01]">
        <div className="animate-spin h-3.5 w-3.5 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !src) {
    return <span className="font-bold text-[#ff0b01] text-[10px]">{fallbackText}</span>;
  }

  return <img src={src} alt={alt} className={className} />;
};

const Schedule = ()  => {
  const [currentSubTab, setCurrentSubTab] = useState('Scheduled');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Lazy-loaded staff list states
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffFetched, setStaffFetched] = useState(false);
  const [staffTotalElements, setStaffTotalElements] = useState(0);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [selectedStaffName, setSelectedStaffName] = useState('');

  // Filters State
  const [localFilters, setLocalFilters] = useState({
    mobile: '',
    staffId: '',
    minAmount: '',
    maxAmount: '',
    fromDate: '',
    toDate: '',
  });

  const [activeFilters, setActiveFilters] = useState({
    mobile: '',
    staffId: '',
    minAmount: '',
    maxAmount: '',
    fromDate: '',
    toDate: '',
  });

  const fetchAppointments = useCallback(async (tab, currentPage, currentFilters, signal) => {
    setLoading(true);
    try {
      const statusParam = getStatusParam(tab);
      
      const params = {
        status: statusParam,
        page: currentPage,
        size: 10,
      };

      if (currentFilters.mobile) params.mobile = currentFilters.mobile;
      if (currentFilters.staffId) params.staffId = currentFilters.staffId;
      if (currentFilters.minAmount) params.minAmount = currentFilters.minAmount;
      if (currentFilters.maxAmount) params.maxAmount = currentFilters.maxAmount;
      if (currentFilters.fromDate) params.fromDate = formatToISOInstant(currentFilters.fromDate, false);
      if (currentFilters.toDate) params.toDate = formatToISOInstant(currentFilters.toDate, true);

      const response = await axiosInstance.get('/appointments/search/advanced', {
        params,
        signal
      });
      setAppointments(response.data?.content || []);
      setTotalPages(response.data?.page?.totalPages || 1);
      setTotalElements(response.data?.page?.totalElements || 0);
    } catch (error) {
      if (error.name !== 'CanceledError' && error.message !== 'canceled' && !axiosInstance.isCancel?.(error)) {
        console.error('Failed to fetch appointments:', error);
        setAppointments([]);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch staff list only on demand with pagination size 10 first, then 5.
  const fetchStaff = async (isMore = false) => {
    if (staffFetched && !isMore) return;
    setStaffLoading(true);
    try {
      const currentSize = isMore ? 5 : 10;
      const nextPage = isMore ? Math.floor(staffList.length / 5) : 0;
      
      const response = await axiosInstance.get('/staff/search', {
        params: { page: nextPage, size: currentSize }
      });
      
      const newStaff = response.data?.content || [];
      if (isMore) {
        setStaffList(prev => [...prev, ...newStaff]);
      } else {
        setStaffList(newStaff);
        setStaffFetched(true);
      }
      setStaffTotalElements(response.data?.page?.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch staff list:", error);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAppointments(currentSubTab, page, activeFilters, controller.signal);
    return () => {
      controller.abort();
    };
  }, [currentSubTab, page, activeFilters, fetchAppointments]);

  const handleSubTabChange = (tab) => {
    setCurrentSubTab(tab);
    setPage(0);
  };

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
    const cleared = {
      mobile: '',
      staffId: '',
      minAmount: '',
      maxAmount: '',
      fromDate: '',
      toDate: '',
    };
    setLocalFilters(cleared);
    setActiveFilters(cleared);
    setSelectedStaffName('');
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
      {/* NAVBAR */}
      <Navbar />

      {/* SYSTEM GRID FRAMEWORK */}
      <div className="flex flex-1 w-full">
        {/* LEVEL 1 GENERAL SIDEBAR */}
        <Sidebar />

        {/* LEVEL 2 SUB-SIDEBAR (Contextual options) */}
        <ManageSideBar activeTab="Schedule" onTabChange={(tab) => console.log(`Navigating to ${tab}`)} />

        {/* MAIN DATA FEED CANVAS */}
        <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">
          
          {/* Top Filter Management Tabs */}
          <div className="flex items-center space-x-6 border-b border-gray-200 pb-3 mb-6 text-xs font-bold uppercase tracking-wider text-gray-400">
            <button 
              onClick={() => handleSubTabChange('Scheduled')}
              className={`pb-3 -mb-[14px] transition-all relative ${currentSubTab === 'Scheduled' ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold' : 'hover:text-gray-600'}`}
            >
              Scheduled
            </button>
            <button 
              onClick={() => handleSubTabChange('Cancelled')}
              className={`pb-3 -mb-[14px] transition-all relative ${currentSubTab === 'Cancelled' ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold' : 'hover:text-gray-600'}`}
            >
              Cancelled
            </button>
            <button 
              onClick={() => handleSubTabChange('Completed')}
              className={`pb-3 -mb-[14px] transition-all relative ${currentSubTab === 'Completed' ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold' : 'hover:text-gray-600'}`}
            >
              Completed
            </button>
          </div>

          {/* Collapsible Filter Section */}
          <form onSubmit={applyFilters} className="max-w-5xl bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v3.059c0 .516-.215 1.009-.595 1.365l-4.5 4.09c-.38.346-.595.839-.595 1.365v4.56c0 .4-.183.779-.5.1.586l-3.3-2.64c-.38-.304-.7-.7-.7-1.116v-2.17c0-.516-.215-1.009-.595-1.365l-4.5-4.09C3.215 9.033 3 8.54 3 8.024V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                Search Filters
              </h3>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] text-gray-400 hover:text-[#ff0b01] font-bold uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
                <button 
                  type="submit"
                  className="bg-[#ff0b01] hover:bg-red-700 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mobile filter */}
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Client Mobile</label>
                <input 
                  type="text" 
                  name="mobile"
                  value={localFilters.mobile}
                  onChange={handleFilterChange}
                  placeholder="e.g. 9822073220"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ff0b01] transition-colors font-medium text-gray-800"
                />
              </div>

              {/* Staff Dropdown Filter */}
              <div className="relative">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Staff Stylist</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffDropdown(!showStaffDropdown);
                    fetchStaff();
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ff0b01] transition-colors font-medium text-gray-800 text-left flex justify-between items-center min-h-[34px]"
                >
                  <span className="truncate">{selectedStaffName || 'Select Stylist'}</span>
                  <span className="text-[8px] text-gray-400">▼</span>
                </button>

                {showStaffDropdown && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 space-y-1">
                    {staffLoading && staffList.length === 0 ? (
                      <div className="flex items-center justify-center py-4 gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Loading staff...</span>
                      </div>
                    ) : staffList.length === 0 ? (
                      <div className="text-center py-4 text-[10px] text-gray-400 font-bold">No staff found</div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalFilters(prev => {
                              const updated = { ...prev, staffId: '' };
                              setActiveFilters(updated);
                              return updated;
                            });
                            setSelectedStaffName('All Stylists');
                            setShowStaffDropdown(false);
                            setPage(0);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-500"
                        >
                          All Stylists
                        </button>
                        {staffList.map(staff => {
                          return (
                            <button
                              key={staff.id}
                              type="button"
                              onClick={() => {
                                setLocalFilters(prev => {
                                  const updated = { ...prev, staffId: staff.id };
                                  setActiveFilters(updated);
                                  return updated;
                                });
                                setSelectedStaffName(`${staff.name} (${staff.phone})`);
                                setShowStaffDropdown(false);
                                setPage(0);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-red-50 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-[#ff0b01] text-[10px]">
                                  {staff.imagePath ? (
                                    <AsyncImage 
                                      imagePath={staff.imagePath} 
                                      alt={staff.name} 
                                      className="w-full h-full object-cover" 
                                      fallbackText={staff.name.charAt(0).toUpperCase()} 
                                    />
                                  ) : (
                                    staff.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate">{staff.name}</div>
                                  <div className="text-[9px] text-gray-400 font-semibold">{staff.phone}</div>
                                </div>
                              </div>
                              <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold capitalize">
                                {staff.gender?.toLowerCase()}
                              </span>
                            </button>
                          );
                        })}
                        {staffList.length < staffTotalElements && (
                          <div className="pt-1 pb-1 border-t border-gray-100 mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchStaff(true);
                              }}
                              disabled={staffLoading}
                              className="w-full py-2 hover:bg-gray-50 rounded-lg text-center text-[10px] font-black text-[#ff0b01] tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors"
                            >
                              {staffLoading ? (
                                <>
                                  <div className="animate-spin h-3.5 w-3.5 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <span>Load More</span>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Min Price (₹)</label>
                  <input 
                    type="number" 
                    name="minAmount"
                    value={localFilters.minAmount}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ff0b01] transition-colors font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Max Price (₹)</label>
                  <input 
                    type="number" 
                    name="maxAmount"
                    value={localFilters.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ff0b01] transition-colors font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Date Filters */}
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">From Date</label>
                <input 
                  type="date" 
                  name="fromDate"
                  value={localFilters.fromDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ff0b01] transition-colors font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">To Date</label>
                <input 
                  type="date" 
                  name="toDate"
                  value={localFilters.toDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ff0b01] transition-colors font-semibold text-gray-800"
                />
              </div>
            </div>
          </form>

          {/* Interactive Row Stack */}
          <div className="space-y-4 max-w-5xl mt-8">
            {loading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="animate-spin h-8 w-8 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
                </svg>
                <h4 className="text-[13px] font-bold text-gray-800">No Appointments</h4>
                <p className="text-[11px] font-semibold text-gray-400 mt-1">There are no {currentSubTab.toLowerCase()} appointments.</p>
              </div>
            ) : (
              appointments.map((appt) => {
                const { date, time } = formatDateTime(appt.appointmentAt);
                const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(appt.customerName || 'NP')}&backgroundColor=ffebeb&textColor=ff0b01&fontWeight=800&fontSize=34`;
                
                return (
                  <div 
                    key={appt.id} 
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all gap-4"
                  >
                    {/* Profile Identity block */}
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-full bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={avatarUrl} alt={appt.customerName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900 tracking-tight">{appt.customerName}</h4>
                        
                        {/* Horizontal meta elements container */}
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-gray-400 mt-1">
                          <span className="text-gray-500 uppercase tracking-wide text-[10px] bg-red-50 text-[#ff0b01] px-1.5 py-0.5 rounded font-bold">
                            {appt.serviceNames?.join(', ') || 'Grooming'}
                          </span>
                          
                          {appt.staffName && (
                            <span className="text-gray-500">Stylist: {appt.staffName} (ID: {appt.staffId})</span>
                          )}

                          {/* Calendar Inline Icon */}
                          <span className="flex items-center text-gray-400">
                            <img 
                              src={calendarIcon} 
                              alt="Calendar" 
                              className="w-3.5 h-3.5 mr-1 object-contain flex-shrink-0" 
                            /> 
                            {date}
                          </span>
                          
                          {/* Clock Inline Icon */}
                          <span className="flex items-center text-gray-400">
                            <img 
                              src={clockIcon} 
                              alt="Clock" 
                              className="w-3.5 h-3.5 mr-1 object-contain flex-shrink-0" 
                            /> 
                            {time}
                          </span>

                          {/* Price */}
                          <span className="font-extrabold text-[#ff0b01]">
                            ₹ {(appt.finalAmount || appt.totalPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Control Action Buttons */}
                    {currentSubTab === 'Scheduled' && (
                      <div className="flex items-center space-x-2 w-full lg:w-auto justify-end text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <button className="flex-1 lg:flex-initial bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-100 whitespace-nowrap">
                          Reschedule
                        </button>
                        <button className="flex-1 lg:flex-initial bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap">
                          Cancel
                        </button>
                        
                        {/* Assign Staff Button with integrated custom SVG asset */}
                        <button className="flex-1 lg:flex-initial border border-gray-300 text-gray-400 px-3.5 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors flex items-center justify-center space-x-1.5 whitespace-nowrap">
                          <img 
                            src={assignStaffIcon} 
                            alt="Assign Staff" 
                            className="w-4 h-4 object-contain flex-shrink-0 filter grayscale" 
                          />
                          <span className="text-[10px] tracking-tight">Assign Staff</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl">
              <p className="text-xs font-bold text-gray-400">
                Showing Page <span className="text-gray-900 font-extrabold">{page + 1}</span> of <span className="text-gray-900 font-extrabold">{totalPages}</span> ({totalElements} appointments)
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-lg border transition-all ${
                    page === 0 
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#ff0b01] hover:text-[#ff0b01] hover:bg-red-50/10 shadow-sm active:scale-95'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                  disabled={page === totalPages - 1}
                  className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-lg border transition-all ${
                    page === totalPages - 1 
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#ff0b01] hover:text-[#ff0b01] hover:bg-red-50/10 shadow-sm active:scale-95'
                  }`}
                >
                  Next
                </button>
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

export default Schedule;