import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MapPin, PhoneCall, CheckCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order || null;
  const product = location.state?.product || null;

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

  const itemDetails = useMemo(() => {
    if (!order || !order.items || order.items.length === 0) return null;
    return order.items[0];
  }, [order]);

  const pricingBreakdown = useMemo(() => {
    if (!itemDetails || !product) return null;
    const qty = itemDetails.quantity || 1;
    const originalPrice = product.price || itemDetails.price;
    const finalPrice = itemDetails.price;
    
    const originalTotal = originalPrice * qty;
    const finalTotal = finalPrice * qty;
    const discountAmount = originalTotal - finalTotal;

    return {
      originalTotal,
      finalTotal,
      discountAmount,
      hasDiscount: discountAmount > 0
    };
  }, [itemDetails, product]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col text-neutral-800 antialiased">
        <main className="max-w-md w-full mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">No Order Details Found</h2>
          <p className="text-sm text-neutral-500 mb-6 font-medium font-sans">
            It looks like you navigated here directly. Please check your order history.
          </p>
          <button
            onClick={() => navigate('/customer/product-search')}
            className="w-full py-3 bg-[#FF0B01] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 transition"
          >
            Go to Products
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-neutral-800 antialiased">
      <main className="max-w-2xl w-full mx-auto px-4 md:px-8 py-12 flex-1">
        
        {/* Success Glyph and Status Banner */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-red-500/5 animate-pulse">
              <div className="absolute h-20 w-20 rounded-full bg-red-500/10" />
              <div className="absolute h-16 w-16 rounded-full bg-red-500/20" />
              <div className="relative h-12 w-12 rounded-full bg-[#FF0B01] flex items-center justify-center shadow-md shadow-red-500/20">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
              Order ID: #NP-{order.id}
            </p>
          </div>

          {/* Core Instruction Alert */}
          <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed font-sans max-w-lg mx-auto flex items-start gap-3 text-left">
            <span className="text-[#FF0B01] text-base mt-0.5">ℹ</span>
            <div>
              The salon will contact you regarding the order details shortly, or you can collect your items directly from the salon premises at your convenience.
            </div>
          </div>
        </div>

        {/* Order Details Accordion Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Order Details
          </h3>

          {/* Product Info Block */}
          {itemDetails && (
            <div className="flex gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                {itemDetails.productImageUrl || product?.imageUrl ? (
                  <img
                    src={getProductImageSrc(itemDetails.productImageUrl || product.imageUrl)}
                    alt={itemDetails.productName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">No Image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-neutral-900 truncate">
                  {itemDetails.productName}
                </h4>
                <p className="text-xs text-neutral-400 font-semibold truncate mt-0.5">
                  {product?.description || "Premium Product Formulation"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-red-50 text-[#FF0B01] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Qty: {itemDetails.quantity}
                  </span>
                  <span className="text-xs text-neutral-500 font-bold font-sans">
                    @ ₹ {itemDetails.price} each
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery & Status Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400" />
                Customer Contact
              </h4>
              <div className="text-xs font-semibold text-neutral-700 space-y-1 font-sans">
                <p className="text-neutral-900 font-bold">{order.customerName}</p>
                <p>{order.customerMobile || "—"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                Collection Venue
              </h4>
              <div className="text-xs font-semibold text-neutral-700 space-y-1 font-sans">
                <p className="text-neutral-900 font-bold">{order.salonName || "Salon Premise Collection"}</p>
                {order.salonAddress && <p className="text-gray-500">{order.salonAddress}</p>}
                <p className="text-[10px] text-gray-400">Salon ID: #{order.salonId || 1}</p>
              </div>
            </div>
          </div>

          {/* Price Summary Breakdown */}
          {pricingBreakdown && (
            <div className="border-t border-gray-100 pt-4 space-y-2.5 font-sans">
              <div className="flex justify-between text-xs font-semibold text-neutral-500">
                <span>Subtotal</span>
                <span>₹ {pricingBreakdown.originalTotal}</span>
              </div>
              {pricingBreakdown.hasDiscount && (
                <div className="flex justify-between text-xs font-semibold text-green-600">
                  <span>Discount Applied</span>
                  <span>- ₹ {pricingBreakdown.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline text-sm font-extrabold text-neutral-900 pt-2 border-t border-gray-50">
                <span className="text-base">Amount Paid</span>
                <span className="text-lg text-[#FF0B01]">₹ {pricingBreakdown.finalTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/customer/product-search')}
            className="flex-1 max-w-xs py-3.5 bg-white border-2 border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-800 text-xs font-black uppercase tracking-wider rounded-2xl transition duration-200 text-center"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/customer/home')}
            className="flex-1 max-w-xs py-3.5 bg-[#FF0B01] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition duration-200 text-center"
          >
            Go to Home
          </button>
        </div>

      </main>
    </div>
  );
};

export default OrderSuccess;
