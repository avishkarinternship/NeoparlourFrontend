import React, { useState } from 'react';

export default function SEOFooter() {
  const cities = ['Pune', 'Mumbai', 'Bangalore', 'Chennai', 'Delhi'];
  const [selectedCity, setSelectedCity] = useState('Pune');

  // Neighborhood mapping
  const cityAreas = {
    pune: ['Baner', 'Wakad', 'Kothrud', 'Aundh', 'Hinjewadi', 'Viman Nagar', 'Kalyani Nagar', 'Koregaon Park'],
    mumbai: ['Bandra', 'Andheri', 'Juhu', 'Colaba', 'Worli', 'Borivali', 'Thane', 'Navi Mumbai'],
    bangalore: ['Koramangala', 'Indiranagar', 'Jayanagar', 'Whitefield', 'HSR Layout', 'Marathahalli', 'Yelahanka', 'JP Nagar'],
    chennai: ['Adyar', 'Velachery', 'T Nagar', 'Nungambakkam', 'Anna Nagar', 'Mylapore', 'OMR', 'Tambaram'],
    delhi: ['Connaught Place', 'Saket', 'Karol Bagh', 'Vasant Kunj', 'Rajouri Garden', 'Dwarka', 'Greater Kailash', 'Lajpat Nagar']
  };

  const services = [
    { name: 'Hair Spa', slug: 'hair-spa' },
    { name: 'Hair Cut', slug: 'hair-cut' },
    { name: 'Facial', slug: 'facial' },
    { name: 'Bridal Makeup', slug: 'bridal-makeup' },
    { name: 'Hair Styling', slug: 'hair-styling' },
    { name: 'Hair Coloring', slug: 'hair-coloring' },
    { name: 'Shaving & Grooming', slug: 'shaving' },
    { name: 'Massage Therapies', slug: 'massage' }
  ];

  const categories = [
    { name: 'Luxury Salons', slug: 'luxury' },
    { name: 'Top Rated Salons', slug: 'top-rated' },
    { name: 'Unisex Salons', slug: 'unisex' },
    { name: 'Hair Salons', slug: 'hair' },
    { name: 'Beauty Parlours', slug: 'beauty-parlour' },
    { name: 'Bridal Studios', slug: 'bridal' },
    { name: 'Massage Centers', slug: 'massage' },
    { name: 'Nails Salons', slug: 'nails' }
  ];

  const currentAreas = cityAreas[selectedCity.toLowerCase()] || [];

  return (
    <div className="w-full bg-[#111] text-gray-400 py-16 px-6 md:px-12 font-sans border-t border-zinc-800">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* === TITLE & DESCRIPTION === */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white tracking-wider uppercase">Local Beauty Salons Directories</h2>
          <p className="text-xs text-zinc-500 max-w-2xl">
            NeoParlour helps you find the best salons, hair spas, makeup studios and wellness centres in your city. Select your city to explore locations, services, and rates.
          </p>
        </div>

        {/* === CITY SELECTOR TABS === */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-zinc-800 pb-4">
          {cities.map((city) => {
            const isActive = selectedCity === city;
            return (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`text-sm font-extrabold tracking-widest uppercase transition-all relative pb-2 ${
                  isActive 
                    ? 'text-red-500' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {city}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* === LINK FARMS === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
          
          {/* Column 1: Areas */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-red-500 pl-2">
              Popular Areas in {selectedCity}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {currentAreas.map((area) => (
                <li key={area}>
                  <a
                    href={`/salons/${selectedCity.toLowerCase()}/${area.toLowerCase()}`}
                    className="text-zinc-400 text-xs font-semibold hover:text-red-500 hover:underline transition-colors block py-0.5"
                  >
                    Best Salons in {area}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-red-500 pl-2">
              Services in {selectedCity}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {services.map((srv) => (
                <li key={srv.slug}>
                  <a
                    href={`/salons/${selectedCity.toLowerCase()}?service=${srv.slug}`}
                    className="text-zinc-400 text-xs font-semibold hover:text-red-500 hover:underline transition-colors block py-0.5"
                  >
                    {srv.name} in {selectedCity}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Salon Types */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-red-500 pl-2">
              Salon Types in {selectedCity}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <a
                    href={`/salons/${selectedCity.toLowerCase()}?type=${cat.slug}`}
                    className="text-zinc-400 text-xs font-semibold hover:text-red-500 hover:underline transition-colors block py-0.5"
                  >
                    {cat.name} in {selectedCity}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-[10px] text-zinc-600 font-medium text-center pt-8 border-t border-zinc-900">
          © {new Date().getFullYear()} NeoParlour Technologies Private Limited. All Rights Reserved.
        </div>

      </div>
    </div>
  );
}