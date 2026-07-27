import React from 'react';
import { Gift } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import SEOFooter from '../common/SEOFooter';

export default function Offers() {
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-[80vh] flex flex-col justify-between font-sans transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex-grow flex items-center justify-center p-6">
        <div className={`w-full max-w-lg rounded-3xl p-10 text-center shadow-2xl transition-all duration-300 ${isDark ? 'bg-zinc-900/90 border border-zinc-800' : 'bg-white border border-gray-100'}`}>
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <Gift className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight uppercase">
            Exclusive Offers
          </h1>
          <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-widest">
            Coming Soon!
          </h2>
          <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            We're currently working on bringing you the best deals and exclusive packages for your favorite salon and spa services. Stay tuned for amazing discounts!
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide uppercase transition-colors shadow-lg shadow-red-600/20 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
      
      {/* Global SEO Footer */}
      <div className={`w-full border-t ${isDark ? 'border-zinc-900 bg-black' : 'border-gray-200 bg-white'}`}>
        <SEOFooter />
      </div>
    </div>
  ); 
}
