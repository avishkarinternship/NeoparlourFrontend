import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerProfile } from '../../../redux/slices/customerSlice';
import { Search, MapPin, ChevronDown, Calendar, UserPlus, LogIn, MousePointerClick, User, ShoppingCart, Sun, Moon } from 'lucide-react';
import { fetchCart } from '../../../redux/slices/cartSlice';
import Drawer from '../Drawer';
import ProfilePopup from '../ProfilePopup';
import PasswordResetModal from '../PasswordResetModal';
import { useDarkMode } from '../../../context/DarkModeContext';
import LanguageSwitcher from '../../LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const SearchNavBar = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
      setMounted(true);
  }, []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, profile } = useSelector((state) => state.customer);
  const { isDark, toggleDark } = useDarkMode();

  const isIncomplete = (name) => {
      const t = (name || '').trim();
      return !t || t.toLowerCase() === 'customer';
  };

  const getDisplayName = () => {
      const rawName = profile?.fullName || user?.name || user?.username || '';
      if (isIncomplete(rawName)) {
          return profile?.mobile || user?.phone || user?.username || 'Profile';
      }
      return rawName;
  };

  const displayName = getDisplayName();
  const displayInitial = ((displayName.startsWith('+') ? displayName.slice(1) : displayName).charAt(0) || 'P').toUpperCase();
  const isNameBlank = isIncomplete(profile?.fullName || user?.name || user?.username || '');

  const getProfileCompletion = () => {
      let filled = 0;
      const name = (profile?.fullName || user?.name || user?.username || '').trim();
      if (name && name.toLowerCase() !== 'customer' && !name.startsWith('+')) filled++;
      
      const phone = (profile?.mobile || user?.mobile || user?.phone || '').trim();
      if (phone) filled++;
      
      const mail = (profile?.email || user?.email || '').trim();
      if (mail) filled++;
      
      const gen = (profile?.gender || '').trim();
      if (gen && gen.toUpperCase() !== 'SELECT GENDER') filled++;
      
      const addr = (profile?.address || '').trim();
      if (addr) filled++;
      
      return filled / 5;
  };

  const completion = getProfileCompletion();
  const isCompleted = completion === 1;

  useEffect(() => {
      if (isAuthenticated && user && !profile) {
          const customerId = user.id || user.user?.id;
          if (customerId) {
              dispatch(fetchCustomerProfile(customerId));
          }
      }
  }, [isAuthenticated, user, profile, dispatch]);

  const { cart } = useSelector((state) => state.cart);
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
      if (isAuthenticated) {
          dispatch(fetchCart());
      }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <header className={`w-full border-b px-3 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm font-sans transition-all duration-500 ease-out transform ${
        mounted ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
    } ${isDark ? 'bg-black border-gray-700' : 'bg-white border-[#E8E8E8]'}`}>

      {/* Brand Vector Identity Block */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
        <div className="text-[#EF3E23] flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M50.8159 0.709961C51.5247 5.9279 50.2046 10.2438 46.635 13.6787C42.6288 17.5384 38.4736 21.2409 34.4058 25.0377C33.8973 25.5096 33.6303 25.5411 33.1526 25.0167C31.9918 23.7423 30.8002 22.4994 29.5573 21.3143C28.9769 20.7584 29.0797 20.4699 29.619 19.9822C36.0392 14.1665 42.4388 8.32455 48.8435 2.4878C49.4393 1.94765 50.0352 1.41793 50.821 0.71521L50.8159 0.709961Z" fill="#878787"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M45.0678 28.0037C41.2002 25.6019 36.5264 25.6071 32.7513 27.9932C25.3244 20.4993 17.9181 12.995 10.5272 5.46437C8.79117 3.6866 7.13224 1.83021 5.43217 0C5.16509 0.298917 5.08808 0.340875 5.07781 0.398561C4.24062 5.39624 4.98529 9.97435 8.60628 13.7344C10.5015 15.701 12.479 17.5889 14.4101 19.5187C17.0347 22.1303 19.6593 24.7419 22.2839 27.3535C25.2423 30.6783 27.9747 33.7461 30.8201 36.9398C31.1642 36.085 31.3697 35.4819 31.6368 34.9155C33.5783 30.8513 38.4268 29.1418 42.4124 31.1031C45.2989 32.5243 47.1582 35.5921 46.9065 38.791C46.6446 42.1577 44.9343 44.6225 41.7961 45.8391C38.5655 47.0872 35.5146 46.4737 33.1519 43.9145C29.0327 39.457 25.0934 34.8265 21.0256 30.3165C18.3702 27.364 14.9802 25.927 11.0305 26.2994C5.66839 26.8081 1.59038 30.458 0.337159 35.571C-0.859562 40.4533 1.19996 45.6871 5.39619 48.4141C9.84409 51.3088 15.119 51.1304 19.4847 47.7794C20.5839 46.9299 21.3132 46.7569 22.0374 48.0103C22.0374 48.3207 26.3312 50.5694 29.3512 50.2285C26.1463 46.6048 23.1724 43.2486 20.0959 39.7612C19.7518 40.637 19.5514 41.2558 19.2741 42.1031C17.3531 45.7657 12.8847 47.4386 8.87851 45.7447C5.05208 44.1243 3.09517 39.6668 4.47165 35.6917C6.44907 29.9442 13.8144 28.4233 18.0209 32.9909C22.0887 37.4013 25.946 42.0057 29.9984 46.4318C33.229 50.9611 37.2917 51.1881 41.9348 49.9924C46.7679 48.7496 50.3323 44.7326 50.8356 39.9499C51.3749 34.8159 49.4746 30.7359 45.0729 28.0037H45.0678ZM27.1375 28.6645C26.362 28.7432 25.6121 27.9776 25.5915 27.1647C25.5813 26.3729 26.3208 25.6176 27.0964 25.6281C27.8874 25.6386 28.6424 26.399 28.5757 27.1909C28.5038 28.0666 27.9799 28.5806 27.1375 28.6645Z" fill="#EF3E23"/>
          </svg>
        </div>
        <span className={`text-base sm:text-[24px] font-bold tracking-tight max-[360px]:hidden ${isDark ? 'text-white' : 'text-[#242424]'}`}>NeoParlour</span>
      </div>

      {/* Global Hub Navigation Search & Filter Bar Group */}
      <div className={`flex items-center border rounded-lg overflow-hidden max-w-[140px] xs:max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-2xl w-full mx-1.5 sm:mx-4 h-[38px] sm:h-[46px] shadow-sm transition-all duration-300 ${isDark ? 'border-gray-600 bg-gray-900' : 'border-[#909090] bg-white'}`}>
        <div className="flex items-center flex-1 px-2 sm:px-3 lg:border-r border-gray-200 min-w-0">
          <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`} />
          <input 
            type="text" 
            placeholder={t('navbar.search_placeholder', 'Search...')} 
            className={`w-full text-xs sm:text-[13px] outline-none placeholder-[#8D8D8D] bg-transparent ${isDark ? 'text-gray-200' : 'text-[#8D8D8D]'}`}
          />
        </div>
        
        <div className={`hidden lg:flex items-center px-4 border-r cursor-pointer h-full transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-400 hover:bg-gray-50'}`}>
          <MapPin className={`w-4 h-4 mr-2 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`} />
          <span className={`text-[13px] font-medium mr-1.5 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`}>{t('navbar.location', 'Location')}</span>
          <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`} />
        </div>

        <div className={`hidden lg:flex items-center px-4 cursor-pointer h-full transition-colors mr-1 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
          <Calendar className={`w-4 h-4 mr-2 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`} />
          <span className={`text-[13px] font-medium mr-1.5 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`}>{t('navbar.date', 'Date')}</span>
          <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-[#8D8D8D]'}`} />
        </div>

        <button className="bg-[#FF0B01] text-white text-[11px] sm:text-[13px] font-bold tracking-widest px-3 sm:px-6 h-full transition-opacity hover:opacity-90 uppercase flex-shrink-0 flex items-center justify-center">
          <span className="hidden sm:inline">{t('buttons.search', 'SEARCH')}</span>
          <Search className="w-3.5 h-3.5 sm:hidden" />
        </button>
      </div>

      {/* Session Profiles / Control Triggers Block */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          data-tooltip={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`relative w-11 h-6 sm:w-13 sm:h-6.5 md:w-14 md:h-7 rounded-full flex items-center transition-colors duration-300 focus:outline-none flex-shrink-0 cursor-pointer border-0 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}
          aria-label="Toggle dark mode"
        >
          <span className={`absolute left-0.5 transition-all duration-300 flex items-center justify-center w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full shadow-md ${
            isDark
              ? 'translate-x-5 sm:translate-x-6 md:translate-x-7 bg-yellow-400'
              : 'translate-x-0 bg-white'
          }`}>
            <Sun className={`absolute w-3 h-3 text-yellow-800 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
            }`} />
            <Moon className={`absolute w-3 h-3 text-gray-500 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
            }`} />
          </span>
        </button>

        {isAuthenticated && (user || profile) ? (
          <div className="flex items-center gap-2 sm:gap-3">
              {!isCompleted ? (
                  <div className="relative flex items-center gap-1.5 sm:gap-2">
                      <button
                          onClick={() => setIsDrawerOpen(true)}
                          className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border-0 shrink-0 p-0 bg-transparent"
                          title={`Profile is ${(completion * 100).toFixed(0)}% complete. Click to open menu.`}
                      >
                          {/* Progress Ring SVG */}
                          <svg className="absolute w-10 h-10 sm:w-11 sm:h-11 -rotate-90" viewBox="0 0 36 36">
                              <circle stroke="#E2E8F0" strokeWidth="3" fill="transparent" r="15" cx="18" cy="18" />
                              <circle
                                  stroke="#FF0B01"
                                  strokeWidth="3"
                                  strokeDasharray="94.25"
                                  strokeDashoffset={94.25 - (completion * 94.25)}
                                  strokeLinecap="round"
                                  fill="transparent"
                                  r="15"
                                  cx="18"
                                  cy="18"
                                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                              />
                          </svg>

                          {/* Avatar inside */}
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm relative z-10 ${isDark ? 'bg-gray-700' : 'bg-slate-100'} text-[#FF0B01]`}>
                              <User className="w-4 h-4 text-[#FF0B01]" />
                          </div>
                      </button>
                      
                      {/* Bouncing cursor hand pointing at the button across all screen sizes */}
                      <style>{`
                          @keyframes bounce-x {
                              0%, 100% { transform: translateX(0); }
                              50% { transform: translateX(4px); }
                          }
                          .animate-bounce-x {
                              animation: bounce-x 1s infinite;
                          }
                      `}</style>
                      <div className="pointer-events-none select-none flex items-center gap-1 animate-bounce-x shrink-0">
                          <MousePointerClick className="w-4 h-4 text-[#FF0B01]" />
                      </div>
                  </div>
              ) : (
                  <button 
                      onClick={() => setIsDrawerOpen(true)} 
                      className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-200 hover:bg-red-50 rounded-full transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer pl-1.5 sm:pl-2 pr-1.5 sm:pr-4 font-sans ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-red-50/50 text-gray-900'}`}
                  >
                      {/* Circular Logo/Avatar */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                      </div>
                      {/* User Name */}
                      <span className={`text-xs font-black tracking-tight hidden sm:inline ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {displayName}
                      </span>
                  </button>
              )}
          </div>
        ) : (
          /* Hamburger Menu Icon for Guest Users */
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(true)} 
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95 ${
                isDark 
                    ? 'bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200 hover:border-slate-300'
            }`}
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        )}
      </div>

      </header>

      {/* Slide-out Panel Overlay */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onProfileClick={() => setIsProfileOpen(true)}
        onChangePasswordClick={() => setIsPasswordResetOpen(true)}
        setCurrentView={(view) => {
          if (view === 'about') navigate('/about');
          if (view === 'home') navigate('/');
        }} 
      />

      {/* Customer Profile Popup Modal */}
      <ProfilePopup 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          onChangePasswordClick={() => {
              setIsProfileOpen(false);
              setIsPasswordResetOpen(true);
          }}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal 
          isOpen={isPasswordResetOpen} 
          onClose={() => setIsPasswordResetOpen(false)} 
      />
    </>
  );
};

export default SearchNavBar;


