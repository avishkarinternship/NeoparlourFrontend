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
import offersIcon from '../../../assets/Customer/Navbar/offers_icon.svg';
import { Sparkles, MousePointerClick, User, ShoppingCart } from 'lucide-react';
import { fetchCart } from '../../../redux/slices/cartSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
    const dispatch = useDispatch();
    const { user, isAuthenticated, profile } = useSelector((state) => state.customer);

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
                    <span className="text-base sm:text-xl font-black tracking-tight text-gray-900 max-[360px]:hidden">NeoParlour</span>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider text-gray-600">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/home'); }} className={navLinkClass(['/customer/home', '/customer/dashboard', '/'])}>HOME</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/about'); }} className={navLinkClass(['/customer/about', '/about'])}>ABOUT</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/features'); }} className={navLinkClass(['/customer/features', '/features'])}>FEATURES</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/partner-with-us'); }} className={navLinkClass(['/customer/partner-with-us'])}>PARTNER WITH US</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/salons'); }} className={navLinkClass(['/customer/salons'])}>SALONS</a>

                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {isAuthenticated && (user || profile) ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            {isNameBlank ? (
                                <div className="relative flex items-center gap-1.5 sm:gap-2">
                                    {/* Bouncing cursor hand pointing at the button */}
                                    <style>{`
                                        @keyframes bounce-x {
                                            0%, 100% { transform: translateX(0); }
                                            50% { transform: translateX(4px); }
                                        }
                                        .animate-bounce-x {
                                            animation: bounce-x 1s infinite;
                                        }
                                    `}</style>
                                    <button
                                        onClick={() => setIsProfileOpen(true)}
                                        className="relative flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#FF0B01] hover:bg-[#e60a00] text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer border-0 shrink-0"
                                    >
                                        {/* Avatar */}
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#FF0B01] flex items-center justify-center shadow-sm flex-shrink-0">
                                            <User className="w-4 h-4 text-[#FF0B01]" />
                                        </div>
                                        
                                        {/* Button Text */}
                                        <span className="text-xs font-black text-white tracking-tight px-1.5 uppercase sm:normal-case">
                                            My Account
                                        </span>
                                    </button>
                                    <div className="pointer-events-none select-none hidden sm:block animate-bounce-x shrink-0">
                                        <MousePointerClick className="w-4 h-4 text-[#FF0B01]" />
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsProfileOpen(true)} 
                                    className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-gray-900 rounded-full transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer pl-1.5 sm:pl-2 pr-1.5 sm:pr-4 font-sans"
                                >
                                    {/* Circular Logo/Avatar */}
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    {/* User Name */}
                                    <span className="text-xs font-black text-gray-800 tracking-tight hidden sm:inline">
                                        {displayName}
                                    </span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Signup Button */}
                            <button onClick={() => navigate('/register')} className="px-1.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold border border-gray-300 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition text-gray-500">
                                <img src={signupIcon} alt="Signup" className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain" />
                                <span className="hidden sm:inline">SIGNUP</span>
                            </button>
                            
                            {/* Login Button */}
                            <button onClick={() => navigate('/login')} className="px-1.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-1 hover:bg-red-700 transition">
                                <img src={loginIcon} alt="Login" className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain" />
                                <span className="hidden sm:inline">LOGIN</span>
                            </button>
                        </>
                    )}

                    {/* Cart Icon button */}
                    {isAuthenticated && (
                        <button
                            onClick={() => navigate('/customer/cart')}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-[#FF0B01] hover:bg-gray-100 rounded-lg transition relative ml-0.5 sm:ml-1 cursor-pointer shrink-0"
                            title="Shopping Cart"
                        >
                            <ShoppingCart className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#FF0B01] text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Hamburger Menu Icon - Opens the slider directly on screen */}
                    <button 
                        onClick={() => setIsDrawerOpen(true)} 
                        className="p-1.5 sm:p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition ml-0.5 sm:ml-1" 
                        title="Menu"
                    >
                        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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