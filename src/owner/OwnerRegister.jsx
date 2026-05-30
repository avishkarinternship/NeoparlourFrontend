import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Assets (Ensure these paths match your project structure)
import logoIcon from '../assets/CustomerRegister/logo_icon.svg';
import usernameIcon from '../assets/CustomerRegister/username_icon.svg';
import emailIcon from '../assets/CustomerRegister/email_icon.svg';
import mobileIcon from '../assets/CustomerRegister/mobile_icon.svg';
import passwordIcon from '../assets/CustomerRegister/password_icon.svg';
import rightBackground from '../assets/OwnerRegister/right_background.jpg';

const OwnerRegister = () => {
  const [activeTab, setActiveTab] = useState('OWNER');
  const [tncAccepted, setTncAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-8 px-6 pb-6 font-sans">
      
      {/* Main Card Container */}
      <div className="flex-1 max-w-[1100px] w-full mx-auto bg-white flex shadow-sm overflow-hidden mb-8 rounded-sm">
        
        {/* Left Form Side */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center py-12 px-8 sm:px-12 lg:px-16 overflow-y-auto">
          <div className="w-full max-w-[360px]">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-12">
              <img src={logoIcon} alt="NeoParlour Logo" className="w-10 h-10 object-contain" />
              <span className="text-[26px] font-bold text-gray-900 tracking-tight">NeoParlour</span>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-8 mb-8">
              <button 
                type="button"
                onClick={() => setActiveTab('CUSTOMER')}
                className={`pb-2 text-[11px] font-bold tracking-widest transition-all ${
                  activeTab === 'CUSTOMER' 
                  ? 'text-gray-900 border-b-2 border-[#ff0b01]' 
                  : 'text-gray-300'
                }`}
              >
                CUSTOMER
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('OWNER')}
                className={`pb-2 text-[11px] font-bold tracking-widest transition-all ${
                  activeTab === 'OWNER' 
                  ? 'text-gray-900 border-b-2 border-[#ff0b01]' 
                  : 'text-gray-300'
                }`}
              >
                OWNER
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4">
              
              {/* User Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={usernameIcon} alt="User" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="User Name" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-[#ff0b01] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Email Id */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={emailIcon} alt="Email" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Id" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Mobile Number & Verify */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={mobileIcon} alt="Phone" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  className="w-full pl-12 pr-20 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-5 flex items-center text-[10px] font-bold text-[#ff0b01] hover:text-red-700 transition-colors">
                  Verify
                </button>
              </div>

              {/* Create Salon ID (Unique to Owner Screen) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={usernameIcon} alt="Salon" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="create Salon ID" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
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
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
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
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* BRANCH Divider Line */}
              <div className="pt-4 border-t border-dashed border-gray-300 !mt-6">
                <span className="text-[11px] font-bold text-gray-900 tracking-wider border-b-2 border-[#ff0b01] pb-1 uppercase">
                  BRANCH (If Applicable)
                </span>
              </div>

              {/* Branch Name */}
              <div className="relative !mt-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={usernameIcon} alt="Branch Name" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Branch Name" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-[#ff0b01] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Address */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={usernameIcon} alt="Address" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Address" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Branch Id */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={usernameIcon} alt="Branch Id" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Branch Id" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.15em] text-[10px] rounded-xl transition-colors !mt-6 shadow-md">
                SUBMIT
              </button>
            </form>

            {/* Additional Terms & Options */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-[14px] h-[14px] text-[#ff0b01] border-gray-300 rounded focus:ring-[#ff0b01] accent-[#ff0b01] cursor-pointer" 
                  checked={tncAccepted}
                  onChange={(e) => setTncAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="text-[10px] text-gray-400 cursor-pointer">
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
              {!tncAccepted && (
                <p className="text-[9px] text-red-400 ml-5">* You must accept the Terms & Conditions to register</p>
              )}

              <div className="text-[10px] text-gray-400 pt-1">
                Already have account? <a href="#" className="text-[#ff0b01] font-bold hover:underline">Login</a>
                <span className="mt-1 block">or sign in with</span>
              </div>
            </div>

            {/* Staff Registration Button */}
            <button type="button" className="w-full mt-6 py-[14px] border border-gray-800 hover:bg-gray-50 text-gray-900 font-bold tracking-[0.15em] text-[10px] rounded-xl transition-colors uppercase">
              Register as Staff
            </button>

            {/* Social Authentication */}
            <div className="flex gap-4 mt-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-[11px] font-bold text-gray-800 transition-colors">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
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

        {/* Right Side Image Section */}
        <div className="hidden lg:block lg:w-[55%] relative">
          <img 
            src={rightBackground} 
            alt="Business owner using mobile device" 
            className="w-full h-full object-cover"
          />
          {/* Solid red gradient matching the styling variant at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#cf2a25] via-[#cf2a25]/40 to-transparent opacity-90"></div>
        </div>

      </div>
    </div>
  );
};

export default OwnerRegister;