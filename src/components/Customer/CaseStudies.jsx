import React from 'react';
import SEOFooter from '../common/SEOFooter';

const caseStudiesData = [
  {
    id: 1,
    title: 'Apple Unisex Salon Success Story With Neoparlour',
    description: 'Apple Unisex Salon exclusively offers non-surgical clinic beauty services. Their commitment to quality is evident through the use of the best products and personalized customer treatment.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    title: 'Growth Journey of The Beauty Hub Aesthetic Clinic with Neoparlour?',
    description: 'Apple Unisex Salon exclusively offers non-surgical clinic beauty services. Their commitment to quality is evident through the use of the best products and personalized customer treatment.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    title: 'How Posh Beauty Take Care of their Clients and Staff, with Help from a Neoparlour?',
    description: 'Apple Unisex Salon exclusively offers non-surgical clinic beauty services. Their commitment to quality is evident through the use of the best products and personalized customer treatment.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 4,
    title: 'How Posh Beauty Take Care of their Clients and Staff, with Help from a Neoparlour?',
    description: 'Apple Unisex Salon exclusively offers non-surgical clinic beauty services. Their commitment to quality is evident through the use of the best products and personalized customer treatment.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 5,
    title: 'Growth Journey of The Beauty Hub Aesthetic Clinic with Neoparlour?',
    description: 'Apple Unisex Salon exclusively offers non-surgical clinic beauty services. Their commitment to quality is evident through the use of the best products and personalized customer treatment.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 6,
    title: 'Apple Unisex Salon Success Story With Neoparlour',
    description: 'Apple Unisex Salon exclusively offers non-surgical clinic beauty services. Their commitment to quality is evident through the use of the best products and personalized customer treatment.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between antialiased selection:bg-red-100">
      
      {/* === CORE CONTENT CONTAINER === */}
      <section className="w-full py-16 px-4 md:px-8 font-sans text-gray-900 flex-grow">
        <div className="max-w-7xl mx-auto">
          
          {/* === HEADER SECTION === */}
          <div className="text-center mb-14 space-y-2">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase block">
              - Case Studies -
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 uppercase">
              OUR LEARNINGS. YOUR RESOURCES.
            </h2>
          </div>

          {/* === CARDS GRID MATRIX === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudiesData.map((card, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                {/* Fixed Aspect Image Box */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Card Text Descriptions */}
                <div className="p-6 md:p-7 flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-normal">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200 mt-12">
        <SEOFooter />
      </div>

    </div>
  );
}