import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../../assets/Neoparlour_logo.png';

const Footer = ({ isDarkMode = false }) => {
    const navigate = useNavigate();
    const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
    const activeSalonName = localStorage.getItem('salon_name') || localStorage.getItem('activeSalonName') || ownerUser?.salonName || '';
    const isSystemAdmin = ownerUser?.role === 'ADMIN';

    const handleWhatsApp = () => {
        window.open('https://wa.me/917062888812?text=Hello%20NeoParlour%20Support,%20I%20need%20assistance.', '_blank', 'noopener,noreferrer');
    };

    const handleEmail = () => {
        window.location.href = 'mailto:support@neopaceinfotech.com?subject=NeoParlour%20Owner%20Support';
    };

    return (
        <footer className={`pt-14 pb-8 px-6 md:px-12 font-sans w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-900 border-t border-zinc-800 text-zinc-100' : 'bg-[#EAEAEA] text-gray-900'
        }`}>
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 items-start">

                {/* Identity Column - White-labeled for Salon Owner */}
                <div className="md:col-span-4 flex flex-col items-start space-y-2">
                    {!isSystemAdmin && activeSalonName ? (
                        <>
                            <div 
                                onClick={() => navigate('/owner/dashboard')} 
                                className="flex items-center space-x-2.5 cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                    {activeSalonName.charAt(0).toUpperCase()}
                                </div>
                                <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {activeSalonName}
                                </span>
                            </div>
                            <p className={`text-xs font-medium leading-relaxed max-w-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                                Dedicated operating portal for {activeSalonName}. Manage staff, appointments, client retention and revenue.
                            </p>
                            {/* Prominent Powered by NeoParlour Badge */}
                            <div className="flex items-center gap-1.5 pt-2">
                                <span className="text-xs font-medium text-gray-400">Platform:</span>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 shadow-xs">
                                    <img src={logoIcon} alt="NeoParlour" className="w-3.5 h-3.5 object-contain" />
                                    <span className="text-xs font-black text-[#ff0b01]">Powered by NeoParlour</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div 
                                onClick={() => navigate('/owner/dashboard')} 
                                className="flex items-center space-x-2.5 cursor-pointer group"
                            >
                                <img
                                    src={logoIcon}
                                    alt="NeoParlour Logo"
                                    className="w-8 h-8 object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
                                />
                                <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    NeoParlour
                                </span>
                            </div>
                            <p className={`text-xs font-medium leading-relaxed max-w-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                                All-in-one salon operating system for appointments, inventory, staff payouts, and verified customer growth.
                            </p>
                            <div className="flex items-center gap-1.5 pt-1">
                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-[#ff0b01]">
                                    <span>Enterprise Salon OS</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Column 1: Company Info */}
                <div className="md:col-span-3">
                    <h4 className={`font-extrabold text-base mb-4 tracking-wide ${isDarkMode ? 'text-zinc-100' : 'text-black'}`}>
                        Company
                    </h4>
                    <ul className={`space-y-2.5 text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`}>
                        <li 
                            onClick={() => navigate('/customer/influencer-program')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Influencer Program
                        </li>
                        <li 
                            onClick={() => navigate('/customer/about')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • About Us
                        </li>
                        <li 
                            onClick={() => navigate('/customer/partner-with-us')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Partner With Us
                        </li>
                        <li 
                            onClick={() => navigate('/customer/offers')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Buy Gift Card
                        </li>
                        <li 
                            onClick={() => navigate('/customer/blogs')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Blogs
                        </li>
                    </ul>
                </div>

                {/* Column 2: Legal */}
                <div className="md:col-span-2">
                    <h4 className={`font-extrabold text-base mb-4 tracking-wide ${isDarkMode ? 'text-zinc-100' : 'text-black'}`}>
                        Legal
                    </h4>
                    <ul className={`space-y-2.5 text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`}>
                        <li 
                            onClick={() => navigate('/owner/privacy-policy')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Privacy Policy
                        </li>
                        <li 
                            onClick={() => navigate('/owner/terms-and-conditions')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Terms Of Service
                        </li>
                        <li 
                            onClick={() => navigate('/customer/security')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Security & Trust
                        </li>
                    </ul>
                </div>

                {/* Column 3: Contact & Support */}
                <div className="md:col-span-3">
                    <h4 className={`font-extrabold text-base mb-4 tracking-wide ${isDarkMode ? 'text-zinc-100' : 'text-black'}`}>
                        Contact & Support
                    </h4>
                    <ul className={`space-y-2.5 text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`}>
                        <li 
                            onClick={() => navigate('/customer/support')} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Help Center & Support
                        </li>
                        <li 
                            onClick={handleWhatsApp} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • WhatsApp (+91 7062 888 812)
                        </li>
                        <li 
                            onClick={handleEmail} 
                            className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-red-600'}`}
                        >
                            • Email (support@neopaceinfotech.com)
                        </li>
                    </ul>
                </div>

            </div>

            {/* Bottom Separator */}
            <hr className={`my-8 max-w-7xl mx-auto ${isDarkMode ? 'border-zinc-700/60' : 'border-gray-400/60'}`} />

            {/* Copyright and Social Media Icons - White-labeled */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className={`uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                        © {new Date().getFullYear()} {!isSystemAdmin && activeSalonName ? activeSalonName : 'NeoParlour'}. All rights reserved.
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-500 font-semibold lowercase">
                        powered by <strong className="text-red-600 font-black">NeoParlour</strong>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Instagram */}
                    <a 
                        href="https://www.instagram.com/neoparlour" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white hover:opacity-90 transition shadow-sm"
                        title="Follow NeoParlour on Instagram"
                        aria-label="Instagram"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                    </a>
                    {/* Facebook */}
                    <a 
                        href="https://www.facebook.com/neoparlour" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#1877F2] hover:opacity-80 transition"
                        title="Follow NeoParlour on Facebook"
                        aria-label="Facebook"
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
