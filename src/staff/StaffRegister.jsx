import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import logoIcon from '../assets/Neoparlour_logo.png';
import usernameIcon from '../assets/CustomerRegister/username_icon.svg';
import salonIdIcon from '../assets/CustomerRegister/username_icon.svg';
import specialityIcon from '../assets/CustomerRegister/username_icon.svg';
import emailIcon from '../assets/CustomerRegister/email_icon.svg'
import mobileIcon from '../assets/CustomerRegister/mobile_icon.svg'; 
import passwordIcon from '../assets/CustomerRegister/password_icon.svg';
import rightBackground from '../assets/StaffRegister/right_background.jpg'; 

const StaffRegister = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('REGISTER');
  const [mobile, setMobile] = useState('');

  const handleVerify = () => {
    if (!mobile) {
      toast.error('Please enter a mobile number first.');
      return;
    }
    if (mobile.length !== 10 || !/^[0-9]{10}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    toast.success('Verification OTP code sent!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10 || !/^[0-9]{10}$/.test(mobile)) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }
    toast.success('Registration details submitted!');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-8 px-6 pb-6 font-sans">
      
      {/* Main Card Container */}
      <div className="flex-1 max-w-[1100px] w-full mx-auto bg-white flex shadow-sm overflow-hidden mb-8 rounded-sm">
        
        {/* Left Form Side */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center py-8 px-8 sm:px-12 lg:px-16 overflow-y-auto">
          <div className="w-full max-w-[360px]">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-8">
              <img src={logoIcon} alt="NeoParlour Logo" className="w-10 h-10 object-contain" />
              <span className="text-[26px] font-bold text-gray-900 tracking-tight">NeoParlour</span>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-10 mb-6">
              <button 
                onClick={() => navigate('/owner/login')}
                className={`pb-2 text-[11px] font-bold tracking-widest transition-all ${
                  activeTab === 'LOGIN' 
                  ? 'text-gray-900 border-b-2 border-[#ff0b01]' 
                  : 'text-gray-300'
                }`}
              >
                LOGIN
              </button>
              <button 
                onClick={() => setActiveTab('REGISTER')}
                className={`pb-2 text-[11px] font-bold tracking-widest transition-all ${
                  activeTab === 'REGISTER' 
                  ? 'text-gray-900 border-b-2 border-[#ff0b01]' 
                  : 'text-gray-300'
                }`}
              >
                REGISTER
              </button>
            </div>

            {/* Registration Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* User Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <img src={usernameIcon} alt="username" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="User Name" 
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-[#ff0b01] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Email Id */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <img src={emailIcon} alt="email" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Id" 
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Mobile Number with Verify */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={mobileIcon} alt="Icon" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-12 pr-16 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
                <button 
                  type="button" 
                  onClick={handleVerify}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#ff0b01] hover:underline"
                >
                  Verify
                </button>
              </div>

              {/* Salon ID */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <img src={salonIdIcon} alt="salonId" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Salon ID" 
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Speciality */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <img src={specialityIcon} alt="speciality" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter Speciality" 
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Create Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={passwordIcon} alt="Lock" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="password" 
                  placeholder="Create a password" 
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={passwordIcon} alt="Lock" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="password" 
                  placeholder="Confirm password" 
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.15em] text-[10px] rounded-xl transition-colors mt-4 shadow-md uppercase">
                Submit
              </button>
            </form>

            {/* Terms and Links */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-[14px] h-[14px] accent-[#ff0b01] cursor-pointer" 
                  defaultChecked
                />
                <label htmlFor="terms" className="text-[10px] text-gray-400 cursor-pointer">
                  I agree with terms of use
                </label>
              </div>
              
              <div className="text-[10px] space-y-1">
                <p className="text-gray-400">
                  Already have account? <a href="#" className="text-[#ff0b01] font-bold hover:underline">Login</a>
                </p>
                <p className="text-gray-400">or sign in with</p>
              </div>
            </div>

            {/* Owner Registration Link */}
            <button type="button" className="w-full mt-6 py-3 border border-gray-800 hover:bg-gray-50 text-gray-900 font-bold tracking-[0.15em] text-[10px] rounded-xl transition-colors uppercase">
              Register as Owner
            </button>

            {/* Social Login Section */}
            <div className="flex gap-4 mt-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-[11px] font-bold text-gray-800 transition-colors">
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-[18px] h-[18px]" alt="Google" />
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-[11px] font-bold text-gray-800 transition-colors">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
          <img 
            src={rightBackground} 
            alt="Staff Professional" 
            className="w-full h-full object-cover"
          />
          {/* Circular UI Element from image_a03fb1.png / image_9fce9d.png */}
          <div className="absolute top-[20%] left-[-30px] w-[60px] h-[60px] bg-[#ff0b01] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
             <span className="text-white text-xl">✨</span>
          </div>
          {/* Red gradient overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#cf2a25] via-[#cf2a25]/40 to-transparent opacity-90"></div>
        </div>

      </div>
    </div>
  );
};

export default StaffRegister;