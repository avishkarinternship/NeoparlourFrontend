import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { sendRegisterOtp, registerWithOtp, clearOwnerStaffError, resetRegistration } from '../../redux/slices/ownerStaffSlice';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Lock, ShieldCheck, Sparkles, MapPin, Navigation } from 'lucide-react';
import searchService from '../../services/searchService';

// Using existing assets
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import rightBackground from '../../assets/CustomerRegister/right_background.jpg';

const getISTString = (date = new Date()) => {
  const tzoffset = -330; // IST is UTC+5:30
  return new Date(date.getTime() - (tzoffset * 60000)).toISOString().slice(0, -1) + '+05:30';
};

const CustomerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent } = useSelector((state) => state.ownerStaff);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cityName: '',
    areaName: '',
    specificAddress: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [locationLookup, setLocationLookup] = useState({
    citySuggestions: [],
    areaSuggestions: [],
    isLoadingCities: false,
    isLoadingAreas: false,
  });

  const { citySuggestions, areaSuggestions, isLoadingCities, isLoadingAreas } = locationLookup;

  const [tncAccepted, setTncAccepted] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);
  const isUserTypingCityRef = useRef(false);
  const isUserTypingAreaRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      dispatch(clearOwnerStaffError());
      dispatch(resetRegistration());
    };
  }, [dispatch]);

  // Autocomplete city search
  useEffect(() => {
    if (!isUserTypingCityRef.current) return;
    if (!formData.cityName || formData.cityName.trim().length < 2) {
      setLocationLookup(prev => ({ ...prev, citySuggestions: [] }));
      return;
    }

    setLocationLookup(prev => ({ ...prev, isLoadingCities: true }));
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(formData.cityName, 'city');
        setLocationLookup(prev => ({ ...prev, citySuggestions: results }));
      } catch (err) {
        console.error("Customer Register City Search Error:", err);
      } finally {
        setLocationLookup(prev => ({ ...prev, isLoadingCities: false }));
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.cityName]);

  // Autocomplete area search
  useEffect(() => {
    if (!isUserTypingAreaRef.current) return;
    if (!formData.areaName || formData.areaName.trim().length < 2) {
      setLocationLookup(prev => ({ ...prev, areaSuggestions: [] }));
      return;
    }

    setLocationLookup(prev => ({ ...prev, isLoadingAreas: true }));
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(formData.areaName, 'area', formData.cityName);
        setLocationLookup(prev => ({ ...prev, areaSuggestions: results }));
      } catch (err) {
        console.error("Customer Register Area Search Error:", err);
      } finally {
        setLocationLookup(prev => ({ ...prev, isLoadingAreas: false }));
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.areaName, formData.cityName]);

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
            isUserTypingCityRef.current = false;
            isUserTypingAreaRef.current = false;
            setFormData(prev => ({
              ...prev,
              cityName: result.city,
              areaName: result.area || ''
            }));
            toast.success(`Location detected: ${result.city}${result.area ? `, ${result.area}` : ''}`);
          } else {
            toast.error("Could not determine your city. Please enter it manually.");
          }
        } catch (error) {
          toast.error("Could not determine your city. Please enter it manually.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        toast.error("Location permission denied. Please enter it manually.");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = () => {
    if (!formData.phone) {
      toast.error('Please enter a mobile number first.');
      return;
    }
    dispatch(sendRegisterOtp({ mobile: formData.phone, type: 'CUSTOMER' })).unwrap().then(() => {
      toast.success('OTP sent successfully!');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tncAccepted) {
      toast.error('Please accept the Terms & Conditions to proceed.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!otpSent) {
      handleSendOtp();
      return;
    }

    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }

    const userDTO = {
      ...formData,
      role: 'CUSTOMER',
      tncAccepted: true,
      tncAcceptedAt: getISTString(),
      tncVersion: '1.0',
    };

    dispatch(registerWithOtp({ userDTO, otp, type: 'CUSTOMER' })).unwrap()
      .then(() => {
        toast.success('Registration successful! Please login.');
        navigate('/customer/login');
      })
      .catch((err) => {
        console.error('Registration failed:', err);
        toast.error(err || 'Registration failed.');
      });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* Left Form Side - Full Screen Height */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col h-screen bg-white">
        
        {/* Header Section */}
        <div className="px-8 sm:px-12 lg:px-16 pt-10 pb-6 bg-white z-20 border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <img src={logoIcon} alt="NeoParlour Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">NeoParlour</span>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-12 lg:px-16 py-10 custom-scrollbar">
          <div className="w-full max-w-[540px] mx-auto lg:mx-0">
            
            <div className="mb-8">
              <span className="text-[10px] font-black tracking-[0.2em] text-[#ff0b01]/80 uppercase mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Luxury Grooming Awaits
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">Create Customer Account</h2>
              <p className="text-gray-400 font-medium text-xs">Join NeoParlour to discover and book sessions at Pune's premium salons.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 shadow-sm animate-pulse">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Personal Details</h3>
                
                {/* User Name */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                    <User className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name" 
                    required
                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                  />
                </div>

                {/* Email Id */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                    <Mail className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address" 
                    required
                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                  />
                </div>

                {/* Mobile Number */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                    <Phone className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Mobile Number" 
                    required
                    disabled={otpSent}
                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold disabled:opacity-50" 
                  />
                </div>
              </div>

              {/* Location Details Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Location Details</h3>
                
                {/* Cities Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative" ref={cityDropdownRef}>
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-5 h-5 stroke-[2]" />
                    </div>
                    <input 
                      type="text" 
                      name="cityName"
                      value={formData.cityName}
                      onChange={(e) => {
                        isUserTypingCityRef.current = true;
                        handleInputChange(e);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Select City" 
                      required
                      className="w-full pl-14 pr-12 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-[#ff0b01] hover:bg-[#ff0b01]/5 transition-all duration-150 flex-shrink-0 z-10 ${
                        isDetectingLocation ? 'animate-pulse pointer-events-none' : 'hover:scale-105 active:scale-95'
                      }`}
                      title="Detect Current Location"
                    >
                      {isDetectingLocation ? (
                        <div className="h-4 w-4 border-2 border-[#ff0b01]/10 border-t-[#ff0b01] rounded-full animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 -rotate-45" />
                      )}
                    </button>
                    {showCityDropdown && formData.cityName && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left">
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
                                isUserTypingCityRef.current = false;
                                setFormData(prev => ({ ...prev, cityName: city.name, areaName: '' }));
                                setLocationLookup(prev => ({ ...prev, citySuggestions: [], areaSuggestions: [] }));
                                setShowCityDropdown(false);
                              }}
                              className="px-4 py-2.5 rounded-xl hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] cursor-pointer text-sm font-bold text-gray-700 transition-colors"
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

                  {/* Areas Dropdown */}
                  <div className="relative" ref={areaDropdownRef}>
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-5 h-5 stroke-[2]" />
                    </div>
                    <input 
                      type="text" 
                      name="areaName"
                      value={formData.areaName}
                      onChange={(e) => {
                        isUserTypingAreaRef.current = true;
                        handleInputChange(e);
                        setShowAreaDropdown(true);
                      }}
                      onFocus={() => setShowAreaDropdown(true)}
                      placeholder="Select Area" 
                      required
                      className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                    />
                    {showAreaDropdown && formData.areaName && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left">
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
                                isUserTypingAreaRef.current = false;
                                setFormData(prev => ({ ...prev, areaName: area.name }));
                                setLocationLookup(prev => ({ ...prev, areaSuggestions: [] }));
                                setShowAreaDropdown(false);
                              }}
                              className="px-4 py-2.5 rounded-xl hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] cursor-pointer text-sm font-bold text-gray-700 transition-colors"
                            >
                              {area.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No areas found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific Address */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                    <MapPin className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input 
                    type="text" 
                    name="specificAddress"
                    value={formData.specificAddress}
                    onChange={handleInputChange}
                    placeholder="Specific Address (Flat, Street, Landmark)" 
                    className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Security</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                      <Lock className="w-5 h-5 stroke-[2]" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password" 
                      required
                      className="w-full pl-14 pr-10 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                      <Lock className="w-5 h-5 stroke-[2]" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm Password" 
                      required
                      className="w-full pl-14 pr-10 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {otpSent && (
                <div className="relative py-2">
                  <input 
                    type="text" 
                    value={otp} 
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtp(val);
                    }} 
                    placeholder="ENTER OTP" 
                    required 
                    className="w-full px-6 py-4 bg-[#fff0f0] border-2 border-[#ff0b01] rounded-2xl text-xl focus:outline-none font-bold tracking-[0.5em] text-center text-[#ff0b01]" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
              >
                {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
                {otpSent ? 'FINISH REGISTRATION' : 'START REGISTRATION'}
              </button>
            </form>

            <div className="mt-8 pt-6">
              <div className="flex items-center gap-3 mb-3">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-6 h-6 accent-[#ff0b01] cursor-pointer" 
                  checked={tncAccepted}
                  onChange={(e) => setTncAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer font-bold">
                  I agree with the{' '}
                  <Link 
                    to="/customer/terms-and-conditions" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#ff0b01] font-black hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </label>
              </div>
              {!tncAccepted && (
                <p className="text-[10px] text-red-500 mb-4 ml-9 font-semibold">* You must accept the Terms & Conditions to register</p>
              )}
              <p className="text-sm text-gray-400 text-center lg:text-left">
                Already have account? <Link to="/customer/login" className="text-[#ff0b01] font-black hover:underline ml-2">Login Now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block lg:flex-1 relative bg-gray-100 h-screen overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={rightBackground} 
            alt="Professional" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8a1a16]/95 via-[#8a1a16]/50 to-transparent"></div>
          
          <div className="absolute bottom-24 left-24 text-white max-w-xl" data-aos="fade-up" data-aos-delay="600">
            <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
              Experience Premium Grooming.
            </h2>
            <p className="text-lg text-white/90 font-medium tracking-wide leading-relaxed">
              Discover local salons, read genuine customer reviews, book appointments instantly, and check in securely.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerRegister;