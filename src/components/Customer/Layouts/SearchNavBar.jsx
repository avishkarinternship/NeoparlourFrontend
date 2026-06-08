import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerProfile } from '../../../redux/slices/customerSlice';
import { Search, MapPin, ChevronDown, Calendar, UserPlus, LogIn } from 'lucide-react';
import Drawer from '../Drawer'; // Adjust path based on your file structure
import ProfilePopup from '../ProfilePopup';
import PasswordResetModal from '../PasswordResetModal';

const SearchNavBar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, profile } = useSelector((state) => state.customer);

  useEffect(() => {
      if (isAuthenticated && user && !profile) {
          const customerId = user.id || user.user?.id;
          if (customerId) {
              dispatch(fetchCustomerProfile(customerId));
          }
      }
  }, [isAuthenticated, user, profile, dispatch]);

  return (
    <header className="w-full border-b border-[#E8E8E8] px-4 md:px-12 py-4 flex items-center justify-between bg-white sticky top-0 z-50 shadow-sm">
      {/* Brand Vector Identity Block */}
      <div className="flex items-center space-x-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/customer/home')}>
        <div className="text-[#EF3E23] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M50.8159 0.709961C51.5247 5.9279 50.2046 10.2438 46.635 13.6787C42.6288 17.5384 38.4736 21.2409 34.4058 25.0377C33.8973 25.5096 33.6303 25.5411 33.1526 25.0167C31.9918 23.7423 30.8002 22.4994 29.5573 21.3143C28.9769 20.7584 29.0797 20.4699 29.619 19.9822C36.0392 14.1665 42.4388 8.32455 48.8435 2.4878C49.4393 1.94765 50.0352 1.41793 50.821 0.71521L50.8159 0.709961Z" fill="#878787"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M45.0678 28.0037C41.2002 25.6019 36.5264 25.6071 32.7513 27.9932C25.3244 20.4993 17.9181 12.995 10.5272 5.46437C8.79117 3.6866 7.13224 1.83021 5.43217 0C5.16509 0.298917 5.08808 0.340875 5.07781 0.398561C4.24062 5.39624 4.98529 9.97435 8.60628 13.7344C10.5015 15.701 12.479 17.5889 14.4101 19.5187C17.0347 22.1303 19.6593 24.7419 22.2839 27.3535C25.2423 30.6783 27.9747 33.7461 30.8201 36.9398C31.1642 36.085 31.3697 35.4819 31.6368 34.9155C33.5783 30.8513 38.4268 29.1418 42.4124 31.1031C45.2989 32.5243 47.1582 35.5921 46.9065 38.791C46.6446 42.1577 44.9343 44.6225 41.7961 45.8391C38.5655 47.0872 35.5146 46.4737 33.1519 43.9145C29.0327 39.457 25.0934 34.8265 21.0256 30.3165C18.3702 27.364 14.9802 25.927 11.0305 26.2994C5.66839 26.8081 1.59038 30.458 0.337159 35.571C-0.859562 40.4533 1.19996 45.6871 5.39619 48.4141C9.84409 51.3088 15.119 51.1304 19.4847 47.7794C20.5839 46.9299 21.3132 46.7569 22.0374 48.0103C22.0374 48.3207 26.3312 50.5694 29.3512 50.2285C26.1463 46.6048 23.1724 43.2486 20.0959 39.7612C19.7518 40.637 19.5514 41.2558 19.2741 42.1031C17.3531 45.7657 12.8847 47.4386 8.87851 45.7447C5.05208 44.1243 3.09517 39.6668 4.47165 35.6917C6.44907 29.9442 13.8144 28.4233 18.0209 32.9909C22.0887 37.4013 25.946 42.0057 29.9984 46.4318C33.229 50.9611 37.2917 51.1881 41.9348 49.9924C46.7679 48.7496 50.3323 44.7326 50.8356 39.9499C51.3749 34.8159 49.4746 30.7359 45.0729 28.0037H45.0678ZM27.1375 28.6645C26.362 28.7432 25.6121 27.9776 25.5915 27.1647C25.5813 26.3729 26.3208 25.6176 27.0964 25.6281C27.8874 25.6386 28.6424 26.399 28.5757 27.1909C28.5038 28.0666 27.9799 28.5806 27.1375 28.6645Z" fill="#EF3E23"/>
          </svg>
        </div>
        <span className="text-lg sm:text-[24px] font-bold tracking-tight text-[#242424]">NeoParlour</span>
      </div>

      {/* Global Hub Navigation Search & Filter Bar Group */}
      <div className="hidden lg:flex items-center border border-[#909090] rounded-lg overflow-hidden max-w-2xl w-full mx-6 bg-white h-[46px] shadow-sm">
        <div className="flex items-center flex-1 px-3 border-r border-gray-200">
          <Search className="w-4 h-4 text-[#8D8D8D] mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search near by salon" 
            className="w-full text-[13px] outline-none text-[#8D8D8D] placeholder-[#8D8D8D]"
          />
        </div>
        
        <div className="flex items-center px-4 border-r border-gray-200 cursor-pointer h-full hover:bg-gray-50 transition-colors">
          <MapPin className="w-4 h-4 text-[#8D8D8D] mr-2 flex-shrink-0" />
          <span className="text-[13px] text-[#8D8D8D] font-medium mr-1.5">Location</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8D8D8D]" />
        </div>

        <div className="flex items-center px-4 cursor-pointer h-full hover:bg-gray-50 transition-colors mr-1">
          <Calendar className="w-4 h-4 text-[#8D8D8D] mr-2 flex-shrink-0" />
          <span className="text-[13px] text-[#8D8D8D] font-medium mr-1.5">Date</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8D8D8D]" />
        </div>

        <button className="bg-[#FF0B01] text-white text-[13px] font-bold tracking-widest px-6 h-full transition-opacity hover:opacity-90 uppercase flex-shrink-0">
          Search
        </button>
      </div>

      {/* Session Profiles / Control Triggers Block */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {isAuthenticated && (user || profile) ? (
          <button 
              onClick={() => setIsProfileOpen(true)} 
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-gray-900 rounded-full transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer pl-2 pr-4 font-sans"
          >
              {/* Circular Logo/Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                  {((profile?.fullName || user?.name || user?.username || 'P').charAt(0)).toUpperCase()}
              </div>
              {/* User Name */}
              <span className="text-xs font-black text-gray-800 tracking-tight">
                  {profile?.fullName || user?.name || user?.username || 'Profile'}
              </span>
          </button>
        ) : (
          <>
            <button 
              onClick={() => navigate('/register')}
              className="flex items-center space-x-1 sm:space-x-2 border border-[#909090] rounded-lg px-2 sm:px-4 py-2 text-[#909090] hover:bg-gray-50 transition-colors text-[13px] font-semibold uppercase"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Signup</span>
            </button>
            
            <button 
              onClick={() => navigate('/customer/login')}
              className="flex items-center space-x-1 sm:space-x-2 bg-[#FF0B01] border border-[#909090] rounded-lg px-2 sm:px-4 py-2 text-white hover:opacity-95 transition-opacity text-[13px] font-semibold uppercase"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          </>
        )}

        {/* Hamburger Menu Icon - Visible across all screens */}
        <button 
          onClick={() => setIsDrawerOpen(true)} 
          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition ml-1" 
          title="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Slide-out Panel Overlay */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onProfileClick={() => setIsProfileOpen(true)}
        onChangePasswordClick={() => setIsPasswordResetOpen(true)}
        setCurrentView={(view) => {
          if (view === 'about') navigate('/customer/about');
          if (view === 'home') navigate('/customer/home');
        }} 
      />

      {/* Customer Profile Popup Modal */}
      <ProfilePopup 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
      />

      {/* Password Reset Modal */}
      <PasswordResetModal 
          isOpen={isPasswordResetOpen} 
          onClose={() => setIsPasswordResetOpen(false)} 
      />
    </header>
  );
};

export default SearchNavBar;