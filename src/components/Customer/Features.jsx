import React from 'react';
import { useTranslation } from 'react-i18next';

// Relative path asset declarations from user specifications
import firstImage from '../../assets/Customer/FeaturesScreen/first_image.jpg';
import staffManagement from '../../assets/Customer/FeaturesScreen/staff_management.jpg';
import analyticsReview from '../../assets/Customer/FeaturesScreen/analytics_review.jpg';
import inventoryManagement from '../../assets/Customer/FeaturesScreen/inventory_management.jpg';
import schedulingMadeSimple from '../../assets/Customer/FeaturesScreen/scheduling_made_easy.jpg';
import easyInvoices from '../../assets/Customer/FeaturesScreen/easy_invoice.jpg';

import { useNavigate } from 'react-router-dom';
import SEOFooter from '../common/SEOFooter';  

const Features = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden antialiased">


      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Soft background glow accents matching mockup photo visual structural frame */}
        <div className="absolute top-[10%] right-0 w-[55%] h-[80%] bg-gradient-to-bl from-red-100/50 via-orange-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Typography Context Column */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-gray-900 leading-[1.15]">
              {t('features_page.hero_title', 'Take Control Of Your Day With Advanced Scheduling')}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl font-medium leading-relaxed">
              {t('features_page.hero_desc', 'Seamlessly Manage Appointments, Set Custom Availability, And Send Automated Reminders Designed For The Beauty And Selfcare Industry')}
            </p>
            <button 
              onClick={() => navigate("/register")}
              className="h-12 px-6 bg-[#FF1100] hover:bg-red-600 text-white text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-3 group transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-lg shadow-red-500/20 uppercase">
              <span>{t('features_page.get_started', 'Get Started Now')}</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          {/* Hero Video Media Column */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px] aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src={firstImage}
                alt="Take Control of Your Day"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Media Player Toggle Trigger Button Matrix Overlay */}
              <div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-black/15 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-6 h-6 fill-white stroke-none ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3-COLUMN CORE MANAGEMENT GRID ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {t('features_page.support_title', 'Supporting Every Business, At Every Stage')}
          </h2>
          <p className="text-sm text-gray-400 font-semibold max-w-2xl mx-auto leading-relaxed">
            {t('features_page.support_desc', 'Every Business Has Its Own Needs. Neoparlour Brings Booking, Payments, Teams, Reminders And More Into One Powerful Platform')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Staff Management */}
          <div className="bg-[#F5F6F8] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-[520px]">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">{t('features_page.staff_mgmt_title', 'Staff Management')}</h3>
              <p className="text-xs text-gray-400 font-medium leading-normal">{t('features_page.staff_mgmt_desc', 'Smart Business Management For Professionals')}</p>
            </div>
            <div className="mt-6 w-full h-[360px] flex items-end justify-center overflow-hidden">
              <img src={staffManagement} alt="Staff Management Interface" className="w-full h-full object-cover object-top rounded-t-2xl shadow-sm" />
            </div>
          </div>

          {/* Card 2: Analytics Review */}
          <div className="bg-[#F5F6F8] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-[520px]">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">{t('features_page.analytics_title', 'Analytics Review')}</h3>
              <p className="text-xs text-gray-400 font-medium leading-normal">{t('features_page.analytics_desc', 'Spend Less Time Managing And More Time Doing What You Do Best')}</p>
            </div>
            <div className="mt-6 w-full h-[360px] flex items-end justify-center overflow-hidden">
              <img src={analyticsReview} alt="Analytics Review Interface" className="w-full h-full object-cover object-top rounded-t-2xl shadow-sm" />
            </div>
          </div>

          {/* Card 3: Inventory Management */}
          <div className="bg-[#F5F6F8] rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-[520px]">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">{t('features_page.inventory_title', 'Inventory Management')}</h3>
              <p className="text-xs text-gray-400 font-medium leading-normal">{t('features_page.inventory_desc', 'Scale Faster With Customizable Solutions Built For Enterprise')}</p>
            </div>
            <div className="mt-6 w-full h-[360px] flex items-end justify-center overflow-hidden">
              <img src={inventoryManagement} alt="Inventory Management Interface" className="w-full h-full object-cover object-top rounded-t-2xl shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= DARK SCHEDULING ROW SECTION ================= */}
      <section className="w-full bg-[#520202] relative min-h-[480px] lg:min-h-[560px] flex items-center overflow-hidden">

        {/* Full-bleed background display graphic layer */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={schedulingMadeSimple}
            alt="Scheduling Showcase Background presentation mockups"
            className="w-full h-full object-cover object-center pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3f0000]/40 via-transparent to-transparent mix-blend-multiply" />
        </div>

        {/* Content Layout Boundary Layer placed directly above image layer */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="max-w-xl flex flex-col items-start text-left space-y-6">
            <h2 className="text-4xl sm:text-[54px] font-black tracking-tight text-white leading-[1.12]">
              {t('features_page.scheduling_title', 'Scheduling Made Simple')}
            </h2>
            <p className="text-sm sm:text-base text-gray-200 font-normal leading-relaxed max-w-md drop-shadow-sm">
              {t('features_page.scheduling_desc', 'Spend Less Time Managing Your Appointments And More Time Doing What You Love. With Neoparlour, Booking Appointments Is Fast, Flexible, And Totaly Stress-Free.')}
            </p>
            <button className="h-12 px-6 bg-[#FF1100] hover:bg-red-600 text-white text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-3 group transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-xl shadow-black/40 uppercase">
              <span>{t('features_page.get_started', 'Get Started Now')}</span>
              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center bg-transparent group-hover:translate-x-0.5 transition-transform">
                <svg className="w-2.5 h-2.5 fill-white stroke-none" viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Floating Play Trigger Toggle */}
        <div className="absolute top-1/2 left-[48%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <button className="w-[72px] h-[72px] rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer">
            <svg className="w-5 h-5 fill-white stroke-none ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </section>

      {/* ================= EASY INVOICES SECTION ================= */}
      <section className="w-full bg-[#F5F6F8] dark:bg-black py-20 lg:py-28">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Invoicing Stack Display Framework Graphic (Left) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-start">
              <div className="w-full max-w-[520px] aspect-[4/3] flex items-center justify-center">
                <img
                  src={easyInvoices}
                  alt="Effortless Invoicing Showcase"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Invoicing content block right alignment columns */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <span className="text-base font-extrabold text-[#FF1100] tracking-wide uppercase">
                {t('features_page.invoice_tag', 'Easy Invoices')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase">
                {t('features_page.invoice_title', 'Effortless Invoicing For Salons & Spas')}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-white font-medium leading-relaxed max-w-xl pt-2">
                {t('features_page.invoice_desc', "Handling Invoices Should Be Simple, But Many Salons And Spas Still Struggle With Manual Bills, Wrong Totals, And Messy Payment Tracking. Neoparlour's Software Is Built To Remove That Stress And Make Billing Feel Almost Automatic.")}
              </p>
            </div>

          </div>
        </div>
      </section>
      <SEOFooter />
    </div>
  );
};

export default Features;