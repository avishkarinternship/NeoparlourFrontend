import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Layouts/NavBar';
import CustomerFooter from './Layouts/Footer';
import partnerUs1 from '../../assets/HomePage/Partner/partner_us_1.png';
import partnerUs2 from '../../assets/HomePage/Partner/partner_us_2.png';
import partnerUs3 from '../../assets/HomePage/Partner/partner_us_3.png';
import { 
    Star, 
    Home, 
    MapPin, 
    Download, 
    Play, 
    ArrowUpRight, 
    Plus, 
    Minus, 
    Sparkles, 
    MessageCircle, 
    Store,
    ArrowRight
} from 'lucide-react';

const PartnerWithUs = () => {
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const stats = [
        {
            value: "1.14k",
            label: "REVIEWS",
            icon: <Star className="w-5 h-5 text-[#FF2A14]" />
        },
        {
            value: "10k",
            label: "SALONS",
            icon: <Home className="w-5 h-5 text-[#FF2A14]" />
        },
        {
            value: "20k",
            label: "CITIES",
            icon: <MapPin className="w-5 h-5 text-[#FF2A14]" />
        },
        {
            value: "20000+",
            label: "APP DOWNLOADS",
            icon: <Download className="w-5 h-5 text-[#FF2A14]" />
        }
    ];

    const benefitsLeft = [
        { id: 1, text: "More Appointments" },
        { id: 2, text: "Online Presence" },
        { id: 3, text: "Customer Management" },
        { id: 4, text: "Staff Management" }
    ];

    const benefitsRight = [
        { id: 5, text: "Automated Reminders" },
        { id: 6, text: "Payment Tracking" },
        { id: 7, text: "Reports & Analytics" },
        { id: 8, text: "Marketing Support" }
    ];

    const steps = [
        { id: 1, title: "Register Your Salon", desc: "Sign up on our platform and complete your business profile information." },
        { id: 2, title: "Setup Services & Staff", desc: "Configure your service list, catalog pricing, and stylist availability timetables." },
        { id: 3, title: "Start Receiving Bookings", desc: "Go live instantly and accept online bookings from local customers 24/7." },
        { id: 4, title: "Manage Everything From CRM", desc: "Track appointments, verify invoice details, monitor staff, and view growth analytics." }
    ];

    const faqs = [
        {
            q: "How do I join?",
            a: "Simply click on the 'Become a Partner' button, complete the salon registration form with your business and contact details, and our partner support team will guide you through the quick onboarding process."
        },
        {
            q: "Is there setup support?",
            a: "Yes! We provide dedicated setup support to help you configure your service catalog, team timetables, and pricing lists so you can start receiving online bookings immediately."
        },
        {
            q: "Can I manage multiple branches?",
            a: "Absolutely. Our platform is built with multi-location management capabilities, enabling you to coordinate and monitor multiple salon branches from a single unified CRM dashboard."
        },
        {
            q: "Is training provided?",
            a: "Yes, we offer comprehensive training sessions, video tutorials, and documentation guides for you and your staff to ensure you get the absolute most out of our CRM utility features."
        },
        {
            q: "Is there a mobile app?",
            a: "Yes, we offer dedicated mobile applications for both customer bookings and salon owners/staff members, enabling you to coordinate appointments and manage salon operations on the go."
        },
        {
            q: "What are the charges?",
            a: "Listing your salon on the NeoParlour search directory is completely free. We offer competitive, transparent subscription tiers for automated marketing campaigns and advanced CRM tools."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-red-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
            {/* Header Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Background Radial Light Accent */}
                    <div className="absolute top-10 right-10 w-96 h-96 bg-red-50/60 rounded-full blur-3xl -z-10" />

                    {/* Left Details */}
                    <div className="flex-1 space-y-6 lg:max-w-xl">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> B2B Partner Portal
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-none text-gray-900">
                            Grow Your Salon Business With <span className="text-[#FF2A14]">NeoParlour</span>
                        </h1>
                        <p className="text-gray-400 font-semibold text-sm leading-relaxed max-w-lg">
                            Get Online Bookings, Manage Customers, Staff, Payments, And Grow Revenue With Our Smart CRM.
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                            <button 
                                onClick={() => navigate('/owner/register')}
                                className="px-6 py-4 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/25 transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                Become a Partner 
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => {
                                    const faqSection = document.getElementById('faq-section');
                                    faqSection?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                Book Demo 
                                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Right Media Frame */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
                        <div className="relative group p-3 bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-gray-200 hover:-translate-y-1 transition duration-300">
                            <div className="absolute inset-0 bg-red-100/30 rounded-[32px] blur-xl -z-10 group-hover:scale-105 transition duration-300" />
                            <div className="relative rounded-2xl overflow-hidden aspect-video w-full sm:w-[500px]">
                                <img 
                                    src={partnerUs1} 
                                    alt="Salon Business Management App" 
                                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                                />
                                {/* Glassmorphic Play Button Overlay */}
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300">
                                        <Play className="w-5 h-5 text-[#FF2A14] fill-current ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Bar */}
                <section className="w-full border-y border-gray-100 bg-gray-50/50 py-10">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left justify-center">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                    {stat.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-none">{stat.value}</h3>
                                    <p className="text-[10px] font-black text-gray-400 tracking-wider uppercase mt-1">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Partner With Us Section */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 lg:py-28">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase mb-4">
                            Why Partner With Us
                        </h2>
                        <div className="w-12 h-1 bg-[#FF2A14] mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Benefits List */}
                        <div className="lg:col-span-4 space-y-8 lg:text-right order-2 lg:order-1">
                            {benefitsLeft.map((item) => (
                                <div key={item.id} className="flex items-center lg:justify-end gap-4 group">
                                    <span className="text-gray-700 font-extrabold text-base tracking-tight lg:order-1 group-hover:text-[#FF2A14] transition-colors">{item.text}</span>
                                    <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-md shadow-red-500/10 lg:order-2 shrink-0">
                                        {item.id}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Center Decorative Circular Avatar */}
                        <div className="lg:col-span-4 flex justify-center order-1 lg:order-2">
                            <div className="relative p-6 rounded-full border-2 border-dashed border-red-100 bg-[#FF2A14]/10 shadow-inner">
                                <div className="absolute inset-4 rounded-full bg-white -z-10" />
                                <div className="w-60 h-60 rounded-full overflow-hidden border-[6px] border-white shadow-2xl">
                                    <img 
                                        src={partnerUs2} 
                                        alt="Salon Stylist Benefits" 
                                        className="w-full h-full object-cover hover:scale-105 transition duration-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Benefits List */}
                        <div className="lg:col-span-4 space-y-8 text-left order-3">
                            {benefitsRight.map((item) => (
                                <div key={item.id} className="flex items-center justify-start gap-4 group">
                                    <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-md shadow-red-500/10 shrink-0">
                                        {item.id}
                                    </span>
                                    <span className="text-gray-700 font-extrabold text-base tracking-tight group-hover:text-[#FF2A14] transition-colors">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="w-full bg-gray-50/50 border-y border-gray-100 py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        
                        {/* Left Column Graphic */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative">
                                {/* Floating Location Icon Callout */}
                                <div className="absolute -top-6 -right-6 w-12 h-12 rounded-2xl bg-[#FF2A14] text-white flex items-center justify-center shadow-lg shadow-red-500/20 z-10 animate-bounce">
                                    <Store className="w-5 h-5" />
                                </div>
                                {/* Floating Chat Icon Callout */}
                                <div className="absolute bottom-6 -left-6 w-12 h-12 rounded-2xl bg-white text-[#FF2A14] border border-gray-100 flex items-center justify-center shadow-xl z-10">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                
                                <div className="p-4 bg-white border border-gray-100 rounded-[40px] shadow-2xl shadow-gray-200/50 max-w-sm">
                                    <div className="rounded-[28px] overflow-hidden aspect-[4/5] bg-gray-100">
                                        <img 
                                            src={partnerUs3} 
                                            alt="Onboarding and CRM details" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Onboarding Steps */}
                        <div className="lg:col-span-7 space-y-10">
                            <div>
                                <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-2 block">Simple Setup</span>
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase">
                                    How It Works?
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex gap-5 items-start">
                                        <span className="w-10 h-10 rounded-full bg-[#FF2A14]/10 text-[#FF2A14] font-black flex items-center justify-center text-sm shrink-0 mt-0.5">
                                            {step.id}
                                        </span>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900 text-base mb-1 tracking-tight">{step.title}</h4>
                                            <p className="text-sm font-semibold text-gray-400 leading-relaxed max-w-xl">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Accordion Section */}
                <section id="faq-section" className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-2 block">Common Queries</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div 
                                    key={index}
                                    className="border border-gray-100 rounded-2xl overflow-hidden transition duration-300"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50/50 transition-colors text-left font-bold text-gray-950 text-sm sm:text-base tracking-tight"
                                    >
                                        <span>{faq.q}</span>
                                        {isOpen ? (
                                            <Minus className="w-4 h-4 text-[#FF2A14] shrink-0 ml-4" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-gray-400 shrink-0 ml-4" />
                                        )}
                                    </button>
                                    
                                    {/* Accordion Panel Content */}
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            isOpen ? 'max-h-52 opacity-100 border-t border-gray-100/50' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="p-6 bg-gray-50/40 text-sm font-semibold text-gray-400 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* Footer Component */}
            <CustomerFooter />
        </div>
    );
};

export default PartnerWithUs;
