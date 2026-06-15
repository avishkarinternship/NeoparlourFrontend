import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Footer from './Layouts/Footer';
import SearchNavBar from './Layouts/SearchNavBar';

// Importing your local assets
import productOne from '../../assets/Customer/ProductSearch/product_one.jpg';
import productTwo from '../../assets/Customer/ProductSearch/product_two.jpg';
import productThree from '../../assets/Customer/ProductSearch/product_three.jpg';
import productFour from '../../assets/Customer/ProductSearch/product_four.jpg';
import productFive from '../../assets/Customer/ProductSearch/product_five.jpg';
import productSix from '../../assets/Customer/ProductSearch/product_five.jpg';

const ProductSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeSalonId = location.state?.salonId || localStorage.getItem('activeSalonId');

  const [groupedProducts, setGroupedProducts] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);

  // Navigation Profile Menu Drawer State Toggle
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Refs dynamically managed for each category horizontal scroll row
  const rowRefs = useRef({});

  // Specific catalog item details using your local structured image assets
  const catalogProducts = [
    {
      brand: 'Necessaire',
      name: 'Body Lotion Moisturizer',
      volume: '100ml',
      price: '₹ 470.00',
      rating: '4.6',
      image: productOne,
      isActiveBtn: true
    },
    {
      brand: 'Ecocradle',
      name: 'Complete Care Hair Serum',
      volume: '50ml',
      price: '₹ 500.00',
      rating: '4.6',
      image: productTwo,
      isActiveBtn: false
    },
    {
      brand: 'Hyphen 18%',
      name: 'Brightening + 20% Collagen Face Serum',
      volume: '50ml',
      price: '₹ 500.00',
      rating: '4.6',
      image: productThree,
      isActiveBtn: false
    },
    {
      brand: 'wiss Beauty',
      name: 'Cream It Up Blush',
      volume: '50ml',
      price: '₹ 225.00',
      rating: '4.6',
      image: productFour, 
      isActiveBtn: false
    },
    {
      brand: 'Fixer Spray for',
      name: 'Face Makeup',
      volume: '50ml',
      price: '₹ 236.00',
      rating: '4.6',
      image: productFive,
      isActiveBtn: false
    },
    {
      brand: 'Fixer Spray for',
      name: 'Face Makeup',
      volume: '50ml',
      price: '₹ 235.00',
      rating: '4.6',
      image: productSix,
      isActiveBtn: false
    },
  ];

  useEffect(() => {
    const fetchSalonProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await axiosInstance.get('/products/grouped', {
          params: { page: 0, size: 8 }
        });
        const data = res.data || {};
        const cleanGroups = {};
        Object.keys(data).forEach(key => {
          const products = data[key];
          if (products && products.length > 0) {
            const groupName = key.trim() === "" ? "Other Products" : key;
            cleanGroups[groupName] = products;
          }
        });
        setGroupedProducts(cleanGroups);
      } catch (error) {
        console.error('[ProductSearch] Error fetching salon products:', error);
        // Fallback: build mock group using catalogProducts
        const mockGroups = {
          "SKIN CARE": catalogProducts.slice(0, 3).map((p, idx) => ({
            id: idx + 101,
            name: p.name,
            price: parseFloat(p.price.replace(/[^\d.]/g, '')),
            description: p.brand,
            imageUrl: null
          })),
          "HAIR PRODUCTS": catalogProducts.slice(3, 6).map((p, idx) => ({
            id: idx + 104,
            name: p.name,
            price: parseFloat(p.price.replace(/[^\d.]/g, '')),
            description: p.brand,
            imageUrl: null
          }))
        };
        setGroupedProducts(mockGroups);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchSalonProducts();
  }, []);

  const getProductImageSrc = (imageUrl, fallbackImg) => {
    if (!imageUrl) return fallbackImg;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const base = axiosInstance.defaults.baseURL || 'https://sb.neoparlour.com/api';
    let cleanedUrl = imageUrl;
    if (cleanedUrl.startsWith('/api')) {
        const domain = base.replace(/\/api$/, '');
        return `${domain}${cleanedUrl}`;
    }
    if (cleanedUrl.startsWith('api')) {
        const domain = base.replace(/\/api$/, '');
        return `${domain}/${cleanedUrl}`;
    }
    return `${base}${cleanedUrl.startsWith('/') ? '' : '/'}${cleanedUrl}`;
  };

  // Horizontal click-to-scroll execution helper
  const handleScrollRight = (categoryId) => {
    const element = rowRefs.current[categoryId];
    if (element) {
      element.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-[#131313] relative overflow-x-hidden">
      
      <SearchNavBar />
 
      {/* --- CORE PRODUCT SHOWCASE MATRIX --- */}
      <main className="space-y-12 py-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        {Object.keys(groupedProducts).length > 0 ? (
          Object.keys(groupedProducts).map((groupName, idx) => (
            <section key={groupName} className="space-y-5 relative">
              {/* Context Headline Block */}
              <div className="flex items-end justify-between border-b border-gray-100 pb-2">
                <div>
                  <h2 className="font-poppins text-lg font-extrabold uppercase tracking-wide text-[#1A1A1A]">
                    {groupName}
                  </h2>
                  {idx === 0 && (
                    <p className="mt-0.5 text-xs font-semibold text-[#8D8D8D] capitalize tracking-wide">
                      Products Page
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleScrollRight(groupName)}
                  className="text-xs font-bold text-[#131313] hover:text-[#FF0B01] hover:underline transition uppercase tracking-wider"
                >
                  See More
                </button>
              </div>

              {/* Matrix Viewport Wrapper with Context Navigation Trigger Button */}
              <div className="relative group/carousel">
                {/* Continuous Horizontal Grid Carousel */}
                <div 
                  ref={(el) => (rowRefs.current[groupName] = el)}
                  className="hide-scrollbar flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth"
                >
                  {groupedProducts[groupName].map((product, idx) => (
                    <div key={product.id || idx} className="w-[185px] shrink-0 bg-white rounded-2xl border border-neutral-100 p-2.5 shadow-sm hover:shadow-md transition duration-200 snap-start flex flex-col justify-between">
                      
                      <div>
                        {/* Aspect Locked Media Image Element with Absolute Rating Badge Overlay */}
                        <div className="h-[210px] w-full rounded-xl bg-neutral-100 relative overflow-hidden group-hover:opacity-95 transition flex items-center justify-center">
                          {product.imageUrl ? (
                            <img 
                              src={getProductImageSrc(product.imageUrl)} 
                              alt={`${product.name} packaging representation`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 space-y-1">
                              <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                              <span className="text-[10px] font-semibold tracking-wide uppercase">No Image</span>
                            </div>
                          )}
                          {/* Rating Star Badge Asset Component Layer */}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-neutral-200/40">
                            <svg className="w-3 h-3 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span className="text-[10px] font-bold text-neutral-800 leading-none">4.5</span>
                          </div>
                        </div>
                        
                        {/* Metadata Blocks */}
                        <div className="mt-3 space-y-1 text-left px-1">
                          <h3 className="text-xs font-bold text-neutral-900 truncate leading-tight">
                            {product.name || 'Product'}
                          </h3>
                          <p className="text-[11px] text-neutral-400 font-medium truncate leading-tight h-4">
                            {product.description || 'Premium Formulation'}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <p className="text-sm font-extrabold text-neutral-900">
                              ₹ {product.price}
                            </p>
                            {product.stock !== undefined && product.stock !== null && (
                              <p className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${product.stock === 0 ? 'text-red-500 font-bold bg-red-50' : 'text-neutral-400 font-semibold bg-neutral-50'}`}>
                                {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Action Trigger Button */}
                      <div className="mt-3.5 pt-1 px-0.5">
                        <button 
                          onClick={() => navigate('/customer/product-details', { state: { product } })}
                          disabled={product.stock === 0}
                          className={`w-full py-2 rounded-lg text-xs font-bold tracking-wider transition uppercase ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-75'
                              : 'bg-[#FF0B01] text-white hover:bg-red-700 shadow-xs'
                          }`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Slider Next View Trigger Chevron Button Action */}
                <button 
                  onClick={() => handleScrollRight(groupName)}
                  className="absolute right-[-18px] top-1/2 -translate-y-1/2 bg-white rounded-full p-2.5 shadow-md border border-neutral-200 text-neutral-800 hover:text-black opacity-0 group-hover/carousel:opacity-100 transition z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </section>
          ))
        ) : productsLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-[#FF0B01] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">
            No products found.
          </div>
        )}
      </main>

      {/* --- FOOTER COMPONENT MAPPING --- */}
      <Footer />
    </div>
  );
}

// --- HELPER INLINE SUBCOMPONENTS ---

function FooterLinkGroup({ title, links }) {
  return (
    <div className="flex flex-col">
      <h4 className="text-base font-bold capitalize text-black mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link, idx) => (
          <li key={idx} className="flex items-start text-xs font-medium text-[#505050] hover:text-black transition cursor-pointer select-none">
            <span className="mr-2 text-[10px] text-[#505050]/70">•</span>
            <span>{link}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NeoLogoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M50.815 0.71C51.524 5.928 50.204 10.244 46.635 13.679 42.628 17.538 38.473 21.241 34.405 25.038c-.508.472-.775.503-1.253-.021-1.16-1.275-2.352-2.518-3.595-3.703-.58-.556-.477-.845.062-1.333 6.42-5.815 12.82-11.657 19.225-17.494.596-.54 1.192-1.07 1.978-1.773z" fill="#878787" />
      <path fillRule="evenodd" clipRule="evenodd" d="M45.068 28.004c-3.868-2.402-8.542-2.397-12.317-.01C25.324 20.499 17.918 12.995 10.527 5.464 8.791 3.687 7.132 1.83 5.432 0c-.267.299-.344.341-.354.399-.837 4.998-.093 9.576 3.528 13.336 1.895 1.966 3.873 3.854 5.804 5.784 2.625 2.611 5.25 5.223 7.874 7.835 2.959 3.325 5.691 6.393 8.537 9.586.344-.855.55-1.458.817-2.025 1.941-4.064 6.79-5.773 10.775-3.812 2.887 1.421 4.747 4.49 4.495 7.689-.262 3.366-1.972 5.831-5.11 7.048-3.23 1.248-6.281.634-8.644-1.925-4.12-4.46-8.059-9.09-12.126-13.6-2.656-2.953-6.046-4.39-9.996-4.018-5.362.509-9.44 4.159-10.693 9.272C-1.196 40.453.863 45.687 5.06 48.414c4.448 2.895 9.723 2.716 14.088-.635 1.1-.85 1.829-1.023 2.553.23 0 0 4.294 2.56 7.314 2.22-3.205-3.624-6.179-6.98-9.255-10.468-.344.876-.545 1.495-.822 2.072-1.921 3.933-6.39 5.606-10.396 3.912-3.826-1.62-5.783-6.078-4.406-10.053 1.977-5.748 9.342-7.269 13.549-2.701 4.067 4.41 7.925 9.014 11.977 13.44 3.23 3.53 7.293 4.757 11.936 3.561 4.833-1.243 8.397-5.26 8.9-10.043.54-5.134-1.36-9.214-5.762-11.946zM27.138 28.664c-.776.08-1.526-.686-1.547-1.499-.02-.792.719-1.547 1.495-1.537.79.01 1.546.771 1.479 1.563-.072.876-.596 1.39-1.438 1.474z" fill="#EF3E23" />
    </svg>
  );
}

export default ProductSearch;