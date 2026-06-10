import React, { useState, useEffect } from 'react';
import Navbar from '../Layouts/Navbar';
import Sidebar from '../Layouts/SideBar';
import Footer from '../Layouts/Footer';
import ManageSideBar from '../Layouts/ManageSideBar';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

// Icons
import cameraIcon from '../../../assets/Owner/Manage/Services/camera_icon.svg';
import openCameraIcon from '../../../assets/Owner/Manage/Services/open_camera_icon.svg';
import galleryIcon from '../../../assets/Owner/Manage/Services/gallery_icon.svg';
import couponCodeIcon from '../../../assets/Owner/Manage/Products/coupon_code_icon.svg';
import percentageIcon from '../../../assets/Owner/Manage/Products/percentage_icon.svg';
import productDescriptionIcon from '../../../assets/Owner/Manage/Products/product_description_icon.svg';
import productDetailsIcon from '../../../assets/Owner/Manage/Products/product_details_icon.svg';
import productQuantityIcon from '../../../assets/Owner/Manage/Products/product_quantity_icon.svg';
import productTypeIcon from '../../../assets/Owner/Manage/Products/product_type_icon.svg';
import rateIcon from '../../../assets/Owner/Manage/Products/rate_icon.svg';
import editIcon from '../../../assets/Owner/Manage/Staff/edit_icon.svg'; // Add this icon import

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

// Suggestions
const PRODUCT_TYPES = ['Hair Care', 'Skin Cosmetics', 'Serums', 'Makeup', 'Tools', 'Accessories'];
const PRODUCT_CATEGORIES = [
    'Hair Care', 'Skin Care', 'Makeup', 'Fragrance', 'Tools & Accessories',
    'Serums & Treatments', 'Bath & Body', 'Men\'s Grooming', 'Natural & Organic',
    'Hair Styling', 'Skincare Devices'
];

