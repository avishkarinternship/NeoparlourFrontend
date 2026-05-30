import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setActiveTab, sendRegisterOtp, registerWithOtp, clearOwnerStaffError, resetRegistration, loginOwner } from '../../redux/slices/ownerStaffSlice';
import { toast } from 'react-hot-toast';
import AOS from 'aos';

// Locations Data
import locationData from '../../data/locations.json';

import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import usernameIcon from '../../assets/CustomerRegister/username_icon.svg';
import emailIcon from '../../assets/CustomerRegister/email_icon.svg';
import mobileIcon from '../../assets/CustomerRegister/mobile_icon.svg';
import passwordIcon from '../../assets/CustomerRegister/password_icon.svg';
import rightBackground from '../../assets/CustomerRegister/right_background.jpg';

const CustomerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeTab, loading, error, otpSent } = useSelector((state) => state.ownerStaff);

  // Consolidating all local UI state into a single useState hook
  const [uiState, setUiState] = useState({
    formData: {
      name: '',
      email: '',
      phone: '',
      salonName: '',
      cityName: '',
      areaName: '',
      specificAddress: '',
      openingTime: '09:00',
      closingTime: '21:00',
      password: '',
      confirmPassword: '',
    },
    otp: '',
    showPassword: false,
    showConfirmPassword: false,
    showCityDropdown: false,
    showAreaDropdown: false,
    tncAccepted: false,
  });

  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);

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

  useEffect(() => {
    return () => {
      dispatch(clearOwnerStaffError());
      dispatch(resetRegistration());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUiState(prev => ({
      ...prev,
      formData: { ...prev.formData, [name]: value }
    }));
  };

  // Search logic for City
  const filteredCities = locationData.cities.filter(city => 
    city.name.toLowerCase().includes(uiState.formData.cityName.toLowerCase())
  );

  // Search logic for Area
  const selectedCityData = locationData.cities.find(c => c.name.toLowerCase() === uiState.formData.cityName.toLowerCase());
  const filteredAreas = selectedCityData ? selectedCityData.areas.filter(area => 
    area.toLowerCase().includes(uiState.formData.areaName.toLowerCase())
  ) : [];

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    dispatch(clearOwnerStaffError());
    dispatch(resetRegistration());
  };

  const handleSendOtp = () => {
    if (!uiState.formData.phone) {
      alert('Please enter a mobile number first.');
      return;
    }
    dispatch(sendRegisterOtp({ mobile: uiState.formData.phone, type: activeTab }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!uiState.tncAccepted) {
      toast.error('Please accept the Terms & Conditions to proceed.', {
        duration: 3000,
        style: { background: '#1c1c1e', color: '#fff', borderRadius: '16px' }
      });
      return;
    }

    if (uiState.formData.password !== uiState.formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!otpSent) {
      handleSendOtp();
      return;
    }

    if (!uiState.otp) {
      alert('Please enter the OTP.');
      return;
    }

    const userDTO = {
      ...uiState.formData,
      role: activeTab === 'OWNER' ? 'SALON_OWNER' : 'CUSTOMER',
      openingTime: uiState.formData.openingTime + ':00',
      closingTime: uiState.formData.closingTime + ':00',
      tncAccepted: true,
      tncAcceptedAt: new Date().toISOString(),
      tncVersion: '1.0',
    };

    dispatch(registerWithOtp({ userDTO, otp: uiState.otp, type: activeTab })).unwrap()
      .then(() => {
        if (activeTab === 'OWNER') {
          const salonDetails = {
            salonName: uiState.formData.salonName,
            salonAddress: `${uiState.formData.specificAddress || ''}, ${uiState.formData.areaName || ''}, ${uiState.formData.cityName || ''}`,
            salonEmail: uiState.formData.email,
            openingTime: uiState.formData.openingTime + ':00',
            closingTime: uiState.formData.closingTime + ':00',
            latitude: 0.0,
            longitude: 0.0,
            homeServiceCharges: 0.0,
            imageBase64: ""
          };
          localStorage.setItem('tempSalonDetails', JSON.stringify(salonDetails));
          localStorage.setItem('tempRegisterPhone', uiState.formData.phone);
          localStorage.setItem('tempRegisterPassword', uiState.formData.password);

          dispatch(loginOwner({ username: uiState.formData.phone, password: uiState.formData.password })).unwrap()
            .then(() => {
              toast.success('Registration successful! Redirecting to Subscription Plans...', {
                duration: 4000,
                style: { background: '#1c1c1e', color: '#fff', borderRadius: '16px' }
              });
              navigate('/subscription-plans', { state: { salonDetails } });
            })
            .catch((err) => {
              console.error('Auto login failed:', err);
              toast.error('Registration succeeded, but auto-login failed. Please login.');
              navigate('/login');
            });
        } else {
          toast.success('Registration successful! Please login.', {
            duration: 4000,
            style: { background: '#1c1c1e', color: '#fff', borderRadius: '16px' }
          });
          navigate('/login');
        }
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
        <div className="px-12 sm:px-16 lg:px-24 pt-12 pb-10 bg-white z-20 border-b border-gray-50">
          <div className="flex items-center gap-6 mb-12 justify-center lg:justify-start">
            <img src={logoIcon} alt="NeoParlour Logo" className="w-14 h-14 object-contain" />
            <span className="text-[30px] md:text-[38px] font-bold text-gray-900 tracking-tight">NeoParlour</span>
          </div>

          <div className="flex gap-12 md:gap-16 justify-center lg:justify-start">
            <button 
              type="button"
              onClick={() => handleTabChange('CUSTOMER')}
              className={`pb-5 text-[14px] md:text-[15px] font-bold tracking-[0.25em] transition-colors ${activeTab === 'CUSTOMER' ? 'text-gray-900 border-b-2 border-[#ff0b01]' : 'text-gray-300 hover:text-gray-600'}`}
            >
              CUSTOMER
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange('OWNER')}
              className={`pb-5 text-[14px] md:text-[15px] font-bold tracking-[0.25em] transition-colors ${activeTab === 'OWNER' ? 'text-gray-900 border-b-2 border-[#ff0b01]' : 'text-gray-300 hover:text-gray-600'}`}
            >
              OWNER
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-12 sm:px-16 lg:px-24 py-12 custom-scrollbar">
          <div className="w-full max-w-[540px] mx-auto lg:mx-0">
            
            {error && (
              <div className="mb-10 p-6 bg-red-50 text-red-600 text-lg rounded-2xl border border-red-100 shadow-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Profile Information Section */}
              <div className="space-y-6">
                <h3 className="text-[12px] font-black text-gray-300 tracking-[0.3em] uppercase mb-4">Personal Details</h3>
                
                {/* User Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <img src={usernameIcon} alt="User" className="w-[22px] h-[22px] opacity-40" />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={uiState.formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name" 
                    required
                    className="w-full pl-16 pr-6 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all placeholder-gray-400" 
                  />
                </div>

                {/* Email Id */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <img src={emailIcon} alt="Email" className="w-[22px] h-[22px] opacity-40" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={uiState.formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address" 
                    required
                    className="w-full pl-16 pr-6 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all placeholder-gray-400" 
                  />
                </div>

                {/* Mobile Number */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <img src={mobileIcon} alt="Phone" className="w-[22px] h-[22px] opacity-40" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone"
                    value={uiState.formData.phone}
                    onChange={handleInputChange}
                    placeholder="Mobile Number" 
                    required
                    className="w-full pl-16 pr-32 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all placeholder-gray-400" 
                  />
                  <button 
                    type="button" 
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-10 flex items-center text-base font-bold text-[#ff0b01] hover:text-red-700 transition-colors"
                  >
                    {otpSent ? 'RESEND' : 'VERIFY'}
                  </button>
                </div>
              </div>

              {/* Highlighted Salon Information Section */}
              {activeTab === 'OWNER' && (
                <div className="mt-12 bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 md:p-10 space-y-6 shadow-sm" data-aos="fade-up">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-1 bg-[#ff0b01] rounded-full"></div>
                    <h3 className="text-[12px] font-black text-gray-900 tracking-[0.3em] uppercase">Salon Information</h3>
                  </div>
                  
                  {/* Salon Name */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <img src={usernameIcon} alt="Salon" className="w-[22px] h-[22px] opacity-40" />
                    </div>
                    <input 
                      type="text" 
                      name="salonName"
                      value={uiState.formData.salonName}
                      onChange={handleInputChange}
                      placeholder="Salon Name" 
                      required
                      className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all shadow-sm" 
                    />
                  </div>

                  {/* Manual/Searchable City and Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* City Field */}
                    <div className="relative" ref={cityDropdownRef}>
                      <input 
                        type="text"
                        name="cityName"
                        placeholder="City"
                        value={uiState.formData.cityName}
                        onChange={(e) => {
                          handleInputChange(e);
                          setUiState(p => ({ ...p, showCityDropdown: true }));
                        }}
                        onFocus={() => setUiState(p => ({ ...p, showCityDropdown: true }))}
                        className="w-full px-8 py-5 bg-white border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all shadow-sm"
                        required
                      />
                      {uiState.showCityDropdown && uiState.formData.cityName && (
                        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredCities.length > 0 ? filteredCities.map((city, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setUiState(p => ({ 
                                  ...p, 
                                  formData: { ...p.formData, cityName: city.name, areaName: '' }, 
                                  showCityDropdown: false 
                                }));
                              }}
                              className="px-8 py-4 hover:bg-red-50 hover:text-[#ff0b01] cursor-pointer transition-colors text-gray-700 font-medium"
                            >
                              {city.name}
                            </div>
                          )) : (
                            <div className="px-8 py-4 text-gray-400 italic">No matches found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Area Field */}
                    <div className="relative" ref={areaDropdownRef}>
                      <input 
                        type="text"
                        name="areaName"
                        placeholder="Area"
                        value={uiState.formData.areaName}
                        onChange={(e) => {
                          handleInputChange(e);
                          setUiState(p => ({ ...p, showAreaDropdown: true }));
                        }}
                        onFocus={() => setUiState(p => ({ ...p, showAreaDropdown: true }))}
                        className="w-full px-8 py-5 bg-white border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all shadow-sm"
                        required
                      />
                      {uiState.showAreaDropdown && uiState.formData.areaName && (
                        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredAreas.length > 0 ? filteredAreas.map((area, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setUiState(p => ({ 
                                  ...p, 
                                  formData: { ...p.formData, areaName: area }, 
                                  showAreaDropdown: false 
                                }));
                              }}
                              className="px-8 py-4 hover:bg-red-50 hover:text-[#ff0b01] cursor-pointer transition-colors text-gray-700 font-medium"
                            >
                              {area}
                            </div>
                          )) : (
                            <div className="px-8 py-4 text-gray-400 italic">No matches found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specific Address Field */}
                  <div className="relative">
                    <div className="absolute top-5 left-6 pointer-events-none">
                      <svg className="w-6 h-6 text-gray-400 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <textarea 
                      name="specificAddress"
                      value={uiState.formData.specificAddress}
                      onChange={handleInputChange}
                      placeholder="Specific Address (Shop No, Building, Landmark...)" 
                      required
                      rows="3"
                      className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all shadow-sm resize-none" 
                    />
                  </div>

                  {/* Times */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <label className="text-[11px] font-black text-gray-400 mb-3 block uppercase tracking-widest">Opening Time</label>
                      <input 
                        type="time" 
                        name="openingTime"
                        value={uiState.formData.openingTime}
                        onChange={handleInputChange}
                        className="w-full px-8 py-5 bg-white border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] shadow-sm"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-black text-gray-400 mb-3 block uppercase tracking-widest">Closing Time</label>
                      <input 
                        type="time" 
                        name="closingTime"
                        value={uiState.formData.closingTime}
                        onChange={handleInputChange}
                        className="w-full px-8 py-5 bg-white border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password Section */}
              <div className="space-y-6 pt-6">
                <h3 className="text-[12px] font-black text-gray-300 tracking-[0.3em] uppercase mb-4">Security</h3>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <img src={passwordIcon} alt="Lock" className="w-[22px] h-[22px] opacity-40" />
                  </div>
                  <input 
                    type={uiState.showPassword ? "text" : "password"} 
                    name="password"
                    value={uiState.formData.password}
                    onChange={handleInputChange}
                    placeholder="Create Password" 
                    required
                    className="w-full pl-16 pr-16 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all placeholder-gray-400" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setUiState(p => ({ ...p, showPassword: !p.showPassword }))} 
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
                  >
                    {uiState.showPassword ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <img src={passwordIcon} alt="Lock" className="w-[22px] h-[22px] opacity-40" />
                  </div>
                  <input 
                    type={uiState.showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={uiState.formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password" 
                    required
                    className="w-full pl-16 pr-16 py-5 bg-[#fafafa] border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#ff0b01] transition-all placeholder-gray-400" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setUiState(p => ({ ...p, showConfirmPassword: !p.showConfirmPassword }))} 
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-[#ff0b01] transition-colors"
                  >
                    {uiState.showConfirmPassword ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="relative animate-pulse py-4">
                  <input 
                    type="text" 
                    value={uiState.otp} 
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setUiState(p => ({ ...p, otp: val }));
                    }} 
                    placeholder="ENTER OTP" 
                    required 
                    className="w-full px-8 py-6 bg-[#fff0f0] border-2 border-[#ff0b01] rounded-2xl text-2xl focus:outline-none font-bold tracking-[0.8em] text-center text-[#ff0b01]" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-6 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.3em] text-[13px] rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-5 mt-10 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 active:translate-y-0'}`}
              >
                {loading && <div className="animate-spin h-7 w-7 border-2 border-white border-t-transparent rounded-full" />}
                {otpSent ? 'FINISH REGISTRATION' : 'START REGISTRATION'}
              </button>
            </form>

            <div className="mt-12 pt-8">
              <div className="flex items-center gap-5 mb-4">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-7 h-7 accent-[#ff0b01] cursor-pointer" 
                  checked={uiState.tncAccepted}
                  onChange={(e) => setUiState(p => ({ ...p, tncAccepted: e.target.checked }))}
                />
                <label htmlFor="terms" className="text-[15px] text-gray-400 cursor-pointer font-medium">
                  I agree with the{' '}
                  <Link 
                    to={activeTab === 'OWNER' ? '/owner/terms-and-conditions' : '/customer/terms-and-conditions'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#ff0b01] font-bold hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </label>
              </div>
              {!uiState.tncAccepted && (
                <p className="text-[13px] text-red-400 mb-6 ml-12">* You must accept the Terms & Conditions to register</p>
              )}
              <p className="text-[16px] text-gray-400 text-center lg:text-left">
                Already have account? <Link to="/login" className="text-[#ff0b01] font-extrabold hover:underline ml-3">Login Now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative bg-gray-100 h-screen">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={rightBackground} 
            alt="Professional" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#cf2a25]/95 via-[#cf2a25]/30 to-transparent"></div>
          
          <div className="absolute bottom-24 left-24 text-white max-w-xl" data-aos="fade-up" data-aos-delay="600">
            <h2 className="text-6xl font-bold mb-6 leading-tight">
              {activeTab === 'OWNER' ? 'Join the NeoParlour Network.' : 'Experience Premium Grooming.'}
            </h2>
            <p className="text-2xl text-white/90 font-medium tracking-wide">
              {activeTab === 'OWNER' 
                ? 'Take your salon business to the next level with our advanced management tools.' 
                : 'Book your appointments instantly at the finest salons around you.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerRegister;