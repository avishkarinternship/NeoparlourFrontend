import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { 
  switchTenant,
  searchSalonsByLocation
 } from '../../redux/slices/customerSlice';
import searchService from '../../services/searchService';
import AOS from 'aos';
import { Html5Qrcode } from "html5-qrcode";
import { toast } from 'react-hot-toast';

// Icons/Assets
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import mobileIcon from '../../assets/CustomerRegister/mobile_icon.svg';
import rightBackground from '../../assets/CustomerRegister/right_background.jpg';

const SalonSelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const { token, loading } = useSelector((state) => state.customer);
  const { token, loading, salonResults } = useSelector((state) => state.customer);

  const [uiState, setUiState] = useState({
    mode: 'SEARCH', // 'SEARCH' or 'DIRECT'
    cityName: '',
    areaName: '',
    salonId: '',
    // results: [],
    isSearching: false,
    showCityDropdown: false,
    showAreaDropdown: false,
    showScanner: false,
  });

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 50
    });
    if (!token) navigate('/login');
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 200);
    return () => clearTimeout(timer);
  }, [uiState.mode, salonResults]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setUiState(prev => ({ ...prev, showCityDropdown: false }));
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
        setUiState(prev => ({ ...prev, showAreaDropdown: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // QR Scanner Logic
  useEffect(() => {
    if (uiState.showScanner) {
      const startScanner = async () => {
        try {
          html5QrCode.current = new Html5Qrcode("qr-reader");
          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          await html5QrCode.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              setUiState(prev => ({ ...prev, salonId: decodedText, showScanner: false }));
              toast.success("Salon Code Scanned!");
              stopScanner();
            },
            (errorMessage) => {
              // ignore scan errors
            }
          );
        } catch (err) {
          console.error("Camera error", err);
          toast.error("Could not access camera");
          setUiState(prev => ({ ...prev, showScanner: false }));
        }
      };
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [uiState.showScanner]);

  const stopScanner = async () => {
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      try {
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
      } catch (err) {
        console.error("Stop failed", err);
      }
    }
  };

  // OpenStreetMap City search debounce hook
  useEffect(() => {
    if (!uiState.cityName || uiState.cityName.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }

    setIsLoadingCities(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(uiState.cityName, 'city');
        setCitySuggestions(results);
      } catch (err) {
        console.error("City search failure:", err);
      } finally {
        setIsLoadingCities(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [uiState.cityName]);

  // OpenStreetMap Area search debounce hook (scoped by city if present)
  useEffect(() => {
    if (!uiState.areaName || uiState.areaName.trim().length < 2) {
      setAreaSuggestions([]);
      return;
    }

    setIsLoadingAreas(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(
          uiState.areaName,
          'area',
          uiState.cityName
        );
        setAreaSuggestions(results);
      } catch (err) {
        console.error("Area search failure:", err);
      } finally {
        setIsLoadingAreas(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [uiState.areaName, uiState.cityName]);

  const handleLocationSearch = async () => {
    if (!uiState.cityName && !uiState.areaName) return;
    try {
      await dispatch(
        searchSalonsByLocation({
          cityName: uiState.cityName,
          areaName: uiState.areaName,
        })
      ).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSalonSelect = (salon) => {
    const payload = {
      token: token,
      salonId: salon.salonId || salon.id,
      salonName: salon.salonName || salon.name
    };
    dispatch(switchTenant(payload)).unwrap().then(() => {
      navigate('/customer/home');
    });
  };

  const handleDirectIdSubmit = () => {
    if (!uiState.salonId) return;
    const isNum = /^\d+$/.test(uiState.salonId);
    handleSalonSelect({ 
      salonId: isNum ? parseInt(uiState.salonId, 10) : null,
      salonCode: uiState.salonId, 
      salonName: 'Direct Access' 
    });
  };

  const isOpen = (opening, closing) => {
    if (!opening || !closing) return true;
    const now = new Date();
    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f7f9] flex flex-col lg:flex-row font-sans overflow-hidden">

      {/* Search Section */}
      <div className="w-full lg:w-[62%] xl:w-[58%] flex flex-col h-screen bg-[#f6f7f9] shadow-[20px_0_60px_rgba(0,0,0,0.04)] z-10 transition-all duration-500 text-gray-900">

        {/* Header */}
        <div className="px-10 lg:px-16 pt-8 pb-6 bg-white z-30 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 bg-[#ff0b01] rounded-[14px] flex items-center justify-center shadow-lg shadow-[#ff0b01]/20">
              <img src={logoIcon} alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
            </div>
            <span className="text-[22px] font-black text-gray-900 tracking-tighter">NeoParlour</span>
          </div>

          <div className="flex gap-10 justify-center lg:justify-start">
            <button
              onClick={() => setUiState(p => ({ ...p, mode: 'SEARCH' }))}
              className={`pb-3 text-[12px] font-black tracking-[0.2em] transition-all relative ${uiState.mode === 'SEARCH' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-400'}`}
            >
              FIND SALON
              {uiState.mode === 'SEARCH' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ff0b01] rounded-full" />}
            </button>
            <button
              onClick={() => setUiState(p => ({ ...p, mode: 'DIRECT' }))}
              className={`pb-3 text-[12px] font-black tracking-[0.2em] transition-all relative ${uiState.mode === 'DIRECT' ? 'text-gray-900' : 'text-gray-300'}`}
            >
              SALON ID
              {uiState.mode === 'DIRECT' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ff0b01] rounded-full" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 lg:px-16 py-8 custom-scrollbar bg-[#f6f7f9]">

          <div key={uiState.mode} className="min-h-full flex flex-col">
            {uiState.mode === 'SEARCH' ? (
              <div className="space-y-8 max-w-[950px]">
                {/* Search Box */}
                <div className="p-8 bg-white rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-50 space-y-6" data-aos="fade-up">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Luxury Destinations</h2>
                    <p className="text-gray-400 font-medium text-base">Select your location to discover the finest salons.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative" ref={cityDropdownRef}>
                      <input
                        type="text"
                        placeholder="Select City"
                        value={uiState.cityName}
                        onChange={(e) => setUiState(p => ({ ...p, cityName: e.target.value, showCityDropdown: true }))}
                        onFocus={() => setUiState(p => ({ ...p, showCityDropdown: true }))}
                        className="w-full px-6 py-4 bg-[#fafafa] border border-gray-100 rounded-[20px] text-sm font-bold focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all shadow-sm placeholder:font-medium"
                      />
                      {uiState.showCityDropdown && uiState.cityName && (
                        <div className="absolute z-40 w-full mt-2 bg-white border border-gray-100 rounded-[20px] shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2">
                          {isLoadingCities ? (
                            <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                              <div className="h-4 w-4 border-2 border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
                              Locating...
                            </div>
                          ) : citySuggestions.length > 0 ? (
                            citySuggestions.map((city, idx) => (
                              <div key={idx} onClick={() => setUiState(p => ({ ...p, cityName: city.name, showCityDropdown: false, areaName: '' }))} className="px-6 py-3 rounded-[14px] hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] cursor-pointer transition-all font-bold text-gray-700 text-sm">{city.name}</div>
                            ))
                          ) : (
                            <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No cities found</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={areaDropdownRef}>
                      <input
                        type="text"
                        placeholder="Select Area"
                        value={uiState.areaName}
                        onChange={(e) => setUiState(p => ({ ...p, areaName: e.target.value, showAreaDropdown: true }))}
                        onFocus={() => setUiState(p => ({ ...p, showAreaDropdown: true }))}
                        className="w-full px-6 py-4 bg-[#fafafa] border border-gray-100 rounded-[20px] text-sm font-bold focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all shadow-sm placeholder:font-medium"
                      />
                      {uiState.showAreaDropdown && uiState.areaName && (
                        <div className="absolute z-40 w-full mt-2 bg-white border border-gray-100 rounded-[20px] shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-2">
                          {isLoadingAreas ? (
                            <div className="flex items-center justify-center py-4 text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                              <div className="h-4 w-4 border-2 border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
                              Locating...
                            </div>
                          ) : areaSuggestions.length > 0 ? (
                            areaSuggestions.map((area, idx) => (
                              <div key={idx} onClick={() => setUiState(p => ({ ...p, areaName: area.name, showAreaDropdown: false }))} className="px-6 py-3 rounded-[14px] hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] cursor-pointer transition-all font-bold text-gray-700 text-sm">
                                {area.name} <span className="text-[10px] text-gray-400 font-normal">({area.city})</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No areas found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLocationSearch}
                    className="w-full py-5 bg-[#ff0b01] text-white font-black tracking-[0.25em] text-[12px] rounded-[20px] shadow-xl shadow-[#ff0b01]/10 hover:shadow-[#ff0b01]/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                  >
                    SEARCH PREMIUM SALONS
                  </button>
                </div>

                <div className="space-y-6">
                  {uiState.isSearching && (
                    <div className="flex flex-col items-center py-16 gap-4">
                      <div className="h-10 w-10 border-[4px] border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">Defining Elegance</p>
                    </div>
                  )}

                  {salonResults && salonResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                      {salonResults.map((salon, index) => {
                        const currentlyOpen = isOpen(salon.openingTime, salon.closingTime);
                        return (
                          <div
                            key={salon.salonId || index}
                            onClick={() => handleSalonSelect(salon)}
                            className="group flex flex-col p-6 rounded-[32px] bg-white border border-gray-100 hover:border-[#ff0b01]/30 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all cursor-pointer relative overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.01)]"
                          >
                            <div className="flex items-start justify-between mb-6">
                              <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 bg-gray-50 rounded-[22px] overflow-hidden border-[3px] border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                                  {salon.imageBase64 ? (
                                    <img src={`data:image/png;base64,${salon.imageBase64}`} alt={salon.salonName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-[#ff0b01] text-2xl font-black">
                                      {salon.salonName ? salon.salonName[0] : 'S'}
                                    </div>
                                  )}
                                </div>
                                {salon.homeServiceCharges && (
                                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#ff0b01] rounded-[10px] flex items-center justify-center text-white shadow-md shadow-[#ff0b01]/30 transform group-hover:rotate-12 transition-all border-2 border-white">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-3">
                                <span className="px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200 text-[9px] font-black text-gray-400 group-hover:text-gray-900 group-hover:border-[#ff0b01]/20 transition-all uppercase tracking-widest">{salon.salonCode}</span>
                                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${currentlyOpen ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'} text-[7px] font-black uppercase tracking-widest shadow-sm`}>
                                  <div className={`h-1 w-1 rounded-full ${currentlyOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                  {currentlyOpen ? 'Open' : 'Closed'}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 flex-1">
                              <h4 className="text-lg font-black text-gray-900 group-hover:text-[#ff0b01] transition-colors leading-tight uppercase tracking-tight truncate">{salon.salonName}</h4>

                              <div className="space-y-2">
                                <div className="flex items-start gap-2 text-gray-500 font-bold text-[12px] leading-snug">
                                  <svg className="w-4 h-4 flex-shrink-0 text-[#ff0b01]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  <p className="line-clamp-2">{salon.address || 'Address updating...'}</p>
                                </div>
                                <p className="text-[11px] font-black text-gray-300 ml-6 tracking-[0.1em] uppercase">
                                  {salon.areaName} • {salon.cityName}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-gray-400">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <span className="text-[10px] font-black tracking-widest">
                                    {salon.openingTime?.slice(0, 5)} - {salon.closingTime?.slice(0, 5)}
                                  </span>
                                </div>
                              </div>
                              <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#ff0b01] group-hover:text-white transition-all duration-300 shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                              </div>
                            </div>

                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#ff0b01]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    !uiState.isSearching && uiState.cityName && (
                      <div className="text-center py-24" data-aos="fade-up">
                        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                          <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <p className="text-gray-300 font-black tracking-[0.4em] text-[12px] uppercase">Destination Unknown</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* SALON ID UI */
              <div className="flex-1 flex items-center justify-center py-6" data-aos="fade-up">
                <div className="max-w-[420px] w-full">
                  <div className="bg-white border border-gray-100 p-8 rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#ff0b01]/5 rounded-bl-[60px]" />

                    <div className="space-y-2 relative z-10">
                      <div className="w-12 h-1.5 bg-[#ff0b01] rounded-full"></div>
                      <h3 className="text-[22px] font-black text-gray-900 tracking-tighter leading-none uppercase">Access Pass</h3>
                      <p className="text-gray-400 font-medium text-sm leading-relaxed">Enter a unique salon ID to jump directly in.</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-transform group-focus-within:-translate-y-0.5">
                          <img src={mobileIcon} alt="ID" className="w-[20px] h-[20px] opacity-40" />
                        </div>
                        <input
                          type="text"
                          value={uiState.salonId}
                          onChange={(e) => setUiState(p => ({ ...p, salonId: e.target.value }))}
                          placeholder="SALON-XXXXXX"
                          className="w-full pl-14 pr-6 py-5 bg-[#fafafa] border border-gray-100 rounded-[20px] text-base font-black tracking-wider focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-300 shadow-inner"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setUiState(p => ({ ...p, showScanner: true }))}
                          className="flex flex-col items-center gap-2 p-5 bg-[#fafafa] border border-gray-100 rounded-[24px] hover:bg-white hover:border-[#ff0b01]/20 hover:shadow-lg transition-all group active:scale-95"
                        >
                          <div className="p-3.5 bg-white rounded-[16px] group-hover:bg-[#ff0b01] group-hover:text-white transition-all shadow-sm">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                          </div>
                          <span className="text-[9px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-[0.2em]">Scan QR</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-5 bg-[#fafafa] border border-gray-100 rounded-[24px] hover:bg-white hover:border-[#ff0b01]/20 hover:shadow-lg transition-all group active:scale-95">
                          <div className="p-3.5 bg-white rounded-[16px] group-hover:bg-[#ff0b01] group-hover:text-white transition-all shadow-sm">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </div>
                          <span className="text-[9px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-[0.2em]">Upload</span>
                        </button>
                      </div>

                      <button
                        onClick={handleDirectIdSubmit}
                        className="w-full py-4 bg-[#ff0b01] text-white font-black tracking-[0.3em] text-[11px] rounded-[20px] shadow-2xl shadow-[#ff0b01]/25 hover:-translate-y-1 active:scale-95 transition-all"
                      >
                        SECURE ACCESS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal Overlay */}
      {uiState.showScanner && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
              <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.4em]">Scan Salon Code</span>
              <button
                onClick={() => setUiState(p => ({ ...p, showScanner: false }))}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#ff0b01] hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Camera Area */}
            <div className="relative aspect-square w-full pt-20">
              <div id="qr-reader" className="w-full h-full overflow-hidden" />

              {/* Luxury Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-12 pt-32">
                <div className="w-full h-full border-2 border-white/20 rounded-[40px] relative">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#ff0b01] rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#ff0b01] rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#ff0b01] rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#ff0b01] rounded-br-2xl" />

                  {/* Moving Line Animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff0b01] to-transparent shadow-[0_0_20px_rgba(255,11,1,0.8)] animate-scan-line" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-10 bg-white text-center">
              <p className="text-gray-400 font-medium text-sm">Align the QR code within the frame to automatically scan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Impact Image Section */}
      <div className="hidden lg:block lg:flex-1 relative bg-gray-100 h-screen overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img src={rightBackground} alt="Impact" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8a1a16]/95 via-[#8a1a16]/50 to-transparent"></div>
          <div className="absolute bottom-24 left-16 text-white max-w-xl" data-aos="fade-up" data-aos-delay="600">
            <h2 className="text-5xl font-black mb-8 leading-[0.95] tracking-tighter">Luxury is an<br />Experience.</h2>
            <p className="text-lg text-white/80 font-medium tracking-wide">Every salon on NeoParlour is hand-picked to ensure your session is nothing short of exceptional.</p>
          </div>
        </div>
      </div>

      {/* Global Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[200] flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-10">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-[#ff0b01]/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#ff0b01] rounded-full animate-spin border-t-transparent" />
              <div className="absolute inset-4 bg-[#ff0b01] rounded-full animate-pulse shadow-[0_0_40px_rgba(255,11,1,0.5)]" />
            </div>
            <p className="font-black tracking-[0.7em] text-[13px] text-white uppercase">Initializing</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalonSelection;
