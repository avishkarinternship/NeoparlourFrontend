import React, { useState } from 'react';

import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from '../Layouts/ManageSideBar';

// SVG Icon Asset Imports (Stepping up 3 levels to reach src/assets)
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';

// Updated product assets path as specified
import couponCodeIcon from '../../../assets/Owner/Manage/Products/coupon_code_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Products/percentage_icon.svg';
import productDescriptionIcon from '../../../assets/Owner/Manage/Products/product_description_icon.svg';
import productDetailsIcon from '../../../assets/Owner/Manage/Products/product_details_icon.svg';
import productQuantityIcon from '../../../assets/Owner/Manage/Products/product_quantity_icon.svg';
import productTypeIcon from '../../../assets/Owner/Manage/Products/product_type_icon.svg';
import rateIcon from '../../../assets/Owner/Manage/Products/rate_icon.svg';

const AddProducts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Controlled Form Inputs State Management
    const [productDetails, setProductDetails] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [productType, setProductType] = useState('');
    const [rate, setRate] = useState('');
    const [percentageOff, setPercentageOff] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productDescription, setProductDescription] = useState('');

    // Updated Recent Products Dataset to match image assets perfectly
    const [recentProducts] = useState([
        {
            id: '1',
            name: "L'Oreal Paris Extraordinary Oil Hair Serum",
            price: '470.00',
            volume: '100ml',
            hasOrangeBg: true // Matches the first product block layout
        },
        {
            id: '2',
            name: 'Ecocradle Complete Care Hair Serum',
            price: '500.00',
            volume: '50ml',
            hasOrangeBg: false
        },
        {
            id: '3',
            name: 'Hyphen 18% Brightening + 20% Collagen Face Serum',
            price: '500.00',
            volume: '50ml',
            hasOrangeBg: false
        },
        {
            id: '4',
            name: 'wiss Beauty Cream It Up Blush',
            price: '225.00',
            volume: '50ml',
            hasOrangeBg: false
        },
        {
            id: '5',
            name: 'Fixer Spray for Face makeup',
            price: '236.00',
            volume: '50ml',
            hasOrangeBg: false
        }
    ]);

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Publishing Product Data Payload:', {
            productDetails,
            couponCode,
            productType,
            rate,
            percentageOff,
            productQuantity,
            productDescription
        });
    };

    const handleCancel = () => {
        setProductDetails('');
        setCouponCode('');
        setProductType('');
        setRate('');
        setPercentageOff('');
        setProductQuantity('');
        setProductDescription('');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVIGATION PANEL */}
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* THREE COLUMN INTEGRATION BODY WRAPPER CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">
                
                {/* LEVEL 1: APPLICATION WORKSPACE PRIMARY NAVIGATION CONTROL */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* LEVEL 2: SUB-MANAGEMENT DRAWER ACTIONS CONTROLLER */}
                <ManageSideBar activeTab="Add Products" onTabChange={(tab) => console.log(`Redirecting UI Context: ${tab}`)} />

                {/* LEVEL 3: ACTIVE PRODUCT INTERACTION PANEL WORKSPACE */}
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200">
                    
                    {/* Workspace Headline Identifier Action Marker */}
                    <div className="inline-block border-b-2 border-red-600 pb-1 mb-6">
                        <div className="flex items-center text-gray-900 space-x-1.5">
                            <span className="text-sm font-bold text-gray-800">+</span>
                            <span className="text-[12px] font-bold uppercase tracking-wider">
                                Add Product
                            </span>
                        </div>
                    </div>

                    {/* CENTRAL PRODUCTION SPECIFICATION CARD FIELD ENVIRONMENT */}
                    <div className="max-w-4xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">
                        <form onSubmit={handleSave} className="space-y-5">
                            
                            {/* Graphic Canvas Image Integration Section */}
                            <div className="border border-gray-300 rounded-lg p-6 bg-white flex flex-col items-center justify-center space-y-3">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <img src={cameraIcon} alt="Photo Capture Matrix Trigger" className="w-8 h-8 mb-1 opacity-70" />
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tight">Add Image</span>
                                </div>
                                
                                {/* Secondary Trigger Media Select Elements */}
                                <div className="flex items-center space-x-6 pt-1 text-[11px] text-gray-700 font-bold">
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

                            {/* Data Capture Layout Block Rows Matrix */}
                            <div className="space-y-4">
                                
                                {/* Row Input 1: Primary Full Span Details Field */}
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                        <img src={productDetailsIcon} alt="Product Details Icon" className="w-4 h-4 opacity-60" />
                                    </div>
                                    <input
                                        type="text"
                                        value={productDetails}
                                        onChange={(e) => setProductDetails(e.target.value)}
                                        placeholder="Product Details"
                                        className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Row Input 2: Parallel Coupon and Category Selector Elements */}
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
                                            <img src={productTypeIcon} alt="Product Type Icon" className="w-4 h-4 opacity-60" />
                                        </div>
                                        <select
                                            value={productType}
                                            onChange={(e) => setProductType(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-10 text-xs text-gray-400 appearance-none focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                        >
                                            <option value="">Product Type</option>
                                            <option value="Hair Care">Hair Care</option>
                                            <option value="Skin Cosmetics">Skin Cosmetics</option>
                                            <option value="Serums">Serums</option>
                                        </select>
                                        <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-gray-400 text-[10px]">
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Row Input 3: Valuation Financial and Discount Settings Box */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Row Input 4: Full-width Volume Allocation Quantity (Tax dropdown removed) */}
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                        <img src={productQuantityIcon} alt="Product Quantity Icon" className="w-4 h-4 opacity-60" />
                                    </div>
                                    <input
                                        type="number"
                                        value={productQuantity}
                                        onChange={(e) => setProductQuantity(e.target.value)}
                                        placeholder="Product Quantity"
                                        className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Row Input 5: Rich Character Production Summary Box */}
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 start-0 flex items-start pt-3 ps-4 pointer-events-none">
                                        <img src={productDescriptionIcon} alt="Product Description Icon" className="w-4 h-4 opacity-60" />
                                    </div>
                                    <textarea
                                        value={productDescription}
                                        onChange={(e) => setProductDescription(e.target.value)}
                                        placeholder="Product Description"
                                        rows="3"
                                        className="block w-full rounded-lg border border-gray-300 bg-[#FBFBFB] py-3 ps-10 pe-4 text-xs text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            {/* Processing Core Dispatch Button Interface Row */}
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

                    {/* LIVE RECENT INVENTORY ITEMS DASHBOARD GRID SECTION */}
                    <div className="max-w-4xl space-y-5">
                        <div className="text-[12px] font-bold text-gray-900 tracking-wider uppercase">
                            Recent Products
                        </div>

                        {/* Inventory Card Layout Container Framework Grid matches layout exactly */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-6">
                            {recentProducts.map((product) => (
                                <div key={product.id} className="flex flex-col group">
                                    
                                    {/* Vertical gradient shape canvas layer block (fades clear to red/orange background accents) */}
                                    <div className={`w-full aspect-[0.72/1] rounded-2xl overflow-hidden mb-3 relative transition-transform duration-200 group-hover:scale-[1.02] ${
                                        product.hasOrangeBg 
                                            ? 'bg-gradient-to-b from-[#E04622] to-[#FF3E14]' 
                                            : 'bg-gradient-to-b from-[#EAEAEA] to-[#FF4E31]'
                                    }`}>
                                        {/* Once real image asset fields are re-populated, use standard tag: 
                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 filter drop-shadow-md" /> 
                                        */}
                                    </div>

                                    {/* Typography Metadata & Field Parameters Container Block */}
                                    <div className="space-y-1.5 px-0.5">
                                        <h5 className="text-[11px] font-normal text-gray-900 line-clamp-2 min-h-[32px] leading-[1.3] tracking-tight">
                                            {product.name}
                                        </h5>
                                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                                            <span className="text-gray-900 font-medium">
                                                ₹ {product.price}
                                            </span>
                                            <span className="text-gray-400 font-normal">
                                                {product.volume}
                                            </span>
                                        </div>
                                    </div>

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

export default AddProducts;