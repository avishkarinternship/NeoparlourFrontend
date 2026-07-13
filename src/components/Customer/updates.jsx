import React, { useState } from "react";
import SEOFooter from "../common/SEOFooter";

const Updates = () => {
  // State to manage the active city tab in the footer matrix
  const [activeCity, setActiveCity] = useState("Pune");

  const cities = ["Pune", "Mumbai", "Bangalore", "Chennai", "Delhi"];

  // Generate 32 mock salon links per city for the SEO link grid matrix
  const currentCityLinks = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    label: `Best Salons In ${activeCity}`,
    url: `#`,
  }));

  return (
    <div className="min-h-screen bg-white antialiased font-sans flex flex-col justify-between">
      
      {/* =========================================================================
          MAIN CONTENT SECTION
          ========================================================================= */}
      <div className="py-12 px-4 max-w-7xl w-full mx-auto flex-grow">
        
        {/* Page Section Headers */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 block mb-2">
            - Updates -
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight uppercase">
            Neoparlour Updates
          </h1>
        </div>

        {/* Content Card Wrapper */}
        <div className="max-w-md">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-6">
              Updates 2026
            </h2>

            {/* Inner Feature List */}
            <div className="space-y-6">
              
              {/* Feature Item 1 */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Tip Amount & Tax On Tip
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  A New Option Is Added To Include The Tip Amount In The Invoice Total. 
                  Clients Can Also Choose Whether To Apply VAT On The Tip.
                </p>
              </div>

              {/* Feature Item 2 */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  New Referral Program
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-normal">
                  Elevate Your Business To New Heights With Salonist's Innovative Referral Program. 
                  Empower Every Client To Effortlessly Refer Your Business To Others By Sharing 
                  Their Mobile Number Or Referral Code. This Strategy Is Designed To Amplify Your 
                  Business Growth And Success.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
<SEOFooter />
    </div>
  );
};

export default Updates;