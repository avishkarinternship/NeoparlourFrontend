import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { sendRegisterOtp, registerWithOtp, loginOwner, clearOwnerStaffError, resetRegistration } from '../../redux/slices/ownerStaffSlice';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Lock, ShieldCheck, Sparkles, MapPin, Navigation, Eye, EyeOff, Camera, UploadCloud, X, FileText, Store, Building, Clock, Upload, Compass } from 'lucide-react';
import searchService from '../../services/searchService';
import { compressImage } from '../../utils/imageCompressor';
import { GstStateInput, StateSelector, GstinInput } from '../common/GstStateInput';
import { getStateFromCityName, getStateDisplayName } from '../../constants/indianStates';

// Using existing assets
import logoIcon from '../../assets/Neoparlour_logo.png';
import rightBackground from '../../assets/CustomerRegister/right_background.jpg';

const getISTString = (date = new Date()) => {
  const tzoffset = -330; // IST is UTC+5:30
  return new Date(date.getTime() - (tzoffset * 60000)).toISOString().slice(0, -1) + '+05:30';
};

const SALON_TYPES = [
  { value: 'MALE', label: 'Male Salon' },
  { value: 'FEMALE', label: 'Female Salon' },
  { value: 'UNISEX', label: 'Unisex Salon' }
];

