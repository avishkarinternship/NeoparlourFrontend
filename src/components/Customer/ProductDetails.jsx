import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { 
  Plus, 
  Minus,
  ArrowRight,
  Star,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.customer);
  const productState = location.state?.product || null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add products to cart.");
      navigate('/customer/login');
      return;
    }
    if (product) {
      dispatch(addToCart({ productId: product.id, quantity }));
    }
  };

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryId = queryParams.get('id');
  const productId = location.state?.productId || productState?.id || (queryId ? parseInt(queryId, 10) : null);

  const [productData, setProductData] = useState({
    product: productState,
    loading: false,
    error: null,
    activeImage: null
  });

  const { product, loading, error, activeImage } = productData;

  useEffect(() => {
    if (productId) {
      setProductData(prev => ({ ...prev, loading: true }));
      axiosInstance.get(`/products/${productId}`)
        .then(res => {
          setProductData(prev => ({
            ...prev,
            product: res.data,
            activeImage: res.data?.imageUrl || prev.activeImage,
            loading: false
          }));
        })
        .catch(err => {
          console.error("Failed to fetch product details:", err);
          setProductData(prev => ({
            ...prev,
            error: "Failed to fetch product details.",
            loading: false
          }));
        });
    }
  }, [productId]);

  useEffect(() => {
    if (productState?.imageUrl && !activeImage) {
      setProductData(prev => ({ ...prev, activeImage: productState.imageUrl }));
    }
  }, [productState]);

  const allImages = useMemo(() => {
    const images = [];
    if (product?.imageUrl) {
      images.push(product.imageUrl);
    }
    if (product?.additionalImageUrls && Array.isArray(product.additionalImageUrls)) {
      product.additionalImageUrls.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    return images;
  }, [product]);

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
  // State Management Hooks
  const [quantity, setQuantity] = useState(1);
  
  const [recommendations, setRecommendations] = useState({
    list: [],
    loading: false
  });

  const { list: otherProducts, loading: otherProductsLoading } = recommendations;

  // Checkout Modal State
  const [checkout, setCheckout] = useState({
    isOpen: false,
    product: null,
    loading: false
  });

  const { isOpen: isOrderModalOpen, product: checkoutProduct, loading: orderLoading } = checkout;

  const customerProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('customerProfile')) || {};
    } catch {
      return {};
    }
  }, []);

  const customerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('customerUser')) || {};
    } catch {
      return {};
    }
  }, []);

  const customerId = customerProfile.id || customerUser.id || 1;
  const customerName = customerProfile.fullName || customerProfile.name || customerUser.fullName || customerUser.name || "Customer";
  const customerPhone = customerProfile.phone || customerProfile.mobile || customerUser.phone || customerUser.mobile || "";

  const orderPayload = useMemo(() => {
    if (!checkoutProduct || !checkoutProduct.product) return null;
    const { product: prod, quantity: qty } = checkoutProduct;
    const finalPrice = prod.discountPrice && prod.discountPrice < prod.price ? prod.discountPrice : prod.price;
    return {
      customerId,
      customerName,
      customerMobile: customerPhone,
      salonId: prod.salonId || 1,
      totalAmount: finalPrice * qty,
      status: "ordered",
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          price: finalPrice,
          productImageUrl: prod.imageUrl || null
        }
      ]
    };
  }, [checkoutProduct, customerId, customerName, customerPhone]);

  const pricingBreakdown = useMemo(() => {
    if (!checkoutProduct || !checkoutProduct.product) return null;
    const { product: prod, quantity: qty } = checkoutProduct;
    const originalUnitPrice = prod.price;
    const finalUnitPrice = prod.discountPrice && prod.discountPrice < prod.price ? prod.discountPrice : prod.price;
    
    const originalTotal = originalUnitPrice * qty;
    const finalTotal = finalUnitPrice * qty;
    const discountAmount = originalTotal - finalTotal;

    return {
      originalTotal,
      finalTotal,
      discountAmount,
      hasDiscount: discountAmount > 0
    };
  }, [checkoutProduct]);

  const handlePlaceOrder = async () => {
    if (!orderPayload) return;
    setCheckout(prev => ({ ...prev, loading: true }));
    try {
      const res = await axiosInstance.post('/orders', orderPayload);
      toast.success('Order placed successfully!');
      setCheckout(prev => ({ ...prev, isOpen: false }));
      navigate('/customer/order-success', {
        state: {
          order: res.data,
          product: checkoutProduct.product
        }
      });
    } catch (err) {
      console.error('Failed to place order:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckout(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Reference hook to target the horizontal slider DOM node
  const carouselRef = useRef(null);

  useEffect(() => {
    if (product?.salonId) {
      setRecommendations(prev => ({ ...prev, loading: true }));
      axiosInstance.get('/products/filter', {
        params: { active: true, size: 10, salonId: product.salonId }
      })
      .then(res => {
        const data = res.data?.content || res.data || [];
        // Filter out current product
        const filtered = data.filter(p => p.id !== product.id);
        // Slice to exactly 8 products
        setRecommendations({
          list: filtered.slice(0, 8),
          loading: false
        });
      })
      .catch(err => {
        console.error("Failed to fetch other products:", err);
        setRecommendations(prev => ({ ...prev, loading: false }));
      });
    }
  }, [product?.salonId, product?.id]);

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));



  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white font-sans flex items-center justify-center text-[#131313]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-[#FF0B01] border-t-transparent rounded-full" />
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-sans flex items-center justify-center text-[#131313]">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-gray-500">Product not found</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#FF0B01] text-white font-bold rounded-lg uppercase tracking-wider hover:opacity-90 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-800 antialiased">

      {/* --- MAIN PRODUCT ECOSYSTEM CANVAS --- */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-12 py-8 flex-1">
        {/* Breadcrumbs Navigation Route Map */}
        <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-medium mb-8">
          <span className="hover:underline cursor-pointer" onClick={() => navigate('/home')}>Home</span>
          <span>&gt;</span>
          <span className="hover:underline cursor-pointer" onClick={() => navigate('/customer/product-search')}>Products</span>
          <span>&gt;</span>
          <span className="text-gray-600 font-semibold">{product?.name}</span>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Gallery Panel (Left side) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/3] w-full border border-gray-100 rounded-3xl bg-neutral-50/50 flex items-center justify-center relative overflow-hidden shadow-xs">
              <div className="absolute inset-0 flex items-center justify-center p-6">
                {activeImage || product?.imageUrl ? (
                  <img 
                    src={getProductImageSrc(activeImage || product?.imageUrl)} 
                    alt={product?.name || "Primary Product View"} 
                    className="max-w-full max-h-full object-contain rounded-2xl transition-all duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
                    <svg className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-xs font-black tracking-widest uppercase">No Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-2">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProductData(prev => ({ ...prev, activeImage: imgUrl }))}
                    className={`w-20 h-20 border-2 rounded-2xl overflow-hidden bg-white p-1 transition-all ${
                      (activeImage === imgUrl || (!activeImage && idx === 0))
                        ? 'border-[#FF0B01] ring-4 ring-[#FF0B01]/5'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getProductImageSrc(imgUrl)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Purchase Panel */}
          <div className="lg:col-span-5 space-y-8 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs">
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product?.category && (
                  <span className="inline-block bg-neutral-100 text-neutral-800 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    {product.category}
                  </span>
                )}
                {product?.productType && (
                  <span className="inline-block bg-red-50 text-[#FF0B01] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    {product.productType}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {product?.name}
              </h1>

              {/* Ratings representation */}
              <div className="flex items-center space-x-2">
                <div className="flex text-amber-500">
                  <span className="text-sm font-bold text-neutral-800 flex items-center gap-1 font-sans">
                    <svg className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    4.5 Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-500 leading-relaxed font-medium">
              {product?.description}
            </p>

            {/* Pricing Section with original and discount comparison */}
            <div className="border-t border-b border-gray-100 py-6 space-y-2">
              <div className="flex items-baseline gap-3">
                {product?.discountPrice && product.discountPrice < product.price ? (
                  <>
                    <span className="text-3xl font-extrabold text-[#131313]">
                      ₹ {product.discountPrice}
                    </span>
                    <span className="text-base font-semibold text-gray-400 line-through">
                      ₹ {product.price}
                    </span>
                    <span className="text-xs font-black text-[#FF0B01] bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-[#131313]">
                    ₹ {product?.price}
                  </span>
                )}
              </div>
              
              {/* Availability */}
              {product?.stock !== undefined && product?.stock !== null && (
                <div className="flex items-center space-x-2 pt-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${product.stock === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className={`text-xs font-bold ${product.stock === 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                    {product.stock === 0 ? 'Out of Stock' : `In Stock (${product.stock} available)`}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product?.stock !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-neutral-800">Select Quantity</span>
                <div className="flex items-center space-x-3 bg-neutral-50 p-1 rounded-2xl border border-neutral-100">
                  <button 
                    onClick={decrementQty}
                    disabled={product?.stock === 0}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <span className="text-base font-black text-neutral-800 min-w-[28px] text-center">
                    {product?.stock === 0 ? 0 : quantity}
                  </span>
                  <button 
                    onClick={incrementQty}
                    disabled={product?.stock === 0 || quantity >= product?.stock}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* CTA action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={product?.stock === 0}
                className="flex-1 h-14 border-2 border-[#FF0B01] text-[#FF0B01] hover:bg-red-50 font-extrabold text-[15px] tracking-wider rounded-2xl transition-all duration-300 uppercase flex items-center justify-center gap-2 disabled:border-gray-200 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button 
                onClick={() => {
                  setCheckout({
                    product: { product, quantity },
                    isOpen: true,
                    loading: false
                  });
                }}
                disabled={product?.stock === 0}
                className="flex-1 h-14 bg-[#FF0B01] hover:bg-red-700 text-white font-extrabold text-[15px] tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 uppercase disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-100 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
              >
                {product?.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
            
            {/* Quick Guarantees */}
            <div className="pt-4 border-t border-gray-50 flex flex-col gap-2.5 text-xs text-neutral-400 font-semibold font-sans">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>100% Authentic product sourced directly from the salon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Includes free application guide and support</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- OTHER PRODUCTS GRID --- */}
        <div className="border-t border-gray-100 pt-16 mt-16 space-y-8 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#131313]">Other Products</h2>
              <p className="text-xs font-semibold text-neutral-400 font-sans">Discover more recommendations from this salon</p>
            </div>
            <button 
              onClick={() => navigate('/customer/product-search', { state: { salonId: product?.salonId } })}
              className="text-xs font-bold text-[#FF0B01] hover:underline uppercase tracking-wider flex items-center gap-1 font-sans"
            >
              See All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {otherProductsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-[#FF0B01] border-t-transparent rounded-full" />
            </div>
          ) : otherProducts.length === 0 ? (
            <p className="text-sm text-gray-500 italic font-sans">No other products found for this salon.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {otherProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-white rounded-3xl border border-gray-100 p-3 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group"
                >
                  <div>
                    {/* Media Container with soft background */}
                    <div 
                      onClick={() => navigate('/customer/product-details', { state: { product: prod } })}
                      className="w-full aspect-[4/5] bg-neutral-50 rounded-2xl relative flex items-center justify-center p-4 cursor-pointer overflow-hidden"
                    >
                      {prod.imageUrl ? (
                        <img 
                          src={getProductImageSrc(prod.imageUrl)} 
                          alt={prod.name} 
                          className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 space-y-1">
                          <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span className="text-[10px] font-black tracking-widest uppercase">No Image</span>
                        </div>
                      )}
                      
                      {/* Rating Overlay */}
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-neutral-100">
                        <svg className="w-3 h-3 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        <span className="text-[10px] font-bold text-neutral-800">4.5</span>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="mt-4 px-1 space-y-1.5 font-sans">
                      <h4 
                        onClick={() => navigate('/customer/product-details', { state: { product: prod } })}
                        className="text-xs font-bold text-neutral-900 line-clamp-2 min-h-[32px] cursor-pointer hover:text-[#FF0B01] transition-colors"
                      >
                        {prod.name}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs font-black text-neutral-900">
                        <span>₹ {prod.price}</span>
                        {prod.stock !== undefined && prod.stock !== null && (
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md ${prod.stock === 0 ? 'text-red-500 font-bold bg-red-50' : 'text-gray-400 font-semibold bg-neutral-50'}`}>
                            {prod.stock === 0 ? 'Out of stock' : `${prod.stock} left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buy Button */}
                  <div className="mt-4 px-1">
                    <button 
                      onClick={() => {
                        setCheckout({
                          product: { product: prod, quantity: 1 },
                          isOpen: true,
                          loading: false
                        });
                      }}
                      disabled={prod.stock === 0}
                      className="w-full py-2.5 text-xs font-extrabold text-[#131313] bg-white border-2 border-[#131313] rounded-xl uppercase tracking-wider hover:bg-[#131313] hover:text-white transition-colors duration-200 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200 disabled:cursor-not-allowed"
                    >
                      {prod.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Direct Order Checkout Popup Modal */}
      {isOrderModalOpen && checkoutProduct && checkoutProduct.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-all animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-neutral-100 rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-neutral-900 uppercase tracking-wide">
                Confirm Product Order
              </h2>
              <button 
                onClick={() => {
                  setCheckout(prev => ({ ...prev, isOpen: false }));
                }}
                className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-6">
              
              {/* Product Confirmation Detail Card */}
              <div className="flex gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                  {checkoutProduct.product.imageUrl ? (
                    <img 
                      src={getProductImageSrc(checkoutProduct.product.imageUrl)} 
                      alt={checkoutProduct.product.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">No Image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-neutral-900 truncate">
                    {checkoutProduct.product.name}
                  </h4>
                  <p className="text-xs text-neutral-400 font-semibold truncate mt-0.5">
                    {checkoutProduct.product.description || "Premium Formulation"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-red-50 text-[#FF0B01] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Qty: {checkoutProduct.quantity}
                    </span>
                    <span className="text-xs text-neutral-500 font-bold font-sans">
                      @ ₹ {orderPayload?.items?.[0]?.price} each
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider">
                  Delivery & Contact Information
                </h3>
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50 text-xs font-semibold text-neutral-600 space-y-1.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Customer Name</span>
                    <span className="text-neutral-800 font-bold">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Mobile Phone</span>
                    <span className="text-neutral-800 font-bold">{customerPhone || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100 font-sans">
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Subtotal</span>
                  <span>₹ {pricingBreakdown?.originalTotal}</span>
                </div>
                {pricingBreakdown?.hasDiscount && (
                  <div className="flex justify-between text-xs font-semibold text-green-600">
                    <span>Discount Applied</span>
                    <span>- ₹ {pricingBreakdown?.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline text-sm font-extrabold text-neutral-900 pt-2 border-t border-gray-50">
                  <span className="text-base">Total Amount</span>
                  <span className="text-lg text-[#FF0B01]">₹ {pricingBreakdown?.finalTotal}</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => {
                  setCheckout(prev => ({ ...prev, isOpen: false }));
                }}
                disabled={orderLoading}
                className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-black uppercase tracking-wider rounded-2xl transition-colors disabled:opacity-50 font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="flex-1 py-3.5 bg-[#FF0B01] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
              >
                {orderLoading ? (
                  <>
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Confirm Order</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;