import React, { useState } from 'react';

// Assets (Ensure these paths match your project structure)
import logoIcon from '../assets/CustomerRegister/logo_icon.svg';
import mobileIcon from '../assets/CustomerRegister/mobile_icon.svg'; 
import passwordIcon from '../assets/CustomerRegister/password_icon.svg';
import rightBackground from '../assets/OwnerLogin/right_background.jpg';

const OwnerLogin = () => {
  // Initializing state to 'OWNER' as per image_95615a.jpg
  const [activeTab, setActiveTab] = useState('OWNER');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-8 px-6 pb-6 font-sans">
      
      {/* Main Card Container */}
      <div className="flex-1 max-w-[1100px] w-full mx-auto bg-white flex shadow-sm overflow-hidden mb-8 rounded-sm">
        
        {/* Left Form Side */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center py-12 px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-[360px]">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-12">
              <img src={logoIcon} alt="NeoParlour Logo" className="w-10 h-10 object-contain" />
              <span className="text-[26px] font-bold text-gray-900 tracking-tight">NeoParlour</span>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-10 mb-8">
              <button 
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

            {/* Login Form */}
            <form className="space-y-4">
              {/* Salon ID / Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <img src={mobileIcon} alt="Icon" className="w-[18px] h-[18px] opacity-40" />
                </div>
                <input 
                  type="text" 
                  placeholder="Salon ID or Email" 
                  className="w-full pl-12 pr-4 py-[14px] bg-[#fafafa] border border-[#ff0b01] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#ff0b01] transition-colors placeholder-gray-400" 
                />
              </div>

              {/* Password Input */}
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

              {/* Submit Button */}
              <button type="submit" className="w-full py-4 bg-[#ff0b01] hover:bg-red-700 text-white font-bold tracking-[0.15em] text-[10px] rounded-xl transition-colors mt-2 shadow-md">
                LOGIN
              </button>
            </form>

            {/* Remember Me & Links */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-[14px] h-[14px] text-[#ff0b01] border-gray-300 rounded focus:ring-[#ff0b01] accent-[#ff0b01] cursor-pointer" 
                  defaultChecked
                />
                <label htmlFor="remember" className="text-[10px] text-gray-400 cursor-pointer">
                  Remember me next time
                </label>
              </div>
              
              <div className="text-[10px] space-y-1">
                <a href="#" className="text-[#ff0b01] font-medium block">Forgot Password?</a>
                <p className="text-gray-400">
                  Don't have account? <a href="#" className="text-[#ff0b01] font-bold hover:underline">Register</a>
                </p>
                <p className="text-gray-400">or Login with</p>
              </div>
            </div>

            {/* Staff Registration Button */}
            <button type="button" className="w-full mt-6 py-[14px] border border-gray-800 hover:bg-gray-50 text-gray-900 font-bold tracking-[0.15em] text-[10px] rounded-xl transition-colors uppercase">
              Login as Staff
            </button>

            {/* Social Login Section */}
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

        {/* Right Image Side */}
        <div className="hidden lg:block lg:w-[55%] relative">
          <img 
            src={rightBackground} 
            alt="Professional at work" 
            className="w-full h-full object-cover"
          />
          {/* Red gradient overlay at the bottom matching image_95615a.jpg */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#cf2a25] via-[#cf2a25]/40 to-transparent opacity-90"></div>
        </div>

      </div>
    </div>
  );
};

export default OwnerLogin;