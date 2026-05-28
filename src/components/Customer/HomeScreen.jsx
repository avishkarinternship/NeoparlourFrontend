import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


// Navbar Specific Assets (Adjusted paths to match HomeScreen folder depth)
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import signupIcon from '../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../assets/Customer/Navbar/login_icon.svg';
import offersIcon from '../../assets/Customer/Navbar/offers_icon.svg';

// 2. Fixed Asset Imports (Step back twice '../../' to escape 'components/Customer')
import salonIcon from '../../assets/Customer/HomeScreen/salon_icon.svg';
import reviewIcon from '../../assets/Customer/HomeScreen/review_icon.svg';
import citiesIcon from '../../assets/Customer/HomeScreen/cities_icon.svg';
import appDownloadIcon from '../../assets/Customer/HomeScreen/app_download_icon.svg';
import salonOneIcon from '../../assets/Customer/HomeScreen/Recommended/salon_one.jpg';
import salonTwoIcon from '../../assets/Customer/HomeScreen/Recommended/salon_two.jpg';
import salonThreeIcon from '../../assets/Customer/HomeScreen/Recommended/salon_three.jpg';
import salonFourIcon from '../../assets/Customer/HomeScreen/Recommended/salon_four.jpg';


// Main Screen Form Elements Icons
import searchIcon from '../../assets/Customer/HomeScreen/MainScreen/search_icon.svg';
import locationIcon from '../../assets/Customer/HomeScreen/MainScreen/location_icon.svg';
// import dateIcon from '../../assets/Customer/HomeScreen/MainScreen/date_icon.svg';
import dropdownIcon from '../../assets/Customer/HomeScreen/MainScreen/dropdown_icon.svg';

// Newly Added Main Screen Background & Graphic Assets
import backgroundImg from '../../assets/Customer/HomeScreen/MainScreen/background_img.png';
import exploreMoreIcon from '../../assets/Customer/HomeScreen/MainScreen/explore_more.svg';

// 3. New Services Images Imports
import salonImg from '../../assets/Customer/HomeScreen/Services/salon.jpg';
import wellnessImg from '../../assets/Customer/HomeScreen/Services/wellness.jpg';
import nailLashesImg from '../../assets/Customer/HomeScreen/Services/nail_lashes.png';
import spaImg from '../../assets/Customer/HomeScreen/Services/spa.jpg';
import nailSalonImg from '../../assets/Customer/HomeScreen/Services/nail_salon.jpg';
import skinClinicImg from '../../assets/Customer/HomeScreen/Services/skin_clinic.png';

// 4. Salon Growth Section Image Imports
import manageInventoryImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/manage_inventory.png';
import easyAppointmentImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/easy_appointment.jpg';
import leadMagnetImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/lead_magnet.png';
import aiPoweredFeatureImg from '../../assets/Customer/HomeScreen/SalonGrowthSection/ai_powered_feature.png';

// 5. Partners Section Image Imports
import oliviaImg from '../../assets/Customer/HomeScreen/Partners/olivia_img.png';
import kapilImg from '../../assets/Customer/HomeScreen/Partners/kapil_img.png';
import natulasImg from '../../assets/Customer/HomeScreen/Partners/natulas_img.png';
import mariaImg from '../../assets/Customer/HomeScreen/Partners/maria_img.png';
import toniaguyImg from '../../assets/Customer/HomeScreen/Partners/toniaguy_img.png';
import vlccImg from '../../assets/Customer/HomeScreen/Partners/vlcc_img.png';
import biguineImg from '../../assets/Customer/HomeScreen/Partners/biguine_img.png';

// 6. Review Section Background SVG Imports
import reviewImgOne from '../../assets/Customer/HomeScreen/Review/img_one.svg';
import reviewImgTwo from '../../assets/Customer/HomeScreen/Review/img_two.svg';
import reviewImgThree from '../../assets/Customer/HomeScreen/Review/img_three.svg';
import reviewImgFour from '../../assets/Customer/HomeScreen/Review/img_four.svg';
import reviewImgFive from '../../assets/Customer/HomeScreen/Review/img_five.svg';
import reviewImgSix from '../../assets/Customer/HomeScreen/Review/img_six.svg';

