import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { ShoppingBag, Calendar, CheckCircle2, AlertCircle, Clock, ShoppingCart } from 'lucide-react';
import SEOFooter from '../common/SEOFooter';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/orders/my-orders')
      .then(res => {
        // Sort orders by id or date descending
        const sorted = (res.data || []).sort((a, b) => b.id - a.id);
        setOrders(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch customer orders:", err);
        toast.error("Failed to load your orders. Please try again.");
        setLoading(false);
      });
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

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'ordered':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-amber-100">
            <Clock className="w-3 h-3" />
            Ordered
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-blue-100">
            <ShoppingBag className="w-3 h-3" />
            Ready
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-green-100">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-red-100">
            <AlertCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-gray-800 text-neutral-700 dark:text-gray-300 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-neutral-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black font-sans flex flex-col text-neutral-800 dark:text-gray-300 antialiased">
      <main className="max-w-4xl w-full mx-auto px-4 md:px-8 py-12 flex-1">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-medium">
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span>
            <span>&gt;</span>
            <span className="text-gray-600 dark:text-gray-300 font-semibold">My Orders</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[#131313] dark:text-white">My Orders</h1>
          <p className="text-xs font-semibold text-neutral-400 font-sans">View and track all your product purchases</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-[#FF0B01] border-t-transparent rounded-full" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100 shadow-inner">
              <ShoppingCart className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">No Orders Yet</h3>
              <p className="text-xs text-neutral-400 font-medium font-sans max-w-[280px] leading-relaxed">
                You haven't placed any product orders yet. Browse our products to place your first order!
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/product-search')}
              className="w-full py-3 bg-[#FF0B01] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-6"
              >
                {/* Order Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-50 dark:border-gray-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-neutral-900 dark:text-white">
                      Order ID: #NP-{order.id}
                    </p>
                    {order.createdAt && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-semibold font-sans">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Ordered Items list */}
                <div className="space-y-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-neutral-50 dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 rounded-2xl flex items-center justify-center p-1 flex-shrink-0">
                        {item.productImageUrl ? (
                          <img
                            src={getProductImageSrc(item.productImageUrl)}
                            alt={item.productName}
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">No Image</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-extrabold text-neutral-900 dark:text-white truncate">
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-semibold font-sans mt-0.5">
                          ₹ {item.price} each
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs bg-neutral-100 dark:bg-gray-800 text-neutral-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-black font-sans">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-50 dark:border-gray-800 bg-neutral-50/50 dark:bg-gray-900/50 -mx-6 md:-mx-8 px-6 md:px-8 -mb-6 md:-mb-8 rounded-b-3xl">
                  <div className="text-xs font-semibold text-neutral-500 font-sans leading-relaxed">
                    Collection Venue: <span className="text-neutral-800 dark:text-gray-200 font-bold">{order.salonName || `Salon ID #${order.salonId}`}</span>
                    {order.salonAddress && <span className="text-gray-400 block text-[10px]">{order.salonAddress}</span>}
                  </div>
                  <div className="flex items-center gap-2 py-4">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-sans">Total Paid:</span>
                    <span className="text-base font-black text-[#FF0B01]">₹ {order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
      <SEOFooter />
    </div>
  );
};

export default MyOrders;
