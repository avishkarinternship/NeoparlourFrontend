import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import Sidebar from './Layouts/SideBar';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import axiosInstance from '../../api/axiosInstance';

// Helper to format X-axis labels based on the view type (timezone-safe)
const formatLabel = (label, viewType) => {
    if (!label) return '';
    try {
        if (typeof label === 'string' && label.toLowerCase().includes('week')) {
            return label;
        }

        if (viewType === 'year' && /^\d{4}-\d{2}$/.test(label)) {
            const [year, month] = label.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        }
        
        if ((viewType === 'month' || viewType === 'week') && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
            const [year, month, day] = label.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }

        const cleanLabel = label.replace('.0', '');
        const date = new Date(cleanLabel.replace(' ', 'T'));
        if (isNaN(date.getTime())) return label;

        switch (viewType) {
            case 'day':
                return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            case 'week':
                return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            case 'month':
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            case 'year':
                return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            default:
                return label;
        }
    } catch {
        return label;
    }
};

// Premium Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label, viewType }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs border border-white/10 text-left">
                <p className="font-semibold text-gray-400 mb-1.5 tracking-wide uppercase text-[9px]">{formatLabel(label, viewType)}</p>
                <p className="font-black text-lg text-[#ff0b01]">₹ {payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        );
    }
    return null;
};