// 7. Review Section Text-Inline Sub SVGs
import subOneImg from '../../assets/Customer/HomeScreen/Review/sub_one_img.svg';
import subTwoImg from '../../assets/Customer/HomeScreen/Review/sub_two_img.svg';
import subThreeImg from '../../assets/Customer/HomeScreen/Review/sub_three_img.svg';
import subFourImg from '../../assets/Customer/HomeScreen/Review/sub_four_img.svg';
import subFiveImg from '../../assets/Customer/HomeScreen/Review/sub_five_img.svg';
import subSixImg from '../../assets/Customer/HomeScreen/Review/sub_six_img.svg';

//footer
import footerLogoIcon from '../../assets/Owner/logo_icon.svg';

import Drawer from './Drawer';
import Marquee from 'react-fast-marquee';

const partners = [
    { src: oliviaImg, alt: "Olivia" },
    { src: kapilImg, alt: "Kapil's" },
    { src: natulasImg, alt: "Naturals" },
    { src: mariaImg, alt: "Marie Claire" },
    { src: toniaguyImg, alt: "Toni & Guy" },
    { src: vlccImg, alt: "VLCC" },
    { src: biguineImg, alt: "Jean-Claude Biguine" },
];

const HomeScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [activeFaq, setActiveFaq] = useState(null);

    const navLinkClass = (paths) => {
        const isActive = paths.some(p => currentPath === p);
        return `pb-1 transition-colors ${isActive
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'hover:text-gray-900'
            }`;
    };

    const recommendedSalons = [
        { name: "Enrich Salon", location: "Mukund Nagar", img: salonOneIcon, rating: "4.6" },
        { name: "Habibs Salon", location: "Kothrud", img: salonTwoIcon, rating: "4.8" },
        { name: "Bodycraft", location: "Viman Nagar", img: salonThreeIcon, rating: "4.5" },
        { name: "Lakme Salon", location: "Aundh", img: salonFourIcon, rating: "4.7" },
    ];

    const servicesData = [
        { name: 'Salon', img: salonImg },
        { name: 'Wellness & Spa', img: wellnessImg },
        { name: 'Nail & Lashes', img: nailLashesImg },
        { name: 'Spa', img: spaImg },
        { name: 'Nail Salon', img: nailSalonImg },
        { name: 'Skin Clinic', img: skinClinicImg },
    ];

    const faqData = [
        {
            q: "What is NeoParlour?",
            a: "NeoParlour is your complete beauty ecosystem designed to bring premium salon discovery, inventory optimization, and direct appointment management into one simple platform."
        },
        {
            q: "Is NeoParlour free to use?",
            a: "Listing your basic salon profile and exploring local beauty businesses is completely free. We also offer premium growth tools for inventory and staff optimization."
        },
        {
            q: "Who can use NeoParlour?",
            a: "Both beauty customers looking to book appointments and salon owners managing operations can seamlessly use our unified ecosystem."
        },
        {
            q: "How does the appointment system work?",
            a: "Customers pick a service, preferred date, and localized time window. The appointment updates the salon calendar automatically in real time."
        },
        {
            q: "How does inventory management help my salon?",
            a: "It maps stock levels against actual product consumption during services, alerting you before critical items drop below operational limits."
        }
    ];

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentView, setCurrentView] = useState('home');

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

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
                    <button onClick={() => navigate('/customer/login')} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                        <img src={loginIcon} alt="Login" className="w-5 h-5 object-contain" />
                        LOGIN
                    </button>

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

            {/* 2. Place your standalone Drawer component here */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                setCurrentView={setCurrentView}
            />

            {/* 2. HERO SECTION - WITH ONE BACKGROUND IMAGE */}
            <section className="relative min-h-[540px] w-full flex items-center justify-center py-20 px-6 text-center overflow-visible bg-[#F3F4F6]">
                <img
                    src={backgroundImg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
                />
                <div className="absolute inset-0 bg-white/5 pointer-events-none z-10"></div>

                <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center pb-6">
                    <div className="text-gray-900 text-sm md:text-base font-black uppercase tracking-wider mb-4">
                        List your salon free
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 tracking-tight leading-tight">
                        Everything For <span className="text-[#FF2A14]">Salon</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-600 mb-10 font-medium text-sm md:text-base leading-relaxed">
                        Not Just A Salon Platform, Your Complete Beauty Ecosystem. Explore Services, Manage Appointments, And Unlock Exclusive Deals, All Under One Roof.
                    </p>

                    <div className="w-full max-w-4xl bg-white p-2.5 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] flex flex-col md:flex-row items-center gap-2 border border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-2 w-full md:border-r border-gray-200">
                            <img src={searchIcon} alt="Search" className="w-5 h-5 object-contain flex-shrink-0" />
                            <input type="text" placeholder="SELECT CITY" className="w-full outline-none text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent" />
                        </div>

                        <div className="flex items-center justify-between px-4 py-2 w-full md:border-r border-gray-200 gap-2">
                            <div className="flex items-center gap-3 w-full">
                                <img src={locationIcon} alt="Location" className="w-5 h-5 object-contain flex-shrink-0" />
                                <input type="text" placeholder="SELECT AREA" className="w-full outline-none text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent" />
                            </div>
                            <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60" />
                        </div>

                        {/* <div className="flex items-center justify-between px-4 py-2 w-full gap-2">
                            <div className="flex items-center gap-3 w-full">
                                <img src={dateIcon} alt="Date" className="w-5 h-5 object-contain flex-shrink-0" />
                                <input type="text" placeholder="Date" className="w-full outline-none text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent" />
                            </div>
                            <img src={dropdownIcon} alt="Select" className="w-4 h-4 object-contain cursor-pointer opacity-60" />
                        </div> */}

                        <button className="w-full md:w-auto bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-3.5 rounded-xl font-bold text-sm tracking-widest shadow-md hover:shadow-lg transition-all duration-150 flex-shrink-0">
                            SEARCH
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-30 cursor-pointer hover:scale-105 transition-transform duration-200 select-none">
                    <img src={exploreMoreIcon} alt="Explore Now" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
                </div>
            </section>

            {/* 3. FIXED STATS SECTION */}
            <section className="pt-16 pb-12 border-b">
                <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-4 px-6">
                    {[
                        { label: "REVIEWS", value: "1.14k", img: reviewIcon },
                        { label: "SALONS", value: "10k", img: salonIcon },
                        { label: "CITIES", value: "20k", img: citiesIcon },
                        { label: "APP DOWNLOAD", value: "20000+", img: appDownloadIcon }
                    ].map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-left">
                            <img src={stat.img} alt={stat.label} className="w-12 h-12 object-contain" />
                            <div className="flex flex-col">
                                <div className="text-xl md:text-2xl font-black text-gray-800 leading-tight">{stat.value}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. RECOMMENDED SECTION */}
            <section className="pt-12 pb-6 px-6 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Recommended</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendedSalons.map((salon, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition cursor-pointer group">
                            <div className="h-48 relative overflow-hidden">
                                <img src={salon.img} alt={salon.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    ⭐ {salon.rating}
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <h4 className="font-bold text-gray-800">{salon.name}</h4>
                                <p className="text-xs text-gray-500">{salon.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. SERVICES GRID */}
            <section className="pt-6 pb-12 px-6 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {servicesData.map((service) => (
                        <div key={service.name} className="relative h-64 rounded-2xl overflow-hidden group bg-gray-100">
                            <img src={service.img} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                            <div className="absolute bottom-6 left-6 text-white text-xl font-bold z-10">{service.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. GROWTH SECTIONS */}
            <section className="py-20 bg-[#F9FAFB]">
                <div className="max-w-7xl mx-auto px-6 space-y-28">
                    {/* Feature 1 - Manage Inventory & Staff */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left Container for Staff & Dashboard Composite Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={manageInventoryImg}
                                    alt="Manage Inventory & Staff"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Right Content Container matching layout and typography hierarchy */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                MANAGE INVENTORY & STAFF
                            </h2>

                            {/* Sub-heading with Red Accent on 'maximize' and 'profit.' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Control your stock. <br />
                                <span className="text-[#FF2A14]">maximize</span> your <span className="text-[#FF2A14]">profit.</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Never run out of essentials or overstock products again. Track usage, get
                                low-stock alerts, and manage everything from a single dashboard
                                whether it's shampoos, colors, or retail products.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Left-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-start">
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Real-Time Stock Tracking Across Services & Products</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Smart Low-Stock Alerts Before You Run Out</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Product Usage Insights Per Service</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Reduce Wastage & Increase Margins</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                MANAGE SMARTER →
                            </button>
                        </div>
                    </div>

                    {/* Feature 2 - Easy Appointments */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Right Container for Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={easyAppointmentImg}
                                    alt="Easy Appointments"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Left Content Container styled exactly to the right-aligned design layout */}
                        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                EASY APPOINTMENTS
                            </h2>

                            {/* Sub-heading with Red Accent on 'calendar,' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Fill your <span className="text-[#FF2A14]">calendar,</span> <br />
                                <span className="text-gray-400">not your waiting area</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Let your customers book instantly, anytime. No calls, no confusion just
                                smooth, automated scheduling that keeps your chairs occupied all day.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Right-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-end">
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Real-Time Stock Tracking Across Services & Products</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Smart Low-Stock Alerts Before You Run Out</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Product Usage Insights Per Service</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Reduce Wastage & Increase Margins</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                START BOOKING →
                            </button>
                        </div>
                    </div>

                    {/* Feature 3 - NeoParlour Lead Magnet */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left Container for Product Dashboard Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={leadMagnetImg}
                                    alt="NeoParlour Lead Magnet"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Right Content Container matching layout and typography hierarchy */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                NEOPARLOUR LEAD MAGNET
                            </h2>

                            {/* Sub-heading with Red Accent on 'paying clients' */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Turn searches into <br />
                                <span className="text-[#FF2A14]">paying clients.</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Get discovered by people actively looking for salon services near them.
                                NeoParlour brings high-intent customers directly to your business.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Left-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-start">
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Appear In Local Search Results Instantly</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Get Verified Leads, Not Random Traffic</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Boost Visibility Without Extra Marketing Cost</span>
                                </li>
                                <li className="flex items-center justify-start gap-3 text-sm text-gray-800 font-semibold">
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                    <span>Convert Walk-Ins Into Loyal Customers</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                GET MORE CLIENTS →
                            </button>
                        </div>
                    </div>

                    {/* Feature 4 - AI Powered Features */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16 max-w-7xl mx-auto px-4 py-12">
                        {/* Left/Right Container for Image */}
                        <div className="flex-1 w-full">
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <img
                                    src={aiPoweredFeatureImg}
                                    alt="AI Powered Feature"
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        </div>

                        {/* Content Container styled exactly to the design layout */}
                        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right w-full">
                            {/* Main Section Header */}
                            <h2 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-wide mb-2">
                                AI POWERED FEATURES
                            </h2>

                            {/* Sub-heading with Red Accent */}
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-400 leading-tight mb-4">
                                Smarter Decisions. <br />
                                <span className="text-gray-500">Higher </span>
                                <span className="text-[#FF2A14]">Revenue.</span>
                            </h3>

                            {/* Paragraph Description */}
                            <p className="text-sm md:text-base text-gray-800 font-medium max-w-md mb-8 leading-relaxed">
                                Leverage AI to understand customer behavior, predict demand, and automate growth so you focus on service while we handle intelligence.
                            </p>

                            {/* Key Points Header */}
                            <h4 className="text-gray-900 text-lg font-bold mb-4">Key Points</h4>

                            {/* Bullet Points with Right-Aligned Red Circle Checks */}
                            <ul className="space-y-4 mb-8 w-full flex flex-col items-center md:items-end">
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>AI-Driven Customer Insights & Preferences</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Smart Pricing & Offer Recommendations</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Predict Peak Hours & Optimize Staff</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                                <li className="flex items-center justify-end gap-3 text-sm text-gray-800 font-semibold">
                                    <span>Automated Marketing Suggestions</span>
                                    <span className="bg-[#FF2A14] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                                </li>
                            </ul>

                            {/* CTA Button */}
                            <button className="bg-[#FF2A14] hover:bg-[#E01E0A] text-white px-10 py-4 rounded-xl font-extrabold text-xs tracking-widest transition-all duration-150 shadow-md uppercase flex items-center gap-2">
                                UNLOCK AI GROWTH →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PARTNERS SECTION - UPDATED INFINITE MARQUEE WITH 3 ROW LOOPS */}
            <section className="py-16 bg-white border-b border-gray-100 overflow-hidden select-none">
                <div className="w-full text-center">
                    <h2 className="text-gray-400 font-bold text-sm tracking-[0.3em] uppercase mb-10 px-6">
                        Partners
                    </h2>

                    <div className="flex flex-col gap-10">
                        {/* First Row - Left to Right */}
                        <Marquee
                            speed={40}
                            gradient={false}
                            pauseOnHover={true}
                        >
                            {partners.map((partner, idx) => (
                                <img
                                    key={idx}
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="h-8 sm:h-10 mx-10 object-contain opacity-75 hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </Marquee>

                        {/* Second Row - Right to Left */}
                        <Marquee
                            speed={35}
                            direction="right"
                            gradient={false}
                            pauseOnHover={true}
                        >
                            {partners.map((partner, idx) => (
                                <img
                                    key={idx}
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="h-8 sm:h-10 mx-10 object-contain opacity-75 hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </Marquee>

                        {/* Third Row - Left to Right (optional) */}
                        <Marquee
                            speed={45}
                            gradient={false}
                            pauseOnHover={true}
                        >
                            {partners.map((partner, idx) => (
                                <img
                                    key={idx}
                                    src={partner.src}
                                    alt={partner.alt}
                                    className="h-8 sm:h-10 mx-10 object-contain opacity-75 hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </Marquee>
                    </div>
                </div>
            </section>

            {/* 8. REVIEWS & STATS GRAPHIC BANNER */}
            <section className="relative py-24 bg-[#EAEAEA] overflow-hidden flex items-center justify-center min-h-[340px]">

                {/* Floating Decorative SVG Assets Layer */}
                <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
                    <img src={reviewImgOne} alt="" className="absolute top-10 left-[10%] w-12 h-12 object-contain opacity-90 animate-pulse" />
                    <img src={reviewImgTwo} alt="" className="absolute top-1/4 right-[15%] w-10 h-10 object-contain opacity-90" />
                    <img src={reviewImgThree} alt="" className="absolute bottom-12 left-[18%] w-14 h-14 object-contain opacity-90" />
                    <img src={reviewImgFour} alt="" className="absolute top-12 left-[45%] w-8 h-8 object-contain opacity-40" />
                    <img src={reviewImgFive} alt="" className="absolute bottom-6 left-[50%] w-10 h-10 object-contain opacity-90" />
                    <img src={reviewImgSix} alt="" className="absolute bottom-14 right-[12%] w-14 h-14 object-contain opacity-90" />
                </div>

                {/* Central Statistics Typographic Content Layer with explicit block flex bounds for sub images */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col justify-center items-center select-none w-full">

                    {/* Reviews Headline Block with Sub 1 & Sub 2 */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 w-full">
                        <img src={subOneImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                        <div className="text-gray-400 font-extrabold text-xl md:text-2xl tracking-[0.25em] uppercase whitespace-nowrap">
                            1.14k Reviews
                        </div>
                        <img src={subTwoImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                    </div>

                    {/* Salons Headline Block with Sub 3 & Sub 4 */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 my-2 w-full">
                        <img src={subThreeImg} alt="" className="w-8 h-8 sm:w-12 sm:h-12 min-w-[32px] min-h-[32px] sm:min-w-[48px] sm:min-h-[48px] object-contain block" />
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none whitespace-nowrap">
                            <span className="text-[#FF2A14]">10K</span> SALONS
                        </h2>
                        <img src={subFourImg} alt="" className="w-8 h-8 sm:w-12 sm:h-12 min-w-[32px] min-h-[32px] sm:min-w-[48px] sm:min-h-[48px] object-contain block" />
                    </div>

                    {/* Cities Headline Block with Sub 5 & Sub 6 */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 w-full">
                        <img src={subFiveImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                        <div className="text-gray-400 font-extrabold text-xl md:text-2xl tracking-[0.25em] uppercase whitespace-nowrap">
                            20k Cities
                        </div>
                        <img src={subSixImg} alt="" className="w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px] object-contain block" />
                    </div>
                </div>
            </section>

            {/* 9. FAQ SECTION */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <h2 className="text-center text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqData.map((item, i) => (
                        <div key={i} className="border-b border-gray-100 pb-4">
                            <div
                                onClick={() => toggleFaq(i)}
                                className="flex items-center justify-between p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100/70 transition-all"
                            >
                                <span className="font-bold text-gray-700">{i + 1}. {item.q}</span>
                                <span className={`text-gray-400 text-2xl font-light transform transition-transform duration-200 ${activeFaq === i ? 'rotate-45' : ''}`}>+</span>
                            </div>
                            {activeFaq === i && (
                                <div className="p-6 bg-white text-sm text-gray-500 leading-relaxed transition-all">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 10. TESTIMONIALS */}
            <section className="py-16 px-6 bg-white overflow-hidden">
                <h2 className="text-center text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Testimonials</h2>
                <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="min-w-[300px] bg-gray-50 p-8 rounded-2xl snap-start">
                            <div className="text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
                            <h4 className="font-black text-lg mb-4 italic">The Best Booking System</h4>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                Great Experience, Easy To Book, Paying For Treatments Is So Convenient - No Cash Or Cards Needed!
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                                <div>
                                    <div className="font-bold">Avishkar</div>
                                    <div className="text-[10px] text-gray-400">Pune, Maharashtra</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 11. FOOTER */}
            {/* 11. FOOTER */}
            <footer className="bg-[#EAEAEA] text-gray-900 pt-16 pb-8 px-6 md:px-12 font-sans w-full mt-auto">
                {/* Main Footer Container */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 items-start">

                    {/* Identity Column */}
                    <div className="md:col-span-4 flex items-center space-x-2.5">
                        <img
                            src={footerLogoIcon}
                            alt="NeoParlour Logo"
                            className="w-8 h-8 object-contain flex-shrink-0"
                        />
                        <span className="text-xl font-black text-gray-900 tracking-tight">
                            NeoParlour
                        </span>
                    </div>

                    {/* Column 1: Company Info */}
                    <div className="md:col-span-2">
                        <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Company</h4>
                        <ul className="space-y-3 text-sm font-semibold text-gray-700">
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Influencer Program</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">
                                • Careers
                            </li>
                            <li onClick={() => setCurrentView('about')} className="cursor-pointer hover:text-gray-900 transition-colors">
                                • About Us
                            </li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Partner With Us</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Buy Gift Card</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Blogs</li>
                        </ul>
                    </div>

                    {/* Column 2: Legal */}
                    <div className="md:col-span-2">
                        <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Legal</h4>
                        <ul className="space-y-3 text-sm font-semibold text-gray-700">
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Privacy Policy</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Terms Of Service</li>
                        </ul>
                    </div>

                    {/* Column 3: Contact/Socials Links */}
                    <div className="md:col-span-2">
                        <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Contact</h4>
                        <ul className="space-y-3 text-sm font-semibold text-gray-700">
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Whatsapp</li>
                            <li className="cursor-pointer hover:text-gray-900 transition-colors">• Emails</li>
                        </ul>
                    </div>

                    {/* App Download Store Badges */}
                    <div className="md:col-span-2 flex flex-col gap-3 w-full sm:max-w-48 justify-self-start md:justify-self-end">
                        {/* App Store */}
                        <a href="#" className="bg-black hover:bg-neutral-900 text-white rounded-xl py-2 px-4 flex items-center gap-3 shadow transition">
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400">Get it on</span>
                                <span className="text-sm font-bold tracking-tight">App Store</span>
                            </div>
                        </a>

                        {/* Google Play */}
                        <a href="#" className="bg-[#FF190D] hover:bg-red-700 text-white rounded-xl py-2 px-4 flex items-center gap-3 shadow transition">
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.25 3.062c-.156.172-.25.438-.25.781v16.313c0 .344.094.609.25.781l.063.063 9.125-9.125v-.125L5.313 3l-.063.063zM16.656 14.5l3.188-1.813c.906-.516.906-1.359 0-1.875L16.656 9.5l-2.188 2.188v.125l2.188 2.188zM14.469 11.812L5.438 3.125c-.141-.125-.344-.141-.531-.047l9.563 9.563v-.828zM14.469 12.188l-9.563 9.563c.188.094.391.078.531-.047l9.031-8.688v-.828z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-red-200">Get it on</span>
                                <span className="text-sm font-bold tracking-tight">Google Play</span>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Bottom Sub-Footer Separator */}
                <hr className="border-gray-400/60 my-8 max-w-7xl mx-auto" />

                {/* Copyright and Social Media Icons */}
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        copyright@neopaceinfotech.com
                    </span>

                    <div className="flex items-center gap-4">
                        {/* Instagram */}
                        <a href="#" className="p-1 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white hover:opacity-90 transition shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="#" className="text-[#1877F2] hover:opacity-80 transition">
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomeScreen;