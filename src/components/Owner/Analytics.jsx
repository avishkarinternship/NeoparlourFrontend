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
  Line
} from 'recharts';

import Sidebar from './Layouts/SideBar';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import axiosInstance from '../../api/axiosInstance';

const Analytics = () => {
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

  // --- API RESPONSE INTEGRATION MATRIX ---
  const [revenueApiResponse, setRevenueApiResponse] = useState([]);

  const mapTimeframeToViewType = (tf) => {
    switch (tf) {
      case 'Daily': return 'day';
      case 'Weekly': return 'week';
      case 'Monthly': return 'month';
      case 'Custom': return 'custom';
      default: return 'day';
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    let shouldCall = true;
    let effectiveEndDate = endDate;
    const viewType = mapTimeframeToViewType(globalTimeframe);

    if (viewType === 'custom') {
      if (!startDate) {
        shouldCall = false;
      } else if (!endDate) {
        effectiveEndDate = getTodayDateString();
      }
    }

    if (shouldCall) {
      setLoading(true);
      const params = { viewType, onlyOffers: false };
      if (viewType === 'custom') {
        params.startDate = startDate;
        params.endDate = effectiveEndDate;
      }

      axiosInstance.get(`/revenue/graph`, { params, signal: controller.signal })
        .then(res => {
          if (isMounted && res.data) {
            setRevenueApiResponse(res.data);
          }
        })
        .catch(err => {
          if (err.name !== 'CanceledError' && err.message !== 'canceled' && !axiosInstance.isCancel?.(err)) {
            console.error("Failed to fetch analytics revenue graph:", err);
            setRevenueApiResponse([]);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setRevenueApiResponse([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [globalTimeframe, startDate, endDate]);

  // Derive total metrics dynamically from your API data array
  const totalRevenueSum = revenueApiResponse.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  // --- DATA GRAPH MATRICES FOR SUB-CARDS ---
  // Dynamic datasets that sync structure based on the current API sequence shape
  const salesRevenuePieData = revenueApiResponse.map((item, idx) => {
    const colorPalette = [
      '#A0BFFE', '#FFA5A5', '#FFD3A5', '#FFF3A5', '#D3FFA5', 
      '#A5FFD3', '#A5FFF3', '#A5D3FF', '#D3A5FF', '#FFA5F3'
    ];
    return {
      name: item.label || '',
      value: item.revenue || 0,
      color: colorPalette[idx % colorPalette.length]
    };
  });

  const productSalesLineData = revenueApiResponse.map((item) => ({
    name: item.label ? (item.label.includes('week') ? item.label : item.label.substring(5)) : '', 
    "Current Revenue": item.revenue || 0,
    "Target Revenue": (item.revenue || 0) * 1.2 
  }));

  const totalAppointmentsStaffData = [
    { name: 'Staff 1', Completed: 45, Reschedule: 12, Cancelled: 5 },
    { name: 'Staff 2', Completed: 68, Reschedule: 22, Cancelled: 14 },
    { name: 'Staff 3', Completed: 88, Reschedule: 15, Cancelled: 8 },
    { name: 'Staff 4', Completed: 54, Reschedule: 19, Cancelled: 3 },
    { name: 'Staff 5', Completed: 72, Reschedule: 8,  Cancelled: 11 },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-gray-800 antialiased font-sans flex flex-col">
      {/* GLOBAL TOP NAVIGATION PANEL */}
      <Navbar />
      
      {/* TWO COLUMN ROOT FRAMEWORK: SIDEBAR + MAIN WORKSPACE AREA */}
      <div className="flex flex-1 w-full">
        
        {/* PRIMARY LEFT SIDEBAR DRAWER FRAME */}
        <Sidebar />

        {/* COMPONENT CONTENT BODY ENGINE CONTAINER */}
        <div className="flex-1 px-6 py-6 overflow-x-hidden">
          
          {/* HEADER SECTION METRICS CONTROL NODES */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200/60 pb-5 gap-4">
            
            {/* VIEW NAVIGATION TABS */}
            <div className="flex items-center space-x-8 text-[11px] font-bold tracking-wider text-gray-400">
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
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF0B01] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* COMMON GLOBAL ACTIONS BAR (RIGHT END) */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500 ml-auto w-full md:w-auto justify-end">
              
              {/* GLOBAL SINGLE TIMEFRAME SELECT dropdown */}
              <div className="relative">
                <select 
                  value={globalTimeframe}
                  onChange={(e) => setGlobalTimeframe(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-gray-700 focus:outline-none shadow-2xs"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Custom">Custom</option>
                </select>
                <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[6px] text-gray-500">▼</span>
              </div>

              {globalTimeframe === 'Custom' && (
                <>
                  {/* CALENDAR DATE RANGE PICKER FIELDS */}
                  <div className="relative flex items-center border border-gray-300 rounded-lg bg-white px-3 py-1.5 shadow-2xs">
                    <span className="mr-2 text-gray-400 text-xs">📅</span>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="focus:outline-none bg-transparent text-gray-700" 
                    />
                  </div>
                  
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-tight mx-0.5">To</span>
                  
                  <div className="relative flex items-center border border-gray-300 rounded-lg bg-white px-3 py-1.5 shadow-2xs">
                    <span className="mr-2 text-gray-400 text-xs">📅</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="focus:outline-none bg-transparent text-gray-700" 
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CHARTS CONTAINER GRID MATRICES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            
            {/* CARD 1: RECENT REVENUE METRIC FROM API RESPONSE */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-gray-900 tracking-tight">Recent Sales Summary</h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Filtered by global timeframe ({globalTimeframe})</p>
                  </div>
                  <div className="text-right text-[10px] font-bold text-gray-400 space-y-0.5">
                    <p>Total Data Points <span className="text-gray-900 font-extrabold">{revenueApiResponse.length}</span></p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-black text-gray-900 tracking-tight">₹ {totalRevenueSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* BAR CHART DISPLAYING DIRECT API METRICS SHAPE */}
              <div className="w-full h-56 mt-4 relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-[#9BA2FF] border-t-transparent rounded-full"></div>
                  </div>
                ) : revenueApiResponse.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <svg className="w-8 h-8 text-gray-300 mb-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <p className="text-[10px] font-semibold text-gray-400">No revenue data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueApiResponse} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                      <XAxis 
                        dataKey="label" 
                        tickFormatter={(val) => {
                          if (!val) return '';
                          if (typeof val === 'string' && val.toLowerCase().includes('week')) return val;
                          const parts = val.split('-');
                          if (parts.length === 3) {
                            const dateObj = new Date(val);
                            if (!isNaN(dateObj.getTime())) {
                              return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                            }
                          }
                          return val;
                        }}
                        tick={{ fontSize: 8, fontWeight: 600, fill: '#9CA3AF' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fontWeight: 600, fill: '#9CA3AF' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#9BA2FF" radius={[3, 3, 0, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="flex items-center space-x-4 justify-start mt-2 text-[9px] font-bold text-gray-600">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#9BA2FF] mr-1.5" /> Core Generated Revenue Stream</div>
              </div>
            </div>

            {/* CARD 2: SALES REVENUE PIE CONSOLE */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-900 tracking-tight">Sales Contribution Breakdown</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Percentage distribution matrix</p>
                </div>
              </div>
 
              <div className="w-full h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesRevenuePieData}
                      cx="38%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
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
                <div className="absolute left-[38%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Gross Total</p>
                  <p className="text-[13px] font-black text-gray-900 tracking-tight">₹{totalRevenueSum.toFixed(0)}</p>
                </div>

                {/* Micro Right-Side Labels Indicators Container Grid */}
                <div className="absolute right-1 top-4 bottom-4 overflow-y-auto w-[42%] flex flex-col justify-center space-y-1.5 pr-1 border-l border-gray-100 pl-3">
                  {salesRevenuePieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-[8px] font-bold text-gray-500">
                      <div className="flex items-center overflow-hidden truncate max-w-[85px]">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1.5" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-gray-900 text-right font-extrabold">₹{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 3: PRODUCT SALES TRENDS CONSOLE */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-900 tracking-tight">Product Sales Line Curve</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Performance timeline flow metrics</p>
                </div>
              </div>

              <div className="w-full h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productSalesLineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F3" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Current Revenue" stroke="#FF0B01" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Target Revenue" stroke="#4F46E5" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center space-x-4 justify-center mt-2 text-[9px] font-bold text-gray-500">
                <div className="flex items-center"><span className="w-2.5 h-0.5 bg-[#FF0B01] mr-1.5" /> Actual Achieved</div>
                <div className="flex items-center"><span className="w-2.5 h-0.5 bg-[#4F46E5] border-t border-dashed mr-1.5" /> Projected Threshold</div>
              </div>
            </div>

            {/* CARD 4: TOTAL APPOINTMENTS STAFF CONSOLE */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-900 tracking-tight">Staff Productivity Overview</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Operational volume distribution</p>
                </div>
              </div>

              <div className="w-full h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalAppointmentsStaffData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F3F3" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="Completed" fill="#7C3AED" radius={[1, 1, 0, 0]} barSize={9} />
                    <Bar dataKey="Reschedule" fill="#F87171" radius={[1, 1, 0, 0]} barSize={9} />
                    <Bar dataKey="Cancelled" fill="#22D3EE" radius={[1, 1, 0, 0]} barSize={9} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center space-x-4 justify-center mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                <div className="flex items-center"><span className="w-2 h-2 rounded-xs bg-[#7C3AED] mr-1.5" /> Completed</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-xs bg-[#F87171] mr-1.5" /> Reschedule</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-xs bg-[#22D3EE] mr-1.5" /> Cancelled</div>
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