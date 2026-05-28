import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Drawer from '../Drawer'; // Drawer.jsx lives in Customer/, not Customer/Layouts/
import logoIcon from '../../../assets/CustomerRegister/logo_icon.svg'; 
import signupIcon from '../../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../../assets/Customer/Navbar/login_icon.svg';
import offersIcon from '../../../assets/Customer/Navbar/offers_icon.svg';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
                <div onClick={() => navigate('/customer/home')} className="flex items-center gap-2 cursor-pointer">
                    <img src={logoIcon} alt="NeoParlour" className="h-8 object-contain" />
                    <span className="text-xl font-black tracking-tight text-gray-900">NeoParlour</span>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider text-gray-600">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/home'); }} className={navLinkClass(['/customer/home', '/customer/dashboard', '/'])}>HOME</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/about'); }} className={navLinkClass(['/customer/about', '/about'])}>ABOUT</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer/features'); }} className={navLinkClass(['/customer/features', '/features'])}>FEATURES</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">PARTNER WITH US</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">GIFTCARD</a>
                    <a href="#" className="hover:text-gray-900 transition-colors flex items-center gap-1">
                        OFFERS
                        <img src={offersIcon} alt="Offers" className="w-4 h-4 object-contain" />
                    </a>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {/* Signup Button */}
                    <button onClick={() => navigate('/register')} className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition text-gray-500">
                        <img src={signupIcon} alt="Signup" className="w-5 h-5 object-contain" />
                        SIGNUP
                    </button>
                    
                    {/* Login Button */}
                    <button onClick={() => navigate('/login')} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                        <img src={loginIcon} alt="Login" className="w-5 h-5 object-contain" />
                        LOGIN
                    </button>

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

            {/* Slide-out Panel Overlay */}
            <Drawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                setCurrentView={(view) => {
                    if (view === 'about') navigate('/about');
                    if (view === 'home') navigate('/customer/home');
                }} 
            />
        </>
    );
};

export default Navbar;