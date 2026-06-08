import React, { useState } from 'react';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";

const HomeServices = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [enableBookings, setEnableBookings] = useState(false);
    const [serviceCharge, setServiceCharge] = useState('0.0');

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Saving Home Service configuration:', {
            enableBookings,
            serviceCharge
        });
        // Add your backend API mutation logic here
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVBAR */}
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* THREE-COLUMN LAYOUT FRAMEWORK CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">

                {/* LEVEL 1: PRIMARY APP SIDEBAR */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* LEVEL 2: SUB-MANAGEMENT APP SIDEBAR */}
                <ManageSideBar activeTab="Home Services" onTabChange={(tab) => console.log(`Routing to workspace: ${tab}`)} />

                {/* LEVEL 3: WORKING PANELS CANVAS */}
                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">

                    {/* Active Feature Headline Indicator */}
                    <div className="inline-block border-b-2 border-red-600 pb-1 mb-8">
                        <div className="flex items-center text-gray-900">
                            <span className="text-[12px] font-bold uppercase tracking-wider">
                                Home Service
                            </span>
                        </div>
                    </div>

                    {/* HOME SERVICE MANAGEMENT PANEL */}
                    <form onSubmit={handleSave} className="max-w-4xl">
                        
                        {/* Toggle Configuration Header Row */}
                        <div className="flex items-center justify-between pb-6 border-b border-dashed border-gray-200">
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                    Enable Bookings
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium">
                                    Allow customers to book appointments at their location.
                                </p>
                            </div>

                            {/* Custom CSS Toggle Switch Component */}
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={enableBookings}
                                    onChange={(e) => setEnableBookings(e.target.checked)}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-[#FF0B01]"></div>
                            </label>
                        </div>

                        {/* Interactive Input Action Work Row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6">
                            
                            {/* Controlled Currency Form Field Block */}
                            <div className="w-full max-w-sm space-y-1.5">
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                                        <span className="text-gray-500 text-sm">₹</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="serviceCharge"
                                        id="serviceCharge"
                                        value={serviceCharge}
                                        onChange={(e) => setServiceCharge(e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 bg-white py-2.5 ps-8 pe-4 text-sm text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none transition-colors"
                                        placeholder="0.0"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium tracking-tight ps-1">
                                    This amount will be added to the service total.
                                </p>
                            </div>

                            {/* Global Action Commit Button */}
                            <button
                                type="submit"
                                className="w-full sm:w-auto min-w-[180px] bg-[#FF0B01] text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-md hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Save
                            </button>

                        </div>

                    </form>

                </main>
            </div>

            {/* GLOBAL FOOTER */}
            <Footer />
        </div>
    );
}

export default HomeServices;