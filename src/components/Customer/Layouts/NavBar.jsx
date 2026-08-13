import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerProfile } from '../../../redux/slices/customerSlice';
import Drawer from '../Drawer'; // Drawer.jsx lives in Customer/, not Customer/Layouts/
import ProfilePopup from '../ProfilePopup';
import PasswordResetModal from '../PasswordResetModal';
import logoIcon from '../../../assets/Neoparlour_logo.png'; 
import signupIcon from '../../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../../assets/Customer/Navbar/login_icon.svg';
import { Sparkles, MousePointerClick, User, ShoppingCart, Sun, Moon } from 'lucide-react';
import { fetchCart } from '../../../redux/slices/cartSlice';
import { useDarkMode } from '../../../context/DarkModeContext';
import { LanguageSwitcher } from '../../LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
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

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const { cart } = useSelector((state) => state.cart);
    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [isAuthenticated, dispatch]);

    const navLinkClass = (paths) => {
        const isActive = paths.some(p => currentPath === p);
        return `pb-1 transition-colors ${
            isActive
                ? 'text-orange-500 border-b-2 border-orange-500'
                : isDark ? 'text-gray-300 hover:text-white' : 'hover:text-gray-900'
        }`;
    };

    return (
        <>
            <nav className={`flex items-center justify-between px-3 sm:px-6 md:px-12 py-3 sm:py-4 border-b sticky top-0 z-50 font-sans transition-all duration-500 ease-out transform ${
                mounted ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            } ${isDark ? 'bg-black border-gray-700' : 'bg-white border-gray-200'}`}>
                
                {/* Logo Section */}
                <div onClick={() => navigate('/customer/home')} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0">
                    <img src={logoIcon} alt="NeoParlour" className="h-7 sm:h-8 object-contain" />
                    <span className={`text-base sm:text-xl font-black tracking-tight max-[360px]:hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>NeoParlour</span>
                </div>

                {/* Desktop Navigation Links */}
                <div className={`hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/home'); }} className={navLinkClass(['/customer/home', '/customer/dashboard', '/'])}>{t('navbar.home', 'HOME')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/about'); }} className={navLinkClass(['/customer/about', '/about'])}>{t('navbar.about', 'ABOUT')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/features'); }} className={navLinkClass(['/customer/features', '/features'])}>{t('navbar.features', 'FEATURES')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/partner-with-us'); }} className={navLinkClass(['/customer/partner-with-us'])}>{t('navbar.partner', 'PARTNER WITH US')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/salons'); }} className={navLinkClass(['/customer/salons'])}>{t('navbar.salons', 'SALONS')}</a>

                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">

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
                            {isDark
                                ? <Sun className="w-3 h-3 text-yellow-800" />
                                : <Moon className="w-3 h-3 text-gray-500" />
                            }
                        </span>
                    </button>

                    {isAuthenticated && (user || profile) ? (
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            {!isCompleted ? (
                                <div className="relative flex items-center gap-1.5 sm:gap-2">
                                    <button
                                        onClick={() => setIsDrawerOpen(true)}
                                        className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border-0 shrink-0 p-0 bg-transparent"
                                        title={`Profile is ${(completion * 100).toFixed(0)}% complete. Click to open menu.`}
                                    >
                                        {/* Progress Ring SVG */}
                                        <svg className="absolute w-10 h-10 sm:w-11 sm:h-11 -rotate-90" viewBox="0 0 36 36">
                                            {/* Background Track Circle */}
                                            <circle
                                                stroke="#E2E8F0"
                                                strokeWidth="3"
                                                fill="transparent"
                                                r="15"
                                                cx="18"
                                                cy="18"
                                            />
                                            {/* Active Progress Circle */}
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
                                    className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-200 hover:bg-red-50 rounded-full transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer pl-1.5 sm:pl-2 pr-1.5 sm:pr-4 font-sans ${isDark ? 'bg-gray-800 text-white' : 'bg-red-50/50 text-gray-900'}`}
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

export default Navbar;