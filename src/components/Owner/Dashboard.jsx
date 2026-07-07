import React, { useState, useEffect } from 'react';
import Navbar from './Layouts/Navbar';
import Footer from '../common/Footer';
import Sidebar from './Layouts/SideBar';
import axiosInstance from '../../api/axiosInstance';

// 1. Asset Imports with explicit folder pathways
import upcomingAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/upcoming_appointment_icon.svg';
import todaysAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/todays_appointment_icon.svg';
import appointmentActivityIcon from '../../assets/Owner/Dashboard/CenterScreen/appointment_activity.svg';

const Dashboard = () => {
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

    const [viewType, setViewType] = useState('week');
    const [customStartDate, setCustomStartDate] = useState(getFirstDayOfMonth());
    const [customEndDate, setCustomEndDate] = useState(getTodayDateString());
    const [graphData, setGraphData] = useState([]);
    const [loadingGraph, setLoadingGraph] = useState(true);

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        let shouldCall = true;
        let effectiveEndDate = customEndDate;
        
        if (viewType === 'custom') {
            if (!customStartDate) {
                shouldCall = false;
            } else if (!customEndDate) {
                effectiveEndDate = getTodayDateString();
            }
        }
        
        if (shouldCall) {
            setLoadingGraph(true);
            const params = { viewType };
            if (viewType === 'custom') {
                if (customStartDate) params.startDate = customStartDate;
                if (effectiveEndDate) params.endDate = effectiveEndDate;
            }
            
            axiosInstance.get(`/revenue/graph`, { params })
                .then(res => {
                    if (isMounted && res.data) {
                        setGraphData(res.data);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch revenue graph data:", err);
                })
                .finally(() => {
                    if (isMounted) setLoadingGraph(false);
                });
        } else {
            setGraphData([]);
            setLoadingGraph(false);
        }
        
        return () => {
            isMounted = false;
        };
    }, [viewType, customStartDate, customEndDate]);

    useEffect(() => {
        let isMounted = true;
        setLoadingAppointments(true);
        
        const now = new Date();
        const istTime = new Date(now.getTime() + (330 * 60000));
        const istYear = istTime.getUTCFullYear();
        const istMonth = istTime.getUTCMonth();
        const istDate = istTime.getUTCDate();
        const fromDateStr = `${istYear}-${String(istMonth + 1).padStart(2, '0')}-${String(istDate).padStart(2, '0')}T00:00:00.000+05:30`;
        
        axiosInstance.get(`/appointments/search/advanced?page=0&size=3&status=booked&fromDate=${fromDateStr}`)
            .then(res => {
                if (isMounted && res.data && res.data.content) {
                    setUpcomingAppointments(res.data.content);
                }
            })
            .catch(err => {
                console.error("Failed to fetch upcoming appointments:", err);
            })
            .finally(() => {
                if (isMounted) setLoadingAppointments(false);
            });
            
        return () => {
            isMounted = false;
        };
    }, []);

    const formatAppointmentTime = (dateStr) => {
        if (!dateStr) return '';
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) + ', ' + dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const totalRevenue = graphData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const maxRevenue = Math.max(...graphData.map(item => item.revenue), 1) || 1;

    const formatLabel = (label) => {
        if (!label) return '';
        const parts = label.split('-');
        if (parts.length === 3) {
            const dateObj = new Date(label);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }
        }
        return label;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">

            {/* --- TOP NAVBAR --- */}
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* --- MAIN LAYOUT WRAPPER --- */}
            <div className="flex flex-1">

                {/* --- SIDEBAR --- */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* --- MAIN GRID DASHBOARD CANVAS --- */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
                    {/* Main Workspace Header Title */}
                    <h1 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">Dashboard</h1>

                    {/* Balanced Responsive Workspace Display Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* 1. Recent Sales Data Card with Dynamic Revenue Graph */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[360px] h-full">
                            <div>
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Recent Sales</h3>
                                        <p className="text-[11px] text-gray-400 font-medium">Revenue Analysis</p>
                                    </div>
                                    <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                                        {['day', 'week', 'month', 'year', 'custom'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setViewType(type)}
                                                className={`px-3 py-1 rounded-md transition-all uppercase tracking-wider ${
                                                    viewType === type 
                                                    ? 'bg-white text-gray-900 shadow-sm' 
                                                    : 'text-gray-400 hover:text-gray-700'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {viewType === 'custom' && (
                                    <div className="flex items-center space-x-3 mt-3 bg-gray-50 border border-gray-200 p-3 rounded-xl max-w-xs">
                                        <div className="flex-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">From</label>
                                            <input 
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-md text-[10px] font-semibold px-2 py-1 focus:outline-none focus:border-red-500 text-gray-700"
                                            />
                                        </div>
                                        <div className="text-gray-300 text-[10px] mt-3">to</div>
                                        <div className="flex-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">To</label>
                                            <input 
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-md text-[10px] font-semibold px-2 py-1 focus:outline-none focus:border-red-500 text-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="text-2xl font-bold text-red-600 mt-3 mb-4">
                                    ₹ {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>

                            {/* Graphic Chart Simulation Visuals */}
                            <div className="h-32 flex items-end justify-between px-2 pt-4 relative border-b border-gray-100">
                                {loadingGraph ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-bold animate-pulse">
                                        Loading graph data...
                                    </div>
                                ) : graphData.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-bold">
                                        No sales data available
                                    </div>
                                ) : (
                                    graphData.map((item, i) => {
                                        const pct = (item.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={i} className="flex flex-col items-center h-full w-full justify-end mx-1 group relative">
                                                {/* Tooltip on Hover */}
                                                <span className="absolute bottom-full mb-2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 shadow-md whitespace-nowrap">
                                                    ₹{item.revenue.toFixed(2)}
                                                </span>
                                                <div 
                                                    style={{ height: `${Math.max(pct, 4)}%` }} 
                                                    className="w-5 bg-gradient-to-t from-[#ff0b01]/30 to-[#ff0b01] hover:to-[#d00800] rounded-t-md transition-all duration-300 shadow-sm cursor-pointer"
                                                ></div>
                                                <span className="text-[9px] text-gray-400 font-bold mt-2 truncate w-full text-center">
                                                    {formatLabel(item.label)}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="flex items-center space-x-5 mt-4 text-[11px] font-bold text-gray-500 pl-2">
                                <span className="flex items-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-t from-[#ff0b01]/30 to-[#ff0b01] mr-2"></span>
                                    Sales Revenue ({viewType})
                                </span>
                            </div>
                        </div>

                        {/* 2. Upcoming Appointments Panel */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[360px] h-full justify-between">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Upcoming Appointments</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Booked appointments from today</p>
                                </div>
                                <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Booked
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col">
                                {loadingAppointments ? (
                                    <div className="my-auto py-8 text-center text-xs text-gray-400 font-bold animate-pulse">
                                        Loading upcoming appointments...
                                    </div>
                                ) : upcomingAppointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center my-auto pb-6">
                                        <img
                                            src={upcomingAppointmentIcon}
                                            alt="Upcoming Appointments Icon"
                                            className="w-12 opacity-60"
                                        />
                                        <h4 className="text-[14px] font-bold text-gray-800 mt-3">No Upcoming Appointments</h4>
                                        <p className="text-[11px] font-semibold text-gray-400 max-w-[240px] mt-1.5 leading-relaxed">
                                            There are no scheduled appointments starting from today.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {upcomingAppointments.map((appt) => (
                                            <div key={appt.id} className="p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="text-[13px] font-bold text-gray-900 truncate">{appt.customerName}</h4>
                                                        <span className="text-[10px] text-gray-400 font-semibold">•</span>
                                                        <p className="text-[11px] text-gray-500 font-semibold">{appt.customerMobile}</p>
                                                    </div>
                                                    
                                                    {/* Services pills list */}
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {appt.serviceNames && appt.serviceNames.map((srv, idx) => (
                                                            <span key={idx} className="text-[9px] bg-white border border-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded">
                                                                {srv}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-gray-400 font-semibold">
                                                        <span>Time: <strong className="text-gray-600">{formatAppointmentTime(appt.appointmentAt)}</strong></span>
                                                        <span>•</span>
                                                        <span>Staff: <strong className="text-gray-600">{appt.staffName || 'Unassigned'}</strong></span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex md:flex-col items-end justify-between md:justify-center gap-1.5 pt-2 md:pt-0 border-t md:border-0 border-gray-100">
                                                    <p className="text-[14px] font-black text-gray-900">₹{appt.finalAmount.toFixed(2)}</p>
                                                    <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                        appt.status === 'in_progress'
                                                        ? 'bg-orange-50 text-orange-600'
                                                        : appt.status === 'booked' 
                                                        ? 'bg-green-50 text-green-600' 
                                                        : appt.status === 'cancelled' 
                                                        ? 'bg-red-50 text-red-600' 
                                                        : appt.status === 'completed'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-gray-50 text-gray-600'
                                                    }`}>
                                                        {appt.status === 'in_progress' ? 'In Progress' : appt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Appointments Activity Feed Log */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[320px] flex flex-col h-full justify-between">
                            <div className="flex items-center space-x-2 mb-4">
                                {/* Inserted activity icon asset alongside header title */}

                                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Appointments Activity</h3>
                            </div>

                            <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-around">

                                {/* Row 1 */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <h4 className="text-[13px] font-bold text-gray-800">Shaving</h4>
                                        {/* Container to force horizontal alignment */}
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
                                        {/* Container to force horizontal alignment */}
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
                                        {/* Container to force horizontal alignment */}
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
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[320px] h-full justify-between">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Today's Next Appointments</h3>
                            <p className="text-[11px] text-gray-400 font-medium mb-4">Next 7 days</p>

                            <div className="flex flex-col items-center justify-center text-center my-auto pb-6">
                                {/* Replaced generic calendar icon with todaysAppointmentIcon */}
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



                        {/* 6. Top Team Member Panel */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[280px] col-span-1 lg:col-span-2">
                            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Top Team Member</h3>

                            <div className="flex flex-col items-center justify-center text-center my-auto pb-4">
                                {/* Replaced generic identity block with todaysAppointmentIcon per instruction */}
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
}

export default Dashboard;