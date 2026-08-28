import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { ShoppingCart } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

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
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.customer);
  const activeSalonId = location.state?.salonId || localStorage.getItem('activeSalonId');

  const handleAddToCart = (productId) => {
    if (!isAuthenticated) {
      toast.error("Please login to add products to cart.");
      navigate('/customer/login');
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const [groupedProducts, setGroupedProducts] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);

  // Navigation Profile Menu Drawer State Toggle
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

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
    const element = document.getElementById(`product-row-${categoryId}`);
    if (element) {
      element.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-[#131313] relative overflow-x-hidden">
 
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
                  id={`product-row-${groupName}`}
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
                      <div className="mt-3.5 pt-1 px-0.5 flex gap-2">
                        <button 
                          onClick={() => navigate('/customer/product-details', { state: { product } })}
                          disabled={product.stock === 0}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider transition uppercase ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-75'
                              : 'bg-[#FF0B01] text-white hover:bg-red-700 shadow-xs'
                          }`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                        </button>
                        {product.stock > 0 && (
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-[#FF0B01] transition border border-gray-200 cursor-pointer shrink-0"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
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
    </div>
  );
}

export default ProductSearch;