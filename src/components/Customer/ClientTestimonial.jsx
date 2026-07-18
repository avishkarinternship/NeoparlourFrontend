import React from 'react';
import Marquee from 'react-fast-marquee';
import SEOFooter from '../common/SEOFooter';

// Mock Data for the 14 Testimonials with corresponding card branding colors
const testimonials = [
  {
    id: 1,
    bgType: 'light-gold',
    logoText: 'BEAUTY SALON',
    logoSub: 'PROFESSIONAL HAIR SALON',
    quote: "Neoparlour has changed the way we run our salon! It handles everything from booking appointments to payroll and other tasks easily. It's affordable compared to other expensive software options.",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 2,
    bgType: 'gray',
    logoText: 'BEFORE & AFTER',
    logoSub: 'HAIR AND BODY CARE',
    quote: "It's affordable compared to other expensive software options that didn't fit our needs. The customer service is great, and the software is easy to use. There's nothing I don't like about Neoparlour-it's just great!",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 3,
    bgType: 'white-gold',
    logoText: 'TOP PRIORITY',
    logoSub: 'SPA SALON',
    quote: "Neoparlour has changed the way we run our salon! It handles everything from booking appointments to payroll and other tasks easily. The customer service is great, and the software is easy to use.",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 4,
    bgType: 'black',
    logoText: 'TOP QUALITY',
    logoSub: 'BARBER & SALON',
    quote: "Great software and amazing customer support. Our booking process has never been smoother, and client management is completely automated. Extremely satisfied!",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 5,
    bgType: 'gray',
    logoText: 'BEFORE & AFTER',
    logoSub: 'HAIR AND BODY CARE',
    quote: "The interface is very intuitive and my staff got hang of it in just one day. Payroll computation, which used to take hours, is now done in minutes.",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 6,
    bgType: 'black',
    logoText: 'TOP QUALITY',
    logoSub: 'BARBER & SALON',
    quote: "Neoparlour is highly affordable and packed with premium features. It fits our barbershop needs perfectly. We especially love the automatic reminders feature.",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 7,
    bgType: 'light-gold',
    logoText: 'BEAUTY SALON',
    logoSub: 'PROFESSIONAL HAIR SALON',
    quote: "An all-in-one package for modern salons. From inventory management to client billing, everything works seamlessly. The mobile app dashboard is a life saver.",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 8,
    bgType: 'white-gold',
    logoText: 'TOP PRIORITY',
    logoSub: 'SPA SALON',
    quote: "Our appointments have doubled since implementing NeoParlour's booking system. It's clean, fast, and does exactly what it promises.",
    author: 'Gururatna Sadavarte',
    role: 'CEO',
  },
  {
    id: 9,
    bgType: 'light-gold',
    logoText: 'GLAMOUR STUDIOS',
    logoSub: 'HAIR AND NAIL LOUNGE',
    quote: "The walk-in booking and WhatsApp notifications are phenomenal! Our clients always get their reminders, which has reduced our no-show rate by almost 80%. Highly recommended!",
    author: 'Aishwarya Patil',
    role: 'Salon Owner',
  },
  {
    id: 10,
    bgType: 'black',
    logoText: 'THE GENTLEMEN CO',
    logoSub: 'PREMIUM BARBER SHOP',
    quote: "Staff management and scheduling was a major headache before we found NeoParlour. Now my team can see their schedules in real-time and client feedback has been positive.",
    author: 'Rahul Deshmukh',
    role: 'Founder',
  },
  {
    id: 11,
    bgType: 'white-gold',
    logoText: 'AURA THERAPY',
    logoSub: 'WELLNESS & MASSAGE SPA',
    quote: "Excellent software! The POS billing system is extremely fast and integrates flawlessly with our inventory. We save hours of work every week.",
    author: 'Meera Sen',
    role: 'Spa Director',
  },
  {
    id: 12,
    bgType: 'gray',
    logoText: 'CUTS & BEYOND',
    logoSub: 'UNISEX FAMILY SALON',
    quote: "We've been using NeoParlour for 6 months and our revenue increased by 20% due to the easy appointment links and smart booking. Highly recommend!",
    author: 'Aditya Ranade',
    role: 'Operations Manager',
  },
  {
    id: 13,
    bgType: 'light-gold',
    logoText: 'ROYAL TOUCH',
    logoSub: 'BRIDAL & MAKEUP STUDIO',
    quote: "NeoParlour's customer support is top-notch! The package deals feature makes it incredibly easy to sell our seasonal bridal and pre-bridal packages.",
    author: 'Priyanka Shinde',
    role: 'Lead Stylist',
  },
  {
    id: 14,
    bgType: 'black',
    logoText: 'CROWN & MANE',
    logoSub: 'HAIR CLINIC & SALON',
    quote: "Clean interface, very intuitive dashboard, and powerful analytics. It gives us precise daily and monthly breakdown reports that help us plan our inventory.",
    author: 'Vikram Mehta',
    role: 'Managing Partner',
  },
];

