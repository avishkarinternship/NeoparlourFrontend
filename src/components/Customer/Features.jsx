import React, { useState, useEffect } from 'react';

// Relative path asset declarations from user specifications
import firstImage from '../../assets/Customer/FeaturesScreen/first_image.jpg';
import staffManagement from '../../assets/Customer/FeaturesScreen/staff_management.jpg';
import analyticsReview from '../../assets/Customer/FeaturesScreen/analytics_review.jpg';
import inventoryManagement from '../../assets/Customer/FeaturesScreen/inventory_management.jpg';
import schedulingMadeSimple from '../../assets/Customer/FeaturesScreen/scheduling_made_easy.jpg';
import easyInvoices from '../../assets/Customer/FeaturesScreen/easy_invoice.jpg';
import Drawer from './Drawer';

// Navbar Specific Assets (Adjusted paths to match HomeScreen folder depth)
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import signupIcon from '../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../assets/Customer/Navbar/login_icon.svg';
import offersIcon from '../../assets/Customer/Navbar/offers_icon.svg';

import footerLogoIcon from '../../assets/Owner/logo_icon.svg';

import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerProfile } from '../../redux/slices/customerSlice';
import ProfilePopup from './ProfilePopup';
import PasswordResetModal from './PasswordResetModal';
import Footer from './Layouts/Footer';
import { User, MousePointerClick } from 'lucide-react';

