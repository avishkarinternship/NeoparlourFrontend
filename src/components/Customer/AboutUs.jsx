import React from 'react';
import {
    Scissors,
    Search,
    CheckCircle,
    Calendar,
    Sliders,
    CreditCard,
    Headphones,
    ArrowRight,
    Smartphone,
    User,
    Store,
    XCircle,
    Menu
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Navbar Specific Assets (Adjusted paths to match HomeScreen folder depth)
import logoIcon from '../../assets/CustomerRegister/logo_icon.svg';
import signupIcon from '../../assets/Customer/Navbar/signup_icon.svg';
import loginIcon from '../../assets/Customer/Navbar/login_icon.svg';
import offersIcon from '../../assets/Customer/Navbar/offers_icon.svg';

import footerLogoIcon from '../../assets/Owner/logo_icon.svg';
import Footer from '../Customer/Layouts/Footer';

import ourStoryImage from '../../assets/Customer/AboutUs/our_story.jpg';
// Add these to your imports
import verifiedIcon from '../../assets/Customer/AboutUs/verified_salon.svg';
import bookingIcon from '../../assets/Customer/AboutUs/real_time_booking.svg';
import managementIcon from '../../assets/Customer/AboutUs/smart_management.svg';
import paymentIcon from '../../assets/Customer/AboutUs/secure_payment.svg';
import supportIcon from '../../assets/Customer/AboutUs/247_support.svg';

const AboutUs = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const navLinkClass = (paths) => {
        const isActive = paths.some(p => currentPath === p);
        return `pb-1 transition-colors ${isActive
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'hover:text-gray-900'
            }`;
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-red-500 selection:text-white">

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
                    <button onClick={() => navigate('/login')} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                        <img src={loginIcon} alt="Login" className="w-5 h-5 object-contain" />
                        LOGIN
                    </button>

                    {/* Hamburger Menu Icon */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition ml-1"
                        title="Settings"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </nav>


            {/* 2. HERO SECTION */}
            <section id="home" className="relative overflow-hidden bg-gradient-to-b from-red-50/30 to-white py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12">

                        {/* Left Content Column */}
                        <div className="space-y-6 lg:col-span-7">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                                Redefining Beauty <br />
                                <span className="text-gray-900">Through Technology</span>
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
                                NeoParlour Connects Customers With Trusted Salons And Empowers Salon Owners To Grow Their Business Effortlessly.
                            </p>
                            <div className="pt-2">
                                <button className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-200">
                                    <span>LIST YOUR SALON</span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-500 font-bold text-sm">+</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Media Column */}
                        <div className="relative lg:col-span-5">
                            {/* Floating Abstract Scissors & Hairdryer effects can be implied here */}
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-gray-200">
                                <div className="aspect-[4/3] bg-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
                                        alt="Professional Salon Experience"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                {/* Overlay Floating Card */}
                                <div className="absolute bottom-6 right-6 rounded-2xl bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
                                    <p className="text-2xl font-extrabold text-red-500">10K+ Salons</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-0.5">Trust NeoParlour</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. THE PROBLEM WE SOLVE */}
            <section className="bg-gray-50/50 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Problem We Solve</h2>
                        <p className="mx-w-2xl mx-auto mt-3 text-sm text-gray-400">
                            We Understand The Challenges Faced By Both Customers And Salon Owner.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-2">
                        {/* For Customers */}
                        <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-100 flex gap-6 items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="space-y-4 w-full">
                                <h3 className="text-lg font-bold text-gray-700">For Customer</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Hard To Find Trusted And Verified Salons.",
                                        "No Clarity On Pricing And Availability.",
                                        "Long Waiting Times And Poor Experience."
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-gray-800">
                                            <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* For Owners */}
                        <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-100 flex gap-6 items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                                <Store className="h-6 w-6" />
                            </div>
                            <div className="space-y-4 w-full">
                                <h3 className="text-lg font-bold text-gray-700">For Owner</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Irregular Bookings And Empty Slots.",
                                        "No-Shows & Last Minute Cancellation.",
                                        "Lack Of Tools To Manage And Grow Activities."
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-gray-800">
                                            <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. OUR SOLUTION / HOW IT WORKS */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Solution</h2>
                        <p className="mx-w-2xl mx-auto mt-2 text-sm text-gray-400">
                            Simple Steps For A Better Salon Experience And Business Growth.
                        </p>
                        <h3 className="mt-6 text-xl font-bold tracking-tight text-gray-900">How It Works</h3>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-center gap-12 lg:flex-row lg:gap-8">

                        {/* Steps For Customer */}
                        <div className="w-full max-w-sm space-y-6">
                            <h4 className="text-center lg:text-left text-lg font-bold text-gray-900 mb-4">For Customer</h4>
                            {[
                                { step: "1", title: "Search", desc: "Search Salon, Services And Expert" },
                                { step: "2", title: "Choose", desc: "Search The Best Salon For You" },
                                { step: "3", title: "Book", desc: "Pick Date, Time & Book Instantly" },
                                { step: "4", title: "Visit", desc: "Get Your Service And Enjoy" },
                                { step: "5", title: "Review", desc: "Share Your Experience And Review" },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                                        {item.step}
                                    </span>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">{item.title}</h5>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Central Creative Graphic */}
                        <div className="relative flex h-64 w-64 shrink-0 items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-red-300"></div>

                            {/* Badge 1 */}
                            <div className="absolute -left-2 top-1/3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow">
                                <Store className="h-4 w-4" />
                            </div>

                            {/* Badge 2 */}
                            <div className="absolute -right-2 bottom-1/3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow">
                                <Scissors className="h-4 w-4 -rotate-45" />
                            </div>

                            {/* Central Portrait Container */}
                            <div className="h-48 w-48 overflow-hidden rounded-full bg-gray-100 border-4 border-white shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
                                    alt="User Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Steps For Salon Owners */}
                        <div className="w-full max-w-sm space-y-6">
                            <h4 className="text-center lg:text-left text-lg font-bold text-gray-900 mb-4">For Salon Owners</h4>
                            {[
                                { step: "1", title: "Register", desc: "List Your Salon On Neoparlour" },
                                { step: "2", title: "Manage", desc: "Manage Staff, Services & Slots" },
                                { step: "3", title: "Get Bookings", desc: "Receive Real-Time Bookings" },
                                { step: "4", title: "Engage", desc: "Build Customer Relationships" },
                                { step: "5", title: "Grow", desc: "Increase Revenue And Scale Fast" },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4 lg:flex-row">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                                        {item.step}
                                    </span>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">{item.title}</h5>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            <hr className="border-gray-100 max-w-7xl mx-auto" />

            {/* 5. WHY CHOOSE NEOPARLOUR */}
            <section id="features" className="py-16 lg:py-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ... Header remains the same ... */}

                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                            { icon: verifiedIcon, title: "Verified Salons", desc: "All Salons Are Verified For Your Safety" },
                            { icon: bookingIcon, title: "Real-Time Bookings", desc: "Instant Booking With Live Availability" },
                            { icon: managementIcon, title: "Smart Management", desc: "Powerful Tools For Salon Owners" },
                            { icon: paymentIcon, title: "Secure Payments", desc: "Safe And Secure Transactions" },
                            { icon: supportIcon, title: "24/7 Support", desc: "We're Here To Help You Anytime" },
                        ].map((feature, idx) => (
                            <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 ring-4 ring-gray-50/50">
                                    {/* Render as an <img> tag */}
                                    <img src={feature.icon} alt={feature.title} className="h-6 w-6 object-contain" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900">{feature.title}</h4>
                                <p className="mt-2 text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. OUR STORY */}
            <section id="about" className="bg-gray-50/60 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">

                        {/* Visual Analytics UI Showcase */}
                        <div className="w-full flex justify-center lg:justify-start">
                            <div className="w-full max-w-[560px] aspect-[4/3] overflow-hidden rounded-3xl shadow-xl bg-gray-100">
                                <img
                                    src={ourStoryImage}
                                    alt="Built with passion to empower the beauty industry mockup display"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Story text */}
                        <div className="space-y-5">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-500">our story</span>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                BUILT WITH PASSION TO <br />EMPOWER THE BEAUTY INDUSTRY
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-500">
                                neoparlour was born with a simple idea - to make salon booking effortless for customer and growth simple for salon owners.
                            </p>
                            <p className="text-sm font-semibold leading-relaxed text-gray-700">
                                today, we are india's leading salon growth platform, trusted by thousands of salons and loved by millions of customers
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* 7. TESTIMONIALS */}
            <section className="py-16 lg:py-24 bg-white overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-4">
                        <span className="h-px w-12 bg-gray-200"></span>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Testimonials</h2>
                        <span className="h-px w-12 bg-gray-200"></span>
                    </div>

                    {/* Testimonial Cards Layout */}
                    <div className="relative mt-12">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="rounded-2xl bg-gray-50 p-6 flex flex-col justify-between ring-1 ring-gray-100">
                                    <div>
                                        {/* Stars */}
                                        <div className="flex gap-1 text-amber-400">
                                            {"★".repeat(5).split("").map((star, i) => (
                                                <span key={i} className="text-lg">{star}</span>
                                            ))}
                                        </div>
                                        <h4 className="mt-4 text-sm font-bold text-gray-900">The Best Booking System</h4>
                                        <p className="mt-3 text-xs leading-relaxed text-gray-500">
                                            Great Experience, Easy To Book, Paying For Treatments Is So Convenient - No Cash Or Cards Needed!
                                        </p>
                                    </div>

                                    {/* Profile Block */}
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Avishkar profile" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-900">Avishkar</h5>
                                            <p className="text-[10px] text-gray-400">Pune, Maharashtra</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Next arrow slide action mock */}
                        <button className="absolute -right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 hover:bg-gray-50">
                            <ArrowRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 8. FOOTER */}
            <Footer />

        </div>
    );
}
export default AboutUs;