import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../../assets/Neoparlour_logo.png';
import { useDarkMode } from '../../../context/DarkModeContext';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isDark } = useDarkMode();

    return (
        <footer className={`pt-8 pb-4 px-4 md:px-8 font-sans w-full transition-colors duration-300 ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-[#EAEAEA] text-gray-900'}`}>
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 items-start">

                {/* Identity Column */}
                <div className="md:col-span-3 flex items-center space-x-2.5">
                    <img
                        src={logoIcon}
                        alt="NeoParlour Logo"
                        className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        NeoParlour
                    </span>
                </div>

                {/* Column 1: Company Info */}
                <div className="md:col-span-3">
                    <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{t('footer.our_company', 'Our Company')}</h4>
                    <ul className={`space-y-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        <li onClick={() => navigate('/customer/about')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.about_us', 'About Us')}</li>
                        <li onClick={() => navigate('/customer/leadership')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.leadership', 'Leadership')}</li>
                        <li onClick={() => navigate('/customer/terms-and-conditions')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.terms_conditions', 'Terms & Condition')}</li>
                        <li onClick={() => navigate('/customer/privacy-policy')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.privacy_policy', 'Privacy Policy')}</li>
                        <li onClick={() => navigate('/customer/support')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.contact_us', 'Contact Us')}</li>
                        <li onClick={() => navigate('/customer/blogs')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.blogs', 'Blogs')}</li>
                        <li onClick={() => navigate('/customer/sitemap')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.sitemap', 'Sitemap')}</li>
                    </ul>
                </div>

                {/* Column 2: Services */}
                <div className="md:col-span-3">
                    <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{t('footer.services', 'Services')}</h4>
                    <ul className={`space-y-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.hair', 'Hair Services')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.skin_care', 'Skin Care')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.hair_removal', 'Hair Removal')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.nail_care', 'Nail Care')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.makeup', 'Makeup Artist')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.grooming', 'Grooming')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.spa_massage', 'Spa & Massage')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.bridal_packages', 'Bridal Packages')}</li>
                        <li onClick={() => navigate('/customer/services')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('services.hair_treatment', 'Hair Treatment')}</li>
                    </ul>
                </div>

                {/* Column 3: Resources */}
                <div className="md:col-span-3">
                    <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{t('footer.our_resources', 'Our Resources')}</h4>
                    <ul className={`space-y-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        <li onClick={() => navigate('/customer/videos')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.videos', 'Videos')}</li>
                        <li onClick={() => navigate('/customer/support')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.help_center', 'Help Center')}</li>
                        <li onClick={() => navigate('/customer/support')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.support', 'Support')}</li>
                        <li onClick={() => navigate('/customer/security')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.security', 'Security')}</li>
                        <li onClick={() => navigate('/delete-account')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.delete_account', 'Delete Account')}</li>
                        <li onClick={() => navigate('/customer/updates')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.updates', 'Updates')}</li>
                        <li onClick={() => navigate('/customer/case-studies')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.case_studies', 'Case Studies')}</li>
                        <li onClick={() => navigate('/customer/client-testimonials')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.client_testimonial', 'Client Testimonial')}</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Sub-Footer Separator */}
            <hr className={`my-4 max-w-7xl mx-auto ${isDark ? 'border-gray-700' : 'border-gray-400/60'}`} />

            {/* Copyright and Social Media Icons */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
                <span className={`text-[10px] font-medium tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
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