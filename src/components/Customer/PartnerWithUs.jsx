import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import partnerUs1 from '../../assets/HomePage/Partner/partner_us_1.png';
import partnerUs2 from '../../assets/HomePage/Partner/partner_us_2.png';
import partnerUs3 from '../../assets/HomePage/Partner/partner_us_3.png';
import { 
    Play, 
    ArrowUpRight, 
    Plus, 
    Minus, 
    Sparkles, 
    MessageCircle, 
    Store,
    ArrowRight
} from 'lucide-react';
import SEOFooter from '../common/SEOFooter';

const PartnerWithUs = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const benefitsLeft = [
        { id: 1, text: t('partner_page.b1', 'More Appointments') },
        { id: 2, text: t('partner_page.b2', 'Online Presence') },
        { id: 3, text: t('partner_page.b3', 'Customer Management') },
        { id: 4, text: t('partner_page.b4', 'Staff Management') }
    ];

    const benefitsRight = [
        { id: 5, text: t('partner_page.b5', 'Automated Reminders') },
        { id: 6, text: t('partner_page.b6', 'Payment Tracking') },
        { id: 7, text: t('partner_page.b7', 'Reports & Analytics') },
        { id: 8, text: t('partner_page.b8', 'Marketing Support') }
    ];

    const steps = [
        { id: 1, title: t('partner_page.s1_title', 'Register Your Salon'), desc: t('partner_page.s1_desc', 'Sign up on our platform and complete your business profile information.') },
        { id: 2, title: t('partner_page.s2_title', 'Setup Services & Staff'), desc: t('partner_page.s2_desc', 'Configure your service list, catalog pricing, and stylist availability timetables.') },
        { id: 3, title: t('partner_page.s3_title', 'Start Receiving Bookings'), desc: t('partner_page.s3_desc', 'Go live instantly and accept online bookings from local customers 24/7.') },
        { id: 4, title: t('partner_page.s4_title', 'Manage Everything From CRM'), desc: t('partner_page.s4_desc', 'Track appointments, verify invoice details, monitor staff, and view growth analytics.') }
    ];

    const faqs = [
        {
            q: t('partner_page.faq1_q', 'How do I join?'),
            a: t('partner_page.faq1_a', "Simply click on the 'Become a Partner' button, complete the salon registration form with your business and contact details, and our partner support team will guide you through the quick onboarding process.")
        },
        {
            q: t('partner_page.faq2_q', 'Is there setup support?'),
            a: t('partner_page.faq2_a', 'Yes! We provide dedicated setup support to help you configure your service catalog, team timetables, and pricing lists so you can start receiving online bookings immediately.')
        },
        {
            q: t('partner_page.faq3_q', 'Can I manage multiple branches?'),
            a: t('partner_page.faq3_a', 'Absolutely. Our platform is built with multi-location management capabilities, enabling you to coordinate and monitor multiple salon branches from a single unified CRM dashboard.')
        },
        {
            q: t('partner_page.faq4_q', 'Is training provided?'),
            a: t('partner_page.faq4_a', 'Yes, we offer comprehensive training sessions, video tutorials, and documentation guides for you and your staff to ensure you get the absolute most out of our CRM utility features.')
        },
        {
            q: t('partner_page.faq5_q', 'Is there a mobile app?'),
            a: t('partner_page.faq5_a', 'Yes, we offer dedicated mobile applications for both customer bookings and salon owners/staff members, enabling you to coordinate appointments and manage salon operations on the go.')
        },
        {
            q: t('partner_page.faq6_q', 'What are the charges?'),
            a: t('partner_page.faq6_a', 'Listing your salon on the NeoParlour search directory is completely free. We offer competitive, transparent subscription tiers for automated marketing campaigns and advanced CRM tools.')
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-red-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
            {/* Main Content */}
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Background Radial Light Accent */}
                    <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-[120px] -z-10" />

                    {/* Left Details */}
                    <div className="flex-1 space-y-6 lg:max-w-xl">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> {t('partner_page.tag', 'B2B Partner Portal')}
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-snug text-gray-900">
                            {t('partner_page.hero_title', 'Grow Your Salon Business With NeoParlour')}
                        </h1>
                        <p className="text-gray-400 font-semibold text-sm leading-relaxed max-w-lg">
                            {t('partner_page.hero_desc', 'Get Online Bookings, Manage Customers, Staff, Payments, And Grow Revenue With Our Smart CRM.')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                            <button 
                                onClick={() => navigate('/owner/register')}
                                className="px-6 py-4 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/25 transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {t('partner_page.become_partner', 'Become a Partner')} 
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => {
                                    const faqSection = document.getElementById('faq-section');
                                    faqSection?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {t('partner_page.book_demo', 'Book Demo')} 
                                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Right Media Frame */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
                        <div className="relative group p-3 bg-white border border-gray-100 rounded-[32px] shadow-[0_20px_50px_rgba(255,42,20,0.12)] hover:shadow-[0_25px_60px_rgba(255,42,20,0.22)] hover:-translate-y-1 transition duration-300">
                            {/* Layered glowing elements behind the image */}
                            <div className="absolute -inset-10 bg-gradient-to-tr from-[#FF2A14]/20 to-[#FF2A14]/5 rounded-[40px] blur-3xl -z-10 opacity-70 group-hover:opacity-90 group-hover:scale-110 transition duration-500" />
                            <div className="absolute -inset-2 bg-gradient-to-tr from-[#FF2A14]/30 via-[#FF2A14]/15 to-transparent rounded-[36px] blur-xl -z-10 group-hover:scale-105 transition duration-300" />
                            
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

                {/* Why Partner With Us Section */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 lg:py-28">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase mb-4">
                            {t('partner_page.why_partner', 'Why Partner With Us')}
                        </h2>
                        <div className="w-12 h-1 bg-[#FF2A14] mx-auto rounded-full" />
                    </div>

                    {/* Desktop View Circular Layout */}
                    <div className="relative w-full max-w-5xl mx-auto h-[600px] hidden lg:block select-none">
                        
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="500" y1="300" x2="320" y2="150" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                            <line x1="500" y1="300" x2="270" y2="250" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                            <line x1="500" y1="300" x2="270" y2="350" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                            <line x1="500" y1="300" x2="320" y2="450" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

                            <line x1="500" y1="300" x2="680" y2="150" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                            <line x1="500" y1="300" x2="730" y2="250" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                            <line x1="500" y1="300" x2="730" y2="350" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                            <line x1="500" y1="300" x2="680" y2="450" stroke="#FF2A14" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

                            <path d="M 402.5 127 A 195 195 0 0 0 402.5 473" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                            <path d="M 597.5 127 A 195 195 0 0 1 597.5 473" fill="none" stroke="#E5E7EB" strokeWidth="2" />

                            <path d="M 382.5 97 A 235 235 0 0 0 382.5 503" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
                            <path d="M 617.5 97 A 235 235 0 0 1 617.5 503" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
                        </svg>

                        {/* Central Avatar */}
                        <div 
                            className="absolute w-[280px] h-[280px] rounded-full bg-white p-3 border-2 border-dashed border-red-100 shadow-2xl flex items-center justify-center z-10"
                            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-lg bg-white">
                                <img 
                                    src={partnerUs2} 
                                    alt="Salon Stylist Benefits" 
                                    className="w-full h-full object-cover hover:scale-105 transition duration-500" 
                                />
                            </div>
                        </div>

                        {/* LEFT COLUMN */}
                        <div className="absolute flex items-center justify-end" style={{ left: '32%', top: '25%', transform: 'translate(-50%, -50%)' }}>
                            <div className="absolute right-12 whitespace-nowrap text-right pr-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b1', 'More Appointments')}</span>
                            </div>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">1</span>
                        </div>

                        <div className="absolute flex items-center justify-end" style={{ left: '27%', top: '41.7%', transform: 'translate(-50%, -50%)' }}>
                            <div className="absolute right-12 whitespace-nowrap text-right pr-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b2', 'Online Presence')}</span>
                            </div>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">2</span>
                        </div>

                        <div className="absolute flex items-center justify-end" style={{ left: '27%', top: '58.3%', transform: 'translate(-50%, -50%)' }}>
                            <div className="absolute right-12 whitespace-nowrap text-right pr-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b3', 'Customer Management')}</span>
                            </div>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">3</span>
                        </div>

                        <div className="absolute flex items-center justify-end" style={{ left: '32%', top: '75%', transform: 'translate(-50%, -50%)' }}>
                            <div className="absolute right-12 whitespace-nowrap text-right pr-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b4', 'Staff Management')}</span>
                            </div>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">4</span>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="absolute flex items-center justify-start" style={{ left: '68%', top: '25%', transform: 'translate(-50%, -50%)' }}>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">5</span>
                            <div className="absolute left-12 whitespace-nowrap text-left pl-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b5', 'Automated Reminders')}</span>
                            </div>
                        </div>

                        <div className="absolute flex items-center justify-start" style={{ left: '73%', top: '41.7%', transform: 'translate(-50%, -50%)' }}>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">6</span>
                            <div className="absolute left-12 whitespace-nowrap text-left pl-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b6', 'Payment Tracking')}</span>
                            </div>
                        </div>

                        <div className="absolute flex items-center justify-start" style={{ left: '73%', top: '58.3%', transform: 'translate(-50%, -50%)' }}>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">7</span>
                            <div className="absolute left-12 whitespace-nowrap text-left pl-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b7', 'Reports & Analytics')}</span>
                            </div>
                        </div>

                        <div className="absolute flex items-center justify-start" style={{ left: '68%', top: '75%', transform: 'translate(-50%, -50%)' }}>
                            <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-lg shadow-red-500/20 shrink-0">8</span>
                            <div className="absolute left-12 whitespace-nowrap text-left pl-2">
                                <span className="text-gray-900 font-extrabold text-[15px] tracking-tight hover:text-[#FF2A14] transition-colors duration-200">{t('partner_page.b8', 'Marketing Support')}</span>
                            </div>
                        </div>

                    </div>

                    {/* Mobile View */}
                    <div className="block lg:hidden px-4">
                        <div className="flex justify-center mb-12">
                            <div className="relative p-4 rounded-full border-2 border-dashed border-red-100 bg-[#FF2A14]/5 shadow-inner">
                                <div className="absolute inset-3 rounded-full bg-white -z-10" />
                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                                    <img 
                                        src={partnerUs2} 
                                        alt="Salon Stylist Benefits" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...benefitsLeft, ...benefitsRight].map((item) => (
                                <div 
                                    key={item.id} 
                                    className="flex items-center gap-4 p-4 bg-gray-50/70 border border-gray-100 rounded-2xl hover:bg-red-50/50 hover:border-red-100 transition duration-300 group"
                                >
                                    <span className="w-10 h-10 rounded-full bg-[#FF2A14] text-white font-black flex items-center justify-center text-sm shadow-md shadow-red-500/10 shrink-0 group-hover:scale-105 transition-transform select-none">
                                        {item.id}
                                    </span>
                                    <span className="text-gray-900 font-extrabold text-sm sm:text-base tracking-tight group-hover:text-[#FF2A14] transition-colors">
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="w-full bg-gray-50/50 dark:bg-black border-y border-gray-100 dark:border-gray-800 py-20 lg:py-28">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="relative">
                                <div className="absolute -top-6 -right-6 w-12 h-12 rounded-2xl bg-[#FF2A14] text-white flex items-center justify-center shadow-lg shadow-red-500/20 z-10 animate-bounce">
                                    <Store className="w-5 h-5" />
                                </div>
                                <div className="absolute bottom-6 -left-6 w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 text-[#FF2A14] border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-xl z-10">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                
                                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-2xl shadow-gray-200/50 max-w-sm">
                                    <div className="rounded-[28px] overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-800">
                                        <img 
                                            src={partnerUs3} 
                                            alt="Onboarding and CRM details" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-10">
                            <div>
                                <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-2 block">{t('partner_page.simple_setup', 'Simple Setup')}</span>
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                    {t('partner_page.how_it_works', 'How It Works?')}
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex gap-5 items-start">
                                        <span className="w-10 h-10 rounded-full bg-[#FF2A14]/10 text-[#FF2A14] font-black flex items-center justify-center text-sm shrink-0 mt-0.5">
                                            {step.id}
                                        </span>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900 dark:text-white text-base mb-1 tracking-tight">{step.title}</h4>
                                            <p className="text-sm font-semibold text-gray-400 dark:text-gray-300 leading-relaxed max-w-xl">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Accordion Section */}
                <section id="faq-section" className="w-full dark:bg-black py-20 lg:py-28">
                  <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-2 block">{t('partner_page.common_queries', 'Common Queries')}</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                            {t('partner_page.faq_title', 'Frequently Asked Questions')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div 
                                    key={index}
                                    className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition duration-300"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800 transition-colors text-left font-bold text-gray-950 dark:text-white text-sm sm:text-base tracking-tight"
                                    >
                                        <span>{faq.q}</span>
                                        {isOpen ? (
                                            <Minus className="w-4 h-4 text-[#FF2A14] shrink-0 ml-4" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-gray-400 shrink-0 ml-4" />
                                        )}
                                    </button>
                                    
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            isOpen ? 'max-h-52 opacity-100 border-t border-gray-100/50 dark:border-gray-800' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="p-6 bg-gray-50/40 dark:bg-gray-900 text-sm font-semibold text-gray-400 dark:text-gray-300 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  </div>
                </section>
            </main>
            <SEOFooter />
        </div>
    );
};

export default PartnerWithUs;
