import React, { useState } from 'react';

// Custom Asset Icons (matching your directory path convention)
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg'; // Reuse for consistency if needed
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";

const Feedback = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Initial mock data matching your feedback screen design
    const [feedbackList, setFeedbackList] = useState([
        {
            id: '1',
            name: 'Mitesh Waghmode',
            comment: 'service is good and staff behaviour is better',
            rating: '4.5',
            initial: 'M'
        },
        {
            id: '2',
            name: 'Avishkar bansode',
            comment: 'service is good and staff behaviour is better',
            rating: '4.5',
            initial: 'A'
        },
        {
            id: '3',
            name: 'Pravin Ithape',
            comment: 'service is good and staff behaviour is better',
            rating: '4.5',
            initial: 'P'
        }
    ]);

    const handleApprove = (id) => {
        console.log(`Approved feedback ID: ${id}`);
        // Handle production approval workflow logic here
    };

    const handleReject = (id) => {
        console.log(`Rejected feedback ID: ${id}`);
        // Handle production rejection workflow logic here
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
                <ManageSideBar activeTab="Feedback" onTabChange={(tab) => console.log(`Routing to workspace: ${tab}`)} />

                {/* LEVEL 3: WORKING PANELS CANVAS */}
                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">

                    {/* Active Feature Headline Indicator */}
                    <div className="inline-block border-b-2 border-red-600 pb-2 mb-8">
                        <div className="flex items-center text-gray-900">
                            <span className="text-[13px] font-bold uppercase tracking-wider">
                                Feedback
                            </span>
                        </div>
                    </div>

                    {/* FEEDBACK LIST WORKSPACE PANELS */}
                    <div className="max-w-4xl space-y-4">
                        {feedbackList.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border-b border-dashed border-gray-200 pb-5 gap-4"
                            >
                                {/* Left Section: Avatar Initials & Content inline side-by-side */}
                                <div className="flex items-center space-x-4">
                                    {/* Circle Initials Avatar Holder */}
                                    <div className="w-10 h-10 min-w-[40px] rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-800 font-bold text-sm shadow-sm">
                                        {item.initial}
                                    </div>

                                    {/* Text Stack Details */}
                                    <div className="flex flex-col justify-center">
                                        {/* Name Header Line */}
                                        <h4 className="text-[13px] font-bold text-gray-900 tracking-tight leading-none mb-1">
                                            {item.name}
                                        </h4>

                                        {/* Metadata Inline Row (Comment | ★ Rating) */}
                                        <div className="flex items-center text-[11px] text-gray-400 font-medium tracking-tight whitespace-nowrap">
                                            <span>{item.comment}</span>

                                            {/* Separator Pipe */}
                                            <span className="mx-2 text-gray-300 font-light text-[10px]">|</span>

                                            {/* Rating Display */}
                                            <div className="flex items-center space-x-1">
                                                <span className="text-amber-500 text-sm leading-none -mt-0.5">★</span>
                                                <span className="text-[10px] text-gray-500 font-bold">{item.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div> {/* <-- Correctly closes the Left Section container */}

                                {/* Right Section: Interactive Action Panel Buttons */}
                                <div className="flex items-center space-x-3 self-end sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => handleApprove(item.id)}
                                        className="bg-[#FF0B01] text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2 rounded-md hover:bg-red-700 transition-colors shadow-sm min-w-[90px]"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleReject(item.id)}
                                        className="border border-gray-300 text-gray-500 text-[10px] font-bold uppercase tracking-wider px-6 py-2 rounded-md bg-white hover:bg-gray-50 transition-colors min-w-[90px]"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </main>
            </div>

            {/* GLOBAL FOOTER */}
            <Footer />
        </div>
    );
}

export default Feedback;