import React, { useState, useEffect } from 'react';

import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

// Icons
import priceIcon from '../../../assets/Owner/Manage/Services/price_icon.svg';
import serviceNameIcon from '../../../assets/Owner/Manage/Services/service_name_icon.svg';
import durationIcon from '../../../assets/Owner/Manage/Services/duration_icon.svg';
import assignStaff from '../../../assets/Owner/Manage/Schedule/assign_staff_icon.svg';

const toastStyle = {
    style: {
        background: '#1a1a1a',
        color: '#fff',
        borderRadius: '16px',
        padding: '20px 24px',
        fontSize: '15px',
        fontWeight: '600',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        minWidth: '350px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    iconTheme: { primary: '#ff0b01', secondary: '#fff' }
};

// Enums
const UNIT_TYPES = ['PIECE', 'ML', 'LITER', 'KG', 'GRAM', 'BOTTLE'];
const PRODUCT_TYPES = ['consumable', 'tool', 'equipment', 'chemical', 'cosmetic', 'accessory', 'retail', 'supply'];
const SWAP_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const Inventory = () => {

    const [activeTab, setActiveTab] = useState('add'); // 'add' | 'view' | 'swaps'

    // ==================== ADD INVENTORY STATES ====================
    const [itemName, setItemName] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitType, setUnitType] = useState('PIECE');
    const [productType, setProductType] = useState('consumable');
    const [reorderLevel, setReorderLevel] = useState('');
    const [priceError, setPriceError] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(false);

    // ==================== VIEW INVENTORY STATES ====================
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    // Search filters
    const [searchName, setSearchName] = useState('');
    const [searchProductType, setSearchProductType] = useState('');
    const [searchUnitType, setSearchUnitType] = useState('');
    const [searchIsLowStock, setSearchIsLowStock] = useState(false);
    const [searchStockSort, setSearchStockSort] = useState('lowToHigh'); // Default sorting
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ==================== STAFF LIST ====================
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    // ==================== ASSIGN MODAL ====================
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [allocatedQuantity, setAllocatedQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    // ==================== ADD STOCK MODAL ====================
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [stockToAdd, setStockToAdd] = useState('');
    const [costPriceToAdd, setCostPriceToAdd] = useState('');
    const [stockLoading, setStockLoading] = useState(false);

    // ==================== VIEW ASSIGNED MODAL ====================
    const [showAssignedModal, setShowAssignedModal] = useState(false);
    const [assignedStaffList, setAssignedStaffList] = useState([]);
    const [currentItemName, setCurrentItemName] = useState('');

    // ==================== EDIT ASSIGNMENT MODAL ====================
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [newAllocatedQuantity, setNewAllocatedQuantity] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // ==================== VIEW USAGE MODAL ====================
    const [showUsageModal, setShowUsageModal] = useState(false);
    const [usageList, setUsageList] = useState([]);
    const [usageLoading, setUsageLoading] = useState(false);
    const [selectedStaffInventory, setSelectedStaffInventory] = useState(null);

    // ==================== SWAP REQUESTS STATES ====================
    const [swapRequests, setSwapRequests] = useState([]);
    const [loadingSwaps, setLoadingSwaps] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [activeSwapStatus, setActiveSwapStatus] = useState('PENDING');

    const fetchStaffList = async () => {
        try {
            setLoadingStaff(true);
            const response = await axiosInstance.get('/staff');
            setStaffList(response.data || []);
        } catch (error) {
            toast.error('Failed to load staff list', toastStyle);
        } finally {
            setLoadingStaff(false);
        }
    };

    const fetchInventory = async (page = currentPage) => {
        try {
            setLoading(true);
            const params = {};
            if (searchName.trim()) params.name = searchName.trim();
            if (searchProductType) params.productType = searchProductType;
            if (searchUnitType) params.unitType = searchUnitType;
            if (searchIsLowStock) params.isLowStock = true;
            if (searchStockSort) params.stockSort = searchStockSort;
            params.size = 10;
            params.page = page;

            const response = await axiosInstance.get('/inventory/search', { params });
            setInventoryItems(response.data?.content || response.data || []);
            setTotalPages(response.data?.page?.totalPages ?? response.data?.totalPages ?? 0);
            setTotalElements(response.data?.page?.totalElements ?? response.data?.totalElements ?? 0);
            setCurrentPage(page);
        } catch (error) {
            toast.error('Failed to load inventory', toastStyle);
            setInventoryItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchInventory = (e) => {
        if (e) e.preventDefault();
        setHasSearched(true);
        setCurrentPage(0);
        fetchInventory(0);
    };

    const fetchSwapRequests = async (status = activeSwapStatus) => {
        try {
            setLoadingSwaps(true);
            const response = await axiosInstance.get(`/staff-inventory/search?status=${status}`);
            setSwapRequests(response.data || []);
        } catch (error) {
            toast.error('Failed to load swap requests', toastStyle);
            setSwapRequests([]);
        } finally {
            setLoadingSwaps(false);
        }
    };

    useEffect(() => {
        setHasSearched(true);
        fetchInventory();
        fetchStaffList();
        fetchSwapRequests();
    }, []);

    useEffect(() => {
        if (activeTab === 'swaps') {
            fetchSwapRequests(activeSwapStatus);
        }
    }, [activeTab, activeSwapStatus]);

    // Safe number parsing to prevent "e" and integer overflow
    const safeParseInt = (value, defaultValue = 0) => {
        if (!value) return defaultValue;
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) return defaultValue;
        return Math.min(num, 2147483647);
    };

    const safeParseFloat = (value, defaultValue = 0) => {
        if (!value) return defaultValue;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return defaultValue;
        return num;
    };

    const handleCostPriceChange = (value) => {
        let val = value.replace(/[^0-9.]/g, '');
        const occurrences = (val.match(/\./g) || []).length;
        if (occurrences > 1) return;
        
        const parts = val.split('.');
        if (parts[0].length > 6) return;
        
        setCostPrice(val);
        if (parts[0].length === 6) {
            setPriceError("Maximum price limit reached (6 digits)");
        } else {
            setPriceError("");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!itemName?.trim()) {
            toast.error("Item Name is required", toastStyle);
            return;
        }

        if (itemName.trim().length > 150) {
            toast.error("Item Name cannot exceed 150 characters", toastStyle);
            return;
        }

        if (!costPrice || quantity === '') {
            toast.error("Cost Price and Quantity are required", toastStyle);
            return;
        }

        const costPriceVal = parseFloat(costPrice);
        if (isNaN(costPriceVal) || costPriceVal <= 0) {
            toast.error("Cost price must be greater than 0", toastStyle);
            return;
        }

        if (costPriceVal >= 1000000) {
            toast.error("Cost price cannot exceed ₹999,999", toastStyle);
            return;
        }

        const quantityVal = parseInt(quantity, 10);
        if (isNaN(quantityVal) || quantityVal < 0) {
            toast.error("Current stock must be 0 or greater", toastStyle);
            return;
        }

        if (reorderLevel) {
            const reorderVal = parseInt(reorderLevel, 10);
            if (isNaN(reorderVal) || reorderVal < 0) {
                toast.error("Reorder level must be 0 or greater", toastStyle);
                return;
            }
        }

        setLoadingAdd(true);
        try {
            const payload = {
                name: itemName.trim(),
                category: productType,
                currentStock: safeParseInt(quantity),
                reorderLevel: safeParseInt(reorderLevel, 10),
                costPrice: safeParseFloat(costPrice),
                unitType: unitType,
                productType: productType,
            };

            await axiosInstance.post('/inventory', payload);
            toast.success('Inventory item added successfully!', toastStyle);

            // Reset form
            setItemName('');
            setCostPrice('');
            setQuantity('');
            setReorderLevel('');
            setPriceError('');
            setUnitType('PIECE');
            setProductType('consumable');
            setHasSearched(true);
            fetchInventory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add inventory', toastStyle);
        } finally {
            setLoadingAdd(false);
        }
    };

    const openAddStockModal = (item) => {
        setSelectedInventory(item);
        setStockToAdd('');
        setCostPriceToAdd('');
        setShowAddStockModal(true);
    };

    const handleAddStock = async () => {
        if (!stockToAdd) {
            toast.error("Please enter a stock quantity", toastStyle);
            return;
        }

        const quantityToAdd = safeParseInt(stockToAdd);
        if (quantityToAdd <= 0) {
            toast.error("Quantity must be greater than 0", toastStyle);
            return;
        }

        setStockLoading(true);
        try {
            await axiosInstance.post(`/inventory/${selectedInventory.id}/add-stock`, null, {
                params: {
                    quantity: quantityToAdd,
                    costPrice: costPriceToAdd || undefined
                }
            });
            toast.success('Stock added successfully!', toastStyle);
            setShowAddStockModal(false);
            fetchInventory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add stock', toastStyle);
        } finally {
            setStockLoading(false);
        }
    };

    const openAssignModal = (item) => {
        setSelectedInventory(item);
        setSelectedStaffId('');
        setAllocatedQuantity('');
        setNotes('');
        setShowAssignModal(true);
    };

    const handleAssignToStaff = async () => {
        if (!selectedStaffId || !allocatedQuantity) {
            toast.error("Please select staff and quantity", toastStyle);
            return;
        }

        if (safeParseFloat(allocatedQuantity) <= 0) {
            toast.error("Allocated quantity must be greater than 0", toastStyle);
            return;
        }

        setAssignLoading(true);
        try {
            const payload = {
                staffId: parseInt(selectedStaffId),
                inventoryId: selectedInventory.id,
                allocatedQuantity: safeParseFloat(allocatedQuantity),
                assignedBy: "Owner",
                notes: notes || "",
            };

            await axiosInstance.post('/staff-inventory/assign', payload);
            toast.success('Inventory assigned successfully!', toastStyle);
            setShowAssignModal(false);
            setHasSearched(true);
            fetchInventory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign inventory', toastStyle);
        } finally {
            setAssignLoading(false);
        }
    };

    const openViewAssigned = async (item) => {
        try {
            setSelectedInventory(item);
            const response = await axiosInstance.get(`/staff-inventory/inventory/${item.id}`);
            setAssignedStaffList(response.data || []);
            setCurrentItemName(item.name);
            setShowAssignedModal(true);
        } catch (error) {
            toast.error('Failed to fetch assigned staff', toastStyle);
        }
    };

    const handleViewUsage = async (staffInventory) => {
        setSelectedStaffInventory(staffInventory);
        setShowUsageModal(true);
        setUsageLoading(true);
        setUsageList([]);
        try {
            const response = await axiosInstance.get(`/staff-inventory/${staffInventory.id}/opened-products-counts`);
            setUsageList(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch usage history', toastStyle);
        } finally {
            setUsageLoading(false);
        }
    };

    const openEditModal = (assignment) => {
        setSelectedAssignment(assignment);
        setNewAllocatedQuantity(assignment.allocatedQuantity?.toString() || '');
        setEditNotes(assignment.notes || '');
        setShowEditModal(true);
    };

    const handleUpdateAssignment = async () => {
        if (!newAllocatedQuantity) {
            toast.error("New allocated quantity is required", toastStyle);
            return;
        }

        if (safeParseFloat(newAllocatedQuantity) <= 0) {
            toast.error("New allocated quantity must be greater than 0", toastStyle);
            return;
        }

        setEditLoading(true);
        try {
            const payload = {
                newAllocatedQuantity: safeParseFloat(newAllocatedQuantity),
                notes: editNotes || "",
            };

            await axiosInstance.put(`/staff-inventory/${selectedAssignment.id}/reassign`, payload);
            toast.success('Assignment updated successfully!', toastStyle);
            setShowEditModal(false);

            if (selectedInventory) {
                setTimeout(() => {
                    openViewAssigned(selectedInventory);
                }, 500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update assignment', toastStyle);
        } finally {
            setEditLoading(false);
        }
    };

    const handleApproveSwap = async (id) => {
        setProcessingId(id);
        try {
            await axiosInstance.post(`/staff-inventory/${id}/approve`);
            toast.success('Swap request approved successfully!', toastStyle);
            fetchSwapRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve swap', toastStyle);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectSwap = async (id) => {
        setProcessingId(id);
        try {
            await axiosInstance.post(`/staff-inventory/${id}/reject`);
            toast.success('Swap request rejected!', toastStyle);
            fetchSwapRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject swap', toastStyle);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredItems = inventoryItems.filter(item =>
        activeFilter === 'All' || item.category?.toLowerCase() === activeFilter.toLowerCase()
    );

    const categories = ['All', 'Tools', 'Consumable', 'Products', 'Others'];

    return (
        <>
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-white md:border-l md:border-gray-200 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-light tracking-tight mb-8">Inventory Management</h1>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-8 max-w-xl border border-gray-100 shadow-sm overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`flex-1 px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === 'add' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                + Add New Item
                            </button>
                            <button
                                onClick={() => setActiveTab('view')}
                                className={`flex-1 px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === 'view' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                View Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab('swaps')}
                                className={`flex-1 px-5 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === 'swaps' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Swap Requests
                            </button>
                        </div>

                        {/* ==================== ADD TAB ==================== */}
                        {activeTab === 'add' && (
                            <div className="max-w-3xl border border-gray-100 rounded-3xl p-8 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                                <form onSubmit={handleSave} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <img src={serviceNameIcon} alt="Name" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                            <input type="text" placeholder="Item Name *" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800" required />
                                        </div>

                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <img src={durationIcon} alt="Product Type" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                            <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800 appearance-none cursor-pointer" required>
                                                {PRODUCT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                            <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                        </div>

                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <img src={durationIcon} alt="Unit Type" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                            <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800 appearance-none cursor-pointer" required>
                                                {UNIT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                            <span className="absolute right-4 pointer-events-none text-gray-400 text-[10px]">▼</span>
                                        </div>

                                        <div>
                                            <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                                <img src={priceIcon} alt="Price" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="Cost Price *"
                                                    value={costPrice}
                                                    onChange={(e) => handleCostPriceChange(e.target.value)}
                                                    className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800"
                                                    required
                                                />
                                            </div>
                                            {priceError && <p className="text-red-500 text-xs mt-1 ml-1">{priceError}</p>}
                                        </div>

                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <img src={durationIcon} alt="Quantity" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Quantity *"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800"
                                                required
                                            />
                                        </div>

                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <input
                                                type="text"
                                                placeholder="Reorder Level"
                                                value={reorderLevel}
                                                onChange={(e) => setReorderLevel(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800 pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 uppercase text-xs font-bold tracking-wider">
                                        <button type="submit" disabled={loadingAdd} className="flex-1 bg-[#FF0B01] text-white py-4 rounded-2xl hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition active:scale-[0.985] disabled:opacity-70">
                                            {loadingAdd ? 'Saving...' : 'Save Item'}
                                        </button>
                                        <button type="button" onClick={() => {
                                            setItemName(''); setCostPrice(''); setQuantity(''); setReorderLevel('');
                                            setUnitType('PIECE'); setProductType('consumable');
                                            setPriceError('');
                                        }} className="flex-1 border border-gray-300 py-4 rounded-2xl hover:bg-gray-50 font-bold transition">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* VIEW INVENTORY TAB */}
                        {activeTab === 'view' && (
                            <div>
                                {/* Search Filters box */}
                                <form onSubmit={handleSearchInventory} className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">Search Filters</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                                        {/* Name filter */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Item Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="Filter by Name" 
                                                value={searchName} 
                                                onChange={(e) => setSearchName(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all" 
                                            />
                                        </div>

                                        {/* Product Type filter */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Product Type</label>
                                            <select 
                                                value={searchProductType} 
                                                onChange={(e) => setSearchProductType(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all cursor-pointer"
                                            >
                                                <option value="">All Types</option>
                                                {PRODUCT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>

                                        {/* Unit Type filter */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Unit Type</label>
                                            <select 
                                                value={searchUnitType} 
                                                onChange={(e) => setSearchUnitType(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all cursor-pointer"
                                            >
                                                <option value="">All Units</option>
                                                {UNIT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>

                                        {/* Low Stock filter */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Stock Level</label>
                                            <select 
                                                value={searchIsLowStock ? 'low' : ''} 
                                                onChange={(e) => setSearchIsLowStock(e.target.value === 'low')} 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all cursor-pointer"
                                            >
                                                <option value="">All Levels</option>
                                                <option value="low">Low Stock / Out of Stock</option>
                                            </select>
                                        </div>

                                        {/* Sort filter */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Sort Order</label>
                                            <select 
                                                value={searchStockSort} 
                                                onChange={(e) => setSearchStockSort(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-50/50 hover:bg-gray-50 focus:bg-white outline-none focus:border-[#FF0B01] transition-all cursor-pointer"
                                            >
                                                <option value="lowToHigh">Low to High Stock</option>
                                                <option value="highToLow">High to Low Stock</option>
                                                <option value="newest">Newest Created</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 mt-5">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setSearchName('');
                                                setSearchProductType('');
                                                setSearchUnitType('');
                                                setSearchIsLowStock(false);
                                                setSearchStockSort('lowToHigh');
                                            }} 
                                            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            Clear Filters
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#FF0B01] rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>

                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">ALL INVENTORY ITEMS</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-5 py-2 rounded-full border text-xs font-bold ${activeFilter === cat ? 'bg-red-600 text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {loading ? <div className="py-20 text-center">Loading...</div> : 
                                 !hasSearched ? (
                                     <div className="text-center py-20 text-gray-500 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2">
                                         <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                         </svg>
                                         <h4 className="text-base font-bold text-gray-800">Search Inventory Items</h4>
                                         <p className="text-xs font-semibold text-gray-400 max-w-md mx-auto">Use the filters above and click Search to display inventory list.</p>
                                     </div>
                                 ) : filteredItems.length === 0 ? (
                                     <div className="text-center py-20 text-gray-500 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                         No inventory items found.
                                     </div>
                                 ) : (
                                     <>
                                     <div className="space-y-3">
                                         {filteredItems.map(item => {
                                             const isBelowReorder = item.reorderLevel !== null && item.reorderLevel !== undefined && item.currentStock <= item.reorderLevel;

                                             return (
                                                 <div 
                                                     key={item.id} 
                                                     className={`bg-white border-l-4 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4 ${
                                                         isBelowReorder 
                                                             ? 'border-red-100 border-l-red-500 bg-red-50/20 shadow-[0_4px_20px_rgba(239,68,68,0.05)]' 
                                                             : 'border-gray-100 border-l-[#FF0B01]/50'
                                                     }`}
                                                 >
                                                     <div className="flex items-center gap-4 flex-1">
                                                         <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base border flex-shrink-0 ${
                                                             isBelowReorder ? 'bg-red-50 text-red-600 border-red-150 animate-pulse' : 'bg-gray-50 text-gray-700 border-gray-150'
                                                         }`}>
                                                             {item.name?.charAt(0).toUpperCase()}
                                                         </div>
                                                         <div>
                                                             <div className="flex items-center gap-2 flex-wrap">
                                                                 <h4 className="font-bold text-base text-gray-900 leading-tight">{item.name}</h4>
                                                                 {isBelowReorder && (
                                                                     <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                                         item.currentStock === 0 ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                     }`}>
                                                                         {item.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                                     </span>
                                                                 )}
                                                             </div>
                                                             <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                                 <span className="px-2.5 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-gray-100">
                                                                     {item.productType}
                                                                 </span>
                                                                 <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-gray-200/50">
                                                                     {item.unitType}
                                                                 </span>
                                                             </div>
                                                         </div>
                                                     </div>

                                                     <div className="flex items-center gap-8 md:gap-12 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50 flex-shrink-0 justify-around sm:justify-start">
                                                         <div className="text-center px-1">
                                                             <p className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase mb-0.5">STOCK</p>
                                                             <p className={`text-xl font-black leading-tight ${isBelowReorder ? 'text-red-650' : 'text-gray-900'}`}>{item.currentStock}</p>
                                                         </div>
                                                         <div className="w-px h-8 bg-gray-200"></div>
                                                         <div className="text-center px-1">
                                                             <p className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase mb-0.5">PRICE</p>
                                                             <p className="text-lg font-black leading-tight text-[#FF0B01]">₹{item.costPrice}</p>
                                                         </div>
                                                     </div>

                                                     <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto md:ml-auto text-xs font-bold uppercase tracking-wider">
                                                          <button onClick={() => openAddStockModal(item)} className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 hover:bg-[#FF0B01] hover:text-white transition-all duration-200 w-full sm:flex-1 md:flex-initial shadow-sm">
                                                              + ADD STOCK
                                                          </button>
                                                          <button onClick={() => openAssignModal(item)} className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 hover:bg-[#FF0B01] hover:text-white transition-all duration-200 w-full sm:flex-1 md:flex-initial shadow-sm">
                                                              <img src={assignStaff} alt="" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" /> ASSIGN STAFF
                                                          </button>
                                                          <button onClick={() => openViewAssigned(item)} className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 w-full sm:flex-1 md:flex-initial shadow-sm">
                                                              VIEW ASSIGNED
                                                          </button>
                                                      </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                     {/* Pagination Controls */}
                                      {!loading && (
                                          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-gray-150">
                                              <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                  PAGE {totalPages === 0 ? 1 : currentPage + 1} OF {totalPages} ({totalElements} TOTAL ITEMS)
                                              </span>
                                              <div className="flex items-center space-x-1.5">
                                                  <button
                                                      onClick={() => fetchInventory(0)}
                                                      disabled={currentPage <= 0}
                                                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                  >
                                                      « First
                                                  </button>
                                                  <button
                                                      onClick={() => fetchInventory(Math.max(0, currentPage - 1))}
                                                      disabled={currentPage <= 0}
                                                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                  >
                                                      ‹ Prev
                                                  </button>
                                                  
                                                  {/* Current Page Indicator Pill */}
                                                  <span className="px-3.5 py-1.5 bg-[#FF0B01] text-white text-[10px] font-black rounded-lg">
                                                      {totalPages === 0 ? 1 : currentPage + 1}
                                                  </span>

                                                  <button
                                                      onClick={() => fetchInventory(Math.min(Math.max(0, totalPages - 1), currentPage + 1))}
                                                      disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                  >
                                                      Next ›
                                                  </button>
                                                  <button
                                                      onClick={() => fetchInventory(Math.max(0, totalPages - 1))}
                                                      disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                                                  >
                                                      Last »
                                                  </button>
                                              </div>
                                          </div>
                                      )}
                                 </>
                                 )}
                            </div>
                        )}

                        {/* SWAP REQUESTS TAB */}
                        {activeTab === 'swaps' && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">SWAP REQUESTS</h3>

                                    <div className="flex flex-wrap gap-2">
                                        {SWAP_STATUSES.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setActiveSwapStatus(status)}
                                                className={`px-5 py-2 rounded-full border text-xs font-bold transition-all ${activeSwapStatus === status
                                                    ? 'bg-red-600 text-white border-red-600'
                                                    : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={() => fetchSwapRequests(activeSwapStatus)} className="text-xs px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">↻ Refresh</button>
                                </div>

                                {loadingSwaps ? (
                                    <div className="py-20 text-center">Loading swap requests...</div>
                                ) : swapRequests.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500 bg-white border border-gray-100 rounded-2xl">
                                        No {activeSwapStatus.toLowerCase()} swap requests found.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {swapRequests.map((req) => (
                                            <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">↔</div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-bold text-xl">{req.productName}</p>
                                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {req.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">To: <span className="font-semibold">{req.toStaff}</span></p>
                                                                <div className="mt-3 text-sm"><span className="font-medium">Quantity:</span> {req.quantity}</div>
                                                                {req.notes && <div className="mt-2 text-sm text-gray-600 italic">Note: {req.notes}</div>}
                                                                <p className="text-xs text-gray-400 mt-3">Requested by {req.requestedBy} • {new Date(req.requestedAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {req.status === 'PENDING' && (
                                                        <div className="flex gap-3 lg:flex-col">
                                                            <button onClick={() => handleApproveSwap(req.id)} disabled={processingId === req.id} className="flex-1 lg:flex-none px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-70">✅ Approve</button>
                                                            <button onClick={() => handleRejectSwap(req.id)} disabled={processingId === req.id} className="flex-1 lg:flex-none px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-70">✕ Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

            {/* Assign Modal */}
            {showAssignModal && selectedInventory && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-2xl font-semibold mb-1">Assign Inventory</h3>
                        <p className="text-gray-600 mb-6">{selectedInventory.name}</p>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-2">Select Staff Member</label>
                                <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base">
                                    <option value="">Select Staff</option>
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.name} (ID: {staff.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-2">Allocated Quantity</label>
                                <input type="number" value={allocatedQuantity} onChange={(e) => setAllocatedQuantity(e.target.value)} min="0.01" step="any" className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base" placeholder="Quantity" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-2">Notes (Optional)</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 h-28" placeholder="Add notes..." />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 py-3.5 border border-gray-300 rounded-xl">Cancel</button>
                            <button onClick={handleAssignToStaff} disabled={assignLoading} className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-bold">Assign Now</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stock Modal */}
            {showAddStockModal && selectedInventory && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-2xl font-semibold mb-1">Add Stock</h3>
                        <p className="text-gray-600 mb-6">{selectedInventory.name}</p>

                        <div className="space-y-5">
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Current Stock</p>
                                    <p className="text-2xl font-black text-gray-800 mt-1">{selectedInventory.currentStock}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">New Total Stock</p>
                                    <p className="text-2xl font-black text-green-600 mt-1">
                                        {(selectedInventory.currentStock || 0) + (stockToAdd ? safeParseInt(stockToAdd) : 0)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-2">Quantity to Add</label>
                                <input 
                                    type="text" 
                                    value={stockToAdd} 
                                    onChange={(e) => setStockToAdd(e.target.value.replace(/[^0-9]/g, ''))} 
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-[#FF0B01] transition-all" 
                                    placeholder="Enter quantity" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-2">Cost Price (₹, Optional)</label>
                                <input 
                                    type="text" 
                                    value={costPriceToAdd} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        const parts = val.split('.');
                                        if (parts.length > 2) return;
                                        setCostPriceToAdd(val);
                                    }} 
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-[#FF0B01] transition-all" 
                                    placeholder="Enter cost price" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowAddStockModal(false)} className="flex-1 py-3.5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleAddStock} disabled={stockLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-70 transition-colors">
                                {stockLoading ? 'Adding...' : 'Add Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Assigned Modal */}
            {showAssignedModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-semibold">Staff Assignments - {currentItemName}</h3>
                            <button onClick={() => setShowAssignedModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {assignedStaffList.length > 0 ? (
                            assignedStaffList.map((staff, index) => (
                                <div key={index} className="mb-6 border border-gray-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                {staff.staffName?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xl">{staff.staffName}</h4>
                                                <p className="text-sm text-gray-500">Assigned by: {staff.assignedBy || 'Owner'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => openEditModal(staff)} className="text-red-600 hover:text-red-700">✏️ Edit</button>
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center border-t border-b py-4 text-sm">
                                        <div><p className="text-gray-400 text-xs">Allocated</p><p className="font-bold">{staff.allocatedQuantity}</p></div>
                                        <div><p className="text-gray-400 text-xs">Used</p><p className="font-bold">{staff.usedQuantity || 0}</p></div>
                                        <div><p className="text-gray-400 text-xs">Remaining</p><p className="font-bold text-green-600">{staff.remainingQuantity}</p></div>
                                        <div><p className="text-gray-400 text-xs">Appointments</p><p className="font-bold">{staff.appointmentCount || 0}</p></div>
                                        <div><p className="text-gray-400 text-xs">Unit</p><p className="font-bold">{staff.unitType || 'PIECE'}</p></div>
                                    </div>

                                    {staff.notes && <div className="mt-3"><p className="text-xs text-gray-500">Notes:</p><p>{staff.notes}</p></div>}

                                    <div className="flex justify-between mt-4 text-xs">
                                        <p>Assigned: {staff.assignedAt ? new Date(staff.assignedAt).toLocaleString() : 'N/A'}</p>
                                        <button 
                                            onClick={() => handleViewUsage(staff)} 
                                            className="border border-[#FF0B01] text-[#FF0B01] px-5 py-2 rounded-full text-xs font-medium hover:bg-red-50 cursor-pointer transition-colors"
                                        >
                                            View Usage
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-16 text-gray-500">No assignments found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Assignment Modal */}
            {showEditModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-6">Update Assignment - {selectedAssignment.staffName}</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Total Used Quantity</label>
                                <input type="number" value={selectedAssignment.usedQuantity || 0} disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50" />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">New Total Allocated Quantity</label>
                                <input
                                    type="text"
                                    value={newAllocatedQuantity}
                                    onChange={(e) => setNewAllocatedQuantity(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Notes</label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 h-24"
                                    placeholder="Update notes..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl">Cancel</button>
                            <button onClick={handleUpdateAssignment} disabled={editLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold">
                                {editLoading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Usage Modal */}
            {showUsageModal && selectedStaffInventory && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
                        {/* Close button */}
                        <button 
                            onClick={() => setShowUsageModal(false)}
                            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-[#FF0B01] flex items-center justify-center transition focus:outline-none cursor-pointer text-lg font-bold"
                        >
                            ✕
                        </button>

                        <div className="mb-6 pb-3 border-b border-gray-100 pr-8">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF0B01] block">
                                Usage & Open Product History
                            </span>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight mt-1">
                                {selectedStaffInventory.staffName}'s Usage Details
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                                Inventory Item: <span className="font-bold text-[#FF0B01]">{selectedInventory?.name || currentItemName}</span>
                            </p>
                        </div>

                        {/* Usage List Content */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[250px] text-left">
                            {usageLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <div className="animate-spin h-7 w-7 border-3 border-[#FF0B01] border-t-transparent rounded-full"></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading usage details...</span>
                                </div>
                            ) : usageList.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 font-bold uppercase text-xs tracking-wider">
                                    No open product usage records found for this assignment.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {usageList.map((record) => (
                                        <div key={record.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-extrabold text-gray-900">
                                                        Qty Opened: {record.openedQuantity}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                        record.isFinished 
                                                            ? 'bg-gray-200 text-gray-600' 
                                                            : 'bg-[#FF0B01]/10 text-[#FF0B01]'
                                                    }`}>
                                                        {record.isFinished ? 'Finished' : 'Currently Active'}
                                                    </span>
                                                </div>

                                                <div className="text-[11px] text-gray-500 font-semibold space-y-0.5">
                                                    <p>
                                                        Opened: {record.openedAt ? new Date(record.openedAt).toLocaleString('en-IN') : 'N/A'}
                                                    </p>
                                                    {record.finishedAt && (
                                                        <p>
                                                            Finished: {new Date(record.finishedAt).toLocaleString('en-IN')}
                                                        </p>
                                                    )}
                                                    {record.notes && (
                                                        <p className="text-gray-400 italic font-normal">
                                                            Note: {record.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right count pill */}
                                            <div className="bg-white border border-gray-200 rounded-2xl p-3 text-center min-w-[120px] shadow-2xs">
                                                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest block mb-0.5">
                                                    Appointments Served
                                                </span>
                                                <span className="text-xl font-black text-gray-900 font-mono">
                                                    {record.appointmentCount ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                            <button
                                onClick={() => setShowUsageModal(false)}
                                className="bg-[#FF0B01] hover:bg-[#d90900] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition"
                            >
                                Close History
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Inventory;