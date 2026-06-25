import React from 'react';

import logoIcon from '../../assets/Neoparlour_logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#EAEAEA] border-t border-gray-300 w-full pt-14 pb-8 px-6 md:px-16 text-gray-900 font-sans tracking-tight">
      {/* Top Links Grid Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        
        {/* Identity Column */}
        <div className="flex items-start">
          <div className="flex items-center space-x-2.5">
            {/* Replaced inline <svg> with your imported local asset */}
            <img 
              src={logoIcon} 
              alt="NeoParlour Logo" 
              className="w-8 h-8 object-contain flex-shrink-0" 
            />
            <span className="text-xl font-bold text-gray-900">
              NeoParlour
            </span>
          </div>
        </div>
        
        {/* Navigation Category 1 */}
        <div>
          <h5 className="font-bold text-[15px] text-gray-900 mb-4">Company</h5>
          <ul className="space-y-3 text-[13px] font-semibold text-gray-800">
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Influencer Program</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Careers</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• About Us</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Partner With Us</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Buy Gift Card</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Blogs</a></li>
          </ul>
        </div>

        {/* Navigation Category 2 */}
        <div>
          <h5 className="font-bold text-[15px] text-gray-900 mb-4">Legal</h5>
          <ul className="space-y-3 text-[13px] font-semibold text-gray-800">
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Privacy Policy</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Terms Of Service</a></li>
          </ul>
        </div>

        {/* Navigation Category 3 */}
        <div>
          <h5 className="font-bold text-[15px] text-gray-900 mb-4">Contact</h5>
          <ul className="space-y-3 text-[13px] font-semibold text-gray-800">
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Whatsapp</a></li>
            <li><a href="#" className="hover:text-red-600 transition-colors duration-150">• Emails</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="max-w-7xl mx-auto border-t border-gray-400 pt-5 flex flex-col sm:flex-row items-center justify-between text-[13px] font-bold text-gray-500">
        <p className="tracking-wide">Copyright@Neospaceinfotech.Com</p>
        
        {/* Dynamic Brand Logo Platforms */}
        <div className="flex items-center space-x-3.5 mt-4 sm:mt-0">
          {/* Instagram Icon */}
          <a href="#" className="hover:opacity-80 transition-opacity">
            <svg className="w-[22px] h-[22px] text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          
          {/* Facebook Icon */}
          <a href="#" className="hover:opacity-80 transition-opacity">
            <svg className="w-[22px] h-[22px] text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;