const Analytics = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const getFirstDayOfMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Global View Settings
  const [activeTab, setActiveTab] = useState('REVENUE');
  const [globalTimeframe, setGlobalTimeframe] = useState('Daily');
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [loading, setLoading] = useState(false);

  // --- LOCAL GRAPH REVENUE STATES (SAME AS DASHBOARD) ---
  const [graphViewType, setGraphViewType] = useState('day');
  const [graphStartDate, setGraphStartDate] = useState(getFirstDayOfMonth());
  const [graphEndDate, setGraphEndDate] = useState(getTodayDateString());
  const [graphRevenueData, setGraphRevenueData] = useState([]);
  const [graphRevenueLoading, setGraphRevenueLoading] = useState(false);
  const [graphTotalRevenue, setGraphTotalRevenue] = useState(0);

  // --- COMPLETED ORDERS REVENUE FOR LINE CURVE ---
  const [ordersViewType, setOrdersViewType] = useState('day');
  const [ordersStartDate, setOrdersStartDate] = useState(getFirstDayOfMonth());
  const [ordersEndDate, setOrdersEndDate] = useState(getTodayDateString());
  const [ordersRevenueData, setOrdersRevenueData] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // --- LOCAL TABS PARAMETERS ---
  const [offersList, setOffersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Fetch staff and offers list on mount
  useEffect(() => {
    axiosInstance.get('/staff')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setStaffList(res.data);
        } else if (res.data && Array.isArray(res.data.content)) {
          setStaffList(res.data.content);
        }
      })
      .catch(err => {
        console.error("Failed to load staff list in Analytics:", err);
      });

    axiosInstance.get('/offers/search?active=true')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.content) ? res.data.content : []);
        setOffersList(data);
      })
      .catch(err => {
        console.error("Failed to load offers list in Analytics:", err);
      });
  }, []);

  const mapTimeframeToViewType = (tf) => {
    switch (tf) {
      case 'Daily': return 'day';
      case 'Weekly': return 'week';
      case 'Monthly': return 'month';
      case 'Yearly': return 'year';
      case 'Custom': return 'custom';
      default: return 'day';
    }
  };



  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    let shouldCall = true;
    let effectiveEndDate = graphEndDate;

    if (graphViewType === 'custom') {
      if (!graphStartDate) {
        shouldCall = false;
      } else if (!graphEndDate) {
        effectiveEndDate = getTodayDateString();
      }
    }

    if (shouldCall) {
      setGraphRevenueLoading(true);
      const params = { 
        viewType: graphViewType,
        isOfferOnly: activeTab === 'OFFER'
      };

      if (activeTab === 'OFFER' && selectedOfferId) {
        params.offerId = selectedOfferId;
      } else if (activeTab === 'STAFF' && selectedStaffId) {
        params.staffId = selectedStaffId;
      }

      if (graphViewType === 'custom') {
        params.startDate = graphStartDate;
        params.endDate = effectiveEndDate;
      }

      axiosInstance.get(`/revenue/graph`, { params, signal: controller.signal })
        .then(res => {
          if (isMounted && res.data) {
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.content) ? res.data.content : []);
            setGraphRevenueData(data);
            const total = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
            setGraphTotalRevenue(total);
          }
        })
        .catch(err => {
          if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
            console.error("Failed to fetch analytics revenue graph:", err);
            setGraphRevenueData([]);
            setGraphTotalRevenue(0);
          }
        })
        .finally(() => {
          if (isMounted) setGraphRevenueLoading(false);
        });
    } else {
      setGraphRevenueData([]);
      setGraphTotalRevenue(0);
      setGraphRevenueLoading(false);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [graphViewType, graphStartDate, graphEndDate, activeTab, selectedOfferId, selectedStaffId]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    let shouldCall = true;
    let effectiveEndDate = ordersEndDate;

    if (ordersViewType === 'custom') {
      if (!ordersStartDate) {
        shouldCall = false;
      } else if (!ordersEndDate) {
        effectiveEndDate = getTodayDateString();
      }
    }

    if (shouldCall) {
      setOrdersLoading(true);
      const params = { viewType: ordersViewType };
      if (ordersViewType === 'custom') {
        params.startDate = ordersStartDate;
        params.endDate = effectiveEndDate;
      }

      axiosInstance.get(`/revenue/orders`, { params, signal: controller.signal })
        .then(res => {
          if (isMounted && res.data) {
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.content) ? res.data.content : []);
            setOrdersRevenueData(data);
          }
        })
        .catch(err => {
          if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
            console.error("Failed to fetch completed orders revenue:", err);
            setOrdersRevenueData([]);
          }
        })
        .finally(() => {
          if (isMounted) setOrdersLoading(false);
        });
    } else {
      setOrdersRevenueData([]);
      setOrdersLoading(false);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [ordersViewType, ordersStartDate, ordersEndDate]);

  // --- DATA GRAPH MATRICES FOR SUB-CARDS ---
  // Show same graph data of appointment revenue but in piechart format (Card 2)
  const salesRevenuePieData = Array.isArray(graphRevenueData) ? graphRevenueData.map((item, idx) => {
    const colorPalette = [
      '#FFA5A5', '#FFD3A5', '#FFF3A5', '#D3FFA5', '#A5FFD3', 
      '#A5FFF3', '#A5D3FF', '#D3A5FF', '#FFA5F3', '#A0BFFE'
    ];
    return {
      name: formatLabel(item.label, graphViewType),
      value: item.revenue || 0,
      color: colorPalette[idx % colorPalette.length]
    };
  }) : [];

  // Show the product sales in bar chart format (Card 4)
  const productSalesBarData = Array.isArray(ordersRevenueData) ? ordersRevenueData.map((item) => {
    return {
      name: formatLabel(item.label, ordersViewType),
      "Product Sales": item.revenue || 0
    };
  }) : [];

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-gray-800 antialiased font-sans flex flex-col">
      {/* GLOBAL TOP NAVIGATION PANEL */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* TWO COLUMN ROOT FRAMEWORK: SIDEBAR + MAIN WORKSPACE AREA */}
      <div className="flex flex-1 w-full">
        
        {/* PRIMARY LEFT SIDEBAR DRAWER FRAME */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* COMPONENT CONTENT BODY ENGINE CONTAINER */}
        <div className="flex-1 px-6 py-6 overflow-x-hidden">
          
          {/* SECTION 1: APPOINTMENTS REVENUE */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Appointments Revenue</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {activeTab === 'REVENUE' && "Overall Revenue: Comprehensive services revenue metrics and breakdowns"}
                  {activeTab === 'OFFER' && "Offers Revenue: Revenue generated by promotional offers only"}
                  {activeTab === 'STAFF' && "Staff Revenue: Revenue generated by a particular staff or single staff member"}
                </p>
              </div>

              {/* VIEW NAVIGATION TABS (REVENUE, OFFER, STAFF) */}
              <div className="flex items-center space-x-6 text-[11px] font-bold tracking-wider text-gray-400 md:ml-auto">
                {['REVENUE', 'OFFER', 'STAFF'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 relative transition-colors uppercase ${
                      activeTab === tab ? 'text-gray-900 font-extrabold' : 'hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF0B01] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-right hidden md:block md:pl-6 border-l border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-black text-[#ff0b01]">₹ {graphTotalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Common Filter Controls Panel for Appointments */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100/60">
              <div className="flex flex-wrap items-center gap-3">
                {/* Timeframe Pills */}
                <div className="flex gap-1.5 p-0.5 bg-gray-100/80 rounded-xl">
                  {['day', 'week', 'month', 'year', 'custom'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setGraphViewType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                        graphViewType === type
                          ? 'bg-[#ff0b01] text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Offer Selection Dropdown */}
                {activeTab === 'OFFER' && (
                  <div className="relative">
                    <select
                      value={selectedOfferId}
                      onChange={(e) => setSelectedOfferId(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-gray-700 focus:outline-none focus:border-[#ff0b01] shadow-2xs cursor-pointer"
                    >
                      <option value="">All Offers</option>
                      {offersList.map(offer => (
                        <option key={offer.id} value={offer.id}>{offer.name} ({offer.discountPercentage || offer.discountPrice}% Off)</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[6px] text-gray-500">▼</span>
                  </div>
                )}

                {/* Staff Selection Dropdown */}
                {activeTab === 'STAFF' && (
                  <div className="relative">
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-gray-700 focus:outline-none focus:border-[#ff0b01] shadow-2xs cursor-pointer"
                    >
                      <option value="">All Staff</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name} ({staff.speciality || 'Stylist'})</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[6px] text-gray-500">▼</span>
                  </div>
                )}
              </div>

              {/* Custom Date Pickers */}
              {graphViewType === 'custom' && (
                <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <span className="text-[10px] font-black text-gray-400 uppercase mr-1">From</span>
                  <input 
                    type="date"
                    value={graphStartDate}
                    onChange={(e) => setGraphStartDate(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none text-gray-700"
                  />
                  <span className="text-gray-300 text-xs px-1">to</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase mr-1">To</span>
                  <input 
                    type="date"
                    value={graphEndDate}
                    onChange={(e) => setGraphEndDate(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none text-gray-700"
                  />
                </div>
              )}

              <div className="md:hidden w-full text-right border-t border-gray-100 pt-2.5 mt-1">
                <p className="text-[9px] text-gray-400 font-semibold uppercase">Total Revenue</p>
                <p className="text-lg font-black text-[#ff0b01]">₹ {graphTotalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Appointment Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Area Chart Container */}
              <div className="border border-gray-100/80 rounded-xl p-4 flex flex-col justify-between min-h-[320px]">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Revenue Trend Curve</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Timeline pattern distribution</p>
                </div>

                <div className="w-full h-56 relative">
                  {graphRevenueLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                    </div>
                  ) : graphRevenueData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <svg className="w-8 h-8 text-gray-300 mb-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      <p className="text-[10px] font-semibold text-gray-400">No revenue data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphRevenueData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="analyticsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff0b01" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#ff0b01" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                        <XAxis 
                          dataKey="label" 
                          tickFormatter={(val) => formatLabel(val, graphViewType)}
                          tick={{ fontSize: 8, fontWeight: 600, fill: '#9CA3AF' }} 
                          axisLine={false} 
                          tickLine={false} 
                        />
                        <YAxis 
                          tick={{ fontSize: 9, fontWeight: 600, fill: '#9CA3AF' }} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip content={<CustomTooltip viewType={graphViewType} />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#ff0b01"
                          strokeWidth={3}
                          fill="url(#analyticsRevenueGradient)"
                          dot={{ r: 3, fill: '#ff0b01', stroke: '#fff', strokeWidth: 1.5 }}
                          activeDot={{ r: 5, fill: '#ff0b01', stroke: '#fff', strokeWidth: 1.5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex items-center mt-3 text-[9px] font-bold text-gray-600">
                  <span className="w-2.5 h-0.5 bg-[#ff0b01] mr-1.5" /> Core Generated Revenue Stream
                </div>
              </div>

              {/* Pie Chart Container */}
              <div className="border border-gray-100/80 rounded-xl p-4 flex flex-col justify-between min-h-[320px]">
                <div className="mb-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Contribution Breakdown</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Slices representation metrics</p>
                </div>

                <div className="w-full relative">
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesRevenuePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {salesRevenuePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Donut Center Display */}
                    <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Gross Total</p>
                      <p className="text-base font-black text-gray-900 tracking-tight">₹{graphTotalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Responsive Below Labels Indicators Container Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2 border-t border-gray-100 pt-4 max-h-36 overflow-y-auto pr-1">
                    {salesRevenuePieData.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-center justify-between text-[9px] font-bold text-gray-500 bg-gray-50/50 hover:bg-gray-50 p-2 rounded-xl border border-gray-100/40 transition-all">
                        <div className="flex items-center overflow-hidden truncate mr-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0 mr-1.5" style={{ backgroundColor: item.color }} />
                          <span className="truncate text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-gray-900 text-right font-extrabold flex-shrink-0">₹{item.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCT SALES */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Product Sales</h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Comprehensive product purchases revenue & timeline metrics</p>
              </div>
            </div>

            {/* Common Filter Controls Panel for Product Sales */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100/60">
              <div className="flex flex-wrap items-center gap-3">
                {/* Timeframe Pills */}
                <div className="flex gap-1.5 p-0.5 bg-gray-100/80 rounded-xl">
                  {['day', 'week', 'month', 'year', 'custom'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrdersViewType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                        ordersViewType === type
                          ? 'bg-[#ff0b01] text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Pickers */}
              {ordersViewType === 'custom' && (
                <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <span className="text-[10px] font-black text-gray-400 uppercase mr-1">From</span>
                  <input 
                    type="date"
                    value={ordersStartDate}
                    onChange={(e) => setOrdersStartDate(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none text-gray-700"
                  />
                  <span className="text-gray-300 text-xs px-1">to</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase mr-1">To</span>
                  <input 
                    type="date"
                    value={ordersEndDate}
                    onChange={(e) => setOrdersEndDate(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none text-gray-700"
                  />
                </div>
              )}
            </div>

            {/* Product Sales Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Area Chart Container */}
              <div className="border border-gray-100/80 rounded-xl p-4 flex flex-col justify-between min-h-[320px]">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Product Sales Revenue</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Timeline trend distribution</p>
                </div>

                <div className="w-full h-56 relative">
                  {ordersLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                    </div>
                  ) : ordersRevenueData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <svg className="w-8 h-8 text-gray-300 mb-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      <p className="text-[10px] font-semibold text-gray-400">No order revenue data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ordersRevenueData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="ordersRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff0b01" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#ff0b01" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                        <XAxis 
                          dataKey="label" 
                          tickFormatter={(val) => formatLabel(val, ordersViewType)}
                          tick={{ fontSize: 8, fontWeight: 600, fill: '#9CA3AF' }} 
                          axisLine={false} 
                          tickLine={false} 
                        />
                        <YAxis 
                          tick={{ fontSize: 9, fontWeight: 600, fill: '#9CA3AF' }} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip content={<CustomTooltip viewType={ordersViewType} />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#ff0b01"
                          strokeWidth={3}
                          fill="url(#ordersRevenueGradient)"
                          dot={{ r: 3, fill: '#ff0b01', stroke: '#fff', strokeWidth: 1.5 }}
                          activeDot={{ r: 5, fill: '#ff0b01', stroke: '#fff', strokeWidth: 1.5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex items-center mt-3 text-[9px] font-bold text-gray-600">
                  <span className="w-2.5 h-0.5 bg-[#ff0b01] mr-1.5" /> Core Generated Revenue Stream
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="border border-gray-100/80 rounded-xl p-4 flex flex-col justify-between min-h-[320px]">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Product Sales Distribution</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Timeframe distribution matrix</p>
                </div>

                <div className="w-full h-56 relative">
                  {ordersLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                    </div>
                  ) : ordersRevenueData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <svg className="w-8 h-8 text-gray-300 mb-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      <p className="text-[10px] font-semibold text-gray-400">No product sales data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productSalesBarData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                        <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Product Sales']} />
                        <Bar dataKey="Product Sales" fill="#ff0b01" radius={[1, 1, 0, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex items-center mt-3 text-[9px] font-bold text-gray-600">
                  <span className="w-2.5 h-0.5 bg-[#ff0b01] mr-1.5" /> Product Generated Sales Volume
                </div>
              </div>
            </div>
          </div>
          
          {/* FOOTER PLACEMENT */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
export default Analytics;