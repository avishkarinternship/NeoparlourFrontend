import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerProfile } from '../../../redux/slices/customerSlice';
import Drawer from '../Drawer'; // Drawer.jsx lives in Customer/, not Customer/Layouts/
import ProfilePopup from '../ProfilePopup';
import PasswordResetModal from '../PasswordResetModal';
import logoIcon from '../../../assets/CustomerRegister/logo_icon.svg'; 
import signupIcon from '../../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../../assets/Customer/Navbar/login_icon.svg';
import offersIcon from '../../../assets/Customer/Navbar/offers_icon.svg';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
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

    const navLinkClass = (paths) => {
        const isActive = paths.some(p => currentPath === p);
        return `pb-1 transition-colors ${
            isActive
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'hover:text-gray-900'
        }`;
    };

    return (
        <>
            <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b sticky top-0 z-50 font-sans">
                
                {/* Logo Section */}
                <div onClick={() => navigate('/customer/home')} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0">
                    <img src={logoIcon} alt="NeoParlour" className="h-7 sm:h-8 object-contain" />
                    <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900">NeoParlour</span>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider text-gray-600">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/home'); }} className={navLinkClass(['/customer/home', '/customer/dashboard', '/'])}>HOME</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/about'); }} className={navLinkClass(['/customer/about', '/about'])}>ABOUT</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/features'); }} className={navLinkClass(['/customer/features', '/features'])}>FEATURES</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/partner-with-us'); }} className={navLinkClass(['/customer/partner-with-us'])}>PARTNER WITH US</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/salons'); }} className={navLinkClass(['/customer/salons'])}>SALONS</a>
                    <a href="#" className="hover:text-gray-900 transition-colors flex items-center gap-1">
                        OFFERS
                        <img src={offersIcon} alt="Offers" className="w-4 h-4 object-contain" />
                    </a>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
                            {/* Signup Button */}
                            <button onClick={() => navigate('/register')} className="px-2 sm:px-4 py-2 text-xs font-bold border border-gray-300 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition text-gray-500">
                                <img src={signupIcon} alt="Signup" className="w-5 h-5 object-contain" />
                                <span className="hidden sm:inline">SIGNUP</span>
                            </button>
                            
                            {/* Login Button */}
                            <button onClick={() => navigate('/login')} className="px-2 sm:px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-1.5 hover:bg-red-700 transition">
                                <img src={loginIcon} alt="Login" className="w-5 h-5 object-contain" />
                                <span className="hidden sm:inline">LOGIN</span>
                            </button>
                        </>
                    )}

                    {/* Hamburger Menu Icon - Opens the slider directly on screen */}
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
            </nav>

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
        </>
    );
};

export default Navbar;