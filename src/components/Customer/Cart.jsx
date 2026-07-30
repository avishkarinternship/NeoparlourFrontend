import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart, 
  checkoutAll 
} from '../../redux/slices/cartSlice';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ChevronRight, 
  AlertTriangle, 
  PackageCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import SEOFooter from '../common/SEOFooter';

// Helper toast style
const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  }
};

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.customer);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your cart.', toastStyle);
      navigate('/customer/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigate]);

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

  const handleQuantityDecrease = (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      // Prompt removal if quantity drops below 1
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartItemQuantity({ productId, quantity: currentQuantity - 1 }));
    }
  };

  const handleQuantityIncrease = (productId, currentQuantity, availableStock) => {
    if (availableStock !== undefined && availableStock !== null && currentQuantity >= availableStock) {
      toast.error(`Only ${availableStock} units available in stock.`, toastStyle);
      return;
    }
    dispatch(updateCartItemQuantity({ productId, quantity: currentQuantity + 1 }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to empty your cart?")) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    
    // Check if any items are out of stock
    const hasOutOfStock = cart.items.some(item => !item.inStock);
    if (hasOutOfStock) {
      toast.error("Please remove out-of-stock items before checkout.", toastStyle);
      return;
    }

    setCheckoutLoading(true);
    try {
      const orders = await dispatch(checkoutAll()).unwrap();
      navigate('/customer/order-success', { state: { orders } });
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error(err || "Checkout failed. Please try again.", toastStyle);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-[#FF0B01] border-t-transparent rounded-full" />
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart?.totalAmount || 0;
  const hasOutOfStockItems = items.some(item => !item.inStock);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-800 antialiased flex flex-col">
      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 py-12 flex-1">
        
        {/* Breadcrumbs */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-medium">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/customer/product-search')}>Products</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-semibold">Shopping Cart</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[#131313] flex items-center gap-3">
            Shopping Cart
            <span className="text-xs font-black bg-red-50 text-[#FF0B01] border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
            </span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm text-center space-y-6 mx-auto my-12">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <ShoppingCart className="w-10 h-10 text-[#FF0B01]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-wider text-[#131313]">Your Cart is Empty</h2>
              <p className="text-sm font-semibold text-neutral-400">
                Browse our salon's premium beauty formulations and add them to your cart.
              </p>
            </div>
            <button 
              onClick={() => navigate('/salons', { state: { purpose: 'products' } })}
              className="w-full py-4 bg-[#FF0B01] hover:bg-red-700 text-white font-extrabold text-[14px] tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Browsing
            </button>
          </div>
        ) : (
          <>
            {hasOutOfStockItems && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p className="font-extrabold text-sm uppercase tracking-wide mb-0.5">Out of Stock Alert</p>
                  Some items in your cart are currently unavailable. Please remove them to proceed to checkout.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.productId} 
                className={`bg-white rounded-2xl p-4 md:p-5 border shadow-sm transition duration-200 flex flex-col sm:flex-row items-center justify-between gap-4
                  ${item.inStock ? 'border-neutral-100' : 'border-red-200 bg-red-50/10'}`}
              >
                {/* Left block: Image & Details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 flex items-center justify-center">
                    {item.productImageUrl ? (
                      <img 
                        src={getProductImageSrc(item.productImageUrl)} 
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-50 text-[#FF0B01] font-black text-sm uppercase">
                        {item.productName?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-left min-w-0">
                    <span className="text-[10px] bg-neutral-100 text-neutral-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      Brand Product
                    </span>
                    <h3 className="text-sm font-black text-[#131313] truncate max-w-[200px] md:max-w-[300px]">
                      {item.productName}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-neutral-800">
                        ₹ {item.price}
                      </span>
                      {!item.inStock && (
                        <span className="text-[9px] font-black uppercase bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-md">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right block: Qty adjustment, line total & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-50">
                  {/* Qty Adjustment */}
                  <div className="flex items-center space-x-2 bg-neutral-50 p-1 rounded-xl border border-neutral-100">
                    <button 
                      onClick={() => handleQuantityDecrease(item.productId, item.quantity)}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-neutral-800 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityIncrease(item.productId, item.quantity, item.availableStock)}
                      disabled={!item.inStock}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[80px]">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total</p>
                    <p className="text-sm font-extrabold text-[#131313] mt-0.5">
                      ₹ {item.lineTotal}
                    </p>
                  </div>

                  {/* Trash Action */}
                  <button 
                    onClick={() => handleRemoveItem(item.productId)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-neutral-50 pb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#FF0B01]" />
                  Order Summary
                </h3>
                <button 
                  onClick={handleClearCart}
                  className="text-[11px] font-bold text-neutral-400 hover:text-[#FF0B01] transition uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium truncate max-w-[160px]">{item.productName}</span>
                    <span className="text-neutral-400 font-semibold shrink-0">x{item.quantity}</span>
                    <span className="text-neutral-700 font-extrabold shrink-0">₹ {item.lineTotal}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Fees Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-semibold">Subtotal</span>
                  <span className="text-neutral-700 font-extrabold">₹ {totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-semibold">Salon Service / Delivery</span>
                  <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-sm uppercase text-[9px] tracking-wide border border-green-100">
                    Free Pickup
                  </span>
                </div>
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Grand Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-wider text-neutral-800">Total Amount</span>
                <span className="text-xl font-black text-[#FF0B01]">₹ {totalAmount}</span>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading || hasOutOfStockItems}
                className="w-full py-4 bg-[#FF0B01] hover:bg-red-700 text-white font-extrabold text-[14px] tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {checkoutLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    Checkout Order
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => navigate('/salons', { state: { purpose: 'products' } })}
                className="w-full py-3.5 mt-3 border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-extrabold text-[13px] tracking-wider rounded-2xl shadow-xs transition-all duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
        </>
        )}

      </main>
      <div className="mt-12 md:mt-20">
        <SEOFooter />
      </div>
    </div>
  );
}
