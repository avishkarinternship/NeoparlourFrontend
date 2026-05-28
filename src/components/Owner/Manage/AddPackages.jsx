import React, { useState } from 'react';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from '../Layouts/ManageSideBar';

// SVG Icon Asset Imports (Stepping up 3 levels to match your project structure)
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';

// Custom icons matching package configurations
import productDetailsIcon from '../../../assets/Owner/Manage/Products/product_details_icon.svg';
import couponCodeIcon from '../../../assets/Owner/Manage/Products/coupon_code_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Products/percentage_icon.svg';
import rateIcon from '../../../assets/Owner/Manage/Products/rate_icon.svg';

const AddPackages = () => {
    // Controlled Form Inputs State Management
    const [packageDetails, setPackageDetails] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [percentageOff, setPercentageOff] = useState('');
    const [rate, setRate] = useState('');

    // Recent Packages Mock Data matching the UI Cards
    const [recentPackages] = useState([
        {
            id: '1',
            price: '1499',
            description: 'Fullbody Waxing Including Waxing, facial, And pedicure'
        },
        {
            id: '2',
            price: '2499',
            description: 'Hair treatment'
        },
    ]);

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Publishing Package Data Payload:', {
            packageDetails,
            couponCode,
            percentageOff,
            rate
        });
    };

    const handleCancel = () => {
        setPackageDetails('');
        setCouponCode('');
        setPercentageOff('');
        setRate('');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVIGATION PANEL */}
            <Navbar />

            {/* THREE COLUMN INTEGRATION BODY WRAPPER CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">
                
                {/* LEVEL 1: APPLICATION WORKSPACE PRIMARY NAVIGATION CONTROL */}
                <Sidebar />

                {/* LEVEL 2: SUB-MANAGEMENT DRAWER ACTIONS CONTROLLER */}
                <ManageSideBar activeTab="Add Packages" onTabChange={(tab) => console.log(`Redirecting UI Context: ${tab}`)} />

                {/* LEVEL 3: ACTIVE PACKAGES WORKSPACE INTERACTION PANEL */}
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200">
                    
                    {/* Workspace Headline Identifier Action Marker */}
                    <div className="inline-block border-b-2 border-red-600 pb-1 mb-6">
                        <div className="flex items-center text-gray-900 space-x-1.5">
                            <span className="text-sm font-bold text-gray-800">+</span>
                            <span className="text-[12px] font-bold uppercase tracking-wider">
                                Add Package
                            </span>
                        </div>
                    </div>

                    {/* CENTRAL PACKAGE SPECIFICATION CARD FIELD ENVIRONMENT */}
                    <div className="max-w-4xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">
                        <form onSubmit={handleSave} className="space-y-5">
                            
                            {/* Graphic Canvas Image Integration Section */}
                            <div className="border border-gray-300 rounded-lg p-5 bg-white flex flex-col items-center justify-center space-y-3">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <img src={cameraIcon} alt="Photo Capture Matrix" className="w-8 h-8 mb-1 opacity-70" />
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tight">Add Image</span>
                                </div>
                                
                                {/* Camera & Gallery Alternative Actions Line */}
                                <div className="flex items-center space-x-6 pt-0.5 text-[11px] text-gray-700 font-bold">
                                    <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900">
                                        <img src={openCameraIcon} alt="Integrated Optical Camera Target" className="w-4 h-4" />
                                        <span>Camera</span>
                                    </button>
                                    <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900">
                                        <img src={galleryIcon} alt="System Drive Local Folder Storage" className="w-4 h-4" />
                                        <span>Gallery</span>
                                    </button>
                                </div>
                            </div>

                            {/* Data Capture Form Matrix Grid Rows */}
                            <div className="space-y-4">
                                
                                {/* Row Input 1: Package Details (Full Width Input) */}
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                        <img src={productDetailsIcon} alt="Package Details Icon" className="w-4 h-4 opacity-60" />
                                    </div>
                                    <input
                                        type="text"
                                        value={packageDetails}
                                        onChange={(e) => setPackageDetails(e.target.value)}
                                        placeholder="Package Details"
                                        className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Row Input 2: Parallel Coupon Code and Percentage Off Drops Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                            <img src={couponCodeIcon} alt="Coupon Code Icon" className="w-4 h-4 opacity-60" />
                                        </div>
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Coupon Code"
                                            className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                            <img src={percentageIcon} alt="Percentage Icon" className="w-4 h-4 opacity-60" />
                                        </div>
                                        <select
                                            value={percentageOff}
                                            onChange={(e) => setPercentageOff(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-10 text-xs text-gray-400 appearance-none focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                        >
                                            <option value="">Percentage Off</option>
                                            <option value="10">10% Off</option>
                                            <option value="25">25% Off</option>
                                            <option value="50">50% Off</option>
                                        </select>
                                        <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-gray-400 text-[10px]">
                                            ⏷
                                        </div>
                                    </div>
                                </div>

                                {/* Row Input 3: Valuation Package Pricing Rate (Full Width Input) */}
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                        <img src={rateIcon} alt="Rate Icon" className="w-4 h-4 opacity-60" />
                                    </div>
                                    <input
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setRate(e.target.value)}
                                        placeholder="Rate"
                                        className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Processing Action Confirmation Call To Actions */}
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

                    {/* LIVE RECENT PACKAGES INVENTORY COLLECTION DASHBOARD SECTION */}
                    <div className="max-w-4xl space-y-4">
                        <div className="text-[12px] font-bold text-gray-900 tracking-wider uppercase">
                            Recent Package
                        </div>

                        {/* Inventory Card Horizontal Gradient Container Framework */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {recentPackages.map((pkg) => (
                                <div 
                                    key={pkg.id} 
                                    className="rounded-2xl h-[155px] bg-gradient-to-b from-[#AAAAAA] via-[#BCBCBC] to-[#C93328] p-5 flex flex-col justify-between text-white relative shadow-sm overflow-hidden group hover:scale-[1.01] transition-transform duration-200"
                                >
                                    {/* Typography Metadata & Description */}
                                    <div className="space-y-1.5 max-w-[70%]">
                                        <div className="text-2xl font-black tracking-tight flex items-baseline">
                                            <span className="text-lg font-bold mr-1">₹</span>
                                            {pkg.price}
                                        </div>
                                        <p className="text-[10px] leading-tight text-gray-100 opacity-90 line-clamp-3 font-normal">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    {/* Lower Control Actions Actionable Row Node Element */}
                                    <div className="flex items-center justify-between w-full pt-2">
                                        <button 
                                            type="button" 
                                            className="bg-[#B90000] text-white text-[8px] font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-red-900 transition-colors"
                                        >
                                            Claim Offer
                                        </button>

                                        {/* Pagination Slider Dot Indicators Node */}
                                        <div className="flex space-x-1.5 items-center pr-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${pkg.id === '1' ? 'bg-[#FF0B01]' : 'bg-white/40'}`}></span>
                                            <span className={`w-1.5 h-1.5 rounded-full ${pkg.id === '2' ? 'bg-[#FF0B01]' : 'bg-white/40'}`}></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                                        </div>
                                    </div>

                                    {/* Right Side Curve Graphical Gradient Overlay Accent (Matches UI perfectly) */}
                                    <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-gradient-to-l from-black/5 to-transparent pointer-events-none rounded-r-2xl" />
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>

            {/* APPLICATION REUSABLE FOOTER GRAPHIC PANEL */}
            <Footer />
        </div>
    );
}

export default AddPackages;