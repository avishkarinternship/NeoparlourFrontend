import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../../assets/Neoparlour_logo.png';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <footer className="bg-[#EAEAEA] text-gray-900 pt-8 pb-4 px-4 md:px-8 font-sans w-full">
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 items-start">

                {/* Identity Column (Expanded span to prevent company text overlap) */}
                <div className="md:col-span-3 flex items-center space-x-2.5">
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
                <div className="md:col-span-3">
                    <h4 className="font-semibold text-sm mb-2  text-black">Our Company</h4>
                    <ul className="space-y-1 text-xs font-medium text-gray-700">
                        <li onClick={() => navigate('/customer/about')} className="cursor-pointer hover:text-gray-900 transition-colors">• About Us</li>
                        <li onClick={() => navigate('/customer/leadership')} className="cursor-pointer hover:text-gray-900 transition-colors">• Leadership</li>
                        <li onClick={() => navigate('/customer/terms-and-conditions')} className="cursor-pointer hover:text-gray-900 transition-colors">• Terms & Condition</li>
                        <li onClick={() => navigate('/customer/privacy-policy')} className="cursor-pointer hover:text-gray-900 transition-colors">• Privacy Policy</li>
                        <li onClick={() => navigate('/customer/support')} className="cursor-pointer hover:text-gray-900 transition-colors">• Contact Us</li>
                        <li onClick={() => navigate('/customer/blogs')} className="cursor-pointer hover:text-gray-900 transition-colors">• Blogs</li>
                        <li onClick={() => navigate('/customer/sitemap')} className="cursor-pointer hover:text-gray-900 transition-colors">• Sitemap</li>
                    </ul>
                </div>

                {/* Column 2: Services */}
                <div className="md:col-span-3">
                    <h4 className="font-semibold text-sm mb-2 text-black">Services</h4>
                    <ul className="space-y-1 text-xs font-medium text-gray-700">
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Hair Services</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Skin Care</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Hair Removal</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Nail Care</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Makeup Artist</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Gromming</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Spa & Massage</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Bridal Packages</li>
                        <li onClick={() => navigate('/customer/services')} className="cursor-pointer hover:text-gray-900 transition-colors">• Hair Treatment</li>
                    </ul>
                </div>

                {/* Column 3: Contact/Socials Links */}
                <div className="md:col-span-3">
                    <h4 className="font-semibold text-sm mb-2 text-black">Our Resources</h4>
                    <ul className="space-y-1 text-xs font-medium text-gray-700">
                        <li onClick={() => navigate('/customer/videos')} className="cursor-pointer hover:text-gray-900 transition-colors">• Videos</li>
                        <li onClick={() => navigate('/customer/support')} className="cursor-pointer hover:text-gray-900 transition-colors">• Help Center</li>
                        <li onClick={() => navigate('/customer/support')} className="cursor-pointer hover:text-gray-900 transition-colors">• Support</li>
                        <li onClick={() => navigate('/customer/security')} className="cursor-pointer hover:text-gray-900 transition-colors">• Security</li>
                        <li onClick={() => navigate('/customer/updates')} className="cursor-pointer hover:text-gray-900 transition-colors">• Updates</li>
                        <li onClick={() => navigate('/customer/case-studies')} className="cursor-pointer hover:text-gray-900 transition-colors">• Case Studies</li>
                        <li onClick={() => navigate('/customer/client-testimonials')} className="cursor-pointer hover:text-gray-900 transition-colors">• Client Testimonial</li>
                    </ul>
                </div>         

                {/* App Download Store Badges
                <div className="md:col-span-2 flex flex-col gap-3 w-full sm:max-w-48 justify-self-start md:justify-self-end">
                    <a href="#" className="bg-black hover:bg-neutral-900 text-white rounded-xl py-2 px-4 flex items-center gap-3 shadow transition">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
                        </svg>
                        <div className="flex flex-col leading-tight">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400">Get it on</span>
                            <span className="text-sm font-bold tracking-tight">App Store</span>
                        </div>
                    </a>

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
                */ }  
            </div>

            {/* Bottom Sub-Footer Separator */}
            <hr className="border-gray-400/60 my-4 max-w-7xl mx-auto" />

            {/* Copyright and Social Media Icons */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
                <span className="text-[10x] font-medium text-gray-500 tracking-wide">
                    Copyright@Neopaceinfotech.com
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
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48  2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;