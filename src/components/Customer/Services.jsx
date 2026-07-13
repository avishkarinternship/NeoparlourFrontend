import React from 'react';
import SEOFooter from '../common/SEOFooter';

const services = [
  {
    id: 1,
    title: 'Salon',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    title: 'Wellness & Spa',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    title: 'Nail & Lashes',
    image: 'https://images.unsplash.com/photo-1604654894610-df4906bf1a2a?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 4,
    title: 'Spa',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 5,
    title: 'Nail Salon',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 6,
    title: 'Skin Clinic',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
  },
];

export default function ServicesGrid() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between antialiased">
      
      {/* Main Content Body */}
      <section className="w-full bg-white py-16 px-4 md:px-8 font-sans text-gray-900 flex-grow">
        <div className="max-w-6xl mx-auto">
          
          {/* === HEADER SECTION === */}
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase block">
              - Services -
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
              NEOPARLOUR SERVICES
            </h2>
          </div>

          {/* === IMAGE GRID === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
              >
                {/* Background Image with slight hover effect */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark Linear Gradient Overlay for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Title Text aligned to the bottom left */}
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-wide drop-shadow-sm">
                    {service.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200">
        <SEOFooter />
      </div>

    </div>
  );
}