import React, { useState, useEffect } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('add'); // 'add' | 'view' | 'swaps'

    // ==================== ADD INVENTORY STATES ====================
    const [itemName, setItemName] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitType, setUnitType] = useState('PIECE');
    const [productType, setProductType] = useState('consumable');
    const [reorderLevel, setReorderLevel] = useState('');
    const [loadingAdd, setLoadingAdd] = useState(false);

    // ==================== VIEW INVENTORY STATES ====================
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

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

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/inventory');
            setInventoryItems(response.data || []);
        } catch (error) {
            toast.error('Failed to load inventory', toastStyle);
        } finally {
            setLoading(false);
        }
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

    const handleSave = async (e) => {
        e.preventDefault();
        if (!itemName.trim()) {
            toast.error("Item Name is required", toastStyle);
            return;
        }
        if (!costPrice || !quantity) {
            toast.error("Cost Price and Quantity are required", toastStyle);
            return;
        }

        if (safeParseFloat(costPrice) <= 0) {
            toast.error("Cost price must be greater than 0", toastStyle);
            return;
        }

        if (safeParseInt(quantity) <= 0) {
            toast.error("Current stock must be greater than 0", toastStyle);
            return;
        }

        if (reorderLevel && safeParseInt(reorderLevel) <= 0) {
            toast.error("Reorder level must be greater than 0", toastStyle);
            return;
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
            setUnitType('PIECE');
            setProductType('consumable');
            fetchInventory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add inventory', toastStyle);
        } finally {
            setLoadingAdd(false);
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
            fetchInventory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign inventory', toastStyle);
        } finally {
            setAssignLoading(false);
        }
    };

    const openViewAssigned = async (item) => {
        try {
            const response = await axiosInstance.get(`/staff-inventory/inventory/${item.id}`);
            setAssignedStaffList(response.data || []);
            setCurrentItemName(item.name);
            setShowAssignedModal(true);
        } catch (error) {
            toast.error('Failed to fetch assigned staff', toastStyle);
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
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab="Inventory" onTabChange={() => { }} />

                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-white border-l border-gray-200 overflow-auto">
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

                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <img src={priceIcon} alt="Price" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Cost Price *"
                                                value={costPrice}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                                    if ((value.match(/\./g) || []).length <= 1) setCostPrice(value);
                                                }}
                                                className="w-full text-sm font-semibold outline-none bg-transparent text-gray-800"
                                                required
                                            />
                                        </div>

                                        <div className="relative flex items-center border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white rounded-2xl px-4 py-3.5 focus-within:border-[#FF0B01] focus-within:ring-4 focus-within:ring-red-500/10 transition-all duration-200">
                                            <img src={durationIcon} alt="Quantity" className="w-5 h-5 mr-3 opacity-40 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Current Stock *"
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

                                {loading ? <div className="py-20 text-center">Loading...</div> : (
                                    <div className="space-y-3">
                                        {filteredItems.map(item => (
                                            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#FF0B01] font-extrabold text-xl">
                                                        {item.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                                                        <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wide">{item.productType} • {item.unitType}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10 md:gap-16">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase">STOCK</p>
                                                        <p className="text-3xl font-black text-gray-900">{item.currentStock}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase">PRICE</p>
                                                        <p className="text-2xl font-black text-[#FF0B01]">₹{item.costPrice}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 md:ml-auto text-xs font-bold uppercase tracking-wider">
                                                    <button onClick={() => openAssignModal(item)} className="flex items-center gap-2 border border-gray-200 rounded-xl px-5 py-3.5 hover:bg-[#FF0B01] hover:text-white transition-colors duration-250">
                                                        <img src={assignStaff} alt="" className="w-4 h-4 invert hover:invert-0" /> ASSIGN STAFF
                                                    </button>
                                                    <button onClick={() => openViewAssigned(item)} className="border border-gray-200 rounded-xl px-5 py-3.5 hover:bg-gray-50 transition-colors duration-250">
                                                        VIEW ASSIGNED
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
            </div>

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

                                    <div className="grid grid-cols-5 gap-4 text-center border-t border-b py-4 text-sm">
                                        <div><p className="text-gray-400 text-xs">Allocated</p><p className="font-bold">{staff.allocatedQuantity}</p></div>
                                        <div><p className="text-gray-400 text-xs">Used</p><p className="font-bold">{staff.usedQuantity || 0}</p></div>
                                        <div><p className="text-gray-400 text-xs">Remaining</p><p className="font-bold text-green-600">{staff.remainingQuantity}</p></div>
                                        <div><p className="text-gray-400 text-xs">Appointments</p><p className="font-bold">{staff.appointmentCount || 0}</p></div>
                                        <div><p className="text-gray-400 text-xs">Unit</p><p className="font-bold">{staff.unitType || 'PIECE'}</p></div>
                                    </div>

                                    {staff.notes && <div className="mt-3"><p className="text-xs text-gray-500">Notes:</p><p>{staff.notes}</p></div>}

                                    <div className="flex justify-between mt-4 text-xs">
                                        <p>Assigned: {staff.assignedAt ? new Date(staff.assignedAt).toLocaleString() : 'N/A'}</p>
                                        <button className="border border-red-600 text-red-600 px-5 py-2 rounded-full text-xs font-medium hover:bg-red-50">View Usage</button>
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

            <Footer />
        </div>
    );
};

export default Inventory;