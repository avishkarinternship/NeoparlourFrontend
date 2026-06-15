import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../../assets/Owner/logo_icon.svg';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <footer className="bg-[#EAEAEA] text-gray-900 pt-16 pb-8 px-6 md:px-12 font-sans w-full">
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 items-start">

                {/* Identity Column (Expanded span to prevent company text overlap) */}
                <div className="md:col-span-4 flex items-center space-x-2.5">
                    <img
                        src={logoIcon}
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
                        <li onClick={() => navigate('/customer/influencer-program')} className="cursor-pointer hover:text-gray-900 transition-colors">• Influencer Program</li>
                        <li onClick={() => navigate('/customer/about')} className="cursor-pointer hover:text-gray-900 transition-colors">• About Us</li>
                        <li onClick={() => navigate('/customer/partner-with-us')} className="cursor-pointer hover:text-gray-900 transition-colors">• Partner With Us</li>
                        <li onClick={() => navigate('/customer/blogs')} className="cursor-pointer hover:text-gray-900 transition-colors">• Blogs</li>
                    </ul>
                </div>

                {/* Column 2: Legal */}
                <div className="md:col-span-2">
                    <h4 className="font-extrabold text-base mb-4 tracking-wide text-black">Legal</h4>
                    <ul className="space-y-3 text-sm font-semibold text-gray-700">
                        <li onClick={() => navigate('/customer/privacy-policy')} className="cursor-pointer hover:text-gray-900 transition-colors">• Privacy Policy</li>
                        <li onClick={() => navigate('/customer/terms-and-conditions')} className="cursor-pointer hover:text-gray-900 transition-colors">• Terms Of Service</li>
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
    );
};

export default Footer;