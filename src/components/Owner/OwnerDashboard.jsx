import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Sidebar from './Layouts/SideBar';
import axiosInstance from '../../api/axiosInstance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. Asset Imports with explicit folder pathways
import upcomingAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/upcoming_appointment_icon.svg';
import todaysAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/todays_appointment_icon.svg';
import appointmentActivityIcon from '../../assets/Owner/Dashboard/CenterScreen/appointment_activity.svg';

// Helper to format X-axis labels based on the view type
const formatLabel = (label, viewType) => {
    if (!label) return '';
    try {
        // The API returns labels like "2026-06-01 09:00:00.0"
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
                return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            default:
                return label;
        }
    } catch {
        return label;
    }
};

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label, viewType }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs border border-gray-700">
                <p className="font-medium text-gray-300 mb-1">{formatLabel(label, viewType)}</p>
                <p className="font-bold text-base">₹ {payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        );
    }
    return null;
};

const VIEW_TYPES = ['day', 'week', 'month', 'year'];

const OwnerDashboard = () => {
    // Mock data for Top Services
    const services = [
        { name: 'Shaving', thisMonth: 1, lastMonth: 1 },
        { name: 'Face Wash', thisMonth: 1, lastMonth: 1 },
        { name: 'Hair Cut', thisMonth: 1, lastMonth: 1 },
        { name: 'Hair Coloring', thisMonth: 1, lastMonth: 1 },
    ];

    // Revenue graph state
    const [viewType, setViewType] = useState('day');
    const [revenueData, setRevenueData] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchRevenueData = useCallback(async (type) => {
        setRevenueLoading(true);
        try {
            const response = await axiosInstance.get(`/appointments/revenue/graph`, {
                params: { viewType: type, onlyOffers: false }
            });
            const data = response.data || [];
            setRevenueData(data);
            const total = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
            setTotalRevenue(total);
        } catch (error) {
            console.error('Failed to fetch revenue data:', error);
            setRevenueData([]);
            setTotalRevenue(0);
        } finally {
            setRevenueLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRevenueData(viewType);
    }, [viewType, fetchRevenueData]);

    const handleViewTypeChange = (type) => {
        setViewType(type);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">

            {/* --- TOP NAVBAR --- */}
            <Navbar />

            {/* --- MAIN LAYOUT WRAPPER --- */}
            <div className="flex flex-1">

                {/* --- SIDEBAR --- */}
                <Sidebar />

                {/* --- MAIN GRID DASHBOARD CANVAS --- */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
                    {/* Main Workspace Header Title */}
                    <h1 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">Dashboard</h1>

                    {/* Balanced Responsive Workspace Display Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                        {/* 1. Revenue Graph Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[340px]">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Revenue</h3>
                                        <p className="text-[11px] text-gray-400 font-medium capitalize">{viewType} view</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] text-gray-400 font-medium">Total Revenue</p>
                                        <p className="text-xl font-bold text-[#ff0b01]">₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>

                                {/* View Type Filter Tabs */}
                                <div className="flex gap-1.5 mb-5 mt-3">
                                    {VIEW_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleViewTypeChange(type)}
                                            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
                                                viewType === type
                                                    ? 'bg-[#ff0b01] text-white shadow-md shadow-red-200'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Revenue Chart */}
                            <div className="h-[200px] w-full">
                                {revenueLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="animate-spin h-8 w-8 border-2 border-[#ff0b01] border-t-transparent rounded-full"></div>
                                    </div>
                                ) : revenueData.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                        <p className="text-[12px] font-semibold text-gray-400">No revenue data available</p>
                                        <p className="text-[11px] text-gray-300 mt-0.5">Try a different time range</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ff0b01" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#ff0b01" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                tickFormatter={(val) => formatLabel(val, viewType)}
                                                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                                tickLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(val) => `₹${val}`}
                                            />
                                            <Tooltip content={<CustomTooltip viewType={viewType} />} />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#ff0b01"
                                                strokeWidth={2.5}
                                                fill="url(#revenueGradient)"
                                                dot={{ r: 4, fill: '#ff0b01', stroke: '#fff', strokeWidth: 2 }}
                                                activeDot={{ r: 6, fill: '#ff0b01', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* 2. Upcoming Appointments Panel */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[300px]">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Upcoming Appointments</h3>
                            <p className="text-[11px] text-gray-400 font-medium mb-4">Next 7 days</p>

                            <div className="flex flex-col items-center justify-center text-center my-auto pb-6">
                                <img
                                    src={upcomingAppointmentIcon}
                                    alt="Upcoming Appointments Icon"
                                    className="w-12"
                                />
                                <h4 className="text-[14px] font-bold text-gray-800 mt-3">Your Schedule Is Empty</h4>
                                <p className="text-[11px] font-semibold text-gray-400 max-w-[240px] mt-1.5 leading-relaxed">
                                    Make some appointments for schedule data to appear
                                </p>
                            </div>
                        </div>

                        {/* 3. Appointments Activity Feed Log */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[320px] flex flex-col">
                            <div className="flex items-center space-x-2 mb-4">
                                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Appointments Activity</h3>
                            </div>

                            <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-around">

                                {/* Row 1 */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <h4 className="text-[13px] font-bold text-gray-800">Shaving</h4>
                                        <div className="flex items-center space-x-1.5 mt-0.5">
                                            <img
                                                src={appointmentActivityIcon}
                                                alt="Activity Log Icon"
                                                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                                            />
                                            <p className="text-[11px] text-gray-400 font-semibold">25 July 2025, 02:30 PM</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-gray-900">₹ 200.00</p>
                                        <span className="inline-block text-[10px] bg-[#E3F9EC] text-[#299764] font-bold px-2 py-0.5 rounded-md mt-1">Completed</span>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <h4 className="text-[13px] font-bold text-gray-800">Face Wash</h4>
                                        <div className="flex items-center space-x-1.5 mt-0.5">
                                            <img
                                                src={appointmentActivityIcon}
                                                alt="Activity Log Icon"
                                                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                                            />
                                            <p className="text-[11px] text-gray-400 font-semibold">25 July 2025, 02:30 PM</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-gray-900">₹ 250.00</p>
                                        <span className="inline-block text-[10px] bg-[#E3F9EC] text-[#299764] font-bold px-2 py-0.5 rounded-md mt-1">Completed</span>
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <h4 className="text-[13px] font-bold text-gray-800">Hair Cut</h4>
                                        <div className="flex items-center space-x-1.5 mt-0.5">
                                            <img
                                                src={appointmentActivityIcon}
                                                alt="Activity Log Icon"
                                                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                                            />
                                            <p className="text-[11px] text-gray-400 font-semibold">25 July 2025, 02:30 PM</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-gray-900">₹ 200.00</p>
                                        <span className="inline-block text-[10px] bg-[#FEE2E2] text-[#EF4444] font-bold px-2 py-0.5 rounded-md mt-1">Cancelled</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* 4. Today's Next Appointments Panel */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[320px]">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Today's Next Appointments</h3>
                            <p className="text-[11px] text-gray-400 font-medium mb-4">Next 7 days</p>

                            <div className="flex flex-col items-center justify-center text-center my-auto pb-6">
                                <img
                                    src={todaysAppointmentIcon}
                                    alt="Today's Appointments Icon"
                                    className="w-12 h-12 object-contain"
                                />
                                <h4 className="text-[14px] font-bold text-gray-800 mt-3">No Appointments Today</h4>
                                <p className="text-[11px] font-semibold text-gray-400 max-w-[240px] mt-1.5 leading-relaxed">
                                    Visit the book section to add some appointments
                                </p>
                            </div>
                        </div>

                        {/* 5. Top Services Performance Ledger */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[280px]">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight mb-4">Top Services</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[12px] text-gray-500">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                                            <th className="pb-3 font-semibold">Service</th>
                                            <th className="pb-3 text-center font-semibold">This Month</th>
                                            <th className="pb-3 text-center font-semibold">Last Month</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-bold text-gray-700">
                                        {services.map((service, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3.5 text-gray-900 font-bold">{service.name}</td>
                                                <td className="py-3.5 text-center font-semibold">{service.thisMonth}</td>
                                                <td className="py-3.5 text-center font-semibold">{service.lastMonth}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 6. Top Team Member Panel */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[280px]">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Top Team Member</h3>

                            <div className="flex flex-col items-center justify-center text-center my-auto pb-4">
                                <img
                                    src={todaysAppointmentIcon}
                                    alt="Top Team Member Icon"
                                    className="w-12 h-12 object-contain"
                                />
                                <h4 className="text-[14px] font-bold text-gray-800 mt-3">No Sales Till Now</h4>
                                <p className="text-[11px] font-semibold text-gray-400 max-w-[240px] mt-1.5 leading-relaxed">
                                    Visit the book section to add some appointments
                                </p>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* --- SITE FOOTER --- */}
            <Footer />

        </div>
    );
};

export default OwnerDashboard;