const AddProducts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'

    // Edit Mode State
    const [editingProductId, setEditingProductId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Filter States (for View Products)
    const [filters, setFilters] = useState({
        name: '', category: '', productType: '', active: null,
        minPrice: '', maxPrice: '', inStock: null, keyword: ''
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [category, setCategory] = useState('');
    const [productType, setProductType] = useState('');
    const [stock, setStock] = useState('');
    const [restockLevel, setRestockLevel] = useState('');

    const [mainImageBase64, setMainImageBase64] = useState('');
    const [additionalImagesBase64, setAdditionalImagesBase64] = useState([]);
    const [existingMainImageUrl, setExistingMainImageUrl] = useState('');
    const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState([]);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    // Fetch Products
    const fetchProducts = async (page = 0) => {
        if (activeTab !== 'view') return;
        try {
            setLoadingProducts(true);
            let url = `/products/filter?page=${page}&size=10`;
            const params = new URLSearchParams();

            if (filters.name) params.append('name', filters.name);
            if (filters.category) params.append('category', filters.category);
            if (filters.productType) params.append('productType', filters.productType);
            if (filters.active !== null) params.append('active', filters.active);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.inStock !== null) params.append('inStock', filters.inStock);
            if (filters.keyword) params.append('keyword', filters.keyword);

            const queryString = params.toString();
            if (queryString) url += `&${queryString}`;

            const response = await axiosInstance.get(url);
            setProducts(response.data?.content || response.data || []);
            setTotalPages(response.data?.totalPages || 1);
            setCurrentPage(page);
        } catch (error) {
            toast.error('Failed to load products', toastStyle);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'view') {
            fetchProducts(0);
        }
    }, [activeTab, filters]);

    // Load Product for Editing
    const handleEdit = async (product) => {
        setLoadingEdit(true);
        try {
            const response = await axiosInstance.get(`/products/${product.id}`);
            const p = response.data;

            setEditingProductId(p.id);
            setIsEditMode(true);
            setActiveTab('add');

            setName(p.name || '');
            setDescription(p.description || '');
            setPrice(p.price?.toString() || '');
            setDiscountPrice(p.discountPrice?.toString() || '');
            setCategory(p.category || '');
            setProductType(p.productType || '');
            setStock(p.stock?.toString() || '');
            setRestockLevel(p.restockLevel?.toString() || '');

            setExistingMainImageUrl(p.imageUrl || '');
            setExistingAdditionalImageUrls(p.additionalImageUrls || []);

            setMainImageBase64('');
            setAdditionalImagesBase64([]);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to load product details', toastStyle);
        } finally {
            setLoadingEdit(false);
        }
    };

    // Image Handlers
    const handleMainImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setMainImageBase64(reader.result);
        reader.readAsDataURL(file);
    };

    const handleAdditionalImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        const promises = files.map(file => new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }));
        Promise.all(promises).then(base64s => {
            setAdditionalImagesBase64(prev => [...prev, ...base64s]);
        });
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImagesBase64(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price || !stock) {
            toast.error("Name, Price and Stock are required", toastStyle);
            return;
        }

        if (parseFloat(price) <= 0) {
            toast.error("Price must be greater than 0", toastStyle);
            return;
        }

        if (discountPrice && parseFloat(discountPrice) <= 0) {
            toast.error("Discount price must be greater than 0", toastStyle);
            return;
        }

        if (discountPrice && parseFloat(discountPrice) >= parseFloat(price)) {
            toast.error("Discount price must be less than original price", toastStyle);
            return;
        }

        if (parseInt(stock) <= 0) {
            toast.error("Stock must be greater than 0", toastStyle);
            return;
        }

        if (restockLevel && parseInt(restockLevel) <= 0) {
            toast.error("Restock level must be greater than 0", toastStyle);
            return;
        }

        setLoadingSubmit(true);

        const payload = {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            discountPrice: discountPrice ? parseFloat(discountPrice) : null,
            category: category.trim(),
            productType: productType.trim(),
            stock: parseInt(stock),
            restockLevel: restockLevel ? parseInt(restockLevel) : 10,
            active: true,
            imageBase64: mainImageBase64 || null,
            additionalImagesBase64: additionalImagesBase64.length > 0 ? additionalImagesBase64 : null,
        };

        try {
            if (isEditMode && editingProductId) {
                await axiosInstance.put(`/products/${editingProductId}`, payload);
                toast.success('Product updated successfully!', toastStyle);
            } else {
                await axiosInstance.post('/products', payload);
                toast.success('Product added successfully!', toastStyle);
            }

            resetForm();
            setActiveTab('view');
            setIsEditMode(false);
            setEditingProductId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product', toastStyle);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const resetForm = () => {
        setName(''); setDescription(''); setPrice(''); setDiscountPrice('');
        setCategory(''); setProductType(''); setStock(''); setRestockLevel('');
        setMainImageBase64(''); setAdditionalImagesBase64([]);
        setExistingMainImageUrl(''); setExistingAdditionalImageUrls([]);
        setEditingProductId(null);
        setIsEditMode(false);
    };

    const handleCancel = () => {
        resetForm();
        setActiveTab('view');
    };

    const toggleProductStatus = async (id, currentStatus) => {
        setTogglingId(id);
        try {
            await axiosInstance.patch(`/products/${id}/toggle`);
            toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully!`, toastStyle);
            fetchProducts(currentPage);
        } catch (error) {
            toast.error('Failed to update status', toastStyle);
        } finally {
            setTogglingId(null);
        }
    };

    const getProductImage = (product) => {
        if (product.imageUrl) return product.imageUrl;
        if (product.additionalImageUrls?.length > 0) return product.additionalImageUrls[0];
        return null;
    };

    const discountPercent = (price, discountPrice) => {
        if (!discountPrice || !price) return 0;
        return ((price - discountPrice) / price * 100).toFixed(1);
    };

    const resetFilters = () => {
        setFilters({ name: '', category: '', productType: '', active: null, minPrice: '', maxPrice: '', inStock: null, keyword: '' });
        setCurrentPage(0);
    };

    const handleSearch = () => fetchProducts(0);

    const calculateSavings = () => {
        const p = parseFloat(price);
        const d = parseFloat(discountPrice);
        if (!p || !d || d >= p) return 0;
        return (p - d).toFixed(2);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 w-full items-stretch">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <ManageSideBar activeTab="Add Products" onTabChange={() => { }} />

                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200 overflow-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-8 max-w-md border border-gray-100 shadow-sm">
                            <button
                                onClick={() => { setActiveTab('add'); setIsEditMode(false); setEditingProductId(null); }}
                                className={`flex-1 px-6 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'add' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {isEditMode ? 'Edit Product' : 'Add New Product'}
                            </button>
                            <button
                                onClick={() => setActiveTab('view')}
                                className={`flex-1 px-6 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'view' ? 'bg-[#FF0B01] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                View Products
                            </button>
                        </div>

                        {/* ==================== ADD / EDIT PRODUCT TAB ==================== */}
                        {activeTab === 'add' && (
                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#FF0B01] font-bold text-lg">
                                        🛍️
                                    </div>
                                    <div>
                                        <span className="text-[12px] font-extrabold uppercase tracking-widest text-red-600 block">
                                            {isEditMode ? 'Edit Mode' : 'Creation Mode'}
                                        </span>
                                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                                            {isEditMode ? 'Edit Product Details' : 'Add New Product'}
                                        </h2>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Main Image */}
                                    <div className="border border-dashed border-gray-200 bg-gray-50/30 rounded-2xl p-6">
                                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Main Product Image</p>
                                        <div className="flex gap-6 text-sm mb-4">
                                            <label className="flex items-center gap-2 hover:text-[#FF0B01] cursor-pointer font-semibold">
                                                <img src={openCameraIcon} alt="Camera" className="w-5 h-5 opacity-60" />
                                                <span>Camera</span>
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                            <label className="flex items-center gap-2 hover:text-[#FF0B01] cursor-pointer font-semibold">
                                                <img src={galleryIcon} alt="Gallery" className="w-5 h-5 opacity-60" />
                                                <span>Gallery</span>
                                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                                            </label>
                                        </div>

                                        {(mainImageBase64 || existingMainImageUrl) && (
                                            <img
                                                src={mainImageBase64 || existingMainImageUrl}
                                                alt="Preview"
                                                className="max-h-48 rounded-2xl shadow-sm"
                                            />
                                        )}
                                    </div>

                                    {/* Additional Images */}
                                    <div className="border border-dashed border-gray-200 bg-gray-50/30 rounded-2xl p-6">
                                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                                            Additional Images ({additionalImagesBase64.length + existingAdditionalImageUrls.length})
                                        </p>
                                        <label className="flex items-center gap-2 hover:text-red-600 cursor-pointer text-sm mb-4">
                                            <img src={galleryIcon} alt="Gallery" className="w-5 h-5" />
                                            <span>Add More Images</span>
                                            <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} className="hidden" />
                                        </label>

                                        <div className="grid grid-cols-4 gap-3">
                                            {/* Existing Images */}
                                            {existingAdditionalImageUrls.map((url, index) => (
                                                <div key={`existing-${index}`} className="relative">
                                                    <img src={url} alt={`Existing ${index}`} className="w-full h-24 object-cover rounded-lg" />
                                                </div>
                                            ))}
                                            {/* New Images */}
                                            {additionalImagesBase64.map((img, index) => (
                                                <div key={`new-${index}`} className="relative">
                                                    <img src={img} alt={`New ${index}`} className="w-full h-24 object-cover rounded-lg" />
                                                    <button type="button" onClick={() => removeAdditionalImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={productDetailsIcon} alt="Name" className="w-5 h-5 opacity-40" /></div>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name *" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" required />
                                        </div>

                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={couponCodeIcon} alt="Category" className="w-5 h-5 opacity-40" /></div>
                                            <input type="text" list="categoryList" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
                                            <datalist id="categoryList">
                                                {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={rateIcon} alt="Price" className="w-5 h-5 opacity-40" /></div>
                                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Original Price *" min="0.01" step="any" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" required />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={percentageIcon} alt="Discount" className="w-5 h-5 opacity-40" /></div>
                                            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Discount Price (₹)" min="0.01" step="any" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={productTypeIcon} alt="Type" className="w-5 h-5 opacity-40" /></div>
                                            <input type="text" list="productTypeList" value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="Product Type" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
                                            <datalist id="productTypeList">
                                                {PRODUCT_TYPES.map(type => <option key={type} value={type} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    {price && discountPrice && parseFloat(discountPrice) < parseFloat(price) && (
                                        <div className="bg-green-50/50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
                                            <div className="text-green-600 text-2xl">💰</div>
                                            <div>
                                                <p className="font-extrabold text-green-700">You will save ₹{calculateSavings()}</p>
                                                <p className="text-xs text-green-600/90 font-medium">Original: ₹{price} → Discounted: ₹{discountPrice}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={productQuantityIcon} alt="Stock" className="w-5 h-5 opacity-40" /></div>
                                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Current Stock *" min="1" step="1" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" required />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2"><img src={productQuantityIcon} alt="Restock" className="w-5 h-5 opacity-40" /></div>
                                            <input type="number" value={restockLevel} onChange={(e) => setRestockLevel(e.target.value)} placeholder="Restock Level" min="1" step="1" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-4 top-5"><img src={productDescriptionIcon} alt="Description" className="w-5 h-5 opacity-40" /></div>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product Description" rows="4" className="w-full pl-12 pr-4 py-4 border border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 resize-none" />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button type="submit" disabled={loadingSubmit} className="flex-1 bg-[#FF0B01] hover:bg-[#d90900] transition text-white py-4 rounded-2xl font-bold shadow-md hover:shadow-lg text-sm tracking-wider uppercase active:scale-[0.985]">
                                            {loadingSubmit ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Product' : 'Add Product'}
                                        </button>
                                        <button type="button" onClick={handleCancel} className="flex-1 border border-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-50 text-sm tracking-wider uppercase transition">
                                            Discard
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ==================== VIEW PRODUCTS TAB ==================== */}
                        {activeTab === 'view' && (
                            <>
                                {/* Filters Section */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold">Search & Filters</h3>
                                        <div className="flex gap-3">
                                            <button onClick={resetFilters} className="text-red-600 text-sm font-medium hover:underline">Reset Filters</button>
                                            <button onClick={handleSearch} className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">Search</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Filter inputs remain the same */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Keyword / Search</label>
                                            <input type="text" value={filters.keyword} onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))} placeholder="Search products..." className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Product Name</label>
                                            <input type="text" value={filters.name} onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                                            <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500">
                                                <option value="">All Categories</option>
                                                {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Product Type</label>
                                            <select value={filters.productType} onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500">
                                                <option value="">All Types</option>
                                                {PRODUCT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Min Price</label>
                                            <input type="number" value={filters.minPrice} onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))} placeholder="Min ₹" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Max Price</label>
                                            <input type="number" value={filters.maxPrice} onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))} placeholder="Max ₹" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                                            <select value={filters.active === null ? '' : filters.active.toString()} onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value === '' ? null : e.target.value === 'true' }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500">
                                                <option value="">All Status</option>
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-1 block">Stock</label>
                                            <select value={filters.inStock === null ? '' : filters.inStock.toString()} onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.value === '' ? null : e.target.value === 'true' }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500">
                                                <option value="">All Stock</option>
                                                <option value="true">In Stock</option>
                                                <option value="false">Out of Stock</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Products List */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Products ({products.length})</h3>
                                </div>

                                {loadingProducts ? (
                                    <div className="text-center py-12">Loading products...</div>
                                ) : products.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">No products found</div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {products.map(product => {
                                                const imageUrl = getProductImage(product);
                                                const discount = discountPercent(product.price, product.discountPrice);
                                                return (
                                                    <div key={product.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                                        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <div className="text-center text-gray-400 text-xs px-4">No Image</div>
                                                            )}
                                                            {discount > 0 && (
                                                                <div className="absolute top-3 right-3 bg-[#FF0B01] text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                                                                    {discount}% OFF
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <h5 className="text-sm font-semibold line-clamp-2 leading-tight mb-2 h-10">{product.name}</h5>
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <span className="font-bold text-red-600">₹{product.price}</span>
                                                                    {product.discountPrice && <span className="text-xs line-through text-gray-400 ml-2">₹{product.discountPrice}</span>}
                                                                </div>
                                                                <span className="text-xs text-gray-500">{product.stock} left</span>
                                                            </div>
                                                            {discount > 0 && <p className="text-[10px] text-green-600 font-extrabold tracking-wide uppercase mt-1">Save ₹{(product.price - product.discountPrice).toFixed(2)}</p>}
                                                        </div>
                                                        <div className="px-4 pb-4 flex gap-2 text-xs font-bold">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                disabled={loadingEdit}
                                                                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-gray-50 text-gray-700 hover:text-[#FF0B01] hover:bg-red-50 border border-gray-100 rounded-xl transition"
                                                            >
                                                                <img src={editIcon} alt="edit" className="w-3.5 h-3.5" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => toggleProductStatus(product.id, product.active)}
                                                                disabled={togglingId === product.id}
                                                                className={`flex-1 py-2.5 rounded-xl transition-colors ${product.active ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100' : 'bg-red-50 text-[#FF0B01] hover:bg-red-100 border border-red-100'}`}
                                                            >
                                                                {togglingId === product.id ? 'Updating...' : product.active ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex justify-center gap-4 mt-10">
                                            <button onClick={() => fetchProducts(currentPage - 1)} disabled={currentPage === 0} className="px-6 py-2 border rounded-xl disabled:opacity-50">Previous</button>
                                            <span className="px-6 py-2 font-medium">Page {currentPage + 1} of {totalPages}</span>
                                            <button onClick={() => fetchProducts(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-6 py-2 border rounded-xl disabled:opacity-50">Next</button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default AddProducts;