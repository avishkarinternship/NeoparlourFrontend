import React, { useState } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';

// Custom assets imports based on your naming patterns
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import categoryIcon from '../../../assets/Owner/Manage/Services/category_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import priceIcon from '../../../assets/Owner/Manage/Services/price_icon.svg';
import serviceNameIcon from '../../../assets/Owner/Manage/Services/service_name_icon.svg'; 
import durationIcon from '../../../assets/Owner/Manage/Services/duration_icon.svg'; 
import assignStaff from '../../../assets/Owner/Manage/Schedule/assign_staff_icon.svg';
import ManageSideBar from "../Layouts/ManageSideBar";

const Inventory = () => {
    // Form management state variables
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    // Active bottom list filter selection state
    const [activeFilter, setActiveFilter] = useState('All');

    // Preloaded inventory database state matching design records
    const [inventoryItems, setInventoryItems] = useState([
        { id: 1, name: 'Trimmer', category: 'Tools', qty: 100 },
        { id: 2, name: 'Shampoo', category: 'Tools', qty: 100 },
        { id: 3, name: 'Hair gel', category: 'Tools', qty: 100 }
    ]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!itemName || !quantity) return alert("Please fill out required fields!");

        const newItem = {
            id: Date.now(),
            name: itemName,
            category: category || 'Others',
            qty: parseInt(quantity) || 0
        };

        setInventoryItems([newItem, ...inventoryItems]);
        
        // Reset Inputs
        setItemName('');
        setCategory('');
        setPrice('');
        setQuantity('');
    };

    // Filter filtering engine logic block
    const filteredItems = inventoryItems.filter(item => {
        if (activeFilter === 'All') return true;
        return item.category.toLowerCase() === activeFilter.toLowerCase();
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar />

            <div className="flex flex-1 w-full">
                <Sidebar />
                <ManageSideBar activeTab="Inventory" onTabChange={(tab) => console.log(`Navigating to: ${tab}`)} />

                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200">
                    
                    {/* Active Feature Headline Block Element */}
                    <div className="inline-block border-b-2 border-red-600 pb-2 mb-6">
                        <div className="flex items-center space-x-2 text-gray-900">
                            <span className="text-xl font-light leading-none select-none tracking-tight">+</span>
                            <span className="text-[13px] font-bold uppercase tracking-wider">Add Inventory</span>
                        </div>
                    </div>

                    {/* MANAGE WORKFLOW SUBMISSION CONTAINER */}
                    <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-8">
                        <form onSubmit={handleSave} className="space-y-5">
                            
                            {/* Media File Stream Dropzone Upload Workspace Component */}
                            <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-[#FAFAFA] flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                                    <img src={cameraIcon} alt="Dropzone" className="w-8 h-8 object-contain" />
                                </div>
                                <span className="text-[11px] font-bold text-gray-400">Add image</span>
                                <div className="flex items-center space-x-6 pt-1 text-xs font-bold text-gray-500 tracking-tight">
                                    <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors">
                                        <img src={openCameraIcon} alt="Camera feed stream" className="w-4 h-4 object-contain" />
                                        <span>Camera</span>
                                    </button>
                                    <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors">
                                        <img src={galleryIcon} alt="Local asset gallery" className="w-4 h-4 object-contain" />
                                        <span>Gallery</span>
                                    </button>
                                </div>
                            </div>

                            {/* DOCK FLEX FIELDS DATA CAPTURE INPUT SECTIONS ARRAY */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Form Item field: Item Name */}
                                <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                    <img src={serviceNameIcon} alt="Product Tag" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                    <input 
                                        type="text" 
                                        placeholder="Item Name"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        className="w-full text-xs font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                    />
                                </div>

                                {/* Form Item field: Category selector panel context menu */}
                                <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                    <img src={categoryIcon} alt="Group Label" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full text-xs font-semibold text-gray-800 appearance-none bg-transparent outline-none cursor-pointer placeholder-gray-400"
                                    >
                                        <option value="" disabled hidden>Category</option>
                                        <option value="Tools">Tools</option>
                                        <option value="Consumable">Consumable</option>
                                        <option value="Products">Products</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                </div>

                                {/* Form Item field: Price numerical identifier node */}
                                <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                    <img src={priceIcon} alt="Financial Evaluation ledger currency" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                    <input 
                                        type="number" 
                                        placeholder="Price"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full text-xs font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                    />
                                </div>

                                {/* Form Item field: Quantity numeric data store stream tracker */}
                                <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-gray-900 transition-colors">
                                    <img src={durationIcon} alt="Stock count representation matrix" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                    <input 
                                        type="number" 
                                        placeholder="Quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full text-xs font-semibold placeholder-gray-400 text-gray-800 outline-none bg-transparent"
                                    />
                                </div>

                            </div>

                            {/* EXECUTION LAYER FORM LOGISTICS ACTION ROW */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 text-xs font-bold uppercase tracking-wider">
                                <button 
                                    type="submit" 
                                    className="w-full sm:flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    Save
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setItemName(''); setCategory(''); setPrice(''); setQuantity(''); }}
                                    className="w-full sm:flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* LOWER TRACKING SECTION FRAME: DETAILED DATA TABLE LIST */}
                    <div className="max-w-3xl">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 mb-3">Inventory Details</h3>
                        
                        {/* CATEGORICAL PILLED HORIZONTAL NAVIGATION BADGE BUTTON MATRIX */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {['All', 'Comsumable', 'Products', 'Tools', 'Others'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFilter(tab)}
                                    className={`px-5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                        activeFilter === tab
                                            ? 'bg-red-600 border-red-600 text-white shadow-sm'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* LINE RECORD TABLE CONTAINER ITEMS */}
                        <div className="space-y-3.5">
                            {filteredItems.map((item) => (
                                <div 
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
                                >
                                    {/* Left Wing Container: Textual Metadata context descriptions */}
                                    <div className="flex items-center space-x-3">
                                        {/* Pure Letter Avatar Profile Badge Element representation matrix logic */}
                                        <div className="w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-extrabold text-gray-900 tracking-tight leading-snug">{item.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tight flex items-center space-x-1.5">
                                                <span>Category : {item.category}</span>
                                                <span className="text-gray-300">|</span>
                                                <span>Qty : {item.qty}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Wing Action Panel Box Component anchor points link */}
                                    <div>
                                        <button className="flex items-center space-x-1 border border-gray-300 rounded-lg px-2.5 py-1 text-[9px] font-extrabold tracking-wider uppercase text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                                            <img src={assignStaff} alt="assign staff" className="w-4 h-4 mr-2.5 object-contain opacity-70 flex-shrink-0" />
                                            <span>Assign Staff</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </main>
            </div>

            <Footer />
        </div>
    );
}

export default Inventory;