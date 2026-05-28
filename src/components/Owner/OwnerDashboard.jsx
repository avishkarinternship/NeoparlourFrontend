import React from 'react';
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Sidebar from './Layouts/SideBar';

// 1. Asset Imports with explicit folder pathways
import upcomingAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/upcoming_appointment_icon.svg';
import todaysAppointmentIcon from '../../assets/Owner/Dashboard/CenterScreen/todays_appointment_icon.svg';
import appointmentActivityIcon from '../../assets/Owner/Dashboard/CenterScreen/appointment_activity.svg';

const OwnerDashboard = () => {
    // Mock data for Top Services
    const services = [
        { name: 'Shaving', thisMonth: 1, lastMonth: 1 },
        { name: 'Face Wash', thisMonth: 1, lastMonth: 1 },
        { name: 'Hair Cut', thisMonth: 1, lastMonth: 1 },
        { name: 'Hair Coloring', thisMonth: 1, lastMonth: 1 },
    ];

    // Mock chart data distribution matching image levels
    const chartBars = [
        { s: 50, a: 30 }, { s: 35, a: 45 }, { s: 40, a: 55 }, { s: 70, a: 35 },
        { s: 80, a: 45 }, { s: 60, a: 50 }, { s: 75, a: 65 }, { s: 30, a: 80 },
        { s: 55, a: 40 }, { s: 65, a: 70 }, { s: 20, a: 45 }, { s: 40, a: 25 }
    ]; 

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

                        {/* 1. Recent Sales Data Card with Graphical Simulation */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[300px]">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Recent Sales</h3>
                                        <p className="text-[11px] text-gray-400 font-medium">Last 7 days</p>
                                    </div>
                                    <div className="text-right text-[11px] font-semibold text-gray-500 space-y-0.5">
                                        <p>Appointments: <span className="text-gray-900 font-bold">12</span></p>
                                        <p>Appointments Value: <span className="text-gray-900 font-bold">1200</span></p>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-red-600 mt-3 mb-4">₹ 0.0</div>
                            </div>

                            {/* Graphic Chart Simulation Visuals */}
                            <div className="h-28 flex items-end justify-between px-2 pt-4 relative border-b border-gray-200">
                                {chartBars.map((item, i) => (
                                    <div key={i} className="flex space-x-[2px] items-end h-full w-full justify-center mx-0.5">
                                        <div style={{ height: `${item.s}%` }} className="w-1.5 bg-[#B176CE] rounded-t-sm"></div>
                                        <div style={{ height: `${item.a}%` }} className="w-1.5 bg-[#4B49EC] rounded-t-sm"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center space-x-5 mt-4 text-[11px] font-bold text-gray-500 pl-2">
                                <span className="flex items-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#B176CE] mr-2"></span> Sales
                                </span>
                                <span className="flex items-center"> 
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#4B49EC] mr-2"></span> Appointments
                                </span>
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