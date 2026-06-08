import React, { useState, useEffect } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from "../Layouts/ManageSideBar";
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

// Icons (Services)
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import categoryIcon from '../../../assets/Owner/Manage/Services/category_icon.svg';
import durationIcon from '../../../assets/Owner/Manage/Services/duration_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import priceIcon from '../../../assets/Owner/Manage/Services/price_icon.svg';
import serviceNameIcon from '../../../assets/Owner/Manage/Services/service_name_icon.svg';

const toastStyle = { /* your existing toastStyle */ };

const Service = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('Service');

    // ==================== ADD SERVICE STATES ====================
    const [serviceName, setServiceName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');

    // ==================== VIEW SERVICES STATES ====================
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
    });

    // Filters
    const [filters, setFilters] = useState({
        name: '',
        category: '',
        active: true,
        minPrice: '',
        maxPrice: '',
        minDuration: '',
        maxDuration: '',
    });

    // Fetch Services with Pagination & Filters
    const fetchServices = async (page = 0) => {
        try {
            setLoading(true);
            const params = {
                page,
                size: pagination.size,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
                ),
            };

            const response = await axiosInstance.get('/services/filter', { params });
            const data = response.data;

            setServices(data.content || []);
            setPagination({
                page: data.number,
                size: data.size,
                totalPages: data.totalPages,
                totalElements: data.totalElements,
            });
        } catch (error) {
            console.error('Failed to fetch services:', error);
            toast.error('Failed to load services', toastStyle);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentTab === 'Service') {
            fetchServices(0);
        }
    }, [currentTab, filters]);

    // Add Service Handler
    const handleServiceSave = async (e) => {
        e.preventDefault();
        if (!serviceName || !price || !duration || !category) {
            toast.error("Please fill out all required fields!", toastStyle);
            return;
        }

        try {
            toast.loading('Saving service...', { id: 'save-service', ...toastStyle });

            const payload = {
                name: serviceName.trim(),
                category,
                duration: parseInt(duration, 10),
                price: parseFloat(price),
                active: true,
            };

            await axiosInstance.post('/services', payload);
            toast.success('Service saved successfully!', { id: 'save-service', ...toastStyle });

            // Reset form
            setServiceName('');
            setCategory('');
            setPrice('');
            setDuration('');

            // Refresh list
            fetchServices(0);
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to save service.';
            toast.error(errMsg, { id: 'save-service', ...toastStyle });
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            name: '', category: '', active: true, minPrice: '', maxPrice: '',
            minDuration: '', maxDuration: ''
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab={currentTab} onTabChange={setCurrentTab} />

                <main className="flex-1 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    {currentTab === 'Service' && (
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="inline-block border-b-2 border-red-600 pb-2">
                                    <h1 className="text-2xl font-light tracking-tight">Services Management</h1>
                                </div>
                            </div>

                            {/* ==================== ADD SERVICE SECTION ==================== */}
                            <div className="mb-12">
                                <div className="inline-block border-b-2 border-red-600 pb-2 mb-6">
                                    <div className="flex items-center space-x-2 text-gray-900">
                                        <span className="text-xl font-light">+</span>
                                        <span className="text-[13px] font-bold uppercase tracking-wider">Add New Service</span>
                                    </div>
                                </div>

                                <div className="max-w-3xl border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                                    <form onSubmit={handleServiceSave} className="space-y-5">
                                        {/* Image Upload Placeholder */}
                                        <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-[#FAFAFA] flex flex-col items-center justify-center space-y-4 hover:bg-gray-50 transition-colors">
                                            <img src={openCameraIcon} alt="Upload" className="w-12 h-12 opacity-70" />
                                            <div className="flex items-center space-x-6 text-xs font-bold text-gray-500">
                                                <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900">
                                                    <img src={cameraIcon} alt="Camera" className="w-4 h-4" />
                                                    <span>Camera</span>
                                                </button>
                                                <button type="button" className="flex items-center space-x-1.5 hover:text-gray-900">
                                                    <img src={galleryIcon} alt="Gallery" className="w-4 h-4" />
                                                    <span>Gallery</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-gray-900">
                                                <img src={serviceNameIcon} alt="Name" className="w-4 h-4 mr-2.5 opacity-70" />
                                                <input
                                                    type="text"
                                                    placeholder="Service Name"
                                                    value={serviceName}
                                                    onChange={(e) => setServiceName(e.target.value)}
                                                    className="w-full text-xs font-semibold outline-none bg-transparent"
                                                />
                                            </div>

                                            <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-gray-900">
                                                <img src={categoryIcon} alt="Category" className="w-4 h-4 mr-2.5 opacity-70" />
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full text-xs font-semibold outline-none bg-transparent"
                                                >
                                                    <option value="" disabled hidden>Category</option>
                                                    <option value="Hair Cut">Hair Cut</option>
                                                    <option value="Skin Care">Skin Care</option>
                                                    <option value="Shaving">Shaving</option>
                                                </select>
                                            </div>

                                            <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-gray-900">
                                                <img src={priceIcon} alt="Price" className="w-4 h-4 mr-2.5 opacity-70" />
                                                <input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="w-full text-xs font-semibold outline-none bg-transparent"
                                                />
                                            </div>

                                            <div className="relative flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 focus-within:border-gray-900">
                                                <img src={durationIcon} alt="Duration" className="w-4 h-4 mr-2.5 opacity-70" />
                                                <input
                                                    type="number"
                                                    placeholder="Duration (minutes)"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="w-full text-xs font-semibold outline-none bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 font-bold">
                                                Save Service
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setServiceName(''); setCategory(''); setPrice(''); setDuration('');
                                                }}
                                                className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* ==================== VIEW SERVICES SECTION ==================== */}
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">All Services</h3>

                                    {/* Filters */}
                                    <div className="flex flex-wrap gap-3">
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={filters.name}
                                            onChange={(e) => handleFilterChange('name', e.target.value)}
                                            className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-900"
                                        />

                                        <select
                                            value={filters.category}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-900"
                                        >
                                            <option value="">All Categories</option>
                                            <option value="Hair Cut">Hair Cut</option>
                                            <option value="Skin Care">Skin Care</option>
                                            <option value="Shaving">Shaving</option>
                                        </select>

                                        <input
                                            type="number"
                                            placeholder="Min Price"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="border border-gray-300 rounded-xl px-4 py-2 text-sm w-28"
                                        />

                                        <button
                                            onClick={resetFilters}
                                            className="text-xs font-medium text-gray-500 hover:text-gray-900 underline"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>

                                {/* Services Grid */}
                                {loading ? (
                                    <div className="py-20 text-center">Loading services...</div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {services.length > 0 ? (
                                                services.map((service) => (
                                                    <div key={service.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:shadow">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                                                                {service.name?.[0]}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">{service.name}</h4>
                                                                <p className="text-sm text-gray-500">{service.category}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg">₹{service.price}</p>
                                                            <p className="text-xs text-gray-400">{service.duration} mins</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="col-span-2 text-center py-10 text-gray-400">No services found</p>
                                            )}
                                        </div>

                                        {/* Pagination */}
                                        {pagination.totalPages > 1 && (
                                            <div className="flex justify-center gap-2 mt-8">
                                                <button
                                                    onClick={() => fetchServices(pagination.page - 1)}
                                                    disabled={pagination.page === 0}
                                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>
                                                <span className="px-4 py-2">
                                                    Page {pagination.page + 1} of {pagination.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => fetchServices(pagination.page + 1)}
                                                    disabled={pagination.page >= pagination.totalPages - 1}
                                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Keep your existing Staff and Dashboard tabs unchanged */}
                    {/* ... */}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Service;