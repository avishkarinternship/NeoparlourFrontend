import React, { useState } from 'react';
import {
    Scissors,
    Search,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Star,
    Check,
    Plus,
    Menu,
    User,
    Share2
} from 'lucide-react';

// Imported Layout Components using relative paths
import Footer from './Layouts/Footer.jsx';
import BillDetails from './BillDetails.jsx';
import AppointmentBooked from './AppointmentBooked.jsx';

// Local SVG and Image Assets
import hairCutIcon from '../../assets/Customer/BookingScreen/hair_cut.svg';
import hairSpaIcon from '../../assets/Customer/BookingScreen/hair_spa.svg';
import hairStylingIcon from '../../assets/Customer/BookingScreen/hair_styling.svg';
import hairWashIcon from '../../assets/Customer/BookingScreen/hair_wash.svg';
import coloringIcon from '../../assets/Customer/BookingScreen/coloring.svg';
import shavingIcon from '../../assets/Customer/BookingScreen/shaving.svg';
import straighteningIcon from '../../assets/Customer/BookingScreen/straightning.svg';

import appleIcon from '../../assets/Customer/BookingScreen/apple_icon.svg';
import playstoreIcon from '../../assets/Customer/BookingScreen/playstore_icon.svg';

import expertOneImg from '../../assets/Customer/BookingScreen/Expert_One.png';
import expertTwoImg from '../../assets/Customer/BookingScreen/Expert_Two.png';
import expertThreeImg from '../../assets/Customer/BookingScreen/Expert_Three.png';

import openNowTick from '../../assets/Customer/BookingScreen/open_now_tick.svg';
import SearchNavBar from './Layouts/SearchNavBar.jsx';