const Features = () => {
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
  const isNameBlank = isIncomplete(profile?.fullName || user?.name || user?.username || '');

  const navLinkClass = (paths) => {
    const isActive = paths.some(p => currentPath === p);
    return `pb-1 transition-colors ${isActive
        ? 'text-orange-500 border-b-2 border-orange-500'
        : 'hover:text-gray-900'
      }`;
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden antialiased">

      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b sticky top-0 z-50 font-sans">
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img src={logoIcon} alt="NeoParlour" className="h-8 object-contain" />
          <span className="text-xl font-black tracking-tight text-gray-900">NeoParlour</span>
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
        <div className="flex items-center gap-3">
          {isAuthenticated && (user || profile) ? (
            <div className="flex items-center gap-2">
              {isNameBlank ? (
                <div className="relative hidden md:flex items-center gap-1.5 sm:gap-2">
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
                    className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FF0B01] hover:bg-[#e60a00] text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer border-0 shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-[#FF0B01] flex items-center justify-center shadow-sm flex-shrink-0">
                      <User className="w-4 h-4 text-[#FF0B01]" />
                    </div>
                    <span className="text-xs font-black text-white tracking-tight px-1.5">
                      My Account
                    </span>
                  </button>
                  <div className="pointer-events-none select-none animate-bounce-x shrink-0">
                    <MousePointerClick className="w-4 h-4 text-[#FF0B01]" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="hidden md:flex items-center gap-2.5 px-3 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-gray-900 rounded-full transition shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer pl-2 pr-4 font-sans"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-black text-gray-800 tracking-tight">
                    {displayName}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Signup Button */}
              <button onClick={() => navigate('/owner/register')} className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition text-gray-500">
                <img src={signupIcon} alt="Signup" className="w-5 h-5 object-contain" />
                SIGNUP
              </button>

              {/* Login Button */}
              <button onClick={() => navigate('/customer/login')} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                <img src={loginIcon} alt="Login" className="w-5 h-5 object-contain" />
                LOGIN
              </button>
            </>
          )}

          {/* Hamburger Menu Icon */}
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

      {/* Slide-out Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onProfileClick={() => setIsProfileOpen(true)}
        onChangePasswordClick={() => setIsPasswordResetOpen(true)}
        setCurrentView={(view) => {
          if (view === 'home') navigate('/customer/home');
          if (view === 'about') navigate('/customer/about');
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


      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Soft background glow accents matching mockup photo visual structural frame */}
        <div className="absolute top-[10%] right-0 w-[55%] h-[80%] bg-gradient-to-bl from-red-100/50 via-orange-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Typography Context Column */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-gray-900 leading-[1.15]">
              Take Control Of Your Day With Advanced <span className="text-[#FF1100]">Scheduling</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl font-medium leading-relaxed">
              Seamlessly Manage Appointments, Set Custom Availability, And Send Automated Reminders Designed For The Beauty And Selfcare Industry
            </p>
            <button 
              onClick={() => navigate("/register")}
              className="h-12 px-6 bg-[#FF1100] hover:bg-red-600 text-white text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-3 group transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-lg shadow-red-500/20 uppercase">
              <span>Get Started Now</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          {/* Hero Video Media Column */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px] aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src={firstImage}
                alt="Take Control of Your Day"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Media Player Toggle Trigger Button Matrix Overlay */}
              <div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-black/15 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-6 h-6 fill-white stroke-none ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3-COLUMN CORE MANAGEMENT GRID ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Supporting Every Business, At Every Stage
          </h2>
          <p className="text-sm text-gray-400 font-semibold max-w-2xl mx-auto leading-relaxed">
            Every Business Has Its Own Needs. Neoparlour Brings Booking, Payments, Teams, Reminders And More Into One Powerful Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Staff Management */}
          <div className="bg-[#F5F6F8] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-[520px]">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">Staff Management</h3>
              <p className="text-xs text-gray-400 font-medium leading-normal">Smart Business Management For Professionals</p>
            </div>
            <div className="mt-6 w-full h-[360px] flex items-end justify-center overflow-hidden">
              <img src={staffManagement} alt="Staff Management Interface" className="w-full h-full object-cover object-top rounded-t-2xl shadow-sm" />
            </div>
          </div>

          {/* Card 2: Analytics Review */}
          <div className="bg-[#F5F6F8] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-[520px]">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">Analytics Review</h3>
              <p className="text-xs text-gray-400 font-medium leading-normal">Spend Less Time Managing And More Time Doing What You Do Best</p>
            </div>
            <div className="mt-6 w-full h-[360px] flex items-end justify-center overflow-hidden">
              <img src={analyticsReview} alt="Analytics Review Interface" className="w-full h-full object-cover object-top rounded-t-2xl shadow-sm" />
            </div>
          </div>

          {/* Card 3: Inventory Management */}
          <div className="bg-[#F5F6F8] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-[520px]">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">Inventory Management</h3>
              <p className="text-xs text-gray-400 font-medium leading-normal">Scale Faster With Customizable Solutions Built For Enterprise</p>
            </div>
            <div className="mt-6 w-full h-[360px] flex items-end justify-center overflow-hidden">
              <img src={inventoryManagement} alt="Inventory Management Interface" className="w-full h-full object-cover object-top rounded-t-2xl shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= DARK SCHEDULING ROW SECTION ================= */}
      <section className="w-full bg-[#520202] relative min-h-[480px] lg:min-h-[560px] flex items-center overflow-hidden">

        {/* Full-bleed background display graphic layer */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={schedulingMadeSimple}
            alt="Scheduling Showcase Background presentation mockups"
            className="w-full h-full object-cover object-center pointer-events-none"
          />
          {/* Ambient tint overlay layer to ensure graphic perfectly unifies color profile matches with image_fb3980.png */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3f0000]/40 via-transparent to-transparent mix-blend-multiply" />
        </div>

        {/* Content Layout Boundary Layer placed directly above image layer */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="max-w-xl flex flex-col items-start text-left space-y-6">
            <h2 className="text-4xl sm:text-[54px] font-black tracking-tight text-white leading-[1.12]">
              Scheduling<br />Made Simple
            </h2>
            <p className="text-sm sm:text-base text-gray-200 font-normal leading-relaxed max-w-md drop-shadow-sm">
              Spend Less Time Managing Your Appointments And More Time Doing What You Love. With Neoparlour, Booking Appointments Is Fast, Flexible, And Totaly Stress-Free.
            </p>
            <button className="h-12 px-6 bg-[#FF1100] hover:bg-red-600 text-white text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-3 group transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-xl shadow-black/40 uppercase">
              <span>Get Started Now</span>
              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center bg-transparent group-hover:translate-x-0.5 transition-transform">
                <svg className="w-2.5 h-2.5 fill-white stroke-none" viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Floating Play Trigger Toggle - Positioned perfectly over the split center inline layout mirror axis */}
        <div className="absolute top-1/2 left-[48%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <button className="w-[72px] h-[72px] rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer">
            <svg className="w-5 h-5 fill-white stroke-none ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </section>

      {/* ================= EASY INVOICES SECTION ================= */}
      <section className="w-full bg-[#F5F6F8] py-20 lg:py-28">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Invoicing Stack Display Framework Graphic (Left) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-start">
              <div className="w-full max-w-[520px] aspect-[4/3] flex items-center justify-center">
                <img
                  src={easyInvoices}
                  alt="Effortless Invoicing Showcase"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Invoicing content block right alignment columns */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <span className="text-base font-extrabold text-[#FF1100] tracking-wide uppercase">
                Easy Invoices
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight leading-tight uppercase">
                Effortless Invoicing For Salons & Spas
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-xl pt-2">
                Handling Invoices Should Be Simple, But Many Salons And Spas Still Struggle With Manual Bills, Wrong Totals, And Messy Payment Tracking. Neoparlour's Software Is Built To Remove That Stress And Make Billing Feel Almost Automatic.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= COMPREHENSIVE BRAND FOOTER MATRIX ================= */}
      {/* 11. FOOTER */}
      <Footer />
    </div>
  );
};

export default Features;