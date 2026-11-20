import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../../assets/Neoparlour_logo.png';
import { useActiveSalon, getSalonImageSrc, SalonLogoImage } from '../../../utils/whiteLabelHelper';
import { MapPin, Phone } from 'lucide-react';
import { useDarkMode } from '../../../context/DarkModeContext';
import { useTranslation } from 'react-i18next';
import OwnerFooter from '../../Owner/Layouts/Footer';
import { isOwnerLoggedIn } from '../../../utils/auth';

const Footer = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isDark } = useDarkMode();
    const { salon: activeSalon, isWhiteLabeled, clearActiveSalon } = useActiveSalon();

    if (isOwnerLoggedIn()) {
        return <OwnerFooter isDarkMode={isDark} />;
    }

    return (
        <footer className={`pt-8 pb-4 px-4 md:px-8 font-sans w-full transition-colors duration-300 ${isDark ? 'bg-gray-950 text-gray-200' : 'bg-[#EAEAEA] text-gray-900'}`}>
            {/* Main Footer Container */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-12 gap-x-4 gap-y-6 md:gap-5 items-start">

                {/* Identity Column - White-labeled when salon selected */}
                <div className="col-span-2 md:col-span-3 flex flex-col justify-start">
                    {isWhiteLabeled ? (
                        <>
                            <div className="flex items-center space-x-2.5">
                                <SalonLogoImage logo={activeSalon.logo} name={activeSalon.name} className="w-8 h-8 rounded-lg" />
                                <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {activeSalon.name}
                                </span>
                            </div>
                            <p className={`text-[11px] font-medium leading-relaxed mt-1 max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {activeSalon.address ? (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                        {activeSalon.address}
                                    </span>
                                ) : (
                                    'Your premier luxury beauty, styling & salon destination.'
                                )}
                            </p>
                            {activeSalon.phone && (
                                <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Phone className="w-3 h-3 text-red-500 shrink-0" />
                                    {activeSalon.phone}
                                </p>
                            )}
                            {/* Powered by NeoParlour Attribution Badge */}
                            <div className="flex items-center gap-1.5 mt-3 pt-1">
                                <span className="text-[11px] font-medium text-gray-500">Powered by</span>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-red-200/60 dark:border-red-900/40 shadow-xs">
                                    <img src={logoIcon} alt="NeoParlour" className="w-3.5 h-3.5 object-contain" />
                                    <span className="text-[11px] font-black text-[#ff0b01]">NeoParlour</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center space-x-2.5">
                                <img
                                    src={logoIcon}
                                    alt="NeoParlour Logo"
                                    className="w-8 h-8 object-contain flex-shrink-0"
                                />
                                <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    NeoParlour
                                </span>
                            </div>
                            <p className={`text-[11px] font-medium leading-relaxed mt-1 max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Your complete beauty & salon ecosystem.
                            </p>
                            <div className="flex items-center gap-1.5 mt-2.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Verified Network</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Column 1: Salon / Company Info */}
                <div className="col-span-1 md:col-span-3">
                    <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        {isWhiteLabeled ? activeSalon.name : t('footer.our_company', 'Our Company')}
                    </h4>
                    {isWhiteLabeled ? (
                        <ul className={`space-y-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                            <li onClick={() => navigate('/salon')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Services & Pricing</li>
                            <li onClick={() => navigate('/book-service')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Book Appointment</li>
                            <li onClick={() => navigate('/customer/appointments')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• My Appointments</li>
                            {activeSalon.phone && (
                                <li className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Phone className="w-3 h-3 text-red-500 shrink-0" />
                                    <a href={`tel:${activeSalon.phone}`} className="hover:underline">{activeSalon.phone}</a>
                                </li>
                            )}
                            <li onClick={() => navigate('/customer/terms-and-conditions')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Terms & Conditions</li>
                            <li onClick={() => navigate('/customer/privacy-policy')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Privacy Policy</li>
                        </ul>
                    ) : (
                        <ul className={`space-y-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                            <li onClick={() => navigate('/customer/about')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.about_us', 'About Us')}</li>
                            <li onClick={() => navigate('/customer/leadership')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.leadership', 'Leadership')}</li>
                            <li onClick={() => navigate('/customer/terms-and-conditions')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.terms_conditions', 'Terms & Condition')}</li>
                            <li onClick={() => navigate('/customer/privacy-policy')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.privacy_policy', 'Privacy Policy')}</li>
                            <li onClick={() => navigate('/customer/support')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.contact_us', 'Contact Us')}</li>
                            <li onClick={() => navigate('/customer/blogs')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.blogs', 'Blogs')}</li>
                            <li onClick={() => navigate('/customer/sitemap')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• {t('footer.sitemap', 'Sitemap')}</li>
                        </ul>
                    )}
                </div>

                {/* Column 2: Services */}
                <div className="col-span-1 md:col-span-3">
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

                {/* Column 3: Resources / Customer Care */}
                <div className="col-span-1 md:col-span-3">
                    <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        {isWhiteLabeled ? 'Customer Care' : t('footer.our_resources', 'Our Resources')}
                    </h4>
                    {isWhiteLabeled ? (
                        <ul className={`space-y-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                            <li onClick={() => navigate('/customer/appointments')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• View Appointments</li>
                            <li onClick={() => navigate('/customer/my-orders')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Orders & Purchases</li>
                            <li onClick={() => navigate('/customer/support')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Help & Support</li>
                            <li onClick={() => navigate('/customer/security')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}>• Safe & Secure Booking</li>
                            <li onClick={() => {
                                clearActiveSalon();
                                navigate('/customer/salons');
                            }} className="cursor-pointer text-red-500 hover:text-red-600 font-bold">• Explore All Salons</li>
                        </ul>
                    ) : (
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
                    )}
                </div>
            </div>

            {/* Bottom Sub-Footer Separator */}
            <hr className={`my-4 max-w-7xl mx-auto ${isDark ? 'border-gray-700' : 'border-gray-400/60'}`} />

            {/* Copyright and Social Media Icons - White-labeled */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        © {new Date().getFullYear()} {isWhiteLabeled ? activeSalon.name : 'NeoParlour'}. All rights reserved.
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                        Powered by <strong className="text-[#ff0b01] font-black tracking-tight">NeoParlour</strong>
                    </span>
                </div>

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