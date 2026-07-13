import React, { useState } from 'react';
import SEOFooter from '../common/SEOFooter';

export default function Videos() {
  // Playlist tracking state to allow interactive selection
  const [activeVideoId, setActiveVideoId] = useState(1);

  const steps = [
    { id: 1, title: 'Set up your NeoParlour account in minutes.' },
    { id: 2, title: 'Add essential business details smoothly.' },
    { id: 3, title: 'Create and customize your services.' },
    { id: 4, title: 'Onboard your team effortlessly.' },
    { id: 5, title: 'Schedule shifts and manage availability.' },
  ];

  const playlist = [
    { id: 1, title: 'Getting Started with Neoparlour' },
    { id: 2, title: 'Create your Account' },
    { id: 3, title: 'Create your Services/Package' },
    { id: 4, title: 'Add your Staff' }, 
    { id: 5, title: 'Schedule Appointments' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between antialiased">
      
      {/* === MAIN CONTENT BODY === */}
      <div className="w-full text-gray-900 font-sans px-4 py-12 md:py-20 selection:bg-red-200 flex-grow">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* === LEFT COLUMN: CONTENT === */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Main Headers */} 
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-none">
                GETTING STARTED <br />
                WITH <span className="text-red-600">NEOPARLOUR</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium max-w-xl">
                Everything you to kickstart a business journey with NeoParlour.
              </p>
            </div>
   
            {/* Overview Section */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                Overview
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl">
              Welcome to NeoParlour, We’ll guide you step-by-step to manage your business operations. Learn to set up your profile, manage appointments, and easily track inventory. Discover how to create services, onboard your team, and schedule appointments easily. NeoParlour is designed to help grow your business without stress.              </p>
            </div>

            {/* Checklist Feature Section */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                Learn How You Can:
              </h3>
              <ul className="space-y-3.5">
                {steps.map((step) => (
                  <li key={step.id} className="flex items-start gap-3">
                    {/* Styled Checkmark Circle matching Red Branding */}
                    <div className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shadow-sm shadow-red-200">
                      <svg 
                        className="w-3 h-3 text-white stroke-[3]" 
                        fill="none"  
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-700">
                      {step.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>  

          {/* === RIGHT COLUMN: MEDIA PLAYER & PLAYLIST === */}
          <div className="lg:col-span-5 space-y-6 w-full">
               
            {/* Main Video Hero Card */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-900 group">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800" 
                alt="Neoparlour app tutorial interface preview" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
              />
              
              {/* Blurred Glass Backing & Translucent Play Button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <button 
                  aria-label="Play Tutorial Video"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl"
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tutorial Playlist Row Buttons */}
            <div className="space-y-3">
              {playlist.map((item) => {
                const isActive = item.id === activeVideoId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveVideoId(item.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 ${
                      isActive 
                        ? 'border-red-600 bg-red-50/40 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Inline Play Icon Indicator */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isActive ? 'border-red-600 bg-red-600 text-white' : 'border-gray-900 text-gray-900'
                    }`}>
                      <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    
                    <span className={`text-sm md:text-base font-semibold truncate ${
                      isActive ? 'text-red-700' : 'text-gray-800'
                    }`}>
                      {item.title}
                    </span>
                  </button>  
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200">
        <SEOFooter />
      </div>

    </div>
  );
}