const Booking = () => {
    // --- STATE ---
    const [selectedCategory, setSelectedCategory] = useState('haircut');
    const [selectedGender, setSelectedGender] = useState('Male');
    const [addedServices, setAddedServices] = useState(['haircut']);
    const [selectedDate, setSelectedDate] = useState(4); // Default to July 4th
    const [selectedTime, setSelectedTime] = useState('12:30 PM');
    const [selectedExpert, setSelectedExpert] = useState('1'); // Default Ashish

    // --- MODAL STATE ---
    const [isBillOpen, setIsBillOpen] = useState(false);
    const [isBookedOpen, setIsBookedOpen] = useState(false);

    // --- MOCK DATA ---
    const categories = [
        { id: 'haircut', name: 'Hair Cut', img: hairCutIcon },
        { id: 'coloring', name: 'Coloring', img: coloringIcon },
        { id: 'hairspa', name: 'Hairspa', img: hairSpaIcon },
        { id: 'hairstyling', name: 'Hair Styling', img: hairStylingIcon },
        { id: 'shaving', name: 'Shaving', img: shavingIcon },
        { id: 'hairwash', name: 'Hair wash', img: hairWashIcon },
        { id: 'straightening', name: 'Straightening', img: straighteningIcon },
    ];

    const servicesList = [
        { id: 'haircut', title: 'HAIR CUT', desc: 'Complete Haircut With Blow Dry Styling', price: 200 },
        { id: 'coloring', title: 'HAIR COLORING', desc: 'Complete Haircut With Blow Dry Styling', price: 200 },
        { id: 'hairspa', title: 'HAIR SPA', desc: 'Complete Haircut With Blow Dry Styling', price: 200 },
    ];

    const calendarDays = [
        { day: 'Mon', num: 1 }, { day: 'Tue', num: 2 }, { day: 'Wed', num: 3 },
        { day: 'Thu', num: 4 }, { day: 'Fri', num: 5 }, { day: 'Sat', num: 6 },
        { day: 'Sun', num: 7 }, { day: 'Mon', num: 8 }, { day: 'Tue', num: 9 },
        { day: 'Wed', num: 10 }, { day: 'Thu', num: 11 }, { day: 'Fri', num: 12 },
        { day: 'Sat', num: 13 }
    ];

    const timeSlots = [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
        '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
        '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
        '10:00 PM', '10:30 PM'
    ];

    const expertsList = [
        { id: '1', name: 'Ashish Chanchlani', role: 'Hair Cut Specialist', price: 200, status: 'Available', img: expertOneImg },
        { id: '2', name: 'Mukesh', role: 'Skin Specialist', price: 200, status: 'Available', img: expertTwoImg },
        { id: '3', name: 'Vandana', role: 'Skin Specialist', price: 200, status: 'Available', img: expertThreeImg },
        { id: '4', name: 'Ashish Chanchlani', role: 'Hair Cut Specialist', price: 200, status: 'Available', img: expertOneImg },
        { id: '5', name: 'Mukesh', role: 'Skin Specialist', price: 200, status: 'Available', img: expertTwoImg },
        { id: '6', name: 'Vandana', role: 'Skin Specialist', price: 200, status: 'Available', img: expertThreeImg },
    ];

    // --- ACTIONS ---
    const handleServiceToggle = (id) => {
        if (addedServices.includes(id)) {
            setAddedServices(addedServices.filter(sid => sid !== id));
        } else {
            setAddedServices([...addedServices, id]);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-gray-800">

            {/* ==================== NAVBAR ==================== */}
            <SearchNavBar />

            {/* ==================== BREADCRUMBS ==================== */}
            <nav className="max-w-7xl mx-auto w-full px-4 py-3 text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="cursor-pointer hover:underline">Search</span>
                <span>&gt;</span>
                <span className="cursor-pointer hover:underline">Salon Description</span>
                <span>&gt;</span>
                <span className="text-gray-700 font-semibold">Select Service</span>
            </nav>

            {/* ==================== MAIN CONTENT ==================== */}
            <main className="max-w-7xl mx-auto w-full px-4 pb-16 flex-1">

                {/* Salon Headline Block */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kirti Salon- Kalyani Nagar</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Kirti Salon- Kalyaninagar</p>
                    </div>
                    <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between">
                        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded text-xs text-gray-700 font-medium">
                            <img src={openNowTick} alt="Open status" className="w-3 h-3 shrink-0" />
                            Open Now | 10:00 AM To 10:00 PM
                            <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-500" />
                        </div>
                        <button type="button" className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-500">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Master Split Grid Setup Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT CONTAINER COMPONENT (2/3 Grid Area) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Category Select Horizontal Slide Strip */}
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Select Services</h3>
                            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                                {categories.map((cat) => {
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`flex flex-col items-center justify-center p-2.5 rounded border min-w-[72px] h-[72px] transition ${isActive
                                                    ? 'border-[#FF0B01] bg-[#FF0B01] text-white shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <img
                                                src={cat.img}
                                                alt={cat.name}
                                                className={`w-6 h-6 object-contain mb-1 ${isActive ? 'invert brightness-0' : ''}`}
                                            />
                                            <span className="text-[9px] font-bold tracking-tight whitespace-nowrap">{cat.name}</span>
                                        </button>
                                    );
                                })}
                                <button type="button" className="flex items-center justify-center p-2 rounded border border-gray-200 bg-white min-w-[36px] h-[72px] hover:bg-gray-50">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            {/* Filter Select Box Row */}
                            <div className="mt-4 w-28">
                                <div className="flex items-center justify-between border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-700 cursor-pointer bg-white">
                                    <span>{selectedGender}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                            </div>
                        </section>

                        {/* Added Target Service List Rendering Stack */}
                        <section className="space-y-3">
                            {servicesList.map((service) => {
                                const isAdded = addedServices.includes(service.id);
                                return (
                                    <div
                                        key={service.id}
                                        className={`flex gap-4 p-4 rounded bg-white border transition ${isAdded ? 'border-[#FF0B01]' : 'border-gray-200'
                                            }`}
                                    >
                                        <div className="w-16 h-16 bg-gray-200 rounded shrink-0" />
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-xs font-bold text-gray-900 tracking-tight">{service.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 truncate">{service.desc}</p>
                                            <p className="text-xs font-extrabold text-gray-900 mt-2">₹{service.price}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => handleServiceToggle(service.id)}
                                                className={`flex items-center justify-center gap-1 px-4 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition w-24 ${isAdded
                                                        ? 'bg-[#FF0B01] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                        <span>Added</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                        <span>Add</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        {/* Comprehensive Booking Calendar Grid Component */}
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Select Date and Time</h3>
                            <div className="bg-white border border-gray-200 rounded p-4">

                                {/* Switch Date Nav Header */}
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 text-xs font-bold tracking-wider text-gray-700">
                                    <span className="uppercase">Date</span>
                                    <div className="flex items-center gap-6">
                                        <span className="flex items-center gap-0.5 cursor-pointer hover:text-red-500"><ChevronLeft className="w-3.5 h-3.5" /> July</span>
                                        <span className="flex items-center gap-0.5 cursor-pointer hover:text-red-500">2026 <ChevronRight className="w-3.5 h-3.5" /></span>
                                    </div>
                                </div>

                                {/* Scroller Days Container Row */}
                                <div className="flex gap-2.5 overflow-x-auto pb-3 border-b border-gray-100 scrollbar-none">
                                    {calendarDays.map((d, idx) => {
                                        const isSelectedDate = selectedDate === d.num;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedDate(d.num)}
                                                className={`flex flex-col items-center justify-center py-2 px-3 rounded min-w-[40px] cursor-pointer transition ${isSelectedDate
                                                        ? 'bg-[#FF0B01] text-white shadow-sm'
                                                        : 'text-gray-400 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-[9px] font-medium mb-1">{d.day}</span>
                                                <span className="text-xs font-bold">{d.num}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Target Hours Blocks Grid Layer */}
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {timeSlots.map((time) => {
                                        const isSelectedTime = selectedTime === time;
                                        return (
                                            <button
                                                type="button"
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-2 rounded border text-center text-[11px] font-bold transition ${isSelectedTime
                                                        ? 'bg-[#FF0B01] border-[#FF0B01] text-white'
                                                        : 'border-gray-200 text-gray-700 bg-white hover:border-gray-400'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Book Checkout Footer Operations Container Banner */}
                        <div className="bg-white border border-gray-200 rounded p-4 text-center">
                            <button
                                type="button"
                                onClick={() => setIsBillOpen(true)}
                                className="w-full bg-[#FF0B01] text-white font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-red-700 transition shadow-sm"
                            >
                                Book and Pay After Services
                            </button>
                            <p className="text-[10px] text-gray-400 mt-3 font-medium">
                                By booking an appointment, you agree to our{' '}
                                <a href="#terms" className="text-[#FF0B01] underline">Terms of Service</a> and{' '}
                                <a href="#privacy" className="text-[#FF0B01] underline">Privacy Policy</a>
                            </p>
                        </div>

                    </div>

                    {/* RIGHT CONTAINER SIDEBAR COMPONENT (1/3 Grid Area) */}
                    <div className="space-y-6">

                        {/* Promo Download App Callout Badge Widget */}
                        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 text-center shadow-sm max-w-xl mx-auto">
                            <h4 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
                                Get Into Neoparlour App Today!
                            </h4>
                            <p className="text-[14px] text-[#555555] font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                                Your All In One Solution For Salons, Spas, And Wellness Now Right In Your Pocket
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                                {/* App Store Badge */}
                                <a
                                    href="#"
                                    className="flex items-center bg-black text-white px-5 py-2 rounded-xl border border-black hover:opacity-90 transition-opacity w-full sm:w-[170px] h-[52px] cursor-pointer select-none"
                                >
                                    <svg className="w-6 h-6 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                                    </svg>
                                    <div className="text-left flex flex-col justify-center">
                                        <span className="text-[9px] uppercase tracking-wider font-medium text-gray-300 leading-none">Get it on</span>
                                        <span className="text-[15px] font-bold font-sans tracking-tight leading-tight mt-0.5">App Store</span>
                                    </div>
                                </a>

                                {/* Google Play Badge */}
                                <a
                                    href="#"
                                    className="flex items-center bg-[#FF0B01] text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-[170px] h-[52px] cursor-pointer select-none"
                                >
                                    <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L19.5,12.13L5.27,3.27L17.87,11.33M5.27,20.73L19.5,11.87L17.87,12.67L5.27,20.73M18.87,12.67L21,11.6L22,12L21,12.4L18.87,12.67Z" />
                                    </svg>
                                    <div className="text-left flex flex-col justify-center">
                                        <span className="text-[9px] uppercase tracking-wider font-medium text-red-100 leading-none">Get it on</span>
                                        <span className="text-[15px] font-bold font-sans tracking-tight leading-tight mt-0.5">Google Play</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Experts Stack Module Selection Frame */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Select Expert</h3>
                            <div className="space-y-2.5">
                                {expertsList.map((expert) => {
                                    const isSelectedExp = selectedExpert === expert.id;
                                    return (
                                        <div
                                            key={expert.id}
                                            className={`flex gap-3 p-2.5 rounded bg-white border transition ${isSelectedExp ? 'border-[#FF0B01]' : 'border-gray-200'
                                                }`}
                                        >
                                            {/* Left Side: Avatar Panel Overlay Container */}
                                            <div className="w-[68px] h-20 rounded overflow-hidden bg-gray-100 relative shrink-0">
                                                <img src={expert.img} alt={expert.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-600/90 to-red-600/10 p-1 pt-3">
                                                    <p className="text-[9px] text-white font-bold leading-tight truncate">{expert.name.split(' ')[0]}</p>
                                                    <p className="text-[7px] text-red-100 leading-none mt-0.5 truncate">{expert.role.split(' ')[0]}</p>
                                                </div>
                                            </div>

                                            {/* Center Side: Profile Info Stack */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h4 className="text-xs font-bold text-gray-900 truncate">{expert.name}</h4>
                                                        <span className="text-[8px] font-bold text-green-600 flex items-center gap-0.5 shrink-0">
                                                            <img src={openNowTick} alt="Available tick" className="w-2 h-2" />
                                                            {expert.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{expert.role}</p>
                                                    <p className="text-xs font-extrabold text-gray-900 mt-1">₹{expert.price}</p>
                                                </div>
                                                {/* Static Reviews Rating Rendering */}
                                                <div className="flex items-center text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right Side: Select Button Trigger Frame */}
                                            <div className="flex items-center pl-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedExpert(expert.id)}
                                                    className={`flex items-center justify-center gap-0.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition w-20 ${isSelectedExp
                                                            ? 'bg-[#FF0B01] text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {isSelectedExp ? (
                                                        <>
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                            <span>Added</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-3 h-3 stroke-[3]" />
                                                            <span>Add</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* ==================== FOOTER ==================== */}
            <Footer />

            {/* ==================== BILL DETAILS MODAL ==================== */}
            <BillDetails
                isOpen={isBillOpen}
                onClose={() => setIsBillOpen(false)}
                onConfirm={() => {
                    setIsBillOpen(false);
                    setIsBookedOpen(true);
                }}
            />

            {/* ==================== APPOINTMENT BOOKED MODAL ==================== */}
            <AppointmentBooked
                isOpen={isBookedOpen}
                onClose={() => setIsBookedOpen(false)}
            />

        </div>
    );
};

export default Booking;

