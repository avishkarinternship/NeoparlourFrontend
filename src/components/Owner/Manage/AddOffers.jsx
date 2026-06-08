import React, { useState } from 'react';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';

// SVG Icon Asset Imports (Updated relative paths to reach src/assets)
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import couponCodeIcon from '../../../assets/Owner/Manage/Offers/coupon_code.svg';
import offerDetailsIcon from '../../../assets/Owner/Manage/Offers/offer_details_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Offers/percentage_icon.svg';
import ManageSideBar from "../Layouts/ManageSideBar";

const AddOffers = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Controlled Form State variables 
    const [offerDetails, setOfferDetails] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [percentageOff, setPercentageOff] = useState('');

    // Offer List Mock Data 
    const [offersList, setOffersList] = useState([
        {
            id: '1',
            title: '1ST BOOKING SPECIAL',
            description: 'Get 50% Off On Your First booking',
            badgeText: '50% OFF',
            code: 'FIRST50',
            validity: 'Valid Till 20 May 2026',
            isRed: true
        },
        {
            id: '2',
            title: 'WEEKEND BEAUTY DEAL',
            description: 'Weekend Bookings Get Extra Discount On All Services',
            badgeText: '30% OFF',
            code: 'WEEKEND30',
            validity: 'Valid Till 20 May 2026',
            isRed: false
        },
        {
            id: '3',
            title: 'HAPPY HOUR SPECIAL',
            description: 'Get 50% Off On Your First booking',
            badgeText: '50% OFF',
            code: 'FIRST50',
            validity: 'Valid Till 30 May 2026',
            isRed: true
        }
    ]);

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Submitting Offer payload:', { offerDetails, couponCode, percentageOff });
    };

    const handleCancel = () => {
        setOfferDetails('');
        setCouponCode('');
        setPercentageOff('');
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
                <ManageSideBar activeTab="Add Offers" onTabChange={(tab) => console.log(`Routing to workspace: ${tab}`)} />

                {/* LEVEL 3: WORKING PANELS CANVAS */}
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200">

                    {/* Section Form Headline Title */}
                    <div className="inline-block border-b-2 border-red-600 pb-1 mb-6">
                        <div className="flex items-center text-gray-900 space-x-1.5">
                            <span className="text-sm font-bold text-gray-800">+</span>
                            <span className="text-[12px] font-bold uppercase tracking-wider">
                                Add Offer
                            </span>
                        </div>
                    </div>

                    {/* INTERACTIVE DATA CAPTURE CARD FRAME */}
                    <div className="max-w-4xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">
                        <form onSubmit={handleSave} className="space-y-5">
                            
                            {/* Media Upload Canvas Panel Box */}
                            <div className="border border-gray-300 rounded-lg p-6 bg-white flex flex-col items-center justify-center space-y-3">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <img src={cameraIcon} alt="Camera Icon" className="w-8 h-8 mb-1 opacity-70" />
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tight">Add Image</span>
                                </div>
                                
                                {/* Device Sourced Route Triggers */}
                                <div className="flex items-center space-x-6 pt-1 text-[11px] text-gray-700 font-bold">
                                    <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900">
                                        <img src={openCameraIcon} alt="Open Camera" className="w-4 h-4" />
                                        <span>Camera</span>
                                    </button>
                                    <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900">
                                        <img src={galleryIcon} alt="Gallery" className="w-4 h-4" />
                                        <span>Gallery</span>
                                    </button>
                                </div>
                            </div>

                            {/* Form Input Block Elements */}
                            <div className="space-y-4">
                                {/* Row 1: Full-Width Details Field */}
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                        <img src={offerDetailsIcon} alt="Offer Details" className="w-4 h-4 opacity-60" />
                                    </div>
                                    <input
                                        type="text"
                                        value={offerDetails}
                                        onChange={(e) => setOfferDetails(e.target.value)}
                                        placeholder="Offer Details"
                                        className="block w-full rounded-lg border border-gray-300 bg-white py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Row 2: Coupon Code and Percentage Fields side-by-side */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                            <img src={couponCodeIcon} alt="Coupon Code" className="w-4 h-4 opacity-60" />
                                        </div>
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Coupon Code"
                                            className="block w-full rounded-lg border border-gray-300 bg-white py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                            <img src={percentageIcon} alt="Percentage Off" className="w-4 h-4 opacity-60" />
                                        </div>
                                        <select
                                            value={percentageOff}
                                            onChange={(e) => setPercentageOff(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-white py-3 ps-10 pe-10 text-xs text-gray-400 appearance-none focus:border-gray-400 focus:outline-none transition-colors"
                                        >
                                            <option value="">Percentage Off</option>
                                            <option value="10">10% Off</option>
                                            <option value="20">20% Off</option>
                                            <option value="30">30% Off</option>
                                            <option value="50">50% Off</option>
                                        </select>
                                        <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-gray-400 text-[10px]">
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Processing Interface Actions Layout Block */}
                            <div className="flex items-center justify-center space-x-4 pt-4 max-w-xl mx-auto">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#FF0B01] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-center"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest py-3 rounded-lg bg-white hover:bg-gray-50 transition-colors text-center"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* LIVE PRESENTATION PREVIEW GRID BLOCKS */}
                    <div className="max-w-4xl space-y-4">
                        <div className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-1">
                            Offer Details
                        </div>

                        {/* Flex Grid Display Workspace Row Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {offersList.map((offer) => (
                                <div
                                    key={offer.id}
                                    className={`relative rounded-2xl p-5 text-white flex flex-col justify-between aspect-[1.8/1] shadow-sm overflow-hidden select-none ${
                                        offer.isRed ? 'bg-[#FF0B01]' : 'bg-[#A3A6AC]'
                                    }`}
                                >
                                    {/* Top Content Row Info */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 max-w-[70%]">
                                            <h4 className="text-[12px] font-extrabold tracking-tight leading-tight">
                                                {offer.title}
                                            </h4>
                                            <p className="text-[9px] font-medium opacity-85 leading-tight">
                                                {offer.description}
                                            </p>
                                        </div>

                                        {/* Styled Circular Dotted Multiplier Badge */}
                                        <div className="bg-white text-gray-900 rounded-full w-16 h-16 min-w-[64px] min-h-[64px] flex flex-col items-center justify-center text-center p-2 border border-dashed border-gray-300 shadow-sm flex-shrink-0">
                                            <span className="text-[11px] font-black leading-none uppercase tracking-tighter">
                                                {offer.badgeText.split(' ')[0]}
                                            </span>
                                            <span className="text-[9px] font-bold leading-none tracking-tighter text-gray-500 mt-1">
                                                {offer.badgeText.split(' ')[1]}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Info and Code Claim row */}
                                    <div className="flex justify-between items-end pt-4">
                                        <div className="space-y-1">
                                            <button 
                                                type="button"
                                                className="text-[8px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 text-white border border-white/20 transition-colors"
                                            >
                                                Claim Offer
                                            </button>
                                        </div>
                                        
                                        <div className="text-right space-y-0.5">
                                            <div className="text-[9px] font-extrabold tracking-wide">
                                                Code - <span className="underline">{offer.code}</span>
                                            </div>
                                            <div className="text-[8px] font-medium opacity-75 tracking-tight">
                                                {offer.validity}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Gift Box Silhouette Overlay Graphic Accent */}
                                    <div className="absolute right-20 bottom-5 opacity-15 pointer-events-none text-xl">
                                        🎁
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>

            {/* GLOBAL FOOTER */}
            <Footer />
        </div>
    );
}

export default AddOffers;