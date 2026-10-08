import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, Search, X, Check, Loader2, Home, Briefcase, Compass, ChevronDown } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import searchService from '../../services/searchService';
import toast from 'react-hot-toast';

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLat = null,
  initialLng = null,
  title = "Pin Exact Location",
  subtitle = "Drag the map to place the pin directly on the entrance",
  confirmButtonText = "Confirm Location",
  isOwnerMode = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [coords, setCoords] = useState({ 
    lat: (initialLat !== null && initialLat !== undefined && !isNaN(Number(initialLat))) ? Number(initialLat) : null, 
    lng: (initialLng !== null && initialLng !== undefined && !isNaN(Number(initialLng))) ? Number(initialLng) : null 
  });
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isPinMoved, setIsPinMoved] = useState(false);
  const [nearbyLandmarks, setNearbyLandmarks] = useState([]);
  
  // Resolved address parts
  const [addressDetails, setAddressDetails] = useState({
    areaName: '',
    cityName: '',
    stateName: '',
    pincode: '',
    landmark: '',
    buildingName: '',
    houseFlatNo: '',
    formattedAddress: '',
    addressType: isOwnerMode ? 'SALON' : 'HOME'
  });

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Landmark searchable dropdown state
  const landmarkDropdownRef = useRef(null);
  const [landmarkSearch, setLandmarkSearch] = useState('');
  const [isLandmarkDropdownOpen, setIsLandmarkDropdownOpen] = useState(false);

  // Click outside listener for landmark dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (landmarkDropdownRef.current && !landmarkDropdownRef.current.contains(e.target)) {
        setIsLandmarkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter landmarks based on search query
  const filteredLandmarks = useMemo(() => {
    const rawSearch = typeof landmarkSearch === 'string' ? landmarkSearch : (landmarkSearch?.title || landmarkSearch?.name || '');
    const getLmTitle = (lm) => (typeof lm === 'string' ? lm : (lm?.title || lm?.name || ''));
    const getLmSub = (lm) => (typeof lm === 'string' ? '' : (lm?.subtitle || lm?.details || lm?.street || (lm?.type ? String(lm.type).replace(/_/g, ' ') : '')));

    const valid = nearbyLandmarks.filter(lm => Boolean(getLmTitle(lm)?.trim()));
    if (!rawSearch.trim()) return valid;

    const q = rawSearch.toLowerCase().trim();
    const matched = valid.filter(lm => {
      const title = getLmTitle(lm);
      const subtitle = getLmSub(lm);
      return title.toLowerCase().includes(q) || subtitle.toLowerCase().includes(q);
    });

    const currentSelected = typeof addressDetails.landmark === 'string' 
      ? addressDetails.landmark 
      : (addressDetails.landmark?.title || addressDetails.landmark?.name || '');

    // If query matches current selection and gave no matches, show all valid so user can choose from list
    if (matched.length === 0 && rawSearch.trim().toLowerCase() === currentSelected.trim().toLowerCase()) {
      return valid;
    }

    return matched;
  }, [nearbyLandmarks, landmarkSearch, addressDetails.landmark]);

  // Clean up Leaflet instance when modal closes or unmounts
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  // Sync coords when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      const hasInit = (initialLat !== null && initialLat !== undefined && !isNaN(Number(initialLat))) &&
                      (initialLng !== null && initialLng !== undefined && !isNaN(Number(initialLng)));
      if (hasInit) {
        setCoords({ lat: Number(initialLat), lng: Number(initialLng) });
      } else {
        setCoords({ lat: null, lng: null });
      }
      setIsPinMoved(false);
    }
  }, [isOpen, initialLat, initialLng]);

  // Initialize or re-center map when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let timer2;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const hasInit = (initialLat !== null && initialLat !== undefined && !isNaN(Number(initialLat))) &&
                      (initialLng !== null && initialLng !== undefined && !isNaN(Number(initialLng)));

      // If initial coordinates exist, center on them.
      // Otherwise start with a neutral country view and immediately acquire user GPS.
      // NEVER default to Pune (18.5204, 73.8567)!
      const startLat = hasInit ? Number(initialLat) : 20.5937;
      const startLng = hasInit ? Number(initialLng) : 78.9629;
      const startZoom = hasInit ? 17 : 5;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: startZoom,
        zoomControl: false,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">HOT</a>'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // On map pan/drag: ONLY update coordinates, DO NOT call API automatically
      map.on('move', () => {
        setIsPinMoved(true);
      });

      map.on('moveend', () => {
        const center = map.getCenter();
        setCoords({ lat: center.lat, lng: center.lng });
        setIsPinMoved(true);
      });

      mapInstanceRef.current = map;

      // Invalidate size immediately and with small delay to ensure 100% canvas paint
      map.invalidateSize();
      timer2 = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      if (hasInit) {
        // Initial reverse geocode if no address yet
        if (!addressDetails.cityName && !addressDetails.areaName) {
          resolveCoordinates(startLat, startLng);
        }
      } else {
        // Automatically acquire user's GPS location when canvas opens
        if (navigator.geolocation) {
          setIsLocatingUser(true);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setCoords({ lat: latitude, lng: longitude });
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([latitude, longitude], 17, { animate: true, duration: 1 });
              }
              resolveCoordinates(latitude, longitude);
              setIsLocatingUser(false);
            },
            (err) => {
              console.warn("GPS auto-detect on modal open failed:", err);
              setIsLocatingUser(false);
              toast("GPS location blocked or unavailable. Please drag the pin or search your area.", { icon: '📍' });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        } else {
          toast.error("Geolocation is not supported by your browser");
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      if (timer2) clearTimeout(timer2);
    };
  }, [isOpen]);

  // Reverse geocode center coordinates
  const resolveCoordinates = async (lat, lng) => {
    setIsResolvingAddress(true);
    try {
      const res = await searchService.reverseGeocode(lat, lng, { 
        preferGoogle: isOwnerMode, 
        provider: isOwnerMode ? 'google' : 'olamaps' 
      });
      
      const landmarksList = res?.nearbyLandmarks || [];
      setNearbyLandmarks(landmarksList);
      setIsPinMoved(false);

      const firstLm = landmarksList[0];
      const firstLmTitle = typeof firstLm === 'string' ? firstLm : (firstLm?.title || firstLm?.name || '');
      const primaryLm = typeof res.landmark === 'string' ? res.landmark : (res.landmark?.title || res.landmark?.name || '');

      setAddressDetails(prev => ({
        ...prev,
        areaName: res.area || '',
        cityName: res.city || '',
        stateName: res.stateName || '',
        landmark: primaryLm || firstLmTitle || '',
        formattedAddress: res.formattedAddress || `${res.area ? res.area + ', ' : ''}${res.city || ''}`
      }));

      if (res.area || res.city) {
        toast.success(`Address fetched: ${res.area || ''} ${res.city ? '(' + res.city + ')' : ''}`, { id: 'loc-toast', icon: '📍' });
      }
    } catch (err) {
      console.error("Error resolving coordinates:", err);
      toast.error("Could not fetch address for this pin. Please enter manually.");
    } finally {
      setIsResolvingAddress(false);
    }
  };

  // High-accuracy "Locate Me" button
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 18, { animate: true, duration: 1 });
        }
        resolveCoordinates(latitude, longitude);
        setIsLocatingUser(false);
        toast.success("Location centered on GPS", { icon: "📍" });
      },
      (err) => {
        console.error("GPS Error:", err);
        toast.error("Could not retrieve GPS location. Please drag map manually.");
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(
          searchQuery,
          'area',
          addressDetails.cityName || ''
        );
        setSearchResults(results.slice(0, 6));
        setShowSearchResults(true);
      } catch (err) {
        console.error("Search error in LocationPicker:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, addressDetails.cityName]);

  // When user selects a search suggestion
  const handleSelectSearchResult = (item) => {
    setShowSearchResults(false);
    setSearchQuery('');

    if (item.latitude && item.longitude) {
      setCoords({ lat: item.latitude, lng: item.longitude });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([item.latitude, item.longitude], 18, { animate: true });
      }
      resolveCoordinates(item.latitude, item.longitude);
    } else {
      setAddressDetails(prev => ({
        ...prev,
        areaName: item.name || prev.areaName,
        cityName: item.city || prev.cityName
      }));
    }
  };

  const handleFetchDroppedPin = () => {
    let lat = coords.lat;
    let lng = coords.lng;
    if ((!lat || !lng) && mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      lat = center.lat;
      lng = center.lng;
      setCoords({ lat, lng });
    }
    if (lat && lng) {
      resolveCoordinates(lat, lng);
    } else {
      toast.error("Please place the pin on the map");
    }
  };

  const handleConfirm = () => {
    let finalLat = coords.lat;
    let finalLng = coords.lng;
    if ((!finalLat || !finalLng) && mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      finalLat = center.lat;
      finalLng = center.lng;
    }

    if (!finalLat || !finalLng) {
      toast.error("Please place the pin on the map");
      return;
    }

    const payload = {
      latitude: finalLat,
      longitude: finalLng,
      areaName: addressDetails.areaName,
      cityName: addressDetails.cityName,
      stateName: addressDetails.stateName,
      pincode: addressDetails.pincode,
      landmark: addressDetails.landmark,
      houseFlatNo: addressDetails.houseFlatNo,
      buildingName: addressDetails.buildingName,
      addressType: addressDetails.addressType,
      formattedAddress: addressDetails.formattedAddress || 
        `${addressDetails.houseFlatNo ? addressDetails.houseFlatNo + ', ' : ''}${addressDetails.buildingName ? addressDetails.buildingName + ', ' : ''}${addressDetails.areaName ? addressDetails.areaName + ', ' : ''}${addressDetails.cityName || ''}`
    };

    onConfirm(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-zinc-800 my-auto">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 sm:py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-30 shrink-0">
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <Compass className="w-5 h-5 text-red-500" />
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content (Map + Form Details) */}
        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
          {/* Map Body Area */}
          <div className="relative shrink-0 min-h-[280px] sm:min-h-[320px] bg-slate-100 dark:bg-zinc-950">
          
          {/* Locating banner */}
          {isLocatingUser && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1001] bg-black/85 text-white text-xs px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2 backdrop-blur animate-pulse border border-white/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
              <span>Detecting GPS location...</span>
            </div>
          )}

          {/* Search bar overlay */}
          <div className="absolute top-3 left-3 right-3 z-[1000]">
            <div className="relative shadow-lg rounded-xl">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, road, or landmark..."
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 rounded-xl text-sm border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-1.5 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden divide-y divide-gray-50 dark:divide-zinc-700/50">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-red-50/50 dark:hover:bg-zinc-700/50 flex items-center justify-between text-gray-700 dark:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-semibold">{item.name || item.label}</span>
                      {item.city && (
                        <span className="text-gray-400 text-xs truncate">({item.city})</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Leaflet Map Div with guaranteed explicit dimensions */}
          <div 
            ref={mapContainerRef} 
            className="w-full relative z-[1]" 
            style={{ height: '320px', minHeight: '280px', width: '100%' }} 
          />

          {/* Action button to fetch location details for dropped pin */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
            <button
              type="button"
              onClick={handleFetchDroppedPin}
              disabled={isResolvingAddress}
              className={`px-4 sm:px-6 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border-2 border-white dark:border-zinc-800 transition-all cursor-pointer ${
                isPinMoved
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white animate-bounce ring-4 ring-red-500/30'
                  : 'bg-white/95 dark:bg-zinc-800/95 text-gray-800 dark:text-zinc-100 hover:bg-white shadow-lg'
              }`}
            >
              {isResolvingAddress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Fetching Details...</span>
                </>
              ) : (
                <>
                  <MapPin className={`w-4 h-4 ${isPinMoved ? 'text-white' : 'text-red-500'}`} />
                  <span>{isPinMoved ? '📍 Fetch Details for Dropped Pin' : '📍 Refresh Address Details'}</span>
                </>
              )}
            </button>
          </div>

          {/* Center Crosshair Pin Overlay (Blinkit Style) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] flex flex-col items-center">
            <div className="relative">
              {/* Pulsing ring underneath */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/30 rounded-full blur-[1px] animate-pulse" />
              
              {/* Pin Icon with Glow */}
              <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-red-500/20 transform -translate-y-1 transition-transform">
                <MapPin className="w-5 h-5 fill-white stroke-red-600" />
              </div>
            </div>
            
            {/* Tooltip hint above pin */}
            <div className="mt-1 px-2.5 py-0.5 bg-gray-900/90 text-white text-[10px] font-bold rounded-full shadow-md backdrop-blur whitespace-nowrap">
              {isLocatingUser ? 'Acquiring GPS location...' : isResolvingAddress ? 'Detecting area...' : (isPinMoved ? 'Click button below to fetch details' : 'Exact Pin Position')}
            </div>
          </div>

          {/* "Locate Me" GPS Button (Floating on bottom right) */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocatingUser}
            className="absolute bottom-4 right-4 z-[1000] p-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-full shadow-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Recenter to current GPS"
          >
            {isLocatingUser ? (
              <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 text-red-500" />
            )}
          </button>
        </div>

        {/* Bottom Address Confirmation Drawer */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 space-y-3.5 pb-6 sm:pb-8">
          
          {/* Resolved Address Pill */}
          <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  {isResolvingAddress ? 'Resolving...' : (addressDetails.areaName || 'Location Pinned')}
                </span>
                {isResolvingAddress && <Loader2 className="w-3 h-3 text-red-500 animate-spin" />}
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-300 mt-0.5 truncate">
                {addressDetails.formattedAddress || `${addressDetails.cityName || 'City'}, ${addressDetails.stateName || 'State'}`}
              </p>
            </div>
          </div>

          {/* Form details: Flat/Building/Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 block mb-1">
                {isOwnerMode ? 'Shop / Unit / Floor No.' : 'House / Flat / Floor No.'}
              </label>
              <input
                type="text"
                placeholder={isOwnerMode ? "e.g. Shop 4, 1st Floor" : "e.g. Flat 302, Wing B"}
                value={addressDetails.houseFlatNo}
                onChange={(e) => setAddressDetails(prev => ({ ...prev, houseFlatNo: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 block mb-1">
                {isOwnerMode ? 'Building / Complex / Mall' : 'Apartment / Society Name'}
              </label>
              <input
                type="text"
                placeholder={isOwnerMode ? "e.g. Phoenix Mall, Prime Plaza" : "e.g. Trimurti Complex"}
                value={addressDetails.buildingName}
                onChange={(e) => setAddressDetails(prev => ({ ...prev, buildingName: e.target.value }))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Landmark and Tag Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className={isOwnerMode ? "col-span-full" : "col-span-1"} ref={landmarkDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                  Nearby Landmark
                </label>
                {nearbyLandmarks.length > 0 && (
                  <span className="text-[10px] text-red-500 font-bold">
                    {nearbyLandmarks.length} detected nearby
                  </span>
                )}
              </div>

              {/* Searchable Combobox Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder={nearbyLandmarks.length > 0 ? "Search detected landmarks or type custom..." : "e.g. Near Pawar Hospital, Opp Bank"}
                  value={typeof addressDetails.landmark === 'string' ? addressDetails.landmark : (addressDetails.landmark?.title || addressDetails.landmark?.name || '')}
                  onFocus={() => {
                    setIsLandmarkDropdownOpen(true);
                    setLandmarkSearch(addressDetails.landmark || '');
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddressDetails(prev => ({ ...prev, landmark: val }));
                    setLandmarkSearch(val);
                    setIsLandmarkDropdownOpen(true);
                  }}
                  className="w-full pl-9 pr-16 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />

                <div className="absolute right-2 top-2 flex items-center gap-0.5">
                  {(typeof addressDetails.landmark === 'string' ? addressDetails.landmark : (addressDetails.landmark?.title || addressDetails.landmark?.name || '')) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressDetails(prev => ({ ...prev, landmark: '' }));
                        setLandmarkSearch('');
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {nearbyLandmarks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isLandmarkDropdownOpen) {
                          setLandmarkSearch('');
                        }
                        setIsLandmarkDropdownOpen(!isLandmarkDropdownOpen);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLandmarkDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Dropdown Results List */}
                {isLandmarkDropdownOpen && nearbyLandmarks.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl z-[1100] max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-700/50 animate-in fade-in zoom-in-95 duration-150">
                    {filteredLandmarks.length > 0 ? (
                      filteredLandmarks.map((lm, idx) => {
                        const title = typeof lm === 'string' ? lm : (lm?.title || lm?.name || '');
                        const subtitle = typeof lm === 'string' ? '' : (lm?.subtitle || lm?.details || lm?.street || (lm?.type ? String(lm.type).replace(/_/g, ' ') : ''));
                        const distance = typeof lm === 'string' ? '' : (lm?.distance || '');
                        if (!title.trim()) return null;
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => {
                              setAddressDetails(prev => ({ ...prev, landmark: title }));
                              setLandmarkSearch(title);
                              setIsLandmarkDropdownOpen(false);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-red-50/70 dark:hover:bg-zinc-700/70 transition-colors flex items-start gap-2.5 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-gray-800 dark:text-zinc-100 truncate">
                                  {title}
                                </span>
                                {distance && (
                                  <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                                    {distance}
                                  </span>
                                )}
                              </div>
                              {subtitle && (
                                <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                                  {subtitle}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No matching landmark detected. Type to use your custom text.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Clickable Chips */}
              {nearbyLandmarks.some(lm => Boolean((typeof lm === 'string' ? lm : (lm?.title || lm?.name))?.trim())) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {nearbyLandmarks
                    .filter(lm => Boolean((typeof lm === 'string' ? lm : (lm?.title || lm?.name))?.trim()))
                    .slice(0, 4)
                    .map((lm, idx) => {
                      const title = typeof lm === 'string' ? lm : (lm?.title || lm?.name || '');
                      const isSelected = addressDetails.landmark === title;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setAddressDetails(prev => ({ ...prev, landmark: title }));
                            setLandmarkSearch(title);
                            setIsLandmarkDropdownOpen(false);
                          }}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-red-400'
                          }`}
                        >
                          + {title}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {!isOwnerMode && (
              <div>
                <label className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 block mb-1">
                  Save Address As
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'HOME', label: 'Home', icon: Home },
                    { id: 'WORK', label: 'Work', icon: Briefcase },
                    { id: 'OTHER', label: 'Other', icon: MapPin }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = addressDetails.addressType === tab.id;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setAddressDetails(prev => ({ ...prev, addressType: tab.id }))}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          </div>
        </div>

        {/* Sticky Action Buttons Footer */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 z-30 shrink-0 flex items-center gap-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 text-xs sm:text-sm font-bold text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {confirmButtonText}
          </button>
        </div>

      </div>
    </div>
  );
}
