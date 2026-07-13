import React, { useState } from 'react';

export default function SEOFooter() {
  // Available cities for the tab selection
  const cities = ['Pune', 'Mumbai', 'Bangalore', 'Chennai', 'Delhi'];
  
  // Track the currently selected city (Defaults to Pune)
  const [selectedCity, setSelectedCity] = useState('Pune');

  // Generate an 8-column layout structure filled with 8 links per column
  // total 64 links dynamically populated based on the selected city state
  const totalColumns = 8;
  const linksPerColumn = 8;
  
  const linkText = `Best Salons In ${selectedCity}`;

  return (
    <div className="w-full bg-[#eeeeee] py-12 px-6 md:px-12 font-sans selection:bg-gray-300 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto space-y-10">
        
        {/* === CITY SELECTOR TABS === */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-gray-300 pb-4">
          {cities.map((city) => {
            const isActive = selectedCity === city;
            return (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`text-sm font-bold tracking-wide transition-all relative pb-2 ${
                  isActive 
                    ? 'text-red-600' 
                    : 'text-gray-900 hover:text-red-500'
                }`}
              >
                {city}
                {/* Active Underline Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* === LINK FARM GRID === */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-x-6 gap-y-8">
          {Array.from({ length: totalColumns }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col space-y-2.5">
              <ul className="space-y-2.5">
                {Array.from({ length: linksPerColumn }).map((_, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={`#${linkText.toLowerCase().replace(/\s+/g, '-')}-${colIdx}-${linkIdx}`}
                      className="text-xs font-normal text-gray-500 hover:text-red-600 hover:underline transition-colors duration-150 block truncate"
                      title={linkText}
                    >
                      {linkText}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}