const convertToBase64 = async (file) => {
  try {
    // Instant client-side HTML5 Canvas compression: max 1200px dimension & 75% JPEG quality
    return await compressImage(file, 1200, 1200, 0.75, true);
  } catch (err) {
    console.warn("Canvas compression fallback, using raw FileReader:", err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }
};



const OwnerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent } = useSelector((state) => state.ownerStaff);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salonName: '',
    cityName: '',
    areaName: '',
    areaDistrict: '',
    specificAddress: '',
    landmark: '',
    openingTime: '09:00',
    closingTime: '21:00',
    password: '',
    confirmPassword: '',
    gstin: '',
    state: '',
  });

  const handleGstStateChange = ({ gstin, state }) => {
    setFormData(prev => ({ ...prev, gstin, state }));
  };

  const [otp, setOtp] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [landmarkSuggestions, setLandmarkSuggestions] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [isLoadingLandmarks, setIsLoadingLandmarks] = useState(false);

  const [isUserTypingCity, setIsUserTypingCity] = useState(false);
  const [isUserTypingArea, setIsUserTypingArea] = useState(false);
  const [isUserTypingLandmark, setIsUserTypingLandmark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showLandmarkDropdown, setShowLandmarkDropdown] = useState(false);
  const [tncAccepted, setTncAccepted] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [profileImageBase64, setProfileImageBase64] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [exteriorImage, setExteriorImage] = useState({ base64: '', preview: '', fileName: '' });
  const [interiorImage1, setInteriorImage1] = useState({ base64: '', preview: '', fileName: '' });
  const [interiorImage2, setInteriorImage2] = useState({ base64: '', preview: '', fileName: '' });
  const [optionalImages, setOptionalImages] = useState([]); // Array of { base64, preview, fileName }
  const [kycDocuments, setKycDocuments] = useState({
    AADHAAR_OR_GOVERNMENT_ID: null,
    PAN_CARD: null,
    SHOP_ESTABLISHMENT_LICENSE: null,
    BANK_ACCOUNT_PROOF: null
  });

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Profile image size must be under 2MB.');
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setProfileImageBase64(base64);
        setProfileImagePreview(URL.createObjectURL(file));
      } catch (err) {
        toast.error('Failed to process image file.');
      }
    }
  };

  const handleSlotImageChange = async (slotName, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be under 2MB.');
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        const imgObj = { base64, preview: URL.createObjectURL(file), fileName: file.name };
        if (slotName === 'exterior') setExteriorImage(imgObj);
        else if (slotName === 'interior1') setInteriorImage1(imgObj);
        else if (slotName === 'interior2') setInteriorImage2(imgObj);
        toast.success('Image uploaded successfully.');
      } catch (err) {
        toast.error('Failed to process image file.');
      }
    }
  };

  const handleOptionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + optionalImages.length > 2) {
      toast.error('You can upload up to 2 additional gallery images.');
      return;
    }
    const newImages = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 2MB).`);
        continue;
      }
      try {
        const base64 = await convertToBase64(file);
        newImages.push({
          base64,
          preview: URL.createObjectURL(file),
          fileName: file.name
        });
      } catch (err) {
        toast.error(`Failed to process ${file.name}`);
      }
    }
    setOptionalImages(prev => [...prev, ...newImages]);
  };

  const removeOptionalImage = (index) => {
    setOptionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleKycFileChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be under 2MB.');
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setKycDocuments(prev => ({
          ...prev,
          [type]: {
            fileName: file.name,
            contentType: file.type,
            fileBase64: base64
          }
        }));
        toast.success(`${file.name} uploaded successfully.`);
      } catch (err) {
        toast.error('Failed to process file.');
      }
    }
  };

  const removeKycDocument = (type) => {
    setKycDocuments(prev => ({
      ...prev,
      [type]: null
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.city-dropdown-container')) {
        setShowCityDropdown(false);
      }
      if (!event.target.closest('.area-dropdown-container')) {
        setShowAreaDropdown(false);
      }
      if (!event.target.closest('.landmark-dropdown-container')) {
        setShowLandmarkDropdown(false);
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
            setIsUserTypingCity(false);
            setIsUserTypingArea(false);
            setFormData(prev => ({
              ...prev,
              cityName: result.city,
              areaName: result.area || ''
            }));
            toast.success(`Location detected: ${result.city}${result.area ? `, ${result.area}` : ''}`);
          } else {
            toast.error("Could not determine your city. Please enter it manually.");
          }
        } catch (err) {
          console.error("Location detection error:", err);
          toast.error("Failed to detect location. Please enter manually.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location access denied or unavailable.");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const val = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Autocomplete city search
  useEffect(() => {
    if (!isUserTypingCity) return;
    if (!formData.cityName || formData.cityName.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }

    setIsLoadingCities(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(formData.cityName, 'city', '', formData.state);
        setCitySuggestions(results);
      } catch (err) {
        console.error("Owner Register City Search Error:", err);
      } finally {
        setIsLoadingCities(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.cityName, formData.state, isUserTypingCity]);

  // Autocomplete area search
  useEffect(() => {
    if (!isUserTypingArea) return;
    if (!formData.areaName || formData.areaName.trim().length < 2) {
      setAreaSuggestions([]);
      return;
    }

    setIsLoadingAreas(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchExternalLocations(formData.areaName, 'area', formData.cityName, formData.state);
        setAreaSuggestions(results);
      } catch (err) {
        console.error("Owner Register Area Search Error:", err);
      } finally {
        setIsLoadingAreas(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.areaName, formData.cityName, formData.state, isUserTypingArea]);

  // Autocomplete landmark search
  useEffect(() => {
    if (!isUserTypingLandmark) return;
    if (!formData.landmark || formData.landmark.trim().length < 2) {
      setLandmarkSuggestions([]);
      return;
    }

    setIsLoadingLandmarks(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchService.searchLandmarks(
          formData.landmark, 
          formData.areaName, 
          formData.cityName, 
          formData.state, 
          formData.areaDistrict
        );
        setLandmarkSuggestions(results);
      } catch (err) {
        console.error("Owner Register Landmark Search Error:", err);
      } finally {
        setIsLoadingLandmarks(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.landmark, formData.areaName, formData.cityName, formData.state, formData.areaDistrict, isUserTypingLandmark]);

  const handleSendOtp = () => {
    if (!formData.phone) {
      toast.error('Please enter a mobile number first.');
      return;
    }
    if (formData.phone.length !== 10 || !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    dispatch(sendRegisterOtp({ mobile: formData.phone, type: 'OWNER' })).unwrap().then(() => {
      toast.success('OTP sent successfully!');
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Owner Full Name is required.');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Email Address is required.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('Invalid email format.');
        return;
      }
      if (!formData.phone.trim()) {
        toast.error('Mobile Number is required.');
        return;
      }
      if (!/^[0-9]{10}$/.test(formData.phone)) {
        toast.error('Mobile number must be exactly 10 digits.');
        return;
      }
      if (!formData.password) {
        toast.error('Password is required.');
        return;
      }
      if (formData.password.length < 6 || formData.password.length > 20) {
        toast.error('Password must be between 6 and 20 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.salonName.trim()) {
        toast.error('Salon Name is required.');
        return;
      }
      if (!formData.cityName.trim()) {
        toast.error('City Name is required.');
        return;
      }
      if (!formData.areaName.trim()) {
        toast.error('Area Name is required.');
        return;
      }
      if (!formData.specificAddress.trim()) {
        toast.error('Specific Address is required.');
        return;
      }
      if (!formData.openingTime || !formData.closingTime) {
        toast.error('Opening and closing times are required.');
        return;
      }
      if (!exteriorImage.base64 || !interiorImage1.base64 || !interiorImage2.base64) {
        toast.error('Please upload at least 3 salon images: 1 exterior image (outside) and 2 interior images (inside).');
        return;
      }
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSendOtpForStep3 = () => {
    // Map active KYC documents
    const activeDocs = Object.entries(kycDocuments)
      .filter(([_, value]) => value !== null)
      .map(([type, value]) => ({
        documentType: type,
        fileName: value.fileName,
        contentType: value.contentType,
        fileBase64: value.fileBase64
      }));

    if (activeDocs.length === 0) {
      toast.error('At least one document is required for KYC verification purposes.');
      return;
    }

    if (!tncAccepted) {
      toast.error('Please accept the Terms & Conditions to proceed.');
      return;
    }

    dispatch(sendRegisterOtp({ mobile: formData.phone, type: 'OWNER' }))
      .unwrap()
      .then(() => {
        toast.success('OTP sent successfully!');
        setCurrentStep(4);
      })
      .catch((err) => {
        toast.error(err || 'Failed to send OTP.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep !== 4) {
      return;
    }

    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }

    // Map active KYC documents
    const activeDocs = Object.entries(kycDocuments)
      .filter(([_, value]) => value !== null)
      .map(([type, value]) => ({
        documentType: type,
        fileName: value.fileName,
        contentType: value.contentType,
        fileBase64: value.fileBase64
      }));

    const activeSalonImages = [
      exteriorImage.base64,
      interiorImage1.base64,
      interiorImage2.base64,
      ...optionalImages.map(img => img.base64)
    ].filter(Boolean);

    const userDTO = {
      ...formData,
      gstin: formData.gstin ? formData.gstin.trim() : null,
      state: formData.state || null,
      role: 'SALON_OWNER',
      openingTime: formData.openingTime + ':00',
      closingTime: formData.closingTime + ':00',
      tncAccepted: true,
      tncAcceptedAt: getISTString(),
      tncVersion: '1.0',
      imageBase64: profileImageBase64 || null,
      salonImagesBase64: activeSalonImages.length > 0 ? activeSalonImages : null,
      kycDocuments: activeDocs,
    };

    dispatch(registerWithOtp({ userDTO, otp, type: 'OWNER' })).unwrap()
      .then(() => {
        const formattedFullAddress = [
          formData.specificAddress ? formData.specificAddress.trim() : null,
          formData.landmark ? `near ${formData.landmark.trim()}` : null,
          formData.areaName ? formData.areaName.trim() : null,
          formData.cityName ? formData.cityName.trim() : null,
          getStateDisplayName(formData.state) || (formData.state ? formData.state : null)
        ].filter(Boolean).join(', ');

        const salonDetails = {
          salonName: formData.salonName,
          salonAddress: formattedFullAddress,
          salonEmail: formData.email,
          openingTime: formData.openingTime + ':00',
          closingTime: formData.closingTime + ':00',
          latitude: 0.0,
          longitude: 0.0,
          homeServiceCharges: 0.0,
          imageBase64: profileImageBase64 || ""
        };
        localStorage.setItem('tempSalonDetails', JSON.stringify(salonDetails));
        localStorage.setItem('tempRegisterPhone', formData.phone);
        localStorage.setItem('tempRegisterPassword', formData.password);

        dispatch(loginOwner({ username: formData.phone, password: formData.password })).unwrap()
          .then(() => {
            toast.success('Registration successful! Redirecting to Subscription Plans...');
            navigate('/subscription-plans', { state: { salonDetails } });
          })
          .catch((err) => {
            console.error('Auto login failed:', err);
            toast.error('Auto-login failed, but registration succeeded. Redirecting to Subscription Plans...');
            navigate('/subscription-plans', { state: { salonDetails } });
          });
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
        <div className="flex-1 overflow-y-auto px-8 sm:px-12 lg:px-16 py-8 custom-scrollbar">
          <div className="w-full max-w-[540px] mx-auto lg:mx-0">
            
            <div className="mb-8">
              <span className="text-[10px] font-black tracking-[0.2em] text-[#ff0b01]/80 uppercase mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Premium Partner Network
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">Owner & Salon Registration</h2>
              <p className="text-gray-400 font-medium text-xs">Establish your luxury presence on NeoParlour and reach new customers.</p>
            </div>
 
            {/* Step Progress Indicator */}
            <div className="mb-8 mt-2">
              <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-100 z-0"></div>
                {/* Active Progress Line */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#ff0b01] transition-all duration-300 z-0"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
                
                {[
                  { step: 1, label: 'Personal' },
                  { step: 2, label: 'Salon' },
                  { step: 3, label: 'KYC' },
                  { step: 4, label: 'OTP' }
                ].map((item) => {
                  const isCompleted = currentStep > item.step;
                  const isActive = currentStep === item.step;
                  return (
                    <div key={item.step} className="flex flex-col items-center z-10 relative">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-[#ff0b01] text-white' 
                            : isActive 
                            ? 'bg-white border-2 border-[#ff0b01] text-[#ff0b01] shadow-lg shadow-red-500/10' 
                            : 'bg-white border-2 border-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? '✓' : item.step}
                      </div>
                      <span 
                        className={`text-[9px] font-black tracking-wider uppercase mt-1.5 transition-colors duration-300 ${
                          isActive ? 'text-[#ff0b01]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
 
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 shadow-sm animate-pulse">
                {error}
              </div>
            )}
 
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* STEP 1: Owner Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Owner Details</h3>
                    
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
                        placeholder="Owner Full Name" 
                        required
                        className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                      />
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                        />
                      </div>
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
 
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 mt-6 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    CONTINUE TO SALON INFO
                  </button>
                </div>
              )}
 
              {/* STEP 2: Salon Information */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Salon Information</h3>
                    
                    {/* Salon Name */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                        <Building className="w-5 h-5 stroke-[2]" />
                      </div>
                      <input 
                        type="text" 
                        name="salonName"
                        value={formData.salonName}
                        onChange={handleInputChange}
                        placeholder="Salon Name" 
                        required
                        className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                      />
                    </div>

                    {/* Row 1: State & City Name Together */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* State Custom Dropdown */}
                      <StateSelector 
                        state={formData.state} 
                        onChange={(newState) => setFormData(prev => ({ ...prev, state: newState }))} 
                        showLabel={false}
                      />

                      {/* City / District Input */}
                      <div className="relative city-dropdown-container">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                          <MapPin className="w-5 h-5 stroke-[2]" />
                        </div>
                        <input 
                          type="text" 
                          name="cityName"
                          value={formData.cityName}
                          onChange={(e) => {
                            setIsUserTypingCity(true);
                            handleInputChange(e);
                            setShowCityDropdown(true);
                          }}
                          onFocus={() => setShowCityDropdown(true)}
                          placeholder="Select City / District *" 
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
                          <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left">
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
                                    setIsUserTypingCity(false);
                                    setFormData(prev => ({
                                      ...prev,
                                      cityName: city.name,
                                      areaName: ''
                                    }));
                                    setCitySuggestions([]);
                                    setAreaSuggestions([]);
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
                    </div>

                    {/* Row 2: Area Name & Landmark Together */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Area Name Input */}
                      <div className="relative area-dropdown-container">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                          <MapPin className="w-5 h-5 stroke-[2]" />
                        </div>
                        <input 
                          type="text" 
                          name="areaName"
                          value={formData.areaName}
                          onChange={(e) => {
                            setIsUserTypingArea(true);
                            handleInputChange(e);
                            setShowAreaDropdown(true);
                          }}
                          onFocus={() => setShowAreaDropdown(true)}
                          placeholder="Select Area *" 
                          required
                          className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                        />
                        {showAreaDropdown && formData.areaName && (
                          <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left">
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
                                    setIsUserTypingArea(false);
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      areaName: area.name,
                                      areaDistrict: area.district || ''
                                    }));
                                    setAreaSuggestions([]);
                                    setShowAreaDropdown(false);
                                  }}
                                  className="px-4 py-2.5 rounded-xl hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] cursor-pointer text-sm transition-colors text-left flex flex-col gap-0.5"
                                >
                                  <span className="font-bold text-gray-900">{area.name}</span>
                                  {area.city && (
                                    <span className="text-[11px] font-semibold text-gray-400">{area.city}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No areas found</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Landmark Input (Optional) */}
                      <div className="relative landmark-dropdown-container">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                          <Compass className="w-5 h-5 stroke-[2]" />
                        </div>
                        <input 
                          type="text" 
                          name="landmark"
                          value={formData.landmark}
                          onChange={(e) => {
                            setIsUserTypingLandmark(true);
                            handleInputChange(e);
                            setShowLandmarkDropdown(true);
                          }}
                          onFocus={() => setShowLandmarkDropdown(true)}
                          placeholder="Landmark (Optional, e.g. Siddhi Hospital)" 
                          className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold" 
                        />
                        {showLandmarkDropdown && formData.landmark && (
                          <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 text-left">
                            {isLoadingLandmarks ? (
                              <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#ff0b01] border-t-transparent rounded-full animate-spin" />
                                <span>Searching landmarks...</span>
                              </div>
                            ) : landmarkSuggestions.length > 0 ? (
                              landmarkSuggestions.map((lm, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    setIsUserTypingLandmark(false);
                                    setFormData(prev => ({ ...prev, landmark: lm.name }));
                                    setLandmarkSuggestions([]);
                                    setShowLandmarkDropdown(false);
                                  }}
                                  className="px-4 py-2.5 rounded-xl hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] cursor-pointer text-sm transition-colors text-left flex flex-col gap-0.5"
                                >
                                  <span className="font-bold text-gray-900">{lm.name}</span>
                                  {lm.details && (
                                    <span className="text-[11px] font-semibold text-gray-400">{lm.details}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No landmarks found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 3: GSTIN Number Below State, City, Area, Landmark */}
                    <GstinInput
                      gstin={formData.gstin}
                      state={formData.state}
                      onChange={handleGstStateChange}
                      showLabel={false}
                    />

                    {/* Row 4: Shop / Building Address */}
                    <div className="relative group">
                      <div className="absolute top-4 left-5 text-gray-400 group-focus-within:text-[#ff0b01] transition-colors">
                        <MapPin className="w-5 h-5 stroke-[2]" />
                      </div>
                      <textarea 
                        name="specificAddress"
                        value={formData.specificAddress}
                        onChange={handleInputChange}
                        placeholder="Shop / Building Address (e.g. Shop No. 4, ABC Complex) *" 
                        required
                        rows="2"
                        className="w-full pl-14 pr-4 py-4 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white transition-all placeholder-gray-400 font-bold resize-none" 
                      />
                    </div>

                    {/* Live Formatted Address Preview */}
                    {(formData.specificAddress || formData.landmark || formData.areaName || formData.cityName) && (
                      <div className="p-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl text-left font-sans">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">📍 Formatted Address Preview</span>
                        <p className="text-xs font-bold text-gray-800 leading-relaxed">
                          {[
                            formData.specificAddress ? formData.specificAddress.trim() : null,
                            formData.landmark ? `near ${formData.landmark.trim()}` : null,
                            formData.areaName ? formData.areaName.trim() : null,
                            formData.cityName ? formData.cityName.trim() : null,
                            getStateDisplayName(formData.state) || (formData.state ? formData.state : null)
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
 
                    {/* Times */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#ff0b01]" /> Opening Time
                        </label>
                        <input 
                          type="time" 
                          name="openingTime"
                          value={formData.openingTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white font-bold"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-gray-400 mb-1.5 block uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#ff0b01]" /> Closing Time
                        </label>
                        <input 
                          type="time" 
                          name="closingTime"
                          value={formData.closingTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-[#fafafa] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#ff0b01] focus:bg-white font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>
 
                  {/* Salon Media Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Salon Media</h3>
                    
                    {/* Main Salon Image */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-bold">Main Salon Image</label>
                      <div className="flex items-center gap-4">
                        <div className="relative group w-24 h-24 bg-[#fafafa] border border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors">
                          {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Main Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2">
                              <Building className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                              <span className="text-[9px] font-bold text-gray-400 block uppercase">Upload</span>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleProfileImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        {profileImagePreview && (
                          <button 
                            type="button" 
                            onClick={() => { setProfileImagePreview(''); setProfileImageBase64(''); }} 
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
 
                    {/* Salon Gallery Images */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-1.5 gap-1">
                        <label className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase">Salon Gallery (Min 3 / Max 5)</label>
                        <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-normal">At least 3 images required</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        Please upload 1 exterior photo (outside view) and at least 2 interior photos (inside views) of the salon. Max 2MB per image.
                      </p>
     
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Slot 1: Exterior */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-bold">1. Exterior View</label>
                          <div className="relative group w-full h-24 bg-[#fafafa] border border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors">
                            {exteriorImage.preview ? (
                              <div className="relative w-full h-full">
                                <img src={exteriorImage.preview} alt="Exterior View" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setExteriorImage({ base64: '', preview: '', fileName: '' })}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <div className="text-center p-2">
                                <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1 group-hover:text-[#ff0b01] transition-colors" />
                                <span className="text-[9px] font-bold text-gray-400 block uppercase">Upload Outside</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleSlotImageChange('exterior', e)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
     
                        {/* Slot 2: Interior 1 */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-bold">2. Interior View 1</label>
                          <div className="relative group w-full h-24 bg-[#fafafa] border border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors">
                            {interiorImage1.preview ? (
                              <div className="relative w-full h-full">
                                <img src={interiorImage1.preview} alt="Interior View 1" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setInteriorImage1({ base64: '', preview: '', fileName: '' })}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <div className="text-center p-2">
                                <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1 group-hover:text-[#ff0b01] transition-colors" />
                                <span className="text-[9px] font-bold text-gray-400 block uppercase">Upload Inside 1</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleSlotImageChange('interior1', e)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
     
                        {/* Slot 3: Interior 2 */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-bold">3. Interior View 2</label>
                          <div className="relative group w-full h-24 bg-[#fafafa] border border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors">
                            {interiorImage2.preview ? (
                              <div className="relative w-full h-full">
                                <img src={interiorImage2.preview} alt="Interior View 2" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setInteriorImage2({ base64: '', preview: '', fileName: '' })}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <div className="text-center p-2">
                                <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1 group-hover:text-[#ff0b01] transition-colors" />
                                <span className="text-[9px] font-bold text-gray-400 block uppercase">Upload Inside 2</span>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleSlotImageChange('interior2', e)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
     
                      {/* Optional images section */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-bold">Additional Gallery Images (Optional - Max 2)</label>
                        <div className="flex flex-wrap gap-3">
                          {optionalImages.map((img, index) => (
                            <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 group">
                              <img src={img.preview} alt={`Optional ${index}`} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => removeOptionalImage(index)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          
                          {optionalImages.length < 2 && (
                            <div className="relative w-16 h-16 bg-[#fafafa] border border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                              <span className="text-xl font-bold text-gray-400">+</span>
                              <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleOptionalImagesChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
 
                  <div className="flex gap-4 mt-6">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-500 font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all flex items-center justify-center gap-4"
                    >
                      BACK
                    </button>
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="flex-1 py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      CONTINUE TO KYC
                    </button>
                  </div>
                </div>
              )}
 
              {/* STEP 3: KYC Documents */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  {/* KYC Documents Section */}
                  <div className="space-y-4 pt-2">
                    <div className="border-b pb-1.5 flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                      <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase">KYC Verification</h3>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-normal">At least 1 document required</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                      Please upload at least one valid identity or business document for KYC verification purpose. Max 2MB. Accepted formats: Image/PDF.
                    </p>
     
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'AADHAAR_OR_GOVERNMENT_ID', label: 'Aadhaar / Government ID' },
                        { key: 'PAN_CARD', label: 'PAN Card' },
                        { key: 'SHOP_ESTABLISHMENT_LICENSE', label: 'Shop & Establishment License' },
                        { key: 'BANK_ACCOUNT_PROOF', label: 'Bank Account Proof' }
                      ].map((doc) => {
                        const uploadedFile = kycDocuments[doc.key];
                        return (
                          <div 
                            key={doc.key} 
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-32 ${
                              uploadedFile 
                                ? 'bg-green-50/30 border-green-200 shadow-sm' 
                                : 'bg-[#fafafa] border-gray-100 hover:border-[#ff0b01]/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-800 leading-tight">
                                  {doc.label}
                                </span>
                                {uploadedFile ? (
                                  <span className="text-[10px] text-gray-400 font-medium mt-1 truncate max-w-[150px]" title={uploadedFile.fileName}>
                                    {uploadedFile.fileName}
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                    Not Uploaded
                                  </span>
                                )}
                              </div>
                              {uploadedFile ? (
                                <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <ShieldCheck className="w-5 h-5 text-gray-300 flex-shrink-0" />
                              )}
                            </div>
     
                            {uploadedFile ? (
                              <button
                                type="button"
                                onClick={() => removeKycDocument(doc.key)}
                                className="w-full mt-2 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" /> Remove
                              </button>
                            ) : (
                              <label className="w-full mt-2 py-2 border border-dashed border-gray-300 text-gray-500 hover:border-[#ff0b01] hover:text-[#ff0b01] hover:bg-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" /> Upload File
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleKycFileChange(doc.key, e)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
 
                  {/* Terms & Conditions Section */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
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
                          to="/owner/terms-and-conditions" 
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
                  </div>
 
                  <div className="flex gap-4 mt-6">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-500 font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all flex items-center justify-center gap-4"
                    >
                      BACK
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSendOtpForStep3}
                      disabled={loading}
                      className={`flex-1 py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 hover:-translate-y-0.5 active:translate-y-0 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
                      SEND OTP
                    </button>
                  </div>
                </div>
              )}
 
              {/* STEP 4: OTP Verification */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-300 tracking-[0.25em] uppercase border-b pb-1.5">Verify Identity</h3>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                      We have sent a 6-digit OTP code to your registered mobile number <span className="font-bold text-gray-900">{formData.phone}</span>. Please enter it below to complete registration.
                    </p>
 
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
                  </div>
 
                  <div className="flex gap-4 mt-6">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-500 font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all flex items-center justify-center gap-4"
                    >
                      BACK
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className={`flex-1 py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.25em] text-[11px] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                    >
                      {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
                      FINISH REGISTRATION
                    </button>
                  </div>
 
                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-[#ff0b01] font-black hover:underline"
                    >
                      Resend OTP code
                    </button>
                  </div>
                </div>
              )}
            </form>
 
            {currentStep === 1 && (
              <div className="mt-8 pt-6 border-t border-gray-50">
                <p className="text-sm text-gray-400 text-center lg:text-left">
                  Already have account? <Link to="/owner/login" className="text-[#ff0b01] font-black hover:underline ml-2">Login Now</Link>
                </p>
              </div>
            )}
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
              Join the NeoParlour Network.
            </h2>
            <p className="text-lg text-white/90 font-medium tracking-wide leading-relaxed">
              Take your salon business to the next level with our advanced management tools and reach premium clients in your area.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OwnerRegister;
