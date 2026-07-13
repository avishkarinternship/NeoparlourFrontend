import React from "react";
import SEOFooter from "../common/SEOFooter";

const Sitemap = () => {
  // Mock data structure matching the wireframe sections
  const sitemapData = [
    {
      title: "All Pages",
      items: [
        { name: "Testimonials", isActive: true }, // highlighted red badge
        { name: "Support", isActive: false },
        { name: "Help Centre", isActive: false },
        { name: "Contact Us", isActive: false },
        { name: "Security", isActive: false },
        { name: "Partner With Us", isActive: false },
        { name: "About Us", isActive: false },
        { name: "Offers", isActive: false },
      ],
    },
    {
      title: "Features",
      items: [
        { name: "Appointment Management", isActive: false },
        { name: "Membership", isActive: false },
        { name: "Employee Management", isActive: false },
        { name: "Add Package", isActive: false },
        { name: "Customers Management", isActive: false },
        { name: "Reports & Analytics", isActive: false },
        { name: "Inventory Management", isActive: false },
        { name: "Billing", isActive: false },
      ],
    },
    {
      title: "Resources",
      items: [
        { name: "Blogs", isActive: false },
        { name: "Case Studies", isActive: false },
        { name: "Videos", isActive: false },
      ],
    },
  ];

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
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center min-h-[44px]">
                    {item.isActive ? (
                      /* Active item style matching the pill badge UI */
                      <a
                        href={`/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="inline-flex items-center bg-red-600 text-white font-medium px-4 py-2 rounded-xl text-sm tracking-wide shadow-sm hover:bg-red-700 transition-colors w-full sm:w-auto"
                      >
                        {item.name}
                      </a>
                    ) : (
                      /* Standard link state */
                      <a
                        href={`/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-gray-500 font-normal text-sm hover:text-black transition-colors cursor-pointer block truncate"
                      >
                        {item.name}
                      </a>
                    )}
                  </div>
                ))}
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