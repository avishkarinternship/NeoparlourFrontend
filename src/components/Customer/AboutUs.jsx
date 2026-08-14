import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    Menu,
    MousePointerClick
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerProfile } from '../../redux/slices/customerSlice';
import ourStoryImage from '../../assets/Customer/AboutUs/our_story.jpg';
// Add these to your imports
import verifiedIcon from '../../assets/Customer/AboutUs/verified_salon.svg';
import bookingIcon from '../../assets/Customer/AboutUs/real_time_booking.svg';
import managementIcon from '../../assets/Customer/AboutUs/smart_management.svg';
import paymentIcon from '../../assets/Customer/AboutUs/secure_payment.svg';
import supportIcon from '../../assets/Customer/AboutUs/247_support.svg';
import SEOFooter from '../common/SEOFooter';

const AboutUs = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const dispatch = useDispatch();
    const { user, isAuthenticated, profile } = useSelector((state) => state.customer);

    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-white selection:bg-red-500 selection:text-white">
            {/* 2. HERO SECTION */}
            <section id="home" className="relative overflow-hidden bg-gradient-to-b from-red-50/30 to-white dark:from-black dark:to-black py-10 lg:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12">

                        {/* Left Content Column */}
                        <div className="space-y-3 lg:col-span-7">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                                {t('about_page.hero_title', 'Redefining Beauty Through Technology')}
                            </h1>
                            
                            <p className="max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-300 sm:text-lg">
                                {t('about_page.hero_desc', 'NeoParlour Connects Customers With Trusted Salons And Empowers Salon Owners To Grow Their Business Effortlessly.')}
                            </p>
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate("/owner/register")}
                                    className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-200"
                                >
                                    <span>{t('about_page.list_salon_btn', 'LIST YOUR SALON')}</span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-500 font-bold text-sm">
                                        +
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Right Media Column */}
                        <div className="relative lg:col-span-5">
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-gray-200">
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
                                        alt="Professional Salon Experience"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Overlay Floating Card */}
                                <div className="absolute bottom-6 right-6 rounded-2xl bg-white dark:bg-black p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
                                    <p className="text-2xl font-extrabold text-red-500">{t('about_page.trust_count', '10K+ Salons')}</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{t('about_page.trust_text', 'Trust NeoParlour')}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. THE PROBLEM WE SOLVE */}
            <section className="bg-gray-50/50 dark:bg-black py-10 lg:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('about_page.problem_title', 'The Problem We Solve')}</h2>
                        <p className="mx-w-2xl mx-auto mt-3 text-sm text-gray-400 dark:text-gray-300">
                            {t('about_page.problem_subtitle', 'We Understand The Challenges Faced By Both Customers And Salon Owner.')}
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {/* For Customers */}
                        <div className="rounded-2xl bg-gray-50 dark:bg-black p-8 ring-1 ring-gray-100 dark:ring-gray-800 flex gap-6 items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div className="space-y-4 w-full">
                                <h3 className="text-lg font-bold text-gray-700 dark:text-white">{t('about_page.for_customer', 'For Customer')}</h3>
                                <ul className="space-y-3">
                                    {[
                                        t('about_page.cust_p1', 'Hard To Find Trusted And Verified Salons.'),
                                        t('about_page.cust_p2', 'No Clarity On Pricing And Availability.'),
                                        t('about_page.cust_p3', 'Long Waiting Times And Poor Experience.')
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-gray-800 dark:text-gray-300">
                                            <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* For Owners */}
                        <div className="rounded-2xl bg-gray-50 dark:bg-black p-8 ring-1 ring-gray-100 dark:ring-gray-800 flex gap-6 items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                                <Store className="h-6 w-6" />
                            </div>
                            <div className="space-y-4 w-full">
                                <h3 className="text-lg font-bold text-gray-700 dark:text-white">{t('about_page.for_owner', 'For Owner')}</h3>
                                <ul className="space-y-3">
                                    {[
                                        t('about_page.owner_p1', 'Irregular Bookings And Empty Slots.'),
                                        t('about_page.owner_p2', 'No-Shows & Last Minute Cancellation.'),
                                        t('about_page.owner_p3', 'Lack Of Tools To Manage And Grow Activities.')
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-gray-800 dark:text-gray-300">
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
            <section className="py-10 lg:py-14 bg-white dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('about_page.solution_title', 'Our Solution')}</h2>
                        <p className="mx-w-2xl mx-auto mt-2 text-sm text-gray-400 dark:text-gray-300">
                            {t('about_page.solution_subtitle', 'Simple Steps For A Better Salon Experience And Business Growth.')}
                        </p>
                        <h3 className="mt-6 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('about_page.how_it_works', 'How It Works')}</h3>
                    </div>

                    <div className="mt-6 flex flex-col items-center justify-center gap-6 lg:flex-row lg:gap-4">

                        {/* Steps For Customer */}
                        <div className="w-full max-w-sm space-y-3">
                            <h4 className="text-center lg:text-left text-lg font-bold text-gray-900 dark:text-white mb-2">{t('about_page.for_customer', 'For Customer')}</h4>
                            {[
                                { step: "1", title: t('about_page.c_step1_title', 'Search'), desc: t('about_page.c_step1_desc', 'Search Salon, Services And Expert') },
                                { step: "2", title: t('about_page.c_step2_title', 'Choose'), desc: t('about_page.c_step2_desc', 'Search The Best Salon For You') },
                                { step: "3", title: t('about_page.c_step3_title', 'Book'), desc: t('about_page.c_step3_desc', 'Pick Date, Time & Book Instantly') },
                                { step: "4", title: t('about_page.c_step4_title', 'Visit'), desc: t('about_page.c_step4_desc', 'Get Your Service And Enjoy') },
                                { step: "5", title: t('about_page.c_step5_title', 'Review'), desc: t('about_page.c_step5_desc', 'Share Your Experience And Review') },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                                        {item.step}
                                    </span>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h5>
                                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{item.desc}</p>
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
                            <div className="h-48 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-black shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
                                    alt="User Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Steps For Salon Owners */}
                        <div className="w-full max-w-sm space-y-3">
                            <h4 className="text-center lg:text-left text-lg font-bold text-gray-900 dark:text-white mb-2">{t('about_page.for_salon_owners', 'For Salon Owners')}</h4>
                            {[
                                { step: "1", title: t('about_page.o_step1_title', 'Register'), desc: t('about_page.o_step1_desc', 'List Your Salon On Neoparlour') },
                                { step: "2", title: t('about_page.o_step2_title', 'Manage'), desc: t('about_page.o_step2_desc', 'Manage Staff, Services & Slots') },
                                { step: "3", title: t('about_page.o_step3_title', 'Get Bookings'), desc: t('about_page.o_step3_desc', 'Receive Real-Time Bookings') },
                                { step: "4", title: t('about_page.o_step4_title', 'Engage'), desc: t('about_page.o_step4_desc', 'Build Customer Relationships') },
                                { step: "5", title: t('about_page.o_step5_title', 'Grow'), desc: t('about_page.o_step5_desc', 'Increase Revenue And Scale Fast') },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4 lg:flex-row">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                                        {item.step}
                                    </span>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h5>
                                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            <hr className="border-gray-100 dark:border-gray-800 max-w-7xl mx-auto" />

            {/* 5. WHY CHOOSE NEOPARLOUR */}
            <section id="features" className="py-10 lg:py-14 bg-white dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                            { icon: verifiedIcon, title: t('about_page.feat1_title', 'Verified Salons'), desc: t('about_page.feat1_desc', 'All Salons Are Verified For Your Safety') },
                            { icon: bookingIcon, title: t('about_page.feat2_title', 'Real-Time Bookings'), desc: t('about_page.feat2_desc', 'Instant Booking With Live Availability') },
                            { icon: managementIcon, title: t('about_page.feat3_title', 'Smart Management'), desc: t('about_page.feat3_desc', 'Powerful Tools For Salon Owners') },
                            { icon: paymentIcon, title: t('about_page.feat4_title', 'Secure Payments'), desc: t('about_page.feat4_desc', 'Safe And Secure Transactions') },
                            { icon: supportIcon, title: t('about_page.feat5_title', '24/7 Support'), desc: t('about_page.feat5_desc', "We're Here To Help You Anytime") },
                        ].map((feature, idx) => (
                            <div key={idx} className="rounded-xl border border-gray-100 bg-white dark:bg-black dark:border-gray-800 p-6 text-center shadow-sm transition-all hover:shadow-md">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 ring-4 ring-gray-50/50 dark:bg-gray-800 dark:ring-gray-800/50">
                                    <img src={feature.icon} alt={feature.title} className="h-6 w-6 object-contain" />
                                </div> 
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{feature.title}</h4>
                                <p className="mt-2 text-xs text-gray-400 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. OUR STORY */}
            <section id="about" className="bg-gray-50/60 dark:bg-black py-10 lg:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-6 lg:grid-cols-2">

                        {/* Visual Analytics UI Showcase */}
                        <div className="w-full flex justify-center lg:justify-start">
                            <div className="w-full max-w-[560px] aspect-[4/3] overflow-hidden rounded-3xl shadow-xl bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={ourStoryImage}
                                    alt="Built with passion to empower the beauty industry mockup display"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Content Story text */}
                        <div className="space-y-5">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-500">{t('about_page.our_story_tag', 'OUR STORY')}</span>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                {t('about_page.story_title', 'BUILT WITH PASSION TO EMPOWER THE BEAUTY INDUSTRY')}
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-300">
                                {t('about_page.story_desc1', 'neoparlour was born with a simple idea - to make salon booking effortless for customer and growth simple for salon owners.')}
                            </p>
                            <p className="text-sm font-semibold leading-relaxed text-gray-700 dark:text-gray-300">
                                {t('about_page.story_desc2', "today, we are india's leading salon growth platform, trusted by thousands of salons and loved by millions of customers")}
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* 7. TESTIMONIALS */}
            <section className="py-10 lg:py-14 bg-white dark:bg-black overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-4">
                        <span className="h-px w-12 bg-gray-200 dark:bg-gray-700"></span>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">{t('about_page.testimonials_title', 'Testimonials')}</h2>
                        <span className="h-px w-12 bg-gray-200 dark:bg-gray-700"></span>
                    </div>

                    {/* Testimonial Cards Layout */}
                    <div className="relative mt-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="rounded-2xl bg-gray-50 dark:bg-black p-6 flex flex-col justify-between ring-1 ring-gray-100 dark:ring-gray-800">
                                    <div>
                                        <div className="flex gap-1 text-amber-400">
                                            {"★".repeat(5).split("").map((star, i) => (
                                                <span key={i} className="text-lg">{star}</span>
                                            ))}
                                        </div>
                                        <h4 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">{t('about_page.test1_title', 'The Best Booking System')}</h4>
                                        <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-300">
                                            {t('about_page.test1_desc', 'Great Experience, Easy To Book, Paying For Treatments Is So Convenient - No Cash Or Cards Needed!')}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Avishkar profile" className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-900 dark:text-white">Avishkar</h5>
                                            <p className="text-[10px] text-gray-400">Pune, Maharashtra</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="absolute -right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </section>

            <SEOFooter />
        </div>
    );
}
export default AboutUs;