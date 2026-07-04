import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

// 1. Keep these correct relative imports (climbing out of your layout folder to src/assets)
import logoIcon from '../../../assets/Neoparlour_logo.png';
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
  const notifDropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    staff: [],
    customerSalonVisits: [],
    appointments: [],
    services: [],
    products: [],
    offers: []
  });
  const [searching, setSearching] = useState(false);
  const [salonProfile, setSalonProfile] = useState({
    salonName: "",
    imageUrl: null
  });

  useEffect(() => {
    console.log("[Navbar] Current search results:", searchResults);
  }, [searchResults]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSalonProfile();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
      const salonId = localStorage.getItem('activeSalonId') || ownerUser.salonId || 1;
      const response = await axiosInstance.get(`/notifications/search?salonId=${salonId}&page=0&size=10`);
      const notifs = response.data.content || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => n.status === 'pending').length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchSalonProfile = async () => {
    try {
      const response = await axiosInstance.get("/salons/profile");

      setSalonProfile({
        salonName: response.data.salonName,
        imageUrl:
          response.data.imageUrl ||
          (response.data.salonImages?.length > 0
            ? response.data.salonImages[0].imageUrl
            : null)
      });

      console.log("Salon Profile:", response.data);
    } catch (error) {
      console.error("Salon profile fetch failed:", error);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({
        staff: [],
        customerSalonVisits: [],
        appointments: [],
        services: [],
        products: [],
        offers: []
      });
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axiosInstance.get('/search', {
          params: { query: query.trim(), limit: 5 },
          signal: controller.signal
        });
        const data = response.data || {};
        setSearchResults({
          staff: data.staff || [],
          customerSalonVisits: data.customerSalonVisits || [],
          appointments: data.appointments || [],
          services: data.services || [],
          products: data.products || [],
          offers: data.offers || []
        });
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
            <div className="absolute top-full right-0 w-[92vw] sm:left-0 sm:w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto p-4 space-y-4">
              {searching &&
                (!searchResults.staff || searchResults.staff.length === 0) &&
                (!searchResults.customerSalonVisits || searchResults.customerSalonVisits.length === 0) &&
                (!searchResults.appointments || searchResults.appointments.length === 0) &&
                (!searchResults.services || searchResults.services.length === 0) &&
                (!searchResults.products || searchResults.products.length === 0) &&
                (!searchResults.offers || searchResults.offers.length === 0) ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Searching...</span>
                </div>
              ) : (!searchResults.staff || searchResults.staff.length === 0) &&
                (!searchResults.customerSalonVisits || searchResults.customerSalonVisits.length === 0) &&
                (!searchResults.appointments || searchResults.appointments.length === 0) &&
                (!searchResults.services || searchResults.services.length === 0) &&
                (!searchResults.products || searchResults.products.length === 0) &&
                (!searchResults.offers || searchResults.offers.length === 0) ? (
                <div className="text-center py-6 text-xs text-gray-400 font-bold">
                  No matching records found.
                </div>
              ) : (
                <>
                  {/* Category 1: Staff Stylists */}
                  {searchResults.staff && searchResults.staff.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Team Stylists
                      </h4>
                      <div className="space-y-1.5">
                        {searchResults.staff.map(staff => {
                          const nameInitial = staff.name?.charAt(0).toUpperCase() || 'S';
                          return (
                            <button
                              key={staff.id}
                              onClick={() => {
                                navigate('/owner/manage/staff', { state: { editStaffId: staff.id } });
                                setShowDropdown(false);
                              }}
                              className="w-full flex items-center justify-between p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-red-50 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-[#ff0b01] text-[10px]">
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
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate group-hover:text-[#ff0b01]">{staff.name}</div>
                                  <div className="text-[9px] text-gray-400 font-semibold">{staff.phone}</div>
                                </div>
                              </div>
                              <span className="text-[8px] bg-red-50 text-[#ff0b01] px-1.5 py-0.5 rounded font-bold capitalize">
                                {staff.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Salon Visits */}
                  {searchResults.customerSalonVisits && searchResults.customerSalonVisits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Salon Visits / Customers
                      </h4>
                      <div className="space-y-1.5">
                        {searchResults.customerSalonVisits.map(visit => (
                          <button
                            key={visit.id}
                            onClick={() => {
                              navigate('/owner/customers', { state: { customerMobile: visit.customerMobile, customerName: visit.customerName } });
                              setShowDropdown(false);
                            }}
                            className="w-full p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#ff0b01] truncate">
                                {visit.customerName}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">
                                {visit.visitCount} Visits
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-full mt-1">
                              <span className="text-[9px] text-gray-400 font-semibold truncate">
                                {visit.customerMobile}
                              </span>
                              <span className="text-[9px] font-bold text-green-600">
                                ₹ {visit.totalRevenue?.toFixed(2)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Appointments */}
                  {searchResults.appointments && searchResults.appointments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Appointments
                      </h4>
                      <div className="space-y-1.5">
                        {searchResults.appointments.map(appt => (
                          <button
                            key={appt.id}
                            onClick={() => {
                              navigate('/owner/manage/schedule', { state: { appointmentId: appt.id } });
                              setShowDropdown(false);
                            }}
                            className="w-full p-2.5 hover:bg-red-50/10 rounded-xl text-left transition-all group flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#ff0b01] truncate">
                                {appt.customerName || appt.customer?.fullName || 'Customer'}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">
                                ₹ {(appt.finalAmount || appt.totalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-full mt-1">
                              <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[150px]">
                                {appt.serviceNames?.join(', ') || appt.serviceName || (appt.services && appt.services.map(s => s.serviceName).join(', ')) || 'Grooming'}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${appt.status === 'booked' ? 'bg-red-50 text-[#ff0b01]' :
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

                  {/* Category 4: Services */}
                  {searchResults.services && searchResults.services.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Services
                      </h4>
                      <div className="space-y-1.5">
                        {searchResults.services.map(service => (
                          <button
                            key={service.id}
                            onClick={() => {
                              navigate('/owner/manage/services', { state: { serviceId: service.id } });
                              setShowDropdown(false);
                            }}
                            className="w-full p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group flex items-center justify-between"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="text-xs font-bold text-gray-900 truncate group-hover:text-[#ff0b01]">{service.name}</div>
                              <div className="text-[9px] text-gray-400 font-semibold capitalize">{service.category} • {service.duration} mins</div>
                            </div>
                            <span className="text-xs font-black text-[#ff0b01] flex-shrink-0">
                              ₹ {service.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 5: Products */}
                  {searchResults.products && searchResults.products.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Products
                      </h4>
                      <div className="space-y-1.5">
                        {(searchResults.products ?? []).map(product => {
                          const prodNameInitial = product.name?.charAt(0).toUpperCase() || 'P';
                          return (
                            <button
                              key={product.id}
                              onClick={() => {
                                navigate('/owner/manage/add-products', { state: { editProductId: product.id } });
                                setShowDropdown(false);
                              }}
                              className="w-full flex items-center justify-between p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                                <div className="w-8 h-8 rounded-xl overflow-hidden bg-red-50 border border-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-[#ff0b01] text-[10px]">
                                  {product.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '';
                                      }}
                                    />
                                  ) : (
                                    prodNameInitial
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-900 truncate group-hover:text-[#ff0b01]">{product.name}</div>
                                  <div className="text-[9px] text-gray-400 font-semibold">{product.category} • {product.stock} in stock</div>
                                </div>
                              </div>
                              <span className="text-xs font-black text-[#ff0b01] flex-shrink-0">
                                ₹ {product.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 6: Offers */}
                  {searchResults.offers && searchResults.offers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Offers
                      </h4>
                      <div className="space-y-1.5">
                        {searchResults.offers.map(offer => {
                          const discountLabel = (offer.discountType?.toUpperCase() === 'PERCENTAGE')
                            ? `${offer.discountValue}% OFF`
                            : `₹${offer.discountValue} OFF`;
                          return (
                            <button
                              key={offer.id}
                              onClick={() => {
                                navigate('/owner/manage/add-offers', { state: { editOfferId: offer.id } });
                                setShowDropdown(false);
                              }}
                              className="w-full p-2 hover:bg-red-50/10 rounded-xl text-left transition-all group flex items-center justify-between"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="text-xs font-bold text-gray-900 truncate group-hover:text-[#ff0b01]">{offer.name}</div>
                                <div className="text-[9px] text-gray-400 font-semibold">
                                  {discountLabel}
                                </div>
                              </div>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${offer.active ? 'bg-[#E3F9EC] text-[#299764]' : 'bg-gray-100 text-gray-500'}`}>
                                {offer.active ? 'active' : 'inactive'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell with Badge */}
        <div ref={notifDropdownRef} className="relative">
          <button 
            onClick={() => {
              if (!showNotifications) fetchNotifications();
              setShowNotifications(!showNotifications);
            }}
            className="text-gray-400 hover:text-gray-600 relative transition-colors"
          >
            <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl w-[92vw] sm:w-[380px] z-50 overflow-hidden border border-gray-100 flex flex-col max-h-[450px]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              </div>
              <div className="overflow-y-auto p-2 flex-1">
                {notifications.length === 0 ? (
                   <div className="py-8 text-center text-xs font-semibold text-gray-400">No notifications found</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-3 mb-2 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-default">
                       <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                             {notif.type === 'APPOINTMENT' ? (
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             ) : notif.type === 'PRODUCT_ORDERED' ? (
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                             ) : (
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                             )}
                             <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${notif.status === 'pending' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                             {notif.status}
                          </span>
                       </div>
                       <p className="text-xs text-gray-600 pl-6">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-gray-100 mt-auto">
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/owner/notifications');
                  }}
                  className="w-full py-2 text-xs font-bold text-[#ff0b01] bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Profile Block */}
  <div 
    className="flex items-center space-x-2 cursor-pointer group"
    onClick={() =>{
      console.log("Clicked");
      navigate('/owner/settings');
      console.log(window.location.pathname);

    } }
  >

  {/* Profile Image */}
  <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">

    {salonProfile.imageUrl ? (
      <img
        src={salonProfile.imageUrl}
        alt={salonProfile.salonName}
        className="h-full w-full rounded-full object-cover"
      />
    ) : (
      <img
        src={profileIcon}
        alt="Default Profile"
        className="h-full w-full rounded-full object-cover"
      />
    )}

  </div>

  {/* Salon Name */}
  <div className="hidden sm:flex flex-col">
    <span className="text-xs font-bold text-gray-800">
      {salonProfile.salonName || "NeoParlour"}
    </span>

    <span className="text-[10px] text-gray-400">
      Salon Owner
    </span>
  </div>

</div>

      </div>
    </header>
  );
}