export default function ClientTestimonial() {

  // Helper to get card header styles dynamically based on layout color type
  const getHeaderStyle = (type) => {
    switch (type) {
      case 'black':
        return 'bg-black text-[#cbb281]';
      case 'gray':
        return 'bg-[#f4f4f4] text-[#4d4d4d] border-b border-gray-100';
      case 'light-gold':
        return 'bg-white text-[#c9a054] border-b border-gray-100';
      case 'white-gold':
        return 'bg-white text-[#94743c] border-b border-gray-100';
      default:
        return 'bg-white text-gray-800';
    }
  };

  return (
    <div className="w-full bg-white text-gray-900 font-sans antialiased overflow-x-hidden">

      {/* ========================================================
          1. CLIENT TESTIMONIALS SECTION
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase block mb-2">
          - Client Testimonials -
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-12 text-gray-900">
          TRUSTED BY OVER 12000+ USERS
        </h2>

        {/* Endless Marquee Layout Wrapper */}
        <div className="w-full overflow-hidden">
          <Marquee
            gradient={false}
            speed={45}
            pauseOnHover={true}
            className="py-12 flex items-center"
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between text-left h-[26rem] w-[20rem] mx-4 shrink-0 cursor-pointer"
              >
                {/* Dynamic Branding Card Header */}
                <div className={`h-28 flex flex-col items-center justify-center text-center p-6 ${getHeaderStyle(item.bgType)}`}>
                  <div className="font-serif font-bold text-sm tracking-widest leading-none">
                    {item.logoText}
                  </div>
                  <div className="text-[8px] uppercase tracking-[0.2em] mt-1.5 opacity-80">
                    {item.logoSub}
                  </div>
                </div>

                {/* Card Body and Text */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed font-normal mb-6">
                    {item.quote}
                  </p>

                  {/* Author Info block right aligned */}
                  <div className="text-right mt-auto">
                    <h4 className="font-bold text-xs text-gray-900 tracking-wide">
                      {item.author}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ========================================================
          2. DOWNLOAD MOBILE APP CTA SECTION
         ======================================================== */}
      <section className="w-full bg-gradient-to-b from-[#fff5f5] to-[#fcf1f1] pt-16 lg:pt-24 border-t border-red-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Action Links & Texts */}
          <div className="lg:col-span-6 space-y-6 text-left pb-12 lg:pb-24">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Download NeoParlour <br />
              Mobile App
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-lg font-medium">
              The NeoParlour app is the Quickest, Easiest way to book and keep track of your appointments.
            </p>

            {/* Badges Layout */}
            <div className="flex flex-wrap gap-4 pt-2">
              {/* Apple App Store */}
              <a
                href="#app-store"
                className="bg-black hover:bg-gray-900 text-white rounded-lg px-4 py-2 flex items-center gap-3 transition-colors duration-200 border border-gray-800"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.17c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.78 1.42-.59.68-1.11 1.79-.97 2.87 1.06.08 2.13-.51 2.78-1.3z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider block text-gray-400">GET IT ON</span>
                  <span className="text-sm font-bold tracking-tight block mt-0.5">App Store</span>
                </div>
              </a>

              {/* Google Play Store */}
              <a
                href="#play-store"
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 flex items-center gap-3 transition-colors duration-200 shadow-md shadow-red-200"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M5,3.14V20.86c0,0.51,0.4,0.86,0.88,0.86a0.93,0.93,0.01,0,0,.43-1.09L16.43,12l-10.1-8.73A0.91,0.91,0,0,0,5.88,2.28,0.89,0.89,0,0,0,5,3.14ZM17.65,11l2.84-1.63a0.89,0.89,0,0,0,0-1.56L17.65,6.17,14,9.33Zm-2.31-2.1L6.71,3.58l8.63,5.32Z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider block text-red-200">GET IT ON</span>
                  <span className="text-sm font-bold tracking-tight block mt-0.5">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Device Previews & Layout Alignment */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-end w-full">
            <div className="flex items-end space-x-[-20px] sm:space-x-[-40px] translate-y-[20px] md:translate-y-[40px]">

              {/* Leftmost Phone (Offset) */}
              <div className="w-[140px] sm:w-[200px] md:w-[220px] rounded-t-[32px] overflow-hidden shadow-[0_-10px_35px_rgba(0,0,0,0.12)] border-x-[4px] border-t-[4px] border-gray-900 bg-white">
                <img
                  src= "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400" 
                  alt="NeoParlour app screen layout 1"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Center Main Focal Phone */}
              <div className="w-[160px] sm:w-[220px] md:w-[250px] rounded-t-[36px] overflow-hidden shadow-[0_-15px_45px_rgba(0,0,0,0.18)] border-x-[6px] border-t-[6px] border-gray-900 bg-white z-10 relative transform translate-y-[-15px]">
                <img
                  src="https://images.unsplash.com/photo-1596558450268-9c2a420622a5?auto=format&fit=crop&q=80&w=400"
                  alt="NeoParlour dashboard control view main"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Rightmost Phone */}
              <div className="w-[140px] sm:w-[200px] md:w-[220px] rounded-t-[32px] overflow-hidden shadow-[0_-10px_35px_rgba(0,0,0,0.12)] border-x-[4px] border-t-[4px] border-gray-900 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=400"
                  alt="NeoParlour appointment tracking screen"
                  className="w-full h-auto object-cover"
                />
              </div>

            </div>
          </div>

        </div>
      </section>
      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200 mt-16">
        <SEOFooter />
      </div>
    </div>
  );
}