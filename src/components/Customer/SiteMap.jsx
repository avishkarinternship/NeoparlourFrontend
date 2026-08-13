import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOFooter from "../common/SEOFooter";

const Sitemap = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data structure matching the wireframe sections
  const sitemapData = [
    {
      title: "All Pages",
      items: [
        { name: "Testimonials", path: "/client-testimonials" }, 
        { name: "Support", path: "/support" },
        { name: "Help Centre", path: "/support" },
        { name: "Contact Us", path: "/support" },
        { name: "Security", path: "/security" },
        { name: "Partner With Us", path: "/partner-with-us" },
        { name: "About Us", path: "/about" },
        { name: "Offers", path: "/customer/offers" },
      ],
    },
    {
      title: "Features",
      items: [
        { name: "Appointment Management", path: "/features" },
        { name: "Membership", path: "/features" },
        { name: "Employee Management", path: "/features" },
        { name: "Add Package", path: "/features" },
        { name: "Customers Management", path: "/features" },
        { name: "Reports & Analytics", path: "/features" },
        { name: "Inventory Management", path: "/features" },
        { name: "Billing", path: "/features" },
      ],
    },
    {
      title: "Resources",
      items: [
        { name: "Blogs", path: "/blogs" },
        { name: "Case Studies", path: "/case-studies" },
        { name: "Videos", path: "/videos" },
      ],
    },
  ];

  const handleNavigate = (path, name, e) => {
    e.preventDefault();
    setSelectedItem(name);
    if (path) {
      setTimeout(() => {
        navigate(path);
      }, 150); // slight delay to show the toggle color
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased font-sans flex flex-col justify-between">
      
      {/* Main Content Wrapper */}
      <div className="py-12 px-4 flex-grow max-w-6xl w-full mx-auto">
        
        {/* Page Title */}
        <h1 className="text-3xl font-extrabold text-black text-center tracking-wide uppercase mb-10">
          Sitemap
        </h1>

        {/* Section Cards */}
        <div className="space-y-8">
          {sitemapData.map((section, sectionIdx) => (
            <div 
              key={sectionIdx} 
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 transition-all duration-200 hover:shadow-md"
            >
              {/* Card Section Header */}
              <h2 className="text-xl font-bold text-black mb-6 tracking-tight">
                {section.title}
              </h2>

              {/* Grid Items Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                {section.items.map((item, itemIdx) => {
                  const isActive = selectedItem === item.name;
                  return (
                    <div key={itemIdx} className="flex items-center min-h-[44px]">
                      {isActive ? (
                        /* Active item style matching the pill badge UI */
                        <button
                          onClick={(e) => handleNavigate(item.path || `/${item.name.toLowerCase().replace(/\s+/g, "-")}`, item.name, e)}
                          className="inline-flex items-center justify-center bg-red-600 text-white font-medium px-4 py-2 rounded-xl text-sm tracking-wide shadow-sm hover:bg-red-700 transition-colors w-full sm:w-auto text-left"
                        >
                          {item.name}
                        </button>
                      ) : (
                        /* Standard link state */
                        <button
                          onClick={(e) => handleNavigate(item.path || `/${item.name.toLowerCase().replace(/\s+/g, "-")}`, item.name, e)}
                          className="text-gray-500 font-normal text-sm hover:text-black transition-colors cursor-pointer block truncate text-left w-full"
                        >
                          {item.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div> 
            </div>
          ))}
        </div>
      </div>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200 mt-16">
        <SEOFooter />
      </div>

    </div>
  );
};

export default Sitemap;